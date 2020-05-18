import React, { Component, Fragment } from "react"
import { connect } from "react-redux"
import cellEditFactory from 'react-bootstrap-table2-editor'
import Select from 'react-select'

import TablePatient from '../CommonComponents/RessourcesDisplay/TablePatients'
import TableStudy from "../CommonComponents/RessourcesDisplay/TableStudy"
import MonitorJob from '../../tools/MonitorJob'
import apis from "../../services/apis"

import { addToAnonymizedList, emptyAnonList, emptyAnonymizedList, removePatientFromAnonList, removeStudyFromAnonList, removeStudyFromAnonymizedList, saveNewValues, saveProfile, autoFill } from '../../actions/AnonList'
import {studyArrayToPatientArray} from '../../tools/processResponse'
import { addToDeleteList } from '../../actions/DeleteList'


class AnonPanel extends Component {

    state = { 
        currentPatient: '', 
        prefix: '', 
        listToAnonymize: [],
        progress: {}
    }


    constructor(props) {
        super(props)
        this.removePatient = this.removePatient.bind(this)
        this.removeStudy = this.removeStudy.bind(this)
        this.removeStudyAnonymized = this.removeStudyAnonymized.bind(this)
        this.emptyList = this.emptyList.bind(this)
        this.emptyAnonymizedList = this.emptyAnonymizedList.bind(this)
        this.saveNewValues = this.saveNewValues.bind(this)
        this.anonymize = this.anonymize.bind(this)
        this.changeProfile = this.changeProfile.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.autoFill = this.autoFill.bind(this)
        this.deleteList = this.deleteList.bind(this)
    }

    updateProgress(progress, i){
        i++
        this.setState({
            progress: {
                ...this.state.progress,
                [i] : {
                    nb: i, 
                    progress: progress, 
                    status: progress < 100 ? 'item btn btn-danger' : 'item btn btn-success'
                }
            }
        })
        this.displayRows()
    }

    displayRows(){
        let rows = []
        for(let i in this.state.progress){
            rows.push(<button disabled={true} type='button' key={this.state.progress[i].nb} className={this.state.progress[i].status} >job n°{this.state.progress[i].nb} : {this.state.progress[i].progress}%{'\n'}</button>)
        }
        this.setState({
            rows: rows
        })
    }


    changeProfile(event){
        this.props.saveProfile(event.value)
    }

    removePatient(patientID){
        this.props.removePatientFromAnonList(patientID)
    }

    removeStudy(studyID){
        this.props.removeStudyFromAnonList(studyID)
    }

    removeStudyAnonymized(studyID){
        this.props.removeStudyFromAnonymizedList(studyID)
    }

    emptyList(){
        this.props.emptyAnonList()
    }

    emptyAnonymizedList(){
        this.props.emptyAnonymizedList()
    }

    rowEvents = {
        onClick: (e, row, rowIndex) => {
            this.setState({currentPatient: row.PatientOrthancID})
        }
    }

    rowStyle = (row, rowIndex) => {
        const style = {};
        if (row.PatientOrthancID === this.state.currentPatient){
            style.backgroundColor = 'rgba(255,153,51)'
        }
        style.borderTop = 'none';

        return style;
    }

    saveNewValues(ID, column, newValue){
        this.props.saveNewValues(ID, column, newValue)
    }

    getPatients(){
        let patients = []
        patients = studyArrayToPatientArray(this.props.anonList)
        for (let i in patients){
            patients[i] = {
                ...patients[i], 
                newPatientName: patients[i].newPatientName ? patients[i].newPatientName : '' , 
                newPatientID: patients[i].newPatientID ? patients[i].newPatientID : ''
            }
        }
        return patients
    }

    getStudy(){
        let studies = []
        this.props.anonList.forEach(study => {
            if (study.ParentPatient === this.state.currentPatient){
                studies.push({
                    StudyOrthancID: study.ID, 
                    ...study.MainDicomTags, 
                    newStudyDescription: study.MainDicomTags.newStudyDescription ? study.MainDicomTags.newStudyDescription : '', 
                    newAccessionNumber: study.MainDicomTags.newAccessionNumber ? study.MainDicomTags.newAccessionNumber : ''
                })
            }
        })
        return studies
    }

    getStudiesAnonymized(){
        let studies = []
        this.props.anonymizedList.forEach(study => {
            studies.push({
                StudyOrthancID: study.ID, 
                ...study.MainDicomTags, 
                ...study.PatientMainDicomTags,
                newStudyDescription: study.MainDicomTags.newStudyDescription ? study.MainDicomTags.newStudyDescription : '', 
                newAccessionNumber: study.MainDicomTags.newAccessionNumber ? study.MainDicomTags.newAccessionNumber : ''
            })
        })
        return studies
    }


    async anonymize(){
        this.setState({
            monitors: []
        })
        let listToAnonymize = []
        this.props.anonList.forEach(element => {
            let payload = {
                OrthancStudyID: element.ID, 
                profile: this.props.profile
            }
            if ((element.PatientMainDicomTags.newPatientName && element.PatientMainDicomTags.newPatientName !== '' )||
                (element.PatientMainDicomTags.newPatientID && element.PatientMainDicomTags.newPatientID !== '') ||
                (element.MainDicomTags.newStudyDescription && element.MainDicomTags.newStudyDescription !== '') ||
                (element.MainDicomTags.newAccessionNumber && element.MainDicomTags.newAccessionNumber !== '')){
                
                    payload = {
                        ...payload, 
                        Name: element.PatientMainDicomTags.newPatientName && element.PatientMainDicomTags.newPatientName !== '' ? element.PatientMainDicomTags.newPatientName : element.PatientMainDicomTags.PatientName, 
                        ID: element.PatientMainDicomTags.newPatientID && element.PatientMainDicomTags.newPatientID !== '' ? element.PatientMainDicomTags.newPatientID : element.PatientMainDicomTags.PatientID, 
                        StudyDescription: element.MainDicomTags.newStudyDescription && element.MainDicomTags.newStudyDescription !== '' ? element.MainDicomTags.newStudyDescription : element.MainDicomTags.StudyDescription,
                        AccessionNumber: element.MainDicomTags.newAccessionNumber && element.MainDicomTags.newAccessionNumber !== '' ? element.MainDicomTags.newAccessionNumber : element.MainDicomTags.AccessionNumber
                    }
            }
            if (Object.keys(payload).length > 2)
                listToAnonymize.push(payload)
        })
        this.job = []
        for (let i in listToAnonymize){
            let study = listToAnonymize[i]
            let id = await apis.anon.anonymize(study.OrthancStudyID, study.profile, study.AccessionNumber, study.Name, study.ID, study.StudyDescription)

            let jobMonitoring = new MonitorJob(id)
            let self = this
            
            jobMonitoring.onUpdate(function (progress) {
                self.updateProgress(progress, i)
            })
    
            jobMonitoring.onFinish(async function  (state) {
                if (state === MonitorJob.Success){
                    await self.addNewStudy(jobMonitoring.jobID)
                } else if (state === MonitorJob.Failure){
                    console.log("Failure ", i)
                }
                
            })

            jobMonitoring.startMonitoringJob()

        }
    }

    async addNewStudy(jobID){
        let content = await this.getContentJob(jobID)
        let studyID = content.ID
        let studyDetail = await apis.content.getStudiesDetails(studyID)
        this.props.addToAnonymizedList([studyDetail])
    }

    async getContentJob(jobID){
        let infos = await apis.jobs.getJobInfos(jobID)
        return infos.Content
    }

    
    componentWillUnmount() {
        if (this.job){
            this.job.forEach(job => {
                if (job !== undefined) job.cancelJob()
            })
        }
    }

    getProfileSelected(){
        let index = -1
        this.option.forEach(element => {
            if (element.value === this.props.profile){
                index = this.option.indexOf(element)
            }
        })
        return this.option[index]
    }

    handleChange(event){
        this.setState({prefix: event.target.value})
    }

    autoFill(){
        this.props.autoFill(this.state.prefix)
    }

    exportList(){
        alert('not implemented yet')
    }

    deleteList(){
        this.props.addToDeleteList(this.props.anonymizedList)
    }

    exportCSV(){
        alert('not implemented yet')
    }

    option = [
            {value: 'Default', label: 'Default'}, 
            {value: 'Full', label: 'Full'}
        ]

    render() {
        return (
            <Fragment>
                <div className='jumbotron'>
                    <h2 className='card-title mb-3'>Anonymize</h2>
                    
                    <div className="row">
                        <div className="col-sm mb-3">
                            <TablePatient 
                                data={this.getPatients()} 
                                rowEvents={this.rowEvents} 
                                hiddenActionBouton={true} 
                                hiddenRemoveRow={false} 
                                textNameColumn={'Original Name'} 
                                textIDColumn={'Original ID'}  
                                hiddenNewName={false} 
                                hiddenNewID={false} 
                                cellEdit={ cellEditFactory({ 
                                    blurToSave: true,
                                    autoSelectText: true,
                                    mode: 'click', 
                                    afterSaveCell: (oldValue, newValue, row, column) => {
                                        this.saveNewValues(row.PatientOrthancID, column.dataField, newValue)
                                    }
                                }) }
                                rowStyle={this.rowStyle} 
                                onDelete={this.removePatient} />
                        </div>
                        <div className="col-sm">
                            <TableStudy 
                                data={this.getStudy()}
                                hiddenActionBouton={true} 
                                hiddenRemoveRow={false} 
                                onDelete={this.removeStudy}
                                editable={true}
                                cellEdit={ cellEditFactory({ 
                                    blurToSave: true,
                                    autoSelectText: true,
                                    mode: 'click',
                                    afterSaveCell: (oldValue, newValue, row, column) => {
                                        this.saveNewValues(row.StudyOrthancID, column.dataField, newValue)
                                    }
                                }) }
                                pagination={true}
                            />
                        </div>
                    </div>
                    <div className="row mb-3">
                        <div className='col-sm'>
                            <input type='text' name='prefix' id='prefix' className='form-control' placeholder='prefix' onChange={this.handleChange} />
                        </div>
                        <div className='col-sm'>
                            <button type='button' className='btn btn-warning mr-3' onClick={this.autoFill}>AutoFill</button>
                            <button type='button' className="btn btn-warning" onClick={this.emptyList}>Empty List</button>
                        
                        </div>
                        <div className='col-sm'>
                            </div>
                    </div>
                    <div className="row">
                        <div className="col-auto" >
                            <label htmlFor='profile'>Anon Profile : </label>
                        </div>
                        <div className="col-2" >
                            <Select name='profile' single options={this.option} onChange={this.changeProfile} placeholder='Profile' value={this.getProfileSelected()} />  
                        </div>
                        <div className="col-sm">
                            <button className='btn btn-primary' type='button' onClick={this.anonymize} >Anonymize</button> 
                        </div>
                    </div>
                    <pre>
                        {this.state.rows}
                    </pre>
                </div>
                <div className='jumbotron' hidden={this.props.anonymizedList && this.props.anonymizedList.length === 0}>
                    <h2 className='card-title mb-3'>Anonymized studies</h2>
                    <div className='row'>
                        <div className='col-sm'>
                            <button type='button' className="btn btn-warning float-right" onClick={this.emptyAnonymizedList}>Empty List</button>
                            <TableStudy 
                                data={this.getStudiesAnonymized()}
                                hiddenActionBouton={true} 
                                hiddenRemoveRow={false} 
                                onDelete={this.removeStudyAnonymized}
                                hiddenName={false}
                                hiddenID={false}
                                pagination={true} />
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col-sm'>
                            <button type='button' className='btn btn-info' onClick={this.exportList} >to Export List</button>
                        </div>
                        <div className='col-sm'>
                            <button type='button' className='btn btn-danger' onClick={this.deleteList} >to Delete List</button>
                        </div>
                        <div className='col-sm'>
                            <button type='button' className='btn btn-info' onClick={this.exportCSV} >to CSV</button>
                        </div>
                    </div>
                </div>
            </Fragment>
        );
    }
}

const mapStateToProps = state => {
    return { 
        anonList: state.AnonList.anonList, 
        profile: state.AnonList.profile, 
        anonymizedList: state.AnonList.anonymizedList
    }
}
const mapDispatchToProps = {
    addToAnonymizedList,
    emptyAnonList, 
    emptyAnonymizedList,
    removePatientFromAnonList, 
    removeStudyFromAnonList,
    removeStudyFromAnonymizedList, 
    saveNewValues, 
    saveProfile, 
    autoFill, 
    addToDeleteList
}

export default connect(mapStateToProps, mapDispatchToProps)(AnonPanel)
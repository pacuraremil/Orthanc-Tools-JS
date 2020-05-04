import React, { Component } from 'react'
import { connect } from 'react-redux'
import Popover from 'react-bootstrap/Popover'
import Overlay from 'react-bootstrap/Overlay'

import TablePatientsWithNestedStudies from '../CommonComponents/RessourcesDisplay/TablePatientsWithNestedStudies'

import { removePatientFromDeleteList, removeStudyFromDeleteList, emptyDeleteList } from '../../actions/DeleteList'
import {studyArrayToPatientArray} from '../../tools/processResponse'

//Ce composant sera a connecter au redux pour connaitre la longueur de la liste de delete 
class DeleteTool extends Component {

    constructor(props){
        super(props)
        this.handleClickEmpty = this.handleClickEmpty.bind(this)
        this.handleClickDelete = this.handleClickDelete.bind(this)
        this.onDeletePatient = this.onDeletePatient.bind(this)
        this.onDeleteStudy = this.onDeleteStudy.bind(this)
    }

    //SK Ici laisser l'action au front et gérer un retour visuel, je m'occuperai du back
    async handleClickDelete(){
        //call API DELETE
        console.log(this.props.deleteList)
        for (let patient in this.props.deleteList){
            let studyID = Object.keys(this.props.deleteList[patient].studies)
            studyID.forEach(id => {
                console.log("will delete : ", id)
                //await apis.content.deleteStudies(id) //take a lot of time, need to pass by the back
                //this.props.removeStudyFromDeleteList(this.props.deleteList[patient].studies[id])
            })
                
        }
    }

    handleClickEmpty(){
        this.props.emptyDeleteList()
    }

    //SK : Ici on avait deja defini des listener onDelete pour le dropdown, je les ai reutillise pour
    //le boutton delete de la row
    onDeletePatient(patientOrthancID){
        this.props.removePatientFromDeleteList(patientOrthancID)
    }

    onDeleteStudy(studyOrthancID){
        this.props.removeStudyFromDeleteList(studyOrthancID)
    }
    
    render(){
        console.log(this.props)
        return (
            //La position ne suit pas y a une histoire de Ref https://react-bootstrap.github.io/components/overlays/
            //https://github.com/react-bootstrap/react-bootstrap/issues/2208
            <Overlay show={true} placement="right" target={this.props.target}>
                <Popover id="popover-basic" style={ { maxWidth : '900px'}} >
                    <Popover.Title as="h3">Delete List</Popover.Title>
                    <Popover.Content>
                        <div className="float-right mb-3">
                            <button type="button" className="btn btn-warning" onClick={this.handleClickEmpty} >Empty List</button>
                        </div>
                        <TablePatientsWithNestedStudies patients={studyArrayToPatientArray(this.props.deleteList)} hiddenActionBouton={true} hiddenRemoveRow={false} onDeletePatient={this.onDeletePatient} onDeleteStudy={this.onDeleteStudy} />
                        <div className="text-center">
                            <button type="button" className="btn btn-danger" onClick={this.handleClickDelete} >Delete List</button>
                        </div>
                    </Popover.Content>
                </Popover>
            </Overlay>
        )
    }
}

const mapStateToProps = state => {
    return {
        deleteList: state.DeleteList.deleteList
    }
}

const mapDispatchToProps = {
    removePatientFromDeleteList, 
    removeStudyFromDeleteList,
    emptyDeleteList
}

export default connect(mapStateToProps, mapDispatchToProps)(DeleteTool)
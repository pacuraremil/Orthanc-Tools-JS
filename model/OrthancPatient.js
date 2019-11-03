let OrthancStudy=require('./OrthancStudy');

/**
 * Stores a patient level Orthanc ressource
 */
class OrthancPatient{

    constructor(patientOrthancID, orthancInstance){
        this.patientOrthancID=patientOrthancID;
        this.orthancInstance=orthancInstance;
    }

     /**
     * Fill data from /patient API
     * @param {function()} returnCallBack 
     */
    fillDetails(){
        let orthancPatientInstance=this;
        return this.orthancInstance.getOrthancDetails('patients', this.patientOrthancID).then(function(answer){

            for(let element in answer){
                orthancPatientInstance[element]=answer[element];
            };
            orthancPatientInstance.getStudies();
            return orthancPatientInstance;
        }).catch((error)=>{console.log('Error getting patient details '+ error)});

        
    }

    fillStudiesDetails(){
        let getStudiesPromises=[];
        this.studiesObjects.forEach(studyObject=>{
            getStudiesPromises.push(studyObject.fillDetails());
        });
        return Promise.all(getStudiesPromises);
    }

    async fillAllChildsDetails(){

        await this.fillDetails();
        await this.fillStudiesDetails();
    
        let allSeriesPromises=[];
        this.studiesObjects.forEach(study => {
            allSeriesPromises.push(study.fillSeriesDetails());
        });
        
        await Promise.all(allSeriesPromises);

    };

    /**
     * Store references of child Study object
     */
    getStudies(){
        let orthancPatientInstance=this;
        let studiesObjects=[];
        this.Studies.forEach(element => {
            studiesObjects.push(new OrthancStudy(element, orthancPatientInstance.orthancInstance)); 
        });
        this.studiesObjects=studiesObjects;
    }


    
}
module.exports = OrthancPatient;
import React, { Component } from 'react'
import BootstrapTable from 'react-bootstrap-table-next'
import ActionBouton from './ActionBouton'


class TableSeries extends Component{
    
    static defaultProps = {
        onDelete : function(id){
            console.log('Deleted Series ID' + id)
        }, 
        hiddenActionBouton: false, 
        hiddenRemoveRow: true
    }
    columns = [{
        dataField: 'SeriesOrthancID', 
        hidden: true,
    }, {
        dataField: 'SeriesDescription', 
        text: 'Series Description',
        sort: true
    }, {
        dataField: 'Modality', 
        text: 'Modality',
        sort: true
    },{
        dataField: 'Instances', 
        text: 'Instances',
        sort: true
    }, {
        dataField: 'SeriesNumber',
        text: 'Series Number', 
        sort: true
    }, {
        dataField: 'Action', 
        text: 'Action',
        hidden: this.props.hiddenActionBouton,
        formatter: ((value, row, index) => <ActionBouton level='series' orthancID={row.SeriesOrthancID} onDelete={this.props.onDelete} />)
    }, {
        dataField: 'Remove', 
        text: 'Remove',
        hidden: this.props.hiddenRemoveRow,
        formatter: (cell, row, index) => {
            return <button type="button" className="btn btn-danger" onClick={(e) => {e.stopPropagation(); this.props.onDelete(row.SeriesOrthancID)}}>Remove</button>
        }
    
    }]


    render(){
        return (
            <BootstrapTable 
                keyField="SeriesOrthancID" 
                striped={true} 
                data={this.props.series} 
                columns={this.columns}
                {...this.props}
                pagination={undefined}
            />
        )
    }
}

export default TableSeries
import React, { Component } from 'react';


class ActivityPlot extends Component {
  plotName = 'Actividad';

  state = {type: 'box'};

  getData() {
    let data = this.props.data;
    let plotData = [];

    for (var group in data){
      let groupData = data[group];

      for (var dis in groupData) {
        let color = '#' + Math.floor(Math.random() * 16777215).toString(16);
        let name = dis + ' ' + this.props.groupInfo[group].name;

        let trace = {
          x: [],
          y: [],
          name: name,
          type: this.state.type,
          marker: {color: color},
        }

        plotData.push(trace);
      }
    }

    return plotData;
        //if (this.state.type === 'bar') {
          //trace['error_y'] = {
            //type: 'data',
            //array: err,
            //visible: true,
  }


  render() {
    return <div> Activity </div>;
  }
}


export default ActivityPlot;

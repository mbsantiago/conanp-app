import React, { Component } from 'react';
import Plot from 'react-plotly.js';


function stringify(obj) {
  let string = '';
  for (let key in obj) {
    string += ` ${key}:${obj[key]}`;
  }
  return string;
}

function getDate(year, month, day, hour) {
  year = year ? year : 0;
  month = month ? parseInt(month) : 1;
  day = day ? day : 0;
  hour = hour ? hour : 0;
  return new Date(year, month - 1, day, hour);
}


class ActivityBarPlot extends Component {
  static plotName = 'Actividad (barras)';

  state = {type: 'box'};

  getData() {
    let data = this.props.data;
    let plotData = [];
    let dateFormat = null;

    for (var group in data){
      let groupData = data[group];
      let traces = {};
      let dataCollections = {};

      for (var dis in groupData) {
        let { year, month, day, hour, ...rest } = groupData[dis].keys;

        let dateStr = `${year}${month}${day}${hour}`;

        if (!(dateFormat)) {
          let array = [];
          if (year) array.push('%Y');
          if (month) array.push('%m');
          if (day) array.push('%d');
          dateFormat = array.join('-');
          if (hour) dateFormat += ' %H:00';
        }

        let traceKey = Object.keys(rest).length === 0 ? '' : stringify(rest);
        if (!(traceKey in traces)) {
          let name = traceKey + ' ' + this.props.groupInfo[group].name;
          let color = '#' + Math.floor(Math.random() * 16777215).toString(16);

          traces[traceKey] = {
            x: [],
            y: [],
            name: name,
            type: 'bar',
            marker: {color: color},
            hoverinfo: 'x+y+name',
            hoverlabel: {
              namelength: -1,
            }
          };

          dataCollections[traceKey] = {};
        }

        if (!(dateStr in dataCollections[traceKey])) {
          dataCollections[traceKey][dateStr] = {
            values: [],
            date: null,
          };
        }

        let date = getDate(year, month, day, hour);

        for (var agg in groupData[dis].values) {
          let sum = groupData[dis].values[agg].values.reduce(
            (agg, curr) => agg + curr, 0);
          dataCollections[traceKey][dateStr].date = date;
          dataCollections[traceKey][dateStr].values.push(sum);
        }
      }

      for (let traceKey in traces) {
        for (let dateStr in dataCollections[traceKey]) {
          let collection = dataCollections[traceKey][dateStr];
          traces[traceKey].x.push(collection.date);
          traces[traceKey].y.push(collection.values.reduce((agg, curr) => agg + curr, 0) / collection.values.length);
        }

        plotData.push(traces[traceKey]);
      }
    }

    return [plotData, dateFormat];
  }

  renderGraph() {
    let [data, tickformat] = this.getData();

    const layout = {
      autosize: true,
      barmode: 'group',
      xaxis: {
        tickformat: tickformat,
      },
    };

    return (
      <Plot
        className='App-plot'
        data={data}
        layout={layout}
        useResizeHandler={true}
        style={{width: '100%', height: '100%'}}
      />
    );
  }

  render() {
    return (
      <div style={{width: '100%', heigh: '100%'}}>
        {this.renderGraph()}
      </div>
    );
  }
}


export default ActivityBarPlot;

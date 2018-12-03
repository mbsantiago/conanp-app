import React, { Component } from 'react';
import './App.css';

import AppMap from './Map';
import SelectionComponent from './Selection';
import FilterComponent from './Filter';
import AggregationComponent from './Aggregation';
import DisaggregationComponent from './Disaggregation';
import GraphComponent from './Graph';
import CssBaseline from '@material-ui/core/CssBaseline';

import { load, uuidv4 } from './utils';
import {
  POINTS_URL,
  POINTS_COL_URL,
  DATA_URL,
  DATA_COL_URL,
  DATA_MAPPING_URL,
  DEFAULT_VIEWPORT } from './config';


class App extends Component {

  constructor(props) {

    super(props);

    let [newGroup, newGroupInfo] = this.makeNewGroupInfo();
    this.loadingPoints = new Set();
    this.state = {
      groups: newGroupInfo,
      selectedGroup: newGroup,
      points: null,
      loading: false,
      pointColumnRanges: null,
      dataColumnRanges: null,
      dataMapping: null,
      dataFilters: {},
      selectedView: '',
    };

    // Annotation data
    this.data = {};

  }

  checkLoading() {
    if (this.loadingPoints.size === 0) {
      this.setState({loading: false});
    }
  }

  addPoint(id) {
    let manualSelection = this.state.groups[this.state.selectedGroup].manualSelection;
    if (!manualSelection) return null;

    this.setState(state => {
      let selection = state.groups[state.selectedGroup].selection;
      if (!(selection.has(id))) {
        selection.add(id);
      }
      return state
    });

    if (!(id in this.data)) {
      this.setState({loading: true});
      this.loadingPoints.add(id);

      load(
        DATA_URL + '?id=' + id,
        (data) => {
          this.data[id] = data;
          this.loadingPoints.delete(id);
        })
        .then(() => this.checkLoading());
    }
  }

  componentDidMount() {
    load(POINTS_URL, (data) => this.setState({points: data}));
    load(POINTS_COL_URL, (data) => this.setState({pointColumnRanges: data}));
    load(DATA_COL_URL, (data) => this.setState({dataColumnRanges: data}));
    load(DATA_MAPPING_URL, (data) => this.setState({dataMapping: data}));
  }

  changeGroupName(group, name) {
    this.setState(state => {
      state.groups[group].name = name;
      return state;
    })
  }

  deleteGroup(group) {
    this.setState(state => {
      if (Object.keys(state.groups).length === 1) return state;

      let groups = state.groups;
      delete groups[group];


      if (group === state.selectedGroup) {
        state.selectedGroup = Object.keys(state.groups)[0];
      }
      return state;
    })
  }

  filterPoints(filters) {
    let filter, index;
    if (!this.state.points) return null;

    let selectedPoints = this.state.points.filter(point => {
      let selected = true;

      for (let filterName in filters) {
        filter = filters[filterName];

        // Handle the categorical case
        if (filter.type === 'categorical') {

          // When the filter is exclusive
          if (filter.exclusion) {
            if (filter.filters.indexOf(point[filter.column]) >= 0) {
              selected = false;
              break;
            }

          // And when its inclusive
          } else {
            if (filter.filters.indexOf(point[filter.column]) < 0) {
              selected = false;
              break;
            }
          }

        // Now handle the range case
        } else {
          let subfilter;

          // When the filter is exclusive
          if (filter.exclusion) {
            for (index = 0; index < filter.filters.length; index++) {
              subfilter = filter.filters[index];

              if ((subfilter.min <= point[filter.column]) && (point[filter.column] <= subfilter.max)) {
                selected = false;
                break;
              }
            }

          // And when its inclusive
          } else {
            let subselected = false;
            for (index = 0; index < filter.filters.length; index++) {
              subfilter = filter.filters[index];

              if ((subfilter.min <= point[filter.column]) && (point[filter.column] <= subfilter.max)) {
                subselected = true;
                break;
              }
            }

            selected = subselected;
          }

          if (!selected) break;
        }
      }

      return selected
    });

    return selectedPoints;
  }

  filterData() {
    if (!this.state.dataMapping) return null;
    if (this.state.loading) return null;

    console.log(this.data);
  }

  changeFilters(group, filters) {
    let selection = this.filterPoints(filters).map(point => point['id_congl']);

    this.setState(state => {
      state.groups[group].filters = filters;
      state.groups[group].selection = new Set(selection);

      return state;
    });

    selection.forEach(id => {
      if (!(id in this.data)) {
        this.setState({loading: true});
        this.loadingPoints.add(id);

        load(
          DATA_URL + '?id=' + id,
          (data) => {
            this.data[id] = data;
            this.loadingPoints.delete(id);
          })
          .then(() => this.checkLoading());
      }
    });
  }

  changeDataFilters(filters) {
    this.setState({dataFilters: filters});
  }

  deleteAllGroups() {
    this.setState(state => {
      let [newGroup, newGroupInfo] = this.makeNewGroupInfo();

      state.groups = newGroupInfo;
      state.selectedGroup = newGroup;
      return state;
    });
  }

  makeNewGroupInfo() {
    let newGroup = uuidv4();
    let newGroupInfo = {};

    newGroupInfo[newGroup] = {
      name: 'G-' + newGroup.slice(0, 4),
      selection: new Set(),
      manualSelection: true,
      filters: {},
    };

    return [newGroup, newGroupInfo];
  }

  newGroup() {
    this.setState(state => {
      let [, newGroupInfo] = this.makeNewGroupInfo();
      state.groups = Object.assign(state.groups, newGroupInfo)
      return state;
    });
  }

  changeManualSelection() {
    this.setState(state => {
      let groupInfo = state.groups[state.selectedGroup];
      let newManualSelection = !groupInfo.manualSelection;

      if (!newManualSelection) {
        groupInfo.selection = new Set();
      }

      groupInfo.manualSelection = newManualSelection;
      return state;
    });
  }

  render() {

    let selectionConfig = {
      contentWidth: '30vw',
      contentTop: '10vh',
      contentLeft: '5vw',
      alignment: 'right',
      top: '40vh',
      name: 'Seleccionar',
    };

    let filterConfig = {
      contentWidth: '30vw',
      contentTop: '10vh',
      contentLeft: '5vw',
      alignment: 'right',
      top: '45vh',
      name: 'Filtrar',
    };

    let aggregationConfig = {
      contentWidth: '30vw',
      contentTop: '10vh',
      contentLeft: '5vw',
      alignment: 'right',
      top: '50vh',
      name: 'Agregar',
    };

    let disaggregationConfig = {
      contentWidth: '30vw',
      contentTop: '10vh',
      contentLeft: '5vw',
      alignment: 'right',
      top: '55vh',
      name: 'Desagregar',
    };


    let graphConfig = {
      contentWidth: '30vw',
      contentTop: '10vh',
      contentLeft: '5vw',
      alignment: 'right',
      top: '60vh',
      name: 'Graficar',
    };

    return (
      <div className="App">
        <CssBaseline/>
        <AppMap
          viewport={DEFAULT_VIEWPORT}
          points={this.state.points}
          selectedPoints={this.state.groups[this.state.selectedGroup].selection}
          addPoint={(id) => this.addPoint(id)}
          open={this.state.selectedView === 'Map'}
          handleToggle={() => this.setState(state => ({selectedView: state.selectedView === 'Map'? '': 'Map'}))}
          handleClose={() => this.setState({selectedView: ''})}
        />
        <SelectionComponent
          config={selectionConfig}
          groups={this.state.groups}
          selectedGroup={this.state.selectedGroup}
          selectGroup={(group) => this.setState({selectedGroup: group, manualSelection: true})}
          changeGroupName={(group, name) => this.changeGroupName(group, name)}
          newGroup={() => this.newGroup()}
          deleteGroup={(group) => this.deleteGroup(group)}
          deleteAllGroups={() => this.deleteAllGroups()}
          changeManualSelection={() => this.changeManualSelection()}
          pointColumnRanges={this.state.pointColumnRanges}
          changeFilters={(group, filters) => this.changeFilters(group, filters)}
          open={this.state.selectedView === 'Selection'}
          handleToggle={() => this.setState(state => ({selectedView: state.selectedView === 'Selection'? '': 'Selection'}))}
          handleClose={() => this.setState({selectedView: ''})}
        />
        <FilterComponent
          config={filterConfig}
          dataColumnRanges={this.state.dataColumnRanges}
          dataFilters={this.state.dataFilters}
          changeDataFilters={(filters) => this.changeDataFilters(filters)}
          open={this.state.selectedView === 'Filter'}
          handleToggle={() => this.setState(state => ({selectedView: state.selectedView === 'Filter'? '': 'Filter'}))}
          handleClose={() => this.setState({selectedView: ''})}
        />
        <AggregationComponent
          config={aggregationConfig}
          open={this.state.selectedView === 'Aggregation'}
          handleToggle={() => this.setState(state => ({selectedView: state.selectedView === 'Aggregation'? '': 'Aggregation'}))}
          handleClose={() => this.setState({selectedView: ''})}
        />
        <DisaggregationComponent
          config={disaggregationConfig}
          open={this.state.selectedView === 'Disggregation'}
          handleToggle={() => this.setState(state => ({selectedView: state.selectedView === 'Disggregation'? '': 'Disggregation'}))}
          handleClose={() => this.setState({selectedView: ''})}
        />
        <GraphComponent
          config={graphConfig}
          open={this.state.selectedView === 'Graph'}
          handleToggle={() => this.setState(state => ({selectedView: state.selectedView === 'Graph'? '': 'Graph'}))}
          handleClose={() => this.setState({selectedView: ''})}
        />
      </div>
    );
  }

}

export default App;

import React, { Component } from 'react';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

import AppMap from './Map';
import SelectionComponent from './Selection';
import FilterComponent from './Filter';
import AggregationComponent from './Aggregation';
import DisaggregationComponent from './Disaggregation';
import GraphComponent from './Graph';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ScaleLoader } from 'react-spinners';

import { load, uuidv4, filterData } from './utils';
import * as config from './config';


// Material UI theme
// Mainly here to address typography deprecation issues
const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
  },
});


class App extends Component {

  constructor(props) {
    super(props);

    // Make a single group to start with
    let [newGroup, newGroupInfo] = this.makeNewGroupInfo();

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
      window: {width: 0, height: 0}
    };

    // Set to hold points which data is being loaded.
    this.loadingPoints = new Set();

    // Holder of point data.
    this.data = {};

    // Holder of filtered point data.
    this.filteredData = []
  }

  componentDidMount() {
    // Load all important data asynchronously
    load(config.POINTS_URL, (data) => this.setState({points: data}));
    load(config.POINTS_COL_URL, (data) => this.setState({pointColumnRanges: data}));
    load(config.DATA_COL_URL, (data) => this.setState({dataColumnRanges: data}));
    load(config.DATA_MAPPING_URL, (data) => this.setState({dataMapping: data}));

    // Update on change of screen size
    this.updateWindowDimensions();
    window.addEventListener('resize', () => this.updateWindowDimensions());
  }

  componentWillUnmount() {
    // Remove window size change listener
    window.removeEventListener('resize', () => this.updateWindowDimensions());
  }

  updateWindowDimensions() {
    this.setState({
      window: {width: window.innerWidth, height: window.innerHeight}
    });
  }

  checkLoading() {
    // Loading is done if loading queue (set) is empty. Change status if empty.
    if (this.loadingPoints.size === 0) {
      this.setState({loading: false});
    }
  }

  addPoint = (ids) => {
    // Check if manual selection in unabled. Exit early if it is.
    let manualSelection = this.state.groups[this.state.selectedGroup].manualSelection;
    if (!manualSelection) return null;

    // Add any new points to loading queue.
    let loading = this.loadDataFromPoints(ids);

    // Change component state: Add points to selection and change loading status if needed.
    this.setState(state => {
      let selection = state.groups[state.selectedGroup].selection;
      ids.forEach(id => selection.add(id));
      state.loading = loading;
      return state
    });
  }

  removePoint = (id) => {
    this.setState(state => {
      let selection = state.groups[state.selectedGroup].selection;
      selection.delete(id);
      return state;
    });
  }

  changeGroupName(group, name) {
    this.setState(state => {state.groups[group].name = name;})
  }

  deleteGroup(group) {
    this.setState(state => {
      // Do not remove a group if its the last one.
      if (Object.keys(state.groups).length === 1) return state;

      let groups = state.groups;
      delete groups[group];

      // If selected group was just deleted, change it.
      if (group === state.selectedGroup) state.selectedGroup = Object.keys(state.groups)[0];

      return state
    })
  }

  loadDataFromPoints(ids) {
    let loading = false;

    // Check if the data of any new point is missing
    ids.forEach(id => {
      if (!(id in this.data)) {
        loading = true;

        // Add to loading queue if no data was found
        this.loadingPoints.add(id);

        // Make an async request of point info
        // Check if queue is empty after loading.
        load(
          config.DATA_URL + '?id=' + id,
          (data) => {
            // Add loaded data to the data object with the point's id as key.
            this.data[id] = data;

            // Remove point id from loading set.
            this.loadingPoints.delete(id);
        }).then(() => this.checkLoading());
    }});

    return loading;
  }

  changeFilters(group, filters) {
    // Filter points using filter. Extract the id of the filtered points.
    let selection = filterData(this.state.points, filters).map(point => point['id_congl']);

    // Add any new points to loading queue.
    let loading = this.loadDataFromPoints(selection);

    // Change state: Update filters and selections associated to group, and change loading
    // status if necessary.
    this.setState(state => {
      state.groups[group].filters = filters;
      state.groups[group].selection = new Set(selection);
      state.loading = loading;
      return state;
    });

  }

  changeDataFilters(filters) {
    // Filter data for all groups
    let filteredData = {}

    // Filter data for each group
    for (let group in this.state.groups) {
      // Extract selected points.
      let selection = this.state.groups[group].selection;

      // Collect all data from each selected point.
      let data = [];
      selection.forEach((id) => { data = data.concat(this.data[id]) });

      // Filter selected data
      filteredData[group] = filterData(data, filters, this.state.dataMapping);
    }

    // Store filtered data to avoid recalculation on each render.
    this.filteredData = filteredData;

    // Change state to update selected data filters
    this.setState({dataFilters: filters});
    console.log(this.filteredData);
  }

  deleteAllGroups() {
    this.setState(state => {
      // Make new group
      let [newGroup, newGroupInfo] = this.makeNewGroupInfo();

      // Replace group info, and selected group with new.
      state.groups = newGroupInfo;
      state.selectedGroup = newGroup;
      return state;
    });
  }

  makeNewGroupInfo() {
    // New random name
    let newGroup = uuidv4();

    // Group info consists of:
    //    1. A Name
    //    2. Selection set to store associated points.
    //    3. A list of filters that define the associated points.
    //    4. A boolean named manualSelection that selects which of the
    //    two modes of operation is active (manual selection or point filtering)
    let newGroupInfo = {};
    newGroupInfo[newGroup] = {
      name: 'G-' + newGroup.slice(0, 4),
      selection: new Set(),
      manualSelection: true,
      filters: {},
    };

    // Return name and group info
    return [newGroup, newGroupInfo];
  }

  newGroup() {
    this.setState(state => {
      // Create new group and add to group info.
      let [, newGroupInfo] = this.makeNewGroupInfo();
      state.groups = Object.assign(state.groups, newGroupInfo)
      return state;
    });
  }

  changeManualSelection() {
    this.setState(state => {
      // Get manualSelection boolean option for selected group.
      let groupInfo = state.groups[state.selectedGroup];
      let newManualSelection = !groupInfo.manualSelection;

      // Erase any selection if filtering mode is now activated
      if (!newManualSelection) {
        groupInfo.selection = new Set();
      }

      // Change manualSelection to its oposite.
      groupInfo.manualSelection = newManualSelection;
      return state;
    });
  }

  render() {
    // Add loader if any point's data is being loading.
    let loader = null;
    if (this.state.loading) {
      let style = {
        position: 'absolute',
        top: 10,
        left: 50,
        zIndex: 999
      }
      loader = (
        <div style={style}>
          <ScaleLoader/>
        </div>
      );
    }

    // Dynamically adjust the height of buttons to size of window.
    let baseTop = this.state.window.height * (config.COMPONENT_MIN_TOP / 100);
    let changeInTop = Math.max(this.state.window.height / 18, 40);

    return (
      <MuiThemeProvider theme={theme}>
        <div className="App">
          <CssBaseline/>
          {loader}
          <AppMap
            viewport={config.DEFAULT_VIEWPORT}
            points={this.state.points}
            selectedPoints={this.state.groups[this.state.selectedGroup].selection}
            addPoint={this.addPoint}
            removePoint={this.removePoint}
            open={this.state.selectedView === 'Map'}
            handleToggle={() => this.setState(state => ({selectedView: state.selectedView === 'Map'? '': 'Map'}))}
            handleClose={() => this.setState({selectedView: ''})}
          />
          <SelectionComponent
            config={config.COMPONENT_CONFIG}
            name={'Seleccionar'}
            top={baseTop}
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
            config={config.COMPONENT_CONFIG}
            name={'Filtrar'}
            top={baseTop + changeInTop}
            dataColumnRanges={this.state.dataColumnRanges}
            dataFilters={this.state.dataFilters}
            changeDataFilters={(filters) => this.changeDataFilters(filters)}
            open={this.state.selectedView === 'Filter'}
            handleToggle={() => this.setState(state => ({selectedView: state.selectedView === 'Filter'? '': 'Filter'}))}
            handleClose={() => this.setState({selectedView: ''})}
          />
          <AggregationComponent
            config={config.COMPONENT_CONFIG}
            name={'Agregar'}
            top={baseTop + 2 * changeInTop}
            open={this.state.selectedView === 'Aggregation'}
            handleToggle={() => this.setState(state => ({selectedView: state.selectedView === 'Aggregation'? '': 'Aggregation'}))}
            handleClose={() => this.setState({selectedView: ''})}
          />
          <DisaggregationComponent
            config={config.COMPONENT_CONFIG}
            name={'Desaggregar'}
            top={baseTop + 3 * changeInTop}
            open={this.state.selectedView === 'Disggregation'}
            handleToggle={() => this.setState(state => ({selectedView: state.selectedView === 'Disggregation'? '': 'Disggregation'}))}
            handleClose={() => this.setState({selectedView: ''})}
          />
          <GraphComponent
            config={config.COMPONENT_CONFIG}
            name={'Graficar'}
            top={baseTop + 4 * changeInTop}
            open={this.state.selectedView === 'Graph'}
            handleToggle={() => this.setState(state => ({selectedView: state.selectedView === 'Graph'? '': 'Graph'}))}
            handleClose={() => this.setState({selectedView: ''})}
          />
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;

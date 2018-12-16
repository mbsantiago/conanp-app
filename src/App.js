import React, { Component } from 'react';

// Material UI imports
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

// Other imports
import { ScaleLoader } from 'react-spinners';

// Map component
import AppMap from './Map';

// App menu
import AppMenu from './AppMenu';

// Other app components
import SelectionComponent from './Selection';
import FilterComponent from './Filter';
import AggregationComponent from './Aggregation';
import DisaggregationComponent from './Disaggregation';
import GraphComponent from './Graph';

// Local imports
import { load, uuidv4, filterData, getDates } from './utils';
import { theme } from './theme';
import * as config from './config';


class App extends Component {

  constructor(props) {
    super(props);

    // Make a single group to start with
    let [newGroup, newGroupInfo] = this.makeNewGroupInfo();

    this.state = {
      // Groups info
      groups: newGroupInfo,
      selectedGroup: newGroup,
      // Loading status
      loading: false,
      loadingError: false,
      errorMsg: null,
      // Point location, data and column info
      points: null,
      pointColumnRanges: null,
      dataColumnRanges: null,
      dataMapping: null,
      // Data filters, aggregators and disaggregators
      dataFilters: {},
      // Current window size
      window: {width: 0, height: 0}
    };

    // Set to hold points which data is being loaded.
    this.loadingPoints = new Set();

    // Holder of point data.
    this.data = {};

    // Holder of available dates for current selected group
    this.dates = new Set();

    // Holder of filtered point data.
    this.filteredData = [];
  }

  componentDidMount() {
    // Load all important data asynchronously
    load(config.POINTS_URL, (data) => this.setState({points: data}))
      .catch((error) => this.setState({loadingError: true, errorMsg: `${error.name}:  ${error.message}`}));
    load(config.POINTS_COL_URL, (data) => this.setState({pointColumnRanges: data}))
      .catch((error) => this.setState({loadingError: true, errorMsg: `${error.name}:  ${error.message}`}));
    load(config.DATA_COL_URL, (data) => this.setState({dataColumnRanges: data}))
      .catch((error) => this.setState({loadingError: true, errorMsg: `${error.name}:  ${error.message}`}));
    load(config.DATA_MAPPING_URL, (data) => this.setState({dataMapping: data}))
      .catch((error) => this.setState({loadingError: true, errorMsg: `${error.name}:  ${error.message}`}));

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

  // ====== Point selection and data download ======
  /* Load point data from list of points*/
  loadDataFromPoints(ids) {
    let loading = this.state.loading;

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
          })
          .then(() => this.checkLoading())
          .catch((error) => {
            this.loadingPoints.delete(id);
            console.log(error);
          });
      }
    });

    return loading;
  }

  /* Helper function to check if all point data has been downloaded */
  checkLoading() {
    // Loading is done if loading queue (set) is empty. Change status if empty.
    if (this.loadingPoints.size === 0) {
      this.setState(state => {
        const selection = state.groups[state.selectedGroup].selection;
        this.updateDates(selection);
        this.updateFilteredData(state);
        return {loading: false};
      });
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

      // Update dates if not loading
      if (!loading) {
        this.updateDates(selection);
      }

      state.loading = loading;
      return state;
    });
  }

  removePoint = (id) => {
    this.setState(state => {
      let selection = state.groups[state.selectedGroup].selection;
      selection.delete(id);

      // Update dates if not loading
      if (!state.loading) {
        this.updateDates(selection);
      }

      return state;
    });
  }

  // ====== Group handling ======
  changeSelectedGroup = (name) => {
    this.setState(state => {
      let selection = state.groups[name].selection;
      // Update dates if not loading
      if (!state.loading) {
        this.updateDates(selection);
      }

      state.selectedGroup = name;
      return state;
    });
  }

  changeGroupName(group, name) {
    this.setState(state => {
      state.groups[group].name = name;
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
    //    5. A set of selected months to filter information with.
    //    6. An array of time filters.
    let newGroupInfo = {};
    newGroupInfo[newGroup] = {
      name: 'G-' + newGroup.slice(0, 4),
      selection: new Set(),
      manualSelection: true,
      filters: {},
      months: new Set(),
      timeFilters: {
        type: 'time',
        column: config.TIME_COL,
        filters: [],
        exclusion: false,
      },
    };

    // Return name and group info
    return [newGroup, newGroupInfo];
  }

  newGroup() {
    this.setState(state => {
      // Create new group and add to group info.
      let [, newGroupInfo] = this.makeNewGroupInfo();
      state.groups = Object.assign(state.groups, newGroupInfo);
      return state;
    });
  }

  deleteGroup(group) {
    this.setState(state => {
      // Do not remove a group if its the last one.
      if (Object.keys(state.groups).length === 1) return state;

      let groups = state.groups;
      delete groups[group];

      // If selected group was just deleted, change it.
      if (group === state.selectedGroup) state.selectedGroup = Object.keys(state.groups)[0];

      return state;
    });
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

  // ====== Group filter handling ======
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

  // ====== Filtering data ======
  updateFilteredData(state) {
    // Filter data for all groups
    let filteredData = {};

    // Filter data for each group
    for (let group in state.groups) {
      // Extract selected points.
      let selection = state.groups[group].selection;

      // Collect all data from each selected point.
      let data = [];
      selection.forEach((id) => {if(id in this.data) data = data.concat(this.data[id]); });

      // Filter selected data with column filters
      let filters = state.dataFilters;
      let groupData = filterData(data, filters, state.dataMapping);

      // Filter data with date and time filters
      let months = this.state.groups[group].months;
      let timeFilters = this.state.groups[group].timeFilters;

      // Do not filter if no filters are found
      if (months.size === 0 && timeFilters.filters.lenght === 0) {
        filteredData[group] = groupData;
      } else {

        // Create a filter function for date filters
        let dateFilter;
        if (months.size === 0) {
          // Trivial filter function if no date filters are found
          dateFilter = () => true;
        } else {
          // Filter datum if falls within selected months
          dateFilter = (datum) => {
            let [year, month, ] = datum[config.DATE_COL].split('-');
            let date = `${year}-${month}`;
            return months.has(date);
          };
        }

        // Create a filter function for time filters
        let timeFilter;
        if (timeFilters.filters.length === 0) {
          // Trivial filter function if no time filters are found
          timeFilter = () => true;
        } else {
          // Filter datum if it falls in the range of selected filters
          let timeFilterFunc = (datum) => {
            // Parse date column
            let [hour, minute, ] = datum[config.TIME_COL].split(':');
            let time = new Date(2000, 0, 0, hour, minute);
            let minTime = new Date(2000, 0, 0, 0, 0);
            let maxTime = new Date(2000, 0, 0, 0, 0);

            // Check if time indicated falls within the selected time intervals
            let isIn = false;
            for (let i=0; i < timeFilters.filters.length; i++) {
              // Parse time filters
              let {min, max} = timeFilters.filters[i];
              let [minHour, minMin] = min.split(':');
              let [maxHour, maxMin] = max.split(':');

              // Use Date objects for comparison
              minTime.setHours(minHour);
              minTime.setMinutes(minMin);
              maxTime.setHours(maxHour);
              maxTime.setMinutes(maxMin);

              // Check if it falls in the selected time interval
              if ((minTime <= time) && (time <= maxTime)) {
                isIn = true;
                break;
              }
            }

            return isIn;
          };

          // Modify the filter function if time filter is exclusive
          if (timeFilters.exclusion) {
            timeFilter = (datum) => !timeFilterFunc(datum);
          } else {
            timeFilter = timeFilterFunc;
          }
        }

        // Filter all data with time and date filters.
        filteredData[group] = groupData
          .filter(datum => timeFilter(datum) && dateFilter(datum));
      }
    }

    // Store filtered data to avoid recalculation on each render.
    this.filteredData = filteredData;
  }

  // ====== Data filter handling ======
  changeDataFilters(filters) {
    // Change state to update selected data filters
    this.setState(state => {
      state.dataFilters = filters;
      this.updateFilteredData(state);
      return state;
    });
  }

  // ====== Date filter handling ======
  updateDates(selection) {
    let data = [];
    selection.forEach(id => {
      if (id in this.data) {
        data = data.concat(this.data[id]);
      }});
    this.dates = getDates(data);
  }

  toggleMonth = (month) => {
    this.setState(state => {
      let selected = state.groups[state.selectedGroup].months;

      if (selected.has(month)) {
        selected.delete(month);
      } else {
        selected.add(month);
      }

      this.updateFilteredData(state);

      return state;
    });
  }

  selectAllMonths = () => {
    let months = new Set();
    this.dates.forEach(date => {
      let [year, month, ] = date.split('-');
      months.add(`${year}-${month}`);
    });

    this.setState(state => {
      let selected = state.groups[state.selectedGroup];
      selected['months'] = months;

      this.updateFilteredData(state);
      return selected;
    });
  }

  unselectAllMonths = () => {
    this.setState( state => {
      state.groups[state.selectedGroup].months = new Set();

      this.updateFilteredData(state);
      return state;
    });
  }

  // ====== Time filtering handlers ======
  changeTimeFilters = (filters) => {
    this.setState(state => {
      state.groups[state.selectedGroup].timeFilters = filters;

      this.updateFilteredData(state);
      return state;
    });
  }

  // ====== Loading Error Handlers ======
  sendErrorReport = () => {
    const email = config.MAINTAINER;
    const subject = `Reporte de error aplicación ${config.NAME}`;
    const body = `ERROR: ${this.state.errorMsg}`;
    const msg = `mailto:${email}?subject=${subject}&body=${body}`;
    window.open(msg);
  }

  renderErrorWindow() {
    // Render popup window with error information and possible actions.
    return (
      <Dialog
        open={this.state.loadingError}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Error al cargar"}</DialogTitle>
        <DialogContent>
          {/* Display informative text on error */}
          <DialogContentText id="alert-dialog-description">
            La aplicación no pudo cargar la información necesaria para desplegar la visualización.
            Favor de recargar la ventana o, en caso de que persista el problema,
            enviar un reporte a los mantenedores de esta aplicación.
          </DialogContentText>
          <br/>
          {/* Display error message */}
          <DialogContentText>
            ERROR : {this.state.errorMsg}
          </DialogContentText>
        </DialogContent>

        {/* Possible actions on error */}
        <DialogActions>
          {/* Reload window action button */}
          <Button onClick={() => window.location.reload()} color="primary" autoFocus>
            Recargar
          </Button>
          {/* Send report action button */}
          <Button onClick={this.sendErrorReport} color="secondary">
            Enviar reporte
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // ====== Main Renderer ======
  render() {
    // Add loader if any point's data is being loading.
    let loader = null;
    if (this.state.loading) {
      let style = {
        position: 'absolute',
        top: 10,
        left: 50,
        zIndex: 999
      };

      loader = (
        <div style={style}>
          <ScaleLoader/>
        </div>
      );
    }

    const columns = Object.assign({}, this.state.dataColumnRanges, this.state.pointColumnRanges);

    return (
      <MuiThemeProvider theme={theme}>
        <div className="App">
          <CssBaseline/>
          {loader}
          <AppMap
            points={this.state.points}
            selectedPoints={this.state.groups[this.state.selectedGroup].selection}
            addPoint={this.addPoint}
            removePoint={this.removePoint}
          />
          <AppMenu
            height={this.state.window.height}
          >
            <SelectionComponent
              key={'Seleccionar'}
              groups={this.state.groups}
              selectedGroup={this.state.selectedGroup}
              selectGroup={this.changeSelectedGroup}
              changeGroupName={(group, name) => this.changeGroupName(group, name)}
              newGroup={() => this.newGroup()}
              deleteGroup={(group) => this.deleteGroup(group)}
              deleteAllGroups={() => this.deleteAllGroups()}
              changeManualSelection={() => this.changeManualSelection()}
              pointColumnRanges={this.state.pointColumnRanges}
              changeFilters={(group, filters) => this.changeFilters(group, filters)}
            />
            <FilterComponent
              key={'Filtrar'}
              dataColumnRanges={this.state.dataColumnRanges}
              dataFilters={this.state.dataFilters}
              changeDataFilters={(filters) => this.changeDataFilters(filters)}
              selectedMonths={this.state.groups[this.state.selectedGroup].months}
              unselectAllMonths={this.unselectAllMonths}
              selectAllMonths={this.selectAllMonths}
              toggleMonth={this.toggleMonth}
              dates={this.dates}
              changeTimeFilters={this.changeTimeFilters}
              timeFilters={this.state.groups[this.state.selectedGroup].timeFilters}
            />
            <AggregationComponent
              key={'Agregar'}
              columns={columns}
            />
            <DisaggregationComponent
              key={'Desagregar'}
            />
            <GraphComponent
              key={'Graficar'}
            />
          </AppMenu>
        </div>
        {this.renderErrorWindow()}
      </MuiThemeProvider>
    );
  }
}

export default App;

import React, { Component } from 'react';
import PropTypes from 'prop-types';

// Material UI imports
import { withStyles } from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import CreateButton from '@material-ui/icons/Create';
import RemoveButton from '@material-ui/icons/Remove';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

// Local imports
import { uuidv4 } from '../utils';
import { CategoricalConfigurator, RangeConfigurator } from './configurators';

// Material UI styles
const styles = theme => ({
  groupFilter: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
    display: 'flex',
    height: "100%",
    width: "100%",
  },
  fullWidth: {
    width: "100%",
  },
  button: {
    margin: theme.spacing.unit,
  },
  extendedIcon: {
    marginRight: theme.spacing.unit,
  },
  filterList: {
    overflow: 'auto',
    maxHeight: '35vh',
    width: '100%',
  }
});


class FilterComponent extends Component {

  state = {
    newFilterWindowOpen: false,
    configureFilterWindowOpen: false,
    column: '',
    selectedFilter: null,
  };

  renderHeader() {
    const { classes } = this.props;

    return (
      <>
        {/* Row with title and add/delete filter buttons */}
        <ListItem>

          {/* Title */}
          <ListItemText primary="Filtros" />

          {/* Add new filter button */}
          <Button
            variant="text"
            color="primary"
            aria-label="Add"
            className={classes.button}
            onClick={() => this.setState({newFilterWindowOpen: true, column: ''})}
            disabled={this.props.disabled}
          >
            <AddIcon className={classes.extendedIcon}/>
          </Button>

          {/* Delete all filters button */}
          <Button
            variant="text"
            color="secondary"
            aria-label="Delete"
            className={classes.button}
            onClick={() => this.props.changeFilters({})}
            disabled={this.props.disabled}
          >
            <DeleteIcon className={classes.extendedIcon}/>
          </Button>
        </ListItem>
        <Divider/>
      </>
    );
  }

  deleteFilter(filterName) {
    // Make copy of filter object, delete filter and pass it to changing
    // filter function.
    let filters = Object.assign({}, this.props.filters);
    delete filters[filterName];
    this.props.changeFilters(filters);
  }

  handleAddFilter = () => {
    // Don't add filter if none selected or columns are still loading.
    if (this.state.column === '' || this.state.column === 'cargando') {
      return null;
    }

    // Copy filters
    let filters = Object.assign({}, this.props.filters);

    // Create new filter with random name.
    let newFilterName = uuidv4();

    // Add needed filter configuration info.
    let type = Array.isArray(this.props.columnRanges[this.state.column]) ? 'categorical': 'range';
    filters[newFilterName] = {
      'column': this.state.column,
      'type': type,
      'exclusion': false,
      'filters': [],
    };

    // Pass the new filter to the change filter function
    this.props.changeFilters(filters);

    // Close window, open configure filter window with newly created filter.
    this.setState({
      configureFilterWindowOpen: true,
      newFilterWindowOpen: false,
      selectedFilter: newFilterName,
    });
  }

  handleCloseWindow = (windowName) => this.setState({[windowName + 'WindowOpen']: false});

  handleChange = () => event => this.setState({[event.target.name]: event.target.value});

  handleConfigureFilter = () => this.setState({configureFilterWindowOpen: false, selectedFilter: null});

  changeFilter(config) {
    // Copy filter object and update the selected filter configurations.
    let filters = Object.assign({}, this.props.filters);
    filters[this.state.selectedFilter].filters = config;

    // Pass the new filter configuration to the change filter function.
    this.props.changeFilters(filters);
  }

  changeExclusion() {
    // Copy filters object and update exclusion configuration.
    let filters = Object.assign({}, this.props.filters);
    let previousValue = filters[this.state.selectedFilter].exclusion;
    filters[this.state.selectedFilter].exclusion = !previousValue;

    // Pass the new filter configuration to the change filter function.
    this.props.changeFilters(filters);
  }

  renderFilterList() {
    const { classes } = this.props;

    // Make a JSX List item element for each filter.
    let filters = Object.entries(this.props.filters).map((entry) => {
      let [filterName, filter] = entry;

      // Return a new list item row
      return (
        <ListItem
          key={filter.column}
          divider={true}
          dense
          button
        >
          {/* Name of column as primary identifyer of filter */}
          <ListItemText primary={filter.column}/>

          {/* Edit filter button */}
          <ListItemSecondaryAction>
            <IconButton
              onClick={() => this.setState({selectedFilter: filterName, configureFilterWindowOpen: true})}
              aria-label="Edit"
            >
              <CreateButton />
            </IconButton>

            {/* Delete filter button*/}
            <IconButton
              onClick={() => this.deleteFilter(filterName)}
              aria-label="Delete"
            >
              <RemoveButton />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      );
    });

    // Return the full list of filters
    return (
      <ListItem>
        <List className={classes.filterList}>
          {filters}
        </List>
      </ListItem>
    );
  }

  renderAddFilterWindow() {
    const { classes } = this.props;

    let suggestions;
    // Render suggestions in column ranges where correctly loaded
    if (this.props.columnRanges) {
      // Create a menu item for each posible data column
      suggestions = Object.keys(this.props.columnRanges).map(name => (
        <MenuItem value={name} key={name}>{name}</MenuItem>
      ));
    } else {
      // Otherwise show loading status
      suggestions = <MenuItem value={'cargando'}>Cargando...</MenuItem>;
    }

    // Render a popup window showing the posible columns with which to filter.
    return (
      <Dialog
        open={this.state.newFilterWindowOpen}
        onClose={() => this.handleCloseWindow('newFilter')}
        aria-labelledby="form-dialog-title"
        fullWidth={true}
        maxWidth="sm"
      >
        {/* Title */}
        <DialogTitle id="form-dialog-title">Nuevo Filtro</DialogTitle>

        <DialogContent>
          {/* Add a form with a dropdown menu with all possible columns */}
          <form className={classes.form} autoComplete="off">
            <FormControl className={classes.formControl + ' ' + classes.fullWidth}>
              <InputLabel htmlFor="column">Columna</InputLabel>
              <Select
                value={this.state.column}
                name={"column"}
                onChange={this.handleChange()}
              >
                {suggestions}
              </Select>
            </FormControl>
          </form>
        </DialogContent>

        {/* Add button to finalize or cancel the creation of a new filter */}
        <DialogActions>
          {/* Cancel button */}
          <Button onClick={() => this.handleCloseWindow('newFilter')} color="primary">
            Cancelar
          </Button>
          {/* Add filter button */}
          <Button onClick={this.handleAddFilter} color="primary">
            Añadir
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  renderConfigureFilterWindow() {
    // Exit early if no filters exist or none have been selected
    if (Object.keys(this.props.filters).length === 0) return null;
    if (!this.state.selectedFilter) return null;

    // Extract information for the selected column
    const filter = this.props.filters[this.state.selectedFilter];
    const columnInfo = this.props.columnRanges[filter.column];

    // Set content depending on the type of data column (categorical/continuous)
    let content;
    if (filter.type === 'categorical') {
      // Configuration of categorical column filters is done by specialized component
      content = (
        <CategoricalConfigurator
          values={columnInfo}
          filters={filter.filters}
          changeFilter={(config) => this.changeFilter(config)}
          exclusion={filter.exclusion}
          changeExclusion={() => this.changeExclusion()}
        />
      );
    } else {
      // The same for continuous column filters.
      content = (
        <RangeConfigurator
          values={columnInfo}
          filters={filter.filters}
          changeFilter={(config) => this.changeFilter(config)}
          exclusion={filter.exclusion}
          changeExclusion={() => this.changeExclusion()}
        />
      );
    }

    // Render column filter being configured
    const title = (
      <Typography variant="button" gutterBottom>
        {filter.column}
      </Typography>
    );

    // Render a popup window with filter configuration options.
    return (
      <Dialog
        open={this.state.configureFilterWindowOpen}
        onClose={() => this.handleCloseWindow('configureFilter')}
        aria-labelledby="form-dialog-title"
        fullWidth={true}
        maxWidth="lg"
      >
        {/* Title */}
        <DialogTitle id="form-dialog-title">
          Configurar Filtro {title}
        </DialogTitle>

        {/* Content depends on type of data column */}
        <DialogContent>
          {content}
        </DialogContent>

        {/* Buttons for finalizing/canceling filter configuration */}
        <DialogActions>
          {/* Cancel button */}
          <Button onClick={() => this.handleCloseWindow('configureFilter')} color="primary">
            Cancelar
          </Button>

          {/* Finish configuration button */}
          <Button onClick={this.handleConfigureFilter} color="primary">
            Listo
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  render() {
    const { classes } = this.props;

    // Render filter configuration window with header bar (title and add/delete filter buttons)
    // and filter list.
    return (
      <div className={classes.groupFilter}>
        <List className={classes.fullWidth} dense>
          {this.renderHeader()}
          {this.renderFilterList()}
        </List>
        {/* Add popup windows for add-filter and configure-filter functionalities */}
        {this.renderAddFilterWindow()}
        {this.renderConfigureFilterWindow()}
      </div>
    );
  }
}


// Enforcing prop types
FilterComponent.propTypes = {
  classes: PropTypes.object,
  disabled: PropTypes.bool,
  changeFilters: PropTypes.func.isRequired,
  filters: PropTypes.object.isRequired,
  columnRanges: PropTypes.object.isRequired,
};


export default withStyles(styles, { withTheme: true })(FilterComponent);

import React, { Component } from 'react';
import PropTypes from 'prop-types';

// Select component with autocomplete
import Select from 'react-select';

// Material UI imports
import { withStyles } from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import Divider from '@material-ui/core/Divider';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import RemoveButton from '@material-ui/icons/Remove';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';


// Material UI styles
const styles = theme => ({
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
    width: '100%',
  },
  form: {
    display: 'flex',
    flexGrow: 1,
    width: '100%'
  },
  input: {
    margin: theme.spacing.unit,
  },
  root: {
    overflow: 'visible'
  }
});


class Configurator extends Component {

  state = {newFilterWindowOpen: false}

  deleteFilter = (index) => {
    // Copy filter array and remove the corresponding element
    let filters = Object.assign({}, this.props.filters);
    filters.filters.splice(index, 1);

    // Pass the resulting array to change filter function
    this.props.changeFilter(filters);
  }

  changeExclusion = () => {
    let filters = Object.assign({}, this.props.filters);
    filters.exclusion = !filters.exclusion;

    this.props.changeFilter(filters);
  }

  deleteAllFilters = () => {
    let filters = Object.assign({}, this.props.filters);
    filters.filters = [];
    this.props.changeFilter(filters);
  }

  handleAddFilter = () => {
    // Add filter and close window.
    this.addFilter();
    this.setState({newFilterWindowOpen: false});
  }

  handleCloseWindow = () => this.setState({newFilterWindowOpen: false});

  renderHeader() {
    // Render top bar with title and control buttons
    const { classes } = this.props;

    // Generate a row with header info
    return (
      <ListItem>

        {/* Switch to set if filter is inclusive or exclusive */}
        <FormGroup row>
          <FormControlLabel
            control={
              <Switch
                checked={this.props.filters.exclusion}
                onChange={this.changeExclusion}
                value="checkedA"
              />
            }
            label={this.props.filters.exclusion ? 'exclusion': 'inclusion'}
          />

          {/* Add new filter option button */}
          <Button
            variant="text"
            color="primary"
            aria-label="Add"
            className={classes.button}
            onClick={() => this.setState({newFilterWindowOpen: true})}
          >
            <AddIcon className={classes.extendedIcon}/>
          </Button>

          {/* Remove all filter options button */}
          <Button
            variant="text"
            color="secondary"
            aria-label="Delete"
            className={classes.button}
            onClick={this.deleteAllFilters}
          >
            <DeleteIcon className={classes.extendedIcon}/>
          </Button>
        </FormGroup>
      </ListItem>
    );
  }

  renderFilterList() {
    const { classes } = this.props;

    // Generate JSX element for each filter option in filter configuration.
    let filters = this.props.filters.filters.map((filter, i) => {
      return (
        <ListItem
          key={'filter-value-' + i}
          divider={true}
          dense
        >
          {/* Name of option (depends on type of filter) */}
          {this.renderFilterEntry(filter)}

          {/* Remove filter option button */}
          <ListItemSecondaryAction>
            <IconButton
              onClick={() => this.deleteFilter(i)}
              aria-label="Delete"
            >
              <RemoveButton/>
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      );
    });

    // Render list with all filter options.
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

    // Render popup window to select new filter option
    return (
      <Dialog
        open={this.state.newFilterWindowOpen}
        onClose={this.handleCloseWindow}
        aria-labelledby="form-dialog-title"
        fullWidth={true}
        maxWidth="sm"
        classes={{paperScrollPaper: classes.root}}
      >
        {/* Window title */}
        <DialogTitle id="form-dialog-title">Nuevo {this.header}</DialogTitle>

        {/* Selection component (depends on type of filter) */}
        <DialogContent className={classes.root}>
          {this.renderNewFilterContent()}
        </DialogContent>

        {/* Cancel or finalize adding filter option buttons */}
        <DialogActions>

          {/* Cancel button */}
          <Button onClick={this.handleCloseWindow} color="primary">
            Cancelar
          </Button>

          {/* Add new option button */}
          <Button onClick={this.handleAddFilter} color="primary">
            Añadir
          </Button>
        </DialogActions>
      </Dialog>
    );
  }


  render() {
    const { classes } = this.props;

    // Render a list to create rows with header and filter option list.
    return (
      <div className={classes.fullWidth}>
        <List className={classes.fullWidth} dense>
          {this.renderHeader()}
          <Divider/>
          {this.renderFilterList()}
        </List>
        {/* Render popup window to add new filter option */}
        {this.renderAddFilterWindow()}
      </div>
    );
  }
}


// Prop types validation
Configurator.propTypes = {
  filters: PropTypes.object.isRequired,
  changeFilter: PropTypes.func.isRequired,
  classes: PropTypes.object,
};



class CategoricalConfigurator extends Configurator {
  constructor(props) {
    super(props);

    // Add current text field value to state
    this.state['value'] = '';
  }

  handleChange = (option) => this.setState({value: option.value});

  addFilter() {
    // Copy filter array and add new filter option.
    let filters = Object.assign({}, this.props.filters);
    filters.filters.push(this.state.value);

    // Pass the new filter array config to the change filter function.
    this.props.changeFilter(filters);
  }

  renderNewFilterContent() {
    const { classes } = this.props;

    // Prepare all possible values of categorical data field for rendering
    // in Select component
    let options = this.props.values.map(name =>
      ({value: name, label: name}));

    // Render a form to select a single option of all possible categorical values.
    return (
      <form className={classes.form} autoComplete="off">
        <FormControl className={classes.formControl + ' ' + classes.fullWidth}>
          {/* Name of field */}
          <InputLabel htmlFor="value">Valor</InputLabel>

          {/* Selection component, Dropdown menu with autocomplete option */}
          <Select
            value={{value: this.state.value, label: this.state.value}}
            name={"value"}
            onChange={this.handleChange}
            options={options}
          />
        </FormControl>
      </form>
    );
  }

  renderFilterEntry(filter) {
    // Representation of filter option is just the value of categorical field.
    return <div>{filter}</div>;
  }
}

class RangeConfigurator extends Configurator {
  constructor(props) {
    super(props);

    // Add current minimum and maximum values of new
    // filter option to state of component.
    this.state['min'] = props.values.min;
    this.state['max'] = props.values.max;
  }

  addFilter() {
    // Copy filter config array and add new option with new min-max values
    // for continuous data field.
    let filters = Object.assign({}, this.props.filters);
    filters.filters.push({
      'min': this.state.min,
      'max': this.state.max,
    });

    // Pass the new filter config array to change filter function.
    this.props.changeFilter(filters);
  }

  handleChange = (name) => event => this.setState({[name]: event.target.value});

  renderNewFilterContent() {
    const { classes } = this.props;

    // Render a form with two number fields to specify min and max values of
    // continuous data field.
    return (
      <form className={classes.form} noValidate autoComplete="off">
        {/* Number field for Minimum specification */}
        <TextField
          id="standard-number-2"
          label="De"
          value={this.state.min}
          onChange={this.handleChange('min')}
          type={this.props.filters.type}
          className={classes.input}
          InputLabelProps={{
            shrink: true,
          }}
          margin="normal"
        />

        {/* Number field for maximum specification */}
        <TextField
          id="standard-number-2"
          label="A"
          value={this.state.max}
          onChange={this.handleChange('max')}
          type={this.props.filters.type}
          className={classes.input}
          InputLabelProps={{
            shrink: true,
          }}
          margin="normal"
        />
      </form>
    );
  }

  renderFilterEntry(filter) {
    // Representation of filter option is given by "min - max"
    return <div> {filter.min} - {filter.max} </div>;
  }
}


CategoricalConfigurator = withStyles(styles, { withTheme: true})(CategoricalConfigurator);
RangeConfigurator = withStyles(styles, { withTheme: true })(RangeConfigurator);


export {
  CategoricalConfigurator,
  RangeConfigurator
};

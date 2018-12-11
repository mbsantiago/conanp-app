import React, { Component } from 'react';
import Select from 'react-select';

// Material UI imports
import { withStyles } from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
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
    let filters = this.props.filters.slice();
    filters.splice(index, 1);
    this.props.changeFilter(filters);
  }

  handleAddFilter = () => {
    this.addFilter();
    this.setState({newFilterWindowOpen: false});
  }

  handleCloseWindow = () => this.setState({newFilterWindowOpen: false});

  renderHeader() {
    const { classes } = this.props;

    return (
      <ListItem>
        <ListItemText primary={this.header} />
        <FormGroup row>
          <FormControlLabel
            control={
              <Switch
                checked={this.props.exclusion}
                onChange={this.props.changeExclusion}
                value="checkedA"
              />
            }
            label={this.props.exclusion? 'exclusion': 'inclusion'}
          />
          <Button
            variant="text"
            color="primary"
            aria-label="Add"
            className={classes.button}
            onClick={() => this.setState({newFilterWindowOpen: true})}
          >
            <AddIcon className={classes.extendedIcon}/>
          </Button>
          <Button
            variant="text"
            color="secondary"
            aria-label="Delete"
            className={classes.button}
            onClick={() => this.props.changeFilter([])}
          >
            <DeleteIcon className={classes.extendedIcon}/>
          </Button>
        </FormGroup>
      </ListItem>
    );
  }

  renderFilterList() {
    const { classes } = this.props;

    let filters = this.props.filters.map((filter, i) => {
      return (
        <ListItem
          key={'filter-value-' + i}
          divider={true}
          dense
        >
          {this.renderFilterEntry(filter)}
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

    return (
      <Dialog
        open={this.state.newFilterWindowOpen}
        onClose={this.handleCloseWindow}
        aria-labelledby="form-dialog-title"
        fullWidth={true}
        maxWidth="sm"
        classes={{paperScrollPaper: classes.root}}
      >
        <DialogTitle id="form-dialog-title">Nuevo {this.header}</DialogTitle>
        <DialogContent className={classes.root}>
          {this.renderNewFilterContent()}
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleCloseWindow} color="primary">
            Cancelar
          </Button>
          <Button onClick={this.handleAddFilter} color="primary">
            Añadir
          </Button>
        </DialogActions>
      </Dialog>
    );
  }


  render() {
    const { classes } = this.props;

    return (
      <div className={classes.fullWidth}>
        <List className={classes.fullWidth} dense>
          {this.renderHeader()}
          {this.renderFilterList()}
          <Divider/>
          {this.renderAddFilterWindow()}
        </List>
      </div>
    );
  }

}



class CategoricalConfigurator extends Configurator {
  constructor(props) {
    super(props);
    this.header = 'Valores';
    this.state['value'] = '';
  }

  handleChange(option) {
    this.setState({
      value: option.value
    });
  }

  renderNewFilterContent() {
    const { classes } = this.props;

    let options = this.props.values.map(name =>
      ({value: name, label: name}));

    return (
      <form className={classes.form} autoComplete="off">
        <FormControl className={classes.formControl + ' ' + classes.fullWidth}>
          <InputLabel htmlFor="value">Valor</InputLabel>
          <Select
            value={{value: this.state.value, label: this.state.value}}
            name={"value"}
            onChange={(option) => this.handleChange(option)}
            options={options}
          />
        </FormControl>
      </form>
    );
  }

  addFilter() {
    let filters = this.props.filters.slice();
    filters.push(this.state.value);
    this.props.changeFilter(filters);
  }

  renderFilterEntry(filter) {
    return <div>{filter}</div>;
  }
}

class RangeConfigurator extends Configurator {
  constructor(props) {
    super(props);
    this.header = 'Rangos';

    this.state['min'] = null;
    this.state['max'] = null;
  }

  addFilter() {
    let filters = this.props.filters.slice();
    filters.push({
      'min': this.state.min,
      'max': this.state.max,
    });
    this.props.changeFilter(filters);
  }

  handleChange(name) {
    return event => {
      this.setState({
        [name]: event.target.value
      });
    };
  }

  renderNewFilterContent() {
    const { classes } = this.props;

    return (
      <form className={classes.form} noValidate autoComplete="off">
        <TextField
          id="standard-number-2"
          label="De"
          value={this.state.min}
          onChange={this.handleChange('min')}
          type="number"
          className={classes.input}
          InputLabelProps={{
            shrink: true,
          }}
          margin="normal"
        />
        <TextField
          id="standard-number-2"
          label="A"
          value={this.state.max}
          onChange={this.handleChange('max')}
          type="number"
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
    return <div> {filter.min} - {filter.max} </div>;
  }
}


CategoricalConfigurator = withStyles(styles, { withTheme: true})(CategoricalConfigurator);
RangeConfigurator = withStyles(styles, { withTheme: true })(RangeConfigurator);


export {
  CategoricalConfigurator,
  RangeConfigurator
};

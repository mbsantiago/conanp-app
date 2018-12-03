import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { uuidv4 } from '../utils';

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

import { CategoricalConfigurator, RangeConfigurator } from './configurators';

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
  constructor(props) {
    super(props);

    this.state = {
      newFilterWindowOpen: false,
      configureFilterWindowOpen: false,
      column: '',
      selectedFilter: null,
    };
  }

  renderHeader() {
    const { classes } = this.props;

    return (
      <>
        <ListItem>
          <ListItemText primary="Filtros" />
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
    let filters = Object.assign({}, this.props.filters);
    delete filters[filterName];
    this.props.changeFilters(filters);
  }

  renderFilterList() {
    const { classes } = this.props;

    let filters = Object.entries(this.props.filters).map((entry) => {
      let [filterName, filter] = entry;

      return (
        <ListItem
          key={filter.column}
          divider={true}
          dense
          button
        >
          <ListItemText primary={filter.column}/>
          <ListItemSecondaryAction>
            <IconButton
              onClick={() => this.setState({selectedFilter: filterName, configureFilterWindowOpen: true})}
              aria-label="Edit"
            >
              <CreateButton />
            </IconButton>
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

    return (
      <ListItem>
        <List className={classes.filterList}>
          {filters}
       </List>
      </ListItem>
    );
  }

  handleAddFilter() {
    if (this.state.column === '' || this.state.column === 'cargando') {
      return null;
    }

    let filters = Object.assign({}, this.props.filters);
    let newFilterName = uuidv4();
    let type = Array.isArray(this.props.columnRanges[this.state.column]) ? 'categorical': 'range';

    filters[newFilterName] = {
      'column': this.state.column,
      'type': type,
      'exclusion': false,
      'filters': [],
    };

    this.props.changeFilters(filters);
    this.setState({
      configureFilterWindowOpen: true,
      newFilterWindowOpen: false,
      selectedFilter: newFilterName,
    });
  }

  handleCloseWindow(windowName) {
    this.setState({[windowName + 'WindowOpen']: false});
  }

  handleChange() {
    return event => {
      this.setState({
        [event.target.name]: event.target.value,
      });
    };
  };

  handleConfigureFilter() {
    this.setState({
      configureFilterWindowOpen: false,
      selectedFilter: null,
    });
  }

  renderAddFilterWindow() {
    const { classes } = this.props;
    let suggestions;

    if (this.props.columnRanges) {
      suggestions = Object.keys(this.props.columnRanges).map(name => (
        <MenuItem value={name} key={name}>{name}</MenuItem>
      ));
    } else {
      suggestions = <MenuItem value={'cargando'}>Cargando...</MenuItem>;;
    }

    return (
      <Dialog
        open={this.state.newFilterWindowOpen}
        onClose={() => this.handleCloseWindow('newFilter')}
        aria-labelledby="form-dialog-title"
        fullWidth={true}
        maxWidth="sm"
      >
        <DialogTitle id="form-dialog-title">Nuevo Filtro</DialogTitle>
        <DialogContent>
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
        <DialogActions>
        <Button onClick={() => this.handleCloseWindow('newFilter')} color="primary">
          Cancelar
        </Button>
        <Button onClick={() => this.handleAddFilter()} color="primary">
          Añadir
        </Button>
        </DialogActions>
      </Dialog>
    );
  }

  changeFilter(config) {
    let filters = Object.assign({}, this.props.filters);
    filters[this.state.selectedFilter].filters = config;
    this.props.changeFilters(filters);
  }

  changeExclusion() {
    let filters = Object.assign({}, this.props.filters);
    let previousValue = filters[this.state.selectedFilter].exclusion;
    filters[this.state.selectedFilter].exclusion = !previousValue;
    this.props.changeFilters(filters);
  }

  renderConfigureFilterWindow() {
    let content;
    if (!this.state.selectedFilter) return null;
    if (Object.keys(this.props.filters).length === 0) return null;

    const filter = this.props.filters[this.state.selectedFilter];
    const column = filter.column;
    const columnInfo = this.props.columnRanges[column];
    const title = (
      <Typography variant="button" gutterBottom>
        {column}
      </Typography>
    );

    if (filter.type === 'categorical') {
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

    return (
      <Dialog
        open={this.state.configureFilterWindowOpen}
        onClose={() => this.handleCloseWindow('configureFilter')}
        aria-labelledby="form-dialog-title"
        fullWidth={true}
        maxWidth="lg"
      >
        <DialogTitle id="form-dialog-title">
          Configurar Filtro {title}
        </DialogTitle>
        <DialogContent>
          {content}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.handleCloseWindow('configureFilter')} color="primary">
            Cancelar
          </Button>
          <Button onClick={() => this.handleConfigureFilter()} color="primary">
            Listo
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.groupFilter}>
        <List className={classes.fullWidth} dense>
          {this.renderHeader()}
          {this.renderFilterList()}
        </List>
        {this.renderAddFilterWindow()}
        {this.renderConfigureFilterWindow()}
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(FilterComponent);

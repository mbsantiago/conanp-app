import React, { Component } from 'react';
import PropTypes from 'prop-types';

// Material UI imports
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import FormGroup from '@material-ui/core/FormGroup';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

// Local imports
import { styles } from '../theme';
import { CategoricalConfigurator } from '../FilterComponent/configurators';


class AggregationComponent extends Component {
  state = {
    value: 0,
  }

  handleChange = (event, value) => {
    this.setState({ value: value });
  };

  changeTemporalAggregator = (field) => {
    let agg = Object.assign({}, this.props.aggregators);
    agg.temporal[field] = !agg.temporal[field];
    this.props.changeAggregators(agg);
  }

  renderTemporalAggregationOptions() {
    const { classes } = this.props;
    const aggregators = this.props.aggregators.temporal;
    const disaggregators = this.props.disaggregators.temporal;

    return (
      <div className={classes.root}>
        <FormControl component="fieldset" className={classes.formControl}>
          <FormLabel component="legend">Fechas</FormLabel>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  value="checkedYear"
                  checked={aggregators.year || disaggregators.year}
                  disabled={disaggregators.year}
                  onChange={() => this.changeTemporalAggregator('year')}
                />
              }
              label="Año"
            />
            <FormControlLabel
              control={
                <Checkbox
                  value="checkedMonth"
                  checked={aggregators.month || disaggregators.month}
                  disabled={disaggregators.month}
                  onChange={() => this.changeTemporalAggregator('month')}
                />
              }
              label="Mes"
            />
            <FormControlLabel
              control={
                <Checkbox
                  value="checkedDay"
                  disabled={disaggregators.day}
                  checked={aggregators.day || disaggregators.day}
                  onChange={() => this.changeTemporalAggregator('day')}
                />
              }
              label="Día"
            />
          </FormGroup>
        </FormControl>
        <FormControl component="fieldset" className={classes.formControl}>
          <FormLabel component="legend">Horarios</FormLabel>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={aggregators.hour || disaggregators.hour}
                  disabled={disaggregators.hour}
                  value="checkedHour"
                  onChange={() => this.changeTemporalAggregator('hour')}
                />
              }
              label="Hora"
            />
          </FormGroup>
        </FormControl>
      </div>
    );
  }

  renderDateTimeAggregator() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <List className={classes.fullWidth}>
          <ListItem divider>
            <ListItemText primary={'Nivel de agregación temporal'}/>
          </ListItem>
          <ListItem>
            {this.renderTemporalAggregationOptions()}
          </ListItem>
        </List>
      </div>
    );
  }

  changeColumnAggregators = (filter) => {
    let agg = Object.assign({}, this.props.aggregators);
    agg.columns = filter.filters;
    this.props.changeAggregators(agg);
  }

  renderColumnAggregator() {
    const { classes } = this.props;
    const filters = {
      type: 'categorical',
      filters: this.props.aggregators.columns.concat(this.props.disaggregators.columns),
    };

    return (
      <div className={classes.root}>
        <List className={classes.fullWidth}>
          <ListItem divider>
            <ListItemText primary={'Agregación por columnas'}/>
          </ListItem>
          <ListItem>
            <CategoricalConfigurator
              filters={filters}
              changeFilter={this.changeColumnAggregators}
              values={Object.keys(this.props.columns)}
              withoutExclusion={true}
              disabledFunc={(column) => this.props.disaggregators.columns.indexOf(column) >= 0}
            />
          </ListItem>
        </List>
      </div>
    );
  }

  render() {
    const value = this.state.value;

    return (
      <div>
        <AppBar position="static" color="default">
          <Tabs
            value={value}
            onChange={this.handleChange}
            indicatorColor="primary"
            textColor="primary"
            fullWidth
          >
            <Tab label="Fecha-Hora" />
            <Tab label="Campos" />
          </Tabs>
        </AppBar>
        {value === 0 && this.renderDateTimeAggregator()}
        {value === 1 && this.renderColumnAggregator()}
      </div>
    );
  }
}


// Prop types validation
AggregationComponent.propTypes = {
  aggregators: PropTypes.object.isRequired,
  disaggregators: PropTypes.object.isRequired,
  changeAggregators: PropTypes.func.isRequired,
  columns: PropTypes.object.isRequired,
  classes: PropTypes.object,
};


export default withStyles(styles, { withTheme: true })(AggregationComponent);

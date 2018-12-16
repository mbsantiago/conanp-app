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

class DisaggregationComponent extends Component {
  state = {
    value: 0,
  }

  handleChange = (event, value) => {
    this.setState({ value: value });
  };

  changeTemporalDisaggregator = (field) => {
    let agg = Object.assign({}, this.props.disaggregators);
    agg.temporal[field] = !agg.temporal[field];
    this.props.changeDisaggregators(agg);
  }

  renderTemporalAggregationOptions() {
    const { classes } = this.props;
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
                  checked={disaggregators.year}
                  onChange={() => this.changeTemporalDisaggregator('year')}
                />
              }
              label="Año"
            />
            <FormControlLabel
              control={
                <Checkbox
                  value="checkedMonth"
                  checked={disaggregators.month}
                  onChange={() => this.changeTemporalDisaggregator('month')}
                />
              }
              label="Mes"
            />
            <FormControlLabel
              control={
                <Checkbox
                  value="checkedDay"
                  checked={disaggregators.day}
                  onChange={() => this.changeTemporalDisaggregator('day')}
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
                  checked={disaggregators.hour}
                  value="checkedHour"
                  onChange={() => this.changeTemporalDisaggregator('hour')}
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
            <ListItemText primary={'Nivel de desagregación temporal'}/>
          </ListItem>
          <ListItem>
            {this.renderTemporalAggregationOptions()}
          </ListItem>
        </List>
      </div>
    );
  }

  changeColumnAggregators = (filter) => {
    let agg = Object.assign({}, this.props.disaggregators);
    agg.columns = filter.filters;
    this.props.changeDisaggregators(agg);
  }

  renderColumnAggregator() {
    const { classes } = this.props;
    const filters = {
      type: 'categorical',
      filters: this.props.disaggregators.columns,
    };

    return (
      <div className={classes.root}>
        <List className={classes.fullWidth}>
          <ListItem divider>
            <ListItemText primary={'Desagregación por columnas'}/>
          </ListItem>
          <ListItem>
            <CategoricalConfigurator
              filters={filters}
              changeFilter={this.changeColumnAggregators}
              values={Object.keys(this.props.columns)}
              withoutExclusion={true}
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
DisaggregationComponent.propTypes = {
  disaggregators: PropTypes.object.isRequired,
  changeDisaggregators: PropTypes.func.isRequired,
  columns: PropTypes.object.isRequired,
  classes: PropTypes.object,
};


export default withStyles(styles, { withTheme: true })(DisaggregationComponent);

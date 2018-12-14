import React, { Component } from 'react';
import PropTypes from 'prop-types';

// Material UI imports
import { withStyles } from '@material-ui/core/styles';
import FilterComponent from '../FilterComponent';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

// Local imports
import DateFilter from './DateFilter';
import { RangeConfigurator } from '../FilterComponent/configurators';


const styles = theme => ({
  root: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
    display: 'flex',
    height: "100%",
    width: "100%",
  },
});


class Filter extends Component {
  state = {value: 0, filters: {}}

  handleChange = (event, value) => {
    this.setState({ value: value });
  };

  handleChangeIndex = index => {
    this.setState({ value: index });
  };

  renderDatePicker() {
    return (
      <DateFilter
        dates={this.props.dates}
        selectedMonths={this.props.selectedMonths}
        unselectAllMonths={this.props.unselectAllMonths}
        selectAllMonths={this.props.selectAllMonths}
        toggleMonth={this.props.toggleMonth}
      />
    );
  }

  renderTimePicker() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <RangeConfigurator
          values={{min: '00:00', max: '23:59'}}
          filters={this.props.timeFilters}
          changeFilter={this.props.changeTimeFilters}
        />
      </div>
    );
  }

  renderFieldFilters() {
    return (
      <FilterComponent
        columnRanges={this.props.dataColumnRanges}
        filters={this.props.dataFilters}
        changeFilters={(filters) => this.props.changeDataFilters(filters)}
      />
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
            <Tab label="Fechas" />
            <Tab label="Horario" />
            <Tab label="Campos" />
          </Tabs>
        </AppBar>
        {value === 0 && this.renderDatePicker()}
        {value === 1 && this.renderTimePicker()}
        {value === 2 && this.renderFieldFilters()}
      </div>
    );
  }
}


// Prop types validation
Filter.propTypes = {
  dataColumnRanges: PropTypes.object,
  dataFilters: PropTypes.object.isRequired,
  changeDataFilters: PropTypes.func.isRequired,
  dates: PropTypes.object.isRequired,
  selectedMonths: PropTypes.object.isRequired,
  unselectAllMonths: PropTypes.func.isRequired,
  selectAllMonths: PropTypes.func.isRequired,
  toggleMonth: PropTypes.func.isRequired,
  classes: PropTypes.object,
  changeTimeFilters: PropTypes.func.isRequired,
  timeFilters: PropTypes.object.isRequired,
};


export default withStyles(styles, { withTheme: true })(Filter);

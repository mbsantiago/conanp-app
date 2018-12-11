import React, { Component } from 'react';
import PropTypes from 'prop-types';

// Material UI imports
import FilterComponent from '../FilterComponent';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';


class Filter extends Component {
  state = {value: 0, filters: {}}

  handleChange = (event, value) => {
    this.setState({ value: value });
  };

  handleChangeIndex = index => {
    this.setState({ value: index });
  };

  renderDatePicker() {
    return null;
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
            <Tab label="Campos" />
          </Tabs>
        </AppBar>
        {value === 0 && this.renderDatePicker()}
        {value === 1 && this.renderFieldFilters()}
      </div>
    );
  }
}


// Prop types validation
Filter.propTypes = {
  dataColumnRanges: PropTypes.object,
  dataFilters: PropTypes.object.isRequired,
  changeDataFilters: PropTypes.func.isRequired,
};


export default Filter;

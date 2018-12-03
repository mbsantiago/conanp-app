import React from 'react';
import AppComponent, { styles } from '../AppComponent';
import { withStyles } from '@material-ui/core/styles';

import FilterComponent from '../FilterComponent';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

const newStyles = theme => {
  let originalStyle = styles(theme);

  let newStyle = {
  };

  return Object.assign(newStyle, originalStyle);
};


class Filter extends AppComponent {
  constructor(props) {
    super(props);
    this.state['value'] = 0;
    this.state['filters'] = {};
  }

  handleChange = (event, value) => {
    this.setState({ value });
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

  renderContent() {
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


export default withStyles(newStyles, { withTheme: true })(Filter);

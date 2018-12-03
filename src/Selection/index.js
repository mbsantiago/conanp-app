import React from 'react';
import AppComponent, { styles } from '../AppComponent';
import { withStyles } from '@material-ui/core/styles';

import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import ListItem from '@material-ui/core/ListItem';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import GroupSelection from './groups';
import FilterComponent from '../FilterComponent';


const newStyles = theme => {
  let originalStyle = styles(theme);

  let newStyle = {
  };

  return Object.assign(newStyle, originalStyle);
};


class SelectionComponent extends AppComponent {

  constructor(props) {
    super(props);

    this.state['value'] = 0;
  }

  handleChange = (event, value) => {
    this.setState({ value });
  };

  handleChangeIndex = index => {
    this.setState({ value: index });
  };

  renderGroups() {
    return (
      <GroupSelection
        groups={this.props.groups}
        selectedGroup={this.props.selectedGroup}
        selectGroup={this.props.selectGroup}
        changeGroupName={this.props.changeGroupName}
        deleteGroup={this.props.deleteGroup}
        newGroup={this.props.newGroup}
        deleteAllGroups={this.props.deleteAllGroups}
      />
    )
  }

  renderFilters() {
    const manualSelection = this.props.groups[this.props.selectedGroup].manualSelection;
    const filters = this.props.groups[this.props.selectedGroup].filters;

    return (
      <>
        <ListItem>
          <FormGroup row>
          <FormControlLabel
            control={
              <Switch
                checked={manualSelection}
                onChange={() => this.props.changeManualSelection()}
                value="checkedA"
              />
            }
            label="Selección Manual"
          />
          </FormGroup>
        </ListItem>
        <FilterComponent
          columnRanges={this.props.pointColumnRanges}
          filters={filters}
          changeFilters={(filters) => this.props.changeFilters(this.props.selectedGroup, filters)}
          disabled={manualSelection}
        />
      </>
    );
  }

  renderSummary() {
    return <div> Resumen </div>;
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
            <Tab label="Grupos" />
            <Tab label="Filtrar" />
            <Tab label="Resumen" />
          </Tabs>
        </AppBar>
        {value === 0 && this.renderGroups()}
        {value === 1 && this.renderFilters()}
        {value === 2 && this.renderSummary()}
      </div>
    );
  }

}


export default withStyles(newStyles, { withTheme: true })(SelectionComponent);

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


// Material UI style classes
const newStyles = theme => {
  let originalStyle = styles(theme);
  let newStyle = {};
  return Object.assign(newStyle, originalStyle);
};


class SelectionComponent extends AppComponent {

  constructor(props) {
    super(props);

    // Add selected tab to state of component
    this.state['selectedTab'] = 0;
  }

  handleChange = (event, value) => this.setState({ selectedTab: value });

  handleChangeIndex = index => this.setState({ selectedTab: index });

  renderGroups() {
    // Group tab rendering
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
    // Filter tab rendering
    const manualSelection = this.props.groups[this.props.selectedGroup].manualSelection;
    const filters = this.props.groups[this.props.selectedGroup].filters;

    return (
      <>
        {/* Row for switch to select if manual selection is active */}
        <ListItem>
          <FormGroup row>
          <FormControlLabel
            control={
              <Switch
                checked={manualSelection}
                onChange={this.props.changeManualSelection}
                value="checkedA"
              />
            }
            label="Selección Manual"
          />
          </FormGroup>
        </ListItem>

        {/* Render filter component */}
        {/* The filter component only acts on the selected group filters */}
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
    // Summary tab rendering
    return <div> Resumen </div>;
  }

  renderContent() {
    // Main render method.
    const selectedTab = this.state.selectedTab;

    return (
      <div>
        {/* A bar with tabs to select different views */}
        <AppBar position="static" color="default">
          <Tabs
            value={selectedTab}
            onChange={this.handleChange}
            indicatorColor="primary"
            textColor="primary"
            fullWidth
          >
            {/* Tabs */}
            <Tab label="Grupos" />
            <Tab label="Filtrar" />
            <Tab label="Resumen" />
          </Tabs>
        </AppBar>

        {/* Only render the selected tab */}
        {selectedTab === 0 && this.renderGroups()}
        {selectedTab === 1 && this.renderFilters()}
        {selectedTab === 2 && this.renderSummary()}
      </div>
    );
  }
}


export default withStyles(newStyles, { withTheme: true })(SelectionComponent);

import React, { Component } from 'react';

// Material UI imports
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

// Local imports
import * as config from './config';
import { styles } from '../theme';


// Material UI styling
//const styles = theme => ({
  //root: {
    //...theme.mixins.gutters(),
    //paddingTop: theme.spacing.unit * 2,
    //paddingBottom: theme.spacing.unit * 2,
    //display: 'flex',
    //height: "100%",
    //width: "100%",
  //},
  //list: {
    //overflow: 'auto',
    //width: '100%',
    //maxheight: theme.maxheight,
  //}
//});

class AggregationComponent extends Component {
  state = {
    value: 0,
    temporalAggregator: config.defaultTemporalScale,
    columnAggregators: [],
  }

  handleChange = (event, value) => {
    this.setState({ value: value });
  };

  renderDateTimeAggregator() {
    const { classes } = this.props;

    const temporalAggregatorsList = (
      Object.keys(config.temporalScales).map(name => {
        let aggregator = config.temporalScales[name];
        return (
          <ListItem button divider
            onClick={() => this.setState({temporalAggregator: aggregator})}
            selected={aggregator === this.state.temporalAggregator}
            key={name}
          >
            <ListItemText primary={name} />
          </ListItem>
        );
      })
    );

    return (
      <div className={classes.root}>
        <List className={classes.list}>
          <ListItem divider>
            <ListItemText primary={'Nivel de agregación temporal'}/>
          </ListItem>
          <ListItem>
            <List className={classes.list}>
              {temporalAggregatorsList}
            </List>
          </ListItem>
        </List>
      </div>
    );
  }

  renderColumnAggregator() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        COLUMN
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


export default withStyles(styles, { withTheme: true })(AggregationComponent);

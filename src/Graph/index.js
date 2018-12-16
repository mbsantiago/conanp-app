import React, { Component } from 'react';
import PropTypes from 'prop-types';

// Material UI imports
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import LinearProgress from '@material-ui/core/LinearProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

// Local imports
import { styles } from '../theme';
import Graphs from './Graphs';


class GraphComponent extends Component {
  state = {
    selectedGraph: null,
    menu: null,
    loading: true,
    filtering: true,
    grouping: false,
  }

  async filterData() {
    return this.props.getFilteredData();
  }

  async groupData(data) {
    return this.props.getGroupedData(data);
  }

  async processData() {
    this.setState({loading: true, filtering: true}, async () => {
      this.filterData().then((data) => {
        this.setState({filtering: false, grouping: true}, async () => {
          this.groupData(data).then(groupedData => {
            this.setState({grouping: false, loading: false}, () => {
              this.graphData = groupedData;
            });
          });
        });
      });
    });
  }

  componentDidMount() {
    this.processData();
  }

  closeMenu = () => {
    this.setState({ menu: null });
  };

  openMenu = event => {
    this.setState({ menu: event.currentTarget });
  };

  selectGraph = (index) => this.setState({selectedGraph: index});

  renderMenu() {
    return Graphs.map((graph, index) => (
      <MenuItem
        onClick={() => this.selectGraph(index)}
        key={`Graph-${graph}`}
      >
        {graph}
      </MenuItem>
    ));
  }

  renderGraph() {
    return <div> Gráfica </div>;
  }

  renderLoadingBar() {
    const { classes } = this.props;
    return (
      <List className={classes.fullWidth}>
        <ListItem>
          <ListItemText style={{width: '10%'}} primary={'Filtrando'}/>
          <div className={classes.flexGrow}>
            <LinearProgress
              color='primary'
              value={this.state.filtering ? null : 100}
              variant={this.state.filtering ? 'indeterminate' : 'determinate'}
            />
          </div>
        </ListItem>
        <ListItem>
          <ListItemText style={{width: '10%'}} primary={'Agrupando'}/>
          <div className={classes.flexGrow}>
            <LinearProgress
              color='secondary'
              value={this.state.grouping ? null : 0}
              variant={this.state.grouping ? 'indeterminate' : 'determinate'}
            />
          </div>
        </ListItem>
      </List>
    );
  }

  renderContent() {
    if (this.state.loading) {
      return this.renderLoadingBar();
    } else {
      return this.renderGraph();
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.flewGrow}>
        <AppBar position="static" color="default">
          <Toolbar>
            <Button
              aria-owns={this.state.menu ? 'simple-menu' : undefined}
              aria-haspopup="true"
              onClick={this.openMenu}
            >
              Seleccionar gráfica
            </Button>
            <Menu
              id="simple-menu"
              anchorEl={this.state.menu}
              open={Boolean(this.state.menu)}
              onClose={this.closeMenu}
            >
              {this.renderMenu()}
            </Menu>
            <Typography>
              {Graphs[this.state.selectedGraph]}
            </Typography>
            <Button
              variant="text"
              color="primary"
              aria-label="Add"
              className={classes.button}
              onClick={() => this.processData()}
            >
              <AutorenewIcon className={classes.extendedIcon}/>
            </Button>
          </Toolbar>
        </AppBar>
        <div className={classes.root}>
          {this.renderContent()}
        </div>
      </div>
    );
  }
}

// Prop types validation
GraphComponent.propTypes = {
  classes: PropTypes.object,
  getFilteredData: PropTypes.func.isRequired,
  getGroupedData: PropTypes.func.isRequired,
};

export default withStyles(styles, { withTheme: true })(GraphComponent);

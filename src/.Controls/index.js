import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Collapse from '@material-ui/core/Collapse';
import MenuIcon from '@material-ui/icons/Menu';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Grid from '@material-ui/core/Grid';
import './index.css';

import Groups from './groups';


const menuOptions = ['Grupos', 'Filtrar', 'Fechas', 'Resumen'];

const styles = {
  menuButton: {
    marginLeft: -18,
    marginRight: 10,
  },
  container: {
    display: 'flex',
    width: "100%",
    "background-color": 'white',
    opacity: 0.8,
  },
};


class Controls extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      open: false,
      menu: menuOptions[0],
    };
  }

  handleMenuButton() {
    this.setState(state => ({ open: !state.open }));
  }

  renderToolbar() {
    const { classes } = this.props;
    return (
      <AppBar position="static">
        <Toolbar variant="dense">
          <IconButton
            className={classes.menuButton}
            onClick={() => this.handleMenuButton()}
            color="inherit"
            aria-label="Menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" color="inherit">
            Selección
          </Typography>
        </Toolbar>
      </AppBar>
    );
  }

  renderLeftContent(){
    let listItems = menuOptions.map(option => (
      <ListItem button divider key={option} onClick={() => this.setState({menu: option})}>
        <ListItemText primary={option} />
      </ListItem>
    ));
    return (
      <List component="nav">
        {listItems}
      </List>
    );
  }

  renderRightContent() {
    if (this.state.menu === 'Grupos') {
      return <Groups groupNames={this.props.groupNames}/>;
    }
  }

  renderContent() {
    const { classes } = this.props;
    return (
      <div className={classes.container}>
        <Collapse in={this.state.open}>
          <Grid container className={classes.root} spacing={8}>
            <Grid item xs={12}>
              <Grid container className={classes.demo} justify="center" spacing={8}>
                <Grid item>
                  {this.renderLeftContent()}
                </Grid>
                <Grid item>
                  {this.renderRightContent()}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Collapse>
      </div>);
  }

  render() {
    return (
      <div className='Controls'>
        {this.renderToolbar()}
        {this.renderContent()}
      </div>
    );
  }
}

Controls.propTypes = {
  classes: PropTypes.object.isRequired,
  groupNames: PropTypes.object.isRequired,
};

export default withStyles(styles)(Controls);

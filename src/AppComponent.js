import React, { Component } from 'react';

import Toolbar from '@material-ui/core/Toolbar';
import AppBar from '@material-ui/core/AppBar';
import Fade from '@material-ui/core/Fade';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import ClearIcon from '@material-ui/icons/Clear';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import Typography from '@material-ui/core/Typography';


const styles = theme => ({
  root: {
    display: 'flex',
  },
  button: {
    position: 'absolute',
  },
  content: {
    paddingBottom: theme.spacing.unit * 2,
    position: 'absolute',
    flexGrow: 1,
  },
  grow: {
    flexGrow: 1,
  },
});


class AppComponent extends Component {

  constructor(props) {
    super(props)

    this.config = props.config;

    this.state = {
      expanded: false,
    };

  }

  renderContent() {

    return null;

  }

  handleClickToggle() {
    this.props.handleToggle();
  }

  handleClose() {
    this.props.handleClose();
  }

  handleExpand() {
    this.setState(state => ({ expanded: !state.expanded }));
  }

  getPaperStyle() {
    let width = this.state.expanded ? '90vw' : this.config.contentWidth;

    return {
      top: this.config.contentTop,
      left: this.config.contentLeft,
      width: width,
    };
  }


  getButtonStyle() {
    let style = {
      top: this.config.top,
    };
    if (this.config.alignment === 'right') {
      style['right'] = -10;
    } else {
      style['left'] = -10;
    }
    return style;
  }

  renderContentContainer() {

    const { classes } = this.props;

    const paperStyle = this.getPaperStyle();

    if (this.props.open) {
      return (
        <Fade in={true}>
          <Paper
            className={classes.content}
            elevation={1}
            style={paperStyle}
          >
            <AppBar position='static'>
              <Toolbar>
                <Typography variant="h6" color="inherit" className={classes.grow}>
                  {this.config.name}
                </Typography>
                <Button
                color="inherit"
                onClick={() => this.handleExpand()}
                autoFocus
                >
                  {this.state.expanded ? <FullscreenExitIcon color="inherit"/> : <FullscreenIcon color="inherit"/>}
                </Button>
                <Button
                  color="inherit"
                  onClick={() => this.handleClose()}
                  autoFocus
                >
                  <ClearIcon color="inherit"/>
                </Button>
              </Toolbar>
            </AppBar>
            {this.renderContent()}
          </Paper>
        </Fade>
      );

    } else {
      return null;
    }
  }

  render() {
    const { classes } = this.props;

    const buttonStyle = this.getButtonStyle();
    return (
      <div>
        <Button
          style={buttonStyle}
          variant="contained"
          color="primary"
          className={classes.button}
          onClick={() => this.handleClickToggle()}
        >
          {this.config.name}
        </Button>
        {this.renderContentContainer()}
      </div>
    );
  }
}


export default AppComponent;
export { styles };

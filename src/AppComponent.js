import React, { Component } from 'react';
import PropTypes from 'prop-types';

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

  state = {expanded: false}

  renderContent() {
    // Main interfase for class. Any child must implement
    // this method. This will render in the components page.
    return null;
  }

  handleExpand() {
    // Expand then component window to full width
    this.setState(state => ({ expanded: !state.expanded }));
  }

  getPaperStyle(){
    // Set window width. Max if expanded, otherwise configuration.
    let width = this.state.expanded ?
      '90vw':
      this.props.config.contentWidth;

    return {
      zIndex: 1,
      top: this.props.config.contentTop,
      left: this.props.config.contentLeft,
      width: width,
    };
  }

  getButtonStyle() {
    // Buttons can be placed on the right or left hand side of the
    // window. This is set by the aligment option in the configuration.
    let style = {top: this.props.top, zIndex: 0};
    if (this.props.config.alignment === 'right') {
      style['right'] = 0;
    } else {
      style['left'] = 0;
    }

    return style;
  }

  renderContentContainer() {
    // Early exit if component not open.
    if (!this.props.open) return null;

    const { classes } = this.props;
    const paperStyle = this.getPaperStyle();

    // Select icon for expansion/contraction button.
    const expansionIcon = this.state.expanded ?
      <FullscreenExitIcon color="inherit"/> :
      <FullscreenIcon color="inherit"/>;

    return (
      <Fade in={true}>
        <Paper
          className={classes.content}
          elevation={1}
          style={paperStyle}
        >
          {/* Bar with title and nav buttons */}
          <AppBar position='static'>
            <Toolbar>
              {/* Title */}
              <Typography variant="h6" color="inherit" className={classes.grow}>
                {this.props.name}
              </Typography>

              {/* Expand button */}
              <Button
                color="inherit"
                onClick={() => this.handleExpand()}
                autoFocus
              >
                {expansionIcon}
              </Button>

              {/* Closing button */}
              <Button
                color="inherit"
                onClick={() => this.props.handleClose()}
                autoFocus
              >
                <ClearIcon color="inherit"/>
              </Button>

            </Toolbar>
          </AppBar>

          {/* Main content of component (Must be implemented by children classes) */}
          {this.renderContent()}
        </Paper>
      </Fade>
    );
  }

  render() {
    const { classes } = this.props;

    return (
      <div>
        {/* Button for opening/closing the component's window */}
        <Button
          style={this.getButtonStyle()}
          variant="contained"
          color="primary"
          className={classes.button}
          onClick={this.props.handleToggle}
        >
          {this.props.name}
        </Button>
        {/* Components Content */}
        {this.renderContentContainer()}
      </div>
    );
  }
}

// Enforcing prop types
AppComponent.propTypes = {
  handleToggle: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
  top: PropTypes.string.isRequired,
  shapes: PropTypes.array,
  addPoint: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  classes: PropTypes.obj
};


export default AppComponent;
export { styles };

import React, { Component } from 'react';
import PropTypes from 'prop-types';

// Material UI imports
import { withStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import AppBar from '@material-ui/core/AppBar';
import Fade from '@material-ui/core/Fade';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import ClearIcon from '@material-ui/icons/Clear';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import Typography from '@material-ui/core/Typography';

// Local imports
import * as config from './config';


// Material UI styling
const styles = theme => ({
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


class AppMenu extends Component {

  state = {expanded: false, selectedChildren: null}

  selectChildren(index) {
    this.setState(state => ({
      selectedChildren: state.selectedChildren === index ? null: index
    }));
  }

  handleExpand() {
    // Expand then component window to full width.
    this.setState(state => ({ expanded: !state.expanded }));
  }

  getPaperStyle(){
    // Set window width. Max if expanded, otherwise 
    // use configuration default.
    let width = this.state.expanded ?
      '90vw':
      config.contentWidth;

    return {
      zIndex: 1,
      top: config.contentTop,
      left: config.contentLeft,
      width: width,
    };
  }

  getButtonStyle() {
    // Buttons can be placed on the right or left hand side of the
    // window. This is set by the aligment option in the configuration.
    let style = {zIndex: 0};
    if (config.alignment === 'right') {
      style['right'] = 0;
    } else {
      style['left'] = 0;
    }

    return style;
  }

  renderContentContainer() {
    // Early exit if component not open.
    if (this.state.selectedChildren === null) return null;
    const { classes } = this.props;

    // Select icon for expansion/contraction button.
    const expansionIcon = this.state.expanded ?
      <FullscreenExitIcon color="inherit"/> :
      <FullscreenIcon color="inherit"/>;

    // Only render selected children
    const selectedChildren = this.props.children[this.state.selectedChildren];

    // Render a window with Title and navigation bar and children
    // content.
    return (
      <Fade in={true}>
        <Paper
          className={classes.content}
          elevation={1}
          style={this.getPaperStyle()}
        >
          {/* Bar with title and nav buttons */}
          <AppBar position='static'>
            <Toolbar>
              {/* Title */}
              <Typography variant="h6" color="inherit" className={classes.grow}>
                {selectedChildren.key}
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
                onClick={() => this.setState({selectedChildren: null})}
                autoFocus
              >
                <ClearIcon color="inherit"/>
              </Button>

            </Toolbar>
          </AppBar>

          {/* Main content of component */}
          {selectedChildren}
        </Paper>
      </Fade>
    );
  }

  renderButtons() {
    const { classes } = this.props;

    // Choosing height at witch to draw buttons
    const startAt = this.props.height * (config.startFromTop / 100);
    const changeInTop = Math.max(this.props.height / 18, config.minSpacing);

    // Generate a button for each children.
    const buttons = this.props.children.map((children, index) => {
      // Get base style
      let style = this.getButtonStyle();

      // Add height for rendering
      style['top'] = startAt + index * changeInTop;

      return (
        <Button
          key={children.key}
          color='primary'
          variant='contained'
          style={style}
          className={classes.button}
          onClick={() => this.selectChildren(index)}
        >
          {/* Use key as button content */}
          {children.key}
        </Button>
      );
    });

    return buttons;
  }

  render() {
    return (
      <div>
        {/* Button for opening/closing the component's window */}
        {this.renderButtons()}

        {/* Components Content */}
        {this.renderContentContainer()}
      </div>
    );
  }
}

// Prop types validation
AppMenu.propTypes = {
  classes: PropTypes.object,
  height: PropTypes.number.isRequired,
  children: PropTypes.array.isRequired,
};


export default withStyles(styles, { withTheme: true})(AppMenu);

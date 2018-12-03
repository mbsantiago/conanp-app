import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';


const styles = {
  menuButton: {
    marginLeft: -18,
    marginRight: 10,
  },
  container: {
    display: 'flex',
  },
};


class Groups extends React.Component {
  renderFields() {
    const { classes } = this.props;
    let fields = Object.keys(this.props.groupNames).map((groupName) => {
      return (
        <TextField
          key={'group' + groupName}
          className={classes.textField}
          value={groupName}
          margin="normal"
          variant="outlined"
        />);
    });
    return (
      <Paper>
        <form className={classes.container} noValidate autoComplete="off">
          {fields}
        </form>
      </Paper>
    );
  }

  renderOptions() {
    return <div> Hola </div>;
  }

  render() {
    const { classes } = this.props;
    return (
      <Grid container className={classes.root} spacing={8}>
        <Grid item xs={12}>
          <Grid container className={classes.demo} justify="center" spacing={8}>
            <Grid item>
              {this.renderOptions()}
            </Grid>
            <Grid item>
              {this.renderFields()}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

Groups.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Groups);

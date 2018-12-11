import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import CreateButton from '@material-ui/icons/Create';
import RemoveButton from '@material-ui/icons/Remove';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';


const styles = theme => ({
  groupList: {
    overflow: 'auto',
    maxHeight: '35vh',
    width: '100%',
  },
  fullWidth: {
    width: "100%",
  },
  groupSelection: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
    display: 'flex',
    height: "100%",
  },
  buttonContainer: {
    margin: 'auto',
    height: '100%',
  }
});


class GroupSelection extends Component {
  state = {dialogOpen: false, text: ''}

  handleCloseDialog = () => this.setState({dialogOpen: false})

  handleOpenDialog = (group) => {
    // Do when group is edited.
    this.props.selectGroup(group);
    this.setState({dialogOpen: true, text: ''});
  }

  handleNameChange = () => {
    // Do when changing names is finished.
    this.props.changeGroupName(this.props.selectedGroup, this.state.text);
    this.setState({dialogOpen: false});
  }

  renderGroupList() {
    const { classes } = this.props;

    // Generate JSX elements for each group.
    let groupListObjects = Object.entries(this.props.groups).map((item) => {
      // Unpack name and info.
      let [group, info] = item;

      // Create JSX List Item for group item.
      return (
        <ListItem
          key={group}
          divider={true}
          selected={group === this.props.selectedGroup}
          dense button
          onClick={() => this.props.selectGroup(group)}
        >
          {/* Group name */}
          <ListItemText primary={`${info.name}`} />

          {/* Buttons */}
          <ListItemSecondaryAction>

            {/* Change name button */}
            <IconButton
              onClick={() => this.handleOpenDialog(group)}
              aria-label="Comments"
            >
              <CreateButton />
            </IconButton>

            {/* Delete group button*/}
            <IconButton
              onClick={() => this.props.deleteGroup(group)}
              aria-label="Comments"
            >
              <RemoveButton />
            </IconButton>
          </ListItemSecondaryAction>

        </ListItem>
      );
    });

    return (
      <List className={classes.groupList}> {groupListObjects} </List>
    );

  }

  renderChangeNameDialog() {
    // Render a pop-up window asking for name change
    return (
      <Dialog
        open={this.state.dialogOpen}
        onClose={this.handleCloseDialog}
        aria-labelledby="form-dialog-title"
      >
        {/* Title */}
        <DialogTitle id="form-dialog-title">Cambiar nombre</DialogTitle>

        {/* Content. Text field for name changing. */}
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Nombre"
            type="text"
            onChange={(event) => this.setState({ text: event.target.value })}
            fullWidth
          />
        </DialogContent>

        {/* Buttons */}
        <DialogActions>
          <Button onClick={this.handleCloseDialog} color="primary">
            Cancelar
          </Button>
          <Button onClick={this.handleNameChange} color="primary">
            Cambiar
          </Button>
        </DialogActions>

      </Dialog>
    );
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.groupSelection}>
        {/* List component to create rows */}
        <List className={classes.fullWidth} dense>

          {/* First row with subwindow title and add/delete group buttons*/}
          <ListItem>
            <ListItemText primary="Grupos" />

            {/* Add new group button*/}
            <Button
              variant="text"
              color="primary"
              aria-label="Add"
              className={classes.button}
              onClick={() => this.props.newGroup()}
            >
              <AddIcon className={classes.extendedIcon}/>
            </Button>

            {/* Delete all groups button */}
            <Button
              variant="text"
              color="secondary"
              aria-label="Delete"
              className={classes.button}
              onClick={() => this.props.deleteAllGroups()}
            >
              <DeleteIcon className={classes.extendedIcon}/>
            </Button>

          </ListItem>

          <Divider/>

          {/* New row for group list */}
          <ListItem>
            {this.renderGroupList()}
          </ListItem>
        </List>

        {/* Pop up window for name changing */}
        {this.renderChangeNameDialog()}
      </div>
    );
  }

}

export default withStyles(styles, { withTheme: true })(GroupSelection);

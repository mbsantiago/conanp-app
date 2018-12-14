import React, { Component } from 'react';
import PropTypes from 'prop-types';

// Material UI imports
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import LibraryAddIcon from '@material-ui/icons/LibraryAdd';
import DeleteIcon from '@material-ui/icons/Delete';


const MONTHS = {
  1: 'Enero',
  2: 'Febrero',
  3: 'Marzo',
  4: 'Abril',
  5: 'Mayo',
  6: 'Junio',
  7: 'Julio',
  8: 'Agosto',
  9: 'Septiembre',
  10: 'Octubre',
  11: 'Noviembre',
  12: 'Diciembre',
};


const styles = theme => ({
  root: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
    display: 'flex',
    height: "100%",
    width: "100%",
  },
  fullWidth: {
    width: "100%",
  },
  button: {
    margin: theme.spacing.unit,
  },
  extendedIcon: {
    marginRight: theme.spacing.unit,
  },
  filterList: {
    overflow: 'auto',
    maxHeight: '35vh',
    width: '100%',
  }
});


class DateFilter extends Component {
  renderHeader() {
    const { classes } = this.props;
    return (
      <>
        <ListItemText primary='Meses disponibles'/>
        {/* Add all months button */}
        <Button
          variant="text"
          color="primary"
          aria-label="Add"
          className={classes.button}
          onClick={this.props.selectAllMonths}
        >
          <LibraryAddIcon className={classes.extendedIcon}/>
        </Button>

        {/* Remove all months button */}
        <Button
          variant="text"
          color="secondary"
          aria-label="Delete"
          className={classes.button}
          onClick={this.props.unselectAllMonths}
        >
          <DeleteIcon className={classes.extendedIcon}/>
        </Button>
      </>
    );
  }

  renderMonthList() {
    const availableDates = {};
    this.props.dates.forEach(date => {
      let [year, month, ] = date.split('-');
      if (!(year in availableDates)) availableDates[year] = new Set();
      availableDates[year].add(month);
    });

    let years = Object.keys(availableDates);
    years.sort();

    let rows = [];
    years.forEach(year => {
      let months = Array.from(availableDates[year]);
      months.sort((a, b) => parseInt(a) - parseInt(b));

      let newRows = months.map(month => (
        <ListItem key={`${year}-${month}`} divider={true}>
          <ListItemText primary={MONTHS[month]} />
          <Checkbox
            onChange={() => this.props.toggleMonth(`${year}-${month}`)}
            checked={this.props.selectedMonths.has(`${year}-${month}`)}
          />
        </ListItem>
      ));

      let subsection = (
        <li key={`section-${year}`}>
          <ul>
            <ListSubheader>{year}</ListSubheader>
            {newRows}
          </ul>
        </li>
      );
      rows.push(subsection);
    });

    const { classes } = this.props;
    return (
      <List className={classes.filterList} dense>
        {rows}
      </List>
    );
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <List className={classes.fullWidth}>
          <ListItem>
            {this.renderHeader()}
          </ListItem>
          <Divider/>
          <ListItem>
            {this.renderMonthList()}
          </ListItem>
        </List>
      </div>
    );
  }
}


// Prop types validation
DateFilter.propTypes = {
  selectAllMonths: PropTypes.func.isRequired,
  unselectAllMonths: PropTypes.func.isRequired,
  toggleMonth: PropTypes.func.isRequired,
  selectedMonths: PropTypes.object.isRequired,
  dates: PropTypes.object.isRequired,
  classes: PropTypes.object,
};


export default withStyles(styles, { withTheme: true })(DateFilter);

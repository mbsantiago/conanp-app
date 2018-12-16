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

// Local imports
import { styles } from '../theme';


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


class DateFilter extends Component {
  selectAllMonths = (dates) => {
    let months = new Set();

    for (let date of dates) {
      let [year, month, ] = date.split('-');
      months.add(`${year}-${month}`);
    }

    this.props.changeDateFilters(months);
  }

  unselectAllMonths = () => {
    this.props.changeDateFilters(new Set());
  }

  toggleMonth = (month) => {
    let months = new Set(this.props.dateFilters);

    if (months.has(month)) {
      months.delete(month);
    } else {
      months.add(month);
    }

    this.props.changeDateFilters(months);
  }

  renderHeader(dates) {
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
          onClick={() => this.selectAllMonths(dates)}
        >
          <LibraryAddIcon className={classes.extendedIcon}/>
        </Button>

        {/* Remove all months button */}
        <Button
          variant="text"
          color="secondary"
          aria-label="Delete"
          className={classes.button}
          onClick={this.unselectAllMonths}
        >
          <DeleteIcon className={classes.extendedIcon}/>
        </Button>
      </>
    );
  }

  renderMonthList(dates) {
    const availableDates = {};

    dates.forEach(date => {
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
            onChange={() => this.toggleMonth(`${year}-${month}`)}
            checked={this.props.dateFilters.has(`${year}-${month}`)}
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
      <List className={classes.list} dense>
        {rows}
      </List>
    );
  }

  render() {
    const { classes } = this.props;
    const dates = this.props.getDates();

    return (
      <div className={classes.root}>
        <List className={classes.fullWidth}>
          <ListItem>
            {this.renderHeader(dates)}
          </ListItem>
          <Divider/>
          <ListItem>
            {this.renderMonthList(dates)}
          </ListItem>
        </List>
      </div>
    );
  }
}


// Prop types validation
DateFilter.propTypes = {
  changeDateFilters: PropTypes.func.isRequired,
  dateFilters: PropTypes.object.isRequired,
  getDates: PropTypes.func.isRequired,
  classes: PropTypes.object,
};


export default withStyles(styles, { withTheme: true })(DateFilter);

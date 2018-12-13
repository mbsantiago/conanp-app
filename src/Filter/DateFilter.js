import React, { Component } from 'react';
import PropTypes from 'prop-types';

// Material UI imports
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


class DateFilter extends Component {
  renderHeader() {
    return (
      <>
        <ListItemText
          primary={'Meses disponibles'}
        />
        {/* Add all months button */}
        <Button
          variant="text"
          color="primary"
          aria-label="Add"
          onClick={this.props.selectAllMonths}
        >
          <LibraryAddIcon/>
        </Button>

        {/* Remove all monts button */}
        <Button
          variant="text"
          color="secondary"
          aria-label="Delete"
          onClick={this.props.unselectAllMonths}
        >
          <DeleteIcon/>
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

    return (
      <List style={{width: '100%', overflow: 'auto', maxHeight: '40vh'}} dense>
        {rows}
      </List>
    );
  }

  render() {
    return (
      <div>
        <List>
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
};


export default DateFilter;

import * as config from './config';

function load(url, callback) {
  // Async get data
  return fetch(url)
    .then(response => {
      if (response.ok) {
        // Return in json format
        return response.json();
      } else {
        throw Error(response.statusText + url);
      }
    })
    .then(data => {
      // Do something to the loaded data
      if (data != null) callback(data);
    });
}


function uuidv4() {
  /* Random ID generator */
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : ((r & 0x3) | 0x8);
    return v.toString(16);
  });
}


function filterData(data, filters, mappings) {
  // Early exit if no data is given.
  if (!data) return null;

  // Empty mapping object if no mappings are given.
  if (!mappings) {
    mappings = {
      columns: {},
      mapping: {},
    };
  }

  // Loop over all data. Select only those which return true.
  let filteredData = data.filter(datum => {
    let selected = true;

    for (let filterName in filters) {
      let filter = filters[filterName];

      // Use mapping if needed
      let value;
      if (filter.column in mappings.columns) {
        let column = mappings.columns[filter.column];
        let columnValue = datum[column];

        if (columnValue in mappings.mapping) {
          value = mappings.mapping[columnValue][filter.column];
        } else {
          value = '';
        }
      } else {
        value = datum[filter.column];
      }

      // Handle the categorical case
      if (filter.type === 'categorical') {

        // When the filter is exclusive
        if (filter.exclusion) {
          if (filter.filters.indexOf(value) >= 0) {
            selected = false;
            break;
          }

        // And when its inclusive
        } else {
          if (filter.filters.indexOf(value) < 0) {
            selected = false;
            break;
          }
        }
      } else {
        // Now handle the range case
        // Cast possible string values to float and reject when impossible
        value = parseFloat(value);
        if (isNaN(value)) {
          selected = false;
          break;
        }

        // When the filter is exclusive
        if (filter.exclusion) {
          for (let index = 0; index < filter.filters.length; index++) {
            let subfilter = filter.filters[index];

            if ((subfilter.min <= value) && (value <= subfilter.max)) {
              selected = false;
              break;
            }
          }

        // And when its inclusive
        } else {
          let subselected = false;
          for (let index = 0; index < filter.filters.length; index++) {
            let subfilter = filter.filters[index];

            if ((subfilter.min <= value) && (value <= subfilter.max)) {
              subselected = true;
              break;
            }
          }

          selected = subselected;
        }

        // Exit early from loop if datum didn't satisfy a filter's condition
        if (!selected) break;
      }
    }

    return selected;
  });

  return filteredData;
}


function filterDataByDateTime(data, timeFilters, months) {
  // Do not filter if no filters are found
  if (months.size === 0 && timeFilters.filters.lenght === 0) return data;

  // Create a filter function for date filters
  let dateFilter;
  if (months.size === 0) {
    // Trivial filter function if no date filters are found
    dateFilter = () => true;
  } else {
    // Filter datum if falls within selected months
    dateFilter = (datum) => {
      let [year, month, ] = datum[config.DATE_COL].split('-');
      let date = `${year}-${month}`;
      return months.has(date);
    };
  }

  // Create a filter function for time filters
  let timeFilter;
  if (timeFilters.filters.length === 0) {
    // Trivial filter function if no time filters are found
    timeFilter = () => true;
  } else {
    // Filter datum if it falls in the range of selected filters
    let timeFilterFunc = (datum) => {
      // Parse date column
      let [hour, minute, ] = datum[config.TIME_COL].split(':');
      let time = new Date(2000, 0, 0, hour, minute);
      let minTime = new Date(2000, 0, 0, 0, 0);
      let maxTime = new Date(2000, 0, 0, 0, 0);

      // Check if time indicated falls within the selected time intervals
      let isIn = false;
      for (let i=0; i < timeFilters.filters.length; i++) {
        // Parse time filters
        let {min, max} = timeFilters.filters[i];
        let [minHour, minMin] = min.split(':');
        let [maxHour, maxMin] = max.split(':');

        // Use Date objects for comparison
        minTime.setHours(minHour);
        minTime.setMinutes(minMin);
        maxTime.setHours(maxHour);
        maxTime.setMinutes(maxMin);

        // Check if it falls in the selected time interval
        if ((minTime <= time) && (time <= maxTime)) {
          isIn = true;
          break;
        }
      }

      return isIn;
    };

    // Modify the filter function if time filter is exclusive
    if (timeFilters.exclusion) {
      timeFilter = (datum) => !timeFilterFunc(datum);
    } else {
      timeFilter = timeFilterFunc;
    }
  }

  return data.filter(datum => timeFilter(datum) && dateFilter(datum));
}


function getDates(data) {
  let dates = new Set(data.map(datum => datum[config.DATE_COL]));
  return dates;
}


function groupData(data, disaggregators, aggregators, mappings) {
  let groupedData = {};
  let aggCols = aggregators.columns;
  let disCols = disaggregators.columns;
  let aggTmp = aggregators.temporal;
  let disTmp = disaggregators.temporal;

  data.forEach(datum => {
    let [year, month, day] = datum[config.DATE_COL].split('-');
    let hour = datum[config.TIME_COL].split(':')[0];

    let disGroupList = [];
    let aggGroupList = [];
    let disGroup = {};
    let aggGroup = {};

    if (disTmp.year) {
      disGroupList.push(year);
      disGroup['year'] = year;
    }
    if (disTmp.month) {
      disGroupList.push(month);
      disGroup['month'] = month;
    }
    if (disTmp.day) {
      disGroupList.push(day);
      disGroup['day'] = day;
    }
    if (disTmp.hour) {
      disGroupList.push(hour);
      disGroup['hour'] = hour;
    }

    if (aggTmp.year || disTmp.year) {
      aggGroupList.push(year);
      aggGroup['year'] = year;
    }
    if (aggTmp.month || disTmp.month) {
      aggGroupList.push(month);
      aggGroup['month'] = month;
    }
    if (aggTmp.day || disTmp.day) {
      aggGroupList.push(day);
      aggGroup['day'] = day;
    }
    if (aggTmp.hour || disTmp.hour) {
      aggGroupList.push(hour);
      aggGroup['hour'] = hour;
    }

    var error = false;
    for (let i=0; i < disCols.length; i++) {
      let column = disCols[i];
      let value;

      if (column in mappings.columns) {
        let colVal = datum[mappings.columns[column]];

        if (!(colVal in mappings.mapping)) {
          error = true;
          break;
        } else {
          value = mappings.mapping[colVal][column];
        }
      } else {
        value = datum[column];
      }

      disGroupList.push(value);
      aggGroupList.push(value);

      disGroup[column] = value;
      aggGroup[column] = value;
    }

    for (let i=0; i < aggCols.length; i++) {
      let column = aggCols[i];
      let value;
      if (column in mappings.columns) {
        let colVal = datum[mappings.columns[column]];

        if (!(colVal in mappings.mapping)) {
          error = true;
          break;
        } else {
          value = mappings.mapping[colVal][column];
        }
      } else {
        value = datum[column];
      }

      aggGroupList.push(value);
      aggGroup[column] = value;
    }

    if (error) return null;

    let aggGroupKey = aggGroupList.join(' ');
    let disGroupKey = disGroupList.join(' ');

    if (!(disGroupKey in groupedData)) {
      groupedData[disGroupKey] = {
        values: {},
        keys: disGroup,
      };
    }

    if (!(aggGroupKey in groupedData[disGroupKey].values)) {
      groupedData[disGroupKey].values[aggGroupKey] = {
        values: [],
        keys: aggGroup,
      };
    }

    groupedData[disGroupKey].values[aggGroupKey].values.push(datum[config.VALUE_COL]);
  });

  return groupedData;
}


export {
  load,
  uuidv4,
  filterData,
  filterDataByDateTime,
  getDates,
  groupData,
};

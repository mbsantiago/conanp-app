function load(url, callback) {
  // Async get data
  return fetch(url)
    .then(response => {
      if (response.ok) {
        // Return in json format
        return response.json();
      } else {
        throw new Error('Error at loading ' + url);
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
          value = ''
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

    return selected
  });

  return filteredData;
}


export {
  load,
  uuidv4,
  filterData,
};

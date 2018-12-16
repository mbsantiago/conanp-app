const temporalScales = {
  'no agregar': (date, time) => `${date} ${time}`,
  'hora': (date, time) => {
    let hour = time.split(':')[0];
    return `${date} ${hour}`;
  },
  'dia': (date, time) => date,
  'mes': (date, time) => {
    let [year, month, ] = date.split('-')[0];
    return `${year}-${month}`;
  },
  'año': (date, time) => {
    let year = date.split('-')[0];
    return year;
  },
  'agregar todo': (date, time) => '',
};

const defaultTemporalScale = temporalScales['hora'];

export {
  temporalScales,
  defaultTemporalScale,
}

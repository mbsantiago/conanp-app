const BASE = 'http://localhost:8000/';

const POINTS_URL = BASE + "metadata/conglomerados";
const POINTS_COL_URL = BASE + 'metadata/rangos_conglomerados';

const DATA_URL = BASE + 'data/conglomerado';
const DATA_COL_URL = BASE + 'metadata/rangos_especie';
const DATA_MAPPING_URL = BASE + 'metadata/mapeo_especie';

const MAINTAINER = 'soporte.dgpi@conabio.gob.mx';
const NAME = 'visualización-fototrampeo';

const DATE_COL = 'fecha';
const TIME_COL = 'hora';


export {
  POINTS_URL,
  POINTS_COL_URL,
  DATA_URL,
  DATA_COL_URL,
  DATA_MAPPING_URL,
  MAINTAINER,
  NAME,
  DATE_COL,
  TIME_COL,
};

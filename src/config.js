const BASE = 'http://localhost:8000/';

const POINTS_URL = BASE + "metadata/conglomerados";
const POINTS_COL_URL = BASE + 'metadata/rangos_conglomerados';

const DATA_URL = BASE + 'data/conglomerado';
const DATA_COL_URL = BASE + 'metadata/rangos_especie'
const DATA_MAPPING_URL = BASE + 'metadata/mapeo_especie'

const DEFAULT_VIEWPORT = {
  center: [23.950464, -102.532867],
  zoom: 6,
};

export {
  BASE,
  POINTS_URL,
  POINTS_COL_URL,
  DATA_URL,
  DATA_COL_URL,
  DATA_MAPPING_URL,
  DEFAULT_VIEWPORT,
};

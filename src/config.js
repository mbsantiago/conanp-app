const BASE = 'http://localhost:8000/';

const POINTS_URL = BASE + "metadata/conglomerados";
const POINTS_COL_URL = BASE + 'metadata/rangos_conglomerados';

const DATA_URL = BASE + 'data/conglomerado';
const DATA_COL_URL = BASE + 'metadata/rangos_especie';
const DATA_MAPPING_URL = BASE + 'metadata/mapeo_especie';

const MAINTAINER = 'soporte.dgpi@conabio.gob.mx';
const NAME = 'visualización-fototrampeo';

const PALETTE = {
  primary: {
    light: '#439889',
    main: '#00695c',
    dark: '#003d33',
    contrastText: '#fff',
  },
  secondary: {
    light: '#d7ffd9',
    main: '#a5d6a7',
    dark: '#75a478',
    contrastText: '#000',
  },
};


export {
  BASE,
  POINTS_URL,
  POINTS_COL_URL,
  DATA_URL,
  DATA_COL_URL,
  DATA_MAPPING_URL,
  MAINTAINER,
  NAME,
  PALETTE,
};

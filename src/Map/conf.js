const POINT_LAT_COL = 'coord_latitud';
const POINT_LON_COL = 'coord_longitud';
const POINT_NAME_COL = 'id_congl';
const POINT_NAME = 'conglomerado';

const SELECTED_POINT_COLOR = 'red';
const UNSELECTED_POINT_COLOR = '#439889';

const POINT_WEIGHT = 1;
const POINT_OPACITY = 0.8;
const POINT_RADIUS = 3;

const DEFAULT_VIEWPORT = {
  center: [23.950464, -102.532867],
  zoom: 6,
};

const BASE_LAYERS = [
  {
    name: "Cobertura de Suelo",
    format: 'image/png',
    layer: 'MEX_LC_Landsat_8C:MEX_LC_2015_Landsat_8C',
    attribution: 'CONABIO',
    url: 'http://webportal.conabio.gob.mx:8085/geoserver/MEX_LC_Landsat_8C/wms?',
  },
  {
    name: "Integridad Ecológica",
    format: 'image/png',
    layer: 'MEX_IE3C_250m:ie3c_2014_250m',
    attribution: 'CONABIO',
    url: 'http://webportal.conabio.gob.mx:8085/geoserver/MEX_IE3C_250m/wms?',
  },
];

const SHAPE_LAYERS = [
  {
    url: 'http://snmb.conabio.gob.mx/api_anps/v1/anps',
    name: 'ANPs',
    nameColumn: 'nombre',
    style: {
      color: 'black',
      weight: 0.1,
      opacity: 0.8,
    },
  },
];

export {
  POINT_LAT_COL,
  POINT_LON_COL,
  POINT_NAME_COL,
  POINT_NAME,
  SELECTED_POINT_COLOR,
  UNSELECTED_POINT_COLOR,
  POINT_WEIGHT,
  POINT_OPACITY,
  POINT_RADIUS,
  BASE_LAYERS,
  SHAPE_LAYERS,
  DEFAULT_VIEWPORT,
};

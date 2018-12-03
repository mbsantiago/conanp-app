import React, { createRef, Component } from 'react';
import PropTypes from 'prop-types';
import Control from 'react-leaflet-control';

import { load } from '../utils';

import {
  Map,
  Pane,
  TileLayer,
  LayerGroup,
  LayersControl,
  WMSTileLayer,
  GeoJSON,
  CircleMarker,
  Tooltip} from 'react-leaflet';

import {
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
} from './conf';

//import Control from 'react-leaflet-control';
import * as turf from '@turf/turf';

import './index.css';
import 'leaflet/dist/leaflet.css';

const { BaseLayer, Overlay } = LayersControl;


class AppMap extends Component {

  constructor(props){

    super(props);

    this.defaultViewport = props.viewport;
    this.mapRef = createRef();

    this.state = {
      viewport: props.viewport,
      shapes: [],
    };
  }

  componentDidMount() {
    SHAPE_LAYERS.forEach( shape => {
      load(shape.url, (data) => this.setState(state => {
        let loaded_shape = Object.assign({data: data}, shape);
        state.shapes.push(loaded_shape);
        return state
      }));
    });
  }

  onViewportChanged(viewport) {
    this.setState({viewport: viewport});
  }

  onClickReset() {
    this.setState({viewport: this.defaultViewport});
  }

  getPointColor(id) {
    if (this.props.selectedPoints.has(id)) {
      return SELECTED_POINT_COLOR;
    } else {
      return UNSELECTED_POINT_COLOR;
    }
  }

  onEachShape(feature, layer, info) {
    layer.on({
      click: () => this.onClickShape(feature)
    });
    layer.bindTooltip(feature.properties[info.nameColumn]);
  }

  onClickPoint(id) {
    if (this.props.selectedPoints.has(id)) {
      this.props.selectedPoints.delete(id);
    } else {
      this.props.addPoint(id);
    }
    this.forceUpdate();
  }

  centerOnFeature(feature) {
    let [minLon, minLat, maxLon, maxLat] = turf.bbox(feature);
    this.mapRef.current.leafletElement.flyToBounds([
      [minLat, minLon],
      [maxLat, maxLon]
    ]);

    if (this.props.points !== null) {
      this.props.points.map(
        (d) => {
          let point = [-d[POINT_LON_COL], d[POINT_LAT_COL]];
          let isIn = turf.booleanPointInPolygon(point, feature);

          if (isIn) {
            if (!this.props.selectedPoints.has(d[POINT_NAME_COL])) {
              this.props.addPoint(d[POINT_NAME_COL]);
            }
          }
          return null;
        }
      );
    }
  }

  onClickShape(feature) {
    this.centerOnFeature(feature);
  }

  renderShapes() {
    return this.state.shapes.map( shapeInfo => this.renderShape(shapeInfo) );
  }

  renderShape(shapeInfo) {
    let shapes = (
      <GeoJSON
        data={shapeInfo.data}
        style={shapeInfo.style}
        onEachFeature={
          (feature, layer) => this.onEachShape(feature, layer, shapeInfo)}
        pane='shapes'
      />);

    return (
      <Overlay key={shapeInfo.name} checked name={shapeInfo.name}>
        {shapes}
      </Overlay>);
  }

  renderPoints() {
    if (this.props.points === null) return null;

    let points = this.props.points.map(
      (d) => (
        <CircleMarker
          center={[d[POINT_LAT_COL], -Math.abs(d[POINT_LON_COL])]}
          key={POINT_NAME + ' ' + d[POINT_NAME_COL]}
          fillColor={this.getPointColor(d[POINT_NAME_COL])}
          opacity={POINT_OPACITY}
          stroke={true}
          weight={POINT_WEIGHT}
          color={this.getPointColor(d[POINT_NAME_COL])}
          onClick={() => this.onClickPoint(d[POINT_NAME_COL])}
          pane='points'
          radius={POINT_RADIUS}>
          <Tooltip>{POINT_NAME + ' ' + d[POINT_NAME_COL]}</Tooltip>
        </CircleMarker>
      )
    );

    return (
      <Overlay checked name={POINT_NAME}>
        <LayerGroup>
          {points}
        </LayerGroup>
      </Overlay>
    );
  }

  renderBaseLayer() {
    return (
      <TileLayer
        attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
        url='https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'
      />
    );
  }

  renderControls() {

    let baseLayers = BASE_LAYERS.map(specs => (
      <BaseLayer key={specs.name} name={specs.name}>
        <WMSTileLayer
          transparent
          format={specs.format}
          layers={specs.layer}
          attribution={specs.attribution}
          url={specs.url}
        />
      </BaseLayer>
    ));

    return (
      <LayersControl position="topright">
        <BaseLayer checked name="Base">
          {this.renderBaseLayer()}
        </BaseLayer>
        {baseLayers}
        {this.renderPoints()}
        {this.renderShapes()}
      </LayersControl>
    );

  }

  renderHomeButton() {

    return (
      <Control position="topleft" >
        <button
          className='leaflet-control-layers'
          onClick={() => this.onClickReset()}
        >
          <i className="fa fa-home"></i>
        </button>
      </Control>
    );

  }

  render() {

    if (this.props.centerOn != null) {

      this.centerOnFeature(this.props.centerOn);

    }

    return (
      <Map
        className={'Map'}
        onViewportChanged={(viewport) => this.onViewportChanged(viewport)}
        viewport={this.state.viewport}
        ref={this.mapRef}
      >
        <Pane name={'shapes'}/>
        <Pane name={'points'}/>
        {this.renderBaseLayer()}
        {this.renderControls()}
        {this.renderHomeButton()}
      </Map>);
  }

}

AppMap.propTypes = {
  viewport: PropTypes.object.isRequired,
  selectedPoints: PropTypes.object.isRequired,
  points: PropTypes.array,
  shapes: PropTypes.array,
  centerOn: PropTypes.array,
  addPoint: PropTypes.func.isRequired
};


export default AppMap;

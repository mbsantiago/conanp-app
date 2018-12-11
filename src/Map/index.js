import React, { createRef, Component } from 'react';
import PropTypes from 'prop-types';

// Map rendering imports
import Control from 'react-leaflet-control';
import { bbox, featureCollection, pointsWithinPolygon } from '@turf/turf';
import 'leaflet/dist/leaflet.css';
import {
  Map,
  Pane,
  TileLayer,
  LayerGroup,
  LayersControl,
  WMSTileLayer,
  GeoJSON,
  CircleMarker,
  Tooltip } from 'react-leaflet';


// Material UI imports
import IconButton from '@material-ui/core/IconButton';
import HomeButton from '@material-ui/icons/Home';

// Local imports
import { load } from '../utils';
import * as config from './conf';


const { BaseLayer, Overlay } = LayersControl;


class AppMap extends Component {

  constructor(props){
    super(props);

    // Create a reference to map element to control viewport.
    this.mapRef = createRef();

    this.state = {
      viewport: config.DEFAULT_VIEWPORT,
      shapes: [],
    };
  }

  componentDidMount() {
    // Load all shape layers asynchronously
    config.SHAPE_LAYERS.forEach( shape => {
      load(shape.url, (data) => this.setState(state => {

        // Make new object with loaded data and all other properties of shape
        // and add it to the shape list in component state.
        let loaded_shape = Object.assign({data: data}, shape);
        state.shapes.push(loaded_shape);

        return state;
      }));
    });
  }

  onViewportChanged = (viewport) => this.setState({viewport: viewport});

  onClickReset = () => this.setState({viewport: config.DEFAULT_VIEWPORT});

  getPointColor = (id) => this.props.selectedPoints.has(id) ?
    config.SELECTED_POINT_COLOR :
    config.UNSELECTED_POINT_COLOR;

  onEachShape(feature, layer, info) {
    // When placing the shapes on map, bind to shape the corresponding
    // on click function
    layer.on({
      click: () => this.onClickShape(feature)
    });

    // Add a tooltip with shape name as well.
    layer.bindTooltip(feature.properties[info.nameColumn]);
  }

  onClickPoint = (id) =>  {
    // When clicking on point remove from selected if previously selected
    // or add to selected set.
    if (this.props.selectedPoints.has(id)) {
      this.props.removePoint(id);
    } else {
      this.props.addPoint([id]);
    }
  }

  centerOnFeature(feature) {
    // Calculate bounding box of feature
    let [minLon, minLat, maxLon, maxLat] = bbox(feature);

    // Use map reference to fly to bounding box.
    this.mapRef.current.leafletElement.flyToBounds([
      [minLat, minLon],
      [maxLat, maxLon]
    ]);
  }

  onClickShape(feature) {
    // Build feature collection from points and store in component to avoid multiple calculation
    if (!(this.pointsFeatureCollection)) {
      this.pointsFeatureCollection = featureCollection(this.props.points.map(d => ({
        type: 'Feature',
        geometry: {type: 'Point', coordinates: [d[config.POINT_LON_COL], d[config.POINT_LAT_COL]]},
        properties: {id: d[config.POINT_NAME_COL]},
      })));
    }

    // Extract IDS of points that fall within feature
    let pointsInside = pointsWithinPolygon(this.pointsFeatureCollection, feature);
    let ids = pointsInside.features.map(feat => feat.properties.id);

    // Add to selection
    this.props.addPoint(ids);

    // Focus on selected feature
    this.centerOnFeature(feature);
  }

  renderShapes() {
    // return JSX element for each of the shapes group in the shape list.
    return this.state.shapes.map( shapeInfo => this.renderShape(shapeInfo) );
  }

  renderShape(shapeInfo) {
    // Create a GeoJSON layer with shape info. Add functionallity to each shape
    // with onEachFeature prop.
    let shapes = (
      <GeoJSON
        data={shapeInfo.data}
        style={shapeInfo.style}
        onEachFeature={
          (feature, layer) => this.onEachShape(feature, layer, shapeInfo)}
        pane='shapes'
      />);

    // Wrap layer in Overlay component. This makes it appear in the controls tab of
    // the map, allowing the layer to be turned on/off.
    return (
      <Overlay key={shapeInfo.name} checked name={shapeInfo.name}>
        {shapes}
      </Overlay>);
  }

  renderPoints() {
    // Exit early if points aren't loaded yet (or no points where found).
    if (this.props.points === null) return null;

    // For each point create a marker at it's center.
    let points = this.props.points.map(
      (d) => (
        <CircleMarker
          center={[d[config.POINT_LAT_COL], -Math.abs(d[config.POINT_LON_COL])]}
          key={config.POINT_NAME + ' ' + d[config.POINT_NAME_COL]}
          fillColor={this.getPointColor(d[config.POINT_NAME_COL])}
          opacity={config.POINT_OPACITY}
          stroke={true}
          weight={config.POINT_WEIGHT}
          color={this.getPointColor(d[config.POINT_NAME_COL])}
          onClick={() => this.onClickPoint(d[config.POINT_NAME_COL])}
          pane='points'
          radius={config.POINT_RADIUS}>
          {/* Add a tooltip with point's name */}
          <Tooltip>{config.POINT_NAME + ' ' + d[config.POINT_NAME_COL]}</Tooltip>
        </CircleMarker>
      )
    );

    // Wrap in an Overlay component. This makes it appear in the controls tab of
    // the map, allowing the layer to be turned on/off.
    return (
      <Overlay checked name={config.POINT_NAME}>
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
    // For each tile layer in the configurations create a corresponding options in the control
    // window of the map.
    let baseLayers = config.BASE_LAYERS.map(specs => (
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

    // Render the control layer in the map with the tile layers, the points layer and the shapes layers.
    return (
      <LayersControl style={{display: 'flex', 'text-align': 'left'}} position="topright">
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
    // Add a button to reset viewport to original.
    return (
      <Control position="bottomleft" >
        <IconButton
          className='leaflet-control-layers'
          aria-label="Home"
          onClick={() => this.onClickReset()}
        >
          <HomeButton />
        </IconButton>
      </Control>
    );
  }

  render() {
    const style = {
      position: 'relative',
      bottom: 0,
      left: 0,
      top: 0,
      height: '100%',
      width: '100%',
      zIndex: 0,
    };

    // Render a Leaflet Map with Controls, Home Button and Base Layer.
    return (
      <Map
        style={style}
        onViewportChanged={this.onViewportChanged}
        viewport={this.state.viewport}
        ref={this.mapRef}
      >
        {/* Panes are for correct z-index rendering */}
        <Pane name={'shapes'}/>
        <Pane name={'points'}/>

        {/* Layers */}
        {this.renderBaseLayer()}
        {this.renderControls()}
        {this.renderHomeButton()}
      </Map>);
  }
}


// Enforcing prop types
AppMap.propTypes = {
  selectedPoints: PropTypes.object.isRequired,
  points: PropTypes.array,
  shapes: PropTypes.array,
  addPoint: PropTypes.func.isRequired,
  removePoint: PropTypes.func.isRequired,
};


export default AppMap;

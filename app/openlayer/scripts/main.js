import Map from 'ol/Map';
import View from 'ol/View.js';
import { Style, Fill, Stroke, Circle as CircleStyle } from 'ol/style';
import Draw from 'ol/interaction/Draw.js';
import { fromLonLat } from 'ol/proj';
import OSM from 'ol/source/OSM.js';
import TileWMS from 'ol/source/TileWMS.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import TileLayer from 'ol/layer/Tile';
import { defaults as defaultControls, ScaleLine } from 'ol/control';
import Point from 'ol/geom/Point';
import LayerSwitcherModal from './modal.js';
import { initializePopup } from './popup.js';
import DealsFilter from './filter.js';
import FilterPanel from './filterPanel.js';

const baseUrl = 'http://localhost:8083/';

// ===== STYLES =====
const createStyle = (fillColor, strokeColor, radius = 6) => new Style({
  image: new CircleStyle({
    radius,
    fill: new Fill({ color: fillColor }),
    stroke: new Stroke({ color: strokeColor || '#ffffff', width: fillColor === '#fc941d' ? 0 : 1.5 }),
  }),
  stroke: new Stroke({ color: strokeColor || fillColor, width: fillColor === '#fc941d' ? 2 : 2 }),
  fill: new Fill({ color: `${fillColor}40` }),
});

// Fonction de style pour les cultures avec offset si multi-cultures
const createCropStyle = (fillColor) => (feature) => {
  const crops = feature.get('crops');
  const cropCount = crops ? crops.split(',').length : 1;
  
  let geometry = feature.getGeometry();
  if (cropCount > 1) {
    // Décaler de 100m = ~0.0009 degrés
    const coords = geometry.getCoordinates();
    geometry = new Point([coords[0] + 0.0009, coords[1] + 0.0009]);
  }
  
  return new Style({
    geometry: geometry,
    image: new CircleStyle({
      radius: 7,
      fill: new Fill({ color: fillColor }),
      stroke: new Stroke({ color: '#ffffff', width: 2 }),
    }),
    stroke: new Stroke({ color: fillColor, width: 2.5 }),
    fill: new Fill({ color: `${fillColor}40` }),
  });
};

// ===== SOURCES =====
const drawSource = new VectorSource();
const dealsSource = new VectorSource({
  url: baseUrl + 'geoserver/landmatrix_agri/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=landmatrix_agri:deals_agri_wfs&maxFeatures=500&outputFormat=application/json',
  format: new GeoJSON(),
});

// ===== COUCHES =====
const createWFSLayer = (id, url, color) => {
  const layer = new VectorLayer({
    source: new VectorSource({ url, format: new GeoJSON() }),
    style: createCropStyle(color),
    visible: false,
  });
  layer.set('id', id);
  return layer;
};

const layers = {
  base: new TileLayer({ source: new OSM() }),
  pays: new TileLayer({
    source: new TileWMS({
      url: baseUrl + 'geoserver/landmatrix_agri/wms',
      params: { LAYERS: 'landmatrix_agri:country', TILED: true, TRANSPARENT: true, FORMAT: 'image/png' },
      serverType: 'geoserver',
    }),
  }),
  deals: new VectorLayer({ source: dealsSource, style: createStyle('#2e7d32', '#ffffff', 6) }),
  draw: new VectorLayer({ source: drawSource, style: createStyle('#fc941d', '#fc941d', 7) }),
  crops: {
    cassava: createWFSLayer('crop-cassava', baseUrl + "geoserver/landmatrix_agri/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=landmatrix_agri:deals_agri_wfs&maxFeatures=500&outputFormat=application/json&CQL_FILTER=" + encodeURIComponent("crops LIKE '%Cassava%'"), '#FF6B6B'),
    rubber: createWFSLayer('crop-rubber', baseUrl + "geoserver/landmatrix_agri/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=landmatrix_agri:deals_agri_wfs&maxFeatures=500&outputFormat=application/json&CQL_FILTER=" + encodeURIComponent("crops LIKE '%Rubber%'"), '#4ECDC4'),
    palm: createWFSLayer('crop-palm', baseUrl + "geoserver/landmatrix_agri/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=landmatrix_agri:deals_agri_wfs&maxFeatures=500&outputFormat=application/json&CQL_FILTER=" + encodeURIComponent("crops LIKE '%palm%'"), '#FFE66D'),
    sugar: createWFSLayer('crop-sugar', baseUrl + "geoserver/landmatrix_agri/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=landmatrix_agri:deals_agri_wfs&maxFeatures=500&outputFormat=application/json&CQL_FILTER=" + encodeURIComponent("crops LIKE '%Sugar%'"), '#95E1D3'),
    soya: createWFSLayer('crop-soya', baseUrl + "geoserver/landmatrix_agri/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=landmatrix_agri:deals_agri_wfs&maxFeatures=500&outputFormat=application/json&CQL_FILTER=" + encodeURIComponent("crops LIKE '%Soya%'"), '#C7CEEA'),
  }
};

layers.pays.set('id', 'pays');
layers.deals.set('id', 'deals');

// Flatten crop layers
const cropLayers = Object.values(layers.crops);

// ===== CARTE =====
const map = new Map({
  controls: defaultControls().extend([new ScaleLine({ className: 'ol-scale-line', target: document.getElementById('scale-line-container') })]),
  target: 'map',
  layers: [layers.base, layers.pays, layers.deals, ...cropLayers, layers.draw],
  view: new View({ center: fromLonLat([0, 0]), zoom: 2 }),
});

// ===== INTERACTIONS =====
let draw;

function addInteraction(type) {
  if (draw) map.removeInteraction(draw);
  if (type && type !== 'None') {
    draw = new Draw({ source: drawSource, type });
    map.addInteraction(draw);
  }
}

// ===== INITIALISATION =====
new LayerSwitcherModal(map);
new FilterPanel();
initializePopup(map);
new DealsFilter(layers.deals, baseUrl);

export { map, addInteraction, drawSource, cropLayers };

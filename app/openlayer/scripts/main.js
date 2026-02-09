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
    style: createStyle(color, '#ffffff', 7),
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
};

layers.pays.set('id', 'pays');
layers.deals.set('id', 'deals');

// ===== CARTE =====
const map = new Map({
  controls: defaultControls().extend([new ScaleLine({ className: 'ol-scale-line', target: document.getElementById('scale-line-container') })]),
  target: 'map',
  layers: [layers.base, layers.pays, layers.deals, layers.draw],
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

export { map, addInteraction, drawSource };

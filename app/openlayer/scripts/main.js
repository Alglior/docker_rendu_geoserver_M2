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

// Vector source for drawing
const source = new VectorSource();
var local_ip = 'http://localhost:8083/';


// Scale control
const scaleControl = new ScaleLine({
  className: 'ol-scale-line',
  target: document.getElementById('scale-line-container'),
});

const controls = defaultControls().extend([scaleControl]);

// Vector layer styling
const vectorLayer = new VectorLayer({
  source: source,
  style: new Style({
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.2)',
    }),
    stroke: new Stroke({
      color: '#fc941d',
      width: 2,
    }),
    image: new CircleStyle({
      radius: 7,
      fill: new Fill({
        color: '#fc941d',
      }),
    }),
  }),
});

const paysLayer = new TileLayer({
  source: new TileWMS({
    url: local_ip + 'geoserver/landmatrix_agri/wms',
    params: {
      LAYERS: 'landmatrix_agri:country',
      TILED: true,
      TRANSPARENT: true,
      FORMAT: 'image/png',
    },
    serverType: 'geoserver',
  }),
});
paysLayer.set('id', 'pays');

const dealsLayer = new VectorLayer({
  source: new VectorSource({
    url: local_ip + 'geoserver/landmatrix_agri/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=landmatrix_agri:deals_agri_wfs&maxFeatures=50&outputFormat=application/json',
    format: new GeoJSON(),
  }),
  style: new Style({
    image: new CircleStyle({
      radius: 6,
      fill: new Fill({ color: '#2e7d32' }),
      stroke: new Stroke({ color: '#ffffff', width: 1.5 }),
    }),
    stroke: new Stroke({ color: '#2e7d32', width: 2 }),
    fill: new Fill({ color: 'rgba(46, 125, 50, 0.25)' }),
  }),
});
dealsLayer.set('id', 'deals');

// Create the map
const map = new Map({
  controls: controls,
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
    paysLayer,
    dealsLayer,
    vectorLayer,
  ],
  view: new View({
    center: fromLonLat([0, 0]),
    zoom: 2,
  }),
});

let draw;
let currentDrawType = null;

function addInteraction(type) {
  if (draw) {
    map.removeInteraction(draw);
  }

  if (type && type !== 'None') {
    currentDrawType = type;
    draw = new Draw({
      source: source,
      type: type,
    });
    map.addInteraction(draw);
  } else {
    currentDrawType = null;
  }
}

// Initialize modal and popup
const layerSwitcher = new LayerSwitcherModal(map);
initializePopup(map);

// Export for modal.js
export { map, addInteraction, source };

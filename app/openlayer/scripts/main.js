import Map from 'ol/Map';
import View from 'ol/View.js';
import { Style, Fill, Stroke, Circle as CircleStyle } from 'ol/style';
import Draw from 'ol/interaction/Draw.js';
import { fromLonLat } from 'ol/proj';
import OSM from 'ol/source/OSM.js';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import TileLayer from 'ol/layer/Tile';
import { defaults as defaultControls, ScaleLine } from 'ol/control';
import LayerSwitcherModal from './modal.js';
import { initializePopup } from './popup.js';

// Vector source for drawing
const source = new VectorSource();



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

// Create the map
const map = new Map({
  controls: controls,
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
    vectorLayer,
  ],
  view: new View({
    center: fromLonLat([2.35, 48.85]),
    zoom: 10,
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

import LayerSwitcherModal from './modal.js';
import DealsFilter from './filter.js';
import FilterPanel from './filterPanel.js';

const baseUrl = 'http://localhost:8083/';

// ===== INITIALISATION DE LA CARTE =====
const map = L.map('map', {
    center: [0, 0],
    zoom: 2,
    zoomControl: true
});

// Ajout du contrôle d'échelle
L.control.scale({
    position: 'bottomleft',
    imperial: false
}).addTo(map);

// ===== COUCHES DE BASE =====
const baseLayers = {
    osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }),
    satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles © Esri'
    }),
    terrain: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap'
    })
};

// Ajouter OSM par défaut
baseLayers.osm.addTo(map);

// ===== COUCHES DE CONTEXTE =====
// Couche WMS des pays
const paysLayer = L.tileLayer.wms(baseUrl + 'geoserver/landmatrix_agri/wms', {
    layers: 'landmatrix_agri:country',
    format: 'image/png',
    transparent: true,
    attribution: 'GeoServer'
}).addTo(map);

// ===== INITIALISATION DES COMPOSANTS =====
const dealsFilter = new DealsFilter(map, baseUrl);
const filterPanel = new FilterPanel();

// Object pour les couches de contexte à passer à la modal
const overlayLayers = {
    pays: paysLayer,
    deals: null // Sera mis à jour par dealsFilter
};

// Wrapper pour gérer la visibilité de la couche deals
Object.defineProperty(overlayLayers, 'deals', {
    get: function() {
        return dealsFilter.getDealsLayer();
    },
    enumerable: true,
    configurable: true
});

const layerSwitcher = new LayerSwitcherModal(map, baseLayers, overlayLayers);

// ===== CHARGEMENT INITIAL DES DEALS =====
dealsFilter.loadDeals();

console.log('Carte Leaflet initialisée');

export { map };

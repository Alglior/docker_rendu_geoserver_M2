import LayerSwitcherModal from './modal.js';
import DealsFilter from './filter.js';
import FilterPanel from './filterPanel.js';
import { initializeLegend } from './legend.js';

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

// ===== INITIALISATION DE LA LÉGENDE =====
initializeLegend(map);

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

// Couche Consultation réussie (WFS avec filtre CQL)
const consultingSuccessUrl = baseUrl + 
    'geoserver/landmatrix_agri/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=landmatrix_agri:deals_agri_wfs&maxFeatures=500&outputFormat=application/json' +
    `&CQL_FILTER=${encodeURIComponent("community_reaction='Consent' AND impact_violence=false AND impact_eviction=false")}`;

const consultingSuccessLayer = L.geoJSON(null, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
            radius: 7,
            fillColor: '#1565c0',
            color: '#ffffff',
            weight: 1.5,
            opacity: 1,
            fillOpacity: 1
        });
    }
}).addTo(map);

// Charger les données de consultation réussie
fetch(consultingSuccessUrl)
    .then(response => response.json())
    .then(data => {
        consultingSuccessLayer.addData(data);
    })
    .catch(error => console.error('Erreur de chargement de la couche consultation réussie:', error));

// ===== INITIALISATION DES COMPOSANTS =====
const dealsFilter = new DealsFilter(map, baseUrl);
const filterPanel = new FilterPanel();

// Object pour les couches de contexte à passer à la modal
const overlayLayers = {
    pays: paysLayer,
    deals: null, // Sera mis à jour par dealsFilter
    'consulting-success': consultingSuccessLayer
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

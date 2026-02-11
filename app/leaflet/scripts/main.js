import LayerSwitcherModal from './modal.js';
import DealsFilter from './filter.js';
import FilterPanel from './filterPanel.js';
import { initializeLegend } from './legend.js';
import { createPopupContent } from './popup.js';

const baseUrl = 'http://localhost:8083/';

// ===== INITIALISATION DE LA CARTE =====
// Définition des limites maximales de déplacement (limite nord/sud)
const maxBounds = L.latLngBounds(
    L.latLng(-75, -180),  // Coin sud-ouest (limite sud)
    L.latLng(75, 180)     // Coin nord-est (limite nord)
);

const map = L.map('map', {
    center: [0, 0],
    zoom: 2,
    zoomControl: true,
    maxBounds: maxBounds,
    maxBoundsViscosity: 0.8,  // Résistance lors du déplacement hors limites (0-1)
    minZoom: 2,  // Limite de dézoom (empêche de trop dézoomer)
    maxZoom: 10  // Limite de zoom maximum
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

// ===== CRÉATION DES PANES POUR HIÉRARCHIE DES COUCHES =====
// Pane pour les transactions agricoles (points verts)
map.createPane('dealsPane');
map.getPane('dealsPane').style.zIndex = 610;

// Pane pour les consultations réussies (points bleus) - au-dessus des deals
map.createPane('consultingPane');
map.getPane('consultingPane').style.zIndex = 620;

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
    },
    onEachFeature: function (feature, layer) {
        if (feature.properties) {
            const popupContent = createPopupContent(feature.properties);
            layer.bindPopup(popupContent, {
                maxWidth: 550,
                className: 'custom-popup'
            });
        }
    },
    pane: 'consultingPane'
}).addTo(map);

// Charger les données de consultation réussie
fetch(consultingSuccessUrl)
    .then(response => response.json())
    .then(data => {
        consultingSuccessLayer.addData(data);
        // Forcer la couche à être au premier plan
        consultingSuccessLayer.bringToFront();
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

// Exporter la fonction pour ramener la couche consulting au premier plan
window.bringConsultingToFront = function() {
    if (consultingSuccessLayer && map.hasLayer(consultingSuccessLayer)) {
        consultingSuccessLayer.bringToFront();
    }
};

console.log('Carte Leaflet initialisée');

export { map, consultingSuccessLayer };

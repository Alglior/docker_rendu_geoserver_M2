var url =("http://localhost:8083/geoserver/")

// 1. Initialiser la carte correctement
var mapOptions = {
    center: [20, 0],  // Centre monde
    zoom: 2
};

var map = L.map('map', mapOptions);  // 'map' = ID du div, PAS la variable map

// 2. Ajouter fond OSM
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// 3. WMS GeoServer CORRIGÉ (juste l'URL de base)
var wmsLayer = L.tileLayer.wms(url,"landmatrix_agri/wms", {
    layers: 'landmatrix_agri:country',
    format: 'image/png',
    transparent: true
}).addTo(map);

console.log(map);
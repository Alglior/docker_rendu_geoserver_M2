var url = "http://localhost:8083/geoserver/";

// 1. Initialiser la carte correctement
var mapOptions = {
    center: [20, 0],  // Centre monde
    zoom: 2
};

var map = L.map('map', mapOptions);

// 2. Ajouter fond OSM
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// 3. Couche WMS des pays (country)
var countryLayer = L.tileLayer.wms(url + "wms", {
    layers: 'landmatrix_agri:country',
    format: 'image/png',
    transparent: true,
    attribution: 'GeoServer'
}).addTo(map);

// 4. Fonction de style personnalisée pour les points deals_agri
function styleDeals(feature) {
    return {
        radius: 8,           // Taille du cercle
        fillColor: "#ff7800", // Couleur de remplissage (orange)
        color: "#000",        // Couleur du contour (noir)
        weight: 1,            // Épaisseur du contour
        opacity: 1,           // Opacité du contour
        fillOpacity: 0.8      // Opacité du remplissage
    };
}

// 5. Fonction pour créer les popups
function onEachFeature(feature, layer) {
    if (feature.properties) {
        var popupContent = "<b>Informations du deal</b><br>";
        for (var prop in feature.properties) {
            popupContent += prop + ": " + feature.properties[prop] + "<br>";
        }
        layer.bindPopup(popupContent);
    }
}

// 6. Charger les données WFS en GeoJSON et appliquer le style
var wfsUrl = url + "landmatrix_agri/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=landmatrix_agri:deals_agri_wfs&outputFormat=application/json";

fetch(wfsUrl)
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data, {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, styleDeals(feature));
            },
            onEachFeature: onEachFeature
        }).addTo(map);
        console.log('Couche deals_agri chargée:', data);
    })
    .catch(error => console.error('Erreur chargement WFS:', error));

console.log('Carte initialisée');
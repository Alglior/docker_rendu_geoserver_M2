import { createPopupContent } from './popup.js';

/**
 * Gère les filtres WFS pour la couche des transactions agricoles
 * Filtre dynamiquement les entités selon les sélections de l'utilisateur
 */
class DealsFilter {
    constructor(map, baseUrl = 'http://localhost:8083/') {
        this.map = map;
        this.baseUrl = baseUrl;
        this.dealsLayer = null;
        this.currentFilters = {};
        this.initializeFilterControls();
    }

    /**
     * Initialise les éléments sélecteurs de filtres
     */
    initializeFilterControls() {
        const filterIds = [
            'filter-community',
            'filter-violence',
            'filter-eviction',
            'filter-displacement',
            'filter-benefits',
            'filter-region'
        ];

        // Ajoute un écouteur de changement pour chaque filtre
        filterIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.applyFilters());
            }
        });

        // Bouton pour réinitialiser les filtres
        const resetBtn = document.getElementById('reset-filters');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetFilters());
        }
    }

    /**
     * Construit une chaîne de filtre CQL basée sur les sélections de l'utilisateur
     * @returns {string} Filtre CQL
     */
    buildCQLFilter() {
        const filters = [];
        
        // Filtre réaction communautaire : Acceptation / Rejet / Neutre
        const community = document.getElementById('filter-community')?.value;
        if (community) {
            filters.push(`community_reaction='${community}'`);
        }

        // Filtre violence : avec ou sans incidents violents
        const violence = document.getElementById('filter-violence')?.value;
        if (violence !== '') {
            const violenceValue = violence === 'true';
            filters.push(`impact_violence=${violenceValue}`);
        }

        // Filtre expulsion : avec ou sans expulsions
        const eviction = document.getElementById('filter-eviction')?.value;
        if (eviction !== '') {
            const evictionValue = eviction === 'true';
            filters.push(`impact_eviction=${evictionValue}`);
        }

        // Filtre déplacement : avec ou sans déplacements
        const displacement = document.getElementById('filter-displacement')?.value;
        if (displacement !== '') {
            const displacementValue = displacement === 'true';
            filters.push(`impact_displacement=${displacementValue}`);
        }

        // Filtre avantages : vérifie si des bénéfices ont été réalisés
        const benefits = document.getElementById('filter-benefits')?.value;
        if (benefits === 'true') {
            filters.push(`materialized_benefits_for_local_communities IS NOT NULL`);
        } else if (benefits === 'false') {
            filters.push(`materialized_benefits_for_local_communities IS NULL`);
        }

        // Filtre région : permet de filtrer par zone géographique
    const region = document.getElementById('Zfilter-region')?.value;
    if (region) {
      const regionCqlMap = {
        'Latin America': "region ILIKE '%Latin America%'",
        'Europe': "region ILIKE '%Europe%'",
        'Oceania': "region ILIKE '%Oceania%'"
      };
      filters.push(regionCqlMap[region] || `region='${region}'`);
    }


        // Combine tous les filtres avec AND (tous les critères doivent être satisfaits)
        return filters.length > 0 ? filters.join(' AND ') : '';
    }

    /**
     * Applique les filtres en rechargeant les données WFS
     */
    applyFilters() {
        const cqlFilter = this.buildCQLFilter();
        this.loadDeals(cqlFilter);
    }

    /**
     * Style personnalisé pour les points deals
     * @param {Object} feature - Feature GeoJSON
     * @returns {Object} Style Leaflet
     */
    styleDeals(feature) {
        return {
            radius: 6,
            fillColor: '#2e7d32',
            color: '#ffffff',
            weight: 1.5,
            opacity: 1,
            fillOpacity: 0.8
        };
    }

    /**
     * Charge les données WFS avec les filtres appliqués
     * @param {string} cqlFilter - Chaîne de filtre CQL
     */
    loadDeals(cqlFilter = '') {
        let url = this.baseUrl + 'geoserver/landmatrix_agri/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=landmatrix_agri:deals_agri_wfs&maxFeatures=500&outputFormat=application/json';
        
        if (cqlFilter) {
            url += `&CQL_FILTER=${encodeURIComponent(cqlFilter)}`;
        }
        
        // Supprimer l'ancienne couche si elle existe
        if (this.dealsLayer) {
            this.map.removeLayer(this.dealsLayer);
        }
        
        // Charger les nouvelles données
        fetch(url)
            .then(response => response.json())
            .then(data => {
                this.dealsLayer = L.geoJSON(data, {
                    pointToLayer: (feature, latlng) => {
                        return L.circleMarker(latlng, this.styleDeals(feature));
                    },
                    onEachFeature: (feature, layer) => {
                        if (feature.properties) {
                            const popupContent = createPopupContent(feature.properties);
                            layer.bindPopup(popupContent, {
                                maxWidth: 550,
                                className: 'custom-popup'
                            });
                        }
                    },
                    pane: 'dealsPane'
                }).addTo(this.map);
                
                console.log('Filtres appliqués:', cqlFilter || 'Aucun filtre');
            })
            .catch(error => console.error('Erreur chargement WFS:', error));
    }

    /**
     * Réinitialise tous les filtres
     */
    resetFilters() {
        document.getElementById('filter-community').value = '';
        document.getElementById('filter-violence').value = '';
        document.getElementById('filter-eviction').value = '';
        document.getElementById('filter-displacement').value = '';
        document.getElementById('filter-benefits').value = '';
        document.getElementById('filter-region').value = '';
        
        // Applique les changements (tous les filtres vides)
        this.applyFilters();
        console.log('Filtres réinitialisés');
    }

    /**
     * Retourne la couche des deals pour manipulation externe
     * @returns {L.GeoJSON} Couche des deals
     */
    getDealsLayer() {
        return this.dealsLayer;
    }
}

export default DealsFilter;

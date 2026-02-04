import GeoJSON from 'ol/format/GeoJSON.js';
import VectorSource from 'ol/source/Vector';
import { all as allLoadingStrategy } from 'ol/loadingstrategy';

/**
 * Gère les filtres WFS pour la couche des transactions agricoles
 * Filtre dynamiquement les entités selon les sélections de l'utilisateur
 */
class DealsFilter {
  constructor(dealsLayer, baseUrl = 'http://localhost:8083/') {
    this.dealsLayer = dealsLayer;
    this.baseUrl = baseUrl;
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
    const region = document.getElementById('filter-region')?.value;
    if (region) {
      filters.push(`region='${region}'`);
    }

    // Combine tous les filtres avec AND (tous les critères doivent être satisfaits)
    return filters.length > 0 ? filters.join(' AND ') : '';
  }

  /**
   * Applique les filtres en mettant à jour la requête WFS
   */
  applyFilters() {
    const cqlFilter = this.buildCQLFilter();
    this.updateWFSSource(cqlFilter);
  }

  /**
   * Met à jour la source WFS avec les filtres appliqués
   * @param {string} cqlFilter - Chaîne de filtre CQL
   */
  updateWFSSource(cqlFilter) {
    const baseUrl = this.baseUrl + 'geoserver/landmatrix_agri/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=landmatrix_agri:deals_agri_wfs&maxFeatures=500&outputFormat=application/json';
    
    // Ajoute le paramètre CQL_FILTER si des filtres sont actifs
    const url = cqlFilter 
      ? baseUrl + `&CQL_FILTER=${encodeURIComponent(cqlFilter)}`
      : baseUrl;

    // Crée une nouvelle source avec les données filtrées
    const newSource = new VectorSource({
      url: url,
      format: new GeoJSON(),
      strategy: allLoadingStrategy  // Stratégie qui charge toutes les features à la fois
    });

    // Remplace la source de la couche
    this.dealsLayer.setSource(newSource);
    console.log('Filtres appliqués:', cqlFilter || 'Aucun filtre');
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
}

export default DealsFilter;

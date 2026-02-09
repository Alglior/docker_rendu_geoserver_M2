import Overlay from 'ol/Overlay';

// Cache pour le modèle HTML du popup
let popupTemplate = null;

// Étiquettes pour l'affichage de la précision
const ACCURACY_LABELS = {
  'APPROXIMATE_LOCATION': 'Localisation approximative',
  'EXACT_LOCATION': 'Localisation exacte',
  'COORDINATES': 'Coordonnées',
  'COUNTRY': 'Pays',
  'ADMINISTRATIVE_REGION': 'Région administrative'
};

/**
 * Formate les données d'intention (tableau ou chaîne)
 * @param {*} intention - Donnée à formater
 * @returns {string} Intention formatée
 */
function formatIntention(intention) {
  if (!intention) return 'N/A';
  
  // Parse si c'est un tableau stringifié
  let data = intention;
  if (typeof intention === 'string' && intention.startsWith('[')) {
    try {
      data = JSON.parse(intention.replace(/'/g, '"'));
    } catch (e) {
      return intention.replace(/_/g, ' ');
    }
  }
  
  // Formate les éléments du tableau
  if (Array.isArray(data)) {
    return data
      .map(item => item.replace(/_/g, ' ').toLowerCase())
      .map(item => item.charAt(0).toUpperCase() + item.slice(1))
      .join(', ');
  }
  
  return data.replace(/_/g, ' ');
}

/**
 * Formate la taille des deals avec les unités appropriées
 * @param {number} dealSize - Taille en hectares
 * @returns {string} Taille formatée
 */
function formatDealSize(dealSize) {
  if (!dealSize || dealSize === 'N/A') return 'N/A';
  if (dealSize === 0 || dealSize === '0.0') return 'Non spécifié';
  
  const size = typeof dealSize === 'number' ? dealSize : parseFloat(dealSize);
  return !isNaN(size) && size > 0 ? `${size.toLocaleString()} ha` : 'N/A';
}

/**
 * Charge le modèle HTML du popup depuis un fichier
 * @returns {Promise<string>} Contenu du modèle HTML
 */
async function loadPopupTemplate() {
  if (!popupTemplate) {
    try {
      const response = await fetch('/openlayer/templates/popup-content.html');
      popupTemplate = await response.text();
    } catch (error) {
      console.error('Erreur lors du chargement du modèle:', error);
      popupTemplate = '<div class="popup-deal-title">Transaction #{{dealId}}</div><p>Erreur lors du chargement</p>';
    }
  }
  return popupTemplate;
}

/**
 * Initialise et configure l'overlay du popup pour afficher les infos des deals
 * @param {Map} map - Instance de la carte OpenLayers
 * @returns {Overlay} L'instance d'overlay configurée
 */
export function initializePopup(map) {
  // Configuration de l'overlay popup
  const container = document.getElementById('popup');
  const content = document.getElementById('popup-content');

  const overlay = new Overlay({
    element: container,
    autoPan: {
      animation: {
        duration: 250,
      },
    },
  });

  map.addOverlay(overlay);

  // Ferme le popup en cliquant en dehors ou sur la map
  map.on('click', async function (evt) {
    const feature = map.forEachFeatureAtPixel(evt.pixel, f => f);
    
    if (!feature) {
      overlay.setPosition(undefined);
      return;
    }

    const properties = feature.getProperties();
    const dealId = properties.id;
    
    // Affiche le popup seulement pour les deals (avec propriété id)
    if (!dealId && !properties.country) {
      overlay.setPosition(undefined);
      return;
    }

    // Construit le HTML du popup avec les infos du deal
    let popupHtml = '';
    
    // Titre avec ID et Pays
    if (properties.country) {
      popupHtml += `<div class="popup-deal-title">Transaction #${properties.id} - ${properties.country}</div>`;
    }
    
    // Informations principales
    popupHtml += '<div class="popup-fields">';
    
    // Surface en hectares
    if (properties.surface_ha) {
      popupHtml += `
        <div class="popup-field">
          <div class="popup-field-label">Surface</div>
          <div class="popup-field-value">${properties.surface_ha.toLocaleString()} ha</div>
        </div>
      `;
    }
    
    // Année de création
    if (properties.created_at) {
      popupHtml += `
        <div class="popup-field">
          <div class="popup-field-label">Année</div>
          <div class="popup-field-value">${properties.created_at}</div>
        </div>
      `;
    }
    
    // Région géographique
    if (properties.region) {
      popupHtml += `
        <div class="popup-field">
          <div class="popup-field-label">Région</div>
          <div class="popup-field-value">${properties.region}</div>
        </div>
      `;
    }
    
    // Cultures cultivées
    if (properties.crops) {
      popupHtml += `
        <div class="popup-field">
          <div class="popup-field-label">Cultures</div>
          <div class="popup-field-value">${properties.crops}</div>
        </div>
      `;
    }
    
    // Communautés et consultation
    if (properties.indigenous_people_or_local_communities !== undefined) {
      const hasIndigenous = properties.indigenous_people_or_local_communities ? 'Oui' : 'Non';
      popupHtml += `
        <div class="popup-field">
          <div class="popup-field-label">Communautés locales</div>
          <div class="popup-field-value">${hasIndigenous}</div>
        </div>
      `;
    }
    
    // Consultation communautaire effectuée
    if (properties.community_consultation) {
      popupHtml += `
        <div class="popup-field">
          <div class="popup-field-label">Consultation communautaire</div>
          <div class="popup-field-value">${properties.community_consultation}</div>
        </div>
      `;
    }
    
    // Réaction de la communauté
    if (properties.community_reaction) {
      popupHtml += `
        <div class="popup-field">
          <div class="popup-field-label">Réaction communauté</div>
          <div class="popup-field-value">${properties.community_reaction}</div>
        </div>
      `;
    }

    // Indicateur fictif : consultation réussie (cabinet)
    const consultingSuccess =
      properties.community_reaction === 'Consent' &&
      properties.impact_violence === false &&
      properties.impact_eviction === false;

    popupHtml += `
      <div class="popup-field">
        <div class="popup-field-label">Consultation réussie (cabinet)</div>
        <div class="popup-field-value">${consultingSuccess ? 'Oui' : 'Non'}</div>
      </div>
    `;
    
    // Section Impacts (négatifs pour les communautés)
    popupHtml += '<div class="popup-section-title">Impacts</div>';
    
    const impacts = [
      { key: 'impact_violence', label: 'Violence' },
      { key: 'impact_eviction', label: 'Expulsion' },
      { key: 'impact_displacement', label: 'Déplacement' },
      { key: 'impact_environmental_degradation', label: 'Dégradation env.' },
    ];
    
    // Affiche chaque impact avec son statut
    impacts.forEach(impact => {
      if (properties[impact.key] !== undefined) {
        const value = properties[impact.key] ? 'Oui' : 'Non';
        popupHtml += `
          <div class="popup-field">
            <div class="popup-field-label">${impact.label}</div>
            <div class="popup-field-value">${value}</div>
          </div>
        `;
      }
    });
    
    // Section Avantages pour les communautés
    if (properties.materialized_benefits_for_local_communities) {
      popupHtml += '<div class="popup-section-title">Avantages pour les communautés</div>';
      popupHtml += `
        <div class="popup-field">
          <div class="popup-field-label">Bénéfices réalisés</div>
          <div class="popup-field-value">${properties.materialized_benefits_for_local_communities}</div>
        </div>
      `;
    }
    
    popupHtml += '</div>';
    
    content.innerHTML = popupHtml;
    overlay.setPosition(evt.coordinate);
  });

  return overlay;
}
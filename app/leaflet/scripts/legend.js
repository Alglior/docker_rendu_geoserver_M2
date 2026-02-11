import legendContent from '../templates/legend-content.html?raw';
import legendIconUrl from '../../images/legend_icone.png';

/**
 * Initialise et configure la légende de la carte
 * @param {L.Map} map - Instance de la carte Leaflet
 */
export async function initializeLegend(map) {
  // Créer le conteneur de la légende
  const legend = document.createElement('div');
  legend.id = 'map-legend';
  legend.className = 'map-legend';
  
  // Afficher la légende par défaut
  legend.style.display = 'block';
  
  // Charger le contenu de la légende depuis le template importé
  legend.innerHTML = legendContent;
  
  // Ajouter la légende au conteneur de la carte
  document.getElementById('map').appendChild(legend);
  
  // Créer le bouton pour afficher/masquer la légende
  const legendButton = document.createElement('button');
  legendButton.id = 'legend-btn';
  legendButton.className = 'legend-btn';
  legendButton.innerHTML = `<img src="${legendIconUrl}" alt="Légende" />`;
  legendButton.title = 'Afficher la legende';

  document.getElementById('map').appendChild(legendButton);

  // Basculer la visibilité de la légende
  const toggleLegendVisibility = (show) => {
    legend.style.display = show ? 'block' : 'none';
    legendButton.classList.toggle('active', show);
  };

  legendButton.addEventListener('click', () => {
    toggleLegendVisibility(legend.style.display === 'none');
  });
  
  // Bouton de fermeture dans la légende
  const legendToggle = legend.querySelector('.legend-toggle');
  if (legendToggle) {
    legendToggle.addEventListener('click', () => {
      toggleLegendVisibility(false);
    });
  }
}

/**
 * Affiche ou masque la légende de manière programmatique
 * @param {boolean} show - True pour afficher, false pour masquer
 */
function setLegendVisibility(show) {
  const legend = document.getElementById('map-legend');
  const legendBtn = document.getElementById('legend-btn');
  
  if (legend) {
    legend.style.display = show ? 'block' : 'none';
    legendBtn?.classList.toggle('active', show);
  }
}

/**
 * Affiche la légende de manière programmatique
 */
export function showLegend() {
  setLegendVisibility(true);
}

/**
 * Masque la légende de manière programmatique
 */
export function hideLegend() {
  setLegendVisibility(false);
}

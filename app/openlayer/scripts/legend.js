/**
 * Initialize and configure the map legend
 * @param {Map} map - The OpenLayers map instance
 */
export async function initializeLegend(map) {
  // Create legend container
  const legend = document.createElement('div');
  legend.id = 'map-legend';
  legend.className = 'map-legend';
  
  // Show the legend by default
  legend.style.display = 'block';
  
  // Load legend content from HTML file
  try {
    const response = await fetch('/openlayer/templates/legend-content.html');
    const html = await response.text();
    legend.innerHTML = html;
  } catch (error) {
    console.error('Error loading legend content:', error);
    legend.innerHTML = '<div class="legend-header"><h4>Legende</h4></div><div class="legend-content">Erreur de chargement</div>';
  }
  
  // Add legend to map
  document.getElementById('map').appendChild(legend);
  
  // Create legend button to show/hide
  const legendButton = document.createElement('button');
  legendButton.id = 'legend-btn';
  legendButton.className = 'legend-btn';
  legendButton.innerHTML = '<img src="/images/legend_icone.png" alt="Légende" />';
  legendButton.title = 'Afficher la legende';

  document.getElementById('map').appendChild(legendButton);

  // Toggle legend visibility
  const toggleLegendVisibility = (show) => {
    legend.style.display = show ? 'block' : 'none';
    legendButton.classList.toggle('active', show);
  };

  legendButton.addEventListener('click', () => {
    toggleLegendVisibility(legend.style.display === 'none');
  });
  
  // Close button inside legend
  const legendToggle = legend.querySelector('.legend-toggle');
  if (legendToggle) {
    legendToggle.addEventListener('click', () => {
      toggleLegendVisibility(false);
    });
  }
}

/**
 * Show or hide the legend programmatically
 * @param {boolean} show - True to show, false to hide
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
 * Show the legend programmatically
 */
export function showLegend() {
  setLegendVisibility(true);
}

/**
 * Hide the legend programmatically
 */
export function hideLegend() {
  setLegendVisibility(false);
}
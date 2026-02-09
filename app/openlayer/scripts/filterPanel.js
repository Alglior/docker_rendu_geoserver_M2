/**
 * Gère le panel de filtres fixé à droite de la carte
 * Le panel reste toujours visible
 */
class FilterPanel {
  constructor() {
    this.filterPanel = document.getElementById('filter-panel');
    this.initializePanel();
  }

  /**
   * Initialise le panel de filtres
   */
  initializePanel() {
    if (!this.filterPanel) {
      console.warn('Panel de filtres non trouvé');
      return;
    }
    
    // S'assure que le panel est visible par défaut
    this.filterPanel.style.transform = 'translateX(0)';
  }
}

export default FilterPanel;

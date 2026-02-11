/**
 * Gère la modal de sélection des couches de base et de contexte
 */
class LayerSwitcherModal {
    /**
     * @param {L.Map} map - Instance de la carte Leaflet
     * @param {Object} baseLayers - Object contenant les couches de base
     * @param {Object} overlayLayers - Object contenant les couches de contexte
     */
    constructor(map, baseLayers, overlayLayers) {
        this.map = map;
        this.baseLayers = baseLayers;
        this.overlayLayers = overlayLayers;
        this.currentBaseLayer = 'osm';
        
        this.initializeElements();
        this.setupEventListeners();
    }
    
    /**
     * Initialise les éléments DOM
     */
    initializeElements() {
        this.layerSwitcherBtn = document.getElementById('layer-switcher-btn');
        this.layerModal = document.getElementById('layer-modal');
        this.closeModalSpan = this.layerModal?.querySelector('.close-modal');
        this.layerOptions = this.layerModal?.querySelectorAll('.layer-option');
        this.overlayOptions = this.layerModal?.querySelectorAll('.overlay-option input');
        
        if (!this.layerSwitcherBtn || !this.layerModal) {
            console.error('Éléments DOM manquants pour le LayerSwitcherModal');
        }
    }

    /**
     * Configure les écouteurs d'événements
     */
    setupEventListeners() {
        // Ouvrir la modal
        this.layerSwitcherBtn?.addEventListener('click', () => this.openModal());

        // Fermer la modal avec le bouton
        this.closeModalSpan?.addEventListener('click', () => this.closeModal());
        
        // Fermer la modal en cliquant en dehors
        window.addEventListener('click', (event) => {
            if (event.target === this.layerModal) {
                this.closeModal();
            }
        });

        this.setupLayerSwitching();
        this.setupOverlaySwitching();
    }

    /**
     * Configure le changement des couches de base
     */
    setupLayerSwitching() {
        if (!this.layerOptions) return;
        
        this.layerOptions.forEach(option => {
            option.addEventListener('click', () => {
                const layerType = option.getAttribute('data-layer');
                this.switchLayer(layerType);
                this.updateActiveOption(option);
                this.closeModal();
            });
        });
    }

    /**
     * Configure l'affichage/masquage des couches de contexte
     */
    setupOverlaySwitching() {
        if (!this.overlayOptions) return;

        this.overlayOptions.forEach(option => {
            const overlayKey = option.getAttribute('data-overlay');
            if (!overlayKey) return;

            option.addEventListener('change', () => {
                this.toggleOverlay(overlayKey, option.checked);
            });
        });
    }
    
    /**
     * Change la couche de base affichée
     * @param {string} layerType - Clé de la couche de base
     */
    switchLayer(layerType) {
        // Retirer l'ancienne couche de base
        if (this.baseLayers[this.currentBaseLayer]) {
            this.map.removeLayer(this.baseLayers[this.currentBaseLayer]);
        }
        
        // Ajouter la nouvelle couche de base
        if (this.baseLayers[layerType]) {
            this.baseLayers[layerType].addTo(this.map);
            this.currentBaseLayer = layerType;
        } else {
            console.warn(`Couche "${layerType}" non trouvée dans la configuration`);
        }
    }

    /**
     * Affiche ou masque une couche de contexte
     * @param {string} overlayKey - Clé de la couche de contexte
     * @param {boolean} visible - Visibilité de la couche
     */
    toggleOverlay(overlayKey, visible) {
        const layer = this.overlayLayers[overlayKey];
        
        if (layer) {
            if (visible) {
                layer.addTo(this.map);
            } else {
                this.map.removeLayer(layer);
            }
        } else {
            console.warn(`Couche de contexte "${overlayKey}" introuvable`);
        }
    }
    
    /**
     * Met à jour l'option active visuellement
     * @param {HTMLElement} activeOption - Élément de l'option active
     */
    updateActiveOption(activeOption) {
        this.layerOptions.forEach(opt => opt.classList.remove('active'));
        activeOption.classList.add('active');
    }

    /**
     * Ouvre la modal
     */
    openModal() {
        if (this.layerModal) {
            this.layerModal.style.display = 'block';
        }
    }

    /**
     * Ferme la modal
     */
    closeModal() {
        if (this.layerModal) {
            this.layerModal.style.display = 'none';
        }
    }
}

export default LayerSwitcherModal;

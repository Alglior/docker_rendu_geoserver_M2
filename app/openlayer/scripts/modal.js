import{OSM, XYZ} from 'ol/source';
import Map from 'ol/Map'
class LayerSwitcherModal {
    /**
     * @param {import('ol/Map').default} map
     * @param {Object} layersConfig
     * @param {string} modalId - default: 'layer-modal')
     * @param {string} buttonId - default: 'layer-switcher-btn')
     */
    constructor(map, layersConfig = null, modalId = 'layer-modal', buttonId = 'layer-switcher-btn') {
        this.map = map;
        this.modalId = modalId;
        this.buttonId = buttonId;
        
        // Transmission de la configuration des couches ou des fonds de carte par défaut utilisés
        this.layers = layersConfig || this.getDefaultLayers();
        

        this.initializeElements();
        

        this.setupEventListeners();
    }
    
    /**

     * @returns {Object}
     */
    getDefaultLayers() {
        return {
            osm: new OSM(),
            satellite: new XYZ({
                url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                attributions: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            }),
            terrain: new XYZ({
                url: 'https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png',
                attributions: 'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)'
            })
        };
    }
    
    /**
     * Initialise les éléments DOM
     */
    initializeElements() {
        this.layerSwitcherBtn = document.getElementById(this.buttonId);
        this.layerModal = document.getElementById(this.modalId);
        this.closeModalSpan = this.layerModal?.querySelector('.close-modal');
        this.layerOptions = this.layerModal?.querySelectorAll('.layer-option');
        this.overlayOptions = this.layerModal?.querySelectorAll('.overlay-option input');
        
        if (!this.layerSwitcherBtn || !this.layerModal) {
            console.error('Éléments DOM manquants pour le LayerSwitcherModal');
        }
    }

    setupEventListeners() {

        this.layerSwitcherBtn?.addEventListener('click', () => this.openModal());

        this.closeModalSpan?.addEventListener('click', () => this.closeModal());
        
        // Fermer la modal en cliquant à l'extérieur
        window.addEventListener('click', (event) => {
            if (event.target === this.layerModal) {
                this.closeModal();
            }
        });

        this.setupLayerSwitching();
        this.setupOverlaySwitching();
    }

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

    setupOverlaySwitching() {
        if (!this.overlayOptions) return;

        this.overlayOptions.forEach(option => {
            const overlayKey = option.getAttribute('data-overlay');
            if (!overlayKey) return;

            this.toggleOverlay(overlayKey, option.checked);

            option.addEventListener('change', () => {
                this.toggleOverlay(overlayKey, option.checked);
            });
        });
    }
    
    /**
     * @param {string} layerType
     */
    switchLayer(layerType) {
        const newSource = this.layers[layerType];
        
        
        if (newSource) {
            const baseLayer = this.map.getLayers().item(0);
            baseLayer.setSource(newSource);
        } else {
            console.warn(`Couche "${layerType}" non trouvée dans la configuration`);
        }
    }

    /**
     * @param {string} overlayKey
     * @param {boolean} visible
     */
    toggleOverlay(overlayKey, visible) {
        const layer = this.map
            .getLayers()
            .getArray()
            .find(item => item.get('id') === overlayKey);

        if (layer) {
            layer.setVisible(visible);
        } else {
            console.warn(`Couche de contexte "${overlayKey}" introuvable`);
        }
    }
    
    /**
     * @param {HTMLElement} activeOption
     */
    updateActiveOption(activeOption) {
        this.layerOptions.forEach(opt => opt.classList.remove('active'));
        activeOption.classList.add('active');
    }

    openModal() {
        if (this.layerModal) {
            this.layerModal.style.display = 'block';
        }
    }

    closeModal() {
        if (this.layerModal) {
            this.layerModal.style.display = 'none';
        }
    }
    
    /**
     *
     * @param {string} key
     * @param {import('ol/source/Source').default} source - Source OpenLayers
     */
    addLayer(key, source) {
        this.layers[key] = source;
    }
    
    /**
     *
     * @param {string} key
     */
    removeLayer(key) {
        delete this.layers[key];
    }

    destroy() {
        console.log('LayerSwitcherModal destroyed');
    }
}

// Export de la classe
export default LayerSwitcherModal;
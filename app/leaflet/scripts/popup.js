/**
 * Crée le contenu HTML du popup pour une transaction agricole
 * @param {Object} properties - Propriétés de la feature GeoJSON
 * @returns {string} HTML du popup
 */
function createPopupContent(properties) {
    let html = `<div class="popup-deal-title">Transaction #${properties.id}`;
    if (properties.country) html += ` - ${properties.country}`;
    html += '</div><div class="popup-fields">';
    
    // Surface
    if (properties.surface_ha) {
        html += `
            <div class="popup-field">
                <div class="popup-field-label">Surface</div>
                <div class="popup-field-value">${properties.surface_ha.toLocaleString()} ha</div>
            </div>
        `;
    }
    
    // Année de création
    if (properties.created_at) {
        html += `
            <div class="popup-field">
                <div class="popup-field-label">Année</div>
                <div class="popup-field-value">${properties.created_at}</div>
            </div>
        `;
    }
    
    // Région
    if (properties.region) {
        html += `
            <div class="popup-field">
                <div class="popup-field-label">Région</div>
                <div class="popup-field-value">${properties.region}</div>
            </div>
        `;
    }
    
    // Cultures
    if (properties.crops) {
        html += `
            <div class="popup-field">
                <div class="popup-field-label">Cultures</div>
                <div class="popup-field-value">${properties.crops}</div>
            </div>
        `;
    }
    
    // Communautés locales
    if (properties.indigenous_people_or_local_communities !== undefined) {
        const hasIndigenous = properties.indigenous_people_or_local_communities ? 'Oui' : 'Non';
        html += `
            <div class="popup-field">
                <div class="popup-field-label">Communautés locales</div>
                <div class="popup-field-value">${hasIndigenous}</div>
            </div>
        `;
    }
    
    // Consultation communautaire
    if (properties.community_consultation) {
        html += `
            <div class="popup-field">
                <div class="popup-field-label">Consultation communautaire</div>
                <div class="popup-field-value">${properties.community_consultation}</div>
            </div>
        `;
    }
    
    // Réaction de la communauté
    if (properties.community_reaction) {
        html += `
            <div class="popup-field">
                <div class="popup-field-label">Réaction communauté</div>
                <div class="popup-field-value">${properties.community_reaction}</div>
            </div>
        `;
    }
    
    // Indicateur consultation réussie (cabinet)
    const consultingSuccess = properties.community_reaction === 'Consent' &&
                             properties.impact_violence === false &&
                             properties.impact_eviction === false;
    html += `
        <div class="popup-field">
            <div class="popup-field-label">Consultation réussie (cabinet)</div>
            <div class="popup-field-value">${consultingSuccess ? 'Oui' : 'Non'}</div>
        </div>
    `;
    
    // Section Impacts
    html += '<div class="popup-section-title">Impacts</div>';
    
    const impacts = [
        { key: 'impact_violence', label: 'Violence' },
        { key: 'impact_eviction', label: 'Expulsion' },
        { key: 'impact_displacement', label: 'Déplacement' },
        { key: 'impact_environmental_degradation', label: 'Dégradation env.' }
    ];
    
    impacts.forEach(impact => {
        if (properties[impact.key] !== undefined) {
            const value = properties[impact.key] ? 'Oui' : 'Non';
            html += `
                <div class="popup-field">
                    <div class="popup-field-label">${impact.label}</div>
                    <div class="popup-field-value">${value}</div>
                </div>
            `;
        }
    });
    
    // Avantages pour les communautés
    if (properties.materialized_benefits_for_local_communities) {
        html += '<div class="popup-section-title">Avantages pour les communautés</div>';
        html += `
            <div class="popup-field">
                <div class="popup-field-label">Bénéfices réalisés</div>
                <div class="popup-field-value">${properties.materialized_benefits_for_local_communities}</div>
            </div>
        `;
    }
    
    html += '</div>';
    return html;
}

export { createPopupContent };

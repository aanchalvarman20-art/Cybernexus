// ============================================
// SEARCH FUNCTIONALITY
// Autocomplete and entity search
// ============================================

let searchFilter = 'all';
let searchResults = [];

// Initialize search
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const suggestions = document.getElementById('searchSuggestions');
    
    if (!searchInput) return;
    
    // Input event for autocomplete
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        if (query.length >= 2) {
            showSuggestions(query);
        } else {
            suggestions.classList.remove('active');
        }
    });
    
    // Search button click
    searchBtn?.addEventListener('click', () => {
        performSearch(searchInput.value.trim());
    });
    
    // Enter key to search
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch(searchInput.value.trim());
            suggestions.classList.remove('active');
        }
    });
    
    // Click outside to close suggestions
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestions.contains(e.target)) {
            suggestions.classList.remove('active');
        }
    });
    
    // Setup filter chips
    document.querySelectorAll('.chip[data-search-type]').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.chip[data-search-type]').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            searchFilter = chip.dataset.searchType;
            
            // Re-perform search if there's a query
            if (searchInput.value.trim()) {
                performSearch(searchInput.value.trim());
            }
        });
    });
}

// Show autocomplete suggestions
function showSuggestions(query) {
    const suggestions = document.getElementById('searchSuggestions');
    if (!suggestions) return;
    
    const lowerQuery = query.toLowerCase();
    
    // Find matching entities
    const matches = window.threatData.entities.filter(entity => {
        const nameMatch = entity.name.toLowerCase().includes(lowerQuery);
        const descMatch = entity.description.toLowerCase().includes(lowerQuery);
        const typeMatch = searchFilter === 'all' || entity.type === searchFilter;
        return (nameMatch || descMatch) && typeMatch;
    }).slice(0, 8); // Limit to 8 suggestions
    
    if (matches.length === 0) {
        suggestions.classList.remove('active');
        return;
    }
    
    suggestions.innerHTML = '';
    
    matches.forEach(entity => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 1.5rem;">${window.threatData.entityConfig[entity.type].icon}</span>
                <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 4px;">
                        ${highlightMatch(entity.name, query)}
                    </div>
                    <div style="font-size: 0.85rem; color: #718096;">
                        ${window.threatData.entityConfig[entity.type].label}
                    </div>
                </div>
                <span class="severity-badge ${entity.severity}">${entity.severity}</span>
            </div>
        `;
        
        item.addEventListener('click', () => {
            showEntityDetails(entity.id);
            suggestions.classList.remove('active');
            document.getElementById('searchInput').value = entity.name;
        });
        
        suggestions.appendChild(item);
    });
    
    suggestions.classList.add('active');
}

// Highlight matching text
function highlightMatch(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span style="color: #00d9ff; background: rgba(0, 217, 255, 0.1);">$1</span>');
}

// Perform search
function performSearch(query) {
    showLoading();
    
    if (!query) {
        document.getElementById('searchResults').innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: #718096;">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                <p style="font-size: 1.1rem;">Enter a search query to find threats</p>
            </div>
        `;
        hideLoading();
        return;
    }
    
    // Simulate search delay
    setTimeout(() => {
        const lowerQuery = query.toLowerCase();
        
        // Search entities
        searchResults = window.threatData.entities.filter(entity => {
            const nameMatch = entity.name.toLowerCase().includes(lowerQuery);
            const descMatch = entity.description.toLowerCase().includes(lowerQuery);
            const typeMatch = searchFilter === 'all' || entity.type === searchFilter;
            
            // Also search in attributes
            let attrMatch = false;
            if (entity.attributes) {
                attrMatch = Object.values(entity.attributes).some(val => 
                    String(val).toLowerCase().includes(lowerQuery)
                );
            }
            
            return (nameMatch || descMatch || attrMatch) && typeMatch;
        });
        
        displaySearchResults();
        hideLoading();
    }, 500);
}

// Display search results
function displaySearchResults() {
    const resultsContainer = document.getElementById('searchResults');
    if (!resultsContainer) return;
    
    if (searchResults.length === 0) {
        resultsContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: #718096;">
                <i class="fas fa-exclamation-circle" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                <p style="font-size: 1.1rem;">No results found</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">Try adjusting your search terms or filters</p>
            </div>
        `;
        return;
    }
    
    resultsContainer.innerHTML = '';
    
    searchResults.forEach(entity => {
        const card = createResultCard(entity);
        resultsContainer.appendChild(card);
    });
}

// Create result card
function createResultCard(entity) {
    const card = document.createElement('div');
    card.className = 'result-card';
    
    // Get connections count
    const connections = window.threatData.relationships.filter(rel => 
        rel.source === entity.id || rel.target === entity.id
    ).length;
    
    // Format attributes
    const attrs = entity.attributes ? Object.entries(entity.attributes).slice(0, 3) : [];
    const attrsList = attrs.map(([key, val]) => `
        <div style="margin-bottom: 4px;">
            <span style="color: #718096; font-size: 0.85rem;">${key}:</span>
            <span style="color: #a0aec0; font-size: 0.85rem; font-weight: 500;">${val}</span>
        </div>
    `).join('');
    
    card.innerHTML = `
        <div class="result-header">
            <span class="result-type" style="background: ${window.threatData.entityConfig[entity.type].color}20; 
                  border-color: ${window.threatData.entityConfig[entity.type].color}; 
                  color: ${window.threatData.entityConfig[entity.type].color};">
                ${window.threatData.entityConfig[entity.type].label}
            </span>
            <span class="severity-badge ${entity.severity}">${entity.severity}</span>
        </div>
        <div class="result-title">
            ${window.threatData.entityConfig[entity.type].icon} ${entity.name}
        </div>
        <div class="result-description">
            ${entity.description}
        </div>
        ${attrsList ? `<div style="margin-bottom: 1rem;">${attrsList}</div>` : ''}
        <div class="result-meta">
            <span class="meta-item">
                <i class="fas fa-calendar"></i>
                ${formatDate(entity.lastSeen)}
            </span>
            <span class="meta-item">
                <i class="fas fa-link"></i>
                ${connections} connections
            </span>
            <span class="meta-item">
                <i class="fas fa-chart-line"></i>
                ${entity.confidence}% confidence
            </span>
        </div>
    `;
    
    card.addEventListener('click', () => {
        showEntityDetails(entity.id);
    });
    
    return card;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
}

// Show entity details in modal
function showEntityDetails(entityId) {
    const entity = window.threatData.entities.find(e => e.id === entityId);
    if (!entity) return;
    
    const modal = document.getElementById('entityModal');
    const details = document.getElementById('entityDetails');
    
    // Get related entities
    const relatedIds = new Set();
    window.threatData.relationships.forEach(rel => {
        if (rel.source === entityId) relatedIds.add(rel.target);
        if (rel.target === entityId) relatedIds.add(rel.source);
    });
    
    const relatedEntities = Array.from(relatedIds)
        .map(id => window.threatData.entities.find(e => e.id === id))
        .filter(e => e);
    
    // Build attributes HTML
    const attributesHTML = entity.attributes ? Object.entries(entity.attributes).map(([key, val]) => `
        <div class="detail-item">
            <div class="detail-label">${key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
            <div class="detail-value">${val}</div>
        </div>
    `).join('') : '';
    
    // Build related entities HTML
    const relatedHTML = relatedEntities.map(e => `
        <div class="related-entity" onclick="showEntityDetails('${e.id}')">
            <span>${window.threatData.entityConfig[e.type].icon} ${e.name}</span>
            <span class="severity-badge ${e.severity}">${e.severity}</span>
        </div>
    `).join('');
    
    details.innerHTML = `
        <div class="entity-header">
            <div class="entity-icon-large" style="background: ${window.threatData.entityConfig[entity.type].color}20; 
                 color: ${window.threatData.entityConfig[entity.type].color};">
                ${window.threatData.entityConfig[entity.type].icon}
            </div>
            <div class="entity-info">
                <h2>${entity.name}</h2>
                <p style="color: #a0aec0; margin-bottom: 0.5rem;">${entity.description}</p>
                <div class="entity-tags">
                    <span class="entity-tag">${window.threatData.entityConfig[entity.type].label}</span>
                    <span class="entity-tag" style="background: ${getSeverityColor(entity.severity)}20; 
                          border-color: ${getSeverityColor(entity.severity)}; 
                          color: ${getSeverityColor(entity.severity)};">
                        ${entity.severity.toUpperCase()}
                    </span>
                    <span class="entity-tag" style="background: rgba(0, 255, 159, 0.1); 
                          border-color: #00ff9f; color: #00ff9f;">
                        ${entity.confidence}% Confidence
                    </span>
                </div>
            </div>
        </div>
        
        <div class="entity-section">
            <h3><i class="fas fa-info-circle"></i> Details</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Entity ID</div>
                    <div class="detail-value">${entity.id}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">First Seen</div>
                    <div class="detail-value">${entity.firstSeen}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Last Seen</div>
                    <div class="detail-value">${entity.lastSeen}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Connections</div>
                    <div class="detail-value">${relatedEntities.length}</div>
                </div>
            </div>
        </div>
        
        ${attributesHTML ? `
        <div class="entity-section">
            <h3><i class="fas fa-list"></i> Attributes</h3>
            <div class="detail-grid">
                ${attributesHTML}
            </div>
        </div>
        ` : ''}
        
        ${relatedHTML ? `
        <div class="entity-section">
            <h3><i class="fas fa-network-wired"></i> Related Entities (${relatedEntities.length})</h3>
            <div class="related-entities">
                ${relatedHTML}
            </div>
        </div>
        ` : ''}
        
        <div class="entity-section">
            <h3><i class="fas fa-shield-halved"></i> Actions</h3>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                <button class="btn-secondary" onclick="addToBlocklist('${entity.id}')">
                    <i class="fas fa-ban"></i> Add to Blocklist
                </button>
                <button class="btn-secondary" onclick="exportEntityReport('${entity.id}')">
                    <i class="fas fa-download"></i> Export Report
                </button>
                <button class="btn-secondary" onclick="showInNetwork('${entity.id}')">
                    <i class="fas fa-diagram-project"></i> View in Network
                </button>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

// Export entity report
function exportEntityReport(entityId) {
    const entity = window.threatData.entities.find(e => e.id === entityId);
    if (!entity) return;
    
    showLoading();
    
    setTimeout(() => {
        const report = {
            entity: entity,
            exportDate: new Date().toISOString(),
            connections: window.threatData.relationships.filter(rel => 
                rel.source === entityId || rel.target === entityId
            )
        };
        
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${entity.name.replace(/[^a-z0-9]/gi, '_')}_report_${Date.now()}.json`;
        link.click();
        window.URL.revokeObjectURL(url);
        
        hideLoading();
        showNotification(`Report for ${entity.name} has been exported`, 'success');
    }, 800);
}

// Show entity in network map
function showInNetwork(entityId) {
    closeModal();
    scrollToSection('network');
    
    // Highlight the entity in network after a brief delay
    setTimeout(() => {
        // This would integrate with the network visualization
        showNotification(`Focused on entity in network map`, 'info');
    }, 1000);
}

// Initialize search when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSearch);
} else {
    initializeSearch();
}

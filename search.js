// ============================================
// SEARCH & ENTITY DETAILS (With Live IP Intel)
// ============================================

let searchFilter = 'all';
let searchResults = [];

// 1. INITIALIZE SEARCH
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    if (!searchInput) return;
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch(searchInput.value.trim());
    });
    
    searchBtn?.addEventListener('click', () => {
        performSearch(searchInput.value.trim());
    });
    
    // Setup filter chips
    document.querySelectorAll('.chip[data-search-type]').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.chip[data-search-type]').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            searchFilter = chip.dataset.searchType;
            if (searchInput.value.trim()) performSearch(searchInput.value.trim());
        });
    });
}

function performSearch(query) {
    if(window.showLoading) window.showLoading();
    
    setTimeout(() => {
        const lowerQuery = query.toLowerCase();
        
        // Combine static data AND live data
        let allEntities = [];
        if (window.threatData && window.threatData.entities) {
            allEntities = [...window.threatData.entities];
        }
        if (window.currentThreatData) {
            // Map live threats to entity format
            const liveEntities = window.currentThreatData.map(t => ({
                id: t.entityId,
                name: t.entity,
                type: 'malware', // Defaulting live items to malware type for search
                description: t.prediction || t.description,
                severity: t.severity
            }));
            allEntities = [...liveEntities, ...allEntities];
        }
        
        searchResults = allEntities.filter(entity => {
            const nameMatch = entity.name.toLowerCase().includes(lowerQuery);
            const typeMatch = searchFilter === 'all' || entity.type === searchFilter;
            return nameMatch && typeMatch;
        });
        
        displaySearchResults();
        if(window.hideLoading) window.hideLoading();
    }, 400); 
}

function displaySearchResults() {
    const resultsContainer = document.getElementById('searchResults');
    if (!resultsContainer) return;
    resultsContainer.innerHTML = '';
    
    if (searchResults.length === 0) {
        resultsContainer.innerHTML = `<div style="text-align: center; color: #718096; padding: 2rem;">No intel found.</div>`;
        return;
    }
    
    searchResults.forEach(entity => {
        const config = (window.threatData && window.threatData.entityConfig[entity.type]) || { label: 'Threat', color: '#fff', icon: '!' };
        const card = document.createElement('div');
        card.className = 'result-card';
        card.innerHTML = `
            <div class="result-header">
                <span class="result-type" style="color: ${config.color}; border: 1px solid ${config.color}; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem;">${config.label}</span>
                <span class="severity-badge ${entity.severity}">${entity.severity}</span>
            </div>
            <div class="result-title" style="margin: 10px 0; font-size: 1.1rem; font-weight: bold;">
                ${config.icon} ${entity.name}
            </div>
            <div class="result-description" style="color: #a0aec0; font-size: 0.9rem;">
                ${entity.description ? entity.description.substring(0, 100) + '...' : 'No details available'}
            </div>
        `;
        card.addEventListener('click', () => showEntityDetails(entity.id));
        resultsContainer.appendChild(card);
    });
}

// 3. SHOW ENTITY DETAILS (The Fix for Clicking Live Items)
function showEntityDetails(entityId) {
    let entity = null;

    // A. Check Static Data first
    if (window.threatData && window.threatData.entities) {
        entity = window.threatData.entities.find(e => e.id === entityId);
    }
    
    // B. If not found, Check LIVE Data (This fixes your issue!)
    if (!entity && window.currentThreatData) {
        const liveMatch = window.currentThreatData.find(t => t.entityId === entityId);
        if (liveMatch) {
            // Convert live format to UI format
            entity = {
                id: liveMatch.entityId,
                name: liveMatch.entity,
                type: liveMatch.type || 'malware',
                severity: liveMatch.severity,
                confidence: liveMatch.confidence,
                description: liveMatch.prediction,
                attributes: {
                    "Attacker": liveMatch.attacker,
                    "Tool": liveMatch.tool,
                    "NIST Score": liveMatch.nist_score,
                    "Vendor": liveMatch.vendor
                }
            };
        }
    }

    if (!entity) return; // Still not found? Exit.
    
    const modal = document.getElementById('entityModal');
    const details = document.getElementById('entityDetails');
    const config = (window.threatData && window.threatData.entityConfig[entity.type]) || { icon: '?', color: '#00d9ff' };
    
    // --- GEO IP LOGIC ---
    let liveDataHTML = '';
    // If it looks like an IP
    if (entity.type === 'ip' || (entity.name && entity.name.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/))) {
        liveDataHTML = `
            <div class="entity-section" style="margin-top: 1.5rem; border: 1px dashed #00d9ff; padding: 15px; border-radius: 8px; background: rgba(0, 217, 255, 0.05);">
                <h3 style="color: #00d9ff; font-size: 1rem; margin-bottom: 0.5rem;"><i class="fas fa-globe"></i> Live Geopolitical Intel</h3>
                <div id="live-ip-data" style="color: #fff;">
                    <i class="fas fa-circle-notch fa-spin"></i> Triangulating Signal...
                </div>
            </div>
        `;
        setTimeout(() => enrichIPData(entity.name), 100);
    }

    // --- BUILD UI ---
    details.innerHTML = `
        <div class="entity-header" style="display: flex; gap: 20px; align-items: flex-start; margin-bottom: 1.5rem;">
            <div style="font-size: 3rem; color: ${config.color}; background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; border: 1px solid ${config.color};">
                ${config.icon}
            </div>
            <div>
                <h2 style="margin: 0; font-size: 2rem; font-weight: 700;">${entity.name}</h2>
                <div style="display: flex; gap: 10px; margin-top: 10px; align-items: center;">
                    <span class="severity-badge ${entity.severity}" style="font-size: 0.9rem; padding: 4px 12px;">${entity.severity ? entity.severity.toUpperCase() : 'UNKNOWN'}</span>
                    <span style="color: #a0aec0;">|</span>
                    <span style="color: #00ff9f;">${entity.confidence || 90}% Confidence</span>
                </div>
            </div>
        </div>
        
        ${liveDataHTML}

        <div class="entity-section" style="margin-top: 20px;">
            <h3 style="color: #a0aec0; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;">Attributes</h3>
            <div class="detail-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 10px;">
                ${Object.entries(entity.attributes || {}).map(([key, val]) => `
                    <div class="detail-item" style="background: rgba(255,255,255,0.03); padding: 10px; border-radius: 4px;">
                        <div class="detail-label" style="color: #718096; font-size: 0.8rem; margin-bottom: 4px;">${key.toUpperCase()}</div>
                        <div class="detail-value" style="color: #fff;">${val}</div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="entity-section" style="margin-top: 25px;">
            <p style="color: #cbd5e0; line-height: 1.6; font-size: 1rem; border-left: 3px solid ${config.color}; padding-left: 15px;">
                ${entity.description || "No description available."}
            </p>
        </div>

        <div class="entity-section" style="margin-top: 30px; display: flex; gap: 15px;">
            <button class="btn-primary" onclick="if(window.triggerManualReport) window.triggerManualReport()"><i class="fas fa-flag"></i> Report</button>
            <button class="btn-secondary" style="border-color: #ff4d6d; color: #ff4d6d;" onclick="if(window.addToBlocklist) window.addToBlocklist('${entity.id}')"><i class="fas fa-ban"></i> Block Entity</button>
        </div>
    `;
    
    if(modal) modal.classList.add('active');
}
async function enrichIPData(ipAddress) {
    const container = document.getElementById('live-ip-data');
    if (!container) return;

    if (ipAddress.startsWith('192.168') || ipAddress.startsWith('10.') || ipAddress.startsWith('127.')) {
        container.innerHTML = `<span style="color: #ffd93d;">Private Network Address (Localhost)</span>`;
        return;
    }

    try {
        const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
        const data = await response.json();
        
        if (data.error) throw new Error("API Limit");

        container.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.9rem;">
                <div><span style="color:#718096">Country:</span> ${data.country_name} ${data.country_code}</div>
                <div><span style="color:#718096">City:</span> ${data.city}</div>
                <div><span style="color:#718096">ISP:</span> ${data.org}</div>
                <div><span style="color:#718096">ASN:</span> ${data.asn}</div>
            </div>
        `;
    } catch (error) {
        container.innerHTML = `<span style="color: #ff4d6d;">Geolocation Unavailable (API Rate Limit or Network Error)</span>`;
    }
}

// EXPORTS
window.showEntityDetails = showEntityDetails;
window.viewThreatDetails = showEntityDetails; // Alias for Dashboard compatibility
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeSearch);
else initializeSearch();
// ============================================
// DASHBOARD - Charts and Real-time Statistics
// ============================================

let threatTimelineChart;
let threatDistributionChart;
let updateInterval;

// Initialize dashboard
function initializeDashboard() {
    setupCharts();
    populateThreatTable();
    updateMetrics();
    setupDashboardControls();
    startRealTimeUpdates();
}

// Setup Chart.js charts
function setupCharts() {
    // Threat Timeline Chart
    const timelineCtx = document.getElementById('threatTimelineChart');
    if (timelineCtx) {
        threatTimelineChart = new Chart(timelineCtx, {
            type: 'line',
            data: window.threatData.threatTimeline,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#a0aec0',
                            font: {
                                size: 12,
                                family: 'Inter'
                            },
                            padding: 15,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(26, 31, 53, 0.95)',
                        titleColor: '#ffffff',
                        bodyColor: '#a0aec0',
                        borderColor: 'rgba(0, 217, 255, 0.5)',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y} threats`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(0, 217, 255, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#a0aec0',
                            font: {
                                size: 11
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(0, 217, 255, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#a0aec0',
                            font: {
                                size: 11
                            }
                        },
                        beginAtZero: true
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }
    
    // Threat Distribution Chart
    const distributionCtx = document.getElementById('threatDistributionChart');
    if (distributionCtx) {
        threatDistributionChart = new Chart(distributionCtx, {
            type: 'doughnut',
            data: window.threatData.threatDistribution,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'right',
                        labels: {
                            color: '#a0aec0',
                            font: {
                                size: 12,
                                family: 'Inter'
                            },
                            padding: 15,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(26, 31, 53, 0.95)',
                        titleColor: '#ffffff',
                        bodyColor: '#a0aec0',
                        borderColor: 'rgba(0, 217, 255, 0.5)',
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
}

// Populate threat table
function populateThreatTable() {
    const tbody = document.getElementById('threatTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    window.threatData.recentThreats.forEach(threat => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="color: #a0aec0; font-size: 0.9rem;">
                ${threat.timestamp}
            </td>
            <td>
                <span style="color: #ffffff; font-weight: 600;">${threat.type}</span>
            </td>
            <td>
                <span style="font-family: 'Fira Code', monospace; color: #00d9ff; cursor: pointer;" 
                      onclick="showEntityDetails('${threat.entityId}')">
                    ${threat.entity}
                </span>
            </td>
            <td>
                <span class="severity-badge ${threat.severity}">${threat.severity}</span>
            </td>
            <td>
                <div class="confidence-bar">
                    <div class="confidence-fill" style="width: ${threat.confidence}%"></div>
                </div>
                <span style="font-size: 0.85rem; color: #a0aec0; margin-left: 8px;">${threat.confidence}%</span>
            </td>
            <td>
                <div class="action-btns">
                    <button onclick="showEntityDetails('${threat.entityId}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button onclick="addToBlocklist('${threat.entityId}')">
                        <i class="fas fa-ban"></i> Block
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Update metrics
function updateMetrics() {
    // Critical Threats
    const criticalCount = window.threatData.entities.filter(e => e.severity === 'critical').length;
    document.getElementById('criticalThreats').textContent = criticalCount;
    
    // Active Malware
    const malwareCount = window.threatData.entities.filter(e => e.type === 'malware').length;
    document.getElementById('activeMalware').textContent = malwareCount;
    
    // Network Clusters (simulated)
    const clusterCount = Math.floor(window.threatData.entities.length / 3);
    document.getElementById('networkClusters').textContent = clusterCount;
    
    // Monitored IPs
    const ipCount = window.threatData.entities.filter(e => e.type === 'ip').length;
    const totalIPs = ipCount * 1000 + Math.floor(Math.random() * 1000);
    document.getElementById('monitoredIPs').textContent = totalIPs.toLocaleString();
}

// Setup dashboard controls
function setupDashboardControls() {
    document.querySelectorAll('.btn-control[data-timeframe]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.btn-control[data-timeframe]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateTimeframe(btn.dataset.timeframe);
        });
    });
}

// Update timeframe (simulated)
function updateTimeframe(timeframe) {
    showLoading();
    
    // Simulate data loading
    setTimeout(() => {
        // Update charts with simulated data
        if (threatTimelineChart) {
            threatTimelineChart.data.datasets.forEach(dataset => {
                dataset.data = dataset.data.map(() => Math.floor(Math.random() * 80) + 10);
            });
            threatTimelineChart.update();
        }
        
        if (threatDistributionChart) {
            threatDistributionChart.data.datasets[0].data = 
                threatDistributionChart.data.datasets[0].data.map(() => Math.floor(Math.random() * 40) + 5);
            threatDistributionChart.update();
        }
        
        hideLoading();
    }, 800);
}

// Start real-time updates
function startRealTimeUpdates() {
    // Update hero stats with animation
    animateCounter('threatsDetected', 1247, 1250, 2000);
    animateCounter('networksMapping', 89, 92, 2500);
    
    // Periodic updates
    updateInterval = setInterval(() => {
        // Randomly update threat counts
        const currentThreats = parseInt(document.getElementById('threatsDetected').textContent.replace(',', ''));
        const newThreats = currentThreats + Math.floor(Math.random() * 5);
        animateCounter('threatsDetected', currentThreats, newThreats, 1000);
        
        // Update critical threats occasionally
        if (Math.random() > 0.7) {
            const current = parseInt(document.getElementById('criticalThreats').textContent);
            const change = Math.random() > 0.5 ? 1 : -1;
            document.getElementById('criticalThreats').textContent = Math.max(0, current + change);
        }
    }, 10000); // Update every 10 seconds
}

// Animate counter
function animateCounter(elementId, start, end, duration) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const range = end - start;
    const increment = range / (duration / 16); // 60fps
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current).toLocaleString();
    }, 16);
}

// Export threats function
function exportThreats() {
    const data = window.threatData.recentThreats;
    
    // Convert to CSV
    const headers = ['Timestamp', 'Type', 'Entity', 'Severity', 'Confidence', 'Source'];
    const rows = data.map(threat => [
        threat.timestamp,
        threat.type,
        threat.entity,
        threat.severity,
        threat.confidence + '%',
        threat.source
    ]);
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
        csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `threat-report-${Date.now()}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
}

// Add to blocklist (simulated)
function addToBlocklist(entityId) {
    const entity = window.threatData.entities.find(e => e.id === entityId);
    if (!entity) return;
    
    if (confirm(`Add ${entity.name} to blocklist?`)) {
        showLoading();
        setTimeout(() => {
            hideLoading();
            showNotification(`${entity.name} has been added to the blocklist`, 'success');
        }, 1000);
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${type === 'success' ? 'rgba(0, 255, 159, 0.2)' : 'rgba(0, 217, 255, 0.2)'};
        border: 1px solid ${type === 'success' ? '#00ff9f' : '#00d9ff'};
        color: #ffffff;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Populate AI findings
function populateFindings() {
    const findingsList = document.getElementById('findingsList');
    if (!findingsList) return;
    
    findingsList.innerHTML = '';
    
    window.threatData.aiFindings.forEach(finding => {
        const findingItem = document.createElement('div');
        findingItem.className = 'finding-item';
        
        const iconColors = {
            'pattern': '#00d9ff',
            'attribution': '#ff4d6d',
            'cluster': '#b84dff',
            'prediction': '#ff9d00'
        };
        
        const iconNames = {
            'pattern': 'fa-diagram-project',
            'attribution': 'fa-fingerprint',
            'cluster': 'fa-circle-nodes',
            'prediction': 'fa-crystal-ball'
        };
        
        findingItem.innerHTML = `
            <div class="finding-icon" style="background: ${iconColors[finding.type]}20; color: ${iconColors[finding.type]};">
                <i class="fas ${iconNames[finding.type]}"></i>
            </div>
            <div class="finding-content">
                <div class="finding-title">${finding.title}</div>
                <div class="finding-description">${finding.description}</div>
                <div class="finding-meta">
                    <span class="finding-time">
                        <i class="fas fa-clock"></i> ${formatRelativeTime(finding.timestamp)}
                    </span>
                    <span class="finding-confidence">
                        <i class="fas fa-check-circle"></i> ${finding.confidence}% confidence
                    </span>
                    <span style="color: var(--text-muted);">
                        <i class="fas fa-link"></i> ${finding.entities.length} entities
                    </span>
                </div>
            </div>
        `;
        
        findingItem.style.cursor = 'pointer';
        findingItem.addEventListener('click', () => {
            showFindingDetails(finding);
        });
        
        findingsList.appendChild(findingItem);
    });
}

// Format relative time
function formatRelativeTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return date.toLocaleDateString();
}

// Show finding details
function showFindingDetails(finding) {
    const entities = finding.entities.map(id => 
        window.threatData.entities.find(e => e.id === id)
    ).filter(e => e);
    
    const entitiesList = entities.map(e => `
        <div class="related-entity" onclick="showEntityDetails('${e.id}')">
            <span>${window.threatData.entityConfig[e.type].icon} ${e.name}</span>
            <span class="severity-badge ${e.severity}">${e.severity}</span>
        </div>
    `).join('');
    
    const modal = document.getElementById('entityModal');
    const details = document.getElementById('entityDetails');
    
    details.innerHTML = `
        <div class="entity-header">
            <div>
                <h2 style="margin-bottom: 0.5rem;">${finding.title}</h2>
                <span class="entity-tag">${finding.type.toUpperCase()}</span>
                <span class="entity-tag" style="background: rgba(0, 255, 159, 0.1); border-color: #00ff9f; color: #00ff9f;">
                    ${finding.confidence}% Confidence
                </span>
            </div>
        </div>
        
        <div class="entity-section">
            <h3>Description</h3>
            <p style="color: #a0aec0; line-height: 1.8;">${finding.description}</p>
        </div>
        
        <div class="entity-section">
            <h3>Related Entities (${entities.length})</h3>
            <div class="related-entities">
                ${entitiesList}
            </div>
        </div>
        
        <div class="entity-section">
            <h3>Timeline</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Detected</div>
                    <div class="detail-value">${new Date(finding.timestamp).toLocaleString()}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Severity</div>
                    <div class="detail-value" style="color: ${getSeverityColor(finding.severity)};">
                        ${finding.severity.toUpperCase()}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

// Helper to get severity color
function getSeverityColor(severity) {
    const colors = {
        'critical': '#ff4d6d',
        'high': '#ff9d00',
        'medium': '#ffd93d',
        'low': '#00ff9f'
    };
    return colors[severity] || '#00d9ff';
}

// Initialize dashboard when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeDashboard();
        populateFindings();
    });
} else {
    initializeDashboard();
    populateFindings();
}

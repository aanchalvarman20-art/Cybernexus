// ============================================
// NETWORK GRAPH VISUALIZATION
// Using D3.js for interactive network mapping
// ============================================

class NetworkGraph {
    constructor(containerId) {
        this.container = d3.select(containerId);
        this.width = this.container.node().clientWidth;
        this.height = this.container.node().clientHeight;
        
        this.svg = this.container.append('svg')
            .attr('width', this.width)
            .attr('height', this.height);
        
        // Create groups for different layers
        this.linkGroup = this.svg.append('g').attr('class', 'links');
        this.nodeGroup = this.svg.append('g').attr('class', 'nodes');
        
        // Initialize zoom behavior
        this.zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                this.linkGroup.attr('transform', event.transform);
                this.nodeGroup.attr('transform', event.transform);
            });
        
        this.svg.call(this.zoom);
        
        // Initialize force simulation
        this.simulation = d3.forceSimulation()
            .force('link', d3.forceLink().id(d => d.id).distance(150))
            .force('charge', d3.forceManyBody().strength(-500))
            .force('center', d3.forceCenter(this.width / 2, this.height / 2))
            .force('collision', d3.forceCollide().radius(50));
        
        this.nodes = [];
        this.links = [];
        this.filters = {
            type: 'all',
            severity: 'all'
        };
    }
    
    loadData(entities, relationships) {
        // Process entities as nodes
        this.allNodes = entities.map(entity => ({
            ...entity,
            x: this.width / 2 + (Math.random() - 0.5) * 400,
            y: this.height / 2 + (Math.random() - 0.5) * 400
        }));
        
        // Process relationships as links
        this.allLinks = relationships.map(rel => ({
            ...rel,
            source: rel.source,
            target: rel.target
        }));
        
        this.applyFilters();
    }
    
    applyFilters() {
        // Filter nodes
        this.nodes = this.allNodes.filter(node => {
            const typeMatch = this.filters.type === 'all' || node.type === this.filters.type;
            const severityMatch = this.filters.severity === 'all' || node.severity === this.filters.severity;
            return typeMatch && severityMatch;
        });
        
        // Filter links to only include those between visible nodes
        const nodeIds = new Set(this.nodes.map(n => n.id));
        this.links = this.allLinks.filter(link => 
            nodeIds.has(link.source.id || link.source) && 
            nodeIds.has(link.target.id || link.target)
        );
        
        this.updateGraph();
    }
    
    updateGraph() {
        // Update node count display
        document.getElementById('nodeCount').textContent = this.nodes.length;
        document.getElementById('edgeCount').textContent = this.links.length;
        
        // Update links
        const link = this.linkGroup
            .selectAll('line')
            .data(this.links, d => `${d.source.id || d.source}-${d.target.id || d.target}`);
        
        link.exit().remove();
        
        const linkEnter = link.enter()
            .append('line')
            .attr('stroke', '#00d9ff')
            .attr('stroke-opacity', 0.3)
            .attr('stroke-width', d => Math.max(1, d.confidence / 30));
        
        this.link = linkEnter.merge(link);
        
        // Update nodes
        const node = this.nodeGroup
            .selectAll('g.node')
            .data(this.nodes, d => d.id);
        
        node.exit().remove();
        
        const nodeEnter = node.enter()
            .append('g')
            .attr('class', 'node')
            .call(this.drag());
        
        // Add circles
        nodeEnter.append('circle')
            .attr('r', d => this.getNodeSize(d))
            .attr('fill', d => this.getNodeColor(d))
            .attr('stroke', d => this.getNodeStrokeColor(d))
            .attr('stroke-width', 3)
            .attr('opacity', 0.8);
        
        // Add glow effect
        nodeEnter.append('circle')
            .attr('r', d => this.getNodeSize(d) + 5)
            .attr('fill', 'none')
            .attr('stroke', d => this.getNodeColor(d))
            .attr('stroke-width', 2)
            .attr('opacity', 0.3);
        
        // Add text labels
        nodeEnter.append('text')
            .attr('dy', d => this.getNodeSize(d) + 20)
            .attr('text-anchor', 'middle')
            .attr('fill', '#ffffff')
            .attr('font-size', '12px')
            .attr('font-weight', '600')
            .text(d => this.truncateText(d.name, 15));
        
        // Add type icon
        nodeEnter.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', 5)
            .attr('font-size', '20px')
            .text(d => window.threatData.entityConfig[d.type].icon);
        
        this.node = nodeEnter.merge(node);
        
        // Add hover and click events
        this.node
            .on('mouseover', (event, d) => this.handleNodeHover(event, d))
            .on('mouseout', () => this.handleNodeOut())
            .on('click', (event, d) => this.handleNodeClick(event, d));
        
        // Update simulation
        this.simulation
            .nodes(this.nodes)
            .on('tick', () => this.ticked());
        
        this.simulation
            .force('link')
            .links(this.links);
        
        this.simulation.alpha(1).restart();
    }
    
    ticked() {
        this.link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);
        
        this.node
            .attr('transform', d => `translate(${d.x},${d.y})`);
    }
    
    drag() {
        return d3.drag()
            .on('start', (event, d) => {
                if (!event.active) this.simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            })
            .on('drag', (event, d) => {
                d.fx = event.x;
                d.fy = event.y;
            })
            .on('end', (event, d) => {
                if (!event.active) this.simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            });
    }
    
    handleNodeHover(event, d) {
        // Highlight connected nodes and links
        const connectedNodeIds = new Set();
        connectedNodeIds.add(d.id);
        
        this.links.forEach(link => {
            const sourceId = link.source.id || link.source;
            const targetId = link.target.id || link.target;
            
            if (sourceId === d.id) connectedNodeIds.add(targetId);
            if (targetId === d.id) connectedNodeIds.add(sourceId);
        });
        
        this.node.selectAll('circle')
            .attr('opacity', node => connectedNodeIds.has(node.id) ? 1 : 0.2);
        
        this.link
            .attr('stroke-opacity', link => {
                const sourceId = link.source.id || link.source;
                const targetId = link.target.id || link.target;
                return (sourceId === d.id || targetId === d.id) ? 0.8 : 0.1;
            })
            .attr('stroke-width', link => {
                const sourceId = link.source.id || link.source;
                const targetId = link.target.id || link.target;
                return (sourceId === d.id || targetId === d.id) ? 4 : 1;
            });
        
        // Show tooltip
        this.showTooltip(event, d);
    }
    
    handleNodeOut() {
        this.node.selectAll('circle')
            .attr('opacity', 0.8);
        
        this.link
            .attr('stroke-opacity', 0.3)
            .attr('stroke-width', d => Math.max(1, d.confidence / 30));
        
        this.hideTooltip();
    }
    
    handleNodeClick(event, d) {
        event.stopPropagation();
        showEntityDetails(d.id);
    }
    
    showTooltip(event, d) {
        const tooltip = d3.select('body')
            .append('div')
            .attr('class', 'network-tooltip')
            .style('position', 'absolute')
            .style('background', 'rgba(26, 31, 53, 0.98)')
            .style('border', '1px solid rgba(0, 217, 255, 0.5)')
            .style('border-radius', '8px')
            .style('padding', '12px')
            .style('color', '#ffffff')
            .style('font-size', '13px')
            .style('pointer-events', 'none')
            .style('z-index', '1000')
            .style('box-shadow', '0 4px 16px rgba(0, 217, 255, 0.3)');
        
        tooltip.html(`
            <div style="margin-bottom: 8px;">
                <strong style="font-size: 14px; color: ${this.getNodeColor(d)};">${d.name}</strong>
            </div>
            <div style="color: #a0aec0; margin-bottom: 4px;">
                ${window.threatData.entityConfig[d.type].label}
            </div>
            <div style="color: #a0aec0; margin-bottom: 8px;">
                ${d.description}
            </div>
            <div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 1px solid rgba(0, 217, 255, 0.2);">
                <span>Severity: <strong style="color: ${this.getSeverityColor(d.severity)};">${d.severity.toUpperCase()}</strong></span>
                <span>Confidence: <strong style="color: #00ff9f;">${d.confidence}%</strong></span>
            </div>
        `);
        
        tooltip
            .style('left', (event.pageX + 15) + 'px')
            .style('top', (event.pageY - 15) + 'px');
    }
    
    hideTooltip() {
        d3.selectAll('.network-tooltip').remove();
    }
    
    getNodeSize(d) {
        const baseSize = 25;
        const severityMultiplier = {
            'critical': 1.5,
            'high': 1.3,
            'medium': 1.1,
            'low': 1
        };
        return baseSize * (severityMultiplier[d.severity] || 1);
    }
    
    getNodeColor(d) {
        return window.threatData.entityConfig[d.type].color;
    }
    
    getNodeStrokeColor(d) {
        const colors = {
            'critical': '#ff4d6d',
            'high': '#ff9d00',
            'medium': '#ffd93d',
            'low': '#00ff9f'
        };
        return colors[d.severity] || '#00d9ff';
    }
    
    getSeverityColor(severity) {
        const colors = {
            'critical': '#ff4d6d',
            'high': '#ff9d00',
            'medium': '#ffd93d',
            'low': '#00ff9f'
        };
        return colors[severity] || '#00d9ff';
    }
    
    truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }
    
    setFilter(filterType, value) {
        this.filters[filterType] = value;
        this.applyFilters();
    }
    
    zoomIn() {
        this.svg.transition().call(this.zoom.scaleBy, 1.3);
    }
    
    zoomOut() {
        this.svg.transition().call(this.zoom.scaleBy, 0.7);
    }
    
    resetView() {
        this.svg.transition().call(
            this.zoom.transform,
            d3.zoomIdentity.translate(0, 0).scale(1)
        );
    }
    
    exportAsImage() {
        // Create a canvas from the SVG
        const svgElement = this.svg.node();
        const svgString = new XMLSerializer().serializeToString(svgElement);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        canvas.width = this.width;
        canvas.height = this.height;
        
        img.onload = function() {
            ctx.fillStyle = '#0a0e1a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            
            // Download
            const link = document.createElement('a');
            link.download = `network-map-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        };
        
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
    }
}

// Initialize network graph
let networkGraph;

function initializeNetwork() {
    networkGraph = new NetworkGraph('#networkGraph');
    networkGraph.loadData(
        window.threatData.entities,
        window.threatData.relationships
    );
    
    // Setup filter controls
    setupNetworkControls();
}

function setupNetworkControls() {
    // Type filters
    document.querySelectorAll('.filter-btn[data-type]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn[data-type]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            networkGraph.setFilter('type', btn.dataset.type);
        });
    });
    
    // Severity filters
    document.querySelectorAll('.filter-btn[data-level]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn[data-level]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            networkGraph.setFilter('severity', btn.dataset.level);
        });
    });
    
    // Zoom controls
    document.getElementById('zoomIn')?.addEventListener('click', () => {
        networkGraph.zoomIn();
    });
    
    document.getElementById('zoomOut')?.addEventListener('click', () => {
        networkGraph.zoomOut();
    });
    
    document.getElementById('resetView')?.addEventListener('click', () => {
        networkGraph.resetView();
    });
    
    // Export button
    document.getElementById('exportNetwork')?.addEventListener('click', () => {
        networkGraph.exportAsImage();
    });
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeNetwork);
} else {
    initializeNetwork();
}

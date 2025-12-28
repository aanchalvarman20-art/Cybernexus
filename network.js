// ============================================
// NETWORK GRAPH VISUALIZATION (Interactive Spider Web)
// ============================================

class NetworkGraph {
    constructor(containerId) {
        this.container = d3.select(containerId);
        const node = this.container.node();
        this.width = node ? node.clientWidth : 800;
        this.height = node ? node.clientHeight : 600;
        
        // Clear previous if any
        this.container.selectAll("*").remove();

        this.svg = this.container.append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', [0, 0, this.width, this.height])
            .style('cursor', 'move');
        
        // Add a group for the graph content
        this.g = this.svg.append('g');

        this.linkGroup = this.g.append('g').attr('class', 'links');
        this.nodeGroup = this.g.append('g').attr('class', 'nodes');
        
        // Zoom behavior
        this.zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                this.g.attr('transform', event.transform);
            });
        this.svg.call(this.zoom);
        
        // --- SPIDER WEB PHYSICS ---
        this.simulation = d3.forceSimulation()
            .force('link', d3.forceLink().id(d => d.id).distance(150)) // Distance between connected nodes
            .force('charge', d3.forceManyBody().strength(-500)) // Repel force (keeps them apart)
            .force('collide', d3.forceCollide().radius(60).iterations(2)) // Prevent overlap
            .force('center', d3.forceCenter(this.width / 2, this.height / 2));
        
        this.allNodes = [];
        this.allLinks = [];
        this.filters = { type: 'all', severity: 'all' };
    }
    
    // --- DATA PROCESSING (The Web Builder) ---
    updateData(newEntities) {
        // Clear old data to prevent ghosts if needed, or keep appending
        // For a live feed, we usually append.
        
        newEntities.forEach(t => {
            // 1. Threat Actor (The Hub) - Central Node
            const actorId = `actor-${t.attacker.replace(/\s+/g, '')}`;
            this.addNode({ 
                id: actorId, 
                type: 'threat-actor', 
                name: t.attacker, 
                severity: 'critical' 
            });

            // 2. The Tool/Malware (The Bridge)
            const toolId = `tool-${t.tool.replace(/\s+/g, '')}`;
            this.addNode({ 
                id: toolId, 
                type: 'malware', 
                name: t.tool, 
                severity: 'high' 
            });

            // 3. The Victim/Target (The Leaf)
            const victimId = t.entityId;
            this.addNode({ 
                id: victimId, 
                type: 'domain', // Visualizing victim as a domain/endpoint
                name: t.entity, 
                severity: t.severity 
            });

            // --- CONNECT THE WEB ---
            // Actor uses Tool
            this.addLink(actorId, toolId);
            // Tool attacks Victim
            this.addLink(toolId, victimId);
        });

        this.updateGraph();
    }

    addNode(n) {
        if (!this.allNodes.find(x => x.id === n.id)) {
            // Spawn new nodes near the center
            this.allNodes.push({ ...n, x: this.width/2 + (Math.random() - 0.5) * 50, y: this.height/2 + (Math.random() - 0.5) * 50 });
        }
    }

    addLink(sourceId, targetId) {
        const exists = this.allLinks.find(l => 
            (l.source.id === sourceId && l.target.id === targetId) ||
            (l.source === sourceId && l.target === targetId)
        );
        if (!exists) {
            this.allLinks.push({ source: sourceId, target: targetId });
        }
    }
    
    setFilter(key, val) { 
        this.filters[key] = val; 
        this.updateGraph(); 
    }
    
    // --- DRAWING THE GRAPH ---
    updateGraph() {
        // 1. Filter Data
        const nodes = this.allNodes.filter(n => 
            (this.filters.type === 'all' || n.type === this.filters.type) &&
            (this.filters.severity === 'all' || n.severity.toLowerCase() === this.filters.severity.toLowerCase())
        );
        
        const nodeIds = new Set(nodes.map(n => n.id));
        const links = this.allLinks.filter(l => 
            nodeIds.has(l.source.id || l.source) && nodeIds.has(l.target.id || l.target)
        );

        // Update Stats UI
        const countEl = document.getElementById('nodeCount');
        if (countEl) countEl.textContent = nodes.length;
        const connEl = document.getElementById('edgeCount'); // Assuming you have this ID in HTML
        if (connEl) connEl.textContent = links.length;

        // 2. Draw Links
        const link = this.linkGroup.selectAll('line')
            .data(links, d => `${d.source.id || d.source}-${d.target.id || d.target}`);
        
        link.exit().remove();
        
        const linkEnter = link.enter().append('line')
            .attr('stroke', '#00d9ff')
            .attr('stroke-opacity', 0.2)
            .attr('stroke-width', 1.5); // Thicker lines for visibility
            
        const allLinks = linkEnter.merge(link);

        // 3. Draw Nodes
        const node = this.nodeGroup.selectAll('g.node')
            .data(nodes, d => d.id);
        
        node.exit().transition().duration(300).attr("opacity", 0).remove(); // Smooth exit

        const nodeEnter = node.enter().append('g')
            .attr('class', 'node')
            .style('cursor', 'pointer')
            // Add Drag Behavior
            .call(d3.drag()
                .on('start', (e, d) => {
                    if (!e.active) this.simulation.alphaTarget(0.3).restart();
                    d.fx = d.x; d.fy = d.y;
                })
                .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
                .on('end', (e, d) => {
                    if (!e.active) this.simulation.alphaTarget(0);
                    d.fx = null; d.fy = null;
                })
            );

        // Outer Glow Circle
        nodeEnter.append('circle').attr('class', 'glow')
            .attr('r', d => this.getSize(d.type) + 8)
            .attr('fill', 'none')
            .attr('stroke', d => this.getColor(d.severity))
            .attr('stroke-width', 2)
            .attr('opacity', 0.5);

        // Main Node Circle
        nodeEnter.append('circle')
            .attr('r', d => this.getSize(d.type))
            .attr('fill', '#0f172a') // Dark background for contrast
            .attr('stroke', d => this.getColor(d.severity))
            .attr('stroke-width', 2);

        // Icon Text
        nodeEnter.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', 5) // Center vertically
            .attr('font-family', '"Font Awesome 6 Free"')
            .attr('font-weight', '900')
            .attr('fill', '#fff')
            .attr('font-size', d => this.getSize(d.type) - 4) // Scale icon with node
            .text(d => this.getIcon(d.type));

        const allNodes = nodeEnter.merge(node);
        
        // --- EVENTS (Click & Hover) ---
        // We attach events to the MERGED selection so both new and old nodes respond
        allNodes
            .on('click', (event, d) => {
                // Stop click from propagating to zoom
                event.stopPropagation();
                console.log("Clicked Node:", d.name); // Debug
                if(window.viewThreatDetails) window.viewThreatDetails(d.id);
            })
            .on('mouseover', (event, d) => this.showTooltip(event, d))
            .on('mouseout', () => this.hideTooltip());

        // 4. Tick Function (Animation Loop)
        this.simulation.nodes(nodes).on('tick', () => {
            allLinks
                .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
            
            allNodes.attr('transform', d => `translate(${d.x},${d.y})`);
        });
        
        this.simulation.force('link').links(links);
        this.simulation.alpha(1).restart();
    }

    // --- TOOLTIP SYSTEM ---
    showTooltip(event, d) {
        // Highlight Node
        d3.select(event.currentTarget).select('.glow')
            .transition().duration(200)
            .attr('stroke-width', 4)
            .attr('opacity', 1);

        // Create Tooltip div if not exists
        let tooltip = document.getElementById('network-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'network-tooltip';
            tooltip.style.cssText = `
                position: absolute;
                background: rgba(15, 23, 42, 0.95);
                border: 1px solid #00d9ff;
                padding: 10px 15px;
                border-radius: 8px;
                color: #fff;
                pointer-events: none;
                z-index: 10000;
                font-family: 'Inter', sans-serif;
                box-shadow: 0 4px 15px rgba(0,0,0,0.5);
                backdrop-filter: blur(5px);
                min-width: 150px;
            `;
            document.body.appendChild(tooltip);
        }

        // Content
        const color = this.getColor(d.severity);
        tooltip.style.borderColor = color;
        tooltip.innerHTML = `
            <div style="font-weight: 700; font-size: 1rem; margin-bottom: 4px;">${d.name}</div>
            <div style="font-size: 0.8rem; color: #94a3b8; display: flex; justify-content: space-between;">
                <span>${d.type.toUpperCase()}</span>
                <span style="color: ${color}">${d.severity.toUpperCase()}</span>
            </div>
        `;

        // Positioning
        const x = event.pageX + 15;
        const y = event.pageY - 15;
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
        tooltip.style.display = 'block';
    }

    hideTooltip() {
        // Remove highlight
        d3.selectAll('.glow')
            .transition().duration(200)
            .attr('stroke-width', 2)
            .attr('opacity', 0.5);
            
        const tooltip = document.getElementById('network-tooltip');
        if (tooltip) tooltip.style.display = 'none';
    }

    // --- STYLING HELPERS ---
    getSize(type) { return type === 'threat-actor' ? 30 : (type === 'malware' ? 22 : 25); }
    
    getColor(sev) { 
        // Hex codes match your CSS
        return { 
            'critical': '#ff4d6d', 
            'high': '#ff9d00', 
            'medium': '#ffd93d', 
            'low': '#00ff9f' 
        }[sev?.toLowerCase()] || '#00d9ff'; 
    }
    
    getIcon(type) {
        // FontAwesome Unicode
        const map = { 
            'threat-actor': '\uf21b', // User Secret
            'malware': '\uf188',      // Bug
            'domain': '\uf0ac',       // Globe
            'ip': '\uf3c5',           // Map Marker
            'crypto': '\uf15a'        // Bitcoin/Money
        };
        return map[type] || '\uf071'; // Warning triangle default
    }
}

// Global Init
window.initializeNetwork = function() {
    if(!document.getElementById('networkGraph')) return;
    window.networkGraph = new NetworkGraph('#networkGraph');
    
    // Setup Filter Listeners
    document.querySelectorAll('.filter-btn[data-type]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn[data-type]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            window.networkGraph.setFilter('type', btn.dataset.type);
        });
    });
};

// Data Link
window.updateNetworkMap = function(data) {
    if(window.networkGraph) window.networkGraph.updateData(data);
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', window.initializeNetwork);
else window.initializeNetwork();
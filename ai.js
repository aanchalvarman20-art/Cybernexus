// ai.js - Integrated with LIVE CISA FEED
const OPENROUTER_API_KEY = "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"; 
const SITE_URL = "http://localhost:5500"; 
const SITE_NAME = "CyberNexus"; 

async function analyzeThreatsWithGemini() {
    const btn = document.getElementById('aiBtn');
    let container = document.getElementById('aiAnalysisContent');
    
    // UI Setup
    if (!container) {
        const analysisSection = document.querySelector('#analysis .container');
        if (analysisSection) {
            container = document.createElement('div');
            container.id = 'aiAnalysisContent';
            container.style.marginTop = '2rem';
            analysisSection.appendChild(container);
        } else return;
    }
    
    if(btn) btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Neural Uplink Active...';
    if (window.showNotification) window.showNotification("Processing Live Feed...", "info");

    // 1. GET LIVE DATA (Fixed Logic)
    // We access the global variable set by dashboard.js
    const liveThreats = window.currentThreatData || [];
    
    // Fallback to static if live is empty, just so it does SOMETHING
    const threatsToAnalyze = liveThreats.length > 0 ? liveThreats : (window.threatData?.recentThreats || []);

    if (threatsToAnalyze.length === 0) {
        if(btn) btn.innerHTML = '<i class="fas fa-brain"></i> Generate AI Report';
        container.innerHTML = `<div style="text-align:center; color:#718096; padding:20px;">No threats detected yet. Wait for data stream...</div>`;
        return;
    }

    // 2. PREPARE PROMPT WITH REAL DATA
    // We summarize the top 5 threats to keep prompt efficient
    const threatContext = threatsToAnalyze.slice(0, 5).map(t => 
        `- [${t.severity ? t.severity.toUpperCase() : 'HIGH'}] ${t.entity || t.type} detected. ${t.prediction || ''}`
    ).join('\n');

    const prompt = `
        You are a Cyber Security Analyst. Analyze these LIVE active threats:
        ${threatContext}
        
        Return a JSON ARRAY of exactly 3 objects. NO MARKDOWN.
        Each object must have:
        "name": Short title of the threat (e.g. "APT-28 Campaign"),
        "summary": "1-sentence technical summary",
        "action": "One specific remediation command",
        "severity": "critical" or "high"
    `;

    try {
        // We now talk to OUR OWN secure proxy, not OpenRouter directly
        const response = await fetch("/api/proxy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "model": "openai/gpt-oss-20b:free",
                "messages": [{"role": "user", "content": prompt}]
            })
        });

        const data = await response.json();

        // --- ERROR HANDLING FIX ---
        // Check if the API returned an error instead of data
        if (!response.ok || data.error) {
            console.error("API Error Details:", data);
            throw new Error(data.error?.message || `API Error: ${response.status}`);
        }
        
        // Check if choices array exists before accessing index [0]
        if (!data.choices || !data.choices.length) {
            console.error("Empty AI Response:", data);
            throw new Error("AI returned no results. The model might be busy.");
        }
        // --------------------------
        
        // Parse Result
        let rawText = data.choices[0].message.content.replace(/```json/g, '').replace(/```/g, '').trim();
        
        // Handle case where AI returns just an object instead of array
        let aiData;
        try {
             aiData = JSON.parse(rawText);
             if(!Array.isArray(aiData)) aiData = [aiData];
        } catch(e) {
             throw new Error("AI returned invalid JSON format");
        }
        
        renderAICards(container, aiData); 
        
        if (window.showNotification) window.showNotification("Threat Assessment Complete", "success");
        if(btn) btn.innerHTML = '<i class="fas fa-check"></i> Report Generated';

    } catch (e) {
        console.error("AI Error:", e);
        if(btn) btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Retry';
        // Show the actual error message on screen so you know why it failed
        container.innerHTML = `<div style="color:#ff4d6d; text-align:center; padding:20px; border:1px solid #ff4d6d; border-radius:8px; background:rgba(255, 77, 109, 0.1);">
            <strong>Analysis Failed</strong><br>
            <small>${e.message}</small>
        </div>`;
    }}
function renderAICards(container, cards) {
    container.innerHTML = '<div class="ai-card-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;"></div>';
    const grid = container.querySelector('.ai-card-grid');

    cards.forEach(card => {
        const el = document.createElement('div');
        el.className = `findings-card ${card.severity}`;
        el.style.cssText = `
            border: 1px solid ${getSeverityColor(card.severity)}; 
            background: rgba(15, 23, 42, 0.8); 
            padding: 20px; 
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        `;
        
        el.onmouseover = () => {
            el.style.transform = 'translateY(-5px)';
            el.style.boxShadow = `0 10px 20px -5px ${getSeverityColor(card.severity)}40`;
        };
        el.onmouseout = () => {
            el.style.transform = 'translateY(0)';
            el.style.boxShadow = 'none';
        };

        el.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <h3 style="margin:0; font-size:1.1rem; color:#fff; font-family: 'Fira Code', monospace;">
                    <i class="fas fa-bug"></i> ${card.name}
                </h3>
                <span class="severity-badge ${card.severity}">${card.severity.toUpperCase()}</span>
            </div>
            <p style="color:#cbd5e0; font-size:0.95rem; line-height: 1.5; margin-bottom:20px;">${card.summary}</p>
            <div style="
                font-family:'Fira Code'; 
                font-size:0.8rem; 
                color:#00d9ff; 
                background:rgba(0, 217, 255, 0.1); 
                padding:12px; 
                border-radius:6px;
                border-left: 3px solid #00d9ff;
            ">
                <i class="fas fa-terminal"></i> ${card.action}
            </div>
        `;
        
        // Click to show details in Modal
        el.addEventListener('click', () => {
            const modal = document.getElementById('entityModal');
            const details = document.getElementById('entityDetails');
            if(details) {
                details.innerHTML = `
                    <div style="text-align:center; margin-bottom: 20px;">
                         <i class="fas fa-robot" style="font-size:3rem; color: #00d9ff;"></i>
                         <h2>${card.name}</h2>
                    </div>
                    <div class="entity-section">
                        <h3>AI Analysis Summary</h3>
                        <p>${card.summary}</p>
                    </div>
                    <div class="entity-section" style="margin-top:20px; border:1px dashed ${getSeverityColor(card.severity)}; padding:15px; border-radius:8px;">
                        <h4 style="color:${getSeverityColor(card.severity)}">RECOMMENDED REMEDIATION</h4>
                        <code style="color:#fff; font-family:monospace;">${card.action}</code>
                    </div>
                `;
            }
            if(modal) modal.classList.add('active');
        });
        
        grid.appendChild(el);
    });
}

function getSeverityColor(severity) {
    return { 'critical': '#ff4d6d', 'high': '#ff9d00', 'medium': '#ffd93d' }[severity?.toLowerCase()] || '#00d9ff';
}

// Global Export
window.analyzeThreatsWithGemini = analyzeThreatsWithGemini;
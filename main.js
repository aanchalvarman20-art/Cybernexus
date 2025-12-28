// ============================================
// MAIN APPLICATION LOGIC
// Utilities, animations, notifications, and SOS
// ============================================

let updateInterval;

// 1. NAVIGATION & SCROLLING
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const navHeight = document.querySelector('.navbar').offsetHeight;
        const targetPosition = section.offsetTop - navHeight;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

function updateNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', () => {
        let current = '';
        const navHeight = document.querySelector('.navbar').offsetHeight;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - navHeight - 100;
            const sectionHeight = section.offsetHeight;
            if (window.pageYOffset >= sectionTop && 
                window.pageYOffset < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// 2. VISUAL EFFECTS (Particles)
function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 100;
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.random() * 2 + 1;
            this.opacity = Math.random() * 0.5 + 0.2;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
            if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 217, 255, ${this.opacity})`;
            ctx.fill();
        }
    }
    
    for (let i = 0; i < particleCount; i++) particles.push(new Particle());
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        
        // Connections
        particles.forEach((p1, i) => {
            particles.slice(i + 1).forEach(p2 => {
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(0, 217, 255, ${0.1 * (1 - dist / 150)})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            });
        });
        requestAnimationFrame(animate);
    }
    animate();
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// 3. UI UTILITIES
function showLoading() { document.getElementById('loadingOverlay')?.classList.add('active'); }
function hideLoading() { document.getElementById('loadingOverlay')?.classList.remove('active'); }
function closeModal() { document.getElementById('entityModal')?.classList.remove('active'); }

function initThemeToggle() {
    const toggle = document.getElementById('themeToggle');
    if (toggle) {
        toggle.addEventListener('click', () => showNotification('Theme customization coming soon!', 'info'));
    }
}

// 4. NOTIFICATION SYSTEM (STACKING QUEUE)
// Creates a container for notifications if it doesn't exist
function initNotificationSystem() {
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }
}

window.showNotification = function(message, type = 'info') {
    const container = document.getElementById('notification-container');
    if (!container) initNotificationSystem();

    const notif = document.createElement('div');
    const color = type === 'success' ? '#00ff9f' : (type === 'error' ? '#ff4d6d' : '#00d9ff');
    const icon = type === 'success' ? 'check-circle' : (type === 'error' ? 'exclamation-triangle' : 'info-circle');

    notif.className = 'stacked-notification';
    notif.style.cssText = `
        background: rgba(10, 14, 26, 0.95);
        border-left: 4px solid ${color};
        color: #fff;
        padding: 15px 20px;
        border-radius: 4px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 300px;
        transform: translateX(120%);
        transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.27);
        pointer-events: auto;
        backdrop-filter: blur(10px);
        font-family: 'Inter', sans-serif;
        font-size: 0.9rem;
    `;

    notif.innerHTML = `
        <i class="fas fa-${icon}" style="color: ${color}; font-size: 1.2rem;"></i>
        <div>
            <div style="font-weight: 600; margin-bottom: 2px;">${type.toUpperCase()}</div>
            <div style="opacity: 0.9;">${message}</div>
        </div>
    `;

    document.getElementById('notification-container').appendChild(notif);

    // Slide in
    requestAnimationFrame(() => {
        notif.style.transform = 'translateX(0)';
    });

    // Slide out and remove after 4 seconds
    setTimeout(() => {
        notif.style.transform = 'translateX(120%)';
        setTimeout(() => notif.remove(), 400); // Wait for animation
    }, 4000);
};

// 5. MENTOR FEATURES: REPORTING & SOS
window.triggerManualReport = function() {
    const report = prompt("SOC REPORTING SYSTEM\nDescribe the anomaly or threat:");
    if(report) {
        window.showNotification("Report submitted to Analysis Team.", "success");
    }
};

window.triggerSOS = function() {
    // Immediate high-priority alert
    window.showNotification("SOS BROADCAST INITIATED. ISOLATING SEGMENT...", "error");
    // Visual Pulse Effect
    const originalShadow = document.body.style.boxShadow;
    document.body.style.boxShadow = "inset 0 0 150px rgba(255, 0, 0, 0.4)";
    setTimeout(() => document.body.style.boxShadow = originalShadow, 3000);
};

// 6. INITIALIZATION & STYLES
function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .result-card:hover::before { left: 100%; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #0a0e1a; }
        ::-webkit-scrollbar-thumb { background: #1f2937; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #00d9ff; }
        .block-btn {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #fff;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .block-btn:hover { background: rgba(255, 255, 255, 0.1); }
    `;
    document.head.appendChild(style);
}

function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            scrollToSection('search');
            setTimeout(() => document.getElementById('searchInput')?.focus(), 500);
        }
        if (e.key === 'Escape') closeModal();
    });
}

function initTooltips() {
    document.querySelectorAll('[data-tooltip]').forEach(element => {
        element.addEventListener('mouseenter', (e) => {
            const tooltip = document.createElement('div');
            tooltip.className = 'custom-tooltip';
            tooltip.textContent = e.target.dataset.tooltip;
            tooltip.style.cssText = `
                position: absolute; background: rgba(26, 31, 53, 0.98);
                border: 1px solid rgba(0, 217, 255, 0.5); padding: 8px 12px;
                color: #fff; z-index: 10000; font-size: 12px; border-radius: 4px;
            `;
            document.body.appendChild(tooltip);
            const rect = e.target.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width/2) - (tooltip.offsetWidth/2) + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
            e.target.addEventListener('mouseleave', () => tooltip.remove(), { once: true });
        });
    });
}

// Lifecycle
function initApp() {
    console.log('🚀 CyberNexus - AI Threat Intelligence Platform');
    addAnimationStyles();
    initParticles();
    initNotificationSystem();
    updateNavigation();
    initThemeToggle();
    initKeyboardShortcuts();
    initTooltips();
    
    // Add Mentor SOS Button if not exists
    if(!document.getElementById('sosBtn')) {
        const navActions = document.querySelector('.nav-actions');
        if(navActions) {
            const sosBtn = document.createElement('button');
            sosBtn.id = 'sosBtn';
            sosBtn.className = 'btn-secondary';
            sosBtn.innerHTML = '<i class="fas fa-biohazard"></i> SOS';
            sosBtn.style.cssText = "border-color: #ff4d6d; color: #ff4d6d; margin-right: 10px;";
            sosBtn.onclick = window.triggerSOS;
            navActions.insertBefore(sosBtn, navActions.firstChild);
        }
    }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initApp);
else initApp();

// EXPORTS
window.cybernexus = {
    scrollToSection,
    showEntityDetails: null, // Will be overwritten by search.js
    closeModal,
    showLoading,
    hideLoading,
    triggerManualReport,
    triggerSOS,
    showNotification
};
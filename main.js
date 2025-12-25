// ============================================
// MAIN APPLICATION LOGIC
// Utilities, animations, and general functions
// ============================================

// Smooth scroll to section
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

// Navigation active state
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

// Particle animation for hero section
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
    
    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        // Draw connections
        particles.forEach((p1, i) => {
            particles.slice(i + 1).forEach(p2 => {
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(0, 217, 255, ${0.1 * (1 - distance / 150)})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            });
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    // Resize handler
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Loading overlay
function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.add('active');
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

// Modal functions
function closeModal() {
    const modal = document.getElementById('entityModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Theme toggle (optional enhancement)
function initThemeToggle() {
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;
    
    toggle.addEventListener('click', () => {
        // For now, just show a notification
        showNotification('Theme customization coming soon!', 'info');
    });
}

// Intersection Observer for animations
function initScrollAnimations() {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        },
        {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        }
    );
    
    // Observe sections for fade-in animations
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
}

// Add CSS animation keyframes dynamically
function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
        
        @keyframes pulse {
            0%, 100% {
                opacity: 1;
            }
            50% {
                opacity: 0.5;
            }
        }
        
        @keyframes glow {
            0%, 100% {
                box-shadow: 0 0 10px rgba(0, 217, 255, 0.3);
            }
            50% {
                box-shadow: 0 0 20px rgba(0, 217, 255, 0.6);
            }
        }
        
        .metric-card:hover .metric-icon {
            animation: pulse 2s ease-in-out infinite;
        }
        
        .btn-primary:active {
            transform: scale(0.95) !important;
        }
        
        .nav-link {
            position: relative;
        }
        
        .nav-link::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            width: 0;
            height: 2px;
            background: var(--neon-blue);
            transition: width 0.3s ease, left 0.3s ease;
        }
        
        .nav-link:hover::after,
        .nav-link.active::after {
            width: 100%;
            left: 0;
        }
        
        /* Cyber grid effect */
        .network-visualization::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
                repeating-linear-gradient(
                    0deg,
                    rgba(0, 217, 255, 0.03) 0px,
                    transparent 1px,
                    transparent 40px,
                    rgba(0, 217, 255, 0.03) 41px
                ),
                repeating-linear-gradient(
                    90deg,
                    rgba(0, 217, 255, 0.03) 0px,
                    transparent 1px,
                    transparent 40px,
                    rgba(0, 217, 255, 0.03) 41px
                );
            pointer-events: none;
        }
        
        /* Scrollbar for tables */
        .table-container::-webkit-scrollbar {
            height: 8px;
        }
        
        /* Card hover effects */
        .result-card,
        .analysis-card,
        .finding-item {
            position: relative;
            overflow: hidden;
        }
        
        .result-card::before,
        .analysis-card::before,
        .finding-item::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(
                90deg,
                transparent,
                rgba(0, 217, 255, 0.1),
                transparent
            );
            transition: left 0.5s ease;
        }
        
        .result-card:hover::before,
        .analysis-card:hover::before,
        .finding-item:hover::before {
            left: 100%;
        }
        
        /* Loading spinner animation */
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        /* Network node pulse */
        @keyframes nodePulse {
            0%, 100% {
                r: 25;
                opacity: 0.8;
            }
            50% {
                r: 28;
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
}

// Keyboard shortcuts
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            scrollToSection('search');
            setTimeout(() => {
                document.getElementById('searchInput')?.focus();
            }, 500);
        }
        
        // Escape to close modal
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// Copy to clipboard helper
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Copied to clipboard', 'success');
    }).catch(() => {
        showNotification('Failed to copy', 'error');
    });
}

// Format numbers with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize tooltip system
function initTooltips() {
    // Add tooltips to elements with data-tooltip attribute
    document.querySelectorAll('[data-tooltip]').forEach(element => {
        element.addEventListener('mouseenter', (e) => {
            const tooltip = document.createElement('div');
            tooltip.className = 'custom-tooltip';
            tooltip.textContent = e.target.dataset.tooltip;
            tooltip.style.cssText = `
                position: absolute;
                background: rgba(26, 31, 53, 0.98);
                border: 1px solid rgba(0, 217, 255, 0.5);
                border-radius: 6px;
                padding: 8px 12px;
                color: #ffffff;
                font-size: 13px;
                pointer-events: none;
                z-index: 10000;
                white-space: nowrap;
            `;
            document.body.appendChild(tooltip);
            
            const rect = e.target.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
            
            e.target.addEventListener('mouseleave', () => {
                tooltip.remove();
            }, { once: true });
        });
    });
}

// Performance monitoring (optional)
function logPerformance() {
    if (window.performance && window.performance.timing) {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log(`Page Load Time: ${pageLoadTime}ms`);
    }
}

// Error boundary
window.addEventListener('error', (e) => {
    console.error('Application Error:', e.error);
    // In production, you might want to send this to an error tracking service
});

// Visibility change handler (pause animations when tab is inactive)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden, pause heavy operations
        if (updateInterval) {
            clearInterval(updateInterval);
        }
    } else {
        // Page is visible again, resume operations
        if (typeof startRealTimeUpdates === 'function') {
            startRealTimeUpdates();
        }
    }
});

// Initialize everything when DOM is ready
function initApp() {
    console.log('🚀 CyberNexus - AI Threat Intelligence Platform');
    console.log('Initializing application...');
    
    // Add animation styles
    addAnimationStyles();
    
    // Initialize components
    initParticles();
    updateNavigation();
    initThemeToggle();
    initScrollAnimations();
    initKeyboardShortcuts();
    initTooltips();
    
    // Log performance
    window.addEventListener('load', () => {
        logPerformance();
        console.log('✅ Application initialized successfully');
    });
}

// Start the application
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Export functions for global access
window.cybernexus = {
    scrollToSection,
    showEntityDetails,
    closeModal,
    showLoading,
    hideLoading,
    copyToClipboard,
    formatNumber,
    exportThreats,
    addToBlocklist,
    exportEntityReport,
    showInNetwork
};

// Service Worker registration (for PWA capabilities - optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment to enable service worker
        // navigator.serviceWorker.register('/sw.js').then(registration => {
        //     console.log('SW registered:', registration);
        // }).catch(error => {
        //     console.log('SW registration failed:', error);
        // });
    });
}

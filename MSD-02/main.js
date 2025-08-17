// Main JavaScript for Government Birth Registration Portal
// Enhanced interactive features and animations

document.addEventListener('DOMContentLoaded', function() {
    console.log('Government Birth Registration Portal loaded');
    
    // Initialize homepage animations
    initializeAnimations();
    
    // Initialize interactive features
    initializeInteractiveFeatures();
    
    // Initialize navigation
    initializeNavigation();
    
    // Initialize accessibility features
    initializeAccessibility();
});

// Initialize homepage animations
function initializeAnimations() {
    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all animatable elements
    document.querySelectorAll('.module-card, .feature-card, .process-step, .quick-access-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Staggered animation for hero stats
    const statItems = document.querySelectorAll('.stat-item');
    statItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            item.style.transition = 'all 0.5s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, 500 + (index * 200));
    });
}

// Initialize interactive features
function initializeInteractiveFeatures() {
    // Add ripple effect to buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn') || e.target.closest('.btn')) {
            createRippleEffect(e);
        }
    });
    
    // Add hover effects to cards
    const cards = document.querySelectorAll('.module-card, .feature-card, .quick-access-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add loading states to navigation links
    const navLinks = document.querySelectorAll('a[href$=".html"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (!this.href.includes('#')) {
                this.style.opacity = '0.7';
                this.innerHTML += ' <span style="animation: spin 1s linear infinite;">⟳</span>';
            }
        });
    });
}

// Create ripple effect
function createRippleEffect(event) {
    const button = event.target.closest('.btn');
    if (!button) return;
    
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Initialize navigation
function initializeNavigation() {
    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add active states to navigation
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.header-actions a');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.style.background = 'var(--white)';
            link.style.color = 'var(--primary-blue)';
        }
    });
}

// Initialize accessibility features
function initializeAccessibility() {
    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        // Alt + H for home
        if (e.altKey && e.key === 'h') {
            e.preventDefault();
            window.location.href = 'index.html';
        }
        
        // Alt + S for status tracking
        if (e.altKey && e.key === 's') {
            e.preventDefault();
            window.location.href = 'status.html';
        }
        
        // Alt + R for registration
        if (e.altKey && e.key === 'r') {
            e.preventDefault();
            window.location.href = 'register.html';
        }
    });
    
    // Add focus indicators
    const focusableElements = document.querySelectorAll('button, a, input, select, textarea');
    focusableElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.style.outline = '2px solid var(--primary-blue)';
            this.style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', function() {
            this.style.outline = '';
            this.style.outlineOffset = '';
        });
    });
}

// Utility functions
function showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = getNotificationIcon(type);
    notification.innerHTML = `
        <span class="material-symbols-outlined">${icon}</span>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        box-shadow: var(--shadow-large);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        max-width: 350px;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check_circle',
        error: 'error',
        warning: 'warning',
        info: 'info'
    };
    return icons[type] || 'info';
}

// Add global CSS animations
const globalStyle = document.createElement('style');
globalStyle.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(globalStyle);

// Export for global use
window.BirthRegistrationPortal = {
    showNotification,
    createRippleEffect,
    initializeAnimations
};
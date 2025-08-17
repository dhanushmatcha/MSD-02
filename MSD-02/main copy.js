// Main JavaScript for Government Birth Registration Portal
// Controls homepage animations, navigation, and image sliders

document.addEventListener('DOMContentLoaded', function() {
    console.log('Government Birth Registration Portal loaded');
    
    // Initialize homepage animations
    initializeAnimations();
    
    // Initialize service card interactions
    initializeServiceCards();
    
    // Initialize smooth scrolling for navigation
    initializeSmoothScrolling();
});

// Initialize homepage animations
function initializeAnimations() {
    // Animate header on load
    const header = document.querySelector('.header');
    if (header) {
        header.style.opacity = '0';
        header.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            header.style.transition = 'all 0.8s ease';
            header.style.opacity = '1';
            header.style.transform = 'translateY(0)';
        }, 100);
    }
    
    // Animate welcome section
    const welcomeSection = document.querySelector('.welcome-section');
    if (welcomeSection) {
        welcomeSection.style.opacity = '0';
        welcomeSection.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            welcomeSection.style.transition = 'all 0.8s ease';
            welcomeSection.style.opacity = '1';
            welcomeSection.style.transform = 'translateY(0)';
        }, 300);
    }
    
    // Animate service cards with staggered delay
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 500 + (index * 200));
    });
}

// Initialize service card interactions
function initializeServiceCards() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        // Add hover effects
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
            this.style.boxShadow = '0 20px 40px rgba(30, 60, 114, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 10px 30px rgba(30, 60, 114, 0.1)';
        });
        
        // Add click effects
        card.addEventListener('click', function(e) {
            if (e.target.tagName !== 'A') {
                // Add ripple effect
                createRippleEffect(e, this);
            }
        });
    });
}

// Create ripple effect for service cards
function createRippleEffect(event, element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Initialize smooth scrolling for navigation
function initializeSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
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
}

// Service card click handlers
function navigateToService(service) {
    console.log(`Navigating to ${service} service`);
    
    // Add loading state
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = 'Loading...';
    button.style.opacity = '0.7';
    
    // Simulate navigation delay
    setTimeout(() => {
        button.textContent = originalText;
        button.style.opacity = '1';
        
        // Navigate to appropriate page
        switch(service) {
            case 'birth-registration':
                window.location.href = 'birth_form.html';
                break;
            case 'notifications':
                window.location.href = 'dashboard.html';
                break;
            case 'reports':
                window.location.href = 'reports.html';
                break;
            default:
                console.log('Unknown service:', service);
        }
    }, 1000);
}

// Add CSS for ripple effect
function addRippleStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .service-card {
            position: relative;
            overflow: hidden;
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
    document.head.appendChild(style);
}

// Initialize ripple styles
addRippleStyles();

// Utility functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    // Set background color based on type
    switch(type) {
        case 'success':
            notification.style.background = '#28a745';
            break;
        case 'error':
            notification.style.background = '#dc3545';
            break;
        case 'warning':
            notification.style.background = '#ffc107';
            notification.style.color = '#212529';
            break;
        default:
            notification.style.background = '#17a2b8';
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Add notification animations
function addNotificationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
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
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize notification styles
addNotificationStyles();

// Export functions for global use
window.BirthRegistrationPortal = {
    showNotification,
    navigateToService,
    initializeAnimations
}; 
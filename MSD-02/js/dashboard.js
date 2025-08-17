// Enhanced Dashboard Functionality
class DashboardManager {
    constructor() {
        this.notifications = [];
        this.currentUser = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadUserData();
        this.setupAnimations();
        this.setupNotifications();
    }

    setupEventListeners() {
        // Real-time search functionality
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Auto-refresh data
        setInterval(() => {
            this.refreshData();
        }, 30000); // Refresh every 30 seconds
    }

    setupAnimations() {
        // Add entrance animations to cards
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

        // Observe all cards and sections
        document.querySelectorAll('.summary-card, .certificates-section, .quick-action-card').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    setupNotifications() {
        // Create notification container
        const notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        notificationContainer.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 9999;
            max-width: 350px;
        `;
        document.body.appendChild(notificationContainer);
    }

    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 1rem;
            margin-bottom: 10px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        `;

        const icon = document.createElement('span');
        icon.className = 'material-symbols-outlined';
        icon.textContent = this.getNotificationIcon(type);

        const text = document.createElement('span');
        text.textContent = message;

        notification.appendChild(icon);
        notification.appendChild(text);

        const container = document.querySelector('.notification-container');
        container.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    getNotificationColor(type) {
        const colors = {
            success: '#00ff88',
            error: '#ff6b6b',
            warning: '#ffd700',
            info: '#3b82f6'
        };
        return colors[type] || colors.info;
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check_circle',
            error: 'error',
            warning: 'warning',
            info: 'info'
        };
        return icons[type] || icons.info;
    }

    handleSearch(query) {
        if (query.length < 2) return;

        const rows = document.querySelectorAll('.certificates-table tbody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const isVisible = text.includes(query.toLowerCase());
            row.style.display = isVisible ? '' : 'none';
            
            if (isVisible) {
                row.style.animation = 'highlight 0.5s ease';
            }
        });
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('.search-input');
            if (searchInput) {
                searchInput.focus();
            }
        }

        // Ctrl/Cmd + N for new application
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            this.applyNewCertificate();
        }

        // Escape to close modals
        if (e.key === 'Escape') {
            this.closeAllModals();
        }
    }

    refreshData() {
        // Simulate data refresh
        this.showNotification('Data refreshed automatically', 'info', 2000);
        
        // Update timestamps
        const timestamps = document.querySelectorAll('.timestamp');
        timestamps.forEach(timestamp => {
            timestamp.textContent = this.getRelativeTime(new Date());
        });
    }

    getRelativeTime(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }

    // Enhanced blockchain verification
    async verifyBlockchain() {
        const verification = document.getElementById('blockchainVerification');
        if (!verification) return;

        verification.classList.add('verifying');
        verification.querySelector('.verification-text').textContent = 'Verifying...';
        
        try {
            // Simulate blockchain verification process
            await this.simulateBlockchainVerification();
            
            verification.classList.remove('verifying');
            verification.classList.add('verified');
            verification.querySelector('.verification-text').textContent = 'Verified ✓';
            
            this.showNotification('Blockchain verification successful!', 'success');
            
            setTimeout(() => {
                verification.classList.remove('verified');
                verification.querySelector('.verification-text').textContent = 'Verify Blockchain Integrity';
            }, 3000);
        } catch (error) {
            verification.classList.remove('verifying');
            this.showNotification('Blockchain verification failed. Please try again.', 'error');
        }
    }

    async simulateBlockchainVerification() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate 90% success rate
                if (Math.random() > 0.1) {
                    resolve();
                } else {
                    reject(new Error('Verification failed'));
                }
            }, 2000);
        });
    }

    // Enhanced certificate actions
    async approveCertificate(id) {
        if (confirm('Are you sure you want to approve this certificate?')) {
            try {
                // Simulate approval process
                await this.simulateApprovalProcess(id);
                
                this.showNotification(`Certificate ${id} has been approved!`, 'success');
                this.closeModal();
                
                // Refresh the page to show updated status
                setTimeout(() => {
                    location.reload();
                }, 1000);
            } catch (error) {
                this.showNotification('Approval failed. Please try again.', 'error');
            }
        }
    }

    async simulateApprovalProcess(id) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 1500);
        });
    }

    async rejectCertificate(id) {
        const reason = prompt('Please provide a reason for rejection:');
        if (reason) {
            try {
                await this.simulateRejectionProcess(id, reason);
                
                this.showNotification(`Certificate ${id} has been rejected.`, 'warning');
                
                setTimeout(() => {
                    location.reload();
                }, 1000);
            } catch (error) {
                this.showNotification('Rejection failed. Please try again.', 'error');
            }
        }
    }

    async simulateRejectionProcess(id, reason) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 1000);
        });
    }

    // Enhanced download functionality
    async downloadCertificate(id) {
        try {
            this.showNotification('Preparing download...', 'info');
            
            // Simulate download preparation
            await this.simulateDownloadPreparation(id);
            
            this.showNotification(`Certificate ${id} downloaded successfully!`, 'success');
            
            // Trigger actual download
            this.triggerDownload(id);
        } catch (error) {
            this.showNotification('Download failed. Please try again.', 'error');
        }
    }

    async simulateDownloadPreparation(id) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 2000);
        });
    }

    triggerDownload(id) {
        // Create a temporary link to trigger download
        const link = document.createElement('a');
        link.href = `data:text/plain;charset=utf-8,Certificate ${id} - Birth Certificate`;
        link.download = `birth-certificate-${id}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Enhanced search functionality
    searchRecords() {
        const searchTerm = prompt('Enter search term (name, ID, or date):');
        if (searchTerm) {
            this.showNotification(`Searching for: ${searchTerm}`, 'info');
            this.handleSearch(searchTerm);
        }
    }

    // Enhanced bulk operations
    async downloadAllCertificates() {
        if (confirm('Download all approved certificates?')) {
            try {
                this.showNotification('Preparing download package...', 'info');
                
                // Simulate bulk download preparation
                await this.simulateBulkDownloadPreparation();
                
                this.showNotification('All certificates downloaded successfully!', 'success');
            } catch (error) {
                this.showNotification('Bulk download failed. Please try again.', 'error');
            }
        }
    }

    async simulateBulkDownloadPreparation() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 3000);
        });
    }

    // Enhanced support functionality
    contactSupport() {
        const supportOptions = [
            'Email: support@birthportal.gov.in',
            'Phone: (+91) 2188477166',
            'Live Chat: Available 24/7',
            'WhatsApp: +91 9876543210'
        ];
        
        const message = 'Contact Support:\n\n' + supportOptions.join('\n');
        alert(message);
        
        // Log support request
        this.showNotification('Support request logged', 'info');
    }

    // Enhanced video functionality
    playStatusGuide() {
        this.showNotification('Playing status guide video...', 'info');
        
        // Here you would implement actual video player
        // For now, just show a placeholder
        const videoPlaceholder = document.querySelector('.video-placeholder');
        if (videoPlaceholder) {
            videoPlaceholder.innerHTML = `
                <span class="material-symbols-outlined" style="color: #ff6b6b;">pause_circle</span>
                <p>Video Playing</p>
                <div class="video-progress">
                    <span>1:24 / 2:24</span>
                </div>
            `;
            
            // Reset after 5 seconds
            setTimeout(() => {
                videoPlaceholder.innerHTML = `
                    <span class="material-symbols-outlined">play_circle</span>
                    <p>Status Guide Video</p>
                    <div class="video-progress">
                        <span>0:16 / 2:24</span>
                    </div>
                `;
            }, 5000);
        }
    }

    // Utility functions
    loadUserData() {
        // Load user data from localStorage or API
        const userName = localStorage.getItem('userName') || 'ssai';
        this.currentUser = { name: userName };
        
        // Update user display
        const userElements = document.querySelectorAll('#userName, #userDisplayName');
        userElements.forEach(el => {
            if (el) el.textContent = userName;
        });
    }

    // Export functions for global use
    exportFunctions() {
        window.verifyBlockchain = () => this.verifyBlockchain();
        window.approveCertificate = (id) => this.approveCertificate(id);
        window.rejectCertificate = (id) => this.rejectCertificate(id);
        window.downloadCertificate = (id) => this.downloadCertificate(id);
        window.searchRecords = () => this.searchRecords();
        window.downloadAllCertificates = () => this.downloadAllCertificates();
        window.contactSupport = () => this.contactSupport();
        window.playStatusGuide = () => this.playStatusGuide();
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const dashboard = new DashboardManager();
    dashboard.exportFunctions();
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes highlight {
            0% { background-color: rgba(255, 255, 255, 0.1); }
            50% { background-color: rgba(255, 255, 255, 0.2); }
            100% { background-color: transparent; }
        }
        
        .notification-container {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .notification {
            cursor: pointer;
        }
        
        .notification:hover {
            transform: translateX(-5px) !important;
        }
    `;
    document.head.appendChild(style);
});

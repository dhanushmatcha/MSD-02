// Status Tracking JavaScript - Enhanced Interactive Features
class StatusTracker {
    constructor() {
        this.registrations = JSON.parse(localStorage.getItem('parentRegistrations')) || [];
        this.adminActions = JSON.parse(localStorage.getItem('adminActions')) || [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadRecentApplications();
        this.setupAutoRefresh();
    }

    setupEventListeners() {
        const form = document.getElementById('statusTrackingForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleStatusTracking(e));
        }

        // Real-time search as user types
        const regInput = document.getElementById('registrationNumber');
        if (regInput) {
            regInput.addEventListener('input', (e) => {
                if (e.target.value.length >= 10) {
                    this.quickSearch(e.target.value);
                }
            });
        }

        // Download certificate button
        const downloadBtn = document.getElementById('downloadCertificateBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadCertificate());
        }
    }

    setupAutoRefresh() {
        // Auto-refresh status every 30 seconds if status is displayed
        setInterval(() => {
            const statusSection = document.getElementById('statusDisplaySection');
            if (statusSection && statusSection.style.display !== 'none') {
                const regNumber = document.getElementById('statusRegNumber')?.textContent;
                if (regNumber) {
                    this.refreshStatus(regNumber);
                }
            }
        }, 30000);
    }

    async handleStatusTracking(event) {
        event.preventDefault();
        
        const regNumber = document.getElementById('registrationNumber').value.trim();
        
        if (!regNumber) {
            this.showNotification('Please enter a registration number', 'error');
            return;
        }

        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.innerHTML = `
            <span class="material-symbols-outlined">hourglass_empty</span>
            Searching...
        `;
        submitBtn.disabled = true;

        try {
            // Simulate API call
            await this.simulateStatusFetch();
            
            // Find registration
            const registration = this.findRegistration(regNumber);
            
            if (registration) {
                this.displayStatus(registration);
                this.showNotification('Status found successfully!', 'success');
            } else {
                this.showNotification('Registration number not found. Please check and try again.', 'error');
                this.hideStatusDisplay();
            }
            
        } catch (error) {
            console.error('Status tracking error:', error);
            this.showNotification('Error fetching status. Please try again.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async simulateStatusFetch() {
        return new Promise(resolve => {
            setTimeout(resolve, 1000 + Math.random() * 1000);
        });
    }

    findRegistration(regNumber) {
        return this.registrations.find(reg => reg.registrationNumber === regNumber);
    }

    displayStatus(registration) {
        const statusSection = document.getElementById('statusDisplaySection');
        if (!statusSection) return;
        
        // Update status badge
        this.updateStatusBadge(registration.status);
        
        // Update application details
        this.updateApplicationDetails(registration);
        
        // Update timeline
        this.updateTimeline(registration);
        
        // Update actions
        this.updateStatusActions(registration);
        
        // Show certificate download if approved
        this.updateCertificateDownload(registration);
        
        // Show status section
        statusSection.style.display = 'block';
        statusSection.scrollIntoView({ behavior: 'smooth' });
    }

    updateStatusBadge(status) {
        const statusBadge = document.getElementById('currentStatus');
        if (!statusBadge) return;
        
        const statusIcon = statusBadge.querySelector('.status-icon');
        const statusText = statusBadge.querySelector('.status-text');
        
        const statusConfig = {
            'pending': {
                icon: 'pending',
                text: 'Pending Review',
                class: 'pending',
                color: '#ffc107'
            },
            'under_review': {
                icon: 'rate_review',
                text: 'Under Review',
                class: 'pending',
                color: '#17a2b8'
            },
            'approved': {
                icon: 'verified',
                text: 'Approved',
                class: 'approved',
                color: '#28a745'
            },
            'rejected': {
                icon: 'cancel',
                text: 'Rejected',
                class: 'rejected',
                color: '#dc3545'
            }
        };
        
        const config = statusConfig[status] || statusConfig['pending'];
        
        if (statusIcon) statusIcon.textContent = config.icon;
        if (statusText) statusText.textContent = config.text;
        
        statusBadge.className = `status-badge-large ${config.class}`;
        statusBadge.style.background = config.color;
        statusBadge.style.color = 'white';
    }

    updateApplicationDetails(registration) {
        const elements = {
            'statusRegNumber': registration.registrationNumber,
            'statusChildName': registration.finalChildName || registration.childName,
            'statusDOB': registration.childDOB ? new Date(registration.childDOB).toLocaleDateString() : 'N/A',
            'statusHospitalId': registration.hospitalData?.hospitalId || 'N/A',
            'statusSubmittedDate': registration.submissionDate ? 
                new Date(registration.submissionDate).toLocaleDateString() : 'N/A',
            'statusLastUpdated': registration.lastUpdated ? 
                new Date(registration.lastUpdated).toLocaleDateString() : 
                new Date(registration.submissionDate).toLocaleDateString()
        };
        
        Object.keys(elements).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = elements[id];
            }
        });
    }

    updateTimeline(registration) {
        const timeline = document.getElementById('statusTimeline');
        if (!timeline) return;
        
        const timelineSteps = [
            {
                title: 'Application Submitted',
                description: 'Your birth registration application has been submitted',
                date: registration.submissionDate,
                status: 'completed'
            },
            {
                title: 'Document Verification',
                description: 'Documents are being verified by our team',
                date: registration.verificationDate,
                status: registration.status === 'pending' ? 'current' : 'completed'
            },
            {
                title: 'Admin Review',
                description: 'Application is under review by the registrar',
                date: registration.reviewDate,
                status: registration.status === 'under_review' ? 'current' : 
                       (registration.status === 'approved' || registration.status === 'rejected') ? 'completed' : 'pending'
            },
            {
                title: 'Certificate Generation',
                description: 'Birth certificate is being generated',
                date: registration.approvalDate,
                status: registration.status === 'approved' ? 'completed' : 'pending'
            }
        ];
        
        timeline.innerHTML = timelineSteps.map(step => `
            <div class="timeline-item ${step.status}">
                <div class="timeline-content">
                    <h4>${step.title}</h4>
                    <p>${step.description}</p>
                    ${step.date ? `<div class="timeline-date">${new Date(step.date).toLocaleDateString()}</div>` : ''}
                </div>
            </div>
        `).join('');
    }

    updateStatusActions(registration) {
        const actionsDiv = document.getElementById('statusActions');
        if (!actionsDiv) return;
        
        let actions = [];
        
        switch (registration.status) {
            case 'pending':
                actions = [
                    {
                        text: 'Contact Support',
                        icon: 'support_agent',
                        class: 'btn-secondary',
                        action: 'contactSupport'
                    }
                ];
                break;
            case 'under_review':
                actions = [
                    {
                        text: 'Check Documents',
                        icon: 'description',
                        class: 'btn-secondary',
                        action: 'checkDocuments'
                    },
                    {
                        text: 'Contact Support',
                        icon: 'support_agent',
                        class: 'btn-secondary',
                        action: 'contactSupport'
                    }
                ];
                break;
            case 'rejected':
                actions = [
                    {
                        text: 'View Rejection Reason',
                        icon: 'info',
                        class: 'btn-danger',
                        action: 'viewRejectionReason'
                    },
                    {
                        text: 'Resubmit Application',
                        icon: 'refresh',
                        class: 'btn-primary',
                        action: 'resubmitApplication'
                    }
                ];
                break;
            case 'approved':
                actions = [
                    {
                        text: 'View Certificate',
                        icon: 'visibility',
                        class: 'btn-primary',
                        action: 'viewCertificate'
                    },
                    {
                        text: 'Share Certificate',
                        icon: 'share',
                        class: 'btn-secondary',
                        action: 'shareCertificate'
                    }
                ];
                break;
        }
        
        actionsDiv.innerHTML = actions.map(action => `
            <button class="btn ${action.class}" onclick="statusTracker.${action.action}('${registration.registrationNumber}')">
                <span class="material-symbols-outlined">${action.icon}</span>
                ${action.text}
            </button>
        `).join('');
    }

    updateCertificateDownload(registration) {
        const downloadSection = document.getElementById('certificateDownload');
        if (!downloadSection) return;
        
        if (registration.status === 'approved') {
            downloadSection.style.display = 'block';
        } else {
            downloadSection.style.display = 'none';
        }
    }

    hideStatusDisplay() {
        const statusSection = document.getElementById('statusDisplaySection');
        if (statusSection) {
            statusSection.style.display = 'none';
        }
    }

    quickSearch(regNumber) {
        const registration = this.findRegistration(regNumber);
        
        if (registration) {
            // Show quick preview
            this.showQuickPreview(registration);
        }
    }

    showQuickPreview(registration) {
        // Create or update quick preview
        let preview = document.getElementById('quickPreview');
        
        if (!preview) {
            preview = document.createElement('div');
            preview.id = 'quickPreview';
            preview.style.cssText = `
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border: 2px solid var(--primary-blue);
                border-radius: 8px;
                padding: 1rem;
                box-shadow: var(--shadow);
                z-index: 1000;
                animation: slideInDown 0.3s ease;
            `;
            
            const regInput = document.getElementById('registrationNumber');
            regInput.parentNode.style.position = 'relative';
            regInput.parentNode.appendChild(preview);
        }
        
        preview.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>${registration.finalChildName || registration.childName}</strong>
                    <div style="font-size: 0.9rem; color: var(--dark-gray);">
                        ${this.getStatusBadge(registration.status)}
                    </div>
                </div>
                <button onclick="statusTracker.trackSpecific('${registration.registrationNumber}')" 
                        class="btn btn-primary" style="padding: 0.5rem 1rem;">
                    Track Full Status
                </button>
            </div>
        `;
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (preview.parentNode) {
                preview.style.animation = 'slideOutUp 0.3s ease';
                setTimeout(() => {
                    if (preview.parentNode) {
                        preview.parentNode.removeChild(preview);
                    }
                }, 300);
            }
        }, 5000);
    }

    trackSpecific(regNumber) {
        document.getElementById('registrationNumber').value = regNumber;
        document.getElementById('statusTrackingForm').dispatchEvent(new Event('submit'));
    }

    loadRecentApplications() {
        const recentDiv = document.getElementById('recentApplications');
        if (!recentDiv) return;
        
        // Get recent applications (last 5)
        const recentApps = this.registrations
            .sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate))
            .slice(0, 5);
        
        if (recentApps.length === 0) {
            recentDiv.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--dark-gray);">
                    <span class="material-symbols-outlined" style="font-size: 3rem; opacity: 0.5;">inbox</span>
                    <p>No recent applications found</p>
                    <a href="register.html" class="btn btn-primary" style="margin-top: 1rem;">
                        <span class="material-symbols-outlined">add</span>
                        Submit New Application
                    </a>
                </div>
            `;
            return;
        }
        
        recentDiv.innerHTML = recentApps.map(app => `
            <div class="recent-app-card" onclick="statusTracker.trackSpecific('${app.registrationNumber}')">
                <div class="app-info">
                    <h4>${app.finalChildName || app.childName}</h4>
                    <p>Registration: ${app.registrationNumber}</p>
                    <p>Submitted: ${new Date(app.submissionDate).toLocaleDateString()}</p>
                </div>
                <div class="app-status">
                    ${this.getStatusBadge(app.status)}
                </div>
            </div>
        `).join('');
    }

    getStatusBadge(status) {
        const badges = {
            'pending': '<span class="status-badge pending">Pending</span>',
            'under_review': '<span class="status-badge pending">Under Review</span>',
            'approved': '<span class="status-badge approved">Approved</span>',
            'rejected': '<span class="status-badge rejected">Rejected</span>'
        };
        
        return badges[status] || '<span class="status-badge">Unknown</span>';
    }

    async refreshStatus(regNumber) {
        try {
            // Simulate checking for updates
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const registration = this.findRegistration(regNumber);
            if (registration) {
                // Check for admin actions that might have updated status
                const adminActions = JSON.parse(localStorage.getItem('adminActions')) || [];
                const relevantAction = adminActions.find(action => 
                    action.registrationNumber === regNumber && 
                    new Date(action.actionDate) > new Date(registration.lastUpdated || registration.submissionDate)
                );
                
                if (relevantAction) {
                    // Update registration status
                    registration.status = relevantAction.action;
                    registration.lastUpdated = relevantAction.actionDate;
                    
                    if (relevantAction.action === 'approved') {
                        registration.approvalDate = relevantAction.actionDate;
                    } else if (relevantAction.action === 'rejected') {
                        registration.rejectionReason = relevantAction.reason;
                        registration.rejectionDate = relevantAction.actionDate;
                    }
                    
                    // Save updated registration
                    const regIndex = this.registrations.findIndex(r => r.registrationNumber === regNumber);
                    if (regIndex !== -1) {
                        this.registrations[regIndex] = registration;
                        localStorage.setItem('parentRegistrations', JSON.stringify(this.registrations));
                    }
                    
                    // Update display
                    this.displayStatus(registration);
                    this.showNotification('Status updated!', 'info', 3000);
                }
            }
        } catch (error) {
            console.error('Refresh error:', error);
        }
    }

    // Action handlers
    contactSupport(regNumber) {
        const supportInfo = `
            Registration Number: ${regNumber}
            
            Contact Support:
            📞 Phone: (+91) 2188477166
            📧 Email: prabha@gmail.com
            💬 Live Chat: Available 24/7
            
            Please have your registration number ready when contacting support.
        `;
        
        alert(supportInfo);
        this.showNotification('Support contact information displayed', 'info');
    }

    checkDocuments(regNumber) {
        const registration = this.findRegistration(regNumber);
        if (!registration) return;
        
        const documentsInfo = `
            Required Documents Status:
            
            ✅ Hospital ID: Verified
            ✅ Child Details: Complete
            ✅ Parent Details: Complete
            ⏳ Address Verification: In Progress
            
            All documents are being processed. You will be notified of any issues.
        `;
        
        alert(documentsInfo);
        this.showNotification('Document status checked', 'info');
    }

    viewRejectionReason(regNumber) {
        const registration = this.findRegistration(regNumber);
        if (!registration || !registration.rejectionReason) {
            this.showNotification('No rejection reason found', 'error');
            return;
        }
        
        const reasonInfo = `
            Application Rejected
            
            Reason: ${registration.rejectionReason}
            
            Date: ${new Date(registration.rejectionDate).toLocaleDateString()}
            
            You can resubmit your application after addressing the issues mentioned above.
        `;
        
        alert(reasonInfo);
    }

    resubmitApplication(regNumber) {
        if (confirm('This will redirect you to submit a new application. Continue?')) {
            // Store the rejected application data for reference
            const registration = this.findRegistration(regNumber);
            if (registration) {
                localStorage.setItem('resubmissionData', JSON.stringify(registration));
            }
            
            window.location.href = 'register.html';
        }
    }

    viewCertificate(regNumber) {
        window.location.href = `certificate.html?regNumber=${regNumber}`;
    }

    shareCertificate(regNumber) {
        const shareData = {
            title: 'Birth Certificate',
            text: `Birth Certificate for Registration Number: ${regNumber}`,
            url: `${window.location.origin}/certificate.html?regNumber=${regNumber}`
        };
        
        if (navigator.share) {
            navigator.share(shareData).then(() => {
                this.showNotification('Certificate shared successfully!', 'success');
            }).catch((error) => {
                console.error('Share failed:', error);
                this.fallbackShare(shareData);
            });
        } else {
            this.fallbackShare(shareData);
        }
    }

    fallbackShare(shareData) {
        // Copy link to clipboard
        navigator.clipboard.writeText(shareData.url).then(() => {
            this.showNotification('Certificate link copied to clipboard!', 'success');
        }).catch(() => {
            // Show share modal as fallback
            const shareInfo = `
                Share Birth Certificate
                
                Registration Number: ${shareData.text.split(': ')[1]}
                Link: ${shareData.url}
                
                You can copy this link and share it with others.
            `;
            alert(shareInfo);
        });
    }

    downloadCertificate() {
        const regNumber = document.getElementById('statusRegNumber')?.textContent;
        if (!regNumber) return;
        
        this.showNotification('Preparing certificate download...', 'info');
        
        // Simulate download preparation
        setTimeout(() => {
            // Create download link
            const link = document.createElement('a');
            link.href = `certificate.html?regNumber=${regNumber}&download=true`;
            link.target = '_blank';
            link.click();
            
            this.showNotification('Certificate download started!', 'success');
        }, 2000);
    }

    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = this.getNotificationIcon(type);
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

    getNotificationIcon(type) {
        const icons = {
            success: 'check_circle',
            error: 'error',
            warning: 'warning',
            info: 'info'
        };
        return icons[type] || 'info';
    }
}

// Initialize Status Tracker
document.addEventListener('DOMContentLoaded', function() {
    const statusTracker = new StatusTracker();
    
    // Add CSS animations and styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInDown {
            from {
                transform: translateY(-20px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutUp {
            from {
                transform: translateY(0);
                opacity: 1;
            }
            to {
                transform: translateY(-20px);
                opacity: 0;
            }
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
        
        .recent-app-card {
            background: var(--white);
            border-radius: var(--radius-lg);
            padding: var(--spacing-lg);
            margin-bottom: var(--spacing-md);
            box-shadow: var(--shadow);
            cursor: pointer;
            transition: all 0.3s ease;
            border: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .recent-app-card:hover {
            transform: translateY(-3px);
            box-shadow: var(--shadow-hover);
            border-color: var(--primary-blue);
        }
        
        .app-info h4 {
            color: var(--primary-blue);
            margin-bottom: 0.25rem;
            font-weight: 600;
        }
        
        .app-info p {
            color: var(--dark-gray);
            font-size: 0.9rem;
            margin-bottom: 0.25rem;
        }
        
        .app-status {
            text-align: right;
        }
        
        .tracking-container,
        .status-container,
        .recent-container {
            background: var(--white);
            border-radius: var(--radius-xl);
            padding: var(--spacing-xxl);
            box-shadow: var(--shadow);
            margin-bottom: var(--spacing-xl);
            border: 1px solid var(--border-color);
        }
        
        .tracking-header,
        .status-header {
            text-align: center;
            margin-bottom: var(--spacing-xl);
        }
        
        .tracking-header h2,
        .status-header h2 {
            color: var(--primary-blue);
            font-size: 2rem;
            margin-bottom: var(--spacing-sm);
            font-weight: 700;
        }
        
        .tracking-header p,
        .status-header p {
            color: var(--dark-gray);
            font-size: 1.1rem;
        }
        
        .application-details {
            margin-bottom: var(--spacing-xl);
        }
        
        .details-card {
            background: var(--light-gray);
            border-radius: var(--radius-lg);
            padding: var(--spacing-xl);
            border: 1px solid var(--border-color);
        }
        
        .details-card h3 {
            color: var(--primary-blue);
            margin-bottom: var(--spacing-lg);
            font-weight: 600;
            border-bottom: 2px solid var(--border-color);
            padding-bottom: var(--spacing-sm);
        }
        
        .details-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: var(--spacing-md);
        }
        
        .detail-item {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-xs);
        }
        
        .detail-item label {
            font-weight: 600;
            color: var(--dark-gray);
            font-size: 0.9rem;
        }
        
        .detail-item span {
            color: var(--primary-blue);
            font-weight: 500;
        }
        
        .status-timeline {
            margin: var(--spacing-xl) 0;
        }
        
        .status-timeline h3 {
            color: var(--primary-blue);
            margin-bottom: var(--spacing-lg);
            font-weight: 600;
        }
        
        .timeline {
            position: relative;
            padding-left: var(--spacing-xl);
        }
        
        .timeline::before {
            content: '';
            position: absolute;
            left: 15px;
            top: 0;
            bottom: 0;
            width: 2px;
            background: var(--border-color);
        }
        
        .timeline-item {
            position: relative;
            margin-bottom: var(--spacing-lg);
            padding-left: var(--spacing-xl);
        }
        
        .timeline-item::before {
            content: '';
            position: absolute;
            left: -8px;
            top: 5px;
            width: 16px;
            height: 16px;
            border-radius: var(--radius-full);
            background: var(--white);
            border: 3px solid var(--border-color);
        }
        
        .timeline-item.completed::before {
            background: var(--success);
            border-color: var(--success);
        }
        
        .timeline-item.current::before {
            background: var(--warning);
            border-color: var(--warning);
            animation: pulse 2s infinite;
        }
        
        .timeline-item.pending::before {
            background: var(--light-gray);
            border-color: var(--border-color);
        }
        
        .timeline-content h4 {
            color: var(--primary-blue);
            margin-bottom: var(--spacing-xs);
            font-weight: 600;
        }
        
        .timeline-content p {
            color: var(--dark-gray);
            font-size: 0.9rem;
        }
        
        .timeline-date {
            font-size: 0.8rem;
            color: #6c757d;
            margin-top: var(--spacing-xs);
        }
        
        .status-actions {
            display: flex;
            gap: var(--spacing-md);
            justify-content: center;
            flex-wrap: wrap;
            margin: var(--spacing-xl) 0;
        }
        
        .certificate-download {
            background: linear-gradient(135deg, #d4edda, #a8e6cf);
            border-radius: var(--radius-lg);
            padding: var(--spacing-xl);
            text-align: center;
            margin-top: var(--spacing-xl);
            border: 2px solid var(--success);
        }
        
        .download-card {
            max-width: 400px;
            margin: 0 auto;
        }
        
        .download-icon {
            background: var(--success);
            color: var(--white);
            width: 60px;
            height: 60px;
            border-radius: var(--radius-full);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            margin: 0 auto var(--spacing-md);
            animation: bounceIn 0.6s ease;
        }
        
        .download-card h3 {
            color: var(--success);
            margin-bottom: var(--spacing-md);
            font-weight: 700;
        }
        
        .download-card p {
            color: var(--dark-gray);
            margin-bottom: var(--spacing-lg);
        }
    `;
    document.head.appendChild(style);
    
    // Export for global access
    window.statusTracker = statusTracker;
});
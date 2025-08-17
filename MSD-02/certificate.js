// Certificate JavaScript - Enhanced Interactive Features
class CertificateManager {
    constructor() {
        this.registrations = JSON.parse(localStorage.getItem('parentRegistrations')) || [];
        this.currentCertificate = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkURLParameters();
        this.setupPrintStyles();
    }

    setupEventListeners() {
        // Certificate access form
        const accessForm = document.getElementById('certificateAccessForm');
        if (accessForm) {
            accessForm.addEventListener('submit', (e) => this.handleCertificateAccess(e));
        }

        // Action buttons
        const backBtn = document.getElementById('backToAccess');
        const downloadBtn = document.getElementById('downloadPDF');
        const printBtn = document.getElementById('printCertificate');
        const shareBtn = document.getElementById('shareCertificate');
        
        if (backBtn) {
            backBtn.addEventListener('click', () => this.backToAccess());
        }
        
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadPDF());
        }
        
        if (printBtn) {
            printBtn.addEventListener('click', () => this.printCertificate());
        }
        
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.shareCertificate());
        }

        // Interactive certificate effects
        this.setupCertificateInteractions();
    }

    checkURLParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const regNumber = urlParams.get('regNumber');
        const autoDownload = urlParams.get('download') === 'true';
        
        if (regNumber) {
            const registration = this.findRegistration(regNumber);
            if (registration && registration.status === 'approved') {
                this.displayCertificate(registration);
                
                if (autoDownload) {
                    setTimeout(() => this.downloadPDF(), 1000);
                }
            } else {
                this.showNotification('Certificate not found or not approved yet', 'error');
            }
        }
    }

    async handleCertificateAccess(event) {
        event.preventDefault();
        
        const regNumber = document.getElementById('accessRegNumber').value.trim();
        
        if (!regNumber) {
            this.showNotification('Please enter a registration number', 'error');
            return;
        }

        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.innerHTML = `
            <span class="material-symbols-outlined">hourglass_empty</span>
            Verifying...
        `;
        submitBtn.disabled = true;

        try {
            // Simulate verification process
            await this.simulateVerification();
            
            const registration = this.findRegistration(regNumber);
            
            if (!registration) {
                this.showNotification('Registration number not found', 'error');
                return;
            }
            
            if (registration.status !== 'approved') {
                this.showNotification(`Certificate not available. Status: ${registration.status}`, 'warning');
                return;
            }
            
            this.displayCertificate(registration);
            this.showNotification('Certificate loaded successfully!', 'success');
            
        } catch (error) {
            console.error('Certificate access error:', error);
            this.showNotification('Error accessing certificate. Please try again.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async simulateVerification() {
        return new Promise(resolve => {
            setTimeout(resolve, 1500 + Math.random() * 1000);
        });
    }

    findRegistration(regNumber) {
        return this.registrations.find(r => r.registrationNumber === regNumber);
    }

    displayCertificate(registration) {
        this.currentCertificate = registration;
        
        // Hide access form and show certificate
        const accessSection = document.getElementById('certificateAccessSection');
        const certificateSection = document.getElementById('certificateSection');
        
        if (accessSection) accessSection.style.display = 'none';
        if (certificateSection) certificateSection.style.display = 'block';
        
        // Populate certificate data
        this.populateCertificateData(registration);
        
        // Generate QR code
        this.generateQRCode(registration);
        
        // Scroll to certificate
        certificateSection.scrollIntoView({ behavior: 'smooth' });
    }

    populateCertificateData(registration) {
        const hospitalData = registration.hospitalData || {};
        
        // Certificate number (unique identifier)
        const certNumber = this.generateCertificateNumber(registration);
        document.getElementById('certificateNumber').textContent = certNumber;
        
        // Personal information
        document.getElementById('certChildName').textContent = registration.finalChildName || registration.childName;
        document.getElementById('certGender').textContent = registration.childGender || registration.gender;
        document.getElementById('certDateOfBirth').textContent = 
            registration.childDOB ? new Date(registration.childDOB).toLocaleDateString('en-IN') : 'N/A';
        document.getElementById('certPlaceOfBirth').textContent = 
            registration.placeOfBirth || hospitalData.hospitalName || 'N/A';
        
        // Parent information
        document.getElementById('certFatherName').textContent = registration.fatherName || 'N/A';
        document.getElementById('certMotherName').textContent = registration.motherName || 'N/A';
        document.getElementById('certAddress').textContent = 
            `${registration.address || ''}, ${registration.city || ''}, ${registration.state || ''} - ${registration.pincode || ''}`.replace(/^,\s*|,\s*$/g, '');
        
        // Registration information
        document.getElementById('certRegNumber').textContent = registration.registrationNumber;
        document.getElementById('certHospitalId').textContent = hospitalData.hospitalId || 'N/A';
        document.getElementById('certRegDate').textContent = 
            registration.submissionDate ? new Date(registration.submissionDate).toLocaleDateString('en-IN') : 'N/A';
        document.getElementById('certIssueDate').textContent = 
            registration.approvalDate ? new Date(registration.approvalDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN');
        
        // Local area information (can be enhanced with actual data)
        document.getElementById('certLocalArea').textContent = registration.city || 'Local Area';
        document.getElementById('certState').textContent = registration.state || 'State';
    }

    generateCertificateNumber(registration) {
        // Generate a unique certificate number based on registration data
        const date = new Date(registration.submissionDate);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const sequence = registration.registrationNumber.split('-').pop();
        
        return `BC/${year}/${month}${day}/${sequence}`;
    }

    generateQRCode(registration) {
        const qrContainer = document.getElementById('qrCode');
        if (!qrContainer) return;
        
        // Create QR code data
        const qrData = {
            regNumber: registration.registrationNumber,
            childName: registration.finalChildName || registration.childName,
            dob: registration.childDOB,
            issueDate: registration.approvalDate || new Date().toISOString(),
            verifyUrl: `${window.location.origin}/verify?cert=${registration.registrationNumber}`
        };
        
        // For demo purposes, create a visual QR code placeholder
        qrContainer.innerHTML = `
            <div class="qr-code-visual">
                <div class="qr-pattern">
                    <div class="qr-corner top-left"></div>
                    <div class="qr-corner top-right"></div>
                    <div class="qr-corner bottom-left"></div>
                    <div class="qr-data">${registration.registrationNumber.slice(-6)}</div>
                </div>
            </div>
            <p class="qr-text">Scan to verify: ${registration.registrationNumber}</p>
        `;
        
        // Add QR code styles
        this.addQRCodeStyles();
    }

    addQRCodeStyles() {
        if (document.getElementById('qrCodeStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'qrCodeStyles';
        style.textContent = `
            .qr-code-visual {
                width: 120px;
                height: 120px;
                margin: 0 auto;
                position: relative;
            }
            
            .qr-pattern {
                width: 100%;
                height: 100%;
                background: 
                    repeating-linear-gradient(0deg, #000 0px, #000 2px, transparent 2px, transparent 4px),
                    repeating-linear-gradient(90deg, #000 0px, #000 2px, transparent 2px, transparent 4px);
                position: relative;
                border: 2px solid #000;
            }
            
            .qr-corner {
                position: absolute;
                width: 20px;
                height: 20px;
                border: 3px solid #000;
            }
            
            .qr-corner.top-left {
                top: 5px;
                left: 5px;
            }
            
            .qr-corner.top-right {
                top: 5px;
                right: 5px;
            }
            
            .qr-corner.bottom-left {
                bottom: 5px;
                left: 5px;
            }
            
            .qr-data {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #000;
                color: #fff;
                padding: 2px 4px;
                font-size: 8px;
                font-family: monospace;
            }
            
            .qr-text {
                margin-top: var(--spacing-sm);
                font-size: 0.8rem;
                color: var(--dark-gray);
                text-align: center;
            }
        `;
        document.head.appendChild(style);
    }

    setupCertificateInteractions() {
        // Add hover effects to certificate
        const certificateContainer = document.querySelector('.certificate-container');
        if (!certificateContainer) return;
        
        certificateContainer.addEventListener('mouseenter', () => {
            certificateContainer.style.transform = 'scale(1.02)';
            certificateContainer.style.boxShadow = 'var(--shadow-large)';
        });
        
        certificateContainer.addEventListener('mouseleave', () => {
            certificateContainer.style.transform = 'scale(1)';
            certificateContainer.style.boxShadow = 'var(--shadow)';
        });
    }

    setupPrintStyles() {
        const printStyle = document.createElement('style');
        printStyle.textContent = `
            @media print {
                body * {
                    visibility: hidden;
                }
                
                .certificate-container,
                .certificate-container * {
                    visibility: visible;
                }
                
                .certificate-container {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    box-shadow: none !important;
                    transform: none !important;
                }
                
                .certificate-actions-bar {
                    display: none !important;
                }
                
                .header,
                .footer {
                    display: none !important;
                }
                
                .top-tricolor,
                .national-ribbon {
                    display: none !important;
                }
            }
        `;
        document.head.appendChild(printStyle);
    }

    backToAccess() {
        const accessSection = document.getElementById('certificateAccessSection');
        const certificateSection = document.getElementById('certificateSection');
        
        if (accessSection) accessSection.style.display = 'block';
        if (certificateSection) certificateSection.style.display = 'none';
        
        this.currentCertificate = null;
        
        // Clear access form
        const accessForm = document.getElementById('certificateAccessForm');
        if (accessForm) accessForm.reset();
    }

    async downloadPDF() {
        if (!this.currentCertificate) return;
        
        this.showNotification('Preparing PDF download...', 'info');
        
        try {
            // Simulate PDF generation
            await this.simulatePDFGeneration();
            
            // Create download
            const certificateData = this.generateCertificateText();
            const blob = new Blob([certificateData], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `birth-certificate-${this.currentCertificate.registrationNumber}.txt`;
            link.click();
            
            URL.revokeObjectURL(url);
            
            this.showNotification('Certificate downloaded successfully!', 'success');
            
        } catch (error) {
            console.error('Download error:', error);
            this.showNotification('Download failed. Please try again.', 'error');
        }
    }

    async simulatePDFGeneration() {
        return new Promise(resolve => {
            setTimeout(resolve, 2000 + Math.random() * 1000);
        });
    }

    generateCertificateText() {
        const reg = this.currentCertificate;
        const hospitalData = reg.hospitalData || {};
        
        return `
BIRTH CERTIFICATE
Government of India
Ministry of Home Affairs

Certificate Number: ${this.generateCertificateNumber(reg)}

This is to certify that the following information has been taken from the original record of birth which is in the register for the local area/local body of ${reg.city || 'Local Area'}, State of ${reg.state || 'State'}.

PERSONAL INFORMATION:
Name: ${reg.finalChildName || reg.childName}
Sex: ${reg.childGender || reg.gender}
Date of Birth: ${reg.childDOB ? new Date(reg.childDOB).toLocaleDateString('en-IN') : 'N/A'}
Place of Birth: ${reg.placeOfBirth || hospitalData.hospitalName || 'N/A'}

PARENTS' INFORMATION:
Father's Name: ${reg.fatherName || 'N/A'}
Mother's Name: ${reg.motherName || 'N/A'}
Address: ${reg.address || ''}, ${reg.city || ''}, ${reg.state || ''} - ${reg.pincode || ''}

REGISTRATION INFORMATION:
Registration Number: ${reg.registrationNumber}
Hospital ID: ${hospitalData.hospitalId || 'N/A'}
Date of Registration: ${reg.submissionDate ? new Date(reg.submissionDate).toLocaleDateString('en-IN') : 'N/A'}
Date of Issue: ${reg.approvalDate ? new Date(reg.approvalDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')}

Registrar of Births and Deaths
Government of India

This is a digitally generated certificate.
Verification URL: ${window.location.origin}/verify?cert=${reg.registrationNumber}
        `;
    }

    printCertificate() {
        if (!this.currentCertificate) return;
        
        this.showNotification('Preparing for printing...', 'info');
        
        setTimeout(() => {
            window.print();
            this.showNotification('Print dialog opened', 'success');
        }, 1000);
    }

    shareCertificate() {
        if (!this.currentCertificate) return;
        
        const shareData = {
            title: 'Birth Certificate',
            text: `Birth Certificate for ${this.currentCertificate.finalChildName || this.currentCertificate.childName}`,
            url: `${window.location.origin}/certificate.html?regNumber=${this.currentCertificate.registrationNumber}`
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
        // Create share modal
        const shareModal = document.createElement('div');
        shareModal.className = 'modal';
        shareModal.style.display = 'block';
        
        shareModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Share Certificate</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div class="modal-body">
                    <p>Share this certificate using the link below:</p>
                    <div class="share-link-container">
                        <input type="text" value="${shareData.url}" readonly class="share-link-input">
                        <button class="btn btn-primary" onclick="navigator.clipboard.writeText('${shareData.url}').then(() => { 
                            this.textContent = 'Copied!'; 
                            setTimeout(() => this.textContent = 'Copy Link', 2000);
                        })">Copy Link</button>
                    </div>
                    <div class="share-options">
                        <h4>Share via:</h4>
                        <div class="share-buttons">
                            <button class="share-btn email" onclick="window.open('mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(shareData.text + '\\n\\n' + shareData.url)}')">
                                <span class="material-symbols-outlined">email</span>
                                Email
                            </button>
                            <button class="share-btn whatsapp" onclick="window.open('https://wa.me/?text=${encodeURIComponent(shareData.text + '\\n' + shareData.url)}')">
                                <span class="material-symbols-outlined">chat</span>
                                WhatsApp
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(shareModal);
        
        // Add share modal styles
        this.addShareModalStyles();
    }

    addShareModalStyles() {
        if (document.getElementById('shareModalStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'shareModalStyles';
        style.textContent = `
            .share-link-container {
                display: flex;
                gap: var(--spacing-sm);
                margin: var(--spacing-lg) 0;
            }
            
            .share-link-input {
                flex: 1;
                padding: var(--spacing-sm);
                border: 2px solid var(--border-color);
                border-radius: var(--radius-md);
                background: var(--light-gray);
            }
            
            .share-options {
                margin-top: var(--spacing-lg);
            }
            
            .share-options h4 {
                color: var(--primary-blue);
                margin-bottom: var(--spacing-md);
            }
            
            .share-buttons {
                display: flex;
                gap: var(--spacing-md);
            }
            
            .share-btn {
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                padding: var(--spacing-md);
                border: 2px solid var(--border-color);
                border-radius: var(--radius-md);
                background: var(--white);
                color: var(--dark-gray);
                cursor: pointer;
                transition: all 0.3s ease;
                text-decoration: none;
            }
            
            .share-btn:hover {
                border-color: var(--primary-blue);
                color: var(--primary-blue);
                transform: translateY(-2px);
            }
            
            .share-btn.email:hover {
                border-color: #ea4335;
                color: #ea4335;
            }
            
            .share-btn.whatsapp:hover {
                border-color: #25d366;
                color: #25d366;
            }
        `;
        document.head.appendChild(style);
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

// Initialize Certificate Manager
document.addEventListener('DOMContentLoaded', function() {
    const certificateManager = new CertificateManager();
    
    // Add CSS animations and styles
    const style = document.createElement('style');
    style.textContent = `
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
        
        .certificate-access-section {
            margin-bottom: var(--spacing-xl);
        }
        
        .access-container {
            background: var(--white);
            border-radius: var(--radius-xl);
            padding: var(--spacing-xxl);
            box-shadow: var(--shadow);
            border: 1px solid var(--border-color);
            text-align: center;
        }
        
        .access-header h2 {
            color: var(--primary-blue);
            font-size: 2rem;
            margin-bottom: var(--spacing-sm);
            font-weight: 700;
        }
        
        .access-header p {
            color: var(--dark-gray);
            font-size: 1.1rem;
            margin-bottom: var(--spacing-xl);
        }
        
        .access-form {
            max-width: 400px;
            margin: 0 auto;
        }
        
        .certificate-actions-bar {
            background: var(--white);
            padding: var(--spacing-lg);
            border-radius: var(--radius-lg);
            margin-bottom: var(--spacing-lg);
            box-shadow: var(--shadow);
            display: flex;
            justify-content: space-between;
            align-items: center;
            border: 1px solid var(--border-color);
        }
        
        .action-buttons {
            display: flex;
            gap: var(--spacing-sm);
        }
        
        .certificate-container {
            background: var(--white);
            border-radius: var(--radius-xl);
            padding: var(--spacing-xxl);
            box-shadow: var(--shadow);
            border: 1px solid var(--border-color);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .certificate-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 6px;
            background: linear-gradient(90deg, var(--saffron), var(--white), var(--green));
        }
        
        .certificate-header {
            text-align: center;
            margin-bottom: var(--spacing-xxl);
            padding-bottom: var(--spacing-lg);
            border-bottom: 3px solid var(--primary-blue);
        }
        
        .government-emblem {
            margin-bottom: var(--spacing-lg);
        }
        
        .emblem-circle {
            background: linear-gradient(135deg, var(--primary-blue), var(--secondary-blue));
            color: var(--white);
            width: 100px;
            height: 100px;
            border-radius: var(--radius-full);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
            margin: 0 auto;
            box-shadow: var(--shadow);
        }
        
        .certificate-title h1 {
            color: var(--primary-blue);
            font-size: 3rem;
            margin-bottom: var(--spacing-sm);
            font-weight: 700;
            letter-spacing: 3px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }
        
        .certificate-title p {
            color: var(--dark-gray);
            font-size: 1.2rem;
            margin-bottom: var(--spacing-xs);
            font-weight: 500;
        }
        
        .certificate-subtitle {
            font-size: 1rem !important;
            color: var(--dark-gray);
            opacity: 0.8;
        }
        
        .certificate-number {
            position: absolute;
            top: var(--spacing-lg);
            right: var(--spacing-lg);
            text-align: right;
            background: var(--light-gray);
            padding: var(--spacing-md);
            border-radius: var(--radius-md);
            border: 1px solid var(--border-color);
        }
        
        .certificate-number span:first-child {
            display: block;
            font-size: 0.8rem;
            color: var(--dark-gray);
            margin-bottom: var(--spacing-xs);
        }
        
        .certificate-number span:last-child {
            font-weight: 700;
            color: var(--primary-blue);
            font-family: monospace;
        }
        
        .certification-statement {
            background: var(--light-gray);
            padding: var(--spacing-lg);
            border-radius: var(--radius-md);
            margin-bottom: var(--spacing-xl);
            border-left: 4px solid var(--primary-blue);
        }
        
        .certification-statement p {
            color: var(--dark-gray);
            line-height: 1.6;
            font-style: italic;
        }
        
        .certificate-details {
            margin-bottom: var(--spacing-xl);
        }
        
        .details-section {
            margin-bottom: var(--spacing-xl);
            padding: var(--spacing-lg);
            background: var(--light-gray);
            border-radius: var(--radius-md);
            border: 1px solid var(--border-color);
        }
        
        .details-section h3 {
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
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: var(--spacing-sm) 0;
            border-bottom: 1px solid var(--border-color);
        }
        
        .detail-row:last-child {
            border-bottom: none;
        }
        
        .detail-label {
            font-weight: 600;
            color: var(--dark-gray);
        }
        
        .detail-value {
            color: var(--primary-blue);
            font-weight: 500;
            text-align: right;
        }
        
        .verification-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: var(--spacing-xl) 0;
            padding: var(--spacing-lg);
            background: var(--light-gray);
            border-radius: var(--radius-md);
            border: 1px solid var(--border-color);
        }
        
        .qr-code-container {
            text-align: center;
        }
        
        .verification-info h4 {
            color: var(--primary-blue);
            margin-bottom: var(--spacing-md);
            font-weight: 600;
        }
        
        .verification-item {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            margin-bottom: var(--spacing-sm);
            color: var(--success);
            font-weight: 500;
        }
        
        .certificate-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: var(--spacing-xxl);
            padding-top: var(--spacing-lg);
            border-top: 3px solid var(--primary-blue);
        }
        
        .signature-section {
            text-align: center;
        }
        
        .signature-box {
            width: 200px;
            height: 80px;
            border: 2px solid var(--border-color);
            border-radius: var(--radius-md);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background: var(--light-gray);
            margin-bottom: var(--spacing-md);
        }
        
        .signature-line {
            width: 150px;
            height: 2px;
            background: var(--dark-gray);
            margin-bottom: var(--spacing-sm);
        }
        
        .signature-section p {
            color: var(--dark-gray);
            font-weight: 500;
            margin-bottom: var(--spacing-xs);
        }
        
        .authority-name {
            font-size: 0.9rem;
            opacity: 0.8;
        }
        
        .seal-section {
            text-align: center;
        }
        
        .official-seal {
            width: 80px;
            height: 80px;
            border: 3px solid var(--primary-blue);
            border-radius: var(--radius-full);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background: var(--light-gray);
            margin: 0 auto var(--spacing-sm);
        }
        
        .official-seal .material-symbols-outlined {
            font-size: 2rem;
            color: var(--primary-blue);
        }
        
        .official-seal p {
            font-size: 0.8rem;
            color: var(--primary-blue);
            font-weight: 600;
            margin: 0;
        }
    `;
    document.head.appendChild(style);
    
    // Export for global access
    window.certificateManager = certificateManager;
});
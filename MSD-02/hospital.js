// Hospital Portal JavaScript - Enhanced Interactive Features
class HospitalPortal {
    constructor() {
        this.notifications = JSON.parse(localStorage.getItem('hospitalNotifications')) || [];
        this.currentView = 'upload';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupViewToggle();
        this.loadDashboardData();
        this.setupFormValidation();
        this.setupAutoSave();
    }

    setupEventListeners() {
        const form = document.getElementById('birthNotificationForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmission(e));
        }

        // Real-time validation
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.validateField(input));
            input.addEventListener('blur', () => this.validateField(input));
        });

        // Date and time constraints
        this.setupDateTimeConstraints();
    }

    setupViewToggle() {
        const toggleBtns = document.querySelectorAll('.toggle-btn');
        const uploadSection = document.getElementById('uploadSection');
        const dashboardSection = document.getElementById('dashboardSection');

        toggleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                this.switchView(view);
                
                // Update active button
                toggleBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    switchView(view) {
        const uploadSection = document.getElementById('uploadSection');
        const dashboardSection = document.getElementById('dashboardSection');

        if (view === 'upload') {
            uploadSection.style.display = 'block';
            dashboardSection.style.display = 'none';
        } else {
            uploadSection.style.display = 'none';
            dashboardSection.style.display = 'block';
            this.loadDashboardData();
        }
        
        this.currentView = view;
    }

    setupDateTimeConstraints() {
        const dateInput = document.getElementById('dateOfBirth');
        const timeInput = document.getElementById('timeOfBirth');
        
        if (dateInput) {
            // Set max date to today
            const today = new Date().toISOString().split('T')[0];
            dateInput.max = today;
            
            // Set default to today
            dateInput.value = today;
        }
        
        if (timeInput) {
            // Set default to current time
            const now = new Date();
            const currentTime = now.toTimeString().slice(0, 5);
            timeInput.value = currentTime;
        }
    }

    setupFormValidation() {
        const requiredFields = document.querySelectorAll('input[required], select[required]');
        
        requiredFields.forEach(field => {
            field.addEventListener('input', () => {
                this.clearFieldError(field);
                this.updateFormProgress();
            });
        });
    }

    setupAutoSave() {
        const form = document.getElementById('birthNotificationForm');
        if (!form) return;

        // Auto-save every 30 seconds
        setInterval(() => {
            this.autoSaveForm();
        }, 30000);

        // Auto-save on input change (debounced)
        let saveTimeout;
        form.addEventListener('input', () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                this.autoSaveForm();
            }, 2000);
        });

        // Load auto-saved data on page load
        this.loadAutoSavedData();
    }

    autoSaveForm() {
        const form = document.getElementById('birthNotificationForm');
        if (!form) return;

        const formData = new FormData(form);
        const formObject = {};
        
        for (let [key, value] of formData.entries()) {
            formObject[key] = value;
        }

        localStorage.setItem('hospitalFormDraft', JSON.stringify(formObject));
        localStorage.setItem('hospitalFormDraftTime', new Date().toISOString());
        
        this.showNotification('Form auto-saved', 'info', 2000);
    }

    loadAutoSavedData() {
        const savedData = localStorage.getItem('hospitalFormDraft');
        const saveTime = localStorage.getItem('hospitalFormDraftTime');
        
        if (!savedData || !saveTime) return;

        // Check if saved data is less than 24 hours old
        const saveDate = new Date(saveTime);
        const now = new Date();
        const hoursDiff = (now - saveDate) / (1000 * 60 * 60);
        
        if (hoursDiff > 24) {
            localStorage.removeItem('hospitalFormDraft');
            localStorage.removeItem('hospitalFormDraftTime');
            return;
        }

        try {
            const formObject = JSON.parse(savedData);
            const form = document.getElementById('birthNotificationForm');
            
            if (form && Object.keys(formObject).length > 0) {
                const shouldRestore = confirm('Found auto-saved form data. Would you like to restore it?');
                
                if (shouldRestore) {
                    Object.keys(formObject).forEach(key => {
                        const input = form.querySelector(`[name="${key}"]`);
                        if (input && formObject[key]) {
                            input.value = formObject[key];
                        }
                    });
                    
                    this.showNotification('Auto-saved data restored', 'success');
                }
            }
        } catch (error) {
            console.error('Error loading auto-saved data:', error);
        }
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        
        this.clearFieldError(field);
        
        if (field.required && !value) {
            this.showFieldError(field, `${this.getFieldDisplayName(fieldName)} is required`);
            return false;
        }

        // Specific validations
        switch (fieldName) {
            case 'hospitalRegNo':
                if (value && !/^[A-Z0-9]{6,20}$/.test(value)) {
                    this.showFieldError(field, 'Hospital registration number should be 6-20 alphanumeric characters');
                    return false;
                }
                break;
            case 'weight':
                if (value && (parseFloat(value) < 0.5 || parseFloat(value) > 10)) {
                    this.showFieldError(field, 'Weight should be between 0.5kg and 10kg');
                    return false;
                }
                break;
            case 'dateOfBirth':
                if (value) {
                    const birthDate = new Date(value);
                    const today = new Date();
                    const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
                    
                    if (birthDate > today) {
                        this.showFieldError(field, 'Birth date cannot be in the future');
                        return false;
                    }
                    
                    if (birthDate < oneYearAgo) {
                        this.showFieldWarning(field, 'Birth date is more than 1 year ago - special documentation may be required');
                    }
                }
                break;
        }
        
        return true;
    }

    getFieldDisplayName(fieldName) {
        const displayNames = {
            'hospitalName': 'Hospital name',
            'hospitalRegNo': 'Hospital registration number',
            'childName': 'Child\'s name',
            'gender': 'Gender',
            'dateOfBirth': 'Date of birth',
            'timeOfBirth': 'Time of birth',
            'weight': 'Weight',
            'deliveryType': 'Delivery type',
            'attendingDoctor': 'Attending doctor',
            'doctorLicense': 'Doctor\'s license number'
        };
        
        return displayNames[fieldName] || fieldName.replace(/([A-Z])/g, ' $1').toLowerCase();
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: var(--danger);
            font-size: 0.85rem;
            margin-top: 0.25rem;
            display: block;
            animation: fadeIn 0.3s ease;
        `;
        
        field.parentNode.appendChild(errorDiv);
        field.style.borderColor = 'var(--danger)';
        field.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.1)';
    }

    showFieldWarning(field, message) {
        this.clearFieldError(field);
        
        const warningDiv = document.createElement('div');
        warningDiv.className = 'field-warning';
        warningDiv.textContent = message;
        warningDiv.style.cssText = `
            color: var(--warning);
            font-size: 0.85rem;
            margin-top: 0.25rem;
            display: block;
            animation: fadeIn 0.3s ease;
        `;
        
        field.parentNode.appendChild(warningDiv);
        field.style.borderColor = 'var(--warning)';
    }

    clearFieldError(field) {
        const errorDiv = field.parentNode.querySelector('.field-error');
        const warningDiv = field.parentNode.querySelector('.field-warning');
        
        if (errorDiv) errorDiv.remove();
        if (warningDiv) warningDiv.remove();
        
        field.style.borderColor = '';
        field.style.boxShadow = '';
    }

    updateFormProgress() {
        const requiredFields = document.querySelectorAll('input[required], select[required]');
        const filledFields = Array.from(requiredFields).filter(field => field.value.trim());
        const progress = (filledFields.length / requiredFields.length) * 100;
        
        // Update any progress indicators
        const progressBar = document.querySelector('.form-progress-fill');
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
    }

    async handleFormSubmission(event) {
        event.preventDefault();
        
        if (!this.validateForm()) {
            this.showNotification('Please correct the errors in the form', 'error');
            return;
        }

        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.innerHTML = `
            <span class="material-symbols-outlined">hourglass_empty</span>
            Uploading...
        `;
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');

        try {
            const formData = new FormData(event.target);
            const notificationData = this.collectFormData(formData);
            
            // Simulate API call
            await this.simulateUpload();
            
            // Generate Hospital ID
            const hospitalId = this.generateHospitalId();
            notificationData.hospitalId = hospitalId;
            notificationData.id = Date.now();
            notificationData.status = 'uploaded';
            notificationData.uploadDate = new Date().toISOString();
            
            // Save to localStorage
            this.notifications.push(notificationData);
            this.saveNotifications();
            
            // Clear auto-saved draft
            localStorage.removeItem('hospitalFormDraft');
            localStorage.removeItem('hospitalFormDraftTime');
            
            // Show success
            this.showSuccessMessage(hospitalId, notificationData);
            
            // Reset form
            event.target.reset();
            
        } catch (error) {
            console.error('Upload error:', error);
            this.showNotification('Upload failed. Please try again.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }
    }

    validateForm() {
        const requiredFields = document.querySelectorAll('input[required], select[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    collectFormData(formData) {
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        return data;
    }

    generateHospitalId() {
        const prefix = 'HSP';
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${prefix}-${timestamp}${random}`;
    }

    async simulateUpload() {
        // Simulate network delay
        return new Promise(resolve => {
            setTimeout(resolve, 2000 + Math.random() * 1000);
        });
    }

    showSuccessMessage(hospitalId, data) {
        const displayDiv = document.getElementById('hospitalIdDisplay');
        const idElement = document.getElementById('generatedHospitalId');
        
        if (displayDiv && idElement) {
            idElement.textContent = hospitalId;
            displayDiv.style.display = 'block';
            displayDiv.scrollIntoView({ behavior: 'smooth' });
            
            // Setup copy functionality
            const copyBtn = document.getElementById('copyIdBtn');
            if (copyBtn) {
                copyBtn.addEventListener('click', () => {
                    navigator.clipboard.writeText(hospitalId).then(() => {
                        this.showNotification('Hospital ID copied to clipboard!', 'success');
                        copyBtn.innerHTML = `
                            <span class="material-symbols-outlined">check</span>
                            Copied!
                        `;
                        
                        setTimeout(() => {
                            copyBtn.innerHTML = `
                                <span class="material-symbols-outlined">content_copy</span>
                                Copy ID
                            `;
                        }, 2000);
                    });
                });
            }
        }
        
        this.showNotification('Birth notification uploaded successfully!', 'success');
        
        // Update dashboard stats
        this.updateDashboardStats();
    }

    loadDashboardData() {
        if (this.currentView !== 'dashboard') return;
        
        this.updateDashboardStats();
        this.loadNotificationsTable();
        this.setupDashboardControls();
    }

    updateDashboardStats() {
        const totalElement = document.getElementById('totalNotifications');
        const todayElement = document.getElementById('todayNotifications');
        const pendingElement = document.getElementById('pendingRegistrations');
        
        if (totalElement) totalElement.textContent = this.notifications.length;
        
        if (todayElement) {
            const today = new Date().toDateString();
            const todayCount = this.notifications.filter(n => 
                new Date(n.uploadDate).toDateString() === today
            ).length;
            todayElement.textContent = todayCount;
        }
        
        if (pendingElement) {
            const pendingCount = this.notifications.filter(n => 
                n.status === 'uploaded' || n.status === 'pending'
            ).length;
            pendingElement.textContent = pendingCount;
        }
    }

    loadNotificationsTable() {
        const tbody = document.getElementById('notificationsTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (this.notifications.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 2rem; color: var(--dark-gray);">
                        <span class="material-symbols-outlined" style="font-size: 3rem; opacity: 0.5;">inbox</span>
                        <p>No birth notifications uploaded yet</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        this.notifications.forEach(notification => {
            const row = this.createNotificationRow(notification);
            tbody.appendChild(row);
        });
    }

    createNotificationRow(notification) {
        const row = document.createElement('tr');
        row.style.animation = 'fadeInUp 0.3s ease';
        
        const statusBadge = this.getStatusBadge(notification.status);
        const formattedDate = new Date(notification.uploadDate).toLocaleDateString();
        const formattedTime = new Date(notification.uploadDate).toLocaleTimeString();
        
        row.innerHTML = `
            <td><strong>${notification.hospitalId}</strong></td>
            <td>${notification.childName}</td>
            <td>
                ${new Date(notification.dateOfBirth).toLocaleDateString()}<br>
                <small style="color: #6c757d;">${notification.timeOfBirth || 'N/A'}</small>
            </td>
            <td>${notification.gender}</td>
            <td>${notification.weight ? notification.weight + ' kg' : 'N/A'}</td>
            <td>${notification.attendingDoctor}</td>
            <td>${statusBadge}</td>
            <td>
                ${formattedDate}<br>
                <small style="color: #6c757d;">${formattedTime}</small>
            </td>
        `;
        
        return row;
    }

    getStatusBadge(status) {
        const badges = {
            'uploaded': '<span class="status-badge pending">Uploaded</span>',
            'pending': '<span class="status-badge pending">Pending Registration</span>',
            'registered': '<span class="status-badge approved">Registered</span>',
            'approved': '<span class="status-badge approved">Certificate Approved</span>'
        };
        
        return badges[status] || '<span class="status-badge">Unknown</span>';
    }

    setupDashboardControls() {
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        const dateFilter = document.getElementById('dateFilter');
        const statusFilter = document.getElementById('statusFilter');
        
        if (searchInput && searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.searchNotifications(searchInput.value);
            });
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchNotifications(searchInput.value);
                }
            });
            
            // Real-time search
            searchInput.addEventListener('input', (e) => {
                if (e.target.value.length > 2 || e.target.value.length === 0) {
                    this.searchNotifications(e.target.value);
                }
            });
        }
        
        if (dateFilter) {
            dateFilter.addEventListener('change', () => {
                this.filterNotifications();
            });
        }
        
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.filterNotifications();
            });
        }
    }

    searchNotifications(query) {
        const rows = document.querySelectorAll('#notificationsTableBody tr');
        
        rows.forEach(row => {
            if (row.cells.length === 1) return; // Skip empty state row
            
            const text = row.textContent.toLowerCase();
            const isVisible = !query || text.includes(query.toLowerCase());
            
            row.style.display = isVisible ? '' : 'none';
            
            if (isVisible && query) {
                row.style.animation = 'highlight 0.5s ease';
            }
        });
        
        if (query) {
            this.showNotification(`Search results for: "${query}"`, 'info', 3000);
        }
    }

    filterNotifications() {
        const dateFilter = document.getElementById('dateFilter')?.value;
        const statusFilter = document.getElementById('statusFilter')?.value;
        
        let filteredNotifications = [...this.notifications];
        
        // Date filtering
        if (dateFilter && dateFilter !== 'all') {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            filteredNotifications = filteredNotifications.filter(notification => {
                const uploadDate = new Date(notification.uploadDate);
                
                switch (dateFilter) {
                    case 'today':
                        return uploadDate >= today;
                    case 'week':
                        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                        return uploadDate >= weekAgo;
                    case 'month':
                        const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
                        return uploadDate >= monthAgo;
                    default:
                        return true;
                }
            });
        }
        
        // Status filtering
        if (statusFilter && statusFilter !== 'all') {
            filteredNotifications = filteredNotifications.filter(notification => 
                notification.status === statusFilter
            );
        }
        
        // Update table with filtered data
        this.displayFilteredNotifications(filteredNotifications);
    }

    displayFilteredNotifications(notifications) {
        const tbody = document.getElementById('notificationsTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (notifications.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 2rem; color: var(--dark-gray);">
                        <span class="material-symbols-outlined" style="font-size: 3rem; opacity: 0.5;">search_off</span>
                        <p>No notifications match the current filters</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        notifications.forEach(notification => {
            const row = this.createNotificationRow(notification);
            tbody.appendChild(row);
        });
    }

    saveNotifications() {
        localStorage.setItem('hospitalNotifications', JSON.stringify(this.notifications));
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

// Initialize Hospital Portal
document.addEventListener('DOMContentLoaded', function() {
    const hospitalPortal = new HospitalPortal();
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes highlight {
            0% { background-color: rgba(30, 60, 114, 0.1); }
            50% { background-color: rgba(30, 60, 114, 0.2); }
            100% { background-color: transparent; }
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
        
        .field-error, .field-warning {
            animation: fadeIn 0.3s ease;
        }
    `;
    document.head.appendChild(style);
    
    // Export for global access
    window.hospitalPortal = hospitalPortal;
});
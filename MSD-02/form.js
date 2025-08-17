// Form JavaScript for Government Birth Registration Portal
// Manages birth registration form submission, validation (check Aadhaar format, mandatory fields)

document.addEventListener('DOMContentLoaded', function() {
    console.log('Birth Registration Form module loaded');
    
    // Initialize birth registration form
    initializeBirthForm();
    
    // Initialize form validation
    initializeFormValidation();
    
    // Initialize document upload functionality
    initializeDocumentUpload();
    
    // Initialize auto-save functionality
    initializeAutoSave();
});

// Initialize birth registration form
function initializeBirthForm() {
    const birthForm = document.getElementById('birthRegistrationForm');
    if (!birthForm) return;
    
    // Add form submission handler
    birthForm.addEventListener('submit', handleBirthFormSubmission);
    
    // Initialize form sections
    initializeFormSections();
    
    // Initialize conditional fields
    initializeConditionalFields();
    
    // Initialize date pickers
    initializeDatePickers();
}

// Initialize form sections with navigation
function initializeFormSections() {
    const sections = document.querySelectorAll('.form-section');
    const progressBar = document.querySelector('.progress-bar');
    
    if (!sections.length || !progressBar) return;
    
    // Add section navigation
    sections.forEach((section, index) => {
        const sectionHeader = section.querySelector('.section-header');
        if (sectionHeader) {
            sectionHeader.addEventListener('click', () => {
                toggleSection(section, index);
            });
        }
    });
    
    // Update progress bar
    updateProgressBar();
}

// Toggle section visibility
function toggleSection(section, index) {
    const isActive = section.classList.contains('active');
    
    if (isActive) {
        section.classList.remove('active');
    } else {
        // Close other sections
        document.querySelectorAll('.form-section').forEach(s => {
            s.classList.remove('active');
        });
        
        // Open clicked section
        section.classList.add('active');
    }
    
    updateProgressBar();
}

// Update progress bar
function updateProgressBar() {
    const progressBar = document.querySelector('.progress-bar-fill');
    const sections = document.querySelectorAll('.form-section');
    const completedSections = document.querySelectorAll('.form-section.completed');
    
    if (progressBar) {
        const progress = (completedSections.length / sections.length) * 100;
        progressBar.style.width = progress + '%';
        progressBar.setAttribute('aria-valuenow', progress);
    }
}

// Initialize conditional fields
function initializeConditionalFields() {
    // Hospital staff specific fields
    const hospitalStaffFields = document.querySelectorAll('.hospital-staff-field');
    const roleSelect = document.querySelector('select[name="registrationType"]');
    
    if (roleSelect && hospitalStaffFields.length) {
        roleSelect.addEventListener('change', function() {
            const isHospitalStaff = this.value === 'hospital';
            hospitalStaffFields.forEach(field => {
                field.style.display = isHospitalStaff ? 'block' : 'none';
                if (isHospitalStaff) {
                    field.querySelectorAll('input, select').forEach(input => {
                        input.required = true;
                    });
                } else {
                    field.querySelectorAll('input, select').forEach(input => {
                        input.required = false;
                    });
                }
            });
        });
    }
    
    // Multiple births handling
    const multipleBirthsCheckbox = document.querySelector('input[name="multipleBirths"]');
    const multipleBirthsFields = document.querySelectorAll('.multiple-births-field');
    
    if (multipleBirthsCheckbox && multipleBirthsFields.length) {
        multipleBirthsCheckbox.addEventListener('change', function() {
            const showFields = this.checked;
            multipleBirthsFields.forEach(field => {
                field.style.display = showFields ? 'block' : 'none';
                if (showFields) {
                    field.querySelectorAll('input, select').forEach(input => {
                        input.required = true;
                    });
                } else {
                    field.querySelectorAll('input, select').forEach(input => {
                        input.required = false;
                    });
                }
            });
        });
    }
}

// Initialize date pickers
function initializeDatePickers() {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    
    dateInputs.forEach(input => {
        // Set max date to today for birth date
        if (input.name === 'dateOfBirth') {
            const today = new Date().toISOString().split('T')[0];
            input.max = today;
        }
        
        // Add date validation
        input.addEventListener('change', function() {
            validateDateField(this);
        });
    });
}

// Initialize form validation
function initializeFormValidation() {
    const requiredInputs = document.querySelectorAll('input[required], select[required], textarea[required]');
    
    requiredInputs.forEach(input => {
        // Add real-time validation
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            clearFieldError(this);
        });
        
        // Add specific validation for certain fields
        if (input.name === 'aadhaar') {
            input.addEventListener('input', function() {
                formatAadhaarNumber(this);
            });
        }
        
        if (input.name === 'phone') {
            input.addEventListener('input', function() {
                formatPhoneNumber(this);
            });
        }
        
        if (input.name === 'pincode') {
            input.addEventListener('input', function() {
                formatPincode(this);
            });
        }
    });
}

// Handle birth form submission
async function handleBirthFormSubmission(event) {
    event.preventDefault();
    
    // Validate entire form
    if (!validateEntireForm()) {
        showNotification('Please correct the errors in the form.', 'error');
        return;
    }
    
    // Show loading state
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Submitting Registration...';
    submitButton.disabled = true;
    
    try {
        // Collect form data
        const formData = new FormData(event.target);
        const registrationData = collectFormData(formData);
        
        // Simulate API submission
        const response = await submitBirthRegistration(registrationData);
        
        if (response.success) {
            showNotification('Birth registration submitted successfully!', 'success');
            
            // Store registration ID
            sessionStorage.setItem('registrationId', response.registrationId);
            
            // Redirect to certificate page or dashboard
            setTimeout(() => {
                if (response.certificateReady) {
                    window.location.href = 'certificate.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            }, 2000);
        } else {
            showNotification(response.message || 'Registration failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Form submission error:', error);
        showNotification('An error occurred during submission. Please try again.', 'error');
    } finally {
        // Reset button state
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

// Validate entire form
function validateEntireForm() {
    const requiredInputs = document.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    requiredInputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    // Validate specific business rules
    if (!validateBusinessRules()) {
        isValid = false;
    }
    
    return isValid;
}

// Validate business rules
function validateBusinessRules() {
    // Check if child is not born in the future
    const birthDateInput = document.querySelector('input[name="dateOfBirth"]');
    if (birthDateInput && birthDateInput.value) {
        const birthDate = new Date(birthDateInput.value);
        const today = new Date();
        
        if (birthDate > today) {
            showFieldError(birthDateInput, 'Birth date cannot be in the future.');
            return false;
        }
    }
    
    // Check if registration is within time limit (1 year for normal registration)
    if (birthDateInput && birthDateInput.value) {
        const birthDate = new Date(birthDateInput.value);
        const today = new Date();
        const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
        
        if (birthDate < oneYearAgo) {
            const registrationType = document.querySelector('select[name="registrationType"]');
            if (registrationType && registrationType.value === 'normal') {
                showNotification('Registration after 1 year requires special documentation.', 'warning');
            }
        }
    }
    
    return true;
}

// Validate individual field
function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    
    if (!value) {
        showFieldError(field, `${getFieldDisplayName(fieldName)} is required.`);
        return false;
    }
    
    // Field-specific validation
    switch(fieldName) {
        case 'aadhaar':
            if (!validateAadhaarFormat(value)) {
                showFieldError(field, 'Please enter a valid Aadhaar number.');
                return false;
            }
            break;
        case 'email':
            if (!validateEmailFormat(value)) {
                showFieldError(field, 'Please enter a valid email address.');
                return false;
            }
            break;
        case 'phone':
            if (!validatePhoneFormat(value)) {
                showFieldError(field, 'Please enter a valid phone number.');
                return false;
            }
            break;
        case 'pincode':
            if (!validatePincodeFormat(value)) {
                showFieldError(field, 'Please enter a valid pincode.');
                return false;
            }
            break;
        case 'dateOfBirth':
            if (!validateDateField(field)) {
                return false;
            }
            break;
    }
    
    return true;
}

// Validate date field
function validateDateField(field) {
    const value = field.value;
    if (!value) return true; // Let required validation handle empty values
    
    const selectedDate = new Date(value);
    const today = new Date();
    
    if (selectedDate > today) {
        showFieldError(field, 'Date cannot be in the future.');
        return false;
    }
    
    // Check if date is too old (more than 100 years ago)
    const hundredYearsAgo = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
    if (selectedDate < hundredYearsAgo) {
        showFieldError(field, 'Date seems too old. Please verify.');
        return false;
    }
    
    clearFieldError(field);
    return true;
}

// Get field display name
function getFieldDisplayName(fieldName) {
    const displayNames = {
        'childFirstName': 'Child\'s first name',
        'childLastName': 'Child\'s last name',
        'dateOfBirth': 'Date of birth',
        'placeOfBirth': 'Place of birth',
        'fatherAadhaar': 'Father\'s Aadhaar',
        'fatherName': 'Father\'s name',
        'motherAadhaar': 'Mother\'s Aadhaar',
        'motherName': 'Mother\'s name',
        'hospitalId': 'Hospital ID',
        'doctorName': 'Doctor\'s name'
    };
    
    return displayNames[fieldName] || fieldName.replace(/([A-Z])/g, ' $1').toLowerCase();
}

// Format Aadhaar number
function formatAadhaarNumber(input) {
    let value = input.value.replace(/\s/g, '');
    if (value.length > 12) {
        value = value.substring(0, 12);
    }
    
    // Add spaces every 4 digits
    const formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    input.value = formattedValue;
}

// Format phone number
function formatPhoneNumber(input) {
    let value = input.value.replace(/\s/g, '');
    if (value.length > 10) {
        value = value.substring(0, 10);
    }
    
    // Add space after 5 digits
    if (value.length > 5) {
        value = value.substring(0, 5) + ' ' + value.substring(5);
    }
    
    input.value = value;
}

// Format pincode
function formatPincode(input) {
    let value = input.value.replace(/\s/g, '');
    if (value.length > 6) {
        value = value.substring(0, 6);
    }
    
    input.value = value;
}

// Validate Aadhaar format
function validateAadhaarFormat(aadhaar) {
    const aadhaarRegex = /^\d{12}$/;
    return aadhaarRegex.test(aadhaar.replace(/\s/g, ''));
}

// Validate email format
function validateEmailFormat(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate phone format
function validatePhoneFormat(phone) {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Validate pincode format
function validatePincodeFormat(pincode) {
    const pincodeRegex = /^\d{6}$/;
    return pincodeRegex.test(pincode);
}

// Show field error
function showFieldError(field, message) {
    clearFieldError(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: #dc3545;
        font-size: 0.875rem;
        margin-top: 0.25rem;
        display: block;
    `;
    
    field.parentNode.appendChild(errorDiv);
    field.style.borderColor = '#dc3545';
}

// Clear field error
function clearFieldError(field) {
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
    field.style.borderColor = '';
}

// Initialize document upload functionality
function initializeDocumentUpload() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    
    fileInputs.forEach(input => {
        input.addEventListener('change', function() {
            handleFileUpload(this);
        });
    });
}

// Handle file upload
function handleFileUpload(fileInput) {
    const file = fileInput.files[0];
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
        showNotification('Please upload only JPG, PNG, or PDF files.', 'error');
        fileInput.value = '';
        return;
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        showNotification('File size should be less than 5MB.', 'error');
        fileInput.value = '';
        return;
    }
    
    // Show upload progress
    showUploadProgress(fileInput, file);
}

// Show upload progress
function showUploadProgress(fileInput, file) {
    const progressContainer = document.createElement('div');
    progressContainer.className = 'upload-progress';
    progressContainer.innerHTML = `
        <div class="progress-bar">
            <div class="progress-fill"></div>
        </div>
        <span class="progress-text">Uploading ${file.name}...</span>
    `;
    
    fileInput.parentNode.appendChild(progressContainer);
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            // Show success message
            progressContainer.innerHTML = `
                <span class="upload-success">✓ ${file.name} uploaded successfully</span>
            `;
            
            // Remove progress bar after delay
            setTimeout(() => {
                progressContainer.remove();
            }, 3000);
        }
        
        const progressFill = progressContainer.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = progress + '%';
        }
    }, 200);
}

// Initialize auto-save functionality
function initializeAutoSave() {
    const form = document.getElementById('birthRegistrationForm');
    if (!form) return;
    
    // Auto-save every 30 seconds
    setInterval(() => {
        autoSaveForm(form);
    }, 30000);
    
    // Auto-save on form change
    form.addEventListener('input', debounce(() => {
        autoSaveForm(form);
    }, 2000));
}

// Auto-save form data
function autoSaveForm(form) {
    const formData = new FormData(form);
    const formObject = {};
    
    for (let [key, value] of formData.entries()) {
        formObject[key] = value;
    }
    
    // Save to localStorage
    localStorage.setItem('birthRegistrationDraft', JSON.stringify(formObject));
    localStorage.setItem('lastAutoSave', new Date().toISOString());
    
    console.log('Form auto-saved at:', new Date().toLocaleTimeString());
}

// Load auto-saved form data
function loadAutoSavedData() {
    const savedData = localStorage.getItem('birthRegistrationDraft');
    if (!savedData) return;
    
    try {
        const formObject = JSON.parse(savedData);
        const form = document.getElementById('birthRegistrationForm');
        
        if (form) {
            Object.keys(formObject).forEach(key => {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) {
                    input.value = formObject[key];
                }
            });
            
            showNotification('Auto-saved data restored.', 'info');
        }
    } catch (error) {
        console.error('Error loading auto-saved data:', error);
    }
}

// Debounce function
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

// Collect form data
function collectFormData(formData) {
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        if (key.includes('[]')) {
            // Handle array fields
            const arrayKey = key.replace('[]', '');
            if (!data[arrayKey]) {
                data[arrayKey] = [];
            }
            data[arrayKey].push(value);
        } else {
            data[key] = value;
        }
    }
    
    return data;
}

// Submit birth registration
async function submitBirthRegistration(data) {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Simulate success response
    return {
        success: true,
        registrationId: 'BR' + Date.now(),
        message: 'Birth registration submitted successfully!',
        certificateReady: false
    };
}

// Show notification
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

// Add notification styles
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
        
        .upload-progress {
            margin-top: 0.5rem;
        }
        
        .progress-bar {
            width: 100%;
            height: 4px;
            background: #e9ecef;
            border-radius: 2px;
            overflow: hidden;
            margin-bottom: 0.5rem;
        }
        
        .progress-fill {
            height: 100%;
            width: 0%;
            background: #007bff;
            transition: width 0.3s ease;
        }
        
        .upload-success {
            color: #28a745;
            font-weight: 500;
        }
    `;
    document.head.appendChild(style);
}

// Initialize notification styles
addNotificationStyles();

// Export functions for global use
window.BirthFormModule = {
    handleBirthFormSubmission,
    validateEntireForm,
    loadAutoSavedData,
    showNotification
}; 
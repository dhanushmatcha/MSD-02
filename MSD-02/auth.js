// Authentication JavaScript for Government Birth Registration Portal
// Handles login and registration (frontend validation, sending data to backend)

document.addEventListener('DOMContentLoaded', function() {
    console.log('Authentication module loaded');
    
    // Initialize authentication forms
    initializeAuthForms();
    
    // Initialize password strength indicator
    initializePasswordStrength();
    
    // Initialize Aadhaar validation
    initializeAadhaarValidation();
});

// Initialize authentication forms
function initializeAuthForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }
    
    // Add real-time validation
    addRealTimeValidation();
}

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const loginData = {
        aadhaar: formData.get('aadhaar'),
        password: formData.get('password'),
        role: formData.get('role')
    };
    
    // Validate form data
    if (!validateLoginData(loginData)) {
        return;
    }
    
    // Show loading state
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Logging in...';
    submitButton.disabled = true;
    
    try {
        // Simulate API call
        const response = await simulateLoginAPI(loginData);
        
        if (response.success) {
            showNotification('Login successful! Redirecting...', 'success');
            
            // Store user data in session storage
            sessionStorage.setItem('userData', JSON.stringify(response.user));
            sessionStorage.setItem('userRole', loginData.role);
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            showNotification(response.message || 'Login failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('An error occurred during login. Please try again.', 'error');
    } finally {
        // Reset button state
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

// Handle registration form submission
async function handleRegistration(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const registrationData = {
        aadhaar: formData.get('aadhaar'),
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        city: formData.get('city'),
        state: formData.get('state'),
        pincode: formData.get('pincode'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword')
    };
    
    // Validate form data
    if (!validateRegistrationData(registrationData)) {
        return;
    }
    
    // Show loading state
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Creating Account...';
    submitButton.disabled = true;
    
    try {
        // Simulate API call
        const response = await simulateRegistrationAPI(registrationData);
        
        if (response.success) {
            showNotification('Account created successfully! Please login.', 'success');
            
            // Clear form
            event.target.reset();
            
            // Redirect to login page after delay
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            showNotification(response.message || 'Registration failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('An error occurred during registration. Please try again.', 'error');
    } finally {
        // Reset button state
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

// Validate login data
function validateLoginData(data) {
    if (!data.aadhaar || !data.password || !data.role) {
        showNotification('Please fill in all required fields.', 'error');
        return false;
    }
    
    if (!validateAadhaarFormat(data.aadhaar)) {
        showNotification('Please enter a valid Aadhaar number.', 'error');
        return false;
    }
    
    if (data.password.length < 6) {
        showNotification('Password must be at least 6 characters long.', 'error');
        return false;
    }
    
    return true;
}

// Validate registration data
function validateRegistrationData(data) {
    const requiredFields = ['aadhaar', 'firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'pincode', 'password', 'confirmPassword'];
    
    for (const field of requiredFields) {
        if (!data[field]) {
            showNotification(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}.`, 'error');
            return false;
        }
    }
    
    if (!validateAadhaarFormat(data.aadhaar)) {
        showNotification('Please enter a valid Aadhaar number.', 'error');
        return false;
    }
    
    if (!validateEmailFormat(data.email)) {
        showNotification('Please enter a valid email address.', 'error');
        return false;
    }
    
    if (!validatePhoneFormat(data.phone)) {
        showNotification('Please enter a valid phone number.', 'error');
        return false;
    }
    
    if (!validatePincodeFormat(data.pincode)) {
        showNotification('Please enter a valid pincode.', 'error');
        return false;
    }
    
    if (data.password !== data.confirmPassword) {
        showNotification('Passwords do not match.', 'error');
        return false;
    }
    
    if (!validatePasswordStrength(data.password)) {
        showNotification('Password does not meet strength requirements.', 'error');
        return false;
    }
    
    return true;
}

// Validate Aadhaar format (12 digits)
function validateAadhaarFormat(aadhaar) {
    const aadhaarRegex = /^\d{12}$/;
    return aadhaarRegex.test(aadhaar.replace(/\s/g, ''));
}

// Validate email format
function validateEmailFormat(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate phone format (10 digits)
function validatePhoneFormat(phone) {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Validate pincode format (6 digits)
function validatePincodeFormat(pincode) {
    const pincodeRegex = /^\d{6}$/;
    return pincodeRegex.test(pincode);
}

// Validate password strength
function validatePasswordStrength(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
}

// Initialize password strength indicator
function initializePasswordStrength() {
    const passwordInput = document.querySelector('input[name="password"]');
    if (!passwordInput) return;
    
    const strengthIndicator = document.createElement('div');
    strengthIndicator.className = 'password-strength';
    strengthIndicator.innerHTML = `
        <div class="strength-bar">
            <div class="strength-fill"></div>
        </div>
        <div class="strength-text">Password strength: <span class="strength-value">Weak</span></div>
    `;
    
    passwordInput.parentNode.appendChild(strengthIndicator);
    
    passwordInput.addEventListener('input', function() {
        updatePasswordStrength(this.value);
    });
}

// Update password strength indicator
function updatePasswordStrength(password) {
    const strengthIndicator = document.querySelector('.password-strength');
    if (!strengthIndicator) return;
    
    const strengthFill = strengthIndicator.querySelector('.strength-fill');
    const strengthValue = strengthIndicator.querySelector('.strength-value');
    
    let strength = 0;
    let strengthText = 'Weak';
    let strengthColor = '#dc3545';
    
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
    
    switch(strength) {
        case 0:
        case 1:
            strengthText = 'Very Weak';
            strengthColor = '#dc3545';
            break;
        case 2:
            strengthText = 'Weak';
            strengthColor = '#fd7e14';
            break;
        case 3:
            strengthText = 'Fair';
            strengthColor = '#ffc107';
            break;
        case 4:
            strengthText = 'Good';
            strengthColor = '#28a745';
            break;
        case 5:
            strengthText = 'Strong';
            strengthColor = '#20c997';
            break;
    }
    
    strengthFill.style.width = (strength * 20) + '%';
    strengthFill.style.background = strengthColor;
    strengthValue.textContent = strengthText;
    strengthValue.style.color = strengthColor;
}

// Initialize Aadhaar validation
function initializeAadhaarValidation() {
    const aadhaarInputs = document.querySelectorAll('input[name="aadhaar"]');
    
    aadhaarInputs.forEach(input => {
        input.addEventListener('input', function() {
            // Format Aadhaar number with spaces
            let value = this.value.replace(/\s/g, '');
            if (value.length > 12) {
                value = value.substring(0, 12);
            }
            
            // Add spaces every 4 digits
            const formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ');
            this.value = formattedValue;
        });
    });
}

// Add real-time validation
function addRealTimeValidation() {
    const inputs = document.querySelectorAll('input[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            clearFieldError(this);
        });
    });
}

// Validate individual field
function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    
    if (!value) {
        showFieldError(field, `${fieldName.replace(/([A-Z])/g, ' $1').toLowerCase()} is required.`);
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
    }
    
    return true;
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

// Simulate login API call
async function simulateLoginAPI(loginData) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate validation
    if (loginData.aadhaar === '123456789012' && loginData.password === 'password123') {
        return {
            success: true,
            user: {
                aadhaar: loginData.aadhaar,
                role: loginData.role,
                name: 'Demo User'
            }
        };
    } else {
        return {
            success: false,
            message: 'Invalid Aadhaar number or password.'
        };
    }
}

// Simulate registration API call
async function simulateRegistrationAPI(registrationData) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate validation
    if (registrationData.aadhaar === '123456789012') {
        return {
            success: false,
            message: 'Aadhaar number already registered.'
        };
    }
    
    return {
        success: true,
        message: 'Account created successfully!'
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
        
        .password-strength {
            margin-top: 0.5rem;
        }
        
        .strength-bar {
            width: 100%;
            height: 4px;
            background: #e9ecef;
            border-radius: 2px;
            overflow: hidden;
            margin-bottom: 0.5rem;
        }
        
        .strength-fill {
            height: 100%;
            width: 0%;
            transition: all 0.3s ease;
        }
        
        .strength-text {
            font-size: 0.875rem;
            color: #6c757d;
        }
    `;
    document.head.appendChild(style);
}

// Initialize notification styles
addNotificationStyles();

// Export functions for global use
window.AuthModule = {
    handleLogin,
    handleRegistration,
    validateLoginData,
    validateRegistrationData,
    showNotification
}; 
// Parent Registration Portal JavaScript - Enhanced Interactive Features
class ParentRegistrationPortal {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.formData = {};
        this.hospitalData = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupStepNavigation();
        this.setupFormValidation();
        this.setupAutoSave();
        this.updateProgress();
    }

    setupEventListeners() {
        // Hospital ID fetch
        const fetchBtn = document.getElementById('fetchHospitalData');
        if (fetchBtn) {
            fetchBtn.addEventListener('click', () => this.fetchHospitalData());
        }

        // Step navigation buttons
        document.getElementById('proceedToStep2')?.addEventListener('click', () => this.nextStep());
        document.getElementById('proceedToStep3')?.addEventListener('click', () => this.nextStep());
        document.getElementById('backToStep1')?.addEventListener('click', () => this.previousStep());
        document.getElementById('backToStep2')?.addEventListener('click', () => this.previousStep());
        document.getElementById('backToStep3')?.addEventListener('click', () => this.previousStep());

        // Form submission
        const form = document.getElementById('parentRegistrationForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmission(e));
        }

        // New registration button
        document.getElementById('newRegistration')?.addEventListener('click', () => {
            this.resetForm();
        });

        // Real-time validation
        this.setupRealTimeValidation();
    }

    setupStepNavigation() {
        // Enable keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'ArrowRight':
                        e.preventDefault();
                        if (this.currentStep < this.totalSteps) this.nextStep();
                        break;
                    case 'ArrowLeft':
                        e.preventDefault();
                        if (this.currentStep > 1) this.previousStep();
                        break;
                }
            }
        });
    }

    setupFormValidation() {
        // Aadhaar formatting
        const aadhaarInputs = document.querySelectorAll('input[name*="Aadhaar"]');
        aadhaarInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this.formatAadhaar(e.target);
            });
        });

        // Phone formatting
        const phoneInputs = document.querySelectorAll('input[name*="Phone"]');
        phoneInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this.formatPhone(e.target);
            });
        });

        // Pincode formatting
        const pincodeInput = document.getElementById('pincode');
        if (pincodeInput) {
            pincodeInput.addEventListener('input', (e) => {
                this.formatPincode(e.target);
            });
        }
    }

    setupRealTimeValidation() {
        const inputs = document.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                this.clearFieldError(input);
                this.updateStepCompletion();
            });
        });
    }

    setupAutoSave() {
        const form = document.getElementById('parentRegistrationForm');
        if (!form) return;

        // Auto-save every 30 seconds
        setInterval(() => {
            this.autoSaveForm();
        }, 30000);

        // Auto-save on step change
        document.addEventListener('stepChanged', () => {
            this.autoSaveForm();
        });

        // Load auto-saved data
        this.loadAutoSavedData();
    }

    async fetchHospitalData() {
        const hospitalIdInput = document.getElementById('hospitalId');
        const hospitalId = hospitalIdInput.value.trim();
        
        if (!hospitalId) {
            this.showNotification('Please enter a Hospital ID', 'error');
            return;
        }

        const fetchBtn = document.getElementById('fetchHospitalData');
        const originalText = fetchBtn.innerHTML;
        
        // Show loading state
        fetchBtn.innerHTML = `
            <span class="material-symbols-outlined">hourglass_empty</span>
            Fetching Data...
        `;
        fetchBtn.disabled = true;

        try {
            // Simulate API call
            await this.simulateFetchDelay();
            
            // Get hospital data from localStorage
            const hospitalNotifications = JSON.parse(localStorage.getItem('hospitalNotifications')) || [];
            const hospitalData = hospitalNotifications.find(n => n.hospitalId === hospitalId);
            
            if (hospitalData) {
                this.hospitalData = hospitalData;
                this.displayHospitalData(hospitalData);
                this.showNotification('Hospital data found successfully!', 'success');
            } else {
                this.showNotification('Hospital ID not found. Please check and try again.', 'error');
                this.hideHospitalData();
            }
            
        } catch (error) {
            console.error('Fetch error:', error);
            this.showNotification('Error fetching hospital data. Please try again.', 'error');
            this.hideHospitalData();
        } finally {
            fetchBtn.innerHTML = originalText;
            fetchBtn.disabled = false;
        }
    }

    async simulateFetchDelay() {
        return new Promise(resolve => {
            setTimeout(resolve, 1500 + Math.random() * 1000);
        });
    }

    displayHospitalData(data) {
        const displayDiv = document.getElementById('hospitalDataDisplay');
        
        if (displayDiv) {
            document.getElementById('displayHospitalName').textContent = data.hospitalName || 'N/A';
            document.getElementById('displayChildName').textContent = data.childName || 'N/A';
            document.getElementById('displayDOB').textContent = 
                data.dateOfBirth ? new Date(data.dateOfBirth).toLocaleDateString() : 'N/A';
            document.getElementById('displayGender').textContent = data.gender || 'N/A';
            
            displayDiv.style.display = 'block';
            displayDiv.scrollIntoView({ behavior: 'smooth' });
            
            // Pre-fill form fields in step 2
            this.prefillChildDetails(data);
        }
    }

    hideHospitalData() {
        const displayDiv = document.getElementById('hospitalDataDisplay');
        if (displayDiv) {
            displayDiv.style.display = 'none';
        }
        this.hospitalData = null;
    }

    prefillChildDetails(data) {
        // Pre-fill child details in step 2
        const fields = {
            'finalChildName': data.childName,
            'childGender': data.gender,
            'childDOB': data.dateOfBirth,
            'childTOB': data.timeOfBirth,
            'placeOfBirth': data.hospitalName
        };
        
        Object.keys(fields).forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field && fields[fieldName]) {
                field.value = fields[fieldName];
            }
        });
    }

    nextStep() {
        if (!this.validateCurrentStep()) {
            this.showNotification('Please complete all required fields', 'error');
            return;
        }
        
        if (this.currentStep < this.totalSteps) {
            this.saveCurrentStepData();
            this.currentStep++;
            this.showStep(this.currentStep);
            this.updateProgress();
            
            // Dispatch custom event
            document.dispatchEvent(new CustomEvent('stepChanged', { 
                detail: { step: this.currentStep } 
            }));
        }
    }

    previousStep() {
        if (this.currentStep > 1) {
            this.saveCurrentStepData();
            this.currentStep--;
            this.showStep(this.currentStep);
            this.updateProgress();
            
            document.dispatchEvent(new CustomEvent('stepChanged', { 
                detail: { step: this.currentStep } 
            }));
        }
    }

    showStep(stepNumber) {
        // Hide all steps
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });
        
        // Show current step
        const currentStepElement = document.getElementById(`step${stepNumber}`);
        if (currentStepElement) {
            currentStepElement.classList.add('active');
            currentStepElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        // Update step indicators
        document.querySelectorAll('.step').forEach((step, index) => {
            step.classList.remove('active', 'completed');
            
            if (index + 1 === stepNumber) {
                step.classList.add('active');
            } else if (index + 1 < stepNumber) {
                step.classList.add('completed');
            }
        });
        
        // Update review section if on step 4
        if (stepNumber === 4) {
            this.updateReviewSection();
        }
    }

    updateProgress() {
        const progressFill = document.getElementById('progressFill');
        if (progressFill) {
            const progress = (this.currentStep / this.totalSteps) * 100;
            progressFill.style.width = progress + '%';
        }
    }

    validateCurrentStep() {
        const currentStepElement = document.getElementById(`step${this.currentStep}`);
        if (!currentStepElement) return true;
        
        const requiredFields = currentStepElement.querySelectorAll('input[required], select[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        // Step-specific validations
        if (this.currentStep === 1 && !this.hospitalData) {
            this.showNotification('Please fetch hospital data first', 'error');
            return false;
        }
        
        return isValid;
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
            case 'hospitalId':
                if (value && !/^HSP-\d{9}$/.test(value)) {
                    this.showFieldError(field, 'Hospital ID format: HSP-XXXXXXXXX');
                    return false;
                }
                break;
            case 'fatherAadhaar':
            case 'motherAadhaar':
                if (value && !this.validateAadhaar(value)) {
                    this.showFieldError(field, 'Please enter a valid 12-digit Aadhaar number');
                    return false;
                }
                break;
            case 'fatherPhone':
            case 'motherPhone':
                if (value && !this.validatePhone(value)) {
                    this.showFieldError(field, 'Please enter a valid 10-digit phone number');
                    return false;
                }
                break;
            case 'email':
                if (value && !this.validateEmail(value)) {
                    this.showFieldError(field, 'Please enter a valid email address');
                    return false;
                }
                break;
            case 'pincode':
                if (value && !this.validatePincode(value)) {
                    this.showFieldError(field, 'Please enter a valid 6-digit pincode');
                    return false;
                }
                break;
        }
        
        return true;
    }

    getFieldDisplayName(fieldName) {
        const displayNames = {
            'hospitalId': 'Hospital ID',
            'finalChildName': 'Child\'s name',
            'childGender': 'Gender',
            'childDOB': 'Date of birth',
            'childTOB': 'Time of birth',
            'placeOfBirth': 'Place of birth',
            'fatherName': 'Father\'s name',
            'fatherAadhaar': 'Father\'s Aadhaar',
            'fatherPhone': 'Father\'s phone',
            'motherName': 'Mother\'s name',
            'motherAadhaar': 'Mother\'s Aadhaar',
            'motherPhone': 'Mother\'s phone',
            'address': 'Address',
            'city': 'City',
            'state': 'State',
            'pincode': 'Pincode'
        };
        
        return displayNames[fieldName] || fieldName.replace(/([A-Z])/g, ' $1').toLowerCase();
    }

    formatAadhaar(input) {
        let value = input.value.replace(/\s/g, '');
        if (value.length > 12) {
            value = value.substring(0, 12);
        }
        
        // Add spaces every 4 digits
        const formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ');
        input.value = formattedValue;
    }

    formatPhone(input) {
        let value = input.value.replace(/\D/g, '');
        if (value.length > 10) {
            value = value.substring(0, 10);
        }
        input.value = value;
    }

    formatPincode(input) {
        let value = input.value.replace(/\D/g, '');
        if (value.length > 6) {
            value = value.substring(0, 6);
        }
        input.value = value;
    }

    validateAadhaar(aadhaar) {
        const cleanAadhaar = aadhaar.replace(/\s/g, '');
        return /^\d{12}$/.test(cleanAadhaar);
    }

    validatePhone(phone) {
        return /^\d{10}$/.test(phone);
    }

    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    validatePincode(pincode) {
        return /^\d{6}$/.test(pincode);
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

    clearFieldError(field) {
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) errorDiv.remove();
        
        field.style.borderColor = '';
        field.style.boxShadow = '';
    }

    saveCurrentStepData() {
        const currentStepElement = document.getElementById(`step${this.currentStep}`);
        if (!currentStepElement) return;
        
        const inputs = currentStepElement.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            this.formData[input.name] = input.value;
        });
    }

    updateStepCompletion() {
        const currentStepElement = document.getElementById(`step${this.currentStep}`);
        if (!currentStepElement) return;
        
        const requiredFields = currentStepElement.querySelectorAll('input[required], select[required]');
        const filledFields = Array.from(requiredFields).filter(field => field.value.trim());
        
        const stepElement = document.querySelector(`.step[data-step="${this.currentStep}"]`);
        if (stepElement) {
            const isComplete = filledFields.length === requiredFields.length;
            stepElement.classList.toggle('completed', isComplete);
        }
    }

    updateReviewSection() {
        // Update hospital info
        const hospitalInfoDiv = document.getElementById('reviewHospitalInfo');
        if (hospitalInfoDiv && this.hospitalData) {
            hospitalInfoDiv.innerHTML = `
                <div class="review-item">
                    <span class="review-label">Hospital ID:</span>
                    <span class="review-value">${this.hospitalData.hospitalId}</span>
                </div>
                <div class="review-item">
                    <span class="review-label">Hospital Name:</span>
                    <span class="review-value">${this.hospitalData.hospitalName}</span>
                </div>
                <div class="review-item">
                    <span class="review-label">Doctor:</span>
                    <span class="review-value">${this.hospitalData.attendingDoctor}</span>
                </div>
            `;
        }
        
        // Update child info
        const childInfoDiv = document.getElementById('reviewChildInfo');
        if (childInfoDiv) {
            childInfoDiv.innerHTML = `
                <div class="review-item">
                    <span class="review-label">Name:</span>
                    <span class="review-value">${document.getElementById('finalChildName')?.value || 'N/A'}</span>
                </div>
                <div class="review-item">
                    <span class="review-label">Gender:</span>
                    <span class="review-value">${document.getElementById('childGender')?.value || 'N/A'}</span>
                </div>
                <div class="review-item">
                    <span class="review-label">Date of Birth:</span>
                    <span class="review-value">${document.getElementById('childDOB')?.value || 'N/A'}</span>
                </div>
                <div class="review-item">
                    <span class="review-label">Time of Birth:</span>
                    <span class="review-value">${document.getElementById('childTOB')?.value || 'N/A'}</span>
                </div>
                <div class="review-item">
                    <span class="review-label">Place of Birth:</span>
                    <span class="review-value">${document.getElementById('placeOfBirth')?.value || 'N/A'}</span>
                </div>
            `;
        }
        
        // Update parent info
        const parentInfoDiv = document.getElementById('reviewParentInfo');
        if (parentInfoDiv) {
            parentInfoDiv.innerHTML = `
                <div class="review-item">
                    <span class="review-label">Father's Name:</span>
                    <span class="review-value">${document.getElementById('fatherName')?.value || 'N/A'}</span>
                </div>
                <div class="review-item">
                    <span class="review-label">Father's Aadhaar:</span>
                    <span class="review-value">${document.getElementById('fatherAadhaar')?.value || 'N/A'}</span>
                </div>
                <div class="review-item">
                    <span class="review-label">Mother's Name:</span>
                    <span class="review-value">${document.getElementById('motherName')?.value || 'N/A'}</span>
                </div>
                <div class="review-item">
                    <span class="review-label">Mother's Aadhaar:</span>
                    <span class="review-value">${document.getElementById('motherAadhaar')?.value || 'N/A'}</span>
                </div>
                <div class="review-item">
                    <span class="review-label">Address:</span>
                    <span class="review-value">${document.getElementById('address')?.value || 'N/A'}</span>
                </div>
                <div class="review-item">
                    <span class="review-label">City:</span>
                    <span class="review-value">${document.getElementById('city')?.value || 'N/A'}</span>
                </div>
                <div class="review-item">
                    <span class="review-label">State:</span>
                    <span class="review-value">${document.getElementById('state')?.value || 'N/A'}</span>
                </div>
                <div class="review-item">
                    <span class="review-label">Pincode:</span>
                    <span class="review-value">${document.getElementById('pincode')?.value || 'N/A'}</span>
                </div>
            `;
        }
    }

    async handleFormSubmission(event) {
        event.preventDefault();
        
        if (!this.validateForm()) {
            this.showNotification('Please correct all errors before submitting', 'error');
            return;
        }

        const submitBtn = document.getElementById('submitRegistration');
        const originalText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.innerHTML = `
            <span class="material-symbols-outlined">hourglass_empty</span>
            Submitting Registration...
        `;
        submitBtn.disabled = true;

        try {
            // Collect all form data
            const formData = new FormData(event.target);
            const registrationData = this.collectAllFormData(formData);
            
            // Add hospital data
            registrationData.hospitalData = this.hospitalData;
            
            // Simulate API submission
            await this.simulateSubmission();
            
            // Generate registration number
            const registrationNumber = this.generateRegistrationNumber();
            registrationData.registrationNumber = registrationNumber;
            registrationData.status = 'pending';
            registrationData.submissionDate = new Date().toISOString();
            registrationData.id = Date.now();
            
            // Save to localStorage
            const registrations = JSON.parse(localStorage.getItem('parentRegistrations')) || [];
            registrations.push(registrationData);
            localStorage.setItem('parentRegistrations', JSON.stringify(registrations));
            
            // Clear auto-saved draft
            localStorage.removeItem('parentFormDraft');
            localStorage.removeItem('parentFormDraftTime');
            
            // Show success message
            this.showSuccessMessage(registrationNumber, registrationData);
            
        } catch (error) {
            console.error('Submission error:', error);
            this.showNotification('Submission failed. Please try again.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    validateForm() {
        let isValid = true;
        
        // Validate all steps
        for (let step = 1; step <= this.totalSteps; step++) {
            const stepElement = document.getElementById(`step${step}`);
            if (!stepElement) continue;
            
            const requiredFields = stepElement.querySelectorAll('input[required], select[required]');
            requiredFields.forEach(field => {
                if (!this.validateField(field)) {
                    isValid = false;
                }
            });
        }
        
        // Check terms agreement
        const agreeTerms = document.getElementById('agreeTerms');
        if (agreeTerms && !agreeTerms.checked) {
            this.showNotification('Please agree to the terms and conditions', 'error');
            isValid = false;
        }
        
        return isValid;
    }

    collectAllFormData(formData) {
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        return data;
    }

    generateRegistrationNumber() {
        const prefix = 'REG';
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${prefix}-${date}-${random}`;
    }

    async simulateSubmission() {
        return new Promise(resolve => {
            setTimeout(resolve, 3000 + Math.random() * 2000);
        });
    }

    showSuccessMessage(registrationNumber, data) {
        // Hide form steps
        document.querySelectorAll('.form-step').forEach(step => {
            step.style.display = 'none';
        });
        
        // Show success message
        const successDiv = document.getElementById('successMessage');
        if (successDiv) {
            document.getElementById('generatedRegNumber').textContent = registrationNumber;
            document.getElementById('submissionDate').textContent = 
                new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();
            
            successDiv.style.display = 'block';
            successDiv.scrollIntoView({ behavior: 'smooth' });
            
            // Setup copy functionality
            const copyBtn = document.getElementById('copyRegBtn');
            if (copyBtn) {
                copyBtn.addEventListener('click', () => {
                    navigator.clipboard.writeText(registrationNumber).then(() => {
                        this.showNotification('Registration number copied!', 'success');
                        copyBtn.innerHTML = `
                            <span class="material-symbols-outlined">check</span>
                        `;
                        
                        setTimeout(() => {
                            copyBtn.innerHTML = `
                                <span class="material-symbols-outlined">content_copy</span>
                            `;
                        }, 2000);
                    });
                });
            }
        }
        
        this.showNotification('Registration submitted successfully!', 'success');
        
        // Confetti effect
        this.showConfetti();
    }

    showConfetti() {
        // Simple confetti effect
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                this.createConfettiPiece();
            }, i * 50);
        }
    }

    createConfettiPiece() {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            top: -10px;
            left: ${Math.random() * 100}vw;
            width: 10px;
            height: 10px;
            background: ${this.getRandomColor()};
            z-index: 10000;
            animation: confettiFall 3s linear forwards;
            pointer-events: none;
        `;
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.parentNode.removeChild(confetti);
            }
        }, 3000);
    }

    getRandomColor() {
        const colors = ['#FF9933', '#FFFFFF', '#138808', '#1e3c72', '#2a5298'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    resetForm() {
        // Reset all form data
        this.formData = {};
        this.hospitalData = null;
        this.currentStep = 1;
        
        // Reset form
        const form = document.getElementById('parentRegistrationForm');
        if (form) {
            form.reset();
        }
        
        // Hide success message and show form
        const successDiv = document.getElementById('successMessage');
        if (successDiv) {
            successDiv.style.display = 'none';
        }
        
        document.querySelectorAll('.form-step').forEach(step => {
            step.style.display = 'none';
        });
        
        // Show first step
        this.showStep(1);
        this.updateProgress();
        
        // Hide hospital data display
        this.hideHospitalData();
        
        this.showNotification('Form reset successfully', 'info');
    }

    autoSaveForm() {
        const form = document.getElementById('parentRegistrationForm');
        if (!form) return;

        this.saveCurrentStepData();
        
        const saveData = {
            formData: this.formData,
            currentStep: this.currentStep,
            hospitalData: this.hospitalData
        };

        localStorage.setItem('parentFormDraft', JSON.stringify(saveData));
        localStorage.setItem('parentFormDraftTime', new Date().toISOString());
    }

    loadAutoSavedData() {
        const savedData = localStorage.getItem('parentFormDraft');
        const saveTime = localStorage.getItem('parentFormDraftTime');
        
        if (!savedData || !saveTime) return;

        // Check if saved data is less than 24 hours old
        const saveDate = new Date(saveTime);
        const now = new Date();
        const hoursDiff = (now - saveDate) / (1000 * 60 * 60);
        
        if (hoursDiff > 24) {
            localStorage.removeItem('parentFormDraft');
            localStorage.removeItem('parentFormDraftTime');
            return;
        }

        try {
            const saveData = JSON.parse(savedData);
            
            if (Object.keys(saveData.formData).length > 0) {
                const shouldRestore = confirm('Found auto-saved form data. Would you like to restore it?');
                
                if (shouldRestore) {
                    this.formData = saveData.formData;
                    this.hospitalData = saveData.hospitalData;
                    this.currentStep = saveData.currentStep || 1;
                    
                    // Restore form fields
                    Object.keys(this.formData).forEach(key => {
                        const input = document.querySelector(`[name="${key}"]`);
                        if (input && this.formData[key]) {
                            input.value = this.formData[key];
                        }
                    });
                    
                    // Restore hospital data display
                    if (this.hospitalData) {
                        this.displayHospitalData(this.hospitalData);
                    }
                    
                    // Show correct step
                    this.showStep(this.currentStep);
                    this.updateProgress();
                    
                    this.showNotification('Auto-saved data restored', 'success');
                }
            }
        } catch (error) {
            console.error('Error loading auto-saved data:', error);
        }
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

// Initialize Parent Registration Portal
document.addEventListener('DOMContentLoaded', function() {
    const parentPortal = new ParentRegistrationPortal();
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
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
        
        @keyframes confettiFall {
            to {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0;
            }
        }
        
        .review-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 0;
            border-bottom: 1px solid var(--border-color);
        }
        
        .review-item:last-child {
            border-bottom: none;
        }
        
        .review-label {
            font-weight: 600;
            color: var(--dark-gray);
        }
        
        .review-value {
            color: var(--primary-blue);
            font-weight: 500;
        }
        
        .field-error {
            animation: fadeIn 0.3s ease;
        }
    `;
    document.head.appendChild(style);
    
    // Export for global access
    window.parentPortal = parentPortal;
});
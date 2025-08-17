// Admin Portal JavaScript - Enhanced Interactive Features
class AdminPortal {
    constructor() {
        this.registrations = JSON.parse(localStorage.getItem('parentRegistrations')) || [];
        this.adminActions = JSON.parse(localStorage.getItem('adminActions')) || [];
        this.selectedApplications = new Set();
        this.currentFilter = { status: 'all', date: 'all' };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadApplications();
        this.updateStats();
        this.setupRealTimeUpdates();
        this.setupKeyboardShortcuts();
    }

    setupEventListeners() {
        // Search functionality
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');
        
        if (searchBtn && searchInput) {
            searchBtn.addEventListener('click', () => this.searchApplications());
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.searchApplications();
            });
            
            // Real-time search
            searchInput.addEventListener('input', (e) => {
                if (e.target.value.length > 2 || e.target.value.length === 0) {
                    this.searchApplications();
                }
            });
        }

        // Filter controls
        const statusFilter = document.getElementById('statusFilter');
        const dateFilter = document.getElementById('dateFilter');
        const clearFilters = document.getElementById('clearFilters');
        
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.applyFilters());
        }
        
        if (dateFilter) {
            dateFilter.addEventListener('change', () => this.applyFilters());
        }
        
        if (clearFilters) {
            clearFilters.addEventListener('click', () => this.clearAllFilters());
        }

        // Bulk actions
        const selectAll = document.getElementById('selectAll');
        const bulkApprove = document.getElementById('bulkApprove');
        const bulkReject = document.getElementById('bulkReject');
        
        if (selectAll) {
            selectAll.addEventListener('change', (e) => this.toggleSelectAll(e.target.checked));
        }
        
        if (bulkApprove) {
            bulkApprove.addEventListener('click', () => this.bulkApprove());
        }
        
        if (bulkReject) {
            bulkReject.addEventListener('click', () => this.bulkReject());
        }

        // Modal controls
        this.setupModalControls();

        // Data refresh
        const refreshBtn = document.getElementById('refreshData');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshData());
        }

        // Export data
        const exportBtn = document.getElementById('exportData');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }
    }

    setupModalControls() {
        // Application details modal
        const closeModal = document.getElementById('closeModal');
        const closeModalBtn = document.getElementById('closeModalBtn');
        const approveBtn = document.getElementById('approveApplicationBtn');
        const rejectBtn = document.getElementById('rejectApplicationBtn');
        
        if (closeModal) {
            closeModal.addEventListener('click', () => this.closeModal());
        }
        
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => this.closeModal());
        }
        
        if (approveBtn) {
            approveBtn.addEventListener('click', () => this.approveFromModal());
        }
        
        if (rejectBtn) {
            rejectBtn.addEventListener('click', () => this.rejectFromModal());
        }

        // Rejection modal
        const closeRejectionModal = document.getElementById('closeRejectionModal');
        const cancelRejection = document.getElementById('cancelRejection');
        const confirmRejection = document.getElementById('confirmRejection');
        
        if (closeRejectionModal) {
            closeRejectionModal.addEventListener('click', () => this.closeRejectionModal());
        }
        
        if (cancelRejection) {
            cancelRejection.addEventListener('click', () => this.closeRejectionModal());
        }
        
        if (confirmRejection) {
            confirmRejection.addEventListener('click', () => this.confirmRejection());
        }

        // Reason buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('reason-btn')) {
                const reason = e.target.dataset.reason;
                document.getElementById('rejectionReason').value = reason;
            }
        });

        // Close modals on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
                this.closeRejectionModal();
            }
        });
    }

    setupRealTimeUpdates() {
        // Check for new applications every 30 seconds
        setInterval(() => {
            this.checkForUpdates();
        }, 30000);
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + R for refresh
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                this.refreshData();
            }
            
            // Ctrl/Cmd + F for search
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                const searchInput = document.getElementById('searchInput');
                if (searchInput) searchInput.focus();
            }
            
            // Escape to close modals
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeRejectionModal();
            }
        });
    }

    loadApplications() {
        this.registrations = JSON.parse(localStorage.getItem('parentRegistrations')) || [];
        this.displayApplications(this.registrations);
    }

    displayApplications(applications) {
        const tbody = document.getElementById('applicationsTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (applications.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; padding: 3rem; color: var(--dark-gray);">
                        <span class="material-symbols-outlined" style="font-size: 4rem; opacity: 0.5;">inbox</span>
                        <h3 style="margin: 1rem 0; color: var(--dark-gray);">No Applications Found</h3>
                        <p>No birth registration applications match your current filters.</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        applications.forEach((app, index) => {
            const row = this.createApplicationRow(app, index);
            tbody.appendChild(row);
        });
        
        this.updateBulkActionButtons();
    }

    createApplicationRow(app, index) {
        const row = document.createElement('tr');
        row.style.animation = `fadeInUp 0.3s ease ${index * 0.1}s both`;
        row.dataset.regNumber = app.registrationNumber;
        
        const statusBadge = this.getStatusBadge(app.status);
        const submissionDate = new Date(app.submissionDate).toLocaleDateString();
        const hospitalId = app.hospitalData?.hospitalId || 'N/A';
        const parentNames = `${app.fatherName || 'N/A'} & ${app.motherName || 'N/A'}`;
        
        row.innerHTML = `
            <td>
                <label class="checkbox-label">
                    <input type="checkbox" class="app-checkbox" value="${app.registrationNumber}">
                    <span class="checkmark"></span>
                </label>
            </td>
            <td><strong>${app.registrationNumber}</strong></td>
            <td>${hospitalId}</td>
            <td>${app.finalChildName || app.childName}</td>
            <td>${app.childDOB ? new Date(app.childDOB).toLocaleDateString() : 'N/A'}</td>
            <td title="${parentNames}">${parentNames.length > 30 ? parentNames.substring(0, 30) + '...' : parentNames}</td>
            <td>${statusBadge}</td>
            <td>${submissionDate}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn details-btn" onclick="adminPortal.viewDetails('${app.registrationNumber}')" title="View Details">
                        <span class="material-symbols-outlined">info</span>
                    </button>
                    ${app.status === 'pending' ? `
                        <button class="action-btn approve-btn" onclick="adminPortal.approveApplication('${app.registrationNumber}')" title="Approve">
                            <span class="material-symbols-outlined">check</span>
                        </button>
                        <button class="action-btn reject-btn" onclick="adminPortal.rejectApplication('${app.registrationNumber}')" title="Reject">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    ` : ''}
                    ${app.status === 'approved' ? `
                        <button class="action-btn download-btn" onclick="adminPortal.downloadCertificate('${app.registrationNumber}')" title="Download Certificate">
                            <span class="material-symbols-outlined">download</span>
                        </button>
                    ` : ''}
                </div>
            </td>
        `;
        
        // Add checkbox event listener
        const checkbox = row.querySelector('.app-checkbox');
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                this.selectedApplications.add(app.registrationNumber);
            } else {
                this.selectedApplications.delete(app.registrationNumber);
            }
            this.updateBulkActionButtons();
        });
        
        return row;
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

    updateStats() {
        const stats = {
            pending: this.registrations.filter(r => r.status === 'pending').length,
            approved: this.registrations.filter(r => r.status === 'approved' && 
                new Date(r.approvalDate || r.submissionDate).toDateString() === new Date().toDateString()).length,
            rejected: this.registrations.filter(r => r.status === 'rejected').length,
            total: this.registrations.length
        };
        
        document.getElementById('pendingCount').textContent = stats.pending;
        document.getElementById('approvedCount').textContent = stats.approved;
        document.getElementById('rejectedCount').textContent = stats.rejected;
        document.getElementById('totalCount').textContent = stats.total;
        
        // Animate stat numbers
        this.animateStatNumbers();
    }

    animateStatNumbers() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        statNumbers.forEach(element => {
            const finalValue = parseInt(element.textContent);
            let currentValue = 0;
            const increment = Math.ceil(finalValue / 20);
            
            const timer = setInterval(() => {
                currentValue += increment;
                if (currentValue >= finalValue) {
                    currentValue = finalValue;
                    clearInterval(timer);
                }
                element.textContent = currentValue;
            }, 50);
        });
    }

    searchApplications() {
        const query = document.getElementById('searchInput')?.value.toLowerCase() || '';
        
        if (!query) {
            this.displayApplications(this.registrations);
            return;
        }
        
        const filtered = this.registrations.filter(app => {
            return (
                app.registrationNumber.toLowerCase().includes(query) ||
                (app.finalChildName || app.childName).toLowerCase().includes(query) ||
                (app.hospitalData?.hospitalId || '').toLowerCase().includes(query) ||
                (app.fatherName || '').toLowerCase().includes(query) ||
                (app.motherName || '').toLowerCase().includes(query)
            );
        });
        
        this.displayApplications(filtered);
        
        if (query) {
            this.showNotification(`Found ${filtered.length} applications matching "${query}"`, 'info', 3000);
        }
    }

    applyFilters() {
        const statusFilter = document.getElementById('statusFilter')?.value || 'all';
        const dateFilter = document.getElementById('dateFilter')?.value || 'all';
        
        this.currentFilter = { status: statusFilter, date: dateFilter };
        
        let filtered = [...this.registrations];
        
        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(app => app.status === statusFilter);
        }
        
        // Date filter
        if (dateFilter !== 'all') {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            filtered = filtered.filter(app => {
                const appDate = new Date(app.submissionDate);
                
                switch (dateFilter) {
                    case 'today':
                        return appDate >= today;
                    case 'week':
                        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                        return appDate >= weekAgo;
                    case 'month':
                        const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
                        return appDate >= monthAgo;
                    default:
                        return true;
                }
            });
        }
        
        this.displayApplications(filtered);
        this.showNotification(`Applied filters: ${filtered.length} applications shown`, 'info', 3000);
    }

    clearAllFilters() {
        document.getElementById('statusFilter').value = 'all';
        document.getElementById('dateFilter').value = 'all';
        document.getElementById('searchInput').value = '';
        
        this.currentFilter = { status: 'all', date: 'all' };
        this.displayApplications(this.registrations);
        
        this.showNotification('All filters cleared', 'info');
    }

    toggleSelectAll(checked) {
        const checkboxes = document.querySelectorAll('.app-checkbox');
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
            const regNumber = checkbox.value;
            
            if (checked) {
                this.selectedApplications.add(regNumber);
            } else {
                this.selectedApplications.delete(regNumber);
            }
        });
        
        this.updateBulkActionButtons();
    }

    updateBulkActionButtons() {
        const bulkApprove = document.getElementById('bulkApprove');
        const bulkReject = document.getElementById('bulkReject');
        const selectAll = document.getElementById('selectAll');
        
        const hasSelected = this.selectedApplications.size > 0;
        const allSelected = this.selectedApplications.size === document.querySelectorAll('.app-checkbox').length;
        
        if (bulkApprove) bulkApprove.disabled = !hasSelected;
        if (bulkReject) bulkReject.disabled = !hasSelected;
        
        if (selectAll) {
            selectAll.checked = allSelected && hasSelected;
            selectAll.indeterminate = hasSelected && !allSelected;
        }
        
        // Update button text with count
        if (bulkApprove) {
            bulkApprove.innerHTML = `
                <span class="material-symbols-outlined">check</span>
                Bulk Approve ${hasSelected ? `(${this.selectedApplications.size})` : ''}
            `;
        }
        
        if (bulkReject) {
            bulkReject.innerHTML = `
                <span class="material-symbols-outlined">close</span>
                Bulk Reject ${hasSelected ? `(${this.selectedApplications.size})` : ''}
            `;
        }
    }

    async bulkApprove() {
        if (this.selectedApplications.size === 0) return;
        
        const count = this.selectedApplications.size;
        if (!confirm(`Are you sure you want to approve ${count} application(s)?`)) return;
        
        const approveBtn = document.getElementById('bulkApprove');
        const originalText = approveBtn.innerHTML;
        
        approveBtn.innerHTML = `
            <span class="material-symbols-outlined">hourglass_empty</span>
            Approving...
        `;
        approveBtn.disabled = true;
        
        try {
            // Simulate bulk approval process
            await this.simulateBulkOperation(count);
            
            // Approve each selected application
            for (const regNumber of this.selectedApplications) {
                await this.processApproval(regNumber);
            }
            
            this.selectedApplications.clear();
            this.loadApplications();
            this.updateStats();
            
            this.showNotification(`${count} application(s) approved successfully!`, 'success');
            
        } catch (error) {
            console.error('Bulk approval error:', error);
            this.showNotification('Bulk approval failed. Please try again.', 'error');
        } finally {
            approveBtn.innerHTML = originalText;
            approveBtn.disabled = false;
        }
    }

    async bulkReject() {
        if (this.selectedApplications.size === 0) return;
        
        const count = this.selectedApplications.size;
        const reason = prompt(`Enter rejection reason for ${count} application(s):`);
        
        if (!reason) return;
        
        const rejectBtn = document.getElementById('bulkReject');
        const originalText = rejectBtn.innerHTML;
        
        rejectBtn.innerHTML = `
            <span class="material-symbols-outlined">hourglass_empty</span>
            Rejecting...
        `;
        rejectBtn.disabled = true;
        
        try {
            // Simulate bulk rejection process
            await this.simulateBulkOperation(count);
            
            // Reject each selected application
            for (const regNumber of this.selectedApplications) {
                await this.processRejection(regNumber, reason);
            }
            
            this.selectedApplications.clear();
            this.loadApplications();
            this.updateStats();
            
            this.showNotification(`${count} application(s) rejected.`, 'warning');
            
        } catch (error) {
            console.error('Bulk rejection error:', error);
            this.showNotification('Bulk rejection failed. Please try again.', 'error');
        } finally {
            rejectBtn.innerHTML = originalText;
            rejectBtn.disabled = false;
        }
    }

    async simulateBulkOperation(count) {
        // Simulate processing time based on count
        const delay = Math.min(count * 500, 3000);
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    viewDetails(regNumber) {
        const registration = this.registrations.find(r => r.registrationNumber === regNumber);
        if (!registration) return;
        
        const modal = document.getElementById('applicationModal');
        const container = document.getElementById('applicationDetailsContainer');
        
        if (!modal || !container) return;
        
        // Populate modal content
        container.innerHTML = this.generateDetailsHTML(registration);
        
        // Store current registration for modal actions
        this.currentModalRegistration = registration;
        
        // Show modal
        modal.style.display = 'block';
        
        // Update modal action buttons
        this.updateModalActionButtons(registration);
    }

    generateDetailsHTML(registration) {
        const hospitalData = registration.hospitalData || {};
        
        return `
            <div class="details-sections">
                <div class="details-section">
                    <h4>Registration Information</h4>
                    <div class="details-grid">
                        <div class="detail-item">
                            <label>Registration Number:</label>
                            <span>${registration.registrationNumber}</span>
                        </div>
                        <div class="detail-item">
                            <label>Status:</label>
                            <span>${this.getStatusBadge(registration.status)}</span>
                        </div>
                        <div class="detail-item">
                            <label>Submission Date:</label>
                            <span>${new Date(registration.submissionDate).toLocaleDateString()}</span>
                        </div>
                        <div class="detail-item">
                            <label>Last Updated:</label>
                            <span>${registration.lastUpdated ? 
                                new Date(registration.lastUpdated).toLocaleDateString() : 'N/A'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="details-section">
                    <h4>Child Information</h4>
                    <div class="details-grid">
                        <div class="detail-item">
                            <label>Name:</label>
                            <span>${registration.finalChildName || registration.childName}</span>
                        </div>
                        <div class="detail-item">
                            <label>Gender:</label>
                            <span>${registration.childGender || registration.gender}</span>
                        </div>
                        <div class="detail-item">
                            <label>Date of Birth:</label>
                            <span>${registration.childDOB ? 
                                new Date(registration.childDOB).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Time of Birth:</label>
                            <span>${registration.childTOB || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Place of Birth:</label>
                            <span>${registration.placeOfBirth || hospitalData.hospitalName || 'N/A'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="details-section">
                    <h4>Parent Information</h4>
                    <div class="details-grid">
                        <div class="detail-item">
                            <label>Father's Name:</label>
                            <span>${registration.fatherName || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Father's Aadhaar:</label>
                            <span>${registration.fatherAadhaar || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Father's Phone:</label>
                            <span>${registration.fatherPhone || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Mother's Name:</label>
                            <span>${registration.motherName || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Mother's Aadhaar:</label>
                            <span>${registration.motherAadhaar || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Mother's Phone:</label>
                            <span>${registration.motherPhone || 'N/A'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="details-section">
                    <h4>Address Information</h4>
                    <div class="details-grid">
                        <div class="detail-item">
                            <label>Address:</label>
                            <span>${registration.address || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <label>City:</label>
                            <span>${registration.city || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <label>State:</label>
                            <span>${registration.state || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Pincode:</label>
                            <span>${registration.pincode || 'N/A'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="details-section">
                    <h4>Hospital Information</h4>
                    <div class="details-grid">
                        <div class="detail-item">
                            <label>Hospital ID:</label>
                            <span>${hospitalData.hospitalId || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Hospital Name:</label>
                            <span>${hospitalData.hospitalName || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Attending Doctor:</label>
                            <span>${hospitalData.attendingDoctor || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Birth Weight:</label>
                            <span>${hospitalData.weight ? hospitalData.weight + ' kg' : 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    updateModalActionButtons(registration) {
        const approveBtn = document.getElementById('approveApplicationBtn');
        const rejectBtn = document.getElementById('rejectApplicationBtn');
        
        if (registration.status === 'pending') {
            if (approveBtn) approveBtn.style.display = 'inline-flex';
            if (rejectBtn) rejectBtn.style.display = 'inline-flex';
        } else {
            if (approveBtn) approveBtn.style.display = 'none';
            if (rejectBtn) rejectBtn.style.display = 'none';
        }
    }

    approveFromModal() {
        if (this.currentModalRegistration) {
            this.approveApplication(this.currentModalRegistration.registrationNumber);
            this.closeModal();
        }
    }

    rejectFromModal() {
        if (this.currentModalRegistration) {
            this.rejectApplication(this.currentModalRegistration.registrationNumber);
            this.closeModal();
        }
    }

    async approveApplication(regNumber) {
        if (!confirm('Are you sure you want to approve this application?')) return;
        
        try {
            await this.processApproval(regNumber);
            this.loadApplications();
            this.updateStats();
            this.showNotification('Application approved successfully!', 'success');
        } catch (error) {
            console.error('Approval error:', error);
            this.showNotification('Approval failed. Please try again.', 'error');
        }
    }

    rejectApplication(regNumber) {
        this.currentRejectionRegNumber = regNumber;
        const rejectionModal = document.getElementById('rejectionModal');
        if (rejectionModal) {
            rejectionModal.style.display = 'block';
        }
    }

    async processApproval(regNumber) {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Find and update registration
        const regIndex = this.registrations.findIndex(r => r.registrationNumber === regNumber);
        if (regIndex !== -1) {
            this.registrations[regIndex].status = 'approved';
            this.registrations[regIndex].approvalDate = new Date().toISOString();
            this.registrations[regIndex].lastUpdated = new Date().toISOString();
            
            // Save to localStorage
            localStorage.setItem('parentRegistrations', JSON.stringify(this.registrations));
            
            // Record admin action
            this.recordAdminAction(regNumber, 'approved');
        }
    }

    async processRejection(regNumber, reason) {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Find and update registration
        const regIndex = this.registrations.findIndex(r => r.registrationNumber === regNumber);
        if (regIndex !== -1) {
            this.registrations[regIndex].status = 'rejected';
            this.registrations[regIndex].rejectionReason = reason;
            this.registrations[regIndex].rejectionDate = new Date().toISOString();
            this.registrations[regIndex].lastUpdated = new Date().toISOString();
            
            // Save to localStorage
            localStorage.setItem('parentRegistrations', JSON.stringify(this.registrations));
            
            // Record admin action
            this.recordAdminAction(regNumber, 'rejected', reason);
        }
    }

    recordAdminAction(regNumber, action, reason = null) {
        const adminAction = {
            registrationNumber: regNumber,
            action: action,
            reason: reason,
            actionDate: new Date().toISOString(),
            adminId: 'admin-001' // In real app, this would be the logged-in admin ID
        };
        
        this.adminActions.push(adminAction);
        localStorage.setItem('adminActions', JSON.stringify(this.adminActions));
    }

    confirmRejection() {
        const reason = document.getElementById('rejectionReason')?.value.trim();
        
        if (!reason) {
            this.showNotification('Please provide a rejection reason', 'error');
            return;
        }
        
        if (this.currentRejectionRegNumber) {
            this.processRejection(this.currentRejectionRegNumber, reason).then(() => {
                this.loadApplications();
                this.updateStats();
                this.closeRejectionModal();
                this.showNotification('Application rejected successfully', 'warning');
            }).catch(error => {
                console.error('Rejection error:', error);
                this.showNotification('Rejection failed. Please try again.', 'error');
            });
        }
    }

    downloadCertificate(regNumber) {
        this.showNotification('Preparing certificate download...', 'info');
        
        setTimeout(() => {
            window.open(`certificate.html?regNumber=${regNumber}&admin=true`, '_blank');
            this.showNotification('Certificate opened in new tab', 'success');
        }, 1000);
    }

    closeModal() {
        const modal = document.getElementById('applicationModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.currentModalRegistration = null;
    }

    closeRejectionModal() {
        const modal = document.getElementById('rejectionModal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        // Clear form
        const reasonTextarea = document.getElementById('rejectionReason');
        if (reasonTextarea) {
            reasonTextarea.value = '';
        }
        
        this.currentRejectionRegNumber = null;
    }

    async refreshData() {
        const refreshBtn = document.getElementById('refreshData');
        const originalIcon = refreshBtn?.querySelector('.material-symbols-outlined').textContent;
        
        if (refreshBtn) {
            refreshBtn.querySelector('.material-symbols-outlined').textContent = 'hourglass_empty';
            refreshBtn.disabled = true;
        }
        
        try {
            // Simulate data refresh
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            this.loadApplications();
            this.updateStats();
            
            this.showNotification('Data refreshed successfully!', 'success');
            
        } catch (error) {
            console.error('Refresh error:', error);
            this.showNotification('Refresh failed. Please try again.', 'error');
        } finally {
            if (refreshBtn) {
                refreshBtn.querySelector('.material-symbols-outlined').textContent = originalIcon;
                refreshBtn.disabled = false;
            }
        }
    }

    exportData() {
        try {
            const exportData = {
                registrations: this.registrations,
                adminActions: this.adminActions,
                exportDate: new Date().toISOString(),
                totalApplications: this.registrations.length,
                pendingCount: this.registrations.filter(r => r.status === 'pending').length,
                approvedCount: this.registrations.filter(r => r.status === 'approved').length,
                rejectedCount: this.registrations.filter(r => r.status === 'rejected').length
            };
            
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `birth-registrations-export-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            this.showNotification('Data exported successfully!', 'success');
            
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Export failed. Please try again.', 'error');
        }
    }

    checkForUpdates() {
        // Check if new registrations have been added
        const currentRegistrations = JSON.parse(localStorage.getItem('parentRegistrations')) || [];
        
        if (currentRegistrations.length > this.registrations.length) {
            const newCount = currentRegistrations.length - this.registrations.length;
            this.registrations = currentRegistrations;
            this.loadApplications();
            this.updateStats();
            
            this.showNotification(`${newCount} new application(s) received!`, 'info');
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

// Initialize Admin Portal
document.addEventListener('DOMContentLoaded', function() {
    const adminPortal = new AdminPortal();
    
    // Add CSS animations and styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
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
        
        .admin-stats-section {
            margin-bottom: var(--spacing-xxl);
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: var(--spacing-lg);
        }
        
        .stat-card {
            background: var(--white);
            border-radius: var(--radius-lg);
            padding: var(--spacing-xl);
            box-shadow: var(--shadow);
            display: flex;
            align-items: center;
            gap: var(--spacing-lg);
            transition: all 0.3s ease;
            border: 1px solid var(--border-color);
        }
        
        .stat-card:hover {
            transform: translateY(-3px);
            box-shadow: var(--shadow-hover);
        }
        
        .stat-icon {
            width: 60px;
            height: 60px;
            border-radius: var(--radius-full);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.8rem;
            color: var(--white);
        }
        
        .stat-card.pending .stat-icon {
            background: linear-gradient(135deg, var(--warning), #f39c12);
        }
        
        .stat-card.approved .stat-icon {
            background: linear-gradient(135deg, var(--success), #27ae60);
        }
        
        .stat-card.rejected .stat-icon {
            background: linear-gradient(135deg, var(--danger), #e74c3c);
        }
        
        .stat-card.total .stat-icon {
            background: linear-gradient(135deg, var(--info), #3498db);
        }
        
        .stat-content {
            flex: 1;
        }
        
        .stat-number {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--primary-blue);
            line-height: 1;
        }
        
        .stat-label {
            color: var(--dark-gray);
            font-weight: 500;
            margin-top: var(--spacing-xs);
        }
        
        .stat-change {
            font-size: 0.8rem;
            color: #6c757d;
            margin-top: var(--spacing-xs);
        }
        
        .controls-section {
            margin-bottom: var(--spacing-xl);
        }
        
        .controls-container {
            background: var(--white);
            border-radius: var(--radius-lg);
            padding: var(--spacing-lg);
            box-shadow: var(--shadow);
            border: 1px solid var(--border-color);
        }
        
        .search-controls {
            margin-bottom: var(--spacing-lg);
        }
        
        .search-bar {
            display: flex;
            gap: var(--spacing-sm);
            max-width: 500px;
        }
        
        .search-bar input {
            flex: 1;
            padding: var(--spacing-md);
            border: 2px solid var(--border-color);
            border-radius: var(--radius-md);
            font-size: 1rem;
        }
        
        .search-btn {
            background: var(--primary-blue);
            color: var(--white);
            border: none;
            padding: var(--spacing-md);
            border-radius: var(--radius-md);
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .search-btn:hover {
            background: var(--secondary-blue);
        }
        
        .filter-controls {
            display: flex;
            gap: var(--spacing-md);
            align-items: center;
            flex-wrap: wrap;
        }
        
        .filter-controls select {
            padding: var(--spacing-sm) var(--spacing-md);
            border: 2px solid var(--border-color);
            border-radius: var(--radius-md);
            background: var(--white);
        }
        
        .applications-section {
            background: var(--white);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow);
            border: 1px solid var(--border-color);
            overflow: hidden;
        }
        
        .applications-section .section-header {
            padding: var(--spacing-lg) var(--spacing-xl);
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: var(--light-gray);
        }
        
        .applications-section .section-header h2 {
            color: var(--primary-blue);
            font-size: 1.5rem;
            font-weight: 600;
        }
        
        .bulk-actions {
            display: flex;
            gap: var(--spacing-sm);
        }
        
        .applications-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .applications-table th {
            background: var(--light-gray);
            color: var(--primary-blue);
            font-weight: 600;
            padding: var(--spacing-md);
            text-align: left;
            font-size: 0.9rem;
            border-bottom: 1px solid var(--border-color);
        }
        
        .applications-table td {
            padding: var(--spacing-md);
            border-bottom: 1px solid var(--border-color);
            vertical-align: middle;
        }
        
        .applications-table tr:hover {
            background: var(--light-gray);
        }
        
        .action-buttons {
            display: flex;
            gap: var(--spacing-xs);
            flex-wrap: wrap;
        }
        
        .details-sections {
            max-height: 60vh;
            overflow-y: auto;
        }
        
        .details-section {
            margin-bottom: var(--spacing-xl);
            padding: var(--spacing-lg);
            background: var(--light-gray);
            border-radius: var(--radius-md);
            border: 1px solid var(--border-color);
        }
        
        .details-section h4 {
            color: var(--primary-blue);
            margin-bottom: var(--spacing-md);
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
        
        .common-reasons {
            margin-top: var(--spacing-lg);
        }
        
        .common-reasons h4 {
            color: var(--primary-blue);
            margin-bottom: var(--spacing-md);
            font-weight: 600;
        }
        
        .reason-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: var(--spacing-sm);
        }
        
        .reason-btn {
            background: var(--light-gray);
            color: var(--dark-gray);
            border: 1px solid var(--border-color);
            padding: var(--spacing-sm) var(--spacing-md);
            border-radius: var(--radius-md);
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.9rem;
        }
        
        .reason-btn:hover {
            background: var(--primary-blue);
            color: var(--white);
        }
    `;
    document.head.appendChild(style);
    
    // Export for global access
    window.adminPortal = adminPortal;
});
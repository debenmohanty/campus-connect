// Check authentication and load dashboard data
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const userName = localStorage.getItem('userName');

    if (!token || !userRole) {
        window.location.href = 'login.html';
        return;
    }

    // Update welcome message
    const welcomeMessage = document.getElementById('welcomeMessage');
    const userRoleSpan = document.getElementById('userRole');
    
    if (welcomeMessage) {
        welcomeMessage.innerHTML = `Welcome, <span class="user-name">${userName}</span>!`;
    }
    
    if (userRoleSpan) {
        userRoleSpan.textContent = userRole.charAt(0).toUpperCase() + userRole.slice(1);
    }

    // Initialize delete account functionality first
    initDeleteAccountFunctionality();

    try {
        // Load dashboard data based on user role
        switch (userRole) {
            case 'student':
                await loadStudentDashboard();
                break;
            case 'company':
                await loadCompanyDashboard();
                break;
            case 'faculty':
                await loadFacultyDashboard();
                break;
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showError('Failed to load dashboard data');
    }
});

// Load student dashboard data
async function loadStudentDashboard() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch('/api/student/dashboard', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load dashboard data');
        }

        const data = await response.json();
        
        // Update stats
        document.getElementById('appliedJobs').textContent = data.stats.appliedJobs;
        document.getElementById('shortlisted').textContent = data.stats.shortlisted;
        document.getElementById('interviews').textContent = data.stats.interviews;
        
        // Update recent jobs
        const jobsGrid = document.getElementById('recentJobs');
        if (jobsGrid) {
            jobsGrid.innerHTML = data.recentJobs.map(job => `
                <div class="job-card">
                    <h4>${job.title}</h4>
                    <p>${job.company}</p>
                    <p>${job.location}</p>
                    <button onclick="viewJob('${job.id}')">View Details</button>
                </div>
            `).join('');
        }
        
        // Update applications
        const applicationsGrid = document.getElementById('applications');
        if (applicationsGrid) {
            applicationsGrid.innerHTML = data.applications.map(app => `
                <div class="application-card">
                    <h4>${app.jobTitle}</h4>
                    <p>Status: ${app.status}</p>
                    <p>Applied: ${new Date(app.appliedDate).toLocaleDateString()}</p>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading student dashboard:', error);
        showError('Failed to load student dashboard data');
    }
}

// Load company dashboard data
async function loadCompanyDashboard() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch('/api/company/dashboard', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load dashboard data');
        }

        const data = await response.json();
        
        // Update stats
        document.getElementById('activeJobs').textContent = data.stats.activeJobs;
        document.getElementById('totalApplications').textContent = data.stats.totalApplications;
        document.getElementById('shortlisted').textContent = data.stats.shortlisted;
        
        // Update job postings
        const jobsGrid = document.getElementById('jobPostings');
        if (jobsGrid) {
            jobsGrid.innerHTML = data.jobPostings.map(job => `
                <div class="job-card">
                    <h4>${job.title}</h4>
                    <p>Type: ${job.type}</p>
                    <p>Applications: ${job.applicationCount}</p>
                    <button onclick="viewJob('${job.id}')">View Details</button>
                </div>
            `).join('');
        }
        
        // Update recent applications
        const applicationsGrid = document.getElementById('recentApplications');
        if (applicationsGrid) {
            applicationsGrid.innerHTML = data.recentApplications.map(app => `
                <div class="application-card">
                    <h4>${app.studentName}</h4>
                    <p>Applied for: ${app.jobTitle}</p>
                    <p>Status: ${app.status}</p>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading company dashboard:', error);
        showError('Failed to load company dashboard data');
    }
}

// Load faculty dashboard data
async function loadFacultyDashboard() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch('/api/faculty/dashboard', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load dashboard data');
        }

        const data = await response.json();
        
        // Update stats
        document.getElementById('totalStudents').textContent = data.stats.totalStudents;
        document.getElementById('placedStudents').textContent = data.stats.placedStudents;
        document.getElementById('mentorshipRequests').textContent = data.stats.mentorshipRequests;
        
        // Update recent activities
        const activitiesGrid = document.getElementById('recentActivities');
        if (activitiesGrid) {
            activitiesGrid.innerHTML = data.recentActivities.map(activity => `
                <div class="activity-card">
                    <h4>${activity.title}</h4>
                    <p>${activity.description}</p>
                    <p>Date: ${new Date(activity.date).toLocaleDateString()}</p>
                </div>
            `).join('');
        }
        
        // Update mentorship requests
        const requestsGrid = document.getElementById('mentorshipRequests');
        if (requestsGrid) {
            requestsGrid.innerHTML = data.mentorshipRequests.map(request => `
                <div class="request-card">
                    <h4>${request.studentName}</h4>
                    <p>Request: ${request.requestType}</p>
                    <p>Status: ${request.status}</p>
                    <button onclick="handleMentorshipRequest('${request.id}', 'accept')">Accept</button>
                    <button onclick="handleMentorshipRequest('${request.id}', 'reject')">Reject</button>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading faculty dashboard:', error);
        showError('Failed to load faculty dashboard data');
    }
}

// Helper function to show error messages
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

// Logout functionality
document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    window.location.href = 'login.html';
});

// Delete Account functionality
function initDeleteAccountFunctionality() {
    // Allow a small delay for DOM to fully load
    setTimeout(() => {
        const deleteAccountBtn = document.getElementById('deleteAccountBtn');
        
        if (!deleteAccountBtn) {
            // Add the delete account button to the sidebar
            const sidebarNav = document.querySelector('.sidebar nav ul');
            
            if (sidebarNav) {
                const logoutItem = document.querySelector('#logoutBtn')?.parentElement;
                if (logoutItem) {
                    const deleteAccountItem = document.createElement('li');
                    deleteAccountItem.innerHTML = `<a href="#" id="deleteAccountBtn" class="danger-link">Delete Account</a>`;
                    sidebarNav.insertBefore(deleteAccountItem, logoutItem);
                    
                    // Need to get the new button reference
                    const newDeleteAccountBtn = document.getElementById('deleteAccountBtn');
                    if (newDeleteAccountBtn) {
                        newDeleteAccountBtn.addEventListener('click', showDeleteAccountModal);
                    }
                } else {
                    // If we couldn't find the logout button, append to the end of the list
                    const deleteAccountItem = document.createElement('li');
                    deleteAccountItem.innerHTML = `<a href="#" id="deleteAccountBtn" class="danger-link">Delete Account</a>`;
                    sidebarNav.appendChild(deleteAccountItem);
                    
                    // Add event listener
                    document.getElementById('deleteAccountBtn')?.addEventListener('click', showDeleteAccountModal);
                }
            }
        } else {
            deleteAccountBtn.addEventListener('click', showDeleteAccountModal);
        }
    }, 100); // Small delay to ensure DOM is ready
}

function showDeleteAccountModal() {
    // Create modal if it doesn't exist
    let modal = document.getElementById('deleteAccountModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'deleteAccountModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Delete Account</h2>
                <p>Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.</p>
                <form id="deleteAccountForm">
                    <div class="form-group">
                        <label for="password">Enter your password to confirm:</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    <div class="form-group">
                        <button type="submit" class="btn btn-danger">Delete My Account</button>
                        <button type="button" class="btn btn-secondary" id="cancelDelete">Cancel</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add CSS styles for the modal if not already in stylesheet
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            .modal {
                display: none;
                position: fixed;
                z-index: 1000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
            }
            .modal-content {
                background-color: #fff;
                margin: 15% auto;
                padding: 20px;
                width: 80%;
                max-width: 500px;
                border-radius: 5px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            }
            .close {
                color: #aaa;
                float: right;
                font-size: 28px;
                font-weight: bold;
                cursor: pointer;
            }
            .close:hover, .close:focus {
                color: #000;
                text-decoration: none;
                cursor: pointer;
            }
            .danger-link {
                color: #dc3545 !important;
            }
            .btn-danger {
                background-color: #dc3545;
                color: white;
                border: none;
                padding: 10px 15px;
                border-radius: 4px;
                cursor: pointer;
            }
            .btn-secondary {
                background-color: #6c757d;
                color: white;
                border: none;
                padding: 10px 15px;
                border-radius: 4px;
                cursor: pointer;
                margin-left: 10px;
            }
        `;
        document.head.appendChild(styleSheet);
    }
    
    // Display the modal
    modal.style.display = 'block';
    
    // Close button functionality
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = () => modal.style.display = 'none';
    
    // Cancel button functionality
    const cancelBtn = modal.querySelector('#cancelDelete');
    cancelBtn.onclick = () => modal.style.display = 'none';
    
    // Submit form functionality
    const form = modal.querySelector('#deleteAccountForm');
    form.onsubmit = handleDeleteAccount;
    
    // Close modal when clicking outside
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}

async function handleDeleteAccount(e) {
    e.preventDefault();
    
    try {
        const password = document.getElementById('password').value;
        const token = localStorage.getItem('token');
        
        if (!password) {
            showError('Please enter your password');
            return;
        }
        
        const confirmDelete = confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.');
        
        if (!confirmDelete) {
            return;
        }
        
        const response = await fetch('/api/auth/delete-account', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Error deleting account');
        }
        
        alert('Your account has been successfully deleted. You will now be redirected to the homepage.');
        
        // Clear localStorage and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        window.location.href = 'index.html'; // Redirect to homepage
        
    } catch (error) {
        console.error('Delete account error:', error);
        showError(error.message || 'Failed to delete account. Please try again.');
    }
} 
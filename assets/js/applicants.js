/**
 * Functions for handling applicants in the company dashboard
 */

// Function to load applicants for the company
function loadApplicants() {
    console.log("Loading applicants...");
    const currentUserEmail = localStorage.getItem('currentUserEmail');
    if (!currentUserEmail) return;
    
    const applicantsList = document.getElementById('applicants-list');
    if (!applicantsList) {
        console.error("Applicants list container not found");
        return;
    }
    
    // Get applications from localStorage
    const applications = JSON.parse(localStorage.getItem('campusConnectApplications')) || [];
    
    // Filter applications for this company
    const companyApplications = applications.filter(app => app.companyEmail === currentUserEmail);
    
    console.log("Found applications:", companyApplications.length);
    
    // Display applications or empty state
    if (companyApplications.length === 0) {
        applicantsList.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 50px 20px;">
                <i class="fas fa-users" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 20px;"></i>
                <h3 style="color: var(--text-color); margin-bottom: 10px;">No Applicants Yet</h3>
                <p style="color: var(--text-light); max-width: 600px; margin: 0 auto;">
                    You haven't received any applications for your internship postings yet. Applications will appear here once students start applying.
                </p>
            </div>
        `;
        return;
    }
    
    // Get user data for applicants
    const users = JSON.parse(localStorage.getItem('campusConnectUsers')) || {};
    
    // Get internships data
    const internships = JSON.parse(localStorage.getItem('campusConnectInternships')) || [];
    
    // Create HTML for applicants
    const applicantsContainer = document.createElement('div');
    applicantsContainer.className = 'applicants-container';
    
    // Group applications by internship
    const internshipGroups = {};
    companyApplications.forEach(app => {
        if (!internshipGroups[app.internshipId]) {
            const internship = internships.find(i => i.id === app.internshipId) || {};
            internshipGroups[app.internshipId] = {
                internship: internship,
                applications: []
            };
        }
        internshipGroups[app.internshipId].applications.push(app);
    });
    
    // Display applicants grouped by internship
    Object.values(internshipGroups).forEach(group => {
        // Add internship heading
        const internshipHeading = document.createElement('h3');
        internshipHeading.className = 'internship-heading';
        internshipHeading.textContent = group.internship.title || 'Unknown Position';
        internshipHeading.style.margin = '25px 0 15px';
        internshipHeading.style.padding = '0 0 10px';
        internshipHeading.style.borderBottom = '1px solid #e2e8f0';
        internshipHeading.style.color = 'var(--primary-color)';
        
        applicantsContainer.appendChild(internshipHeading);
        
        // Add applicants for this internship
        group.applications.forEach(application => {
            const student = users[application.studentEmail] || {};
            
            // Generate random education details if not available
            const studentDept = student.major || ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering'][Math.floor(Math.random() * 4)];
            const studentYear = student.graduationYear || ['2023', '2024', '2025', '2026'][Math.floor(Math.random() * 4)];
            const studentCGPA = student.gpa || (Math.random() * 3 + 7).toFixed(2); // Random CGPA between 7.00 and 10.00
            
            const applicantCard = document.createElement('div');
            applicantCard.className = 'applicant-card';
            applicantCard.setAttribute('data-id', application.id);
            applicantCard.setAttribute('data-email', application.studentEmail);
            
            applicantCard.innerHTML = `
                <div class="applicant-info">
                    <div class="applicant-header">
                        <div class="applicant-avatar">
                            <img src="${student.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(application.studentName)}&background=random`}" alt="${application.studentName}">
                        </div>
                        <div class="applicant-details">
                            <h3>${application.studentName}</h3>
                            <p class="applicant-position">${group.internship.title || application.internshipTitle || 'Unknown Position'}</p>
                            <p class="application-date">Applied: ${new Date(application.appliedDate).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div class="applicant-education">
                        <p><strong>Department:</strong> ${studentDept}</p>
                        <p><strong>Graduation Year:</strong> ${studentYear}</p>
                        <p><strong>CGPA:</strong> ${studentCGPA}</p>
                    </div>
                    <div class="status-badge ${application.status.toLowerCase().replace(/\s+/g, '-')}">${application.status}</div>
                </div>
                <div class="applicant-actions">
                    <button class="btn-view-profile btn-primary" data-email="${application.studentEmail}">
                        <i class="fas fa-user"></i> View Profile
                    </button>
                    ${application.status === 'pending' ? `
                    <button class="btn-accept action-btn" data-id="${application.id}" data-email="${application.studentEmail}">
                        <i class="fas fa-check"></i> Accept
                    </button>
                    <button class="btn-reject action-btn" data-id="${application.id}" data-email="${application.studentEmail}">
                        <i class="fas fa-times"></i> Reject
                    </button>
                    ` : ''}
                </div>
            `;
            
            applicantsContainer.appendChild(applicantCard);
        });
    });
    
    // Clear and populate applicants list
    applicantsList.innerHTML = '';
    applicantsList.appendChild(applicantsContainer);
    
    // Add click event listeners for the action buttons
    const viewProfileButtons = applicantsList.querySelectorAll('.btn-view-profile');
    viewProfileButtons.forEach(button => {
        button.addEventListener('click', function() {
            const studentEmail = this.getAttribute('data-email');
            viewStudentProfile(studentEmail);
        });
    });
    
    const acceptButtons = applicantsList.querySelectorAll('.btn-accept');
    acceptButtons.forEach(button => {
        button.addEventListener('click', function() {
            const applicationId = this.getAttribute('data-id');
            const studentEmail = this.getAttribute('data-email');
            updateApplicationStatus(applicationId, 'accepted');
        });
    });
    
    const rejectButtons = applicantsList.querySelectorAll('.btn-reject');
    rejectButtons.forEach(button => {
        button.addEventListener('click', function() {
            const applicationId = this.getAttribute('data-id');
            const studentEmail = this.getAttribute('data-email');
            
            // Confirm rejection
            const confirmReject = confirm(`Are you sure you want to reject this application?`);
            if (confirmReject) {
                updateApplicationStatus(applicationId, 'rejected');
            }
        });
    });
}

// Function to update application status
function updateApplicationStatus(applicationId, status) {
    // Get applications from localStorage
    const applications = JSON.parse(localStorage.getItem('campusConnectApplications')) || [];
    
    // Find the application to update
    const applicationIndex = applications.findIndex(app => app.id === applicationId);
    
    if (applicationIndex === -1) {
        alert('Application not found');
        return;
    }
    
    // Update the status
    applications[applicationIndex].status = status;
    
    // Save to localStorage
    localStorage.setItem('campusConnectApplications', JSON.stringify(applications));
    
    // Reload applicants to refresh the UI
    loadApplicants();
    
    // Show success message
    alert(`Application ${status} successfully`);
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("Applicants.js loaded");
    
    // Setup menu item click handler for applicants section
    const applicantsMenuItem = document.querySelector('.menu-item[data-content="applicants-content"]');
    if (applicantsMenuItem) {
        const originalClick = applicantsMenuItem.onclick;
        applicantsMenuItem.onclick = function(event) {
            if (originalClick) originalClick.call(this, event);
            loadApplicants();
        };
    }
}); 
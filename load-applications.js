// Function to load student applications
window.loadStudentApplications = function() {
    console.log("Loading student applications...");
    
    const applicationsList = document.getElementById('my-applications-content');
    if (!applicationsList) {
        console.error("Applications content section not found");
        return;
    }
    
    const currentUserEmail = localStorage.getItem('currentUserEmail');
    if (!currentUserEmail) {
        applicationsList.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 40px 20px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #cbd5e0; margin-bottom: 15px;"></i>
                <p>You need to be logged in to view your applications.</p>
            </div>
        `;
        return;
    }
    
    try {
        // Get user applications
        const applications = JSON.parse(localStorage.getItem('campusConnectApplications')) || [];
        const userApplications = applications.filter(app => app.studentEmail === currentUserEmail);
        
        console.log("Found applications:", userApplications.length);
        
        // Display applications or empty state
        if (userApplications.length === 0) {
            applicationsList.innerHTML = `
                <div style="margin-bottom: 30px;">
                    <h2 class="content-title">My Applications</h2>
                </div>
                <div class="empty-state" style="text-align: center; padding: 40px 20px;">
                    <i class="fas fa-clipboard-list" style="font-size: 3rem; color: #cbd5e0; margin-bottom: 15px;"></i>
                    <p>You haven't applied to any internships yet.</p>
                    <button onclick="navigateToInternships()" class="primary-btn" style="margin-top: 20px; padding: 10px 20px;">
                        Browse Available Internships
                    </button>
                </div>
            `;
            return;
        }
        
        // Create HTML content for applications
        let html = `
            <div style="margin-bottom: 30px;">
                <h2 class="content-title">My Applications</h2>
                <p>Track all your internship applications here.</p>
            </div>
        `;
        
        // Create a grid container for applications
        html += `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">`;
        
        // Get internships details for each application
        const internships = JSON.parse(localStorage.getItem('campusConnectInternships')) || [];
        
        userApplications.forEach(application => {
            const internship = internships.find(i => i.id === application.internshipId) || {};
            
            // Get status color
            let statusColor = '#f59e0b'; // Default to warning/pending color
            let statusIcon = 'clock';
            
            if (application.status) {
                if (application.status.toLowerCase() === 'accepted') {
                    statusColor = 'var(--success-color)';
                    statusIcon = 'check-circle';
                } else if (application.status.toLowerCase() === 'rejected') {
                    statusColor = 'var(--danger-color)';
                    statusIcon = 'times-circle';
                }
            }
            
            const applicationDate = new Date(application.appliedDate).toLocaleDateString();
            
            html += `
                <div class="application-card" style="background: white; border-radius: var(--border-radius); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); padding: 20px; transition: transform 0.2s; border-left: 4px solid ${statusColor};">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                        <h3 style="margin: 0; color: var(--primary-color);">${internship.title || application.internshipTitle || 'Unknown Position'}</h3>
                        <span style="background-color: ${statusColor}; color: white; padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; display: flex; align-items: center; gap: 5px;">
                            <i class="fas fa-${statusIcon}"></i> ${application.status || 'Pending'}
                        </span>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 15px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-building" style="width: 16px; color: var(--text-light);"></i>
                            <span>${internship.companyName || application.companyName || 'Unknown Company'}</span>
                        </div>
                        
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-calendar-alt" style="width: 16px; color: var(--text-light);"></i>
                            <span>Applied on: ${applicationDate}</span>
                        </div>
                        
                        ${internship.location ? `
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-map-marker-alt" style="width: 16px; color: var(--text-light);"></i>
                            <span>${internship.location}</span>
                        </div>
                        ` : ''}
                        
                        ${internship.stipend ? `
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-money-bill-wave" style="width: 16px; color: var(--text-light);"></i>
                            <span>${internship.stipend}</span>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div style="text-align: right; margin-top: 15px;">
                        <button onclick="viewApplicationDetails('${application.id}')" style="background-color: white; color: var(--primary-color); border: 1px solid var(--primary-color); padding: 8px 15px; border-radius: var(--border-radius); cursor: pointer; font-size: 0.9rem;">
                            View Details
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
        
        applicationsList.innerHTML = html;
        
    } catch (error) {
        console.error("Error loading applications:", error);
        applicationsList.innerHTML = `
            <div style="margin-bottom: 30px;">
                <h2 class="content-title">My Applications</h2>
            </div>
            <div class="error-state" style="text-align: center; padding: 40px 20px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--danger-color); margin-bottom: 15px;"></i>
                <p>Error loading your applications. Please try again later.</p>
                <p style="margin-top: 10px; font-size: 0.9rem; color: var(--text-light);">Error details: ${error.message}</p>
            </div>
        `;
    }
};

// Function to view application details
window.viewApplicationDetails = function(applicationId) {
    console.log("Viewing application details:", applicationId);
    
    try {
        // Get application details
        const applications = JSON.parse(localStorage.getItem('campusConnectApplications')) || [];
        const application = applications.find(app => app.id === applicationId);
        
        if (!application) {
            alert('Application not found');
            return;
        }
        
        // Get internship details
        const internships = JSON.parse(localStorage.getItem('campusConnectInternships')) || [];
        const internship = internships.find(i => i.id === application.internshipId) || {};
        
        // Get status color
        let statusColor = '#f59e0b'; // Default to warning/pending color
        let statusIcon = 'clock';
        
        if (application.status) {
            if (application.status.toLowerCase() === 'accepted') {
                statusColor = 'var(--success-color)';
                statusIcon = 'check-circle';
            } else if (application.status.toLowerCase() === 'rejected') {
                statusColor = 'var(--danger-color)';
                statusIcon = 'times-circle';
            }
        }
        
        // Format dates
        const applicationDate = new Date(application.appliedDate).toLocaleDateString();
        const updatedDate = application.updatedDate ? new Date(application.updatedDate).toLocaleDateString() : 'N/A';
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'internship-modal';
        modal.style.display = 'flex';
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <span class="close-btn" onclick="closeApplicationModal()">&times;</span>
                
                <div style="margin-bottom: 25px;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <span style="background-color: ${statusColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.9rem; display: flex; align-items: center; gap: 5px;">
                            <i class="fas fa-${statusIcon}"></i> ${application.status || 'Pending'}
                        </span>
                    </div>
                    
                    <h2 style="color: var(--primary-color); margin-bottom: 5px;">${internship.title || application.internshipTitle || 'Unknown Position'}</h2>
                    <p style="color: var(--text-light); font-size: 1.1rem;">${internship.companyName || application.companyName || 'Unknown Company'}</p>
                </div>
                
                <div style="background-color: #f8fafc; padding: 20px; border-radius: var(--border-radius); margin-bottom: 25px;">
                    <h3 style="margin-bottom: 15px; font-size: 1.1rem; color: var(--text-color);">Application Summary</h3>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                        <div>
                            <h4 style="font-size: 0.9rem; color: var(--text-light); margin-bottom: 5px;">Application ID</h4>
                            <p style="font-size: 0.95rem;">${application.id}</p>
                        </div>
                        
                        <div>
                            <h4 style="font-size: 0.9rem; color: var(--text-light); margin-bottom: 5px;">Applied On</h4>
                            <p style="font-size: 0.95rem;">${applicationDate}</p>
                        </div>
                        
                        <div>
                            <h4 style="font-size: 0.9rem; color: var(--text-light); margin-bottom: 5px;">Status Updated</h4>
                            <p style="font-size: 0.95rem;">${updatedDate}</p>
                        </div>
                        
                        <div>
                            <h4 style="font-size: 0.9rem; color: var(--text-light); margin-bottom: 5px;">Current Status</h4>
                            <p style="font-size: 0.95rem; color: ${statusColor}; font-weight: 500;">${application.status || 'Pending'}</p>
                        </div>
                    </div>
                </div>
                
                ${application.feedback ? `
                <div style="margin-bottom: 25px;">
                    <h3 style="margin-bottom: 10px; font-size: 1.1rem; color: var(--text-color);">Feedback</h3>
                    <p style="line-height: 1.6; background-color: #f8fafc; padding: 15px; border-radius: var(--border-radius); font-style: italic;">${application.feedback}</p>
                </div>
                ` : ''}
                
                <div style="margin-bottom: 25px;">
                    <h3 style="margin-bottom: 15px; font-size: 1.1rem; color: var(--text-color);">Internship Details</h3>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 15px;">
                        ${internship.location ? `
                        <div>
                            <h4 style="font-size: 0.9rem; color: var(--text-light); margin-bottom: 5px;">Location</h4>
                            <p style="font-size: 0.95rem;">${internship.location}</p>
                        </div>
                        ` : ''}
                        
                        ${internship.duration ? `
                        <div>
                            <h4 style="font-size: 0.9rem; color: var(--text-light); margin-bottom: 5px;">Duration</h4>
                            <p style="font-size: 0.95rem;">${internship.duration}</p>
                        </div>
                        ` : ''}
                        
                        ${internship.stipend ? `
                        <div>
                            <h4 style="font-size: 0.9rem; color: var(--text-light); margin-bottom: 5px;">Stipend</h4>
                            <p style="font-size: 0.95rem;">${internship.stipend}</p>
                        </div>
                        ` : ''}
                        
                        ${internship.startDate ? `
                        <div>
                            <h4 style="font-size: 0.9rem; color: var(--text-light); margin-bottom: 5px;">Start Date</h4>
                            <p style="font-size: 0.95rem;">${new Date(internship.startDate).toLocaleDateString()}</p>
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                <div style="text-align: right; margin-top: 30px;">
                    <button onclick="closeApplicationModal()" style="background-color: #e2e8f0; color: var(--text-color); border: none; padding: 10px 20px; border-radius: var(--border-radius); cursor: pointer; font-weight: 500;">
                        Close
                    </button>
                    
                    ${application.status && application.status.toLowerCase() === 'accepted' ? `
                    <button onclick="acceptOffer('${application.id}')" style="background-color: var(--success-color); color: white; border: none; padding: 10px 20px; border-radius: var(--border-radius); cursor: pointer; font-weight: 500; margin-left: 10px;">
                        Accept Offer
                    </button>
                    ` : ''}
                    
                    <button onclick="withdrawApplication('${application.id}')" style="background-color: var(--danger-color); color: white; border: none; padding: 10px 20px; border-radius: var(--border-radius); cursor: pointer; font-weight: 500; margin-left: 10px;">
                        Withdraw Application
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
    } catch (error) {
        console.error("Error viewing application details:", error);
        alert("Error: " + error.message);
    }
};

// Function to close application modal
window.closeApplicationModal = function() {
    const modal = document.querySelector('.internship-modal');
    if (modal) {
        modal.remove();
    }
};

// Function to withdraw an application
window.withdrawApplication = function(applicationId) {
    if (!confirm("Are you sure you want to withdraw this application? This action cannot be undone.")) {
        return;
    }
    
    try {
        // Get applications
        const applications = JSON.parse(localStorage.getItem('campusConnectApplications')) || [];
        const applicationIndex = applications.findIndex(app => app.id === applicationId);
        
        if (applicationIndex === -1) {
            alert('Application not found');
            return;
        }
        
        // Remove application
        const application = applications[applicationIndex];
        applications.splice(applicationIndex, 1);
        
        // Save updated applications
        localStorage.setItem('campusConnectApplications', JSON.stringify(applications));
        
        // Update internship's applicants list
        const internships = JSON.parse(localStorage.getItem('campusConnectInternships')) || [];
        const internshipIndex = internships.findIndex(i => i.id === application.internshipId);
        
        if (internshipIndex !== -1) {
            const internship = internships[internshipIndex];
            if (internship.applicants && Array.isArray(internship.applicants)) {
                const applicantIndex = internship.applicants.indexOf(application.studentEmail);
                if (applicantIndex !== -1) {
                    internship.applicants.splice(applicantIndex, 1);
                    localStorage.setItem('campusConnectInternships', JSON.stringify(internships));
                }
            }
        }
        
        // Close modal
        closeApplicationModal();
        
        // Show success message
        alert('Application withdrawn successfully');
        
        // Refresh applications list
        loadStudentApplications();
        
    } catch (error) {
        console.error("Error withdrawing application:", error);
        alert("Error: " + error.message);
    }
};

// Function to accept an offer
window.acceptOffer = function(applicationId) {
    alert("Congratulations! You have accepted the offer. Further instructions will be sent to your email.");
    closeApplicationModal();
};

// API Configuration
// const API_URL = 'http://localhost:5001';
const MOCK_MODE = true; // Enable mock data mode

// Dashboard Functions
async function fetchDashboardData() {
    try {
        const token = localStorage.getItem('token');
        const user = getCurrentUser();
        
        if (!token || !user) {
            window.location.href = 'login.html';
            return;
        }

        if (MOCK_MODE) {
            // Use mock data instead of API calls
            const mockData = generateMockDashboardData(user.role);
            updateDashboardUI(mockData);
            return;
        }

        // Real API call - only used if MOCK_MODE is false
        const response = await fetch(`${API_URL}/dashboard`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            updateDashboardUI(data);
        } else {
            throw new Error('Failed to fetch dashboard data');
        }
    } catch (error) {
        console.error('Dashboard error:', error);
        
        // Show error on dashboard
        const errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        errorEl.textContent = 'Failed to load dashboard data. Please try again later.';
        
        // Insert after dashboard hero section if it exists
        const heroSection = document.querySelector('.dashboard-hero');
        if (heroSection && heroSection.parentNode) {
            heroSection.parentNode.insertBefore(errorEl, heroSection.nextSibling);
        } else {
            // Fallback - add to top of main content
            const mainContent = document.querySelector('.main-content, main');
            if (mainContent) {
                mainContent.prepend(errorEl);
            }
        }
    }
}

// Generate mock data for demo purposes
function generateMockDashboardData(role) {
    // Common data for all roles
    const baseData = {
        stats: {
            totalJobs: 25,
            totalApplications: 8,
            activeCompanies: 12,
            totalEvents: 5
        }
    };
    
    // Role-specific data
    if (role === 'student') {
        return {
            ...baseData,
            stats: {
                ...baseData.stats,
                totalApplications: 8,
                totalInterviews: 3,
                totalOffers: 1
            },
            recentJobs: [
                { id: 1, title: 'Frontend Developer Intern', company: 'TechCorp', location: 'Bangalore', deadline: '2023-12-15' },
                { id: 2, title: 'UI/UX Designer', company: 'DesignHub', location: 'Remote', deadline: '2023-12-20' },
                { id: 3, title: 'Backend Engineer', company: 'ServerSolutions', location: 'Hyderabad', deadline: '2023-12-18' }
            ],
            recentApplications: [
                { id: 1, jobTitle: 'Frontend Developer Intern', status: 'Interview Scheduled', appliedAt: '2023-11-28T10:30:00Z' },
                { id: 2, jobTitle: 'Data Analyst', status: 'Under Review', appliedAt: '2023-11-25T08:15:00Z' },
                { id: 3, jobTitle: 'Mobile App Developer', status: 'Applied', appliedAt: '2023-11-20T14:45:00Z' }
            ]
        };
    } else if (role === 'company') {
        return {
            ...baseData,
            stats: {
                ...baseData.stats,
                activeListings: 4,
                totalApplicants: 35,
                interviewsScheduled: 12
            },
            activeJobs: [
                { id: 1, title: 'Senior Frontend Developer', applicants: 15, posted: '2023-11-10T09:00:00Z' },
                { id: 2, title: 'Java Backend Developer', applicants: 12, posted: '2023-11-15T11:30:00Z' },
                { id: 3, title: 'DevOps Engineer', applicants: 8, posted: '2023-11-20T10:00:00Z' }
            ],
            recentApplicants: [
                { id: 1, name: 'John Doe', position: 'Senior Frontend Developer', status: 'Pending Review', appliedAt: '2023-11-28T14:00:00Z' },
                { id: 2, name: 'Jane Smith', position: 'Java Backend Developer', status: 'Interview Scheduled', appliedAt: '2023-11-27T09:30:00Z' },
                { id: 3, name: 'Bob Johnson', position: 'DevOps Engineer', status: 'Pending Review', appliedAt: '2023-11-26T16:45:00Z' },
                { id: 4, name: 'Emily Williams', position: 'Frontend Developer', status: 'Accepted', appliedAt: '2023-11-24T11:15:00Z' },
                { id: 5, name: 'Michael Brown', position: 'Senior Frontend Developer', status: 'Rejected', appliedAt: '2023-11-22T10:45:00Z' }
            ]
        };
    } else if (role === 'faculty') {
        return {
            ...baseData,
            stats: {
                ...baseData.stats,
                totalStudents: 120,
                placedStudents: 45,
                placementRate: '37.5%'
            },
            recentActivities: [
                { id: 1, title: 'Resume Workshop', description: 'Help students prepare professional resumes', date: '2023-12-10T15:00:00Z' },
                { id: 2, title: 'Mock Interviews', description: 'Practice technical interviews with industry experts', date: '2023-12-15T10:00:00Z' },
                { id: 3, title: 'Placement Orientation', description: 'Overview of the placement process for new students', date: '2023-12-05T14:30:00Z' }
            ],
            mentorshipRequests: [
                { id: 1, studentName: 'Alice Williams', requestType: 'Career Guidance', status: 'Pending' },
                { id: 2, studentName: 'Charlie Brown', requestType: 'Technical Mentorship', status: 'Pending' },
                { id: 3, studentName: 'David Miller', requestType: 'Interview Preparation', status: 'Pending' }
            ],
            studentApplicants: [
                { id: 1, name: 'John Smith', email: 'john.smith@example.com', department: 'Computer Science', position: 'Software Engineer Intern', company: 'TechCorp', appliedDate: '2023-11-15T09:30:00Z', status: 'Applied' },
                { id: 2, name: 'Emma Johnson', email: 'emma.j@example.com', department: 'Electrical Engineering', position: 'Hardware Design Intern', company: 'ElectroTech', appliedDate: '2023-11-20T11:45:00Z', status: 'Interview Scheduled' },
                { id: 3, name: 'Michael Brown', email: 'michael.b@example.com', department: 'Computer Science', position: 'Frontend Developer', company: 'WebSolutions', appliedDate: '2023-11-18T14:20:00Z', status: 'Under Review' },
                { id: 4, name: 'Sarah Lee', email: 'sarah.lee@example.com', department: 'Mechanical Engineering', position: 'Product Design Intern', company: 'InnovateDesign', appliedDate: '2023-11-22T10:10:00Z', status: 'Applied' },
                { id: 5, name: 'David Wilson', email: 'david.w@example.com', department: 'Computer Science', position: 'Data Science Intern', company: 'DataMinds', appliedDate: '2023-11-25T13:30:00Z', status: 'Applied' }
            ]
        };
    }
    
    // Default data if role is not recognized
    return baseData;
}

function updateDashboardUI(data) {
    // Update user info and welcome message
    const user = getCurrentUser();
    if (user) {
        // Update welcome message
        const welcomeElement = document.getElementById('welcomeMessage');
        if (welcomeElement) {
            welcomeElement.innerHTML = `Welcome, <span class="user-name">${user.name}</span>!`;
        }

        // Update user info in profile section if it exists
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = user.name;
        }

        const userRoleElement = document.getElementById('userRole');
        if (userRoleElement) {
            userRoleElement.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
        }
    }

    // Update stats
    if (data.stats) {
        document.getElementById('totalJobs').textContent = data.stats.totalJobs || 0;
        document.getElementById('totalApplications').textContent = data.stats.totalApplications || 0;
        document.getElementById('activeCompanies').textContent = data.stats.activeCompanies || 0;
    }

    // Update recent jobs
    if (data.recentJobs && data.recentJobs.length > 0) {
        const jobsContainer = document.getElementById('recentJobs');
        if (jobsContainer) {
            jobsContainer.innerHTML = data.recentJobs.map(job => `
                <div class="job-card">
                    <h3>${job.title}</h3>
                    <p>${job.company}</p>
                    <p>${job.location}</p>
                    <a href="job-detail.html?id=${job.id}" class="btn btn-primary">View Details</a>
                </div>
            `).join('');
        }
    }

    // Update recent applications
    if (data.recentApplications && data.recentApplications.length > 0) {
        const applicationsContainer = document.getElementById('recentApplications');
        if (applicationsContainer) {
            applicationsContainer.innerHTML = data.recentApplications.map(app => `
                <div class="application-card">
                    <h3>${app.jobTitle}</h3>
                    <p>Status: ${app.status}</p>
                    <p>Applied on: ${new Date(app.appliedAt).toLocaleDateString()}</p>
                    <a href="application-detail.html?id=${app.id}" class="btn btn-primary">View Details</a>
                </div>
            `).join('');
        }
    }
    
    // Update faculty dashboard with student applicants
    if (user && user.role === 'faculty' && data.studentApplicants && data.studentApplicants.length > 0) {
        const applicantsList = document.getElementById('applicants-list');
        if (applicantsList) {
            const noApplicantsMessage = document.getElementById('no-applicants-message');
            if (noApplicantsMessage) {
                noApplicantsMessage.style.display = 'none';
            }
            
            applicantsList.innerHTML = data.studentApplicants.map(applicant => `
                <div class="applicant-card">
                    <div class="applicant-info">
                        <h3>${applicant.name}</h3>
                        <p><strong>Email:</strong> ${applicant.email}</p>
                        <p><strong>Department:</strong> ${applicant.department}</p>
                        <p><strong>Position:</strong> ${applicant.position}</p>
                        <p><strong>Company:</strong> ${applicant.company}</p>
                        <p><strong>Applied Date:</strong> ${new Date(applicant.appliedDate).toLocaleDateString()}</p>
                        <p class="status ${applicant.status.toLowerCase().replace(/\s+/g, '-')}"><strong>Status:</strong> ${applicant.status}</p>
                    </div>
                    <div class="applicant-actions">
                        <button class="btn-view-profile btn-primary" data-id="${applicant.id}">
                            <i class="fas fa-user"></i> View Profile
                        </button>
                        <button class="btn-message btn-secondary" data-id="${applicant.id}">
                            <i class="fas fa-comment"></i> Message
                        </button>
                    </div>
                </div>
            `).join('');
            
            // Add click event listeners for the action buttons
            const viewProfileButtons = document.querySelectorAll('.btn-view-profile');
            viewProfileButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const applicantId = this.getAttribute('data-id');
                    alert(`View profile functionality for applicant ID: ${applicantId}`);
                    // Here you would navigate to student profile page
                });
            });
            
            const messageButtons = document.querySelectorAll('.btn-message');
            messageButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const applicantId = this.getAttribute('data-id');
                    alert(`Message functionality for applicant ID: ${applicantId}`);
                    // Here you would open messaging interface
                });
            });
        }
    } else if (user && user.role === 'faculty') {
        const applicantsList = document.getElementById('applicants-list');
        const noApplicantsMessage = document.getElementById('no-applicants-message');
        if (applicantsList && noApplicantsMessage) {
            applicantsList.innerHTML = '';
            noApplicantsMessage.style.display = 'block';
        }
    }
    
    // Update company dashboard with student applicants
    if (user && user.role === 'company' && data.recentApplicants && data.recentApplicants.length > 0) {
        const applicantsList = document.getElementById('applicants-list');
        if (applicantsList) {
            // Remove the empty state message if exists
            applicantsList.innerHTML = '';
            
            // Create the applicants container
            const applicantsContainer = document.createElement('div');
            applicantsContainer.className = 'applicants-container';
            
            // Add applicants to the container
            data.recentApplicants.forEach(applicant => {
                const applicantCard = document.createElement('div');
                applicantCard.className = 'applicant-card';
                applicantCard.setAttribute('data-id', applicant.id);
                
                // Generate random application details for demo
                const applicationDate = new Date(applicant.appliedAt);
                const status = applicant.status || 'Pending Review';
                const position = applicant.position;
                const studentDept = ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering'][Math.floor(Math.random() * 4)];
                const studentYear = ['1st Year', '2nd Year', '3rd Year', '4th Year'][Math.floor(Math.random() * 4)];
                const studentCGPA = (Math.random() * 3 + 7).toFixed(2); // Random CGPA between 7.00 and 10.00
                
                applicantCard.innerHTML = `
                    <div class="applicant-info">
                        <div class="applicant-header">
                            <div class="applicant-avatar">
                                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(applicant.name)}&background=random" alt="${applicant.name}">
                            </div>
                            <div class="applicant-details">
                                <h3>${applicant.name}</h3>
                                <p class="applicant-position">${position}</p>
                                <p class="application-date">Applied: ${applicationDate.toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div class="applicant-education">
                            <p><strong>Department:</strong> ${studentDept}</p>
                            <p><strong>Year:</strong> ${studentYear}</p>
                            <p><strong>CGPA:</strong> ${studentCGPA}</p>
                        </div>
                        <div class="status-badge ${status.toLowerCase().replace(/\s+/g, '-')}">${status}</div>
                    </div>
                    <div class="applicant-actions">
                        <button class="btn-view-profile btn-primary" data-id="${applicant.id}">
                            <i class="fas fa-user"></i> View Profile
                        </button>
                        <button class="btn-accept action-btn" data-id="${applicant.id}" ${status !== 'Pending Review' ? 'disabled' : ''}>
                            <i class="fas fa-check"></i> Accept
                        </button>
                        <button class="btn-reject action-btn" data-id="${applicant.id}" ${status !== 'Pending Review' ? 'disabled' : ''}>
                            <i class="fas fa-times"></i> Reject
                        </button>
                    </div>
                `;
                
                applicantsContainer.appendChild(applicantCard);
            });
            
            applicantsList.appendChild(applicantsContainer);
            
            // Add event listeners for the action buttons
            const viewProfileButtons = applicantsList.querySelectorAll('.btn-view-profile');
            viewProfileButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const applicantId = this.getAttribute('data-id');
                    // In a real application, this would navigate to the student's profile page
                    alert(`Viewing profile of applicant ID: ${applicantId}`);
                });
            });
            
            const acceptButtons = applicantsList.querySelectorAll('.btn-accept');
            acceptButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const applicantId = this.getAttribute('data-id');
                    const applicantCard = this.closest('.applicant-card');
                    const applicantName = applicantCard.querySelector('h3').textContent;
                    const position = applicantCard.querySelector('.applicant-position').textContent;
                    
                    // Update the UI to show acceptance
                    const statusBadge = applicantCard.querySelector('.status-badge');
                    statusBadge.className = 'status-badge accepted';
                    statusBadge.textContent = 'Accepted';
                    
                    // Disable the action buttons
                    applicantCard.querySelectorAll('.action-btn').forEach(btn => {
                        btn.disabled = true;
                    });
                    
                    // In a real application, this would update the application status in the backend
                    alert(`Accepted application from ${applicantName} for the position of ${position}`);
                });
            });
            
            const rejectButtons = applicantsList.querySelectorAll('.btn-reject');
            rejectButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const applicantId = this.getAttribute('data-id');
                    const applicantCard = this.closest('.applicant-card');
                    const applicantName = applicantCard.querySelector('h3').textContent;
                    const position = applicantCard.querySelector('.applicant-position').textContent;
                    
                    // Confirm rejection
                    const confirmReject = confirm(`Are you sure you want to reject ${applicantName}'s application?`);
                    if (confirmReject) {
                        // Update the UI to show rejection
                        const statusBadge = applicantCard.querySelector('.status-badge');
                        statusBadge.className = 'status-badge rejected';
                        statusBadge.textContent = 'Rejected';
                        
                        // Disable the action buttons
                        applicantCard.querySelectorAll('.action-btn').forEach(btn => {
                            btn.disabled = true;
                        });
                        
                        // In a real application, this would update the application status in the backend
                        alert(`Rejected application from ${applicantName} for the position of ${position}`);
                    }
                });
            });
        }
    } else if (user && user.role === 'company') {
        const applicantsList = document.getElementById('applicants-list');
        if (applicantsList) {
            // Show empty state message
            applicantsList.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 50px 20px;">
                    <i class="fas fa-users" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 20px;"></i>
                    <h3 style="color: var(--text-color); margin-bottom: 10px;">No Applicants Yet</h3>
                    <p style="color: var(--text-light); max-width: 600px; margin: 0 auto;">
                        You haven't received any applications for your internship postings yet. Applications will appear here once students start applying.
                    </p>
                </div>
            `;
        }
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    if (isAuthenticated()) {
        fetchDashboardData();
    } else {
        window.location.href = 'login.html';
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Logout functionality
    const logoutBtn = document.getElementById('logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // In a real application, you would destroy the session here
            // For now, just redirect to login page
            window.location.href = 'login.html';
        });
    }
    
    // Delete Account functionality
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Show the modal
            const modal = document.getElementById('deleteAccountModal');
            if (modal) {
                modal.style.display = 'block';
                
                // Close the modal when clicking on X
                const closeBtn = modal.querySelector('.close');
                if (closeBtn) {
                    closeBtn.onclick = function() {
                        modal.style.display = 'none';
                    };
                }
                
                // Close the modal when clicking on Cancel
                const cancelBtn = document.getElementById('cancelDelete');
                if (cancelBtn) {
                    cancelBtn.onclick = function() {
                        modal.style.display = 'none';
                    };
                }
                
                // Handle form submission
                const form = document.getElementById('deleteAccountForm');
                if (form) {
                    form.onsubmit = function(event) {
                        event.preventDefault();
                        const password = document.getElementById('password').value;
                        
                        if (!password) {
                            alert('Please enter your password to confirm');
                            return;
                        }
                        
                        const confirmDelete = confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.');
                        
                        if (confirmDelete) {
                            // Call the API to delete the account
                            fetch('http://localhost:5001/api/auth/delete-account', {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                                },
                                body: JSON.stringify({ password: password })
                            })
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('Failed to delete account');
                                }
                                return response.json();
                            })
                            .then(data => {
                                // Clear localStorage
                                localStorage.removeItem('token');
                                localStorage.removeItem('user');
                                
                                alert('Your account has been deleted successfully!');
                                window.location.href = 'login.html';
                            })
                            .catch(error => {
                                alert('Error deleting account: ' + error.message);
                            });
                        }
                    };
                }
                
                // Close the modal when clicking outside of it
                window.onclick = function(event) {
                    if (event.target === modal) {
                        modal.style.display = 'none';
                    }
                };
            }
        });
    }
    
    // Apply for job functionality
    const applyButtons = document.querySelectorAll('.btn-apply');
    applyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const jobTitle = this.closest('.job-card').querySelector('h3').textContent;
            const company = this.closest('.job-card').querySelector('.company-name').textContent;
            
            // In a real application, this would send an application to the backend
            alert(`Application submitted for ${jobTitle} at ${company}!`);
            this.textContent = 'Applied';
            this.disabled = true;
            this.style.backgroundColor = '#95a5a6';
        });
    });
    
    // Event registration functionality
    const eventCards = document.querySelectorAll('.event-card');
    eventCards.forEach(card => {
        card.addEventListener('click', function() {
            const eventName = this.querySelector('h3').textContent;
            const eventDate = this.querySelector('.date').textContent + ' ' + 
                              this.querySelector('.month').textContent;
            
            const isRegistered = this.classList.contains('registered');
            
            if (!isRegistered) {
                // In a real application, this would register the user for the event
                alert(`You have registered for "${eventName}" on ${eventDate}`);
                this.classList.add('registered');
                this.style.borderLeft = '4px solid var(--success-color)';
            }
        });
    });
    
    // Accept/Decline mentorship requests (for faculty dashboard)
    const actionButtons = document.querySelectorAll('.btn-accept, .btn-decline');
    actionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const requestCard = this.closest('.request-card');
            const studentName = requestCard.querySelector('h4').textContent;
            const action = this.classList.contains('btn-accept') ? 'accepted' : 'declined';
            
            // In a real application, this would update the mentorship request status
            alert(`You have ${action} the mentorship request from ${studentName}`);
            requestCard.style.opacity = '0.6';
            requestCard.style.pointerEvents = 'none';
        });
    });
    
    // Post Job functionality (for company dashboard)
    const postJobForm = document.getElementById('postJobForm');
    if (postJobForm) {
        postJobForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const jobTitle = document.getElementById('jobTitle').value;
            const jobType = document.getElementById('jobType').value;
            
            // In a real application, this would submit the job posting to the backend
            alert(`Job "${jobTitle}" has been posted successfully!`);
            this.reset();
        });
    }
}); 
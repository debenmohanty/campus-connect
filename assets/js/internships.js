// Internship Data Management
const INTERNSHIPS_STORAGE_KEY = 'campusConnectInternships';
const APPLICATIONS_STORAGE_KEY = 'campusConnectApplications';

// Function to initialize internships storage and sample data
function initializeInternshipsStorage() {
    const internships = JSON.parse(localStorage.getItem(INTERNSHIPS_STORAGE_KEY)) || [];
    const applications = JSON.parse(localStorage.getItem(APPLICATIONS_STORAGE_KEY)) || [];
    
    // Initialize empty arrays if they don't exist
    if (!localStorage.getItem(INTERNSHIPS_STORAGE_KEY)) {
        localStorage.setItem(INTERNSHIPS_STORAGE_KEY, JSON.stringify([]));
    }
    
    if (!localStorage.getItem(APPLICATIONS_STORAGE_KEY)) {
        localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify([]));
    }
    
    // Set up event listener to notify students of new internships
    window.addEventListener('storage', function(e) {
        if (e.key === INTERNSHIPS_STORAGE_KEY) {
            // Check if it's a student dashboard
            const userType = localStorage.getItem('userType');
            if (userType === 'student' && typeof loadInternshipOffers === 'function') {
                loadInternshipOffers();
            }
        }
    });
}

// Function to save a new internship
window.saveInternship = function(internshipData) {
    const internships = JSON.parse(localStorage.getItem(INTERNSHIPS_STORAGE_KEY)) || [];
    
    // Generate unique ID if not provided
    if (!internshipData.id) {
        internshipData.id = Date.now().toString();
    }
    
    // Set defaults for required fields
    internshipData.postedDate = internshipData.postedDate || new Date().toISOString();
    internshipData.status = internshipData.status || 'active';
    internshipData.applications = internshipData.applications || [];
    
    // Ensure companyName is set for student dashboard display
    if (!internshipData.companyName && internshipData.companyEmail) {
        const users = JSON.parse(localStorage.getItem('campusConnectUsers')) || {};
        const company = Object.values(users).find(user => user.email === internshipData.companyEmail);
        if (company) {
            internshipData.companyName = company.companyName || `${company.firstName} ${company.lastName}`;
        }
    }
    
    // Add to internships list
    internships.push(internshipData);
    localStorage.setItem(INTERNSHIPS_STORAGE_KEY, JSON.stringify(internships));
    
    console.log('Internship saved:', internshipData);
    
    // Trigger storage event for other tabs
    window.dispatchEvent(new StorageEvent('storage', { 
        key: INTERNSHIPS_STORAGE_KEY,
        newValue: JSON.stringify(internships)
    }));
    
    return internshipData;
}

// Function to get all active internships
window.getAllActiveInternships = function() {
    try {
        const internships = JSON.parse(localStorage.getItem(INTERNSHIPS_STORAGE_KEY)) || [];
        const activeInternships = internships.filter(internship => internship.status === 'active');
        
        // Additional processing to standardize internship format for student dashboard
        return activeInternships.map(internship => {
            // Ensure all required fields are present
            return {
                ...internship,
                title: internship.title || 'Untitled Internship',
                companyName: internship.companyName || 'Unknown Company',
                location: internship.location || 'Not specified',
                duration: internship.duration || 'Not specified',
                stipend: internship.stipend || 'Not specified',
                description: internship.description || 'No description provided',
                requirements: Array.isArray(internship.requirements) 
                    ? internship.requirements 
                    : [internship.requirements || 'No specific requirements'],
                skills: Array.isArray(internship.skills) 
                    ? internship.skills 
                    : internship.skills ? internship.skills.split(',').map(s => s.trim()) : []
            };
        });
    } catch (error) {
        console.error('Error getting active internships:', error);
        return [];
    }
}

// Function to get internships by company
window.getInternshipsByCompany = function(companyEmail) {
    try {
        if (!companyEmail) {
            throw new Error('Company email is required');
        }
        
        const internships = JSON.parse(localStorage.getItem(INTERNSHIPS_STORAGE_KEY)) || [];
        return internships.filter(internship => internship.companyEmail === companyEmail);
    } catch (error) {
        console.error('Error getting internships by company:', error);
        return [];
    }
}

// Function to apply for an internship
window.applyForInternship = function(internshipId, studentEmail) {
    try {
        if (!internshipId || !studentEmail) {
            throw new Error('Internship ID and student email are required');
        }
        
        const internships = JSON.parse(localStorage.getItem(INTERNSHIPS_STORAGE_KEY)) || [];
        const internshipIndex = internships.findIndex(i => i.id === internshipId);
        
        if (internshipIndex === -1) {
            throw new Error('Internship not found');
        }
        
        const internship = internships[internshipIndex];
        
        // Check if already applied
        if (internship.applications && internship.applications.includes(studentEmail)) {
            throw new Error('You have already applied for this internship');
        }
        
        // Initialize applications array if it doesn't exist
        if (!internship.applications) {
            internship.applications = [];
        }
        
        // Add application to internship
        internship.applications.push(studentEmail);
        
        // Update internship in the array
        internships[internshipIndex] = internship;
        
        // Save internships back to localStorage
        localStorage.setItem(INTERNSHIPS_STORAGE_KEY, JSON.stringify(internships));
        
        // Save application record
        const applications = JSON.parse(localStorage.getItem(APPLICATIONS_STORAGE_KEY)) || [];
        
        // Check if application already exists
        const existingApp = applications.find(app => 
            app.internshipId === internshipId && app.studentEmail === studentEmail
        );
        
        if (!existingApp) {
            applications.push({
                internshipId,
                studentEmail,
                appliedDate: new Date().toISOString(),
                status: 'pending',
                companyEmail: internship.companyEmail,
                internshipTitle: internship.title
            });
            
            localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(applications));
        }
        
        console.log('Application submitted:', { internshipId, studentEmail });
        
        return true;
    } catch (error) {
        console.error('Error applying for internship:', error);
        throw error;
    }
}

// Function to get student's applications
window.getStudentApplications = function(studentEmail) {
    try {
        if (!studentEmail) {
            throw new Error('Student email is required');
        }
        
        const applications = JSON.parse(localStorage.getItem(APPLICATIONS_STORAGE_KEY)) || [];
        const studentApps = applications.filter(app => app.studentEmail === studentEmail);
        
        // Enhance applications with internship details
        return studentApps.map(app => {
            const internship = window.getInternshipDetails(app.internshipId);
            return {
                ...app,
                internshipTitle: internship ? internship.title : app.internshipTitle || 'Unknown Internship',
                companyName: internship ? internship.companyName : 'Unknown Company'
            };
        });
    } catch (error) {
        console.error('Error getting student applications:', error);
        return [];
    }
}

// Function to get internship details
window.getInternshipDetails = function(internshipId) {
    try {
        if (!internshipId) {
            throw new Error('Internship ID is required');
        }
        
        const internships = JSON.parse(localStorage.getItem(INTERNSHIPS_STORAGE_KEY)) || [];
        const internship = internships.find(i => i.id === internshipId);
        
        if (!internship) {
            console.warn(`Internship with ID ${internshipId} not found`);
            return null;
        }
        
        // Return a standardized internship object
        return {
            ...internship,
            title: internship.title || 'Untitled Internship',
            companyName: internship.companyName || 'Unknown Company',
            location: internship.location || 'Not specified',
            duration: internship.duration || 'Not specified',
            stipend: internship.stipend || 'Not specified',
            description: internship.description || 'No description provided',
            requirements: Array.isArray(internship.requirements) 
                ? internship.requirements 
                : [internship.requirements || 'No specific requirements'],
            skills: Array.isArray(internship.skills) 
                ? internship.skills 
                : internship.skills ? internship.skills.split(',').map(s => s.trim()) : []
        };
    } catch (error) {
        console.error('Error getting internship details:', error);
        return null;
    }
}

// Function to update internship status
window.updateInternshipStatus = function(internshipId, status) {
    try {
        if (!internshipId || !status) {
            throw new Error('Internship ID and status are required');
        }
        
        const internships = JSON.parse(localStorage.getItem(INTERNSHIPS_STORAGE_KEY)) || [];
        const internshipIndex = internships.findIndex(i => i.id === internshipId);
        
        if (internshipIndex === -1) {
            throw new Error('Internship not found');
        }
        
        // Update status
        internships[internshipIndex].status = status;
        
        // Save back to localStorage
        localStorage.setItem(INTERNSHIPS_STORAGE_KEY, JSON.stringify(internships));
        
        console.log('Internship status updated:', { internshipId, status });
        
        return true;
    } catch (error) {
        console.error('Error updating internship status:', error);
        throw error;
    }
}

// Function to update application status
window.updateApplicationStatus = function(internshipId, studentEmail, status) {
    try {
        if (!internshipId || !studentEmail || !status) {
            throw new Error('Internship ID, student email, and status are required');
        }
        
        const applications = JSON.parse(localStorage.getItem(APPLICATIONS_STORAGE_KEY)) || [];
        const applicationIndex = applications.findIndex(app => 
            app.internshipId === internshipId && app.studentEmail === studentEmail
        );
        
        if (applicationIndex === -1) {
            throw new Error('Application not found');
        }
        
        // Update status
        applications[applicationIndex].status = status;
        
        // Add status update date
        applications[applicationIndex].statusUpdatedDate = new Date().toISOString();
        
        // Save back to localStorage
        localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(applications));
        
        console.log('Application status updated:', { internshipId, studentEmail, status });
        
        return true;
    } catch (error) {
        console.error('Error updating application status:', error);
        throw error;
    }
}

// Function to get company applications
window.getCompanyApplications = function(companyEmail) {
    try {
        if (!companyEmail) {
            throw new Error('Company email is required');
        }
        
        const applications = JSON.parse(localStorage.getItem(APPLICATIONS_STORAGE_KEY)) || [];
        
        // Get applications for internships posted by this company
        return applications.filter(app => app.companyEmail === companyEmail);
    } catch (error) {
        console.error('Error getting company applications:', error);
        return [];
    }
}

// Function to delete an internship
window.deleteInternship = function(internshipId) {
    try {
        if (!internshipId) {
            throw new Error('Internship ID is required');
        }
        
        const internships = JSON.parse(localStorage.getItem(INTERNSHIPS_STORAGE_KEY)) || [];
        const updatedInternships = internships.filter(i => i.id !== internshipId);
        
        // Save back to localStorage
        localStorage.setItem(INTERNSHIPS_STORAGE_KEY, JSON.stringify(updatedInternships));
        
        // Clean up related applications
        const applications = JSON.parse(localStorage.getItem(APPLICATIONS_STORAGE_KEY)) || [];
        const updatedApplications = applications.filter(app => app.internshipId !== internshipId);
        
        localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(updatedApplications));
        
        console.log('Internship deleted:', internshipId);
        
        return true;
    } catch (error) {
        console.error('Error deleting internship:', error);
        throw error;
    }
}

// Initialize storage when the script loads
initializeInternshipsStorage(); 
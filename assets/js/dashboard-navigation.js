// Dashboard Navigation System
console.log("Dashboard Navigation System loaded");

// Function to navigate between dashboard sections
function navigateToSection(sectionId) {
    console.log("Navigating to section:", sectionId);
    
    // Handle old function calls (for backward compatibility)
    if (sectionId === 'dashboard') sectionId = 'dashboard-content';
    if (sectionId === 'internship-offers') sectionId = 'internship-offers-content';
    if (sectionId === 'profile') sectionId = 'profile-content';
    if (sectionId === 'career-counselling') sectionId = 'career-counselling-content';
    
    // Remove active class from all menu items
    document.querySelectorAll('.menu-item').forEach(menuItem => {
        menuItem.classList.remove('active');
    });
    
    // Add active class to matched menu item
    const menuItem = document.querySelector(`.menu-item[data-section="${sectionId}"]`);
    if (menuItem) {
        menuItem.classList.add('active');
    }
    
    // Hide all content sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show the target content section
    const contentSection = document.getElementById(sectionId);
    if (contentSection) {
        contentSection.style.display = 'block';
        
        // Load specific content if needed
        if (sectionId === 'internship-offers-content' && typeof loadInternshipOffers === 'function') {
            loadInternshipOffers();
        } else if (sectionId === 'my-applications-content' && typeof loadStudentApplications === 'function') {
            loadStudentApplications();
        } else if (sectionId === 'profile-content' && typeof loadProfileData === 'function') {
            loadProfileData();
        }
    } else {
        console.error(`Content section not found: ${sectionId}`);
    }
}

// Backward compatibility function
function showContent(contentType, menuText = '') {
    console.log("showContent called with:", contentType, menuText);
    
    // Convert old content types to section IDs
    let sectionId;
    if (contentType === 'dashboard') sectionId = 'dashboard-content';
    else if (contentType === 'internship-offers') sectionId = 'internship-offers-content';
    else if (contentType === 'profile') sectionId = 'profile-content';
    else if (contentType === 'career-counselling') sectionId = 'career-counselling-content';
    else if (contentType === 'coming-soon') {
        sectionId = 'coming-soon-content';
        // Set the title
        const titleElem = document.getElementById('coming-soon-title');
        if (titleElem) {
            titleElem.textContent = menuText.charAt(0).toUpperCase() + menuText.slice(1);
        }
    } else {
        sectionId = contentType + '-content';
    }
    
    // Use the navigation function
    navigateToSection(sectionId);
}

// Setup dashboard navigation
function setupDashboardNavigation() {
    console.log("Setting up dashboard navigation");
    
    // Menu navigation
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');
            if (targetSection) {
                navigateToSection(targetSection);
            }
        });
    });
    
    // Toggle sidebar on mobile
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            document.querySelector('.sidebar').classList.toggle('active');
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Setup navigation
    setupDashboardNavigation();
    
    // Navigate to default section (dashboard)
    navigateToSection('dashboard-content');
}); 
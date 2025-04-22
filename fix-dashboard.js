// Fix Dashboard Navigation Script
// This script helps fix dashboard issues by ensuring proper initialization

// Execute when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("Running dashboard fixes...");
    
    // Fix navigation menu
    fixNavigationMenu();
    
    // Fix socket connection
    fixSocketConnection();
    
    // Update user information
    updateUserInfo();
    
    // Initialize all features
    initializeFeatures();
    
    // Fix content display
    fixContentDisplay();
    
    // Check for unread messages
    if (typeof checkUnreadMessages === 'function') {
        try {
            checkUnreadMessages();
        } catch (e) {
            console.error("Error checking unread messages:", e);
        }
    }
    
    console.log("Dashboard fixes complete");
});

// Fix navigation menu
function fixNavigationMenu() {
    // Fix active menu items
    const menuItems = document.querySelectorAll('.menu-item');
    const contentSections = document.querySelectorAll('.content-section');
    
    console.log("Fixing navigation menu with", menuItems.length, "menu items and", contentSections.length, "content sections");
    
    // First, remove any existing click event listeners
    menuItems.forEach(item => {
        const newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);
    });
    
    // Get fresh collection after replacing items
    const freshMenuItems = document.querySelectorAll('.menu-item');
    
    // Hide all content sections initially
    contentSections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Find active item or use the first item as default
    let activeItem = document.querySelector('.menu-item.active');
    if (!activeItem && freshMenuItems.length > 0) {
        activeItem = freshMenuItems[0];
        activeItem.classList.add('active');
    }
    
    // Show corresponding content section for active item
    if (activeItem) {
        const contentId = activeItem.getAttribute('data-content');
        const contentSection = document.getElementById(contentId);
        if (contentSection) {
            contentSection.style.display = 'block';
            console.log("Displaying content section:", contentId);
        } else {
            console.error("Content section not found:", contentId);
        }
    }
    
    // Add new click event listeners to all menu items
    freshMenuItems.forEach(item => {
        item.addEventListener('click', function(event) {
            // Prevent default action if any
            event.preventDefault();
            
            console.log("Menu item clicked:", this.getAttribute('data-content'));
            
            // Remove active class from all menu items
            freshMenuItems.forEach(i => i.classList.remove('active'));
            
            // Add active class to clicked menu item
            this.classList.add('active');
            
            // Hide all content sections
            contentSections.forEach(section => {
                section.style.display = 'none';
            });
            
            // Show the corresponding content section
            const contentId = this.getAttribute('data-content');
            const contentSection = document.getElementById(contentId);
            if (contentSection) {
                contentSection.style.display = 'block';
                console.log("Displaying content section:", contentId);
            } else {
                console.error("Content section not found:", contentId);
                // Default to dashboard if section not found
                const dashboard = document.getElementById('dashboard-section');
                if (dashboard) {
                    dashboard.style.display = 'block';
                }
            }
        });
    });
}

// Fix socket connection
function fixSocketConnection() {
    // Check if socket is defined
    if (typeof chatSocket !== 'undefined' && chatSocket.init) {
        console.log("Fixing socket connection...");
        
        // Make sure we're connected
        try {
            // Initialize socket if not connected
            if (!chatSocket.socket || !chatSocket.socket.connected) {
                chatSocket.init();
            }
            
            // Login with current user if not logged in
            const currentUserEmail = localStorage.getItem('currentUserEmail');
            if (currentUserEmail && (!chatSocket.currentUser || chatSocket.currentUser.email !== currentUserEmail)) {
                const role = localStorage.getItem('userRole') || 'faculty';
                chatSocket.login(currentUserEmail, role);
            }
        } catch (error) {
            console.error("Socket connection error:", error);
        }
    } else {
        console.warn("Chat socket not available - socket-client.js may not be loaded properly");
    }
}

// Update user information
function updateUserInfo() {
    const currentUserEmail = localStorage.getItem('currentUserEmail');
    if (!currentUserEmail) {
        console.warn("No current user email found in localStorage");
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('campusConnectUsers') || '{}');
    const currentUser = users[currentUserEmail];
    
    if (!currentUser) {
        console.warn("Current user not found in localStorage");
        return;
    }
    
    console.log("Updating user info for:", currentUserEmail);
    
    // Update user name
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
        userNameElement.textContent = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim();
    }
    
    // Update user avatar
    if (currentUser.profileImage) {
        const userAvatarElement = document.getElementById('user-avatar');
        if (userAvatarElement) {
            userAvatarElement.src = currentUser.profileImage;
        }
    }
    
    // Update profile fields if on profile section
    const profileInputs = document.querySelectorAll('#profile-section input, #profile-section textarea, #profile-section select');
    if (profileInputs.length > 0) {
        profileInputs.forEach(input => {
            const fieldName = input.id.replace('profile-', '');
            if (fieldName && currentUser[fieldName]) {
                input.value = currentUser[fieldName];
            }
        });
    }
}

// Initialize all features
function initializeFeatures() {
    console.log("Initializing all dashboard features...");
    
    // Initialize faculty chat system
    if (typeof initFacultyChat === 'function') {
        try {
            console.log("Initializing faculty chat system...");
            initFacultyChat();
        } catch (e) {
            console.error("Error initializing faculty chat:", e);
        }
    } else {
        console.warn("Faculty chat initialization function not found");
    }
    
    // Initialize search and filter functionality
    initializeSearchAndFilter();
    
    // Setup logout handler
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof handleLogout === 'function') {
                handleLogout();
            }
            localStorage.removeItem('currentUserEmail');
            window.location.href = 'login.html';
        });
    }
    
    // Initialize any other features as needed
}

// Initialize search and filter functionality
function initializeSearchAndFilter() {
    // Students filter
    const departmentFilter = document.getElementById('department-filter');
    const studentSearch = document.getElementById('student-search');
    
    if (departmentFilter || studentSearch) {
        console.log("Setting up student search and filtering...");
        
        const setupFilter = () => {
            const department = departmentFilter ? departmentFilter.value : 'all';
            const searchText = studentSearch ? studentSearch.value.toLowerCase() : '';
            
            const studentCards = document.querySelectorAll('.student-card');
            studentCards.forEach(card => {
                const studentDept = card.getAttribute('data-department') || '';
                const studentName = card.querySelector('h3') ? card.querySelector('h3').textContent.toLowerCase() : '';
                const studentEmail = card.getAttribute('data-student-email') || '';
                
                const deptMatch = department === 'all' || studentDept === department;
                const searchMatch = !searchText || 
                                  studentName.includes(searchText) || 
                                  studentEmail.includes(searchText);
                
                card.style.display = deptMatch && searchMatch ? 'flex' : 'none';
            });
        };
        
        if (departmentFilter) {
            departmentFilter.addEventListener('change', setupFilter);
        }
        
        if (studentSearch) {
            studentSearch.addEventListener('input', setupFilter);
        }
    }
    
    // Applicants filter
    const departmentFilterApplicants = document.getElementById('department-filter-applicants');
    const statusFilter = document.getElementById('status-filter');
    const applicantSearch = document.getElementById('applicant-search');
    
    if (departmentFilterApplicants || statusFilter || applicantSearch) {
        console.log("Setting up applicant search and filtering...");
        
        const filterApplicants = () => {
            const department = departmentFilterApplicants ? departmentFilterApplicants.value : 'all';
            const status = statusFilter ? statusFilter.value : 'all';
            const searchText = applicantSearch ? applicantSearch.value.toLowerCase() : '';
            
            const applicantCards = document.querySelectorAll('.applicant-card');
            let visibleCount = 0;
            
            applicantCards.forEach(card => {
                const applicantDept = card.getAttribute('data-department') || '';
                const applicantStatus = card.getAttribute('data-status') || '';
                const applicantName = card.querySelector('h3') ? card.querySelector('h3').textContent.toLowerCase() : '';
                
                const departmentMatch = department === 'all' || applicantDept === department;
                const statusMatch = status === 'all' || applicantStatus === status;
                const searchMatch = !searchText || applicantName.includes(searchText);
                
                const isVisible = departmentMatch && statusMatch && searchMatch;
                card.style.display = isVisible ? 'flex' : 'none';
                
                if (isVisible) visibleCount++;
            });
            
            const noApplicantsMessage = document.getElementById('no-applicants-message');
            if (noApplicantsMessage) {
                noApplicantsMessage.style.display = visibleCount === 0 ? 'flex' : 'none';
            }
        };
        
        if (departmentFilterApplicants) {
            departmentFilterApplicants.addEventListener('change', filterApplicants);
        }
        
        if (statusFilter) {
            statusFilter.addEventListener('change', filterApplicants);
        }
        
        if (applicantSearch) {
            applicantSearch.addEventListener('input', filterApplicants);
        }
    }
}

// Fix content display
function fixContentDisplay() {
    // Make sure dashboard is initially visible
    const dashboardSection = document.getElementById('dashboard-section');
    if (dashboardSection) {
        dashboardSection.style.display = 'block';
    }
    
    // Fix any layout issues
    const chatArea = document.getElementById('chat-area');
    if (chatArea) {
        chatArea.style.display = 'none'; // Hide chat area initially until a chat is opened
    }
} 
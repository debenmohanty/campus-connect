// Auth Connector for Faculty Dashboard
// This script ensures proper authentication and connections between login/register and dashboard

// Validate user authentication
function validateAuth() {
    console.log("Validating faculty authentication...");
    
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentUserEmail = localStorage.getItem('currentUserEmail');
    const userRole = localStorage.getItem('userRole') || localStorage.getItem('role');
    
    // Check if user is logged in
    if (isLoggedIn !== 'true' || !currentUserEmail) {
        console.error("Not logged in, redirecting to login page");
        window.location.href = 'login.html';
        return false;
    }
    
    // Check if user data exists
    const users = JSON.parse(localStorage.getItem('campusConnectUsers') || '{}');
    const currentUser = users[currentUserEmail];
    
    if (!currentUser) {
        console.error("User data not found, redirecting to login page");
        window.location.href = 'login.html';
        return false;
    }
    
    // Check if user is faculty
    if (currentUser.userType !== 'faculty' && userRole !== 'faculty') {
        console.error("User is not a faculty member, redirecting to login page");
        alert("You don't have permission to access the faculty dashboard");
        window.location.href = 'login.html';
        return false;
    }
    
    console.log("Faculty authentication valid for:", currentUserEmail);
    return true;
}

// Load user data into the UI
function loadUserData() {
    const currentUserEmail = localStorage.getItem('currentUserEmail');
    if (!currentUserEmail) return false;
    
    const users = JSON.parse(localStorage.getItem('campusConnectUsers') || '{}');
    const currentUser = users[currentUserEmail];
    
    if (!currentUser) return false;
    
    // Update user name in the UI
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
        const fullName = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim();
        userNameElement.textContent = fullName || 'Faculty';
    }
    
    // Update user avatar if available
    if (currentUser.profileImage) {
        const userAvatarElement = document.getElementById('user-avatar');
        if (userAvatarElement) {
            userAvatarElement.src = currentUser.profileImage;
        }
    }
    
    // Store user information for other scripts to use
    window.currentUser = currentUser;
    
    return true;
}

// Handle logout process
function handleLogout() {
    console.log("Handling faculty logout...");
    
    // Clear socket connection if available
    if (typeof chatSocket !== 'undefined' && chatSocket.logout) {
        chatSocket.logout();
    }
    
    // Clear chat interval if exists
    if (window.chatRefreshInterval) {
        clearInterval(window.chatRefreshInterval);
    }
    
    // Clear auth data
    localStorage.removeItem('isLoggedIn');
    localStorage.setItem('userRole', '');
    localStorage.setItem('role', '');
    
    // Keep currentUserEmail in localStorage until next login
    // This helps with debugging
    
    // Redirect to login page
    window.location.href = 'login.html';
}

// Initialize auth connection
function initAuthConnection() {
    console.log("Initializing auth connection...");
    
    // Validate authentication
    if (!validateAuth()) return false;
    
    // Load user data
    loadUserData();
    
    // Setup logout button event listener
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }
    
    return true;
}

// Export functions
window.validateAuth = validateAuth;
window.loadUserData = loadUserData;
window.handleLogout = handleLogout;
window.initAuthConnection = initAuthConnection; 
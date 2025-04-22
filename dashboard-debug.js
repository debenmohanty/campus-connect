// Dashboard Debug Helper
// This script helps diagnose and fix dashboard issues on the fly

// Debug console
const dashDebug = {
    log: function(message) {
        console.log(`[Dashboard Debug] ${message}`);
    },
    error: function(message) {
        console.error(`[Dashboard Debug] ${message}`);
    },
    info: function(message) {
        console.info(`[Dashboard Debug] ${message}`);
    }
};

// Emergency fix function - can be called from console
function fixDashboard() {
    dashDebug.log("Emergency dashboard fix running...");
    
    // Check DOM elements
    const menuItems = document.querySelectorAll('.menu-item');
    const contentSections = document.querySelectorAll('.content-section');
    
    dashDebug.info(`Found ${menuItems.length} menu items and ${contentSections.length} content sections`);
    
    if (menuItems.length === 0) {
        dashDebug.error("No menu items found! DOM may not be loaded properly.");
        return false;
    }
    
    // Reset menu item handlers
    menuItems.forEach(item => {
        const newItem = item.cloneNode(true);
        if (item.parentNode) {
            item.parentNode.replaceChild(newItem, item);
        }
    });
    
    // Get fresh menu items after replacement
    const freshMenuItems = document.querySelectorAll('.menu-item');
    
    // Hide all content sections
    contentSections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Show dashboard by default
    const dashboardSection = document.getElementById('dashboard-section');
    if (dashboardSection) {
        dashboardSection.style.display = 'block';
        dashDebug.log("Dashboard section is now visible");
    } else {
        dashDebug.error("Dashboard section not found!");
    }
    
    // Add fresh event listeners
    freshMenuItems.forEach(item => {
        item.addEventListener('click', function() {
            const contentId = this.getAttribute('data-content');
            dashDebug.log(`Menu item clicked: ${contentId}`);
            
            // Update active class
            freshMenuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // Hide all sections
            contentSections.forEach(section => {
                section.style.display = 'none';
            });
            
            // Show selected section
            const contentToShow = document.getElementById(contentId);
            if (contentToShow) {
                contentToShow.style.display = 'block';
                dashDebug.log(`Content section ${contentId} is now visible`);
            } else {
                dashDebug.error(`Content section ${contentId} not found!`);
            }
        });
    });
    
    // Make first item active if none are
    let activeItem = document.querySelector('.menu-item.active');
    if (!activeItem && freshMenuItems.length > 0) {
        freshMenuItems[0].classList.add('active');
        dashDebug.log("First menu item set as active");
    }
    
    // Fix socket connection
    if (typeof chatSocket !== 'undefined') {
        dashDebug.log("Checking socket connection...");
        if (!chatSocket.socket || !chatSocket.socket.connected) {
            dashDebug.log("Socket not connected, attempting to connect...");
            try {
                chatSocket.init();
                dashDebug.log("Socket connection initialized");
            } catch (e) {
                dashDebug.error(`Socket initialization error: ${e.message}`);
            }
        } else {
            dashDebug.log("Socket already connected");
        }
    } else {
        dashDebug.error("chatSocket is undefined! socket-client.js may not be loaded properly");
    }
    
    // Fix faculty chat
    if (typeof initFacultyChat === 'function') {
        dashDebug.log("Reinitializing faculty chat...");
        try {
            initFacultyChat();
            dashDebug.log("Faculty chat initialized");
        } catch (e) {
            dashDebug.error(`Faculty chat initialization error: ${e.message}`);
        }
    } else {
        dashDebug.error("initFacultyChat function not found! faculty-chat.js may not be loaded properly");
    }
    
    dashDebug.log("Emergency dashboard fix complete");
    return true;
}

// Check dashboard on load
window.addEventListener('load', function() {
    dashDebug.log("Dashboard debug script loaded");
    
    // Check if required scripts are loaded
    const scriptsStatus = {
        "socket-client.js": typeof chatSocket !== 'undefined',
        "faculty-chat.js": typeof initFacultyChat === 'function',
        "fix-dashboard.js": typeof fixNavigationMenu === 'function'
    };
    
    // Log script status
    Object.keys(scriptsStatus).forEach(script => {
        if (scriptsStatus[script]) {
            dashDebug.log(`✓ ${script} loaded`);
        } else {
            dashDebug.error(`✗ ${script} not loaded or not working properly`);
        }
    });
    
    // Create debug button
    createDebugButton();
});

// Create debug button
function createDebugButton() {
    // Only create in development environment
    if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        // Still create but make less visible in production
        const fixBtn = document.createElement('button');
        fixBtn.textContent = 'Fix Dashboard';
        fixBtn.style.position = 'fixed';
        fixBtn.style.bottom = '10px';
        fixBtn.style.left = '10px';
        fixBtn.style.zIndex = '9999';
        fixBtn.style.padding = '5px';
        fixBtn.style.fontSize = '10px';
        fixBtn.style.opacity = '0.5';
        fixBtn.style.backgroundColor = '#4361ee';
        fixBtn.style.color = 'white';
        fixBtn.style.border = 'none';
        fixBtn.style.borderRadius = '4px';
        
        fixBtn.addEventListener('click', function() {
            fixDashboard();
        });
        
        document.body.appendChild(fixBtn);
        
        return;
    }
    
    const fixBtn = document.createElement('button');
    fixBtn.textContent = 'Fix Dashboard';
    fixBtn.style.position = 'fixed';
    fixBtn.style.bottom = '10px';
    fixBtn.style.left = '10px';
    fixBtn.style.zIndex = '9999';
    fixBtn.style.padding = '10px';
    fixBtn.style.backgroundColor = '#4361ee';
    fixBtn.style.color = 'white';
    fixBtn.style.border = 'none';
    fixBtn.style.borderRadius = '4px';
    
    fixBtn.addEventListener('click', function() {
        fixDashboard();
    });
    
    document.body.appendChild(fixBtn);
}

// Make fix function available globally
window.fixDashboard = fixDashboard; 
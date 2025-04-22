// WebSocket Connector for Faculty-Student Chat
// This script ensures proper chat connections between faculty and student dashboards

// Initialize WebSocket connection
function initializeWebSocket() {
    console.log("Initializing WebSocket connection...");
    
    // Check if socket.io client is loaded
    if (typeof io === 'undefined') {
        console.error("Socket.io client not loaded!");
        return false;
    }
    
    // Check if chatSocket is defined in socket-client.js
    if (typeof chatSocket === 'undefined') {
        console.error("chatSocket object not defined! Make sure socket-client.js is loaded properly.");
        return false;
    }
    
    try {
        // Initialize socket connection
        if (chatSocket.init()) {
            console.log("WebSocket connection initialized successfully");
            return true;
        } else {
            console.error("Failed to initialize WebSocket connection");
            return false;
        }
    } catch (error) {
        console.error("Error initializing WebSocket connection:", error);
        return false;
    }
}

// Connect to chat as faculty
function connectAsFaculty() {
    const currentUserEmail = localStorage.getItem('currentUserEmail');
    if (!currentUserEmail) {
        console.error("No user email found in localStorage");
        return false;
    }
    
    // Login to chat socket as faculty
    if (chatSocket.login) {
        try {
            chatSocket.login(currentUserEmail, 'faculty');
            console.log("Faculty connected to chat system:", currentUserEmail);
            return true;
        } catch (error) {
            console.error("Error connecting to chat system:", error);
            return false;
        }
    } else {
        console.error("chatSocket.login method not found!");
        return false;
    }
}

// Get all students for chat
function getAllStudents() {
    const users = JSON.parse(localStorage.getItem('campusConnectUsers') || '{}');
    const students = [];
    
    Object.keys(users).forEach(email => {
        const user = users[email];
        if (user.userType === 'student') {
            students.push({
                email: email,
                name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Student',
                department: user.branch || user.department || 'N/A',
                profileImage: user.profileImage || null
            });
        }
    });
    
    return students;
}

// Check for unread messages from students
function checkUnreadMessages() {
    const currentUserEmail = localStorage.getItem('currentUserEmail');
    if (!currentUserEmail) return { total: 0, students: [] };
    
    const chats = JSON.parse(localStorage.getItem('campusConnectChats') || '{}');
    let totalUnread = 0;
    const unreadByStudent = [];
    
    // Check each chat
    Object.keys(chats).forEach(chatKey => {
        // Check if this chat involves the current faculty
        if (chatKey.includes(currentUserEmail)) {
            const chat = chats[chatKey];
            
            // Get the other participant's email (student)
            const parts = chatKey.split('_');
            const studentEmail = parts[0] === currentUserEmail ? parts[1] : parts[0];
            
            let studentUnreadCount = 0;
            
            // Count unread messages from this student
            if (chat.messages && Array.isArray(chat.messages)) {
                chat.messages.forEach(message => {
                    if (message.sender === studentEmail && !message.read) {
                        totalUnread++;
                        studentUnreadCount++;
                    }
                });
            }
            
            // If student has unread messages, add to list
            if (studentUnreadCount > 0) {
                const users = JSON.parse(localStorage.getItem('campusConnectUsers') || '{}');
                const student = users[studentEmail];
                let studentName = "Student";
                
                if (student) {
                    studentName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || "Student";
                }
                
                unreadByStudent.push({
                    email: studentEmail,
                    name: studentName,
                    count: studentUnreadCount
                });
            }
        }
    });
    
    return {
        total: totalUnread,
        students: unreadByStudent
    };
}

// Update unread message indicators
function updateUnreadIndicators() {
    const unreadInfo = checkUnreadMessages();
    
    // Update unread badge on Messages menu item
    const unreadBadge = document.getElementById('unread-badge');
    if (unreadBadge) {
        if (unreadInfo.total > 0) {
            unreadBadge.textContent = unreadInfo.total;
            unreadBadge.style.display = 'inline-block';
        } else {
            unreadBadge.style.display = 'none';
        }
    }
    
    // Update unread indicators on student list items
    const studentListItems = document.querySelectorAll('.student-item');
    studentListItems.forEach(item => {
        const studentEmail = item.getAttribute('data-student-email');
        if (studentEmail) {
            const unreadIndicator = item.querySelector('.unread-indicator');
            const student = unreadInfo.students.find(s => s.email === studentEmail);
            
            if (student && student.count > 0 && unreadIndicator) {
                unreadIndicator.textContent = student.count;
                unreadIndicator.style.display = 'inline-block';
            } else if (unreadIndicator) {
                unreadIndicator.style.display = 'none';
            }
        }
    });
}

// Initialize the websocket connector
function initWebSocketConnector() {
    console.log("Initializing WebSocket connector...");
    
    // Initialize WebSocket connection
    if (!initializeWebSocket()) {
        console.error("Failed to initialize WebSocket connection");
        return false;
    }
    
    // Connect as faculty
    if (!connectAsFaculty()) {
        console.error("Failed to connect as faculty");
        return false;
    }
    
    // Set up periodic updates
    setInterval(() => {
        updateUnreadIndicators();
    }, 30000); // Check every 30 seconds
    
    // Initial update
    updateUnreadIndicators();
    
    console.log("WebSocket connector initialized successfully");
    return true;
}

// Export functions
window.initWebSocketConnector = initWebSocketConnector;
window.getAllStudents = getAllStudents;
window.checkUnreadMessages = checkUnreadMessages;
window.updateUnreadIndicators = updateUnreadIndicators; 
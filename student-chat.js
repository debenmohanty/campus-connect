// Student Chat System with WebSocket Support

// Global variables
let chatRefreshInterval = null;
let currentChatFaculty = null;

// Initialize chat system
function initStudentChat() {
    console.log("Initializing student chat system");
    
    // Get current user info
    const currentUserEmail = localStorage.getItem('currentUserEmail');
    console.log("Current student email:", currentUserEmail);
    
    if (!currentUserEmail) {
        console.error("No user email found in localStorage! Please log in again.");
        alert("Chat system error: You're not properly logged in. Please log out and log in again.");
        return;
    }
    
    // Create default faculty if none exists
    createDefaultFacultyIfNeeded();
    
    // Setup event listeners
    setupChatEventListeners();
    
    // Initialize Socket.io connection
    initSocketConnection();
    
    // Load faculty members list - force refresh for latest data
    loadFacultyMembers(true);
    
    // Start periodic check for new messages
    startMessageChecking();
    
    // Log localStorage for debugging
    console.log("campusConnectChats in localStorage:", JSON.parse(localStorage.getItem('campusConnectChats') || '{}'));
    console.log("currentUserEmail in localStorage:", localStorage.getItem('currentUserEmail'));
    console.log("userRole in localStorage:", localStorage.getItem('userRole'));
    
    // Create test button for debugging (temporary)
    createTestButton();
}

// Initialize Socket.io connection
function initSocketConnection() {
    // Initialize socket
    if (chatSocket.init()) {
        // Set callbacks
        chatSocket.setCallbacks({
            onNewMessage: handleNewMessage,
            onMessageSent: handleMessageSent,
            onMessagesRead: handleMessagesRead,
            onUserStatusChanged: handleUserStatusChanged
        });
        
        // Login with current user
        const currentUserEmail = localStorage.getItem('currentUserEmail');
        if (currentUserEmail) {
            chatSocket.login(currentUserEmail, 'student');
        }
    } else {
        console.error("Failed to initialize chat socket");
    }
}

// Handle new incoming message
function handleNewMessage(data) {
    console.log("New message received in student chat:", data);
    
    // If chat is open with this faculty, refresh it
    if (currentChatFaculty && data.chatKey.includes(currentChatFaculty.email)) {
        console.log("Refreshing chat with faculty:", currentChatFaculty.email);
        loadChatHistory(currentChatFaculty.email);
        
        // Mark messages as read
        const senderEmail = data.message.sender;
        chatSocket.markMessagesAsRead(senderEmail, data.chatKey);
    } else {
        console.log("Chat not refreshed - currentChatFaculty:", currentChatFaculty);
    }
    
    // Refresh faculty list to show unread count
    loadFacultyMembers();
    
    // Update unread messages badge
    updateUnreadMessagesBadge();
}

// Handle message sent confirmation
function handleMessageSent(data) {
    console.log("Message sent confirmation received:", data);
    
    // If chat is open with this faculty, refresh it
    if (currentChatFaculty && data.chatKey.includes(currentChatFaculty.email)) {
        console.log("Refreshing chat with faculty:", currentChatFaculty.email);
        loadChatHistory(currentChatFaculty.email);
    } else {
        console.log("Chat not refreshed, currentChatFaculty:", currentChatFaculty);
        console.log("data.chatKey:", data.chatKey);
    }
}

// Handle messages read notification
function handleMessagesRead(data) {
    console.log("Messages read by:", data.reader);
    
    // If chat is open with this faculty, refresh it to show read status
    if (currentChatFaculty && data.chatKey.includes(currentChatFaculty.email)) {
        loadChatHistory(currentChatFaculty.email);
    }
    
    // Refresh faculty list to show updated unread count
    loadFacultyMembers();
    
    // Update unread messages badge
    updateUnreadMessagesBadge();
}

// Handle user status changes
function handleUserStatusChanged(data) {
    console.log("User status changed:", data);
    
    // Update UI to show online/offline status
    const facultyItems = document.querySelectorAll(`.faculty-item[data-faculty-email="${data.email}"]`);
    facultyItems.forEach(item => {
        const statusIndicator = item.querySelector('.status-indicator');
        if (statusIndicator) {
            if (data.status === 'online') {
                statusIndicator.classList.add('online');
                statusIndicator.classList.remove('offline');
            } else {
                statusIndicator.classList.add('offline');
                statusIndicator.classList.remove('online');
            }
        }
    });
}

// Setup chat event listeners
function setupChatEventListeners() {
    // Send message button
    const sendButton = document.getElementById('send-message-btn');
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }
    
    // Message input enter key
    const messageInput = document.getElementById('message-input');
    if (messageInput) {
        messageInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                sendMessage();
            }
        });
    }
}

// Start periodic message checking
function startMessageChecking() {
    // Check for unread messages immediately
    updateUnreadMessagesBadge();
    
    // Check for new messages every 30 seconds (less frequent because of WebSocket)
    chatRefreshInterval = setInterval(function() {
        updateUnreadMessagesBadge();
        
        // If there's an active chat, refresh it
        if (currentChatFaculty) {
            refreshActiveChat();
        }
    }, 30000);
}

// Refresh the active chat if it's open
function refreshActiveChat() {
    if (!currentChatFaculty) return;
    
    // Get current scroll position
    const chatHistory = document.getElementById('chat-history');
    if (!chatHistory) return;
    
    const isScrolledToBottom = chatHistory.scrollHeight - chatHistory.clientHeight <= chatHistory.scrollTop + 5;
    
    // Load latest chat messages
    loadChatHistory(currentChatFaculty.email);
    
    // If scrolled to bottom, keep it at bottom after refresh
    if (isScrolledToBottom) {
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
}

// Load faculty members (with option to force refresh)
function loadFacultyMembers(forceRefresh = false) {
    console.log("Loading faculty members", forceRefresh ? "(forced refresh)" : "");
    
    const facultyListContainer = document.getElementById('faculty-list');
    if (!facultyListContainer) return;
    
    // Get users from localStorage - force fresh data with a direct pull
    const users = JSON.parse(localStorage.getItem('campusConnectUsers')) || {};
    console.log("All users:", users);
    
    // Filter faculty members - check for both role and userType patterns
    const facultyMembers = Object.keys(users)
        .filter(email => users[email].role === 'faculty' || users[email].userType === 'faculty')
        .map(email => {
            const user = users[email];
            // Ensure we get all profile data including updated fields
            return {
                email: email,
                name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || "Faculty",
                department: user.department || "Department",
                designation: user.designation || "Faculty Member",
                specialization: user.specialization || "",
                phone: user.phone || "",
                office: user.office || "",
                officeHours: user.officeHours || "",
                profileImage: user.profileImage || user.profilePhoto || "https://via.placeholder.com/50?text=F",
                bio: user.bio || "Faculty member",
                unreadCount: getUnreadMessagesCount(email)
            };
        });
    
    console.log("Filtered faculty members:", facultyMembers);
    
    // Check if there are any faculty members
    if (facultyMembers.length === 0) {
        facultyListContainer.innerHTML = `
            <div class="no-faculty">
                <p>No faculty members available.</p>
            </div>
        `;
        return;
    }
    
    // Create HTML for faculty list
    let facultyListHTML = '';
    
    facultyMembers.forEach(faculty => {
        // Determine if there are unread messages
        const hasUnread = faculty.unreadCount > 0;
        const unreadBadge = hasUnread ? 
            `<span class="unread-badge">${faculty.unreadCount}</span>` : '';
        
        facultyListHTML += `
            <div class="faculty-item ${hasUnread ? 'has-unread' : ''}" data-faculty-email="${faculty.email}" style="display: flex; align-items: center; padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 15px; background-color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <div class="faculty-avatar" style="position: relative; width: 50px; height: 50px; border-radius: 50%; overflow: hidden; margin-right: 15px; cursor: pointer;" onclick="viewFacultyProfile('${faculty.email}')">
                    <img src="${faculty.profileImage}" alt="${faculty.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://via.placeholder.com/50?text=F'" />
                    <span class="status-indicator" style="position: absolute; bottom: 2px; right: 2px; width: 12px; height: 12px; border-radius: 50%; background-color: #cbd5e0; border: 2px solid white;"></span>
                </div>
                <div class="faculty-info" style="flex: 1; min-width: 0; cursor: pointer;" onclick="viewFacultyProfile('${faculty.email}')">
                    <h3 class="faculty-name" style="margin: 0 0 5px; font-size: 1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${faculty.name}</h3>
                    <p class="faculty-department" style="margin: 0; font-size: 0.85rem; color: var(--text-light);">${faculty.department} ${faculty.designation ? ` - ${faculty.designation}` : ''}</p>
                    ${faculty.specialization ? `<p class="faculty-specialization" style="margin: 5px 0 0; font-size: 0.8rem; color: var(--text-light);"><i class="fas fa-star" style="font-size: 0.7rem;"></i> ${faculty.specialization}</p>` : ''}
                </div>
                ${unreadBadge ? `<span class="unread-badge" style="display: inline-block; background-color: var(--danger-color); color: white; border-radius: 50%; width: 24px; height: 24px; text-align: center; line-height: 24px; font-size: 0.8rem; margin-right: 10px;">${faculty.unreadCount}</span>` : ''}
                <button class="start-chat-btn" onclick="startChat('${faculty.email}', '${faculty.name}')" style="background-color: var(--primary-color); color: white; border: none; border-radius: 6px; padding: 8px 12px; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                    <i class="fas fa-comment"></i> Chat
                </button>
            </div>
        `;
    });
    
    // Update the faculty list container
    facultyListContainer.innerHTML = facultyListHTML;
    
    // Update unread messages badge
    updateUnreadMessagesBadge();
}

// Create default faculty if needed
function createDefaultFacultyIfNeeded() {
    const users = JSON.parse(localStorage.getItem('campusConnectUsers')) || {};
    
    // Check if there are any faculty members - check both role and userType patterns
    const hasFaculty = Object.keys(users).some(email => 
        users[email].role === 'faculty' || users[email].userType === 'faculty'
    );
    
    if (!hasFaculty) {
        console.log("No faculty found, creating Deben Mohanty as faculty");
        
        // Create Deben Mohanty as the faculty member
        const debenFaculty = {
            email: "deben.mohanty@campus.edu",
            password: "faculty123", // In a real app, this would be hashed
            firstName: "Deben",
            lastName: "Mohanty",
            role: "faculty",
            userType: "faculty", // Adding both for compatibility
            facultyId: "F12345",
            department: "Computer Science",
            bio: "Experienced faculty member specializing in Computer Science and Career Counseling.",
            dateJoined: new Date().toISOString()
        };
        
        // Add to users
        users["deben.mohanty@campus.edu"] = debenFaculty;
        
        // Save back to localStorage
        localStorage.setItem('campusConnectUsers', JSON.stringify(users));
        
        console.log("Deben Mohanty added as faculty");
    } else {
        console.log("Faculty members already exist, not creating default");
    }
}

// Start chat with faculty
function startChat(facultyEmail, facultyName) {
    console.log("Starting chat with faculty:", facultyEmail);
    
    // Set current chat faculty
    currentChatFaculty = {
        email: facultyEmail,
        name: facultyName
    };
    
    // Update chat header
    const chatHeader = document.getElementById('chat-with-faculty');
    if (chatHeader) {
        chatHeader.textContent = `Chat with ${facultyName}`;
    }
    
    // Show chat area
    const chatArea = document.getElementById('chat-area');
    if (chatArea) {
        chatArea.style.display = 'flex';
        console.log("Chat area display style set to: flex");
    } else {
        console.error("Chat area element not found");
    }
    
    // Load chat history
    loadChatHistory(facultyEmail);
    
    // Set focus on message input
    const messageInput = document.getElementById('message-input');
    if (messageInput) {
        messageInput.focus();
    }
}

// Load chat history
function loadChatHistory(facultyEmail) {
    console.log("Loading chat history with:", facultyEmail);
    
    const chatHistory = document.getElementById('chat-history');
    if (!chatHistory) {
        console.error("Chat history element not found");
        return;
    }
    
    const studentEmail = localStorage.getItem('currentUserEmail');
    if (!studentEmail) {
        console.error("No current user email found in localStorage");
        return;
    }
    
    // Get chat history from socket client
    let chatMessages = chatSocket.getChatHistory(facultyEmail);
    console.log("Retrieved chat messages:", chatMessages);
    
    if (chatMessages.length === 0) {
        console.log("No messages in chat history");
        chatHistory.innerHTML = '<p style="text-align: center; padding: 20px; color: var(--text-light);">No messages yet. Start the conversation!</p>';
        return;
    }
    
    // Sort messages by timestamp
    chatMessages.sort((a, b) => {
        return new Date(a.timestamp) - new Date(b.timestamp);
    });
    
    // Display messages
    let messagesHTML = '';
    
    chatMessages.forEach(message => {
        const isCurrentUser = message.sender === studentEmail;
        const messageClass = isCurrentUser ? 'sent' : 'received';
        const alignClass = isCurrentUser ? 'message-right' : 'message-left';
        const readStatus = message.read ? 'read' : 'unread';
        
        const formattedTime = formatDate(message.timestamp);
        
        messagesHTML += `
            <div class="message ${messageClass} ${alignClass} ${readStatus}">
                <div class="message-bubble">
                    <div class="message-content">
                        <p>${message.text}</p>
                        <span class="message-time">${formattedTime}</span>
                        ${isCurrentUser ? `<span class="read-status">${message.read ? 'Read' : 'Sent'}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    });
    
    chatHistory.innerHTML = messagesHTML;
    
    // Scroll to bottom
    chatHistory.scrollTop = chatHistory.scrollHeight;
    
    // Mark messages as read
    markMessagesAsRead(facultyEmail);
    
    console.log("Finished loading chat history with faculty: " + facultyEmail);
}

// Mark messages as read
function markMessagesAsRead(facultyEmail) {
    const studentEmail = localStorage.getItem('currentUserEmail');
    if (!studentEmail) return;
    
    // Get chats from localStorage
    const chats = JSON.parse(localStorage.getItem('campusConnectChats')) || {};
    
    // Check both possible key formats
    const primaryKey = `${facultyEmail}_${studentEmail}`;
    const alternateKey = `${studentEmail}_${facultyEmail}`;
    
    let chatKey = null;
    
    // Determine which key exists
    if (chats[primaryKey]) {
        chatKey = primaryKey;
    } else if (chats[alternateKey]) {
        chatKey = alternateKey;
    }
    
    if (chatKey) {
        // Use socket to mark messages as read
        chatSocket.markMessagesAsRead(facultyEmail, chatKey);
        
        // Update unread message count in the faculty list
        loadFacultyMembers();
        
        // Update unread messages badge
        updateUnreadMessagesBadge();
    }
}

// Send message to faculty
function sendMessage() {
    console.log("sendMessage function called");
    
    if (!currentChatFaculty) {
        console.error("No faculty selected for chat");
        return;
    }
    
    console.log("Current chat faculty:", currentChatFaculty);
    
    const messageInput = document.getElementById('message-input');
    if (!messageInput) {
        console.error("Message input element not found");
        return;
    }
    
    const messageText = messageInput.value.trim();
    if (!messageText) {
        console.error("No message text entered");
        return;
    }
    
    console.log("Sending message to faculty:", currentChatFaculty.email, "Message:", messageText);
    
    // Send message via socket
    const result = chatSocket.sendMessage(currentChatFaculty.email, messageText);
    console.log("Message send result:", result);
    
    // Force refresh chat history to show the message immediately
    setTimeout(() => {
        loadChatHistory(currentChatFaculty.email);
    }, 100);
    
    // Clear input
    messageInput.value = '';
    
    // Focus on input for next message
    messageInput.focus();
    
    console.log("Message sent to faculty:", currentChatFaculty.email);
}

// Get unread messages count for a specific faculty
function getUnreadMessagesCount(facultyEmail) {
    const studentEmail = localStorage.getItem('currentUserEmail');
    if (!studentEmail) return 0;
    
    const chats = JSON.parse(localStorage.getItem('campusConnectChats')) || {};
    
    // Check both possible key formats
    const primaryKey = `${facultyEmail}_${studentEmail}`;
    const alternateKey = `${studentEmail}_${facultyEmail}`;
    
    let unreadCount = 0;
    
    // Check primary key
    if (chats[primaryKey] && chats[primaryKey].messages) {
        unreadCount += chats[primaryKey].messages.filter(msg => 
            msg.sender === facultyEmail && !msg.read
        ).length;
    }
    
    // Check alternate key
    if (chats[alternateKey] && chats[alternateKey].messages) {
        unreadCount += chats[alternateKey].messages.filter(msg => 
            msg.sender === facultyEmail && !msg.read
        ).length;
    }
    
    return unreadCount;
}

// Get total unread messages count across all faculty
function getTotalUnreadMessagesCount() {
    const studentEmail = localStorage.getItem('currentUserEmail');
    if (!studentEmail) return 0;
    
    const chats = JSON.parse(localStorage.getItem('campusConnectChats')) || {};
    let totalUnread = 0;
    
    // Check all chats for unread messages
    Object.keys(chats).forEach(chatKey => {
        // Check if this chat involves the current student
        if (chatKey.includes(studentEmail)) {
            const parts = chatKey.split('_');
            const otherParticipant = parts[0] === studentEmail ? parts[1] : parts[0];
            
            // Only count if other participant is not the student
            if (otherParticipant !== studentEmail) {
                // Count unread messages from the other participant
                totalUnread += chats[chatKey].messages.filter(msg => 
                    msg.sender === otherParticipant && !msg.read
                ).length;
            }
        }
    });
    
    return totalUnread;
}

// Format date for chat messages
function formatDate(dateString) {
    const date = new Date(dateString);
    
    // For today, show only time
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // For yesterday, show "Yesterday" and time
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
        return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // For older dates, show date and time
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

// Update unread messages badge in the sidebar
function updateUnreadMessagesBadge() {
    const unreadCount = getTotalUnreadMessagesCount();
    
    // Update badge in sidebar if it exists
    const messageBadge = document.querySelector('.sidebar-badge[data-section="messages"]');
    if (messageBadge) {
        if (unreadCount > 0) {
            messageBadge.textContent = unreadCount;
            messageBadge.style.display = 'block';
        } else {
            messageBadge.style.display = 'none';
        }
    }
    
    // Update any other UI elements that need to show unread count
    const unreadBadges = document.querySelectorAll('.unread-messages-count');
    unreadBadges.forEach(badge => {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
    });
}

// Handle logout
function handleLogout() {
    // Logout from socket
    chatSocket.logout();
}

// Initialize chat system when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize chat system
    initStudentChat();
});

// Export functions for global access
window.startChat = startChat;
window.sendMessage = sendMessage;
window.loadFacultyMembers = loadFacultyMembers;
window.viewFacultyProfile = viewFacultyProfile;
window.updateUnreadMessagesBadge = updateUnreadMessagesBadge;
window.handleLogout = handleLogout;

// Create test button for debugging
function createTestButton() {
    // Only create in development environment
    if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        return;
    }
    
    const testBtn = document.createElement('button');
    testBtn.textContent = 'Test Chat Connection';
    testBtn.style.position = 'fixed';
    testBtn.style.bottom = '10px';
    testBtn.style.right = '10px';
    testBtn.style.zIndex = '9999';
    testBtn.style.padding = '10px';
    testBtn.style.backgroundColor = '#ff5722';
    testBtn.style.color = 'white';
    testBtn.style.border = 'none';
    testBtn.style.borderRadius = '4px';
    
    testBtn.addEventListener('click', function() {
        const studentEmail = localStorage.getItem('currentUserEmail');
        const facultyEmails = Object.keys(JSON.parse(localStorage.getItem('campusConnectUsers') || '{}')).filter(
            email => {
                const user = JSON.parse(localStorage.getItem('campusConnectUsers'))[email];
                return user.userType === 'faculty' || user.role === 'faculty';
            }
        );
        
        if (facultyEmails.length > 0) {
            // Use the first faculty email for testing
            const facultyEmail = facultyEmails[0];
            
            // Update localStorage directly to ensure the message appears
            const chatKey = `${studentEmail}_${facultyEmail}`;
            const chats = JSON.parse(localStorage.getItem('campusConnectChats') || '{}');
            
            if (!chats[chatKey]) {
                chats[chatKey] = { messages: [] };
            }
            
            // Add test message
            const testMessage = {
                sender: studentEmail,
                text: "Test message from student at " + new Date().toLocaleTimeString(),
                timestamp: new Date().toISOString(),
                read: false
            };
            
            chats[chatKey].messages.push(testMessage);
            localStorage.setItem('campusConnectChats', JSON.stringify(chats));
            
            // Try to send via socket too
            chatSocket.sendMessage(facultyEmail, testMessage.text);
            
            alert(`Test message sent to faculty: ${facultyEmail}`);
            
            // If we already have a chat open with this faculty
            if (currentChatFaculty && currentChatFaculty.email === facultyEmail) {
                loadChatHistory(facultyEmail);
            }
        } else {
            alert('No faculty users found. Please create a faculty account first.');
        }
    });
    
    document.body.appendChild(testBtn);
}

// View faculty profile 
function viewFacultyProfile(facultyEmail) {
    console.log("Viewing faculty profile:", facultyEmail);
    
    // Get faculty data from localStorage
    const users = JSON.parse(localStorage.getItem('campusConnectUsers')) || {};
    const faculty = users[facultyEmail];
    
    if (!faculty) {
        alert("Faculty information not found");
        return;
    }
    
    // Create modal for faculty profile
    const modalHTML = `
    <div id="faculty-profile-modal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.5); z-index: 9999; display: flex; justify-content: center; align-items: center;">
        <div style="background-color: white; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto; border-radius: 8px; padding: 20px; position: relative;">
            <button id="close-faculty-modal" style="position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
            
            <div style="display: flex; margin-bottom: 20px; align-items: center;">
                <div style="width: 100px; height: 100px; border-radius: 50%; overflow: hidden; margin-right: 20px;">
                    <img src="${faculty.profileImage || faculty.profilePhoto || 'https://via.placeholder.com/100?text=F'}" 
                         style="width: 100%; height: 100%; object-fit: cover;"
                         onerror="this.src='https://via.placeholder.com/100?text=F'">
                </div>
                <div>
                    <h2 style="margin: 0 0 5px; color: var(--primary-color);">${faculty.name || `${faculty.firstName || ''} ${faculty.lastName || ''}`.trim() || 'Faculty'}</h2>
                    <p style="margin: 0 0 5px; color: var(--text-light);">${faculty.designation || 'Faculty Member'}</p>
                    <p style="margin: 0; color: var(--text-light);">${faculty.department || 'Department'}</p>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: var(--primary-color); border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Contact Information</h3>
                <p><strong>Email:</strong> ${facultyEmail}</p>
                ${faculty.phone ? `<p><strong>Phone:</strong> ${faculty.phone}</p>` : ''}
                ${faculty.office ? `<p><strong>Office:</strong> ${faculty.office}</p>` : ''}
                ${faculty.officeHours ? `<p><strong>Office Hours:</strong> ${faculty.officeHours}</p>` : ''}
            </div>
            
            ${faculty.specialization ? `
            <div style="margin-bottom: 20px;">
                <h3 style="color: var(--primary-color); border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Specialization</h3>
                <p>${faculty.specialization}</p>
            </div>
            ` : ''}
            
            ${faculty.bio ? `
            <div style="margin-bottom: 20px;">
                <h3 style="color: var(--primary-color); border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">About</h3>
                <p>${faculty.bio}</p>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin-top: 20px;">
                <button onclick="startChat('${facultyEmail}', '${faculty.name || `${faculty.firstName || ''} ${faculty.lastName || ''}`.trim() || 'Faculty'}')" 
                        style="background-color: var(--primary-color); color: white; border: none; border-radius: 6px; padding: 10px 15px; cursor: pointer;">
                    <i class="fas fa-comment"></i> Start Chat
                </button>
            </div>
        </div>
    </div>
    `;
    
    // Add modal to body
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
    
    // Add event listener to close button
    document.getElementById('close-faculty-modal').addEventListener('click', function() {
        document.body.removeChild(modalContainer);
    });
} 
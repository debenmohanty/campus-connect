// Faculty Chat System with WebSocket Support

// Global variables
let chatRefreshInterval = null;
let currentChatStudent = null;

// Initialize chat system
function initFacultyChat() {
    console.log("Initializing faculty chat system");
    
    // Get current user info
    const currentUserEmail = localStorage.getItem('currentUserEmail');
    console.log("Current faculty email:", currentUserEmail);
    
    if (!currentUserEmail) {
        console.error("No user email found in localStorage! Please log in again.");
        alert("Chat system error: You're not properly logged in. Please log out and log in again.");
        return;
    }
    
    // Setup event listeners
    setupChatEventListeners();
    
    // Initialize Socket.io connection
    initSocketConnection();
    
    // Start periodic check for new messages
    startMessageChecking();
    
    // Load any unread messages
    checkUnreadMessages();
    
    // Update UI elements
    updateUIElements();
    
    // Log localStorage for debugging
    console.log("campusConnectChats in localStorage:", JSON.parse(localStorage.getItem('campusConnectChats') || '{}'));
    console.log("currentUserEmail in localStorage:", localStorage.getItem('currentUserEmail'));
    console.log("userRole in localStorage:", localStorage.getItem('userRole'));
    
    // Create test button for debugging (temporary)
    createTestButton();
}

// Update UI elements
function updateUIElements() {
    // Update user name and avatar
    const users = JSON.parse(localStorage.getItem('campusConnectUsers') || '{}');
    const currentUserEmail = localStorage.getItem('currentUserEmail');
    
    if (currentUserEmail && users[currentUserEmail]) {
        const currentUser = users[currentUserEmail];
        
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
    }
    
    // Show current tab
    const menuItems = document.querySelectorAll('.menu-item');
    const contentSections = document.querySelectorAll('.content-section');
    
    // Make sure dashboard is visible by default
    const dashboardSection = document.getElementById('dashboard-section');
    if (dashboardSection) {
        dashboardSection.style.display = 'block';
    }
    
    // Make sure first menu item is active
    if (menuItems.length > 0) {
        menuItems[0].classList.add('active');
    }
}

// Initialize Socket.io connection
function initSocketConnection() {
    // Initialize socket
    if (typeof chatSocket !== 'undefined' && chatSocket.init) {
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
                chatSocket.login(currentUserEmail, 'faculty');
            }
            
            return true;
        } else {
            console.error("Failed to initialize chat socket");
            return false;
        }
    } else {
        console.error("chatSocket not defined or missing init method");
        return false;
    }
}

// Handle new incoming message
function handleNewMessage(data) {
    console.log("New message received in faculty chat:", data);
    
    // If chat is open with this student, refresh it
    if (currentChatStudent && data.chatKey.includes(currentChatStudent.email)) {
        console.log("Refreshing chat with student:", currentChatStudent.email);
        loadChatHistory(currentChatStudent.email);
        
        // Mark messages as read
        const senderEmail = data.message.sender;
        chatSocket.markMessagesAsRead(senderEmail, data.chatKey);
    } else {
        console.log("Chat not refreshed - currentChatStudent:", currentChatStudent);
        if (data.chatKey) {
            console.log("data.chatKey:", data.chatKey);
        }
    }
    
    // Check for unread messages to update UI
    checkUnreadMessages();
}

// Handle message sent confirmation
function handleMessageSent(data) {
    console.log("Message sent confirmation received in faculty chat:", data);
    
    // Refresh chat history if needed
    if (currentChatStudent && data.chatKey.includes(currentChatStudent.email)) {
        console.log("Refreshing chat with student after message sent:", currentChatStudent.email);
        loadChatHistory(currentChatStudent.email);
    } else {
        console.log("Chat not refreshed after message sent - currentChatStudent:", currentChatStudent);
        if (data.chatKey) {
            console.log("data.chatKey:", data.chatKey);
        }
    }
}

// Handle messages read notification
function handleMessagesRead(data) {
    console.log("Messages read by:", data.reader);
    
    // If chat is open with this student, refresh it to show read status
    if (currentChatStudent && data.chatKey.includes(currentChatStudent.email)) {
        loadChatHistory(currentChatStudent.email);
    }
}

// Handle user status changes
function handleUserStatusChanged(data) {
    console.log("User status changed:", data);
    
    // Update UI to show online/offline status
    const studentCards = document.querySelectorAll(`.student-card[data-student-email="${data.email}"]`);
    studentCards.forEach(card => {
        const statusIndicator = card.querySelector('.status-indicator');
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
    const sendMessageBtn = document.getElementById('send-message-btn');
    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', sendMessage);
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
    
    // Save notes button
    const saveNotesBtn = document.getElementById('save-notes-btn');
    if (saveNotesBtn) {
        saveNotesBtn.addEventListener('click', saveFacultyNotes);
    }
    
    // View messages button
    const viewMessagesBtn = document.getElementById('view-messages-btn');
    if (viewMessagesBtn) {
        viewMessagesBtn.addEventListener('click', loadUnreadMessages);
    }
}

// Start periodic message checking
function startMessageChecking() {
    // Check for unread messages immediately
    checkUnreadMessages();
    
    // Check for new messages every 30 seconds (less frequent because of WebSocket)
    chatRefreshInterval = setInterval(function() {
        checkUnreadMessages();
    }, 30000);
}

// Refresh the active chat if it's open
function refreshActiveChat() {
    if (!currentChatStudent) return;
    
    // Get current scroll position
    const chatHistory = document.getElementById('chat-history');
    if (!chatHistory) return;
    
    const isScrolledToBottom = chatHistory.scrollHeight - chatHistory.clientHeight <= chatHistory.scrollTop + 5;
    
    // Load latest chat history
    loadChatHistory(currentChatStudent.email);
    
    // If was scrolled to bottom, keep it at bottom
    if (isScrolledToBottom) {
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
}

// Open chat with student
function openChatWithStudent(studentEmail, studentName) {
    console.log("Opening chat with student:", studentEmail);
    
    // Validate student email
    if (!studentEmail) {
        console.error("Student email is required");
        return;
    }
    
    // Get student info if name not provided
    if (!studentName) {
        const users = JSON.parse(localStorage.getItem('campusConnectUsers')) || {};
        const student = users[studentEmail];
        
        if (student) {
            studentName = `${student.firstName || ''} ${student.lastName || ''}`.trim();
            if (!studentName) {
                studentName = "Student";
            }
        } else {
            studentName = "Student";
        }
    }
    
    // Store current student email for messaging
    currentChatStudent = {
        email: studentEmail,
        name: studentName
    };
    
    // Update chat heading
    const chatHeading = document.getElementById('chat-with-student');
    if (chatHeading) {
        chatHeading.textContent = `Chat with ${studentName}`;
    }
    
    // Show chat area
    const chatArea = document.getElementById('chat-area');
    if (chatArea) {
        chatArea.style.display = 'flex'; // Changed from 'block' to 'flex'
        chatArea.setAttribute('data-chat-with', studentEmail);
        console.log("Chat area display style set to: flex");
    } else {
        console.error("Chat area element not found");
    }
    
    // Load chat history
    loadChatHistory(studentEmail);
    
    // Load faculty notes
    loadFacultyNotes(studentEmail);
    
    // Focus on message input
    const messageInput = document.getElementById('message-input');
    if (messageInput) {
        messageInput.focus();
    }
    
    // Mark messages as read
    markMessagesAsRead(studentEmail);
}

// Load chat history
function loadChatHistory(studentEmail) {
    console.log("Loading chat history with student:", studentEmail);
    
    const chatHistory = document.getElementById('chat-history');
    if (!chatHistory) {
        console.error("Chat history element not found");
        return;
    }
    
    const facultyEmail = localStorage.getItem('currentUserEmail');
    if (!facultyEmail) {
        console.error("No current user email found in localStorage");
        return;
    }
    
    // Get chat history from socket client
    let chatMessages = chatSocket.getChatHistory(studentEmail);
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
        const isCurrentUser = message.sender === facultyEmail;
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
    markMessagesAsRead(studentEmail);
    
    console.log("Finished loading chat history with student: " + studentEmail);
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

// Mark messages as read
function markMessagesAsRead(studentEmail) {
    const facultyEmail = localStorage.getItem('currentUserEmail');
    if (!facultyEmail) return;
    
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
        chatSocket.markMessagesAsRead(studentEmail, chatKey);
    }
}

// Send message
function sendMessage() {
    console.log("sendMessage function called in faculty chat");
    
    if (!currentChatStudent) {
        console.error("No student selected for chat");
        return;
    }
    
    console.log("Current chat student:", currentChatStudent);
    
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
    
    console.log("Sending message to student:", currentChatStudent.email, "Message:", messageText);
    
    // Send message via socket
    const result = chatSocket.sendMessage(currentChatStudent.email, messageText);
    console.log("Message send result:", result);
    
    // Force refresh chat history to show the message immediately
    setTimeout(() => {
        loadChatHistory(currentChatStudent.email);
    }, 100);
    
    // Clear input
    messageInput.value = '';
    
    // Focus on input for next message
    messageInput.focus();
    
    console.log("Message sent to student:", currentChatStudent.email);
}

// Load faculty notes
function loadFacultyNotes(studentEmail) {
    const notesTextarea = document.getElementById('faculty-notes-area');
    if (!notesTextarea) return;
    
    const facultyEmail = localStorage.getItem('currentUserEmail');
    if (!facultyEmail) return;
    
    const notesKey = `faculty_notes_${facultyEmail}_${studentEmail}`;
    const notes = localStorage.getItem(notesKey) || '';
    
    notesTextarea.value = notes;
}

// Save faculty notes
function saveFacultyNotes() {
    if (!currentChatStudent) return;
    
    const notesTextarea = document.getElementById('faculty-notes-area');
    if (!notesTextarea) return;
    
    const facultyEmail = localStorage.getItem('currentUserEmail');
    if (!facultyEmail) return;
    
    const notes = notesTextarea.value.trim();
    const notesKey = `faculty_notes_${facultyEmail}_${currentChatStudent.email}`;
    
    // Save notes to localStorage
    localStorage.setItem(notesKey, notes);
    
    // Show feedback
    alert('Notes saved successfully');
}

// Check for unread messages
function checkUnreadMessages() {
    const facultyEmail = localStorage.getItem('currentUserEmail');
    if (!facultyEmail) return;
    
    const chats = JSON.parse(localStorage.getItem('campusConnectChats')) || {};
    let unreadMessages = 0;
    let unreadStudents = [];
    
    // Check each chat
    Object.keys(chats).forEach(chatKey => {
        // Check if this chat involves the current faculty
        if (chatKey.includes(facultyEmail)) {
            const chat = chats[chatKey];
            
            // Get the other participant's email
            const parts = chatKey.split('_');
            const studentEmail = parts[0] === facultyEmail ? parts[1] : parts[0];
            
            let studentUnreadCount = 0;
            
            // Count unread messages from this student
            if (chat.messages && Array.isArray(chat.messages)) {
                chat.messages.forEach(message => {
                    if (message.sender === studentEmail && !message.read) {
                        unreadMessages++;
                        studentUnreadCount++;
                    }
                });
            }
            
            // If this student has unread messages, add to list
            if (studentUnreadCount > 0) {
                // Get student name
                const users = JSON.parse(localStorage.getItem('campusConnectUsers')) || {};
                const student = users[studentEmail];
                let studentName = "Student";
                
                if (student) {
                    studentName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || "Student";
                }
                
                unreadStudents.push({
                    email: studentEmail,
                    name: studentName,
                    count: studentUnreadCount
                });
            }
        }
    });
    
    // Update unread message count badge
    const unreadCountElement = document.getElementById('unread-message-count');
    if (unreadCountElement) {
        if (unreadMessages > 0) {
            unreadCountElement.textContent = `${unreadMessages} unread message${unreadMessages > 1 ? 's' : ''}`;
        } else {
            unreadCountElement.textContent = "No unread messages";
        }
    }
    
    // Update message center alert
    const messageCenterAlert = document.getElementById('message-center-alert');
    const unreadCountBadge = document.getElementById('unread-message-count-badge');
    
    if (messageCenterAlert && unreadCountBadge) {
        if (unreadMessages > 0) {
            unreadCountBadge.textContent = unreadMessages;
            messageCenterAlert.style.display = 'flex';
        } else {
            messageCenterAlert.style.display = 'none';
        }
    }
    
    // Highlight students with unread messages
    highlightStudentsWithUnreadMessages(unreadStudents);
    
    return { count: unreadMessages, students: unreadStudents };
}

// Highlight students with unread messages in the list
function highlightStudentsWithUnreadMessages(unreadStudents) {
    // Get all student cards
    const studentCards = document.querySelectorAll('.student-card');
    
    // Remove highlights
    studentCards.forEach(card => {
        card.classList.remove('has-unread');
        
        // Remove existing unread indicators
        const indicator = card.querySelector('.unread-message-indicator');
        if (indicator) {
            indicator.remove();
        }
    });
    
    // Add highlights to students with unread messages
    unreadStudents.forEach(student => {
        const card = document.querySelector(`.student-card[data-student-email="${student.email}"]`);
        if (card) {
            // Add highlight class
            card.classList.add('has-unread');
            
            // Add unread count indicator
            const actionsContainer = card.querySelector('.student-actions');
            if (actionsContainer) {
                const indicator = document.createElement('span');
                indicator.className = 'unread-message-indicator';
                indicator.textContent = student.count;
                
                // Insert at the beginning of actions container
                actionsContainer.insertBefore(indicator, actionsContainer.firstChild);
            }
        }
    });
}

// Load unread messages
function loadUnreadMessages() {
    const result = checkUnreadMessages();
    const unreadStudents = result.students;
    
    if (unreadStudents.length === 0) {
        alert('No unread messages at the moment.');
        return;
    }
    
    // If there are unread messages, show alert
    if (unreadStudents.length > 0) {
        if (unreadStudents.length === 1) {
            // If only one student has unread messages, open chat directly
            openChatWithStudent(unreadStudents[0].email, unreadStudents[0].name);
        } else {
            // If multiple students have unread messages, list them
            let html = '<div style="max-height: 300px; overflow-y: auto;">';
            
            unreadStudents.forEach(student => {
                html += `
                    <div style="padding: 10px; border-bottom: 1px solid #eee; cursor: pointer;" 
                         onclick="openChatWithStudent('${student.email}', '${student.name}')">
                        <strong>${student.name}</strong>
                        <br>
                        <small>${student.email}</small>
                        <span style="float: right; background-color: var(--danger-color); color: white; padding: 2px 8px; border-radius: 10px;">${student.count}</span>
                    </div>
                `;
            });
            
            html += '</div>';
            
            // Show dialog with student list
            alert('Please select a student to view their messages: \n\n' + 
                  unreadStudents.map(s => `${s.name} (${s.count})`).join('\n'));
            
            // For simplicity in this implementation, open the first student's chat
            openChatWithStudent(unreadStudents[0].email, unreadStudents[0].name);
        }
    } else {
        alert('No unread messages at the moment.');
    }
}

// Handle logout
function handleLogout() {
    // Logout from socket
    chatSocket.logout();
}

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
    testBtn.style.backgroundColor = '#4361ee';
    testBtn.style.color = 'white';
    testBtn.style.border = 'none';
    testBtn.style.borderRadius = '4px';
    
    testBtn.addEventListener('click', function() {
        const facultyEmail = localStorage.getItem('currentUserEmail');
        const studentEmails = Object.keys(JSON.parse(localStorage.getItem('campusConnectUsers') || '{}')).filter(
            email => {
                const user = JSON.parse(localStorage.getItem('campusConnectUsers'))[email];
                return user.userType === 'student' || user.role === 'student';
            }
        );
        
        if (studentEmails.length > 0) {
            // Use the first student email for testing
            const studentEmail = studentEmails[0];
            
            // Update localStorage directly to ensure the message appears
            const chatKey = `${facultyEmail}_${studentEmail}`;
            const chats = JSON.parse(localStorage.getItem('campusConnectChats') || '{}');
            
            if (!chats[chatKey]) {
                chats[chatKey] = { messages: [] };
            }
            
            // Add test message
            const testMessage = {
                sender: facultyEmail,
                text: "Test message from faculty at " + new Date().toLocaleTimeString(),
                timestamp: new Date().toISOString(),
                read: false
            };
            
            chats[chatKey].messages.push(testMessage);
            localStorage.setItem('campusConnectChats', JSON.stringify(chats));
            
            // Try to send via socket too
            chatSocket.sendMessage(studentEmail, testMessage.text);
            
            alert(`Test message sent to student: ${studentEmail}`);
            
            // If we already have a chat open with this student
            if (currentChatStudent && currentChatStudent.email === studentEmail) {
                loadChatHistory(studentEmail);
            } else {
                // Open chat with this student
                const users = JSON.parse(localStorage.getItem('campusConnectUsers') || '{}');
                const student = users[studentEmail];
                let studentName = "Student";
                
                if (student) {
                    studentName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || "Student";
                }
                
                openChatWithStudent(studentEmail, studentName);
            }
        } else {
            alert('No student users found. Please create a student account first.');
        }
    });
    
    document.body.appendChild(testBtn);
}

// Load faculty details
function updateFacultyDetails() {
    // Get current faculty data from localStorage
    const currentUserEmail = localStorage.getItem('currentUserEmail');
    const users = JSON.parse(localStorage.getItem('campusConnectUsers'));
    
    if (currentUserEmail && users && users[currentUserEmail]) {
        const faculty = users[currentUserEmail];
        
        // Update UI elements with faculty info
        const facultyName = document.getElementById('faculty-name');
        if (facultyName) {
            facultyName.textContent = faculty.name || 
                `${faculty.firstName || ''} ${faculty.lastName || ''}`.trim() || 
                'Faculty';
        }
        
        // Update profile info if on profile page
        const profileName = document.getElementById('profile-name');
        if (profileName) {
            profileName.textContent = faculty.name || 
                `${faculty.firstName || ''} ${faculty.lastName || ''}`.trim() || 
                'Faculty';
        }
        
        const profileEmail = document.getElementById('profile-email');
        if (profileEmail) {
            profileEmail.textContent = currentUserEmail;
        }
        
        // Ensure data is up to date for all systems
        if (localStorage.getItem('lastFacultyUpdate') !== new Date().toDateString()) {
            localStorage.setItem('lastFacultyUpdate', new Date().toDateString());
            console.log('Faculty data refreshed for all systems:', faculty);
        }
    }
}

// Export functions for global access
window.initFacultyChat = initFacultyChat;
window.openChatWithStudent = openChatWithStudent;
window.sendMessage = sendMessage;
window.saveFacultyNotes = saveFacultyNotes;
window.loadUnreadMessages = loadUnreadMessages;
window.handleLogout = handleLogout; 
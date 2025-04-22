// Socket.io client for Campus Connect Chat System
const chatSocket = {
    socket: null,
    serverUrl: 'http://localhost:3000',
    currentUser: null,
    chatCallbacks: {
        onNewMessage: null,
        onMessageSent: null,
        onMessagesRead: null,
        onUserStatusChanged: null
    },
    connectionAttempts: 0,
    maxReconnectAttempts: 5,

    // Initialize the socket connection
    init: function() {
        // Check if Socket.io client script is loaded
        if (typeof io === 'undefined') {
            console.error('Socket.io client not loaded. Please include the socket.io client script.');
            return false;
        }

        try {
            // Check if we already have a connection
            if (this.socket && this.socket.connected) {
                console.log('Socket already connected');
                return true;
            }
            
            // Connect to the server
            console.log('Attempting to connect to chat server at:', this.serverUrl);
            
            // Create socket with reconnection options
            this.socket = io(this.serverUrl, {
                reconnection: true,
                reconnectionAttempts: this.maxReconnectAttempts,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                timeout: 20000,
                autoConnect: true
            });
            
            // Set up event listeners
            this.setupEventListeners();
            console.log('Socket initialized');
            
            // Auto-login if we have user info in localStorage
            this.autoLogin();
            
            // Reset connection attempts
            this.connectionAttempts = 0;
            
            return true;
        } catch (error) {
            console.error('Error initializing socket:', error);
            this.connectionAttempts++;
            
            // Try to reconnect if under max attempts
            if (this.connectionAttempts < this.maxReconnectAttempts) {
                console.log(`Reconnection attempt ${this.connectionAttempts} of ${this.maxReconnectAttempts}...`);
                setTimeout(() => this.init(), 2000);
            }
            
            return false;
        }
    },
    
    // Auto-login using localStorage data
    autoLogin: function() {
        const email = localStorage.getItem('currentUserEmail');
        const role = localStorage.getItem('userRole') || localStorage.getItem('role');
        
        if (email && role) {
            console.log('Auto-logging in with:', email, role);
            this.login(email, role);
        } else {
            console.warn('No user info found in localStorage for auto-login');
        }
    },

    // Set up socket event listeners
    setupEventListeners: function() {
        if (!this.socket) return;

        // Connection events
        this.socket.on('connect', () => {
            console.log('Connected to chat server with socket ID:', this.socket.id);
            
            // If there's a logged in user, send login event
            if (this.currentUser) {
                this.login(this.currentUser.email, this.currentUser.role);
            }
            
            // Reset connection attempts
            this.connectionAttempts = 0;
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from chat server');
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            
            // Increment connection attempts
            this.connectionAttempts++;
            
            // Try to reconnect if under max attempts
            if (this.connectionAttempts < this.maxReconnectAttempts) {
                console.log(`Connection error. Reconnection attempt ${this.connectionAttempts} of ${this.maxReconnectAttempts}...`);
            }
        });

        // Chat events
        this.socket.on('new_message', (data) => {
            console.log('Socket event: new_message received:', data);
            
            // Call the callback if defined
            if (this.chatCallbacks.onNewMessage) {
                this.chatCallbacks.onNewMessage(data);
            } else {
                console.warn('onNewMessage callback not defined');
            }
            
            // Store in localStorage for offline access
            this.storeMessageInLocalStorage(data.chatKey, data.message);
        });

        this.socket.on('message_sent', (data) => {
            console.log('Socket event: message_sent received:', data);
            
            // Call the callback if defined
            if (this.chatCallbacks.onMessageSent) {
                this.chatCallbacks.onMessageSent(data);
            } else {
                console.warn('onMessageSent callback not defined');
            }
            
            // Store in localStorage for offline access
            this.storeMessageInLocalStorage(data.chatKey, data.message);
        });

        this.socket.on('messages_read', (data) => {
            console.log('Socket event: messages_read received:', data);
            
            // Call the callback if defined
            if (this.chatCallbacks.onMessagesRead) {
                this.chatCallbacks.onMessagesRead(data);
            } else {
                console.warn('onMessagesRead callback not defined');
            }
            
            // Update read status in localStorage
            this.updateReadStatusInLocalStorage(data.chatKey, data.reader);
        });

        this.socket.on('user_status_changed', (data) => {
            console.log('Socket event: user_status_changed received:', data);
            
            // Call the callback if defined
            if (this.chatCallbacks.onUserStatusChanged) {
                this.chatCallbacks.onUserStatusChanged(data);
            } else {
                console.warn('onUserStatusChanged callback not defined');
            }
        });
    },

    // Set callbacks for chat events
    setCallbacks: function(callbacks) {
        this.chatCallbacks = { ...this.chatCallbacks, ...callbacks };
    },

    // Login to the chat server
    login: function(email, role) {
        if (!email || !role) {
            console.error('Email and role are required for login');
            return false;
        }
        
        if (!this.socket) {
            console.error('Socket not initialized');
            return false;
        }
        
        if (!this.socket.connected) {
            console.error('Socket not connected');
            console.log('Attempting to reconnect...');
            // Store user info for when connection is established
            this.currentUser = { email, role };
            // Attempt to reconnect
            this.socket.connect();
            return false;
        }

        this.currentUser = { email, role };
        this.socket.emit('user_login', { email, role });
        console.log('User logged in:', email, role);
        return true;
    },

    // Logout from the chat server
    logout: function() {
        if (!this.socket || !this.currentUser) return false;

        this.socket.emit('user_logout');
        this.currentUser = null;
        console.log('User logged out');
        return true;
    },

    // Send a message
    sendMessage: function(recipientEmail, messageText) {
        if (!this.socket || !this.currentUser) {
            console.error('Socket not connected or user not logged in');
            return false;
        }
        
        if (!recipientEmail || !messageText) {
            console.error('Recipient email and message text are required');
            return false;
        }

        const messageData = {
            sender: this.currentUser.email,
            recipient: recipientEmail,
            text: messageText,
            timestamp: new Date().toISOString()
        };

        console.log('Sending message via socket to:', recipientEmail, 'Message:', messageText);
        this.socket.emit('send_message', messageData);
        console.log('Message sent to:', recipientEmail);
        
        // Store message in localStorage immediately for instant feedback
        // before waiting for server confirmation
        const chatKey = `${this.currentUser.email}_${recipientEmail}`;
        const message = {
            sender: this.currentUser.email,
            text: messageText,
            timestamp: messageData.timestamp,
            read: false
        };
        this.storeMessageInLocalStorage(chatKey, message);
        
        // Trigger the message sent callback for immediate UI update
        if (this.chatCallbacks.onMessageSent) {
            this.chatCallbacks.onMessageSent({
                chatKey: chatKey,
                message: message
            });
        }
        
        return true;
    },

    // Mark messages as read
    markMessagesAsRead: function(senderEmail, chatKey) {
        if (!this.socket || !this.currentUser) {
            console.error('Socket not connected or user not logged in');
            return false;
        }

        const data = {
            reader: this.currentUser.email,
            sender: senderEmail,
            chatKey: chatKey
        };

        this.socket.emit('mark_messages_read', data);
        console.log('Marked messages from', senderEmail, 'as read');
        
        // Update read status in localStorage
        this.updateReadStatusInLocalStorage(chatKey, this.currentUser.email);
        
        return true;
    },

    // Store message in localStorage (for offline access)
    storeMessageInLocalStorage: function(chatKey, message) {
        console.log('Storing message in localStorage, chatKey:', chatKey, 'message:', message);
        const chats = JSON.parse(localStorage.getItem('campusConnectChats') || '{}');
        
        if (!chats[chatKey]) {
            chats[chatKey] = { messages: [] };
            console.log('Created new chat entry for key:', chatKey);
        }
        
        // Check if message already exists to avoid duplicates
        const messageExists = chats[chatKey].messages.some(msg => 
            msg.sender === message.sender && 
            msg.timestamp === message.timestamp && 
            msg.text === message.text
        );
        
        if (!messageExists) {
            chats[chatKey].messages.push(message);
            localStorage.setItem('campusConnectChats', JSON.stringify(chats));
            console.log('Message stored in localStorage for key:', chatKey);
        } else {
            console.log('Message already exists in localStorage, not adding duplicate');
        }
    },

    // Update read status in localStorage
    updateReadStatusInLocalStorage: function(chatKey, readerEmail) {
        const chats = JSON.parse(localStorage.getItem('campusConnectChats') || '{}');
        
        if (chats[chatKey] && chats[chatKey].messages) {
            let updated = false;
            
            chats[chatKey].messages.forEach(message => {
                // Only mark messages from the other person as read
                if (message.sender !== readerEmail && !message.read) {
                    message.read = true;
                    updated = true;
                }
            });
            
            if (updated) {
                localStorage.setItem('campusConnectChats', JSON.stringify(chats));
            }
        }
    },

    // Get chat history from localStorage
    getChatHistory: function(otherUserEmail) {
        if (!this.currentUser) return [];
        
        const chats = JSON.parse(localStorage.getItem('campusConnectChats') || '{}');
        
        // Check both possible key formats
        const primaryKey = `${this.currentUser.email}_${otherUserEmail}`;
        const alternateKey = `${otherUserEmail}_${this.currentUser.email}`;
        
        let messages = [];
        
        if (chats[primaryKey] && chats[primaryKey].messages) {
            messages = [...chats[primaryKey].messages];
        }
        
        if (chats[alternateKey] && chats[alternateKey].messages) {
            messages = [...messages, ...chats[alternateKey].messages];
        }
        
        // Sort by timestamp
        return messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }
};

// Make the chatSocket object available globally
window.chatSocket = chatSocket; 
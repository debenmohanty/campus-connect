// Server for Campus Connect Chat System using Socket.io
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

// Initialize express app
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store active users
const activeUsers = {};

// Function to get active user by email
function getUserByEmail(email) {
  return Object.entries(activeUsers).find(([socketId, user]) => user.email === email);
}

// Debug active users
function debugActiveUsers() {
  console.log('------------ ACTIVE USERS -------------');
  Object.entries(activeUsers).forEach(([socketId, user]) => {
    console.log(`Socket: ${socketId}, User: ${user.email}, Role: ${user.role}`);
  });
  console.log('--------------------------------------');
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // User login
  socket.on('user_login', ({ email, role }) => {
    console.log(`User logged in: ${email} (${role}) with socket ID: ${socket.id}`);
    activeUsers[socket.id] = { email, role };
    socket.join(email); // Join a room with their email as the name
    
    // Notify about online status
    io.emit('user_status_changed', { email, status: 'online' });
    
    // Debug active users
    debugActiveUsers();
  });
  
  // User logout
  socket.on('user_logout', () => {
    if (activeUsers[socket.id]) {
      const { email } = activeUsers[socket.id];
      console.log(`User logged out: ${email}`);
      
      // Notify about offline status
      io.emit('user_status_changed', { email, status: 'offline' });
      
      // Remove from active users
      delete activeUsers[socket.id];
      
      // Debug active users
      debugActiveUsers();
    }
  });
  
  // Send message
  socket.on('send_message', (messageData) => {
    console.log('New message received by server:', messageData);
    
    const { sender, recipient, text, timestamp } = messageData;
    
    // Create message object
    const message = {
      sender,
      text,
      timestamp,
      read: false
    };
    
    const chatKey = `${sender}_${recipient}`;
    console.log(`Attempting to send message to recipient: ${recipient}, chatKey: ${chatKey}`);
    
    // Check if recipient is online
    const recipientData = getUserByEmail(recipient);
    
    if (recipientData) {
      const [recipientSocketId, userData] = recipientData;
      console.log(`Recipient ${recipient} is online with socketId: ${recipientSocketId}`);
    } else {
      console.log(`Recipient ${recipient} is not currently online`);
    }
    
    // Debug the rooms the recipient should be in
    const recipientRooms = io.sockets.adapter.rooms.get(recipient);
    console.log(`Recipient room "${recipient}" exists:`, recipientRooms ? true : false);
    if (recipientRooms) {
      console.log(`Sockets in recipient room:`, Array.from(recipientRooms));
    }
    
    // Send to recipient if they're online
    const result = io.to(recipient).emit('new_message', {
      chatKey,
      message
    });
    console.log(`Emitted 'new_message' event to room: ${recipient}`, result);
    
    // Also send back to sender for confirmation
    socket.emit('message_sent', {
      chatKey,
      message
    });
    console.log(`Emitted 'message_sent' event back to sender: ${sender}`);
    
    // Debug active users again
    debugActiveUsers();
  });
  
  // Mark messages as read
  socket.on('mark_messages_read', ({ reader, sender, chatKey }) => {
    console.log(`Marking messages as read - reader: ${reader}, sender: ${sender}, chatKey: ${chatKey}`);
    
    // Debug the rooms the sender should be in
    const senderRooms = io.sockets.adapter.rooms.get(sender);
    console.log(`Sender room "${sender}" exists:`, senderRooms ? true : false);
    if (senderRooms) {
      console.log(`Sockets in sender room:`, Array.from(senderRooms));
    }
    
    // Notify the original sender that their messages have been read
    io.to(sender).emit('messages_read', {
      chatKey,
      reader
    });
    console.log(`Emitted 'messages_read' event to: ${sender}`);
  });
  
  // Disconnect
  socket.on('disconnect', () => {
    if (activeUsers[socket.id]) {
      const { email } = activeUsers[socket.id];
      console.log(`User disconnected: ${email}`);
      
      // Notify about offline status
      io.emit('user_status_changed', { email, status: 'offline' });
      
      // Remove from active users
      delete activeUsers[socket.id];
      
      // Debug active users
      debugActiveUsers();
    } else {
      console.log('Unknown client disconnected');
    }
  });
});

// Define port
const PORT = process.env.PORT || 3000;

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server available at ws://localhost:${PORT}`);
}); 
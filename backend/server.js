const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/test', (req, res) => {
    res.json({ message: 'Server is working!' });
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/jobs', require('./routes/job.routes'));
app.use('/api/company', require('./routes/company.routes'));
app.use('/api/applications', require('./routes/application.routes'));
app.use('/api/student', require('./routes/student.routes'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 
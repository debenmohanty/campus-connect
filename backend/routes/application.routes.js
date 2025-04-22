const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// Apply for a job
router.post('/:jobId', auth, async (req, res) => {
    try {
        const { jobId } = req.params;
        const userId = req.user.id;

        // Check if user is a student
        const [user] = await db.query('SELECT role FROM users WHERE id = ?', [userId]);
        if (user.length === 0 || user[0].role !== 'student') {
            return res.status(403).json({ message: 'Only students can apply for jobs' });
        }

        // Check if job exists
        const [job] = await db.query('SELECT * FROM jobs WHERE id = ?', [jobId]);
        if (job.length === 0) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check if already applied
        const [existingApplication] = await db.query(
            'SELECT * FROM applications WHERE job_id = ? AND user_id = ?',
            [jobId, userId]
        );

        if (existingApplication.length > 0) {
            return res.status(400).json({ message: 'You have already applied for this job' });
        }

        // Create application
        const [result] = await db.query(
            'INSERT INTO applications (job_id, user_id, status) VALUES (?, ?, ?)',
            [jobId, userId, 'pending']
        );

        res.status(201).json({
            message: 'Application submitted successfully',
            applicationId: result.insertId
        });
    } catch (error) {
        console.error('Application error:', error);
        res.status(500).json({ message: 'Error submitting application' });
    }
});

// Get all applications for a job (company view)
router.get('/job/:jobId', auth, async (req, res) => {
    try {
        const { jobId } = req.params;
        const userId = req.user.id;

        // Check if user is a company
        const [user] = await db.query('SELECT role FROM users WHERE id = ?', [userId]);
        if (user.length === 0 || user[0].role !== 'company') {
            return res.status(403).json({ message: 'Only companies can view job applications' });
        }

        // Verify job belongs to company
        const [job] = await db.query(`
            SELECT j.* FROM jobs j
            JOIN company_profiles c ON j.company_id = c.id
            WHERE j.id = ? AND c.user_id = ?
        `, [jobId, userId]);

        if (job.length === 0) {
            return res.status(404).json({ message: 'Job not found or you do not have permission' });
        }

        // Get applications
        const [applications] = await db.query(`
            SELECT a.*, u.name as student_name, u.email as student_email
            FROM applications a
            JOIN users u ON a.user_id = u.id
            WHERE a.job_id = ?
        `, [jobId]);

        res.json(applications);
    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({ message: 'Error fetching applications' });
    }
});

// Get student's applications
router.get('/student', auth, async (req, res) => {
    try {
        const userId = req.user.id;

        // Check if user is a student
        const [user] = await db.query('SELECT role FROM users WHERE id = ?', [userId]);
        if (user.length === 0 || user[0].role !== 'student') {
            return res.status(403).json({ message: 'Only students can view their applications' });
        }

        const [applications] = await db.query(`
            SELECT a.*, j.title as job_title, c.company_name
            FROM applications a
            JOIN jobs j ON a.job_id = j.id
            JOIN company_profiles c ON j.company_id = c.id
            WHERE a.user_id = ?
        `, [userId]);

        res.json(applications);
    } catch (error) {
        console.error('Get student applications error:', error);
        res.status(500).json({ message: 'Error fetching applications' });
    }
});

// Update application status (company only)
router.put('/:applicationId/status', auth, async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { status } = req.body;
        const userId = req.user.id;

        // Check if user is a company
        const [user] = await db.query('SELECT role FROM users WHERE id = ?', [userId]);
        if (user.length === 0 || user[0].role !== 'company') {
            return res.status(403).json({ message: 'Only companies can update application status' });
        }

        // Verify company owns the job
        const [application] = await db.query(`
            SELECT a.*, j.company_id, c.user_id as company_user_id
            FROM applications a
            JOIN jobs j ON a.job_id = j.id
            JOIN company_profiles c ON j.company_id = c.id
            WHERE a.id = ?
        `, [applicationId]);

        if (application.length === 0) {
            return res.status(404).json({ message: 'Application not found' });
        }

        if (application[0].company_user_id !== userId) {
            return res.status(403).json({ message: 'Not authorized to update this application' });
        }

        // Update status
        await db.query(
            'UPDATE applications SET status = ? WHERE id = ?',
            [status, applicationId]
        );

        res.json({ message: 'Application status updated successfully' });
    } catch (error) {
        console.error('Update application error:', error);
        res.status(500).json({ message: 'Error updating application' });
    }
});

module.exports = router; 
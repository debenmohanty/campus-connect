const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken, isCompany } = require('../middleware/auth.middleware');

// Get all jobs
router.get('/', async (req, res) => {
    try {
        const [jobs] = await db.query(`
            SELECT j.*, cp.company_name, cp.industry 
            FROM jobs j 
            JOIN company_profiles cp ON j.company_id = cp.id 
            WHERE j.status = 'open'
            ORDER BY j.created_at DESC
        `);
        res.json(jobs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching jobs' });
    }
});

// Get job by ID
router.get('/:id', async (req, res) => {
    try {
        const [jobs] = await db.query(`
            SELECT j.*, cp.company_name, cp.industry, cp.website, cp.description as company_description
            FROM jobs j 
            JOIN company_profiles cp ON j.company_id = cp.id 
            WHERE j.id = ?
        `, [req.params.id]);

        if (jobs.length === 0) {
            return res.status(404).json({ message: 'Job not found' });
        }

        res.json(jobs[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching job' });
    }
});

// Create new job (Company only)
router.post('/', [verifyToken, isCompany], async (req, res) => {
    try {
        const {
            title,
            description,
            requirements,
            location,
            salary_range,
            job_type,
            deadline
        } = req.body;

        // Get company profile id
        const [companies] = await db.query(
            'SELECT id FROM company_profiles WHERE user_id = ?',
            [req.userId]
        );

        if (companies.length === 0) {
            return res.status(400).json({ message: 'Company profile not found' });
        }

        const [result] = await db.query(
            `INSERT INTO jobs (
                company_id, title, description, requirements, 
                location, salary_range, job_type, deadline
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                companies[0].id,
                title,
                description,
                requirements,
                location,
                salary_range,
                job_type,
                deadline
            ]
        );

        res.status(201).json({
            message: 'Job created successfully',
            jobId: result.insertId
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating job' });
    }
});

// Update job (Company only)
router.put('/:id', [verifyToken, isCompany], async (req, res) => {
    try {
        const {
            title,
            description,
            requirements,
            location,
            salary_range,
            job_type,
            status,
            deadline
        } = req.body;

        // Verify company owns this job
        const [jobs] = await db.query(
            `SELECT j.* FROM jobs j 
            JOIN company_profiles cp ON j.company_id = cp.id 
            WHERE j.id = ? AND cp.user_id = ?`,
            [req.params.id, req.userId]
        );

        if (jobs.length === 0) {
            return res.status(403).json({ message: 'Not authorized to update this job' });
        }

        await db.query(
            `UPDATE jobs SET 
                title = ?, description = ?, requirements = ?, 
                location = ?, salary_range = ?, job_type = ?, 
                status = ?, deadline = ?
            WHERE id = ?`,
            [
                title,
                description,
                requirements,
                location,
                salary_range,
                job_type,
                status,
                deadline,
                req.params.id
            ]
        );

        res.json({ message: 'Job updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating job' });
    }
});

// Delete job (Company only)
router.delete('/:id', [verifyToken, isCompany], async (req, res) => {
    try {
        // Verify company owns this job
        const [jobs] = await db.query(
            `SELECT j.* FROM jobs j 
            JOIN company_profiles cp ON j.company_id = cp.id 
            WHERE j.id = ? AND cp.user_id = ?`,
            [req.params.id, req.userId]
        );

        if (jobs.length === 0) {
            return res.status(403).json({ message: 'Not authorized to delete this job' });
        }

        await db.query('DELETE FROM jobs WHERE id = ?', [req.params.id]);
        res.json({ message: 'Job deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting job' });
    }
});

// Apply for a job (Student only)
router.post('/:id/apply', verifyToken, async (req, res) => {
    try {
        // Verify user is a student
        const [students] = await db.query(
            'SELECT id FROM student_profiles WHERE user_id = ?',
            [req.userId]
        );

        if (students.length === 0) {
            return res.status(403).json({ message: 'Only students can apply for jobs' });
        }

        // Check if already applied
        const [applications] = await db.query(
            'SELECT * FROM job_applications WHERE job_id = ? AND student_id = ?',
            [req.params.id, students[0].id]
        );

        if (applications.length > 0) {
            return res.status(400).json({ message: 'Already applied for this job' });
        }

        // Create application
        await db.query(
            'INSERT INTO job_applications (job_id, student_id) VALUES (?, ?)',
            [req.params.id, students[0].id]
        );

        res.status(201).json({ message: 'Application submitted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error applying for job' });
    }
});

module.exports = router; 
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// Get all jobs
router.get('/', async (req, res) => {
    try {
        const [jobs] = await db.query(`
            SELECT j.*, c.company_name, c.industry 
            FROM jobs j 
            JOIN company_profiles c ON j.company_id = c.id 
            WHERE j.status = 'open'
            ORDER BY j.created_at DESC
        `);
        res.json(jobs);
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ message: 'Error fetching jobs' });
    }
});

// Get job by ID
router.get('/:id', async (req, res) => {
    try {
        const [jobs] = await db.query(`
            SELECT j.*, c.company_name, c.industry, c.website, c.description as company_description
            FROM jobs j 
            JOIN company_profiles c ON j.company_id = c.id 
            WHERE j.id = ?
        `, [req.params.id]);

        if (jobs.length === 0) {
            return res.status(404).json({ message: 'Job not found' });
        }

        res.json(jobs[0]);
    } catch (error) {
        console.error('Error fetching job:', error);
        res.status(500).json({ message: 'Error fetching job' });
    }
});

// Create new job (Company only)
router.post('/', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Check if user is a company
        const [user] = await db.query('SELECT role FROM users WHERE id = ?', [userId]);
        if (user.length === 0 || user[0].role !== 'company') {
            return res.status(403).json({ message: 'Only companies can create jobs' });
        }
        
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
            [userId]
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
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ message: 'Error creating job' });
    }
});

// Update job (Company only)
router.put('/:id', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const jobId = req.params.id;
        
        // Check if user is a company
        const [user] = await db.query('SELECT role FROM users WHERE id = ?', [userId]);
        if (user.length === 0 || user[0].role !== 'company') {
            return res.status(403).json({ message: 'Only companies can update jobs' });
        }
        
        const {
            title,
            description,
            requirements,
            location,
            salary_range,
            job_type,
            deadline,
            status
        } = req.body;

        // Check if job belongs to this company
        const [jobs] = await db.query(`
            SELECT j.* FROM jobs j
            JOIN company_profiles c ON j.company_id = c.id
            WHERE j.id = ? AND c.user_id = ?
        `, [jobId, userId]);

        if (jobs.length === 0) {
            return res.status(404).json({ message: 'Job not found or you do not have permission' });
        }

        // Update job
        await db.query(
            `UPDATE jobs SET 
                title = ?, description = ?, requirements = ?,
                location = ?, salary_range = ?, job_type = ?,
                deadline = ?, status = ?
            WHERE id = ?`,
            [
                title,
                description,
                requirements,
                location,
                salary_range,
                job_type,
                deadline,
                status,
                jobId
            ]
        );

        res.json({ message: 'Job updated successfully' });
    } catch (error) {
        console.error('Error updating job:', error);
        res.status(500).json({ message: 'Error updating job' });
    }
});

// Delete job (Company only)
router.delete('/:id', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const jobId = req.params.id;
        
        // Check if user is a company
        const [user] = await db.query('SELECT role FROM users WHERE id = ?', [userId]);
        if (user.length === 0 || user[0].role !== 'company') {
            return res.status(403).json({ message: 'Only companies can delete jobs' });
        }

        // Check if job belongs to this company
        const [jobs] = await db.query(`
            SELECT j.* FROM jobs j
            JOIN company_profiles c ON j.company_id = c.id
            WHERE j.id = ? AND c.user_id = ?
        `, [jobId, userId]);

        if (jobs.length === 0) {
            return res.status(404).json({ message: 'Job not found or you do not have permission' });
        }

        // Delete job
        await db.query('DELETE FROM jobs WHERE id = ?', [jobId]);

        res.json({ message: 'Job deleted successfully' });
    } catch (error) {
        console.error('Error deleting job:', error);
        res.status(500).json({ message: 'Error deleting job' });
    }
});

module.exports = router; 
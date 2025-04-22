const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// Create company profile
router.post('/profile', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { company_name, industry, website, description } = req.body;

        // Check if profile already exists
        const [existingProfiles] = await db.query(
            'SELECT * FROM company_profiles WHERE user_id = ?',
            [userId]
        );

        if (existingProfiles.length > 0) {
            return res.status(400).json({ message: 'Profile already exists' });
        }

        // Create profile
        const [result] = await db.query(
            `INSERT INTO company_profiles 
            (user_id, company_name, industry, website, description) 
            VALUES (?, ?, ?, ?, ?)`,
            [userId, company_name, industry, website, description]
        );

        res.status(201).json({
            message: 'Company profile created successfully',
            profileId: result.insertId
        });
    } catch (error) {
        console.error('Create profile error:', error);
        res.status(500).json({ message: 'Error creating company profile' });
    }
});

// Get company profile
router.get('/profile', auth, async (req, res) => {
    try {
        const userId = req.user.id;

        const [profiles] = await db.query(
            'SELECT * FROM company_profiles WHERE user_id = ?',
            [userId]
        );

        if (profiles.length === 0) {
            return res.status(404).json({ message: 'Company profile not found' });
        }

        res.json(profiles[0]);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Error fetching company profile' });
    }
});

module.exports = router; 
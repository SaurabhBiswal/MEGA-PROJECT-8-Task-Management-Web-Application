const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const User = require('../models/User');
const { getAuthUrl, getTokensFromCode } = require('../services/googleCalendar');

// @desc    Get Google Auth URL
// @route   GET /api/google/auth
// @access  Private
router.get('/auth', protect, (req, res) => {
    try {
        const url = getAuthUrl();
        res.status(200).json({
            success: true,
            data: { url }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to generate auth URL'
        });
    }
});

// @desc    Handle Google Auth Callback
// @route   POST /api/google/callback
// @access  Private
router.post('/callback', protect, async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) {
            return res.status(400).json({
                success: false,
                message: 'Authorization code is required'
            });
        }

        const tokens = await getTokensFromCode(code);

        // Save tokens to user
        const updateData = {
            googleAccessToken: tokens.access_token,
            calendarSyncEnabled: true
        };

        if (tokens.refresh_token) {
            updateData.googleRefreshToken = tokens.refresh_token;
        }

        await User.findByIdAndUpdate(req.userId, updateData);

        res.status(200).json({
            success: true,
            message: 'Google Calendar connected successfully'
        });
    } catch (error) {
        console.error('Google Callback Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to connect Google Calendar'
        });
    }
});

// @desc    Disconnect Google Calendar
// @route   POST /api/google/disconnect
// @access  Private
router.post('/disconnect', protect, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.userId, {
            $unset: { googleAccessToken: 1, googleRefreshToken: 1 },
            calendarSyncEnabled: false
        });

        res.status(200).json({
            success: true,
            message: 'Google Calendar disconnected'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to disconnect'
        });
    }
});

module.exports = router;

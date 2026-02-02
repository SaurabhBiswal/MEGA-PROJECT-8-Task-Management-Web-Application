const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { validate, registerValidationRules, loginValidationRules } = require('../middleware/validation');
const { register, login, getCurrentUser, uploadAvatar, getAvatar, upload } = require('../controllers/authController');

// Register
router.post('/register', registerValidationRules(), validate, register);

// Login
router.post('/login', loginValidationRules(), validate, login);

// Get Current User
router.get('/me', authMiddleware, getCurrentUser);

// Upload Avatar
router.post('/me/avatar', authMiddleware, upload.single('avatar'), uploadAvatar, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
});

// Get Avatar Image
router.get('/:id/avatar', getAvatar);

module.exports = router;

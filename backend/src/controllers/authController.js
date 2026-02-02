const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendWelcomeEmail } = require('../services/email');
const multer = require('multer');

// Configure Multer (Memory Storage)
const upload = multer({
    limits: {
        fileSize: 5000000 // 5MB
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/i)) {
            return cb(new Error('Please upload an image (jpg, jpeg, png, webp)'));
        }
        cb(undefined, true);
    }
});

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
    );
};

// Register new user
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create new user (password is hashed in User model pre-save hook)
        const user = await User.create({
            name,
            email,
            password
        });

        // Send Welcome Email
        sendWelcomeEmail(user.email, user.name).catch(err => console.error("Email error:", err));

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                },
                token
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email and select password explicitly
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Verify password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    hasAvatar: !!user.avatar
                },
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
    try {
        // req.userId comes from auth middleware
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    hasAvatar: !!user.avatar
                }
            }
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Upload Avatar Controller
exports.uploadAvatar = async (req, res) => {
    try {
        console.log('Upload Avatar Request:', { userId: req.userId, file: req.file ? 'Present' : 'Missing' });

        if (!req.file) {
            console.error('No file received in uploadAvatar controller');
            return res.status(400).send({ error: 'Please upload a file' });
        }

        const user = await User.findById(req.userId);
        if (!user) {
            console.error('User not found during avatar upload');
            return res.status(404).send({ error: 'User not found' });
        }

        user.avatar = req.file.buffer;
        await user.save();
        console.log('Avatar saved successfully');
        res.send({ success: true, message: 'Avatar uploaded successfully' });
    } catch (error) {
        console.error('Error uploading avatar:', error);
        res.status(500).send({ error: 'Error uploading avatar: ' + error.message });
    }
};

// Get Avatar Controller
exports.getAvatar = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.avatar) {
            throw new Error();
        }

        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    } catch (e) {
        res.status(404).send();
    }
};

exports.upload = upload;

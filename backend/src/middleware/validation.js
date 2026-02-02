const { body, validationResult } = require('express-validator');

// Validation rules for task creation/update
const taskValidationRules = () => {
    return [
        body('title')
            .trim()
            .notEmpty()
            .withMessage('Title is required')
            .isLength({ max: 255 })
            .withMessage('Title must be less than 255 characters'),
        body('description')
            .optional()
            .trim(),
        body('status')
            .optional()
            .isIn(['pending', 'in-progress', 'completed'])
            .withMessage('Status must be pending, in-progress, or completed'),
        body('priority')
            .optional()
            .isIn(['low', 'medium', 'high', 'critical'])
            .withMessage('Priority must be low, medium, high, or critical'),
        body('due_date')
            .optional()
            .isISO8601()
            .withMessage('Due date must be a valid date')
    ];
};

// Validation rules for user registration
const registerValidationRules = () => {
    return [
        body('name')
            .trim()
            .notEmpty()
            .withMessage('Name is required')
            .isLength({ min: 2, max: 100 })
            .withMessage('Name must be between 2 and 100 characters'),
        body('email')
            .trim()
            .notEmpty()
            .withMessage('Email is required')
            .isEmail()
            .withMessage('Please provide a valid email')
            .normalizeEmail(),
        body('password')
            .notEmpty()
            .withMessage('Password is required')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long')
    ];
};

// Validation rules for user login
const loginValidationRules = () => {
    return [
        body('email')
            .trim()
            .notEmpty()
            .withMessage('Email is required')
            .isEmail()
            .withMessage('Please provide a valid email')
            .normalizeEmail(),
        body('password')
            .notEmpty()
            .withMessage('Password is required')
    ];
};

// Middleware to check validation results
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array(),
            message: errors.array().map(err => err.msg).join(', ')
        });
    }
    next();
};

module.exports = {
    taskValidationRules,
    registerValidationRules,
    loginValidationRules,
    validate
};

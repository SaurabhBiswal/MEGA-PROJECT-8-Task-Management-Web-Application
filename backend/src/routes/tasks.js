const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/auth');
const { taskValidationRules, validate } = require('../middleware/validation');

// All task routes require authentication
router.use(authMiddleware);

// Task CRUD routes
router.get('/', taskController.getAllTasks);
router.get('/:id', taskController.getTaskById);
router.post('/', taskValidationRules(), validate, taskController.createTask);
router.put('/:id', taskValidationRules(), validate, taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;

const Task = require('../models/Task');
const User = require('../models/User');
const { sendTaskCreatedEmail, sendTaskStatusChangedEmail, sendTaskPriorityChangedEmail } = require('../services/email');
const { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } = require('../services/googleCalendar');

// Get all tasks for the authenticated user
exports.getAllTasks = async (req, res) => {
    try {
        const query = { user: req.userId };

        // Filtering
        if (req.query.status) {
            query.status = req.query.status;
        }
        if (req.query.priority) {
            query.priority = req.query.priority;
        }
        // Search (case insensitive)
        if (req.query.search) {
            query.$or = [
                { title: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        // Pagination
        const limit = parseInt(req.query.limit) || 100;
        const skip = parseInt(req.query.skip) || 0;

        const tasks = await Task.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip);

        res.status(200).json({
            success: true,
            count: tasks.length,
            data: { tasks }
        });
    } catch (error) {
        console.error('Get all tasks error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching tasks'
        });
    }
};

// Get a single task by ID
exports.getTaskById = async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, user: req.userId });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.status(200).json({
            success: true,
            data: { task }
        });
    } catch (error) {
        console.error('Get task by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error or invalid ID'
        });
    }
};

// Create a new task
exports.createTask = async (req, res) => {
    try {
        // Add user to body
        req.body.user = req.userId;

        const task = await Task.create(req.body);

        // Emit real-time event
        if (req.io) {
            req.io.to(req.userId).emit('task_created', task);
        }

        // Send email notification
        try {
            const user = await User.findById(req.userId);
            if (user) {
                await sendTaskCreatedEmail(
                    user.email,
                    user.name,
                    task.title,
                    task.description,
                    task.priority,
                    task.due_date
                );
            }
        } catch (emailError) {
            console.error('Email send failed:', emailError);
        }

        // Google Calendar Sync
        try {
            const user = await User.findById(req.userId).select('+googleAccessToken');
            if (user && user.calendarSyncEnabled && user.googleAccessToken) {
                const eventId = await createCalendarEvent(task, user.googleAccessToken);
                if (eventId) {
                    task.calendarEventId = eventId;
                    await task.save();
                }
            }
        } catch (calendarError) {
            console.error('Google Calendar Sync failed:', calendarError.message);
        }

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: { task }
        });
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating task'
        });
    }
};

// Update a task
exports.updateTask = async (req, res) => {
    try {
        // Get old task to compare status
        const oldTask = await Task.findOne({ _id: req.params.id, user: req.userId });

        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, user: req.userId },
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Emit real-time event
        if (req.io) {
            req.io.to(req.userId).emit('task_updated', task);
        }

        // Send email if status changed
        if (oldTask && oldTask.status !== task.status) {
            try {
                const user = await User.findById(req.userId);
                if (user) {
                    await sendTaskStatusChangedEmail(
                        user.email,
                        user.name,
                        task.title,
                        oldTask.status,
                        task.status
                    );
                }
            } catch (emailError) {
                console.error('Email send failed:', emailError);
            }
        }

        // Send email if priority changed
        if (oldTask && oldTask.priority !== task.priority) {
            try {
                const user = await User.findById(req.userId);
                if (user) {
                    await sendTaskPriorityChangedEmail(
                        user.email,
                        user.name,
                        task.title,
                        oldTask.priority,
                        task.priority
                    );
                }
            } catch (emailError) {
                console.error('Email send failed:', emailError);
            }
        }

        res.status(200).json({
            success: true,
            message: 'Task updated successfully',
            data: { task }
        });

        // Background Sync (Don't block response)
        (async () => {
            // Task events
            if (oldTask && (oldTask.status !== task.status || oldTask.priority !== task.priority)) {
                try {
                    const user = await User.findById(req.userId).select('+googleAccessToken');
                    if (user) {
                        // Email Notification
                        if (oldTask.status !== task.status) {
                            await sendTaskStatusChangedEmail(user.email, user.name, task.title, oldTask.status, task.status);
                        }
                        if (oldTask.priority !== task.priority) {
                            await sendTaskPriorityChangedEmail(user.email, user.name, task.title, oldTask.priority, task.priority);
                        }

                        // Google Calendar Sync
                        if (user.calendarSyncEnabled && user.googleAccessToken && task.calendarEventId) {
                            await updateCalendarEvent(task.calendarEventId, task, user.googleAccessToken);
                        }
                    }
                } catch (error) {
                    console.error('Update notification/sync failed:', error);
                }
            }
        })();
    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating task'
        });
    }
};

// Delete a task
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Emit real-time event
        if (req.io) {
            req.io.to(req.userId).emit('task_deleted', task._id);
        }

        res.status(200).json({
            success: true,
            message: 'Task deleted successfully',
            data: { task }
        });

        // Google Calendar Sync (Delete)
        if (task.calendarEventId) {
            try {
                const user = await User.findById(req.userId).select('+googleAccessToken');
                if (user && user.googleAccessToken) {
                    await deleteCalendarEvent(task.calendarEventId, user.googleAccessToken);
                }
            } catch (error) {
                console.error('Google Calendar event deletion failed:', error);
            }
        }
    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting task'
        });
    }
};

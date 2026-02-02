const cron = require('node-cron');
const Task = require('../models/Task');
const User = require('../models/User');
const { sendDailyReminderEmail } = require('./email');

// Schedule daily reminder at 9 AM
const startDailyReminders = () => {
    // Cron expression: '0 9 * * *' = Every day at 9:00 AM
    cron.schedule('0 9 * * *', async () => {
        console.log('⏰ Running daily task reminder job...');

        try {
            // Get all users
            const users = await User.find();

            for (const user of users) {
                // Find pending or in-progress tasks for this user
                const tasks = await Task.find({
                    user: user._id,
                    status: { $in: ['pending', 'in-progress'] }
                }).select('title priority dueDate');

                // Send email if user has pending tasks
                if (tasks.length > 0) {
                    try {
                        await sendDailyReminderEmail(user.email, user.name, tasks);
                        console.log(`✅ Reminder sent to ${user.email} (${tasks.length} tasks)`);
                    } catch (emailError) {
                        console.error(`❌ Failed to send reminder to ${user.email}:`, emailError.message);
                    }
                }
            }

            console.log('✅ Daily reminder job completed');
        } catch (error) {
            console.error('❌ Daily reminder job failed:', error);
        }
    });

    console.log('📅 Daily reminder cron job initialized (9 AM daily)');
};

module.exports = { startDailyReminders };

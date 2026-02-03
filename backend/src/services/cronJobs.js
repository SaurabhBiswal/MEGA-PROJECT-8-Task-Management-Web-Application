const cron = require('node-cron');
const Task = require('../models/Task');
const User = require('../models/User');
const { sendDailyReminderEmail } = require('./email');

// Schedule daily reminder at 9 AM
// Logic to send reminders (Refactored for reuse)
const triggerDailyReminders = async () => {
    console.log('⏰ Running daily task reminder job...');
    try {
        const users = await User.find();
        let sentCount = 0;

        for (const user of users) {
            const tasks = await Task.find({
                user: user._id,
                status: { $in: ['pending', 'in-progress'] }
            }).select('title priority dueDate');

            if (tasks.length > 0) {
                try {
                    await sendDailyReminderEmail(user.email, user.name, tasks);
                    console.log(`✅ Reminder sent to ${user.email} (${tasks.length} tasks)`);
                    sentCount++;
                } catch (emailError) {
                    console.error(`❌ Failed to send reminder to ${user.email}:`, emailError.message);
                }
            }
        }
        console.log(`✅ Daily reminder job completed. Sent to ${sentCount} users.`);
        return { success: true, sentCount };
    } catch (error) {
        console.error('❌ Daily reminder job failed:', error);
        return { success: false, error: error.message };
    }
};

// Schedule daily reminder at 9 AM IST
const startDailyReminders = () => {
    // Cron expression: '0 9 * * *' = Every day at 9:00 AM
    // Added timezone: 'Asia/Kolkata' to ensure it runs at Indian time
    cron.schedule('0 9 * * *', triggerDailyReminders, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });

    console.log('📅 Daily reminder cron job initialized (9 AM IST)');
};

module.exports = { startDailyReminders, triggerDailyReminders };

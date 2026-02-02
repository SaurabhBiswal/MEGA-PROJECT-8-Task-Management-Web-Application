const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const User = require('./models/User');
const Task = require('./models/Task');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/taskmanager');
        console.log('✅ MongoDB Connected');

        // Check if demo user exists
        let user = await User.findOne({ email: 'demo@example.com' });

        if (!user) {
            console.log('creating demo user...');
            // Mongoose User model hashes password automatically via pre hook
            user = await User.create({
                name: 'Demo User',
                email: 'demo@example.com',
                password: 'password123'
            });
            console.log('✅ Created user: demo@example.com / password123');
        } else {
            console.log('ℹ️ Demo user already exists');
        }

        // Create some sample tasks
        const tasks = [
            {
                title: 'Complete Project Implementation',
                description: 'Finish the backend and frontend implementation for the internship assessment.',
                status: 'completed',
                priority: 'high',
                due_date: new Date(Date.now() - 86400000) // Yesterday
            },
            {
                title: 'Write Documentation',
                description: 'Create a comprehensive README.md with setup instructions.',
                status: 'in-progress',
                priority: 'critical',
                due_date: new Date(Date.now() + 86400000) // Tomorrow
            },
            {
                title: 'Review Code',
                description: 'Perform a final code review and clean up unnecessary comments.',
                status: 'pending',
                priority: 'medium',
                due_date: new Date(Date.now() + 172800000) // Day after tomorrow
            }
        ];

        console.log('Creating sample tasks...');
        for (const taskData of tasks) {
            await Task.create({ ...taskData, user: user._id });
        }
        console.log(`✅ Created ${tasks.length} sample tasks`);

        console.log('🎉 Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedData();

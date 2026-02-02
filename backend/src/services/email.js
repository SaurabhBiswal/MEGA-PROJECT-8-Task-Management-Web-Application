const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');

const sendEmail = async (options) => {
    // 1. Try SendGrid first
    if (process.env.SENDGRID_API_KEY) {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
            to: options.email,
            from: `${process.env.FROM_NAME || 'Task Manager App'} <${process.env.FROM_EMAIL}>`,
            subject: options.subject,
            text: options.message,
            html: options.html // Optional: if you pass HTML later
        };
        try {
            await sgMail.send(msg);
            console.log('✅ Email sent via SendGrid');
            return;
        } catch (error) {
            console.error('❌ SendGrid Failed:', error.response ? error.response.body : error.message);
            // Fallback to SMTP if SendGrid fails
        }
    }

    // 2. Fallback to Nodemailer (SMTP)
    let transporter;

    if (process.env.SMTP_HOST) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD
            }
        });
    } else {
        // Mock for development - Log only
        console.log('⚠️ No Email Provider configured (SendGrid/SMTP). Mocking email send.');
        console.log(`📧 To: ${options.email}`);
        console.log(`📝 Subject: ${options.subject}`);
        console.log(`📄 Message: ${options.message}`);
        return;
    }

    const message = {
        from: `${process.env.FROM_NAME || 'Task Manager App'} <${process.env.FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    await transporter.sendMail(message);
    console.log('✅ Email sent via SMTP');
};

const sendWelcomeEmail = async (email, name) => {
    await sendEmail({
        email,
        subject: 'Welcome to Task Manager!',
        message: `Hi ${name},\n\nWelcome to the Task Manager App. We are glad to have you on board!\n\nBest,\nTask Manager Team`
    });
};

const sendTaskCreatedEmail = async (email, name, taskTitle, taskDescription, priority, dueDate) => {
    await sendEmail({
        email,
        subject: '✅ New Task Created!',
        message: `Hi ${name},\n\nYour new task has been created successfully!\n\n📋 Task: ${taskTitle}\n📝 Description: ${taskDescription || 'No description'}\n⚡ Priority: ${priority.toUpperCase()}\n📅 Due Date: ${dueDate ? new Date(dueDate).toLocaleDateString() : 'Not set'}\n\nStay productive!\n\nBest,\nTask Manager Team`
    });
};

const sendTaskStatusChangedEmail = async (email, name, taskTitle, oldStatus, newStatus) => {
    const statusEmoji = {
        'pending': '⏳',
        'in-progress': '🔄',
        'completed': '✅'
    };

    await sendEmail({
        email,
        subject: `${statusEmoji[newStatus]} Task Status Updated!`,
        message: `Hi ${name},\n\nYour task status has been updated!\n\n📋 Task: ${taskTitle}\n${statusEmoji[oldStatus]} Old Status: ${oldStatus}\n${statusEmoji[newStatus]} New Status: ${newStatus}\n\nKeep up the great work!\n\nBest,\nTask Manager Team`
    });
};

const sendTaskPriorityChangedEmail = async (email, name, taskTitle, oldPriority, newPriority) => {
    const priorityEmoji = {
        'low': '🟢',
        'medium': '🟡',
        'high': '🟠',
        'critical': '🔴'
    };

    await sendEmail({
        email,
        subject: `${priorityEmoji[newPriority]} Task Priority Updated!`,
        message: `Hi ${name},\n\nYour task priority has been changed!\n\n📋 Task: ${taskTitle}\n${priorityEmoji[oldPriority]} Old Priority: ${oldPriority.toUpperCase()}\n${priorityEmoji[newPriority]} New Priority: ${newPriority.toUpperCase()}\n\nStay organized!\n\nBest,\nTask Manager Team`
    });
};

const sendDailyReminderEmail = async (email, name, tasks) => {
    const taskList = tasks.map((task, index) =>
        `${index + 1}. ${task.title} (${task.priority.toUpperCase()}) - Due: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No deadline'}`
    ).join('\n');

    await sendEmail({
        email,
        subject: '⏰ Daily Task Reminder',
        message: `Hi ${name},\n\nYou have ${tasks.length} pending task(s) for today:\n\n${taskList}\n\nStay on track and make today productive!\n\nBest,\nTask Manager Team`
    });
};

const sendcancellationEmail = async (email, name) => {
    await sendEmail({
        email,
        subject: 'Sorry to see you go!',
        message: `Hi ${name},\n\nWe noticed you deleted your account. Let us know if we can do anything to improve.\n\nBest,\nTask Manager Team`
    });
};

module.exports = {
    sendEmail,
    sendWelcomeEmail,
    sendTaskCreatedEmail,
    sendTaskStatusChangedEmail,
    sendTaskPriorityChangedEmail,
    sendDailyReminderEmail,
    sendcancellationEmail
};

const { google } = require('googleapis');

// Create OAuth2 client
const getOAuth2Client = () => {
    return new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );
};

// Generate Google OAuth URL
const getAuthUrl = () => {
    const oauth2Client = getOAuth2Client();
    const scopes = [
        'https://www.googleapis.com/auth/calendar.events'
    ];

    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent' // Force consent screen to get refresh token
    });
};

// Exchange authorization code for tokens
const getTokensFromCode = async (code) => {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
};

// Create calendar event
const createCalendarEvent = async (task, accessToken) => {
    try {
        const oauth2Client = getOAuth2Client();
        oauth2Client.setCredentials({ access_token: accessToken });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        const event = {
            summary: task.title,
            description: task.description || 'No description',
            start: {
                dateTime: task.due_date ? new Date(task.due_date).toISOString() : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                timeZone: 'Asia/Kolkata'
            },
            end: {
                dateTime: task.due_date ? new Date(new Date(task.due_date).getTime() + 60 * 60 * 1000).toISOString() : new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
                timeZone: 'Asia/Kolkata'
            },
            colorId: task.priority === 'critical' ? '11' : task.priority === 'high' ? '6' : task.priority === 'medium' ? '5' : '2'
        };

        const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: event
        });

        return response.data.id; // Return event ID
    } catch (error) {
        console.error('Calendar event creation failed:', error.response ? error.response.data : error.message);
        throw error;
    }
};

// Update calendar event
const updateCalendarEvent = async (eventId, task, accessToken) => {
    try {
        const oauth2Client = getOAuth2Client();
        oauth2Client.setCredentials({ access_token: accessToken });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        const event = {
            summary: task.title,
            description: task.description || 'No description',
            start: {
                dateTime: task.due_date ? new Date(task.due_date).toISOString() : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                timeZone: 'Asia/Kolkata'
            },
            end: {
                dateTime: task.due_date ? new Date(new Date(task.due_date).getTime() + 60 * 60 * 1000).toISOString() : new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
                timeZone: 'Asia/Kolkata'
            },
            colorId: task.priority === 'critical' ? '11' : task.priority === 'high' ? '6' : task.priority === 'medium' ? '5' : '2',
            status: task.status === 'completed' ? 'cancelled' : 'confirmed'
        };

        await calendar.events.update({
            calendarId: 'primary',
            eventId: eventId,
            resource: event
        });

        return true;
    } catch (error) {
        console.error('Calendar event update failed:', error.message);
        return false;
    }
};

// Delete calendar event
const deleteCalendarEvent = async (eventId, accessToken) => {
    try {
        const oauth2Client = getOAuth2Client();
        oauth2Client.setCredentials({ access_token: accessToken });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        await calendar.events.delete({
            calendarId: 'primary',
            eventId: eventId
        });

        return true;
    } catch (error) {
        console.error('Calendar event deletion failed:', error.message);
        return false;
    }
};

module.exports = {
    getAuthUrl,
    getTokensFromCode,
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent
};

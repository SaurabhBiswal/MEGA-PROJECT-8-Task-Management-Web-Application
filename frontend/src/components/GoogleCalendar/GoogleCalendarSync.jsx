import { useState, useEffect } from 'react';
import { getGoogleAuthUrl, disconnectGoogleCalendar, getMe } from '../../services/api';

const GoogleCalendarSync = () => {
    const [isSyncEnabled, setIsSyncEnabled] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await getMe();
                setIsSyncEnabled(res.data.data.calendarSyncEnabled);
            } catch (err) {
                console.error('Failed to fetch sync status:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStatus();
    }, []);

    const handleConnect = async () => {
        try {
            setLoading(true);
            const res = await getGoogleAuthUrl();
            window.location.href = res.data.data.url;
        } catch (err) {
            console.error('Failed to start Google Auth:', err);
            alert('Failed to connect to Google Calendar');
            setLoading(false);
        }
    };

    const handleDisconnect = async () => {
        if (!window.confirm('Are you sure you want to disconnect Google Calendar?')) return;

        try {
            setLoading(true);
            await disconnectGoogleCalendar();
            setIsSyncEnabled(false);
        } catch (err) {
            console.error('Failed to disconnect:', err);
            alert('Failed to disconnect Google Calendar');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !isSyncEnabled) {
        return (
            <div className="google-sync-btn loading">
                <span className="sync-dot"></span>
            </div>
        );
    }

    return (
        <div className="google-sync-container">
            {isSyncEnabled ? (
                <button
                    className="btn-sync connected"
                    onClick={handleDisconnect}
                    title="Google Calendar Synced. Click to disconnect."
                >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" alt="Google Calendar" />
                    <span className="sync-status">Synced</span>
                </button>
            ) : (
                <button
                    className="btn-sync connect"
                    onClick={handleConnect}
                    title="Connect Google Calendar"
                >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" alt="Google Calendar" />
                    <span className="sync-status">Sync</span>
                </button>
            )}

            <style>{`
                .google-sync-container {
                    margin-right: 15px;
                }
                .btn-sync {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 14px;
                    border-radius: 50px;
                    border: 1px solid var(--border-color);
                    background: var(--card-bg);
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--text-color);
                }
                .btn-sync img {
                    width: 18px;
                    height: 18px;
                }
                .btn-sync:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-sm);
                    border-color: var(--primary);
                }
                .btn-sync.connected {
                    border-color: #10b981;
                    color: #10b981;
                }
                .btn-sync.connected:hover {
                    background: #f0fdf4;
                    border-color: #ef4444;
                    color: #ef4444;
                }
                
                @media (max-width: 600px) {
                    .sync-status {
                        display: none;
                    }
                    .btn-sync {
                        padding: 8px;
                    }
                }
            `}</style>
        </div>
    );
};

export default GoogleCalendarSync;

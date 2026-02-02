import { useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Link, useLocation } from 'react-router-dom';
import { uploadAvatar, getAvatarUrl } from '../../services/api';
import GoogleCalendarSync from '../GoogleCalendar/GoogleCalendarSync';
import './Header.css';

const Header = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const fileInputRef = useRef(null);

    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('avatar', file);
            try {
                await uploadAvatar(formData);
                // Immediately fetch updated user data to get `hasAvatar: true`
                // We need to bypass the cache, but simple reload is bad UX.
                // A better way is to manually update context.
                // However, since we don't have a specific `getMe` call here, we trust the upload.
                // ACTUALLY, we should fetch me to be sure.

                // Let's force a reload for now as it's the safest way to ensure all state (avatar URL) is fresh
                // but we will do it AFTER a short delay to ensure backend consistency
                setTimeout(() => {
                    window.location.reload();
                }, 500);

            } catch (error) {
                console.error(error);
                alert(error.response?.data?.error || 'Failed to upload avatar. Max size 5MB.');
            }
        }
    };

    const avatarUrl = user ? getAvatarUrl(user.id) : null;

    return (
        <header className="header">
            <div className="header-container">
                <Link to="/" className="logo">
                    Task Manager
                </Link>
                <div className="header-actions">
                    {user && (
                        <nav className="nav-links">
                            <Link
                                to="/"
                                className={location.pathname === '/' ? 'active' : ''}
                            >
                                Tasks
                            </Link>
                            <Link
                                to="/dashboard"
                                className={location.pathname === '/dashboard' ? 'active' : ''}
                            >
                                Dashboard
                            </Link>
                        </nav>
                    )}

                    <button className="theme-toggle" onClick={toggleTheme}>
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>

                    {user && (
                        <div className="user-info">
                            <GoogleCalendarSync />
                            <div
                                className="avatar-container"
                                onClick={handleAvatarClick}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    background: '#ddd',
                                    border: '2px solid var(--primary-color)',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    color: 'var(--primary-color)',
                                    fontWeight: 'bold',
                                    fontSize: '14px'
                                }}
                            >
                                {user.hasAvatar ? (
                                    <img
                                        src={`${avatarUrl}?t=${new Date().getTime()}`}
                                        alt="avatar"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <span>{user.name.charAt(0).toUpperCase()}</span>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                />
                            </div>
                            <span style={{ fontSize: '0.9rem' }}>{user.name}</span>
                            <button onClick={logout} className="btn-logout">Logout</button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;

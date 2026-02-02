import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { handleGoogleCallback, getMe } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const GoogleCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { updateUser } = useAuth();
    const [status, setStatus] = useState('connecting'); // connecting, success, error

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const code = queryParams.get('code');

        if (code) {
            const connect = async () => {
                try {
                    await handleGoogleCallback(code);

                    // Fetch fresh user data to update sync status
                    const res = await getMe();
                    if (res.data.success) {
                        updateUser(res.data.data.user);
                    }

                    setStatus('success');
                    // Wait a bit then redirect
                    setTimeout(() => {
                        navigate('/');
                    }, 2000);
                } catch (err) {
                    console.error('Google callback error:', err);
                    setStatus('error');
                }
            };
            connect();
        } else {
            setStatus('error');
        }
    }, [location, navigate]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '80vh',
            textAlign: 'center',
            padding: '20px'
        }}>
            <div style={{
                background: 'var(--card-bg)',
                padding: '40px',
                borderRadius: '20px',
                boxShadow: 'var(--shadow-lg)',
                maxWidth: '400px',
                width: '100%'
            }}>
                {status === 'connecting' && (
                    <>
                        <div className="spinner" style={{
                            width: '40px',
                            height: '40px',
                            border: '4px solid var(--primary-light)',
                            borderTopColor: 'var(--primary)',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 20px'
                        }}></div>
                        <h2>Connecting to Google Calendar...</h2>
                        <p>Please wait while we sync your account.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div style={{ fontSize: '50px', marginBottom: '20px' }}>✅</div>
                        <h2 style={{ color: '#10b981' }}>Connected!</h2>
                        <p>Google Calendar has been successfully linked.</p>
                        <p>Redirecting you to dashboard...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div style={{ fontSize: '50px', marginBottom: '20px' }}>❌</div>
                        <h2 style={{ color: '#ef4444' }}>Connection Failed</h2>
                        <p>Something went wrong during the connection process.</p>
                        <button
                            className="btn btn-primary"
                            style={{ marginTop: '20px' }}
                            onClick={() => navigate('/')}
                        >
                            Back to Dashboard
                        </button>
                    </>
                )}
            </div>
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default GoogleCallback;

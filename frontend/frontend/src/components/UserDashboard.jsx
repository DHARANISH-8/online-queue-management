import React, { useState, useEffect } from 'react';
import './UserDashboard.css';
import BrandLogo from './BrandLogo';

const POLL_INTERVAL_MS = 5000;

const UserDashboard = ({ user, onLogout }) => {
    const [openCounters, setOpenCounters] = useState([]);
    const [selectedCounterId, setSelectedCounterId] = useState('');
    const [activeToken, setActiveToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [queueError, setQueueError] = useState('');

    useEffect(() => {
        fetchServices();
        if (user?.id) {
            fetchActiveToken();
        }
    }, [user]);

    useEffect(() => {
        if (!user?.id) return undefined;

        const intervalId = setInterval(() => {
            fetchActiveToken();
        }, POLL_INTERVAL_MS);

        return () => clearInterval(intervalId);
    }, [user?.id]);

    const fetchServices = async () => {
        try {
            const response = await fetch('/api/counters/open');
            if (response.ok) {
                const data = await response.json();
                if (data.length > 0) {
                    setOpenCounters(data);
                    setSelectedCounterId(String(data[0].id));
                    setQueueError('');
                } else {
                    setOpenCounters([]);
                    setSelectedCounterId('');
                    setQueueError('No open counters available right now. Please wait for admin to open a counter.');
                }
            }
        } catch (err) {
            console.error('Error fetching services:', err);
        }
    };

    const fetchActiveToken = async () => {
        try {
            const response = await fetch(`/api/queue/user/${user.id}/status`);
            if (response.ok) {
                const data = await response.json();
                if (data) {
                    setActiveToken({
                        id: data.tokenId,
                        number: data.yourToken,
                        nowServing: data.nowServing || '-',
                        status: data.status,
                        waitTimeMinutes: Number(data.estimatedWaitingTimeMinutes || 0),
                        peopleAhead: Number(data.peopleAhead || 0),
                        serviceType: data.serviceType || 'General',
                        counterName: data.counterName || 'N/A'
                    });
                } else {
                    setActiveToken(null);
                }
            }
            setIsLoading(false);
        } catch (err) {
            console.error('Error fetching token:', err);
            setIsLoading(false);
        }
    };

    const handleTakeToken = async () => {
        if (!user?.id || !selectedCounterId) {
            setQueueError('No open counters available right now. Please wait for admin to open a counter.');
            return;
        }
        setQueueError('');

        try {
            const selectedCounter = openCounters.find((counter) => String(counter.id) === String(selectedCounterId));
            const serviceType = selectedCounter?.serviceType || '';
            const response = await fetch(`/api/queue/generate/${user.id}?serviceType=${encodeURIComponent(serviceType)}&counterId=${encodeURIComponent(selectedCounterId)}`, {
                method: 'POST'
            });

            if (response.ok) {
                fetchActiveToken();
            } else {
                const data = await response.json().catch(() => ({}));
                setQueueError(data.message || 'Unable to join queue right now.');
            }
        } catch (err) {
            console.error('Error taking token:', err);
            setQueueError('Unable to join queue right now.');
        }
    };

    const handleCancelToken = async () => {
        if (!activeToken?.id) return;

        if (!window.confirm('Are you sure you want to cancel your token?')) return;

        try {
            const response = await fetch(`/api/queue/${activeToken.id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify('CANCELLED')
            });

            if (response.ok) {
                setActiveToken(null);
                fetchActiveToken();
            }
        } catch (err) {
            console.error('Error cancelling token:', err);
        }
    };

    return (
        <div className="user-dashboard">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <BrandLogo compact />
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-item active">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        Dashboard
                    </div>
                    {/* ... other nav items ... */}
                    <div className="nav-item" onClick={onLogout}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Logout
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-profile">
                        <img
                            src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`}
                            alt="Profile"
                            className="profile-img"
                        />
                        <div className="profile-info">
                            <span className="profile-name">{user?.name || 'User'}</span>
                            <span className="profile-role">Customer</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="top-bar">
                    <div className="breadcrumb">
                        <span>Dashboard</span>
                        <span>&rsaquo;</span>
                        <span>My Queue</span>
                    </div>
                </header>

                <div className="dashboard-header">
                    <h1>Welcome, {user?.name?.split(' ')[0]}!</h1>
                    <p>Manage your queue tokens and view live status.</p>
                </div>

                <div className="dashboard-grid">
                    {/* Join Queue Card */}
                    <div className="card join-queue-card">
                        <div className="join-queue-content">
                            <div className="plus-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                            </div>
                            <h3>Join a New Queue</h3>
                            <p>Select a counter and service to get a token and join the line instantly.</p>

                            <div className="service-select-group">
                                <label>Select Counter</label>
                                <select
                                    className="service-dropdown"
                                    value={selectedCounterId}
                                    onChange={(e) => setSelectedCounterId(e.target.value)}
                                    disabled={openCounters.length === 0}
                                >
                                    {openCounters.length === 0 ? (
                                        <option value="">No open counters</option>
                                    ) : (
                                        openCounters.map((counter) => (
                                            <option key={counter.id} value={counter.id}>
                                                {counter.counterName} - {counter.serviceType || 'General'}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>

                            <button className="btn-take-token" onClick={handleTakeToken} disabled={!!activeToken || openCounters.length === 0}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                                    <line x1="2" y1="10" x2="22" y2="10"></line>
                                </svg>
                                {activeToken ? 'Already in Queue' : openCounters.length === 0 ? 'No Open Counters' : 'Take Token'}
                            </button>
                            {queueError && <p className="queue-error">{queueError}</p>}
                        </div>
                    </div>

                    {/* Active Token Card */}
                    {activeToken ? (
                        <div className="card token-card">
                            <div className="status-badge">{activeToken.status}</div>

                            <div className="token-display">
                                <div className="token-label">YOUR TOKEN NUMBER</div>
                                <div className="token-number">{activeToken.number}</div>
                                <p className="token-instruction">Please wait for your number to be called.</p>
                            </div>

                            <div className="token-metrics">
                                <div className="metric">
                                    <span className="metric-label">Your Token</span>
                                    <span className="metric-value">{activeToken.number}</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">Now Serving</span>
                                    <span className="metric-value">{activeToken.nowServing}</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">People Ahead</span>
                                    <span className="metric-value">{activeToken.peopleAhead}</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">Estimated Waiting Time</span>
                                    <span className="metric-value">{activeToken.waitTimeMinutes} min</span>
                                </div>
                            </div>

                            <button className="btn-cancel" onClick={handleCancelToken}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="15" y1="9" x2="9" y2="15"></line>
                                    <line x1="9" y1="9" x2="15" y2="15"></line>
                                </svg>
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <div className="card empty-token-card">
                            <p>You don't have any active tokens.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default UserDashboard;

import React, { useState, useEffect } from 'react';
import './UserDashboard.css';

const UserDashboard = ({ user, onLogout }) => {
    const [services, setServices] = useState(['General Banking', 'Loans', 'Account Opening', 'Support']);
    const [selectedService, setSelectedService] = useState('');
    const [activeToken, setActiveToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchServices();
        if (user?.id) {
            fetchActiveToken();
        }
    }, [user]);

    const fetchServices = async () => {
        try {
            const response = await fetch('/api/counters/services');
            if (response.ok) {
                const data = await response.json();
                if (data.length > 0) {
                    setServices(data);
                    setSelectedService(data[0]);
                }
            }
        } catch (err) {
            console.error('Error fetching services:', err);
        }
    };

    const fetchActiveToken = async () => {
        try {
            const response = await fetch(`/api/queue/user/${user.id}`);
            if (response.ok) {
                const data = await response.json();
                if (data) {
                    setActiveToken({
                        number: `A-${String(data.tokenNumber).padStart(3, '0')}`,
                        status: data.status,
                        position: 'Calculating...', // This would need another API or logic
                        waitTime: '~10 min',
                        peopleAhead: 0, // This would need another API
                        serviceType: 'General'
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
        if (!user?.id || !selectedService) return;

        try {
            const response = await fetch(`/api/queue/generate/${user.id}?serviceType=${encodeURIComponent(selectedService)}`, {
                method: 'POST'
            });

            if (response.ok) {
                fetchActiveToken();
            }
        } catch (err) {
            console.error('Error taking token:', err);
        }
    };

    return (
        <div className="user-dashboard">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    <span>Q-Flow</span>
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
                            <p>Select a service to get a token and join the line instantly.</p>

                            <div className="service-select-group">
                                <label>Select Service</label>
                                <select
                                    className="service-dropdown"
                                    value={selectedService}
                                    onChange={(e) => setSelectedService(e.target.value)}
                                >
                                    {services.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            <button className="btn-take-token" onClick={handleTakeToken} disabled={!!activeToken}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                                    <line x1="2" y1="10" x2="22" y2="10"></line>
                                </svg>
                                {activeToken ? 'Already in Queue' : 'Take Token'}
                            </button>
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
                                    <span className="metric-label">Service Type</span>
                                    <span className="metric-value">{activeToken.serviceType}</span>
                                </div>
                                {/* Other metrics can be added later */}
                            </div>

                            <button className="btn-cancel">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="15" y1="9" x2="9" y2="15"></line>
                                    <line x1="9" y1="9" x2="15" y2="15"></line>
                                </svg>
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <div className="card empty-token-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontStyle: 'italic' }}>
                            <p>You don't have any active tokens.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default UserDashboard;

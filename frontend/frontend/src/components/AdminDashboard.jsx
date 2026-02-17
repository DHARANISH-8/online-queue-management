import React, { useEffect, useState } from 'react';
import './AdminDashboard.css';
import CounterManagement from './CounterManagement';

const AdminDashboard = ({ user, onLogout }) => {
    const [view, setView] = useState('overview');
    const [darkMode, setDarkMode] = useState(false);
    const [showTokenModal, setShowTokenModal] = useState(false);
    const [doctors, setDoctors] = useState([]);
    const [tokenForm, setTokenForm] = useState({
        userId: '',
        serviceType: 'General Inquiry',
        doctorId: ''
    });
    const [tokenError, setTokenError] = useState('');
    const [tokenSuccess, setTokenSuccess] = useState('');
    const [isCreatingToken, setIsCreatingToken] = useState(false);

    const stats = [
        { id: 1, label: 'Total Tokens Today', value: '1,560', trend: '+8% vs yesterday', trendUp: true, iconBg: '#eff6ff', iconColor: '#2563eb' },
        { id: 2, label: 'Tokens Waiting', value: '42', trend: 'Within normal range', trendUp: null, iconBg: '#fff7ed', iconColor: '#f97316' },
        { id: 3, label: 'Tokens Served', value: '1,210', trend: '+5% vs avg', trendUp: true, iconBg: '#f0fdf4', iconColor: '#10b981' },
        { id: 4, label: 'Tokens Cancelled', value: '35', trend: '2.2% of total', trendUp: false, iconBg: '#fef2f2', iconColor: '#ef4444' },
        { id: 5, label: 'Active Counters', value: '8', trend: '2 offline', trendUp: null, iconBg: '#eff6ff', iconColor: '#3b82f6' },
        { id: 6, label: 'Average Waiting Time', value: '4m 12s', trend: '-20s vs yesterday', trendUp: true, iconBg: '#f0fdf4', iconColor: '#10b981' },
    ];

    const counters = [
        { id: '01', status: 'ACTIVE', token: 'A-104', type: 'Gen. Inquiry' },
        { id: '02', status: 'ACTIVE', token: 'A-105', type: 'Gen. Inquiry' },
        { id: '03', status: 'ON BREAK', token: '--', type: 'Loans' },
        { id: '04', status: 'ACTIVE', token: 'B-042', type: 'Deposits' },
        { id: '05', status: 'ACTIVE', token: 'B-043', type: 'Deposits' },
        { id: '06', status: 'CLOSED', token: '--', type: 'VIP Services' },
    ];

    const activities = [
        { id: 1, token: 'Token A-105', action: 'Called at Counter 02', time: 'Just now' },
        { id: 2, token: 'Token B-043', action: 'Completed at Counter 05', time: '2m ago' },
        { id: 3, token: 'Token C-002', action: 'Issued from Kiosk 1', time: '4m ago' },
        { id: 4, token: 'Token A-104', action: 'Started at Counter 01', time: '5m ago' },
        { id: 5, token: 'Token B-042', action: 'Called at Counter 04', time: '8m ago' },
        { id: 6, token: 'Token A-103', action: 'Completed at Counter 01', time: '10m ago' },
    ];

    useEffect(() => {
        if (showTokenModal) {
            fetchDoctors();
        }
    }, [showTokenModal]);

    const fetchDoctors = async () => {
        try {
            const [doctorRes, staffRes] = await Promise.all([
                fetch('/api/users/role/DOCTOR'),
                fetch('/api/users/role/STAFF')
            ]);
            const doctorData = doctorRes.ok ? await doctorRes.json() : [];
            const staffData = staffRes.ok ? await staffRes.json() : [];
            const merged = [...doctorData, ...staffData];
            const uniqueById = merged.filter((item, index, self) => (
                self.findIndex((u) => u.id === item.id) === index
            ));
            setDoctors(uniqueById);
        } catch (err) {
            console.error('Error fetching doctors:', err);
            setDoctors([]);
        }
    };

    const handleCreateToken = async (e) => {
        e.preventDefault();
        setTokenError('');
        setTokenSuccess('');

        if (!tokenForm.userId || !tokenForm.doctorId) {
            setTokenError('Please provide patient user ID and select a doctor.');
            return;
        }

        setIsCreatingToken(true);
        try {
            const params = new URLSearchParams();
            params.append('serviceType', tokenForm.serviceType);
            params.append('doctorId', tokenForm.doctorId);

            const response = await fetch(`/api/queue/generate/${tokenForm.userId}?${params.toString()}`, {
                method: 'POST'
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to create token');
            }

            const data = await response.json();
            setTokenSuccess(`Token created successfully: #${data.tokenNumber}`);
            setTokenForm({ userId: '', serviceType: 'General Inquiry', doctorId: '' });
        } catch (err) {
            setTokenError(err.message || 'Failed to create token');
        } finally {
            setIsCreatingToken(false);
        }
    };

    return (
        <div className={`admin-dashboard ${darkMode ? 'dark' : ''}`}>
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    <span>ApolloQ</span>
                </div>

                <nav className="sidebar-nav">
                    <a href="#" className={`nav-item ${view === 'overview' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setView('overview'); }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                        Dashboard
                    </a>
                    <a href="#" className={`nav-item ${view === 'counters' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setView('counters'); }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        Counters
                    </a>
                    <a href="#" className={`nav-item ${view === 'queues' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setView('queues'); }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                        Queues
                    </a>
                    <a href="#" className={`nav-item ${view === 'users' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setView('users'); }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        User Mgmt
                    </a>
                    <a href="#" className={`nav-item ${view === 'settings' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setView('settings'); }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                        Settings
                    </a>
                </nav>

                <div className="sidebar-footer">
                    <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=random`} alt="User" className="user-avatar" />
                    <div className="user-info">
                        <span className="user-name">{user?.name || 'James Admin'}</span>
                        <span className="user-role">{user?.role || 'ADMIN'}</span>
                    </div>
                    <button onClick={onLogout} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <header className="header">
                    <div className="breadcrumb">
                        <span style={{ cursor: 'pointer' }} onClick={() => setView('overview')}>Dashboard</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        <span style={{ textTransform: 'capitalize' }}>{view === 'overview' ? 'Overview' : view.replace('-', ' ')}</span>
                    </div>

                    <div className="header-actions">
                        <button className={`header-btn ${darkMode ? 'active' : ''}`} onClick={() => setDarkMode(!darkMode)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg>
                            {darkMode ? 'Light mode' : 'Dark mode'}
                        </button>
                        <button className="header-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                        </button>
                        <button className="header-btn btn-new-ticket" onClick={() => setShowTokenModal(true)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            Create Token
                        </button>
                    </div>
                </header>

                <div className="dashboard-body">
                    {view === 'overview' && (
                        <>
                            <div className="dashboard-title">
                                <h2>Dashboard Overview</h2>
                                <p>Welcome back! Here is what is happening in your queue today.</p>
                            </div>
                            <div className="stats-grid">
                                {stats.map((stat) => (
                                    <div key={stat.id} className="stat-card">
                                        <div className="stat-header">
                                            <div className="stat-icon" style={{ backgroundColor: stat.iconBg, color: stat.iconColor }} />
                                        </div>
                                        <div className="stat-value">{stat.value}</div>
                                        <div className="stat-label">{stat.label}</div>
                                        <div className={`stat-trend ${stat.trendUp === true ? 'trend-up' : stat.trendUp === false ? 'trend-down' : ''}`}>
                                            {stat.trend}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="dashboard-grid-bottom">
                                <div className="card-container">
                                    <div className="card-header">
                                        <h3>Live Counter Status</h3>
                                        <a href="#" className="view-all" onClick={(e) => { e.preventDefault(); setView('counters'); }}>View All</a>
                                    </div>
                                    <div className="counter-grid">
                                        {counters.map((counter) => (
                                            <div key={counter.id} className="counter-card">
                                                <span className={`status-badge ${counter.status === 'ACTIVE' ? 'status-active' : counter.status === 'ON BREAK' ? 'status-break' : 'status-closed'}`}>
                                                    {counter.status}
                                                </span>
                                                <div className="counter-info">
                                                    <h4>Counter {counter.id}</h4>
                                                    <div className="token-number">{counter.token}</div>
                                                    <div className="service-type">{counter.type}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="card-container">
                                    <div className="card-header">
                                        <h3>Recent Activity</h3>
                                    </div>
                                    <div className="activity-list">
                                        {activities.map((activity) => (
                                            <div key={activity.id} className="activity-item">
                                                <div className="activity-info">
                                                    <h4>{activity.token}</h4>
                                                    <p>{activity.action}</p>
                                                </div>
                                                <span className="activity-time">{activity.time}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                    {view === 'counters' && <CounterManagement />}
                    {view === 'queues' && (
                        <div style={{ padding: '2rem' }}>
                            <h2 style={{ marginBottom: '0.5rem' }}>Queue & Token Creation</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                                Create tokens from admin panel and assign the requested doctor.
                            </p>
                            <button
                                onClick={() => setShowTokenModal(true)}
                                style={{
                                    padding: '0.6rem 1rem',
                                    backgroundColor: 'var(--primary-color)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                Create New Token
                            </button>
                        </div>
                    )}
                    {['users', 'settings'].includes(view) && (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <h2>{view.charAt(0).toUpperCase() + view.slice(1)} Page Coming Soon</h2>
                            <p>We are currently working on this feature. Stay tuned!</p>
                            <button
                                onClick={() => setView('overview')}
                                style={{
                                    marginTop: '1.5rem',
                                    padding: '0.5rem 1rem',
                                    backgroundColor: 'var(--primary-color)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                }}
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {showTokenModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(15, 23, 42, 0.45)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        width: '100%',
                        maxWidth: '520px',
                        background: 'white',
                        borderRadius: '12px',
                        padding: '1.25rem'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0 }}>Create Token</h3>
                            <button
                                onClick={() => {
                                    setShowTokenModal(false);
                                    setTokenError('');
                                    setTokenSuccess('');
                                }}
                                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}
                            >
                                x
                            </button>
                        </div>

                        {tokenError && <div style={{ color: '#dc2626', marginBottom: '0.75rem' }}>{tokenError}</div>}
                        {tokenSuccess && <div style={{ color: '#16a34a', marginBottom: '0.75rem' }}>{tokenSuccess}</div>}

                        <form onSubmit={handleCreateToken}>
                            <div style={{ marginBottom: '0.85rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.35rem' }}>Patient User ID</label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    value={tokenForm.userId}
                                    onChange={(e) => setTokenForm({ ...tokenForm, userId: e.target.value })}
                                    placeholder="Enter customer user ID"
                                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                />
                            </div>

                            <div style={{ marginBottom: '0.85rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.35rem' }}>Service Type</label>
                                <input
                                    type="text"
                                    required
                                    value={tokenForm.serviceType}
                                    onChange={(e) => setTokenForm({ ...tokenForm, serviceType: e.target.value })}
                                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.35rem' }}>Which doctor do you want?</label>
                                <select
                                    required
                                    value={tokenForm.doctorId}
                                    onChange={(e) => setTokenForm({ ...tokenForm, doctorId: e.target.value })}
                                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                >
                                    <option value="">Select doctor</option>
                                    {doctors.map((doctor) => (
                                        <option key={doctor.id} value={doctor.id}>
                                            {doctor.name} ({doctor.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowTokenModal(false)}
                                    style={{ padding: '0.55rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreatingToken}
                                    style={{ padding: '0.55rem 0.9rem', borderRadius: '8px', border: 'none', background: '#0f766e', color: 'white', cursor: 'pointer' }}
                                >
                                    {isCreatingToken ? 'Creating...' : 'Create Token'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;

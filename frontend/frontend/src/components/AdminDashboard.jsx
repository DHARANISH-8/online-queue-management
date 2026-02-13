import React, { useState } from 'react';
import './AdminDashboard.css';
import CounterManagement from './CounterManagement';

const AdminDashboard = ({ user, onLogout }) => {
    const [view, setView] = useState('overview');
    const [darkMode, setDarkMode] = useState(false);

    // Mock data based on design
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

    return (
        <div className={`admin-dashboard ${darkMode ? 'dark' : ''}`}>
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    <span>Q-Flow</span>
                </div>

                <nav className="sidebar-nav">
                    <a
                        href="#"
                        className={`nav-item ${view === 'overview' ? 'active' : ''}`}
                        onClick={(e) => { e.preventDefault(); setView('overview'); }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                        Dashboard
                    </a>
                    <a
                        href="#"
                        className={`nav-item ${view === 'counters' ? 'active' : ''}`}
                        onClick={(e) => { e.preventDefault(); setView('counters'); }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        Counters
                    </a>
                    <a
                        href="#"
                        className={`nav-item ${view === 'queues' ? 'active' : ''}`}
                        onClick={(e) => { e.preventDefault(); setView('queues'); }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                        Queues
                    </a>
                    <a
                        href="#"
                        className={`nav-item ${view === 'users' ? 'active' : ''}`}
                        onClick={(e) => { e.preventDefault(); setView('users'); }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        User Mgmt
                    </a>
                    <a
                        href="#"
                        className={`nav-item ${view === 'settings' ? 'active' : ''}`}
                        onClick={(e) => { e.preventDefault(); setView('settings'); }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                        Settings
                    </a>
                </nav>

                <div className="sidebar-footer">
                    <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=random`} alt="User" className="user-avatar" />
                    <div className="user-info">
                        <span className="user-name">{user?.name || 'James Admin'}</span>
                        <span className="user-role">System Admin</span>
                    </div>
                    <button onClick={onLogout} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="header">
                    <div className="breadcrumb">
                        <span style={{ cursor: 'pointer' }} onClick={() => setView('overview')}>Dashboard</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        <span style={{ textTransform: 'capitalize' }}>{view === 'overview' ? 'Overview' : view.replace('-', ' ')}</span>
                    </div>

                    <div className="header-actions">
                        <button
                            className={`header-btn ${darkMode ? 'active' : ''}`}
                            onClick={() => setDarkMode(!darkMode)}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg>
                            {darkMode ? 'Light mode' : 'Dark mode'}
                        </button>
                        <button className="header-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                        </button>
                        <button className="header-btn btn-new-ticket">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            New Ticket
                        </button>
                    </div>
                </header>

                <div className="dashboard-body">
                    {view === 'overview' && (
                        <>
                            <div className="dashboard-title">
                                <h2>Dashboard Overview</h2>
                                <p>Welcome back! Here's what's happening in your branches today.</p>
                            </div>

                            <div className="stats-grid">
                                {stats.map((stat) => (
                                    <div key={stat.id} className="stat-card">
                                        <div className="stat-header">
                                            <div className="stat-icon" style={{ backgroundColor: stat.iconBg, color: stat.iconColor }}>
                                                {stat.id === 1 && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>}
                                                {stat.id === 2 && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>}
                                                {stat.id === 3 && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>}
                                                {stat.id === 4 && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>}
                                                {stat.id === 5 && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>}
                                                {stat.id === 6 && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>}
                                            </div>
                                            <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                                            </button>
                                        </div>
                                        <div className="stat-value">{stat.value}</div>
                                        <div className="stat-label">{stat.label}</div>
                                        <div className={`stat-trend ${stat.trendUp === true ? 'trend-up' : stat.trendUp === false ? 'trend-down' : ''}`}>
                                            {stat.trendUp === true && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>}
                                            {stat.trendUp === false && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>}
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
                                        <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                                        </button>
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
                    {['queues', 'users', 'settings'].includes(view) && (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚧</div>
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
        </div>
    );
};

export default AdminDashboard;

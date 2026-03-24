import React, { useEffect, useState } from 'react';
import './AdminDashboard.css';
import CounterManagement from './CounterManagement';
import UserManagement from './UserManagement';
import BrandLogo from './BrandLogo';

const AdminDashboard = ({ user, onLogout }) => {
    const medicalSpecialties = [
        'General Medicine',
        'Cardiology',
        'Neurology',
        'Orthopedics',
        'Pediatrics',
        'Dermatology',
        'ENT',
        'Ophthalmology',
        'Gynecology',
        'Dentistry'
    ];

    const [view, setView] = useState('overview');
    const [darkMode, setDarkMode] = useState(false);
    const [showTokenModal, setShowTokenModal] = useState(false);
    const [doctors, setDoctors] = useState([]);
    const [tokenForm, setTokenForm] = useState({
        userId: '',
        serviceType: medicalSpecialties[0],
        doctorId: ''
    });
    const [tokenError, setTokenError] = useState('');
    const [tokenSuccess, setTokenSuccess] = useState('');
    const [isCreatingToken, setIsCreatingToken] = useState(false);
    const [overview, setOverview] = useState({
        totalWaitingPatients: 0,
        currentlyServingToken: '-',
        activeCounters: 0,
        activeDoctors: 0,
        counters: []
    });
    const [overviewError, setOverviewError] = useState('');

    useEffect(() => {
        if (showTokenModal) {
            fetchDoctors(tokenForm.serviceType);
        }
    }, [showTokenModal, tokenForm.serviceType]);

    useEffect(() => {
        fetchOverview();
        const interval = setInterval(fetchOverview, 8000);
        return () => clearInterval(interval);
    }, []);

    const fetchOverview = async () => {
        try {
            const response = await fetch('/api/queue/admin/overview');
            if (!response.ok) {
                throw new Error('Failed to load dashboard overview');
            }
            const data = await response.json();
            setOverview({
                totalWaitingPatients: data.totalWaitingPatients ?? 0,
                currentlyServingToken: data.currentlyServingToken || '-',
                activeCounters: data.activeCounters ?? 0,
                activeDoctors: data.activeDoctors ?? 0,
                counters: Array.isArray(data.counters) ? data.counters : []
            });
            setOverviewError('');
        } catch (err) {
            setOverviewError(err.message || 'Unable to load dashboard data');
        }
    };

    const stats = [
        { id: 1, label: 'Patients Waiting', value: String(overview.totalWaitingPatients), trend: 'Live queue count', trendUp: null, iconBg: 'var(--theme-warning-soft)', iconColor: 'var(--theme-warning)' },
        { id: 2, label: 'Currently Serving', value: overview.currentlyServingToken || '-', trend: 'Latest active token', trendUp: null, iconBg: 'var(--theme-primary-soft)', iconColor: 'var(--theme-primary)' },
        { id: 3, label: 'Active Counters', value: String(overview.activeCounters), trend: 'Open consultation points', trendUp: null, iconBg: 'var(--theme-success-soft)', iconColor: 'var(--theme-success)' },
        { id: 4, label: 'Active Doctors', value: String(overview.activeDoctors), trend: 'Doctors with open counters', trendUp: null, iconBg: 'var(--theme-danger-soft)', iconColor: 'var(--theme-danger)' },
    ];

    const fetchDoctors = async (specialty) => {
        try {
            const params = new URLSearchParams();
            if (specialty) {
                params.append('specialty', specialty);
            }
            const response = await fetch(`/api/users/doctors?${params.toString()}`);
            if (!response.ok) {
                throw new Error('Failed to fetch doctors');
            }
            const data = await response.json();
            setDoctors(Array.isArray(data) ? data : []);
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
            setTokenForm({ userId: '', serviceType: medicalSpecialties[0], doctorId: '' });
            fetchOverview();
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
                    <BrandLogo compact />
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
                </nav>

                <div className="sidebar-footer">
                    <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=random`} alt="User" className="user-avatar" />
                    <div className="user-info">
                        <span className="user-name">{user?.name || 'James Admin'}</span>
                        <span className="user-role">{user?.role || 'ADMIN'}</span>
                    </div>
                    <button onClick={onLogout} className="admin-logout-btn">
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
                                <p>Real-time queue monitoring for administrators.</p>
                            </div>
                            {overviewError && <p className="dashboard-error">{overviewError}</p>}
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
                                        {overview.counters.slice(0, 6).map((counter) => (
                                            <div key={counter.id} className="counter-card">
                                                <span className={`status-badge ${counter.status === 'OPEN' ? 'status-active' : counter.status === 'BUSY' ? 'status-break' : 'status-closed'}`}>
                                                    {counter.status}
                                                </span>
                                                <div className="counter-info">
                                                    <h4>{counter.counterName || `Counter ${counter.id}`}</h4>
                                                    <div className="token-number">{counter.currentServingToken || '-'}</div>
                                                    <div className="service-type">{counter.serviceType || 'General'} | Waiting: {counter.assignedPatients ?? 0}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="card-container">
                                    <div className="card-header">
                                        <h3>Doctors / Counters</h3>
                                    </div>
                                    <div className="activity-list">
                                        {overview.counters.slice(0, 6).map((counter) => (
                                            <div key={counter.id} className="activity-item">
                                                <div className="activity-info">
                                                    <h4>{counter.doctorName || 'Unassigned doctor'}</h4>
                                                    <p>{counter.counterName} | {counter.serviceType || 'General'}</p>
                                                </div>
                                                <span className="activity-time">Waiting: {counter.assignedPatients ?? 0}</span>
                                            </div>
                                        ))}
                                        {overview.counters.length === 0 && (
                                            <div className="activity-item">
                                                <div className="activity-info">
                                                    <h4>No counters found</h4>
                                                    <p>Create counters to start queue operations.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                    {view === 'counters' && <CounterManagement />}
                    {view === 'queues' && (
                        <div className="admin-section-card">
                            <h2>Queue & Token Creation</h2>
                            <p>
                                Create tokens from admin panel and assign the requested doctor.
                            </p>
                            <button onClick={() => setShowTokenModal(true)} className="theme-primary-btn">
                                Create New Token
                            </button>
                        </div>
                    )}
                    {view === 'users' && <UserManagement />}
                </div>
            </main>

            {showTokenModal && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-card">
                        <div className="admin-modal-header">
                            <h3>Create Token</h3>
                            <button
                                onClick={() => {
                                    setShowTokenModal(false);
                                    setTokenError('');
                                    setTokenSuccess('');
                                }}
                                className="admin-icon-button"
                            >
                                x
                            </button>
                        </div>

                        {tokenError && <div className="dashboard-error">{tokenError}</div>}
                        {tokenSuccess && <div className="dashboard-success">{tokenSuccess}</div>}

                        <form onSubmit={handleCreateToken}>
                            <div className="dashboard-form-row">
                                <label>Patient User ID</label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    value={tokenForm.userId}
                                    onChange={(e) => setTokenForm({ ...tokenForm, userId: e.target.value })}
                                    placeholder="Enter customer user ID"
                                    className="dashboard-form-control"
                                />
                            </div>

                            <div className="dashboard-form-row">
                                <label>Department / Specialty</label>
                                <select
                                    value={tokenForm.serviceType}
                                    onChange={(e) => setTokenForm({ ...tokenForm, serviceType: e.target.value, doctorId: '' })}
                                    className="dashboard-form-control"
                                >
                                    {medicalSpecialties.map((specialty) => (
                                        <option key={specialty} value={specialty}>{specialty}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="dashboard-form-row">
                                <label>Which doctor do you want?</label>
                                <select
                                    required
                                    value={tokenForm.doctorId}
                                    onChange={(e) => setTokenForm({ ...tokenForm, doctorId: e.target.value })}
                                    className="dashboard-form-control"
                                >
                                    <option value="">{doctors.length ? 'Select doctor' : 'No doctors available for selected specialty'}</option>
                                    {doctors.map((doctor) => (
                                        <option key={doctor.id} value={doctor.id}>
                                            {doctor.name} ({doctor.email}) - {doctor.specialty}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="dashboard-form-actions">
                                <button type="button" onClick={() => setShowTokenModal(false)} className="theme-secondary-btn">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isCreatingToken} className="theme-primary-btn-small">
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

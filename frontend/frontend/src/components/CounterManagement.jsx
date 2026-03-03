import React, { useState, useEffect } from 'react';
import './CounterManagement.css';

const CounterManagement = () => {
    const [counters, setCounters] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [doctorNotification, setDoctorNotification] = useState('');

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

    const [newCounter, setNewCounter] = useState({
        name: '',
        serviceType: medicalSpecialties[0],
        doctorId: ''
    });

    useEffect(() => {
        fetchCounters();
        fetchDoctors();
    }, []);

    useEffect(() => {
        if (!doctorNotification) return undefined;
        const timer = setTimeout(() => setDoctorNotification(''), 5000);
        return () => clearTimeout(timer);
    }, [doctorNotification]);

    const fetchCounters = async () => {
        try {
            const response = await fetch('/api/counters');
            const data = await response.json();
            setCounters(data);
            setIsLoading(false);
        } catch (err) {
            console.error('Error fetching counters:', err);
            setIsLoading(false);
        }
    };

    const fetchDoctors = async () => {
        try {
            const [doctorRes, staffRes] = await Promise.all([
                fetch('/api/users/role/DOCTOR'),
                fetch('/api/users/role/STAFF')
            ]);

            const doctorData = doctorRes.ok ? await doctorRes.json() : [];
            const staffData = staffRes.ok ? await staffRes.json() : [];
            const merged = [...doctorData, ...staffData];
            const uniqueDoctors = merged.filter((item, index, self) => (
                self.findIndex((u) => u.id === item.id) === index
            ));
            setDoctors(uniqueDoctors);
        } catch (err) {
            console.error('Error fetching doctors:', err);
            setDoctors([]);
        }
    };



    const handleAddCounter = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const params = new URLSearchParams();
            params.append('name', newCounter.name);
            params.append('serviceType', newCounter.serviceType);
            params.append('doctorId', newCounter.doctorId);

            const response = await fetch(`/api/counters?${params.toString()}`, {
                method: 'POST'
            });

            if (response.ok) {
                setShowAddModal(false);
                setNewCounter({ name: '', serviceType: medicalSpecialties[0], doctorId: '' });
                fetchCounters();
            } else {
                const data = await response.json().catch(() => ({}));
                setError(data.message || 'Failed to create counter');
            }
        } catch (err) {
            console.error('Error adding counter:', err);
            setError('Error adding counter');
        }
    };

    const handleDeleteCounter = async (id) => {
        if (!window.confirm('Are you sure you want to delete this counter?')) return;
        try {
            const response = await fetch(`/api/counters/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchCounters();
            }
        } catch (err) {
            console.error('Error deleting counter:', err);
        }
    };

    const handleOpenCounter = async (id) => {
        try {
            const response = await fetch(`/api/counters/${id}/open`, {
                method: 'PUT'
            });

            if (response.ok) {
                const data = await response.json().catch(() => ({}));
                setDoctorNotification(data.message || 'Counter is now active. Queue patients have been notified by email.');
                fetchCounters();
            } else {
                const data = await response.json().catch(() => ({}));
                alert('Error opening counter: ' + (data.message || 'Unknown error'));
            }
        } catch (err) {
            console.error('Error opening counter:', err);
            alert('Error opening counter');
        }
    };

    const handleCloseCounter = async (id) => {
        try {
            const response = await fetch(`/api/counters/${id}/close`, {
                method: 'PUT'
            });

            if (response.ok) {
                fetchCounters();
            } else {
                const error = await response.text();
                alert('Error closing counter: ' + error);
            }
        } catch (err) {
            console.error('Error closing counter:', err);
            alert('Error closing counter');
        }
    };

    const handleServeNextToken = async (id) => {
        try {
            const response = await fetch(`/api/counters/${id}/serve`, {
                method: 'POST'
            });

            if (response.ok) {
                const token = await response.json();
                alert(`Serving token: ${token.tokenNumber}`);
                fetchCounters();
            } else {
                const error = await response.text();
                alert('Error serving token: ' + error);
            }
        } catch (err) {
            console.error('Error serving token:', err);
            alert('Error serving token');
        }
    };

    const getStatusClass = (status) => {
        if (!status) return '';
        switch (status.toLowerCase()) {
            case 'open':
            case 'active': return 'status-active';
            case 'on break': return 'status-break';
            case 'inactive': return 'status-inactive';
            case 'closed': return 'status-closed';
            default: return '';
        }
    };

    return (
        <div className="counter-management">
            <div className="counter-management-header">
                <h2>Counters</h2>
                <p>Manage service counters, assign doctors, and monitor live status.</p>
            </div>
            {doctorNotification && (
                <div className="doctor-notification" role="status" aria-live="polite">
                    <div className="doctor-notification-title">Notification Summary</div>
                    <div>{doctorNotification}</div>
                </div>
            )}

            <div className="toolbar">
                <div className="search-box">
                    <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input type="text" placeholder="Search counters by name..." />
                </div>
                <select className="filter-select">
                    <option>All Statuses</option>
                    <option>Open</option>
                    <option>Closed</option>
                </select>
                <button className="btn-add-counter" onClick={() => setShowAddModal(true)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add Counter
                </button>
            </div>

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>Loading counters...</div>
            ) : (
                <div className="table-container">
                    <table className="counter-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Counter Name</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {counters.length > 0 ? counters.map((counter) => (
                                <tr key={counter.id}>
                                    <td className="id-cell">#C0{counter.id}</td>
                                    <td className="counter-name-cell">
                                        <span className="name">{counter.counterName}</span>
                                        <span className="dept">{counter.serviceType}</span>
                                    </td>
                                    <td className="status-cell">
                                        <span className={`status-badge ${getStatusClass(counter.status)}`}>
                                            {counter.status}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        {counter.status === 'CLOSED' ? (
                                            <button className="action-btn open" onClick={() => handleOpenCounter(counter.id)} title="Open Counter">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                            </button>
                                        ) : (
                                            <>
                                                <button className="action-btn serve" onClick={() => handleServeNextToken(counter.id)} title="Serve Next Token">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                                </button>
                                                <button className="action-btn close" onClick={() => handleCloseCounter(counter.id)} title="Close Counter">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                </button>
                                            </>
                                        )}
                                        <button className="action-btn delete" onClick={() => handleDeleteCounter(counter.id)} title="Delete Counter">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                        No counters found. Create one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Add New Counter</h3>
                            <button className="close-btn" onClick={() => setShowAddModal(false)}>&times;</button>
                        </div>
                        {error && <div style={{ color: '#dc2626', marginBottom: '0.75rem' }}>{error}</div>}
                        <form onSubmit={handleAddCounter}>
                            <div className="form-group">
                                <label>Counter Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Counter 01"
                                    value={newCounter.name}
                                    onChange={(e) => setNewCounter({ ...newCounter, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Department / Specialty</label>
                                <select
                                    value={newCounter.serviceType}
                                    onChange={(e) => setNewCounter({ ...newCounter, serviceType: e.target.value })}
                                >
                                    {medicalSpecialties.map((specialty) => (
                                        <option key={specialty} value={specialty}>{specialty}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Select Doctor</label>
                                <select
                                    required
                                    value={newCounter.doctorId}
                                    onChange={(e) => setNewCounter({ ...newCounter, doctorId: e.target.value })}
                                >
                                    <option value="">Choose doctor</option>
                                    {doctors.map((doctor) => (
                                        <option key={doctor.id} value={doctor.id}>
                                            {doctor.name} ({doctor.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={!newCounter.doctorId}>Create Counter</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CounterManagement;

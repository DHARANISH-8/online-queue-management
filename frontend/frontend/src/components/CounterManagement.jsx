import React, { useState, useEffect } from 'react';
import './CounterManagement.css';

const CounterManagement = () => {
    const [counters, setCounters] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [newCounter, setNewCounter] = useState({
        name: '',
        serviceType: 'General Inquiry',
        staffId: ''
    });

    const services = ['General Inquiry', 'Loans & Mortgages', 'Cash Deposits', 'VIP Services', 'Account Opening'];

    useEffect(() => {
        fetchCounters();
        fetchStaff();
    }, []);

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

    const fetchStaff = async () => {
        try {
            console.log('Fetching staff list for role STAFF...');
            const response = await fetch('/api/users/role/STAFF');
            if (!response.ok) {
                console.error('Fetch staff failed with status:', response.status);
                return;
            }
            const data = await response.json();
            console.log('Staff list response data:', data);
            console.log('Is array?', Array.isArray(data));
            if (Array.isArray(data)) {
                setStaffList(data);
                console.log('Staff list set successfully. Count:', data.length);
            } else {
                console.warn('Received non-array data for staff list:', data);
                setStaffList([]);
            }
        } catch (err) {
            console.error('Error fetching staff:', err);
        }
    };

    const handleAddCounter = async (e) => {
        e.preventDefault();
        try {
            const params = new URLSearchParams();
            params.append('name', newCounter.name);
            params.append('serviceType', newCounter.serviceType);
            params.append('staffId', newCounter.staffId);

            const response = await fetch(`/api/counters?${params.toString()}`, {
                method: 'POST'
            });

            if (response.ok) {
                setShowAddModal(false);
                setNewCounter({ name: '', serviceType: 'General Inquiry', staffId: '' });
                fetchCounters();
            }
        } catch (err) {
            console.error('Error adding counter:', err);
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
                <p>Manage service counters, assign staff, and monitor live status.</p>
            </div>

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
                                <th>Assigned Staff</th>
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
                                    <td>
                                        <div className="staff-cell">
                                            <img
                                                src={`https://ui-avatars.com/api/?name=${counter.staff?.name || 'User'}&background=random`}
                                                alt={counter.staff?.name}
                                                className="staff-avatar"
                                            />
                                            <span className="staff-name">
                                                {counter.staff?.name || 'Unknown'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="status-cell">
                                        <span className={`status-badge ${getStatusClass(counter.status)}`}>
                                            {counter.status}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button className="action-btn">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                        </button>
                                        <button className="action-btn delete" onClick={() => handleDeleteCounter(counter.id)}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
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
                                <label>Service Type</label>
                                <select
                                    value={newCounter.serviceType}
                                    onChange={(e) => setNewCounter({ ...newCounter, serviceType: e.target.value })}
                                >
                                    {services.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Assign Staff</label>
                                <select
                                    required
                                    value={newCounter.staffId}
                                    onChange={(e) => setNewCounter({ ...newCounter, staffId: e.target.value })}
                                >
                                    <option value="">Select Staff</option>
                                    {staffList.map(staff => (
                                        <option key={staff.id} value={staff.id}>{staff.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Create Counter</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CounterManagement;

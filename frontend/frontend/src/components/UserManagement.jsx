import React, { useEffect, useState } from 'react';
import './UserManagement.css';

const ROLE_OPTIONS = ['ADMIN', 'DOCTOR', 'PATIENT'];
const SPECIALTY_OPTIONS = [
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

const emptyForm = {
    name: '',
    email: '',
    phone: '',
    role: 'PATIENT',
    specialty: '',
    password: ''
};

const PAGE_SIZE = 8;

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/users');
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            const data = await response.json();
            setUsers(Array.isArray(data) ? data : []);
            setCurrentPage(1);
            setError('');
        } catch (err) {
            setError(err.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingUser(null);
        setForm(emptyForm);
        setError('');
        setSuccess('');
        setShowModal(true);
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setForm({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            role: user.role === 'CUSTOMER' ? 'PATIENT' : (user.role || 'PATIENT'),
            specialty: user.specialty || '',
            password: ''
        });
        setError('');
        setSuccess('');
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');
        try {
            const isCreate = !editingUser;
            const endpoint = isCreate ? '/api/users' : `/api/users/${editingUser.id}`;
            const method = isCreate ? 'POST' : 'PUT';
            const payload = {
                name: form.name,
                email: form.email,
                phone: form.phone,
                role: form.role,
                specialty: form.role === 'DOCTOR' || form.role === 'STAFF' ? form.specialty : null
            };
            if (isCreate || form.password.trim()) {
                payload.password = form.password;
            }

            const response = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }
            setSuccess(isCreate ? 'User created successfully.' : 'User updated successfully.');
            setShowModal(false);
            await fetchUsers();
        } catch (err) {
            setError(err.message || 'Failed to save user');
        } finally {
            setSubmitting(false);
        }
    };

    const toggleUserStatus = async (user) => {
        const action = user.active ? 'deactivate' : 'activate';
        try {
            setError('');
            setSuccess('');
            const response = await fetch(`/api/users/${user.id}/${action}`, { method: 'PUT' });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.message || `Failed to ${action} user`);
            }
            setSuccess(`User ${action}d successfully.`);
            await fetchUsers();
        } catch (err) {
            setError(err.message || `Failed to ${action} user`);
        }
    };

    const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const paginatedUsers = users.slice(startIndex, endIndex);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    return (
        <div className="user-management">
            <div className="user-management-header">
                <div>
                    <h2>User Management</h2>
                    <p>Create, update, and deactivate user accounts.</p>
                </div>
                <button onClick={openCreateModal} className="user-primary-btn">
                    Add User
                </button>
            </div>

            {error && <div className="user-alert error">{error}</div>}
            {success && <div className="user-alert success">{success}</div>}

            {loading ? (
                <div className="user-loading">Loading users...</div>
            ) : (
                <div className="user-table-wrap">
                    <table className="user-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Specialty</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.role === 'CUSTOMER' ? 'PATIENT' : user.role}</td>
                                    <td>{user.specialty || '-'}</td>
                                    <td className={`user-status ${user.active ? 'active' : 'inactive'}`}>
                                        {user.active ? 'ACTIVE' : 'INACTIVE'}
                                    </td>
                                    <td className="user-actions">
                                        <button onClick={() => openEditModal(user)} className="user-edit-btn">
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => toggleUserStatus(user)}
                                            className={`user-toggle-btn ${user.active ? 'active' : 'inactive'}`}
                                        >
                                            {user.active ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="user-empty">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {!loading && users.length > 0 && (
                <div className="user-pagination">
                    <span className="user-summary">
                        Showing {startIndex + 1}-{Math.min(endIndex, users.length)} of {users.length}
                    </span>
                    <div className="user-pagination-controls">
                        <button
                            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                            disabled={safePage === 1}
                            className="user-page-btn"
                        >
                            Previous
                        </button>
                        <span className="user-pagination-status">Page {safePage} of {totalPages}</span>
                        <button
                            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                            disabled={safePage === totalPages}
                            className="user-page-btn"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="user-modal-overlay">
                    <div className="user-modal-card">
                        <div className="user-modal-header">
                            <h3>{editingUser ? 'Edit User' : 'Create User'}</h3>
                            <button onClick={() => setShowModal(false)} className="user-icon-btn">x</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="user-form-row">
                                <label>Name</label>
                                <input
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="user-form-control"
                                />
                            </div>
                            <div className="user-form-row">
                                <label>Email</label>
                                <input
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="user-form-control"
                                />
                            </div>
                            <div className="user-form-row">
                                <label>Phone</label>
                                <input
                                    required
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    className="user-form-control"
                                />
                            </div>
                            <div className="user-form-row">
                                <label>Role</label>
                                <select
                                    value={form.role}
                                    onChange={(e) => {
                                        const selectedRole = e.target.value;
                                        setForm({
                                            ...form,
                                            role: selectedRole,
                                            specialty: selectedRole === 'DOCTOR' || selectedRole === 'STAFF'
                                                ? (form.specialty || SPECIALTY_OPTIONS[0])
                                                : ''
                                        });
                                    }}
                                    className="user-form-control"
                                >
                                    {ROLE_OPTIONS.map((role) => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                            </div>
                            {(form.role === 'DOCTOR' || form.role === 'STAFF') && (
                                <div className="user-form-row">
                                    <label>Specialty</label>
                                    <select
                                        value={form.specialty}
                                        onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                                        className="user-form-control"
                                    >
                                        {SPECIALTY_OPTIONS.map((specialty) => (
                                            <option key={specialty} value={specialty}>{specialty}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="user-form-row">
                                <label>{editingUser ? 'Password (optional to change)' : 'Password'}</label>
                                <input
                                    type="password"
                                    required={!editingUser}
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className="user-form-control"
                                />
                            </div>
                            <div className="user-form-actions">
                                <button type="button" onClick={() => setShowModal(false)} className="user-cancel-btn">
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting} className="user-submit-btn">
                                    {submitting ? 'Saving...' : (editingUser ? 'Update User' : 'Create User')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;

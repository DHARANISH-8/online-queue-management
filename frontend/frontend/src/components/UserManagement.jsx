import React, { useEffect, useState } from 'react';

const ROLE_OPTIONS = ['ADMIN', 'DOCTOR', 'PATIENT'];

const emptyForm = {
    name: '',
    email: '',
    phone: '',
    role: 'PATIENT',
    password: ''
};

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);

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
                role: form.role
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

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                    <h2 style={{ marginBottom: '0.4rem' }}>User Management</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Create, update, and deactivate user accounts.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    style={{ padding: '0.6rem 1rem', border: 'none', borderRadius: '8px', background: '#0f766e', color: '#fff', cursor: 'pointer' }}
                >
                    Add User
                </button>
            </div>

            {error && <div style={{ color: '#dc2626', marginBottom: '0.75rem' }}>{error}</div>}
            {success && <div style={{ color: '#16a34a', marginBottom: '0.75rem' }}>{success}</div>}

            {loading ? (
                <div>Loading users...</div>
            ) : (
                <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc' }}>
                                <th style={{ padding: '0.8rem', textAlign: 'left' }}>Name</th>
                                <th style={{ padding: '0.8rem', textAlign: 'left' }}>Email</th>
                                <th style={{ padding: '0.8rem', textAlign: 'left' }}>Role</th>
                                <th style={{ padding: '0.8rem', textAlign: 'left' }}>Status</th>
                                <th style={{ padding: '0.8rem', textAlign: 'left' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '0.8rem' }}>{user.name}</td>
                                    <td style={{ padding: '0.8rem' }}>{user.email}</td>
                                    <td style={{ padding: '0.8rem' }}>{user.role === 'CUSTOMER' ? 'PATIENT' : user.role}</td>
                                    <td style={{ padding: '0.8rem', color: user.active ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                                        {user.active ? 'ACTIVE' : 'INACTIVE'}
                                    </td>
                                    <td style={{ padding: '0.8rem', display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => openEditModal(user)}
                                            style={{ padding: '0.35rem 0.65rem', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', cursor: 'pointer' }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => toggleUserStatus(user)}
                                            style={{
                                                padding: '0.35rem 0.65rem',
                                                border: 'none',
                                                borderRadius: '6px',
                                                background: user.active ? '#ef4444' : '#16a34a',
                                                color: '#fff',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {user.active ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(15, 23, 42, 0.45)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1100
                }}>
                    <div style={{ width: '100%', maxWidth: '520px', background: '#fff', borderRadius: '12px', padding: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0 }}>{editingUser ? 'Edit User' : 'Create User'}</h3>
                            <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>x</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '0.8rem' }}>
                                <label>Name</label>
                                <input
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    style={{ width: '100%', padding: '0.55rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                                />
                            </div>
                            <div style={{ marginBottom: '0.8rem' }}>
                                <label>Email</label>
                                <input
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    style={{ width: '100%', padding: '0.55rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                                />
                            </div>
                            <div style={{ marginBottom: '0.8rem' }}>
                                <label>Phone</label>
                                <input
                                    required
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    style={{ width: '100%', padding: '0.55rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                                />
                            </div>
                            <div style={{ marginBottom: '0.8rem' }}>
                                <label>Role</label>
                                <select
                                    value={form.role}
                                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                                    style={{ width: '100%', padding: '0.55rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                                >
                                    {ROLE_OPTIONS.map((role) => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label>{editingUser ? 'Password (optional to change)' : 'Password'}</label>
                                <input
                                    type="password"
                                    required={!editingUser}
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    style={{ width: '100%', padding: '0.55rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.55rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting} style={{ padding: '0.55rem 0.9rem', borderRadius: '8px', border: 'none', background: '#0f766e', color: '#fff', cursor: 'pointer' }}>
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

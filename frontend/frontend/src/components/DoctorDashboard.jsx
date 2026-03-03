import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './DoctorDashboard.css';

const POLL_INTERVAL_MS = 4000;

const DoctorDashboard = ({ user, onLogout }) => {
    const [dashboard, setDashboard] = useState({
        currentPatient: null,
        waitingQueue: [],
        totalWaiting: 0
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isCallingNext, setIsCallingNext] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const [isStartingQueue, setIsStartingQueue] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [lastUpdated, setLastUpdated] = useState(null);

    const doctorName = useMemo(() => (user?.name || 'Doctor'), [user]);

    const fetchDashboard = useCallback(async () => {
        if (!user?.id) {
            return;
        }
        try {
            const response = await fetch(`/api/queue/doctor/${user.id}/dashboard`);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Unable to load consultation dashboard.');
            }
            setDashboard({
                currentPatient: data.currentPatient || null,
                waitingQueue: Array.isArray(data.waitingQueue) ? data.waitingQueue : [],
                totalWaiting: Number(data.totalWaiting || 0)
            });
            setError('');
            setLastUpdated(new Date());
        } catch (err) {
            setError(err.message || 'Unable to load consultation dashboard.');
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchDashboard();
        const intervalId = setInterval(fetchDashboard, POLL_INTERVAL_MS);
        return () => clearInterval(intervalId);
    }, [fetchDashboard]);

    useEffect(() => {
        if (!successMessage) {
            return undefined;
        }
        const timer = setTimeout(() => setSuccessMessage(''), 5000);
        return () => clearTimeout(timer);
    }, [successMessage]);

    const handleStartQueue = async () => {
        if (!user?.id) {
            return;
        }
        setIsStartingQueue(true);
        try {
            const response = await fetch(`/api/queue/doctor/${user.id}/start`, { method: 'PUT' });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Unable to start queue.');
            }
            setError('');
            setSuccessMessage(data.message || 'Queue is live. Patients enrolled under your queue were notified by email.');
            await fetchDashboard();
        } catch (err) {
            setError(err.message || 'Unable to start queue.');
        } finally {
            setIsStartingQueue(false);
        }
    };

    const handleCallNext = async () => {
        if (!user?.id) {
            return;
        }
        setIsCallingNext(true);
        try {
            const response = await fetch(`/api/queue/doctor/${user.id}/call-next`, { method: 'PUT' });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Unable to call next patient.');
            }
            setError('');
            await fetchDashboard();
        } catch (err) {
            setError(err.message || 'Unable to call next patient.');
        } finally {
            setIsCallingNext(false);
        }
    };

    const handleCompleteCurrent = async () => {
        if (!user?.id) {
            return;
        }
        setIsCompleting(true);
        try {
            const response = await fetch(`/api/queue/doctor/${user.id}/complete-current`, { method: 'PUT' });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Unable to complete consultation.');
            }
            setError('');
            await fetchDashboard();
        } catch (err) {
            setError(err.message || 'Unable to complete consultation.');
        } finally {
            setIsCompleting(false);
        }
    };

    const formatStatus = (status) => {
        if (!status) {
            return '';
        }
        if (status === 'IN_CONSULTATION' || status === 'SERVED') {
            return 'In Consultation';
        }
        return status.replace(/_/g, ' ').toLowerCase().replace(/(^|\s)\S/g, (s) => s.toUpperCase());
    };

    if (isLoading) {
        return (
            <div className="doctor-dashboard-loading">
                <p>Loading consultation dashboard...</p>
            </div>
        );
    }

    const canCallNext = !dashboard.currentPatient && dashboard.waitingQueue.length > 0;

    return (
        <div className="doctor-dashboard">
            <header className="doctor-header">
                <div>
                    <h1>Consultation Dashboard</h1>
                    <p>Manage patient consultations and live queue updates.</p>
                </div>
                <div className="doctor-header-right">
                    <div className="doctor-profile">
                        <strong>{doctorName}</strong>
                        <span>{user?.role || 'DOCTOR'}</span>
                    </div>
                    <button className="doctor-logout" onClick={onLogout}>Logout</button>
                </div>
            </header>

            {error && (
                <div className="doctor-error" role="alert">
                    <div className="doctor-alert-title">Unable to process request</div>
                    <div>{error}</div>
                </div>
            )}
            {successMessage && (
                <div className="doctor-success" role="status" aria-live="polite">
                    <div className="doctor-alert-title">Queue started</div>
                    <div>{successMessage}</div>
                </div>
            )}

            <section className="doctor-current-card">
                <div className="doctor-current-head">
                    <h2>Current Patient</h2>
                    <span className={`doctor-status-badge ${dashboard.currentPatient ? 'active' : 'idle'}`}>
                        {dashboard.currentPatient ? 'IN PROGRESS' : 'IDLE'}
                    </span>
                </div>

                {dashboard.currentPatient ? (
                    <div className="doctor-current-body">
                        <div className="doctor-token-box">{dashboard.currentPatient.displayToken}</div>
                        <div className="doctor-patient-info">
                            <p><strong>{dashboard.currentPatient.patient?.name || 'Unknown Patient'}</strong></p>
                            <p>{dashboard.currentPatient.patient?.email || 'No email available'}</p>
                            <p>{dashboard.currentPatient.department || dashboard.currentPatient.serviceType || 'General'}</p>
                        </div>
                    </div>
                ) : (
                    <div className="doctor-empty-state">
                        <p>No patient in consultation right now.</p>
                    </div>
                )}

                <div className="doctor-actions">
                    <button
                        className="btn-start"
                        onClick={handleStartQueue}
                        disabled={isStartingQueue}
                    >
                        {isStartingQueue ? 'Starting...' : 'Start Queue'}
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handleCallNext}
                        disabled={!canCallNext || isCallingNext}
                    >
                        {isCallingNext ? 'Calling...' : 'Call Next Patient'}
                    </button>
                    <button
                        className="btn-success"
                        onClick={handleCompleteCurrent}
                        disabled={!dashboard.currentPatient || isCompleting}
                    >
                        {isCompleting ? 'Completing...' : 'Mark as Completed'}
                    </button>
                </div>
            </section>

            <section className="doctor-queue-card">
                <div className="doctor-queue-head">
                    <h3>Waiting Queue</h3>
                    <div className="doctor-metrics">
                        <span>{dashboard.totalWaiting} Patients Waiting</span>
                        <small>Auto-refresh every {POLL_INTERVAL_MS / 1000}s</small>
                    </div>
                </div>
                <div className="doctor-queue-table-wrap">
                    <table className="doctor-queue-table">
                        <thead>
                            <tr>
                                <th>Token</th>
                                <th>Patient Name</th>
                                <th>Department</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dashboard.currentPatient && (
                                <tr>
                                    <td>{dashboard.currentPatient.displayToken}</td>
                                    <td>{dashboard.currentPatient.patient?.name || '-'}</td>
                                    <td>{dashboard.currentPatient.department || '-'}</td>
                                    <td>
                                        <span className="queue-status in-consultation">{formatStatus(dashboard.currentPatient.status)}</span>
                                    </td>
                                </tr>
                            )}
                            {dashboard.waitingQueue.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.displayToken}</td>
                                    <td>{item.patient?.name || '-'}</td>
                                    <td>{item.department || '-'}</td>
                                    <td>
                                        <span className="queue-status waiting">{formatStatus(item.status)}</span>
                                    </td>
                                </tr>
                            ))}
                            {!dashboard.currentPatient && dashboard.waitingQueue.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="doctor-empty-row">No patients in queue.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="doctor-updated-at">
                    {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Waiting for first update...'}
                </div>
            </section>
        </div>
    );
};

export default DoctorDashboard;

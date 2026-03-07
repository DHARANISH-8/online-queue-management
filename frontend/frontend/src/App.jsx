import { useEffect, useState } from 'react';
import Auth from "./components/Auth";
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";
import DoctorDashboard from "./components/DoctorDashboard";

const AUTH_STORAGE_KEY = 'apolloq_user';

function App() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (user) {
    const role = (user.role || '').toUpperCase();
    if (role === 'CUSTOMER' || role === 'USER' || role === 'PATIENT') {
      return <UserDashboard user={user} onLogout={handleLogout} />;
    }
    if (role === 'ADMIN') {
      return <AdminDashboard user={user} onLogout={handleLogout} />;
    }
    if (role === 'DOCTOR') {
      return <DoctorDashboard user={user} onLogout={handleLogout} />;
    }
    if (role === 'STAFF') {
      return <AdminDashboard user={user} onLogout={handleLogout} />;
    }
    // Fallback for other roles
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Welcome, {user.name}</h1>
        <p>Dashboard for role {user.role} coming soon.</p>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  return <Auth onLogin={handleLogin} />;
}

export default App;

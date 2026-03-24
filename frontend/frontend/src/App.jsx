import { useEffect, useState } from 'react';
import Auth from "./components/Auth";
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";
import DoctorDashboard from "./components/DoctorDashboard";
import BrandLogo from "./components/BrandLogo";
import LandingPage from "./components/LandingPage";

import "./App.css";

const AUTH_STORAGE_KEY = 'apolloq_user';

function App() {
  const [screen, setScreen] = useState('landing');
  const [authMode, setAuthMode] = useState('login');
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
    setScreen('landing');
  };

  const openAuth = (mode = 'login') => {
    setAuthMode(mode);
    setScreen('auth');
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
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <BrandLogo />
        </div>
        <h1>Welcome, {user.name}</h1>
        <p>Dashboard for role {user.role} coming soon.</p>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  if (screen === 'auth') {
    return (
      <Auth
        initialMode={authMode}
        onBack={() => setScreen('landing')}
        onLogin={handleLogin}
      />
    );
  }

  return (
    <LandingPage
      onBookNow={() => openAuth('signup')}
      onLogin={() => openAuth('login')}
    />
  );
}

export default App;

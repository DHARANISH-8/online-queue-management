import { useState } from 'react';
import Auth from "./components/Auth";
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (user) {
    const role = user.role.toUpperCase();
    if (role === 'CUSTOMER' || role === 'USER') {
      return <UserDashboard user={user} onLogout={handleLogout} />;
    }
    if (role === 'ADMIN') {
      return <AdminDashboard user={user} onLogout={handleLogout} />;
    }
    // Fallback for other roles (we can add StaffDashboard later)
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

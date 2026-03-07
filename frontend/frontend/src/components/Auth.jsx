import React, { useState } from 'react';
import './Auth.css';
import luxuryBg from '../assets/luxury-minimalist.avif';
import logo from "../assets/apollo_logo-removebg-preview.png";


const Auth = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState('CUSTOMER');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const checkPasswordStrength = (pwd) => {
        return {
            length: pwd.length >= 8,
            uppercase: /[A-Z]/.test(pwd),
            lowercase: /[a-z]/.test(pwd),
            number: /[0-9]/.test(pwd),
            special: /[!@#$%^&*]/.test(pwd),
        };
    };

    const passwordStrength = checkPasswordStrength(password);
    const isPasswordValid = Object.values(passwordStrength).every(Boolean);

    const handleSignup = async () => {
        if (!isPasswordValid) {
            setError('Password does not meet requirements.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: fullName, email, phone, password, role }),
            });
            const data = await response.json();
            if (response.ok) {
                setSuccess('Account created! Please login.');
                setIsLogin(true);
                setError('');
                // Reset form
                setFullName('');
                setEmail('');
                setPhone('');
                setPassword('');
                setConfirmPassword('');
                setRole('CUSTOMER');
            } else {
                setError(data.message || 'Signup failed.');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        }
    };

    const handleLogin = async () => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (response.ok) {
                const userRole = data.role.toUpperCase();
                const selectedRole = role.toUpperCase();

                // Allow 'USER' from backend to match 'CUSTOMER' in frontend
                const isMatch = (userRole === selectedRole) || (userRole === 'USER' && selectedRole === 'CUSTOMER');

                if (!isMatch) {
                    setError(`This account is registered as ${data.role}. Please select the correct role.`);
                    return;
                }
                setSuccess(`Welcome back, ${data.name}!`);
                setError('');

                // Store user data and trigger login callback
                if (onLogin) {
                    onLogin(data);
                }
            } else {
                setError(data.message || 'Login failed.');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (isLogin) {
            handleLogin();
        } else {
            handleSignup();
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                {/* Left Side - Branding */}
                <div className="auth-left" style={{ backgroundImage: `url(${luxuryBg})` }}>
                    <div className="auth-branding">
                        <h1>Apollo Hospitals Smart Queue</h1>
                        <p>
                            apolloQ helps Apollo Hospitals manage patient queues, counters, and waiting times seamlessly for a smoother care experience.
                        </p>
                    </div>
                </div>

                {/* Right Side - Auth Form */}
                <div className="auth-right">
                    <div className="auth-right-content">
                        <div className="auth-header">
                            <div className="logo">

                                <img src={logo} alt="logo" className="apollo-logo" />
                                <div className="logo-text">
                                    <span className="logo-title">apolloQ</span>
                                    <span className="logo-subtitle">Apollo Hospitals Queue Management</span>
                                </div>
                            </div>
                            <div className="auth-tabs">
                                <button
                                    className={`auth-tab ${isLogin ? 'active' : ''}`}
                                    onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
                                >
                                    Login
                                </button>
                                <button
                                    className={`auth-tab ${!isLogin ? 'active' : ''}`}
                                    onClick={() => { setIsLogin(false); setRole('CUSTOMER'); setError(''); setSuccess(''); }}
                                >
                                    Sign Up
                                </button>
                            </div>
                        </div>

                        <div className="auth-form-container">
                            <h2>{isLogin ? 'Welcome back' : 'Create an account'}</h2>
                            <p>{isLogin ? 'Sign in to manage Apollo Hospitals queues with apolloQ.' : 'Get started with ApolloQ today.'}</p>

                            {error && <div className="auth-message error">{error}</div>}
                            {success && <div className="auth-message success">{success}</div>}

                            <form onSubmit={handleSubmit}>
                                {!isLogin && (
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input
                                            type="text"
                                            placeholder="John Doe"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            required
                                        />
                                    </div>
                                )}

                                <div className="form-group">
                                    <label>Email address</label>
                                    <input
                                        type="email"
                                        placeholder="name@gmail.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                {!isLogin && (
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input
                                            type="tel"
                                            placeholder="+1 234 567 8900"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            required
                                        />
                                    </div>
                                )}


                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Password</label>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onFocus={() => setIsPasswordFocused(true)}
                                            onBlur={() => setIsPasswordFocused(false)}
                                            required
                                        />
                                        {!isLogin && isPasswordFocused && (
                                            <div className="password-feedback">
                                                <div className={`feedback-item ${passwordStrength.length ? 'valid' : 'invalid'}`}>Currently {password.length} chars (Min 8)</div>
                                                <div className={`feedback-item ${passwordStrength.uppercase ? 'valid' : 'invalid'}`}>1 Uppercase</div>
                                                <div className={`feedback-item ${passwordStrength.lowercase ? 'valid' : 'invalid'}`}>1 Lowercase</div>
                                                <div className={`feedback-item ${passwordStrength.number ? 'valid' : 'invalid'}`}>1 Number</div>
                                                <div className={`feedback-item ${passwordStrength.special ? 'valid' : 'invalid'}`}>1 Special Char (!@#$%^&*)</div>
                                            </div>
                                        )}
                                    </div>
                                    {!isLogin && (
                                        <div className="form-group">
                                            <label>Confirm Password</label>
                                            <input
                                                type="password"
                                                placeholder="••••••••"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                    )}
                                </div>

                                {isLogin && (
                                    <div className="forgot-password">
                                        <a href="#">Forgot password?</a>
                                    </div>
                                )}

                                <div className="form-group">
                                    <label>Role</label>
                                    <div className="role-selection">
                                        {isLogin ? (
                                            <>
                                                <div
                                                    className={`role-card ${role === 'CUSTOMER' ? 'active' : ''}`}
                                                    onClick={() => setRole('CUSTOMER')}
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                                        <circle cx="12" cy="7" r="4"></circle>
                                                    </svg>
                                                    <span>Patient</span>
                                                </div>
                                                <div
                                                    className={`role-card ${role === 'DOCTOR' ? 'active' : ''}`}
                                                    onClick={() => setRole('DOCTOR')}
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M12 2v20"></path>
                                                        <path d="M17 7H7"></path>
                                                        <path d="M17 17H7"></path>
                                                    </svg>
                                                    <span>Doctor</span>
                                                </div>
                                                <div
                                                    className={`role-card ${role === 'ADMIN' ? 'active' : ''}`}
                                                    onClick={() => setRole('ADMIN')}
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                                    </svg>
                                                    <span>Admin</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div
                                                className="role-card active"
                                                onClick={() => setRole('CUSTOMER')}
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                                    <circle cx="12" cy="7" r="4"></circle>
                                                </svg>
                                                <span>Patient</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={!isLogin && !isPasswordValid}
                                >
                                    {isLogin ? 'Login' : 'Sign Up'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;

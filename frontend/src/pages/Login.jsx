import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Login = ({ onRegisterLink }) => {
  const { login, verify2FA } = useContext(AuthContext);
  
  // Login Form States
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('EMPLOYEE');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 2FA States
  const [is2faRequired, setIs2faRequired] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  // Password reset message
  const [infoMessage, setInfoMessage] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setLoading(true);

    try {
      const result = await login(usernameOrEmail, password, role, rememberMe);
      if (result.twoFactorRequired) {
        setIs2faRequired(true);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handle2faSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verify2FA(usernameOrEmail, twoFactorCode, rememberMe);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!usernameOrEmail) {
      setError('Please enter your Username or Email in the input first to reset password.');
      return;
    }
    setError('');
    setInfoMessage('');
    try {
      await api.post(`/auth/forgot-password?email=${usernameOrEmail}`);
      setInfoMessage('A password reset instruction was sent (please check backend server logs).');
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset request failed.');
    }
  };

  return (
    <div className="container-fluid d-flex align-items-center justify-content-center min-vh-100" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="card-custom animate-fade-in shadow-lg" style={{ width: '420px', transition: 'all var(--transition-speed)' }}>
        
        {/* Banner */}
        <div className="text-center mb-4">
          <i className="bi bi-shield-lock text-primary" style={{ fontSize: '3rem', color: 'var(--theme-primary) !important' }}></i>
          <h3 className="mt-2 font-weight-bold">EMS Suite</h3>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>Enterprise Employee Management System</p>
        </div>

        {error && <div className="alert alert-danger py-2" role="alert" style={{ fontSize: '0.85rem' }}>{error}</div>}
        {infoMessage && <div className="alert alert-success py-2" role="alert" style={{ fontSize: '0.85rem' }}>{infoMessage}</div>}

        {/* Regular Login Form */}
        {!is2faRequired ? (
          <form onSubmit={handleLoginSubmit}>
            <div className="mb-3">
              <label className="form-label font-weight-bold" style={{ fontSize: '0.85rem' }}>Username or Email</label>
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0 text-muted"><i className="bi bi-person"></i></span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="e.g. employee / emp@ems.com"
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label font-weight-bold" style={{ fontSize: '0.85rem' }}>Password</label>
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0 text-muted"><i className="bi bi-lock"></i></span>
                <input
                  type="password"
                  className="form-control border-start-0"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label font-weight-bold" style={{ fontSize: '0.85rem' }}>Log in Role</label>
              <select
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="HR_MANAGER">HR Manager</option>
                <option value="DEPARTMENT_MANAGER">Department Manager</option>
                <option value="TEAM_LEAD">Team Lead</option>
                <option value="EMPLOYEE">Employee</option>
              </select>
              <small className="text-muted mt-1 d-block" style={{ fontSize: '0.75rem' }}>
                Note: Selected role must match registered credentials.
              </small>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3" style={{ fontSize: '0.85rem' }}>
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label className="form-check-label text-secondary" htmlFor="rememberMe">Remember Me</label>
              </div>
              <button type="button" className="btn btn-link text-decoration-none p-0" style={{ fontSize: '0.85rem' }} onClick={handleForgotPassword}>
                Forgot Password?
              </button>
            </div>

            <button type="submit" className="btn btn-primary-custom w-100 py-2 d-flex align-items-center justify-content-center gap-2" disabled={loading}>
              {loading && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>}
              <span>Sign In</span>
            </button>

            <div className="text-center mt-3" style={{ fontSize: '0.85rem' }}>
              <span className="text-muted">New Employee? </span>
              <button type="button" className="btn btn-link text-decoration-none p-0" style={{ fontSize: '0.85rem' }} onClick={onRegisterLink}>
                Register Profile
              </button>
            </div>
          </form>
        ) : (
          /* 2FA Verification Form */
          <form onSubmit={handle2faSubmit}>
            <div className="mb-3">
              <label className="form-label font-weight-bold" style={{ fontSize: '0.85rem' }}>Two-Factor Verification Code</label>
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0 text-muted"><i className="bi bi-shield-check"></i></span>
                <input
                  type="text"
                  className="form-control border-start-0 text-center font-weight-bold"
                  style={{ letterSpacing: '4px', fontSize: '1.1rem' }}
                  maxLength="6"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder="123456"
                  required
                />
              </div>
              <small className="text-muted mt-2 d-block text-center" style={{ fontSize: '0.75rem' }}>
                Check the backend console log for the 6-digit verification code.
              </small>
            </div>

            <button type="submit" className="btn btn-primary-custom w-100 py-2" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>

            <button type="button" className="btn btn-outline-secondary w-100 mt-2 py-2" onClick={() => setIs2faRequired(false)}>
              Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;

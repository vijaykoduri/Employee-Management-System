import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Register = ({ onLoginLink }) => {
  const [departments, setDepartments] = useState([]);
  
  // Registration Form States
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('EMPLOYEE');
  const [departmentId, setDepartmentId] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const response = await api.get('/auth/departments');
        setDepartments(response.data);
        if (response.data.length > 0) {
          setDepartmentId(response.data[0].id);
        }
      } catch (err) {
        console.error('Failed to load departments', err);
      }
    };
    loadDepartments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (role !== 'SUPER_ADMIN' && !departmentId) {
      setError('Department is mandatory for non-admin accounts.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/register', {
        fullName,
        username,
        email,
        phoneNumber,
        password,
        confirmPassword,
        role,
        departmentId: role === 'SUPER_ADMIN' ? null : parseInt(departmentId),
      });

      setSuccess('Account profile registered successfully! Redirecting to login...');
      setTimeout(() => {
        onLoginLink();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Check details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid d-flex align-items-center justify-content-center min-vh-100 py-5" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="card-custom animate-fade-in shadow-lg" style={{ width: '480px' }}>
        
        <div className="text-center mb-4">
          <i className="bi bi-person-plus text-primary" style={{ fontSize: '3rem', color: 'var(--theme-primary) !important' }}></i>
          <h3 className="mt-2 font-weight-bold">Register Profile</h3>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>Scaffold employee account details</p>
        </div>

        {error && <div className="alert alert-danger py-2" style={{ fontSize: '0.85rem' }}>{error}</div>}
        {success && <div className="alert alert-success py-2" style={{ fontSize: '0.85rem' }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label font-weight-bold" style={{ fontSize: '0.85rem' }}>Full Name</label>
              <input
                type="text"
                className="form-control"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. John Doe"
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label font-weight-bold" style={{ fontSize: '0.85rem' }}>Username</label>
              <input
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. johndoe"
                required
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label font-weight-bold" style={{ fontSize: '0.85rem' }}>Email Address</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label font-weight-bold" style={{ fontSize: '0.85rem' }}>Phone Number</label>
              <input
                type="text"
                className="form-control"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+12345678"
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label font-weight-bold" style={{ fontSize: '0.85rem' }}>Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label font-weight-bold" style={{ fontSize: '0.85rem' }}>Confirm Password</label>
              <input
                type="password"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label font-weight-bold" style={{ fontSize: '0.85rem' }}>Authority Role</label>
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
            </div>
            {role !== 'SUPER_ADMIN' && (
              <div className="col-md-6 mb-3">
                <label className="form-label font-weight-bold" style={{ fontSize: '0.85rem' }}>Department</label>
                <select
                  className="form-select"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  required
                >
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary-custom w-100 py-2 mt-2" disabled={loading}>
            {loading ? 'Registering...' : 'Register Account'}
          </button>

          <div className="text-center mt-3" style={{ fontSize: '0.85rem' }}>
            <span className="text-muted">Already registered? </span>
            <button type="button" className="btn btn-link text-decoration-none p-0" style={{ fontSize: '0.85rem' }} onClick={onLoginLink}>
              Log In
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default Register;

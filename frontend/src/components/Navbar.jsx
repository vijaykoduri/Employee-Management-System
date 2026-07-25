import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Navbar = ({ setCurrentPage }) => {
  const { user, theme, toggleTheme, logout } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const response = await api.get(`/notifications/employee/${user.userId}/unread`);
        setNotifications(response.data);
      } catch (error) {
        console.error('Failed to load notifications', error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15s

    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error('Failed to read notification', error);
    }
  };

  const formatNotificationTime = (createdAt) => {
    if (!createdAt) return '';
    try {
      if (Array.isArray(createdAt)) {
        const [year, month, day, hour, minute] = createdAt;
        const d = new Date(year, month - 1, day, hour, minute);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      const d = new Date(createdAt);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  if (!user) return null;

  return (
    <nav className="navbar navbar-expand px-4 py-2 mb-4 card-custom animate-fade-in" style={{ borderRadius: '0 0 1rem 1rem', position: 'relative', zIndex: 10 }}>
      <div className="container-fluid d-flex justify-content-between align-items-center">
        {/* Left Side: Role Badge */}
        <div className="d-flex align-items-center gap-2">
          <h5 className="mb-0 text-secondary">Welcome, {user.fullName}</h5>
          <span className="badge bg-primary-custom" style={{ textTransform: 'capitalize', fontSize: '0.8rem' }}>
            {user.role.replace('_', ' ').toLowerCase()}
          </span>
        </div>

        {/* Right Side Actions */}
        <div className="d-flex align-items-center gap-3">
          {/* Light/Dark Mode Switcher */}
          <button className="btn btn-link text-secondary p-0" onClick={toggleTheme} title="Toggle Theme">
            <i className={`bi ${theme === 'light' ? 'bi-moon-stars-fill' : 'bi-sun-fill'}`} style={{ fontSize: '1.25rem' }}></i>
          </button>

          {/* Notifications Dropdown */}
          <div className="position-relative">
            <button className="btn btn-link text-secondary p-0 position-relative" onClick={() => setShowNotifications(!showNotifications)}>
              <i className="bi bi-bell-fill" style={{ fontSize: '1.25rem' }}></i>
              {notifications.length > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                  {notifications.length}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="position-absolute end-0 mt-3 card-custom p-3 shadow-lg" style={{ width: '320px', zIndex: 1050, maxHeight: '400px', overflowY: 'auto' }}>
                <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                  <h6 className="mb-0 font-weight-bold">Notifications</h6>
                  <button className="btn btn-link text-muted p-0" onClick={() => setShowNotifications(false)}>Close</button>
                </div>
                {notifications.length === 0 ? (
                  <p className="text-muted text-center py-2 mb-0" style={{ fontSize: '0.85rem' }}>No new notifications</p>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-2 border-bottom d-flex flex-column gap-1">
                        <p className="mb-0 text-secondary" style={{ fontSize: '0.85rem' }}>{n.message}</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                            {formatNotificationTime(n.createdAt)}
                          </small>
                          <button className="btn btn-link text-primary p-0" style={{ fontSize: '0.75rem' }} onClick={() => handleMarkAsRead(n.id)}>
                            Mark as read
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="dropdown">
            <button className="btn btn-link text-secondary p-0 d-flex align-items-center gap-2 text-decoration-none dropdown-toggle" type="button" data-bs-toggle="dropdown">
              <i className="bi bi-person-circle" style={{ fontSize: '1.4rem' }}></i>
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow border-0 p-2 mt-2" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
              <li>
                <button className="dropdown-item rounded d-flex align-items-center gap-2 py-2" onClick={() => setCurrentPage('profile')}>
                  <i className="bi bi-person"></i>
                  <span>My Profile</span>
                </button>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button className="dropdown-item rounded text-danger d-flex align-items-center gap-2 py-2" onClick={logout}>
                  <i className="bi bi-box-arrow-left"></i>
                  <span>Log Out</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

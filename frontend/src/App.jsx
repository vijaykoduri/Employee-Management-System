import React, { useContext, useState } from 'react';
import { AuthContext } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Dashboard Views
import SuperAdminDashboard from './pages/dashboards/SuperAdminDashboard';
import HrManagerDashboard from './pages/dashboards/HrManagerDashboard';
import DeptManagerDashboard from './pages/dashboards/DeptManagerDashboard';
import TeamLeadDashboard from './pages/dashboards/TeamLeadDashboard';
import EmployeeDashboard from './pages/dashboards/EmployeeDashboard';

// Sub Workspace Pages
import Employees from './pages/Employees';
import DeptEmployees from './pages/DeptEmployees';
import Departments from './pages/Departments';
import Attendance from './pages/Attendance';
import Leaves from './pages/Leaves';
import Payroll from './pages/Payroll';
import Projects from './pages/Projects';
import Performance from './pages/Performance';
import Reports from './pages/Reports';
import AuditLogs from './pages/AuditLogs';
import Profile from './pages/Profile';
import Announcements from './pages/Announcements';

const AppContent = () => {
  const { user, loading } = useContext(AuthContext);
  const [showRegister, setShowRegister] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Not authenticated flow
  if (!user) {
    if (showRegister) {
      return <Register onLoginLink={() => setShowRegister(false)} />;
    }
    return <Login onRegisterLink={() => setShowRegister(true)} />;
  }

  // Render proper dashboard view based on active role
  const renderDashboard = () => {
    switch (user.role) {
      case 'SUPER_ADMIN':
        return <SuperAdminDashboard setCurrentPage={setCurrentPage} />;
      case 'HR_MANAGER':
        return <HrManagerDashboard setCurrentPage={setCurrentPage} />;
      case 'DEPARTMENT_MANAGER':
        return <DeptManagerDashboard setCurrentPage={setCurrentPage} />;
      case 'TEAM_LEAD':
        return <TeamLeadDashboard setCurrentPage={setCurrentPage} />;
      case 'EMPLOYEE':
        return <EmployeeDashboard setCurrentPage={setCurrentPage} />;
      default:
        return <div className="text-center py-5">Unsupported Account Authority.</div>;
    }
  };

  // State router selection
  const renderPageContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return renderDashboard();
      case 'employees':
        return <Employees />;
      case 'dept-employees':
        return <DeptEmployees />;
      case 'departments':
        return <Departments />;
      case 'attendance':
        return <Attendance />;
      case 'leaves':
        return <Leaves />;
      case 'payroll':
        return <Payroll />;
      case 'projects':
      case 'tasks':
        return <Projects />;
      case 'performance':
        return <Performance />;
      case 'reports':
        return <Reports />;
      case 'audit-logs':
        return <AuditLogs />;
      case 'profile':
        return <Profile />;
      case 'announcements':
        return <Announcements />;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Nav */}
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      {/* Main Container */}
      <div className="main-content d-flex flex-column min-vh-100">
        <Navbar setCurrentPage={setCurrentPage} />
        <div className="container-fluid flex-grow-1 p-0">
          {renderPageContent()}
        </div>
      </div>
    </div>
  );
};

// Top level context provider wrap
const App = () => {
  return (
    <React.StrictMode>
      <AppContent />
    </React.StrictMode>
  );
};

export default App;

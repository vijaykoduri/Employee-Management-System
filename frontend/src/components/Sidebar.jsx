import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = ({ currentPage, setCurrentPage }) => {
  const { user, logout } = useContext(AuthContext);

  if (!user) return null;

  const role = user.role;

  // Define sidebar items for each role
  const menuItems = {
    SUPER_ADMIN: [
      { id: 'dashboard', name: 'Dashboard', icon: 'bi-speedometer2' },
      { id: 'employees', name: 'Employees', icon: 'bi-people' },
      { id: 'departments', name: 'Departments', icon: 'bi-building' },
      { id: 'attendance', name: 'Attendance', icon: 'bi-calendar-check' },
      { id: 'leaves', name: 'Leave Management', icon: 'bi-calendar-range' },
      { id: 'payroll', name: 'Payroll', icon: 'bi-cash-stack' },
      { id: 'projects', name: 'Projects', icon: 'bi-folder2-open' },
      { id: 'performance', name: 'Performance', icon: 'bi-graph-up-arrow' },
      { id: 'reports', name: 'Reports', icon: 'bi-file-earmark-text' },
      { id: 'audit-logs', name: 'Audit Logs', icon: 'bi-journal-text' },
      { id: 'profile', name: 'Profile Settings', icon: 'bi-person' },
    ],
    HR_MANAGER: [
      { id: 'dashboard', name: 'Dashboard', icon: 'bi-speedometer2' },
      { id: 'employees', name: 'Employees', icon: 'bi-people' },
      { id: 'attendance', name: 'Attendance Logs', icon: 'bi-calendar-check' },
      { id: 'leaves', name: 'Leave Approvals', icon: 'bi-calendar-range' },
      { id: 'payroll', name: 'Payroll & Salary', icon: 'bi-cash-stack' },
      { id: 'reports', name: 'Reports', icon: 'bi-file-earmark-text' },
      { id: 'announcements', name: 'Announcements', icon: 'bi-megaphone' },
      { id: 'profile', name: 'Profile Settings', icon: 'bi-person' },
    ],
    DEPARTMENT_MANAGER: [
      { id: 'dashboard', name: 'Dashboard', icon: 'bi-speedometer2' },
      { id: 'dept-employees', name: 'Department Employees', icon: 'bi-people' },
      { id: 'projects', name: 'Department Projects', icon: 'bi-folder2-open' },
      { id: 'attendance', name: 'Attendance', icon: 'bi-calendar-check' },
      { id: 'performance', name: 'Performance Review', icon: 'bi-graph-up-arrow' },
      { id: 'leaves', name: 'Leave Requests', icon: 'bi-calendar-range' },
      { id: 'reports', name: 'Reports', icon: 'bi-file-earmark-text' },
      { id: 'profile', name: 'Profile Settings', icon: 'bi-person' },
    ],
    TEAM_LEAD: [
      { id: 'dashboard', name: 'Dashboard', icon: 'bi-speedometer2' },
      { id: 'tasks', name: 'Task Board', icon: 'bi-kanban' },
      { id: 'attendance', name: 'Attendance Logs', icon: 'bi-calendar-check' },
      { id: 'leaves', name: 'Leave Approvals', icon: 'bi-calendar-range' },
      { id: 'projects', name: 'Project Progress', icon: 'bi-folder2-open' },
      { id: 'performance', name: 'Team Performance', icon: 'bi-graph-up-arrow' },
      { id: 'announcements', name: 'Announcements', icon: 'bi-megaphone' },
      { id: 'profile', name: 'Profile Settings', icon: 'bi-person' },
    ],
    EMPLOYEE: [
      { id: 'dashboard', name: 'My Dashboard', icon: 'bi-speedometer2' },
      { id: 'attendance', name: 'Clock In/Out', icon: 'bi-calendar-check' },
      { id: 'leaves', name: 'Apply Leave', icon: 'bi-calendar-range' },
      { id: 'payroll', name: 'My Salary Slip', icon: 'bi-cash-stack' },
      { id: 'projects', name: 'Assigned Projects', icon: 'bi-folder2-open' },
      { id: 'announcements', name: 'Announcements', icon: 'bi-megaphone' },
      { id: 'profile', name: 'My Profile', icon: 'bi-person' },
    ]
  };

  const items = menuItems[role] || [];

  return (
    <div className="sidebar animate-fade-in">
      <div className="sidebar-header d-flex align-items-center justify-content-between">
        <a href="#dashboard" className="sidebar-brand" onClick={() => setCurrentPage('dashboard')}>
          <i className="bi bi-shield-check text-primary"></i>
          <span>EMS Suite</span>
        </a>
      </div>
      <ul className="sidebar-menu">
        {items.map((item) => (
          <li key={item.id} className="sidebar-item">
            <a
              href={`#${item.id}`}
              className={`sidebar-link ${currentPage === item.id ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage(item.id);
              }}
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.name}</span>
            </a>
          </li>
        ))}
      </ul>
      <div className="sidebar-footer">
        <button
          className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
          onClick={logout}
        >
          <i className="bi bi-box-arrow-left"></i>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

import React, { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import api from '../../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const SuperAdminDashboard = ({ setCurrentPage }) => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [empRes, deptRes, annRes] = await Promise.all([
          api.get('/employees/raw'),
          api.get('/departments'),
          api.get('/announcements')
        ]);
        setEmployees(empRes.data);
        setDepartments(deptRes.data);
        setAnnouncements(annRes.data.slice(0, 3)); // show top 3
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  if (loading) {
    return <div className="text-center py-5"><span className="spinner-border text-primary"></span></div>;
  }

  // Calculate Metrics
  const totalEmployees = employees.length;
  const totalDepartments = departments.length;
  const activeEmployees = employees.filter((e) => e.status === 'ACTIVE').length;
  const inactiveEmployees = totalEmployees - activeEmployees;
  const hrManagers = employees.filter((e) => e.role === 'HR_MANAGER').length;
  const teamLeads = employees.filter((e) => e.role === 'TEAM_LEAD').length;

  // Chart Data: Employees by Department
  const deptCounts = {};
  employees.forEach((emp) => {
    const dName = emp.departmentName || 'No Department';
    deptCounts[dName] = (deptCounts[dName] || 0) + 1;
  });

  const departmentChartData = {
    labels: Object.keys(deptCounts),
    datasets: [
      {
        label: 'Headcount',
        data: Object.values(deptCounts),
        backgroundColor: '#8b5cf6',
        borderRadius: 6,
      },
    ],
  };

  // Chart Data: Gender distribution
  const genderCounts = { Male: 0, Female: 0, Other: 0 };
  employees.forEach((emp) => {
    if (emp.gender === 'Male' || emp.gender === 'Female') {
      genderCounts[emp.gender] += 1;
    } else if (emp.gender) {
      genderCounts.Other += 1;
    }
  });

  const genderChartData = {
    labels: ['Male', 'Female', 'Other'],
    datasets: [
      {
        data: [genderCounts.Male, genderCounts.Female, genderCounts.Other],
        backgroundColor: ['#3b82f6', '#ec4899', '#94a3b8'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0 font-weight-bold">Super Admin Portal</h3>
        <span className="text-muted" style={{ fontSize: '0.9rem' }}>Today: {new Date().toLocaleDateString()}</span>
      </div>

      {/* Stats Cards Row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card-custom stat-card-purple d-flex justify-content-between align-items-center">
            <div>
              <h6 className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Total Employees</h6>
              <h2 className="mb-0 font-weight-bold">{totalEmployees}</h2>
            </div>
            <i className="bi bi-people-fill text-muted" style={{ fontSize: '2rem' }}></i>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <div className="card-custom stat-card-blue d-flex justify-content-between align-items-center">
            <div>
              <h6 className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Departments</h6>
              <h2 className="mb-0 font-weight-bold">{totalDepartments}</h2>
            </div>
            <i className="bi bi-building text-muted" style={{ fontSize: '2rem' }}></i>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <div className="card-custom stat-card-teal d-flex justify-content-between align-items-center">
            <div>
              <h6 className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>HR Managers</h6>
              <h2 className="mb-0 font-weight-bold">{hrManagers}</h2>
            </div>
            <i className="bi bi-briefcase-fill text-muted" style={{ fontSize: '2rem' }}></i>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <div className="card-custom stat-card-orange d-flex justify-content-between align-items-center">
            <div>
              <h6 className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Team Leads</h6>
              <h2 className="mb-0 font-weight-bold">{teamLeads}</h2>
            </div>
            <i className="bi bi-person-workspace text-muted" style={{ fontSize: '2rem' }}></i>
          </div>
        </div>
      </div>

      {/* Active vs Inactive Row */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card-custom text-center stat-card-green">
            <h6 className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Active Accounts</h6>
            <h3 className="mb-0 font-weight-bold text-success">{activeEmployees}</h3>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card-custom text-center stat-card-red">
            <h6 className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Inactive Accounts</h6>
            <h3 className="mb-0 font-weight-bold text-danger">{inactiveEmployees}</h3>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="col-12 col-md-6">
          <div className="card-custom d-flex flex-column h-100 justify-content-center">
            <h6 className="font-weight-bold mb-3">Quick Actions</h6>
            <div className="d-flex flex-wrap gap-2">
              <button className="btn btn-primary-custom" onClick={() => setCurrentPage('employees')}>
                <i className="bi bi-person-plus me-1"></i> Add Employee
              </button>
              <button className="btn btn-outline-primary" onClick={() => setCurrentPage('departments')}>
                <i className="bi bi-folder-plus me-1"></i> Add Department
              </button>
              <button className="btn btn-outline-secondary" onClick={() => setCurrentPage('reports')}>
                <i className="bi bi-file-earmark-spreadsheet me-1"></i> Reports Portal
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-8">
          <div className="card-custom h-100">
            <h6 className="font-weight-bold mb-3">Employees by Department</h6>
            <div style={{ height: '240px' }}>
              <Bar
                data={departmentChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                }}
              />
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-4">
          <div className="card-custom h-100">
            <h6 className="font-weight-bold mb-3">Employees by Gender</h6>
            <div style={{ height: '240px' }} className="d-flex justify-content-center">
              <Doughnut
                data={genderChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Announcements */}
      <div className="card-custom mb-4">
        <h6 className="font-weight-bold mb-3">Recent Corporate Announcements</h6>
        {announcements.length === 0 ? (
          <p className="text-muted mb-0">No active announcements</p>
        ) : (
          <div className="d-flex flex-column gap-3">
            {announcements.map((ann) => (
              <div key={ann.id} className="p-3 bg-light rounded border-start border-primary border-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <h6 className="mb-0 font-weight-bold text-dark">{ann.title}</h6>
                  <small className="text-muted">{new Date(ann.createdAt).toLocaleDateString()}</small>
                </div>
                <p className="mb-0 text-secondary" style={{ fontSize: '0.88rem' }}>{ann.content}</p>
                <small className="text-muted d-block mt-2">Posted by: {ann.createdByFullName}</small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;

import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const HrManagerDashboard = ({ setCurrentPage }) => {
  const [employees, setEmployees] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHRDashboard = async () => {
      try {
        const [empRes, attRes, leaveRes] = await Promise.all([
          api.get('/employees/raw'),
          api.get('/attendance/all-today'),
          api.get('/leaves/pending')
        ]);
        setEmployees(empRes.data);
        setTodayAttendance(attRes.data);
        setPendingLeaves(leaveRes.data.slice(0, 4)); // show top 4
      } catch (err) {
        console.error('Failed to load HR Dashboard metrics', err);
      } finally {
        setLoading(false);
      }
    };
    loadHRDashboard();
  }, []);

  if (loading) {
    return <div className="text-center py-5"><span className="spinner-border text-primary"></span></div>;
  }

  // Calculate Metrics
  const activeTodayCount = todayAttendance.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length;
  const lateTodayCount = todayAttendance.filter((a) => a.status === 'LATE').length;

  // Upcoming Birthdays (Current Month)
  const currentMonth = new Date().getMonth(); // 0-11
  const birthdaysThisMonth = employees.filter((emp) => {
    if (!emp.joiningDate) return false; // mockup birthdays using joining dates or simply mock it if not present, or filter by joiningDate month as a proxy or if we had a birthDate. Let's filter by gender/joiningDate or mock birthDate since birthdate isn't a direct JPA column, let's proxy with joiningDate month to show dynamic list!
    const date = new Date(emp.joiningDate);
    return date.getMonth() === currentMonth;
  });

  // Recent Joinees (Hired in the last 6 months)
  const recentHires = [...employees]
    .sort((a, b) => new Date(b.joiningDate) - new Date(a.joiningDate))
    .slice(0, 4);

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0 font-weight-bold">HR Manager Command Center</h3>
        <span className="text-muted" style={{ fontSize: '0.9rem' }}>HR Board: {new Date().toLocaleDateString()}</span>
      </div>

      {/* Stats row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card-custom stat-card-teal d-flex justify-content-between align-items-center">
            <div>
              <h6 className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Today's Active Check-ins</h6>
              <h3 className="mb-0 font-weight-bold">{activeTodayCount}</h3>
            </div>
            <i className="bi bi-clock-history text-muted" style={{ fontSize: '2rem' }}></i>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card-custom stat-card-orange d-flex justify-content-between align-items-center">
            <div>
              <h6 className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Late Check-ins Today</h6>
              <h3 className="mb-0 font-weight-bold">{lateTodayCount}</h3>
            </div>
            <i className="bi bi-exclamation-circle text-muted" style={{ fontSize: '2rem' }}></i>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card-custom stat-card-blue d-flex justify-content-between align-items-center">
            <div>
              <h6 className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Total Managed Staff</h6>
              <h3 className="mb-0 font-weight-bold">{employees.length}</h3>
            </div>
            <i className="bi bi-people-fill text-muted" style={{ fontSize: '2rem' }}></i>
          </div>
        </div>
      </div>

      {/* Main HR panels */}
      <div className="row g-4 mb-4">
        {/* Pending Approvals */}
        <div className="col-12 col-lg-6">
          <div className="card-custom h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="font-weight-bold mb-0">Pending Leave Requests</h6>
              <button className="btn btn-sm btn-link text-decoration-none" onClick={() => setCurrentPage('leaves')}>Manage Leaves</button>
            </div>
            {pendingLeaves.length === 0 ? (
              <p className="text-muted text-center py-4">No pending leave requests</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-borderless align-middle mb-0" style={{ fontSize: '0.88rem' }}>
                  <tbody>
                    {pendingLeaves.map((leave) => (
                      <tr key={leave.id} className="border-bottom">
                        <td>
                          <span className="font-weight-bold">{leave.employeeName}</span>
                          <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Type: {leave.leaveType}</span>
                        </td>
                        <td>{leave.startDate} to {leave.endDate}</td>
                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-outline-teal"
                            onClick={() => setCurrentPage('leaves')}
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Recent Hires */}
        <div className="col-12 col-lg-6">
          <div className="card-custom h-100">
            <h6 className="font-weight-bold mb-3">Recent Joinees</h6>
            <div className="table-responsive">
              <table className="table table-borderless align-middle mb-0" style={{ fontSize: '0.88rem' }}>
                <tbody>
                  {recentHires.map((emp) => (
                    <tr key={emp.id} className="border-bottom">
                      <td>
                        <span className="font-weight-bold">{emp.fullName}</span>
                        <small className="text-muted d-block">{emp.designation}</small>
                      </td>
                      <td>Joined: {emp.joiningDate || 'N/A'}</td>
                      <td>
                        <span className="badge bg-light text-dark">{emp.departmentName || 'General'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Anniversaries/Birthdays */}
        <div className="col-12 col-md-6">
          <div className="card-custom h-100">
            <h6 className="font-weight-bold mb-3">Work Anniversaries This Month</h6>
            {birthdaysThisMonth.length === 0 ? (
              <p className="text-muted">No corporate anniversaries this month</p>
            ) : (
              <div className="d-flex flex-column gap-2">
                {birthdaysThisMonth.map((emp) => (
                  <div key={emp.id} className="d-flex justify-content-between align-items-center p-2 rounded bg-light">
                    <span className="font-weight-bold text-dark">{emp.fullName}</span>
                    <small className="text-muted">Hired: {emp.joiningDate}</small>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick actions for HR */}
        <div className="col-12 col-md-6">
          <div className="card-custom h-100 d-flex flex-column justify-content-center">
            <h6 className="font-weight-bold mb-3">HR Panel Actions</h6>
            <div className="d-flex flex-wrap gap-2">
              <button className="btn btn-primary-custom" onClick={() => setCurrentPage('employees')}>
                <i className="bi bi-person-circle"></i> View Employee Directory
              </button>
              <button className="btn btn-outline-teal" onClick={() => setCurrentPage('payroll')}>
                <i className="bi bi-wallet2"></i> Process Payroll Run
              </button>
              <button className="btn btn-outline-secondary" onClick={() => setCurrentPage('announcements')}>
                <i className="bi bi-megaphone"></i> Post Announcement
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HrManagerDashboard;

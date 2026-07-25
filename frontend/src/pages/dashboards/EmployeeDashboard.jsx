import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const EmployeeDashboard = ({ setCurrentPage }) => {
  const { user } = useContext(AuthContext);
  const [employee, setEmployee] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState(30);
  const [payrolls, setPayrolls] = useState([]);
  const [projects, setProjects] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status message for clock actions
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchDashboardData = async () => {
    try {
      const [empRes, attRes, balRes, payRes, projRes, annRes, leaveRes] = await Promise.all([
        api.get(`/employees/${user.userId}`),
        api.get(`/attendance/today?employeeId=${user.userId}`),
        api.get(`/leaves/balance/${user.userId}`),
        api.get(`/payroll/employee/${user.userId}`),
        api.get(`/projects/employee/${user.userId}`),
        api.get('/announcements'),
        api.get(`/leaves/employee/${user.userId}`)
      ]);

      setEmployee(empRes.data);
      setTodayAttendance(attRes.data);
      setLeaveBalance(balRes.data);
      setPayrolls(payRes.data);
      setProjects(projRes.data);
      setAnnouncements(annRes.data.slice(0, 3));
      setLeaves(leaveRes.data);
    } catch (err) {
      console.error('Failed to load employee dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchDashboardData();
  }, [user]);

  const handleCheckIn = async () => {
    setActionError('');
    setActionSuccess('');
    try {
      const response = await api.post(`/attendance/check-in?employeeId=${user.userId}`);
      setTodayAttendance(response.data);
      setActionSuccess('Checked in successfully!');
      fetchDashboardData();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    setActionError('');
    setActionSuccess('');
    try {
      const response = await api.post(`/attendance/check-out?employeeId=${user.userId}`);
      setTodayAttendance(response.data);
      setActionSuccess('Checked out successfully!');
      fetchDashboardData();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Check-out failed');
    }
  };

  const downloadPayslip = async (payrollId) => {
    try {
      const response = await api.get(`/payroll/${payrollId}/pdf`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `payslip_${payrollId}.pdf`;
      link.click();
    } catch (err) {
      alert('Failed to download payslip PDF');
    }
  };

  if (loading) {
    return <div className="text-center py-5"><span className="spinner-border text-primary"></span></div>;
  }

  const lastPayroll = payrolls.length > 0 ? payrolls[payrolls.length - 1] : null;

  return (
    <div className="animate-fade-in">
      <div className="row g-4 mb-4">
        {/* Welcome Card */}
        <div className="col-12 col-lg-8">
          <div className="card-custom bg-light h-100 d-flex flex-column justify-content-between p-4" style={{ borderLeft: '6px solid var(--theme-primary)' }}>
            <div>
              <h3 className="font-weight-bold text-dark mb-1">Welcome Back, {user.fullName}!</h3>
              <p className="text-secondary mb-3">{employee?.designation || 'Staff'} • {employee?.departmentName || 'General'}</p>
            </div>
            
            <div className="row g-3">
              <div className="col-6 col-md-4">
                <div className="bg-white p-3 rounded shadow-sm text-center">
                  <h6 className="text-muted mb-1" style={{ fontSize: '0.8rem' }}>Leave Balance</h6>
                  <h4 className="mb-0 font-weight-bold text-primary">{leaveBalance} Days</h4>
                </div>
              </div>
              <div className="col-6 col-md-4">
                <div className="bg-white p-3 rounded shadow-sm text-center">
                  <h6 className="text-muted mb-1" style={{ fontSize: '0.8rem' }}>Active Projects</h6>
                  <h4 className="mb-0 font-weight-bold text-success">{projects.length}</h4>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="bg-white p-3 rounded shadow-sm text-center">
                  <h6 className="text-muted mb-1" style={{ fontSize: '0.8rem' }}>Profile Status</h6>
                  <div className="progress mt-2" style={{ height: '8px' }}>
                    <div className="progress-bar bg-info" role="progressbar" style={{ width: '85%' }}></div>
                  </div>
                  <small className="text-muted mt-1 d-block" style={{ fontSize: '0.75rem' }}>85% Completed</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clock In / Out Widget */}
        <div className="col-12 col-lg-4">
          <div className="card-custom h-100 text-center d-flex flex-column justify-content-center p-4">
            <h6 className="font-weight-bold mb-3 text-secondary">Attendance Punch Card</h6>
            
            {actionError && <div className="alert alert-danger py-1" style={{ fontSize: '0.8rem' }}>{actionError}</div>}
            {actionSuccess && <div className="alert alert-success py-1" style={{ fontSize: '0.8rem' }}>{actionSuccess}</div>}

            <div className="mb-4">
              <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Today's Status</p>
              {todayAttendance ? (
                <div>
                  <span className={`badge ${todayAttendance.status === 'LATE' ? 'bg-warning' : 'bg-success'} py-2 px-3 mb-2`} style={{ fontSize: '0.9rem' }}>
                    {todayAttendance.status}
                  </span>
                  <small className="text-muted d-block">
                    In: {new Date(todayAttendance.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {todayAttendance.checkOutTime && ` • Out: ${new Date(todayAttendance.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                  </small>
                </div>
              ) : (
                <span className="badge bg-secondary py-2 px-3" style={{ fontSize: '0.9rem' }}>Not Clocked In</span>
              )}
            </div>

            <div className="d-flex gap-2 justify-content-center">
              <button
                className="btn btn-primary-custom px-4 py-2"
                onClick={handleCheckIn}
                disabled={!!todayAttendance && !todayAttendance.checkOutTime}
              >
                Check In
              </button>
              <button
                className="btn btn-outline-danger px-4 py-2"
                onClick={handleCheckOut}
                disabled={!todayAttendance || !!todayAttendance.checkOutTime}
              >
                Check Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Assigned Projects */}
        <div className="col-12 col-lg-6">
          <div className="card-custom h-100">
            <h6 className="font-weight-bold mb-3">My Assigned Projects</h6>
            {projects.length === 0 ? (
              <p className="text-muted">No projects assigned</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {projects.map((proj) => (
                  <div key={proj.id} className="p-3 bg-light rounded d-flex justify-content-between align-items-center">
                    <div>
                      <span className="font-weight-bold text-dark">{proj.name}</span>
                      <small className="text-muted d-block">Deadline: {proj.deadline}</small>
                    </div>
                    <span className={`badge ${proj.status === 'COMPLETED' ? 'bg-success' : 'bg-primary'}`}>
                      {proj.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Salary slip summary */}
        <div className="col-12 col-lg-6">
          <div className="card-custom h-100">
            <h6 className="font-weight-bold mb-3">Latest Payroll Slip</h6>
            {lastPayroll ? (
              <div className="p-3 bg-light rounded">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h5 className="font-weight-bold mb-0 text-dark">${lastPayroll.netSalary}</h5>
                    <small className="text-muted">Net salary for {lastPayroll.month}</small>
                  </div>
                  <button className="btn btn-sm btn-primary-custom" onClick={() => downloadPayslip(lastPayroll.id)}>
                    <i className="bi bi-download me-1"></i> Download PDF
                  </button>
                </div>
                <div className="row g-2 text-center" style={{ fontSize: '0.82rem' }}>
                  <div className="col-4 border-end">
                    <span className="text-muted">Base</span>
                    <p className="mb-0 font-weight-bold text-dark">${lastPayroll.baseSalary}</p>
                  </div>
                  <div className="col-4 border-end">
                    <span className="text-muted">Bonus</span>
                    <p className="mb-0 font-weight-bold text-success">${lastPayroll.bonus}</p>
                  </div>
                  <div className="col-4">
                    <span className="text-muted">Deducted</span>
                    <p className="mb-0 font-weight-bold text-danger">${lastPayroll.deductions}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted text-center py-4">No payslip generated for your account yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Announcements & Leaves Row */}
      <div className="row g-4">
        {/* Announcements */}
        <div className="col-12 col-lg-6">
          <div className="card-custom h-100">
            <h6 className="font-weight-bold mb-3">Memos & Notices</h6>
            {announcements.length === 0 ? (
              <p className="text-muted mb-0">No corporate notices posted</p>
            ) : (
              <div className="d-flex flex-column gap-2">
                {announcements.map((ann) => (
                  <div key={ann.id} className="p-2 border-bottom">
                    <span className="font-weight-bold text-dark d-block">{ann.title}</span>
                    <p className="text-secondary mb-1" style={{ fontSize: '0.85rem' }}>{ann.content}</p>
                    <small className="text-muted">{new Date(ann.createdAt).toLocaleDateString()}</small>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Leaves Status */}
        <div className="col-12 col-lg-6">
          <div className="card-custom h-100">
            <h6 className="font-weight-bold mb-3">My Leave Requests</h6>
            {leaves.length === 0 ? (
              <p className="text-muted">No leave requests filed yet</p>
            ) : (
              <div className="d-flex flex-column gap-2" style={{ maxHeight: '240px', overflowY: 'auto' }}>
                {leaves.map((leave) => {
                  const statusColors = {
                    PENDING: 'bg-warning text-dark',
                    APPROVED: 'bg-success',
                    REJECTED: 'bg-danger'
                  };
                  return (
                    <div key={leave.id} className="p-2 bg-light rounded d-flex justify-content-between align-items-center">
                      <div>
                        <span className="font-weight-bold text-dark" style={{ fontSize: '0.88rem' }}>{leave.leaveType}</span>
                        <small className="text-muted d-block" style={{ fontSize: '0.78rem' }}>{leave.startDate} to {leave.endDate}</small>
                      </div>
                      <div className="text-end">
                        <span className={`badge ${statusColors[leave.status] || 'bg-secondary'} mb-1`} style={{ fontSize: '0.75rem' }}>
                          {leave.status}
                        </span>
                        {leave.remarks && (
                          <small className="text-muted d-block" style={{ fontSize: '0.72rem', fontStyle: 'italic' }}>
                            "{leave.remarks}"
                          </small>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;

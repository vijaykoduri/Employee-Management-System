import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Attendance = () => {
  const { user } = useContext(AuthContext);
  const [todayRecord, setTodayRecord] = useState(null);
  const [logs, setLogs] = useState([]);
  const [allToday, setAllToday] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Selected employee/month for filtering logs (if Admin/HR)
  const [filterEmployeeId, setFilterEmployeeId] = useState(user.userId);
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7)); // "YYYY-MM"
  const [employeesList, setEmployeesList] = useState([]);

  const isAdminOrHR = user.role === 'SUPER_ADMIN' || user.role === 'HR_MANAGER';

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      if (isAdminOrHR) {
        const [todayRes, empRes] = await Promise.all([
          api.get('/attendance/all-today'),
          api.get('/employees/raw')
        ]);
        setAllToday(todayRes.data);
        setEmployeesList(empRes.data);
      }

      // Fetch today's record for puncher
      const todayRes = await api.get(`/attendance/today?employeeId=${user.userId}`);
      setTodayRecord(todayRes.data);

      // Fetch logs for the selected user/month
      const logRes = await api.get(`/attendance/monthly?employeeId=${filterEmployeeId}&yearMonth=${filterMonth}`);
      setLogs(logRes.data);
    } catch (err) {
      setError('Failed to load attendance logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterEmployeeId, filterMonth]);

  const handlePunchIn = async () => {
    setError('');
    setSuccess('');
    try {
      const res = await api.post(`/attendance/check-in?employeeId=${user.userId}`);
      setTodayRecord(res.data);
      setSuccess('Checked in successfully!');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Check-in failed.');
    }
  };

  const handlePunchOut = async () => {
    setError('');
    setSuccess('');
    try {
      const res = await api.post(`/attendance/check-out?employeeId=${user.userId}`);
      setTodayRecord(res.data);
      setSuccess('Checked out successfully!');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Check-out failed.');
    }
  };

  // Report downloads
  const exportExcel = async () => {
    try {
      const response = await api.get('/reports/attendance/excel', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'attendance_report.xlsx';
      link.click();
    } catch (err) {
      setError('Excel download failed.');
    }
  };

  const exportPdf = async () => {
    try {
      const response = await api.get('/reports/attendance/pdf', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'attendance_report.pdf';
      link.click();
    } catch (err) {
      setError('PDF download failed.');
    }
  };

  return (
    <div className="card-custom animate-fade-in shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h4 className="font-weight-bold mb-0">Attendance Tracking</h4>
        {isAdminOrHR && (
          <div className="d-flex gap-2">
            <button className="btn btn-outline-success" onClick={exportExcel}>
              <i className="bi bi-file-earmark-excel me-1"></i> Excel
            </button>
            <button className="btn btn-outline-danger" onClick={exportPdf}>
              <i className="bi bi-file-earmark-pdf me-1"></i> PDF
            </button>
          </div>
        )}
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}
      {success && <div className="alert alert-success py-2">{success}</div>}

      {/* Check In / Out Section for user */}
      <div className="card bg-light p-3 border-0 rounded-3 mb-4">
        <div className="row align-items-center">
          <div className="col-md-8 mb-3 mb-md-0">
            <h5 className="font-weight-bold mb-1">PUNCH CARD</h5>
            {todayRecord ? (
              <p className="text-secondary mb-0">
                You checked in today at{' '}
                <span className="font-weight-bold">
                  {new Date(todayRecord.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {todayRecord.checkOutTime && (
                  <span>
                    {' '}
                    and checked out at{' '}
                    <span className="font-weight-bold">
                      {new Date(todayRecord.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </span>
                )}
              </p>
            ) : (
              <p className="text-secondary mb-0">You have not punched in today yet. Clock in to record attendance.</p>
            )}
          </div>
          <div className="col-md-4 text-md-end">
            <button
              className="btn btn-primary-custom px-4 me-2"
              onClick={handlePunchIn}
              disabled={!!todayRecord && !todayRecord.checkOutTime}
            >
              Punch In
            </button>
            <button
              className="btn btn-outline-danger px-4"
              onClick={handlePunchOut}
              disabled={!todayRecord || !!todayRecord.checkOutTime}
            >
              Punch Out
            </button>
          </div>
        </div>
      </div>

      {/* Admin Panel: Today's check-ins */}
      {isAdminOrHR && (
        <div className="mb-4">
          <h5 className="font-weight-bold mb-3">Today's Company Check-ins</h5>
          {allToday.length === 0 ? (
            <p className="text-muted text-center py-3 bg-light rounded">No check-ins registered today</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm align-middle" style={{ fontSize: '0.85rem' }}>
                <thead className="table-light">
                  <tr>
                    <th>Employee</th>
                    <th>Date</th>
                    <th>In Time</th>
                    <th>Out Time</th>
                    <th>Late (Mins)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allToday.map((item) => (
                    <tr key={item.id}>
                      <td><span className="font-weight-bold">{item.employeeName}</span></td>
                      <td>{item.date}</td>
                      <td>{new Date(item.checkInTime).toLocaleTimeString()}</td>
                      <td>{item.checkOutTime ? new Date(item.checkOutTime).toLocaleTimeString() : '-'}</td>
                      <td>{item.lateMinutes || 0}</td>
                      <td>
                        <span className={`badge ${item.status === 'LATE' ? 'bg-warning' : 'bg-success'}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Historical Filter Control */}
      <div className="mb-4">
        <h5 className="font-weight-bold mb-3">Monthly Log Archives</h5>
        <div className="row g-2">
          {isAdminOrHR && (
            <div className="col-12 col-md-6">
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Filter Employee</label>
              <select
                className="form-select"
                value={filterEmployeeId}
                onChange={(e) => setFilterEmployeeId(e.target.value)}
              >
                {employeesList.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                ))}
              </select>
            </div>
          )}
          <div className="col-12 col-md-6">
            <label className="form-label" style={{ fontSize: '0.85rem' }}>Select Month</label>
            <input
              type="month"
              className="form-control"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4"><span className="spinner-border text-primary"></span></div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.88rem' }}>
            <thead className="table-light">
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Late (Min)</th>
                <th>Overtime (Min)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">No logs recorded for this month</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.date}</td>
                    <td>{log.checkInTime ? new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                    <td>{log.checkOutTime ? new Date(log.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                    <td>{log.lateMinutes || 0}</td>
                    <td>{log.overtimeMinutes || 0}</td>
                    <td>
                      <span className={`badge ${log.status === 'LATE' ? 'bg-warning' : 'bg-success'}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Attendance;

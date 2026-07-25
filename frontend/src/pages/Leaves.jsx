import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Leaves = () => {
  const { user } = useContext(AuthContext);
  const [balance, setBalance] = useState(30);
  const [history, setHistory] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Apply leave form states
  const [leaveType, setLeaveType] = useState('CASUAL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // Review states
  const [remarks, setRemarks] = useState({});

  const isSupervisor = user.role !== 'EMPLOYEE';

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [balRes, histRes] = await Promise.all([
        api.get(`/leaves/balance/${user.userId}`),
        api.get(`/leaves/employee/${user.userId}`)
      ]);
      setBalance(balRes.data);
      setHistory(histRes.data);

      if (isSupervisor) {
        let pendingRes;
        if (user.role === 'SUPER_ADMIN' || user.role === 'HR_MANAGER') {
          pendingRes = await api.get('/leaves/pending');
        } else {
          pendingRes = await api.get(`/leaves/manager/${user.userId}`);
        }
        setPendingRequests(pendingRes.data);
      }
    } catch (err) {
      setError('Failed to load leave records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const handleApply = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/leaves/apply', {
        employeeId: user.userId,
        leaveType,
        startDate,
        endDate,
        reason
      });
      setSuccess('Leave request filed successfully.');
      setStartDate('');
      setEndDate('');
      setReason('');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave request.');
    }
  };

  const handleReview = async (leaveId, status) => {
    setError('');
    setSuccess('');
    const leaveRemarks = remarks[leaveId] || '';

    try {
      await api.post(`/leaves/${leaveId}/review`, null, {
        params: {
          status,
          remarks: leaveRemarks,
          reviewerId: user.userId
        }
      });
      setSuccess(`Leave request was successfully ${status.toLowerCase()}.`);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed.');
    }
  };

  const handleRemarksChange = (leaveId, val) => {
    setRemarks((prev) => ({ ...prev, [leaveId]: val }));
  };

  // Export Reports
  const exportExcel = async () => {
    try {
      const response = await api.get('/reports/leaves/excel', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'leaves_report.xlsx';
      link.click();
    } catch (err) {
      setError('Excel download failed.');
    }
  };

  const exportPdf = async () => {
    try {
      const response = await api.get('/reports/leaves/pdf', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'leaves_report.pdf';
      link.click();
    } catch (err) {
      setError('PDF download failed.');
    }
  };

  return (
    <div className="card-custom animate-fade-in shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h4 className="font-weight-bold mb-0">Leave Management</h4>
        {isSupervisor && (
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

      <div className="row g-4 mb-4">
        {/* Left column: Apply Leave Form & Balance */}
        <div className="col-12 col-lg-5">
          {/* Balance Tracker */}
          <div className="card bg-primary-custom text-white p-3 rounded shadow-sm mb-3">
            <h6 className="mb-1" style={{ fontSize: '0.85rem' }}>Remaining Annual Leave Balance</h6>
            <h2 className="mb-0 font-weight-bold">{balance} Days</h2>
            <small className="text-white-50">Standard allowance: 30 days per calendar year</small>
          </div>

          {/* Form */}
          <div className="card border-0 bg-light p-3 rounded shadow-sm">
            <h6 className="font-weight-bold mb-3">File Time-off Request</h6>
            <form onSubmit={handleApply}>
              <div className="mb-2">
                <label className="form-label" style={{ fontSize: '0.82rem' }}>Leave Category</label>
                <select className="form-select" value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
                  <option value="CASUAL">CASUAL</option>
                  <option value="SICK">SICK</option>
                  <option value="ANNUAL">ANNUAL</option>
                  <option value="MATERNITY">MATERNITY</option>
                  <option value="UNPAID">UNPAID</option>
                </select>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-6">
                  <label className="form-label" style={{ fontSize: '0.82rem' }}>Start Date</label>
                  <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                </div>
                <div className="col-6">
                  <label className="form-label" style={{ fontSize: '0.82rem' }}>End Date</label>
                  <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label" style={{ fontSize: '0.82rem' }}>Reason details</label>
                <textarea className="form-control" rows="3" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="State the reason..." required></textarea>
              </div>
              <button type="submit" className="btn btn-primary-custom w-100 py-2">Submit Request</button>
            </form>
          </div>
        </div>

        {/* Right column: Supervisor Review Area (if applicable) */}
        <div className="col-12 col-lg-7">
          {isSupervisor && (
            <div className="card border-0 bg-light p-3 rounded shadow-sm h-100">
              <h6 className="font-weight-bold mb-3">Pending Team Leave Decisions</h6>
              {pendingRequests.length === 0 ? (
                <p className="text-muted text-center py-5">No leave files pending review</p>
              ) : (
                <div className="d-flex flex-column gap-3" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                  {pendingRequests.map((req) => (
                    <div key={req.id} className="p-3 bg-white rounded shadow-sm border">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="font-weight-bold text-dark">{req.employeeName}</span>
                        <span className="badge bg-secondary">{req.leaveType}</span>
                      </div>
                      <small className="text-muted d-block mb-2">Window: {req.startDate} to {req.endDate}</small>
                      <p className="text-secondary mb-2" style={{ fontSize: '0.88rem' }}>Reason: "{req.reason}"</p>
                      
                      <div className="mb-3">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Approver remarks..."
                          value={remarks[req.id] || ''}
                          onChange={(e) => handleRemarksChange(req.id, e.target.value)}
                        />
                      </div>
                      <div className="d-flex gap-2 justify-content-end">
                        <button className="btn btn-sm btn-success px-3" onClick={() => handleReview(req.id, 'APPROVED')}>
                          Approve
                        </button>
                        <button className="btn btn-sm btn-danger px-3" onClick={() => handleReview(req.id, 'REJECTED')}>
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* History Log List */}
      <div className="mt-4">
        <h5 className="font-weight-bold mb-3">My Leave Application History</h5>
        {loading ? (
          <div className="text-center py-4"><span className="spinner-border text-primary"></span></div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.88rem' }}>
              <thead className="table-light">
                <tr>
                  <th>Category</th>
                  <th>Dates</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Remarks / Comments</th>
                  <th>Reviewed By</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">No leaves requested previously</td>
                  </tr>
                ) : (
                  history.map((h) => (
                    <tr key={h.id}>
                      <td><span className="font-weight-bold">{h.leaveType}</span></td>
                      <td>{h.startDate} to {h.endDate}</td>
                      <td>{h.reason}</td>
                      <td>
                        <span className={`badge ${h.status === 'APPROVED' ? 'bg-success' : h.status === 'REJECTED' ? 'bg-danger' : 'bg-warning'}`}>
                          {h.status}
                        </span>
                      </td>
                      <td>{h.remarks || '-'}</td>
                      <td>{h.reviewedByName || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaves;

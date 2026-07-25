import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Performance = () => {
  const { user } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [employeeId, setEmployeeId] = useState('');
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [kpiGoals, setKpiGoals] = useState('');

  const isSupervisor = user.role !== 'EMPLOYEE';

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      if (isSupervisor) {
        // Supervisors can see reviews they wrote or general list
        const revRes = await api.get(`/performance/reviewer/${user.userId}`);
        setReviews(revRes.data);

        // Fetch reporting employees list
        const empRes = await api.get('/employees/raw');
        setEmployees(empRes.data.filter((e) => e.id !== user.userId)); // avoid reviewing self
        if (empRes.data.length > 0) {
          setEmployeeId(empRes.data[0].id);
        }
      } else {
        const revRes = await api.get(`/performance/employee/${user.userId}`);
        setReviews(revRes.data);
      }
    } catch (err) {
      setError('Failed to load performance metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/performance', {
        employeeId: parseInt(employeeId),
        reviewerId: user.userId,
        rating: parseInt(rating),
        feedback,
        kpiGoals
      });
      setSuccess('Performance appraisal review recorded successfully.');
      setFeedback('');
      setKpiGoals('');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Appraisal recording failed.');
    }
  };

  // Export Reports
  const exportExcel = async () => {
    try {
      const response = await api.get('/reports/performance/excel', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'performance_report.xlsx';
      link.click();
    } catch (err) {
      setError('Excel download failed.');
    }
  };

  const exportPdf = async () => {
    try {
      const response = await api.get('/reports/performance/pdf', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'performance_report.pdf';
      link.click();
    } catch (err) {
      setError('PDF download failed.');
    }
  };

  return (
    <div className="card-custom animate-fade-in shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h4 className="font-weight-bold mb-0">Performance Appraisals & KPIs</h4>
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
        {/* Review Form (Supervisor only) */}
        {isSupervisor && (
          <div className="col-12 col-lg-5">
            <div className="card border-0 bg-light p-3 rounded shadow-sm">
              <h6 className="font-weight-bold mb-3">Record Employee Review</h6>
              <form onSubmit={handleSubmitReview}>
                <div className="mb-2">
                  <label className="form-label" style={{ fontSize: '0.82rem' }}>Select Employee</label>
                  <select
                    className="form-select"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    required
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-2">
                  <label className="form-label" style={{ fontSize: '0.82rem' }}>Rating (1 - 5 Scale)</label>
                  <select
                    className="form-select"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                  >
                    <option value="5">5 - Excellent / Exceeds Goals</option>
                    <option value="4">4 - Very Good</option>
                    <option value="3">3 - Solid Performer</option>
                    <option value="2">2 - Needs Improvement</option>
                    <option value="1">1 - Unsatisfactory</option>
                  </select>
                </div>
                <div className="mb-2">
                  <label className="form-label" style={{ fontSize: '0.82rem' }}>Qualitative Feedback</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    required
                    placeholder="Provide details on strengths, issues..."
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label className="form-label" style={{ fontSize: '0.82rem' }}>Set KPI Goals</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={kpiGoals}
                    onChange={(e) => setKpiGoals(e.target.value)}
                    placeholder="List specific goals for next month..."
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary-custom w-100 py-2">Submit Appraisal</button>
              </form>
            </div>
          </div>
        )}

        {/* Historical Reviews Area */}
        <div className={`col-12 ${isSupervisor ? 'col-lg-7' : 'col-12'}`}>
          <div className="card border-0 bg-light p-3 rounded shadow-sm h-100">
            <h6 className="font-weight-bold mb-3">{isSupervisor ? 'Submitted Employee Reviews' : 'My Performance Feedback'}</h6>
            {loading ? (
              <div className="text-center py-5"><span className="spinner-border text-primary"></span></div>
            ) : (
              <div className="d-flex flex-column gap-3" style={{ maxHeight: '480px', overflowY: 'auto' }}>
                {reviews.length === 0 ? (
                  <p className="text-muted text-center py-5">No reviews recorded yet</p>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id} className="p-3 bg-white rounded shadow-sm border">
                      <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                        <div>
                          <span className="font-weight-bold text-dark d-block">
                            {isSupervisor ? `Employee: ${rev.employeeName}` : `Reviewer: ${rev.reviewerName}`}
                          </span>
                          <small className="text-muted">Reviewed on: {rev.reviewDate}</small>
                        </div>
                        <span className="badge bg-warning text-dark py-2 px-3" style={{ fontSize: '0.9rem' }}>
                          Rating: {rev.rating} / 5
                        </span>
                      </div>
                      <p className="text-secondary mb-2" style={{ fontSize: '0.88rem' }}>
                        <span className="font-weight-bold d-block text-muted">Feedback:</span>
                        "{rev.feedback}"
                      </p>
                      {rev.kpiGoals && (
                        <p className="text-secondary mb-0" style={{ fontSize: '0.88rem' }}>
                          <span className="font-weight-bold d-block text-muted">Set KPI Goals:</span>
                          {rev.kpiGoals}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Performance;

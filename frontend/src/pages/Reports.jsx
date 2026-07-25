import React, { useState } from 'react';
import api from '../services/api';

const Reports = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState({});

  const handleDownload = async (reportType, format) => {
    const key = `${reportType}_${format}`;
    setError('');
    setLoading((prev) => ({ ...prev, [key]: true }));

    try {
      const response = await api.get(`/reports/${reportType}/${format}`, {
        responseType: 'blob',
      });
      const contentType = format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const fileExtension = format === 'pdf' ? 'pdf' : 'xlsx';

      const blob = new Blob([response.data], { type: contentType });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${reportType}_report.${fileExtension}`;
      link.click();
    } catch (err) {
      setError(`Failed to download ${reportType} report in ${format.toUpperCase()} format.`);
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const reportCategories = [
    { id: 'employees', name: 'Employee Directory', desc: 'Active and inactive employee records, contact info, status, and role audits.', icon: 'bi-people' },
    { id: 'attendance', name: 'Attendance Records', desc: 'Daily punch logs, shift timings, tardiness alerts, and overtime compilations.', icon: 'bi-calendar-check' },
    { id: 'salary', name: 'Payroll & Salary Report', desc: 'Disbursed base salaries, tax withholdings, deductions, and bonuses.', icon: 'bi-cash-stack' },
    { id: 'departments', name: 'Department Details', desc: 'Registered divisions, manager profiles, and team allocation metrics.', icon: 'bi-building' },
    { id: 'performance', name: 'Performance & KPIs', desc: 'Appraisals, numerical rating indices, and manager feedback comments.', icon: 'bi-graph-up-arrow' },
    { id: 'leaves', name: 'Leave & Absence Log', desc: 'Time-off categories, request reasons, dates, and approval logs.', icon: 'bi-calendar-range' },
  ];

  return (
    <div className="card-custom animate-fade-in shadow-sm">
      <h4 className="font-weight-bold mb-2">Centralized Reports Portal</h4>
      <p className="text-muted mb-4">Compile and download company logs as spreadsheets or print layouts.</p>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      <div className="row g-3">
        {reportCategories.map((cat) => (
          <div key={cat.id} className="col-12 col-md-6 col-lg-4">
            <div className="card bg-light border-0 p-3 h-100 d-flex flex-column justify-content-between rounded-3 shadow-sm" style={{ transition: 'all var(--transition-speed)' }}>
              <div>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <i className={`bi ${cat.icon} text-primary`} style={{ fontSize: '1.4rem' }}></i>
                  <h6 className="font-weight-bold mb-0 text-dark">{cat.name}</h6>
                </div>
                <p className="text-secondary" style={{ fontSize: '0.82rem', minHeight: '54px' }}>{cat.desc}</p>
              </div>

              <div className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-outline-success flex-fill py-2"
                  onClick={() => handleDownload(cat.id, 'excel')}
                  disabled={loading[`${cat.id}_excel`]}
                >
                  <i className="bi bi-file-earmark-excel me-1"></i> Excel
                </button>
                <button
                  className="btn btn-sm btn-outline-danger flex-fill py-2"
                  onClick={() => handleDownload(cat.id, 'pdf')}
                  disabled={loading[`${cat.id}_pdf`]}
                >
                  <i className="bi bi-file-earmark-pdf me-1"></i> PDF
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;

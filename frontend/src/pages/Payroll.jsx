import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Payroll = () => {
  const { user } = useContext(AuthContext);
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Generate form states
  const [employeeId, setEmployeeId] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // "YYYY-MM"
  const [bonus, setBonus] = useState('');
  const [deductions, setDeductions] = useState('');

  const isAdminOrHR = user.role === 'SUPER_ADMIN' || user.role === 'HR_MANAGER';

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      if (isAdminOrHR) {
        const [payRes, empRes] = await Promise.all([
          api.get('/payroll'),
          api.get('/employees/raw')
        ]);
        setPayrolls(payRes.data);
        setEmployees(empRes.data);
        if (empRes.data.length > 0) {
          setEmployeeId(empRes.data[0].id);
        }
      } else {
        const payRes = await api.get(`/payroll/employee/${user.userId}`);
        setPayrolls(payRes.data);
      }
    } catch (err) {
      setError('Failed to load payroll database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/payroll/generate', null, {
        params: {
          employeeId: parseInt(employeeId),
          month,
          bonus: parseFloat(bonus) || 0,
          deductions: parseFloat(deductions) || 0
        }
      });
      setSuccess('Payroll run generated successfully.');
      setBonus('');
      setDeductions('');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Payroll run compilation failed.');
    }
  };

  const downloadPayslip = async (payrollId) => {
    setError('');
    try {
      const response = await api.get(`/payroll/${payrollId}/pdf`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `payslip_${payrollId}.pdf`;
      link.click();
    } catch (err) {
      setError('Payslip PDF download failed.');
    }
  };

  // Export Reports
  const exportExcel = async () => {
    try {
      const response = await api.get('/reports/salary/excel', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'salary_report.xlsx';
      link.click();
    } catch (err) {
      setError('Excel download failed.');
    }
  };

  const exportPdf = async () => {
    try {
      const response = await api.get('/reports/salary/pdf', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'salary_report.pdf';
      link.click();
    } catch (err) {
      setError('PDF download failed.');
    }
  };

  return (
    <div className="card-custom animate-fade-in shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h4 className="font-weight-bold mb-0">Payroll & Disbursements</h4>
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

      <div className="row g-4 mb-4">
        {/* Run payroll generation (Admin / HR only) */}
        {isAdminOrHR && (
          <div className="col-12 col-lg-4">
            <div className="card border-0 bg-light p-3 rounded shadow-sm">
              <h6 className="font-weight-bold mb-3">Process Salary Run</h6>
              <form onSubmit={handleGenerate}>
                <div className="mb-2">
                  <label className="form-label" style={{ fontSize: '0.82rem' }}>Select Staff</label>
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
                  <label className="form-label" style={{ fontSize: '0.82rem' }}>Month</label>
                  <input
                    type="month"
                    className="form-control"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label" style={{ fontSize: '0.82rem' }}>Allowances / Bonus ($)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={bonus}
                    onChange={(e) => setBonus(e.target.value)}
                    placeholder="e.g. 500"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label" style={{ fontSize: '0.82rem' }}>Deductions ($)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={deductions}
                    onChange={(e) => setDeductions(e.target.value)}
                    placeholder="e.g. 150"
                  />
                </div>
                <button type="submit" className="btn btn-primary-custom w-100 py-2">Generate Pay Stub</button>
              </form>
            </div>
          </div>
        )}

        {/* Payslips database table */}
        <div className={`col-12 ${isAdminOrHR ? 'col-lg-8' : 'col-12'}`}>
          <div className="card border-0 bg-light p-3 rounded shadow-sm h-100">
            <h6 className="font-weight-bold mb-3">{isAdminOrHR ? 'Recent Salary Disbursal Runs' : 'My Pay Slips'}</h6>
            {loading ? (
              <div className="text-center py-5"><span className="spinner-border text-primary"></span></div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                  <thead className="table-light">
                    <tr>
                      {isAdminOrHR && <th>Employee</th>}
                      <th>Month</th>
                      <th>Base ($)</th>
                      <th>Bonus ($)</th>
                      <th>Deduction ($)</th>
                      <th>Net ($)</th>
                      <th className="text-end">Payslip</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrolls.length === 0 ? (
                      <tr>
                        <td colSpan={isAdminOrHR ? '7' : '6'} className="text-center py-4 text-muted">
                          No payroll summaries found
                        </td>
                      </tr>
                    ) : (
                      payrolls.map((p) => (
                        <tr key={p.id}>
                          {isAdminOrHR && <td><span className="font-weight-bold">{p.employeeName}</span></td>}
                          <td>{p.month}</td>
                          <td>{p.baseSalary}</td>
                          <td>{p.bonus}</td>
                          <td>{p.deductions}</td>
                          <td><span className="font-weight-bold text-success">${p.netSalary}</span></td>
                          <td className="text-end">
                            <button className="btn btn-sm btn-outline-primary" onClick={() => downloadPayslip(p.id)}>
                              <i className="bi bi-download"></i> PDF
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payroll;

import React, { useState, useEffect } from 'react';
import api, { SERVER_BASE_URL } from '../services/api';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [size] = useState(5);

  // Edit / Create States
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [empRole, setEmpRole] = useState('EMPLOYEE');
  const [empStatus, setEmpStatus] = useState('ACTIVE');
  const [empDeptId, setEmpDeptId] = useState('');
  const [empManagerId, setEmpManagerId] = useState('');
  const [designation, setDesignation] = useState('');
  const [baseSalary, setBaseSalary] = useState('');
  const [gender, setGender] = useState('Male');
  
  // Loading & error alerts
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/employees', {
        params: {
          searchTerm: searchTerm || undefined,
          role: role || undefined,
          status: status || undefined,
          departmentId: departmentId || undefined,
          page,
          size,
          sortBy: 'id',
          sortDir: 'asc'
        }
      });
      setEmployees(response.data.content);
      setTotalPages(response.data.totalPages);

      // Load all departments & potential managers for selects
      const [deptRes, rawEmpRes] = await Promise.all([
        api.get('/departments'),
        api.get('/employees/raw')
      ]);
      setDepartments(deptRes.data);
      setManagers(rawEmpRes.data.filter((e) => e.role !== 'EMPLOYEE'));
    } catch (err) {
      setError('Failed to load employee records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, searchTerm, role, status, departmentId]);

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      fullName,
      username,
      email,
      phoneNumber,
      role: empRole,
      status: empStatus,
      departmentId: empRole === 'SUPER_ADMIN' ? null : parseInt(empDeptId),
      managerId: empManagerId ? parseInt(empManagerId) : null,
      designation,
      baseSalary: parseFloat(baseSalary) || 0,
      gender,
      joiningDate: new Date().toISOString().split('T')[0]
    };

    try {
      if (editId) {
        await api.put(`/employees/${editId}`, payload);
        setSuccess('Employee profile updated successfully.');
      } else {
        await api.post('/employees', payload);
        setSuccess('Employee profile created successfully.');
      }
      setShowModal(false);
      resetForm();
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed.');
    }
  };

  const handleEditClick = (emp) => {
    setEditId(emp.id);
    setFullName(emp.fullName || '');
    setUsername(emp.username || '');
    setEmail(emp.email || '');
    setPhoneNumber(emp.phoneNumber || '');
    setEmpRole(emp.role);
    setEmpStatus(emp.status);
    setEmpDeptId(emp.departmentId || '');
    setEmpManagerId(emp.managerId || '');
    setDesignation(emp.designation || '');
    setBaseSalary(emp.baseSalary || '');
    setGender(emp.gender || 'Male');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/employees/${id}`);
      setSuccess('Employee deleted.');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed.');
    }
  };

  const resetForm = () => {
    setEditId(null);
    setFullName('');
    setUsername('');
    setEmail('');
    setPhoneNumber('');
    setEmpRole('EMPLOYEE');
    setEmpStatus('ACTIVE');
    setEmpDeptId('');
    setEmpManagerId('');
    setDesignation('');
    setBaseSalary('');
    setGender('Male');
  };

  // Export Reports
  const exportExcel = async () => {
    try {
      const response = await api.get('/reports/employees/excel', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'employees_export.xlsx';
      link.click();
    } catch (err) {
      setError('Excel download failed.');
    }
  };

  const exportPdf = async () => {
    try {
      const response = await api.get('/reports/employees/pdf', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'employees_export.pdf';
      link.click();
    } catch (err) {
      setError('PDF download failed.');
    }
  };

  return (
    <div className="card-custom animate-fade-in shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h4 className="font-weight-bold mb-0">Employee Directory</h4>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-success" onClick={exportExcel}>
            <i className="bi bi-file-earmark-excel me-1"></i> Excel
          </button>
          <button className="btn btn-outline-danger" onClick={exportPdf}>
            <i className="bi bi-file-earmark-pdf me-1"></i> PDF
          </button>
          <button className="btn btn-primary-custom" onClick={() => { resetForm(); setShowModal(true); }}>
            <i className="bi bi-plus-lg me-1"></i> Add Employee
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}
      {success && <div className="alert alert-success py-2">{success}</div>}

      {/* Search and Filters */}
      <div className="row g-2 mb-3">
        <div className="col-12 col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search name, username, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-6 col-md-3">
          <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">Filter Role</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="HR_MANAGER">HR Manager</option>
            <option value="DEPARTMENT_MANAGER">Department Manager</option>
            <option value="TEAM_LEAD">Team Lead</option>
            <option value="EMPLOYEE">Employee</option>
          </select>
        </div>
        <div className="col-6 col-md-3">
          <select className="form-select" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
            <option value="">Filter Department</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div className="col-6 col-md-2">
          <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Status</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5"><span className="spinner-border text-primary"></span></div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-4">
            <thead className="table-light">
              <tr>
                <th>Photo</th>
                <th>Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td>
                    <img
                      src={emp.photoPath ? `${SERVER_BASE_URL}${emp.photoPath}` : 'https://via.placeholder.com/40'}
                      alt="avatar"
                      className="rounded-circle"
                      width="40"
                      height="40"
                      style={{ objectFit: 'cover' }}
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }}
                    />
                  </td>
                  <td><span className="font-weight-bold">{emp.fullName}</span><br /><small className="text-muted">{emp.email}</small></td>
                  <td>{emp.username}</td>
                  <td><span className="badge bg-light text-dark">{emp.role}</span></td>
                  <td>{emp.departmentName || 'N/A'}</td>
                  <td>{emp.designation || 'Staff'}</td>
                  <td>
                    <span className={`badge ${emp.status === 'ACTIVE' ? 'bg-success' : 'bg-danger'}`}>{emp.status}</span>
                  </td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-link text-primary me-2 p-0" onClick={() => handleEditClick(emp)}>
                      <i className="bi bi-pencil-square" style={{ fontSize: '1.1rem' }}></i>
                    </button>
                    <button className="btn btn-sm btn-link text-danger p-0" onClick={() => handleDelete(emp.id)}>
                      <i className="bi bi-trash" style={{ fontSize: '1.1rem' }}></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center">
            <button className="btn btn-sm btn-outline-secondary" disabled={page === 0} onClick={() => setPage(page - 1)}>
              Previous
            </button>
            <span className="text-muted" style={{ fontSize: '0.9rem' }}>Page {page + 1} of {totalPages}</span>
            <button className="btn btn-sm btn-outline-secondary" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
              <div className="modal-header border-bottom">
                <h5 className="modal-title">{editId ? 'Edit Employee Details' : 'Create Employee Profile'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreateOrUpdate}>
                <div className="modal-body">
                  <div className="row g-2">
                    <div className="col-12 mb-2">
                      <label className="form-label">Full Name</label>
                      <input type="text" className="form-control" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                    </div>
                    <div className="col-6 mb-2">
                      <label className="form-label">Username</label>
                      <input type="text" className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    </div>
                    <div className="col-6 mb-2">
                      <label className="form-label">Email</label>
                      <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="col-6 mb-2">
                      <label className="form-label">Phone Number</label>
                      <input type="text" className="form-control" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                    </div>
                    <div className="col-6 mb-2">
                      <label className="form-label">Gender</label>
                      <select className="form-select" value={gender} onChange={(e) => setGender(e.target.value)}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div className="col-6 mb-2">
                      <label className="form-label">Role</label>
                      <select className="form-select" value={empRole} onChange={(e) => setEmpRole(e.target.value)}>
                        <option value="SUPER_ADMIN">Super Admin</option>
                        <option value="HR_MANAGER">HR Manager</option>
                        <option value="DEPARTMENT_MANAGER">Department Manager</option>
                        <option value="TEAM_LEAD">Team Lead</option>
                        <option value="EMPLOYEE">Employee</option>
                      </select>
                    </div>
                    <div className="col-6 mb-2">
                      <label className="form-label">Status</label>
                      <select className="form-select" value={empStatus} onChange={(e) => setEmpStatus(e.target.value)}>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                      </select>
                    </div>
                    {empRole !== 'SUPER_ADMIN' && (
                      <div className="col-6 mb-2">
                        <label className="form-label">Department</label>
                        <select className="form-select" value={empDeptId} onChange={(e) => setEmpDeptId(e.target.value)} required>
                          <option value="">Select Department</option>
                          {departments.map((d) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="col-6 mb-2">
                      <label className="form-label">Manager</label>
                      <select className="form-select" value={empManagerId} onChange={(e) => setEmpManagerId(e.target.value)}>
                        <option value="">None / Reports to Admin</option>
                        {managers.map((m) => (
                          <option key={m.id} value={m.id}>{m.fullName}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-6 mb-2">
                      <label className="form-label">Designation</label>
                      <input type="text" className="form-control" value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="e.g. Developer" />
                    </div>
                    <div className="col-6 mb-2">
                      <label className="form-label">Base Salary ($)</label>
                      <input type="number" className="form-control" value={baseSalary} onChange={(e) => setBaseSalary(e.target.value)} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
                  <button type="submit" className="btn btn-primary-custom">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;

import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [managerId, setManagerId] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [deptRes, empRes] = await Promise.all([
        api.get('/departments'),
        api.get('/employees/raw')
      ]);
      setDepartments(deptRes.data);
      // Filter potential managers: Managers, Leads, Admins
      setManagers(empRes.data.filter((e) => e.role !== 'EMPLOYEE'));
    } catch (err) {
      setError('Failed to fetch departments list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      name,
      description,
      managerId: managerId ? parseInt(managerId) : null
    };

    try {
      if (editId) {
        await api.put(`/departments/${editId}`, payload);
        setSuccess('Department details updated.');
      } else {
        await api.post('/departments', payload);
        setSuccess('Department created successfully.');
      }
      setShowModal(false);
      resetForm();
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed.');
    }
  };

  const handleEditClick = (dept) => {
    setEditId(dept.id);
    setName(dept.name);
    setDescription(dept.description || '');
    setManagerId(dept.managerId || '');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department?')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/departments/${id}`);
      setSuccess('Department deleted successfully.');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete department. Verify that it contains no active employees.');
    }
  };

  const resetForm = () => {
    setEditId(null);
    setName('');
    setDescription('');
    setManagerId('');
  };

  // Report downloads
  const exportExcel = async () => {
    try {
      const response = await api.get('/reports/departments/excel', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'departments_report.xlsx';
      link.click();
    } catch (err) {
      setError('Excel download failed.');
    }
  };

  const exportPdf = async () => {
    try {
      const response = await api.get('/reports/departments/pdf', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'departments_report.pdf';
      link.click();
    } catch (err) {
      setError('PDF download failed.');
    }
  };

  return (
    <div className="card-custom animate-fade-in shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h4 className="font-weight-bold mb-0">Department Administration</h4>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-success" onClick={exportExcel}>
            <i className="bi bi-file-earmark-excel me-1"></i> Excel
          </button>
          <button className="btn btn-outline-danger" onClick={exportPdf}>
            <i className="bi bi-file-earmark-pdf me-1"></i> PDF
          </button>
          <button className="btn btn-primary-custom" onClick={() => { resetForm(); setShowModal(true); }}>
            <i className="bi bi-plus-lg me-1"></i> Create Department
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}
      {success && <div className="alert alert-success py-2">{success}</div>}

      {loading ? (
        <div className="text-center py-5"><span className="spinner-border text-primary"></span></div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Department Name</th>
                <th>Description</th>
                <th>Assigned Manager</th>
                <th>Employee Count</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept.id}>
                  <td>{dept.id}</td>
                  <td><span className="font-weight-bold">{dept.name}</span></td>
                  <td>{dept.description || 'No description provided'}</td>
                  <td>
                    {dept.managerName ? (
                      <span className="badge bg-light text-dark py-1 px-2">
                        <i className="bi bi-person me-1"></i> {dept.managerName}
                      </span>
                    ) : (
                      <span className="text-muted" style={{ fontSize: '0.85rem' }}>Unassigned</span>
                    )}
                  </td>
                  <td>
                    <span className="badge bg-primary-custom rounded-pill">{dept.employeeCount} Employees</span>
                  </td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-link text-primary me-2 p-0" onClick={() => handleEditClick(dept)}>
                      <i className="bi bi-pencil-square" style={{ fontSize: '1.1rem' }}></i>
                    </button>
                    <button className="btn btn-sm btn-link text-danger p-0" onClick={() => handleDelete(dept.id)}>
                      <i className="bi bi-trash" style={{ fontSize: '1.1rem' }}></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
              <div className="modal-header border-bottom">
                <h5 className="modal-title">{editId ? 'Modify Department' : 'Create Department'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreateOrUpdate}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label font-weight-bold">Department Name</label>
                    <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Finance Division" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label font-weight-bold">Description</label>
                    <textarea className="form-control" rows="3" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide short details..."></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label font-weight-bold">Assign Manager</label>
                    <select className="form-select" value={managerId} onChange={(e) => setManagerId(e.target.value)}>
                      <option value="">Choose Head...</option>
                      {managers.map((m) => (
                        <option key={m.id} value={m.id}>{m.fullName} ({m.role})</option>
                      ))}
                    </select>
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

export default Departments;

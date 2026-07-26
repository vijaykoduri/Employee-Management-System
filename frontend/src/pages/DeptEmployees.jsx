import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api, { SERVER_BASE_URL } from '../services/api';

const DeptEmployees = () => {
  const { user } = useContext(AuthContext);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    const loadDepartmentTeam = async () => {
      setLoading(true);
      setError('');
      try {
        const managerRes = await api.get(`/employees/${user.userId}`);
        const deptId = managerRes.data.departmentId;
        if (deptId) {
          const empRes = await api.get(`/employees/department/${deptId}`);
          setEmployees(empRes.data);
        } else {
          setError('No department assigned to your manager account.');
        }
      } catch (err) {
        setError('Failed to fetch department employee records.');
      } finally {
        setLoading(false);
      }
    };

    loadDepartmentTeam();
  }, [user]);

  return (
    <div className="card-custom animate-fade-in shadow-sm">
      <h4 className="font-weight-bold mb-4">Department Team Directory</h4>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      {loading ? (
        <div className="text-center py-5"><span className="spinner-border text-primary"></span></div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Photo</th>
                <th>Employee Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Designation</th>
                <th>Gender</th>
                <th>Joining Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">No employees registered under this department</td>
                </tr>
              ) : (
                employees.map((emp) => (
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
                    <td><span className="font-weight-bold">{emp.fullName}</span></td>
                    <td>{emp.email}</td>
                    <td>{emp.phoneNumber || '-'}</td>
                    <td>{emp.designation || 'Staff'}</td>
                    <td>{emp.gender || '-'}</td>
                    <td>{emp.joiningDate || '-'}</td>
                    <td>
                      <span className={`badge ${emp.status === 'ACTIVE' ? 'bg-success' : 'bg-danger'}`}>{emp.status}</span>
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

export default DeptEmployees;

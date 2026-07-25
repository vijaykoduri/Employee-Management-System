import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const DeptManagerDashboard = ({ setCurrentPage }) => {
  const { user } = useContext(AuthContext);
  const [deptDetails, setDeptDetails] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadDepartmentDashboard = async () => {
      try {
        // 1. Fetch current manager details to find their department
        const managerRes = await api.get(`/employees/${user.userId}`);
        const deptId = managerRes.data.departmentId;

        if (deptId) {
          // 2. Fetch department details and other related lists
          const [deptRes, empRes, projRes, attRes, leaveRes] = await Promise.all([
            api.get(`/departments/${deptId}`),
            api.get(`/employees/department/${deptId}`),
            api.get(`/projects/department/${deptId}`),
            api.get(`/attendance/department-today/${deptId}`),
            api.get(`/leaves/department/${deptId}`)
          ]);

          setDeptDetails(deptRes.data);
          setEmployees(empRes.data);
          setProjects(projRes.data);
          setTodayAttendance(attRes.data);
          setLeaves(leaveRes.data.filter((l) => l.status === 'PENDING'));
        }
      } catch (err) {
        console.error('Failed to load department manager dashboard', err);
      } finally {
        setLoading(false);
      }
    };

    loadDepartmentDashboard();
  }, [user]);

  const handleReviewLeave = async (leaveId, status) => {
    try {
      await api.post(`/leaves/${leaveId}/review`, null, {
        params: {
          status,
          remarks: 'Reviewed from department manager dashboard',
          reviewerId: user.userId
        }
      });
      setLeaves((prev) => prev.filter((l) => l.id !== leaveId));
    } catch (err) {
      console.error('Failed to review leave request', err);
    }
  };

  if (loading) {
    return <div className="text-center py-5"><span className="spinner-border text-primary"></span></div>;
  }

  if (!deptDetails) {
    return (
      <div className="card-custom text-center py-5">
        <h5>No Assigned Department</h5>
        <p className="text-muted">You are not currently set as a manager for any department.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-0 font-weight-bold">{deptDetails.name} Dashboard</h3>
          <p className="text-muted mb-0">{deptDetails.description}</p>
        </div>
        <span className="badge bg-primary-custom py-2 px-3">Department Manager Portal</span>
      </div>

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card-custom stat-card-blue d-flex justify-content-between align-items-center">
            <div>
              <h6 className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Department Employees</h6>
              <h3 className="mb-0 font-weight-bold">{employees.length}</h3>
            </div>
            <i className="bi bi-people-fill text-muted" style={{ fontSize: '2rem' }}></i>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card-custom stat-card-purple d-flex justify-content-between align-items-center">
            <div>
              <h6 className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Active Projects</h6>
              <h3 className="mb-0 font-weight-bold">{projects.length}</h3>
            </div>
            <i className="bi bi-folder2-open text-muted" style={{ fontSize: '2rem' }}></i>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card-custom stat-card-green d-flex justify-content-between align-items-center">
            <div>
              <h6 className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Checked In Today</h6>
              <h3 className="mb-0 font-weight-bold">
                {todayAttendance.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length}
              </h3>
            </div>
            <i className="bi bi-calendar-check text-muted" style={{ fontSize: '2rem' }}></i>
          </div>
        </div>
      </div>

      {/* Details Row */}
      <div className="row g-4 mb-4">
        {/* Department Employees List */}
        <div className="col-12 col-lg-6">
          <div className="card-custom h-100">
            <h6 className="font-weight-bold mb-3">My Department Team</h6>
            {employees.length === 0 ? (
              <p className="text-muted">No employees registered under this department</p>
            ) : (
              <div className="table-responsive" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                <table className="table table-borderless align-middle mb-0" style={{ fontSize: '0.88rem' }}>
                  <tbody>
                    {employees.map((emp) => (
                      <tr key={emp.id} className="border-bottom">
                        <td>
                          <span className="font-weight-bold">{emp.fullName}</span>
                          <small className="text-muted d-block">{emp.email}</small>
                        </td>
                        <td>{emp.designation || 'Staff'}</td>
                        <td>
                          <span className={`badge ${emp.status === 'ACTIVE' ? 'bg-success' : 'bg-danger'}`}>
                            {emp.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Pending Department Leaves */}
        <div className="col-12 col-lg-6">
          <div className="card-custom h-100">
            <h6 className="font-weight-bold mb-3">Pending Department Leave Approvals</h6>
            {leaves.length === 0 ? (
              <p className="text-muted text-center py-4">No pending leave requests for this department</p>
            ) : (
              <div className="d-flex flex-column gap-2" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {leaves.map((leave) => (
                  <div key={leave.id} className="p-3 bg-light rounded d-flex justify-content-between align-items-center">
                    <div>
                      <span className="font-weight-bold text-dark">{leave.employeeName}</span>
                      <small className="text-muted d-block">Requested: {leave.startDate} to {leave.endDate}</small>
                    </div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-success" onClick={() => handleReviewLeave(leave.id, 'APPROVED')}>
                        Approve
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleReviewLeave(leave.id, 'REJECTED')}>
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeptManagerDashboard;

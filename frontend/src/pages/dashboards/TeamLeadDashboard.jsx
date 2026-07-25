import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const TeamLeadDashboard = ({ setCurrentPage }) => {
  const { user } = useContext(AuthContext);
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamLeaves, setTeamLeaves] = useState([]);
  const [projects, setProjects] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadTeamLeadDashboard = async () => {
      try {
        const [teamRes, leaveRes, projRes, annRes] = await Promise.all([
          api.get(`/employees/manager/${user.userId}`),
          api.get(`/leaves/manager/${user.userId}`),
          api.get(`/projects/employee/${user.userId}`),
          api.get('/announcements')
        ]);

        setTeamMembers(teamRes.data);
        setTeamLeaves(leaveRes.data.filter((l) => l.status === 'PENDING'));
        setProjects(projRes.data);
        setAnnouncements(annRes.data.slice(0, 3));
      } catch (err) {
        console.error('Failed to load Team Lead dashboard', err);
      } finally {
        setLoading(false);
      }
    };

    loadTeamLeadDashboard();
  }, [user]);

  const handleReviewLeave = async (leaveId, status) => {
    try {
      await api.post(`/leaves/${leaveId}/review`, null, {
        params: {
          status,
          remarks: 'Reviewed from team lead dashboard',
          reviewerId: user.userId
        }
      });
      setTeamLeaves((prev) => prev.filter((l) => l.id !== leaveId));
    } catch (err) {
      console.error('Failed to review leave request', err);
    }
  };

  if (loading) {
    return <div className="text-center py-5"><span className="spinner-border text-primary"></span></div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-0 font-weight-bold">Team Lead Control Room</h3>
          <p className="text-muted mb-0">Manage tasks, timelines, and approvals for your team</p>
        </div>
        <span className="badge bg-primary-custom py-2 px-3">Team Lead Portal</span>
      </div>

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card-custom stat-card-orange d-flex justify-content-between align-items-center">
            <div>
              <h6 className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Direct Team Members</h6>
              <h3 className="mb-0 font-weight-bold">{teamMembers.length}</h3>
            </div>
            <i className="bi bi-people-fill text-muted" style={{ fontSize: '2rem' }}></i>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card-custom stat-card-purple d-flex justify-content-between align-items-center">
            <div>
              <h6 className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>My Projects</h6>
              <h3 className="mb-0 font-weight-bold">{projects.length}</h3>
            </div>
            <i className="bi bi-folder2-open text-muted" style={{ fontSize: '2rem' }}></i>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card-custom stat-card-blue d-flex justify-content-between align-items-center">
            <div>
              <h6 className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Pending Clearances</h6>
              <h3 className="mb-0 font-weight-bold">{teamLeaves.length}</h3>
            </div>
            <i className="bi bi-calendar-check text-muted" style={{ fontSize: '2rem' }}></i>
          </div>
        </div>
      </div>

      {/* Details Row */}
      <div className="row g-4 mb-4">
        {/* Team Members List */}
        <div className="col-12 col-lg-6">
          <div className="card-custom h-100">
            <h6 className="font-weight-bold mb-3">Direct Reports Directory</h6>
            {teamMembers.length === 0 ? (
              <p className="text-muted py-4 text-center">No direct reports assigned</p>
            ) : (
              <div className="table-responsive" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                <table className="table table-borderless align-middle mb-0" style={{ fontSize: '0.88rem' }}>
                  <tbody>
                    {teamMembers.map((emp) => (
                      <tr key={emp.id} className="border-bottom">
                        <td>
                          <span className="font-weight-bold">{emp.fullName}</span>
                          <small className="text-muted d-block">{emp.email}</small>
                        </td>
                        <td>{emp.designation || 'Engineer'}</td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-link" onClick={() => setCurrentPage('tasks')}>
                            View Tasks
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Team Leaves */}
        <div className="col-12 col-lg-6">
          <div className="card-custom h-100">
            <h6 className="font-weight-bold mb-3">Pending Team Leave Requests</h6>
            {teamLeaves.length === 0 ? (
              <p className="text-muted py-4 text-center">No pending leaves to approve</p>
            ) : (
              <div className="d-flex flex-column gap-2">
                {teamLeaves.map((leave) => (
                  <div key={leave.id} className="p-3 bg-light rounded d-flex justify-content-between align-items-center">
                    <div>
                      <span className="font-weight-bold text-dark">{leave.employeeName}</span>
                      <small className="text-muted d-block">{leave.startDate} to {leave.endDate}</small>
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

      {/* Announcements */}
      <div className="card-custom">
        <h6 className="font-weight-bold mb-3">Company Updates & Memos</h6>
        {announcements.length === 0 ? (
          <p className="text-muted mb-0">No announcements</p>
        ) : (
          <div className="d-flex flex-column gap-2">
            {announcements.map((ann) => (
              <div key={ann.id} className="p-2 border-bottom">
                <span className="font-weight-bold text-dark d-block">{ann.title}</span>
                <p className="text-secondary mb-0" style={{ fontSize: '0.85rem' }}>{ann.content}</p>
                <small className="text-muted">{new Date(ann.createdAt).toLocaleDateString()}</small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamLeadDashboard;

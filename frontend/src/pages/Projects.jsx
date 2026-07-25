import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Projects = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add Project States
  const [showProjModal, setShowProjModal] = useState(false);
  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projDeadline, setProjDeadline] = useState('');
  const [projStatus, setProjStatus] = useState('NOT_STARTED');
  const [assignedEmpIds, setAssignedEmpIds] = useState([]);

  // Add Task States
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [taskEmpId, setTaskEmpId] = useState('');

  const isManagement = user.role === 'SUPER_ADMIN' || user.role === 'HR_MANAGER' || user.role === 'DEPARTMENT_MANAGER' || user.role === 'TEAM_LEAD';

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      let projRes;
      if (user.role === 'SUPER_ADMIN' || user.role === 'HR_MANAGER') {
        projRes = await api.get('/projects');
      } else {
        projRes = await api.get(`/projects/employee/${user.userId}`);
      }
      setProjects(projRes.data);

      const empRes = await api.get('/employees/raw');
      setEmployees(empRes.data);
    } catch (err) {
      setError('Failed to fetch projects.');
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async (projectId) => {
    try {
      const res = await api.get(`/tasks/project/${projectId}`);
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to load project tasks', err);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const handleProjectSelect = (proj) => {
    setSelectedProject(proj);
    loadTasks(proj.id);
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/projects', {
        name: projName,
        description: projDesc,
        deadline: projDeadline,
        status: projStatus,
        employeeIds: assignedEmpIds.map(Number)
      });
      setSuccess('Project created.');
      setShowProjModal(false);
      resetProjectForm();
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project.');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/tasks', {
        projectId: selectedProject.id,
        employeeId: taskEmpId ? parseInt(taskEmpId) : null,
        title: taskTitle,
        description: taskDesc,
        deadline: taskDeadline,
        status: 'TODO'
      });
      setSuccess('Task assigned.');
      setShowTaskModal(false);
      resetTaskForm();
      loadTasks(selectedProject.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign task.');
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/status?status=${newStatus}`);
      loadTasks(selectedProject.id);
    } catch (err) {
      setError('Failed to update task status.');
    }
  };

  const resetProjectForm = () => {
    setProjName('');
    setProjDesc('');
    setProjDeadline('');
    setProjStatus('NOT_STARTED');
    setAssignedEmpIds([]);
  };

  const resetTaskForm = () => {
    setTaskTitle('');
    setTaskDesc('');
    setTaskDeadline('');
    setTaskEmpId('');
  };

  const handleAssignedEmpChange = (e) => {
    const values = Array.from(e.target.selectedOptions, (option) => option.value);
    setAssignedEmpIds(values);
  };

  return (
    <div className="animate-fade-in">
      {error && <div className="alert alert-danger py-2">{error}</div>}
      {success && <div className="alert alert-success py-2">{success}</div>}

      {/* Projects Dashboard Area */}
      {!selectedProject ? (
        <div className="card-custom shadow-sm">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <h4 className="font-weight-bold mb-0">Project Board Workspace</h4>
            {isManagement && (
              <button className="btn btn-primary-custom" onClick={() => setShowProjModal(true)}>
                <i className="bi bi-folder-plus me-1"></i> Create Project
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-5"><span className="spinner-border text-primary"></span></div>
          ) : (
            <div className="row g-3">
              {projects.length === 0 ? (
                <p className="text-muted text-center py-5">No projects mapped to your account</p>
              ) : (
                projects.map((proj) => (
                  <div key={proj.id} className="col-12 col-md-6 col-lg-4">
                    <div className="card-custom h-100 d-flex flex-column justify-content-between">
                      <div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className={`badge ${proj.status === 'COMPLETED' ? 'bg-success' : 'bg-primary'}`}>
                            {proj.status.replace('_', ' ')}
                          </span>
                          <small className="text-muted">DL: {proj.deadline}</small>
                        </div>
                        <h5 className="font-weight-bold text-dark mb-2">{proj.name}</h5>
                        <p className="text-secondary" style={{ fontSize: '0.85rem', minHeight: '40px' }}>
                          {proj.description || 'No description provided.'}
                        </p>
                      </div>

                      <div>
                        {/* Mock Progress calculation */}
                        <div className="mb-3">
                          <small className="text-muted d-block mb-1">Project Progress</small>
                          <div className="progress" style={{ height: '6px' }}>
                            <div
                              className="progress-bar bg-success"
                              role="progressbar"
                              style={{ width: proj.status === 'COMPLETED' ? '100%' : '45%' }}
                            ></div>
                          </div>
                        </div>
                        <button className="btn btn-sm btn-outline-primary w-100 py-2" onClick={() => handleProjectSelect(proj)}>
                          Open Kanban Board
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ) : (
        /* Kanban Task Tracker Workspace */
        <div className="card-custom shadow-sm">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2 pb-3 border-bottom">
            <div>
              <button className="btn btn-sm btn-outline-secondary mb-2" onClick={() => setSelectedProject(null)}>
                <i className="bi bi-arrow-left"></i> Projects List
              </button>
              <h4 className="font-weight-bold mb-1">{selectedProject.name} Taskboard</h4>
              <p className="text-muted mb-0">{selectedProject.description}</p>
            </div>
            {isManagement && (
              <button className="btn btn-primary-custom" onClick={() => setShowTaskModal(true)}>
                <i className="bi bi-list-task me-1"></i> Add Task
              </button>
            )}
          </div>

          <div className="row g-3">
            {/* Columns */}
            {['TODO', 'IN_PROGRESS', 'DONE'].map((colStatus) => {
              const colTasks = tasks.filter((t) => t.status === colStatus);
              const headerColors = {
                TODO: 'bg-secondary',
                IN_PROGRESS: 'bg-primary-custom',
                DONE: 'bg-success'
              };

              return (
                <div key={colStatus} className="col-12 col-md-4">
                  <div className="p-3 bg-light rounded-3 d-flex flex-column gap-2" style={{ minHeight: '400px' }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className={`badge ${headerColors[colStatus]} py-1 px-3`} style={{ fontSize: '0.82rem' }}>
                        {colStatus.replace('_', ' ')}
                      </span>
                      <span className="badge rounded-pill bg-white text-dark shadow-sm">{colTasks.length}</span>
                    </div>

                    <div className="d-flex flex-column gap-2 overflow-y-auto" style={{ maxHeight: '420px' }}>
                      {colTasks.length === 0 ? (
                        <p className="text-muted text-center py-4 mb-0" style={{ fontSize: '0.82rem' }}>Empty Column</p>
                      ) : (
                        colTasks.map((task) => (
                          <div key={task.id} className="p-3 bg-white rounded shadow-sm border border-light">
                            <h6 className="font-weight-bold mb-1 text-dark" style={{ fontSize: '0.9rem' }}>{task.title}</h6>
                            <p className="text-secondary mb-2" style={{ fontSize: '0.8rem' }}>{task.description}</p>
                            
                            <div className="d-flex justify-content-between align-items-center mb-2" style={{ fontSize: '0.78rem' }}>
                              <span className="text-muted"><i className="bi bi-clock me-1"></i>{task.deadline}</span>
                              <span className="badge bg-light text-dark">{task.employeeName || 'Unassigned'}</span>
                            </div>

                            <div className="d-flex gap-1 justify-content-end">
                              {colStatus !== 'TODO' && (
                                <button className="btn btn-sm btn-link text-muted p-0" title="Move back" onClick={() => handleUpdateTaskStatus(task.id, colStatus === 'DONE' ? 'IN_PROGRESS' : 'TODO')}>
                                  <i className="bi bi-chevron-left" style={{ fontSize: '1rem' }}></i>
                                </button>
                              )}
                              {colStatus !== 'DONE' && (
                                <button className="btn btn-sm btn-link text-primary p-0" title="Move forward" onClick={() => handleUpdateTaskStatus(task.id, colStatus === 'TODO' ? 'IN_PROGRESS' : 'DONE')}>
                                  <i className="bi bi-chevron-right" style={{ fontSize: '1rem' }}></i>
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showProjModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
              <div className="modal-header border-bottom">
                <h5 className="modal-title">Initialize Project Board</h5>
                <button type="button" className="btn-close" onClick={() => setShowProjModal(false)}></button>
              </div>
              <form onSubmit={handleCreateProject}>
                <div className="modal-body">
                  <div className="mb-2">
                    <label className="form-label font-weight-bold">Project Name</label>
                    <input type="text" className="form-control" value={projName} onChange={(e) => setProjName(e.target.value)} required />
                  </div>
                  <div className="mb-2">
                    <label className="form-label font-weight-bold">Scope / Description</label>
                    <textarea className="form-control" rows="3" value={projDesc} onChange={(e) => setProjDesc(e.target.value)}></textarea>
                  </div>
                  <div className="mb-2">
                    <label className="form-label font-weight-bold">Target Deadline</label>
                    <input type="date" className="form-control" value={projDeadline} onChange={(e) => setProjDeadline(e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label font-weight-bold">Assign Team (Hold Ctrl to select multiple)</label>
                    <select multiple className="form-select" rows="4" value={assignedEmpIds} onChange={handleAssignedEmpChange} required>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowProjModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary-custom">Build Board</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
              <div className="modal-header border-bottom">
                <h5 className="modal-title">Create Project Task</h5>
                <button type="button" className="btn-close" onClick={() => setShowTaskModal(false)}></button>
              </div>
              <form onSubmit={handleCreateTask}>
                <div className="modal-body">
                  <div className="mb-2">
                    <label className="form-label font-weight-bold">Task Title</label>
                    <input type="text" className="form-control" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} required />
                  </div>
                  <div className="mb-2">
                    <label className="form-label font-weight-bold">Task Details</label>
                    <textarea className="form-control" rows="3" value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)}></textarea>
                  </div>
                  <div className="mb-2">
                    <label className="form-label font-weight-bold">Deadline</label>
                    <input type="date" className="form-control" value={taskDeadline} onChange={(e) => setTaskDeadline(e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label font-weight-bold">Assign Employee</label>
                    <select className="form-select" value={taskEmpId} onChange={(e) => setTaskEmpId(e.target.value)} required>
                      <option value="">Choose team member...</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary-custom">Assign Task</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Projects;

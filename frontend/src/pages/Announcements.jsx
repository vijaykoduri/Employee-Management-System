import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Announcements = () => {
  const { user } = useContext(AuthContext);
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isManagement = user.role === 'SUPER_ADMIN' || user.role === 'HR_MANAGER' || user.role === 'TEAM_LEAD';

  const loadAnnouncements = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/announcements');
      setAnnouncements(response.data);
    } catch (err) {
      setError('Failed to fetch announcements list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/announcements', {
        title,
        content,
        createdById: user.userId
      });
      setSuccess('Announcement memo broadcasted successfully.');
      setTitle('');
      setContent('');
      loadAnnouncements();
    } catch (err) {
      setError(err.response?.data?.message || 'Posting failed.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this announcement?')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/announcements/${id}`);
      setSuccess('Announcement removed.');
      loadAnnouncements();
    } catch (err) {
      setError('Failed to delete announcement.');
    }
  };

  return (
    <div className="card-custom animate-fade-in shadow-sm">
      <h4 className="font-weight-bold mb-4">Corporate Announcements & Memos</h4>

      {error && <div className="alert alert-danger py-2">{error}</div>}
      {success && <div className="alert alert-success py-2">{success}</div>}

      <div className="row g-4 mb-4">
        {/* Form (Management only) */}
        {isManagement && (
          <div className="col-12 col-lg-4">
            <div className="card border-0 bg-light p-3 rounded shadow-sm">
              <h6 className="font-weight-bold mb-3">Broadcast New Memo</h6>
              <form onSubmit={handlePost}>
                <div className="mb-2">
                  <label className="form-label" style={{ fontSize: '0.82rem' }}>Memo Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="e.g. Scheduled System Downtime"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label" style={{ fontSize: '0.82rem' }}>Content Details</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    placeholder="Provide details of the announcement here..."
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary-custom w-100 py-2">Broadcast Notice</button>
              </form>
            </div>
          </div>
        )}

        {/* Announcements List */}
        <div className={`col-12 ${isManagement ? 'col-lg-8' : 'col-12'}`}>
          <div className="card border-0 bg-light p-3 rounded shadow-sm h-100">
            <h6 className="font-weight-bold mb-3">Notice Board Feed</h6>
            {loading ? (
              <div className="text-center py-5"><span className="spinner-border text-primary"></span></div>
            ) : (
              <div className="d-flex flex-column gap-3" style={{ maxHeight: '480px', overflowY: 'auto' }}>
                {announcements.length === 0 ? (
                  <p className="text-muted text-center py-5">No notices broadcasted yet</p>
                ) : (
                  announcements.map((ann) => (
                    <div key={ann.id} className="p-3 bg-white rounded shadow-sm border border-light">
                      <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                        <div>
                          <h6 className="font-weight-bold mb-0 text-dark">{ann.title}</h6>
                          <small className="text-muted">Posted: {new Date(ann.createdAt).toLocaleString()}</small>
                        </div>
                        {isManagement && (
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(ann.id)}>
                            <i className="bi bi-trash"></i>
                          </button>
                        )}
                      </div>
                      <p className="text-secondary mb-2" style={{ fontSize: '0.88rem', whiteSpace: 'pre-wrap' }}>
                        {ann.content}
                      </p>
                      <small className="text-muted d-block text-end">Author: {ann.createdByFullName}</small>
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

export default Announcements;

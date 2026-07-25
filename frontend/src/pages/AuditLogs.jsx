import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/audit-logs');
        setLogs(response.data);
      } catch (err) {
        setError('Failed to fetch system audit logs.');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="card-custom animate-fade-in shadow-sm">
      <h4 className="font-weight-bold mb-4">System Operational Audit Log</h4>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      {loading ? (
        <div className="text-center py-5"><span className="spinner-border text-primary"></span></div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Timestamp</th>
                <th>Operated By</th>
                <th>Transaction Name</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">No transactions logged yet</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.id}</td>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                    <td><span className="font-weight-bold text-dark">{log.username}</span></td>
                    <td><span className="badge bg-secondary">{log.action}</span></td>
                    <td>{log.details}</td>
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

export default AuditLogs;

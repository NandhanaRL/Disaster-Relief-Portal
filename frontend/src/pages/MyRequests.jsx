import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyRequests } from '../services/api';

const MyRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getMyRequests();
      if (response.success) {
        setRequests(response.requests || []);
      } else {
        setError(response.message || 'Failed to load requests.');
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'HIGH': return 'badge-role badge-admin';
      case 'MEDIUM': return 'badge-role badge-worker';
      default: return 'badge-role badge-victim';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'COMPLETED': return 'badge-role badge-victim';
      case 'IN_PROGRESS': return 'badge-role badge-worker';
      default: return 'badge-role';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="dashboard-title" style={{ margin: 0 }}>My Relief Requests</h1>
          <p className="dashboard-text">Track the status of your submitted requests</p>
        </div>
        <Link to="/victim/new-request" className="btn btn-primary">
          + New Relief Request
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading your requests...
        </div>
      ) : requests.length === 0 ? (
        <div className="auth-card" style={{ maxWidth: '100%', textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            No relief requests found.
          </p>
          <Link to="/victim/new-request" className="btn btn-primary">
            Submit a New Request
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {requests.map((req) => (
            <div key={req.id} className="step-card" style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)' }}>
                    {req.requestCode}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    {req.requestType}
                  </span>
                  <span className={getPriorityBadgeClass(req.priority)}>
                    {req.priority} PRIORITY
                  </span>
                  <span className={getStatusBadgeClass(req.status)} style={{ backgroundColor: '#f1f5f9', color: '#334155' }}>
                    {req.status}
                  </span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                  Location: <strong>{req.location}</strong> &bull; Submitted: {formatDate(req.createdAt)}
                </p>
              </div>

              <div>
                <button
                  onClick={() => navigate(`/victim/requests/${req.id}`)}
                  className="btn btn-outline"
                  style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem' }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRequests;

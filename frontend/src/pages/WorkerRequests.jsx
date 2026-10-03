import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getWorkerRequests } from '../services/api';

const WorkerRequests = () => {
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
      const response = await getWorkerRequests();
      if (response.success) {
        setRequests(response.requests || []);
      } else {
        setError(response.message || 'Failed to load assigned requests.');
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'HIGH': return <span className="badge-role badge-admin">HIGH</span>;
      case 'MEDIUM': return <span className="badge-role badge-worker">MEDIUM</span>;
      default: return <span className="badge-role badge-victim">LOW</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ASSIGNED': return <span className="badge-role" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8' }}>ASSIGNED</span>;
      case 'IN_PROGRESS': return <span className="badge-role" style={{ backgroundColor: '#f3e8ff', color: '#6b21a8' }}>IN PROGRESS</span>;
      case 'COMPLETED': return <span className="badge-role" style={{ backgroundColor: '#d1fae5', color: '#065f46' }}>COMPLETED</span>;
      default: return <span className="badge-role">{status}</span>;
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="dashboard-title" style={{ margin: 0 }}>Assigned Relief Requests</h1>
          <p className="dashboard-text">Field requests assigned to you for execution</p>
        </div>
        <Link to="/worker/dashboard" className="btn btn-outline">
          &larr; Back to Dashboard
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading assigned requests...
        </div>
      ) : requests.length === 0 ? (
        <div className="auth-card" style={{ maxWidth: '100%', textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', margin: 0 }}>
            No requests assigned to you.
          </p>
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
                  {getPriorityBadge(req.priority)}
                  {getStatusBadge(req.status)}
                </div>
                <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', margin: '0.25rem 0' }}>
                  <strong>Victim:</strong> {req.victim?.name} ({req.contactNumber})
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                  Location: <strong>{req.location}</strong>
                </p>
              </div>

              <div>
                <button
                  onClick={() => navigate(`/worker/requests/${req.id}`)}
                  className="btn btn-primary"
                  style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}
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

export default WorkerRequests;

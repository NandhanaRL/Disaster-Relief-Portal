import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAdminRequests } from '../services/api';

const AdminRequests = () => {
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
      const response = await getAdminRequests();
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

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'HIGH': return <span className="badge-role badge-admin">HIGH</span>;
      case 'MEDIUM': return <span className="badge-role badge-worker">MEDIUM</span>;
      default: return <span className="badge-role badge-victim">LOW</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': return <span className="badge-role" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>PENDING</span>;
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
          <h1 className="dashboard-title" style={{ margin: 0 }}>Request Management</h1>
          <p className="dashboard-text">Review and manage all incoming disaster relief requests</p>
        </div>
        <Link to="/admin/dashboard" className="btn btn-outline">
          &larr; Back to Dashboard
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading all relief requests...
        </div>
      ) : requests.length === 0 ? (
        <div className="auth-card" style={{ maxWidth: '100%', textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', margin: 0 }}>
            No relief requests found.
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', backgroundColor: '#ffffff', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Request ID</th>
                <th style={{ padding: '0.85rem 1rem' }}>Victim</th>
                <th style={{ padding: '0.85rem 1rem' }}>Type</th>
                <th style={{ padding: '0.85rem 1rem' }}>Priority</th>
                <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                <th style={{ padding: '0.85rem 1rem' }}>Assigned Worker</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--primary)' }}>
                    {req.requestCode}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>
                    {req.victim?.name}
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{req.victim?.phone}</div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>{req.requestType}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>{getPriorityBadge(req.priority)}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>{getStatusBadge(req.status)}</td>
                  <td style={{ padding: '0.85rem 1rem', color: req.assignedWorker ? 'var(--text-main)' : 'var(--text-muted)' }}>
                    {req.assignedWorker ? req.assignedWorker.name : 'Unassigned'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <button
                      onClick={() => navigate(`/admin/requests/${req.id}`)}
                      className="btn btn-outline"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminRequests;

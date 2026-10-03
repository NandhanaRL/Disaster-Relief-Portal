import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyRequests } from '../services/api';

const VictimDashboard = () => {
  const { user } = useAuth();
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
        setError(response.message || 'Failed to load request summary.');
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const totalCount = requests.length;
  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;
  const completedCount = requests.filter((r) => r.status === 'COMPLETED').length;

  return (
    <div className="container">
      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <h1 className="dashboard-title" style={{ margin: 0 }}>Welcome, {user?.name}</h1>
          <span className="badge-role badge-victim">VICTIM</span>
        </div>
        <p className="dashboard-text">
          You can submit and track your relief requests here.
        </p>

        <div className="dashboard-actions">
          <Link to="/victim/new-request" className="btn btn-primary">
            + New Relief Request
          </Link>
          <Link to="/victim/requests" className="btn btn-secondary">
            📋 My Requests ({totalCount})
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Summary Cards */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1rem' }}>
        Request Summary
      </h2>

      {loading ? (
        <div style={{ color: 'var(--text-muted)' }}>Loading summary...</div>
      ) : totalCount === 0 ? (
        <div className="step-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>No relief requests yet.</p>
        </div>
      ) : (
        <div className="steps-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="step-card">
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>{totalCount}</div>
            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Total Requests</div>
          </div>
          <div className="step-card">
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b' }}>{pendingCount}</div>
            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Pending</div>
          </div>
          <div className="step-card">
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>{completedCount}</div>
            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Completed</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VictimDashboard;

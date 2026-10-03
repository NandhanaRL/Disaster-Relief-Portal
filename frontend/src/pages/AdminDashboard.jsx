import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAdminStats } from '../services/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    assigned: 0,
    inProgress: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getAdminStats();
      if (response.success) {
        setStats(response.stats);
      } else {
        setError(response.message || 'Failed to load system statistics.');
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <h1 className="dashboard-title" style={{ margin: 0 }}>Welcome, {user?.name}</h1>
          <span className="badge-role badge-admin">ADMINISTRATOR</span>
        </div>
        <p className="dashboard-text">
          System management and request coordination overview
        </p>

        <div className="dashboard-actions">
          <Link to="/admin/requests" className="btn btn-primary">
            📋 Manage Requests
          </Link>
          <Link to="/admin/workers" className="btn btn-secondary">
            👷 Manage Workers
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1rem' }}>
        System Request Overview
      </h2>

      {loading ? (
        <div style={{ color: 'var(--text-muted)' }}>Loading statistics...</div>
      ) : (
        <div className="steps-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <div className="step-card">
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>{stats.total}</div>
            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Total Requests</div>
          </div>
          <div className="step-card">
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b' }}>{stats.pending}</div>
            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Pending</div>
          </div>
          <div className="step-card">
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#3b82f6' }}>{stats.assigned}</div>
            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Assigned</div>
          </div>
          <div className="step-card">
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#8b5cf6' }}>{stats.inProgress}</div>
            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>In Progress</div>
          </div>
          <div className="step-card">
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>{stats.completed}</div>
            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Completed</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

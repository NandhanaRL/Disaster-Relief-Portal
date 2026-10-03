import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getReliefRequestById } from '../services/api';

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getReliefRequestById(id);
      if (response.success) {
        setRequest(response.request);
      } else {
        setError(response.message || 'Relief request not found or access denied.');
      }
    } catch (err) {
      setError(err.message || 'Relief request not found or access denied.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not specified';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading request details...
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="container">
        <div className="auth-card" style={{ maxWidth: '600px', textAlign: 'center' }}>
          <div className="alert alert-danger">
            {error || 'Request not found.'}
          </div>
          <Link to="/victim/requests" className="btn btn-outline" style={{ marginTop: '1rem' }}>
            &larr; Back to My Requests
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/victim/requests" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
          &larr; Back to My Requests
        </Link>
      </div>

      <div className="auth-card" style={{ maxWidth: '750px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h2 className="auth-title" style={{ margin: 0, textAlign: 'left' }}>
              {request.requestCode} Details
            </h2>
            <p className="auth-subtitle" style={{ textAlign: 'left', marginTop: '0.25rem' }}>
              Submitted on {formatDate(request.createdAt)}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="user-badge" style={{ fontSize: '0.85rem' }}>
              STATUS: {request.status}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div>
            <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>REQUEST TYPE</strong>
            <span style={{ fontSize: '1.05rem', fontWeight: 600 }}>{request.requestType}</span>
          </div>

          <div>
            <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>PRIORITY</strong>
            <span style={{ fontSize: '1.05rem', fontWeight: 600, color: request.priority === 'HIGH' ? '#dc2626' : 'inherit' }}>
              {request.priority}
            </span>
          </div>

          <div>
            <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>CONTACT NUMBER</strong>
            <span style={{ fontSize: '1.05rem', fontWeight: 600 }}>{request.contactNumber}</span>
          </div>

          <div>
            <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>NEEDED BY</strong>
            <span style={{ fontSize: '1.05rem', fontWeight: 600 }}>{formatDate(request.neededBy)}</span>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
            LOCATION / ADDRESS
          </strong>
          <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', fontWeight: 500 }}>
            {request.location}
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
            DESCRIPTION OF NEED
          </strong>
          <div style={{ padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', whiteSpace: 'pre-wrap' }}>
            {request.description}
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
            ASSIGNED RELIEF WORKER
          </strong>
          <div style={{ padding: '0.75rem', backgroundColor: '#eff6ff', borderRadius: 'var(--radius)', border: '1px solid #bfdbfe', color: 'var(--primary)', fontWeight: 600 }}>
            {request.assignedWorker ? `Worker ID #${request.assignedWorker.id}` : 'Not assigned'}
          </div>
        </div>

        <div style={{ textAlign: 'right', marginTop: '2rem' }}>
          <button onClick={() => navigate('/victim/requests')} className="btn btn-secondary">
            Return to My Requests
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestDetails;

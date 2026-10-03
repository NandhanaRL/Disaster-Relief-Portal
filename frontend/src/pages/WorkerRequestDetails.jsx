import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getWorkerRequestById,
  startWorkerRequest,
  addWorkerUpdate,
  getWorkerUpdates,
  completeWorkerRequest
} from '../services/api';

const WorkerRequestDetails = () => {
  const { id } = useParams();

  const [request, setRequest] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [newUpdateMsg, setNewUpdateMsg] = useState('');
  const [showConfirmComplete, setShowConfirmComplete] = useState(false);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadRequestData();
  }, [id]);

  const loadRequestData = async () => {
    setLoading(true);
    setError('');
    try {
      const reqRes = await getWorkerRequestById(id);
      if (reqRes.success) {
        setRequest(reqRes.request);

        if (reqRes.request.status === 'IN_PROGRESS' || reqRes.request.status === 'COMPLETED') {
          fetchUpdates();
        }
      } else {
        setError(reqRes.message || 'Failed to load request details.');
      }
    } catch (err) {
      setError(err.message || 'Relief request not found or access denied.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUpdates = async () => {
    try {
      const updatesRes = await getWorkerUpdates(id);
      if (updatesRes.success) {
        setUpdates(updatesRes.updates || []);
      }
    } catch (err) {
      console.error('Failed to load progress updates:', err);
    }
  };

  const handleStartWorking = async () => {
    setError('');
    setSuccessMsg('');
    setActionLoading(true);
    try {
      const res = await startWorkerRequest(id);
      if (res.success) {
        setSuccessMsg('Request started. Status updated to IN_PROGRESS.');
        loadRequestData();
      } else {
        setError(res.message || 'Failed to start request.');
      }
    } catch (err) {
      setError(err.message || 'Server error starting request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddUpdate = async (e) => {
    e.preventDefault();
    if (!newUpdateMsg.trim()) {
      setError('Please enter a progress update message.');
      return;
    }

    setError('');
    setSuccessMsg('');
    setActionLoading(true);

    try {
      const res = await addWorkerUpdate(id, newUpdateMsg);
      if (res.success) {
        setNewUpdateMsg('');
        setSuccessMsg('Progress update added.');
        fetchUpdates();
      } else {
        setError(res.message || 'Failed to add update.');
      }
    } catch (err) {
      setError(err.message || 'Server error adding progress update.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteRequest = async () => {
    setError('');
    setSuccessMsg('');
    setActionLoading(true);

    try {
      const res = await completeWorkerRequest(id);
      if (res.success) {
        setSuccessMsg('Request completed successfully.');
        setShowConfirmComplete(false);
        loadRequestData();
      } else {
        setError(res.message || 'Failed to complete request.');
      }
    } catch (err) {
      setError(err.message || 'Server error completing request.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not specified';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
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

  if (error && !request) {
    return (
      <div className="container">
        <div className="auth-card" style={{ maxWidth: '600px', textAlign: 'center' }}>
          <div className="alert alert-danger">{error}</div>
          <Link to="/worker/requests" className="btn btn-outline" style={{ marginTop: '1rem' }}>
            &larr; Back to Assigned Requests
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/worker/requests" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
          &larr; Back to Assigned Requests
        </Link>
      </div>

      <div className="auth-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        {error && <div className="alert alert-danger">{error}</div>}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h2 className="auth-title" style={{ margin: 0, textAlign: 'left' }}>
              {request.requestCode} Field Relief
            </h2>
            <p className="auth-subtitle" style={{ textAlign: 'left', marginTop: '0.25rem' }}>
              Assigned to you &bull; Created {formatDate(request.createdAt)}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="user-badge" style={{ fontSize: '0.9rem' }}>
              STATUS: {request.status}
            </span>
          </div>
        </div>

        {/* Victim Contact Card */}
        <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>
            Victim Contact Details
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.95rem' }}>
            <div><strong>Victim Name:</strong> {request.victim?.name}</div>
            <div><strong>Contact Phone:</strong> {request.contactNumber}</div>
          </div>
        </div>

        {/* Request Information */}
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
            <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>NEEDED BY</strong>
            <span style={{ fontSize: '1.05rem', fontWeight: 600 }}>{formatDate(request.neededBy)}</span>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
            LOCATION / ADDRESS
          </strong>
          <div style={{ padding: '0.75rem', backgroundColor: '#ffffff', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', fontWeight: 600, color: 'var(--primary)' }}>
            📍 {request.location}
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
            DESCRIPTION OF NEED
          </strong>
          <div style={{ padding: '0.85rem', backgroundColor: '#ffffff', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', whiteSpace: 'pre-wrap' }}>
            {request.description}
          </div>
        </div>

        {/* ACTION WORKFLOW SECTIONS */}

        {/* 1. Status: ASSIGNED -> Show Start Working Button */}
        {request.status === 'ASSIGNED' && (
          <div style={{ padding: '1.25rem', backgroundColor: '#eff6ff', borderRadius: 'var(--radius)', border: '1px solid #bfdbfe', marginTop: '2rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>
              Ready to begin relief operations?
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              Clicking below will update the request status to <strong>IN_PROGRESS</strong>.
            </p>
            <button
              onClick={handleStartWorking}
              className={`btn btn-primary ${actionLoading ? 'btn-disabled' : ''}`}
              disabled={actionLoading}
            >
              {actionLoading ? 'Starting...' : '🚀 Start Working'}
            </button>
          </div>
        )}

        {/* 2. Status: IN_PROGRESS -> Show Updates & Complete Options */}
        {(request.status === 'IN_PROGRESS' || request.status === 'COMPLETED') && (
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '2px dashed var(--border-color)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1rem' }}>
              Progress Updates Timeline
            </h3>

            {/* Updates list */}
            {updates.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic', marginBottom: '1.5rem' }}>
                No progress updates entered yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
                {updates.map((up) => (
                  <div key={up.id} style={{ padding: '0.85rem 1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius)', borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>
                      {formatDate(up.createdAt)}
                    </div>
                    <div style={{ fontSize: '0.95rem', color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>
                      {up.message}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add update form (only if IN_PROGRESS) */}
            {request.status === 'IN_PROGRESS' && (
              <form onSubmit={handleAddUpdate} style={{ marginBottom: '2rem' }}>
                <div className="form-group">
                  <label className="form-label">Enter progress update message:</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="e.g. Reached location and delivered food supplies."
                    value={newUpdateMsg}
                    onChange={(e) => setNewUpdateMsg(e.target.value)}
                    disabled={actionLoading}
                  />
                </div>
                <button
                  type="submit"
                  className={`btn btn-secondary ${actionLoading ? 'btn-disabled' : ''}`}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Submitting...' : '+ Add Update'}
                </button>
              </form>
            )}

            {/* Completion trigger (only if IN_PROGRESS) */}
            {request.status === 'IN_PROGRESS' && (
              <div style={{ padding: '1.25rem', backgroundColor: '#fef3c7', borderRadius: 'var(--radius)', border: '1px solid #fde68a' }}>
                {!showConfirmComplete ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <strong style={{ color: '#92400e' }}>Have you completed this relief request?</strong>
                      <div style={{ fontSize: '0.85rem', color: '#b45309' }}>Marking as completed will finalize this task.</div>
                    </div>
                    <button
                      onClick={() => setShowConfirmComplete(true)}
                      className="btn btn-primary"
                      style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
                    >
                      ✓ Mark as Completed
                    </button>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontWeight: 700, color: '#92400e', marginBottom: '1rem' }}>
                      Are you sure you want to mark this request as completed?
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                      <button
                        onClick={handleCompleteRequest}
                        className={`btn btn-primary ${actionLoading ? 'btn-disabled' : ''}`}
                        style={{ backgroundColor: '#10b981' }}
                        disabled={actionLoading}
                      >
                        {actionLoading ? 'Completing...' : 'Yes, Complete Request'}
                      </button>
                      <button
                        onClick={() => setShowConfirmComplete(false)}
                        className="btn btn-outline"
                        disabled={actionLoading}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 3. Status: COMPLETED state banner */}
        {request.status === 'COMPLETED' && (
          <div style={{ padding: '1.25rem', backgroundColor: '#ecfdf5', borderRadius: 'var(--radius)', border: '1px solid #a7f3d0', marginTop: '1.5rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#065f46', margin: 0 }}>
              ✓ This request has been completed.
            </h3>
            <p style={{ color: '#047857', fontSize: '0.9rem', margin: '0.35rem 0 0 0' }}>
              Relief operation successfully delivered and logged.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerRequestDetails;

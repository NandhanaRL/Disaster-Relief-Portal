import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getAdminRequestById, getAdminWorkers, assignRequestToWorker } from '../services/api';

const AdminRequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');

  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const reqRes = await getAdminRequestById(id);
      if (reqRes.success) {
        setRequest(reqRes.request);
      } else {
        setError(reqRes.message || 'Failed to load request details.');
      }

      const workersRes = await getAdminWorkers();
      if (workersRes.success) {
        setWorkers(workersRes.workers || []);
        if (workersRes.workers.length > 0) {
          setSelectedWorkerId(workersRes.workers[0].id);
        }
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!selectedWorkerId) {
      setError('Please select a relief worker to assign.');
      return;
    }

    setAssigning(true);

    try {
      const response = await assignRequestToWorker(id, selectedWorkerId);
      if (response.success) {
        setSuccessMsg('Worker assigned successfully.');
        // Refresh request details
        const updatedRes = await getAdminRequestById(id);
        if (updatedRes.success) {
          setRequest(updatedRes.request);
        }
      } else {
        setError(response.message || 'Failed to assign worker.');
      }
    } catch (err) {
      setError(err.message || 'Server error during worker assignment.');
    } finally {
      setAssigning(false);
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

  if (error && !request) {
    return (
      <div className="container">
        <div className="auth-card" style={{ maxWidth: '600px', textAlign: 'center' }}>
          <div className="alert alert-danger">{error}</div>
          <Link to="/admin/requests" className="btn btn-outline" style={{ marginTop: '1rem' }}>
            &larr; Back to Requests
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/admin/requests" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
          &larr; Back to Requests
        </Link>
      </div>

      <div className="auth-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        {error && <div className="alert alert-danger">{error}</div>}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h2 className="auth-title" style={{ margin: 0, textAlign: 'left' }}>
              {request.requestCode} Administration
            </h2>
            <p className="auth-subtitle" style={{ textAlign: 'left', marginTop: '0.25rem' }}>
              Submitted on {formatDate(request.createdAt)}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="user-badge" style={{ fontSize: '0.9rem' }}>
              STATUS: {request.status}
            </span>
          </div>
        </div>

        {/* Victim Information Card */}
        <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>
            Victim Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.9rem' }}>
            <div><strong>Name:</strong> {request.victim?.name}</div>
            <div><strong>Email:</strong> {request.victim?.email}</div>
            <div><strong>Phone:</strong> {request.victim?.phone}</div>
          </div>
        </div>

        {/* Request Details */}
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
          <div style={{ padding: '0.75rem', backgroundColor: '#ffffff', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', fontWeight: 500 }}>
            {request.location}
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
            DESCRIPTION
          </strong>
          <div style={{ padding: '0.85rem', backgroundColor: '#ffffff', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', whiteSpace: 'pre-wrap' }}>
            {request.description}
          </div>
        </div>

        {/* Worker Assignment Section */}
        <div style={{ padding: '1.25rem', backgroundColor: '#eff6ff', borderRadius: 'var(--radius)', border: '1px solid #bfdbfe', marginTop: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem' }}>
            Relief Worker Assignment
          </h3>

          {request.status === 'PENDING' ? (
            workers.length === 0 ? (
              <div>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  No relief workers found in the system. Create a worker account first.
                </p>
                <Link to="/admin/workers" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
                  + Add Relief Worker
                </Link>
              </div>
            ) : (
              <form onSubmit={handleAssign} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <label className="form-label">Select Relief Worker ▼</label>
                  <select
                    className="form-control"
                    value={selectedWorkerId}
                    onChange={(e) => setSelectedWorkerId(e.target.value)}
                    disabled={assigning}
                  >
                    {workers.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.email})
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className={`btn btn-primary ${assigning ? 'btn-disabled' : ''}`}
                  disabled={assigning}
                >
                  {assigning ? 'Assigning...' : 'Assign Worker'}
                </button>
              </form>
            )
          ) : (
            <div>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>
                <strong>Assigned Worker:</strong> {request.assignedWorker ? `${request.assignedWorker.name} (${request.assignedWorker.email})` : 'Assigned'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRequestDetails;

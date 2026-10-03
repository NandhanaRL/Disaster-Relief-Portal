import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminWorkers, createAdminWorker } from '../services/api';

const AdminWorkers = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getAdminWorkers();
      if (response.success) {
        setWorkers(response.workers || []);
      } else {
        setError(response.message || 'Failed to load workers.');
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    const { name, email, phone, password, confirmPassword } = formData;

    if (!name.trim()) return 'Please enter worker full name.';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) return 'Please enter a valid email address.';

    const phoneRegex = /^[+]*[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/;
    if (!phone.trim() || !phoneRegex.test(phone)) return 'Please enter a valid phone number.';

    if (!password || password.length < 8) return 'Password must be at least 8 characters.';

    if (password !== confirmPassword) return 'Passwords do not match.';

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const valErr = validateForm();
    if (valErr) {
      setError(valErr);
      return;
    }

    setSubmitting(true);

    try {
      const response = await createAdminWorker({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });

      if (response.success) {
        setSuccessMsg('Relief worker created successfully.');
        setFormData({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
        setShowForm(false);
        fetchWorkers();
      } else {
        setError(response.message || 'Failed to create worker account.');
      }
    } catch (err) {
      setError(err.message || 'Server error creating worker account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="dashboard-title" style={{ margin: 0 }}>Relief Workers Management</h1>
          <p className="dashboard-text">Manage and create field relief worker accounts</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => { setShowForm(!showForm); setError(''); setSuccessMsg(''); }}
            className="btn btn-primary"
          >
            {showForm ? 'Cancel' : '+ Add Relief Worker'}
          </button>
          <Link to="/admin/dashboard" className="btn btn-outline">
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {/* Add Worker Form */}
      {showForm && (
        <div className="auth-card" style={{ maxWidth: '600px', margin: '0 0 2rem 0' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '1rem' }}>
            Create Relief Worker Account
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="Rahul Kumar"
                value={formData.name}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="rahul@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                className="form-control"
                placeholder="9876543210"
                value={formData.phone}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-control"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button
                type="submit"
                className={`btn btn-primary ${submitting ? 'btn-disabled' : ''}`}
                style={{ flex: 1 }}
                disabled={submitting}
              >
                {submitting ? 'Creating...' : 'Create Worker'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-outline"
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Workers List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading relief workers...
        </div>
      ) : workers.length === 0 ? (
        <div className="auth-card" style={{ maxWidth: '100%', textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', margin: 0 }}>
            No relief workers registered in the system yet. Click "+ Add Relief Worker" to create one.
          </p>
        </div>
      ) : (
        <div className="steps-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {workers.map((worker) => (
            <div key={worker.id} className="step-card" style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>👷</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--primary)' }}>
                  {worker.name}
                </h3>
              </div>
              <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                <strong>Email:</strong> {worker.email}
              </p>
              <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                <strong>Phone:</strong> {worker.phone}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminWorkers;

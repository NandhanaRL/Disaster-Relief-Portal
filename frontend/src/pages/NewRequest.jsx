import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createReliefRequest } from '../services/api';

const NewRequest = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    requestType: 'FOOD',
    description: '',
    priority: 'MEDIUM',
    location: '',
    contactNumber: '',
    neededBy: ''
  });

  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.requestType) {
      return 'Please select a request type.';
    }

    if (!formData.description.trim()) {
      return 'Please describe the assistance you need.';
    }

    if (!formData.priority) {
      return 'Please select a priority level.';
    }

    if (!formData.location.trim()) {
      return 'Please enter the location or address where assistance is needed.';
    }

    const phoneRegex = /^[+]*[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/;
    if (!formData.contactNumber.trim() || !phoneRegex.test(formData.contactNumber)) {
      return 'Please enter a valid contact phone number.';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await createReliefRequest({
        requestType: formData.requestType,
        description: formData.description,
        priority: formData.priority,
        location: formData.location,
        contactNumber: formData.contactNumber,
        neededBy: formData.neededBy || null
      });

      if (response.success) {
        setSuccessInfo({
          requestId: response.requestId || `REQ-${String(response.request.id).padStart(3, '0')}`
        });
      } else {
        setError(response.message || 'Failed to submit relief request.');
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  if (successInfo) {
    return (
      <div className="container">
        <div className="auth-card" style={{ maxWidth: '560px', textAlign: 'center' }}>
          <div className="alert alert-success">
            Relief request submitted successfully.
          </div>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--primary)', marginBottom: '1rem' }}>
            Request ID: <strong>{successInfo.requestId}</strong>
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Your request has been logged into the portal with status <strong>PENDING</strong>. An administrator will review and assign a relief worker shortly.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={() => navigate('/victim/requests')} className="btn btn-primary">
              View My Requests
            </button>
            <button onClick={() => navigate('/victim/dashboard')} className="btn btn-outline">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="auth-card" style={{ maxWidth: '600px' }}>
        <div className="auth-header">
          <h2 className="auth-title">Request Relief</h2>
          <p className="auth-subtitle">Submit your emergency or essential needs for assistance</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Request Type *</label>
            <select
              name="requestType"
              className="form-control"
              value={formData.requestType}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="FOOD">Food</option>
              <option value="WATER">Water</option>
              <option value="MEDICAL">Medical</option>
              <option value="SHELTER">Shelter</option>
              <option value="RESCUE">Rescue</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              name="description"
              className="form-control"
              rows="4"
              placeholder="Describe the assistance you need..."
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Priority *</label>
            <select
              name="priority"
              className="form-control"
              value={formData.priority}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Location / Address *</label>
            <input
              type="text"
              name="location"
              className="form-control"
              placeholder="Enter where assistance is needed"
              value={formData.location}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contact Number *</label>
            <input
              type="tel"
              name="contactNumber"
              className="form-control"
              placeholder="e.g. 9876543210"
              value={formData.contactNumber}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Needed By (Optional)</label>
            <input
              type="date"
              name="neededBy"
              className="form-control"
              value={formData.neededBy}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button
              type="submit"
              className={`btn btn-primary ${loading ? 'btn-disabled' : ''}`}
              style={{ flex: 1 }}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/victim/dashboard')}
              className="btn btn-outline"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewRequest;

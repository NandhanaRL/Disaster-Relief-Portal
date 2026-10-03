import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="container">
      {/* Hero Section */}
      <section className="hero">
        <h1 className="hero-title">Help When It Matters Most</h1>
        <p className="hero-subtitle">
          Request disaster relief assistance and connect with relief workers through a simple coordination platform.
        </p>
        <div className="hero-actions">
          <Link to="/register" className="btn btn-primary">
            Request Help
          </Link>
          <Link to="/login" className="btn btn-secondary">
            Login
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="steps-section">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3 className="step-title">Submit a Request</h3>
            <p className="step-desc">
              Victims can quickly register and submit specific relief requests detailing location and urgent needs.
            </p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3 className="step-title">Get Assigned</h3>
            <p className="step-desc">
              Administrators review incoming requests and assign dedicated relief workers to handle dispatch.
            </p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3 className="step-title">Receive Assistance</h3>
            <p className="step-desc">
              Relief workers update progress in real time until relief is successfully delivered to victims.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;

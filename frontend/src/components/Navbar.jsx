import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout, getDashboardPath } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="nav-brand">
          🛡️ Disaster Relief Portal
        </Link>
        <ul className="nav-links">
          <li>
            <Link to="/" className="nav-link">Home</Link>
          </li>
          {isAuthenticated ? (
            <>
              <li>
                <span className="user-badge">
                  👤 {user?.name} ({user?.role})
                </span>
              </li>
              <li>
                <Link to={getDashboardPath()} className="nav-link">
                  Dashboard
                </Link>
              </li>
              <li>
                <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.35rem 0.85rem', fontSize: '0.85rem' }}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className="nav-link">Login</Link>
              </li>
              <li>
                <Link to="/register" className="btn btn-primary" style={{ padding: '0.4rem 0.9rem', fontSize: '0.875rem' }}>
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

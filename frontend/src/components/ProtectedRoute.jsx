import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading, getDashboardPath } = useAuth();

  if (loading) {
    return <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  // If not logged in -> redirect to /login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If role is specified and current user's role is not allowed -> redirect to user's own dashboard
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={getDashboardPath(user?.role)} replace />;
  }

  return children;
};

export default ProtectedRoute;

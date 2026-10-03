import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import VictimDashboard from './pages/VictimDashboard';
import NewRequest from './pages/NewRequest';
import MyRequests from './pages/MyRequests';
import RequestDetails from './pages/RequestDetails';
import WorkerDashboard from './pages/WorkerDashboard';
import WorkerRequests from './pages/WorkerRequests';
import WorkerRequestDetails from './pages/WorkerRequestDetails';
import AdminDashboard from './pages/AdminDashboard';
import AdminRequests from './pages/AdminRequests';
import AdminRequestDetails from './pages/AdminRequestDetails';
import AdminWorkers from './pages/AdminWorkers';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Victim Routes */}
            <Route
              path="/victim/dashboard"
              element={
                <ProtectedRoute allowedRoles={['VICTIM']}>
                  <VictimDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/victim/new-request"
              element={
                <ProtectedRoute allowedRoles={['VICTIM']}>
                  <NewRequest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/victim/requests"
              element={
                <ProtectedRoute allowedRoles={['VICTIM']}>
                  <MyRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/victim/requests/:id"
              element={
                <ProtectedRoute allowedRoles={['VICTIM']}>
                  <RequestDetails />
                </ProtectedRoute>
              }
            />

            {/* Protected Worker Routes */}
            <Route
              path="/worker/dashboard"
              element={
                <ProtectedRoute allowedRoles={['WORKER']}>
                  <WorkerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/worker/requests"
              element={
                <ProtectedRoute allowedRoles={['WORKER']}>
                  <WorkerRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/worker/requests/:id"
              element={
                <ProtectedRoute allowedRoles={['WORKER']}>
                  <WorkerRequestDetails />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/requests"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/requests/:id"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminRequestDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/workers"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminWorkers />
                </ProtectedRoute>
              }
            />

            {/* Fallback Catch-all Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </AuthProvider>
    </Router>
  );
}

export default App;

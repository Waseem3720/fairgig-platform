import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';

import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import WorkerDashboard from './pages/WorkerDashboard';
import AdvocateDashboard from './pages/AdvocateDashboard';
import VerifierPanel from './pages/VerifierPanel';
import GrievanceBoard from './pages/GrievanceBoard';
import Sidebar from './components/Sidebar';

// Wraps protected pages with sidebar layout + role guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ padding: '50px', textAlign: 'center', color: '#94a3b8' }}>Loading FairGig...</div>;
  if (!user) return <Navigate to="/" />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return (
    <div className={`app-container role-${user.role}`}>
      <Sidebar />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

// Redirect logged-in users away from the home page to their dashboard
const HomeRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <HomePage />;
  if (user.role === 'worker')   return <Navigate to="/worker/dashboard" />;
  if (user.role === 'advocate') return <Navigate to="/advocate/dashboard" />;
  if (user.role === 'verifier') return <Navigate to="/verifier/panel" />;
  return <HomePage />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public pages */}
          <Route path="/"       element={<HomeRoute />} />
          <Route path="/login"  element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected dashboards — each role sees only its own */}
          <Route
            path="/worker/dashboard"
            element={<ProtectedRoute allowedRoles={['worker']}><WorkerDashboard /></ProtectedRoute>}
          />
          <Route
            path="/advocate/dashboard"
            element={<ProtectedRoute allowedRoles={['advocate']}><AdvocateDashboard /></ProtectedRoute>}
          />
          <Route
            path="/verifier/panel"
            element={<ProtectedRoute allowedRoles={['verifier']}><VerifierPanel /></ProtectedRoute>}
          />
          <Route
            path="/community"
            element={<ProtectedRoute><GrievanceBoard /></ProtectedRoute>}
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

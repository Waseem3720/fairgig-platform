import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';

import Login from './pages/Login';
import WorkerDashboard from './pages/WorkerDashboard';
import AdvocateDashboard from './pages/AdvocateDashboard';
import VerifierPanel from './pages/VerifierPanel';
import GrievanceBoard from './pages/GrievanceBoard';
import Sidebar from './components/Sidebar';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div style={{padding: '50px', textAlign: 'center'}}>Loading FairGig...</div>;
  if (!user) return <Navigate to="/login" />;
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

const DefaultDashboard = () => {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (!user) return <Navigate to="/login" />;

    if (user.role === 'worker') return <Navigate to="/worker/dashboard" />;
    if (user.role === 'advocate') return <Navigate to="/advocate/dashboard" />;
    if (user.role === 'verifier') return <Navigate to="/verifier/panel" />;
    return <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<DefaultDashboard />} />

          <Route 
            path="/worker/dashboard" 
            element={<ProtectedRoute allowedRoles={['worker']}><WorkerDashboard /></ProtectedRoute>} 
          />
          
          <Route 
            path="/advocate/dashboard" 
            element={<ProtectedRoute allowedRoles={['advocate', 'verifier']}><AdvocateDashboard /></ProtectedRoute>} 
          />

          <Route 
            path="/verifier/panel" 
            element={<ProtectedRoute allowedRoles={['verifier', 'advocate']}><VerifierPanel /></ProtectedRoute>} 
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

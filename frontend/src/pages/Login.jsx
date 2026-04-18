import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123'); // Default for demo
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError('Invalid credentials or account deactivated.');
    }
  };

  const setDemoUser = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
  }

  return (
    <div className="auth-wrapper">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel auth-card"
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', marginBottom: '16px' }}>
            <Wallet size={32} />
          </div>
          <h1>Welcome to FairGig</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Sign in to continue to your dashboard</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-control" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="e.g. worker1@gmail.com"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1.05rem', marginTop: '10px' }}>
            Sign In
          </button>
        </form>

        <div style={{ marginTop: '32px', borderTop: '1px solid var(--border-strong)', paddingTop: '24px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '12px', textAlign: 'center' }}>Competition Demo Logins (password: password123)</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <button onClick={() => setDemoUser('ahmed@gmail.com')} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '6px' }}>Worker</button>
            <button onClick={() => setDemoUser('advocate@fairgig.com')} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '6px' }}>Advocate</button>
          </div>
          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Don't have an account? <Link to="/signup" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>Sign up here</Link>.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

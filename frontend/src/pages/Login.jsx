import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      setError('');
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Back to home */}
      <Link to="/" style={{
        position: 'absolute', top: '32px', left: '40px',
        display: 'flex', alignItems: 'center', gap: '8px',
        color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600,
        textDecoration: 'none', zIndex: 10,
      }}>
        <ArrowLeft size={18} /> Home
      </Link>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="auth-card"
      >
        {/* Modern Logo Branding */}
        <div className="logo-container">
          <span className="logo-fair">Fair</span>
          <span className="logo-gig">Gig</span>
        </div>

        {/* Title matches screenshot style */}
        <div style={{ marginBottom: '40px' }}>
          <h1 className="vf-title" style={{ fontSize: '2.4rem', color: 'var(--text-primary)', textTransform: 'uppercase' }}>
            Sign In
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginTop: '8px', fontWeight: 500 }}>
            Access your advocacy portal.
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.05)', color: 'var(--danger)',
            border: '1px solid rgba(239,68,68,0.1)',
            padding: '16px', borderRadius: 'var(--radius-md)',
            marginBottom: '24px', fontSize: '0.9rem', fontWeight: 600,
          }}>
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
              placeholder="worker1@gmail.com"
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
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '18px', fontSize: '1rem', marginTop: '12px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{
          marginTop: '40px',
          paddingTop: '24px',
          textAlign: 'left',
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500 }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>
              Join the movement
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

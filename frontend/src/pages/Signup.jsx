import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'worker',
    phone: '',
    city: '',
    platform: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      setError('');
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper" style={{ background: 'var(--bg-secondary)', paddingTop: '80px', paddingBottom: '80px' }}>
      <Link to="/" style={{
        position: 'absolute', top: '32px', left: '40px',
        display: 'flex', alignItems: 'center', gap: '8px',
        color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600,
        textDecoration: 'none', zIndex: 10,
      }}>
        <ArrowLeft size={18} /> Home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel"
        style={{ width: '100%', maxWidth: '580px', padding: '60px', background: '#fff' }}
      >
        <div className="logo-container" style={{ marginBottom: '32px' }}>
          <span className="logo-fair">Fair</span>
          <span className="logo-gig">Gig</span>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Get Started
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>
            Join the platform built for transparency.
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

        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="full_name"
              className="form-control"
              value={formData.full_name}
              onChange={handleChange}
              required
              placeholder="e.g. Ali Khan"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="ali@example.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Account Type</label>
            <select
              name="role"
              className="form-control"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="worker">Gig Worker</option>
              <option value="advocate">Labor Advocate</option>
              <option value="verifier">Data Verifier</option>
            </select>
          </div>

          {formData.role === 'worker' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Primary Platform</label>
                <input
                  type="text"
                  name="platform"
                  className="form-control"
                  value={formData.platform}
                  onChange={handleChange}
                  placeholder="e.g. Careem"
                />
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  name="city"
                  className="form-control"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Karachi"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '18px', fontSize: '1rem', marginTop: '16px' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Join FairGig →'}
          </button>
        </form>

        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;

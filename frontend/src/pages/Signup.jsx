import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { motion } from 'framer-motion';
import { UserPlus, ArrowLeft } from 'lucide-react';

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
    <div className="auth-wrapper">
      {/* Back to home */}
      <Link to="/" style={{
        position: 'absolute', top: '24px', left: '32px',
        display: 'flex', alignItems: 'center', gap: '6px',
        color: '#94a3b8', fontSize: '0.88rem', fontWeight: 500,
        textDecoration: 'none', zIndex: 10,
      }}>
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel auth-card"
        style={{ maxWidth: '500px' }}
      >
        {/* Logo + Title */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'rgba(99,102,241,0.15)',
            border: '1px solid rgba(99,102,241,0.3)',
            color: '#818cf8', marginBottom: '16px',
            boxShadow: '0 0 24px rgba(99,102,241,0.2)',
          }}>
            <UserPlus size={28} />
          </div>
          <h1 style={{ fontSize: '1.7rem', marginBottom: '6px' }}>Create Account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.93rem' }}>
            Join FairGig — it's free
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', color: '#f87171',
            border: '1px solid rgba(239,68,68,0.25)',
            padding: '12px 16px', borderRadius: 'var(--radius-sm)',
            marginBottom: '20px', fontSize: '0.88rem', textAlign: 'center',
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

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="e.g. ali@example.com"
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

          <div className="form-group">
            <label className="form-label">I am a...</label>
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
            <>
              <div className="form-group">
                <label className="form-label">Primary Platform</label>
                <input
                  type="text"
                  name="platform"
                  className="form-control"
                  value={formData.platform}
                  onChange={handleChange}
                  placeholder="e.g. Careem, Foodpanda"
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
            </>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account →'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#818cf8', fontWeight: 600 }}>
              Sign In →
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;

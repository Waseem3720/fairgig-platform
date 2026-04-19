import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const SplashScreen = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Inter', sans-serif",
    }}>

      {/* ── Top Navbar ── */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 48px',
        height: '64px',
        borderBottom: '1px solid #f0f0f0',
        background: '#ffffff',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 34, height: 34,
            borderRadius: 9,
            background: '#1a1a1a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: '1rem',
            fontFamily: "'Outfit', sans-serif",
          }}>F</div>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1a1a1a', fontFamily: "'Outfit', sans-serif" }}>
            FairGig
          </span>
        </div>

        {/* Nav Buttons */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link to="/login" style={{
            padding: '8px 22px',
            borderRadius: 8,
            border: '1px solid #e0e0e0',
            color: '#1a1a1a',
            textDecoration: 'none',
            fontWeight: 500,
            fontSize: '0.9rem',
            background: 'white',
          }}>
            Sign In
          </Link>
          <Link to="/signup" style={{
            padding: '8px 22px',
            borderRadius: 8,
            background: '#1a1a1a',
            color: 'white',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '60px 24px',
        background: 'linear-gradient(180deg, #ffffff 0%, #f7f7f7 100%)',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ maxWidth: 640 }}
        >
          {/* Badge */}
          <div style={{
            display: 'inline-block',
            padding: '5px 14px',
            borderRadius: 999,
            background: '#f3f3f3',
            border: '1px solid #e8e8e8',
            color: '#555',
            fontSize: '0.78rem',
            fontWeight: 600,
            letterSpacing: '0.4px',
            textTransform: 'uppercase',
            marginBottom: 28,
          }}>
            🇵🇰 Built for Pakistan's Gig Workers · SOFTEC 2026
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(2.4rem, 5.5vw, 3.8rem)',
            fontWeight: 800,
            color: '#1a1a1a',
            lineHeight: 1.12,
            marginBottom: 20,
            fontFamily: "'Outfit', sans-serif",
            letterSpacing: '-0.5px',
          }}>
            Know What You Earn.<br />Fight for What's Fair.
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: '1.1rem',
            color: '#666',
            lineHeight: 1.75,
            marginBottom: 40,
            maxWidth: 520,
            margin: '0 auto 40px',
          }}>
            FairGig lets gig workers track earnings, detect unfair deductions,
            file grievances, and generate verified income certificates — all in one place.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" style={{
              padding: '14px 36px',
              borderRadius: 10,
              background: '#1a1a1a',
              color: 'white',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '1rem',
            }}>
              Create Free Account →
            </Link>
            <Link to="/login" style={{
              padding: '14px 32px',
              borderRadius: 10,
              background: 'white',
              border: '1px solid #ddd',
              color: '#333',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '1rem',
            }}>
              Sign In
            </Link>
          </div>
        </motion.div>

        {/* ── Feature Pills ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            justifyContent: 'center',
            marginTop: 56,
          }}
        >
          {[
            { icon: '💰', label: 'Earnings Tracker' },
            { icon: '📸', label: 'Screenshot Verification' },
            { icon: '🤖', label: 'Anomaly Detection' },
            { icon: '📋', label: 'Grievance Board' },
            { icon: '📊', label: 'Advocate Analytics' },
            { icon: '📄', label: 'Income Certificate' },
          ].map((pill) => (
            <div key={pill.label} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '8px 16px',
              background: 'white',
              border: '1px solid #e8e8e8',
              borderRadius: 999,
              fontSize: '0.85rem',
              color: '#444',
              fontWeight: 500,
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}>
              <span>{pill.icon}</span>
              <span>{pill.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Stats Row ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '60px',
        padding: '32px 48px',
        background: '#f7f7f7',
        borderTop: '1px solid #eeeeee',
        flexWrap: 'wrap',
      }}>
        {[
          { value: '100+', label: 'Workers Onboarded' },
          { value: '8', label: 'Platforms Supported' },
          { value: '3', label: 'Cities Covered' },
          { value: '6', label: 'Microservices' },
        ].map((stat) => (
          <div key={stat.label} style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '1.9rem',
              fontWeight: 800,
              color: '#1a1a1a',
              fontFamily: "'Outfit', sans-serif",
            }}>{stat.value}</div>
            <div style={{ fontSize: '0.82rem', color: '#888', marginTop: 2, fontWeight: 500 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── Footer ── */}
      <footer style={{
        textAlign: 'center',
        padding: '18px 24px',
        background: '#1a1a1a',
        color: '#888',
        fontSize: '0.82rem',
      }}>
        <span style={{ color: '#fff', fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>FairGig</span>
        {' · '}SOFTEC 2026 · Empowering Pakistan's gig economy, one shift at a time.
      </footer>

    </div>
  );
};

export default SplashScreen;

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const HomePage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Inter', sans-serif",
      color: '#e2e8f0',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Background glow orbs */}
      <div style={{
        position: 'absolute', top: '-200px', left: '50%', transform: 'translateX(-50%)',
        width: '800px', height: '800px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-100px', right: '-100px',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* ── NAVBAR ── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', height: '68px',
        borderBottom: '1px solid rgba(99,102,241,0.15)',
        position: 'relative', zIndex: 10,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: '1.1rem',
            fontFamily: "'Outfit', sans-serif",
            boxShadow: '0 0 16px rgba(99,102,241,0.4)',
          }}>F</div>
          <span style={{
            fontWeight: 700, fontSize: '1.2rem', color: '#fff',
            fontFamily: "'Outfit', sans-serif",
          }}>FairGig</span>
        </div>

        {/* Nav buttons */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link to="/login" style={{
            padding: '8px 22px', borderRadius: 8,
            border: '1px solid rgba(99,102,241,0.35)',
            color: '#a5b4fc', textDecoration: 'none',
            fontWeight: 500, fontSize: '0.9rem',
            background: 'rgba(99,102,241,0.08)',
            transition: 'all 0.2s',
          }}>Sign In</Link>
          <Link to="/signup" style={{
            padding: '8px 22px', borderRadius: 8,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white', textDecoration: 'none',
            fontWeight: 600, fontSize: '0.9rem',
            boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
          }}>Sign Up</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '60px 24px',
        position: 'relative', zIndex: 10,
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          style={{ maxWidth: 640 }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              padding: '6px 16px', borderRadius: 999,
              background: 'rgba(99,102,241,0.12)',
              border: '1px solid rgba(99,102,241,0.35)',
              color: '#a5b4fc', fontSize: '0.78rem',
              fontWeight: 600, letterSpacing: '0.5px',
              textTransform: 'uppercase', marginBottom: 28,
            }}
          >
            🇵🇰 Built for Pakistan's Gig Workers
          </motion.div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(2.4rem, 5.5vw, 3.8rem)',
            fontWeight: 800, color: '#fff',
            lineHeight: 1.12, marginBottom: 20,
            fontFamily: "'Outfit', sans-serif",
            letterSpacing: '-0.5px',
          }}>
            Know What You Earn.{' '}
            <span style={{
              background: 'linear-gradient(135deg, #818cf8, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Fight for What's Fair.
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: '1.1rem', color: '#94a3b8',
            lineHeight: 1.75, marginBottom: 48,
            maxWidth: 500, margin: '0 auto 48px',
          }}>
            FairGig lets gig workers track earnings, detect unfair deductions,
            file grievances, and generate verified income certificates — all in one place.
          </p>

          {/* ── MAIN CTA BUTTONS ── */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link to="/signup" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '16px 42px', borderRadius: 12,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white', textDecoration: 'none',
                fontWeight: 700, fontSize: '1.05rem',
                boxShadow: '0 8px 30px rgba(99,102,241,0.45)',
                letterSpacing: '0.2px',
              }}>
                Create Account →
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link to="/login" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '16px 42px', borderRadius: 12,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#e2e8f0', textDecoration: 'none',
                fontWeight: 600, fontSize: '1.05rem',
                backdropFilter: 'blur(8px)',
              }}>
                Sign In
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* ── Feature Pills ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={{
            display: 'flex', flexWrap: 'wrap', gap: '10px',
            justifyContent: 'center', marginTop: 64,
          }}
        >
          {[
            { icon: '💰', label: 'Earnings Tracker' },
            { icon: '📸', label: 'Screenshot Verification' },
            { icon: '🤖', label: 'AI Anomaly Detection' },
            { icon: '📋', label: 'Grievance Board' },
            { icon: '📊', label: 'Advocate Analytics' },
            { icon: '📄', label: 'Income Certificate' },
          ].map((pill) => (
            <div key={pill.label} style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 999, fontSize: '0.85rem',
              color: '#94a3b8', fontWeight: 500,
            }}>
              <span>{pill.icon}</span>
              <span>{pill.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Stats Row ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        style={{
          display: 'flex', justifyContent: 'center', gap: '60px',
          padding: '28px 48px',
          borderTop: '1px solid rgba(99,102,241,0.15)',
          background: 'rgba(0,0,0,0.2)',
          flexWrap: 'wrap',
          position: 'relative', zIndex: 10,
        }}
      >
        {[
          { value: '100+', label: 'Workers Onboarded' },
          { value: '8', label: 'Platforms Supported' },
          { value: '3', label: 'Cities Covered' },
          { value: '6', label: 'Microservices' },
        ].map((stat) => (
          <div key={stat.label} style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '1.8rem', fontWeight: 800, color: '#818cf8',
              fontFamily: "'Outfit', sans-serif",
            }}>{stat.value}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2, fontWeight: 500 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </motion.div>

      {/* ── Footer ── */}
      <footer style={{
        textAlign: 'center', padding: '16px 24px',
        borderTop: '1px solid rgba(99,102,241,0.1)',
        background: 'rgba(0,0,0,0.3)',
        fontSize: '0.82rem', color: '#475569',
        position: 'relative', zIndex: 10,
      }}>
        <span style={{ color: '#6366f1', fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>FairGig</span>
        {' · '}SOFTEC 2026 · Empowering Pakistan's gig economy, one shift at a time.
      </footer>

    </div>
  );
};

export default HomePage;

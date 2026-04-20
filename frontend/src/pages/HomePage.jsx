import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const HomePage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-secondary)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "var(--font-body)",
      color: 'var(--text-primary)',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Decorative Orbs */}
      <div style={{
        position: 'absolute', top: '-100px', left: '60%',
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-80px', left: '-50px',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.03) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* ── NAVBAR ── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 60px', height: '80px',
        position: 'relative', zIndex: 10,
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border-light)',
      }}>
        {/* Modern Logo Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-heading)', letterSpacing: '-1.5px' }}>
          <span className="logo-fair">Fair</span>
          <span className="logo-gig">Gig</span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link to="/login" style={{
            padding: '10px 24px', borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)', textDecoration: 'none',
            fontWeight: 700, fontSize: '0.9rem',
            transition: 'all 0.2s',
          }}>Sign In</Link>
          <Link to="/signup" className="btn btn-primary" style={{
            padding: '10px 24px', borderRadius: 'var(--radius-md)',
            fontSize: '0.9rem',
          }}>Join Now</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '80px 24px',
        position: 'relative', zIndex: 10,
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ maxWidth: 800 }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '8px 20px', borderRadius: 999,
              background: 'white',
              border: '1px solid var(--border-light)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              color: 'var(--text-secondary)', fontSize: '0.8rem',
              fontWeight: 700, letterSpacing: '0.8px',
              textTransform: 'uppercase', marginBottom: 32,
            }}
          >
            🇵🇰 Built for Pakistan's Gig Economy
          </motion.div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(2.8rem, 6vw, 4.5rem)',
            fontWeight: 800, color: 'var(--text-primary)',
            lineHeight: 1.05, marginBottom: 24,
            letterSpacing: '-2px',
          }}>
            Transparency for Workers,{' '}
            <span style={{ color: 'var(--accent-primary)' }}>
              Fairness for All.
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: '1.25rem', color: 'var(--text-secondary)',
            lineHeight: 1.6, marginBottom: 48,
            maxWidth: 600, margin: '0 auto 52px',
            fontWeight: 500,
          }}>
            Track your earnings, generate verified certificates, and identify 
            unfair platform practices with our AI-powered anomaly detection.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link to="/signup" className="btn btn-primary" style={{
                padding: '18px 48px', fontSize: '1.1rem',
                borderRadius: 'var(--radius-lg)',
              }}>
                Get Started Free
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link to="/login" className="btn btn-secondary" style={{
                padding: '18px 48px', fontSize: '1.1rem',
                borderRadius: 'var(--radius-lg)',
                background: '#fff',
              }}>
                Sign In
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          style={{
            display: 'flex', flexWrap: 'wrap', gap: '14px',
            justifyContent: 'center', marginTop: 80,
          }}
        >
          {[
            { icon: '💰', label: 'Income Verification' },
            { icon: '🛡️', label: 'Rights Advocacy' },
            { icon: '📈', label: 'Earning Analytics' },
            { icon: '🤖', label: 'Anomaly Detection' },
          ].map((pill) => (
            <div key={pill.label} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 24px',
              background: 'white',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)', 
              fontSize: '0.95rem',
              color: 'var(--text-primary)', 
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
            }}>
              <span>{pill.icon}</span>
              <span>{pill.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        style={{
          display: 'flex', justifyContent: 'center', gap: '80px',
          padding: '48px 24px',
          background: 'white',
          borderTop: '1px solid var(--border-light)',
          flexWrap: 'wrap',
          position: 'relative', zIndex: 10,
        }}
      >
        {[
          { color: 'var(--accent-primary)', value: '1,200', label: 'Active Workers' },
          { color: '#8b5cf6', value: 'PKR 4.2M', label: 'Tracked Income' },
          { color: '#3b82f6', value: '150+', label: 'Resolved Cases' },
        ].map((stat) => (
          <div key={stat.label} style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '2.2rem', fontWeight: 800, color: stat.color,
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-1px',
            }}>{stat.value}+</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Footer */}
      <footer style={{
        textAlign: 'center', padding: '32px 24px',
        fontSize: '0.9rem', color: 'var(--text-muted)',
        fontWeight: 500,
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-light)',
      }}>
        © 2026 <span style={{ color: 'var(--accent-primary)', fontWeight: 800 }}>FairGig</span>
        {' · '}Empowering Pakistan's frontline workers.
      </footer>

    </div>
  );
};

export default HomePage;

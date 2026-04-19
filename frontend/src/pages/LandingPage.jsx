import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const features = [
  {
    icon: '💰',
    title: 'Earnings Tracker',
    desc: 'Log every shift across Careem, Foodpanda, Fiverr and more. Know exactly what you earn and what's deducted.',
    color: '#3b82f6',
    bg: '#eff6ff',
  },
  {
    icon: '🔍',
    title: 'Anomaly Detection',
    desc: 'Our AI automatically flags suspicious platform deductions and unusual income drops using statistical analysis.',
    color: '#8b5cf6',
    bg: '#f5f3ff',
  },
  {
    icon: '📋',
    title: 'Grievance Board',
    desc: 'File complaints, get support from labor advocates, and cluster issues to drive systemic change.',
    color: '#f59e0b',
    bg: '#fffbeb',
  },
  {
    icon: '📄',
    title: 'Income Certificate',
    desc: 'Generate a verified income certificate accepted by banks and landlords — in one click.',
    color: '#10b981',
    bg: '#ecfdf5',
  },
  {
    icon: '📊',
    title: 'Analytics Dashboard',
    desc: 'Compare your earnings to city-wide medians. Identify trends and get a real picture of your income.',
    color: '#ef4444',
    bg: '#fef2f2',
  },
  {
    icon: '✅',
    title: 'Shift Verification',
    desc: 'Labor advocates review your screenshot-backed submissions to build a trusted record of your income.',
    color: '#06b6d4',
    bg: '#ecfeff',
  },
];

const stats = [
  { value: '100+', label: 'Gig Workers' },
  { value: '8', label: 'Platforms Supported' },
  { value: '3', label: 'Cities Covered' },
  { value: '6', label: 'Microservices' },
];

const LandingPage = () => {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: '#1e293b', overflowX: 'hidden' }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 6%', height: '68px',
        background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: '1.1rem',
          }}>F</div>
          <span style={{ fontWeight: 700, fontSize: '1.2rem', color: '#0f172a' }}>FairGig</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link to="/login" style={{
            padding: '8px 20px', borderRadius: 8,
            border: '1px solid #e2e8f0', color: '#374151',
            textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem',
            background: 'white', transition: 'all 0.2s',
          }}>Sign In</Link>
          <Link to="/signup" style={{
            padding: '8px 22px', borderRadius: 8,
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            color: 'white', textDecoration: 'none',
            fontWeight: 600, fontSize: '0.9rem',
            boxShadow: '0 4px 14px rgba(59,130,246,0.35)',
          }}>Get Started</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        background: 'linear-gradient(135deg, #f0f7ff 0%, #faf5ff 50%, #f0fdf4 100%)',
        padding: '80px 6% 90px', textAlign: 'center',
      }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span style={{
            display: 'inline-block', padding: '6px 16px', borderRadius: 999,
            background: '#eff6ff', color: '#3b82f6', fontWeight: 600, fontSize: '0.8rem',
            border: '1px solid #bfdbfe', marginBottom: 20, letterSpacing: '0.5px',
            textTransform: 'uppercase',
          }}>🇵🇰 Built for Pakistan's Gig Economy</span>

          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', fontWeight: 800,
            lineHeight: 1.15, color: '#0f172a', marginBottom: 20,
            fontFamily: "'Outfit', sans-serif",
          }}>
            Know What You Earn.<br />
            <span style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Fight for What's Fair.
            </span>
          </h1>

          <p style={{
            fontSize: '1.15rem', color: '#64748b', maxWidth: 580,
            margin: '0 auto 36px', lineHeight: 1.7,
          }}>
            FairGig empowers gig workers to track earnings, detect unfair deductions,
            file grievances, and generate verified income certificates — all in one place.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" style={{
              padding: '14px 32px', borderRadius: 10,
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: '1rem',
              boxShadow: '0 6px 20px rgba(59,130,246,0.4)',
            }}>Start for Free →</Link>
            <Link to="/login" style={{
              padding: '14px 32px', borderRadius: 10,
              background: 'white', border: '1px solid #e2e8f0',
              color: '#374151', textDecoration: 'none', fontWeight: 600, fontSize: '1rem',
            }}>Sign In</Link>
          </div>
        </motion.div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{
        background: 'white', borderTop: '1px solid #f1f5f9',
        borderBottom: '1px solid #f1f5f9', padding: '36px 6%',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '60px', flexWrap: 'wrap',
        }}>
          {stats.map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.4 }}
              style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#3b82f6', fontFamily: "'Outfit', sans-serif" }}>{s.value}</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: '80px 6%', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <h2 style={{
            fontSize: '2rem', fontWeight: 800, color: '#0f172a',
            fontFamily: "'Outfit', sans-serif", marginBottom: 12,
          }}>Everything a Gig Worker Needs</h2>
          <p style={{ color: '#64748b', fontSize: '1.05rem' }}>
            One platform, 6 powerful services working together.
          </p>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24, maxWidth: 1100, margin: '0 auto',
        }}>
          {features.map((f, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i, duration: 0.4 }}
              style={{
                background: 'white', borderRadius: 14,
                padding: '28px', border: '1px solid #f1f5f9',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                transition: 'all 0.25s ease',
              }}
              whileHover={{ y: -4, boxShadow: '0 8px 28px rgba(0,0,0,0.09)' }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: f.bg, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '1.5rem', marginBottom: 16,
              }}>{f.icon}</div>
              <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1e293b', marginBottom: 8, fontFamily: "'Outfit', sans-serif" }}>{f.title}</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.65 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '80px 6%', background: 'white', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif", marginBottom: 12 }}>
          How It Works
        </h2>
        <p style={{ color: '#64748b', marginBottom: 52 }}>Simple steps to get started in minutes.</p>
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 32,
          flexWrap: 'wrap', maxWidth: 900, margin: '0 auto',
        }}>
          {[
            { step: '1', title: 'Sign Up', desc: 'Create your account as a Worker, Advocate, or Verifier.', color: '#3b82f6' },
            { step: '2', title: 'Log Your Shifts', desc: 'Add your daily earnings with a screenshot for verification.', color: '#8b5cf6' },
            { step: '3', title: 'Get Insights', desc: 'View anomalies, compare earnings, raise grievances.', color: '#10b981' },
            { step: '4', title: 'Download Certificate', desc: 'Generate a verified income proof for your bank or landlord.', color: '#f59e0b' },
          ].map((item, i) => (
            <div key={i} style={{ flex: '1 1 180px', maxWidth: 200 }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%', margin: '0 auto 16px',
                background: item.color, color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '1.3rem', fontFamily: "'Outfit', sans-serif",
              }}>{item.step}</div>
              <h4 style={{ fontWeight: 700, marginBottom: 8, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>{item.title}</h4>
              <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA STRIP ── */}
      <section style={{
        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
        padding: '60px 6%', textAlign: 'center',
      }}>
        <h2 style={{ color: 'white', fontSize: '2rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif", marginBottom: 12 }}>
          Ready to Take Control of Your Income?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 32, fontSize: '1.05rem' }}>
          Join FairGig today — it's free and takes less than a minute.
        </p>
        <Link to="/signup" style={{
          padding: '14px 36px', borderRadius: 10,
          background: 'white', color: '#3b82f6',
          textDecoration: 'none', fontWeight: 700, fontSize: '1rem',
          boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
        }}>Create Free Account →</Link>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        background: '#0f172a', color: '#94a3b8',
        textAlign: 'center', padding: '28px 6%',
        fontSize: '0.85rem',
      }}>
        <div style={{ marginBottom: 8 }}>
          <span style={{ color: 'white', fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>FairGig</span>
          {' · '}Built for SOFTEC 2026
        </div>
        <div>Empowering Pakistan's gig economy — one shift at a time.</div>
      </footer>
    </div>
  );
};

export default LandingPage;

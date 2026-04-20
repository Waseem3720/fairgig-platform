import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import {
  LayoutDashboard,
  Wallet,
  FileCheck,
  MessageSquareWarning,
  LogOut,
  UserCircle,
  ShieldCheck,
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navStyle = (isActive) => ({
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px 18px', borderRadius: 'var(--radius-md)',
    color: isActive ? '#fff' : 'var(--text-muted)',
    background: isActive ? 'var(--accent-primary)' : 'transparent',
    textDecoration: 'none',
    fontWeight: isActive ? '700' : '600',
    fontSize: '0.94rem',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: isActive ? '0 4px 20px rgba(16, 185, 129, 0.25)' : 'none',
  });

  const roleLabels = {
    worker:   { label: 'Gig Worker',      icon: <Wallet size={12} />,      color: '#10b981' },
    advocate: { label: 'Labor Advocate',  icon: <LayoutDashboard size={12} />, color: '#6366f1' },
    verifier: { label: 'Data Verifier',   icon: <ShieldCheck size={12} />, color: '#10b981' },
  };
  const roleInfo = roleLabels[user?.role] || {};

  return (
    <div style={{
      width: '280px', minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      padding: '32px 20px',
      background: 'var(--text-primary)',
      position: 'sticky', top: 0, height: '100vh',
      zIndex: 100,
    }}>

      {/* ── Logo Branding (matches screenshot) ── */}
      <div style={{
        padding: '0 8px 32px 8px',
        marginBottom: '28px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-heading)', letterSpacing: '-1.5px' }}>
          <span style={{ color: '#fff' }}>Fair</span>
          <span style={{ color: 'var(--accent-primary)' }}>Gig</span>
        </div>
      </div>

      {/* ── Nav Links ── */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>

        {user?.role === 'worker' && (
          <NavLink to="/worker/dashboard" style={({ isActive }) => navStyle(isActive)}>
            <LayoutDashboard size={20} /> My Earnings
          </NavLink>
        )}

        {user?.role === 'advocate' && (
          <NavLink to="/advocate/dashboard" style={({ isActive }) => navStyle(isActive)}>
            <LayoutDashboard size={20} /> Advocate Panel
          </NavLink>
        )}

        {user?.role === 'verifier' && (
          <NavLink to="/verifier/panel" style={({ isActive }) => navStyle(isActive)}>
            <FileCheck size={20} /> Verification Queue
          </NavLink>
        )}

        <NavLink to="/community" style={({ isActive }) => navStyle(isActive)}>
          <MessageSquareWarning size={20} /> Community
        </NavLink>
      </nav>

      {/* ── User Profile + Logout ── */}
      <div style={{
        marginTop: 'auto', paddingTop: '24px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        {/* Role badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 999, padding: '4px 12px',
          fontSize: '0.65rem', color: roleInfo.color || '#94a3b8',
          fontWeight: 800, letterSpacing: '1px',
          textTransform: 'uppercase', marginBottom: '16px',
        }}>
          {roleInfo.icon} {roleInfo.label}
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '12px', marginBottom: '16px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <UserCircle size={32} color="#94a3b8" />
          <div style={{ overflow: 'hidden' }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.full_name}
            </p>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="btn"
          style={{ 
            width: '100%', 
            justifyContent: 'center', 
            background: 'rgba(239, 68, 68, 0.1)', 
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.1)'
          }}
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

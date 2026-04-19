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
    padding: '11px 16px', borderRadius: 'var(--radius-md)',
    color: isActive ? '#fff' : 'var(--text-secondary)',
    background: isActive
      ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
      : 'transparent',
    textDecoration: 'none',
    fontWeight: isActive ? '600' : '500',
    fontSize: '0.92rem',
    transition: 'all 0.2s ease',
    boxShadow: isActive ? '0 4px 16px rgba(99,102,241,0.4)' : 'none',
  });

  const roleLabels = {
    worker:   { label: 'Gig Worker',      icon: <Wallet size={13} />,      color: '#818cf8' },
    advocate: { label: 'Labor Advocate',  icon: <LayoutDashboard size={13} />, color: '#a78bfa' },
    verifier: { label: 'Data Verifier',   icon: <ShieldCheck size={13} />, color: '#6ee7b7' },
  };
  const roleInfo = roleLabels[user?.role] || {};

  return (
    <div style={{
      width: '260px', minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      padding: '24px 16px',
      background: 'rgba(19, 28, 49, 0.95)',
      borderRight: '1px solid rgba(99,102,241,0.2)',
      position: 'sticky', top: 0, height: '100vh',
      backdropFilter: 'blur(12px)',
    }}>

      {/* ── Logo ── */}
      <div style={{
        padding: '0 12px 28px 12px',
        borderBottom: '1px solid rgba(99,102,241,0.2)',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: '1rem',
            fontFamily: "'Outfit', sans-serif",
            boxShadow: '0 0 14px rgba(99,102,241,0.4)',
          }}>F</div>
          <span style={{
            fontWeight: 700, fontSize: '1.15rem', color: '#fff',
            fontFamily: "'Outfit', sans-serif",
          }}>FairGig</span>
        </div>
      </div>

      {/* ── Nav Links ── */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>

        {user?.role === 'worker' && (
          <NavLink to="/worker/dashboard" style={({ isActive }) => navStyle(isActive)}>
            <LayoutDashboard size={19} /> My Earnings
          </NavLink>
        )}

        {user?.role === 'advocate' && (
          <NavLink to="/advocate/dashboard" style={({ isActive }) => navStyle(isActive)}>
            <LayoutDashboard size={19} /> Advocate Panel
          </NavLink>
        )}

        {user?.role === 'verifier' && (
          <NavLink to="/verifier/panel" style={({ isActive }) => navStyle(isActive)}>
            <FileCheck size={19} /> Verification Queue
          </NavLink>
        )}

        <NavLink to="/community" style={({ isActive }) => navStyle(isActive)}>
          <MessageSquareWarning size={19} /> Community Board
        </NavLink>
      </nav>

      {/* ── User Profile + Logout ── */}
      <div style={{
        marginTop: 'auto', paddingTop: '20px',
        borderTop: '1px solid rgba(99,102,241,0.2)',
      }}>
        {/* Role badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          background: 'rgba(99,102,241,0.1)',
          border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: 999, padding: '3px 10px',
          fontSize: '0.7rem', color: roleInfo.color || '#818cf8',
          fontWeight: 600, letterSpacing: '0.5px',
          textTransform: 'uppercase', marginBottom: '12px',
        }}>
          {roleInfo.icon} {roleInfo.label}
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '10px 12px', marginBottom: '12px',
          background: 'rgba(99,102,241,0.06)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(99,102,241,0.12)',
        }}>
          <UserCircle size={32} color="#64748b" />
          <div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.88rem', color: '#e2e8f0' }}>
              {user?.full_name}
            </p>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.75rem' }}>
              {user?.email}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="btn btn-secondary"
          style={{ width: '100%', justifyContent: 'flex-start' }}
        >
          <LogOut size={17} /> Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

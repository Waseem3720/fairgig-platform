import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { 
  LayoutDashboard, 
  Wallet, 
  FileCheck, 
  MessageSquareWarning, 
  LogOut,
  UserCircle
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar" style={{
      display: 'flex', flexDirection: 'column', height: '100vh', 
      padding: '24px 16px', background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-strong)', position: 'sticky', top: 0
    }}>
      <div style={{ padding: '0 16px 32px 16px', borderBottom: '1px solid var(--border-strong)', marginBottom: '24px' }}>
        <h2 style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Wallet size={24} /> FairGig
        </h2>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {user?.role === 'worker' && (
          <NavLink 
            to="/worker/dashboard" 
            style={({isActive}) => ({
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              color: isActive ? '#fff' : 'var(--text-secondary)',
              background: isActive ? 'var(--accent-primary)' : 'transparent',
              textDecoration: 'none',
              fontWeight: isActive ? '600' : '500'
            })}
          >
            <LayoutDashboard size={20} /> My Earnings
          </NavLink>
        )}

        {(user?.role === 'advocate' || user?.role === 'verifier') && (
          <NavLink 
            to="/advocate/dashboard" 
            style={({isActive}) => ({
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              color: isActive ? '#fff' : 'var(--text-secondary)',
              background: isActive ? 'var(--accent-primary)' : 'transparent',
              textDecoration: 'none',
              fontWeight: isActive ? '600' : '500'
            })}
          >
            <LayoutDashboard size={20} /> Advocate Panel
          </NavLink>
        )}

        {(user?.role === 'verifier' || user?.role === 'advocate') && (
          <NavLink 
            to="/verifier/panel" 
            style={({isActive}) => ({
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              color: isActive ? '#fff' : 'var(--text-secondary)',
              background: isActive ? 'var(--accent-primary)' : 'transparent',
              textDecoration: 'none',
              fontWeight: isActive ? '600' : '500'
            })}
          >
            <FileCheck size={20} /> Verify Screenshots
          </NavLink>
        )}

        <NavLink 
          to="/community" 
          style={({isActive}) => ({
            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            color: isActive ? '#fff' : 'var(--text-secondary)',
            background: isActive ? 'var(--accent-primary)' : 'transparent',
            textDecoration: 'none',
            fontWeight: isActive ? '600' : '500'
          })}
        >
          <MessageSquareWarning size={20} /> Community Board
        </NavLink>
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--border-strong)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', marginBottom: '16px' }}>
          <UserCircle size={32} color="var(--text-secondary)" />
          <div>
            <p style={{ margin: 0, fontWeight: '600', fontSize: '0.9rem' }}>{user?.full_name}</p>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'capitalize' }}>{user?.role}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="btn btn-secondary" 
          style={{ width: '100%', justifyContent: 'flex-start' }}
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

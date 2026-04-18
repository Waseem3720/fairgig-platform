import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { MessageSquareWarning, Megaphone, Flag, Filter, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';

const GrievanceBoard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPlatform, setFilterPlatform] = useState('');

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [newComplaint, setNewComplaint] = useState({
    platform: 'Careem',
    category: 'commission_change',
    title: '',
    description: '',
    is_anonymous: false
  });

  const fetchData = async () => {
    try {
      const res = await api.grievance.list();
      setComplaints(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.grievance.create(newComplaint);
      setShowForm(false);
      setNewComplaint({ ...newComplaint, title: '', description: '' });
      fetchData();
    } catch (err) {
      alert("Failed to post grievance.");
    }
  };

  const filtered = filterPlatform ? complaints.filter(c => c.platform === filterPlatform) : complaints;

  if (loading) return <div style={{padding: '50px'}}>Loading bulletin board...</div>;

  return (
    <div className="page-container" style={{ maxWidth: '900px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Megaphone size={32} color="var(--accent-primary)" /> Community Bulletin Board</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Share and discover systemic issues across platforms.</p>
        </div>
        {user.role === 'worker' && (
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            {showForm ? 'Cancel POST' : 'Post Grievance'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px', border: '1px solid var(--accent-primary)' }}>
          <h3 style={{ marginBottom: '16px' }}>Lodge a Complaint</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group mb-0">
                <label className="form-label">Platform Involved</label>
                <select className="form-control" value={newComplaint.platform} onChange={e => setNewComplaint({...newComplaint, platform: e.target.value})}>
                  <option>Careem</option>
                  <option>Foodpanda</option>
                  <option>Bykea</option>
                  <option>InDrive</option>
                  <option>Uber</option>
                </select>
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Issue Category</label>
                <select className="form-control" value={newComplaint.category} onChange={e => setNewComplaint({...newComplaint, category: e.target.value})}>
                  <option value="commission_change">Sudden Commission Change</option>
                  <option value="account_deactivation">Unexplained Deactivation</option>
                  <option value="payment_delay">Payment Delay</option>
                  <option value="rating_manipulation">Rating Manipulation</option>
                  <option value="other">Other Issues</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Brief Title</label>
              <input type="text" className="form-control" required value={newComplaint.title} onChange={e => setNewComplaint({...newComplaint, title: e.target.value})} placeholder="e.g., Hidden fees added today" />
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Description</label>
              <textarea className="form-control" rows="4" required value={newComplaint.description} onChange={e => setNewComplaint({...newComplaint, description: e.target.value})} placeholder="Explain what happened..."></textarea>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={newComplaint.is_anonymous} onChange={e => setNewComplaint({...newComplaint, is_anonymous: e.target.checked})} />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Post Anonymously (Identity hidden from other workers)</span>
              </label>
              <button type="submit" className="btn btn-primary" style={{ padding: '8px 24px' }}>Submit Post</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button onClick={() => setFilterPlatform('')} className={`btn ${filterPlatform === '' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>All Platforms</button>
        <button onClick={() => setFilterPlatform('Careem')} className={`btn ${filterPlatform === 'Careem' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Careem</button>
        <button onClick={() => setFilterPlatform('Foodpanda')} className={`btn ${filterPlatform === 'Foodpanda' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Foodpanda</button>
        <button onClick={() => setFilterPlatform('Bykea')} className={`btn ${filterPlatform === 'Bykea' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Bykea</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filtered.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No grievances found.</p>
        ) : (
          filtered.map(c => (
            <div key={c.id} className="glass-card" style={{ display: 'flex', gap: '20px' }}>
              <div style={{ flexShrink: 0, width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {c.category === 'account_deactivation' ? <ShieldAlert color="var(--danger)" /> : <MessageSquareWarning color="var(--text-secondary)" />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{c.title}</h3>
                  <span className={`badge ${c.status === 'resolved' ? 'badge-verified' : c.status === 'escalated' ? 'badge-disputed' : 'badge-pending'}`}>
                    {c.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  <span style={{ color: 'var(--info)' }}>{c.platform}</span>
                  <span>•</span>
                  <span>{c.is_anonymous ? 'Anonymous Worker' : `Worker #${c.worker_id}`}</span>
                  <span>•</span>
                  <span>{format(new Date(c.created_at), 'MMM dd, yyyy')}</span>
                </div>

                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  {c.description}
                </p>

                {c.tags && c.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <Flag size={14} color="var(--text-muted)" />
                    {c.tags.map(t => (
                      <span key={t} style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

export default GrievanceBoard;

import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

const VerifierPanel = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  // Note: we can use dummy screenshots if none were uploaded for the dummy data,
  // but let's assume we review the data payload itself as verification for now.

  const fetchPending = async () => {
    try {
      const res = await api.earnings.getPendingVerifications();
      setPending(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleVerify = async (id, status) => {
    try {
      await api.earnings.verifyShift(id, status, "Reviewed externally provided payload image.");
      setPending(pending.filter(p => p.id !== id));
    } catch (err) {
      alert("Failed to update status");
    }
  };

  if (loading) return <div style={{padding: '50px'}}>Loading verification queue...</div>;

  return (
    <div className="page-container">
      <div style={{ marginBottom: '32px' }}>
        <h1>Verification Queue</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Review uploaded screenshots and validate reported earnings data.</p>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{marginBottom: '20px'}}>Pending Review ({pending.length})</h3>
        
        {pending.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <CheckCircle size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
            <p>Verification queue is entirely clear. Great job!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {pending.map(shift => (
              <div key={shift.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span className="badge badge-pending">PENDING_REVIEW</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Shift #{shift.id}</span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.9rem', marginBottom: '24px' }}>
                  <div><span style={{ color: 'var(--text-secondary)' }}>Platform:</span> <br/>{shift.platform}</div>
                  <div><span style={{ color: 'var(--text-secondary)' }}>Date:</span> <br/>{format(new Date(shift.date), 'MMM dd, yyyy')}</div>
                  <div><span style={{ color: 'var(--text-secondary)' }}>Gross:</span> <br/>PKR {shift.gross_earned}</div>
                  <div><span style={{ color: 'var(--text-secondary)' }}>Net:</span> <br/>PKR {shift.net_received}</div>
                </div>

                {shift.screenshot_url && (
                    <div style={{ marginBottom: '24px', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '4px', textAlign: 'center', border: '1px dashed var(--border-strong)' }}>
                       <a href={`http://localhost:8002${shift.screenshot_url}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.9rem', color: 'var(--info)' }}>
                         View Attached Evidence
                       </a>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                  <button onClick={() => handleVerify(shift.id, 'verified')} className="btn" style={{ flex: 1, background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    <CheckCircle size={16} /> Approve
                  </button>
                  <button onClick={() => handleVerify(shift.id, 'disputed')} className="btn" style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                    <XCircle size={16} /> Reject
                  </button>
                  <button onClick={() => handleVerify(shift.id, 'unverifiable')} className="btn" title="Unreadable/Blurry" style={{ flex: 1, background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                    <AlertTriangle size={16} /> Blurry
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default VerifierPanel;

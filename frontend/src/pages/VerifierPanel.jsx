import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, ShieldCheck, Clock, Eye, Image, Inbox } from 'lucide-react';
import { format } from 'date-fns';

const VerifierPanel = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPending = async () => {
    setLoading(true);
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
    setActionLoading(id + status);
    const labels = { verified: 'Approved', disputed: 'Rejected', unverifiable: 'Flagged as Unreadable' };
    try {
      await api.earnings.verifyShift(id, status, 'Reviewed via Verifier Panel.');
      setPending(prev => prev.filter(p => p.id !== id));
      showToast(`Shift #${id} ${labels[status]}`, status === 'verified' ? 'success' : status === 'disputed' ? 'danger' : 'warning');
    } catch (err) {
      showToast('Action failed. Please try again.', 'danger');
    } finally {
      setActionLoading(null);
    }
  };

  const stats = {
    total: pending.length,
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--vf-bg)', padding: '0' }}>
      {/* Role-specific CSS vars scoped to this page */}
      <style>{`
        :root {
          --vf-bg: #0f172a;
          --vf-surface: rgba(30, 41, 59, 0.85);
          --vf-border: rgba(99, 102, 241, 0.2);
          --vf-accent: #6366f1;
          --vf-accent-glow: rgba(99, 102, 241, 0.3);
          --vf-text: #e2e8f0;
          --vf-muted: #94a3b8;
        }
        .vf-page { font-family: 'Inter', sans-serif; }
        .vf-header {
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
          padding: 32px 40px;
          border-bottom: 1px solid var(--vf-border);
        }
        .vf-badge-role {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(99,102,241,0.15);
          border: 1px solid rgba(99,102,241,0.35);
          color: #a5b4fc;
          padding: 4px 14px;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          margin-bottom: 12px;
        }
        .vf-title { font-size: 2rem; font-weight: 700; color: #fff; margin-bottom: 4px; }
        .vf-subtitle { color: #94a3b8; font-size: 0.95rem; }
        .vf-stats-row {
          display: flex;
          gap: 20px;
          padding: 24px 40px;
          border-bottom: 1px solid rgba(99,102,241,0.1);
          background: rgba(15,23,42,0.6);
        }
        .vf-stat-chip {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--vf-surface);
          border: 1px solid var(--vf-border);
          border-radius: 12px;
          padding: 12px 20px;
          backdrop-filter: blur(10px);
        }
        .vf-stat-chip .vf-stat-number { font-size: 1.4rem; font-weight: 700; color: #fff; }
        .vf-stat-chip .vf-stat-label { font-size: 0.8rem; color: #94a3b8; }
        .vf-body { padding: 32px 40px; }
        .vf-section-title {
          font-size: 1rem;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .vf-section-title::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(99,102,241,0.15);
        }
        .vf-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 24px;
        }
        .vf-card {
          background: var(--vf-surface);
          border: 1px solid var(--vf-border);
          border-radius: 16px;
          padding: 24px;
          backdrop-filter: blur(12px);
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .vf-card:hover {
          border-color: rgba(99,102,241,0.45);
          box-shadow: 0 0 24px rgba(99,102,241,0.12);
        }
        .vf-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .vf-shift-id { font-size: 0.8rem; color: #64748b; font-family: monospace; }
        .vf-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 20px;
        }
        .vf-info-item label { display: block; font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
        .vf-info-item span { font-size: 0.95rem; color: #e2e8f0; font-weight: 500; }
        .vf-evidence-box {
          background: rgba(0,0,0,0.25);
          border: 1px dashed rgba(99,102,241,0.3);
          border-radius: 8px;
          padding: 10px 14px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .vf-evidence-link {
          color: #a5b4fc;
          font-size: 0.88rem;
          text-decoration: none;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
          font-family: inherit;
        }
        .vf-evidence-link:hover { text-decoration: underline; }
        .vf-actions {
          display: flex;
          gap: 10px;
        }
        .vf-btn {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid transparent;
          transition: all 0.2s;
          font-family: 'Inter', sans-serif;
        }
        .vf-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .vf-btn-approve {
          background: rgba(16,185,129,0.1);
          color: #10b981;
          border-color: rgba(16,185,129,0.3);
        }
        .vf-btn-approve:hover:not(:disabled) { background: rgba(16,185,129,0.2); }
        .vf-btn-reject {
          background: rgba(239,68,68,0.1);
          color: #ef4444;
          border-color: rgba(239,68,68,0.3);
        }
        .vf-btn-reject:hover:not(:disabled) { background: rgba(239,68,68,0.2); }
        .vf-btn-flag {
          background: rgba(245,158,11,0.1);
          color: #f59e0b;
          border-color: rgba(245,158,11,0.3);
        }
        .vf-btn-flag:hover:not(:disabled) { background: rgba(245,158,11,0.2); }
        .vf-empty {
          text-align: center;
          padding: 80px 20px;
          color: #475569;
        }
        .vf-empty svg { margin-bottom: 16px; }
        .vf-empty h3 { font-size: 1.2rem; color: #64748b; margin-bottom: 8px; }
        .vf-empty p { font-size: 0.9rem; }
        .vf-toast {
          position: fixed;
          bottom: 32px;
          right: 32px;
          padding: 14px 22px;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 500;
          z-index: 9999;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: 'Inter', sans-serif;
        }
        .vf-toast-success { background: #064e3b; color: #6ee7b7; border: 1px solid #10b981; }
        .vf-toast-danger  { background: #7f1d1d; color: #fca5a5; border: 1px solid #ef4444; }
        .vf-toast-warning { background: #78350f; color: #fcd34d; border: 1px solid #f59e0b; }
        .vf-preview-overlay {
          position: fixed; top:0; left:0; right:0; bottom:0;
          background: rgba(0,0,0,0.85); backdrop-filter: blur(6px);
          z-index: 1000; display: flex; align-items: center; justify-content: center;
          cursor: zoom-out;
        }
        .vf-preview-overlay img { max-width: 90vw; max-height: 90vh; border-radius: 12px; box-shadow: 0 0 60px rgba(0,0,0,0.6); }
        .vf-loading {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          flex-direction: column; gap: 16px;
          background: #0f172a; color: #94a3b8;
        }
        .vf-spinner {
          width: 40px; height: 40px;
          border: 3px solid rgba(99,102,241,0.2);
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: vf-spin 0.8s linear infinite;
        }
        @keyframes vf-spin { to { transform: rotate(360deg); } }
      `}</style>

      {loading ? (
        <div className="vf-loading">
          <div className="vf-spinner" />
          <p>Loading verification queue...</p>
        </div>
      ) : (
        <div className="vf-page">
          {/* Header */}
          <div className="vf-header">
            <div className="vf-badge-role">
              <ShieldCheck size={13} /> Verifier Role
            </div>
            <h1 className="vf-title">Verification Queue</h1>
            <p className="vf-subtitle">Review uploaded proof screenshots and validate reported earnings claims.</p>
          </div>

          {/* Stats Row */}
          <div className="vf-stats-row">
            <div className="vf-stat-chip">
              <Clock size={20} color="#f59e0b" />
              <div>
                <div className="vf-stat-number">{stats.total}</div>
                <div className="vf-stat-label">Awaiting Review</div>
              </div>
            </div>
            <div className="vf-stat-chip">
              <Eye size={20} color="#6366f1" />
              <div>
                <div className="vf-stat-number">{pending.filter(p => p.screenshot_url).length}</div>
                <div className="vf-stat-label">With Evidence</div>
              </div>
            </div>
            <div className="vf-stat-chip">
              <Image size={20} color="#94a3b8" />
              <div>
                <div className="vf-stat-number">{pending.filter(p => !p.screenshot_url).length}</div>
                <div className="vf-stat-label">No Screenshot</div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="vf-body">
            <div className="vf-section-title">
              <Clock size={16} /> Pending Items ({pending.length})
            </div>

            {pending.length === 0 ? (
              <div className="vf-empty">
                <Inbox size={56} strokeWidth={1.5} />
                <h3>Queue is clear!</h3>
                <p>All submissions have been reviewed. Check back later for new entries.</p>
              </div>
            ) : (
              <div className="vf-grid">
                <AnimatePresence>
                  {pending.map((shift, idx) => (
                    <motion.div
                      key={shift.id}
                      className="vf-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <div className="vf-card-header">
                        <span className="badge badge-pending">PENDING REVIEW</span>
                        <span className="vf-shift-id">SHIFT #{shift.id}</span>
                      </div>

                      <div className="vf-info-grid">
                        <div className="vf-info-item">
                          <label>Platform</label>
                          <span>{shift.platform}</span>
                        </div>
                        <div className="vf-info-item">
                          <label>Date</label>
                          <span>{format(new Date(shift.date), 'MMM dd, yyyy')}</span>
                        </div>
                        <div className="vf-info-item">
                          <label>Gross Earned</label>
                          <span style={{ color: '#a5b4fc' }}>PKR {shift.gross_earned?.toLocaleString()}</span>
                        </div>
                        <div className="vf-info-item">
                          <label>Net Received</label>
                          <span style={{ color: '#6ee7b7' }}>PKR {shift.net_received?.toLocaleString()}</span>
                        </div>
                        <div className="vf-info-item">
                          <label>Hours Worked</label>
                          <span>{shift.hours_worked} hrs</span>
                        </div>
                        <div className="vf-info-item">
                          <label>City</label>
                          <span>{shift.city || '—'}</span>
                        </div>
                      </div>

                      {shift.screenshot_url ? (
                        <div className="vf-evidence-box">
                          <Eye size={15} color="#6366f1" />
                          <button
                            className="vf-evidence-link"
                            onClick={() => setPreviewUrl(`http://localhost:8002${shift.screenshot_url}`)}
                          >
                            View Attached Screenshot
                          </button>
                        </div>
                      ) : (
                        <div className="vf-evidence-box" style={{ opacity: 0.5 }}>
                          <Image size={15} color="#64748b" />
                          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>No screenshot submitted</span>
                        </div>
                      )}

                      <div className="vf-actions">
                        <button
                          className="vf-btn vf-btn-approve"
                          onClick={() => handleVerify(shift.id, 'verified')}
                          disabled={actionLoading !== null}
                        >
                          <CheckCircle size={15} /> Approve
                        </button>
                        <button
                          className="vf-btn vf-btn-reject"
                          onClick={() => handleVerify(shift.id, 'disputed')}
                          disabled={actionLoading !== null}
                        >
                          <XCircle size={15} /> Reject
                        </button>
                        <button
                          className="vf-btn vf-btn-flag"
                          onClick={() => handleVerify(shift.id, 'unverifiable')}
                          disabled={actionLoading !== null}
                          title="Mark as unreadable/blurry screenshot"
                        >
                          <AlertTriangle size={15} /> Blurry
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Screenshot Preview Overlay */}
      <AnimatePresence>
        {previewUrl && (
          <motion.div
            className="vf-preview-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewUrl(null)}
          >
            <motion.img
              src={previewUrl}
              alt="Evidence Screenshot"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className={`vf-toast vf-toast-${toast.type}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            {toast.type === 'success' && <CheckCircle size={16} />}
            {toast.type === 'danger' && <XCircle size={16} />}
            {toast.type === 'warning' && <AlertTriangle size={16} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VerifierPanel;

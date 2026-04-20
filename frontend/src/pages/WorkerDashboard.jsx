import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download, Plus, AlertCircle, CheckCircle2, Clock, MapPin, Search } from 'lucide-react';
import { format, subDays } from 'date-fns';

const WorkerDashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [cityMedian, setCityMedian] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states for adding shift
  const [showAddModal, setShowAddModal] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [newShift, setNewShift] = useState({
    platform: user?.platform || 'Careem',
    date: format(new Date(), 'yyyy-MM-dd'),
    hours_worked: 8,
    gross_earned: 0,
    platform_deductions: 0,
    net_received: 0,
    city: user?.city || 'Lahore',
    category: 'ride_hailing'
  });

  const fetchData = async () => {
    try {
      const [sumRes, shiftsRes, medianRes] = await Promise.all([
        api.earnings.getSummary(),
        api.earnings.getShifts(),
        api.earnings.getCityMedian()
      ]);
      setSummary(sumRes.data);
      setShifts(shiftsRes.data);
      
      // Filter median to just their city and category
      const relevantMedians = medianRes.data.filter(m => m.city === user?.city);
      setCityMedian(relevantMedians);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleDownloadCertificate = async () => {
    try {
      await api.certificate.download();
    } catch (err) {
      alert('Failed to download certificate: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleAddShift = async (e) => {
    e.preventDefault();
    try {
      // Step 1: Create the shift
      const res = await api.earnings.createShift(newShift);
      const shiftId = res.data.id;

      // Step 2: Upload screenshot if one was selected
      if (screenshotFile && shiftId) {
        setUploadingScreenshot(true);
        const formData = new FormData();
        formData.append('file', screenshotFile);
        await api.earnings.uploadScreenshot(shiftId, formData);
      }

      setShowAddModal(false);
      setScreenshotFile(null);
      fetchData();
    } catch (err) {
      alert('Failed to save shift: ' + (err.response?.data?.detail || err.message));
    } finally {
      setUploadingScreenshot(false);
    }
  };

  // Run Anomaly Detection check
  const [anomalyResult, setAnomalyResult] = useState(null);
  const [checkingAnomaly, setCheckingAnomaly] = useState(false);

  const runAnomalyCheck = async () => {
    setCheckingAnomaly(true);
    try {
      const payload = {
        worker_name: user.full_name,
        earnings_history: shifts.map(s => ({
          platform: s.platform,
          date: s.date,
          hours_worked: s.hours_worked,
          gross_earned: s.gross_earned,
          platform_deductions: s.platform_deductions,
          net_received: s.net_received,
          city: s.city,
          category: s.category
        }))
      };
      const res = await api.anomaly.detect(payload);
      setAnomalyResult(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to run anomaly check: ' + (err.response?.data?.detail || err.message));
    } finally {
      setCheckingAnomaly(false);
    }
  };

  if (loading || !summary) return <div style={{padding: '100px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 600}}>Initializing Secure Dashboard...</div>;

  // Chart Data preparation
  const recentShiftsData = [...shifts].reverse().slice(-14).map(s => ({
    date: format(new Date(s.date), 'MMM dd'),
    net: s.net_received,
    gross: s.gross_earned,
    commissionRate: s.gross_earned > 0 ? (s.platform_deductions / s.gross_earned) * 100 : 0
  }));

  const medianStat = cityMedian.find(c => c.category === 'ride_hailing') || cityMedian[0];

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
        <div>
          <h1 style={{fontSize: '2.4rem', marginBottom: '8px'}}>Financial Snapshot</h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Hello, {user.full_name}. Here is your income and fairness overview.</p>
        </div>
        <div style={{ display: 'flex', gap: '14px' }}>
          <button onClick={() => setShowAddModal(true)} className="btn btn-secondary">
            <Plus size={18} /> Log Shift
          </button>
          <button onClick={handleDownloadCertificate} className="btn btn-primary">
            <Download size={18} /> Income Certificate
          </button>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
        <motion.div initial={{y: 20, opacity: 0}} animate={{y:0, opacity: 1}} transition={{delay: 0.1}} className="glass-card">
          <h3 style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px'}}>Total Net Earnings</h3>
          <h2 style={{color: 'var(--success)', fontSize: '1.8rem'}}>PKR {summary.total_net.toLocaleString()}</h2>
          <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '12px', fontWeight: 600}}>From {summary.shift_count} logged shifts</p>
        </motion.div>
        
        <motion.div initial={{y: 20, opacity: 0}} animate={{y:0, opacity: 1}} transition={{delay: 0.2}} className="glass-card">
          <h3 style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px'}}>Avg. Hourly Rate</h3>
          <h2 style={{fontSize: '1.8rem'}}>PKR {summary.avg_hourly_rate.toLocaleString()}/hr</h2>
          {medianStat && (
            <p style={{fontSize: '0.8rem', color: summary.avg_hourly_rate < medianStat.median_hourly_rate ? 'var(--danger)' : 'var(--success)', marginTop: '12px', fontWeight: 600}}>
              {summary.avg_hourly_rate < medianStat.median_hourly_rate ? '↓ Below City Median' : '↑ Above City Median'}
            </p>
          )}
        </motion.div>

        <motion.div initial={{y: 20, opacity: 0}} animate={{y:0, opacity: 1}} transition={{delay: 0.3}} className="glass-card">
          <h3 style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px'}}>Avg. Fee %</h3>
          <h2 style={{color: 'var(--danger)', fontSize: '1.8rem'}}>{summary.avg_commission_rate.toFixed(1)}%</h2>
          <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '12px', fontWeight: 600}}>Platform deductions</p>
        </motion.div>

        <motion.div initial={{y: 20, opacity: 0}} animate={{y:0, opacity: 1}} transition={{delay: 0.4}} className="glass-card">
          <h3 style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px'}}>Verified Logs</h3>
          <h2 style={{color: 'var(--info)', fontSize: '1.8rem'}}>{summary.verified_count} / {summary.shift_count}</h2>
          <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '12px', fontWeight: 600}}>Confirmed by advocates</p>
        </motion.div>
      </div>

      {/* Main Charts Area */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '40px' }}>
        
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h3 style={{marginBottom: '24px', fontSize: '1.2rem'}}>Earnings Trend</h3>
          <div style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recentShiftsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--text-muted)" tick={{fontSize: 12, fontWeight: 600}} />
                <YAxis yAxisId="left" stroke="var(--text-muted)" tick={{fontSize: 12, fontWeight: 600}} />
                <YAxis yAxisId="right" orientation="right" stroke="var(--danger)" tick={{fontSize: 12, fontWeight: 600}} unit="%" />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'white', border: '1px solid var(--border-light)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}
                  itemStyle={{ fontWeight: 700, color: 'var(--text-primary)' }}
                  labelStyle={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}
                />
                <Legend iconType="circle" />
                <Bar yAxisId="left" dataKey="net" name="Net (PKR)" fill="var(--accent-primary)" radius={[6,6,0,0]} />
                <Line yAxisId="right" type="monotone" dataKey="commissionRate" name="Fee %" stroke="var(--danger)" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: 'white'}} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px'}}>
            <AlertCircle size={20} color="var(--accent-primary)" />
            <h3 style={{fontSize: '1.2rem'}}>AI Fairness Check</h3>
          </div>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5, fontWeight: 500 }}>
            Analyze your recent shifts using our 3-Layer engine to detect unusual platform behavior.
          </p>
          
          {!anomalyResult ? (
            <button 
              onClick={runAnomalyCheck} 
              disabled={checkingAnomaly || shifts.length < 3}
              className="btn btn-primary" 
              style={{ marginTop: 'auto', padding: '18px' }}
            >
              {checkingAnomaly ? 'Detecting...' : 'Verify Fairness Now'}
            </button>
          ) : (
            <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: '14px', overflowY: 'auto', flex: 1, border: '1px solid var(--border-light)' }}>
              <p style={{ fontSize: '0.9rem', marginBottom: '20px', fontWeight: 700, lineHeight: 1.4, color: anomalyResult.anomalies_found > 0 ? 'var(--danger)' : 'var(--success)' }}>
                {anomalyResult.summary}
              </p>
              {anomalyResult.anomalies.map((a, i) => (
                <div key={i} style={{ borderLeft: `4px solid var(--${a.severity === 'high' ? 'danger' : 'warning'})`, padding: '12px 16px', background: '#fff', borderRadius: '0 10px 10px 0', marginBottom: '12px', fontSize: '0.85rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <strong style={{ display: 'block', marginBottom: '6px', color: 'var(--text-primary)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>{a.metric} Flag</strong>
                  <span style={{color: 'var(--text-secondary)', fontWeight: 500}}>{a.explanation}</span>
                </div>
              ))}
            </div>
          )}
          {shifts.length < 3 && !anomalyResult && (
            <p style={{ fontSize: '0.8rem', color: 'var(--danger)', marginTop: '12px', textAlign: 'center', fontWeight: 600 }}>Need at least 3 shifts for AI scan.</p>
          )}
        </div>

      </div>

      {/* Shifts Table */}
      <h3 style={{marginBottom: '20px', fontSize: '1.2rem', paddingLeft: '4px'}}>Detailed Earnings Log</h3>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Platform</th>
              <th>Net Earned</th>
              <th>Commission</th>
              <th>Hourly Rate</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {[...shifts].slice(0, 15).map((s, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 600 }}>{format(new Date(s.date), 'MMM dd, yyyy')}</td>
                <td>{s.platform}</td>
                <td style={{ fontWeight: 800, color: 'var(--text-primary)' }}>PKR {s.net_received.toLocaleString()}</td>
                <td style={{ fontWeight: 600 }}>
                  <span style={{color: (s.platform_deductions / s.gross_earned) > 0.3 ? 'var(--danger)' : 'var(--text-primary)'}}>
                    {s.gross_earned > 0 ? ((s.platform_deductions / s.gross_earned) * 100).toFixed(1) : 0}% 
                  </span>
                  <span style={{color:'var(--text-muted)', fontSize:'0.8rem', marginLeft:'8px' }}>(-{s.platform_deductions})</span>
                </td>
                <td style={{ fontWeight: 600 }}>{s.hours_worked > 0 ? `PKR ${(s.net_received / s.hours_worked).toFixed(0)}/hr` : '-'}</td>
                <td>
                  <span className={`badge badge-${s.verification_status}`}>
                    {s.verification_status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals remain same but use improved form styles from index.css */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <motion.div initial={{scale: 0.9, opacity: 0}} animate={{scale: 1, opacity: 1}} className="glass-panel" style={{ width: '560px', maxWidth: '90%', padding: '40px', background: '#fff' }}>
            <h2 style={{ marginBottom: '32px', fontSize: '1.8rem' }}>Log New Shift</h2>
            <form onSubmit={handleAddShift}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Platform</label>
                  <select className="form-control" value={newShift.platform} onChange={e => setNewShift({...newShift, platform: e.target.value})}>
                    <option>Careem</option>
                    <option>Bykea</option>
                    <option>Foodpanda</option>
                    <option>InDrive</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-control" value={newShift.date} onChange={e => setNewShift({...newShift, date: e.target.value})} required/>
                </div>
                <div className="form-group">
                  <label className="form-label">Hours Worked</label>
                  <input type="number" step="0.5" className="form-control" value={newShift.hours_worked} onChange={e => setNewShift({...newShift, hours_worked: parseFloat(e.target.value)})} required/>
                </div>
                <div className="form-group">
                  <label className="form-label">Gross (PKR)</label>
                  <input type="number" className="form-control" value={newShift.gross_earned} onChange={e => setNewShift({...newShift, gross_earned: parseFloat(e.target.value)})} required/>
                </div>
                <div className="form-group">
                  <label className="form-label">Deductions (PKR)</label>
                  <input type="number" className="form-control" value={newShift.platform_deductions} onChange={e => setNewShift({...newShift, platform_deductions: parseFloat(e.target.value)})} required/>
                </div>
                <div className="form-group">
                  <label className="form-label">Net Received (PKR)</label>
                  <input type="number" className="form-control" value={newShift.net_received} onChange={e => setNewShift({...newShift, net_received: parseFloat(e.target.value)})} required/>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '10px' }}>
                <label className="form-label">Proof Screenshot</label>
                <div style={{
                  border: '2px dashed var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: '24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: screenshotFile ? 'rgba(16,185,129,0.03)' : 'var(--bg-secondary)',
                  transition: 'all 0.2s',
                }}
                  onClick={() => document.getElementById('screenshot-input').click()}
                >
                  {screenshotFile ? (
                    <div style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>
                      ✅ {screenshotFile.name}
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
                      Click to upload shift screenshot
                    </div>
                  )}
                </div>
                <input
                  id="screenshot-input"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => setScreenshotFile(e.target.files[0] || null)}
                />
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                <button type="button" onClick={() => { setShowAddModal(false); setScreenshotFile(null); }} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={uploadingScreenshot}>
                  {uploadingScreenshot ? 'Saving...' : 'Confirm Log'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default WorkerDashboard;

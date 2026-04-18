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

  const handleDownloadCertificate = () => {
    api.certificate.download();
  };

  const handleAddShift = async (e) => {
    e.preventDefault();
    try {
      await api.earnings.createShift(newShift);
      setShowAddModal(false);
      fetchData(); // Refresh data
    } catch (err) {
      alert("Failed to add shift");
    }
  };

  // Run Anomaly Detection check
  const [anomalyResult, setAnomalyResult] = useState(null);
  const [checkingAnomaly, setCheckingAnomaly] = useState(false);

  const runAnomalyCheck = async () => {
    setCheckingAnomaly(true);
    try {
      // Send the history directly to Anomaly API as per judge rules
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
    } finally {
      setCheckingAnomaly(false);
    }
  };

  if (loading || !summary) return <div style={{padding: '50px'}}>Loading dashboard...</div>;

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1>My Earnings Overview</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome back, {user.full_name}. Here is your financial snapshot.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setShowAddModal(true)} className="btn btn-secondary">
            <Plus size={18} /> Log Shift
          </button>
          <button onClick={handleDownloadCertificate} className="btn btn-primary">
            <Download size={18} /> Get Income Certificate
          </button>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <motion.div initial={{y: 20, opacity: 0}} animate={{y:0, opacity: 1}} transition={{delay: 0.1}} className="glass-card">
          <h3 style={{fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase'}}>Total Net Earnings</h3>
          <h2 style={{color: 'var(--success)'}}>PKR {summary.total_net.toLocaleString()}</h2>
          <p style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px'}}>From {summary.shift_count} logged shifts</p>
        </motion.div>
        
        <motion.div initial={{y: 20, opacity: 0}} animate={{y:0, opacity: 1}} transition={{delay: 0.2}} className="glass-card">
          <h3 style={{fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase'}}>My Avg. Hourly Rate</h3>
          <h2>PKR {summary.avg_hourly_rate.toLocaleString()}/hr</h2>
          {medianStat && (
            <p style={{fontSize: '0.8rem', color: summary.avg_hourly_rate < medianStat.median_hourly_rate ? 'var(--warning)' : 'var(--success)', marginTop: '8px'}}>
              City Median: PKR {medianStat.median_hourly_rate}/hr
            </p>
          )}
        </motion.div>

        <motion.div initial={{y: 20, opacity: 0}} animate={{y:0, opacity: 1}} transition={{delay: 0.3}} className="glass-card">
          <h3 style={{fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase'}}>Avg. Commission Paid</h3>
          <h2 style={{color: 'var(--danger)'}}>{summary.avg_commission_rate.toFixed(1)}%</h2>
          <p style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px'}}>Of total gross earnings</p>
        </motion.div>

        <motion.div initial={{y: 20, opacity: 0}} animate={{y:0, opacity: 1}} transition={{delay: 0.4}} className="glass-card">
          <h3 style={{fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase'}}>Verification Status</h3>
          <h2 style={{color: 'var(--info)'}}>{summary.verified_count} / {summary.shift_count}</h2>
          <p style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px'}}>Shifts manually verified</p>
        </motion.div>
      </div>

      {/* Main Charts Area */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
        
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{marginBottom: '20px'}}>Recent Earnings Trend</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recentShiftsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-strong)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--text-muted)" tick={{fontSize: 12}} />
                <YAxis yAxisId="left" stroke="var(--text-muted)" tick={{fontSize: 12}} />
                <YAxis yAxisId="right" orientation="right" stroke="var(--danger)" tick={{fontSize: 12}} unit="%" />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-strong)', borderRadius: '8px' }}
                  itemStyle={{color: '#fff'}}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="net" name="Net Received (PKR)" fill="var(--accent-primary)" radius={[4,4,0,0]} />
                <Line yAxisId="right" type="monotone" dataKey="commissionRate" name="Commission %" stroke="var(--danger)" strokeWidth={2} dot={{r: 4}} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{marginBottom: '20px'}}>FairGig AI Anomaly Check</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Run your recent shifts through our statistical anomaly detection engine to check if platforms are treating you fairly.
          </p>
          
          {!anomalyResult ? (
            <button 
              onClick={runAnomalyCheck} 
              disabled={checkingAnomaly || shifts.length < 3}
              className="btn btn-primary" 
              style={{ marginTop: 'auto', padding: '16px' }}
            >
              {checkingAnomaly ? 'Analyzing Data...' : 'Run Analysis Now'}
            </button>
          ) : (
            <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', overflowY: 'auto', flex: 1 }}>
              <p style={{ fontSize: '0.9rem', marginBottom: '16px', color: anomalyResult.anomalies_found > 0 ? 'var(--warning)' : 'var(--success)' }}>
                {anomalyResult.summary}
              </p>
              {anomalyResult.anomalies.map((a, i) => (
                <div key={i} style={{ borderLeft: `3px solid var(--${a.severity === 'high' ? 'danger' : 'warning'})`, padding: '8px 12px', background: 'rgba(0,0,0,0.2)', marginBottom: '8px', fontSize: '0.85rem' }}>
                  <strong style={{ display: 'block', marginBottom: '4px' }}>{a.metric} Flag</strong>
                  {a.explanation}
                </div>
              ))}
            </div>
          )}
          {shifts.length < 3 && !anomalyResult && (
            <p style={{ fontSize: '0.8rem', color: 'var(--danger)', marginTop: '8px', textAlign: 'center' }}>Need at least 3 logged shifts to run check.</p>
          )}
        </div>

      </div>

      {/* Shifts Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{marginBottom: '20px'}}>Detailed Shift Log</h3>
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
              {shifts.slice(0, 10).map((s, idx) => (
                <tr key={idx}>
                  <td>{format(new Date(s.date), 'MMM dd, yyyy')}</td>
                  <td>{s.platform}</td>
                  <td style={{ fontWeight: 600 }}>PKR {s.net_received.toLocaleString()}</td>
                  <td>
                    {s.gross_earned > 0 ? ((s.platform_deductions / s.gross_earned) * 100).toFixed(1) : 0}% 
                    <span style={{color:'var(--text-muted)', fontSize:'0.8rem', display:'block'}}>(-{s.platform_deductions})</span>
                  </td>
                  <td>{s.hours_worked > 0 ? `PKR ${(s.net_received / s.hours_worked).toFixed(0)}/hr` : '-'}</td>
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
      </div>

      {/* Add Shift Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ width: '500px', maxWidth: '90%' }}>
            <h2 style={{ marginBottom: '24px' }}>Log New Shift</h2>
            <form onSubmit={handleAddShift}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group mb-0">
                  <label className="form-label">Platform</label>
                  <select className="form-control" value={newShift.platform} onChange={e => setNewShift({...newShift, platform: e.target.value})}>
                    <option>Careem</option>
                    <option>Bykea</option>
                    <option>Foodpanda</option>
                    <option>InDrive</option>
                  </select>
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-control" value={newShift.date} onChange={e => setNewShift({...newShift, date: e.target.value})} required/>
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Hours Worked</label>
                  <input type="number" step="0.5" className="form-control" value={newShift.hours_worked} onChange={e => setNewShift({...newShift, hours_worked: parseFloat(e.target.value)})} required/>
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Gross Earned (PKR)</label>
                  <input type="number" className="form-control" value={newShift.gross_earned} onChange={e => setNewShift({...newShift, gross_earned: parseFloat(e.target.value)})} required/>
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Deductions (PKR)</label>
                  <input type="number" className="form-control" value={newShift.platform_deductions} onChange={e => setNewShift({...newShift, platform_deductions: parseFloat(e.target.value)})} required/>
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Net Received (PKR)</label>
                  <input type="number" className="form-control" value={newShift.net_received} onChange={e => setNewShift({...newShift, net_received: parseFloat(e.target.value)})} required/>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Shift</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerDashboard;

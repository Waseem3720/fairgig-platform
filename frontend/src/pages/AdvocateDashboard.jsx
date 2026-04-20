import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { ShieldAlert, Users, TrendingDown, ArrowUpRight, CheckCircle2 } from 'lucide-react';

const AdvocateDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.analytics.dashboard();
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !data) return <div style={{ padding: '100px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 600 }}>Analyzing Systemic Data...</div>;

  // Format commission trends for Recharts
  const trendsByPlatform = {};
  data.commission_trends.forEach(t => {
    if (!trendsByPlatform[t.month]) trendsByPlatform[t.month] = { month: t.month };
    trendsByPlatform[t.month][t.platform] = t.avg_commission_rate;
  });
  const trendsArray = Object.values(trendsByPlatform).sort((a, b) => a.month.localeCompare(b.month));

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', marginBottom: '8px' }}>Observation Panel</h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Systemic monitoring of platform practices and worker vulnerability.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
        <div className="glass-card">
          <h3 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Monitored Workers</h3>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} color="var(--info)" /> {data.total_workers.toLocaleString()}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '12px', fontWeight: 600 }}>Unique gig workers active</p>
        </div>
        <div className="glass-card">
          <h3 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Vulnerability Flags</h3>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)' }}>
            <ShieldAlert size={20} /> {data.vulnerable_workers.length}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '12px', fontWeight: 600 }}>Workers w/ income drop &gt;20%</p>
        </div>
        <div className="glass-card">
          <h3 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Avg Platform Fee</h3>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--warning)' }}>
            <TrendingDown size={20} /> {data.avg_commission_rate.toFixed(1)}%
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '12px', fontWeight: 600 }}>Market average deduction</p>
        </div>
        <div className="glass-card">
          <h3 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Shift Logs</h3>
          <h2 style={{ fontSize: '1.8rem' }}>{data.total_shifts.toLocaleString()}</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '12px', fontWeight: 600 }}>Across {data.total_platforms} platforms</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>

        <div className="glass-panel" style={{ padding: '32px' }}>
          <h3 style={{ marginBottom: '24px', fontSize: '1.2rem' }}>Commission Trends</h3>
          <div style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendsArray}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--text-muted)" tick={{ fontSize: 12, fontWeight: 600 }} />
                <YAxis stroke="var(--text-muted)" tick={{ fontSize: 12, fontWeight: 600 }} unit="%" domain={['auto', 'auto']} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid var(--border-light)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}
                  itemStyle={{ color: 'var(--text-primary)', fontWeight: 700 }}
                  labelStyle={{ color: 'var(--text-primary)', fontWeight: 800, marginBottom: '4px' }}
                />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="Careem" stroke="#0ea5e9" strokeWidth={3} dot={{r: 4}} />
                <Line type="monotone" dataKey="Foodpanda" stroke="#ec4899" strokeWidth={3} dot={{r: 4}} />
                <Line type="monotone" dataKey="Bykea" stroke="#10b981" strokeWidth={3} dot={{r: 4}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', fontSize: '1.2rem' }}>
              <ShieldAlert size={20} /> Vulnerability Watchlist
            </h3>
          </div>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '24px', fontWeight: 500, lineHeight: 1.5 }}>
            Workers experiencing severe &gt;20% month-over-month income drops.
          </p>
          <div style={{ overflowY: 'auto', maxHeight: '350px', paddingRight: '8px' }}>
            {data.vulnerable_workers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <CheckCircle2 size={40} color="var(--success)" style={{ opacity: 0.3, marginBottom: '12px' }} />
                <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>No severe drops detected.</p>
              </div>
            ) : (
              data.vulnerable_workers.map((v, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'var(--bg-secondary)', padding: '16px 20px', borderRadius: '12px', marginBottom: '12px',
                  borderLeft: `4px solid var(--danger)`,
                  border: '1px solid var(--border-light)',
                  borderLeftWidth: '4px'
                }}>
                  <div>
                    <span style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '0.95rem' }}>Worker #{v.worker_id}</span>
                    <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginTop: '4px' }}>{v.platform} • {v.city}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: 'var(--danger)', fontWeight: '900', fontSize: '1.1rem' }}>-{v.drop_percentage.toFixed(1)}%</span>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>{v.curr_month}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      <div className="glass-panel" style={{ padding: '32px' }}>
        <h3 style={{ marginBottom: '24px', fontSize: '1.2rem' }}>Income Distribution by Zone</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>City</th>
                <th>Category</th>
                <th>Workers</th>
                <th>Avg Net/Day</th>
                <th>Median Net/Day</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.income_distributions.map((d, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 800 }}>{d.city}</td>
                  <td style={{ textTransform: 'capitalize', fontWeight: 600 }}>{d.category.replace('_', ' ')}</td>
                  <td style={{ fontWeight: 600 }}>{d.worker_count} users</td>
                  <td style={{ fontWeight: 600 }}>PKR {d.avg_net_daily.toLocaleString()}</td>
                  <td style={{ color: d.median_net_daily < d.avg_net_daily * 0.8 ? 'var(--danger)' : 'var(--success)', fontWeight: 800 }}>
                    PKR {d.median_net_daily.toLocaleString()}
                  </td>
                  <td>
                    <span className={`badge ${d.median_net_daily < d.avg_net_daily * 0.8 ? 'badge-danger' : 'badge-verified'}`}>
                      {d.median_net_daily < d.avg_net_daily * 0.8 ? 'UNFAIR' : 'STABLE'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdvocateDashboard;

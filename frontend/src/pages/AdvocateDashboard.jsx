import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { ShieldAlert, Users, TrendingDown, ArrowUpRight } from 'lucide-react';

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

  if (loading || !data) return <div style={{padding: '50px'}}>Loading Advocate Panel...</div>;

  // Format commission trends for Recharts
  const trendsByPlatform = {};
  data.commission_trends.forEach(t => {
    if (!trendsByPlatform[t.month]) trendsByPlatform[t.month] = { month: t.month };
    trendsByPlatform[t.month][t.platform] = t.avg_commission_rate;
  });
  const trendsArray = Object.values(trendsByPlatform).sort((a, b) => a.month.localeCompare(b.month));

  return (
    <div className="page-container">
      <div style={{ marginBottom: '32px' }}>
        <h1>Advocate Observation Panel</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Systemic monitoring of platform practices and worker vulnerability.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div className="glass-card">
          <h3 style={{fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase'}}>Total Monitored Workers</h3>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={24} color="var(--info)" /> {data.total_workers.toLocaleString()}
          </h2>
          <p style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px'}}>Unique gig workers logging shifts</p>
        </div>
        <div className="glass-card">
          <h3 style={{fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase'}}>Vulnerability Flags</h3>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)' }}>
            <ShieldAlert size={24} /> {data.vulnerable_workers.length}
          </h2>
          <p style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px'}}>Workers w/ &gt;20% income drop</p>
        </div>
        <div className="glass-card">
          <h3 style={{fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase'}}>Avg Platform Commission</h3>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--warning)' }}>
            <TrendingDown size={24} /> {data.avg_commission_rate.toFixed(1)}%
          </h2>
          <p style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px'}}>Platform average deduction</p>
        </div>
        <div className="glass-card">
          <h3 style={{fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase'}}>Total Monitored Shifts</h3>
          <h2>{data.total_shifts.toLocaleString()}</h2>
          <p style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px'}}>Logged across {data.total_platforms} platforms</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{marginBottom: '20px'}}>Commission Rates Over Time</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendsArray}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-strong)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--text-muted)" tick={{fontSize: 12}} />
                <YAxis stroke="var(--text-muted)" tick={{fontSize: 12}} unit="%" domain={['auto', 'auto']} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-strong)', borderRadius: '8px' }}
                  itemStyle={{color: '#fff'}}
                />
                <Legend />
                <Line type="monotone" dataKey="Careem" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Foodpanda" stroke="#ec4899" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Bykea" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)' }}>
              <ShieldAlert size={20} /> Vulnerability Watchlist
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Workers experiencing severe (>20%) month-over-month income drops.
          </p>
          <div style={{ overflowY: 'auto', maxHeight: '250px', paddingRight: '8px' }}>
            {data.vulnerable_workers.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>No severe drops detected.</p>
            ) : (
              data.vulnerable_workers.map((v, i) => (
                <div key={i} style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: '8px', marginBottom: '8px',
                  borderLeft: `2px solid var(--danger)`
                }}>
                  <div>
                    <span style={{ fontWeight: '600' }}>Worker ID: {v.worker_id}</span>
                    <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{v.platform} • {v.city}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>-{v.drop_percentage.toFixed(1)}%</span>
                    <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{v.prev_month} to {v.curr_month}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{marginBottom: '20px'}}>Income Distribution by Zone</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>City</th>
                <th>Category</th>
                <th>Monitored Workers</th>
                <th>Avg Net/Day</th>
                <th>Median Net/Day</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.income_distributions.map((d, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 500 }}>{d.city}</td>
                  <td style={{ textTransform: 'capitalize' }}>{d.category.replace('_', ' ')}</td>
                  <td>{d.worker_count}</td>
                  <td>PKR {d.avg_net_daily.toLocaleString()}</td>
                  <td style={{ color: d.median_net_daily < d.avg_net_daily * 0.8 ? 'var(--danger)' : 'inherit' }}>
                    PKR {d.median_net_daily.toLocaleString()}
                  </td>
                  <td>
                    <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>View Detials <ArrowUpRight size={14}/></button>
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

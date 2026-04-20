require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { authenticateToken } = require('./auth');

const app = express();
const PORT = process.env.PORT || 8006;
const EARNINGS_SERVICE_URL = process.env.EARNINGS_SERVICE_URL || 'http://localhost:8002';
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:8001';

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ service: 'certificate', status: 'running', version: '1.0.0' });
});

app.get('/api/certificate/generate', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    // 1. Get user profile
    const profileRes = await axios.get(`${AUTH_SERVICE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${req.token}` }
    });
    const user = profileRes.data;

    // 2. Fetch all verified shifts to aggregate manually
    let shiftsUrl = `${EARNINGS_SERVICE_URL}/api/earnings/shifts?verification_status=verified&limit=500`;
    if (start_date) shiftsUrl += `&start_date=${start_date}`;
    if (end_date) shiftsUrl += `&end_date=${end_date}`;

    const shiftsRes = await axios.get(shiftsUrl, {
      headers: { Authorization: `Bearer ${req.token}` }
    });
    const shifts = shiftsRes.data;

    // 3. Compute metrics for verified shifts only
    let total_gross = 0;
    let total_deductions = 0;
    let total_net = 0;
    let total_hours = 0;

    shifts.forEach(s => {
      total_gross += s.gross_earned || 0;
      total_deductions += s.platform_deductions || 0;
      total_net += s.net_received || 0;
      total_hours += s.hours_worked || 0;
    });

    const shift_count = shifts.length;
    const avg_hourly_rate = total_hours > 0 ? (total_net / total_hours) : 0;

    // 4. Render HTML
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>FairGig Income Certificate</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          color: #333;
          margin: 0;
          padding: 40px;
          background-color: #f7f9fc;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background-color: #fff;
          padding: 50px;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #2ecc71;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          margin: 0;
          color: #2c3e50;
        }
        .header p {
          color: #7f8c8d;
          margin-top: 5px;
        }
        .worker-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 40px;
        }
        .info-box {
          background-color: #f8f9fc;
          padding: 15px;
          border-radius: 6px;
          border: 1px solid #e1e8ed;
        }
        .info-box h3 {
          margin-top: 0;
          font-size: 14px;
          color: #95a5a6;
          text-transform: uppercase;
        }
        .info-box p {
          margin: 5px 0 0 0;
          font-size: 16px;
          font-weight: 600;
        }
        .earnings-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 40px;
        }
        .earnings-table th, .earnings-table td {
          padding: 15px;
          text-align: left;
          border-bottom: 1px solid #e1e8ed;
        }
        .earnings-table th {
          background-color: #f8f9fc;
          color: #2c3e50;
          font-weight: 600;
        }
        .earnings-table td.amount {
          text-align: right;
          font-family: monospace;
          font-size: 16px;
        }
        .total-row {
          font-weight: bold;
          background-color: #e8f6f3;
        }
        .footer {
          text-align: center;
          margin-top: 50px;
          padding-top: 20px;
          border-top: 1px solid #e1e8ed;
          color: #7f8c8d;
          font-size: 12px;
        }
        .verified-badge {
          display: inline-block;
          background-color: #2ecc71;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          vertical-align: middle;
          margin-left: 10px;
        }
        @media print {
          body { background-color: white; padding: 0; }
          .container { box-shadow: none; padding: 0; }
          .verified-badge { border: 1px solid #2ecc71; color: #2ecc71; background: none; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>FairGig Income Certificate</h1>
          <p>Verified Gig Economy Earnings Report</p>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          <p>Period: ${start_date || 'All time'} to ${end_date || 'Present'}</p>
        </div>

        <div class="worker-info">
          <div class="info-box">
            <h3>Worker Name</h3>
            <p>${user.full_name}</p>
          </div>
          <div class="info-box">
            <h3>Primary Platform</h3>
            <p>${user.platform || 'Multiple'}</p>
          </div>
          <div class="info-box">
            <h3>Contact</h3>
            <p>${user.email}</p>
          </div>
          <div class="info-box">
            <h3>Verification Status</h3>
            <p>Verified <span class="verified-badge">✓ Authenticated</span></p>
          </div>
        </div>

        <table class="earnings-table">
          <thead>
            <tr>
              <th>Description</th>
              <th style="text-align: right;">Amount (PKR)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Total Gross Earnings</td>
              <td class="amount">${total_gross.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
            </tr>
            <tr>
              <td>Platform Deductions (Commissions)</td>
              <td class="amount">-${total_deductions.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
            </tr>
            <tr class="total-row">
              <td>Net Received Income</td>
              <td class="amount">${total_net.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="info-box" style="margin-bottom: 20px;">
          <h3>Work Statistics (Verified Shifts Only)</h3>
          <p>Total Confirmed Shifts Logged: ${shift_count}</p>
          <p>Total Verified Hours Worked: ${total_hours}</p>
          <p>Average Hourly Rate: PKR ${avg_hourly_rate.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
        </div>

        <div class="footer">
          <p>This document is generated by FairGig, a platform for gig worker income verification and rights advocacy.</p>
          <p>The numbers reflected above are based on data provided by the worker and ${shift_count} shifts have been manually verified by FairGig labor advocates.</p>
          <p>Certificate Reference ID: FG-CERT-${Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
        </div>
      </div>
      <script>
        // Automatically open print dialog when opened
        // window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
    `;

    res.header('Content-Type', 'text/html');
    res.send(html);

  } catch (error) {
    console.error("Error generating certificate:", error.message);
    res.status(500).json({ detail: 'Failed to generate certificate' });
  }
});

app.listen(PORT, () => {
  console.log(`FairGig Certificate Service running on http://localhost:${PORT}`);
});

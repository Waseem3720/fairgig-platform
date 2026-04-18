const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 8004;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ service: 'grievance', status: 'running', version: '1.0.0' });
});

// Mount routes
app.use('/api/grievances', routes);

// Start server
app.listen(PORT, () => {
  console.log(`FairGig Grievance Service running on http://localhost:${PORT}`);
  console.log(`API docs: This is a REST API. See README.md for endpoints.`);
});

require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }));
app.use(express.json());

// Routes
app.use('/api/ai', require('./routes/ai'));
app.use('/api/data', require('./routes/data'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'OCEAN OS Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    apiKey: process.env.ANTHROPIC_API_KEY ? 'CONFIGURED' : 'MISSING',
  });
});

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║   🌊  OCEAN OS — BACKEND ONLINE         ║
  ║   Port  : ${PORT}                           ║
  ║   Status: OPERATIONAL                   ║
  ║   API   : ${process.env.ANTHROPIC_API_KEY ? '✓ KEY LOADED' : '✗ NO API KEY'}              ║
  ╚══════════════════════════════════════════╝
  `);
});

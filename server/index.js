import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { verifyRoute } from './routes/verify.js';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.API_PORT || '3001');

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

import historyRouter from './routes/history.js';
import { auditUrlReputation } from './services/urlReputation.js';
import { analyzeMediaForensics } from './services/mediaForensics.js';

// ── Routes ──────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  const tavily = !!process.env.TAVILY_API_KEY && !process.env.TAVILY_API_KEY.includes('YOUR_KEY');
  const gemini = !!process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('YOUR_KEY');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: { tavily, gemini },
    ready: gemini,
  });
});

// Main RAV pipeline endpoint — Server-Sent Events streaming
app.post('/api/verify', verifyRoute);

// Verification History API
app.use('/api/history', historyRouter);

// Standalone URL Reputation Audit API
app.post('/api/url-audit', (req, res) => {
  const { url } = req.body || {};
  if (!url) return res.status(400).json({ error: 'URL parameter required' });
  res.json(auditUrlReputation(url));
});

// Standalone Media Forensics API
app.post('/api/forensics', async (req, res) => {
  const { type = 'image', fileMetadata, fileData, content } = req.body || {};
  const result = await analyzeMediaForensics(type, fileMetadata, content || '', '', null, fileData || null);
  res.json(result);
});

// ── Error Handlers ──────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, _req, res, _next) => {
  console.error('[TruthLens API Error]', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ── Start ───────────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  const tavily = !!process.env.TAVILY_API_KEY && !process.env.TAVILY_API_KEY.includes('YOUR_KEY');
  const gemini = !!process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('YOUR_KEY');

  console.log('\n  🛡️  TruthLens RAV API Server');
  console.log(`  ➜  Listening: http://localhost:${PORT}`);
  console.log(`  ➜  Tavily API: ${tavily ? '✅  Configured' : '⚠️  Missing — add TAVILY_API_KEY to .env'}`);
  console.log(`  ➜  Gemini API: ${gemini ? '✅  Configured' : '⚠️  Missing — add GEMINI_API_KEY to .env'}`);
  if (!tavily || !gemini) {
    console.log('\n  ℹ️  Copy .env.example → .env and add your keys.\n');
  } else {
    console.log('\n  ✅  All services ready — live RAV pipeline active.\n');
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n  ❌  Port ${PORT} is already in use by another process.`);
    console.error(`  ➜  Please stop the process using port ${PORT} or change API_PORT in .env\n`);
  } else {
    console.error('\n  ❌  Server error:', err.message);
  }
  process.exit(1);
});

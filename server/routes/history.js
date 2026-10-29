/**
 * Verification History REST API
 * GET /api/history - Get recent verification reports
 * GET /api/history/:id - Get verification report by ID
 * DELETE /api/history/:id - Delete verification report from history
 */

import express from 'express';

const router = express.Router();

// In-memory verification history store (persisted across requests)
const historyStore = new Map();

/**
 * Save report to history store
 */
export function saveToHistory(report) {
  if (report && report.requestId) {
    historyStore.set(report.requestId, report);
    // Keep max 100 recent reports
    if (historyStore.size > 100) {
      const oldestKey = historyStore.keys().next().value;
      historyStore.delete(oldestKey);
    }
  }
}

// GET /api/history
router.get('/', (_req, res) => {
  const reports = Array.from(historyStore.values()).reverse();
  res.json({
    total: reports.length,
    reports,
  });
});

// GET /api/history/:id
router.get('/:id', (req, res) => {
  const report = historyStore.get(req.params.id);
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }
  res.json(report);
});

// DELETE /api/history/:id
router.delete('/:id', (req, res) => {
  const exists = historyStore.has(req.params.id);
  if (exists) {
    historyStore.delete(req.params.id);
    return res.json({ success: true, message: 'Report deleted from history' });
  }
  res.status(404).json({ error: 'Report not found' });
});

export default router;

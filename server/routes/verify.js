/**
 * TruthLens Verification SSE Route & MutAgent Orchestrator Handler
 * POST /api/verify — Streams live progress events as MutAgent agents execute.
 */

import { runMutAgentVerificationPipeline } from '../services/agentOrchestrator.js';
import { extractImageVisualContext } from '../services/geminiAnalysis.js';
import { saveToHistory } from './history.js';
import { auditUrlReputation } from '../services/urlReputation.js';
import { analyzeMediaForensics } from '../services/mediaForensics.js';

function ts() {
  return new Date().toLocaleTimeString('en-US', { hour12: false });
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function generateUniqueRequestId() {
  const crypto = globalThis.crypto;
  const uuid = crypto && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : null;
  return uuid ? `vt-${uuid}` : `vt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function verifyRoute(req, res) {
  // Setup SSE Headers with mandatory non-caching
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const requestId = generateUniqueRequestId();
  const startTime = Date.now();

  const send = (data) => {
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  };

  const sendProgress = (stage, name, desc, logs = []) =>
    send({ type: 'progress', stage, name, desc, logs });

  const sendError = (message) => {
    send({ type: 'error', error: message });
    if (!res.writableEnded) res.end();
  };

  try {
    const { type: inputType = 'text', content = '', presetId, fileMetadata, fileData } = req.body;

    if (!content || !content.trim()) {
      return sendError('No content provided for verification.');
    }

    sendProgress(0,
      'MutAgent Initialization',
      'Orchestrating AI Verification Agent Pipeline...',
      [
        `[${ts()}] Unique Request ID: ${requestId}`,
        `  └─ Modality: ${inputType} · Input Length: ${content.length} chars`,
      ]
    );

    let visualContext = null;
    if (fileData && (inputType === 'image' || fileData.startsWith('data:image'))) {
      sendProgress(0,
        'Gemini Vision Pre-pass',
        'Extracting visual description, text OCR, and image search keywords...',
        [`[${ts()}] Stage 1/6: Gemini Vision Pre-pass`]
      );
      visualContext = await extractImageVisualContext(fileData, fileMetadata);
    }

    // Execute through MutAgent agent pipeline
    const { report } = await runMutAgentVerificationPipeline({
      requestId,
      startTime,
      content,
      inputType,
      fileMetadata,
      fileData,
      presetId,
      visualContext
    }, ({ stage, stepName, details }) => {
      sendProgress(stage, stepName, details, [
        `[${ts()}] Stage ${stage + 1}/6: ${stepName}`,
        `  └─ ${details}`
      ]);
    });

    if (inputType === 'url' || content.startsWith('http://') || content.startsWith('https://')) {
      report.urlMetrics = auditUrlReputation(content);
    }

    if (['image', 'video', 'audio', 'document'].includes(inputType)) {
      sendProgress(6, 'MediaForensicsAgent', 'Running pixel-level ELA, EXIF parsing, and AI signature scan...', [
        `[${ts()}] Stage 7/7: MediaForensicsAgent`,
        '  └─ Real ELA via sharp · EXIF via exifr · Binary AI watermark scan',
      ]);
      report.forensics = await analyzeMediaForensics(inputType, fileMetadata, content, report.title, report, fileData);
    }

    saveToHistory(report);
    await delay(150);

    send({ type: 'complete', report });
    res.end();

  } catch (err) {
    console.error('[Verify Route] Pipeline error:', err.message);
    sendError(err.message || 'Verification pipeline encountered an unexpected error.');
  }
}

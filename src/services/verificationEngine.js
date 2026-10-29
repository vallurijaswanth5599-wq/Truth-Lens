/**
 * TruthLens Verification Engine — RAV (Retrieval-Augmented Verification) Client
 *
 * Streams the 6-stage pipeline from the Express API server via Server-Sent Events.
 * Each stage sends real progress updates from actual Tavily Search + Gemini reasoning.
 *
 * Backend API:  POST /api/verify  (proxied via Vite → http://localhost:3001)
 */

/**
 * Run the full RAV pipeline for a user's submission.
 *
 * @param {object}   inputData             - { type, content, isPreset, presetId, fileMetadata }
 * @param {function} onProgressUpdate      - Called for each pipeline stage:
 *                                           ({ currentStepIndex, stepName, stepDesc, logs })
 * @returns {Promise<object>}              - Final verification report
 */
export async function runVerificationPipeline(inputData, onProgressUpdate) {
  const { type, content, presetId, fileMetadata, fileData } = inputData;

  // ── Call the RAV API ────────────────────────────────────────────────────
  const serverBaseUrl = import.meta.env.VITE_SERVER_URL || '';
  let response;
  try {
    // Try relative Vite proxy / production endpoint first
    response = await fetch('/api/verify', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ type, content, presetId, fileMetadata, fileData }),
    });
  } catch (proxyErr) {
    // Fallback to configured server URL if specified
    if (serverBaseUrl) {
      try {
        response = await fetch(`${serverBaseUrl}/api/verify`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ type, content, presetId, fileMetadata, fileData }),
        });
      } catch (directErr) {
        throw new Error(
          `Cannot reach TruthLens API server at ${serverBaseUrl}. Please check backend service.`
        );
      }
    } else {
      throw new Error(
        'Cannot reach TruthLens API server. Please check backend service.'
      );
    }
  }

  if (!response || !response.ok) {
    if (serverBaseUrl) {
      try {
        const directResponse = await fetch(`${serverBaseUrl}/api/verify`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ type, content, presetId, fileMetadata, fileData }),
        });
        if (directResponse.ok) {
          response = directResponse;
        } else {
          const text = (await directResponse.text().catch(() => '')) || directResponse.statusText;
          throw new Error(`API error ${directResponse.status}${text ? `: ${text}` : ' — TruthLens API server returned an error.'}`);
        }
      } catch (directErr) {
        if (directErr.message.startsWith('API error')) throw directErr;
        const text = response ? (await response.text().catch(() => '')) : '';
        const statusMsg = response ? `API error ${response.status}` : 'Connection error';
        const detail = text || 'Cannot reach TruthLens API server. Please ensure the backend server is running.';
        throw new Error(`${statusMsg}: ${detail}`);
      }
    } else {
      const text = response ? (await response.text().catch(() => '')) : '';
      const statusMsg = response ? `API error ${response.status}` : 'Connection error';
      const detail = text || 'Cannot reach TruthLens API server. Please ensure the backend server is running.';
      throw new Error(`${statusMsg}: ${detail}`);
    }
  }


  // ── Read SSE stream ─────────────────────────────────────────────────────
  const reader  = response.body.getReader();
  const decoder = new TextDecoder();
  let   buffer  = '';
  let   finalReport = null;
  let   pipelineError = null;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE messages are separated by double newlines
      const segments = buffer.split('\n\n');
      buffer = segments.pop(); // Keep the last (possibly incomplete) segment

      for (const segment of segments) {
        const line = segment.trim();
        if (!line.startsWith('data: ')) continue;

        let event;
        try {
          event = JSON.parse(line.slice(6));
        } catch {
          continue; // Skip malformed lines
        }

        if (event.type === 'progress') {
          onProgressUpdate?.({
            currentStepIndex: event.stage ?? 0,
            stepName:         event.name  ?? '',
            stepDesc:         event.desc  ?? '',
            logs:             event.logs  ?? [],
          });

        } else if (event.type === 'complete') {
          finalReport = event.report;

        } else if (event.type === 'error') {
          pipelineError = event.error;
        }
      }
    }
  } finally {
    reader.cancel().catch(() => {});
  }

  // ── Handle outcomes ──────────────────────────────────────────────────────
  if (pipelineError) {
    throw new Error(pipelineError);
  }

  if (!finalReport) {
    throw new Error('Pipeline completed without returning a report. Check the API server logs.');
  }

  return finalReport;
}

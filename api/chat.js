// InsightAI — Gemini proxy (Vercel serverless function)
//
// SECURITY MODEL
// --------------
// - The Gemini API key is read exclusively from the GEMINI_API_KEY environment
//   variable, set in the Vercel project dashboard (Settings → Environment
//   Variables). It never appears in source, in the repo, or in the response.
// - This function is the ONLY code path that has the key. The browser calls
//   /api/chat and never sees, or needs, the key itself.
// - We validate input shape and cap payload size so a malicious caller cannot
//   trivially abuse the proxy to hammer the upstream API on someone else's
//   quota.
//
// Runtime: Vercel Node.js function (default). No dependencies — uses global
// fetch (Node 18+, which Vercel provides).

const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_ENDPOINT =
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Safety cap — Gemini Flash accepts large contexts, but we don't want any
// single request from the browser to exceed a sensible size.
const MAX_BODY_BYTES = 1_500_000; // ~1.5 MB of JSON body

module.exports = async function handler(req, res) {
  // Basic CORS — same-origin in production on Vercel, but this lets local
  // dev (running the static file from another origin) still hit /api/chat.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error: 'server_misconfigured',
      message: 'GEMINI_API_KEY is not set in the server environment.',
    });
    return;
  }

  // Vercel Node handlers usually parse JSON automatically, but be defensive.
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) {
      res.status(400).json({ error: 'invalid_json' });
      return;
    }
  }
  if (!body || typeof body !== 'object') {
    res.status(400).json({ error: 'missing_body' });
    return;
  }

  const { systemInstruction, contents, generationConfig } = body;
  if (!Array.isArray(contents) || contents.length === 0) {
    res.status(400).json({ error: 'missing_contents' });
    return;
  }

  // Cheap size guard.
  try {
    const approxSize = Buffer.byteLength(JSON.stringify(body));
    if (approxSize > MAX_BODY_BYTES) {
      res.status(413).json({ error: 'payload_too_large' });
      return;
    }
  } catch (_) { /* ignore */ }

  // Build the upstream payload. We deliberately pass through only the fields
  // we know about — the browser can't smuggle arbitrary Gemini options.
  const upstreamBody = { contents };
  if (systemInstruction) upstreamBody.systemInstruction = systemInstruction;
  if (generationConfig && typeof generationConfig === 'object') {
    upstreamBody.generationConfig = generationConfig;
  }

  try {
    const upstream = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(upstreamBody),
    });

    const text = await upstream.text();

    if (!upstream.ok) {
      // Pass through the upstream status but strip any hint of the key by
      // returning a structured error rather than the raw upstream body.
      let details = null;
      try { details = JSON.parse(text); } catch (_) { /* upstream may not be JSON */ }
      res.status(upstream.status).json({
        error: 'upstream_error',
        status: upstream.status,
        details: details && details.error ? { message: details.error.message, status: details.error.status } : null,
      });
      return;
    }

    // Success — forward Gemini's JSON as-is.
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(text);
  } catch (err) {
    res.status(502).json({ error: 'upstream_unreachable', message: String(err && err.message || err) });
  }
};

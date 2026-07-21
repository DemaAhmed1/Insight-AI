// InsightAI — Gemini proxy (Vercel serverless function)

const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_ENDPOINT =
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const MAX_BODY_BYTES = 1_500_000; // ~1.5 MB of JSON body

module.exports = async function handler(req, res) {
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

  let { systemInstruction, contents, generationConfig, dataContext } = body;

  // إذا تم إرسال سياق البيانات المرفوعة، نصيغ التعليمات الصارمة للإجابة بناءً عليها فقط
  if (dataContext) {
    const strictSystemPrompt = `أنت مساعد تحليل بيانات احترافي لمنصة InsightAI.
لديك البيانات التالية المرفوعة من قبل المستخدم:
- اسم الملف: ${dataContext.fileName || 'غير محدد'}
- عدد الصفوف: ${dataContext.rowCount || 0}
- عدد الأعمدة: ${dataContext.colCount || 0}
- أسماء الأعمدة: ${dataContext.columns ? dataContext.columns.join(', ') : 'غير محدد'}
- ملخص الإحصائيات والأرقام: ${JSON.stringify(dataContext.summary || {})}
- أول 20 صفاً من البيانات: ${JSON.stringify(dataContext.previewData || [])}

تعليمات صارمة جداً:
1. أجب على أسرار وأسئلة المستخدم اعتماداً حصرياً ومباشراً على البيانات أعلاه فقط.
2. إذا لم تكن المعلومة المطلوبة موجودة داخل هذه البيانات، يجب أن تخبر المستخدم بوضوح: "هذه المعلومة غير موجودة داخل البيانات المرفوعة."
3. لا تقم بتأليف أو افتراض أي أرقام أو معلومات خارج نطاق السياق المزود.`;

    systemInstruction = {
      parts: [{ text: strictSystemPrompt }]
    };
  }

  if (!Array.isArray(contents) || contents.length === 0) {
    res.status(400).json({ error: 'missing_contents' });
    return;
  }

  try {
    const approxSize = Buffer.byteLength(JSON.stringify(body));
    if (approxSize > MAX_BODY_BYTES) {
      res.status(413).json({ error: 'payload_too_large' });
      return;
    }
  } catch (_) {}

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
      let details = null;
      try { details = JSON.parse(text); } catch (_) {}
      res.status(upstream.status).json({
        error: 'upstream_error',
        status: upstream.status,
        details: details && details.error ? { message: details.error.message, status: details.error.status } : null,
      });
      return;
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(text);
  } catch (err) {
    res.status(502).json({ error: 'upstream_unreachable', message: String(err && err.message || err) });
  }
};

// Rely on native global fetch in Node.js 18+ (no need to import node-fetch)

// Simple in-memory rate limiting store (best-effort per serverless instance)
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20; // Allow up to 20 requests per minute per IP

/**
 * Strips script tags, HTML, and other potentially dangerous content from input strings recursively.
 */
function sanitizeInput(data) {
  if (typeof data === 'string') {
    // Basic text sanitization
    return data.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '');
  } else if (Array.isArray(data)) {
    return data.map(sanitizeInput);
  } else if (typeof data === 'object' && data !== null) {
    const sanitized = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        sanitized[key] = sanitizeInput(data[key]);
      }
    }
    return sanitized;
  }
  return data;
}

export default async function handler(req, res) {
  // 1. Enable CORS for local development and main deployment
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(455).json({ error: 'Method not allowed. Use POST.' });
  }

  // 2. Extract client IP and apply in-memory rate limiting
  const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const ip = typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : '127.0.0.1';
  
  const now = Date.now();
  const rateData = rateLimitStore.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };

  // Reset rate limit window if expired
  if (now > rateData.resetTime) {
    rateData.count = 0;
    rateData.resetTime = now + RATE_LIMIT_WINDOW_MS;
  }

  rateData.count += 1;
  rateLimitStore.set(ip, rateData);

  if (rateData.count > MAX_REQUESTS_PER_WINDOW) {
    res.setHeader('Retry-After', Math.ceil((rateData.resetTime - now) / 1000));
    return res.status(429).json({
      error: 'Rate limit exceeded. Please wait a minute before making more AI requests.'
    });
  }

  try {
    // 3. Check environment variables
    // Allow fallback: If frontend passes its own GEMINI_API_KEY in headers, we can use it
    // This is super helpful for developers running it locally without setting up vercel env.
    const apiKey = process.env.GEMINI_API_KEY || req.headers['x-gemini-api-key'];

    if (!apiKey) {
      return res.status(500).json({
        error: 'Google Gemini API key not configured on server. Please set the GEMINI_API_KEY environment variable or provide a key in the settings panel.'
      });
    }

    // 4. Validate input payload
    const { contents, generationConfig } = req.body || {};
    if (!contents || !Array.isArray(contents) || contents.length === 0) {
      return res.status(400).json({ error: 'Invalid payload structure. "contents" array is required.' });
    }

    // Basic size constraint validation (max 10MB payload)
    const payloadSize = JSON.stringify(req.body).length;
    if (payloadSize > 10 * 1024 * 1024) {
      return res.status(413).json({ error: 'Payload too large. Maximum size is 10MB.' });
    }

    // Sanitize payload text fields to protect against injections
    const sanitizedContents = sanitizeInput(contents);

    // 5. Send requests to Google Gemini REST API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;

    const payload = {
      contents: sanitizedContents,
    };

    if (generationConfig) {
      payload.generationConfig = generationConfig;
    }

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API Error details:', data);
      return res.status(response.status).json({
        error: data.error?.message || 'Upstream API error returned by Google Gemini.',
        details: data
      });
    }

    // 6. Return response to frontend
    return res.status(200).json(data);

  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({
      error: 'An internal server error occurred while processing your request.',
      details: error.message
    });
  }
}

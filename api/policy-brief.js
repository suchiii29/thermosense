/* global process */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-gemini-api-key');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed. Use POST.' });

  const apiKey = process.env.GEMINI_API_KEY || req.headers['x-gemini-api-key'];
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server.' });
  }

  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Request body must include a "prompt" string.' });
  }

  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1500 },
      }),
    });

    // Must call .json() before accessing candidates
    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      return res.status(geminiRes.status).json({
        error: data.error?.message || 'Upstream Gemini API error.',
      });
    }

    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Strip any markdown fences Gemini may have added — the brief is plain text
    text = text.replace(/```[a-z]*/gi, '').replace(/```/g, '').trim();

    // Return as plain string — do NOT JSON.parse the policy brief
    return res.status(200).json({ brief: text });
  } catch (err) {
    console.error('policy-brief error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error.' });
  }
}

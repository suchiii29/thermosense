/**
 * Sends a content generation request to Google Gemini 1.5 Pro.
 * Handles serverless proxy requests or client-side fallback if the user has provided a custom key.
 * 
 * @param {Array} contents - The Gemini content payload format (e.g. [{ role: 'user', parts: [...] }])
 * @param {Object} customConfig - Object containing mapboxToken and geminiKey from localSettings
 * @param {Object} generationConfig - Optional Gemini configuration parameters (temperature, maxOutputTokens, etc.)
 */
export async function callGemini(contents, customConfig = {}, generationConfig = {}) {
  const customKey = customConfig.geminiKey?.trim();

  // Try to use the local API proxy first
  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    // If the user provided a custom key, send it as a header to the proxy
    if (customKey) {
      headers['x-gemini-api-key'] = customKey;
    }

    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2048,
          ...generationConfig
        }
      })
    });

    const data = await response.json();

    if (response.ok) {
      // Success response from proxy
      return parseGeminiResponse(data);
    }

    // If proxy failed due to missing configuration (e.g., in a static preview or local dev without serverless running)
    // and the user provided a client-side key, fallback to direct browser-to-Gemini connection.
    if ((response.status === 500 || response.status === 404) && customKey) {
      console.warn('Vercel API proxy returned error or was not found. Attempting direct connection to Gemini using custom client key...');
      return await callGeminiDirect(contents, customKey, generationConfig);
    }

    throw new Error(data.error || `Server responded with status ${response.status}`);
  } catch (error) {
    // If the network call to /api/gemini failed entirely (e.g. 404 in static hosting / dev environment)
    // and we have a custom key, try direct call
    if (customKey) {
      console.warn('Network request to Vercel API proxy failed. Falling back to direct Gemini call...');
      return await callGeminiDirect(contents, customKey, generationConfig);
    }
    throw error;
  }
}

/**
 * Direct client-side fallback to Gemini API (useful when running Vite dev server without vercel CLI).
 */
async function callGeminiDirect(contents, apiKey, generationConfig = {}) {
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2048,
          ...generationConfig
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Direct Gemini API error');
    }

    return parseGeminiResponse(data);
  } catch (error) {
    console.error('Direct Gemini call failed:', error);
    throw new Error(`Gemini connection failed: ${error.message}`);
  }
}

/**
 * Parses the standard Google Gemini REST API response to extract text content.
 */
function parseGeminiResponse(apiResponse) {
  try {
    const candidate = apiResponse.candidates?.[0];
    const part = candidate?.content?.parts?.[0];
    
    if (part?.text) {
      return part.text;
    }
    
    throw new Error('Gemini response did not contain text content.');
  } catch (err) {
    console.error('Parsing error of Gemini response:', err, apiResponse);
    throw new Error('Failed to parse Gemini model response.');
  }
}

/**
 * Helper to structure text prompt for Gemini.
 */
export function buildTextPromptPayload(prompt) {
  return [
    {
      role: 'user',
      parts: [
        { text: prompt }
      ]
    }
  ];
}

/**
 * Helper to structure base64 image + prompt payload for Gemini.
 */
export function buildMultimodalPayload(prompt, base64Data, mimeType) {
  return [
    {
      role: 'user',
      parts: [
        { text: prompt },
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Data
          }
        }
      ]
    }
  ];
}

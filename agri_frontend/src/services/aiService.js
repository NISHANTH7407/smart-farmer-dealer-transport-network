/**
 * aiService.js
 * Calls the Google Gemini API to get AI responses.
 * The API key is read from VITE_GEMINI_API_KEY in .env
 */

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Send a conversation history to Gemini and return the assistant reply text.
 *
 * @param {Array<{role: 'user'|'model', text: string}>} history  Full chat history
 * @param {string} systemPrompt  System-level instruction prepended to conversation
 * @returns {Promise<string>}  The AI's reply text
 */
export async function sendToGemini(history, systemPrompt) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
    throw new Error(
      'Gemini API key is not configured. Add VITE_GEMINI_API_KEY to your .env file.'
    );
  }

  // Build the contents array: system instruction first, then conversation turns
  const contents = history.map((msg) => ({
    role: msg.role === 'model' ? 'model' : 'user',
    parts: [{ text: msg.text }],
  }));

  const body = {
    system_instruction: {
      parts: [{ text: systemPrompt }],
    },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  };

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      err?.error?.message || `Gemini API error: ${response.status}`
    );
  }

  const data = await response.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('Received an empty response from Gemini.');
  }

  return text;
}

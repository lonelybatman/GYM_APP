import { readAsStringAsync, EncodingType } from 'expo-file-system/legacy';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-4-5-20251001';

export type ClaudeVisionResult = {
  text: string; // raw response text from Claude
};

/**
 * Send an image (local URI) to Claude API with a text prompt.
 * Returns the text content of Claude's response.
 * Throws if apiKey is empty or request fails.
 */
export async function callClaudeWithImage(
  imageUri: string,
  prompt: string,
  apiKey: string,
  maxTokens: number = 2048,
): Promise<string> {
  if (!apiKey) throw new Error('Claude API key not configured. Set it in Settings.');

  // Read image as base64
  const base64 = await readAsStringAsync(imageUri, {
    encoding: EncodingType.Base64,
  });

  // Determine media type from URI extension
  const ext = imageUri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const mediaType = ext === 'png' ? 'image/png' : 'image/jpeg';

  const body = {
    model: MODEL,
    max_tokens: maxTokens,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64 },
          },
          { type: 'text', text: prompt },
        ],
      },
    ],
  };

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error ${response.status}: ${err}`);
  }

  const json = (await response.json()) as any;
  return json.content?.[0]?.text ?? '';
}

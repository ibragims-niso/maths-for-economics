import type { ChatMessage } from '@mfe/core';
import aiConfig from '../../../../config/ai.json';

export type Role = 'main' | 'classifier';

interface Provider {
  id: string;
  baseUrl: string;
  /** Name of the Worker secret that holds this provider's key. */
  keySecret: string;
  models: Record<Role, string>;
  /** Provider-specific request fields, e.g. how much a reasoning model may think. */
  extra?: Partial<Record<Role, Record<string, unknown>>>;
}

/** Every provider failed or none has a key. The message lists why, without any key. */
export class AiUnavailableError extends Error {}

/**
 * Sends a chat to the first provider that has a key and answers; on an error or timeout it tries
 * the next one (config/ai.json: Groq first, then Gemini). Both speak the OpenAI chat format.
 */
export async function chat(
  secrets: Record<string, string | undefined>,
  role: Role,
  messages: ChatMessage[],
): Promise<string> {
  const failures: string[] = [];
  for (const provider of aiConfig.providers as Provider[]) {
    const key = secrets[provider.keySecret];
    if (!key) continue;
    try {
      const res = await fetch(`${provider.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          model: provider.models[role],
          messages,
          temperature: aiConfig.temperature[role],
          max_tokens: aiConfig.maxTokens[role],
          ...provider.extra?.[role],
        }),
        signal: AbortSignal.timeout(aiConfig.timeoutMs),
      });
      if (!res.ok) {
        failures.push(`${provider.id} ${role}: HTTP ${res.status}`);
        continue;
      }
      const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const text = data.choices?.[0]?.message?.content?.trim();
      if (text) return text;
      failures.push(`${provider.id} ${role}: empty answer`);
    } catch (error) {
      failures.push(`${provider.id} ${role}: ${error instanceof Error ? error.name : 'error'}`);
    }
  }
  throw new AiUnavailableError(failures.join('; ') || 'no provider key is set');
}

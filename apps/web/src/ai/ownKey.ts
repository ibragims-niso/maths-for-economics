import {
  type AiResponse,
  aiRequestSchema,
  type ChatFn,
  type CompiledTopic,
  planAnswer,
  planOpenAnswer,
  type TopicContext,
} from '@mfe/core';
import aiConfig from '../../../../config/ai.json';
import { content, topicById } from '../content';
import type { AiAsk, AiResult } from './client';
import { GROQ } from './groq';

class KeyError extends Error {}

function tutorContext(topic: CompiledTopic): TopicContext {
  return {
    id: topic.id,
    title: topic.title,
    summary: topic.tutor.summary,
    definitions: topic.tutor.definitions,
    economicUses: topic.economicUses,
    resources: topic.resources.map((r) => ({ title: r.title, url: r.url, kind: r.kind })),
    mistakeCodes: topic.mistakeCodes,
  };
}

/**
 * Answers on the device with the student's own key (docs/03 "Own-key mode"): the same rules as
 * the proxy (packages/core planAnswer), and the key never reaches our servers.
 */
export async function askWithOwnKey(request: AiAsk, key: string): Promise<AiResult> {
  const parsed = aiRequestSchema.safeParse({
    ...request,
    deviceId: '00000000-0000-4000-8000-000000000000',
    contentVersion: content.version,
  });
  const compiled = topicById(request.topicId);
  // Own key: free-text questions are open (decision D37); buttons keep their usual answers.
  const plan =
    parsed.success && compiled
      ? parsed.data.mode === 'ASK'
        ? planOpenAnswer(parsed.data.payload.question, tutorContext(compiled))
        : planAnswer(parsed.data, tutorContext(compiled), content.version)
      : undefined;
  if (!plan) return { ok: false, message: 'This question could not be sent.' };

  const chat: ChatFn = async (role, messages) => {
    const res = await fetch(`${GROQ.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: GROQ.models[role],
        messages,
        temperature: aiConfig.temperature[role],
        max_tokens: aiConfig.maxTokens[role],
        ...(GROQ.extra as Record<string, Record<string, unknown> | undefined>)[role],
      }),
      signal: AbortSignal.timeout(aiConfig.timeoutMs),
    });
    if (res.status === 401 || res.status === 403) {
      throw new KeyError(
        'Groq refused your key. Check it in Settings, or remove it to use the free daily questions.',
      );
    }
    if (res.status === 429) {
      throw new KeyError(
        "Your key has reached Groq's free limit for now. Try again in a little while.",
      );
    }
    if (!res.ok) throw new KeyError('Groq did not answer. Please try again later.');
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) throw new KeyError('Groq sent an empty answer. Please try again.');
    return text;
  };

  try {
    const answer: AiResponse = await plan.run(chat);
    return { ok: true, answer };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof KeyError
          ? error.message
          : 'Groq is not reachable. Check your internet connection.',
    };
  }
}

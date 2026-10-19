import {
  type AiResponse,
  aiRequestSchema,
  type ChatFn,
  planAnswer,
  type TopicContext,
} from '@mfe/core';
import aiTopics from '../generated/ai-topics.json';
import { AiUnavailableError, chat } from './providers';
import { answerCache, withinDailyLimits } from './store';

export interface AiEnv {
  GROQ_API_KEY?: string;
  GEMINI_API_KEY?: string;
  /** D1 database for daily limits (docs/02). Without it the shared key is not used. */
  DB?: D1Database;
  /** KV namespace for the shared answer cache (docs/03). Optional. */
  AI_CACHE?: KVNamespace;
  /** "1" only in local development (.dev.vars): answer without limits when there is no DB. */
  AI_DEV_UNLIMITED?: string;
}

// Written by scripts/build-content.ts in the TopicContext shape.
const TOPICS = new Map((aiTopics.topics as unknown as TopicContext[]).map((t) => [t.id, t]));

export const MESSAGES = {
  badRequest: 'This request is not one the app sends.',
  testRunning: 'AI help is off while a test is running.',
  notSetUp: 'AI help is being set up. Everything else in the app works.',
  limit:
    "You've used today's free AI questions. They reset at midnight (UTC), or add your own free key in Settings.",
  unavailable: 'AI help is not available right now. Please try again later; everything else works.',
} as const;

type Result = { status: 200; body: AiResponse } | { status: 400 | 403 | 429 | 503; error: string };

/**
 * Answers one AI request from the app with the shared keys (docs/03). The answering rules are
 * in packages/core (planAnswer); the proxy adds the test lock, daily limits and the cache.
 */
export async function answerAi(body: unknown, env: AiEnv, ip: string, now: Date): Promise<Result> {
  const parsed = aiRequestSchema.safeParse(body);
  if (!parsed.success) return { status: 400, error: MESSAGES.badRequest };
  const req = parsed.data;
  if (req.testActive) return { status: 403, error: MESSAGES.testRunning };

  const topic = TOPICS.get(req.topicId);
  const work = topic && planAnswer(req, topic, aiTopics.version);
  if (!work) return { status: 400, error: MESSAGES.badRequest };

  const cacheKey = work.cache && env.AI_CACHE ? await answerCache.key(work.cache) : undefined;
  if (cacheKey && env.AI_CACHE) {
    const hit = await answerCache.get(env.AI_CACHE, cacheKey);
    if (hit) return { status: 200, body: { ...(JSON.parse(hit) as AiResponse), cached: true } };
  }

  let remaining: number | undefined;
  if (!env.DB) {
    if (env.AI_DEV_UNLIMITED !== '1') return { status: 503, error: MESSAGES.notSetUp };
  } else {
    const usage = await withinDailyLimits(env.DB, req.deviceId, ip, now);
    if (!usage.allowed) return { status: 429, error: MESSAGES.limit };
    remaining = usage.remaining;
  }

  const keys = { GROQ_API_KEY: env.GROQ_API_KEY, GEMINI_API_KEY: env.GEMINI_API_KEY };
  const sharedChat: ChatFn = (role, messages) => chat(keys, role, messages);
  try {
    const answer = await work.run(sharedChat);
    // Answers to a student's own exercise are never shared between students.
    if (cacheKey && env.AI_CACHE && answer.mode !== 'ANALOG') {
      await answerCache.put(env.AI_CACHE, cacheKey, JSON.stringify(answer));
    }
    return { status: 200, body: remaining === undefined ? answer : { ...answer, remaining } };
  } catch (error) {
    if (error instanceof AiUnavailableError) {
      console.error('AI providers failed:', error.message);
      return { status: 503, error: MESSAGES.unavailable };
    }
    throw error;
  }
}

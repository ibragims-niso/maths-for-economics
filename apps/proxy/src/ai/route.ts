import {
  type AiMode,
  type AiRequest,
  type AiResponse,
  aiRequestSchema,
  analogFallbackText,
  analogMessages,
  classifierMessages,
  conceptMessages,
  explainStepMessages,
  GENERATORS,
  generatorById,
  makeProblem,
  OFF_TOPIC_TEXT,
  parseCategory,
  problemBlock,
  randomSeed,
  realWorldMessages,
  type TopicContext,
  testFeedbackMessages,
  usesStudentNumbers,
} from '@mfe/core';
import aiTopics from '../generated/ai-topics.json';
import { AiUnavailableError, chat } from './providers';
import { answerCache, normalise, withinDailyLimits } from './store';

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

type Keys = Record<string, string | undefined>;

type Result = { status: 200; body: AiResponse } | { status: 400 | 403 | 429 | 503; error: string };

/** The problem a request points to, rebuilt from the app's own generator for that topic. */
function problemFor(req: { topicId: string; payload: { templateId: string; seed: number } }) {
  const generator = generatorById(req.payload.templateId);
  if (!generator || generator.topicId !== req.topicId) return undefined;
  return makeProblem(generator, req.payload.seed);
}

/** A similar problem with different numbers, from one of the topic's generators. */
function analogFor(topicId: string) {
  const generators = GENERATORS.filter((g) => g.topicId === topicId);
  const generator = generators[randomSeed() % Math.max(1, generators.length)];
  return generator ? makeProblem(generator, randomSeed()) : undefined;
}

interface Plan {
  /** Cache key parts; undefined for answers that must not be shared. */
  cache?: (string | number | undefined)[];
  run: () => Promise<{ mode: AiMode; text: string }>;
}

function plan(req: AiRequest, topic: TopicContext, keys: Keys): Plan | undefined {
  const base = [req.mode, topic.id, aiTopics.version];
  switch (req.mode) {
    case 'EXPLAIN_STEP': {
      const problem = problemFor(req);
      if (!problem || req.payload.step >= problem.steps.length) return undefined;
      return {
        cache: [...base, req.payload.templateId, req.payload.seed, req.payload.step],
        run: async () => ({
          mode: 'EXPLAIN_STEP',
          text: await chat(keys, 'main', explainStepMessages(topic, problem, req.payload.step)),
        }),
      };
    }
    case 'TEST_FEEDBACK': {
      const problem = problemFor(req);
      if (!problem) return undefined;
      const { templateId, seed, mistakeCode, userAnswer } = req.payload;
      return {
        cache: [...base, templateId, seed, mistakeCode, normalise(userAnswer)],
        run: async () => ({
          mode: 'TEST_FEEDBACK',
          text: await chat(
            keys,
            'main',
            testFeedbackMessages(topic, problem, userAnswer, mistakeCode),
          ),
        }),
      };
    }
    case 'REAL_WORLD':
      return {
        cache: base,
        run: async () => ({
          mode: 'REAL_WORLD',
          text: await chat(keys, 'main', realWorldMessages(topic)),
        }),
      };
    case 'ASK': {
      const question = req.payload.question;
      return {
        cache: [...base, normalise(question)],
        run: async () => {
          // Guardrail layer 2: a small model sorts the question; if it fails, the safe default.
          const category = await chat(keys, 'classifier', classifierMessages(topic.title, question))
            .then(parseCategory)
            .catch(() => 'user_problem' as const);
          if (category === 'off_topic') return { mode: 'OFF_TOPIC', text: OFF_TOPIC_TEXT };
          if (category === 'real_world') {
            return {
              mode: 'REAL_WORLD',
              text: await chat(keys, 'main', realWorldMessages(topic)),
            };
          }
          if (category === 'concept') {
            return {
              mode: 'CONCEPT_QA',
              text: await chat(keys, 'main', conceptMessages(topic, question)),
            };
          }
          const analog = analogFor(topic.id);
          if (!analog) {
            return {
              mode: 'CONCEPT_QA',
              text: await chat(keys, 'main', conceptMessages(topic, question)),
            };
          }
          const text = await chat(keys, 'main', analogMessages(topic, question, analog));
          // Guardrail layer 4: never return work on the student's own numbers.
          return {
            mode: 'ANALOG',
            text: usesStudentNumbers(question, text, problemBlock(analog))
              ? analogFallbackText(analog)
              : text,
          };
        },
      };
    }
  }
}

/** Answers one AI request from the app (docs/03), with every guardrail the proxy owns. */
export async function answerAi(body: unknown, env: AiEnv, ip: string, now: Date): Promise<Result> {
  const parsed = aiRequestSchema.safeParse(body);
  if (!parsed.success) return { status: 400, error: MESSAGES.badRequest };
  const req = parsed.data;
  if (req.testActive) return { status: 403, error: MESSAGES.testRunning };

  const topic = TOPICS.get(req.topicId);
  const keys = { GROQ_API_KEY: env.GROQ_API_KEY, GEMINI_API_KEY: env.GEMINI_API_KEY };
  const work = topic && plan(req, topic, keys);
  if (!work) return { status: 400, error: MESSAGES.badRequest };

  const cacheKey = work.cache && env.AI_CACHE ? await answerCache.key(work.cache) : undefined;
  if (cacheKey && env.AI_CACHE) {
    const hit = await answerCache.get(env.AI_CACHE, cacheKey);
    if (hit) return { status: 200, body: { ...(JSON.parse(hit) as AiResponse), cached: true } };
  }

  if (!env.DB) {
    if (env.AI_DEV_UNLIMITED !== '1') return { status: 503, error: MESSAGES.notSetUp };
  } else if (!(await withinDailyLimits(env.DB, req.deviceId, ip, now))) {
    return { status: 429, error: MESSAGES.limit };
  }

  try {
    const answer = await work.run();
    // Answers to a student's own exercise are never shared between students.
    if (cacheKey && env.AI_CACHE && answer.mode !== 'ANALOG') {
      await answerCache.put(env.AI_CACHE, cacheKey, JSON.stringify(answer));
    }
    return { status: 200, body: answer };
  } catch (error) {
    if (error instanceof AiUnavailableError) {
      console.error('AI providers failed:', error.message);
      return { status: 503, error: MESSAGES.unavailable };
    }
    throw error;
  }
}

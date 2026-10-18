import { makeProblem } from '../engine/problem';
import { randomSeed } from '../engine/rng';
import { GENERATORS, generatorById } from '../generators';
import { classifierMessages, parseCategory, usesStudentNumbers } from './guards';
import {
  analogFallbackText,
  analogMessages,
  type ChatMessage,
  conceptMessages,
  explainStepMessages,
  OFF_TOPIC_TEXT,
  openMessages,
  problemBlock,
  realWorldMessages,
  type TopicContext,
  testFeedbackMessages,
} from './prompts';
import type { AiMode, AiRequest } from './request';

/** One model call: "main" answers, "classifier" sorts free-text questions. */
export type ChatFn = (role: 'main' | 'classifier', messages: ChatMessage[]) => Promise<string>;

export interface AnswerPlan {
  /** Cache key parts; undefined for answers that must not be shared. */
  cache?: (string | number | undefined)[];
  run: (chat: ChatFn) => Promise<{ mode: AiMode; text: string }>;
}

/**
 * Own-key mode, free-text questions (decision D37): no classifier and no analog rule; the
 * student's own key answers anything. Contextual buttons still use planAnswer.
 */
export function planOpenAnswer(question: string, topic: TopicContext): AnswerPlan {
  return {
    run: async (chat) => ({
      mode: 'OPEN',
      text: await chat('main', openMessages(topic, question)),
    }),
  };
}

/** Lowercase, trimmed, single spaces: the same question typed twice is the same question. */
export const normaliseText = (text: string) => text.toLowerCase().trim().replace(/\s+/g, ' ');

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

/**
 * How to answer one AI request (docs/03), whoever pays for the model: the shared proxy or the
 * student's own key on the device. All guardrails that do not need a server live here:
 * problems come only from generators, free text goes through the classifier (unclear means
 * "own exercise"), and an answer that works on the student's own numbers is replaced.
 * Returns undefined for a request that does not fit the topic.
 */
export function planAnswer(
  req: AiRequest,
  topic: TopicContext,
  contentVersion: string,
): AnswerPlan | undefined {
  const base = [req.mode, topic.id, contentVersion];
  switch (req.mode) {
    case 'EXPLAIN_STEP': {
      const problem = problemFor(req);
      if (!problem || req.payload.step >= problem.steps.length) return undefined;
      return {
        cache: [...base, req.payload.templateId, req.payload.seed, req.payload.step],
        run: async (chat) => ({
          mode: 'EXPLAIN_STEP',
          text: await chat('main', explainStepMessages(topic, problem, req.payload.step)),
        }),
      };
    }
    case 'TEST_FEEDBACK': {
      const problem = problemFor(req);
      if (!problem) return undefined;
      const { templateId, seed, mistakeCode, userAnswer } = req.payload;
      return {
        cache: [...base, templateId, seed, mistakeCode, normaliseText(userAnswer)],
        run: async (chat) => ({
          mode: 'TEST_FEEDBACK',
          text: await chat('main', testFeedbackMessages(topic, problem, userAnswer, mistakeCode)),
        }),
      };
    }
    case 'REAL_WORLD':
      return {
        cache: base,
        run: async (chat) => ({
          mode: 'REAL_WORLD',
          text: await chat('main', realWorldMessages(topic)),
        }),
      };
    case 'ASK': {
      const question = req.payload.question;
      return {
        cache: [...base, normaliseText(question)],
        run: async (chat) => {
          // Guardrail layer 2: a small model sorts the question; if it fails, the safe default.
          const category = await chat('classifier', classifierMessages(topic.title, question))
            .then(parseCategory)
            .catch(() => 'user_problem' as const);
          if (category === 'off_topic') return { mode: 'OFF_TOPIC', text: OFF_TOPIC_TEXT };
          if (category === 'real_world') {
            return { mode: 'REAL_WORLD', text: await chat('main', realWorldMessages(topic)) };
          }
          const analog = category === 'user_problem' ? analogFor(topic.id) : undefined;
          if (!analog) {
            return {
              mode: 'CONCEPT_QA',
              text: await chat('main', conceptMessages(topic, question)),
            };
          }
          const text = await chat('main', analogMessages(topic, question, analog));
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

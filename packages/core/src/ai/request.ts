import { z } from 'zod';

/** Longest free-text question the app sends (docs/03 guardrail layer 1). */
export const MAX_QUESTION_CHARS = 500;

const common = {
  topicId: z.string().regex(/^[A-Z]+\d+$/),
  contentVersion: z.string().min(1).max(40),
  deviceId: z.uuid(),
  /** Set while a test runs; the proxy refuses the request (docs/03). */
  testActive: z.boolean().optional(),
};

const problemRef = {
  templateId: z.string().regex(/^[a-z0-9-]+$/),
  seed: z
    .int()
    .min(0)
    .max(2 ** 32),
};

/**
 * What the app may ask the proxy (docs/03 "Modes"). Problems are sent as templateId + seed,
 * never as text, so the proxy rebuilds them from the app's own generators.
 */
export const aiRequestSchema = z.discriminatedUnion('mode', [
  z.strictObject({
    mode: z.literal('EXPLAIN_STEP'),
    ...common,
    payload: z.strictObject({ ...problemRef, step: z.int().min(0).max(20) }),
  }),
  z.strictObject({
    mode: z.literal('TEST_FEEDBACK'),
    ...common,
    payload: z.strictObject({
      ...problemRef,
      userAnswer: z.string().max(40),
      mistakeCode: z
        .string()
        .regex(/^[A-Z][A-Z0-9_]*$/)
        .optional(),
    }),
  }),
  z.strictObject({ mode: z.literal('REAL_WORLD'), ...common, payload: z.strictObject({}) }),
  z.strictObject({
    mode: z.literal('ASK'),
    ...common,
    payload: z.strictObject({ question: z.string().trim().min(2).max(MAX_QUESTION_CHARS) }),
  }),
]);

export type AiRequest = z.infer<typeof aiRequestSchema>;

/** The mode that actually answered: ASK becomes one of the free-text modes after the classifier. */
export type AiMode =
  | 'EXPLAIN_STEP'
  | 'TEST_FEEDBACK'
  | 'REAL_WORLD'
  | 'CONCEPT_QA'
  | 'ANALOG'
  | 'OFF_TOPIC';

export interface AiResponse {
  mode: AiMode;
  text: string;
  /** True when the answer came from the shared cache. */
  cached?: boolean;
}

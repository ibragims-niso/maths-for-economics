import { z } from 'zod';

const topicId = z.string().regex(/^[A-Z]+\d+$/);
const secret = z.string().regex(/^[0-9a-f]{32}$/);

/**
 * What a mentor sees (docs/02 "Mentor sync"): progress numbers and topic IDs only. No names, no
 * emails, no text the student typed, no answers.
 */
export const snapshotSchema = z.strictObject({
  version: z.literal(1),
  updatedAt: z.int().positive(),
  /** A public track's name, or "Imported programme" (an imported file's text is not shared). */
  trackName: z.string().max(120),
  years: z
    .array(
      z.strictObject({
        year: z.int().min(1).max(8),
        mastered: z.int().min(0),
        total: z.int().min(0),
      }),
    )
    .max(8),
  topics: z
    .array(
      z.strictObject({
        id: topicId,
        state: z.enum(['learning', 'mastered']),
        lastScore: z.int().min(0).max(100).optional(),
        testsTaken: z.int().min(0),
        nextReviewAt: z.int().positive().optional(),
      }),
    )
    .max(300),
  tests: z
    .array(
      z.strictObject({
        finishedAt: z.int().positive(),
        topicIds: z.array(topicId).max(20),
        correct: z.int().min(0),
        total: z.int().min(1).max(50),
        mistakes: z
          .array(z.strictObject({ topicId, code: z.string().regex(/^[A-Z][A-Z0-9_]*$/) }))
          .max(50),
      }),
    )
    .max(20),
});

export type Snapshot = z.infer<typeof snapshotSchema>;

/**
 * Sharing is identified by two random 128-bit values made on the device: the token goes into
 * the mentor's link, the key lets only that device update or delete the copy. The server keeps
 * only their hashes.
 */
export const syncRequestSchema = z.strictObject({
  token: secret,
  key: secret,
  snapshot: snapshotSchema,
});

export const syncDisableSchema = z.strictObject({ token: secret, key: secret });

export const isShareToken = (value: string) => secret.safeParse(value).success;

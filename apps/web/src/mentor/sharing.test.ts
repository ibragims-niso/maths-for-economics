import { snapshotSchema } from '@mfe/core';
import { describe, expect, it } from 'vitest';
import { trackById } from '../tracks';
import { buildSnapshot, randomSecret } from './sharing';

describe("the mentor's copy", () => {
  it('holds only numbers and topic IDs, in the format the API accepts', () => {
    const snapshot = buildSnapshot(
      trackById('core'),
      [
        {
          topicId: 'C107',
          lastScores: [80, 90, 100],
          testsTaken: 3,
          leitnerBox: 3,
          nextReviewAt: 5,
        },
        { topicId: 'F04', lastScores: [], testsTaken: 0, leitnerBox: 0 },
      ],
      [
        {
          id: 'a',
          startedAt: 1,
          finishedAt: 2,
          timeLimitSec: 300,
          timedOut: false,
          topicIds: ['C107'],
          difficulty: 'mixed',
          items: [
            {
              topicId: 'C107',
              templateId: 't',
              seed: 1,
              userAnswer: 'my typed answer',
              correct: false,
              mistakeCode: 'SIGN',
            },
          ],
        },
      ],
      10,
    );
    expect(snapshotSchema.safeParse(snapshot).success).toBe(true);
    expect(snapshot.topics.map((t) => t.id)).toEqual(['C107']);
    expect(snapshot.years[0]).toMatchObject({ year: 1, mastered: 1 });
    expect(JSON.stringify(snapshot)).not.toContain('my typed answer');
  });

  it('shares an imported programme without its text', () => {
    const custom = {
      ...trackById('core'),
      id: 'mine',
      name: 'Secret University',
      visibility: 'custom' as const,
    };
    expect(buildSnapshot(custom, [], [], 1).trackName).toBe('Imported programme');
  });

  it('makes 128-bit secrets', () => {
    expect(randomSecret()).toMatch(/^[0-9a-f]{32}$/);
    expect(randomSecret()).not.toBe(randomSecret());
  });
});

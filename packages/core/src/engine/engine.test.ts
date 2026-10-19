import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { GENERATORS } from '../generators';
import { composeTest } from './composer';
import { gradeNumeric, parseNumber, toleranceFor } from './grading';
import {
  dueForReview,
  markRead,
  masteryState,
  progressAfterTest,
  recordScore,
  type TopicProgress,
  topicScore,
} from './mastery';
import { createRng } from './rng';

describe('createRng', () => {
  it('repeats exactly for the same seed', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 2 ** 32 - 1 }), (seed) => {
        const a = createRng(seed);
        const b = createRng(seed);
        for (let i = 0; i < 20; i++) expect(a.next()).toBe(b.next());
      }),
    );
  });

  it('keeps int() inside its bounds', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 2 ** 32 - 1 }),
        fc.integer({ min: -50, max: 50 }),
        (seed, lo) => {
          const rng = createRng(seed);
          for (let i = 0; i < 50; i++) {
            const n = rng.int(lo, lo + 7);
            expect(Number.isInteger(n) && n >= lo && n <= lo + 7).toBe(true);
          }
        },
      ),
    );
  });
});

describe('parseNumber', () => {
  it.each([
    ['12.5', 12.5],
    ['12,5', 12.5],
    ['-0.67', -0.67],
    ['−0,67', -0.67],
    ['2/3', 2 / 3],
    ['-3/4', -0.75],
    ['1 250', 1250],
    ['.5', 0.5],
    ['  7 ', 7],
  ])('reads %s', (input, expected) => {
    expect(parseNumber(input)).toBeCloseTo(expected, 10);
  });

  it.each(['', 'abc', '1/0', '1.2.3', '--2', '5%'])('rejects %s', (input) => {
    expect(parseNumber(input)).toBeNull();
  });
});

describe('gradeNumeric', () => {
  const answer = { kind: 'numeric' as const, value: -0.67 };
  const distractors = [
    { value: 0.67, mistakeCode: 'SIGN' },
    { value: -6, mistakeCode: 'INVERTED_RATIO' },
  ];

  it('accepts answers within tolerance, including fractions', () => {
    expect(gradeNumeric(answer, '-0.67').correct).toBe(true);
    expect(gradeNumeric(answer, '-2/3').correct).toBe(true);
    expect(gradeNumeric(answer, '-0,665').correct).toBe(true);
  });

  it('names the mistake a wrong answer matches', () => {
    expect(gradeNumeric(answer, '0.67', distractors)).toEqual({
      correct: false,
      value: 0.67,
      mistakeCode: 'SIGN',
    });
  });

  it('marks unknown wrong answers without a mistake code', () => {
    expect(gradeNumeric(answer, '3', distractors)).toEqual({ correct: false, value: 3 });
  });

  it('uses the larger of 0.01 and 0.5 %', () => {
    expect(toleranceFor(1)).toBe(0.01);
    expect(toleranceFor(1000)).toBe(5);
  });
});

describe('mastery', () => {
  const fresh: TopicProgress = { topicId: 'C107', lastScores: [], testsTaken: 0, leitnerBox: 0 };
  const day = 24 * 60 * 60 * 1000;

  it('needs the last three scores at 80 or more (D13)', () => {
    let p = fresh;
    for (const s of [90, 85, 70, 80, 95]) p = recordScore(p, s, 0);
    expect(masteryState(p)).toBe('learning');
    p = recordScore(p, 88, 0);
    expect(masteryState(p)).toBe('mastered');
  });

  it('moves the Leitner box up, back to 1, or keeps it', () => {
    const up = recordScore({ ...fresh, leitnerBox: 2 }, 85, 0);
    expect(up.leitnerBox).toBe(3);
    expect(up.nextReviewAt).toBe(7 * day);
    expect(recordScore({ ...fresh, leitnerBox: 4 }, 40, 0).leitnerBox).toBe(1);
    expect(recordScore({ ...fresh, leitnerBox: 3 }, 70, 0).leitnerBox).toBe(3);
    expect(recordScore({ ...fresh, leitnerBox: 5 }, 100, 0).leitnerBox).toBe(5);
  });

  it('scores a topic as the share of its items answered correctly', () => {
    const items = [
      { topicId: 'C107', correct: true },
      { topicId: 'C107', correct: false },
      { topicId: 'F04', correct: true },
    ];
    expect(topicScore(items, 'C107')).toBe(50);
  });

  it('lists overdue topics first', () => {
    const a = { ...fresh, topicId: 'A', nextReviewAt: 5 };
    const b = { ...fresh, topicId: 'B', nextReviewAt: 2 };
    const c = { ...fresh, topicId: 'C', nextReviewAt: 50 };
    expect(dueForReview([a, b, c], 10).map((p) => p.topicId)).toEqual(['B', 'A']);
  });

  it('updates each tested topic with its own score and leaves the rest alone', () => {
    const existing = [{ ...fresh, lastScores: [100], testsTaken: 1, leitnerBox: 1 }];
    const items = [
      { topicId: 'C107', correct: true },
      { topicId: 'C107', correct: true },
      { topicId: 'F04', correct: false },
    ];
    const [c107, f04, ...rest] = progressAfterTest(existing, items, 0);
    expect(rest).toEqual([]);
    expect(c107).toMatchObject({ topicId: 'C107', lastScores: [100, 100], testsTaken: 2 });
    expect(c107?.leitnerBox).toBe(2);
    expect(f04).toMatchObject({ topicId: 'F04', lastScores: [0], testsTaken: 1, leitnerBox: 1 });
  });

  it('keeps the first reading date', () => {
    const read = markRead(undefined, 'C107', 5);
    expect(read.readAt).toBe(5);
    expect(masteryState(read)).toBe('learning');
    expect(markRead(read, 'C107', 9).readAt).toBe(5);
  });
});

describe('composeTest', () => {
  it('draws the requested count, never the same template twice in a row', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 2 ** 31 }),
        fc.constantFrom(5, 10, 15, 20),
        (seed, count) => {
          const plan = composeTest({
            topicIds: ['C107'],
            difficulty: 'mixed',
            count,
            generators: GENERATORS,
            seed,
          });
          expect(plan.items).toHaveLength(count);
          plan.items.forEach((item, i) => {
            if (i > 0) expect(item.templateId).not.toBe(plan.items[i - 1]?.templateId);
          });
          expect(plan.timeLimitSec % 60).toBe(0);
        },
      ),
    );
  });

  it('sums suggested times by difficulty and rounds up to a minute', () => {
    const plan = composeTest({
      topicIds: ['C107'],
      difficulty: 1,
      count: 3,
      generators: GENERATORS,
      seed: 1,
    });
    expect(plan.timeLimitSec).toBe(180);
  });

  it('returns an empty plan when no generator matches', () => {
    expect(
      composeTest({
        topicIds: ['XX99'], // an ID that will never exist
        difficulty: 'mixed',
        count: 5,
        generators: GENERATORS,
        seed: 1,
      }).items,
    ).toEqual([]);
  });
});

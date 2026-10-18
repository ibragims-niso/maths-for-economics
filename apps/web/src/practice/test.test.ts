import { describe, expect, it } from 'vitest';
import {
  formatAnswer,
  formatClock,
  formatDuration,
  gradeTest,
  planTest,
  retakeTest,
  startTest,
} from './test';

const settings = { topicIds: ['C107', 'F04'], difficulty: 'mixed' as const, count: 6 };

describe('a practice test', () => {
  it('has the asked number of questions from the chosen topics, with a time limit', () => {
    const test = startTest(settings, planTest(settings, 42));
    expect(test.questions).toHaveLength(6);
    expect(new Set(test.questions.map((q) => q.topicId))).toEqual(new Set(['C107', 'F04']));
    expect(test.timeLimitSec).toBeGreaterThan(0);
    expect(test.timeLimitSec % 60).toBe(0);
  });

  it('gives the same numbers for the same seed and new numbers on a retake', () => {
    const a = startTest(settings, planTest(settings, 7));
    const b = startTest(settings, planTest(settings, 7));
    expect(b.questions.map((q) => q.problem.stem)).toEqual(a.questions.map((q) => q.problem.stem));
    const c = retakeTest(settings);
    expect(c.questions.map((q) => q.problem.stem)).not.toEqual(
      a.questions.map((q) => q.problem.stem),
    );
  });

  it('grades the right answers as correct, distractors with their mistake, blanks as wrong', () => {
    const test = startTest(settings, planTest(settings, 3));
    const answers = test.questions.map((q, i) => {
      if (q.problem.answer.kind !== 'numeric') return '';
      if (i === 0) return String(q.problem.answer.value);
      if (i === 1) return String(q.problem.distractors[0]?.value ?? '');
      return '';
    });
    const grades = gradeTest(test, answers);
    expect(grades[0]?.correct).toBe(true);
    expect(grades[1]?.correct).toBe(false);
    expect(grades[1]?.mistakeCode).toBe(test.questions[1]?.problem.distractors[0]?.mistakeCode);
    expect(grades.slice(2).every((g) => !g.correct)).toBe(true);
  });
});

describe('formatting', () => {
  it('shows answers with their decimals and units', () => {
    expect(formatAnswer({ kind: 'numeric', value: -0.6667, decimals: 2 })).toBe('-0.67');
    expect(formatAnswer({ kind: 'numeric', value: 1250, unit: 'units' })).toBe('1,250 units');
  });

  it('shows the clock and durations', () => {
    expect(formatClock(754)).toBe('12:34');
    expect(formatClock(-3)).toBe('0:00');
    expect(formatDuration(492)).toBe('8 min 12 s');
    expect(formatDuration(840)).toBe('14 min');
    expect(formatDuration(9)).toBe('9 s');
  });
});

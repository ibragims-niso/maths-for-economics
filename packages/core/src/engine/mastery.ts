/** Mastery and spaced-repetition rules from docs/02-architecture.md. */

export type MasteryState = 'none' | 'learning' | 'mastered';

/** A topic is mastered when its last 3 test scores are each 80 or more (decision D13). */
export const MASTERY_SCORE = 80;
export const MASTERY_STREAK = 3;
/** Scores kept per topic. */
export const SCORES_KEPT = 5;

/** Leitner box intervals in days for boxes 1 to 5; box 0 means never reviewed. */
export const LEITNER_DAYS = [1, 3, 7, 14, 30] as const;

export interface TopicProgress {
  topicId: string;
  readAt?: number;
  /** Last scores, oldest first, 0–100. */
  lastScores: number[];
  testsTaken: number;
  leitnerBox: number;
  nextReviewAt?: number;
}

export function masteryState(progress: TopicProgress | undefined): MasteryState {
  if (!progress) return 'none';
  const recent = progress.lastScores.slice(-MASTERY_STREAK);
  if (recent.length === MASTERY_STREAK && recent.every((s) => s >= MASTERY_SCORE)) {
    return 'mastered';
  }
  return progress.readAt !== undefined || progress.testsTaken > 0 ? 'learning' : 'none';
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Records one test score for a topic: keeps the last scores and moves the Leitner box
 * (80+ moves up one box; under 60 goes back to box 1; otherwise stays).
 */
export function recordScore(progress: TopicProgress, score: number, now: number): TopicProgress {
  const box =
    score >= MASTERY_SCORE
      ? Math.min(progress.leitnerBox + 1, LEITNER_DAYS.length)
      : score < 60
        ? 1
        : Math.max(progress.leitnerBox, 1);
  const days = LEITNER_DAYS[box - 1] ?? LEITNER_DAYS[0];
  return {
    ...progress,
    lastScores: [...progress.lastScores, score].slice(-SCORES_KEPT),
    testsTaken: progress.testsTaken + 1,
    leitnerBox: box,
    nextReviewAt: now + days * DAY_MS,
  };
}

/** Share of a topic's items answered correctly in one test, 0–100. */
export function topicScore(
  items: { topicId: string; correct: boolean }[],
  topicId: string,
): number {
  const mine = items.filter((i) => i.topicId === topicId);
  if (mine.length === 0) return 0;
  return Math.round((100 * mine.filter((i) => i.correct).length) / mine.length);
}

/** Topics due for review now, most overdue first. */
export function dueForReview(all: TopicProgress[], now: number): TopicProgress[] {
  return all
    .filter((p) => p.nextReviewAt !== undefined && p.nextReviewAt <= now)
    .sort((a, b) => (a.nextReviewAt ?? 0) - (b.nextReviewAt ?? 0));
}

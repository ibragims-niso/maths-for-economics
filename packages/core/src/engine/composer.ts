import { createRng } from './rng';
import type { Generator } from './types';

export type Difficulty = 1 | 2 | 3 | 'mixed';

export interface TestItemPlan {
  templateId: string;
  topicId: string;
  seed: number;
}

export interface TestPlan {
  items: TestItemPlan[];
  timeLimitSec: number;
}

/** Time factor per difficulty (docs/04): 1.0 / 1.2 / 1.5. */
const FACTOR = { 1: 1, 2: 1.2, 3: 1.5 } as const;

/**
 * Picks the questions for a test (docs/04 "Test composer"): generators spread evenly over the
 * chosen topics, never the same template twice in a row; time limit is the sum of suggested
 * times scaled by difficulty, rounded up to a whole minute.
 */
export function composeTest(options: {
  topicIds: string[];
  difficulty: Difficulty;
  count: number;
  generators: readonly Generator[];
  seed: number;
}): TestPlan {
  const rng = createRng(options.seed);
  const pool = options.generators.filter(
    (g) =>
      options.topicIds.includes(g.topicId) &&
      (options.difficulty === 'mixed' || g.difficulty === options.difficulty),
  );
  const byTopic = options.topicIds
    .map((id) => pool.filter((g) => g.topicId === id))
    .filter((gens) => gens.length > 0);
  if (byTopic.length === 0) return { items: [], timeLimitSec: 0 };

  const items: TestItemPlan[] = [];
  let seconds = 0;
  for (let i = 0; i < options.count; i++) {
    const gens = byTopic[i % byTopic.length] ?? [];
    const previous = items[items.length - 1]?.templateId;
    const choices = gens.length > 1 ? gens.filter((g) => g.id !== previous) : gens;
    const g = rng.pick(choices);
    items.push({ templateId: g.id, topicId: g.topicId, seed: rng.int(1, 2 ** 31 - 1) });
    seconds += g.timeSec * FACTOR[g.difficulty];
  }
  return { items, timeLimitSec: Math.ceil(seconds / 60) * 60 };
}

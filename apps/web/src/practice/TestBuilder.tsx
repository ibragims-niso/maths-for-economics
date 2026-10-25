import { type Difficulty, GENERATORS, randomSeed } from '@mfe/core';
import { useMemo, useState } from 'react';
import { Segmented } from '../Segmented';
import { READY, topicsForYear, YEARS } from '../topics';
import { TopicPicker } from './TopicPicker';
import { formatDuration, planTest, type RunningTest, startTest, type TestSettings } from './test';

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: 'mixed', label: 'Mixed' },
  { value: 1, label: 'Easy' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Hard' },
];
const COUNTS = [5, 10, 15].map((n) => ({ value: n, label: `${n}` }));

/** Topics that can be practised now: written, with at least one generator. In Core order. */
const PRACTICE_TOPICS = YEARS.flatMap((y) => topicsForYear(y))
  .filter((t) => READY.has(t.id) && GENERATORS.some((g) => g.topicId === t.id))
  .map((t) => t.id);

export function TestBuilder(props: {
  initial: TestSettings;
  /** Opened from "Review now": the topics due for review are already chosen. */
  review?: boolean;
  onStart: (test: RunningTest) => void;
}) {
  const [topicIds, setTopicIds] = useState(props.initial.topicIds);
  const [difficulty, setDifficulty] = useState(props.initial.difficulty);
  const [count, setCount] = useState(props.initial.count);
  // One seed per visit, so the time limit shown is the one the test will have.
  const [seed] = useState(randomSeed);

  const settings: TestSettings = { topicIds, difficulty, count };
  const plan = useMemo(
    () => planTest({ topicIds, difficulty, count }, seed),
    [topicIds, difficulty, count, seed],
  );

  const toggle = (id: string) =>
    setTopicIds((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]));

  return (
    <>
      <div className="practice-hero">
        <img src="/icons3d/calculator.webp" alt="" width="64" height="64" className="topic-icon" />
        <div>
          <h1>Practice</h1>
          <p className="topic-meta">
            {props.review
              ? 'Review: the topics due are chosen below. Start when you are ready.'
              : 'New numbers every time. Every answer is checked by code.'}
          </p>
        </div>
      </div>

      <section className="sheet sheet--page" aria-labelledby="builder-heading">
        <div className="sheet-handle" aria-hidden="true" />
        <h2 id="builder-heading">Build a test</h2>

        <TopicPicker available={PRACTICE_TOPICS} chosen={topicIds} onToggle={toggle} />

        <h3 className="pick-label">Difficulty</h3>
        <Segmented
          options={DIFFICULTIES}
          value={difficulty}
          onChange={setDifficulty}
          label="Difficulty"
          idPrefix="difficulty"
        />

        <h3 className="pick-label">Questions</h3>
        <Segmented
          options={COUNTS}
          value={count}
          onChange={setCount}
          label="Number of questions"
          idPrefix="count"
        />

        <p className="builder-summary" aria-live="polite">
          {topicIds.length === 0
            ? 'Choose at least one topic.'
            : plan.items.length === 0
              ? 'No questions at this level for these topics yet. Try Mixed.'
              : `${plan.items.length} questions · time limit ${formatDuration(plan.timeLimitSec)}`}
        </p>
        <button
          type="button"
          className="button-primary button-wide"
          disabled={plan.items.length === 0}
          onClick={() => props.onStart(startTest(settings, plan))}
        >
          Start test
        </button>
      </section>
    </>
  );
}

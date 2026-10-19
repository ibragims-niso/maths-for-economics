import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { recordTest, storage } from '../storage';
import { TestBuilder } from './TestBuilder';
import { TestResults } from './TestResults';
import { type RunnerResult, TestRunner } from './TestRunner';
import {
  gradeTest,
  type RunningTest,
  retakeTest,
  type TestOutcome,
  type TestSettings,
  toAttempt,
} from './test';

type Phase =
  | { kind: 'build' }
  | { kind: 'run'; test: RunningTest }
  | { kind: 'done'; outcome: TestOutcome };

/** Practice: build a test, take it against the clock, then review every answer (docs/07). */
export function PracticePage() {
  const [params] = useSearchParams();
  // ?topic=C107 from a topic page, ?topics=C107,F04 from "Review now" (R7).
  const topicIds = (params.get('topics') ?? params.get('topic') ?? '').split(',').filter(Boolean);
  const [settings, setSettings] = useState<TestSettings>({
    topicIds,
    difficulty: 'mixed',
    count: 5,
  });
  const [phase, setPhase] = useState<Phase>({ kind: 'build' });

  const start = (test: RunningTest) => {
    setSettings(test.settings);
    setPhase({ kind: 'run', test });
    window.scrollTo(0, 0);
  };
  const finish = (test: RunningTest, result: RunnerResult) => {
    const grades = gradeTest(test, result.answers);
    const outcome = { test, ...result, grades };
    setPhase({ kind: 'done', outcome });
    window.scrollTo(0, 0);
    recordTest(storage, toAttempt(outcome, crypto.randomUUID(), Date.now())).catch(() => {
      // Storage refused (e.g. disk full); the results on screen are still complete.
    });
  };

  if (phase.kind === 'run') {
    return <TestRunner test={phase.test} onFinish={(r) => finish(phase.test, r)} />;
  }
  if (phase.kind === 'done') {
    return (
      <TestResults
        outcome={phase.outcome}
        onRetake={() => start(retakeTest(settings))}
        onChange={() => setPhase({ kind: 'build' })}
      />
    );
  }
  return <TestBuilder initial={settings} onStart={start} />;
}

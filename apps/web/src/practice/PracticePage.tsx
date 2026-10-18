import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { TestBuilder } from './TestBuilder';
import { TestResults } from './TestResults';
import { type RunnerResult, TestRunner } from './TestRunner';
import {
  gradeTest,
  type RunningTest,
  retakeTest,
  type TestOutcome,
  type TestSettings,
} from './test';

type Phase =
  | { kind: 'build' }
  | { kind: 'run'; test: RunningTest }
  | { kind: 'done'; outcome: TestOutcome };

/** Practice: build a test, take it against the clock, then review every answer (docs/07). */
export function PracticePage() {
  const [params] = useSearchParams();
  const topic = params.get('topic');
  const [settings, setSettings] = useState<TestSettings>({
    topicIds: topic ? [topic] : [],
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
    setPhase({ kind: 'done', outcome: { test, ...result, grades } });
    window.scrollTo(0, 0);
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

import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { useBlocker } from 'react-router';
import { MathText } from '../Maths';
import { DIFFICULTY_NAME, formatClock, type RunningTest } from './test';

export interface RunnerResult {
  answers: string[];
  secondsUsed: number;
  timedOut: boolean;
}

/** One question at a time, with a countdown. The test submits itself when time runs out. */
export function TestRunner(props: { test: RunningTest; onFinish: (result: RunnerResult) => void }) {
  const { test } = props;
  const count = test.questions.length;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(() => test.questions.map(() => ''));
  const [startedAt] = useState(() => Date.now());
  const [now, setNow] = useState(startedAt);
  const finished = useRef(false);
  const input = useRef<HTMLInputElement>(null);

  const remaining = test.timeLimitSec - (now - startedAt) / 1000;
  const question = test.questions[index];
  const unanswered = answers.filter((a) => !a.trim()).length;

  const finish = (timedOut: boolean) => {
    if (finished.current) return;
    finished.current = true;
    const secondsUsed = Math.min(test.timeLimitSec, (Date.now() - startedAt) / 1000);
    props.onFinish({ answers, secondsUsed, timedOut });
  };

  const tick = useEffectEvent(() => {
    const t = Date.now();
    setNow(t);
    if (t - startedAt >= test.timeLimitSec * 1000) finish(true);
  });
  useEffect(() => {
    const timer = setInterval(() => tick(), 250);
    return () => clearInterval(timer);
  }, []);

  // No AI and no other sections while a test runs (docs/01 R3); styles.css hides them.
  useEffect(() => {
    document.documentElement.dataset.test = 'running';
    return () => {
      delete document.documentElement.dataset.test;
    };
  }, []);

  // Leaving the page by a link would lose the test, so ask first.
  const blocker = useBlocker(() => !finished.current);
  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    if (window.confirm('Leave the test? Your answers will not be kept.')) blocker.proceed();
    else blocker.reset();
  }, [blocker]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: focus moves to the answer box whenever the question changes
  useEffect(() => {
    input.current?.focus({ preventScroll: true });
  }, [index]);

  const setAnswer = (value: string) =>
    setAnswers((all) => all.map((a, i) => (i === index ? value : a)));
  const toggleSign = () => {
    const value = answers[index] ?? '';
    setAnswer(/^[-−]/.test(value) ? value.slice(1) : `-${value}`);
    input.current?.focus();
  };
  const submit = () => {
    if (
      unanswered === 0 ||
      window.confirm(
        `${unanswered} ${unanswered === 1 ? 'question has' : 'questions have'} no answer. Finish anyway?`,
      )
    ) {
      finish(false);
    }
  };
  const last = index === count - 1;

  if (!question) return null;
  return (
    <>
      <div className="runner-hero">
        <div className="runner-bar">
          <p className="runner-count">
            Question {index + 1} of {count}
          </p>
          <p className={remaining < 60 ? 'timer timer--low' : 'timer'} role="timer">
            <span className="sr-only">Time left </span>
            {formatClock(remaining)}
          </p>
        </div>
        <ol className="dots" aria-label="Questions">
          {test.questions.map((q, i) => (
            <li key={`${q.problem.templateId}-${q.problem.seed}`}>
              <button
                type="button"
                className={answers[i]?.trim() ? 'dot dot--done' : 'dot'}
                aria-current={i === index ? 'step' : undefined}
                aria-label={`Question ${i + 1}${answers[i]?.trim() ? ', answered' : ''}`}
                onClick={() => setIndex(i)}
              />
            </li>
          ))}
        </ol>
      </div>

      <section className="sheet sheet--page" aria-labelledby="question-heading">
        <div className="sheet-handle" aria-hidden="true" />
        <h2 id="question-heading" className="question-meta">
          {question.title} · {DIFFICULTY_NAME[question.difficulty]}
        </h2>
        <MathText className="question" text={question.problem.stem} />

        <form
          className="answer"
          onSubmit={(e) => {
            e.preventDefault();
            if (last) submit();
            else setIndex(index + 1);
          }}
        >
          <label htmlFor="answer-input" className="answer-label">
            Your answer
          </label>
          <div className="answer-field">
            <button
              type="button"
              className="sign-button"
              onClick={toggleSign}
              aria-label="Change sign"
            >
              ±
            </button>
            <input
              ref={input}
              id="answer-input"
              inputMode="decimal"
              autoComplete="off"
              enterKeyHint={last ? 'done' : 'next'}
              value={answers[index] ?? ''}
              onChange={(e) => setAnswer(e.target.value)}
              aria-describedby="answer-hint"
            />
          </div>
          <p className="hint" id="answer-hint">
            Decimals like 12.5 or 12,5 and fractions like 2/3 are fine.
          </p>

          <div className="runner-nav">
            <button
              type="button"
              className="button-secondary"
              disabled={index === 0}
              onClick={() => setIndex(index - 1)}
            >
              Previous
            </button>
            <button type="submit" className="button-primary">
              {last ? 'Finish test' : 'Next'}
            </button>
          </div>
        </form>
        {!last && (
          <button type="button" className="link-button" onClick={submit}>
            Finish the test now
          </button>
        )}
      </section>
    </>
  );
}

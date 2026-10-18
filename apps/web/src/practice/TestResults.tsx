import type { GradeResult } from '@mfe/core';
import { useState } from 'react';
import { AiButton } from '../ai/AiParts';
import { topicById } from '../content';
import { REPO_URL } from '../links';
import { MathBlock, MathText } from '../Maths';
import { formatAnswer, formatDuration, type TestOutcome, type TestQuestion } from './test';

/** The offline explanation for a recognised mistake, from the topic file's mistakeCodes. */
function mistakeFor(topicId: string, code: string | undefined) {
  if (!code) return undefined;
  return topicById(topicId)?.mistakeCodes[code];
}

function reportUrl(q: TestQuestion) {
  const title = `Problem error in ${q.topicId}: ${q.title}`;
  const body = [
    `Topic: ${q.topicId}`,
    `Template: ${q.problem.templateId}`,
    `Seed: ${q.problem.seed}`,
    `Parameters: ${JSON.stringify(q.problem.params)}`,
    '',
    'What is wrong:',
    '',
  ].join('\n');
  return `${REPO_URL}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
}

function Review(props: { n: number; q: TestQuestion; answer: string; grade: GradeResult }) {
  const { n, q, answer, grade } = props;
  const mistake = mistakeFor(q.topicId, grade.mistakeCode);
  const state = grade.correct ? 'correct' : answer.trim() ? 'wrong' : 'empty';
  // Wrong answers open with the solution beside them; the rest stay short until asked.
  const [open, setOpen] = useState(state === 'wrong');
  const label = { correct: 'Correct', wrong: 'Not quite', empty: 'No answer' }[state];

  return (
    <li className={`review review--${state}`}>
      <div className="review-head">
        <h3>
          {n}. {q.title}
        </h3>
        <span className="review-badge">{label}</span>
      </div>
      <MathText className="review-stem" text={q.problem.stem} />
      <dl className="review-answers">
        <div>
          <dt>Your answer</dt>
          <dd>{answer.trim() || '—'}</dd>
        </div>
        <div>
          <dt>Correct answer</dt>
          <dd>{formatAnswer(q.problem.answer)}</dd>
        </div>
      </dl>

      {state === 'wrong' &&
        (mistake ? (
          <div className="mistake">
            <p className="mistake-label">Likely mistake: {mistake.label}</p>
            <MathText className="mistake-text" text={mistake.explanation} />
          </div>
        ) : (
          <p className="mistake-text">
            This doesn't match a common mistake. Compare your working with the solution below.
          </p>
        ))}
      {state !== 'correct' && (
        <AiButton
          label="Explain more"
          request={{
            mode: 'TEST_FEEDBACK',
            topicId: q.topicId,
            payload: {
              templateId: q.problem.templateId,
              seed: q.problem.seed,
              userAnswer: answer.trim().slice(0, 40),
              ...(grade.mistakeCode ? { mistakeCode: grade.mistakeCode } : {}),
            },
          }}
        />
      )}

      <button
        type="button"
        className="why-button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? 'Hide solution' : 'Show solution'}
      </button>
      {open && (
        <ol className="steps">
          {q.problem.steps.map((step, i) => (
            <li key={step.latex} className="step">
              <p className="step-text">{step.text}</p>
              <MathBlock latex={step.latex} />
              <p className="why">{step.why}</p>
              <AiButton
                label="Explain this step"
                request={{
                  mode: 'EXPLAIN_STEP',
                  topicId: q.topicId,
                  payload: { templateId: q.problem.templateId, seed: q.problem.seed, step: i },
                }}
              />
            </li>
          ))}
        </ol>
      )}
      <a className="review-report" href={reportUrl(q)}>
        Report a problem with this question
      </a>
    </li>
  );
}

export function TestResults(props: {
  outcome: TestOutcome;
  onRetake: () => void;
  onChange: () => void;
}) {
  const { test, answers, grades, secondsUsed, timedOut } = props.outcome;
  const score = grades.filter((g) => g.correct).length;
  const total = test.questions.length;
  const percent = total ? Math.round((score / total) * 100) : 0;

  return (
    <>
      <div className="hero results-hero">
        <div className="balance">
          <p className="balance-label">Your score</p>
          <p className="balance-number">
            {score} <span className="roll">/ {total}</span>
          </p>
          <p className="results-meta">
            {percent}% · {formatDuration(secondsUsed)}
            {timedOut ? ' · time ran out' : ''}
          </p>
        </div>
        <div className="results-actions">
          <button type="button" className="button-primary" onClick={props.onRetake}>
            Practise again
          </button>
          <button type="button" className="button-secondary" onClick={props.onChange}>
            Change test
          </button>
        </div>
      </div>

      <section className="sheet sheet--page" aria-labelledby="review-heading">
        <div className="sheet-handle" aria-hidden="true" />
        <h2 id="review-heading">Review</h2>
        <p className="prose">
          Your score is saved in Progress. "Practise again" gives the same kind of questions with
          new numbers.
        </p>
        <ol className="reviews">
          {test.questions.map((q, i) => (
            <Review
              key={`${q.problem.templateId}-${q.problem.seed}`}
              n={i + 1}
              q={q}
              answer={answers[i] ?? ''}
              grade={grades[i] ?? { correct: false, value: null }}
            />
          ))}
        </ol>
      </section>
    </>
  );
}

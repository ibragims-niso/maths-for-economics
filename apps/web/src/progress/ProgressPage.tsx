import { dueForReview, masteryState, type TopicProgress } from '@mfe/core';
import { Link } from 'react-router';
import { topicById } from '../content';
import { type TestAttempt, useProgress, useRecentAttempts } from '../storage';
import { icon3d, STATUS_LABEL, topicsForYear, topicTitle, YEARS } from '../topics';

const day = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });
const dayTime = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

/** Topics in Core order, so lists read like the curriculum. */
const ORDER = new Map(YEARS.flatMap((y) => topicsForYear(y)).map((t, i) => [t.id, i]));
const byCurriculum = (a: TopicProgress, b: TopicProgress) =>
  (ORDER.get(a.topicId) ?? 0) - (ORDER.get(b.topicId) ?? 0);

function topicLine(p: TopicProgress): string {
  const last = p.lastScores.at(-1);
  const parts = [last === undefined ? 'Read, not tested yet' : `Last score ${last}%`];
  if (p.nextReviewAt) parts.push(`review ${day.format(p.nextReviewAt)}`);
  return parts.join(' · ');
}

/** Labels of the recognised mistakes in a test, each once. */
function mistakesIn(attempt: TestAttempt): string[] {
  const labels = attempt.items.flatMap((i) => {
    const label = i.mistakeCode && topicById(i.topicId)?.mistakeCodes[i.mistakeCode]?.label;
    return label ? [label] : [];
  });
  return [...new Set(labels)];
}

function Empty() {
  return (
    <div className="empty">
      <img className="empty-icon" src={icon3d('trophy')} alt="" width="112" height="112" />
      <h1>Progress</h1>
      <p className="empty-text">
        Nothing yet. Read a topic to the end or take a test, and your progress shows here.
      </p>
      <div className="results-actions">
        <Link to="/" className="button-secondary" viewTransition>
          See the topics
        </Link>
        <Link to="/practice" className="button-primary" viewTransition>
          Build a test
        </Link>
      </div>
    </div>
  );
}

export function ProgressPage() {
  const progress = useProgress();
  const attempts = useRecentAttempts(20);
  if (!progress || !attempts) return null;

  const all = [...progress.values()].sort(byCurriculum);
  if (all.length === 0 && attempts.length === 0) return <Empty />;

  const stateOf = (id: string) => masteryState(progress.get(id));
  const mastered = all.filter((p) => masteryState(p) === 'mastered').length;
  const learning = all.filter((p) => masteryState(p) === 'learning').length;
  const due = dueForReview(all, Date.now());

  return (
    <>
      <div className="hero">
        <div className="balance">
          <p className="balance-label">Topics mastered</p>
          <p className="balance-number">
            {mastered} <span>/ {ORDER.size}</span>
          </p>
          <p className="results-meta">
            {learning} learning · {attempts.length === 20 ? '20+' : attempts.length}{' '}
            {attempts.length === 1 ? 'test' : 'tests'} taken
          </p>
        </div>
        <ul className="year-bars" aria-label="Mastered by year">
          {YEARS.map((y) => {
            const topics = topicsForYear(y);
            const done = topics.filter((t) => stateOf(t.id) === 'mastered').length;
            return (
              <li key={y}>
                <span className="year-bar-label">Year {y}</span>
                <span className="year-bar">
                  <span style={{ width: `${(100 * done) / topics.length}%` }} />
                </span>
                <span className="year-bar-count">
                  {done} / {topics.length}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <section className="sheet sheet--page" aria-label="Your progress">
        <div className="sheet-handle" aria-hidden="true" />

        {due.length > 0 && (
          <>
            <h2>Due for review</h2>
            <ul className="rows">
              {due.map((p) => (
                <li key={p.topicId}>
                  <Link
                    to={`/practice?topic=${p.topicId}`}
                    className="row row--link"
                    viewTransition
                  >
                    <span className="row-text">
                      <span className="row-title">{topicTitle(p.topicId)}</span>
                      <span className="row-use">{topicLine(p)}</span>
                    </span>
                    <span className="row-status row-status--none">Review</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        <h2>Your topics</h2>
        <ul className="rows">
          {all.map((p) => (
            <li key={p.topicId}>
              <Link to={`/topic/${p.topicId}`} className="row row--link" viewTransition>
                <span className="row-text">
                  <span className="row-title">{topicTitle(p.topicId)}</span>
                  <span className="row-use">{topicLine(p)}</span>
                </span>
                <span className={`row-status row-status--${masteryState(p)}`}>
                  {STATUS_LABEL[masteryState(p)]}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {attempts.length > 0 && (
          <>
            <h2>Recent tests</h2>
            <ul className="rows">
              {attempts.map((a) => {
                const score = a.items.filter((i) => i.correct).length;
                const mistakes = mistakesIn(a);
                return (
                  <li key={a.id} className="row">
                    <span className="row-text">
                      <span className="row-title">{a.topicIds.map(topicTitle).join(', ')}</span>
                      <span className="row-use">
                        {dayTime.format(a.finishedAt)}
                        {a.timedOut ? ' · time ran out' : ''}
                      </span>
                      {mistakes.length > 0 && (
                        <span className="row-use">Mistakes: {mistakes.join('; ')}</span>
                      )}
                    </span>
                    <span className="row-status">
                      {score} / {a.items.length}
                    </span>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>
    </>
  );
}

import type { Snapshot } from '@mfe/core';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { mistakeFor } from '../content';
import { icon3d, STATUS_LABEL, topicTitle } from '../topics';

const when = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

type Load =
  | { kind: 'loading' }
  | { kind: 'missing'; message: string }
  | { kind: 'ok'; data: Snapshot };

/** The mentor's read-only view of a student's progress (docs/07 "/m/:token", R11). */
export function MentorPage() {
  const { token = '' } = useParams();
  const [load, setLoad] = useState<Load>({ kind: 'loading' });

  useEffect(() => {
    fetch(`/api/mentor/${encodeURIComponent(token)}`)
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        setLoad(
          res.ok
            ? { kind: 'ok', data: body as Snapshot }
            : {
                kind: 'missing',
                message: (body as { error?: string }).error ?? 'This link is not shared.',
              },
        );
      })
      .catch(() =>
        setLoad({ kind: 'missing', message: 'No internet. This page needs a connection.' }),
      );
  }, [token]);

  if (load.kind === 'loading') return <p className="page">Loading…</p>;
  if (load.kind === 'missing') {
    return (
      <div className="empty">
        <img className="empty-icon" src={icon3d('zoom')} alt="" width="112" height="112" />
        <h1>Progress not available</h1>
        <p className="empty-text">{load.message}</p>
      </div>
    );
  }

  const s = load.data;
  const mastered = s.years.reduce((n, y) => n + y.mastered, 0);
  const total = s.years.reduce((n, y) => n + y.total, 0);
  const mistakeLabel = (topicId: string, code: string) => mistakeFor(topicId, code)?.label ?? code;

  return (
    <>
      <div className="hero">
        <div className="balance">
          <p className="balance-label">A student's progress · read-only</p>
          <p className="balance-number">
            {mastered} <span>/ {total}</span>
          </p>
          <p className="results-meta">
            topics mastered in {s.trackName} · updated {when.format(s.updatedAt)}
          </p>
        </div>
        <ul className="year-bars" aria-label="Mastered by year">
          {s.years.map((y) => (
            <li key={y.year}>
              <span className="year-bar-label">Year {y.year}</span>
              <span className="year-bar">
                <span style={{ width: `${(100 * y.mastered) / Math.max(1, y.total)}%` }} />
              </span>
              <span className="year-bar-count">
                {y.mastered} / {y.total}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <section className="sheet sheet--page" aria-label="Details">
        <div className="sheet-handle" aria-hidden="true" />
        <h2>Topics in progress</h2>
        {s.topics.length === 0 && <p className="prose">No topics started yet.</p>}
        <ul className="rows">
          {s.topics.map((t) => (
            <li key={t.id} className="row">
              <span className="row-text">
                <span className="row-title">{topicTitle(t.id)}</span>
                <span className="row-use">
                  {t.lastScore === undefined
                    ? 'Read, not tested yet'
                    : `Last score ${t.lastScore}%`}
                  {' · '}
                  {t.testsTaken} {t.testsTaken === 1 ? 'test' : 'tests'}
                </span>
              </span>
              <span className={`row-status row-status--${t.state}`}>{STATUS_LABEL[t.state]}</span>
            </li>
          ))}
        </ul>

        {s.tests.length > 0 && (
          <>
            <h2>Recent tests</h2>
            <ul className="rows">
              {s.tests.map((t) => {
                const mistakes = [
                  ...new Set(t.mistakes.map((m) => mistakeLabel(m.topicId, m.code))),
                ];
                return (
                  <li key={t.finishedAt} className="row">
                    <span className="row-text">
                      <span className="row-title">{t.topicIds.map(topicTitle).join(', ')}</span>
                      <span className="row-use">{when.format(t.finishedAt)}</span>
                      {mistakes.length > 0 && (
                        <span className="row-use">Mistakes: {mistakes.join('; ')}</span>
                      )}
                    </span>
                    <span className="row-status">
                      {t.correct} / {t.total}
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

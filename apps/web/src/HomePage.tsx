import { type MasteryState, masteryState } from '@mfe/core';
import { Fragment, useState } from 'react';
import { Link } from 'react-router';
import { useAppOfflineStatus } from './AppShell';
import { InstallHint } from './InstallHint';
import { Segmented } from './Segmented';
import { useProgress } from './storage';
import { bankTopic, READY, STATUS_LABEL } from './topics';
import { learnGroups, useTrack, yearTopics } from './tracks';
import { useInstallOption } from './useInstallOption';

const YEAR_KEY = 'mfe.learn.year';

function savedYear(): number {
  try {
    return Number(localStorage.getItem(YEAR_KEY)) || 1;
  } catch {
    return 1;
  }
}

/** One topic: a link once it is written, "Soon" until then. */
function TopicRow({ id, state }: { id: string; state: MasteryState }) {
  const topic = bankTopic(id);
  if (!topic) return null;
  const text = (
    <span className="row-text">
      <span className="row-title">{topic.title}</span>
      <span className="row-use">{topic.economicUse}</span>
    </span>
  );
  return READY.has(id) ? (
    <Link to={`/topic/${id}`} className="row row--link" viewTransition>
      {text}
      <span className={`row-status row-status--${state}`}>{STATUS_LABEL[state]}</span>
    </Link>
  ) : (
    <div className="row">
      {text}
      <span className="row-status">Soon</span>
    </div>
  );
}

/** The signature: mastery read like an account balance. The total rolls in when the year changes. */
function Balance({ year, mastered, total }: { year: number; mastered: number; total: number }) {
  return (
    <div className="balance">
      <p className="balance-label">Topics mastered in year {year}</p>
      <p className="balance-number">
        {mastered}{' '}
        <span key={total} className="roll">
          / {total}
        </span>
      </p>
    </div>
  );
}

/** Remounted per year (see `key` below), so the curve draws itself again on every switch. */
function MasteryCurve() {
  return (
    <figure className="curve">
      <svg viewBox="0 0 390 120" aria-hidden="true">
        <defs>
          <linearGradient id="curve-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--violet)" stopOpacity=".28" />
            <stop offset="1" stopColor="var(--violet)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          className="curve-area"
          d="M0 106 C40 106 62 88 88 86 S146 50 196 56 S266 26 306 34 S362 12 390 16 L390 120 L0 120Z"
        />
        <path className="curve-ahead" d="M88 86 S146 50 196 56 S266 26 306 34 S362 12 390 16" />
        <path className="curve-done" d="M0 106 C30 106 62 96 88 86" />
        <circle className="curve-point" cx="88" cy="86" r="7" />
      </svg>
      <span className="curve-tip">You start here</span>
      <figcaption className="sr-only">
        Your mastery curve starts at zero and rises as you master topics.
      </figcaption>
    </figure>
  );
}

/** Offline status and install, in one compact strip at the top of the sheet. */
function PhoneStrip() {
  const status = useAppOfflineStatus();
  const option = useInstallOption();
  return (
    <section className="phone-strip" aria-label="Offline and install">
      <p className="status" role="status">
        <span className={`status-dot status-dot--${status.tone}`} aria-hidden="true" />
        {status.message}
      </p>
      {option.kind === 'prompt' && (
        <button type="button" className="button-small" onClick={option.install}>
          Install
        </button>
      )}
      {(option.kind === 'ios' || option.kind === 'manual') && (
        <details className="phone-how">
          <summary>How to install</summary>
          <InstallHint option={option} />
        </details>
      )}
    </section>
  );
}

export function HomePage() {
  const track = useTrack();
  const [chosenYear, setYear] = useState(savedYear);
  // A year the chosen programme does not have falls back to its first year.
  const trackYear = track.years.find((y) => y.year === chosenYear) ?? track.years[0];
  const year = trackYear?.year ?? 1;
  const topics = yearTopics(track, year);
  const groups = learnGroups(track, year);
  const progress = useProgress();
  const state = (id: string) => masteryState(progress?.get(id));
  const mastered = topics.filter((id) => state(id) === 'mastered').length;
  const yearOptions = track.years.map((y) => ({ value: y.year, label: `Year ${y.year}` }));

  const changeYear = (next: number) => {
    setYear(next);
    try {
      localStorage.setItem(YEAR_KEY, String(next));
    } catch {
      // Storage can be unavailable (private mode); the choice then lasts for this visit.
    }
  };

  return (
    <>
      <h1 className="sr-only">Learn</h1>
      <div className="hero">
        <Balance year={year} mastered={mastered} total={topics.length} />
        <Segmented
          options={yearOptions}
          value={year}
          onChange={changeYear}
          label="Year of study"
          controls="year-topics"
          idPrefix="year-tab"
        />
        <MasteryCurve key={year} />
      </div>

      <section className="sheet" aria-labelledby="sheet-heading">
        <div className="sheet-handle" aria-hidden="true" />
        <PhoneStrip />
        <div className="sheet-head">
          <h2 id="sheet-heading">{trackYear?.label ?? `Year ${year}`}</h2>
          <span className="sheet-count">{topics.length} topics</span>
        </div>
        {track.id !== 'core' && <p className="sheet-track">{track.name}</p>}
        <div id="year-topics" role="tabpanel" aria-labelledby={`year-tab-${year}`}>
          {groups.map((g, i) => (
            <Fragment key={g.key}>
              {g.course && <p className="course-heading">{g.course}</p>}
              <section className="group" aria-labelledby={`group-${year}-${i}`}>
                <div className="group-head">
                  <img className="group-icon" src={g.icon} alt="" width="46" height="46" />
                  <h3 id={`group-${year}-${i}`}>{g.name}</h3>
                  <span className="group-count">
                    {g.background ? 'not counted' : g.topicIds.length}
                  </span>
                </div>
                <ul className="rows">
                  {g.topicIds.map((id) => (
                    <li key={id}>
                      <TopicRow id={id} state={state(id)} />
                    </li>
                  ))}
                </ul>
              </section>
            </Fragment>
          ))}
        </div>
      </section>
    </>
  );
}

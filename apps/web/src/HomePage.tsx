import { type KeyboardEvent, useState } from 'react';
import { useAppOfflineStatus } from './AppShell';
import { InstallHint } from './InstallHint';
import { groupByBlock, topicsForYear, WRITING_NOW, YEARS } from './topics';
import { useInstallOption } from './useInstallOption';

const YEAR_KEY = 'mfe.learn.year';

function initialYear(): number {
  try {
    const saved = Number(localStorage.getItem(YEAR_KEY));
    return YEARS.includes(saved as (typeof YEARS)[number]) ? saved : 1;
  } catch {
    return 1;
  }
}

/** The signature: mastery read like an account balance. The total rolls in when the year changes. */
function Balance({ year, total }: { year: number; total: number }) {
  return (
    <div className="balance">
      <p className="balance-label">Topics mastered in year {year}</p>
      <p className="balance-number">
        0{' '}
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

function YearSwitch({ year, onChange }: { year: number; onChange: (year: number) => void }) {
  const index = YEARS.indexOf(year as (typeof YEARS)[number]);
  const move = (e: KeyboardEvent, step: number) => {
    e.preventDefault();
    const next = YEARS[(index + step + YEARS.length) % YEARS.length] ?? 1;
    onChange(next);
    document.getElementById(`year-tab-${next}`)?.focus();
  };
  return (
    <div className="segmented" role="tablist" aria-label="Year of study">
      <span
        className="segmented-pill"
        style={{ translate: `${index * 100}% 0` }}
        aria-hidden="true"
      />
      {YEARS.map((y) => (
        <button
          key={y}
          id={`year-tab-${y}`}
          type="button"
          role="tab"
          aria-selected={y === year}
          aria-controls="year-topics"
          tabIndex={y === year ? 0 : -1}
          onClick={() => onChange(y)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') move(e, 1);
            if (e.key === 'ArrowLeft') move(e, -1);
          }}
        >
          Year {y}
        </button>
      ))}
    </div>
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
  const [year, setYear] = useState(initialYear);
  const topics = topicsForYear(year);
  const groups = groupByBlock(topics);

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
        <Balance year={year} total={topics.length} />
        <YearSwitch year={year} onChange={changeYear} />
        <MasteryCurve key={year} />
      </div>

      <section className="sheet" aria-labelledby="sheet-heading">
        <div className="sheet-handle" aria-hidden="true" />
        <PhoneStrip />
        <div className="sheet-head">
          <h2 id="sheet-heading">Year {year} topics</h2>
          <span className="sheet-count">{topics.length} topics</span>
        </div>
        <div id="year-topics" role="tabpanel" aria-labelledby={`year-tab-${year}`}>
          {groups.map((g) => (
            <section key={g.block} className="group" aria-labelledby={`group-${g.block}`}>
              <div className="group-head">
                <img className="group-icon" src={g.icon} alt="" width="46" height="46" />
                <h3 id={`group-${g.block}`}>{g.name}</h3>
                <span className="group-count">{g.topics.length}</span>
              </div>
              <ul className="rows">
                {g.topics.map((t) => {
                  const writing = WRITING_NOW.has(t.id);
                  return (
                    <li key={t.id} className="row">
                      <span className="row-text">
                        <span className="row-title">{t.title}</span>
                        <span className="row-use">{t.economicUse}</span>
                      </span>
                      <span className={writing ? 'row-status row-status--writing' : 'row-status'}>
                        {writing ? 'Writing' : 'Soon'}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </section>
    </>
  );
}

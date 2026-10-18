import topicBank from '../../../content/topic-bank.json';
import { GRID, layoutCurriculum } from './curriculum-map';

const layout = layoutCurriculum(topicBank);
const percent = (x: number) => `${(x / layout.width) * 100}%`;

function LegendPoint({ writing }: { writing?: boolean }) {
  return (
    <svg className="legend-point" viewBox="-6 -6 12 12" aria-hidden="true">
      <circle
        r={writing ? 5 : 3.5}
        className={writing ? 'map-point map-point--writing' : 'map-point'}
      />
    </svg>
  );
}

/**
 * The signature element (docs/07): every topic of the degree as a point on graph paper,
 * linked to the topics it builds on. Static until topics exist (Phase 1 adds tap and years).
 */
export function CurriculumMap({ writing }: { writing: readonly string[] }) {
  const isWriting = (id: string) => writing.includes(id);
  // Draw the links into topics being written last, so they sit on top.
  const links = [...layout.links].sort((a, b) => Number(isWriting(a.to)) - Number(isWriting(b.to)));

  return (
    <figure className="map">
      <div className="map-sheet">
        <svg viewBox={`0 0 ${layout.width} ${layout.height}`} aria-hidden="true">
          <defs>
            <pattern id="map-grid" width={GRID} height={GRID} patternUnits="userSpaceOnUse">
              <path d={`M${GRID} 0V${GRID}M0 ${GRID}H${GRID}`} className="map-grid" />
            </pattern>
          </defs>
          <rect width={layout.width} height={layout.height} fill="url(#map-grid)" />
          {layout.dividers.map((x) => (
            <line key={x} x1={x} y1={0} x2={x} y2={layout.height} className="map-divider" />
          ))}
          {links.map((l) => (
            <path
              key={`${l.from}-${l.to}`}
              d={l.d}
              className={isWriting(l.to) ? 'map-link map-link--writing' : 'map-link'}
            />
          ))}
          {layout.points.map((p) => (
            <circle
              key={p.id}
              cx={p.x}
              cy={p.y}
              r={isWriting(p.id) ? 5 : 3.5}
              className={isWriting(p.id) ? 'map-point map-point--writing' : 'map-point'}
            />
          ))}
        </svg>
        <div className="map-years" aria-hidden="true">
          {layout.years.map((y) => (
            <span key={y.year} className="map-year" style={{ left: percent(y.x) }}>
              <span className="map-year-name">Year {y.year}</span>
              <span className="map-year-count">{y.count} topics</span>
            </span>
          ))}
        </div>
      </div>
      <figcaption>
        <span className="map-legend">
          <span>
            <LegendPoint writing /> Being written
          </span>
          <span>
            <LegendPoint /> Planned
          </span>
        </span>
        Each point is a topic, from year 1 on the left to year 4 on the right. Lines join a topic to
        the ones it builds on.
      </figcaption>
    </figure>
  );
}

/** The map's content as text: every topic by year, for browsing and for screen readers. */
export function TopicIndex({ writing }: { writing: readonly string[] }) {
  return (
    <details className="topic-index">
      <summary>
        <svg className="chevron" viewBox="0 0 14 14" aria-hidden="true">
          <path d="M5 2.5 9.5 7 5 11.5" />
        </svg>
        All {topicBank.length} topics
      </summary>
      {layout.years.map((y) => (
        <section key={y.year} aria-labelledby={`index-year-${y.year}`}>
          <h3 id={`index-year-${y.year}`}>
            Year {y.year} <span className="topic-index-count">{y.count} topics</span>
          </h3>
          <ol>
            {topicBank
              .filter((t) => t.coreYear === y.year)
              .map((t) => (
                <li key={t.id}>
                  {t.title}
                  {writing.includes(t.id) && (
                    <span className="topic-index-note"> (being written)</span>
                  )}
                </li>
              ))}
          </ol>
        </section>
      ))}
    </details>
  );
}

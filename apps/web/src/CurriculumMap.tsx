import topicBank from '../../../content/topic-bank.json';
import { GRID, layoutCurriculum } from './curriculum-map';
import { WRITING_NOW } from './topics';

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
 * The whole degree at a glance, shown at the top of About (owner's request): every topic as a
 * point, linked to the topics it builds on, years 1 to 4 from left to right.
 */
export function CurriculumMap() {
  const isWriting = (id: string) => WRITING_NOW.has(id);
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
            <span
              key={y.year}
              className="map-year"
              style={{ left: percent(y.x), width: percent(y.width) }}
            >
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

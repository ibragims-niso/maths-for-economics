import topicBank from '../../../content/topic-bank.json';
import { GRID, layoutCurriculum } from './curriculum-map';
import { READY } from './topics';

const layout = layoutCurriculum(topicBank);

/**
 * The whole degree at a glance, as a small emblem at the top of About (owner's request): every
 * topic is a point, linked to the topics it builds on, years 1 to 4 from left to right. Written
 * topics are gold.
 */
export function CurriculumMap() {
  const ready = (id: string) => READY.has(id);
  // Draw the links into written topics last, so they sit on top.
  const links = [...layout.links].sort((a, b) => Number(ready(a.to)) - Number(ready(b.to)));

  return (
    <svg
      className="map"
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      role="img"
      aria-label={`Map of all ${layout.points.length} topics, years 1 to 4 from left to right`}
    >
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
          className={ready(l.to) ? 'map-link map-link--ready' : 'map-link'}
        />
      ))}
      {layout.points.map((p) => (
        <circle
          key={p.id}
          cx={p.x}
          cy={p.y}
          r={ready(p.id) ? 10 : 7}
          className={ready(p.id) ? 'map-point map-point--ready' : 'map-point'}
        />
      ))}
    </svg>
  );
}

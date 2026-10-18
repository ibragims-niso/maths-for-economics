import { type ReactNode, useId } from 'react';

/**
 * Building blocks for topic widgets: a graph frame with axes, curves, points and areas, a slider
 * and a read-out panel. They use the .widget-* styles, so every widget looks the same.
 */

/** The visible window of a graph, in the maths units of the two axes. */
export interface Frame {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

const W = 320;
const H = 214;
const LEFT = 40;
const RIGHT = 306;
const TOP = 16;
const BOTTOM = 190;

export const sx = (f: Frame, x: number) =>
  LEFT + ((x - f.xMin) / (f.xMax - f.xMin)) * (RIGHT - LEFT);
export const sy = (f: Frame, y: number) =>
  BOTTOM - ((y - f.yMin) / (f.yMax - f.yMin)) * (BOTTOM - TOP);

const clampY = (f: Frame, y: number) => Math.min(Math.max(y, f.yMin), f.yMax);

/** The SVG path of y = fn(x) between `from` and `to`, cut off where it leaves the frame. */
export function curvePath(f: Frame, fn: (x: number) => number, from = f.xMin, to = f.xMax) {
  const steps = 120;
  let d = '';
  let pen = false;
  for (let i = 0; i <= steps; i++) {
    const x = from + ((to - from) * i) / steps;
    const y = fn(x);
    if (!Number.isFinite(y) || y < f.yMin - 1e-9 || y > f.yMax + 1e-9) {
      pen = false;
      continue;
    }
    d += `${pen ? 'L' : 'M'}${sx(f, x).toFixed(1)} ${sy(f, y).toFixed(1)}`;
    pen = true;
  }
  return d;
}

type Tone = 'lilac' | 'green' | 'gold';
const LINE_CLASS: Record<Tone, string> = {
  lilac: 'widget-demand',
  green: 'widget-supply',
  gold: 'widget-wedge',
};
const FILL: Record<Tone, string> = {
  lilac: 'rgb(184 140 255 / 0.22)',
  green: 'rgb(47 209 130 / 0.2)',
  gold: 'rgb(245 192 74 / 0.2)',
};

/** Axes with their names and a few tick values. Put curves, points and areas inside. */
export function Plot({
  frame,
  xLabel,
  yLabel,
  xTicks = [],
  yTicks = [],
  children,
}: {
  frame: Frame;
  xLabel: string;
  yLabel: string;
  xTicks?: number[];
  yTicks?: number[];
  children: ReactNode;
}) {
  const clip = useId();
  const x0 = sx(frame, Math.max(frame.xMin, Math.min(0, frame.xMax)));
  const y0 = sy(frame, Math.max(frame.yMin, Math.min(0, frame.yMax)));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <defs>
        <clipPath id={clip}>
          <rect x={LEFT} y={TOP - 4} width={RIGHT - LEFT + 4} height={BOTTOM - TOP + 4} />
        </clipPath>
      </defs>
      <path className="widget-axis" d={`M${LEFT} ${TOP - 6}V${BOTTOM}H${RIGHT + 6}`} />
      {y0 !== BOTTOM && (
        <path className="widget-axis" d={`M${LEFT} ${y0}H${RIGHT + 6}`} strokeDasharray="2 4" />
      )}
      {x0 !== LEFT && (
        <path className="widget-axis" d={`M${x0} ${TOP - 6}V${BOTTOM}`} strokeDasharray="2 4" />
      )}
      {xTicks.map((t) => (
        <text
          key={`x${t}`}
          className="widget-label"
          x={sx(frame, t)}
          y={BOTTOM + 16}
          textAnchor="middle"
        >
          {fmt(t)}
        </text>
      ))}
      {yTicks.map((t) => (
        <text
          key={`y${t}`}
          className="widget-label"
          x={LEFT - 6}
          y={sy(frame, t) + 4}
          textAnchor="end"
        >
          {fmt(t)}
        </text>
      ))}
      <text className="widget-label" x={LEFT + 6} y={TOP + 2}>
        {yLabel}
      </text>
      <text className="widget-label" x={RIGHT + 6} y={BOTTOM - 8} textAnchor="end">
        {xLabel}
      </text>
      <g clipPath={`url(#${clip})`}>{children}</g>
    </svg>
  );
}

/** The graph of y = fn(x). */
export function Curve({
  frame,
  fn,
  from,
  to,
  tone = 'lilac',
  dashed = false,
}: {
  frame: Frame;
  fn: (x: number) => number;
  from?: number;
  to?: number;
  tone?: Tone;
  dashed?: boolean;
}) {
  return (
    <path
      className={LINE_CLASS[tone]}
      d={curvePath(frame, fn, from, to)}
      fill="none"
      strokeDasharray={dashed ? '6 6' : undefined}
    />
  );
}

/** A straight segment between two points in maths units. */
export function Segment({
  frame,
  from,
  to,
  tone = 'gold',
  dashed = false,
}: {
  frame: Frame;
  from: [number, number];
  to: [number, number];
  tone?: Tone;
  dashed?: boolean;
}) {
  return (
    <line
      className={LINE_CLASS[tone]}
      x1={sx(frame, from[0])}
      y1={sy(frame, from[1])}
      x2={sx(frame, to[0])}
      y2={sy(frame, to[1])}
      strokeDasharray={dashed ? '6 6' : undefined}
    />
  );
}

/** Dotted lines from a point down to the horizontal axis and across to the vertical one. */
export function Guides({ frame, x, y }: { frame: Frame; x: number; y: number }) {
  const px = sx(frame, x);
  const py = sy(frame, clampY(frame, y));
  return (
    <path
      className="widget-axis"
      d={`M${px} ${BOTTOM}V${py}H${LEFT}`}
      strokeDasharray="3 4"
      opacity={0.8}
    />
  );
}

/** A marked point; hollow for a second, contrasting point. */
export function Dot({
  frame,
  x,
  y,
  hollow = false,
}: {
  frame: Frame;
  x: number;
  y: number;
  hollow?: boolean;
}) {
  return (
    <circle
      className={hollow ? 'widget-point widget-point--hollow' : 'widget-point'}
      cx={sx(frame, x)}
      cy={sy(frame, clampY(frame, y))}
      r={hollow ? 5 : 6}
    />
  );
}

/** A shaded region: a polygon through points, or the area between y = top(x) and y = bottom(x). */
export function Area({
  frame,
  points,
  top,
  bottom = () => 0,
  from = frame.xMin,
  to = frame.xMax,
  tone = 'gold',
}: {
  frame: Frame;
  points?: [number, number][];
  top?: (x: number) => number;
  bottom?: (x: number) => number;
  from?: number;
  to?: number;
  tone?: Tone;
}) {
  let pts: [number, number][] = points ?? [];
  if (!points && top) {
    const steps = 60;
    const xs = Array.from({ length: steps + 1 }, (_, i) => from + ((to - from) * i) / steps);
    pts = [
      ...xs.map((x) => [x, top(x)] as [number, number]),
      ...xs.reverse().map((x) => [x, bottom(x)] as [number, number]),
    ];
  }
  const d = pts
    .map(
      ([x, y], i) =>
        `${i === 0 ? 'M' : 'L'}${sx(frame, x).toFixed(1)} ${sy(frame, clampY(frame, y)).toFixed(1)}`,
    )
    .join('');
  return <path d={`${d}Z`} fill={FILL[tone]} stroke="none" />;
}

/** A short text label at a point of the graph. */
export function Note({
  frame,
  x,
  y,
  children,
  anchor = 'start',
}: {
  frame: Frame;
  x: number;
  y: number;
  children: ReactNode;
  anchor?: 'start' | 'middle' | 'end';
}) {
  return (
    <text className="widget-label" x={sx(frame, x)} y={sy(frame, y)} textAnchor={anchor}>
      {children}
    </text>
  );
}

/** A labelled range slider with its current value. */
export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format = fmt,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
}) {
  const id = useId();
  return (
    <label className="widget-control" htmlFor={id}>
      <span>
        {label} <output htmlFor={id}>{format(value)}</output>
      </span>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(ev) => onChange(Number(ev.target.value))}
      />
    </label>
  );
}

/** Up to three named values under the graph; updates are announced to screen readers. */
export function Readout({ items }: { items: [label: string, value: string][] }) {
  return (
    <dl className="widget-readout" aria-live="polite">
      {items.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** A number for a widget: up to `decimals` places, trailing zeros dropped, minus sign as "−". */
export function fmt(value: number, decimals = 2): string {
  const fixed = Number(value.toFixed(decimals));
  const text = Math.abs(fixed).toLocaleString('en-GB', { maximumFractionDigits: decimals });
  return fixed < 0 ? `−${text}` : text;
}

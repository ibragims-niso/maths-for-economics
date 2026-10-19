import { useState } from 'react';
import { Curve, Dot, type Frame, fmt, Note, Plot, Readout, Segment, Slider } from './kit';

type Vec = [number, number];

// The plot area is 266 × 174 pixels; one unit is the same length on both axes, so ellipses
// and the eigenvector directions keep their true shape on the screen.
const Y_HALF = 3;
const X_HALF = (Y_HALF * 266) / 174;
const FRAME: Frame = { xMin: -X_HALF, xMax: X_HALF, yMin: -Y_HALF, yMax: Y_HALF };
/** Contour heights: Q = ±1, ±4, ±9, ±16. */
const LEVELS = [1, 4, 9, 16];

export type Verdict =
  | 'positive definite'
  | 'negative definite'
  | 'indefinite'
  | 'positive semidefinite'
  | 'negative semidefinite'
  | 'zero form';

/** Q(x, y) = ax² + bxy + cy². */
export const quadForm = (a: number, b: number, c: number, x: number, y: number) =>
  a * x * x + b * x * y + c * y * y;

/** The leading principal minors of A = (a, b/2; b/2, c): D₁ = a and D₂ = ac − b²/4. */
export const minors = (a: number, b: number, c: number): Vec => [a, a * c - (b * b) / 4];

/** The eigenvalues of the symmetric matrix A, larger first; they are always real. */
export function eigenvalues(a: number, b: number, c: number): Vec {
  const s = Math.sqrt((a - c) ** 2 + b * b);
  return [(a + c + s) / 2, (a + c - s) / 2];
}

/** Unit eigenvectors of A for its two eigenvalues (perpendicular, as A is symmetric). */
export function eigenvectors(a: number, b: number, c: number): [Vec, Vec] {
  const [l1] = eigenvalues(a, b, c);
  // Row 1 of (A − λI)v = 0: (a − λ)v₁ + (b/2)v₂ = 0, so v = (b/2, λ − a) when b ≠ 0.
  let v: Vec = b !== 0 ? [b / 2, l1 - a] : a >= c ? [1, 0] : [0, 1];
  const r = Math.hypot(v[0], v[1]);
  v = [v[0] / r, v[1] / r];
  return [v, [-v[1], v[0]]];
}

/** What the signs of D₁ and D₂ say about the form (Sylvester's criterion for 2×2). */
export function classify(a: number, b: number, c: number): Verdict {
  const [D1, D2] = minors(a, b, c);
  if (D2 > 0) return D1 > 0 ? 'positive definite' : 'negative definite';
  if (D2 < 0) return 'indefinite';
  // D₂ = 0: a and c have the same sign or are zero; whichever is non-zero decides.
  if (a > 0 || c > 0) return 'positive semidefinite';
  if (a < 0 || c < 0) return 'negative semidefinite';
  return 'zero form';
}

/** One piece of a contour: either y = fn(x) on [from, to], or a vertical line x = at. */
export type Piece = { fn: (x: number) => number; from: number; to: number } | { at: number };

/**
 * Splits y = fn(x) on [from, to] into the stretches that stay inside the frame, with ends found
 * by bisection, so steep branches reach the edge of the picture instead of stopping short.
 */
export function insideSpans(fn: (x: number) => number, from: number, to: number, f = FRAME): Vec[] {
  const inside = (x: number) => {
    const y = fn(x);
    return Number.isFinite(y) && y >= f.yMin && y <= f.yMax;
  };
  const edge = (good: number, bad: number) => {
    let [g, b] = [good, bad];
    for (let i = 0; i < 40; i++) {
      const mid = (g + b) / 2;
      if (inside(mid)) g = mid;
      else b = mid;
    }
    return g;
  };
  const n = 400;
  const spans: Vec[] = [];
  let start: number | null = null;
  let prev = from;
  for (let i = 0; i <= n; i++) {
    const x = from + ((to - from) * i) / n;
    if (inside(x)) {
      if (start === null) start = i === 0 ? x : edge(x, prev);
    } else if (start !== null) {
      spans.push([start, edge(prev, x)]);
      start = null;
    }
    prev = x;
  }
  if (start !== null) spans.push([start, to]);
  return spans.filter(([s, e]) => e > s);
}

/**
 * The contour Q = k inside the frame, as pieces the kit can draw. For c ≠ 0 solve
 * cy² + bxy + ax² − k = 0 for y: y = (−bx ± √Δ)/(2c) with Δ = (b² − 4ac)x² + 4ck.
 */
export function contour(a: number, b: number, c: number, k: number, f = FRAME): Piece[] {
  if (c !== 0) {
    const m = b * b - 4 * a * c;
    const n = 4 * c * k;
    let spans: Vec[] = [];
    if (m < 0 && n > 0) {
      const x0 = Math.sqrt(n / -m);
      spans = [[Math.max(-x0, f.xMin), Math.min(x0, f.xMax)]];
    } else if (m > 0 && n < 0) {
      const x0 = Math.sqrt(-n / m);
      spans =
        x0 < f.xMax
          ? [
              [f.xMin, -x0],
              [x0, f.xMax],
            ]
          : [];
    } else if ((m > 0 && n >= 0) || (m === 0 && n > 0)) {
      spans = [[f.xMin, f.xMax]];
    }
    const root = (x: number) => Math.sqrt(Math.max(0, m * x * x + n));
    const upper = (x: number) => (-b * x + root(x)) / (2 * c);
    const lower = (x: number) => (-b * x - root(x)) / (2 * c);
    return spans.flatMap(([from, to]) =>
      [upper, lower].flatMap((fn) =>
        insideSpans(fn, from, to, f).map(([s, e]) => ({ fn, from: s, to: e })),
      ),
    );
  }
  if (b !== 0) {
    // c = 0: ax² + bxy = k gives y = (k − ax²)/(bx), with a gap at x = 0.
    const fn = (x: number) => (k - a * x * x) / (b * x);
    return [
      [f.xMin, -1e-6],
      [1e-6, f.xMax],
    ].flatMap(([from = 0, to = 0]) =>
      insideSpans(fn, from, to, f).map(([s, e]) => ({ fn, from: s, to: e })),
    );
  }
  // b = c = 0: ax² = k is a pair of vertical lines.
  if (a !== 0 && k / a > 0) {
    const x0 = Math.sqrt(k / a);
    return [{ at: x0 }, { at: -x0 }];
  }
  return [];
}

/** What the shape means for a critical point whose Hessian has this form. */
export function describeShape(v: Verdict): string {
  switch (v) {
    case 'positive definite':
      return 'The graph of Q is a bowl: Q > 0 away from the origin, so the contours are closed ellipses. A Hessian like this at a critical point means a strict local minimum, as for a cost function at its lowest point.';
    case 'negative definite':
      return 'The graph of Q is a dome: Q < 0 away from the origin, so the contours are closed ellipses again, now at negative heights. A Hessian like this at a critical point means a strict local maximum, as for profit at the best output plan.';
    case 'indefinite':
      return 'The graph of Q is a saddle: Q is positive in some directions and negative in others, so the contours are hyperbolas. A Hessian like this at a critical point means neither a maximum nor a minimum.';
    case 'positive semidefinite':
      return 'The graph of Q is a valley with a flat floor: Q ≥ 0, but Q = 0 along a whole line through the origin, so the contours are parallel lines. At a critical point the second-order test cannot decide.';
    case 'negative semidefinite':
      return 'The graph of Q is a ridge with a flat top: Q ≤ 0, but Q = 0 along a whole line through the origin, so the contours are parallel lines. At a critical point the second-order test cannot decide.';
    default:
      return 'With a = b = c = 0 the form is zero everywhere: there is nothing to draw.';
  }
}

const NOTE: Record<Verdict, string> = {
  'positive definite': 'minimum',
  'negative definite': 'maximum',
  indefinite: 'saddle',
  'positive semidefinite': 'flat valley',
  'negative semidefinite': 'flat ridge',
  'zero form': '',
};

/** LA204: contour lines of Q = ax² + bxy + cy², with its minors, eigenvalues and definiteness. */
export function QuadraticFormContours() {
  const [a, setA] = useState(2);
  const [b, setB] = useState(4);
  const [c, setC] = useState(5);
  const [D1, D2] = minors(a, b, c);
  const [l1, l2] = eigenvalues(a, b, c);
  const verdict = classify(a, b, c);
  const axes = verdict === 'zero form' ? [] : eigenvectors(a, b, c);
  const far = 2 * X_HALF;

  return (
    <figure className="widget">
      <Plot frame={FRAME} xLabel="x" yLabel="y" xTicks={[-4, -2, 2, 4]} yTicks={[-2, 2]}>
        {axes.map((v) => (
          <Segment
            key={`axis${v[0]},${v[1]}`}
            frame={FRAME}
            from={[-far * v[0], -far * v[1]]}
            to={[far * v[0], far * v[1]]}
            tone="gold"
            dashed
          />
        ))}
        {LEVELS.flatMap((level) =>
          [level, -level].flatMap((k) =>
            contour(a, b, c, k).map((piece) =>
              'at' in piece ? (
                <Segment
                  key={`${k}v${piece.at}`}
                  frame={FRAME}
                  from={[piece.at, FRAME.yMin]}
                  to={[piece.at, FRAME.yMax]}
                  tone={k > 0 ? 'lilac' : 'green'}
                  dashed={k < 0}
                />
              ) : (
                <Curve
                  key={`${k}c${piece.from},${piece.fn((piece.from + piece.to) / 2)}`}
                  frame={FRAME}
                  fn={piece.fn}
                  from={piece.from}
                  to={piece.to}
                  tone={k > 0 ? 'lilac' : 'green'}
                  dashed={k < 0}
                />
              ),
            ),
          ),
        )}
        <Dot frame={FRAME} x={0} y={0} />
        <Note frame={FRAME} x={0.15 - X_HALF} y={0.3 - Y_HALF}>
          {NOTE[verdict] && `origin: ${NOTE[verdict]}`}
        </Note>
      </Plot>
      <Slider label="Coefficient of x², a" value={a} min={-5} max={5} step={0.5} onChange={setA} />
      <Slider label="Coefficient of xy, b" value={b} min={-10} max={10} step={1} onChange={setB} />
      <Slider label="Coefficient of y², c" value={c} min={-5} max={5} step={0.5} onChange={setC} />
      <Readout
        items={[
          ['Minors D₁, D₂', `${fmt(D1)}, ${fmt(D2)}`],
          ['Eigenvalues', `${fmt(l1)}, ${fmt(l2)}`],
          ['Verdict', verdict],
        ]}
      />
      <figcaption>
        Q = {fmt(a)}x² {b < 0 ? '−' : '+'} {fmt(Math.abs(b))}xy {c < 0 ? '−' : '+'}{' '}
        {fmt(Math.abs(c))}y². Solid lilac lines are the contours Q = 1, 4, 9, 16; dashed green lines
        are Q = −1, −4, −9, −16; the gold dashed lines are the eigenvector directions, the axes of
        the contours. {describeShape(verdict)}
      </figcaption>
    </figure>
  );
}

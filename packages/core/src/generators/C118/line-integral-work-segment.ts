import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Field F = (P, Q) with P = p1·x + p2·y and Q = q1·x + q2·y. */
  p1: number;
  p2: number;
  q1: number;
  q2: number;
  /** Start A = (ax, ay) and end B = (bx, by) of the straight path. */
  ax: number;
  ay: number;
  bx: number;
  by: number;
}

/** "2x - y", "3y", "-x + 2y": a linear expression in x and y. */
export function linearXY(cx: number, cy: number): string {
  const term = (c: number, v: string) => `${Math.abs(c) === 1 ? '' : num(Math.abs(c))}${v}`;
  const parts: string[] = [];
  if (cx !== 0) parts.push(`${cx < 0 ? '-' : ''}${term(cx, 'x')}`);
  if (cy !== 0) {
    if (parts.length === 0) parts.push(`${cy < 0 ? '-' : ''}${term(cy, 'y')}`);
    else parts.push(`${cy < 0 ? '-' : '+'} ${term(cy, 'y')}`);
  }
  return parts.length ? parts.join(' ') : '0';
}

/** "x = 2 + 4t": a coordinate along the path, start + change·t. */
const along = (v: string, start: number, change: number) => {
  if (change === 0) return `${v} = ${num(start)}`;
  const c = `${Math.abs(change) === 1 ? '' : num(Math.abs(change))}t`;
  if (start === 0) return `${v} = ${change < 0 ? '-' : ''}${c}`;
  return `${v} = ${num(start)} ${change < 0 ? '-' : '+'} ${c}`;
};

const dx = (p: Params) => p.bx - p.ax;
const dy = (p: Params) => p.by - p.ay;
const P = (p: Params, x: number, y: number) => p.p1 * x + p.p2 * y;
const Q = (p: Params, x: number, y: number) => p.q1 * x + p.q2 * y;

/** Along r(t) = A + t(B − A) the integrand P·x′ + Q·y′ is c0 + c1·t. */
function coefficients(p: Params) {
  const c0 = P(p, p.ax, p.ay) * dx(p) + Q(p, p.ax, p.ay) * dy(p);
  const c1 = (p.p1 * dx(p) + p.p2 * dy(p)) * dx(p) + (p.q1 * dx(p) + p.q2 * dy(p)) * dy(p);
  return { c0, c1 };
}

const work = (p: Params) => {
  const { c0, c1 } = coefficients(p);
  return c0 + c1 / 2;
};

/** The likely wrong answers; a problem keeps at least two after duplicates are removed. */
function wrongAnswers(p: Params) {
  const W = work(p);
  const mx = (p.ax + p.bx) / 2;
  const my = (p.ay + p.by) / 2;
  return cleanDistractors(W, [
    { value: -W, mistakeCode: 'REVERSED_PATH' },
    { value: round(P(p, mx, my) + Q(p, mx, my), 2), mistakeCode: 'MISSING_DX_DT' },
    { value: coefficients(p).c0, mistakeCode: 'FORCE_AT_START' },
  ]);
}

/** C118, difficulty 2: work ∫ P dx + Q dy of a linear force field along a straight segment. */
export const lineIntegralWorkSegment: Generator<Params> = {
  id: 'line-integral-work-segment',
  title: 'Work of a force field along a segment',
  topicId: 'C118',
  difficulty: 2,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const p: Params = {
        p1: rng.int(-3, 3),
        p2: rng.int(-3, 3),
        q1: rng.int(-3, 3),
        q2: rng.int(-3, 3),
        ax: rng.int(0, 8),
        ay: rng.int(0, 8),
        bx: rng.int(0, 8),
        by: rng.int(0, 8),
      };
      if ((p.p1 === 0 && p.p2 === 0) || (p.q1 === 0 && p.q2 === 0)) continue;
      if (dx(p) === 0 || dy(p) === 0) continue;
      const { c1 } = coefficients(p);
      // The force must change along the path (c1 ≠ 0) and the work must not be zero.
      if (c1 === 0 || work(p) === 0 || Math.abs(work(p)) > 400) continue;
      if (wrongAnswers(p).length < 2) continue;
      return p;
    }
  },

  stem: (p) =>
    `A force field $\\mathbf{F}(x, y) = (${linearXY(p.p1, p.p2)},\\; ${linearXY(p.q1, p.q2)})$ acts on a load moved along the straight segment from $A = (${p.ax}, ${p.ay})$ to $B = (${p.bx}, ${p.by})$. Find the work $W = \\int_C P\\,dx + Q\\,dy$.`,

  answer: (p) => ({ kind: 'numeric', value: work(p), decimals: 2 }),

  steps(p) {
    const { c0, c1 } = coefficients(p);
    // c1 is never 0 (params rejects it); c0 may be.
    const integrand =
      c0 === 0 ? `${num(c1)}t` : `${num(c0)} ${c1 < 0 ? '-' : '+'} ${num(Math.abs(c1))}t`;
    // ∫₀¹ (c0 + c1·t) dt = c0 + c1/2, written the way the integrand is.
    const halfTerm =
      c0 === 0
        ? `\\dfrac{${num(c1)}}{2}`
        : `${num(c0)} ${c1 < 0 ? '-' : '+'} \\dfrac{${num(Math.abs(c1))}}{2}`;
    return [
      {
        text: 'Parametrise the segment.',
        latex: `${along('x', p.ax, dx(p))},\\; ${along('y', p.ay, dy(p))},\\; 0 \\le t \\le 1;\\quad dx = ${num(dx(p))}\\,dt,\\; dy = ${num(dy(p))}\\,dt`,
        why: 'Start at A when t = 0 and move in a straight line to B at t = 1; dx and dy follow from differentiating x(t) and y(t).',
      },
      {
        text: 'Substitute into P dx + Q dy.',
        latex: `P\\,dx + Q\\,dy = \\big(${integrand}\\big)\\,dt`,
        why: 'Replace x and y by their expressions in t, multiply P by dx/dt and Q by dy/dt, and collect terms.',
      },
      {
        text: 'Integrate from t = 0 to t = 1.',
        latex: `W = \\int_0^1 \\big(${integrand}\\big)\\,dt = ${halfTerm} = ${num(work(p))}`,
        why: 'The line integral has become an ordinary definite integral in t.',
        result: round(work(p), 2),
      },
    ];
  },

  distractors: wrongAnswers,
};

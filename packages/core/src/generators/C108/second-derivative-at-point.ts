import { round } from '../../engine/grading';
import type { Rng } from '../../engine/rng';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

/** Cubic cost C(Q) = F + aQ − bQ² + cQ³, second derivative at Q₀. */
interface CostParams {
  kind: 'cost';
  fixedCost: number;
  a: number;
  b: number;
  c: number;
  q0: number;
}

/** Production Q(L) = A·L^(n/d) with L = rᵈ, so every power of L is a whole power of r. */
interface ProductionParams {
  kind: 'production';
  A: number;
  n: number;
  d: number;
  r: number;
}

type Params = CostParams | ProductionParams;

/** The answer is exact (at most 2 decimals), so only a slip in the last digit is allowed. */
const EXACT = { tolerance: 0.01, relTolerance: 0.0001 } as const;

/** Exponents α = n/d with outputs L = rᵈ that can give answers with at most 2 decimals. */
const POWERS = [
  { n: 1, d: 2, rs: [2, 3, 4, 5, 6, 10] },
  { n: 1, d: 3, rs: [2] },
  { n: 2, d: 3, rs: [2] },
  { n: 3, d: 4, rs: [2] },
] as const;

const MAX_A = 600;

const gcd = (x: number, y: number): number => (y === 0 ? Math.abs(x) : gcd(y, x % y));

/** C″(Q₀) = −2b + 6cQ₀. */
const costSecond = (p: CostParams) => round(-2 * p.b + 6 * p.c * p.q0, 4);
const costFirst = (p: CostParams) => round(p.a - 2 * p.b * p.q0 + 3 * p.c * p.q0 * p.q0, 4);

/** Q″(L₀) = A·α(α − 1)·L₀^(α−2), with L₀^(α−2) = r^(n − 2d). */
const prodSecond = (p: ProductionParams) =>
  round((p.A * p.n * (p.n - p.d)) / (p.d * p.d * p.r ** (2 * p.d - p.n)), 4);
const prodFirst = (p: ProductionParams) => (p.A * p.n) / (p.d * p.r ** (p.d - p.n));
const prodPowerOnce = (p: ProductionParams) => (p.A * p.n) / (p.d * p.r ** (2 * p.d - p.n));

const value = (p: Params) => (p.kind === 'cost' ? costSecond(p) : prodSecond(p));

const coef = (k: number) => (k === 1 ? '' : num(k));
/** "\tfrac{1}{2}" or "-\tfrac{3}{2}" for a fraction n/d in lowest terms. */
function frac(top: number, bottom: number): string {
  const g = gcd(top, bottom);
  const [t, b] = [top / g, bottom / g];
  if (b === 1) return `${t}`;
  return `${t < 0 ? '-' : ''}\\tfrac{${Math.abs(t)}}{${b}}`;
}

function drawCost(rng: Rng): CostParams {
  for (;;) {
    const c = rng.pick([0.05, 0.1, 0.2, 0.25, 0.5, 1] as const);
    const b = rng.int(1, 12);
    const inflection = b / (3 * c);
    if (inflection < 3 || inflection > 40) continue;
    // a above b²/(3c) keeps marginal cost positive at every output.
    const a = Math.ceil((b * b) / (3 * c)) + rng.int(1, 40);
    if (a > 600) continue;
    const q0 = rng.int(1, Math.ceil(2 * inflection) + 5);
    return { kind: 'cost', fixedCost: rng.int(1, 40) * 50, a, b, c, q0 };
  }
}

function drawProduction(rng: Rng): ProductionParams {
  for (;;) {
    const power = rng.pick(POWERS);
    const r = rng.pick(power.rs);
    const { n, d } = power;
    // Q″ = −A·n(d − n)/(d²·r^(2d−n)); A must be a multiple of `step` for 2 decimals.
    const den = d * d * r ** (2 * d - n);
    const step = den / gcd(den, 100 * n * (d - n));
    const kMax = Math.floor(MAX_A / step);
    // At least |Q″| ≥ 0.05 and A ≥ 10, so the numbers stay readable.
    const kMin = Math.max(1, Math.ceil(10 / step), Math.ceil((0.05 * den) / (step * n * (d - n))));
    if (kMax < kMin) continue;
    return { kind: 'production', A: step * rng.int(kMin, kMax), n, d, r };
  }
}

/** C108, difficulty 1: value of the second derivative of a cubic cost or a power production function at a point. */
export const secondDerivativeAtPoint: Generator<Params> = {
  id: 'second-derivative-at-point',
  title: 'Second derivative at a point',
  topicId: 'C108',
  difficulty: 1,
  timeSec: 100,

  params: (rng) => (rng.next() < 0.5 ? drawCost(rng) : drawProduction(rng)),

  stem: (p) => {
    if (p.kind === 'cost') {
      return `A firm's total cost is $C(Q) = ${num(p.fixedCost)} + ${num(p.a)}Q - ${coef(p.b)}Q^2 + ${coef(p.c)}Q^3$. Find $C''(${num(p.q0)})$, the rate at which marginal cost is changing at $Q = ${num(p.q0)}$.`;
    }
    return `A firm's output with $L$ units of labour is $Q(L) = ${num(p.A)}L^{${frac(p.n, p.d)}}$. Find $Q''(${num(p.r ** p.d)})$, the rate at which the marginal product of labour is changing at $L = ${num(p.r ** p.d)}$.`;
  },

  answer: (p) => ({ kind: 'numeric', value: value(p), decimals: 2, ...EXACT }),

  steps: (p) => {
    if (p.kind === 'cost') {
      const q0 = num(p.q0);
      const v = costSecond(p);
      return [
        {
          text: 'Differentiate once to get marginal cost.',
          latex: `C'(Q) = ${num(p.a)} - ${num(2 * p.b)}Q + ${num(3 * p.c)}Q^2`,
          why: 'Each power of Q is multiplied by its exponent and the exponent drops by one; the fixed cost disappears.',
        },
        {
          text: 'Differentiate again.',
          latex: `C''(Q) = -${num(2 * p.b)} + ${num(6 * p.c)}Q`,
          why: 'The second derivative is the derivative of marginal cost: it says how fast marginal cost changes.',
        },
        {
          text: `Put Q = ${q0}.`,
          latex: `C''(${q0}) = -${num(2 * p.b)} + ${num(6 * p.c)} \\cdot ${q0} = ${num(v)}`,
          why:
            v < 0
              ? 'It is negative: marginal cost is still falling here and the cost curve is concave.'
              : v > 0
                ? 'It is positive: marginal cost is rising here and the cost curve is convex.'
                : 'It is zero: marginal cost has stopped falling and is about to rise, the inflection point of the cost curve.',
          result: v,
        },
      ];
    }
    const { A, n, d, r } = p;
    const L0 = num(r ** d);
    const v = prodSecond(p);
    return [
      {
        text: 'Differentiate once to get the marginal product of labour.',
        latex: `Q'(L) = ${num(A)} \\cdot ${frac(n, d)}\\,L^{${frac(n - d, d)}} = ${num((A * n) / d)}L^{${frac(n - d, d)}}`,
        why: 'Power rule: bring the exponent down as a factor and lower it by one.',
      },
      {
        text: 'Differentiate again.',
        latex: `Q''(L) = ${num((A * n) / d)} \\cdot \\left(${frac(n - d, d)}\\right) L^{${frac(n - 2 * d, d)}} = ${num((A * n * (n - d)) / (d * d))}L^{${frac(n - 2 * d, d)}}`,
        why: 'Apply the power rule a second time: the new exponent, which is negative, is brought down as well.',
      },
      {
        text: `Put L = ${L0}.`,
        latex: `${L0}^{${frac(n - 2 * d, d)}} = \\dfrac{1}{${num(r ** (2 * d - n))}} \\;\\Rightarrow\\; Q''(${L0}) = ${num(v)}`,
        why: `${L0} = ${r}^${d}, so ${L0}^(−${2 * d - n}/${d}) = ${r}^(−${2 * d - n}) = 1/${r ** (2 * d - n)}. The answer is negative: each extra unit of labour adds less output than the one before, which is diminishing marginal returns.`,
        result: v,
      },
    ];
  },

  distractors: (p) => {
    const answer = value(p);
    const candidates =
      p.kind === 'cost'
        ? [
            { value: costFirst(p), mistakeCode: 'FIRST_DERIVATIVE' },
            { value: round(-2 * p.b + 3 * p.c * p.q0, 2), mistakeCode: 'POWER_ONCE' },
            { value: round(2 * p.b + 6 * p.c * p.q0, 2), mistakeCode: 'SIGN' },
          ]
        : [
            { value: round(prodFirst(p), 2), mistakeCode: 'FIRST_DERIVATIVE' },
            { value: round(prodPowerOnce(p), 2), mistakeCode: 'POWER_ONCE' },
            { value: round(-answer, 2), mistakeCode: 'SIGN' },
          ];
    return cleanDistractors(answer, candidates, EXACT.tolerance, EXACT.relTolerance);
  },
};

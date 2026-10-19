import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Saving rate in per cent. */
  savingPct: number;
  /** Capital share α in hundredths (30 means α = 0.3). */
  alphaPct: number;
  /** Labour-force growth in tenths of a per cent (10 means 1 %). */
  nTenthsPct: number;
  /** Depreciation in per cent. */
  deltaPct: number;
}

/** The half-life is asked to 1 decimal place. */
const DP1 = { tolerance: 0.05, relTolerance: 0 } as const;

const s = (p: Params) => p.savingPct / 100;
const alpha = (p: Params) => p.alphaPct / 100;
const n = (p: Params) => p.nTenthsPct / 1000;
const delta = (p: Params) => p.deltaPct / 100;
const nd = (p: Params) => n(p) + delta(p);
/** g′(k*) = sαk*^(α−1) − (n + δ) = α(n + δ) − (n + δ) = −(1 − α)(n + δ). */
const speed = (p: Params) => (1 - alpha(p)) * nd(p);
const halfLife = (p: Params) => round(Math.LN2 / speed(p), 1);

const candidates = (p: Params): Distractor[] => [
  { value: round(Math.LN2 / nd(p), 1), mistakeCode: 'NO_ALPHA_FACTOR' },
  { value: round(Math.LN2 / (alpha(p) * nd(p)), 1), mistakeCode: 'ALPHA_NOT_ONE_MINUS' },
  { value: round(1 / speed(p), 1), mistakeCode: 'NO_LOG' },
  { value: round(Math.LN2 / ((1 - alpha(p)) * delta(p)), 1), mistakeCode: 'IGNORED_POPULATION' },
];

/** DY06, difficulty 3: the half-life of a gap near the Solow steady state, from the linearised equation. */
export const solowConvergenceHalfLife: Generator<Params> = {
  id: 'solow-convergence-half-life',
  title: 'Speed of convergence in the Solow model',
  topicId: 'DY06',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const p: Params = {
        savingPct: rng.int(3, 7) * 5,
        alphaPct: rng.pick([20, 25, 30, 35, 40, 45]),
        nTenthsPct: rng.int(0, 5) * 5,
        deltaPct: rng.int(2, 8),
      };
      if (cleanDistractors(halfLife(p), candidates(p), DP1.tolerance, 0).length < 3) continue;
      return p;
    }
  },

  stem: (p) =>
    `In a Solow economy households save $${p.savingPct}\\%$ of output, output per worker is $k^{${num(alpha(p))}}$, the labour force grows at $${num(p.nTenthsPct / 10, 1)}\\%$ and capital depreciates at $${p.deltaPct}\\%$ a year, so $\\dot k = g(k) = ${num(s(p))}\\,k^{${num(alpha(p))}} - (${num(n(p), 3)} + ${num(delta(p))})\\,k$. Near the steady state $k^*$ the gap $k - k^*$ follows the linearised equation $\\dot x = g'(k^*)\\,x$. Using it, how many years does it take to close half the gap? Give your answer to 1 decimal place.`,

  answer: (p) => ({ kind: 'numeric', value: halfLife(p), decimals: 1, ...DP1 }),

  steps(p) {
    const a = alpha(p);
    const slope = -speed(p);
    return [
      {
        text: 'Use the steady-state condition.',
        latex: `g(k^*) = 0:\\quad ${num(s(p))}\\,(k^*)^{${num(a)}} = ${num(nd(p), 3)}\\,k^* \\;\\Rightarrow\\; ${num(s(p))}\\,(k^*)^{${num(a)} - 1} = ${num(nd(p), 3)}`,
        why: 'Dividing both sides by k* gives s·k*^(α − 1) = n + δ, which is exactly the expression that appears in the derivative, so k* itself is never needed.',
        result: nd(p),
      },
      {
        text: 'Differentiate g and evaluate at k*.',
        latex: `g'(k^*) = ${num(a)} \\cdot ${num(s(p))}\\,(k^*)^{${num(a)} - 1} - ${num(nd(p), 3)} = ${num(a)} \\cdot ${num(nd(p), 3)} - ${num(nd(p), 3)} = -(1 - ${num(a)}) \\cdot ${num(nd(p), 3)} = ${num(slope, 5)}`,
        why: 'The power rule gives s·α·k^(α − 1) − (n + δ). The slope is negative, so the steady state is stable: above k* capital falls, below it capital rises. Its size (1 − α)(n + δ) is the speed of convergence.',
        result: slope,
      },
      {
        text: 'Turn the speed into a half-life.',
        latex: `x(t) = x_0\\,e^{${num(slope, 5)}\\,t} = \\tfrac12 x_0 \\;\\Rightarrow\\; t_{1/2} = \\dfrac{\\ln 2}{${num(speed(p), 5)}} \\approx ${num(halfLife(p), 1)}`,
        why: `The linearised gap shrinks exponentially, as in DY03, and halves when the exponent reaches −ln 2. The saving rate ${p.savingPct} % moves k* but not the speed.`,
        result: halfLife(p),
      },
    ];
  },

  distractors: (p) => cleanDistractors(halfLife(p), candidates(p), DP1.tolerance, 0),
};

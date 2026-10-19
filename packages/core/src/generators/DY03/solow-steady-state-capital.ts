import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Saving rate s, in per cent. */
  saving: number;
  /** Population growth n, in tenths of a per cent (15 means 1.5 %). */
  nTenths: number;
  /** Depreciation δ, in per cent. */
  depreciation: number;
  /** Capital's exponent α = num/den in f(k) = k^α. */
  alphaNum: number;
  alphaDen: number;
}

const VALUE = { tolerance: 0.01, relTolerance: 0.002 } as const;
const ALPHAS = [
  [1, 4],
  [1, 3],
  [2, 5],
  [1, 2],
] as const;

const s = (p: Params) => p.saving / 100;
const n = (p: Params) => p.nTenths / 1000;
const d = (p: Params) => p.depreciation / 100;
const alpha = (p: Params) => p.alphaNum / p.alphaDen;
/** The ratio s/(n + δ) that k^(1 − α) must equal at the steady state. */
const ratio = (p: Params) => s(p) / (n(p) + d(p));
/** k* = (s/(n + δ))^(1/(1 − α)). */
const kStarExact = (p: Params) => ratio(p) ** (1 / (1 - alpha(p)));
const kStar = (p: Params) => round(kStarExact(p), 2);

/** α and 1/(1 − α) as slash fractions, e.g. "1/3" and "3/2". */
const alphaTex = (p: Params) => `${p.alphaNum}/${p.alphaDen}`;
const powerTex = (p: Params) => {
  const top = p.alphaDen;
  const bottom = p.alphaDen - p.alphaNum;
  return bottom === 1 ? `${top}` : `${top}/${bottom}`;
};

const candidates = (p: Params) => [
  { value: round(ratio(p), 2), mistakeCode: 'FORGOT_POWER' },
  { value: round(ratio(p) ** (1 / alpha(p)), 2), mistakeCode: 'WRONG_POWER' },
  { value: round((s(p) / d(p)) ** (1 / (1 - alpha(p))), 2), mistakeCode: 'IGNORED_POPULATION' },
];

/** DY03, difficulty 3: the Solow steady state k* = (s/(n + δ))^(1/(1 − α)) for f(k) = k^α. */
export const solowSteadyStateCapital: Generator<Params> = {
  id: 'solow-steady-state-capital',
  title: 'Solow steady-state capital per worker',
  topicId: 'DY03',
  difficulty: 3,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const [alphaNum, alphaDen] = rng.pick(ALPHAS);
      const p: Params = {
        saving: rng.int(10, 40),
        nTenths: rng.int(1, 6) * 5,
        depreciation: rng.int(3, 10),
        alphaNum,
        alphaDen,
      };
      const r = ratio(p);
      // Capital per worker grows from a small stock, and the answer stays readable.
      if (r < 1.2 || kStarExact(p) > 200) continue;
      const kept = cleanDistractors(kStar(p), candidates(p), VALUE.tolerance, VALUE.relTolerance);
      if (kept.length < 3) continue;
      return p;
    }
  },

  stem: (p) =>
    `In a Solow economy output per worker is $f(k) = k^{${alphaTex(p)}}$. Households save $${p.saving}\\%$ of output, the labour force grows at $${num(100 * n(p), 1)}\\%$ a year and capital depreciates at $${p.depreciation}\\%$ a year, so capital per worker follows $\\dot k = ${num(s(p))}\\,k^{${alphaTex(p)}} - (${num(n(p), 3)} + ${num(d(p))})\\,k$. Find the steady-state capital per worker $k^*$. Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: kStar(p), decimals: 2, ...VALUE }),

  steps(p) {
    const nd = n(p) + d(p);
    return [
      {
        text: 'Set the change in capital per worker to zero.',
        latex: `${num(s(p))}\\,k^{${alphaTex(p)}} = ${num(nd, 3)}\\,k \\;\\Rightarrow\\; k^{1 - ${alphaTex(p)}} = \\dfrac{${num(s(p))}}{${num(nd, 3)}} = ${num(ratio(p), 4)}`,
        why: 'At the steady state saving per worker, s·f(k), exactly covers the capital needed to equip new workers (n·k) and replace worn-out machines (δ·k). Dividing both sides by k^α leaves k^(1 − α).',
        result: ratio(p),
      },
      {
        text: 'Undo the power 1 − α.',
        latex: `k^* = \\left(${num(ratio(p), 4)}\\right)^{1/(1 - ${alphaTex(p)})} = \\left(${num(ratio(p), 4)}\\right)^{${powerTex(p)}} = ${num(kStar(p))}`,
        why: `Raising both sides to the power 1/(1 − α) = ${powerTex(p)} turns k^(1 − α) back into k.`,
        result: kStar(p),
      },
      {
        text: 'Check that the steady state really balances.',
        latex: `${num(s(p))} \\cdot ${num(kStarExact(p), 4)}^{${alphaTex(p)}} = ${num(s(p) * kStarExact(p) ** alpha(p), 4)} = ${num(nd, 3)} \\cdot ${num(kStarExact(p), 4)}`,
        why: 'Saving per worker and the break-even investment (n + δ)k are equal at k*, so k̇ = 0 there; below k* saving is larger and k rises, above it k falls.',
        result: kStar(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(kStar(p), candidates(p), VALUE.tolerance, VALUE.relTolerance),
};

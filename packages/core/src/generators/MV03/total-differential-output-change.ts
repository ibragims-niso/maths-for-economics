import { round } from '../../engine/grading';
import type { Rng } from '../../engine/rng';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Productivity factor in Q = A·K^α·L^β. */
  A: number;
  /** Exponents in quarters: α = alphaQ/4, β = betaQ/4. */
  alphaQ: number;
  betaQ: number;
  /** K = kRoot^kPower and L = lRoot^lPower, chosen so K^α and L^β are whole numbers. */
  kRoot: number;
  kPower: number;
  lRoot: number;
  lPower: number;
  /** The planned changes in machines and workers (whole numbers, not zero, at most 15 % of the level). */
  dK: number;
  dL: number;
}

/** (α, β) in quarters, α + β ≤ 1 (constant or decreasing returns to scale). */
const PAIRS = [
  [1, 1],
  [1, 2],
  [2, 1],
  [1, 3],
  [3, 1],
  [2, 2],
] as const;

const alphaOf = (p: Params) => p.alphaQ / 4;
const betaOf = (p: Params) => p.betaQ / 4;
const capital = (p: Params) => p.kRoot ** p.kPower;
const labour = (p: Params) => p.lRoot ** p.lPower;
/** K^α and L^β: whole numbers, because (power of the root) × (exponent) is a whole number. */
const kTerm = (p: Params) => p.kRoot ** ((p.alphaQ * p.kPower) / 4);
const lTerm = (p: Params) => p.lRoot ** ((p.betaQ * p.lPower) / 4);
const output = (p: Params) => p.A * kTerm(p) * lTerm(p);
const produce = (p: Params, k: number, l: number) => p.A * k ** alphaOf(p) * l ** betaOf(p);

/** MP_K = α·Q/K and MP_L = β·Q/L (MV02). */
const mpk = (p: Params) => (alphaOf(p) * output(p)) / capital(p);
const mpl = (p: Params) => (betaOf(p) * output(p)) / labour(p);

/** dQ = MP_K·dK + MP_L·dL: the two effects added. */
const estimate = (p: Params) => round(mpk(p) * p.dK + mpl(p) * p.dL, 2);
/** The true change Q(K + dK, L + dL) − Q(K, L). */
const exactChange = (p: Params) =>
  produce(p, capital(p) + p.dK, labour(p) + p.dL) - produce(p, capital(p), labour(p));

const candidates = (p: Params): Distractor[] => [
  { value: round(mpk(p) * p.dK, 2), mistakeCode: 'ONE_INPUT_ONLY' },
  { value: round(mpl(p) * p.dL, 2), mistakeCode: 'ONE_INPUT_ONLY' },
  { value: round(exactChange(p), 2), mistakeCode: 'EXACT_CHANGE' },
  { value: round(mpk(p) * p.dL + mpl(p) * p.dK, 2), mistakeCode: 'SWAPPED_CHANGES' },
];

const wrongAnswers = (p: Params) => cleanDistractors(estimate(p), candidates(p));

/** K or L: a perfect square for an exponent of 1/2, a perfect fourth power for 1/4 or 3/4. */
const drawLevel = (rng: Rng, quarters: number) =>
  quarters === 2 ? { root: rng.int(4, 20), power: 2 } : { root: rng.int(2, 5), power: 4 };

/** A change of at most 15 % of the level (and at most 20), up or down. */
const drawChange = (rng: Rng, level: number) => {
  const size = rng.int(1, Math.min(20, Math.floor(level * 0.15)));
  return rng.next() < 0.35 ? -size : size;
};

const hasAtMostTwoDecimals = (x: number) => Math.abs(x * 100 - Math.round(x * 100)) < 1e-9;

const plural = (n: number, word: string) =>
  `${num(Math.abs(n))} ${word}${Math.abs(n) === 1 ? '' : 's'}`;
/** A number in a product, in brackets when negative. */
const factor = (x: number) => (x < 0 ? `(${num(x)})` : num(x));

/** MV03, difficulty 1: estimate the change in Cobb–Douglas output when both inputs change, dQ = MP_K·dK + MP_L·dL. */
export const totalDifferentialOutputChange: Generator<Params> = {
  id: 'total-differential-output-change',
  title: 'Change in output when both inputs change',
  topicId: 'MV03',
  difficulty: 1,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const [alphaQ, betaQ] = rng.pick(PAIRS);
      const k = drawLevel(rng, alphaQ);
      const l = drawLevel(rng, betaQ);
      const K = k.root ** k.power;
      const L = l.root ** l.power;
      const p: Params = {
        A: rng.int(1, 12),
        alphaQ,
        betaQ,
        kRoot: k.root,
        kPower: k.power,
        lRoot: l.root,
        lPower: l.power,
        dK: drawChange(rng, K),
        dL: drawChange(rng, L),
      };
      // Marginal products with at most 2 decimals, so the estimate is exact and easy to check.
      if (!hasAtMostTwoDecimals(mpk(p)) || !hasAtMostTwoDecimals(mpl(p))) continue;
      if (output(p) > 20000) continue;
      const dQ = estimate(p);
      if (Math.abs(dQ) >= 1 && Math.abs(dQ) <= 2000 && wrongAnswers(p).length >= 3) return p;
    }
  },

  stem(p) {
    const coefficient = p.A === 1 ? '' : num(p.A);
    const machines =
      p.dK > 0 ? `adds ${plural(p.dK, 'machine')}` : `retires ${plural(p.dK, 'machine')}`;
    const workers =
      p.dL > 0 ? `hires ${plural(p.dL, 'worker')}` : `lays off ${plural(p.dL, 'worker')}`;
    return `A firm's output is $Q = ${coefficient}K^{${num(alphaOf(p))}}L^{${num(betaOf(p))}}$, where $K$ is the number of machines and $L$ the number of workers. It now uses $K = ${num(capital(p))}$ and $L = ${num(labour(p))}$. Next month it ${machines} and ${workers}. Use the total differential to estimate the change in output. Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: estimate(p), decimals: 2 }),

  steps(p) {
    const a = num(alphaOf(p));
    const b = num(betaOf(p));
    const q = output(p);
    const K = capital(p);
    const L = labour(p);
    return [
      {
        text: 'Work out output at the starting point.',
        latex: `Q = ${num(p.A)} \\cdot ${num(K)}^{${a}} \\cdot ${num(L)}^{${b}} = ${num(p.A)} \\cdot ${num(kTerm(p))} \\cdot ${num(lTerm(p))} = ${num(q)}`,
        why: 'The marginal products of a Cobb–Douglas function are easiest to find as exponent × Q ÷ input, so Q is needed first.',
        result: q,
      },
      {
        text: 'Find the marginal product of capital.',
        latex: `\\dfrac{\\partial Q}{\\partial K} = ${a}\\,\\dfrac{Q}{K} = ${a} \\cdot \\dfrac{${num(q)}}{${num(K)}} = ${num(mpk(p))}`,
        why: 'Hold L fixed and use the power rule (MV02); this is the extra output from one more machine.',
        result: mpk(p),
      },
      {
        text: 'Find the marginal product of labour.',
        latex: `\\dfrac{\\partial Q}{\\partial L} = ${b}\\,\\dfrac{Q}{L} = ${b} \\cdot \\dfrac{${num(q)}}{${num(L)}} = ${num(mpl(p))}`,
        why: 'Hold K fixed this time; this is the extra output from one more worker.',
        result: mpl(p),
      },
      {
        text: 'Add the two effects: the total differential.',
        latex: `dQ = \\dfrac{\\partial Q}{\\partial K}\\,dK + \\dfrac{\\partial Q}{\\partial L}\\,dL = ${num(mpk(p))} \\cdot ${factor(p.dK)} + ${num(mpl(p))} \\cdot ${factor(p.dL)} = ${num(estimate(p))}`,
        why: 'Each input contributes its marginal product times its own change; for small changes the effects simply add up. The exact change differs a little, because the marginal products themselves change along the way.',
        result: estimate(p),
      },
    ];
  },

  distractors: wrongAnswers,
};

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
  /** Which marginal product the question asks for. */
  input: 'labour' | 'capital';
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

/** ∂Q/∂L = β·Q/L and ∂Q/∂K = α·Q/K, both from the power rule with the other input held fixed. */
const mpl = (p: Params) => (betaOf(p) * output(p)) / labour(p);
const mpk = (p: Params) => (alphaOf(p) * output(p)) / capital(p);
const exact = (p: Params) => (p.input === 'labour' ? mpl(p) : mpk(p));
const marginalProduct = (p: Params) => round(exact(p), 2);

const candidates = (p: Params): Distractor[] => {
  const own = p.input === 'labour';
  const level = own ? labour(p) : capital(p);
  const exponent = own ? betaOf(p) : alphaOf(p);
  return [
    { value: round(own ? mpk(p) : mpl(p), 2), mistakeCode: 'WRONG_VARIABLE' },
    { value: round(exponent * output(p), 2), mistakeCode: 'POWER_NOT_REDUCED' },
    { value: round(output(p) / level, 2), mistakeCode: 'AVERAGE_PRODUCT' },
    { value: round(exact(p) / p.A, 2), mistakeCode: 'DROPPED_COEFFICIENT' },
  ];
};

const wrongAnswers = (p: Params) => cleanDistractors(marginalProduct(p), candidates(p));

/** K or L: a perfect square for an exponent of 1/2, a perfect fourth power for 1/4 or 3/4. */
const drawLevel = (rng: Rng, quarters: number) =>
  quarters === 2 ? { root: rng.int(2, 20), power: 2 } : { root: rng.int(2, 5), power: 4 };

/** MV02, difficulty 1: a marginal product ∂Q/∂L or ∂Q/∂K of Q = A·K^α·L^β at a point. */
export const cobbDouglasMarginalProduct: Generator<Params> = {
  id: 'cobb-douglas-marginal-product',
  title: 'Marginal product (Cobb–Douglas)',
  topicId: 'MV02',
  difficulty: 1,
  timeSec: 90,

  params(rng) {
    for (;;) {
      const [alphaQ, betaQ] = rng.pick(PAIRS);
      const k = drawLevel(rng, alphaQ);
      const l = drawLevel(rng, betaQ);
      const p: Params = {
        A: rng.int(1, 12),
        alphaQ,
        betaQ,
        kRoot: k.root,
        kPower: k.power,
        lRoot: l.root,
        lPower: l.power,
        input: rng.pick(['labour', 'capital'] as const),
      };
      // Equal inputs make ∂Q/∂K and ∂Q/∂L differ only by the exponents; keep them apart.
      if (capital(p) === labour(p)) continue;
      const mp = marginalProduct(p);
      if (mp >= 0.2 && mp <= 200 && output(p) <= 20000 && wrongAnswers(p).length >= 2) return p;
    }
  },

  stem(p) {
    const asked =
      p.input === 'labour'
        ? 'the marginal product of labour $\\dfrac{\\partial Q}{\\partial L}$'
        : 'the marginal product of capital $\\dfrac{\\partial Q}{\\partial K}$';
    const coefficient = p.A === 1 ? '' : num(p.A);
    return `A firm's output is $Q = ${coefficient}K^{${num(alphaOf(p))}}L^{${num(betaOf(p))}}$, where $K$ is the number of machines and $L$ the number of workers. Find ${asked} at $K = ${num(capital(p))}$, $L = ${num(labour(p))}$. Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: marginalProduct(p), decimals: 2 }),

  steps(p) {
    const a = num(alphaOf(p));
    const b = num(betaOf(p));
    const A = num(p.A);
    const own = p.input === 'labour';
    const q = output(p);
    const formula = own
      ? `\\dfrac{\\partial Q}{\\partial L} = ${b} \\cdot ${A}K^{${a}}L^{${num(betaOf(p) - 1)}} = ${b}\\,\\dfrac{Q}{L}`
      : `\\dfrac{\\partial Q}{\\partial K} = ${a} \\cdot ${A}K^{${num(alphaOf(p) - 1)}}L^{${b}} = ${a}\\,\\dfrac{Q}{K}`;
    const level = own ? labour(p) : capital(p);
    const exponent = own ? b : a;
    return [
      {
        text: `Differentiate with respect to ${own ? 'L, holding K' : 'K, holding L'} constant.`,
        latex: formula,
        why: `${own ? 'K' : 'L'} is fixed, so its power is just part of the constant in front; the power rule brings the exponent down and lowers it by 1.`,
      },
      {
        text: 'Work out output at this point.',
        latex: `Q = ${A} \\cdot ${num(capital(p))}^{${a}} \\cdot ${num(labour(p))}^{${b}} = ${A} \\cdot ${num(kTerm(p))} \\cdot ${num(lTerm(p))} = ${num(q)}`,
        why: 'Writing the marginal product as exponent × Q ÷ input avoids negative powers; the inputs were chosen so the powers are whole numbers.',
        result: q,
      },
      {
        text: 'Substitute.',
        latex: `${exponent} \\cdot \\dfrac{${num(q)}}{${num(level)}} = ${num(marginalProduct(p))}`,
        why: `This is the extra output from one more ${own ? 'worker' : 'machine'}, approximately, with the other input unchanged.`,
        result: marginalProduct(p),
      },
    ];
  },

  distractors: wrongAnswers,
};

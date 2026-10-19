import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

type Context = 'output' | 'inventory' | 'herd';

interface Params {
  context: Context;
  /** The two characteristic roots, in tenths, larger first (8 and −5 mean 0.8 and −0.5). */
  r1Tenths: number;
  r2Tenths: number;
  /** The constant b on the right-hand side; it does not affect the roots. */
  b: number;
}

/** Roots have one decimal; a tight absolute tolerance keeps the neighbouring tenths apart. */
const ROOT = { tolerance: 0.01, relTolerance: 0 } as const;

const r1 = (p: Params) => p.r1Tenths / 10;
const r2 = (p: Params) => p.r2Tenths / 10;
/** r² + a₁r + a₂ = (r − r₁)(r − r₂), so a₁ = −(r₁ + r₂) and a₂ = r₁r₂ (in hundredths). */
const a1 = (p: Params) => -(p.r1Tenths + p.r2Tenths) / 10;
const a2 = (p: Params) => (p.r1Tenths * p.r2Tenths) / 100;
/** The discriminant a₁² − 4a₂ = (r₁ − r₂)², in ten-thousandths to stay exact. */
const discriminant = (p: Params) => ((p.r1Tenths - p.r2Tenths) * 10) ** 2 / 10000;

const candidates = (p: Params) => [
  { value: r2(p), mistakeCode: 'SMALLER_ROOT' },
  // Roots of r² − a₁r + a₂ = 0 (the sign of a₁ lost) are −r₁ and −r₂; the larger is −r₂.
  { value: round(-r2(p), 2), mistakeCode: 'ROOT_SIGN' },
  // −a₁ + √D without the division by 2.
  { value: round(2 * r1(p), 2), mistakeCode: 'NO_HALF' },
];

/** " - 1.3y_{t+1}", " + 0.4y_t": a signed term; zero coefficients are left out. */
function term(coefficient: number, symbol: string): string {
  if (coefficient === 0) return '';
  const size = Math.abs(coefficient);
  return ` ${coefficient < 0 ? '-' : '+'} ${size === 1 ? '' : num(size)}${symbol}`;
}

const SETTING: Record<Context, { letter: string; text: string }> = {
  output: { letter: 'Y', text: "A model of a region's yearly output (in millions) is" },
  inventory: {
    letter: 'S',
    text: "A model of a wholesaler's monthly stock (in thousand units) is",
  },
  herd: { letter: 'H', text: 'A model of the national pig herd (in thousand animals) is' },
};

/** DY02, difficulty 2: the larger root of r² + a₁r + a₂ = 0 for y(t+2) + a₁y(t+1) + a₂y(t) = b. */
export const characteristicEquationLargerRoot: Generator<Params> = {
  id: 'characteristic-equation-larger-root',
  title: 'Larger characteristic root',
  topicId: 'DY02',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const context = rng.pick(['output', 'inventory', 'herd'] as const);
      const r1Tenths = rng.int(-4, 9);
      const r2Tenths = rng.int(-9, 9);
      // Two different real roots inside (−1, 1), larger first, neither zero (else first order).
      if (r1Tenths <= r2Tenths || r1Tenths === 0 || r2Tenths === 0) continue;
      const b = rng.int(2, 60) * 5;
      const p: Params = { context, r1Tenths, r2Tenths, b };
      // a₁ = 0 or a₂ = 0 would make the question trivial; every distractor must be distinct.
      if (r1Tenths + r2Tenths === 0) continue;
      if (cleanDistractors(r1(p), candidates(p), ROOT.tolerance, ROOT.relTolerance).length < 3)
        continue;
      return p;
    }
  },

  stem: (p) => {
    const { letter: y, text } = SETTING[p.context];
    return `${text} $${y}_{t+2}${term(a1(p), `${y}_{t+1}`)}${term(a2(p), `${y}_t`)} = ${num(p.b)}$. Find the larger of the two roots of its characteristic equation. Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: r1(p), decimals: 2, ...ROOT }),

  steps(p) {
    const minusA1 = num(-a1(p));
    const root = Math.sqrt(discriminant(p));
    return [
      {
        text: 'Write down the characteristic equation.',
        latex: `r^2${term(a1(p), 'r')} ${a2(p) < 0 ? '-' : '+'} ${num(Math.abs(a2(p)))} = 0`,
        why: `Try y(t) = rᵗ in the equation without its constant b; dividing by rᵗ leaves a quadratic in r. The constant ${num(p.b)} only moves the steady state, not the roots.`,
      },
      {
        text: 'Compute the discriminant.',
        latex: `D = a_1^2 - 4a_2 = (${num(a1(p))})^2 - 4 \\cdot (${num(a2(p))}) = ${num(discriminant(p), 4)}`,
        why: 'D > 0, so there are two different real roots and the solution is A·r₁ᵗ + B·r₂ᵗ.',
        result: discriminant(p),
      },
      {
        text: 'Apply the quadratic formula with the plus sign.',
        latex: `r_1 = \\dfrac{-a_1 + \\sqrt{D}}{2} = \\dfrac{${minusA1} + ${num(root, 4)}}{2} = ${num(r1(p))}`,
        why: '−a₁ is the sum of the roots and √D their distance apart, so adding √D and halving gives the larger root.',
        result: r1(p),
      },
      {
        text: 'Check with the sum and the product of the roots.',
        latex: `r_2 = ${num(r2(p))}: \\quad r_1 + r_2 = ${num(r1(p) + r2(p))} = -a_1, \\quad r_1 r_2 = ${num(a2(p))} = a_2`,
        why: 'Both roots lie between −1 and 1, so both parts of the solution die out and the path settles at its steady state.',
        result: r1(p),
      },
    ];
  },

  distractors: (p) => cleanDistractors(r1(p), candidates(p), ROOT.tolerance, ROOT.relTolerance),
};

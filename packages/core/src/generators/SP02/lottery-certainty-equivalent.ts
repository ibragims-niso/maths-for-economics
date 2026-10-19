import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import {
  certaintyEquivalent,
  expectedUtility,
  inverseUtility,
  plain,
  type UtilityKind,
  utility,
  utilityLatex,
  utilityOf,
} from './utility';

const CONTEXTS = {
  harvest: (low: string, high: string, p: string, q: string) =>
    `A farmer's income next year will be $${low}$ after a poor harvest (probability $${p}$) and $${high}$ after a good one (probability $${q}$).`,
  startup: (low: string, high: string, p: string, q: string) =>
    `A founder will receive $${low}$ if her start-up fails (probability $${p}$) and $${high}$ if it succeeds (probability $${q}$).`,
  bonus: (low: string, high: string, p: string, q: string) =>
    `A salesperson's pay this year will be $${low}$ if she misses her sales target (probability $${p}$) and $${high}$ if she meets it (probability $${q}$).`,
  contract: (low: string, high: string, p: string, q: string) =>
    `A freelance designer will earn $${low}$ next year if a large contract is not renewed (probability $${p}$) and $${high}$ if it is renewed (probability $${q}$).`,
} as const;

type Context = keyof typeof CONTEXTS;

interface Params {
  context: Context;
  kind: UtilityKind;
  /** The bad outcome. */
  low: number;
  /** The good outcome. */
  high: number;
  /** Probability of the bad outcome, in tenths (1–9). */
  pTenths: number;
}

const MONEY = { tolerance: 0.05, relTolerance: 0.00005 } as const;

const probLow = (p: Params) => p.pTenths / 10;
const ce = (p: Params) => certaintyEquivalent(p.kind, p.low, p.high, probLow(p));
const expectedWealth = (p: Params) => probLow(p) * p.low + (1 - probLow(p)) * p.high;

function wrongAnswers(p: Params) {
  return cleanDistractors(
    round(ce(p), 2),
    [
      { value: round(expectedWealth(p), 2), mistakeCode: 'EXPECTED_VALUE' },
      {
        value: round(expectedUtility(p.kind, p.low, p.high, probLow(p)), 2),
        mistakeCode: 'NOT_INVERTED',
      },
      {
        value: round(certaintyEquivalent(p.kind, p.low, p.high, 0.5), 2),
        mistakeCode: 'UNWEIGHTED',
      },
    ],
    MONEY.tolerance,
    MONEY.relTolerance,
  );
}

/** SP02, difficulty 1: certainty equivalent of a two-outcome lottery for u = √W or u = ln W. */
export const lotteryCertaintyEquivalent: Generator<Params> = {
  id: 'lottery-certainty-equivalent',
  title: 'Certainty equivalent of a gamble',
  topicId: 'SP02',
  difficulty: 1,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const context = rng.pick(Object.keys(CONTEXTS) as Context[]);
      const kind = rng.pick(['sqrt', 'log'] as const);
      const pTenths = rng.int(1, 9);
      let low: number;
      let high: number;
      if (kind === 'sqrt') {
        // Perfect squares, so √W is a whole number and CE = (E[√W])² has at most 2 decimals.
        const a = rng.int(20, 250);
        const b = rng.int(a + 10, a + 150);
        low = a * a;
        high = b * b;
      } else {
        const i = rng.int(5, 100);
        low = 1000 * i;
        high = 1000 * rng.int(Math.ceil(1.5 * i), 3 * i);
      }
      const p: Params = { context, kind, low, high, pTenths };
      if (wrongAnswers(p).length < 2) continue;
      return p;
    }
  },

  stem(p) {
    const text = CONTEXTS[p.context](
      num(p.low),
      num(p.high),
      num(probLow(p), 1),
      num(1 - probLow(p), 1),
    );
    return `${text} Her utility of money is $u(W) = ${utilityLatex(p.kind)}$. What is the certainty equivalent of this gamble, the sure amount she values exactly as much as the gamble? Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: round(ce(p), 2), decimals: 2, ...MONEY }),

  steps(p) {
    const pl = probLow(p);
    const ph = 1 - pl;
    const uLow = utility(p.kind, p.low);
    const uHigh = utility(p.kind, p.high);
    const eu = expectedUtility(p.kind, p.low, p.high, pl);
    const value = round(ce(p), 2);
    const sqrt = p.kind === 'sqrt';
    const d = sqrt ? 2 : 4;
    const ew = expectedWealth(p);
    return [
      {
        text: 'Find the expected utility of the gamble.',
        latex: `E[u(W)] = ${num(pl, 1)}\\,${utilityOf(p.kind, num(p.low))} + ${num(ph, 1)}\\,${utilityOf(p.kind, num(p.high))} = ${num(pl, 1)} \\times ${num(uLow, d)} + ${num(ph, 1)} \\times ${num(uHigh, d)} ${sqrt ? '=' : '\\approx'} ${num(eu, sqrt ? 2 : 6)}`,
        why: 'Each outcome’s utility is weighted by its probability. This number is in units of utility, not money.',
        result: round(eu, sqrt ? 2 : 6),
      },
      {
        text: 'Turn the expected utility back into money.',
        latex: sqrt
          ? `CE = \\left(E[\\sqrt{W}]\\right)^2 = ${num(eu, 2)}^2 = ${num(value, 2)}`
          : `CE = e^{E[\\ln W]} = ${num(p.low)}^{${num(pl, 1)}} \\times ${num(p.high)}^{${num(ph, 1)}} \\approx ${num(value, 2)}`,
        why: `The certainty equivalent is the sure amount with the same utility: u(CE) = E[u(W)], so CE = u⁻¹(E[u(W)]). The inverse of ${sqrt ? '√W is squaring' : 'ln W is the exponential, and e raised to a weighted sum of logs is a product of powers'}.`,
        result: value,
      },
      {
        text: 'Compare with the expected value of the gamble.',
        latex: `E[W] = ${num(pl, 1)} \\times ${num(p.low)} + ${num(ph, 1)} \\times ${num(p.high)} = ${num(ew, 2)} > CE`,
        why: `u is concave, so she is risk-averse and values the gamble at less than its average; the gap ${plain(ew - inverseUtility(p.kind, eu))} is her risk premium.`,
      },
    ];
  },

  distractors: wrongAnswers,
};

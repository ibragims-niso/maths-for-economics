import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import {
  certaintyEquivalent,
  expectedUtility,
  plain,
  type UtilityKind,
  utility,
  utilityLatex,
  utilityOf,
} from './utility';

const CONTEXTS = {
  flood: (w: string, p: string, l: string) =>
    `A homeowner has wealth $${w}$, including her house. With probability $${p}$ a flood will cause damage costing $${l}$.`,
  theft: (w: string, p: string, l: string) =>
    `A shop owner has wealth $${w}$. With probability $${p}$ a burglary will destroy stock worth $${l}$.`,
  drought: (w: string, p: string, l: string) =>
    `A farmer has wealth $${w}$. With probability $${p}$ a drought will ruin crops worth $${l}$.`,
  car: (w: string, p: string, l: string) =>
    `A driver has wealth $${w}$, including her car. With probability $${p}$ the car will be stolen, a loss of $${l}$.`,
} as const;

type Context = keyof typeof CONTEXTS;

interface Params {
  context: Context;
  kind: UtilityKind;
  /** Wealth with no loss. */
  wealth: number;
  /** The size of the loss. */
  loss: number;
  /** Probability of the loss, in hundredths (1–25). */
  pHundredths: number;
}

/** The premium is a small difference of two large amounts, so allow 0.05 % for rounding on the way. */
const MONEY = { tolerance: 0.05, relTolerance: 0.0005 } as const;

const prob = (p: Params) => p.pHundredths / 100;
/** Certainty equivalent of the uninsured wealth: W₀ − L with probability p, W₀ otherwise. */
const ce = (p: Params) => certaintyEquivalent(p.kind, p.wealth - p.loss, p.wealth, prob(p));
const premium = (p: Params) => p.wealth - ce(p);
const expectedLoss = (p: Params) => prob(p) * p.loss;

function wrongAnswers(p: Params) {
  return cleanDistractors(
    round(premium(p), 2),
    [
      { value: round(expectedLoss(p), 2), mistakeCode: 'FAIR_PREMIUM' },
      { value: round(premium(p) - expectedLoss(p), 2), mistakeCode: 'RISK_PREMIUM_ONLY' },
      { value: round(ce(p), 2), mistakeCode: 'GAVE_CE' },
    ],
    MONEY.tolerance,
    MONEY.relTolerance,
  );
}

/** SP02, difficulty 2: the largest premium for full insurance, W₀ − CE, for u = √W or u = ln W. */
export const insuranceMaximumPremium: Generator<Params> = {
  id: 'insurance-maximum-premium',
  title: 'Most you would pay for insurance',
  topicId: 'SP02',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const context = rng.pick(Object.keys(CONTEXTS) as Context[]);
      const kind = rng.pick(['sqrt', 'log'] as const);
      const pHundredths = rng.int(1, 25);
      let wealth: number;
      let loss: number;
      if (kind === 'sqrt') {
        // W₀ = b² and W₀ − L = a² with a, b multiples of 10: CE = (E[√W])² has at most 2 decimals.
        const b = 10 * rng.int(10, 40);
        const a = 10 * rng.int(Math.ceil((0.3 * b) / 10), b / 10 - 1);
        wealth = b * b;
        loss = b * b - a * a;
      } else {
        const k = rng.int(20, 200);
        wealth = 1000 * k;
        loss = 1000 * rng.int(Math.ceil(0.1 * k), Math.floor(0.8 * k));
      }
      const p: Params = { context, kind, wealth, loss, pHundredths };
      // A risk premium of at least 1 keeps the answer clearly above the fair premium.
      if (premium(p) - expectedLoss(p) < 1) continue;
      if (wrongAnswers(p).length < 3) continue;
      return p;
    }
  },

  stem(p) {
    const text = CONTEXTS[p.context](num(p.wealth), num(prob(p)), num(p.loss));
    return `${text} Her utility of wealth is $u(W) = ${utilityLatex(p.kind)}$. What is the largest premium she would pay for insurance that covers the whole loss? Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: round(premium(p), 2), decimals: 2, ...MONEY }),

  steps(p) {
    const pr = prob(p);
    const left = p.wealth - p.loss;
    const sqrt = p.kind === 'sqrt';
    const d = sqrt ? 2 : 4;
    const eu = expectedUtility(p.kind, left, p.wealth, pr);
    const ceValue = round(ce(p), 2);
    const value = round(premium(p), 2);
    return [
      {
        text: 'Find the expected utility without insurance.',
        latex: `E[u(W)] = ${num(pr)}\\,${utilityOf(p.kind, num(left))} + ${num(1 - pr)}\\,${utilityOf(p.kind, num(p.wealth))} = ${num(pr)} \\times ${num(utility(p.kind, left), d)} + ${num(1 - pr)} \\times ${num(utility(p.kind, p.wealth), d)} ${sqrt ? '=' : '\\approx'} ${num(eu, sqrt ? 2 : 6)}`,
        why: `Without insurance her wealth is ${plain(left)} if the loss happens and ${plain(p.wealth)} if it does not.`,
        result: round(eu, sqrt ? 2 : 6),
      },
      {
        text: 'Find the certainty equivalent of the uninsured wealth.',
        latex: sqrt
          ? `CE = ${num(eu, 2)}^2 = ${num(ceValue, 2)}`
          : `CE = e^{E[\\ln W]} = ${num(left)}^{${num(pr)}} \\times ${num(p.wealth)}^{${num(1 - pr)}} \\approx ${num(ceValue, 2)}`,
        why: 'u(CE) = E[u(W)]: a sure wealth of CE is exactly as good as facing the risk.',
        result: ceValue,
      },
      {
        text: 'Insurance leaves her W₀ − premium for sure; she pays at most the amount that brings her down to CE.',
        latex: `\\text{premium}_{\\max} = W_0 - CE = ${num(p.wealth)} - ${num(ceValue, 2)} = ${num(value, 2)}`,
        why: `Any lower premium leaves her better off insured. The answer is the expected loss ${plain(expectedLoss(p))} plus her risk premium ${plain(premium(p) - expectedLoss(p))}.`,
        result: value,
      },
    ];
  },

  distractors: wrongAnswers,
};

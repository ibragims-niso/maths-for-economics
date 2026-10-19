import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

type Context = 'firm' | 'land' | 'subsidy';

interface Params {
  context: Context;
  /** The flow per year at time 0, A; at time t it is A·e^(gt). */
  flow: number;
  /** Continuous growth rate of the flow, in per cent a year. */
  growth: number;
  /** Discount rate in per cent a year, compounded continuously; always above the growth rate. */
  rate: number;
}

const MONEY = { tolerance: 0.05, relTolerance: 0.00005 } as const;

/** The gap r − g as a decimal, rounded so that 0.08 − 0.03 is exactly 0.05. */
const gap = (p: Params) => round((p.rate - p.growth) / 100, 6);
/** PV = ∫₀^∞ A·e^(gt)·e^(−rt) dt = A/(r − g). */
const value = (p: Params) => round(p.flow / gap(p), 2);

const OPENING: Record<Context, (p: Params) => string> = {
  firm: (p) =>
    `A firm's net cash flow is currently $${num(p.flow)}$ a year, received continuously. It is expected to grow continuously at $${num(p.growth)}\\%$ a year for ever, so at time $t$ years it flows at the rate $${num(p.flow)}\\,e^{${num(p.growth / 100, 4)}t}$ a year.`,
  land: (p) =>
    `A plot of land earns rent at a rate of $${num(p.flow)}$ a year today, received continuously. Rents are expected to rise continuously at $${num(p.growth)}\\%$ a year for ever, so at time $t$ years the rent flows at $${num(p.flow)}\\,e^{${num(p.growth / 100, 4)}t}$ a year.`,
  subsidy: (p) =>
    `A government introduces a permanent subsidy that costs $${num(p.flow)}$ a year now, paid continuously. The cost is expected to rise continuously at $${num(p.growth)}\\%$ a year for ever, so at time $t$ years it is $${num(p.flow)}\\,e^{${num(p.growth / 100, 4)}t}$ a year.`,
};

const QUESTION: Record<Context, string> = {
  firm: 'Investors discount at $RATE\\%$ a year, compounded continuously. What is the firm worth today?',
  land: 'The discount rate is $RATE\\%$ a year, compounded continuously. What is the land worth today, as the present value of all future rent?',
  subsidy:
    'The government discounts at $RATE\\%$ a year, compounded continuously. What is the present value of the cost of the subsidy?',
};

/** C116, difficulty 2: value of a perpetual stream growing continuously, ∫₀^∞ A·e^(−(r−g)t) dt = A/(r − g). */
export const growingContinuousStreamValue: Generator<Params> = {
  id: 'growing-continuous-stream-value',
  title: 'Value of a growing perpetual stream',
  topicId: 'C116',
  difficulty: 2,
  timeSec: 120,

  params(rng) {
    const context = rng.pick(['firm', 'land', 'subsidy'] as const);
    const flow =
      context === 'firm'
        ? rng.int(4, 100) * 5000
        : context === 'land'
          ? rng.int(4, 60) * 500
          : rng.int(10, 200) * 1000;
    const growth = rng.int(1, 8) / 2; // 0.5 % to 4 %
    return { context, flow, growth, rate: growth + rng.int(2, 14) / 2 }; // 1 to 7 points above
  },

  stem: (p) =>
    `${OPENING[p.context](p)} ${QUESTION[p.context].replace('RATE', num(p.rate))} Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: value(p), decimals: 2, ...MONEY }),

  steps(p) {
    const r = num(p.rate / 100, 4);
    const g = num(p.growth / 100, 4);
    const d = num(gap(p), 4);
    return [
      {
        text: 'Combine growth and discounting in one exponent.',
        latex: `${num(p.flow)}\\,e^{${g}t}\\,e^{-${r}t} = ${num(p.flow)}\\,e^{-(${r} - ${g})t} = ${num(p.flow)}\\,e^{-${d}t}`,
        why: 'Multiplying powers of e adds the exponents, so growth at g and discounting at r together act like discounting at r − g.',
        result: gap(p),
      },
      {
        text: 'Integrate up to a finite horizon b, then let b grow without limit.',
        latex: `\\int_0^{b} ${num(p.flow)}\\,e^{-${d}t}\\,dt = \\frac{${num(p.flow)}}{${d}}\\left(1 - e^{-${d}b}\\right) \\to \\frac{${num(p.flow)}}{${d}} \\text{ as } b \\to \\infty`,
        why: 'An integral to infinity is the limit of integrals to b. Because r − g > 0, e^(−(r − g)b) shrinks to 0.',
      },
      {
        text: 'Divide the current flow by the gap r − g.',
        latex: `PV = \\frac{${num(p.flow)}}{${d}} = ${num(value(p))}`,
        why: 'The limit is A/(r − g): the closer growth is to the discount rate, the larger the value.',
        result: value(p),
      },
    ];
  },

  distractors(p) {
    const r = p.rate / 100;
    const g = p.growth / 100;
    return cleanDistractors(
      value(p),
      [
        { value: round(p.flow / r, 2), mistakeCode: 'IGNORED_GROWTH' },
        { value: round(p.flow / (r + g), 2), mistakeCode: 'GROWTH_ADDED' },
        { value: round(p.flow / (g - r), 2), mistakeCode: 'RATES_SWAPPED' },
        { value: round((p.flow * (1 + g)) / gap(p), 2), mistakeCode: 'GREW_FIRST_PAYMENT' },
      ],
      MONEY.tolerance,
      MONEY.relTolerance,
    );
  },
};

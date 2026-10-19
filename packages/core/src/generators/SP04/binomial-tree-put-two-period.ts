import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import {
  callPayoff,
  down,
  gross,
  grossLatex,
  priceAt,
  putPayoff,
  rateLatex,
  riskNeutralQ,
  type TreeParams,
  twoPeriodValue,
  up,
} from './tree';

const FIRMS = {
  shipping: 'a shipping company',
  pharma: 'a drug maker',
  steel: 'a steel producer',
  power: 'an electricity supplier',
} as const;

type Firm = keyof typeof FIRMS;

interface Params extends TreeParams {
  firm: Firm;
}

/** Option prices are small amounts of money: allow 2 cents, or 0.1 % for larger prices. */
const OPTION = { tolerance: 0.02, relTolerance: 0.001 } as const;

const put = (p: Params) => twoPeriodValue(p, putPayoff);

function wrongAnswers(p: Params) {
  const r = gross(p);
  const v0 = put(p).v0;
  return cleanDistractors(
    round(v0, 2),
    [
      { value: round(v0 * r, 2), mistakeCode: 'ONE_DISCOUNT' },
      { value: round(v0 * r * r, 2), mistakeCode: 'NO_DISCOUNT' },
      {
        value: round(twoPeriodValue(p, putPayoff, 1 - riskNeutralQ(p)).v0, 2),
        mistakeCode: 'SWAPPED_Q',
      },
      { value: round(twoPeriodValue(p, callPayoff).v0, 2), mistakeCode: 'CALL_PAYOFF' },
    ],
    OPTION.tolerance,
    OPTION.relTolerance,
  );
}

/** SP04, difficulty 3: a two-period European put by backward induction through the tree. */
export const binomialTreePutTwoPeriod: Generator<Params> = {
  id: 'binomial-tree-put-two-period',
  title: 'Two-period put by backward induction',
  topicId: 'SP04',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const firm = rng.pick(Object.keys(FIRMS) as Firm[]);
      // S₀ a multiple of 20 and moves in steps of 5 %: every price in the tree has at most 2 decimals.
      const s0 = 20 * rng.int(2, 10);
      const upPct = 5 * rng.int(2, 6);
      const downPct = 5 * rng.int(1, 5);
      const ratePct = rng.int(1, Math.min(8, upPct - 1));
      const base = { s0, upPct, downPct, ratePct, strike: 0 };
      // A strike above the lowest final price (so the put can pay) and at most the price after one rise.
      const strike = rng.int(Math.floor(priceAt(base, 0, 2)) + 1, Math.floor(priceAt(base, 1, 0)));
      const p: Params = { firm, ...base, strike };
      if (put(p).v0 < 0.5) continue;
      if (wrongAnswers(p).length < 4) continue;
      return p;
    }
  },

  stem(p) {
    return `A share in ${FIRMS[p.firm]} costs $S_0 = ${num(p.s0)}$ today. In each of the next two periods its price either rises by $${p.upPct}\\%$ or falls by $${p.downPct}\\%$. The risk-free interest rate is $${rateLatex(p.ratePct)}$ per period, compounded once per period, so 1 invested today grows to $R = ${grossLatex(p.ratePct)}$ after one period and $R^2$ after two (not continuous compounding). What is the no-arbitrage price today of a European put option on the share with strike $K = ${num(p.strike)}$ that expires at the end of the second period? Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: round(put(p).v0, 2), decimals: 2, ...OPTION }),

  steps(p) {
    const k = num(p.strike);
    const q = riskNeutralQ(p);
    const v = put(p);
    const r = grossLatex(p.ratePct);
    const value = round(v.v0, 2);
    return [
      {
        text: 'Find the share prices after two periods and what the put pays at each.',
        latex: `S_{uu} = ${num(priceAt(p, 2, 0))},\\ S_{ud} = ${num(priceAt(p, 1, 1))},\\ S_{dd} = ${num(priceAt(p, 0, 2))}; \\quad P = \\max(${k} - S,\\ 0):\\ P_{uu} = ${num(v.vuu)},\\ P_{ud} = ${num(v.vud)},\\ P_{dd} = ${num(v.vdd)}`,
        why: 'A put is the right to sell at the strike, so it pays K − S when the price ends below the strike. Up then down and down then up reach the same price.',
        result: v.vdd,
      },
      {
        text: 'Find the risk-neutral probability of a rise.',
        latex: `q = \\dfrac{R - d}{u - d} = \\dfrac{${r} - ${num(down(p))}}{${num(up(p))} - ${num(down(p))}} = ${num(q, 4)}`,
        why: 'The same u, d and R hold in every period, so one q serves the whole tree.',
        result: round(q, 4),
      },
      {
        text: 'Value the put after a rise, one period before expiry.',
        latex: `P_u = \\dfrac{q\\,P_{uu} + (1 - q)\\,P_{ud}}{R} = \\dfrac{${num(q, 4)} \\times ${num(v.vuu)} + ${num(1 - q, 4)} \\times ${num(v.vud)}}{${r}} = ${num(v.vu, 4)}`,
        why: 'From each node the option is a one-period option on the two nodes that follow it.',
        result: round(v.vu, 4),
      },
      {
        text: 'Value the put after a fall.',
        latex: `P_d = \\dfrac{q\\,P_{ud} + (1 - q)\\,P_{dd}}{R} = \\dfrac{${num(q, 4)} \\times ${num(v.vud)} + ${num(1 - q, 4)} \\times ${num(v.vdd)}}{${r}} = ${num(v.vd, 4)}`,
        why: 'The same rule one node lower: the discounted risk-neutral average of the two values that follow.',
        result: round(v.vd, 4),
      },
      {
        text: 'Step back once more, to today.',
        latex: `P_0 = \\dfrac{q\\,P_u + (1 - q)\\,P_d}{R} = \\dfrac{${num(q, 4)} \\times ${num(v.vu, 4)} + ${num(1 - q, 4)} \\times ${num(v.vd, 4)}}{${r}} = ${num(value, 2)}`,
        why: 'Each period is discounted once, so the final payoffs are discounted twice in total, by R².',
        result: value,
      },
    ];
  },

  distractors: wrongAnswers,
};

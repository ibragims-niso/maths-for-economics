import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { type Constraint, inequality, point, value } from '../OP02/lp';
import { bikeCorners, lpUnusedHoursAtOptimum, optimum } from '../OP02/lp-unused-hours-at-optimum';
import { dualPrices, dualSolution, TWO_DP } from './dual';
import { bestProfitPerHour } from './lp-dual-shadow-price';

/** The OP02 bike workshop (welding, painting, assembly) plus the machine asked about. */
type Params = Parameters<typeof lpUnusedHoursAtOptimum.stem>[0] & {
  /** 0 = welding, 1 = painting, 2 = assembly. */
  asked: 0 | 1 | 2;
};

const NAMES = ['welding', 'painting', 'assembly'] as const;
const SYMBOLS = ['y_W', 'y_P', 'y_A'] as const;

/**
 * Shadow prices of the three machines. The machine with spare hours at the best plan has price 0;
 * the other two come from the dual equations of the two bike types, which are both made.
 */
export function threePrices(p: Params): [number, number, number] {
  const { spare } = optimum(p);
  const [i, j] = spare === 0 ? [1, 2] : [0, 1];
  const uv = dualPrices(p.machines[i] as Constraint, p.machines[j] as Constraint, p.p, p.q);
  const out: [number, number, number] = [0, 0, 0];
  out[i] = uv?.[0] ?? Number.NaN;
  out[j] = uv?.[1] ?? Number.NaN;
  return out;
}

/** The asked machine's price if the dual equations used machines i and j (one of them spare). */
function pairPrice(p: Params, i: number, j: number): number {
  const [m, n] = i < j ? [i, j] : [j, i];
  const uv = dualPrices(p.machines[m] as Constraint, p.machines[n] as Constraint, p.p, p.q);
  if (!uv) return Number.NaN;
  return p.asked === m ? uv[0] : uv[1];
}

function wrongAnswers(p: Params) {
  const best = optimum(p);
  const prices = threePrices(p);
  const k = p.machines[p.asked];
  const binding = [0, 1, 2].filter((i) => i !== best.spare);
  const isSpare = p.asked === best.spare;
  // Wrong pair: the spare machine treated as binding (painting, the middle line, always binds).
  const wrongPair = pairPrice(p, p.asked, isSpare ? 1 : best.spare);
  // The other price: painting's when the spare machine is asked, else the other binding machine's.
  const other = isSpare ? 1 : (binding.find((i) => i !== p.asked) as number);
  const out = [
    { value: round(prices[other] as number, 2), mistakeCode: 'OTHER_RESOURCE_PRICE' },
    ...(wrongPair > 0 ? [{ value: round(wrongPair, 2), mistakeCode: 'WRONG_BINDING_PAIR' }] : []),
    { value: round(bestProfitPerHour(k, p.p, p.q), 2), mistakeCode: 'PROFIT_PER_HOUR' },
  ];
  return isSpare ? [{ value: best.unused, mistakeCode: 'SLACK_NOT_PRICE' }, ...out] : out;
}

const answerOf = (p: Params) => round(threePrices(p)[p.asked], 2);

/** OP03, difficulty 3: the shadow price of one of three machines, using complementary slackness. */
export const lpDualPriceThreeMachines: Generator<Params> = {
  id: 'lp-dual-price-three-machines',
  title: 'Shadow prices with three machines',
  topicId: 'OP03',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const base = lpUnusedHoursAtOptimum.params(rng);
      const params: Params = { ...base, asked: rng.int(0, 2) as 0 | 1 | 2 };
      const prices = threePrices(params);
      if (prices.some((y) => !Number.isFinite(y) || y < 0)) continue;
      if (cleanDistractors(answerOf(params), wrongAnswers(params), TWO_DP.tolerance, 0).length < 2)
        continue;
      return params;
    }
  },

  stem(p) {
    const [w, paint, a] = p.machines;
    return `A workshop assembles $x$ city bikes and $y$ mountain bikes a week. Welding allows $${inequality(w)}$ hours, painting $${inequality(paint)}$ hours and assembly $${inequality(a)}$ hours, with $x, y \\ge 0$. Each city bike earns a profit of $${num(p.p)}$ and each mountain bike $${num(p.q)}$. What is the shadow price of an hour of ${NAMES[p.asked]}? Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: answerOf(p), decimals: 2, ...TWO_DP }),

  steps(p) {
    const best = optimum(p);
    const spare = p.machines[best.spare];
    const [i, j] = best.spare === 0 ? [1, 2] : [0, 1];
    const prices = threePrices(p);
    const sum = p.machines.reduce((s, k, n) => s + k.c * (prices[n] as number), 0);
    return [
      {
        text: 'Solve the primal first: work out the profit at every corner and take the best plan.',
        latex: `${bikeCorners(p)
          .map((pt) => `\\pi${point(pt)} = ${num(value(p.p, p.q, pt))}`)
          .join(',\\; ')} \\Rightarrow \\text{best } ${point(best.at)}`,
        why: 'Complementary slackness links the dual prices to the best plan, so we need to know which machines that plan uses fully.',
        result: best.profit,
      },
      {
        text: `At the best plan, ${NAMES[best.spare]} has hours to spare, so its shadow price is 0.`,
        latex: `${num(spare.c)} - ${num(best.used)} = ${num(best.unused)} > 0 \\;\\Rightarrow\\; ${SYMBOLS[best.spare]} = 0`,
        why: 'A resource that is not used up is worth nothing at the margin: one more hour of it would just add to the hours left over (complementary slackness).',
      },
      {
        text: `Both bike types are made, so their dual constraints hold with equality. Solve them for the prices of ${NAMES[i]} and ${NAMES[j]}.`,
        latex: dualSolution(p.machines[i] as Constraint, p.machines[j] as Constraint, p.p, p.q, [
          SYMBOLS[i],
          SYMBOLS[j],
        ] as [string, string]),
        why: 'For a product that is made, the hours it uses valued at the shadow prices are worth exactly its profit. With the spare machine’s price at 0, two equations remain for the two binding machines.',
      },
      {
        text: 'Check with strong duality, then read off the price asked for.',
        latex: `${p.machines.map((k, n) => `${num(k.c)}${SYMBOLS[n]}`).join(' + ')} = ${num(sum)} = \\pi_{\\max}, \\quad ${SYMBOLS[p.asked]} = ${num(prices[p.asked] as number)}`,
        why: 'The hours available valued at the shadow prices add up to the maximum profit, which confirms the prices are the optimal dual solution.',
        result: answerOf(p),
      },
    ];
  },

  distractors(p) {
    return cleanDistractors(answerOf(p), wrongAnswers(p), TWO_DP.tolerance, TWO_DP.relTolerance);
  },
};

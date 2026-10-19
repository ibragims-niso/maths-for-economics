import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { mm1L, mm1Lq, mm2L, mm2Lq } from './queue';

const CONTEXTS = {
  bank: {
    intro: (l: number) =>
      `Customers arrive at a bank branch as a Poisson process, $${l}$ per hour.`,
    serve: (m: number) => `Each teller serves on average $${m}$ customers per hour`,
    server: 'teller',
    customer: 'customer',
    place: 'the branch',
  },
  service: {
    intro: (l: number) =>
      `Visitors arrive at a public service centre as a Poisson process, $${l}$ per hour.`,
    serve: (m: number) => `Each clerk serves on average $${m}$ visitors per hour`,
    server: 'clerk',
    customer: 'visitor',
    place: 'the centre',
  },
  repairs: {
    intro: (l: number) =>
      `Broken machines in a factory come to the repair shop as a Poisson process, $${l}$ per hour.`,
    serve: (m: number) => `Each mechanic repairs on average $${m}$ machines per hour`,
    server: 'mechanic',
    customer: 'machine',
    place: 'the repair shop',
  },
} as const;

type Context = keyof typeof CONTEXTS;

interface Params {
  context: Context;
  /** Arrival rate λ per hour. */
  lambda: number;
  /** Service rate μ per server per hour. */
  mu: number;
  /** Cost of one server per hour. */
  serverCost: number;
  /** Cost of one customer-hour spent in the system. */
  waitCost: number;
}

const MONEY = { tolerance: 0.05, relTolerance: 0.00005 } as const;

/** Total hourly cost with one server and with two servers sharing one queue. */
export function costs(p: Params): { one: number; two: number } {
  return {
    one: p.serverCost + p.waitCost * mm1L(p.lambda, p.mu),
    two: 2 * p.serverCost + p.waitCost * mm2L(p.lambda, p.mu),
  };
}

const cheapest = (p: Params) => {
  const { one, two } = costs(p);
  return Math.min(one, two);
};

function wrongAnswers(p: Params) {
  const { one, two } = costs(p);
  const s = p.serverCost;
  const w = p.waitCost;
  const queueOnly = Math.min(s + w * mm1Lq(p.lambda, p.mu), 2 * s + w * mm2Lq(p.lambda, p.mu));
  const split = Math.min(one, 2 * s + w * 2 * mm1L(p.lambda / 2, p.mu));
  return cleanDistractors(
    round(cheapest(p), 2),
    [
      { value: round(Math.max(one, two), 2), mistakeCode: 'DEARER_OPTION' },
      { value: round(queueOnly, 2), mistakeCode: 'LQ_NOT_L' },
      { value: round(split, 2), mistakeCode: 'SPLIT_QUEUE' },
    ],
    MONEY.tolerance,
    MONEY.relTolerance,
  );
}

/** "= 4" when exact at 4 decimals, otherwise "\approx 0.9524". */
const eq4 = (x: number) =>
  Math.abs(x - round(x, 4)) < 1e-12 ? `= ${num(x, 4)}` : `\\approx ${num(x, 4)}`;

/** SP05, difficulty 3: the lower total hourly cost (servers plus waiting) of one server or two servers with a shared queue. */
export const mm2StaffingCost: Generator<Params> = {
  id: 'mm2-staffing-cost',
  title: 'One server or two?',
  topicId: 'SP05',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const mu = rng.int(6, 30);
      const p: Params = {
        context: rng.pick(Object.keys(CONTEXTS) as Context[]),
        lambda: rng.int(Math.ceil(mu / 2), mu - 1),
        mu,
        serverCost: rng.int(4, 20) * 2,
        waitCost: rng.int(3, 40),
      };
      // One server must be stable too (ρ = λ/μ between 0.5 and 0.9), so both options exist.
      if (2 * p.lambda < p.mu || 10 * p.lambda > 9 * p.mu) continue;
      const { one, two } = costs(p);
      // A clear decision (at least 2 apart, well clear of rounding), so the dearer option is a
      // distinct wrong answer.
      if (Math.abs(one - two) < 2) continue;
      if (wrongAnswers(p).length < 2) continue;
      return p;
    }
  },

  stem(p) {
    const c = CONTEXTS[p.context];
    return `${c.intro(p.lambda)} ${c.serve(p.mu)}, with exponential service times, and with two ${c.server}s there is one shared queue. A ${c.server} costs $${p.serverCost}$ per hour, and every hour a ${c.customer} spends in ${c.place} (waiting or being served) costs $${p.waitCost}$. Compare one ${c.server} with two: what is the lower total cost per hour, ${c.server}s plus waiting? Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: round(cheapest(p), 2), decimals: 2, ...MONEY }),

  steps(p) {
    const { lambda, mu, serverCost: s, waitCost: w } = p;
    const L1 = mm1L(lambda, mu);
    const rho = lambda / (2 * mu);
    const L2 = mm2L(lambda, mu);
    const { one, two } = costs(p);
    const best = round(Math.min(one, two), 2);
    return [
      {
        text: 'One server: find L for the M/M/1 queue and the total cost.',
        latex: `L_1 = \\dfrac{${lambda}}{${mu} - ${lambda}} ${eq4(L1)},\\quad TC(1) = ${s} + ${w} \\times ${num(L1, 4)} = ${num(one, 2)}`,
        why: 'On average L customers are in the system, so every hour L customer-hours of waiting are used up, each costing w.',
        result: round(one, 2),
      },
      {
        text: 'Two servers: find the utilisation per server and L for the M/M/2 queue.',
        latex: `\\rho = \\dfrac{${lambda}}{2 \\times ${mu}} ${eq4(rho)},\\quad L_2 = \\dfrac{2\\rho}{1 - \\rho^2} ${eq4(L2)}`,
        why: 'With one shared queue the two servers form an M/M/2 system; L = Lq + λ/μ simplifies to 2ρ/(1 − ρ²) when c = 2.',
        result: round(L2, 4),
      },
      {
        text: 'Total cost with two servers.',
        latex: `TC(2) = 2 \\times ${s} + ${w} \\times ${num(L2, 4)} = ${num(two, 2)}`,
        why: 'Twice the staff cost, but far fewer customer-hours lost to waiting.',
        result: round(two, 2),
      },
      {
        text: 'Choose the cheaper option.',
        latex: `\\min\\{${num(one, 2)},\\ ${num(two, 2)}\\} = ${num(best, 2)}`,
        why:
          two < one
            ? 'The second server saves more waiting cost than it costs, so two servers are cheaper.'
            : 'The waiting time saved is worth less than the second server costs, so one server is cheaper.',
        result: best,
      },
    ];
  },

  distractors: wrongAnswers,
};

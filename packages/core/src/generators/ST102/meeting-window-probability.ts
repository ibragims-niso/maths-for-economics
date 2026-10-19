import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

const CONTEXTS = {
  traders: {
    who: 'Two traders agree to meet at a market',
    each: 'Each arrives at a random moment in that window, independently of the other, and waits',
    ask: 'What is the probability that they meet?',
  },
  delivery: {
    who: 'A supplier’s van and a warehouse worker are both due at a loading bay',
    each: 'Each arrives at a random moment in that window, independently of the other, and waits',
    ask: 'What is the probability that the worker and the van are at the bay at the same time?',
  },
  partners: {
    who: 'Two business partners plan to sign a contract at a café',
    each: 'Each arrives at a random moment in that window, independently of the other, and waits',
    ask: 'What is the probability that they meet and sign?',
  },
} as const;

type Context = keyof typeof CONTEXTS;

interface Params {
  /** Start of the window, hour of the day. */
  startHour: number;
  /** Length of the window in minutes. */
  window: number;
  /** How long each person waits, in minutes (less than half the window). */
  wait: number;
  context: Context;
}

const PROB = { tolerance: 0.0005, relTolerance: 0 } as const;

const meet = (p: Params) => 1 - (1 - p.wait / p.window) ** 2;

/** "9:00", "10:30". */
export function clock(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}{:}${m < 10 ? '0' : ''}${m}`;
}

/** ST102, difficulty 3: geometric probability that two uniform arrivals in a window meet. */
export const meetingWindowProbability: Generator<Params> = {
  id: 'meeting-window-probability',
  title: 'Chance that two arrivals meet',
  topicId: 'ST102',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    const window = rng.pick([30, 40, 60, 90, 120] as const);
    return {
      startHour: rng.int(8, 16),
      window,
      wait: rng.int(3, Math.floor(window / 2) - 1),
      context: rng.pick(Object.keys(CONTEXTS) as Context[]),
    };
  },

  stem(p) {
    const c = CONTEXTS[p.context];
    const from = p.startHour * 60;
    return `${c.who} between $${clock(from)}$ and $${clock(from + p.window)}$. ${c.each} $${num(p.wait)}$ minutes for the other before leaving (or until the window ends). ${c.ask} Give your answer to 4 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: round(meet(p), 4), decimals: 4, ...PROB }),

  steps(p) {
    const T = p.window;
    const w = p.wait;
    const square = T * T;
    const corners = (T - w) * (T - w);
    return [
      {
        text: 'Model the two arrival times as a point (x, y) in a square.',
        latex: `0 \\le x \\le ${T},\\ 0 \\le y \\le ${T},\\quad \\text{area} = ${num(square, 0)}`,
        why: 'Each time is spread evenly over the window and the two are independent, so every point of the square is equally likely: probability is a share of the area.',
        result: square,
      },
      {
        text: 'They meet when the arrival times differ by at most the waiting time.',
        latex: `|x - y| \\le ${w}`,
        why: 'Whoever comes first waits w minutes, so the second must arrive within w minutes of the first.',
      },
      {
        text: 'Find the area where they miss each other.',
        latex: `2 \\cdot \\tfrac12 (${T} - ${w})^2 = ${num(corners, 0)}`,
        why: 'Outside the band |x − y| ≤ w are two corner triangles, each with both short sides equal to T − w.',
        result: corners,
      },
      {
        text: 'Divide the meeting area by the whole square.',
        latex: `P = \\dfrac{${num(square, 0)} - ${num(corners, 0)}}{${num(square, 0)}} = 1 - \\left(1 - \\tfrac{${w}}{${T}}\\right)^2 = ${num(round(meet(p), 4), 4)}`,
        why: 'Geometric probability: the favourable area divided by the area of all possible outcomes.',
        result: round(meet(p), 4),
      },
    ];
  },

  distractors(p) {
    const r = p.wait / p.window;
    return cleanDistractors(
      round(meet(p), 4),
      [
        { value: round(2 * r, 4), mistakeCode: 'EDGE_IGNORED' },
        { value: round((1 - r) ** 2, 4), mistakeCode: 'NOT_COMPLEMENT' },
        { value: round(1 - (1 - r) ** 2 / 2, 4), mistakeCode: 'ONE_TRIANGLE' },
      ],
      PROB.tolerance,
      PROB.relTolerance,
    );
  },
};

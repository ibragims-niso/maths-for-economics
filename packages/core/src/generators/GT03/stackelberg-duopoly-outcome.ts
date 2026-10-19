import { round } from '../../engine/grading';
import type { Distractor, Generator, Step } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Inverse demand P = a − b(q₁ + q₂). */
  a: number;
  b: number;
  /** Marginal cost of each firm (no fixed cost). */
  c: number;
  /** Drawn first so the follower's output (a − c)/(4b) is whole; the leader makes twice this. */
  u: number;
  /** What the question asks for. */
  ask: 'leader' | 'follower' | 'price';
}

const coef = (k: number) => (k === 1 ? '' : num(k));
/** "b·x" in LaTeX, just "x" when b = 1. */
const times = (k: number, x: number) => (k === 1 ? num(x) : `${num(k)} \\cdot ${num(x)}`);
const demand = (p: Params) => `P = ${num(p.a)} - ${coef(p.b)}(q_1 + q_2)`;

const leader = (p: Params) => 2 * p.u;
const follower = (p: Params) => p.u;
const price = (p: Params) => p.a - p.b * 3 * p.u;

const target = (p: Params) =>
  p.ask === 'leader' ? leader(p) : p.ask === 'follower' ? follower(p) : price(p);

function candidates(p: Params): Distractor[] {
  const cournotQ = round((p.a - p.c) / (3 * p.b), 2);
  if (p.ask === 'price')
    return [
      { value: round((p.a + 2 * p.c) / 3, 2), mistakeCode: 'COURNOT_SOLUTION' },
      { value: p.a - p.b * leader(p), mistakeCode: 'FIRM_NOT_MARKET' },
    ];
  const own = p.ask === 'leader' ? leader(p) : follower(p);
  const rival = p.ask === 'leader' ? follower(p) : leader(p);
  return [
    { value: cournotQ, mistakeCode: 'COURNOT_SOLUTION' },
    { value: rival, mistakeCode: 'SWAPPED_ROLES' },
    { value: own + rival, mistakeCode: 'FIRM_NOT_MARKET' },
  ];
}

const QUESTION = {
  leader: 'How much does firm 1, the leader, produce in the subgame-perfect equilibrium?',
  follower: 'How much does firm 2, the follower, produce in the subgame-perfect equilibrium?',
  price: 'What is the market price in the subgame-perfect equilibrium?',
} as const;

/** GT03, difficulty 2: Stackelberg duopoly with linear demand: leader's or follower's output, or the price. */
export const stackelbergDuopolyOutcome: Generator<Params> = {
  id: 'stackelberg-duopoly-outcome',
  title: 'Stackelberg leader and follower',
  topicId: 'GT03',
  difficulty: 2,
  timeSec: 180,

  params(rng) {
    const b = rng.int(1, 5);
    const u = rng.int(3, 30);
    const c = rng.int(2, 40);
    return { a: c + 4 * b * u, b, c, u, ask: rng.pick(['leader', 'follower', 'price'] as const) };
  },

  stem: (p) =>
    `Two firms make the same product. Firm 1 chooses its output $q_1$ first; firm 2 sees $q_1$ and then chooses $q_2$. The market price is $${demand(p)}$, and each firm's cost is $${num(p.c)}$ per unit, with no fixed cost. ${QUESTION[p.ask]} Give your answer to 2 decimal places if it is not a whole number.`,

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: 2 }),

  steps: (p) => {
    const gap = p.a - p.c;
    const steps: Step[] = [
      {
        text: 'Last mover first: find the follower’s best response to any q₁.',
        latex: `${num(gap)} - ${coef(p.b)}q_1 - ${num(2 * p.b)}q_2 = 0 \\;\\Rightarrow\\; q_2 = \\dfrac{${num(gap)} - ${coef(p.b)}q_1}{${num(2 * p.b)}}`,
        why: 'Firm 2 sees q₁ before it chooses, so it maximises its own profit (P − c)q₂ taking q₁ as given; this is the same best response as in Cournot.',
      },
      {
        text: 'Put the follower’s response into the leader’s profit and maximise.',
        latex: `\\pi_1 = \\Big(${num(gap)} - ${coef(p.b)}q_1 - \\dfrac{${num(gap)} - ${coef(p.b)}q_1}{2}\\Big)q_1 = \\dfrac{${num(gap)} - ${coef(p.b)}q_1}{2}\\,q_1 \\;\\Rightarrow\\; q_1^* = \\dfrac{${num(gap)}}{${num(2 * p.b)}} = ${num(leader(p))}`,
        why: 'The leader foresees how firm 2 will react, so it treats q₂ as a function of q₁, not as a fixed number. Setting dπ₁/dq₁ = 0 gives q₁ = (a − c)/(2b).',
        result: leader(p),
      },
      {
        text: 'Find the follower’s output from its best response.',
        latex: `q_2^* = \\dfrac{${num(gap)} - ${times(p.b, leader(p))}}{${num(2 * p.b)}} = ${num(follower(p))}`,
        why: 'Backward induction: once the leader has chosen, the follower simply plays its best response.',
        result: follower(p),
      },
    ];
    if (p.ask === 'leader') return steps.slice(0, 2);
    if (p.ask === 'price')
      steps.push({
        text: 'Put total output into the demand curve.',
        latex: `P^* = ${num(p.a)} - ${coef(p.b)}(${num(leader(p))} + ${num(follower(p))}) = ${num(price(p))}`,
        why: 'The price depends on what both firms produce together.',
        result: price(p),
      });
    return steps;
  },

  distractors: (p) => cleanDistractors(target(p), candidates(p)),
};

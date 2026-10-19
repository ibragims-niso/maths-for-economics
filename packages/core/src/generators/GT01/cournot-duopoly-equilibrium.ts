import { round } from '../../engine/grading';
import type { Distractor, Generator, Step } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Inverse demand P = a − b(q₁ + q₂). */
  a: number;
  b: number;
  /** Marginal cost of each firm (no fixed cost). */
  c: number;
  /** Drawn first so the equilibrium output of each firm, (a − c)/(3b), is whole. */
  q: number;
  /** What the question asks for. */
  ask: 'firm' | 'total' | 'price';
}

const coef = (k: number) => (k === 1 ? '' : num(k));
const demand = (p: Params) => `P = ${num(p.a)} - ${coef(p.b)}(q_1 + q_2)`;
const price = (p: Params) => p.a - p.b * 2 * p.q;

const target = (p: Params) => (p.ask === 'firm' ? p.q : p.ask === 'total' ? 2 * p.q : price(p));

function candidates(p: Params): Distractor[] {
  const gap = p.a - p.c;
  const monopolyQ = gap / (2 * p.b);
  if (p.ask === 'firm')
    return [
      { value: round(monopolyQ, 2), mistakeCode: 'MONOPOLY_SOLUTION' },
      { value: round(gap / p.b, 2), mistakeCode: 'COMPETITIVE_SOLUTION' },
      { value: round(monopolyQ / 2, 2), mistakeCode: 'CARTEL_SHARE' },
    ];
  if (p.ask === 'total')
    return [
      { value: round(monopolyQ, 2), mistakeCode: 'MONOPOLY_SOLUTION' },
      { value: round(gap / p.b, 2), mistakeCode: 'COMPETITIVE_SOLUTION' },
      { value: p.q, mistakeCode: 'FIRM_NOT_MARKET' },
    ];
  return [
    { value: round((p.a + p.c) / 2, 2), mistakeCode: 'MONOPOLY_SOLUTION' },
    { value: p.c, mistakeCode: 'COMPETITIVE_SOLUTION' },
    { value: p.a - p.b * p.q, mistakeCode: 'FIRM_NOT_MARKET' },
  ];
}

const QUESTION = {
  firm: 'How much does each firm produce in the Nash (Cournot) equilibrium?',
  total: 'What is the total output of the market in the Nash (Cournot) equilibrium?',
  price: 'What is the market price in the Nash (Cournot) equilibrium?',
} as const;

/** GT01, difficulty 3: Cournot duopoly with linear demand: output per firm, total output or price. */
export const cournotDuopolyEquilibrium: Generator<Params> = {
  id: 'cournot-duopoly-equilibrium',
  title: 'Cournot duopoly equilibrium',
  topicId: 'GT01',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    const b = rng.int(1, 5);
    const q = rng.int(4, 40);
    const c = rng.int(2, 40);
    return { a: c + 3 * b * q, b, c, q, ask: rng.pick(['firm', 'total', 'price'] as const) };
  },

  stem: (p) =>
    `Two firms make the same product and choose their outputs $q_1$ and $q_2$ at the same time. The market price is $${demand(p)}$, and each firm's cost is $${num(p.c)}$ per unit, with no fixed cost. ${QUESTION[p.ask]}`,

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: 2 }),

  steps: (p) => {
    const steps: Step[] = [
      {
        text: 'Write firm 1’s profit, taking firm 2’s output as given.',
        latex: `\\pi_1 = \\big(${num(p.a)} - ${coef(p.b)}(q_1 + q_2)\\big)q_1 - ${num(p.c)}q_1`,
        why: 'Revenue is the price times firm 1’s own output, and the price falls when either firm produces more.',
      },
      {
        text: 'Set the derivative with respect to q₁ to zero to get firm 1’s best response.',
        latex: `${num(p.a - p.c)} - ${num(2 * p.b)}q_1 - ${coef(p.b)}q_2 = 0 \\;\\Rightarrow\\; q_1 = \\dfrac{${num(p.a - p.c)} - ${coef(p.b)}q_2}{${num(2 * p.b)}}`,
        why: `Firm 1 picks the output that maximises its own profit for each q₂; the second derivative is −${num(2 * p.b)} < 0, so this is a maximum.`,
      },
      {
        text: 'Use symmetry: in equilibrium both firms produce the same q, and each is a best response to the other.',
        latex: `q = \\dfrac{${num(p.a - p.c)} - ${coef(p.b)}q}{${num(2 * p.b)}} \\;\\Rightarrow\\; ${num(3 * p.b)}q = ${num(p.a - p.c)} \\;\\Rightarrow\\; q^* = ${num(p.q)}`,
        why: 'The firms have the same costs, so firm 2’s best response has the same form; the Nash equilibrium is where the two best-response lines cross, q* = (a − c)/(3b).',
        result: p.q,
      },
    ];
    if (p.ask === 'total')
      steps.push({
        text: 'Add the two outputs.',
        latex: `Q^* = 2 \\times ${num(p.q)} = ${num(2 * p.q)}`,
        why: 'Market output is the sum of what both firms produce.',
        result: 2 * p.q,
      });
    if (p.ask === 'price')
      steps.push({
        text: 'Put total output into the demand curve.',
        latex: `P^* = ${num(p.a)} - ${coef(p.b)}\\cdot ${num(2 * p.q)} = ${num(price(p))}`,
        why: 'The price depends on the output of both firms together, Q = q₁ + q₂ = 2q*.',
        result: price(p),
      });
    return steps;
  },

  distractors: (p) => cleanDistractors(target(p), candidates(p)),
};

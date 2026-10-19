import { round } from '../../engine/grading';
import type { Distractor, Generator, Step } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Surplus to be shared, in thousands (a multiple of 20, so every answer has ≤ 2 decimals). */
  pie: number;
  /** Discount factor in hundredths (a multiple of 5): δ = k/100. */
  k: number;
  /** Number of rounds: the firm offers in rounds 1 and 3, the union in round 2. */
  rounds: 2 | 3;
  /** keep: what the firm keeps in round 1; offer: what it offers the union in round 1. */
  ask: 'keep' | 'offer';
}

const MONEY = { tolerance: 0.05, relTolerance: 0.00005 } as const;

/** What the firm offers the union in round 1 (round-1 value), exact to 2 decimals. */
const offer = (p: Params) => {
  const d = p.k / 100;
  return round(p.rounds === 2 ? p.pie * d : p.pie * (d - d * d), 2);
};
const keep = (p: Params) => round(p.pie - offer(p), 2);
const target = (p: Params) => (p.ask === 'keep' ? keep(p) : offer(p));

function candidates(p: Params): Distractor[] {
  const d = p.k / 100;
  const half = { value: round(p.pie / 2, 2), mistakeCode: 'EQUAL_SPLIT' };
  const swapped = { value: p.ask === 'keep' ? offer(p) : keep(p), mistakeCode: 'SWAPPED_SHARES' };
  // Without discounting the last proposer takes the whole pie, so the first offer must be all or nothing.
  const lastIsFirm = p.rounds === 3;
  const noDiscount = {
    value: (p.ask === 'keep') === lastIsFirm ? p.pie : 0,
    mistakeCode: 'NO_DISCOUNT',
  };
  if (p.rounds === 2) return [swapped, half, noDiscount];
  // The two-round answer: stopping the backward induction one round early.
  const shortOffer = round(p.pie * d, 2);
  const short = {
    value: p.ask === 'keep' ? round(p.pie - shortOffer, 2) : shortOffer,
    mistakeCode: 'WRONG_ROUND_COUNT',
  };
  return [short, swapped, half, noDiscount];
}

/** GT03, difficulty 3: the first-round offer in a 2- or 3-round alternating-offer bargaining game. */
export const alternatingOfferFirstOffer: Generator<Params> = {
  id: 'alternating-offer-first-offer',
  title: 'Alternating-offer bargaining',
  topicId: 'GT03',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const p: Params = {
        pie: rng.int(5, 50) * 20,
        k: rng.int(6, 19) * 5,
        rounds: rng.pick([2, 3] as const),
        ask: rng.pick(['keep', 'offer'] as const),
      };
      // With δ = 0.5 and two rounds the answer, its complement and the equal split all coincide.
      if (p.rounds === 2 && p.k === 50) continue;
      return p;
    }
  },

  stem: (p) => {
    const order =
      p.rounds === 2
        ? 'The firm makes an offer in round 1; if the union rejects it, the union makes an offer in round 2'
        : 'The firm makes an offer in round 1; if the union rejects it, the union makes an offer in round 2; if the firm rejects that, the firm makes a final offer in round 3';
    const question =
      p.ask === 'keep'
        ? 'In the subgame-perfect equilibrium, how much does the firm keep for itself in round 1?'
        : 'In the subgame-perfect equilibrium, how much does the firm offer the union in round 1?';
    return `A firm and a union bargain over a surplus of $${num(p.pie)}$ thousand. ${order}. If the last offer is rejected, both get nothing. Each round of delay multiplies the value of any deal by $\\delta = ${num(p.k / 100)}$ for both sides. ${question} Give your answer in thousands to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: 2, ...MONEY }),

  steps: (p) => {
    const d = num(p.k / 100);
    const S = num(p.pie);
    const steps: Step[] =
      p.rounds === 2
        ? [
            {
              text: 'Start in the last round: the union proposes and the firm can only accept or get nothing.',
              latex: `\\text{Round 2: union } ${S}, \\quad \\text{firm } 0`,
              why: 'Rejecting the final offer leaves the firm with nothing, so it accepts any offer, even 0; the union keeps the whole surplus.',
              result: p.pie,
            },
          ]
        : [
            {
              text: 'Start in the last round: the firm proposes and the union can only accept or get nothing.',
              latex: `\\text{Round 3: firm } ${S}, \\quad \\text{union } 0`,
              why: 'Rejecting the final offer leaves the union with nothing, so it accepts any offer; the firm keeps the whole surplus.',
              result: p.pie,
            },
            {
              text: 'Round 2: the union must offer the firm what the firm would get by waiting one round.',
              latex: `\\text{firm } ${d} \\times ${S} = ${num((p.k / 100) * p.pie)}, \\quad \\text{union } ${S} - ${num((p.k / 100) * p.pie)} = ${num(p.pie - (p.k / 100) * p.pie)}`,
              why: 'A deal one round later is worth only δ times as much today, so the firm accepts δ times its round-3 payoff, and the union keeps the rest.',
              result: round(p.pie - (p.k / 100) * p.pie, 2),
            },
          ];
    const waitValue = p.rounds === 2 ? S : num(p.pie - (p.k / 100) * p.pie);
    steps.push({
      text: 'Round 1: the firm offers the union exactly what the union would get by rejecting, discounted one round.',
      latex: `\\text{offer} = ${d} \\times ${waitValue} = ${num(offer(p))}`,
      why: 'The union accepts any offer at least as good as rejecting and waiting; offering more would only cost the firm.',
      result: offer(p),
    });
    if (p.ask === 'keep')
      steps.push({
        text: 'The firm keeps the rest of the surplus.',
        latex: `${S} - ${num(offer(p))} = ${num(keep(p))}`,
        why: 'The offer is accepted at once, so the whole surplus is shared in round 1 and nothing is lost to delay.',
        result: keep(p),
      });
    return steps;
  },

  distractors: (p) =>
    cleanDistractors(target(p), candidates(p), MONEY.tolerance, MONEY.relTolerance),
};

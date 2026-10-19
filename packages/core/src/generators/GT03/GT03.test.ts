import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { alternatingOfferFirstOffer } from './alternating-offer-first-offer';
import type { EntryGame } from './entry';
import { entryCommitmentThreshold } from './entry-commitment-threshold';
import { entryGameSpePayoff } from './entry-game-spe-payoff';
import { stackelbergDuopolyOutcome } from './stackelberg-duopoly-outcome';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };
const SLOW = 30_000;

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, problem: pr };
};

const atMost2Decimals = (x: number) => Math.abs(x * 100 - Math.round(x * 100)) < 1e-6;

type EntrantMove = 'In' | 'Out';
type IncumbentMove = 'Fight' | 'Accommodate';

/** Payoffs (entrant, incumbent) of a strategy profile: the incumbent's plan matters only after entry. */
function outcome(g: EntryGame, e: EntrantMove, i: IncumbentMove): [number, number] {
  if (e === 'Out') return [0, g.monopoly];
  return i === 'Fight' ? [-g.loss, g.fight] : [g.share, g.accommodate];
}

/**
 * Subgame-perfect equilibria found by checking all four strategy profiles, not by folding back:
 * the incumbent's plan must be best in the subgame after entry, and the whole profile must be a
 * Nash equilibrium (neither player gains by changing strategy alone).
 */
function speByEnumeration(g: EntryGame): [number, number][] {
  const out: [number, number][] = [];
  for (const e of ['In', 'Out'] as const)
    for (const i of ['Fight', 'Accommodate'] as const) {
      const [ue, ui] = outcome(g, e, i);
      const other = i === 'Fight' ? 'Accommodate' : 'Fight';
      const crediblePlan = outcome(g, 'In', i)[1] >= outcome(g, 'In', other)[1];
      const entrantBest = ue >= outcome(g, e === 'In' ? 'Out' : 'In', i)[0];
      const incumbentBest = ui >= outcome(g, e, other)[1];
      if (crediblePlan && entrantBest && incumbentBest) out.push([ue, ui]);
    }
  return out;
}

const validGame = (g: EntryGame) =>
  [g.monopoly, g.accommodate, g.fight, g.share, g.loss].every((x) => x % 5 === 0) &&
  g.monopoly > g.accommodate &&
  g.monopoly > g.fight &&
  g.accommodate > 0 &&
  g.fight !== g.accommodate &&
  g.share > 0 &&
  g.loss > 0;

describe('entry-game-spe-payoff', { timeout: SLOW }, () => {
  it('matches the only profile that is a Nash equilibrium with a credible plan after entry', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, problem } = solve(entryGameSpePayoff, seed);
        expect(validGame(p.game)).toBe(true);
        const spe = speByEnumeration(p.game);
        expect(spe).toHaveLength(1);
        const [ue, ui] = spe[0] ?? [Number.NaN, Number.NaN];
        expect(value).toBe(p.asked === 'entrant' ? ue : ui);
        expect(problem.distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('when the threat is not credible, the NON_CREDIBLE_THREAT distractor is a real Nash payoff', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, problem } = solve(entryGameSpePayoff, seed);
        const g = p.game;
        if (g.fight > g.accommodate) return;
        // (Out, Fight) is a Nash equilibrium: the entrant fears the fight, the incumbent never has to act.
        expect(-g.loss).toBeLessThan(0);
        const threat = problem.distractors.find((d) => d.mistakeCode === 'NON_CREDIBLE_THREAT');
        expect(threat?.value).toBe(outcome(g, 'Out', 'Fight')[p.asked === 'entrant' ? 0 : 1]);
      }),
      RUNS,
    );
  });

  it('reproduces Example 1 in GT03 (M = 100, A = 40, F = 10, entrant 30 or −20)', () => {
    const game = { monopoly: 100, accommodate: 40, fight: 10, share: 30, loss: 20 };
    expect(entryGameSpePayoff.answer({ game, asked: 'incumbent' })).toMatchObject({ value: 40 });
    expect(entryGameSpePayoff.answer({ game, asked: 'entrant' })).toMatchObject({ value: 30 });
  });
});

describe('entry-commitment-threshold', { timeout: SLOW }, () => {
  it('penalty: the smallest whole P for which fighting is at least as good as accommodating', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, problem } = solve(entryCommitmentThreshold, seed);
        const g = p.game;
        expect(validGame(g)).toBe(true);
        expect(g.fight).toBeLessThan(g.accommodate);
        expect(problem.distractors.length).toBeGreaterThanOrEqual(2);
        if (p.ask !== 'penalty') return;
        let P = 0;
        while (g.fight < g.accommodate - P) P++;
        expect(value).toBe(P);
        // With that penalty the game solved by enumeration has the entrant staying out.
        const withPenalty = { ...g, accommodate: g.accommodate - P };
        expect(speByEnumeration(withPenalty)).toContainEqual([0, g.monopoly]);
      }),
      RUNS,
    );
  });

  it('cost: the largest whole K at which commitment pays at least the accommodation profit', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(entryCommitmentThreshold, seed);
        if (p.ask !== 'cost') return;
        const g = p.game;
        const without = speByEnumeration(g)[0]?.[1];
        expect(without).toBe(g.accommodate);
        let K = 0;
        while (g.monopoly - (K + 1) >= g.accommodate) K++;
        expect(value).toBe(K);
        expect(value).toBeGreaterThan(0);
      }),
      RUNS,
    );
  });

  it('reproduces Example 1 in GT03: penalty 30, commitment worth up to 60', () => {
    const game = { monopoly: 100, accommodate: 40, fight: 10, share: 30, loss: 20 };
    expect(entryCommitmentThreshold.answer({ game, ask: 'penalty' })).toMatchObject({ value: 30 });
    expect(entryCommitmentThreshold.answer({ game, ask: 'cost' })).toMatchObject({ value: 60 });
  });
});

/** The maximiser of a concave function on [lo, hi], by ternary search. */
function argmax(f: (x: number) => number, lo: number, hi: number): number {
  let a = lo;
  let b = hi;
  for (let k = 0; k < 200; k++) {
    const m1 = a + (b - a) / 3;
    const m2 = b - (b - a) / 3;
    if (f(m1) < f(m2)) a = m1;
    else b = m2;
  }
  return (a + b) / 2;
}

describe('stackelberg-duopoly-outcome', { timeout: SLOW }, () => {
  it('agrees with a numerical search: follower best-responds, leader beats its neighbours', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, problem } = solve(stackelbergDuopolyOutcome, seed);
        const P = (q1: number, q2: number) => p.a - p.b * (q1 + q2);
        const cap = (p.a - p.c) / p.b;
        const follow = (q1: number) =>
          argmax((q2) => (P(q1, q2) - p.c) * q2, 0, Math.max(cap - q1, 0));
        const leaderProfit = (x: number) => (P(x, follow(x)) - p.c) * x;
        const q1 = 2 * p.u;
        // The leader's output beats nearby outputs once the follower's reaction is taken into account.
        expect(leaderProfit(q1)).toBeGreaterThan(leaderProfit(q1 - 0.5));
        expect(leaderProfit(q1)).toBeGreaterThan(leaderProfit(q1 + 0.5));
        const q2 = follow(q1);
        expect(Math.abs(q2 - p.u)).toBeLessThan(1e-3);
        const expected = p.ask === 'leader' ? q1 : p.ask === 'follower' ? q2 : P(q1, q2);
        expect(Math.abs(value - expected)).toBeLessThan(0.01);
        expect(Number.isInteger(value)).toBe(true);
        expect(P(q1, q2)).toBeGreaterThan(p.c);
        expect(problem.distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('gives the leader more than the Cournot output and the follower less', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p } = solve(stackelbergDuopolyOutcome, seed);
        const cournot = (p.a - p.c) / (3 * p.b);
        expect(2 * p.u).toBeGreaterThan(cournot);
        expect(p.u).toBeLessThan(cournot);
      }),
      RUNS,
    );
  });

  it('reproduces Example 2 in GT03 (P = 100 − 2Q, c = 10)', () => {
    const base = { a: 100, b: 2, c: 10, u: 11.25 };
    expect(stackelbergDuopolyOutcome.answer({ ...base, ask: 'leader' })).toMatchObject({
      value: 22.5,
    });
    expect(stackelbergDuopolyOutcome.answer({ ...base, ask: 'follower' })).toMatchObject({
      value: 11.25,
    });
    expect(stackelbergDuopolyOutcome.answer({ ...base, ask: 'price' })).toMatchObject({
      value: 32.5,
    });
  });
});

/** First proposer's share by folding back round by round, in each round's own money. */
function firstProposerShare(pie: number, delta: number, rounds: number): number {
  let proposer = pie; // the last proposer takes everything
  for (let t = rounds - 1; t >= 1; t--) proposer = pie - delta * proposer;
  return proposer;
}

describe('alternating-offer-first-offer', { timeout: SLOW }, () => {
  it('agrees with folding back round by round and with the closed form S(1 − (−δ)^T)/(1 + δ)', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, problem } = solve(alternatingOfferFirstOffer, seed);
        const d = p.k / 100;
        const share = firstProposerShare(p.pie, d, p.rounds);
        const closed = (p.pie * (1 - (-d) ** p.rounds)) / (1 + d);
        expect(share).toBeCloseTo(closed, 9);
        const expected = p.ask === 'keep' ? share : p.pie - share;
        expect(Math.abs(value - expected)).toBeLessThan(1e-6);
        expect(atMost2Decimals(value)).toBe(true);
        expect(value).toBeGreaterThan(0);
        expect(value).toBeLessThan(p.pie);
        expect(problem.distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('the union accepts: the offer equals what rejecting is worth to it today', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, problem } = solve(alternatingOfferFirstOffer, seed);
        const d = p.k / 100;
        const unionNextRound = firstProposerShare(p.pie, d, p.rounds - 1);
        const offerStep = problem.steps.find((s) => s.latex.startsWith('\\text{offer}'));
        expect(offerStep?.result).toBeCloseTo(d * unionNextRound, 6);
      }),
      RUNS,
    );
  });

  it('reproduces Example 3 in GT03 (surplus 100, δ = 0.8)', () => {
    const base = { pie: 100, k: 80 };
    const v = (rounds: 2 | 3, ask: 'keep' | 'offer') =>
      alternatingOfferFirstOffer.answer({ ...base, rounds, ask });
    expect(v(3, 'keep')).toMatchObject({ value: 84 });
    expect(v(3, 'offer')).toMatchObject({ value: 16 });
    expect(v(2, 'keep')).toMatchObject({ value: 20 });
    expect(v(2, 'offer')).toMatchObject({ value: 80 });
  });
});

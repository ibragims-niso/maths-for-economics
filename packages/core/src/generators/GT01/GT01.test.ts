import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { bimatrixNashPayoff } from './bimatrix-nash-payoff';
import { cournotDuopolyEquilibrium } from './cournot-duopoly-equilibrium';
import type { Bimatrix } from './game';
import { pureNashCount } from './pure-nash-count';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };
const SLOW = 30_000;

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, problem: pr };
};

/**
 * Nash equilibria found the long way, without the generators' best-reply helpers: a cell is an
 * equilibrium if no single deviation by A (another row) or by B (another column) pays more.
 */
function equilibriaByDeviation(g: Bimatrix): [number, number][] {
  const n = g.a.length;
  const out: [number, number][] = [];
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) {
      let stable = true;
      for (let k = 0; k < n; k++) {
        if ((g.a[k]?.[c] ?? 0) > (g.a[r]?.[c] ?? 0)) stable = false;
        if ((g.b[r]?.[k] ?? 0) > (g.b[r]?.[c] ?? 0)) stable = false;
      }
      if (stable) out.push([r, c]);
    }
  return out;
}

const allWhole = (g: Bimatrix, max: number) =>
  [...g.a.flat(), ...g.b.flat()].every((x) => Number.isInteger(x) && x >= 0 && x <= max);

/** Example 1 of GT01: the advertising prisoner's dilemma (rows/columns: None, Heavy). */
const ADVERTISING: Bimatrix = {
  a: [
    [10, 4],
    [12, 6],
  ],
  b: [
    [10, 12],
    [4, 6],
  ],
};

/** Example 2 of GT01: three prices (Low, Medium, High), a symmetric game. */
const PRICES: Bimatrix = (() => {
  const u = [
    [2, 6, 10],
    [3, 7, 9],
    [1, 5, 8],
  ];
  return { a: u, b: u.map((row, r) => row.map((_, c) => u[c]?.[r] ?? 0)) };
})();

describe('bimatrix-nash-payoff', { timeout: SLOW }, () => {
  it('asks for a payoff at the only cell where no firm gains by deviating alone', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(bimatrixNashPayoff, seed);
        const eq = equilibriaByDeviation(p.game);
        expect(eq).toHaveLength(1);
        const [r, c] = eq[0] ?? [0, 0];
        const expected = p.asked === 'A' ? p.game.a[r]?.[c] : p.game.b[r]?.[c];
        expect(value).toBe(expected);
      }),
      RUNS,
    );
  });

  it('has an equilibrium that is not the cell with the highest joint profit', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p } = solve(bimatrixNashPayoff, seed);
        const [r, c] = equilibriaByDeviation(p.game)[0] ?? [0, 0];
        const total = (i: number, j: number) => (p.game.a[i]?.[j] ?? 0) + (p.game.b[i]?.[j] ?? 0);
        const n = p.game.a.length;
        let best = -1;
        for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) best = Math.max(best, total(i, j));
        expect(best).toBeGreaterThan(total(r, c));
      }),
      RUNS,
    );
  });

  it('uses whole payoffs in range, 2×2 and 3×3 games, and at least three wrong answers', () => {
    const sizes = new Set<number>();
    const asked = new Set<string>();
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, problem } = solve(bimatrixNashPayoff, seed);
        const n = p.game.a.length;
        sizes.add(n);
        asked.add(p.asked);
        expect(allWhole(p.game, n === 2 ? 9 : 12)).toBe(true);
        expect(Number.isInteger(value)).toBe(true);
        expect(problem.distractors.length).toBeGreaterThanOrEqual(3);
      }),
      RUNS,
    );
    expect([...sizes].sort()).toEqual([2, 3]);
    expect(asked.size).toBe(2);
  });

  it('reproduces Examples 1 and 2 in GT01 (6 for heavy advertising, 7 at medium prices)', () => {
    expect(
      bimatrixNashPayoff.answer({ context: 'advertising', game: ADVERTISING, asked: 'A' }),
    ).toMatchObject({ value: 6 });
    expect(bimatrixNashPayoff.answer({ context: 'price', game: PRICES, asked: 'B' })).toMatchObject(
      { value: 7 },
    );
    expect(equilibriaByDeviation(PRICES)).toEqual([[1, 1]]);
  });
});

describe('pure-nash-count', { timeout: SLOW }, () => {
  it('counts the cells where no firm gains by deviating alone', () => {
    const answers = new Set<number>();
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, problem } = solve(pureNashCount, seed);
        expect(value).toBe(equilibriaByDeviation(p.game).length);
        expect(allWhole(p.game, 9)).toBe(true);
        expect(p.game.a).toHaveLength(2);
        expect(problem.distractors.length).toBeGreaterThanOrEqual(2);
        answers.add(value);
      }),
      RUNS,
    );
    expect([...answers].sort()).toEqual([0, 1, 2]);
  });

  it('has strict best replies (no ties), so every count is clear-cut', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p } = solve(pureNashCount, seed);
        for (const k of [0, 1]) {
          expect(p.game.a[0]?.[k]).not.toBe(p.game.a[1]?.[k]);
          expect(p.game.b[k]?.[0]).not.toBe(p.game.b[k]?.[1]);
        }
      }),
      RUNS,
    );
  });

  it('gives the counts of the classic games in GT01: dilemma 1, standards 2, inspection 0', () => {
    const count = (game: Bimatrix) => pureNashCount.answer({ context: 'price', game });
    expect(count(ADVERTISING)).toMatchObject({ value: 1 });
    const standards: Bimatrix = {
      a: [
        [4, 0],
        [0, 3],
      ],
      b: [
        [4, 0],
        [0, 3],
      ],
    };
    expect(count(standards)).toMatchObject({ value: 2 });
    // Rows: firm complies / cheats; columns: regulator inspects / does not.
    const inspection: Bimatrix = {
      a: [
        [0, 0],
        [-4, 3],
      ],
      b: [
        [-1, 0],
        [2, -2],
      ],
    };
    expect(count(inspection)).toMatchObject({ value: 0 });
    // Rows and columns: enter / stay out of a market with room for one firm.
    const entry: Bimatrix = {
      a: [
        [-2, 5],
        [0, 0],
      ],
      b: [
        [-2, 0],
        [5, 0],
      ],
    };
    expect(equilibriaByDeviation(entry)).toEqual([
      [0, 1],
      [1, 0],
    ]);
    expect(equilibriaByDeviation(standards)).toEqual([
      [0, 0],
      [1, 1],
    ]);
  });
});

describe('cournot-duopoly-equilibrium', { timeout: SLOW }, () => {
  const profit1 = (a: number, b: number, c: number, q1: number, q2: number) =>
    (a - b * (q1 + q2) - c) * q1;

  it('is where repeated best replies settle, and no firm gains by changing its output', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(cournotDuopolyEquilibrium, seed);
        // Each firm in turn picks the best output on a fine grid, given the other's output.
        let q1 = 0;
        let q2 = 0;
        const best = (other: number) => {
          let top = 0;
          let arg = 0;
          for (let x = 0; x <= (p.a - p.c) / p.b; x += 0.25) {
            const v = profit1(p.a, p.b, p.c, x, other);
            if (v > top) {
              top = v;
              arg = x;
            }
          }
          return arg;
        };
        for (let k = 0; k < 30; k++) {
          q1 = best(q2);
          q2 = best(q1);
        }
        expect(Math.abs(q1 - p.q)).toBeLessThanOrEqual(0.25);
        expect(Math.abs(q2 - p.q)).toBeLessThanOrEqual(0.25);
        const here = profit1(p.a, p.b, p.c, p.q, p.q);
        for (const d of [-1, -0.5, 0.5, 1])
          expect(profit1(p.a, p.b, p.c, p.q + d, p.q)).toBeLessThan(here);
        const total = 2 * p.q;
        const expected = p.ask === 'firm' ? p.q : p.ask === 'total' ? total : p.a - p.b * total;
        expect(value).toBe(expected);
      }),
      RUNS,
    );
  });

  it('has whole numbers, a price above cost and below the monopoly price, and three wrong answers', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, problem } = solve(cournotDuopolyEquilibrium, seed);
        for (const n of [p.a, p.b, p.c, p.q, value]) expect(Number.isInteger(n)).toBe(true);
        const price = p.a - 2 * p.b * p.q;
        expect(price).toBeGreaterThan(p.c);
        expect(price).toBeLessThan((p.a + p.c) / 2);
        expect(problem.distractors).toHaveLength(3);
      }),
      RUNS,
    );
  });

  it('reproduces Example 3 in GT01 (P = 100 − 2Q, cost 10: 15 each, 30 in total, price 40)', () => {
    const base = { a: 100, b: 2, c: 10, q: 15 };
    expect(cournotDuopolyEquilibrium.answer({ ...base, ask: 'firm' })).toMatchObject({ value: 15 });
    expect(cournotDuopolyEquilibrium.answer({ ...base, ask: 'total' })).toMatchObject({
      value: 30,
    });
    expect(cournotDuopolyEquilibrium.answer({ ...base, ask: 'price' })).toMatchObject({
      value: 40,
    });
  });
});

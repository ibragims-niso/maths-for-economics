import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { maxProfitQuadratic } from './max-profit-quadratic';
import { maxRevenueLinearDemand } from './max-revenue-linear-demand';
import { profitMaximisingPrice } from './profit-maximising-price';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, stem: pr.stem };
};

/** Largest value of f on a grid from `from` to `to`, and where it occurs (no vertex formula). */
const scan = (f: (x: number) => number, from: number, to: number, step: number) => {
  let bestX = from;
  let bestY = f(from);
  for (let x = from; x <= to + 1e-9; x += step) {
    if (f(x) > bestY) {
      bestY = f(x);
      bestX = x;
    }
  }
  return { x: bestX, y: bestY };
};

const isWhole = (x: number) => Number.isInteger(Math.round(x * 1e9) / 1e9);

// Stems should never show a coefficient of 1 ("1Q").
const noUnitCoefficient = /(?<![\d.])1Q/;

describe('max-revenue-linear-demand', () => {
  it('matches the largest revenue found by scanning every half unit of output', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, stem } = solve(maxRevenueLinearDemand, seed);
        expect(p.alpha).toBeGreaterThan(0);
        expect(p.beta).toBeGreaterThan(0);
        const revenue = (q: number) => (p.alpha - p.beta * q) * q;
        const top = scan(revenue, 0, p.alpha / p.beta, 0.5);
        expect(top.y).toBeCloseTo(value, 9);
        // Symmetry: the top is halfway between the roots 0 and α/β.
        expect(top.x).toBeCloseTo(p.alpha / p.beta / 2, 9);
        expect(p.alpha - p.beta * top.x).toBeGreaterThan(0);
        expect(value).toBeGreaterThan(0);
        expect(isWhole(value)).toBe(true);
        expect(stem).not.toMatch(noUnitCoefficient);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 in F06 (P = 60 − 2Q)', () => {
    const p = { alpha: 60, beta: 2, best: 15 };
    expect(maxRevenueLinearDemand.answer(p)).toMatchObject({ kind: 'numeric', value: 450 });
  });
});

describe('max-profit-quadratic', () => {
  it('matches the largest profit over all whole outputs, and the profit is positive', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, stem } = solve(maxProfitQuadratic, seed);
        const profit = (q: number) => -p.a * q * q + p.b * q - p.fixedCost;
        const top = scan(profit, 0, p.b / p.a, 1);
        expect(top.y).toBeCloseTo(value, 9);
        expect(value).toBeGreaterThan(0);
        expect(isWhole(value)).toBe(true);
        expect(value).not.toBe(p.best);
        // Break-even outputs (quadratic formula) sit symmetrically around the best output.
        const disc = p.b * p.b - 4 * p.a * p.fixedCost;
        expect(disc).toBeGreaterThan(0);
        const r1 = (-p.b + Math.sqrt(disc)) / (-2 * p.a);
        const r2 = (-p.b - Math.sqrt(disc)) / (-2 * p.a);
        expect(r1).toBeGreaterThan(0);
        expect((r1 + r2) / 2).toBeCloseTo(top.x, 9);
        expect(stem).not.toMatch(noUnitCoefficient);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 in F06 (π = −3Q² + 180Q − 1500)', () => {
    const p = { a: 3, b: 180, fixedCost: 1500, best: 30 };
    expect(maxProfitQuadratic.answer(p)).toMatchObject({ kind: 'numeric', value: 1200 });
  });
});

describe('profit-maximising-price', () => {
  it('is the demand price at the output with the largest profit', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, stem } = solve(profitMaximisingPrice, seed);
        const profit = (q: number) => (p.alpha - p.beta * q) * q - p.fixedCost - p.unitCost * q;
        const top = scan(profit, 0, p.alpha / p.beta, 0.5);
        expect(p.alpha - p.beta * top.x).toBeCloseTo(value, 9);
        expect(top.y).toBeGreaterThan(0); // the firm makes a profit at its best price
        expect(value).toBeGreaterThan(p.unitCost); // each unit sells above its cost
        expect(value).toBeLessThan(p.alpha); // some units are sold
        expect(value).toBeGreaterThan(p.alpha / 2); // above the revenue-maximising price
        expect(isWhole(value)).toBe(true);
        expect(stem).not.toMatch(noUnitCoefficient);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 in F06 (P = 120 − 3Q, C = 400 + 30Q)', () => {
    const p = { alpha: 120, beta: 3, unitCost: 30, fixedCost: 400, best: 15 };
    expect(profitMaximisingPrice.answer(p)).toMatchObject({ kind: 'numeric', value: 75 });
  });
});

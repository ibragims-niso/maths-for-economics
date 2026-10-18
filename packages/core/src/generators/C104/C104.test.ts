import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { chainRulePowerAtPoint } from './chain-rule-power-at-point';
import { costRateOverTime } from './cost-rate-over-time';
import { marginalRevenueProductLabour } from './marginal-revenue-product-labour';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors };
};

const hasAtMostDecimals = (x: number, d: number) =>
  Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-6;

/** Central difference: the slope of f at x without using any derivative rule. */
const slope = (f: (x: number) => number, x: number, h = 1e-5) => (f(x + h) - f(x - h)) / (2 * h);

const binomial = (n: number, k: number) => {
  let c = 1;
  for (let i = 1; i <= k; i++) c = (c * (n - i + 1)) / i;
  return c;
};

describe('chain-rule-power-at-point', () => {
  it('matches the numerical slope of the original function', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(chainRulePowerAtPoint, seed);
        const y = (x: number) =>
          p.form === 'power' ? (p.a * x + p.b) ** p.n : Math.sqrt(p.a * x * x + p.b);
        const numeric = slope(y, p.x0);
        expect(Math.abs(value - numeric)).toBeLessThanOrEqual(0.005 + 1e-4 * Math.abs(numeric));
        expect(hasAtMostDecimals(value, 2)).toBe(true);
        expect(p.x0).toBeGreaterThan(0);
      }),
      RUNS,
    );
  });

  it('agrees with expanding (ax + b)ⁿ by the binomial theorem and differentiating term by term', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(chainRulePowerAtPoint, seed);
        if (p.form !== 'power') return;
        let expanded = 0;
        for (let k = 1; k <= p.n; k++) {
          expanded += binomial(p.n, k) * k * p.a ** k * p.x0 ** (k - 1) * p.b ** (p.n - k);
        }
        expect(value).toBe(expanded);
        expect(Number.isInteger(p.n) && p.n >= 2).toBe(true);
        expect(p.a * p.x0 + p.b).toBeGreaterThan(0);
      }),
      RUNS,
    );
  });

  it('keeps the root whole in the square-root form', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p } = solve(chainRulePowerAtPoint, seed);
        if (p.form !== 'sqrt') return;
        const inside = p.a * p.x0 * p.x0 + p.b;
        expect(Number.isInteger(Math.sqrt(inside))).toBe(true);
        expect(p.b).toBeGreaterThan(0);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 in C104 (y = (2x + 1)³ at x = 2)', () => {
    const answer = chainRulePowerAtPoint.answer({ form: 'power', a: 2, b: 1, n: 3, x0: 2 });
    expect(answer.kind === 'numeric' && answer.value).toBe(150);
  });

  it('reproduces the square-root illustration in C104 (y = √(x² + 16) at x = 3)', () => {
    const answer = chainRulePowerAtPoint.answer({ form: 'sqrt', a: 1, b: 16, n: 0.5, x0: 3 });
    expect(answer.kind === 'numeric' && answer.value).toBe(0.6);
  });
});

describe('cost-rate-over-time', () => {
  it('matches the numerical slope of cost written directly as a function of time', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(costRateOverTime, seed);
        const q = (t: number) => (p.form === 'linear' ? p.m + p.r * t : p.m + p.r * t * t);
        const costAtTime = (t: number) => p.fixedCost + p.unitCost * q(t) + (p.h / 2) * q(t) * q(t);
        expect(Math.abs(value - slope(costAtTime, p.t0, 1e-3))).toBeLessThan(1e-2);
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThan(0);
        expect(q(p.t0)).toBeGreaterThan(0);
      }),
      RUNS,
    );
  });

  it('is close to the actual change in cost over the next hundredth of a week', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(costRateOverTime, seed);
        const q = (t: number) => (p.form === 'linear' ? p.m + p.r * t : p.m + p.r * t * t);
        const cost = (t: number) => p.fixedCost + p.unitCost * q(t) + (p.h / 2) * q(t) * q(t);
        const change = (cost(p.t0 + 0.01) - cost(p.t0)) / 0.01;
        expect(Math.abs(change - value) / value).toBeLessThan(0.02);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 in C104 (Q = 40 + 5t, C = 500 + 6Q + 0.5Q², t = 4)', () => {
    const answer = costRateOverTime.answer({
      form: 'linear',
      m: 40,
      r: 5,
      t0: 4,
      fixedCost: 500,
      unitCost: 6,
      h: 1,
    });
    expect(answer.kind === 'numeric' && answer.value).toBe(330);
  });
});

describe('marginal-revenue-product-labour', () => {
  it('equals the derivative of revenue written directly in terms of workers', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(marginalRevenueProductLabour, seed);
        // R(L) = αk√L − βk²L, so dR/dL = αk/(2√L) − βk², found without the chain rule.
        const L = p.root * p.root;
        const direct = (p.alpha * p.k) / (2 * Math.sqrt(L)) - p.beta * p.k * p.k;
        expect(value).toBeCloseTo(direct, 9);
        const revenueOfWorkers = (l: number) =>
          p.alpha * p.k * Math.sqrt(l) - p.beta * p.k * p.k * l;
        expect(Math.abs(value - slope(revenueOfWorkers, L, 1e-4))).toBeLessThan(1e-4);
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThan(0);
      }),
      RUNS,
    );
  });

  it('keeps the price and marginal revenue positive at the output produced', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p } = solve(marginalRevenueProductLabour, seed);
        const q = p.k * p.root;
        expect(p.alpha - 2 * p.beta * q).toBeGreaterThanOrEqual(5);
        expect(p.alpha - p.beta * q).toBeGreaterThan(0);
        expect(p.root).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 in C104 (Q = 4√L, R = 100Q − Q², L = 25)', () => {
    const answer = marginalRevenueProductLabour.answer({ k: 4, root: 5, alpha: 100, beta: 1 });
    expect(answer.kind === 'numeric' && answer.value).toBe(24);
  });
});

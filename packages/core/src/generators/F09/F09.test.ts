import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { sigmaLinearSum } from './sigma-linear-sum';
import { surveyInclusionExclusion } from './survey-inclusion-exclusion';
import { threeSetInclusionExclusion } from './three-set-inclusion-exclusion';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, stem: pr.stem };
};

/** People 0 … n−1 as a Set. */
const ids = (from: number, count: number) =>
  new Set(Array.from({ length: count }, (_, k) => from + k));
const intersect = <T>(x: Set<T>, y: Set<T>) => new Set([...x].filter((v) => y.has(v)));

describe('survey-inclusion-exclusion', () => {
  it('matches a head count of real sets built from the survey', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(surveyInclusionExclusion, seed);
        // Lay people out on a line: A takes the first |A| ids, B starts where the overlap starts.
        const A = ids(0, p.a);
        const B = ids(p.a - p.both, p.b);
        expect(intersect(A, B).size).toBe(p.both);
        const inUnion = new Set([...A, ...B]);
        expect(inUnion.size).toBeLessThanOrEqual(p.total);
        let outside = 0;
        for (let person = 0; person < p.total; person++) if (!inUnion.has(person)) outside++;
        expect(value).toBe(p.ask === 'neither' ? outside : inUnion.size);
      }),
      RUNS,
    );
  });

  it('keeps every Venn region non-empty and the answer a whole number', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(surveyInclusionExclusion, seed);
        expect(p.both).toBeGreaterThanOrEqual(5);
        expect(p.a - p.both).toBeGreaterThan(0);
        expect(p.b - p.both).toBeGreaterThan(0);
        expect(p.total - (p.a + p.b - p.both)).toBeGreaterThanOrEqual(5);
        expect(p.total % 10).toBe(0);
        expect(Number.isInteger(value) && value > 0).toBe(true);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 in F09 (500 households, 120 have neither)', () => {
    const p = {
      total: 500,
      a: 320,
      b: 210,
      both: 150,
      ask: 'neither',
      context: 'households',
    } as const;
    expect(surveyInclusionExclusion.answer(p)).toMatchObject({ kind: 'numeric', value: 120 });
    const codes = surveyInclusionExclusion.distractors(p).map((d) => [d.mistakeCode, d.value]);
    expect(codes).toEqual([
      ['UNION_NOT_COMPLEMENT', 380],
      ['OVERLAP_TWICE', 270],
    ]);
  });
});

describe('sigma-linear-sum', () => {
  it('equals the sum of the terms added one by one', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(sigmaLinearSum, seed);
        let total = 0;
        for (let i = p.from; i <= p.to; i++) total += p.a + p.b * i;
        expect(value).toBe(total);
      }),
      RUNS,
    );
  });

  it('uses limits and coefficients that read naturally', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(sigmaLinearSum, seed);
        expect(p.from).toBeGreaterThanOrEqual(2);
        expect(p.to - p.from).toBeGreaterThanOrEqual(3);
        expect(p.to).toBeLessThanOrEqual(24);
        expect(p.a).toBeGreaterThan(0);
        expect(p.b).toBeGreaterThan(0);
        expect(Number.isInteger(value) && value > 0).toBe(true);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 in F09 (Σ from 4 to 12 of 200 + 15i = 2880)', () => {
    const p = { a: 200, b: 15, from: 4, to: 12, context: 'sales' } as const;
    expect(sigmaLinearSum.answer(p)).toMatchObject({ kind: 'numeric', value: 2880 });
    const byCode = Object.fromEntries(
      sigmaLinearSum.distractors(p).map((d) => [d.mistakeCode, d.value]),
    );
    expect(byCode).toEqual({ CONSTANT_ONCE: 1280, OFF_BY_ONE: 2620, IGNORED_LOWER_LIMIT: 3570 });
  });
});

describe('three-set-inclusion-exclusion', () => {
  it('matches a head count of people placed in the seven Venn regions', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(threeSetInclusionExclusion, seed);
        // Recover each region from the published counts, then build the population.
        const abOnly = p.ab - p.abc;
        const acOnly = p.ac - p.abc;
        const bcOnly = p.bc - p.abc;
        const regions: [boolean, boolean, boolean, number][] = [
          [true, true, true, p.abc],
          [true, true, false, abOnly],
          [true, false, true, acOnly],
          [false, true, true, bcOnly],
          [true, false, false, p.a - abOnly - acOnly - p.abc],
          [false, true, false, p.b - abOnly - bcOnly - p.abc],
          [false, false, true, p.c - acOnly - bcOnly - p.abc],
        ];
        const people: [boolean, boolean, boolean][] = [];
        for (const [inA, inB, inC, count] of regions) {
          expect(count).toBeGreaterThan(0);
          for (let k = 0; k < count; k++) people.push([inA, inB, inC]);
        }
        expect(people.length).toBeLessThan(p.total);
        // The population reproduces every count in the question.
        const count = (f: (x: [boolean, boolean, boolean]) => boolean) => people.filter(f).length;
        expect(count(([x]) => x)).toBe(p.a);
        expect(count(([, y]) => y)).toBe(p.b);
        expect(count(([, , z]) => z)).toBe(p.c);
        expect(count(([x, y]) => x && y)).toBe(p.ab);
        expect(count(([x, , z]) => x && z)).toBe(p.ac);
        expect(count(([, y, z]) => y && z)).toBe(p.bc);
        const inSome = people.length;
        expect(value).toBe(p.ask === 'none' ? p.total - inSome : inSome);
      }),
      RUNS,
    );
  });

  it('keeps the survey a round number and the answer a whole number', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(threeSetInclusionExclusion, seed);
        expect(p.total % 10).toBe(0);
        expect(p.abc).toBeGreaterThanOrEqual(2);
        expect(Number.isInteger(value) && value > 0).toBe(true);
      }),
      RUNS,
    );
  });
});

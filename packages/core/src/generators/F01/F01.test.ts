import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Answer } from '../../engine/types';
import { cobbDouglasLabourNeeded } from './cobb-douglas-labour-needed';
import { cobbDouglasOutput } from './cobb-douglas-output';
import { exponentLawsSimplify } from './exponent-laws-simplify';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const numericValue = (answer: Answer) => {
  if (answer.kind !== 'numeric') throw new Error('numeric expected');
  return answer.value;
};

describe('exponent-laws-simplify', () => {
  it('agrees with the expression evaluated at x = 2 and x = 3', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { params: p, answer, distractors } = makeProblem(exponentLawsSimplify, seed);
        const n = numericValue(answer);
        expect(Number.isInteger(n)).toBe(true);
        // Powers of 2 are exact in floating point, so log2 gives back the exponent exactly.
        const at2 = ((2 ** p.a) ** p.b * 2 ** p.c) / 2 ** p.d;
        expect(Math.log2(at2)).toBe(n);
        const at3 = ((3 ** p.a) ** p.b * 3 ** p.c) / 3 ** p.d;
        expect(at3 / 3 ** n).toBeCloseTo(1, 9);
        expect(p.a).toBeGreaterThanOrEqual(2);
        expect(p.b).toBeGreaterThanOrEqual(2);
        expect(p.c === 0 || p.c === 1).toBe(false);
        expect(distractors.length).toBeGreaterThanOrEqual(3);
      }),
      RUNS,
    );
  });

  it('reproduces Example 1 in F01: (K²)³ · K⁻¹ / K³ = K²', () => {
    const p = { base: 'K', a: 2, b: 3, c: -1, d: 3 } as const;
    expect(exponentLawsSimplify.answer(p)).toEqual({ kind: 'numeric', value: 2, decimals: 0 });
    expect(exponentLawsSimplify.distractors(p).map((d) => d.value)).toEqual([1, -9, 1.67, -2]);
  });
});

describe('cobb-douglas-output', () => {
  it('equals A·K^α·L^β computed with real powers, and is a whole number', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { params: p, answer } = makeProblem(cobbDouglasOutput, seed);
        const q = numericValue(answer);
        const K = p.kRoot ** p.aDen;
        const L = p.lRoot ** p.bDen;
        const direct = p.A * K ** (p.aNum / p.aDen) * L ** (p.bNum / p.bDen);
        expect(Math.abs(q - direct) / q).toBeLessThan(1e-9);
        expect(Number.isInteger(q) && q > 0).toBe(true);
        expect(Number.isInteger(K) && K > 1 && Number.isInteger(L) && L > 1).toBe(true);
        expect(K).not.toBe(L);
        expect(Math.max(K, L)).toBeLessThanOrEqual(1296);
        expect(p.aNum / p.aDen).not.toBe(p.bNum / p.bDen);
        expect(p.aNum / p.aDen + p.bNum / p.bDen).toBeLessThanOrEqual(1);
        if (p.asDecimals) expect(p.aDen % 2 === 0 && p.bDen % 2 === 0).toBe(true);
      }),
      RUNS,
    );
  });

  it('reproduces Example 3 in F01: Q = 5K^(1/3)L^(2/3) at K = 8, L = 125 gives 250', () => {
    const p = { A: 5, aNum: 1, aDen: 3, bNum: 2, bDen: 3, kRoot: 2, lRoot: 5, asDecimals: false };
    expect(numericValue(cobbDouglasOutput.answer(p))).toBe(250);
    expect(cobbDouglasOutput.stem(p)).toContain('K = 8');
    expect(cobbDouglasOutput.stem(p)).toContain('L = 125');
  });
});

describe('cobb-douglas-labour-needed', () => {
  it('the answer, put back into Q = A·K^α·L^β, gives the target, and no other whole L does', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { params: p, answer } = makeProblem(cobbDouglasLabourNeeded, seed);
        const L = numericValue(answer);
        expect(Number.isInteger(L) && L > 1 && L <= 1296).toBe(true);
        const alpha = p.aNum / p.aDen;
        const beta = p.bNum / p.bDen;
        const K = p.kRoot ** p.aDen;
        const target = p.A * p.kRoot ** p.aNum * p.lRoot ** p.bNum;
        const produce = (labour: number) => p.A * K ** alpha * labour ** beta;
        expect(Math.abs(produce(L) - target) / target).toBeLessThan(1e-9);
        // Brute force: the whole number of workers whose output is closest to the target.
        let best = 1;
        for (let l = 2; l <= 1500; l++) {
          if (Math.abs(produce(l) - target) < Math.abs(produce(best) - target)) best = l;
        }
        expect(best).toBe(L);
        expect(Number.isInteger(K) && K > 1 && Number.isInteger(target)).toBe(true);
      }),
      RUNS,
    );
  });

  it('reproduces Example 3 in F01: 360 units with K = 8 need L = 216', () => {
    const p = { A: 5, aNum: 1, aDen: 3, bNum: 2, bDen: 3, kRoot: 2, lRoot: 6, asDecimals: false };
    expect(numericValue(cobbDouglasLabourNeeded.answer(p))).toBe(216);
    expect(cobbDouglasLabourNeeded.stem(p)).toContain('Q = 360');
    const lTermStep = cobbDouglasLabourNeeded.steps(p)[1];
    expect(lTermStep?.result).toBe(36);
  });
});

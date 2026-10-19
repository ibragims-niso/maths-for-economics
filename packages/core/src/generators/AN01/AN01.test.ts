import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { compoundOvertakesLinearYear } from './compound-overtakes-linear-year';
import { inductionSumClosedForm, sumSpec } from './induction-sum-closed-form';
import { statementLatex, truthTableTrueRows } from './truth-table-true-rows';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors, stem: pr.stem };
};

const byCode = (ds: { mistakeCode: string; value: number }[]) =>
  Object.fromEntries(ds.map((d) => [d.mistakeCode, d.value]));

/**
 * Reads the printed statement "H \to C" back into a JavaScript test and counts its true rows by
 * trying every assignment of the letters that appear, so the check goes through the text the
 * student sees, not through the generator's own data.
 */
function countFromLatex(
  latex: string,
  contrapositive = false,
): { rows: number; letters: string[] } {
  const letters = ['P', 'Q', 'R'].filter((l) => latex.includes(l));
  const [h = '', c = ''] = latex.split(' \\to ');
  const js = (s: string) =>
    s.replaceAll('\\lnot ', '!').replaceAll('\\land', '&&').replaceAll('\\lor', '||');
  const body = contrapositive ? `!(!(${js(c)})) || !(${js(h)})` : `!(${js(h)}) || (${js(c)})`;
  const f = new Function(...letters, `return ${body};`) as (...v: boolean[]) => boolean;
  let rows = 0;
  for (let k = 0; k < 2 ** letters.length; k++) {
    const values = letters.map((_, j) => ((k >> j) & 1) === 1);
    if (f(...values)) rows++;
  }
  return { rows, letters };
}

describe('truth-table-true-rows', () => {
  it('matches a row-by-row evaluation of the printed statement', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, stem, distractors } = solve(truthTableTrueRows, seed);
        const latex = statementLatex(p);
        expect(stem).toContain(latex);
        const { rows, letters } = countFromLatex(latex);
        expect(value).toBe(rows);
        // Neither always true nor always false, and a whole number of rows.
        expect(value).toBeGreaterThan(0);
        expect(value).toBeLessThan(2 ** letters.length);
        expect(letters.length).toBeGreaterThanOrEqual(2);
        for (const l of letters) expect(stem).toContain(`$${l}$`);
        // The contrapositive ¬C → ¬H is true in exactly the same number of rows.
        expect(countFromLatex(latex, true).rows).toBe(rows);
        const d = byCode(distractors);
        if (d.TOTAL_ROWS !== undefined) expect(d.TOTAL_ROWS).toBe(2 ** letters.length);
        if (d.COUNTED_FALSE !== undefined) expect(d.COUNTED_FALSE).toBe(2 ** letters.length - rows);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 in AN01 ((P ∧ Q) → R is true in 7 of 8 rows)', () => {
    const params: Parameters<typeof truthTableTrueRows.answer>[0] = {
      hypothesis: {
        op: 'and',
        literals: [
          { letter: 'P', negated: false },
          { letter: 'Q', negated: false },
        ],
      },
      conclusion: { op: 'and', literals: [{ letter: 'R', negated: false }] },
    };
    expect(statementLatex(params)).toBe('(P \\land Q) \\to R');
    expect(truthTableTrueRows.answer(params)).toMatchObject({ kind: 'numeric', value: 7 });
    expect(byCode(truthTableTrueRows.distractors(params))).toEqual({
      FALSE_HYPOTHESIS: 1,
      CONVERSE: 5,
      TOTAL_ROWS: 8,
    });
  });
});

describe('induction-sum-closed-form', () => {
  it('equals the terms added one by one', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, stem } = solve(inductionSumClosedForm, seed);
        const s = sumSpec(p.family);
        let total = 0;
        for (let k = 1; k <= p.n; k++) total += s.term(k);
        expect(value).toBe(total);
        expect(Number.isInteger(value) && value > 0).toBe(true);
        expect(stem).toContain(`\\sum_{k=1}^{${p.n}}`);
        expect(p.n).toBeGreaterThanOrEqual(5);
      }),
      RUNS,
    );
  });

  it('has closed forms that pass the base case and the inductive step', () => {
    for (const family of ['odd', 'pair', 'square', 'cube'] as const) {
      const s = sumSpec(family);
      expect(s.closed(1)).toBe(s.term(1));
      for (let n = 1; n <= 80; n++) expect(s.closed(n + 1) - s.closed(n)).toBe(s.term(n + 1));
      // The wrong closed form fails already at n = 2, which a base-case check would catch.
      expect(s.wrong(2)).not.toBe(s.term(1) + s.term(2));
    }
  });

  it('reproduces worked example 2 in AN01 (Σ k(k + 1) for k = 1 … 12 is 728)', () => {
    const p = { family: 'pair', n: 12 } as const;
    expect(inductionSumClosedForm.answer(p)).toMatchObject({ kind: 'numeric', value: 728 });
    expect(byCode(inductionSumClosedForm.distractors(p))).toEqual({
      ONE_TERM_SHORT: 572,
      TERM_NOT_SUM: 156,
      WRONG_CLOSED_FORM: 364,
    });
  });
});

/** A_n > B_n compared exactly in whole numbers: start·(100 + g)ⁿ > (rival + step·n)·100ⁿ. */
const aheadExact = (
  p: { start: number; rival: number; rate: number; step: number },
  n: number,
): boolean =>
  BigInt(p.start) * BigInt(100 + p.rate) ** BigInt(n) >
  BigInt(p.rival + p.step * n) * 100n ** BigInt(n);

describe('compound-overtakes-linear-year', () => {
  it('is the first year A is ahead in exact arithmetic, and A stays ahead afterwards', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(compoundOvertakesLinearYear, seed);
        expect(Number.isInteger(p.step)).toBe(true);
        for (let n = 1; n < value; n++) expect(aheadExact(p, n)).toBe(false);
        for (let n = value; n <= value + 60; n++) expect(aheadExact(p, n)).toBe(true);
      }),
      RUNS,
    );
  });

  it('keeps the numbers economically sensible and the distractors in their place', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(compoundOvertakesLinearYear, seed);
        expect(value).toBeGreaterThanOrEqual(3);
        expect(value).toBeLessThanOrEqual(30);
        expect(p.start).toBeGreaterThan(0);
        expect(p.rival).toBeGreaterThanOrEqual(p.start);
        expect(p.rate).toBeGreaterThan(0);
        expect(p.step).toBeGreaterThan(0);
        if (p.context === 'savings') {
          expect(p.rival).toBe(p.start);
          expect(p.simpleRate).toBeGreaterThan(p.rate);
          expect(p.step).toBe((p.start * p.simpleRate) / 100);
        }
        const d = byCode(distractors);
        expect(d.LAST_YEAR_BEHIND).toBe(value - 1);
        // Comparing yearly increases instead of levels: A's increase beats B's no later than A overtakes.
        if (d.YEARLY_NOT_TOTAL !== undefined) expect(d.YEARLY_NOT_TOTAL).toBeLessThan(value);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 in AN01 (200 at 6 % against 300 + 8n: year 12)', () => {
    const p = {
      context: 'economies',
      start: 200,
      rival: 300,
      rate: 6,
      step: 8,
      simpleRate: 0,
    } as const;
    expect(compoundOvertakesLinearYear.answer(p)).toMatchObject({ kind: 'numeric', value: 12 });
    expect(byCode(compoundOvertakesLinearYear.distractors(p))).toEqual({
      LAST_YEAR_BEHIND: 11,
      YEARLY_NOT_TOTAL: 1,
      SIMPLE_GROWTH: 26,
    });
  });
});

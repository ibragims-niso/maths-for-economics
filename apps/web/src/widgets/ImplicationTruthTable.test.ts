import { describe, expect, it } from 'vitest';
import {
  describeForm,
  FORMS,
  formValue,
  ROWS,
  rowsDifferingFromImplication,
  trueRowCount,
} from './ImplicationTruthTable';

const index = (name: string) => FORMS.findIndex((f) => f.name === name);

describe('implication-truth-table', () => {
  it('gives the textbook truth table of P → Q: false only when P is true and Q is false', () => {
    expect(ROWS.map(([p, q]) => formValue(0, p, q))).toEqual([true, false, true, true]);
    expect(trueRowCount(0)).toBe(3);
  });

  it('makes the contrapositive equivalent to P → Q, and the converse equivalent to the inverse', () => {
    const contra = index('contrapositive');
    const converse = index('converse');
    const inverse = index('inverse');
    for (const [p, q] of ROWS) {
      // ¬Q → ¬P checked from its definition: false only when ¬Q is true and ¬P is false.
      expect(formValue(contra, p, q)).toBe(!(!q && p));
      expect(formValue(converse, p, q)).toBe(formValue(inverse, p, q));
    }
    expect(rowsDifferingFromImplication(contra)).toEqual([]);
    // Converse and inverse differ from P → Q in the rows TF and FT.
    expect(rowsDifferingFromImplication(converse)).toEqual([1, 2]);
    expect(rowsDifferingFromImplication(inverse)).toEqual([1, 2]);
  });

  it('counts true rows for every form and treats P ↔ Q as both directions together', () => {
    expect(FORMS.map((_, i) => trueRowCount(i))).toEqual([3, 3, 3, 3, 2]);
    const bi = index('biconditional');
    for (const [p, q] of ROWS) {
      expect(formValue(bi, p, q)).toBe(formValue(0, p, q) && formValue(index('converse'), p, q));
    }
    expect(rowsDifferingFromImplication(bi)).toEqual([2]);
  });

  it('explains the current row in the caption', () => {
    expect(describeForm(0, true, false)).toContain('P → Q is false.');
    expect(describeForm(index('contrapositive'), true, true)).toContain('equivalent');
    expect(describeForm(index('converse'), false, true)).toContain('Q → P is false.');
  });
});

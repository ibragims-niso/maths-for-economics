import { describe, expect, it } from 'vitest';
import {
  describeDeterminant,
  determinant,
  orientation,
  parallelogram,
  signedArea,
} from './DeterminantArea';

describe('determinant-area', () => {
  it('reproduces the matrix of worked example 3 of LA104 ([3 −1; −1 2], det 5)', () => {
    expect(determinant(-1, 2)).toBe(5);
    expect(parallelogram(-1, 2)).toEqual([
      [0, 0],
      [3, -1],
      [2, 1],
      [-1, 2],
    ]);
    expect(describeDeterminant(-1, 2)).toContain('= 5.');
    expect(describeDeterminant(-1, 2)).toContain('exactly one solution');
  });

  it('det A equals the signed area of the image of the unit square at every slider position', () => {
    for (let a12 = -3; a12 <= 3; a12 += 0.5) {
      for (let a22 = -2; a22 <= 3; a22 += 0.5) {
        const det = determinant(a12, a22);
        expect(signedArea(parallelogram(a12, a22))).toBeCloseTo(det, 12);
        expect(orientation(det)).toBe(det > 0 ? 'kept' : det < 0 ? 'flipped' : 'flat');
      }
    }
  });

  it('matches the checks in the Interactive section', () => {
    // Second column (−3, 1) is parallel to the first, (3, −1): the square is squashed flat.
    expect(determinant(-3, 1)).toBe(0);
    expect(describeDeterminant(-3, 1)).toContain('squashed flat');
    expect(describeDeterminant(-3, 1)).toContain('infinitely many');
    // Second column (0, −1): a clockwise turn, det = −3.
    expect(determinant(0, -1)).toBe(-3);
    expect(orientation(determinant(0, -1))).toBe('flipped');
  });
});

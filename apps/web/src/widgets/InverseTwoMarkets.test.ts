import { describe, expect, it } from 'vitest';
import { apply2, det2, explain, inverse2, solve2, matText as withNbsp } from './InverseTwoMarkets';

/** The read-out with its no-break spaces shown as ordinary spaces. */
const matText = (A: Parameters<typeof withNbsp>[0]) =>
  withNbsp(A).replace(new RegExp(String.fromCharCode(160), 'g'), ' ');

const EXAMPLE: [[number, number], [number, number]] = [
  [3, -1],
  [-1, 2],
];

describe('InverseTwoMarkets maths (LA105)', () => {
  it('inverts the matrix of Example 1: det 5, A⁻¹ = (0.4 0.2; 0.2 0.6)', () => {
    expect(det2(EXAMPLE)).toBe(5);
    const Ai = inverse2(EXAMPLE);
    expect(Ai).not.toBeNull();
    expect(matText(Ai ?? EXAMPLE)).toBe('[0.4 0.2; 0.2 0.6]');
    // A A⁻¹ = I, column by column.
    const c1 = apply2(EXAMPLE, [Ai?.[0][0] ?? 0, Ai?.[1][0] ?? 0]);
    const c2 = apply2(EXAMPLE, [Ai?.[0][1] ?? 0, Ai?.[1][1] ?? 0]);
    expect(c1[0]).toBeCloseTo(1, 12);
    expect(c1[1]).toBeCloseTo(0, 12);
    expect(c2[0]).toBeCloseTo(0, 12);
    expect(c2[1]).toBeCloseTo(1, 12);
  });

  it('solves the three demand scenarios of Example 2 with one inverse', () => {
    const cases: [[number, number], [number, number]][] = [
      [
        [40, 30],
        [22, 26],
      ],
      [
        [45, 30],
        [24, 27],
      ],
      [
        [40, 35],
        [23, 29],
      ],
    ];
    for (const [b, p] of cases) {
      const x = solve2(EXAMPLE, b);
      expect(x?.[0]).toBeCloseTo(p[0], 10);
      expect(x?.[1]).toBeCloseTo(p[1], 10);
      // A sends x back to b.
      const back = apply2(EXAMPLE, x ?? [0, 0]);
      expect(back[0]).toBeCloseTo(b[0], 10);
      expect(back[1]).toBeCloseTo(b[1], 10);
    }
  });

  it('shows the blow-up the Interactive text describes, and no inverse at det 0', () => {
    const near: [[number, number], [number, number]] = [
      [1.25, -1],
      [-1, 1],
    ];
    expect(det2(near)).toBe(0.25);
    expect(matText(inverse2(near) ?? near)).toBe('[4 4; 4 5]');
    const x = solve2(near, [40, 30]);
    expect(x?.[0]).toBeCloseTo(280, 10);
    expect(x?.[1]).toBeCloseTo(310, 10);
    expect(explain(near, x)).toContain('close to 0');
    expect(explain(near, x)).toContain('off the picture');
    const singular: [[number, number], [number, number]] = [
      [1, -1],
      [-1, 1],
    ];
    expect(inverse2(singular)).toBeNull();
    expect(solve2(singular, [40, 30])).toBeNull();
    expect(explain(singular, null)).toContain('no inverse');
    expect(
      inverse2([
        [0.5, -1],
        [-1, 2],
      ]),
    ).toBeNull();
  });
});

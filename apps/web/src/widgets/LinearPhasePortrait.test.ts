import { describe, expect, it } from 'vitest';
import { eigenvalues2, type Mat2 } from './EigenDirections';
import {
  classify,
  eigenLines,
  eigenText,
  flow,
  phasePath,
  STARTS,
  stateAt,
} from './LinearPhasePortrait';

const system = (a: number, d: number): Mat2 => ({ a, b: -0.2, c: 0.1, d });

describe('LinearPhasePortrait maths (DY05)', () => {
  it('shows Example 2 at the default: a stable node with λ = −0.2, −0.3', () => {
    const m = system(-0.4, -0.1);
    expect(classify(m)).toBe('stable node');
    const e = eigenvalues2(m);
    expect(e.kind).toBe('real');
    if (e.kind === 'real') {
      expect(e.values[0]).toBeCloseTo(-0.2, 12);
      expect(e.values[1]).toBeCloseTo(-0.3, 12);
    }
    expect(eigenText(m, eigenLines(m))).toBe('(1, −1) for λ = −0.2 and (2, −1) for λ = −0.3');
    expect(STARTS[0]).toEqual([3, -2]);
  });

  it('follows Example 2: from (3, −2), x(t) = e^(−0.2t)(1, −1) + e^(−0.3t)(2, −1)', () => {
    const m = system(-0.4, -0.1);
    const exact = (t: number) => [
      Math.exp(-0.2 * t) + 2 * Math.exp(-0.3 * t),
      -Math.exp(-0.2 * t) - Math.exp(-0.3 * t),
    ];
    for (const t of [1, 5, 10]) {
      const x = stateAt(m, [3, -2], t);
      const want = exact(t);
      expect(x[0]).toBeCloseTo(want[0] ?? 0, 6);
      expect(x[1]).toBeCloseTo(want[1] ?? 0, 6);
    }
    const x5 = stateAt(m, [3, -2], 5);
    expect(Math.round(x5[0] * 100) / 100).toBe(0.81);
    expect(Math.round(x5[1] * 100) / 100).toBe(-0.59);
    // The starting velocity of Example 2.
    expect(flow(m, [3, -2])[0]).toBeCloseTo(-0.8, 12);
    expect(flow(m, [3, -2])[1]).toBeCloseTo(0.5, 12);
  });

  it('gives the Try it checks as a rises with d = −0.1', () => {
    expect(classify(system(-0.4, -0.1))).toBe('stable node');
    expect(classify(system(-0.3, -0.1))).toBe('stable focus');
    expect(classify(system(0.05, -0.1))).toBe('stable focus');
    expect(classify(system(0.1, -0.1))).toBe('centre');
    expect(classify(system(0.15, -0.1))).toBe('unstable focus');
    expect(classify(system(0.2, -0.1))).toBe('borderline');
    expect(classify(system(0.25, -0.1))).toBe('saddle');
    const centre = eigenvalues2(system(0.1, -0.1));
    expect(centre.kind === 'complex' && centre.re).toBeCloseTo(0, 12);
    expect(centre.kind === 'complex' && centre.im).toBeCloseTo(0.1, 12);
    // a = 0.3, d = −0.3: det = −0.09 + 0.02 = −0.07, a saddle.
    const m = system(0.3, -0.3);
    expect(m.a * m.d - m.b * m.c).toBeCloseTo(-0.07, 12);
    expect(classify(m)).toBe('saddle');
    expect(classify(system(0.4, 0.1))).toBe('unstable node');
  });

  it('closes the loop in the centre case, so cycles neither die out nor grow', () => {
    const m = system(0.1, -0.1);
    const path = phasePath(m, [3, -2]);
    // After going round, the path passes close to its start again.
    const back = path.slice(20).some(([x, y]) => Math.hypot(x - 3, y + 2) < 0.15);
    expect(back).toBe(true);
    // The whole loop stays inside the picture (|π| < 9.17, |u| < 6).
    for (const [x, y] of path) {
      expect(Math.abs(x)).toBeLessThan(9.17);
      expect(Math.abs(y)).toBeLessThan(6);
    }
  });

  it('classifies every slider position consistently with tr < 0 and det > 0, with short finite paths', () => {
    for (let i = -10; i <= 10; i++) {
      for (let j = -10; j <= 10; j++) {
        const m = system(i / 20, j / 20);
        const t = m.a + m.d;
        const det = m.a * m.d - m.b * m.c;
        const stable = t < -1e-9 && det > 1e-9;
        expect(classify(m).startsWith('stable'), `a = ${m.a}, d = ${m.d}`).toBe(stable);
        for (const s of STARTS) {
          const path = phasePath(m, s);
          expect(path.length).toBeLessThan(820);
          for (const [x, y] of path) expect(Number.isFinite(x) && Number.isFinite(y)).toBe(true);
          // Paths die out at the rate of the slowest eigenvalue; within 80 years when it is below −0.06.
          const e = eigenvalues2(m);
          const slowest = e.kind === 'complex' ? e.re : e.values[0];
          if (slowest < -0.06) {
            const [x, y] = path[path.length - 1] ?? [9, 9];
            expect(Math.hypot(x, y)).toBeLessThan(0.5);
          }
        }
      }
    }
  });
});

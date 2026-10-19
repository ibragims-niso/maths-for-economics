import { describe, expect, it } from 'vitest';
import { deltaWorks, f, largestDelta, proofDelta, worstGap } from './EpsilonDeltaSquare';

describe('EpsilonDeltaSquare (AN03, ε–δ for x²)', () => {
  it('gives δ = √5 − 2 ≈ 0.236 at a = 2, ε = 1, as in the text, and the proof gives 0.2', () => {
    expect(largestDelta(2, 1)).toBeCloseTo(Math.sqrt(5) - 2, 12);
    expect(largestDelta(2, 1)).toBeCloseTo(0.236, 3);
    expect(proofDelta(2, 1)).toBeCloseTo(0.2, 12);
    expect(deltaWorks(2, 1, 0.2)).toBe(true);
  });

  it('rejects δ = 0.25 at a = 2, ε = 1: the gap 2·2·0.25 + 0.25² = 1.0625 exceeds 1', () => {
    expect(worstGap(2, 0.25)).toBeCloseTo(1.0625, 12);
    expect(deltaWorks(2, 1, 0.25)).toBe(false);
  });

  it('agrees with a brute-force scan of |x² − a²| over |x − a| < δ', () => {
    for (const a of [1, 1.5, 2, 2.75, 3]) {
      for (const eps of [0.1, 0.5, 1, 2]) {
        const best = largestDelta(a, eps);
        // Just inside the largest δ every point works; just outside some point fails.
        for (const scale of [0.98, 1.02]) {
          const d = best * scale;
          let worst = 0;
          for (let i = -1000; i <= 1000; i++) {
            const x = a + (d * i) / 1001;
            worst = Math.max(worst, Math.abs(f(x) - f(a)));
          }
          expect(worst < eps).toBe(scale < 1);
          expect(deltaWorks(a, eps, d)).toBe(scale < 1);
        }
        // The proof's δ always works but is never larger than the largest one.
        expect(proofDelta(a, eps)).toBeLessThanOrEqual(best + 1e-12);
        expect(deltaWorks(a, eps, proofDelta(a, eps))).toBe(true);
      }
    }
  });

  it('shrinks δ as a grows: the same ε needs a narrower band where the curve is steeper', () => {
    expect(largestDelta(1, 1)).toBeGreaterThan(largestDelta(2, 1));
    expect(largestDelta(2, 1)).toBeGreaterThan(largestDelta(3, 1));
  });
});

describe('EpsilonDeltaSquare read-outs quoted in the Try it text', () => {
  it('shows 0.84 at δ = 0.2 and 0.162 at a = 3', () => {
    expect(worstGap(2, 0.2)).toBeCloseTo(0.84, 12);
    expect(largestDelta(3, 1)).toBeCloseTo(0.162, 3);
  });
});

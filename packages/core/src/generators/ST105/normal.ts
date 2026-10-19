import { round } from '../../engine/grading';

/** ln √(2π), used by the standard normal density. */
const LOG_SQRT_2PI = 0.9189385332046728;

/** The standard normal density φ(z) = e^(−z²/2) / √(2π). */
export function normalDensity(z: number): number {
  return Math.exp(-0.5 * z * z - LOG_SQRT_2PI);
}

/**
 * The standard normal cdf Φ(z) = P(Z ≤ z), by Marsaglia's series (2004):
 * Φ(z) = 1/2 + φ(z)·(z + z³/3 + z⁵/(3·5) + …). Accurate to about 1e-15 for |z| ≤ 8.
 */
export function normalCdf(z: number): number {
  if (z < -8) return 0;
  if (z > 8) return 1;
  let sum = z;
  let term = z;
  const q = z * z;
  for (let k = 3; ; k += 2) {
    term *= q / k;
    const next = sum + term;
    if (next === sum) break;
    sum = next;
  }
  return 0.5 + sum * normalDensity(z);
}

/** Φ as a student reads it from a table: z rounded to 2 decimals, Φ to 4. */
export function tableCdf(z: number): number {
  return round(normalCdf(round(z, 2)), 4);
}

/** The z values students use for the common tail probabilities (in per cent), to 3 decimals. */
export const Z_FOR_PERCENT: Readonly<Record<number, number>> = {
  1: -2.326,
  2.5: -1.96,
  5: -1.645,
  10: -1.282,
  90: 1.282,
  95: 1.645,
  97.5: 1.96,
  99: 2.326,
};

/** The z value as written in a step: "−1.645", "1.96". */
export function zText(z: number): string {
  return z.toFixed(3).replace(/0$/, '');
}

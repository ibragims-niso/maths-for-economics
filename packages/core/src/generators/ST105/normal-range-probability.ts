import { round } from '../../engine/grading';
import type { Distractor, Generator, Step } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { hasDecimals, LETTER, NORMAL_CONTEXTS, type NormalContext } from './contexts';
import { tableCdf } from './normal';

interface Params {
  context: NormalContext;
  mean: number;
  sd: number;
  /** Lower end of the range, or null for P(X < upper). */
  lower: number | null;
  /** Upper end of the range, or null for P(X > lower). */
  upper: number | null;
}

/** Probabilities to 4 decimal places. */
const PROB = { tolerance: 0.0005, relTolerance: 0 } as const;

const zOf = (p: Params, x: number) => round((x - p.mean) / p.sd, 2);

/** The probability a student gets from a table, standardising with the spread `s`. */
function probability(p: Params, s: number): number {
  const F = (x: number) => tableCdf((x - p.mean) / s);
  if (p.lower === null && p.upper !== null) return F(p.upper);
  if (p.upper === null && p.lower !== null) return round(1 - F(p.lower), 4);
  return round(F(p.upper ?? 0) - F(p.lower ?? 0), 4);
}

function wrongAnswers(p: Params): Distractor[] {
  const answer = probability(p, p.sd);
  const candidates: Distractor[] = [
    { value: round(1 - answer, 4), mistakeCode: 'WRONG_TAIL' },
    { value: probability(p, p.sd ** 2), mistakeCode: 'VARIANCE_FOR_SD' },
  ];
  if (p.lower !== null && p.upper !== null) {
    candidates.push({ value: tableCdf((p.upper - p.mean) / p.sd), mistakeCode: 'UPPER_ONLY' });
  }
  return cleanDistractors(answer, candidates, PROB.tolerance, PROB.relTolerance);
}

/** ST105, difficulty 1: P(X < x), P(X > x) or P(a < X < b) for a normal X, by standardising. */
export const normalRangeProbability: Generator<Params> = {
  id: 'normal-range-probability',
  title: 'Normal probability by standardising',
  topicId: 'ST105',
  difficulty: 1,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const context = rng.pick(Object.keys(NORMAL_CONTEXTS) as NormalContext[]);
      const c = NORMAL_CONTEXTS[context];
      const mean = rng.pick(c.means);
      const sd = rng.pick(c.sds);
      // z on the 0.01 grid of a normal table, so x = mean + z·sd.
      const valueAt = (k: number) => round(mean + (k * sd) / 100, 6);
      const kind = rng.pick(['below', 'above', 'between'] as const);
      const k1 = rng.int(-250, 250);
      const k2 = rng.int(-250, 250);
      const ks = kind === 'between' ? [Math.min(k1, k2), Math.max(k1, k2)] : [k1];
      if (ks.some((k) => Math.abs(k) < 10)) continue;
      if (kind === 'between' && (ks[1] ?? 0) - (ks[0] ?? 0) < 40) continue;
      const xs = ks.map(valueAt);
      if (xs.some((x) => !hasDecimals(x, c.decimals) || x < c.min || x > c.max)) continue;
      const p: Params = {
        context,
        mean,
        sd,
        lower: kind === 'below' ? null : (xs[0] ?? 0),
        upper: kind === 'below' ? (xs[0] ?? 0) : kind === 'above' ? null : (xs[1] ?? 0),
      };
      const value = probability(p, sd);
      if (value < 0.005 || value > 0.995) continue;
      if (wrongAnswers(p).length < (kind === 'between' ? 3 : 2)) continue;
      return p;
    }
  },

  stem(p) {
    const c = NORMAL_CONTEXTS[p.context];
    const d = c.decimals;
    const ask =
      p.lower === null
        ? c.below(num(p.upper ?? 0, d))
        : p.upper === null
          ? c.above(num(p.lower, d))
          : c.between(num(p.lower, d), num(p.upper, d));
    return `${c.setup(p.mean, p.sd ** 2)} ${ask} Give your answer to 4 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: probability(p, p.sd), decimals: 4, ...PROB }),

  steps(p) {
    const X = LETTER[p.context];
    const d = NORMAL_CONTEXTS[p.context].decimals;
    const steps: Step[] = [
      {
        text: 'Find the standard deviation.',
        latex: `\\sigma = \\sqrt{${num(p.sd ** 2)}} = ${num(p.sd)}`,
        why: 'In N(μ, σ²) the second number is the variance; z-scores divide by its square root, the standard deviation σ.',
        result: p.sd,
      },
    ];
    const zStep = (x: number, name: string): Step => ({
      text: `Standardise ${num(x, d)}.`,
      latex: `${name} = \\dfrac{${num(x, d)} - ${num(p.mean)}}{${num(p.sd)}} = ${num(zOf(p, x))}`,
      why: 'Z = (X − μ)/σ counts how many standard deviations a value lies from the mean, and it has the standard normal distribution N(0, 1).',
      result: zOf(p, x),
    });
    const phi = (x: number) => tableCdf(zOf(p, x));
    const answer = probability(p, p.sd);
    if (p.lower === null) {
      const x = p.upper ?? 0;
      steps.push(zStep(x, 'z'), {
        text: 'Read the area to the left of z.',
        latex: `P(${X} < ${num(x, d)}) = \\Phi(${num(zOf(p, x))}) = ${num(answer, 4)}`,
        why:
          zOf(p, x) < 0
            ? 'Φ(z) is the area to the left of z. If your table only has positive z, use symmetry: Φ(−z) = 1 − Φ(z).'
            : 'Φ(z) is the area under the standard normal curve to the left of z, which is exactly the probability of a value below x.',
        result: answer,
      });
    } else if (p.upper === null) {
      const x = p.lower;
      steps.push(zStep(x, 'z'), {
        text: 'Take the area to the right of z.',
        latex: `P(${X} > ${num(x, d)}) = 1 - \\Phi(${num(zOf(p, x))}) = 1 - ${num(phi(x), 4)} = ${num(answer, 4)}`,
        why: 'The table gives the area to the left; the whole area is 1, so the area to the right is 1 minus it.',
        result: answer,
      });
    } else {
      const a = p.lower;
      const b = p.upper;
      steps.push(zStep(a, 'z_a'), zStep(b, 'z_b'), {
        text: 'Subtract the two areas to the left.',
        latex: `P(${num(a, d)} < ${X} < ${num(b, d)}) = \\Phi(${num(zOf(p, b))}) - \\Phi(${num(zOf(p, a))}) = ${num(phi(b), 4)} - ${num(phi(a), 4)} = ${num(answer, 4)}`,
        why: 'The area to the left of b includes the area to the left of a; removing it leaves only the area between a and b.',
        result: answer,
      });
    }
    return steps;
  },

  distractors: wrongAnswers,
};

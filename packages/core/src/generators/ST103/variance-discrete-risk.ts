import { round } from '../../engine/grading';
import type { Generator, Step } from '../../engine/types';
import { cleanDistractors, num, withTwoDistractors } from '../format';

type Context = 'return' | 'profit';

interface Params {
  context: Context;
  ask: 'variance' | 'sd';
  /** The possible values of X, from worst to best (return in %, profit in thousands). */
  outcomes: number[];
  /** Their probabilities in hundredths (they add up to 100). */
  chances: number[];
}

/** Variance is exact to 4 decimals and is asked to 2; a 0.1 % margin covers rounding on the way. */
const RISK = { tolerance: 0.01, relTolerance: 0.001 } as const;

const prob = (c: number) => c / 100;
const moment = (p: Params, power: number) =>
  p.outcomes.reduce((s, x, k) => s + x ** power * prob(p.chances[k] ?? 0), 0);
const mean = (p: Params) => moment(p, 1);
const variance = (p: Params) => moment(p, 2) - mean(p) ** 2;
const target = (p: Params) =>
  p.ask === 'variance' ? round(variance(p), 2) : round(Math.sqrt(variance(p)), 2);

const value = (p: Params, x: number) => (p.context === 'return' ? `${num(x)}\\%` : num(x));
const paren = (x: number) => (x < 0 ? `(${num(x)})` : num(x));

/** ST103, difficulty 2: variance Var(X) = E[X²] − (E[X])², or the standard deviation, of a discrete distribution. */
export const varianceDiscreteRisk: Generator<Params> = withTwoDistractors({
  id: 'variance-discrete-risk',
  title: 'Variance and standard deviation (risk)',
  topicId: 'ST103',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const context = rng.pick(['return', 'profit'] as const);
      const n = rng.pick([3, 3, 4] as const);
      const chances = Array.from({ length: n - 1 }, () => rng.int(5, 60));
      const last = 100 - chances.reduce((s, c) => s + c, 0);
      if (last < 5 || last > 70) continue;
      chances.push(last);
      const outcomes = Array.from({ length: n }, () =>
        context === 'return' ? rng.int(-25, 35) : rng.int(-10, 30),
      ).sort((a, b) => a - b);
      if (new Set(outcomes).size < n || (outcomes[0] ?? 0) >= 0) continue;
      const p = { context, ask: rng.pick(['variance', 'sd'] as const), outcomes, chances };
      if (Math.sqrt(variance(p)) < 2) continue; // a visible amount of risk
      return p;
    }
  },

  stem(p) {
    const parts = p.outcomes.map(
      (x, k) => `$${value(p, x)}$ with probability $${num(prob(p.chances[k] ?? 0))}$`,
    );
    const list = `${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}`;
    const lead =
      p.context === 'return'
        ? `A share's return next year is ${list}.`
        : `A farm's profit next season, in thousands, depends on the weather: it is ${list}.`;
    const what = p.context === 'return' ? 'return' : 'profit';
    const question =
      p.ask === 'variance'
        ? `What is the variance of the ${what}${p.context === 'return' ? ', in squared percentage points' : ''}?`
        : `What is the standard deviation of the ${what}${p.context === 'return' ? ', in per cent' : ''}?`;
    return `${lead} ${question} Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: 2, ...RISK }),

  steps(p) {
    const mu = mean(p);
    const m2 = moment(p, 2);
    const v = variance(p);
    const ps = p.chances.map((c) => num(prob(c)));
    const steps: Step[] = [
      {
        text: 'Find the expected value.',
        latex: `E[X] = ${p.outcomes.map((x, k) => `${paren(x)}(${ps[k]})`).join(' + ')} = ${num(mu)}`,
        why: 'The variance measures spread around the mean, so the mean comes first.',
        result: round(mu, 2),
      },
      {
        text: 'Find the expected value of X².',
        latex: `E[X^2] = ${p.outcomes.map((x, k) => `${paren(x)}^2(${ps[k]})`).join(' + ')} = ${num(m2)}`,
        why: 'Square each outcome first and then weight by its probability; squares of negative outcomes are positive.',
        result: round(m2, 2),
      },
      {
        text: 'Subtract the square of the mean.',
        latex: `\\operatorname{Var}(X) = E[X^2] - (E[X])^2 = ${num(m2)} - ${paren(mu)}^2 = ${num(v, 4)}`,
        why: 'E[X²] − (E[X])² is a shortcut for E[(X − μ)²], the probability-weighted average squared distance from the mean.',
        result: round(v, 2),
      },
    ];
    if (p.ask === 'sd') {
      steps.push({
        text: 'Take the square root.',
        latex: `\\sigma = \\sqrt{${num(v, 4)}} = ${num(Math.sqrt(v))}`,
        why: 'The variance is in squared units; its square root, the standard deviation, is back in the units of X and is the usual measure of risk.',
        result: round(Math.sqrt(v), 2),
      });
    }
    return steps;
  },

  distractors(p) {
    const mu = mean(p);
    const m2 = moment(p, 2);
    const unweighted = p.outcomes.reduce((s, x) => s + (x - mu) ** 2, 0) / p.outcomes.length;
    const candidates =
      p.ask === 'variance'
        ? [
            { value: round(m2, 2), mistakeCode: 'NO_MEAN_SQUARED' },
            { value: round(mu ** 2 - m2, 2), mistakeCode: 'REVERSED_ORDER' },
            { value: round(unweighted, 2), mistakeCode: 'UNWEIGHTED' },
          ]
        : [
            { value: round(variance(p), 2), mistakeCode: 'NO_SQUARE_ROOT' },
            { value: round(Math.sqrt(m2), 2), mistakeCode: 'NO_MEAN_SQUARED' },
            { value: round(Math.sqrt(unweighted), 2), mistakeCode: 'UNWEIGHTED' },
          ];
    return cleanDistractors(target(p), candidates, RISK.tolerance, RISK.relTolerance);
  },
});

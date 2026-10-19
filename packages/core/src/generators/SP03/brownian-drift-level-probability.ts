import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { tableCdf } from '../ST105/normal';

/** A coefficient in front of a letter: "3", or nothing for 1. */
const coef = (a: number) => (a === 1 ? '' : num(a));

const CONTEXTS = {
  cash: {
    horizons: [4, 9, 16, 25, 36],
    model: (x0: number, mu: number, s: number) =>
      `A firm's cash reserve, in millions, is modelled as $X(t) = ${num(x0)} ${mu < 0 ? '-' : '+'} ${coef(Math.abs(mu))}t + ${coef(s)}W(t)$, where $t$ is in months and $W$ is a standard Brownian motion.`,
    ask: (t: number, c: number, above: boolean) =>
      `What is the probability that after ${t} months the reserve is ${above ? 'above' : 'below'} $${num(c)}$ million?`,
    name: 'X',
  },
  logReturn: {
    horizons: [4, 9, 16, 25],
    model: (_x0: number, mu: number, s: number) =>
      `The log return of a stock index over $t$ years, in per cent, is modelled as $R(t) = ${coef(mu)}t + ${num(s)}W(t)$, where $W$ is a standard Brownian motion.`,
    ask: (t: number, c: number, above: boolean) =>
      `What is the probability that the log return over ${t} years is ${above ? 'above' : 'below'} $${num(c)}$ %?`,
    name: 'R',
  },
} as const;

type Context = keyof typeof CONTEXTS;

interface Params {
  context: Context;
  /** The value at time 0. */
  start: number;
  /** Drift per unit of time. */
  drift: number;
  /** Volatility σ per √(unit of time). */
  vol: number;
  /** Horizon T, a perfect square so that σ√T is a whole number. */
  horizon: number;
  /** The level c. */
  level: number;
  above: boolean;
}

/** Probabilities to 4 decimal places. */
const PROB = { tolerance: 0.0005, relTolerance: 0 } as const;

const mean = (p: Params) => p.start + p.drift * p.horizon;
const spread = (p: Params) => p.vol * Math.sqrt(p.horizon);

/** The table probability on the asked side when standardising with centre m and spread s. */
function sideProbability(p: Params, m: number, s: number): number {
  const phi = tableCdf((p.level - m) / s);
  return p.above ? round(1 - phi, 4) : phi;
}

const probability = (p: Params) => sideProbability(p, mean(p), spread(p));

function wrongAnswers(p: Params): Distractor[] {
  const answer = probability(p);
  return cleanDistractors(
    answer,
    [
      { value: sideProbability(p, p.start, spread(p)), mistakeCode: 'NO_DRIFT' },
      { value: sideProbability(p, mean(p), p.vol * p.horizon), mistakeCode: 'LINEAR_TIME' },
      { value: round(1 - answer, 4), mistakeCode: 'WRONG_TAIL' },
    ],
    PROB.tolerance,
    PROB.relTolerance,
  );
}

/** SP03, difficulty 3: P(X(T) > c) or P(X(T) < c) for Brownian motion with drift, X(T) ~ N(x₀ + μT, σ²T). */
export const brownianDriftLevelProbability: Generator<Params> = {
  id: 'brownian-drift-level-probability',
  title: 'Brownian motion with drift',
  topicId: 'SP03',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const context = rng.pick(Object.keys(CONTEXTS) as Context[]);
      const horizon = rng.pick(CONTEXTS[context].horizons);
      const cash = context === 'cash';
      const start = cash ? 10 * rng.int(3, 20) : 0;
      const drift = cash ? rng.int(-3, 5) : rng.int(2, 10);
      const vol = cash ? rng.int(1, 8) : 5 * rng.int(2, 5);
      if (drift === 0) continue;
      const s = vol * Math.sqrt(horizon);
      const m = start + drift * horizon;
      // z = k/100 on the grid of a normal table, with a whole-number level c = m + z·s.
      const k = rng.int(-250, 250);
      if (Math.abs(k) < 10 || (k * s) % 100 !== 0) continue;
      const level = m + (k * s) / 100;
      if (cash ? level <= 0 : Math.abs(level) > 200) continue;
      const p: Params = { context, start, drift, vol, horizon, level, above: rng.int(0, 1) === 1 };
      const value = probability(p);
      if (value < 0.005 || value > 0.995) continue;
      if (wrongAnswers(p).length < 3) continue;
      return p;
    }
  },

  stem(p) {
    const c = CONTEXTS[p.context];
    return `${c.model(p.start, p.drift, p.vol)} ${c.ask(p.horizon, p.level, p.above)} Give your answer to 4 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: probability(p), decimals: 4, ...PROB }),

  steps(p) {
    const X = CONTEXTS[p.context].name;
    const T = p.horizon;
    const m = mean(p);
    const s = spread(p);
    const z = round((p.level - m) / s, 2);
    const phi = tableCdf(z);
    const value = probability(p);
    return [
      {
        text: 'Find the mean of the value at the horizon.',
        latex: `E[${X}(${T})] = ${p.start === 0 ? num(p.drift) : `${num(p.start)} ${p.drift < 0 ? '-' : '+'} ${num(Math.abs(p.drift))}`} \\times ${T} = ${num(m)}`,
        why: 'W(T) has mean 0, so on average the value moves by the drift per unit of time times the time elapsed.',
        result: m,
      },
      {
        text: 'Find its standard deviation.',
        latex: `\\operatorname{SD}[${X}(${T})] = ${num(p.vol)}\\sqrt{${T}} = ${num(s)}`,
        why: 'W(T) ~ N(0, T), so σW(T) has variance σ²T and standard deviation σ√T: the spread grows with the square root of time.',
        result: s,
      },
      {
        text: 'Standardise the level.',
        latex: `z = \\dfrac{${num(p.level)} - ${num(m)}}{${num(s)}} = ${num(z)}`,
        why: `${X}(${T}) is normal, so z counts how many standard deviations the level lies from the mean.`,
        result: z,
      },
      {
        text: p.above ? 'Take the area to the right of z.' : 'Read the area to the left of z.',
        latex: p.above
          ? `P(${X}(${T}) > ${num(p.level)}) = 1 - \\Phi(${num(z)}) = 1 - ${num(phi, 4)} = ${num(value, 4)}`
          : `P(${X}(${T}) < ${num(p.level)}) = \\Phi(${num(z)}) = ${num(value, 4)}`,
        why: p.above
          ? 'Φ(z) is the probability of ending below the level; ending above it is everything else, 1 − Φ(z).'
          : 'Φ(z) is the area under the standard normal curve to the left of z, the probability of ending below the level.',
        result: value,
      },
    ];
  },

  distractors: wrongAnswers,
};

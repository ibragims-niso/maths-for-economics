import { num } from '../format';

/**
 * Normally distributed quantities used by the ST105 generators, with sensible means, standard
 * deviations and the number of decimals their values are written with.
 */
export const NORMAL_CONTEXTS = {
  demand: {
    setup: (m: number, v: number) =>
      `Daily demand for bread at a bakery, in loaves, is normally distributed: $X \\sim N(${num(m)}, ${num(v)})$.`,
    below: (x: string) =>
      `What is the probability that fewer than $${x}$ loaves are demanded on a given day?`,
    above: (x: string) =>
      `The bakery bakes $${x}$ loaves a day. What is the probability that demand is higher than this, so that it sells out?`,
    between: (a: string, b: string) =>
      `What is the probability that demand on a given day is between $${a}$ and $${b}$ loaves?`,
    means: [300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800],
    sds: [20, 25, 30, 40, 50, 60, 80],
    decimals: 0,
    min: 1,
    max: Number.POSITIVE_INFINITY,
  },
  returns: {
    setup: (m: number, v: number) =>
      `The daily return of a share, in per cent, is normally distributed: $R \\sim N(${num(m)}, ${num(v)})$.`,
    below: (x: string) =>
      `What is the probability that on a given day the return is below $${x}\\%$?`,
    above: (x: string) =>
      `What is the probability that on a given day the return is above $${x}\\%$?`,
    between: (a: string, b: string) =>
      `What is the probability that on a given day the return is between $${a}\\%$ and $${b}\\%$?`,
    means: [0, 0.05, 0.1],
    sds: [0.8, 1.2, 1.5, 2, 2.5],
    decimals: 2,
    min: Number.NEGATIVE_INFINITY,
    max: Number.POSITIVE_INFINITY,
  },
  exam: {
    setup: (m: number, v: number) =>
      `Scores in a large first-year economics exam are normally distributed: $S \\sim N(${num(m)}, ${num(v)})$.`,
    below: (x: string) =>
      `What is the probability that a randomly chosen student scores below $${x}$?`,
    above: (x: string) =>
      `What is the probability that a randomly chosen student scores above $${x}$?`,
    between: (a: string, b: string) =>
      `What is the probability that a randomly chosen student scores between $${a}$ and $${b}$?`,
    means: [55, 58, 60, 62, 64, 65, 68, 70],
    sds: [5, 8, 10, 12, 15],
    decimals: 0,
    min: 1,
    max: 99,
  },
  packets: {
    setup: (m: number, v: number) =>
      `Because of small filling and measurement errors, the weight of a coffee packet in grams is normally distributed: $W \\sim N(${num(m)}, ${num(v)})$.`,
    below: (x: string) => `What is the probability that a packet weighs less than $${x}$ grams?`,
    above: (x: string) => `What is the probability that a packet weighs more than $${x}$ grams?`,
    between: (a: string, b: string) =>
      `What is the probability that a packet weighs between $${a}$ and $${b}$ grams?`,
    means: [250, 500, 1000],
    sds: [2, 2.5, 4, 5],
    decimals: 1,
    min: 1,
    max: Number.POSITIVE_INFINITY,
  },
} as const;

export type NormalContext = keyof typeof NORMAL_CONTEXTS;

/** The letter used for the variable in each context. */
export const LETTER: Record<NormalContext, string> = {
  demand: 'X',
  returns: 'R',
  exam: 'S',
  packets: 'W',
};

/** True when x has at most `decimals` decimal places (up to floating-point noise). */
export function hasDecimals(x: number, decimals: number): boolean {
  const f = 10 ** decimals;
  return Math.abs(x * f - Math.round(x * f)) < 1e-7;
}

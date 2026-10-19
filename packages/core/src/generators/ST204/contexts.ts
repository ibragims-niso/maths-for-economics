import { round } from '../../engine/grading';
import type { Rng } from '../../engine/rng';
import { num } from '../format';
import { hasDecimals } from '../ST105/contexts';

/** The alternative hypothesis: H₁: μ > μ₀, H₁: μ < μ₀ or H₁: μ ≠ μ₀ (two-sided). */
export type Side = 'greater' | 'less' | 'two';

/** from, from + step, …, to (rounded to remove floating-point noise). */
const range = (from: number, to: number, step: number) =>
  Array.from({ length: Math.round((to - from) / step) + 1 }, (_, i) => round(from + i * step, 4));

/**
 * Settings for a test about a mean: the null value μ₀ (last year's figure, a target or a machine
 * setting), the spread, and the sides an economist would test. `decimals` is how x̄ is written.
 */
export const MEAN_CONTEXTS = {
  wages: {
    intro: (m: string) =>
      `Before a training subsidy was introduced, hourly wages in a sector had mean $\\mu_0 = ${m}$.`,
    sample: (n: number, x: string) =>
      `After the subsidy, a random sample of $n = ${n}$ workers has a mean hourly wage of $\\bar x = ${x}$.`,
    population: 'hourly wages',
    unit: 'workers',
    sides: ['greater', 'two'],
    mu0s: range(10, 25, 0.5),
    sds: range(2, 8, 0.5),
    decimals: 2,
  },
  packets: {
    intro: (m: string) =>
      `A machine is set to fill coffee packets with a mean weight of $\\mu_0 = ${m}$ grams.`,
    sample: (n: number, x: string) =>
      `A quality inspector weighs a random sample of $n = ${n}$ packets; their mean weight is $\\bar x = ${x}$ grams.`,
    population: 'packet weights',
    unit: 'packets',
    sides: ['two', 'less'],
    mu0s: [250, 500, 1000],
    sds: range(1.2, 6, 0.3),
    decimals: 2,
  },
  inflation: {
    intro: (m: string) => `The central bank's inflation target is $\\mu_0 = ${m}$ per cent a year.`,
    sample: (n: number, x: string) =>
      `The annual price change of a standard basket of goods, recorded in $n = ${n}$ randomly chosen towns, averages $\\bar x = ${x}$ per cent.`,
    population: 'price changes across towns',
    unit: 'towns',
    sides: ['two', 'greater'],
    mu0s: [2, 2.5, 3, 4, 5],
    sds: range(0.4, 2.4, 0.1),
    decimals: 2,
  },
  spending: {
    intro: (m: string) =>
      `Last year, weekly household spending on food in a country had mean $\\mu_0 = ${m}$.`,
    sample: (n: number, x: string) =>
      `This year a survey of $n = ${n}$ randomly chosen households finds mean weekly spending of $\\bar x = ${x}$.`,
    population: 'household spending figures',
    unit: 'households',
    sides: ['two', 'greater', 'less'],
    mu0s: range(80, 200, 5),
    sds: range(20, 60, 1),
    decimals: 2,
  },
} as const;

export type MeanContext = keyof typeof MEAN_CONTEXTS;

/** Large samples for z tests (σ known) and small ones for t tests (σ unknown). */
const LARGE_N = [36, 49, 64, 81, 100, 144, 225, 400];
const SMALL_N = [9, 16, 25];

export interface MeanTest {
  context: MeanContext;
  mu0: number;
  /** σ (known) or s (the sample standard deviation). */
  sd: number;
  n: number;
  xbar: number;
  side: Side;
}

/** The standard error σ/√n (or s/√n). */
export const meanSe = (t: MeanTest) => t.sd / Math.sqrt(t.n);

/** The test statistic (x̄ − μ₀)/(σ/√n), on the 0.01 grid by construction. */
export const meanZ = (t: MeanTest) => round((t.xbar - t.mu0) / meanSe(t), 2);

/** Picks the sign of z that fits the alternative: positive for >, negative for <, either for ≠. */
function signFor(rng: Rng, side: Side): number {
  if (side === 'greater') return 1;
  if (side === 'less') return -1;
  return rng.int(0, 1) === 1 ? 1 : -1;
}

/**
 * Draws a test about a mean whose statistic z = (x̄ − μ₀)/SE lies on the 0.01 grid with
 * zMin ≤ |z| ≤ zMax, on the side of the alternative. The caller rejects further if needed.
 */
export function drawMeanTest(
  rng: Rng,
  opts: { small: boolean; zMin: number; zMax: number; sides?: readonly Side[] },
): MeanTest {
  for (;;) {
    const context = rng.pick(Object.keys(MEAN_CONTEXTS) as MeanContext[]);
    const c = MEAN_CONTEXTS[context];
    const allowed = (c.sides as readonly Side[]).filter(
      (s) => !opts.sides || opts.sides.includes(s),
    );
    if (allowed.length === 0) continue;
    const side = rng.pick(allowed);
    const mu0 = rng.pick(c.mu0s);
    const sd = rng.pick(c.sds);
    const n = rng.pick(opts.small ? SMALL_N : LARGE_N);
    const se = sd / Math.sqrt(n);
    if (!hasDecimals(se, 2) || sd >= mu0) continue;
    const k = rng.int(Math.round(opts.zMin * 100), Math.round(opts.zMax * 100));
    const z = (signFor(rng, side) * k) / 100;
    const xbar = round(mu0 + z * se, 6);
    if (!hasDecimals(xbar, c.decimals) || xbar <= 0) continue;
    return { context, mu0, sd, n, xbar, side };
  }
}

/** The hypotheses as LaTeX, for a parameter written `param` (μ or p). */
export function hypotheses(param: string, nullValue: string, side: Side): string {
  const op = side === 'greater' ? '>' : side === 'less' ? '<' : '\\neq';
  return `$H_0: ${param} = ${nullValue}$ against $H_1: ${param} ${op} ${nullValue}$`;
}

/** The stem's description of a mean test; `known` says whether sd is σ or the sample's s. */
export function meanSetting(t: MeanTest, known: boolean): string {
  const c = MEAN_CONTEXTS[t.context];
  const spread = known
    ? `The standard deviation is known from earlier years: $\\sigma = ${num(t.sd)}$.`
    : `The population standard deviation is unknown; the sample standard deviation is $s = ${num(t.sd)}$, and ${c.population} are roughly normal.`;
  return `${c.intro(num(t.mu0))} ${c.sample(t.n, num(t.xbar, c.decimals))} ${spread}`;
}

/**
 * Settings for a test about a proportion. The null values are ones where p₀(1 − p₀) is a perfect
 * square (0.02 → 0.14², 0.1 → 0.3², 0.2 → 0.4², 0.36 → 0.48², 0.5 → 0.5², 0.64 → 0.48²), so the
 * standard error is a short decimal and z can sit exactly on the 0.01 grid.
 */
export const PROPORTION_CONTEXTS = {
  unemployment: {
    intro: (p: string) => `Last year the unemployment rate in a region was $p_0 = ${p}$.`,
    sample: (n: number, x: number, ph: string) =>
      `This year a labour force survey of $n = ${num(n)}$ people finds $${num(x)}$ unemployed, so $\\hat p = ${ph}$.`,
    sides: ['greater', 'two', 'less'],
    p0s: [0.1, 0.2],
  },
  reform: {
    intro: (p: string) => `Last year a share $p_0 = ${p}$ of voters supported a pension reform.`,
    sample: (n: number, x: number, ph: string) =>
      `A new poll of $n = ${num(n)}$ randomly chosen voters finds $${num(x)}$ supporters, so $\\hat p = ${ph}$.`,
    sides: ['two', 'greater', 'less'],
    p0s: [0.36, 0.5, 0.64],
  },
  defects: {
    intro: (p: string) =>
      `A supplier claims that a share of only $p_0 = ${p}$ of its parts are faulty.`,
    sample: (n: number, x: number, ph: string) =>
      `A buyer tests a random sample of $n = ${num(n)}$ parts and finds $${num(x)}$ faulty, so $\\hat p = ${ph}$.`,
    sides: ['greater'],
    p0s: [0.02, 0.1],
  },
  online: {
    intro: (p: string) => `Last year a share $p_0 = ${p}$ of households bought groceries online.`,
    sample: (n: number, x: number, ph: string) =>
      `This year a survey of $n = ${num(n)}$ randomly chosen households finds $${num(x)}$ who do, so $\\hat p = ${ph}$.`,
    sides: ['greater', 'two'],
    p0s: [0.2, 0.36],
  },
} as const;

export type ProportionContext = keyof typeof PROPORTION_CONTEXTS;

/** Survey sizes with a whole-number square root. */
const SURVEY_N = [400, 625, 1600, 2500, 10000];

export interface ProportionTest {
  context: ProportionContext;
  p0: number;
  n: number;
  /** The number of "yes" answers in the sample. */
  x: number;
  side: Side;
}

/** The standard error under H₀, √(p₀(1 − p₀)/n). */
export const proportionSe = (t: ProportionTest) => Math.sqrt((t.p0 * (1 - t.p0)) / t.n);
export const proportionPhat = (t: ProportionTest) => t.x / t.n;
export const proportionZ = (t: ProportionTest) =>
  round((proportionPhat(t) - t.p0) / proportionSe(t), 2);

/**
 * Draws a test about a proportion with a whole count x, p̂ = x/n to at most 4 decimals,
 * np₀ and n(1 − p₀) at least 10, and z on the 0.01 grid with zMin ≤ |z| ≤ zMax.
 */
export function drawProportionTest(
  rng: Rng,
  opts: { zMin: number; zMax: number; sides?: readonly Side[] },
): ProportionTest {
  for (;;) {
    const context = rng.pick(Object.keys(PROPORTION_CONTEXTS) as ProportionContext[]);
    const c = PROPORTION_CONTEXTS[context];
    const allowed = (c.sides as readonly Side[]).filter(
      (s) => !opts.sides || opts.sides.includes(s),
    );
    if (allowed.length === 0) continue;
    const side = rng.pick(allowed);
    const p0 = rng.pick(c.p0s);
    const n = rng.pick(SURVEY_N);
    if (n * p0 < 10 || n * (1 - p0) < 10) continue;
    const k = rng.int(Math.round(opts.zMin * 100), Math.round(opts.zMax * 100));
    const z = (signFor(rng, side) * k) / 100;
    const se = Math.sqrt((p0 * (1 - p0)) / n);
    const exact = n * (p0 + z * se);
    const x = Math.round(exact);
    if (Math.abs(exact - x) > 1e-7 || x <= 0 || x >= n) continue;
    if (!hasDecimals(x / n, 4)) continue;
    return { context, p0, n, x, side };
  }
}

/** The stem's description of a proportion test. */
export function proportionSetting(t: ProportionTest): string {
  const c = PROPORTION_CONTEXTS[t.context];
  return `${c.intro(num(t.p0))} ${c.sample(t.n, t.x, num(proportionPhat(t), 4))}`;
}

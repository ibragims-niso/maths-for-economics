import { round } from '../../engine/grading';

/** from, from + step, …, to (rounded to remove floating-point noise). */
export const range = (from: number, to: number, step: number) =>
  Array.from({ length: Math.round((to - from) / step) + 1 }, (_, i) => round(from + i * step, 6));

/**
 * Regressions whose coefficient is tested against an economically meaningful value: zero (does
 * the variable matter at all?) or a value that theory singles out (a unit elasticity, a market
 * beta of 1). `bs` and `ses` are the estimates and standard errors that look realistic.
 */
export const COEFFICIENT_CONTEXTS = {
  education: {
    lead: 'A regression of the log hourly wage on years of education and other worker characteristics',
    coefficient: 'the coefficient on education',
    question: 'whether education raises wages',
    nullValue: 0,
    bs: range(0.02, 0.15, 0.001),
    ses: range(0.005, 0.05, 0.001),
    decimals: 3,
  },
  minimumWage: {
    lead: 'A regression of log teenage employment across regions on the log minimum wage and regional controls',
    coefficient: 'the coefficient on the log minimum wage',
    question: 'whether the minimum wage affects teenage employment',
    nullValue: 0,
    bs: range(-0.4, -0.02, 0.01),
    ses: range(0.02, 0.2, 0.01),
    decimals: 2,
  },
  priceElasticity: {
    lead: 'A regression of the log quantity of petrol demanded on its log price, log household income and other variables',
    coefficient: 'the coefficient on the log price (the price elasticity of demand)',
    question: 'whether demand is unit elastic',
    nullValue: -1,
    bs: range(-1.8, -0.3, 0.01),
    ses: range(0.05, 0.4, 0.01),
    decimals: 2,
  },
  incomeElasticity: {
    lead: 'A regression of log household spending on restaurant meals on log household income and other household characteristics',
    coefficient: 'the coefficient on log income (the income elasticity)',
    question: 'whether the income elasticity equals 1',
    nullValue: 1,
    bs: range(0.4, 1.8, 0.01),
    ses: range(0.05, 0.4, 0.01),
    decimals: 2,
  },
  marketBeta: {
    lead: "A regression of a share's monthly excess return on the stock market's excess return and other risk factors",
    coefficient: "the coefficient on the market's excess return (the share's market beta)",
    question: 'whether the share is exactly as risky as the market (beta equal to 1)',
    nullValue: 1,
    bs: range(0.5, 1.7, 0.01),
    ses: range(0.05, 0.3, 0.01),
    decimals: 2,
  },
} as const;

export type CoefficientContext = keyof typeof COEFFICIENT_CONTEXTS;
export const COEFFICIENT_CONTEXT_IDS = Object.keys(COEFFICIENT_CONTEXTS) as CoefficientContext[];

/** H₀: β = c written in LaTeX, with the null value as a number. */
export const nullHypothesis = (c: number) => `H_0: \\beta = ${c < 0 ? `-${-c}` : c}`;

/**
 * Upper 5 % critical values of the F(q, n − k) distribution, to 2 decimals: the value with
 * P(F > value) = 0.05. Rows are the residual degrees of freedom n − k, columns q = 1, …, 5.
 * Tested against areas under the F density found by numerical integration (EM03.test.ts).
 */
export const F_05: Readonly<Record<number, readonly number[]>> = {
  10: [4.96, 4.1, 3.71, 3.48, 3.33],
  20: [4.35, 3.49, 3.1, 2.87, 2.71],
  30: [4.17, 3.32, 2.92, 2.69, 2.53],
  40: [4.08, 3.23, 2.84, 2.61, 2.45],
  60: [4.0, 3.15, 2.76, 2.53, 2.37],
  120: [3.92, 3.07, 2.68, 2.45, 2.29],
};

export const F_DFS = Object.keys(F_05).map(Number);

/** The 5 % critical value of F(q, df) from the table. */
export function fCritical(q: number, df: number): number {
  const value = F_05[df]?.[q - 1];
  if (value === undefined) throw new Error(`no F value for q = ${q}, n − k = ${df}`);
  return value;
}

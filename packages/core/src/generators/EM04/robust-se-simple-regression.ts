import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

/** The economic settings: y regressed on x for five people. */
type Context = 'wages' | 'food';

interface Params {
  context: Context;
  /** The mean of x, a whole number. */
  xbar: number;
  /** The deviations x − x̄: five distinct whole numbers in increasing order that add up to 0. */
  dev: number[];
  /** The OLS residuals, whole numbers with Σe = 0 and Σ(x − x̄)e = 0. */
  e: number[];
}

/** Asked to 3 decimal places. */
const THREE_DP = { tolerance: 0.001, relTolerance: 0 } as const;

interface Setting {
  xbars: [number, number];
  lead: string;
  xName: string;
}

const SETTINGS: Readonly<Record<Context, Setting>> = {
  wages: {
    xbars: [10, 14],
    lead: 'The hourly wage $y$ of five workers is regressed by OLS on their years of education $x$.',
    xName: 'education $x$',
  },
  food: {
    xbars: [6, 12],
    lead: 'The weekly food spending $y$ of five households (in tens) is regressed by OLS on their weekly income $x$ (in hundreds).',
    xName: 'income $x$',
  },
};

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
export const xsOf = (p: Params) => p.dev.map((d) => p.xbar + d);
/** Σ(x − x̄)². */
export const sxxOf = (p: Params) => sum(p.dev.map((d) => d * d));
/** Σ(x − x̄)²e², the middle of the robust ("sandwich") variance. */
export const meatOf = (p: Params) => sum(p.dev.map((d, i) => d * d * (p.e[i] ?? 0) ** 2));
/** The residual sum of squares Σe². */
export const ssrOf = (p: Params) => sum(p.e.map((v) => v * v));
const robustSe = (p: Params) => Math.sqrt(meatOf(p)) / sxxOf(p);
const target = (p: Params) => round(robustSe(p), 3);

function candidates(p: Params): Distractor[] {
  const sxx = sxxOf(p);
  return [
    { value: round(Math.sqrt(ssrOf(p) / 3 / sxx), 3), mistakeCode: 'USUAL_SE' },
    { value: round(meatOf(p) / sxx ** 2, 3), mistakeCode: 'ROBUST_VAR_NOT_SE' },
    { value: round(Math.sqrt(meatOf(p) / sxx), 3), mistakeCode: 'ROBUST_DENOM_NOT_SQUARED' },
  ];
}

const kept = (p: Params) =>
  cleanDistractors(target(p), candidates(p), THREE_DP.tolerance, THREE_DP.relTolerance);

/** EM04, difficulty 3: the heteroskedasticity-robust SE √Σ(x − x̄)²e² / Σ(x − x̄)² from five data points. */
export const robustSeSimpleRegression: Generator<Params> = {
  id: 'robust-se-simple-regression',
  title: 'Robust standard error of a slope',
  topicId: 'EM04',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const context = rng.pick(['wages', 'food'] as const);
      const s = SETTINGS[context];
      // Five distinct deviations in −4..4 that add up to 0.
      const four = [rng.int(-4, 4), rng.int(-4, 4), rng.int(-4, 4), rng.int(-4, 4)];
      const dev = [...four, -sum(four)].sort((a, b) => a - b);
      if (new Set(dev).size < 5 || dev.some((d) => Math.abs(d) > 4)) continue;
      // Three residuals freely; the last two make Σe = 0 and Σ(x − x̄)e = 0, as OLS residuals do.
      const e = [rng.int(-4, 4), rng.int(-4, 4), rng.int(-4, 4)];
      const sumE = sum(e);
      const sumDe = sum(e.map((v, i) => (dev[i] ?? 0) * v));
      const d4 = dev[3] ?? 0;
      const d5 = dev[4] ?? 0;
      const e5 = (d4 * sumE - sumDe) / (d5 - d4);
      if (!Number.isInteger(e5)) continue;
      e.push(-sumE - e5, e5);
      const p: Params = { context, xbar: rng.int(s.xbars[0], s.xbars[1]), dev, e };
      if (e.some((v) => Math.abs(v) > 8) || e.filter((v) => v === 0).length > 1) continue;
      // Wider spread at the top of x than at the bottom, as with wages or spending.
      const first = Math.abs(e[0] ?? 0);
      const last = Math.abs(e[4] ?? 0);
      if (last < 2 || last < first || ssrOf(p) < 10) continue;
      if (kept(p).length === 3) return p;
    }
  },

  stem(p) {
    const s = SETTINGS[p.context];
    const table = `\\begin{array}{c|ccccc} x & ${xsOf(p)
      .map((v) => num(v))
      .join(' & ')} \\\\ \\hline e & ${p.e.map((v) => num(v)).join(' & ')} \\end{array}`;
    return `${s.lead} The ${s.xName} and the OLS residuals $e$ are $${table}$ Find the heteroskedasticity-robust (White) standard error of the slope, $\\sqrt{\\sum (x - \\bar x)^2 e^2} \\,/\\, \\sum (x - \\bar x)^2$. Give your answer to 3 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: 3, ...THREE_DP }),

  steps(p) {
    const sxx = sxxOf(p);
    const meat = meatOf(p);
    const paren = (v: number) => (v < 0 ? `(${num(v)})` : num(v));
    return [
      {
        text: 'Find the mean of x and the spread around it.',
        latex: `\\bar x = ${p.xbar}, \\quad x - \\bar x = ${p.dev.map((d) => num(d)).join(',\\ ')}, \\quad \\sum (x - \\bar x)^2 = ${sxx}`,
        why: 'Both the usual and the robust formula measure the spread of x around its own mean.',
        result: sxx,
      },
      {
        text: 'Weight each squared residual by the squared distance of its x from the mean, and add.',
        latex: `\\sum (x - \\bar x)^2 e^2 = ${p.dev.map((d, i) => `${paren(d)}^2 \\cdot ${paren(p.e[i] ?? 0)}^2`).join(' + ')} = ${meat}`,
        why: 'Instead of assuming one error variance σ² for everybody, each observation uses its own squared residual as an estimate of its error variance. Points far from x̄ get the most weight, because they move the slope most.',
        result: meat,
      },
      {
        text: 'Divide by the square of Σ(x − x̄)² to get the robust variance.',
        latex: `\\widehat{\\operatorname{Var}}_{\\text{rob}}(b_1) = \\dfrac{${meat}}{${sxx}^2} = \\dfrac{${meat}}{${sxx * sxx}} = ${num(meat / (sxx * sxx), 4)}`,
        why: 'The slope is b₁ = β₁ + Σ(x − x̄)u/Σ(x − x̄)², so Var(b₁) = Σ(x − x̄)²σᵢ²/(Σ(x − x̄)²)², with σᵢ² estimated by eᵢ². Only when every σᵢ² equals the same σ² does this collapse to σ²/Σ(x − x̄)².',
        result: round(meat / (sxx * sxx), 4),
      },
      {
        text: 'Take the square root.',
        latex: `\\operatorname{SE}_{\\text{rob}}(b_1) = \\dfrac{\\sqrt{${meat}}}{${sxx}} = ${num(target(p), 3)}`,
        why: 'The standard error is the square root of the variance, in the same units as the slope.',
        result: target(p),
      },
    ];
  },

  distractors: (p) => kept(p),
};

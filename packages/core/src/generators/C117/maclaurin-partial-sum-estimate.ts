import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** 'exp': a continuous growth or discount factor e^x; 'ln': a log return ln(1 + x). */
  fn: 'exp' | 'ln';
  /** Interest rate (exp) or growth over the period (ln), in per cent. */
  rate: number;
  /** Years of continuous compounding (exp only; 1 for ln). */
  years: number;
  /** +1 for growth, −1 for discounting (exp only; +1 for ln). */
  sign: 1 | -1;
  /** How many terms of the series to add. */
  terms: number;
}

/** Four decimals asked for; the terms left out are small, so only rounding slips are allowed. */
const FOUR_DP = { tolerance: 0.0002, relTolerance: 0 } as const;

const factorial = (k: number): number => (k <= 1 ? 1 : k * factorial(k - 1));

/** The point x where the series is used. */
export const pointOf = (p: Params) => (p.sign * p.rate * p.years) / 100;

/** The k-th term of the series: x^k/k! for eˣ (k = 0, 1, …), (−1)^(k+1) x^k/k for ln(1 + x) (k = 1, 2, …). */
export function seriesTerm(fn: Params['fn'], x: number, k: number): number {
  return fn === 'exp' ? x ** k / factorial(k) : ((-1) ** (k + 1) * x ** k) / k;
}

/** The sum of the first n terms. */
export function partialSum(fn: Params['fn'], x: number, n: number): number {
  const first = fn === 'exp' ? 0 : 1;
  let sum = 0;
  for (let k = first; k < first + n; k++) sum += seriesTerm(fn, x, k);
  return sum;
}

const estimate = (p: Params) => round(partialSum(p.fn, pointOf(p), p.terms), 4);

function candidates(p: Params) {
  const x = pointOf(p);
  const list = [
    {
      value: round(p.fn === 'exp' ? Math.exp(x) : Math.log(1 + x), 4),
      mistakeCode: 'EXACT_VALUE',
    },
    { value: round(partialSum(p.fn, x, p.terms + 1), 4), mistakeCode: 'TERM_COUNT' },
  ];
  if (p.fn === 'exp') {
    let geometric = 0;
    for (let k = 0; k < p.terms; k++) geometric += x ** k;
    list.push({ value: round(geometric, 4), mistakeCode: 'NO_FACTORIAL' });
    if (x < 0)
      list.push({ value: round(partialSum('exp', -x, p.terms), 4), mistakeCode: 'ALL_PLUS' });
  } else {
    let plus = 0;
    for (let k = 1; k <= p.terms; k++) plus += x ** k / k;
    list.push({ value: round(plus, 4), mistakeCode: 'ALL_PLUS' });
  }
  return list;
}

/** The terms written out, e.g. "1 + 0.3 + \dfrac{0.3^2}{2} + \dfrac{0.3^3}{6}". */
function termsLatex(p: Params): string {
  const x = pointOf(p);
  const base = x < 0 ? `(${num(x, 4)})` : num(x, 4);
  const parts: string[] = [];
  if (p.fn === 'exp') {
    for (let k = 0; k < p.terms; k++) {
      if (k === 0) parts.push('1');
      else if (k === 1) parts.push(base);
      else parts.push(`\\dfrac{${base}^{${k}}}{${factorial(k)}}`);
    }
    return parts.join(' + ');
  }
  let text = num(x, 4);
  for (let k = 2; k <= p.terms; k++) {
    text += ` ${k % 2 === 0 ? '-' : '+'} \\dfrac{${num(x, 4)}^{${k}}}{${k}}`;
  }
  return text;
}

/** The values of the terms, e.g. "1 + 0.3 + 0.045 + 0.0045" (negative ones with a minus sign). */
function valuesLatex(p: Params): string {
  const x = pointOf(p);
  const first = p.fn === 'exp' ? 0 : 1;
  let text = '';
  for (let k = first; k < first + p.terms; k++) {
    const t = seriesTerm(p.fn, x, k);
    const shown = num(Math.abs(t), 6);
    text += k === first ? num(t, 6) : ` ${t < 0 ? '-' : '+'} ${shown}`;
  }
  return text;
}

/** C117, difficulty 2: estimate e^x or ln(1 + x) with the first n terms of its Maclaurin series. */
export const maclaurinPartialSumEstimate: Generator<Params> = {
  id: 'maclaurin-partial-sum-estimate',
  title: 'Estimate with a Maclaurin series',
  topicId: 'C117',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const p: Params =
        rng.next() < 0.6
          ? {
              fn: 'exp',
              rate: rng.int(2, 12),
              years: rng.int(2, 10),
              sign: rng.next() < 0.7 ? 1 : -1,
              terms: rng.int(3, 5),
            }
          : { fn: 'ln', rate: rng.int(5, 40), years: 1, sign: 1, terms: rng.int(2, 4) };
      // A growth or discount factor up to e^1: the series converges fast enough to be useful.
      if (p.rate * p.years > 100) continue;
      if (cleanDistractors(estimate(p), candidates(p), FOUR_DP.tolerance, 0).length < 3) continue;
      return p;
    }
  },

  stem(p) {
    const x = pointOf(p);
    if (p.fn === 'ln') {
      return `An investment grows by $${p.rate}\\%$ over a year, so its continuously compounded (log) return is $\\ln(${num(1 + x, 2)})$. Estimate $\\ln(${num(1 + x, 2)})$ with the first $${p.terms}$ terms of the Maclaurin series of $\\ln(1 + x)$. Give your answer to 4 decimal places.`;
    }
    const story =
      p.sign === 1
        ? `A deposit earns $${p.rate}\\%$ a year, compounded continuously, for $${p.years}$ years, so it grows by the factor $e^{${num(x, 2)}}$.`
        : `A payment due in $${p.years}$ years is discounted continuously at $${p.rate}\\%$ a year, so its discount factor is $e^{${num(x, 2)}}$.`;
    return `${story} Estimate $e^{${num(x, 2)}}$ with the first $${p.terms}$ terms of the Maclaurin series of $e^x$. Give your answer to 4 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: estimate(p), decimals: 4, ...FOUR_DP }),

  steps(p) {
    const x = pointOf(p);
    const ans = estimate(p);
    const exact = p.fn === 'exp' ? Math.exp(x) : Math.log(1 + x);
    const target = p.fn === 'exp' ? `e^{${num(x, 2)}}` : `\\ln(${num(1 + x, 2)})`;
    return [
      {
        text: `Write down the first ${p.terms} terms of the series.`,
        latex:
          p.fn === 'exp'
            ? `e^x = 1 + x + \\dfrac{x^2}{2!} + \\dfrac{x^3}{3!} + \\dots, \\quad x = ${num(x, 2)}`
            : `\\ln(1 + x) = x - \\dfrac{x^2}{2} + \\dfrac{x^3}{3} - \\dots, \\quad x = ${num(x, 2)}`,
        why:
          p.fn === 'exp'
            ? 'Every derivative of eˣ at 0 equals 1, so the k-th term is xᵏ/k!. The series converges for every x.'
            : 'The derivatives of ln(1 + x) at 0 give the terms xᵏ/k with alternating signs. The series converges for −1 < x ≤ 1, and here x is well inside.',
      },
      {
        text: 'Put in the number and work out each term.',
        latex: `${target} \\approx ${termsLatex(p)} = ${valuesLatex(p)}`,
        why:
          p.fn === 'exp'
            ? `Divide each power by k!, not by k${x < 0 ? '; x is negative, so its odd powers are negative' : ''}.`
            : 'The signs alternate: the even powers are subtracted and the odd ones added.',
      },
      {
        text: 'Add the terms.',
        latex: `${target} \\approx ${num(ans, 4)}`,
        why: `The sum of the first ${p.terms} terms is a partial sum of the series; rounded to 4 decimal places it is the estimate.`,
        result: ans,
      },
      {
        text: 'Compare with the calculator value.',
        latex: `${target} = ${num(exact, 6)}`,
        why: 'The gap is about the size of the first term left out, so a few terms are enough when x is small.',
      },
    ];
  },

  distractors: (p) => cleanDistractors(estimate(p), candidates(p), FOUR_DP.tolerance, 0),
};

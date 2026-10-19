import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** 'rent': a rent paid every year for ever, discounted at `rate` %; 'fade': extra sales a·qⁿ in month n. */
  kind: 'rent' | 'fade';
  /** The yearly rent (rent) or the coefficient a of a·qⁿ (fade). */
  amount: number;
  /** Discount rate in per cent (rent only; 0 for fade). */
  rate: number;
  /** The common ratio q of the fading effect (fade only; 0 for rent, whose ratio is 1/(1 + r)). */
  share: number;
  /** Where the sum starts: t = 0 (a payment today, or the launch month) or t = 1. */
  start: 0 | 1;
}

const MONEY = { tolerance: 0.05, relTolerance: 0.00005 } as const;
const RATES = [2, 2.5, 4, 5, 8, 10] as const;
const SHARES = [0.2, 0.25, 0.4, 0.5, 0.6, 0.75, 0.8, 0.9] as const;

/** The common ratio: 1/(1 + r) for discounted rent, q for a fading effect. */
const ratio = (p: Params) => (p.kind === 'rent' ? 1 / (1 + p.rate / 100) : p.share);

/** The first term of the series: the t = 0 or the t = 1 term. */
const firstTerm = (p: Params, start: 0 | 1 = p.start) => p.amount * ratio(p) ** start;

/** a/(1 − q) with a the first term; for rent from t = 1 this is C/r. */
const sumFrom = (p: Params, start: 0 | 1 = p.start) => firstTerm(p, start) / (1 - ratio(p));

const total = (p: Params) => round(sumFrom(p), 2);

function candidates(p: Params) {
  return [
    { value: round(sumFrom(p, p.start === 1 ? 0 : 1), 2), mistakeCode: 'START_INDEX' },
    { value: round(firstTerm(p), 2), mistakeCode: 'FIRST_TERM_ONLY' },
    { value: round(firstTerm(p) / (1 + ratio(p)), 2), mistakeCode: 'RATIO_SIGN' },
  ];
}

/** The series in sigma notation, e.g. "\sum_{t=1}^{\infty} \dfrac{6{,}000}{1.04^t}". */
function seriesLatex(p: Params): string {
  if (p.kind === 'rent') {
    return `\\sum_{t=${p.start}}^{\\infty} \\dfrac{${num(p.amount)}}{${num(1 + p.rate / 100, 3)}^t}`;
  }
  return `\\sum_{n=${p.start}}^{\\infty} ${num(p.amount)}\\,(${num(p.share)})^n`;
}

/** C117, difficulty 1: sum of an infinite geometric series (a perpetual rent or a fading effect), a/(1 − q). */
export const infiniteGeometricSeriesSum: Generator<Params> = {
  id: 'infinite-geometric-series-sum',
  title: 'Sum of an infinite geometric series',
  topicId: 'C117',
  difficulty: 1,
  timeSec: 90,

  params(rng) {
    for (;;) {
      const start = rng.pick([0, 1] as const);
      const p: Params =
        rng.next() < 0.5
          ? { kind: 'rent', amount: rng.int(5, 120) * 100, rate: rng.pick(RATES), share: 0, start }
          : { kind: 'fade', amount: rng.int(2, 60) * 10, rate: 0, share: rng.pick(SHARES), start };
      if (cleanDistractors(total(p), candidates(p), MONEY.tolerance, MONEY.relTolerance).length < 3)
        continue;
      return p;
    }
  },

  stem(p) {
    if (p.kind === 'rent') {
      const when =
        p.start === 1
          ? `${num(p.amount)}$ at the end of every year, for ever`
          : `${num(p.amount)}$ a year for ever, with the first payment due today`;
      return `A plot of farmland can be rented out for $${when}. At a discount rate of $${num(p.rate)}\\%$ a year its present value is the infinite series $${seriesLatex(p)}$. Find the sum of the series.`;
    }
    const months =
      p.start === 1
        ? 'n = 1, 2, 3, \\dots'
        : 'n = 0, 1, 2, \\dots \\text{ (month 0 is the launch month)}';
    return `After an advertising campaign, the extra sales in month $n$ are $${num(p.amount)}\\,(${num(p.share)})^n$ units, for $${months}$. Find the total extra sales over all months, $${seriesLatex(p)}$. Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: total(p), decimals: 2, ...MONEY }),

  steps(p) {
    const q = ratio(p);
    const a = firstTerm(p);
    const qLatex = p.kind === 'rent' ? `\\dfrac{1}{${num(1 + p.rate / 100, 3)}}` : num(q);
    const index = `${p.kind === 'rent' ? 't' : 'n'} = ${p.start}`;
    return [
      {
        text: 'Find the first term and the common ratio.',
        latex: `a = ${p.kind === 'rent' && p.start === 1 ? `\\dfrac{${num(p.amount)}}{${num(1 + p.rate / 100, 3)}} = ` : ''}${num(a, 2)}, \\quad q = ${qLatex}`,
        why: `The first term is the ${index} term, because that is where the sum starts; each later term is the one before times the same ratio q.`,
        result: round(a, 2),
      },
      {
        text: 'Check that the series converges.',
        latex: `|q| = ${num(q, 4)} < 1`,
        why: 'A geometric series converges exactly when |q| < 1: then qⁿ → 0 and the partial sums settle at a finite limit.',
      },
      {
        text: 'Use the sum of an infinite geometric series.',
        latex:
          p.kind === 'rent'
            ? `S = \\dfrac{a}{1 - q} = ${p.start === 1 ? `\\dfrac{${num(p.amount)}}{${num(p.rate / 100, 3)}}` : `\\dfrac{${num(p.amount)} \\times ${num(1 + p.rate / 100, 3)}}{${num(p.rate / 100, 3)}}`} = ${num(total(p))}`
            : `S = \\dfrac{a}{1 - q} = \\dfrac{${num(a, 4)}}{1 - ${num(q)}} = ${num(total(p))}`,
        why:
          p.kind === 'rent'
            ? 'S = a/(1 − q), the first term divided by one minus the ratio (not one plus). With a = C/(1 + r) and q = 1/(1 + r) this simplifies to C/r; a payment today adds one more C.'
            : 'S = a/(1 − q): the first term divided by one minus the ratio (not one plus), where the first term is the one the sum starts with.',
        result: total(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(total(p), candidates(p), MONEY.tolerance, MONEY.relTolerance),
};

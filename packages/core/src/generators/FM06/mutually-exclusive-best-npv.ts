import { round, withinTolerance } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Small, quick project: its cost today. */
  smallCost: number;
  /** Drawn first: the small project's IRR in whole per cent (its single cash flow is built from it). */
  smallIrr: number;
  /** Large, long-lived project: its cost today. */
  largeCost: number;
  /** The large project's equal cash flow at the end of each year. */
  largeFlow: number;
  /** How many years the large project pays. */
  years: number;
  /** The firm's discount rate in whole per cent. */
  rate: number;
  /** Whether the large project is described first (and so called A). */
  largeFirst: boolean;
}

const MONEY = { tolerance: 0.05, relTolerance: 0.00005 } as const;

/** The small project pays its cost grown at its IRR, one year from now. */
const smallFlow = (p: Params) => (p.smallCost * (100 + p.smallIrr)) / 100;
const factor = (p: Params) => 1 + p.rate / 100;
const smallPiece = (p: Params) => round(smallFlow(p) / factor(p), 2);
const largePieces = (p: Params) =>
  Array.from({ length: p.years }, (_, i) => round(p.largeFlow / factor(p) ** (i + 1), 2));
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const smallNpv = (p: Params) => round(smallPiece(p) - p.smallCost, 2);
const largeNpv = (p: Params) => round(sum(largePieces(p)) - p.largeCost, 2);

/** The large project's IRR in per cent, by bisection: its NPV falls as the rate rises. */
export function largeIrrPercent(p: Params): number {
  const value = (r: number) => {
    let total = -p.largeCost;
    for (let t = 1; t <= p.years; t++) total += p.largeFlow / (1 + r) ** t;
    return total;
  };
  let lo = 0;
  let hi = 1;
  for (let k = 0; k < 60; k++) {
    const mid = (lo + hi) / 2;
    if (value(mid) > 0) lo = mid;
    else hi = mid;
  }
  return ((lo + hi) / 2) * 100;
}

const names = (p: Params) =>
  p.largeFirst ? { large: 'A', small: 'B' } : { large: 'B', small: 'A' };

function candidates(p: Params) {
  return [
    { value: smallNpv(p), mistakeCode: 'IRR_RANKING' },
    { value: round(p.years * p.largeFlow - p.largeCost, 2), mistakeCode: 'NO_DISCOUNTING' },
    { value: round(sum(largePieces(p)), 2), mistakeCode: 'FORGOT_OUTLAY' },
  ];
}

/** FM06, difficulty 3: choose between two mutually exclusive projects whose NPV and IRR rankings conflict. */
export const mutuallyExclusiveBestNpv: Generator<Params> = {
  id: 'mutually-exclusive-best-npv',
  title: 'Choosing between two projects',
  topicId: 'FM06',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const smallCost = rng.int(4, 30) * 500;
      const years = rng.int(3, 5);
      const largeCost = smallCost * rng.int(2, 5);
      const p: Params = {
        smallCost,
        smallIrr: rng.int(15, 40),
        largeCost,
        largeFlow: Math.round((largeCost * rng.int(105, 150)) / (100 * years) / 100) * 100,
        years,
        rate: rng.int(3, 10),
        largeFirst: rng.pick([true, false] as const),
      };
      const irr = largeIrrPercent(p);
      // The conflict this problem is about: both projects worth doing, the small one with the
      // higher IRR, the large one with the clearly higher NPV.
      if (smallNpv(p) < 100 || largeNpv(p) < smallNpv(p) + 100) continue;
      if (irr < p.rate + 1 || irr > p.smallIrr - 2) continue;
      const values = [largeNpv(p), ...candidates(p).map((c) => c.value)];
      const clash = values.some((v, i) =>
        values.some((w, j) => j > i && withinTolerance(v, w, MONEY.tolerance, MONEY.relTolerance)),
      );
      if (!clash) return p;
    }
  },

  stem(p) {
    const n = names(p);
    const large = `Project ${n.large} costs $${num(p.largeCost)}$ today and returns $${num(p.largeFlow)}$ at the end of each of the next $${p.years}$ years; its IRR is about $${num(largeIrrPercent(p), 1)}\\%$.`;
    const small = `Project ${n.small} costs $${num(p.smallCost)}$ today and returns $${num(smallFlow(p))}$ at the end of one year; its IRR is $${p.smallIrr}\\%$.`;
    return `A firm can carry out only one of two projects. ${p.largeFirst ? `${large} ${small}` : `${small} ${large}`} The firm's discount rate is $${p.rate}\\%$ per year. Which project should it choose? Give the NPV of the project it should choose, to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: largeNpv(p), decimals: 2, ...MONEY }),

  steps(p) {
    const n = names(p);
    const r = num(factor(p), 2);
    return [
      {
        text: `NPV of the small, quick project ${n.small}.`,
        latex: `NPV_${n.small} = -${num(p.smallCost)} + \\dfrac{${num(smallFlow(p))}}{${r}} = ${num(smallNpv(p))}`,
        why: 'Discount its single cash flow by one year and subtract the cost paid today.',
        result: smallNpv(p),
      },
      {
        text: `NPV of the large, long-lived project ${n.large}.`,
        latex: `NPV_${n.large} = -${num(p.largeCost)} + ${largePieces(p)
          .map((v) => num(v))
          .join(' + ')} = ${num(largeNpv(p))}`,
        why: 'Each yearly cash flow is discounted by its own date, then the cost paid today is subtracted.',
        result: largeNpv(p),
      },
      {
        text: `Choose the higher NPV: project ${n.large}.`,
        latex: `${num(largeNpv(p))} > ${num(smallNpv(p))}`,
        why: `Project ${n.small} has the higher IRR, but it is small: a high rate on a small amount adds less wealth than a lower rate on a large amount for several years. With only one project allowed, the NPV says which adds more value today.`,
        result: largeNpv(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(largeNpv(p), candidates(p), MONEY.tolerance, MONEY.relTolerance),
};

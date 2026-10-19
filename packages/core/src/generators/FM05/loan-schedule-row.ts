import { round, withinTolerance } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

type Context = 'mortgage' | 'car' | 'student' | 'business';
type Ask = 'interest' | 'principal' | 'balance';

interface Params {
  context: Context;
  /** What is asked: the interest or principal part of payment k, or the balance just after it. */
  ask: Ask;
  /** The amount borrowed. */
  loan: number;
  /** Annual rate in per cent (compounded monthly when payments are monthly). */
  rate: number;
  /** Payments per year: 1 (annual) or 12 (monthly). */
  m: 1 | 12;
  years: number;
  /** The payment number the question is about (2 ≤ k ≤ n). */
  k: number;
}

const MONEY = { tolerance: 0.05, relTolerance: 0.00005 } as const;
const PERIOD = { 1: 'year', 12: 'month' } as const;

const perPeriod = (p: Params) => p.rate / 100 / p.m;
const count = (p: Params) => p.m * p.years;
/** The level payment at full precision: L·r/(1 − (1 + r)^(−n)). */
const levelPayment = (p: Params) => (p.loan * perPeriod(p)) / (1 - (1 + perPeriod(p)) ** -count(p));

/** Balance just after payment j: the present value of the n − j payments still to come. */
const balanceAhead = (p: Params, j: number, pay: number) =>
  (pay * (1 - (1 + perPeriod(p)) ** -(count(p) - j))) / perPeriod(p);
/** Balance just after payment j, the other way: the loan grown for j periods minus the payments grown. */
const balanceBehind = (p: Params, j: number, pay: number) => {
  const g = (1 + perPeriod(p)) ** j;
  return p.loan * g - (pay * (g - 1)) / perPeriod(p);
};

/** The asked quantity for a given payment and a given way of finding balances. */
function asked(p: Params, pay: number, balance: (p: Params, j: number, pay: number) => number) {
  if (p.ask === 'balance') return balance(p, p.k, pay);
  const interest = perPeriod(p) * balance(p, p.k - 1, pay);
  return p.ask === 'interest' ? interest : pay - interest;
}

const exact = (p: Params) => asked(p, levelPayment(p), balanceAhead);
const answerValue = (p: Params) => round(exact(p), 2);

function candidates(p: Params): Distractor[] {
  const r = perPeriod(p);
  const pay = levelPayment(p);
  const before = balanceAhead(p, p.k - 1, pay);
  const after = balanceAhead(p, p.k, pay);
  const interest = r * before;
  if (p.ask === 'interest') {
    return [
      { value: round(r * p.loan, 2), mistakeCode: 'INTEREST_ON_ORIGINAL' },
      { value: round(pay - interest, 2), mistakeCode: 'SWAPPED_PARTS' },
      { value: round(r * after, 2), mistakeCode: 'OFF_BY_ONE' },
    ];
  }
  if (p.ask === 'principal') {
    return [
      { value: round(pay - r * p.loan, 2), mistakeCode: 'INTEREST_ON_ORIGINAL' },
      { value: round(interest, 2), mistakeCode: 'SWAPPED_PARTS' },
      { value: round(pay - r * after, 2), mistakeCode: 'OFF_BY_ONE' },
    ];
  }
  const list: Distractor[] = [
    { value: round(p.loan - p.k * (pay - r * p.loan), 2), mistakeCode: 'INTEREST_ON_ORIGINAL' },
    { value: round(before, 2), mistakeCode: 'OFF_BY_ONE' },
  ];
  // Subtracting the payments without interest only looks plausible while it stays positive.
  if (p.loan - p.k * pay > 0) {
    list.push({ value: round(p.loan - p.k * pay, 2), mistakeCode: 'PAYMENTS_SUBTRACTED' });
  }
  return list;
}

const distractorsFor = (p: Params) =>
  cleanDistractors(answerValue(p), candidates(p), MONEY.tolerance, MONEY.relTolerance);

const OPENING: Record<Context, (p: Params) => string> = {
  mortgage: (p) =>
    `A household takes out a mortgage of $${num(p.loan)}$, repaid in equal monthly instalments over $${p.years}$ years`,
  car: (p) =>
    `A car loan of $${num(p.loan)}$ is repaid in equal monthly instalments over $${p.years}$ years`,
  student: (p) =>
    `A graduate repays a student loan of $${num(p.loan)}$ in equal monthly instalments over $${p.years}$ years`,
  business: (p) =>
    `A firm borrows $${num(p.loan)}$ to buy machinery and repays it in equal yearly instalments over $${p.years}$ years`,
};

const QUESTION: Record<Ask, (k: number) => string> = {
  interest: (k) => `How much of payment number $${k}$ is interest?`,
  principal: (k) => `How much of payment number $${k}$ repays the loan itself (the principal)?`,
  balance: (k) => `How much is still owed just after payment number $${k}$?`,
};

/** FM05, difficulty 2: the interest or principal part of payment k, or the balance after it. */
export const loanScheduleRow: Generator<Params> = {
  id: 'loan-schedule-row',
  title: 'A row of a loan schedule',
  topicId: 'FM05',
  difficulty: 2,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const context = rng.pick(['mortgage', 'car', 'student', 'business'] as const);
      const ask = rng.pick(['interest', 'principal', 'balance'] as const);
      // Monthly rates are multiples of 0.6 % a year, so r = rate/12 has at most 4 decimals.
      let base: Omit<Params, 'ask' | 'k'>;
      if (context === 'mortgage') {
        base = {
          context,
          loan: rng.int(12, 80) * 5000,
          rate: round(rng.int(5, 13) * 0.6, 1),
          m: 12,
          years: rng.int(10, 30),
        };
      } else if (context === 'car') {
        base = {
          context,
          loan: rng.int(12, 90) * 500,
          rate: round(rng.int(5, 20) * 0.6, 1),
          m: 12,
          years: rng.int(2, 7),
        };
      } else if (context === 'student') {
        base = {
          context,
          loan: rng.int(8, 60) * 1000,
          rate: round(rng.int(4, 12) * 0.6, 1),
          m: 12,
          years: rng.int(5, 20),
        };
      } else {
        base = {
          context,
          loan: rng.int(4, 160) * 5000,
          rate: rng.int(6, 24) / 2,
          m: 1,
          years: rng.int(3, 15),
        };
      }
      const n = base.m * base.years;
      const p: Params = { ...base, ask, k: rng.int(2, ask === 'balance' ? n - 1 : n) };
      const value = answerValue(p);
      if (value <= 0) continue;
      // A student who rounds the payment to the cent, and finds balances either way, must
      // still land within the tolerance.
      const rounded = round(levelPayment(p), 2);
      const fine = [balanceAhead, balanceBehind].every((route) =>
        withinTolerance(asked(p, rounded, route), value, MONEY.tolerance, MONEY.relTolerance),
      );
      if (fine && distractorsFor(p).length >= 2) return p;
    }
  },

  stem: (p) =>
    `${OPENING[p.context](p)} at $${num(p.rate)}\\%$ a year${p.m === 12 ? ', compounded monthly' : ''}; each payment is made at the end of the ${PERIOD[p.m]}. ${QUESTION[p.ask](p.k)} Keep full precision in your working and give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: answerValue(p), decimals: 2, ...MONEY }),

  steps(p) {
    const r = perPeriod(p);
    const n = count(p);
    const pay = levelPayment(p);
    const rateLatex =
      p.m === 12 ? `r = \\dfrac{${num(p.rate / 100, 4)}}{12} = ${num(r, 6)}` : `r = ${num(r, 6)}`;
    const countLatex = p.m === 12 ? `n = 12 \\cdot ${p.years} = ${n}` : `n = ${n}`;
    const steps = [
      {
        text: 'Find the interest rate per period and the number of payments.',
        latex: `${rateLatex}, \\quad ${countLatex}`,
        why:
          p.m === 12
            ? 'Payments are monthly, so interest is charged per month: the annual rate is split into 12 and the payments are counted in months.'
            : 'Payments and interest are both yearly, so each period is one year.',
        result: n,
      },
      {
        text: 'Find the level payment and keep it unrounded.',
        latex: `PMT = \\dfrac{${num(p.loan)} \\times ${num(r, 6)}}{1 - (${num(1 + r, 6)})^{-${n}}} = ${num(pay, 4)}`,
        why: 'The payments must have a present value equal to the loan, so PMT = L·r/(1 − (1 + r)^(−n)). Rounding it now would add a small error to every later step.',
        result: round(pay, 4),
      },
    ];
    if (p.ask === 'balance') {
      const left = n - p.k;
      const after = balanceAhead(p, p.k, pay);
      steps.push({
        text: `Value the ${left} payments that are still to come.`,
        latex: `B_{${p.k}} = ${num(pay, 4)} \\times \\dfrac{1 - (${num(1 + r, 6)})^{-${left}}}{${num(r, 6)}} = ${num(after)}`,
        why: 'What is still owed is exactly what the remaining payments repay, so the balance is their present value: an annuity of PMT for n − k periods.',
        result: round(after, 2),
      });
      return steps;
    }
    const left = n - p.k + 1;
    const before = balanceAhead(p, p.k - 1, pay);
    const interest = r * before;
    steps.push(
      {
        text: `Find the balance just before payment ${p.k}, after ${p.k - 1} payments.`,
        latex: `B_{${p.k - 1}} = ${num(pay, 4)} \\times \\dfrac{1 - (${num(1 + r, 6)})^{-${left}}}{${num(r, 6)}} = ${num(before)}`,
        why: `Interest in payment ${p.k} is charged on what is owed during that ${PERIOD[p.m]}, the balance left after payment ${p.k - 1}. It equals the present value of the ${left} payments still to come.`,
        result: round(before, 2),
      },
      {
        text: `Charge one ${PERIOD[p.m]} of interest on that balance.`,
        latex: `I_{${p.k}} = ${num(r, 6)} \\times ${num(before)} = ${num(interest)}`,
        why: 'The interest part of a payment is always the rate per period times the opening balance of that period.',
        result: round(interest, 2),
      },
    );
    if (p.ask === 'principal') {
      steps.push({
        text: 'The rest of the payment repays principal.',
        latex: `P_{${p.k}} = ${num(pay, 4)} - ${num(interest)} = ${num(pay - interest)}`,
        why: 'Each payment first covers the interest due; whatever is left reduces the balance.',
        result: round(pay - interest, 2),
      });
    }
    return steps;
  },

  distractors: distractorsFor,
};

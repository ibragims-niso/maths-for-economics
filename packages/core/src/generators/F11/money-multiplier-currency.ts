import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Reserve ratio R/D, e.g. 0.1. */
  rr: number;
  /** Currency ratio CU/D, e.g. 0.2. */
  c: number;
  /** Rise in the monetary base. */
  change: number;
}

const RESERVE_PCT = [5, 8, 10, 12, 15, 20, 25] as const;
const CURRENCY_PCT = [5, 10, 15, 20, 25, 30, 40, 50] as const;

const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
const pct = (x: number) => Math.round(x * 100);

/** c + rr in per cent: the base needed for each 100 of deposits. */
const heldPct = (p: Params) => pct(p.c) + pct(p.rr);
/** ΔM = ΔB(1 + c)/(c + rr), in whole-number arithmetic so the result is exact. */
const rise = (p: Params) => (p.change * (100 + pct(p.c))) / heldPct(p);

/** F11, difficulty 2: change in the money supply from a change in the base, (1 + c)/(c + rr). */
export const moneyMultiplierCurrency: Generator<Params> = {
  id: 'money-multiplier-currency',
  title: 'Change in the money supply',
  topicId: 'F11',
  difficulty: 2,
  timeSec: 120,

  params(rng) {
    const rrPct = rng.pick(RESERVE_PCT);
    const cPct = rng.pick(CURRENCY_PCT);
    // ΔM is whole when ΔB is a multiple of `step` (at most 37 for these ratios).
    const step = (cPct + rrPct) / gcd(100 + cPct, cPct + rrPct);
    const change = step * rng.int(Math.ceil(10 / step), Math.floor(300 / step));
    return { rr: rrPct / 100, c: cPct / 100, change };
  },

  stem: (p) =>
    `Banks keep reserves equal to $${pct(p.rr)}\\%$ of deposits, and the public holds cash equal to $${pct(p.c)}\\%$ of deposits. The central bank raises the monetary base by $${num(p.change)}$ (billion). By how much does the money supply rise?`,

  answer: (p) => ({ kind: 'numeric', value: rise(p), decimals: 0 }),

  steps(p) {
    const held = heldPct(p) / 100;
    const deposits = p.change / held;
    const exact = (p.change * 10000) % heldPct(p) === 0; // does ΔD stop after 2 decimals?
    return [
      {
        text: 'New base money is held either as cash by the public or as reserves by banks.',
        latex: `\\Delta B = c\\,\\Delta D + rr\\,\\Delta D = (${num(p.c)} + ${num(p.rr)})\\,\\Delta D = ${num(held)}\\,\\Delta D`,
        why: 'Both cash and reserves are fixed shares of deposits, so each unit of new deposits uses up c + rr of base money.',
        result: held,
      },
      {
        text: 'Solve for the change in deposits.',
        latex: `\\Delta D = \\dfrac{${num(p.change)}}{${num(held)}} ${exact ? '=' : '\\approx'} ${num(deposits)}`,
        why: 'Divide both sides by c + rr to get deposits on their own.',
        result: round(deposits, 2),
      },
      {
        text: 'Money is cash plus deposits.',
        latex: `\\Delta M^s = (1 + ${num(p.c)})\\,\\Delta D = \\dfrac{${num(1 + p.c)} \\times ${num(p.change)}}{${num(held)}} = ${num(rise(p))}`,
        why: 'The public holds c of cash for each unit of deposits, so money is (1 + c) times deposits; the money multiplier is (1 + c)/(c + rr).',
        result: rise(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(rise(p), [
      { value: round(p.change / p.rr, 2), mistakeCode: 'IGNORED_CURRENCY' },
      { value: round(p.change / (p.c + p.rr), 2), mistakeCode: 'DEPOSITS_ONLY' },
      { value: p.change, mistakeCode: 'BASE_ONLY' },
    ]),
};

import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Income rate at t = 0, in thousands per year. */
  start: number;
  /** Rise in the income rate each year, in thousands per year. */
  growth: number;
  /** Continuous discount rate in per cent. */
  rate: number;
  years: number;
}

const MONEY = { tolerance: 0.05, relTolerance: 0.00005 } as const;

/** e^(−rT), the discount factor at the end of the stream. */
const endFactor = (p: Params) => Math.exp((-p.rate / 100) * p.years);

/** ∫₀ᵀ e^(−rt) dt = (1 − e^(−rT))/r. */
const levelPart = (p: Params) => (1 - endFactor(p)) / (p.rate / 100);

/** ∫₀ᵀ t·e^(−rt) dt = (1 − e^(−rT))/r² − T·e^(−rT)/r, by parts. */
const slopePart = (p: Params) => {
  const r = p.rate / 100;
  return (1 - endFactor(p)) / (r * r) - (p.years * endFactor(p)) / r;
};

const presentValue = (p: Params) => p.start * levelPart(p) + p.growth * slopePart(p);

/** C115, difficulty 2: present value of the income stream a + bt over T years, by parts. */
export const presentValueGrowingStream: Generator<Params> = {
  id: 'present-value-growing-stream',
  title: 'Present value of a growing income stream',
  topicId: 'C115',
  difficulty: 2,
  timeSec: 180,

  params: (rng) => ({
    start: rng.int(1, 30) * 20,
    growth: rng.int(1, 20) * 5,
    rate: rng.int(2, 12),
    years: rng.int(3, 20),
  }),

  stem: (p) =>
    `A project brings in income continuously at the rate $f(t) = ${num(p.start)} + ${num(p.growth)}t$ thousand per year for $${num(p.years)}$ years. With continuous discounting at $${num(p.rate)}\\%$ a year, find its present value $\\int_0^{${num(p.years)}} (${num(p.start)} + ${num(p.growth)}t)\\,e^{-${num(p.rate / 100)}t}\\,dt$, in thousands. Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: round(presentValue(p), 2), decimals: 2, ...MONEY }),

  steps(p) {
    const r = num(p.rate / 100);
    const T = num(p.years);
    const E = endFactor(p);
    return [
      {
        text: 'Split the integral into a level part and a growing part.',
        latex: `PV = ${num(p.start)}\\int_0^{${T}} e^{-${r}t}\\,dt + ${num(p.growth)}\\int_0^{${T}} t\\,e^{-${r}t}\\,dt`,
        why: 'The integral of a sum is the sum of the integrals, and constant factors can be taken outside.',
      },
      {
        text: 'Discount the level part.',
        latex: `${num(p.start)}\\cdot\\dfrac{1 - e^{-${num((p.rate / 100) * p.years)}}}{${r}} = ${num(p.start)} \\times ${num(levelPart(p), 5)} = ${num(p.start * levelPart(p))}`,
        why: 'An antiderivative of e^(−rt) is −e^(−rt)/r; at t = T minus at t = 0 it gives (1 − e^(−rT))/r.',
        result: round(p.start * levelPart(p), 2),
      },
      {
        text: 'Integrate t·e^(−rt) by parts with u = t, dv = e^(−rt) dt.',
        latex: `\\int_0^{${T}} t\\,e^{-${r}t}\\,dt = \\Big[-\\dfrac{t\\,e^{-${r}t}}{${r}}\\Big]_0^{${T}} + \\dfrac{1}{${r}}\\int_0^{${T}} e^{-${r}t}\\,dt = -\\dfrac{${T}e^{-${num((p.rate / 100) * p.years)}}}{${r}} + \\dfrac{1 - e^{-${num((p.rate / 100) * p.years)}}}{${r}^2} = ${num(slopePart(p), 5)}`,
        why: `Choose u = t because its derivative is 1, which makes the new integral simpler; v = −e^(−rt)/r. The boundary term uv is ${num(-(p.years * E) / (p.rate / 100), 4).replace('-', '−')} and the remaining integral, divided by r a second time, adds ${num((1 - E) / (p.rate / 100) ** 2, 4)}.`,
        result: round(slopePart(p), 5),
      },
      {
        text: 'Add the two parts.',
        latex: `PV = ${num(p.start * levelPart(p))} + ${num(p.growth)} \\times ${num(slopePart(p), 5)} = ${num(round(presentValue(p), 2))}`,
        why: 'The present value of the whole stream is the value of the level income plus the value of its growth.',
        result: round(presentValue(p), 2),
      },
    ];
  },

  distractors(p) {
    const r = p.rate / 100;
    const T = p.years;
    const E = endFactor(p);
    const level = p.start * levelPart(p);
    return cleanDistractors(
      round(presentValue(p), 2),
      [
        {
          value: round(level + p.growth * (-(T * E) / r - (1 - E) / (r * r)), 2),
          mistakeCode: 'PARTS_SIGN',
        },
        { value: round(level + (p.growth * (1 - E)) / (r * r), 2), mistakeCode: 'FORGOT_BOUNDARY' },
        {
          value: round(level + p.growth * ((1 - E) / r - (T * E) / r), 2),
          mistakeCode: 'DIVIDED_BY_R_ONCE',
        },
        { value: round(p.start * T + (p.growth * T * T) / 2, 2), mistakeCode: 'NO_DISCOUNTING' },
      ],
      MONEY.tolerance,
      MONEY.relTolerance,
    );
  },
};

import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** The letter used as the base. */
  base: 'x' | 'y' | 'K' | 'L';
  a: number;
  b: number;
  /** May be negative: x^c with c < 0 is 1/x^|c|. */
  c: number;
  d: number;
}

const exponent = (p: Params) => p.a * p.b + p.c - p.d;

const candidates = (p: Params): Distractor[] => [
  { value: p.a + p.b + p.c - p.d, mistakeCode: 'POWER_ADDED' },
  { value: p.a * p.b * p.c - p.d, mistakeCode: 'PRODUCT_MULTIPLIED' },
  { value: round((p.a * p.b + p.c) / p.d, 2), mistakeCode: 'EXPONENTS_DIVIDED' },
  { value: p.d - p.a * p.b - p.c, mistakeCode: 'QUOTIENT_REVERSED' },
];

const SUPERSCRIPT = '⁰¹²³⁴⁵⁶⁷⁸⁹';
/** An integer as Unicode superscript for plain-text "why" lines: 12 → ¹², −3 → ⁻³. */
const sup = (n: number) =>
  `${n < 0 ? '⁻' : ''}${[...String(Math.abs(n))].map((ch) => SUPERSCRIPT[Number(ch)]).join('')}`;

/** "m + (−3)" written naturally: "6 - 3", "6 + 4". */
const plus = (m: number, c: number) => `${num(m)} ${c < 0 ? '-' : '+'} ${num(Math.abs(c))}`;

/** F01, difficulty 1: write (x^a)^b · x^c / x^d as a single power x^n and give n. */
export const exponentLawsSimplify: Generator<Params> = {
  id: 'exponent-laws-simplify',
  title: 'Simplify with exponent laws',
  topicId: 'F01',
  difficulty: 1,
  timeSec: 60,

  params(rng) {
    // Keep draws where at least three mistakes give different wrong answers. n = 0 is allowed
    // (x^0 = 1); then "subtracting the wrong way" gives 0 too and is dropped.
    for (;;) {
      const c = rng.int(-4, 6);
      if (c === 0 || c === 1) continue;
      const p: Params = {
        base: rng.pick(['x', 'y', 'K', 'L'] as const),
        a: rng.int(2, 5),
        b: rng.int(2, 4),
        c,
        d: rng.int(2, 15),
      };
      if (cleanDistractors(exponent(p), candidates(p)).length >= 3) return p;
    }
  },

  stem: (p) =>
    `Simplify $\\dfrac{(${p.base}^{${p.a}})^{${p.b}} \\cdot ${p.base}^{${num(p.c)}}}{${p.base}^{${p.d}}}$ and write it as a single power $${p.base}^n$. What is $n$?`,

  answer: (p) => ({ kind: 'numeric', value: exponent(p), decimals: 0 }),

  steps(p) {
    const v = p.base;
    const ab = p.a * p.b;
    const top = ab + p.c;
    const n = exponent(p);
    const tail = n < 0 ? ` = \\dfrac{1}{${v}^{${-n}}}` : n === 0 ? ' = 1' : '';
    return [
      {
        text: 'Power of a power: multiply the exponents.',
        latex: `(${v}^{${p.a}})^{${p.b}} = ${v}^{${p.a} \\cdot ${p.b}} = ${v}^{${ab}}`,
        why: `${p.b} copies of ${v}${sup(p.a)} multiplied together contain ${p.a} × ${p.b} = ${ab} factors of ${v}.`,
        result: ab,
      },
      {
        text: 'Multiply powers of the same base: add the exponents.',
        latex: `${v}^{${ab}} \\cdot ${v}^{${num(p.c)}} = ${v}^{${plus(ab, p.c)}} = ${v}^{${num(top)}}`,
        why: 'The factors of the base simply add up when powers are multiplied; the rule works for negative exponents too.',
        result: top,
      },
      {
        text: 'Divide powers of the same base: subtract the exponent of the denominator.',
        latex: `\\dfrac{${v}^{${num(top)}}}{${v}^{${p.d}}} = ${v}^{${num(top)} - ${p.d}} = ${v}^{${num(n)}}${tail}`,
        why: `Each factor of ${v} in the denominator cancels one in the numerator, so the exponent falls by ${p.d}.`,
        result: n,
      },
    ];
  },

  distractors: (p) => cleanDistractors(exponent(p), candidates(p)),
};

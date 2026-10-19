import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

/** One term c·K^(a/10)·L^(b/10); exponents in tenths. */
interface Term {
  c: number;
  a10: number;
  b10: number;
}

interface Params {
  /** 'product': Q = A·K^α·L^β; 'sum': two terms of the same degree added together. */
  form: 'product' | 'sum';
  /** The first term is the whole function in the 'product' form. */
  first: Term;
  /** Only used in the 'sum' form. */
  second: Term;
  /** All inputs are multiplied by this factor. */
  t: number;
  /** Output before scaling. */
  q0: number;
}

/** Degree of homogeneity k = α + β of the first term (the second has the same degree). */
const degree = (p: Params) => (p.first.a10 + p.first.b10) / 10;
const scaledOutput = (p: Params) => round(p.t ** degree(p) * p.q0, 2);

const power = (variable: string, tenths: number) => {
  if (tenths === 0) return '';
  if (tenths === 10) return variable;
  return `${variable}^{${num(tenths / 10)}}`;
};

/** "3K^{0.5}L^{0.5}", "2K", "K^{1.2}". */
export const termLatex = (term: Term) =>
  `${term.c === 1 ? '' : num(term.c)}${power('K', term.a10)}${power('L', term.b10)}`;

const formula = (p: Params) =>
  p.form === 'product' ? termLatex(p.first) : `${termLatex(p.first)} + ${termLatex(p.second)}`;

const candidates = (p: Params): Distractor[] => {
  const { t, q0, first } = p;
  const k = degree(p);
  const list: Distractor[] = [{ value: round(t * q0, 2), mistakeCode: 'CRS_ASSUMED' }];
  // Multiplying the exponents of the (first) Cobb–Douglas term instead of adding them.
  list.push({
    value: round(t ** ((first.a10 * first.b10) / 100) * q0, 2),
    mistakeCode: 'MULTIPLIED_EXPONENTS',
  });
  if (p.form === 'product') {
    list.push({ value: round(t ** (first.b10 / 10) * q0, 2), mistakeCode: 'ONE_INPUT_SCALED' });
  } else {
    list.push({ value: round(t ** (2 * k) * q0, 2), mistakeCode: 'ADDED_ALL_EXPONENTS' });
  }
  return list;
};

const wrongAnswers = (p: Params) => cleanDistractors(scaledOutput(p), candidates(p));

/** MV04, difficulty 1: output after every input is multiplied by t, for a homogeneous function. */
export const scaledInputsOutput: Generator<Params> = {
  id: 'scaled-inputs-output',
  title: 'Output after scaling all inputs',
  topicId: 'MV04',
  difficulty: 1,
  timeSec: 90,

  params(rng) {
    for (;;) {
      const form = rng.pick(['product', 'product', 'sum'] as const);
      const k10 = rng.int(5, 15);
      // The first term always has both inputs, so it is a genuine Cobb–Douglas term.
      const a1 = rng.int(1, k10 - 1);
      const first = { c: rng.int(1, 9), a10: a1, b10: k10 - a1 };
      const a2 = rng.int(0, k10);
      const second = { c: rng.int(1, 9), a10: a2, b10: k10 - a2 };
      if (form === 'product' && (first.a10 > 9 || first.b10 > 9)) continue;
      if (form === 'sum' && a2 === a1) continue;
      const p: Params = {
        form,
        first,
        second,
        t: rng.pick([2, 3, 4, 5]),
        q0: rng.int(10, 500) * 10,
      };
      if (wrongAnswers(p).length >= 2) return p;
    }
  },

  stem(p) {
    return `A firm's output is $Q = ${formula(p)}$, where $K$ is capital and $L$ is labour, and it currently produces $${num(p.q0)}$ units. If it multiplies both capital and labour by $${p.t}$, how many units will it produce? Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: scaledOutput(p), decimals: 2 }),

  steps(p) {
    const k = num(degree(p));
    const t = p.t;
    const check =
      p.form === 'product'
        ? `Q(tK, tL) = ${p.first.c === 1 ? '' : num(p.first.c)}(tK)^{${num(p.first.a10 / 10)}}(tL)^{${num(p.first.b10 / 10)}} = t^{${num(p.first.a10 / 10)} + ${num(p.first.b10 / 10)}}\\,Q(K, L) = t^{${k}}\\,Q(K, L)`
        : `\\text{each term has degree } ${num(p.first.a10 / 10)} + ${num(p.first.b10 / 10)} = ${num(p.second.a10 / 10)} + ${num(p.second.b10 / 10)} = ${k}, \\text{ so } Q(tK, tL) = t^{${k}}\\,Q(K, L)`;
    const factor = t ** degree(p);
    return [
      {
        text: 'Scale both inputs by t and pull t out of the function.',
        latex: check,
        why:
          p.form === 'product'
            ? 'Each input brings its own power of t, and powers of t multiply by adding their exponents: (tK)^α·(tL)^β = t^(α+β)·K^α·L^β.'
            : 'A sum is homogeneous when every term has the same degree; then the same power of t comes out of each term.',
      },
      {
        text: `Work out the scale factor for output, t = ${t}.`,
        latex: `${t}^{${k}} = ${num(factor, 4)}`,
        why: `The degree k = ${k} is ${degree(p) > 1 ? 'above 1, so output grows faster than the inputs (increasing returns to scale)' : degree(p) < 1 ? 'below 1, so output grows more slowly than the inputs (decreasing returns to scale)' : 'exactly 1, so output grows in proportion (constant returns to scale)'}.`,
        result: round(factor, 4),
      },
      {
        text: 'Multiply the current output by this factor.',
        latex: `${num(factor, 4)} \\times ${num(p.q0)} = ${num(scaledOutput(p))}`,
        why: 'Homogeneity means you do not need K and L themselves: the new output is the old output times t^k.',
        result: scaledOutput(p),
      },
    ];
  },

  distractors: wrongAnswers,
};

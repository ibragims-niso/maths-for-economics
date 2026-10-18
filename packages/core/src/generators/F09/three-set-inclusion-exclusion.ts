import type { Generator, Step } from '../../engine/types';
import { cleanDistractors, num } from '../format';

const CONTEXTS = {
  firms: {
    question: 'which kinds of finance they use',
    names: ['bank loans', 'leasing', 'trade credit'],
    verb: 'use',
  },
  households: {
    question: 'which financial products they hold',
    names: ['a savings account', 'a pension plan', 'life insurance'],
    verb: 'hold',
  },
  shoppers: {
    question: 'which of three supermarkets they visited last month',
    names: ['supermarket X', 'supermarket Y', 'supermarket Z'],
    verb: 'visited',
  },
  students: {
    question: 'which kinds of support they receive',
    names: ['a grant', 'a loan', 'money from family'],
    verb: 'receive',
  },
} as const;

type Context = keyof typeof CONTEXTS;

interface Params {
  total: number;
  /** |A|, |B|, |C|. */
  a: number;
  b: number;
  c: number;
  /** Pairwise intersections |A ∩ B|, |A ∩ C|, |B ∩ C|; each includes the triple overlap. */
  ab: number;
  ac: number;
  bc: number;
  /** |A ∩ B ∩ C|. */
  abc: number;
  ask: 'atLeastOne' | 'none';
  context: Context;
}

/** Counts are exact: no tolerance beyond input noise. */
const COUNT = { tolerance: 0.01, relTolerance: 0 } as const;

const single = (p: Params) => p.a + p.b + p.c;
const pairs = (p: Params) => p.ab + p.ac + p.bc;
const union = (p: Params) => single(p) - pairs(p) + p.abc;
const target = (p: Params) => (p.ask === 'none' ? p.total - union(p) : union(p));

/** F09, difficulty 3: inclusion–exclusion with three groups: how many in at least one, or in none. */
export const threeSetInclusionExclusion: Generator<Params> = {
  id: 'three-set-inclusion-exclusion',
  title: 'Counting three overlapping groups',
  topicId: 'F09',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const total = rng.int(20, 100) * 10;
      const pct = (x: number) => Math.round(x * total);
      const abc = rng.int(2, Math.max(3, pct(0.05)));
      const abOnly = rng.int(2, pct(0.1));
      const acOnly = rng.int(2, pct(0.1));
      const bcOnly = rng.int(2, pct(0.1));
      const aOnly = rng.int(pct(0.05), pct(0.2));
      const bOnly = rng.int(pct(0.05), pct(0.2));
      const cOnly = rng.int(pct(0.05), pct(0.2));
      const inside = abc + abOnly + acOnly + bcOnly + aOnly + bOnly + cOnly;
      if (total - inside < Math.max(5, pct(0.03))) continue;
      return {
        total,
        a: aOnly + abOnly + acOnly + abc,
        b: bOnly + abOnly + bcOnly + abc,
        c: cOnly + acOnly + bcOnly + abc,
        ab: abOnly + abc,
        ac: acOnly + abc,
        bc: bcOnly + abc,
        abc,
        ask: rng.pick(['atLeastOne', 'none'] as const),
        context: rng.pick(Object.keys(CONTEXTS) as Context[]),
      };
    }
  },

  stem(p) {
    const { question, names, verb } = CONTEXTS[p.context];
    const counts = `$|A| = ${num(p.a)}$, $|B| = ${num(p.b)}$, $|C| = ${num(p.c)}$, $|A \\cap B| = ${num(p.ab)}$, $|A \\cap C| = ${num(p.ac)}$, $|B \\cap C| = ${num(p.bc)}$ and $|A \\cap B \\cap C| = ${num(p.abc)}$`;
    const ask = p.ask === 'none' ? 'none of the three' : 'at least one of the three';
    return `A survey of $${num(p.total)}$ ${p.context} asks ${question}: ${names[0]} ($A$), ${names[1]} ($B$) and ${names[2]} ($C$). The counts are ${counts}. How many ${p.context} ${verb} ${ask}?`;
  },

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: 0, ...COUNT }),

  steps(p) {
    const u = union(p);
    const steps: Step[] = [
      {
        text: 'Add the three groups.',
        latex: `|A| + |B| + |C| = ${num(p.a)} + ${num(p.b)} + ${num(p.c)} = ${num(single(p))}`,
        why: 'This counts everyone in exactly two groups twice and everyone in all three groups three times.',
        result: single(p),
      },
      {
        text: 'Subtract the three pairwise overlaps.',
        latex: `${num(single(p))} - (${num(p.ab)} + ${num(p.ac)} + ${num(p.bc)}) = ${num(single(p) - pairs(p))}`,
        why: 'This removes the double counts, but those in all three groups sit in all three overlaps, so now they are not counted at all.',
        result: single(p) - pairs(p),
      },
      {
        text: 'Add back the triple overlap.',
        latex: `|A \\cup B \\cup C| = ${num(single(p) - pairs(p))} + ${num(p.abc)} = ${num(u)}`,
        why: 'Adding |A ∩ B ∩ C| once counts the people in all three groups exactly once again.',
        result: u,
      },
    ];
    if (p.ask === 'none') {
      steps.push({
        text: 'Subtract the union from the whole survey.',
        latex: `${num(p.total)} - ${num(u)} = ${num(p.total - u)}`,
        why: 'Those in none of the groups are the complement of A ∪ B ∪ C.',
        result: p.total - u,
      });
    }
    return steps;
  },

  distractors(p) {
    const u = union(p);
    const candidates =
      p.ask === 'none'
        ? [
            { value: u, mistakeCode: 'UNION_NOT_COMPLEMENT' },
            { value: p.total - (u - p.abc), mistakeCode: 'FORGOT_TRIPLE' },
            { value: p.total - (u - 2 * p.abc), mistakeCode: 'TRIPLE_SUBTRACTED' },
            { value: p.total - single(p), mistakeCode: 'FORGOT_OVERLAP' },
          ]
        : [
            { value: single(p), mistakeCode: 'FORGOT_OVERLAP' },
            { value: u - p.abc, mistakeCode: 'FORGOT_TRIPLE' },
            { value: u - 2 * p.abc, mistakeCode: 'TRIPLE_SUBTRACTED' },
          ];
    return cleanDistractors(
      target(p),
      candidates.filter((d) => d.value >= 0),
      COUNT.tolerance,
      COUNT.relTolerance,
    );
  },
};

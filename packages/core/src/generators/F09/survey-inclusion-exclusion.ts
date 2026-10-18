import type { Generator, Step } from '../../engine/types';
import { cleanDistractors, num } from '../format';

const CONTEXTS = {
  households: {
    a: 'have a savings account',
    b: 'have a credit card',
    both: 'have both',
    atLeast: 'have at least one of the two',
    neither: 'have neither',
    aShort: 'savings-account holders',
    bShort: 'credit-card holders',
  },
  firms: {
    a: 'export their goods',
    b: 'import materials',
    both: 'do both',
    atLeast: 'do at least one of the two',
    neither: 'do neither',
    aShort: 'exporters',
    bShort: 'importers',
  },
  students: {
    a: 'have a part-time job',
    b: 'receive a grant',
    both: 'have a job and a grant',
    atLeast: 'have at least one of the two',
    neither: 'have neither',
    aShort: 'students with a job',
    bShort: 'grant holders',
  },
  shoppers: {
    a: 'shop online',
    b: 'use a loyalty card',
    both: 'do both',
    atLeast: 'do at least one of the two',
    neither: 'do neither',
    aShort: 'online shoppers',
    bShort: 'loyalty-card users',
  },
  commuters: {
    a: 'use the bus',
    b: 'use the metro',
    both: 'use both',
    atLeast: 'use at least one of the two',
    neither: 'use neither',
    aShort: 'bus users',
    bShort: 'metro users',
  },
} as const;

type Context = keyof typeof CONTEXTS;

interface Params {
  /** Number of people (or firms) surveyed. */
  total: number;
  /** |A|, |B| and |A ∩ B|, built from the four Venn regions so they are consistent. */
  a: number;
  b: number;
  both: number;
  ask: 'atLeastOne' | 'neither';
  context: Context;
}

/** Counts are exact: no tolerance beyond input noise. */
const COUNT = { tolerance: 0.01, relTolerance: 0 } as const;

const union = (p: Params) => p.a + p.b - p.both;
const target = (p: Params) => (p.ask === 'neither' ? p.total - union(p) : union(p));

/** F09, difficulty 1: inclusion–exclusion with two groups: how many in at least one, or in neither. */
export const surveyInclusionExclusion: Generator<Params> = {
  id: 'survey-inclusion-exclusion',
  title: 'Counting two overlapping groups',
  topicId: 'F09',
  difficulty: 1,
  timeSec: 90,

  params(rng) {
    for (;;) {
      const total = rng.int(8, 100) * 10;
      const both = rng.int(Math.max(5, Math.round(0.05 * total)), Math.round(0.3 * total));
      const onlyA = rng.int(Math.round(0.1 * total), Math.round(0.45 * total));
      const onlyB = rng.int(Math.round(0.1 * total), Math.round(0.45 * total));
      const neither = total - both - onlyA - onlyB;
      if (neither < Math.max(5, Math.round(0.05 * total))) continue;
      return {
        total,
        a: onlyA + both,
        b: onlyB + both,
        both,
        ask: rng.pick(['atLeastOne', 'neither'] as const),
        context: rng.pick(Object.keys(CONTEXTS) as Context[]),
      };
    }
  },

  stem(p) {
    const c = CONTEXTS[p.context];
    return `In a survey of $${num(p.total)}$ ${p.context}, $${num(p.a)}$ ${c.a}, $${num(p.b)}$ ${c.b} and $${num(p.both)}$ ${c.both}. How many ${p.context} ${p.ask === 'neither' ? c.neither : c.atLeast}?`;
  },

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: 0, ...COUNT }),

  steps(p) {
    const c = CONTEXTS[p.context];
    const u = union(p);
    const steps: Step[] = [
      {
        text: `Write the survey in set notation, with A = ${c.aShort} and B = ${c.bShort}.`,
        latex: `|A| = ${num(p.a)},\\quad |B| = ${num(p.b)},\\quad |A \\cap B| = ${num(p.both)}`,
        why: 'The bars |·| mean "how many elements"; those who do both belong to the intersection A ∩ B.',
      },
      {
        text: 'Count those in at least one group with inclusion–exclusion.',
        latex: `|A \\cup B| = ${num(p.a)} + ${num(p.b)} - ${num(p.both)} = ${num(u)}`,
        why: 'Adding |A| and |B| counts everyone in both groups twice, so the overlap is subtracted once.',
        result: u,
      },
    ];
    if (p.ask === 'neither') {
      steps.push({
        text: 'Subtract the union from the whole survey.',
        latex: `${num(p.total)} - ${num(u)} = ${num(p.total - u)}`,
        why: 'Those in neither group are the complement of A ∪ B: everyone surveyed who is outside both circles.',
        result: p.total - u,
      });
    } else {
      steps.push({
        text: 'Check by adding the three regions inside the circles.',
        latex: `(${num(p.a)} - ${num(p.both)}) + (${num(p.b)} - ${num(p.both)}) + ${num(p.both)} = ${num(u)}`,
        why: 'Only A, only B and both are separate regions with nobody in common, so their counts simply add up.',
        result: u,
      });
    }
    return steps;
  },

  distractors(p) {
    const u = union(p);
    const candidates =
      p.ask === 'neither'
        ? [
            { value: u, mistakeCode: 'UNION_NOT_COMPLEMENT' },
            { value: p.total - (p.a + p.b), mistakeCode: 'FORGOT_OVERLAP' },
            { value: p.total - (p.a + p.b - 2 * p.both), mistakeCode: 'OVERLAP_TWICE' },
          ]
        : [
            { value: p.a + p.b, mistakeCode: 'FORGOT_OVERLAP' },
            { value: p.a + p.b - 2 * p.both, mistakeCode: 'OVERLAP_TWICE' },
          ];
    return cleanDistractors(
      target(p),
      candidates.filter((d) => d.value >= 0),
      COUNT.tolerance,
      COUNT.relTolerance,
    );
  },
};

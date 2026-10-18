import { type Block, blockOf, type MasteryState } from '@mfe/core';
import topicBank from '../../../content/topic-bank.json';
import contentIndex from './generated/content-index.json';

export const YEARS = [1, 2, 3, 4] as const;

/** Topics whose content is written and compiled (content/topics). Everything else is "Soon". */
export const READY = new Set(contentIndex.map((t) => t.id));

/** What a written topic's status says, by mastery (docs/02). */
export const STATUS_LABEL: Record<MasteryState, string> = {
  none: 'Open',
  learning: 'Learning',
  mastered: 'Mastered',
};

export const topicTitle = (id: string) => topicBank.find((t) => t.id === id)?.title ?? id;

/** One CC0 3D icon per block (public/icons3d, credited in About). */
const BLOCK_ICON: Record<Block, string> = {
  F: 'notebook',
  FM: 'money-bag',
  C1: 'chart',
  LA1: 'cube',
  ST1: 'zoom',
  MV: 'sphere',
  LA2: 'cube',
  ST2: 'zoom',
  OP: 'target',
  DY: 'clock',
  EM: 'lab',
  GT: 'chess',
  AN: 'puzzle',
  DO: 'rocket',
  SP: 'star',
  NM: 'calculator',
};

export const icon3d = (name: string) => `/icons3d/${name}.webp`;

export function topicIcon(id: string): string {
  const block = blockOf(id);
  return icon3d(block ? BLOCK_ICON[block] : 'notebook');
}

/** Topics of a year in Core order (the topic bank lists them in that order). */
export function topicsForYear(year: number) {
  return topicBank.filter((t) => t.coreYear === year);
}

/** Block names from docs/05-topic-bank.md, used as group headers in topic lists. */
export const BLOCK_NAMES: Record<Block, string> = {
  F: 'Foundations',
  FM: 'Financial mathematics',
  C1: 'Single-variable calculus',
  LA1: 'Linear algebra I',
  ST1: 'Probability and statistics I',
  MV: 'Multivariable calculus and optimisation',
  LA2: 'Linear algebra II',
  ST2: 'Probability and statistics II',
  OP: 'Optimisation II',
  DY: 'Dynamics',
  EM: 'Mathematics of econometrics',
  GT: 'Game theory mathematics',
  AN: 'Analysis for economists',
  DO: 'Dynamic optimisation',
  SP: 'Uncertainty and stochastic processes',
  NM: 'Numerical methods',
};

/** A year's topics grouped by block, in curriculum order, like transactions under a date. */
export function groupByBlock<T extends { id: string }>(topics: readonly T[]) {
  const groups: { block: Block; name: string; icon: string; topics: T[] }[] = [];
  for (const t of topics) {
    const block = blockOf(t.id);
    if (!block) continue;
    let group = groups.find((g) => g.block === block);
    if (!group) {
      group = { block, name: BLOCK_NAMES[block], icon: icon3d(BLOCK_ICON[block]), topics: [] };
      groups.push(group);
    }
    group.topics.push(t);
  }
  return groups;
}

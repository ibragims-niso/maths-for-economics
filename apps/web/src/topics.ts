import {
  type Block,
  blockOf,
  type MasteryState,
  rankTopics,
  type SearchEntry,
  searchStems,
} from '@mfe/core';
import { useEffect, useState } from 'react';
import topicBank from '../../../content/topic-bank.json';
import contentIndex from './generated/content-index.json';
import working from './generated/working.json';

export const YEARS = [1, 2, 3, 4] as const;

/** Topics whose content is written and compiled (content/topics). Everything else is "Soon". */
export const READY = new Set(contentIndex.map((t) => t.id));

/** Topics being written right now (content/working.json): "Writing" instead of "Soon". */
export const WRITING = new Set<string>(working);

/** What a written topic's status says, by mastery (docs/02). */
export const STATUS_LABEL: Record<MasteryState, string> = {
  none: 'Open',
  learning: 'Learning',
  mastered: 'Mastered',
};

export const bankTopic = (id: string) => topicBank.find((t) => t.id === id);

export const TOPIC_COUNT = topicBank.length;

export const topicTitle = (id: string) => bankTopic(id)?.title ?? id;

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

/** Before the full index loads: titles and economic uses only, from the bundled topic bank. */
const QUICK_INDEX: SearchEntry[] = topicBank.map((t) => ({
  id: t.id,
  title: searchStems(t.title).join(' '),
  near: searchStems(t.economicUse).join(' '),
  body: '',
}));
let fullIndex: SearchEntry[] | undefined;

/** The full search index (topic text and syllabus headings), loaded on the first search. */
export const loadSearchIndex = () =>
  import('./generated/search-index.json').then((m) => {
    fullIndex = m.default;
    return fullIndex;
  });

/**
 * Topics matching a query, best first (rankTopics in core): by ID, title, economic use, the
 * syllabus headings they sit under and their text. Works offline.
 */
export function searchTopics(query: string, pool: readonly string[] = topicBank.map((t) => t.id)) {
  const allowed = new Set(pool);
  const entries = (fullIndex ?? QUICK_INDEX).filter((e) => allowed.has(e.id));
  return rankTopics(query, entries).flatMap((id) => bankTopic(id) ?? []);
}

/** searchTopics for a component: starts loading the full index once something is typed. */
export function useTopicSearch(query: string, pool?: readonly string[]) {
  const [, setLoaded] = useState(fullIndex !== undefined);
  useEffect(() => {
    if (query.trim() && !fullIndex) loadSearchIndex().then(() => setLoaded(true));
  }, [query]);
  return searchTopics(query, pool);
}

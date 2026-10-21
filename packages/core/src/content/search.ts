/**
 * Topic search that forgives the way students type: syllabus headings ("Concept of a univariate
 * function, its definition and types"), plurals, typos at the end of a word and half-typed words.
 * The build turns each topic into word stems (searchStems); the app scores a query against them.
 */

/** Words that say nothing about the topic, including common syllabus filler. */
const STOP = new Set(
  (
    'a an and are as at be by for from how in into is it its of on or the their them this to ' +
    'what when which with concept concepts notion basic basics introduction intro main ' +
    'definition definitions defined define type types kind kinds property properties ' +
    'method methods application applications use uses using'
  ).split(' '),
);

/** Phrases that mean the same as one technical word, so either finds the topic. */
const SAME_AS: [RegExp, string][] = [
  [/\b(one|single) variable\b/, 'univariate'],
  [/\b(several|many|two|multiple) variables\b/, 'multivariate'],
];

/** A word's stem: lower case, no plural s, at most 6 letters ("functions", "functional" → "functi"). */
export function stem(word: string) {
  const w = word.toLowerCase();
  return (w.length > 3 && w.endsWith('s') ? w.slice(0, -1) : w).slice(0, 6);
}

/** The meaningful stems of a text, without maths, HTML or filler words. */
export function searchStems(text: string) {
  let plain = text
    .replace(/\$\$[\s\S]*?\$\$|\$[^$]*\$/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .toLowerCase();
  for (const [phrase, word] of SAME_AS) if (phrase.test(plain)) plain += ` ${word}`;
  const words = plain.match(/[a-zà-ÿ0-9]+/g) ?? [];
  return [...new Set(words.filter((w) => w.length > 1 && !STOP.has(w)).map(stem))];
}

/** A topic as the search sees it: stems by where they come from (stronger first). */
export interface SearchEntry {
  id: string;
  /** Title stems. */
  title: string;
  /** Economic use, and the course and section headings the topic sits under in any track. */
  near: string;
  /** Stems of the topic's text (Why, Intuition, Definitions). Empty until the topic is written. */
  body: string;
}

const WEIGHT = { title: 3, near: 2, body: 1 } as const;

/**
 * Topic IDs matching a query, best first. A topic must match at least half of the query's
 * meaningful words (all of them when there are one or two); an exact ID ("C107") always comes first. A query word matches any stem it
 * starts, so "elast" finds "elasticity" while it is being typed.
 */
export function rankTopics(query: string, entries: readonly SearchEntry[]) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const words = searchStems(q);
  const need = words.length <= 2 ? words.length : Math.ceil(words.length / 2);
  const scored = entries.map((e, order) => {
    if (e.id.toLowerCase() === q) return { id: e.id, score: Number.POSITIVE_INFINITY, order };
    let score = 0;
    let matched = 0;
    for (const w of words) {
      let best = 0;
      for (const field of ['title', 'near', 'body'] as const) {
        if (WEIGHT[field] > best && hasStem(e[field], w)) best = WEIGHT[field];
      }
      if (e.id.toLowerCase().startsWith(w)) best = Math.max(best, WEIGHT.title);
      if (best > 0) matched++;
      score += best;
    }
    return { id: e.id, score: matched >= need ? score : 0, order };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .map((s) => s.id);
}

const hasStem = (stems: string, w: string) => ` ${stems}`.includes(` ${w}`);

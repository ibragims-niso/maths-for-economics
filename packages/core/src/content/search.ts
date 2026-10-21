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
  /** Stems of the title and the topic's search terms. */
  title: string;
  /** Stems of the economic uses. */
  near: string;
  /** Stems of the topic's text and of the track headings it sits under. */
  body: string;
}

const WEIGHT = { title: 3, near: 2, body: 1 } as const;

/** Filler stems a misspelt query word may stand for ("consept" → "concept"). */
const STOP_STEMS = [...STOP].filter((w) => w.length >= 5).map(stem);

/** Edit distance, for one-letter typos. */
function distance(a: string, b: string) {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      const swap = (prev[j - 1] ?? 0) + (a[i - 1] === b[j - 1] ? 0 : 1);
      row[j] = Math.min((prev[j] ?? 0) + 1, (row[j - 1] ?? 0) + 1, swap);
    }
    prev = row;
  }
  return prev[b.length] ?? 0;
}

const vocabularies = new WeakMap<readonly SearchEntry[], string[]>();
function vocabulary(entries: readonly SearchEntry[]) {
  let words = vocabularies.get(entries);
  if (!words) {
    const all = entries.flatMap((e) => `${e.title} ${e.near} ${e.body}`.split(' '));
    words = [...new Set(all)].filter(Boolean);
    vocabularies.set(entries, words);
  }
  return words;
}

/**
 * What a query word can match: itself if some topic has a word starting with it, otherwise the
 * words one typo away. A misspelt filler word ("consept") or an unknown word matches nothing and
 * is left out.
 */
function spellings(w: string, entries: readonly SearchEntry[]) {
  const words = vocabulary(entries);
  if (words.some((s) => s.startsWith(w))) return [w];
  if (w.length < 4) return [];
  if (STOP_STEMS.some((s) => distance(w, s) <= 1)) return [];
  return words.filter((s) => distance(w, s.slice(0, w.length)) <= 1 || distance(w, s) <= 1);
}

/**
 * Topic IDs matching a query, best first. A query word matches any word it starts, so "elast"
 * finds "elasticity" while it is being typed, and one typo is forgiven. A topic must match at
 * least half of the query's words (all of them when there are one or two). Topics are found by
 * their title, search terms and economic uses; the topic text counts only when that finds
 * nothing, because common words ("quantity") appear in the text of most topics. Topics scoring
 * under half of the best are left out. An exact ID ("C107") finds just that topic. `among`
 * limits the results (the whole index still decides which words exist).
 */
export function rankTopics(
  query: string,
  entries: readonly SearchEntry[],
  among?: ReadonlySet<string>,
) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const exact = entries.find((e) => e.id.toLowerCase() === q);
  if (exact) return among && !among.has(exact.id) ? [] : [exact.id];
  const words = searchStems(q)
    .map((w) => ({ w, forms: spellings(w, entries) }))
    .filter((x) => x.forms.length > 0);
  if (words.length === 0) return [];
  const need = words.length <= 2 ? words.length : Math.ceil(words.length / 2);
  const pool = among ? entries.filter((e) => among.has(e.id)) : entries;
  const scored = pool.map((e, order) => {
    let score = 0;
    let strong = 0;
    let matched = 0;
    for (const { w, forms } of words) {
      let best = e.id.toLowerCase().startsWith(w) ? WEIGHT.title : 0;
      for (const field of ['title', 'near', 'body'] as const) {
        if (WEIGHT[field] > best && forms.some((f) => hasStem(e[field], f))) best = WEIGHT[field];
      }
      if (best > WEIGHT.body) strong++;
      if (best > 0) matched++;
      score += best;
    }
    return { id: e.id, score, order, strong: strong >= need, found: matched >= need };
  });
  const byName = scored.filter((s) => s.strong);
  const found = byName.length > 0 ? byName : scored.filter((s) => s.found);
  const top = Math.max(0, ...found.map((s) => s.score));
  return found
    .filter((s) => s.score >= top / 2)
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .map((s) => s.id);
}

const hasStem = (stems: string, w: string) => ` ${stems}`.includes(` ${w}`);

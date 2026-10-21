/**
 * npm run build:content
 *
 * Compiles content/topics/*.md into apps/web/src/generated/topics/<ID>.json for the app (one file
 * per topic, so the app loads and caches topics one by one): frontmatter
 * as data, each section as HTML with maths rendered by KaTeX at build time (so the phone does no
 * maths parsing and everything works offline). Worked examples are split into steps and "Why" lines.
 * verify blocks are dropped; they are for CI only.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  type CompiledContent,
  type CompiledExample,
  type CompiledTopic,
  parseTopicFile,
  type SearchEntry,
  searchStems,
  symbolsSchema,
  type TopicContext,
  topicFrontmatterSchema,
} from '@mfe/core';
import type { Nodes, Paragraph, PhrasingContent, Root, RootContent } from 'mdast';
import { toString as mdToString } from 'mdast-util-to-string';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import remarkDirective from 'remark-directive';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { parse as parseYaml } from 'yaml';
import { readText, repoRoot } from './lib/report';

const parser = unified().use(remarkParse).use(remarkMath).use(remarkDirective);
const toHtml = unified()
  .use(remarkRehype)
  .use(rehypeKatex, { output: 'htmlAndMathml', strict: 'ignore' })
  .use(rehypeStringify);

/** ::widget{id="x"} becomes <div data-widget="x"></div>; verify code blocks disappear. */
// ---- Terms: tappable words with a plain definition (content/glossary.yml) ----

const GLOSSARY = parseYaml(readText(join(repoRoot, 'content/glossary.yml'))) as Record<
  string,
  string
>;
/** Short single words such as "set" or "range" are often ordinary English; authors mark them. */
const TOO_COMMON = new Set(['series', 'principal', 'domain', 'vertex', 'median', 'exponent']);
const AUTO_TERMS = Object.keys(GLOSSARY).filter(
  (t) => (t.includes(' ') || t.length > 5) && !TOO_COMMON.has(t.toLowerCase()),
);
const escapeRegex = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const TERM_PATTERN = new RegExp(
  `\\b(${[...AUTO_TERMS]
    .sort((a, b) => b.length - a.length)
    .map(escapeRegex)
    .join('|')})(?:s|es)?\\b`,
  'gi',
);
const canonicalTerm = (text: string) =>
  Object.keys(GLOSSARY).find((k) => k.toLowerCase() === text.toLowerCase());

function termNode(key: string, text: string): PhrasingContent {
  return {
    type: 'emphasis',
    data: { hName: 'button', hProperties: { type: 'button', className: ['term'], dataTerm: key } },
    children: [{ type: 'text', value: text }],
  };
}

/**
 * Turns the first mention of each glossary term in a section into a tappable term (owner's
 * request), and every `:term[text]{id="glossary term"}` an author wrote. Maths, links and
 * headings are left alone.
 */
function markTerms(nodes: RootContent[]): RootContent[] {
  const used = new Set<string>();
  const walk = (node: Nodes) => {
    if (node.type === 'link' || node.type === 'heading' || node.type === 'code') return;
    if (!('children' in node)) return;
    const children: Nodes[] = [];
    for (const child of node.children as Nodes[]) {
      if (child.type === 'textDirective' && child.name === 'term') {
        const text = mdToString(child);
        const key = canonicalTerm(child.attributes?.id ?? text);
        if (key) used.add(key);
        children.push(key ? termNode(key, text) : { type: 'text', value: text });
        continue;
      }
      if (child.type !== 'text') {
        walk(child);
        children.push(child);
        continue;
      }
      let rest = child.value;
      for (const m of child.value.matchAll(TERM_PATTERN)) {
        const key = canonicalTerm(m[1] ?? '');
        if (!key || used.has(key)) continue;
        used.add(key);
        const at = rest.indexOf(m[0]);
        if (at > 0) children.push({ type: 'text', value: rest.slice(0, at) });
        children.push(termNode(key, m[0]));
        rest = rest.slice(at + m[0].length);
      }
      if (rest) children.push({ type: 'text', value: rest });
    }
    (node as { children: Nodes[] }).children = children;
  };
  for (const node of nodes) walk(node);
  return nodes;
}

function prepare(nodes: RootContent[]): RootContent[] {
  const out: RootContent[] = [];
  for (const node of nodes) {
    if (node.type === 'code' && node.lang === 'verify') continue;
    if (node.type === 'leafDirective' && node.name === 'widget') {
      const id = node.attributes?.id ?? '';
      node.data = { hName: 'div', hProperties: { 'data-widget': id } };
    }
    out.push(node);
  }
  return out;
}

function html(nodes: RootContent[]): string {
  const root: Root = { type: 'root', children: prepare(nodes) };
  return String(toHtml.stringify(toHtml.runSync(root))).trim();
}

const phrasingHtml = (children: PhrasingContent[]) =>
  html(children.length ? [{ type: 'paragraph', children } satisfies Paragraph] : []);

/** Splits "maths *Why:* reason" paragraphs of a numbered list into steps. */
function parseExample(title: string, nodes: RootContent[]): CompiledExample {
  const listIndex = nodes.findIndex((n) => n.type === 'list' && n.ordered);
  const statement = html(markTerms(listIndex === -1 ? nodes : nodes.slice(0, listIndex)));
  const list = nodes[listIndex];
  const steps =
    list?.type === 'list'
      ? list.children.map((item) => {
          const para = item.children.find((c) => c.type === 'paragraph');
          const children = para?.type === 'paragraph' ? para.children : [];
          const at = children.findIndex(
            (c) => c.type === 'emphasis' && mdToString(c).trim().replace(/:$/, '') === 'Why',
          );
          const body = at === -1 ? children : children.slice(0, at);
          const why = at === -1 ? [] : children.slice(at + 1);
          return {
            html: phrasingHtml(trimBreaks(body)),
            why: mdToString({ type: 'paragraph', children: why }).trim(),
          };
        })
      : [];
  return { title, statement, steps };
}

/** Drops the line break between a step and its "Why" line. */
function trimBreaks(children: PhrasingContent[]): PhrasingContent[] {
  const copy = [...children];
  const last = copy[copy.length - 1];
  if (last?.type === 'text') copy[copy.length - 1] = { ...last, value: last.value.trimEnd() };
  return copy;
}

/**
 * Authors tag each common mistake with its code, e.g. "Dropping the minus sign (SIGN).", so the
 * prose stays linked to the generators. Students never see the codes, so they are removed here.
 */
function hideMistakeCodes(nodes: RootContent[], codes: ReadonlySet<string>): RootContent[] {
  const walk = (node: Nodes) => {
    if (node.type === 'text') {
      node.value = node.value.replace(/\s*\(([A-Z][A-Z0-9_]*)\)/g, (match, code: string) =>
        codes.has(code) ? '' : match,
      );
    }
    if ('children' in node) for (const child of node.children) walk(child);
  };
  for (const node of nodes) walk(node);
  return nodes;
}

/** A section's Markdown as the author wrote it, without widgets: what the AI tutor reads. */
function markdownOf(body: string, nodes: RootContent[]): string {
  const first = nodes[0]?.position?.start.offset;
  const last = nodes.at(-1)?.position?.end.offset;
  if (first === undefined || last === undefined) return '';
  return body
    .slice(first, last)
    .replace(/^::widget\{[^}]*\}\s*$/gm, '')
    .trim();
}

/** A worked example as Markdown for the AI tutor: statement and steps, without verify blocks. */
function exampleMarkdown(body: string, title: string, nodes: RootContent[]) {
  const listIndex = nodes.findIndex((n) => n.type === 'list' && n.ordered);
  const list = nodes[listIndex];
  const before = (listIndex === -1 ? nodes : nodes.slice(0, listIndex)).filter(
    (n) => n.type !== 'code',
  );
  return {
    title,
    statement: markdownOf(body, before),
    steps: list?.type === 'list' ? list.children.map((item) => markdownOf(body, [item])) : [],
  };
}

function compileTopic(path: string): { topic: CompiledTopic; ai: TopicContext } {
  const source = readText(path);
  const { outline } = parseTopicFile(source, path);
  if (!outline) throw new Error(`${path}: cannot parse (run validate:content)`);
  const fm = topicFrontmatterSchema.parse(outline.frontmatter);

  const body = source.replace(/\r\n?/g, '\n').replace(/^---\n[\s\S]*?\n---\n/, '');
  const tree = parser.parse(body);
  const sections = new Map<string, RootContent[]>();
  let current: RootContent[] | undefined;
  for (const node of tree.children) {
    if (node.type === 'heading' && node.depth === 2) {
      current = [];
      sections.set(mdToString(node), current);
    } else {
      current?.push(node);
    }
  }
  const section = (name: string) => sections.get(name) ?? [];

  const examples: CompiledExample[] = [];
  const tutorExamples: TopicContext['examples'] = [];
  let exampleTitle: string | undefined;
  let exampleNodes: RootContent[] = [];
  for (const node of section('Worked examples')) {
    if (node.type === 'heading' && node.depth === 3) {
      if (exampleTitle) {
        examples.push(parseExample(exampleTitle, exampleNodes));
        tutorExamples.push(exampleMarkdown(body, exampleTitle, exampleNodes));
      }
      exampleTitle = mdToString(node);
      exampleNodes = [];
    } else {
      exampleNodes.push(node);
    }
  }
  if (exampleTitle) {
    examples.push(parseExample(exampleTitle, exampleNodes));
    tutorExamples.push(exampleMarkdown(body, exampleTitle, exampleNodes));
  }

  // Read the Markdown before html() runs: hideMistakeCodes edits the tree in place.
  const ai: TopicContext = {
    id: fm.id,
    title: fm.title,
    summary: [section('Why economists need this'), section('Intuition')]
      .map((nodes) => markdownOf(body, nodes))
      .join('\n\n'),
    definitions: markdownOf(body, section('Definition and formulas')),
    economicUses: fm.economicUses,
    resources: fm.resources.map((r) => ({ title: r.title, url: r.url, kind: r.kind })),
    mistakeCodes: fm.mistakeCodes,
    examples: tutorExamples,
  };

  const topic: CompiledTopic = {
    ...fm,
    sections: {
      why: html(markTerms(section('Why economists need this'))),
      intuition: html(markTerms(section('Intuition'))),
      definitions: html(markTerms(section('Definition and formulas'))),
      interactive: html(section('Interactive')),
      examples,
      mistakes: html(
        hideMistakeCodes(section('Common mistakes'), new Set(Object.keys(fm.mistakeCodes))),
      ),
      practice: html(section('Practice')),
      realWorld: html(markTerms(section('Real world'))),
    },
    tutor: { summary: ai.summary, definitions: ai.definitions, examples: ai.examples },
  };
  return { topic, ai };
}

type CourseHeadings = {
  title: string;
  topics?: string[];
  supporting?: string[];
  sections?: { title: string; topics: string[] }[];
};

const topicsDir = join(repoRoot, 'content/topics');
const compiled = readdirSync(topicsDir)
  .filter((f) => f.endsWith('.md'))
  .map((f) => compileTopic(join(topicsDir, f)));
const topics = compiled.map((c) => c.topic);

// The version is a fingerprint of the content, so the AI cache and error reports follow edits.
const version = createHash('sha256').update(JSON.stringify(topics)).digest('hex').slice(0, 12);
const content: CompiledContent = { version, topics };
const outDir = join(repoRoot, 'apps/web/src/generated');
mkdirSync(outDir, { recursive: true });
// One file per topic: a topic loads only when opened, and an edit re-downloads only that topic.
const topicsOut = join(outDir, 'topics');
rmSync(join(outDir, 'content.json'), { force: true });
mkdirSync(topicsOut, { recursive: true });
// Remove files of topics that no longer exist, but keep the folder: on Windows another program
// (a dev server, an open terminal) may hold it open.
const keep = new Set(content.topics.map((t) => `${t.id}.json`));
for (const file of readdirSync(topicsOut)) {
  if (!keep.has(file)) rmSync(join(topicsOut, file), { force: true });
}
for (const topic of content.topics) {
  writeFileSync(join(topicsOut, `${topic.id}.json`), JSON.stringify(topic));
}
writeFileSync(join(outDir, 'meta.json'), JSON.stringify({ version: content.version }));
// Help → Terms and the tappable terms in topics, from content/glossary.yml.
writeFileSync(join(outDir, 'glossary.json'), JSON.stringify(GLOSSARY));
// Help → Symbols, from content/symbols.yml.
writeFileSync(
  join(outDir, 'symbols.json'),
  JSON.stringify(symbolsSchema.parse(parseYaml(readText(join(repoRoot, 'content/symbols.yml'))))),
);
// Mistake labels and explanations for results, Progress and the mentor page, without topic text.
writeFileSync(
  join(outDir, 'mistakes.json'),
  JSON.stringify(Object.fromEntries(content.topics.map((t) => [t.id, t.mistakeCodes]))),
);
// A small index so the home screen knows which topics can open, without loading all content.
writeFileSync(
  join(outDir, 'content-index.json'),
  JSON.stringify(topics.map((t) => ({ id: t.id, status: t.status, estMinutes: t.estMinutes }))),
);
// Word stems for topic search (Learn, Practice): titles and search terms, economic uses, and then
// the topic's own text with the course and section headings it sits under in any track. Headings
// are weak: a whole section shares them.
const headings = new Map<string, string[]>();
for (const file of readdirSync(join(repoRoot, 'content/tracks'))) {
  const track = JSON.parse(readText(join(repoRoot, 'content/tracks', file))) as {
    years: { courses: CourseHeadings[] }[];
  };
  for (const course of track.years.flatMap((y) => y.courses)) {
    const groups = [
      { title: course.title, topics: [...(course.topics ?? []), ...(course.supporting ?? [])] },
      ...(course.sections ?? []).map((s) => ({
        title: `${course.title} ${s.title}`,
        topics: s.topics,
      })),
    ];
    for (const g of groups)
      for (const id of g.topics) headings.set(id, [...(headings.get(id) ?? []), g.title]);
  }
}
const written = new Map(compiled.map((c) => [c.topic.id, c.topic]));
const bank = JSON.parse(readText(join(repoRoot, 'content/topic-bank.json'))) as {
  id: string;
  title: string;
  economicUse: string;
}[];
const searchIndex: SearchEntry[] = bank.map((b) => {
  const topic = written.get(b.id);
  const title = [b.title, ...(topic?.searchTerms ?? [])];
  const near = [b.economicUse, ...(topic?.economicUses ?? [])];
  const body = [
    ...(headings.get(b.id) ?? []),
    ...(topic ? [topic.tutor.summary, topic.tutor.definitions] : []),
  ];
  return {
    id: b.id,
    title: searchStems(title.join(' ')).join(' '),
    near: searchStems(near.join(' ')).join(' '),
    body: searchStems(body.join(' ')).join(' '),
  };
});
writeFileSync(join(outDir, 'search-index.json'), JSON.stringify(searchIndex));
// Topics the content session is writing now (content/working.json, owned by that session).
// The app labels them "Writing" instead of "Soon"; a compiled topic is simply available.
const workingPath = join(repoRoot, 'content/working.json');
const working = existsSync(workingPath)
  ? ((JSON.parse(readText(workingPath)) as { topics?: string[] }).topics ?? [])
  : [];
writeFileSync(join(outDir, 'working.json'), JSON.stringify(working));
// The tutor's reading material for the API (apps/proxy), from the same files and version.
const proxyDir = join(repoRoot, 'apps/proxy/src/generated');
mkdirSync(proxyDir, { recursive: true });
writeFileSync(
  join(proxyDir, 'ai-topics.json'),
  JSON.stringify({ version, topics: compiled.map((c) => c.ai) }),
);
console.log(`Compiled ${topics.length} topics into apps/web/src/generated/topics/`);

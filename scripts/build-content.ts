/**
 * npm run build:content
 *
 * Compiles content/topics/*.md into apps/web/src/generated/content.json for the app: frontmatter
 * as data, each section as HTML with maths rendered by KaTeX at build time (so the phone does no
 * maths parsing and everything works offline). Worked examples are split into steps and "Why" lines.
 * verify blocks are dropped; they are for CI only.
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  type CompiledContent,
  type CompiledExample,
  type CompiledTopic,
  parseTopicFile,
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
import { readText, repoRoot } from './lib/report';

const parser = unified().use(remarkParse).use(remarkMath).use(remarkDirective);
const toHtml = unified()
  .use(remarkRehype)
  .use(rehypeKatex, { output: 'htmlAndMathml', strict: 'ignore' })
  .use(rehypeStringify);

/** ::widget{id="x"} becomes <div data-widget="x"></div>; verify code blocks disappear. */
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
  const statement = html(listIndex === -1 ? nodes : nodes.slice(0, listIndex));
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
  let exampleTitle: string | undefined;
  let exampleNodes: RootContent[] = [];
  for (const node of section('Worked examples')) {
    if (node.type === 'heading' && node.depth === 3) {
      if (exampleTitle) examples.push(parseExample(exampleTitle, exampleNodes));
      exampleTitle = mdToString(node);
      exampleNodes = [];
    } else {
      exampleNodes.push(node);
    }
  }
  if (exampleTitle) examples.push(parseExample(exampleTitle, exampleNodes));

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
  };

  const topic: CompiledTopic = {
    ...fm,
    sections: {
      why: html(section('Why economists need this')),
      intuition: html(section('Intuition')),
      definitions: html(section('Definition and formulas')),
      interactive: html(section('Interactive')),
      examples,
      mistakes: html(
        hideMistakeCodes(section('Common mistakes'), new Set(Object.keys(fm.mistakeCodes))),
      ),
      practice: html(section('Practice')),
      realWorld: html(section('Real world')),
    },
    tutor: { summary: ai.summary, definitions: ai.definitions },
  };
  return { topic, ai };
}

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
writeFileSync(join(outDir, 'content.json'), JSON.stringify(content));
// A small index so the home screen knows which topics can open, without loading all content.
writeFileSync(
  join(outDir, 'content-index.json'),
  JSON.stringify(topics.map((t) => ({ id: t.id, status: t.status, estMinutes: t.estMinutes }))),
);
// The tutor's reading material for the API (apps/proxy), from the same files and version.
const proxyDir = join(repoRoot, 'apps/proxy/src/generated');
mkdirSync(proxyDir, { recursive: true });
writeFileSync(
  join(proxyDir, 'ai-topics.json'),
  JSON.stringify({ version, topics: compiled.map((c) => c.ai) }),
);
console.log(`Compiled ${topics.length} topics into apps/web/src/generated/content.json`);

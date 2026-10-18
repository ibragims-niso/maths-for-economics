/**
 * npm run build:content
 *
 * Compiles content/topics/*.md into apps/web/src/generated/content.json for the app: frontmatter
 * as data, each section as HTML with maths rendered by KaTeX at build time (so the phone does no
 * maths parsing and everything works offline). Worked examples are split into steps and "Why" lines.
 * verify blocks are dropped; they are for CI only.
 */
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  type CompiledContent,
  type CompiledExample,
  type CompiledTopic,
  parseTopicFile,
  topicFrontmatterSchema,
} from '@mfe/core';
import type { Paragraph, PhrasingContent, Root, RootContent } from 'mdast';
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

function compileTopic(path: string): CompiledTopic {
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

  return {
    ...fm,
    sections: {
      why: html(section('Why economists need this')),
      intuition: html(section('Intuition')),
      definitions: html(section('Definition and formulas')),
      interactive: html(section('Interactive')),
      examples,
      mistakes: html(section('Common mistakes')),
      practice: html(section('Practice')),
      realWorld: html(section('Real world')),
    },
  };
}

const topicsDir = join(repoRoot, 'content/topics');
const topics = readdirSync(topicsDir)
  .filter((f) => f.endsWith('.md'))
  .map((f) => compileTopic(join(topicsDir, f)));

const content: CompiledContent = { version: new Date().toISOString().slice(0, 10), topics };
const outDir = join(repoRoot, 'apps/web/src/generated');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'content.json'), JSON.stringify(content));
console.log(`Compiled ${topics.length} topics into apps/web/src/generated/content.json`);

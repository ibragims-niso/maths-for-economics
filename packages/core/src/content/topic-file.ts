import { parse as parseYaml } from 'yaml';
import { blockOf } from './ids';
import { error, type Issue, warning, zodIssues } from './issues';
import { type TopicBankEntry, topicFrontmatterSchema } from './schemas';
import { runVerifyBlock } from './verify';

/** Level-2 headings every topic file has, in this order (docs/04-content-model.md). */
export const TOPIC_SECTIONS = [
  'Why economists need this',
  'Intuition',
  'Definition and formulas',
  'Interactive',
  'Worked examples',
  'Common mistakes',
  'Practice',
  'Real world',
] as const;

export const WORKED_EXAMPLES_PER_TOPIC = 3;

export interface VerifyBlockSource {
  /** Line number of the block's first code line. */
  line: number;
  code: string;
}

export interface TopicFileOutline {
  frontmatter: unknown;
  /** Level-2 headings with the text below them (code fences excluded). */
  sections: { title: string; line: number; text: string }[];
  /** Level-3 headings inside "Worked examples", with their verify blocks. */
  examples: { title: string; line: number; verifyBlocks: VerifyBlockSource[] }[];
  verifyBlocks: VerifyBlockSource[];
}

/** Splits a topic file into frontmatter, sections, worked examples and verify blocks. */
export function parseTopicFile(
  source: string,
  where: string,
): { outline: TopicFileOutline | null; issues: Issue[] } {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const end = lines[0] === '---' ? lines.indexOf('---', 1) : -1;
  if (end === -1) {
    return {
      outline: null,
      issues: [error(where, 'File must start with a frontmatter block between two "---" lines')],
    };
  }

  let frontmatter: unknown;
  try {
    frontmatter = parseYaml(lines.slice(1, end).join('\n'));
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { outline: null, issues: [error(where, `Frontmatter is not valid YAML: ${message}`)] };
  }

  const outline: TopicFileOutline = { frontmatter, sections: [], examples: [], verifyBlocks: [] };
  const issues: Issue[] = [];
  let section: TopicFileOutline['sections'][number] | undefined;
  let example: TopicFileOutline['examples'][number] | undefined;
  let fence: { close: RegExp; info: string; start: number; code: string[] } | undefined;

  for (let i = end + 1; i < lines.length; i++) {
    const text = lines[i] ?? '';
    const lineNo = i + 1;

    if (fence) {
      if (fence.close.test(text)) {
        if (fence.info === 'verify') {
          const block = { line: fence.start + 1, code: fence.code.join('\n') };
          outline.verifyBlocks.push(block);
          example?.verifyBlocks.push(block);
        }
        fence = undefined;
      } else {
        fence.code.push(text);
      }
      continue;
    }

    const open = /^(`{3,})\s*([\w-]*)/.exec(text);
    if (open?.[1]) {
      fence = {
        close: new RegExp(`^\\s*\`{${open[1].length},}\\s*$`),
        info: open[2] ?? '',
        start: lineNo,
        code: [],
      };
      continue;
    }

    const heading = /^(#{2,3})\s+(.+?)\s*$/.exec(text);
    if (heading?.[1] === '##' && heading[2]) {
      section = { title: heading[2], line: lineNo, text: '' };
      outline.sections.push(section);
      example = undefined;
      continue;
    }
    if (heading?.[1] === '###' && heading[2] && section?.title === 'Worked examples') {
      example = { title: heading[2], line: lineNo, verifyBlocks: [] };
      outline.examples.push(example);
    }
    if (section) section.text += `${text}\n`;
  }

  if (fence) issues.push(error(`${where}:${fence.start}`, 'Code block is never closed'));
  return { outline, issues };
}

const unique = <T>(xs: Iterable<T>) => [...new Set(xs)];
const matches = (text: string, re: RegExp) => unique([...text.matchAll(re)].map((m) => m[1] ?? ''));

/**
 * Validates one topic file: frontmatter schema, agreement with the topic bank, section order,
 * worked examples, references to widgets/generators/mistake codes, and runs every verify block.
 *
 * @param path repo-relative path, e.g. "content/topics/C107-elasticity.md"
 */
export function checkTopicFile(
  path: string,
  source: string,
  bank: readonly TopicBankEntry[],
): Issue[] {
  const { outline, issues } = parseTopicFile(source, path);
  if (!outline) return issues;

  // Verify blocks run even if the frontmatter is broken: maths errors matter most.
  for (const block of outline.verifyBlocks) {
    for (const f of runVerifyBlock(block.code, block.line)) {
      issues.push(error(`${path}:${f.line}`, `verify failed: ${f.statement} (${f.message})`));
    }
  }

  const titles = outline.sections.map((s) => s.title);
  if (titles.join('|') !== TOPIC_SECTIONS.join('|')) {
    issues.push(
      error(
        path,
        `Sections must be, in order: ${TOPIC_SECTIONS.join('; ')}. Found: ${titles.join('; ') || 'none'}`,
      ),
    );
  }

  if (outline.examples.length !== WORKED_EXAMPLES_PER_TOPIC) {
    issues.push(
      error(
        path,
        `"Worked examples" needs exactly ${WORKED_EXAMPLES_PER_TOPIC} examples (### headings), found ${outline.examples.length}`,
      ),
    );
  }
  for (const ex of outline.examples) {
    if (ex.verifyBlocks.length === 0) {
      issues.push(error(`${path}:${ex.line}`, `Example "${ex.title}" has no verify block`));
    }
  }

  const parsed = topicFrontmatterSchema.safeParse(outline.frontmatter);
  if (!parsed.success) return [...issues, ...zodIssues(path, parsed.error)];
  const fm = parsed.data;

  const fileName = path.split('/').pop() ?? path;
  if (!new RegExp(`^${fm.id}-[a-z0-9]+(?:-[a-z0-9]+)*\\.md$`).test(fileName)) {
    issues.push(
      error(path, `File name must be "${fm.id}-<slug>.md", e.g. "${fm.id}-elasticity.md"`),
    );
  }
  if (fm.block !== blockOf(fm.id)) {
    issues.push(
      error(path, `block is ${fm.block}, but ${fm.id} belongs to block ${blockOf(fm.id)}`),
    );
  }

  const entry = bank.find((t) => t.id === fm.id);
  if (!entry) {
    issues.push(error(path, `${fm.id} is not in the topic bank`));
  } else {
    if (fm.title !== entry.title) {
      issues.push(warning(path, `title "${fm.title}" differs from topic bank "${entry.title}"`));
    }
    if (fm.coreYear !== entry.coreYear) {
      issues.push(error(path, `coreYear is ${fm.coreYear}, topic bank says ${entry.coreYear}`));
    }
    const same =
      fm.prerequisites.length === entry.prerequisites.length &&
      fm.prerequisites.every((p) => entry.prerequisites.includes(p));
    if (!same) {
      issues.push(
        error(
          path,
          `prerequisites [${fm.prerequisites.join(', ')}] differ from topic bank [${entry.prerequisites.join(', ')}]`,
        ),
      );
    }
  }

  const sectionText = (title: string) =>
    outline.sections.find((s) => s.title === title)?.text ?? '';
  const body = outline.sections.map((s) => s.text).join('\n');

  const widgetsUsed = matches(body, /::widget\{id="([^"]+)"\}/g);
  for (const w of widgetsUsed) {
    if (!fm.widgets.includes(w)) issues.push(error(path, `Widget "${w}" is not listed in widgets`));
  }
  for (const w of fm.widgets) {
    if (!widgetsUsed.includes(w)) issues.push(warning(path, `Widget "${w}" is never shown`));
  }

  const generatorsNamed = matches(sectionText('Practice'), /`([a-z0-9]+(?:-[a-z0-9]+)*)`/g);
  for (const g of generatorsNamed) {
    if (!fm.generators.includes(g)) {
      issues.push(
        error(path, `Practice names generator "${g}", which is not listed in generators`),
      );
    }
  }
  for (const g of fm.generators) {
    if (!generatorsNamed.includes(g)) {
      issues.push(warning(path, `Generator "${g}" is not described under Practice`));
    }
  }

  // Codes are written like "(SIGN)" in Common mistakes; ignore anything inside $...$ maths.
  const mistakesText = sectionText('Common mistakes').replace(/\$[^$]*\$/g, '');
  for (const code of matches(mistakesText, /\(([A-Z][A-Z0-9_]+)\)/g)) {
    if (!(code in fm.mistakeCodes)) {
      issues.push(error(path, `Common mistakes refers to ${code}, which is not in mistakeCodes`));
    }
  }

  return issues;
}

import { describe, expect, it } from 'vitest';
import type { TopicBankEntry } from './schemas';
import { checkTopicFile, parseTopicFile } from './topic-file';

const bank: TopicBankEntry[] = [
  { id: 'C106', title: 'Marginal analysis', coreYear: 1, prerequisites: [], economicUse: 'x' },
  { id: 'C107', title: 'Elasticity', coreYear: 1, prerequisites: ['C106'], economicUse: 'x' },
];

const example = (n: number, assertion = 'assert x == 2') => `### Example ${n}
1. Step
   *Why:* reason.

\`\`\`verify
x = 1 + 1
${assertion}
\`\`\`
`;

const topicFile = (
  opts: { prerequisites?: string; examples?: string[]; extraMistake?: string } = {},
) => `---
id: C107
title: Elasticity
block: C1
coreYear: 1
prerequisites: ${opts.prerequisites ?? '[C106]'}
estMinutes: 40
status: draft
economicUses:
  - Pricing
generators: [elasticity-linear-point]
widgets: [elasticity-slider]
mistakeCodes:
  SIGN: { label: Lost the minus sign, explanation: Demand slopes downwards. }
  INVERTED_RATIO: { label: Used Q/P, explanation: Multiply by P/Q. }
  SLOPE_ONLY: { label: Gave the slope, explanation: Multiply the slope by P/Q. }
  INVERSE_SLOPE: { label: Used dP/dQ, explanation: Take the reciprocal. }
resources: []
---

## Why economists need this
Text.

## Intuition
Text.

## Definition and formulas
$\\varepsilon = \\frac{dQ}{dP}\\cdot\\frac{P}{Q}$

## Interactive
::widget{id="elasticity-slider"}

## Worked examples

${(opts.examples ?? [example(1), example(2), example(3)]).join('\n')}
## Common mistakes
- Dropping the minus sign (SIGN).${opts.extraMistake ?? ''}

## Practice
- \`elasticity-linear-point\` (difficulty 1)

## Real world
Text.
`;

const errors = (source: string, path = 'content/topics/C107-elasticity.md') =>
  checkTopicFile(path, source, bank)
    .filter((i) => i.level === 'error')
    .map((i) => `${i.where} ${i.message}`);

describe('parseTopicFile', () => {
  it('finds sections, examples and verify blocks with line numbers', () => {
    const { outline } = parseTopicFile(topicFile(), 'f');
    expect(outline?.sections.map((s) => s.title)).toHaveLength(8);
    expect(outline?.examples.map((e) => e.title)).toEqual(['Example 1', 'Example 2', 'Example 3']);
    expect(outline?.verifyBlocks).toHaveLength(3);
    const lines = topicFile().split('\n');
    const first = outline?.verifyBlocks[0];
    expect(lines[(first?.line ?? 0) - 1]).toBe('x = 1 + 1');
  });

  it('ignores headings inside code blocks', () => {
    const { outline } = parseTopicFile(
      topicFile({ examples: [example(1), `\`\`\`text\n## Not a section\n\`\`\`\n`] }),
      'f',
    );
    expect(outline?.sections.map((s) => s.title)).not.toContain('Not a section');
  });

  it('accepts Windows line endings', () => {
    expect(errors(topicFile().replace(/\n/g, '\r\n'))).toEqual([]);
  });
});

describe('checkTopicFile', () => {
  it('accepts a valid topic file', () => {
    expect(checkTopicFile('content/topics/C107-elasticity.md', topicFile(), bank)).toEqual([]);
  });

  it('fails when a verify assert is false', () => {
    const source = topicFile({
      examples: [example(1), example(2, 'assert x == 3'), example(3)],
    });
    expect(errors(source)).toEqual([
      expect.stringMatching(/C107-elasticity\.md:\d+ verify failed: assert x == 3/),
    ]);
  });

  it('requires exactly three worked examples, each with a verify block', () => {
    expect(errors(topicFile({ examples: [example(1), example(2)] }))).toEqual([
      expect.stringContaining('exactly 3 examples'),
    ]);
    expect(
      errors(topicFile({ examples: [example(1), example(2), '### Example 3\nNo check.\n'] })),
    ).toEqual([expect.stringContaining('has no verify block')]);
  });

  it('requires the sections in order', () => {
    const source = topicFile().replace('## Intuition\nText.\n\n', '');
    expect(errors(source)).toEqual([expect.stringContaining('Sections must be, in order')]);
  });

  it('checks prerequisites and file name against the topic bank', () => {
    expect(errors(topicFile({ prerequisites: '[]' }))).toEqual([
      expect.stringContaining('prerequisites [] differ from topic bank [C106]'),
    ]);
    expect(errors(topicFile(), 'content/topics/elasticity.md')).toEqual([
      expect.stringContaining('File name must be "C107-<slug>.md"'),
    ]);
  });

  it('reports mistake codes that are not defined', () => {
    expect(errors(topicFile({ extraMistake: '\n- Guessing (WILD_GUESS).' }))).toEqual([
      expect.stringContaining('WILD_GUESS, which is not in mistakeCodes'),
    ]);
  });

  it('requires an offline explanation for every mistake a generator returns', () => {
    const source = topicFile().replace(
      '  SLOPE_ONLY: { label: Gave the slope, explanation: Multiply the slope by P/Q. }\n',
      '',
    );
    expect(errors(source)).toEqual([
      expect.stringContaining('returns mistake SLOPE_ONLY, which has no explanation'),
    ]);
  });

  it('only warns about a missing generator while the topic is a draft', () => {
    const source = topicFile().replace(
      'generators: [elasticity-linear-point]',
      'generators: [elasticity-linear-point, not-built-yet]',
    );
    const issues = checkTopicFile('content/topics/C107-elasticity.md', source, bank);
    expect(issues).toContainEqual(
      expect.objectContaining({
        level: 'warning',
        message: expect.stringContaining('not-built-yet'),
      }),
    );
    expect(errors(source.replace('status: draft', 'status: reviewed'))).toEqual([
      expect.stringContaining('"not-built-yet" is not implemented'),
    ]);
  });

  it('reports a missing frontmatter block', () => {
    expect(errors('# Elasticity\n')).toEqual([expect.stringContaining('frontmatter')]);
  });
});

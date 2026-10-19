import { describe, expect, it } from 'vitest';
import { checkSymbols, symbolCommandsIn } from './symbols';

describe('symbols used in topics', () => {
  it('finds symbol commands in maths, ignoring layout commands and plain text', () => {
    const md =
      'Price $P \\neq 0$ and $$\\dfrac{a}{b} \\le \\sum_i x_i, \\; n!, |x|$$ but not \\alpha outside.';
    expect([...symbolCommandsIn(md)].sort()).toEqual(['!', '\\le', '\\neq', '\\sum', '|']);
  });

  it('warns about a symbol nobody explained', () => {
    const yml = [
      '- group: G',
      '  items:',
      "    - latex: '\\neq'",
      '      name: not equal',
      '      meaning: m',
      '      example: e',
      "      covers: ['\\neq']",
      '',
    ].join('\n');
    const issues = checkSymbols(yml, 'symbols.yml', [
      { file: 'T.md', markdown: '$a \\neq b \\iff c$' },
    ]);
    expect(issues.map((i) => i.message)).toEqual(['\\iff is used in T.md but not explained']);
  });
});

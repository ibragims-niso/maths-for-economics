import { describe, expect, it } from 'vitest';
import { runVerifyBlock } from './verify';

describe('runVerifyBlock', () => {
  it('passes when every assert is true', () => {
    const code = ['a = 100; b = 2; P = 20', 'Q = a - b*P', 'assert Q == 60'].join('\n');
    expect(runVerifyBlock(code)).toEqual([]);
  });

  it('lets content reuse names of math.js constants such as e', () => {
    const code = ['e = -2*20/60', 'assert abs(e - (-2/3)) < 0.001'].join('\n');
    expect(runVerifyBlock(code)).toEqual([]);
  });

  it('reports a false assert with its file line number', () => {
    const failures = runVerifyBlock(['x = 2', 'assert x == 3'].join('\n'), 40);
    expect(failures).toEqual([
      { line: 41, statement: 'assert x == 3', message: 'assertion is false' },
    ]);
  });

  it('rejects asserts that are not true/false', () => {
    const [failure] = runVerifyBlock('assert 1 + 1');
    expect(failure?.message).toMatch(/must be true or false/);
  });

  it('reports syntax errors and unknown variables', () => {
    const failures = runVerifyBlock(['y = (1 +', 'assert z > 0'].join('\n'));
    expect(failures).toHaveLength(2);
  });

  it('requires at least one assert', () => {
    expect(runVerifyBlock('x = 1')[0]?.message).toBe('verify block has no assert line');
  });

  it('ignores blank lines and # comments', () => {
    expect(runVerifyBlock(['# setup', '', 'x = 1', 'assert x == 1'].join('\n'))).toEqual([]);
  });
});

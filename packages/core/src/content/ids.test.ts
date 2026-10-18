import { describe, expect, it } from 'vitest';
import { blockOf, isTopicId } from './ids';

describe('topic IDs', () => {
  it.each([
    ['F04', 'F'],
    ['FM01', 'FM'],
    ['C107', 'C1'],
    ['LA101', 'LA1'],
    ['LA201', 'LA2'],
    ['ST205', 'ST2'],
    ['MV13', 'MV'],
    ['NM03', 'NM'],
  ])('%s belongs to block %s', (id, block) => {
    expect(isTopicId(id)).toBe(true);
    expect(blockOf(id)).toBe(block);
  });

  it.each(['C207', 'F4', 'F004', 'XX01', 'c107', 'LA301', ''])('rejects %s', (id) => {
    expect(isTopicId(id)).toBe(false);
    expect(blockOf(id)).toBeUndefined();
  });
});

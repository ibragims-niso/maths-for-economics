import { describe, expect, it } from 'vitest';
import { rankTopics, type SearchEntry, searchStems, stem } from './search';

const entry = (id: string, title: string, near = '', body = ''): SearchEntry => ({
  id,
  title: searchStems(title).join(' '),
  near: searchStems(near).join(' '),
  body: searchStems(body).join(' '),
});

const ENTRIES = [
  entry(
    'F03',
    'Functions, domain, range and graphs',
    'Demand as a function',
    'a function of one variable',
  ),
  entry('F04', 'Linear functions in economics', 'Linear demand'),
  entry('C107', 'Elasticity', 'Price elasticity of demand'),
  entry('MV01', 'Functions of several variables and level curves', 'Production'),
];

describe('topic search', () => {
  it('stems plurals and long words alike', () => {
    expect(stem('Functions')).toBe(stem('function'));
    expect(stem('univaried')).toBe(stem('univariate'));
  });

  it('finds a topic from a syllabus heading with filler words and a typo', () => {
    const ids = rankTopics('Concept of univaried function, its definition and types', ENTRIES);
    expect(ids[0]).toBe('F03');
  });

  it('finds half-typed words and exact IDs', () => {
    expect(rankTopics('elast', ENTRIES)).toEqual(['C107']);
    expect(rankTopics('c107', ENTRIES)).toEqual(['C107']);
  });

  it('puts title matches before text matches', () => {
    expect(rankTopics('demand', ENTRIES).slice(0, 3)).toEqual(['F03', 'F04', 'C107']);
    expect(rankTopics('several variables', ENTRIES)[0]).toBe('MV01');
  });

  it('ignores maths and returns nothing for an empty query', () => {
    expect(searchStems('$x^2$ <b>cost</b>')).toEqual(['cost']);
    expect(rankTopics('  ', ENTRIES)).toEqual([]);
  });
});

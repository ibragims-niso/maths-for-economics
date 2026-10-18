import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { TopicBankEntry } from './schemas';
import { checkTopicBank, findCycle } from './topic-bank';

const topic = (id: string, prerequisites: string[] = [], coreYear = 1): TopicBankEntry => ({
  id,
  title: id,
  coreYear,
  prerequisites,
  economicUse: 'test',
});

// Random graphs where topic i may only depend on topics with a smaller index: never a cycle.
const acyclicGraph = fc.integer({ min: 1, max: 30 }).chain((n) =>
  fc.tuple(
    ...Array.from({ length: n }, (_, i) =>
      fc.subarray(Array.from({ length: i }, (_, j) => j)).map((pre) => ({
        id: `T${i}`,
        prerequisites: pre.map((j) => `T${j}`),
      })),
    ),
  ),
);

describe('findCycle', () => {
  it('finds no cycle in any acyclic graph', () => {
    fc.assert(fc.property(acyclicGraph, (g) => findCycle(g) === null));
  });

  it('finds a cycle once a back edge is added', () => {
    fc.assert(
      fc.property(
        acyclicGraph.filter((g) => g.length >= 2),
        (g) => {
          const [first, ...rest] = g;
          if (!first) return;
          const last = rest[rest.length - 1];
          if (!last) return;
          // Make the first topic depend on the last, and the last on the first.
          const withCycle = [
            { ...first, prerequisites: [...first.prerequisites, last.id] },
            ...rest.slice(0, -1),
            { ...last, prerequisites: [...last.prerequisites, first.id] },
          ];
          const cycle = findCycle(withCycle);
          expect(cycle).not.toBeNull();
          expect(cycle?.[0]).toBe(cycle?.[cycle.length - 1]);
        },
      ),
    );
  });

  it('reports the path of the cycle', () => {
    expect(findCycle([topic('A', ['B']), topic('B', ['C']), topic('C', ['A'])])).toEqual([
      'A',
      'B',
      'C',
      'A',
    ]);
  });
});

describe('checkTopicBank', () => {
  it('accepts a valid bank', () => {
    expect(checkTopicBank([topic('F01'), topic('F02', ['F01'])], 'bank')).toEqual([]);
  });

  it('reports duplicates, unknown prerequisites and cycles as errors', () => {
    const issues = checkTopicBank(
      [
        topic('F01', ['F02']),
        topic('F02', ['F01']),
        topic('F03', ['F99']),
        topic('F04'),
        topic('F04'),
      ],
      'bank',
    );
    const messages = issues.filter((i) => i.level === 'error').map((i) => i.message);
    expect(messages).toContain('Duplicate topic ID F04');
    expect(messages).toContain('F03 has unknown prerequisite F99');
    expect(messages.some((m) => m.startsWith('Prerequisite cycle'))).toBe(true);
  });

  it('warns when a prerequisite sits in a later year', () => {
    const issues = checkTopicBank([topic('MV01', [], 2), topic('F01', ['MV01'], 1)], 'bank');
    expect(issues).toEqual([
      { level: 'warning', where: 'bank', message: 'F01 (year 1) needs MV01, which is in year 2' },
    ]);
  });
});

import { describe, expect, it } from 'vitest';
import topicBank from '../../../content/topic-bank.json';
import { GRID, layoutCurriculum } from './curriculum-map';

describe('layoutCurriculum on the real topic bank', () => {
  const layout = layoutCurriculum(topicBank);

  it('places every topic once, on a grid intersection inside the chart', () => {
    expect(layout.points).toHaveLength(topicBank.length);
    expect(new Set(layout.points.map((p) => `${p.x},${p.y}`)).size).toBe(topicBank.length);
    for (const p of layout.points) {
      expect(p.x % GRID).toBe(0);
      expect(p.y % GRID).toBe(0);
      expect(p.x).toBeGreaterThan(0);
      expect(p.x).toBeLessThan(layout.width);
      expect(p.y).toBeGreaterThan(0);
      expect(p.y).toBeLessThan(layout.height);
    }
  });

  it('draws one link per prerequisite', () => {
    const expected = topicBank.reduce((n, t) => n + t.prerequisites.length, 0);
    expect(layout.links).toHaveLength(expected);
  });

  it('orders years left to right with their topic counts', () => {
    expect(layout.years.map((y) => [y.year, y.count])).toEqual([
      [1, 44],
      [2, 22],
      [3, 20],
      [4, 16],
    ]);
    const xs = layout.years.map((y) => y.x);
    expect([...xs].sort((a, b) => a - b)).toEqual(xs);
  });

  it('stacks a block upwards in topic order', () => {
    const c1 = layout.points.filter((p) => p.block === 'C1');
    expect(c1.map((p) => p.id)).toEqual(c1.map((p) => p.id).sort());
    expect(c1.every((p, i) => i === 0 || p.y < (c1[i - 1]?.y ?? 0))).toBe(true);
  });
});

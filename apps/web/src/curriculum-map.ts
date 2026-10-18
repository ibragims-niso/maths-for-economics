import { BLOCKS, type Block, blockOf } from '@mfe/core';

/** One step of the graph paper. Every topic sits on a grid intersection. */
export const GRID = 20;

export interface MapTopic {
  id: string;
  title: string;
  coreYear: number;
  prerequisites: readonly string[];
}

export interface MapPoint {
  id: string;
  title: string;
  block: Block;
  year: number;
  x: number;
  y: number;
}

export interface MapLink {
  from: string;
  to: string;
  /** SVG path from the prerequisite to the topic that builds on it. */
  d: string;
}

export interface MapYear {
  year: number;
  count: number;
  /** Centre of the year's columns, for its label. */
  x: number;
}

export interface CurriculumLayout {
  width: number;
  height: number;
  points: MapPoint[];
  links: MapLink[];
  years: MapYear[];
  /** x of the empty column between two years. */
  dividers: number[];
}

/**
 * Lays the topic bank out as a chart: one column per block in curriculum order, an empty
 * column between years, and each block's topics stacked upwards in bank order.
 */
export function layoutCurriculum(topics: readonly MapTopic[]): CurriculumLayout {
  const points: MapPoint[] = [];
  const years: MapYear[] = [];
  let column = 0;
  let maxRows = 0;

  for (const block of BLOCKS) {
    const inBlock = topics.filter((t) => blockOf(t.id) === block);
    const first = inBlock[0];
    if (!first) continue;
    let year = years[years.length - 1];
    if (year?.year !== first.coreYear) {
      if (year) column++; // gap between years
      year = { year: first.coreYear, count: 0, x: 0 };
      years.push(year);
    }
    column++;
    inBlock.forEach((t, row) => {
      points.push({ id: t.id, title: t.title, block, year: t.coreYear, x: column * GRID, y: row });
    });
    year.count += inBlock.length;
    maxRows = Math.max(maxRows, inBlock.length);
  }

  const height = (maxRows + 1) * GRID;
  for (const p of points) p.y = height - (p.y + 1) * GRID;
  for (const y of years) {
    const xs = points.filter((p) => p.year === y.year).map((p) => p.x);
    y.x = (Math.min(...xs) + Math.max(...xs)) / 2;
  }

  const dividers = years.slice(1).map((y) => {
    const firstOfYear = Math.min(...points.filter((p) => p.year === y.year).map((p) => p.x));
    return firstOfYear - GRID;
  });

  const byId = new Map(points.map((p) => [p.id, p]));
  const links: MapLink[] = [];
  for (const t of topics) {
    const to = byId.get(t.id);
    for (const pre of t.prerequisites) {
      const from = byId.get(pre);
      if (to && from) links.push({ from: pre, to: t.id, d: linkPath(from, to) });
    }
  }

  return { width: (column + 1) * GRID, height, points, links, years, dividers };
}

function linkPath(a: MapPoint, b: MapPoint): string {
  if (a.x === b.x) {
    // Same block: bow out to the left so links skipping a row stay visible.
    const bow = Math.min(GRID / 2, Math.abs(b.y - a.y) / 4);
    return `M${a.x} ${a.y}Q${a.x - bow} ${(a.y + b.y) / 2} ${b.x} ${b.y}`;
  }
  const mid = (a.x + b.x) / 2;
  return `M${a.x} ${a.y}C${mid} ${a.y} ${mid} ${b.y} ${b.x} ${b.y}`;
}

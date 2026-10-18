/**
 * Seeded pseudo-random numbers (mulberry32). The same seed always gives the same sequence, so
 * any problem can be regenerated exactly from its templateId + seed (docs/02, docs/04).
 */
export interface Rng {
  /** A float in [0, 1). */
  next(): number;
  /** An integer in [min, max], both inclusive. */
  int(min: number, max: number): number;
  /** One element of a non-empty array. */
  pick<T>(items: readonly T[]): T;
}

export function createRng(seed: number): Rng {
  let state = seed >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (min: number, max: number) => min + Math.floor(next() * (max - min + 1));
  return {
    next,
    int,
    pick: <T>(items: readonly T[]) => {
      const item = items[int(0, items.length - 1)];
      if (item === undefined) throw new Error('pick() needs a non-empty array');
      return item;
    },
  };
}

/** A fresh seed for a new problem (not cryptographic; it only has to differ between problems). */
export function randomSeed(): number {
  return Math.floor(Math.random() * 2 ** 32);
}

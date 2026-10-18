import type { TopicProgress } from '@mfe/core';
import { DEFAULT_SETTINGS, type Settings, type Storage, type TestAttempt } from './types';

/** Keeps progress in memory: for tests, and when the browser offers no IndexedDB. */
export function createMemoryStorage(): Storage {
  const progress = new Map<string, TopicProgress>();
  const attempts: TestAttempt[] = [];
  let settings: Settings = DEFAULT_SETTINGS;
  const listeners = new Set<() => void>();
  const changed = () => {
    for (const listener of listeners) listener();
  };

  return {
    allProgress: async () => [...progress.values()],
    saveProgress: async (items) => {
      for (const p of items) progress.set(p.topicId, p);
      changed();
    },
    addAttempt: async (attempt) => {
      attempts.push(attempt);
      changed();
    },
    recentAttempts: async (limit) =>
      [...attempts].sort((a, b) => b.finishedAt - a.finishedAt).slice(0, limit),
    getSettings: async () => settings,
    saveSettings: async (patch) => {
      settings = { ...settings, ...patch };
      changed();
    },
    watch: (onChange) => {
      listeners.add(onChange);
      onChange();
      return () => listeners.delete(onChange);
    },
  };
}

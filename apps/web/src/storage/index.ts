import { markRead, progressAfterTest, type TopicProgress } from '@mfe/core';
import { useEffect, useEffectEvent, useState } from 'react';
import { createDexieStorage } from './dexie';
import { createMemoryStorage } from './memory';
import type { Storage, TestAttempt } from './types';

export type { AttemptItem, Storage, TestAttempt } from './types';

/** The device's storage. Without IndexedDB (rare), progress lasts for this visit only. */
export const storage: Storage =
  typeof indexedDB === 'undefined' ? createMemoryStorage() : createDexieStorage();

/** Saves a finished test and updates the progress of every topic in it. */
export async function recordTest(store: Storage, attempt: TestAttempt): Promise<void> {
  await store.addAttempt(attempt);
  const existing = await store.allProgress();
  await store.saveProgress(progressAfterTest(existing, attempt.items, attempt.finishedAt));
  // Ask the browser not to clear our data when space runs low; it may say no.
  await navigator.storage?.persist?.().catch(() => false);
}

/** Notes that the student has read a topic (first time only). */
export async function recordRead(store: Storage, topicId: string, now: number): Promise<void> {
  const existing = (await store.allProgress()).find((p) => p.topicId === topicId);
  const next = markRead(existing, topicId, now);
  if (next !== existing) await store.saveProgress([next]);
}

/** Reads from storage and reads again after every change. `undefined` while loading. */
function useStored<T>(read: (store: Storage) => Promise<T>): T | undefined {
  const [value, setValue] = useState<T>();
  const refresh = useEffectEvent(() => {
    read(storage).then(setValue, () => undefined);
  });
  useEffect(() => storage.watch(() => refresh()), []);
  return value;
}

/** Progress by topic ID. */
export const useProgress = () =>
  useStored(
    async (store) =>
      new Map<string, TopicProgress>((await store.allProgress()).map((p) => [p.topicId, p])),
  );

export const useRecentAttempts = (limit = 20) => useStored((store) => store.recentAttempts(limit));

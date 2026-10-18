import type { TopicProgress } from '@mfe/core';
import { Dexie, type EntityTable, liveQuery } from 'dexie';
import type { Storage, TestAttempt } from './types';

type Db = Dexie & {
  progress: EntityTable<TopicProgress, 'topicId'>;
  attempts: EntityTable<TestAttempt, 'id'>;
};

/** Progress in IndexedDB, so it survives closing the app and works offline. */
export function createDexieStorage(): Storage {
  const db = new Dexie('maths-for-economics') as Db;
  db.version(1).stores({
    progress: 'topicId',
    attempts: 'id, finishedAt',
  });

  return {
    allProgress: () => db.progress.toArray(),
    saveProgress: async (items) => {
      await db.progress.bulkPut(items);
    },
    addAttempt: async (attempt) => {
      await db.attempts.put(attempt);
    },
    recentAttempts: (limit) => db.attempts.orderBy('finishedAt').reverse().limit(limit).toArray(),
    watch: (onChange) => {
      const subscription = liveQuery(() =>
        Promise.all([db.progress.toArray(), db.attempts.count()]),
      ).subscribe({ next: onChange, error: onChange });
      return () => subscription.unsubscribe();
    },
  };
}

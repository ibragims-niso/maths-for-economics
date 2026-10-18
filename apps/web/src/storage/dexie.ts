import type { TopicProgress } from '@mfe/core';
import { Dexie, type EntityTable, liveQuery } from 'dexie';
import { DEFAULT_SETTINGS, type Settings, type Storage, type TestAttempt } from './types';

/** Settings are one row; the key leaves room for more rows later. */
type SettingsRow = Settings & { key: 'device' };

type Db = Dexie & {
  progress: EntityTable<TopicProgress, 'topicId'>;
  attempts: EntityTable<TestAttempt, 'id'>;
  settings: EntityTable<SettingsRow, 'key'>;
};

/** Progress in IndexedDB, so it survives closing the app and works offline. */
export function createDexieStorage(): Storage {
  const db = new Dexie('maths-for-economics') as Db;
  db.version(1).stores({
    progress: 'topicId',
    attempts: 'id, finishedAt',
  });
  db.version(2).stores({ settings: 'key' });

  const getSettings = async (): Promise<Settings> => {
    const row = await db.settings.get('device');
    if (!row) return DEFAULT_SETTINGS;
    const { key: _key, ...settings } = row;
    return { ...DEFAULT_SETTINGS, ...settings };
  };

  return {
    allProgress: () => db.progress.toArray(),
    saveProgress: async (items) => {
      await db.progress.bulkPut(items);
    },
    addAttempt: async (attempt) => {
      await db.attempts.put(attempt);
    },
    recentAttempts: (limit) => db.attempts.orderBy('finishedAt').reverse().limit(limit).toArray(),
    getSettings,
    saveSettings: async (patch) => {
      await db.settings.put({ ...(await getSettings()), ...patch, key: 'device' });
    },
    watch: (onChange) => {
      const subscription = liveQuery(() =>
        Promise.all([db.progress.toArray(), db.attempts.count(), db.settings.toArray()]),
      ).subscribe({ next: onChange, error: onChange });
      return () => subscription.unsubscribe();
    },
  };
}

import type { Snapshot } from '@mfe/core';
import { describe, expect, it } from 'vitest';
import { deleteShare, readShare, saveShare } from './sync';

/** A tiny stand-in for D1 with the shares table, enough for these queries. */
function fakeDb() {
  const rows = new Map<string, { key_hash: string; payload: string; updated_at: number }>();
  const db = {
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          return {
            async first() {
              const row = rows.get(String(args[0]));
              if (!row) return null;
              return sql.includes('SELECT payload') ? { payload: row.payload } : row;
            },
            async run() {
              if (sql.startsWith('DELETE')) {
                const row = rows.get(String(args[0]));
                if (row?.key_hash === args[1]) rows.delete(String(args[0]));
              } else {
                const [token, key, payload, updated] = args as [string, string, string, number];
                const old = rows.get(token);
                rows.set(token, { key_hash: old?.key_hash ?? key, payload, updated_at: updated });
              }
              return {};
            },
          };
        },
      };
    },
  };
  return db as unknown as D1Database;
}

const token = 'a'.repeat(32);
const key = 'b'.repeat(32);
const snapshot: Snapshot = {
  version: 1,
  updatedAt: 1,
  trackName: 'Core',
  years: [{ year: 1, mastered: 1, total: 49 }],
  topics: [{ id: 'C107', state: 'mastered', lastScore: 100, testsTaken: 3 }],
  tests: [],
};

describe('mentor sharing (R11)', () => {
  it('saves a snapshot and shows it read-only on the link', async () => {
    const db = fakeDb();
    expect((await saveShare(db, { token, key, snapshot }, 10_000)).status).toBe(204);
    expect(await readShare(db, token)).toEqual({ status: 200, body: snapshot });
  });

  it('lets only the device with the key update or delete it', async () => {
    const db = fakeDb();
    await saveShare(db, { token, key, snapshot }, 10_000);
    const other = 'c'.repeat(32);
    expect((await saveShare(db, { token, key: other, snapshot }, 60_000)).status).toBe(403);
    await deleteShare(db, { token, key: other });
    expect((await readShare(db, token)).status).toBe(200);
    await deleteShare(db, { token, key });
    expect((await readShare(db, token)).status).toBe(404);
  });

  it('refuses anything that is not a progress snapshot (no free text, no names)', async () => {
    const db = fakeDb();
    const withName = { ...snapshot, studentName: 'Ali' };
    expect((await saveShare(db, { token, key, snapshot: withName }, 1)).status).toBe(400);
    expect((await readShare(db, 'not-a-token')).status).toBe(404);
  });
});

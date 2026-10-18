import { isShareToken, syncDisableSchema, syncRequestSchema } from '@mfe/core';
import { sha256 } from './ai/store';

type Result =
  | { status: 200 | 204; body?: unknown }
  | { status: 400 | 403 | 404 | 429 | 503; error: string };

/** A device may update its shared copy at most this often. */
const MIN_INTERVAL_MS = 5_000;

/** POST /api/sync: create or update the mentor's copy of the progress (docs/02). */
export async function saveShare(
  db: D1Database | undefined,
  body: unknown,
  now: number,
): Promise<Result> {
  if (!db) return { status: 503, error: 'Sharing is not set up yet.' };
  const parsed = syncRequestSchema.safeParse(body);
  if (!parsed.success)
    return { status: 400, error: 'This is not a progress snapshot from the app.' };
  const { token, key, snapshot } = parsed.data;
  const tokenHash = await sha256(token);
  const keyHash = await sha256(key);

  const row = await db
    .prepare('SELECT key_hash, updated_at FROM shares WHERE token_hash = ?1')
    .bind(tokenHash)
    .first<{ key_hash: string; updated_at: number }>();
  if (row && row.key_hash !== keyHash)
    return { status: 403, error: 'This device cannot update that link.' };
  if (row && now - row.updated_at < MIN_INTERVAL_MS)
    return { status: 429, error: 'Too many updates.' };

  await db
    .prepare(
      `INSERT INTO shares (token_hash, key_hash, payload, updated_at) VALUES (?1, ?2, ?3, ?4)
       ON CONFLICT (token_hash) DO UPDATE SET payload = ?3, updated_at = ?4`,
    )
    .bind(tokenHash, keyHash, JSON.stringify(snapshot), now)
    .run();
  return { status: 204 };
}

/** POST /api/sync/disable: turning sharing off deletes the copy at once (R11 allows 24 h). */
export async function deleteShare(db: D1Database | undefined, body: unknown): Promise<Result> {
  if (!db) return { status: 503, error: 'Sharing is not set up yet.' };
  const parsed = syncDisableSchema.safeParse(body);
  if (!parsed.success) return { status: 400, error: 'This request is not one the app sends.' };
  await db
    .prepare('DELETE FROM shares WHERE token_hash = ?1 AND key_hash = ?2')
    .bind(await sha256(parsed.data.token), await sha256(parsed.data.key))
    .run();
  return { status: 204 };
}

/** GET /api/mentor/:token: the read-only copy for the mentor's page. */
export async function readShare(db: D1Database | undefined, token: string): Promise<Result> {
  if (!db) return { status: 503, error: 'Sharing is not set up yet.' };
  if (!isShareToken(token)) return { status: 404, error: 'This link is not shared.' };
  const row = await db
    .prepare('SELECT payload FROM shares WHERE token_hash = ?1')
    .bind(await sha256(token))
    .first<{ payload: string }>();
  return row
    ? { status: 200, body: JSON.parse(row.payload) }
    : { status: 404, error: 'This link is not shared any more.' };
}

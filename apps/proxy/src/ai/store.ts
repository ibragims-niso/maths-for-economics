import limits from '../../../../config/limits.json';

export async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Lowercase, trimmed, single spaces: the same question typed twice shares one cache entry. */
export const normalise = (text: string) => text.toLowerCase().trim().replace(/\s+/g, ' ');

/**
 * Counts one AI call for today and returns whether the device and its network are still within
 * the daily limits (docs/03 layer 5). The network is stored as a hash with the day, never as
 * an IP address.
 */
export async function withinDailyLimits(
  db: D1Database,
  deviceId: string,
  ip: string,
  now: Date,
): Promise<boolean> {
  const day = now.toISOString().slice(0, 10);
  const count = async (key: string) => {
    const row = await db
      .prepare(
        `INSERT INTO usage (device_id, day, ai_calls) VALUES (?1, ?2, 1)
         ON CONFLICT (device_id, day) DO UPDATE SET ai_calls = ai_calls + 1
         RETURNING ai_calls`,
      )
      .bind(key, day)
      .first<{ ai_calls: number }>();
    return row?.ai_calls ?? 1;
  };
  const device = await count(deviceId);
  const network = await count(`ip:${await sha256(`${ip}|${day}`)}`);
  return device <= limits.aiCallsPerDevicePerDay && network <= limits.aiCallsPerIpPerDay;
}

/** Shared answer cache (docs/03): one entry per mode, topic, content version and question. */
export const answerCache = {
  key: (parts: (string | number | undefined)[]) => sha256(parts.map((p) => p ?? '').join('|')),
  get: (kv: KVNamespace, key: string) => kv.get(key),
  put: (kv: KVNamespace, key: string, text: string) =>
    kv.put(key, text, { expirationTtl: limits.cacheTtlDays * 24 * 60 * 60 }),
};

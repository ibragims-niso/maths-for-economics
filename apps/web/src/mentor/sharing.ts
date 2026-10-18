import { masteryState, type Snapshot, type TopicProgress, type Track } from '@mfe/core';
import { useEffect, useEffectEvent } from 'react';
import { type Storage, storage, type TestAttempt } from '../storage';
import { trackById, yearTopics } from '../tracks';

/** 128 random bits as 32 hex characters (docs/02: mentor tokens are 128-bit random). */
export function randomSecret(): string {
  return [...crypto.getRandomValues(new Uint8Array(16))]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export const mentorLink = (token: string) => `${location.origin}/m/${token}`;

/**
 * The mentor's copy: numbers and topic IDs only (docs/02). An imported programme's text stays
 * on the device, so its name is shared as "Imported programme".
 */
export function buildSnapshot(
  track: Track,
  progress: readonly TopicProgress[],
  attempts: readonly TestAttempt[],
  now: number,
): Snapshot {
  const byId = new Map(progress.map((p) => [p.topicId, p]));
  const mastered = (id: string) => masteryState(byId.get(id)) === 'mastered';
  return {
    version: 1,
    updatedAt: now,
    trackName: track.visibility === 'custom' ? 'Imported programme' : track.name,
    years: track.years.map(({ year }) => {
      const ids = yearTopics(track, year);
      return { year, mastered: ids.filter(mastered).length, total: ids.length };
    }),
    topics: progress.flatMap((p) => {
      const state = masteryState(p);
      if (state === 'none') return [];
      const lastScore = p.lastScores.at(-1);
      return [
        {
          id: p.topicId,
          state,
          testsTaken: p.testsTaken,
          ...(lastScore === undefined ? {} : { lastScore }),
          ...(p.nextReviewAt ? { nextReviewAt: p.nextReviewAt } : {}),
        },
      ];
    }),
    tests: attempts.slice(0, 20).map((a) => ({
      finishedAt: a.finishedAt,
      topicIds: a.topicIds.slice(0, 20),
      correct: a.items.filter((i) => i.correct).length,
      total: Math.max(1, a.items.length),
      mistakes: a.items.flatMap((i) =>
        i.mistakeCode ? [{ topicId: i.topicId, code: i.mistakeCode }] : [],
      ),
    })),
  };
}

/** Sends the current progress to the mentor's copy. Returns false when it could not. */
export async function pushSnapshot(store: Storage): Promise<boolean> {
  const settings = await store.getSettings();
  if (!settings.share || !navigator.onLine) return false;
  const track = trackById(settings.trackId, settings.customTracks);
  const snapshot = buildSnapshot(
    track,
    await store.allProgress(),
    await store.recentAttempts(20),
    Date.now(),
  );
  const res = await fetch('/api/sync', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...settings.share, snapshot }),
  }).catch(() => undefined);
  return Boolean(res?.ok);
}

export async function startSharing(store: Storage): Promise<boolean> {
  await store.saveSettings({ share: { token: randomSecret(), key: randomSecret() } });
  return pushSnapshot(store);
}

/** Turning sharing off deletes the mentor's copy on the server (R11). */
export async function stopSharing(store: Storage): Promise<void> {
  const { share } = await store.getSettings();
  if (share) {
    await fetch('/api/sync/disable', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(share),
    }).catch(() => undefined);
  }
  await store.saveSettings({ share: undefined });
}

/**
 * Keeps the mentor's copy up to date in the background (docs/02: progress is written locally
 * first; sync is a background copy). Waits for changes to settle, and catches up when the
 * phone comes back online.
 */
export function useMentorSync() {
  const push = useEffectEvent(() => {
    pushSnapshot(storage).catch(() => undefined);
  });
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const later = () => {
      clearTimeout(timer);
      timer = setTimeout(() => push(), 8_000);
    };
    const stop = storage.watch(later);
    window.addEventListener('online', later);
    return () => {
      stop();
      clearTimeout(timer);
      window.removeEventListener('online', later);
    };
  }, []);
}

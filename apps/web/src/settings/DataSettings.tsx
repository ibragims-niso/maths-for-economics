import type { TopicProgress } from '@mfe/core';
import { useState } from 'react';
import { stopSharing } from '../mentor/sharing';
import { type Storage, storage, type TestAttempt } from '../storage';

const FORMAT = 'maths-for-economics-backup';

/**
 * A backup of what this device knows: progress and tests, plus the programme choice. The own
 * AI key and the sharing key are left out on purpose, so a backup file is safe to keep anywhere.
 */
export async function makeBackup(store: Storage, now: Date) {
  const settings = await store.getSettings();
  return {
    format: FORMAT,
    version: 1,
    exportedAt: now.toISOString(),
    trackId: settings.trackId,
    customTracks: settings.customTracks ?? [],
    progress: await store.allProgress(),
    attempts: await store.recentAttempts(Number.MAX_SAFE_INTEGER),
  };
}

/** Puts a backup back on this device. Returns a plain message for the student. */
export async function restoreBackup(store: Storage, text: string): Promise<string> {
  let data: Partial<Awaited<ReturnType<typeof makeBackup>>>;
  try {
    data = JSON.parse(text);
  } catch {
    return 'This file is not a backup from this app.';
  }
  if (data.format !== FORMAT || !Array.isArray(data.progress) || !Array.isArray(data.attempts)) {
    return 'This file is not a backup from this app.';
  }
  await store.restore({
    progress: data.progress as TopicProgress[],
    attempts: data.attempts as TestAttempt[],
  });
  await store.saveSettings({
    ...(typeof data.trackId === 'string' ? { trackId: data.trackId } : {}),
    ...(Array.isArray(data.customTracks) ? { customTracks: data.customTracks } : {}),
  });
  return `Backup restored: ${data.progress.length} topics and ${data.attempts.length} tests.`;
}

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

/** Settings → your data (docs/07): export, restore, reset. */
export function DataSettings() {
  const [note, setNote] = useState<string>();

  const exportData = async () => {
    const now = new Date();
    const backup = await makeBackup(storage, now);
    download(
      `maths-for-economics-${now.toISOString().slice(0, 10)}.json`,
      JSON.stringify(backup, null, 2),
    );
    setNote('Backup saved to your downloads.');
  };

  const reset = async () => {
    if (
      !window.confirm(
        'Delete all progress, tests and settings on this device? This cannot be undone.',
      )
    )
      return;
    // Turning sharing off first deletes the mentor's copy on the server too.
    await stopSharing(storage);
    await storage.clearAll();
    setNote('Everything on this device was deleted.');
  };

  return (
    <section className="settings-block" aria-labelledby="data-heading">
      <h2 id="data-heading">Your data</h2>
      <p className="prose">
        Your progress lives only on this device. Save a backup to move it to a new phone. Your AI
        key is never included.
      </p>
      <div className="results-actions">
        <button type="button" className="button-primary" onClick={exportData}>
          Save a backup
        </button>
        <label className="button-secondary file-button">
          Restore
          <input
            type="file"
            accept=".json,application/json"
            className="sr-only"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (file) setNote(await restoreBackup(storage, await file.text()));
            }}
          />
        </label>
      </div>
      <button type="button" className="link-button danger-link" onClick={reset}>
        Delete everything on this device
      </button>
      {note && (
        <p className="key-status" role="status">
          {note}
        </p>
      )}
    </section>
  );
}

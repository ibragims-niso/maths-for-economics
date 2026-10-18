/** Where the app is in saving itself for offline use (service worker precache). */
export type SaveState = 'saving' | 'slow' | 'saved' | 'failed' | 'dev';

export interface OfflineStatus {
  /** ok: works offline; pending: still saving; problem: will not open without internet. */
  tone: 'ok' | 'pending' | 'problem';
  message: string;
}

/** The status line shown to the student. Never claims a saved copy that does not exist. */
export function describeOfflineStatus(save: SaveState, online: boolean): OfflineStatus {
  if (save === 'dev') {
    return { tone: 'pending', message: 'Offline saving is switched off while developing.' };
  }
  if (!online) {
    return save === 'saved'
      ? {
          tone: 'ok',
          message: 'No internet. The app is running from the copy saved on this device.',
        }
      : {
          tone: 'problem',
          message:
            "No internet, and the app isn't saved on this device yet. Connect once and keep this page open to save it.",
        };
  }
  switch (save) {
    case 'saved':
      return { tone: 'ok', message: 'Saved on this device. It opens without internet.' };
    case 'saving':
      return { tone: 'pending', message: 'Saving the app on this device so it works offline…' };
    case 'slow':
      return {
        tone: 'pending',
        message: 'Still saving. This is taking longer than usual, so keep this page open.',
      };
    case 'failed':
      return {
        tone: 'problem',
        message: "This browser can't save the app for offline use. Open it in Chrome or Safari.",
      };
  }
}

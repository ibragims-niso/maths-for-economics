import { describe, expect, it } from 'vitest';
import { describeOfflineStatus, type SaveState } from './offline-status';

const states: SaveState[] = ['saving', 'slow', 'saved', 'failed', 'dev'];

describe('describeOfflineStatus', () => {
  it('only promises offline use once the app is saved', () => {
    for (const save of states) {
      for (const online of [true, false]) {
        const { tone } = describeOfflineStatus(save, online);
        expect(tone === 'ok').toBe(save === 'saved');
      }
    }
  });

  it('tells an offline student when no copy is saved', () => {
    expect(describeOfflineStatus('saving', false)).toEqual({
      tone: 'problem',
      message:
        "No internet, and the app isn't saved on this device yet. Connect once and keep this page open to save it.",
    });
  });

  it('names the recovery when the browser cannot save', () => {
    expect(describeOfflineStatus('failed', true).message).toMatch(/Open it in Chrome or Safari/);
  });
});

import { describe, expect, it } from 'vitest';
import { recordTest } from '../storage';
import { createMemoryStorage } from '../storage/memory';
import { makeBackup, restoreBackup } from './DataSettings';

describe('backup and reset', () => {
  it('moves progress to another device and leaves the AI key out', async () => {
    const phone = createMemoryStorage();
    await phone.saveSettings({
      trackId: 'az-050405',
      ownKey: 'gsk_secret',
      share: { token: 'a'.repeat(32), key: 'b'.repeat(32) },
    });
    await recordTest(phone, {
      id: 't1',
      startedAt: 1,
      finishedAt: 2,
      timeLimitSec: 60,
      timedOut: false,
      topicIds: ['C107'],
      difficulty: 'mixed',
      items: [{ topicId: 'C107', templateId: 'x', seed: 1, userAnswer: '1', correct: true }],
    });
    const text = JSON.stringify(await makeBackup(phone, new Date(0)));
    expect(text).not.toContain('gsk_secret');
    expect(text).not.toContain('b'.repeat(32));

    const newPhone = createMemoryStorage();
    expect(await restoreBackup(newPhone, text)).toBe('Backup restored: 1 topics and 1 tests.');
    expect((await newPhone.getSettings()).trackId).toBe('az-050405');
    expect((await newPhone.allProgress())[0]?.lastScores).toEqual([100]);
  });

  it('refuses other files and clears everything on reset', async () => {
    const store = createMemoryStorage();
    expect(await restoreBackup(store, '{"hello": 1}')).toBe(
      'This file is not a backup from this app.',
    );
    await store.saveSettings({ trackId: 'mit' });
    await store.clearAll();
    expect((await store.getSettings()).trackId).toBe('core');
  });
});

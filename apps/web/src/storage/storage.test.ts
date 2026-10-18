import { masteryState } from '@mfe/core';
import { describe, expect, it } from 'vitest';
import { recordRead, recordTest, type TestAttempt } from './index';
import { createMemoryStorage } from './memory';

const attempt = (id: string, finishedAt: number, correct: boolean[]): TestAttempt => ({
  id,
  startedAt: finishedAt - 60_000,
  finishedAt,
  timeLimitSec: 300,
  timedOut: false,
  topicIds: ['C107'],
  difficulty: 'mixed',
  items: correct.map((c, i) => ({
    topicId: 'C107',
    templateId: 'elasticity-linear-point',
    seed: i + 1,
    userAnswer: c ? '-0.5' : '3',
    correct: c,
  })),
});

describe('progress on the device', () => {
  it('masters a topic after three good tests and lists tests newest first', async () => {
    const store = createMemoryStorage();
    await recordTest(store, attempt('a', 1, [true, true, true, true, false]));
    await recordTest(store, attempt('b', 2, [true, true, true, true, true]));
    let [c107] = await store.allProgress();
    expect(masteryState(c107)).toBe('learning');

    await recordTest(store, attempt('c', 3, [true, true, true, true, true]));
    [c107] = await store.allProgress();
    expect(c107?.lastScores).toEqual([80, 100, 100]);
    expect(masteryState(c107)).toBe('mastered');
    expect((await store.recentAttempts(2)).map((a) => a.id)).toEqual(['c', 'b']);
  });

  it('records reading once and tells watchers about changes', async () => {
    const store = createMemoryStorage();
    let calls = 0;
    const stop = store.watch(() => {
      calls++;
    });
    await recordRead(store, 'F04', 10);
    await recordRead(store, 'F04', 20);
    stop();
    expect((await store.allProgress())[0]?.readAt).toBe(10);
    expect(calls).toBe(2); // once on watch, once for the first read
  });
});

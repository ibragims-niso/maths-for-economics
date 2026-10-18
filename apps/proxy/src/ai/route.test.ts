import { generatorById, makeProblem } from '@mfe/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { answerAi, MESSAGES } from './route';

const base = {
  topicId: 'C107',
  contentVersion: 'test',
  deviceId: '0b6e5c1e-2b7f-4c62-9a43-6f1b2b9d6a10',
};
const dev = { GROQ_API_KEY: 'test-key', AI_DEV_UNLIMITED: '1' };
const now = new Date('2026-10-18T12:00:00Z');

/** Replies from the fake provider, in order; records what was asked. */
function fakeProvider(...replies: string[]) {
  const asked: { model: string; messages: { role: string; content: string }[] }[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_url: string, init: RequestInit) => {
      asked.push(JSON.parse(String(init.body)));
      const content = replies.shift() ?? '';
      return new Response(JSON.stringify({ choices: [{ message: { content } }] }));
    }),
  );
  return asked;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('POST /api/ai guardrails', () => {
  it('refuses requests while a test is running', async () => {
    const result = await answerAi(
      { ...base, mode: 'REAL_WORLD', payload: {}, testActive: true },
      dev,
      'ip',
      now,
    );
    expect(result).toEqual({ status: 403, error: MESSAGES.testRunning });
  });

  it('refuses problems that are not from this topic’s generators', async () => {
    const result = await answerAi(
      {
        ...base,
        mode: 'EXPLAIN_STEP',
        payload: { templateId: 'linear-break-even', seed: 1, step: 0 },
      },
      dev,
      'ip',
      now,
    );
    expect(result.status).toBe(400);
  });

  it('does not use the shared key without daily limits in production', async () => {
    const result = await answerAi(
      { ...base, mode: 'REAL_WORLD', payload: {} },
      { GROQ_API_KEY: 'k' },
      'ip',
      now,
    );
    expect(result).toEqual({ status: 503, error: MESSAGES.notSetUp });
  });

  it('explains a step of the app’s own problem, rebuilt from template and seed', async () => {
    const asked = fakeProvider('Because elasticity needs the quantity at that price.');
    const result = await answerAi(
      {
        ...base,
        mode: 'EXPLAIN_STEP',
        payload: { templateId: 'elasticity-linear-point', seed: 42, step: 0 },
      },
      dev,
      'ip',
      now,
    );
    expect(result).toMatchObject({ status: 200, body: { mode: 'EXPLAIN_STEP' } });
    const generator = generatorById('elasticity-linear-point');
    if (!generator) throw new Error('missing generator');
    expect(asked[0]?.messages[1]?.content).toContain(makeProblem(generator, 42).stem);
  });

  it('sends off-topic questions a fixed reply without asking the main model', async () => {
    const asked = fakeProvider('{"category": "off_topic"}');
    const result = await answerAi(
      { ...base, mode: 'ASK', payload: { question: 'Who won the football yesterday?' } },
      dev,
      'ip',
      now,
    );
    expect(result).toMatchObject({ status: 200, body: { mode: 'OFF_TOPIC' } });
    expect(asked).toHaveLength(1);
  });

  it('never returns work on the student’s own numbers', async () => {
    fakeProvider(
      '{"category": "user_problem"}',
      'At P = 37, Q = 480 - 7·37 = 221, so ε = -259/221 = -1.17.',
    );
    const result = await answerAi(
      {
        ...base,
        mode: 'ASK',
        payload: { question: 'Demand is Q = 480 - 7P. Find the elasticity at P = 37.' },
      },
      dev,
      'ip',
      now,
    );
    expect(result.status).toBe(200);
    if (result.status !== 200) return;
    expect(result.body.mode).toBe('ANALOG');
    expect(result.body.text).toContain('Now apply the same steps to your own numbers.');
    expect(result.body.text).not.toContain('221');
  });

  it('treats an unclear classifier reply as the student’s own exercise', async () => {
    fakeProvider('not json', 'The method: find Q, the slope, then multiply by P/Q.');
    const result = await answerAi(
      { ...base, mode: 'ASK', payload: { question: 'help with 3 and 5' } },
      dev,
      'ip',
      now,
    );
    expect(result).toMatchObject({ status: 200, body: { mode: 'ANALOG' } });
  });

  it('says AI is unavailable when every provider fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('down', { status: 500 })),
    );
    const result = await answerAi({ ...base, mode: 'REAL_WORLD', payload: {} }, dev, 'ip', now);
    expect(result).toEqual({ status: 503, error: MESSAGES.unavailable });
  });
});

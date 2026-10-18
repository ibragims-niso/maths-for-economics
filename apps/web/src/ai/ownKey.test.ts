import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkKey } from './groq';
import { askWithOwnKey } from './ownKey';

const reply = (content: string) =>
  new Response(JSON.stringify({ choices: [{ message: { content } }] }));

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('own key (docs/10)', () => {
  it('verifies a key with one list-models call and reads the result plainly', async () => {
    const urls: string[] = [];
    vi.stubGlobal('fetch', async (url: string) => {
      urls.push(url);
      return new Response('{}', { status: 200 });
    });
    expect(await checkKey(' gsk_test ')).toBe('works');
    expect(urls).toEqual(['https://api.groq.com/openai/v1/models']);

    vi.stubGlobal('fetch', async () => new Response('{}', { status: 401 }));
    expect(await checkKey('gsk_bad')).toBe('invalid');

    vi.stubGlobal('fetch', async () => {
      throw new TypeError('offline');
    });
    expect(await checkKey('gsk_x')).toBe('unreachable');
  });

  it('sends questions to Groq only, and answers own exercises (D37)', async () => {
    const urls: string[] = [];
    const replies = ['At P = 37, Q = 480 - 7·37 = 221, so ε = -1.17.'];
    vi.stubGlobal('fetch', async (url: string) => {
      urls.push(String(url));
      return reply(replies.shift() ?? '');
    });
    const result = await askWithOwnKey(
      {
        mode: 'ASK',
        topicId: 'C107',
        payload: { question: 'Demand is Q = 480 - 7P. Find the elasticity at P = 37.' },
      },
      'gsk_mine',
    );
    expect(urls.every((u) => u.startsWith('https://api.groq.com/'))).toBe(true);
    expect(urls).toHaveLength(1);
    expect(result.ok && result.answer.mode).toBe('OPEN');
    expect(result.ok && result.answer.text).toContain('221');
  });

  it('explains a refused key in plain words', async () => {
    vi.stubGlobal('fetch', async () => new Response('{}', { status: 401 }));
    const result = await askWithOwnKey(
      { mode: 'REAL_WORLD', topicId: 'C107', payload: {} },
      'gsk_revoked',
    );
    expect(result).toEqual({
      ok: false,
      message:
        'Groq refused your key. Check it in Settings, or remove it to use the free daily questions.',
    });
  });
});

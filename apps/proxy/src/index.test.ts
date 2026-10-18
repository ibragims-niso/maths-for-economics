import { describe, expect, it } from 'vitest';
import { isAllowedOrigin } from './cors';
import app, { type Env } from './index';

const env: Env = {
  ALLOWED_ORIGINS:
    'https://maths-for-economics.ibragim-n.workers.dev,https://*-maths-for-economics.ibragim-n.workers.dev',
};

describe('GET /health', () => {
  it('reports that the key is missing without failing', async () => {
    const res = await app.request('/health', {}, env);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      ok: true,
      service: 'maths-for-economics-proxy',
      groqKeyConfigured: false,
    });
  });

  it('never returns the key itself', async () => {
    const res = await app.request('/health', {}, { ...env, GROQ_API_KEY: 'gsk_secret' });
    const text = await res.text();
    expect(text).toContain('"groqKeyConfigured":true');
    expect(text).not.toContain('gsk_secret');
  });
});

describe('CORS', () => {
  it('allows the app origin', async () => {
    const res = await app.request(
      '/health',
      { headers: { Origin: 'https://maths-for-economics.ibragim-n.workers.dev' } },
      env,
    );
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(
      'https://maths-for-economics.ibragim-n.workers.dev',
    );
  });

  it('does not allow other origins', async () => {
    const res = await app.request('/health', { headers: { Origin: 'https://evil.example' } }, env);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });
});

describe('isAllowedOrigin', () => {
  const allowed = 'http://localhost:5173, https://app.me.workers.dev, https://*-app.me.workers.dev';

  it.each([
    ['http://localhost:5173', true],
    ['https://app.me.workers.dev', true],
    ['https://1a2b3c4d-app.me.workers.dev', true],
    ['https://evil.com/-app.me.workers.dev', false],
    ['https://x.evil-app.me.workers.dev', false],
    ['https://evilapp.me.workers.dev', false],
    ['http://app.me.workers.dev', false],
    ['https://app.me.workers.dev.evil.com', false],
    ['http://localhost:3000', false],
  ])('%s → %s', (origin, expected) => {
    expect(isAllowedOrigin(origin, allowed)).toBe(expected);
  });
});

describe('unknown routes', () => {
  it('return 404 JSON', async () => {
    const res = await app.request('/nope', {}, env);
    expect(res.status).toBe(404);
  });
});

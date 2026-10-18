import { describe, expect, it } from 'vitest';
import { isAllowedOrigin } from './cors';
import app, { type Env } from './index';

const env: Env = {
  ALLOWED_ORIGINS: 'https://maths-for-economics.pages.dev,https://*.maths-for-economics.pages.dev',
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
      { headers: { Origin: 'https://maths-for-economics.pages.dev' } },
      env,
    );
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(
      'https://maths-for-economics.pages.dev',
    );
  });

  it('does not allow other origins', async () => {
    const res = await app.request('/health', { headers: { Origin: 'https://evil.example' } }, env);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });
});

describe('isAllowedOrigin', () => {
  const allowed = 'http://localhost:5173, https://*.app.pages.dev';

  it.each([
    ['http://localhost:5173', true],
    ['https://abc123.app.pages.dev', true],
    ['https://app.pages.dev', false],
    ['https://evil-app.pages.dev', false],
    ['http://abc123.app.pages.dev', false],
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

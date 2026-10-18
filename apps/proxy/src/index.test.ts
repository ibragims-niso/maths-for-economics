import { describe, expect, it } from 'vitest';
import app, { type Env } from './index';

const env: Env = {};

describe('GET /api/health', () => {
  it('reports that the key is missing without failing', async () => {
    const res = await app.request('/api/health', {}, env);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      ok: true,
      service: 'maths-for-economics-api',
      groqKeyConfigured: false,
    });
  });

  it('never returns the key itself', async () => {
    const res = await app.request('/api/health', {}, { GROQ_API_KEY: 'gsk_secret' });
    const text = await res.text();
    expect(text).toContain('"groqKeyConfigured":true');
    expect(text).not.toContain('gsk_secret');
  });
});

describe('cross-origin browser calls', () => {
  it('get no CORS permission, so other sites cannot use the API', async () => {
    const res = await app.request(
      '/api/health',
      { headers: { Origin: 'https://evil.example' } },
      env,
    );
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('fail the preflight', async () => {
    const res = await app.request(
      '/api/health',
      {
        method: 'OPTIONS',
        headers: { Origin: 'https://evil.example', 'Access-Control-Request-Method': 'POST' },
      },
      env,
    );
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull();
    expect(res.headers.get('Access-Control-Allow-Methods')).toBeNull();
  });
});

describe('unknown routes', () => {
  it('return 404 JSON', async () => {
    const res = await app.request('/api/nope', {}, env);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Not found' });
  });
});

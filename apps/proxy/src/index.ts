import { Hono } from 'hono';

export interface Env {
  /** Shared Groq key: a secret on the Worker (dashboard or `wrangler secret put`). Never logged or returned. */
  GROQ_API_KEY?: string;
}

/**
 * The API runs in the same Worker as the web app, under /api (see the root wrangler.jsonc).
 * Being same-origin, it sends no CORS headers, so pages on other sites cannot call it from a
 * browser.
 */
const app = new Hono<{ Bindings: Env }>().basePath('/api');

/**
 * TEMPORARY setup aid: describes any binding whose name looks like the Groq key (exact name in
 * quotes, so stray spaces show; its type; empty or not) without ever returning a value.
 * Remove once GROQ_API_KEY is confirmed on the live Worker.
 */
function describeKeyBindings(env: object) {
  return Object.entries(env)
    .filter(([name]) => /groq|api.?key/i.test(name))
    .map(([name, value]) => ({
      name: JSON.stringify(name),
      type: typeof value,
      ...(typeof value === 'string'
        ? { empty: value.trim() === '', looksLikeGroqKey: value.trim().startsWith('gsk_') }
        : {}),
    }));
}

// Phase 0 "hello world": lets us check the deployment and that the secret is set,
// without ever revealing the key itself.
app.get('/health', (c) =>
  c.json({
    ok: true,
    service: 'maths-for-economics-api',
    groqKeyConfigured: Boolean(c.env.GROQ_API_KEY),
    keyBindings: describeKeyBindings(c.env ?? {}),
  }),
);

app.notFound((c) => c.json({ error: 'Not found' }, 404));

export default app;

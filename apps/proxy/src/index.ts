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

// Phase 0 "hello world": lets us check the deployment and that the secret is set,
// without ever revealing the key itself.
app.get('/health', (c) =>
  c.json({
    ok: true,
    service: 'maths-for-economics-api',
    groqKeyConfigured: Boolean(c.env.GROQ_API_KEY),
  }),
);

app.notFound((c) => c.json({ error: 'Not found' }, 404));

export default app;

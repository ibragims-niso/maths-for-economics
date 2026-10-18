import { type Context, Hono } from 'hono';
import { type AiEnv, answerAi } from './ai/route';
import { deleteShare, readShare, saveShare } from './sync';

export interface Env extends AiEnv {}

/**
 * The API runs in the same Worker as the web app, under /api (see the root wrangler.jsonc).
 * Being same-origin, it sends no CORS headers, so pages on other sites cannot call it from a
 * browser.
 */
const app = new Hono<{ Bindings: Env }>().basePath('/api');

// Lets us check the deployment and that the secrets and storage are set, without revealing keys.
app.get('/health', (c) =>
  c.json({
    ok: true,
    service: 'maths-for-economics-api',
    groqKeyConfigured: Boolean(c.env.GROQ_API_KEY),
    geminiKeyConfigured: Boolean(c.env.GEMINI_API_KEY),
    limitsConfigured: Boolean(c.env.DB),
    cacheConfigured: Boolean(c.env.AI_CACHE),
  }),
);

// The AI tutor (docs/03). Every answer goes through the guardrails in ./ai/route.ts.
app.post('/ai', async (c) => {
  const body = await c.req.json().catch(() => null);
  const ip = c.req.header('cf-connecting-ip') ?? 'unknown';
  const result = await answerAi(body, c.env, ip, new Date());
  return result.status === 200
    ? c.json(result.body)
    : c.json({ error: result.error }, result.status);
});

// Mentor sharing (docs/02, R11): opt-in copies of progress numbers, read-only for the mentor.
type Answer =
  | { status: 200 | 204; body?: unknown }
  | { status: 400 | 403 | 404 | 429 | 503; error: string };
const reply = (c: Context, result: Answer) => {
  if (result.status === 204) return c.body(null, 204);
  if (result.status === 200) {
    // The mentor's copy is private: never stored by browsers or shared caches.
    c.header('cache-control', 'no-store');
    return c.json(result.body ?? {});
  }
  return 'error' in result
    ? c.json({ error: result.error }, result.status)
    : c.json({ error: 'Unexpected' }, 500);
};

app.post('/sync', async (c) =>
  reply(c, await saveShare(c.env.DB, await c.req.json().catch(() => null), Date.now())),
);
app.post('/sync/disable', async (c) =>
  reply(c, await deleteShare(c.env.DB, await c.req.json().catch(() => null))),
);
app.get('/mentor/:token', async (c) => reply(c, await readShare(c.env.DB, c.req.param('token'))));

app.notFound((c) => c.json({ error: 'Not found' }, 404));

export default app;

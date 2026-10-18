import { Hono } from 'hono';
import { type AiEnv, answerAi } from './ai/route';

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

app.notFound((c) => c.json({ error: 'Not found' }, 404));

export default app;

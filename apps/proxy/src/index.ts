import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { isAllowedOrigin } from './cors';

export interface Env {
  /** Comma-separated origins of the web app (wrangler.jsonc "vars"). */
  ALLOWED_ORIGINS: string;
  /** Shared Groq key, set with `wrangler secret put GROQ_API_KEY`. Never logged or returned. */
  GROQ_API_KEY?: string;
}

const app = new Hono<{ Bindings: Env }>();

app.use('*', (c, next) =>
  cors({
    origin: (origin) => (isAllowedOrigin(origin, c.env.ALLOWED_ORIGINS) ? origin : null),
    allowMethods: ['GET', 'POST'],
    maxAge: 86400,
  })(c, next),
);

// Phase 0 "hello world": lets us check the deployment and that the secret is set,
// without ever revealing the key itself.
app.get('/health', (c) =>
  c.json({
    ok: true,
    service: 'maths-for-economics-proxy',
    groqKeyConfigured: Boolean(c.env.GROQ_API_KEY),
  }),
);

app.notFound((c) => c.json({ error: 'Not found' }, 404));

export default app;

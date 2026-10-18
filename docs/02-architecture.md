# 02 — Architecture

## Overview
```
 Phone (PWA)                                    Cloudflare
 ┌──────────────────────────────┐              ┌──────────────────────────┐
 │ React UI                     │   HTTPS      │ Worker (Hono)            │
 │ packages/core (generators,   │ ───────────► │  /ai      → Groq API     │
 │   grading, mastery, prompts) │              │  /sync    → D1           │
 │ Dexie / IndexedDB            │              │  /mentor  → D1 (read)    │
 │ Workbox precache (content)   │              │  KV: shared AI cache     │
 └──────────────────────────────┘              └──────────────────────────┘
        │ own-key mode: direct call to Groq (see 03-ai-design)
```

## Packages
- `packages/core` — pure TypeScript, no DOM. Generators, grading, mistake mapping, mastery rules, spaced repetition, test composer, prompt builders, content and track schemas (zod). Shared by web app, proxy and future Expo app.
- `apps/web` — UI only; imports core.
- `apps/proxy` — Worker; imports prompt builders and schemas from core.

## Offline strategy
- Build step compiles `content/**` into versioned JSON bundles (`content-v{n}.json`, split per year) and precaches them with the app shell.
- Images are SVG where possible (small, theme-aware).
- On start with network: fetch `content-manifest.json`; if a newer version exists, download in background and switch on next launch.
- AI responses cached in IndexedDB keyed by request hash; the same request never goes to the network twice.
- Progress always written locally first; sync is a background copy.

## Local data model (IndexedDB via Dexie)
```ts
Settings      { trackId; customTracks: TrackRef[]; ownApiKey?: string; mentorSharing: boolean; deviceId: string }
TopicProgress { topicId; firstOpenedAt?; readAt?; lastScores: number[] /* last 5, 0–100 */;
                testsTaken; mastery: 'none'|'learning'|'mastered'; leitnerBox: 0–5; nextReviewAt? }
TestAttempt   { id; startedAt; finishedAt; timeLimitSec; topicIds[]; difficulty;
                items: { templateId; seed; params; userAnswer; correct; mistakeCode?; timeSec }[] }
AiCacheEntry  { hash; mode; response; createdAt }
```
Store `templateId + seed` so any problem can be regenerated exactly (needed for review and error reports).

## Mastery and review rules (packages/core)
- Per-topic score of a test = share of that topic's items answered correctly.
- `mastered` when the last 3 scores on the topic are each ≥ 80; `learning` once the topic is read or tested; otherwise `none`.
- Leitner boxes with intervals 1, 3, 7, 14, 30 days. Score ≥ 80 moves up one box; < 60 moves to box 1; otherwise stays.
- Completion % of a course/track = mastered topics / topics in that course or track. Show "read" share separately.

## Proxy (Cloudflare Worker)
Endpoints:
- `POST /ai` — body `{ mode, topicId, contentVersion, payload, deviceId }`. Validates with zod, applies limits, checks KV cache, builds prompt from core, calls provider, stores cacheable answers.
- `POST /sync` — body `{ deviceId, snapshot }` when mentor sharing is on. Upsert.
- `POST /sync/disable` — deletes the snapshot and mentor token.
- `GET /mentor/:token` — returns snapshot JSON for the mentor page (read-only).

D1 tables:
```sql
CREATE TABLE sharing (device_id TEXT PRIMARY KEY, mentor_token_hash TEXT NOT NULL, created_at INTEGER);
CREATE TABLE snapshots (device_id TEXT PRIMARY KEY, payload TEXT NOT NULL, updated_at INTEGER);
CREATE TABLE usage (device_id TEXT, day TEXT, ai_calls INTEGER, PRIMARY KEY (device_id, day));
```
The snapshot contains only progress numbers and topic IDs — no names, no free text the student typed.

Mentor view: route `/m/:token` in the web app (same deployment), read-only, works without installing.

## Security
- Groq key: `wrangler secret put GROQ_API_KEY`. Never in code, config files or logs.
- CORS on the Worker restricted to the app origin.
- Mentor tokens: 128-bit random, only the hash stored server-side.
- Rate limits per device ID and per IP (`config/limits.json`).
- Own-key mode: key kept in IndexedDB on the device only; never sent to our proxy. If Groq blocks browser calls (CORS), add a pass-through route that forwards the request without logging or storing the key, and document this in the settings screen.

## Path to the native app (Phase 4)
Expo app reuses `packages/core` and content bundles; only UI and `Storage` implementation change (`expo-sqlite`). Keep all logic out of React components to make this cheap.

## Deployment
- Web app: Cloudflare Workers static assets, configured in the root `wrangler.jsonc`. Workers Builds runs `npm run build` and `npx wrangler deploy` on every push to `main` (see decision D25).
- Proxy Worker: Workers Builds runs `npx wrangler deploy --config apps/proxy/wrangler.jsonc` on every push to `main` (decision D26). `GROQ_API_KEY` is set as a secret in the Cloudflare dashboard or with `wrangler secret put`.

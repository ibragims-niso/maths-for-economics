# Maths for Economics — project guide for Claude Code

## What this is
A free, open-source, offline-first app (PWA first, Expo native app later) that teaches the mathematics used in university economics degrees, from first year to final year. App language: English only.

Curriculum model: one shared **topic bank** + **university tracks** (Core, Azerbaijan national 050405, LSE, Cambridge, MIT) + **custom tracks** that a user imports privately.

Primary user: a first-year economics student. Secondary users: any economics student, plus parents/tutors who follow a student's progress (opt-in mentor link).

The project owner is not a programmer. Explain every change in plain language, keep the project runnable after every step, and never leave the build broken at the end of a session.

## Non-negotiable rules
1. **AI never computes graded answers.** Answers, solution steps and distractors come from deterministic generators in `packages/core`. The AI only rewrites wording and explains steps it is given.
2. **AI never solves user-supplied problems.** A user problem gets the method plus an *analog problem* produced by an app generator (different numbers), solved step by step.
3. **AI is disabled while a test is running.**
4. **No secrets in the repo.** The shared Groq key lives only in Cloudflare secrets. A user's own key lives only on their device.
5. **AI never invents URLs.** It may only cite resources listed in the topic file.
6. **Offline-first.** Everything except AI, mentor sync and content updates works with no network.
7. **Verified maths.** Every generator has property-based tests; every worked example has a machine-checked `verify` block. CI must be green before merging.
8. **Privacy.** No ads, no third-party tracking. Mentor sync is opt-in, can be switched off any time, and stores no names or emails (anonymous device ID only).
9. **No copied text.** Do not copy textbook, lecture or exam text from any university or publisher; only topic structure is reused. Content licence CC BY-NC-SA 4.0, code licence MIT.
10. **Model names are configuration** (`config/ai.json`), never hard-coded.

## Stack
- Monorepo with npm workspaces, TypeScript everywhere.
- `apps/web`: React + Vite + `vite-plugin-pwa` (Workbox precache), React Router, Zustand for UI state.
- Local storage: IndexedDB via Dexie, behind a `Storage` interface so the Expo app can swap in `expo-sqlite` later.
- Maths rendering: KaTeX. Interactive graphs: Mafs (fallback: JSXGraph). Computation: math.js.
- Content: Markdown + YAML frontmatter with `remark-directive` shortcodes, compiled to JSON at build time.
- `apps/proxy`: Cloudflare Worker (Hono). KV for the shared AI answer cache, D1 for mentor sync.
- AI provider: Groq (OpenAI-compatible API) behind a provider interface so Gemini or Claude can be added.
- Tests: Vitest + fast-check (generators), Playwright (key flows, from Phase 2).
- Hosting: one Cloudflare Worker (root `wrangler.jsonc`, deployed by Workers Builds): the web app as static assets, the API from `apps/proxy` under `/api`. CI: GitHub Actions.

## Repo layout
```
apps/web/            PWA
apps/proxy/          Cloudflare Worker (AI proxy, cache, mentor sync)
packages/core/       generators, grading, mistake mapping, mastery, spaced repetition, prompt builders
content/topics/      one Markdown file per topic (see docs/04-content-model.md)
content/tracks/      track JSON files (public tracks only)
content/glossary.yml terminology used in content and AI prompts
config/              ai.json, limits.json
docs/                specification (read before working)
local/               gitignored: private custom tracks, syllabus scans, scratch files
```

## Commands
- `npm run dev` — web app locally
- `npm run dev:proxy` — the Worker (built app + API) locally on port 8790; `npm run dev` proxies `/api` to it
- `npm test` — unit + property tests
- `npm run validate:content` — schema check, `verify` blocks, prerequisite graph has no cycles
- `npm run validate:track <file>` — check one track file (e.g. a private one in `local/tracks/`)
- `npm run lint` / `npm run format` — Biome check / fix
- `npm run typecheck` — TypeScript, all workspaces
- `npm run build` — production build (runs `validate:content` first)
- `npm run build:bank` — regenerate `content/topic-bank.json` and the Core track from docs/05
- `npm run check:guardrails [url]` — send the 20 sample questions to the live AI and check none gets its own answer (real AI calls)

## Documentation (read in this order)
1. `docs/01-product-spec.md` — what we build and why, requirements with acceptance criteria
2. `docs/02-architecture.md` — technical design, data model, offline, sync, security
3. `docs/03-ai-design.md` — AI modes, guardrails, prompts, limits, caching, own-key mode
4. `docs/04-content-model.md` — topic file format, generators, mistake codes, resources, content workflow
5. `docs/05-topic-bank.md` — the 113 topics with IDs and prerequisites
6. `docs/06-tracks.md` — track format, Core/Azerbaijan/LSE/Cambridge/MIT draft mappings, custom tracks
7. `docs/07-ux-design.md` — screens, design tokens, interaction rules
8. `docs/08-roadmap.md` — phases, scope and acceptance criteria
9. `docs/09-open-source.md` — licences, GitHub setup, CI, contribution flow
10. `docs/10-groq-key-guide.md` — in-app text for the "use your own key" feature
11. `docs/decisions.md` — decision log (why things are the way they are)

Golden example of a finished topic: `content/topics/C107-elasticity.md`. Match its structure.

## Parallel sessions
Two Claude Code sessions may work in this folder at the same time. Each one stages only its own paths (`git add <paths>`, never `git add -A` or `git add .`) and runs `git pull --rebase` before pushing.

- **Content session** writes topics in topic-bank order (docs/05-topic-bank.md: F01, F02, … F10, then FM01…, then C101…; skip topics that already exist). It owns `content/topics/`, `content/working.json` (the topics it is writing now; the app shows them as "Writing"), `content/glossary.yml`, `packages/core/src/generators/` (including `index.ts` and tests) and `apps/web/src/widgets/` (register new widgets in `widgets/index.ts`). One topic per commit, `npm test` and `npm run validate:content` green before each push.
- **App session** builds Phase 1 features (practice, progress, tracks, AI). It owns everything else and does not edit the content session's paths; if it needs a change there, it says so instead.
- A topic appears in the app as soon as its file compiles; no app code needs to change.

## Working style
- Work one phase at a time (`docs/08-roadmap.md`). At the end of a session, report each acceptance criterion as done / not done.
- Small commits with clear messages.
- If unsure about a maths fact, write a verification script rather than guessing.
- Ask the owner before adding any dependency or service that needs an account or has a paid tier.
- When a decision in `docs/` turns out to be wrong, propose the change and record it in `docs/decisions.md`; do not silently deviate.

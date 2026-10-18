# Maths for Economics — project guide for Claude Code

## What this is
A free, open-source, offline-first app (PWA first, Expo native app later) that teaches the mathematics used in university economics degrees, from first year to final year. App language: English only.

Curriculum model: one shared **topic bank** + **university tracks** (Core, LSE, Cambridge, MIT) + **custom tracks** that a user imports privately.

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
- Hosting: Cloudflare Pages (web) and Workers (proxy). CI: GitHub Actions.

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

## Commands (create in Phase 0)
- `npm run dev` — web app locally
- `npm run dev:proxy` — Worker locally (wrangler)
- `npm test` — unit + property tests
- `npm run validate:content` — schema check, `verify` blocks, prerequisite graph has no cycles
- `npm run build` — production build

## Documentation (read in this order)
1. `docs/01-product-spec.md` — what we build and why, requirements with acceptance criteria
2. `docs/02-architecture.md` — technical design, data model, offline, sync, security
3. `docs/03-ai-design.md` — AI modes, guardrails, prompts, limits, caching, own-key mode
4. `docs/04-content-model.md` — topic file format, generators, mistake codes, resources, content workflow
5. `docs/05-topic-bank.md` — the 102 topics with IDs and prerequisites
6. `docs/06-tracks.md` — track format, Core/LSE/Cambridge/MIT draft mappings, custom tracks
7. `docs/07-ux-design.md` — screens, design tokens, interaction rules
8. `docs/08-roadmap.md` — phases, scope and acceptance criteria
9. `docs/09-open-source.md` — licences, GitHub setup, CI, contribution flow
10. `docs/10-groq-key-guide.md` — in-app text for the "use your own key" feature
11. `docs/decisions.md` — decision log (why things are the way they are)

Golden example of a finished topic: `content/topics/C107-elasticity.md`. Match its structure.

## Working style
- Work one phase at a time (`docs/08-roadmap.md`). At the end of a session, report each acceptance criterion as done / not done.
- Small commits with clear messages.
- If unsure about a maths fact, write a verification script rather than guessing.
- Ask the owner before adding any dependency or service that needs an account or has a paid tier.
- When a decision in `docs/` turns out to be wrong, propose the change and record it in `docs/decisions.md`; do not silently deviate.

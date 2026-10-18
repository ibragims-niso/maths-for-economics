# 08 — Roadmap

Rule: finish and check a phase's acceptance criteria before starting the next. One phase may take several Claude Code sessions.

## Phase 0 — Setup (≈ 1 week) — done 2026-10-18
Scope: monorepo, TypeScript, lint/format, Vitest, CI, Cloudflare web hosting + Worker "hello world", `content/topic-bank.json` from docs/05, schema validation, licences, README.
Acceptance:
- [x] `npm run dev`, `npm test`, `npm run validate:content`, `npm run build` work
- [x] CI runs on every push and is green
- [x] Web app reachable on a Cloudflare URL and installable on a phone (Add to Home Screen) — https://maths-for-economics.ibragim-n.workers.dev, installed and opened offline by the owner
- [x] Worker deployed; `GROQ_API_KEY` set as a secret; no key anywhere in the repo
- [x] Topic bank JSON validated: 113 topics (102 at setup + 11 added for the Azerbaijan track, D31), unique IDs, no prerequisite cycles

## Phase 1 — Prototype (≈ 3 weeks)
Scope: 5 topics fully built — F04 Linear functions in economics, F05 Market equilibrium, FM01 Simple and compound interest, C107 Elasticity, C109 Optimisation in one variable. 2 generators per topic, 2 widgets, topic page, test builder/runner/results, local progress and mastery, AI modes through the proxy with guardrails and limits, offline.
Acceptance:
- [x] All 5 topics pass `validate:content` (verify blocks) and render on a phone
- [x] 10 generators with property tests (1,000 seeds each)
- [x] Timed test works end to end; AI hidden during the test; results show offline mistake explanations
- [x] Pasting a homework problem in "Ask" never returns its numeric answer; returns method + analog (test with 20 sample prompts, store them in `apps/proxy/test/guardrail-prompts.json`) — `npm run check:guardrails`: 20 of 20 on 2026-10-18
- [x] Airplane mode: everything except AI works — checked on the live site in a browser with the network off: Learn, a topic with maths, a full test, results, Progress, Settings, About; AI says it needs internet (11 of 11, 2026-10-18)
- [ ] The primary user has used it for one week and his feedback is logged as GitHub issues

## Phase 2 — Year 1 Core complete (≈ 2–3 months, in step with the semester)
Scope: all 49 Year-1 topics and the Azerbaijan national track (verified against 3+ universities' syllabi), review queue, progress screen, mentor link (D1 sync + mentor view), own-key mode, resources with link checking, custom-track import, formula sheet, Playwright tests for key flows.
Acceptance:
- [ ] 49 topics at status `reviewed` or better
- [ ] `az-050405` track `verified`
- [x] Mentor link shows the student's progress within 1 minute of a change (when online); disabling sharing deletes server data — the phone sends 8 s after a change; checked on the live API 2026-10-18
- [x] Own key verified, used and removable
- [x] BBU programme available on the student's phone: covered by the Azerbaijan track `az-050405`, built from BBU's 050405 programme, first in the programme list (D38)
- [x] Weekly link check runs in CI

## Phase 3 — Public tracks and Year 2 (≈ 3 months)
Scope: verify and publish LSE, Cambridge, MIT tracks; all 23 Year-2 topics; contribution templates; public launch on GitHub.
Acceptance:
- [ ] Three tracks `verified` with sources and dates
- [ ] 72 topics `reviewed` or better
- [ ] README and CONTRIBUTING allow an outside contributor to add a resource or fix a topic

## Phase 4 — Years 3–4 and native app
Scope: remaining 41 topics; exam mode; Expo app reusing `packages/core`; Google Play first, App Store later.

## Rough effort
App code is the smaller part. Content writing and checking is the larger part: about 1–2 hours of human review per topic (≈ 100–200 hours in total), spread over the student's study years.

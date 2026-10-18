---
target: home screen (apps/web/src/App.tsx)
total_score: 19
max_score: 32
na_heuristics: 3,5
p0_count: 0
p1_count: 2
target_identity: "file:F:\\Dev Projects\\maths-for-economics\\apps\\web\\src\\App.tsx"
target_fingerprint: "sha256:36c55fcce0c90d5137815af8cd74845b13b8deb7e35ede8bd70419b159a2b354"
target_path: "F:\\Dev Projects\\maths-for-economics\\apps\\web\\src\\App.tsx"
timestamp: 2026-10-18T14-39-28Z
slug: apps-web-src-app-tsx
closed: true
---
Method: dual-agent (A: independent design review · B: detector + browser evidence)

# Critique: home screen (Phase 0) — apps/web/src/App.tsx (+ EquilibriumChart.tsx, styles.css)
Mode: Operate (app screen) with a first-impression role.

## Design health score
| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 3 | Live saving/saved/offline line with role=status; no failure state; can claim a saved copy that does not exist |
| 2 | Match system / real world | 3 | Economist's axis convention right; "next phase" is roadmap jargon; P and Q never named price/quantity |
| 3 | User control and freedom | n/a | No actions or state on this screen |
| 4 | Consistency and standards | 3 | Tokens exact; italic variables in chart vs roman in caption; h1/h2 ask 700, only 400/600 bundled |
| 5 | Error prevention | n/a | No inputs |
| 6 | Recognition rather than recall | 3 | S/D/P/Q and two equations unexplained; caption words not colour-linked to lines |
| 7 | Flexibility and efficiency | 1 | The one accelerator (install to home screen) is never offered |
| 8 | Aesthetic and minimalist design | 3 | Calm; five-number sentence and licence line add noise; chart is 42% of viewport at 1280px |
| 9 | Error recovery | 2 | No path when the service worker cannot save: "Saving…" forever |
| 10 | Help and documentation | 1 | Nothing on how to install or what comes when; only a developer-facing GitHub link |
| **Total** | | **19/32** | **59% — Acceptable** (n/a: 3, 5) |

## Design specificity verdict
LLM: specific at component level (exact tokens both themes, economist's axes, chart and caption from the same constants, favicon repeats the diagram). Generic in structure: title → lead → hero → status card → footer "coming soon" template. Boldness spent on the S/D cross instead of the curriculum map the brief reserves it for; the topic-bank data for the map is already imported but used only for one sentence.
Deterministic scan: 0 findings (source, dist, URL scans at 1280 and 375px); positive control on a bad page produced findings, so the pass is real. Missed by the detector, found by both reviews: equilibrium contrast 2.21:1 light, header/footer inside main, synthesised italic. Detector has no dark-theme scan; unclear whether it checks SVG text. Grid/card border 1.20:1 treated as intentional ("faint grid" per brief, non-interactive).
Visual overlays: not available (no script-injecting browser tool); detector URL mode and headless Edge screenshots used instead.

## Overall impression
Strong tokens, type and maths fidelity. The screen speaks to the project ("In development", "next phase", licences, GitHub) instead of the student and offers no action. Biggest opportunity: make "it works offline / install it" the hero and replace the S/D hero with a first look at the curriculum map.

## What's working
1. Token discipline and dark mode; all text contrasts pass (ink 14.8/15.1, muted 6.6/8.9, link 5.3/7.0).
2. Maths fidelity visible; direct S/D labels survive colour-blindness.
3. Honest offline copy and precached fonts; status announced via live region.

## Priority issues
- [P1] Offline status can be stuck or false (no onRegisterError; offline branch claims a saved copy even when unsaved). Fix: five states, error handler + ~20 s timeout, "could not save" copy, distinct offline dot. Command: harden
- [P1] No next step and no install guidance (iOS shows no prompt). Fix: install card (beforeinstallprompt button ≥44px, iOS one-liner, hidden in standalone), concrete "first five topics" copy. Command: onboard
- [P2] Boldness on the wrong element; Learn home not set up. Fix: static curriculum-map preview (102 points, one column per year, faint prerequisite lines), space/text tokens, room for future tab bar + safe area. Command: shape, then bolder (map only)
- [P2] Chart accessibility and maths typography: equilibrium point/guides 2.21:1 light; title+caption read together then caption again; synthesised italic while Literata italic is precached and unused; header/footer inside main. Fix: ink stroke on point, darker equilibrium shade #9A7300 for guides (record decision), label with chart-title only, Literata italic + <var>, axis marks 25/50, clearer caption, move header/footer out of main. Command: typeset + harden
- [P3] Hierarchy and first-screen noise: status 13px muted → 15px ink; licence line to About; cap chart width on desktop; explicit font-weight 600. Command: polish / distill

## Persona red flags
Jordan: "In development"/"next phase" with nothing to tap; P/Q/S/D unexplained; CC BY-NC-SA meaningless; no install hint.
Casey: only tap target is a 107×15px GitHub link that needs network; "Saving…" can stick; 13px muted status; white splash in dark mode.
Sam: chart name/caption read twice; equilibrium 2.21:1; no banner/contentinfo landmarks; px sizes ignore user font size; S/D differ by hue only (labels save it; future map must not rely on colour alone).

## Minor observations
Favicon reads as "×" at small size; pending dot invisible (1.20:1); line breaks "CC BY-NC-SA / 4.0" and "44 / in year 1" need nbsp; no apple status-bar meta with viewport-fit=cover; blank page until JS loads; autoUpdate reload must become prompt in Phase 1.

## Questions to consider
- If the curriculum map is the one bold thing, why is the first thing every student sees a picture they know from school?
- Is this screen for the student or for the project?
- Should "works without internet" be the hero of Phase 0?

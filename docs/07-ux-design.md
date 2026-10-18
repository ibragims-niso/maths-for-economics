# 07 — UX and visual design

## Design direction: "Balance sheet" (chosen by the owner, 2026-10-18)
The app should feel like a modern finance app, which suits economists. Your progress reads like an account balance: a big number of topics mastered and a curve of how it grows. The topics you study sit in a dark sheet below, like a list of transactions. There is colour, depth and gloss: a violet gradient, glossy 3D icons, and frosted glass on floating controls. This replaces the earlier "graph paper and curves" direction (decision D29). The mockups the owner chose from are in `.impeccable/mocks/decision/`; variant B was chosen.

**Signature element:** the balance header. It shows "Topics mastered N / total" for the current track and year, with the mastery curve under it. It changes as the student masters topics. Spend boldness here and on the 3D icons; keep the rest clean.

## Tokens
Colours (light). Every text pairing meets WCAG AA:
| Token | Hex | Use |
|---|---|---|
| `paper` | `#FFFFFF` | top area, cards on light |
| `ground` | `#F5F4FA` | segmented control track, inputs, light chips |
| `ink` | `#18171F` | text on light |
| `muted` | `#6F6C86` | secondary text on light (5.0:1) |
| `violet` | `#6246EA` | links and accent text on light (5.9:1) |
| `gradient` | `#5B3FE6 → #7B5CF0` | primary buttons, active pill; white text ≥ 4.5:1 at every point |
| `night` | `#1D1D26` | bottom sheet, tab bar, drawer |
| `night-text` | `#F4F3FB` | text on night |
| `night-muted` | `#A9A6C4` | secondary text on night (7.1:1) |
| `lilac` | `#B88CFF` | links and accent on night (6.6:1) |
| `gold` | `#F5C04A` | "soon / being written" status, highlights on night |
| `danger` | `#D12D55` on light, `#FF6B81` on night | wrong answers, errors |
| `success` | `#2FD182` on night | correct answers, mastered |

Dark mode: the top area becomes `#121218` with `night-text`, the sheet stays `night`, accents unchanged. Follow `prefers-color-scheme`, with a manual override in Settings.

Typography: **Poppins** (bundled, Latin subset). Scale 13 / 15 / 17 / 21 / 28, plus 44 for the balance number. Weights 400 / 500 / 600 / 700. Maths in KaTeX. Sentence case everywhere. Never use gradient text; emphasis comes from weight and size.

Shapes and depth: radius 14 px (controls), 18 px (rows and cards), 30 px (top of the sheet). Soft shadows with an offset, never zero-offset glows as decoration. Glass (blur 20 px, translucent `night`) only on floating layers: the tab bar, the drawer, overlays.

3D icons: from the open **3dicons** set (CC0, gradient style), one per block or section. Examples: notebook (Learn, foundations), chart (functions, calculus), target (equilibrium, tests), money bag (financial maths), calculator (Practice), trophy (mastery), bulb (AI help). They are bundled as small WebP files and credited in About.

## Motion
Light and quick. It always responds to the student, never plays on its own.
- Page and tab changes: cross-fade with a short rise (220 ms, ease-out), using the View Transitions API where available.
- The segmented control's active pill slides between options (200 ms).
- The bottom sheet rises into place on first load (320 ms). The mastery curve draws itself once.
- Topic changes and the Progress screen use the same transition grammar.
- `prefers-reduced-motion`: every animation is off; the state changes instantly.

## Navigation
- **Bottom tab bar** (glass, `night`): Learn, Practice, Progress, Settings. Labels are always visible.
- **Menu drawer** from the top-right button, for secondary destinations: Home, About, Source code, Report a problem (decision D28).
- About opens with the curriculum map as a small emblem left of the title, like an icon: all topics as points with prerequisite links, years 1–4 left to right, written topics in gold (owner's requests, 2026-10-18).

## Screens
**Learn (home)**
- Top: brand, Menu.
- Balance header: topics mastered N / total, the year segmented control (Year 1–4), the mastery curve.
- Dark sheet: the selected year's topics as rows. Each row has a 3D icon tile, the title, its economic use and its status (soon, new, learning, mastered).
- "Keep it on your phone" (offline status and install) as a compact card in the sheet until the app is installed.

**Topic page** (Phase 1): header with a 3D icon, title, time and mastery. Sections: Why economists need this, Intuition, Definitions, Interactive, Worked examples (each step has "Why?"), Practise, Real world. A floating "Ask" button opens the AI sheet. "Report an error" sits at the bottom.

**Practice**: test builder (topics, difficulty, number of questions, time limit shown) → test runner (question, numeric keypad, timer, progress dots, no AI) → results (score, time, mistakes with offline explanations, "Explain more", "Practise again").

**Progress**: completion per year and course, topic list with state and next review, weak areas, test history.

**Settings**: My programme (choose Core, LSE, Cambridge or MIT, each marked as an unofficial draft until verified; import a custom track), AI (usage left, own key), mentor sharing, appearance, data (export, reset), About.

**Mentor view (`/m/:token`)**: read-only progress summary.

## Accessibility
- WCAG AA contrast (see tokens), visible focus rings, tap targets of at least 44 px.
- All chart information is also given as text.
- Text sizes in rem so they follow the reader's settings.
- Reduced motion is respected (see Motion).

## Copy rules
- Plain verbs; buttons say what happens: "Start test", "Check answer", "Explain this step".
- Errors say what happened and what to do: "No internet. AI help needs a connection; everything else works offline."
- Empty states invite action: "No tests yet. Build your first one from topics you've read."
- AI limit reached: "You've used today's free AI questions. They reset at midnight, or add your own free key in Settings."

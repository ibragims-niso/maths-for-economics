# 07 — UX and visual design

## Design direction: "graph paper and curves"
The subject is the economist's diagram: axes, a demand curve crossing a supply curve, an equilibrium point. The app should feel like a clean sheet of graph paper on which these curves come alive. Calm, readable, made for long study sessions on a phone.

**Signature element (spend boldness here only):** the *curriculum map* — topics drawn as points on a faint grid, connected by prerequisite lines like curves on a chart, coloured by mastery. Everything else stays quiet.

## Tokens
Colours (light):
| Token | Hex | Use |
|---|---|---|
| `paper` | `#FBFCFD` | background |
| `grid` | `#E3E8EF` | faint grid lines, dividers |
| `ink` | `#1B2638` | text, axes |
| `supply` | `#0F766E` | primary actions, "mastered", supply curves |
| `demand` | `#B4235A` | wrong answers, demand curves, timer < 1 min |
| `equilibrium` | `#D9A400` | highlights, "learning" state, intersection points |

Dark: `paper #0F1722`, `grid #233044`, `ink #E6ECF3`, `supply #2DB3A6`, `demand #E0668F`, `equilibrium #F0C239`. Implement as CSS variables on `:root` with `prefers-color-scheme: dark` and a manual override in Settings.

Typography:
- Reading text: **Literata** (designed for long on-screen reading), 17 px / 1.6 line height on phones, max 70 characters per line.
- Interface: **Public Sans**, 15 px base; scale 13 / 15 / 17 / 21 / 28.
- Maths: KaTeX fonts.
- Sentence case everywhere. No all-caps labels.

Shapes: 6 px radius for inputs and buttons, 10 px for sheets; no decorative shadows or gradients; separation by spacing and the grid colour.

Motion: only in response to actions (sheet opens, answer checked, slider moves the curve). Respect `prefers-reduced-motion`.

Accessibility: WCAG AA contrast, visible focus, all graph information also given as text (e.g. "Equilibrium at P = 25, Q = 50"), tap targets ≥ 44 px.

## Navigation
Bottom bar with four tabs: Learn, Practice, Progress, Settings.

## Screens
**Learn (home)**
- "Continue" card: last topic and section.
- "Due for review" list (from spaced repetition), max 3 shown.
- Curriculum map of the current track, year selector at the top. Tap a point → topic page.

**Topic page**
- Header: title, a small live graph of the topic's key function, estimated time, mastery state.
- Tabs or anchored sections: Learn, Examples, Practise, Real world.
- Every worked-example step has a "Why?" button (AI `EXPLAIN_STEP`; offline: shows the step's `why` text).
- Floating "Ask" button opens the AI sheet: suggested prompts (Explain simply, Real-world use, Show another example) and a text field (500 characters).
- "Report an error" at the bottom and in each problem's menu.

**Practice**
- Test builder: choose topics (by year/course or from weak list), difficulty, number of questions. Shows the time limit before starting.
- Test runner: question, answer field (numeric keypad with `.` `-` `/`), timer, progress dots, no AI, no hints. Leaving the screen asks for confirmation.
- Results: score, time, per-question list. Wrong items show the detected mistake and its offline explanation, then "Explain more" (AI) and "Practise this again".

**Progress**
- Completion % per year and per course of the current track (mastered vs read).
- Topic list with state, last score, next review date.
- Weak areas (lowest recent scores).
- Test history; any test reopens with its exact problems (regenerated from seeds).

**Settings**
- My programme: choose track, import custom track, see disclaimer.
- AI: usage left today, use your own key (guide, Verify, Remove).
- Share with a mentor: on/off, copy link, regenerate link.
- Appearance: system / light / dark.
- Data: export progress (JSON), reset.
- About: licences, GitHub link, content version.

**Mentor view (`/m/:token`)**
- Read-only, no install needed. Completion by year and course, mastered/learning/not started counts, last 10 tests with scores, weak topics, last activity date.

## Copy rules
- Plain verbs; buttons say what happens: "Start test", "Check answer", "Explain this step".
- Errors say what happened and what to do: "No internet. AI help needs a connection; everything else works offline."
- Empty states invite action: "No tests yet. Build your first one from topics you've read."
- AI limit reached: "You've used today's free AI questions. They reset at midnight, or add your own free key in Settings."

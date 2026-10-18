---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: ["src/HomePage.tsx","src/AboutPage.tsx"]
---

# Home screen (Learn) and app shell

- **Job and audience:** a first-year economics student on a phone, often offline and interrupted. Mode: Operate. They should see at a glance how much of their degree they have mastered, pick a year, and open a topic.
- **Direction:** redesign, owner-pinned ("Balance sheet", mockup B in .impeccable/mocks/decision/b-balance-sheet.html; docs/07). The old graph-paper look is retired; the curriculum map survives only at the top of About (owner's request).
- **States:** offline status (5 states) and install (4 kinds) carry over. Topic rows show "Soon" until topics exist. Practice, Progress and Settings have empty states until Phase 1 fills them.
- **Boundaries:** standard controls only (tabs, segmented control, list rows, buttons). AA contrast with the docs/07 tokens. 44 px targets. Reduced motion respected.

## Direction contract
THESIS: Progress reads as an account balance. The degree's maths is a balance you grow, not a syllabus you scroll. This refuses the category default of a plain list of course cards.
OWN-WORLD: White top, near-black #1D1D26 sheet with a 30 px rounded top, violet gradient #5B3FE6→#7B5CF0 for the active pill and primary buttons, lilac #B88CFF accents on dark, gold #F5C04A for "soon". Glossy CC0 3D gradient icons sit in rounded tiles. The glass tab bar is translucent night with blur. Poppins throughout.
STORY: The student sees "Topics mastered 0 / 44" for their year, understands they start at zero, switches years, scans the topics with their economic uses, keeps the app on their phone, and comes back to watch the number grow.
FIRST VIEWPORT: Top bar (brand left, Menu right). Centred balance: label, 44 px number "0 / 44". Year segmented control. Mastery curve with a "You start here" tooltip. Below the fold line, the dark sheet with a handle, "Year 1 topics" and the first three rows. The tab bar is fixed at the bottom.
FORM: Finance-app balance sheet; direction B of three owner-reviewed mockups (1st of 1 pinned).
seed: none (unavailable)
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

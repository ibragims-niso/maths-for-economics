---
version: 1
slug: "apps-web-src-app-tsx"
primary_target: "apps/web/src/App.tsx"
related_targets: []
---

# Home screen (Learn, Phase 0)

- **Job and audience:** a first-year economics student opens the app on a phone, often offline and often interrupted. Mode: Operate, with a first-impression role. Within seconds they should see that this is the maths of their whole degree, that it works without internet, and how to keep it on the home screen.
- **Direction:** inherits the established world in docs/07 ("graph paper and curves"); no new identity. The curriculum map is the focal moment: 102 topics as points on the graph-paper grid, one column per block, blocks grouped into four year bands, prerequisite links drawn as curves. The five topics being written are marked in equilibrium gold (filled) against hollow "planned" points, so state is carried by shape as well as colour. The supply and demand chart becomes a small illustration inside "First topics".
- **Sequence:** title and lead → curriculum map (the peak) → "Keep it on your phone" (offline status and install guidance) → "First topics" with the small chart → a one-line footer.
- **States and ranges:** offline status has five states (saving, slow, saved, failed, offline without a copy); install has four (installed, browser prompt, iOS steps, menu steps). Map: 102 topics, 139 prerequisite links, 3 to 16 topics per block. Later, mastery colours (not started, learning, mastered) must also differ by shape.
- **Boundaries:** the map is static in Phase 0. Tapping a topic and the year selector arrive in Phase 1 with real topics. The full topic list is available as text for screen readers and for browsing. No colours or fonts beyond the docs/07 tokens, except one derived token, `--equilibrium-ink`, for thin gold lines on paper. Tap targets 44 px or more.

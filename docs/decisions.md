# Decision log

| # | Decision | Reason |
|---|---|---|
| D1 | Free, non-commercial, open source on GitHub | Help students; enables CC BY-NC-SA sources; community error reports |
| D2 | App language English only (structure ready for i18n) | Primary user's need; halves content review effort |
| D3 | One topic bank + university tracks ("Variant C") | No duplicated content; progress survives track switching; new tracks are cheap |
| D4 | Public tracks: Core (default), LSE, Cambridge, MIT | Three different teaching models, all with public course information |
| D5 | Owner's university (BBU) as a private custom track | Personal need; not appropriate in the universal app |
| D6 | Generators compute answers; AI never does | LLM arithmetic is unreliable; answers must always be correct |
| D7 | AI never solves user problems; gives method + analog | Learning over homework solving |
| D8 | AI disabled during tests | Test integrity |
| D9 | Groq as default provider, behind a provider interface | Fast, free tier; easy to switch |
| D10 | Shared key behind a Cloudflare Worker proxy; never in the app | Key safety, rate limits, shared cache |
| D11 | Cost controls: shared cache, offline mistake explanations, daily limits, own-key option | Zero running cost at small scale |
| D12 | Offline-first PWA, then Expo | Fastest path to the primary user; store release later |
| D13 | Mastery = last 3 scores ≥ 80 % | One lucky result should not count as mastery |
| D14 | Mentor link is opt-in, anonymous, read-only | Parent wants to follow progress; privacy by default |
| D15 | AI may cite only verified resource URLs | LLMs invent links |
| D16 | Build in Claude Code; plan and map syllabi in Claude chat | Code and content verification need a real repo and test runs |
| D17 | Biome for linting and formatting (instead of ESLint + Prettier) | One tool and one config file; fewer dependencies to keep up to date |
| D18 | Fonts (Literata, Public Sans) are bundled with the app via Fontsource, Latin subset only | Google Fonts would not load offline; the app is English-only |
| D19 | Core track is `verified`, dated 2026-10-18 | Core is defined as the docs/05 order; `validate:content` checks it lists every topic and respects prerequisites |
| D20 | `validate:content` checks that `content/topic-bank.json` matches the table in docs/05 | The two copies cannot drift apart; a topic change must update both |
| D21 | Dependencies are pinned to exact versions | Builds are reproducible; upgrades are deliberate and tested |
| D22 | Secret scanning in CI runs the pinned gitleaks binary, not a third-party action | No licence key needed and no extra code with access to the repo |
| D23 | Repository: github.com/ibragims-niso/maths-for-economics (personal account) | Chosen by the owner |

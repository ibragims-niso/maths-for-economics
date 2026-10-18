# Decision log

| # | Decision | Reason |
|---|---|---|
| D1 | Free, non-commercial, open source on GitHub | Help students; enables CC BY-NC-SA sources; community error reports |
| D2 | App language English only (structure ready for i18n) | Primary user's need; halves content review effort |
| D3 | One topic bank + university tracks ("Variant C") | No duplicated content; progress survives track switching; new tracks are cheap |
| D4 | Public tracks: Core (default), Azerbaijan national 050405, LSE, Cambridge, MIT | Local national programme plus three international teaching models, all with public course information |
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
| D24 | Extra colour token `--equilibrium-ink` (#9A7300 light, #F0C239 dark) for thin gold lines and rings | `equilibrium` #D9A400 is 2.21:1 on light paper, below the 3:1 needed for graphics |
| D25 | Web app hosted as Cloudflare Workers static assets (root `wrangler.jsonc`), not Cloudflare Pages | Cloudflare's Git import now creates a Worker; an explicit config skips its auto-detection, which fails at a workspace root |
| D26 | Proxy deployed by Workers Builds too (deploy command `npx wrangler deploy --config apps/proxy/wrangler.jsonc`); the GitHub Actions deploy workflow is removed | One deploy mechanism for both Workers, and no Cloudflare API token stored in GitHub. Superseded by D27 |
| D27 | One Worker serves both the app (static assets) and the API (`/api/*`, code in `apps/proxy`) | Simpler for the owner (one Worker, one secret, one deploy); same origin removes CORS setup and keeps other sites from using the API |
| D28 | A Menu drawer (top right) for secondary destinations, including an About page; the four main sections stay a bottom tab bar from Phase 1 | Owner asked for a drawer with About. Frequent actions stay in thumb reach at the bottom; rare ones live in the drawer |
| D29 | New visual direction "Balance sheet" (finance-app style: violet gradient, glossy 3D icons, dark bottom sheet, glass tab bar, light transitions) replaces "graph paper and curves"; Poppins replaces Literata and Public Sans; 3D icons from the CC0 3dicons set | The owner found the first design empty, pale and confusing, and chose mockup B of three |
| D30 | International tracks (Core, LSE, Cambridge, MIT) selectable in the app from Phase 1, labelled as unofficial drafts until verified in Phase 3; the owner's private BBU track is postponed | The owner's decision; the only BBU document available has no semester order |
| D31 | Azerbaijan track built from the Ministry-approved 050405 programme (subjects, credits) plus university learning outcomes and syllabi (topic headings); 11 topics added to the bank (marked † in docs/05) | National programme fixes subjects but not topic lists; universities publish the details |
| D32 | Track courses may have `sections`, `credits` and `supporting`; `semester` may be a season or "varies"; a course may be background only (just `supporting`) | National syllabi are organised by headings within a course; semester placement varies by university |

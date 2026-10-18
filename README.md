# Maths for Economics

A free, open-source, offline-first app that teaches the mathematics of an economics degree, from first year to final year.

- Every topic explained through how economists use it
- Unlimited practice with answers computed and checked by code
- Timed self-tests with explanations of your mistakes
- An AI tutor that explains, but does not do your homework
- Follows your programme: Core, or tracks modeled on LSE, Cambridge and MIT, or your own imported track
- Progress you can share with a parent or tutor, if you choose

Status: in development (Phase 0, setup). See [docs/08-roadmap.md](docs/08-roadmap.md).

## Run it on your computer

You need [Node.js](https://nodejs.org) 24 or newer and Git.

```sh
git clone https://github.com/ibragims-niso/maths-for-economics.git
cd maths-for-economics
npm install
npm run dev
```

Then open http://localhost:5173.

| Command | What it does |
|---|---|
| `npm run dev` | Start the web app locally |
| `npm run dev:proxy` | Run the Cloudflare Worker (built app + API) locally on port 8790; copy `.dev.vars.example` to `.dev.vars` first. `npm run dev` forwards `/api` to it |
| `npm test` | Unit and property-based tests |
| `npm run validate:content` | Check all content: schemas, `verify` blocks, prerequisite graph |
| `npm run validate:track <file>` | Check one track file, e.g. a private one in `local/tracks/` |
| `npm run lint` / `npm run format` | Check / fix code style (Biome) |
| `npm run typecheck` | TypeScript type check |
| `npm run build` | Validate content, then build the web app into `apps/web/dist` |

## Repository layout

```
apps/web/        the app (React + Vite PWA)
apps/proxy/      the API (AI proxy, cache, mentor sync), served by the same Worker under /api
packages/core/   shared logic: content schemas and checks (generators, grading, mastery to come)
scripts/         content validation commands
content/         topics, topic bank, tracks, glossary
docs/            specification
```

## Licences

Code: MIT ([LICENSE](LICENSE)). Content in `content/`: CC BY-NC-SA 4.0 ([content/LICENSE](content/LICENSE)). University tracks are unofficial and not endorsed by the universities.

## For developers

Start with [CLAUDE.md](CLAUDE.md), then [docs/](docs/).

# 09 — Open source setup

## Licences
- Code: MIT (`LICENSE`).
- Content (`content/**`): CC BY-NC-SA 4.0 (`content/LICENSE`). Compatible with using MIT OpenCourseWare material for structure and ideas (also CC BY-NC-SA), provided attribution is given and the app stays non-commercial (no ads, no paid features).
- Attribution page in the app (Settings → About) lists sources.
- University names appear only as "Modeled on …" with the unofficial disclaimer.

## Repository hygiene
- `.gitignore` includes `local/`, `.dev.vars`, `.env*`, `.wrangler/`.
- Secret scanning: enable GitHub secret scanning and push protection; add `gitleaks` to CI.
- Branch protection on `main`: CI must pass.

## CI (GitHub Actions)
| Workflow | Trigger | Steps |
|---|---|---|
| `ci.yml` | push, pull request | install, lint, typecheck, unit + property tests, `validate:content`, build |
| `links.yml` | weekly + manual | lychee on all resource URLs; opens/updates an issue listing broken links |
| `deploy-proxy.yml` | push to `main` touching `apps/proxy/**` | `wrangler deploy` |
Cloudflare Workers Builds deploys the web app automatically from GitHub (root `wrangler.jsonc`).

## Contribution flow
- `README.md`: what the app is, screenshots, install link, how to run locally.
- `CONTRIBUTING.md`: how to fix a topic, add a resource, propose a topic, add a track; content rules (no copied text, verify blocks, sentence case, glossary terms).
- Issue templates: `content-error.yml` (pre-filled from the app: topic ID, template ID, seed, params, app version), `resource-suggestion.yml`, `new-track.yml`.
- Pull request template with a checklist: verify blocks pass, no copied text, sources listed.

## "Report an error" link format
`https://github.com/{owner}/{repo}/issues/new?template=content-error.yml&topic={id}&template_id={tid}&seed={seed}&version={v}`

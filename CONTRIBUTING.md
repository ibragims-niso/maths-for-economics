# Contributing

Thank you for helping students learn the maths of economics. You can help without writing code.

## Report an error
In the app, use **Report an error in this topic** (on a topic) or **Report a problem with this question** (after a test). The issue opens with the topic, question template and seed filled in, so we can rebuild the exact question. You can also open an issue by hand with the **Error in a topic or question** form.

## Suggest a resource
Use the **Suggest a resource** issue form. Resources must be free to read, stable and reliable (open textbooks, university course pages, official statistics). The app only links to resources listed in a topic file, and a weekly check (`npm run check:links`) opens every link.

## Fix or write a topic
Topics live in `content/topics/`, one Markdown file each. `content/topics/C107-elasticity.md` is the model to follow; `docs/04-content-model.md` explains every part.

Rules:
- **Your own words.** Never copy text from textbooks, lectures or exams. Topic structure may be reused; wording may not. Content is licensed CC BY-NC-SA 4.0.
- **Verified maths.** Every worked example ends with a `verify` block that the build checks.
- **Generators, not hand-written answers.** Practice questions come from generators in `packages/core/src/generators/`, each with property tests over 1,000 random seeds.
- **Mistakes are tagged.** In "Common mistakes", end each sentence with its code in brackets, e.g. "Dropping the minus sign (SIGN)." The app hides the codes.
- Sentence case for headings, terms as in `content/glossary.yml`, English only.

## Add a programme (track)
Tracks map a university programme onto the topic bank (`docs/05-topic-bank.md`); see `docs/06-tracks.md` for the format. Public tracks need public sources and are marked unofficial drafts until verified. You can also import a track privately in the app (Settings → Import your own programme) without sharing it.

## Run it locally
Needs Node.js 24.

```sh
npm ci
npm run dev               # the app at http://localhost:5173
npm test                  # unit and property tests
npm run validate:content  # topic files, verify blocks, tracks
npm run test:e2e          # key flows in a browser
```

Before a pull request: `npm run lint`, `npm run typecheck`, `npm test` and `npm run validate:content` must pass. CI runs them on every push.

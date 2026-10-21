# 04 — Content model

## Topic file
One file per topic: `content/topics/{ID}-{slug}.md`. Frontmatter (YAML) + body with fixed sections. Golden example: `content/topics/C107-elasticity.md`.

### Frontmatter schema
```yaml
id: C107                      # from docs/05-topic-bank.md, never reused
title: Elasticity
block: C1                     # F, FM, C1, LA1, ST1, MV, LA2, ST2, OP, DY, EM, GT, AN, DO, SP, NM
coreYear: 1
prerequisites: [C106]
estMinutes: 40
status: draft                 # draft → reviewed → verified
economicUses:                 # short phrases, used by REAL_WORLD mode
  - ...
searchTerms:                  # optional: other names students search for (syllabus headings, synonyms)
  - Concept of a univariate function
generators: [elasticity-linear-point, ...]   # IDs implemented in packages/core
widgets: [elasticity-slider]                 # IDs implemented in apps/web
mistakeCodes:                                 # every code any generator of this topic can return
  SIGN: { label: ..., explanation: ... }
resources:
  - { title: ..., url: ..., kind: textbook|course|article|data|video, verifiedAt: YYYY-MM-DD }
```

### Body sections (fixed order, level-2 headings)
1. `## Why economists need this` — 1–2 real situations, plain language.
2. `## Intuition` — the idea before the formalism.
3. `## Definition and formulas`
4. `## Interactive` — widget directives, e.g. `::widget{id="elasticity-slider"}`.
5. `## Worked examples` — exactly 3 (easy, medium, hard). Each step has a `why` line. Each example ends with a `verify` block.
6. `## Common mistakes` — tag each mistake with its code in brackets, e.g. "Dropping the minus sign (SIGN)." The build removes the codes, so students see only the sentence.
7. `## Practice` — lists generator IDs and difficulty; rendered as "Practise" button.
8. `## Real world` — longer applications; resources are rendered from frontmatter.

### `verify` block
A fenced block evaluated with math.js in `npm run validate:content`. Every `assert` must be true, otherwise CI fails.
````
```verify
a = 100; b = 2; P = 20
Q = a - b*P
e = -b*P/Q
assert abs(e - (-0.6667)) < 0.001
```
````

## Generators (`packages/core/generators/{topic}/{id}.ts`)
```ts
interface Generator<P> {
  id: string; topicId: string; difficulty: 1 | 2 | 3;
  params(rng: Rng): P;                    // valid, "nice" numbers; reject invalid draws
  stem(p: P): string;                     // template text with LaTeX
  answer(p: P): Answer;                   // { kind: 'numeric', value, tolerance, unit? } | { kind: 'choice', ... }
  steps(p: P): Step[];                    // { text, latex, why }
  distractors(p: P): { value: number; mistakeCode: string }[];
  timeSec: number;                        // suggested time
}
```
Rules:
- Deterministic for a given seed (seeded RNG).
- Numbers chosen so results are readable (integers or 2 decimals) and economically sensible (positive quantities and prices).
- Distractors must differ from the correct answer by more than the tolerance; duplicates removed.
- Property tests (fast-check, 1,000 seeds): answer finite; constraints hold; steps' final value equals answer; distractors distinct.
- Grading: numeric with tolerance (default: absolute 0.01 or 0.5 % relative, whichever is larger); user input accepts `.` and `,` decimals and simple fractions.

## Test composer
Input: topic IDs, difficulty (1–3 or mixed), number of items (5/10/15/20).
- Draw generators evenly across selected topics; no repeated template in a row.
- Time limit = sum of `timeSec` × difficulty factor (1.0 / 1.2 / 1.5), rounded up to the minute.
- If online and the daily limit allows, `CONTEXTUALIZE` stems (with the number check).

## Glossary (`content/glossary.yml`)
Canonical English terms and short definitions (e.g. *marginal cost*, *price elasticity of demand*, *shadow price*). Used by content and passed to AI prompts to keep wording consistent.

## Resources
- Only reputable sources: open textbooks (e.g. OpenStax), university open courseware, central bank and statistics office pages, IMF/World Bank/OECD data, well-known educational sites.
- Each resource is checked automatically before being added (URL resolves, page title relates to the topic) and again weekly in CI (lychee). Broken links open an issue automatically.
- The AI may cite only these URLs.

## Content workflow
1. Claude Code drafts the topic file from the template (no copied text).
2. Claude Code writes `verify` blocks and generators with tests; CI must pass.
3. Status `draft → reviewed` after a human reads it in the app (preview deployment).
4. `reviewed → verified` after one round of practice by a student with no unresolved error reports.

## Symbols
Every maths symbol used in a topic is explained in Help → Symbols, from `content/symbols.yml` (kept by the app session). `validate:content` warns when a topic uses a LaTeX symbol that has no entry there; the warning never blocks a topic.

## Search
Learn and Practice search a topic by its ID, title and `searchTerms` (strongest), economic uses, then its text and the track headings it sits under. Filler words (concept, definition, types …), plurals and one typo are forgiven, the topic text counts only when names and uses find nothing, and weak matches are hidden. When a syllabus names a topic differently, add that heading to `searchTerms`.

## Terms
In the app, the first mention of each glossary term (`content/glossary.yml`) in a section is coloured and can be tapped for its plain definition; Help → Terms lists them all. Single words of five letters or fewer, and a few everyday words, are not marked automatically: write `:term[set]{id="set"}` (or just `:term[isoquant]`) to mark one by hand.

# 06 — Tracks

## Concept
A track is an ordered selection of topic-bank topics, grouped into years and courses. Content is never duplicated per university. Progress belongs to topics, so switching track keeps everything.

## Track file schema (`*.track.json`)
```json
{
  "id": "lse",
  "name": "Modeled on LSE BSc Economics",
  "visibility": "public",              // "public" (in repo) or "custom" (imported by a user)
  "status": "draft-unverified",        // draft-unverified → verified (with verifiedAt)
  "verifiedAt": null,
  "disclaimer": "Unofficial. Modeled on publicly available course information. Not affiliated with or endorsed by the university.",
  "sources": [ { "title": "...", "url": "..." } ],
  "years": [
    { "year": 1, "label": "Year 1",
      "courses": [
        { "code": "MA100", "name": "Mathematical Methods", "semester": null,
          "topics": ["F01", "F03", "..."] }
      ] }
  ]
}
```
Optional course fields (decision D32):
```json
{ "code": "İF-04", "name": "...", "semester": "autumn", "credits": 8,
  "topics": ["..."],
  "sections": [ { "title": "heading shown in the app", "topics": ["..."] } ],
  "supporting": ["background topics shown separately"] }
```
- `semester`: a number, `"autumn"`, `"spring"`, `"varies"` or `null`.
- A course needs `topics`, `sections` or `supporting` (a background-only course, such as "Supporting: financial mathematics", counts nothing towards completion). Completion % counts `topics` and `sections` topics; `supporting` topics are shown but not counted. When `sections` exist, the course page lists topics under these headings.
- Sources may carry a `note`.

Validation: every topic ID exists; a topic may appear in more than one course or section; warn (not fail) if a topic appears before one of its prerequisites or twice in the same list. A public track should mention every bank topic at least once (a warning; an error for Core).

## Public tracks
Status of all mappings below: **draft — verify in Phase 3** against the current official course pages before marking `verified`. Course names and codes come from public course guides and regulations; detailed topic lists must be checked course by course.

### Core (default)
Years and order exactly as in docs/05-topic-bank.md.

### Azerbaijan: 050405 Economics (national programme, 4 years)
File: `content/tracks/az-050405.track.json` (draft). Everything in the app is in English, including course names; the national course codes (İF-04 …) are listed here for reference only (decision D33). Learn shows each course name above its sections, and each section as a group with an icon, like the blocks in Core.

How the national system is organised:
- The Ministry of Science and Education approves one education programme per specialty (050405 İqtisadiyyat: decision of 09.07.2020, F-393). It fixes the compulsory subjects, their credits and a short description; universities teaching 050405 build their programmes on it.
- Detailed learning outcomes and syllabi are set by each university's academic staff, and the programme requires syllabi to be public.
- Semester placement differs between universities.

Years in the app follow Baku Business University, where each maths course takes one year (decision D39): year 1 İF-04, year 2 İF-05, year 3 İF-07, year 4 İF-08 parts 1 (autumn) and 2 (spring), with electives and further study. Other universities teach some courses a year earlier (table below); the disclaimer says so.

Compulsory mathematical subjects and draft headings:
| Code | Course (credits) | Headings and topics |
|---|---|---|
| İF-04 | Xətti cəbr və riyazi analiz (8) | Linear systems, linear spaces, basis: LA101–LA105, LA201. Limits, e, continuity: F03, F07, F08, F10, C101. One-variable differentiation: C102–C111. Several variables, extrema: MV01, MV02, MV07. Indefinite integrals: C112, C115. Definite, improper, double integrals: C113, C114, C116, C118, MV13. Series, power series: C117 |
| İF-05 | Ehtimal nəzəriyyəsi və riyazi statistika (8) | Combinatorics, events: F09, ST102. Bayes, Bernoulli, Poisson, Laplace: ST102, ST104, ST105. Random variables: ST103–ST105. Two-dimensional variables: ST201. Chebyshev, law of large numbers: ST206, ST202. Random processes: SP01. Estimation, tests: ST203, ST204 |
| İF-07 | Statistika (10) | Grouping, averages, variation: ST101. Indices: ST106. Time series: ST107. Sampling: ST202, ST203. Correlation, regression: ST201, ST205 |
| İF-08 | Ekonometrika (10; often split into 1 and 2) | Part 1: LP, duality, transport, integer, nonlinear and dynamic programming, games: OP01–OP03, OP05, OP06, DO03, GT01, GT02, GT05. Part 2: regression, macro models, input–output, graphs and network planning, queueing systems, hypotheses, heteroskedasticity, time series: ST201, ST205, EM01, F11, LA103, LA106, OP07, SP05, ST204, EM03, EM04, EM06 |

"Beyond the national programme" holds the remaining bank topics (financial maths, deeper optimisation, dynamics, analysis) for finance electives and master's preparation.

The national syllabus places some topics before their bank prerequisites (for example integration methods before definite integrals). `validate:content` lists these as warnings, which is expected for this track.

Verification (Phase 2): compare with syllabi of at least three universities (for example UNEC, BBU, Azerbaijan University), confirm headings and typical semesters, then set `status: verified`.

Verification so far (2026-10-19):
| University | Source | İF-04 | İF-05 | İF-07 | İF-08 |
|---|---|---|---|---|---|
| Azerbaijan University (English programme; its language year left out) | study schedule PDF (track sources) | year 1 autumn | year 1 spring | year 2 | year 3 |
| Nakhchivan State University | 2020 study plan PDF (track sources) | year 1 autumn | year 2 autumn | year 2 spring | year 3 autumn |
| Azerbaijan State Agrarian University | 2024/25 self-assessment report: confirms the four courses and names, no semesters for them | — | — | — | — |
| Baku Business University | study schedule, as given by the owner (2026-10-19) | year 1 | year 2 | year 3 | year 4 |

All plans start with İF-04 in year 1 and keep the order İF-04, İF-05, İF-07, İF-08; they differ in how fast. With three universities' placements and the national programme's headings confirmed, the track is `verified` (2026-10-19), with BBU's years.

Note: the national track covers the owner's private BBU track almost entirely; the private track then only needs BBU's own semester plan (`local/tracks/bbu.track.json`: a copy of `az-050405` with each course's `semester` set; never committed).

### LSE (3-year UK model)
File: `content/tracks/lse.track.json` (draft). Checked against the 2026/27 programme regulations and course guides on 2026-10-19; links are in the track's `sources`.
| Year | Course | Topics | Note |
|---|---|---|---|
| 1 | MA100 Mathematical Methods (or MA108 Methods in Calculus and Linear Algebra) | C101–C116, LA101–LA105, LA201–LA203, MV01–MV09, DY01, DY03 | Course guide: matrices, rank, vector spaces, eigenvalues and diagonalisation, multivariable calculus, Lagrange, integration, differential and difference equations |
| 1 | ST109 Elementary Statistical Theory I | ST101–ST105 | Compulsory; ST102 is no longer core for Economics |
| 1 | EC1C1 Econometrics I | ST205 | OLS, standard errors, tests |
| 1 | ST110 Elementary Statistical Theory II (option) | ST201–ST204 | Background (not counted) |
| 2 | EC2C1 Econometrics II | EM01–EM05 | Replaces EC221: OLS, IV, maximum likelihood, asymptotics |
| 3 | MA221 / MA222 Further Mathematical Methods (option) | LA204, MV13, DY02, DY04–DY06 | MA212 no longer runs |
| 3 | MA208 / MA209 / MA203 (options) | OP01–OP04, AN01–AN05 | Background; need MA102 or MA103 first |

### Cambridge (3-year UK model, "Tripos")
File: `content/tracks/cambridge.track.json` (draft). Paper numbers checked on 2026-10-19 from the course page and the Statutes and Ordinances; the Faculty's paper outlines refuse automated access, so topic lists stay unverified.
| Year | Paper | Topics (draft) | Note |
|---|---|---|---|
| 1 (Part I) | Paper 3 Quantitative Methods in Economics | F01–F10, FM01–FM06, C101–C114, LA101–LA103, ST101–ST105, ST201–ST204 | Compulsory |
| 2 (Part IIA) | Paper 3 Theory and Practice of Econometrics I | ST205, EM01–EM04 | Compulsory |
| 2 (Part IIA) | Paper 6 Mathematics and Statistics for Economists | MV01–MV12, LA104–LA106, LA201–LA204, OP01, DY01–DY03 | Optional paper; topic list to check |
| 3 (Part IIB) | Paper 4 Economic Theory and Analysis | AN01–AN05, OP02–OP04, GT01–GT04, DO01–DO04, DY04–DY06 | Optional; Paper 5 "Mathematical Economics" was suspended in 2005 and its content moved here |
| 3 (Part IIB) | Paper 10 Theory and Practice of Econometrics II | EM05–EM06 | Optional |

### MIT (4-year US model, Course 14-1)
File: `content/tracks/mit.track.json` (draft). Checked against the Course 14 degree chart and OpenCourseWare pages on 2026-10-19.
| Year | Course | Topics | Note |
|---|---|---|---|
| 1 | 18.01 Single Variable Calculus | F01–F10, C101–C116 | General Institute Requirement |
| 1 | 18.02 Multivariable Calculus | MV01–MV09, MV13 | General Institute Requirement (year 1, not 2) |
| 2 | 14.30 Introduction to Statistical Methods in Economics | ST101–ST105, ST201–ST204 | Required; 18.05 is not an accepted option for 14-1 |
| 2 | 18.06 Linear Algebra | LA101–LA106, LA201–LA204 | Background: required only in 14-2 Mathematical Economics |
| 3 | 14.32 Econometric Data Science | ST205, EM01–EM06 | Required, by the third year |
| 3–4 | Theory support and advanced topics | MV10–MV12, OP01–OP04, GT01–GT04, DY, AN, DO, SP, NM | Background |

## Custom tracks (private)
Any user can import a `.track.json` (Settings → My programme → Import). Custom tracks are stored only on the device and never uploaded.

Owner's private track (Baku Business University) — workflow:
1. Put syllabus scans/PDFs in `local/syllabi/bbu/` (gitignored).
2. Ask Claude Code to extract course names, semesters and topics, and map them to topic IDs. Course names may stay in Azerbaijani; content opens in English.
3. Topics with no match: propose new topic-bank entries (general maths topics belong in the public bank). Only the track file stays private.
4. Output `local/tracks/bbu.track.json` with `"visibility": "custom"`; validate with `npm run validate:track local/tracks/bbu.track.json`.
5. Send the file to the phone and import it in the app.

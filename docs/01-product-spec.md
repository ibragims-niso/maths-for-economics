# 01 — Product specification

## Problem statement
Economics students meet a steep mathematics curriculum (calculus, linear algebra, optimisation, statistics, dynamics) that is taught abstractly and rarely tied to what an economist actually does with it. Good free resources exist but are scattered, mostly online-only, and do not follow a student's own programme. General AI chatbots will happily solve homework, which removes the learning.

## Vision
A free, offline-first companion that covers the maths of an economics degree from year 1 to the final year, explains every topic through economic use, generates unlimited verified practice, and lets AI teach without doing the student's work.

## Users
| Persona | Need |
|---|---|
| Student (primary) | Learn a topic, practise, test themselves, see progress, revisit weak areas, follow own university's programme |
| Mentor (parent, tutor, teacher) | See a student's progress with the student's consent |
| Contributor (teacher, student, developer) | Fix errors, add resources, add tracks via GitHub |

## Goals
1. A student can study any topic of their programme offline, with explanation, worked examples, interactive graphs and economic applications.
2. Unlimited practice with answers that are always correct (generator-verified).
3. AI help that explains and coaches but does not solve user-supplied problems.
4. Visible progress per topic, course and track, shareable with a mentor.
5. Zero running cost for the owner at small scale; no ads, free forever.

## Non-goals (v1)
- Other app languages (structure supports i18n; English only for now).
- Accounts, logins, social features, leaderboards.
- Handwriting or photo input (photo upload is the main route to homework cheating).
- Teacher class management.
- Official endorsement by any university (tracks are "modeled on", unofficial).

## User stories
**Student**
- As a student, I want to pick my track (or import my university's) so that the app follows my programme.
- As a student, I want each topic to start with why an economist needs it so that I stay motivated.
- As a student, I want worked examples where every step says *why* so that I can do similar problems myself.
- As a student, I want to drag sliders on graphs so that I see how parameters change outcomes.
- As a student, I want to build a timed test from topics I choose so that I can check myself before exams.
- As a student, I want my mistakes explained, including what went wrong, so that I do not repeat them.
- As a student, I want to ask the AI conceptual questions and real-world uses of a topic.
- As a student, I want to reopen any topic and see my past tests and mistakes.
- As a student, I want a daily review list of weak topics.
- As a student, I want to share my progress with a parent or tutor, and stop sharing whenever I want.

**Mentor**
- As a mentor, I want a read-only link showing completion %, mastery per topic, recent tests and weak areas.

**Contributor**
- As a contributor, I want a "Report an error" button that opens a pre-filled GitHub issue.

## Requirements

### P0 — must have (Phase 1–2)
| ID | Requirement | Acceptance criteria |
|---|---|---|
| R1 | Topic page with standard sections (see 04-content-model) | All 8 sections render offline; KaTeX formulas and widgets display on a 375 px wide phone |
| R2 | Generator-based practice | Each generator produces valid problems for 1,000 random seeds in tests; answer computed by code |
| R3 | Test builder + timed test | User selects topics, difficulty, number of questions; timer shown; test auto-submits at 0; AI entry points hidden during the test |
| R4 | Grading + mistake explanation | Numeric answers graded with tolerance; distractor-matched mistakes show the offline explanation for that mistake code |
| R5 | AI modes with guardrails | All modes in 03-ai-design work; a pasted homework problem never gets its own numeric answer; it gets method + analog |
| R6 | Progress | Per-topic status, scores, mastery; per-course and per-track completion %; test history with mistakes |
| R7 | Revisit & review | Any topic reopenable; review queue based on spaced repetition |
| R8 | Offline | With network off after first load: topics, practice, tests, progress all work; AI shows "needs internet" message |
| R9 | Track selection | Core track default; switching tracks keeps all progress (progress is per topic) |
| R10 | Report an error | Button on topic and on each problem opens a GitHub issue with topic ID, template ID and parameters pre-filled |

### P1 — should have (Phase 2–3)
| ID | Requirement | Acceptance criteria |
|---|---|---|
| R11 | Mentor link | Student opts in; mentor link shows read-only dashboard; turning off deletes server copy within 24 h |
| R12 | Own API key | Settings screen with guide (10-groq-key-guide), Verify button, Remove button; key stored only on device |
| R13 | Custom track import | Import a `.track.json` file; validated against schema; unknown topic IDs reported clearly |
| R14 | Real-world resources | Each topic lists verified resources; weekly CI link check |
| R15 | LSE, Cambridge, MIT tracks | Mappings verified against current public syllabi; disclaimer shown |
| R16 | Formula sheet | Searchable list of all formulas, offline |

### P2 — later
- Expo native app and store release.
- Exam mode (mixed topics, no explanations until the end, printable report).
- More languages (Russian first).
- Additional tracks contributed by the community.

## Success metrics
- Leading: a test user completes a topic (read + 1 test) in under 30 minutes; ≥ 70 % of started tests are finished.
- Content quality: < 1 confirmed maths error per 10 topics after review; 0 broken resource links after weekly CI run.
- Lagging: the primary user's mastery covers ≥ 80 % of each semester's topics before that semester's exams.
- Cost: AI cost stays at $0–5 per month at < 500 monthly users.

## Open questions (non-blocking)
- Final app name and domain (owner).
- GitHub owner account/organisation name (owner).
- Content reviewers beyond the owner and primary user (owner).

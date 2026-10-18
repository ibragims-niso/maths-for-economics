# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary:** a first-year university economics student, on a phone. Uses the app in four situations: on the move (bus, metro), often with no internet; at home preparing for classes; between lectures; and revising before exams. Short, interrupted sessions are as normal as long focused ones.
- **Secondary:** any economics student, year 1 to final year, at any university.
- **Mentors:** parents or tutors who follow a student's progress through a read-only link the student chooses to share.
- **Contributors:** teachers, students and developers who fix errors, add resources or add tracks through GitHub.

## Product Purpose

Teach the mathematics of an economics degree, from first year to final year. Each topic comes with an explanation, worked examples, interactive graphs, unlimited practice and timed self-tests. Success means the student masters each semester's maths before that semester's exams, and understands why an economist needs it.

## Positioning

Maths in the economist's language: every topic starts with what economists do with it (pricing, tax incidence, investment appraisal, central-bank models), then teaches the method. Supporting mechanisms that set it apart:
- answers and solution steps are computed by tested code, never by AI, so they are always correct;
- the AI tutor explains and coaches but never solves a student's own homework;
- the curriculum follows the student's programme (Core, tracks modeled on LSE, Cambridge and MIT, or an imported private track).

## Operating Context

- Phone first, often offline. Everything except AI help, mentor sync and content updates must work with no network.
- Installed from the browser to the home screen (PWA); a native app comes later.
- Timed tests run with AI hidden.
- The curriculum is a shared topic bank of 113 topics in 16 blocks over four years, with prerequisites between topics.

## Capabilities and Constraints

- English only for now; structure ready for other languages.
- Free forever: no ads, no paid features, no accounts, no third-party tracking.
- Mentor sharing is opt-in, anonymous (device ID only) and can be switched off at any time.
- No copied textbook, lecture or exam text. Content licence CC BY-NC-SA 4.0, code MIT.
- University tracks are unofficial ("modeled on") and carry a disclaimer.
- Full specification lives in docs/ (product spec, architecture, AI design, content model, topic bank, tracks, UX design, roadmap).

## Brand Commitments

- Name: Maths for Economics.
- Visual direction is pinned in docs/07-ux-design.md ("Balance sheet", chosen by the owner on 2026-10-18): a finance-app look with a violet gradient, glossy 3D icons, a dark bottom sheet, glass floating controls, Poppins, and light transitions. The curriculum map lives at the top of About.
- Voice: plain verbs; buttons say what happens; errors say what happened and what to do.

## Evidence on Hand

- Topic bank: content/topic-bank.json (113 topics, prerequisites, economic use for each).
- Golden example topic: content/topics/C107-elasticity.md.
- Core track: content/tracks/core.track.json.
- No users, testimonials, statistics or university endorsements exist. Do not invent them.

## Product Principles

1. Start from the economics, then teach the maths.
2. Never show a wrong answer: computation comes from verified generators, not from AI.
3. Help the student learn, never do the work for them.
4. Works on a phone with no signal; the network is a bonus, not a requirement.
5. Respect privacy: nothing leaves the device unless the student chooses to share it.

## Accessibility & Inclusion

WCAG 2.1 AA: text contrast 4.5:1 or more, visible focus, tap targets of 44 px or more, and every piece of graph information also given as text. Respect reduced-motion and the user's text size.

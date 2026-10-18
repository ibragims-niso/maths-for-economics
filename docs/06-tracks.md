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
Validation: every topic ID exists; a topic may appear in more than one course; warn (not fail) if a topic appears before one of its prerequisites.

## Public tracks
Status of all mappings below: **draft — verify in Phase 3** against the current official course pages before marking `verified`. Course names and codes come from public course guides and regulations; detailed topic lists must be checked course by course.

### Core (default)
Years and order exactly as in docs/05-topic-bank.md.

### LSE (3-year UK model)
Sources: LSE Calendar course guides (MA100, ST102, MA212, EC221 and optional MA courses).
| Year | Course | Topics (draft) | Note |
|---|---|---|---|
| 1 | MA100 Mathematical Methods | F01–F10, C101–C116, LA101–LA105, MV01–MV09 | Course guide states: calculus of one and several variables, linear algebra. Check exact coverage of Lagrange (MV08–MV09). Alternative first-year course MA107 exists for some programmes; add as variant if needed |
| 1 | ST102 Elementary Statistical Theory | ST101–ST105, ST201–ST204 | Verify depth |
| 1 | Financial maths (not a separate LSE course) | FM01–FM07 | Mark as "supporting" |
| 2 | MA212 Further Mathematical Methods | LA201–LA204, DY01–DY05, MV13 | Taken in more maths-heavy programmes; verify for BSc Economics |
| 2 | EC221 Principles of Econometrics | ST205, EM01–EM04 | Verify |
| 3 | Options (e.g. MA208 Optimisation Theory, MA209 Differential Equations, MA203 Real Analysis) | OP01–OP04, DY06, AN01–AN05 | Older regulations list these; verify current availability |
| 3 | Advanced theory support | GT01–GT04, DO01–DO03, SP01–SP02, EM05–EM06 | Supporting maths for third-year economics courses |

### Cambridge (3-year UK model, "Tripos")
Sources: Statutes and Ordinances — Economics Tripos; Faculty of Economics paper descriptions.
| Year | Paper | Topics (draft) | Note |
|---|---|---|---|
| 1 (Part I) | Paper 3 Quantitative methods in economics | F01–F10, FM01–FM06, C101–C114, LA101–LA103, ST101–ST105, ST201–ST204 | Paper has mathematics and statistics sections |
| 2 (Part IIA) | Paper 6 Mathematics for economists and statisticians | MV01–MV12, LA104–LA106, LA201–LA204, OP01, DY01–DY03 | Optional paper; verify current syllabus |
| 2 (Part IIA) | Econometrics paper | ST205, EM01–EM04 | Verify paper number and name |
| 3 (Part IIB) | Paper 5 Mathematical economics | AN01–AN05, OP02–OP04, GT01–GT04, DO01–DO04, DY04–DY06 | Verify current syllabus |
| 3 (Part IIB) | Supporting | SP01–SP04, EM05–EM06, NM01–NM03 | Supporting |

### MIT (4-year US model)
Sources: MIT OpenCourseWare course pages (all materials public).
| Year | Course | Topics (draft) | Note |
|---|---|---|---|
| 1 | 18.01 Single Variable Calculus | F01–F10, C101–C116 | Add economic applications from our content |
| 1 | Supporting: financial maths | FM01–FM07 | Supporting |
| 2 | 18.02 Multivariable Calculus | MV01–MV09, MV13 | |
| 2 | 18.06 Linear Algebra | LA101–LA106, LA201–LA204 | |
| 2 | Probability and statistics (e.g. 18.05) | ST101–ST105, ST201–ST205 | Verify course code |
| 3 | Econometrics course | EM01–EM06 | Verify course code |
| 3 | Microeconomic theory support | MV10–MV12, OP01–OP04, GT01–GT04 | Supporting |
| 4 | Advanced | DY01–DY06, AN01–AN05, DO01–DO04, SP01–SP04, NM01–NM03 | Supporting |

## Custom tracks (private)
Any user can import a `.track.json` (Settings → My programme → Import). Custom tracks are stored only on the device and never uploaded.

Owner's private track (Baku Business University) — workflow:
1. Put syllabus scans/PDFs in `local/syllabi/bbu/` (gitignored).
2. Ask Claude Code to extract course names, semesters and topics, and map them to topic IDs. Course names may stay in Azerbaijani; content opens in English.
3. Topics with no match: propose new topic-bank entries (general maths topics belong in the public bank). Only the track file stays private.
4. Output `local/tracks/bbu.track.json` with `"visibility": "custom"`; validate with `npm run validate:track local/tracks/bbu.track.json`.
5. Send the file to the phone and import it in the app.

---
id: OP07
title: "Graphs and network planning: the critical path method"
block: OP
coreYear: 3
prerequisites: [F09]
estMinutes: 45
status: draft
economicUses:
  - "Scheduling a construction project and setting a realistic deadline"
  - Planning a product launch or organising a conference
  - "Pricing delays: overheads, penalties and when paying for overtime is worth it"
  - Deciding which tasks managers must watch closely and which can wait
generators: [cpm-project-duration, cpm-total-float, cpm-crash-new-duration]
widgets: [conference-critical-path]
mistakeCodes:
  SUM_ALL_DURATIONS:
    label: Added up every duration
    explanation: Activities that do not depend on each other run at the same time, so the project is shorter than the sum of all durations. The duration is the length of the longest chain of activities.
  LONGEST_ACTIVITY:
    label: Gave the longest single activity
    explanation: One long activity is only part of a chain; the activities before and after it also take time. Add the durations along each chain from start to end and take the longest chain.
  SHORTEST_PATH:
    label: Took the shortest chain
    explanation: The project is finished only when every chain is finished. The shortest chain ends first, but the others are still running, so the duration is the length of the longest chain.
  FREE_FLOAT:
    label: Gave the free float, not the total float
    explanation: Free float is how far an activity can slip without delaying any successor. Total float, LS − ES, is how far it can slip without delaying the whole project; it also uses the float of the activities that follow.
  START_FINISH_MIX:
    label: Used latest finish minus earliest start
    explanation: LF − ES is the window in which the activity must take place, which includes its own duration. Total float compares like with like, LS − ES or LF − EF.
  BACKWARD_MAX:
    label: Took the largest successor time in the backward pass
    explanation: An activity must finish before every successor's latest start, so its latest finish is the smallest of those latest starts. Taking the largest one makes the float look bigger than it is.
  FULL_SAVING:
    label: Assumed the whole cut shortens the project
    explanation: Cutting a critical activity shortens only the chains through it. Once another chain is the longest, the project stops getting shorter. Recompute every chain after the cut and take the longest.
  OLD_SECOND_PATH:
    label: Took the next chain without shortening it
    explanation: The second-longest chain may also pass through the crashed activity, so it gets shorter too. Recompute the length of every chain with the new duration before choosing the longest.
resources:
  - { title: "Contemporary Mathematics, 12.1 Graph Basics (OpenStax)", url: "https://openstax.org/books/contemporary-mathematics/pages/12-1-graph-basics", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "System Project Management (ESD.36), Lecture Notes: critical path method and PERT (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/esd-36-system-project-management-fall-2012/pages/lecture-notes/", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
A building firm signs a contract to deliver an office block in 18 weeks, with a penalty for every week of delay. A start-up wants its new product in the shops before the holiday season. A university organises a conference and has to book the venue, invite speakers, open registration and print badges in the right order. In each case the questions are the same: how long will the whole project take, which tasks decide that date, and which tasks can slip without anyone noticing? The **critical path method** (CPM) answers them with a simple calculation on a **network** of activities. It also tells managers where spending money to speed things up actually pays off, and where it is wasted.

## Intuition
Some tasks must wait for others: you cannot print the programme before the speakers have agreed to come. Other tasks are independent and can run side by side: catering can be arranged while the website is being built. Draw every task as a dot and every "must finish before" as an arrow, and the project becomes a map of **chains**: routes of arrows from the start to the end.

The whole project is finished only when *every* chain is finished. So the project takes as long as its **longest** chain, not the sum of all tasks (parallel tasks overlap) and not the shortest chain (the others are still running). The longest chain is the **critical path**. A delay to any task on it delays the whole project, day for day.

A task on a shorter chain has room to move: it can start later, or take longer, by up to the difference between its chain and the critical one, without moving the end date. That room is its **float** (or slack). Managers watch the critical tasks closely and use the float of the others to smooth out the work.

## Definition and formulas
**Graphs.** A **graph** is a set of **vertices** (nodes) joined by **edges**. In a **directed graph** every edge has a direction, drawn as an arrow from one vertex to another. A **path** is a sequence of vertices in which each one is joined to the next by an edge (following the arrows, in a directed graph). A **cycle** is a path that returns to its first vertex.

**Project network.** We use **activity on node**: each vertex is an activity with a duration, and an arrow from $X$ to $Y$ means "$X$ must finish before $Y$ can start" ($X$ is a **predecessor** of $Y$, $Y$ a **successor** of $X$). The list of predecessors of each activity is the **precedence table**. A project network has no cycles: a cycle would mean that an activity must finish before it can start. (The other convention, activity on arrow, puts activities on the arrows and events on the nodes; it needs extra "dummy" arrows and gives the same results.)

Write $d_j$ for the duration of activity $j$.

**Forward pass** (earliest times), going through the activities in an order where every predecessor comes first:
$$\text{ES}_j = \max_{i \text{ before } j} \text{EF}_i \;\;(\text{or } 0 \text{ if } j \text{ has no predecessor}), \qquad \text{EF}_j = \text{ES}_j + d_j.$$
The **project duration** is $T = \max_j \text{EF}_j$: the earliest moment every activity is done.

**Backward pass** (latest times that still finish by $T$), going through the activities in reverse:
$$\text{LF}_j = \min_{k \text{ after } j} \text{LS}_k \;\;(\text{or } T \text{ if } j \text{ has no successor}), \qquad \text{LS}_j = \text{LF}_j - d_j.$$

**Total float** of an activity: how long it can be delayed without delaying the project,
$$\text{TF}_j = \text{LS}_j - \text{ES}_j = \text{LF}_j - \text{EF}_j.$$
**Free float**: how long it can be delayed without delaying the earliest start of any successor, $\text{FF}_j = \min_{k \text{ after } j}\text{ES}_k - \text{EF}_j$ (with $T$ in place of the minimum for the final activity). Always $0 \le \text{FF}_j \le \text{TF}_j$.

**Critical path.** The activities with $\text{TF}_j = 0$ form the critical path(s): the longest chain(s) from start to end, of total length $T$. Equivalently,
$$T = \max_{\text{chains } P} \sum_{j \in P} d_j, \qquad \text{TF}_j = T - (\text{length of the longest chain through } j).$$
Lengthening a critical activity by $\delta$ lengthens the project by $\delta$. Lengthening an activity with float $\text{TF}_j$ by $\delta$ changes nothing while $\delta \le \text{TF}_j$, and adds $\delta - \text{TF}_j$ beyond that.

**Crashing.** A critical activity can often be shortened at extra cost (overtime, more workers, faster delivery). This is worth doing only while the cost of a week saved is below the cost of a week of delay (penalties, site overheads, lost sales). Shortening it helps only while its chain is still the longest: once another chain becomes critical, both must be shortened together.

**PERT (an aside).** When a duration is uncertain, the Program Evaluation and Review Technique asks for an optimistic time $a$, a most likely time $m$ and a pessimistic time $b$, and uses the weighted average
$$t_e = \frac{a + 4m + b}{6}$$
as the expected duration, with a spread of roughly $(b - a)/6$. The forward and backward passes then run on the $t_e$ values.

## Interactive
::widget{id="conference-critical-path"}

The graph is the conference of Example 2. Each dot is an activity, labelled with its letter and duration in weeks, with its total float underneath; each arrow means "must finish before". Gold dots and arrows form the critical path, hollow dots have float. Move **Catering C (weeks)** and watch the panel: the project duration, the critical path (as letters) and the float of C. Check: at 6 weeks the panel shows 14 weeks, ADEF and a float of 1 week for C. At 7 weeks C has no float and both ACF and ADEF are critical, still 14 weeks. At 9 weeks the critical path is ACF alone and the conference needs 16 weeks: every week of catering beyond 7 now costs a week of the whole project.

## Worked examples

### Example 1 (easy): how long does a product launch take?
A firm plans a launch in five activities (weeks). The advertising campaign C is uncertain: optimistic 2 weeks, most likely 4, pessimistic 12. Find its PERT time, the project duration and the critical path.
$$
\begin{array}{c|l|c|c}
\text{Activity} & \text{Task} & \text{Weeks} & \text{After} \\ \hline
A & \text{market research} & 3 & - \\
B & \text{design the product} & 5 & A \\
C & \text{plan the advertising} & ? & A \\
D & \text{produce the first batch} & 4 & B \\
E & \text{launch event} & 2 & C,\ D
\end{array}
$$

1. $t_C = \dfrac{2 + 4 \cdot 4 + 12}{6} = \dfrac{30}{6} = 5$
   *Why:* PERT weights the most likely time four times as heavily as the two extremes; the long pessimistic tail pulls the estimate above the most likely 4 weeks.
2. A: $0 \to 3$; B: $3 \to 8$; C: $3 \to 8$; D: $8 \to 12$
   *Why:* forward pass: each activity starts when its predecessor finishes, and its earliest finish is the start plus its duration.
3. E: $\text{ES}_E = \max(\text{EF}_C, \text{EF}_D) = \max(8, 12) = 12$, $\text{EF}_E = 14$, so $T = 14$ weeks
   *Why:* E needs both C and D, so it waits for the later of the two.
4. Chains: A–B–D–E $= 3 + 5 + 4 + 2 = 14$ and A–C–E $= 3 + 5 + 2 = 10$. The critical path is A–B–D–E.
   *Why:* the project lasts as long as its longest chain, which agrees with the forward pass. Adding all five durations would give 19 weeks, too long, because C runs alongside B and D.
5. C has a total float of $14 - 10 = 4$ weeks.
   *Why:* the advertising can run up to 4 weeks late, or take up to 9 weeks, without moving the launch date.

```verify
a = 2; m = 4; b = 12
tC = (a + 4*m + b)/6
assert tC == 5
dA = 3; dB = 5; dD = 4; dE = 2
efA = dA
efB = efA + dB
efC = efA + tC
efD = efB + dD
esE = max(efC, efD)
T = esE + dE
assert efA == 3 and efB == 8 and efC == 8 and efD == 12
assert esE == 12 and T == 14
assert dA + dB + dD + dE == 14 and dA + tC + dE == 10
assert dA + dB + tC + dD + dE == 19
assert T - (dA + tC + dE) == 4 and tC + 4 == 9
```

### Example 2 (medium): floats for a conference
A department organises a conference. Find every activity's earliest and latest times, the floats, the critical path and the effect of catering taking 8 weeks instead of 6.
$$
\begin{array}{c|l|c|c}
\text{Activity} & \text{Task} & \text{Weeks} & \text{After} \\ \hline
A & \text{book the venue} & 4 & - \\
B & \text{invite speakers} & 3 & - \\
C & \text{arrange catering} & 6 & A \\
D & \text{build the website} & 2 & A \\
E & \text{run registration} & 5 & B,\ D \\
F & \text{print programme and badges} & 3 & C,\ E
\end{array}
$$

1. Forward pass: A $0 \to 4$, B $0 \to 3$, C $4 \to 10$, D $4 \to 6$, E $\max(3, 6) = 6 \to 11$, F $\max(10, 11) = 11 \to 14$; so $T = 14$
   *Why:* E waits for both B and D, and F for both C and E; the later finish decides each start.
2. Backward pass: F $11 \to 14$, E $6 \to 11$, C $5 \to 11$, D $4 \to 6$, B $3 \to 6$, A: $\text{LF}_A = \min(\text{LS}_C, \text{LS}_D) = \min(5, 4) = 4$, so A $0 \to 4$ (latest start → latest finish)
   *Why:* start from $T = 14$ at the end and work back; an activity must finish before the earliest of its successors' latest starts, which is why A must be done by week 4, not week 5.
3. Total floats $\text{LS} - \text{ES}$: A 0, B $3 - 0 = 3$, C $5 - 4 = 1$, D 0, E 0, F 0
   *Why:* each float compares when an activity may start at the latest with when it can start at the earliest.
4. Critical path A–D–E–F, length $4 + 2 + 5 + 3 = 14$; the other chains are A–C–F $= 13$ and B–E–F $= 11$
   *Why:* the zero-float activities form the longest chain. The floats match the gaps: C lies only on a chain 1 week shorter, B on one 3 weeks shorter.
5. If catering takes 8 weeks: A–C–F $= 4 + 8 + 3 = 15$, so $T = 15$ weeks
   *Why:* C had 1 week of float, so a 2-week overrun delays the conference by $2 - 1 = 1$ week, and A–C–F becomes the critical path.

```verify
dA = 4; dB = 3; dC = 6; dD = 2; dE = 5; dF = 3
efA = dA; efB = dB
esC = efA; efC = esC + dC
esD = efA; efD = esD + dD
esE = max(efB, efD); efE = esE + dE
esF = max(efC, efE); efF = esF + dF
T = efF
assert efC == 10 and efD == 6 and esE == 6 and efE == 11 and esF == 11 and T == 14
lsF = T - dF
lsE = lsF - dE
lsC = lsF - dC
lsD = lsE - dD
lsB = lsE - dB
lfA = min(lsC, lsD)
lsA = lfA - dA
assert lsF == 11 and lsE == 6 and lsC == 5 and lsD == 4 and lsB == 3 and lfA == 4 and lsA == 0
assert lsA - 0 == 0 and lsB - 0 == 3 and lsC - esC == 1 and lsD - esD == 0 and lsE - esE == 0 and lsF - esF == 0
assert dA + dD + dE + dF == 14 and dA + dC + dF == 13 and dB + dE + dF == 11
assert dA + 8 + dF == 15 and max(15, 14, 11) == 15 and 2 - 1 == 1
```

### Example 3 (hard): float, delays and crashing on a building site
A firm builds an office (weeks). Find the critical path and the total and free float of C and E. The site costs 6 (thousand) a week in overheads while the project runs, and the plumbers offer to cut F by up to 3 weeks for 4 (thousand) per week cut. How many weeks should be bought?
$$
\begin{array}{c|l|c|c}
\text{Activity} & \text{Task} & \text{Weeks} & \text{After} \\ \hline
A & \text{prepare the site} & 2 & - \\
B & \text{lay foundations} & 4 & A \\
C & \text{design the garden} & 3 & A \\
D & \text{erect the frame} & 5 & B \\
E & \text{build the garden} & 4 & C,\ D \\
F & \text{plumbing and wiring} & 6 & D \\
G & \text{inspection and handover} & 1 & E,\ F
\end{array}
$$

1. Forward pass: A $0 \to 2$, B $2 \to 6$, C $2 \to 5$, D $6 \to 11$, E $\max(5, 11) = 11 \to 15$, F $11 \to 17$, G $\max(15, 17) = 17 \to 18$; $T = 18$
   *Why:* the garden must wait for the frame (the cranes must leave first), and handover waits for both the garden and the services.
2. Backward pass: G $17 \to 18$, F $11 \to 17$, E $13 \to 17$, D: $\text{LF}_D = \min(13, 11) = 11$, so $6 \to 11$; C $10 \to 13$, B $2 \to 6$, A $0 \to 2$
   *Why:* D must finish before both E and F can start at their latest, and F's latest start, week 11, is the binding one.
3. Critical path A–B–D–F–G ($2 + 4 + 5 + 6 + 1 = 18$). C: $\text{TF} = 10 - 2 = 8$, $\text{FF} = \text{ES}_E - \text{EF}_C = 11 - 5 = 6$. E: $\text{TF} = 13 - 11 = 2$, $\text{FF} = 17 - 15 = 2$
   *Why:* if the garden design slips by up to 6 weeks nobody notices; a slip of 7 or 8 weeks delays the garden work E (using up its 2 weeks of float) but not the handover; beyond 8 weeks the handover moves.
4. Cut F from 6 to 3 weeks: A–B–D–F–G $= 15$, but A–B–D–E–G $= 2 + 4 + 5 + 4 + 1 = 16$ and A–C–E–G $= 10$, so $T = 16$
   *Why:* the 3-week cut saves only $18 - 16 = 2$ weeks, because the garden chain becomes critical once F is cut by 2.
5. Buy 2 weeks: cost $2 \times 4 = 8$, overheads saved $2 \times 6 = 12$, net gain $4$ (thousand). The third week would cost 4 more and save nothing.
   *Why:* crashing pays only while it shortens the project and a week saved is worth more than it costs; after 2 weeks, F is no longer the only critical activity.

```verify
dA = 2; dB = 4; dC = 3; dD = 5; dE = 4; dF = 6; dG = 1
efA = dA
esB = efA; efB = esB + dB
esC = efA; efC = esC + dC
esD = efB; efD = esD + dD
esE = max(efC, efD); efE = esE + dE
esF = efD; efF = esF + dF
esG = max(efE, efF); T = esG + dG
assert efB == 6 and efC == 5 and efD == 11 and esE == 11 and efE == 15 and efF == 17 and esG == 17 and T == 18
lsG = T - dG
lsF = lsG - dF
lsE = lsG - dE
lfD = min(lsE, lsF); lsD = lfD - dD
lsC = lsE - dC
lsB = lsD - dB
lsA = min(lsB, lsC) - dA
assert lsG == 17 and lsF == 11 and lsE == 13 and lfD == 11 and lsD == 6 and lsC == 10 and lsB == 2 and lsA == 0
assert dA + dB + dD + dF + dG == 18
assert lsC - esC == 8 and esE - efC == 6
assert lsE - esE == 2 and esG - efE == 2
cut = 3
p1 = dA + dB + dD + (dF - cut) + dG
p2 = dA + dB + dD + dE + dG
p3 = dA + dC + dE + dG
assert p1 == 15 and p2 == 16 and p3 == 10
Tnew = max(p1, p2, p3)
assert Tnew == 16 and T - Tnew == 2
assert 2*4 == 8 and 2*6 == 12 and 12 - 8 == 4
assert dA + dB + dD + (dF - 2) + dG == 16
```

## Common mistakes
- Adding up the durations of all activities, as if nothing could run at the same time: 19 weeks instead of 14 in Example 1 (SUM_ALL_DURATIONS).
- Giving the duration of the longest single activity as the project duration (LONGEST_ACTIVITY).
- Taking the shortest chain, as if the project ended when the first chain ends (SHORTEST_PATH).
- In the forward pass, starting an activity when the *first* of its predecessors finishes instead of the last; at a merge, take the largest earliest finish.
- Reporting the free float when the question asks for the total float: 6 instead of 8 weeks for C in Example 3 (FREE_FLOAT).
- Subtracting the earliest start from the latest finish; that window includes the activity's own duration (START_FINISH_MIX).
- In the backward pass, taking the largest latest start among the successors instead of the smallest, which overstates the float of A in Example 2 (BACKWARD_MAX).
- Assuming that cutting a critical activity by 3 weeks always saves 3 weeks: in Example 3 it saves only 2 (FULL_SAVING).
- After a cut, reading off the old length of the next-longest chain without checking whether it also passes through the crashed activity (OLD_SECOND_PATH).
- Paying to speed up an activity that has float: the project does not finish any sooner.

## Practice
- `cpm-project-duration` (difficulty 1): the shortest duration of a project of 5–7 activities given as a precedence list; distractors SUM_ALL_DURATIONS, LONGEST_ACTIVITY, SHORTEST_PATH.
- `cpm-total-float` (difficulty 2): the total float of a named non-critical activity, by forward and backward passes; distractors FREE_FLOAT, START_FINISH_MIX, BACKWARD_MAX.
- `cpm-crash-new-duration` (difficulty 3): the new project duration after a critical activity is cut by a few days, when another chain becomes critical; distractors FULL_SAVING, OLD_SECOND_PATH.

## Real world
- History: the critical path method was developed in the late 1950s by the chemical company DuPont with Remington Rand to plan plant maintenance, and PERT at about the same time by the US Navy for the Polaris missile programme. Both are still the backbone of project-planning software and Gantt charts.
- Construction and infrastructure: building contracts often set a penalty for each day of late completion, so contractors track the critical path every week and decide when overtime, extra crews or faster deliveries are cheaper than the penalty.
- Business: product launches, software releases, mergers and audits are planned as networks of tasks; managers focus attention on the critical tasks and use the float of the others to share out staff.
- Public spending: delays on large public projects raise their cost through longer use of equipment, financing and lost benefits, which is why appraisal guides ask for a realistic schedule, not the sum of optimistic guesses.

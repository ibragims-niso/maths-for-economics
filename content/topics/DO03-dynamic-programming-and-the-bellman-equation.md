---
id: DO03
title: Dynamic programming and the Bellman equation
block: DO
coreYear: 4
prerequisites: [DY01, C109]
estMinutes: 50
status: draft
economicUses:
  - "Consumption and saving over a lifetime: how much to spend now and how much to keep"
  - "Job search: when to accept a wage offer and when to keep looking"
  - Sharing an investment budget across regions or projects
  - "Timing decisions: when to harvest timber or replace a machine"
  - Least-cost routes and multi-stage investment plans
searchTerms:
  - "Bellman equation"
generators: [dp-staged-route-least-cost, dp-budget-allocation-best-return, dp-cake-eating-first-consumption]
widgets: [haulier-route-bellman]
mistakeCodes:
  GREEDY_PATH:
    label: Took the cheapest next road each time
    explanation: A cheap first road can lead to towns from which every onward road is dear. Compare each road's cost plus the least cost still to pay from where it leads, V(next), and work backwards from the end.
  LONGEST_PATH:
    label: Took the dearest route
    explanation: The question asks for the least total cost, so at every town keep the smallest value of cost + V(next), not the largest.
  STAGE_MINIMA:
    label: Added the cheapest road of each stage
    explanation: The cheapest roads of different stages usually do not join up into one route. A route must leave each town by a road that starts there, so compare whole continuations with V(next).
  GREEDY_UNIT:
    label: Gave out the budget one unit at a time
    explanation: Giving each unit to the region with the largest extra return can miss a region whose first unit pays little but whose second pays a lot. Compare every way of splitting the budget stage by stage with fₖ(x) = max over u of rₖ(u) + fₖ₊₁(x − u).
  ALL_IN_ONE:
    label: Put the whole budget in one region
    explanation: The best single region is only one of the possible splits. Returns usually grow more slowly as one region gets more, so sharing the budget often earns more; the stage-by-stage table checks every split.
  IGNORE_BUDGET:
    label: Added each region's best entry
    explanation: Each region's largest return assumes it gets the whole budget, so adding them spends the budget several times over. The amounts given to the regions must add up to the budget.
  EQUAL_SPLIT:
    label: Split the savings equally across the years
    explanation: An equal split ignores impatience. With discount factor β < 1 later years count for less, so the first year gets the share 1/(1 + β + β² + …) of the savings, which is more than an equal share.
  DISCOUNT_INVERTED:
    label: Put β on the wrong side of the Euler equation
    explanation: With u = ln c and no interest the optimal path satisfies c₁ = βc₀, so consumption falls over time. Writing c₁ = c₀/β makes it rise, and the formula then gives the last year's consumption instead of the first year's.
  INFINITE_HORIZON_RULE:
    label: Used the infinite-horizon rule c = (1 − β)W
    explanation: c = (1 − β)W is the rule when the savings must last for ever. With only a few years left, the first year gets W/(1 + β + β² + …) with as many terms as there are years, which is much more.
  SHORT_HORIZON:
    label: Left out a year
    explanation: Count the years carefully. Over years 0, 1 and 2 there are three weights, 1, β and β², so c₀ = W/(1 + β + β²); dropping the last year gives the two-year answer W/(1 + β).
resources:
  - { title: "Dynamic Optimization Methods with Applications, 14.451 (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/14-451-dynamic-optimization-methods-with-applications-fall-2009/", kind: course, verifiedAt: 2026-10-18 }
  - { title: "Optimal Savings I: Cake Eating (QuantEcon, Intermediate Quantitative Economics with Python)", url: "https://python.quantecon.org/os.html", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Job Search I: The McCall Search Model (QuantEcon, Intermediate Quantitative Economics with Python)", url: "https://python.quantecon.org/mccall_model.html", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
Many economic decisions are taken in steps, and each step changes the situation for the next one. A household decides each year how much of its savings to spend; what it spends now is not there later. A forest owner decides each year whether to cut the trees or let them grow another year. A firm plans its investment over several years, an unemployed worker decides whether to accept today's wage offer or keep searching, and a development fund decides how to share a budget across regions. Writing down every possible plan and comparing them is hopeless: with 10 decisions of 5 options each there are almost 10 million plans. **Dynamic programming** cuts the problem into one-step decisions solved backwards from the end, and the **Bellman equation** is the formula that links each step to the next. It is the standard tool of modern macroeconomics, labour economics and operations research.

## Intuition
The key idea is the **principle of optimality**: whatever happened before, the rest of an optimal plan must be optimal from where you now stand. If the cheapest drive from S to T passes through town B, then the part of it from B to T must be the cheapest drive from B to T; otherwise you could swap in the cheaper ending and beat the "cheapest" route.

So work backwards. At the last step the decision is easy: from each possible situation (each town, each amount of money left) there is little or nothing left to choose. Record the best you can achieve from each situation: that table is the **value function**. One step earlier, each choice leads to a situation whose value is already known, so you only need to compare

$$\text{payoff now} + \text{value of the situation it leads to}.$$

Repeat until you reach the start. A short-sighted (greedy) decision maker looks only at the first term and can walk into an expensive future; the value function is exactly what warns you. The work grows with the number of stages times the number of situations and choices, not with the number of whole plans.

## Definition and formulas
**Ingredients.** Stages (periods) $t = 0, 1, \dots, T$. A **state** $x_t$ summarises everything that matters for the future (where you are, wealth left, units of budget left). A **decision** (control) $c_t$ is chosen from the options available in state $x_t$. It gives a payoff $f_t(x_t, c_t)$ now and moves the state by a **transition rule**
$$x_{t+1} = g(x_t, c_t),$$
a first-order difference equation, as in DY01, but steered by our choices. The goal is to maximise $\sum_{t=0}^{T} \beta^t f_t(x_t, c_t)$, with a discount factor $0 < \beta \le 1$ (or to minimise a total cost).

**Value function.** $V_t(x)$ is the best total payoff from stage $t$ to the end, starting in state $x$ and choosing optimally from then on.

**Bellman equation.**
$$V_t(x) = \max_{c}\,\bigl\{ f_t(x, c) + \beta\, V_{t+1}\bigl(g(x, c)\bigr) \bigr\}, \qquad V_{T+1}(x) = 0 \;\;(\text{or a given end value}).$$
The best choice $c_t^*(x)$, the one that achieves the maximum, is the **policy**.

**Backward induction.** Compute $V_T$, then $V_{T-1}$, …, down to $V_0(x_0)$, storing the policy at each stage. Then go forwards from $x_0$: apply $c_0^*$, move to $x_1$, apply $c_1^*$, and so on.

**Least-cost route through a staged network.** The value of the destination is 0, and for every other node
$$V(\text{node}) = \min_{\text{next}}\,\bigl\{\text{cost of the road} + V(\text{next})\bigr\},$$
and $V(\text{start})$ is the least total cost. The same backward pass works for the longest route, with max in place of min (compare the critical path in OP07).

**Sharing a budget of $N$ whole units among regions $1, \dots, K$.** The stages are the regions, the state is the number of units not yet given out, and $r_k(u)$ is region $k$'s return from $u$ units:
$$f_K(x) = r_K(x), \qquad f_k(x) = \max_{u = 0, 1, \dots, x}\,\bigl\{ r_k(u) + f_{k+1}(x - u) \bigr\},$$
and the best total is $f_1(N)$.

**Consumption and saving (cake eating).** Wealth $x$ is the state, consumption $c$ the decision, and with no interest $x_{t+1} = x_t - c_t$:
$$V_t(x) = \max_{0 < c \le x}\,\bigl\{ u(c) + \beta\, V_{t+1}(x - c) \bigr\}.$$
With $u(c) = \ln c$ and $n$ years, the solution is to consume a share of what is left that depends only on the number of years still to go. For three years and initial wealth $W$:
$$c_0 = \frac{W}{1 + \beta + \beta^2}, \qquad c_1 = \beta c_0, \qquad c_2 = \beta^2 c_0.$$
The condition behind this is the **Euler equation** $u'(c_t) = \beta\, u'(c_{t+1})$, here $1/c_t = \beta / c_{t+1}$: giving up one unit today must cost as much utility as it gains, discounted, tomorrow. If savings earn a gross return $R$ (so $x_{t+1} = R(x_t - c_t)$), the Euler equation becomes $c_{t+1} = \beta R\, c_t$, and with log utility $c_0$ is still $W/(1 + \beta + \beta^2)$: the interest rate changes the later years, not the first one.

**Infinite horizon.** When there is no last period, the problem looks the same from every date, so the value function no longer depends on $t$ and the Bellman equation becomes **stationary**:
$$V(x) = \max_{c}\,\bigl\{ u(c) + \beta\, V(x - c) \bigr\}.$$
The unknown is now a whole function that appears on both sides. With $\beta < 1$ (and payoffs that are not too extreme) it has exactly one solution, and it can be found by **value function iteration**: start from any guess (for example $V = 0$), put it into the right-hand side, and repeat; each round is one more period of the finite problem. For log cake eating the answer is $c = (1 - \beta)x$, the limit of $1/(1 + \beta + \dots + \beta^{n-1})$ as $n$ grows. Wealth then follows $x_{t+1} = \beta x_t$, a first-order difference equation (DY01) that falls steadily towards 0.

**Job search (in brief).** An unemployed worker receives one wage offer $w$ each period. Accepting gives $w$ in every period for ever, worth $w/(1 - \beta)$; rejecting gives unemployment benefit $b$ now and a new offer next period. The Bellman equation is
$$V(w) = \max\Bigl\{ \frac{w}{1 - \beta},\; b + \beta\, \mathbb{E}\bigl[V(w')\bigr] \Bigr\},$$
where $w'$ is next period's random offer. The optimal policy is a **reservation wage** $w^*$: accept any offer with $w \ge w^*$, reject the rest. A higher benefit $b$ or a more patient worker (higher $\beta$) raises $w^*$, so search lasts longer.

## Interactive
::widget{id="haulier-route-bellman"}

This is the haulier's network of Example 1. Each arrow is a road with its cost, and each town shows V, the least cost still to pay from there to the market T. Move **Cost of road S → B** and watch the gold cheapest route and the panel: the least cost V(S), the cheapest route and the greedy route, which always takes the cheapest road out of the current town. Check: at 4 the panel shows 10 and SBCT, while the greedy route SADT costs 12. At 6 both SADT and SBCT cost 12, and from 7 upwards the cheapest route goes via A. Notice that V(A) = 10 and V(B) = 6 never change as you move the slider: only the choice at S changes.

## Worked examples

### Example 1 (easy): the cheapest route for a haulier
A haulier takes goods from depot S to market T, through one town in each stage. Road costs (hundreds): stage 1: $S \to A$ 2, $S \to B$ 4; stage 2: $A \to C$ 8, $A \to D$ 4, $B \to C$ 3, $B \to D$ 1; stage 3: $C \to T$ 3, $D \to T$ 6. Find the cheapest route and its cost.

1. $V(C) = 3, \quad V(D) = 6$
   *Why:* from the last towns there is only one road left, so the least cost still to pay is the cost of that road.
2. $V(A) = \min(8 + 3,\ 4 + 6) = 10$ (go to D), $\quad V(B) = \min(3 + 3,\ 1 + 6) = 6$ (go to C)
   *Why:* from each town compare each road's cost plus the value of the town it leads to; the values of C and D are already known.
3. $V(S) = \min(2 + 10,\ 4 + 6) = 10$ (go to B)
   *Why:* the Bellman equation at the depot: the cheap road to A leads to a town from which the rest of the trip costs 10.
4. Route $S \to B \to C \to T$: $4 + 3 + 3 = 10$
   *Why:* follow the stored choices forwards. Listing all four routes confirms it: SACT 13, SADT 12, SBCT 10, SBDT 11.
5. The greedy route $S \to A \to D \to T$ costs $2 + 4 + 6 = 12$
   *Why:* taking the cheapest next road each time ignores where it leads; it costs 2 more than the optimum.

```verify
SA = 2; SB = 4; AC = 8; AD = 4; BC = 3; BD = 1; CT = 3; DT = 6
VC = CT; VD = DT
VA = min(AC + VC, AD + VD)
VB = min(BC + VC, BD + VD)
VS = min(SA + VA, SB + VB)
assert VC == 3 and VD == 6
assert AC + VC == 11 and AD + VD == 10 and VA == 10
assert BC + VC == 6 and BD + VD == 7 and VB == 6
assert SA + VA == 12 and SB + VB == 10 and VS == 10
assert SB + BC + CT == 10
assert SA + AC + CT == 13 and SA + AD + DT == 12 and SB + BD + DT == 11
assert min(SA, SB) == SA and min(AC, AD) == AD
greedy = SA + AD + DT
assert greedy == 12 and greedy - VS == 2
```

### Example 2 (medium): sharing a development budget
A development fund has 4 (million) to invest in regions A, B and C, in whole millions. The extra annual income (million) from each amount is:
$$
\begin{array}{c|ccc}
\text{units} & \text{A} & \text{B} & \text{C} \\ \hline
0 & 0 & 0 & 0 \\
1 & 6 & 3 & 5 \\
2 & 10 & 10 & 7 \\
3 & 12 & 13 & 8 \\
4 & 13 & 15 & 9
\end{array}
$$
Find the best split and the largest total income.

1. $f_3(x) = r_C(x)$: $0, 5, 7, 8, 9$ for $x = 0, \dots, 4$
   *Why:* the last stage is region C alone; whatever is left goes there.
2. $f_2(x) = \max_u \{r_B(u) + f_3(x - u)\}$: $f_2(0) = 0$, $f_2(1) = \max(5, 3) = 5$, $f_2(2) = \max(7, 8, 10) = 10$, $f_2(3) = \max(8, 10, 15, 13) = 15$, $f_2(4) = \max(9, 11, 17, 18, 15) = 18$
   *Why:* for each budget $x$ left for B and C, try every amount $u$ for B; C's best use of the rest is already known. For example $f_2(3)$ is best with 2 units to B and 1 to C: $10 + 5 = 15$.
3. $f_1(4) = \max_u \{r_A(u) + f_2(4 - u)\} = \max(0 + 18,\ 6 + 15,\ 10 + 10,\ 12 + 5,\ 13 + 0) = 21$ at $u = 1$
   *Why:* region A is the first stage; each term is A's return plus the best that B and C can do with the rest.
4. Plan: A 1, B 2, C 1, total $6 + 10 + 5 = 21$
   *Why:* read forwards: A takes 1 unit, and $f_2(3) = 15$ says the remaining 3 go 2 to B and 1 to C.
5. Greedy, one unit at a time to the largest extra return: A (6), C (5), A (4), B (3), total $18$
   *Why:* B's first unit adds only 3 but its second adds 7, so a unit-by-unit rule never sees the value of giving B two units.

```verify
A = [0, 6, 10, 12, 13]; B = [0, 3, 10, 13, 15]; C = [0, 5, 7, 8, 9]
f2_0 = B[1] + C[1]
f2_1 = max(B[1] + C[2], B[2] + C[1])
f2_2 = max(B[1] + C[3], B[2] + C[2], B[3] + C[1])
f2_3 = max(B[1] + C[4], B[2] + C[3], B[3] + C[2], B[4] + C[1])
f2_4 = max(B[1] + C[5], B[2] + C[4], B[3] + C[3], B[4] + C[2], B[5] + C[1])
assert f2_0 == 0 and f2_1 == 5 and f2_2 == 10 and f2_3 == 15 and f2_4 == 18
assert B[3] + C[2] == 15 and B[4] + C[2] == 18
f1 = max(A[1] + f2_4, A[2] + f2_3, A[3] + f2_2, A[4] + f2_1, A[5] + f2_0)
assert f1 == 21 and A[2] + f2_3 == 21
assert A[1] + f2_4 == 18 and A[3] + f2_2 == 20 and A[4] + f2_1 == 17 and A[5] + f2_0 == 13
assert A[2] + B[3] + C[2] == 21
greedy = A[3] + B[2] + C[2]
assert greedy == 18
assert A[2] - A[1] == 6 and C[2] - C[1] == 5 and A[3] - A[2] == 4 and B[2] - B[1] == 3
assert B[3] - B[2] == 7
assert max(A[5], B[5], C[5]) == 15 and A[5] + B[5] + C[5] == 37
```

### Example 3 (hard): spending savings over three years
A retired couple has savings of 100 (thousand) to spend over years 0, 1 and 2, earning no interest. They maximise $\ln c_0 + 0.9 \ln c_1 + 0.9^2 \ln c_2$ with $c_0 + c_1 + c_2 = 100$. Solve by backward induction and find the spending plan.

1. $V_2(x) = \ln x$
   *Why:* in the last year nothing is valued afterwards, so whatever is left, $x$, is spent.
2. $V_1(x) = \max_c \{\ln c + 0.9 \ln(x - c)\}$: $\dfrac{1}{c} = \dfrac{0.9}{x - c} \Rightarrow c = \dfrac{x}{1.9}$, so $V_1(x) = 1.9 \ln x + \text{const}$
   *Why:* set the derivative to zero (C109); the second derivative is negative, so it is a maximum. Putting $c = x/1.9$ and $x - c = 0.9x/1.9$ back in gives $\ln x + 0.9 \ln x$ plus terms without $x$.
3. $V_0(100) = \max_{c_0} \{\ln c_0 + 0.9 \cdot 1.9 \ln(100 - c_0)\} + \text{const}$: $\dfrac{1}{c_0} = \dfrac{1.71}{100 - c_0} \Rightarrow c_0 = \dfrac{100}{2.71} = 36.90$
   *Why:* the Bellman equation for year 0: what is not spent now is worth $0.9\, V_1(100 - c_0)$, which puts the weight $1.71$ on $\ln(100 - c_0)$.
4. $x_1 = 100 - 36.90 = 63.10$, $c_1 = 63.10 / 1.9 = 33.21$, $c_2 = 63.10 - 33.21 = 29.89$
   *Why:* go forwards with the policy of each year. The plan matches $c_1 = 0.9\, c_0$ and $c_2 = 0.81\, c_0$: spending falls by 10 % a year because later years count for less.
5. Lifetime utility $\ln 36.90 + 0.9 \ln 33.21 + 0.81 \ln 29.89 = 9.513$, against $2.71 \ln 33.33 = 9.503$ for an equal split
   *Why:* the optimal plan beats spending 33.33 every year, as it must. If the savings had to last for ever, the rule would be $c = (1 - 0.9) \cdot 100 = 10$ instead.

```verify
b = 0.9; W = 100
S = 1 + b + b^2
assert abs(S - 2.71) < 1e-12 and abs(b*(1 + b) - 1.71) < 1e-12
c0 = W/S
assert abs(c0 - 36.90) < 0.005
x1 = W - c0
c1 = x1/(1 + b)
c2 = x1 - c1
assert abs(x1 - 63.10) < 0.005 and abs(c1 - 33.21) < 0.005 and abs(c2 - 29.89) < 0.005
assert abs(c1 - b*c0) < 1e-9 and abs(c2 - b^2*c0) < 1e-9
assert abs(1/c0 - 1.71/(W - c0)) < 1e-12
U = log(c0) + b*log(c1) + b^2*log(c2)
Ueq = S*log(W/3)
assert abs(U - 9.513) < 0.0005 and abs(Ueq - 9.503) < 0.0005 and U > Ueq
assert abs((1 - b)*W - 10) < 1e-9
# a slightly different first-year spending, followed optimally, is worse
f(c) = log(c) + b*(1 + b)*log(W - c)
assert f(c0) > f(c0 + 0.5) and f(c0) > f(c0 - 0.5)
```

## Common mistakes
- Taking the cheapest next road at every town, which gives 12 instead of 10 in Example 1 (GREEDY_PATH).
- Keeping the largest instead of the smallest value at each town, which gives the dearest route, 13 in Example 1 (LONGEST_PATH).
- Adding the cheapest road of each stage, $2 + 1 + 3 = 6$ in Example 1, although those roads do not join into one route (STAGE_MINIMA).
- Giving out the budget one unit at a time to the largest extra return: 18 instead of 21 in Example 2 (GREEDY_UNIT).
- Putting the whole budget into the single best region: 15 in Example 2 (ALL_IN_ONE).
- Adding each region's best entry, $13 + 15 + 9 = 37$, which would need 12 units, not 4 (IGNORE_BUDGET).
- Spending the savings equally, 33.33 a year in Example 3, as if later years counted as much as today (EQUAL_SPLIT).
- Writing the Euler equation as $c_1 = c_0/\beta$; for Example 3 this gives $c_0 = 29.89$, the last year's spending (DISCOUNT_INVERTED).
- Using the infinite-horizon rule $c = (1 - \beta)W = 10$ when the savings need to last only three years (INFINITE_HORIZON_RULE).
- Leaving out a year: $100/1.9 = 52.63$ in Example 3 (SHORT_HORIZON).
- Trying to solve forwards from the first decision: at the start you do not yet know what each choice is worth later, which is why the values must be computed from the end.
- Forgetting the discount factor $\beta$ in front of $V_{t+1}$, which treats the future as being as important as today.

## Practice
- `dp-staged-route-least-cost` (difficulty 1): least total cost from S to T through a network of 3–4 stages with 2–3 towns each, by backward induction; distractors GREEDY_PATH, LONGEST_PATH, STAGE_MINIMA.
- `dp-budget-allocation-best-return` (difficulty 2): best total return from sharing 3–5 whole units among three regions with tabulated returns; distractors GREEDY_UNIT, ALL_IN_ONE, IGNORE_BUDGET.
- `dp-cake-eating-first-consumption` (difficulty 3): first-year consumption in a 2- or 3-year problem with $u = \ln c$ and discount factor $\beta$, $c_0 = W/(1 + \beta + \dots)$; distractors EQUAL_SPLIT, DISCOUNT_INVERTED, INFINITE_HORIZON_RULE, SHORT_HORIZON.

## Real world
- History: Richard Bellman developed dynamic programming in the 1950s at the RAND Corporation for multi-stage planning problems. The same backward reasoning solves sequential games (GT03), and its continuous-time cousin is optimal control (DO02).
- Macroeconomics: models of household consumption and saving, firm investment and whole economies (real business cycle and DSGE models used by central banks) are written as Bellman equations and solved by value function iteration on a computer.
- Labour markets: job-search models in the tradition of McCall (1970) explain reservation wages and how the level and length of unemployment benefits affect how long people stay unemployed.
- Natural resources and business: when to harvest a forest, how much fish to catch each season, when to replace ageing equipment, and how to route deliveries or plan stock levels are all solved stage by stage with value functions.

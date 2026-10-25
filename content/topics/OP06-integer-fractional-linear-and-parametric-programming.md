---
id: OP06
title: Integer, fractional-linear and parametric programming
block: OP
coreYear: 3
prerequisites: [OP02]
estMinutes: 50
status: draft
economicUses:
  - "Capital budgeting: which investment projects to fund when each is all-or-nothing"
  - Buying whole machines, vehicles or plants, and paying fixed costs only for what is opened
  - "Maximising a ratio: profit per unit of cost, output per worker, efficiency scores"
  - "Sensitivity of a plan to price changes: how long the best plan stays best"
searchTerms:
  - "Integer programming"
  - "Branch and bound"
  - "Fractional-linear programming"
  - "Parametric programming"
generators: [profit-cost-ratio-best-corner, project-selection-best-npv, parametric-lp-optimal-value]
widgets: [fleet-integer-plan]
mistakeCodes:
  ROUNDED_LP:
    label: Rounded the LP solution
    explanation: Rounding the fractional LP plan can break a constraint or miss the best whole-number plan. Check the whole-number plans near the LP optimum, or use branch and bound, and compare their values.
  GREEDY_LARGEST_NPV:
    label: Funded the largest NPV first
    explanation: Taking the project with the largest NPV first can use up the budget on one big project. Compare whole selections of projects that fit the budget, not single projects one at a time.
  GREEDY_BEST_RATIO:
    label: Funded the best NPV per unit of cost first
    explanation: Ranking by NPV ÷ cost is the right rule only when projects can be split. With all-or-nothing projects it can leave part of the budget unused; compare the full selections that fit.
  FRACTIONAL_PROJECT:
    label: Funded part of a project
    explanation: Filling the leftover budget with a fraction of the next project gives the LP relaxation, an upper bound, not a plan. Each project is funded in full or not at all.
  MAX_PROFIT_CORNER:
    label: Took the ratio at the most profitable plan
    explanation: The plan with the largest profit can have a large cost too. Work out profit ÷ cost at every corner and take the largest ratio.
  SEPARATE_EXTREMES:
    label: Maximised top and bottom separately
    explanation: The largest profit and the smallest cost occur at different plans, so their ratio belongs to no plan at all. Compute the ratio at each corner for that corner's own profit and cost.
  KEPT_OLD_PLAN:
    label: Kept the old plan after the price change
    explanation: A price change can make a different corner the best. Recompute the objective at every corner with the new price, then take the best.
  IGNORED_PARAMETER:
    label: Ignored the price change
    explanation: The question asks for the optimal value at the new value of t. Put the given t into the objective before comparing the corners.
resources:
  - { title: "Optimization Methods in Management Science (15.053), Lecture Notes (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/15-053-optimization-methods-in-management-science-spring-2013/pages/lecture-notes/", kind: course, verifiedAt: 2026-10-18 }
  - { title: "Integer Programming and Combinatorial Optimization (15.083J) (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/15-083j-integer-programming-and-combinatorial-optimization-fall-2009/", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
Linear programming (OP02) assumes that every quantity can be split: 4.5 vans, 0.37 of a factory, a third of a project. Many real decisions are not like that. A firm buys whole lorries, a city builds a hospital or does not, a fund backs a project in full or not at all. **Integer programming** handles these yes/no and whole-number choices. Managers also care about ratios, such as profit per unit of cost or output per worker, which **fractional-linear programming** maximises. And because prices and budgets keep moving, **parametric programming** asks how the best plan and its value change when a price or a limit changes, and for how long today's plan stays the best one.

## Intuition
**Whole numbers.** Draw the feasible region of an LP and mark every point with whole-number coordinates: you get a grid of dots inside the region. An integer programme chooses the best *dot*. The LP optimum is usually a corner between the dots, so it is not allowed. The natural shortcut, rounding the LP plan, often fails: rounding up can push the plan outside the region, and rounding down can land on a dot far worse than the best one. The best dot may even be in a different part of the region. What the LP does give is a **bound**: no dot can beat the LP optimum, because every dot is also a feasible LP plan.

**Branch and bound** uses that bound. If the LP plan has a fractional value, say $x = 1.5$, no whole plan has $1 < x < 2$, so split the problem into two: one with $x \le 1$ and one with $x \ge 2$. Solve the LP in each part. A part whose LP plan is whole gives a candidate; a part whose LP bound is no better than the best candidate so far is dropped. Split again only where needed.

**Ratios.** Profitability $R = \text{profit}/\text{cost}$ is a ratio of two linear functions. All plans with the same ratio $k$ satisfy $\text{profit} - k\cdot\text{cost} = 0$, a straight line, and every one of these lines passes through the same point, where profit and cost would both be zero. As $k$ rises, the line turns about that point. The largest $k$ whose line still touches the region touches it at a corner, so the best ratio is again found by checking corners. It is often *not* the corner with the most profit: a smaller plan with a much smaller cost can earn more per unit spent.

**Moving prices.** If the profit per unit of a product changes by $t$, the region does not move; only the slope of the iso-profit line does. The best corner stays best for a whole interval of $t$, and then the optimum jumps to a neighbouring corner. So the optimal value, plotted against $t$, is made of straight pieces.

## Definition and formulas
**Integer programme.** An LP in which some or all variables must be whole numbers:
$$\text{maximise } \mathbf{c}^{\mathsf T}\mathbf{x} \quad\text{subject to}\quad A\mathbf{x} \le \mathbf{b}, \quad \mathbf{x} \ge \mathbf{0}, \quad x_j \in \{0, 1, 2, \dots\}.$$
Dropping the whole-number condition gives the **LP relaxation**. For a maximisation, its optimal value is an upper bound on the integer optimum. The gap between them, the LP optimum minus the best whole-number value, is the **price of integrality**: what the indivisibility of the goods costs.

**Rounding is not a method.** Rounding the LP plan may give an infeasible plan, or a feasible plan that is not optimal (Example 2 shows both).

**Branch and bound** (for a maximisation):
1. Solve the LP relaxation. If its plan is whole, it is optimal; stop.
2. Pick a variable with a fractional value $x_j = f$ and **branch**: one subproblem adds $x_j \le \lfloor f \rfloor$, the other $x_j \ge \lfloor f \rfloor + 1$.
3. Solve the LP of each subproblem. Keep the best whole plan found so far (the **incumbent**). **Prune** a subproblem that is infeasible, or whose LP value is no better than the incumbent; it cannot contain anything better.
4. Branch again on any subproblem that is left with a fractional plan, until none is left. The incumbent is optimal.

**Binary (0–1) variables** model yes/no decisions: $x_i = 1$ means "do it" and $x_i = 0$ means "do not". Choosing investment projects under a budget $B$ is the **knapsack problem**:
$$\text{maximise } \sum_i v_i x_i \quad\text{subject to}\quad \sum_i c_i x_i \le B, \quad x_i \in \{0, 1\},$$
where $v_i$ is the net present value (NPV, FM06) of project $i$ and $c_i$ its cost. Binary variables also express logical conditions: $x_A + x_B \le 1$ (at most one of A and B), $x_C \le x_D$ (C only if D is done too). With a handful of projects, list the selections that fit the budget and compare; simple ranking rules can miss the optimum.

**Fixed costs.** If opening a plant costs a fixed $F$ plus $c$ per unit produced, let $y \in \{0, 1\}$ say whether it opens. The cost is $Fy + cx$ with the constraint $x \le My$, where $M$ is the plant's capacity: with $y = 0$ nothing can be produced, and with $y = 1$ the fixed cost is paid.

**Fractional-linear programme.** Maximise a ratio of two linear functions over a region of linear constraints:
$$\text{maximise } R(\mathbf{x}) = \frac{\mathbf{c}^{\mathsf T}\mathbf{x} + c_0}{\mathbf{d}^{\mathsf T}\mathbf{x} + d_0} \quad\text{subject to}\quad A\mathbf{x} \le \mathbf{b}, \;\; \mathbf{x} \ge \mathbf{0}, \quad\text{with } \mathbf{d}^{\mathsf T}\mathbf{x} + d_0 > 0 \text{ on the region}.$$
The set $R = k$ is the line $(\mathbf{c} - k\mathbf{d})^{\mathsf T}\mathbf{x} + (c_0 - kd_0) = 0$, so on a bounded region with a positive denominator the maximum is reached at a corner: compute $R$ at each corner and take the largest. For example, a dairy with the corners $(0, 0)$, $(25, 0)$, $(20, 10)$ and $(0, 20)$ of Example 3 (at $t = 0$), profit $3x + 2y$ and total cost $x + 2y + 10$, has $R = 0$, $\tfrac{75}{35} \approx 2.14$, $\tfrac{80}{50} = 1.6$ and $\tfrac{40}{50} = 0.8$ at those corners. The most profitable plan per unit of cost is $(25, 0)$, not the plan with the most profit, $(20, 10)$. Here every line $R = k$ passes through $(5, -7.5)$, where both profit and cost are zero.

**Charnes–Cooper substitution.** Put $s = 1/(\mathbf{d}^{\mathsf T}\mathbf{x} + d_0)$ and $\mathbf{u} = s\mathbf{x}$. The problem becomes the ordinary LP: maximise $\mathbf{c}^{\mathsf T}\mathbf{u} + c_0 s$ subject to $A\mathbf{u} \le s\mathbf{b}$, $\mathbf{d}^{\mathsf T}\mathbf{u} + d_0 s = 1$, $\mathbf{u} \ge \mathbf{0}$, $s \ge 0$; the best plan is $\mathbf{x} = \mathbf{u}/s$.

**Parametric programming.** Let one coefficient depend on a parameter $t$, for example the profit per unit of product A, $c_1 + t$. For each corner $\mathbf{x}^{(k)}$ of the (fixed) region, the profit $z_k(t) = (c_1 + t)x_1^{(k)} + c_2x_2^{(k)}$ is a straight line in $t$ with slope $x_1^{(k)}$. The optimal value is the highest of these lines,
$$z^*(t) = \max_k z_k(t),$$
a **piecewise linear** function of $t$ (and a convex one, since it is a maximum of lines). A corner stays optimal over an interval of $t$; at the ends of the interval two corners tie and the plan switches. The slope of $z^*$ on each piece is the amount of A in the optimal plan.

When a **right-hand side** varies instead, $b_i + s$, the region changes but, as long as the same constraints stay binding, the optimal corner moves smoothly and $z^*$ changes linearly in $s$. Its slope is the **shadow price** of resource $i$ (OP03). The range of $s$ over which the binding constraints stay the same is the range over which that shadow price is valid.

## Interactive
::widget{id="fleet-integer-plan"}

The graph shows the fleet of Example 2: the shaded region holds every fleet of $x$ lorries and $y$ vans that fits the budget and the 6 drivers, and the grey dots are the whole-number fleets. The hollow dot is the LP optimum and the filled dot the best whole fleet. Move **Budget (thousands)** to shift the budget line and **Profit per lorry (thousands)** to tilt the dashed profit line; the panel shows the LP optimum, the best whole fleet and the price of integrality, and the caption says what rounding the LP plan would do. Check: at a budget of 90 and a lorry profit of 9 the panel shows 31.5 at $(1.5, 4.5)$, 30 at $(2, 3)$ and a price of integrality of 1.5. Raise the budget to 100: the LP plan becomes $(2, 4)$, already whole, and the price drops to 0. Now set the lorry profit to 14: the LP plan $(3.33, 0)$ earns 46.67, rounding it to $(3, 0)$ earns only 42, and the best whole fleet is $(3, 1)$ with 46.

## Worked examples

### Example 1 (easy): choosing investment projects
A firm has a budget of 100 (thousand) and four projects, each funded in full or not at all: A costs 60 with NPV 11, B costs 30 with NPV 8, C costs 50 with NPV 10, D costs 80 with NPV 12. Which projects should it fund?

1. Maximise $11x_A + 8x_B + 10x_C + 12x_D$ subject to $60x_A + 30x_B + 50x_C + 80x_D \le 100$, $x_i \in \{0, 1\}$.
   *Why:* one yes/no variable per project; the NPVs add up because the projects are independent.
2. Every set of three projects costs at least $30 + 50 + 60 = 140 > 100$. The pairs that fit are $\{A, B\}$ (cost 90, NPV 19) and $\{B, C\}$ (cost 80, NPV 18); every other pair costs more than 100.
   *Why:* with four projects there are only $2^4 = 16$ selections, so we can check them all; the cheapest three already break the budget.
3. Single projects give at most 12 (project D), so the best choice is $\{A, B\}$ with NPV 19, leaving 10 unspent.
   *Why:* every affordable selection is a single project or one of the two pairs, and 19 is the largest NPV among them.
4. "Largest NPV first" funds D (80), leaving 20, too little for anything else: NPV 12. "Best NPV per unit of cost first" ranks B ($0.27$), C ($0.20$), A ($0.18$), D ($0.15$) and funds B and C, then A no longer fits: NPV 18.
   *Why:* both shortcuts are natural but miss the optimum, because a project cannot be split to fill the leftover budget.
5. Allowing a fraction of A on top of B and C gives $8 + 10 + 11 \cdot \tfrac{20}{60} \approx 21.67$, the LP relaxation.
   *Why:* this is an upper bound: no selection of whole projects can earn more than 21.67, and the best one earns 19.

```verify
cA = 60; cB = 30; cC = 50; cD = 80
vA = 11; vB = 8; vC = 10; vD = 12
budget = 100
assert min([cA + cB + cC, cA + cB + cD, cA + cC + cD, cB + cC + cD]) == 140
assert cA + cB == 90 and vA + vB == 19
assert cB + cC == 80 and vB + vC == 18
assert cA + cC > budget and cA + cD > budget and cB + cD > budget and cC + cD > budget
assert max([vA, vB, vC, vD]) == 12
assert max([vA, vB, vC, vD, vA + vB, vB + vC]) == 19
assert budget - (cA + cB) == 10
assert budget - cD == 20 and min([cA, cB, cC]) > 20
assert abs(vB/cB - 0.27) < 0.005 and abs(vC/cC - 0.2) < 1e-9
assert abs(vA/cA - 0.18) < 0.005 and abs(vD/cD - 0.15) < 1e-9
assert vB/cB > vC/cC and vC/cC > vA/cA and vA/cA > vD/cD
assert cA > budget - (cB + cC)
lp = vB + vC + vA * (budget - cB - cC) / cA
assert abs(lp - 21.67) < 0.005
assert 2^4 == 16
```

### Example 2 (medium): a fleet of whole vehicles
A delivery firm buys $x$ lorries at 30 (thousand) each and $y$ vans at 10 each, with a budget of 90 and 6 drivers (one per vehicle). A lorry earns 9 and a van 4 (thousand a year). Find the best fleet: first as an LP, then in whole vehicles by branch and bound.

1. Maximise $z = 9x + 4y$ subject to $30x + 10y \le 90$, $x + y \le 6$, $x, y \ge 0$. The LP corners are $(0, 0)$, $(3, 0)$, $(1.5, 4.5)$ and $(0, 6)$, with $z = 0$, 27, 31.5 and 24.
   *Why:* the budget and driver lines cross where $20x = 30$, so $x = 1.5$ and $y = 4.5$; this corner earns the most.
2. Rounding $(1.5, 4.5)$ to $(2, 5)$ costs $60 + 50 = 110 > 90$ and needs 7 drivers: infeasible. Rounding down to $(1, 4)$ is feasible but earns only $9 + 16 = 25$.
   *Why:* the LP plan sits on the edge of the region, so rounding up steps outside it, and rounding down throws profit away.
3. Branch on $x$. Subproblem $x \le 1$: at $x = 1$ the budget allows $y \le 6$ and the drivers $y \le 5$, so its corners other than the origin are $(0, 6)$, $(1, 5)$ and $(1, 0)$, and the best is $(1, 5)$ with $z = 9 + 20 = 29$, a whole plan.
   *Why:* no whole fleet has $1 < x < 2$, so the two subproblems $x \le 1$ and $x \ge 2$ together contain every whole fleet.
4. Subproblem $x \ge 2$: at $x = 2$ the budget allows $y \le 3$, so the corners are $(2, 0)$, $(3, 0)$ and $(2, 3)$, and the best is $(2, 3)$ with $z = 18 + 12 = 30$, also whole.
   *Why:* both subproblems end with whole plans, so there is nothing left to branch on.
5. The best whole fleet is 2 lorries and 3 vans, earning 30; the price of integrality is $31.5 - 30 = 1.5$.
   *Why:* we keep the better of the two whole plans. The optimum $(2, 3)$ is not the rounded LP plan, and it leaves one driver unused.

```verify
p = 9; q = 4
v = lusolve([30, 10; 1, 1], [90; 6])
assert abs(v[1,1] - 1.5) < 1e-9 and abs(v[2,1] - 4.5) < 1e-9
assert 90/30 == 3
assert p*3 == 27 and p*1.5 + q*4.5 == 31.5 and q*6 == 24
assert 30*2 + 10*5 == 110 and 2 + 5 == 7
assert p*1 + q*4 == 25
assert (90 - 30*1)/10 == 6 and 6 - 1 == 5
assert p*1 + q*5 == 29 and q*6 == 24 and p*1 == 9
assert (90 - 30*2)/10 == 3 and 6 - 2 == 4
assert p*2 + q*3 == 30 and p*2 == 18 and p*3 == 27
assert 30*2 + 10*3 == 90 and 2 + 3 == 5
assert 31.5 - 30 == 1.5
```

### Example 3 (hard): how the best plan responds to a price change
A dairy makes $x$ tonnes of cheese and $y$ tonnes of butter a week, with milk $2x + y \le 50$ and packing hours $x + 2y \le 40$. Butter earns 2 (thousand per tonne) and cheese $3 + t$, where $t$ is a change in the cheese price. Find the optimal profit $z^*(t)$, the range of $t$ over which the current plan stays optimal, and the effect of $t = 2$. How does $z^*$ change if instead the milk supply becomes $50 + s$?

1. Corners: $(0, 0)$, $(25, 0)$, $(20, 10)$ and $(0, 20)$.
   *Why:* the milk and packing lines cross where $3y = 30$, so $y = 10$ and $x = 20$; on the axes the tighter limits are $x \le 25$ and $y \le 20$. These corners do not depend on $t$.
2. $z(25, 0) = 75 + 25t$, $\;z(20, 10) = 80 + 20t$, $\;z(0, 20) = 40$.
   *Why:* at a fixed plan, the profit changes by the tonnes of cheese times $t$.
3. $80 + 20t \ge 40 \iff t \ge -2$ and $80 + 20t \ge 75 + 25t \iff t \le 1$. So $(20, 10)$ is optimal for $-2 \le t \le 1$, a cheese profit between 1 and 4.
   *Why:* the plan stays best while its line is the highest; at $t = -2$ and $t = 1$ it ties with a neighbouring corner.
4. $z^*(t) = 40$ for $t \le -2$, $\;80 + 20t$ for $-2 \le t \le 1$, $\;75 + 25t$ for $t \ge 1$. At $t = 2$: $z^* = 125$ at $(25, 0)$; keeping the old plan would earn only $80 + 40 = 120$.
   *Why:* the optimal value is the highest of the corner lines, so it is piecewise linear, with slopes 0, 20 and 25, the tonnes of cheese in each optimal plan.
5. With milk $50 + s$ (at $t = 0$): $x = \tfrac{60 + 2s}{3}$, $y = \tfrac{30 - s}{3}$ and $z^* = 80 + \tfrac43 s$ for $-30 \le s \le 30$. For example, $s = 3$ gives the plan $(22, 9)$ and $z^* = 84$.
   *Why:* while milk and packing stay binding, the corner slides along the packing line and profit grows by $\tfrac43 \approx 1.33$ per extra unit of milk, the shadow price of milk (OP03). At $s = 30$ butter falls to zero and the binding constraints change.

```verify
v = lusolve([2, 1; 1, 2], [50; 40])
assert abs(v[1,1] - 20) < 1e-9 and abs(v[2,1] - 10) < 1e-9
assert min(50/2, 40/1) == 25 and min(50/1, 40/2) == 20
assert 3*25 == 75 and 3*20 + 2*10 == 80 and 2*20 == 40
assert (40 - 80)/20 == -2
assert (75 - 80)/(20 - 25) == 1
assert 3 + (-2) == 1 and 3 + 1 == 4
t = 2
assert 75 + 25*t == 125 and 80 + 20*t == 120 and 75 + 25*t > 40
assert (3 + t)*25 == 125 and (3 + t)*20 + 2*10 == 120
s = 3
w = lusolve([2, 1; 1, 2], [50 + s; 40])
assert abs(w[1,1] - 22) < 1e-9 and abs(w[2,1] - 9) < 1e-9
assert abs(w[1,1] - (60 + 2*s)/3) < 1e-9 and abs(w[2,1] - (30 - s)/3) < 1e-9
assert abs(3*w[1,1] + 2*w[2,1] - 84) < 1e-9
assert abs(80 + 4/3*s - 84) < 1e-9
assert abs(4/3 - 1.33) < 0.005
assert (30 - 30)/3 == 0 and (60 + 2*(-30))/3 == 0
```

## Common mistakes
- Rounding the LP plan and calling it optimal: in Example 2, rounding $(1.5, 4.5)$ gives $(2, 5)$, which breaks the budget, and rounding down gives 25 instead of 30 (ROUNDED_LP).
- Funding the project with the largest NPV first; in Example 1 that is D alone, NPV 12 (GREEDY_LARGEST_NPV).
- Ranking projects by NPV per unit of cost and funding down the list; with indivisible projects this gave 18 instead of 19 in Example 1 (GREEDY_BEST_RATIO).
- Funding a fraction of a project to use up the budget; that gives the LP-relaxation bound, 21.67 in Example 1, not a plan (FRACTIONAL_PROJECT).
- Taking the profit-to-cost ratio at the plan with the most profit instead of comparing the ratio at every corner (MAX_PROFIT_CORNER).
- Dividing the largest profit by the smallest cost, when the two come from different plans (SEPARATE_EXTREMES).
- After a price change, re-pricing the old plan instead of checking which corner is now best: 120 instead of 125 in Example 3 (KEPT_OLD_PLAN).
- Giving the optimal value at $t = 0$ when the question asks about another value of $t$ (IGNORED_PARAMETER).
- In branch and bound, adding $x \le 1.5$ and $x \ge 1.5$ instead of $x \le 1$ and $x \ge 2$: the fractional plan stays feasible and the search never ends.
- Assuming a fractional-linear objective can be maximised by maximising the numerator and minimising the denominator one after the other.

## Practice
- `profit-cost-ratio-best-corner` (difficulty 1): the largest profit-to-cost ratio over a region with four given corners; distractors MAX_PROFIT_CORNER, SEPARATE_EXTREMES.
- `project-selection-best-npv` (difficulty 2): the largest total NPV from 4–5 all-or-nothing projects under a budget; distractors GREEDY_LARGEST_NPV, GREEDY_BEST_RATIO, FRACTIONAL_PROJECT.
- `parametric-lp-optimal-value` (difficulty 3): the optimal profit of a two-product plan when one profit per unit becomes $c + t$ for a given $t$; distractors KEPT_OLD_PLAN, IGNORED_PARAMETER.

## Real world
- History: Ailsa Land and Alison Doig published branch and bound in *Econometrica* in 1960, and Abraham Charnes and William Cooper gave their substitution for fractional-linear programmes in 1962. Modern integer programming solvers are built on branch and bound and routinely solve problems with thousands of whole-number variables.
- Capital budgeting: firms, development banks and governments choose portfolios of projects with 0–1 variables, adding conditions such as "at most one of two sites" or "the road only if the bridge is built".
- Energy and transport: electricity system operators decide which power plants to switch on each hour (a plant has a fixed start-up cost and runs at whole levels), and airlines assign whole crews and aircraft to flights.
- Efficiency and sensitivity: data envelopment analysis rates banks, hospitals and schools by maximising an output-to-input ratio, solved as an LP through the Charnes–Cooper substitution; planners routinely report the price ranges over which their recommended plan stays optimal.

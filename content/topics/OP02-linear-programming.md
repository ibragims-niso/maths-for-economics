---
id: OP02
title: Linear programming
block: OP
coreYear: 3
prerequisites: [LA103]
estMinutes: 50
status: draft
economicUses:
  - Production planning when machine hours, labour and materials are limited
  - "Diet and blending: the cheapest feed, food or fuel mix that meets every requirement"
  - Finding the bottleneck resources of a firm (the binding constraints)
  - Transport and logistics plans at the lowest cost
searchTerms:
  - "LP"
  - "Simplex method"
generators: [lp-max-profit-two-products, lp-unused-hours-at-optimum, lp-min-cost-feed-blend]
widgets: [iso-profit-corners]
mistakeCodes:
  OTHER_CORNER:
    label: Chose a corner that is not the best
    explanation: The optimum is at a corner, but not at any corner. Work out the objective at every corner of the feasible region and take the largest (for a maximum) or the smallest (for a minimum).
  IGNORED_CONSTRAINT:
    label: Left out a constraint
    explanation: A plan must satisfy every constraint at once. On each axis, the corner is set by the tightest constraint, the smallest limit for ≤ constraints and the largest requirement for ≥ constraints; a point that breaks one constraint is not a corner of the feasible region.
  USED_NOT_UNUSED:
    label: Gave the hours used, not the hours left
    explanation: The slack of a constraint is what is left over, capacity minus use. Work out the hours the best plan uses, then subtract them from the hours available.
  ASSUMED_BINDING:
    label: Assumed every constraint is fully used
    explanation: At the optimum only the constraints whose lines pass through the optimal corner are binding. Any other constraint has slack; check it by putting the plan into its left-hand side.
  INFEASIBLE_ORIGIN:
    label: Chose the origin in a minimisation
    explanation: Buying nothing costs nothing, but it does not meet "at least" requirements. With ≥ constraints the origin lies outside the feasible region; compare the costs at the corners of the region only.
resources:
  - { title: "Applied Finite Mathematics (Sekhon and Bloom), 3: Linear Programming - A Geometric Approach (LibreTexts)", url: "https://math.libretexts.org/Bookshelves/Applied_Mathematics/Applied_Finite_Mathematics_(Sekhon_and_Bloom)/03%3A_Linear_Programming_-_A_Geometric_Approach", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Applied Finite Mathematics (Sekhon and Bloom), 4: Linear Programming - The Simplex Method (LibreTexts)", url: "https://math.libretexts.org/Bookshelves/Applied_Mathematics/Applied_Finite_Mathematics_(Sekhon_and_Bloom)/04%3A_Linear_Programming_The_Simplex_Method", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Optimization Methods in Management Science (15.053), Lecture Notes (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/15-053-optimization-methods-in-management-science-spring-2013/pages/lecture-notes/", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
Economics is about allocating scarce resources, and many real allocation problems are linear: each product uses a fixed number of machine hours, each kilogram of feed brings a fixed amount of protein, each lorry carries a fixed load. A firm then wants the plan with the highest profit, or the lowest cost, that respects every limit at once. Linear programming finds that plan. It also tells the manager which resources are the bottlenecks and which have hours to spare, the starting point for asking what an extra hour of a scarce machine is worth (OP03).

## Intuition
A bakery makes bread and pastries. Every batch uses oven time and staff time, and both are limited. Each possible weekly plan is a point $(x, y)$; the plans that fit inside all the limits form a region with straight edges, the **feasible region**.

Now draw all the plans that earn the same profit, say 600. Because profit is linear, they lie on a straight line, an **iso-profit line**. Plans earning 900 lie on a parallel line further out. Pushing the line outwards raises the profit, so we push it as far as we can while it still touches the region. A linear profit has no hill-top in the middle of the region: it improves steadily in one direction until it hits an edge, and then it slides along the edge until it reaches a corner. So the best plan is at a corner.

That gives a practical method for two products: find the corners, work out the profit at each one, and take the best. The **simplex method** does the same in any number of dimensions without listing every corner: it starts at one corner and keeps moving to a neighbouring corner with higher profit until no neighbour is better.

## Definition and formulas
**A linear programme (LP)** chooses the values of **decision variables** $x_1, \dots, x_n$ to
$$\text{maximise } z = c_1x_1 + c_2x_2 + \dots + c_nx_n \quad\text{subject to}\quad a_{i1}x_1 + \dots + a_{in}x_n \le b_i \;\; (i = 1, \dots, m), \quad x_1, \dots, x_n \ge 0.$$
The **objective** $z$ is linear, every **constraint** is a linear inequality, and the **non-negativity** conditions say that quantities cannot be negative. In matrix form (LA102): maximise $\mathbf{c}^{\mathsf T}\mathbf{x}$ subject to $A\mathbf{x} \le \mathbf{b}$, $\mathbf{x} \ge \mathbf{0}$. A minimisation problem usually has $\ge$ constraints instead.

**Formulating an LP** in four steps:
1. name the decision variables and their units ("$x$ = batches of bread a week");
2. write the objective (profit to maximise or cost to minimise);
3. write one constraint for each scarce resource or requirement;
4. add $x, y \ge 0$.

Two standard types:
- **Production planning**: maximise profit $px + qy$ subject to machine-hour limits $ax + by \le c$.
- **Diet or blending**: minimise cost subject to nutrient requirements $ax + by \ge r$. For example, a farm mixes $x$ kg of feed A (cost 3 per kg) and $y$ kg of feed B (cost 2 per kg) and needs $2x + y \ge 16$ units of protein and $x + 2y \ge 20$ units of fibre. The region lies *above* both lines and has no upper edge; its corners are $(0, 16)$, $(4, 8)$ and $(20, 0)$, with costs 32, 28 and 60, so the cheapest blend is 4 kg of A and 8 kg of B for 28. The origin is not feasible: buying nothing meets no requirement.

**Feasible region.** In two variables each constraint is a half-plane bounded by a straight line, and the feasible region is the part of the plane that satisfies all of them. It is a polygon with no dents (a convex set), possibly unbounded. Its **corners** (vertices) are the feasible points where two boundary lines cross; the axes $x = 0$ and $y = 0$ count as boundary lines.

**Corner-point theorem.** If a linear programme has an optimal solution, then at least one optimal solution is at a corner of the feasible region. If the region is non-empty and bounded, an optimal solution always exists.

**Graphical method (two variables).**
1. Draw each constraint line and shade the side that satisfies it.
2. Draw an iso-profit line $px + qy = k$; its slope is $-p/q$.
3. Move it parallel to itself in the direction that raises $k$ (lowers it for a minimum) until it last touches the region. The point it touches is optimal.

Equivalently, list the corners and compare the objective at each. A corner where lines with slopes $-a_1/b_1$ and $-a_2/b_2$ cross is optimal when the iso-profit slope $-p/q$ lies between them: $a_2/b_2 \le p/q \le a_1/b_1$.

**Binding and slack constraints.** At a plan, a constraint is **binding** if it holds with equality (the resource is used up) and **slack** otherwise. Its **slack** is the amount left over:
$$s_i = b_i - (a_{i1}x_1 + \dots + a_{in}x_n) \ge 0.$$
At an optimal corner in two variables, the binding constraints are the lines through that corner.

**Special cases.**
- **Infeasible**: no plan satisfies all constraints, e.g. a firm with $x + y \le 10$ units of capacity that has promised to deliver $x + y \ge 12$.
- **Unbounded**: the objective can grow without limit, e.g. maximise $3x + 2y$ subject only to $x - y \le 4$: every plan $(t, t)$ is feasible and earns $5t$. In an economic model this signals a forgotten constraint.
- **Multiple optima**: the iso-profit line is parallel to an edge of the region, so both corners of that edge and every point between them are optimal.

**The simplex method.** Add a **slack variable** to each $\le$ constraint to turn it into an equation: $ax + by \le c$ becomes $ax + by + s = c$ with $s \ge 0$. With $m$ constraints and $m$ slack variables, set $n$ of the variables to zero and solve for the other $m$ (the **basic** variables); when all of them are non-negative this **basic feasible solution** is a corner of the region. Start at the origin, where the basic variables are the slacks, and write the equations and $z - c_1x_1 - \dots - c_nx_n = 0$ in a table, the **tableau**. Then repeat:
1. **Entering variable**: the column with the most negative entry in the objective row (raising that variable increases $z$ fastest). If there is no negative entry, stop: the current corner is optimal.
2. **Ratio test**: for each row with a positive entry in that column, divide the right-hand side by the entry. The row with the smallest ratio leaves the basis; its constraint is the first to become binding as the entering variable grows.
3. **Pivot**: divide the pivot row by the pivot entry, then clear every other entry of the column with row operations (LA103).

Each pivot moves along an edge to a neighbouring corner with a profit at least as high. When the method stops, the objective-row entries under the slack variables are the **shadow prices** of the resources, the subject of OP03. Transport plans (OP05) and problems whose answers must be whole numbers (OP06) are special linear programmes with methods of their own.

## Interactive
::widget{id="iso-profit-corners"}

The graph shows the workshop of Example 2: the shaded region holds every plan of $x$ tables and $y$ cabinets that fits the cutting, assembly and finishing hours, and the dots mark its corners. Move **Iso-profit level** to slide the dashed line of equal profit outwards, and **Profit per table, p** to tilt it (a cabinet always earns 20). The panel shows the best plan, the maximum profit and the binding machines. Check: at $p = 30$ raise the level to 640; the dashed line just touches the region at $(16, 8)$ and the panel shows a maximum profit of 640 with cutting and assembly binding. Now set $p = 45$: the line is steeper than the cutting edge and the best plan jumps to $(20, 0)$ with profit 900. At $p = 20$ or $p = 40$ the line lies along an edge and the panel shows two corners: multiple optima.

## Worked examples

### Example 1 (easy): a bakery's weekly plan
A bakery makes $x$ batches of bread and $y$ batches of pastries a week. A batch of bread needs 1 oven hour and 1 staff hour; a batch of pastries needs 1 oven hour and 2 staff hours. There are 40 oven hours and 50 staff hours. Profit is 30 per batch of bread and 40 per batch of pastries. Formulate the LP and solve it graphically.

1. Maximise $\pi = 30x + 40y$ subject to $x + y \le 40$ (oven), $x + 2y \le 50$ (staff), $x, y \ge 0$.
   *Why:* one decision variable per product, profit per batch times batches for the objective, one constraint per scarce resource.
2. On the $x$-axis: $x = \min(40, 50) = 40$, corner $(40, 0)$. On the $y$-axis: $y = \min(40, 25) = 25$, corner $(0, 25)$.
   *Why:* with one product only, each resource allows a maximum number of batches and the tighter one stops production first. Staff hours would allow 50 batches of bread, but the oven allows only 40.
3. Both lines: subtract $x + y = 40$ from $x + 2y = 50$ to get $y = 10$, then $x = 30$. Corner $(30, 10)$.
   *Why:* at the corner where the two constraint lines cross, both resources are fully used.
4. $\pi(0, 0) = 0$, $\pi(40, 0) = 1{,}200$, $\pi(30, 10) = 1{,}300$, $\pi(0, 25) = 1{,}000$.
   *Why:* by the corner-point theorem the maximum is at one of the four corners.
5. Best plan: 30 batches of bread and 10 of pastries, profit 1,300. Both constraints are binding.
   *Why:* the iso-profit slope $-30/40 = -0.75$ lies between the oven line's slope $-1$ and the staff line's slope $-0.5$, so the last point the line touches is the corner where those two lines cross.

```verify
p = 30; q = 40
v = lusolve([1, 1; 1, 2], [40; 50])
assert abs(v[1,1] - 30) < 1e-9
assert abs(v[2,1] - 10) < 1e-9
assert min(40/1, 50/1) == 40
assert min(40/1, 50/2) == 25
assert p*40 == 1200
assert p*30 + q*10 == 1300
assert q*25 == 1000
assert max([0, 1200, 1300, 1000]) == 1300
assert -p/q == -0.75
assert -1 < -p/q and -p/q < -0.5
assert 30 + 10 == 40 and 30 + 2*10 == 50
```

### Example 2 (medium): three machines and the one with hours to spare
A workshop makes $x$ tables and $y$ cabinets a week. Cutting allows $2x + y \le 40$ hours, assembly $x + y \le 24$ hours and finishing $x + 3y \le 60$ hours. A table earns 30 and a cabinet 20. Find the best plan, the binding constraints and the unused finishing hours. What happens if the profit per table rises to 45?

1. Axis corners: $x = \min(20, 24, 60) = 20$ and $y = \min(40, 24, 20) = 20$, giving $(20, 0)$ and $(0, 20)$.
   *Why:* cutting stops a tables-only plan first, finishing stops a cabinets-only plan first.
2. Cutting and assembly: subtract to get $x = 16$, then $y = 8$; finishing uses $16 + 24 = 40 \le 60$. Assembly and finishing: subtract to get $2y = 36$, so $y = 18$, $x = 6$; cutting uses $12 + 18 = 30 \le 40$. Both $(16, 8)$ and $(6, 18)$ are corners.
   *Why:* a crossing point is a corner only if it satisfies the third constraint too. Cutting and finishing cross at $(12, 16)$, which needs $28 > 24$ assembly hours, so that point is outside the region.
3. $\pi(20, 0) = 600$, $\pi(16, 8) = 640$, $\pi(6, 18) = 540$, $\pi(0, 20) = 400$, so the best plan is $(16, 8)$ with profit 640.
   *Why:* compare the objective at every corner; the origin earns 0.
4. Cutting ($40 = 40$) and assembly ($24 = 24$) are binding; finishing uses 40 hours, so $60 - 40 = 20$ hours are unused.
   *Why:* the binding constraints are the two lines through the optimal corner; the finishing line misses it, so finishing has slack.
5. With 45 per table: $\pi(20, 0) = 900$, $\pi(16, 8) = 880$, $\pi(6, 18) = 630$, $\pi(0, 20) = 400$. The best plan jumps to $(20, 0)$, where only cutting is binding (4 assembly and 40 finishing hours spare).
   *Why:* the iso-profit slope $-45/20 = -2.25$ is now steeper than the cutting line ($-2$), so the line last touches the region at the corner on the $x$-axis. The optimum does not move gradually; it jumps from corner to corner.

```verify
p = 30; q = 20
assert min([40/2, 24/1, 60/1]) == 20
assert min([40/1, 24/1, 60/3]) == 20
v1 = lusolve([2, 1; 1, 1], [40; 24])
assert abs(v1[1,1] - 16) < 1e-9 and abs(v1[2,1] - 8) < 1e-9
v2 = lusolve([1, 1; 1, 3], [24; 60])
assert abs(v2[1,1] - 6) < 1e-9 and abs(v2[2,1] - 18) < 1e-9
w = lusolve([2, 1; 1, 3], [40; 60])
assert abs(w[1,1] - 12) < 1e-9 and abs(w[2,1] - 16) < 1e-9
assert 12 + 16 == 28
assert 16 + 3*8 == 40
assert 2*6 + 18 == 30
assert p*20 == 600
assert p*16 + q*8 == 640
assert p*6 + q*18 == 540
assert q*20 == 400
assert 60 - (16 + 3*8) == 20
p2 = 45
assert p2*20 == 900
assert p2*16 + q*8 == 880
assert p2*6 + q*18 == 630
assert -p2/q == -2.25
assert 24 - 20 == 4 and 60 - 20 == 40
```

### Example 3 (hard): the simplex method for the bakery
Solve the bakery problem of Example 1 with the simplex method and follow the corners it visits.

1. $x + y + s_1 = 40$, $\;x + 2y + s_2 = 50$, $\;z - 30x - 40y = 0$, all variables $\ge 0$.
   *Why:* the slack variables $s_1$ and $s_2$ are the unused oven and staff hours, so each $\le$ constraint becomes an equation.
2. $\begin{array}{c|rrrr|r} & x & y & s_1 & s_2 & \text{RHS} \\ \hline s_1 & 1 & 1 & 1 & 0 & 40 \\ s_2 & 1 & 2 & 0 & 1 & 50 \\ \hline z & -30 & -40 & 0 & 0 & 0 \end{array}$
   *Why:* the starting corner is the origin: $x = y = 0$, all hours unused ($s_1 = 40$, $s_2 = 50$) and $z = 0$.
3. $y$ enters (most negative entry $-40$). Ratios: $40/1 = 40$ and $50/2 = 25$, so the $s_2$ row leaves and the pivot is 2.
   *Why:* each batch of pastries adds most profit, and staff hours run out first, after 25 batches.
4. $\begin{array}{c|rrrr|r} & x & y & s_1 & s_2 & \text{RHS} \\ \hline s_1 & \tfrac12 & 0 & 1 & -\tfrac12 & 15 \\ y & \tfrac12 & 1 & 0 & \tfrac12 & 25 \\ \hline z & -10 & 0 & 0 & 20 & 1{,}000 \end{array}$
   *Why:* divide the pivot row by 2, subtract the new row from the $s_1$ row and add 40 times it to the $z$ row. This is the corner $(0, 25)$: profit 1,000 with 15 oven hours unused.
5. $x$ enters ($-10$). Ratios: $15/\tfrac12 = 30$ and $25/\tfrac12 = 50$, so the $s_1$ row leaves and the pivot is $\tfrac12$.
   *Why:* a negative entry means profit can still rise; the smallest ratio keeps every variable non-negative.
6. $\begin{array}{c|rrrr|r} & x & y & s_1 & s_2 & \text{RHS} \\ \hline x & 1 & 0 & 2 & -1 & 30 \\ y & 0 & 1 & -1 & 1 & 10 \\ \hline z & 0 & 0 & 20 & 10 & 1{,}300 \end{array}$
   *Why:* double the pivot row, subtract half of it from the $y$ row and add 10 times it to the $z$ row. No negative entry is left in the $z$ row, so this corner is optimal: $x = 30$, $y = 10$, $z = 1{,}300$.
7. The method visited $(0, 0) \to (0, 25) \to (30, 10)$ and found the same plan as Example 1.
   *Why:* each pivot moves to a neighbouring corner with higher profit. The entries 20 and 10 under $s_1$ and $s_2$ are the shadow prices of an oven hour and a staff hour (OP03).

```verify
R1 = [1, 1, 1, 0, 40]; R2 = [1, 2, 0, 1, 50]; Z = [-30, -40, 0, 0, 0]
assert min([40/1, 50/2]) == 25
S2 = R2/2
S1 = R1 - S2
Y = Z + 40*S2
assert deepEqual(S2, [0.5, 1, 0, 0.5, 25])
assert deepEqual(S1, [0.5, 0, 1, -0.5, 15])
assert deepEqual(Y, [-10, 0, 0, 20, 1000])
assert 15/0.5 == 30 and 25/0.5 == 50
T1 = S1*2
T2 = S2 - 0.5*T1
W = Y + 10*T1
assert deepEqual(T1, [1, 0, 2, -1, 30])
assert deepEqual(T2, [0, 1, -1, 1, 10])
assert deepEqual(W, [0, 0, 20, 10, 1300])
assert 30*30 + 40*10 == 1300
assert 30 + 10 == 40 and 30 + 2*10 == 50
```

## Common mistakes
- Stopping at the first corner found, or at the corner where both lines cross, without comparing the profit at every corner (OTHER_CORNER).
- Leaving out a constraint when finding a corner: in Example 1, staff hours would allow 50 batches of bread, but the oven allows only 40, so $(50, 0)$ is not a feasible plan (IGNORED_CONSTRAINT).
- Giving the hours a machine uses at the optimum instead of the hours left over (USED_NOT_UNUSED).
- Assuming every machine is fully used at the best plan: only the constraints through the optimal corner are binding (ASSUMED_BINDING).
- In a cost-minimisation with "at least" requirements, choosing the origin because it costs nothing (INFEASIBLE_ORIGIN).
- Treating every crossing of two constraint lines as a corner: in Example 2, cutting and finishing cross at $(12, 16)$, which breaks the assembly limit.
- Shading the wrong side of a $\ge$ constraint, or forgetting $x, y \ge 0$.
- In the simplex ratio test, picking the largest ratio or dividing by a zero or negative entry; both lead to a plan with a negative variable.

## Practice
- `lp-max-profit-two-products` (difficulty 1): the largest profit of a two-product plan with two machine-hour limits, by comparing the corners; distractors OTHER_CORNER, IGNORED_CONSTRAINT.
- `lp-unused-hours-at-optimum` (difficulty 2): with three machine limits, the unused hours of the one machine that is not binding at the best plan; distractors USED_NOT_UNUSED, ASSUMED_BINDING, OTHER_CORNER.
- `lp-min-cost-feed-blend` (difficulty 3): the cheapest blend of two feeds that meets a protein and a fibre requirement; distractors OTHER_CORNER, IGNORED_CONSTRAINT, INFEASIBLE_ORIGIN.

## Real world
- History: Leonid Kantorovich developed the first linear-programming methods in 1939 to plan production at a plywood trust, and George Dantzig created the simplex method in 1947 for US Air Force planning. Kantorovich shared the 1975 Nobel prize in economics with Tjalling Koopmans for the theory of the optimal allocation of resources.
- Blending: oil refineries, feed mills and food manufacturers run linear programmes every day to choose the cheapest mix of inputs that meets quality, nutrient and volume targets.
- Planning: airlines, railways and delivery firms use linear programming, often with whole-number variables (OP06), to schedule crews, vehicles and routes; shipping goods from plants to markets is the transportation problem (OP05).
- Policy: planners and development economists use linear-programming models of farms, energy systems and whole economies to see which resources are the bottlenecks and what extra capacity would be worth.

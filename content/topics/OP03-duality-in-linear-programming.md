---
id: OP03
title: Duality in linear programming
block: OP
coreYear: 3
prerequisites: [OP02, MV09]
estMinutes: 50
status: draft
economicUses:
  - Valuing scarce machine hours, land, labour or materials inside a firm
  - Deciding whether renting extra capacity is worth its price
  - Spotting resources in surplus, whose shadow price is zero
  - Pricing inputs in planning models and in electricity and transport networks
searchTerms:
  - "Dual problem"
  - "Shadow prices of resources"
  - "Duality theorem"
generators: [lp-dual-shadow-price, lp-dual-profit-change, lp-dual-price-three-machines]
widgets: [lp-shadow-price-hours]
mistakeCodes:
  OTHER_RESOURCE_PRICE:
    label: Gave the other resource's shadow price
    explanation: Solving the dual gives one price per resource. Check which variable belongs to the resource in the question; each machine's hours have their own value.
  PROFIT_PER_HOUR:
    label: Used a product's profit per hour as the price
    explanation: Profit per hour of one product ignores the other limits. An extra hour lets the firm shift the whole plan, and the shadow price is what that shift adds; find it from the dual equations, not by dividing one product's profit by its hours.
  PRIMAL_QUANTITY:
    label: Gave a quantity produced, not a price
    explanation: The primal equations give how much of each product to make. The shadow prices come from the dual, whose equations use the columns of the hours table (one equation per product, with the profits on the right).
  TOTAL_NOT_CHANGE:
    label: Gave the new profit, not the change
    explanation: The question asks how much the maximum profit rises. That is the extra hours times the shadow price; do not add the old profit.
  SLACK_NOT_PRICE:
    label: Gave the spare hours, not the price
    explanation: A resource with hours left over at the best plan has shadow price 0, because one more hour would only add to the spare hours. The number of spare hours is its slack, not its price.
  WRONG_BINDING_PAIR:
    label: Used a resource with spare hours in the price equations
    explanation: Only the binding resources have positive prices. Solve the primal first, find which constraints hold with equality at the best plan, set the price of every other resource to 0, and solve the dual equations for the binding ones.
resources:
  - { title: "Applied Finite Mathematics (Sekhon and Bloom), 4.3: Minimization by the Simplex Method (LibreTexts)", url: "https://math.libretexts.org/Bookshelves/Applied_Mathematics/Applied_Finite_Mathematics_(Sekhon_and_Bloom)/04%3A_Linear_Programming_The_Simplex_Method/4.03%3A_Minimization_By_The_Simplex_Method", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Optimization Methods in Management Science (15.053), Lecture Notes: duality, sensitivity analysis and shadow prices (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/15-053-optimization-methods-in-management-science-spring-2013/pages/lecture-notes/", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
Linear programming (OP02) tells a firm what to produce. Duality answers the next question: what is each scarce resource worth? If one more machine hour would raise the maximum profit by 10, then 10 is the most the firm should pay to rent that hour, and a machine with hours left over is worth nothing extra. These values, the **shadow prices**, are prices that no market sets: they come out of the firm's own technology and limits. Economists use them to value inputs, to judge whether expanding capacity pays, and to understand how prices could guide a whole planned economy, the question that won Kantorovich and Koopmans the 1975 Nobel prize.

## Intuition
Picture a firm that makes tables and cabinets on three machines. A buyer arrives and offers to rent all of its machine hours for a week. The buyer names a price per hour on each machine. The firm agrees only if renting out pays at least as well as producing: for every product, the hours one unit uses, valued at the buyer's prices, must be worth at least the profit that unit would earn. Among the price lists the firm would accept, the buyer chooses the cheapest. That is the **dual problem**; the firm's own problem is the **primal**.

Any price list the firm accepts costs the buyer at least as much as any plan the firm could earn, since the firm turns down every offer worth less than producing. So every acceptable rent is an upper bound on profit (**weak duality**). At the cheapest acceptable rent the two numbers meet: the minimum rent equals the maximum profit (**strong duality**). The buyer's prices at that point are the shadow prices. A machine with hours to spare gets price 0, because the firm loses nothing by renting out hours it does not use. A product the firm makes earns exactly the value of the hours it uses; a product whose hours are worth more than its profit is not made (**complementary slackness**).

## Definition and formulas
**Primal and dual.** For a production problem with $n$ products and $m$ resources, profits $\mathbf{c}$, hours available $\mathbf{b}$ and the hours table $A$ ($a_{ij}$ = hours of resource $i$ per unit of product $j$):
$$\text{primal: } \max\ \mathbf{c}^{\mathsf T}\mathbf{x} \ \text{ s.t. } A\mathbf{x} \le \mathbf{b},\ \mathbf{x} \ge \mathbf{0} \qquad\qquad \text{dual: } \min\ \mathbf{b}^{\mathsf T}\mathbf{y} \ \text{ s.t. } A^{\mathsf T}\mathbf{y} \ge \mathbf{c},\ \mathbf{y} \ge \mathbf{0}.$$
The dual variable $y_i$ is the value of one unit of resource $i$.

**Rules for building the dual** of a standard maximisation:
1. one dual variable $y_i \ge 0$ for each $\le$ constraint (each resource);
2. one dual constraint, with $\ge$, for each primal variable (each product);
3. the coefficients of a dual constraint are a *column* of $A$, the hours one unit of that product uses: the dual uses the transpose $A^{\mathsf T}$;
4. the primal profits $\mathbf{c}$ become the dual right-hand sides, and the primal right-hand sides $\mathbf{b}$ become the dual objective, which is minimised.

The dual of the dual is the primal again. A primal $\ge$ constraint can be multiplied by $-1$ first; an equality constraint gives a dual variable that may have either sign.

**Weak duality.** For any feasible $\mathbf{x}$ and any feasible $\mathbf{y}$,
$$\mathbf{c}^{\mathsf T}\mathbf{x} \le (A^{\mathsf T}\mathbf{y})^{\mathsf T}\mathbf{x} = \mathbf{y}^{\mathsf T}(A\mathbf{x}) \le \mathbf{y}^{\mathsf T}\mathbf{b},$$
using $\mathbf{x} \ge \mathbf{0}$ in the first step and $\mathbf{y} \ge \mathbf{0}$ in the last. Every feasible dual value is an upper bound on the maximum profit. So if a feasible $\mathbf{x}$ and a feasible $\mathbf{y}$ give equal values, both are optimal. If the primal is unbounded, the dual has no feasible point.

**Strong duality.** If the primal has an optimal solution, so does the dual, and the optimal values are equal: $\max \mathbf{c}^{\mathsf T}\mathbf{x} = \min \mathbf{b}^{\mathsf T}\mathbf{y}$. The total value of the resources at their shadow prices equals the maximum profit.

**Complementary slackness.** Feasible $\mathbf{x}$ and $\mathbf{y}$ are both optimal exactly when
$$y_i \cdot s_i = 0 \ \text{ for every resource } i, \qquad x_j \cdot \big((A^{\mathsf T}\mathbf{y})_j - c_j\big) = 0 \ \text{ for every product } j,$$
where $s_i = b_i - (A\mathbf{x})_i$ is the slack of resource $i$. In words: a resource with spare units has shadow price 0, and a resource with a positive price is used up; a product that is made has zero **opportunity loss** (the hours it uses, valued at the shadow prices, are worth exactly its profit), and a product with a positive opportunity loss is not made.

**Shadow price.** The optimal $y_i$ is the rise in maximum profit from one more unit of resource $i$; $\Delta b_i$ extra units raise it by $y_i\,\Delta b_i$. It is the most the firm should pay for an extra unit. In calculus-based optimisation the same idea appears as the Lagrange multiplier of a constraint (MV09).

**Reading the shadow prices from the final simplex tableau.** In the last tableau of OP02 Example 3 the objective row is $0,\ 0,\ 20,\ 10 \mid 1{,}300$. The entries under the slack variables are the shadow prices: 20 for an oven hour and 10 for a staff hour. The entries under the products are their opportunity losses (0 for every product that is made), and the right-hand side is the common optimal value of the primal and the dual.

**Range of validity.** A shadow price holds only while the same constraints stay binding at the optimum. Adding hours moves the optimal corner along the lines of the other binding constraints; once the corner reaches another constraint or an axis, a different set of constraints binds and the price changes, usually falling. Beyond the point where a resource stops being a bottleneck its price is 0. Spreadsheet solvers report this range as an "allowable increase" and "allowable decrease".

## Interactive
::widget{id="lp-shadow-price-hours"}

The top graph is the workshop of Example 2: the shaded region holds every plan of tables and cabinets that fits the cutting hours (gold line), 24 assembly hours and 60 finishing hours, and the dot is the best plan. The bottom graph shows the maximum profit for every number of cutting hours. Move **Cutting hours available** and watch the panel: the maximum profit, the shadow price of cutting (the extra profit from one more hour) and whether cutting is binding. Check: at 40 hours the panel shows a maximum profit of 640 and a shadow price of 10; at 45 hours it shows 690, which is $640 + 5 \times 10$. From 20 to 29 hours the price is 14 and below 20 hours it is 20, while at 48 hours and above it drops to 0: assembly has become the only bottleneck. The bottom curve is made of straight pieces, and the slope of each piece is the shadow price over that range.

## Worked examples

### Example 1 (easy): the bakery's dual
The bakery of OP02 Example 1 maximises $\pi = 30x + 40y$ subject to $x + y \le 40$ (oven hours) and $x + 2y \le 50$ (staff hours), $x, y \ge 0$. Its best plan is 30 batches of bread and 10 of pastries, with profit 1,300. Write the dual, check weak duality with one feasible plan and one feasible price list, and find the shadow prices.

1. Minimise $W = 40u + 50v$ subject to $u + v \ge 30$ (bread), $u + 2v \ge 40$ (pastries), $u, v \ge 0$.
   *Why:* $u$ and $v$ are the values of an oven hour and a staff hour. A batch of bread uses 1 oven hour and 1 staff hour, so at these prices its hours are worth $u + v$, which must be at least its profit of 30; pastries likewise. Renting all the hours costs $40u + 50v$.
2. The plan $(20, 10)$ uses $30 \le 40$ oven and $40 \le 50$ staff hours and earns $\pi = 1{,}000$. The prices $(u, v) = (30, 10)$ give $40 \ge 30$ and $50 \ge 40$ and cost $W = 1{,}200 + 500 = 1{,}700$. So $1{,}000 \le \pi_{\max} \le 1{,}700$.
   *Why:* weak duality: any feasible plan is a lower bound on the maximum profit and any feasible price list is an upper bound.
3. Both products are made at the best plan, so $u + v = 30$ and $u + 2v = 40$. Subtracting gives $v = 10$, then $u = 20$.
   *Why:* complementary slackness: a product that is made earns exactly the value of the hours it uses, so its dual constraint holds with equality.
4. $W = 40 \cdot 20 + 50 \cdot 10 = 800 + 500 = 1{,}300 = \pi_{\max}$.
   *Why:* the prices are feasible (both non-negative, both constraints met), and they give the same value as the best plan, so by weak duality both are optimal.
5. An extra oven hour is worth 20 and an extra staff hour 10, the same numbers as the objective row of OP02's final simplex tableau.
   *Why:* the optimal dual values are the shadow prices. The bakery should rent extra oven time only if it costs less than 20 an hour.

```verify
s = lusolve([1, 1; 1, 2], [30; 40])
u = s[1,1]; v = s[2,1]
assert abs(u - 20) < 1e-9 and abs(v - 10) < 1e-9
assert 20 + 10 <= 40 and 20 + 2*10 <= 50
assert 30*20 + 40*10 == 1000
assert 30 + 10 >= 30 and 30 + 2*10 >= 40
assert 40*30 + 50*10 == 1700
assert 40*20 + 50*10 == 1300
assert 30*30 + 40*10 == 1300
assert 1000 <= 1300 and 1300 <= 1700
```

### Example 2 (medium): three machines, one with hours to spare
The workshop of OP02 Example 2 maximises $\pi = 30x + 20y$ ($x$ tables, $y$ cabinets) subject to cutting $2x + y \le 40$, assembly $x + y \le 24$ and finishing $x + 3y \le 60$. Its best plan is $(16, 8)$ with profit 640. Find the shadow prices $y_C, y_A, y_F$ of the three machines, the gain from 5 extra cutting hours, and the range of cutting hours over which the cutting price holds.

1. Finishing uses $16 + 3 \cdot 8 = 40 < 60$ hours, so $y_F = 0$.
   *Why:* complementary slackness: finishing has 20 hours to spare, so one more finishing hour adds nothing.
2. Both products are made: $2y_C + y_A + y_F = 30$ and $y_C + y_A + 3y_F = 20$. With $y_F = 0$, subtract to get $y_C = 10$, then $y_A = 10$.
   *Why:* the dual constraint of each product holds with equality; the coefficients are the hours a table and a cabinet use on the three machines (the columns of the hours table).
3. $40 \cdot 10 + 24 \cdot 10 + 60 \cdot 0 = 640 = \pi_{\max}$.
   *Why:* the prices are non-negative and meet both dual constraints, and their value equals the best profit, so they are the optimal dual solution (strong duality).
4. Five more cutting hours: $\Delta\pi = 5 \times 10 = 50$. Check: $2x + y = 45$ and $x + y = 24$ give $(21, 3)$, which uses $21 + 9 = 30 \le 60$ finishing hours and earns $630 + 60 = 690 = 640 + 50$.
   *Why:* while cutting and assembly stay binding, each extra cutting hour adds its shadow price.
5. With $c$ cutting hours the corner is $x = c - 24$, $y = 48 - c$. It needs $y \ge 0$, so $c \le 48$, and finishing $(c - 24) + 3(48 - c) = 120 - 2c \le 60$, so $c \ge 30$. The price 10 holds for $30 \le c \le 48$.
   *Why:* outside this range another constraint binds. Above 48 hours assembly alone stops the plan at 24 tables and cutting has spare hours (price 0); below 30 hours finishing binds instead of assembly and the cutting price is 14, as the Try it graph shows.

```verify
assert 16 + 3*8 == 40 and 60 - 40 == 20
s = lusolve([2, 1; 1, 1], [30; 20])
yc = s[1,1]; ya = s[2,1]
assert abs(yc - 10) < 1e-9 and abs(ya - 10) < 1e-9
assert 40*10 + 24*10 + 60*0 == 640
assert 30*16 + 20*8 == 640
assert 5*10 == 50
w = lusolve([2, 1; 1, 1], [45; 24])
assert abs(w[1,1] - 21) < 1e-9 and abs(w[2,1] - 3) < 1e-9
assert 21 + 3*3 == 30
assert 30*21 + 20*3 == 690 and 690 == 640 + 50
# the corner of cutting and assembly as c varies: x = c - 24, y = 48 - c
c1 = 30
assert (c1 - 24) + 3*(48 - c1) == 60
c2 = 48
assert 48 - c2 == 0 and c2 - 24 == 24
assert 120 - 2*30 == 60
# below 30 hours cutting and finishing bind: 2yC + yF = 30, yC + 3yF = 20
t = lusolve([2, 1; 1, 3], [30; 20])
assert abs(t[1,1] - 14) < 1e-9 and abs(t[2,1] - 2) < 1e-9
```

### Example 3 (hard): three products, solved through the dual
A furniture maker makes chairs $x_1$, tables $x_2$ and desks $x_3$. A chair uses 1 carpentry hour and 2 finishing hours and earns 20; a table uses 2 and 1 and earns 25; a desk uses 2 and 2 and earns 28. There are 100 carpentry and 110 finishing hours a week. The primal, maximise $20x_1 + 25x_2 + 28x_3$ subject to $x_1 + 2x_2 + 2x_3 \le 100$ and $2x_1 + x_2 + 2x_3 \le 110$, has three variables and cannot be drawn. Solve its two-variable dual graphically and recover the best plan.

1. Minimise $W = 100u + 110v$ subject to $u + 2v \ge 20$ (chair), $2u + v \ge 25$ (table), $2u + 2v \ge 28$ (desk), $u, v \ge 0$.
   *Why:* one price per resource ($u$ carpentry, $v$ finishing) and one constraint per product, built from that product's column of hours.
2. Corners of the dual region: on the $v$-axis $v = \max(10, 25, 14) = 25$, giving $(0, 25)$; on the $u$-axis $u = \max(20, 12.5, 14) = 20$, giving $(20, 0)$; the chair and table lines cross at $(10, 5)$, where the desk constraint gives $30 \ge 28$.
   *Why:* the region lies above all three lines, so on each axis the largest requirement sets the corner. The other crossings break a constraint: table and desk meet at $(11, 3)$, where the chair line gives $17 < 20$; chair and desk meet at $(8, 6)$, where the table line gives $22 < 25$.
3. $W(0, 25) = 2{,}750$, $W(10, 5) = 1{,}550$, $W(20, 0) = 2{,}000$. The minimum is 1,550 at $u = 10$, $v = 5$.
   *Why:* a linear objective is smallest at a corner of the region (OP02), and here the region's corners are these three.
4. Desk: $2 \cdot 10 + 2 \cdot 5 = 30 > 28$, so $x_3 = 0$. Both prices are positive, so both resources are used up: $x_1 + 2x_2 = 100$ and $2x_1 + x_2 = 110$ give $x_1 = 40$, $x_2 = 30$.
   *Why:* complementary slackness. A desk would use hours worth 30 to earn 28, an opportunity loss of 2, so no desks are made; a resource with a positive price has no slack.
5. $\pi = 20 \cdot 40 + 25 \cdot 30 = 800 + 750 = 1{,}550 = W_{\min}$.
   *Why:* strong duality confirms the plan is optimal. The desk's profit would have to reach 30 before desks pay their way.

```verify
s = lusolve([1, 2; 2, 1], [20; 25])
u = s[1,1]; v = s[2,1]
assert abs(u - 10) < 1e-9 and abs(v - 5) < 1e-9
assert max([20/2, 25/1, 28/2]) == 25
assert max([20/1, 25/2, 28/2]) == 20
assert 2*u + 2*v == 30 and 30 > 28
t = lusolve([2, 1; 2, 2], [25; 28])
assert abs(t[1,1] - 11) < 1e-9 and abs(t[2,1] - 3) < 1e-9
assert 11 + 2*3 == 17 and 17 < 20
r = lusolve([1, 2; 2, 2], [20; 28])
assert abs(r[1,1] - 8) < 1e-9 and abs(r[2,1] - 6) < 1e-9
assert 2*8 + 6 == 22 and 22 < 25
assert 100*0 + 110*25 == 2750
assert 100*u + 110*v == 1550
assert 100*20 + 110*0 == 2000
q = lusolve([1, 2; 2, 1], [100; 110])
assert abs(q[1,1] - 40) < 1e-9 and abs(q[2,1] - 30) < 1e-9
assert 20*40 + 25*30 == 1550
assert 30 - 28 == 2
```

## Common mistakes
- Giving the shadow price of the other resource: in Example 1 the oven is worth 20 an hour and staff time 10 (OTHER_RESOURCE_PRICE).
- Taking a product's profit per machine hour as the machine's price: in Example 1 a batch of pastries earns 40 per oven hour, but an extra oven hour adds only 20, because the plan must also respect the staff hours (PROFIT_PER_HOUR).
- Solving the primal equations instead of the dual ones and giving a quantity produced as the price (PRIMAL_QUANTITY).
- Giving the new maximum profit when the question asks how much it rises (TOTAL_NOT_CHANGE).
- Giving the spare hours of a slack resource as its price: in Example 2 finishing has 20 spare hours, and its shadow price is 0 (SLACK_NOT_PRICE).
- Putting a resource with spare hours into the price equations instead of setting its price to 0 (WRONG_BINDING_PAIR).
- Building the dual from the rows of the hours table instead of its columns, or writing the dual constraints with $\le$ instead of $\ge$.
- Using a shadow price outside its range: in Example 2, 20 extra cutting hours do not add $20 \times 10 = 200$, because above 48 hours cutting is no longer a bottleneck.

## Practice
- `lp-dual-shadow-price` (difficulty 1): the shadow price of one machine when two machines are both fully used, from the two dual equations; distractors OTHER_RESOURCE_PRICE, PROFIT_PER_HOUR, PRIMAL_QUANTITY.
- `lp-dual-profit-change` (difficulty 2): the rise in maximum profit when one fully used machine gets a few extra hours (extra hours × shadow price); distractors OTHER_RESOURCE_PRICE, PROFIT_PER_HOUR, TOTAL_NOT_CHANGE.
- `lp-dual-price-three-machines` (difficulty 3): with three machines, the shadow price of a named machine, using complementary slackness (the one with spare hours has price 0); distractors SLACK_NOT_PRICE, WRONG_BINDING_PAIR, OTHER_RESOURCE_PRICE, PROFIT_PER_HOUR.

## Real world
- History: Kantorovich called the dual values "objectively determined valuations" and argued that planners could use them to price scarce resources; Koopmans developed the same ideas for allocating resources and transport. They shared the 1975 Nobel prize in economics.
- Business: the sensitivity report of a spreadsheet solver lists each constraint's shadow price with its allowable increase and decrease, so managers can see which bottleneck is worth expanding and by how much.
- Electricity markets: many grid operators set wholesale prices at each node of the network from the dual values of the balance constraints in their least-cost dispatch problem; these are called locational marginal prices.
- Agriculture and water: farm planning models report the shadow price of land, irrigation water or family labour, which economists compare with rents and wages to judge whether buying or renting more would pay.

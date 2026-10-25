---
id: OP05
title: The transportation problem
block: OP
coreYear: 3
prerequisites: [OP02]
estMinutes: 50
status: draft
economicUses:
  - "Logistics: which plant or warehouse should supply which customer, and how much"
  - Delivering cement, fuel or food at the lowest total shipping cost
  - "Spare capacity and unmet demand: what a dummy row or column tells a manager"
  - "Valuing routes: the reduced cost says how much a route must get cheaper before it is used"
searchTerms:
  - "Transportation problem"
  - "North-west corner method"
generators: [transport-north-west-cost, transport-two-source-minimum-cost, transport-reduced-cost-empty-cell]
widgets: [cement-shipping-plan]
mistakeCodes:
  NOT_BALANCED:
    label: Did not balance supply and demand
    explanation: The methods need total supply = total demand. If supply is larger, add a dummy destination that takes the extra at zero cost; if demand is larger, add a dummy source that covers the shortage at zero cost.
  LEAST_COST_RULE:
    label: Used the least-cost method instead of the north-west corner rule
    explanation: The north-west corner rule ignores the costs. Start in the top-left cell and move only right or down, filling each cell with as much as its row and column still allow.
  MISSED_ALLOCATION:
    label: Left out the last shipment
    explanation: A non-degenerate starting plan uses m + n − 1 cells. Count your shipments; the last cell, bottom right in the north-west corner rule, also has to be paid for.
  AVERAGE_COST:
    label: Multiplied the total by the average unit cost
    explanation: Routes are not used equally, so the average of the unit costs says nothing about the plan. Multiply each shipment by its own unit cost and add the products.
  NORTH_WEST_START:
    label: Gave the cost of the north-west starting plan
    explanation: The north-west corner rule only gives a starting plan, chosen without looking at the costs. Shift shipments towards cheaper routes until no move lowers the cost.
  LEAST_COST_START:
    label: Gave the cost of the least-cost starting plan
    explanation: Filling the cheapest cells first is greedy and can force expensive cells later. Check the plan with the potentials method, or compare the cost gaps between the two sources, before calling it optimal.
  IGNORED_SUPPLY_LIMIT:
    label: Sent every order from its cheapest source
    explanation: Each destination served from its cheapest source would be ideal, but the cheap source usually cannot make that much. Respect every capacity; the lowest feasible cost is higher.
  REDUCED_SIGN:
    label: Reversed the sign of the reduced cost
    explanation: The reduced cost is Δᵢⱼ = cᵢⱼ − uᵢ − vⱼ, the true cost minus the cost implied by the potentials. A negative value means the route would save money.
  IMPLIED_COST:
    label: Gave uᵢ + vⱼ instead of the reduced cost
    explanation: uᵢ + vⱼ is the cost the current plan implies for the route. The reduced cost compares it with the real cost, Δᵢⱼ = cᵢⱼ − (uᵢ + vⱼ).
resources:
  - { title: "Optimization Methods in Management Science (MIT OpenCourseWare, 15.053)", url: "https://ocw.mit.edu/courses/15-053-optimization-methods-in-management-science-spring-2013/", kind: course, verifiedAt: 2026-10-18 }
  - { title: "Optimization Methods in Management Science: lecture notes, including network flows (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/15-053-optimization-methods-in-management-science-spring-2013/pages/lecture-notes/", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
A cement producer has two plants and three building sites to deliver to this week. Each plant can make only so much, each site needs a fixed amount, and a tonne costs a different amount to move along each route. Which plant should supply which site? Cement is heavy and cheap, so transport is a large part of its delivered price, and the choice matters: for the plants and sites of Example 1 below, a plan made without looking at costs is about 38 % dearer than the best one (730 against 530). The same question arises for warehouses and shops, oil terminals and refineries, or grain silos and ports.

## Intuition
Picture a table: one row for each source (plant), one column for each destination (site), and in each cell the cost of moving one unit along that route. A shipping plan writes an amount into the cells so that every row adds up to what the source makes and every column adds up to what the destination needs.

Two forces pull against each other. Every site would like to be served by its cheapest plant, but the cheapest plant cannot serve everybody. The best plan is a compromise: a plant goes first to the destinations where its advantage over the other plants is largest.

Because the problem is a linear programme (OP02) with a very regular shape, it has its own shortcuts. You build a reasonable starting plan with a simple rule, then test each empty route: "if I sent one unit this way and rearranged the others to keep every total right, would the bill go down?" If no route passes the test, the plan is optimal.

## Definition and formulas
**The model.** There are $m$ sources with supplies $a_1, \dots, a_m$ and $n$ destinations with demands $b_1, \dots, b_n$. Shipping one unit from source $i$ to destination $j$ costs $c_{ij}$, and $x_{ij}$ is the amount shipped. As a linear programme:
$$\min \sum_{i=1}^{m}\sum_{j=1}^{n} c_{ij}x_{ij} \quad \text{subject to} \quad \sum_{j} x_{ij} = a_i \ (i = 1, \dots, m), \qquad \sum_{i} x_{ij} = b_j \ (j = 1, \dots, n), \qquad x_{ij} \ge 0.$$

- **Balanced** problem: $\sum_i a_i = \sum_j b_j$. There are $mn$ variables and $m + n$ constraints, but one constraint is redundant: the supply rows and the demand columns both add up to the same total. So only $m + n - 1$ constraints are independent.
- **Unbalanced** problem: if supply exceeds demand, add a **dummy destination** whose demand is the excess and whose costs are all 0; what a source "ships" to it is capacity it leaves unused. If demand exceeds supply, add a **dummy source** with zero costs; what it "ships" is demand left unmet.
- A **basic feasible solution** (a starting plan from one of the rules below) uses $m + n - 1$ cells, the **basic cells**. If a row and a column run out at the same moment before the last cell, the plan has fewer positive cells; this is **degeneracy**, and you keep a shipment of 0 in one extra cell so that there are still $m + n - 1$ basic cells. With whole-number supplies and demands, all three rules and the improvement step give whole-number shipments.

**Starting plans.** In each rule, a chosen cell gets $\min(\text{supply left}, \text{demand left})$, then the row or column that runs out is crossed off.
- **North-west corner rule:** start in the top-left cell and move right when a column is satisfied or down when a row is used up. Fast, but it ignores the costs.
- **Least-cost method:** fill the cheapest cell still open, then the next cheapest, and so on.
- **Vogel's approximation method (VAM):** for every open row and column, the **penalty** is the difference between its two smallest costs, which is what you lose if you cannot use its cheapest cell. Pick the row or column with the largest penalty and fill its cheapest cell. VAM usually starts close to the optimum.

**Checking optimality: the potentials (MODI, u–v) method.** Give each row a potential $u_i$ and each column a potential $v_j$ such that, on every basic cell,
$$u_i + v_j = c_{ij}, \qquad u_1 = 0.$$
These are $m + n - 1$ equations in $m + n$ unknowns, so fix $u_1 = 0$ and solve one cell at a time. For every empty cell, the **reduced cost** (opportunity cost) is
$$\Delta_{ij} = c_{ij} - u_i - v_j.$$
If every $\Delta_{ij} \ge 0$, no route can lower the cost and the plan is optimal. If some $\Delta_{ij} < 0$, each unit sent along that route saves $|\Delta_{ij}|$.

**Improving along a closed loop.** From the empty cell with the most negative $\Delta$, draw a closed path that turns only at basic cells, moving along rows and columns in turn. Mark the cells $+, -, +, -, \dots$ starting with $+$ at the empty cell. Let $\theta$ be the smallest shipment on a $-$ cell; add $\theta$ on the $+$ cells and subtract it on the $-$ cells. Every row and column total stays the same, a $-$ cell drops to 0 and leaves the basis, and the total cost changes by $\theta\,\Delta_{ij}$. Then recompute the potentials and test again.

**A shortcut for two sources.** With $m = 2$, source 2 ships whatever source 1 leaves: $x_{2j} = b_j - x_{1j}$. Then
$$\text{cost} = \sum_j c_{2j}b_j + \sum_j d_j\,x_{1j}, \qquad d_j = c_{1j} - c_{2j},$$
and source 1 should fill the destinations in order of $d_j$, smallest first, until its supply is used up. In Example 1 below, $d = (-2,\ 3,\ -4)$, so plant 1 sends all its 50 tonnes to site 3, plant 2 sends 30 and 40 tonnes to sites 1 and 2, and the cost is $3 \cdot 50 + 6 \cdot 30 + 5 \cdot 40 = 530$, far below the north-west plan's 730. Serving every site from its cheaper plant would cost only 470, but plant 1 would then need 80 tonnes, more than it makes.

## Interactive
::widget{id="cement-shipping-plan"}

This is the cement problem of Example 1, with plant A for $P_1$ and plant B for $P_2$: three sites need 30, 40 and 50 tonnes. The table shows each route's cost per tonne and shades the cheapest plan. The panel compares its cost with the north-west corner plan. At the start it shows 530, 730 and a saving of 200. Move **Cost A → site 3** up to 9: the cheapest plan switches to A → 1 30 and A → 3 20 and costs 710, while the north-west plan still costs 730 because it never looks at costs. Then set the cost back to 3 and move **Plant A makes** to 80: plant A can now cover both sites where it beats plant B, and the cheapest cost falls to 470.

## Worked examples

### Example 1 (easy): a north-west corner plan for cement, then a dummy site
Plant $P_1$ makes 50 tonnes of cement and plant $P_2$ makes 70. Sites $S_1, S_2, S_3$ need 30, 40 and 50 tonnes. The cost per tonne is 4, 8, 3 from $P_1$ and 6, 5, 7 from $P_2$ to sites 1, 2, 3. Find the north-west corner plan and its cost. Then suppose $P_2$ can make 80 tonnes instead.

1. $50 + 70 = 120 = 30 + 40 + 50$
   *Why:* the problem is balanced, so the rules can be applied as they are.
2. $x_{11} = \min(50, 30) = 30$
   *Why:* start top-left with as much as row 1 and column 1 allow. Site 1 is now full, so move right; $P_1$ has 20 tonnes left.
3. $x_{12} = \min(20, 40) = 20$, then $x_{22} = 40 - 20 = 20$ and $x_{23} = 70 - 20 = 50$
   *Why:* $P_1$ is used up, so move down to $P_2$, which finishes site 2 and then gives its remaining 50 tonnes to site 3.
4. Basic cells: 4 $= m + n - 1 = 2 + 3 - 1$
   *Why:* every shipment closes a row or a column; the last one closes both, so 5 lines need 4 cells.
5. $\text{cost} = 4 \cdot 30 + 8 \cdot 20 + 5 \cdot 20 + 7 \cdot 50 = 730$
   *Why:* each used route costs its amount times its cost per tonne.
6. With $P_2 = 80$: supply 130 > demand 120, so add a dummy site $S_4$ needing 10 at cost 0. The rule ends with $x_{24} = 10$; the cost is still 730 and there are $2 + 4 - 1 = 5$ basic cells.
   *Why:* the dummy column makes the problem balanced. The 10 tonnes "shipped" to it are capacity that $P_2$ does not use.

```verify
s1 = 50; s2 = 70; d1 = 30; d2 = 40; d3 = 50
assert s1 + s2 == d1 + d2 + d3
x11 = min(s1, d1)
x12 = min(s1 - x11, d2)
x22 = d2 - x12
x23 = s2 - x22
assert x11 == 30
assert x12 == 20
assert x22 == 20
assert x23 == 50
assert x23 == d3
cost = 4*x11 + 8*x12 + 5*x22 + 7*x23
assert cost == 730
# dummy site with demand 10 when P2 makes 80
x24 = 80 - x22 - x23
assert x24 == 80 + s1 - (d1 + d2 + d3)
assert x24 == 10
assert cost + 0*x24 == 730
```

### Example 2 (medium): least-cost method and Vogel's approximation for oil
Terminals $T_1, T_2, T_3$ hold 30, 40 and 70 thousand barrels of crude; refineries $R_1, R_2, R_3$ need 60, 50 and 30. The cost per thousand barrels is $T_1$: 6, 3, 7; $T_2$: 10, 4, 11; $T_3$: 5, 12, 2 (to $R_1, R_2, R_3$). Find the starting plans of the least-cost method and of VAM and compare their costs.

1. $30 + 40 + 70 = 140 = 60 + 50 + 30$
   *Why:* balanced, so no dummy is needed.
2. Least-cost: $x_{33} = 30$, $x_{12} = 30$, $x_{22} = 20$, $x_{31} = 40$, $x_{21} = 20$
   *Why:* take the cells in order of cost 2, 3, 4, 5, then the last open cell. Each takes as much as its row and column still allow: $c_{33} = 2$ fills $R_3$; $c_{12} = 3$ uses up $T_1$; $c_{22} = 4$ finishes $R_2$ with 20; $c_{31} = 5$ gives $T_3$'s last 40 to $R_1$; $T_2$'s last 20 must go to $R_1$ at cost 10.
3. Least-cost total: $3 \cdot 30 + 10 \cdot 20 + 4 \cdot 20 + 5 \cdot 40 + 2 \cdot 30 = 630$
   *Why:* being greedy at the start forced the expensive route $T_2 \to R_1$ at the end.
4. VAM round 1: row penalties $3, 6, 3$; column penalties $1, 1, 5$. The largest is 6 (row $T_2$), so $x_{22} = \min(40, 50) = 40$
   *Why:* a penalty is the gap between the two cheapest costs in a line. $T_2$ loses most if it misses its cheapest route (4 against 10), so serve it first.
5. Round 2 (without $T_2$): rows $3, 3$; columns $1, 9, 5$. The largest is 9 (column $R_2$), so $x_{12} = \min(30, 10) = 10$. Round 3: rows $1, 3$; columns $1, 5$. The largest is 5 (column $R_3$), so $x_{33} = 30$. Only $R_1$ is left: $x_{11} = 20$, $x_{31} = 40$
   *Why:* recompute the penalties after each line is crossed off; $R_2$ now risks paying 12 instead of 3.
6. VAM total: $6 \cdot 20 + 3 \cdot 10 + 4 \cdot 40 + 5 \cdot 40 + 2 \cdot 30 = 570$
   *Why:* VAM looks one step ahead, so it avoids the expensive cell. For comparison, the north-west corner plan costs 1060. Each plan uses $3 + 3 - 1 = 5$ cells.

```verify
# least-cost plan
x33 = min(70, 30); x12 = min(30, 50); x22 = min(40, 50 - x12); x31 = min(70 - x33, 60); x21 = 40 - x22
assert deepEqual([x33, x12, x22, x31, x21], [30, 30, 20, 40, 20])
assert x21 + x31 == 60
lc = 3*x12 + 10*x21 + 4*x22 + 5*x31 + 2*x33
assert lc == 630
# VAM penalties, round 1
assert deepEqual([6-3, 10-4, 5-2], [3, 6, 3])
assert deepEqual([6-5, 4-3, 7-2], [1, 1, 5])
# round 2 (T2 removed)
assert deepEqual([12-3, 7-2], [9, 5])
# round 3 (T2 and R2 removed)
assert deepEqual([7-6, 5-2, 6-5, 7-2], [1, 3, 1, 5])
v22 = 40; v12 = 50 - v22; v33 = 30; v11 = 30 - v12; v31 = 60 - v11
assert v11 == 20
assert v31 == 40
assert v31 + v33 == 70
vam = 6*v11 + 3*v12 + 4*v22 + 5*v31 + 2*v33
assert vam == 570
nw = 6*30 + 10*30 + 4*10 + 12*40 + 2*30
assert nw == 1060
```

### Example 3 (hard): the potentials test and one improvement step
Start from the least-cost plan of Example 2 ($x_{12} = 30$, $x_{21} = 20$, $x_{22} = 20$, $x_{31} = 40$, $x_{33} = 30$, cost 630). Test it with the potentials method, improve it once, and show the new plan is optimal.

1. $u_1 = 0$, $v_2 = 3 - 0 = 3$, $u_2 = 4 - 3 = 1$, $v_1 = 10 - 1 = 9$, $u_3 = 5 - 9 = -4$, $v_3 = 2 - (-4) = 6$
   *Why:* on each basic cell $u_i + v_j = c_{ij}$; start from $u_1 = 0$ and the cell $(1,2)$, then follow the basic cells one at a time.
2. $\Delta_{11} = 6 - 0 - 9 = -3$, $\Delta_{13} = 7 - 0 - 6 = 1$, $\Delta_{23} = 11 - 1 - 6 = 4$, $\Delta_{32} = 12 + 4 - 3 = 13$
   *Why:* $\Delta_{ij} = c_{ij} - u_i - v_j$ for each empty cell. $\Delta_{11} < 0$, so the plan is not optimal: every thousand barrels sent $T_1 \to R_1$ saves 3.
3. Loop: $(1,1)^{+} \to (1,2)^{-} \to (2,2)^{+} \to (2,1)^{-}$, and $\theta = \min(30, 20) = 20$
   *Why:* sending more along $T_1 \to R_1$ means $T_1$ sends less to $R_2$, so $T_2$ must send more to $R_2$ and less to $R_1$; all totals stay right. $\theta$ is the largest shift before a $-$ cell would go negative.
4. New plan: $x_{11} = 20$, $x_{12} = 10$, $x_{22} = 40$, $x_{31} = 40$, $x_{33} = 30$; cost $= 630 + 20 \cdot (-3) = 570$
   *Why:* $x_{21}$ drops to 0 and leaves the basis; $(1,1)$ enters. The cost falls by $\theta \cdot |\Delta_{11}| = 60$.
5. New potentials $u = (0, 1, -1)$, $v = (6, 3, 3)$; $\Delta_{13} = 4$, $\Delta_{21} = 3$, $\Delta_{23} = 7$, $\Delta_{32} = 10$, all positive, so 570 is the minimum.
   *Why:* no empty route can lower the cost. This is the plan VAM found in Example 2.

```verify
c = [6, 3, 7; 10, 4, 11; 5, 12, 2]
u1 = 0; v2 = c[1,2] - u1; u2 = c[2,2] - v2; v1 = c[2,1] - u2; u3 = c[3,1] - v1; v3 = c[3,3] - u3
assert deepEqual([u1, u2, u3], [0, 1, -4])
assert deepEqual([v1, v2, v3], [9, 3, 6])
assert c[1,1] - u1 - v1 == -3
assert c[1,3] - u1 - v3 == 1
assert c[2,3] - u2 - v3 == 4
assert c[3,2] - u3 - v2 == 13
theta = min(30, 20)
assert theta == 20
X = [20, 10, 0; 0, 40, 0; 40, 0, 30]
assert sum(X[1,:]) == 30
assert sum(X[2,:]) == 40
assert sum(X[3,:]) == 70
assert sum(X[:,1]) == 60
assert sum(X[:,2]) == 50
assert sum(X[:,3]) == 30
cost = sum(c .* X)
assert cost == 570
assert cost == 630 + theta*(-3)
# new potentials from cells (1,1), (1,2), (2,2), (3,1), (3,3)
w1 = c[1,1]; w2 = c[1,2]; p2 = c[2,2] - w2; p3 = c[3,1] - w1; w3 = c[3,3] - p3
assert deepEqual([p2, p3], [1, -1])
assert deepEqual([w1, w2, w3], [6, 3, 3])
assert c[1,3] - 0 - w3 == 4
assert c[2,1] - p2 - w1 == 3
assert c[2,3] - p2 - w3 == 7
assert c[3,2] - p3 - w2 == 10
```

## Common mistakes
- Applying a rule to an unbalanced table instead of first adding a dummy row or column with zero costs (NOT_BALANCED).
- Filling the cheapest cells first when the north-west corner rule is asked for (LEAST_COST_RULE).
- Forgetting to pay for the last shipment of the plan (MISSED_ALLOCATION).
- Estimating the bill as total amount × average unit cost (AVERAGE_COST).
- Reporting a starting plan's cost as the minimum, whether from the north-west corner rule (NORTH_WEST_START) or the least-cost method (LEAST_COST_START).
- Serving every destination from its cheapest source and ignoring that the source runs out (IGNORED_SUPPLY_LIMIT).
- Writing $u_i + v_j - c_{ij}$, which flips the sign of the reduced cost (REDUCED_SIGN).
- Stopping at $u_i + v_j$ and forgetting to subtract it from the real cost $c_{ij}$ (IMPLIED_COST).
- Working with fewer than $m + n - 1$ basic cells in a degenerate plan: the potentials cannot all be found. Keep a 0 shipment in one extra cell.
- Taking $\theta$ from a $+$ cell of the loop: it must be the smallest shipment on a $-$ cell, or a shipment turns negative.

## Practice
- `transport-north-west-cost` (difficulty 1): total cost of the north-west corner starting plan of a balanced 2×3 or 3×3 problem; distractors LEAST_COST_RULE, MISSED_ALLOCATION, AVERAGE_COST.
- `transport-two-source-minimum-cost` (difficulty 2): minimum total cost of a balanced problem with two sources and three destinations, using the cost gaps $d_j = c_{1j} - c_{2j}$; distractors NORTH_WEST_START, LEAST_COST_START, IGNORED_SUPPLY_LIMIT.
- `transport-reduced-cost-empty-cell` (difficulty 3): reduced cost $c_{ij} - u_i - v_j$ of an empty cell of a 3×3 north-west plan, with potentials from $u_1 = 0$; distractors REDUCED_SIGN, IMPLIED_COST.

## Real world
- Building materials: cement, sand and gravel are heavy and cheap, so producers plan which plant serves which site with transportation models, and the transport cost largely decides how far a plant's market reaches.
- Retail and food distribution: supermarket chains and food-aid agencies allocate stock from warehouses to shops or distribution points; dummy rows and columns show where capacity sits idle or demand goes unmet.
- Energy: crude oil and fuel are allocated from terminals, pipelines and ports to refineries and depots, with the costs per route including tariffs and tanker rates.
- Prices across space: the potentials behave like local prices. On a used route the price at the destination exceeds the price at the source by exactly the transport cost, and on an unused route by no more than it. This is the logic of spatial price equilibrium and the shadow prices of OP03. The assignment of workers to jobs is the special case where every supply and demand equals 1.

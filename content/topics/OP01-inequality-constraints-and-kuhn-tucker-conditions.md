---
id: OP01
title: Inequality constraints and Kuhn–Tucker conditions
block: OP
coreYear: 3
prerequisites: [MV08, MV06]
estMinutes: 50
status: draft
economicUses:
  - "Corner solutions: consumers who buy none of a good"
  - Rationing and quotas that may or may not bind
  - The value of extra capacity for a firm with a capacity limit
  - Peak-load pricing of electricity, transport and other capacity
searchTerms:
  - "KKT conditions"
  - "Karush–Kuhn–Tucker"
generators: [quasilinear-demand-corner, rationing-quota-other-good, capacity-multiplier-two-products]
widgets: [quasilinear-corner-budget]
mistakeCodes:
  INTERIOR_ASSUMED:
    label: Kept the interior solution when it is not allowed
    explanation: The tangency formula can ask for more than the budget allows, leaving a negative amount of the other good. Check every variable is non-negative; if one is not, set it to 0 and solve again.
  ALL_INCOME_ON_X:
    label: Spent all income on x
    explanation: Spending everything on x is right only at a corner. When income covers the tangency point, the consumer buys x = a/p and puts the rest of income into the other good.
  FORGOT_PRICE:
    label: Forgot to divide by the price
    explanation: The marginal utility a/x must equal the price p, so x = a/p, and at a corner x = M/p. Both are amounts of money divided by the price of one unit.
  GAVE_OTHER_GOOD:
    label: Gave the other good instead of x
    explanation: The question asks for the quantity of x. The money left for other goods, y = M − p·x, is a different number.
  IGNORED_QUOTA:
    label: Ignored a binding quota
    explanation: If the free choice of x is above the quota, the consumer cannot buy it. Set x equal to the quota and spend the rest of income on y.
  QUOTA_ALWAYS_BINDS:
    label: Treated a slack quota as binding
    explanation: A quota above what the consumer wants anyway changes nothing; its multiplier is 0. Compare the free choice with the quota before setting x equal to the quota.
  ALL_ON_Y:
    label: Spent all income on y
    explanation: The consumer still buys some x, up to the quota or her free choice. Only the money not spent on x goes to y.
  LEFTOVER_NOT_PRICED:
    label: Gave the money left, not the quantity of y
    explanation: After paying for the quota of x, the money left is M − pₓ·q. Divide it by the price of y to get the number of units.
  WRONG_SHARE:
    label: Used the budget share of x for y
    explanation: With U = x^a·y^b the consumer spends the share a/(a + b) of income on x and b/(a + b) on y. Use the exponent of y for good y.
  IGNORED_CONSTRAINT:
    label: Set the multiplier to 0 when the constraint binds
    explanation: A multiplier is 0 only when its constraint is slack. If the plan without the constraint breaks it, the constraint binds and λ is the common marginal profit, which is positive.
  NEGATIVE_MULTIPLIER:
    label: Accepted a negative multiplier
    explanation: The multiplier of a ≤ constraint must be at least 0. A negative value from forcing the constraint to hold with equality means the constraint is really slack, so λ = 0.
  SLACK_NOT_MULTIPLIER:
    label: Gave the spare capacity, not the multiplier
    explanation: The number of unused units is the slack of the constraint. When there is slack, one more unit of capacity adds nothing, so the multiplier is 0.
  AVERAGE_NOT_MARGINAL:
    label: Used profit per unit instead of marginal profit
    explanation: The multiplier is the profit from one more unit at the margin, π′(q) = m − 2bq, not the average profit per unit, m − bq.
  CAPACITY_SHORTFALL:
    label: Gave the capacity shortfall, not the multiplier
    explanation: The free plan's excess over capacity is a number of units. The multiplier is a value per unit of capacity; find it from marginal profit = λ and the binding constraint.
resources:
  - { title: "Nonlinear Programming (15.084J), Lecture Notes: constrained optimisation optimality conditions (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/15-084j-nonlinear-programming-spring-2004/pages/lecture-notes/", kind: course, verifiedAt: 2026-10-18 }
  - { title: "Multivariable Calculus (18.02SC), Part C: Lagrange Multipliers and Constrained Differentials (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-02sc-multivariable-calculus-fall-2010/pages/2.-partial-derivatives/part-c-lagrange-multipliers-and-constrained-differentials/", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
The Lagrange method (MV08) assumes every constraint holds with equality and every quantity is positive. Real choices often break both assumptions. A student on a small allowance may spend all of it on rent and food and nothing on concerts. A government may ration petrol to 15 litres a week, which matters for some drivers and not for others. A factory may or may not run at full capacity. In each case the question "does this constraint bind?" is part of the answer. The Kuhn–Tucker conditions (also called Karush–Kuhn–Tucker or KKT conditions) handle inequality constraints and zero quantities in one set of rules, and they are the basis of consumer theory with corner solutions, of capacity and peak-load pricing, and of the numerical solvers used in economic models.

## Intuition
Picture walking uphill in a fenced field. If the top of the hill is inside the field, the fences do not matter: you stop where the ground is flat. If the top lies outside, you walk until you hit a fence and stop there, still facing uphill and pressing against the fence. Each fence gets a number $\lambda$, the multiplier, that says how hard you press against it: how much higher you could climb if the fence moved out by one step. A fence you are not touching gets $\lambda = 0$. A fence you are pressing against gets $\lambda \ge 0$, never negative, because moving a fence outwards can only give you more room.

Non-negativity constraints such as $x \ge 0$ are fences too. If the best plan buys none of good $x$, the ground may still slope downwards in the direction of more $x$: at a price $p$ the first unit is not worth buying. At $x = 0$ the slope in the $x$ direction may be negative, but it may not be positive, because then buying a little would help.

So at the optimum every constraint is either **slack** (not binding, multiplier zero) or **binding** (holds with equality, multiplier zero or positive). This "one or the other" rule is **complementary slackness**, the same idea as in linear programming (OP03). The practical method is to guess which constraints bind, solve, and check that every sign condition holds.

## Definition and formulas
**The problem.** Maximise $f(x_1, \dots, x_n)$ subject to $m$ inequality constraints $g_j(x_1, \dots, x_n) \le c_j$, $j = 1, \dots, m$, and possibly the non-negativity constraints $x_i \ge 0$. A minimisation problem becomes one of these by maximising $-f$; a constraint $g \ge c$ becomes $-g \le -c$.

**The Lagrangian** has one multiplier per constraint, written so that each multiplier is non-negative:
$$\mathcal{L} = f(\mathbf{x}) - \sum_{j=1}^{m} \lambda_j\,\big(g_j(\mathbf{x}) - c_j\big).$$

**Kuhn–Tucker conditions for a maximum.** At the best point:
- *stationarity*: $\dfrac{\partial \mathcal{L}}{\partial x_i} = \dfrac{\partial f}{\partial x_i} - \sum_j \lambda_j \dfrac{\partial g_j}{\partial x_i} = 0$ for every variable that has no sign constraint;
- *feasibility*: $g_j(\mathbf{x}) \le c_j$;
- *sign of the multipliers*: $\lambda_j \ge 0$;
- *complementary slackness*: $\lambda_j\,\big(c_j - g_j(\mathbf{x})\big) = 0$, so a slack constraint ($g_j < c_j$) has $\lambda_j = 0$, and $\lambda_j > 0$ only when the constraint binds.

**With non-negative variables** $x_i \ge 0$, stationarity is replaced by three conditions for each such variable:
$$\frac{\partial \mathcal{L}}{\partial x_i} \le 0, \qquad x_i \ge 0, \qquad x_i \cdot \frac{\partial \mathcal{L}}{\partial x_i} = 0.$$
If $x_i > 0$ its derivative is zero, as in MV08; if the derivative is negative, the variable is at the corner $x_i = 0$. The multipliers of $x_i \ge 0$ never need to be written: these three conditions already include them.

**The case-by-case method.**
1. Write the Lagrangian and all the conditions.
2. Choose a case: which constraints bind and which variables are zero. Start with the most plausible case, usually "only the budget binds and all quantities are positive".
3. Solve the equations of that case (binding constraints as equations, $\lambda_j = 0$ for slack ones, $\partial\mathcal{L}/\partial x_i = 0$ for positive variables).
4. Check every inequality: feasibility, $\lambda_j \ge 0$, $x_i \ge 0$, $\partial\mathcal{L}/\partial x_i \le 0$ at zero variables. If one fails, the case is wrong; try another.
5. If several cases pass, compare the values of $f$ (under concavity, see below, any case that passes is the answer).

**Sufficiency.** If $f$ is concave and every $g_j$ is convex (linear constraints are both), any point that satisfies the Kuhn–Tucker conditions is a global maximum (MV06). The same holds for a quasiconcave $f$, such as Cobb–Douglas utility, with linear constraints, as long as the gradient of $f$ is not zero at the point.

**Necessity.** At a maximum, multipliers that satisfy the conditions exist when a *constraint qualification* holds; it holds automatically when all constraints are linear, which covers budgets, quotas and capacities. Without it, there are rare problems whose maximum fails the conditions.

**Meaning of the multiplier.** As in MV09, $\lambda_j$ is the rise in the maximum value of $f$ per unit increase in $c_j$: the shadow price of the constraint. That is why it is zero for a slack constraint and never negative. For a linear programme, the Kuhn–Tucker conditions are exactly the dual constraints plus complementary slackness of OP03, and the $\lambda_j$ are the dual prices.

**Two standard corners.** With quasilinear utility $U = a\ln x + y$, budget $px + y \le M$ (other goods $y$ have price 1):
$$x^* = \frac{\min(a, M)}{p}, \qquad y^* = \max(M - a,\ 0), \qquad \lambda = \max\!\Big(1, \frac{a}{M}\Big).$$
Below the income $M = a$ the consumer buys no $y$. With perfect substitutes $U = x + y$ the consumer buys only the good with the lower price, a corner in $x$ or $y$.

## Interactive
::widget{id="quasilinear-corner-budget"}

The graph shows the consumer of Example 1, with utility $U = 24\ln x + y$: the gold budget line, the indifference curve through the best bundle (solid) and one lower and one higher curve (dashed). Move **Income M** and **Price of x, p** and watch the dot and the panel: the best bundle, the multiplier $\lambda$ and which constraints bind. Check: at $M = 16$, $p = 4$ the panel shows the bundle $(4, 0)$, $\lambda = 1.5$ and "budget and y ≥ 0". Raise income to 24: the bundle becomes $(6, 0)$ with $\lambda = 1$, and above 24 every extra unit of income goes to $y$ while $x$ stays at 6 (at 40 the bundle is $(6, 16)$). Lower the price to 2 at $M = 40$: the bundle becomes $(12, 16)$.

## Worked examples

### Example 1 (easy): a consumer who buys no other goods
A student's utility from $x$ gigabytes of mobile data and $y$ (money spent on everything else, price 1) is $U = 24\ln x + y$. Data costs 4 per gigabyte. Find her best choice with a weekly budget of 16, and then with 60.

1. $\mathcal{L} = 24\ln x + y - \lambda(4x + y - 16)$, with conditions $\dfrac{\partial\mathcal{L}}{\partial y} = 1 - \lambda \le 0$, $y \ge 0$, $y(1 - \lambda) = 0$, and $\lambda \ge 0$, $\lambda(16 - 4x - y) = 0$.
   *Why:* $y$ may be zero, so it gets the three non-negativity conditions. $x$ is positive at any optimum, because $\ln x$ falls without limit as $x \to 0$, so $\partial\mathcal{L}/\partial x = 24/x - 4\lambda = 0$.
2. Case $y > 0$: $\lambda = 1$, so $24/x = 4$ and $x = 6$; the budget then leaves $y = 16 - 24 = -8 < 0$.
   *Why:* a positive $y$ needs $\partial\mathcal{L}/\partial y = 0$. The case fails because it breaks $y \ge 0$: the tangency point costs more than her budget.
3. Case $y = 0$: the budget binds, so $4x = 16$ and $x = 4$; then $\lambda = \dfrac{24}{4 \cdot 4} = 1.5$.
   *Why:* more data always raises utility, so she spends the whole budget. $\lambda$ comes from $\partial\mathcal{L}/\partial x = 0$.
4. Check: $\lambda = 1.5 \ge 0$, and $\dfrac{\partial\mathcal{L}}{\partial y} = 1 - 1.5 = -0.5 \le 0$ with $y = 0$. The best choice is $x^* = 4$, $y^* = 0$, with utility $24\ln 4 \approx 33.27$.
   *Why:* every condition holds, and the utility is concave with a linear budget, so this is the global maximum. At the margin a unit of money spent on data is worth 1.5, more than the 1 it gives in other goods, so she would buy negative $y$ if she could.
5. With a budget of 60 the case $y > 0$ works: $x = 6$, $y = 60 - 24 = 36 \ge 0$, $\lambda = 1$.
   *Why:* income now covers the tangency point. The switch happens at income 24: below it she buys only data, above it every extra unit of income goes to other goods.

```verify
a = 24; p = 4; M = 16
xi = a/p
assert xi == 6
assert M - p*xi == -8
x = M/p
assert x == 4
lam = a/(p*x)
assert lam == 1.5
assert 1 - lam == -0.5
assert abs(a*log(4) - 33.27) < 0.005
# interior case at income 60
M2 = 60
assert M2 - p*xi == 36
assert a/(p*xi) == 1
assert M2/p == 15
# the corner really is best: compare with nearby affordable bundles at income 16
U(t) = a*log(t) + (M - p*t)
assert U(4) > U(3.9) and U(4) > U(3.5) and U(4) > U(2)
```

### Example 2 (medium): petrol rationing
A driver's utility from $x$ litres of petrol and $y$ units of other goods is $U = xy$. Her income is 120, petrol costs 3 a litre and other goods cost 2. The government limits petrol to 15 litres per person. Find her choice and the multiplier of the ration.

1. $\mathcal{L} = xy - \lambda(3x + 2y - 120) - \mu(x - 15)$, with $\lambda, \mu \ge 0$ and $\mu(15 - x) = 0$.
   *Why:* one multiplier for the budget and one for the ration. Utility is zero if either good is zero, so both quantities are positive and their derivatives are zero.
2. Case $\mu = 0$ (ration slack): the Cobb–Douglas demands give $x = \dfrac{120}{2 \cdot 3} = 20$ and $y = \dfrac{120}{2 \cdot 2} = 30$. But $20 > 15$.
   *Why:* with $U = xy$ she spends half her income on each good (MV08). The case breaks the ration, so it fails.
3. Case ration binds: $x = 15$ and $y = \dfrac{120 - 3 \cdot 15}{2} = \dfrac{75}{2} = 37.5$.
   *Why:* the budget still binds, because more $y$ always helps; the money she cannot spend on petrol goes to other goods.
4. $\dfrac{\partial\mathcal{L}}{\partial y} = x - 2\lambda = 0$ gives $\lambda = 7.5$; $\dfrac{\partial\mathcal{L}}{\partial x} = y - 3\lambda - \mu = 0$ gives $\mu = 37.5 - 22.5 = 15 > 0$.
   *Why:* both multipliers are non-negative, so every condition holds; $xy$ is quasiconcave with linear constraints, so this is the optimum. Utility is $15 \times 37.5 = 562.5$, below the 600 she gets without rationing.
5. $\mu = 15$ is the utility from one more litre of ration: with ration $q$, utility is $q\,\dfrac{120 - 3q}{2}$, whose derivative $60 - 3q$ equals 15 at $q = 15$. A ration of 25 litres would not bind: she would buy 20 litres and 30 units of other goods, with $\mu = 0$.
   *Why:* the multiplier is the shadow price of the constraint. A ration above what she wants anyway is slack and worth nothing.

```verify
M = 120; px = 3; py = 2; q = 15
x0 = M/(2*px); y0 = M/(2*py)
assert x0 == 20 and y0 == 30
assert x0 > q
y = (M - px*q)/py
assert M - px*q == 75
assert y == 37.5
lam = q/py
assert lam == 7.5
mu = y - px*lam
assert px*lam == 22.5
assert mu == 15
assert q*y == 562.5
assert x0*y0 == 600
# mu is the derivative of utility with respect to the ration
V(r) = r*(M - px*r)/py
h = 0.0001
assert abs((V(q + h) - V(q - h))/(2*h) - 15) < 0.000001
assert 60 - 3*q == 15
# a ration of 25 is slack; forcing x = 25 would leave 22.5
assert x0 < 25
assert (M - px*25)/py == 22.5
```

### Example 3 (hard): a bakery's oven capacity
A bakery bakes $q_1$ batches of bread and $q_2$ batches of cakes a day. Because larger amounts sell at lower prices, its profit is $\pi = 50q_1 - q_1^2 + 70q_2 - 2q_2^2$. The oven can bake at most $K$ batches a day: $q_1 + q_2 \le K$, with $q_1, q_2 \ge 0$. Find the best plan and the multiplier of the oven constraint for $K = 35$, then for $K = 4$.

1. $\mathcal{L} = \pi - \lambda(q_1 + q_2 - K)$, with $\dfrac{\partial\mathcal{L}}{\partial q_1} = 50 - 2q_1 - \lambda \le 0$, $q_1 \ge 0$, $q_1\dfrac{\partial\mathcal{L}}{\partial q_1} = 0$ (the same for $q_2$ with $70 - 4q_2 - \lambda$), and $\lambda \ge 0$, $\lambda(K - q_1 - q_2) = 0$.
   *Why:* the Kuhn–Tucker conditions with non-negative variables. Profit is concave (its second partials are $-2$ and $-4$ with no cross term) and the constraint is linear, so any point that meets them is the global maximum.
2. $K = 35$, case $\lambda = 0$: $q_1 = 25$, $q_2 = 17.5$, a total of $42.5 > 35$.
   *Why:* if the oven were not a bottleneck, each product would be made until its marginal profit is zero. The plan does not fit, so the oven binds.
3. Case oven binds, both products made: $50 - 2q_1 = \lambda$ and $70 - 4q_2 = \lambda$, so $q_1 = \dfrac{50 - \lambda}{2}$, $q_2 = \dfrac{70 - \lambda}{4}$. Then $q_1 + q_2 = 35$ gives $170 - 3\lambda = 140$, so $\lambda = 10$, $q_1 = 20$, $q_2 = 15$ and $\pi = 1{,}200$.
   *Why:* the last batch of oven time must earn the same in bread as in cakes, and that common marginal profit is $\lambda$. All conditions hold: $\lambda = 10 \ge 0$, both outputs are positive.
4. With $K = 36$ the same case gives $\lambda = \tfrac{26}{3} \approx 8.67$, $q_1 \approx 20.67$, $q_2 \approx 15.33$ and $\pi \approx 1{,}209.33$, a gain of about 9.33.
   *Why:* $\lambda$ is the value of one more batch of oven capacity. The gain lies between the multipliers at 35 and 36 batches (10 and 8.67), because the multiplier falls as capacity grows.
5. $K = 4$: the case "both made" gives $\lambda = \tfrac{170 - 16}{3} \approx 51.33$ and $q_1 \approx -0.67 < 0$, so it fails. Try $q_1 = 0$: then $q_2 = 4$ and $\lambda = 70 - 4 \cdot 4 = 54$. Check bread: $\dfrac{\partial\mathcal{L}}{\partial q_1} = 50 - 0 - 54 = -4 \le 0$. The best plan is cakes only, with $\pi = 248$.
   *Why:* with so little oven time, a batch of oven time earns 54 in cakes, more than the 50 the first batch of bread would earn. Bread is a corner solution: its derivative is negative at $q_1 = 0$, which the conditions allow only because $q_1 = 0$.

```verify
P(a, b) = 50*a - a^2 + 70*b - 2*b^2
assert 50/2 == 25 and 70/4 == 17.5
assert 25 + 17.5 == 42.5
lam = (170 - 2*35*2)/3
assert 2*35*2 == 140
assert lam == 10
q1 = (50 - lam)/2; q2 = (70 - lam)/4
assert q1 == 20 and q2 == 15 and q1 + q2 == 35
assert P(q1, q2) == 1200
# K = 36
l2 = (170 - 4*36)/3
assert abs(l2 - 26/3) < 1e-12
assert abs(l2 - 8.67) < 0.005
r1 = (50 - l2)/2; r2 = (70 - l2)/4
assert abs(r1 - 20.67) < 0.005 and abs(r2 - 15.33) < 0.005
assert abs(r1 + r2 - 36) < 1e-9
assert abs(P(r1, r2) - 1209.33) < 0.005
assert abs(P(r1, r2) - 1200 - 9.33) < 0.005
assert P(r1, r2) - 1200 < 10 and P(r1, r2) - 1200 > l2
# K = 4
l3 = (170 - 4*4)/3
assert abs(l3 - 51.33) < 0.005
assert abs((50 - l3)/2 - (-0.67)) < 0.005
l4 = 70 - 4*4
assert l4 == 54
assert 50 - 0 - l4 == -4
assert P(0, 4) == 248
# no other split of 4 batches does better
assert P(0, 4) > P(0.5, 3.5) and P(0, 4) > P(1, 3) and P(0, 4) > P(2, 2)
# common mistakes: K = 45 is slack, average vs marginal profit of bread, shortfall
assert abs((170 - 4*45)/3 - (-3.33)) < 0.005
assert 45 - 42.5 == 2.5
assert 50 - 20 == 30 and 50 - 2*20 == 10
assert 42.5 - 35 == 7.5
```

## Common mistakes
- Keeping the tangency solution when it needs a negative quantity: in Example 1 at income 16 the formula gives $x = 6$ and $y = -8$ (INTERIOR_ASSUMED).
- Spending all income on the good when the tangency point is affordable: at income 60 the student buys 6 gigabytes, not 15 (ALL_INCOME_ON_X).
- Forgetting to divide by the price in $x = a/p$ or $x = M/p$ (FORGOT_PRICE).
- Giving the money left for other goods when the question asks for the quantity of $x$ (GAVE_OTHER_GOOD).
- Ignoring a ration that binds: in Example 2 the driver cannot buy 20 litres, and $y$ is 37.5, not 30 (IGNORED_QUOTA).
- Setting $x$ equal to a ration that does not bind: with a ration of 25 litres, $x = 25$ would leave only $y = 22.5$, while she buys 20 litres and $y = 30$ (QUOTA_ALWAYS_BINDS).
- Spending the whole income on $y$, as if no $x$ were bought (ALL_ON_Y).
- Giving the money left after the ration, 75 in Example 2, instead of dividing it by the price of $y$ (LEFTOVER_NOT_PRICED).
- Using the budget share of $x$ for $y$ in a Cobb–Douglas demand (WRONG_SHARE).
- Setting $\lambda = 0$ although the plan without the constraint breaks it: in Example 3 the oven binds and $\lambda = 10$ (IGNORED_CONSTRAINT).
- Accepting a negative multiplier: with an oven for 45 batches, forcing $q_1 + q_2 = 45$ gives $\lambda = -3.33$; the oven is slack and $\lambda = 0$ (NEGATIVE_MULTIPLIER).
- Giving the spare capacity, 2.5 batches in that case, as the multiplier (SLACK_NOT_MULTIPLIER).
- Using profit per batch instead of marginal profit: in Example 3 bread earns $50 - 20 = 30$ per batch on average, but the last batch earns $50 - 40 = 10$ (AVERAGE_NOT_MARGINAL).
- Giving the shortfall of capacity, $42.5 - 35 = 7.5$ batches, as the multiplier (CAPACITY_SHORTFALL).
- Writing $\partial\mathcal{L}/\partial x = 0$ for a variable that turns out to be zero, or forgetting to check the case "this variable is zero" at all.
- Writing the Lagrangian as $f + \lambda(g - c)$ and then requiring $\lambda \ge 0$: with that sign the multiplier of a $\le$ constraint is $\le 0$. Keep one convention, $f - \lambda(g - c)$.

## Practice
- `quasilinear-demand-corner` (difficulty 1): the quantity of $x$ bought with utility $a\ln x + y$, where low income gives the corner $y = 0$; distractors INTERIOR_ASSUMED, ALL_INCOME_ON_X, FORGOT_PRICE, GAVE_OTHER_GOOD.
- `rationing-quota-other-good` (difficulty 2): the quantity of $y$ bought with Cobb–Douglas utility when good $x$ is rationed and the ration may or may not bind; distractors IGNORED_QUOTA, QUOTA_ALWAYS_BINDS, ALL_ON_Y, LEFTOVER_NOT_PRICED, WRONG_SHARE.
- `capacity-multiplier-two-products` (difficulty 3): the multiplier of a shared capacity limit for two products, 0 when the plant has spare capacity; distractors IGNORED_CONSTRAINT, NEGATIVE_MULTIPLIER, SLACK_NOT_MULTIPLIER, AVERAGE_NOT_MARGINAL, CAPACITY_SHORTFALL.

## Real world
- Household surveys show that most households buy nothing at all of many goods in a given month. Demand systems estimated from such data must allow for these corner solutions, which is why econometricians use models with zeros built in instead of plain regressions.
- Rationing: wartime food rationing, fuel quotas, water restrictions in droughts and limits on foreign currency purchases all bind for some households and not for others. The multiplier of a binding ration is what a household would pay for one more unit, which is why rationed goods tend to be traded on black markets.
- Peak-load pricing: power stations, railways and telecom networks need enough capacity for the busiest hour. The capacity constraint binds at the peak and is slack off-peak, so complementary slackness says the cost of capacity belongs in the peak price only, while off-peak users pay just the running cost.
- Production quotas, such as the milk quotas the European Union used from 1984 to 2015, bound for efficient farms and not for others; the multiplier of a binding quota showed up as the price at which farmers traded quota rights.

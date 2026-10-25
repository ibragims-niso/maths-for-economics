---
id: MV09
title: The Lagrange multiplier as shadow price
block: MV
coreYear: 2
prerequisites: [MV08]
estMinutes: 45
status: draft
economicUses:
  - What one more unit of income is worth to a consumer
  - Reading marginal cost off a firm's cost-minimisation problem
  - The most worth paying for extra water, land or machine time
  - The cost of a tighter emissions cap or other limit
searchTerms:
  - "Shadow price"
  - "Meaning of the Lagrange multiplier"
generators: [shadow-price-income-estimate, shadow-price-marginal-cost, shadow-price-water]
widgets: [shadow-price-value-function]
mistakeCodes:
  NEW_LEVEL:
    label: Gave the new maximum, not the change
    explanation: V(M + ΔM) is the new level of maximum utility. The question asks how much it rises, and λ estimates the rise directly as λ·ΔM.
  LAMBDA_ONLY:
    label: Stopped at λ
    explanation: λ is the rise in the best value per unit of the constraint. For a change of ΔM units, multiply by ΔM; ΔV ≈ λ·ΔM.
  DIVIDED_BY_LAMBDA:
    label: Divided by λ instead of multiplying
    explanation: λ is utility per unit of money, so units of money times λ give utility. ΔM/λ has the wrong units.
  AVERAGE_NOT_MARGINAL:
    label: Used the average instead of the marginal value
    explanation: The shadow price is the slope of the value function, dV/dc, not the average V/c. The two agree only when V is proportional to c; for U = xy, V/M is half of λ.
  GAVE_OPTIMAL_VALUE:
    label: Gave the optimal value, not λ
    explanation: The minimum cost or maximum revenue is V itself. The shadow price is how fast V changes with the constraint, the λ from the first-order conditions.
  DROPPED_HALF:
    label: Dropped the 1/2 from the square root
    explanation: The derivative of A·K^(1/2)·L^(1/2) with respect to L is (A/2)·√(K/L). Without the 1/2 the marginal product doubles and λ = w/MP_L comes out half as big.
  CONSTANT_MARGINAL_PRODUCT:
    label: Took the marginal product to be A
    explanation: With Q = A·√(KL) a worker does not add A units; MP_L = (A/2)·√(K/L) depends on the input mix. Find K/L = w/r first, then λ = w/MP_L.
  INVERTED_MULTIPLIER:
    label: Turned λ upside down
    explanation: In cost minimisation λ = w/MP_L is money per unit of output. Its reciprocal, output per unit of money, is the multiplier of a different problem (the most output for a given budget).
  GAVE_QUANTITY:
    label: Gave a quantity instead of λ
    explanation: The best split of the input answers a different question. Put it into a first-order condition such as α/(2√w₁) = λ to get the shadow price.
  ONE_FIELD_ONLY:
    label: Gave all of the input to one use
    explanation: α/(2√W) is the value of the last unit if all W units went to field 1. At the best split each field gets only part of the water, so the marginal revenue there is higher; use the optimal w₁.
  SLACK_CONSTRAINT_PRICE:
    label: Gave a positive price to a slack constraint
    explanation: If the best plan leaves some of a resource unused, one more unit adds nothing to the best value. The shadow price of a non-binding constraint is 0.
  LAMBDA_SIGN:
    label: Lost the sign of λ
    explanation: With the Lagrangian written as f − λ(g − c), λ = dV/dc, which is positive when relaxing the constraint helps. Writing the constraint as c − g flips the sign of λ but not its meaning.
resources:
  - { title: "Calculus Volume 3, 4.8 Lagrange Multipliers (OpenStax)", url: "https://openstax.org/books/calculus-volume-3/pages/4-8-lagrange-multipliers", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "MIT 14.121 Microeconomic Theory I, Consumer Theory lecture slides (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/14-121-microeconomic-theory-i-fall-2015/resources/mit14_121f15_2s/", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
Every constraint has a price, even when no market sets one. How much better off would one more unit of income make a consumer? What does one more unit of output cost a firm that is already producing at least cost? What is the most a farm should pay for one more cubic metre of water, or a factory for one more machine hour? How much would it cost an industry if its emissions cap were tightened by one tonne? MV08 found the best choice under a constraint. The Lagrange multiplier $\lambda$ that came out of the same equations answers all of these questions: it is the rate at which the best achievable value changes when the constraint is relaxed. Economists call it the **shadow price** of the constraint. It gives a consumer's marginal utility of income, a firm's marginal cost, the value of a scarce input, and the cost of a tighter limit.

## Intuition
Treat the best value as a function of the constant in the constraint. For a consumer with income $M$, let $V(M)$ be the highest utility the budget allows. Raise $M$ a little: the budget line shifts out, the best bundle moves, and $V$ rises. By how much?

At the optimum the two gradients are parallel, $\nabla f = \lambda \nabla g$ (MV08). Any small move $(dx, dy)$ changes the objective by $f_x\,dx + f_y\,dy = \lambda\,(g_x\,dx + g_y\,dy)$, which is $\lambda$ times the change in $g$. To reach the new constraint, $g$ must rise by exactly $dc$, so the objective rises by about $\lambda\,dc$. So $\lambda$ is an exchange rate between the constraint and the objective at the optimum: one more unit of $c$ is worth $\lambda$ units of $f$.

Why "shadow"? Nobody sells you an extra unit of budget, output target or water allocation in a shop, yet $\lambda$ behaves like a price. If someone offers to relax the constraint for less than $\lambda$ per unit, the deal pays; for more than $\lambda$, it does not.

## Definition and formulas
**The value function.** For the problem "maximise $f(x, y)$ subject to $g(x, y) = c$", write the solution as $x^*(c)$, $y^*(c)$ with multiplier $\lambda^*(c)$, using $\mathcal{L} = f - \lambda(g - c)$. The **value function** is the best value as a function of $c$:
$$V(c) = f\big(x^*(c),\, y^*(c)\big).$$

**The shadow-price result.**
$$\frac{dV}{dc} = \lambda^*(c).$$
*Reason:* by the chain rule (MV03), $V'(c) = f_x\,x^{*\prime} + f_y\,y^{*\prime} = \lambda\,(g_x\,x^{*\prime} + g_y\,y^{*\prime})$. Differentiating $g(x^*(c), y^*(c)) = c$ gives $g_x\,x^{*\prime} + g_y\,y^{*\prime} = 1$, so $V'(c) = \lambda$. The same holds for a minimisation (then $V$ is the minimum cost) and with several constraints, $\partial V / \partial c_i = \lambda_i$. This is a special case of the envelope theorem (MV12), which also covers prices and other parameters inside $f$ and $g$.

**Estimating a change.** For a small change $\Delta c$ (linear approximation, C111):
$$\Delta V \approx \lambda\,\Delta c.$$
The estimate is exact only when $V$ is a straight line in $c$; otherwise its error grows roughly like $(\Delta c)^2$, so it works best for small changes.

**Units.** $\lambda$ is measured in units of the objective per unit of the constraint.
- Utility maximisation with a budget: utility per unit of money, the **marginal utility of income**, $\lambda = U_x/p_x = U_y/p_y$.
- Cost minimisation with an output target: money per unit of output, the **marginal cost**, $\lambda = dC/d\bar Q = w/MP_L = r/MP_K$.
- Revenue or profit with a limited input: money per unit of the input, the most worth paying for one more unit of water, land or machine time.

**Cobb–Douglas consumers.** For $U = x^a y^b$ the demands of MV08 give $V(M) = k\,M^{a+b}$, where $k$ depends only on prices. So
$$\lambda = V'(M) = \frac{(a+b)\,V(M)}{M}.$$
For MV08 Example 3 ($U = x^2y$, $M = 900$, $V = 72{,}000$) this gives $\lambda = 3 \cdot 72{,}000/900 = 240$, the value found there from $U_x/p_x$. For $U = xy$, $V(M) = M^2/(4p_xp_y)$ and $\lambda = M/(2p_xp_y)$: the marginal value of income is twice its average value $V/M$.

**A warning about utility units.** $U = \sqrt{xy}$ ranks bundles exactly as $xy$ does but has $V(M) = M/(2\sqrt{p_xp_y})$, so with $p_x = 5$, $p_y = 10$ its $\lambda$ is about $0.0707$, not $6$. The marginal utility of income depends on how utility is measured; only its sign, and comparisons made with the same utility function, carry meaning. Multipliers measured in money (cost, revenue, profit) have no such problem, which is why economists prefer them.

**Cost minimisation.** For $Q = A\sqrt{KL}$ the minimum cost is $C(\bar Q) = 2\sqrt{wr}\,\bar Q/A$, so $\lambda = 2\sqrt{wr}/A$. This technology has constant returns to scale, so marginal and average cost are equal. With decreasing returns marginal cost is above average cost and $\lambda$ is the marginal one (Example 2).

**Sign and slack constraints.** With $\mathcal{L} = f - \lambda(g - c)$, $\lambda = dV/dc$. When more of $c$ helps, $\lambda > 0$; a negative $\lambda$ means an equality constraint forces you to use *more* than you would like, so loosening it hurts. If the constraint is really a limit, $g \le c$, and the best point without it already uses less than $c$, the constraint is **slack**: one more unit is worth nothing and its shadow price is $0$. For a farm whose revenue from water is $40w - w^2$, the best amount is $w = 20$. A limit of 30 units is slack (shadow price 0); a limit of 16 binds, with shadow price $40 - 2 \cdot 16 = 8$. The Kuhn–Tucker conditions (OP01) handle such limits in general.

**Linear programmes.** The dual prices of OP03 are the shadow prices of the resources in a linear programme. There the value function is made of straight pieces, so the shadow price stays constant over a range of $c$ and then jumps.

## Interactive
::widget{id="shadow-price-value-function"}

The lilac curve is the maximum utility $V(M)$ of $U = xy$ with $p_y = 10$, the dashed green line is its tangent at the chosen income, and the dot marks $(M, V(M))$. Move **Income M**, **Price of x, p_x** and **Rise in income ΔM** and watch the panel: it shows $V(M)$, $\lambda$ (the slope of the tangent) and the estimate $\lambda\,\Delta M$ next to the exact rise, which you can see at the hollow dot on the curve. Check: at the start ($M = 600$, $p_x = 5$, $\Delta M = 100$) the panel shows $V = 1{,}800$ and $\lambda = 6$, as in Example 1, and "600 vs 650". Set $\Delta M$ to 10: it shows "60 vs 60.5". Now set $M = 200$ and $\Delta M = 300$: the estimate 600 falls well short of the exact 1,050, and the gold gap between curve and line is wide. Raise $p_x$ and watch $\lambda$ fall: each unit of income buys less.

## Worked examples

### Example 1 (easy): what extra income is worth to a student
A student has utility $U = xy$, buys meals $x$ at 5 and other goods $y$ at 10, and has income $M = 600$ (MV08 Example 1: $x^* = 60$, $y^* = 30$, $\lambda = 6$). Find the value function $V(M)$, check that its slope is $\lambda$, and estimate the rise in maximum utility if income rises to 610. Compare with the exact rise.

1. $x^*(M) = \dfrac{M}{10}$, $y^*(M) = \dfrac{M}{20}$
   *Why:* with $U = xy$ half of income goes on each good (MV08), so spending on meals is $M/2$ at a price of 5.
2. $V(M) = x^*y^* = \dfrac{M^2}{200}$, so $V(600) = 1{,}800$
   *Why:* the value function is utility at the best bundle, written as a function of income.
3. $V'(M) = \dfrac{M}{100} = 6$ at $M = 600$, and $\lambda = \dfrac{y^*}{p_x} = \dfrac{30}{5} = 6$
   *Why:* the slope of the value function equals the multiplier: $\lambda = 6$ is the marginal utility of income.
4. $\Delta V \approx \lambda\,\Delta M = 6 \times 10 = 60$
   *Why:* each extra unit of income is worth about 6 units of utility.
5. $V(610) = \dfrac{372{,}100}{200} = 1{,}860.5$, so the exact rise is $60.5$
   *Why:* the estimate is off by $0.5 = 10^2/200$. $V$ curves upwards here, so the tangent line lies just below the curve: $\lambda$ itself rises from 6 to 6.1 as income goes from 600 to 610.

```verify
px = 5; py = 10; M = 600
x = M/(2*px); y = M/(2*py)
assert x == 60
assert y == 30
V = x*y
assert V == 1800
assert V == M^2/200
lam = y/px
assert lam == 6
# slope of V(M) = M^2/200 by a central difference
h = 0.001
slope = ((M + h)^2/200 - (M - h)^2/200)/(2*h)
assert abs(slope - lam) < 0.000001
est = lam*10
assert est == 60
V610 = 610^2/200
assert V610 == 1860.5
assert V610 - V == 60.5
assert (V610 - V) - est == 10^2/200
assert 610/100 == 6.1
```

### Example 2 (medium): marginal cost from the cost-minimisation multiplier
A bakery makes $Q = K^{1/4}L^{1/4}$ batches a day with $K$ machines and $L$ workers. A worker costs 16 a day and a machine 4. Find the cheapest way to make $\bar Q = 10$ batches, the minimum cost and $\lambda$, and compare $\lambda$ with marginal and average cost.

1. $\mathcal{L} = 16L + 4K - \lambda\big(K^{1/4}L^{1/4} - 10\big)$, with $16 = \lambda \cdot \tfrac14 K^{1/4}L^{-3/4}$ and $4 = \lambda \cdot \tfrac14 K^{-3/4}L^{1/4}$
   *Why:* cost is the objective and the output target is the constraint; each input price equals $\lambda$ times that input's marginal product.
2. $\dfrac{K}{L} = \dfrac{16}{4} = 4$, so $K = 4L$
   *Why:* dividing the two conditions removes $\lambda$ and gives $MRTS = w/r$.
3. $(4L \cdot L)^{1/4} = 10$ gives $L^2 = 2{,}500$, so $L^* = 50$, $K^* = 200$ and $C^* = 16 \cdot 50 + 4 \cdot 200 = 1{,}600$
   *Why:* the output target fixes the scale: $4L^2 = 10^4$.
4. $MP_L = \tfrac14 \cdot 200^{1/4} \cdot 50^{-3/4} = 0.05$, so $\lambda = \dfrac{16}{0.05} = 320$
   *Why:* $200^{1/4}/50^{3/4} = (200/125{,}000)^{1/4} = 0.2$. At the best mix one more batch costs 320.
5. For any target, $L = \bar Q^2/2$ and $K = 2\bar Q^2$, so $C(\bar Q) = 16\bar Q^2$; then $MC = 32\bar Q = 320$ and $AC = 16\bar Q = 160$ at $\bar Q = 10$
   *Why:* $\lambda$ equals marginal cost, not average cost. With decreasing returns each batch costs more than the last, so $MC > AC$. Check: $C(11) = 1{,}936$, a rise of 336, close to $\lambda = 320$.

```verify
w = 16; r = 4; Q = 10
L = 50; K = 200
assert abs((K*L)^(1/4) - Q) < 0.000001
assert K/L == w/r
C = w*L + r*K
assert C == 1600
MPL = (1/4)*K^(1/4)*L^(-3/4)
MPK = (1/4)*K^(-3/4)*L^(1/4)
assert abs(MPL - 0.05) < 0.000001
lam = w/MPL
assert abs(lam - 320) < 0.0001
assert abs(r/MPK - lam) < 0.0001
# cost function C(Q) = 16 Q^2
assert 16*Q^2 == C
assert w*(Q^2/2) + r*(2*Q^2) == C
MC = 32*Q
assert abs(MC - lam) < 0.0001
AC = C/Q
assert AC == 160
assert 16*11^2 == 1936
assert 16*11^2 - C == 336
# the slope of C at 10 by a central difference
h = 0.001
assert abs((16*(Q + h)^2 - 16*(Q - h)^2)/(2*h) - lam) < 0.0001
```

### Example 3 (hard): the value of extra water to a farm
A farm has $W = 400$ units of water a season for two fields. Revenue is $R = 60\sqrt{w_1} + 80\sqrt{w_2}$ when field 1 gets $w_1$ and field 2 gets $w_2$. Find the best split, the shadow price of water and the value function $V(W)$. A neighbour offers 20 more units at 3 per unit: should the farm buy?

1. $\mathcal{L} = 60\sqrt{w_1} + 80\sqrt{w_2} - \lambda(w_1 + w_2 - 400)$, so $\dfrac{30}{\sqrt{w_1}} = \lambda = \dfrac{40}{\sqrt{w_2}}$
   *Why:* at the best split the last unit of water earns the same on both fields, and that common value is $\lambda$.
2. $\dfrac{\sqrt{w_2}}{\sqrt{w_1}} = \dfrac{4}{3}$, so $w_2 = \tfrac{16}{9}w_1$; then $\tfrac{25}{9}w_1 = 400$ gives $w_1^* = 144$ and $w_2^* = 256$
   *Why:* dividing removes $\lambda$; the water limit then fixes the amounts.
3. $\lambda = \dfrac{30}{\sqrt{144}} = 2.5$ (and $\dfrac{40}{\sqrt{256}} = 2.5$); revenue is $60 \cdot 12 + 80 \cdot 16 = 2{,}000$
   *Why:* one more unit of water adds about 2.5 to the best revenue, whichever field gets it.
4. For any $W$: $w_1 = \tfrac{9}{25}W$, $w_2 = \tfrac{16}{25}W$, so $V(W) = 36\sqrt{W} + 64\sqrt{W} = 100\sqrt{W}$ and $V'(400) = \dfrac{50}{\sqrt{400}} = 2.5$
   *Why:* the slope of the value function is the multiplier, as the general result promises.
5. Extra revenue $\approx 2.5 \times 20 = 50$, but the water costs $3 \times 20 = 60$: do not buy. Exactly, $V(420) - V(400) = 100\sqrt{420} - 2{,}000 \approx 49.39$
   *Why:* the most worth paying is about $\lambda = 2.5$ a unit, and slightly less for a large block, because $V$ bends down and $\lambda$ falls as water becomes more plentiful.

```verify
a = 60; b = 80; W = 400
w1 = 144; w2 = 256
assert w1 + w2 == W
assert w2/w1 == 16/9
lam = a/(2*sqrt(w1))
assert lam == 2.5
assert b/(2*sqrt(w2)) == lam
V = a*sqrt(w1) + b*sqrt(w2)
assert V == 2000
assert abs(sqrt(a^2 + b^2)*sqrt(W) - V) < 0.000001
assert 9/25*W == w1
assert 16/25*W == w2
assert 50/sqrt(W) == lam
# a nearby split earns less
assert a*sqrt(150) + b*sqrt(250) < V
assert a*sqrt(138) + b*sqrt(262) < V
est = lam*20
assert est == 50
assert 3*20 == 60
exact = 100*sqrt(420) - V
assert abs(exact - 49.39) < 0.005
assert exact < est
# slope of V by a central difference
h = 0.001
assert abs((100*sqrt(W + h) - 100*sqrt(W - h))/(2*h) - lam) < 0.000001
# the slack example in the formulas: revenue 40w - w^2
assert 40 - 2*16 == 8
assert 40 - 2*20 == 0
```

## Common mistakes
- Giving the new maximum $V(M + \Delta M)$ when the question asks how much it rises (NEW_LEVEL).
- Giving $\lambda$ itself when the constraint changes by more than one unit (LAMBDA_ONLY).
- Dividing $\Delta M$ by $\lambda$ instead of multiplying (DIVIDED_BY_LAMBDA).
- Taking the average $V/c$, such as average cost or utility per unit of income, as the shadow price (AVERAGE_NOT_MARGINAL).
- Reporting the minimum cost or the maximum revenue instead of $\lambda$ (GAVE_OPTIMAL_VALUE).
- Differentiating $A K^{1/2} L^{1/2}$ as $A K^{1/2} L^{-1/2}$, losing the factor $\tfrac12$ (DROPPED_HALF).
- Treating $A$ as the output of one more worker, so that $\lambda = w/A$ (CONSTANT_MARGINAL_PRODUCT).
- Writing $\lambda = MP_L/w$ in cost minimisation; that is output per unit of money (INVERTED_MULTIPLIER).
- Giving the amount of input at the best split instead of its shadow price (GAVE_QUANTITY).
- Valuing water as if all of it went to one field, $\alpha/(2\sqrt{W})$ (ONE_FIELD_ONLY).
- Giving a positive shadow price to a resource that is not used up (SLACK_CONSTRAINT_PRICE).
- Flipping the sign of $\lambda$ by writing the constraint the other way round and then reading $-\lambda$ as the value of relaxing it (LAMBDA_SIGN).
- Using $\Delta V \approx \lambda\,\Delta c$ for a large change: the estimate is a tangent line and drifts away from the curve as $\Delta c$ grows.
- Comparing marginal utilities of income across people or across utility functions: they depend on how utility is measured.

## Practice
- `shadow-price-income-estimate` (difficulty 1): estimate the rise in maximum utility of $U = xy$ when income rises by $\Delta M$, using $\lambda\,\Delta M$; distractors NEW_LEVEL, LAMBDA_ONLY, DIVIDED_BY_LAMBDA, AVERAGE_NOT_MARGINAL.
- `shadow-price-marginal-cost` (difficulty 2): the multiplier of cost minimisation with $Q = A\sqrt{KL}$, which is the marginal cost of output; distractors GAVE_OPTIMAL_VALUE, DROPPED_HALF, CONSTANT_MARGINAL_PRODUCT, INVERTED_MULTIPLIER.
- `shadow-price-water` (difficulty 3): the shadow price of water shared between two fields with revenue $\alpha\sqrt{w_1} + \beta\sqrt{w_2}$; distractors AVERAGE_NOT_MARGINAL, GAVE_QUANTITY, GAVE_OPTIMAL_VALUE, ONE_FIELD_ONLY.

## Real world
- Emissions trading: in a cap-and-trade scheme such as the EU Emissions Trading System, the permit price works as the shadow price of the cap, the cost at the margin of cutting one more tonne. Tightening the cap raises it.
- Water markets: where water rights can be traded, as in parts of Australia and the western United States, the trading price reflects the marginal value of water to farms, the $\lambda$ of each farm's water constraint.
- Electricity networks: system operators set a price at each point of the grid from the multiplier of the constraint that supply must equal demand there; these "locational marginal prices" are shadow prices.
- Firms and regulators: the multiplier of a cost-minimisation problem is marginal cost, the number a firm compares with price when deciding whether to produce more, and that regulators estimate when they set prices for utilities.

---
id: MV12
title: The envelope theorem
block: MV
coreYear: 2
prerequisites: [MV09]
estMinutes: 45
status: draft
economicUses:
  - How much a firm's maximum profit rises when its output price rises (Hotelling's lemma)
  - Reading a firm's demand for labour and capital off its cost function (Shephard's lemma)
  - Deriving a consumer's demand from the indirect utility function (Roy's identity)
  - Measuring what a tax or a price rise costs a firm or a household
searchTerms:
  - "Roy's identity"
  - "Shephard's lemma"
generators: [hotelling-profit-price-slope, shephard-labour-demand, roys-identity-demand]
widgets: [profit-envelope-hotelling]
mistakeCodes:
  GAVE_MAX_PROFIT:
    label: Gave the maximum profit, not its slope
    explanation: π*(p) is the level of maximum profit. The question asks how fast it rises with the price, dπ*/dp, which the envelope theorem gives as the output q*.
  SLOPE_OF_OUTPUT:
    label: Gave the slope of the supply curve
    explanation: dq*/dp = 1/(2c) says how fast the best output rises with the price. The rate at which maximum profit rises is dπ*/dp = q*, the output itself.
  PRICE_AS_ANSWER:
    label: Gave the price
    explanation: At the best output the price equals marginal cost, but neither is the answer. A price rise of 1 earns 1 more on each of the q* units sold, so dπ*/dp = q*.
  GAVE_COST:
    label: Gave the cost, not its derivative
    explanation: C(w, r, Q) is the minimum cost. Shephard's lemma says the labour used is the partial derivative ∂C/∂w, how fast that cost rises with the wage.
  FORGOT_EXPONENT:
    label: Forgot the power of w
    explanation: The derivative of w^β' is β'·w^(β'−1), so ∂C/∂w = β'·C/w. Dividing C by w alone leaves out the factor β'.
  FORGOT_DIVIDE_BY_PRICE:
    label: Did not divide by the wage
    explanation: Differentiating w^β' lowers the power by 1, which divides by w. β'·C is the wage bill w·L*, not the amount of labour L*.
  GAVE_OTHER_INPUT:
    label: Differentiated with respect to the other price
    explanation: ∂C/∂r gives the capital K*. The labour demand is the derivative with respect to the wage, ∂C/∂w.
  ROY_SIGN:
    label: Lost the minus sign in Roy's identity
    explanation: A price rise lowers maximum utility, so ∂V/∂pₓ is negative. Roy's identity has a minus sign in front, x = −(∂V/∂pₓ)/(∂V/∂M), which makes demand positive.
  ROY_INVERTED:
    label: Turned Roy's identity upside down
    explanation: The price derivative goes on top and the income derivative underneath. ∂V/∂pₓ = −λx and ∂V/∂M = λ, so their ratio leaves x.
  OTHER_GOOD:
    label: Used the price of the other good
    explanation: Differentiating V with respect to p_y gives the demand for y. For the demand for x, differentiate with respect to pₓ.
  INCOME_POWER:
    label: Forgot the power of M
    explanation: When V contains M raised to a power n, ∂V/∂M = n·V/M, not V/M. Leaving out n makes the demand n times too large.
resources:
  - { title: "MIT 14.121 Microeconomic Theory I, Consumer Theory lecture slides (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/14-121-microeconomic-theory-i-fall-2015/resources/mit14_121f15_2s/", kind: course, verifiedAt: 2026-10-18 }
  - { title: "MIT 14.121 Microeconomic Theory I, Monotone Comparative Statics, with Applications to Producer Theory lecture slides (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/14-121-microeconomic-theory-i-fall-2015/resources/mit14_121f15_4s/", kind: course, verifiedAt: 2026-10-18 }
  - { title: "Principles of Microeconomics 3e, 7.5 Costs in the Long Run (OpenStax)", url: "https://openstax.org/books/principles-microeconomics-3e/pages/7-5-costs-in-the-long-run", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
Economists keep asking how the *best* outcome of a choice responds to a change in the world. If the price of wheat rises by 1, how much more profit does a farm make once it has adjusted its harvest? If wages rise, by how much does the cheapest way of making a car get dearer? If the price of bread rises, how much worse off is a household that reshuffles its shopping? Each answer is the derivative of a **value function**, the best value as a function of a price or other parameter. Working it out directly means solving the whole problem again and differentiating the result. The **envelope theorem** gives a shortcut: differentiate the objective with respect to the parameter and ignore the fact that the choices move. This one idea gives three standard results of microeconomics: **Hotelling's lemma** (profit and supply), **Shephard's lemma** (cost and input demand) and **Roy's identity** (indirect utility and demand). MV09's shadow price $\lambda$ is a special case.

## Intuition
A firm sells $q^*$ units at its best output. The price rises by 1. Two things happen to its maximum profit:
- *Direct effect:* every unit it already sells earns 1 more, so profit rises by $q^*$.
- *Indirect effect:* the firm changes its output to the new best level.

The indirect effect is zero, to first order. The firm was at the top of its profit hill, where the hill is flat: a small change in output, up or down, changes profit by almost nothing. So the whole rise in maximum profit, for a small price change, is the direct effect $q^*$.

The same argument works for any optimum. At the best choice the objective is flat in the choice variables, so when a parameter moves, re-optimising adds only a second-order amount. The best value moves at the rate the objective would move with the choices *held fixed*.

There is a picture behind the name. Freeze the choice at some value and draw the objective as a function of the parameter: one curve for each frozen choice. The value function is the **upper envelope** of this family, the curve that runs along the top of all of them. Each frozen-choice curve lies below the envelope and touches it at the parameter where that choice is the best one. Touching means having the same slope, and that is the envelope theorem.

## Definition and formulas
**The value function.** For a problem "choose $x$ to maximise $f(x, a)$", where $a$ is a parameter (a price, a tax rate, an income), let $x^*(a)$ be the best choice. The value function is
$$V(a) = \max_x f(x, a) = f\big(x^*(a),\, a\big).$$

**The envelope theorem (no constraint).**
$$\frac{dV}{da} = \frac{\partial f}{\partial a}\bigg|_{x = x^*(a)}.$$
*Reason:* by the chain rule (MV03), $V'(a) = f_x\big(x^*(a), a\big)\,x^{*\prime}(a) + f_a\big(x^*(a), a\big)$, and the first-order condition says $f_x = 0$ at the optimum, so the indirect term vanishes. The same holds with several choice variables, since every $f_{x_i} = 0$, and for a minimisation. For example, with $f(x, a) = ax - x^2$: $x^* = a/2$, $V(a) = a^2/4$ and $V'(a) = a/2$, which is $\partial f/\partial a = x$ evaluated at $x^* = a/2$.

**The envelope theorem with a constraint.** For "maximise $f(x, y, a)$ subject to $g(x, y, a) = c$" with Lagrangian $\mathcal{L} = f - \lambda(g - c)$ (MV08),
$$\frac{dV}{da} = \frac{\partial \mathcal{L}}{\partial a}\bigg|_{x^*,\,y^*,\,\lambda^*} = \frac{\partial f}{\partial a} - \lambda^*\,\frac{\partial g}{\partial a}.$$
Differentiate the Lagrangian with respect to the parameter only, wherever it appears, and evaluate at the optimum. When the parameter is the constant $c$ itself, $\partial \mathcal{L}/\partial c = \lambda$, which is the shadow-price result $dV/dc = \lambda$ of MV09.

**The picture.** For a frozen choice $\bar x$, the function $a \mapsto f(\bar x, a)$ is one curve of a family. Since $V(a) \ge f(\bar x, a)$ for every $a$, with equality at the $a_0$ where $\bar x = x^*(a_0)$, the difference $V(a) - f(\bar x, a)$ has a minimum at $a_0$, so its derivative is 0 there: $V'(a_0) = f_a(\bar x, a_0)$. A maximum value function is the upper envelope of its family; a minimum (such as a cost function) is the lower envelope. One consequence: freezing the choice gives a lower bound on a maximum value, because adjusting can only help.

**Hotelling's lemma (profit).** A competitive firm with cost $C(q)$ and output price $p$ has maximum profit $\pi^*(p) = \max_q\,[pq - C(q)]$. Since $\partial(pq - C)/\partial p = q$,
$$\frac{d\pi^*}{dp} = q^*(p).$$
With $C(q) = F + cq^2$: $q^* = p/(2c)$ and $\pi^*(p) = p^2/(4c) - F$, whose slope $p/(2c)$ is indeed $q^*$. For each frozen $q$, profit $pq - F - cq^2$ is a straight line in $p$ with slope $q$; $\pi^*$ is the convex curve along the top of these lines.

**A tax on output.** With a tax of $t$ per unit, $\pi^*(p, t) = \max_q\,[(p - t)q - C(q)]$ and $\partial\pi^*/\partial t = -q^*$: a small tax of $t$ per unit cuts maximum profit by about $t\,q^*$, even though the firm cuts its output. A lump-sum tax $T$ gives $\partial\pi^*/\partial T = -1$ and leaves output unchanged.

**Shephard's lemma (cost).** The cost function $C(w, r, Q) = \min\{wL + rK : F(K, L) = Q\}$ has Lagrangian $wL + rK - \lambda\big(F(K, L) - Q\big)$, so
$$\frac{\partial C}{\partial w} = L^*, \qquad \frac{\partial C}{\partial r} = K^*, \qquad \frac{\partial C}{\partial Q} = \lambda = MC.$$
For Cobb–Douglas technology the cost function has the form $C = k\,w^{\beta'} r^{\alpha'} Q^{\gamma}$ with $\alpha' + \beta' = 1$ (cost is homogeneous of degree 1 in the input prices, MV04). Then $L^* = \beta' C/w$ and $K^* = \alpha' C/r$: labour's share of cost, $wL^*/C$, is the constant $\beta'$.

**Roy's identity (demand).** For the indirect utility $V(p_x, p_y, M)$ of MV10, with $\mathcal{L} = U(x, y) - \lambda(p_x x + p_y y - M)$: $\partial V/\partial p_x = -\lambda x^*$ and $\partial V/\partial M = \lambda$. Dividing,
$$x^* = -\,\frac{\partial V/\partial p_x}{\partial V/\partial M}.$$
Check with $U = xy$: $V = \dfrac{M^2}{4p_xp_y}$, $\dfrac{\partial V}{\partial p_x} = -\dfrac{M^2}{4p_x^2p_y}$ and $\dfrac{\partial V}{\partial M} = \dfrac{M}{2p_xp_y}$, so $x^* = \dfrac{M}{2p_x}$, the demand found in MV08. In money terms a small price rise $\Delta p_x$ costs the consumer about $x^*\,\Delta p_x$ of income.

**When it holds.** The theorem needs a differentiable value function, which is the case when the best choice is unique and moves smoothly. It is a statement about small changes: for a large change, the frozen-choice estimate $f_a\,\Delta a$ misses the gain from adjusting, which grows roughly like $(\Delta a)^2$.

## Interactive
::widget{id="profit-envelope-hotelling"}

The graph shows a firm with cost $C(q) = 100 + 2q^2$. Each gold line is its profit $pq - 100 - 2q^2$ with output frozen at $q = 5$, $10$ or $15$; the lilac curve is maximum profit $\pi^*(p) = p^2/8 - 100$, which runs along the top of all such lines. Move **Price p** and watch the dashed green line: it is the frozen-output line for the best output $q^*(p)$, and it touches the curve at the dot. The panel shows $\pi^*(p)$, $q^*(p)$ and the slope of the curve measured numerically. Check: at the start ($p = 40$) the panel shows $\pi^* = 100$, $q^* = 10$ and slope 10, as in Example 1, and the green line lies on the gold $q = 10$ line. Move $p$ to 20 or 60: the green line now lies on the gold line for $q = 5$ or $q = 15$, and the slope always equals $q^*$.

## Worked examples

### Example 1 (easy): how a farm's best profit responds to the price of wheat
A farm sells wheat at a price of $p = 40$ a tonne and its cost of growing $q$ tonnes is $C(q) = 100 + 2q^2$. Find its best output and maximum profit, use the envelope theorem to find $d\pi^*/dp$, and estimate the gain if the price rises to 41. Compare with the exact gain.

1. $\pi(q, p) = pq - 100 - 2q^2$, and $\dfrac{\partial \pi}{\partial q} = p - 4q = 0$ gives $q^* = \dfrac{p}{4} = 10$
   *Why:* the farm chooses output where price equals marginal cost $4q$.
2. $\pi^* = 40 \cdot 10 - 100 - 2 \cdot 100 = 100$
   *Why:* maximum profit is profit at the best output.
3. $\dfrac{d\pi^*}{dp} = \dfrac{\partial \pi}{\partial p}\bigg|_{q = q^*} = q^* = 10$
   *Why:* the envelope theorem: output adjusts too, but $\partial\pi/\partial q = 0$ at the optimum, so only the direct effect counts. This is Hotelling's lemma.
4. Check: $\pi^*(p) = p \cdot \dfrac{p}{4} - 100 - 2 \cdot \dfrac{p^2}{16} = \dfrac{p^2}{8} - 100$, so $\pi^{*\prime}(40) = \dfrac{40}{4} = 10$
   *Why:* substituting $q^* = p/4$ gives the value function; differentiating it directly, the long way, gives the same 10.
5. Estimate $\Delta\pi^* \approx 10 \times 1 = 10$. With output frozen at 10, profit at $p = 41$ is $410 - 300 = 110$; re-optimising ($q = 10.25$) gives $\pi^*(41) = 110.125$, a gain of $10.125$
   *Why:* adjusting output adds only $0.125$, a second-order amount. The frozen-output line lies just below the envelope.

```verify
c = 2; F = 100; p = 40
q = p/(2*c)
assert q == 10
pistar = p*q - F - c*q^2
assert pistar == 100
assert pistar == p^2/(4*c) - F
# slope of the value function by a central difference equals q*
h = 0.001
slope = ((p + h)^2/8 - (p - h)^2/8)/(2*h)
assert abs(slope - q) < 0.000001
# a nearby output earns less
assert 40*9 - F - c*81 < pistar
assert 40*11 - F - c*121 < pistar
frozen = 41*10 - F - c*100
assert frozen == 110
assert 41/4 == 10.25
pi41 = 41^2/8 - F
assert pi41 == 110.125
assert pi41 - pistar == 10.125
assert pi41 - frozen == 0.125
```

### Example 2 (medium): a wage rise and a bakery's cost
A bakery makes $Q = K^{1/4}L^{1/4}$ batches a day; a worker costs $w$ and a machine $r$ a day. From MV09 Example 2 its cheapest plan for any target satisfies $K/L = w/r$. Find the cost function $C(w, r, Q)$, use Shephard's lemma to find the number of workers at $w = 16$, $r = 4$, $Q = 10$, and estimate what a wage rise to 17 does to the minimum cost.

1. $K = \dfrac{w}{r}L$ and $KL = Q^4$ give $L^* = Q^2\sqrt{\dfrac{r}{w}}$ and $K^* = Q^2\sqrt{\dfrac{w}{r}}$
   *Why:* the cost-minimising mix from the first-order conditions, then the output target fixes the scale.
2. $C(w, r, Q) = wL^* + rK^* = 2\sqrt{wr}\,Q^2$, so $C(16, 4, 10) = 2 \cdot 8 \cdot 100 = 1{,}600$
   *Why:* $w \cdot Q^2\sqrt{r/w} = Q^2\sqrt{wr}$, and the same for capital; this matches the 1,600 found in MV09.
3. $\dfrac{\partial C}{\partial w} = \sqrt{\dfrac{r}{w}}\,Q^2 = \dfrac{1}{2} \cdot 100 = 50 = L^*$
   *Why:* Shephard's lemma. In Cobb–Douglas form $C = 2w^{1/2}r^{1/2}Q^2$, so $\partial C/\partial w = \tfrac12 C/w = 800/16 = 50$.
4. Estimate $\Delta C \approx L^*\,\Delta w = 50 \times 1 = 50$
   *Why:* a wage rise of 1 costs about 1 more on each of the 50 workers.
5. Keeping the old plan costs $17 \cdot 50 + 4 \cdot 200 = 1{,}650$; the new cheapest plan costs $C(17, 4, 10) = 200\sqrt{68} \approx 1{,}649.24$
   *Why:* swapping some workers for machines ($L$ falls to about 48.51) saves only 0.76. The cost function is the lower envelope of the costs of fixed plans, so the old plan's cost line touches it at $w = 16$.

```verify
w = 16; r = 4; Q = 10
L = Q^2*sqrt(r/w)
K = Q^2*sqrt(w/r)
assert L == 50
assert K == 200
assert abs((K*L)^(1/4) - Q) < 0.000001
C = w*L + r*K
assert C == 1600
assert 2*sqrt(w*r)*Q^2 == C
# Shephard's lemma by a central difference
h = 0.0001
dCdw = (2*sqrt((w + h)*r)*Q^2 - 2*sqrt((w - h)*r)*Q^2)/(2*h)
assert abs(dCdw - L) < 0.000001
assert (1/2)*C/w == L
oldplan = 17*L + r*K
assert oldplan == 1650
C17 = 2*sqrt(17*r)*Q^2
assert abs(C17 - 1649.24) < 0.005
assert abs(200*sqrt(68) - C17) < 0.000001
assert abs(oldplan - C17 - 0.76) < 0.005
assert abs(Q^2*sqrt(r/17) - 48.51) < 0.005
```

### Example 3 (hard): demand from indirect utility with Roy's identity
A household has $U = xy$, food $x$ costs $p_x = 4$, other goods cost $p_y = 1$ and income is $M = 360$ (MV10 Example 3). Its indirect utility is $V = \dfrac{M^2}{4p_xp_y}$. Recover the demand for food from $V$ with Roy's identity, and find what a rise in the food price to 4.1 costs the household in money.

1. $V = \dfrac{360^2}{4 \cdot 4 \cdot 1} = \dfrac{129{,}600}{16} = 8{,}100$
   *Why:* the maximum utility at these prices and income, as found in MV10.
2. $\dfrac{\partial V}{\partial p_x} = -\dfrac{M^2}{4p_x^2p_y} = -\dfrac{129{,}600}{64} = -2{,}025$
   *Why:* a dearer food price lowers the best utility; by the envelope theorem this equals $\partial\mathcal{L}/\partial p_x = -\lambda x^*$.
3. $\dfrac{\partial V}{\partial M} = \dfrac{M}{2p_xp_y} = \dfrac{360}{8} = 45 = \lambda$
   *Why:* the marginal utility of income, the shadow price of the budget (MV09); check $\lambda = U_x/p_x = y^*/p_x = 180/4 = 45$.
4. $x^* = -\dfrac{-2{,}025}{45} = 45$, and in the same way $y^* = -\dfrac{\partial V/\partial p_y}{\partial V/\partial M} = \dfrac{8{,}100}{45} = 180$
   *Why:* Roy's identity divides $-\lambda x^*$ by $\lambda$. The result matches the demand $M/(2p_x) = 45$ of MV10.
5. For $\Delta p_x = 0.1$: $\Delta V \approx -2{,}025 \times 0.1 = -202.5$, which is $\dfrac{-202.5}{45} = -4.5$ in money, $x^*\,\Delta p_x$. The exact compensation, the income that restores utility 8,100, is $\sqrt{4 \cdot 4.1 \cdot 8{,}100} - 360 \approx 4.47$
   *Why:* dividing a utility change by $\lambda$ turns it into money. A price rise costs about the quantity bought times the rise; the household's switching away from food saves only the small difference.

```verify
px = 4; py = 1; M = 360
V = M^2/(4*px*py)
assert V == 8100
assert M^2 == 129600
Vpx = -M^2/(4*px^2*py)
assert Vpx == -2025
VM = M/(2*px*py)
assert VM == 45
# both derivatives by central differences
h = 0.0001
assert abs((M^2/(4*(px + h)*py) - M^2/(4*(px - h)*py))/(2*h) - Vpx) < 0.0001
assert abs(((M + h)^2/(4*px*py) - (M - h)^2/(4*px*py))/(2*h) - VM) < 0.0001
x = -Vpx/VM
assert x == 45
assert x == M/(2*px)
Vpy = -M^2/(4*px*py^2)
y = -Vpy/VM
assert y == 180
assert y/px == VM
dV = Vpx*0.1
assert abs(dV + 202.5) < 0.000001
assert abs(dV/VM + 4.5) < 0.000001
comp = sqrt(4*4.1*8100) - M
assert abs(comp - 4.47) < 0.005
assert comp < 4.5
```

## Common mistakes
- Giving the maximum profit $\pi^*$ when the question asks for its slope $d\pi^*/dp$ (GAVE_MAX_PROFIT).
- Giving $dq^*/dp$, the slope of the supply curve, instead of $d\pi^*/dp = q^*$ (SLOPE_OF_OUTPUT).
- Answering with the price, or the marginal cost, which equals it at the optimum (PRICE_AS_ANSWER).
- Reporting the minimum cost $C$ instead of the input demand $\partial C/\partial w$ (GAVE_COST).
- Writing $\partial C/\partial w = C/w$ for $C = k\,w^{\beta'}r^{\alpha'}Q^{\gamma}$, forgetting the factor $\beta'$ (FORGOT_EXPONENT).
- Writing $\partial C/\partial w = \beta' C$ without dividing by $w$; that is the wage bill, not the number of workers (FORGOT_DIVIDE_BY_PRICE).
- Differentiating with respect to $r$, which gives capital, when labour was asked for (GAVE_OTHER_INPUT).
- Dropping the minus sign in Roy's identity and getting a negative demand (ROY_SIGN).
- Dividing $\partial V/\partial M$ by $\partial V/\partial p_x$ instead of the other way round (ROY_INVERTED).
- Differentiating $V$ with respect to $p_y$ when the demand for $x$ was asked for (OTHER_GOOD).
- Taking $\partial V/\partial M = V/M$ when $V$ contains $M^n$ with $n \neq 1$ (INCOME_POWER).
- Adding the indirect effect $f_x\,x^{*\prime}(a)$ as if it were not zero, or working hard to find $x^{*\prime}(a)$ when it is not needed.
- With a constraint, differentiating only $f$ and forgetting the term $-\lambda\,\partial g/\partial a$ when the parameter also appears in the constraint, as a price does in a budget.
- Reading the theorem as "the choice does not change". The choice does change; the change just has no first-order effect on the best value.

## Practice
- `hotelling-profit-price-slope` (difficulty 1): the rate $d\pi^*/dp$ at which a competitive firm's maximum profit rises with the price, for cost $F + cq^2$; distractors GAVE_MAX_PROFIT, SLOPE_OF_OUTPUT, PRICE_AS_ANSWER.
- `shephard-labour-demand` (difficulty 2): the labour demand $L^* = \partial C/\partial w$ from a Cobb–Douglas cost function $k\,w^{\beta'}r^{\alpha'}Q^{\gamma}$; distractors GAVE_COST, FORGOT_EXPONENT, FORGOT_DIVIDE_BY_PRICE, GAVE_OTHER_INPUT.
- `roys-identity-demand` (difficulty 3): the demand for $x$ from an indirect utility function $A\,M^{a+b}/(p_x^a p_y^b)$ with Roy's identity; distractors ROY_SIGN, ROY_INVERTED, OTHER_GOOD, INCOME_POWER.

## Real world
- Long-run and short-run costs: a firm's long-run average cost curve is the lower envelope of its short-run curves, one for each plant size. Each short-run curve touches the long-run curve at the output for which that plant is the best one, which is how the theorem got its name.
- Commodity prices and farm incomes: by Hotelling's lemma a rise of 1 in the price of a crop raises a farm's best profit by about the quantity it sells, whatever it does next. Ministries use this to estimate quickly who gains and loses from a price shock.
- Cost of living and compensation: by Roy's identity a small price rise costs a household about the quantity it buys times the rise. Statistics offices and governments use this first-order rule to estimate how much a food or energy price shock costs different households, and how large a transfer would compensate them.
- Estimating production technology: economists often estimate a firm's cost function from data on costs and input prices, then recover the demands for labour and capital, and how they respond to wages, by Shephard's lemma, without ever observing the production function directly.

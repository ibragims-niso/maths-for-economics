---
id: MV08
title: The Lagrange method (equality constraints)
block: MV
coreYear: 2
prerequisites: [MV07]
estMinutes: 50
status: draft
economicUses:
  - Utility maximisation subject to a budget
  - A firm minimising the cost of an output target
  - Splitting a fixed amount of time or money between two uses
  - Deriving demand functions from preferences
generators: [lagrange-budget-good-quantity, lagrange-cost-min-input, lagrange-multiplier-utility]
widgets: [lagrange-budget-tangency]
mistakeCodes:
  ALL_ON_ONE_GOOD:
    label: Spent the whole budget on one good
    explanation: M/pₓ is the most of x the budget can buy, not the best amount. With U = xᵃyᵇ the consumer spends only the share a/(a + b) of income on x, so x* = a·M/((a + b)·pₓ).
  EQUAL_SPLIT:
    label: Split the budget equally
    explanation: Half the budget on each good is right only when the exponents are equal. In general the spending on each good is in the ratio of the exponents, a to b.
  WRONG_PRICE:
    label: Divided by the other good's price
    explanation: Each good is measured with its own price. Spending on x is divided by pₓ to give x*, and λ = Uₓ/pₓ uses the price of x. Dividing by the price of y mixes the two goods up.
  SWAPPED_EXPONENTS:
    label: Swapped the exponents
    explanation: The exponent on x sets the share of income spent on x. Check which exponent belongs to which good before writing the share a/(a + b).
  INVERTED_PRICE_RATIO:
    label: Set the MRTS equal to r/w
    explanation: The MRTS is MP_L/MP_K, and the cost-minimising condition is MP_L/MP_K = w/r, the wage over the rental price. Turning the price ratio upside down gives the other input's amount.
  EQUAL_INPUTS:
    label: Used equal amounts of both inputs
    explanation: With Q = A·√(KL) equal inputs are cheapest only when w = r. A dearer input is used less, so K/L = w/r at the optimum.
  MISSED_SQUARE_ROOT:
    label: Forgot the square root
    explanation: Putting K = (w/r)·L into √(KL) gives L·√(w/r), not L·(w/r). Take the square root of the price ratio.
  FORGOT_COEFFICIENT:
    label: Forgot the constant in front
    explanation: In Q = A·√(KL) the constant A multiplies output. Divide the target by A before solving for the input.
  GAVE_QUANTITY:
    label: Gave a quantity instead of λ
    explanation: The question asks for the multiplier, not the bundle. Find x* and y* first, then put them into a first-order condition such as Uₓ = λ·pₓ and solve for λ.
  AVERAGE_NOT_MARGINAL:
    label: Divided total utility by income
    explanation: λ is the marginal utility of income, the extra utility from one more unit of money, not the average U*/M. For U = xᵃyᵇ the two differ by the factor a + b.
  LAMBDA_SIGN:
    label: Lost the sign of λ
    explanation: With the Lagrangian written as f − λ(g − c), the condition fₓ − λgₓ = 0 gives λ = fₓ/gₓ, which is positive when both marginal utility and price are positive.
resources:
  - { title: "Calculus Volume 3, 4.8 Lagrange Multipliers (OpenStax)", url: "https://openstax.org/books/calculus-volume-3/pages/4-8-lagrange-multipliers", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "MIT 18.02SC Multivariable Calculus, Session 39: Statement of Lagrange Multipliers and Example (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-02sc-multivariable-calculus-fall-2010/pages/2.-partial-derivatives/part-c-lagrange-multipliers-and-constrained-differentials/session-39-statement-of-lagrange-multipliers-and-example/", kind: course, verifiedAt: 2026-10-18 }
  - { title: "Principles of Microeconomics 3e, Appendix B Indifference Curves (OpenStax)", url: "https://openstax.org/books/principles-microeconomics-3e/pages/b-indifference-curves", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
Most economic choices come with a limit. A student with 600 a month must split it between food and everything else; spending more on one means less on the other. A firm that has promised a customer 240 units a day looks for the cheapest mix of workers and machines that delivers exactly that. A student with 30 hours before exams decides how to share them between two subjects. In each case something is maximised or minimised (utility, cost, marks) while an equation must hold: the budget is spent, the target is met, the hours add up. MV07 found the top of a hill with no fence; this topic finds the highest point along a fence. The **Lagrange method** turns such a constrained problem into a set of equations you already know how to solve.

## Intuition
Draw the indifference curves of a consumer, the level curves of utility (MV01), and the budget line on the same graph. Walk along the budget line. Wherever an indifference curve *crosses* the line, you can keep walking in one direction and reach a higher curve, so that point cannot be the best. The best affordable bundle is where an indifference curve just *touches* the budget line without crossing it: the two curves are **tangent** there and have the same slope.

The slope of an indifference curve is $-MRS$ and the slope of the budget line is $-p_x/p_y$ (C110), so at the best bundle
$$MRS = \frac{p_x}{p_y}:$$
the rate at which the consumer is willing to swap the goods equals the rate at which the market lets them swap.

The same picture in gradients: the gradient of a function is perpendicular to its level curve (MV02). Two curves that touch have the same direction there, so their perpendiculars are parallel too. At the optimum the gradient of the objective is a multiple of the gradient of the constraint, $\nabla f = \lambda \nabla g$. The number $\lambda$, the **Lagrange multiplier**, is the scale factor between the two arrows.

## Definition and formulas
**The problem.** Maximise (or minimise) $f(x, y)$ subject to $g(x, y) = c$.

**The Lagrangian** combines the objective and the constraint with a new unknown $\lambda$:
$$\mathcal{L}(x, y, \lambda) = f(x, y) - \lambda\,\big(g(x, y) - c\big).$$

**First-order conditions** (three equations in three unknowns $x, y, \lambda$):
$$\mathcal{L}_x = f_x - \lambda g_x = 0, \qquad \mathcal{L}_y = f_y - \lambda g_y = 0, \qquad \mathcal{L}_\lambda = -\big(g(x, y) - c\big) = 0.$$
The first two say $\nabla f = \lambda \nabla g$ (the tangency); the third gives back the constraint.

**The ratio trick.** Divide the first condition by the second to remove $\lambda$:
$$\frac{f_x}{f_y} = \frac{g_x}{g_y}.$$
This gives one equation linking $x$ and $y$; put it into the constraint and solve. Then $\lambda = f_x / g_x$.

**Substitution as a check.** If the constraint can be solved for $y$, put $y(x)$ into $f$ and maximise a function of one variable as in C109. It must give the same answer. The Lagrange method is needed when the constraint cannot be solved neatly, when there are many variables, or when you want $\lambda$.

**Utility maximisation.** Maximise $U(x, y)$ subject to $p_x x + p_y y = M$. The conditions give
$$MRS = \frac{U_x}{U_y} = \frac{p_x}{p_y}, \qquad \lambda = \frac{U_x}{p_x} = \frac{U_y}{p_y}:$$
the last unit of money spent on each good adds the same utility. For Cobb–Douglas utility $U = x^a y^b$ the consumer spends the share $a/(a+b)$ of income on $x$:
$$x^* = \frac{a}{a+b}\cdot\frac{M}{p_x}, \qquad y^* = \frac{b}{a+b}\cdot\frac{M}{p_y}.$$

**Cost minimisation.** Minimise $wL + rK$ subject to $Q(K, L) = \bar Q$. The same steps give
$$MRTS = \frac{MP_L}{MP_K} = \frac{w}{r}:$$
the isoquant is tangent to the lowest isocost line that reaches it. Here $\lambda = w / MP_L$ is the cost of one more unit of output.

**Several constraints.** With $m$ constraints $g_1 = c_1, \dots, g_m = c_m$ and $n$ variables, use one multiplier per constraint, $\mathcal{L} = f - \lambda_1(g_1 - c_1) - \dots - \lambda_m(g_m - c_m)$, and solve the $n + m$ first-order conditions.

**Second-order condition.** A tangency can be a maximum or a minimum along the constraint. For two variables and one constraint, build the **bordered Hessian**, the Hessian of $\mathcal{L}$ in $x$ and $y$ with the constraint's gradient as a border:
$$\bar H = \begin{bmatrix} 0 & g_x & g_y \\ g_x & \mathcal{L}_{xx} & \mathcal{L}_{xy} \\ g_y & \mathcal{L}_{xy} & \mathcal{L}_{yy} \end{bmatrix}.$$
If $\det \bar H > 0$ at the point, it is a local maximum along the constraint; if $\det \bar H < 0$, a local minimum. In words: what matters is how $f$ bends *along* the constraint, not in every direction as in MV07. A useful shortcut: if the objective is quasiconcave (its upper level sets are convex, MV06) and the constraint is a straight line, every tangency is the maximum. Cobb–Douglas utility is quasiconcave, so its tangency point is always the best bundle.

**What $\lambda$ means, in brief.** $\lambda$ is roughly the rise in the best value of $f$ when $c$ rises by one unit: for a consumer, the extra utility from one more unit of income. MV09 treats this shadow price properly.

## Interactive
::widget{id="lagrange-budget-tangency"}

The green line is the budget $p_x x + 10y = M$ of a student who buys meals $x$ and other goods $y$; the lilac curves are indifference curves of $U = x^a y^{1-a}$, and the dot marks the best bundle. Move the **Price of a meal p_x**, **Income M** and **Weight on meals a** sliders and watch the solid indifference curve stay tangent to the budget line, while the dashed lower curve cuts it twice. The panel shows the best bundle, the MRS there and the price ratio $p_x/p_y$: the last two are always equal. Check: at the start ($p_x = 5$, $M = 600$, $a = 0.5$) the panel shows the bundle $(60, 30)$ of Example 1 (with $a = 0.5$ the utility is $\sqrt{xy}$, which ranks bundles exactly as $xy$ does), and MRS and price ratio are both 0.5. Raise $p_x$ to 10: the bundle moves to $(30, 30)$ and both read 1.

## Worked examples

### Example 1 (easy): a student's monthly budget
A student has 600 a month for meals $x$, which cost 5 each, and other goods $y$, which cost 10 a unit. Their utility is $U = xy$. Find the best bundle with the Lagrange method, check it by substitution, and find $\lambda$.

1. $\mathcal{L} = xy - \lambda(5x + 10y - 600)$
   *Why:* the objective minus $\lambda$ times the constraint written as "something $= 0$".
2. $\mathcal{L}_x = y - 5\lambda = 0$, $\mathcal{L}_y = x - 10\lambda = 0$, $5x + 10y = 600$
   *Why:* three first-order conditions for the three unknowns $x$, $y$ and $\lambda$.
3. $\dfrac{y}{x} = \dfrac{5}{10}$, so $x = 2y$
   *Why:* dividing the first two conditions removes $\lambda$; this is $MRS = p_x/p_y$, the tangency condition.
4. $5(2y) + 10y = 600$, so $y^* = 30$ and $x^* = 60$; utility is $U^* = 1{,}800$
   *Why:* the tangency alone does not fix the bundle; the budget picks the one point on the line where it holds.
5. $\lambda = \dfrac{y^*}{5} = 6$, and also $\dfrac{x^*}{10} = 6$
   *Why:* the last unit of money gives the same extra utility, 6, whichever good it buys. At $(60, 30)$, $\nabla U = (30, 60) = 6 \cdot (5, 10) = \lambda \nabla g$.
6. Check: $y = 60 - \tfrac12 x$, so $U = 60x - \tfrac12 x^2$ and $\dfrac{dU}{dx} = 60 - x = 0$ gives $x = 60$; $\dfrac{d^2U}{dx^2} = -1 < 0$
   *Why:* solving the budget for $y$ turns the problem into one variable (C109), and both methods agree.

```verify
px = 5; py = 10; M = 600
x = 60; y = 30
assert px*x + py*y == M
# tangency: MRS = y/x equals the price ratio
assert y/x == px/py
lam = y/px
assert lam == 6
assert x/py == lam
U = x*y
assert U == 1800
# gradients are parallel: grad U = lam * grad g
assert y == lam*px
assert x == lam*py
# substitution: U(x) = 60x - x^2/2 has slope 60 - x
assert 60 - x == 0
# a nearby bundle on the budget line is worse
assert 61*(M - px*61)/py < U
# bordered Hessian [0,5,10; 5,0,1; 10,1,0] is positive: a maximum
assert det([0, 5, 10; 5, 0, 1; 10, 1, 0]) == 100
```

### Example 2 (medium): a firm meeting an output target at least cost
A workshop produces $Q = 4K^{1/2}L^{1/2}$ units a day with $K$ machines and $L$ workers. A worker costs 16 a day and a machine 4 a day. It has promised a customer $\bar Q = 240$ units a day. Find the cheapest $L$ and $K$, the minimum cost, and $\lambda$.

1. $\mathcal{L} = 16L + 4K - \lambda\big(4K^{1/2}L^{1/2} - 240\big)$
   *Why:* now cost is the objective and the output target is the constraint; the script $\mathcal{L}$ keeps the Lagrangian apart from labour $L$.
2. $\mathcal{L}_L = 16 - \lambda \cdot 2K^{1/2}L^{-1/2} = 0$ and $\mathcal{L}_K = 4 - \lambda \cdot 2K^{-1/2}L^{1/2} = 0$
   *Why:* $2K^{1/2}L^{-1/2}$ and $2K^{-1/2}L^{1/2}$ are the marginal products of labour and capital; each input price equals $\lambda$ times its marginal product.
3. $\dfrac{MP_L}{MP_K} = \dfrac{K}{L} = \dfrac{16}{4} = 4$, so $K = 4L$
   *Why:* dividing removes $\lambda$ and gives $MRTS = w/r$. Labour is four times as dear as capital, so the firm uses four machines per worker.
4. $4\sqrt{4L \cdot L} = 8L = 240$, so $L^* = 30$ and $K^* = 120$
   *Why:* the output target fixes the scale.
5. Cost $= 16 \cdot 30 + 4 \cdot 120 = 960$ and $\lambda = \dfrac{16}{MP_L} = \dfrac{16}{2\sqrt{120/30}} = 4$
   *Why:* $\lambda$ is the cost of producing one more unit at the best mix; here it equals the average cost $960/240 = 4$ because doubling both inputs doubles output. Cost is a straight line and the isoquant bends towards the origin, so this tangency is the minimum.

```verify
w = 16; r = 4; A = 4; Qbar = 240
L = 30; K = 120
assert abs(A*sqrt(K*L) - Qbar) < 0.000001
# MRTS = MP_L / MP_K = K/L equals w/r
MPL = 2*sqrt(K/L)
MPK = 2*sqrt(L/K)
assert abs(MPL/MPK - w/r) < 0.000001
assert K/L == 4
cost = w*L + r*K
assert cost == 960
lam = w/MPL
assert abs(lam - 4) < 0.000001
assert abs(r/MPK - lam) < 0.000001
assert abs(cost/Qbar - lam) < 0.000001
# another bundle on the same isoquant costs more: K = (Qbar/A)^2/L = 90 at L = 40
assert (Qbar/A)^2/40 == 90
assert w*40 + r*90 == 1000
assert w*40 + r*90 > cost
# inverting the price ratio (K/L = 1/4) would give L = 120
assert (Qbar/A)*sqrt(w/r) == 120
```

### Example 3 (hard): Cobb–Douglas demands and the second-order check
A consumer has utility $U = x^2y$, income $M = 900$ and prices $p_x = 10$, $p_y = 15$. Derive the demand formulas for $U = x^a y^b$, apply them, and confirm the point is a maximum with the bordered Hessian.

1. $a x^{a-1}y^b = \lambda p_x$ and $b x^a y^{b-1} = \lambda p_y$
   *Why:* the first two first-order conditions of $\mathcal{L} = x^a y^b - \lambda(p_x x + p_y y - M)$.
2. $\dfrac{a y}{b x} = \dfrac{p_x}{p_y}$, so $p_y y = \dfrac{b}{a}\,p_x x$
   *Why:* the ratio trick; the powers cancel to $y/x$. Spending on $y$ is $b/a$ times spending on $x$.
3. $p_x x\left(1 + \dfrac{b}{a}\right) = M$, so $x^* = \dfrac{a}{a+b}\cdot\dfrac{M}{p_x}$ and $y^* = \dfrac{b}{a+b}\cdot\dfrac{M}{p_y}$
   *Why:* put the spending link into the budget. The shares of income $a/(a+b)$ and $b/(a+b)$ do not depend on prices or income.
4. With $a = 2$, $b = 1$: $x^* = \tfrac23 \cdot \tfrac{900}{10} = 60$, $y^* = \tfrac13 \cdot \tfrac{900}{15} = 20$, and $\lambda = \dfrac{2x^*y^*}{10} = 240$
   *Why:* two thirds of income, 600, goes on $x$. The check $\dfrac{U_y}{p_y} = \dfrac{60^2}{15} = 240$ gives the same $\lambda$.
5. $\mathcal{L}_{xx} = 2y = 40$, $\mathcal{L}_{xy} = 2x = 120$, $\mathcal{L}_{yy} = 0$, so $\det\begin{bmatrix} 0 & 10 & 15 \\ 10 & 40 & 120 \\ 15 & 120 & 0 \end{bmatrix} = 27{,}000 > 0$
   *Why:* the constraint is linear, so the second derivatives of $\mathcal{L}$ are those of $U$. A positive bordered Hessian means utility bends down along the budget line: a maximum, with $U^* = 72{,}000$.

```verify
a = 2; b = 1; px = 10; py = 15; M = 900
x = a/(a + b)*M/px
y = b/(a + b)*M/py
assert abs(x - 60) < 0.000001
assert abs(y - 20) < 0.000001
assert abs(px*x + py*y - M) < 0.000001
assert abs(px*x - 600) < 0.000001
# tangency: MRS = a y / (b x) = px/py
assert abs(a*y/(b*x) - px/py) < 0.000001
lam = 2*x*y/px
assert abs(lam - 240) < 0.000001
assert abs(x^2/py - lam) < 0.000001
U = x^2*y
assert abs(U - 72000) < 0.000001
Hb = [0, px, py; px, 2*y, 2*x; py, 2*x, 0]
assert abs(det(Hb) - 27000) < 0.000001
# neighbours on the budget line give less utility
assert 59^2*(M - px*59)/py < U
assert 61^2*(M - px*61)/py < U
```

## Common mistakes
- Putting the whole budget into the good being asked about, $x = M/p_x$ (ALL_ON_ONE_GOOD).
- Splitting the budget half and half when the exponents differ (EQUAL_SPLIT).
- Dividing spending on $x$ by the price of $y$, or computing $\lambda$ as $U_x/p_y$ (WRONG_PRICE).
- Giving $x$ the share of income that belongs to $y$ (SWAPPED_EXPONENTS).
- Writing the cost-minimising condition as $MP_L/MP_K = r/w$ (INVERTED_PRICE_RATIO).
- Using equal amounts of labour and capital whatever their prices (EQUAL_INPUTS).
- Writing $\sqrt{(w/r)L \cdot L}$ as $(w/r)L$ (MISSED_SQUARE_ROOT).
- Solving $\sqrt{KL} = \bar Q$ when output is $A\sqrt{KL}$ (FORGOT_COEFFICIENT).
- Reporting $x^*$ or $y^*$ when the question asked for $\lambda$ (GAVE_QUANTITY).
- Taking $\lambda$ as total utility per unit of income, $U^*/M$, instead of the marginal value (AVERAGE_NOT_MARGINAL).
- Writing $\lambda = -U_x/p_x$ after a sign slip in the Lagrangian (LAMBDA_SIGN).
- Stopping at the tangency $MRS = p_x/p_y$: it is one equation in two unknowns, and the budget is needed to fix the bundle.
- Trusting a tangency when the best choice is a corner, for example buying none of a good; such cases need the inequality methods of OP01.

## Practice
- `lagrange-budget-good-quantity` (difficulty 1): the utility-maximising quantity of one good for $U = x^a y^b$ on a budget; distractors ALL_ON_ONE_GOOD, EQUAL_SPLIT, WRONG_PRICE, SWAPPED_EXPONENTS.
- `lagrange-cost-min-input` (difficulty 2): the cheapest number of workers or machines that produces an output target with $Q = A\sqrt{KL}$; distractors INVERTED_PRICE_RATIO, EQUAL_INPUTS, MISSED_SQUARE_ROOT, FORGOT_COEFFICIENT.
- `lagrange-multiplier-utility` (difficulty 3): the value of $\lambda$ at the best bundle for $U = x^a y^b$ on a budget; distractors GAVE_QUANTITY, AVERAGE_NOT_MARGINAL, WRONG_PRICE, LAMBDA_SIGN.

## Real world
- Consumer demand: statistics offices and central banks model household spending as shares of income; with Cobb–Douglas preferences each share stays fixed when prices change, a useful first approximation for broad categories such as housing.
- Producer choice: when wages rise relative to the cost of machines, the condition $MRTS = w/r$ predicts that firms use more machines per worker, one reason for automation in high-wage economies.
- Public budgets: a ministry with a fixed budget dividing it between two programmes, such as schools and clinics, faces the same tangency condition, with the benefit per unit of money equal across programmes at the optimum.
- Finance and engineering: choosing portfolio weights that add up to 1, or a design that meets a fixed specification at least cost, are equality-constrained problems solved with Lagrange multipliers, usually with many variables and constraints at once.

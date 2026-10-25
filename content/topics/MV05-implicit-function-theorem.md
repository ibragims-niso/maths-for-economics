---
id: MV05
title: Implicit function theorem
block: MV
coreYear: 2
prerequisites: [MV03, C110]
estMinutes: 45
status: draft
economicUses:
  - "Comparative statics: how an equilibrium price responds to income or a tax"
  - Marginal rate of substitution and of technical substitution
  - Effects of government spending and the money supply in the IS–LM model
  - Slopes of level curves of utility, cost and production functions
searchTerms:
  - "Implicit function"
  - "Marginal rate of substitution"
  - "MRS"
  - "MRTS"
generators: [level-curve-slope-ift, equilibrium-price-income-response, islm-comparative-statics-cramer]
widgets: [income-shift-equilibrium]
mistakeCodes:
  SIGN:
    label: Lost the minus sign
    explanation: The theorem gives dy/dx = −F_x/F_y; the minus comes from moving F_x·dx to the other side of F_x·dx + F_y·dy = 0. Level curves of utility and cost slope downwards, and a demand rise pushes the equilibrium price up.
  INVERTED_RATIO:
    label: Turned the ratio upside down
    explanation: The partial derivative with respect to the variable that changes (x) goes on top, and the one with respect to the variable that adjusts (y) goes underneath. −F_y/F_x is dx/dy, the slope with the axes swapped.
  DROPPED_CROSS_TERM:
    label: Left out the cross term
    explanation: A term such as b·xy depends on both variables, so it contributes b·y to F_x and b·x to F_y. Treating it as a constant drops part of both partial derivatives.
  IGNORED_SUPPLY:
    label: Used only the demand slope
    explanation: F = demand − supply, so F_p is the demand slope minus the supply slope. A demand shift is absorbed partly by a higher price and partly by a larger quantity; leaving out the supply slope assumes the quantity cannot change.
  SUPPLY_SLOPE_ONLY:
    label: Used only the supply slope
    explanation: Buyers react to the higher price too, so the demand slope belongs in F_p as well. The denominator is the sum of how strongly both sides respond to the price.
  POWER_RULE:
    label: Forgot the 2 from p²
    explanation: The derivative of b·p² with respect to p is 2b·p. Writing b·p halves the demand response and makes the price move too much.
  WRONG_EQUATION:
    label: Put the policy change in the wrong equation
    explanation: Government spending G appears in the goods-market equation (first row) and the money supply M in the money-market equation (second row). The right-hand side for a unit rise in G is (1, 0); for M it is (0, 1).
  NOT_DIVIDED:
    label: Forgot to divide by det J
    explanation: Cramer's rule gives each unknown as a ratio, det J_Y / det J. The determinant with the replaced column is only the top of that fraction.
  SIMPLE_MULTIPLIER:
    label: Used the simple multiplier
    explanation: 1/(1 − C′) is the multiplier when the interest rate cannot change. In IS–LM higher income raises money demand and the interest rate, which crowds out investment, so the effect is smaller.
resources:
  - { title: "Calculus Volume 3, 4.5 The Chain Rule (OpenStax)", url: "https://openstax.org/books/calculus-volume-3/pages/4-5-the-chain-rule", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Principles of Economics 3e, 3.3 Changes in Equilibrium Price and Quantity: The Four-Step Process (OpenStax)", url: "https://openstax.org/books/principles-economics-3e/pages/3-3-changes-in-equilibrium-price-and-quantity-the-four-step-process", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
Average incomes rise by a thousand a year. How much does the price of restaurant meals go up? The government spends one billion more. How much does national income rise once higher interest rates have cut some investment? Questions like these ask how the *solution* of an economic model moves when something outside the model changes. Economists call this **comparative statics**.

The trouble is that the solution is often only known as "the price at which demand equals supply" or "the income and interest rate at which both markets clear". With a curved demand or more than one equation there may be no neat formula for it. The implicit function theorem gets round this: it gives the derivative of the solution straight from the partial derivatives of the equations, and it says when the solution changes smoothly at all. The slopes of indifference curves and isoquants (C110) are its simplest case.

## Intuition
An equation $F(x, y) = 0$ ties $y$ to $x$. Stand at a point on it and move $x$ by a small $dx$. To stay on the equation, $y$ must move by a $dy$ that cancels the change in $F$. By the total differential (MV03),
$$dF = F_x\,dx + F_y\,dy = 0 \quad\Rightarrow\quad \frac{dy}{dx} = -\frac{F_x}{F_y}.$$
This is the slope C110 found by implicit differentiation, in one line.

It only works if $F_y \neq 0$: $y$ must be able to undo the change that $x$ causes. Take the circle $x^2 + y^2 = 25$ at its leftmost point $(-5, 0)$. There $F_y = 2y = 0$ and the tangent is vertical. Just to the right of $x = -5$ there are two points of the circle, one above and one below the axis, and to the left there are none, so near this point the circle is not the graph of any function $y(x)$. Everywhere else on the circle $F_y \neq 0$ and the slope $-x/y$ is fine.

In a market the same idea reads: income $I$ is the $x$ and the equilibrium price $p$ is the $y$. When income rises, demand shifts out, and the price must rise just enough to bring supply and demand back together.

## Definition and formulas
**The implicit function theorem (two variables).** Let $F(x, y)$ have continuous partial derivatives near a point $(x_0, y_0)$ with $F(x_0, y_0) = 0$ and
$$F_y(x_0, y_0) \neq 0.$$
Then near $x_0$ there is exactly one function $y = g(x)$ with $g(x_0) = y_0$ and $F\big(x, g(x)\big) = 0$. It is differentiable, and
$$g'(x) = \frac{dy}{dx} = -\frac{F_x(x, y)}{F_y(x, y)}.$$
The theorem is local: it speaks about a neighbourhood of the point, and you need not be able to write $g$ down.

**Level curves: MRS and MRTS.** An indifference curve $U(x, y) = \bar U$ is $F = U - \bar U = 0$, so
$$\frac{dy}{dx} = -\frac{U_x}{U_y}, \qquad MRS = \frac{U_x}{U_y} = \frac{MU_x}{MU_y}.$$
For $U = x^a y^b$ this gives $-\dfrac{a\,y}{b\,x}$, as in C110. On an isoquant $Q(L, K) = \bar Q$, $\dfrac{dK}{dL} = -\dfrac{Q_L}{Q_K}$, so $MRTS = \dfrac{MP_L}{MP_K}$.

**More variables and parameters.** If $F(x_1, \ldots, x_n, y) = 0$ and $F_y \neq 0$, then $\dfrac{\partial y}{\partial x_i} = -\dfrac{F_{x_i}}{F_y}$. In a model the variable that adjusts ($y$, say a price) is **endogenous** and the ones set outside the model (income, a tax) are **exogenous** parameters. An equilibrium condition $F(p, a) = 0$ defines the equilibrium $p^*(a)$, and
$$\frac{dp^*}{da} = -\frac{F_a}{F_p}.$$

**A market with a demand shifter.** Demand $Q_D = a - b\,p + c\,I$, supply $Q_S = d + e\,p$ (with $b, c, e > 0$). The equilibrium condition is $F(p, I) = Q_D - Q_S = 0$, with $F_I = c$ and $F_p = -(b + e)$, so
$$\frac{dp^*}{dI} = \frac{c}{b + e}, \qquad \frac{dq^*}{dI} = e\,\frac{dp^*}{dI} = \frac{e\,c}{b + e}.$$
With $Q_D = 60 - 3p + 2I$, $Q_S = 20 + 2p$ and $I = 30$: $p^* = 20$, $q^* = 60$, and $dp^*/dI = 2/5 = 0.4$, $dq^*/dI = 0.8$. Here you could also solve directly, $p^* = (40 + 2I)/5$, but with a curved demand (Example 2) the theorem is much quicker. Because $F_p$ is demand slope minus supply slope, it is negative whenever demand slopes down and supply slopes up, so the condition $F_p \neq 0$ holds.

**A tax.** With a tax $t$ per unit paid by sellers, they keep $p - t$, so $F(p, t) = D(p) - S(p - t) = 0$. Then $F_t = S'$ and $F_p = D' - S'$, so $\dfrac{dp^*}{dt} = \dfrac{S'}{S' - D'}$. In the linear market above this is $\dfrac{e}{b + e} = \dfrac{2}{5} = 0.4$: buyers pay 40 % of a small tax through a higher price.

**Two equations, two unknowns.** Suppose $F^1(x, y; a) = 0$ and $F^2(x, y; a) = 0$ determine $x$ and $y$. Take total differentials and divide by $da$:
$$\begin{bmatrix} F^1_x & F^1_y \\ F^2_x & F^2_y \end{bmatrix} \begin{bmatrix} dx/da \\ dy/da \end{bmatrix} = -\begin{bmatrix} F^1_a \\ F^2_a \end{bmatrix}.$$
The matrix of partial derivatives is the **Jacobian** $J$. If $\det J \neq 0$ at the point, then $x$ and $y$ are differentiable functions of $a$ near it, and Cramer's rule (LA104) gives each derivative as a ratio of determinants. The condition $\det J \neq 0$ plays the role of $F_y \neq 0$.

## Interactive
::widget{id="income-shift-equilibrium"}

The lilac curve is the demand $Q = 92 - 0.5p^2 + 4I$ of Example 2 and the green line is the supply $Q = 12 + e\,p$, with price $p$ up the side and quantity $Q$ along the bottom. Raise the **Income I** slider: demand shifts right and the equilibrium point climbs along the supply line, while a dashed curve keeps the demand at the starting income $I = 10$. Move the **Supply response e** slider to make supply more or less responsive to the price. The panel shows the equilibrium $(q^*, p^*)$, the slope $dp^*/dI$ from the implicit function theorem, and the change in $p^*$ you get by solving the market again at $I + 1$. Check: at $I = 10$ and $e = 4$ the panel shows $(60, 12)$, a slope of $0.25$ and a re-solved change of $0.248$, as in Example 2. Raise $e$ and both numbers fall: a more responsive supply absorbs the demand shift with quantity rather than price.

## Worked examples

### Example 1 (easy): the MRS of a utility function with a cross term
A consumer's utility from $x$ units of good X and $y$ units of good Y is $U(x, y) = xy + 2x + 3y$. Find the slope of the indifference curve through the bundle $(6, 10)$ and the marginal rate of substitution there.

1. $U(6, 10) = 60 + 12 + 30 = 102$, so the curve is $F(x, y) = xy + 2x + 3y - 102 = 0$.
   *Why:* the indifference curve is the set of bundles with the same utility as $(6, 10)$; the constant 102 drops out of the partial derivatives.
2. $U_x = y + 2 = 12$, $\quad U_y = x + 3 = 9$
   *Why:* hold $y$ fixed for $U_x$ and $x$ fixed for $U_y$. The cross term $xy$ gives $y$ to the first and $x$ to the second.
3. $\dfrac{dy}{dx} = -\dfrac{U_x}{U_y} = -\dfrac{12}{9} = -1.33$, so $MRS = 1.33$.
   *Why:* $U_y = 9 \neq 0$, so the theorem applies. Near this bundle the consumer would give up about 1.33 units of Y for one more unit of X.
4. Check: $y = \dfrac{102 - 2x}{x + 3}$ gives $\dfrac{dy}{dx} = -\dfrac{108}{(x + 3)^2} = -\dfrac{108}{81} = -1.33$ at $x = 6$.
   *Why:* this curve can be solved for $y$, so the quotient rule must give the same slope.
5. With a whole extra unit, $x = 7$ gives $y = 8.8$: she gives up 1.2 units of Y.
   *Why:* a little less than 1.33 because the indifference curve bends; the slope describes small moves.

```verify
U(x, y) = x*y + 2*x + 3*y
u0 = U(6, 10)
assert u0 == 102
Ux = 10 + 2
Uy = 6 + 3
slope = -Ux/Uy
assert abs(slope - (-4/3)) < 1e-12
assert abs(slope - (-1.33)) < 0.005
# partials by difference quotients
h = 0.000001
assert abs((U(6+h, 10) - U(6-h, 10))/(2*h) - Ux) < 0.0001
assert abs((U(6, 10+h) - U(6, 10-h))/(2*h) - Uy) < 0.0001
# the curve solved for y
y(x) = (u0 - 2*x)/(x + 3)
assert y(6) == 10
assert abs(-108/81 - slope) < 1e-12
assert abs((y(6+h) - y(6-h))/(2*h) - slope) < 0.0001
assert abs(y(7) - 8.8) < 1e-12
assert abs((10 - y(7)) - 1.2) < 1e-12
```

### Example 2 (medium): an income rise in a market with curved demand
Demand for restaurant meals is $Q_D = 92 - 0.5p^2 + 4I$ and supply is $Q_S = 12 + 4p$, where $I$ is average income in thousands. At $I = 10$ the equilibrium price is $p^* = 12$. Find $dp^*/dI$ and $dq^*/dI$, and compare with solving the market again at $I = 11$.

1. $Q_D = 92 - 0.5 \cdot 144 + 40 = 60$ and $Q_S = 12 + 48 = 60$
   *Why:* the theorem starts from a point that satisfies the equation, so check that the market really clears at $p = 12$.
2. $F(p, I) = 92 - 0.5p^2 + 4I - 12 - 4p = 0$, so $F_I = 4$ and $F_p = -p - 4 = -16$ at $p = 12$
   *Why:* the equilibrium condition demand − supply = 0 defines $p^*(I)$. $F_p$ is the demand slope $-p$ minus the supply slope 4; it is not zero.
3. $\dfrac{dp^*}{dI} = -\dfrac{F_I}{F_p} = -\dfrac{4}{-16} = 0.25$
   *Why:* one more thousand of income shifts demand out by 4 meals; the price rises until the gap closes.
4. $\dfrac{dq^*}{dI} = 4 \times 0.25 = 1$
   *Why:* the quantity moves along the supply curve, whose slope is 4. From demand: $-12 \times 0.25 + 4 = 1$ too.
5. At $I = 11$: $0.5p^2 + 4p - 124 = 0$, so $p^* = -4 + \sqrt{264} = 12.248$, a rise of $0.248$.
   *Why:* solving again needs the quadratic formula; the theorem's $0.25$ is the slope and is very close to the change over a whole unit of income.

```verify
D(p, I) = 92 - 0.5*p^2 + 4*I
S(p) = 12 + 4*p
assert D(12, 10) == 60
assert S(12) == 60
FI = 4
Fp = -12 - 4
assert Fp == -16
dp = -FI/Fp
assert dp == 0.25
dq = 4*dp
assert dq == 1
assert -12*dp + 4 == dq
# solve the market again at I = 11
p11 = -4 + sqrt(16 + 2*124)
assert abs(D(p11, 11) - S(p11)) < 1e-9
assert abs(p11 - 12.248) < 0.0005
assert abs((p11 - 12) - 0.248) < 0.0005
# the exact price as a function of I, and its slope at I = 10
pstar(I) = -4 + sqrt(16 + 2*(80 + 4*I))
assert abs(pstar(10) - 12) < 1e-12
h = 0.000001
assert abs((pstar(10+h) - pstar(10-h))/(2*h) - dp) < 0.0001
```

### Example 3 (hard): government spending in the IS–LM model
The goods market clears when $Y = C(Y - T) + I(r) + G$ and the money market when $L(Y, r) = M$, where $Y$ is income, $r$ the interest rate in percentage points, $G$ government spending and $M$ the real money supply (in billions). At the current equilibrium $C' = 0.75$, $I'(r) = -40$, $L_Y = 0.5$ and $L_r = -80$. Find $\partial Y/\partial G$ and $\partial r/\partial G$.

1. $0.25\,dY + 40\,dr = dG$ and $0.5\,dY - 80\,dr = dM$
   *Why:* total differentials: $dY = 0.75\,dY - 40\,dr + dG$ in the goods market and $0.5\,dY - 80\,dr = dM$ in the money market, with the unknowns $dY$, $dr$ collected on the left.
2. $J = \begin{bmatrix} 0.25 & 40 \\ 0.5 & -80 \end{bmatrix}$, $\det J = 0.25(-80) - 40(0.5) = -40$
   *Why:* $\det J \neq 0$, so near the equilibrium $Y$ and $r$ are differentiable functions of $G$ and $M$.
3. With $dM = 0$, divide by $dG$: the right-hand side is $(1, 0)$. $\dfrac{\partial Y}{\partial G} = \dfrac{1}{-40}\det\begin{bmatrix} 1 & 40 \\ 0 & -80 \end{bmatrix} = \dfrac{-80}{-40} = 2$
   *Why:* Cramer's rule: replace the $Y$ column by the right-hand side and divide by $\det J$.
4. $\dfrac{\partial r}{\partial G} = \dfrac{1}{-40}\det\begin{bmatrix} 0.25 & 1 \\ 0.5 & 0 \end{bmatrix} = \dfrac{-0.5}{-40} = 0.0125$
   *Why:* replace the $r$ column. A rise of 10 in $G$ raises income by about 20 and the interest rate by about 0.125 percentage points.
5. The simple multiplier is $\dfrac{1}{1 - 0.75} = 4$, twice as large.
   *Why:* higher income raises money demand; with $M$ fixed the interest rate must rise, and that cuts investment by $40 \times 0.0125 = 0.5$ per unit of $G$. This is crowding out.

```verify
J = [0.25, 40; 0.5, -80]
assert abs(det(J) + 40) < 1e-9
dYdG = det([1, 40; 0, -80])/det(J)
drdG = det([0.25, 1; 0.5, 0])/det(J)
assert abs(dYdG - 2) < 1e-9
assert abs(drdG - 0.0125) < 1e-9
assert abs(1/(1 - 0.75) - 4) < 1e-12
assert abs(40*drdG - 0.5) < 1e-9
# the same answer from the inverse of J
x = inv(J)*[1; 0]
assert abs(x[1, 1] - 2) < 1e-9
assert abs(x[2, 1] - 0.0125) < 1e-9
# a linear model with these slopes: C = 100 + 0.75(Y - 200), I = 300 - 40r, L = 0.5Y - 80r, M = 200
sol0 = inv(J)*[100 - 0.75*200 + 300 + 250; 200]
sol1 = inv(J)*[100 - 0.75*200 + 300 + 260; 200]
assert abs(sol0[1, 1] - 1200) < 1e-6
assert abs(sol0[2, 1] - 5) < 1e-9
assert abs((sol1[1, 1] - sol0[1, 1]) - 20) < 1e-6
assert abs((sol1[2, 1] - sol0[2, 1]) - 0.125) < 1e-9
```

## Common mistakes
- Dropping the minus sign in $-F_x/F_y$, so an indifference curve seems to slope upwards or a demand rise seems to lower the price (SIGN).
- Turning the ratio upside down and giving $-F_y/F_x$ (INVERTED_RATIO).
- Leaving the cross term $xy$ out of the partial derivatives (DROPPED_CROSS_TERM).
- Dividing the demand shift by the demand slope alone, as if the quantity could not change (IGNORED_SUPPLY).
- Dividing by the supply slope alone and forgetting that buyers react to the price too (SUPPLY_SLOPE_ONLY).
- Differentiating $b\,p^2$ as $b\,p$ instead of $2b\,p$ (POWER_RULE).
- Putting a rise in $G$ into the money-market row, or a rise in $M$ into the goods-market row (WRONG_EQUATION).
- Stopping at the determinant with the replaced column and not dividing by $\det J$ (NOT_DIVIDED).
- Using the simple multiplier $1/(1 - C')$ in a model where the interest rate also moves (SIMPLE_MULTIPLIER).
- Using the formula where $F_y = 0$, such as the leftmost point of a circle: there the curve has a vertical tangent and is not a function $y(x)$ nearby.
- Putting in a point that does not satisfy the equation: check that the market clears, or that the bundle is on the curve, before using the partial derivatives.

## Practice
- `level-curve-slope-ift` (difficulty 1): $dy/dx = -F_x/F_y$ on an indifference curve of $U = xy + ax + cy$ or on a curve of equal total cost with a cross term; distractors SIGN, INVERTED_RATIO, DROPPED_CROSS_TERM.
- `equilibrium-price-income-response` (difficulty 2): $dp^*/dI$ for a market with linear or curved demand and a linear supply, at its equilibrium; distractors SIGN, IGNORED_SUPPLY, SUPPLY_SLOPE_ONLY, POWER_RULE.
- `islm-comparative-statics-cramer` (difficulty 3): $\partial Y/\partial G$ or $\partial Y/\partial M$ in an IS–LM model from the Jacobian and Cramer's rule; distractors SIGN, WRONG_EQUATION, NOT_DIVIDED, SIMPLE_MULTIPLIER.

## Real world
- Forecasting prices: analysts combine estimated demand and supply slopes with forecasts of income growth to predict how prices of housing, food or energy will move, using exactly $dp^*/dI = -F_I/F_p$ around today's market.
- Tax incidence: the share of a tax that buyers pay, $S'/(S' - D')$, comes from the same formula. Governments use it to judge who bears fuel duties or VAT changes.
- Macroeconomic policy: central banks and finance ministries study their models around the current state of the economy through a Jacobian, just as in Example 3. The gap between the simple multiplier and the IS–LM multiplier shows how much crowding out matters for a fiscal stimulus.
- Consumer and producer choice: at a best choice the MRS $U_x/U_y$ equals the price ratio and the MRTS $MP_L/MP_K$ equals the ratio of input prices. How the choice then moves when prices or income change is comparative statics of an optimum, which OP04 develops with this theorem.

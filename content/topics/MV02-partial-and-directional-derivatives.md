---
id: MV02
title: Partial and directional derivatives
block: MV
coreYear: 2
prerequisites: [MV01, C103]
estMinutes: 50
status: draft
economicUses:
  - Marginal products of labour and capital from a production function
  - Marginal utilities of two goods and the marginal rate of substitution
  - "Cross-price effects: are two goods substitutes or complements?"
  - The marginal cost of each product in a firm that makes several products
generators: [cobb-douglas-marginal-product, joint-cost-partial-marginal-cost, directional-derivative-utility]
widgets: [gradient-level-curves]
mistakeCodes:
  WRONG_VARIABLE:
    label: Differentiated with respect to the wrong variable
    explanation: ∂Q/∂L moves labour and holds capital fixed; ∂Q/∂K does the opposite. Check which variable is in the bottom of the fraction before you start.
  POWER_NOT_REDUCED:
    label: Forgot to lower the power by one
    explanation: The power rule brings the exponent down and then lowers it by one, so L^β becomes β·L^(β−1). Bringing β down but keeping L^β gives β·Q, which is far too large.
  AVERAGE_PRODUCT:
    label: Gave the average product
    explanation: Without the exponent in front you get A·K^α·L^(β−1) = Q/L, the output per worker (or Q/K, the output per machine). The marginal product is the exponent times that, for example β·Q/L, so it is smaller whenever the exponent is below 1.
  DROPPED_COEFFICIENT:
    label: Dropped the constant A
    explanation: The productivity factor A multiplies the whole function, so it stays in every partial derivative. Only the power of the variable you differentiate changes.
  CROSS_TERM_DROPPED:
    label: Dropped the cross term
    explanation: A term such as 2xy contains x, so it does not vanish when you differentiate with respect to x. Treat y as a number; the derivative of 2xy with respect to x is 2y.
  OTHER_VARIABLE_MOVED:
    label: Let the other variable change too
    explanation: In a partial derivative the other variable is held fixed, so xy differentiates to y, not y + x. The product rule is not needed, because y is a constant here.
  KEPT_OTHER_TERMS:
    label: Kept the terms without the variable
    explanation: Terms that contain only the other variable, such as y² or 4y in ∂C/∂x, are constants while y is held fixed. Their partial derivative is 0, just like a fixed cost.
  NOT_UNIT_VECTOR:
    label: Used a direction that is not a unit vector
    explanation: The directional derivative is ∇f·u with u of length 1. Divide the direction vector by its length first; otherwise the answer is multiplied by that length.
  GRADIENT_LENGTH:
    label: Gave the length of the gradient
    explanation: The length of the gradient, ‖∇f‖, is the rate of change only in the direction of the gradient itself. In any other direction take the dot product ∇f·u, which is smaller.
  COMPONENTS_SWAPPED:
    label: Paired the components the wrong way
    explanation: The dot product pairs like with like, f_x·u₁ + f_y·u₂. Multiplying f_x by the y-component of u mixes up the two directions.
resources:
  - { title: "Calculus Volume 3, 4.3 Partial Derivatives (OpenStax)", url: "https://openstax.org/books/calculus-volume-3/pages/4-3-partial-derivatives", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Calculus Volume 3, 4.6 Directional Derivatives and the Gradient (OpenStax)", url: "https://openstax.org/books/calculus-volume-3/pages/4-6-directional-derivatives-and-the-gradient", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Multivariable Calculus, Session 35: Gradient: Definition, Perpendicular to Level Curves (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-02sc-multivariable-calculus-fall-2010/pages/2.-partial-derivatives/part-b-chain-rule-gradient-and-directional-derivatives/session-35-gradient-definition-perpendicular-to-level-curves/", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
A factory's output depends on both its machines and its workers. The manager asks: "If we hire one more worker and keep the same machines, how much more do we produce?" That number is the marginal product of labour, and it decides whether the extra worker is worth the wage. A shop asks a similar question about prices: "If our rival raises its price and ours stays the same, how many more customers do we get?" Economists phrase such questions as "other things being equal" (*ceteris paribus*). The mathematics of "change one variable, hold the others fixed" is the partial derivative. Almost every marginal quantity in microeconomics, such as marginal products, marginal utilities and cross-price effects, is a partial derivative.

## Intuition
Think of a production function $Q(K, L)$ as a hill: the ground position is the pair of inputs and the height is output. The contour map of MV01 draws this hill from above, with one level curve (an isoquant) for each output level.

- Walk due east: $K$ grows and $L$ stays the same. The slope of the hill in that direction is the partial derivative $\partial Q/\partial K$.
- Walk due north: only $L$ changes, and the slope is $\partial Q/\partial L$.

To compute a partial derivative you therefore freeze every variable except one. The frozen variables behave like ordinary numbers, and the rules of C103 do the rest.

You can also walk in any other direction, for example north-east, adding some capital and some labour. The slope in that direction is a **directional derivative**. Of all directions, one is steepest. The arrow pointing that way is the **gradient**. Its length is the steepest slope, and it always crosses the level curves at a right angle: along a level curve the height does not change at all, so the steepest way up must point straight across it.

## Definition and formulas
**Partial derivatives.** For a function $f(x, y)$:
$$f_x = \frac{\partial f}{\partial x} = \lim_{h \to 0} \frac{f(x + h, y) - f(x, y)}{h}, \qquad f_y = \frac{\partial f}{\partial y} = \lim_{h \to 0} \frac{f(x, y + h) - f(x, y)}{h}.$$
In practice: to find $f_x$, treat $y$ as a constant and differentiate with respect to $x$ as usual. For example, if $f(x, y) = x^2y + 3y$, then $f_x = 2xy$ and $f_y = x^2 + 3$. The symbol $\partial$ ("partial") replaces $d$ to remind you that the other variables are held fixed.

**Marginal products of a Cobb–Douglas function.** For $Q = A K^{\alpha} L^{\beta}$:
$$MP_K = \frac{\partial Q}{\partial K} = \alpha A K^{\alpha - 1} L^{\beta} = \alpha\,\frac{Q}{K}, \qquad MP_L = \frac{\partial Q}{\partial L} = \beta A K^{\alpha} L^{\beta - 1} = \beta\,\frac{Q}{L}.$$
So the marginal product of labour is $\beta$ times the average product $Q/L$.

**Partial elasticity.** The percentage change in $Q$ for a 1 % change in one input, the other held fixed:
$$\varepsilon_{Q,L} = \frac{\partial Q}{\partial L}\cdot\frac{L}{Q}.$$
For Cobb–Douglas, $\varepsilon_{Q,L} = \beta\,\dfrac{Q}{L}\cdot\dfrac{L}{Q} = \beta$ and $\varepsilon_{Q,K} = \alpha$: the exponents are the partial elasticities.

**Marginal utilities.** For utility $U(x, y)$, $MU_x = U_x$ and $MU_y = U_y$. The marginal rate of substitution is $MRS = MU_x / MU_y$, and the slope of an indifference curve is $-MRS$ (C110 shows why).

**Cross-price effects.** If the demand for good 1 is $Q_1(P_1, P_2)$, then $\partial Q_1/\partial P_1$ is the own-price effect (normally negative) and $\partial Q_1/\partial P_2$ is the cross-price effect:

- $\partial Q_1/\partial P_2 > 0$: the goods are **substitutes** (tea and coffee: dearer coffee sends buyers to tea);
- $\partial Q_1/\partial P_2 < 0$: the goods are **complements** (cars and petrol: dearer petrol means fewer cars bought).

**Second-order partial derivatives.** Differentiate a partial derivative again:
$$f_{xx} = \frac{\partial^2 f}{\partial x^2}, \quad f_{yy} = \frac{\partial^2 f}{\partial y^2}, \quad f_{xy} = \frac{\partial}{\partial y}\left(\frac{\partial f}{\partial x}\right), \quad f_{yx} = \frac{\partial}{\partial x}\left(\frac{\partial f}{\partial y}\right).$$
**Young's theorem:** if the second partial derivatives are continuous (true for the smooth functions used in economics), then $f_{xy} = f_{yx}$; the order does not matter. For Cobb–Douglas, $Q_{LL} = \beta(\beta - 1)\,Q/L^2 < 0$ when $\beta < 1$ (diminishing marginal product), and $Q_{KL} = Q_{LK} = \alpha\beta\,Q/(KL) > 0$: more machines make each extra worker more productive.

**The gradient** collects the first partial derivatives in a vector:
$$\nabla f(x, y) = \big(f_x(x, y),\; f_y(x, y)\big).$$
It points in the direction in which $f$ increases fastest, its length $\lVert \nabla f \rVert$ is that fastest rate, and it is perpendicular to the level curve through the point.

**The directional derivative** in the direction of a unit vector $u = (u_1, u_2)$, with $u_1^2 + u_2^2 = 1$, is the rate of change of $f$ per unit of distance moved in that direction:
$$D_u f = \nabla f \cdot u = f_x u_1 + f_y u_2 = \lVert \nabla f \rVert \cos\theta,$$
where $\theta$ is the angle between $u$ and $\nabla f$. It is largest, $\lVert \nabla f \rVert$, when $u$ points along the gradient ($\theta = 0$), zero along the level curve ($\theta = 90^\circ$) and most negative in the opposite direction. If a direction is given as a vector $v$ that is not of length 1, use $u = v / \lVert v \rVert$ (dot products and lengths are from LA101). With $u = (1, 0)$ or $(0, 1)$ you get back $f_x$ or $f_y$.

What happens when both variables change by given amounts, and how to add up the two effects, is the total differential of MV03.

## Interactive
::widget{id="gradient-level-curves"}

The graph is the indifference map of $U = x \cdot y$ from Example 3. The solid curve is the indifference curve through your bundle. Move the **Good x** and **Good y** sliders to move the bundle; the gold arrow, the gradient, always meets the solid curve at a right angle (the small square). Then turn the **Direction of u** slider to point the green arrow $u$. The panel shows the gradient $(U_x, U_y)$, its length $\lVert \nabla U \rVert$ and the rate along $u$, $D_u U = \nabla U \cdot u$. At the start, bundle $(4, 6)$, the panel shows the gradient $(6, 4)$ and length 7.21. With the direction at 0° the rate along $u$ is 6, which is $U_x$; at 90° it is 4, which is $U_y$. At 34°, almost the gradient's direction, it reaches 7.21, the largest value. At 124° the arrow runs along the indifference curve and the rate is almost 0 (−0.04).

## Worked examples

### Example 1 (easy): marginal products of a Cobb–Douglas firm
A firm's output is $Q = 4K^{0.25}L^{0.75}$, where $K$ is the number of machines and $L$ the number of workers. It uses $K = 16$ and $L = 81$. Find the marginal products of labour and capital, and the partial elasticity of output with respect to labour.

1. $Q = 4 \cdot 16^{0.25} \cdot 81^{0.75} = 4 \cdot 2 \cdot 27 = 216$
   *Why:* $16^{0.25} = \sqrt[4]{16} = 2$ and $81^{0.75} = (\sqrt[4]{81})^3 = 3^3 = 27$; output is needed for the shortcut $\beta Q/L$.
2. $MP_L = \dfrac{\partial Q}{\partial L} = 0.75 \cdot 4K^{0.25}L^{-0.25} = 0.75 \cdot \dfrac{Q}{L} = 0.75 \cdot \dfrac{216}{81} = 2$
   *Why:* hold $K$ fixed, so $4K^{0.25}$ is a constant factor; the power rule brings $0.75$ down and lowers the power of $L$ by one.
3. $MP_K = \dfrac{\partial Q}{\partial K} = 0.25 \cdot 4K^{-0.75}L^{0.75} = 0.25 \cdot \dfrac{216}{16} = 3.375$
   *Why:* now $L$ is held fixed and $K$ varies.
4. $\varepsilon_{Q,L} = MP_L \cdot \dfrac{L}{Q} = 2 \cdot \dfrac{81}{216} = 0.75$
   *Why:* the partial elasticity of a Cobb–Douglas function is the exponent: a 1 % rise in workers raises output by about 0.75 %.
5. $Q(16, 82) - Q(16, 81) \approx 1.997$
   *Why:* one more worker with the same machines adds almost exactly $MP_L = 2$ units; the tiny gap comes from diminishing marginal product.

```verify
A = 4; a = 0.25; b = 0.75; K = 16; L = 81
Q = A*K^a*L^b
MPL = b*A*K^a*L^(b-1)
MPK = a*A*K^(a-1)*L^b
assert abs(Q - 216) < 1e-9
assert abs(MPL - 2) < 1e-9
assert abs(MPL - b*Q/L) < 1e-9
assert abs(MPK - 3.375) < 1e-9
assert abs(MPL*L/Q - 0.75) < 1e-9
gap = A*K^a*82^b - Q
assert abs(gap - 1.997) < 0.0005
```

### Example 2 (medium): marginal costs of a two-product bakery
A bakery makes $x$ trays of bread and $y$ trays of cakes a day, at a total cost of $C(x, y) = 500 + 3x^2 + 2xy + y^2 + 10x + 4y$. Find the marginal cost of each product at $x = 10$, $y = 5$, and check Young's theorem.

1. $C_x = 6x + 2y + 10$
   *Why:* hold $y$ fixed. The terms $500$, $y^2$ and $4y$ are constants and vanish; in $2xy$ the factor $2y$ is a constant, so the term differentiates to $2y$.
2. $C_x(10, 5) = 60 + 10 + 10 = 80$
   *Why:* one more tray of bread, with cakes unchanged, adds about 80 to cost. Directly, $C(11, 5) - C(10, 5) = 83$.
3. $C_y = 2x + 2y + 4$, so $C_y(10, 5) = 20 + 10 + 4 = 34$
   *Why:* the same idea with $x$ held fixed; one more tray of cakes adds about 34.
4. $C_{xy} = \dfrac{\partial}{\partial y}(6x + 2y + 10) = 2$ and $C_{yx} = \dfrac{\partial}{\partial x}(2x + 2y + 4) = 2$
   *Why:* Young's theorem says the two mixed partials agree; here both equal the coefficient of $xy$.
5. $C_x(10, 6) = 82 = 80 + 2$
   *Why:* $C_{xy} = 2 > 0$ means each extra tray of cakes raises the marginal cost of bread by 2, for example because the two products share one oven.

```verify
C(x, y) = 500 + 3*x^2 + 2*x*y + y^2 + 10*x + 4*y
Cx(x, y) = 6*x + 2*y + 10
Cy(x, y) = 2*x + 2*y + 4
assert Cx(10, 5) == 80
assert Cy(10, 5) == 34
assert C(11, 5) - C(10, 5) == 83
assert Cx(10, 6) - Cx(10, 5) == 2
assert Cy(11, 5) - Cy(10, 5) == 2
# the formulas agree with small nudges of one variable
h = 0.000001
assert abs((C(10 + h, 5) - C(10 - h, 5))/(2*h) - 80) < 0.0001
assert abs((C(10, 5 + h) - C(10, 5 - h))/(2*h) - 34) < 0.0001
```

### Example 3 (hard): gradient and directional derivative of utility
A consumer's utility is $U(x, y) = xy$ and she has the bundle $(4, 6)$. Find the gradient and its length, the rate at which utility changes if she moves in the direction of the vector $(3, 4)$, and show that the gradient is perpendicular to her indifference curve.

1. $U_x = y = 6,\quad U_y = x = 4,\quad \nabla U(4, 6) = (6, 4)$
   *Why:* each marginal utility holds the other good fixed. The marginal rate of substitution is $MRS = U_x/U_y = 6/4 = 1.5$.
2. $\lVert \nabla U \rVert = \sqrt{6^2 + 4^2} = \sqrt{52} \approx 7.21$
   *Why:* this is the fastest possible rate of increase of utility per unit of distance, reached by moving along the gradient.
3. $\lVert (3, 4) \rVert = 5$, so $u = (0.6,\ 0.8)$ and $D_u U = 6 \cdot 0.6 + 4 \cdot 0.8 = 3.6 + 3.2 = 6.8$
   *Why:* divide by the length to get a unit vector, then take the dot product with the gradient. The rate 6.8 is below the maximum 7.21 because $(3, 4)$ does not point exactly along $(6, 4)$.
4. Indifference curve $xy = 24$: $y = 24/x$, slope $-24/x^2 = -1.5$ at $x = 4$, so the direction $(2, -3)$ runs along it.
   *Why:* the slope of the indifference curve is $-MRS$; moving 2 to the right and 3 down follows the curve.
5. $\nabla U \cdot (2, -3) = 6 \cdot 2 + 4 \cdot (-3) = 0$
   *Why:* a zero dot product means a right angle (LA101). Along the indifference curve utility does not change, so the steepest way up points straight across it.

```verify
x0 = 4; y0 = 6
Ux = y0; Uy = x0
g = [Ux, Uy]
glen = sqrt(Ux^2 + Uy^2)
assert abs(glen - 7.2111) < 0.0001
assert Ux/Uy == 1.5
v = [3, 4]
n = sqrt(3^2 + 4^2)
assert n == 5
Du = (Ux*3 + Uy*4)/n
assert abs(Du - 6.8) < 1e-12
assert Du < glen
assert abs(-24/x0^2 - (-1.5)) < 1e-12
assert Ux*2 + Uy*(-3) == 0
# check against a small step along u
h = 0.000001
step = ((x0 + h*0.6)*(y0 + h*0.8) - (x0 - h*0.6)*(y0 - h*0.8))/(2*h)
assert abs(step - 6.8) < 0.0001
```

## Common mistakes
- Differentiating with respect to the wrong variable, for example giving $\partial Q/\partial K$ when $\partial Q/\partial L$ was asked (WRONG_VARIABLE).
- Bringing the exponent down but not lowering the power, so $L^{0.75}$ becomes $0.75L^{0.75}$ (POWER_NOT_REDUCED).
- Lowering the power but forgetting to bring the exponent down, which gives the average product $Q/L$ instead of the marginal product $\beta Q/L$ (AVERAGE_PRODUCT).
- Losing the constant $A$ in front of a Cobb–Douglas function (DROPPED_COEFFICIENT).
- Treating a cross term such as $2xy$ as a constant when differentiating with respect to $x$ (CROSS_TERM_DROPPED).
- Using the product rule on $xy$ as if $y$ also changed, getting $y + x$ instead of $y$ (OTHER_VARIABLE_MOVED).
- Keeping terms with only the other variable, such as $y^2$, in the partial derivative (KEPT_OTHER_TERMS).
- Forgetting to turn the direction into a unit vector before the dot product (NOT_UNIT_VECTOR).
- Giving the length of the gradient as the rate in every direction (GRADIENT_LENGTH).
- Pairing $f_x$ with the second component of $u$ and $f_y$ with the first (COMPONENTS_SWAPPED).
- Reading the sign of a cross-price effect backwards: a positive $\partial Q_1/\partial P_2$ means substitutes, a negative one complements.

## Practice
- `cobb-douglas-marginal-product` (difficulty 1): the marginal product $\partial Q/\partial L$ or $\partial Q/\partial K$ of $Q = AK^{\alpha}L^{\beta}$ at given inputs; distractors WRONG_VARIABLE, POWER_NOT_REDUCED, AVERAGE_PRODUCT, DROPPED_COEFFICIENT.
- `joint-cost-partial-marginal-cost` (difficulty 2): the marginal cost $\partial C/\partial x$ or $\partial C/\partial y$ of a two-product cost function $C(x, y)$ with a cross term; distractors WRONG_VARIABLE, CROSS_TERM_DROPPED, OTHER_VARIABLE_MOVED, KEPT_OTHER_TERMS.
- `directional-derivative-utility` (difficulty 3): the directional derivative of $U = x^a y^b$ at a bundle in the direction of a given vector; distractors NOT_UNIT_VECTOR, GRADIENT_LENGTH, COMPONENTS_SWAPPED.

## Real world
- Wages and hiring: a firm that sells its output at price $P$ keeps hiring while $P \times MP_L$ is above the wage. With a Cobb–Douglas technology the exponent $\beta$ is also the share of revenue paid to workers in a competitive market, which is why macroeconomic models often set capital's exponent to about one third, matching national accounts.
- Competition policy: when two firms want to merge, competition authorities estimate demand systems and look at the cross-price effects $\partial Q_1/\partial P_2$. Large positive values mean the products are close substitutes, and the merger may let the combined firm raise prices.
- Multi-product firms: banks, airlines and bakeries produce several products with shared inputs. The mixed partial $C_{xy}$ of the cost function shows whether producing more of one product makes another cheaper ($C_{xy} < 0$, economies of scope) or dearer.
- Estimating models: computers fit economic models by repeatedly stepping in the direction of the gradient of a fit criterion, uphill for a likelihood or downhill for a sum of squared errors (NM02).

---
id: MV06
title: Convexity, concavity and quasiconcavity
block: MV
coreYear: 2
prerequisites: [MV02, C108]
estMinutes: 50
status: draft
economicUses:
  - "Well-behaved preferences: averages are preferred to extremes"
  - Convex production sets and decreasing returns to scale
  - Knowing that a first-order condition gives the one global optimum
  - Diminishing marginal rate of substitution along indifference curves and isoquants
searchTerms:
  - "Concave function"
  - "Convex function"
  - "Quasiconcave function"
generators: [quadratic-concavity-determinant, mixed-bundle-utility, cobb-douglas-hessian-determinant]
widgets: [cobb-douglas-curvature]
mistakeCodes:
  FORGOT_FACTOR_TWO:
    label: Forgot the factor 2 from a squared term
    explanation: Differentiating ax² twice gives 2a, so f_xx = 2a, not a. Differentiate each term step by step instead of copying the coefficient.
  HESSIAN_ADDED:
    label: Added the cross partial squared
    explanation: The Hessian determinant is f_xx·f_yy − f_xy², the diagonal product minus the square of the cross partial. Adding the square makes every function look more concave or convex than it is.
  CROSS_DOUBLED:
    label: Doubled the cross partial
    explanation: The term b·xy differentiated once by x and once by y gives b. The factor 2 belongs only to squared terms such as x².
  IGNORED_CROSS_TERM:
    label: Left out the cross partial
    explanation: The determinant needs all three second partials. Q_KL is not zero in a Cobb–Douglas function, because each input raises the marginal product of the other; subtract its square.
  POWER_NOT_LOWERED:
    label: Squared the exponent
    explanation: Differentiating K^a twice gives a(a − 1)K^(a−2), not a²K^(a−2). Lower the power by one after the first differentiation, before you bring it down again.
  AVERAGED_UTILITIES:
    label: Averaged the utilities, not the bundles
    explanation: A mixed bundle mixes the quantities of each good. Work out the mixed bundle first and then its utility; averaging U(A) and U(B) just gives the level of the indifference curve back.
  IGNORED_WEIGHTS:
    label: Used half and half instead of the given weights
    explanation: C = tA + (1 − t)B puts weight t on A and 1 − t on B. With t = 1/4, take a quarter of A and three quarters of B, not the plain average.
  SUMMED_BUNDLES:
    label: Added the bundles without the weights
    explanation: A + B is a bigger basket than either bundle, not a mix of them. Multiply each bundle by its weight; the weights add up to 1.
  AXES_ONLY:
    label: Checked only f_xx and f_yy
    explanation: Negative f_xx and f_yy only say the graph bends down along the two axes. The function can still bend up along a diagonal; check f_xx·f_yy − f_xy² ≥ 0 as well.
  ONE_POINT_ONLY:
    label: Checked the Hessian at one point only
    explanation: Concavity is a property of the whole function. The conditions must hold at every point of the domain, not only at the point where you evaluated them.
  QUASI_IS_CONCAVE:
    label: Treated quasiconcave as concave
    explanation: Bowed indifference curves or isoquants show only that a function is quasiconcave. Concavity is stronger. Q = K^a·L^b is always quasiconcave, but concave only when a + b ≤ 1.
resources:
  - { title: "Principles of Economics 3e, Appendix B Indifference Curves (OpenStax)", url: "https://openstax.org/books/principles-economics-3e/pages/b-indifference-curves", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "MIT 14.01SC Principles of Microeconomics, Preferences and Utility (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/14-01sc-principles-of-microeconomics-fall-2011/pages/unit-2-consumer-theory/preferences-and-utility/", kind: course, verifiedAt: 2026-10-18 }
  - { title: "MIT 18.02SC Multivariable Calculus, Session 30: Second Derivative Test (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-02sc-multivariable-calculus-fall-2010/pages/2.-partial-derivatives/part-a-functions-of-two-variables-tangent-approximation-and-optimization/session-30-second-derivative-test/", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
Most economic models end with "and the agent chooses the best option". A household picks the best affordable bundle, a firm picks the most profitable mix of inputs. Two worries come with that sentence: is the point where the first-order conditions hold really the best one, and is it the only one? Shape answers both. If the objective bends the right way (concave) or at least has the right kind of contour lines (quasiconcave), and the set of options has no dents (convex), then a point found from the first-order conditions really is the best choice, and there is no other. This is why economists assume that consumers like variety, that indifference curves bow towards the origin and that technologies have non-increasing returns, and why they worry when these assumptions fail.

## Intuition
**Convex sets.** A set is convex if you can walk in a straight line between any two of its points without leaving it. A budget set is convex: if two baskets are affordable, so is any mix of them, because the cost of a mix is the same mix of the costs. A set with a dent or a hole is not convex.

**Concave functions.** In one variable (C108) a concave graph bends downwards, so every chord lies below it. With two inputs, think of the graph as a landscape. The function is concave if the landscape is a dome: stretch a rope between any two points of the surface and the rope stays on or under the ground. Equivalently, the value at a mix of two points is at least the same mix of the two values. A convex function is a bowl, with every chord above the surface.

**Quasiconcave functions.** Many hills are not domes. A bell-shaped hill has steep sides that curve outwards near the bottom, so ropes there pass above the ground, yet seen from above its contour lines are closed rings around the summit. A function is quasiconcave if every region "at or above height $c$" is a convex set. For utility, that region is everything on or above an indifference curve, and convexity means the curve bows towards the origin: a mix of two equally good bundles is at least as good as either. Concave functions are always quasiconcave; the reverse is not true. Utility $U = xy$ has bowed indifference curves, but along the diagonal it grows like $t^2$, which bends upwards.

## Definition and formulas
**Convex set.** A set $S$ is convex if for any points $P, Q$ in $S$ and any $0 \le t \le 1$ the mix $tP + (1 - t)Q$ is also in $S$. Examples: the budget set $\{(x, y) : p_x x + p_y y \le m,\ x, y \ge 0\}$; the region on or above the hyperbola $xy = 16$ in the positive quadrant. Not convex: the bundles with $x \ge 4$ or $y \ge 4$, since $(4, 0)$ and $(0, 4)$ are in it but their midpoint $(2, 2)$ is not.

**Concave and convex functions.** Let $f$ be defined on a convex set $S$. Then $f$ is **concave** if, for all $P, Q$ in $S$ and $0 \le t \le 1$,
$$f\big(tP + (1 - t)Q\big) \ge t f(P) + (1 - t) f(Q),$$
and **convex** if the inequality is reversed. It is strictly concave if the inequality is strict whenever $P \ne Q$ and $0 < t < 1$. A function is concave exactly when the region on and below its graph is a convex set.

**The Hessian test.** The **Hessian** collects the second partial derivatives (MV02):
$$H = \begin{bmatrix} f_{xx} & f_{xy} \\ f_{xy} & f_{yy} \end{bmatrix}, \qquad D = \det H = f_{xx}f_{yy} - f_{xy}^2.$$
If $f$ has continuous second partials on an open convex set, then

- $f$ is concave $\iff$ at **every** point $f_{xx} \le 0$, $f_{yy} \le 0$ and $D \ge 0$ (the Hessian is negative semidefinite);
- $f$ is convex $\iff$ at every point $f_{xx} \ge 0$, $f_{yy} \ge 0$ and $D \ge 0$;
- $f_{xx} < 0$ and $D > 0$ at every point is enough for $f$ to be strictly concave.

All three conditions matter. For $f = -x^2 - y^2 + 3xy$, $f_{xx} = f_{yy} = -2$, yet $D = 4 - 9 = -5 < 0$: along the diagonal $y = x$ the function equals $x^2$, which bends upwards. For a quadratic the second partials are constants, so one check covers every point.

**Why concavity guarantees a global maximum.** A concave function lies on or below each of its tangent planes:
$$f(x, y) \le f(x_0, y_0) + f_x(x_0, y_0)(x - x_0) + f_y(x_0, y_0)(y - y_0).$$
At a critical point both partial derivatives are zero, so $f(x, y) \le f(x_0, y_0)$ everywhere: the critical point is the global maximum. If $f$ is strictly concave there is at most one maximum. For a convex function a critical point is the global minimum.

**Quasiconcavity.** $f$ is **quasiconcave** if every upper level set $\{(x, y) : f(x, y) \ge c\}$ is convex, or equivalently
$$f\big(tP + (1 - t)Q\big) \ge \min\{f(P), f(Q)\}.$$
Every concave function is quasiconcave. An increasing transformation (squaring a positive function, taking logs) keeps the level curves, so it keeps quasiconcavity, but it can destroy concavity: $\sqrt{xy}$ is concave, while $xy$ and $x^2y^2$, with the same indifference curves, are not.

**Cobb–Douglas.** For $f = Ax^ay^b$ with $A, a, b > 0$ and $x, y > 0$:
$$f_{xx}f_{yy} - f_{xy}^2 = A^2ab\,(1 - a - b)\,x^{2a-2}y^{2b-2}.$$
So $f$ is concave if and only if $a + b \le 1$ (non-increasing returns to scale). It is always quasiconcave: $\ln f = \ln A + a\ln x + b\ln y$ is a sum of concave functions, so its upper level sets, which are the same as those of $f$, are convex.

**Bordered Hessian (two variables).** When $f_x > 0$ and $f_y > 0$, the shape of the level curves is decided by
$$\bar H = \begin{vmatrix} 0 & f_x & f_y \\ f_x & f_{xx} & f_{xy} \\ f_y & f_{xy} & f_{yy} \end{vmatrix} = 2f_xf_yf_{xy} - f_y^2f_{xx} - f_x^2f_{yy}.$$
If $\bar H > 0$ at every point, the level curves bow towards the origin and $f$ is quasiconcave. The reason: along a level curve $y(x)$ the slope is $-f_x/f_y$, and differentiating again gives $y'' = \bar H / f_y^3$, which is positive.

**Diminishing marginal rate of substitution.** The marginal rate of substitution $MRS = f_x/f_y$ is minus the slope of the level curve. A curve that bows towards the origin gets flatter as $x$ grows, so the MRS falls: the more food you have, the less clothing you give up for one more unit of food. For production functions the same idea applies to isoquants and the marginal rate of technical substitution.

**Why economists care.** Maximising a strictly quasiconcave utility over a convex budget set gives one best bundle, and the tangency conditions of the Lagrange method (MV08) find it. With inequality constraints, concavity is what makes the Kuhn–Tucker conditions (OP01) sufficient.

## Interactive
::widget{id="cobb-douglas-curvature"}

The widget shows the production function $Q = 10K^aL^b$. Move the **Capital exponent a** and **Labour exponent b** sliders. The top graph shows three isoquants and two input mixes on the middle one, joined by a gold segment; the bottom graph shows output along the diagonal $K = L$ with a gold chord. The panel shows $a + b$, whether $Q$ is concave, and the Hessian determinant $D$ at $K = L = 1$. Check: at $a = 0.3$, $b = 0.5$ (Example 2) the panel shows $a + b = 0.8$, concave "yes" and $D = 3$, and the solid point on the curve lies above the hollow middle of the chord. Now raise $b$ to $0.8$: the panel shows $a + b = 1.1$, "no" and $D = -2.4$, and the solid point drops below the chord. The isoquants still bow towards the origin for every setting: $Q$ is always quasiconcave.

## Worked examples

### Example 1 (easy): a concave production function
A farm's wheat output (in tonnes) from $x$ tonnes of fertiliser and $y$ thousand litres of irrigation water is $Q = 20x + 30y - x^2 - xy - 2y^2$. Use the Hessian to show that $Q$ is concave, then check the chord condition for the input mixes $A = (2, 2)$ and $B = (6, 4)$.

1. $Q_x = 20 - 2x - y$ and $Q_y = 30 - x - 4y$
   *Why:* differentiate with respect to one input while holding the other fixed (MV02).
2. $Q_{xx} = -2$, $Q_{yy} = -4$, $Q_{xy} = -1$
   *Why:* differentiate again; the squared terms give a factor 2, and the cross term $-xy$ gives $-1$.
3. $D = (-2)(-4) - (-1)^2 = 8 - 1 = 7 \ge 0$
   *Why:* both own second partials are negative and $D \ge 0$. The second partials are constants, so this holds at every point and $Q$ is concave: each input has diminishing returns, and the interaction is too weak to undo that.
4. $Q(A) = 84$, $Q(B) = 148$; the midpoint $M = (4, 3)$ gives $Q(M) = 124 \ge \dfrac{84 + 148}{2} = 116$
   *Why:* the chord definition with $t = \tfrac12$: the half-and-half input mix produces more than the average of the two outputs, here by 8 tonnes.

```verify
Q(x, y) = 20*x + 30*y - x^2 - x*y - 2*y^2
# second partials by finite differences (exact for a quadratic)
Qxx = Q(3, 3) - 2*Q(2, 3) + Q(1, 3)
Qyy = Q(2, 4) - 2*Q(2, 3) + Q(2, 2)
Qxy = (Q(3, 4) - Q(3, 2) - Q(1, 4) + Q(1, 2))/4
assert Qxx == -2
assert Qyy == -4
assert Qxy == -1
D = Qxx*Qyy - Qxy^2
assert D == 7
assert Q(2, 2) == 84
assert Q(6, 4) == 148
assert Q(4, 3) == 124
assert (Q(2, 2) + Q(6, 4))/2 == 116
assert Q(4, 3) - 116 == 8
# the first partials of step 1, checked by central differences at A
assert abs((Q(2.001, 2) - Q(1.999, 2))/0.002 - (20 - 2*2 - 2)) < 0.000001
assert abs((Q(2, 2.001) - Q(2, 1.999))/0.002 - (30 - 2 - 4*2)) < 0.000001
```

### Example 2 (medium): when is a Cobb–Douglas technology concave?
A firm produces $Q = 10K^{0.3}L^{0.5}$. Show that $Q$ is concave, find $D$ at $K = L = 1$, and say what changes if the labour exponent rises to $0.8$.

1. $Q_{KK} = 10 \cdot 0.3 \cdot (-0.7)K^{-1.7}L^{0.5} = -2.1K^{-1.7}L^{0.5}$ and $Q_{LL} = 10 \cdot 0.5 \cdot (-0.5)K^{0.3}L^{-1.5} = -2.5K^{0.3}L^{-1.5}$
   *Why:* differentiating $K^{0.3}$ twice gives $0.3 \cdot (0.3 - 1)K^{0.3 - 2}$; both are negative for all $K, L > 0$, so each input has diminishing marginal product.
2. $Q_{KL} = 10 \cdot 0.3 \cdot 0.5\,K^{-0.7}L^{-0.5} = 1.5K^{-0.7}L^{-0.5}$
   *Why:* differentiate once by $K$ and once by $L$; it is positive because more capital makes labour more productive.
3. $D = (5.25 - 2.25)K^{-1.4}L^{-1} = 3K^{-1.4}L^{-1} > 0$, so at $K = L = 1$, $D = 3$
   *Why:* both products have the same powers, $K^{-1.7 + 0.3} = K^{-1.4}$ and $L^{0.5 - 1.5} = L^{-1}$, so only the numbers $(-2.1)(-2.5) = 5.25$ and $1.5^2 = 2.25$ differ. $D > 0$ and $Q_{KK} < 0$ at every point, so $Q$ is concave. This matches $A^2ab(1 - a - b) = 100 \cdot 0.15 \cdot 0.2 = 3$.
4. With $b = 0.8$: at $(1, 1)$, $Q_{KK} = -2.1$, $Q_{LL} = 10 \cdot 0.8 \cdot (-0.2) = -1.6$, $Q_{KL} = 10 \cdot 0.3 \cdot 0.8 = 2.4$, so $D = 3.36 - 5.76 = -2.4 < 0$
   *Why:* now $a + b = 1.1 > 1$. Each input on its own still has diminishing returns, but the cross effect is stronger, so $Q$ is not concave: doubling both inputs multiplies output by $2^{1.1} \approx 2.14$. The isoquants still bow towards the origin, so $Q$ remains quasiconcave.

```verify
Q(K, L) = 10*K^0.3*L^0.5
# at (1, 1)
kk = 10*0.3*(0.3 - 1)
ll = 10*0.5*(0.5 - 1)
kl = 10*0.3*0.5
assert abs(kk + 2.1) < 0.000001
assert abs(ll + 2.5) < 0.000001
assert abs(kl - 1.5) < 0.000001
assert abs(kk*ll - 5.25) < 0.000001
assert abs(kl^2 - 2.25) < 0.000001
D = kk*ll - kl^2
assert abs(D - 3) < 0.000001
assert abs(10^2*0.3*0.5*(1 - 0.3 - 0.5) - 3) < 0.000001
# the formula D = 3 K^-1.4 L^-1 checked numerically at (2, 3)
h = 0.001
nkk = (Q(2 + h, 3) - 2*Q(2, 3) + Q(2 - h, 3))/h^2
nll = (Q(2, 3 + h) - 2*Q(2, 3) + Q(2, 3 - h))/h^2
nkl = (Q(2 + h, 3 + h) - Q(2 + h, 3 - h) - Q(2 - h, 3 + h) + Q(2 - h, 3 - h))/(4*h^2)
assert abs(nkk*nll - nkl^2 - 3*2^(-1.4)*3^(-1)) < 0.0001
# labour exponent 0.8
ll2 = 10*0.8*(0.8 - 1)
kl2 = 10*0.3*0.8
assert abs(ll2 + 1.6) < 0.000001
assert abs(kl2 - 2.4) < 0.000001
assert abs(kk*ll2 - 3.36) < 0.000001
assert abs(kl2^2 - 5.76) < 0.000001
assert abs(kk*ll2 - kl2^2 + 2.4) < 0.000001
assert abs(2^1.1 - 2.14) < 0.005
```

### Example 3 (hard): quasiconcave but not concave
A student's utility from $x$ cinema tickets and $y$ meals out is $U = xy$. Show that $U$ is not concave, but that it is quasiconcave, with a diminishing marginal rate of substitution.

1. $U_{xx} = 0$, $U_{yy} = 0$, $U_{xy} = 1$, so $D = 0 \cdot 0 - 1^2 = -1 < 0$
   *Why:* a negative determinant means the surface bends up in some directions and down in others, so $U$ is neither concave nor convex.
2. Along the diagonal: $U(1, 1) = 1$, $U(5, 5) = 25$, but the midpoint $(3, 3)$ gives $U = 9 < \dfrac{1 + 25}{2} = 13$
   *Why:* a chord lies above the graph, which a concave function never allows. Scaling both goods up raises utility faster and faster.
3. $A = (2, 8)$ and $B = (8, 2)$ both give $U = 16$; their mix $C = \tfrac12 A + \tfrac12 B = (5, 5)$ gives $U = 25 > 16$
   *Why:* the balanced bundle beats both extremes. In general the upper level set $\{xy \ge c\}$ is the region on or above the hyperbola $y = c/x$, which is convex, so $U$ is quasiconcave.
4. $\bar H = 2U_xU_yU_{xy} - U_y^2U_{xx} - U_x^2U_{yy} = 2 \cdot y \cdot x \cdot 1 - 0 - 0 = 2xy$; at $A$ it is $32 > 0$
   *Why:* with $U_x = y > 0$ and $U_y = x > 0$, a positive bordered determinant at every point confirms that the indifference curves bow towards the origin.
5. $MRS = U_x/U_y = y/x$: it is $4$ at $(2, 8)$, $1$ at $(4, 4)$ and $0.25$ at $(8, 2)$
   *Why:* all three bundles lie on $U = 16$. Moving along the curve towards more cinema, the student gives up fewer and fewer meals for each extra ticket: a diminishing MRS. The utility $x^2y^2$ has the same indifference curves and so the same verdict, even though $U_{xx} = 2y^2 > 0$.

```verify
U(x, y) = x*y
Uxx = U(3, 2) - 2*U(2, 2) + U(1, 2)
Uyy = U(2, 3) - 2*U(2, 2) + U(2, 1)
Uxy = (U(3, 3) - U(3, 1) - U(1, 3) + U(1, 1))/4
assert Uxx == 0
assert Uyy == 0
assert Uxy == 1
assert Uxx*Uyy - Uxy^2 == -1
assert U(1, 1) == 1
assert U(5, 5) == 25
assert U(3, 3) == 9
assert (U(1, 1) + U(5, 5))/2 == 13
assert U(2, 8) == 16
assert U(8, 2) == 16
assert U(0.5*2 + 0.5*8, 0.5*8 + 0.5*2) == 25
# bordered determinant at A = (2, 8): Ux = y = 8, Uy = x = 2
B = det([0, 8, 2; 8, 0, 1; 2, 1, 0])
assert abs(B - 32) < 0.000001
assert 2*2*8 == 32
assert 8/2 == 4
assert U(4, 4) == 16
assert 4/4 == 1
assert 2/8 == 0.25
```

## Common mistakes
- Writing $f_{xx} = a$ instead of $2a$ for a term $ax^2$ (FORGOT_FACTOR_TWO).
- Computing $D$ as $f_{xx}f_{yy} + f_{xy}^2$ (HESSIAN_ADDED).
- Giving the cross term $b\,xy$ a cross partial of $2b$ (CROSS_DOUBLED).
- Leaving $Q_{KL}^2$ out of the determinant of a Cobb–Douglas function (IGNORED_CROSS_TERM).
- Differentiating $K^a$ twice as $a^2K^{a-2}$ instead of $a(a - 1)K^{a-2}$ (POWER_NOT_LOWERED).
- Testing quasiconcavity by averaging the two utilities instead of working out the utility of the mixed bundle (AVERAGED_UTILITIES).
- Using the plain average of two bundles when the question gives other weights (IGNORED_WEIGHTS).
- Adding the two bundles without multiplying by the weights (SUMMED_BUNDLES).
- Calling a function concave because $f_{xx} \le 0$ and $f_{yy} \le 0$, without checking $D \ge 0$ (AXES_ONLY).
- Checking the Hessian at one point and concluding that the function is concave everywhere (ONE_POINT_ONLY).
- Concluding that a utility or production function is concave because its indifference curves or isoquants bow towards the origin (QUASI_IS_CONCAVE).
- Mixing up the words: a convex *set* has no dents, while a convex *function* bends upwards. A quasiconcave utility has convex upper level sets, so its indifference curves are "convex towards the origin".

## Practice
- `quadratic-concavity-determinant` (difficulty 1): the Hessian determinant of a quadratic $f(x, y)$, and whether $f$ is concave, convex or neither; distractors FORGOT_FACTOR_TWO, HESSIAN_ADDED, CROSS_DOUBLED.
- `mixed-bundle-utility` (difficulty 2): the utility $U = xy$ of a weighted mix of two bundles on the same indifference curve; distractors AVERAGED_UTILITIES, IGNORED_WEIGHTS, SUMMED_BUNDLES.
- `cobb-douglas-hessian-determinant` (difficulty 3): the Hessian determinant of $Q = AK^aL^b$ at $K = L = 1$, whose sign shows whether $Q$ is concave; distractors HESSIAN_ADDED, IGNORED_CROSS_TERM, POWER_NOT_LOWERED.

## Real world
- Consumer theory assumes convex preferences: people buy a mix of goods rather than spending everything on one. This is what makes demand respond smoothly to prices and gives each consumer one best choice (MV10).
- Production and markets: when technologies have non-increasing returns, production sets are convex and competitive prices can support efficient outcomes. Large fixed costs or network effects (power grids, railways, software platforms) break convexity, which is one reason such industries tend towards monopoly and regulation.
- Finance: the risk of a portfolio, measured by its variance, is a convex function of the portfolio weights, so a mix of assets can be less risky than any single one; this is the mathematics of diversification.
- Econometrics and numerical optimisation: the sum of squared errors in least squares is convex in the coefficients, so OLS has one minimum (EM01). Convex problems can be solved reliably on a computer, while non-convex ones may get stuck in local optima.

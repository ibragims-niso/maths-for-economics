---
id: C110
title: Implicit differentiation
block: C1
coreYear: 1
prerequisites: [C104]
estMinutes: 45
status: draft
economicUses:
  - "Marginal rate of substitution: the slope of an indifference curve"
  - "Marginal rate of technical substitution: how many machines one extra worker can replace"
  - Opportunity cost along a production possibility frontier
  - The slope of an inverse demand curve from the demand curve
generators: [indifference-curve-slope, isoquant-mrts, frontier-slope-implicit]
widgets: [indifference-curve-mrs]
mistakeCodes:
  SIGN:
    label: Lost the minus sign
    explanation: Indifference curves, isoquants and production frontiers slope downwards, because more of one thing must be balanced by less of the other. Keep the minus sign that appears when you move the first term to the other side.
  INVERTED_RATIO:
    label: Turned the ratio upside down
    explanation: After differentiating, the terms without dy/dx go on top and the factor multiplying dy/dx goes underneath. The other way round gives dx/dy, the slope with the axes swapped.
  FORGOT_EXPONENTS:
    label: Left out the exponents
    explanation: For xᵃ·yᵇ = Ū the slope is −(a·y)/(b·x). The exponents come down when you differentiate and do not cancel unless a = b.
  SWAPPED_EXPONENTS:
    label: Put the exponents with the wrong inputs
    explanation: The labour exponent α comes down from L^α and ends up on top, next to K, so MRTS = (α·K)/(β·L). Writing (β·K)/(α·L) mixes up which exponent belongs to which input.
  SLOPE_NOT_RATE:
    label: Gave the slope, not the MRTS
    explanation: The slope of an isoquant, dK/dL, is negative. The marginal rate of technical substitution is minus that slope, a positive number of machines per worker.
  MISSED_PRODUCT_RULE:
    label: Missed a term of the product rule
    explanation: xy is a product of two functions of x, so its derivative is y + x·dy/dx. Writing only x·dy/dx drops the y term.
  FORGOT_CHAIN:
    label: Forgot the chain rule on y
    explanation: y depends on x, so the derivative of y² is 2y·dy/dx, not 2y. Every term that contains y gets a factor dy/dx when you differentiate.
resources:
  - { title: "Calculus Volume 1, 3.8 Implicit Differentiation (OpenStax)", url: "https://openstax.org/books/calculus-volume-1/pages/3-8-implicit-differentiation", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Single Variable Calculus, Session 13: Implicit Differentiation (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/pages/1.-differentiation/part-b-implicit-differentiation-and-inverse-functions/session-13-implicit-differentiation/", kind: course, verifiedAt: 2026-10-18 }
  - { title: "Principles of Economics 3e, Appendix B Indifference Curves (OpenStax)", url: "https://openstax.org/books/principles-economics-3e/pages/b-indifference-curves", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
A shopper likes food and clothing, and many different baskets leave her equally happy. If she gets one more unit of food, how much clothing would she give up for it? A factory manager asks the same kind of question: if we hire one more worker, how many machines can we do without and still make the same output? Both answers are the slope of a curve, but the curve is given as an equation such as $x^{0.3}y^{0.7} = 20$ or $x^2 + xy + y^2 = 1300$, not as $y = \ldots$. Solving for $y$ first is awkward or impossible. Implicit differentiation gets the slope straight from the equation.

## Intuition
Many economic curves say "something stays the same": utility along an indifference curve, output along an isoquant, spending along a budget line. Such an equation still ties $y$ to $x$: change $x$ and $y$ must adjust to keep the equation true. So treat $y$ as an unknown function $y(x)$ and differentiate the whole equation with respect to $x$.

The only new thing is what happens to terms in $y$. Since $y$ depends on $x$, a term like $y^2$ is a function of a function, and the chain rule (C104) gives $2y \cdot \dfrac{dy}{dx}$, exactly as $\big(g(x)\big)^2$ has derivative $2g(x)\,g'(x)$. The side that stays constant has derivative 0. What is left is an equation you can solve for $\dfrac{dy}{dx}$.

## Definition and formulas
An equation $F(x, y) = c$ defines $y$ implicitly as a function of $x$ when, near a point on the curve, each $x$ goes with one $y$. To find the slope $\dfrac{dy}{dx}$ (also written $y'$):

1. Differentiate both sides with respect to $x$, treating $y$ as $y(x)$. Every term containing $y$ picks up a factor $y'$ by the chain rule, for example $\dfrac{d}{dx}\,y^n = n\,y^{n-1}\,y'$. A term like $x\,y$ is a product and needs the product rule: $\dfrac{d}{dx}(xy) = y + x\,y'$.
2. The constant $c$ has derivative 0.
3. Collect the terms with $y'$ on one side and solve. The answer usually contains both $x$ and $y$, so put in a point that lies on the curve.

Results economists use all the time:

- Budget line $p_x\,x + p_y\,y = M$: $p_x + p_y\,y' = 0$, so $\dfrac{dy}{dx} = -\dfrac{p_x}{p_y}$. With $2x + 4y = 100$ the slope is $-0.5$. This is the simplest case: the line could also be solved for $y$ directly.
- Indifference curve $x^a y^b = \bar U$: $a\,x^{a-1}y^b + b\,x^a y^{b-1}\,y' = 0$, so
$$\frac{dy}{dx} = -\frac{a\,y}{b\,x}, \qquad MRS = -\frac{dy}{dx} = \frac{a\,y}{b\,x}.$$
The marginal rate of substitution (MRS) is how many units of $y$ the consumer would give up for one more unit of $x$.
- Isoquant $A\,L^{\alpha}K^{\beta} = \bar Q$, with capital $K$ on the vertical axis:
$$\frac{dK}{dL} = -\frac{\alpha\,K}{\beta\,L}, \qquad MRTS = -\frac{dK}{dL} = \frac{\alpha\,K}{\beta\,L}.$$
The marginal rate of technical substitution (MRTS) is how many machines one extra worker can replace with output unchanged. The constant $A$ cancels.
- Inverse functions: if demand is $Q = D(P)$ and $P(Q)$ is its inverse (F10), then $Q = D\big(P(Q)\big)$ for every $Q$. Differentiating with respect to $Q$ gives $1 = D'(P)\,P'(Q)$, so
$$\frac{dP}{dQ} = \frac{1}{dQ/dP}.$$
For $QP = 500$ at $P = 10$, $Q = 50$: $\dfrac{dQ}{dP} = -\dfrac{500}{P^2} = -5$, so $\dfrac{dP}{dQ} = -0.2$. Check: $P = 500/Q$ gives $-\dfrac{500}{Q^2} = -\dfrac{500}{2500} = -0.2$.
- Second derivative: differentiate the formula for $y'$ again with respect to $x$ (it contains $y$, so the chain rule applies again), then replace $y'$ by its formula. Its sign says whether the curve bends towards the origin (positive, as for indifference curves) or away from it; C108 develops this.

In MV05 you will meet a shortcut, the implicit function theorem, which gives the same slopes with partial derivatives.

## Interactive
::widget{id="indifference-curve-mrs"}

The lilac curve is the indifference curve $xy = U$ for the utility $U = xy$. Use the **Utility level U** slider to choose the curve and the **Food x** slider to move the bundle along it. The gold dashed line is the tangent at the bundle, and the panel shows the bundle $(x, y)$, the slope $dy/dx = -y/x$ and the MRS. Check: with $U = 48$ and $x = 4$ the panel shows the bundle $(4, 12)$, slope $-3$ and MRS 3, as in Example 1. Move food to $x = 8$ and the MRS falls to 0.75: the tangent flattens as the consumer has more food. Then raise $U$ while keeping $x$ fixed: the curve moves outwards and the MRS rises.

## Worked examples

### Example 1 (easy): the slope of an indifference curve
A consumer's utility from $x$ units of food and $y$ units of clothing is $U = xy$. Find the slope of the indifference curve $xy = 48$ at the bundle $(4, 12)$, compare it with the slope at $(8, 6)$, and find the second derivative at $(4, 12)$.

1. $\dfrac{d}{dx}(xy) = \dfrac{d}{dx}(48) \;\Rightarrow\; y + x\,\dfrac{dy}{dx} = 0$
   *Why:* $xy$ is a product and $y$ depends on $x$, so the product rule gives $1 \cdot y + x \cdot y'$; the constant 48 has derivative 0.
2. $\dfrac{dy}{dx} = -\dfrac{y}{x}$
   *Why:* move $y$ to the right-hand side and divide by $x$.
3. At $(4, 12)$: $\dfrac{dy}{dx} = -\dfrac{12}{4} = -3$, so $MRS = 3$.
   *Why:* near this bundle the consumer would give up about 3 units of clothing for one more unit of food and feel just as well off.
4. Check: $y = \dfrac{48}{x}$ gives $\dfrac{dy}{dx} = -\dfrac{48}{x^2} = -\dfrac{48}{16} = -3$.
   *Why:* this curve can also be solved for $y$, so both routes must agree.
5. At $(8, 6)$: $\dfrac{dy}{dx} = -\dfrac{6}{8} = -0.75$, so $MRS = 0.75$.
   *Why:* with more food and less clothing, food is worth less clothing to her: the MRS falls along the curve.
6. $y'' = -\dfrac{x\,y' - y}{x^2} = -\dfrac{x(-y/x) - y}{x^2} = \dfrac{2y}{x^2} = \dfrac{24}{16} = 1.5$
   *Why:* differentiate $-y/x$ with the quotient rule, remembering $y$ depends on $x$, then replace $y'$ by $-y/x$. A positive value means the curve bends towards the origin. From $y = 48/x$ directly, $y'' = 96/x^3 = 1.5$ too.

```verify
U = 48; x1 = 4; y1 = U/x1
assert y1 == 12
s1 = -y1/x1
assert s1 == -3
assert -U/x1^2 == s1
x2 = 8; y2 = U/x2
assert y2 == 6
assert -y2/x2 == -0.75
ypp = 2*y1/x1^2
assert ypp == 1.5
assert 96/x1^3 == ypp
# the slope agrees with a difference quotient on y = 48/x
h = 0.000001
assert abs((U/(x1+h) - U/(x1-h))/(2*h) - s1) < 0.0001
```

### Example 2 (medium): how many machines can one worker replace?
A firm's output is $Q = 2\,L^{0.6}K^{0.4}$, where $L$ is the number of workers and $K$ the number of machines. It uses $L = 24$ and $K = 40$. Find the slope of the isoquant through this bundle and the MRTS, and check the answer by hiring one more worker.

1. $2\,L^{0.6}K^{0.4} = \bar Q$, with $K = K(L)$
   *Why:* along an isoquant output stays the same, so $K$ must change with $L$ in just the way that keeps it fixed.
2. $2\left(0.6\,L^{-0.4}K^{0.4} + 0.4\,L^{0.6}K^{-0.6}\,\dfrac{dK}{dL}\right) = 0$
   *Why:* product rule on $L^{0.6}$ times $K^{0.4}$; the chain rule gives $0.4\,K^{-0.6}\,\dfrac{dK}{dL}$ for the factor in $K$; the constant $\bar Q$ has derivative 0.
3. $\dfrac{dK}{dL} = -\dfrac{0.6\,L^{-0.4}K^{0.4}}{0.4\,L^{0.6}K^{-0.6}} = -\dfrac{0.6\,K}{0.4\,L}$
   *Why:* the 2 cancels; dividing the powers leaves $K^{1}$ on top and $L^{1}$ underneath.
4. $\dfrac{dK}{dL} = -\dfrac{0.6 \cdot 40}{0.4 \cdot 24} = -\dfrac{24}{9.6} = -2.5$, so $MRTS = 2.5$.
   *Why:* the MRTS is minus the slope: one more worker can replace about 2.5 machines with output unchanged.
5. Check: on the same isoquant, $L = 25$ needs $K = 37.62$, which is $2.38$ machines fewer.
   *Why:* the true change over a whole worker is a little smaller than 2.5 because the isoquant bends; the slope describes very small moves.

```verify
A = 2; a = 0.6; b = 0.4; L = 24; K = 40
Qbar = A*L^a*K^b
slope = -(a*K)/(b*L)
assert abs(slope + 2.5) < 1e-12
assert abs(a*K - 24) < 1e-12 and abs(b*L - 9.6) < 1e-12
# K as a function of L along the isoquant, and its slope by a difference quotient
K25 = (Qbar/(A*25^a))^(1/b)
assert abs(K25 - 37.62) < 0.005
assert abs((K - K25) - 2.38) < 0.005
h = 0.000001
Kp = (Qbar/(A*(L+h)^a))^(1/b)
Km = (Qbar/(A*(L-h)^a))^(1/b)
assert abs((Kp - Km)/(2*h) - slope) < 0.0001
```

### Example 3 (hard): opportunity cost on a curved frontier
A farm can grow $x$ tonnes of wheat and $y$ tonnes of barley. Its production possibility frontier is $x^2 + xy + y^2 = 1300$. Find $\dfrac{dy}{dx}$ at $(10, 30)$ and at $(30, 10)$ and explain the difference.

1. $10^2 + 10 \cdot 30 + 30^2 = 100 + 300 + 900 = 1300$
   *Why:* the slope formula needs a point on the curve, so check it first. Solving the frontier for $y$ would need the quadratic formula; implicit differentiation avoids that.
2. $2x + \left(y + x\,\dfrac{dy}{dx}\right) + 2y\,\dfrac{dy}{dx} = 0$
   *Why:* product rule on $xy$ and chain rule on $y^2$; the constant 1300 has derivative 0.
3. $(x + 2y)\,\dfrac{dy}{dx} = -(2x + y) \;\Rightarrow\; \dfrac{dy}{dx} = -\dfrac{2x + y}{x + 2y}$
   *Why:* collect the two terms with $dy/dx$ on one side and factor it out.
4. At $(10, 30)$: $\dfrac{dy}{dx} = -\dfrac{50}{70} = -0.71$
   *Why:* one more tonne of wheat costs about 0.71 tonnes of barley. This opportunity cost, $-dy/dx$, is the marginal rate of transformation.
5. At $(30, 10)$: $\dfrac{dy}{dx} = -\dfrac{70}{50} = -1.4$
   *Why:* when the farm already grows a lot of wheat, an extra tonne costs more barley, 1.4 tonnes. The frontier gets steeper as $x$ grows: it bows outwards, because land suited to barley is switched to wheat last.

```verify
c = 1300
assert 10^2 + 10*30 + 30^2 == c
s1 = -(2*10 + 30)/(10 + 2*30)
assert abs(s1 - (-0.7142857)) < 0.000001
assert abs(s1 - (-0.71)) < 0.005
s2 = -(2*30 + 10)/(30 + 2*10)
assert s2 == -1.4
# the frontier solved for y with the quadratic formula gives the same point and slope
y(x) = (-x + sqrt(4*c - 3*x^2))/2
assert abs(y(10) - 30) < 1e-12
assert abs(y(30) - 10) < 1e-12
h = 0.000001
assert abs((y(10+h) - y(10-h))/(2*h) - s1) < 0.0001
assert abs((y(30+h) - y(30-h))/(2*h) - s2) < 0.0001
```

## Common mistakes
- Dropping the minus sign, so the curve seems to slope upwards (SIGN).
- Turning the ratio upside down and giving $dx/dy$ instead of $dy/dx$ (INVERTED_RATIO).
- Forgetting the exponents in $x^a y^b = \bar U$ and giving $-y/x$ (FORGOT_EXPONENTS).
- Putting the exponents next to the wrong inputs in the MRTS (SWAPPED_EXPONENTS).
- Giving the negative slope $dK/dL$ when the positive MRTS was asked (SLOPE_NOT_RATE).
- Differentiating $xy$ as $x\,y'$ and losing the $y$ term of the product rule (MISSED_PRODUCT_RULE).
- Differentiating $y^2$ as $2y$ without the factor $dy/dx$ (FORGOT_CHAIN).
- Differentiating the constant on the right-hand side as if it changed: utility, output or the budget is fixed along the curve, so its derivative is 0.
- Putting in a point that is not on the curve: check that it satisfies the equation before using the slope formula.

## Practice
- `indifference-curve-slope` (difficulty 1): slope $dy/dx$ of the indifference curve of $U = x^a y^b$ through a bundle; distractors SIGN, INVERTED_RATIO, FORGOT_EXPONENTS.
- `isoquant-mrts` (difficulty 2): the MRTS $-dK/dL$ on an isoquant of $Q = A\,L^{\alpha}K^{\beta}$ at a given bundle; distractors SLOPE_NOT_RATE, INVERTED_RATIO, FORGOT_EXPONENTS, SWAPPED_EXPONENTS.
- `frontier-slope-implicit` (difficulty 3): $dy/dx$ on a production possibility frontier $ax^2 + bxy + cy^2 = d$ at a point; distractors SIGN, INVERTED_RATIO, MISSED_PRODUCT_RULE, FORGOT_CHAIN.

## Real world
- Consumer choice: a consumer gets the most utility from a budget where the indifference curve just touches the budget line, so the MRS equals the price ratio $p_x/p_y$. This tangency condition is the starting point for deriving demand curves.
- Work and leisure: an indifference curve between hours of leisure and income has an MRS that tells how much extra pay a worker needs to give up one more hour of free time. Labour economists use it to study overtime pay and tax changes.
- Automation: the MRTS between workers and machines tells a firm how many machines one worker can replace without losing output. Firms that cut costs choose the mix where the MRTS equals the wage divided by the cost of a machine.
- Trade and opportunity cost: a bowed-out production possibility frontier, like the farm in Example 3, means the opportunity cost of a good rises as a country makes more of it. This is one reason countries specialise only partly in the goods they are best at.

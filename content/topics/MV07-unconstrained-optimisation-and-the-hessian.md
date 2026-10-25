---
id: MV07
title: Unconstrained optimisation and the Hessian
block: MV
coreYear: 2
prerequisites: [MV02, LA104]
estMinutes: 50
status: draft
economicUses:
  - A multi-product firm choosing how much of each good to make
  - Price discrimination between separate markets
  - A firm choosing capital and labour together
  - Checking that a model's optimum is a maximum, not a saddle point
searchTerms:
  - "Extrema of multivariable functions"
  - "Hessian matrix"
  - "Unconstrained optimization"
syllabusHeadings:
  - "Extrema of functions of several variables"
generators: [hessian-determinant-two-goods, two-product-optimal-output, price-discrimination-two-markets]
widgets: [two-product-profit-map]
mistakeCodes:
  IGNORED_CROSS_TERM:
    label: Ignored the cross term
    explanation: A term like eQ₁Q₂ links the two choices. It appears in both first-order conditions (as eQ₂ and as eQ₁) and gives the cross partial π₁₂ = −e in the Hessian. Dropping it solves a different problem.
  CROSS_SIGN:
    label: Sign slip on the cross term
    explanation: The derivative of −eQ₁Q₂ with respect to Q₁ is −eQ₂, with the same sign as the term. Carry the sign into the linear system and into the Hessian.
  FORGOT_FACTOR_TWO:
    label: Forgot the factor 2 from a squared term
    explanation: The derivative of −cQ₁² with respect to Q₁ is −2cQ₁, so π₁₁ = −2c, not −c. Differentiate each term; do not just copy the coefficients.
  OTHER_QUANTITY:
    label: Gave the other quantity
    explanation: Solving the system gives both Q₁ and Q₂. Check which one the question asks for.
  HESSIAN_ADDED:
    label: Added the cross partial squared
    explanation: The determinant of the Hessian is π₁₁π₂₂ − π₁₂², the diagonal product minus the square of the cross partial. Adding the square always makes D look positive and hides saddle points.
  CROSS_DOUBLED:
    label: Doubled the cross partial
    explanation: The derivative of eQ₁Q₂ first with respect to Q₁ and then Q₂ is just e. The factor 2 appears only for squared terms such as Q₁².
  IGNORED_OTHER_MARKET:
    label: Treated one market on its own
    explanation: With a rising marginal cost, the cost of a unit sold in market 1 depends on total output, including what is sold in market 2. Solve both first-order conditions together.
  PRICE_EQUALS_COST:
    label: Set price equal to marginal cost
    explanation: A firm with market power sets marginal revenue, not price, equal to marginal cost in each market. The price then comes from the demand curve and lies above marginal cost.
  QUANTITY_NOT_PRICE:
    label: Gave the quantity instead of the price
    explanation: The first-order conditions give quantities. Put the quantity into that market's demand curve to get the price.
  SADDLE_MISSED:
    label: Classified by π₁₁ alone
    explanation: A negative π₁₁ only says the function bends down along the Q₁ direction. If D < 0 it bends up in another direction, so the point is a saddle, not a maximum. Check D first.
  ZERO_D_DECIDES:
    label: Treated D = 0 as a verdict
    explanation: When D = 0 the second-order test says nothing; the point may be a maximum, a minimum or neither. Look at the function itself near the point.
resources:
  - { title: "Calculus Volume 3, 4.7 Maxima/Minima Problems (OpenStax)", url: "https://openstax.org/books/calculus-volume-3/pages/4-7-maxima-minima-problems", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "MIT 18.02SC Multivariable Calculus, Session 28: Optimization Problems (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-02sc-multivariable-calculus-fall-2010/pages/2.-partial-derivatives/part-a-functions-of-two-variables-tangent-approximation-and-optimization/session-28-optimization-problems/", kind: course, verifiedAt: 2026-10-18 }
  - { title: "MIT 18.02SC Multivariable Calculus, Session 30: Second Derivative Test (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-02sc-multivariable-calculus-fall-2010/pages/2.-partial-derivatives/part-a-functions-of-two-variables-tangent-approximation-and-optimization/session-30-second-derivative-test/", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
Real decisions rarely come one at a time. A bakery decides how many loaves and how many cakes to bake, and both use the same ovens. An airline sells the same flight to business and leisure travellers at different prices. A factory chooses how many machines and how many workers to employ. Each is a choice of two or more numbers at once, and the best choice of one depends on the others. This topic extends the one-variable method of C109 to several variables: set every partial derivative to zero, solve the system, then use the matrix of second derivatives, the **Hessian**, to check that you have found a peak and not a pass between two hills.

## Intuition
Think of profit as the height of a landscape over a map whose two directions are the two outputs $Q_1$ and $Q_2$. Lines on the map that join points of equal profit are contour lines, as on a hiking map. At any point, the gradient (MV02), the pair of partial derivatives $(\pi_1, \pi_2)$, is an arrow pointing straight uphill, across the contour lines. At the summit there is no uphill direction left, so the arrow shrinks to nothing: both partial derivatives are zero.

A flat spot is not always a summit. It can be the bottom of a bowl (a minimum) or a mountain pass, a **saddle point**, where the ground rises in one direction and falls in another. The function $f(x, y) = xy$ is the standard example: at $(0, 0)$ both partial derivatives are zero, yet $f$ is positive along the line $y = x$ and negative along $y = -x$. Looking along one direction at a time cannot rule this out, because the cross partial $f_{xy}$ measures how the slope in one direction changes as you move in the other. The Hessian collects all the second partials, and its determinant weighs the curvature along the axes against this twist.

## Definition and formulas
::syllabus[Ordinary extrema of functions of several variables]

**First-order conditions.** A point $(x^*, y^*)$ where
$$f_x(x^*, y^*) = 0 \quad\text{and}\quad f_y(x^*, y^*) = 0$$
is a **critical point** (also called a stationary point). Every maximum or minimum inside the domain is a critical point. For a quadratic function the two conditions are a linear system, which you can solve by substitution or by Cramer's rule (LA104).

**The Hessian** is the matrix of second partial derivatives
$$H = \begin{bmatrix} f_{xx} & f_{xy} \\ f_{yx} & f_{yy} \end{bmatrix}, \qquad f_{xy} = f_{yx} \text{ (Young's theorem)}.$$

**Second-order test for two variables.** Evaluate at the critical point
$$D = \det H = f_{xx} f_{yy} - f_{xy}^2.$$

- $D > 0$ and $f_{xx} < 0$: a local maximum.
- $D > 0$ and $f_{xx} > 0$: a local minimum.
- $D < 0$: a saddle point, whatever the sign of $f_{xx}$.
- $D = 0$: the test does not decide.

When $D > 0$, $f_{xx}$ and $f_{yy}$ have the same sign, so either one tells you which case you are in.

**More than two variables, in brief.** For $n$ choice variables the Hessian is $n \times n$. Its **leading principal minors** $H_1, H_2, \dots, H_n$ are the determinants of its top-left $1 \times 1$, $2 \times 2$, …, $n \times n$ blocks. A critical point is a local maximum if they alternate in sign starting with a negative one ($H_1 < 0$, $H_2 > 0$, $H_3 < 0$, …) and a local minimum if they are all positive. For $n = 2$ this is the test above, with $H_1 = f_{xx}$ and $H_2 = D$.

**Local and global.** The test describes the function only near the point. If the maximum conditions hold at *every* point, as for a quadratic profit whose second partials are constants, the function is concave and the critical point is the global maximum. Concavity is treated properly in MV06.

## Interactive
::widget{id="two-product-profit-map"}

The map shows contour lines of the profit from Example 1, $\pi = 56Q_1 + 68Q_2 - 2Q_1^2 - 3Q_2^2 - 2Q_1Q_2 - 200$, with the maximum marked as a hollow point. Move the **Output of good 1, Q₁** and **Output of good 2, Q₂** sliders to move the solid point. The gold arrow is the gradient: it points uphill, across the contour lines, and gets shorter as you climb. The panel shows profit and the two partial derivatives. Check: at $Q_1 = 4$, $Q_2 = 4$ the panel shows profit 184, $\partial\pi/\partial Q_1 = 32$ and $\partial\pi/\partial Q_2 = 36$; at $Q_1 = 10$, $Q_2 = 8$ both partial derivatives are 0, the arrow disappears and profit is 352, the highest value on the map.

## Worked examples

### Example 1 (easy): a two-product firm
A firm makes two products that share one production line, so making more of one raises the cost of the other. Its profit is $\pi = 56Q_1 + 68Q_2 - 2Q_1^2 - 3Q_2^2 - 2Q_1Q_2 - 200$. Find the profit-maximising outputs and the maximum profit.

1. $\pi_1 = 56 - 4Q_1 - 2Q_2 = 0$ and $\pi_2 = 68 - 2Q_1 - 6Q_2 = 0$
   *Why:* at the top of the profit landscape neither output can be changed to gain profit, so both partial derivatives are zero.
2. $4Q_1 + 2Q_2 = 56$, $2Q_1 + 6Q_2 = 68$; $\det = 24 - 4 = 20$, so $Q_1 = \dfrac{56 \cdot 6 - 2 \cdot 68}{20} = 10$ and $Q_2 = \dfrac{4 \cdot 68 - 2 \cdot 56}{20} = 8$
   *Why:* the first-order conditions are a linear system; Cramer's rule solves it, and a non-zero determinant means there is exactly one critical point.
3. $H = \begin{bmatrix} -4 & -2 \\ -2 & -6 \end{bmatrix}$, $D = (-4)(-6) - (-2)^2 = 20 > 0$ and $\pi_{11} = -4 < 0$
   *Why:* $D > 0$ with a negative $\pi_{11}$ means profit bends downwards in every direction, so the critical point is a maximum. The Hessian is the same everywhere, so it is the global maximum.
4. $\pi(10, 8) = 560 + 544 - 200 - 192 - 160 - 200 = 352$
   *Why:* put the best outputs back into the profit function.

```verify
A = [4, 2; 2, 6]
r = [56; 68]
x = inv(A) * r
Q1 = x[1, 1]
Q2 = x[2, 1]
assert abs(Q1 - 10) < 0.000001
assert abs(Q2 - 8) < 0.000001
assert det(A) == 20
# first-order conditions hold
assert 56 - 4*10 - 2*8 == 0
assert 68 - 2*10 - 6*8 == 0
H = [-4, -2; -2, -6]
assert det(H) == 20
profit = 56*10 + 68*8 - 2*10^2 - 3*8^2 - 2*10*8 - 200
assert profit == 352
# a neighbour earns less
assert 56*11 + 68*8 - 2*11^2 - 3*8^2 - 2*11*8 - 200 < 352
# ignoring the cross term would give Q1 = 14
assert 56/4 == 14
```

### Example 2 (medium): price discrimination between two markets
A firm sells the same product in two separate markets with inverse demands $P_1 = 120 - 3Q_1$ and $P_2 = 90 - Q_2$. Everything is made in one plant with cost $C = 500 + 10Q + Q^2$, where $Q = Q_1 + Q_2$. Find the profit-maximising price in each market.

1. $\pi = (120 - 3Q_1)Q_1 + (90 - Q_2)Q_2 - 500 - 10(Q_1 + Q_2) - (Q_1 + Q_2)^2$
   *Why:* revenue comes from both markets, but the cost depends only on total output.
2. $\pi_1 = 120 - 6Q_1 - 10 - 2(Q_1 + Q_2) = 0$ and $\pi_2 = 90 - 2Q_2 - 10 - 2(Q_1 + Q_2) = 0$
   *Why:* each condition says marginal revenue in that market equals the marginal cost $10 + 2Q$ of the plant.
3. $8Q_1 + 2Q_2 = 110$, $2Q_1 + 4Q_2 = 80$; $\det = 32 - 4 = 28$, so $Q_1 = \dfrac{440 - 160}{28} = 10$ and $Q_2 = \dfrac{640 - 220}{28} = 15$
   *Why:* the markets are linked through the shared cost, so the two conditions must be solved together.
4. $H = \begin{bmatrix} -8 & -2 \\ -2 & -4 \end{bmatrix}$, $D = 32 - 4 = 28 > 0$, $\pi_{11} = -8 < 0$
   *Why:* the second-order test confirms a maximum.
5. $P_1 = 120 - 30 = 90$ and $P_2 = 90 - 15 = 75$; marginal revenue is $60$ in both markets and marginal cost is $10 + 2 \cdot 25 = 60$; profit is $650$.
   *Why:* prices come from the demand curves. At these points the price elasticity of demand (C107) is $-3$ in market 1 and $-5$ in market 2: the less elastic market pays the higher price.

```verify
A = [8, 2; 2, 4]
r = [110; 80]
x = inv(A) * r
Q1 = x[1, 1]
Q2 = x[2, 1]
assert abs(Q1 - 10) < 0.000001
assert abs(Q2 - 15) < 0.000001
assert det(A) == 28
P1 = 120 - 3*10
P2 = 90 - 15
assert P1 == 90
assert P2 == 75
MC = 10 + 2*(10 + 15)
assert MC == 60
assert 120 - 6*10 == MC
assert 90 - 2*15 == MC
profit = P1*10 + P2*15 - 500 - 10*25 - 25^2
assert profit == 650
H = [-8, -2; -2, -4]
assert det(H) == 28
# elasticities: Q1 = 40 - P1/3 and Q2 = 90 - P2
assert -(1/3)*P1/10 == -3
assert -1*P2/15 == -5
```

### Example 3 (hard): capital and labour with decreasing returns
A firm produces $Q = K^{1/4}L^{1/2}$ and sells at price 16. Capital costs 2 per unit and labour 4 per unit, so profit is $\pi = 16K^{1/4}L^{1/2} - 2K - 4L$. Find the profit-maximising inputs and check the second-order condition.

1. $\pi_K = 4K^{-3/4}L^{1/2} - 2 = 0$ and $\pi_L = 8K^{1/4}L^{-1/2} - 4 = 0$
   *Why:* each input is hired until the value of its marginal product equals its price.
2. Dividing the two conditions: $\dfrac{4K^{-3/4}L^{1/2}}{8K^{1/4}L^{-1/2}} = \dfrac{L}{2K} = \dfrac{2}{4}$, so $L = K$
   *Why:* dividing removes the awkward powers and gives a simple link between the inputs.
3. Put $L = K$ into $\pi_L = 0$: $8K^{-1/4} = 4$, so $K^{-1/4} = \tfrac12$ and $K = L = 16$. Output is $Q = 2 \cdot 4 = 8$ and profit is $128 - 32 - 64 = 32$.
   *Why:* one equation in one unknown remains; $16^{1/4} = 2$ and $16^{1/2} = 4$.
4. $\pi_{KK} = -3K^{-7/4}L^{1/2} = -0.09375$, $\pi_{LL} = -4K^{1/4}L^{-3/2} = -0.125$, $\pi_{KL} = 2K^{-3/4}L^{-1/2} = 0.0625$ at $(16, 16)$
   *Why:* differentiate the first partials again; the cross partial is positive because more capital makes each worker more productive.
5. $D = (-0.09375)(-0.125) - 0.0625^2 = 0.0078125 > 0$ and $\pi_{KK} < 0$, so $(16, 16)$ is a maximum.
   *Why:* the curvature along the axes outweighs the cross effect. This works because the exponents add up to $\tfrac14 + \tfrac12 < 1$ (decreasing returns to scale); with constant returns $D$ would be exactly zero.

```verify
p = 16; w = 4; r = 2
K = 16; L = 16
assert abs(4*K^(-3/4)*L^(1/2) - r) < 0.000001
assert abs(8*K^(1/4)*L^(-1/2) - w) < 0.000001
Q = K^(1/4)*L^(1/2)
assert abs(Q - 8) < 0.000001
profit = p*Q - r*K - w*L
assert abs(profit - 32) < 0.000001
fKK = -3*K^(-7/4)*L^(1/2)
fLL = -4*K^(1/4)*L^(-3/2)
fKL = 2*K^(-3/4)*L^(-1/2)
assert abs(fKK + 0.09375) < 0.0000001
assert abs(fLL + 0.125) < 0.0000001
assert abs(fKL - 0.0625) < 0.0000001
D = fKK*fLL - fKL^2
assert abs(D - 0.0078125) < 0.0000001
# general Cobb-Douglas formula: D = p^2 ab K^(2a-2) L^(2b-2) (1 - a - b)
a = 1/4; b = 1/2
assert abs(p^2*a*b*K^(2*a-2)*L^(2*b-2)*(1 - a - b) - D) < 0.0000001
# a nearby input pair earns less
assert p*17^(1/4)*15^(1/2) - r*17 - w*15 < profit
```

## Common mistakes
- Dropping the cross term $eQ_1Q_2$ from a first-order condition or from the Hessian (IGNORED_CROSS_TERM).
- Losing the minus sign of the cross term when moving it into the linear system (CROSS_SIGN).
- Writing $\pi_{11} = -c$ instead of $-2c$ for a term $-cQ_1^2$ (FORGOT_FACTOR_TWO).
- Reporting $Q_2$ when the question asked for $Q_1$, or the other way round (OTHER_QUANTITY).
- Computing $D$ as $f_{xx}f_{yy} + f_{xy}^2$ (HESSIAN_ADDED).
- Giving the cross term $eQ_1Q_2$ a cross partial of $2e$ (CROSS_DOUBLED).
- In price discrimination with a rising marginal cost, solving each market as if the other did not exist (IGNORED_OTHER_MARKET).
- Setting the price, rather than marginal revenue, equal to marginal cost (PRICE_EQUALS_COST).
- Giving the quantity when the price was asked (QUANTITY_NOT_PRICE).
- Calling a point a maximum because $f_{xx} < 0$, without checking that $D > 0$ (SADDLE_MISSED).
- Reading $D = 0$ as a maximum or a minimum; the test is silent there (ZERO_D_DECIDES).
- Calling a local maximum the global one without checking the function's shape away from the point (see MV06).

## Practice
- `hessian-determinant-two-goods` (difficulty 1): the determinant $D$ of the Hessian of a two-product profit function, which may show a maximum or a saddle; distractors FORGOT_FACTOR_TWO, HESSIAN_ADDED, CROSS_DOUBLED, IGNORED_CROSS_TERM.
- `two-product-optimal-output` (difficulty 2): the profit-maximising quantity of one product for a firm with interacting outputs; distractors IGNORED_CROSS_TERM, CROSS_SIGN, FORGOT_FACTOR_TWO, OTHER_QUANTITY.
- `price-discrimination-two-markets` (difficulty 3): the profit-maximising price in one of two markets served from one plant with rising marginal cost; distractors IGNORED_OTHER_MARKET, PRICE_EQUALS_COST, QUANTITY_NOT_PRICE.

## Real world
- Multi-product firms such as car makers, breweries and software companies plan output of several products together, because they share factories, staff and brands.
- Price discrimination: airlines, rail companies, cinemas and drug makers charge different prices to different groups or countries, with higher prices where demand is less elastic.
- Input choice: firms decide how much capital and labour to use together; the cross partial captures how machines make workers more productive.
- Econometrics and machine learning estimate models by maximising a likelihood or minimising a sum of squared errors over many parameters; numerical methods (NM02) follow the gradient uphill and use the Hessian to check the result.

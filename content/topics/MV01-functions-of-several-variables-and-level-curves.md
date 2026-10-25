---
id: MV01
title: Functions of several variables and level curves
block: MV
coreYear: 2
prerequisites: [C109]
estMinutes: 40
status: draft
economicUses:
  - Utility of a bundle of several goods and indifference curves
  - Output from capital and labour, and isoquants
  - "Budget lines and iso-cost lines: straight level curves of spending"
  - Reading contour maps of profit, cost or utility
searchTerms:
  - "Multivariable functions, their limit and continuity"
  - "Function of several variables"
  - "Points in n-dimensional space, distance and neighbourhood"
  - "Graph and level curves"
  - "Limit of a multivariable function"
  - "Repeated limits"
  - "Continuity of multivariable functions"
syllabusHeadings:
  - "Functions of several variables, their limit and continuity"
generators: [level-curve-through-point, same-indifference-curve-quantity]
widgets: [indifference-map]
mistakeCodes:
  EXPONENTS_SWAPPED:
    label: Swapped the exponents
    explanation: Each exponent belongs to the letter it sits on. In Q = 5K^(3/4)L^(1/4) the power 3/4 goes with K and 1/4 with L; swapping them gives a different number unless the two exponents are equal.
  ADDED_NOT_MULTIPLIED:
    label: Added the terms instead of multiplying
    explanation: In a Cobb–Douglas function the inputs are multiplied, A·x^a·y^b. Adding the powers, A(x^a + y^b), is a different function in which each input works on its own.
  FORGOT_COEFFICIENT:
    label: Left out the coefficient
    explanation: The number in front, such as 10 in Q = 10K^(1/2)L^(1/2), multiplies the whole product. Leaving it out gives the level of a different function.
  SUBTRACTED_NOT_DIVIDED:
    label: Subtracted instead of dividing
    explanation: On the curve x·y = Ū the unknown y is a factor of a product, so divide, y = Ū/x. Subtracting, y = Ū − x, would only be right if utility were the sum x + y.
  POWER_NOT_UNDONE:
    label: Stopped at y²
    explanation: Dividing gives y² (or y to its exponent), not y. Take the square root, or in general the matching root, to get the quantity itself.
  WRONG_DIRECTION:
    label: Moved the wrong way along the curve
    explanation: Along an indifference curve more of one good must be matched by less of the other. Scaling y in the same proportion as x lands on a different curve, not the same one.
resources:
  - { title: "Calculus Volume 3, 4.1 Functions of Several Variables (OpenStax)", url: "https://openstax.org/books/calculus-volume-3/pages/4-1-functions-of-several-variables", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Principles of Economics 3e, Appendix B Indifference Curves (OpenStax)", url: "https://openstax.org/books/principles-economics-3e/pages/b-indifference-curves", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Multivariable Calculus 18.02SC, Session 25: Level Curves and Contour Plots (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-02sc-multivariable-calculus-fall-2010/pages/2.-partial-derivatives/part-a-functions-of-two-variables-tangent-approximation-and-optimization/session-25-level-curves-and-contour-plots/", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
Almost nothing in economics depends on one thing only. A farm's harvest depends on land, workers and machines; a household's well-being depends on food, housing, clothing and leisure; a firm's cost depends on the wage and the price of every input. To talk about these, economists need functions with two or more inputs, and a way to draw them on flat paper. Level curves do that: the indifference curves of consumer theory and the isoquants of production theory are level curves.

## Intuition
A function of two variables, $f(x, y)$, gives one number for every pair of inputs. Picture its graph as a landscape: the inputs $x$ and $y$ are the position on a map, and the value $f(x, y)$ is the height of the ground there. Utility is a hill that rises as you get more of either good.

A hiking map shows a hill without 3D drawing: it marks contour lines, each joining the places at the same height. Do the same with any function: join all the input pairs that give the same value. That curve is a level curve. For utility it joins equally good bundles (an indifference curve); for output it joins input mixes that produce the same amount (an isoquant). Where contour lines are packed close together the ground climbs quickly; where they are far apart it is nearly flat.

## Definition and formulas
::syllabus[Definition of a function of several variables; graph and level curves]

A function of two variables assigns one number $z = f(x, y)$ to each point $(x, y)$ of its domain, a set of points in the plane $\mathbb{R}^2$. With $n$ inputs we write $f(x_1, x_2, \ldots, x_n)$, for example the cost of a bundle of $n$ goods, $C = p_1x_1 + p_2x_2 + \cdots + p_nx_n$.

**Domain.** Use only the points where the formula makes sense and the economics allows: quantities cannot be negative, so utility $U = x^{1/2}y^{1/2}$ and output $Q = AK^{\alpha}L^{\beta}$ are used for $x, y \ge 0$ and $K, L \ge 0$. A formula with $\ln x$ needs $x > 0$.

**Graph.** The graph of $f(x, y)$ is the surface $z = f(x, y)$ above the $(x, y)$-plane, one height for each point.

**Level curve.** For a number $c$, the level curve of $f$ at level $c$ is the set of all points with $f(x, y) = c$. A contour map draws several level curves, usually for equally spaced levels.

- Two level curves with different levels never cross, because one point cannot have two values.
- Where the curves of equally spaced levels are close together, the function changes fast; where they are far apart, it changes slowly.

**Economic level curves.**

- Indifference curves of the Cobb–Douglas utility $U = x^a y^b$ ($a, b > 0$): solving $x^a y^b = \bar U$ for $y$ gives $y = \left(\bar U / x^a\right)^{1/b}$, a curve that falls as $x$ rises. For $U = xy$ it is simply $y = \bar U / x$.
- Isoquants of the production function $Q = AK^{\alpha}L^{\beta}$: the input mixes with $AK^{\alpha}L^{\beta} = \bar Q$.
- Budget lines and iso-cost lines: spending $E = p_x x + p_y y$ is a function of two variables, and its level curve $p_x x + p_y y = m$ is a straight line. In the same way an iso-cost line $wL + rK = C_0$ joins all input mixes that cost the same.

::syllabus[Points of n-dimensional space; limit and continuity]

**Distance, limits and continuity.** The distance between two points of $\mathbb{R}^n$ is the usual one, $\sqrt{(x_1 - y_1)^2 + \dots + (x_n - y_n)^2}$, and the **$\varepsilon$-neighbourhood** of a point is the set of points closer to it than $\varepsilon$ (a disc in the plane). A function $f(x, y)$ has the **limit** $A$ at $(a, b)$ if $f(x, y)$ gets as close to $A$ as you like for all points close enough to $(a, b)$, approaching **from any direction**. That last part is new compared with one variable: if two paths towards the point give different values, there is no limit. For example, $f(x, y) = \dfrac{xy}{x^2 + y^2}$ is 0 along both axes but $\tfrac12$ along the line $y = x$, so it has no limit at $(0, 0)$. Computing the two **repeated limits** (first $x \to a$, then $y \to b$, or the other way round) is a quick check: if they differ, the limit does not exist, but if they agree it still might not. $f$ is **continuous** at a point if its limit there equals its value. Polynomials, Cobb–Douglas functions on positive inputs and other combinations of continuous functions are continuous, and, as in one variable, a continuous function on a closed and bounded set reaches a largest and a smallest value (AN04).

**Returns to scale (a preview).** Scaling every input by the same factor $t$ shows how a technology behaves at a larger size. For $Q = AK^{\alpha}L^{\beta}$,
$$Q(tK, tL) = A(tK)^{\alpha}(tL)^{\beta} = t^{\alpha + \beta}\,Q(K, L).$$
With $\alpha + \beta = 1$, doubling both inputs doubles output (constant returns to scale); with $\alpha + \beta > 1$ output more than doubles. Topic MV04 treats this properly.

## Interactive
::widget{id="indifference-map"}

Move the **Food x** and **Clothing y** sliders to place a bundle on the contour map of $U = xy$. The solid curves are the indifference curves $U = 300$, $600$ and $900$, and the green line is the budget line $2x + 3y = 120$. The panel shows the bundle's utility, what it costs at prices 2 and 3, and which drawn curve it is on or between; when the bundle is not on a drawn curve, a dashed curve shows the indifference curve through it. Check: at $x = 30$, $y = 20$ the panel shows utility 600 and spending 120 of 120, the one point where $U = 600$ meets the budget line (Example 3). Then set $x = 20$, $y = 30$: utility is still 600, but the bundle costs 130, so it is on the same indifference curve but beyond the budget line. Notice also that along a line from the origin, such as $y = x$, the three curves get closer together as you move out: equal steps of utility take less and less extra of both goods, so the utility hill gets steeper.

## Worked examples

### Example 1 (easy): bundles on the same indifference curve
A student's utility from $x$ cinema tickets and $y$ meals out per year is $U(x, y) = xy$. Bundle A is $(4, 10)$. How many meals must bundle B with 8 tickets contain to be on the same indifference curve as A? Is bundle C $= (5, 9)$ better or worse than A?

1. $\bar U = U(4, 10) = 4 \cdot 10 = 40$
   *Why:* the indifference curve through A is the level curve whose level is A's utility.
2. $8y = 40 \;\Rightarrow\; y = 5$, so B $= (8, 5)$.
   *Why:* every bundle on the curve has utility 40; with $x = 8$ the unknown factor is $40/8$.
3. $U(5, 9) = 45 > 40$
   *Why:* C gives more utility, so it lies on a higher indifference curve and the student prefers it to both A and B.

```verify
U(x, y) = x*y
Ubar = U(4, 10)
yB = Ubar/8
assert Ubar == 40
assert yB == 5
assert U(8, yB) == Ubar
assert U(5, 9) == 45
```

### Example 2 (medium): an isoquant
A bakery's daily output of loaves is $Q(K, L) = 10K^{1/2}L^{1/2}$, where $K$ is machine-hours and $L$ is worker-hours. It now uses $K = 16$ and $L = 25$. Find the isoquant through this input mix, write it as $K$ in terms of $L$, and find how many machine-hours it needs for the same output if it uses $L = 40$.

1. $Q(16, 25) = 10 \cdot 4 \cdot 5 = 200$
   *Why:* $16^{1/2} = 4$ and $25^{1/2} = 5$; the isoquant through the point is $Q = 200$.
2. $10\sqrt{KL} = 200 \;\Rightarrow\; KL = 400 \;\Rightarrow\; K = \dfrac{400}{L}$
   *Why:* divide by 10 and square both sides; on this isoquant capital times labour is always 400.
3. $K = \dfrac{400}{40} = 10$
   *Why:* with 15 more worker-hours the bakery can drop from 16 to 10 machine-hours and still bake 200 loaves: labour replaces capital along the isoquant.

```verify
Q(K, L) = 10*K^0.5*L^0.5
Q0 = Q(16, 25)
assert Q0 == 200
c = (Q0/10)^2
assert c == 400
K1 = c/40
assert K1 == 10
assert abs(Q(K1, 40) - 200) < 1e-9
assert 16 - K1 == 6
```

### Example 3 (hard): where a budget line meets the indifference curves
A consumer with $U = xy$ has an income of 120 and faces prices 2 for good $x$ and 3 for good $y$. Find where the indifference curve $U = 600$ meets the budget line, and show that $U = 700$ cannot be reached while $U = 400$ is crossed twice.

1. Budget line: $2x + 3y = 120 \;\Rightarrow\; y = 40 - \tfrac{2}{3}x$
   *Why:* the budget line is the level curve of spending at level 120; solve it for $y$.
2. On $U = 600$: $x\left(40 - \tfrac{2}{3}x\right) = 600 \;\Rightarrow\; x^2 - 60x + 900 = 0$
   *Why:* a point on both curves satisfies both equations; multiply by $-\tfrac{3}{2}$ and rearrange.
3. $(x - 30)^2 = 0 \;\Rightarrow\; x = 30,\; y = 40 - 20 = 20$
   *Why:* the discriminant $60^2 - 4 \cdot 900 = 0$, so there is exactly one meeting point: the curve just touches the line at $(30, 20)$.
4. For a level $c$ the equation is $x^2 - 60x + 1.5c = 0$ with discriminant $3600 - 6c$: for $c = 700$ it is $-600 < 0$ (no meeting point), for $c = 400$ it is $1200 > 0$, with $x = 30 \pm \sqrt{300} \approx 12.68$ and $47.32$.
   *Why:* the curve $U = 700$ lies wholly beyond the budget line, while $U = 400$ cuts through the affordable set; the best affordable bundle is where the highest reachable curve touches the line (topic MV08 proves this).

```verify
f(x) = x*(40 - 2/3*x)
assert abs(f(30) - 600) < 1e-9
assert 2*30 + 3*20 == 120
assert 60^2 - 4*900 == 0
d(c) = 3600 - 6*c
assert d(700) == -600
assert d(400) == 1200
x1 = 30 - sqrt(300); x2 = 30 + sqrt(300)
assert abs(x1 - 12.68) < 0.005
assert abs(x2 - 47.32) < 0.005
assert abs(f(x1) - 400) < 1e-9
assert abs(f(x2) - 400) < 1e-9
```

## Common mistakes
- Putting each exponent on the wrong letter, for example computing $5 \cdot 81^{1/4} \cdot 16^{3/4}$ for $5K^{3/4}L^{1/4}$ at $K = 81$, $L = 16$ (EXPONENTS_SWAPPED).
- Adding the powers, $A(x^a + y^b)$, instead of multiplying them (ADDED_NOT_MULTIPLIED).
- Leaving out the coefficient $A$ in front of the product (FORGOT_COEFFICIENT).
- Solving $xy = \bar U$ as $y = \bar U - x$ instead of $y = \bar U / x$ (SUBTRACTED_NOT_DIVIDED).
- Stopping at $y^2 = 81$ and giving 81 instead of $y = 9$ (POWER_NOT_UNDONE).
- Giving bundle B more clothing when it already has more food: on an indifference curve the two goods move in opposite directions (WRONG_DIRECTION).
- Drawing two indifference curves that cross: a bundle has one utility level, so different level curves can never meet.
- Reading the level curve as the graph of the function: a level curve lies flat in the $(x, y)$-plane; the height $f(x, y)$ is the same everywhere along it.

## Practice
- `level-curve-through-point` (difficulty 1): the level $c$ of the indifference curve or isoquant of a Cobb–Douglas function $A x^a y^b$ through a given point; distractors EXPONENTS_SWAPPED, ADDED_NOT_MULTIPLIED, FORGOT_COEFFICIENT.
- `same-indifference-curve-quantity` (difficulty 2): with $U = xy$, $x^2y$ or $xy^2$, the amount of $y$ that puts a bundle with a given $x$ on the same indifference curve as another bundle; distractors SUBTRACTED_NOT_DIVIDED, POWER_NOT_UNDONE, EXPONENTS_SWAPPED, WRONG_DIRECTION.

## Real world
- Consumer research: firms and governments run choice surveys that ask people to trade one feature against another (price against travel time, salary against holidays); the answers trace out indifference curves and put a money value on time or comfort.
- Production planning: an isoquant shows a factory or farm every mix of machines and workers that meets its output target; with the iso-cost lines of the current wage and rental rate, managers see which mix is cheapest and how it shifts when wages rise.
- Maps and weather: contour lines on hiking maps and isobars on weather charts are level curves of height and air pressure; packed isobars mean strong winds, exactly as packed contours mean a steep slope.
- Policy analysis: economists draw contour maps of welfare, tax revenue or profit against two policy settings, such as two tax rates, to see which combinations give the same result.

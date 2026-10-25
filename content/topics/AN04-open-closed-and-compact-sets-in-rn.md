---
id: AN04
title: Open, closed and compact sets in ℝⁿ
block: AN
coreYear: 4
prerequisites: [AN03]
estMinutes: 45
status: draft
economicUses:
  - "Existence of the consumer's best bundle: a compact budget set and a continuous utility guarantee one"
  - "Why a free good (zero price) or a strict inequality can leave a choice problem with no solution"
  - Feasible sets in planning and production problems, and why production sets are assumed closed
  - "Telling interior solutions from boundary (corner) solutions"
searchTerms:
  - "Compact set"
  - "Open and closed sets"
  - "Bounded set"
  - "Neighbourhood of a point"
generators: [budget-line-distance, compact-budget-max-utility, budget-set-largest-ball]
widgets: [budget-set-open-ball]
mistakeCodes:
  FORGOT_NORM:
    label: Did not divide by the length of p
    explanation: The money gap |p·x − M| is measured in money, not in distance. Divide it by ‖p‖ = √(p₁² + p₂²) to get the distance from the bundle to the budget line.
  SQUARED_NORM:
    label: Divided by ‖p‖² instead of ‖p‖
    explanation: The distance to the line p·x = M is |p·x − M| divided by ‖p‖ = √(p₁² + p₂²). The sum p₁² + p₂² is ‖p‖²; take its square root first.
  AXIS_ONLY:
    label: Measured straight across instead of the shortest way
    explanation: Moving only along the x-axis or only along the y-axis is not the shortest way to a slanted line. The shortest route runs at a right angle to the line, along p, and has length |p·x − M|/‖p‖, which is shorter than the gap along either axis.
  VERTEX_DISTANCE:
    label: Measured to a corner of the set
    explanation: The nearest point of the boundary is usually on an edge, not at a corner. Find the distance to each edge line and take the smallest.
  IGNORED_AXES:
    label: Forgot the edges x = 0 and y = 0
    explanation: The budget set also stops at x = 0 and y = 0. A ball around a bundle with little of one good crosses an axis before it reaches the budget line, so compare all three distances and take the smallest.
  CENTRE_VALUE:
    label: Evaluated at the middle of the set
    explanation: The middle of the budget set leaves money unspent, so it cannot be the best bundle when more is better. The maximum of a utility that rises in both goods lies on the budget line.
  BOX_CORNER:
    label: Used both intercepts at once
    explanation: The bundle (M/p₁, M/p₂) costs 2M, so it is not affordable. The budget set is the triangle under the budget line, not the rectangle with sides M/p₁ and M/p₂.
  CORNER_ONLY:
    label: Checked only the corners
    explanation: For U = xy every corner of the budget set has a zero amount of some good, so U = 0 there. Weierstrass says a maximum exists, not that it is at a corner; for xy it is at the tangency point, half of income on each good.
  WRONG_VERTEX:
    label: Took the worse corner
    explanation: With a linear utility αx + βy the best bundle is the corner that spends everything on the good with the higher utility per unit of money, α/p₁ or β/p₂. Compare the values at both corners and keep the larger one.
resources:
  - { title: "Calculus Volume 3, 4.2 Limits and Continuity (OpenStax)", url: "https://openstax.org/books/calculus-volume-3/pages/4-2-limits-and-continuity", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Calculus Volume 3, 4.7 Maxima/Minima Problems (OpenStax)", url: "https://openstax.org/books/calculus-volume-3/pages/4-7-maxima-minima-problems", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "18.100A Real Analysis, Fall 2020 (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-100a-real-analysis-fall-2020/", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
Every model of choice begins with "the consumer picks the best affordable bundle" or "the planner picks the best feasible plan". Before we hunt for that best choice with calculus or Lagrange multipliers, we should know that it exists; otherwise the first-order conditions may describe a point that is not there. AN03 gave the answer for one variable: a continuous function on a closed interval $[a, b]$ has a maximum. Real choices involve many goods, so we need the same result for sets in $\mathbb{R}^n$, such as a budget set or the feasible plans of a factory. The key property is compactness: closed (no missing edges) and bounded (no escape to infinity). It explains why a budget set with positive prices always has a best bundle, why a free good can destroy that guarantee, and why economists write "at most" ($\le$) rather than "less than" ($<$) in their constraints.

## Intuition
Think of a set in the plane as a fenced field. A point is an interior point if you can draw a small circle around it that stays inside the field; it is a boundary point if every circle around it, however small, sticks out over the fence. A set is open when it contains none of its fence, only interior points, and closed when it contains its whole fence.

Why should the fence matter for choice? Suppose you want to go as far east as possible in a field whose eastern fence is not part of the field. You can get within a metre of the fence, then a centimetre, then a millimetre, but every spot can be beaten: there is no "farthest east" point. The same happens with "maximise $x$ over $0 \le x < 1$". A closed set has no such missing edge.

A field can also fail by being endless. If the field runs east for ever, again no spot is farthest east. A bounded set fits inside some big circle. A set that is both closed and bounded is compact, and on a compact set a continuous objective always reaches its best value. In a budget set, an endless direction appears exactly when some good is free: you could take as much of it as you like.

## Definition and formulas
**Distance.** For points $x, y \in \mathbb{R}^n$ the Euclidean distance is the length of their difference (LA101):
$$d(x, y) = \|x - y\| = \sqrt{(x_1 - y_1)^2 + \dots + (x_n - y_n)^2}.$$

**Open ball.** The open ball with centre $a$ and radius $r > 0$ is
$$B(a, r) = \{x \in \mathbb{R}^n : \|x - a\| < r\}.$$
In $\mathbb{R}$ it is the open interval $(a - r, a + r)$; in $\mathbb{R}^2$ it is a disc without its rim. With $\le$ instead of $<$ it is the closed ball.

**Interior and boundary points.** Let $S \subseteq \mathbb{R}^n$.
- $a$ is an interior point of $S$ if some ball $B(a, r)$ lies entirely inside $S$.
- $a$ is a boundary point of $S$ if every ball $B(a, r)$ contains points of $S$ and points outside $S$. A boundary point may or may not belong to $S$.

**Open and closed sets.**
- $S$ is open if every point of $S$ is an interior point.
- $S$ is closed if it contains all its boundary points. Equivalently, its complement $\mathbb{R}^n \setminus S$ is open. Equivalently, $S$ contains the limit of every convergent sequence of its points (its limit points, AN02): you cannot leave a closed set by taking limits.

Inequalities give a quick test. If $g$ is continuous (AN03), then $\{x : g(x) < c\}$ is open and $\{x : g(x) \le c\}$ is closed; the same holds for $>$ and $\ge$. Any intersection of closed sets is closed, and so is a union of finitely many. So strict inequalities make sets open, weak inequalities make them closed.

Open and closed are not opposites. $[0, 1)$ is neither: it misses the boundary point 1, so it is not closed, and it contains the boundary point 0, so it is not open. $\mathbb{R}^n$ and the empty set are both open and closed.

**Largest ball in a set given by linear inequalities.** The distance from a point $x$ to the line (or plane) $a \cdot y = c$ is
$$\frac{|a \cdot x - c|}{\|a\|},$$
because $a$ is at a right angle to the line and one step of length 1 along $a$ changes $a \cdot y$ by $\|a\|$. For a point inside $S = \{y : a_k \cdot y \le c_k,\ k = 1, \dots, m\}$, the largest open ball around $x$ that stays in $S$ has radius
$$r = \min_k \frac{c_k - a_k \cdot x}{\|a_k\|},$$
the distance to the nearest edge. Since $x \ge 0$ means $-x_i \le 0$, each axis is one such edge, with distance $x_i$.

**Bounded and compact sets.** $S$ is bounded if it lies inside some ball: $\|x\| \le R$ for every $x \in S$. $S$ is compact if it is closed and bounded.

The Heine–Borel theorem says that in $\mathbb{R}^n$ this is the same as the more general definition of compactness used in advanced courses. One consequence: every sequence of points of a compact set has a subsequence that converges to a point of the set (Bolzano–Weierstrass, AN02, plus closedness).

**The Weierstrass theorem.** A continuous function $f$ on a non-empty compact set $S \subseteq \mathbb{R}^n$ attains a maximum and a minimum on $S$. This generalises the extreme value theorem for $[a, b]$ (AN03).

Why it works: take points $x_k \in S$ whose values $f(x_k)$ approach the supremum of $f$ on $S$ (or grow without limit, if $f$ had no upper bound). Because $S$ is bounded, a subsequence converges; because $S$ is closed, its limit $x^*$ lies in $S$; because $f$ is continuous, $f(x^*)$ is the limit of the values along that subsequence. So the supremum is the finite number $f(x^*)$, and it is attained. Each assumption is needed:
- not closed: $f(x) = x$ on $[0, 1)$ has supremum 1 but no maximum;
- not bounded: $f(x) = x$ on $[0, \infty)$ has no maximum;
- not continuous: on $[0, 1]$ let $f(x) = x$ for $x < 1$ and $f(1) = 0$; again the supremum 1 is never reached.

The theorem only says the best point exists. Finding it is a separate job for calculus (C109, MV10) or for checking corners (OP02).

**Budget sets.** With prices $p = (p_1, \dots, p_n)$ and income $M > 0$, the budget set is
$$B(p, M) = \{x \in \mathbb{R}^n : x \ge 0,\ p \cdot x \le M\}.$$
- It is closed: it is defined by weak inequalities of continuous (linear) functions.
- If every price is positive it is bounded: $0 \le x_i \le M/p_i$ for each good, so $\|x\| \le \sqrt{(M/p_1)^2 + \dots + (M/p_n)^2}$.
- So with all prices positive it is compact, and any continuous utility has a best bundle on it.
- If some price is zero, that good is free and $x_i$ can be as large as we like: the set is closed but unbounded, not compact. With a utility that keeps rising in the free good there is no best bundle.

**Production and feasible sets.** A production set lists the input–output plans a firm can carry out. Economists assume it is closed: if every plan in a sequence is feasible, so is their limit. For example $\{(z, q) : z \ge 0,\ 0 \le q \le f(z)\}$, input $z$ and output $q$, is closed when the production function $f$ is continuous. Feasible sets of planning problems such as $\{x \ge 0 : Ax \le b\}$ (OP02) are closed for the same reason, and compact when they are also bounded.

**Convex is not the same as compact.** Convexity (MV06) is about shape: the straight line between two points of the set stays in the set. Compactness is about edges and size. The two are independent:
- a closed disc is both convex and compact;
- an open disc is convex but not closed;
- the half-plane $\{(x, y) : y \ge 0\}$ is convex and closed but unbounded;
- the circle $\{x : \|x\| = 1\}$ and a set of two points are compact but not convex.

Compactness gives existence of a best choice; convexity, together with a quasiconcave objective, helps with uniqueness and with first-order conditions.

## Interactive
::widget{id="budget-set-open-ball"}

The shaded triangle is the budget set $S = \{x \ge 0,\ y \ge 0,\ p_1 x + 4y \le 24\}$ of Examples 1 and 2. Use the sliders "Bundle: good 1, x" and "Bundle: good 2, y" to move the bundle; the gold circle is the largest open ball around it that stays in $S$. At the start, $p_1 = 3$ and the bundle is $(2, 3)$: the panel shows Largest ball r = 1.2, Bundle is interior and S is compact, as in Example 1. Move x to 1: r drops to 1, because now the edge $x = 0$ is nearest. Move x to 4: the bundle $(4, 3)$ sits on the budget line, the panel shows r = 0 and "on the boundary", and it lands on the hollow dot, the best bundle for $U = xy$ from Example 2. Finally drag "Price of good 1, p₁" down to 0: good 1 becomes free, the set turns into a strip that runs off to the right, the panel shows "not compact" and the hollow dot disappears, because $xy$ no longer has a maximum. At $(4, 3)$ the panel now shows r = 3.

## Worked examples

### Example 1 (easy): interior and boundary bundles
A consumer faces prices $p = (3, 4)$ and has income 24, so her budget set is $S = \{(x, y) : x \ge 0,\ y \ge 0,\ 3x + 4y \le 24\}$. Find the largest open ball around $(2, 3)$ that stays in $S$, do the same for $(1, 3)$, and show that $(4, 3)$ is a boundary point.

1. $3 \cdot 2 + 4 \cdot 3 = 18 < 24$, so 6 of income is left over.
   *Why:* the bundle is affordable with money to spare, so it is not on the budget line.
2. Distance to the budget line: $\dfrac{24 - 18}{\sqrt{3^2 + 4^2}} = \dfrac{6}{5} = 1.2$
   *Why:* the money gap is divided by $\|p\| = 5$, because one unit of distance along $p$ changes the cost by 5.
3. Distances to the axes are 2 and 3, so $r = \min\{2,\ 3,\ 1.2\} = 1.2$: the ball $B((2, 3), 1.2)$ lies in $S$, and $(2, 3)$ is an interior point.
   *Why:* the ball must stay on the right side of all three edges; the budget line is the nearest one.
4. For $(1, 3)$: $24 - 15 = 9$, distance to the line $9/5 = 1.8$, but the distance to the edge $x = 0$ is 1, so $r = \min\{1,\ 3,\ 1.8\} = 1$.
   *Why:* a bundle with little of good 1 hits the axis first; looking only at the budget line would give 1.8, too big.
5. $(4, 3)$ costs $12 + 12 = 24$. For any $\varepsilon > 0$ the point $(4 + \varepsilon/2,\ 3)$ lies in $B((4, 3), \varepsilon)$ and costs $24 + 1.5\varepsilon > 24$.
   *Why:* every ball around $(4, 3)$ contains unaffordable bundles (and $(4, 3)$ itself is affordable), so it is a boundary point that belongs to $S$.

```verify
p = [3, 4]
M = 24
cost1 = dot(p, [2, 3])
assert cost1 == 18
assert norm(p) == 5
d1 = (M - cost1)/norm(p)
assert abs(d1 - 1.2) < 1e-12
r1 = min(2, 3, d1)
assert abs(r1 - 1.2) < 1e-12
cost2 = dot(p, [1, 3])
assert cost2 == 15
d2 = (M - cost2)/norm(p)
assert abs(d2 - 1.8) < 1e-12
assert min(1, 3, d2) == 1
assert dot(p, [4, 3]) == 24
eps = 0.01
assert abs(dot(p, [4 + eps/2, 3]) - (24 + 1.5*eps)) < 1e-12
assert norm([eps/2, 0]) < eps
```

### Example 2 (medium): the best bundle exists, then find it
With the same budget set $S = \{(x, y) : x \ge 0,\ y \ge 0,\ 3x + 4y \le 24\}$ the consumer has utility $U(x, y) = xy$. Show that a best bundle exists, find it, and explain what changes if good 1 were free.

1. $S$ is closed: it is defined by the weak inequalities $x \ge 0$, $y \ge 0$, $3x + 4y \le 24$.
   *Why:* each weak inequality of a continuous function gives a closed set, and an intersection of closed sets is closed.
2. $S$ is bounded: $0 \le x \le 8$ and $0 \le y \le 6$, so $\|(x, y)\| \le \sqrt{8^2 + 6^2} = 10$.
   *Why:* both prices are positive, so no good can exceed income divided by its price; $S$ fits in the ball of radius 10.
3. $S$ is compact and $U$ is continuous, so $U$ has a maximum on $S$.
   *Why:* the Weierstrass theorem; it guarantees existence before we do any calculus.
4. On the budget line $y = (24 - 3x)/4$, so $U = 6x - 0.75x^2$; $U' = 6 - 1.5x = 0$ gives $x = 4$, $y = 3$ and $U = 12$.
   *Why:* if money were left over, buying a little more of either good would raise $xy$, so the best bundle spends everything. The corners give $U = 0$ and the middle of the set, $(8/3, 2)$, gives only $16/3 \approx 5.33$.
5. If $p_1 = 0$, the budget set is $\{x \ge 0,\ 0 \le y \le 6\}$, and the bundles $(n, 1)$ are affordable for every $n$, with $U = n$.
   *Why:* the set is still closed but unbounded, so Weierstrass no longer applies, and indeed utility grows without limit: there is no best bundle.

```verify
x = 4
y = (24 - 3*x)/4
assert y == 3
assert x*y == 12
assert 6 - 1.5*x == 0
assert sqrt(8^2 + 6^2) == 10
U(t) = t*(24 - 3*t)/4
assert U(4) > U(3.9) and U(4) > U(4.1)
assert abs(U(3) - (6*3 - 0.75*9)) < 1e-12
assert U(0) == 0 and U(8) == 0
assert abs((8/3)*2 - 5.33) < 0.01
assert 3*8/3 + 4*2 < 24
```

### Example 3 (hard): a strict inequality loses the best plan
A planner chooses outputs $x, y \ge 0$ of two goods. Each unit of $x$ uses 3 hours of labour and each unit of $y$ uses 4, and a rule says strictly fewer than 24 hours may be used: $T = \{(x, y) : x \ge 0,\ y \ge 0,\ 3x + 4y < 24\}$. Output is valued at $V(x, y) = 2x + y$. Does $V$ have a maximum on $T$? Compare with the rule "at most 24 hours", and with free labour for good 1.

1. The plans $(8 - \tfrac1n,\ 0)$ use $24 - \tfrac3n < 24$ hours, so they lie in $T$, and they converge to $(8, 0)$, which uses exactly 24 hours and is not in $T$.
   *Why:* a limit of points of $T$ escapes from $T$, so $T$ is not closed (and it is not compact).
2. $V(8 - \tfrac1n,\ 0) = 16 - \tfrac2n$: 14, 15.8, 15.98 for $n = 1, 10, 100$.
   *Why:* these values come as close to 16 as we like.
3. For every $(x, y) \in T$: $2x + y \le \tfrac23(3x + 4y) < \tfrac23 \cdot 24 = 16$.
   *Why:* $\tfrac23(3x + 4y) = 2x + \tfrac83 y$, which is at least $2x + y$ because $y \ge 0$. So 16 is the supremum (AN02), but no plan reaches it: there is no best plan.
4. With "at most 24 hours", $S = \{x \ge 0,\ y \ge 0,\ 3x + 4y \le 24\}$ is compact; $V$ is linear, so its maximum is at a corner: $V(8, 0) = 16$ against $V(0, 6) = 6$.
   *Why:* closing the set adds back the missing edge, and the supremum 16 becomes a maximum.
5. If good 1 needed no labour, the feasible set would be $\{x \ge 0,\ 0 \le y \le 6\}$ and $V(n, 0) = 2n$ would grow without limit.
   *Why:* that set is closed and convex but unbounded. All three sets here are convex; what decides existence is compactness, not convexity.

```verify
V(x, y) = 2*x + y
assert V(8 - 1/1, 0) == 14
assert abs(V(8 - 1/10, 0) - 15.8) < 1e-12
assert abs(V(8 - 1/100, 0) - 15.98) < 1e-12
assert 3*(8 - 1/10) + 4*0 < 24
assert 3*8 + 4*0 == 24
assert 2/3*24 == 16
# 2x + y <= (2/3)(3x + 4y) on random affordable plans
assert V(2, 3) <= 2/3*(3*2 + 4*3)
assert V(7, 0.5) <= 2/3*(3*7 + 4*0.5)
assert 3*7 + 4*0.5 < 24
assert V(8, 0) == 16
assert V(0, 6) == 6
assert V(100, 0) == 200
```

## Common mistakes
- Using the money gap $|p \cdot x - M|$ as a distance without dividing by $\|p\|$ (FORGOT_NORM).
- Dividing by $p_1^2 + p_2^2$ instead of its square root (SQUARED_NORM).
- Measuring the distance to a slanted budget line straight across along one axis (AXIS_ONLY).
- Measuring the largest ball to a corner of the set instead of to the nearest edge (VERTEX_DISTANCE).
- Forgetting that the budget set also ends at $x = 0$ and $y = 0$ (IGNORED_AXES).
- Evaluating utility at the middle of the budget set, where money is left unspent (CENTRE_VALUE).
- Treating $(M/p_1, M/p_2)$ as affordable, as if the budget set were a rectangle (BOX_CORNER).
- Checking only the corners when the utility is $xy$, which is zero at every corner (CORNER_ONLY).
- With a linear utility, picking the corner with the lower value (WRONG_VERTEX).
- Thinking "not open" means "closed": $[0, 1)$ is neither, and $\mathbb{R}^n$ is both.
- Thinking a bounded set must be compact: the open disc and $\{3x + 4y < 24,\ x, y \ge 0\}$ are bounded but not closed.
- Thinking convex sets must have a best point: a convex set can be open or unbounded, and then a continuous function may have no maximum on it.
- Reading Weierstrass the wrong way round: when a set is not compact a maximum may still exist (for example $-x^2$ on all of $\mathbb{R}$); the theorem only promises one when the set is compact.
- Applying the theorem to a budget set with a zero price: a free good makes the set unbounded.

## Practice
- `budget-line-distance` (difficulty 1): the Euclidean distance from a bundle to the budget line $p_1 x + p_2 y = M$, $|p \cdot x - M|/\|p\|$; distractors FORGOT_NORM, SQUARED_NORM, AXIS_ONLY.
- `compact-budget-max-utility` (difficulty 2): the maximum of $U = xy$ or $U = \alpha x + \beta y$ over a compact budget set, at the tangency point or the better corner; distractors CENTRE_VALUE, BOX_CORNER, CORNER_ONLY, WRONG_VERTEX.
- `budget-set-largest-ball` (difficulty 3): the radius of the largest open ball around an interior bundle that stays in the budget set, the smallest distance to the three edges; distractors FORGOT_NORM, VERTEX_DISTANCE, AXIS_ONLY, IGNORED_AXES.

## Real world
- Consumer theory: textbook demand functions exist because the budget set is compact when every price is positive. Models of goods that are free at the point of use (public parks, many digital services) must add another limit, such as time or capacity, to get a bounded choice set and a well-defined demand.
- General equilibrium theory: existence proofs for competitive equilibrium (AN05) start by checking that each consumer's budget set is compact and each firm's production set is closed, so that every agent has a best response at every price.
- Regulation and planning: rules written with strict inequalities ("emissions must be below the cap") can leave an optimisation model with no solution, so models and solvers work with weak inequalities ("at most the cap"); linear programming software assumes closed feasible sets (OP02).
- Interior versus corner solutions: whether the best bundle is an interior point or a boundary point of the budget set decides whether a consumer buys some of every good or none of some, which matters when economists estimate demand from household survey data with many zero purchases.

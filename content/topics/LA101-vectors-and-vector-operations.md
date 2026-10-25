---
id: LA101
title: Vectors and vector operations
block: LA1
coreYear: 1
prerequisites: [F01]
estMinutes: 45
status: draft
economicUses:
  - "Consumption bundles and price vectors: the cost of a basket is p·x"
  - "Budget sets {x : p·x ≤ m} in consumer theory"
  - Portfolio returns as shares of wealth times asset returns
  - Nominal and real GDP as prices times quantities of many goods
searchTerms:
  - "Vector"
  - "Dot product"
  - "Scalar product"
generators: [bundle-cost-dot-product, bundle-distance-norm, bundle-angle-cosine]
widgets: [budget-vectors]
mistakeCodes:
  SUMS_MULTIPLIED:
    label: Multiplied the totals
    explanation: Adding all the prices, adding all the quantities and multiplying the two totals pairs every price with every good. Multiply each price by the quantity of its own good, then add the products, p·x = p₁x₁ + p₂x₂ + ….
  MISSED_GOOD:
    label: Left out one good
    explanation: The dot product runs over every entry. Before adding, check that you have one product for each good; a bundle of four goods needs four products.
  ADDED_NOT_MULTIPLIED:
    label: Added prices and quantities
    explanation: A price times a quantity is the money spent on that good. A price plus a quantity mixes money with units and means nothing. Multiply matching entries, then add the products.
  NO_SQUARE_ROOT:
    label: Forgot the square root
    explanation: The sum of the squared differences is the squared distance. Take its square root to get the distance, ‖a − b‖ = √((a₁ − b₁)² + (a₂ − b₂)² + …).
  ABS_DIFFERENCES:
    label: Added the gaps instead of using Pythagoras
    explanation: Adding the gaps good by good measures a path along the axes, which is longer than the straight line between the bundles. Square each gap, add the squares and take the square root.
  NORMS_SUBTRACTED:
    label: Subtracted the lengths
    explanation: ‖a‖ − ‖b‖ only compares how big the two bundles are, not what is in them; very different bundles can have the same length. Subtract the vectors first, then find the length of a − b.
  SQUARED_NORMS:
    label: Divided by the squared lengths
    explanation: The cosine formula cos θ = a·b / (‖a‖‖b‖) uses the lengths themselves. The sum of squares a₁² + a₂² + a₃² is ‖a‖²; take its square root before dividing.
  LENGTH_AS_SUM:
    label: Used the sum of the entries as the length
    explanation: The length of a vector is √(a₁² + a₂² + a₃²), not a₁ + a₂ + a₃. The sum of the entries is the total number of units, which is not the length of the arrow.
  NORMS_ADDED:
    label: Added the lengths
    explanation: The cosine divides by the product ‖a‖ × ‖b‖, not by the sum ‖a‖ + ‖b‖. A cosine is never above 1, so an answer above 1 is a sign that the bottom of the fraction is wrong.
resources:
  - { title: "Calculus Volume 3, 2.1 Vectors in the Plane (OpenStax)", url: "https://openstax.org/books/calculus-volume-3/pages/2-1-vectors-in-the-plane", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Calculus Volume 3, 2.3 The Dot Product (OpenStax)", url: "https://openstax.org/books/calculus-volume-3/pages/2-3-the-dot-product", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "18.06SC Linear Algebra (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
A shopping basket holds many goods at once: bread, cheese, apples, bus tickets. Economists write the whole basket as one object, a list of quantities $x = (x_1, x_2, \dots, x_n)$, and all the prices as another list $p = (p_1, \dots, p_n)$. Then the cost of the basket is one short expression, $p \cdot x$, whether there are 3 goods or 3,000. The same lists describe a firm's inputs, a country's exports, or how an investor splits wealth between assets, and the rules for handling them are the start of linear algebra.

## Intuition
A vector is an ordered list of numbers. The order matters: in a bundle of (bread, cheese, apples), the first entry is always bread. Because of this, adding two bundles means adding good by good (last week's shopping plus this week's), and multiplying a bundle by 2 doubles every entry (the same shopping for two people).

With two goods, a bundle $(x_1, x_2)$ is a point in the plane, or an arrow from the origin to that point. Adding two bundles puts the arrows head to tail; the sum is the diagonal of the parallelogram they span.

The dot product pairs matching entries, multiplies each pair and adds the results. That is exactly what a till does with prices and quantities. The length of a vector comes from Pythagoras, and the length of the difference $x - y$ is the distance between two bundles. The dot product also measures how far two arrows point the same way: it is zero when they meet at a right angle. On a budget line every bundle costs the same, so stepping along the line changes the cost by zero: the price vector is at a right angle to the budget line.

## Definition and formulas
**Vectors.** A vector in $\mathbb{R}^n$ is an ordered list $x = (x_1, x_2, \dots, x_n)$ of $n$ real numbers, its entries. Two vectors are equal when every entry is equal.

**Addition and scalar multiplication** (only for vectors of the same size $n$):
- $x + y = (x_1 + y_1, \dots, x_n + y_n)$ and $x - y = (x_1 - y_1, \dots, x_n - y_n)$
- $t\,x = (t x_1, \dots, t x_n)$ for a number $t$ (a scalar)
- A **linear combination** of $a$ and $b$ is $s\,a + t\,b$ for numbers $s$ and $t$, for example a weekly order made of 5 weekday orders and 2 weekend orders, $5a + 2b$.

**Dot product.**
$$p \cdot x = p_1 x_1 + p_2 x_2 + \dots + p_n x_n = \sum_{i=1}^{n} p_i x_i$$
It is a number, not a vector. Rules: $p \cdot x = x \cdot p$, $\;p \cdot (x + y) = p \cdot x + p \cdot y$, $\;p \cdot (t x) = t\,(p \cdot x)$.
- Cost of a bundle: $p \cdot x$ with $p$ the prices and $x$ the quantities. Revenue of a firm selling $q$ at prices $p$ is $p \cdot q$.
- Portfolio return: with shares of wealth $w = (0.5, 0.3, 0.2)$ in three assets (they add up to 1) and returns $r = (4, 10, -2)$ in per cent, the portfolio earns $w \cdot r = 2 + 3 - 0.4 = 4.6$ per cent.

**Length (norm) and distance.**
$$\|x\| = \sqrt{x \cdot x} = \sqrt{x_1^2 + x_2^2 + \dots + x_n^2}, \qquad \text{distance between } x \text{ and } y = \|x - y\|$$

**Angle and orthogonality.** For non-zero vectors, $x \cdot y = \|x\|\,\|y\| \cos\theta$, so
$$\cos\theta = \frac{x \cdot y}{\|x\|\,\|y\|}$$
- $x \cdot y > 0$: the angle is acute; $x \cdot y < 0$: obtuse.
- $x \cdot y = 0$: $x$ and $y$ are **orthogonal** (at a right angle).

**Vector inequalities.** $x \ge y$ means $x_i \ge y_i$ for every $i$. Not every pair can be ranked: neither $(3, 1) \ge (1, 3)$ nor $(1, 3) \ge (3, 1)$. If $x \ge y$ and all prices are positive, then $p \cdot x \ge p \cdot y$.

**Budget set.** With prices $p$ and income $m$:
$$B = \{x \in \mathbb{R}^n : x \ge 0,\ p \cdot x \le m\}$$
With two goods its edge is the budget line $p_1 x_1 + p_2 x_2 = m$. For any two bundles $x, y$ on that line, $p \cdot (y - x) = m - m = 0$, so $p$ is orthogonal to the budget line.

## Interactive
::widget{id="budget-vectors"}

Use the sliders for good 1 and good 2 to place the bundle $x = (x_1, x_2)$; the price of good 2 is 3 and the budget is 24. The panel shows the cost $p \cdot x$, the money left $24 - p \cdot x$ and the angle between $p$ and $x$. You start at $x = (2, 3)$ with $p = (4, 3)$: the cost is 17 and 7 is left. Move to $x_1 = 3$, $x_2 = 4$: the panel shows a cost of 24 and money left 0, so the bundle sits on the budget line (as in Example 3). Then move the price of good 1: the budget line turns around the point $(0, 8)$, and the gold price arrow turns with it, always at a right angle to the line.

## Worked examples

### Example 1 (easy): the cost of a bundle
A student buys the bundle $x = (4, 1, 6)$: 4 loaves of bread, 1 piece of cheese and 6 kg of apples. The prices are $p = (2, 5, 3)$. What does the bundle cost, can she afford it with 40, and what would twice the bundle cost?

1. $p \cdot x = 2 \cdot 4 + 5 \cdot 1 + 3 \cdot 6 = 8 + 5 + 18 = 31$
   *Why:* multiply each price by the quantity of the same good, then add the spending on all goods.
2. $40 - 31 = 9 \ge 0$
   *Why:* the bundle is in the budget set when $p \cdot x \le m$; here 9 is left over.
3. $p \cdot (2x) = 2\,(p \cdot x) = 62$
   *Why:* scaling a bundle scales its cost. Check: $2x = (8, 2, 12)$ and $16 + 10 + 36 = 62$.

```verify
p = [2, 5, 3]
x = [4, 1, 6]
cost = dot(p, x)
assert cost == 31
assert 40 - cost == 9
assert dot(p, 2*x) == 62
assert dot(p, 2*x) == 2*cost
```

### Example 2 (medium): a weekly order and the gap between two orders
A café orders the bundle $a = (4, 1, 6)$ of bread, cheese and apples on each of 5 weekdays and $b = (2, 3, 5)$ on each of 2 weekend days, at prices $p = (2, 5, 3)$. Find the weekly order, its cost, and how far apart the two daily orders are.

1. $5a + 2b = (20, 5, 30) + (4, 6, 10) = (24, 11, 40)$
   *Why:* multiplying by a scalar repeats an order; adding combines two orders good by good.
2. $p \cdot (5a + 2b) = 2 \cdot 24 + 5 \cdot 11 + 3 \cdot 40 = 48 + 55 + 120 = 223$
   *Why:* the cost of the weekly order is the dot product of prices and quantities.
3. $5\,(p \cdot a) + 2\,(p \cdot b) = 5 \cdot 31 + 2 \cdot 34 = 155 + 68 = 223$
   *Why:* the dot product is linear, so the cost of a combination is the same combination of the daily costs. This is a useful check.
4. $a - b = (2, -2, 1)$, so $\|a - b\| = \sqrt{2^2 + (-2)^2 + 1^2} = \sqrt{9} = 3$
   *Why:* the distance between two bundles is the length of their difference (Pythagoras in three dimensions).

```verify
p = [2, 5, 3]
a = [4, 1, 6]
b = [2, 3, 5]
w = 5*a + 2*b
assert deepEqual(w, [24, 11, 40])
assert dot(p, w) == 223
assert dot(p, a) == 31
assert dot(p, b) == 34
assert 5*dot(p, a) + 2*dot(p, b) == 223
assert sum((a - b).^2) == 9
assert norm(a - b) == 3
```

### Example 3 (hard): the budget line, a right angle and an angle between bundles
Prices are $p = (4, 3)$ and the budget is $m = 24$. Which of the bundles $x = (3, 4)$, $y = (6, 0)$ and $z = (2, 3)$ are affordable? Show that $p$ is orthogonal to the budget line, and find the angle between $x$ and $y$.

1. $p \cdot x = 12 + 12 = 24$, $\;p \cdot y = 24 + 0 = 24$, $\;p \cdot z = 8 + 9 = 17$
   *Why:* $x$ and $y$ cost exactly the budget, so both lie on the budget line; $z$ costs less, so it is inside the budget set with 7 left over.
2. $z = (2, 3) \le (3, 4) = x$
   *Why:* $z$ has less of every good than $x$, so with positive prices it can never cost more; indeed $17 \le 24$.
3. $y - x = (3, -4)$ and $p \cdot (y - x) = 12 - 12 = 0$
   *Why:* the step from $x$ to $y$ runs along the budget line. A zero dot product means $p$ meets that step at a right angle.
4. $x \cdot y = 18$, $\;\|x\| = \sqrt{9 + 16} = 5$, $\;\|y\| = \sqrt{36} = 6$
   *Why:* these are the three ingredients of the cosine formula.
5. $\cos\theta = \dfrac{18}{5 \cdot 6} = 0.6$, so $\theta \approx 53.13^\circ$
   *Why:* dividing the dot product by both lengths leaves the cosine of the angle; the inverse cosine turns it into degrees.

```verify
p = [4, 3]
x = [3, 4]
y = [6, 0]
z = [2, 3]
assert dot(p, x) == 24
assert dot(p, y) == 24
assert dot(p, z) == 17
assert 24 - dot(p, z) == 7
assert z[1] <= x[1] and z[2] <= x[2]
assert dot(p, y - x) == 0
assert dot(x, y) == 18
assert norm(x) == 5
assert norm(y) == 6
c = dot(x, y)/(norm(x)*norm(y))
assert abs(c - 0.6) < 0.000001
assert abs(acos(c)*180/pi - 53.13) < 0.01
```

## Common mistakes
- Multiplying the total of the prices by the total of the quantities (SUMS_MULTIPLIED).
- Leaving one good out of the sum (MISSED_GOOD).
- Adding each price to its quantity instead of multiplying (ADDED_NOT_MULTIPLIED).
- Stopping at the sum of squares and forgetting the square root (NO_SQUARE_ROOT).
- Adding the gaps between two bundles instead of using Pythagoras (ABS_DIFFERENCES).
- Subtracting the lengths, $\|a\| - \|b\|$, instead of finding the length of $a - b$ (NORMS_SUBTRACTED).
- In the cosine formula, dividing by the squared lengths (SQUARED_NORMS).
- Using the sum of the entries as the length of a vector (LENGTH_AS_SUM).
- Dividing by $\|a\| + \|b\|$ instead of $\|a\| \cdot \|b\|$ (NORMS_ADDED).
- Adding vectors of different sizes, or vectors that list the goods in a different order. Fix one order of the goods first; only then do the entries match.
- Thinking that any two bundles can be ranked by $\ge$: $(3, 1)$ and $(1, 3)$ cannot, because each has more of one good.

## Practice
- `bundle-cost-dot-product` (difficulty 1): the cost $p \cdot x$ of a bundle of 3 or 4 goods; distractors SUMS_MULTIPLIED, MISSED_GOOD, ADDED_NOT_MULTIPLIED.
- `bundle-distance-norm` (difficulty 2): the distance $\|a - b\|$ between two bundles of 2 or 3 goods; distractors NO_SQUARE_ROOT, ABS_DIFFERENCES, NORMS_SUBTRACTED.
- `bundle-angle-cosine` (difficulty 3): the cosine of the angle between two bundles of three goods; distractors SQUARED_NORMS, LENGTH_AS_SUM, NORMS_ADDED.

## Real world
- Price indices: a statistics office prices the same basket of goods $q$ every month. The cost $p_t \cdot q$ at this month's prices, divided by the cost at base-year prices, tells how much the cost of living has changed.
- National accounts: nominal GDP is current prices times quantities of final goods, $p_t \cdot q_t$; real GDP values this year's quantities at base-year prices, $p_0 \cdot q_t$.
- Finance: the return on a portfolio is the dot product of the shares of wealth in each asset and the assets' returns, $w \cdot r$.
- Trade and markets: economists compare the export mixes of two countries, or the shopping baskets of two groups of households, by the cosine of the angle between the two vectors; a value near 1 means very similar patterns.

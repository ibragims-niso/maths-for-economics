---
id: MV13
title: Double integrals (introduction)
block: MV
coreYear: 2
prerequisites: [C113, MV01]
estMinutes: 45
status: draft
economicUses:
  - Total population or demand from a density map of a city or region
  - Total sales over two dimensions, such as time and a range of prices
  - Joint probabilities of two uncertain returns
  - Average density, price or yield over a region
generators: [rectangle-linear-density-total, joint-density-rectangle-probability, triangle-region-total]
widgets: [double-integral-grid]
mistakeCodes:
  POWER_NOT_DIVIDED:
    label: Did not divide by the new power
    explanation: Integrating a power raises it by one and divides by the new power, ∫x dx = x²/2 and ∫y² dy = y³/3. Leaving out the division counts every strip as if it had its largest height.
  LIMITS_SWAPPED:
    label: Put the limits on the wrong variable
    explanation: In ∫₀ᵃ∫₀ᵇ f dy dx the inner limits 0 to b belong to y (the inner dy) and the outer limits 0 to a belong to x. Read the integral from the inside out and match each pair of limits to its d-variable.
  CONSTANT_NOT_INTEGRATED:
    label: Treated an x-term as if it vanished in the y-integral
    explanation: While integrating with respect to y, x is a constant, so a term such as 3x integrates to 3xy, which is 3xb between 0 and b. Leaving it as 3x forgets that the strip has length b.
  NOT_NORMALISED:
    label: Forgot the constant k
    explanation: A joint density must integrate to 1 over all possible values. First find k from that condition, then multiply the integral over the event by k.
  AREA_NOT_PROBABILITY:
    label: Used the area as the probability
    explanation: The area of a region is its probability only when the density is the same everywhere (uniform). With a density such as 6x²y, regions where x and y are large carry more probability, so integrate the density.
  RECTANGLE_LIMITS:
    label: Used rectangle limits for a triangle
    explanation: On the triangle 0 ≤ y ≤ x ≤ a, the inner variable y only goes up to the diagonal y = x, not to a. Constant limits on both integrals cover the whole square.
  OTHER_TRIANGLE:
    label: Integrated over the wrong half of the square
    explanation: Under the line y = x means y runs from 0 up to x. Running y from x up to a covers the triangle above the diagonal instead. Draw the region before writing the limits.
  HALF_SQUARE:
    label: Halved the integral over the square
    explanation: The triangle has half the area of the square, but the integral is only half when the integrand is symmetric in x and y. In general you must integrate over the triangle itself.
resources:
  - { title: "Calculus Volume 3, 5.1 Double Integrals over Rectangular Regions (OpenStax)", url: "https://openstax.org/books/calculus-volume-3/pages/5-1-double-integrals-over-rectangular-regions", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Calculus Volume 3, 5.2 Double Integrals over General Regions (OpenStax)", url: "https://openstax.org/books/calculus-volume-3/pages/5-2-double-integrals-over-general-regions", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Multivariable Calculus 18.02SC, Part A: Double Integrals (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-02sc-multivariable-calculus-fall-2010/pages/3.-double-integrals-and-line-integrals-in-the-plane/part-a-double-integrals/", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
A city council knows how many people live per square kilometre in each part of town, from a census map. How many people live inside a planned bus route's catchment area? A delivery firm knows how many orders per square kilometre it gets in each neighbourhood: how many orders a day will a new depot serve? Both questions add up a quantity that changes from place to place over a two-dimensional region, and that is what a double integral does. The same tool gives probabilities for two uncertain quantities at once, such as the returns on two investments, which is the basis of joint distributions in statistics (ST201).

## Intuition
A single integral (C113) adds up a rate along a line: cut the interval into thin pieces, multiply rate × width, add, and let the pieces shrink. A double integral does the same over a map. Cut the region into small rectangles, take the density in each one (people per km²), multiply by the cell's area to get the number of people in it, and add over all cells. As the cells get smaller the sum settles down to one number, the double integral.

Picture the density $f(x, y)$ as a surface above the map, as in MV01. Each cell times its height is a thin column, so the double integral is the volume under the surface.

In practice nobody adds millions of cells. Instead, slice the region: fix $x$ and add up along the north–south strip at that $x$ (a single integral in $y$); this gives the total of one strip. Then add the strips from west to east (a single integral in $x$). Two ordinary integrals, one inside the other.

## Definition and formulas
**Riemann sum and double integral.** Let $R = [a, b] \times [c, d]$ be the rectangle $a \le x \le b$, $c \le y \le d$. Split it into an $n \times n$ grid of cells, each of width $\Delta x = (b - a)/n$, height $\Delta y = (d - c)/n$ and area $\Delta A = \Delta x\,\Delta y$, and pick a point $(x_i^*, y_j^*)$ in each cell, for example its centre. Then
$$\iint_R f(x, y)\,dA = \lim_{n \to \infty} \sum_{i=1}^{n}\sum_{j=1}^{n} f(x_i^*, y_j^*)\,\Delta A.$$
If $f \ge 0$, this is the volume under the surface $z = f(x, y)$ above $R$; if $f$ is a density, it is the total amount on $R$.

**Iterated integrals and Fubini's theorem.** For a continuous $f$ on a rectangle the double integral can be computed as two single integrals, in either order:
$$\iint_R f\,dA = \int_a^b\!\left(\int_c^d f(x, y)\,dy\right)dx = \int_c^d\!\left(\int_a^b f(x, y)\,dx\right)dy.$$
Work from the inside out. In the inner integral the other variable is held constant, exactly as in a partial derivative.

**Separable integrands.** If $f(x, y) = g(x)\,h(y)$ on a rectangle, the double integral is a product of two single integrals:
$$\int_a^b\!\int_c^d g(x)\,h(y)\,dy\,dx = \left(\int_a^b g(x)\,dx\right)\left(\int_c^d h(y)\,dy\right).$$
For example $\int_0^1\!\int_0^1 x^2 y\,dy\,dx = \tfrac13 \cdot \tfrac12 = \tfrac16$.

**Area and average value.** $\iint_R 1\,dA$ is the area of $R$. The average value of $f$ over $R$ is
$$\bar f = \frac{1}{\text{area of } R}\iint_R f\,dA,$$
so total = average × area. For a linear density $c + dx + ey$ the average is simply its value at the centre of the rectangle.

**Regions that are not rectangles.** If the region is $D = \{a \le x \le b,\; g_1(x) \le y \le g_2(x)\}$, the inner limits depend on $x$:
$$\iint_D f\,dA = \int_a^b\!\int_{g_1(x)}^{g_2(x)} f(x, y)\,dy\,dx.$$
The outer limits must always be numbers. For the triangle $T$ with $0 \le y \le x \le 1$ (below the diagonal of the unit square) the two orders are
$$\iint_T f\,dA = \int_0^1\!\int_0^{x} f\,dy\,dx = \int_0^1\!\int_{y}^{1} f\,dx\,dy.$$
To change the order, draw the region: for a fixed $y$, the horizontal strip inside $T$ runs from the diagonal $x = y$ to the edge $x = 1$.

**Probability preview.** Two random quantities $X$ and $Y$ (for example two returns) can be described by a joint density $f(x, y) \ge 0$ whose double integral over all possible values is 1. The probability that $(X, Y)$ lands in a region $D$ is $\iint_D f\,dA$; in particular
$$P(X \le s,\; Y \le t) = \iint_{\{x \le s,\ y \le t\}} f(x, y)\,dA.$$
ST201 builds joint distributions, covariance and correlation on this idea.

## Interactive
::widget{id="double-integral-grid"}

The map is a delivery zone $a$ km wide and 2 km deep, with orders $f(x, y) = x^2 + y$ hundred per km² per day. Move the **Cells per side n** slider to cut the zone into an $n \times n$ grid; each cell is coloured by $f$ at its centre (stronger colour = more orders). The panel shows the Riemann sum (density at each centre × cell area, added up), the exact double integral $2a^3/3 + 2a$ and the error. Check: with width $a = 3$ and $n = 2$ the panel shows a Riemann sum of 22.875, an exact value of 24 and an error of 1.125, the numbers of Example 2. Now set $n = 4$: the error drops to 0.281, a quarter of the size. Move the **Width a** slider and watch the exact total grow quickly, because the density rises with $x^2$ towards the east.

## Worked examples

### Example 1 (easy): total population of a district
A city district is a rectangle 4 km east–west and 2 km north–south. At the point $x$ km east and $y$ km north of its south-west corner the population density is $f(x, y) = 3 + x + 2y$ thousand people per km². Find the total population and the average density.

1. $\displaystyle\int_0^2 (3 + x + 2y)\,dy = \Big[3y + xy + y^2\Big]_0^2 = 6 + 2x + 4 = 10 + 2x$
   *Why:* the inner integral adds up one north–south strip at position $x$; inside it $x$ is a constant, so $x$ integrates to $xy$.
2. $\displaystyle\int_0^4 (10 + 2x)\,dx = \Big[10x + x^2\Big]_0^4 = 40 + 16 = 56$
   *Why:* adding the strips from west to east covers the whole district: 56 thousand people.
3. Other order: $\displaystyle\int_0^4 (3 + x + 2y)\,dx = 12 + 8 + 8y = 20 + 8y$, and $\displaystyle\int_0^2 (20 + 8y)\,dy = 40 + 16 = 56$
   *Why:* on a rectangle Fubini's theorem says the order does not matter, which is a useful check.
4. Average density $= 56 / (4 \times 2) = 7$ thousand per km², which equals $f(2, 1) = 3 + 2 + 2$
   *Why:* average = total ÷ area; for a linear density the average is the value at the centre $(2, 1)$.

```verify
f(x, y) = 3 + x + 2*y
inner(x) = 3*2 + 2*x + 2^2
assert inner(0) == 10
assert inner(1) == 12
total = 10*4 + 4^2
assert total == 56
other = 20*2 + 8*2^2/2
assert other == 56
# Riemann sum with cell centres on a 4 x 4 grid (exact for a linear density)
xs = [0.5, 1.5, 2.5, 3.5]; ys = [0.25, 0.75, 1.25, 1.75]
S = sum(3 + xs) * 4 * 0.5 + 4 * sum(2*ys) * 0.5
assert abs(S - 56) < 1e-9
assert total / (4*2) == 7
assert f(2, 1) == 7
```

### Example 2 (medium): orders over a zone, grid versus exact
A delivery firm's zone is 3 km east–west and 2 km north–south, and it receives $f(x, y) = x^2 + y$ hundred orders per km² per day. Estimate the total with a $2 \times 2$ grid using cell centres, then find the exact total in both orders.

1. Cells are $1.5 \times 1$ km, area $1.5$; centres $x \in \{0.75, 2.25\}$, $y \in \{0.5, 1.5\}$
   *Why:* split $[0, 3]$ and $[0, 2]$ into two equal parts each and take the midpoint of each part.
2. $f$ at the centres: $1.0625,\ 2.0625,\ 5.5625,\ 6.5625$; sum $= 15.25$; estimate $= 15.25 \times 1.5 = 22.875$
   *Why:* each cell holds about (density at its centre) × (its area) hundred orders.
3. $\displaystyle\int_0^2 (x^2 + y)\,dy = 2x^2 + 2$, then $\displaystyle\int_0^3 (2x^2 + 2)\,dx = 18 + 6 = 24$
   *Why:* inner integral in $y$ with $x$ fixed, then add the strips in $x$.
4. Other order: $\displaystyle\int_0^3 (x^2 + y)\,dx = 9 + 3y$, then $\displaystyle\int_0^2 (9 + 3y)\,dy = 18 + 6 = 24$
   *Why:* Fubini's theorem: the same total, 2400 orders a day.
5. Error of the grid: $24 - 22.875 = 1.125$; average density $24 / 6 = 4$ hundred per km²
   *Why:* the centres miss part of the curvature of $x^2$; finer grids shrink the error (the Try it widget shows this for any $n$). The average is 4, not the centre value $f(1.5, 1) = 3.25$, because the density is not linear.

```verify
f(x, y) = x^2 + y
v = [f(0.75, 0.5), f(0.75, 1.5), f(2.25, 0.5), f(2.25, 1.5)]
assert deepEqual(v, [1.0625, 2.0625, 5.5625, 6.5625])
assert sum(v) == 15.25
est = sum(v) * 1.5
assert est == 22.875
exact = 2*3^3/3 + 2*3
assert exact == 24
other = 9*2 + 3*2^2/2
assert other == 24
assert exact - est == 1.125
assert exact / 6 == 4
assert f(1.5, 1) == 3.25
```

### Example 3 (hard): two uncertain returns
$X$ and $Y$ are the fractions of their best possible return that two investment projects deliver this year, each between 0 and 1. Their joint density is $f(x, y) = k\,x^2 y$ on the unit square (0 elsewhere). Find $k$, the probability that both projects deliver at most half of their best return, and the probability that project B does no better than project A, $P(Y \le X)$.

1. $\displaystyle\int_0^1\!\int_0^1 x^2 y\,dy\,dx = \tfrac13 \cdot \tfrac12 = \tfrac16$, so $k = 6$
   *Why:* total probability must be 1; the integrand is separable, so the double integral is a product of two single integrals.
2. $P(X \le \tfrac12,\ Y \le \tfrac12) = 6 \cdot \dfrac{(1/2)^3}{3} \cdot \dfrac{(1/2)^2}{2} = 6 \cdot \tfrac{1}{24} \cdot \tfrac18 = \tfrac{1}{32} \approx 0.031$
   *Why:* integrate the density over the square $[0, \tfrac12]^2$. Its area is $\tfrac14$, but it holds only about 3 % of the probability, because the density is small where $x$ and $y$ are small.
3. $\{Y \le X\}$ is the triangle $0 \le y \le x \le 1$: $\displaystyle\int_0^{x} 6x^2 y\,dy = 6x^2 \cdot \frac{x^2}{2} = 3x^4$
   *Why:* for each $x$, $y$ runs from 0 up to the diagonal $y = x$; the inner limit depends on $x$.
4. $P(Y \le X) = \displaystyle\int_0^1 3x^4\,dx = \tfrac35 = 0.6$
   *Why:* adding up the vertical strips from $x = 0$ to $x = 1$ covers the triangle.
5. Check in the other order: $\displaystyle\int_0^1\!\int_y^1 6x^2 y\,dx\,dy = \int_0^1 2y(1 - y^3)\,dy = 1 - \tfrac25 = \tfrac35$
   *Why:* for a fixed $y$ the horizontal strip in the triangle runs from $x = y$ to $x = 1$; both orders must agree.

```verify
k = 1/((1/3)*(1/2))
assert abs(k - 6) < 1e-12
P1 = k * (0.5^3/3) * (0.5^2/2)
assert abs(P1 - 1/32) < 1e-12
assert abs(P1 - 0.031) < 0.0005
P2 = 3/5
# midpoint sum of the outer integral of 3x^4 on [0, 1]
h = 0.001
xs = 0.0005:0.001:1
assert abs(sum(3*xs.^4)*h - P2) < 1e-6
# other order: integral of 2y - 2y^4 on [0, 1]
assert abs(sum(2*xs - 2*xs.^4)*h - P2) < 1e-6
assert abs((1 - 2/5) - 0.6) < 1e-12
```

## Common mistakes
- Writing $\int x\,dx = x^2$ (or $\int y^2\,dy = y^3$) without dividing by the new power (POWER_NOT_DIVIDED).
- Putting the limits 0 to $a$ on $y$ and 0 to $b$ on $x$ in $\int_0^a\!\int_0^b f\,dy\,dx$: the inner limits belong to the inner variable (LIMITS_SWAPPED).
- In the inner integral $\int_0^b (c + dx + ey)\,dy$, leaving the term $dx$ as it is instead of $dx \cdot b$ (CONSTANT_NOT_INTEGRATED).
- Integrating $x^2 y$ instead of the density $6x^2 y$, so that the probabilities do not add up to 1 (NOT_NORMALISED).
- Giving the area $s \times t$ as $P(X \le s,\ Y \le t)$ when the density is not uniform (AREA_NOT_PROBABILITY).
- Integrating over the whole square when the region is the triangle under $y = x$ (RECTANGLE_LIMITS).
- Running $y$ from $x$ to $a$ instead of from 0 to $x$, which gives the triangle above the diagonal (OTHER_TRIANGLE).
- Halving the integral over the square because the triangle is half the square: true for the area, not for a general integrand (HALF_SQUARE).
- Putting a variable in the outer limits, such as $\int_0^x\!\int_0^1 \ldots\,dy\,dx$: the answer must be a number, so outer limits are always constants.
- Changing the order on a triangle by just swapping the integral signs: $\int_0^1\!\int_0^x f\,dy\,dx$ becomes $\int_0^1\!\int_y^1 f\,dx\,dy$, not $\int_0^x\!\int_0^1 f\,dx\,dy$.

## Practice
- `rectangle-linear-density-total` (difficulty 1): total population or orders over a rectangle $[0, a] \times [0, b]$ with linear density $c + dx + ey$; distractors POWER_NOT_DIVIDED, LIMITS_SWAPPED, CONSTANT_NOT_INTEGRATED.
- `joint-density-rectangle-probability` (difficulty 2): find $k$ for the joint density $k\,x^m y^n$ on the unit square and then $P(X \le s,\ Y \le t)$; distractors NOT_NORMALISED, AREA_NOT_PROBABILITY, POWER_NOT_DIVIDED.
- `triangle-region-total` (difficulty 3): total of $c\,x^m y^n$ over the triangle $0 \le y \le x \le a$ with variable inner limits; distractors RECTANGLE_LIMITS, OTHER_TRIANGLE, HALF_SQUARE, POWER_NOT_DIVIDED.

## Real world
- Population and catchment areas: statistics offices publish gridded population maps (people per km² cell); adding cells inside a school, hospital or bus-stop catchment is a Riemann sum of a double integral.
- Retail and delivery planning: firms model demand density over a city and integrate it over the area a new shop or depot can reach, to forecast its sales.
- Sales over time and prices: if a firm knows its sales per day for each small range of prices, the double integral over a season and a range of prices gives the total units sold in that range.
- Finance and insurance: the probability that two assets both fall, or that two insured losses both exceed a threshold, is a double integral of their joint density; this is how joint risk is priced (see ST201).

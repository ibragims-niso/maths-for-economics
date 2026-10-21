---
id: C121
title: "Curve sketching: asymptotes and the full study of a function"
block: C1
coreYear: 1
prerequisites: [C109, C119]
estMinutes: 45
status: draft
economicUses:
  - "The shape of average cost: falling while fixed cost is spread, then rising, with asymptotes at both ends"
  - "S-shaped adoption and sales curves: saturation level and the moment of fastest growth"
  - Best and worst outcomes when output, prices or budgets must stay inside limits
  - Reading a model's whole behaviour from a sketch before using it for decisions
generators: [oblique-asymptote-intercept, logistic-inflection-time, global-extremum-closed-interval]
widgets: [average-cost-asymptotes]
mistakeCodes:
  FORGOT_SHIFT:
    label: Ignored the shift in the denominator
    explanation: Dividing by q + d is not the same as dividing by q. Find m as the limit of u(q) − kq, or do the long division; the answer is b − a·d, not b.
  SIGN_SLIP:
    label: Added instead of subtracting
    explanation: In the long division, k·q(q + d) = kq² + kdq is subtracted from the top, so the q-term left over is b − kd. Check by expanding (q + d)(kq + m).
  SLOPE_NOT_INTERCEPT:
    label: Gave the slope instead of the intercept
    explanation: The asymptote is y = kq + m. The slope k comes from the leading coefficients; the question asks for the constant m.
  NO_LOG:
    label: Divided A by k without the logarithm
    explanation: The inflection point solves A·e^(−kt) = 1, so e^(kt) = A and t = ln A / k. Taking the logarithm is the step that undoes the exponential.
  MULTIPLIED_RATE:
    label: Multiplied by the growth rate
    explanation: From kt = ln A, divide by k to get t. Multiplying gives a number with the wrong units and far too small a time.
  GAVE_LEVEL:
    label: Gave the level instead of the time
    explanation: At the inflection point the share is half the saturation level, M/2, but the question asks when that happens. Solve S(t) = M/2 for t.
  LOCAL_ONLY:
    label: Took the local extremum as the global one
    explanation: A local maximum is only the highest point nearby. On a closed interval also compare the values at both ends; an end may be higher (or lower) still.
  ENDPOINT_ONLY:
    label: Checked only the ends of the interval
    explanation: The largest or smallest value can sit at a critical point inside the interval. List the critical points where f′(x) = 0 and include their values in the comparison.
  MAX_MIN_SWAPPED:
    label: Gave the smallest value for the largest
    explanation: After listing all candidate values, pick the largest for a maximum and the smallest for a minimum. Re-read which one the question asks for.
  INFLECTION_POINT:
    label: Used the inflection point
    explanation: Where f″ = 0 the curve changes from concave to convex, but f′ is not zero there, so it is not a candidate for the largest or smallest value.
resources:
  - { title: "Calculus Volume 1, 4.3 Maxima and Minima (OpenStax)", url: "https://openstax.org/books/calculus-volume-1/pages/4-3-maxima-and-minima", kind: textbook, verifiedAt: 2026-10-21 }
  - { title: "Calculus Volume 1, 4.5 Derivatives and the Shape of a Graph (OpenStax)", url: "https://openstax.org/books/calculus-volume-1/pages/4-5-derivatives-and-the-shape-of-a-graph", kind: textbook, verifiedAt: 2026-10-21 }
  - { title: "Calculus Volume 1, 4.6 Limits at Infinity and Asymptotes (OpenStax)", url: "https://openstax.org/books/calculus-volume-1/pages/4-6-limits-at-infinity-and-asymptotes", kind: textbook, verifiedAt: 2026-10-21 }
---

## Why economists need this
A picture of a function often settles an argument faster than any formula. Where does average cost bottom out, and what does it look like for very small and very large plants? When will sales of a new product grow fastest, and where do they level off? What is the best profit when output can only change within fixed limits? Each question is about the *whole shape* of a function: where it rises and falls, where it bends, where its peaks and troughs are, and which straight lines it hugs far away. This topic puts the tools of C108, C109, C119 and C120 together into one routine for studying a function and sketching its graph.

## Intuition
Read a graph like a road. The first derivative tells you whether the road climbs or descends; where it is zero you are at a summit or the bottom of a dip. The second derivative tells you how the road bends: curving up like a valley (convex) or down like a hill (concave); an inflection point is where the bend switches. Asymptotes are the straight roads the curve merges into far away or blows up along. Mark these features first and the sketch almost draws itself.

## Definition and formulas
**Increasing and decreasing.** On an interval where $f'(x) > 0$, $f$ is increasing; where $f'(x) < 0$, it is decreasing (both follow from the mean value theorem, C120). So the intervals of monotonicity are found by solving $f'(x) = 0$ (and noting where $f'$ does not exist) and checking the sign of $f'$ between these points.

**Local extrema.** A **critical point** is an $x$ where $f'(x) = 0$ or $f'$ does not exist; local extrema can only be there (Fermat).

- **First-derivative test:** if $f'$ changes from $+$ to $-$ at $c$, $f(c)$ is a local maximum; from $-$ to $+$, a local minimum; no change of sign, no extremum.
- **Second-derivative test:** if $f'(c) = 0$ and $f''(c) < 0$, local maximum; if $f''(c) > 0$, local minimum; if $f''(c) = 0$, the test says nothing.

**Largest and smallest values on a closed interval $[a, b]$.** A continuous function reaches both (C101). Find the critical points inside $(a, b)$, evaluate $f$ there **and at $a$ and $b$**, and compare. The ends matter: a firm with a capacity limit may earn most at full capacity even though its profit curve has a local peak elsewhere.

**Convexity and inflection points.** Where $f''(x) > 0$ the graph is convex (bends upwards); where $f''(x) < 0$ it is concave (C108). A point where $f''$ changes sign is an **inflection point**; $f''(c) = 0$ is necessary there but not enough ($x^4$ has $f''(0) = 0$ and no inflection).

**Asymptotes.**

- **Vertical** $x = a$: $f(x) \to \pm\infty$ as $x \to a$ from one side or both; look where a denominator is zero or a logarithm's argument tends to 0. Average cost $AC(q) = \dfrac{F}{q} + c + dq$ has $q = 0$ as a vertical asymptote.
- **Horizontal** $y = L$: $f(x) \to L$ as $x \to \infty$ or $x \to -\infty$.
- **Oblique** $y = kx + m$ (as $x \to \infty$ or $-\infty$):
$$k = \lim_{x \to \infty} \frac{f(x)}{x}, \qquad m = \lim_{x \to \infty} \big(f(x) - kx\big).$$
A horizontal asymptote is the case $k = 0$. For a ratio of polynomials whose top is one degree higher than the bottom, long division gives the asymptote directly: $AC(q) = \dfrac{F}{q} + c + dq$ approaches $y = c + dq$, because the gap $F/q$ tends to 0.

**The full study of a function, step by step.**

1. Domain, and the economically meaningful part of it.
2. Symmetry (even, odd) or periodicity, if any (F03).
3. Intercepts with the axes.
4. Asymptotes: vertical, horizontal, oblique.
5. $f'$: critical points, intervals of increase and decrease, local extrema.
6. $f''$: intervals of convexity and concavity, inflection points.
7. A short table of values at the special points.
8. Sketch: plot the special points, draw the asymptotes as dashed lines, join everything with the right rises and bends.

**The logistic curve** $S(t) = \dfrac{M}{1 + A e^{-kt}}$ ($A, k, M > 0$) describes adoption and saturation. It has the horizontal asymptotes $S = 0$ (as $t \to -\infty$) and $S = M$ (as $t \to \infty$), rises everywhere, and satisfies $S' = kS\left(1 - \dfrac{S}{M}\right)$. Growth is fastest at the inflection point, where $S = \dfrac{M}{2}$, which happens at $t = \dfrac{\ln A}{k}$; there the growth rate is $\dfrac{Mk}{4}$.

## Interactive
::widget{id="average-cost-asymptotes"}

The purple curve is average cost $AC(q) = F/q + 20 + d\,q$. Move **Fixed cost F** and **Slope d of the variable cost**. Near $q = 0$ the curve shoots up along the vertical axis, its vertical asymptote; far to the right it hugs the dashed gold line $y = 20 + dq$, its oblique asymptote, and the green bar at $q = 20$ shows the gap $F/q$ that is left. The dot marks the lowest average cost. At the start ($F = 200$, $d = 2$) the panel shows a lowest average cost of 60 at output 10 and a gap of 10 at $q = 20$. Raise $F$ and the bottom moves right and up; raise $d$ and the asymptote gets steeper.

## Worked examples

### Example 1 (easy): asymptotes of a unit cost curve
A firm's cost per order is $u(q) = \dfrac{2q^2 + 3q + 5}{q + 1}$ for order size $q$. Find its asymptotes. Then find those of $AC(q) = \dfrac{200}{q} + 20 + 2q$ and its lowest point.

1. $q + 1 = 0$ at $q = -1$, and the top is $4 \ne 0$ there, so $q = -1$ is a vertical asymptote.
   *Why:* near $q = -1$ the denominator is tiny and the numerator is not, so $u$ blows up. It lies outside the economic domain $q \ge 0$, so the business curve never meets it.
2. $k = \lim\limits_{q \to \infty} \dfrac{2q^2 + 3q + 5}{q(q + 1)} = 2$
   *Why:* the slope of an oblique asymptote is the limit of $u(q)/q$; both are quadratics, so take the ratio of leading coefficients (C119).
3. $m = \lim\limits_{q \to \infty} \left(u(q) - 2q\right) = \lim \dfrac{q + 5}{q + 1} = 1$, so the asymptote is $y = 2q + 1$.
   *Why:* subtract the line and put everything over $q + 1$: $2q^2 + 3q + 5 - 2q(q + 1) = q + 5$. Long division agrees: $u(q) = 2q + 1 + \dfrac{4}{q + 1}$.
4. $AC$ has the vertical asymptote $q = 0$ and the oblique asymptote $y = 20 + 2q$; $AC'(q) = -\dfrac{200}{q^2} + 2 = 0$ at $q = 10$, where $AC = 20 + 20 + 20 = 60$.
   *Why:* the fixed cost per unit $200/q$ explodes near 0 and fades for large $q$; in between, the lowest point is where the falling fixed part and the rising variable part balance.

```verify
u(q) = (2*q^2 + 3*q + 5)/(q + 1)
assert abs(u(7) - (2*7 + 1 + 4/(7 + 1))) < 0.000001
assert abs(u(10^7) - 2*10^7 - 1) < 0.001
AC(q) = 200/q + 20 + 2*q
assert AC(10) == 60
assert AC(9) > 60 and AC(11) > 60
```

### Example 2 (medium): when does adoption grow fastest?
The share of households (in %) using a new payment app $t$ years after launch is $S(t) = \dfrac{100}{1 + 49e^{-0.5t}}$. Describe its asymptotes, and find when adoption grows fastest and how fast.

1. $S(0) = \dfrac{100}{50} = 2$; as $t \to \infty$, $e^{-0.5t} \to 0$ and $S \to 100$; as $t \to -\infty$, $S \to 0$.
   *Why:* the horizontal asymptotes $S = 0$ and $S = 100$ are the "before" and "saturation" levels; the curve starts at 2 % at launch.
2. $S'(t) = 0.5\,S\left(1 - \dfrac{S}{100}\right) > 0$
   *Why:* the logistic curve always rises; its slope is a parabola in $S$, largest at $S = 50$, half the saturation level.
3. $S = 50 \iff 49e^{-0.5t} = 1 \iff t = \dfrac{\ln 49}{0.5} = 7.78$ years
   *Why:* the inflection point is where the bracket $1 + 49e^{-0.5t}$ equals 2; take logs and divide by $k = 0.5$.
4. Fastest growth $= \dfrac{Mk}{4} = \dfrac{100 \cdot 0.5}{4} = 12.5$ percentage points a year.
   *Why:* put $S = 50$ into $S' = 0.5 \cdot 50 \cdot (1 - 0.5)$. Before year 7.78 the curve is convex (growth speeding up), after it concave (growth slowing down).

```verify
S(t) = 100/(1 + 49*exp(-0.5*t))
t0 = log(49)/0.5
assert abs(t0 - 7.78) < 0.005
assert abs(S(t0) - 50) < 0.000001
assert abs((S(t0 + 0.0001) - S(t0 - 0.0001))/0.0002 - 12.5) < 0.0001
assert S(0) == 2
```

### Example 3 (hard): the full study on a closed interval
A firm's profit (thousand manat) when output differs from the plan by $x$ hundred units is $f(x) = x^3 - 12x + 5$, and only $-3 \le x \le 5$ is possible. Study $f$ and find its largest and smallest values.

1. $f'(x) = 3x^2 - 12 = 0$ at $x = -2$ and $x = 2$.
   *Why:* the critical points; both lie inside $[-3, 5]$.
2. $f' > 0$ on $[-3, -2)$, $f' < 0$ on $(-2, 2)$, $f' > 0$ on $(2, 5]$
   *Why:* test one point in each piece, for example $f'(0) = -12$. So $f$ rises, falls, then rises again: a local maximum at $-2$ and a local minimum at $2$.
3. $f''(x) = 6x$: concave for $x < 0$, convex for $x > 0$, inflection at $(0, 5)$.
   *Why:* $f''$ changes sign at 0; this agrees with the second-derivative test, $f''(-2) = -12 < 0$ and $f''(2) = 12 > 0$.
4. $f(-3) = 14$, $f(-2) = 21$, $f(2) = -11$, $f(5) = 70$
   *Why:* the candidates for the largest and smallest values are the critical points and both ends.
5. Largest value 70 at $x = 5$; smallest value $-11$ at $x = 2$.
   *Why:* the local maximum 21 is beaten by the right end: on this range the firm does best at the upper limit, not at the local peak.

```verify
f(x) = x^3 - 12*x + 5
assert f(-3) == 14
assert f(-2) == 21
assert f(2) == -11
assert f(5) == 70
assert f(0) == 5
assert max(f(-3), f(-2), f(2), f(5)) == 70
assert min(f(-3), f(-2), f(2), f(5)) == -11
```

## Common mistakes
- Ignoring the $+d$ in the denominator when finding an oblique asymptote (FORGOT_SHIFT).
- Adding $a d$ instead of subtracting it in the long division (SIGN_SLIP).
- Giving the slope of the asymptote when the question asks for its intercept (SLOPE_NOT_INTERCEPT).
- Writing $t = A/k$ instead of $t = \ln A / k$ (NO_LOG).
- Multiplying by the growth rate instead of dividing (MULTIPLIED_RATE).
- Giving the level $M/2$ instead of the time it is reached (GAVE_LEVEL).
- Taking a local maximum or minimum as the global one without checking the ends (LOCAL_ONLY).
- Checking only the ends and missing a critical point inside (ENDPOINT_ONLY).
- Reporting the smallest value when the question asks for the largest, or the other way round (MAX_MIN_SWAPPED).
- Using the inflection point as a candidate for an extremum (INFLECTION_POINT).
- Concluding that $f''(c) = 0$ means an inflection point without checking that $f''$ changes sign.

## Practice
- `oblique-asymptote-intercept` (difficulty 1): the intercept $m$ of the oblique asymptote of $\dfrac{aq^2 + bq + c}{q + d}$; distractors FORGOT_SHIFT, SIGN_SLIP, SLOPE_NOT_INTERCEPT.
- `logistic-inflection-time` (difficulty 2): when an S-shaped adoption curve grows fastest; distractors NO_LOG, MULTIPLIED_RATE, GAVE_LEVEL.
- `global-extremum-closed-interval` (difficulty 3): the largest or smallest value of a cubic on a closed interval; distractors LOCAL_ONLY, ENDPOINT_ONLY, MAX_MIN_SWAPPED, INFLECTION_POINT.

## Real world
- Cost curves: the U-shaped average cost curve, falling while fixed cost is spread over more units and rising when variable costs per unit climb, is the textbook picture behind the idea of an efficient plant size.
- Technology diffusion: the spread of tractors, television, mobile phones and internet access has often followed an S-shaped curve; analysts fit logistic curves to early data to estimate the saturation level and the year of fastest growth.
- Capacity limits: when output, a budget or a price is restricted to a range, the best choice is often at a limit of the range, which is why planners compare critical points with the ends.
- Model checking: sketching a fitted function over its whole domain, asymptotes included, reveals impossible predictions (negative sales, unlimited growth) before the model is used.

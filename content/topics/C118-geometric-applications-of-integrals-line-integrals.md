---
id: C118
title: "Geometric applications of integrals; line integrals"
block: C1
coreYear: 1
prerequisites: [C113]
estMinutes: 45
status: draft
economicUses:
  - Storage capacity of tanks, silos and grain hoppers
  - Length of a road, pipeline or cable that follows a curved route
  - Total cost of a route when the cost per km changes from place to place
  - "Welfare change when several prices change at once: a line integral that can depend on the path"
generators: [volume-of-revolution-disc, line-integral-work-segment, arc-length-three-halves-power]
widgets: [tank-volume-discs]
mistakeCodes:
  NO_PI:
    label: Forgot π
    explanation: Each slice is a disc with area πr², so the volume is π times the integral of f(x)². Keep π outside the integral and multiply at the end.
  NOT_SQUARED:
    label: Did not square the radius
    explanation: The area of a disc is πr², not πr. Integrate f(x)², the squared height of the curve, not f(x) itself.
  TWO_PI:
    label: Used 2π instead of π
    explanation: 2πr is the circumference of a circle, not its area. The disc method uses the area πr², so the factor in front is π.
  SUBTRACT_BEFORE_SQUARING:
    label: Squared the difference of the radii
    explanation: A washer is a big disc minus a small one, so its area is πR² − πr². Squaring (R − r) gives a different, smaller number. Square each radius first, then subtract.
  INTEGRATED_F:
    label: Integrated the curve, not the length element
    explanation: The integral of f(x) is an area under the curve, not a length. Arc length integrates √(1 + f′(x)²), the length of a tiny piece of the curve per unit of x.
  CHORD_ONLY:
    label: Measured the straight line between the end points
    explanation: The straight chord from start to end is shorter than any curved route between them. Use the arc length integral to follow the bends.
  NO_SQUARE_ROOT:
    label: Left out the square root
    explanation: By Pythagoras a tiny piece of the curve has length √(dx² + dy²) = √(1 + f′(x)²) dx. Integrating 1 + f′(x)² without the root gives a number with the wrong units and the wrong size.
  SUBSTITUTION_FACTOR:
    label: Forgot to divide by the inner derivative
    explanation: Differentiating (1 + cx)^(3/2) gives (3/2)·c·(1 + cx)^(1/2). The antiderivative of √(1 + cx) is therefore (2/(3c))(1 + cx)^(3/2), with c in the denominator.
  FORGOT_SPEED:
    label: Used dt instead of ds
    explanation: In a line integral of the first kind, ds is a piece of length along the curve, ds = √(x′(t)² + y′(t)²) dt. Without this factor you add values per unit of t, not per km.
  REVERSED_PATH:
    label: Went along the path the wrong way
    explanation: A line integral of the second kind changes sign when the direction is reversed. Start the parametrisation at the starting point A (t = 0) and end at B (t = 1).
  MISSING_DX_DT:
    label: Left out dx/dt and dy/dt
    explanation: After substituting x(t) and y(t), dx becomes x′(t) dt and dy becomes y′(t) dt. Multiply P by x′(t) and Q by y′(t) before integrating over t.
  FORCE_AT_START:
    label: Treated the field as constant
    explanation: The field changes from point to point along the path. Using its value at the starting point only is right for a constant field; otherwise integrate along the whole path.
resources:
  - { title: "Calculus Volume 1, 6.2 Determining Volumes by Slicing (OpenStax)", url: "https://openstax.org/books/calculus-volume-1/pages/6-2-determining-volumes-by-slicing", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Calculus Volume 1, 6.4 Arc Length of a Curve and Surface Area (OpenStax)", url: "https://openstax.org/books/calculus-volume-1/pages/6-4-arc-length-of-a-curve-and-surface-area", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Calculus Volume 3, 6.2 Line Integrals (OpenStax)", url: "https://openstax.org/books/calculus-volume-3/pages/6-2-line-integrals", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
A farm co-operative plans a new grain silo and needs to know how much it holds; a utility company prices a pipeline whose route bends around hills; a cable operator pays more per km in rocky ground than in soft soil. Each question asks for a total that a definite integral can give: a volume, a length, or a cost added up along a route.

To be honest about it: this topic is in many national syllabuses for economics degrees, but economists use it far less than areas and accumulated flows (C113), consumer surplus (C114) or discounting (C116). Volumes and lengths turn up in practical cost estimates; line integrals turn up in physics and, more rarely, in welfare theory.

## Intuition
All the formulas here come from one idea you already know from areas: cut the object into thin pieces whose size you can work out, then let the integral add them up.

- **Volume.** A tank shaped by spinning a curve around the $x$-axis can be sliced like a loaf of bread. Each slice is a thin disc whose radius is the height of the curve there. Disc volume is area × thickness, $\pi r^2\,dx$; add the discs and you have the volume.
- **Length.** Zoom in on a curved road and a tiny piece looks straight. If it moves $dx$ across and $dy$ up, Pythagoras says its length is $\sqrt{dx^2 + dy^2}$. Add all the pieces.
- **Line integral of the first kind.** Walk along the route and, on each tiny piece, multiply its length by a value that depends on where you are, such as the cost per km. Adding these gives the total cost of the route.
- **Line integral of the second kind.** A force (wind, a current, a slope) pushes on a load as it moves. Only the part of the force pointing along the movement does work, so you add force × movement, $P\,dx + Q\,dy$. Going the other way round turns help into hindrance, so the sign flips.

## Definition and formulas
**Area between curves** (from C113). If $f(x) \ge g(x)$ on $[a, b]$, the area between them is
$$A = \int_a^b \big(f(x) - g(x)\big)\,dx.$$

**Volume of a solid of revolution: discs.** Rotating $y = f(x) \ge 0$, $a \le x \le b$, about the $x$-axis gives a solid of volume
$$V = \pi \int_a^b f(x)^2\,dx.$$

**Washers.** Rotating the region between an outer curve $R(x)$ and an inner curve $r(x)$, with $R(x) \ge r(x) \ge 0$, gives a solid with a hole in it. Each slice is a disc of radius $R$ minus a disc of radius $r$:
$$V = \pi \int_a^b \big(R(x)^2 - r(x)^2\big)\,dx.$$

**Arc length.** If $f$ has a continuous derivative on $[a, b]$, the length of the curve $y = f(x)$ from $x = a$ to $x = b$ is
$$L = \int_a^b \sqrt{1 + f'(x)^2}\,dx.$$
Check with a straight line $y = mx + c$: then $f'(x) = m$ and $L = (b - a)\sqrt{1 + m^2}$, exactly the Pythagoras distance between the end points. Only a few curves give an integral you can do by hand, such as $y = kx^{3/2}$, where $1 + f'(x)^2 = 1 + \tfrac{9k^2}{4}x$; for other curves a computer adds up the pieces.

**Curves given by a parameter.** A route $C$ can be described by $x = x(t)$, $y = y(t)$ for $\alpha \le t \le \beta$. A tiny piece of it has length
$$ds = \sqrt{x'(t)^2 + y'(t)^2}\,dt.$$
**Polar coordinates.** A point can also be located by its distance $r$ from the origin and its angle $\varphi$, with $x = r\cos\varphi$ and $y = r\sin\varphi$. A curve $r = r(\varphi)$ and the two rays $\varphi = \alpha$ and $\varphi = \beta$ cut out a fan-shaped region, a **curvilinear sector**. Cutting it into thin slices that are nearly triangles of area $\tfrac12 r^2\,d\varphi$ gives
$$S = \frac12 \int_{\alpha}^{\beta} r(\varphi)^2\,d\varphi, \qquad L = \int_{\alpha}^{\beta} \sqrt{r(\varphi)^2 + r'(\varphi)^2}\,d\varphi$$
for its area and for the length of the curve. Check with a circle $r = a$: the area is $\tfrac12 a^2 \cdot 2\pi = \pi a^2$ and the length is $2\pi a$.
The straight segment from $A = (x_A, y_A)$ to $B = (x_B, y_B)$ is $x = x_A + t(x_B - x_A)$, $y = y_A + t(y_B - y_A)$ for $0 \le t \le 1$, and then $ds = |AB|\,dt$, where $|AB|$ is the length of the segment.

**Line integral of the first kind** (of a function $g$ along $C$):
$$\int_C g(x, y)\,ds = \int_\alpha^\beta g\big(x(t), y(t)\big)\sqrt{x'(t)^2 + y'(t)^2}\,dt.$$
With $g$ = cost per km it is the total cost of the route; with $g = 1$ it is the length of $C$. The direction of travel does not matter.

**Line integral of the second kind** (work of a field $\mathbf{F} = (P, Q)$ along $C$):
$$\int_C P\,dx + Q\,dy = \int_\alpha^\beta \Big(P\big(x(t), y(t)\big)\,x'(t) + Q\big(x(t), y(t)\big)\,y'(t)\Big)\,dt.$$
Reversing the direction of $C$ changes the sign of the answer.

**Path independence.** If there is a function $\varphi(x, y)$ whose partial derivatives (MV02) are $P$ and $Q$, the work depends only on the end points, $\int_C P\,dx + Q\,dy = \varphi(B) - \varphi(A)$, whichever route joins $A$ to $B$.

## Interactive
::widget{id="tank-volume-discs"}

The lilac curves are the wall of the tank from Example 1, $y = 2\sqrt{x}$, and its mirror image. Move **Tank length b** to make the tank longer or shorter, and **Number of discs n** to cut it into more, thinner slices. The panel shows the total volume of the discs, the exact volume $2\pi b^2$ from the integral, and the length of the curved wall. Check: at $b = 4$ with 8 discs the discs hold 87.96 m³ and the exact volume is 100.53 m³; the gap, 12.57 m³, is exactly one eighth of the exact volume, and it shrinks as you add discs. The wall is 5.92 m long, a little more than the straight chord from the tip to the rim, $\sqrt{32} \approx 5.66$ m.

## Worked examples

### Example 1 (easy): how much does the tank hold?
The inside of a storage tank is the solid formed by rotating $y = 2\sqrt{x}$, $0 \le x \le 4$ (metres), about the $x$-axis. Find its volume. Then a second design adds a solid cone inside, shaped by rotating $y = x$; find the storage space left between the cone and the wall.

1. $f(x)^2 = (2\sqrt{x})^2 = 4x$
   *Why:* the slice at $x$ is a disc of radius $f(x)$, and its area is $\pi f(x)^2$.
2. $\displaystyle\int_0^4 4x\,dx = \big[2x^2\big]_0^4 = 32$
   *Why:* adding the discs, each of thickness $dx$, is the definite integral of the squared radius.
3. $V = 32\pi \approx 100.53$ m³
   *Why:* $\pi$ was kept outside the integral and is put back at the end.
4. The cone $y = x$ meets the wall where $x = 2\sqrt{x}$, at $x = 0$ and $x = 4$, and lies inside it in between. Washers: $V = \pi\displaystyle\int_0^4 \big(4x - x^2\big)\,dx = \pi\Big(32 - \tfrac{64}{3}\Big) = \tfrac{32\pi}{3} \approx 33.51$ m³
   *Why:* each slice is a disc of radius $2\sqrt{x}$ with a hole of radius $x$, so square each radius and subtract.

```verify
k = 2; b = 4
inner = k^2 * b^2 / 2
V = pi * inner
assert inner == 32
assert abs(V - 100.53) < 0.005
# the cone y = x meets the wall y = 2 sqrt(x) at x = 4
assert 2 * sqrt(b) == b
Vw = pi * (2 * b^2 - b^3 / 3)
assert abs(Vw - 32 * pi / 3) < 1e-9
assert abs(Vw - 33.51) < 0.005
```

### Example 2 (medium): length and cost of a road
On a map in km, a new road follows $y = \tfrac{2}{3}x^{3/2}$ from $x = 0$ to $x = 3$. Paving costs 1.2 million per km. How long is the road, what does it cost, and how far off is an estimate that uses the straight line between the end points?

1. $y' = x^{1/2} = \sqrt{x}$, so $1 + (y')^2 = 1 + x$
   *Why:* the arc length formula needs the slope of the road, squared.
2. $L = \displaystyle\int_0^3 \sqrt{1 + x}\,dx = \Big[\tfrac{2}{3}(1 + x)^{3/2}\Big]_0^3 = \tfrac{2}{3}(8 - 1) = \tfrac{14}{3} \approx 4.67$ km
   *Why:* the derivative of $(1 + x)^{3/2}$ is $\tfrac{3}{2}(1 + x)^{1/2}$, so multiply by $\tfrac{2}{3}$; then use the Fundamental Theorem.
3. Cost $= \tfrac{14}{3} \times 1.2 = 5.6$ million
   *Why:* the cost per km is the same everywhere, so total cost is length × cost per km.
4. The road ends at $(3, 2\sqrt{3}) \approx (3, 3.46)$; the straight line has length $\sqrt{9 + 12} = \sqrt{21} \approx 4.58$ km, which would put the cost at about 5.50 million.
   *Why:* a straight chord is always shorter than a curve between the same points, so it underestimates the cost.

```verify
b = 3
L = (2/3) * ((1 + b)^(3/2) - 1)
assert abs(L - 14/3) < 1e-12
assert abs(L - 4.67) < 0.005
cost = L * 1.2
assert abs(cost - 5.6) < 1e-9
yEnd = (2/3) * b^(3/2)
assert abs(yEnd - 2 * sqrt(3)) < 1e-12
chord = sqrt(b^2 + yEnd^2)
assert abs(chord - sqrt(21)) < 1e-12
assert abs(chord - 4.58) < 0.005
assert abs(chord * 1.2 - 5.50) < 0.005
assert chord < L
```

### Example 3 (hard): two line integrals along a pipeline
A pipeline runs straight from $A = (0, 0)$ to $B = (6, 8)$, in km. (a) Laying it costs $c(x, y) = 20 + 3x + y$ thousand per km, because the ground gets rockier to the north-east. Find the total cost. (b) On the same route, a force field $\mathbf{F}(x, y) = (y, x)$ acts on the pipe-laying machine. Find the work $\int_C y\,dx + x\,dy$ along the segment, and again along the curved route $y = \tfrac{2}{9}x^2$ from $A$ to $B$.

1. $x = 6t,\; y = 8t,\; 0 \le t \le 1$, so $ds = \sqrt{6^2 + 8^2}\,dt = 10\,dt$
   *Why:* the segment has length 10 km, and $t$ runs from 0 at $A$ to 1 at $B$.
2. Cost $= \displaystyle\int_0^1 (20 + 18t + 8t)\cdot 10\,dt = 10\,(20 + 13) = 330$ thousand
   *Why:* this is a line integral of the first kind: cost per km at each point × length of each piece.
3. Work on the segment: $dx = 6\,dt$, $dy = 8\,dt$, so $\displaystyle\int_0^1 (8t \cdot 6 + 6t \cdot 8)\,dt = \int_0^1 96t\,dt = 48$
   *Why:* a line integral of the second kind multiplies $P$ by $dx$ and $Q$ by $dy$ along the path.
4. On the curve $y = \tfrac{2}{9}x^2$ use $x$ as the parameter: $dy = \tfrac{4}{9}x\,dx$, so $\displaystyle\int_0^6 \Big(\tfrac{2}{9}x^2 + \tfrac{4}{9}x^2\Big)dx = \int_0^6 \tfrac{2}{3}x^2\,dx = 48$
   *Why:* the curve passes through $(6, 8)$ because $\tfrac{2}{9} \cdot 36 = 8$, so it joins the same two points.
5. Both routes give 48 because $(y, x)$ has the potential $\varphi = xy$: $\varphi(6, 8) - \varphi(0, 0) = 48$.
   *Why:* when such a $\varphi$ exists the work depends only on the end points. The cost in part (a) does depend on the route.

```verify
xB = 6; yB = 8
speed = sqrt(xB^2 + yB^2)
assert speed == 10
# cost integrand: (20 + 3*6t + 8t) * 10, whose integral over [0, 1] is 10 * (20 + 26/2)
cost = speed * (20 + (3 * xB + yB) / 2)
assert cost == 330
Wseg = (yB * xB + xB * yB) / 2
assert Wseg == 48
assert abs((2/9) * xB^2 - yB) < 1e-12
Wpar = (2/3) * xB^3 / 3
assert abs(Wpar - 48) < 1e-9
assert xB * yB == 48
```

## Common mistakes
- Forgetting $\pi$ in the disc formula (NO_PI).
- Integrating $f(x)$ instead of $f(x)^2$ for a volume (NOT_SQUARED).
- Using $2\pi$, the circumference factor, instead of $\pi$ (TWO_PI).
- For washers, squaring $R - r$ instead of computing $R^2 - r^2$ (SUBTRACT_BEFORE_SQUARING).
- Integrating the curve itself, which gives an area, when a length is asked (INTEGRATED_F).
- Measuring the straight line between the end points instead of the curve (CHORD_ONLY).
- Dropping the square root in $\sqrt{1 + f'(x)^2}$ (NO_SQUARE_ROOT).
- Forgetting to divide by the inner derivative when integrating $\sqrt{1 + cx}$ (SUBSTITUTION_FACTOR).
- Writing $dt$ instead of $ds$ in a line integral of the first kind (FORGOT_SPEED).
- Parametrising from $B$ to $A$, which flips the sign of the work (REVERSED_PATH).
- Substituting $x(t)$ and $y(t)$ but leaving out the factors $x'(t)$ and $y'(t)$ (MISSING_DX_DT).
- Using the force at the starting point as if it were the same all along the path (FORCE_AT_START).
- Expecting a negative volume when the curve lies below the $x$-axis: the disc method squares $f(x)$, so every slice adds a positive amount.

## Practice
- `volume-of-revolution-disc` (difficulty 1): volume of a tank or hopper formed by rotating $y = k\sqrt{x}$ or $y = kx$ on $[0, b]$ about the $x$-axis; distractors NO_PI, NOT_SQUARED, TWO_PI.
- `line-integral-work-segment` (difficulty 2): work $\int_C P\,dx + Q\,dy$ of a linear force field along a straight segment from $A$ to $B$; distractors REVERSED_PATH, MISSING_DX_DT, FORCE_AT_START.
- `arc-length-three-halves-power` (difficulty 3): length of the road $y = \tfrac{2m}{3}x^{3/2}$ between two values of $x$; distractors INTEGRATED_F, CHORD_ONLY, NO_SQUARE_ROOT, SUBSTITUTION_FACTOR.

## Real world
- Storage: the capacity of silos, fuel tanks, water towers and grain hoppers is a volume of revolution. Firms that rent out storage, and regulators that check strategic reserves of grain or fuel, work with these volumes.
- Infrastructure costs: early cost estimates for roads, railways, pipelines and power lines start from the length of the planned route. When the cost per km changes with terrain or land prices, the total is a line integral of the first kind; planners compare candidate routes this way.
- Welfare economics: when several prices change at once, the change in consumer surplus is a line integral of the demand functions along the path of prices. Different paths can give different answers unless the cross-price effects are symmetric, which is why economists prefer measures that do not depend on the path.
- Where it is used less: most later economics uses integrals for accumulated flows over time and for probabilities (C113–C116, MV13), not for volumes or curve lengths, so treat this topic as a toolkit for occasional practical questions.

---
id: DY04
title: Second-order differential equations
block: DY
coreYear: 3
prerequisites: [DY03]
estMinutes: 50
status: draft
economicUses:
  - "Price dynamics when buyers and sellers react to the trend of a price: overshooting and damped cycles"
  - "Inventory and business cycles: does a disturbance die out smoothly, cycle, or explode?"
  - "Stability checks for continuous-time models from the signs of two coefficients"
  - "Inflation and unemployment dynamics when expectations adapt to experience"
searchTerms:
  - "Second-order ODE"
  - "Characteristic equation"
generators: [second-order-steady-or-root, second-order-ode-value-at-time, damped-cycle-period]
widgets: [second-order-damping]
mistakeCodes:
  WRONG_COEFFICIENT:
    label: Divided by a₁ instead of a₂
    explanation: At rest the variable is constant, so y′ = y″ = 0 and only a₂y is left on the left-hand side. The steady state is y* = b/a₂; a₁ multiplies y′, which is zero there.
  DISCRETE_FORMULA:
    label: Used the steady state of a difference equation
    explanation: b/(1 + a₁ + a₂) is the steady state of y(t+2) + a₁y(t+1) + a₂y(t) = b, where every term contains y. In the differential equation the derivatives vanish at rest, so y* = b/a₂.
  FASTER_ROOT:
    label: Took the root further from zero
    explanation: Both terms die out, but e^(rt) with the more negative root vanishes first. In the long run the gap shrinks like the term whose root is closer to zero, so that root sets the speed of convergence.
  ROOT_SIGN:
    label: Lost the minus sign of the root
    explanation: r² + a₁r + a₂ = (r + m)(r + n) has roots −m and −n, not m and n. With a₁ and a₂ positive both roots are negative, which is why the path settles.
  DROPPED_CONSTANT:
    label: Left a₂ out of the characteristic equation
    explanation: The characteristic equation is r² + a₁r + a₂ = 0. Without a₂ it becomes r(r + a₁) = 0, whose roots 0 and −a₁ belong to a different equation.
  NO_PARTICULAR:
    label: Left out the steady state when fitting A and B
    explanation: The solution is y(t) = y* + Ae^(r₁t) + Be^(r₂t). At t = 0 this gives A + B = y(0) − y*, not y(0); and y* must be added back at the end.
  SWAPPED_CONSTANTS:
    label: Attached A and B to the wrong roots
    explanation: A goes with e^(r₁t) and B with e^(r₂t), exactly as they were paired in y′(0) = r₁A + r₂B. Swapping them gives a path that does not meet the starting slope.
  ONE_ROOT:
    label: Used only one root
    explanation: A second-order equation needs two terms, one for each root, so that both y(0) and y′(0) can be met. A single exponential y* + (y(0) − y*)e^(rt) is the first-order solution and ignores the starting slope.
  IGNORED_DAMPING:
    label: Used 2π/√a₂ as the period
    explanation: √a₂ is the frequency only when a₁ = 0. With damping the roots are h ± ki with k = √(4a₂ − a₁²)/2, which is smaller than √a₂, so the cycle is slower and lasts T = 2π/k.
  FREQUENCY_NOT_PERIOD:
    label: Gave k instead of the period
    explanation: k is how many radians the cycle turns per unit of time. One full cycle needs 2π radians, so it takes T = 2π/k units of time.
  DISCRIMINANT_NOT_HALVED:
    label: Forgot to divide by 2 in the quadratic formula
    explanation: The roots are (−a₁ ± √(a₁² − 4a₂))/2, so the imaginary part is k = √(4a₂ − a₁²)/2. Forgetting the 2 doubles k and halves the period.
resources:
  - { title: "Calculus Volume 3, 7.1 Second-Order Linear Equations (OpenStax)", url: "https://openstax.org/books/calculus-volume-3/pages/7-1-second-order-linear-equations", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Calculus Volume 3, 7.3 Applications (OpenStax)", url: "https://openstax.org/books/calculus-volume-3/pages/7-3-applications", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Differential Equations, 18.03SC (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
In DY03 a price glided towards its equilibrium and never overshot. Real markets often do overshoot: house prices boom and then fall below their long-run level, stocks of goods pile up and are then run down too far, inflation falls below target before it settles. Behaviour like this needs memory of the *trend*: buyers and sellers react not only to the price but to how fast it is changing. Once the rate of change matters, the second derivative enters the model and the equation becomes second order. Solving it tells us whether a disturbance dies out smoothly, dies out in shrinking cycles, or explodes, and how long each cycle lasts. The same mathematics appears in models of inflation and unemployment in which people's expectations adapt to the inflation they have experienced.

## Intuition
Think of a ball attached to a spring in a bowl of syrup. The spring pulls it back towards the rest point, harder the further away it is: that is the **stiffness** $a_2$. The syrup slows it down, harder the faster it moves: that is the **damping** $a_1$. With thick syrup the ball creeps back without passing the rest point. With thin syrup it shoots past, swings back, and each swing is smaller than the last. With no syrup it swings for ever, and with "negative syrup", something that pushes it along whenever it moves, the swings grow.

A market works the same way. Excess demand or supply pulls the price back towards equilibrium, like the spring. Traders who react to the price *trend* add or remove damping: if a rising price makes buyers wait for it to fall back, the movement is braked; if it makes them rush in before it rises further, the movement is amplified. Second-order equations let us tell these cases apart from two numbers.

## Definition and formulas
A **second-order linear differential equation with constant coefficients** is
$$\ddot y + a_1\,\dot y + a_2\,y = b,$$
where $\dot y = dy/dt$ and $\ddot y = d^2y/dt^2$ (also written $y'$ and $y''$). The solution is a steady state plus the solution of the **homogeneous** equation, the same equation with $b = 0$, which describes the gap $y - y^*$.

**Steady state.** At rest $y$ is constant, so $\dot y = \ddot y = 0$ and $a_2 y^* = b$:
$$y^* = \frac{b}{a_2} \qquad (a_2 \ne 0).$$
The coefficient $a_1$ does not affect where the path ends up, only how it gets there.

**Characteristic equation.** Try $y = e^{rt}$ in the homogeneous equation. Each derivative brings down a factor $r$, so $e^{rt}(r^2 + a_1 r + a_2) = 0$, and since $e^{rt} \ne 0$,
$$r^2 + a_1 r + a_2 = 0, \qquad r = \frac{-a_1 \pm \sqrt{a_1^2 - 4a_2}}{2}.$$
The roots add up to $-a_1$ and multiply to $a_2$. The sign of the discriminant $a_1^2 - 4a_2$ gives three cases:

- *Two distinct real roots* ($a_1^2 > 4a_2$): $\;y(t) = y^* + A\,e^{r_1 t} + B\,e^{r_2 t}$. A mix of two exponentials; no oscillation.
- *One repeated root* $r = -a_1/2$ ($a_1^2 = 4a_2$): $\;y(t) = y^* + (A + Bt)\,e^{rt}$. The second solution is $t\,e^{rt}$; for example $\ddot y + 4\dot y + 4y = 0$ has $r = -2$ twice and $y = (A + Bt)e^{-2t}$.
- *Complex roots* $r = h \pm k\,i$ with $h = -a_1/2$ and $k = \sqrt{4a_2 - a_1^2}/2$ ($a_1^2 < 4a_2$):
$$y(t) = y^* + e^{ht}\,\big(A\cos kt + B\sin kt\big).$$
The cosine and sine make the path **oscillate** around $y^*$, and $e^{ht}$ makes the swings shrink ($h < 0$) or grow ($h > 0$). One full cycle, from peak to peak, takes the **period** $T = 2\pi/k$. This comes from Euler's formula $e^{(h + ki)t} = e^{ht}(\cos kt + i\sin kt)$; complex numbers already appeared as eigenvalues in LA202.

**Fitting A and B.** Two constants need two conditions, usually the starting value $y(0)$ and the starting slope $\dot y(0)$:

- distinct roots: $A + B = y(0) - y^*$ and $r_1 A + r_2 B = \dot y(0)$;
- repeated root: $A = y(0) - y^*$ and $rA + B = \dot y(0)$;
- complex roots: $A = y(0) - y^*$ and $hA + kB = \dot y(0)$.

**Stability.** The gap dies out exactly when every root has a negative real part. Because the roots add up to $-a_1$ and multiply to $a_2$, this happens exactly when
$$a_1 > 0 \quad \text{and} \quad a_2 > 0.$$
(Two real roots are both negative when their sum is negative and their product positive; complex roots have real part $-a_1/2$.) If $a_2 < 0$ one root is positive and the path runs away; if $a_1 < 0$ the path explodes, in growing cycles when the roots are complex. When the path converges, the root closer to zero (the one with the larger real part) dominates in the long run, because the other term dies out first.

**The four regimes**, for $a_2 > 0$:

$$
\begin{array}{lll}
\text{Coefficients} & \text{Roots} & \text{Path of the gap} \\ \hline
a_1^2 > 4a_2,\ a_1 > 0 & \text{two negative real} & \text{overdamped: glides back, at most one crossing} \\
a_1^2 = 4a_2,\ a_1 > 0 & \text{one negative, repeated} & \text{critically damped: fastest return without cycles} \\
0 < a_1 < 2\sqrt{a_2} & \text{complex},\ h < 0 & \text{damped oscillation} \\
a_1 = 0 & \pm k\,i & \text{steady oscillation} \\
a_1 < 0 & \text{real part} > 0 & \text{explosive}
\end{array}
$$

**A market with price expectations.** Suppose demand depends on the price and on its trend, $Q_d = \alpha - \beta P + m\dot P + n\ddot P$, while supply depends on the price, $Q_s = -\gamma + \delta P$. Setting $Q_d = Q_s$ gives
$$n\ddot P + m\dot P - (\beta + \delta)P = -(\alpha + \gamma),$$
and dividing by $n$ puts it in the standard form with $a_1 = m/n$, $a_2 = -(\beta + \delta)/n$ and the usual equilibrium price $P^* = (\alpha + \gamma)/(\beta + \delta)$ of F05. With $n < 0$ (buyers hold back when a price rise speeds up), $a_2 > 0$; then $m < 0$ (a rising price makes buyers wait) gives $a_1 > 0$ and a stable market, while $m > 0$ (buyers chase rising prices) gives $a_1 < 0$ and explosive swings. Example 3 works through such a market.

**Discrete and continuous time.** DY02 studies $y_{t+2} + a_1 y_{t+1} + a_2 y_t = b$. Trying $y_t = r^t$ gives the *same* quadratic $r^2 + a_1 r + a_2 = 0$, but the roots are read differently:

$$
\begin{array}{lll}
 & \text{Difference equation (DY02)} & \text{Differential equation (DY04)} \\ \hline
\text{Steady state} & b/(1 + a_1 + a_2) & b/a_2 \\
\text{Building block} & r^t & e^{rt} \\
\text{Stable when} & |r| < 1 \text{ for both roots} & \operatorname{Re} r < 0 \text{ for both roots} \\
\text{Cycles from} & \text{complex or negative roots} & \text{complex roots only}
\end{array}
$$

The roots $-1$ and $-2$ are perfectly stable here, since $e^{-t}$ and $e^{-2t}$ shrink, but in discrete time $(-2)^t$ flips sign and doubles every period.

## Interactive
::widget{id="second-order-damping"}

The graph shows the gap $y - y^*$ for $\ddot y + a_1\dot y + a_2 y = 0$, starting 1 above equilibrium and at rest, over 10 units of time. Drag the **damping** $a_1$ and the **stiffness** $a_2$ and watch the panel name the roots, the regime and the period of the cycle. You start at $a_1 = 1$, $a_2 = 4.25$, the market of Example 3: the panel shows roots $-0.5 \pm 2i$, a damped oscillation and a period of 3.14, and the curve swings inside the green dashed envelope. Lower $a_1$ to 0: the envelope turns flat and the swings never shrink. Lower it to $-0.5$: the swings grow, an explosive oscillation. Now set $a_1 = 2$ and $a_2 = 1$: the roots are $-1$ twice and the path is critically damped; at $a_1 = 3$, $a_2 = 2$ (Example 1) the roots are $-1$ and $-2$ and it is overdamped. Finally drag $a_2$ below 0: one root turns positive and the path runs away, whatever the damping. Notice that the gap dies out exactly when both sliders are above 0.

## Worked examples

### Example 1 (easy): a commodity price with momentum
Traders react to the price of a commodity, to how fast it is changing and to whether that change is speeding up, so the price follows $\ddot P + 3\dot P + 2P = 50$, with time in weeks. Find the steady state, the roots of the characteristic equation and the general solution, and say whether the price settles and whether it cycles.

1. $\dot P = \ddot P = 0 \;\Rightarrow\; 2P^* = 50,\quad P^* = 25$
   *Why:* at rest the price is constant, so its derivatives vanish and only the term $a_2 P$ is left; the coefficient 3 plays no part in where the price settles.
2. $r^2 + 3r + 2 = 0, \quad 3^2 - 4 \cdot 2 = 1 > 0, \quad (r + 1)(r + 2) = 0 \;\Rightarrow\; r_1 = -1,\ r_2 = -2$
   *Why:* trying $e^{rt}$ in $\ddot P + 3\dot P + 2P = 0$ gives the characteristic equation; the positive discriminant means two distinct real roots, which add up to $-3$ and multiply to 2.
3. $P(t) = 25 + A\,e^{-t} + B\,e^{-2t}$
   *Why:* the steady state plus one exponential for each root; $A$ and $B$ are fixed later by the price and its rate of change today.
4. Stable and without cycles: $a_1 = 3 > 0$ and $a_2 = 2 > 0$, both roots real and negative
   *Why:* both exponentials shrink, so the price settles at 25; real roots mean no sine or cosine, so there is no cycle.
5. After 3 weeks $e^{-3} = 0.0498$ but $e^{-6} = 0.0025$, about 20 times smaller
   *Why:* the term with the root closer to zero, $-1$, dies out more slowly, so in the long run the gap shrinks like $e^{-t}$ and the slow root sets the speed.

```verify
a1 = 3; a2 = 2; b = 50
Pstar = b/a2
assert Pstar == 25
disc = a1^2 - 4*a2
assert disc == 1
r1 = (-a1 + sqrt(disc))/2
r2 = (-a1 - sqrt(disc))/2
assert r1 == -1
assert r2 == -2
assert r1^2 + a1*r1 + a2 == 0
assert r2^2 + a1*r2 + a2 == 0
assert r1 + r2 == -a1
assert r1*r2 == a2
assert abs(exp(-3) - 0.0498) < 0.00005
assert abs(exp(-6) - 0.0025) < 0.00005
assert abs(exp(-3)/exp(-6) - 20) < 0.1
# any A and B solve the equation: second differences at t = 1 with A = 4, B = -7
P(t) = Pstar + 4*exp(-t) - 7*exp(-2*t)
h = 0.0001
d1 = (P(1 + h) - P(1 - h))/(2*h)
d2 = (P(1 + h) - 2*P(1) + P(1 - h))/h^2
assert abs(d2 + a1*d1 + a2*P(1) - b) < 0.0001
```

### Example 2 (medium): a wholesaler running down its stock
A wholesaler adjusts production to its stock of goods $N$ (thousand units) and to how fast the stock is changing, so that $\ddot N + 5\dot N + 4N = 240$, with time in months. Today the stock is $N(0) = 90$ and it is falling at $\dot N(0) = -12$ a month. Find the path of the stock and the stock after 2 months.

1. $N^* = \dfrac{240}{4} = 60, \qquad r^2 + 5r + 4 = (r + 1)(r + 4) = 0 \;\Rightarrow\; r_1 = -1,\ r_2 = -4$
   *Why:* the steady state is $b/a_2$; the roots add up to $-5$ and multiply to 4, and both are negative, so the stock settles at 60.
2. $N(t) = 60 + A\,e^{-t} + B\,e^{-4t}, \qquad N(0) = 60 + A + B = 90 \;\Rightarrow\; A + B = 30$
   *Why:* at $t = 0$ both exponentials equal 1, so the two constants must add up to the starting gap $90 - 60$, not to 90.
3. $\dot N(0) = -A - 4B = -12 \;\Rightarrow\; A + 4B = 12, \quad 3B = 12 - 30 = -18, \quad B = -6,\ A = 36$
   *Why:* differentiating brings down each root, so the starting slope gives a second equation; subtracting $A + B = 30$ from $A + 4B = 12$ removes $A$.
4. $N(2) = 60 + 36\,e^{-2} - 6\,e^{-8} = 60 + 4.8721 - 0.0020 = 64.87$
   *Why:* after 2 months the fast term has almost vanished and about 4.87 thousand units of the gap of 30 is left.
5. $\dot N(t) = -36\,e^{-t} + 24\,e^{-4t} < 0$ for all $t \ge 0$
   *Why:* $36\,e^{-t} > 24\,e^{-4t}$ because $e^{3t} \ge 1 > 2/3$, so the stock keeps falling towards 60 and never undershoots: an overdamped path.

```verify
a1 = 5; a2 = 4; b = 240; N0 = 90; v0 = -12
Nstar = b/a2
assert Nstar == 60
assert (-1)^2 + a1*(-1) + a2 == 0
assert (-4)^2 + a1*(-4) + a2 == 0
# solve A + B = 30, -A - 4B = -12 as a linear system
sol = lusolve([1, 1; -1, -4], [N0 - Nstar; v0])
A = sol[1, 1]
B = sol[2, 1]
assert abs(A - 36) < 0.000001
assert abs(B + 6) < 0.000001
N(t) = Nstar + A*exp(-t) + B*exp(-4*t)
assert abs(N(0) - 90) < 0.000001
assert abs(36*exp(-2) - 4.8721) < 0.00005
assert abs(6*exp(-8) - 0.0020) < 0.00005
assert abs(N(2) - 64.87) < 0.005
# the path solves the equation and starts with slope -12 (numerical derivatives)
h = 0.0001
assert abs((N(h) - N(-h))/(2*h) - v0) < 0.00001
d1 = (N(2 + h) - N(2 - h))/(2*h)
d2 = (N(2 + h) - 2*N(2) + N(2 - h))/h^2
assert abs(d2 + a1*d1 + a2*N(2) - b) < 0.0001
# the slope stays negative: checked at several times
assert -36*exp(-0) + 24*exp(0) < 0
assert -36*exp(-0.5) + 24*exp(-2) < 0
assert -36*exp(-5) + 24*exp(-20) < 0
```

### Example 3 (hard): a market with price expectations
Demand for a good depends on its price and on its trend: $Q_d = 300 - 3P - 4\dot P - 4\ddot P$, because buyers hold back when the price is rising and hold back more when the rise speeds up. Supply is $Q_s = -40 + 14P$; time is in months. The market always clears. The price starts at $P(0) = 23$ and is momentarily not moving, $\dot P(0) = 0$. Find the price path, the length of a cycle, the lowest price reached, and say whether the market is stable.

1. $300 - 3P - 4\dot P - 4\ddot P = -40 + 14P \;\Rightarrow\; \ddot P + \dot P + 4.25P = 85, \qquad P^* = \dfrac{85}{4.25} = 20$
   *Why:* collecting terms gives $4\ddot P + 4\dot P + 17P = 340$; dividing by 4 gives the standard form. At $P = 20$ demand and supply are both 240.
2. $r^2 + r + 4.25 = 0, \quad 1 - 17 = -16 < 0 \;\Rightarrow\; r = \dfrac{-1 \pm 4i}{2} = -0.5 \pm 2i$
   *Why:* a negative discriminant gives complex roots with $h = -0.5$ and $k = 2$; since $a_1 = 1 > 0$ and $a_2 = 4.25 > 0$ the market is stable, and the cycles are damped.
3. $P(t) = 20 + e^{-0.5t}\big(A\cos 2t + B\sin 2t\big), \quad A = 23 - 20 = 3, \quad -0.5 \cdot 3 + 2B = 0 \;\Rightarrow\; B = 0.75$
   *Why:* at $t = 0$ the cosine is 1 and the sine 0, so $A$ is the starting gap; the starting slope is $hA + kB$, which must be 0.
4. $T = \dfrac{2\pi}{2} = \pi \approx 3.14$ months, and each cycle shrinks the swings by $e^{-0.5\pi} = 0.21$
   *Why:* the cosine and sine repeat when $2t$ grows by $2\pi$; meanwhile $e^{-0.5t}$ falls to about a fifth, so the swings are almost gone after two cycles.
5. $\dot P = -6.375\,e^{-0.5t}\sin 2t = 0$ at $t = \pi/2$: $\;P(\pi/2) = 20 - 3\,e^{-\pi/4} = 18.63$; next peak $P(\pi) = 20 + 3\,e^{-\pi/2} = 20.62$
   *Why:* the price first overshoots, falling about 1.37 below equilibrium, then rises above it again by less. If buyers instead chased rising prices, $Q_d = 300 - 3P + 4\dot P - 4\ddot P$, the equation would be $\ddot P - \dot P + 4.25P = 85$, with $h = +0.5$: the same cycles, but growing.

```verify
# market clearing: 4P'' + 4P' + 17P = 340
a1 = 4/4; a2 = 17/4; b = 340/4
assert a1 == 1
assert a2 == 4.25
assert b == 85
Pstar = b/a2
assert Pstar == 20
assert 300 - 3*Pstar == 240
assert -40 + 14*Pstar == 240
disc = a1^2 - 4*a2
assert disc == -16
h = -a1/2
k = sqrt(-disc)/2
assert h == -0.5
assert k == 2
A = 23 - Pstar
B = (0 - h*A)/k
assert A == 3
assert B == 0.75
P(t) = Pstar + exp(h*t)*(A*cos(k*t) + B*sin(k*t))
T = 2*pi/k
assert abs(T - 3.14) < 0.005
assert abs(exp(h*T) - 0.21) < 0.005
assert abs(P(pi/2) - 18.63) < 0.005
assert abs(3*exp(-pi/4) - 1.37) < 0.005
assert abs(P(pi) - 20.62) < 0.005
# slope formula, and the path solves the equation (numerical derivatives)
dt = 0.0001
assert abs((P(1 + dt) - P(1 - dt))/(2*dt) - (-6.375*exp(-0.5)*sin(2))) < 0.00001
assert abs((P(dt) - P(-dt))/(2*dt)) < 0.00001
d1 = (P(1 + dt) - P(1 - dt))/(2*dt)
d2 = (P(1 + dt) - 2*P(1) + P(1 - dt))/dt^2
assert abs(d2 + a1*d1 + a2*P(1) - b) < 0.0001
assert abs(P(pi/2) - P(pi/2 + 0.01)) < 0.001
assert P(pi/2 - 0.01) > P(pi/2)
assert P(pi/2 + 0.01) > P(pi/2)
# chasing rising prices: 4P'' - 4P' + 17P = 340, real part of the roots +0.5
assert -(-4/4)/2 == 0.5
```

## Common mistakes
- Dividing $b$ by $a_1$ instead of $a_2$ to find the steady state (WRONG_COEFFICIENT).
- Using the difference-equation formula $b/(1 + a_1 + a_2)$ for a differential equation; at rest the derivatives are zero, so $y^* = b/a_2$ (DISCRETE_FORMULA).
- Taking the root further from zero as the one that sets the long-run speed; the slower, dominant root is the one closer to zero (FASTER_ROOT).
- Reading $(r + 1)(r + 2) = 0$ as roots $1$ and $2$ instead of $-1$ and $-2$ (ROOT_SIGN).
- Writing the characteristic equation as $r^2 + a_1 r = 0$ and forgetting $a_2$ (DROPPED_CONSTANT).
- Fitting $A + B = y(0)$ instead of $A + B = y(0) - y^*$, or forgetting to add $y^*$ back (NO_PARTICULAR).
- Attaching $A$ to the second root and $B$ to the first after solving for them (SWAPPED_CONSTANTS).
- Using one exponential, as in DY03, so that the starting slope is ignored (ONE_ROOT).
- Taking $2\pi/\sqrt{a_2}$ as the period when the system is damped; the frequency is $k = \sqrt{4a_2 - a_1^2}/2$ (IGNORED_DAMPING).
- Giving the frequency $k$ when the question asks for the length of a cycle, $2\pi/k$ (FREQUENCY_NOT_PERIOD).
- Forgetting the 2 in the denominator of the quadratic formula, which doubles $k$ (DISCRIMINANT_NOT_HALVED).
- Judging stability by $|r| < 1$, as for difference equations; in continuous time what matters is the sign of the real part.
- Thinking that complex roots always mean instability: they mean cycles, and the cycles shrink whenever $h = -a_1/2 < 0$.

## Practice
- `second-order-steady-or-root` (difficulty 1): the steady state $b/a_2$ of a price or stock equation, or the characteristic root closer to zero, which sets the long-run speed of convergence; distractors WRONG_COEFFICIENT, DISCRETE_FORMULA, FASTER_ROOT, ROOT_SIGN, DROPPED_CONSTANT.
- `second-order-ode-value-at-time` (difficulty 2): the value $y(t) = y^* + Ae^{r_1 t} + Be^{r_2 t}$ of a price or a stock after fitting $A$ and $B$ to $y(0)$ and $\dot y(0)$; distractors NO_PARTICULAR, SWAPPED_CONSTANTS, ONE_ROOT.
- `damped-cycle-period` (difficulty 3): the period $2\pi/k$ of a damped cycle in a price, a stock or the output gap; distractors IGNORED_DAMPING, FREQUENCY_NOT_PERIOD, DISCRIMINANT_NOT_HALVED.

## Real world
- Asset and housing markets: when buyers extrapolate recent price rises, prices can overshoot their long-run level and then fall below it. Second-order models make this precise: the reaction to the price trend sets the damping, and its sign decides whether booms fade or grow.
- Inventory cycles: firms that steer production by their stock of goods, and react with a delay, produce short cycles in output that last a few years. Whether such cycles fade depends on how strongly firms react to the change in their stocks.
- Inflation and unemployment: in models where expected inflation adapts to actual inflation and unemployment responds to it, inflation follows a second-order equation; after a shock it can undershoot its long-run value and approach it in damped cycles.
- Stabilisation policy: a government or central bank that reacts to how fast a variable is changing, not only to how far it is from target, adds damping. Economists have long used this idea, borrowed from engineering control, to ask which policy rules calm cycles and which make them worse.

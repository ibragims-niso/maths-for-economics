---
id: DY03
title: First-order differential equations
block: DY
coreYear: 3
prerequisites: [C112, C105]
estMinutes: 50
status: draft
economicUses:
  - "Continuous growth and decay: GDP, prices, populations and depreciating capital"
  - "Price adjustment: how fast excess demand pushes a market price to its equilibrium"
  - "The Solow growth model: where capital per worker settles and how fast it gets there"
  - "Debt and stock dynamics in continuous time: will a ratio settle, and when is half the gap closed?"
searchTerms:
  - "ODE"
  - "Differential equation"
generators: [linear-ode-value-at-time, ode-gap-closing-time, solow-steady-state-capital]
widgets: [price-adjustment-path]
mistakeCodes:
  IGNORED_STEADY_STATE:
    label: Left out the steady state
    explanation: y₀·e^(−at) solves dy/dt = −ay, the equation without b. With a constant b the path heads for y* = b/a, so use y(t) = y* + (y₀ − y*)·e^(−at).
  STEADY_STATE_ONLY:
    label: Gave the long-run value instead of the value at time t
    explanation: The steady state y* is where the path is heading, and the path only gets there in the limit. Add what is left of the starting gap, (y₀ − y*)·e^(−at), to y*.
  EXPONENT_SIGN:
    label: Used e^(at) instead of e^(−at)
    explanation: For dy/dt + ay = b the gap y − y* obeys d(gap)/dt = −a·gap, so it decays like e^(−at). A plus sign makes the gap grow, which is the solution of a different, unstable equation.
  NO_LOG:
    label: Gave 1/a as the time
    explanation: 1/a is only a time scale, the time the gap would need to close if it kept shrinking at its first speed. The time for the gap to fall to a fraction q is ln(1/q)/a, for example ln 2/a ≈ 0.693/a for half the gap.
  RATE_TIMES_LOG:
    label: Multiplied by a instead of dividing
    explanation: From e^(−at) = q, taking logs gives −at = ln q, so t = ln(1/q)/a. A faster adjustment (bigger a) must give a shorter time, so a belongs in the denominator.
  LINEAR_CLOSING:
    label: Assumed the gap closes at a constant speed
    explanation: The gap closes fast at first and more and more slowly, because its speed is a times the gap that is left. Dividing the share closed by a assumes the first speed lasts; use t = ln(1/q)/a with q the share still left.
  CLOSED_VS_REMAINING:
    label: Used the share closed instead of the share left
    explanation: e^(−at) is the part of the gap still left. If 90 % must close, then e^(−at) = 0.1, not 0.9; so t = ln(1/0.1)/a = ln 10/a.
  FORGOT_POWER:
    label: Stopped at s/(n + δ)
    explanation: Setting k̇ = 0 gives k^(1−α) = s/(n + δ), not k itself. Raise both sides to the power 1/(1 − α) to get k* = (s/(n + δ))^(1/(1−α)).
  WRONG_POWER:
    label: Used the power 1/α
    explanation: After dividing s·k^α = (n + δ)k by k^α, the power of k left is 1 − α, so you undo it with 1/(1 − α), not 1/α.
  IGNORED_POPULATION:
    label: Left out population growth
    explanation: Capital per worker is diluted by new workers as well as worn down by depreciation, so the break-even investment is (n + δ)k, not δk. Leaving out n overstates k*.
resources:
  - { title: "Calculus Volume 2, 4.5 First-order Linear Equations (OpenStax)", url: "https://openstax.org/books/calculus-volume-2/pages/4-5-first-order-linear-equations", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Calculus Volume 2, 4.3 Separable Equations (OpenStax)", url: "https://openstax.org/books/calculus-volume-2/pages/4-3-separable-equations", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Calculus Volume 2, 4.4 The Logistic Equation (OpenStax)", url: "https://openstax.org/books/calculus-volume-2/pages/4-4-the-logistic-equation", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
Many economic models describe change rather than levels: how fast a price moves when the market does not clear, how quickly capital is built up and worn down, how a debt ratio drifts year after year. When time runs continuously, such a rule links a variable to its own rate of change, $\dfrac{dy}{dt}$, and is called a **differential equation**. Solving it gives the whole path over time and answers the questions policy cares about: where does the economy end up, does it get there at all, and how long does it take? First-order differential equations are the continuous twin of the difference equations of DY01, and they are the language of growth theory, from compound interest to the Solow model.

## Intuition
Imagine a price that is too high. Sellers cannot sell all they bring to market, so the price falls; the further it is from equilibrium, the faster it falls. As it gets closer, the pressure eases and it slows down. "The speed is proportional to the distance from the target" means that at every instant the gap closes by the same *fraction*: the gap does not shrink by a fixed amount per month but by a fixed percentage. That is exponential decay, the same $e^{-at}$ that appears in continuous discounting.

So a typical path has two parts: the **steady state** $y^*$, where the rate of change is zero and nothing moves, and a **gap** to it that decays exponentially. In DY01 the gap was multiplied by $a$ once per period and could jump to the other side of the steady state. In continuous time the gap shrinks smoothly, so the path glides towards $y^*$ from one side and never overshoots.

## Definition and formulas
A **first-order differential equation** links an unknown function $y(t)$ to its first derivative $\dot y = dy/dt$, for example $\dot y = 0.03y$ or $\dot p = 9 - 0.5p$. A **solution** is a function that makes the equation true at every $t$.

**General and particular solutions.** Solving involves integration (C112), so the solution contains an arbitrary constant $C$: a whole family of paths, the **general solution**. An **initial condition** $y(0) = y_0$ picks one member of the family, the **particular solution**. The simplest case is $\dot y = f(t)$, solved by integrating: $y = \int f(t)\,dt + C$.

**Exponential growth and decay.** The equation $\dot y = ky$ says that $y$ grows at the constant rate $\dot y / y = k$ (C105). Its solution is
$$y(t) = y_0\,e^{kt}.$$
For $k > 0$ this is continuous growth, the formula behind continuous compounding (FM02); $y$ doubles every $\ln 2 / k$ (GDP growing at 3 % a year doubles in about 23.1 years). For $k < 0$ it is decay, and $y$ halves every $\ln 2 / |k|$, the **half-life**.

**The linear equation with constant coefficients.**
$$\frac{dy}{dt} + a\,y = b.$$

- *Steady state:* if $a \ne 0$, setting $\dot y = 0$ gives $a y = b$, so $y^* = b/a$.
- *Solution:* the gap $x = y - y^*$ satisfies $\dot x = \dot y = b - a y = -a(y - y^*) = -a x$, so $x(t) = x_0 e^{-at}$ and
$$y(t) = y^* + (y_0 - y^*)\,e^{-at}.$$
Before using the initial condition, the general solution is $y(t) = y^* + C e^{-at}$; setting $t = 0$ gives $C = y_0 - y^*$.
- *Stability:* if $a > 0$, $e^{-at} \to 0$ and every path converges to $y^*$ (the steady state is stable). If $a < 0$, the gap grows and paths move away from $y^*$ (unstable). If $a = 0$ the equation is $\dot y = b$ and $y = y_0 + bt$, with no steady state unless $b = 0$.
- *Time to close a gap:* the share of the starting gap still left after time $t$ is $e^{-at}$. It falls to a fraction $q$ when
$$t = \frac{\ln(1/q)}{a}, \qquad \text{half-life } t_{1/2} = \frac{\ln 2}{a} \approx \frac{0.693}{a}.$$
Closing 90 % of the gap ($q = 0.1$) takes $\ln 10 / a \approx 2.303/a$, about 3.3 half-lives. The time does not depend on $y_0$ or $b$, only on $a$.

**Phase line.** Without solving, you can read the behaviour from the sign of $\dot y$ as a function of $y$. Draw a line of possible values of $y$, mark the points where $\dot y = 0$, and put an arrow pointing up (right) where $\dot y > 0$ and down (left) where $\dot y < 0$. For $\dot y = b - a y$ with $a > 0$:

$$
\begin{array}{lll}
\text{Where } y \text{ is} & \text{Sign of } \dot y & \text{What happens} \\ \hline
y < y^* & \dot y > 0 & y \text{ rises towards } y^* \\
y = y^* & \dot y = 0 & y \text{ stays put} \\
y > y^* & \dot y < 0 & y \text{ falls towards } y^*
\end{array}
$$

Both arrows point at $y^*$, so it is stable. If the arrows point away from a rest point, it is unstable. This works for non-linear equations too.

**Separable equations.** An equation of the form $\dot y = g(y)\,h(t)$ can be solved by putting everything with $y$ on one side and everything with $t$ on the other, then integrating both sides:
$$\int \frac{dy}{g(y)} = \int h(t)\,dt + C.$$
For $\dot y = ky$: $\int dy / y = \int k\,dt$, so $\ln y = kt + C$ and $y = y_0 e^{kt}$. The **logistic equation** $\dot N = rN(1 - N/M)$, where growth slows as $N$ approaches a ceiling $M$, is separable too; Example 3 solves it.

**Three economic models.**

- *Price adjustment (Walrasian tâtonnement):* the price rises when there is excess demand, at a speed $\lambda > 0$: $\dot p = \lambda\,\big(D(p) - S(p)\big)$. With linear demand $D = \alpha - \beta p$ and supply $S = \gamma + \delta p$,
$$\dot p + \lambda(\beta + \delta)\,p = \lambda(\alpha - \gamma), \qquad p^* = \frac{\alpha - \gamma}{\beta + \delta},$$
the equilibrium price of F05. Here $a = \lambda(\beta + \delta) > 0$, so the market is always stable, and the gap halves every $\ln 2 / \big(\lambda(\beta + \delta)\big)$.
- *The Solow growth model:* with saving rate $s$, output per worker $f(k)$, population growth $n$ and depreciation $\delta$, capital per worker follows
$$\dot k = s\,f(k) - (n + \delta)\,k.$$
Saving adds capital; new workers and worn-out machines dilute it. For $f(k) = k^\alpha$ with $0 < \alpha < 1$, the steady state solves $s\,k^\alpha = (n + \delta)k$, so
$$k^* = \left(\frac{s}{n + \delta}\right)^{1/(1 - \alpha)}.$$
With $s = 0.25$, $n = 0.01$, $\delta = 0.04$ and $\alpha = 1/2$: $k^* = (0.25/0.05)^2 = 25$ and output per worker $y^* = \sqrt{25} = 5$. The phase line shows it is stable: at $k = 4$, $\dot k = 0.25 \cdot 2 - 0.05 \cdot 4 = 0.3 > 0$; at $k = 36$, $\dot k = 0.25 \cdot 6 - 0.05 \cdot 36 = -0.3 < 0$.
- *Debt in continuous time:* with a primary deficit of $p$ % of GDP, interest rate $r$ and GDP growth $g$, the debt ratio follows $\dot D = p + (r - g)D$. If $g > r$ it is stable with $D^* = p/(g - r)$: a deficit of 2 % with $g - r = 0.02$ settles at 100 % of GDP. The discrete version in DY01 gives 105 for the same numbers, because there growth is credited once a year.

Equations that involve the second derivative, such as $\ddot y + a_1 \dot y + a_2 y = b$, are second order and come in DY04; systems of two equations come in DY05.

## Interactive
::widget{id="price-adjustment-path"}

The graph shows the price over 10 months in the market of Example 2, with demand $D = 100 - 2p$, supply $S = 10 + 3p$ and $\dot p = \lambda(D - S)$. The gold marks are the slope $\dot p$ at each price, and the arrows on the right are the phase line. Drag the **speed of adjustment** $\lambda$ and watch the half-life in the panel shrink: doubling $\lambda$ halves it. Drag the **starting price** $p_0$ above and below 18 and notice that the path always glides to $p^* = 18$ without overshooting, and that the half-life does not change. Check: at $\lambda = 0.1$ and $p_0 = 30$ the panel shows $p^* = 18$, a half-life of 1.39 months and a price at $t = 5$ of 18.99, and the caption says that excess supply of 60 pulls the price down, at first by 6 a month. At $\lambda = 0.2$ the half-life is 0.69 months.

## Worked examples

### Example 1 (easy): a capital stock settling down
A firm invests 30 (thousand) a year in machines, and machines wear out at 10 % a year, so its capital stock follows $\dot K = 30 - 0.1K$. Capital is now $K(0) = 100$. Find the long-run capital stock and the capital stock after 5 years.

1. $\dot K + 0.1K = 30, \quad K^* = \dfrac{30}{0.1} = 300$
   *Why:* in the form $\dot y + ay = b$ we have $a = 0.1$ and $b = 30$; at the steady state investment exactly replaces the machines that wear out, $0.1 \cdot 300 = 30$.
2. $K(t) = 300 + C\,e^{-0.1t}, \quad K(0) = 300 + C = 100 \;\Rightarrow\; C = -200$
   *Why:* the general solution is the steady state plus a decaying gap; the initial condition fixes the constant, which is the starting gap $100 - 300$.
3. $K(5) = 300 - 200\,e^{-0.5} = 300 - 200 \cdot 0.606531 = 300 - 121.31 = 178.69$
   *Why:* after 5 years the factor $e^{-0.5}$ has removed about 39 % of the gap, so capital has risen from 100 to about 179.
4. Check: $\dot K = 20\,e^{-0.1t}$ and $30 - 0.1K = 30 - 30 + 20\,e^{-0.1t}$, the same.
   *Why:* differentiating the solution and substituting it into the equation must give the same expression at every $t$; at $t = 0$ both equal 20, investment of 30 minus wear of 10.

```verify
a = 0.1; b = 30; K0 = 100
Kstar = b/a
assert abs(Kstar - 300) < 0.000001
assert abs(a*Kstar - b) < 0.000001
C = K0 - Kstar
assert C == -200
assert abs(exp(-0.5) - 0.606531) < 0.0000005
assert abs(200*exp(-0.5) - 121.31) < 0.005
K5 = Kstar + C*exp(-a*5)
assert abs(K5 - 178.69) < 0.005
assert abs((1 - exp(-0.5)) - 0.39) < 0.01
# numerical derivative of the solution equals 30 - 0.1K at t = 5 and t = 0
K(t) = Kstar + C*exp(-a*t)
h = 0.000001
assert abs((K(5 + h) - K(5 - h))/(2*h) - (b - a*K(5))) < 0.00001
assert abs((K(h) - K(-h))/(2*h) - 20) < 0.00001
assert b - a*K0 == 20
```

### Example 2 (medium): a market price adjusting to equilibrium
Demand is $D(p) = 100 - 2p$ and supply $S(p) = 10 + 3p$. When the market does not clear, the price moves with excess demand: $\dot p = 0.1\,(D - S)$, with time in months. The price starts at $p(0) = 30$. Find the price path, the price after 5 months, and how long it takes to close half and 90 % of the gap to equilibrium.

1. $\dot p = 0.1\,\big(100 - 2p - 10 - 3p\big) = 0.1\,(90 - 5p) = 9 - 0.5p$
   *Why:* at $p = 30$ demand is 40 and supply 100, an excess supply of 60, so the price starts falling at $0.1 \cdot 60 = 6$ a month.
2. $p^* = \dfrac{9}{0.5} = 18$, where $D = S = 64$
   *Why:* the price stops moving exactly when excess demand is zero, which is the ordinary market equilibrium (F05).
3. $p(t) = 18 + 12\,e^{-0.5t}, \quad p(5) = 18 + 12\,e^{-2.5} = 18 + 12 \cdot 0.082085 = 18.99$
   *Why:* here $a = \lambda(\beta + \delta) = 0.1 \cdot 5 = 0.5$ and the starting gap is $30 - 18 = 12$; after 5 months less than 1 of it is left.
4. $t_{1/2} = \dfrac{\ln 2}{0.5} = 1.39$ months, and indeed $p(1.39) = 18 + 6 = 24$
   *Why:* half the gap is left when $e^{-0.5t} = 0.5$; taking logs gives $0.5t = \ln 2$.
5. $t_{90\%} = \dfrac{\ln 10}{0.5} = 4.61$ months
   *Why:* 90 % closed means 10 % left, $e^{-0.5t} = 0.1$. A faster reaction $\lambda$, or steeper demand and supply, would raise $a$ and shorten both times in proportion.

```verify
lam = 0.1; al = 100; be = 2; ga = 10; de = 3; p0 = 30
D(p) = al - be*p
S(p) = ga + de*p
assert D(p0) == 40
assert S(p0) == 100
assert abs(lam*(D(p0) - S(p0)) + 6) < 0.000001
a = lam*(be + de)
b = lam*(al - ga)
assert abs(a - 0.5) < 0.000001
assert abs(b - 9) < 0.000001
pstar = b/a
assert abs(pstar - 18) < 0.000001
assert D(18) == 64
assert S(18) == 64
assert abs(exp(-2.5) - 0.082085) < 0.0000005
p5 = pstar + (p0 - pstar)*exp(-a*5)
assert abs(p5 - 18.99) < 0.005
assert (p0 - pstar)*exp(-a*5) < 1
th = log(2)/a
assert abs(th - 1.39) < 0.005
assert abs(pstar + (p0 - pstar)*exp(-a*th) - 24) < 0.000001
t90 = log(10)/a
assert abs(t90 - 4.61) < 0.005
assert abs(exp(-a*t90) - 0.1) < 0.000001
```

### Example 3 (hard): an S-shaped adoption curve
A mobile banking app can reach at most $M = 10$ million users. Adoption spreads by word of mouth, so new users arrive at a rate proportional both to current users $N$ and to the share of the market not yet reached: $\dot N = 0.8\,N\,(1 - N/10)$, with $t$ in years and $N(0) = 0.5$ million. Solve the equation, find the number of users after 3 years, and say when adoption is fastest.

1. Rest points $N = 0$ and $N = 10$; for $0 < N < 10$, $\dot N > 0$
   *Why:* the phase line: the right-hand side is zero at both ends of the market and positive in between, so users rise from 0.5 towards 10.
2. $\dfrac{dN}{N(1 - N/10)} = 0.8\,dt, \qquad \dfrac{1}{N(1 - N/10)} = \dfrac{10}{N(10 - N)} = \dfrac{1}{N} + \dfrac{1}{10 - N}$
   *Why:* the equation is separable; the split of the fraction can be checked by adding $\frac{1}{N} + \frac{1}{10 - N} = \frac{10}{N(10 - N)}$, and it makes both sides easy to integrate.
3. $\ln N - \ln(10 - N) = 0.8t + C \;\Rightarrow\; \dfrac{N}{10 - N} = A\,e^{0.8t}, \quad A = \dfrac{0.5}{9.5} = \dfrac{1}{19}$
   *Why:* $\int \frac{dN}{10 - N} = -\ln(10 - N)$; exponentiating removes the logs, and $t = 0$ fixes $A$ from $N(0) = 0.5$.
4. $N(t) = \dfrac{10}{1 + 19\,e^{-0.8t}}, \qquad N(3) = \dfrac{10}{1 + 19 \cdot 0.090718} = \dfrac{10}{2.7236} = 3.67$ million
   *Why:* solving $N = (10 - N)\,e^{0.8t}/19$ for $N$ gives the logistic curve; pure exponential growth $0.5\,e^{0.8 \cdot 3} = 5.51$ would overstate users, because it ignores the ceiling.
5. Fastest when $N = 5$: $19\,e^{-0.8t} = 1 \Rightarrow t = \dfrac{\ln 19}{0.8} = 3.68$ years, with $\dot N = 0.8 \cdot 5 \cdot 0.5 = 2$ million a year
   *Why:* $0.8N(1 - N/10)$ is a downward parabola in $N$ with its peak halfway to the ceiling; after that point growth slows down, which gives the curve its S shape.

```verify
r = 0.8; M = 10; N0 = 0.5
A = N0/(M - N0)
assert abs(A - 1/19) < 0.000000001
N(t) = M/(1 + 19*exp(-r*t))
assert abs(N(0) - 0.5) < 0.000000001
# the identity used to separate the equation, at two values of N
assert abs(1/(2*(1 - 2/M)) - (1/2 + 1/(M - 2))) < 0.000000001
assert abs(1/(7*(1 - 7/M)) - (1/7 + 1/(M - 7))) < 0.000000001
assert abs(exp(-2.4) - 0.090718) < 0.0000005
assert abs(1 + 19*exp(-2.4) - 2.7236) < 0.00005
assert abs(N(3) - 3.67) < 0.005
assert abs(N0*exp(r*3) - 5.51) < 0.005
# the solution satisfies the equation (numerical derivative at t = 3)
h = 0.000001
assert abs((N(3 + h) - N(3 - h))/(2*h) - r*N(3)*(1 - N(3)/M)) < 0.00001
tpeak = log(19)/r
assert abs(tpeak - 3.68) < 0.005
assert abs(N(tpeak) - 5) < 0.000001
assert abs(r*5*(1 - 5/M) - 2) < 0.000001
assert r*4.9*(1 - 4.9/M) < 2
assert r*5.1*(1 - 5.1/M) < 2
```

## Common mistakes
- Writing $y_0 e^{-at}$ for $\dot y + ay = b$, as if $b$ were zero; the path heads for $y^* = b/a$, not for 0 (IGNORED_STEADY_STATE).
- Giving the steady state when the question asks for the value at time $t$; the path only reaches $y^*$ in the limit (STEADY_STATE_ONLY).
- Using $e^{at}$ instead of $e^{-at}$, which turns a converging path into an exploding one (EXPONENT_SIGN).
- Giving $1/a$ as the half-life or as the time to close a share of the gap; the time is $\ln(1/q)/a$ (NO_LOG).
- Solving $e^{-at} = q$ as $t = a\ln(1/q)$: a faster adjustment must mean a shorter time (RATE_TIMES_LOG).
- Assuming the gap keeps closing at its starting speed, so that closing 90 % takes $0.9/a$; the speed falls as the gap shrinks (LINEAR_CLOSING).
- Setting $e^{-at}$ equal to the share closed instead of the share still left (CLOSED_VS_REMAINING).
- Stopping at $k^{1-\alpha} = s/(n + \delta)$ in the Solow model and calling that $k^*$ (FORGOT_POWER).
- Undoing $k^{1-\alpha}$ with the power $1/\alpha$ instead of $1/(1 - \alpha)$ (WRONG_POWER).
- Using $\delta k$ instead of $(n + \delta)k$ as the investment needed to keep capital per worker constant (IGNORED_POPULATION).
- Forgetting the constant of integration, so that the initial condition cannot be used.
- Reading stability from the wrong form: in $\dot y + ay = b$ the path converges when $a > 0$, but in $\dot y = ay + b$ it converges when $a < 0$. Rewrite the equation first.
- Expecting oscillation, as in the cobweb model of DY01: a first-order differential equation can never jump over its steady state.

## Practice
- `linear-ode-value-at-time` (difficulty 1): the value of $y(t) = y^* + (y_0 - y^*)e^{-at}$ for a capital stock, a market price or a debt ratio; distractors IGNORED_STEADY_STATE, STEADY_STATE_ONLY, EXPONENT_SIGN.
- `ode-gap-closing-time` (difficulty 2): the time $\ln(1/q)/a$ for a price or capital stock to close half, 75 %, 80 %, 90 %, 95 % or 99 % of the gap to its steady state; distractors NO_LOG, RATE_TIMES_LOG, LINEAR_CLOSING, CLOSED_VS_REMAINING.
- `solow-steady-state-capital` (difficulty 3): the Solow steady state $k^* = \big(s/(n + \delta)\big)^{1/(1 - \alpha)}$ for $f(k) = k^\alpha$; distractors FORGOT_POWER, WRONG_POWER, IGNORED_POPULATION.

## Real world
- Growth theory: the Solow model's equation for capital per worker is the starting point of modern growth economics. Near the steady state the gap closes exponentially; a frequently quoted estimate of the speed is about 2 % a year, which means a half-life of about 35 years, so poorer countries catch up only slowly.
- Prices and exchange rates: economists summarise how quickly prices return to equilibrium by a half-life; studies of real exchange rates, for instance, often find that deviations take several years to halve.
- Diffusion of new products: the spread of phones, internet access, electric cars or digital payments typically follows an S-shaped logistic curve, and firms and regulators fit such curves to forecast adoption.
- Finance and public debt: continuous compounding $\dot B = rB$ underlies many pricing models, and debt-sustainability analysis asks whether $r - g$ is negative, the continuous-time condition for a stable debt ratio.

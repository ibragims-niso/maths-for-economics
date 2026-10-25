---
id: DY06
title: Stability of equilibria
block: DY
coreYear: 3
prerequisites: [DY05, DY02]
estMinutes: 50
status: draft
economicUses:
  - "Does a market or an economy return to equilibrium after a shock, settle somewhere else, or run away?"
  - "Poverty traps and other models with several equilibria: which ones an economy can settle in"
  - "Inflation dynamics: why the strength of a central bank's reaction decides whether shocks die out"
  - "Signing comparative statics with Samuelson's correspondence principle"
  - "Saddle-path stability in models with forward-looking prices and rational expectations"
searchTerms:
  - "Stability of a steady state"
  - "Stable and unstable equilibrium"
  - "Jacobian matrix"
generators: [harvest-map-slope-at-steady-state, jury-margin-2x2-discrete, solow-convergence-half-life]
widgets: [poverty-trap-map]
mistakeCodes:
  VALUE_NOT_SLOPE:
    label: Gave the steady state instead of the slope
    explanation: f(x*) = x* holds at every steady state, stable or not, so it cannot decide stability. Differentiate the map and put x* into f′.
  SLOPE_AT_ZERO:
    label: Took the slope at 0
    explanation: f′(0) describes the map near an empty stock, not near the steady state. Linearise where the economy is, by putting x = x* into f′(x).
  ONE_MINUS_SLOPE:
    label: Gave 1 − f′(x*)
    explanation: Near x* the gap is multiplied by f′(x*) itself each period; 1 − f′(x*) is the share of the gap closed in one step. Stability compares |f′(x*)| with 1.
  DERIVATIVE_SLIP:
    label: Differentiated x²/K as x/K
    explanation: The derivative of g·x(1 − x/K) = gx − gx²/K is g − 2gx/K. Without the 2 the slope becomes 1 + g(1 − x*/K), which can even put the slope on the wrong side of 1.
  TIME_RULE_MIXUP:
    label: Used the test for the other kind of time
    explanation: Discrete models need every |λ| < 1 (for 2×2, |tr A| < 1 + det A < 2); continuous models need every Re λ < 0 (for 2×2, tr A < 0 and det A > 0). The same matrix can pass one test and fail the other.
  DROPPED_ABS:
    label: Used tr A instead of |tr A|
    explanation: Both p(1) = 1 − tr A + det A and p(−1) = 1 + tr A + det A must be positive, so the margin uses the size of the trace. With a negative trace, 1 + det A − tr A is the larger of the two and hides the condition that fails first.
  ONLY_TRACE:
    label: Left out the determinant
    explanation: The margin is 1 + det A − |tr A|. Without det A you get 1 − |tr A|, which calls a matrix with trace 1.2 and determinant 0.5 unstable although both its eigenvalues lie inside the unit circle.
  DET_PLUS:
    label: Added bc in the determinant
    explanation: For A with rows (a, b) and (c, d), det A = ad − bc. Adding bc instead of subtracting it changes the margin and often the verdict.
  NO_ALPHA_FACTOR:
    label: Used n + δ as the speed of convergence
    explanation: When k rises, saving rises too and offsets part of the extra break-even investment. At k* the slope is α(n + δ) − (n + δ) = −(1 − α)(n + δ), so the half-life is ln 2/((1 − α)(n + δ)).
  ALPHA_NOT_ONE_MINUS:
    label: Used α instead of 1 − α
    explanation: The saving term contributes α(n + δ) to the slope and break-even investment −(n + δ), so the speed is (1 − α)(n + δ). Multiplying by α gives a much slower speed.
  NO_LOG:
    label: Gave 1/speed as the half-life
    explanation: 1/λ is only a time scale. A gap that shrinks like e^(−λt) halves when λt = ln 2, so the half-life is ln 2/λ ≈ 0.693/λ.
  IGNORED_POPULATION:
    label: Left out population growth
    explanation: Capital per worker is diluted by new workers at rate n as well as worn out at rate δ, so the speed is (1 − α)(n + δ), not (1 − α)δ.
resources:
  - { title: "Calculus Volume 2, 4.2 Direction Fields and Numerical Methods (OpenStax)", url: "https://openstax.org/books/calculus-volume-2/pages/4-2-direction-fields-and-numerical-methods", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Differential Equations 18.03SC, Linearization Near Critical Points (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/pages/unit-iv-first-order-systems/linearization-near-critical-points/", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
An equilibrium is only useful if the economy can actually be found there. After a shock, such as a bad harvest, a jump in the oil price or a financial crisis, does a market, an inflation rate or a whole economy return to where it was, settle somewhere else, or run away? Each of DY01 to DY05 gave a stability rule for one kind of model. This topic puts the rules side by side, shows that they are one rule about roots (eigenvalues), and extends it to nonlinear models by linearising them at a steady state.

Stability also answers questions that matter for policy. A model can have several equilibria, for example a poor one and a prosperous one, and stability tells you which of them an economy can settle in and how big a push it needs to move from one to the other. Central banks design their reaction to inflation so that inflation dynamics are stable. And economists use stability to predict the direction of comparative statics (Samuelson's correspondence principle) and to pin down forward-looking prices such as exchange rates (saddle paths).

## Intuition
Picture a ball in a hilly landscape. A ball resting at the bottom of a valley comes back after a nudge: that rest point is stable. A ball balanced on a hilltop rolls away after the smallest nudge: unstable. Now take a landscape with two valleys separated by a ridge. Which valley the ball ends in depends on which side of the ridge it starts: each valley has its own **basin of attraction**, and the ridge, an unstable rest point, is the border between them. Each valley is stable only *locally*: a big enough push carries the ball over the ridge. A poverty trap is the lower valley: small amounts of help are undone, but a push across the ridge leads to the prosperous valley.

How can we tell valleys from hilltops with a formula? Zoom in close to a rest point and every smooth model looks linear, just as a curve looks like its tangent line. In discrete time the gap from the steady state is then multiplied by roughly the same number every period, and it dies out exactly when that number is smaller than 1 in size. In continuous time the gap changes at a rate proportional to itself, and it dies out exactly when that rate is negative. Everything in this topic is a version of these two sentences.

## Definition and formulas
**Kinds of stability.** Let $x^*$ be a steady state (an equilibrium) of a dynamic model.

- $x^*$ is **locally asymptotically stable** if every path that starts close enough to $x^*$ converges to $x^*$.
- $x^*$ is **globally asymptotically stable** if every path converges to $x^*$, from any starting point in the range the model is meant for.
- $x^*$ is **unstable** if some paths that start arbitrarily close to it move away.
- In between are steady states that are **stable but not asymptotically stable**: nearby paths stay nearby but never converge, like the two-period cycle with $a = -1$ in DY01 or the steady oscillation with $a_1 = 0$ in DY04.

Economists usually say "stable" for "asymptotically stable". A linear model with a single steady state is either globally stable or unstable, because the gap obeys the same rule however large it is. Nonlinear models can have several steady states, and then each stable one is only locally stable.

**One rule, two clocks.** In a linear model the gap from the steady state is a combination of terms $\lambda^t$ (discrete time) or $e^{\lambda t}$ (continuous time), one for each root or eigenvalue $\lambda$. Each term dies out exactly when
$$\text{discrete: } |\lambda| < 1 \ \ (\lambda \text{ inside the unit circle}), \qquad \text{continuous: } \operatorname{Re}\lambda < 0 \ \ (\lambda \text{ in the left half-plane}).$$
The two are linked: looking at a continuous model once every period turns each root $\mu$ into $\lambda = e^{\mu}$, and $|e^{\mu}| = e^{\operatorname{Re}\mu}$ is below 1 exactly when $\operatorname{Re}\mu < 0$. Side by side, the tests of the earlier topics are:

$$
\begin{array}{lll}
\text{Model} & \text{Discrete time: stable when} & \text{Continuous time: stable when} \\ \hline
\text{First order} & y_{t+1} = a\,y_t + b:\ |a| < 1 \ \text{(DY01)} & \dot y + a\,y = b:\ a > 0 \ \text{(DY03)} \\
\text{Second order} & 1 + a_1 + a_2 > 0,\ 1 - a_1 + a_2 > 0,\ a_2 < 1 \ \text{(DY02)} & a_1 > 0,\ a_2 > 0 \ \text{(DY04)} \\
2 \times 2 \text{ system} & x_{t+1} = Ax_t:\ |\operatorname{tr} A| < 1 + \det A < 2 & \dot x = Ax:\ \operatorname{tr} A < 0,\ \det A > 0 \\
\text{Any size} & \text{every } |\lambda| < 1 \ \text{(LA202)} & \text{every } \operatorname{Re}\lambda < 0
\end{array}
$$

The second-order rows refer to $y_{t+2} + a_1 y_{t+1} + a_2 y_t = b$ and $\ddot y + a_1 \dot y + a_2 y = b$.

**Why the 2×2 tests work.** The eigenvalues of $A$ solve $p(\lambda) = \lambda^2 - (\operatorname{tr} A)\lambda + \det A = 0$, so they add up to $\operatorname{tr} A$ and multiply to $\det A$.

- *Continuous time.* Two real roots are both negative exactly when their sum is negative and their product positive, and a complex pair has real part $\operatorname{tr} A / 2$. So both real parts are negative exactly when $\operatorname{tr} A < 0$ and $\det A > 0$. This is DY04's $a_1 > 0$, $a_2 > 0$ with $a_1 = -\operatorname{tr} A$ and $a_2 = \det A$.
- *Discrete time.* Both roots lie inside the unit circle exactly when
$$p(1) = 1 - \operatorname{tr} A + \det A > 0, \qquad p(-1) = 1 + \operatorname{tr} A + \det A > 0, \qquad \det A < 1.$$
The first two say that no real root lies beyond 1 or beyond $-1$; together they read $|\operatorname{tr} A| < 1 + \det A$. The third stops a complex pair, whose size is $\sqrt{\det A}$, from being too large. These are the $2 \times 2$ case of the **Jury (Schur–Cohn) conditions**, and with $\operatorname{tr} A = -a_1$, $\det A = a_2$ they are exactly DY02's three conditions. Call $1 + \det A - |\operatorname{tr} A|$ the **margin**: the system is stable when the margin is positive and $\det A < 1$.

The two tests really differ. Example 2 has $\operatorname{tr} A = 1.6$ and $\det A = 0.7$: stable as a discrete system, but as $\dot x = Ax$ it would be unstable, because the trace is positive. The other way round, $A = \begin{pmatrix} -3 & 0 \\ 0 & -0.5 \end{pmatrix}$ is stable as $\dot x = Ax$ (trace $-3.5$, determinant $1.5$), but as $x_{t+1} = Ax_t$ the first component is multiplied by $-3$ each period and explodes: the margin is $1 + 1.5 - 3.5 = -1$.

**Linearisation of a nonlinear model.** Near a steady state, replace the function by its tangent line.

- *Discrete,* $x_{t+1} = f(x_t)$ with $f(x^*) = x^*$: the gap obeys $x_{t+1} - x^* \approx f'(x^*)\,(x_t - x^*)$. So $x^*$ is locally stable if $|f'(x^*)| < 1$ and unstable if $|f'(x^*)| > 1$; a negative $f'(x^*)$ makes the path jump from one side to the other, as in the cobweb model.
- *Continuous,* $\dot x = g(x)$ with $g(x^*) = 0$: the gap obeys $\tfrac{d}{dt}(x - x^*) \approx g'(x^*)\,(x - x^*)$. So $x^*$ is locally stable if $g'(x^*) < 0$ and unstable if $g'(x^*) > 0$: the phase-line arrows of DY03 in a single number. Near a stable steady state the gap halves every $\ln 2 / |g'(x^*)|$.
- *Two variables:* the Jacobian matrix of partial derivatives at the steady state (DY05) takes the place of $A$, and the trace–determinant tests apply to it.

The linear test gives the right local answer unless a root lies exactly on the border ($|f'(x^*)| = 1$, $g'(x^*) = 0$, or an eigenvalue with $|\lambda| = 1$ or $\operatorname{Re}\lambda = 0$); there it is silent and the nonlinear terms decide. It says nothing about what happens far from the steady state.

**The Solow model, linearised.** Capital per worker follows $\dot k = g(k) = s\,k^{\alpha} - (n + \delta)\,k$ (DY03). At the positive steady state $s\,(k^*)^{\alpha - 1} = n + \delta$, so
$$g'(k^*) = s\,\alpha\,(k^*)^{\alpha - 1} - (n + \delta) = \alpha(n + \delta) - (n + \delta) = -(1 - \alpha)(n + \delta) < 0.$$
The steady state is always stable, and the gap closes at the **speed of convergence** $(1 - \alpha)(n + \delta)$. With $\alpha = 0.3$, $n = 0.01$ and $\delta = 0.04$ the speed is $0.035$ a year, so half the gap closes in $\ln 2 / 0.035 \approx 19.8$ years, whatever the saving rate. The point $k = 0$ is a second steady state, but an unstable one: there the slope of $s\,k^{\alpha}$ is infinite, so any small stock of capital grows. Since $\dot k > 0$ below $k^*$ and $\dot k < 0$ above it, $k^*$ is globally stable for every $k > 0$.

**Multiple equilibria.** In a one-variable model whose curve crosses the steady-state line cleanly, stable and unstable steady states alternate: if $g$ crosses zero from positive to negative at one steady state, it must cross back from negative to positive at the next. Each unstable steady state is a threshold between the basins of attraction of its stable neighbours. A **poverty trap** is a low stable steady state with its own basin: small help is undone, but a push across the threshold leads to the high steady state (Example 3).

**The correspondence principle.** Samuelson's correspondence principle says that assuming an equilibrium is stable tells you the signs of its comparative statics. Suppose a price rises with excess demand, $\dot p = \lambda\,E(p, \theta)$ with $\lambda > 0$, where $\theta$ shifts demand up ($E_\theta > 0$). Linearising, the equilibrium is stable when $E_p < 0$. By the implicit function theorem (MV05), $dp^*/d\theta = -E_\theta / E_p$, which is positive whenever the equilibrium is stable. So a stable model gives definite predictions; an unstable equilibrium could give odd comparative statics, but it would never be observed anyway.

**Saddle points and jump variables.** If a $2 \times 2$ continuous system has $\det A < 0$, its eigenvalues are real with opposite signs: the steady state is a **saddle**. Almost every path runs away, but along one line, the **saddle path** or stable arm drawn in DY05, paths converge (in discrete time: one $|\lambda| < 1$ and one $|\lambda| > 1$). In many models one variable is **predetermined**, fixed by the past, like capital or debt, and the other is a **jump variable**, like an asset price, an exchange rate or consumption, which is chosen today with an eye on the future. Under rational expectations people rule out explosive paths, so after news the jump variable moves at once onto the saddle path, and the economy then glides along it to the steady state. Such a model is called **saddle-path stable**. As a rule of thumb (the Blanchard–Kahn condition), there is exactly one such path when the number of unstable roots equals the number of jump variables.

## Interactive
::widget{id="poverty-trap-map"}

The top graph plots next period's capital per worker against this period's for the poverty-trap model of Example 3, $k_{t+1} = k_t - 0.02(k_t - 2)(k_t - 5)(k_t - 10) + z$, and the bottom graph shows the same path over time. You start at $z = 0$ and $k_0 = 4$: the panel shows steady states 2, 5 and 10, stable ones 2 and 10, and after 20 steps the economy is at 2, heading for the trap. Move **Starting capital** $k_0$ to 5.5: now the staircase climbs to 10. Every start below 5 ends at 2 and every start above it at 10, so the hollow dot at 5 is the border between the two basins of attraction. Then set $k_0$ back to 4 and raise the **Boost to investment** $z$ to 0.3: the two low steady states vanish, the panel lists a single steady state, 10.34, and the same economy now escapes the trap. Finally lower $z$ to $-0.75$: this time the rich steady state disappears.

## Worked examples

### Example 1 (easy): a fishery with two steady states
A fish stock $x_t$ (thousand tonnes) grows by $0.5\,x_t(1 - x_t/200)$ a year, and the fleet catches 21 each year, so $x_{t+1} = f(x_t) = x_t + 0.5\,x_t(1 - x_t/200) - 21$. Find the steady states, decide which are stable, and follow stocks that start at 50 and at 70.

1. $0.5\,x(1 - x/200) = 21 \;\Rightarrow\; x^2 - 200x + 8400 = 0 \;\Rightarrow\; x^* = 60 \text{ or } x^* = 140$
   *Why:* at a steady state natural growth exactly replaces the catch; multiplying $0.5x - x^2/400 = 21$ by $-400$ gives the quadratic, whose roots add up to 200 and multiply to 8400.
2. $f'(x) = 1 + 0.5\left(1 - \dfrac{2x}{200}\right) = 1.5 - \dfrac{x}{200}$
   *Why:* the derivative of $x$ is 1, that of $0.5x - 0.5x^2/200$ is $0.5 - x/200$, and the constant catch drops out.
3. $f'(140) = 1.5 - 0.7 = 0.8, \quad |0.8| < 1$: stable
   *Why:* near 140 a gap shrinks to 0.8 of its size every year without changing sign, so a stock a little above or below 140 returns to it steadily.
4. $f'(60) = 1.5 - 0.3 = 1.2 > 1$: unstable
   *Why:* near 60 a gap grows by 20 % a year, so 60 is a threshold rather than a resting point.
5. $x_0 = 50:\ x_1 = 50 + 18.75 - 21 = 47.75$; $\quad x_0 = 70:\ x_1 = 70 + 22.75 - 21 = 71.75$
   *Why:* below 60 the stock grows by less than the catch and keeps falling: it is down to 36.74 after 4 years and fished out in the eighth. Above 60 it grows by more than the catch and climbs towards 140 (139.88 after 40 years). The same catch is sustainable or ruinous depending on which basin the stock is in.

```verify
f(x) = x + 0.5*x*(1 - x/200) - 21
fp(x) = 1.5 - x/200
assert f(60) == 60
assert f(140) == 140
assert 60 + 140 == 200 and 60*140 == 8400
# the derivative formula against a numerical derivative
h = 0.0001
assert abs((f(140 + h) - f(140 - h))/(2*h) - fp(140)) < 0.000001
assert abs(fp(140) - 0.8) < 1e-12
assert abs(fp(60) - 1.2) < 1e-12
assert 0.5*50*(1 - 50/200) == 18.75
assert f(50) == 47.75
assert 0.5*70*(1 - 70/200) == 22.75
assert f(70) == 71.75
x4 = f(f(f(f(50))))
assert abs(x4 - 36.74) < 0.005
x7 = f(f(f(x4)))
assert x7 > 0 and f(x7) < 0
```

### Example 2 (medium): a central bank and stable inflation
Measure inflation $\pi_t$ and the output gap $y_t$ as deviations from target, in percentage points, one period being a quarter. Inflation feeds on itself and on a booming economy, and the central bank raises interest rates when inflation is high, which cools output next quarter:
$$\pi_{t+1} = 1.1\,\pi_t + 0.3\,y_t, \qquad y_{t+1} = -0.5\,\pi_t + 0.5\,y_t.$$
Is the steady state $(0, 0)$ stable, and how strong must the bank's reaction be?

1. $A = \begin{pmatrix} 1.1 & 0.3 \\ -0.5 & 0.5 \end{pmatrix}, \quad \operatorname{tr} A = 1.6, \quad \det A = 1.1 \cdot 0.5 - 0.3 \cdot (-0.5) = 0.7$
   *Why:* the system is $x_{t+1} = Ax_t$, and the $2 \times 2$ test needs only the trace and the determinant.
2. $1 + \det A - |\operatorname{tr} A| = 1 + 0.7 - 1.6 = 0.1 > 0, \quad \det A = 0.7 < 1$: stable
   *Why:* both Jury conditions hold, so both eigenvalues lie inside the unit circle and a shock to inflation dies out.
3. $\lambda^2 - 1.6\lambda + 0.7 = 0, \quad \lambda = 0.8 \pm 0.245i, \quad |\lambda| = \sqrt{0.7} = 0.837$
   *Why:* the discriminant $2.56 - 2.8 = -0.24$ is negative, so the roots are complex: inflation returns in damped cycles. After a shock of 1 point it falls below target in the ninth quarter ($\pi_9 = -0.07$) before settling.
4. With reaction $c$ in place of 0.5: $\det A = 0.55 + 0.3c$, margin $= 0.3c - 0.05 > 0 \iff c > 1/6 \approx 0.17$, and $\det A < 1 \iff c < 1.5$
   *Why:* with no reaction ($c = 0$) the eigenvalues are 1.1 and 0.5 and inflation spirals away; too weak a reaction cannot stop it, and an overreaction ($c > 1.5$) creates cycles that grow. Policy is stabilising only in between.
5. As a continuous system $\dot x = Ax$: $\operatorname{tr} A = 1.6 > 0$, unstable
   *Why:* the tests are not interchangeable: the continuous test needs a negative trace, and this matrix only passes the discrete one.

```verify
A = [1.1, 0.3; -0.5, 0.5]
tr = A[1,1] + A[2,2]
dt = det(A)
assert abs(tr - 1.6) < 1e-12
assert abs(dt - 0.7) < 1e-12
m = 1 + dt - abs(tr)
assert abs(m - 0.1) < 1e-12
assert m > 0 and dt < 1
disc = tr^2 - 4*dt
assert abs(disc + 0.24) < 1e-12
assert abs(tr/2 - 0.8) < 1e-12
assert abs(sqrt(-disc)/2 - 0.245) < 0.0005
assert abs(sqrt(dt) - 0.837) < 0.0005
# inflation after a shock of 1 point: below target in quarter 9, and dying out
x8 = A^8 * [1; 0]
x9 = A^9 * [1; 0]
assert x8[1,1] > 0 and x9[1,1] < 0
assert abs(x9[1,1] + 0.07) < 0.005
x60 = A^60 * [1; 0]
assert abs(x60[1,1]) < 0.001 and abs(x60[2,1]) < 0.001
# the range of reactions c that stabilise
cLow = 0.05/0.3
assert abs(cLow - 1/6) < 1e-12
assert abs(cLow - 0.17) < 0.005
assert abs((1 + (0.55 + 0.3*0.2) - 1.6) - 0.01) < 1e-12
assert (1 + (0.55 + 0.3*0.1) - 1.6) < 0
assert abs((0.55 + 0.3*1.5) - 1) < 1e-12
# no reaction: eigenvalues 1.1 and 0.5
assert det([1.1, 0.3; 0, 0.5]) == 0.55
assert abs(det([1.1 - 1.1, 0.3; 0, 0.5 - 1.1])) < 1e-12
```

### Example 3 (hard): a poverty trap
In a stylised poor economy, capital per worker $k_t$ (in thousands) follows $k_{t+1} = f(k_t) = k_t + g(k_t)$ with net investment $g(k) = -0.02(k - 2)(k - 5)(k - 10)$. At very low capital people still save a little ($g > 0$); between 2 and 5 output is too low to replace worn-out machines and equip new workers ($g < 0$); between 5 and 10 modern technology pays off and investment booms ($g > 0$); above 10 returns fall ($g < 0$). The model is meant for $1 \le k \le 11$. Find the steady states and their stability, follow economies that start at 4 and at 6, and find how large a permanent boost $z$ to investment per period removes the trap.

1. $g(k) = 0 \;\Rightarrow\; k^* = 2,\ 5,\ 10$
   *Why:* a steady state needs zero net investment, and each bracket of the product is zero at one of them.
2. $(k - 2)(k - 5)(k - 10) = k^3 - 17k^2 + 80k - 100, \qquad f'(k) = 1 - 0.02\,(3k^2 - 34k + 80)$
   *Why:* multiplying out first makes the derivative easy: $f'(k) = 1 + g'(k)$, and the cubic differentiates term by term.
3. $f'(2) = 1 - 0.02 \cdot 24 = 0.52, \quad f'(5) = 1 - 0.02 \cdot (-15) = 1.3, \quad f'(10) = 1 - 0.02 \cdot 40 = 0.2$
   *Why:* $|f'| < 1$ at 2 and 10, so both are locally stable; $f'(5) > 1$, so 5 is unstable. They alternate, stable, unstable, stable, as they must.
4. $k_0 = 4:\ k_1 = 4 - 0.02 \cdot 2 \cdot (-1) \cdot (-6) = 3.76; \qquad k_0 = 6:\ k_1 = 6 - 0.02 \cdot 4 \cdot 1 \cdot (-4) = 6.32$
   *Why:* 4 lies in the basin of the trap at 2 and 6 in the basin of the rich steady state at 10; after 20 periods the two economies are at 2.00 and 10.00. A one-off transfer that lifts capital from 4 to 6 changes the long run for good; one that lifts it only to 4.9 is undone.
5. $g'(k) = 0$ at $k = 10/3$, where $g(10/3) = -8/27 \approx -0.30$; with $k_{t+1} = k_t + g(k_t) + z$ the low steady states exist only while $z \le 8/27$
   *Why:* the trap is a dip of $g$ below zero, at most 0.30 deep. A permanent boost larger than that lifts the whole dip above zero, and the only steady state left is the high one (10.34 for $z = 0.3$), which then attracts every start. In continuous time, $\dot k = g(k)$ gives the same verdicts: $g'(2) = -0.48$ and $g'(10) = -0.8$ are negative, $g'(5) = 0.3$ is positive.

```verify
g(k) = -0.02*(k - 2)*(k - 5)*(k - 10)
f(k) = k + g(k)
fp(k) = 1 - 0.02*(3*k^2 - 34*k + 80)
assert g(2) == 0 and g(5) == 0 and g(10) == 0
# the expanded cubic agrees at a few points
assert (3 - 2)*(3 - 5)*(3 - 10) == 3^3 - 17*3^2 + 80*3 - 100
assert (7.5 - 2)*(7.5 - 5)*(7.5 - 10) == 7.5^3 - 17*7.5^2 + 80*7.5 - 100
# slopes, also checked numerically
h = 0.0001
assert abs((f(5 + h) - f(5 - h))/(2*h) - fp(5)) < 0.000001
assert 3*2^2 - 34*2 + 80 == 24
assert 3*5^2 - 34*5 + 80 == -15
assert 3*10^2 - 34*10 + 80 == 40
assert abs(fp(2) - 0.52) < 1e-12
assert abs(fp(5) - 1.3) < 1e-12
assert abs(fp(10) - 0.2) < 1e-12
assert abs(f(4) - 3.76) < 1e-12
assert abs(f(6) - 6.32) < 1e-12
# 20 periods from 4 and from 6
a = f(f(f(f(f(f(f(f(f(f(4))))))))))
a = f(f(f(f(f(f(f(f(f(f(a))))))))))
b = f(f(f(f(f(f(f(f(f(f(6))))))))))
b = f(f(f(f(f(f(f(f(f(f(b))))))))))
assert abs(a - 2) < 0.005
assert abs(b - 10) < 0.005
assert f(4.9) < 4.9
# the bottom of the dip
assert abs(fp(10/3) - 1) < 1e-12
assert abs(g(10/3) + 8/27) < 1e-12
assert abs(8/27 - 0.30) < 0.005
# with z = 0.3: no low steady state, a single high one near 10.34
z = 0.3
assert g(10/3) + z > 0 and g(2) + z > 0 and g(1) + z > 0
assert g(10.335) + z > 0 and g(10.345) + z < 0
assert abs((fp(2) - 1) + 0.48) < 1e-12
assert abs((fp(10) - 1) + 0.8) < 1e-12
assert abs((fp(5) - 1) - 0.3) < 1e-12
```

## Common mistakes
- Calling a steady state stable because $f(x^*) = x^*$; every steady state satisfies that, and stability is decided by the slope $f'(x^*)$ (VALUE_NOT_SLOPE).
- Linearising at the wrong point, for example taking $f'(0)$ instead of $f'(x^*)$ (SLOPE_AT_ZERO).
- Reporting $1 - f'(x^*)$, the share of the gap closed per period, as the number to compare with 1 (ONE_MINUS_SLOPE).
- Differentiating $x^2/K$ as $x/K$ in a logistic-type map (DERIVATIVE_SLIP).
- Testing a discrete system with $\operatorname{tr} A < 0$ and $\det A > 0$, or a continuous one with $|\lambda| < 1$; use the rule that matches the model's clock (TIME_RULE_MIXUP).
- Writing $1 + \det A - \operatorname{tr} A$ when the trace is negative, which checks only the easier of the two conditions (DROPPED_ABS).
- Checking only $|\operatorname{tr} A| < 1$ and forgetting the determinant (ONLY_TRACE).
- Computing $\det A$ as $ad + bc$ (DET_PLUS).
- Stopping at a positive margin: if $\det A \ge 1$ the eigenvalues are a complex pair of size $\sqrt{\det A} \ge 1$ and the cycles do not die out.
- Taking $n + \delta$ as the speed of convergence in the Solow model (NO_ALPHA_FACTOR), or $\alpha(n + \delta)$ (ALPHA_NOT_ONE_MINUS); the speed is $(1 - \alpha)(n + \delta)$.
- Giving $1/\text{speed}$ as the half-life instead of $\ln 2/\text{speed}$ (NO_LOG).
- Leaving population growth $n$ out of the speed $(1 - \alpha)(n + \delta)$ (IGNORED_POPULATION).
- Calling a stable steady state of a model with several equilibria globally stable: it attracts only the starts in its own basin.
- Reading a verdict from $|f'(x^*)| = 1$ or $g'(x^*) = 0$: on the border the linear test is silent.

## Practice
- `harvest-map-slope-at-steady-state` (difficulty 1): the slope $f'(x^*)$ of a fish, timber or herd harvest map $x_{t+1} = x_t + g\,x_t(1 - x_t/K) - H$ at a given steady state, which decides whether it is stable; distractors VALUE_NOT_SLOPE, SLOPE_AT_ZERO, ONE_MINUS_SLOPE, DERIVATIVE_SLIP.
- `jury-margin-2x2-discrete` (difficulty 2): the margin $1 + \det A - |\operatorname{tr} A|$ of a discrete $2 \times 2$ system for inflation and output, two trading countries or a market, then the verdict together with $\det A < 1$; distractors DROPPED_ABS, ONLY_TRACE, DET_PLUS.
- `solow-convergence-half-life` (difficulty 3): the half-life $\ln 2 / \big((1 - \alpha)(n + \delta)\big)$ of a gap near the Solow steady state, from the linearised equation; distractors NO_ALPHA_FACTOR, ALPHA_NOT_ONE_MINUS, NO_LOG, IGNORED_POPULATION.

## Real world
- Monetary policy: in standard models inflation dynamics are stable only if the central bank raises its interest rate by more than one for one when inflation rises, a rule known as the Taylor principle. Many economists argue that weak reactions in the 1970s let inflation drift upwards, and that stronger reactions since the early 1980s helped to anchor it.
- Development economics: poverty traps with several equilibria lie behind the "big push" argument that a large, coordinated burst of investment or aid can move a poor economy into the basin of a richer steady state, while small amounts are absorbed. How common such traps are in real data is still debated.
- Fisheries: the northern cod stock off Newfoundland collapsed in the early 1990s and Canada closed the fishery in 1992. As in Example 1, a catch that a large stock can bear can drive a small one below its threshold, and stocks below the threshold recover only slowly, if at all.
- Macroeconomic models: the models central banks use to forecast are checked for saddle-path stability before they are solved: the number of unstable roots must match the number of forward-looking variables. The same logic explains exchange-rate overshooting, where the exchange rate jumps on news and then drifts back along its saddle path.

---
id: DY05
title: Systems of equations and phase diagrams
block: DY
coreYear: 3
prerequisites: [DY03, LA202]
estMinutes: 50
status: draft
economicUses:
  - "Linked markets: do the prices of substitutes or complements settle together after a shock?"
  - "Inflation and unemployment: how a boom unwinds, and whether the economy cycles on the way back"
  - "Entry and exit of firms chasing customers: damped cycles in an industry"
  - "Saddle paths: why consumption, share prices and exchange rates jump when news arrives"
  - "Phase diagrams of growth models such as Ramsey's"
generators: [two-market-steady-state-price, stability-threshold-trace-determinant, saddle-path-initial-jump]
widgets: [linear-phase-portrait]
mistakeCodes:
  OWN_MARKET_ONLY:
    label: Left out the other market's price
    explanation: In a linked system each rate of change depends on both prices. Setting ṗ₁ = 0 with p₂ left out gives b₁/m₁, a price that is only right if the other market has no effect. Solve both equations together.
  SIGN_SOLVE:
    label: Solved Ax = b instead of Ax = −b
    explanation: The steady state of ẋ = Ax + b has Ax* + b = 0, so Ax* = −b and x* = −A⁻¹b. Forgetting the minus sign flips the sign of the answer, which shows up as a negative price.
  OTHER_PRICE:
    label: Gave the other price
    explanation: Solving the two equations gives both steady-state prices. Check which good the question asks about before you answer.
  ONLY_TRACE:
    label: Checked only the trace
    explanation: tr A < 0 is not enough. If det A < 0 the eigenvalues have opposite signs and the steady state is a saddle, whatever the trace. Stability needs tr A < 0 and det A > 0, so take the tighter of the two limits.
  ONLY_DETERMINANT:
    label: Checked only the determinant
    explanation: det A > 0 only says the eigenvalues have the same sign (or are a complex pair). They could both be positive. Stability also needs tr A < 0, so take the tighter of the two limits.
  DET_SIGN:
    label: Wrote the determinant as ad + bc
    explanation: The determinant of a 2×2 matrix is ad − bc, the product of the diagonal minus the product of the other two entries. With a plus sign the limit from det A > 0 comes out with the wrong sign.
  OWN_EFFECT_ONLY:
    label: Asked only that each variable pulls itself back
    explanation: Negative diagonal entries are neither necessary nor sufficient. The cross effects enter the determinant and can turn the steady state into a saddle, or keep it stable when one own effect is positive. Use tr A < 0 and det A > 0.
  UNSTABLE_ARM:
    label: Used the unstable eigenvalue
    explanation: The saddle path is the line along the eigenvector of the negative eigenvalue; only that part of a path dies out. Starting on the eigenvector of the positive eigenvalue sends the economy away from the steady state.
  EIGENVECTOR_SIGN:
    label: Sign slip in the eigenvector
    explanation: From the first row of A − λI, (a − λ)·1 + b·m = 0, so m = (λ − a)/b, not (a − λ)/b. Check that A·(1, m) equals λ·(1, m).
  NULLCLINE_NOT_ARM:
    label: Started on a nullcline instead of the saddle path
    explanation: Choosing the jump so that k̇ = 0 puts the economy on the k̇ = 0 nullcline, where capital is momentarily at rest, not on the path that leads to the steady state. The saddle path follows the stable eigenvector.
resources:
  - { title: "18.03SC Differential Equations: Qualitative Behavior: Phase Portraits (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/pages/unit-iv-first-order-systems/qualitative-behavior-phase-portraits/", kind: course, verifiedAt: 2026-10-18 }
  - { title: "18.06SC Linear Algebra: Differential Equations and exp(At) (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/pages/least-squares-determinants-and-eigenvalues/differential-equations-and-exp-at/", kind: course, verifiedAt: 2026-10-18 }
  - { title: "Differential Equations for Engineers (Lebl), 8.1 Linearization, Critical Points, and Equilibria (LibreTexts)", url: "https://math.libretexts.org/Bookshelves/Differential_Equations/Differential_Equations_for_Engineers_(Lebl)/8%3A_Nonlinear_Systems/8.1%3A_Linearization_critical_points_and_equilibria", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
Most economic models have more than one moving part, and the parts push each other. The price of tea affects the demand for coffee; high inflation makes the central bank raise interest rates, which raises unemployment, which in turn pulls inflation down; the stock of capital decides how much an economy can consume, and consumption decides how fast capital is built up. In continuous time such a model is a **system** of differential equations, $\dot x = f(x, y)$ and $\dot y = g(x, y)$, in which each rate of change depends on both variables.

The questions are those of DY03, asked of two variables at once. Where is the steady state? After a shock, does the economy return to it? Does it go straight back, or in cycles, with inflation and unemployment chasing each other round the steady state? Eigenvalues (LA202) answer these questions with numbers, and **phase diagrams** answer them with a picture. Together they are the standard tools of macroeconomic dynamics, from growth models to models of inflation, asset prices and exchange rates.

## Intuition
Think of the state of the economy as a point $(x, y)$ in a plane, the **phase plane**. At every point the equations say how fast $x$ and $y$ are changing, so they attach an arrow $(\dot x, \dot y)$ to the point. A path of the economy follows the arrows, like a leaf carried by a stream. A **steady state** is a point where the arrow has length zero: nothing moves.

For a linear system there are usually special straight lines through the steady state on which the arrows point exactly along the line: the eigenvector directions. On such a line the system behaves like a single equation from DY03, and the gap to the steady state grows or shrinks like $e^{\lambda t}$, where $\lambda$ is the eigenvalue. Every other starting point is a mix of the two directions, and each part grows or shrinks at its own rate. So:

- both eigenvalues negative: everything flows into the steady state (a stable **node**);
- one negative, one positive: paths come in along one line and are thrown out along the other (a **saddle**);
- complex eigenvalues: there are no special straight lines, the arrows turn, and paths circle round the steady state (a **focus**, or spiral). The real part decides whether the circles shrink or grow.

This is new compared with DY03: a single first-order equation can never overshoot its steady state, but two variables pushing each other can produce cycles.

## Definition and formulas
**Linear systems.** A linear system in two variables is
$$\dot x = a x + b y, \qquad \dot y = c x + d y, \qquad\text{or}\qquad \dot{\mathbf x} = A\mathbf x, \quad A = \begin{pmatrix} a & b \\ c & d \end{pmatrix}.$$
With constants, $\dot{\mathbf x} = A\mathbf x + \mathbf b$, the **steady state** solves $A\mathbf x^* + \mathbf b = \mathbf 0$, so if $\det A \neq 0$,
$$\mathbf x^* = -A^{-1}\mathbf b.$$
The gaps $\mathbf z = \mathbf x - \mathbf x^*$ then obey $\dot{\mathbf z} = A\mathbf z$, so everything below about $\dot{\mathbf x} = A\mathbf x$ applies to gaps from the steady state.

**Solution by eigenvalues.** Try a path that keeps its direction, $\mathbf x(t) = e^{\lambda t}\mathbf v$. Then $\dot{\mathbf x} = \lambda e^{\lambda t}\mathbf v$ and $A\mathbf x = e^{\lambda t}A\mathbf v$, which are equal exactly when $A\mathbf v = \lambda\mathbf v$: $\lambda$ must be an eigenvalue and $\mathbf v$ an eigenvector. If $A$ has two different real eigenvalues, every solution is
$$\mathbf x(t) = c_1 e^{\lambda_1 t}\mathbf v_1 + c_2 e^{\lambda_2 t}\mathbf v_2,$$
with $c_1, c_2$ found from the start, $\mathbf x(0) = c_1\mathbf v_1 + c_2\mathbf v_2$. This is the continuous twin of $\mathbf x_t = c_1\lambda_1^t\mathbf v_1 + c_2\lambda_2^t\mathbf v_2$ in LA203: $\lambda^t$ becomes $e^{\lambda t}$, so a part dies out when $\lambda < 0$, not when $|\lambda| < 1$. If the eigenvalues are complex, $\lambda = \alpha \pm \beta i$, the solutions are combinations of $e^{\alpha t}\cos\beta t$ and $e^{\alpha t}\sin\beta t$: the path turns round the steady state once every $2\pi/\beta$ time units, while its size changes like $e^{\alpha t}$.

**Classification.** Recall $\lambda^2 - (\operatorname{tr} A)\lambda + \det A = 0$, with $\lambda_1 + \lambda_2 = \operatorname{tr} A$ and $\lambda_1\lambda_2 = \det A$ (LA202).
$$
\begin{array}{lll}
\text{Eigenvalues} & \text{In terms of tr and det} & \text{Steady state} \\ \hline
\text{real, both negative} & \det > 0,\ \operatorname{tr} < 0,\ \operatorname{tr}^2 \ge 4\det & \text{stable node} \\
\text{real, both positive} & \det > 0,\ \operatorname{tr} > 0,\ \operatorname{tr}^2 \ge 4\det & \text{unstable node} \\
\text{real, opposite signs} & \det < 0 & \text{saddle} \\
\text{complex, real part negative} & \operatorname{tr} < 0,\ \operatorname{tr}^2 < 4\det & \text{stable focus (spiral in)} \\
\text{complex, real part positive} & \operatorname{tr} > 0,\ \operatorname{tr}^2 < 4\det & \text{unstable focus (spiral out)} \\
\text{purely imaginary} & \operatorname{tr} = 0,\ \det > 0 & \text{centre (closed loops)}
\end{array}
$$

**The trace–determinant test.** A two-variable system $\dot{\mathbf x} = A\mathbf x$ is stable (every path tends to the steady state) exactly when
$$\det A > 0 \quad\text{and}\quad \operatorname{tr} A < 0.$$
The reason: $\det A > 0$ means the eigenvalues are real with the same sign, or a complex pair; $\operatorname{tr} A < 0$ then makes both negative, or the common real part $\operatorname{tr} A / 2$ negative. If $\det A < 0$ the steady state is a saddle whatever the trace.

**Nonlinear systems and phase diagrams.** For $\dot x = f(x, y)$, $\dot y = g(x, y)$:

- *Steady states* are the points where $f(x, y) = 0$ and $g(x, y) = 0$ at the same time.
- *Nullclines* are the curves $f = 0$ (where $\dot x = 0$, so the motion is straight up or down) and $g = 0$ (where $\dot y = 0$, so the motion is straight left or right). Steady states are where an $\dot x = 0$ nullcline crosses a $\dot y = 0$ nullcline.
- Each nullcline splits the plane into a side where the variable rises and a side where it falls; test one point on each side. Near a crossing, the two nullclines cut the plane into four regions, and in each the arrows point roughly north-east, north-west, south-west or south-east. These arrows show whether paths run into the steady state, pass by it, or circle round it.
- *Linearisation.* Near a steady state $(x^*, y^*)$ the gaps behave like $\dot{\mathbf z} = J\mathbf z$, where $J$ is the **Jacobian** matrix of partial derivatives (MV02) at the steady state:
$$J = \begin{pmatrix} f_x & f_y \\ g_x & g_y \end{pmatrix}_{(x^*,\,y^*)}.$$
Classify $J$ with the table. The answer holds for the nonlinear system near the steady state, unless $J$ has an eigenvalue with zero real part (a centre or $\det J = 0$); then the nonlinear terms decide. Example 3 works through a whole case.

**Saddle paths in economics.** In many models one variable is *predetermined*: it can only change gradually, like the capital stock or the price level. The other is *forward-looking* and can jump the moment news arrives, like consumption, a share price or an exchange rate. The steady state is often a saddle. Of all the values the jump variable could take today, only one puts the economy on the stable arm, the line that leads to the steady state; every other value starts a path that runs away (consumption that eats up the capital stock, or a share price that rises for ever in a bubble). Economists therefore assume that the forward-looking variable jumps straight onto the stable arm: this is **saddle-path stability**. In a linear model the stable arm is the line through the steady state along the eigenvector $(1, m)$ of the negative eigenvalue $\lambda_s$, with $m = (\lambda_s - a)/b$ from the first row of $A - \lambda_s I$, so the jump is
$$y(0) - y^* = m\,\big(k(0) - k^*\big).$$
For example, in a model of investment let the gaps of capital $k$ and of the share price $q$ of firms follow $\dot k = -0.1k + 0.2q$ and $\dot q = 0.2k + 0.2q$. Here $\operatorname{tr} A = 0.1$ and $\det A = -0.06$, so the eigenvalues are $0.3$ and $-0.2$: a saddle. For $\lambda_s = -0.2$, $(-0.1 + 0.2) + 0.2m = 0$ gives $m = -0.5$. If capital starts 4 below its steady state, the share price must jump to $q(0) = -0.5 \cdot (-4) = 2$ above it: scarce capital earns a high return, the high share price makes investment attractive, and capital and the share price then glide back together, the gap halving every $\ln 2 / 0.2 \approx 3.47$ years. The Ramsey growth model has the same structure in capital and consumption, with a saddle where the $\dot k = 0$ and $\dot c = 0$ nullclines cross; DO04 derives it.

## Interactive
::widget{id="linear-phase-portrait"}

The widget draws the phase portrait of Example 2's model, $\dot\pi = a\pi - 0.2u$ and $\dot u = 0.1\pi + du$, for the gaps of inflation and unemployment. The two sliders set the own effects $a$ (how inflation reacts to its own gap) and $d$ (the same for unemployment). Lilac arrows show the direction of motion, the gold curves are paths from four starting points, the hollow dot is Example 2's start $(3, -2)$, and the green dashed lines are the eigenvector directions when they exist. Check: at the start, with $a = -0.4$ and $d = -0.1$, the panel shows tr A, det A = −0.5, 0.06, eigenvalues −0.2 and −0.3 and a stable node. Now keep $d = -0.1$ and raise $a$. By $a = -0.3$ the eigenvalues have turned complex and the paths spiral in (a stable focus). At $a = 0.1$ the panel shows 0, 0.01 and $0 \pm 0.1i$, a centre: the paths become closed loops. Above that the loops spiral outwards, so $a = 0.1$ is the stability threshold, where the trace reaches 0 while the determinant is still positive. Finally set $a = 0.3$ and $d = -0.3$: the determinant is −0.07 and the steady state is a saddle.

## Worked examples

### Example 1 (easy): two linked markets
The prices of tea, $p_1$, and coffee, $p_2$, adjust to excess demand according to
$$\dot p_1 = 20 - 3p_1 + p_2, \qquad \dot p_2 = 12 + p_1 - 3p_2,$$
with time in months. A higher coffee price raises the demand for tea and so pushes the tea price up, and the other way round. Find the steady state and decide whether prices settle there, and how.

1. $3p_1 - p_2 = 20, \qquad -p_1 + 3p_2 = 12$
   *Why:* at the steady state both prices are at rest, so $\dot p_1 = 0$ and $\dot p_2 = 0$ at the same time. Each equation on its own is a nullcline, a line on which one of the prices does not move.
2. $p_2 = 3p_1 - 20 \;\Rightarrow\; -p_1 + 9p_1 - 60 = 12 \;\Rightarrow\; p_1^* = 9, \quad p_2^* = 7$
   *Why:* substitution; the coefficient determinant $3 \cdot 3 - 1 = 8$ is not zero, so this is the only steady state. Check: $20 - 27 + 7 = 0$ and $12 + 9 - 21 = 0$.
3. $\dot{\mathbf z} = A\mathbf z, \quad A = \begin{pmatrix} -3 & 1 \\ 1 & -3 \end{pmatrix}, \quad \operatorname{tr} A = -6, \quad \det A = 9 - 1 = 8$
   *Why:* the gaps $\mathbf z = \mathbf p - \mathbf p^*$ obey the system without its constants. Since $\det A > 0$ and $\operatorname{tr} A < 0$, the steady state is stable: prices settle at 9 and 7 from any start.
4. $\operatorname{tr}^2 - 4\det = 36 - 32 = 4 > 0, \quad \lambda = \dfrac{-6 \pm 2}{2} = -2,\ -4$, with eigenvectors $(1, 1)$ and $(1, -1)$
   *Why:* the eigenvalues are real and negative, so it is a stable node: prices move straight back without cycling. A gap that pushes both prices up together, along $(1, 1)$, closes at rate 2 only, because each high price props up demand in the other market; a gap that pushes them apart, along $(1, -1)$, closes twice as fast.

```verify
A = [-3, 1; 1, -3]
b = [20; 12]
x = -inv(A)*b
assert abs(x[1,1] - 9) < 1e-9
assert abs(x[2,1] - 7) < 1e-9
assert 20 - 3*9 + 7 == 0
assert 12 + 9 - 3*7 == 0
assert 3*3 - 1*1 == 8
assert trace(A) == -6
assert det(A) == 8
assert trace(A)^2 - 4*det(A) == 4
assert (-6 + 2)/2 == -2 and (-6 - 2)/2 == -4
assert deepEqual(A*[1; 1], -2*[1; 1])
assert deepEqual(A*[1; -1], -4*[1; -1])
```

### Example 2 (medium): a boom that unwinds
The gaps of inflation $\pi$ and unemployment $u$ from their long-run values (in percentage points) follow
$$\dot\pi = -0.4\pi - 0.2u, \qquad \dot u = 0.1\pi - 0.1u,$$
with time in years. High unemployment pulls inflation down; high inflation makes the central bank tighten, which raises unemployment. After a boom, $\pi(0) = 3$ and $u(0) = -2$. Find the path, the gaps after 5 years, and how the economy approaches the steady state.

1. $\operatorname{tr} A = -0.5, \quad \det A = 0.04 + 0.02 = 0.06, \quad \lambda^2 + 0.5\lambda + 0.06 = 0, \quad \lambda = \dfrac{-0.5 \pm 0.1}{2} = -0.2,\ -0.3$
   *Why:* $\det A > 0$ and $\operatorname{tr} A < 0$, so the system is stable; $\operatorname{tr}^2 - 4\det = 0.01 > 0$, so the eigenvalues are real and it is a stable node.
2. $\lambda_1 = -0.2$: $(-0.4 + 0.2) - 0.2y = 0 \Rightarrow \mathbf v_1 = (1, -1)$; $\quad \lambda_2 = -0.3$: $(-0.4 + 0.3) - 0.2y = 0 \Rightarrow y = -0.5,\ \mathbf v_2 = (2, -1)$
   *Why:* the first row of $A - \lambda I$ with $\mathbf v = (1, y)$; $(1, -0.5)$ is scaled to $(2, -1)$ to avoid fractions.
3. $(3, -2) = c_1(1, -1) + c_2(2, -1)$: $c_1 + 2c_2 = 3$ and $c_1 + c_2 = 2$, so $c_2 = 1$, $c_1 = 1$
   *Why:* the starting point is split into its two eigenvector parts; each part then shrinks at its own rate.
4. $\pi(t) = e^{-0.2t} + 2e^{-0.3t}, \quad u(t) = -e^{-0.2t} - e^{-0.3t}$; $\quad \pi(5) = 0.3679 + 0.4463 = 0.81, \quad u(5) = -0.3679 - 0.2231 = -0.59$
   *Why:* $\mathbf x(t) = c_1 e^{\lambda_1 t}\mathbf v_1 + c_2 e^{\lambda_2 t}\mathbf v_2$. At the start $\dot\pi = -1.2 + 0.4 = -0.8$ and $\dot u = 0.3 + 0.2 = 0.5$: inflation falls while unemployment rises back towards normal.
5. As $t$ grows, $e^{-0.3t}$ dies out faster than $e^{-0.2t}$, so the path comes in along $\mathbf v_1 = (1, -1)$: $u \approx -\pi$
   *Why:* the slower eigenvalue governs the long run. In the last stage of the disinflation, each point of inflation above target comes with about one point of unemployment below its long-run level; the widget shows this path as the one from the hollow dot.

```verify
A = [-0.4, -0.2; 0.1, -0.1]
assert abs(trace(A) + 0.5) < 1e-12
assert abs(det(A) - 0.06) < 1e-12
assert abs(trace(A)^2 - 4*det(A) - 0.01) < 1e-12
l1 = (-0.5 + 0.1)/2
l2 = (-0.5 - 0.1)/2
assert abs(l1 + 0.2) < 1e-12 and abs(l2 + 0.3) < 1e-12
assert abs(l1^2 + 0.5*l1 + 0.06) < 1e-12
assert abs(l2^2 + 0.5*l2 + 0.06) < 1e-12
assert sum(abs(A*[1; -1] - l1*[1; -1])) < 1e-12
assert sum(abs(A*[2; -1] - l2*[2; -1])) < 1e-12
assert sum(abs([1; -1] + [2; -1] - [3; -2])) < 1e-12
P(t) = exp(-0.2*t) + 2*exp(-0.3*t)
U(t) = -exp(-0.2*t) - exp(-0.3*t)
assert P(0) == 3 and U(0) == -2
assert abs(exp(-1) - 0.3679) < 0.00005
assert abs(2*exp(-1.5) - 0.4463) < 0.00005
assert abs(exp(-1.5) - 0.2231) < 0.00005
assert abs(P(5) - 0.81) < 0.005
assert abs(U(5) + 0.59) < 0.005
# the path solves the system (numerical derivatives at t = 5)
h = 0.000001
assert abs((P(5 + h) - P(5 - h))/(2*h) - (-0.4*P(5) - 0.2*U(5))) < 0.00001
assert abs((U(5 + h) - U(5 - h))/(2*h) - (0.1*P(5) - 0.1*U(5))) < 0.00001
assert abs(-0.4*3 - 0.2*(-2) + 0.8) < 1e-12
assert abs(0.1*3 - 0.1*(-2) - 0.5) < 1e-12
# late in the path u/pi is close to -1
assert abs(U(60)/P(60) + 1) < 0.005
```

### Example 3 (hard): firms chasing customers
In a local delivery market, $x$ is the number of customers not yet served (in thousands) and $y$ the number of firms (in tens). Without firms, unserved demand grows towards a ceiling of 3; firms serve customers, and they enter when there are more than 1 thousand unserved customers and leave when there are fewer:
$$\dot x = x(3 - x - y), \qquad \dot y = y(x - 1),$$
with time in years. Find the steady states, sketch the arrows of the phase diagram, and classify the steady state with both $x$ and $y$ positive.

1. $\dot x = 0 \iff x = 0 \text{ or } y = 3 - x; \qquad \dot y = 0 \iff y = 0 \text{ or } x = 1$; steady states $(0, 0)$, $(3, 0)$ and $(1, 2)$
   *Why:* these are the nullclines; a steady state needs one $\dot x = 0$ nullcline and one $\dot y = 0$ nullcline to cross. $x = 1$ meets $y = 3 - x$ at $y = 2$.
2. Right of $x = 1$, $\dot y > 0$; left of it, $\dot y < 0$. Below the line $x + y = 3$, $\dot x > 0$; above it, $\dot x < 0$.
   *Why:* test one point in each region: at $(2, 0.5)$ the arrow is $(1, 0.5)$, north-east; at $(2, 2)$ it is $(-2, 2)$, north-west; at $(0.5, 3)$ it is $(-0.25, -1.5)$, south-west; at $(0.5, 1)$ it is $(0.75, -0.5)$, south-east. Going round $(1, 2)$ the arrows turn anticlockwise, so paths circle the steady state: firms enter while customers are plentiful, then too many firms use up the customers and some leave.
3. $J = \begin{pmatrix} 3 - 2x - y & -x \\ y & x - 1 \end{pmatrix}, \qquad J(1, 2) = \begin{pmatrix} -1 & -1 \\ 2 & 0 \end{pmatrix}$
   *Why:* the partial derivatives of $f = 3x - x^2 - xy$ and $g = xy - y$; near $(1, 2)$ the gaps follow $\dot{\mathbf z} = J\mathbf z$.
4. $\operatorname{tr} J = -1, \quad \det J = 0 + 2 = 2, \quad \operatorname{tr}^2 - 4\det = -7, \quad \lambda = -0.5 \pm 1.32i$
   *Why:* $\det J > 0$ and $\operatorname{tr} J < 0$, so $(1, 2)$ is stable; the eigenvalues are complex, so it is a stable focus. The market goes through damped cycles of entry and exit, one turn every $2\pi / (\sqrt 7 / 2) = 4.75$ years, with the size of the swings halving every $\ln 2 / 0.5 = 1.39$ years.
5. $J(3, 0) = \begin{pmatrix} -3 & -3 \\ 0 & 2 \end{pmatrix}, \ \det = -6; \qquad J(0, 0) = \begin{pmatrix} 3 & 0 \\ 0 & -1 \end{pmatrix}, \ \det = -3$
   *Why:* both other steady states are saddles. A market with no firms at $(3, 0)$ is not a resting place: a few entrants find plenty of customers, and the market moves away towards the cycles round $(1, 2)$, with 1 thousand unserved customers and 20 firms.

```verify
f(x, y) = x*(3 - x - y)
g(x, y) = y*(x - 1)
assert f(0, 0) == 0 and g(0, 0) == 0
assert f(3, 0) == 0 and g(3, 0) == 0
assert f(1, 2) == 0 and g(1, 2) == 0
# arrows in the four regions
assert f(2, 0.5) == 1 and g(2, 0.5) == 0.5
assert f(2, 2) == -2 and g(2, 2) == 2
assert f(0.5, 3) == -0.25 and g(0.5, 3) == -1.5
assert f(0.5, 1) == 0.75 and g(0.5, 1) == -0.5
# Jacobian at (1, 2) by numerical differentiation
h = 0.000001
assert abs((f(1 + h, 2) - f(1 - h, 2))/(2*h) + 1) < 0.00001
assert abs((f(1, 2 + h) - f(1, 2 - h))/(2*h) + 1) < 0.00001
assert abs((g(1 + h, 2) - g(1 - h, 2))/(2*h) - 2) < 0.00001
assert abs((g(1, 2 + h) - g(1, 2 - h))/(2*h) - 0) < 0.00001
J = [-1, -1; 2, 0]
assert trace(J) == -1 and det(J) == 2
assert trace(J)^2 - 4*det(J) == -7
assert abs(sqrt(7)/2 - 1.32) < 0.005
assert abs(2*pi/(sqrt(7)/2) - 4.75) < 0.005
assert abs(log(2)/0.5 - 1.39) < 0.005
# the other steady states
assert det([-3, -3; 0, 2]) == -6
assert det([3, 0; 0, -1]) == -3
assert abs((f(3 + h, 0) - f(3 - h, 0))/(2*h) + 3) < 0.00001
assert abs((f(3, h) - f(3, -h))/(2*h) + 3) < 0.00001
assert abs((g(3, h) - g(3, -h))/(2*h) - 2) < 0.00001
```

## Common mistakes
- Setting $\dot p_1 = 0$ and solving for $p_1$ as if the other market did not exist; both rates of change must be zero at the same time (OWN_MARKET_ONLY).
- Solving $A\mathbf x^* = \mathbf b$ instead of $A\mathbf x^* = -\mathbf b$ for the steady state of $\dot{\mathbf x} = A\mathbf x + \mathbf b$ (SIGN_SOLVE).
- Giving the steady-state price of the wrong good (OTHER_PRICE).
- Checking only $\operatorname{tr} A < 0$: with $\det A < 0$ the steady state is a saddle (ONLY_TRACE).
- Checking only $\det A > 0$: both eigenvalues could then be positive (ONLY_DETERMINANT).
- Writing the determinant as $ad + bc$ (DET_SIGN).
- Believing that the system is stable when each variable pulls itself back (negative diagonal entries) and unstable otherwise; the cross effects can change the answer either way (OWN_EFFECT_ONLY).
- Putting the start of a saddle path on the eigenvector of the positive eigenvalue, which leads away from the steady state (UNSTABLE_ARM).
- Writing the eigenvector slope as $(a - \lambda)/b$ instead of $(\lambda - a)/b$ (EIGENVECTOR_SIGN).
- Confusing the $\dot k = 0$ nullcline with the saddle path; on the nullcline capital is only momentarily at rest (NULLCLINE_NOT_ARM).
- Using the discrete-time rule $|\lambda| < 1$ for a differential equation; in continuous time a part dies out when $\lambda < 0$ (or the real part is negative).
- Thinking complex eigenvalues mean instability: they mean cycles, and the cycles die out when the real part $\operatorname{tr} A / 2$ is negative.
- Drawing slanted arrows on a nullcline: on $\dot x = 0$ the motion is straight up or down, on $\dot y = 0$ straight left or right.

## Practice
- `two-market-steady-state-price` (difficulty 1): a steady-state price of two linked markets, from $\dot p_1 = \dot p_2 = 0$; distractors OWN_MARKET_ONLY, SIGN_SOLVE, OTHER_PRICE.
- `stability-threshold-trace-determinant` (difficulty 2): the largest own effect $k$ for which a two-variable system (inflation and unemployment, firms and customers, or two markets) is stable, from $\operatorname{tr} A < 0$ and $\det A > 0$; distractors ONLY_TRACE, ONLY_DETERMINANT, DET_SIGN, OWN_EFFECT_ONLY.
- `saddle-path-initial-jump` (difficulty 3): the jump of a share price or of consumption onto the saddle path, $y(0) = m\,k(0)$ with $m = (\lambda_s - a)/b$; distractors UNSTABLE_ARM, EIGENVECTOR_SIGN, NULLCLINE_NOT_ARM.

## Real world
- Central bank models: the models central banks use for forecasting and policy are large systems with predetermined variables (capital, prices set in advance) and forward-looking ones (consumption, inflation expectations, asset prices). Solving them means finding the saddle path; a classic condition by Blanchard and Kahn says the number of unstable eigenvalues must equal the number of forward-looking variables.
- Exchange-rate overshooting: in Dornbusch's model the price level adjusts slowly while the exchange rate jumps. After a monetary expansion the currency falls by more than its long-run amount and then recovers along the saddle path, which helps explain why exchange rates are so volatile.
- Growth: the Ramsey model's phase diagram in capital and consumption (DO04) is a saddle, and the negative eigenvalue at the steady state gives the model's speed of convergence.
- Cycles from interaction: Goodwin's growth-cycle model treats the employment rate and the wage share like predator and prey, and fisheries economists use similar systems for fish stocks and the size of fishing fleets, where entry and exit produce cycles like those in Example 3.

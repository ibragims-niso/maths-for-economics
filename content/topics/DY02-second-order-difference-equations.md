---
id: DY02
title: Second-order difference equations
block: DY
coreYear: 3
prerequisites: [DY01]
estMinutes: 50
status: draft
economicUses:
  - "Business cycles from the multiplier–accelerator: why a rise in spending can make income swing up and down"
  - Inventory cycles, when firms rebuild or run down their stocks after a surprise in sales
  - "Hog cycles: livestock herds and prices that rise and fall over several years"
  - Deciding whether a model with two lags settles, cycles or explodes
generators: [second-order-iterated-value, characteristic-equation-larger-root, multiplier-accelerator-income]
widgets: [multiplier-accelerator]
mistakeCodes:
  SIGN_SLIP:
    label: Kept the signs when moving terms across
    explanation: To solve y(t+2) + a₁y(t+1) + a₂y(t) = b for the newest value, move the two older terms to the right; each changes sign, so y(t+2) = b − a₁y(t+1) − a₂y(t).
  DROPPED_SECOND_LAG:
    label: Left out the value two periods back
    explanation: A second-order equation uses the two latest values. Every new value needs both y(t+1) and y(t); dropping the a₂y(t) term turns it into a first-order equation with a different path.
  ONE_PERIOD_SHORT:
    label: Stopped one period too early
    explanation: The two starting values are y₀ and y₁, so the first value you compute is y₂. Count the periods carefully until you reach the one asked for.
  SMALLER_ROOT:
    label: Gave the smaller root
    explanation: The quadratic formula gives two roots; the larger one uses +√D. Check with r₁ + r₂ = −a₁ and r₁r₂ = a₂ that you have both, then pick the one asked for.
  ROOT_SIGN:
    label: Used +a₁ instead of −a₁ in the quadratic formula
    explanation: The roots of r² + a₁r + a₂ = 0 are r = (−a₁ ± √(a₁² − 4a₂))/2. Starting from +a₁ gives the roots with the wrong signs, which can turn a smooth path into an oscillating one.
  NO_HALF:
    label: Forgot to divide by 2
    explanation: In the quadratic formula the whole numerator −a₁ ± √D is divided by 2. Without the 2 the roots are twice too large, and a stable model looks explosive.
  NO_ACCELERATOR:
    label: Left out the accelerator
    explanation: In the multiplier–accelerator model investment I(t) = v(C(t) − C(t − 1)) reacts to the rise in consumption. Leaving it out gives the plain multiplier path Y(t) = cY(t − 1) + G, which rises more slowly and never overshoots.
  ACCEL_ON_INCOME:
    label: Made investment react to the change in income
    explanation: Investment reacts to the change in consumption, C(t) − C(t − 1) = c(Y(t − 1) − Y(t − 2)), so the coefficients are c(1 + v) and cv. Using v(Y(t − 1) − Y(t − 2)) forgets the factor c in the accelerator term.
  STEADY_STATE_ONLY:
    label: Gave the long-run value instead of the value at time t
    explanation: The steady state G/(1 − c) is where income is heading, not where it is after a few periods. Run the equation forward period by period until you reach the one asked for.
  REAL_PART_ONLY:
    label: Took the real part as the size of a complex root
    explanation: A complex root h ± ki has size √(h² + k²), not |h|. For r² + a₁r + a₂ = 0 with complex roots the size is √a₂, and it decides whether the cycles shrink or grow.
  MODULUS_SQUARED:
    label: Took a₂ instead of √a₂ as the size of complex roots
    explanation: The product of the two complex roots is a₂, and each has the same size R, so R² = a₂ and R = √a₂. Using a₂ itself makes damped cycles look more strongly damped than they are.
resources:
  - { title: "Precalculus 2e, 8.5 Polar Form of Complex Numbers (OpenStax)", url: "https://openstax.org/books/precalculus-2e/pages/8-5-polar-form-of-complex-numbers", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Principles of Economics 3e, 19.3 Tracking Real GDP over Time (OpenStax)", url: "https://openstax.org/books/principles-economics-3e/pages/19-3-tracking-real-gdp-over-time", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Calculus Volume 2, 5.1 Sequences (OpenStax)", url: "https://openstax.org/books/calculus-volume-2/pages/5-1-sequences", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
Some economic decisions look back two periods, not one. Firms buy machines when sales are *growing*, and growth compares this period with the last, so investment depends on two past incomes. Shops reorder after comparing their stock over the last two months; pig farmers decide how many sows to keep from the herd and prices of the last two years. A rule that links each value to the two values before it is a **second-order difference equation**.

Second order is where cycles come from. A first-order equation (DY01) can only glide to its steady state or flip from one side to the other every period. A second-order equation can produce smooth waves that rise for several periods, turn, fall and turn again, like the booms and slumps of a business cycle. Its solution tells you whether a shock to spending leads to a quiet return to equilibrium, to cycles that die out, or to cycles that grow.

## Intuition
Think of income in an economy with two kinds of spending. Consumption depends on the *level* of last period's income: this is the multiplier from F11. Investment depends on how fast consumption is *rising*: this is the accelerator. The level pulls income towards its equilibrium; the speed gives it momentum.

Now raise government spending. Income rises, consumption rises, and because consumption is rising, firms invest. That pushes income up further, past its new equilibrium. But as income growth slows, the rise in consumption shrinks, investment falls away, and income is dragged back down, again past the equilibrium. Momentum makes the path overshoot in both directions: a cycle. If investment reacts only a little, the cycles fade; if it reacts strongly, each swing is bigger than the last.

Mathematically, DY01's solution was one geometric sequence, $a^t$. Here it is a mix of two, $r_1^t$ and $r_2^t$, where $r_1$ and $r_2$ solve a quadratic equation. When that quadratic has complex roots, the two sequences combine into waves.

## Definition and formulas
A **second-order linear difference equation** with constant coefficients is
$$y_{t+2} + a_1 y_{t+1} + a_2 y_t = b, \qquad a_2 \neq 0.$$
It needs two starting values, $y_0$ and $y_1$; then $y_{t+2} = b - a_1 y_{t+1} - a_2 y_t$ gives every later value.

**Steady state.** If every value equals $y^*$, then $y^*(1 + a_1 + a_2) = b$, so
$$y^* = \frac{b}{1 + a_1 + a_2} \qquad (1 + a_1 + a_2 \neq 0).$$
The gaps $z_t = y_t - y^*$ satisfy the same equation without the constant: $z_{t+2} + a_1 z_{t+1} + a_2 z_t = 0$.

**Characteristic equation.** Try $z_t = r^t$. Then $r^t(r^2 + a_1 r + a_2) = 0$, so $r$ must solve
$$r^2 + a_1 r + a_2 = 0, \qquad r = \frac{-a_1 \pm \sqrt{a_1^2 - 4a_2}}{2}.$$
The roots satisfy $r_1 + r_2 = -a_1$ and $r_1 r_2 = a_2$. The sign of the discriminant $D = a_1^2 - 4a_2$ gives three cases.

- *Two different real roots* ($D > 0$): $y_t = y^* + A\,r_1^t + B\,r_2^t$. A positive root gives a smooth part, a negative root a part that flips sign every period.
- *One repeated root* ($D = 0$, $r = -a_1/2$): $y_t = y^* + (A + Bt)\,r^t$. The extra factor $t$ is needed because $r^t$ alone gives only one sequence; for example $y_{t+2} - 1.2y_{t+1} + 0.36y_t = 0$ has $r = 0.6$ twice and is solved by both $0.6^t$ and $t \cdot 0.6^t$.
- *Complex roots* ($D < 0$): $r = h \pm k\,i$ with $h = -a_1/2$ and $k = \sqrt{4a_2 - a_1^2}/2$. Write them in polar form with size (modulus) and angle
$$R = \sqrt{h^2 + k^2} = \sqrt{a_2}, \qquad \cos\theta = \frac{h}{R} = \frac{-a_1}{2\sqrt{a_2}}.$$
By De Moivre's formula, $(R(\cos\theta \pm i\sin\theta))^t = R^t(\cos\theta t \pm i\sin\theta t)$, and the real solutions are
$$y_t = y^* + R^t\,(A\cos\theta t + B\sin\theta t).$$
The path moves in waves: one full cycle takes $2\pi/\theta$ periods, and the waves shrink if $R < 1$, keep their size if $R = 1$ and grow if $R > 1$. The product of the two roots is $R^2 = a_2$, which is why the size is $\sqrt{a_2}$ (as for complex eigenvalues in LA202, where it is $\sqrt{\det A}$).

**Fitting A and B.** Put $t = 0$ and $t = 1$ into the general solution and set them equal to the two starting values. This gives two linear equations in $A$ and $B$.

**Stability.** $y_t \to y^*$ from every start exactly when both roots have size below 1 (they lie inside the unit circle). For a second-order equation this can be checked without finding the roots:
$$1 + a_1 + a_2 > 0, \qquad 1 - a_1 + a_2 > 0, \qquad a_2 < 1.$$
The first two say the quadratic is positive at $r = 1$ and $r = -1$, the third that the product of the roots is below 1. These are the two-lag case of the Schur–Cohn conditions. In the long run the root of largest size dominates the path.

**Link to 2×2 systems.** With $x_t = (y_{t+1}, y_t)$ the equation becomes a system (LA203):
$$x_{t+1} = \begin{pmatrix} -a_1 & -a_2 \\ 1 & 0 \end{pmatrix} x_t + \begin{pmatrix} b \\ 0 \end{pmatrix}.$$
The matrix has trace $-a_1$ and determinant $a_2$, so its characteristic equation is $\lambda^2 + a_1\lambda + a_2 = 0$: the roots are its eigenvalues. A repeated root is the case of a matrix that cannot be diagonalised, which is where the factor $t$ comes from.

**The multiplier–accelerator model (Samuelson).** Income is $Y_t = C_t + I_t + G$, with consumption $C_t = cY_{t-1}$ and investment $I_t = v(C_t - C_{t-1})$, where $c$ is the marginal propensity to consume and $v$ the accelerator. Since $C_t - C_{t-1} = c(Y_{t-1} - Y_{t-2})$,
$$Y_t = c(1 + v)\,Y_{t-1} - cv\,Y_{t-2} + G, \quad\text{that is}\quad Y_{t+2} - c(1 + v)Y_{t+1} + cv\,Y_t = G.$$
So $a_1 = -c(1 + v)$ and $a_2 = cv$. The steady state is $Y^* = G/(1 - c)$, the F11 multiplier: the accelerator changes the path, not the destination. The first two stability conditions always hold for $0 < c < 1$, so stability comes down to $cv < 1$, and the roots are complex exactly when $c < 4v/(1 + v)^2$. That gives four regimes:
$$
\begin{array}{lll}
\text{Roots} & \text{Size} & \text{Path of } Y_t \\ \hline
\text{real} & cv < 1 & \text{monotone convergence (e.g. } c = 0.8,\ v = 0.1\text{: roots } 0.78,\ 0.10) \\
\text{complex} & cv < 1 & \text{damped cycles (} c = 0.5,\ v = 1\text{: } 0.5 \pm 0.5i,\ R = 0.71) \\
\text{complex} & cv > 1 & \text{explosive cycles (} c = 0.5,\ v = 3\text{: } 1 \pm 0.71i,\ R = 1.22) \\
\text{real} & cv > 1 & \text{explosive growth (} c = 0.9,\ v = 3\text{: roots } 2.53,\ 1.07)
\end{array}
$$
On the border $cv = 1$ (for example $c = 0.5$, $v = 2$) the cycles keep the same size for ever.

## Interactive
::widget{id="multiplier-accelerator"}

The graph shows income in the multiplier–accelerator model as an index: 100 is the old equilibrium, government spending is 10 % higher from period 2 on, and the dashed line is the new equilibrium, 110. Drag the **marginal propensity to consume** $c$ and the **accelerator** $v$, and watch the panel: the roots of $r^2 - c(1 + v)r + cv = 0$, the largest size $|r|$, and the type of path. Check: at the start values $c = 0.5$ and $v = 1$ (Example 3) the panel shows roots $0.5 \pm 0.5i$, largest $|r| = 0.71$ and a damped cycle, and the caption says one full wave lasts about 8 periods. Keep $c = 0.5$ and raise $v$ to 2: now $cv = 1$ and the waves keep their size; at $v = 3$ they grow. Set $c = 0.9$ and $v = 3$ to see explosive growth, and $v = 0$ to get back the plain multiplier of DY01, which climbs smoothly to 110.

## Worked examples

### Example 1 (easy): output that depends on the last two years
In a model of a region's output (in millions), this year's output depends on output in the two previous years:
$Y_{t+2} - 1.1Y_{t+1} + 0.3Y_t = 20$, with $Y_0 = 90$ and $Y_1 = 94$. Find output in years 2 to 4, the steady state, and check whether output settles there.

1. $Y_{t+2} = 20 + 1.1Y_{t+1} - 0.3Y_t$
   *Why:* move the two older terms to the right-hand side; each changes sign as it crosses the equals sign.
2. $Y_2 = 20 + 1.1 \cdot 94 - 0.3 \cdot 90 = 96.4, \quad Y_3 = 20 + 1.1 \cdot 96.4 - 0.3 \cdot 94 = 97.84$
   *Why:* each new value needs the two values just before it; for $Y_2$ those are the starting values.
3. $Y_4 = 20 + 1.1 \cdot 97.84 - 0.3 \cdot 96.4 = 98.704 \approx 98.70$
   *Why:* move the window on by one year: now $Y_3$ and $Y_2$ are the two latest values.
4. $Y^* = \dfrac{20}{1 - 1.1 + 0.3} = \dfrac{20}{0.2} = 100$
   *Why:* in the steady state all three values are equal, so $Y^*(1 + a_1 + a_2) = b$.
5. $1 + a_1 + a_2 = 0.2 > 0, \quad 1 - a_1 + a_2 = 2.4 > 0, \quad a_2 = 0.3 < 1$
   *Why:* all three stability conditions hold, so output converges to 100. The gaps to 100 are $-10, -6, -3.6, -2.16, -1.30$: output rises steadily towards its steady state.

```verify
a1 = -1.1; a2 = 0.3; b = 20; Y0 = 90; Y1 = 94
Y2 = b - a1*Y1 - a2*Y0
Y3 = b - a1*Y2 - a2*Y1
Y4 = b - a1*Y3 - a2*Y2
assert abs(Y2 - 96.4) < 0.000001
assert abs(Y3 - 97.84) < 0.000001
assert abs(Y4 - 98.704) < 0.000001
assert abs(round(Y4*100)/100 - 98.70) < 0.000001
Ystar = b/(1 + a1 + a2)
assert abs(Ystar - 100) < 0.000001
assert abs((1 + a1 + a2) - 0.2) < 0.000001
assert abs((1 - a1 + a2) - 2.4) < 0.000001
assert a2 < 1
# substituting back into the original equation
assert abs(Y4 + a1*Y3 + a2*Y2 - b) < 0.000001
assert abs((Y2 - Ystar) - (-3.6)) < 0.000001
assert abs((Y3 - Ystar) - (-2.16)) < 0.000001
assert abs((Y4 - Ystar) - (-1.296)) < 0.000001
# both roots inside the unit circle
D = a1^2 - 4*a2
assert D > 0
assert abs((-a1 + sqrt(D))/2 - 0.6) < 0.000001
assert abs((-a1 - sqrt(D))/2 - 0.5) < 0.000001
# the sign slip quoted in Common mistakes
assert abs((b + a1*Y1 + a2*Y0) - (-56.4)) < 0.000001
```

### Example 2 (medium): a wholesaler's stock
A wholesaler's stock of goods (in thousand units) follows $S_{t+2} - 0.3S_{t+1} - 0.4S_t = 60$, with $S_0 = 230$ and $S_1 = 211$. Find the general solution, fit it to the starting values, and find the stock in month 5.

1. $S^* = \dfrac{60}{1 - 0.3 - 0.4} = \dfrac{60}{0.3} = 200$
   *Why:* the steady state is the stock that the rule turns into itself.
2. $r^2 - 0.3r - 0.4 = 0: \quad D = 0.09 + 1.6 = 1.69, \quad r = \dfrac{0.3 \pm 1.3}{2} = 0.8 \text{ or } -0.5$
   *Why:* try $S_t - S^* = r^t$; the discriminant is positive, so there are two different real roots. Check: $0.8 + (-0.5) = 0.3 = -a_1$ and $0.8 \cdot (-0.5) = -0.4 = a_2$.
3. $S_t = 200 + A \cdot 0.8^t + B \cdot (-0.5)^t$
   *Why:* the general solution for two real roots: the steady state plus a mix of the two geometric sequences.
4. $t = 0: A + B = 30, \quad t = 1: 0.8A - 0.5B = 11 \;\Rightarrow\; A = 20,\ B = 10$
   *Why:* the starting gaps are $230 - 200 = 30$ and $211 - 200 = 11$; substituting $A = 30 - B$ gives $24 - 1.3B = 11$, so $B = 10$.
5. $S_5 = 200 + 20 \cdot 0.32768 + 10 \cdot (-0.03125) = 200 + 6.5536 - 0.3125 = 206.24$
   *Why:* iterating gives the same: $S_2 = 215.3$, $S_3 = 208.99$, $S_4 = 208.82$, $S_5 = 206.24$. Both roots lie between −1 and 1, so the stock settles at 200. The negative root makes it zig-zag at first, but that part halves in size every month, and soon the root 0.8 dominates: a smooth approach from above.

```verify
a1 = -0.3; a2 = -0.4; b = 60; S0 = 230; S1 = 211
Sstar = b/(1 + a1 + a2)
assert abs(Sstar - 200) < 0.000001
D = a1^2 - 4*a2
assert abs(D - 1.69) < 0.000001
r1 = (-a1 + sqrt(D))/2
r2 = (-a1 - sqrt(D))/2
assert abs(r1 - 0.8) < 0.000001
assert abs(r2 - (-0.5)) < 0.000001
assert abs(r1^2 + a1*r1 + a2) < 0.000001
assert abs(r2^2 + a1*r2 + a2) < 0.000001
# fit A and B to the two starting gaps
M = [1, 1; r1, r2]
AB = inv(M) * [S0 - Sstar; S1 - Sstar]
A = AB[1, 1]; B = AB[2, 1]
assert abs(A - 20) < 0.000001
assert abs(B - 10) < 0.000001
assert abs(20*0.8 - 10*0.5 - 11) < 0.000001
assert abs(r1^5 - 0.32768) < 0.000001
assert abs(r2^5 - (-0.03125)) < 0.000001
S5 = Sstar + A*r1^5 + B*r2^5
assert abs(S5 - 206.2411) < 0.000001
# iterate month by month
S2 = b - a1*S1 - a2*S0
S3 = b - a1*S2 - a2*S1
S4 = b - a1*S3 - a2*S2
assert abs(S2 - 215.3) < 0.000001
assert abs(S3 - 208.99) < 0.000001
assert abs(S4 - 208.817) < 0.000001
assert abs(b - a1*S4 - a2*S3 - S5) < 0.000001
# the root-sign slip quoted in Common mistakes: roots of r^2 + 0.3r - 0.4
assert abs((0.3 + sqrt(D))/2 - 0.8) < 0.000001
assert abs((-0.3 + sqrt(D))/2 - 0.5) < 0.000001
assert abs(-a1 + sqrt(D) - 1.6) < 0.000001
```

### Example 3 (hard): Samuelson's multiplier–accelerator
Households consume half of last period's income, $C_t = 0.5Y_{t-1}$, and firms invest the rise in consumption, $I_t = 1 \cdot (C_t - C_{t-1})$, so $c = 0.5$ and $v = 1$. Income is $Y_t = C_t + I_t + G$. Government spending has been 50 and income 100 in periods 0 and 1. From period 2 on, $G = 55$. Find the path of income, its roots and cycle, and say what changes if $v = 3$.

1. $Y_t = 0.5Y_{t-1} + 0.5(Y_{t-1} - Y_{t-2}) + 55 = Y_{t-1} - 0.5Y_{t-2} + 55$
   *Why:* $C_t - C_{t-1} = 0.5(Y_{t-1} - Y_{t-2})$; the coefficients are $c(1 + v) = 1$ and $cv = 0.5$, so $Y_{t+2} - Y_{t+1} + 0.5Y_t = 55$.
2. $Y^* = \dfrac{55}{1 - 1 + 0.5} = \dfrac{55}{1 - 0.5} = 110$
   *Why:* the steady state is the F11 equilibrium with multiplier $1/(1 - c) = 2$; before the change it was $50 \cdot 2 = 100$, which is where income starts.
3. $Y_2 = 100 - 50 + 55 = 105, \quad Y_3 = 105 - 50 + 55 = 110, \quad Y_4 = 110 - 52.5 + 55 = 112.5, \quad Y_5 = 112.5, \quad Y_6 = 111.25$
   *Why:* in period 2 only the extra spending arrives; then rising consumption triggers investment, which carries income past 110. As growth stops, investment turns negative and income falls back: $Y_8 = 109.38$ is below 110.
4. $r^2 - r + 0.5 = 0: \quad D = 1 - 2 = -1, \quad r = 0.5 \pm 0.5i, \quad R = \sqrt{0.5} = 0.71, \quad \cos\theta = \dfrac{0.5}{0.71} \Rightarrow \theta = \dfrac{\pi}{4}$
   *Why:* complex roots mean cycles; their size $R = \sqrt{cv} < 1$ means the cycles shrink by the factor 0.71 each period, and one full cycle lasts $2\pi/\theta = 8$ periods.
5. $Y_t = 110 + (\sqrt{0.5})^t(A\cos\tfrac{\pi t}{4} + B\sin\tfrac{\pi t}{4})$; $t = 0$: $A = -10$; $t = 1$: $0.5(B - 10) = -10$, so $B = -10$
   *Why:* fit the two starting values. Check at $t = 4$: $110 - 10 \cdot 0.25 \cdot (\cos\pi + \sin\pi) = 110 + 2.5 = 112.5$, as in step 3.
6. With $v = 3$: $Y_{t+2} - 2Y_{t+1} + 1.5Y_t = 55$, roots $1 \pm 0.71i$, $R = \sqrt{1.5} = 1.22 > 1$
   *Why:* now $cv = 1.5 > 1$: investment reacts so strongly that every swing is bigger than the last. Income goes 105, 115, 127.5, 137.5, 138.75, 126.25, 99.38, and the cycles keep growing.

```verify
c = 0.5; v = 1; Gold = 50; G = 55
k1 = c*(1 + v)
k2 = c*v
assert k1 == 1
assert k2 == 0.5
assert abs(Gold/(1 - c) - 100) < 0.000001
Ystar = G/(1 - k1 + k2)
assert abs(Ystar - 110) < 0.000001
assert abs(G/(1 - c) - Ystar) < 0.000001
# run consumption, investment and income separately
Y0 = 100; Y1 = 100
C1 = c*Y0; C2 = c*Y1; I2 = v*(C2 - C1); Y2 = C2 + I2 + G
C3 = c*Y2; I3 = v*(C3 - C2); Y3 = C3 + I3 + G
C4 = c*Y3; I4 = v*(C4 - C3); Y4 = C4 + I4 + G
assert Y2 == 105
assert Y3 == 110
assert Y4 == 112.5
Y5 = k1*Y4 - k2*Y3 + G
Y6 = k1*Y5 - k2*Y4 + G
Y7 = k1*Y6 - k2*Y5 + G
Y8 = k1*Y7 - k2*Y6 + G
assert Y5 == 112.5
assert Y6 == 111.25
assert abs(Y8 - 109.375) < 0.000001
assert k1*Y1 - k2*Y0 == 50
assert k1*Y3 == 110
assert k2*Y2 == 52.5
# complex roots
D = k1^2 - 4*k2
assert D == -1
h = k1/2
k = sqrt(-D)/2
assert h == 0.5
assert k == 0.5
R = sqrt(h^2 + k^2)
assert abs(R - sqrt(k2)) < 0.000001
assert abs(R - 0.71) < 0.005
th = acos(h/R)
assert abs(th - pi/4) < 0.000001
assert abs(2*pi/th - 8) < 0.000001
# closed form with A = -10, B = -10
A = -10; B = -10
assert abs(Ystar + A - Y0) < 0.000001
assert abs(Ystar + R*(A*cos(th) + B*sin(th)) - Y1) < 0.000001
assert abs(0.5*(B - 10) - (-10)) < 0.000001
assert abs(Ystar + R^4*(A*cos(4*th) + B*sin(4*th)) - 112.5) < 0.000001
assert abs(Ystar + R^6*(A*cos(6*th) + B*sin(6*th)) - Y6) < 0.000001
assert abs(R^4 - 0.25) < 0.000001
# v = 3: explosive cycles
v3 = 3
m1 = c*(1 + v3)
m2 = c*v3
assert m1 == 2
assert m2 == 1.5
assert m1^2 - 4*m2 < 0
assert abs(sqrt(4*m2 - m1^2)/2 - 0.71) < 0.005
assert abs(sqrt(m2) - 1.22) < 0.005
Z2 = m1*100 - m2*100 + G
Z3 = m1*Z2 - m2*100 + G
Z4 = m1*Z3 - m2*Z2 + G
Z5 = m1*Z4 - m2*Z3 + G
Z6 = m1*Z5 - m2*Z4 + G
Z7 = m1*Z6 - m2*Z5 + G
Z8 = m1*Z7 - m2*Z6 + G
assert Z2 == 105
assert Z3 == 115
assert Z4 == 127.5
assert Z5 == 137.5
assert Z6 == 138.75
assert Z7 == 126.25
assert abs(Z8 - 99.375) < 0.000001
assert round(Z8*100)/100 == 99.38
assert round(Y8*100)/100 == 109.38
# the four regimes in Definition and formulas
assert abs((0.88 + sqrt(0.88^2 - 4*0.08))/2 - 0.78) < 0.005
assert abs((0.88 - sqrt(0.88^2 - 4*0.08))/2 - 0.10) < 0.005
assert 0.8 > 4*0.1/(1.1)^2
assert 0.5 < 4*1/(2)^2 + 0.000001
assert abs((3.6 + sqrt(3.6^2 - 4*2.7))/2 - 2.53) < 0.005
assert abs((3.6 - sqrt(3.6^2 - 4*2.7))/2 - 1.07) < 0.005
assert 0.5*2 == 1
# repeated root 0.6: both 0.6^t and t*0.6^t solve y(t+2) - 1.2y(t+1) + 0.36y(t) = 0
assert abs(1.2^2 - 4*0.36) < 0.000001
assert abs(5*0.6^5 - 1.2*4*0.6^4 + 0.36*3*0.6^3) < 0.000001
# mistakes quoted in Common mistakes: no accelerator, accelerator on income
N2 = c*100 + G
N3 = c*N2 + G
N4 = c*N3 + G
assert abs(N4 - 108.75) < 0.000001
W2 = (c + v)*100 - v*100 + G
W3 = (c + v)*W2 - v*100 + G
W4 = (c + v)*W3 - v*W2 + G
assert abs(W4 - 118.75) < 0.000001
```

## Common mistakes
- Moving $a_1 y_{t+1}$ and $a_2 y_t$ to the right without changing their signs; in Example 1 this gives $Y_2 = -56.4$ instead of 96.4 (SIGN_SLIP).
- Dropping the term two periods back and iterating $y_{t+2} = b - a_1 y_{t+1}$, which is a first-order equation with a different path (DROPPED_SECOND_LAG).
- Counting periods wrongly: the starting values are $y_0$ and $y_1$, so the first value you compute is $y_2$ (ONE_PERIOD_SHORT).
- Giving the smaller root when the larger one is asked for (SMALLER_ROOT).
- Starting the quadratic formula from $+a_1$ instead of $-a_1$; for $r^2 - 0.3r - 0.4 = 0$ in Example 2 this gives 0.5 and −0.8 instead of 0.8 and −0.5 (ROOT_SIGN).
- Forgetting to divide the whole numerator by 2: $0.3 + 1.3 = 1.6$ would make the stock in Example 2 look explosive (NO_HALF).
- Leaving the accelerator out of the Samuelson model: in Example 3 the plain multiplier gives $Y_4 = 108.75$ instead of 112.5 (NO_ACCELERATOR).
- Letting investment react to the change in income, $v(Y_{t-1} - Y_{t-2})$, instead of the change in consumption; in Example 3 this gives $Y_4 = 118.75$ (ACCEL_ON_INCOME).
- Giving the steady state $G/(1 - c)$ when income after a few periods is asked for (STEADY_STATE_ONLY).
- Taking the real part $h$ of a complex root $h \pm ki$ as its size instead of $\sqrt{h^2 + k^2}$ (REAL_PART_ONLY).
- Taking $a_2$ itself instead of $\sqrt{a_2}$ as the size of complex roots (MODULUS_SQUARED).
- Using the first-order formula $b/(1 - a)$ with only one coefficient for the steady state: a second-order equation needs both, $y^* = b/(1 + a_1 + a_2)$.
- Checking only $a_2 < 1$ for stability: all three conditions must hold. In the Samuelson model the other two hold automatically, which is why $cv < 1$ is enough there.
- Thinking complex roots mean there is no real solution: the path is real; complex roots only tell you that it moves in waves.

## Practice
- `second-order-iterated-value` (difficulty 1): the value $y_3$ or $y_4$ of $y_{t+2} + a_1 y_{t+1} + a_2 y_t = b$ for output, a stock or a herd, by running the equation forward from $y_0$ and $y_1$; distractors SIGN_SLIP, DROPPED_SECOND_LAG, ONE_PERIOD_SHORT.
- `characteristic-equation-larger-root` (difficulty 2): the larger root of the characteristic equation $r^2 + a_1 r + a_2 = 0$ of a stable model; distractors SMALLER_ROOT, ROOT_SIGN, NO_HALF.
- `multiplier-accelerator-income` (difficulty 3): income 2 or 3 periods after a permanent rise in government spending in the Samuelson model; distractors NO_ACCELERATOR, ACCEL_ON_INCOME, STEADY_STATE_ONLY, ONE_PERIOD_SHORT.

## Real world
- Business cycles: Paul Samuelson's 1939 multiplier–accelerator model was one of the first to show that cycles can come from inside the economy, from the way investment reacts to growing demand. On its own it gives smooth waves that either die out or grow; adding random shocks, so that a damped second-order system keeps being kicked, produces irregular booms and slumps more like the ones in real GDP data.
- Inventory cycles: when sales fall unexpectedly, firms first pile up unsold stock and then cut orders hard to bring stocks back down, which deepens the fall in output; when sales recover they rebuild stocks. Changes in inventories are a small part of GDP but a large part of its swings from quarter to quarter, and inventory models with two lags reproduce these short cycles.
- Hog cycles: pig farmers expand their herds when prices have been high, but breeding takes time and the decision depends on several past years, so herd sizes and pork prices rise and fall in cycles lasting a few years. Similar cycles appear in cattle, in shipbuilding and in office construction, wherever new capacity takes a long time to arrive.
- Forecasting: time-series models in which GDP growth or the output gap depends on its own two previous values (AR(2) models, see EM06) are second-order difference equations with random shocks. Complex roots in such a model mean the economy tends to return to trend in a hump-shaped or wave-like way after a shock, which forecasters and central banks use when judging how long a slowdown will last.

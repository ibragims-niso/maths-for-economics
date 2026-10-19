---
id: DO04
title: Mathematics of the Ramsey growth model
block: DO
coreYear: 4
prerequisites: [DO02, DY05]
estMinutes: 50
status: draft
economicUses:
  - "How much of its income a country should save and invest"
  - "Why more patient economies build up more capital per worker"
  - "Convergence: how fast a capital-poor economy grows towards its steady state"
  - "The starting point of the models central banks and finance ministries use"
generators: [ramsey-modified-golden-rule-capital, ramsey-steady-state-consumption, ramsey-consumption-growth-at-capital]
widgets: [ramsey-phase-diagram]
mistakeCodes:
  GOLDEN_RULE:
    label: Used the golden rule instead of the modified golden rule
    explanation: The golden rule f′(k) = n + δ gives the steady state with the most consumption, but it ignores impatience. A planner who discounts at ρ > n stops building capital earlier, where f′(k*) = ρ + δ.
  FORGOT_DEPRECIATION:
    label: Left out depreciation
    explanation: A unit of capital earns f′(k) but wears out at the rate δ, so its net return is f′(k) − δ. Consumption stops growing when f′(k) − δ = ρ, that is f′(k*) = ρ + δ, and away from the steady state it grows at (f′(k) − δ − ρ)/σ.
  FORGOT_POWER:
    label: Stopped at k^(1 − α)
    explanation: Solving αA·k^(α − 1) = ρ + δ gives k^(1 − α) = αA/(ρ + δ), not k itself. Raise both sides to the power 1/(1 − α) to get k*.
  FORGOT_INVESTMENT:
    label: Gave output instead of consumption
    explanation: f(k*) is output per worker. To keep capital per worker constant, the part (n + δ)k* must be invested to equip new workers and replace worn-out capital, so c* = f(k*) − (n + δ)k*.
  INVESTMENT_NOT_CONSUMPTION:
    label: Gave investment instead of consumption
    explanation: (n + δ)k* is the investment that keeps capital per worker constant. Consumption is what is left of output after that investment, c* = f(k*) − (n + δ)k*.
  CAPITAL_INCOME:
    label: Gave capital's income f′(k*)·k*
    explanation: f′(k*)·k* = (ρ + δ)k* is what capital would earn in a competitive economy, not what people consume. Consumption per worker is output minus the investment needed, f(k*) − (n + δ)k*.
  IGNORED_SIGMA:
    label: Forgot to divide by σ
    explanation: Consumption grows at (f′(k) − δ − ρ)/σ. A larger σ means people dislike uneven consumption more, so they let it grow more slowly; only with log utility (σ = 1) can σ be left out.
  AVERAGE_PRODUCT:
    label: Used the average product f(k)/k
    explanation: The return on one more unit of capital is the marginal product f′(k) = αA·k^(α − 1), which is only α times the average product f(k)/k = A·k^(α − 1).
resources:
  - { title: "Economic Growth, 14.452: lecture notes, Neoclassical Growth (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/14-452-economic-growth-fall-2016/pages/lecture-notes/", kind: course, verifiedAt: 2026-10-18 }
  - { title: "Dynamic Optimization Methods with Applications, 14.451: lecture notes, discounted infinite-horizon optimal control (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/14-451-dynamic-optimization-methods-with-applications-fall-2009/pages/lecture-notes/", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
How much of its income should a country save? The Solow model (DY03) takes the saving rate as given and asks where capital per worker settles. Frank Ramsey asked the question behind it in 1928: if a planner cared about the welfare of everyone, now and in the future, what saving path would it choose? Saving more today means less consumption now but more capital, and so more output and consumption later. The answer is a whole path of consumption over an infinite horizon, which is exactly the problem optimal control solves (DO02).

The **Ramsey model** (also called the Ramsey–Cass–Koopmans model) brings together the two previous tools: the Hamiltonian turns the planner's problem into two differential equations, one for capital and one for consumption, and the phase diagram and saddle path of DY05 show how the economy moves. It answers three questions that run through macroeconomics: what is the best long-run capital stock, why does patience raise it, and how does an economy that starts poor converge? Almost every modern macro model, including the models central banks use, is built on this structure.

## Intuition
At every moment output per worker has two uses: it is eaten now or added to the capital stock. A unit of capital adds $f'(k)$ to output but wears out at the rate $\delta$, so postponing a unit of consumption and investing it earns the net return $f'(k) - \delta$. Society is impatient and values the future less at the rate $\rho$. Postponing pays when the return beats impatience, $f'(k) - \delta > \rho$: then the planner keeps consumption low today and lets it grow. This is the Keynes–Ramsey rule of DO02 with the interest rate replaced by the net marginal product of capital.

When capital is scarce, $f'(k)$ is high, so consumption grows fast and capital is built up. As capital accumulates its marginal product falls (diminishing returns), and growth slows. It stops where the net return equals impatience, $f'(k^*) - \delta = \rho$: the **modified golden rule**. A more patient society (lower $\rho$) keeps investing until the return is lower, so it ends up with more capital per worker.

Why not go all the way to the **golden rule**, the capital stock with the most consumption in the long run? Because getting there means eating less for many years, and an impatient society values those early sacrifices more than the small gain at the end.

Consumption, unlike capital, can jump. Given today's capital there is exactly one level of consumption that leads to the steady state. Consume more, and capital is eaten up; consume less, and capital piles up and is never enjoyed. That one level lies on the **saddle path**.

## Definition and formulas
**The planner's problem (the version used in this topic).** The labour force grows at rate $n$, $L(t) = e^{nt}$, and everyone consumes $c$. The planner adds up the utility of everyone alive:
$$\max \int_0^\infty e^{-\rho t}L(t)\,u\bigl(c(t)\bigr)\,dt = \int_0^\infty e^{-(\rho - n)t}\,u(c)\,dt, \qquad \rho > n,$$
subject to
$$\dot k = f(k) - c - (n + \delta)k, \qquad k(0) = k_0 \text{ given}.$$
Here $k$ and $c$ are capital and consumption per worker. The constraint comes from $\dot K = F(K, L) - C - \delta K$: dividing by $L$ and using $\dot k/k = \dot K/K - n$, each new worker needs $k$ of capital, which costs $nk$. The production function $f$ is increasing and concave, with $f'(k)$ very large near $k = 0$ and close to 0 for large $k$, and utility is CRRA, $u(c) = \dfrac{c^{1-\sigma}}{1-\sigma}$ ($u = \ln c$ when $\sigma = 1$). The condition $\rho > n$ keeps the integral finite. *Other version:* if the planner counts the utility of one representative person only (no $L(t)$), replace $\rho$ by $\rho + n$ everywhere below; the steady state is then $f'(k^*) = \rho + n + \delta$. Do not mix the two.

**The current-value Hamiltonian** (DO02), with discount rate $\rho - n$, state $k$ and control $c$:
$$H_c = u(c) + \mu\bigl(f(k) - c - (n + \delta)k\bigr).$$
$$
\begin{array}{ll}
\text{Control:} & \dfrac{\partial H_c}{\partial c} = c^{-\sigma} - \mu = 0, \text{ so } \mu = c^{-\sigma}, \\[2mm]
\text{Costate:} & \dot\mu = (\rho - n)\mu - \dfrac{\partial H_c}{\partial k} = (\rho - n)\mu - \mu\bigl(f'(k) - n - \delta\bigr) = \bigl(\rho + \delta - f'(k)\bigr)\mu, \\[2mm]
\text{State:} & \dot k = f(k) - c - (n + \delta)k, \\[2mm]
\text{Transversality:} & \displaystyle\lim_{t\to\infty} e^{-(\rho - n)t}\mu(t)\,k(t) = 0.
\end{array}
$$
The costate $\mu$ is the value, in utility, of one more unit of capital per worker.

**The Ramsey system.** Taking logs of $\mu = c^{-\sigma}$ and differentiating gives $\dot\mu/\mu = -\sigma\,\dot c/c$; the $n$ terms cancel, and
$$\frac{\dot c}{c} = \frac{f'(k) - \delta - \rho}{\sigma}, \qquad \dot k = f(k) - c - (n + \delta)k.$$
The first equation is the **Euler equation** (Keynes–Ramsey rule) with the interest rate $r = f'(k) - \delta$.

**Steady state.** $\dot c = 0$ with $c > 0$ and $\dot k = 0$ give
$$f'(k^*) = \rho + \delta \quad\text{(modified golden rule)}, \qquad c^* = f(k^*) - (n + \delta)k^*.$$
For $f(k) = Ak^\alpha$, $\alpha A k^{\alpha - 1} = \rho + \delta$, so
$$k^* = \left(\frac{\alpha A}{\rho + \delta}\right)^{1/(1-\alpha)}, \qquad s^* = \frac{(n + \delta)k^*}{f(k^*)} = \frac{\alpha(n + \delta)}{\rho + \delta},$$
where $s^*$ is the share of output saved in the steady state.

**Comparison with Solow and the golden rule.** In the Solow model, $\dot k = s f(k) - (n + \delta)k$, the saving rate $s$ is fixed and each $s$ gives a different steady state with consumption $f(k) - (n + \delta)k$. That consumption is largest where its derivative is zero, $f'(k_{\text{gold}}) = n + \delta$: the **golden rule** (for $f = Ak^\alpha$ the golden-rule saving rate is $\alpha$). Since $\rho > n$, $f'(k^*) = \rho + \delta > n + \delta = f'(k_{\text{gold}})$, and because $f'$ falls as $k$ rises,
$$k^* < k_{\text{gold}}.$$
The optimal economy never over-saves. Its steady state looks like a Solow steady state with saving rate $s^*$, but on the way there the saving rate changes over time.

**Phase diagram.** In the $(k, c)$ plane:

- The $\dot k = 0$ locus is the hump $c = f(k) - (n + \delta)k$, with its top at $k_{\text{gold}}$. Above it consumption is too high to maintain capital, so $k$ falls; below it, $k$ rises.
- The $\dot c = 0$ locus is the vertical line $k = k^*$ (and the axis $c = 0$). To its left $f'(k) - \delta > \rho$, so $c$ rises; to its right $c$ falls.
- They cross at the steady state $(k^*, c^*)$, on the rising side of the hump because $k^* < k_{\text{gold}}$. The four regions have arrows pointing north-west (above the hump, left of $k^*$), north-east (below, left), south-west (above, right) and south-east (below, right).

**Linearisation.** Write $\dot c = c\,\bigl(f'(k) - \delta - \rho\bigr)/\sigma$. The Jacobian (DY05) at the steady state is
$$J = \begin{pmatrix} f'(k^*) - n - \delta & -1 \\[1mm] \dfrac{c^* f''(k^*)}{\sigma} & 0 \end{pmatrix} = \begin{pmatrix} \rho - n & -1 \\[1mm] \dfrac{c^* f''(k^*)}{\sigma} & 0 \end{pmatrix}.$$
The bottom-right entry is $\bigl(f'(k^*) - \delta - \rho\bigr)/\sigma = 0$. Since $f'' < 0$, $\det J = c^* f''(k^*)/\sigma < 0$: the eigenvalues
$$\lambda = \frac{(\rho - n) \pm \sqrt{(\rho - n)^2 - 4\det J}}{2}$$
are real with opposite signs, so the steady state is a **saddle**. The negative eigenvalue $\lambda_s$ gives the **speed of convergence**: near the steady state the gap closes like $e^{\lambda_s t}$. The stable arm has slope $m = \rho - n - \lambda_s$ (from the first row of $J - \lambda_s I$), so near the steady state $c - c^* \approx m\,(k - k^*)$.

**Saddle path and transversality.** Capital $k(0)$ is given, but $c(0)$ is chosen. Every $c(0)$ satisfies the Euler equation and the constraint, and only the transversality condition picks one:

- Above the saddle path, consumption keeps rising while capital falls, until capital runs out and consumption has to collapse. Not feasible for ever.
- Below the saddle path, the economy crosses the $\dot c = 0$ line, consumption falls towards 0 and capital heads to the point where the hump meets the axis, far beyond $k_{\text{gold}}$. There $f'(k) - \delta < \rho$ for good: the economy keeps a large capital stock that is never consumed, and $e^{-(\rho - n)t}\mu k$ does not go to 0. Transversality fails.
- On the saddle path, $c$ and $k$ move together to $(k^*, c^*)$. Starting below $k^*$, both rise.

**Comparative statics.** A rise in $\rho$ raises $f'(k^*) = \rho + \delta$, so $k^*$ falls: the $\dot c = 0$ line moves left while the hump stays put. Because $k^*$ is on the rising side of the hump, $c^*$ falls too. If the rise is a surprise, capital cannot jump, so consumption jumps up onto the new saddle path and then both glide down to the new steady state: an impatient society eats more today and less in the long run.

## Interactive
::widget{id="ramsey-phase-diagram"}

The graph is the phase diagram of Examples 1–3: $f(k) = 1.2k^{1/3}$, $n = 1\%$ and $\sigma = 2$. Move **Rate of time preference ρ** and **Depreciation δ** and watch the green $\dot c = 0$ line, the lilac $\dot k = 0$ hump and the gold saddle path; the dashed lilac line marks the golden-rule capital at the top of the hump, and the hollow dot is an economy that starts with three quarters of $k^*$. Check: at ρ = 4 % and δ = 6 % the panel shows k* = 8, c* = 1.84 and golden-rule k = 13.66, and the caption gives c(0) = 1.62 at k(0) = 6. Raise ρ to 5 %: k* falls to 6.93 while the golden-rule capital does not move, so the gap between the green and the dashed line widens. Raising δ moves both lines left. Notice that the saddle path always comes up from the bottom left, passes through the steady state and leaves at the top right, and that the green line never reaches the dashed one as long as ρ is above n.

## Worked examples

### Example 1 (easy): the steady state of a Ramsey economy
Output per worker is $f(k) = 1.2k^{1/3}$, capital depreciates at $\delta = 6\%$, the labour force grows at $n = 1\%$ and the rate of time preference is $\rho = 4\%$. Find the optimal steady state $k^*$ and $c^*$, the saving rate there, and compare with the golden rule.

1. $f'(k) = 0.4\,k^{-2/3} = \rho + \delta = 0.10 \;\Rightarrow\; k^{2/3} = 4 \;\Rightarrow\; k^* = 4^{3/2} = 8$
   *Why:* consumption is constant only when the net return on capital equals impatience, $f'(k^*) - \delta = \rho$. The derivative of $1.2k^{1/3}$ is $0.4k^{-2/3}$.
2. $f(8) = 1.2 \times 2 = 2.4, \qquad c^* = 2.4 - 0.07 \times 8 = 2.4 - 0.56 = 1.84$
   *Why:* capital per worker is constant only if investment covers new workers and depreciation, $(n + \delta)k^* = 0.56$; the rest of output is consumed.
3. $s^* = \dfrac{0.56}{2.4} = 0.2333 = \dfrac{\alpha(n + \delta)}{\rho + \delta} = \dfrac{\tfrac13 \times 0.07}{0.10}$
   *Why:* the economy saves 23.33 % of its output in the steady state. Population growth does not change $k^*$, but it does change how much must be saved to keep $k^*$.
4. $0.4\,k^{-2/3} = n + \delta = 0.07 \;\Rightarrow\; k_{\text{gold}} = \left(\dfrac{0.4}{0.07}\right)^{3/2} = 13.66, \qquad c_{\text{gold}} = 1.91, \qquad s_{\text{gold}} = \tfrac13$
   *Why:* the golden rule gives slightly more consumption for ever, 1.91 instead of 1.84, but reaching it would need years of extra saving. Because $\rho = 4\% > n = 1\%$, the planner stops at 8.
5. With $\rho = 5\%$: $k^* = \left(\dfrac{0.4}{0.11}\right)^{3/2} = 6.93, \qquad c^* = 1.80$
   *Why:* a more impatient society demands a higher return, $f'(k^*) = 0.11$, which diminishing returns deliver only at a lower capital stock; consumption in the long run falls as well.

```verify
A = 1.2; al = 1/3; rho = 0.04; dl = 0.06; n = 0.01
f(k) = A*k^al
fp(k) = al*A*k^(al - 1)
ks = (al*A/(rho + dl))^(1/(1 - al))
assert abs(ks - 8) < 1e-9
assert abs(fp(ks) - 0.10) < 1e-12
assert abs(f(8) - 2.4) < 1e-12
cs = f(ks) - (n + dl)*ks
assert abs((n + dl)*8 - 0.56) < 1e-12
assert abs(cs - 1.84) < 1e-9
sv = (n + dl)*ks/f(ks)
assert abs(sv - 0.2333) < 0.00005
assert abs(sv - al*(n + dl)/(rho + dl)) < 1e-12
kg = (al*A/(n + dl))^(1/(1 - al))
assert abs(kg - 13.66) < 0.005
cg = f(kg) - (n + dl)*kg
assert abs(cg - 1.91) < 0.005
assert abs((n + dl)*kg/f(kg) - 1/3) < 1e-12
# the golden rule is the top of the hump: neighbours give less steady-state consumption
assert cg > f(kg - 0.01) - (n + dl)*(kg - 0.01) and cg > f(kg + 0.01) - (n + dl)*(kg + 0.01)
k5 = (al*A/(0.05 + dl))^(1/(1 - al))
assert abs(k5 - 6.93) < 0.005
assert abs(f(k5) - (n + dl)*k5 - 1.80) < 0.005
# the wrong answers
assert abs((al*A/rho)^(1/(1 - al)) - 31.62) < 0.005
assert abs(al*A/(rho + dl) - 4) < 1e-12
assert abs(fp(ks)*ks - 0.8) < 1e-12
```

### Example 2 (medium): from the Hamiltonian to the phase diagram
In the economy of Example 1 utility is CRRA with $\sigma = 2$, that is $u(c) = -1/c$. Derive the two equations of motion, find how fast consumption grows when capital per worker is 1 and when it is 27, and find the direction of motion at the point $k = 1$, $c = 1$.

1. $H_c = -\dfrac{1}{c} + \mu\bigl(1.2k^{1/3} - c - 0.07k\bigr), \qquad \dfrac{\partial H_c}{\partial c} = \dfrac{1}{c^2} - \mu = 0 \;\Rightarrow\; \mu = c^{-2}$
   *Why:* consuming one more unit adds $1/c^2$ to utility now; keeping it as capital is worth $\mu$. At the optimum they are equal.
2. $\dot\mu = (0.04 - 0.01)\mu - \mu\bigl(0.4k^{-2/3} - 0.07\bigr) = \bigl(0.10 - 0.4k^{-2/3}\bigr)\mu$
   *Why:* the current-value costate equation with discount rate $\rho - n = 0.03$; $\partial H_c/\partial k = \mu\bigl(f'(k) - n - \delta\bigr)$.
3. $\dfrac{\dot c}{c} = -\dfrac{1}{2}\,\dfrac{\dot\mu}{\mu} = \dfrac{0.4k^{-2/3} - 0.06 - 0.04}{2}, \qquad \dot k = 1.2k^{1/3} - c - 0.07k$
   *Why:* from $\mu = c^{-2}$, $\dot\mu/\mu = -2\,\dot c/c$. These two equations are the whole model.
4. At $k = 1$: $f'(1) = 0.4$, $\dfrac{\dot c}{c} = \dfrac{0.4 - 0.10}{2} = 0.15$, i.e. 15 % a year; at $k = 27$: $f'(27) = \dfrac{0.4}{9} = 0.0444$, $\dfrac{\dot c}{c} = -2.78\%$
   *Why:* with little capital its return is far above $\rho + \delta$, so it pays to postpone consumption and let it grow fast. Above $k^* = 8$ the return is below $\rho + \delta$ and consumption falls.
5. At $(1, 1)$: $\dot k = 1.2 - 1 - 0.07 = 0.13 > 0$ and $\dot c = 1 \times 0.15 = 0.15 > 0$: the arrow points north-east
   *Why:* the point is below the hump ($c = 1 < 1.13$, the $\dot k = 0$ value at $k = 1$) and left of $k^* = 8$, the region where both capital and consumption rise.

```verify
A = 1.2; al = 1/3; rho = 0.04; dl = 0.06; n = 0.01; sg = 2
fp(k) = al*A*k^(al - 1)
g(k) = (fp(k) - dl - rho)/sg
assert abs(rho - n - 0.03) < 1e-12
assert abs(fp(1) - 0.4) < 1e-12
assert abs(g(1) - 0.15) < 1e-12
assert abs(fp(27) - 0.0444) < 0.00005
assert abs(100*g(27) + 2.78) < 0.005
# mu = c^(-2) and the costate rule (rho + delta - f'(k)) give the same growth rate
h = 1e-6
cc(t) = exp(g(1)*t)
assert abs((log(cc(h)^(-2)) - log(cc(0)^(-2)))/h - (rho + dl - fp(1))) < 1e-6
kd = A*1^al - 1 - (n + dl)*1
assert abs(kd - 0.13) < 1e-12
assert abs(A - (n + dl) - 1.13) < 1e-12
assert abs(1*g(1) - 0.15) < 1e-12
# the wrong answers at k = 1, in per cent
assert abs(100*(fp(1) - dl - rho) - 30) < 1e-9
assert abs(100*(A - dl - rho)/sg - 55) < 1e-9
assert abs(100*(fp(1) - rho)/sg - 18) < 1e-9
```

### Example 3 (hard): the saddle path and the speed of convergence
For the same economy ($\sigma = 2$, $k^* = 8$, $c^* = 1.84$), linearise the system at the steady state, show that it is a saddle, find how fast the economy converges and estimate consumption at the start if $k(0) = 6$.

1. $\dfrac{\partial \dot k}{\partial k} = f'(8) - 0.07 = 0.03, \quad \dfrac{\partial \dot k}{\partial c} = -1, \quad \dfrac{\partial \dot c}{\partial k} = \dfrac{c^* f''(8)}{2} = \dfrac{1.84 \times (-0.008333)}{2} = -0.007667, \quad \dfrac{\partial \dot c}{\partial c} = 0$
   *Why:* $f''(k) = -\tfrac{4}{15}k^{-5/3}$ and $8^{-5/3} = 1/32$, so $f''(8) = -0.008333$. The last entry is $(f'(k^*) - \delta - \rho)/\sigma$, which is zero at the steady state.
2. $J = \begin{pmatrix} 0.03 & -1 \\ -0.007667 & 0 \end{pmatrix}, \quad \det J = -0.007667 < 0$
   *Why:* a negative determinant means real eigenvalues of opposite signs (DY05): the steady state is a saddle.
3. $\lambda^2 - 0.03\lambda - 0.007667 = 0 \;\Rightarrow\; \lambda = \dfrac{0.03 \pm \sqrt{0.0009 + 0.030667}}{2} = \dfrac{0.03 \pm 0.1777}{2} = 0.1038,\ -0.0738$
   *Why:* the trace is $\rho - n = 0.03$. The negative eigenvalue governs the path that converges: the gap shrinks about 7.38 % a year, so half of it closes in $\ln 2/0.0738 = 9.39$ years.
4. $m = 0.03 - (-0.0738) = 0.1038, \qquad c - 1.84 \approx 0.1038\,(k - 8)$
   *Why:* the first row of $J - \lambda_s I$ gives $(0.03 - \lambda_s) - m = 0$. The slope is positive: a poorer economy consumes less.
5. $c(0) \approx 1.84 + 0.1038 \times (6 - 8) = 1.63$
   *Why:* with capital 2 below its steady state, consumption must start about 0.21 below $c^*$ and then rise with capital. The exact saddle path, computed numerically in the widget, gives 1.62; any other $c(0)$ either eats up the capital or breaks the transversality condition.

```verify
A = 1.2; al = 1/3; rho = 0.04; dl = 0.06; n = 0.01; sg = 2
fp(k) = al*A*k^(al - 1)
fpp(k) = al*(al - 1)*A*k^(al - 2)
ks = 8; cs = A*ks^al - (n + dl)*ks
assert abs(cs - 1.84) < 1e-9
assert abs(fpp(8) + 0.008333) < 0.0000005
assert abs(fpp(8) + (4/15)/32) < 1e-12
# Jacobian entries by numerical differentiation of the two equations
kdot(k, c) = A*k^al - c - (n + dl)*k
cdot(k, c) = c*(fp(k) - dl - rho)/sg
h = 1e-6
j11 = (kdot(ks + h, cs) - kdot(ks - h, cs))/(2*h)
j12 = (kdot(ks, cs + h) - kdot(ks, cs - h))/(2*h)
j21 = (cdot(ks + h, cs) - cdot(ks - h, cs))/(2*h)
j22 = (cdot(ks, cs + h) - cdot(ks, cs - h))/(2*h)
assert abs(j11 - 0.03) < 1e-6 and abs(j12 + 1) < 1e-6 and abs(j22) < 1e-6
assert abs(j21 + 0.007667) < 0.0000005
J = [0.03, -1; cs*fpp(ks)/sg, 0]
assert det(J) < 0
assert abs(det(J) + 0.007667) < 0.0000005
dsc = sqrt(0.03^2 - 4*det(J))
assert abs(dsc - 0.1777) < 0.00005
lu = (0.03 + dsc)/2
ls = (0.03 - dsc)/2
assert abs(lu - 0.1038) < 0.00005 and abs(ls + 0.0738) < 0.00005
assert abs(lu^2 - 0.03*lu + det(J)) < 1e-12 and abs(ls^2 - 0.03*ls + det(J)) < 1e-12
assert abs(log(2)/(-ls) - 9.39) < 0.005
m = 0.03 - ls
assert abs(m - 0.1038) < 0.00005
# (1, m) is an eigenvector for ls
assert sum(abs(J*[1; m] - ls*[1; m])) < 1e-12
c0 = cs + m*(6 - ks)
assert abs(c0 - 1.63) < 0.005
assert abs(m*2 - 0.21) < 0.005
```

## Common mistakes
- Using the golden rule $f'(k) = n + \delta$ for the optimal steady state: 13.66 instead of 8 in Example 1. The golden rule ignores impatience (GOLDEN_RULE).
- Leaving out depreciation, $f'(k^*) = \rho$, which gives 31.62; or $(f'(k) - \rho)/\sigma = 18\%$ in Example 2 (FORGOT_DEPRECIATION).
- Stopping at $k^{2/3} = 4$ and giving 4 as $k^*$ (FORGOT_POWER).
- Giving output, 2.4, as steady-state consumption (FORGOT_INVESTMENT).
- Giving the investment $(n + \delta)k^* = 0.56$ instead of what is left for consumption (INVESTMENT_NOT_CONSUMPTION).
- Giving capital's income $f'(k^*)k^* = 0.8$ instead of consumption (CAPITAL_INCOME).
- Forgetting $\sigma$ in the Euler equation: 30 % instead of 15 % at $k = 1$ in Example 2 (IGNORED_SIGMA).
- Using the average product $f(k)/k = 1.2$ instead of the marginal product $0.4$ at $k = 1$, which gives 55 % (AVERAGE_PRODUCT).
- Mixing the two versions of the objective: with the weights $L(t)$ the steady state is $f'(k^*) = \rho + \delta$; without them it is $f'(k^*) = \rho + n + \delta$. Both are correct for their own objective, but a mix of the two is not.
- Confusing the $\dot k = 0$ hump with the saddle path (see DY05). On the hump capital is only momentarily at rest; the economy moves along the saddle path, which lies below the hump to the left of $k^*$ and above it to the right.
- Dropping the transversality condition: without it, every starting consumption below the saddle path also satisfies the Euler equation and the constraint, and the model would not pin down $c(0)$.
- Thinking that patience lowers consumption for good. A lower $\rho$ means less consumption at first but, since $k^* < k_{\text{gold}}$, more capital and more consumption in the long run.

## Practice
- `ramsey-modified-golden-rule-capital` (difficulty 1): steady-state capital per worker from $f'(k^*) = \rho + \delta$ for $f(k) = Ak^\alpha$; distractors GOLDEN_RULE, FORGOT_DEPRECIATION, FORGOT_POWER.
- `ramsey-steady-state-consumption` (difficulty 2): steady-state consumption per worker, $c^* = f(k^*) - (n + \delta)k^*$, after finding $k^*$; distractors FORGOT_INVESTMENT, INVESTMENT_NOT_CONSUMPTION, CAPITAL_INCOME.
- `ramsey-consumption-growth-at-capital` (difficulty 3): the growth rate of consumption per worker, $(f'(k) - \delta - \rho)/\sigma$ in per cent, at a capital stock away from $k^*$, starting from the planner's problem; distractors IGNORED_SIGMA, AVERAGE_PRODUCT, FORGOT_DEPRECIATION.

## Real world
- Saving and growth: the model explains why countries with a high willingness to postpone consumption, such as several fast-growing East Asian economies, built up large capital stocks, and why the growth that capital accumulation brings slows down as the capital stock approaches its steady state.
- Speed of convergence: studies of countries and regions find that the gap to the steady state closes by roughly 2 % a year. The Ramsey model with a capital share of one third predicts faster convergence, as in Example 3; a broader view of capital that includes skills and knowledge brings the prediction closer to the data.
- Central bank models: real business cycle and New Keynesian models are the Ramsey model with shocks added. Their consumption Euler equation is the one derived here, and they are solved by finding the saddle path.
- Climate policy: from the Euler equation, the interest rate on the optimal path is $r = \rho + \sigma g$, where $g$ is the growth rate of consumption: the Ramsey formula for the social discount rate. The debate on how much to spend today to cut emissions, for example between the Stern Review and William Nordhaus, is largely a debate about $\rho$ and $\sigma$ in this formula.

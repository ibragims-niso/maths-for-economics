---
id: DO02
title: Optimal control and the Hamiltonian
block: DO
coreYear: 4
prerequisites: [DO01, MV08]
estMinutes: 50
status: draft
economicUses:
  - "Extracting oil, gas or minerals: how fast to use a stock that cannot be renewed"
  - "Consumption and saving over time: the Keynes–Ramsey (consumption Euler) rule"
  - Optimal growth of a whole economy
  - A firm's investment plan when changing its capital stock is costly
generators: [hotelling-rent-at-time, keynes-ramsey-consumption-growth, cake-eating-consumption-at-time]
widgets: [resource-extraction-path]
mistakeCodes:
  SIMPLE_GROWTH:
    label: Let the rent grow by simple interest
    explanation: The rent grows at the interest rate continuously, so it is compounded, p(t) = p₀e^(rt). Adding r·t·p₀ ignores that each year's rise also grows.
  RENT_FALLS:
    label: Discounted the rent instead of growing it
    explanation: The Hotelling rule says the discounted rent e^(−rt)·p(t) is constant, so the rent itself rises, p(t) = p₀e^(rt). Multiplying p₀ by e^(−rt) makes it fall.
  ANNUAL_COMPOUNDING:
    label: Compounded once a year
    explanation: In continuous time the rent grows like money compounded continuously, p₀e^(rt). Using p₀(1 + r)^t compounds only once a year and gives a slightly smaller number.
  IGNORED_SIGMA:
    label: Forgot to divide by σ
    explanation: Consumption grows at (r − ρ)/σ, not r − ρ. Only with log utility (σ = 1) are the two the same; a larger σ means the household dislikes uneven consumption more, so growth is slower.
  MULTIPLIED_BY_SIGMA:
    label: Multiplied by σ instead of dividing
    explanation: From μ = c^(−σ), the growth rate of μ is −σ times the growth rate of c, so ċ/c = (r − ρ)/σ. Dividing, not multiplying, by σ.
  SIGN_REVERSED:
    label: Got the sign of r − ρ backwards
    explanation: Saving pays r and impatience costs ρ, so consumption grows when r > ρ. The rule is ċ/c = (r − ρ)/σ, not (ρ − r)/σ.
  CONSTANT_CONSUMPTION:
    label: Kept consumption at its starting level
    explanation: ρS₀ is only the first year's flow, c(0). The costate grows at rate ρ and consumption is its inverse, so c(t) = ρS₀e^(−ρt).
  STOCK_NOT_FLOW:
    label: Gave the stock left instead of the flow used
    explanation: S₀e^(−ρt) is the stock still in the ground at t. The question asks for the flow used per year, which is the share ρ of that stock, ρS₀e^(−ρt).
  TILT_WRONG_WAY:
    label: Let consumption rise over time
    explanation: Impatience makes later use worth less, so the optimal path falls at rate ρ, c(t) = c(0)e^(−ρt). A rising path would mean waiting is rewarded, which needs a positive interest rate on the stock.
  COSTATE_SIGN:
    label: Dropped the minus sign in the costate equation
    explanation: The costate moves by λ̇ = −∂H/∂x. A unit of the state earns ∂H/∂x while it is held, so its value falls as that earning time runs out.
  WRONG_TRANSVERSALITY:
    label: Used the wrong end condition
    explanation: λ(T) = 0 holds only when x(T) is free. If x(T) is fixed, the end value of x is the condition and λ(T) is whatever it turns out to be; if x(T) ≥ 0, then λ(T) ≥ 0 with λ(T)·x(T) = 0.
  MISSING_RHO_MU:
    label: Forgot the ρμ term with the current-value Hamiltonian
    explanation: The current-value costate μ = e^(ρt)λ obeys μ̇ = ρμ − ∂H_c/∂x. Dropping ρμ mixes the present-value and current-value rules and loses the effect of impatience.
resources:
  - { title: "Dynamic Optimization Methods with Applications, 14.451: lecture notes (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/14-451-dynamic-optimization-methods-with-applications-fall-2009/pages/lecture-notes/", kind: course, verifiedAt: 2026-10-18 }
  - { title: "Economic Growth, 14.452: lecture notes (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/14-452-economic-growth-fall-2016/pages/lecture-notes/", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
Many economic decisions are flows chosen continuously over time that build up or run down a stock. An oil company chooses how fast to pump, and every barrel pumped today is missing tomorrow. A household chooses how much to spend, and what it does not spend becomes wealth that earns interest. A firm chooses how much to invest, and investment builds the capital that earns profits later. A government chooses how much of national output to save for growth. In each case the question is a whole **path** over time, not a single number. Calculus of variations (DO01) chooses the path of the stock directly; **optimal control** separates what you set (the control, a flow) from what it moves (the state, a stock), copes with limits such as "extraction cannot be negative", and produces a **shadow price** of the stock at every date. Its central tool, the **Hamiltonian**, is the workhorse behind the Hotelling rule for natural resources, the consumption Euler equation of macroeconomics and the Ramsey growth model (DO04).

## Intuition
Think of the state $x(t)$ as a stock: oil in the ground, wealth in the bank, machines in a factory. The control $u(t)$ is the tap you turn: extraction, consumption, investment. At each moment the control does two things: it pays something now, $f$, and it changes the stock, $\dot x = g$, which matters for every later moment.

To weigh the two you need a price for the stock. That price is the **costate** $\lambda(t)$: how much the best total payoff would rise if you had one more unit of the stock at time $t$. It is the Lagrange multiplier of MV08 and MV09, but there is now one constraint, $\dot x = g$, at every instant, so there is one multiplier for every date. The **Hamiltonian**
$$H = f + \lambda g$$
is the full value of what happens at one moment: the payoff now plus the change in the stock valued at its shadow price. The **maximum principle** says: at every moment choose $u$ to make $H$ as large as possible. Pumping one more barrel earns its price now but lowers the stock, which costs $\lambda$; pump until the two are equal.

The shadow price itself changes over time like the price of an asset. A unit of stock held at $t$ yields $\partial H/\partial x$ per unit of time (extra payoff plus extra growth of the stock). Its value equals everything it will still yield, so as time passes and some of that yield has been collected, the value falls by exactly that much: $\dot\lambda = -\partial H/\partial x$. At the end, stock that you are free to leave behind is worth nothing, so $\lambda(T) = 0$. If the stock can never be sold or used after $T$, leaving some of it is waste.

## Definition and formulas
**The problem.** Choose a control path $u(t)$ to
$$\max \int_0^T f\bigl(t, x(t), u(t)\bigr)\,dt \quad\text{subject to}\quad \dot x = g\bigl(t, x(t), u(t)\bigr),\;\; x(0) = x_0,$$
plus a condition at the end (below). The equation $\dot x = g$ is the **equation of motion**: a first-order differential equation (DY03) steered by the control.

**The Hamiltonian** with **costate** $\lambda(t)$:
$$H(t, x, u, \lambda) = f(t, x, u) + \lambda\, g(t, x, u).$$

**Maximum principle (Pontryagin).** Along an optimal path:
$$
\begin{array}{ll}
\text{1. Control:} & u(t) \text{ maximises } H \text{ at each } t; \text{ for an interior optimum } \dfrac{\partial H}{\partial u} = 0, \\[2mm]
\text{2. Costate:} & \dot\lambda = -\dfrac{\partial H}{\partial x}, \\[2mm]
\text{3. State:} & \dot x = \dfrac{\partial H}{\partial \lambda} = g(t, x, u), \quad x(0) = x_0.
\end{array}
$$
When $H$ is linear in $u$ (as for a mine owner who can pump at any rate), $\partial H/\partial u = 0$ cannot be solved for $u$; use "maximise $H$" directly: the coefficient of $u$ must be zero at every date where $u$ is strictly between its limits.

**Boundary (transversality) conditions at $T$:**
- $x(T)$ fixed at a given value: that value is the condition; $\lambda(T)$ is free.
- $x(T)$ free: $\lambda(T) = 0$; stock left at the end has no value.
- $x(T) \ge 0$: $\lambda(T) \ge 0$ and $\lambda(T)\,x(T) = 0$; either the stock is used up, or what is left is worthless.

**Where the conditions come from.** Treat $\lambda(t)$ as a multiplier for the constraint at every $t$ and form $\mathcal{L} = \int_0^T \bigl[f + \lambda(g - \dot x)\bigr]dt$. Integrating $-\int \lambda \dot x\,dt$ by parts gives
$$\mathcal{L} = \int_0^T \bigl[H + \dot\lambda\, x\bigr]dt - \lambda(T)x(T) + \lambda(0)x_0.$$
Setting the effect of a small change in $u$ to zero gives $\partial H/\partial u = 0$; a small change in $x$ gives $\partial H/\partial x + \dot\lambda = 0$; and a change in a free end value $x(T)$ gives $\lambda(T) = 0$. When the control is the rate of change itself, $\dot x = u$, these conditions turn back into the Euler–Lagrange equation of DO01. If $H$ is concave in $(x, u)$, the conditions are also sufficient for a maximum.

**Current-value Hamiltonian.** Most economic problems discount at a rate $\rho$: $f = e^{-\rho t}F(x, u)$. Define the current-value costate $\mu = e^{\rho t}\lambda$ (the shadow price valued at date $t$ itself rather than discounted back to date 0) and
$$H_c = F(x, u) + \mu\, g(x, u) = e^{\rho t}H.$$
The conditions become
$$\frac{\partial H_c}{\partial u} = 0, \qquad \dot\mu = \rho\mu - \frac{\partial H_c}{\partial x}, \qquad \dot x = g.$$
With an infinite horizon the end condition becomes $\lim_{t\to\infty} e^{-\rho t}\mu(t)x(t) = 0$: in present-value terms, nothing valuable is kept for ever.

**The Keynes–Ramsey rule.** A household with wealth $a$, wage $w$ and interest rate $r$ has $\dot a = ra + w - c$ and maximises $\int_0^\infty e^{-\rho t}u(c)\,dt$ with **CRRA utility** $u(c) = \dfrac{c^{1-\sigma}}{1-\sigma}$ ($u = \ln c$ when $\sigma = 1$). Then $u'(c) = \mu$ and $\dot\mu = (\rho - r)\mu$, and since $\mu = c^{-\sigma}$ gives $\dot\mu/\mu = -\sigma\,\dot c/c$:
$$\frac{\dot c}{c} = \frac{r - \rho}{\sigma}.$$
Consumption grows when the interest rate beats impatience. $1/\sigma$ is the elasticity of intertemporal substitution: the smaller $\sigma$, the more willingly the household shifts consumption over time and the faster its consumption grows (or falls). This is the continuous-time version of the Euler equation of DO03; in the Ramsey model (DO04) $r$ becomes the marginal product of capital.

**The Hotelling rule.** A competitive mine owner with stock $S$, extraction $q \ge 0$ at no cost and interest rate $r$ maximises $\int_0^T e^{-rt}p(t)q\,dt$ with $\dot S = -q$. Then $H = e^{-rt}pq - \lambda q$, so $\dot\lambda = -\partial H/\partial S = 0$: the shadow price of a unit in the ground is constant. Extraction at every date needs $e^{-rt}p(t) = \lambda$, so
$$p(t) = p_0\,e^{rt}:$$
the resource rent rises at the interest rate. With a constant extraction cost $k$ per unit, the same argument makes the rent $p(t) - k$ rise at rate $r$.

**Cake eating with log utility.** A stock $S_0$ that does not grow, $\dot S = -c$, and $\max \int_0^\infty e^{-\rho t}\ln c\,dt$. Then $1/c = \mu$, $\dot\mu = \rho\mu$, so consumption falls at rate $\rho$, and using up exactly the whole stock gives
$$c(t) = \rho S_0\, e^{-\rho t}, \qquad S(t) = S_0\, e^{-\rho t}, \qquad c(t) = \rho\, S(t).$$

**Investment with adjustment costs (in brief).** A firm with capital $K$ earns $aK$ a year; investing at rate $I$ costs $\tfrac{b}{2}I^2$ because fast expansion is disruptive, and $\dot K = I$ over $[0, T]$ with $K(T)$ free. Then $H = aK - \tfrac{b}{2}I^2 + \lambda I$ gives $I = \lambda/b$, $\dot\lambda = -a$ and $\lambda(T) = 0$, so
$$\lambda(t) = a(T - t), \qquad I(t) = \frac{a(T - t)}{b}.$$
The shadow price of capital is the profit a unit of capital will still earn, and investment fades to zero as the end approaches. Tobin's $q$ theory of investment rests on the same idea.

## Interactive
::widget{id="resource-extraction-path"}

This is the country of Example 3, using up a fixed stock with $u = \ln c$. Move **Discount rate ρ** and **Initial stock S₀** and watch the extraction path: the green area is what is used in the first 10 years and the gold area, which runs on beyond the edge of the graph, is what is still in the ground. Check: at ρ = 5 % and S₀ = 100 the panel shows c(0) = 5, stock left S(10) = 60.65 and shadow price λ(0) = 0.2. Raise ρ to 10 %: c(0) doubles to 10, the curve falls twice as fast and S(10) drops to 36.79. Notice that the two areas always add up to S₀, and that doubling S₀ doubles the whole path but halves λ(0).

## Worked examples

### Example 1 (easy): the Hotelling rule for a mine
A mine owner sells a mineral in a competitive market; extraction costs nothing and the interest rate is 5 % a year, compounded continuously. The rent (price per tonne) is 20 today. Show that the rent must rise at the interest rate, and find the rent in 10 years and the time it takes to double.

1. $H = e^{-0.05t}\,p(t)\,q - \lambda q, \qquad \dot S = -q$
   *Why:* the state is the stock $S$ in the ground and the control is extraction $q$; the payoff is discounted revenue and each tonne extracted lowers the stock by one, so $g = -q$.
2. $\dot\lambda = -\dfrac{\partial H}{\partial S} = 0$, so $\lambda$ is constant
   *Why:* $H$ does not contain $S$: a tonne in the ground earns nothing while it waits, so its value in today's money never changes.
3. $\dfrac{\partial H}{\partial q} = e^{-0.05t}p(t) - \lambda = 0 \;\Rightarrow\; p(t) = \lambda e^{0.05t}, \quad \lambda = p(0) = 20$
   *Why:* $H$ is linear in $q$. If the discounted price were above $\lambda$ at some date, the owner would pump everything then; if below, nothing. For the market to be supplied at every date the coefficient of $q$ must be zero.
4. $p(10) = 20\,e^{0.05 \times 10} = 20\,e^{0.5} = 32.97$
   *Why:* the rent grows at 5 % continuously; simple growth would give only 30 and annual compounding 32.58.
5. $e^{0.05t} = 2 \;\Rightarrow\; t = \dfrac{\ln 2}{0.05} = 13.86$ years
   *Why:* keeping a tonne in the ground must pay as well as selling it and banking the money, so the rent doubles exactly as fast as a bank deposit at 5 %.

```verify
r = 0.05; p0 = 20; T = 10
lam = p0
p10 = lam*exp(r*T)
assert abs(p10 - 32.97) < 0.005
assert abs(p10*exp(-r*T) - lam) < 1e-9
td = log(2)/r
assert abs(td - 13.86) < 0.005
assert abs(lam*exp(r*td) - 2*p0) < 1e-9
# the wrong answers
assert abs(p0*(1 + r*T) - 30) < 1e-9
assert abs(p0*(1 + r)^T - 32.58) < 0.005
assert abs(p0*exp(-r*T) - 12.13) < 0.005
```

### Example 2 (medium): how fast should consumption grow?
A household has wealth $a$, a constant wage $w$ and earns interest $r = 6\%$, so $\dot a = 0.06a + w - c$. It maximises $\int_0^\infty e^{-0.02t}u(c)\,dt$ with $u(c) = \dfrac{c^{1-\sigma}}{1-\sigma}$ and $\sigma = 2$, that is $u(c) = -1/c$. Find the growth rate of consumption, and consumption after 10 years if it starts at $c(0) = 30$ (thousand a year).

1. $H_c = -\dfrac{1}{c} + \mu\,(0.06a + w - c)$
   *Why:* the current-value Hamiltonian uses utility without the discount factor; wealth is the state and consumption the control.
2. $\dfrac{\partial H_c}{\partial c} = \dfrac{1}{c^2} - \mu = 0 \;\Rightarrow\; \mu = c^{-2}$
   *Why:* one more unit spent now adds marginal utility $c^{-2}$; one more unit kept as wealth is worth $\mu$. At the optimum they are equal.
3. $\dot\mu = 0.02\,\mu - \dfrac{\partial H_c}{\partial a} = 0.02\,\mu - 0.06\,\mu = -0.04\,\mu$
   *Why:* the current-value costate equation; wealth earns 6 %, so its shadow price falls at $r - \rho = 4\%$ a year.
4. $\dfrac{\dot\mu}{\mu} = -2\,\dfrac{\dot c}{c} = -0.04 \;\Rightarrow\; \dfrac{\dot c}{c} = \dfrac{0.06 - 0.02}{2} = 0.02$, i.e. 2 % a year
   *Why:* taking logs of $\mu = c^{-2}$ and differentiating with respect to time gives $\dot\mu/\mu = -2\dot c/c$. This is the Keynes–Ramsey rule $(r - \rho)/\sigma$.
5. $c(10) = 30\,e^{0.02 \times 10} = 36.64$; with log utility ($\sigma = 1$) growth would be 4 % and $c(10) = 30\,e^{0.4} = 44.75$
   *Why:* consumption grows at a constant rate. With $\sigma = 2$ the household dislikes uneven consumption more, so it lets consumption grow only half as fast; at 2 % it doubles in $\ln 2 / 0.02 = 34.66$ years.

```verify
r = 0.06; rho = 0.02; s = 2
g = (r - rho)/s
assert abs(g - 0.02) < 1e-12
assert abs((rho - r) + 0.04) < 1e-12
# if c grows at g, then mu = c^(-s) grows at rho - r, as the costate equation requires
cc(t) = 30*exp(g*t)
mu(t) = cc(t)^(-s)
h = 1e-6
assert abs((log(mu(1 + h)) - log(mu(1)))/h - (rho - r)) < 1e-6
assert abs(cc(10) - 36.64) < 0.005
assert abs(30*exp((r - rho)*10) - 44.75) < 0.005
assert abs(log(2)/g - 34.66) < 0.005
# the wrong answers, in per cent
assert abs(100*(r - rho) - 4) < 1e-9 and abs(100*(r - rho)*s - 8) < 1e-9 and abs(100*(rho - r)/s + 2) < 1e-9
```

### Example 3 (hard): using up a fixed stock
A country owns 100 (million tonnes) of a mineral. The stock does not grow, so $\dot S = -c$, and the country chooses the extraction path to maximise $\int_0^\infty e^{-0.05t}\ln c(t)\,dt$. Find the optimal path, extraction now and in 10 years, the stock left after 10 years and the shadow price of the stock today.

1. $H_c = \ln c - \mu c, \qquad \dfrac{\partial H_c}{\partial c} = \dfrac{1}{c} - \mu = 0 \;\Rightarrow\; c = \dfrac{1}{\mu}$
   *Why:* the marginal utility of using a tonne now, $1/c$, must equal $\mu$, the value of keeping it in the ground.
2. $\dot\mu = 0.05\,\mu - \dfrac{\partial H_c}{\partial S} = 0.05\,\mu \;\Rightarrow\; \mu(t) = \mu(0)\,e^{0.05t}, \quad c(t) = c(0)\,e^{-0.05t}$
   *Why:* $S$ does not appear in $H_c$, so the current-value shadow price grows at the discount rate, and consumption, its inverse, falls at 5 % a year.
3. $\displaystyle\int_0^\infty c(0)\,e^{-0.05t}\,dt = \frac{c(0)}{0.05} = 100 \;\Rightarrow\; c(0) = 5$
   *Why:* the transversality condition $\lim e^{-0.05t}\mu(t)S(t) = \mu(0)\lim S(t) = 0$ says the stock must be used up, so total extraction, an improper integral (C116), equals the stock.
4. $c(10) = 5\,e^{-0.5} = 3.03, \qquad S(10) = 100\,e^{-0.5} = 60.65$
   *Why:* in the first 10 years the country uses $\int_0^{10} 5e^{-0.05t}dt = 100(1 - e^{-0.5}) = 39.35$. At every date $c(t) = 0.05\,S(t)$: it uses 5 % of what is left.
5. $\lambda(0) = \mu(0) = \dfrac{1}{c(0)} = 0.2$, and $e^{-0.05t}\mu(t) = 0.2$ at every date
   *Why:* one more tonne today would raise lifetime utility by about 0.2. The present-value shadow price is constant: the cake-eater's version of the Hotelling rule in Example 1.

```verify
rho = 0.05; S0 = 100
c0 = rho*S0
assert c0 == 5
cc(t) = c0*exp(-rho*t)
SS(t) = S0*exp(-rho*t)
assert abs(c0/rho - S0) < 1e-12
assert abs(cc(10) - 3.03) < 0.005
assert abs(SS(10) - 60.65) < 0.005
used = c0/rho*(1 - exp(-rho*10))
assert abs(used - 39.35) < 0.005 and abs(used + SS(10) - S0) < 1e-9
assert abs(cc(10) - rho*SS(10)) < 1e-12
lam0 = 1/c0
assert abs(lam0 - 0.2) < 1e-12
# mu = 1/c grows at rho, so the present-value shadow price exp(-rho t) mu(t) stays at 0.2
assert abs(exp(-rho*10)/cc(10) - lam0) < 1e-12
# among paths g*S0*exp(-g t), which all use up the stock, g = rho gives the most utility
J(g) = log(g*S0)/rho - g/rho^2
assert J(rho) > J(0.045) and J(rho) > J(0.055)
# the widget check: at rho = 10 % the stock left after 10 years
assert abs(S0*exp(-0.1*10) - 36.79) < 0.005 and 0.1*S0 == 10
# the wrong answers
assert abs(c0*exp(rho*10) - 8.24) < 0.005
```

## Common mistakes
- Letting the rent grow by simple interest, $20(1 + 0.05 \times 10) = 30$ instead of 32.97 in Example 1 (SIMPLE_GROWTH).
- Discounting the rent instead of growing it, $20e^{-0.5} = 12.13$: it is the discounted rent $e^{-rt}p(t)$ that stays constant, not the rent (RENT_FALLS).
- Compounding once a year, $20 \times 1.05^{10} = 32.58$, when the problem is in continuous time (ANNUAL_COMPOUNDING).
- Forgetting $\sigma$ in the Keynes–Ramsey rule: $r - \rho = 4\%$ instead of 2 % in Example 2 (IGNORED_SIGMA).
- Multiplying by $\sigma$: $(r - \rho)\sigma = 8\%$ (MULTIPLIED_BY_SIGMA).
- Getting the sign backwards, $-2\%$: consumption grows when the interest rate is above the rate of time preference, not below (SIGN_REVERSED).
- Keeping extraction at its first value, 5 a year in Example 3; a constant flow would empty the stock in 20 years and leave nothing for later (CONSTANT_CONSUMPTION).
- Giving the stock left, 60.65, when the question asks for the flow extracted, 3.03 (STOCK_NOT_FLOW).
- Letting extraction rise over time, $5e^{0.5} = 8.24$ at $t = 10$; impatience makes it fall (TILT_WRONG_WAY).
- Writing $\dot\lambda = +\partial H/\partial x$; with the wrong sign the shadow price of the mine's stock or of the firm's capital moves the wrong way (COSTATE_SIGN).
- Setting $\lambda(T) = 0$ when the end stock is fixed, or forgetting it when the end stock is free (WRONG_TRANSVERSALITY).
- Using the current-value Hamiltonian $H_c$ with the present-value rule $\dot\mu = -\partial H_c/\partial x$; in Example 3 this would make $\mu$ constant and extraction flat (MISSING_RHO_MU).
- Setting $\partial H/\partial u = 0$ and "solving" for $u$ when $H$ is linear in $u$, as for the mine owner; then the condition is on the coefficient of $u$, and the control is chosen by maximising $H$.

## Practice
- `hotelling-rent-at-time` (difficulty 1): the rent of a non-renewable resource after $t$ years by the Hotelling rule, $p_0e^{rt}$; distractors SIMPLE_GROWTH, RENT_FALLS, ANNUAL_COMPOUNDING.
- `keynes-ramsey-consumption-growth` (difficulty 2): the growth rate of consumption, $(r - \rho)/\sigma$ in per cent, for a household with CRRA utility; distractors IGNORED_SIGMA, MULTIPLIED_BY_SIGMA, SIGN_REVERSED.
- `cake-eating-consumption-at-time` (difficulty 3): extraction $c(t) = \rho S_0e^{-\rho t}$ at a given date when a fixed stock is used up with $u = \ln c$ over an infinite horizon; distractors CONSTANT_CONSUMPTION, STOCK_NOT_FLOW, TILT_WRONG_WAY.

## Real world
- Natural resources: Harold Hotelling's 1931 rule is the starting point of resource economics. Actual oil and metal prices have not risen smoothly at the interest rate, because new discoveries, better extraction technology and changing costs keep shifting the stock and the rent; testing the rule against data is a long-running research topic.
- Macroeconomics: the Keynes–Ramsey rule is the consumption Euler equation inside growth models and the models central banks use. When the central bank raises the real interest rate, households tilt consumption towards the future and spend less today, one channel of monetary policy.
- Climate and environment: a carbon budget is a stock that is used up by emissions, and its costate is the social cost of carbon, the shadow price of one more tonne of CO₂. Fisheries and forests are managed with the same tools, with a stock that regrows.
- History: Lev Pontryagin and his colleagues proved the maximum principle in the Soviet Union in the 1950s, working on problems such as steering aircraft and rockets, at about the same time as Bellman developed dynamic programming (DO03) in the United States. Economists adopted it in the 1960s for optimal growth (DO04) and investment.

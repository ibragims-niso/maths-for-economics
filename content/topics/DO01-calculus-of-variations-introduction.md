---
id: DO01
title: Calculus of variations (introduction)
block: DO
coreYear: 4
prerequisites: [DY03, C115]
estMinutes: 50
status: draft
economicUses:
  - "Adjustment costs: how fast a firm should expand output, hiring or capital"
  - "Consumption and saving over a lifetime: the continuous-time Euler equation"
  - Running down a stock of savings or a natural resource over a fixed horizon
  - "Choosing a whole time path, not just one number, as in growth and investment models"
generators: [variations-straight-line-path, variations-adjustment-path-value, variations-adjustment-saving]
widgets: [adjustment-cost-paths]
mistakeCodes:
  MIDPOINT:
    label: Gave the midpoint level
    explanation: The average of the two ends, (A + B)/2, is the level only halfway through the plan. On the straight-line path the level after t months is A + (B − A)·t/T.
  FORGOT_START:
    label: Left out the starting level
    explanation: The cheapest path starts at x(0) = A, so the level after t months is A plus the change so far, (B − A)·t/T. The change alone is not the level.
  SPEED_ONLY:
    label: Gave the speed of change
    explanation: (B − A)/T is the constant speed ẋ on the cheapest path, not a level or a cost. Use it to build x(t) = A + ẋ·t, or to find the cost c·ẋ²·T.
  CHANGE_AS_SPEED:
    label: Used the total change as the speed
    explanation: The integrand is c·ẋ², where ẋ = (B − A)/T is the change per month. Squaring the whole change B − A and then multiplying by T makes the cost T² times too large; the least cost is c(B − A)²/T.
  FORGOT_SQUARE:
    label: Integrated ẋ instead of ẋ²
    explanation: The integral of ẋ is just the total change B − A, the same for every path. The cost depends on ẋ², which is c·ẋ² per month on the straight line, so the total is c·ẋ²·T.
  STRAIGHT_LINE:
    label: Ignored the running cost
    explanation: The straight line is cheapest only when the cost is ∫ẋ² dt alone. With a running cost b·x² the Euler–Lagrange equation is ẍ = (b/a)x, whose solution stays lower early and rises faster late.
  EXP_ONLY:
    label: Kept only the growing exponential
    explanation: ẍ = k²x has two solutions, e^(kt) and e^(−kt), and both are needed so that the path can meet x(0) and x(T). A single exponential can be fitted to one end only.
  K_SQUARED:
    label: Used b/a instead of its square root
    explanation: The characteristic equation of ẍ = (b/a)x is r² = b/a, so the roots are ±k with k = √(b/a). Using b/a itself as the rate gives a different path.
  OPTIMAL_NOT_SAVING:
    label: Gave the cost of the best path
    explanation: The question asks how much more the other plan costs. Work out both costs and subtract, so the extra cost is the cost of the steady plan minus the cost of the Euler–Lagrange path.
  LINE_COST_ONLY:
    label: Gave the cost of the steady plan
    explanation: The cost of the steady plan is only half of the comparison. Subtract the cost of the cheapest path, a·x(T)·ẋ(T) when x(0) = 0, to get the extra cost.
  SQUARED_AVERAGE:
    label: Squared the average level
    explanation: On the steady plan x = Bt/T the running cost is b∫x² dt = b·B²·T/3. Using the average level B/2 gives b·B²·T/4, which is too small, because the average of x² is larger than the square of the average.
resources:
  - { title: "Variational Principles in Classical Mechanics, 5.1 Introduction to the Calculus of Variations (LibreTexts)", url: "https://phys.libretexts.org/Bookshelves/Classical_Mechanics/Variational_Principles_in_Classical_Mechanics_(Cline)/05%3A_Calculus_of_Variations/5.01%3A_Introduction_to_the_Calculus_of_Variations", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Variational Principles in Classical Mechanics, 5.2 Euler's Differential Equation (LibreTexts)", url: "https://phys.libretexts.org/Bookshelves/Classical_Mechanics/Variational_Principles_in_Classical_Mechanics_(Cline)/05%3A_Calculus_of_Variations/5.02%3A_Eulers_Differential_Equation", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Dynamic Optimization Methods with Applications, 14.451 (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/14-451-dynamic-optimization-methods-with-applications-fall-2009/", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
Many economic choices are not one number but a whole path over time. A firm that must double its output by next year has to decide how fast to grow in every month: growing in a rush means overtime, hurried hiring and costly mistakes, while growing early means paying for capacity before it is needed. A household with savings decides how much to spend in every year of its life, and a country with an oil fund decides how fast to draw it down. In each case the payoff adds up the whole path, $\int_0^T F\,dt$, and the question is which path gives the best total. The **calculus of variations** answers it: it turns "find the best function" into a differential equation, the **Euler–Lagrange equation**, which DY03 and DY04 taught you to solve. It is the oldest tool of dynamic optimisation in economics, used by Ramsey for optimal saving and by Hotelling for exhaustible resources.

## Intuition
In C109 you found the best *number* $x$ by asking: if I move $x$ a little, does the objective change? At the best point a small move changes it by nothing to first order, so $f'(x) = 0$.

Do the same with a whole path. Take the best path $x^*(t)$ and bend it a little, $x^*(t) + \varepsilon\,\eta(t)$, where $\eta$ is any smooth bump that is zero at both ends, so the bent path still starts and finishes in the right place. If $x^*$ is really the best, no bump can improve it, so the total must not change to first order in $\varepsilon$, whatever the shape of the bump. That is only possible if a certain balance holds at **every moment**: the gain from having a slightly higher level $x$ at time $t$ must be exactly offset by the change in the payoff from the speed $\dot x$ just before and just after $t$. Writing that balance down gives the Euler–Lagrange equation.

A useful picture is a firm raising output: holding output high early costs money, so it would like to wait; but waiting means a steeper climb at the end, and steep climbs are expensive. The best path is the one where, at every moment, these two pressures cancel.

## Definition and formulas
**The problem.** Choose a smooth path $x(t)$ on $[0, T]$ with fixed endpoints to maximise or minimise
$$J[x] = \int_0^T F\big(t, x(t), \dot x(t)\big)\,dt, \qquad x(0) = x_0, \quad x(T) = x_T,$$
where $\dot x = dx/dt$. $J$ is a **functional**: it takes a whole function and returns a number. Partial derivatives of $F$ are written $F_x = \partial F/\partial x$ and $F_{\dot x} = \partial F/\partial \dot x$, treating $t$, $x$ and $\dot x$ as three separate variables.

**The Euler–Lagrange equation.** If $x^*(t)$ is optimal, then at every $t$
$$F_x - \frac{d}{dt}\,F_{\dot x} = 0.$$
*Sketch of why.* Put $x = x^* + \varepsilon\eta$ with $\eta(0) = \eta(T) = 0$. The best path makes $J$ stationary at $\varepsilon = 0$:
$$\frac{dJ}{d\varepsilon}\Big|_{\varepsilon = 0} = \int_0^T \big(F_x\,\eta + F_{\dot x}\,\dot\eta\big)\,dt = 0.$$
Integrate the second term by parts (C115): $\int_0^T F_{\dot x}\,\dot\eta\,dt = \big[F_{\dot x}\,\eta\big]_0^T - \int_0^T \tfrac{d}{dt}F_{\dot x}\;\eta\,dt$, and the bracket is zero because $\eta$ vanishes at both ends. So
$$\int_0^T \Big(F_x - \frac{d}{dt}F_{\dot x}\Big)\,\eta(t)\,dt = 0 \quad \text{for every bump } \eta,$$
which forces the bracket to be zero at every $t$ (if it were positive somewhere, a bump placed just there would make the integral positive). Like $f'(x) = 0$, this is a **necessary** condition. Since $\frac{d}{dt}F_{\dot x}$ usually contains $\ddot x$, it is a second-order differential equation (DY04), and its two constants are fixed by the two endpoints.

**Special cases.**
- *$F$ does not contain $x$*: then $F_x = 0$, so $F_{\dot x}$ is constant along the path.
- *$F$ depends on $\dot x$ only*: $F_{\dot x}(\dot x) = $ constant means $\dot x$ is constant (when $F_{\dot x\dot x} \ne 0$), so the path is a **straight line** through the two endpoints. Example: the cost $c\int_0^T \dot x^2\,dt$ is smallest on the line, with least value $c\,(x_T - x_0)^2/T$.
- *Shortest path as a check*: the length of the graph from $(0, x_0)$ to $(T, x_T)$ is $\int_0^T \sqrt{1 + \dot x^2}\,dt$ (C118). Here $F_{\dot x} = \dot x/\sqrt{1 + \dot x^2}$ must be constant, so $\dot x$ is constant: the shortest curve between two points is the straight line, as it should be.
- *$F$ does not contain $t$* (Beltrami identity): then $F - \dot x\,F_{\dot x}$ is constant along the optimal path, a first-order equation that is often easier to use.

**Quadratic adjustment cost.** A firm moves output from $x_0$ to $x_T$ and pays $a\dot x^2$ for changing it and $b x^2$ for running at level $x$ ($a, b > 0$):
$$\min \int_0^T \big(a\dot x^2 + b x^2\big)\,dt: \qquad F_x = 2bx,\; F_{\dot x} = 2a\dot x \;\Rightarrow\; \ddot x = \frac{b}{a}\,x = k^2 x, \quad k = \sqrt{b/a}.$$
The roots of $r^2 = k^2$ are $\pm k$, so $x(t) = c_1 e^{kt} + c_2 e^{-kt}$, and the endpoints fix $c_1$ and $c_2$. With $x_0 = 0$ this is $x(t) = x_T\,\dfrac{\sinh kt}{\sinh kT}$, where $\sinh u = (e^u - e^{-u})/2$ and $\cosh u = (e^u + e^{-u})/2$. The least cost has a short form: integrating $a\dot x^2$ by parts and using $a\ddot x = bx$,
$$J^* = \big[a\,x\,\dot x\big]_0^T.$$
A larger ratio $b/a$ makes the path stay low for longer and climb steeply at the end; with $b = 0$ it is the straight line again.

**Discounted consumption and the Euler equation.** Wealth $W$ earns interest $r$ and pays for consumption $c$, so $\dot W = rW - c$, that is $c = rW - \dot W$. A household maximises $\int_0^T e^{-\rho t}\,u(c)\,dt$ with $W(0) = W_0$ and $W(T) = 0$, where $\rho$ is its rate of impatience (continuous discounting as in C116). With $F = e^{-\rho t}u(rW - \dot W)$ we get $F_W = r e^{-\rho t}u'(c)$ and $F_{\dot W} = -e^{-\rho t}u'(c)$, so the Euler–Lagrange equation becomes
$$\frac{d}{dt}\Big(e^{-\rho t}\,u'(c)\Big) = -r\,e^{-\rho t}\,u'(c).$$
In words: discounted marginal utility falls at the rate of interest, so a unit of wealth is equally valuable whether it is consumed now or saved and consumed later. For $u = \ln c$ this gives $\dfrac{\dot c}{c} = r - \rho$: consumption grows when the interest rate beats impatience and falls when it does not. Example 3 solves a full case.

**Second-order condition (Legendre).** Along a minimum, $F_{\dot x\dot x} \ge 0$; along a maximum, $F_{\dot x\dot x} \le 0$. Stronger and easy to use: if $F$ is convex in $(x, \dot x)$ for every $t$, a path that satisfies the Euler–Lagrange equation and the endpoint conditions is the global minimum (concave gives the global maximum). Both examples above pass: $a\dot x^2 + bx^2$ is convex and $e^{-\rho t}\ln(rW - \dot W)$ is concave.

**Free endpoints (transversality, in words).** If the end value $x(T)$ is not fixed, the bracket $\big[F_{\dot x}\,\eta\big]$ no longer vanishes at $T$, so the optimum must also satisfy $F_{\dot x} = 0$ at $t = T$: at the end it is not worth changing the speed of the path. If the end date $T$ is free, the extra condition is $F - \dot x\,F_{\dot x} = 0$ at $T$. These **transversality conditions** replace the missing endpoint condition. Problems with constraints on the rate of change, or a control variable such as investment, are handled by optimal control and the Hamiltonian in DO02, which contains the calculus of variations as a special case.

## Interactive
::widget{id="adjustment-cost-paths"}

A firm raises production from 0 to 10 in 2 years and pays $\int_0^2 \big(\dot x^2 + (b/a)\,x^2\big)\,dt$. The lilac curve is the Euler–Lagrange path and the dashed gold curve is a trial path $x = 10(t/2)^p$. Move **Trial path curvature p** to bend the trial path and **Running-cost ratio b/a** to change how costly a high level is; the panel shows the cost of the best path, the cost of the trial path and the extra cost. Check: at the start ($p = 1$, $b/a = 1$, Example 2) the panel shows 103.73, 116.67 and 12.94. Now move $p$: the extra cost is smallest, 1.93, at $p = 1.7$, but it never reaches 0, because no member of this family solves $\ddot x = x$. Set $b/a$ to 0: the best path becomes the straight line with cost 50, and at $p = 1$ the extra cost is 0. Raise $b/a$ to 4 and watch the best path hug the axis and then climb steeply.

## Worked examples

### Example 1 (easy): the cheapest way to expand output
A firm will raise its daily output from 20 to 60 units over 4 months. Changing output quickly is costly: the adjustment cost is $\int_0^4 \dot x^2\,dt$ (thousand). Find the cheapest path, the output after 1 month and the least cost, and compare with the plan $x = 20 + 2.5t^2$.

1. $F = \dot x^2$: $F_x = 0$, $F_{\dot x} = 2\dot x$, so $-\dfrac{d}{dt}(2\dot x) = 0 \Rightarrow \ddot x = 0$
   *Why:* the Euler–Lagrange equation $F_x - \frac{d}{dt}F_{\dot x} = 0$; $F$ has no $x$ in it, so $F_{\dot x}$, and with it the speed $\dot x$, must stay constant.
2. $x(t) = c_1 + c_2 t$ with $x(0) = 20$, $x(4) = 60$: $c_1 = 20$, $c_2 = \dfrac{60 - 20}{4} = 10$, so $x(t) = 20 + 10t$
   *Why:* $\ddot x = 0$ means a straight line; the two endpoints fix its intercept and slope.
3. $x(1) = 20 + 10 = 30$
   *Why:* the starting level plus one month at the constant speed of 10 units a month.
4. Least cost $\int_0^4 10^2\,dt = 100 \times 4 = 400$, which is $(60 - 20)^2/4$
   *Why:* the cost per month is constant along a straight line, so the total is that times the length of the plan.
5. The plan $20 + 2.5t^2$ also runs from 20 to 60, but $\dot x = 5t$ and its cost is $\int_0^4 25t^2\,dt = \dfrac{25 \times 64}{3} = 533.33$
   *Why:* it changes slowly at first and fast at the end, and because $\dot x^2$ punishes high speeds more than proportionally, uneven speed costs more. $F_{\dot x\dot x} = 2 > 0$ and $F$ is convex, so the straight line is the minimum.

```verify
A = 20; B = 60; T = 4
m = (B - A)/T
assert m == 10
assert A + m*1 == 30
J = m^2*T
assert J == 400
assert J == (B - A)^2/T
assert A + 2.5*T^2 == B
Jalt = 25*T^3/3
assert abs(Jalt - 533.33) < 0.005
assert Jalt > J
```

### Example 2 (medium): adjustment with a running cost
A firm will raise production from $x(0) = 0$ to $x(2) = 10$ (thousand units a year) over 2 years and pays $\int_0^2 \big(\dot x^2 + x^2\big)\,dt$ (thousand): changing output is costly, and so is running at a high level. Find the cheapest path, $x(1)$ and the least cost, and compare with the steady build-up $x = 5t$.

1. $F_x = 2x$, $F_{\dot x} = 2\dot x$, so $2x - 2\ddot x = 0 \Rightarrow \ddot x = x$, $k = 1$
   *Why:* the Euler–Lagrange equation with $a = b = 1$; it is $\ddot x = (b/a)x$ with $k = \sqrt{b/a} = 1$.
2. $x(t) = c_1 e^{t} + c_2 e^{-t}$: $c_1 + c_2 = 0$ and $c_1 e^{2} + c_2 e^{-2} = 10$, so $c_1 = \dfrac{10}{e^2 - e^{-2}} = 1.3786$, $c_2 = -1.3786$
   *Why:* the characteristic equation $r^2 = 1$ has roots $\pm 1$ (DY04), and each endpoint gives one equation. The path is $x(t) = 10\,\sinh t / \sinh 2$.
3. $x(1) = 1.3786\,(e - e^{-1}) = 3.24$
   *Why:* the steady plan would be at 5 after one year; the best path stays lower because every unit of output held early adds to the running cost.
4. $\dot x(2) = 1.3786\,(e^2 + e^{-2}) = 10.37$, so $J^* = \big[x\,\dot x\big]_0^2 = 10 \times 10.37 = 103.73$
   *Why:* the short form of the least cost, $J^* = [a\,x\,\dot x]_0^T$ with $a = 1$; the lower end adds nothing because $x(0) = 0$. The path ends steeply: $\dot x(2) = 10.37$, against $\dot x(0) = 2.76$.
5. Steady plan: $\int_0^2 (25 + 25t^2)\,dt = 50 + 66.67 = 116.67$, so it costs $116.67 - 103.73 = 12.94$ more
   *Why:* the steady plan pays 50 for adjusting and 66.67 for running. $F = \dot x^2 + x^2$ is convex, so the Euler–Lagrange path is the cheapest of all paths with these ends.

```verify
c1 = 10/(exp(2) - exp(-2))
assert abs(c1 - 1.3786) < 0.00005
x(t) = c1*exp(t) - c1*exp(-t)
assert abs(x(0)) < 1e-12 and abs(x(2) - 10) < 1e-9
assert abs(x(1) - 3.24) < 0.005
assert abs(x(1) - 10*sinh(1)/sinh(2)) < 1e-12
h = 0.001
assert abs((x(1 + h) - 2*x(1) + x(1 - h))/h^2 - x(1)) < 0.0001
xd(t) = c1*exp(t) + c1*exp(-t)
assert abs(xd(2) - 10.37) < 0.005 and abs(xd(0) - 2.76) < 0.005
Jbest = 10*xd(2)
assert abs(Jbest - 103.73) < 0.005
assert abs(Jbest - 100*cosh(2)/sinh(2)) < 1e-9
Jline = 25*2 + 25*2^3/3
assert abs(Jline - 116.67) < 0.005
assert abs(Jline - Jbest - 12.94) < 0.005
```

### Example 3 (hard): spending savings with interest and impatience
A household has savings $W_0 = 100$ (thousand) that earn interest at $r = 0.03$ and must be used up over 20 years, so $\dot W = 0.03W - c$, $W(0) = 100$, $W(20) = 0$. It maximises $\int_0^{20} e^{-0.05t}\ln c\,dt$. Find the optimal consumption path.

1. $F = e^{-0.05t}\ln(0.03W - \dot W)$: $F_W = \dfrac{0.03\,e^{-0.05t}}{c}$, $F_{\dot W} = -\dfrac{e^{-0.05t}}{c}$
   *Why:* write consumption as $c = rW - \dot W$ so that the problem is in the form $\int F(t, W, \dot W)\,dt$; then differentiate by the chain rule.
2. $\dfrac{d}{dt}\Big(\dfrac{e^{-0.05t}}{c}\Big) = -0.03\,\dfrac{e^{-0.05t}}{c} \;\Rightarrow\; \dfrac{e^{-0.05t}}{c(t)} = \dfrac{e^{-0.03t}}{c_0} \;\Rightarrow\; c(t) = c_0\,e^{-0.02t}$
   *Why:* the Euler–Lagrange equation says discounted marginal utility $e^{-\rho t}/c$ falls at the rate $r$, a first-order equation solved as in DY03. Consumption changes at $r - \rho = -0.02$: the household is more impatient than the interest rate rewards, so it spends more early.
3. $\displaystyle\int_0^{20} e^{-0.03t}c(t)\,dt = c_0\int_0^{20} e^{-0.05t}\,dt = c_0\,\frac{1 - e^{-1}}{0.05} = 100 \;\Rightarrow\; c_0 = \frac{5}{0.6321} = 7.91$
   *Why:* multiplying $\dot W - 0.03W = -c$ by $e^{-0.03t}$ gives $\frac{d}{dt}(e^{-0.03t}W) = -e^{-0.03t}c$; integrating from 0 to 20 with $W(20) = 0$ says the present value of all consumption equals the savings.
4. $c(10) = 7.91\,e^{-0.2} = 6.48$, $\;c(20) = 7.91\,e^{-0.4} = 5.30$, and wealth after 10 years is $W(10) = 50.96$
   *Why:* consumption falls by 2 % a year. $W(t) = e^{0.03t}\big(100 - c_0(1 - e^{-0.05t})/0.05\big)$ comes from the same integration, stopped at $t$.
5. Lifetime utility $24.032$, against $23.951$ for the flat path $c = \dfrac{0.03 \times 100}{1 - e^{-0.6}} = 6.65$ with the same budget
   *Why:* $\int_0^{20} e^{-0.05t}\big(\ln c_0 - 0.02t\big)\,dt$, using integration by parts for the $t\,e^{-0.05t}$ term (C115). $F_{\dot W\dot W} = -e^{-0.05t}/c^2 < 0$ and $F$ is concave in $(W, \dot W)$, so the Euler–Lagrange path is the maximum.

```verify
r = 0.03; rho = 0.05; W0 = 100; T = 20
c0 = rho*W0/(1 - exp(-rho*T))
assert abs(c0 - 7.91) < 0.005
assert abs((1 - exp(-1)) - 0.6321) < 0.00005
c(t) = c0*exp((r - rho)*t)
assert abs(c(10) - 6.48) < 0.005 and abs(c(20) - 5.30) < 0.005
# present value of consumption equals the savings
assert abs(c0*(1 - exp(-rho*T))/rho - W0) < 1e-9
W(t) = exp(r*t)*(W0 - c0*(1 - exp(-rho*t))/rho)
assert abs(W(T)) < 1e-9
assert abs(W(10) - 50.96) < 0.005
# discounted marginal utility falls at the rate r
assert abs(exp(-rho*T)/c(T) - exp(-r*T)/c0) < 1e-12
I0 = (1 - exp(-rho*T))/rho
I1 = (1 - exp(-rho*T)*(1 + rho*T))/rho^2
U = log(c0)*I0 + (r - rho)*I1
cf = r*W0/(1 - exp(-r*T))
Uf = log(cf)*I0
assert abs(cf - 6.65) < 0.005
assert abs(cf*(1 - exp(-r*T))/r - W0) < 1e-9
assert abs(U - 24.032) < 0.0005 and abs(Uf - 23.951) < 0.0005
assert U > Uf
```

## Common mistakes
- Giving the midpoint level $(A + B)/2$ for any month, not just halfway through: 40 instead of 30 in Example 1 (MIDPOINT).
- Leaving out the starting level, so that $x(1) = 10$ instead of 30 in Example 1 (FORGOT_START).
- Reporting the speed $(B - A)/T = 10$ when the question asks for a level or a cost (SPEED_ONLY).
- Using the total change as the speed: $40^2 \times 4 = 6400$ instead of 400 in Example 1 (CHANGE_AS_SPEED).
- Integrating $\dot x$ instead of $\dot x^2$, which gives the change 40 for every path (FORGOT_SQUARE).
- Ignoring the running cost and drawing the straight line: $x(1) = 5$ instead of 3.24 in Example 2 (STRAIGHT_LINE).
- Keeping only $e^{kt}$ and fitting it to the end value: $10e^{-1} = 3.68$ in Example 2, a path that does not start at 0 (EXP_ONLY).
- Taking $b/a$ as the rate instead of $k = \sqrt{b/a}$; with $b/a = 4$ this uses $e^{4t}$ instead of $e^{2t}$ (K_SQUARED).
- Reporting the cost of the best path, 103.73, as the extra cost of the steady plan in Example 2 (OPTIMAL_NOT_SAVING).
- Reporting the cost of the steady plan, 116.67, without subtracting the least cost (LINE_COST_ONLY).
- Costing the running part of the steady plan as $b \cdot (\text{average level})^2 \cdot T$, which is 50 instead of 66.67 in Example 2 (SQUARED_AVERAGE).
- Writing the Euler–Lagrange equation as $F_x + \frac{d}{dt}F_{\dot x} = 0$, or as $F_{\dot x} = 0$ as if each moment were a separate one-variable problem: the term $\frac{d}{dt}F_{\dot x}$ is what links neighbouring moments.
- Applying a transversality condition such as $F_{\dot x} = 0$ at an end that is fixed: when $x(T)$ is given, that end condition replaces it.

## Practice
- `variations-straight-line-path` (difficulty 1): for $\min c\int_0^T \dot x^2\,dt$ with $x(0) = A$, $x(T) = B$, the level on the straight-line path after $t$ months, or the least cost $c(B - A)^2/T$; distractors MIDPOINT, FORGOT_START, SPEED_ONLY, CHANGE_AS_SPEED, FORGOT_SQUARE.
- `variations-adjustment-path-value` (difficulty 2): $x(t)$ on the cheapest path for $\int_0^T (a\dot x^2 + bx^2)\,dt$ with fixed ends, from $\ddot x = (b/a)x$, to 2 decimals; distractors STRAIGHT_LINE, EXP_ONLY, K_SQUARED.
- `variations-adjustment-saving` (difficulty 3): how much more the steady build-up $x = Bt/T$ costs than the Euler–Lagrange path for $\int_0^T (a\dot x^2 + bx^2)\,dt$ from 0 to $B$; distractors OPTIMAL_NOT_SAVING, LINE_COST_ONLY, SQUARED_AVERAGE.

## Real world
- Investment and hiring: models in which firms pay convex adjustment costs, often quadratic as here, explain why capital and employment respond gradually to news rather than jumping. This is the basis of the q theory of investment and of labour-demand models with hiring and firing costs.
- Saving: Frank Ramsey's 1928 paper on how much a nation should save was solved with the calculus of variations; its Euler equation, consumption growth equal to the interest rate minus impatience divided by the curvature of utility, is at the heart of modern macroeconomics (see DO04).
- Natural resources: Harold Hotelling's 1931 analysis of exhaustible resources such as oil used the same method and led to the Hotelling rule that the net price of a resource rises at the rate of interest (see DO02).
- History: the subject began with Johann Bernoulli's 1696 challenge to find the curve of fastest descent and was turned into a general method by Euler and Lagrange in the 1740s and 1750s. Physics uses it as the principle of least action; economics borrowed it to choose paths over time.

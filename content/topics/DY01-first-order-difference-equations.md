---
id: DY01
title: First-order difference equations
block: DY
coreYear: 3
prerequisites: [F08]
estMinutes: 45
status: draft
economicUses:
  - "Cobweb markets: why farm prices can swing up and down from one harvest to the next"
  - "Public debt dynamics: will the debt-to-GDP ratio settle or keep rising?"
  - How national income moves, quarter by quarter, towards its new equilibrium after a spending change
  - Stocks that are topped up and run down every period, such as capital, customers or a loan balance
searchTerms:
  - "Recurrence relation"
  - "Difference equation"
generators: [difference-equation-value-after-t, debt-ratio-steady-state, cobweb-price-after-periods]
widgets: [cobweb-diagram]
mistakeCodes:
  IGNORED_CONSTANT:
    label: Left out the constant b
    explanation: aᵗ·y₀ is the answer only when b = 0. With a constant added every period, the gap to the steady state shrinks by the factor a, so use yₜ = y* + (y₀ − y*)aᵗ with y* = b/(1 − a).
  STEADY_STATE_ONLY:
    label: Gave the long-run value instead of the value at time t
    explanation: The steady state y* is where the path is heading, not where it is after t periods. Add what is left of the starting gap, (y₀ − y*)aᵗ, to y*.
  ONE_PERIOD_SHORT:
    label: Stopped one period too early
    explanation: Period t comes after t applications of the rule, starting from y₀, so the power is aᵗ, not aᵗ⁻¹. Count the steps from y₀ to yₜ.
  DENOMINATOR_SIGN:
    label: Divided by 1 + a instead of 1 − a
    explanation: The steady state solves y = a·y + b. Moving a·y to the left gives y(1 − a) = b, so y* = b/(1 − a), not b/(1 + a).
  REARRANGE_SIGN:
    label: Got the sign of the steady state wrong
    explanation: From y = a·y + b, subtract a·y on both sides to get y − a·y = b, so y* = b/(1 − a). Writing (a − 1)y = b flips the sign of the answer; a positive deficit cannot lead to a negative debt ratio.
  APPROX_FACTOR:
    label: Replaced (1 + r)/(1 + g) by 1 + r − g
    explanation: The factor (1 + r)/(1 + g) is close to 1 + r − g, but 1 − a is a small number and the shortcut changes it noticeably. Use 1 − a = (g − r)/(1 + g) exactly, which gives d* = p(1 + g)/(g − r).
  SUPPLY_SIGN:
    label: Lost the minus sign in the cobweb equation
    explanation: Setting demand α − βPₜ equal to supply γ + δPₜ₋₁ gives Pₜ = (α − γ − δPₜ₋₁)/β. Last year's price enters with a minus sign, because a high price last year means a big harvest and a low price now.
resources:
  - { title: "Calculus Volume 2, 5.1 Sequences (OpenStax)", url: "https://openstax.org/books/calculus-volume-2/pages/5-1-sequences", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Principles of Economics 3e, 30.3 Federal Deficits and the National Debt (OpenStax)", url: "https://openstax.org/books/principles-economics-3e/pages/30-3-federal-deficits-and-the-national-debt", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
Many economic quantities are built from last period's value. This year's potato harvest depends on last year's price; next year's public debt is this year's debt plus interest plus any new deficit; this quarter's spending depends on last quarter's income. A rule that links each period to the one before is a **difference equation**. Solving it answers the questions that matter for policy: where is the economy heading, how fast does it get there, and does it get there at all, or do prices and debt swing further and further away?

## Intuition
Take the simplest rule: multiply last period's value by a number $a$, then add a constant $b$. Two forces act every period. Multiplying by $a$ shrinks (or stretches) what was there before; adding $b$ tops it up. Somewhere the two balance: a value that the rule turns into itself. That value is the **steady state** (also called the fixed point or stationary value).

What happens away from the steady state is surprisingly simple: the **gap** to the steady state is multiplied by $a$ every period, and nothing else. So everything depends on $a$:

- if $a$ is between 0 and 1, the gap shrinks steadily and the path glides towards the steady state from one side;
- if $a$ is between −1 and 0, the gap shrinks but flips sign every period, so the path jumps from above to below and back, closing in like a spiral;
- if $|a| > 1$, the gap grows every period and the path runs away, smoothly ($a > 1$) or in ever wider swings ($a < -1$).

A geometric sequence (F08) is hiding inside: the gaps $g_0, g_0a, g_0a^2, \dots$ form one.

## Definition and formulas
A **first-order linear difference equation** with constant coefficients is
$$y_{t+1} = a\,y_t + b, \qquad t = 0, 1, 2, \dots$$
"First order" means each value depends only on the one value just before it. Given the starting value $y_0$, the rule fixes the whole path.

**Iteration.** Applying the rule again and again gives
$$y_t = a^t y_0 + b\,(1 + a + a^2 + \dots + a^{t-1}) = a^t y_0 + b\,\frac{1 - a^t}{1 - a} \quad (a \ne 1),$$
where the bracket is the geometric sum from F08.

**Steady state.** If $a \ne 1$, the value that repeats itself solves $y^* = a\,y^* + b$:
$$y^* = \frac{b}{1 - a}$$

**General solution.** Rearranging the iterated formula,
$$y_t = y^* + (y_0 - y^*)\,a^t$$
The steady state plus the starting gap, multiplied by $a$ once per period.

**Stability.** The steady state is stable (every path converges to it) exactly when $|a| < 1$:

$$
\begin{array}{ll}
\text{Value of }a & \text{Path of }y_t \\ \hline
0 < a < 1 & \text{converges monotonically, from one side} \\
-1 < a < 0 & \text{converges with oscillation, overshooting every period} \\
a > 1 & \text{diverges monotonically, away from }y^* \\
a < -1 & \text{diverges with ever wider oscillations} \\
a = -1 & \text{jumps between }y_0\text{ and }b - y_0\text{ for ever (a two-period cycle)} \\
a = 1 & y_t = y_0 + bt\text{: no steady state unless }b = 0
\end{array}
$$

Only $a$ decides stability; $b$ and $y_0$ only decide where the steady state is and where the path starts. Because the gap after $t$ periods is $|y_0 - y^*|\,|a|^t$, the number of periods needed to shrink it to a fraction $q$ of its first size is the smallest whole $t$ with $t \ge \ln q / \ln |a|$.

**Phase diagram.** Plot $y_{t+1}$ against $y_t$: the rule is a straight line with slope $a$ and intercept $b$, and the 45° line marks the points where $y_{t+1} = y_t$. The two lines cross at the steady state. Starting from $y_0$, go up to the rule's line to read $y_1$, across to the 45° line to carry $y_1$ back to the horizontal axis, up to the rule's line again for $y_2$, and so on. The staircase (or spiral, when $a < 0$) moves in towards the crossing if the rule's line is flatter than 45°, that is if $|a| < 1$.

**Three economic models.**

- *Multiplier in time:* if spending this period depends on last period's income, $Y_t = c\,Y_{t-1} + A$, with $c$ the marginal propensity to consume and $A$ autonomous spending. Income converges to $Y^* = A/(1 - c)$, the equilibrium of F11, because $0 < c < 1$.
- *Cobweb model:* demand $Q_t = \alpha - \beta P_t$, supply planted on last year's price $Q_t = \gamma + \delta P_{t-1}$. Clearing the market every year gives
$$P_t = \frac{\alpha - \gamma}{\beta} - \frac{\delta}{\beta}\,P_{t-1}, \qquad P^* = \frac{\alpha - \gamma}{\beta + \delta}$$
so $a = -\delta/\beta$ is negative and prices always oscillate. They converge when $\delta < \beta$ (supply reacts less to price than demand does) and explode when $\delta > \beta$.
- *Debt dynamics:* with interest rate $r$ on the debt, nominal GDP growth $g$ and a primary deficit (spending minus taxes, before interest) of $p$ per cent of GDP, the debt ratio follows
$$d_{t+1} = \frac{1 + r}{1 + g}\,d_t + p, \qquad d^* = \frac{p}{1 - a} = \frac{p\,(1 + g)}{g - r}$$
The ratio settles when $g > r$ and keeps rising when $r > g$. A loan balance works the same way: $D_{t+1} = (1 + r)D_t - R$ with a fixed repayment $R$ has $a = 1 + r > 1$ and steady state $R/r$, the balance on which $R$ only pays the interest. Any loan smaller than $R/r$ moves away from it, downwards, and is repaid (FM04 and FM05 work out the repayments).

Equations with two lags, such as $y_{t+2} = a_1 y_{t+1} + a_2 y_t + b$, are second order and come in DY02.

## Interactive
::widget{id="cobweb-diagram"}

The top graph shows demand $Q = 100 - 2P$ (lilac) and supply $Q = 30 + \delta P_{t-1}$ (green) from Example 2; the gold cobweb starts at last year's price on the supply line, drops or rises to the demand line to give this year's price, moves across to the supply line for next year's harvest, and so on for 8 years. The bottom graph shows the same prices against time, with the steady state dashed. Drag the **supply response** $\delta$ and watch the read-outs: the steady-state price, the factor $a = -\delta/\beta$ and whether the path converges, cycles or explodes. Drag the **starting price** $P_0$ to see that it changes the size of the swings but never whether they die out. Check: at $\delta = 1.5$ and $P_0 = 28$ the panel shows $P^* = 20$ and $a = -0.75$, and the caption lists $P_1 = 14$, $P_2 = 24.5$, $P_3 = 16.63$. At $\delta = 2$ the price jumps between the same two values for ever; above 2 the cobweb spirals outwards.

## Worked examples

### Example 1 (easy): income adjusting after a rise in spending
Households spend 80 % of last quarter's income, so national income follows $Y_t = 0.8\,Y_{t-1} + A$. Autonomous spending has just risen from 160 to $A = 200$ (billions), and income starts at its old equilibrium $Y_0 = 800$. Find income in the next two quarters, the new steady state, and income after 5 quarters.

1. $Y_1 = 0.8 \cdot 800 + 200 = 840, \quad Y_2 = 0.8 \cdot 840 + 200 = 872$
   *Why:* apply the rule one quarter at a time; each quarter's spending is based on the income of the quarter before.
2. $Y^* = \dfrac{200}{1 - 0.8} = 1{,}000$
   *Why:* the steady state solves $Y = 0.8Y + 200$; it is the F11 equilibrium, autonomous spending times the multiplier $1/(1 - 0.8) = 5$.
3. $Y_t = 1{,}000 + (800 - 1{,}000) \cdot 0.8^t = 1{,}000 - 200 \cdot 0.8^t$
   *Why:* the general solution: the starting gap of −200 is multiplied by $a = 0.8$ every quarter.
4. $Y_5 = 1{,}000 - 200 \cdot 0.32768 = 1{,}000 - 65.54 = 934.46$
   *Why:* after 5 quarters about two thirds of the gap has closed; since $0 < a < 1$ income rises steadily towards 1000 without overshooting.
5. Check: $1{,}000 - 200 \cdot 0.8^2 = 1{,}000 - 128 = 872$, the same as $Y_2$ in step 1.
   *Why:* the formula and the step-by-step iteration must agree at every $t$.

```verify
c = 0.8; A = 200; Y0 = 800
Y1 = c*Y0 + A
Y2 = c*Y1 + A
Ystar = A/(1 - c)
assert abs(Y1 - 840) < 0.000001
assert abs(Y2 - 872) < 0.000001
assert abs(Ystar - 1000) < 0.000001
assert abs(160/(1 - c) - Y0) < 0.000001
assert abs(1/(1 - c) - 5) < 0.000001
assert abs(c^5 - 0.32768) < 0.000001
assert abs(200*c^5 - 65.54) < 0.005
Y5 = Ystar + (Y0 - Ystar)*c^5
assert abs(Y5 - 934.46) < 0.005
# iterate five quarters by hand
Y3 = c*Y2 + A
Y4 = c*Y3 + A
assert abs(c*Y4 + A - Y5) < 0.000001
assert abs(Ystar + (Y0 - Ystar)*c^2 - 872) < 0.000001
assert abs((Y5 - Y0)/(Ystar - Y0) - 2/3) < 0.02
```

### Example 2 (medium): a cobweb market for potatoes
Demand for potatoes is $Q = 100 - 2P_t$. Farmers plant according to last year's price, so supply is $Q = 30 + 1.5P_{t-1}$, and each year the price clears the market. After a bad harvest the price in year 0 was $P_0 = 28$. Find the prices in years 1 to 3, the steady state, and say whether the market settles.

1. $100 - 2P_t = 30 + 1.5P_{t-1} \;\Rightarrow\; P_t = 35 - 0.75\,P_{t-1}$
   *Why:* the harvest is fixed by last year's price, and this year's price must make buyers take exactly that harvest; so $a = -0.75$ and $b = 35$.
2. $P^* = \dfrac{35}{1 + 0.75} = 20$, where demand and supply are both $100 - 40 = 30 + 30 = 60$
   *Why:* at the steady state $P_t = P_{t-1}$, which is the ordinary market equilibrium.
3. $P_1 = 35 - 0.75 \cdot 28 = 14, \quad P_2 = 35 - 0.75 \cdot 14 = 24.5, \quad P_3 = 35 - 0.75 \cdot 24.5 = 16.63$
   *Why:* the high price of 28 brings a big harvest (72), which sells only at 14; the low price brings a small harvest, which sells at 24.5, and so on.
4. $P_t = 20 + 8\,(-0.75)^t$: the gaps are $8, -6, 4.5, -3.375$
   *Why:* the general solution; $a < 0$ makes the price alternate above and below 20, and $|a| = \delta/\beta = 0.75 < 1$ makes the swings shrink, so the market settles at 20.
5. If supply reacted with $\delta = 2.5$ instead, $a = -1.25$ and the swings would grow every year.
   *Why:* when supply reacts more strongly to price than demand ($\delta > \beta$), each mistake by farmers is bigger than the one before; the steady state $70/4.5 = 15.56$ still exists but the path moves away from it.

```verify
alpha = 100; beta = 2; gam = 30; dlt = 1.5; P0 = 28
b = (alpha - gam)/beta
m = dlt/beta
assert b == 35
assert m == 0.75
Pstar = (alpha - gam)/(beta + dlt)
assert Pstar == 20
assert abs(b/(1 + m) - Pstar) < 0.000001
assert alpha - beta*Pstar == 60
assert gam + dlt*Pstar == 60
P1 = b - m*P0
P2 = b - m*P1
P3 = b - m*P2
assert P1 == 14
assert gam + dlt*P0 == 72
assert alpha - beta*P1 == 72
assert P2 == 24.5
assert P3 == 16.625
assert round(P3*100)/100 == 16.63
assert abs(Pstar + 8*(-m)^3 - P3) < 0.000001
assert (P1 - Pstar) == -6
assert (P2 - Pstar) == 4.5
assert (P3 - Pstar) == -3.375
assert -2.5/beta == -1.25
assert abs((alpha - gam)/(beta + 2.5) - 15.56) < 0.005
```

### Example 3 (hard): will the debt ratio settle?
A government runs a primary deficit of 2 % of GDP every year. It pays 3 % interest on its debt, nominal GDP grows by 5 % a year, and debt is now 60 % of GDP, so $d_{t+1} = \dfrac{1.03}{1.05}\,d_t + 2$ with $d_0 = 60$. Find the long-run debt ratio, the ratio after 10 years, how long it takes to close half the gap, and what changes if the interest rate rises to 6 %.

1. $a = \dfrac{1.03}{1.05} = 0.980952 < 1$
   *Why:* GDP grows faster than the debt earns interest ($g > r$), so the factor is below 1 and the ratio converges, without oscillating because $a > 0$.
2. $1 - a = \dfrac{0.02}{1.05} = 0.019048, \quad d^* = \dfrac{2}{1 - a} = \dfrac{2 \cdot 1.05}{0.02} = 105$
   *Why:* the steady state solves $d = a\,d + 2$; writing $1 - a$ as $(g - r)/(1 + g)$ keeps it exact, while the shortcut $1 + r - g = 0.98$ would give 100.
3. $d_{10} = 105 + (60 - 105) \cdot 0.980952^{10} = 105 - 45 \cdot 0.825048 = 105 - 37.13 = 67.87$
   *Why:* the general solution; the gap of −45 shrinks by only about 2 % a year, so after a decade debt has risen from 60 % to about 68 % of GDP.
4. $0.980952^t \le 0.5 \;\Rightarrow\; t \ge \dfrac{\ln 0.5}{\ln 0.980952} = 36.04$, so 37 years
   *Why:* half the gap is closed when $a^t$ has fallen to 0.5; take logarithms and round up to a whole year. With $a$ this close to 1 convergence is very slow.
5. With $r = 6\%$: $a = \dfrac{1.06}{1.05} = 1.009524 > 1$; iterating from 60 gives $d_{10} = 86.84$, and the ratio keeps rising faster and faster.
   *Why:* when interest exceeds growth ($r > g$), $|a| > 1$ and there is no level at which the ratio settles; the government must run a primary surplus to stop the debt ratio from growing without limit.

```verify
r = 0.03; g = 0.05; p = 2; d0 = 60
a = (1 + r)/(1 + g)
assert abs(a - 0.980952) < 0.0000005
assert abs((1 - a) - 0.019048) < 0.0000005
assert abs((1 - a) - (g - r)/(1 + g)) < 0.000000001
dstar = p/(1 - a)
assert abs(dstar - 105) < 0.000001
assert abs(p*(1 + g)/(g - r) - 105) < 0.000001
assert abs(p/(1 - (1 + r - g)) - 100) < 0.000001
assert abs(a^10 - 0.825048) < 0.0000005
assert abs(45*a^10 - 37.13) < 0.005
d10 = dstar + (d0 - dstar)*a^10
assert abs(d10 - 67.87) < 0.005
# iterate ten years one at a time
x = d0
x = a*x + p; x = a*x + p; x = a*x + p; x = a*x + p; x = a*x + p
x = a*x + p; x = a*x + p; x = a*x + p; x = a*x + p; x = a*x + p
assert abs(x - d10) < 0.000001
th = log(0.5)/log(a)
assert abs(th - 36.04) < 0.005
assert ceil(th) == 37
assert a^36 > 0.5
assert a^37 <= 0.5
a2 = 1.06/1.05
assert abs(a2 - 1.009524) < 0.0000005
y = d0
y = a2*y + p; y = a2*y + p; y = a2*y + p; y = a2*y + p; y = a2*y + p
y = a2*y + p; y = a2*y + p; y = a2*y + p; y = a2*y + p; y = a2*y + p
assert abs(y - 86.84) < 0.005
```

## Common mistakes
- Computing $a^t y_0$ and forgetting the constant that is added every period (IGNORED_CONSTANT).
- Giving the steady state $y^*$ when the question asks for the value after $t$ periods (STEADY_STATE_ONLY).
- Using $a^{t-1}$ instead of $a^t$: after $t$ periods the rule has been applied $t$ times (ONE_PERIOD_SHORT).
- Writing the steady state as $b/(1 + a)$ instead of $b/(1 - a)$ (DENOMINATOR_SIGN).
- Rearranging $y = ay + b$ as $(a - 1)y = b$, which flips the sign of $y^*$ (REARRANGE_SIGN).
- Replacing $(1 + r)/(1 + g)$ by $1 + r - g$ in a debt equation; $1 - a$ is small, so the shortcut moves the steady state a lot (APPROX_FACTOR).
- Keeping a plus sign in front of $\delta P_{t-1}$ when solving the cobweb model for $P_t$ (SUPPLY_SIGN).
- Thinking a negative $a$ means the path explodes: the sign only decides whether the path oscillates; $|a|$ decides whether it converges.
- Using $b/(1 - a)$ when $|a| > 1$ and calling it the long-run value: the steady state exists, but the path moves away from it.
- Expecting the starting value or the constant $b$ to decide stability: only $a$ does.

## Practice
- `difference-equation-value-after-t` (difficulty 1): the value of $y_{t+1} = a\,y_t + b$ after $t$ periods for income, gym members or capital, using $y_t = y^* + (y_0 - y^*)a^t$; distractors IGNORED_CONSTANT, STEADY_STATE_ONLY, ONE_PERIOD_SHORT.
- `debt-ratio-steady-state` (difficulty 2): the long-run debt-to-GDP ratio $d^* = p/(1 - a)$ with $a = (1 + r)/(1 + g)$; distractors DENOMINATOR_SIGN, APPROX_FACTOR, REARRANGE_SIGN.
- `cobweb-price-after-periods` (difficulty 3): the price after 2 or 3 years in a cobweb market, from demand, lagged supply and the starting price; distractors STEADY_STATE_ONLY, ONE_PERIOD_SHORT, SUPPLY_SIGN.

## Real world
- Farm prices: crops and livestock take a season or more to produce, so supply is planned on old prices. Cycles of high and low prices in such markets are the classic application of the cobweb model, and futures markets and better price forecasts are one way to damp them.
- Debt sustainability: finance ministries, the IMF and the European Commission project public debt ratios with this kind of equation; the gap between the interest rate and growth ($r - g$) and the primary balance decide whether a ratio stabilises.
- Macroeconomic adjustment: forecasters model income, prices or unemployment as moving part of the way towards a new equilibrium each quarter; the factor $a$ measures how slowly the economy adjusts. Two-state Markov chains (SP01) and time-series AR(1) models (EM06) lead to the same kind of equation.
- Stocks and flows: capital with depreciation and investment, a customer base with churn and sign-ups, or a loan with interest and repayments all follow $y_{t+1} = a\,y_t + b$, so their long-run level and speed of adjustment come from the same two formulas.

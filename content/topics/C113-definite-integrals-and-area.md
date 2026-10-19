---
id: C113
title: Definite integrals and area
block: C1
coreYear: 1
prerequisites: [C112]
estMinutes: 45
status: draft
economicUses:
  - Extra cost of raising output, from the marginal cost curve
  - Total revenue received over a period from a revenue flow
  - Capital accumulation from a flow of net investment
  - Average price or average output over a year
generators: [cost-increase-from-marginal-cost, accumulated-exponential-flow, average-price-over-period]
widgets: [riemann-sum-marginal-cost]
mistakeCodes:
  ONLY_UPPER_LIMIT:
    label: Used F(b) alone
    explanation: The definite integral is F(b) − F(a). Leaving out F(a) counts everything from 0 up to b instead of only the part between a and b. Even when a = 0, F(0) need not be 0, since for e^(kt) it is 1/k.
  MC_DIFFERENCE:
    label: Subtracted marginal costs
    explanation: MC(b) − MC(a) is how much marginal cost itself changed. The extra total cost adds up marginal cost over every unit from a to b, which is the integral of MC, the area under the MC curve.
  NO_DIVIDE_POWER:
    label: Forgot to divide by the new power
    explanation: An antiderivative of qⁿ is qⁿ⁺¹/(n + 1). Raising the power without dividing by the new power gives a function whose derivative is not the integrand.
  EXP_NO_DIVIDE_K:
    label: Forgot to divide by k
    explanation: An antiderivative of e^(kt) is e^(kt)/k, because differentiating e^(kt) brings down a factor k. Without dividing by k the total is k times too small (or too large when k is negative).
  CONSTANT_FLOW:
    label: Treated the flow as constant
    explanation: Multiplying the starting flow by the length of the period assumes the flow never changes. When the flow grows or shrinks, add it up with the integral.
  TOTAL_NOT_AVERAGE:
    label: Gave the total, not the average
    explanation: The integral is the total accumulated over the interval. The average value divides that total by the length of the interval, b − a.
  ENDPOINT_AVERAGE:
    label: Averaged the two end values
    explanation: (f(a) + f(b))/2 is the average only for a straight line. When the function curves, the average value is (1/(b − a)) times the integral of f from a to b.
  WRONG_LENGTH:
    label: Divided by the wrong length
    explanation: The average over the interval from a to b divides by its length, b − a, not by b. Dividing by b treats the interval as if it started at 0.
  NET_NOT_AREA:
    label: Gave the net integral as the area
    explanation: Where the curve is below the axis the integral counts negative, so positive and negative parts cancel. For the total shaded area, split at the crossing points and add the sizes of the pieces.
  REVERSED_LIMITS:
    label: Subtracted in the wrong order
    explanation: The integral from a to b is F(b) − F(a), upper limit minus lower limit. F(a) − F(b) is the integral from b to a, which has the opposite sign.
resources:
  - { title: "Calculus Volume 1, 5.2 The Definite Integral (OpenStax)", url: "https://openstax.org/books/calculus-volume-1/pages/5-2-the-definite-integral", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Calculus Volume 1, 5.3 The Fundamental Theorem of Calculus (OpenStax)", url: "https://openstax.org/books/calculus-volume-1/pages/5-3-the-fundamental-theorem-of-calculus", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Calculus Volume 1, 6.1 Areas between Curves (OpenStax)", url: "https://openstax.org/books/calculus-volume-1/pages/6-1-areas-between-curves", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
A factory makes 10 machines a week and is asked to make 20. Its accountant knows the marginal cost of each machine but not the total cost function. How much more will the week cost? The answer is the area under the marginal cost curve between 10 and 20, and the definite integral computes it. The same tool turns any *flow* into a *total*: revenue arriving at so much per month into revenue over a quarter, net investment per year into the growth of the capital stock over a decade, a price that changes through the year into the average price paid.

## Intuition
If marginal cost were constant at 15, ten more machines would cost $10 \times 15 = 150$: a rectangle of height 15 and width 10. When marginal cost changes from unit to unit, cut the range into thin strips, treat marginal cost as constant on each strip, and add up the little rectangles. Thinner strips fit the curve better, and in the limit the sum becomes the exact area under the curve. That limit is the definite integral.

Computing a limit of sums every time would be slow. The Fundamental Theorem of Calculus gives a shortcut: the area is the change in any antiderivative between the two ends. This is natural in economics. Total cost is an antiderivative of marginal cost (C112), so adding up marginal cost from $q = a$ to $q = b$ must give the change in total cost, $C(b) - C(a)$.

## Definition and formulas
**Riemann sums.** Split $[a, b]$ into $n$ strips of width $\Delta x = \dfrac{b - a}{n}$ and pick a point $x_i$ in each strip, for example its left end. The Riemann sum
$$S_n = \sum_{i=1}^{n} f(x_i)\,\Delta x$$
adds the areas of $n$ rectangles. The **definite integral** is the limit of these sums as the strips get thinner:
$$\int_a^b f(x)\,dx = \lim_{n \to \infty} \sum_{i=1}^{n} f(x_i)\,\Delta x.$$
The numbers $a$ and $b$ are the lower and upper **limits of integration**. The result is a number, not a function.

**Fundamental Theorem of Calculus.** If $F'(x) = f(x)$, then
$$\int_a^b f(x)\,dx = \Big[F(x)\Big]_a^b = F(b) - F(a).$$
Any antiderivative works: a constant of integration $K$ appears in both $F(b)$ and $F(a)$ and cancels. The antiderivatives from C112 are the ones used most: $\int x^n\,dx = \dfrac{x^{n+1}}{n + 1}$ for $n \neq -1$, $\int \dfrac{1}{x}\,dx = \ln|x|$ and $\int e^{kx}\,dx = \dfrac{e^{kx}}{k}$.

The theorem also works the other way: the running total $A(x) = \int_a^x f(t)\,dt$ has $A'(x) = f(x)$. A stock grows at the rate of the flow that feeds it.

**Properties.**
- Linearity: $\int_a^b \big(\alpha f(x) + \beta g(x)\big)\,dx = \alpha\int_a^b f(x)\,dx + \beta\int_a^b g(x)\,dx$.
- Additivity over intervals: $\int_a^c f(x)\,dx = \int_a^b f(x)\,dx + \int_b^c f(x)\,dx$.
- Reversing the limits flips the sign: $\int_b^a f(x)\,dx = -\int_a^b f(x)\,dx$, and $\int_a^a f(x)\,dx = 0$.

**Signed area.** Where $f(x) < 0$ the rectangles have negative height, so area below the axis counts as negative. The integral is the *net* area: area above the axis minus area below it. For the total shaded area, split the interval where $f$ changes sign and add the sizes of the pieces.

**Area between two curves.** If $f(x) \ge g(x)$ on $[a, b]$, the area between them is
$$\int_a^b \big(f(x) - g(x)\big)\,dx.$$
If the curves cross, split at the crossing points, as for signed area.

**Average value.** The average value of $f$ on $[a, b]$ is
$$\bar f = \frac{1}{b - a}\int_a^b f(x)\,dx.$$
A rectangle of height $\bar f$ on $[a, b]$ has the same area as the region under the curve.

**Flows and totals in economics.**
- Extra cost of raising output from $a$ to $b$: $C(b) - C(a) = \int_a^b MC(q)\,dq$. Fixed cost cancels.
- Total revenue received between times $t_1$ and $t_2$ from a revenue flow $R(t)$ per year: $\int_{t_1}^{t_2} R(t)\,dt$.
- Capital accumulation: with net investment flow $I(t)$ per year, $K(t_2) - K(t_1) = \int_{t_1}^{t_2} I(t)\,dt$.

## Interactive
::widget{id="riemann-sum-marginal-cost"}

The lilac curve is the marginal cost $MC(q) = 10 + 0.4q + 0.03q^2$ from Example 1, and the shaded region under it between $a$ and $b$ is the exact extra cost. The gold rectangles are a Riemann sum: each one has the marginal cost at the left end of its strip as its height. Move the **Rectangles n** slider and watch the staircase hug the curve; the panel shows the Riemann sum, the exact integral and the error between them. Check: the widget starts at $a = 10$, $b = 20$ and $n = 5$, where the panel shows a Riemann sum of 217.2, an exact integral of 230 and an error of 12.8, as in Example 1. At $n = 10$ it shows 223.55 and an error of 6.45; at $n = 40$ the error is down to about 1.62. Then move the **From q = a** and **To q = b** sliders to see the area for other output ranges. Set $a$ above $b$ and the Riemann sum and the integral both turn negative: reversing the limits flips the sign.

## Worked examples

### Example 1 (easy): the extra cost of doubling output
A factory's marginal cost is $MC(q) = 10 + 0.4q + 0.03q^2$ (thousand per machine), where $q$ is machines per week. It makes 10 machines a week. Estimate the extra cost of raising output to 20 with a Riemann sum, then find it exactly.

1. $\Delta q = \dfrac{20 - 10}{5} = 2$, $S_5 = 2\big(MC(10) + MC(12) + MC(14) + MC(16) + MC(18)\big) = 217.2$
   *Why:* five strips of width 2, each treated as if marginal cost stayed at its value on the left end. Marginal cost rises, so the rectangles sit below the curve and the sum is too low.
2. With ten strips of width 1, $S_{10} = 223.55$
   *Why:* thinner strips leave smaller gaps under the curve, so the estimate moves up towards the exact area.
3. $\displaystyle\int_{10}^{20} MC(q)\,dq = \Big[10q + 0.2q^2 + 0.01q^3\Big]_{10}^{20}$
   *Why:* raise each power by one and divide by the new power (C112). No constant is needed: it would cancel.
4. $= (200 + 80 + 80) - (100 + 20 + 10) = 360 - 130 = 230$
   *Why:* upper limit minus lower limit. The extra 10 machines add 230 thousand to weekly cost; whatever the fixed cost is, it cancels.

```verify
MC(q) = 10 + 0.4*q + 0.03*q.^2
F(q) = 10*q + 0.2*q^2 + 0.01*q^3
S5 = 2*(MC(10) + MC(12) + MC(14) + MC(16) + MC(18))
assert abs(S5 - 217.2) < 0.000001
S10 = 1*sum(MC(10:19))
assert abs(S10 - 223.55) < 0.000001
assert abs(F(20) - 360) < 0.000001
assert abs(F(10) - 130) < 0.000001
assert abs(F(20) - F(10) - 230) < 0.000001
# Independent check: a Riemann sum with 100000 midpoint strips.
h = 10/100000
mid = 10 + h/2 : h : 20
assert abs(h*sum(MC(mid)) - 230) < 0.0001
# Fixed cost cancels: C(q) = 500 + F(q).
assert abs((500 + F(20)) - (500 + F(10)) - 230) < 0.000001
# MC(20) - MC(10) is a different, wrong quantity.
assert abs(MC(20) - MC(10) - 13) < 0.000001
```

### Example 2 (medium): capital accumulation and the average investment flow
A country's net investment is $I(t) = 60e^{0.05t}$ billion per year, $t$ years from now. By how much does its capital stock rise over the next 10 years, and what is the average yearly flow of investment over that decade?

1. $K(10) - K(0) = \displaystyle\int_0^{10} 60e^{0.05t}\,dt$
   *Why:* net investment is the rate at which the capital stock grows, so the change in the stock is the integral of the flow.
2. $= \Big[\dfrac{60}{0.05}e^{0.05t}\Big]_0^{10} = 1{,}200\big(e^{0.5} - e^{0}\big)$
   *Why:* an antiderivative of $e^{kt}$ is $e^{kt}/k$. At the lower limit $e^0 = 1$, so the lower term is 1,200, not 0.
3. $= 1{,}200 \times 0.648721 = 778.47$ billion
   *Why:* $e^{0.5} = 1.648721$. A flow held at its starting level of 60 would add only 600; the growing flow adds about 178 more.
4. $\bar I = \dfrac{778.47}{10 - 0} = 77.85$ billion per year
   *Why:* the average value divides the total by the length of the period. It lies between the starting flow 60 and the final flow $60e^{0.5} = 98.92$.

```verify
A = 60; k = 0.05; T = 10
total = (A/k)*(exp(k*T) - exp(0))
assert abs(exp(0.5) - 1.648721) < 0.000001
assert abs(total - 778.47) < 0.005
avg = total/T
assert abs(avg - 77.85) < 0.005
assert abs(A*exp(k*T) - 98.92) < 0.005
assert avg > A and avg < A*exp(k*T)
# Independent check: midpoint Riemann sum with 100000 strips.
h = T/100000
mid = h/2 : h : T
assert abs(h*sum(A*map(k*mid, exp)) - total) < 0.0001
assert abs(total - A*T - 178.47) < 0.005
```

### Example 3 (hard): start-up losses, net profit and the area between two flows
A firm launches a new product. Over the first 10 months its revenue flow is $R(t) = 36t$ and its cost flow is $C(t) = 60 + 3t^2$, both in thousands per month. Find when the product starts to make a profit, the loss before that, the net profit over the 10 months, and the total area between the two curves.

1. $\pi(t) = R(t) - C(t) = -3t^2 + 36t - 60 = -3(t - 2)(t - 10)$
   *Why:* the profit flow is revenue flow minus cost flow. It is zero at $t = 2$ and $t = 10$ and negative before month 2, while costs are above revenue.
2. $\displaystyle\int_0^2 \pi(t)\,dt = \Big[-t^3 + 18t^2 - 60t\Big]_0^2 = -8 + 72 - 120 = -56$
   *Why:* the profit flow is below the axis on $[0, 2]$, so the integral is negative: a start-up loss of 56 thousand.
3. $\displaystyle\int_2^{10} \pi(t)\,dt = (-1{,}000 + 1{,}800 - 600) - (-56) = 200 + 56 = 256$
   *Why:* from month 2 to month 10 revenue is above cost, so this is the profit earned after breaking even.
4. $\displaystyle\int_0^{10} \pi(t)\,dt = -56 + 256 = 200$
   *Why:* additivity over intervals. The net profit over the 10 months is 200 thousand, an average of $200/10 = 20$ thousand per month.
5. Area between the curves $= 56 + 256 = 312$
   *Why:* as a geometric area every piece counts as positive, so the loss is added, not subtracted. The net figure 200 and the area 312 answer different questions.

```verify
p(t) = 36*t - (60 + 3*t^2)
P(t) = -t^3 + 18*t^2 - 60*t
assert p(2) == 0
assert p(10) == 0
assert p(1) < 0
assert p(5) > 0
loss = P(2) - P(0)
assert loss == -56
gain = P(10) - P(2)
assert gain == 256
net = P(10) - P(0)
assert net == 200
assert net == loss + gain
assert net/10 == 20
assert abs(loss) + gain == 312
# Independent check: midpoint Riemann sums.
h = 2/100000
m1 = h/2 : h : 2
assert abs(h*sum(36*m1 - 60 - 3*m1.^2) + 56) < 0.0001
h2 = 8/100000
m2 = 2 + h2/2 : h2 : 10
assert abs(h2*sum(36*m2 - 60 - 3*m2.^2) - 256) < 0.0001
```

## Common mistakes
- Working out only $F(b)$ and forgetting to subtract $F(a)$, or assuming $F(0) = 0$ when it is not, as for $e^{kt}/k$ (ONLY_UPPER_LIMIT).
- Answering "how much does cost rise from $a$ to $b$?" with $MC(b) - MC(a)$: in Example 1 that gives 13 instead of 230 (MC_DIFFERENCE).
- Raising the power without dividing by the new power, for example writing $0.03q^3$ as the antiderivative of $0.03q^2$ (NO_DIVIDE_POWER).
- Forgetting to divide by $k$ when integrating $e^{kt}$ (EXP_NO_DIVIDE_K).
- Multiplying the starting flow by the length of the period when the flow is growing or shrinking (CONSTANT_FLOW).
- Giving the integral when the question asks for an average value (TOTAL_NOT_AVERAGE).
- Averaging the two end values $f(a)$ and $f(b)$; that works only for straight lines (ENDPOINT_AVERAGE).
- Dividing by $b$ instead of by the length $b - a$ when the interval does not start at 0 (WRONG_LENGTH).
- Reporting the net integral when the question asks for the total area, so a part below the axis cancels part of the area above (NET_NOT_AREA).
- Computing $F(a) - F(b)$ instead of $F(b) - F(a)$ and getting the sign wrong (REVERSED_LIMITS).
- Adding a constant of integration to a definite integral: the answer is a number, and any constant cancels.

## Practice
- `cost-increase-from-marginal-cost` (difficulty 1): the extra cost $\int_a^b MC(q)\,dq$ of raising output from $a$ to $b$ when $MC = c + dq + eq^2$; distractors ONLY_UPPER_LIMIT, MC_DIFFERENCE, NO_DIVIDE_POWER.
- `accumulated-exponential-flow` (difficulty 2): the total of a growing or shrinking flow $Ae^{kt}$ (net investment or sales revenue) between two dates; distractors EXP_NO_DIVIDE_K, ONLY_UPPER_LIMIT, CONSTANT_FLOW.
- `average-price-over-period` (difficulty 3): the average value of a quadratic price path between two months, $\frac{1}{t_2 - t_1}\int_{t_1}^{t_2} p(t)\,dt$; distractors TOTAL_NOT_AVERAGE, ENDPOINT_AVERAGE, WRONG_LENGTH.

## Real world
- Cost planning: firms that estimate marginal cost from production data integrate it to price large orders, since the extra cost of a batch is the area under the marginal cost curve over that batch.
- National accounts: the capital stock of a country is built up by adding net investment year after year (the perpetual inventory method), a sum that the integral of the investment flow models in continuous time.
- Energy and resources: the total output of an oil field or a mine over its life is the integral of a production rate that usually declines over time, and planners compare it with the cost of developing the site.
- Index numbers: the average price of electricity, fuel or a commodity over a year is the average value of a changing price, which is why annual averages can differ noticeably from the average of the January and December prices.

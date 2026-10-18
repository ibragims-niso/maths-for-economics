---
id: C112
title: Indefinite integrals
block: C1
coreYear: 1
prerequisites: [C103]
estMinutes: 40
status: draft
economicUses:
  - Total cost from marginal cost and the fixed cost
  - Total revenue and the demand curve from marginal revenue
  - A consumption function from the marginal propensity to consume
  - The capital stock from net investment over time
generators: [total-cost-from-marginal-cost, price-from-marginal-revenue, capital-stock-from-investment]
widgets: [cost-antiderivative-family]
mistakeCodes:
  FORGOT_CONSTANT:
    label: Left out the starting value
    explanation: An antiderivative is only fixed up to a constant. Total cost includes the fixed cost and the capital stock includes the capital you start with, so find the constant from the starting value and keep it in the answer.
  NO_DIVIDE_POWER:
    label: Did not divide by the new power
    explanation: When the power of q goes up by 1 you must also divide by the new power, so ∫q² dq = q³/3. Skipping the division gives the same number as MC(q₀) × q₀, which wrongly charges every unit the marginal cost of the last one.
  DIFFERENTIATED:
    label: Differentiated instead of integrating
    explanation: "Going from a marginal function back to the total undoes a derivative, so powers go up, not down. Check any answer by differentiating it: you must get the marginal function back."
  MR_AS_PRICE:
    label: Used marginal revenue as the price
    explanation: Integrate MR to get revenue R(Q), then the price is R(Q)/Q. MR is below the price because selling more means cutting the price on every unit; forgetting to halve the Q-term when integrating gives the same wrong number.
  GAVE_REVENUE:
    label: Gave total revenue, not the price
    explanation: Revenue is price times quantity. After finding R(Q₀), divide by Q₀ to get the price of one unit.
  WRONG_CONSTANT:
    label: Set the constant equal to the starting value
    explanation: The constant equals the starting value only when every other term is zero at t = 0. The term (A/k)·e^(kt) equals A/k at t = 0, so the constant is K(0) − A/k.
  EXP_NO_DIVIDE_K:
    label: Forgot to divide by k
    explanation: "The antiderivative of e^(kt) is e^(kt)/k. Check by differentiating: the chain rule brings out a factor k, which the 1/k cancels."
resources:
  - { title: "Calculus Volume 1, 4.10 Antiderivatives (OpenStax)", url: "https://openstax.org/books/calculus-volume-1/pages/4-10-antiderivatives", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Principles of Economics 3e, 7.3 Costs in the Short Run (OpenStax)", url: "https://openstax.org/books/principles-economics-3e/pages/7-3-costs-in-the-short-run", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
A factory's engineers can tell the manager what one more unit costs at each output level: that is marginal cost. The finance team needs the *total* cost of a production plan. Going from the marginal figure back to the total is integration. Statisticians face the same task with the economy: they observe net investment, the yearly addition to machines and buildings, and want the capital stock it builds up. In both cases the rate is known and the total is wanted, and one extra fact, the fixed cost or the capital stock at the start, is needed to finish the job.

## Intuition
Differentiation turns a total into its rate of change. Integration runs the film backwards: given the rate, find a total that has that rate. If you know how fast cost rises at every output, you know the *shape* of the cost curve, but not its height. Adding the same number to every point of the curve does not change any of its slopes, so a whole family of curves, each a vertical shift of the others, all have the same marginal cost.

To pick the right curve you need one point on it. For cost, that point is $C(0)$: producing nothing still costs the fixed cost. For revenue it is $R(0) = 0$: selling nothing earns nothing. For the capital stock it is the stock today. This is why every indefinite integral carries a "$+\,C$": it is the information the rate alone cannot give.

## Definition and formulas
A function $F$ is an **antiderivative** of $f$ if $F'(x) = f(x)$. The **indefinite integral** collects all of them:
$$\int f(x)\,dx = F(x) + C,$$
where $C$ is the **constant of integration**. Any two antiderivatives of the same function on an interval differ by a constant: their difference has derivative 0, so it cannot change. (When $C$ already stands for cost or consumption, we write the constant as $c_0$.)

**Basic rules** (each one is a derivative rule from C103 read backwards):

- Constant: $\displaystyle\int k\,dx = kx + C$
- Power rule, for $n \neq -1$: $\displaystyle\int x^{n}\,dx = \frac{x^{n+1}}{n+1} + C$. Raise the power by 1, then divide by the new power.
- The missing case $n = -1$: $\displaystyle\int \frac{1}{x}\,dx = \ln|x| + C$. For $x > 0$ this is just $\ln x$; the absolute value makes the rule work for negative $x$ too.
- Exponentials, for $k \neq 0$: $\displaystyle\int e^{kx}\,dx = \frac{e^{kx}}{k} + C$ (the derivative of $e^{kx}$ is $k e^{kx}$, see C105).
- Linearity: $\displaystyle\int \big(a f(x) + b g(x)\big)\,dx = a\int f(x)\,dx + b\int g(x)\,dx$. Integrate a sum term by term and keep the numbers in front.

For example, $\int (6x^2 - 4x + 5)\,dx = 2x^3 - 2x^2 + 5x + C$.

**Always check by differentiating.** The derivative of $2x^3 - 2x^2 + 5x + C$ is $6x^2 - 4x + 5$, so the integral is right. This check takes seconds and catches almost every slip.

**Fixing the constant with an initial condition.** One known value of the total pins down $C$:

- **Total cost** from marginal cost: $C(q) = \int MC(q)\,dq$ with $C(0) = F$, the fixed cost.
- **Total revenue** from marginal revenue: $R(Q) = \int MR(Q)\,dQ$ with $R(0) = 0$. The price is then $P = R(Q)/Q$, which gives the demand curve.
- **Consumption** from the marginal propensity to consume: if $MPC = 2/\sqrt{Y} = 2Y^{-1/2}$ and consumption at zero income is 10, then $C(Y) = 4\sqrt{Y} + 10$ (the curved consumption function of C106).
- **Capital stock** from net investment: net investment is the rate at which capital grows, $K'(t) = I(t)$, so $K(t) = \int I(t)\,dt$ with $K(0)$ the stock today.
- **Utility** from marginal utility: if $u'(x) = 1/x$ for $x > 0$, then $u(x) = \ln x + C$. The constant does not matter here, because only comparisons of utility levels matter.

## Interactive
::widget{id="cost-antiderivative-family"}

The graph shows total cost curves $C(q) = 20q + 2q^2 + 0.1q^3 + F$ for the marginal cost $MC(q) = 20 + 4q + 0.3q^2$ of Example 1. Move the **Fixed cost F = C(0)** slider: the solid curve slides up and down among the dashed ones, but its shape never changes. Move the **Output q** slider: the short gold tangents on all the curves stay parallel, and the panel's **Slope of C at q**, measured from the curve itself, always equals **Marginal cost MC(q)**, whatever F is. Check: with $F = 500$ and $q = 10$ the panel shows marginal cost 90, total cost 1,000 and slope 90. Now set $F = 1{,}000$: total cost becomes 1,500 while marginal cost and the slope stay 90.

## Worked examples

### Example 1 (easy): total cost from marginal cost
A workshop's marginal cost is $MC(q) = 20 + 4q + 0.3q^2$ and its fixed cost is 500. Find its total cost function and the cost of producing 10 units.

1. $C(q) = \displaystyle\int (20 + 4q + 0.3q^2)\,dq = 20q + 2q^2 + 0.1q^3 + c_0$
   *Why:* total cost is the antiderivative of marginal cost; each power of $q$ goes up by 1 and is divided by the new power ($4q \to 2q^2$, $0.3q^2 \to 0.1q^3$).
2. $C'(q) = 20 + 4q + 0.3q^2$
   *Why:* differentiating the answer must give back marginal cost, and it does.
3. $C(0) = c_0 = 500$, so $C(q) = 500 + 20q + 2q^2 + 0.1q^3$
   *Why:* at zero output every $q$-term vanishes and only the fixed cost is left.
4. $C(10) = 500 + 200 + 200 + 100 = 1{,}000$
   *Why:* the variable cost of 10 units is 500 and the fixed cost adds another 500. Leaving out the fixed cost would give 500; forgetting to divide by the new powers would give $500 + 20 \cdot 10 + 4 \cdot 100 + 0.3 \cdot 1{,}000 = 1{,}400$.

```verify
MC(q) = 20 + 4*q + 0.3*q^2
C(q) = 500 + 20*q + 2*q^2 + 0.1*q^3
# The derivative of C, checked numerically, is MC.
assert abs((C(10.000001) - C(9.999999))/0.000002 - MC(10)) < 0.0001
assert abs((C(3.000001) - C(2.999999))/0.000002 - MC(3)) < 0.0001
assert C(0) == 500
assert abs(C(10) - 1000) < 0.000001
assert abs((C(10) - 500) - 500) < 0.000001
assert abs(500 + 20*10 + 4*100 + 0.3*1000 - 1400) < 0.000001
```

### Example 2 (medium): from marginal revenue to the demand curve
A firm selling phone cases has marginal revenue $MR(Q) = 120 - 4Q$, where $Q$ is cases per week. Find its revenue function, the price at which it can sell 20 cases, and its demand curve.

1. $R(Q) = \displaystyle\int (120 - 4Q)\,dQ = 120Q - 2Q^2 + c_0$
   *Why:* revenue is the antiderivative of marginal revenue; $-4Q$ becomes $-4Q^2/2 = -2Q^2$.
2. $R(0) = c_0 = 0$, so $R(Q) = 120Q - 2Q^2$
   *Why:* selling nothing earns nothing.
3. $R(20) = 2{,}400 - 800 = 1{,}600$
   *Why:* put $Q = 20$ into the revenue function.
4. $P = \dfrac{R(Q)}{Q} = 120 - 2Q$, so $P(20) = 1{,}600/20 = 80$
   *Why:* revenue is price times quantity, so dividing by $Q$ gives the demand curve. This is the demand line of C106, Example 2, recovered from its MR.
5. $MR(20) = 40$ is not the price, and $40 \times 20 = 800$ is not the revenue.
   *Why:* MR is the revenue from the *last* case after the price cut on all earlier ones; earlier cases sold at higher marginal revenue, so multiplying the last MR by $Q$ undercounts.

```verify
MR(Q) = 120 - 4*Q
R(Q) = 120*Q - 2*Q^2
assert abs((R(20.000001) - R(19.999999))/0.000002 - MR(20)) < 0.0001
assert R(0) == 0
assert R(20) == 1600
P = R(20)/20
assert P == 80
assert 120 - 2*20 == P
assert MR(20) == 40
assert MR(20)*20 == 800
```

### Example 3 (hard): capital stock from net investment
A country's capital stock is 5,000 (billion) today, and its net investment, the yearly increase in the stock, is $I(t) = 200e^{0.05t}$ billion a year, $t$ years from now. Find the capital stock in 10 years and the year in which it reaches 9,000.

1. $K(t) = \displaystyle\int 200e^{0.05t}\,dt = \frac{200}{0.05}e^{0.05t} + c_0 = 4{,}000\,e^{0.05t} + c_0$
   *Why:* net investment is the rate of change of the capital stock, $K'(t) = I(t)$, and the antiderivative of $e^{kt}$ is $e^{kt}/k$.
2. $K(0) = 4{,}000 + c_0 = 5{,}000 \Rightarrow c_0 = 1{,}000$
   *Why:* $e^0 = 1$, so the exponential term is 4,000 at $t = 0$, not 0. Setting $c_0 = 5{,}000$ would start the stock at 9,000.
3. $K(10) = 4{,}000\,e^{0.5} + 1{,}000 \approx 4{,}000 \times 1.64872 + 1{,}000 = 7{,}594.89$
   *Why:* put $t = 10$ into the capital function. Check: $K'(t) = 4{,}000 \times 0.05\,e^{0.05t} = 200e^{0.05t}$, which is $I(t)$.
4. $4{,}000\,e^{0.05t} + 1{,}000 = 9{,}000 \Rightarrow e^{0.05t} = 2 \Rightarrow t = \dfrac{\ln 2}{0.05} \approx 13.86$
   *Why:* isolate the exponential, then take natural logarithms (F07). The stock reaches 9,000 during year 14.

```verify
K(t) = 4000*exp(0.05*t) + 1000
I(t) = 200*exp(0.05*t)
assert 200/0.05 == 4000
assert abs(K(0) - 5000) < 0.000001
assert abs((K(10.000001) - K(9.999999))/0.000002 - I(10)) < 0.0001
assert abs(exp(0.5) - 1.64872) < 0.00001
assert abs(K(10) - 7594.89) < 0.005
assert abs(4000*exp(0.5) + 5000 - 11594.89) < 0.005
T = log(2)/0.05
assert abs(T - 13.86) < 0.005
assert abs(K(T) - 9000) < 0.000001
assert K(13) < 9000
assert K(14) > 9000
```

## Common mistakes
- Leaving out the constant, so total cost misses the fixed cost or the capital stock misses the capital you start with (FORGOT_CONSTANT).
- Raising the power without dividing by the new power, for example $\int 0.3q^2\,dq = 0.3q^3$ (NO_DIVIDE_POWER).
- Differentiating the marginal function when the question asks for the total (DIFFERENTIATED).
- Reading the price off marginal revenue instead of computing $R(Q)/Q$ (MR_AS_PRICE).
- Stopping at total revenue when the question asks for the price (GAVE_REVENUE).
- Setting the constant equal to the starting value when the other terms are not zero at the start, as with $e^{kt}/k$ at $t = 0$ (WRONG_CONSTANT).
- Writing $\int e^{kt}\,dt = e^{kt}$ without dividing by $k$ (EXP_NO_DIVIDE_K).
- Using the power rule for $\int x^{-1}\,dx$: it would divide by $n + 1 = 0$. That case gives $\ln|x|$.
- Thinking that the integral of a product is the product of the integrals: it is not, and integrating products needs the methods of C115.

## Practice
- `total-cost-from-marginal-cost` (difficulty 1): total cost at $q_0$ from $MC = a + bq + cq^2$ and a fixed cost; distractors FORGOT_CONSTANT, NO_DIVIDE_POWER, DIFFERENTIATED.
- `price-from-marginal-revenue` (difficulty 2): revenue from $MR = \alpha - \beta Q$ with $R(0) = 0$, then the price $R(Q_0)/Q_0$; distractors MR_AS_PRICE, GAVE_REVENUE.
- `capital-stock-from-investment` (difficulty 3): capital stock after $T$ years from net investment $I(t) = Ae^{kt}$ and today's stock; distractors WRONG_CONSTANT, FORGOT_CONSTANT, EXP_NO_DIVIDE_K, DIFFERENTIATED.

## Real world
- Cost budgeting: firms estimate the extra cost per unit at different output levels from production data, then rebuild total cost for a plan by accumulating it and adding fixed costs such as rent and equipment leases.
- National accounts: statistics offices estimate a country's capital stock by starting from a benchmark stock and adding each year's investment net of depreciation: the year-by-year version of $K'(t) = I(t)$ with a known starting stock.
- Macroeconomic models: a consumption function is built from an estimated marginal propensity to consume plus the spending households keep up even with no income, the constant fixed by $C(0)$.
- Climate policy: the stock of carbon dioxide in the air is accumulated from yearly emission flows on top of the stock already there, which is why carbon budgets are set as totals rather than yearly rates. Adding up a flow over a fixed period is the definite integral of C113.

---
id: C103
title: Differentiation rules
block: C1
coreYear: 1
prerequisites: [C102]
estMinutes: 45
status: draft
economicUses:
  - Marginal cost from a total cost function
  - Marginal revenue when the price falls as a firm sells more
  - Whether average cost is rising or falling (economies of scale)
  - Marginal product of labour from a production function
generators: [marginal-cost-cubic, marginal-revenue-product-rule, average-cost-slope-quotient-rule]
widgets: [marginal-cost-tangent]
mistakeCodes:
  FORGOT_POWER:
    label: Forgot to bring the power down
    explanation: The power rule has two parts. The exponent comes down as a factor and then drops by one, so q³ becomes 3q², not q². Do both parts every time.
  KEPT_CONSTANT:
    label: Kept the fixed cost in the derivative
    explanation: A constant does not change when output changes, so its derivative is 0. Fixed cost adds to total cost but never to marginal cost.
  AVERAGE_NOT_MARGINAL:
    label: Gave average cost instead of marginal cost
    explanation: Average cost C(q)/q is the cost per unit of everything produced so far. Marginal cost C′(q) is the rate at which total cost rises at this output. Differentiate C(q); do not divide it by q.
  PRODUCT_OF_DERIVATIVES:
    label: Multiplied the two derivatives
    explanation: The derivative of a product is not the product of the derivatives. Use (uv)′ = u′v + uv′, which has two terms.
  PRICE_AS_MR:
    label: Took the price as marginal revenue
    explanation: Revenue is Q × P(Q), and both factors change. Marginal revenue is the price P(Q) plus Q × P′(Q), the loss from charging less on all the other units, so it is below the price when demand slopes down.
  QUOTIENT_SIGN:
    label: Added instead of subtracting in the quotient rule
    explanation: The quotient rule has a minus sign, (u/v)′ = (u′v − uv′)/v². With a plus sign you get a different, wrong number.
  QUOTIENT_ORDER:
    label: Subtracted the quotient rule terms the wrong way round
    explanation: The numerator is u′v − uv′, derivative of the top first. Writing uv′ − u′v gives the right size with the wrong sign, so a falling average looks like a rising one.
  NUMERATOR_ONLY:
    label: Forgot to divide by v²
    explanation: The quotient rule divides u′v − uv′ by the bottom squared, v². Without that step the answer is far too large.
  QUOTIENT_OF_DERIVATIVES:
    label: Divided the two derivatives
    explanation: The derivative of u/v is not u′/v′. For average cost C(Q)/Q that shortcut just gives marginal cost C′(Q). Use (u′v − uv′)/v².
resources:
  - { title: "Calculus Volume 1, 3.3 Differentiation Rules (OpenStax)", url: "https://openstax.org/books/calculus-volume-1/pages/3-3-differentiation-rules", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Single Variable Calculus, Session 9: Product Rule (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/pages/1.-differentiation/part-a-definition-and-basic-rules/session-9-product-rule/", kind: course, verifiedAt: 2026-10-18 }
  - { title: "Single Variable Calculus, Session 10: Quotient Rule (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/pages/1.-differentiation/part-a-definition-and-basic-rules/session-10-quotient-rule/", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
A factory manager is told that total cost is $C(q) = 400 + 90q - 3q^2 + 0.1q^3$ and asks: "What does one more unit cost us at today's output?" The answer is the derivative $C'(q)$, the marginal cost. Working it out from a difference quotient every time, as in C102, is slow. A handful of rules gives the derivative of any polynomial or ratio of polynomials in a line or two, and almost every "marginal" quantity in economics is computed with them.

## Intuition
Build a derivative from the pieces of the formula:

- A constant, such as a fixed cost, does not change, so it adds nothing to the rate of change.
- A power $x^n$ grows at the rate $n x^{n-1}$: the exponent comes down and the power drops by one.
- Doubling a function doubles its slope, and the slope of a sum is the sum of the slopes.

Products need more care. Revenue is a rectangle with width $Q$ (quantity) and height $P$ (price). Sell a little more and the rectangle changes in two ways: it gets wider at the old price, and its height drops because the price falls on every unit. The change in area is the sum of these two strips, which is why the product rule has two terms. Ratios such as average cost, cost divided by output, follow a similar two-part rule with a minus sign.

## Definition and formulas
For functions $u(x)$ and $v(x)$ and a constant $k$:

- Constant rule: $\dfrac{d}{dx}\,k = 0$
- Power rule, for any real $n$: $\dfrac{d}{dx}\,x^n = n\,x^{n-1}$
- Constant multiple rule: $(k\,u)' = k\,u'$
- Sum and difference rule: $(u \pm v)' = u' \pm v'$
- Product rule: $(uv)' = u'v + uv'$
- Quotient rule: $\left(\dfrac{u}{v}\right)' = \dfrac{u'v - uv'}{v^2}$, where $v \neq 0$

The power rule works for negative and fractional powers too:
$$\frac{d}{dx}\,\frac{1}{x} = \frac{d}{dx}\,x^{-1} = -x^{-2} = -\frac{1}{x^2}, \qquad \frac{d}{dx}\,\sqrt{x} = \frac{d}{dx}\,x^{1/2} = \frac{1}{2}x^{-1/2} = \frac{1}{2\sqrt{x}}.$$

A polynomial is differentiated term by term: $\dfrac{d}{dx}\left(a_0 + a_1x + a_2x^2 + a_3x^3\right) = a_1 + 2a_2x + 3a_3x^2$.

Three results economists use all the time:

- Marginal cost: $MC(q) = C'(q)$. The fixed cost disappears.
- Marginal revenue: if the price depends on quantity, $R(Q) = Q \cdot P(Q)$ and the product rule gives
$$R'(Q) = P(Q) + Q\,P'(Q).$$
When demand slopes down, $P'(Q) < 0$, so marginal revenue is below the price.
- Slope of average cost: with $AC(Q) = C(Q)/Q$, the quotient rule gives
$$AC'(Q) = \frac{C'(Q)\,Q - C(Q)}{Q^2} = \frac{MC - AC}{Q}.$$
Average cost falls while marginal cost is below it and rises once marginal cost is above it.

## Interactive
::widget{id="marginal-cost-tangent"}

The graph shows the cost curve $C(q) = 400 + 90q - 3q^2 + 0.1q^3$ from Example 1 and, as a gold dashed line, its tangent at the output you choose. Move the **Output q** slider. The panel shows total cost $C(q)$, the marginal cost $C'(q)$ (the slope of the tangent) and the extra cost $C(q+1) - C(q)$ of actually making one more unit, the hollow point. At $q = 10$ the panel shows a marginal cost of 60 and an extra cost of 60.1, as in Example 1. Move to $q = 20$: 90 against 93.1, still close. The gap is smallest near $q = 10$, where the curve is almost straight, and grows where it bends more, at the ends of the slider.

## Worked examples

### Example 1 (easy): marginal cost from a cubic cost function
A firm's total cost of producing $q$ units is $C(q) = 400 + 90q - 3q^2 + 0.1q^3$. Find the marginal cost at $q = 10$ and compare it with the cost of the 11th unit.

1. $\dfrac{d}{dq}\,400 = 0,\quad \dfrac{d}{dq}\,90q = 90,\quad \dfrac{d}{dq}\,3q^2 = 6q,\quad \dfrac{d}{dq}\,0.1q^3 = 0.3q^2$
   *Why:* the fixed cost is a constant; for each power the exponent comes down and drops by one, and the coefficient in front stays.
2. $C'(q) = 90 - 6q + 0.3q^2$
   *Why:* the sum rule lets us differentiate term by term and keep the signs.
3. $C'(10) = 90 - 60 + 30 = 60$
   *Why:* marginal cost at a given output is the derivative evaluated there.
4. $C(11) - C(10) = 1{,}160.1 - 1{,}100 = 60.1$
   *Why:* the derivative is the slope of the tangent, so it closely estimates the cost of one more unit; the 0.1 gap comes from the curve bending.

```verify
F = 400; a = 90; b = 3; k = 0.1; q = 10
MC = a - 2*b*q + 3*k*q^2
C10 = F + a*q - b*q^2 + k*q^3
C11 = F + a*11 - b*11^2 + k*11^3
assert abs(MC - 60) < 1e-9
assert abs(C10 - 1100) < 1e-9
assert abs(C11 - 1160.1) < 1e-9
assert abs((C11 - C10) - 60.1) < 1e-9
# the rule agrees with a difference quotient over a tiny step
h = 0.000001
Cp = F + a*(q+h) - b*(q+h)^2 + k*(q+h)^3
Cm = F + a*(q-h) - b*(q-h)^2 + k*(q-h)^3
assert abs((Cp - Cm)/(2*h) - 60) < 0.0001
```

### Example 2 (medium): marginal revenue with the product rule
A firm's inverse demand curve is $P(Q) = 50 - 2\sqrt{Q}$, so its revenue is $R(Q) = Q \cdot P(Q)$. Find the marginal revenue at $Q = 100$ and compare it with the price.

1. $u = Q,\ u' = 1;\quad v = 50 - 2Q^{1/2},\ v' = -2 \cdot \tfrac{1}{2}Q^{-1/2} = -\dfrac{1}{\sqrt{Q}}$
   *Why:* write the square root as a power of one half, then use the power rule and the constant multiple rule.
2. $R'(Q) = u'v + uv' = \left(50 - 2\sqrt{Q}\right) + Q \cdot \left(-\dfrac{1}{\sqrt{Q}}\right) = 50 - 3\sqrt{Q}$
   *Why:* product rule; $Q/\sqrt{Q} = \sqrt{Q}$.
3. $P(100) = 50 - 20 = 30$ and $R'(100) = 50 - 30 = 20$
   *Why:* evaluate both at the current output.
4. $P(100) - R'(100) = 30 - 20 = 10$
   *Why:* marginal revenue is 10 below the price, because to sell the 101st unit the price falls by about $1/\sqrt{100} = 0.1$ on all 100 units already sold, which costs about 10 of revenue. Directly, $R(101) - R(100) \approx 19.93$.

```verify
alpha = 50; beta = 2; Q = 100
P = alpha - beta*sqrt(Q)
dP = -beta/(2*sqrt(Q))
MR = P + Q*dP
assert P == 30
assert abs(dP - (-0.1)) < 1e-12
assert abs(MR - 20) < 1e-12
assert abs(MR - (alpha - 3*sqrt(Q))) < 1e-12
R100 = Q*P
R101 = 101*(alpha - beta*sqrt(101))
assert abs((R101 - R100) - 19.93) < 0.005
```

### Example 3 (hard): is average cost rising or falling?
A firm's total cost is $C(Q) = 800 + 20Q + 2Q^2$. Use the quotient rule to find the slope of average cost $AC(Q) = C(Q)/Q$ at $Q = 10$ and at $Q = 40$, and explain the signs.

1. $u = 800 + 20Q + 2Q^2,\ u' = 20 + 4Q;\quad v = Q,\ v' = 1$
   *Why:* name the top and the bottom and differentiate each; $u'$ is the marginal cost.
2. $AC'(Q) = \dfrac{(20 + 4Q)Q - (800 + 20Q + 2Q^2)}{Q^2} = \dfrac{2Q^2 - 800}{Q^2} = 2 - \dfrac{800}{Q^2}$
   *Why:* quotient rule $(u'v - uv')/v^2$, then simplify the numerator.
3. $AC'(10) = 2 - 8 = -6$: average cost is falling.
   *Why:* here $MC(10) = 60$ is below $AC(10) = 1{,}200/10 = 120$, so each extra unit pulls the average down. Check: $(MC - AC)/Q = (60 - 120)/10 = -6$.
4. $AC'(40) = 2 - 0.5 = 1.5$: average cost is rising.
   *Why:* now $MC(40) = 180$ is above $AC(40) = 4{,}800/40 = 120$, so each extra unit pulls the average up: $(180 - 120)/40 = 1.5$.
5. $AC(10) = AC(40) = 120$, but $AC'(10) < 0 < AC'(40)$
   *Why:* the same average cost can be falling at one output and rising at another. The sign of $AC'$ depends on whether marginal cost is below or above average cost. Average cost stops falling where $AC' = 0$, here at $Q = 20$; finding such points is the job of C109.

```verify
F = 800; c1 = 20; d = 2
C10 = F + c1*10 + d*10^2
C40 = F + c1*40 + d*40^2
MC10 = c1 + 2*d*10
MC40 = c1 + 2*d*40
s10 = (MC10*10 - C10)/10^2
s40 = (MC40*40 - C40)/40^2
assert C10 == 1200
assert C40 == 4800
assert C10/10 == 120 and C40/40 == 120
assert MC10 == 60 and MC40 == 180
assert s10 == -6
assert s40 == 1.5
assert s10 == (MC10 - C10/10)/10
assert s40 == (MC40 - C40/40)/40
assert (d - F/20^2) == 0
```

## Common mistakes
- Forgetting to bring the exponent down, so $q^3$ becomes $q^2$ instead of $3q^2$ (FORGOT_POWER).
- Keeping the fixed cost in marginal cost: a constant has derivative 0 (KEPT_CONSTANT).
- Answering with average cost $C(q)/q$ when marginal cost $C'(q)$ was asked (AVERAGE_NOT_MARGINAL).
- Differentiating a product as $u'v'$ (PRODUCT_OF_DERIVATIVES).
- Taking marginal revenue to be the price and forgetting the $Q\,P'(Q)$ term (PRICE_AS_MR).
- Writing a plus sign in the quotient rule (QUOTIENT_SIGN).
- Subtracting the quotient rule terms the wrong way round, $uv' - u'v$ (QUOTIENT_ORDER).
- Forgetting to divide by $v^2$ (NUMERATOR_ONLY).
- Differentiating a quotient as $u'/v'$ (QUOTIENT_OF_DERIVATIVES).
- Moving a negative power the wrong way: the derivative of $Q^{-1}$ is $-Q^{-2}$, because the power drops by one from $-1$ to $-2$, not up to $0$.
- Leaving a square root as it is: rewrite $\sqrt{Q}$ as $Q^{1/2}$ before using the power rule.

## Practice
- `marginal-cost-cubic` (difficulty 1): marginal cost $C'(q_0)$ for $C(q) = F + aq - bq^2 + cq^3$; distractors FORGOT_POWER, KEPT_CONSTANT, AVERAGE_NOT_MARGINAL.
- `marginal-revenue-product-rule` (difficulty 2): marginal revenue $R'(Q_0)$ for $R(Q) = Q \cdot P(Q)$ with $P(Q) = \alpha - \beta\sqrt{Q}$ or $\alpha - \beta Q^2$; distractors PRICE_AS_MR, PRODUCT_OF_DERIVATIVES, FORGOT_POWER.
- `average-cost-slope-quotient-rule` (difficulty 3): the slope of average cost $C(Q)/Q$ at $Q_0$ for $C(Q) = F + cQ + dQ^2$, by the quotient rule; distractors QUOTIENT_SIGN, QUOTIENT_ORDER, NUMERATOR_ONLY, QUOTIENT_OF_DERIVATIVES.

## Real world
- Electricity markets: power stations offer their output at roughly their marginal cost, and the market price each hour is set by the marginal cost of the last station needed. Engineers estimate cost curves for each plant, often as polynomials in output, and differentiate them.
- Pricing with market power: an airline or a software firm that must cut its price to sell more earns a marginal revenue below the price, $P + Q\,P'(Q)$. That gap is why such firms sell less and charge more than competitive firms.
- Economies of scale: regulators of water, rail and power networks check whether average cost is still falling as output grows, that is, whether marginal cost is below average cost. If it is, one large supplier is cheaper than several small ones.
- Labour productivity: average product of labour $Q/L$ behaves like average cost. By the same quotient rule logic it rises while the marginal product of an extra worker is above the average and falls once it is below.

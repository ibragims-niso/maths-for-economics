---
id: C102
title: The derivative as a rate of change
block: C1
coreYear: 1
prerequisites: [C101]
estMinutes: 45
status: draft
economicUses:
  - Marginal cost as the rate of change of total cost
  - How fast GDP is growing at a given moment
  - "The slope of a demand curve: change in quantity per unit of price"
  - Marginal tax rates and the kinks in a tax schedule
generators: [cost-average-rate-of-change, instantaneous-rate-quadratic, tangent-line-intercept]
widgets: [secant-to-tangent]
mistakeCodes:
  NOT_DIVIDED:
    label: Gave the total change, not the rate
    explanation: The change in cost ΔC is only the top of the fraction. A rate of change is per unit, so divide ΔC by the change in output ΔQ.
  DIVIDED_BY_END:
    label: Divided by the final output, not the change in output
    explanation: The extra cost is spread over the extra units only. Divide by ΔQ = Q₂ − Q₁, not by Q₂.
  AVERAGE_COST_CHANGE:
    label: Compared average costs instead
    explanation: C(Q)/Q is the average cost of all units produced. The rate of change of cost compares the totals, ΔC/ΔQ = (C(Q₂) − C(Q₁))/(Q₂ − Q₁).
  SECANT_NOT_LIMIT:
    label: Stopped at a step of h = 1
    explanation: The change from x₀ to x₀ + 1 is an average rate over a whole unit. The instantaneous rate is the limit of the difference quotient as h shrinks to 0.
  VALUE_NOT_RATE:
    label: Gave the value of the function, not its rate of change
    explanation: f(x₀) is the level, for example total cost. The question asks how fast that level is changing, which is the slope of the curve at x₀.
  FORGOT_DOUBLE:
    label: Lost the factor 2 when expanding
    explanation: (x₀ + h)² = x₀² + 2x₀h + h², so the coefficient a of x² contributes 2a·x₀, not a·x₀, to the rate of change.
  CURVE_INTERCEPT:
    label: Used the curve's intercept for the tangent's
    explanation: The fixed cost is where the cost curve meets the vertical axis. The tangent line is a different line, so its intercept is C(Q₀) − m·Q₀.
  POINT_VALUE:
    label: Gave the height of the point of tangency
    explanation: C(Q₀) is where the tangent touches the curve, at Q = Q₀. The intercept is the line's value at Q = 0, so move back along the line by Q₀ units of slope m.
  INTERCEPT_SIGN:
    label: Added m·Q₀ instead of subtracting it
    explanation: From y = C(Q₀) + m(Q − Q₀), putting Q = 0 gives C(Q₀) − m·Q₀. Going back from Q₀ to 0 on a rising line lowers the value.
resources:
  - { title: "Calculus Volume 1, 3.1 Defining the Derivative (OpenStax)", url: "https://openstax.org/books/calculus-volume-1/pages/3-1-defining-the-derivative", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Calculus Volume 1, 3.2 The Derivative as a Function (OpenStax)", url: "https://openstax.org/books/calculus-volume-1/pages/3-2-the-derivative-as-a-function", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Calculus Volume 1, 3.4 Derivatives as Rates of Change (OpenStax)", url: "https://openstax.org/books/calculus-volume-1/pages/3-4-derivatives-as-rates-of-change", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
A factory manager asks: "If we make one more unit, how much does our total cost go up?" A finance ministry asks: "How fast is the economy growing right now, not on average over the last five years?" A shop asks: "If we raise the price a little, how many fewer items will we sell?" All three questions ask for a rate of change: how fast one quantity changes when another changes. The derivative is the exact tool for this, and it is the foundation of marginal analysis, the core method of economics.

## Intuition
Suppose GDP rose from 500 to 530 billion over one year. The average rate of change is 30 billion per year, but within that year the economy may have sped up or slowed down. To know the speed at one moment, measure the change over a shorter and shorter period: a quarter, a month, a day. These average rates settle down to one number, the instantaneous rate of change.

On a graph, an average rate of change is the slope of a secant: the straight line through two points of the curve. As the second point slides towards the first, the secant turns and settles on the tangent line, the line that just touches the curve there. Zoom in far enough on a smooth curve and it looks straight; the slope of that straight piece is the derivative.

## Definition and formulas
**Average rate of change** of $y = f(x)$ from $x$ to $x + h$ (the slope of the secant):
$$\frac{\Delta y}{\Delta x} = \frac{f(x + h) - f(x)}{h}$$
This fraction is called the **difference quotient**.

**Derivative** (instantaneous rate of change, slope of the tangent), using the limits of C101:
$$f'(x) = \lim_{h \to 0} \frac{f(x + h) - f(x)}{h}$$
when this limit exists. Other notations: $\dfrac{dy}{dx}$, $\dfrac{df}{dx}$; at a point $a$, $f'(a)$ or $\left.\dfrac{dy}{dx}\right|_{x = a}$. You cannot simply put $h = 0$ into the quotient (that gives $0/0$): simplify first so that $h$ cancels, then let $h$ shrink.

**Tangent line** at $x = a$: it passes through $(a, f(a))$ with slope $f'(a)$:
$$y = f(a) + f'(a)(x - a)$$

**From first principles.** For $f(x) = x^2$:
$$\frac{(x + h)^2 - x^2}{h} = \frac{2xh + h^2}{h} = 2x + h \;\to\; 2x$$
The same method gives:

- $f(x) = mx + c$ gives $f'(x) = m$
- $f(x) = x^2$ gives $f'(x) = 2x$
- $f(x) = x^3$ gives $f'(x) = 3x^2$, from $(x + h)^3 - x^3 = 3x^2h + 3xh^2 + h^3$
- $f(x) = \dfrac{1}{x}$ gives $f'(x) = -\dfrac{1}{x^2}$ (see Example 3)

A straight line has the same slope everywhere, so its derivative is a constant. Faster ways to differentiate, the rules, come in C103.

**The derivative as a function.** Doing the limit at every $x$ gives a new function $f'(x)$. For $C(Q) = 200 + 10Q + Q^2$ it is $C'(Q) = 10 + 2Q$: the marginal cost at each output.

**Units.** $f'(x)$ is measured in units of $y$ per unit of $x$: cost per extra unit of output, billions of GDP per year, units demanded per unit of price.

**Differentiability.** $f$ is differentiable at $a$ if the limit above exists, which needs the secant slopes from the left ($h < 0$) and from the right ($h > 0$) to approach the same number. At a corner they do not:

- $f(x) = |x|$ at $0$: the quotient is $|h|/h$, which is $-1$ for $h < 0$ and $+1$ for $h > 0$, so there is no derivative at $0$.
- A tax schedule with a 20 % rate up to an income of 10000 and 40 % above it, $T(y) = 0.2y$ for $y \le 10{,}000$ and $T(y) = 2000 + 0.4(y - 10{,}000)$ above (see F03): its slope is $0.2$ just below 10000 and $0.4$ just above. $T$ is continuous there but has a kink, so it is not differentiable at 10000; the marginal tax rate jumps.

A function with a derivative at a point is always continuous there, but a continuous function can still have corners.

## Interactive
::widget{id="secant-to-tangent"}

The graph shows the cost curve $C(Q) = 200 + 10Q + Q^2$ from the worked examples. The gold secant joins the point at **Output Q₀** to a second point a **Step h** further on; the green dashed line is the tangent at $Q_0$. Drag **Step h** towards 0.1 and watch the secant swing onto the tangent while **Secant slope ΔC/ΔQ** falls towards **Tangent slope C′(Q₀)**. With $Q_0 = 10$ and $h = 10$ the panel shows a secant slope of 40 (Example 1); with $h = 1$ it shows 31, and the tangent slope is 30 (Example 2). For this cost curve the **Gap** between the two slopes is always exactly $h$. Then move **Output Q₀**: the tangent gets steeper as output grows, because marginal cost $10 + 2Q_0$ rises.

## Worked examples

### Example 1 (easy): average rate of change of cost
A firm's total cost is $C(Q) = 200 + 10Q + Q^2$. Find the average rate of change of cost when output rises from 10 to 20 units, and say what it means.

1. $C(10) = 200 + 100 + 100 = 400$ and $C(20) = 200 + 200 + 400 = 800$
   *Why:* the rate compares the cost at the start and at the end of the interval.
2. $\Delta C = 800 - 400 = 400$ and $\Delta Q = 20 - 10 = 10$
   *Why:* we need both the change in cost and the change in output.
3. $\dfrac{\Delta C}{\Delta Q} = \dfrac{400}{10} = 40$
   *Why:* a rate of change is change per unit; this is the slope of the secant through $(10, 400)$ and $(20, 800)$.
4. On average, each of the 10 extra units adds 40 to total cost.
   *Why:* the answer is measured in cost per extra unit of output, and it describes only the 10 extra units, not all 20 units produced.

```verify
C(q) = 200 + 10*q + q^2
assert C(10) == 400
assert C(20) == 800
rate = (C(20) - C(10))/(20 - 10)
assert rate == 40
```

### Example 2 (medium): marginal cost from first principles, and the tangent line
For the same cost $C(Q) = 200 + 10Q + Q^2$, find the instantaneous rate of change of cost at $Q = 10$ from the definition, then the equation of the tangent line there.

1. $C(10 + h) = 200 + 10(10 + h) + (10 + h)^2 = 400 + 30h + h^2$
   *Why:* expand $(10 + h)^2 = 100 + 20h + h^2$ and collect terms.
2. $\dfrac{C(10 + h) - C(10)}{h} = \dfrac{30h + h^2}{h} = 30 + h$
   *Why:* the 400 cancels, so $h$ is a factor of every term left and we may divide by it ($h \ne 0$).
3. For $h = 1,\ 0.1,\ 0.01$ the quotient is $31,\ 30.1,\ 30.01$
   *Why:* the secant slopes over shorter and shorter steps close in on one number.
4. $C'(10) = \lim_{h \to 0}(30 + h) = 30$
   *Why:* the instantaneous rate of change is the limit; at 10 units, cost is rising by about 30 per extra unit, the marginal cost.
5. Tangent: $y = 400 + 30(Q - 10) = 30Q + 100$
   *Why:* the line through $(10, 400)$ with slope 30. Its intercept is 100, not the fixed cost 200: the tangent is a different line from the curve.

```verify
C(q) = 200 + 10*q + q^2
dq(h) = (C(10 + h) - C(10))/h
assert abs(dq(1) - 31) < 1e-9
assert abs(dq(0.1) - 30.1) < 1e-9
assert abs(dq(0.01) - 30.01) < 1e-9
assert abs(dq(0.000001) - 30) < 0.00001
m = 30
k = C(10) - m*10
assert k == 100
# The tangent touches the curve at Q = 10 and lies below it elsewhere.
assert m*10 + k == C(10)
assert C(5) > m*5 + k
assert C(15) > m*15 + k
```

### Example 3 (hard): the derivative as a function
A firm's fixed cost is 1200, so its average fixed cost is $AFC(Q) = \dfrac{1200}{Q}$. Find $AFC'(Q)$ from first principles, and interpret it at $Q = 20$ and $Q = 40$.

1. $AFC(Q + h) - AFC(Q) = \dfrac{1200}{Q + h} - \dfrac{1200}{Q} = \dfrac{1200Q - 1200(Q + h)}{Q(Q + h)} = \dfrac{-1200h}{Q(Q + h)}$
   *Why:* put the two fractions over a common denominator so the difference becomes one fraction.
2. $\dfrac{AFC(Q + h) - AFC(Q)}{h} = \dfrac{-1200}{Q(Q + h)}$
   *Why:* the factor $h$ cancels, which removes the $0/0$ problem.
3. $AFC'(Q) = \lim_{h \to 0} \dfrac{-1200}{Q(Q + h)} = -\dfrac{1200}{Q^2}$
   *Why:* as $h \to 0$, $Q + h \to Q$. The answer is a function of $Q$: one limit gives the rate at every output at once.
4. $AFC'(20) = -\dfrac{1200}{400} = -3$ and $AFC'(40) = -\dfrac{1200}{1600} = -0.75$
   *Why:* substitute into the derivative function.
5. At 20 units, $AFC = 60$ and it falls by about 3 per extra unit; at 40 units, $AFC = 30$ and it falls by only about 0.75 per extra unit.
   *Why:* spreading the fixed cost over more units helps less and less as output grows. Over the whole step from 20 to 21 units, $AFC$ falls by about 2.86, a little less than 3, because the curve flattens out.

```verify
AFC(q) = 1200/q
d(q) = -1200/q^2
assert d(20) == -3
assert d(40) == -0.75
assert AFC(20) == 60
assert AFC(40) == 30
# The difference quotient agrees with the derivative for a tiny step.
assert abs((AFC(20 + 0.000001) - AFC(20))/0.000001 - d(20)) < 0.0001
assert abs((AFC(40 + 0.000001) - AFC(40))/0.000001 - d(40)) < 0.0001
# Over a whole step from 20 to 21 units.
step = AFC(21) - AFC(20)
assert abs(step - (-2.857)) < 0.001
assert abs(step - (-1200/(20*21))) < 1e-9
```

## Common mistakes
- Stopping at the change in cost and forgetting to divide by the change in output (NOT_DIVIDED).
- Dividing the change in cost by the final output instead of by the change in output (DIVIDED_BY_END).
- Subtracting average costs $C(Q)/Q$ instead of comparing total costs (AVERAGE_COST_CHANGE).
- Taking the change over one whole unit, $f(x_0 + 1) - f(x_0)$, as the instantaneous rate; it is only an average rate (SECANT_NOT_LIMIT).
- Giving the value of the function, such as total cost, when the question asks how fast it changes (VALUE_NOT_RATE).
- Expanding $(x_0 + h)^2$ as $x_0^2 + x_0 h + h^2$ and losing the factor 2 (FORGOT_DOUBLE).
- Taking the fixed cost as the intercept of the tangent line; the curve and the tangent cross the vertical axis at different heights (CURVE_INTERCEPT).
- Giving $C(Q_0)$, the height where the tangent touches the curve, as its intercept (POINT_VALUE).
- Adding $m Q_0$ to $C(Q_0)$ instead of subtracting it when finding the intercept (INTERCEPT_SIGN).
- Putting $h = 0$ into the difference quotient before simplifying, which gives the meaningless $0/0$.
- Assuming every continuous function has a derivative everywhere: corners, like $|x|$ at 0 or a kink in a tax schedule, have none.

## Practice
- `cost-average-rate-of-change` (difficulty 1): average rate of change of $C(Q) = F + aQ + bQ^2$ between two outputs; distractors NOT_DIVIDED, DIVIDED_BY_END, AVERAGE_COST_CHANGE.
- `instantaneous-rate-quadratic` (difficulty 2): instantaneous rate of change of a quadratic cost, revenue or GDP function at a point, as the limit of the difference quotient; answer $2a x_0 + b$; distractors SECANT_NOT_LIMIT, VALUE_NOT_RATE, FORGOT_DOUBLE.
- `tangent-line-intercept` (difficulty 3): the intercept $k$ of the tangent line $y = mQ + k$ to a quadratic cost curve; answer $C(Q_0) - C'(Q_0)\,Q_0$; distractors CURVE_INTERCEPT, POINT_VALUE, INTERCEPT_SIGN.

## Real world
- Costing and pricing: firms estimate the cost of one more unit, the marginal cost, to decide whether an extra order is worth taking; C106 develops this marginal analysis.
- GDP growth: statistics offices publish the change in GDP from one quarter to the next, an average rate of change over three months; some, such as the United States, scale it up to an annual rate, so that it reads as the economy's speed per year during that quarter.
- Taxes and benefits: income tax bands create kinks where the marginal tax rate jumps. Economists look for incomes bunching just below such kinks to measure how strongly people respond to tax rates.
- Demand: the slope of a demand curve, the change in quantity per unit change in price, tells a seller how many sales a small price rise costs; turned into percentages it becomes the elasticity of C107.

---
id: C104
title: The chain rule
block: C1
coreYear: 1
prerequisites: [C103]
estMinutes: 40
status: draft
economicUses:
  - "How fast cost rises over time as output grows: dC/dt = C′(Q)·Q′(t)"
  - "The value of one more worker: marginal revenue product = MR × MPL"
  - How the tax bill changes with an extra hour of work
  - Effects that pass through a chain of variables, from a policy to an outcome
searchTerms:
  - "Chain rule"
  - "Derivative of a composite function"
generators: [chain-rule-power-at-point, cost-rate-over-time, marginal-revenue-product-labour]
widgets: [chain-rule-cost-time]
mistakeCodes:
  FORGOT_INNER:
    label: Forgot the derivative of the inside
    explanation: The chain rule multiplies two rates, the derivative of the outer function (taken at the inside) and the derivative of the inside. Stopping after the outer derivative leaves out how fast the inside itself changes.
  INSIDE_ONLY:
    label: Gave only the derivative of the inside
    explanation: The derivative of the inside, such as the output growth Q′(t) or the a in ax + b, is only half of the chain. Multiply it by the derivative of the outer function, evaluated at the inside.
  POWER_NOT_REDUCED:
    label: Kept the old power
    explanation: The derivative of uⁿ is n·uⁿ⁻¹, so the power drops by one. Bringing n down in front but keeping uⁿ makes the answer far too large.
  EXPAND_TERMWISE:
    label: Raised each term to the power separately
    explanation: (ax + b)ⁿ is not (ax)ⁿ + bⁿ; for example (2 + 1)² = 9, not 4 + 1. Treat the whole bracket as one inner function u and use n·uⁿ⁻¹·u′.
  FORGOT_HALF:
    label: Lost the ½ from the square root
    explanation: √u = u^(1/2), so its derivative is ½·u^(−1/2) = 1/(2√u). Dropping the ½ doubles the answer.
  WRONG_POINT:
    label: Took the outer derivative at the wrong point
    explanation: The outer derivative is evaluated at the value of the inside. Marginal cost is taken at the output Q(t₀), not at the time t₀; marginal revenue at the output Q(L), not at the number of workers L.
  OUTER_NOT_DIFFERENTIATED:
    label: Used the total instead of the marginal
    explanation: The first factor is the derivative of the outer function, such as marginal cost C′(Q) or marginal revenue R′(Q), not total cost or total revenue. A total times a rate is not a rate of change.
resources:
  - { title: "Calculus Volume 1, 3.6 The Chain Rule (OpenStax)", url: "https://openstax.org/books/calculus-volume-1/pages/3-6-the-chain-rule", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Calculus Volume 1, 3.7 Derivatives of Inverse Functions (OpenStax)", url: "https://openstax.org/books/calculus-volume-1/pages/3-7-derivatives-of-inverse-functions", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Principles of Economics 3e, 14.1 The Theory of Labor Markets (OpenStax)", url: "https://openstax.org/books/principles-economics-3e/pages/14-1-the-theory-of-labor-markets", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
Economic quantities rarely depend on each other directly. A new factory's cost depends on how much it produces, and its output rises week by week as it hires and trains staff. A manager who asks "how fast are our costs rising?" has to combine two rates: how much cost rises for each extra unit, and how many extra units arrive each week. The chain rule does exactly that. The same rule tells a firm what one more worker is worth: the worker adds output, the output adds revenue, so the extra revenue is marginal revenue times the extra output.

## Intuition
Rates along a chain multiply. If output grows by 5 units a week and each extra unit adds 66 to cost, then cost rises by about $5 \times 66 = 330$ a week. Or think of a worker paid 15 an hour, whose tax takes 20 % of each extra unit of income: one more hour adds 15 to income and $0.2 \times 15 = 3$ to the tax bill.

The one subtle point is *where* each rate is measured. Marginal cost changes with output, so it must be measured at the output the factory produces now. In $f(g(x))$ the outer function only ever sees the value of the inside, so its rate $f'$ is taken at $g(x)$, not at $x$.

## Definition and formulas
**Chain rule.** If $y = f(u)$ and $u = g(x)$, so that $y = f(g(x))$ is a composite function (F10), then
$$\frac{d}{dx}\,f(g(x)) = f'(g(x))\cdot g'(x)$$
In Leibniz notation:
$$\frac{dy}{dx} = \frac{dy}{du}\cdot\frac{du}{dx}$$
The $du$ terms look as if they cancel. That is a memory aid rather than a proof, but it shows which rate goes where.

**The outside–inside method.**
1. Find the inside: the part you would work out first (the bracket, or the expression under a root).
2. Differentiate the outside as if the inside were a single letter $u$, and leave the inside unchanged.
3. Multiply by the derivative of the inside.

**Powers of an expression.** With the power rule as the outside:
$$\frac{d}{dx}\,[g(x)]^n = n\,[g(x)]^{n-1}\cdot g'(x)$$

- Linear inside: $\dfrac{d}{dx}(ax + b)^n = n\,a\,(ax + b)^{n-1}$.
- Square root of a quadratic: $\dfrac{d}{dx}\sqrt{x^2 + 16} = \dfrac{1}{2\sqrt{x^2 + 16}} \cdot 2x = \dfrac{x}{\sqrt{x^2 + 16}}$. At $x = 3$ this is $\dfrac{3}{\sqrt{25}} = 0.6$.
- A reciprocal: $\dfrac{d}{dx}\,\dfrac{1}{x^2 + 1} = \dfrac{d}{dx}(x^2 + 1)^{-1} = -\dfrac{2x}{(x^2 + 1)^2}$, the same result as the quotient rule with less work.

**With the product and quotient rules.** Use the product or quotient rule for the overall shape, and the chain rule for any factor that is itself a composite:
$$\frac{d}{dx}\big[x(2x + 1)^3\big] = (2x + 1)^3 + x \cdot 3(2x + 1)^2 \cdot 2 = (2x + 1)^2(8x + 1)$$
At $x = 1$ this is $9 \cdot 9 = 81$.

**Chains in economics.**

- Cost through output over time: $\dfrac{dC}{dt} = C'(Q(t)) \cdot Q'(t)$, marginal cost times the growth of output.
- Revenue through output from labour: the marginal revenue product of labour is
$$MRP_L = \frac{dR}{dL} = R'(Q(L)) \cdot Q'(L) = MR \times MPL,$$
marginal revenue times the marginal product of labour (the extra output from one more worker).

**Derivative of an inverse function.** If $y = f(x)$ is one-to-one and $\dfrac{dy}{dx} \neq 0$, its inverse $x = f^{-1}(y)$ has
$$\frac{dx}{dy} = \frac{1}{dy/dx},$$
with both derivatives taken at the same point of the curve. It follows from the chain rule: differentiating $f^{-1}(f(x)) = x$ gives $(f^{-1})'(f(x)) \cdot f'(x) = 1$. For example, demand $Q = 120 - 4P$ has $\dfrac{dQ}{dP} = -4$, so inverse demand $P = 30 - \dfrac{Q}{4}$ has $\dfrac{dP}{dQ} = -\dfrac{1}{4}$.

## Interactive
::widget{id="chain-rule-cost-time"}

The graph is the factory of Example 2: output $Q(t) = 40 + gt$ units a week and weekly cost $C(Q) = 500 + 6Q + 0.5Q^2$, so the purple curve is cost against time. Move the **Time t** slider: the panel shows the output growth $Q'(t)$, marginal cost at the current output and their product $dC/dt$, which is the slope of the gold tangent. Check: with growth 5 at $t = 4$ the panel shows $C'(60) = 66$ and $dC/dt = 330$. At $t = 8$ it shows $C'(80) = 86$ and $dC/dt = 430$: cost rises faster as the factory grows, because each extra unit costs more at the margin. Then move the **Output growth g** slider. At $t = 0$ output is 40 whatever $g$ is, so there raising $g$ from 2 to 4 doubles $dC/dt$ from 92 to 184.

## Worked examples

### Example 1 (easy): a power of a linear expression
Find the derivative of $y = (2x + 1)^3$ and its value at $x = 2$. Check the answer by expanding the bracket.

1. $u = 2x + 1$, $\;y = u^3$
   *Why:* the bracket is worked out first, so it is the inside; cubing is the outside.
2. $\dfrac{dy}{du} = 3u^2$, $\;\dfrac{du}{dx} = 2$
   *Why:* the power rule for the outside; the slope of the linear inside is its coefficient of $x$.
3. $\dfrac{dy}{dx} = 3(2x + 1)^2 \cdot 2 = 6(2x + 1)^2$
   *Why:* chain rule, $\dfrac{dy}{dx} = \dfrac{dy}{du} \cdot \dfrac{du}{dx}$, with the inside put back in place of $u$.
4. At $x = 2$: $u = 5$, so $\dfrac{dy}{dx} = 6 \cdot 5^2 = 150$
   *Why:* the outer derivative is evaluated at the value of the inside.
5. Check: $(2x + 1)^3 = 8x^3 + 12x^2 + 6x + 1$, with derivative $24x^2 + 24x + 6 = 96 + 48 + 6 = 150$ at $x = 2$
   *Why:* expanding is slow and only practical for small powers, but it confirms the answer. Forgetting the inner factor 2 would have given 75.

```verify
x = 2
u = 2*x + 1
assert u == 5
d = 3*u^2*2
assert d == 150
assert 24*x^2 + 24*x + 6 == 150
# forgetting the inner derivative halves the answer
assert 3*u^2 == 75
# numerical slope of the original function
h = 0.000001
assert abs(((2*(x + h) + 1)^3 - (2*(x - h) + 1)^3)/(2*h) - 150) < 0.001
```

### Example 2 (medium): how fast cost rises as output grows
A factory produces $Q(t) = 40 + 5t$ units a week, $t$ weeks after it opens. Producing $Q$ units a week costs $C(Q) = 500 + 6Q + 0.5Q^2$ a week. How fast is the weekly cost rising at $t = 4$?

1. $\dfrac{dC}{dt} = C'(Q(t)) \cdot Q'(t)$
   *Why:* time affects cost only through output, so the two rates multiply.
2. $Q(4) = 40 + 5 \cdot 4 = 60$, $\;Q'(t) = 5$
   *Why:* marginal cost has to be measured at the output produced at $t = 4$.
3. $C'(Q) = 6 + Q$, so $C'(60) = 66$
   *Why:* differentiate the cost function term by term; the fixed cost 500 has derivative 0.
4. $\dfrac{dC}{dt} = 66 \times 5 = 330$ a week
   *Why:* each of the 5 extra units a week adds about 66 to cost.
5. Check: $C(Q(t)) = 500 + 6(40 + 5t) + 0.5(40 + 5t)^2$ has derivative $30 + 5(40 + 5t) = 230 + 25t$, which is $330$ at $t = 4$
   *Why:* substituting first and then differentiating must give the same rate. Over the whole of the next week cost actually rises by $C(65) - C(60) = 3{,}002.5 - 2{,}660 = 342.5$, a little more than 330, because marginal cost keeps rising during the week.

```verify
m = 40; g = 5; t = 4
Q = m + g*t
assert Q == 60
MC = 6 + Q
assert MC == 66
rate = MC*g
assert rate == 330
assert 230 + 25*t == 330
C60 = 500 + 6*60 + 0.5*60^2
C65 = 500 + 6*65 + 0.5*65^2
assert C60 == 2660
assert C65 == 3002.5
assert C65 - C60 == 342.5
# the widget check: t = 8, and t = 0 with g = 2 and g = 4
assert (6 + (m + g*8))*g == 430
assert (6 + m)*2 == 92
assert (6 + m)*4 == 184
```

### Example 3 (hard): marginal revenue product of labour
A firm with $L$ workers produces $Q(L) = 4\sqrt{L}$ units, and its revenue from selling $Q$ units is $R(Q) = 100Q - Q^2$. It employs 25 workers and pays a wage of 20 per worker. (a) Find the marginal revenue product of labour at $L = 25$. Is one more worker worth hiring? (b) How many extra workers does one more unit of output need, and what do they cost in wages?

1. $Q(25) = 4\sqrt{25} = 20$
   *Why:* the inside first: the output the 25 workers produce.
2. $Q'(L) = \dfrac{2}{\sqrt{L}}$, so $Q'(25) = 0.4$
   *Why:* $4\sqrt{L} = 4L^{1/2}$ has derivative $2L^{-1/2}$. This is the marginal product of labour: one more worker adds about 0.4 units.
3. $R'(Q) = 100 - 2Q$, so $R'(20) = 60$
   *Why:* marginal revenue is evaluated at the output 20, not at the 25 workers.
4. $MRP_L = R'(20) \cdot Q'(25) = 60 \times 0.4 = 24$
   *Why:* chain rule, $\dfrac{dR}{dL} = \dfrac{dR}{dQ} \cdot \dfrac{dQ}{dL}$. One more worker adds about 24 to revenue but costs 20, so hiring is worth it.
5. $\dfrac{dL}{dQ} = \dfrac{1}{0.4} = 2.5$ workers, costing $20 \times 2.5 = 50$ in wages
   *Why:* derivative of the inverse function. One more unit costs 50 in labour and brings in 60, the same verdict seen per unit of output.
6. Check: $R(Q(L)) = 400\sqrt{L} - 16L$ has derivative $\dfrac{200}{\sqrt{L}} - 16 = 40 - 16 = 24$; and $L = \dfrac{Q^2}{16}$ has $\dfrac{dL}{dQ} = \dfrac{Q}{8} = 2.5$ at $Q = 20$
   *Why:* substituting first, and inverting the production function directly, give the same numbers.

```verify
L = 25; w = 20
Q = 4*sqrt(L)
assert Q == 20
MPL = 2/sqrt(L)
assert abs(MPL - 0.4) < 1e-12
MR = 100 - 2*Q
assert MR == 60
MRP = MR*MPL
assert abs(MRP - 24) < 1e-9
assert MRP > w
dLdQ = 1/MPL
assert abs(dLdQ - 2.5) < 1e-9
assert abs(w*dLdQ - 50) < 1e-9
assert abs((200/sqrt(L) - 16) - 24) < 1e-9
assert abs(Q/8 - 2.5) < 1e-9
# numerical slope of revenue as a function of workers
h = 0.000001
RL(x) = 100*(4*sqrt(x)) - (4*sqrt(x))^2
assert abs((RL(L + h) - RL(L - h))/(2*h) - 24) < 0.001
```

## Common mistakes
- Differentiating the outside and forgetting to multiply by the derivative of the inside (FORGOT_INNER).
- Giving only the derivative of the inside, such as the output growth $Q'(t)$, as the answer (INSIDE_ONLY).
- Bringing the power down but not lowering it, as in $n\,a\,(ax + b)^n$ (POWER_NOT_REDUCED).
- Treating $(ax + b)^n$ as $(ax)^n + b^n$ (EXPAND_TERMWISE).
- Losing the $\tfrac12$ when differentiating a square root (FORGOT_HALF).
- Evaluating the outer derivative at the wrong point, such as marginal cost at the time $t_0$ instead of at the output $Q(t_0)$ (WRONG_POINT).
- Multiplying total cost or total revenue by the inner rate instead of marginal cost or marginal revenue (OUTER_NOT_DIFFERENTIATED).
- Using $\dfrac{dx}{dy} = \dfrac{1}{dy/dx}$ where $\dfrac{dy}{dx} = 0$: there the inverse has a vertical tangent and no finite derivative.

## Practice
- `chain-rule-power-at-point` (difficulty 1): the slope of $(ax + b)^n$ or $\sqrt{ax^2 + b}$ at a point; distractors FORGOT_INNER, POWER_NOT_REDUCED, INSIDE_ONLY, EXPAND_TERMWISE, FORGOT_HALF.
- `cost-rate-over-time` (difficulty 2): $dC/dt = C'(Q(t)) \cdot Q'(t)$ for growing output and a quadratic cost function; distractors FORGOT_INNER, INSIDE_ONLY, WRONG_POINT, OUTER_NOT_DIFFERENTIATED.
- `marginal-revenue-product-labour` (difficulty 3): $dR/dL = R'(Q(L)) \cdot Q'(L)$ with $Q = k\sqrt{L}$ and $R = \alpha Q - \beta Q^2$; distractors FORGOT_INNER, WRONG_POINT, OUTER_NOT_DIFFERENTIATED, FORGOT_HALF.

## Real world
- Hiring: a firm adds workers while the marginal revenue product of labour is above the wage. Economists compute that product exactly as in Example 3, marginal revenue times the marginal product of labour, which is the basis of the theory of labour demand.
- Budgeting a ramp-up: when a new plant, mine or software service scales up, planners forecast how fast costs will grow by multiplying marginal cost at the planned output by the planned growth in output.
- Taxes and work: the extra tax from one more hour of work is the marginal tax rate times the hourly wage. This chain is how economists measure how much a tax system weakens the incentive to work longer hours.
- Policy chains: a change in the interest rate affects borrowing, borrowing affects spending, and spending affects income. With several variables at once the same idea becomes the multivariable chain rule (MV03).

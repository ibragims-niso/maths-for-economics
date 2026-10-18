---
id: F06
title: "Quadratic functions: revenue and profit"
block: F
coreYear: 1
prerequisites: [F02, F03]
estMinutes: 40
status: draft
economicUses:
  - Revenue-maximising price and output for a firm facing linear demand
  - Largest profit and the output that gives it, without calculus
  - Break-even outputs where a quadratic profit crosses zero
  - Comparing a sales target with a profit target
generators: [max-revenue-linear-demand, max-profit-quadratic, profit-maximising-price]
widgets: []
mistakeCodes:
  QUANTITY_NOT_MAXIMUM:
    label: Gave the best quantity, not the maximum value
    explanation: The vertex formula Q = −b/(2a) tells you where the top of the curve is. The maximum revenue or profit is the height of the curve there, so put that quantity back into the function.
  PRICE_NOT_REVENUE:
    label: Gave the price, not the revenue
    explanation: At the top of the revenue curve you know the quantity and, from the demand curve, the price. Revenue is the two multiplied together.
  INTERCEPT_PRICE:
    label: Used α as the price of every unit
    explanation: α is the price only when nothing is sold. At the quantity Q* the price is α − βQ*, so revenue is (α − βQ*) × Q*, not α × Q*.
  FORGOT_FIXED_COST:
    label: Left out the fixed cost
    explanation: The constant term −c is paid whatever the output. It does not move the best output, but it lowers the maximum profit by c, so include it when you work out π(Q*).
  VERTEX_NO_HALF:
    label: Used −b/a instead of −b/(2a)
    explanation: The top of y = ax² + bx + c is at x = −b/(2a). Leaving out the 2 doubles the answer and lands on the mirror image of x = 0, where the function is back to its starting value.
  QUANTITY_NOT_PRICE:
    label: Gave the quantity instead of the price
    explanation: The vertex gives the best output Q*. The question asks for the price, which comes from putting Q* into the demand curve P = α − βQ.
  REVENUE_NOT_PROFIT:
    label: Maximised revenue, not profit
    explanation: Revenue is highest at the price α/2, but each unit also costs v to make. Subtract the costs first. Profit −βQ² + (α − v)Q − F peaks at a smaller output and a higher price, (α + v)/2.
  SIGN_OF_A:
    label: Lost the minus sign of a
    explanation: In R(Q) = αQ − βQ² the coefficient of Q² is a = −β, not β. With the wrong sign the vertex formula gives a negative quantity, which is a sign that something has gone wrong.
resources:
  - { title: "College Algebra 2e, 5.1 Quadratic Functions (OpenStax)", url: "https://openstax.org/books/college-algebra-2e/pages/5-1-quadratic-functions", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Intermediate Algebra 2e, 9.6 Graph Quadratic Functions Using Properties (OpenStax)", url: "https://openstax.org/books/intermediate-algebra-2e/pages/9-6-graph-quadratic-functions-using-properties", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Principles of Economics 3e, 9.2 How a Profit-Maximizing Monopoly Chooses Output and Price (OpenStax)", url: "https://openstax.org/books/principles-economics-3e/pages/9-2-how-a-profit-maximizing-monopoly-chooses-output-and-price", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
A concert promoter can sell more tickets by cutting the price, but then every ticket earns less. Set the price too high and the hall is empty; set it too low and a full hall brings in almost nothing. Somewhere in between, revenue is as large as it can be. When demand is a straight line, revenue and profit are quadratic functions, and the best price can be found with school algebra, before any calculus.

## Intuition
Revenue is price times quantity. If the price has to fall steadily for the firm to sell more, revenue starts at zero (nothing sold), rises, and then falls back to zero (the price has been pushed down to zero). Its graph is a hill-shaped curve called a parabola. A parabola is symmetric: its two sides are mirror images, so the top lies exactly halfway between the two points where the curve crosses zero. Profit is revenue minus cost. When cost grows in a straight line, profit is a parabola too, lower down, with its top at a smaller quantity.

## Definition and formulas
A quadratic function is $y = ax^2 + bx + c$ with $a \neq 0$. Its graph is a parabola.

- $a < 0$: the parabola opens downwards (a hill) and has a highest point. $a > 0$: it opens upwards (a valley) and has a lowest point.
- Vertex, the top or bottom point: $x_v = -\dfrac{b}{2a}$ and $y_v = c - \dfrac{b^2}{4a}$.
- Completed-square (vertex) form: $y = a(x - x_v)^2 + y_v$. Because $(x - x_v)^2 \ge 0$, a negative $a$ means $y$ can never rise above $y_v$.
- Axis of symmetry: the vertical line $x = x_v$. If the parabola has roots $x_1$ and $x_2$, then $x_v = \dfrac{x_1 + x_2}{2}$.
- Roots: $x = \dfrac{-b \pm \sqrt{b^2 - 4ac}}{2a}$, which exist when $b^2 - 4ac \ge 0$.

In economics, take inverse demand $P = \alpha - \beta Q$ with $\alpha, \beta > 0$, and cost $C(Q) = F + vQ$ (fixed cost $F$, cost $v$ per unit).

- Revenue: $R(Q) = (\alpha - \beta Q)Q = -\beta Q^2 + \alpha Q$, with roots $Q = 0$ and $Q = \alpha/\beta$.
- Revenue is largest at $Q_R = \dfrac{\alpha}{2\beta}$, where $P_R = \dfrac{\alpha}{2}$ and $R_{\max} = \dfrac{\alpha^2}{4\beta}$.
- Profit: $\pi(Q) = R(Q) - C(Q) = -\beta Q^2 + (\alpha - v)Q - F$.
- Profit is largest at $Q_\pi = \dfrac{\alpha - v}{2\beta}$, where $P_\pi = \dfrac{\alpha + v}{2}$.
- Because $v > 0$: $Q_\pi < Q_R$ and $P_\pi > P_R$. A firm that maximises profit sells less, at a higher price, than one that maximises revenue. The fixed cost $F$ lowers the whole profit curve but does not move its top sideways.
- Break-even outputs are the roots of $\pi(Q) = 0$. They lie the same distance either side of $Q_\pi$.

Later, in C109, you will find the same tops with derivatives; the answers agree.

## Interactive
An interactive parabola for revenue and profit is planned for this topic. Until then, use Practice: every problem uses new numbers.

## Worked examples

### Example 1 (easy): the top of a revenue curve
A boat-tour company can sell $Q$ tickets a day at the price $P = 60 - 2Q$. How many tickets maximise revenue, at what price, and what is the maximum revenue?

1. $R(Q) = (60 - 2Q)Q = 60Q - 2Q^2 = 2Q(30 - Q)$
   *Why:* revenue is price times quantity; the factorised form shows where it is zero.
2. Roots: $Q = 0$ and $Q = 30$.
   *Why:* revenue is zero when nothing is sold and when the price has fallen to zero.
3. $Q^* = \dfrac{0 + 30}{2} = 15$, the same as $-\dfrac{b}{2a} = -\dfrac{60}{2 \cdot (-2)} = 15$.
   *Why:* a parabola is symmetric, so its top is halfway between its roots.
4. $P = 60 - 2 \cdot 15 = 30$ and $R = 30 \cdot 15 = 450$.
   *Why:* the demand curve gives the price at 15 tickets; revenue is that price times the quantity.
5. Check: $R(10) = R(20) = 400 < 450$.
   *Why:* points the same distance either side of the top have the same height, and both are lower than the top.

```verify
alpha = 60; beta = 2
R(q) = (alpha - beta*q)*q
assert alpha/beta == 30
Q = (0 + alpha/beta)/2
assert Q == 15
assert -alpha/(2*(-beta)) == Q
assert alpha - beta*Q == 30
assert R(Q) == 450
assert R(Q) == alpha^2/(4*beta)
assert R(10) == 400
assert R(20) == 400
```

### Example 2 (medium): completing the square for profit
A small brewery's weekly profit is $\pi(Q) = -3Q^2 + 180Q - 1500$, where $Q$ is the number of batches brewed. Find the maximum profit by completing the square, and the outputs at which the brewery breaks even.

1. $\pi(Q) = -3(Q^2 - 60Q) - 1500$
   *Why:* take the coefficient of $Q^2$ out of the two terms that contain $Q$.
2. $Q^2 - 60Q = (Q - 30)^2 - 900$
   *Why:* half of 60 is 30, and $(Q - 30)^2 = Q^2 - 60Q + 900$, so the extra 900 must be taken away again.
3. $\pi(Q) = -3(Q - 30)^2 + 2700 - 1500 = -3(Q - 30)^2 + 1200$
   *Why:* multiply the $-3$ back in and collect the constants.
4. The maximum profit is 1200, at $Q = 30$ batches.
   *Why:* $-3(Q - 30)^2$ is never positive and is zero only when $Q = 30$. The vertex formula agrees: $-\dfrac{180}{2 \cdot (-3)} = 30$.
5. Break-even: $-3(Q - 30)^2 + 1200 = 0 \Rightarrow (Q - 30)^2 = 400 \Rightarrow Q = 10$ or $Q = 50$.
   *Why:* profit is zero at the roots. They sit 20 batches either side of the vertex, as symmetry requires.

```verify
profit(q) = -3*q^2 + 180*q - 1500
assert profit(0) == -3*(0 - 30)^2 + 1200
assert profit(17) == -3*(17 - 30)^2 + 1200
assert 3*900 - 1500 == 1200
assert -180/(2*(-3)) == 30
assert profit(30) == 1200
# the vertex height formula c − b²/(4a) gives the same maximum
assert -1500 - 180^2/(4*(-3)) == 1200
d = 180^2 - 4*(-3)*(-1500)
assert (-180 + sqrt(d))/(2*(-3)) == 10
assert (-180 - sqrt(d))/(2*(-3)) == 50
assert profit(10) == 0
assert profit(50) == 0
```

### Example 3 (hard): maximum revenue versus maximum profit
A firm faces the demand curve $P = 120 - 3Q$ and has costs $C(Q) = 400 + 30Q$. Compare the output, price and profit when it maximises revenue with those when it maximises profit.

1. $R(Q) = 120Q - 3Q^2$ peaks at $Q_R = -\dfrac{120}{2 \cdot (-3)} = 20$, where $P_R = 120 - 3 \cdot 20 = 60$ and $R = 60 \cdot 20 = 1200$.
   *Why:* the vertex formula with $a = -3$ and $b = 120$ gives the top of the revenue hill.
2. Profit there: $1200 - (400 + 30 \cdot 20) = 200$.
   *Why:* profit is revenue minus cost, and cost at 20 units is 1000.
3. $\pi(Q) = 120Q - 3Q^2 - 400 - 30Q = -3Q^2 + 90Q - 400$
   *Why:* subtract the cost function from the revenue function and collect the $Q$ terms.
4. $Q_\pi = -\dfrac{90}{2 \cdot (-3)} = 15$, $P_\pi = 120 - 3 \cdot 15 = 75$ and $\pi(15) = -675 + 1350 - 400 = 275$.
   *Why:* the vertex of the profit parabola gives the best output, and the demand curve gives the price that sells it.
5. The profit-maximising firm sells 5 fewer units at a price 15 higher and earns 75 more profit.
   *Why:* going from 15 to 20 units adds 75 to revenue but 150 to costs, so those extra sales lose money.

```verify
alpha = 120; beta = 3; v = 30; F = 400
R(q) = (alpha - beta*q)*q
C(q) = F + v*q
QR = alpha/(2*beta)
assert QR == 20
assert alpha - beta*QR == 60
assert R(QR) == 1200
assert C(QR) == 1000
assert R(QR) - C(QR) == 200
QP = (alpha - v)/(2*beta)
assert QP == 15
assert alpha - beta*QP == 75
assert (alpha + v)/2 == 75
assert -3*15^2 + 90*15 - 400 == 275
assert R(QP) - C(QP) == 275
assert R(QR) - R(QP) == 75
assert C(QR) - C(QP) == 150
```

## Common mistakes
- Giving the quantity at the top when the question asks for the maximum revenue or profit (QUANTITY_NOT_MAXIMUM).
- Stopping at the price instead of multiplying it by the quantity (PRICE_NOT_REVENUE).
- Multiplying the quantity by $\alpha$, the price at which nothing sells, instead of the price on the demand curve (INTERCEPT_PRICE).
- Forgetting the fixed cost when working out the maximum profit (FORGOT_FIXED_COST).
- Using $-b/a$ instead of $-b/(2a)$ for the vertex (VERTEX_NO_HALF).
- Giving the best quantity when the question asks for the price (QUANTITY_NOT_PRICE).
- Maximising revenue when the question is about profit (REVENUE_NOT_PROFIT).
- Taking $a = \beta$ instead of $a = -\beta$ in $R(Q) = \alpha Q - \beta Q^2$, which gives a negative quantity (SIGN_OF_A).
- Thinking a larger fixed cost changes the best output: it moves the profit curve down, not sideways.

## Practice
- `max-revenue-linear-demand` (difficulty 1): the largest revenue for inverse demand $P = \alpha - \beta Q$; distractors QUANTITY_NOT_MAXIMUM, PRICE_NOT_REVENUE, INTERCEPT_PRICE.
- `max-profit-quadratic` (difficulty 2): the largest profit for $\pi(Q) = -aQ^2 + bQ - c$; distractors QUANTITY_NOT_MAXIMUM, FORGOT_FIXED_COST, VERTEX_NO_HALF.
- `profit-maximising-price` (difficulty 3): the price that maximises profit with linear demand and linear cost; distractors QUANTITY_NOT_PRICE, REVENUE_NOT_PROFIT, VERTEX_NO_HALF.

## Real world
- Pricing: a theatre, a software firm or a toll-road operator chooses between a high price with few customers and a low price with many; with a linear demand estimate, the best price is the vertex of a parabola.
- Targets inside a firm: a sales team rewarded on revenue prefers a lower price and more sales than owners who care about profit; the gap between $P_R$ and $P_\pi$ shows how far apart they are.
- Break-even planning: a firm whose price falls as it expands has two break-even outputs, a minimum scale that covers the fixed cost and a maximum beyond which extra sales lose money.
- Tax revenue: a per-unit tax $t$ raises $t \times Q$, and if the quantity sold falls in a straight line as $t$ rises, tax revenue is a quadratic in $t$ that peaks at a middle tax rate.

---
id: C109
title: Optimisation in one variable
block: C1
coreYear: 1
prerequisites: [C108]
estMinutes: 45
status: draft
economicUses:
  - Profit maximisation by a firm
  - Cost minimisation and efficient scale
  - Revenue maximisation and pricing
  - Choosing a tax rate that raises the most revenue
generators: [profit-max-linear-demand, min-average-cost]
widgets: [profit-hill-tangent]
mistakeCodes:
  FORGOT_COST:
    label: Maximised revenue, not profit
    explanation: Profit is revenue minus cost. Setting marginal revenue to zero ignores the cost of each unit; set marginal revenue equal to marginal cost instead.
  PRICE_EQUALS_COST:
    label: Set price equal to marginal cost
    explanation: P = MC is the rule for a price-taking firm. A firm whose price falls as it sells more must set marginal revenue, which is below the price, equal to marginal cost.
  PRICE_NOT_QUANTITY:
    label: Gave the price instead of the quantity
    explanation: The question asks for the quantity. The price follows by putting that quantity into the demand curve.
  FORGOT_ROOT:
    label: Forgot the square root
    explanation: Setting the derivative to zero gives Q² = F/k. The quantity is the square root of that.
  DERIVATIVE_SLIP:
    label: Differentiated incorrectly
    explanation: The derivative of kQ with respect to Q is k, and the derivative of F/Q is −F/Q². Check each term separately.
  ROOT_OF_FIXED_ONLY:
    label: Took the root of the fixed cost alone
    explanation: The minimum is at Q = √(F/k). Divide F by k before taking the square root.
resources:
  - { title: "Calculus Volume 1, 4.3 Maxima and Minima (OpenStax)", url: "https://openstax.org/books/calculus-volume-1/pages/4-3-maxima-and-minima", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Calculus Volume 1, 4.7 Applied Optimization Problems (OpenStax)", url: "https://openstax.org/books/calculus-volume-1/pages/4-7-applied-optimization-problems", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Principles of Economics 3e, 9.2 How a Profit-Maximizing Monopoly Chooses Output and Price (OpenStax)", url: "https://openstax.org/books/principles-economics-3e/pages/9-2-how-a-profit-maximizing-monopoly-chooses-output-and-price", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
Economics is the study of choices, and most choices are about "how much": how much to produce, what price to set, how many workers to hire, how high to set a tax. Each has a best answer where producing a little more or a little less would make things worse. Calculus finds that point exactly.

## Intuition
Picture profit as a hill plotted against output. At the top the hill is flat: one more unit adds nothing and one fewer loses nothing. So the best output is where the slope, the derivative, is zero. Then check you are on a hilltop, not at the bottom of a valley: the curve must bend downwards there.

## Definition and formulas
For a function $f(x)$:

1. First-order condition: $f'(x^*) = 0$.
2. Second-order condition: $f''(x^*) < 0$ for a maximum, $f''(x^*) > 0$ for a minimum.

For a firm with revenue $R(Q)$ and cost $C(Q)$, profit is $\pi(Q) = R(Q) - C(Q)$ and the first-order condition is
$$\pi'(Q) = 0 \iff MR(Q) = MC(Q).$$

Average cost $AC(Q) = C(Q)/Q$ is lowest where $AC'(Q) = 0$, which is also where $MC = AC$.

## Interactive
::widget{id="profit-hill-tangent"}

Move the **Output Q** slider along the profit hill $\pi(Q) = -2Q^2 + 120Q - 800$ from Example 1. The gold line is the tangent at the point, and the panel shows its slope, the marginal profit $\pi'(Q) = -4Q + 120$. Notice that the tangent rises to the left of the top, falls to the right of it, and is flat exactly at the top. Check: at $Q = 20$ the slope is 40; at $Q = 30$ it is 0 and the panel shows the maximum profit, 1,000.

## Worked examples

### Example 1 (easy): a profit hill
Profit is $\pi(Q) = -2Q^2 + 120Q - 800$. Which output maximises it, and what is the maximum profit?

1. $\pi'(Q) = -4Q + 120 = 0 \Rightarrow Q^* = 30$
   *Why:* at the top of the hill the slope is zero.
2. $\pi''(Q) = -4 < 0$, so this is a maximum.
   *Why:* a negative second derivative means the curve bends downwards.
3. $\pi(30) = -1800 + 3600 - 800 = 1000$
   *Why:* put the best output back into the profit function.

```verify
Q = 120/4
assert Q == 30
assert -2*Q^2 + 120*Q - 800 == 1000
assert (-2*31^2 + 120*31 - 800) < 1000
```

### Example 2 (medium): a firm with market power
A firm faces $P = 100 - 2Q$ and has costs $C(Q) = 500 + 20Q$. Find the profit-maximising output, price and profit.

1. Revenue $R = (100 - 2Q)Q$, so $MR = 100 - 4Q$; $MC = 20$.
   *Why:* revenue depends on the price, which falls as the firm sells more.
2. $100 - 4Q = 20 \Rightarrow Q^* = 20$
   *Why:* profit is highest where marginal revenue equals marginal cost.
3. $P = 100 - 40 = 60$ and $\pi = 60 \cdot 20 - 500 - 20 \cdot 20 = 300$.
   *Why:* the price comes from the demand curve at the chosen output.

```verify
a = 100; b = 2; c = 20; F = 500
Q = (a - c)/(2*b)
P = a - b*Q
profit = P*Q - F - c*Q
assert Q == 20
assert P == 60
assert profit == 300
```

### Example 3 (hard): efficient scale
Total cost is $C(Q) = 1250 + 10Q + 2Q^2$. At what output is average cost lowest, and what is it there?

1. $AC(Q) = \dfrac{1250}{Q} + 10 + 2Q$
   *Why:* average cost is total cost per unit.
2. $AC'(Q) = -\dfrac{1250}{Q^2} + 2 = 0 \Rightarrow Q^2 = 625 \Rightarrow Q^* = 25$
   *Why:* average cost first falls as fixed cost is spread, then rises as the $Q^2$ term takes over.
3. $AC(25) = 50 + 10 + 50 = 110$, and $MC(25) = 10 + 4 \cdot 25 = 110$.
   *Why:* at the bottom of the average-cost curve, marginal cost equals average cost.

```verify
F = 1250; c = 10; k = 2
Q = sqrt(F/k)
AC = F/Q + c + k*Q
assert Q == 25
assert AC == 110
assert c + 2*k*Q == AC
```

## Common mistakes
- Maximising revenue instead of profit (FORGOT_COST).
- Setting price, not marginal revenue, equal to marginal cost (PRICE_EQUALS_COST).
- Giving the price when the quantity was asked (PRICE_NOT_QUANTITY).
- Forgetting the square root (FORGOT_ROOT).
- Differentiating a term wrongly (DERIVATIVE_SLIP).
- Taking the root of the fixed cost alone (ROOT_OF_FIXED_ONLY).

## Practice
- `profit-max-linear-demand` (difficulty 1): profit-maximising quantity with linear demand and linear cost.
- `min-average-cost` (difficulty 2): output that minimises average cost.

## Real world
- Firms with market power, from airlines to software companies, choose prices and quantities where marginal revenue meets marginal cost.
- Efficient scale: the output with the lowest average cost tells a regulator how big a utility or hospital should be.
- Taxes: the Laffer curve idea, that tax revenue first rises and then falls with the rate, is an optimisation in one variable.
- Agriculture and energy: producers choose how much fertiliser or fuel to use where the extra output just pays for the extra input.

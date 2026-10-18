---
id: F10
title: Inverse and composite functions
block: F
coreYear: 1
prerequisites: [F03]
estMinutes: 40
status: draft
economicUses:
  - "Inverse demand: the price at which a given quantity sells"
  - Cost of output through inputs, from workers to output to cost
  - Currency conversions and taxes applied one after another
  - Working back from a budget or a target to the input needed
generators: [inverse-demand-price, composite-cost-of-labour, labour-for-cost-budget]
widgets: []
mistakeCodes:
  QUANTITY_AS_PRICE:
    label: Put the quantity in as if it were a price
    explanation: Q = a − bP takes a price and gives a quantity. When the quantity is given and the price is unknown, solve a − bP = Q₀ for P (or use the inverse demand); do not substitute the quantity in place of P.
  MULTIPLIED_BY_SLOPE:
    label: Multiplied by b instead of dividing
    explanation: From bP = a − Q the price is (a − Q)/b. The opposite of multiplying by b is dividing by b, so multiplying again moves you further from the answer.
  SIGN_SLIP:
    label: Sign slip when solving for P
    explanation: Moving Q across the equals sign changes its sign, so Q = a − bP becomes bP = a − Q, not a + Q. Check by putting your price back into the demand function.
  DIVIDED_ONE_TERM:
    label: Divided only one term by b
    explanation: Dividing a − Q by b divides both terms, giving P = a/b − Q/b. Dividing only Q by b gives a − Q/b, which is not the inverse.
  SKIPPED_INNER:
    label: Skipped the inner function
    explanation: C(Q(L)) needs the output Q(L) first. Putting the number of workers straight into the cost function treats each worker as one unit of output.
  WRONG_ORDER:
    label: Applied the functions in the wrong order
    explanation: In C(Q(L)) the inner function Q acts first and C acts on its result. Q(C(L)) is a different composite, and here it has no economic meaning.
  MULTIPLIED_FUNCTIONS:
    label: Multiplied the two functions
    explanation: C(Q(L)) means "put Q(L) into C", not "C times Q". Composition feeds the output of one function into the next; it is not a product.
  OUTPUT_NOT_WORKERS:
    label: Stopped at the output
    explanation: Undoing the cost function gives the output that the budget pays for. The question asks for workers, so undo the production function as well.
  FIXED_COST_IGNORED:
    label: Forgot to take away the fixed cost
    explanation: To undo C(Q) = F + cQ, first subtract the fixed cost F, then divide by c. Dividing the whole budget by c treats the fixed cost as if it were zero.
  APPLIED_NOT_INVERTED:
    label: Applied the production function instead of its inverse
    explanation: To go from output back to workers you need the inverse of Q(L). For Q = kL divide by k; for Q = k√L divide by k and then square.
  FORGOT_SQUARE:
    label: Forgot to square
    explanation: If Q = k√L, then Q/k is √L, not L. Square it to get the number of workers.
  RECIPROCAL_NOT_INVERSE:
    label: Read f⁻¹ as 1/f
    explanation: f⁻¹ is the inverse function, the one that undoes f. It is not the reciprocal 1/f(x); the −1 is notation, not a power.
resources:
  - { title: "College Algebra 2e, 3.4 Composition of Functions (OpenStax)", url: "https://openstax.org/books/college-algebra-2e/pages/3-4-composition-of-functions", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "College Algebra 2e, 3.7 Inverse Functions (OpenStax)", url: "https://openstax.org/books/college-algebra-2e/pages/3-7-inverse-functions", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Principles of Economics 3e, 3.1 Demand, Supply, and Equilibrium in Markets for Goods and Services (OpenStax)", url: "https://openstax.org/books/principles-economics-3e/pages/3-1-demand-supply-and-equilibrium-in-markets-for-goods-and-services", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
A demand function tells you how many tickets sell at a given price. A concert promoter with 500 seats asks the opposite question: at what price will exactly 500 tickets sell? Answering it means running the demand function backwards, which is an inverse function. Many economic quantities are also built in stages: workers produce output, output has a cost, and the cost is converted into another currency. Each stage is a function, and the whole chain is a composite function.

## Intuition
Think of a function as a machine: put an input in, get one output out. A composite function is two machines in a row, where the output of the first becomes the input of the second. The order matters, just as putting on socks and then shoes is not the same as shoes and then socks.

An inverse function runs a machine backwards: given the output, it tells you the input. That only works if no two inputs ever give the same output. If two different prices brought in the same revenue, then knowing the revenue would not tell you which price was charged.

## Definition and formulas
**Composite function.** Apply $g$ first, then $f$:
$$(f \circ g)(x) = f(g(x))$$
$g$ is the inner function and $f$ the outer one. The composite is defined where $x$ is in the domain of $g$ and $g(x)$ is in the domain of $f$. In general $f \circ g \neq g \circ f$: with $f(x) = x^2$ and $g(x) = x + 1$, $f(g(2)) = 9$ but $g(f(2)) = 5$.

**Decomposing.** A complicated function can often be split into simple steps. For example, $h(x) = \sqrt{3x + 1}$ is $f(g(x))$ with inner $g(x) = 3x + 1$ and outer $f(u) = \sqrt{u}$.

**One-to-one.** A function is one-to-one if different inputs always give different outputs. On a graph: every horizontal line meets the curve at most once.

**Inverse function.** If $f$ is one-to-one, its inverse $f^{-1}$ undoes it:
$$f^{-1}(y) = x \iff f(x) = y, \qquad f(f^{-1}(y)) = y, \qquad f^{-1}(f(x)) = x.$$

- To find it: write $y = f(x)$ and solve for $x$ in terms of $y$.
- The domain of $f^{-1}$ is the range of $f$, and the range of $f^{-1}$ is the domain of $f$.
- The graph of $f^{-1}$ is the graph of $f$ reflected in the line $y = x$.
- $f^{-1}(x)$ is not $\dfrac{1}{f(x)}$: the $-1$ is notation, not a power.

**Restricting the domain.** $f(x) = x^2$ is not one-to-one, because $f(-3) = f(3) = 9$. On the domain $x \ge 0$ it is, and its inverse is $\sqrt{y}$. Revenue $R(P) = P(100 - P)$ has the same problem: $R(20) = R(80) = 1{,}600$. Restricted to prices $0 \le P \le 50$ it becomes one-to-one and has an inverse.

**Inverse of a composite.** Undo the last step first:
$$(f \circ g)^{-1} = g^{-1} \circ f^{-1}$$

**Inverse demand.** Demand $Q = a - bP$ (with $b > 0$) gives price as a function of quantity:
$$P(Q) = \frac{a - Q}{b} = \frac{a}{b} - \frac{Q}{b}$$
Demand is defined for $0 \le P \le a/b$ with $0 \le Q \le a$; inverse demand swaps them. Economists draw demand with the price on the vertical axis, so the familiar demand diagram is the graph of the inverse demand function.

## Interactive
An interactive graph that reflects a function in the line $y = x$ is planned for this topic. Until then, use Practice: every problem uses new numbers.

## Worked examples

### Example 1 (easy): VAT and a voucher in two orders
A jacket costs 80 before VAT. Adding VAT at 20 % is the function $V(x) = 1.2x$; a voucher taking 10 off is $D(x) = x - 10$. Compare $D(V(80))$, VAT first and then the voucher, with $V(D(80))$, the voucher first and then VAT.

1. $V(80) = 1.2 \cdot 80 = 96$, so $D(V(80)) = 96 - 10 = 86$
   *Why:* in $D(V(x))$ the inner function $V$ acts first.
2. $D(80) = 80 - 10 = 70$, so $V(D(80)) = 1.2 \cdot 70 = 84$
   *Why:* now the voucher comes off before VAT is added.
3. $D(V(x)) = 1.2x - 10$ and $V(D(x)) = 1.2(x - 10) = 1.2x - 12$, so the two orders always differ by $2$.
   *Why:* when VAT is added after the voucher, the 10 taken off is never taxed, which saves 20 % of 10.
4. With a 25 % discount $S(x) = 0.75x$ instead of the voucher: $S(V(80)) = V(S(80)) = 72$.
   *Why:* two percentage changes are both multiplications, and multiplying by 1.2 and by 0.75 gives the same result in either order.

```verify
V80 = 1.2*80
assert abs(V80 - 96) < 1e-9
assert abs((V80 - 10) - 86) < 1e-9
assert abs(1.2*(80 - 10) - 84) < 1e-9
x = 137
assert abs((1.2*x - 10) - 1.2*(x - 10) - 2) < 1e-9
assert abs(0.75*(1.2*80) - 72) < 1e-9
assert abs(1.2*(0.75*80) - 72) < 1e-9
```

### Example 2 (medium): inverse demand
Daily demand for bicycle rentals is $Q = 120 - 4P$, where $P$ is the price of one rental. Find the inverse demand function, the price at which exactly 80 bicycles are rented, and the domain and range of the inverse.

1. $4P = 120 - Q \;\Rightarrow\; P(Q) = 30 - \dfrac{Q}{4}$
   *Why:* solving for the price turns "quantity as a function of price" into "price as a function of quantity".
2. $P(80) = 30 - \dfrac{80}{4} = 10$
   *Why:* inverse demand takes a quantity and gives the price at which that quantity is rented.
3. Check: $Q(10) = 120 - 4 \cdot 10 = 80$
   *Why:* $Q(P(80)) = 80$, because a function and its inverse undo each other.
4. Demand is defined for $0 \le P \le 30$ and gives $0 \le Q \le 120$. So inverse demand has domain $0 \le Q \le 120$ and range $0 \le P \le 30$.
   *Why:* the inverse swaps inputs and outputs, so the domain and range swap. Its graph, with $P$ on the vertical axis, is the demand line reflected in $y = x$.

```verify
a = 120; b = 4; Q0 = 80
P0 = (a - Q0)/b
assert P0 == 10
assert a - b*P0 == Q0
assert a/b == 30
# the inverse undoes demand at any other price too
P1 = 7
assert (a - (a - b*P1))/b == P1
```

### Example 3 (hard): workers, output, cost and back again
A workshop with $L$ workers produces $Q(L) = 5\sqrt{L}$ units, and producing $Q$ units costs $C(Q) = 1000 + 8Q$. (a) What does it cost to produce what 64 workers make? (b) How many workers make the total cost exactly 1480?

1. $Q(64) = 5\sqrt{64} = 40$, then $C(40) = 1000 + 8 \cdot 40 = 1320$
   *Why:* in $C(Q(L))$ the inner function acts first: workers give output, and output has a cost.
2. As one function: $C(Q(L)) = 1000 + 8 \cdot 5\sqrt{L} = 1000 + 40\sqrt{L}$, and $1000 + 40\sqrt{64} = 1320$ again.
   *Why:* replacing $Q$ in the cost function by $5\sqrt{L}$ gives cost directly in terms of workers.
3. $1000 + 8Q = 1480 \;\Rightarrow\; Q = \dfrac{480}{8} = 60$
   *Why:* the cost function was applied last, so it is undone first: $(C \circ Q)^{-1} = Q^{-1} \circ C^{-1}$.
4. $5\sqrt{L} = 60 \;\Rightarrow\; \sqrt{L} = 12 \;\Rightarrow\; L = 12^2 = 144$
   *Why:* the inverse of $Q = 5\sqrt{L}$ is $L = (Q/5)^2$. Squaring is one-to-one only on numbers that are not negative, which is fine here: output and workers are never negative.
5. Check: $C(Q(144)) = 1000 + 40\sqrt{144} = 1480$
   *Why:* putting the answer through both functions gives back the budget.

```verify
k = 5; F = 1000; c = 8
Q1 = k*sqrt(64)
assert Q1 == 40
assert F + c*Q1 == 1320
assert F + c*k*sqrt(64) == 1320
B = 1480
Q2 = (B - F)/c
assert Q2 == 60
L2 = (Q2/k)^2
assert L2 == 144
assert F + c*k*sqrt(L2) == B
```

## Common mistakes
- Putting the given quantity into $Q = a - bP$ as if it were a price (QUANTITY_AS_PRICE).
- Multiplying by $b$ instead of dividing when solving for $P$ (MULTIPLIED_BY_SLOPE).
- Writing $bP = a + Q$ instead of $bP = a - Q$ (SIGN_SLIP).
- Dividing only one term by $b$, as in $a - Q/b$ (DIVIDED_ONE_TERM).
- Putting the number of workers straight into the cost function (SKIPPED_INNER).
- Working out $Q(C(L))$ when $C(Q(L))$ was asked (WRONG_ORDER).
- Reading $C(Q(L))$ as $C$ times $Q$ (MULTIPLIED_FUNCTIONS).
- Stopping at the output when the question asks for workers (OUTPUT_NOT_WORKERS).
- Dividing the whole budget by the cost per unit and forgetting the fixed cost (FIXED_COST_IGNORED).
- Applying the production function to the output instead of inverting it (APPLIED_NOT_INVERTED).
- Forgetting to square after finding $\sqrt{L}$ (FORGOT_SQUARE).
- Reading $f^{-1}(x)$ as $1/f(x)$ (RECIPROCAL_NOT_INVERSE).
- Looking for an inverse of a function that is not one-to-one: check with the horizontal line test, and restrict the domain if needed.

## Practice
- `inverse-demand-price` (difficulty 1): the price at which exactly $Q_0$ units sell, from $Q = a - bP$; distractors QUANTITY_AS_PRICE, MULTIPLIED_BY_SLOPE, SIGN_SLIP, DIVIDED_ONE_TERM.
- `composite-cost-of-labour` (difficulty 2): $C(Q(L))$ for output $Q = kL$ or $Q = k\sqrt{L}$ and cost $C(Q) = F + cQ$; distractors SKIPPED_INNER, WRONG_ORDER, MULTIPLIED_FUNCTIONS.
- `labour-for-cost-budget` (difficulty 3): the number of workers whose output costs exactly a given budget, by inverting the composite; distractors OUTPUT_NOT_WORKERS, FIXED_COST_IGNORED, APPLIED_NOT_INVERTED, FORGOT_SQUARE.

## Real world
- Pricing: demand is usually estimated as quantity depending on price, but models of firms that choose how much to sell use inverse demand, the price as a function of quantity. Moving between the two is inverting a function.
- Currency conversion: changing manat into dollars and then dollars into euros is a composite of two functions. Banks buy and sell at different rates, so converting there and back loses a little: the bank's reverse conversion is not quite the inverse.
- Taxes in sequence: in many countries VAT is charged on a price that already includes excise duty, so the duty itself is taxed. The final price is VAT applied to (price + duty), and doing the steps in the other order would give a different number.
- Planning: how many workers, machines or litres of fuel a target or a budget requires is an inverse question, usually about a chain of functions such as inputs to output to cost.

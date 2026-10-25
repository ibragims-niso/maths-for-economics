---
id: C106
title: Marginal analysis
block: C1
coreYear: 1
prerequisites: [C103]
estMinutes: 45
status: draft
economicUses:
  - "Deciding whether one more unit, batch or order is worth producing"
  - Pricing by firms whose sales fall when they raise the price
  - Hiring decisions from the marginal product of labour
  - How much of an extra unit of income households spend
searchTerms:
  - "Marginal cost"
  - "Marginal revenue"
  - "Marginal analysis"
generators: [marginal-revenue-linear-demand, cost-of-one-more-unit, marginal-profit-at-output]
widgets: [marginal-revenue-lines]
mistakeCodes:
  MR_EQUALS_PRICE:
    label: Used the price as marginal revenue
    explanation: To sell one more unit the firm must lower its price on every unit it sells, so marginal revenue is below the price. For P = a − bQ, MR = a − 2bQ, not a − bQ.
  HALF_SLOPE:
    label: Halved the slope instead of doubling it
    explanation: Revenue is (a − bQ)Q = aQ − bQ², and the derivative of bQ² is 2bQ. The MR line is twice as steep as the demand line, not half as steep.
  TOTAL_NOT_MARGINAL:
    label: Gave a total, not a marginal value
    explanation: Revenue, cost and profit are totals. A marginal value is how much the total changes when output rises by one unit, which the derivative measures.
  MARGINAL_FOR_EXACT:
    label: Gave the marginal-cost estimate, not the exact change
    explanation: C′(Q) estimates the cost of one more unit. The exact extra cost is C(Q + 1) − C(Q); the two differ because marginal cost keeps changing between Q and Q + 1.
  AVERAGE_NOT_MARGINAL:
    label: Used average cost instead of the extra cost
    explanation: C(Q)/Q is the cost per unit of all the units made so far. The cost of one more unit compares total cost before and after that unit.
  REVERSED_DIFFERENCE:
    label: Subtracted the wrong way round
    explanation: Marginal profit is MR − MC. Computing MC − MR flips the sign, and with it the decision to expand or cut back.
  POWER_RULE_SLIP:
    label: Differentiated Q² as Q
    explanation: The derivative of a term kQ² is 2kQ, not kQ, so the marginal cost of C = F + cQ + kQ² is c + 2kQ.
resources:
  - { title: "Calculus Volume 1, 3.4 Derivatives as Rates of Change (OpenStax)", url: "https://openstax.org/books/calculus-volume-1/pages/3-4-derivatives-as-rates-of-change", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Principles of Economics 3e, 7.3 Costs in the Short Run (OpenStax)", url: "https://openstax.org/books/principles-economics-3e/pages/7-3-costs-in-the-short-run", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Principles of Economics 3e, 9.2 How a Profit-Maximizing Monopoly Chooses Output and Price (OpenStax)", url: "https://openstax.org/books/principles-economics-3e/pages/9-2-how-a-profit-maximizing-monopoly-chooses-output-and-price", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
A café already bakes ten batches of pastries a day. Should it bake an eleventh? The owner does not need the total cost of the whole day; she needs to know what the *extra* batch adds to cost and what it adds to sales. A phone-case maker thinking of selling a few more cases has a similar question, with a twist: to sell more it must cut its price. A workshop manager asks whether one more worker pays for her wage. Economists call these decisions *at the margin*, and the derivative is the tool that answers them.

## Intuition
"Marginal" means "one more". Marginal cost is roughly the cost of the next unit, marginal revenue the revenue it brings in, and marginal product the extra output from one more worker. The derivative is the rate of change at the current point, so it gives these numbers without having to work out totals twice and subtract. Because the derivative is a slope at a point, it is an approximation to the one-unit change; when the curve bends, the two differ a little.

The decision rule is common sense. If one more unit brings in more than it costs, profit goes up, so produce it. If it costs more than it brings in, produce less. A firm that has to lower its price to sell more must also count what the price cut loses on the units it was already selling. That is why marginal revenue is below the price.

## Definition and formulas
For a cost function $C(Q)$, revenue $R(Q)$ and profit $\pi(Q) = R(Q) - C(Q)$:

- **Marginal cost** $MC(Q) = C'(Q)$
- **Marginal revenue** $MR(Q) = R'(Q)$
- **Marginal profit** $\pi'(Q) = MR(Q) - MC(Q)$

**The derivative and one more unit.** For a step of one unit,
$$C(Q + 1) - C(Q) \approx C'(Q).$$
The approximation is exact for a straight-line cost. For $C(Q) = F + cQ + kQ^2$ the exact extra cost is $c + k(2Q + 1)$, which is $C'(Q) + k$: a little more than marginal cost because marginal cost is rising across the unit.

**Marginal revenue for linear demand.** With inverse demand $P = a - bQ$, revenue is $R = (a - bQ)Q = aQ - bQ^2$, so
$$MR = a - 2bQ.$$
The MR line starts at the same height $a$ as demand but is twice as steep, so it reaches zero at $Q = a/(2b)$, halfway to where demand reaches zero. Revenue is highest there.

**Why MR is below the price.** By the product rule, for any demand curve $P(Q)$,
$$MR = \frac{d}{dQ}\big(P(Q)\,Q\big) = P + Q\,\frac{dP}{dQ}.$$
The first term is the price the extra unit sells for; the second is the price cut on the $Q$ units already sold, which is negative when demand slopes down. Writing $\varepsilon = \dfrac{dQ}{dP}\cdot\dfrac{P}{Q}$ for the price elasticity of demand (studied in C107), this becomes
$$MR = P\left(1 + \frac{1}{\varepsilon}\right).$$

**The decision rule.** At the current output $Q_0$:

- $MR > MC$: one more unit adds to profit, so expand.
- $MR < MC$: the last unit lost money, so cut back.

The output where the two are equal, and the check that it is a maximum, belong to C109.

**Marginal and average cost.** Average cost is $AC(Q) = C(Q)/Q$. By the quotient rule,
$$AC'(Q) = \frac{Q\,C'(Q) - C(Q)}{Q^2} = \frac{MC - AC}{Q}.$$
So average cost falls while $MC < AC$ and rises while $MC > AC$: the MC curve cuts the AC curve at the lowest point of AC. It works like exam marks: a new mark below your average pulls the average down, one above it pulls it up.

**Marginal product of labour.** If output is $Q = f(L)$ with $L$ workers, the marginal product of labour is $MPL = f'(L)$, the extra output from one more worker. For $Q = A L^{\alpha}$ with $0 < \alpha < 1$,
$$MPL = \alpha A L^{\alpha - 1} = \alpha\,\frac{Q}{L},$$
which falls as $L$ rises: **diminishing marginal product**. Each new worker still adds output, just less than the one before. A firm that sells its output at price $p$ and pays a wage $w$ gains from hiring one more worker when $p \cdot MPL > w$.

**Marginal propensity to consume.** If consumption depends on income, $C = C(Y)$, then $MPC = C'(Y)$, the share of an extra unit of income that is spent. For $C = 50 + 0.8Y$ it is 0.8 at every income (F11). For a curved consumption function such as $C = 10 + 4\sqrt{Y}$ it is $2/\sqrt{Y}$: 0.4 at $Y = 25$ but 0.2 at $Y = 100$.

## Interactive
::widget{id="marginal-revenue-lines"}

The graph shows the demand line $P = 120 - 2Q$ from Example 2 (lilac) and its marginal revenue line $MR = 120 - 4Q$ (gold); the shaded rectangle is revenue, price times quantity. Move the **Quantity Q** slider and watch the two points: the gold MR point is always below the demand point, and falls twice as fast. The caption splits the exact change from selling one more unit into the new unit's price minus the price cut on the earlier units. Check: at $Q = 20$ the panel shows a price of 80, marginal revenue 40 and revenue 1,600; at $Q = 30$ MR is 0 and revenue reaches its peak, 1,800; beyond that MR is negative and the rectangle shrinks.

## Worked examples

### Example 1 (easy): the café's eleventh batch
A café's daily cost of baking $Q$ batches of pastries is $C(Q) = 60 + 8Q + 0.5Q^2$. It bakes 10 batches now and sells every batch to a shop for 24. Estimate the cost of an eleventh batch with marginal cost, find the exact extra cost, and decide whether to bake it.

1. $MC(Q) = C'(Q) = 8 + Q$, so $MC(10) = 18$
   *Why:* marginal cost is the rate at which cost rises at the current output, an estimate of the cost of one more batch.
2. $C(10) = 60 + 80 + 50 = 190$ and $C(11) = 60 + 88 + 60.5 = 208.5$
   *Why:* the exact extra cost compares the totals with and without the eleventh batch.
3. $C(11) - C(10) = 18.5$
   *Why:* this is the exact cost of the eleventh batch. It is 0.5 more than the estimate because marginal cost rises from 18 to 19 across the batch; 0.5 is the coefficient of $Q^2$.
4. $24 - 18.5 = 5.5 > 0$, so bake it.
   *Why:* the batch brings in 24 and costs 18.5, so profit rises by 5.5. The price does not depend on how much the café bakes, so here marginal revenue is simply 24.

```verify
C(q) = 60 + 8*q + 0.5*q^2
MC(q) = 8 + q
assert MC(10) == 18
assert C(10) == 190
assert C(11) == 208.5
extra = C(11) - C(10)
assert extra == 18.5
assert extra - MC(10) == 0.5
assert MC(11) == 19
# The derivative estimate, checked numerically.
assert abs((C(10.000001) - C(10))/0.000001 - MC(10)) < 0.0001
assert 24 - extra == 5.5
```

### Example 2 (medium): marginal revenue on a demand line
A firm sells phone cases and faces inverse demand $P = 120 - 2Q$, where $Q$ is cases per week. It sells 20 cases now, and each extra case costs 30 to make. Find the price, revenue and marginal revenue at $Q = 20$, compare MR with the exact gain from the 21st case, and decide whether to sell more.

1. $P(20) = 120 - 40 = 80$ and $R(20) = 80 \times 20 = 1{,}600$
   *Why:* revenue is the price the demand curve allows times the quantity sold.
2. $R(Q) = 120Q - 2Q^2$, so $MR(Q) = 120 - 4Q$ and $MR(20) = 40$
   *Why:* the MR line has the same intercept as demand and twice the slope.
3. Exact: $R(21) = 78 \times 21 = 1{,}638$, so $R(21) - R(20) = 38 = 78 - 20 \times 2$
   *Why:* the 21st case sells for 78, but the price of the 20 cases already sold falls by 2 each, a loss of 40. MR = 40 is the derivative's estimate of this change.
4. $\varepsilon = \dfrac{dQ}{dP}\cdot\dfrac{P}{Q} = -\dfrac{1}{2}\cdot\dfrac{80}{20} = -2$, and $MR = 80\left(1 + \dfrac{1}{-2}\right) = 40$
   *Why:* demand written the other way round is $Q = 60 - P/2$, so $dQ/dP = -1/2$. The elasticity formula gives the same MR (elasticity is the subject of C107).
5. $MR - MC = 40 - 30 = 10 > 0$, so sell more.
   *Why:* one more case adds about 10 to profit. The firm should keep expanding while MR exceeds MC; finding exactly where to stop is C109.

```verify
a = 120; b = 2; Q = 20
P = a - b*Q
R(q) = (a - b*q)*q
MR = a - 2*b*Q
assert P == 80
assert R(Q) == 1600
assert MR == 40
assert R(21) == 1638
assert R(21) - R(20) == 38
assert (a - b*21) - b*Q == 38
assert abs((R(20.000001) - R(20))/0.000001 - MR) < 0.0001
eps = (-1/b)*P/Q
assert eps == -2
assert P*(1 + 1/eps) == MR
MC = 30
assert MR - MC == 10
```

### Example 3 (hard): hiring with diminishing marginal product
A workshop's daily output with $L$ workers is $Q = 40\sqrt{L}$ units. Each unit sells for 12 and the daily wage is 54. It employs 16 workers. Find the marginal and average product of labour, check the marginal product against the exact gain from a 17th worker, and decide whether to hire at 16 and at 25 workers.

1. $MPL = \dfrac{dQ}{dL} = 40 \cdot \tfrac{1}{2} L^{-1/2} = \dfrac{20}{\sqrt{L}}$
   *Why:* write $\sqrt{L} = L^{1/2}$ and use the power rule.
2. At $L = 16$: $Q = 160$, $MPL = 20/4 = 5$ and $APL = 160/16 = 10$
   *Why:* the average product is output per worker. For $Q = AL^{\alpha}$, $MPL = \alpha \cdot APL$, here half of it.
3. Exact: $Q(17) - Q(16) = 40(\sqrt{17} - 4) \approx 4.92$
   *Why:* the 17th worker adds a little less than 5 because the marginal product falls as the worker joins.
4. Value of the 17th worker: $12 \times 5 = 60 > 54$, so hire.
   *Why:* the extra worker produces about 5 units worth 12 each, more than the wage.
5. At $L = 25$: $MPL = 20/5 = 4$, worth $12 \times 4 = 48 < 54$, so do not hire.
   *Why:* $MPL$ falls as $L$ rises (diminishing marginal product). Its value drops below the wage between 19 and 20 workers, so that is where hiring stops paying.

```verify
Q(L) = 40*sqrt(L)
MPL(L) = 20/sqrt(L)
assert Q(16) == 160
assert MPL(16) == 5
assert Q(16)/16 == 10
assert MPL(16) == 0.5*Q(16)/16
assert abs((Q(16.000001) - Q(16))/0.000001 - MPL(16)) < 0.0001
assert abs(Q(17) - Q(16) - 4.92) < 0.005
assert 12*MPL(16) == 60
assert MPL(25) == 4
assert 12*MPL(25) == 48
assert 12*MPL(19) > 54
assert 12*MPL(20) < 54
```

## Common mistakes
- Using the price as marginal revenue for a firm whose price falls when it sells more (MR_EQUALS_PRICE).
- Writing $MR = a - bQ/2$: the MR line is twice as steep as demand, not half as steep (HALF_SLOPE).
- Giving total revenue, total cost or total profit when the question asks for a marginal value (TOTAL_NOT_MARGINAL).
- Giving $C'(Q)$ when the exact extra cost $C(Q + 1) - C(Q)$ is asked; the derivative is only an estimate (MARGINAL_FOR_EXACT).
- Using average cost $C(Q)/Q$ as the cost of one more unit (AVERAGE_NOT_MARGINAL).
- Computing $MC - MR$ instead of $MR - MC$ and so reading the decision backwards (REVERSED_DIFFERENCE).
- Differentiating $kQ^2$ as $kQ$ instead of $2kQ$ (POWER_RULE_SLIP).
- Reading diminishing marginal product as falling output: output still rises with each worker, only by less each time.
- Forgetting that fixed cost has no effect on marginal cost: it does not change with output, so its derivative is 0.

## Practice
- `marginal-revenue-linear-demand` (difficulty 1): marginal revenue $a - 2bQ_0$ for inverse demand $P = a - bQ$; distractors MR_EQUALS_PRICE, HALF_SLOPE, TOTAL_NOT_MARGINAL.
- `cost-of-one-more-unit` (difficulty 2): the exact extra cost $C(Q_0 + 1) - C(Q_0)$ for a quadratic or cubic cost, next to the marginal-cost estimate $C'(Q_0)$; distractors MARGINAL_FOR_EXACT, TOTAL_NOT_MARGINAL, AVERAGE_NOT_MARGINAL.
- `marginal-profit-at-output` (difficulty 3): marginal profit $MR - MC$ at a given output with linear demand and quadratic cost, and whether to expand; distractors MR_EQUALS_PRICE, REVERSED_DIFFERENCE, POWER_RULE_SLIP, TOTAL_NOT_MARGINAL.

## Real world
- Airlines and hotels: an empty seat or room costs almost nothing extra to fill, so firms sell late tickets and rooms cheaply as long as the price covers the small marginal cost.
- Electricity markets: power stations offer their output at roughly their marginal cost (mostly fuel), and the market price each hour is set by the marginal cost of the last station needed to meet demand.
- Labour markets: firms hire until the value of the marginal product of the last worker falls to the wage, which is why wages tend to rise with productivity across industries and countries.
- Fiscal policy: governments and central banks estimate the marginal propensity to consume to judge how much of a tax cut or a cash transfer will be spent rather than saved (see F11 for multipliers).

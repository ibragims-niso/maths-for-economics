---
id: C114
title: Consumer and producer surplus
block: C1
coreYear: 1
prerequisites: [C113, F05]
estMinutes: 45
status: draft
economicUses:
  - Measuring the gains from trade in a market
  - "Welfare cost of taxes: tax revenue and deadweight loss"
  - Judging price ceilings and floors, such as rent controls or minimum prices
  - Cost-benefit analysis of policies that change prices
searchTerms:
  - "Economic applications of the definite integral"
  - "Consumer surplus"
  - "Producer surplus"
generators: [consumer-surplus-linear-equilibrium, deadweight-loss-per-unit-tax, consumer-surplus-quadratic-demand]
widgets: [surplus-tax-welfare]
mistakeCodes:
  SPENDING_NOT_SURPLUS:
    label: Gave spending instead of surplus
    explanation: P × Q is what buyers pay, a rectangle under the price line. Consumer surplus is the area above the price line and below the demand curve.
  FORGOT_SPENDING:
    label: Did not subtract spending
    explanation: The integral of demand from 0 to Q is the total value buyers place on the units. Consumer surplus is that value minus what they pay, P × Q.
  USED_SUPPLY:
    label: Used the supply curve
    explanation: The area between the price and the supply curve is producer surplus. Consumer surplus lies between the demand curve and the price.
  FORGOT_HALF:
    label: Forgot the ½ in a triangle
    explanation: With straight lines the surplus areas are triangles, ½ × base × height. Base times height alone is the rectangle around the triangle, twice too big.
  TAX_REVENUE_NOT_DWL:
    label: Gave the tax revenue, not the deadweight loss
    explanation: Tax revenue t × Qₜ is not lost to society; the government collects it. The deadweight loss is only the triangle between the curves from Qₜ to Q*.
  CONSUMER_LOSS_ONLY:
    label: Gave the fall in consumer surplus
    explanation: Most of what buyers lose goes to the government as tax revenue. The deadweight loss is the fall in total surplus, CS + PS + revenue, which is much smaller.
  TRIANGLE_FORMULA:
    label: Used the triangle formula on a curve
    explanation: ½ × base × height works only when demand is a straight line. For a curved demand curve, integrate it from 0 to Q₀ and subtract P₀Q₀.
resources:
  - { title: "Principles of Economics 3e, 3.5 Demand, Supply, and Efficiency (OpenStax)", url: "https://openstax.org/books/principles-economics-3e/pages/3-5-demand-supply-and-efficiency", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Principles of Economics 3e, 3.4 Price Ceilings and Price Floors (OpenStax)", url: "https://openstax.org/books/principles-economics-3e/pages/3-4-price-ceilings-and-price-floors", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Calculus Volume 1, 6.1 Areas between Curves (OpenStax)", url: "https://openstax.org/books/calculus-volume-1/pages/6-1-areas-between-curves", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
A government plans a fuel tax. It will raise money, but drivers pay more, fuel stations sell less and some trips are no longer made. Is the tax worth it? To answer, economists need a number for how much buyers and sellers gain from a market and how much of that gain the tax destroys. Consumer and producer surplus are those numbers, and a definite integral (C113) measures them.

## Intuition
Each buyer has a *willingness to pay*: the most they would pay for one more unit. Line the buyers up from the keenest to the least keen and you get the inverse demand curve $P = D(Q)$: its height at $Q$ is what the buyer of the $Q$-th unit would pay. If that buyer pays only the market price, the difference is a gain to them. Add up these gains over all units bought and you get the area between the demand curve and the price line: the **consumer surplus**.

Sellers work the same way in reverse. The inverse supply curve $P = S(Q)$ shows the least each seller would accept. Selling at the market price gives them the difference, and the area between the price line and the supply curve is the **producer surplus**.

A tax drives a wedge between what buyers pay and what sellers keep. Fewer units are traded, and the units that are no longer traded had been creating value that now nobody gets: the **deadweight loss**.

## Definition and formulas
At price $P^*$ with quantity $Q^*$ traded:

$$CS = \int_0^{Q^*} D(Q)\,dQ - P^*Q^*, \qquad PS = P^*Q^* - \int_0^{Q^*} S(Q)\,dQ$$

- $\int_0^{Q^*} D(Q)\,dQ$ is the total value buyers place on the units; $P^*Q^*$ is what they spend.
- Total surplus at the equilibrium: $TS = CS + PS = \int_0^{Q^*} \big[D(Q) - S(Q)\big]\,dQ$, the gains from trade.
- For straight lines $D(Q) = a - bQ$ and $S(Q) = c + dQ$ the areas are triangles: $CS = \tfrac12 Q^*(a - P^*)$ and $PS = \tfrac12 Q^*(P^* - c)$.
- For a curved demand curve there is no triangle; integrate. For example, $P = a - bQ^2$ gives $CS = \tfrac23 bQ_0^3$ at quantity $Q_0$, and $P = \dfrac{A}{Q + c}$ gives $CS = A\ln\dfrac{Q_0 + c}{c} - P_0Q_0$.

**A per-unit tax $t$.** The quantity falls to $Q_t$, where $D(Q_t) = S(Q_t) + t$. Buyers pay $P_b = D(Q_t)$ and sellers keep $P_s = P_b - t$. Then

$$CS = \int_0^{Q_t} D\,dQ - P_bQ_t, \quad PS = P_sQ_t - \int_0^{Q_t} S\,dQ, \quad \text{revenue} = tQ_t,$$
$$DWL = \int_{Q_t}^{Q^*} \big[D(Q) - S(Q)\big]\,dQ.$$

With straight lines $DWL = \tfrac12\, t\,(Q^* - Q_t)$. The four pieces always add up to the total surplus without the tax.

**Price ceilings and floors.** A legal maximum price $\bar P$ below $P^*$ cuts the quantity to what sellers offer at $\bar P$, $\bar Q$ with $S(\bar Q) = \bar P$. Using the same integrals with $\bar P$ and $\bar Q$ (and assuming the units go to the buyers who value them most), the units between $\bar Q$ and $Q^*$ are lost: $DWL = \int_{\bar Q}^{Q^*} [D(Q) - S(Q)]\,dQ$. A price floor above $P^*$ works the same way with demand as the short side.

## Interactive
::widget{id="surplus-tax-welfare"}

The graph shows the market of Examples 1 and 2: demand $P = 100 - 2Q$ and supply $P = 10 + Q$. Move the **Tax per unit t** slider. The lilac area is consumer surplus, the green area is producer surplus, the gold rectangle is tax revenue and the shaded triangle marked DWL is the deadweight loss; the panel shows CS, PS and the deadweight loss, and the caption gives the two prices and the tax revenue. Notice that the triangle grows much faster than the tax: double the tax and it becomes four times as big. Check: at $t = 0$ the panel shows CS 900 and PS 450; at $t = 18$ it shows 576, 288 and 54, as in Example 2.

## Worked examples

### Example 1 (easy): the gains from trade
Inverse demand for fresh bread in a town is $P = 100 - 2Q$ and inverse supply is $P = 10 + Q$. Find the consumer surplus, the producer surplus and the total surplus at the equilibrium.

1. $100 - 2Q = 10 + Q \Rightarrow Q^* = 30$, $P^* = 40$
   *Why:* trade continues until the last buyer's willingness to pay equals the last seller's lowest acceptable price.
2. $\int_0^{30} (100 - 2Q)\,dQ = \big[100Q - Q^2\big]_0^{30} = 2100$
   *Why:* the area under demand adds up the value buyers place on the 30 units.
3. $CS = 2100 - 40 \cdot 30 = 900$
   *Why:* subtract what buyers spend. Check with the triangle: $\tfrac12 \cdot 30 \cdot (100 - 40) = 900$.
4. $\int_0^{30} (10 + Q)\,dQ = 300 + 450 = 750$, so $PS = 1200 - 750 = 450$
   *Why:* sellers receive 1200 but would have accepted 750 in total for these units.
5. $TS = 900 + 450 = 1350$
   *Why:* total surplus is the whole area between demand and supply up to $Q^*$.

```verify
a = 100; b = 2; c = 10; d = 1
Q = (a - c)/(b + d)
P = a - b*Q
assert Q == 30
assert P == 40
value = a*Q - b*Q^2/2
assert value == 2100
CS = value - P*Q
assert CS == 900
assert CS == 0.5*Q*(a - P)
cost = c*Q + d*Q^2/2
assert cost == 750
PS = P*Q - cost
assert PS == 450
assert CS + PS == 1350
```

### Example 2 (medium): the welfare cost of a tax
In the same market the government charges 18 per unit. Find the new quantity, both prices, CS, PS, the tax revenue and the deadweight loss.

1. $100 - 2Q = 10 + Q + 18 \Rightarrow Q_t = 24$
   *Why:* a unit is still traded only if a buyer will pay at least the seller's price plus the tax.
2. $P_b = 100 - 2 \cdot 24 = 52$, $P_s = 52 - 18 = 34$
   *Why:* buyers pay 12 more than before and sellers keep 6 less; together that is the tax.
3. $CS = \tfrac12 \cdot 24 \cdot (100 - 52) = 576$, $PS = \tfrac12 \cdot 24 \cdot (34 - 10) = 288$
   *Why:* the same areas as in Example 1, now up to $Q_t$ and measured from the new prices.
4. Revenue $= 18 \cdot 24 = 432$
   *Why:* the government collects $t$ on each unit still traded.
5. $DWL = \int_{24}^{30} \big[(100 - 2Q) - (10 + Q)\big]\,dQ = \tfrac12 \cdot 18 \cdot 6 = 54$
   *Why:* the 6 units no longer traded each had a gap between value and cost. Check: $1350 - 576 - 288 - 432 = 54$.

```verify
a = 100; b = 2; c = 10; d = 1; t = 18
Qt = (a - c - t)/(b + d)
assert Qt == 24
Pb = a - b*Qt
Ps = Pb - t
assert Pb == 52
assert Ps == 34
CS = (a*Qt - b*Qt^2/2) - Pb*Qt
PS = Ps*Qt - (c*Qt + d*Qt^2/2)
assert CS == 576
assert PS == 288
R = t*Qt
assert R == 432
# integral of (90 - 3Q) from 24 to 30
DWL = (90*30 - 1.5*30^2) - (90*24 - 1.5*24^2)
assert DWL == 54
assert DWL == 0.5*t*(30 - Qt)
assert 1350 - CS - PS - R == 54
```

### Example 3 (hard): concert tickets with curved demand
Inverse demand for tickets to a concert is $P = 80 - 0.2Q^2$ ($Q$ in hundreds of tickets). The organiser sets the price at 60. Find the consumer surplus, and compare it with the triangle formula.

1. $80 - 0.2Q^2 = 60 \Rightarrow Q^2 = 100 \Rightarrow Q_0 = 10$
   *Why:* fans buy until willingness to pay falls to the price; quantity must be positive.
2. $\int_0^{10} (80 - 0.2Q^2)\,dQ = \Big[80Q - \dfrac{0.2}{3}Q^3\Big]_0^{10} = 800 - 66.67 = 733.33$
   *Why:* the antiderivative of $Q^2$ is $Q^3/3$; this is the total value of the tickets to the fans who buy them.
3. $CS = 733.33 - 60 \cdot 10 = 133.33$
   *Why:* subtract spending, 600.
4. Triangle: $\tfrac12 \cdot 10 \cdot (80 - 60) = 100$, which is too small by a quarter of the true value.
   *Why:* this demand curve bends outwards, above the straight line from $(0, 80)$ to $(10, 60)$, so the true area is bigger. For $P = a - bQ^2$ the true surplus is always $\tfrac43$ of the triangle.

```verify
a = 80; b = 0.2; P0 = 60
Q0 = sqrt((a - P0)/b)
assert abs(Q0 - 10) < 1e-12
value = a*Q0 - b*Q0^3/3
assert abs(value - 733.33) < 0.01
CS = value - P0*Q0
assert abs(CS - 133.33) < 0.01
tri = 0.5*Q0*(a - P0)
assert abs(tri - 100) < 1e-9
assert abs(CS/tri - 4/3) < 1e-9
```

## Common mistakes
- Giving the spending $P^*Q^*$ as consumer surplus (SPENDING_NOT_SURPLUS).
- Integrating the demand curve and forgetting to subtract $P^*Q^*$ (FORGOT_SPENDING).
- Measuring consumer surplus against the supply curve (USED_SUPPLY).
- Dropping the $\tfrac12$ in the triangle formula (FORGOT_HALF).
- Counting the tax revenue as part of the deadweight loss (TAX_REVENUE_NOT_DWL).
- Calling the whole fall in consumer surplus the deadweight loss (CONSUMER_LOSS_ONLY).
- Using $\tfrac12 \times$ base $\times$ height when the demand curve is not straight (TRIANGLE_FORMULA).
- Thinking a tax's welfare cost grows in step with the tax: with straight lines the deadweight loss grows with the square of $t$.

## Practice
- `consumer-surplus-linear-equilibrium` (difficulty 1): consumer surplus at the equilibrium of linear inverse demand and supply; distractors SPENDING_NOT_SURPLUS, FORGOT_SPENDING, USED_SUPPLY, FORGOT_HALF.
- `deadweight-loss-per-unit-tax` (difficulty 2): deadweight loss of a per-unit tax with linear inverse demand and supply; distractors TAX_REVENUE_NOT_DWL, FORGOT_HALF, CONSUMER_LOSS_ONLY.
- `consumer-surplus-quadratic-demand` (difficulty 3): consumer surplus for $P = a - bQ^2$ at a given price, by integration; distractors TRIANGLE_FORMULA, FORGOT_SPENDING, SPENDING_NOT_SURPLUS.

## Real world
- Fuel and carbon taxes: finance ministries estimate tax revenue and deadweight loss before changing excise duties; the loss is small when demand is inelastic, which is one reason fuel is taxed heavily.
- Price caps: a cap on concert tickets, rents or bread prices helps the buyers who still get the good, but fewer units are supplied; surplus analysis measures the lost trades.
- Trade policy: removing a tariff lowers the domestic price and raises consumer surplus by more than producers and the government lose, which is how economists measure the gains from trade.
- Cost-benefit analysis: when a new road or bridge cuts the cost of a trip, the gain to users is measured as the increase in consumer surplus under the demand curve for trips.

---
id: F04
title: Linear functions in economics
block: F
coreYear: 1
prerequisites: [F03]
estMinutes: 35
status: draft
economicUses:
  - Linear demand and supply curves
  - "Cost functions: fixed cost plus a constant cost per unit"
  - Break-even analysis for a new product or business
  - Budget lines and simple forecasts
generators: [linear-break-even, linear-demand-two-points]
widgets: []
mistakeCodes:
  IGNORED_UNIT_COST:
    label: Ignored the cost of each unit
    explanation: Each unit sold covers its own cost first. Only the difference between price and unit cost pays off the fixed cost, so divide the fixed cost by (price − unit cost), not by the price.
  ADDED_UNIT_COST:
    label: Added the unit cost instead of subtracting it
    explanation: The unit cost is money going out, so it reduces what each sale contributes. The contribution per unit is price − unit cost.
  DIVIDED_BY_COST:
    label: Divided by the unit cost
    explanation: Break-even depends on how much each unit earns above its cost. Dividing by the unit cost alone ignores the price.
  SLOPE_SIGN:
    label: Used a positive slope for demand
    explanation: When the price rises the quantity demanded falls, so the slope of a demand line is negative. Check the sign of ΔQ/ΔP before using it.
  INVERTED_SLOPE:
    label: Used ΔP/ΔQ instead of ΔQ/ΔP
    explanation: For Q = a − bP the slope is the change in quantity per unit change in price, ΔQ/ΔP. Dividing the other way gives the slope of the inverse demand curve.
  INTERCEPT_ONLY:
    label: Gave the intercept, not the quantity at the price
    explanation: The intercept a is the quantity at a price of zero. To find demand at a given price, put that price into Q = a − bP.
resources:
  - { title: "College Algebra 2e, 4.1 Linear Functions (OpenStax)", url: "https://openstax.org/books/college-algebra-2e/pages/4-1-linear-functions", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Principles of Economics 3e, 7.3 Costs in the Short Run (OpenStax)", url: "https://openstax.org/books/principles-economics-3e/pages/7-3-costs-in-the-short-run", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
A student opens a food truck. Rent and the licence cost the same every month; every sandwich costs a little in ingredients. How many sandwiches must be sold before the truck stops losing money? Economists answer questions like this with straight lines: costs that grow by the same amount per unit, demand that falls by the same amount per unit of price.

## Intuition
A linear function changes at a constant rate. Its graph is a straight line, described by two numbers: where it starts (the intercept) and how steeply it rises or falls (the slope). In economics the slope usually has a meaning of its own: the extra cost of one more unit, or how many fewer units are bought when the price rises by one.

## Definition and formulas
A linear function: $y = a + bx$, where $a$ is the intercept and $b$ the slope.

Slope through two points: $b = \dfrac{y_2 - y_1}{x_2 - x_1}$.

- Linear demand: $Q = a - bP$ with $b > 0$, so quantity falls as price rises.
- Linear cost: $C(Q) = F + vQ$, where $F$ is fixed cost and $v$ the cost of each unit (the marginal cost).
- Revenue at a fixed price: $R(Q) = pQ$.
- Break-even quantity, where $R(Q) = C(Q)$: $Q^* = \dfrac{F}{p - v}$.

## Interactive
An interactive line for this topic is planned. Until then, use Practice: every problem uses new numbers.

## Worked examples

### Example 1 (easy): reading a cost function
A bakery's cost is $C(Q) = 2000 + 15Q$. What does it cost to bake 300 cakes, and what does one more cake add?

1. $C(300) = 2000 + 15 \cdot 300 = 6500$
   *Why:* put the quantity into the cost function.
2. One more cake adds the slope: $15$.
   *Why:* in a linear cost function every extra unit costs the same, so the slope is the marginal cost.

```verify
F = 2000; v = 15; Q = 300
C = F + v*Q
assert C == 6500
assert (F + v*(Q+1)) - C == 15
```

### Example 2 (medium): break-even
A firm sells at 40 per unit, each unit costs 25 to make, and fixed costs are 9000. How many units must it sell to break even?

1. Each unit contributes $40 - 25 = 15$ towards fixed costs.
   *Why:* the price first covers the unit's own cost; the rest pays off the fixed cost.
2. $Q^* = \dfrac{9000}{15} = 600$
   *Why:* break-even is where revenue $40Q$ equals cost $9000 + 25Q$.
3. Check: $40 \cdot 600 = 24000 = 9000 + 25 \cdot 600$.
   *Why:* at break-even revenue and cost are equal, so profit is zero.

```verify
p = 40; v = 25; F = 9000
Q = F/(p - v)
assert Q == 600
assert p*Q == F + v*Q
```

### Example 3 (hard): demand from two observations
At a price of 10 people buy 400 units; at 25 they buy 250. Assuming demand is linear, find the demand equation, demand at a price of 30, and the price at which nobody buys.

1. Slope: $\dfrac{250 - 400}{25 - 10} = -10$
   *Why:* the slope is the change in quantity per unit change in price.
2. Intercept: $a = 400 + 10 \cdot 10 = 500$, so $Q = 500 - 10P$.
   *Why:* rearrange $Q = a - bP$ at one known point.
3. At $P = 30$: $Q = 500 - 300 = 200$.
   *Why:* use the equation at the new price.
4. Nobody buys when $Q = 0$: $P = 500/10 = 50$.
   *Why:* the choke price is where the demand line meets the price axis.

```verify
P1 = 10; Q1 = 400; P2 = 25; Q2 = 250
s = (Q2 - Q1)/(P2 - P1)
a = Q1 - s*P1
assert s == -10
assert a == 500
assert a + s*30 == 200
assert -a/s == 50
```

## Common mistakes
- Dividing the fixed cost by the price (IGNORED_UNIT_COST).
- Adding the unit cost to the price (ADDED_UNIT_COST).
- Dividing the fixed cost by the unit cost (DIVIDED_BY_COST).
- Giving demand a positive slope (SLOPE_SIGN).
- Computing ΔP/ΔQ instead of ΔQ/ΔP (INVERTED_SLOPE).
- Reporting the intercept as the answer (INTERCEPT_ONLY).

## Practice
- `linear-break-even` (difficulty 1): break-even quantity from price, unit cost and fixed cost.
- `linear-demand-two-points` (difficulty 2): build a demand line from two observations and predict demand at a new price.

## Real world
- Business planning: break-even analysis tells a start-up how many sales it needs before it covers its fixed costs.
- Pricing: a linear demand estimate lets a firm see how sales change when it moves its price.
- Public policy: governments approximate demand for public transport or utilities with linear models before changing fares.
- Forecasting: many short-run forecasts assume a constant rate of change, which is a linear function of time.

---
id: F05
title: Market equilibrium and 2×2 linear systems
block: F
coreYear: 1
prerequisites: [F02, F04]
estMinutes: 40
status: draft
economicUses:
  - Equilibrium price and quantity in a market
  - "Tax incidence: how a tax splits between buyers and sellers"
  - Effects of subsidies, price floors and ceilings
  - Linked markets, such as tea and coffee, solved together
searchTerms:
  - "Supply and demand"
  - "Equilibrium price"
generators: [equilibrium-price, equilibrium-tax-price]
widgets: [equilibrium-tax]
mistakeCodes:
  SIGN_SLIP:
    label: Sign slip when collecting terms
    explanation: Moving bP to the supply side turns −bP into +bP, so the P terms add up to (b + d)P. Subtracting them gives the wrong denominator.
  ADDED_INTERCEPTS:
    label: Added the intercepts instead of subtracting
    explanation: The supply intercept moves to the other side of the equation, so it is subtracted. The numerator is a − c.
  QUANTITY_NOT_PRICE:
    label: Gave the quantity instead of the price
    explanation: The question asks for the equilibrium price P*. The quantity Q* comes from putting P* back into either equation.
  FULL_PASS_THROUGH:
    label: Added the whole tax to the price
    explanation: Buyers pay the full tax only if supply is perfectly elastic. Otherwise sellers absorb part of it, and the buyers' price rises by less than the tax.
  NO_PASS_THROUGH:
    label: Left the price unchanged
    explanation: A tax on sellers shifts supply, so the market price changes. Solve again with sellers receiving P − t.
  WRONG_SHARE:
    label: Gave buyers the sellers' share
    explanation: Buyers bear d/(b + d) of the tax, where d is the supply slope. The steeper side of the market, the one that responds less, bears more.
resources:
  - { title: "Principles of Economics 3e, 3.1 Demand, Supply, and Equilibrium in Markets for Goods and Services (OpenStax)", url: "https://openstax.org/books/principles-economics-3e/pages/3-1-demand-supply-and-equilibrium-in-markets-for-goods-and-services", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "College Algebra 2e, 2.2 Linear Equations in One Variable (OpenStax)", url: "https://openstax.org/books/college-algebra-2e/pages/2-2-linear-equations-in-one-variable", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
When a government taxes fuel, who pays: drivers or oil companies? When a harvest fails, how far does the price of wheat rise? Both questions come down to the same calculation: find where demand meets supply, then see how that point moves.

## Intuition
Buyers want less when the price is high; sellers offer more. The price that makes the two quantities equal is the equilibrium. Above it, unsold goods pile up and the price falls; below it, buyers queue and the price rises. With straight-line demand and supply, finding it means solving two linear equations at once.

## Definition and formulas
Demand $Q_d = a - bP$ and supply $Q_s = c + dP$ with $b, d > 0$.

Equilibrium: $Q_d = Q_s \Rightarrow P^* = \dfrac{a - c}{b + d}$, and $Q^* = a - bP^*$.

A per-unit tax $t$ on sellers: they keep $P - t$, so $Q_s = c + d(P - t)$. The buyers' price becomes
$$P_b = P^* + \frac{d}{b + d}\,t$$
Buyers bear the share $\frac{d}{b+d}$ of the tax and sellers the rest, $\frac{b}{b+d}$.

A general $2 \times 2$ linear system is solved the same way: by substitution or elimination.

## Interactive
::widget{id="equilibrium-tax"}

Move the tax slider and watch the supply line shift up. The panel shows the price buyers pay, the price sellers keep and how the tax is split.

## Worked examples

### Example 1 (easy): equilibrium price and quantity
Demand is $Q_d = 120 - 2P$ and supply is $Q_s = -30 + 3P$. Find the equilibrium.

1. $120 - 2P = -30 + 3P$
   *Why:* at equilibrium the quantity demanded equals the quantity supplied.
2. $150 = 5P \Rightarrow P^* = 30$
   *Why:* collect the P terms on one side and the numbers on the other.
3. $Q^* = 120 - 2 \cdot 30 = 60$
   *Why:* put the price back into either equation; both give 60.

```verify
a = 120; b = 2; c = -30; d = 3
P = (a - c)/(b + d)
assert P == 30
assert a - b*P == 60
assert c + d*P == 60
```

### Example 2 (medium): who pays a tax
In the same market the government charges sellers 10 per unit. What do buyers pay, what do sellers keep, and how is the tax split?

1. Supply becomes $Q_s = -30 + 3(P - 10) = -60 + 3P$.
   *Why:* sellers decide from the price they keep, which is the buyers' price minus the tax.
2. $120 - 2P = -60 + 3P \Rightarrow P_b = 36$
   *Why:* solve the new equilibrium as before.
3. Sellers keep $36 - 10 = 26$; quantity falls to $120 - 72 = 48$.
   *Why:* the tax drives a wedge between the two prices.
4. Buyers pay 6 of the 10, which is $\frac{3}{2+3}$; sellers bear 4.
   *Why:* supply here is steeper in price than demand, so buyers carry the larger share.

```verify
a = 120; b = 2; c = -30; d = 3; t = 10
Pb = (a - c + d*t)/(b + d)
assert Pb == 36
assert Pb - t == 26
assert a - b*Pb == 48
assert (Pb - 30)/t == d/(b + d)
```

### Example 3 (hard): two linked markets
Tea and coffee are substitutes. Tea: $Q_d = 80 - 2P_1 + P_2$, $Q_s = -10 + P_1$. Coffee: $Q_d = 100 + P_1 - 3P_2$, $Q_s = 20 + P_2$. Find both equilibrium prices.

1. Tea market clears: $80 - 2P_1 + P_2 = -10 + P_1 \Rightarrow 3P_1 - P_2 = 90$
   *Why:* each market gives one equation in the two prices.
2. Coffee market clears: $100 + P_1 - 3P_2 = 20 + P_2 \Rightarrow -P_1 + 4P_2 = 80$
   *Why:* the same rule, demand equals supply, in the second market.
3. From step 2, $P_1 = 4P_2 - 80$. Substitute: $3(4P_2 - 80) - P_2 = 90 \Rightarrow 11P_2 = 330 \Rightarrow P_2 = 30$
   *Why:* substitution turns two equations in two unknowns into one equation in one unknown.
4. $P_1 = 4 \cdot 30 - 80 = 40$. Check: tea $30 = 30$, coffee $50 = 50$.
   *Why:* both markets must clear at the same time.

```verify
P2 = 330/11
P1 = 4*P2 - 80
assert P2 == 30
assert P1 == 40
assert 80 - 2*P1 + P2 == -10 + P1
assert 100 + P1 - 3*P2 == 20 + P2
```

## Common mistakes
- Subtracting the slopes instead of adding them (SIGN_SLIP).
- Adding the intercepts (ADDED_INTERCEPTS).
- Giving the quantity when the price was asked (QUANTITY_NOT_PRICE).
- Assuming buyers pay the whole tax (FULL_PASS_THROUGH).
- Assuming the price does not change (NO_PASS_THROUGH).
- Swapping the buyers' and sellers' shares (WRONG_SHARE).

## Practice
- `equilibrium-price` (difficulty 1): equilibrium price for linear demand and supply.
- `equilibrium-tax-price` (difficulty 2): the price buyers pay after a per-unit tax on sellers.

## Real world
- Tax policy: before taxing fuel, tobacco or sugar, governments estimate demand and supply slopes to know who will bear the tax and how much revenue it raises.
- Agriculture: a poor harvest shifts supply; the equilibrium model predicts how far prices rise and how much less is sold.
- Competition policy: regulators model linked markets, such as substitutes, to see how a merger in one market affects prices in another.
- Price controls: comparing a price ceiling with the equilibrium shows whether it will cause shortages.

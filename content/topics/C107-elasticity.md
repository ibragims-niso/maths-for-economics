---
id: C107
title: Elasticity
block: C1
coreYear: 1
prerequisites: [C106]
estMinutes: 40
status: draft
economicUses:
  - "Setting prices: will a price rise increase or reduce revenue?"
  - "Tax incidence: who bears a tax, buyers or sellers"
  - Forecasting demand after price or income changes
  - Central banks and governments estimating responses to energy or food price shocks
generators: [elasticity-linear-point, elasticity-unit-elastic-price]
widgets: [elasticity-slider]
mistakeCodes:
  SIGN:
    label: Lost the minus sign
    explanation: Demand slopes downwards, so dQ/dP is negative and the price elasticity of demand is negative. Keep the sign unless the question asks for the absolute value.
  INVERTED_RATIO:
    label: Used Q/P instead of P/Q
    explanation: Elasticity multiplies the slope dQ/dP by P/Q, the price over the quantity at that point. Using Q/P turns the percentage change the wrong way round.
  SLOPE_ONLY:
    label: Gave the slope, not the elasticity
    explanation: The slope dQ/dP depends on the units of P and Q. Elasticity removes units by multiplying by P/Q. Two goods can have the same slope and very different elasticities.
  INVERSE_SLOPE:
    label: Used the slope of the inverse demand curve
    explanation: If demand is written as P = f(Q), its slope is dP/dQ. Elasticity needs dQ/dP, which is the reciprocal 1/(dP/dQ).
  CHOKE_PRICE:
    label: Found the price where demand is zero
    explanation: At the choke price Q = 0 and elasticity is undefined (infinitely elastic). Unit elasticity is where |ε| = 1, halfway along a linear demand curve.
  ALGEBRA:
    label: Algebra slip when solving
    explanation: Set the elasticity expression equal to −1 and solve step by step. Check by substituting your price back into the formula.
resources: []
# Phase 1 task: find, check and add 3–5 resources (e.g. the elasticity chapter of OpenStax Principles of Economics,
# an open courseware lecture on elasticity, a statistics-office or central-bank note using price elasticities).
# Only add URLs that resolve and match the topic.
---

## Why economists need this
A café owner wants to raise the price of coffee by 10 %. Will revenue go up or down? It depends on how strongly customers react, and elasticity measures exactly that. Governments use the same idea before taxing fuel or cigarettes: if buyers barely react, the tax raises a lot of money and buyers bear most of it.

## Intuition
Slopes depend on units: measure coffee in cups or litres and the slope changes. Economists want a unit-free measure of responsiveness, so they compare *percentage* changes. Elasticity answers: "If the price rises by 1 %, by what percentage does the quantity demanded change?"

## Definition and formulas
Point price elasticity of demand:
$$\varepsilon = \frac{dQ}{dP}\cdot\frac{P}{Q}$$

- $|\varepsilon| > 1$: elastic (quantity reacts more than price)
- $|\varepsilon| < 1$: inelastic
- $|\varepsilon| = 1$: unit elastic

For linear demand $Q = a - bP$: $\varepsilon = \dfrac{-bP}{a - bP}$. It changes along the line: inelastic at low prices, elastic at high prices.

Constant-elasticity demand $Q = A P^{-k}$ has $\varepsilon = -k$ at every price.

Elasticity and revenue: with $R = PQ$,
$$\frac{dR}{dP} = Q\,(1 + \varepsilon)$$
so raising the price increases revenue when demand is inelastic and reduces it when demand is elastic.

Arc (midpoint) elasticity between two observed points:
$$\varepsilon_{arc} = \frac{\Delta Q / \bar Q}{\Delta P / \bar P}$$

## Interactive
::widget{id="elasticity-slider"}

Drag the point along the demand line $Q = 100 - 2P$. The panel shows $P$, $Q$, $\varepsilon$, the revenue rectangle $P \times Q$, and whether you are in the elastic or inelastic part. Watch revenue peak exactly where $\varepsilon = -1$.

## Worked examples

### Example 1 (easy): elasticity at a point
Demand is $Q = 100 - 2P$. Find the price elasticity at $P = 20$ and say whether demand is elastic.

1. $Q = 100 - 2(20) = 60$
   *Why:* elasticity needs the quantity at the point we evaluate.
2. $\dfrac{dQ}{dP} = -2$
   *Why:* the slope of a linear demand curve is the coefficient of $P$.
3. $\varepsilon = -2 \cdot \dfrac{20}{60} = -0.67$
   *Why:* multiply the slope by $P/Q$ to turn it into a ratio of percentage changes.
4. $|\varepsilon| = 0.67 < 1$, so demand is inelastic: a 1 % price rise cuts quantity by about 0.67 %, and revenue rises.

```verify
a = 100; b = 2; P = 20
Q = a - b*P
e = -b*P/Q
assert Q == 60
assert abs(e - (-2/3)) < 0.001
```

### Example 2 (medium): where revenue is highest
For $Q = 100 - 2P$, find the price at which demand is unit elastic and show that revenue is maximised there.

1. Set $\dfrac{-2P}{100 - 2P} = -1$
   *Why:* unit elastic means $\varepsilon = -1$.
2. $2P = 100 - 2P \Rightarrow P = 25$, $Q = 50$
   *Why:* multiply both sides by $-(100 - 2P)$ and solve.
3. Revenue $R(P) = P(100 - 2P) = 100P - 2P^2$, so $R'(P) = 100 - 4P = 0 \Rightarrow P = 25$
   *Why:* revenue is maximised where its derivative is zero; $R''(P) = -4 < 0$ confirms a maximum.
4. Both methods give $P = 25$ and $R = 1{,}250$. This matches $dR/dP = Q(1 + \varepsilon) = 0$ when $\varepsilon = -1$.

```verify
a = 100; b = 2
P = a/(2*b)
Q = a - b*P
e = -b*P/Q
R = P*Q
assert P == 25
assert abs(e + 1) < 0.000001
assert R == 1250
assert (100 - 4*P) == 0
```

### Example 3 (hard): constant elasticity and the size of a price change
Demand is $Q = 500\,P^{-1.5}$. Show the elasticity is the same at every price, then estimate and compute the effect of a 4 % price increase.

1. $\dfrac{dQ}{dP} = -1.5 \cdot 500\,P^{-2.5}$
   *Why:* power rule.
2. $\varepsilon = -1.5 \cdot 500\,P^{-2.5} \cdot \dfrac{P}{500\,P^{-1.5}} = -1.5$
   *Why:* the powers of $P$ cancel, so the elasticity does not depend on the price.
3. Approximation: $\%\Delta Q \approx \varepsilon \cdot \%\Delta P = -1.5 \times 4\% = -6\%$
   *Why:* elasticity is a ratio of small percentage changes.
4. Exact: $Q_{new}/Q_{old} = 1.04^{-1.5} = 0.9429$, a fall of $5.71\%$
   *Why:* for a 4 % change the linear approximation slightly overstates the fall; the gap grows for larger changes.

```verify
k = 1.5
ratio = 1.04^(-k)
assert abs(ratio - 0.94287) < 0.0001
assert abs((ratio - 1)*100 - (-5.713)) < 0.01
```

## Common mistakes
- Dropping the minus sign (SIGN).
- Multiplying by $Q/P$ instead of $P/Q$ (INVERTED_RATIO).
- Reporting the slope as if it were the elasticity (SLOPE_ONLY).
- Using $dP/dQ$ from an inverse demand curve without taking the reciprocal (INVERSE_SLOPE).
- Thinking a straight demand line has one elasticity: it does not; only its slope is constant.

## Practice
- `elasticity-linear-point` (difficulty 1): elasticity of $Q = a - bP$ at a given price; distractors SIGN, INVERTED_RATIO, SLOPE_ONLY, INVERSE_SLOPE.
- `elasticity-unit-elastic-price` (difficulty 2): price where $|\varepsilon| = 1$ for $Q = a - bP$; answer $a/(2b)$; distractors CHOKE_PRICE ($a/b$), ALGEBRA ($a/(4b)$).

## Real world
- Pricing: firms with market power never choose a price where demand is inelastic, because raising the price would increase revenue and reduce costs at the same time.
- Taxes: when demand is inelastic (fuel, tobacco), most of a tax is passed on to buyers and tax revenue is stable.
- Policy: estimates of the price elasticity of demand for energy, food or public transport are used to forecast the effect of subsidies and price reforms.
- Business analytics: firms estimate elasticities from sales data with log-log regressions, where the coefficient on $\log P$ is the elasticity (see EM01).

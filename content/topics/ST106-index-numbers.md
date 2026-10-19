---
id: ST106
title: Index numbers
block: ST1
coreYear: 1
prerequisites: [ST101]
estMinutes: 45
status: draft
economicUses:
  - Measuring inflation with the consumer price index (CPI)
  - "Real wages and pensions: what an income can actually buy"
  - Comparing the cost of living between years
  - Linking pensions, benefits and contracts to prices
  - Splitting a change in sales or GDP into a price part and a volume part
generators: [real-wage-deflated, laspeyres-price-index, real-wage-change]
widgets: [index-number-basket]
mistakeCodes:
  MULTIPLIED_BY_CPI:
    label: Multiplied by the CPI instead of dividing
    explanation: Prices have risen, so a manat buys less than in the base year and the real wage must be smaller than the nominal one. Divide by the index and multiply by 100, real = nominal ÷ CPI × 100.
  PERCENT_OFF_WAGE:
    label: Took the inflation percentage off the wage
    explanation: A CPI of 125 does not mean the wage loses 25 % of its value; it means the wage buys 1/1.25 = 0.8 of what it bought, a loss of 20 %. Divide by CPI/100 rather than subtracting a percentage.
  FORGOT_100:
    label: Forgot to multiply by 100
    explanation: The CPI is written on a scale where the base year is 100, not 1. Divide the wage by CPI/100, or divide by the CPI and then multiply by 100.
  PAASCHE_WEIGHTS:
    label: Used current quantities (Paasche) instead of base quantities
    explanation: The Laspeyres index prices the base-period basket, so both sums use the base quantities q₀. Using the current quantities q₁ gives the Paasche index, a different number.
  UNWEIGHTED_RELATIVES:
    label: Averaged the price relatives without weights
    explanation: A plain average treats a small item like tea the same as a large one like fuel. Weight each price relative by its share of base-period spending, p₀q₀ ÷ Σp₀q₀; that weighted average is the Laspeyres index.
  VALUE_INDEX:
    label: Compared spending in the two periods (value index)
    explanation: Σp₁q₁ ÷ Σp₀q₀ mixes price changes with changes in the amounts bought. A price index must hold the quantities fixed, so the numerator is Σp₁q₀.
  SUM_OF_PRICES:
    label: Added up the prices without quantities
    explanation: Σp₁ ÷ Σp₀ ignores how much of each good is bought and changes if you measure a good in other units (kg instead of g). Multiply each price by its quantity before adding.
  SUBTRACTED_INFLATION:
    label: Subtracted inflation from wage growth
    explanation: Nominal growth minus inflation is only an approximation. The real wage grows by the factor (1 + g) ÷ (1 + π), so the exact change is (1 + g) ÷ (1 + π) − 1 = (g − π) ÷ (1 + π), which is closer to zero than g − π whenever prices rise.
  CPI_POINTS:
    label: Used index points as if they were per cent
    explanation: A rise from 140 to 182 is 42 points but 30 %, because the index did not start at 100. Inflation is the percentage change of the index, (CPI₂ − CPI₁) ÷ CPI₁ × 100.
  NOMINAL_ONLY:
    label: Gave the nominal change
    explanation: The money wage grew by this much, but prices rose too. Divide each wage by its year’s CPI (or the wage growth factor by the price growth factor) before finding the change.
  REBASE_SUBTRACTED:
    label: Rebased by subtracting instead of dividing
    explanation: To move the base to a new year, divide every value by the index in that year and multiply by 100. Subtracting the same number from every year changes the percentage changes between years.
resources:
  - { title: "Principles of Macroeconomics 3e, 9.1 Tracking Inflation (OpenStax)", url: "https://openstax.org/books/principles-macroeconomics-3e/pages/9-1-tracking-inflation", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Principles of Macroeconomics 3e, 9.2 How to Measure Changes in the Cost of Living (OpenStax)", url: "https://openstax.org/books/principles-macroeconomics-3e/pages/9-2-how-to-measure-changes-in-the-cost-of-living", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Price statistics, including consumer prices (State Statistical Committee of the Republic of Azerbaijan)", url: "https://www.stat.gov.az/source/price/?lang=en", kind: data, verifiedAt: 2026-10-18 }
---

## Why economists need this
Your grandmother says bread cost a fraction of today's price when she was young. Was life cheaper, or were wages just smaller too? To compare money amounts across years, economists need one number that says how much "prices in general" have changed. That number is a price index. Statistics offices publish a consumer price index (CPI) every month; inflation, real wages, pension increases and central bank decisions are all computed from it.

## Intuition
Pick a basket of goods a typical household buys, such as so many loaves of bread, litres of fuel and kilos of rice, and ask what it costs today compared with the base year. If the same basket cost 150 then and 183 now, prices have risen by 22 %, and the index is 122 on a scale where the base year is 100.

The hard part is choosing the basket. People change what they buy: when fuel becomes much dearer, they drive less. Keeping the *old* basket (Laspeyres) ignores that switch and overstates how much more it costs to live as well as before; using the *new* basket (Paasche) leans the other way. Real indices are compromises between the two.

Once you have a price index, you can strip price changes out of any money amount: a wage that rises by 25 % while prices rise by 20 % buys only about 4 % more.

## Definition and formulas
Base period 0, current period 1. Good $i$ has prices $p_{0i}, p_{1i}$ and quantities $q_{0i}, q_{1i}$. Every index is written with the base equal to 100.

**Simple indices** for one good: the price relative $\dfrac{p_1}{p_0}\times 100$ and the quantity relative $\dfrac{q_1}{q_0}\times 100$.

**Laspeyres price index** (base-period quantities as weights):
$$L_P = \frac{\sum p_1 q_0}{\sum p_0 q_0}\times 100$$

**Paasche price index** (current-period quantities as weights):
$$P_P = \frac{\sum p_1 q_1}{\sum p_0 q_1}\times 100$$

**Fisher ideal index**, the geometric mean of the two: $F_P = \sqrt{L_P \, P_P}$.

**Weighted average form.** With base expenditure shares $w_i = \dfrac{p_{0i}q_{0i}}{\sum p_0 q_0}$ (they add up to 1),
$$L_P = \sum w_i \,\frac{p_{1i}}{p_{0i}}\times 100$$
This is how a CPI is built in practice: price relatives for hundreds of items, weighted by their shares of household spending from a survey. It is the weighted mean of ST101 applied to price relatives.

**Quantity indices** swap the roles of prices and quantities: $L_Q = \dfrac{\sum p_0 q_1}{\sum p_0 q_0}\times 100$ and $P_Q = \dfrac{\sum p_1 q_1}{\sum p_1 q_0}\times 100$.

**Value index** $V = \dfrac{\sum p_1 q_1}{\sum p_0 q_0}\times 100$. It splits exactly into a price part and a quantity part:
$$\frac{V}{100} = \frac{L_P}{100}\cdot\frac{P_Q}{100} = \frac{P_P}{100}\cdot\frac{L_Q}{100}$$
(and also Fisher price × Fisher quantity). Laspeyres price times Laspeyres quantity does *not* give $V$ in general.

**Substitution bias.** Households buy less of goods whose prices rise most. Then $P_P \le F_P \le L_P$ in the usual case: Laspeyres tends to overstate the rise in the cost of living and Paasche to understate it.

**Inflation** from one period to the next:
$$\pi = \frac{\text{CPI}_t - \text{CPI}_{t-1}}{\text{CPI}_{t-1}}\times 100\ \%$$

**Deflating.** The real wage, in base-year prices, is
$$\text{real wage} = \frac{\text{nominal wage}}{\text{CPI}}\times 100$$
If nominal wages grow by $g$ and prices by $\pi$ (as decimals), the real wage grows by $\dfrac{1+g}{1+\pi} - 1 \approx g - \pi$.

**Rebasing** an index to year $b$: divide every value by the value in year $b$ and multiply by 100. Percentage changes between years are unchanged.

The **GDP deflator**, nominal GDP ÷ real GDP × 100, is a Paasche-type price index, because it weights prices by what the economy produced in the current year. Chain indices, which update the basket every year and link the results, are covered with growth rates in ST107.

## Interactive
::widget{id="index-number-basket"}

A household buys 90 loaves of bread and 40 litres of fuel a month; bread becomes 10 % dearer. Move the **Fuel price rise** slider and the **Cut in fuel bought** slider and compare the three bars and the panel. At the starting position (fuel up 40 %, 25 % less fuel bought) the panel shows Laspeyres 122, Paasche 120 and Fisher 121, the numbers of Example 2. Notice that the Laspeyres bar does not move when you change the cut, because it always prices the old basket. Set the cut to 0 % and all three bars become equal; set the fuel price rise to 10 % and they all show 110.

## Worked examples

### Example 1 (easy): a real wage
The average monthly wage was 800 manat in 2020 and 1,000 manat in 2024. The CPI (2020 = 100) was 120 in 2024. Find the 2024 wage in 2020 prices and the change in the real wage.

1. Inflation over the period $= \dfrac{120 - 100}{100}\times 100 = 20\ \%$
   *Why:* the index starts at 100 in 2020, so here index points and per cent coincide.
2. Real wage in 2024 $= \dfrac{1{,}000}{120}\times 100 = 833.33$ manat
   *Why:* dividing by 1.20 removes the price rise, leaving what the wage buys at 2020 prices.
3. Real change $= \left(\dfrac{833.33}{800} - 1\right)\times 100 = 4.17\ \%$
   *Why:* compare like with like: both wages are now in 2020 prices.
4. The nominal wage rose by 25 %, but most of that was eaten by inflation; the worker can buy about 4.17 % more.

```verify
W0 = 800; W1 = 1000; C1 = 120
infl = (C1 - 100)/100*100
real1 = W1/C1*100
change = (real1/W0 - 1)*100
assert abs(infl - 20) < 1e-9
assert abs(real1 - 833.33) < 0.005
assert abs(change - 4.17) < 0.005
assert abs((W1/W0 - 1)*100 - 25) < 1e-9
```

### Example 2 (medium): Laspeyres, Paasche and Fisher for a two-good basket
A household's monthly basket (prices in manat):

$$\begin{array}{l|cccc} \text{Good} & p_0 & p_1 & q_0 & q_1 \\ \hline \text{Bread (loaf)} & 1.00 & 1.10 & 90 & 90 \\ \text{Fuel (litre)} & 1.50 & 2.10 & 40 & 30 \end{array}$$

Find the Laspeyres, Paasche and Fisher price indices, and check the value index.

1. $\sum p_0 q_0 = 1.00\times 90 + 1.50\times 40 = 150$, $\ \sum p_1 q_0 = 1.10\times 90 + 2.10\times 40 = 183$
   *Why:* Laspeyres costs the base basket at both sets of prices.
2. $L_P = \dfrac{183}{150}\times 100 = 122.00$
   *Why:* the old basket costs 22 % more.
3. Check: $w = \dfrac{90}{150} = 0.6$ and $\dfrac{60}{150} = 0.4$, so $0.6\times 110 + 0.4\times 140 = 122$
   *Why:* Laspeyres is the base-spending-weighted average of the price relatives (110 for bread, 140 for fuel). The unweighted average, 125, would be wrong.
4. $\sum p_1 q_1 = 1.10\times 90 + 2.10\times 30 = 162$, $\ \sum p_0 q_1 = 1.00\times 90 + 1.50\times 30 = 135$, so $P_P = \dfrac{162}{135}\times 100 = 120.00$
   *Why:* Paasche costs the new basket, with less fuel, at both sets of prices.
5. $F_P = \sqrt{122\times 120} = 121.00$
   *Why:* the geometric mean sits between the two; Laspeyres is higher because the household switched away from fuel, the good whose price rose most.
6. $V = \dfrac{162}{150}\times 100 = 108$ and $L_Q = \dfrac{135}{150}\times 100 = 90$, so $1.20\times 0.90 = 1.08$
   *Why:* spending rose 8 %: prices up 20 % (Paasche) times quantities down 10 % (Laspeyres quantity index).

```verify
p0 = [1.00, 1.50]; p1 = [1.10, 2.10]; q0 = [90, 40]; q1 = [90, 30]
b00 = sum(p0 .* q0); b10 = sum(p1 .* q0); b11 = sum(p1 .* q1); b01 = sum(p0 .* q1)
L = b10/b00*100
P = b11/b01*100
F = sqrt(L*P)
w = (p0 .* q0)/b00
assert abs(b00 - 150) < 1e-9
assert abs(b10 - 183) < 1e-9
assert abs(L - 122) < 1e-9
assert abs(sum(w .* (p1 ./ p0))*100 - 122) < 1e-9
assert abs(mean(p1 ./ p0)*100 - 125) < 1e-9
assert abs(b11 - 162) < 1e-9
assert abs(b01 - 135) < 1e-9
assert abs(P - 120) < 1e-9
assert abs(F - 121.00) < 0.005
V = b11/b00*100
LQ = b01/b00*100
assert abs(V - 108) < 1e-9
assert abs(LQ - 90) < 1e-9
assert abs(P*LQ/100 - V) < 1e-9
assert abs(L*(b11/b10*100)/100 - V) < 1e-9
```

### Example 3 (hard): rebasing and the change in the real wage
A CPI with base 2015 = 100 stood at 140 in 2020 and 182 in 2024. The average wage rose from 1,200 manat in 2020 to 1,800 manat in 2024. Rebase the index to 2020 = 100 and find the percentage change in the real wage.

1. Rebased: 2020: $\dfrac{140}{140}\times 100 = 100$, 2024: $\dfrac{182}{140}\times 100 = 130$
   *Why:* dividing every value by the 2020 value makes 2020 the new base; percentage changes stay the same.
2. Inflation 2020–2024 $= 30\ \%$, although the old index rose by $182 - 140 = 42$ points
   *Why:* points equal per cent only when the starting value is 100.
3. Real wage in 2024, in 2020 prices: $\dfrac{1{,}800}{130}\times 100 = 1{,}384.62$ manat
   *Why:* deflate with the rebased index so that the 2020 wage needs no change.
4. Real change $= \left(\dfrac{1{,}384.62}{1{,}200} - 1\right)\times 100 = \left(\dfrac{1.5}{1.3} - 1\right)\times 100 = 15.38\ \%$
   *Why:* the real wage grows by the wage factor 1.5 divided by the price factor 1.3.
5. Shortcuts give $50 - 30 = 20\ \%$ (too high) and $50 - 42 = 8\ \%$ (index points mistaken for per cent)
   *Why:* subtracting inflation is only an approximation, and a poor one when both changes are large.

```verify
C2020 = 140; C2024 = 182; W2020 = 1200; W2024 = 1800
R2024 = C2024/C2020*100
assert abs(R2024 - 130) < 1e-9
infl = (C2024/C2020 - 1)*100
assert abs(infl - 30) < 1e-9
real = W2024/R2024*100
assert abs(real - 1384.62) < 0.005
change = (real/W2020 - 1)*100
assert abs(change - 15.38) < 0.005
assert abs(change - (1.5/1.3 - 1)*100) < 1e-9
g = (W2024/W2020 - 1)*100
assert abs(g - 50) < 1e-9
assert abs((g - infl) - 20) < 1e-9
assert abs((g - (C2024 - C2020)) - 8) < 1e-9
```

## Common mistakes
- Multiplying the wage by the CPI ÷ 100 instead of dividing, which makes the real wage bigger than the nominal one (MULTIPLIED_BY_CPI).
- Reading a CPI of 125 as "the wage lost 25 %" and taking 25 % off the wage; it really buys 1/1.25 = 80 % of what it did (PERCENT_OFF_WAGE).
- Dividing by the CPI and forgetting the factor 100 (FORGOT_100).
- Using current quantities in a Laspeyres index; that gives the Paasche index (PAASCHE_WEIGHTS).
- Averaging the price relatives without spending weights (UNWEIGHTED_RELATIVES).
- Dividing this year's spending by last year's spending, which measures price and quantity changes together (VALUE_INDEX).
- Adding up the prices without multiplying by quantities (SUM_OF_PRICES).
- Treating "wage growth minus inflation" as the exact real change (SUBTRACTED_INFLATION).
- Reading a rise in index points as a percentage when the index is not at 100 (CPI_POINTS).
- Reporting the nominal change as if it were the real change (NOMINAL_ONLY).
- Rebasing by subtracting a fixed number from every year instead of dividing (REBASE_SUBTRACTED).

## Practice
- `real-wage-deflated` (difficulty 1): a nominal wage in base-year prices, nominal ÷ CPI × 100; distractors MULTIPLIED_BY_CPI, PERCENT_OFF_WAGE, FORGOT_100.
- `laspeyres-price-index` (difficulty 2): Laspeyres price index of a 2–3 good basket from a price and quantity table; distractors PAASCHE_WEIGHTS, UNWEIGHTED_RELATIVES, VALUE_INDEX, SUM_OF_PRICES.
- `real-wage-change` (difficulty 3): percentage change in the real wage between two years when the CPI has an earlier base year; distractors SUBTRACTED_INFLATION, CPI_POINTS, NOMINAL_ONLY.

## Real world
- Inflation: the State Statistical Committee of Azerbaijan, like every national statistics office, publishes a monthly consumer price index; the inflation rate in the news is its percentage change, usually against the same month a year earlier.
- Real wages and pensions: wage statistics are deflated by the CPI to show whether living standards rose, and many governments raise pensions and benefits each year in line with the CPI.
- Monetary policy: central banks set interest rates to keep CPI inflation near a target; the CPI weights come from household budget surveys and are updated every few years.
- Substitution bias: in 1996 a US commission estimated that the US CPI overstated inflation by about one percentage point a year, partly because its fixed basket ignored switching between goods; this is one reason statistics offices now update weights more often or use chain indices (ST107).

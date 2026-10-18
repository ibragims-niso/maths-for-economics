---
id: F07
title: Exponential and logarithmic functions
block: F
coreYear: 1
prerequisites: [F01, F03]
estMinutes: 45
status: draft
economicUses:
  - Long-run economic growth and doubling times
  - "Inflation: how fast prices double and money loses value"
  - Average annual growth rates of GDP, prices and sales
  - Log-scale charts and log-linear models of economic data
  - Depreciation of machines, vehicles and other equipment
generators: [growth-time-to-multiply, average-annual-growth-rate, depreciation-time-to-value]
widgets: [doubling-time]
mistakeCodes:
  RULE_OF_70:
    label: Used the rule-of-70 estimate
    explanation: The rule of 70 (doubling time ≈ 70 ÷ growth rate in %) and its general form t ≈ ln k ÷ g replace ln(1 + g) by g. That is a quick estimate that works only for small rates. For the exact time use t = ln k ÷ ln(1 + g).
  LINEAR_CHANGE:
    label: Treated a percentage change as a fixed amount
    explanation: A constant percentage rate changes the value by a different amount each year, because each year's change applies to the new level. Adding or subtracting the same amount every year is linear change; percentage change multiplies the value by the same factor every year.
  PERCENT_NOT_DIVIDED:
    label: Used the percentage without dividing by 100
    explanation: A growth rate of 3 % means a growth factor of 1.03, not 1 + 3 = 4. Turn the percentage into a decimal before adding 1.
  MIXED_BASES:
    label: Mixed log and ln
    explanation: In a ratio of logarithms both must have the same base. Using ln for one and log₁₀ for the other changes the answer by a factor of about 2.3. Use ln for both; log₁₀ for both gives the same result.
  SIMPLE_AVERAGE:
    label: Spread the total change evenly over the years
    explanation: Dividing the total percentage change by the number of years ignores compounding, because each year's change applies to the new level. The yearly factor is the T-th root of the total factor, (end value ÷ start value)^(1/T); subtract 1 to get the rate.
  LOG_DIFFERENCE:
    label: Gave the log growth rate
    explanation: (ln of the end value − ln of the start value) ÷ T is the average growth in log points. It is close to the yearly rate when growth is slow, but always a little below it. The yearly rate is (end value ÷ start value)^(1/T) − 1.
  GROWTH_FACTOR:
    label: Forgot to subtract 1
    explanation: (end value ÷ start value)^(1/T) is the yearly growth factor, for example 1.043. The growth rate is the factor minus 1, here 0.043 or 4.3 %.
  COUNTED_YEARS:
    label: Counted the years, not the gaps between them
    explanation: From 2013 to 2023 there are 10 years of growth, not 11. The number of periods is the end year minus the start year.
  WRONG_START:
    label: Counted from the later observation
    explanation: The question asks for the time since purchase. If you solve from the later value, add the years that had already passed, or start from the purchase price.
  POWER_OF_PRODUCT:
    label: Treated a·bᵗ as (a·b)ᵗ
    explanation: In a·bᵗ only b is raised to the power t. Divide both sides by a first, then take logs.
  LOG_OF_SUM:
    label: Split the log of a sum
    explanation: ln(x + y) is not ln x + ln y. The log rules turn products into sums, ln(xy) = ln x + ln y, but there is no such rule for the log of a sum.
resources:
  - { title: "College Algebra 2e, 6.3 Logarithmic Functions (OpenStax)", url: "https://openstax.org/books/college-algebra-2e/pages/6-3-logarithmic-functions", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "College Algebra 2e, 6.6 Exponential and Logarithmic Equations (OpenStax)", url: "https://openstax.org/books/college-algebra-2e/pages/6-6-exponential-and-logarithmic-equations", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Principles of Economics 3e, 20.2 Labor Productivity and Economic Growth (OpenStax)", url: "https://openstax.org/books/principles-economics-3e/pages/20-2-labor-productivity-and-economic-growth", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
Two countries start equally rich. One grows at 2 % a year, the other at 4 %. After 35 years the first has about doubled its income per person; the second has almost quadrupled it. Questions such as "how long until prices double?" or "what yearly growth rate took GDP from 250 to 380 billion?" put the unknown in an exponent, and logarithms are the tool that brings it down. Economists also take logs of data all the time, because a change in $\ln y$ is close to the percentage change in $y$.

## Intuition
Linear change adds the same amount each period; exponential change multiplies by the same factor. A price index that starts at 100 and rises 5 % a year goes to 105, then 110.25, then 115.76: the yearly rises of 5, 5.25 and 5.51 get bigger because each one is applied to a higher level. A logarithm runs this backwards. It answers the question "to what power?": if prices have doubled, how many years of "times 1.05" did that take? Logs also turn ratios into differences. That is why economists draw long GDP series on a log scale, where steady percentage growth is a straight line and a slowdown shows up as a bend.

## Definition and formulas
**Exponential functions.** $y(t) = a\,b^t$, where $a > 0$ is the starting value and $b > 0$ is the growth factor per period.

- Growth at rate $g$ per period: $b = 1 + g$, so $y(t) = a(1 + g)^t$. A rate of 3 % means $b = 1.03$.
- Decay at rate $d$, for example depreciation: $b = 1 - d$, so $0 < b < 1$.

**The number $e$.** $e = 2.71828\ldots$ is the number that $\left(1 + \frac{1}{n}\right)^n$ approaches as $n$ grows: 2, 2.594, 2.705 and 2.717 for $n = 1, 10, 100, 1000$. Exponentials are often written with base $e$ as $y(t) = a\,e^{kt}$. Any $a\,b^t$ can be written this way with $k = \ln b$, because $b^t = e^{t \ln b}$.

**Logarithms.** A logarithm undoes an exponential: $\log_b x = y \iff b^y = x$, for $x > 0$. The natural logarithm is $\ln x = \log_e x$, so $\ln(e^x) = x$ and $e^{\ln x} = x$. Logs exist only for positive numbers, and $\ln x < 0$ when $0 < x < 1$.

Rules, for $x, y > 0$:
$$\ln(xy) = \ln x + \ln y, \qquad \ln\frac{x}{y} = \ln x - \ln y, \qquad \ln(x^p) = p\ln x, \qquad \ln 1 = 0$$

Change of base: $\log_b x = \dfrac{\ln x}{\ln b}$. So a ratio of two logs is the same in any base, as long as both logs use the same base.

**Solving for an exponent.**
$$a\,b^t = c \;\Rightarrow\; b^t = \frac{c}{a} \;\Rightarrow\; t = \frac{\ln(c/a)}{\ln b}$$

- Time for a value growing at rate $g$ to become $k$ times as large: $t = \dfrac{\ln k}{\ln(1 + g)}$.
- Rule of 70: doubling time $\approx 70 \div$ (growth rate in %). It works because $\ln 2 = 0.693$ and $\ln(1 + g) \approx g$ when $g$ is small.

**Average growth rate.** If a value goes from $Y_0$ to $Y_T$ in $T$ periods, the constant rate that links them is
$$g = \left(\frac{Y_T}{Y_0}\right)^{1/T} - 1.$$

**Logs and percentage changes.** For small changes,
$$\ln y_1 - \ln y_0 = \ln\frac{y_1}{y_0} \approx \frac{y_1 - y_0}{y_0}.$$
For example, $\ln 1.05 = 0.0488$, close to a 5 % rise, but $\ln 1.30 = 0.262$, well below a 30 % rise.

**Log-linear model.** Taking logs of $y = a(1 + g)^t$ gives $\ln y = \ln a + t\ln(1 + g)$: a straight line in $t$ with slope $\ln(1 + g) \approx g$. On a chart with a log scale, steady growth is a straight line, and a steeper line means faster growth.

## Interactive
::widget{id="doubling-time"}

The lilac curve is a price index that starts at 100 and grows at the rate $g$ each year; the dashed gold line instead adds the first year's rise every year, which is linear change. Drag the **growth rate** $g$. The solid dot marks the exact doubling time $\ln 2 / \ln(1 + g)$, where the curve crosses 200, and the hollow dot the rule-of-70 estimate. Notice that the curve pulls away from the straight line, and that the gap between the rule and the exact answer grows as $g$ rises. Check: at 6 % the panel shows 11.9 years exact and 11.67 years by the rule, as in Example 1; at 25 % the rule is off by almost 10 %.

## Worked examples

### Example 1 (easy): how long until prices double
Prices rise at 6 % a year. How many years until the price level doubles? Compare the answer with the rule of 70.

1. $P_0 \cdot 1.06^t = 2P_0 \;\Rightarrow\; 1.06^t = 2$
   *Why:* each year multiplies prices by 1.06, and the starting level $P_0$ is on both sides, so it cancels.
2. $t \ln 1.06 = \ln 2$
   *Why:* taking logs brings the exponent down, because $\ln(x^t) = t\ln x$.
3. $t = \dfrac{\ln 2}{\ln 1.06} = \dfrac{0.6931}{0.05827} = 11.90$ years
   *Why:* divide both sides by $\ln 1.06$, which is a positive number.
4. Rule of 70: $70 \div 6 = 11.67$ years, about 2 % below the exact answer.
   *Why:* the rule uses 0.70 for $\ln 2$ and 0.06 for $\ln 1.06 = 0.0583$; at higher rates the second gap grows.

```verify
g = 0.06; k = 2
t = log(k)/log(1 + g)
assert abs(log(2) - 0.6931) < 0.0001
assert abs(log(1.06) - 0.05827) < 0.00001
assert abs(t - 11.90) < 0.005
assert abs((1 + g)^t - 2) < 0.000001
rule = 70/6
assert abs(rule - 11.67) < 0.005
assert abs((t - rule)/t - 0.02) < 0.001
```

### Example 2 (medium): the average growth rate of GDP
Real GDP was 250 billion in 2012 and 380 billion in 2022. Find the average annual growth rate, then compare it with the log growth rate and with the simple average.

1. $T = 2022 - 2012 = 10$
   *Why:* count the years of growth between the two dates, not the years listed.
2. $\dfrac{380}{250} = 1.52$
   *Why:* only the growth factor over the whole period matters, not the units.
3. $1 + g = 1.52^{1/10} = 1.04276$, so $g = 4.28\%$
   *Why:* the rate must satisfy $(1 + g)^{10} = 1.52$, and the 10th root undoes the power of 10.
4. Log growth rate: $\dfrac{\ln 380 - \ln 250}{10} = \dfrac{\ln 1.52}{10} = 0.0419$, or $4.19\%$
   *Why:* a difference of logs is the log of the ratio. It is close to $g$ but a little below it, because $\ln(1 + g) < g$.
5. Simple average: $\dfrac{0.52}{10} = 5.2\%$ is too high, since $250 \times 1.052^{10} = 415$, not 380.
   *Why:* dividing the total growth by 10 ignores that each year's growth builds on the growth of the years before.

```verify
Y0 = 250; YT = 380; T = 2022 - 2012
assert T == 10
r = YT/Y0
assert r == 1.52
f = r^(1/T)
assert abs(f - 1.04276) < 0.00001
g = f - 1
assert abs(100*g - 4.28) < 0.005
assert abs(Y0*(1 + g)^T - YT) < 0.000001
lg = (log(YT) - log(Y0))/T
assert abs(lg - 0.0419) < 0.00005
assert lg < g
s = (r - 1)/T
assert abs(100*s - 5.2) < 0.000001
assert abs(Y0*(1 + s)^T - 415) < 0.5
```

### Example 3 (hard): when is a van worth a fifth of its price?
A delivery van bought for $30{,}000$ is worth $18{,}000$ three years later. If it loses the same percentage of its value every year, how many years after purchase will it be worth $6{,}000$?

1. $30{,}000\,b^3 = 18{,}000 \;\Rightarrow\; b = 0.6^{1/3} = 0.84343$
   *Why:* a fixed percentage loss multiplies the value by the same factor $b$ every year. So the van loses $1 - b = 15.66\%$ of its value a year.
2. $30{,}000\,b^t = 6{,}000 \;\Rightarrow\; b^t = 0.2$
   *Why:* divide by the purchase price first; $a\,b^t$ means $a$ times $b^t$, not $(ab)^t$.
3. $t = \dfrac{\ln 0.2}{\ln b} = \dfrac{3\ln 0.2}{\ln 0.6} = \dfrac{-4.8283}{-0.5108} = 9.45$ years
   *Why:* $\ln b = \frac{1}{3}\ln 0.6$ by the power rule. Both logs are negative because both numbers are below 1, so the time is positive.
4. Check: $30{,}000\,b^9 = 6{,}480$ and $30{,}000\,b^{10} = 5{,}465$
   *Why:* the value passes $6{,}000$ between years 9 and 10, as the answer says. Assuming a fixed loss of $4{,}000$ a year would give 6 years, far too soon: a fixed percentage of a shrinking value is a shrinking amount.

```verify
P = 30000; V = 18000; T = 3; C = 6000
b = (V/P)^(1/T)
assert abs(b - 0.84343) < 0.00001
assert abs((1 - b)*100 - 15.66) < 0.005
assert C/P == 0.2
t = log(C/P)/log(b)
assert abs(t - 9.45) < 0.005
assert abs(T*log(0.2) - (-4.8283)) < 0.0001
assert abs(log(0.6) - (-0.5108)) < 0.0001
assert abs(P*b^t - C) < 0.000001
assert abs(P*b^9 - 6480) < 0.000001
assert abs(P*b^10 - 5465) < 1
assert (P - V)/T == 4000
assert (P - C)/((P - V)/T) == 6
```

## Common mistakes
- Giving the rule-of-70 estimate when the exact time is asked for, or using it for large growth rates (RULE_OF_70).
- Adding the same amount every year instead of the same percentage (LINEAR_CHANGE).
- Writing the growth factor for 3 % as 1 + 3 instead of 1.03 (PERCENT_NOT_DIVIDED).
- Using $\log_{10}$ in one place and $\ln$ in another within the same formula (MIXED_BASES).
- Dividing the total growth by the number of years to get an average yearly rate (SIMPLE_AVERAGE).
- Reporting the average change in logs as if it were the yearly growth rate (LOG_DIFFERENCE).
- Forgetting to subtract 1 from the yearly growth factor (GROWTH_FACTOR).
- Counting the years from 2013 to 2023 as 11 instead of 10 (COUNTED_YEARS).
- Measuring time from a later observation when the question asks for the time since the start (WRONG_START).
- Treating $a\,b^t$ as $(ab)^t$ (POWER_OF_PRODUCT).
- Writing $\ln(x + y) = \ln x + \ln y$ (LOG_OF_SUM).
- Taking the log of zero or a negative number: logs exist only for positive numbers, so take logs of levels such as prices, GDP or wages, not of changes that can be negative.

## Practice
- `growth-time-to-multiply` (difficulty 1): years for GDP, prices, a population or sales growing at $g$ % a year to become $k$ times as large, $t = \ln k / \ln(1 + g)$; distractors RULE_OF_70, LINEAR_CHANGE, PERCENT_NOT_DIVIDED, MIXED_BASES.
- `average-annual-growth-rate` (difficulty 2): the constant yearly growth rate between two dated values, $g = (Y_T/Y_0)^{1/T} - 1$; distractors SIMPLE_AVERAGE, LOG_DIFFERENCE, GROWTH_FACTOR, COUNTED_YEARS.
- `depreciation-time-to-value` (difficulty 3): find an asset's yearly value factor from its price and a later value, then the time until it falls to a target value; distractors LINEAR_CHANGE, SIMPLE_AVERAGE, WRONG_START, MIXED_BASES.

## Real world
- Growth: a country growing at 2 % a year doubles its income per person in about 35 years; at 4 % the same 35 years almost quadruple it. Small differences in growth rates compound into large gaps between countries.
- Inflation: with prices rising 2 % a year, money loses half its purchasing power in about 35 years, which is why central banks care about inflation even when it looks small.
- Log scales: statistical offices and central banks often plot long series of GDP or prices on a log scale, where steady growth is a straight line and recessions show up as dips below the trend.
- Log-linear models: in a wage equation with $\ln(\text{wage})$ on the left and years of schooling on the right, a coefficient of 0.08 means that each extra year of schooling raises wages by about 8 % (see EM01).

---
id: ST107
title: "Time-series indicators: growth rates and averages"
block: ST1
coreYear: 1
prerequisites: [ST106, F07]
estMinutes: 40
status: draft
economicUses:
  - "GDP growth: yearly, quarterly and annualised rates"
  - Chain and base indices in statistical yearbooks
  - Monthly and annual inflation figures
  - Average growth of output, exports or wages over several years
generators: [base-index-from-chain-rates, annualised-growth-from-levels, average-growth-from-chain-indices]
widgets: [chain-base-growth]
mistakeCodes:
  SUM_OF_RATES:
    label: Added the growth rates
    explanation: Growth rates do not add up over several years, because each year's growth applies to the level already reached. Turn each rate into a factor (1 + rate ÷ 100) and multiply the factors.
  LAST_CHAIN_ONLY:
    label: Gave only the last year's chain index
    explanation: A chain index compares a year with the year before. The base index compares it with the base year, so it must include the growth of every year since then, multiplied together.
  MEAN_CHAIN_INDEX:
    label: Averaged the chain indices
    explanation: The average of the chain indices describes a typical year, not the total change since the base year. The base index is the product of the chain indices, not their average.
  GROWTH_NOT_INDEX:
    label: Gave the total growth instead of the index
    explanation: A base index of 108.65 means growth of 8.65 % since the base year. The question asked for the index, so keep the 100 in it.
  SIMPLE_ANNUALISING:
    label: Multiplied the rate by 4 or 12
    explanation: Annualising compounds the quarterly or monthly growth, because each period grows from the level the previous one reached. Use (1 + q)⁴ − 1 for a quarterly rate q and (1 + m)¹² − 1 for a monthly rate m. Multiplying by 4 or 12 always gives a slightly smaller number.
  NOT_ANNUALISED:
    label: Gave the rate for one period only
    explanation: The quarter-on-quarter (or month-on-month) rate is only the first step. An annualised rate says what a whole year would give at that pace, so raise the period's growth factor to the power 4 (or 12) and subtract 1.
  INDEX_POINTS:
    label: Read index points as per cent
    explanation: A rise from 126.4 to 127.3 is 0.9 index points but only 0.9 ÷ 126.4 = 0.71 %. Per cent changes divide by the earlier level; index points are just a difference.
  ARITHMETIC_MEAN_RATES:
    label: Took the arithmetic mean of the growth rates
    explanation: Adding the yearly rates and dividing by their number ignores that growth compounds. The right average is the geometric mean of the growth factors, (product of the factors)^(1/n), minus 1. It is never larger than the arithmetic mean.
  SIMPLE_AVERAGE:
    label: Spread the total growth evenly over the years
    explanation: Dividing the total growth since the start by the number of years treats growth as adding the same amount each year. Take the n-th root of the total growth factor instead, then subtract 1.
  AVERAGE_INDEX:
    label: Gave the average growth factor instead of the rate
    explanation: The geometric mean of the chain indices, for example 102.33 %, is an average index. The average growth rate is that minus 100, here 2.33 %.
  PERCENTAGE_POINTS:
    label: Mixed up percentage points and per cent
    explanation: When a rate falls from 6 % to 4.5 %, it falls by 1.5 percentage points, which is a 25 % fall in the rate. Differences of rates are in percentage points; per cent changes divide by the starting value.
resources:
  - { title: "Principles of Economics 3e, Appendix A: The Use of Mathematics in Principles of Economics (OpenStax)", url: "https://openstax.org/books/principles-economics-3e/pages/a-the-use-of-mathematics-in-principles-of-economics", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "System of national accounts and balance of payments: GDP growth indices (State Statistical Committee of the Republic of Azerbaijan)", url: "https://www.stat.gov.az/source/system_nat_accounts/?lang=en", kind: data, verifiedAt: 2026-10-18 }
  - { title: "Gross Domestic Product (GDP): quarterly and yearly growth rates (Office for National Statistics)", url: "https://www.ons.gov.uk/economy/grossdomesticproductgdp", kind: data, verifiedAt: 2026-10-18 }
---

## Why economists need this
Every statistics office publishes the same few numbers about a series over time: GDP grew by 1.1 % compared with last year; prices are 48 % higher than in the base year; the economy grew by 0.91 % this quarter, or 3.67 % at an annual rate. Each figure compares the series with a different reference point, and mixing them up gives wrong conclusions. A news report that monthly inflation was "only 0.5 %" hides an annual pace of 6.17 %. A government that claims "average growth of 2.42 % a year" by adding up yearly rates overstates what really happened. This topic gives the standard indicators of a time series and shows how they fit together.

## Intuition
A time series is a list of values of one variable at equal time steps: GDP each year, the price index each month. There are two ways to describe how it moves.

**Amounts add.** If GDP rises by 3 billion and then by 5 billion, it has risen by 8 billion.

**Percentages multiply.** If GDP falls by 10 % and then rises by 10 %, it does not get back to where it started: $0.9 \times 1.1 = 0.99$, so it ends 1 % lower. The second rise is 10 % of a smaller level.

This one fact drives everything else. A base index (growth since a fixed year) is the *product* of the yearly growth factors, not the sum of the rates. And the average growth rate is the rate that, *multiplied* in every year, gives the same total: the geometric mean of the factors. The arithmetic mean of $-10\%$ and $+10\%$ is 0, which suggests no change; the geometric mean, $\sqrt{0.99} - 1 = -0.5\%$, tells the truth.

## Definition and formulas
Take a series $y_0, y_1, \ldots, y_n$ observed at equal steps (years, quarters, months), with $y_0$ the first, or base, period.

**Absolute change (first difference)** in period $t$:
$$\Delta y_t = y_t - y_{t-1}.$$
Absolute changes add up: $\Delta y_1 + \cdots + \Delta y_n = y_n - y_0$. The **average absolute change** is $\overline{\Delta y} = \dfrac{y_n - y_0}{n}$.

**Chain index** (each period compared with the one before) and **base index** (each period compared with the base period), usually written in per cent:
$$i_t = \frac{y_t}{y_{t-1}} \times 100, \qquad I_t = \frac{y_t}{y_0} \times 100.$$
The **growth rate** is the index minus 100: $g_t = i_t - 100$ per cent. Without the 100, $y_t / y_{t-1}$ is the **growth factor**: a growth rate of $4\%$ is a factor of $1.04$, a fall of $6\%$ a factor of $0.94$. Some textbooks and statistical yearbooks call the index itself (for example 104 %) the "rate of growth" and $g_t$ the "rate of increase", so always check which one a table shows.

**The link between chain and base indices.** Written as factors,
$$\frac{y_t}{y_0} = \frac{y_1}{y_0} \cdot \frac{y_2}{y_1} \cdots \frac{y_t}{y_{t-1}}, \qquad \text{so} \qquad \frac{I_t}{100} = \frac{i_1}{100} \cdot \frac{i_2}{100} \cdots \frac{i_t}{100},$$
and in the other direction a chain index is the ratio of two consecutive base indices: $i_t = \dfrac{I_t}{I_{t-1}} \times 100$.

**Average growth rate.** The average growth factor is the **geometric mean** of the chain factors:
$$\bar{i} = \left(\frac{i_1}{100} \cdots \frac{i_n}{100}\right)^{1/n} = \left(\frac{y_n}{y_0}\right)^{1/n}, \qquad \bar{g} = \bar{i} - 1.$$
It is the one constant rate that takes $y_0$ to $y_n$ in $n$ steps, the same as the average annual growth rate of F07, but here it is usually computed from a table of chain indices. The arithmetic mean of the rates, $(g_1 + \cdots + g_n)/n$, is never smaller than $\bar{g}$, and the gap grows when the rates jump around.

**The value of one per cent of growth** in period $t$ is $\Delta y_t / g_t = y_{t-1}/100$ (with $g_t$ in per cent): how much the variable gains for each per cent it grows.

**Shorter periods.** For quarterly data the quarter-on-quarter rate is $q = y_t / y_{t-1} - 1$, and the year-on-year rate compares the same quarter a year earlier: $y_t / y_{t-4} - 1$. The year-on-year factor is the product of the last four quarterly factors. To **annualise** a quarterly or monthly rate, compound it over a year:
$$\text{annualised rate} = (1 + q)^4 - 1 \quad\text{(quarterly)}, \qquad (1 + m)^{12} - 1 \quad\text{(monthly)}.$$
For example, a monthly inflation rate of 0.5 % is an annual pace of $1.005^{12} - 1 = 6.17\%$.

**Percentage points and per cent.** A change in a rate is measured in percentage points: inflation falling from 6 % to 4.5 % is a fall of 1.5 percentage points, which is a 25 % fall in the inflation rate. In the same way, a base index rising from 102 to 106.875 rises by 4.875 index points, but by only $106.875/102 - 1 = 4.78\%$.

**Moving average.** To smooth out one-off jumps, replace each value by the average of it and its neighbours. The 3-period moving average is $m_t = (y_{t-1} + y_t + y_{t+1})/3$; it has no value for the first and last periods. For the growth rates of Example 2, $+4\%$, $-6\%$, $+8\%$, the moving average for the middle year is 2.00 %.

## Interactive
::widget{id="chain-base-growth"}

The graph shows six years of growth, 2019 to 2024, with 2018 $= 100$. Each bar is one year's growth drawn as the step it adds to the base index, with the rate under it, and the lilac line is the base index. Drag the sliders **Growth in 2020** and **Growth in 2021**. The green dashed curve grows by the geometric-mean rate every year and always lands exactly on the last base index (solid dot); the gold dashed curve uses the arithmetic mean of the rates and ends too high (hollow dot). Check: at the start (−6 % and +8 %) the panel shows a base index of 114.81, a geometric mean of 2.33 % and an arithmetic mean of 2.42 %, as in Example 2. Now set 2020 to −10 % and 2021 to +10 %: the arithmetic mean is 2.08 %, but the true average is only 1.90 % and the base index ends at 111.96, because a 10 % fall followed by a 10 % rise multiplies the level by 0.99.

## Worked examples

### Example 1 (easy): absolute changes, chain and base indices
A country's real GDP, in billions at constant prices, was 80.0 in 2019, 76.8 in 2020, 81.6 in 2021, 85.5 in 2022 and 86.4 in 2023. Find the absolute changes, the chain indices, the base indices with 2019 $= 100$ and the average absolute change, and check the link between the two kinds of index.

1. $\Delta y$: $76.8 - 80.0 = -3.2$, $\;+4.8$, $\;+3.9$, $\;+0.9$ billion
   *Why:* each absolute change is this year's level minus last year's. They add up to $86.4 - 80.0 = 6.4$ billion.
2. Chain indices: $\dfrac{76.8}{80.0} = 96.00\%$, $\;\dfrac{81.6}{76.8} = 106.25\%$, $\;\dfrac{85.5}{81.6} = 104.78\%$, $\;\dfrac{86.4}{85.5} = 101.05\%$
   *Why:* each year is compared with the year before, so GDP fell by 4 % in 2020 and grew by 6.25 %, 4.78 % and 1.05 % after that.
3. Base indices: $\dfrac{76.8}{80.0} = 96.00\%$, $\;\dfrac{81.6}{80.0} = 102.00\%$, $\;\dfrac{85.5}{80.0} = 106.875\%$, $\;\dfrac{86.4}{80.0} = 108.00\%$
   *Why:* each year is compared with the same base year, 2019. GDP in 2023 is 8 % above its 2019 level.
4. Link: $0.96 \times 1.0625 = 1.02$, and $\dfrac{106.875}{102.00} = 1.0478$
   *Why:* the base index for 2021 is the product of the chain indices for 2020 and 2021, and the chain index for 2022 is the ratio of two consecutive base indices. The base index rose by 4.875 index points in 2022, but the growth rate was 4.78 %.
5. $\overline{\Delta y} = \dfrac{86.4 - 80.0}{4} = 1.6$ billion a year; in 2021 each per cent of growth was worth $\dfrac{4.8}{6.25} = 0.768$ billion
   *Why:* there are 4 changes between 5 observations. The value of one per cent of growth equals last year's level divided by 100, $76.8/100$.

```verify
y0 = 80.0; y1 = 76.8; y2 = 81.6; y3 = 85.5; y4 = 86.4
assert abs((y1 - y0) - (-3.2)) < 1e-9
assert abs((y2 - y1) - 4.8) < 1e-9
assert abs((y3 - y2) - 3.9) < 1e-9
assert abs((y4 - y3) - 0.9) < 1e-9
assert abs((y1 - y0) + (y2 - y1) + (y3 - y2) + (y4 - y3) - 6.4) < 1e-9
assert abs(100*y1/y0 - 96) < 1e-9
assert abs(100*y2/y1 - 106.25) < 1e-9
assert abs(100*y3/y2 - 104.78) < 0.005
assert abs(100*y4/y3 - 101.05) < 0.005
assert abs(100*y2/y0 - 102) < 1e-9
assert abs(100*y3/y0 - 106.875) < 1e-9
assert abs(100*y4/y0 - 108) < 1e-9
assert abs((y1/y0)*(y2/y1) - 1.02) < 1e-9
assert abs(106.875/102 - 1.0478) < 0.00005
assert abs(106.875/102 - y3/y2) < 1e-12
assert abs((y1/y0)*(y2/y1)*(y3/y2)*(y4/y3) - y4/y0) < 1e-12
assert abs((y4 - y0)/4 - 1.6) < 1e-9
assert abs(4.8/6.25 - 0.768) < 1e-9
assert abs(106.875 - 102 - 4.875) < 1e-12
assert abs(y1/100 - 0.768) < 1e-9
```

### Example 2 (medium): average growth from chain indices
The chain indices of a country's real GDP (previous year $= 100$) for 2019 to 2024 were 104.0, 94.0, 108.0, 103.0, 102.0 and 103.5. Find the average annual growth rate from 2018 to 2024 and compare it with the arithmetic mean of the yearly rates.

1. $1.04 \times 0.94 \times 1.08 \times 1.03 \times 1.02 \times 1.035 = 1.148055$
   *Why:* the product of the chain factors is the growth over the whole period, so the base index for 2024 is 114.81 with 2018 $= 100$. Year by year the base index is 104.00, 97.76, 105.58, 108.75, 110.92 and 114.81.
2. $\bar{i} = 1.148055^{1/6} = 1.023278$
   *Why:* the average factor must give the same total when it is applied in each of the 6 years, so it is the 6th root of the total: the geometric mean of the factors.
3. $\bar{g} = 1.023278 - 1 = 2.33\%$ a year
   *Why:* the growth rate is the part of the factor above 1.
4. Arithmetic mean: $\dfrac{4 - 6 + 8 + 3 + 2 + 3.5}{6} = 2.42\%$, but $100 \times 1.024167^6 = 115.40$, not 114.81
   *Why:* six years at 2.42 % would overshoot the real 2024 level by 0.60 index points. The arithmetic mean treats the fall of 6 % and the rise of 8 % like two years of +1 %, but $0.94 \times 1.08 = 1.0152$ is less than $1.01^2 = 1.0201$. Spreading the total growth evenly, $14.81/6 = 2.47\%$, is wrong for the same reason.

```verify
f = [1.04, 0.94, 1.08, 1.03, 1.02, 1.035]
P = prod(f)
assert abs(P - 1.148055) < 0.0000005
assert abs(100*P - 114.81) < 0.005
assert abs(100*1.04*0.94 - 97.76) < 1e-9
assert abs(100*1.04*0.94*1.08 - 105.58) < 0.005
assert abs(100*1.04*0.94*1.08*1.03 - 108.75) < 0.005
assert abs(100*1.04*0.94*1.08*1.03*1.02 - 110.92) < 0.005
gbar = P^(1/6)
assert abs(gbar - 1.023278) < 0.0000005
assert abs(100*(gbar - 1) - 2.33) < 0.005
assert abs(100*gbar^6 - 100*P) < 1e-9
am = (4 - 6 + 8 + 3 + 2 + 3.5)/6
assert abs(am - 2.42) < 0.005
assert abs(100*(1 + am/100)^6 - 115.40) < 0.005
assert abs(100*(1 + am/100)^6 - 100*P - 0.60) < 0.005
assert abs(100*(P - 1)/6 - 2.47) < 0.005
assert abs(0.94*1.08 - 1.0152) < 1e-12
assert abs(1.01^2 - 1.0201) < 1e-12
# Moving average for the middle of 4, -6, 8 (Definition and formulas)
assert abs((4 - 6 + 8)/3 - 2) < 1e-9
# Intuition: a 10 % fall and a 10 % rise
assert abs(0.9*1.1 - 0.99) < 1e-12
assert abs(100*(sqrt(0.99) - 1) - (-0.5)) < 0.005
# Interactive check: 2020 at -10 %, 2021 at +10 %
Q = 1.04*0.9*1.1*1.03*1.02*1.035
assert abs(100*Q - 111.96) < 0.005
assert abs(100*(Q^(1/6) - 1) - 1.90) < 0.005
assert abs((4 - 10 + 10 + 3 + 2 + 3.5)/6 - 2.08) < 0.005
```

### Example 3 (hard): quarterly growth, annualised and year-on-year
Seasonally adjusted real GDP, in billions, was 250.0 in the first quarter of 2023, then 251.5, 252.0 and 253.8, and 256.1 in the first quarter of 2024. Find the quarter-on-quarter growth rate in Q1 2024 and its annualised rate, then the year-on-year growth rate, and explain why they differ.

1. $q = \dfrac{256.1}{253.8} - 1 = 0.0090623$, or $0.91\%$
   *Why:* quarter-on-quarter growth compares a quarter with the one just before it.
2. Annualised: $1.0090623^4 - 1 = 0.036745$, or $3.67\%$
   *Why:* this is the yearly rate if GDP kept growing at this pace for four quarters. Each quarter grows from the level the previous one reached, so compound; $4 \times 0.91\% = 3.62\%$ is a little too low.
3. Year-on-year: $\dfrac{256.1}{250.0} - 1 = 2.44\%$
   *Why:* year-on-year growth compares a quarter with the same quarter a year earlier, so seasonal patterns cancel and it covers a full year of actual growth.
4. Check: $1.006 \times 1.001988 \times 1.007143 \times 1.009062 = 1.0244$
   *Why:* the four quarter-on-quarter factors of the year (0.60 %, 0.20 %, 0.71 % and 0.91 %) multiply to the year-on-year factor, just as chain indices multiply to a base index.
5. The annualised rate is $3.67 - 2.44 = 1.23$ percentage points above the year-on-year rate
   *Why:* the annualised rate shows the pace of the latest quarter only, while the year-on-year rate averages the whole year. Here growth sped up at the end of the year. The gap between two rates is in percentage points, not per cent.

```verify
a = 250.0; b = 251.5; c = 252.0; d = 253.8; x = 256.1
q = x/d - 1
assert abs(q - 0.0090623) < 0.0000001
assert abs(100*q - 0.91) < 0.005
ann = (1 + q)^4 - 1
assert abs(ann - 0.036745) < 0.0000005
assert abs(100*ann - 3.67) < 0.005
assert abs(400*q - 3.62) < 0.005
assert 400*q < 100*ann
yoy = x/a - 1
assert abs(100*yoy - 2.44) < 1e-9
assert abs(b/a - 1.006) < 1e-12
assert abs(c/b - 1.001988) < 0.0000005
assert abs(d/c - 1.007143) < 0.0000005
assert abs(x/d - 1.009062) < 0.0000005
assert abs((b/a)*(c/b)*(d/c)*(x/d) - 1.0244) < 1e-12
assert abs(100*(c/b - 1) - 0.20) < 0.005
assert abs(100*(d/c - 1) - 0.71) < 0.005
assert abs(3.67 - 2.44 - 1.23) < 1e-9
# Definition: inflation from 6 % to 4.5 %
assert abs(6 - 4.5 - 1.5) < 1e-12
assert abs(100*(4.5 - 6)/6 - (-25)) < 1e-9
# INDEX_POINTS explanation: 126.4 to 127.3
assert abs(100*0.9/126.4 - 0.71) < 0.005
# Why economists need this: 0.5 % a month as an annual pace
assert abs(100*(1.005^12 - 1) - 6.17) < 0.005
```

## Common mistakes
- Adding the yearly growth rates to get growth since the base year, instead of multiplying the growth factors (SUM_OF_RATES).
- Reading the last chain index as if it were the base index (LAST_CHAIN_ONLY).
- Averaging the chain indices when the question asks for the base index (MEAN_CHAIN_INDEX).
- Giving the total growth, such as 8.65, when the base index, 108.65, was asked for (GROWTH_NOT_INDEX).
- Annualising a quarterly rate by multiplying it by 4, or a monthly rate by multiplying it by 12 (SIMPLE_ANNUALISING).
- Reporting the quarter-on-quarter rate when the annualised rate was asked for (NOT_ANNUALISED).
- Treating a rise in a price index of 0.9 index points as a rise of 0.9 % (INDEX_POINTS).
- Using the arithmetic mean of the yearly growth rates as the average growth rate (ARITHMETIC_MEAN_RATES).
- Dividing the total growth since the start by the number of years (SIMPLE_AVERAGE).
- Giving the average growth factor, such as 102.33, instead of the rate, 2.33 % (AVERAGE_INDEX).
- Calling a fall in inflation from 6 % to 4.5 % a fall of 1.5 % instead of 1.5 percentage points (PERCENTAGE_POINTS).
- Comparing an annualised quarterly rate from one country with a plain quarter-on-quarter or year-on-year rate from another: check which rate each table reports before comparing.

## Practice
- `base-index-from-chain-rates` (difficulty 1): base index for the last year from 3–5 yearly growth rates of GDP, output, prices or retail sales, $100 \times (1 + g_1)\cdots(1 + g_n)$; distractors SUM_OF_RATES, LAST_CHAIN_ONLY, MEAN_CHAIN_INDEX, GROWTH_NOT_INDEX.
- `annualised-growth-from-levels` (difficulty 2): annualised quarter-on-quarter GDP growth or month-on-month inflation from two levels, $(y_t / y_{t-1})^k - 1$ with $k = 4$ or $12$; distractors SIMPLE_ANNUALISING, NOT_ANNUALISED, INDEX_POINTS.
- `average-growth-from-chain-indices` (difficulty 3): average annual growth rate from 4–6 chain indices, the geometric mean of the factors minus 1; distractors ARITHMETIC_MEAN_RATES, SIMPLE_AVERAGE, AVERAGE_INDEX.

## Real world
- Statistical yearbooks: national statistics offices, such as the State Statistical Committee of Azerbaijan, publish GDP growth indices in per cent of the previous year (chain indices) next to tables against a fixed year (base indices). Moving between the two is exactly the product-and-ratio link of this topic.
- Chain-linked GDP: "real GDP at chain-linked volumes" is built by multiplying year-to-year volume indices, each computed with the previous year's prices, into one long base-index series.
- Quarterly GDP: some countries' headline figure is the annualised quarter-on-quarter rate, while others, such as the UK, headline the plain quarter-on-quarter change. A headline of 3.67 % in one country and 0.91 % in another can describe the same pace of growth.
- Inflation: monthly price changes are small numbers that compound. Central banks target the year-on-year (12-month) inflation rate, and analysts annualise recent monthly or 3-month changes to see whether inflation is speeding up or slowing down.

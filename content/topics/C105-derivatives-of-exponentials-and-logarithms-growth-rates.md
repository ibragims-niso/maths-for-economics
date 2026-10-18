---
id: C105
title: Derivatives of exponentials and logarithms; growth rates
block: C1
coreYear: 1
prerequisites: [C104, F07]
estMinutes: 45
status: draft
economicUses:
  - Growth rates of GDP, GDP per person, prices and wages
  - "Real wage growth: nominal wage growth minus inflation"
  - "Growth accounting: how much growth comes from capital, labour and productivity"
  - Log differences as approximate percentage changes in economic data
  - Elasticities as ratios of log changes
generators: [growth-rate-ratio-product, exp-log-derivative-at-point, growth-accounting-tfp]
widgets: [growth-rate-explorer]
mistakeCodes:
  SWAPPED_OPERATION:
    label: Added instead of subtracting, or the reverse
    explanation: Taking logs shows the rule. ln(xy) = ln x + ln y, so the growth rate of a product is the sum of the growth rates; ln(x/y) = ln x − ln y, so the growth rate of a ratio is the difference. A residual such as productivity growth is what is left after subtracting the inputs' contributions.
  LEVEL_RULE:
    label: Multiplied or divided the growth rates
    explanation: The levels are multiplied or divided, but their growth rates are added or subtracted. 3 % growth of prices and 2 % growth of quantity give revenue growth of 3 + 2 = 5 %, not 3 × 2 = 6 %.
  REVERSED_DIFFERENCE:
    label: Subtracted the wrong way round
    explanation: For x/y the growth rate is the growth rate of the top minus the growth rate of the bottom, gₓ − gᵧ. Real GDP per person grows at GDP growth minus population growth, not the other way round.
  FORGOT_CHAIN:
    label: Forgot the chain factor k
    explanation: The derivative of e^(kt) is k·e^(kt), not e^(kt). The inner function kt has derivative k, and the chain rule multiplies by it.
  DIVIDED_BY_K:
    label: Divided by k instead of multiplying
    explanation: e^(kt)/k is the function whose derivative is e^(kt), so it undoes differentiation rather than doing it. Differentiating e^(kt) multiplies by k.
  POWER_RULE_ON_EXP:
    label: Used the power rule on an exponential
    explanation: The power rule xⁿ → n·xⁿ⁻¹ is for a variable base and a fixed exponent. In e^(kt) the base is fixed and the variable is in the exponent, so the derivative is k·e^(kt), with the same exponent.
  NO_INNER_DERIVATIVE:
    label: Wrote 1/g without g′
    explanation: The derivative of ln x is 1/x, but the derivative of ln g(t) is g′(t)/g(t). The chain rule multiplies 1/g by the derivative of the inside.
  SLOPE_NOT_RATE:
    label: Gave the slope, not the growth rate
    explanation: The slope dS/dt is a change in units per year. The growth rate divides it by the level, S′/S = d ln S/dt, which turns it into a change in per cent of the level.
  LOG_OF_SUM:
    label: Split the log of a sum
    explanation: ln(at² + b) is not ln(at²) + ln b. There is no log rule for a sum, so keep the inside whole and use the chain rule, g′/g.
  FORGOT_EXPONENTS:
    label: Forgot the exponents
    explanation: In Y = A·K^α·L^(1−α), taking logs gives ln Y = ln A + α ln K + (1 − α) ln L. Each input's growth rate is weighted by its exponent, so capital growing at 5 % with α = 0.3 adds only 1.5 percentage points to output growth.
  SWAPPED_SHARES:
    label: Swapped the two exponents
    explanation: Capital's growth rate is multiplied by capital's exponent α, and labour's by labour's exponent 1 − α. Check which exponent belongs to which input before you substitute.
resources:
  - { title: "Calculus Volume 1, 3.9 Derivatives of Exponential and Logarithmic Functions (OpenStax)", url: "https://openstax.org/books/calculus-volume-1/pages/3-9-derivatives-of-exponential-and-logarithmic-functions", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Principles of Economics 3e, 20.3 Components of Economic Growth (OpenStax)", url: "https://openstax.org/books/principles-economics-3e/pages/20-3-components-of-economic-growth", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Principles of Economics 3e, 20.2 Labor Productivity and Economic Growth (OpenStax)", url: "https://openstax.org/books/principles-economics-3e/pages/20-2-labor-productivity-and-economic-growth", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
News reports say "GDP grew by 3.5 % but the population grew by 1.2 %, so income per person rose by 2.3 %", or "wages rose 7.5 % while prices rose 4.5 %, so real wages rose about 3 %". Both statements quietly use the calculus of logarithms: the growth rate of a ratio is the difference of the growth rates. Economists also want to know where growth comes from. Is a country richer because it built more machines, because more people work, or because it learned to use both better? Growth accounting answers this with one line of calculus applied to a production function.

## Intuition
A rise of 10 billion in GDP is a big event for a small economy and a small one for a large economy. What matters is the slope *relative to the level*: the growth rate, slope divided by level. Exponential functions are special because their slope is always proportional to their level: $e^t$ is its own derivative, so a path $y_0 e^{gt}$ rises by the same *percentage* every moment, even though its slope keeps getting steeper. Logarithms do the dividing for us. The derivative of $\ln y$ is $\dot y / y$, so "the growth rate of $y$" and "the slope of $\ln y$" are the same thing. And since logs turn products into sums and ratios into differences, growth rates of products and ratios are sums and differences of growth rates.

## Definition and formulas
**Exponentials.** Using the chain rule (C104) for the inner function where needed:
$$\frac{d}{dx}e^x = e^x, \qquad \frac{d}{dx}e^{kx} = k\,e^{kx}, \qquad \frac{d}{dx}a^x = a^x \ln a \quad (a > 0).$$
The last one follows from $a^x = e^{x \ln a}$, an exponential with $k = \ln a$.

**Logarithms.** For $x > 0$ and a positive function $g$:
$$\frac{d}{dx}\ln x = \frac{1}{x}, \qquad \frac{d}{dx}\ln g(x) = \frac{g'(x)}{g(x)}.$$

**Growth rate.** For a positive variable $y(t)$, where a dot means the derivative with respect to time, $\dot y = dy/dt$, the (instantaneous) growth rate is
$$g_y = \frac{\dot y}{y} = \frac{d \ln y}{dt}.$$
For $y = y_0 e^{gt}$ the slope is $\dot y = g\,y_0 e^{gt}$, so $\dot y / y = g$ at every moment. A value that grows by 3 % once a year, $y = y_0 \cdot 1.03^t$, has $\dot y / y = \ln 1.03 = 0.0296$, an instantaneous rate of 2.96 %. The other way round, an instantaneous rate of 3 % adds up to $e^{0.03} - 1 = 3.05\%$ over a year (FM02).

**Rules for growth rates.** Take logs, then differentiate with respect to $t$:
$$g_{xy} = g_x + g_y, \qquad g_{x/y} = g_x - g_y, \qquad g_{x^a} = a\,g_x.$$

- GDP per person $= Y/N$: if real GDP grows at 3.5 % and the population at 1.2 %, GDP per person grows at $3.5 - 1.2 = 2.3\%$.
- Real wage $= W/P$: real wage growth $=$ nominal wage growth $-$ inflation.
- Nominal GDP $= P \times Y$: nominal growth $=$ inflation $+$ real growth.

**Growth accounting.** With the production function $Y = A K^{\alpha} L^{1-\alpha}$, where $A$ is total factor productivity (TFP):
$$\ln Y = \ln A + \alpha \ln K + (1 - \alpha) \ln L \;\Rightarrow\; g_Y = g_A + \alpha\, g_K + (1 - \alpha)\, g_L.$$
Data give $g_Y$, $g_K$ and $g_L$; the TFP growth $g_A$ is the part of output growth the inputs do not explain.

**Log differences and percentage changes.** For data in steps,
$$\ln y_1 - \ln y_0 = \ln\left(1 + \frac{y_1 - y_0}{y_0}\right) \approx \frac{y_1 - y_0}{y_0},$$
and the exact percentage change is $e^{\ln y_1 - \ln y_0} - 1$. Log differences add and subtract exactly. Suppose a monthly wage rises from 800 to 860 (up 7.5 %) while the price index rises from 100 to 104.5 (up 4.5 %). In logs: $\ln 1.075 - \ln 1.045 = 0.0723 - 0.0440 = 0.0283$, so the real wage rose by $e^{0.0283} - 1 = 2.87\%$. Subtracting the percentages, $7.5 - 4.5 = 3.0\%$, is only an approximation.

**Logarithmic differentiation.** To differentiate a product of powers, take logs first, differentiate, then multiply back by the function. For $f(x) = x^x$: $\ln f = x \ln x$, so $f'/f = \ln x + 1$ and $f'(x) = x^x(\ln x + 1)$. Growth accounting above is exactly this trick.

**Elasticity as a ratio of log changes.** The price elasticity of demand (C107) is
$$\varepsilon = \frac{d \ln Q}{d \ln P} = \frac{dQ}{dP}\cdot\frac{P}{Q}.$$
For $Q = 500\,P^{-1.5}$, $\ln Q = \ln 500 - 1.5 \ln P$, so $\varepsilon = -1.5$ at every price.

## Interactive
::widget{id="growth-rate-explorer"}

The graph shows a GDP path $y = 400\,e^{gt}$. Move the *Time t* slider: the dot and its gold tangent line move along the curve, and the panel shows the level, the slope and slope ÷ level. With the defaults ($g = 3\%$, $t = 10$) the panel shows a level of 539.94, a slope of 16.2 and slope ÷ level of 3 %, the numbers of Example 1. As you move $t$, the level and the slope both grow, but slope ÷ level stays at 3 %. Now change the *Growth rate g* slider and see slope ÷ level follow it. Finally set *Vertical scale* to log: the graph now shows $\ln y$, and the curve becomes a straight line whose slope is the growth rate $g$.

## Worked examples

### Example 1 (easy): how fast is GDP rising?
Real GDP, in billions, follows $Y(t) = 400\,e^{0.03t}$, where $t$ is years from now. How fast is GDP rising in 10 years' time, and what is its growth rate then?

1. $Y'(t) = 400 \times 0.03\,e^{0.03t} = 12\,e^{0.03t}$
   *Why:* chain rule: the inner function $0.03t$ has derivative 0.03, which multiplies the exponential.
2. $Y(10) = 400\,e^{0.3} = 400 \times 1.34986 = 539.94$ billion
   *Why:* the level of GDP at $t = 10$, needed for the growth rate.
3. $Y'(10) = 12\,e^{0.3} = 16.20$ billion a year
   *Why:* substitute $t = 10$ into the derivative. This is the slope: the rise in GDP per year at that moment.
4. $\dfrac{Y'(10)}{Y(10)} = \dfrac{16.20}{539.94} = 0.03$, a growth rate of 3 % a year
   *Why:* slope ÷ level is $0.03$ at every $t$, because $e^{0.03t}$ cancels. Over a whole year GDP rises by $e^{0.03} - 1 = 3.05\%$.

```verify
A = 400; k = 0.03; t = 10
Y = A*exp(k*t)
dY = A*k*exp(k*t)
assert abs(exp(0.3) - 1.34986) < 0.00001
assert abs(Y - 539.94) < 0.005
assert abs(dY - 16.20) < 0.005
assert abs(dY/Y - k) < 0.000000001
h = 0.00001
assert abs((A*exp(k*(t + h)) - A*exp(k*(t - h)))/(2*h) - dY) < 0.0001
assert abs((exp(k) - 1)*100 - 3.05) < 0.005
```

### Example 2 (medium): the growth rate of a quadratic path
A firm's yearly sales, in thousand units, are $S(t) = 3t^2 + 52$, where $t$ is years since launch. Find the growth rate of sales after 4 years and after 8 years.

1. $\dfrac{d}{dt}\ln S(t) = \dfrac{S'(t)}{S(t)} = \dfrac{6t}{3t^2 + 52}$
   *Why:* the growth rate is the derivative of $\ln S$. By the chain rule, that is the inner derivative $6t$ over the inside $S$.
2. At $t = 4$: $S = 3(16) + 52 = 100$ and $S' = 24$
   *Why:* the level and the slope at that moment; sales rise by 24 thousand units a year.
3. $g_S(4) = \dfrac{24}{100} = 0.24$, or 24 % a year
   *Why:* the slope divided by the level.
4. At $t = 8$: $g_S(8) = \dfrac{48}{3(64) + 52} = \dfrac{48}{244} = 0.1967$, or 19.67 % a year
   *Why:* the slope has doubled, but the level has grown faster, so the growth rate falls. Unlike an exponential, a quadratic path does not grow at a constant rate.

```verify
a = 3; b = 52
S(x) = a*x^2 + b
dS(x) = 2*a*x
assert S(4) == 100
assert dS(4) == 24
g4 = dS(4)/S(4)
assert g4 == 0.24
h = 0.00001
assert abs((log(S(4 + h)) - log(S(4 - h)))/(2*h) - g4) < 0.000001
assert S(8) == 244
g8 = dS(8)/S(8)
assert abs(100*g8 - 19.67) < 0.005
assert g8 < g4
```

### Example 3 (hard): growth accounting
A country's output follows $Y = A K^{0.3} L^{0.7}$. Over a year, output grows at 4 %, the capital stock at 5 % and employment at 1 % (instantaneous rates). How fast did total factor productivity $A$ grow, and what share of the growth of output per worker does it explain?

1. $\ln Y = \ln A + 0.3 \ln K + 0.7 \ln L$
   *Why:* logs turn the product into a sum and bring the exponents down.
2. $g_Y = g_A + 0.3\,g_K + 0.7\,g_L$
   *Why:* differentiate both sides with respect to time; by the chain rule $\frac{d}{dt}\ln K = \dot K / K = g_K$, and the same for the other variables.
3. $g_A = 4 - 0.3(5) - 0.7(1) = 4 - 1.5 - 0.7 = 1.8\%$
   *Why:* TFP growth is the residual: output growth minus the contributions of capital (1.5 points) and labour (0.7 points).
4. Output per worker: $g_{Y/L} = g_Y - g_L = 4 - 1 = 3\%$
   *Why:* the growth rate of a ratio is the difference of the growth rates.
5. $g_{Y/L} = g_A + 0.3(g_K - g_L) = 1.8 + 0.3(4) = 3\%$, so TFP explains $1.8 / 3 = 60\%$ of it
   *Why:* subtract $g_L$ from both sides of step 2; the rest, 1.2 points, comes from more capital per worker.

```verify
alpha = 0.3; gY = 4; gK = 5; gL = 1
gA = gY - alpha*gK - (1 - alpha)*gL
assert abs(alpha*gK - 1.5) < 0.000001
assert abs((1 - alpha)*gL - 0.7) < 0.000001
assert abs(gA - 1.8) < 0.000001
gy = gY - gL
assert gy == 3
assert abs(gA + alpha*(gK - gL) - gy) < 0.000001
assert abs(gA/gy - 0.6) < 0.000001
# check with actual paths: ln Y(t) = ln A(t) + 0.3 ln K(t) + 0.7 ln L(t), each growing exponentially
lnY(x) = gA/100*x + alpha*(gK/100)*x + (1 - alpha)*(gL/100)*x
h = 0.00001
assert abs((lnY(2 + h) - lnY(2 - h))/(2*h) - 0.04) < 0.000001
```

## Common mistakes
- Adding growth rates where they should be subtracted, or the reverse (SWAPPED_OPERATION).
- Multiplying or dividing growth rates because the levels are multiplied or divided (LEVEL_RULE).
- Subtracting population growth from GDP growth the wrong way round (REVERSED_DIFFERENCE).
- Writing the derivative of $e^{kt}$ as $e^{kt}$, without the factor $k$ (FORGOT_CHAIN).
- Writing the derivative of $e^{kt}$ as $e^{kt}/k$ (DIVIDED_BY_K).
- Treating $e^{kt}$ like a power and writing $kt\,e^{kt-1}$ (POWER_RULE_ON_EXP).
- Writing the derivative of $\ln g(t)$ as $1/g(t)$ and forgetting $g'(t)$ (NO_INNER_DERIVATIVE).
- Reporting the slope $S'$ when the question asks for the growth rate $S'/S$ (SLOPE_NOT_RATE).
- Splitting $\ln(at^2 + b)$ into $\ln(at^2) + \ln b$ (LOG_OF_SUM).
- Leaving out the exponents $\alpha$ and $1 - \alpha$ in growth accounting (FORGOT_EXPONENTS).
- Giving capital the labour exponent and labour the capital exponent (SWAPPED_SHARES).
- Confusing a growth rate per year in steps with an instantaneous rate: 3 % once a year is $\ln 1.03 = 2.96\%$ instantaneous.

## Practice
- `growth-rate-ratio-product` (difficulty 1): the growth rate of GDP per person, a real wage, nominal GDP or revenue from the growth rates of its parts; distractors SWAPPED_OPERATION, LEVEL_RULE, REVERSED_DIFFERENCE.
- `exp-log-derivative-at-point` (difficulty 2): the slope of $A\,e^{kt}$ at a given time, or the growth rate $S'/S$ of $S(t) = at^2 + b$; distractors FORGOT_CHAIN, DIVIDED_BY_K, POWER_RULE_ON_EXP, NO_INNER_DERIVATIVE, SLOPE_NOT_RATE, LOG_OF_SUM.
- `growth-accounting-tfp` (difficulty 3): TFP growth as the residual $g_Y - \alpha g_K - (1 - \alpha) g_L$; distractors FORGOT_EXPONENTS, SWAPPED_SHARES, SWAPPED_OPERATION.

## Real world
- Living standards: statistics offices report real GDP growth and population growth; GDP per person grows at roughly the difference, which is why fast population growth can hide stagnant incomes.
- Wages and inflation: unions, employers and central banks compare nominal pay rises with inflation; the gap is the change in real wages, and in log points it is an exact difference.
- Growth accounting: studies of where growth comes from split output growth into contributions of capital, labour and the TFP residual, using exactly the formula of Example 3.
- Data work: economists take logs of GDP, prices and wages before analysing them, so that differences read as growth rates and slopes in regressions read as elasticities.

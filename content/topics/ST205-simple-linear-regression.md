---
id: ST205
title: Simple linear regression
block: ST2
coreYear: 2
prerequisites: [ST201, ST204]
estMinutes: 50
status: draft
economicUses:
  - Estimating a demand curve from prices and quantities sold
  - Measuring the marginal propensity to consume from household data
  - The wage gain linked to an extra year of education
  - "Okun's law: how unemployment moves with GDP growth"
  - Reading the coefficients, t statistics and R² of a regression table
generators: [regression-line-from-sums, ols-slope-from-data, regression-slope-t-statistic]
widgets: [least-squares-fit]
mistakeCodes:
  NO_CENTRING:
    label: Used Σxy/Σx² without subtracting the means
    explanation: The least-squares slope uses deviations from the means, Σ(x − x̄)(y − ȳ)/Σ(x − x̄)². Σxy/Σx² is the slope of a line forced through the origin, which can even have the wrong sign when the data lie far from 0.
  REVERSED_REGRESSION:
    label: Divided by the spread of y instead of x
    explanation: The slope of the regression of y on x is s_xy/s_x², the covariance over the variance of x. Dividing by Σ(y − ȳ)² gives the slope of the regression of x on y, a different line answering a different question.
  END_POINTS:
    label: Drew the line through the first and last points
    explanation: Joining two points ignores all the others, and the two end points may happen to have large errors. Least squares uses every point through Σ(x − x̄)(y − ȳ) and Σ(x − x̄)².
  INTERCEPT_SIGN:
    label: Added b₁x̄ instead of subtracting it
    explanation: The line passes through the point of means, ȳ = b₀ + b₁x̄, so b₀ = ȳ − b₁x̄. With a negative slope, subtracting b₁x̄ makes the intercept larger than ȳ, not smaller.
  SLOPE_UPSIDE_DOWN:
    label: Turned the slope fraction upside down
    explanation: The slope is Σ(x − x̄)(y − ȳ) divided by Σ(x − x̄)², the joint movement over the spread of x. Inverting it gives a number in units of x per unit of y.
  USED_MEAN_Y:
    label: Predicted ȳ, ignoring x
    explanation: ȳ is the best guess only when you know nothing about x. The fitted line uses the new x, ŷ = b₀ + b₁x₀, which equals ȳ only at x₀ = x̄.
  NO_INTERCEPT:
    label: Left out the intercept
    explanation: The prediction is b₀ + b₁x₀, not b₁x₀. Leaving out b₀ forces the line through the origin, which the data did not suggest.
  RESIDUAL_SHARE:
    label: Gave SSR/SST instead of R²
    explanation: SSR/SST is the share of the variation the line fails to explain. R² is the explained share, 1 − SSR/SST, so a good fit has a large R² and a small SSR/SST.
  R_NOT_R_SQUARED:
    label: Gave the correlation r instead of R²
    explanation: In simple regression R² is the square of the correlation, R² = r². Since |r| ≤ 1, r² is smaller than |r|; r = 0.7 means only 49 % of the variation is explained.
  DF_N:
    label: Divided SSR by n instead of n − 2
    explanation: Two numbers, b₀ and b₁, are estimated from the data, so only n − 2 residuals are free. s² = SSR/(n − 2); dividing by n makes the standard error too small and the t statistic too large.
  DF_N_MINUS_1:
    label: Divided SSR by n − 1 instead of n − 2
    explanation: n − 1 is right for the variance of one variable around its mean, where one number is estimated. A regression line estimates two, so the residual variance is SSR/(n − 2).
  VAR_NOT_SE:
    label: Used the variance s²/Σ(x − x̄)² instead of its square root
    explanation: s²/Σ(x − x̄)² is the variance of b₁. The standard error is its square root, s/√Σ(x − x̄)², and the t statistic divides by the standard error.
  EXTRAPOLATION:
    label: Predicted far outside the data
    explanation: The fitted line only describes the range of x in the data. Far outside it the relation may bend or break, so predictions there, including the intercept at x = 0, can be badly wrong.
  CORRELATION_CAUSATION:
    label: Read the slope as a causal effect
    explanation: A regression slope measures how y moves with x in the data. Other factors that move with x, or causation running from y to x, can create the slope without x causing y.
resources:
  - { title: "Introductory Statistics 2e, 12.3 The Regression Equation (OpenStax)", url: "https://openstax.org/books/introductory-statistics-2e/pages/12-3-the-regression-equation", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Introductory Statistics 2e, 12.5 Prediction (OpenStax)", url: "https://openstax.org/books/introductory-statistics-2e/pages/12-5-prediction", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Introductory Business Statistics 2e, 13.4 The Regression Equation (OpenStax)", url: "https://openstax.org/books/introductory-business-statistics-2e/pages/13-4-the-regression-equation", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
Economic theory says that demand curves slope down, that households spend part of each extra unit of income, and that unemployment falls when the economy grows fast. Theory rarely says **by how much**. A café owner wants to know how many fewer sandwiches she sells for each rise in price; a finance ministry needs the marginal propensity to consume to work out a multiplier (F11); a student wonders how much an extra year of education adds to hourly pay. Each question asks for the slope of a line through real, noisy data. **Simple linear regression** finds that line, says how well it fits, and, with the tools of ST204, tests whether the slope could just be noise. It is the workhorse of empirical economics: almost every applied paper reports a regression table, and multiple regression (EM01) is built on the same ideas.

## Intuition
Plot the data as a **scatter plot**: one dot per household, with income across and spending up. The dots rise from left to right but do not lie on a line, because spending also depends on family size, savings habits and many other things. We want the straight line that best summarises the cloud.

What does "best" mean? For any candidate line, each dot sits some vertical distance above or below it: its **residual**, the part of $y$ the line does not explain. A good line has small residuals. Adding them up does not work, since positive and negative residuals cancel (many bad lines have residuals that add up to zero). So we square them first and add: the **sum of squared residuals**, SSR. The **least-squares** line is the one with the smallest SSR. Squaring also punishes big misses heavily, so the line is pulled towards every point.

Its slope is the number we are after: how much $y$ changes, on average, when $x$ is one unit higher. The leftover scatter tells us two more things: how much of the variation in $y$ the line explains ($R^2$), and how precisely the slope is pinned down (its standard error), which lets us test whether the true slope could be zero.

## Definition and formulas
**Model.** We have $n$ pairs of observations $(x_i, y_i)$. The simple linear regression model is
$$y_i = \beta_0 + \beta_1 x_i + u_i, \qquad i = 1, \dots, n,$$
where $\beta_0$ (intercept) and $\beta_1$ (slope) are unknown population numbers, $y$ is the **dependent variable**, $x$ the **explanatory variable**, and the **error** $u_i$ collects everything else that affects $y_i$. The basic assumption is that the errors average zero whatever the value of $x$; then $\beta_0 + \beta_1 x$ is the average of $y$ among units with that $x$.

**Fitted line and residuals.** From the data we compute estimates $b_0$ and $b_1$ (also written $\hat\beta_0$, $\hat\beta_1$). The **fitted value** and the **residual** of observation $i$ are
$$\hat y_i = b_0 + b_1 x_i, \qquad e_i = y_i - \hat y_i.$$
The residual $e_i$ is what we can see; the error $u_i$ is what it estimates and is never observed.

**Least squares (OLS).** Ordinary least squares chooses $b_0$ and $b_1$ to make
$$\text{SSR} = \sum_{i=1}^n e_i^2 = \sum_{i=1}^n (y_i - b_0 - b_1 x_i)^2$$
as small as possible. Setting the two partial derivatives of SSR to zero (as in MV07) gives the **normal equations** $\sum e_i = 0$ and $\sum x_i e_i = 0$, whose solution is
$$b_1 = \frac{\sum (x_i - \bar x)(y_i - \bar y)}{\sum (x_i - \bar x)^2} = \frac{s_{xy}}{s_x^2}, \qquad b_0 = \bar y - b_1 \bar x,$$
where $s_{xy} = \frac{1}{n-1}\sum (x_i - \bar x)(y_i - \bar y)$ is the sample covariance and $s_x^2 = \frac{1}{n-1}\sum (x_i - \bar x)^2$ the sample variance of $x$ (the $n - 1$ cancels). The slope has the sign of the covariance (ST201), and with the sample correlation $r = s_{xy}/(s_x s_y)$ it can also be written $b_1 = r\, s_y / s_x$. It needs some spread in $x$: if every $x_i$ is the same, there is no slope to estimate.

**Properties of the fitted line.**

- It passes through the point of means $(\bar x, \bar y)$: this is the formula $b_0 = \bar y - b_1 \bar x$.
- The residuals add up to zero, $\sum e_i = 0$, so the fitted values have the same mean as the data, and the residuals are uncorrelated with $x$: $\sum x_i e_i = 0$.

**Interpretation in economic units.** The slope $b_1$ is measured in units of $y$ per unit of $x$: "each extra year of education goes with an hourly wage 1.5 higher", "each extra unit of price goes with 8 fewer sandwiches sold per day". In a consumption function $C = a + bY$ the slope is the marginal propensity to consume (F11). The intercept $b_0$ is the fitted $y$ at $x = 0$. Often $x = 0$ lies far outside the data (zero price, zero years of schooling), and then the intercept only places the line and has no economic meaning of its own.

**Sums of squares and $R^2$.** The total variation of $y$ around its mean splits exactly into an explained part and an unexplained part:
$$\underbrace{\sum (y_i - \bar y)^2}_{\text{SST (total)}} = \underbrace{\sum (\hat y_i - \bar y)^2}_{\text{SSE (explained)}} + \underbrace{\sum e_i^2}_{\text{SSR (residual)}}$$
The **coefficient of determination** is the explained share:
$$R^2 = \frac{\text{SSE}}{\text{SST}} = 1 - \frac{\text{SSR}}{\text{SST}}, \qquad 0 \le R^2 \le 1.$$
Since $\hat y_i - \bar y = b_1(x_i - \bar x)$, the explained part is $\text{SSE} = b_1^2 \sum (x_i - \bar x)^2 = b_1 \sum (x_i - \bar x)(y_i - \bar y)$, a quick way to get it from the sums. In simple regression $R^2 = r^2$, the square of the correlation between $x$ and $y$. Books differ in their labels: some call the residual sum "SSE" (sum of squared errors) and the explained one "SSR" (regression sum of squares). Always check which one is meant; $R^2$ is always the explained share.

**Standard error of the slope and the t test.** Another sample would give a different $b_1$. Its uncertainty is estimated from the residuals:
$$s^2 = \frac{\text{SSR}}{n - 2}, \qquad \operatorname{SE}(b_1) = \frac{s}{\sqrt{\sum (x_i - \bar x)^2}}.$$
We divide by $n - 2$ because two numbers, $b_0$ and $b_1$, were estimated from the data. The slope is pinned down more precisely when the points lie close to the line (small $s$), when there are many of them, and when the $x$ values are widely spread. To test whether $x$ is related to $y$ at all, test $H_0: \beta_1 = 0$ against $H_1: \beta_1 \ne 0$ with
$$t = \frac{b_1 - 0}{\operatorname{SE}(b_1)},$$
which follows a $t$ distribution with $n - 2$ degrees of freedom when $H_0$ is true, provided the errors are independent, have the same spread for every $x$ and are roughly normal (EM02 discusses these assumptions). Reject $H_0$ at level $\alpha$ when $|t| \ge t_{\alpha/2}$, using the table of ST204:
$$
\begin{array}{c|ccccc}
n - 2 & 10 & 15 & 20 & 25 & 30 \\ \hline
t_{0.025} \;(5\,\%) & 2.228 & 2.131 & 2.086 & 2.060 & 2.042 \\
t_{0.005} \;(1\,\%) & 3.169 & 2.947 & 2.845 & 2.787 & 2.750
\end{array}
$$
A 95 % confidence interval for the slope (ST203) is $b_1 \pm t_{0.025}\operatorname{SE}(b_1)$. The same $t$ statistic appears next to every coefficient in a regression table; EM03 extends the test to several coefficients.

**Prediction and extrapolation.** The fitted $y$ at a new value $x_0$ is $\hat y_0 = b_0 + b_1 x_0$. Inside the range of the data this is **interpolation** and usually reasonable. Outside it is **extrapolation**: the data say nothing about whether the straight line still holds there, so such predictions can be badly wrong.

**Correlation is not causation.** The slope says how $y$ moves with $x$ in the data, not what would happen if we changed $x$. Three things can produce a slope without $x$ causing $y$: an **omitted variable** that drives both (ability raises both schooling and pay), **reverse causation** ($y$ affects $x$), and **simultaneity**, as with market prices and quantities, which are set together by supply and demand, so a line through them need not trace either curve. A slope can be read causally only when $x$ varies for reasons unrelated to the other influences on $y$, as when a café sets its own prices in a planned trial. Adding the other factors as extra explanatory variables leads to multiple regression in matrix form (EM01).

## Interactive
::widget{id="least-squares-fit"}

The dots are the eight households of Example 2: monthly income $x$ across and consumption spending $y$ up, both in hundreds. The solid line is a line you choose with the **Slope b₁** and **Intercept b₀** sliders; the gold segments are its residuals, and **Your SSR** adds up their squares. The dashed green line is the least-squares line, whose SSR is shown as **Least-squares SSR**, next to its $R^2$. Check: at the start ($b_0 = 30$, $b_1 = 0.5$) the panel shows Your SSR = 652 against 176 for the least-squares line. Set the slope to 0.8 and the intercept to 10: your line lies on the dashed one, Your SSR drops to 176, and the caption confirms the residuals add up to 0. Now move the intercept to 12: every residual shrinks by 2, the caption shows that the residuals now add up to −16, and Your SSR rises to 208, which is $176 + 8 \times 2^2$. No setting of the sliders gets below 176, and the panel shows $R^2 = 0.939$, the 0.9385 of Example 2 rounded.

## Worked examples

### Example 1 (easy): estimating a café's demand curve
A café tries a different price $P$ for its lunch sandwich in each of five weeks and records the average number $Q$ sold per day:
$$\begin{array}{c|ccccc} P & 2 & 3 & 4 & 5 & 6 \\ \hline Q & 86 & 73 & 68 & 61 & 52 \end{array}$$
Estimate the demand line $\hat Q = b_0 + b_1 P$ by least squares and interpret it.

1. $\bar P = \dfrac{20}{5} = 4, \qquad \bar Q = \dfrac{340}{5} = 68$
   *Why:* the slope formula works with deviations from the means, and the fitted line will pass through $(\bar P, \bar Q) = (4, 68)$.
2. $P - \bar P = -2, -1, 0, 1, 2; \qquad Q - \bar Q = 18, 5, 0, -7, -16$
   *Why:* weeks with a price above average should have sales below average if demand slopes down; the signs show exactly that.
3. $\sum (P - \bar P)(Q - \bar Q) = -36 - 5 + 0 - 7 - 32 = -80, \qquad \sum (P - \bar P)^2 = 4 + 1 + 0 + 1 + 4 = 10$
   *Why:* the first sum measures how price and sales move together (negative: they move in opposite directions); the second measures the spread of the prices.
4. $b_1 = \dfrac{-80}{10} = -8$
   *Why:* this is the least-squares slope. Using $\sum PQ / \sum P^2 = 1280/90 \approx 14.22$ instead, without subtracting the means, would even give a rising demand curve.
5. $b_0 = \bar Q - b_1 \bar P = 68 - (-8)(4) = 100, \qquad \hat Q = 100 - 8P$
   *Why:* the line passes through the point of means. Each extra unit on the price goes with 8 fewer sandwiches a day. The intercept, 100 sandwiches at a price of 0, lies far outside the prices tried (2 to 6) and should not be read as a real forecast.
6. $\hat Q = 84, 76, 68, 60, 52; \qquad e = 2, -3, 0, 1, 0; \qquad \sum e = 0$
   *Why:* the residuals add up to zero, as least squares guarantees. At the means the price elasticity of demand (C107) is $-8 \times 4/68 \approx -0.47$, so demand is inelastic there. Because the café set the prices itself, the line traces its demand curve rather than a mix of supply and demand.

```verify
P = [2, 3, 4, 5, 6]; Q = [86, 73, 68, 61, 52]
assert sum(P) == 20 and sum(Q) == 340
pbar = mean(P); qbar = mean(Q)
assert pbar == 4 and qbar == 68
dP = P - pbar; dQ = Q - qbar
assert deepEqual(dP, [-2, -1, 0, 1, 2])
assert deepEqual(dQ, [18, 5, 0, -7, -16])
assert deepEqual(dP .* dQ, [-36, -5, 0, -7, -32])
sxy = sum(dP .* dQ); sxx = sum(dP .^ 2)
assert sxy == -80 and sxx == 10
b1 = sxy / sxx
assert b1 == -8
# without subtracting the means
assert sum(P .* Q) == 1280 and sum(P .^ 2) == 90
assert abs(1280 / 90 - 14.22) < 0.005
b0 = qbar - b1 * pbar
assert b0 == 100
fitted = b0 + b1 * P
assert deepEqual(fitted, [84, 76, 68, 60, 52])
res = Q - fitted
assert deepEqual(res, [2, -3, 0, 1, 0])
assert sum(res) == 0 and sum(P .* res) == 0
assert abs(b1 * pbar / qbar - (-0.47)) < 0.005
```

### Example 2 (medium): the marginal propensity to consume
Eight households report monthly disposable income $x$ and consumption spending $y$, both in hundreds:
$$\begin{array}{c|cccccccc} x & 20 & 30 & 40 & 50 & 60 & 70 & 80 & 90 \\ \hline y & 30 & 28 & 44 & 54 & 50 & 66 & 80 & 80 \end{array}$$
Fit the consumption line, find $R^2$, and predict the spending of a household with income 65 and of one with income 300.

1. $\bar x = \dfrac{440}{8} = 55, \quad \bar y = \dfrac{432}{8} = 54; \quad \sum (x - \bar x)^2 = 4200, \quad \sum (x - \bar x)(y - \bar y) = 3360, \quad \sum (y - \bar y)^2 = 2864$
   *Why:* these three sums, worked out from the deviations as in Example 1, hold everything needed for the line, $R^2$ and the correlation.
2. $b_1 = \dfrac{3360}{4200} = 0.8, \qquad b_0 = 54 - 0.8 \times 55 = 10, \qquad \hat y = 10 + 0.8x$
   *Why:* the slope is the estimated marginal propensity to consume: each extra 100 of income goes with 80 more of spending. With an MPC of 0.8 the simple multiplier of F11 would be $1/(1 - 0.8) = 5$.
3. $e = 4, -6, 2, 4, -8, 0, 6, -2; \qquad \sum e = 0; \qquad \text{SSR} = 16 + 36 + 4 + 16 + 64 + 0 + 36 + 4 = 176$
   *Why:* each residual is $y - (10 + 0.8x)$; for the first household $30 - 26 = 4$. No other line through these points has a smaller SSR, as the Try it widget lets you check.
4. $R^2 = 1 - \dfrac{176}{2864} = 0.9385$; check: $r = \dfrac{3360}{\sqrt{4200 \times 2864}} = 0.9688$ and $r^2 = 0.9385$
   *Why:* the line explains about 94 % of the variation of spending around its mean. The explained part is $\text{SSE} = 0.8 \times 3360 = 2688$, and $2688 + 176 = 2864 = \text{SST}$.
5. $\hat y(65) = 10 + 0.8 \times 65 = 62; \qquad \hat y(300) = 10 + 0.8 \times 300 = 250$
   *Why:* income 65 lies inside the data (20 to 90), so 62 is a sensible prediction. Income 300 is more than three times the largest income observed; richer households tend to save a larger share, so 250 is an extrapolation that the data cannot support.

```verify
x = [20, 30, 40, 50, 60, 70, 80, 90]; y = [30, 28, 44, 54, 50, 66, 80, 80]
assert sum(x) == 440 and sum(y) == 432
xbar = mean(x); ybar = mean(y)
assert xbar == 55 and ybar == 54
sxx = sum((x - xbar) .^ 2); sxy = sum((x - xbar) .* (y - ybar)); sst = sum((y - ybar) .^ 2)
assert sxx == 4200 and sxy == 3360 and sst == 2864
b1 = sxy / sxx; b0 = ybar - b1 * xbar
assert abs(b1 - 0.8) < 1e-12 and abs(b0 - 10) < 1e-12
assert abs(1 / (1 - b1) - 5) < 1e-9
res = y - (b0 + b1 * x)
assert max(abs(res - [4, -6, 2, 4, -8, 0, 6, -2])) < 1e-9
assert abs(30 - (b0 + b1 * 20) - 4) < 1e-9
assert abs(sum(res)) < 1e-9
ssr = sum(res .^ 2)
assert abs(ssr - 176) < 1e-9
r2 = 1 - ssr / sst
assert abs(r2 - 0.9385) < 0.00005
assert abs(r2 - 0.939) < 0.0005
r = sxy / sqrt(sxx * sst)
assert abs(r - 0.9688) < 0.00005
assert abs(r^2 - r2) < 1e-12
sse = b1 * sxy
assert abs(sse - 2688) < 1e-9 and abs(sse + ssr - sst) < 1e-9
assert abs(b0 + b1 * 65 - 62) < 1e-9
assert abs(b0 + b1 * 300 - 250) < 1e-9
# the widget: start line (30, 0.5), and the best line shifted up by 2
ssrline(a, b) = sum((y - (a + b * x)) .^ 2)
assert abs(ssrline(30, 0.5) - 652) < 1e-9
assert abs(ssrline(12, 0.8) - 208) < 1e-9 and abs(208 - (176 + 8 * 2^2)) < 1e-12
assert abs(sum(y - (12 + 0.8 * x)) - (-16)) < 1e-9
```

### Example 3 (hard): is the return to education significant?
A survey of $n = 27$ workers regresses the hourly wage $y$ on years of education $x$ and finds $b_1 = 1.5$, with $\sum (x - \bar x)^2 = 100$, $\text{SSR} = 900$ and $\text{SST} = 1125$. Test at the 5 % level whether wages are related to education, give a 95 % confidence interval for the slope, find $R^2$, and say whether 1.5 is the wage gain caused by one more year of education.

1. $s^2 = \dfrac{\text{SSR}}{n - 2} = \dfrac{900}{25} = 36, \qquad s = 6$
   *Why:* $s$ is the typical size of a residual, about 6 an hour. We divide by $n - 2 = 25$ because the intercept and the slope were both estimated from the same 27 workers.
2. $\operatorname{SE}(b_1) = \dfrac{s}{\sqrt{\sum (x - \bar x)^2}} = \dfrac{6}{\sqrt{100}} = 0.6$
   *Why:* the slope is uncertain because the points scatter widely around the line; a wider spread of education levels would have pinned it down better.
3. $H_0: \beta_1 = 0, \quad H_1: \beta_1 \ne 0; \qquad t = \dfrac{1.5}{0.6} = 2.5 \ge t_{0.025} = 2.060 \;(25 \text{ df})$: reject $H_0$ at 5 %
   *Why:* a slope 2.5 standard errors from zero would be rare if wages had no relation to education. At the 1 % level the critical value is 2.787 and $H_0$ would not be rejected, so the evidence is clear but not overwhelming.
4. $95\,\%\text{ CI}: \; 1.5 \pm 2.060 \times 0.6 = 1.5 \pm 1.236 = (0.264,\ 2.736)$
   *Why:* the data fit a wage gain anywhere from about 0.26 to 2.74 an hour per year of education; the interval excludes 0, matching the test, and its width shows how imprecise 27 workers are.
5. $R^2 = 1 - \dfrac{900}{1125} = 0.2$; check: $\text{SSE} = 1.5^2 \times 100 = 225 = 1125 - 900$
   *Why:* education explains only 20 % of the variation in wages, yet the slope is significant. A low $R^2$ does not make the slope wrong; it says that most wage differences come from other factors.
6. Causal reading: not established
   *Why:* workers with more schooling may also have more ability, better-connected families or live in richer regions, all of which raise wages. These omitted variables move with education, so 1.5 mixes the effect of schooling with theirs. Separating them needs multiple regression (EM01) or a natural experiment, such as a change in the school-leaving age.

```verify
n = 27; b1 = 1.5; sxx = 100; ssr = 900; sst = 1125
s2 = ssr / (n - 2)
assert s2 == 36
s = sqrt(s2)
assert s == 6
se = s / sqrt(sxx)
assert abs(se - 0.6) < 1e-12
tstat = b1 / se
assert abs(tstat - 2.5) < 1e-12
# t density with v degrees of freedom; tail(c, v) = area to the right of c (trapezium rule)
g(x, v) = gamma((v + 1) / 2) / (sqrt(v * pi) * gamma(v / 2)) * (1 + x .^ 2 / v) .^ (-(v + 1) / 2)
tail(c, v) = 0.5 - (sum(g((0:4000) * c / 4000, v)) - (g(0, v) + g(c, v)) / 2) * c / 4000
ok(c, v, a) = tail(c - 0.0005, v) > a and tail(c + 0.0005, v) < a
assert ok(2.228, 10, 0.025) and ok(2.131, 15, 0.025) and ok(2.086, 20, 0.025) and ok(2.060, 25, 0.025) and ok(2.042, 30, 0.025)
assert ok(3.169, 10, 0.005) and ok(2.947, 15, 0.005) and ok(2.845, 20, 0.005) and ok(2.787, 25, 0.005) and ok(2.750, 30, 0.005)
assert tstat >= 2.060 and tstat < 2.787
m = 2.060 * se
assert abs(m - 1.236) < 1e-12
assert abs((b1 - m) - 0.264) < 1e-12 and abs((b1 + m) - 2.736) < 1e-12
r2 = 1 - ssr / sst
assert abs(r2 - 0.2) < 1e-12
sse = b1^2 * sxx
assert abs(sse - 225) < 1e-12 and abs(sse - (sst - ssr)) < 1e-12
# the same t from the correlation: t = r sqrt(n - 2) / sqrt(1 - r^2)
r = sqrt(r2)
assert abs(r * sqrt(n - 2) / sqrt(1 - r2) - tstat) < 1e-9
```

## Common mistakes
- Using $\sum xy / \sum x^2$ as the slope without subtracting the means; that line is forced through the origin (NO_CENTRING).
- Dividing $\sum (x - \bar x)(y - \bar y)$ by $\sum (y - \bar y)^2$: that is the regression of $x$ on $y$, a different line (REVERSED_REGRESSION).
- Drawing the line through the first and the last point instead of using all the data (END_POINTS).
- Writing $b_0 = \bar y + b_1 \bar x$; the line passes through the means, so $b_0 = \bar y - b_1 \bar x$ (INTERCEPT_SIGN).
- Turning the slope fraction upside down, $\sum (x - \bar x)^2 / \sum (x - \bar x)(y - \bar y)$ (SLOPE_UPSIDE_DOWN).
- Predicting $\bar y$ for every new $x$, as if $x$ carried no information (USED_MEAN_Y).
- Predicting $b_1 x_0$ and forgetting the intercept (NO_INTERCEPT).
- Giving $\text{SSR}/\text{SST}$, the unexplained share, as $R^2$ (RESIDUAL_SHARE).
- Reporting the correlation $r$ as $R^2$; in simple regression $R^2 = r^2$ (R_NOT_R_SQUARED).
- Dividing SSR by $n$ when estimating $s^2$; the correct divisor is $n - 2$ (DF_N).
- Dividing SSR by $n - 1$, the divisor for the variance of a single variable; a line estimates two numbers, so use $n - 2$ (DF_N_MINUS_1).
- Using $s^2/\sum (x - \bar x)^2$, the variance of $b_1$, as its standard error without taking the square root (VAR_NOT_SE).
- Trusting predictions far outside the range of the data, including reading the intercept as a forecast at $x = 0$ (EXTRAPOLATION).
- Reading a regression slope as the effect $x$ causes, when omitted variables, reverse causation or simultaneity could produce it (CORRELATION_CAUSATION).
- Judging a model only by its $R^2$: a high $R^2$ does not prove the line is causal, and a low $R^2$ does not make a significant slope useless.

## Practice
- `regression-line-from-sums` (difficulty 1): from $\bar x$, $\bar y$, $\sum (x - \bar x)(y - \bar y)$ and $\sum (x - \bar x)^2$ for demand, consumption, wage or Okun's-law data, the intercept $b_0$ or a prediction $\hat y$ at a new $x$ (2 decimal places), or $R^2$ when $\sum (y - \bar y)^2$ is also given (3 decimal places); distractors INTERCEPT_SIGN, SLOPE_UPSIDE_DOWN, USED_MEAN_Y, NO_INTERCEPT, RESIDUAL_SHARE, R_NOT_R_SQUARED.
- `ols-slope-from-data` (difficulty 2): the least-squares slope $b_1 = \sum (x - \bar x)(y - \bar y)/\sum (x - \bar x)^2$ from a table of 5 or 6 observations (prices and sales, incomes and spending, education and wages, GDP growth and unemployment); distractors NO_CENTRING, REVERSED_REGRESSION, END_POINTS.
- `regression-slope-t-statistic` (difficulty 3): the $t$ statistic for $H_0: \beta_1 = 0$ from $n$, $b_1$, $\sum (x - \bar x)^2$ and SSR, via $s^2 = \text{SSR}/(n - 2)$ and $\operatorname{SE}(b_1) = s/\sqrt{\sum (x - \bar x)^2}$, to 2 decimal places; distractors DF_N, DF_N_MINUS_1, VAR_NOT_SE.

## Real world
- Demand estimation: retailers and competition authorities regress quantities sold on prices to estimate demand slopes and elasticities. Prices set in planned trials, or changed by events that shift only supply, are what allow the line to be read as a demand curve rather than a blend of supply and demand.
- The consumption function: regressions of household or national consumption on disposable income estimate the marginal propensity to consume, which feeds the fiscal multipliers that finance ministries use when planning tax cuts or spending programmes (F11).
- Okun's law: regressing the change in the unemployment rate on real GDP growth gives a negative slope well below 1 in size, so a point of extra growth lowers unemployment by only a fraction of a point; central banks and governments use such estimates to translate growth forecasts into unemployment forecasts.
- Education and wages: wage regressions on years of schooling are among the most studied in economics. The simple slope mixes the return to education with ability and family background, which is why researchers add more variables (EM01) and look for natural experiments such as changes in the minimum school-leaving age.

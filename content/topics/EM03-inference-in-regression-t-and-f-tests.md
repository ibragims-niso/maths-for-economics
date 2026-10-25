---
id: EM03
title: "Inference in regression: t and F tests"
block: EM
coreYear: 3
prerequisites: [EM02, ST204]
estMinutes: 50
status: draft
economicUses:
  - "Returns to education: is the wage effect of schooling real or sampling noise?"
  - "Testing economic theory: a unit price elasticity, a market beta of 1, constant returns to scale"
  - Deciding whether a group of regional or seasonal dummies belongs in a model
  - Reading the standard errors, t statistics, p-values and F statistic of a regression table
  - Confidence intervals for elasticities used in tax and pricing forecasts
searchTerms:
  - "T-test"
  - "F-test"
generators: [coefficient-t-statistic, f-statistic-restricted-ssr, t-statistic-from-xtx-inverse]
widgets: [regression-f-test]
mistakeCodes:
  NULL_NOT_SUBTRACTED:
    label: Forgot to subtract the value in H₀
    explanation: The t statistic is (b − β₀)/SE(b), the distance of the estimate from the value that H₀ claims. Dividing b alone by its standard error tests β = 0, a different hypothesis from β = 1 or β = −1.
  DIVIDED_BY_VARIANCE:
    label: Divided by the variance instead of the standard error
    explanation: The diagonal entry of s²(XᵀX)⁻¹ is the variance of bⱼ. The standard error is its square root, and the t statistic divides by the standard error. Dividing by the variance, a much smaller number, inflates t.
  SIGN_REVERSED:
    label: Subtracted the wrong way round
    explanation: The statistic is (estimate − null value)/SE, so an estimate below the value in H₀ gives a negative t. Writing β₀ − b flips the sign and points to the wrong tail in a one-sided test.
  SSR_OVER_N:
    label: Divided SSR by n instead of n − k
    explanation: k coefficients were estimated from the n observations, so only n − k residuals are free. s² = SSR/(n − k); dividing by n makes s² and the standard errors too small and t too large.
  DF_NO_INTERCEPT:
    label: Did not count the intercept in k
    explanation: k is the number of estimated coefficients, the intercept included. With m explanatory variables and an intercept, k = m + 1 and the residual degrees of freedom are n − m − 1.
  DF_SWAPPED:
    label: Swapped q and n − k in the F statistic
    explanation: The rise in SSR is divided by q, the number of restrictions, and SSR_U by n − k, the residual degrees of freedom. Swapping them usually gives a tiny F.
  NOT_DIVIDED_BY_Q:
    label: Forgot to divide the rise in SSR by q
    explanation: Each restriction raises SSR a little even when H₀ is true, so F averages the rise over the q restrictions. Without dividing by q, F is q times too large and H₀ is rejected too often.
  RESTRICTED_IN_DENOMINATOR:
    label: Used SSR_R in the denominator
    explanation: The denominator estimates the error variance, and only the unrestricted model gives a valid estimate whether or not H₀ is true. Use SSR_U/(n − k), with the unrestricted model's k.
  SEPARATE_T_TESTS:
    label: Tested a joint hypothesis with separate t tests
    explanation: Several coefficients can each be insignificant and still be significant together, especially when their regressors are correlated. A hypothesis about several coefficients needs one F test.
  NOT_SIGNIFICANT_MEANS_ZERO:
    label: Read "not significant" as "no effect"
    explanation: Failing to reject β = 0 only means the data cannot rule zero out. The confidence interval may still contain large effects; a small or noisy sample often cannot tell them apart from zero.
  SIGNIFICANT_MEANS_IMPORTANT:
    label: Read "significant" as "large" or "important"
    explanation: A tiny coefficient becomes statistically significant in a big enough sample. Whether it matters economically depends on its size and its units, which the t statistic does not show.
  R2_FORM_DIFFERENT_Y:
    label: Used the R² form when the dependent variable changed
    explanation: The R² form of F assumes both regressions explain the same y, so they share one SST. When imposing H₀ changes the dependent variable, as in ln(Q/K) for constant returns to scale, use the SSR form.
resources:
  - { title: "STAT 462, 5.6 The General Linear F-Test (Penn State)", url: "https://online.stat.psu.edu/stat462/node/135/", kind: course, verifiedAt: 2026-10-18 }
  - { title: "STAT 462, 5.5 Three Types of MLR Parameter Tests (Penn State)", url: "https://online.stat.psu.edu/stat462/node/134/", kind: course, verifiedAt: 2026-10-18 }
  - { title: "Introductory Statistics 2e, 13.2 The F Distribution and the F-Ratio (OpenStax)", url: "https://openstax.org/books/introductory-statistics-2e/pages/13-2-the-f-distribution-and-the-f-ratio", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
A regression (EM01) turns data into numbers: an extra year of education goes with a 7.2 % higher wage, the price elasticity of petrol is −1.32, three regional dummies have coefficients of a few per cent. Economic questions need more than numbers: **is** the education effect real, or could another sample have shown nothing? Is the demand for petrol unit elastic, as a tax planner might assume? Do wages differ between regions once education and experience are taken into account? Does a production function show constant returns to scale? Every estimate carries sampling noise (EM02), so these questions are hypothesis tests (ST204) about the coefficients. The **t test** handles a claim about one coefficient, the **F test** a claim about several at once. Together they produce the standard errors, t statistics, p-values, confidence intervals and the F statistic printed in every regression table.

## Intuition
Draw another sample of workers and OLS gives a slightly different $b$. The **standard error** of a coefficient measures how far $b_j$ typically lands from the true $\beta_j$. To test a claim such as "$\beta_j = 0$" or "$\beta_j = -1$", count how many standard errors the estimate lies from the claimed value, exactly as in ST204: a gap of half a standard error is common, a gap of four almost never happens by chance.

A claim about several coefficients, such as "all three regional dummies are zero", cannot be judged one coefficient at a time. Instead, run the regression twice: once freely (the **unrestricted** model) and once with the claim forced on it (the **restricted** model, here without the dummies). Forcing a restriction can only make the fit worse, so the sum of squared residuals rises. The question is whether it rises by more than chance would explain. The **F statistic** measures that rise per restriction, in units of the error variance: a value near 1 is what chance produces; a value far above 1 says the restrictions do not fit the data.

## Definition and formulas
**Assumptions.** The model is $y = X\beta + u$ with $n$ observations and $k$ coefficients, the intercept included (EM01). The tests below assume the conditions of EM02 (full rank, errors with mean zero given $X$, equal variances $\sigma^2$, no correlation between observations) plus **normally distributed errors**. Then the $t$ and $F$ distributions below are exact; in large samples they hold approximately even without normality. EM04 treats errors whose variance is not constant.

**Standard errors.** EM02 shows that $\operatorname{Var}(b) = \sigma^2 (X^\top X)^{-1}$. The unknown $\sigma^2$ is estimated by
$$s^2 = \frac{\text{SSR}}{n - k},$$
so the estimated covariance matrix of $b$ is $s^2 (X^\top X)^{-1}$. Its diagonal holds the variances of the coefficients. Writing $a_{jj}$ for the diagonal entry of $(X^\top X)^{-1}$ that belongs to $b_j$,
$$\operatorname{SE}(b_j) = \sqrt{s^2 a_{jj}} = s\sqrt{a_{jj}}.$$
With one regressor this is the $s/\sqrt{\sum (x - \bar x)^2}$ of ST205.

**The t test.** To test $H_0: \beta_j = \beta_0$ (a number fixed in advance),
$$t = \frac{b_j - \beta_0}{\operatorname{SE}(b_j)} \sim t_{n-k} \quad \text{if } H_0 \text{ is true},$$
the $t$ distribution with $n - k$ degrees of freedom. Against $H_1: \beta_j \neq \beta_0$, reject at level $\alpha$ when $|t| \ge t_{\alpha/2}$; against a one-sided $H_1$ that theory points to, such as $\beta_j > 0$, reject when $t \ge t_\alpha$. With $t_a$ the value that has area $a$ to its right:
$$
\begin{array}{c|ccc}
n - k & t_{0.05} & t_{0.025} & t_{0.005} \\ \hline
10 & 1.812 & 2.228 & 3.169 \\
20 & 1.725 & 2.086 & 2.845 \\
30 & 1.697 & 2.042 & 2.750 \\
40 & 1.684 & 2.021 & 2.704 \\
60 & 1.671 & 2.000 & 2.660 \\
120 & 1.658 & 1.980 & 2.617 \\
\infty & 1.645 & 1.960 & 2.576
\end{array}
$$
The case $\beta_0 = 0$ asks whether $x_j$ matters at all once the other regressors are held constant; its $t = b_j/\operatorname{SE}(b_j)$ is the "t statistic" column of a regression table, and a coefficient is called **statistically significant** when this test rejects. Economic theory often supplies other values: $\beta_0 = -1$ for a unit price elasticity (spending does not change with the price, C107), $\beta_0 = 1$ for a unit income elasticity or a market beta of 1.

**p-values in words.** The p-value is the probability, if $H_0$ were true, of a $t$ (or $F$) at least as far out as the one observed. Software prints the two-sided p-value for $\beta_j = 0$; for a one-sided test halve it when $t$ points the way of $H_1$. A p-value of 0.012 says: if the true elasticity were $-1$, an estimate this far from $-1$ would turn up in about 1.2 % of samples. It is not the probability that $H_0$ is true.

**Confidence intervals.** A $(1 - \alpha)$ confidence interval for $\beta_j$ is
$$b_j \pm t_{\alpha/2}\,\operatorname{SE}(b_j), \qquad t \text{ with } n - k \text{ degrees of freedom}.$$
It contains exactly the values $\beta_0$ that the two-sided test at level $\alpha$ does **not** reject, so one interval answers every "is $\beta_j$ equal to $\beta_0$?" question at once and also shows how large the effect could be.

**The F test for joint hypotheses.** A hypothesis with $q$ linear restrictions, such as $H_0: \beta_3 = \beta_4 = \beta_5 = 0$ ($q = 3$), is tested by estimating

- the **unrestricted** model, with $k$ coefficients and sum of squared residuals $\text{SSR}_U$, and
- the **restricted** model, with $H_0$ imposed, and $\text{SSR}_R \ge \text{SSR}_U$.

Then
$$F = \frac{(\text{SSR}_R - \text{SSR}_U)/q}{\text{SSR}_U/(n - k)} \sim F(q,\, n - k) \quad \text{if } H_0 \text{ is true}.$$
The numerator is the rise in SSR per restriction; the denominator is $s^2$ from the unrestricted model, the yardstick for how much SSR moves by chance. The $F(q, v)$ distribution lives on positive numbers, is skewed to the right and has mean $v/(v - 2)$, close to 1. Large values count against $H_0$, so the test always uses the right tail: reject at 5 % when $F \ge F_{0.05}(q, n - k)$. Five per cent critical values:
$$
\begin{array}{c|ccccc}
n - k & q = 1 & q = 2 & q = 3 & q = 4 & q = 5 \\ \hline
10 & 4.96 & 4.10 & 3.71 & 3.48 & 3.33 \\
20 & 4.35 & 3.49 & 3.10 & 2.87 & 2.71 \\
30 & 4.17 & 3.32 & 2.92 & 2.69 & 2.53 \\
40 & 4.08 & 3.23 & 2.84 & 2.61 & 2.45 \\
60 & 4.00 & 3.15 & 2.76 & 2.53 & 2.37 \\
120 & 3.92 & 3.07 & 2.68 & 2.45 & 2.29
\end{array}
$$

**The R² form.** When both models explain the same $y$, they share one $\text{SST}$ and $\text{SSR} = (1 - R^2)\,\text{SST}$, so
$$F = \frac{(R_U^2 - R_R^2)/q}{(1 - R_U^2)/(n - k)}.$$
The **overall F test** of a regression asks whether all $k - 1$ slopes are zero. The restricted model then has only an intercept, $R_R^2 = 0$, and
$$F = \frac{R^2/(k - 1)}{(1 - R^2)/(n - k)} \sim F(k - 1,\, n - k).$$
This is the "F statistic" printed under every regression table.

**One restriction: $t^2 = F$.** When $q = 1$, the $F$ statistic equals the square of the $t$ statistic for the same restriction, and $F_{0.05}(1, n - k) = t_{0.025}^2$ (for example $4.17 = 2.042^2$ at 30 degrees of freedom). The two tests always agree.

**Restrictions that are not zeros.** Constant returns to scale in $\ln Q = \beta_0 + \beta_1 \ln L + \beta_2 \ln K + u$ means $\beta_1 + \beta_2 = 1$, one restriction. Impose it by substituting $\beta_2 = 1 - \beta_1$:
$$\ln Q - \ln K = \beta_0 + \beta_1(\ln L - \ln K) + u,$$
so the restricted model regresses $\ln(Q/K)$ on $\ln(L/K)$ and its SSR is $\text{SSR}_R$. The dependent variable has changed, so here only the SSR form of $F$ is valid.

**Joint and separate tests.** Testing three coefficients one at a time is not the same as testing them together. Regressors that move together, such as experience and experience squared, can have small individual $t$ statistics because the data cannot separate their effects, while dropping both raises SSR a lot. A hypothesis about several coefficients needs one $F$ test.

**Statistical and economic significance.** Statistical significance says an effect is hard to explain as noise; economic significance says it is large enough to matter. With 100,000 workers a wage effect of 0.1 % can be highly significant and economically trivial; with 30 firms a large effect can fail to be significant. Report the estimate and its confidence interval, not only the stars.

## Interactive
::widget{id="regression-f-test"}

The curve is the $F(q, n - k)$ distribution, how the $F$ statistic behaves when $H_0$ is true. The gold right tail beyond the dashed line holds 5 % of the area: the rejection region. The lilac area beyond the observed $F$ is the p-value. Move **Restrictions q**, **Residual degrees of freedom n − k** and **Observed F**; the panel shows the 5 % critical value, the p-value and the decision. Check: the start values are Example 3 ($q = 3$, $n - k = 40$, $F = 2$), and the panel shows a critical value of 2.84, a p-value of 0.1294 and "do not reject H₀". Move the observed $F$ to 3: it enters the gold region and the decision becomes "reject H₀". Now raise $q$ step by step: the critical value falls (to 2.45 at $q = 5$), because averaging the rise in SSR over more restrictions makes chance values of $F$ cluster closer to 1. Finally set $q = 1$ and $n - k = 30$: the critical value is 4.17, and the caption shows that it is $2.042^2$, the square of the two-sided $t$ value, because $t^2 = F$ for one restriction.

## Worked examples

### Example 1 (easy): does education raise wages?
A regression of the log hourly wage on years of education, experience and tenure for $n = 64$ workers (intercept included) has $\text{SSR} = 15$. The education coefficient is $b_{\text{educ}} = 0.072$, and the diagonal entry of $(X^\top X)^{-1}$ that belongs to it is $0.001296$. Find its standard error, test whether education raises wages at the 5 % level, and give a 95 % confidence interval.

1. $k = 4, \qquad n - k = 64 - 4 = 60$
   *Why:* three explanatory variables plus the intercept; each estimated coefficient uses up one degree of freedom of the residuals.
2. $s^2 = \dfrac{\text{SSR}}{n - k} = \dfrac{15}{60} = 0.25, \qquad s = 0.5$
   *Why:* $s^2$ estimates the error variance $\sigma^2$; dividing by $n - k$ rather than $n$ makes it unbiased (EM02).
3. $\operatorname{SE}(b_{\text{educ}}) = \sqrt{0.25 \times 0.001296} = \sqrt{0.000324} = 0.018$
   *Why:* the variance of $b_{\text{educ}}$ is its diagonal entry of $s^2(X^\top X)^{-1}$; the standard error is the square root.
4. $H_0: \beta_{\text{educ}} = 0, \quad H_1: \beta_{\text{educ}} > 0; \qquad t = \dfrac{0.072 - 0}{0.018} = 4$
   *Why:* the question is whether education **raises** wages, so $H_1$ is one-sided. The estimate lies four standard errors above zero.
5. $t = 4 \ge t_{0.05} = 1.671 \;(60 \text{ df})$: reject $H_0$; software prints the two-sided $p = 0.0002$, so the one-sided p-value is about $0.0001$
   *Why:* if education had no effect, an estimate this far above zero would almost never happen. The two-sided test, with critical value 2.000, rejects too.
6. $95\,\%\text{ CI}: \; 0.072 \pm 2.000 \times 0.018 = 0.072 \pm 0.036 = (0.036,\ 0.108)$
   *Why:* in a log-wage equation $100\,b$ is close to the percentage effect, so one more year of education goes with roughly 3.6 % to 10.8 % higher wages, holding experience and tenure constant. The interval shows the effect is not only significant but economically large.

```verify
# t density with v degrees of freedom; ttail(c, v) = area to the right of c (substitute x = c/u, midpoint rule)
U = ((1:2000) - 0.5) / 2000
td(x, v) = gamma((v + 1) / 2) / (sqrt(v * pi) * gamma(v / 2)) * (1 + x .^ 2 / v) .^ (-(v + 1) / 2)
ttail(c, v) = sum(td(c ./ U, v) .* (c ./ U .^ 2)) / 2000
ok(c, v, a) = ttail(c - 0.0005, v) > a and ttail(c + 0.0005, v) < a
assert ok(1.812, 10, 0.05) and ok(2.228, 10, 0.025) and ok(3.169, 10, 0.005)
assert ok(1.725, 20, 0.05) and ok(2.086, 20, 0.025) and ok(2.845, 20, 0.005)
assert ok(1.697, 30, 0.05) and ok(2.042, 30, 0.025) and ok(2.750, 30, 0.005)
assert ok(1.684, 40, 0.05) and ok(2.021, 40, 0.025) and ok(2.704, 40, 0.005)
assert ok(1.671, 60, 0.05) and ok(2.000, 60, 0.025) and ok(2.660, 60, 0.005)
assert ok(1.658, 120, 0.05) and ok(1.980, 120, 0.025) and ok(2.617, 120, 0.005)
Phi(z) = 0.5 * (1 + erf(z / sqrt(2)))
okz(c, a) = 1 - Phi(c - 0.0005) > a and 1 - Phi(c + 0.0005) < a
assert okz(1.645, 0.05) and okz(1.960, 0.025) and okz(2.576, 0.005)
# the example
n = 64; k = 4; ssr = 15; a = 0.001296; b = 0.072
assert n - k == 60
s2 = ssr / (n - k)
assert s2 == 0.25 and sqrt(s2) == 0.5
v = s2 * a
assert abs(v - 0.000324) < 1e-12
se = sqrt(v)
assert abs(se - 0.018) < 1e-12
tstat = b / se
assert abs(tstat - 4) < 1e-9
assert tstat >= 1.671 and tstat >= 2.000
p2 = 2 * ttail(tstat, 60)
assert abs(p2 - 0.0002) < 0.00005
assert abs(p2 / 2 - 0.0001) < 0.00005
m = 2.000 * 0.018
assert abs(m - 0.036) < 1e-12
assert abs((b - m) - 0.036) < 1e-12 and abs((b + m) - 0.108) < 1e-12
```

### Example 2 (medium): is the demand for petrol unit elastic?
Using $n = 33$ months of data, a regression of the log quantity of petrol sold on its log price and log household income (intercept included) gives a price coefficient $b_1 = -1.32$ with $\operatorname{SE}(b_1) = 0.12$. In this log–log model $b_1$ is the price elasticity of demand. Is the price significant? Is demand unit elastic? Give a 95 % confidence interval.

1. $n - k = 33 - 3 = 30; \qquad t = \dfrac{-1.32}{0.12} = -11$
   *Why:* the significance test of $H_0: \beta_1 = 0$. An estimate eleven standard errors from zero leaves no doubt that the price matters.
2. $H_0: \beta_1 = -1, \qquad H_1: \beta_1 \neq -1$
   *Why:* with an elasticity of $-1$, spending on petrol does not change when the price changes (C107). A tax planner needs to know whether demand is more or less elastic than that, so the test is two-sided.
3. $t = \dfrac{-1.32 - (-1)}{0.12} = \dfrac{-0.32}{0.12} = -2.67$
   *Why:* the evidence against $H_0$ is the distance of the estimate from $-1$, not from 0.
4. $|t| = 2.67 \ge t_{0.025} = 2.042$, but $2.67 < t_{0.005} = 2.750$ (30 df)
   *Why:* $H_0$ is rejected at 5 % but not at 1 %, so $0.01 < p < 0.05$; software gives $p = 0.012$. If demand really were unit elastic, an estimate this far from $-1$ would appear in about 1.2 % of samples.
5. $95\,\%\text{ CI}: \; -1.32 \pm 2.042 \times 0.12 = -1.32 \pm 0.245 = (-1.565,\ -1.075)$
   *Why:* $-1$ lies outside the interval, the same conclusion as the test. Demand is elastic: a 10 % price rise cuts the quantity by roughly 11 % to 16 %, so spending on petrol falls. That difference from $-1$ is large enough to change a forecast of fuel-tax revenue, so the result matters economically as well as statistically.

```verify
U = ((1:2000) - 0.5) / 2000
td(x, v) = gamma((v + 1) / 2) / (sqrt(v * pi) * gamma(v / 2)) * (1 + x .^ 2 / v) .^ (-(v + 1) / 2)
ttail(c, v) = sum(td(c ./ U, v) .* (c ./ U .^ 2)) / 2000
n = 33; k = 3; b = -1.32; se = 0.12
assert n - k == 30
assert abs(b / se - (-11)) < 1e-12
tstat = (b - (-1)) / se
assert abs((b + 1) - (-0.32)) < 1e-12
assert abs(tstat - (-2.6667)) < 0.0001
assert abs(abs(tstat) - 2.67) < 0.005
assert abs(tstat) >= 2.042 and abs(tstat) < 2.750
p = 2 * ttail(abs(tstat), 30)
assert abs(p - 0.012) < 0.0005
assert p > 0.01 and p < 0.05
m = 2.042 * se
assert abs(m - 0.24504) < 1e-12
assert abs((b - m) - (-1.565)) < 0.0005 and abs((b + m) - (-1.075)) < 0.0005
assert b + m < -1
# a 10 % price rise: quantity falls by 10 times the elasticity, in per cent
assert abs(10 * (b + m) - (-10.75)) < 0.01 and abs(10 * (b - m) - (-15.65)) < 0.01
```

### Example 3 (hard): are regional wage differences jointly significant?
A wage equation for $n = 46$ workers regresses the log hourly wage on education, experience and dummies for three of four regions (North, South and East; West is the base group). The unrestricted model has $\text{SSR}_U = 8.0$; without the three dummies, $\text{SSR}_R = 9.2$. The total sum of squares is $\text{SST} = 20$. Test at 5 % whether the regional dummies are jointly significant, check with the $R^2$ form, compute the overall $F$ statistic, and relate one dummy's test to $t^2 = F$.

1. $H_0: \delta_N = \delta_S = \delta_E = 0, \qquad q = 3, \quad k = 6, \quad n - k = 46 - 6 = 40$
   *Why:* "no regional differences" sets three coefficients to zero, three restrictions. The unrestricted model has an intercept, two worker variables and three dummies.
2. $F = \dfrac{(9.2 - 8.0)/3}{8.0/40} = \dfrac{0.4}{0.2} = 2$
   *Why:* dropping the dummies raises SSR by 1.2, or 0.4 per restriction, while chance alone moves SSR by about $s^2 = 0.2$ per restriction.
3. $F = 2 < F_{0.05}(3, 40) = 2.84$: do not reject $H_0$ ($p = 0.13$)
   *Why:* a rise in SSR this large happens in about 13 % of samples even when regions do not matter. The data give no clear evidence of regional wage differences once education and experience are held constant, which is not proof that there are none.
4. $R_U^2 = 1 - \dfrac{8}{20} = 0.6, \quad R_R^2 = 1 - \dfrac{9.2}{20} = 0.54, \quad F = \dfrac{(0.6 - 0.54)/3}{(1 - 0.6)/40} = \dfrac{0.02}{0.01} = 2$
   *Why:* both models explain the same $y$, so they share one SST and the $R^2$ form gives the same $F$.
5. Overall: $F = \dfrac{0.6/5}{0.4/40} = \dfrac{0.12}{0.01} = 12 > F_{0.05}(5, 40) = 2.45$
   *Why:* the overall test sets all $k - 1 = 5$ slopes to zero, and that is clearly rejected: education and experience matter even though the regional dummies, as a group, do not show it.
6. Dropping only the North dummy gives $\text{SSR} = 8.45$: $\;F = \dfrac{0.45/1}{0.2} = 2.25 = 1.5^2 < 4.08 \approx 2.021^2$
   *Why:* with one restriction $F = t^2$, so the North dummy's $t$ statistic is $\pm 1.5$, below the two-sided critical value 2.021 for 40 degrees of freedom. Its $F$ test and its $t$ test are the same test.

```verify
U = ((1:2000) - 0.5) / 2000
fd(x, a, b) = gamma((a + b) / 2) / (gamma(a / 2) * gamma(b / 2)) * (a / b) ^ (a / 2) * x .^ (a / 2 - 1) .* (1 + a * x / b) .^ (-(a + b) / 2)
ftail(c, a, b) = sum(fd(c ./ U, a, b) .* (c ./ U .^ 2)) / 2000
# a table entry c is right to 2 decimals if the area 0.05 is crossed between c - 0.005 and c + 0.005
okf(c, a, b) = ftail(c - 0.005, a, b) > 0.05 and ftail(c + 0.005, a, b) < 0.05
assert okf(4.96, 1, 10) and okf(4.10, 2, 10) and okf(3.71, 3, 10) and okf(3.48, 4, 10) and okf(3.33, 5, 10)
assert okf(4.35, 1, 20) and okf(3.49, 2, 20) and okf(3.10, 3, 20) and okf(2.87, 4, 20) and okf(2.71, 5, 20)
assert okf(4.17, 1, 30) and okf(3.32, 2, 30) and okf(2.92, 3, 30) and okf(2.69, 4, 30) and okf(2.53, 5, 30)
assert okf(4.08, 1, 40) and okf(3.23, 2, 40) and okf(2.84, 3, 40) and okf(2.61, 4, 40) and okf(2.45, 5, 40)
assert okf(4.00, 1, 60) and okf(3.15, 2, 60) and okf(2.76, 3, 60) and okf(2.53, 4, 60) and okf(2.37, 5, 60)
assert okf(3.92, 1, 120) and okf(3.07, 2, 120) and okf(2.68, 3, 120) and okf(2.45, 4, 120) and okf(2.29, 5, 120)
# q = 2 has a closed form: P(F > x) = (1 + 2x/v)^(-v/2)
assert abs(ftail(3.49, 2, 20) - (1 + 2 * 3.49 / 20) ^ (-10)) < 1e-6
# t^2 = F for one restriction
assert abs(2.042^2 - 4.17) < 0.005 and abs(2.021^2 - 4.08) < 0.005
# the example
n = 46; k = 6; q = 3; ssru = 8.0; ssrr = 9.2; sst = 20
assert n - k == 40
F = ((ssrr - ssru) / q) / (ssru / (n - k))
assert abs((ssrr - ssru) - 1.2) < 1e-12 and abs((ssrr - ssru) / q - 0.4) < 1e-12 and ssru / (n - k) == 0.2
assert abs(F - 2) < 1e-12
assert F < 2.84
assert abs(ftail(F, 3, 40) - 0.13) < 0.005
r2u = 1 - ssru / sst
r2r = 1 - ssrr / sst
assert abs(r2u - 0.6) < 1e-12 and abs(r2r - 0.54) < 1e-12
assert abs(((r2u - r2r) / q) - 0.02) < 1e-12 and abs((1 - r2u) / (n - k) - 0.01) < 1e-12
assert abs(((r2u - r2r) / q) / ((1 - r2u) / (n - k)) - F) < 1e-9
Fall = (r2u / (k - 1)) / ((1 - r2u) / (n - k))
assert abs(r2u / (k - 1) - 0.12) < 1e-12
assert abs(Fall - 12) < 1e-9 and Fall > 2.45
F1 = ((8.45 - ssru) / 1) / (ssru / (n - k))
assert abs(F1 - 2.25) < 1e-9 and abs(sqrt(F1) - 1.5) < 1e-9
assert sqrt(F1) < 2.021 and F1 < 4.08
# the F test with one restriction and the two-sided t test give the same p-value
ttail1(c, v) = sum((gamma((v + 1) / 2) / (sqrt(v * pi) * gamma(v / 2)) * (1 + (c ./ U) .^ 2 / v) .^ (-(v + 1) / 2)) .* (c ./ U .^ 2)) / 2000
assert abs(ftail(F1, 1, 40) - 2 * ttail1(1.5, 40)) < 1e-6
```

## Common mistakes
- Testing $\beta = -1$ or $\beta = 1$ with $b/\operatorname{SE}(b)$, the statistic for $\beta = 0$; subtract the value in $H_0$ first (NULL_NOT_SUBTRACTED).
- Dividing by the variance $s^2 a_{jj}$ instead of its square root, the standard error (DIVIDED_BY_VARIANCE).
- Writing $\beta_0 - b_j$ on top, which flips the sign of $t$ (SIGN_REVERSED).
- Estimating $\sigma^2$ by $\text{SSR}/n$ instead of $\text{SSR}/(n - k)$ (SSR_OVER_N).
- Counting only the explanatory variables in $k$ and forgetting the intercept, which gives the wrong degrees of freedom (DF_NO_INTERCEPT).
- Swapping $q$ and $n - k$ in the $F$ statistic (DF_SWAPPED).
- Forgetting to divide the rise in SSR by the number of restrictions $q$ (NOT_DIVIDED_BY_Q).
- Putting $\text{SSR}_R$ instead of $\text{SSR}_U$ in the denominator of $F$ (RESTRICTED_IN_DENOMINATOR).
- Judging a group of dummies, or experience and experience squared, by their separate $t$ statistics instead of one $F$ test (SEPARATE_T_TESTS).
- Concluding "education has no effect" from an insignificant coefficient; look at the confidence interval, which may include large effects (NOT_SIGNIFICANT_MEANS_ZERO).
- Treating a highly significant but tiny coefficient as economically important (SIGNIFICANT_MEANS_IMPORTANT).
- Using the $R^2$ form of $F$ when the restricted model has a different dependent variable, as in the constant-returns test with $\ln(Q/K)$ (R2_FORM_DIFFERENT_Y).
- Using the normal value 1.96 instead of the $t$ value with $n - k$ degrees of freedom in a small sample, or $n - 1$ degrees of freedom instead of $n - k$.

## Practice
- `coefficient-t-statistic` (difficulty 1): the $t$ statistic $(b - \beta_0)/\operatorname{SE}(b)$ from a regression table, for the return to education, the minimum wage, a price or income elasticity tested against $\pm 1$, or a market beta tested against 1, to 2 decimal places; distractors NULL_NOT_SUBTRACTED, DIVIDED_BY_VARIANCE, SIGN_REVERSED.
- `f-statistic-restricted-ssr` (difficulty 2): the $F$ statistic $((\text{SSR}_R - \text{SSR}_U)/q)/(\text{SSR}_U/(n - k))$ for regional or seasonal dummies, experience terms, rivals' prices or constant returns to scale, to 2 decimal places; distractors DF_SWAPPED, NOT_DIVIDED_BY_Q, RESTRICTED_IN_DENOMINATOR, DF_NO_INTERCEPT.
- `t-statistic-from-xtx-inverse` (difficulty 3): the $t$ statistic when the standard error must first be built as $\sqrt{s^2 a_{jj}}$ from SSR, $n$, $k$ and a diagonal entry of $(X^\top X)^{-1}$, to 2 decimal places; distractors DIVIDED_BY_VARIANCE, SSR_OVER_N, DF_NO_INTERCEPT, NULL_NOT_SUBTRACTED.

## Real world
- Returns to education: labour economists report the education coefficient of a wage equation with its standard error and confidence interval; policy debates about student fees and school spending turn on whether the interval is high or low, not just on whether the coefficient is significant.
- Tax and pricing forecasts: finance ministries and competition authorities estimate price elasticities of fuel, tobacco or alcohol demand and test them against $-1$, because that value decides whether a higher tax raises or lowers spending on the good.
- Finance: in a regression of a fund's returns on market returns, the intercept ("alpha") is tested against 0 to see whether the manager beats the market, and the slope against 1; joint $F$ tests check whether several risk factors matter together.
- Structural breaks and policy reforms: to test whether a demand or wage equation changed after a reform, economists estimate it separately before and after (unrestricted) and on the pooled data (restricted), and compare the sums of squared residuals with an $F$ test, the same idea as in Example 3.

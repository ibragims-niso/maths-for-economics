---
id: EM04
title: Heteroskedasticity and autocorrelation
block: EM
coreYear: 3
prerequisites: [EM03]
estMinutes: 50
status: draft
economicUses:
  - Correcting the standard errors of wage and household-spending regressions
  - Testing whether the spread of errors grows with income, education or firm size
  - Quarterly GDP and consumption regressions with persistent shocks
  - Reading robust and Newey–West standard errors in regression tables
generators: [breusch-pagan-lm-statistic, durbin-watson-statistic, robust-se-simple-regression]
widgets: [ar1-error-runs]
mistakeCodes:
  BP_R2_ONLY:
    label: Gave R² instead of n·R²
    explanation: The R² of the auxiliary regression is only the raw material. The Breusch–Pagan statistic multiplies it by the number of observations, LM = n·R², and that is what is compared with the χ² critical value.
  BP_DF_SCALED:
    label: Multiplied R² by n − k instead of n
    explanation: n − k is the divisor for estimating σ², not part of this test. The LM statistic uses all n observations, LM = n·R².
  BP_ONE_MINUS_R2:
    label: Used 1 − R² instead of R²
    explanation: The test asks how much of the variation in e² the regressors explain, which is R². n·(1 − R²) measures what they do not explain and is large even when there is no heteroskedasticity at all.
  DW_NOT_SQUARED:
    label: Added the changes without squaring them
    explanation: The numerator of d is the sum of the squared changes, Σ(eₜ − eₜ₋₁)². Square each change before adding, so that rises and falls both count as positive.
  DW_DENOM_SHORT:
    label: Left e₁² out of the denominator
    explanation: The numerator has n − 1 changes, but the denominator adds the squares of all n residuals, from e₁² to eₙ². Dropping e₁² makes the denominator too small and d too large.
  DW_E0_ZERO:
    label: Started the changes with e₁ − 0
    explanation: There is no residual before e₁, so the first change is e₂ − e₁ and there are n − 1 changes in all. Treating e₀ as 0 adds an extra e₁² to the numerator.
  RHO_HALF_D:
    label: Took ρ̂ = d/2
    explanation: d is about 2(1 − ρ̂), so ρ̂ ≈ 1 − d/2. A small d means strong positive autocorrelation, not a small ρ̂.
  D_NOT_RHO:
    label: Gave d instead of ρ̂
    explanation: d runs from 0 to 4 with 2 meaning no autocorrelation; ρ̂ runs from −1 to 1 with 0 meaning none. Convert with ρ̂ ≈ 1 − d/2.
  USUAL_SE:
    label: Gave the usual standard error s/√Σ(x − x̄)²
    explanation: The usual formula assumes every error has the same variance. The robust standard error lets each observation have its own, √Σ(x − x̄)²e² divided by Σ(x − x̄)².
  ROBUST_VAR_NOT_SE:
    label: Gave the robust variance instead of its square root
    explanation: Σ(x − x̄)²e²/(Σ(x − x̄)²)² is the estimated variance of b₁. The standard error is its square root, in the same units as the slope.
  ROBUST_DENOM_NOT_SQUARED:
    label: Divided by Σ(x − x̄)² only once
    explanation: The slope is a weighted sum of errors with weights (x − x̄)/Σ(x − x̄)², so its variance has (Σ(x − x̄)²)² underneath. Divide Σ(x − x̄)²e² by the square of Σ(x − x̄)², then take the root.
resources:
  - { title: "STAT 462, 10.1 Nonconstant Variance and Weighted Least Squares (Penn State)", url: "https://online.stat.psu.edu/stat462/node/186/", kind: course, verifiedAt: 2026-10-18 }
  - { title: "STAT 462, 10.3 Regression with Autoregressive Errors (Penn State)", url: "https://online.stat.psu.edu/stat462/node/189/", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
A study of 400 workers finds that each year of education adds 0.6 an hour to wages, with a $t$ statistic of 3: significant, it seems. But wages of graduates vary far more than wages of people who left school early: some graduates become surgeons, others baristas. When the spread of the errors changes with the regressor, the standard error printed by the usual formula is wrong, and in this case so is the verdict (Example 3). The same happens in time series. A regression of quarterly GDP growth on interest rates has errors that come in runs, because a recession or a boom lasts several quarters; the usual standard errors then make the estimates look far more precise than they are. This topic shows how to recognise both problems, **heteroskedasticity** and **autocorrelation**, how to test for them, and how applied economists correct their standard errors so that the $t$ and $F$ tests of EM03 can be trusted again.

## Intuition
The classical assumptions of EM02 say that every error has the same variance $\sigma^2$ and that errors are unrelated to each other. Real data often break both.

**Heteroskedasticity** means "unequal spread". Plot the residuals of a regression of household food spending on income: for poor households the points hug the line, because there is little room to spend more or less on food; rich households differ a lot, some eat out every night, some do not. The cloud of residuals opens like a fan. Wages against education, sales against firm size and imports against GDP look the same. OLS still finds the right line on average, but the usual standard error pretends that every observation is equally noisy. If the noisiest observations are those far from the average $x$, which are exactly the ones that pin down the slope, the slope is less precise than the formula says.

**Autocorrelation** (serial correlation) means that the error in one period carries over into the next. A shock to GDP growth this quarter, an oil price spike or a banking scare, is still felt next quarter. The errors then come in runs: several positive, then several negative. Forty quarters with such errors contain less independent information than forty unrelated observations, yet the usual formula counts them as forty. The standard errors are usually too small and the $t$ statistics too large, so variables look significant when they are not.

In both cases the cure is mainly about the **standard errors**, not the coefficients: keep OLS, but measure its precision with a formula that does not assume the problem away.

## Definition and formulas
**Heteroskedasticity.** In $y_i = \beta_0 + \beta_1 x_{1i} + \dots + \beta_q x_{qi} + u_i$ the errors are **heteroskedastic** when $\operatorname{Var}(u_i \mid X) = \sigma_i^2$ differs between observations, typically growing with a regressor. Homoskedasticity is the special case $\sigma_i^2 = \sigma^2$ for all $i$.

**Consequences.** Unbiasedness needs only $E[u \mid X] = 0$ (EM02), so OLS stays **unbiased and consistent**. What breaks is its variance. In simple regression, $b_1 = \beta_1 + \sum (x_i - \bar x)u_i / \sum (x_i - \bar x)^2$, so
$$\operatorname{Var}(b_1 \mid X) = \frac{\sum (x_i - \bar x)^2 \sigma_i^2}{\left(\sum (x_i - \bar x)^2\right)^2},$$
which equals the usual $\sigma^2/\sum (x_i - \bar x)^2$ only when all $\sigma_i^2$ are equal. So the usual standard errors are biased, the $t$ and $F$ statistics of EM03 do not have their $t$ and $F$ distributions, and confidence intervals have the wrong coverage. OLS is also no longer BLUE: the Gauss–Markov theorem needs homoskedasticity.

**Detecting it.** First, plot the residuals $e_i$ against each regressor or against the fitted values: a fan shape is the classic sign. Then test. The **Breusch–Pagan test** of $H_0$: homoskedasticity regresses the squared residuals on the regressors,
$$e_i^2 = \gamma_0 + \gamma_1 x_{1i} + \dots + \gamma_q x_{qi} + v_i,$$
and uses the $R^2$ of this **auxiliary regression**:
$$\text{LM} = n R^2 \;\sim\; \chi^2_q \text{ approximately under } H_0 .$$
Reject homoskedasticity when LM exceeds the critical value. The 5 % critical values of $\chi^2_q$ are

$$\begin{array}{c|cccc} q & 1 & 2 & 3 & 4 \\ \hline \chi^2_q(5\,\%) & 3.841 & 5.991 & 7.815 & 9.488 \end{array}$$

The **White test** works the same way but adds the squares and cross-products of the regressors to the auxiliary regression, so it also catches curved patterns; with two regressors it has the five terms $x_1, x_2, x_1^2, x_2^2, x_1x_2$ and LM $= nR^2$ is compared with $\chi^2_5$.

**Fix 1: robust standard errors.** Replace each unknown $\sigma_i^2$ by the observation's own squared residual $e_i^2$. In simple regression the **heteroskedasticity-robust (White) standard error** is
$$\operatorname{SE}_{\text{rob}}(b_1) = \frac{\sqrt{\sum (x_i - \bar x)^2 e_i^2}}{\sum (x_i - \bar x)^2},$$
and in matrix form the robust variance is $(X^\top X)^{-1}\left(\sum_i e_i^2\, x_i x_i^\top\right)(X^\top X)^{-1}$, where $x_i^\top$ is row $i$ of $X$ (a "sandwich"). Coefficients do not change; only standard errors, $t$ statistics and confidence intervals do. Robust standard errors are valid whether or not the errors are heteroskedastic, but only in large samples: with a handful of observations they are unreliable.

**Fix 2: weighted least squares.** If the form of the variance is known, give the noisy observations less weight. When $\operatorname{Var}(u_i \mid x_i) = \sigma^2 x_i^2$, divide the whole equation by $x_i$:
$$\frac{y_i}{x_i} = \beta_0 \frac{1}{x_i} + \beta_1 + \frac{u_i}{x_i}, \qquad \operatorname{Var}\!\left(\frac{u_i}{x_i}\,\Big|\, x_i\right) = \sigma^2 .$$
The new error is homoskedastic, so OLS on the transformed variables (WLS) is BLUE again; note that the old slope $\beta_1$ is now the intercept. **Fix 3: logs.** Wages, spending and firm sizes are often modelled in logs; $\log y$ usually has a much more even spread than $y$.

**Autocorrelation.** In time series the most common model is the **AR(1) error**
$$u_t = \rho\, u_{t-1} + \varepsilon_t, \qquad |\rho| < 1,$$
where the shocks $\varepsilon_t$ are unrelated to each other with variance $\sigma_\varepsilon^2$. This is a first-order difference equation (DY01) driven by shocks. Each error keeps the share $\rho$ of the last one, so $\operatorname{Var}(u_t) = \sigma_\varepsilon^2/(1 - \rho^2)$ and $\operatorname{Corr}(u_t, u_{t-s}) = \rho^s$. With $\rho > 0$ the errors come in runs of the same sign; with $\rho < 0$ they tend to alternate.

**Consequences.** As long as the regressors are unrelated to the errors at all dates, OLS remains unbiased; this fails if a lagged dependent variable such as $y_{t-1}$ is a regressor. The usual variance formula is wrong: with $\rho > 0$ and a regressor that is itself persistent (GDP, prices, interest rates), the usual standard errors are too small, often by a lot, and $t$ tests reject too often.

**The Durbin–Watson statistic.** From the OLS residuals $e_1, \dots, e_n$ in time order,
$$d = \frac{\sum_{t=2}^{n} (e_t - e_{t-1})^2}{\sum_{t=1}^{n} e_t^2} \approx 2(1 - \hat\rho), \qquad \hat\rho = \frac{\sum_{t=2}^{n} e_t e_{t-1}}{\sum_{t=1}^{n} e_t^2}.$$
Expanding the square gives exactly $d = 2(1 - \hat\rho) - (e_1^2 + e_n^2)/\sum e_t^2$, and the last term is small in long series. So $d$ lies between 0 and 4: $d \approx 2$ means no first-order autocorrelation, $d$ near 0 strong positive, $d$ near 4 strong negative autocorrelation; conversely $\hat\rho \approx 1 - d/2$. To test $H_0: \rho = 0$ against $H_1: \rho > 0$, a table gives two bounds $d_L < d_U$ for the number of observations and regressors:

- $d < d_L$: reject $H_0$; there is positive autocorrelation.
- $d > d_U$: do not reject $H_0$.
- $d_L \le d \le d_U$: the test is inconclusive.

Against $\rho < 0$, apply the same rule to $4 - d$. For example, with $n = 40$ and one regressor the 5 % bounds are $d_L = 1.44$ and $d_U = 1.54$. The test needs an intercept and is not valid when $y_{t-1}$ is among the regressors.

**Fixes for autocorrelation.** *Newey–West (HAC) standard errors* extend the robust sandwich: besides each $e_t^2$ they also add the products $e_t e_{t-s}$ of nearby residuals, with weights that fall as the gap $s$ grows. They are valid under both heteroskedasticity and autocorrelation in large samples, and leave the coefficients unchanged. *Feasible GLS (Cochrane–Orcutt)* removes the AR(1) pattern itself: estimate $\hat\rho$ from the OLS residuals, then run OLS on the **quasi-differenced** equation
$$y_t - \hat\rho\, y_{t-1} = \beta_0 (1 - \hat\rho) + \beta_1 (x_t - \hat\rho\, x_{t-1}) + \varepsilon_t ,$$
whose error $u_t - \rho u_{t-1} = \varepsilon_t$ is free of autocorrelation; re-estimate $\hat\rho$ from the new residuals and repeat until it settles. Persistent residuals can also be a sign that the model misses a variable or a lag, so look at the model before patching the standard errors.

## Interactive
::widget{id="ar1-error-runs"}

The graph shows the errors $u_t = \rho u_{t-1} + \varepsilon_t$ of a quarterly regression over 40 quarters, built from one fixed set of shocks $\varepsilon_t$, so only $\rho$ changes the picture; lilac parts are above 0, gold parts below. At the start, $\rho = 0.75$ (the $\hat\rho$ of Example 2): the errors form long runs, changing sign only 7 times in 39 steps, and the panel shows DW d = 0.48 next to 2(1 − ρ) = 0.5. Move the **Autocorrelation ρ** slider to 0: the runs break up into a random-looking scatter with 21 sign changes, and d = 2.03, close to 2. Now go to $\rho = -0.75$: the errors flip sign almost every quarter (31 changes) and d = 3.51, close to 2(1 − ρ) = 3.5. Notice that d always stays near 2(1 − ρ): that is why a small $d$ signals positive autocorrelation.

## Worked examples

### Example 1 (easy): is the spread of food spending constant?
A regression of the monthly food spending of 120 households on their income and household size gives residuals that fan out as income rises. To test, the squared residuals $e^2$ are regressed on income and household size, with an intercept; this auxiliary regression has $R^2 = 0.094$. Carry out the Breusch–Pagan test at 5 %.

1. $e^2 = \gamma_0 + \gamma_1\,\text{income} + \gamma_2\,\text{size} + v, \qquad H_0: \gamma_1 = \gamma_2 = 0, \qquad q = 2$
   *Why:* under homoskedasticity nothing should predict the size of the squared residuals. Two regressors are tested, so the statistic has 2 degrees of freedom; the intercept is not counted.
2. $\text{LM} = nR^2 = 120 \times 0.094 = 11.28$
   *Why:* income and size explain 9.4 % of the variation in $e^2$. Multiplying by $n$ turns this into evidence that grows with the sample: 9.4 % from 120 households is far more convincing than 9.4 % from 10.
3. $11.28 > \chi^2_2(5\,\%) = 5.991$, and the p-value is $P(\chi^2_2 > 11.28) = e^{-11.28/2} = 0.0036$
   *Why:* with 2 degrees of freedom the χ² tail has the simple form $e^{-c/2}$ (which also gives $e^{-5.991/2} = 0.05$). The statistic is far beyond the critical value, so homoskedasticity is rejected.
4. Conclusion: keep the OLS coefficients, but report heteroskedasticity-robust standard errors (or model log spending)
   *Why:* heteroskedasticity does not bias OLS, so there is no need to change the estimates; it only makes the usual standard errors, and the tests built on them, unreliable.

```verify
n = 120; R2 = 0.094
LM = n * R2
assert abs(LM - 11.28) < 1e-9
# 5 % critical value of chi-square with 2 df: the tail is exp(-c/2)
assert abs(exp(-5.991 / 2) - 0.05) < 0.0001
assert LM > 5.991
pval = exp(-LM / 2)
assert abs(pval - 0.0036) < 0.00005
```

### Example 2 (medium): a Durbin–Watson test on a consumption function
An annual consumption function estimated over 6 years (one regressor, income, plus an intercept) leaves the residuals $2, 3, 1, -1, -3, -2$ (in billions), in time order. Compute $d$ and $\hat\rho \approx 1 - d/2$, and test for positive autocorrelation at 5 %, where the table gives $d_L = 0.61$ and $d_U = 1.40$ for $n = 6$ and one regressor.

1. $\sum_{t=2}^{6} (e_t - e_{t-1})^2 = 1^2 + (-2)^2 + (-2)^2 + (-2)^2 + 1^2 = 14$
   *Why:* there are $n - 1 = 5$ changes, starting with $e_2 - e_1 = 1$. The residuals drift slowly from positive to negative, so the changes are small compared with the residuals themselves.
2. $\sum_{t=1}^{6} e_t^2 = 4 + 9 + 1 + 1 + 9 + 4 = 28$
   *Why:* the denominator uses all six residuals, so that $d$ does not depend on the units (billions or millions).
3. $d = \dfrac{14}{28} = 0.5, \qquad \hat\rho \approx 1 - \dfrac{0.5}{2} = 0.75$
   *Why:* $d$ is far below 2, the value for no autocorrelation. The residuals form two runs, three positive then three negative: a typical picture of $\rho > 0$.
4. $d = 0.5 < d_L = 0.61$: reject $H_0: \rho = 0$ in favour of positive autocorrelation
   *Why:* below $d_L$ the evidence is decisive; between 0.61 and 1.40 the test would have been inconclusive. The usual standard errors of this consumption function should not be trusted.
5. Directly, $\hat\rho = \dfrac{\sum e_t e_{t-1}}{\sum e_t^2} = \dfrac{6 + 3 - 1 + 3 + 6}{28} = \dfrac{17}{28} = 0.607$, and $2(1 - 0.607) - \dfrac{2^2 + (-2)^2}{28} = 0.5$
   *Why:* $d = 2(1 - \hat\rho)$ holds only approximately; the end terms $(e_1^2 + e_n^2)/\sum e_t^2$ make the difference, and with just 6 residuals they are not small. In long series both routes give almost the same $\hat\rho$.

```verify
r = [2, 3, 1, -1, -3, -2]
num1 = (3 - 2)^2 + (1 - 3)^2 + (-1 - 1)^2 + (-3 - (-1))^2 + (-2 - (-3))^2
assert num1 == 14
den = sum(r .^ 2)
assert den == 28
dw = num1 / den
assert dw == 0.5
assert 1 - dw / 2 == 0.75
assert dw < 0.61
lag = 2*3 + 3*1 + 1*(-1) + (-1)*(-3) + (-3)*(-2)
assert lag == 17
assert abs(lag / den - 0.607) < 0.0005
assert abs(2 * (1 - lag / den) - (2^2 + (-2)^2) / den - dw) < 1e-12
```

### Example 3 (hard): does education still look significant?
A regression of the hourly wage of 400 workers on years of education gives $b_1 = 0.6$, residual sum of squares $\text{SSR} = 39{,}800$ and $\sum (x - \bar x)^2 = 2{,}500$. The residual plot fans out with education, and $\sum (x - \bar x)^2 e^2 = 640{,}000$. Compare the usual and the robust standard errors and test $H_0: \beta_1 = 0$ at 5 % (two-sided) with each.

1. $s^2 = \dfrac{39{,}800}{398} = 100, \qquad \operatorname{SE}(b_1) = \sqrt{\dfrac{100}{2{,}500}} = \sqrt{0.04} = 0.2, \qquad t = \dfrac{0.6}{0.2} = 3$
   *Why:* this is the usual formula of EM02, which assumes one error variance $\sigma^2$ for all workers. With 398 degrees of freedom the 5 % two-sided critical value is about 1.97 (practically the normal 1.96), so it would declare education highly significant.
2. $\widehat{\operatorname{Var}}_{\text{rob}}(b_1) = \dfrac{640{,}000}{2{,}500^2} = 0.1024, \qquad \operatorname{SE}_{\text{rob}}(b_1) = \sqrt{0.1024} = 0.32$
   *Why:* each worker's own $e^2$ stands in for his or her error variance, so no common $\sigma^2$ is assumed.
3. $t_{\text{rob}} = \dfrac{0.6}{0.32} = 1.875 < 1.97$; the robust 95 % interval is about $0.6 \pm 1.97 \times 0.32$, from $-0.03$ to $1.23$
   *Why:* with the honest standard error the effect is no longer significant at 5 %, and the interval includes 0. The estimate 0.6 is the same; only its precision has changed.
4. Why the robust SE is larger: $\dfrac{\sum (x - \bar x)^2 e^2}{\sum (x - \bar x)^2} = \dfrac{640{,}000}{2{,}500} = 256$, against $s^2 = 100$, so the variance ratio is $256/100 = 2.56$ and the SE ratio $\sqrt{2.56} = 1.6$
   *Why:* the robust variance is $s^2/\sum (x - \bar x)^2$ with $s^2$ replaced by an average of $e^2$ weighted by $(x - \bar x)^2$. Here the big residuals sit at the extremes of education, which are exactly the observations that determine the slope, so the weighted average is 2.56 times the plain one.

```verify
n = 400; b1 = 0.6; ssr = 39800; sxx = 2500; meat = 640000
s2 = ssr / (n - 2)
assert s2 == 100
se = sqrt(s2 / sxx)
assert abs(se - 0.2) < 1e-12
assert abs(b1 / se - 3) < 1e-12
vr = meat / sxx^2
assert abs(vr - 0.1024) < 1e-12
ser = sqrt(vr)
assert abs(ser - 0.32) < 1e-12
tr = b1 / ser
assert abs(tr - 1.875) < 1e-12
assert tr < 1.96 and 3 > 1.97
# normal two-sided 5 % point, as a check of the critical value
assert abs(2 * (1 - (1 + erf(1.96 / sqrt(2))) / 2) - 0.05) < 0.0005
assert abs((b1 - 1.97 * ser) - (-0.03)) < 0.005 and abs((b1 + 1.97 * ser) - 1.23) < 0.005
assert meat / sxx == 256
assert abs((meat / sxx) / s2 - 2.56) < 1e-12 and abs(sqrt(2.56) - 1.6) < 1e-12
assert abs(ser / se - 1.6) < 1e-12
```

## Common mistakes
- Reporting the $R^2$ of the auxiliary regression as the test statistic; the Breusch–Pagan statistic is $nR^2$ (BP_R2_ONLY).
- Multiplying $R^2$ by $n - k$ instead of $n$ (BP_DF_SCALED).
- Using $n(1 - R^2)$, which measures what the regressors fail to explain (BP_ONE_MINUS_R2).
- Adding the changes $e_t - e_{t-1}$ in the Durbin–Watson numerator without squaring them (DW_NOT_SQUARED).
- Dropping $e_1^2$ from the denominator of $d$; the numerator has $n - 1$ changes, but the denominator has all $n$ squares (DW_DENOM_SHORT).
- Starting the changes at $e_1 - 0$ as if there were a residual before the first one (DW_E0_ZERO).
- Taking $\hat\rho = d/2$; it is $\hat\rho \approx 1 - d/2$, so a small $d$ means a large positive $\rho$ (RHO_HALF_D).
- Giving $d$ when $\hat\rho$ is asked for; they live on different scales, 0 to 4 and −1 to 1 (D_NOT_RHO).
- Using the usual $s/\sqrt{\sum (x - \bar x)^2}$ when a robust standard error is asked for (USUAL_SE).
- Forgetting the square root at the end of the robust calculation (ROBUST_VAR_NOT_SE).
- Dividing $\sum (x - \bar x)^2 e^2$ by $\sum (x - \bar x)^2$ once instead of by its square (ROBUST_DENOM_NOT_SQUARED).
- Believing heteroskedasticity or autocorrelation biases the OLS coefficients: as long as the errors have mean zero given the regressors, the coefficients are fine; the standard errors are what go wrong.
- Using the Durbin–Watson test when a lagged dependent variable is a regressor; there $d$ is biased towards 2 and the test is not valid.
- Treating the inconclusive zone between $d_L$ and $d_U$ as "no autocorrelation".

## Practice
- `breusch-pagan-lm-statistic` (difficulty 1): the Breusch–Pagan statistic $\text{LM} = nR^2$ from the number of observations and the $R^2$ of the regression of $e^2$ on the regressors (wages, food spending, R&D, flat prices), with the χ² critical value given for the decision, to 2 decimal places; distractors BP_R2_ONLY, BP_DF_SCALED, BP_ONE_MINUS_R2.
- `durbin-watson-statistic` (difficulty 2): the Durbin–Watson $d$ from 6 or 7 residuals of a GDP, consumption or sales regression, or the implied $\hat\rho \approx 1 - d/2$, to 3 decimal places; distractors DW_NOT_SQUARED, DW_DENOM_SHORT, DW_E0_ZERO for $d$, and RHO_HALF_D, D_NOT_RHO, DW_DENOM_SHORT for $\hat\rho$.
- `robust-se-simple-regression` (difficulty 3): the heteroskedasticity-robust standard error $\sqrt{\sum (x - \bar x)^2 e^2}/\sum (x - \bar x)^2$ of a slope from five data points and their OLS residuals (wages on education, food spending on income), to 3 decimal places; distractors USUAL_SE, ROBUST_VAR_NOT_SE, ROBUST_DENOM_NOT_SQUARED.

## Real world
- Labour and development economics: in cross-section studies of wages, household consumption or firm productivity, robust standard errors are now the default, and regression tables usually say "robust standard errors in parentheses". Wage equations are mostly estimated in logs, which also evens out the spread of the errors.
- Macroeconomics and finance: regressions of GDP growth, inflation or asset returns on their drivers use quarterly or monthly data with persistent errors, so central banks and researchers report Newey–West (HAC) standard errors. Without them, forecasting relations often look much more reliable than they are.
- Grouped data: when the observations are averages over regions or schools of different size, an average over $m$ people has error variance $\sigma^2/m$, so statistics offices and researchers weight each average by its group size, a form of weighted least squares.
- Model checking: regression output for time series routinely prints the Durbin–Watson statistic. A value far below 2 in a consumption function or a demand equation estimated on annual data is often the first hint that a variable, a lag or a trend is missing from the model.

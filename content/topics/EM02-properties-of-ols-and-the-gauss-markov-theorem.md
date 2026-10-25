---
id: EM02
title: Properties of OLS and the Gauss–Markov theorem
block: EM
coreYear: 3
prerequisites: [EM01]
estMinutes: 50
status: draft
economicUses:
  - "Judging when a regression estimate can be trusted: unbiased, and how precise"
  - "Returns to education: why leaving out ability biases the estimate upwards"
  - Demand estimation when price moves with unobserved quality
  - Reading the standard errors under the coefficients of a regression table
  - Planning a survey or an experiment large and varied enough to measure an effect
searchTerms:
  - "Gauss–Markov theorem"
  - "BLUE"
  - "Unbiased estimator"
generators: [ols-error-variance-estimate, ols-slope-standard-error, omitted-variable-bias-slope]
widgets: [ols-slope-sampling]
mistakeCodes:
  DF_N:
    label: Divided SSR by n instead of n − k
    explanation: The residuals are fitted to the same data, so they are a little smaller than the true errors. SSR/n underestimates σ² on average; SSR/(n − k), with k the number of coefficients, is unbiased.
  DF_NO_INTERCEPT:
    label: Did not count the intercept in k
    explanation: k counts every estimated coefficient, the intercept included, so with m regressors k = m + 1 and s² = SSR/(n − m − 1).
  DF_N_MINUS_1:
    label: Divided SSR by n − 1 instead of n − k
    explanation: n − 1 is the divisor for the variance of a single variable around its mean, where one number is estimated. A regression estimates k numbers, so the divisor is n − k.
  VAR_NOT_SE:
    label: Gave the variance s²/Σ(x − x̄)² instead of its square root
    explanation: s²/Σ(x − x̄)² estimates the variance of b₁. The standard error is its square root, s/√Σ(x − x̄)², in the same units as b₁.
  UNCENTRED_SXX:
    label: Used Σx² instead of Σ(x − x̄)²
    explanation: What pins the slope down is the spread of x around its own mean. Compute Σ(x − x̄)² = Σx² − n·x̄² first; the raw Σx² is far larger and makes the standard error much too small.
  NO_BIAS:
    label: Assumed the short regression is unbiased
    explanation: When the omitted variable affects y (β₂ ≠ 0) and moves with the included one (δ₁ ≠ 0), the short slope picks up part of its effect. Its expected value is β₁ + β₂δ₁, not β₁.
  BIAS_SIGN:
    label: Subtracted the bias instead of adding it
    explanation: The short slope credits x₁ with the effect of the x₂ that comes with it, so E[b̃₁] = β₁ + β₂δ₁. The bias has the sign of the product β₂δ₁.
  BIAS_ONLY:
    label: Gave the bias β₂δ₁ instead of the expected slope
    explanation: β₂δ₁ is only the bias. The expected short-regression slope adds it to the true effect, β₁ + β₂δ₁.
  DELTA_REVERSED:
    label: Divided by the spread of x₂ instead of x₁
    explanation: δ₁ is the slope of x₂ on x₁, Σ(x₁ − x̄₁)(x₂ − x̄₂)/Σ(x₁ − x̄₁)². Dividing by Σ(x₂ − x̄₂)² gives the slope of x₁ on x₂, a different number.
resources:
  - { title: "Introductory Business Statistics 2e, 13.4 The Regression Equation (OpenStax)", url: "https://openstax.org/books/introductory-business-statistics-2e/pages/13-4-the-regression-equation", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "STAT 462, 2.3 The Simple Linear Regression Model (Penn State)", url: "https://online.stat.psu.edu/stat462/node/93/", kind: course, verifiedAt: 2026-10-18 }
  - { title: "STAT 462, 5.3 The Multiple Linear Regression Model (Penn State)", url: "https://online.stat.psu.edu/stat462/node/131/", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
A ministry wants to know how much one more year of schooling raises earnings before it pays for a longer school year. A regression of wages on education (EM01) gives a number, say 1.5 an hour per year. Two questions decide whether that number can be used. Is it **right on average**, or does it carry a systematic error, for example because able people both study longer and earn more? And how **precise** is it: would another sample of workers give 1.4, or 0.2? This topic answers both. It lists the assumptions under which the OLS estimator $b = (X^\top X)^{-1}X^\top y$ is unbiased, works out how much it varies from sample to sample, and proves that under these assumptions no other linear unbiased estimator is more precise: the **Gauss–Markov theorem**. It also shows exactly how large the bias is when a relevant variable is left out, the most common reason why a regression misleads policy.

## Intuition
Imagine drawing a fresh sample of workers again and again and running the same regression each time. The estimates would differ, because each sample has its own errors $u$: in one, the educated workers happen to be lucky; in another, unlucky. The slope $b_1$ is a random variable with a **sampling distribution** (ST202), just like a sample mean.

Two features of that distribution matter. Its **centre**: if it sits at the true $\beta_1$, the method has no systematic error and we call it **unbiased**. That needs the errors to be unrelated to the regressors: whatever drives wages besides education must not move with education. If ability is left in the error and able people study longer, the errors are larger for the educated, and the slope wrongly credits education with ability's reward. Its **spread**: the standard error. The slope is pinned down more precisely when the errors are small, when there are many observations, and when the regressor varies a lot. With education all equal to 12 years we could learn nothing about its effect; with a wide range we see wages at very different education levels.

The Gauss–Markov theorem then says that among all estimators that are linear in $y$ and unbiased, OLS has the smallest spread, as long as the errors have the same variance everywhere and are uncorrelated with each other.

## Definition and formulas
**The classical assumptions.** For the model $y = X\beta + u$ of EM01, with $X$ the $n \times k$ design matrix:

1. **Linearity in the parameters:** $y = X\beta + u$; the regressors may be logs or squares, but $\beta$ enters linearly.
2. **Random sampling:** the $n$ observations $(x_i, y_i)$ are independent draws from the same population.
3. **No perfect multicollinearity:** $X$ has rank $k$, so $X^\top X$ can be inverted (EM01).
4. **Zero conditional mean:** $E[u \mid X] = 0$. Whatever is in the error does not move, on average, with the regressors.
5. **Homoskedasticity and no correlation:** $\operatorname{Var}(u \mid X) = \sigma^2 I$. Every error has the same variance $\sigma^2$ whatever the regressors, and different errors are uncorrelated.
6. **Normality:** $u \mid X \sim N(0, \sigma^2 I)$. Needed only for exact small-sample $t$ and $F$ tests (EM03).

**Unbiasedness (assumptions 1–4).** Substitute the model into the formula for $b$:
$$b = (X^\top X)^{-1}X^\top (X\beta + u) = \beta + (X^\top X)^{-1}X^\top u.$$
The estimate is the truth plus a weighted sum of the errors. Taking expectations given $X$,
$$E[b \mid X] = \beta + (X^\top X)^{-1}X^\top E[u \mid X] = \beta,$$
and so $E[b] = \beta$ as well. Unbiased does not mean right in every sample: it means the sampling errors $(X^\top X)^{-1}X^\top u$ cancel out on average.

**Variance (assumptions 1–5).** Since $b - \beta = (X^\top X)^{-1}X^\top u$ and $\operatorname{Var}(u \mid X) = \sigma^2 I$,
$$\operatorname{Var}(b \mid X) = (X^\top X)^{-1}X^\top (\sigma^2 I) X (X^\top X)^{-1} = \sigma^2 (X^\top X)^{-1}.$$
The diagonal entries are the variances of $b_0, \dots, b_{k-1}$; the off-diagonal ones are their covariances. In simple regression, $y = \beta_0 + \beta_1 x + u$, the slope entry is
$$\operatorname{Var}(b_1 \mid X) = \frac{\sigma^2}{\sum (x_i - \bar x)^2} = \frac{\sigma^2}{n\, v_x}, \qquad v_x = \frac{1}{n}\sum (x_i - \bar x)^2 .$$
So the variance is small when the noise $\sigma^2$ is small, when $n$ is large, and when $x$ is widely spread ($v_x$ large). Quadrupling $n$ halves the standard deviation of $b_1$.

**Estimating $\sigma^2$.** The errors are not observed, but the residuals $e = y - Xb$ are. Because $b$ is chosen to make the residuals small, and they satisfy the $k$ conditions $X^\top e = 0$, their squares are on average a little smaller than those of the errors: $E[\text{SSR} \mid X] = (n - k)\,\sigma^2$. Hence the unbiased estimator
$$s^2 = \frac{\text{SSR}}{n - k}, \qquad E[s^2] = \sigma^2,$$
where $k$ counts all coefficients, the intercept included. Its square root $s$ is the **standard error of the regression**. Replacing $\sigma^2$ by $s^2$ gives the **standard errors** printed under the coefficients:
$$\operatorname{SE}(b_j) = s\,\sqrt{\big[(X^\top X)^{-1}\big]_{jj}}, \qquad \text{in simple regression } \operatorname{SE}(b_1) = \frac{s}{\sqrt{\sum (x_i - \bar x)^2}}, \quad s^2 = \frac{\text{SSR}}{n - 2}.$$

**The Gauss–Markov theorem.** Under assumptions 1–5, OLS is **BLUE**, the **B**est **L**inear **U**nbiased **E**stimator: for any other estimator $\tilde\beta = Cy$ that is linear in $y$ and unbiased, $\operatorname{Var}(\tilde\beta_j \mid X) \ge \operatorname{Var}(b_j \mid X)$ for every coefficient $j$ (indeed $\operatorname{Var}(\tilde\beta \mid X) - \operatorname{Var}(b \mid X)$ is positive semidefinite). *Why it is true:* write any linear unbiased estimator as OLS plus a difference, $\tilde\beta = b + Dy$. Unbiasedness for every $\beta$ forces $DX = 0$, and then the extra part $Du$ is uncorrelated with $b$: $\operatorname{Cov}(b, Du \mid X) = \sigma^2 (X^\top X)^{-1}(DX)^\top = 0$. Adding an uncorrelated random term can only add variance: $\operatorname{Var}(\tilde\beta \mid X) = \operatorname{Var}(b \mid X) + \sigma^2 DD^\top$. OLS already uses all the information in the data efficiently; any other linear unbiased recipe mixes in pure noise. Normality is **not** needed for the theorem. If homoskedasticity fails, OLS stays unbiased but is no longer best, and the formula $\sigma^2(X^\top X)^{-1}$ is wrong (EM04).

**Omitted-variable bias.** Suppose the truth is $y = \beta_0 + \beta_1 x_1 + \beta_2 x_2 + u$ with $E[u \mid x_1, x_2] = 0$, but we regress $y$ on $x_1$ alone and get the short slope $\tilde b_1$. Let
$$\delta_1 = \frac{\sum (x_{1} - \bar x_1)(x_{2} - \bar x_2)}{\sum (x_{1} - \bar x_1)^2}$$
be the slope of a regression of $x_2$ on $x_1$ in the sample. Then
$$E[\tilde b_1 \mid X] = \beta_1 + \beta_2\,\delta_1 .$$
The **bias** $\beta_2\delta_1$ is zero only if $x_2$ does not matter ($\beta_2 = 0$) or is uncorrelated with $x_1$ ($\delta_1 = 0$). Its sign is the sign of the product:

$$\begin{array}{c|cc} & \delta_1 > 0 \text{ (move together)} & \delta_1 < 0 \text{ (move apart)} \\ \hline \beta_2 > 0 & \text{upward bias} & \text{downward bias} \\ \beta_2 < 0 & \text{downward bias} & \text{upward bias} \end{array}$$

EM01, Example 3 is an instance: wages on education alone gave $0.9 = 1.5 + 0.5 \times (-1.2)$, a downward bias because experience was left out and moved against education. The Try it widget of EM01 shows the same formula with a slider.

**Consistency.** An estimator is **consistent** if, as the sample grows, it gets arbitrarily close to the true value with probability approaching 1 (the law of large numbers, ST206). Under assumptions 1–4, $b$ is consistent: it is centred on $\beta$, and its spread shrinks to zero as $n$ grows (in simple regression the variance is $\sigma^2/(n\,v_x)$, while $v_x$ settles at the population variance of $x$). In large samples even a weaker condition is enough: each regressor uncorrelated with the error. Omitted-variable bias is **not** cured by more data: $\delta_1$ settles at its population value, so $\tilde b_1$ settles at $\beta_1 + \beta_2\delta_1$. A million observations give a very precise estimate of the wrong number.

## Interactive
::widget{id="ols-slope-sampling"}

The lilac curve is the sampling distribution of the OLS slope in a wage regression where the true return to education is $\beta_1 = 1.5$ an hour per year: where $b_1$ lands across many samples. The gold area, left of 0, is the chance that a sample gives the wrong sign. At the start ($\sigma = 6$, $n = 25$, SD of education 2 years, as in Example 1) the panel shows SE(b₁) = 0.6, 95 % range 0.32 to 2.68 and P(b₁ < 0) = 0.0062. Move **Sample size n** to 100: the curve narrows, SE(b₁) falls to 0.3, the range becomes 0.91 to 2.09 and P(b₁ < 0) drops below 0.0001. Put $n$ back to 25 and set **SD of education** to 4, or **Error SD σ** to 3: each also gives SE(b₁) = 0.3. Whatever you do, the curve stays centred on 1.5, because OLS is unbiased. Now try a small, noisy sample with little variation: σ = 12, n = 10, SD 1 gives SE(b₁) = 3.795 and P(b₁ < 0) = 0.3463, so about one sample in three would suggest that education lowers wages.

## Worked examples

### Example 1 (easy): how precise is the return to education?
A regression of the hourly wage of 25 workers on their years of education gives the slope $b_1 = 1.5$ and residual sum of squares $\text{SSR} = 828$. Education has mean $\bar x = 13$ and $\sum x^2 = 4{,}325$. Find $s^2$ and the standard error of $b_1$, and say what happens with 100 workers drawn the same way.

1. $\sum (x - \bar x)^2 = \sum x^2 - n\bar x^2 = 4{,}325 - 25 \times 13^2 = 4{,}325 - 4{,}225 = 100$
   *Why:* precision depends on the spread of education around its own mean. Here $v_x = 100/25 = 4$, so education has a standard deviation of 2 years.
2. $s^2 = \dfrac{\text{SSR}}{n - 2} = \dfrac{828}{23} = 36, \qquad s = 6$
   *Why:* the intercept and the slope were estimated, so $k = 2$ and $n - k = 23$. A typical worker's wage is about 6 an hour away from the fitted line.
3. $\widehat{\operatorname{Var}}(b_1) = \dfrac{s^2}{\sum (x - \bar x)^2} = \dfrac{36}{100} = 0.36, \qquad \operatorname{SE}(b_1) = \sqrt{0.36} = 0.6$
   *Why:* this is $\sigma^2/\sum (x - \bar x)^2$ with $\sigma^2$ replaced by its unbiased estimate. The standard error is in the units of the slope: the estimate 1.5 an hour per year is typically off by about 0.6 either way.
4. With $n = 100$ and the same spread and noise: $\sum (x - \bar x)^2 = 100 \times 4 = 400$, $\operatorname{SE}(b_1) = 6/\sqrt{400} = 0.3$
   *Why:* $\sum (x - \bar x)^2 = n\,v_x$ grows in proportion to $n$, so the standard error falls like $1/\sqrt{n}$: four times the workers halve it.

```verify
n = 25; xbar = 13; sumx2 = 4325; ssr = 828
sxx = sumx2 - n * xbar^2
assert 25 * 13^2 == 4225
assert sxx == 100
assert sxx / n == 4
s2 = ssr / (n - 2)
assert s2 == 36
s = sqrt(s2)
assert s == 6
v = s2 / sxx
assert abs(v - 0.36) < 1e-12
se = sqrt(v)
assert abs(se - 0.6) < 1e-12
# the same SE from the matrix formula s * sqrt([(X'X)^-1]_22)
XtX = [n, n * xbar; n * xbar, sumx2]
XtXi = inv(XtX)
assert abs(s * sqrt(XtXi[2, 2]) - 0.6) < 1e-12
# 100 workers with the same spread
se100 = 6 / sqrt(100 * 4)
assert abs(se100 - 0.3) < 1e-12
# the Try it panel: 95 % range and chance of a negative slope
assert abs((1.5 - 1.96 * 0.6) - 0.324) < 1e-12 and abs((1.5 + 1.96 * 0.6) - 2.676) < 1e-12
pneg = (1 + erf(-1.5 / 0.6 / sqrt(2))) / 2
assert abs(pneg - 0.0062) < 0.00005
```

### Example 2 (medium): unbiasedness and the Gauss–Markov theorem at work
Return to the café of EM01, Example 1, which charged the prices $P = 2, 3, 4, 5, 6$. Suppose (a thought experiment) that true daily demand is $Q = 100 - 8P + u$, the errors have variance $\sigma^2 = 4$, and in this week's sample they were $u = (2, 1, -1, -2, 0)$. Find $b$ through $b = \beta + (X^\top X)^{-1}X^\top u$, explain why OLS is still unbiased, find $\operatorname{Var}(b_1 \mid X)$, and compare it with the "end-points" estimator $(Q_5 - Q_1)/(P_5 - P_1)$.

1. $X^\top u = \begin{pmatrix} \sum u_i \\ \sum P_i u_i \end{pmatrix} = \begin{pmatrix} 2 + 1 - 1 - 2 + 0 \\ 4 + 3 - 4 - 10 + 0 \end{pmatrix} = \begin{pmatrix} 0 \\ -7 \end{pmatrix}$
   *Why:* only the part of the errors that lines up with the columns of $X$ can move the estimate. Here the errors are positive at low prices and negative at high ones.
2. $b - \beta = (X^\top X)^{-1}X^\top u = \begin{pmatrix} 1.8 & -0.4 \\ -0.4 & 0.1 \end{pmatrix}\begin{pmatrix} 0 \\ -7 \end{pmatrix} = \begin{pmatrix} 2.8 \\ -0.7 \end{pmatrix}, \qquad b = \begin{pmatrix} 102.8 \\ -8.7 \end{pmatrix}$
   *Why:* $(X^\top X)^{-1}$ is the matrix found in EM01. The observed sales are $Q = (86, 77, 67, 58, 52)$, and OLS on them gives exactly $\hat Q = 102.8 - 8.7P$: demand looks steeper than it is, because this week's errors happened to slope downwards.
3. With the mirror-image errors $-u$ the slope would be $-8 + 0.7 = -7.3$; on average over all samples, $E[b \mid X] = \beta + (X^\top X)^{-1}X^\top E[u \mid X] = \beta$
   *Why:* the sampling error is a fixed linear combination of the errors. When the errors have mean zero whatever the prices (assumption 4), positive and negative errors are equally likely in every position and the deviations cancel on average.
4. $\operatorname{Var}(b \mid X) = \sigma^2 (X^\top X)^{-1} = 4\begin{pmatrix} 1.8 & -0.4 \\ -0.4 & 0.1 \end{pmatrix} = \begin{pmatrix} 7.2 & -1.6 \\ -1.6 & 0.4 \end{pmatrix}, \qquad \operatorname{Var}(b_1 \mid X) = 0.4 = \dfrac{\sigma^2}{\sum (P - \bar P)^2} = \dfrac{4}{10}$
   *Why:* the matrix formula and the simple-regression formula agree; $\sum (P - \bar P)^2 = 4 + 1 + 0 + 1 + 4 = 10$. The negative covariance says that a too-steep slope tends to come with a too-high intercept, as in this sample.
5. End points: $\tilde b_1 = \dfrac{Q_5 - Q_1}{P_5 - P_1} = \beta_1 + \dfrac{u_5 - u_1}{4}$, so $E[\tilde b_1 \mid X] = -8$ and $\operatorname{Var}(\tilde b_1 \mid X) = \dfrac{2\sigma^2}{16} = 0.5 > 0.4$
   *Why:* the end-points estimator is linear in $Q$ and unbiased, so the Gauss–Markov theorem applies: its variance cannot be below that of OLS, and indeed it is 25 % larger because it throws away three observations. In this particular sample it gives $(52 - 86)/4 = -8.5$, closer to $-8$ than OLS: "best" refers to the spread over all possible samples, not to every single sample.

```verify
X = [1, 2; 1, 3; 1, 4; 1, 5; 1, 6]; beta = [100; -8]; u = [2; 1; -1; -2; 0]
Xtu = transpose(X) * u
assert deepEqual(Xtu, [0; -7])
A = inv(transpose(X) * X)
assert max(abs(A - [1.8, -0.4; -0.4, 0.1])) < 1e-12
d = A * Xtu
assert max(abs(d - [2.8; -0.7])) < 1e-12
y = X * beta + u
assert deepEqual(y, [86; 77; 67; 58; 52])
b = A * transpose(X) * y
assert max(abs(b - [102.8; -8.7])) < 1e-9
# mirror-image errors
bm = A * transpose(X) * (X * beta - u)
assert abs(bm[2, 1] - (-7.3)) < 1e-9
assert abs((b[2, 1] + bm[2, 1]) / 2 - (-8)) < 1e-9
# variance of b
V = 4 * A
assert max(abs(V - [7.2, -1.6; -1.6, 0.4])) < 1e-12
P = [2, 3, 4, 5, 6]
assert sum((P - mean(P)) .^ 2) == 10
assert abs(V[2, 2] - 4 / 10) < 1e-12
# end-points estimator: weights (-1/4, 0, 0, 0, 1/4) on Q
w = [-1/4, 0, 0, 0, 1/4]
assert abs(sum(w .* [1, 1, 1, 1, 1])) < 1e-12 and abs(sum(w .* P) - 1) < 1e-12
assert abs(4 * sum(w .^ 2) - 0.5) < 1e-12
assert abs((52 - 86) / 4 - (-8.5)) < 1e-12
assert abs(0.5 / 0.4 - 1.25) < 1e-12
```

### Example 3 (hard): leaving out ability
A labour economist believes the true wage equation is $\text{wage} = \beta_0 + 1.5\,\text{educ} + 0.4\,\text{ability} + u$ with $E[u \mid \text{educ}, \text{ability}] = 0$, where ability is a test score in points. Her survey of 50 workers has no ability measure, so she regresses wages on education alone. In the sample, $\sum (\text{educ} - \overline{\text{educ}})^2 = 200$, $\sum (\text{educ} - \overline{\text{educ}})(\text{ability} - \overline{\text{ability}}) = 300$ and $\sum (\text{ability} - \overline{\text{ability}})^2 = 900$. (a) What does her slope estimate on average? (b) What does that mean for a reform adding 2 years of schooling? (c) Does a larger survey help? (d) What would including ability cost in precision?

1. $\delta_1 = \dfrac{300}{200} = 1.5$
   *Why:* $\delta_1$ is the slope of ability on education in the sample: workers with one more year of education score on average 1.5 points higher. We divide by the spread of education, the included regressor, not by the 900 of ability.
2. $E[\tilde b_1 \mid X] = \beta_1 + \beta_2\delta_1 = 1.5 + 0.4 \times 1.5 = 2.1$
   *Why:* one more year of education comes with 1.5 more ability points, each worth 0.4 an hour, and the short regression credits that $0.6$ to education. Ability raises wages and moves with education, so the bias is upwards: 0.6 is 40 % of the true return.
3. Reform adding 2 years: predicted gain $2 \times 2.1 = 4.2$ an hour, true gain $2 \times 1.5 = 3.0$
   *Why:* the reform changes schooling but not ability, so only $\beta_1$ applies. A cost–benefit study based on the biased slope would overstate the benefit by 1.2 an hour per worker and might fund a programme that does not pay.
4. With a survey of 5000 workers $\delta_1$ settles at its population value, and $\tilde b_1$ settles at $\beta_1 + \beta_2\delta_1$, not at $\beta_1$
   *Why:* more data shrink the variance of $\tilde b_1$ but not its bias, so the short regression is not consistent. The cure is better data (an ability measure) or a different method, not a bigger sample.
5. Including ability: $\operatorname{Var}(b_1 \mid X) = \sigma^2 \dfrac{900}{200 \times 900 - 300^2} = \dfrac{\sigma^2}{100}$, against $\dfrac{\sigma^2}{200}$ for the short regression
   *Why:* the slope entry of $\sigma^2(X^\top X)^{-1}$ comes from the centred $2 \times 2$ matrix of EM01. Education and ability are correlated (correlation $300/\sqrt{200 \times 900} = 0.71$), so separating their effects doubles the variance. The long regression is centred on the truth with a wider spread; the short one is precise around the wrong number. Gauss–Markov compares only unbiased estimators, and the short regression is not one of them here.

```verify
b1 = 1.5; b2 = 0.4; s11 = 200; s12 = 300; s22 = 900
delta = s12 / s11
assert delta == 1.5
eb = b1 + b2 * delta
assert abs(eb - 2.1) < 1e-12
bias = b2 * delta
assert abs(bias - 0.6) < 1e-12 and abs(bias / b1 - 0.4) < 1e-12
assert abs(2 * eb - 4.2) < 1e-12 and 2 * b1 == 3 and abs(2 * eb - 2 * b1 - 1.2) < 1e-12
# a direct check: short regression on E[y] for five workers with the same delta
educ = [10, 12, 14, 16, 18]; abil = [46, 46, 48, 52, 58]
de = educ - mean(educ)
assert sum(de .* (abil - mean(abil))) / sum(de .^ 2) == 1.5
ey = 5 + b1 * educ + b2 * abil
assert abs(sum(de .* (ey - mean(ey))) / sum(de .^ 2) - 2.1) < 1e-12
# variance with and without ability, in units of sigma^2
M = [s11, s12; s12, s22]
Mi = inv(M)
assert abs(Mi[1, 1] - 1 / 100) < 1e-12
assert abs(s22 / (s11 * s22 - s12^2) - 1 / 100) < 1e-12
assert abs((1 / 100) / (1 / s11) - 2) < 1e-12
assert abs(s12 / sqrt(s11 * s22) - 0.7071) < 0.0001
```

## Common mistakes
- Dividing SSR by $n$ when estimating $\sigma^2$; the residuals are fitted to the data, so the unbiased divisor is $n - k$ (DF_N).
- Counting only the regressors in $k$; the intercept is a coefficient too, so $k = m + 1$ (DF_NO_INTERCEPT).
- Dividing SSR by $n - 1$, the divisor for the variance of one variable, instead of $n - k$ (DF_N_MINUS_1).
- Reporting $s^2/\sum (x - \bar x)^2$, the estimated variance of $b_1$, as its standard error without taking the square root (VAR_NOT_SE).
- Using the raw $\sum x^2$ instead of $\sum (x - \bar x)^2 = \sum x^2 - n\bar x^2$ in the standard error (UNCENTRED_SXX).
- Assuming a regression that leaves out a relevant, correlated variable is still unbiased (NO_BIAS).
- Writing the short-regression slope as $\beta_1 - \beta_2\delta_1$; the bias is $+\beta_2\delta_1$ (BIAS_SIGN).
- Giving the bias $\beta_2\delta_1$ when the question asks for the expected slope $\beta_1 + \beta_2\delta_1$ (BIAS_ONLY).
- Computing $\delta_1$ by dividing the cross-product by the spread of $x_2$ instead of $x_1$ (DELTA_REVERSED).
- Reading "unbiased" as "correct in my sample": it is a property of the method over all possible samples; a single estimate can be far off, which is what the standard error measures.
- Believing heteroskedasticity makes OLS biased: it does not; it makes the usual standard errors wrong and OLS no longer best, as EM04 shows.
- Thinking the Gauss–Markov theorem needs normal errors: it needs only assumptions 1–5; normality is for exact $t$ and $F$ tests.
- Expecting a bigger sample to remove omitted-variable bias: it removes noise, not bias.

## Practice
- `ols-error-variance-estimate` (difficulty 1): the unbiased estimate $s^2 = \text{SSR}/(n - k)$ from SSR, the number of observations and the number of regressors (wage, demand, growth or house-price equations), to 2 decimal places; distractors DF_N, DF_NO_INTERCEPT, DF_N_MINUS_1.
- `ols-slope-standard-error` (difficulty 2): $\operatorname{SE}(b_1) = s/\sqrt{\sum (x - \bar x)^2}$ in a simple regression from SSR, $n$, $\bar x$ and $\sum x^2$ (wages on education, sales on price, spending on income), to 4 decimal places; distractors VAR_NOT_SE, DF_N, UNCENTRED_SXX.
- `omitted-variable-bias-slope` (difficulty 3): the expected short-regression slope $\beta_1 + \beta_2\delta_1$ when $x_2$ is left out, with $\delta_1$ from the sample sums (ability in a wage equation, quality in a demand equation, soil quality in a fertiliser study); distractors NO_BIAS, BIAS_SIGN, BIAS_ONLY, DELTA_REVERSED.

## Real world
- Returns to education: simple wage regressions are suspected of upward ability bias, as in Example 3. Labour economists have tried to remove it by comparing twins, who share family background, by using test scores as a measure of ability, and by natural experiments such as changes in the school-leaving age.
- Demand estimation: prices are often higher for better products, and quality is hard to measure. Leaving it out biases the price coefficient upwards, so demand looks less price-sensitive than it is, and can even appear to slope upwards. Industrial economists and competition authorities therefore control for product characteristics or use other sources of price variation.
- Survey and experiment design: because $\operatorname{Var}(b_1) = \sigma^2/(n\,v_x)$, researchers choose sample sizes (and, in experiments, the spread of the treatment) so that the standard error is small enough to detect the effect they care about. Statistics offices use the same reasoning when they decide how many households to survey.
- Regression tables: the numbers in brackets under each coefficient in an economics paper are standard errors $s\sqrt{[(X^\top X)^{-1}]_{jj}}$, or robust versions of them when homoskedasticity is in doubt (EM04). EM03 turns them into $t$ tests and confidence intervals.

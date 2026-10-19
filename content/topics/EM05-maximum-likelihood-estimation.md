---
id: EM05
title: Maximum likelihood estimation
block: EM
coreYear: 3
prerequisites: [ST203, C109]
estMinutes: 50
status: draft
economicUses:
  - Estimating the default probability of a bank's loans
  - The arrival rate of customers at a branch, shop or call centre
  - How long spells of unemployment last
  - Logit and probit models of whether a household buys a car
  - Likelihood-ratio tests of economic restrictions
generators: [mle-poisson-or-bernoulli, mle-exponential-or-normal-variance, mle-likelihood-ratio-proportion]
widgets: [mle-bernoulli-log-likelihood]
mistakeCodes:
  MEDIAN_NOT_MEAN:
    label: Gave the median instead of the mean
    explanation: For Poisson counts the log-likelihood peaks at the sample mean, λ̂ = Σx/n. The median is a different summary of the data and is not the maximum likelihood estimate.
  SUM_NOT_MEAN:
    label: Used the total instead of the average
    explanation: The likelihood has one factor per observation, so the estimate uses the average, not the total. λ̂ = Σx/n for a Poisson rate, p̂ = k/n for a probability and θ̂ = n/Σx = 1/x̄ for an exponential rate.
  DIVISOR_N_MINUS_1:
    label: Divided by n − 1 instead of n
    explanation: Maximum likelihood divides by the number of observations n, as in x̄ = Σx/n and σ̂² = Σ(x − x̄)²/n. The divisor n − 1 belongs to the unbiased sample variance s², which is a different estimator.
  ADD_ONE_SMOOTHING:
    label: Used (k + 1)/(n + 2)
    explanation: Adding one success and one failure is a smoothing rule, not maximum likelihood. Setting the derivative of k ln p + (n − k) ln(1 − p) to zero gives exactly p̂ = k/n.
  FAILURE_SHARE:
    label: Gave the share of the other outcome
    explanation: p is the probability of the event counted by k (a default, a purchase, an exporter), so p̂ = k/n. (n − k)/n estimates 1 − p, the probability of the opposite outcome.
  MEAN_NOT_RATE:
    label: Gave the mean duration instead of the rate
    explanation: In the density θe^(−θx) the rate θ is one over the mean duration. The MLE is θ̂ = 1/x̄, not x̄; a long average wait means a low rate.
  SS_NOT_DIVIDED:
    label: Gave the sum of squares
    explanation: Σ(x − x̄)² grows with the number of observations. The variance is an average of the squared deviations, σ̂² = Σ(x − x̄)²/n.
  SD_NOT_VARIANCE:
    label: Gave the standard deviation instead of the variance
    explanation: The question asks for σ̂², the variance. Its square root σ̂ is the standard deviation, in the units of the data, not squared units.
  LR_NOT_DOUBLED:
    label: Forgot the factor 2 in LR
    explanation: The statistic is LR = 2(ℓ_U − ℓ_R). The difference ℓ_U − ℓ_R on its own does not have the χ² distribution, so compare twice the difference with the critical value.
  LOG_BASE_10:
    label: Used logs to base 10
    explanation: Log-likelihoods use natural logarithms, ln = log base e. Logs to base 10 make every log-likelihood, and so LR, 2.303 times too small.
  DROPPED_FAILURES:
    label: Left out the (n − k) ln(1 − p) term
    explanation: Every observation contributes to the log-likelihood, the "no" outcomes as well as the "yes" ones. Keep both terms, k ln p + (n − k) ln(1 − p), at p̂ and at p₀.
resources:
  - { title: "Reading 10b: Maximum Likelihood Estimates (MIT OpenCourseWare, 18.05)", url: "https://ocw.mit.edu/courses/18-05-introduction-to-probability-and-statistics-spring-2014/resources/mit18_05s14_reading10b/", kind: course, verifiedAt: 2026-10-18 }
  - { title: "STAT 415, Lesson 4: Maximum Likelihood Estimation (Penn State)", url: "https://online.stat.psu.edu/stat415/Lesson04", kind: course, verifiedAt: 2026-10-18 }
  - { title: "STAT 415, Lesson 7: Asymptotic Distribution of MLE (Penn State)", url: "https://online.stat.psu.edu/stat415/Lesson07", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
A bank lent to 60 small businesses and 9 of them defaulted within a year. What is the default probability, how precise is that number, and is it consistent with the 5 % that the bank's risk model assumes? Or: does a household's income change the probability that it buys a car this year? Questions like these have yes/no outcomes, counts or waiting times, not a straight line through a cloud of points, so least squares is not the natural tool. **Maximum likelihood** is the general method behind almost every model in applied econometrics beyond linear regression: logit and probit models of choices, count models of patents or doctor visits, duration models of unemployment, and the volatility models used in finance. It also gives standard errors and a test, the likelihood-ratio test, almost for free. And OLS itself turns out to be maximum likelihood when the errors are normal.

## Intuition
Probability runs from a model to data: if the default probability is $p = 0.05$, how likely is it that exactly 9 of 60 loans default? **Likelihood** runs the other way: the data are fixed, and we ask which value of $p$ makes them most likely. With $p = 0.01$, nine defaults would be a freak event; with $p = 0.5$ we would expect about 30 defaults, so nine would be just as strange: in both cases the binomial probability of exactly 9 defaults is about one in a hundred million. Somewhere in between, at $p = 9/60 = 0.15$, the observed data are as probable as they can be, with a probability of 0.14. That value is the **maximum likelihood estimate**.

Because the observations are independent, the likelihood is a product of many probabilities, each below 1, so it is a tiny number that is awkward to differentiate. Taking logs turns the product into a sum, and since $\ln$ is increasing, the log-likelihood peaks at exactly the same place. So in practice we always maximise the **log-likelihood**, with the tools of C109: set the derivative to zero and check that the second derivative is negative.

The shape of the peak tells us how much we have learned. If the log-likelihood falls steeply on both sides, values of $p$ a little away from the peak are much less compatible with the data, and the estimate is precise. If it is flat, many values fit almost equally well. More data make the peak sharper, which is why standard errors shrink as the sample grows.

## Definition and formulas
**Likelihood and log-likelihood.** Let $x_1, \dots, x_n$ be independent observations, each with probability (or density) $f(x; \theta)$ that depends on an unknown parameter $\theta$. The **likelihood** is their joint probability seen as a function of $\theta$, and the **log-likelihood** is its natural log:
$$L(\theta) = \prod_{i=1}^{n} f(x_i; \theta), \qquad \ell(\theta) = \ln L(\theta) = \sum_{i=1}^{n} \ln f(x_i; \theta).$$
The **maximum likelihood estimator (MLE)** $\hat\theta$ is the value that maximises $L$, or equivalently $\ell$. Terms of $\ell$ that do not contain $\theta$ can be dropped: they shift the curve up or down but do not move its peak.

**The recipe.** Solve the first-order condition $\ell'(\hat\theta) = 0$, then check $\ell''(\hat\theta) < 0$. If $\ell'' < 0$ everywhere (a concave log-likelihood, as in every example here), the stationary point is the global maximum.

**Bernoulli (yes/no outcomes).** With $f(x; p) = p^x (1 - p)^{1-x}$ for $x \in \{0, 1\}$ and $k$ successes in $n$ trials,
$$\ell(p) = k\ln p + (n - k)\ln(1 - p), \qquad \ell'(p) = \frac{k}{p} - \frac{n - k}{1 - p} = 0 \;\Rightarrow\; \hat p = \frac{k}{n}.$$
The binomial distribution of ST104 gives the same $\ell$ plus the constant $\ln\binom{n}{k}$, so the same $\hat p$: the share of successes.

**Poisson (counts).** With $f(x; \lambda) = e^{-\lambda}\lambda^x/x!$,
$$\ell(\lambda) = -n\lambda + \Big(\sum x_i\Big)\ln\lambda - \sum \ln x_i!, \qquad \ell'(\lambda) = -n + \frac{\sum x_i}{\lambda} = 0 \;\Rightarrow\; \hat\lambda = \bar x .$$

**Exponential (waiting times).** With $f(x; \theta) = \theta e^{-\theta x}$ for $x > 0$, whose mean is $1/\theta$,
$$\ell(\theta) = n\ln\theta - \theta\sum x_i, \qquad \ell'(\theta) = \frac{n}{\theta} - \sum x_i = 0 \;\Rightarrow\; \hat\theta = \frac{n}{\sum x_i} = \frac{1}{\bar x}.$$
**Invariance:** the MLE of any function of $\theta$ is that function of $\hat\theta$. So the MLE of the mean duration $1/\theta$ is $1/\hat\theta = \bar x$.

**Normal (two parameters).** For the normal distribution of ST105,
$$\ell(\mu, \sigma^2) = -\frac{n}{2}\ln(2\pi) - \frac{n}{2}\ln\sigma^2 - \frac{\sum (x_i - \mu)^2}{2\sigma^2}.$$
Setting the derivative with respect to each parameter to zero, holding the other fixed (MV02), gives
$$\hat\mu = \bar x, \qquad \hat\sigma^2 = \frac{1}{n}\sum (x_i - \bar x)^2 .$$
This $\hat\sigma^2$ divides by $n$, not by $n - 1$ like the sample variance $s^2$ of ST203. It is **biased**: $E[\hat\sigma^2] = \frac{n-1}{n}\sigma^2$, so on average it is slightly too small; the gap vanishes as $n$ grows. For example, the values 4, 7, 5, 8, 6 have $\bar x = 6$ and $\sum (x - \bar x)^2 = 10$, so $\hat\sigma^2 = 10/5 = 2$ while $s^2 = 10/4 = 2.5$.

**Properties.** Maximum likelihood is not always unbiased in small samples (both $\hat\sigma^2$ and the exponential $\hat\theta$ are biased), but when the model is correctly specified and the sample is large, the MLE is
- **consistent**: it gets closer and closer to the true $\theta$ as $n$ grows;
- **asymptotically normal**: its sampling distribution is approximately normal, centred on the true $\theta$;
- **asymptotically efficient**: no other consistent, asymptotically normal estimator has a smaller variance in large samples.

**Standard errors from the curvature.** The sharper the peak, the more precise the estimate. The **observed information** is $-\ell''(\hat\theta)$, and
$$\operatorname{SE}(\hat\theta) \approx \frac{1}{\sqrt{-\ell''(\hat\theta)}} .$$
For the Bernoulli model $-\ell''(\hat p) = \dfrac{k}{\hat p^2} + \dfrac{n - k}{(1 - \hat p)^2} = \dfrac{n}{\hat p(1 - \hat p)}$, which gives back the familiar $\operatorname{SE}(\hat p) = \sqrt{\hat p(1 - \hat p)/n}$ of ST203. For the Poisson, $\operatorname{SE}(\hat\lambda) = \sqrt{\hat\lambda/n}$, and for the exponential, $\operatorname{SE}(\hat\theta) = \hat\theta/\sqrt{n}$. An approximate 95 % confidence interval is $\hat\theta \pm 1.96\,\operatorname{SE}(\hat\theta)$, and $z = (\hat\theta - \theta_0)/\operatorname{SE}$ gives a test (the **Wald test**) as in ST204.

**The likelihood-ratio test.** To test a null hypothesis that imposes $q$ restrictions, maximise the log-likelihood twice: without the restrictions ($\ell_U$) and with them ($\ell_R$). Since restrictions can only lower the maximum, $\ell_U \ge \ell_R$, and
$$\text{LR} = 2\,(\ell_U - \ell_R) \;\sim\; \chi^2_q \text{ approximately under } H_0 .$$
Reject $H_0$ when LR exceeds the critical value. The 5 % critical values are

$$\begin{array}{c|ccc} q & 1 & 2 & 3 \\ \hline \chi^2_q(5\,\%) & 3.841 & 5.991 & 7.815 \end{array}$$

So with one restriction, $H_0$ is rejected when the log-likelihood drops by more than $3.841/2 \approx 1.92$.

**OLS is maximum likelihood with normal errors.** In the regression $y_i = \beta_0 + \beta_1 x_{1i} + \dots + \beta_q x_{qi} + u_i$ with independent errors $u_i \sim N(0, \sigma^2)$,
$$\ell(\beta, \sigma^2) = -\frac{n}{2}\ln(2\pi\sigma^2) - \frac{\text{SSR}(\beta)}{2\sigma^2}, \qquad \text{SSR}(\beta) = \sum_i (y_i - \beta_0 - \beta_1 x_{1i} - \dots - \beta_q x_{qi})^2 .$$
For any $\sigma^2$, the $\beta$ that maximises $\ell$ is the one that minimises SSR: the OLS estimator of EM01. The MLE of the error variance is $\hat\sigma^2 = \text{SSR}/n$, while the unbiased $s^2 = \text{SSR}/(n - q - 1)$ of EM02 divides by the degrees of freedom. Substituting $\hat\sigma^2$ gives the maximised value $\ell = -\frac{n}{2}\left(1 + \ln 2\pi + \ln(\text{SSR}/n)\right)$, so for a restricted and an unrestricted regression $\text{LR} = n\ln(\text{SSR}_R/\text{SSR}_U)$, a large-sample cousin of the F test of EM03.

**Discrete choice: logit and probit.** The main economic use of maximum likelihood is for choices. Let $y_i = 1$ if household $i$ buys a car this year and 0 otherwise. A **logit** model lets the probability depend on income $x_i$ through
$$P(y_i = 1 \mid x_i) = \Lambda(\beta_0 + \beta_1 x_i), \qquad \Lambda(z) = \frac{e^z}{1 + e^z},$$
and a **probit** model uses the standard normal distribution function $\Phi(z)$ instead of $\Lambda(z)$. Both keep the probability between 0 and 1, which a straight line cannot do. The log-likelihood is the Bernoulli one, with a different $p_i$ for each household:
$$\ell(\beta_0, \beta_1) = \sum_{i=1}^{n} \Big[\, y_i \ln p_i + (1 - y_i)\ln(1 - p_i) \,\Big], \qquad p_i = \Lambda(\beta_0 + \beta_1 x_i).$$
There is no formula for the maximum, so software climbs the log-likelihood numerically (NM02). The sign of $\beta_1$ says whether higher income raises the probability of buying; the size of the effect on the probability is $\Lambda(z)(1 - \Lambda(z))\,\beta_1$ in a logit, so it depends on where the household starts. Standard errors come from the curvature and joint tests from LR, exactly as above.

## Interactive
::widget{id="mle-bernoulli-log-likelihood"}

The graph shows the log-likelihood of a default probability $p$ when $k$ of $n$ loans default, shifted down by its maximum $\ell(\hat p)$ so that the peak sits at 0; the dashed gold line lies 1.92 below the peak, the cut-off of a likelihood-ratio test at 5 %. It starts with the data of Example 3, $n = 60$ and $k = 9$: the panel shows $\hat p = 0.15$, $\ell(\hat p) = -25.36$ and a standard error of 0.046, and the hollow dots mark the values of $p$ the test would not reject, from 0.075 to 0.254. The bank's 0.05 lies outside them. Now set **Loans n** to 240 and **Defaults k** to 36: $\hat p$ is still 0.15, but the curve is much narrower, the standard error halves to 0.023 and the hollow dots close in to 0.109 and 0.199. Move **Defaults k** and watch the peak follow $k/n$.

## Worked examples

### Example 1 (easy): the arrival rate of customers
A bank branch counts the customers who arrive in the first 10 minutes after opening on 6 days: $3, 5, 2, 4, 7, 3$. Assuming the counts are independent Poisson draws with rate $\lambda$, find the maximum likelihood estimate $\hat\lambda$ and check that it is a maximum.

1. $\sum x_i = 3 + 5 + 2 + 4 + 7 + 3 = 24, \qquad \ell(\lambda) = -6\lambda + 24\ln\lambda - \sum \ln x_i!$
   *Why:* each day contributes $\ln\!\left(e^{-\lambda}\lambda^{x_i}/x_i!\right) = -\lambda + x_i\ln\lambda - \ln x_i!$. The last terms do not involve $\lambda$, so they cannot move the peak.
2. $\ell'(\lambda) = -6 + \dfrac{24}{\lambda} = 0 \;\Rightarrow\; \hat\lambda = \dfrac{24}{6} = 4$
   *Why:* at the top of the log-likelihood the slope is zero. The estimate is the sample mean: 4 customers per 10 minutes.
3. $\ell''(\lambda) = -\dfrac{24}{\lambda^2}, \qquad \ell''(4) = -\dfrac{24}{16} = -1.5 < 0$
   *Why:* the second derivative is negative for every $\lambda > 0$, so the log-likelihood is concave and $\hat\lambda = 4$ is its global maximum.
4. Not the median: the sorted counts $2, 3, 3, 4, 5, 7$ have median $3.5$, and $\ell(3.5) < \ell(4)$
   *Why:* the median is another way of summarising the data, but the Poisson likelihood is highest at the mean.

```verify
x = [3, 5, 2, 4, 7, 3]
S = sum(x)
assert S == 24
lam = S / 6
assert lam == 4
# the derivative is zero at 4 and the second derivative negative
assert abs(-6 + S / lam) < 1e-12
assert -S / lam^2 == -1.5
ell(t) = -6 * t + S * log(t)
assert ell(4) > ell(3.99) and ell(4) > ell(4.01)
assert median(x) == 3.5
assert ell(3.5) < ell(4)
```

### Example 2 (medium): how long unemployment lasts
A labour-market survey follows 6 workers who lost their jobs. They found new jobs after $3, 8, 1, 14, 6$ and $4$ months. Model the durations as independent exponential draws with density $\theta e^{-\theta x}$, where $\theta$ is the monthly rate of finding a job. Find $\hat\theta$, its standard error and the estimated mean duration.

1. $\sum x_i = 36, \qquad \ell(\theta) = 6\ln\theta - 36\,\theta$
   *Why:* each worker contributes $\ln\theta - \theta x_i$; adding six of them gives $6\ln\theta$ minus $\theta$ times the total time spent unemployed.
2. $\ell'(\theta) = \dfrac{6}{\theta} - 36 = 0 \;\Rightarrow\; \hat\theta = \dfrac{6}{36} = \dfrac{1}{6} = 0.167$ per month
   *Why:* the rate is one over the average duration: the workers needed 6 months on average, so about one in six finds a job each month.
3. $\ell''(\theta) = -\dfrac{6}{\theta^2}, \qquad -\ell''(\hat\theta) = 6 \times 36 = 216$
   *Why:* the second derivative is negative, so this is a maximum; its size, the observed information, measures how sharp the peak is.
4. $\operatorname{SE}(\hat\theta) \approx \dfrac{1}{\sqrt{216}} = 0.068, \qquad \hat\theta \pm 1.96 \times 0.068 = [0.033,\ 0.300]$
   *Why:* the SE is one over the square root of the observed information (here also $\hat\theta/\sqrt{6}$). The interval is very wide because six spells carry little information.
5. Estimated mean duration $= 1/\hat\theta = 6$ months
   *Why:* by invariance, the MLE of the mean $1/\theta$ is $1/\hat\theta$, which is just the sample mean of the durations.

```verify
d = [3, 8, 1, 14, 6, 4]
S = sum(d)
assert S == 36
th = 6 / S
assert abs(th - 0.167) < 0.0005
ell(t) = 6 * log(t) - S * t
assert ell(th) > ell(th - 0.001) and ell(th) > ell(th + 0.001)
info = 6 / th^2
assert abs(info - 216) < 1e-9
se = 1 / sqrt(info)
assert abs(se - 0.068) < 0.0005
assert abs(se - th / sqrt(6)) < 1e-12
assert abs((th - 1.96 * se) - 0.033) < 0.0005 and abs((th + 1.96 * se) - 0.300) < 0.0005
assert abs(1 / th - 6) < 1e-12
```

### Example 3 (hard): testing a bank's default assumption
Of 60 small-business loans that a bank made, 9 defaulted within a year. Treating the loans as independent with default probability $p$, find $\hat p$ and its standard error, and test the risk model's assumption $H_0: p = 0.05$ with a likelihood-ratio test at 5 %.

1. $\ell(p) = 9\ln p + 51\ln(1 - p), \qquad \ell'(p) = \dfrac{9}{p} - \dfrac{51}{1 - p} = 0 \;\Rightarrow\; \hat p = \dfrac{9}{60} = 0.15$
   *Why:* 9 loans defaulted (probability $p$ each) and 51 did not (probability $1 - p$ each). Solving $9(1 - p) = 51p$ gives the share of defaults.
2. $-\ell''(\hat p) = \dfrac{9}{0.15^2} + \dfrac{51}{0.85^2} = 400 + 70.59 = 470.59, \qquad \operatorname{SE}(\hat p) = \dfrac{1}{\sqrt{470.59}} = 0.046$
   *Why:* the curvature at the peak is the observed information. The result equals $\sqrt{0.15 \times 0.85/60}$, the standard error of a proportion from ST203.
3. $\ell_U = \ell(0.15) = 9\ln 0.15 + 51\ln 0.85 = -25.363, \qquad \ell_R = \ell(0.05) = 9\ln 0.05 + 51\ln 0.95 = -29.578$
   *Why:* the unrestricted model may choose any $p$ and reaches its maximum at $\hat p$; the restricted model must use $p = 0.05$, so it fits worse.
4. $\text{LR} = 2\,(-25.363 - (-29.578)) = 8.43 > \chi^2_1(5\,\%) = 3.841$; the p-value is $P(\chi^2_1 > 8.43) = 0.0037$
   *Why:* one restriction, so 1 degree of freedom. Nine defaults out of 60 would be very unlikely if the true rate were 5 %, so $H_0$ is rejected: the risk model understates the default risk of these loans.
5. Cross-check with the Wald test: $z = \dfrac{0.15 - 0.05}{0.046} = 2.17 > 1.96$
   *Why:* the Wald test uses only the peak and its curvature, the LR test the whole log-likelihood. In large samples they agree, and here both reject.

```verify
k = 9; n = 60
ph = k / n
assert ph == 0.15
info = k / ph^2 + (n - k) / (1 - ph)^2
assert abs(k / ph^2 - 400) < 1e-9
assert abs((n - k) / (1 - ph)^2 - 70.59) < 0.005
assert abs(info - 470.59) < 0.005
assert abs(info - n / (ph * (1 - ph))) < 1e-9
se = 1 / sqrt(info)
assert abs(se - 0.046) < 0.0005
assert abs(se - sqrt(ph * (1 - ph) / n)) < 1e-12
lu = k * log(ph) + (n - k) * log(1 - ph)
lr0 = k * log(0.05) + (n - k) * log(0.95)
assert abs(lu - (-25.363)) < 0.0005
assert abs(lr0 - (-29.578)) < 0.0005
LR = 2 * (lu - lr0)
assert abs(LR - 8.43) < 0.005
assert LR > 3.841
# chi-square with 1 df is a squared standard normal: P(chi2 > c) = 1 - erf(sqrt(c/2))
assert abs((1 - erf(sqrt(3.841 / 2))) - 0.05) < 0.0001
pval = 1 - erf(sqrt(LR / 2))
assert abs(pval - 0.0037) < 0.00005
z = (ph - 0.05) / se
assert abs(z - 2.17) < 0.005
assert z > 1.96
```

## Common mistakes
- Giving the median of Poisson counts instead of their mean; the log-likelihood peaks at $\bar x$ (MEDIAN_NOT_MEAN).
- Giving the total, $\sum x$ or $k$, or $1/\sum x$ for an exponential rate, instead of using the average (SUM_NOT_MEAN).
- Dividing by $n - 1$: the MLE divides by $n$, both for a mean and for the variance $\hat\sigma^2$ (DIVISOR_N_MINUS_1).
- Writing $\hat p = (k + 1)/(n + 2)$, a smoothing rule rather than the maximum likelihood estimate $k/n$ (ADD_ONE_SMOOTHING).
- Estimating the probability of the wrong outcome, $(n - k)/n$, when $p$ refers to the event that was counted (FAILURE_SHARE).
- Giving the mean duration $\bar x$ when the rate $\theta = 1/\text{mean}$ is asked for (MEAN_NOT_RATE).
- Stopping at the sum of squares $\sum (x - \bar x)^2$ without dividing by $n$ (SS_NOT_DIVIDED).
- Taking the square root at the end and giving $\hat\sigma$ when $\hat\sigma^2$ is asked for (SD_NOT_VARIANCE).
- Comparing $\ell_U - \ell_R$ instead of $2(\ell_U - \ell_R)$ with the χ² critical value (LR_NOT_DOUBLED).
- Using logs to base 10 in the log-likelihood instead of natural logs (LOG_BASE_10).
- Keeping only the $k\ln p$ term and dropping $(n - k)\ln(1 - p)$, as if the loans that were repaid carried no information (DROPPED_FAILURES).
- Forgetting the second-order check: $\ell'(\theta) = 0$ can also hold at a minimum, so confirm that $\ell'' < 0$, as in C109.
- Believing that maximising $L$ and maximising $\ell = \ln L$ can give different answers; the log is increasing, so the peak is in the same place.
- Taking the square root of $\ell''(\hat\theta)$ itself, which is negative; the standard error uses $-\ell''(\hat\theta)$, a positive number.
- Reading a logit coefficient $\beta_1$ as the change in the probability; the effect on the probability is $\Lambda(z)(1 - \Lambda(z))\beta_1$ and depends on the household's starting point.

## Practice
- `mle-poisson-or-bernoulli` (difficulty 1): the maximum likelihood estimate of a Poisson rate $\hat\lambda = \bar x$ from 5 to 10 counts (bank customers, insurance claims, online orders), to 2 decimal places, or of a Bernoulli probability $\hat p = k/n$ (loan defaults, car purchases, exporting firms), to 3 decimal places; distractors MEDIAN_NOT_MEAN, SUM_NOT_MEAN, DIVISOR_N_MINUS_1 for $\hat\lambda$, and ADD_ONE_SMOOTHING, FAILURE_SHARE, SUM_NOT_MEAN for $\hat p$.
- `mle-exponential-or-normal-variance` (difficulty 2): the MLE of an exponential rate $\hat\theta = n/\sum x = 1/\bar x$ from 4 to 6 durations (unemployment spells, gaps between customers, months until a van breaks down), to 3 decimal places, or of a normal variance $\hat\sigma^2 = \sum (x - \bar x)^2/n$ (fund returns, wages, regional growth rates), to 2 decimal places; distractors MEAN_NOT_RATE, DIVISOR_N_MINUS_1, SUM_NOT_MEAN for $\hat\theta$, and DIVISOR_N_MINUS_1, SS_NOT_DIVIDED, SD_NOT_VARIANCE for $\hat\sigma^2$.
- `mle-likelihood-ratio-proportion` (difficulty 3): the likelihood-ratio statistic $2[\ell(\hat p) - \ell(p_0)]$ for a hypothesised probability, from $k$ "yes" outcomes in $n$ (loan defaults, car purchases, exporters), with the χ² critical value given for the decision, to 2 decimal places; distractors LR_NOT_DOUBLED, LOG_BASE_10, DROPPED_FAILURES.

## Real world
- Credit risk: banks estimate the probability of default of their borrowers with logit models fitted by maximum likelihood, using income, debt and payment history as regressors. Supervisors then check the predicted default rates against the defaults that actually happen, much as in Example 3.
- Choice models: logit and probit models explain which households buy a car, which mode of transport commuters choose, whether a woman joins the labour force or which product a shopper picks. Daniel McFadden shared the 2000 Nobel Prize in economics for developing this approach to discrete choice.
- Labour economics: duration models, of which the exponential is the simplest, are estimated by maximum likelihood on spells of unemployment to see how benefits, age or training change the rate at which people find work.
- Counts and finance: Poisson models of patents per firm, doctor visits or insurance claims, and the volatility models of asset returns used by banks and central banks, are all fitted by maximising a log-likelihood, and statistical software prints the maximised log-likelihood and LR tests next to the estimates.

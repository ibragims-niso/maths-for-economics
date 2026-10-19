---
id: ST202
title: Sampling distributions and the central limit theorem
block: ST2
coreYear: 2
prerequisites: [ST105]
estMinutes: 45
status: draft
economicUses:
  - Unemployment rate from a labour force survey
  - Average household spending from a household budget survey
  - Quality control of average packet weights and daily sales
  - Opinion polls and customer satisfaction surveys
  - Deciding how large a survey must be
generators: [sample-mean-tail-probability, sample-proportion-probability, sample-size-for-precision]
widgets: [sample-mean-clt]
mistakeCodes:
  SD_NOT_SE:
    label: Used σ instead of the standard error σ/√n
    explanation: σ is the spread of single observations. A sample mean varies much less, with standard deviation σ/√n (the standard error). Divide by σ/√n when you standardise X̄.
  DIVIDED_BY_N:
    label: Divided σ by n instead of by √n
    explanation: The variance of X̄ is σ²/n, so its standard deviation is the square root, σ/√n. Dividing σ by n makes the spread far too small and the probability too close to 0 or 1.
  WRONG_TAIL:
    label: Took the wrong side of the curve
    explanation: Φ(z) is the area to the left of z, which is P(X̄ < c). For "more than" or "above" use 1 − Φ(z). A quick sketch of the bell curve with the shaded area shows which one you need.
  NO_SQUARE_ROOT:
    label: Forgot the square root in the standard error of p̂
    explanation: p(1 − p)/n is the variance of p̂, not its standard deviation. The standard error is √(p(1 − p)/n); without the root the spread is tiny and the probability ends up at about 0 or 1.
  FORGOT_ONE_MINUS_P:
    label: Left (1 − p) out of the standard error
    explanation: The variance of a single yes/no answer is p(1 − p), so the standard error of a sample proportion is √(p(1 − p)/n), not √(p/n). Keep both p and 1 − p.
  NOT_ROUNDED_UP:
    label: Rounded the sample size down
    explanation: n must be at least (zσ/d)². If that is 138.3, a sample of 138 is just too small to reach the target probability, so round up to 139, even when the decimal part is small.
  FORGOT_TO_SQUARE:
    label: Gave √n instead of n
    explanation: The condition d√n/σ ≥ z gives a lower limit for √n. Square it to get the sample size n itself.
  FORGOT_Z:
    label: Left out the z value
    explanation: Making the standard error σ/√n equal to d only gives about a 68 % chance of being within d. For a probability of 95 % the distance d must be 1.96 standard errors, so n ≥ (1.96σ/d)².
resources:
  - { title: "Introductory Statistics 2e, 7.1 The Central Limit Theorem for Sample Means (Averages) (OpenStax)", url: "https://openstax.org/books/introductory-statistics-2e/pages/7-1-the-central-limit-theorem-for-sample-means-averages", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Introductory Statistics 2e, 7.3 Using the Central Limit Theorem (OpenStax)", url: "https://openstax.org/books/introductory-statistics-2e/pages/7-3-using-the-central-limit-theorem", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Introductory Business Statistics 2e, 7.3 The Central Limit Theorem for Proportions (OpenStax)", url: "https://openstax.org/books/introductory-business-statistics-2e/pages/7-3-the-central-limit-theorem-for-proportions", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
Almost every number in economic statistics comes from a sample. The unemployment rate is measured by asking a few tens of thousands of people, not the whole labour force; average household spending, which sets the weights of the consumer price index, comes from a household budget survey; a factory checks a handful of packets, not every one. A different random sample would have given a slightly different number. This topic answers the question that follows: **how far can a sample figure be from the true value, and how likely is that?** The answer, the sampling distribution, is what lets a statistics office say that a fall in unemployment from 10.0 % to 9.8 % may be just sampling noise, lets a pollster decide how many people to ask, and lets a quality inspector tell a broken machine from bad luck.

## Intuition
Take weekly spending on eating out. Single households differ enormously: many spend almost nothing, a few spend 200 or more, so the distribution is lopsided, with a long right tail. Now pick 36 households at random and average their spending. Big spenders and small spenders tend to cancel, so the average lands much closer to the true mean than a typical single household does. Do it again with another 36 households and you get a slightly different average. If you could repeat this many times, the averages would form their own distribution, the **sampling distribution** of the mean.

Two facts about it are remarkable. First, it is **narrower** than the population, and it narrows in a precise way: its spread is the population's spread divided by $\sqrt{n}$. Four times as many households halve the spread, not quarter it, because the errors cancel only partly. Second, it is **bell-shaped** even though single households are not. This is the **central limit theorem**: an average of many independent pieces is approximately normal, whatever the shape of the pieces. It is why the normal table of ST105 works for survey averages and survey percentages, and why so many economic quantities that are sums of many small effects look normal.

## Definition and formulas
**Population, sample, statistic.** The **population** is the whole group we want to know about (all households, all workers, all packets). Its numbers, such as the mean $\mu$, the standard deviation $\sigma$ or the proportion $p$ with some feature, are **parameters**: fixed but usually unknown. A **random sample** of size $n$ is a set of observations $X_1, \dots, X_n$ that are independent and each have the population's distribution. A **statistic** is a number computed from the sample, such as the sample mean
$$\bar X = \frac{X_1 + X_2 + \dots + X_n}{n}.$$
Before the sample is drawn, $\bar X$ is a random variable (ST103); its distribution is its **sampling distribution**.

**Mean and standard error of $\bar X$.** Means add, and for independent variables variances add too (the rule of ST105, which holds for any independent variables, not only normal ones), so $E[X_1 + \dots + X_n] = n\mu$ and $\operatorname{Var}(X_1 + \dots + X_n) = n\sigma^2$. Dividing the sum by $n$ divides the mean by $n$ and the variance by $n^2$:
$$E[\bar X] = \mu, \qquad \operatorname{Var}(\bar X) = \frac{\sigma^2}{n}, \qquad \operatorname{SE}(\bar X) = \frac{\sigma}{\sqrt{n}}.$$
The standard deviation of a statistic is called its **standard error** (SE). The sample mean is centred on the true mean, and its spread shrinks like $1/\sqrt{n}$. If the population itself is normal, $\bar X \sim N(\mu, \sigma^2/n)$ exactly, for every $n$.

**The central limit theorem (CLT).** If $X_1, \dots, X_n$ are independent with the same distribution, mean $\mu$ and standard deviation $\sigma$, then for large $n$
$$\bar X \approx N\!\left(\mu, \frac{\sigma^2}{n}\right), \qquad \text{so} \qquad Z = \frac{\bar X - \mu}{\sigma/\sqrt{n}} \approx N(0, 1),$$
**whatever the shape of the population**. Equivalently, the total $X_1 + \dots + X_n \approx N(n\mu, n\sigma^2)$. A common rule of thumb is that $n \ge 30$ is large enough; a very skewed population needs more, a nearly symmetric one fewer. So probabilities about $\bar X$ follow from the normal table:
$$P(\bar X < c) \approx \Phi\!\left(\frac{c - \mu}{\sigma/\sqrt{n}}\right), \qquad P(\bar X > c) \approx 1 - \Phi\!\left(\frac{c - \mu}{\sigma/\sqrt{n}}\right).$$
The CLT is about the **average**, not about single observations: one household's spending stays as skewed as ever.

**The sample proportion.** If each person in the population has a feature (unemployed, supports a reform) with probability $p$, and $X$ is the number in the sample who have it, the **sample proportion** is $\hat p = X/n$. Since $X \sim \text{Bin}(n, p)$ (ST104) has mean $np$ and variance $np(1-p)$,
$$E[\hat p] = p, \qquad \operatorname{SE}(\hat p) = \sqrt{\frac{p(1-p)}{n}}.$$
A proportion is the mean of $n$ zeros and ones, so the CLT applies: when $np$ and $n(1-p)$ are both at least about 5, $\hat p \approx N\big(p, p(1-p)/n\big)$ and
$$P(\hat p < c) \approx \Phi\!\left(\frac{c - p}{\sqrt{p(1-p)/n}}\right).$$
For the large samples of real surveys the continuity correction of ST105 shifts $c$ by only $0.5/n$ and is usually left out, as it is here.

**How big a sample?** $\bar X$ is within $d$ of $\mu$ with probability at least 95 % when $d$ is at least 1.96 standard errors ($P(|Z| < 1.96) = 0.95$):
$$\frac{d}{\sigma/\sqrt{n}} \ge 1.96 \iff n \ge \left(\frac{1.96\,\sigma}{d}\right)^2,$$
rounded up to a whole number. For 90 % use 1.645, for 99 % use 2.576. Halving $d$ needs four times the sample.

**Finite population correction.** The formulas assume independent draws; when a sample without replacement takes more than about 5 % of a population of size $N$, multiply the standard error by $\sqrt{(N - n)/(N - 1)}$, a factor that is practically 1 for national surveys.

When $\sigma$ or $p$ is unknown, which is the usual case, the sample's own values stand in for them; turning a sample figure into a range for the true value (a confidence interval) is the subject of ST203. Why $\bar X$ settles down at $\mu$ as $n$ grows, the law of large numbers, is ST206.

## Interactive
::widget{id="sample-mean-clt"}

The green dashed curve is the weekly spending on eating out of one household, as in Example 1: strongly skewed, with mean 60 and standard deviation 60. The lilac curve is the exact distribution of the average $\bar X$ of $n$ households, and the gold dashed curve is the normal curve $N(60, \sigma^2/n)$ that the central limit theorem uses instead. Move the **Sample size n** slider (1 to 100) and the **Half-width c** slider; the panel shows the standard error $\sigma/\sqrt{n}$, the exact probability $P(|\bar X - 60| < c)$ (the shaded area) and the same probability from the normal curve. Check: at the start values $n = 36$ and $c = 10$ the panel shows SE = 10, an exact probability of 0.685 and a normal approximation of 0.6827, the 68 % of ST105, because $c$ is exactly one standard error. Move $n$ down to 1: the lilac curve becomes the skewed population itself, the gold curve no longer fits (it would give impossible negative spending a probability of 0.16, the part cut off at the left edge), and the two probabilities are 0.1232 and 0.1324. Now set $n = 9$ (SE = 20) and then $n = 36$ (SE = 10): four times the sample halves the standard error. At $n = 100$ the standard error is 6, the curve is tall and narrow, and the chance of landing within 10 of the mean rises to 0.9055.

## Worked examples

### Example 1 (easy): average spending in a household survey
Weekly spending on eating out by households in a city has mean $\mu = 60$ and standard deviation $\sigma = 60$; it is strongly skewed to the right. A survey records the spending of $n = 36$ randomly chosen households. What is the probability that the sample's average spending $\bar X$ is more than 72?

1. $E[\bar X] = \mu = 60$
   *Why:* the sample mean is centred on the population mean.
2. $\operatorname{SE}(\bar X) = \dfrac{60}{\sqrt{36}} = \dfrac{60}{6} = 10$
   *Why:* the variance of the average is $\sigma^2/n$, so its standard deviation is $\sigma/\sqrt{n}$; the average of 36 households varies six times less than one household.
3. $z = \dfrac{72 - 60}{10} = 1.2$
   *Why:* with $n = 36 \ge 30$ the central limit theorem makes $\bar X$ approximately $N(60, 10^2)$ even though single households are skewed, so standardise with the standard error.
4. $P(\bar X > 72) \approx 1 - \Phi(1.2) = 1 - 0.8849 = 0.1151$
   *Why:* the table gives the area to the left of 1.2; "more than" is the area to the right.
5. Check: an exact computer calculation for this skewed population gives 0.1184, close to 0.1151. Standardising with $\sigma = 60$ instead would give $1 - \Phi(0.2) = 0.4207$, far too large.
   *Why:* the normal curve is an approximation, and with 36 households it is already good; using the spread of single households ignores how much averaging reduces variation.

```verify
Phi(t) = 0.5 * (1 + erf(t / sqrt(2)))
mu = 60; sigma = 60; n = 36
se = sigma / sqrt(n)
assert se == 10
z = (72 - mu) / se
assert abs(z - 1.2) < 1e-12
assert abs(Phi(1.2) - 0.8849) < 0.00005
p = 1 - Phi(z)
assert abs(p - 0.1151) < 0.00005
# exact value for an exponential population: P(Xbar > 72) = P(Poisson(n*72/mu) < n)
lam = n * 72 / mu
ks = 0:35
pexact = sum(exp(-lam) * lam .^ ks ./ factorial(ks))
assert abs(pexact - 0.1184) < 0.00005
# the mistake of using sigma instead of the standard error
assert abs((1 - Phi((72 - mu) / sigma)) - 0.4207) < 0.00005
```

### Example 2 (medium): the unemployment rate from a labour force survey
In a region the true unemployment rate is $p = 0.1$ (10 %). A labour force survey interviews a random sample of $n = 900$ people from the labour force. What is the probability that the survey's unemployment rate $\hat p$ is below 8.5 %? What is the probability that it is within one percentage point of the truth, and how does that change if the survey is four times as large?

1. $E[\hat p] = 0.1$; $np = 90$ and $n(1 - p) = 810$
   *Why:* the sample proportion is centred on the true proportion, and both counts are far above 5, so the normal approximation is good.
2. $\operatorname{SE}(\hat p) = \sqrt{\dfrac{0.1 \times 0.9}{900}} = \sqrt{0.0001} = 0.01$
   *Why:* one yes/no answer has variance $p(1 - p)$; the proportion of $n$ answers has variance $p(1-p)/n$, and the standard error is its square root.
3. $P(\hat p < 0.085) \approx \Phi\!\left(\dfrac{0.085 - 0.1}{0.01}\right) = \Phi(-1.5) = 0.0668$
   *Why:* by the central limit theorem $\hat p \approx N(0.1, 0.01^2)$; a survey figure 1.5 points too low happens in about 1 survey in 15.
4. $P(0.09 < \hat p < 0.11) \approx \Phi(1) - \Phi(-1) = 0.6827$
   *Why:* one percentage point is exactly one standard error on either side, so this is the 68 % of the 68–95–99.7 rule.
5. With $n = 3600$: $\operatorname{SE} = \sqrt{0.09/3600} = 0.005$, so $P(0.09 < \hat p < 0.11) \approx \Phi(2) - \Phi(-2) = 0.9545$
   *Why:* four times the sample halves the standard error, so the same one-point band is now two standard errors wide.

```verify
Phi(t) = 0.5 * (1 + erf(t / sqrt(2)))
p = 0.1; n = 900
assert abs(n * p - 90) < 1e-9
assert abs(n * (1 - p) - 810) < 1e-9
se = sqrt(p * (1 - p) / n)
assert abs(se - 0.01) < 1e-12
z = (0.085 - p) / se
assert abs(z + 1.5) < 1e-9
assert abs(Phi(z) - 0.0668) < 0.00005
assert abs((Phi(1) - Phi(-1)) - 0.6827) < 0.00005
se4 = sqrt(p * (1 - p) / 3600)
assert abs(se4 - 0.005) < 1e-12
assert abs((0.11 - p) / se4 - 2) < 1e-9
assert abs((Phi(2) - Phi(-2)) - 0.9545) < 0.00005
```

### Example 3 (hard): sales across a retail chain, and how many stores to sample
A retail chain has 4000 stores. Daily sales of a store have mean $\mu = 2000$ and standard deviation $\sigma = 600$, with a few very busy stores making the distribution skewed. Head office samples 36 stores at random. Find the probability that their average daily sales are between 1900 and 2150. Then find how many stores it must sample so that the sample mean is within 100 of $\mu$ with probability at least 95 %.

1. $\operatorname{SE}(\bar X) = \dfrac{600}{\sqrt{36}} = 100$
   *Why:* the spread of an average of 36 independent stores is $\sigma/\sqrt{n}$.
2. $z_a = \dfrac{1900 - 2000}{100} = -1, \qquad z_b = \dfrac{2150 - 2000}{100} = 1.5$
   *Why:* by the central limit theorem $\bar X \approx N(2000, 100^2)$, so standardise both ends with the standard error.
3. $P(1900 < \bar X < 2150) \approx \Phi(1.5) - \Phi(-1) = 0.9332 - 0.1587 = 0.7745$
   *Why:* the area to the left of 1.5 minus the area to the left of $-1$ leaves the band between them.
4. Finite population correction: $36/4000 = 0.9\,\%$ of the stores, factor $\sqrt{(4000 - 36)/(4000 - 1)} = 0.9956$
   *Why:* sampling without replacement from a finite population reduces the spread a little, but with less than 5 % of the stores sampled the factor is almost 1 and can be ignored.
5. $\dfrac{100}{600/\sqrt{n}} \ge 1.96 \iff \sqrt{n} \ge \dfrac{1.96 \times 600}{100} = 11.76 \iff n \ge 11.76^2 = 138.2976$, so $n = 139$ stores
   *Why:* 95 % of a normal distribution lies within 1.96 standard errors, so 100 must be at least 1.96 standard errors; square the condition on $\sqrt{n}$ and round up, since 138 stores fall just short. That is still only 3.5 % of the chain.

```verify
Phi(t) = 0.5 * (1 + erf(t / sqrt(2)))
mu = 2000; sigma = 600; n = 36; N = 4000
se = sigma / sqrt(n)
assert se == 100
za = (1900 - mu) / se
zb = (2150 - mu) / se
assert za == -1
assert zb == 1.5
assert abs(Phi(1.5) - 0.9332) < 0.00005
assert abs(Phi(-1) - 0.1587) < 0.00005
p = Phi(zb) - Phi(za)
assert abs(p - 0.7745) < 0.00005
assert abs((0.9332 - 0.1587) - 0.7745) < 1e-12
# finite population correction
assert abs(n / N - 0.009) < 1e-12
assert abs(sqrt((N - n) / (N - 1)) - 0.9956) < 0.00005
# sample size for +-100 with probability 0.95
assert abs((Phi(1.96) - Phi(-1.96)) - 0.95) < 0.0001
r = 1.96 * sigma / 100
assert abs(r - 11.76) < 1e-12
assert abs(r^2 - 138.2976) < 1e-9
m = ceil(r^2)
assert m == 139
assert 100 / (sigma / sqrt(138)) < 1.96
assert 100 / (sigma / sqrt(139)) >= 1.96
assert abs(m / N - 0.035) < 0.0005
```

## Common mistakes
- Standardising a sample mean with $\sigma$, the spread of single observations, instead of the standard error $\sigma/\sqrt{n}$ (SD_NOT_SE).
- Dividing $\sigma$ by $n$ instead of by $\sqrt{n}$; it is the variance that is divided by $n$ (DIVIDED_BY_N).
- Giving $\Phi(z)$ when the question asks for the chance of a sample mean or proportion above a value (WRONG_TAIL).
- Using $p(1-p)/n$ as the standard error of $\hat p$, forgetting the square root (NO_SQUARE_ROOT).
- Writing the standard error of a proportion as $\sqrt{p/n}$, without the factor $1 - p$ (FORGOT_ONE_MINUS_P).
- Rounding a required sample size such as 138.3 down to 138, which falls just short of the target (NOT_ROUNDED_UP).
- Stopping at $\sqrt{n} \ge 11.76$ and answering 12 (FORGOT_TO_SQUARE).
- Setting $\sigma/\sqrt{n} = d$, which only gives about a 68 % chance of being within $d$; the distance must be $z$ standard errors (FORGOT_Z).
- Thinking the central limit theorem makes the population normal: it says nothing about one household or one worker, only about averages and totals of many.
- Using the normal approximation for a small sample from a very skewed population, or for observations that are not independent, such as households from the same street or sales on consecutive days of a heatwave.
- Confusing the standard deviation of the data (how much households differ) with the standard error (how much the survey average would change from sample to sample).

## Practice
- `sample-mean-tail-probability` (difficulty 1): $P(\bar X > c)$ or $P(\bar X < c)$ for the mean of a sample of $n \ge 36$ from a skewed population (household food spending, a shop's daily sales, packet weights, hourly wages), using $\bar X \approx N(\mu, \sigma^2/n)$, to 4 decimal places; distractors SD_NOT_SE, DIVIDED_BY_N, WRONG_TAIL.
- `sample-proportion-probability` (difficulty 2): $P(\hat p < c)$ or $P(\hat p > c)$ for a survey proportion (unemployment rate, support for a reform, satisfied customers, home ownership), using $\hat p \approx N(p, p(1-p)/n)$; distractors NO_SQUARE_ROOT, FORGOT_ONE_MINUS_P, WRONG_TAIL.
- `sample-size-for-precision` (difficulty 3): the smallest sample size for which the sample mean is within $d$ of $\mu$ with probability 90 %, 95 % or 99 %, $n = \lceil (z\sigma/d)^2 \rceil$ (spending, wages, rents, electricity use); distractors NOT_ROUNDED_UP, FORGOT_TO_SQUARE, FORGOT_Z.

## Real world
- Labour force surveys: statistics offices estimate the unemployment rate from a sample of households and publish how much it could move by chance; with $\operatorname{SE} = \sqrt{p(1-p)/n}$ a change of a tenth of a percentage point from one quarter to the next is often within sampling noise.
- Household budget surveys: the average spending on food, housing and transport that sets the weights of the consumer price index is a sample mean; its standard error, $\sigma/\sqrt{n}$, decides how many households the office must visit.
- Opinion polls and market research: a poll of 1000 people has a standard error of at most $\sqrt{0.25/1000} \approx 0.016$, which is where the familiar "plus or minus 3 points" comes from (made precise in ST203).
- Quality control: factories plot the mean weight of small samples of packets on a control chart with limits at $\mu \pm 3\sigma/\sqrt{n}$; a sample mean outside them is very unlikely by chance and signals that the machine needs adjusting.

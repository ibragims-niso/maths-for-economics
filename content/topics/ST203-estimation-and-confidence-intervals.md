---
id: ST203
title: Estimation and confidence intervals
block: ST2
coreYear: 2
prerequisites: [ST202]
estMinutes: 45
status: draft
economicUses:
  - Unemployment rate from a labour force survey, with its margin of error
  - Average household income from a household survey
  - Inflation expectations of households and forecasters
  - The margin of error of an opinion poll
  - Choosing the size of a survey for a target precision
searchTerms:
  - "Confidence interval"
generators: [ci-mean-known-sigma-limit, ci-proportion-limit, ci-mean-t-small-sample]
widgets: [confidence-interval-coverage]
mistakeCodes:
  FORGOT_ROOT_N:
    label: Used σ instead of σ/√n
    explanation: The interval is built from the spread of the sample mean, the standard error σ/√n, not from the spread σ of single observations. Without √n the interval is far too wide.
  DIVIDED_BY_N:
    label: Divided σ by n instead of by √n
    explanation: The variance of X̄ is σ²/n, so its standard deviation is σ/√n. Dividing σ by n makes the interval much too narrow.
  VARIANCE_NOT_SD:
    label: Used the variance σ² instead of σ
    explanation: When the question gives the variance σ², take its square root first. The margin of error is z·σ/√n with the standard deviation σ, which is in the same units as the data.
  ONE_TAIL_Z:
    label: Used the one-sided z value
    explanation: A 95 % interval leaves 2.5 % in each tail, so z = 1.96 (area 0.975 to its left), not 1.645 (area 0.95 to its left). Likewise 1.645 for 90 % and 2.576 for 99 %.
  FORGOT_ONE_MINUS_P:
    label: Left (1 − p̂) out of the standard error
    explanation: The standard error of a sample proportion is √(p̂(1 − p̂)/n). Writing √(p̂/n) drops the factor 1 − p̂ and makes the interval too wide.
  NO_SQUARE_ROOT:
    label: Forgot the square root in the standard error
    explanation: p̂(1 − p̂)/n is the variance of p̂, not its standard error. Take the square root; without it the margin of error is tiny and the interval almost collapses to p̂.
  N_SQUARED:
    label: Divided by n² inside the square root
    explanation: The variance of p̂ is p̂(1 − p̂)/n, with n and not n². Dividing by n² gives √(p̂(1 − p̂))/n, a margin of error far too small.
  USED_Z_NOT_T:
    label: Used z instead of t
    explanation: When σ is unknown and estimated by s from a small sample, the interval uses the t value with n − 1 degrees of freedom, which is larger than z. Using z makes the interval too narrow.
  SD_DIVISOR_N:
    label: Divided by n in the sample variance
    explanation: The sample variance is s² = Σ(x − x̄)²/(n − 1). Dividing by n underestimates the spread, especially in small samples.
  WRONG_DF:
    label: Took t with n degrees of freedom
    explanation: The t value for a mean has n − 1 degrees of freedom, because one is used up by estimating the mean. With 8 observations read the row for 7, not 8.
resources:
  - { title: "Introductory Statistics 2e, 8.1 A Single Population Mean using the Normal Distribution (OpenStax)", url: "https://openstax.org/books/introductory-statistics-2e/pages/8-1-a-single-population-mean-using-the-normal-distribution", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Introductory Statistics 2e, 8.2 A Single Population Mean using the Student t Distribution (OpenStax)", url: "https://openstax.org/books/introductory-statistics-2e/pages/8-2-a-single-population-mean-using-the-student-t-distribution", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Introductory Statistics 2e, 8.3 A Population Proportion (OpenStax)", url: "https://openstax.org/books/introductory-statistics-2e/pages/8-3-a-population-proportion", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
A statistics office announces that unemployment is 7.8 %. That figure comes from interviewing a sample of people, so the true rate for the whole labour force is almost certainly a little different. How different could it be? The office answers with a **confidence interval**, for example "between 6.4 % and 9.2 %", and the news reports a poll as "42 % plus or minus 3 points". The same tool turns a household survey into a range for average income, a panel of forecasters into a range for expected inflation, and a plan for a new survey into the number of people it must interview. Without it a sample figure is just a number; with it you know how much to trust it, and whether a change from last quarter could be sampling noise.

## Intuition
A sample mean is a **point estimate**: a single best guess for the unknown population mean. It is almost never exactly right, so we add a margin around it and report a range. Think of throwing a net instead of a spear: the spear (one number) almost always misses the fish by a little, the net (an interval) catches it most of the time.

How wide should the net be? ST202 showed that a sample mean lands within 1.96 standard errors of the true mean in 95 % of samples. Turn that round: in 95 % of samples, the true mean lies within 1.96 standard errors of the sample mean. So the interval "sample mean ± 1.96 standard errors" catches the true value for 95 % of all possible samples. That 95 % describes the **method**, not one particular interval: once the survey is done, the interval either contains the true value or it does not, and we cannot know which. A wider net (99 %) catches more often but says less; a bigger sample shrinks the net without losing any confidence.

## Definition and formulas
**Estimators.** A **parameter** is a fixed, unknown number about the population, such as the mean $\mu$, the proportion $p$ or the variance $\sigma^2$. An **estimator** is a rule that turns a sample into a guess for it, and the number it gives for a particular sample is an **estimate**. The usual point estimators are
$$\hat\mu = \bar x = \frac{1}{n}\sum_{i=1}^{n} x_i, \qquad \hat p = \frac{\text{number with the feature}}{n}, \qquad s^2 = \frac{1}{n-1}\sum_{i=1}^{n} (x_i - \bar x)^2 .$$

**Unbiased and efficient.** An estimator is **unbiased** if it is right on average over all possible samples: $E[\bar X] = \mu$ and $E[\hat p] = p$ (ST202), and $E[S^2] = \sigma^2$. The divisor $n - 1$ in $s^2$ is what makes it unbiased: the deviations are measured from $\bar x$, which is fitted to the same data, so they are a little smaller than deviations from the true $\mu$, and dividing by $n$ would underestimate $\sigma^2$ on average. Among unbiased estimators the **more efficient** one has the smaller standard error, so it lands closer to the truth in a typical sample. The mean of $n$ observations is more efficient than any single observation (standard error $\sigma/\sqrt{n}$ instead of $\sigma$), and for normal data it is also more efficient than the sample median, whose standard error in large samples is about 25 % larger.

**Confidence interval.** A 95 % confidence interval for $\mu$ is a range $[L, U]$ computed from the sample by a method for which $P(L < \mu < U) = 0.95$ **before** the sample is drawn. The probability is about the random interval, not about $\mu$, which is fixed. After the data are in, "95 % confidence" means: this interval was made by a method that covers the true value in 95 % of samples. It does not mean there is a 95 % probability that $\mu$ is in this particular interval.

**Mean, $\sigma$ known.** By ST202, $Z = \dfrac{\bar X - \mu}{\sigma/\sqrt{n}}$ is (approximately) standard normal, so $P(-1.96 < Z < 1.96) = 0.95$. Rearranging the two inequalities for $\mu$ gives
$$\bar x \pm z\,\frac{\sigma}{\sqrt{n}}, \qquad z = 1.645 \;(90\,\%),\quad 1.96 \;(95\,\%),\quad 2.576 \;(99\,\%).$$
Each $z$ leaves half of the missing percentage in each tail: for 95 %, 2.5 % on each side, so $\Phi(1.96) = 0.975$. It needs a normal population or a large sample (about $n \ge 30$).

**Mean, $\sigma$ unknown: the t distribution.** Usually $\sigma$ is unknown and the sample standard deviation $s$ stands in for it. That adds uncertainty, and for a normal population
$$T = \frac{\bar X - \mu}{S/\sqrt{n}}$$
follows **Student's t distribution with $n - 1$ degrees of freedom**: bell-shaped like $Z$ but with fatter tails. The interval becomes
$$\bar x \pm t_{n-1}\,\frac{s}{\sqrt{n}},$$
with $t_{n-1}$ read from a t table (you are never asked to compute it). A few two-sided values:
$$
\begin{array}{c|ccc}
\text{degrees of freedom} & 90\,\% & 95\,\% & 99\,\% \\ \hline
4 & 2.132 & 2.776 & 4.604 \\
5 & 2.015 & 2.571 & 4.032 \\
7 & 1.895 & 2.365 & 3.499 \\
9 & 1.833 & 2.262 & 3.250 \\
14 & 1.761 & 2.145 & 2.977 \\
19 & 1.729 & 2.093 & 2.861 \\
29 & 1.699 & 2.045 & 2.756 \\
\infty\ (z) & 1.645 & 1.960 & 2.576
\end{array}
$$
The t values fall towards $z$ as the sample grows; with more than about 30 observations the difference is small. For small samples the t interval assumes the population is roughly normal.

**Proportion.** With $\hat p$ the share in a sample of $n$, the standard error $\sqrt{p(1-p)/n}$ of ST202 is estimated with $\hat p$:
$$\hat p \pm z\,\sqrt{\frac{\hat p\,(1-\hat p)}{n}},$$
valid when the sample has at least about 10 "yes" and 10 "no" answers.

**Margin of error and width.** The part after $\pm$ is the **margin of error** $E$; the interval is $2E$ wide. For a mean $E = z\sigma/\sqrt{n}$, so the interval is
- wider for a higher confidence level (larger $z$): 99 % instead of 95 % makes it $2.576/1.96 \approx 1.31$ times as wide;
- narrower for a larger sample, but only like $1/\sqrt{n}$: four times the sample halves the width;
- wider when the data are more spread out (larger $\sigma$).

**Sample size for a target margin.** Solving $E = z\sigma/\sqrt{n}$ for $n$ and rounding up:
$$n \ge \left(\frac{z\sigma}{E}\right)^2 \quad\text{(mean)}, \qquad n \ge \frac{z^2\,p(1-p)}{E^2} \quad\text{(proportion)}.$$
For a proportion, use a planning guess for $p$, or $p = 0.5$, which gives the largest $p(1-p) = 0.25$ and so a sample that is large enough whatever $p$ is.

Whether a claimed value (say, an official unemployment target of 7 %) is consistent with the data is the question of hypothesis testing, ST204.

## Interactive
::widget{id="confidence-interval-coverage"}

Twenty surveys of household income are drawn from a region whose true mean income is $\mu = 1200$ with $\sigma = 400$ (the setting of Example 1). Each horizontal bar is one survey's interval $\bar x \pm z \cdot 400/\sqrt{n}$; the green dashed line is the true mean, and bars that miss it turn gold. Move the **Confidence level** slider (80 % to 99 %) and the **Sample size n** slider (16 to 400); the panel shows the $z$ value, the width $2z\sigma/\sqrt{n}$ of every bar and how many of the 20 bars cover $\mu$. Check: at the start values 95 % and $n = 64$ the panel shows $z = 1.96$, width 196 and 19 of 20; the one gold bar is survey 14, centred at 1308.3, whose interval 1210.3 to 1406.3 lies entirely above 1200. Raise the level to 99 %: the width becomes 257.6 and all 20 cover. Drop it to 80 %: $z = 1.282$ and 4 bars miss. Now set the level back to 95 % and move $n$ to 256: the width halves to 98, yet still exactly one survey misses. The sample size buys a shorter interval; only the confidence level decides how often the method misses.

## Worked examples

### Example 1 (easy): average household income
A statistics office surveys $n = 64$ randomly chosen households in a region and finds an average monthly income of $\bar x = 1150$. From the last census it knows that incomes have standard deviation $\sigma = 400$. Find a 95 % and a 99 % confidence interval for the region's mean income $\mu$.

1. $\operatorname{SE} = \dfrac{\sigma}{\sqrt{n}} = \dfrac{400}{\sqrt{64}} = \dfrac{400}{8} = 50$
   *Why:* the interval is built from the spread of the sample mean, not of single incomes; with 64 households the central limit theorem makes $\bar X$ close to normal.
2. $z = 1.96$, since $P(-1.96 < Z < 1.96) = 0.95$
   *Why:* a 95 % interval leaves 2.5 % in each tail of the normal curve.
3. $E = 1.96 \times 50 = 98$
   *Why:* the margin of error is $z$ standard errors.
4. 95 % interval: $1150 \pm 98$, that is $[1052,\ 1248]$
   *Why:* the method covers the true mean in 95 % of surveys; this particular interval either contains $\mu$ or not.
5. 99 % interval: $E = 2.576 \times 50 = 128.8$, so $[1021.2,\ 1278.8]$
   *Why:* more confidence needs a larger $z$; the interval is 257.6 wide instead of 196, about 1.31 times as wide.

```verify
Phi(t) = 0.5 * (1 + erf(t / sqrt(2)))
xbar = 1150; sigma = 400; n = 64
se = sigma / sqrt(n)
assert se == 50
assert abs((Phi(1.96) - Phi(-1.96)) - 0.95) < 0.0001
E95 = 1.96 * se
assert abs(E95 - 98) < 1e-9
assert abs((xbar - E95) - 1052) < 1e-9
assert abs((xbar + E95) - 1248) < 1e-9
assert abs((Phi(2.576) - Phi(-2.576)) - 0.99) < 0.0001
E99 = 2.576 * se
assert abs(E99 - 128.8) < 1e-9
assert abs((xbar - E99) - 1021.2) < 1e-9
assert abs((xbar + E99) - 1278.8) < 1e-9
assert abs(2 * E95 - 196) < 1e-9
assert abs(2 * E99 - 257.6) < 1e-9
assert abs(E99 / E95 - 1.31) < 0.005
```

### Example 2 (medium): the unemployment rate and its margin of error
A labour force survey interviews $n = 1500$ randomly chosen members of the labour force, and 117 of them are unemployed. Find a 95 % confidence interval for the unemployment rate $p$. How many people would the survey need for a margin of error of one percentage point?

1. $\hat p = \dfrac{117}{1500} = 0.078$; there are 117 "yes" and 1383 "no" answers
   *Why:* the sample proportion is the point estimate of $p$; both counts are far above 10, so $\hat p$ is close to normal.
2. $\operatorname{SE} = \sqrt{\dfrac{0.078 \times 0.922}{1500}} = 0.00692$
   *Why:* the true $p$ in $\sqrt{p(1-p)/n}$ is unknown, so the estimate $\hat p$ stands in for it.
3. $E = 1.96 \times 0.00692 = 0.0136$
   *Why:* 95 % confidence uses $z = 1.96$; the margin is about 1.4 percentage points.
4. $0.078 \pm 0.0136$, that is $[0.0644,\ 0.0916]$, or 6.4 % to 9.2 %
   *Why:* a published rate of 7.8 % is compatible with a true rate anywhere in this range; a change of a few tenths of a point from last quarter could easily be sampling noise.
5. $n \ge \dfrac{1.96^2 \times 0.078 \times 0.922}{0.01^2} = 2762.7$, so $n = 2763$
   *Why:* set $E = z\sqrt{p(1-p)/n}$ equal to 0.01, solve for $n$ with $\hat p$ as the planning value and round up. Without any planning value, $p = 0.5$ would give $n = 9604$.

```verify
x = 117; n = 1500
p = x / n
assert abs(p - 0.078) < 1e-12
assert n - x == 1383
se = sqrt(p * (1 - p) / n)
assert abs(se - 0.00692) < 0.000005
E = 1.96 * se
assert abs(E - 0.0136) < 0.00005
assert abs((p - E) - 0.0644) < 0.00005
assert abs((p + E) - 0.0916) < 0.00005
need = 1.96^2 * p * (1 - p) / 0.01^2
assert abs(need - 2762.7) < 0.05
assert ceil(need) == 2763
assert abs(1.96^2 * 0.25 / 0.01^2 - 9604) < 1e-6
```

### Example 3 (hard): inflation expectations from a small panel
Eight professional forecasters give their expected inflation rate for next year, in %:
$$4.2,\ 5.0,\ 3.8,\ 4.6,\ 5.4,\ 4.0,\ 4.8,\ 4.4.$$
Treating them as a random sample from a roughly normal population of forecasters, find a 95 % confidence interval for the mean expectation $\mu$. The two-sided 95 % value of $t$ with 7 degrees of freedom is 2.365.

1. $\bar x = \dfrac{36.2}{8} = 4.525$
   *Why:* the sample mean is the point estimate and the centre of the interval.
2. $\sum (x_i - \bar x)^2 = \sum x_i^2 - n\bar x^2 = 165.8 - 8 \times 4.525^2 = 1.995$
   *Why:* the shortcut form of the sum of squared deviations avoids eight subtractions.
3. $s^2 = \dfrac{1.995}{7} = 0.285, \qquad s = 0.5339$
   *Why:* $\sigma$ is unknown, so it is estimated by $s$, dividing by $n - 1 = 7$ to keep the estimate unbiased.
4. $\operatorname{SE} = \dfrac{0.5339}{\sqrt{8}} = 0.1887, \qquad E = 2.365 \times 0.1887 = 0.4464$
   *Why:* with $s$ in place of $\sigma$ the interval uses $t$ with $n - 1 = 7$ degrees of freedom, which is larger than $z = 1.96$ to allow for the extra uncertainty.
5. $4.525 \pm 0.4464$, that is $[4.08,\ 4.97]$ %
   *Why:* the forecasters' average expectation is estimated at about 4.5 %, give or take 0.45 points.
6. Check the shortcuts: $z = 1.96$ would give $E = 0.370$ and $[4.16,\ 4.89]$, and dividing by $n$ would give $s = 0.4994$
   *Why:* both shortcuts make the interval too narrow, so it would cover the true mean in fewer than 95 % of samples.

```verify
x = [4.2, 5.0, 3.8, 4.6, 5.4, 4.0, 4.8, 4.4]
n = 8
assert abs(sum(x) - 36.2) < 1e-9
xbar = mean(x)
assert abs(xbar - 4.525) < 1e-12
assert abs(sum(x .^ 2) - 165.8) < 1e-9
ss = sum(x .^ 2) - n * xbar^2
assert abs(ss - 1.995) < 1e-9
assert abs(sum((x - xbar) .^ 2) - ss) < 1e-9
assert abs(ss / (n - 1) - 0.285) < 1e-12
s = std(x)
assert abs(s - sqrt(0.285)) < 1e-12
assert abs(s - 0.5339) < 0.00005
se = s / sqrt(n)
assert abs(se - 0.1887) < 0.00005
E = 2.365 * se
assert abs(E - 0.4464) < 0.00005
assert abs((xbar - E) - 4.08) < 0.005
assert abs((xbar + E) - 4.97) < 0.005
# the two shortcuts
Ez = 1.96 * se
assert abs(Ez - 0.370) < 0.0005
assert abs((xbar - Ez) - 4.16) < 0.005
assert abs((xbar + Ez) - 4.89) < 0.005
assert abs(sqrt(ss / n) - 0.4994) < 0.00005
```

## Common mistakes
- Saying "there is a 95 % probability that $\mu$ lies in $[1052, 1248]$". The 95 % belongs to the method: 95 % of the intervals it produces cover $\mu$; any one interval either does or does not.
- Using $\sigma$ instead of the standard error $\sigma/\sqrt{n}$, which makes the interval far too wide (FORGOT_ROOT_N).
- Dividing $\sigma$ by $n$ instead of by $\sqrt{n}$ (DIVIDED_BY_N).
- Putting the variance $\sigma^2$ into the formula when the question gives the variance; take its square root first (VARIANCE_NOT_SD).
- Using 1.645 for a 95 % interval: that value leaves 5 % in one tail, but a two-sided interval needs 2.5 % in each, so $z = 1.96$ (ONE_TAIL_Z).
- Writing the standard error of a proportion as $\sqrt{\hat p/n}$, without $1 - \hat p$ (FORGOT_ONE_MINUS_P).
- Using $\hat p(1-\hat p)/n$ without the square root (NO_SQUARE_ROOT).
- Dividing by $n^2$ inside the square root, which gives $\sqrt{\hat p(1-\hat p)}/n$ (N_SQUARED).
- Using $z$ when $\sigma$ is unknown and the sample is small; the t value is larger (USED_Z_NOT_T).
- Dividing by $n$ instead of $n - 1$ when computing $s$ (SD_DIVISOR_N).
- Reading the t table with $n$ degrees of freedom instead of $n - 1$ (WRONG_DF).
- Thinking a larger sample makes a 95 % interval cover more often: it makes the interval shorter, while the coverage stays 95 %.
- Forgetting that the interval only covers sampling error: a survey that misses part of the population (no phone, no fixed address) or gets untruthful answers can be biased by more than its margin of error.

## Practice
- `ci-mean-known-sigma-limit` (difficulty 1): the lower or upper limit of a 90 %, 95 % or 99 % confidence interval $\bar x \pm z\sigma/\sqrt{n}$ for a mean with known $\sigma$ (household income, hourly wages, food spending, expected inflation), sometimes given the variance $\sigma^2$, to 2 decimal places; distractors FORGOT_ROOT_N, ONE_TAIL_Z, DIVIDED_BY_N, VARIANCE_NOT_SD.
- `ci-proportion-limit` (difficulty 2): the lower or upper limit of a confidence interval $\hat p \pm z\sqrt{\hat p(1-\hat p)/n}$ for a proportion (unemployment rate, poll support, households expecting faster price rises, firms planning to hire), to 4 decimal places; distractors FORGOT_ONE_MINUS_P, NO_SQUARE_ROOT, N_SQUARED, ONE_TAIL_Z.
- `ci-mean-t-small-sample` (difficulty 3): from 5 to 8 data values (inflation forecasts, rents, working hours, coffee prices), compute $\bar x$ and $s$ and give a limit of the t interval $\bar x \pm t_{n-1}s/\sqrt{n}$, with the t values for $n - 1$ and $n$ degrees of freedom provided; distractors USED_Z_NOT_T, SD_DIVISOR_N, WRONG_DF.

## Real world
- Labour force surveys: statistics offices publish the unemployment rate together with its margin of error or confidence interval, and warn that a quarterly change smaller than the margin may be sampling noise.
- Opinion polls: "plus or minus 3 points" for a poll of about 1000 people is the 95 % margin of error at $p = 0.5$: $1.96\sqrt{0.25/1000} = 0.031$. To halve it, a pollster needs four times as many interviews.
- Inflation expectations: central banks survey households and professional forecasters and report the average expectation; with a panel of only a few dozen forecasters, a t interval shows how much the average could move by chance.
- Survey design: before a household income or spending survey, the office chooses $n$ from $n \ge (z\sigma/E)^2$ so that the published average is precise enough, balancing the cost of each extra interview against the narrower interval.

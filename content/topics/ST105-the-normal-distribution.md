---
id: ST105
title: The normal distribution
block: ST1
coreYear: 1
prerequisites: [ST103]
estMinutes: 50
status: draft
economicUses:
  - Daily returns of shares, funds and exchange rates
  - "Value-at-risk: the loss a bank or fund exceeds on only 1 % or 5 % of days"
  - Measurement and forecast errors in economic data
  - "Stock planning: how much to hold so that demand is met on 95 % of days"
  - Exam scores and grade boundaries
generators: [normal-range-probability, normal-percentile-value, sum-of-independent-normals]
widgets: [normal-area-explorer]
mistakeCodes:
  VARIANCE_FOR_SD:
    label: Divided by the variance instead of the standard deviation
    explanation: In N(μ, σ²) the second number is the variance σ². A z-score divides by the standard deviation σ, its square root, so take √ first. For a sum of independent normals, add the variances and then take the square root.
  WRONG_TAIL:
    label: Took the wrong side of the curve
    explanation: Φ(z) is the area to the left of z, which is P(X < x). For P(X > x) use 1 − Φ(z); for the chance of landing inside an interval, not outside it, subtract the two left areas. A quick sketch of the bell curve with the shaded area shows which one you need.
  UPPER_ONLY:
    label: Forgot to subtract the lower area
    explanation: Φ(z_b) is the whole area to the left of b, including everything below a. P(a < X < b) = Φ(z_b) − Φ(z_a) removes the part below a.
  WRONG_SIGN_Z:
    label: Used z with the wrong sign
    explanation: A small percentage such as 5 % lies in the lower tail, below the mean, so its z is negative (z = −1.645). A large percentage such as 95 % lies above the mean and has a positive z. Check that your answer is on the correct side of μ.
  Z_NOT_SCALED:
    label: Added z without multiplying by σ
    explanation: z counts standard deviations, not units of the original variable. Turn it back with x = μ + zσ, multiplying z by the standard deviation before adding the mean.
  ADDED_SDS:
    label: Added the standard deviations
    explanation: For independent variables the variances add, Var(X + Y) = σ₁² + σ₂², not the standard deviations. The standard deviation of the sum is √(σ₁² + σ₂²), which is smaller than σ₁ + σ₂.
resources:
  - { title: "Introductory Statistics 2e, 5.1 Continuous Probability Functions (OpenStax)", url: "https://openstax.org/books/introductory-statistics-2e/pages/5-1-continuous-probability-functions", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Introductory Statistics 2e, 6.1 The Standard Normal Distribution (OpenStax)", url: "https://openstax.org/books/introductory-statistics-2e/pages/6-1-the-standard-normal-distribution", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Introductory Statistics 2e, 6.2 Using the Normal Distribution (OpenStax)", url: "https://openstax.org/books/introductory-statistics-2e/pages/6-2-using-the-normal-distribution", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
A bakery does not know how many loaves it will sell tomorrow, a fund manager does not know tomorrow's return, and a statistics office knows that every survey figure carries a measurement error. In all three cases the uncertain number tends to cluster around a typical value, with large deviations in either direction becoming rarer and rarer. The normal distribution is the standard model for this pattern. With it you can answer the questions that matter for decisions: how often will the bakery sell out if it bakes 470 loaves? What return will the fund fall below on only 5 % of days (its value-at-risk)? How much stock covers demand in 95 % of weeks? One table, or one calculator key, answers all of them.

## Intuition
For a variable that can take any value in a range, such as a return of 1.37 % or a weight of 499.6 grams, single values have no probability of their own: the chance of a return of exactly 1.370000…% is zero. Probability is instead spread out along the axis, and a **density curve** shows how thickly. The probability of landing between two values is the **area under the curve** between them, and the total area is 1.

The normal density is the familiar bell. Its peak sits at the mean $\mu$, it is symmetric, and its width is set by the standard deviation $\sigma$: a larger $\sigma$ gives a lower, wider bell (the area must stay 1). Every normal curve is the same shape stretched and shifted, so one table is enough: measure the distance from the mean in standard deviations, $z = (x - \mu)/\sigma$, and look up the area for that $z$. A value "1.4 standard deviations above the mean" has the same probability below it whether we talk about loaves, returns or exam marks.

## Definition and formulas
**Continuous random variables and densities.** A continuous random variable $X$ has a **probability density function** $f(x) \ge 0$ with total area 1 under its graph, and
$$P(a < X < b) = \int_a^b f(x)\,dx = \text{area under } f \text{ between } a \text{ and } b.$$
The integral is the area of C113; in this topic the areas come from a table or a calculator. Because $P(X = a) = 0$, it does not matter whether you write $<$ or $\le$. The **cumulative distribution function** (cdf) is $F(x) = P(X \le x)$, the area to the left of $x$. As for discrete variables in ST103, $E[X]$ is the mean and $\operatorname{Var}(X)$ the variance.

**The normal distribution.** $X \sim N(\mu, \sigma^2)$ has density
$$f(x) = \frac{1}{\sigma\sqrt{2\pi}}\, e^{-\frac{(x-\mu)^2}{2\sigma^2}}, \qquad -\infty < x < \infty,$$
with $E[X] = \mu$ and $\operatorname{Var}(X) = \sigma^2$. The second number in $N(\mu, \sigma^2)$ is the **variance**; the standard deviation is its square root. The curve is symmetric about $\mu$, has its peak $1/(\sigma\sqrt{2\pi})$ there, changes from concave to convex at $\mu \pm \sigma$, and its tails approach 0 without ever reaching it.

**The standard normal distribution.** $Z \sim N(0, 1)$, with cdf
$$\Phi(z) = P(Z \le z).$$
$\Phi$ has no formula in elementary functions, so it is read from a table or a calculator. By symmetry, $\Phi(0) = 0.5$ and $\Phi(-z) = 1 - \Phi(z)$. Some values:

$$
\begin{array}{c|ccccccccccc}
z & 0 & 0.5 & 1 & 1.28 & 1.5 & 1.645 & 1.96 & 2 & 2.33 & 2.5 & 3 \\ \hline
\Phi(z) & 0.5 & 0.6915 & 0.8413 & 0.8997 & 0.9332 & 0.9500 & 0.9750 & 0.9772 & 0.9901 & 0.9938 & 0.9987
\end{array}
$$

**Standardising.** If $X \sim N(\mu, \sigma^2)$, then $Z = \dfrac{X - \mu}{\sigma} \sim N(0, 1)$. So, with $z = (x - \mu)/\sigma$,
$$P(X < x) = \Phi(z), \qquad P(X > x) = 1 - \Phi(z), \qquad P(a < X < b) = \Phi\!\left(\tfrac{b - \mu}{\sigma}\right) - \Phi\!\left(\tfrac{a - \mu}{\sigma}\right).$$

**Percentiles (the inverse problem).** To find the value $x$ with $P(X < x) = p$, find $z$ with $\Phi(z) = p$ and undo the standardisation:
$$x = \mu + z\sigma.$$
The $z$ values used most often: $\Phi(z) = 0.90, 0.95, 0.975, 0.99$ at $z = 1.282, 1.645, 1.960, 2.326$; for $0.10, 0.05, 0.025, 0.01$ take the same numbers with a minus sign. The $p$ **value-at-risk** return of an investment is the return it falls below with probability $p$, for example the 5 % worst return.

**The 68–95–99.7 rule.** For any normal distribution,
$$P(|X - \mu| < \sigma) = 0.6827, \quad P(|X - \mu| < 2\sigma) = 0.9545, \quad P(|X - \mu| < 3\sigma) = 0.9973.$$
About 68 % of outcomes lie within one standard deviation of the mean, 95 % within two and 99.7 % within three. It gives a quick check on any table answer.

**Linear functions and sums.** If $X \sim N(\mu, \sigma^2)$ and $a, b$ are numbers, then
$$a + bX \sim N(a + b\mu,\; b^2\sigma^2).$$
If $X \sim N(\mu_1, \sigma_1^2)$ and $Y \sim N(\mu_2, \sigma_2^2)$ are **independent**, then
$$X + Y \sim N(\mu_1 + \mu_2,\; \sigma_1^2 + \sigma_2^2), \qquad X - Y \sim N(\mu_1 - \mu_2,\; \sigma_1^2 + \sigma_2^2).$$
Means add (or subtract), variances always add, and standard deviations do **not** add: with $\sigma_1 = 3$ and $\sigma_2 = 4$ the sum has $\sigma = \sqrt{9 + 16} = 5$, not 7.

**Normal approximation to the binomial.** A binomial count $X \sim \text{Bin}(n, p)$ (ST104) has mean $np$ and variance $np(1-p)$. When $np$ and $n(1-p)$ are both at least about 5, it is close to $N(np, np(1-p))$. Because $X$ only takes whole numbers, widen each value by half a unit (the **continuity correction**):
$$P(X \le k) \approx \Phi\!\left(\frac{k + 0.5 - np}{\sqrt{np(1-p)}}\right).$$
For 400 loans that each default with probability 0.1, independently, the mean is 40 and the standard deviation $\sqrt{36} = 6$, so $P(\text{at most 47 defaults}) \approx \Phi((47.5 - 40)/6) = \Phi(1.25) = 0.8944$; the exact binomial value is 0.8924, while skipping the correction gives $\Phi(7/6) = 0.8783$.

Why so many quantities are close to normal, sums and averages of many small independent effects, is the central limit theorem of ST202.

## Interactive
::widget{id="normal-area-explorer"}

The curve is the density of daily bread demand at the bakery of Example 1, $X \sim N(\mu, \sigma^2)$, and the shaded area to the left of the cut-off $x$ is $P(X < x)$. Move the three sliders for the mean $\mu$, the standard deviation $\sigma$ and the cut-off $x$; the panel shows $z = (x - \mu)/\sigma$, $P(X < x)$ and how far $x$ is from the mean in the language of the 68–95–99.7 rule. Check: at the start values $\mu = 400$, $\sigma = 50$, $x = 470$ the panel shows $z = 1.4$ and $P(X < x) = 0.9192$, so the bakery sells out on $1 - 0.9192 = 0.0808$ of days. Move $x$ to 450 (one $\sigma$ above the mean): 0.8413. Move it to 350: 0.1587; the difference, about 0.68, is the share within one standard deviation. Put $x$ back to 470 and lower $\sigma$ to 35: the bell becomes narrower and taller, $z = 2$ and the area rises to 0.9772. Finally set $x$ equal to $\mu$: the area is always 0.5, whatever $\sigma$ is.

## Worked examples

### Example 1 (easy): how often does the bakery sell out?
Daily demand for bread at a bakery is $X \sim N(400, 2{,}500)$ loaves. The bakery bakes 470 loaves a day. What is the probability that it sells out on a given day, and on about how many days a year (365 days) does that happen?

1. $\sigma = \sqrt{2{,}500} = 50$
   *Why:* the second number in $N(\mu, \sigma^2)$ is the variance; standardising needs its square root.
2. $z = \dfrac{470 - 400}{50} = 1.4$
   *Why:* 470 loaves is 1.4 standard deviations above the mean demand.
3. $P(X > 470) = 1 - \Phi(1.4) = 1 - 0.9192 = 0.0808$
   *Why:* the bakery sells out when demand is above 470; the table gives the area to the left, so subtract it from 1.
4. Check: 470 lies between $\mu + \sigma = 450$ and $\mu + 2\sigma = 500$, so the probability must lie between 2.5 % and 16 %. It does.
   *Why:* by the 68–95–99.7 rule, about 16 % of days are more than $1\sigma$ above the mean and about 2.5 % more than $2\sigma$ above it.
5. $365 \times 0.0808 \approx 29.5$, so about 29 or 30 days a year.
   *Why:* the probability is the long-run share of days on which demand exceeds the batch.

```verify
Phi(t) = 0.5 * (1 + erf(t / sqrt(2)))
mu = 400; v = 2500
s = sqrt(v)
assert s == 50
z = (470 - mu) / s
assert abs(z - 1.4) < 1e-12
assert abs(Phi(z) - 0.9192) < 0.00005
pOut = 1 - Phi(z)
assert abs(pOut - 0.0808) < 0.00005
# 68-95-99.7 check: 470 is between 1 and 2 standard deviations above the mean
assert mu + s < 470 and 470 < mu + 2*s
assert abs((1 - Phi(1)) - 0.1587) < 0.00005
assert abs((1 - Phi(2)) - 0.0228) < 0.00005
assert pOut > 0.025 and pOut < 0.16
assert abs(365 * pOut - 29.5) < 0.05
```

### Example 2 (medium): a band for a share's daily return
The daily return of a share, in per cent, is $R \sim N(0.1, 2.25)$. What is the probability that tomorrow's return is between $-2\%$ and $2.5\%$? An investor holds 10000 in the share, so her gain in money is $G = 100R$. What is the probability that her gain is between $-200$ and $250$?

1. $\sigma = \sqrt{2.25} = 1.5$
   *Why:* the variance is 2.25, so the standard deviation is its square root.
2. $z_a = \dfrac{-2 - 0.1}{1.5} = -1.4, \qquad z_b = \dfrac{2.5 - 0.1}{1.5} = 1.6$
   *Why:* standardise both ends of the interval.
3. $\Phi(1.6) = 0.9452, \qquad \Phi(-1.4) = 1 - \Phi(1.4) = 1 - 0.9192 = 0.0808$
   *Why:* a table with only positive $z$ still works: the area to the left of $-1.4$ equals the area to the right of $+1.4$ by symmetry.
4. $P(-2 < R < 2.5) = 0.9452 - 0.0808 = 0.8644$
   *Why:* the area to the left of 2.5 includes the area to the left of $-2$; subtracting it leaves the band. On the other 13.56 % of days the return lands outside it.
5. $G = 100R \sim N(100 \cdot 0.1,\; 100^2 \cdot 2.25) = N(10, 22{,}500)$, with standard deviation 150.
   *Why:* 1 % of 10000 is 100, so $G = 100R$; a linear function of a normal variable is normal, the mean is multiplied by 100 and the variance by $100^2$.
6. $\dfrac{-200 - 10}{150} = -1.4$ and $\dfrac{250 - 10}{150} = 1.6$, so $P(-200 < G < 250) = 0.8644$.
   *Why:* $-200 < G < 250$ is the same event as $-2 < R < 2.5$, so the z-values and the probability are the same.

```verify
Phi(t) = 0.5 * (1 + erf(t / sqrt(2)))
mu = 0.1; v = 2.25
s = sqrt(v)
assert abs(s - 1.5) < 1e-12
za = (-2 - mu) / s
zb = (2.5 - mu) / s
assert abs(za + 1.4) < 1e-12
assert abs(zb - 1.6) < 1e-12
assert abs(Phi(1.6) - 0.9452) < 0.00005
assert abs(Phi(-1.4) - 0.0808) < 0.00005
assert abs((1 - Phi(1.4)) - Phi(-1.4)) < 1e-12
p = Phi(zb) - Phi(za)
assert abs(p - 0.8644) < 0.00005
assert abs((0.9452 - 0.0808) - 0.8644) < 1e-12
assert abs((1 - p) - 0.1356) < 0.00005
# the gain in money G = 100 R
muG = 100 * mu
sG = sqrt(100^2 * v)
assert abs(muG - 10) < 1e-12
assert abs(sG - 150) < 1e-9
assert abs((-200 - muG) / sG - za) < 1e-12
assert abs((250 - muG) / sG - zb) < 1e-12
```

### Example 3 (hard): value-at-risk over one day and two days
An investment fund's daily return, in per cent, is $R \sim N(0.05, 1.44)$. Find the 5 % value-at-risk return, the return the fund falls below on only 5 % of days, and the matching loss on a holding of 200000. Then treat the two-day return as the sum of two independent daily returns and find the two-day 5 % value-at-risk.

1. $\sigma = \sqrt{1.44} = 1.2$
   *Why:* the second number in $N(\mu, \sigma^2)$ is the variance.
2. $\Phi(z) = 0.05 \Rightarrow z = -1.645$
   *Why:* $\Phi(1.645) = 0.95$, and by symmetry the area to the left of $-1.645$ is $1 - 0.95 = 0.05$. The worst 5 % of days lie below the mean, so $z$ is negative.
3. $r = \mu + z\sigma = 0.05 + (-1.645)(1.2) = -1.924\%$, about $-1.92\%$
   *Why:* solving $z = (r - \mu)/\sigma$ for $r$: start at the mean and move 1.645 standard deviations down.
4. Loss on 200000: $0.01924 \times 200{,}000 = 3{,}848$
   *Why:* a return of $-1.924\%$ on the holding loses 1.924 % of it; on 95 % of days the loss is smaller than this.
5. Two days: $R_1 + R_2 \sim N(0.05 + 0.05,\; 1.44 + 1.44) = N(0.1, 2.88)$, so $\sigma_2 = \sqrt{2.88} = 1.6971$
   *Why:* for independent normal variables the means add and the variances add; the standard deviation grows by $\sqrt{2}$, not by 2.
6. $r_2 = 0.1 + (-1.645)(1.6971) = -2.6917\%$, a loss of $0.026917 \times 200{,}000 = 5{,}383$ on the holding.
   *Why:* the same $z$ applies to the new normal distribution. The two-day loss is about 1.4 times the one-day loss, not twice it, because bad and good days partly cancel.

```verify
Phi(t) = 0.5 * (1 + erf(t / sqrt(2)))
mu = 0.05; v = 1.44
s = sqrt(v)
assert abs(s - 1.2) < 1e-12
z = -1.645
assert abs(Phi(z) - 0.05) < 0.0001
assert abs(Phi(1.645) - 0.95) < 0.0001
r = mu + z * s
assert abs(r - (-1.924)) < 1e-9
loss = -r / 100 * 200000
assert abs(loss - 3848) < 1e-6
# two days: means and variances add
mu2 = 2 * mu
v2 = 2 * v
s2 = sqrt(v2)
assert abs(mu2 - 0.1) < 1e-12
assert abs(v2 - 2.88) < 1e-12
assert abs(s2 - 1.6971) < 0.00005
r2 = mu2 + z * s2
assert abs(r2 - (-2.6917)) < 0.00005
loss2 = -r2 / 100 * 200000
assert abs(loss2 - 5383) < 0.5
assert abs(loss2 / loss - 1.399) < 0.001
```

## Common mistakes
- Dividing by the variance from $N(\mu, \sigma^2)$ instead of by its square root (VARIANCE_FOR_SD).
- Giving $\Phi(z)$ when the question asks for $P(X > x)$, or the outside of an interval when it asks for the inside (WRONG_TAIL).
- Answering $P(a < X < b)$ with $\Phi(z_b)$ alone, without subtracting $\Phi(z_a)$ (UPPER_ONLY).
- Using $z = +1.645$ for the 5 % worst outcome, which gives the 5 % best one instead (WRONG_SIGN_Z).
- Turning $z$ back into the original units with $\mu + z$ instead of $\mu + z\sigma$ (Z_NOT_SCALED).
- Adding standard deviations for a sum of independent variables instead of adding variances (ADDED_SDS).
- Reading the height of the density curve as a probability: only areas are probabilities, and $P(X = x) = 0$ for a continuous variable.
- Forgetting the continuity correction of $\pm 0.5$ when a normal curve approximates a count such as the number of defaults.
- Assuming every variable is normal: daily share returns have more extreme days than a normal curve predicts, so a normal value-at-risk tends to understate the risk of rare crashes.

## Practice
- `normal-range-probability` (difficulty 1): $P(X < x)$, $P(X > x)$ or $P(a < X < b)$ for bread demand, share returns, exam scores or packet weights, with $z$ on the 0.01 grid of a table, to 4 decimal places; distractors VARIANCE_FOR_SD, WRONG_TAIL, UPPER_ONLY.
- `normal-percentile-value` (difficulty 2): the value $x$ with $P(X < x) = p$ for $p$ = 1 %, 2.5 %, 5 %, 10 %, 90 %, 95 %, 97.5 % or 99 %: a value-at-risk return, a minimum bag weight, a distinction mark or a stock level, using $x = \mu + z\sigma$; distractors WRONG_SIGN_Z, VARIANCE_FOR_SD, Z_NOT_SCALED.
- `sum-of-independent-normals` (difficulty 3): a probability for the total of two independent normal quantities (demand in two regions, two project stages, two cost items, two branches' revenue); distractors ADDED_SDS, VARIANCE_FOR_SD, WRONG_TAIL.

## Real world
- Banking regulation and risk management: banks and funds report value-at-risk, the loss they expect to exceed on only 1 % or 5 % of days; the simplest version is exactly $\mu + z\sigma$ from Example 3, with care because real returns have fatter tails than the normal curve.
- Inventory and supply chains: firms choose a safety stock so that demand is met in, say, 95 % of periods; with normal demand the stock level is the mean plus 1.645 standard deviations, and pooling independent markets saves stock because variances, not standard deviations, add.
- Quality control and consumer protection: filling machines are set so that only a tiny share of packets falls below the weight printed on the label; the share below a limit is a normal tail probability.
- Official statistics and forecasting: survey estimates and economic forecasts are published with error bands such as "plus or minus two standard errors", which rely on the 95 % share within two standard deviations (built on in ST202 and ST203).

---
id: ST204
title: Hypothesis testing
block: ST2
coreYear: 2
prerequisites: [ST203]
estMinutes: 50
status: draft
economicUses:
  - Evaluating whether a policy has raised average wages or employment
  - Checking whether inflation has moved away from the central bank's target
  - Deciding whether a rise in the measured unemployment rate is real or sampling noise
  - Quality control of packet weights and faulty parts
  - Reading the t statistics and p-values in every regression table
generators: [hypothesis-test-statistic, z-test-p-value, z-test-power]
widgets: [hypothesis-test-explorer]
mistakeCodes:
  SD_NOT_SE:
    label: Used σ instead of the standard error σ/√n
    explanation: The test statistic measures the gap x̄ − μ₀ in standard errors of the sample mean, σ/√n, not in standard deviations of single observations. Dividing by σ makes the statistic far too small. For a proportion the standard error is √(p₀(1 − p₀)/n), not √(p₀(1 − p₀)).
  SIGN_REVERSED:
    label: Subtracted the wrong way round
    explanation: The statistic is (sample value − null value)/SE, so a sample mean above μ₀ gives a positive z. Writing μ₀ − x̄ flips the sign and sends you to the wrong tail.
  DIVIDED_BY_N:
    label: Divided σ by n instead of by √n
    explanation: The variance of x̄ is σ²/n, so its standard error is σ/√n. Dividing σ by n makes the standard error far too small and the statistic far too large.
  PHAT_IN_SE:
    label: Used p̂ instead of p₀ in the standard error
    explanation: A test works out how the sample would behave if H₀ were true, so the standard error of a proportion uses the null value, √(p₀(1 − p₀)/n). The sample proportion p̂ belongs in the standard error of a confidence interval, not of a test.
  ONE_TAIL_ONLY:
    label: Gave one tail for a two-sided test
    explanation: When H₁ is μ ≠ μ₀, results far out on either side count against H₀, so the p-value is the area in both tails, 2(1 − Φ(|z|)), twice the one-tail area.
  DOUBLED_ONE_SIDED:
    label: Doubled the tail for a one-sided test
    explanation: When H₁ points one way (μ > μ₀ or μ < μ₀), only results on that side count as extreme, so the p-value is the area in that one tail. Double it only for a two-sided H₁.
  WRONG_TAIL:
    label: Took the area on the wrong side of z
    explanation: Φ(z) is the area to the left of z. The p-value is the area beyond z in the direction of H₁; for z > 0 that is 1 − Φ(z), a small number when z is large. A quick sketch with the tail shaded shows which side you need.
  ONE_MINUS_P:
    label: Gave 1 − p instead of the p-value
    explanation: The p-value is the small tail area beyond the observed statistic, not the area inside it. A large result such as 0.95 is 1 − p and would wrongly suggest the data fit H₀ perfectly.
  BETA_NOT_POWER:
    label: Gave β instead of the power
    explanation: β is the chance of a type II error, failing to reject a false H₀. Power is 1 − β, the chance of correctly rejecting H₀ when the true mean is μ₁.
  TWO_SIDED_CRITICAL:
    label: Used the two-sided critical value in a one-sided test
    explanation: A one-sided test at level α puts all of α in one tail, so its critical value is z_α (1.645 at 5 %), not z_(α/2) (1.96). Using 1.96 makes the test reject less often and understates its power.
  Z_FOR_T:
    label: Used a z critical value when σ is unknown
    explanation: With σ replaced by the sample's s and a small sample, the statistic follows a t distribution with n − 1 degrees of freedom, whose critical values are larger than the normal ones (2.131 instead of 1.96 for 15 degrees of freedom at 5 % two-sided).
  ACCEPTED_H0:
    label: Concluded that H₀ is true
    explanation: Failing to reject H₀ only means the data are compatible with it; a small or noisy sample often cannot tell H₀ from nearby alternatives. Say "do not reject H₀", not "H₀ is true".
  P_IS_PROB_H0:
    label: Read the p-value as the probability that H₀ is true
    explanation: The p-value is worked out assuming H₀ is true; it is the chance of data at least this extreme under H₀, not the chance that H₀ holds. A p-value of 0.03 does not mean a 3 % chance that the policy had no effect.
resources:
  - { title: "Introductory Statistics 2e, 9.1 Null and Alternative Hypotheses (OpenStax)", url: "https://openstax.org/books/introductory-statistics-2e/pages/9-1-null-and-alternative-hypotheses", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Introductory Statistics 2e, 9.2 Outcomes and the Type I and Type II Errors (OpenStax)", url: "https://openstax.org/books/introductory-statistics-2e/pages/9-2-outcomes-and-the-type-i-and-type-ii-errors", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Introductory Statistics 2e, 9.4 Rare Events, the Sample, Decision and Conclusion (OpenStax)", url: "https://openstax.org/books/introductory-statistics-2e/pages/9-4-rare-events-the-sample-decision-and-conclusion", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
A government pays firms a training subsidy, and a year later a sample of workers in the sector earns 0.90 an hour more than the old average. Did the subsidy work, or would another sample of workers have shown a gap that large just by luck? A labour force survey puts unemployment at 11.2 % against 10 % last year: has unemployment really risen? The price of a basket of goods rose by 2.6 % on average across 16 shops while the central bank aims at 2 %: is inflation off target? Every sample figure carries sampling noise (ST202), so economists need a rule that says when a difference is too large to be noise. **Hypothesis testing** is that rule. It is how policy evaluations decide whether a programme had an effect, how statistics offices say whether a change is "statistically significant", how a factory decides whether to stop a machine, and it stands behind every t statistic and p-value in a regression table (ST205).

## Intuition
Start by assuming that nothing has changed: the subsidy had no effect, the unemployment rate is still 10 %, the machine is still set correctly. This is the **null hypothesis**. If it were true, the sampling distribution of ST202 tells us how far the sample figure would typically land from the old value: about one standard error, rarely more than two. Now look at the data. If the sample figure lies so far out that it would almost never happen under the null hypothesis, we conclude that the assumption is probably wrong and **reject** it. If the figure is the kind of thing that happens often by chance, we **do not reject** it: not because we have proved it, but because the data give no strong reason to doubt it.

How surprising the data are is measured by the **p-value**: the chance, if nothing had changed, of a result at least as far out as the one we saw. How surprising is "too surprising" is a line drawn in advance, the **significance level** $\alpha$, usually 5 %. Any such rule can go wrong in two ways: it can raise a false alarm (reject a true null hypothesis) or miss a real change (keep a false one). Making the first error rarer makes the second more common, and only more data reduce both.

## Definition and formulas
**Hypotheses.** The **null hypothesis** $H_0$ fixes the parameter at one value, for example $H_0: \mu = \mu_0$ (last year's mean, a target, a machine setting). The **alternative hypothesis** $H_1$ says what we are looking for, and it comes from the question, decided before looking at the data:
$$H_1: \mu > \mu_0 \quad\text{or}\quad H_1: \mu < \mu_0 \quad\text{(one-sided)}, \qquad H_1: \mu \neq \mu_0 \quad\text{(two-sided)}.$$
"Has the policy raised wages?" is one-sided; "has inflation moved away from target?" is two-sided. The same applies to a proportion, $H_0: p = p_0$.

**Test statistic.** The gap between the sample figure and the null value, measured in standard errors and computed **as if $H_0$ were true**:

- mean, $\sigma$ known (normal population, or $n \ge 30$ by the central limit theorem): $\;z = \dfrac{\bar x - \mu_0}{\sigma/\sqrt{n}} \sim N(0, 1)$ under $H_0$;
- mean, $\sigma$ unknown, roughly normal population: $\;t = \dfrac{\bar x - \mu_0}{s/\sqrt{n}} \sim t_{n-1}$ under $H_0$, the $t$ distribution with $n - 1$ degrees of freedom (ST203), where $s$ is the sample standard deviation;
- proportion, with $np_0$ and $n(1 - p_0)$ both at least 10: $\;z = \dfrac{\hat p - p_0}{\sqrt{p_0(1 - p_0)/n}} \approx N(0, 1)$ under $H_0$.

The proportion test uses $p_0$ in the standard error, because the test asks what would happen if $H_0$ were true; a confidence interval (ST203) uses $\hat p$ instead.

**Significance level, critical values, rejection region.** The significance level $\alpha$ is the chance we accept of rejecting $H_0$ when it is true. The **rejection region** is the set of values of the statistic that are at least that unlikely under $H_0$; its edge is the **critical value**. With $z_a$ the value that has area $a$ to its right ($1 - \Phi(z_a) = a$):
$$
\begin{array}{l|l|ccc}
H_1 & \text{reject } H_0 \text{ when} & \alpha = 10\,\% & \alpha = 5\,\% & \alpha = 1\,\% \\ \hline
\mu > \mu_0 & z \ge z_\alpha & 1.282 & 1.645 & 2.326 \\
\mu < \mu_0 & z \le -z_\alpha & -1.282 & -1.645 & -2.326 \\
\mu \neq \mu_0 & |z| \ge z_{\alpha/2} & 1.645 & 1.960 & 2.576
\end{array}
$$
A two-sided test splits $\alpha$ between the two tails, which is why its critical value is larger.

**Critical values of $t$.** $t_a$ has area $a$ to its right under the $t$ distribution with df degrees of freedom; use $t_\alpha$ for a one-sided test and $t_{\alpha/2}$ for a two-sided one:
$$
\begin{array}{c|cccc}
\text{df} & t_{0.05} & t_{0.025} & t_{0.01} & t_{0.005} \\ \hline
5 & 2.015 & 2.571 & 3.365 & 4.032 \\
10 & 1.812 & 2.228 & 2.764 & 3.169 \\
15 & 1.753 & 2.131 & 2.602 & 2.947 \\
20 & 1.725 & 2.086 & 2.528 & 2.845 \\
30 & 1.697 & 2.042 & 2.457 & 2.750 \\
\infty & 1.645 & 1.960 & 2.326 & 2.576
\end{array}
$$
The $t$ values are larger than the normal ones (last row) because $s$ is itself uncertain; as the sample grows they approach them.

**p-value.** The probability, computed assuming $H_0$ is true, of a test statistic at least as extreme as the observed one, in the direction of $H_1$:
$$p = 1 - \Phi(z) \;\;(H_1: \mu > \mu_0), \qquad p = \Phi(z) \;\;(H_1: \mu < \mu_0), \qquad p = 2\big(1 - \Phi(|z|)\big) \;\;(H_1: \mu \neq \mu_0).$$
**Reject $H_0$ when $p \le \alpha$**; this is exactly the same decision as "the statistic is in the rejection region", and the p-value says in addition how far inside or outside it the data fall. What a p-value is **not**: it is not the probability that $H_0$ is true, $1 - p$ is not the probability that $H_1$ is true, and a small $p$ does not mean a large or important effect.

**Two kinds of error and power.**

- **Type I error**: rejecting $H_0$ when it is true. Its probability is $\alpha$, chosen in advance.
- **Type II error**: not rejecting $H_0$ when it is false. Its probability is called $\beta$.
- **Power** $= 1 - \beta$: the probability of rejecting $H_0$ when it is false, which depends on how false it is.

For the one-sided $z$ test of $H_0: \mu = \mu_0$ against $H_1: \mu > \mu_0$, the test rejects when $\bar x \ge \mu_0 + z_\alpha \sigma/\sqrt{n}$. If the true mean is $\mu_1 > \mu_0$, then $\bar X \sim N(\mu_1, \sigma^2/n)$ and
$$\text{power}(\mu_1) = P\!\left(\bar X \ge \mu_0 + z_\alpha \tfrac{\sigma}{\sqrt n}\right) = \Phi\!\left(\frac{\mu_1 - \mu_0}{\sigma/\sqrt{n}} - z_\alpha\right).$$
(For $H_1: \mu < \mu_0$ use $\mu_0 - \mu_1$ in the same formula.) Power grows when the true effect is larger, when the sample is larger (the standard error shrinks) and when $\alpha$ is larger; the last one costs more type I errors. For the wage test of Example 1 ($\mu_0 = 15$, $\sigma = 4$, $n = 64$, $\alpha = 5\,\%$), the test rejects when $\bar x \ge 15 + 1.645 \times 0.5 = 15.8225$; if the subsidy really raised the mean wage to 16, the power is $\Phi(2 - 1.645) = \Phi(0.355) \approx 0.64$, so a real rise of 1 would be missed about 36 % of the time. With $n = 256$ workers the standard error halves to 0.25 and the power rises to $\Phi(4 - 1.645) \approx 0.99$.

**Tests and confidence intervals.** A two-sided test at level $\alpha$ rejects $H_0: \mu = \mu_0$ exactly when $\mu_0$ lies **outside** the $(1 - \alpha)$ confidence interval $\bar x \pm z_{\alpha/2}\,\sigma/\sqrt{n}$ (or $\bar x \pm t_{\alpha/2}\, s/\sqrt{n}$) of ST203: both say "$\bar x$ is more than $z_{\alpha/2}$ standard errors from $\mu_0$". The interval gives more: the whole range of values the data cannot rule out.

**Statistical and economic significance.** "Statistically significant" only means the data are hard to explain by sampling noise. With a huge sample a tiny, unimportant effect becomes significant; with a small sample a large, important one may not. Always report the size of the effect (an estimate and its interval) next to the test, and ask whether that size matters economically.

## Interactive
::widget{id="hypothesis-test-explorer"}

The bell curve is the distribution of the test statistic $z$ when $H_0$ is true. The gold area is the rejection region, whose total area is $\alpha$; the lilac area beyond the observed $z$ (in both tails when $H_1$ is two-sided) is the p-value. Move the **Significance level α** slider (1 % to 10 %), the **Observed z** slider and the **Sides of H₁** slider (1 for $H_1: \mu > \mu_0$, 2 for $H_1: \mu \neq \mu_0$); the panel shows the critical value, the p-value and the decision. Check: at the start values, the wage test of Example 1 ($\alpha = 5\,\%$, $z = 1.8$, one-sided), the panel shows a critical value of 1.645, a p-value of 0.0359 and "reject H₀". Set the sides to 2: the critical values move out to ±1.96, the p-value doubles to 0.0719 and the decision becomes "do not reject H₀". Now raise $\alpha$ to 10 %: the critical values come in to ±1.645 and $H_0$ is rejected again. Finally set $z = 2$, one-sided, $\alpha = 1\,\%$ (Example 2 at the 1 % level): the critical value is 2.326, the p-value 0.0228 and $H_0$ is not rejected.

## Worked examples

### Example 1 (easy): did a training subsidy raise wages?
Before a training subsidy, hourly wages in a sector had mean $\mu_0 = 15$ with standard deviation $\sigma = 4$, known from years of earlier surveys. After the subsidy, a random sample of $n = 64$ workers has a mean wage of $\bar x = 15.90$. Test at the 5 % level whether the subsidy raised the mean wage.

1. $H_0: \mu = 15, \qquad H_1: \mu > 15$
   *Why:* the question is whether wages went **up**, so the alternative is one-sided; it is fixed before looking at the data.
2. $\operatorname{SE} = \dfrac{\sigma}{\sqrt{n}} = \dfrac{4}{\sqrt{64}} = \dfrac{4}{8} = 0.5$
   *Why:* the sample mean of 64 workers varies much less than one worker's wage; its spread is $\sigma/\sqrt{n}$.
3. $z = \dfrac{15.90 - 15}{0.5} = 1.8$
   *Why:* the gap of 0.90 is 1.8 standard errors; with $n = 64$ the central limit theorem makes $z$ approximately $N(0, 1)$ if $H_0$ is true.
4. $z = 1.8 \ge z_{0.05} = 1.645$, so reject $H_0$ at the 5 % level
   *Why:* for $H_1: \mu > \mu_0$ the rejection region at 5 % is the right tail beyond 1.645, and 1.8 lies in it.
5. $p = 1 - \Phi(1.8) = 1 - 0.9641 = 0.0359 \le 0.05$
   *Why:* if the subsidy had done nothing, a sample mean this far above 15 would turn up in only about 3.6 % of samples. Had the question been "have wages **changed**?", the p-value would be $2 \times 0.0359 \approx 0.072 > 0.05$ and $H_0$ would not be rejected, which is why $H_1$ must be chosen from the question, not from the data.

```verify
Phi(t) = 0.5 * (1 + erf(t / sqrt(2)))
mu0 = 15; sigma = 4; n = 64; xbar = 15.9
se = sigma / sqrt(n)
assert se == 0.5
z = (xbar - mu0) / se
assert abs(z - 1.8) < 1e-12
# 1.645 is the 5 % one-sided critical value
assert abs((1 - Phi(1.645)) - 0.05) < 0.0001
assert z >= 1.645
assert abs(Phi(1.8) - 0.9641) < 0.00005
p = 1 - Phi(z)
assert abs(p - 0.0359) < 0.00005
assert abs(2 * 0.0359 - 0.072) < 0.0005
assert abs(2 * p - 0.0719) < 0.00005
# power quoted in Definition and formulas: true mean 16
cut = mu0 + 1.645 * se
assert abs(cut - 15.8225) < 1e-12
power = 1 - Phi((cut - 16) / se)
assert abs(power - Phi(2 - 1.645)) < 1e-12
assert abs(power - 0.6387) < 0.00005
assert abs((1 - power) - 0.36) < 0.005
# with n = 256 the standard error is 0.25
assert sigma / sqrt(256) == 0.25
assert abs(Phi((16 - 15) / 0.25 - 1.645) - 0.9907) < 0.00005
```

### Example 2 (medium): has the unemployment rate risen?
Last year the unemployment rate in a region was 10 %. This year a labour force survey of $n = 2500$ people finds 280 unemployed, $\hat p = 0.112$. Test at the 5 % level whether the unemployment rate has risen. Would the conclusion change at the 1 % level?

1. $H_0: p = 0.10, \qquad H_1: p > 0.10$
   *Why:* the question is whether unemployment **rose**, so the test is one-sided.
2. $np_0 = 250, \quad n(1 - p_0) = 2250; \qquad \operatorname{SE} = \sqrt{\dfrac{0.1 \times 0.9}{2500}} = 0.006$
   *Why:* both counts are far above 10, so $\hat p$ is approximately normal; the standard error uses $p_0 = 0.1$ because the test asks what would happen if the rate were still 10 %.
3. $z = \dfrac{0.112 - 0.10}{0.006} = 2$
   *Why:* the rise of 1.2 percentage points is two standard errors. Using $\hat p$ in the standard error, $\sqrt{0.112 \times 0.888/2500} = 0.0063$, would give 1.90 instead.
4. $p = 1 - \Phi(2) = 1 - 0.9772 = 0.0228 \le 0.05$: reject $H_0$ at the 5 % level
   *Why:* a survey rate this high would appear in only about 2.3 % of surveys if unemployment were still 10 %.
5. At 1 %: $p = 0.0228 > 0.01$, equivalently $z = 2 < z_{0.01} = 2.326$: do not reject
   *Why:* a stricter level demands stronger evidence. Reporting $p = 0.0228$ lets every reader apply their own $\alpha$, which is why p-values are reported rather than only "reject" or "do not reject".

```verify
Phi(t) = 0.5 * (1 + erf(t / sqrt(2)))
p0 = 0.1; n = 2500; x = 280
phat = x / n
assert abs(phat - 0.112) < 1e-12
assert abs(n * p0 - 250) < 1e-9
assert abs(n * (1 - p0) - 2250) < 1e-9
se = sqrt(p0 * (1 - p0) / n)
assert abs(se - 0.006) < 1e-12
z = (phat - p0) / se
assert abs(z - 2) < 1e-9
assert abs(Phi(2) - 0.9772) < 0.00005
p = 1 - Phi(z)
assert abs(p - 0.0228) < 0.00005
assert p <= 0.05
assert p > 0.01
# 2.326 is the 1 % one-sided critical value
assert abs((1 - Phi(2.326)) - 0.01) < 0.0001
assert z < 2.326
# the mistake of using phat in the standard error
sewrong = sqrt(phat * (1 - phat) / n)
assert abs(sewrong - 0.0063) < 0.00005
assert abs((phat - p0) / sewrong - 1.90) < 0.005
```

### Example 3 (hard): is inflation off target?
The central bank's inflation target is 2 %. A statistics office records the annual price change of the same basket of goods in $n = 16$ randomly chosen shops across the country: the mean is $\bar x = 2.6$ % and the sample standard deviation is $s = 1.0$; price changes across shops are roughly normal. Test at the 5 % level whether average inflation differs from the target, give the 95 % confidence interval, and compare with a survey of 2500 shops that finds $\bar x = 2.04$ with $s = 1.0$.

1. $H_0: \mu = 2, \qquad H_1: \mu \neq 2$
   *Why:* inflation above or below target both matter to a central bank, so the test is two-sided.
2. $\operatorname{SE} = \dfrac{s}{\sqrt{n}} = \dfrac{1.0}{4} = 0.25, \qquad t = \dfrac{2.6 - 2}{0.25} = 2.4$
   *Why:* $\sigma$ is unknown, so the sample's $s$ takes its place and the statistic follows a $t$ distribution with $n - 1 = 15$ degrees of freedom under $H_0$.
3. $|t| = 2.4 \ge t_{0.025} = 2.131$ (15 df): reject $H_0$ at the 5 % level
   *Why:* a two-sided test at 5 % puts 2.5 % in each tail, and the table gives 2.131 for 15 degrees of freedom. The normal 1.96 would be too small here, because with only 16 shops $s$ is itself quite uncertain.
4. $t_{0.025} = 2.131 < 2.4 < t_{0.01} = 2.602 \;\Rightarrow\; 0.02 < p < 0.05$ (a computer gives $p = 0.0298$)
   *Why:* one tail beyond 2.4 has area between 0.01 and 0.025, and a two-sided p-value counts both tails.
5. $95\,\%\text{ CI}: \; 2.6 \pm 2.131 \times 0.25 = 2.6 \pm 0.533 = (2.07,\ 3.13)$
   *Why:* the target 2 lies outside the interval, which is the same conclusion as the two-sided test at 5 %; the interval also shows that inflation is probably between about 0.07 and 1.13 points above target.
6. 2500 shops: $\operatorname{SE} = \dfrac{1.0}{50} = 0.02$, $t = \dfrac{2.04 - 2}{0.02} = 2.0$, $p \approx 2\,(1 - 0.9772) = 0.0456$
   *Why:* with 2499 degrees of freedom the $t$ distribution is practically normal. This result is statistically significant at 5 %, yet a gap of 0.04 points is far too small for any central bank to act on, while the 0.6 points of the small survey is a gap that matters: statistical significance is not economic significance.

```verify
Phi(t) = 0.5 * (1 + erf(t / sqrt(2)))
mu0 = 2; n = 16; xbar = 2.6; s = 1
se = s / sqrt(n)
assert se == 0.25
tstat = (xbar - mu0) / se
assert abs(tstat - 2.4) < 1e-12
# t density with v degrees of freedom; tail(c, v) = area to the right of c (trapezium rule)
g(x, v) = gamma((v + 1) / 2) / (sqrt(v * pi) * gamma(v / 2)) * (1 + x .^ 2 / v) .^ (-(v + 1) / 2)
tail(c, v) = 0.5 - (sum(g((0:4000) * c / 4000, v)) - (g(0, v) + g(c, v)) / 2) * c / 4000
# a table entry c is correct to 3 decimals if the area a is crossed between c - 0.0005 and c + 0.0005
ok(c, v, a) = tail(c - 0.0005, v) > a and tail(c + 0.0005, v) < a
assert ok(2.015, 5, 0.05) and ok(2.571, 5, 0.025) and ok(3.365, 5, 0.01) and ok(4.032, 5, 0.005)
assert ok(1.812, 10, 0.05) and ok(2.228, 10, 0.025) and ok(2.764, 10, 0.01) and ok(3.169, 10, 0.005)
assert ok(1.753, 15, 0.05) and ok(2.131, 15, 0.025) and ok(2.602, 15, 0.01) and ok(2.947, 15, 0.005)
assert ok(1.725, 20, 0.05) and ok(2.086, 20, 0.025) and ok(2.528, 20, 0.01) and ok(2.845, 20, 0.005)
assert ok(1.697, 30, 0.05) and ok(2.042, 30, 0.025) and ok(2.457, 30, 0.01) and ok(2.750, 30, 0.005)
okz(c, a) = 1 - Phi(c - 0.0005) > a and 1 - Phi(c + 0.0005) < a
assert okz(1.645, 0.05) and okz(1.960, 0.025) and okz(2.326, 0.01) and okz(2.576, 0.005)
assert okz(1.282, 0.10)
# decision and p-value of the 16-shop test
assert tstat >= 2.131 and tstat < 2.602
p = 2 * tail(tstat, 15)
assert abs(p - 0.0298) < 0.00005
# 95 % confidence interval
m = 2.131 * se
assert abs(m - 0.53275) < 1e-12
assert abs((xbar - m) - 2.06725) < 1e-9
assert abs((xbar + m) - 3.13275) < 1e-9
assert xbar - m > mu0
# 2500 shops
se2 = s / sqrt(2500)
assert abs(se2 - 0.02) < 1e-12
t2 = (2.04 - mu0) / se2
assert abs(t2 - 2) < 1e-9
assert abs(2 * (1 - 0.9772) - 0.0456) < 1e-12
assert abs(2 * (1 - Phi(2)) - 0.0455) < 0.00005
```

## Common mistakes
- Dividing the gap by $\sigma$, the spread of single observations, instead of the standard error $\sigma/\sqrt{n}$ (SD_NOT_SE).
- Writing $\mu_0 - \bar x$ on top, which flips the sign of $z$ and the tail you look in (SIGN_REVERSED).
- Using $\sigma/n$ as the standard error instead of $\sigma/\sqrt{n}$ (DIVIDED_BY_N).
- Putting $\hat p$ into the standard error of a proportion test; the test uses $p_0$ (PHAT_IN_SE).
- Giving one tail area as the p-value of a two-sided test (ONE_TAIL_ONLY).
- Doubling the tail area when $H_1$ is one-sided (DOUBLED_ONE_SIDED).
- Giving $\Phi(z)$, the area to the left, when the p-value is the area to the right of a positive $z$ (WRONG_TAIL).
- Reporting $1 - p$, a large number, as the p-value (ONE_MINUS_P).
- Giving $\beta$, the chance of missing a real effect, when the question asks for the power $1 - \beta$ (BETA_NOT_POWER).
- Using 1.96 as the critical value of a one-sided test at 5 %, or 1.645 in a two-sided one (TWO_SIDED_CRITICAL).
- Using normal critical values when $\sigma$ is replaced by $s$ in a small sample; use the $t$ table with $n - 1$ degrees of freedom (Z_FOR_T).
- Saying "$H_0$ is true" or "we accept $H_0$" after a test that does not reject it (ACCEPTED_H0).
- Reading $p = 0.03$ as "a 3 % chance that $H_0$ is true" (P_IS_PROB_H0).
- Choosing a one-sided $H_1$ after seeing which way the data point, which secretly doubles the type I error rate.
- Treating "statistically significant" as "large" or "important", or "not significant" as "no effect".

## Practice
- `hypothesis-test-statistic` (difficulty 1): the test statistic $z = (\bar x - \mu_0)/(\sigma/\sqrt n)$, $t = (\bar x - \mu_0)/(s/\sqrt n)$ or $z = (\hat p - p_0)/\sqrt{p_0(1-p_0)/n}$ for wages after a subsidy, packet weights, inflation against a target, household spending, unemployment, support for a reform, faulty parts or online shopping, to 2 decimal places; distractors SD_NOT_SE, SIGN_REVERSED, DIVIDED_BY_N, PHAT_IN_SE.
- `z-test-p-value` (difficulty 2): the p-value of a one- or two-sided $z$ test for a mean with $\sigma$ known or for a proportion, using the normal table, to 4 decimal places; distractors ONE_TAIL_ONLY, DOUBLED_ONE_SIDED, WRONG_TAIL, ONE_MINUS_P.
- `z-test-power` (difficulty 3): the power of a one-sided $z$ test for a mean at the 1 %, 5 % or 10 % level against a given true mean, $\Phi\big((\mu_1 - \mu_0)/(\sigma/\sqrt n) - z_\alpha\big)$, to 2 decimal places; distractors BETA_NOT_POWER, SD_NOT_SE, TWO_SIDED_CRITICAL.

## Real world
- Policy evaluation: studies of training programmes, minimum wages or cash transfers compare outcomes with and without the policy and report whether the difference is statistically significant; a programme "shows no significant effect" may simply have been evaluated on too small a sample, which is a question of power.
- Labour force surveys: statistics offices publish the unemployment rate with a note on whether the change since the last quarter is statistically significant, because a move of a few tenths of a percentage point is often within sampling noise.
- Quality control and auditing: a factory that checks samples of packets, or an auditor who checks a sample of invoices, is running repeated tests; a type I error stops a good machine or flags an honest firm, a type II error lets underfilled packets or errors through, and the choice of $\alpha$ trades one cost against the other.
- Regression tables: every coefficient in an econometric study comes with a $t$ statistic and a p-value testing whether it is zero (ST205, EM03). Running many tests and reporting only the significant ones produces false discoveries at the rate $\alpha$, which is why researchers now report effect sizes and confidence intervals alongside p-values.

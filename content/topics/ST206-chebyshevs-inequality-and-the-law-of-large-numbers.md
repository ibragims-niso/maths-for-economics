---
id: ST206
title: "Chebyshev's inequality and the law of large numbers"
block: ST2
coreYear: 2
prerequisites: [ST103]
estMinutes: 45
status: draft
economicUses:
  - "Insurance pooling: why an insurer can price thousands of policies"
  - Risk pooling in a bank's loan portfolio
  - Choosing the sample size of an opinion poll or household survey
  - Setting a bank's cash reserves when only the mean and spread are known
  - Why averages of many independent outcomes are stable
searchTerms:
  - "LLN"
  - "Law of large numbers"
generators: [chebyshev-interval-bound, sample-mean-chebyshev-bound, chebyshev-sample-size]
widgets: [chebyshev-pooling]
mistakeCodes:
  ONE_OVER_K:
    label: Used 1/k instead of 1/k²
    explanation: Chebyshev's bound is σ²/c² = 1/k², where k = c/σ is the distance in standard deviations. The square comes from the variance, which is an average of squared distances.
  WRONG_FORM:
    label: Used the other form of the inequality
    explanation: The chance of being far from the mean (|X − μ| ≥ c) is at most 1/k²; the chance of being close (|X − μ| < c) is at least 1 − 1/k². Read which event the question asks about before choosing the form.
  WIDTH_NOT_HALF:
    label: Took the whole width of the interval as c
    explanation: In Chebyshev's inequality c is the distance from the mean to either end of the interval, which is half its width. For the interval from 20 to 60 around a mean of 40, c = 20, not 40.
  NO_N:
    label: Used the variance of one draw for the average
    explanation: The average of n independent draws has variance σ²/n, not σ². Using σ² gives the bound for a single draw and misses the whole point of averaging.
  SD_NOT_VARIANCE:
    label: Used σ where the formula needs σ²
    explanation: Chebyshev's bound for an average is σ²/(nε²) with the variance σ² on top. If the question gives the standard deviation, square it first.
  EPS_NOT_SQUARED:
    label: Forgot to square ε
    explanation: The bound divides by ε², because Chebyshev compares the variance (squared units) with the squared distance. Dividing by ε alone mixes units and gives the wrong number.
  VAR_OVER_N_SQUARED:
    label: Divided the variance by n² instead of n
    explanation: The sum of n independent draws has variance nσ², and dividing the sum by n divides the variance by n², which leaves σ²/n. It is the variance of the sum that is divided by n², not σ².
  ROUNDED_DOWN:
    label: Rounded the sample size down
    explanation: The condition is n ≥ σ²/(αε²). If the right-hand side is not a whole number, round up; rounding down leaves the bound just above α.
  CONFIDENCE_NOT_ALPHA:
    label: Used the guarantee 1 − α in place of α
    explanation: The bound σ²/(nε²) is the allowed chance of missing, α. If the average must be within ε with probability at least 0.95, then α = 0.05, not 0.95.
resources:
  - { title: "Introductory Business Statistics 2e, 2.7 Measures of the Spread of the Data (OpenStax)", url: "https://openstax.org/books/introductory-business-statistics-2e/pages/2-7-measures-of-the-spread-of-the-data", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Introductory Statistics 2e, 7.3 Using the Central Limit Theorem (OpenStax)", url: "https://openstax.org/books/introductory-statistics-2e/pages/7-3-using-the-central-limit-theorem", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "MIT OpenCourseWare 18.05, Reading 6b: Central Limit Theorem and the Law of Large Numbers", url: "https://ocw.mit.edu/courses/18-05-introduction-to-probability-and-statistics-spring-2022/resources/mit18_05_s22_class06-prep-b_pdf/", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
One home insurance policy is a gamble: most years it costs the insurer nothing, and now and then it costs a fortune. Yet an insurer that sells ten thousand such policies can set its premiums with confidence. The reason is that the **average** claim per policy over many independent policies hardly moves from year to year. The same idea lets a bank keep only a fraction of its deposits as cash, lets a lender predict the default rate of a large loan book, and lets a polling firm say how many people it must ask. This topic gives two tools behind all of these: **Chebyshev's inequality**, which bounds the chance of a large deviation using only the mean and the standard deviation, and the **law of large numbers**, which says that averages settle down to the mean.

## Intuition
Start with a simple fact about averages. If the average monthly income in a town is 2000 and nobody earns a negative amount, then at most a fifth of the people can earn 10000 or more: if more did, they alone would push the average above 2000. That is **Markov's inequality**: a non-negative quantity cannot often be far above its mean.

**Chebyshev's inequality** applies the same reasoning to distances from the mean. The variance is the average squared distance from the mean (ST103). An outcome at least $k$ standard deviations away adds at least $k^2\sigma^2$ to that average, so such outcomes cannot have a total probability above $1/k^2$; otherwise the variance would be bigger than $\sigma^2$. This works for **every** distribution, which is its strength, but because it must cover the worst possible shape it is cautious: it promises at least 75 % within 2 standard deviations, while a normal distribution (ST105) has about 95 % there.

Now average many independent outcomes. Their ups and downs mostly cancel, so the average varies much less than a single outcome: its variance is $\sigma^2/n$. Feed that small variance into Chebyshev's inequality and the chance that the average is far from the mean shrinks towards 0 as $n$ grows. That is the **law of large numbers**, and it is what insurers, banks and pollsters rely on.

## Definition and formulas
**Markov's inequality.** If $X \ge 0$ and $a > 0$, then
$$P(X \ge a) \le \frac{E[X]}{a}.$$
Reason (for a discrete $X$): $E[X] = \sum_x x\,p(x) \ge \sum_{x \ge a} x\,p(x) \ge a \sum_{x \ge a} p(x) = a\,P(X \ge a)$. The first step drops terms that are not negative, which is where $X \ge 0$ is needed. It does not apply to profits or returns, which can be negative.

**Chebyshev's inequality.** Let $X$ have mean $\mu$ and standard deviation $\sigma > 0$. For any $c > 0$,
$$P(|X - \mu| \ge c) \le \frac{\sigma^2}{c^2}.$$
Reason: apply Markov to the non-negative variable $(X - \mu)^2$ with $a = c^2$; its mean is $\operatorname{Var}(X) = \sigma^2$, and $(X - \mu)^2 \ge c^2$ is the same event as $|X - \mu| \ge c$.

Writing the distance in standard deviations, $c = k\sigma$, gives the two common forms:
$$P(|X - \mu| \ge k\sigma) \le \frac{1}{k^2}, \qquad P(|X - \mu| < k\sigma) \ge 1 - \frac{1}{k^2}.$$
For $k \le 1$ the bound is at least 1 and says nothing. Chebyshev's guarantee against what a normal distribution (ST105) actually has:
- within $1.5\sigma$ of the mean: at least 55.6 %, against 86.6 % for a normal distribution;
- within $2\sigma$: at least 75 %, against 95.4 %;
- within $3\sigma$: at least 88.9 %, against 99.7 %.

Chebyshev holds for every distribution with that mean and variance, and some distribution reaches the bound exactly, so it cannot be improved without knowing more about the shape.

**The sample mean.** Let $X_1, \dots, X_n$ be independent draws from the same distribution with mean $\mu$ and variance $\sigma^2$ (claims on $n$ similar policies, answers of $n$ randomly chosen people). Their average is $\bar X = \frac{1}{n}(X_1 + \dots + X_n)$. By linearity, $E[\bar X] = \mu$. For independent variables the variances add (shown in ST201), so the sum has variance $n\sigma^2$, and dividing by $n$ divides the variance by $n^2$ (ST103):
$$E[\bar X] = \mu, \qquad \operatorname{Var}(\bar X) = \frac{\sigma^2}{n}, \qquad \sigma_{\bar X} = \frac{\sigma}{\sqrt n}.$$
Four times as many draws halve the standard deviation of the average.

**The weak law of large numbers.** Chebyshev's inequality for $\bar X$ gives, for every accuracy $\varepsilon > 0$,
$$P(|\bar X - \mu| \ge \varepsilon) \le \frac{\sigma^2}{n\,\varepsilon^2} \;\longrightarrow\; 0 \quad \text{as } n \to \infty.$$
However small the accuracy you demand, the chance that the average misses $\mu$ by that much becomes as small as you like once $n$ is large enough.

**How many draws are needed.** To make the chance of missing by $\varepsilon$ or more at most $\alpha$ (so the average is within $\varepsilon$ with probability at least $1 - \alpha$), ask for $\sigma^2/(n\varepsilon^2) \le \alpha$:
$$n \ge \frac{\sigma^2}{\alpha\,\varepsilon^2}, \quad \text{rounded up to a whole number.}$$
Halving $\varepsilon$ needs four times as many draws.

**Bernoulli's law of large numbers (frequencies).** Count an event as $X_i = 1$ if it happens on trial $i$ and $0$ if not, with $P(X_i = 1) = p$ (a Bernoulli trial, ST104). Then $\bar X = \hat p$ is the **relative frequency** of the event, with mean $p$ and variance $p(1-p)/n$, so
$$P(|\hat p - p| \ge \varepsilon) \le \frac{p(1-p)}{n\,\varepsilon^2} \le \frac{1}{4n\,\varepsilon^2},$$
because $p(1-p) = \tfrac14 - (p - \tfrac12)^2 \le \tfrac14$. The relative frequency of an event settles down to its probability. This is why a probability can be read as a long-run frequency: a default probability of 0.02 means that, in a very large book of independent loans, close to 2 % default.

The central limit theorem (ST202) goes further: it says the average is approximately normal, which gives much sharper answers than Chebyshev when $n$ is large.

## Interactive
::widget{id="chebyshev-pooling"}

An insurer sells $n$ independent policies; the claim on one policy has mean 300 and standard deviation 1500, and the premium is $300 + \varepsilon$. Move **Policies n** to change the size of the pool and **Margin ε per policy** to change the safety margin in the premium. The lilac curve is Chebyshev's bound $\sigma^2/(n\varepsilon^2)$ for the chance that the average claim misses 300 by $\varepsilon$ or more, the green dashed curve is the normal approximation, and the gold line marks 0.05. The panel shows $\operatorname{Var}(\bar X)$ with the standard deviation of $\bar X$, the Chebyshev bound and the normal approximation. Check: at the start ($n = 2500$, $\varepsilon = 60$, as in Example 2) the panel shows 900 | 30, a bound of 0.25 and a normal approximation of 0.0455. Move $n$ to 12,500: the bound falls to 0.05 and the filled dot reaches the gold line. Then set $n = 100$ and $\varepsilon = 20$: the bound is 56.25, which says nothing at all.

## Worked examples

### Example 1 (easy): cash at a bank branch
Total cash withdrawals at a bank branch in a day, in thousands, have mean 40 and standard deviation 10; nothing else is known about their distribution. Bound the chance that withdrawals reach 100, find the smallest share of days Chebyshev guarantees with withdrawals strictly between 20 and 60, and bound the chance that withdrawals reach 70, the cash the branch keeps.

1. $P(W \ge 100) \le \dfrac{E[W]}{100} = \dfrac{40}{100} = 0.4$
   *Why:* withdrawals cannot be negative, so Markov's inequality applies; it uses only the mean.
2. $k = \dfrac{60 - 40}{10} = 2$, so $P(20 < W < 60) \ge 1 - \dfrac{1}{2^2} = 0.75$
   *Why:* the interval is the mean plus or minus 2 standard deviations; the chance of falling outside is at most $1/k^2 = 0.25$.
3. $P(W \ge 70) \le P(|W - 40| \ge 30) \le \dfrac{10^2}{30^2} = \dfrac{1}{9} = 0.1111$
   *Why:* reaching 70 means being 30, that is 3 standard deviations, above the mean, which is one part of being at least 30 away on either side.
4. Markov for the same event: $P(W \ge 70) \le \dfrac{40}{70} = 0.5714$
   *Why:* knowing the spread as well as the mean gives a much sharper bound (0.1111 against 0.5714).
5. If $W$ were normal, $P(20 < W < 60)$ would be $0.9545$, not just at least $0.75$
   *Why:* Chebyshev's guarantee must hold for every possible shape, so it is cautious; at least 3 days in 4 are inside the range, whatever the distribution.

```verify
mu = 40; s = 10
markov100 = mu / 100
assert markov100 == 0.4
k = (60 - mu) / s
assert k == 2
inside = 1 - 1/k^2
assert inside == 0.75
k3 = (70 - mu) / s
assert k3 == 3
cheb70 = s^2 / (70 - mu)^2
assert abs(cheb70 - 1/9) < 1e-12
assert abs(cheb70 - 0.1111) < 0.00005
markov70 = mu / 70
assert abs(markov70 - 0.5714) < 0.00005
normal2 = erf(2 / sqrt(2))
assert abs(normal2 - 0.9545) < 0.00005
```

### Example 2 (medium): pooling insurance policies
The claim on one home insurance policy in a year has mean 300 and standard deviation 1500: most policies claim nothing and a few claim a lot. An insurer sells 2500 independent policies at a premium of 360. Find the mean, variance and standard deviation of the average claim per policy $\bar X$, bound the chance that $\bar X$ misses 300 by 60 or more, and find how many policies bring that bound down to 0.05.

1. $E[\bar X] = 300$, $\operatorname{Var}(\bar X) = \dfrac{1500^2}{2500} = 900$, $\sigma_{\bar X} = \sqrt{900} = 30$
   *Why:* averaging independent claims keeps the mean and divides the variance by $n$.
2. One policy on its own: $\dfrac{1500^2}{60^2} = 625$
   *Why:* for a single policy Chebyshev's bound is far above 1 and says nothing; one policy is too uncertain to price safely.
3. $P(|\bar X - 300| \ge 60) \le \dfrac{900}{60^2} = 0.25$
   *Why:* Chebyshev's inequality for $\bar X$, with its own small variance. A shortfall, $\bar X \ge 360$, is part of this event, so the premiums fail to cover the claims with probability at most 0.25.
4. $n \ge \dfrac{1500^2}{0.05 \times 60^2} = 12{,}500$
   *Why:* solve $\sigma^2/(n\varepsilon^2) \le 0.05$ for $n$; the quotient is a whole number, so 12,500 policies are enough.
5. For comparison, with $n = 2500$ the margin 60 is $60/30 = 2$ standard deviations of $\bar X$, and the normal approximation (ST202) gives $0.0455$
   *Why:* averages of many draws are close to normal, so the true chance is far below Chebyshev's 0.25; Chebyshev is the guarantee that needs no assumption about the shape of the claims.

```verify
mu = 300; s = 1500; n = 2500; eps = 60
v = s^2 / n
assert v == 900
assert sqrt(v) == 30
assert s^2 / eps^2 == 625
b = v / eps^2
assert b == 0.25
need = s^2 / (0.05 * eps^2)
assert abs(need - 12500) < 1e-6
assert abs(s^2 / (12500 * eps^2) - 0.05) < 1e-12
z = eps / sqrt(v)
assert z == 2
assert abs((1 - erf(z / sqrt(2))) - 0.0455) < 0.00005
```

### Example 3 (hard): how many people should a poll ask?
A polling firm wants the share $p$ of voters who support a new tax. It asks $n$ voters chosen at random and independently and reports the share $\hat p$ of yes answers. How large must $n$ be for Chebyshev's inequality to guarantee $|\hat p - p| < 0.03$ with probability at least 0.95, whatever $p$ is? How does this change if earlier polls show that $p$ is at most 0.2? Compare with the normal approximation.

1. $X_i \in \{0, 1\}$, $E[X_i] = p$, $\operatorname{Var}(X_i) = p(1-p)$, and $\hat p = \bar X$
   *Why:* each answer is a Bernoulli trial (ST104), and the share of yes answers is the average of the 0/1 answers.
2. $p(1-p) = \tfrac14 - \left(p - \tfrac12\right)^2 \le \tfrac14$
   *Why:* $p$ is unknown, so plan for the worst case; the variance of one answer is largest at $p = \tfrac12$.
3. $P(|\hat p - p| \ge 0.03) \le \dfrac{0.25}{n \times 0.03^2} \le 0.05 \iff n \ge \dfrac{0.25}{0.05 \times 0.0009} = 5555.56$, so $n = 5556$
   *Why:* Bernoulli's law of large numbers with $\alpha = 0.05$; round up, because 5555 people would leave the bound just above 0.05.
4. If $p \le 0.2$: $p(1-p) \le 0.2 \times 0.8 = 0.16$, so $n \ge \dfrac{0.16}{0.05 \times 0.0009} = 3555.56$ and $n = 3556$
   *Why:* $p(1-p)$ rises as $p$ goes from 0 to $\tfrac12$, so for $p \le 0.2$ it is at most its value at 0.2; a smaller variance means fewer interviews.
5. Normal approximation (ST202): $n \ge \dfrac{1.96^2 \times 0.25}{0.03^2} = 1067.11$, so about 1068 people
   *Why:* if $\hat p$ is close to normal, 95 % lies within 1.96 standard deviations. This is why real polls of about 1000 people quote a margin of 3 points; Chebyshev's 5556 is about five times as many, the price of assuming nothing about the shape.

```verify
eps = 0.03; a = 0.05
n1 = 0.25 / (a * eps^2)
assert abs(n1 - 5555.56) < 0.005
assert ceil(n1) == 5556
assert 0.25 / (5556 * eps^2) <= a
assert 0.25 / (5555 * eps^2) > a
# p(1 - p) is never above 1/4, and equals 1/4 - (p - 1/2)^2
pp = 0:0.01:1
assert abs(max(pp .* (1 - pp)) - 0.25) < 1e-12
assert max(abs(pp .* (1 - pp) - (0.25 - (pp - 0.5).^2))) < 1e-12
assert abs(0.2 * 0.8 - 0.16) < 1e-12
n2 = 0.16 / (a * eps^2)
assert abs(n2 - 3555.56) < 0.005
assert ceil(n2) == 3556
assert abs(erf(1.96 / sqrt(2)) - 0.95) < 0.0001
n3 = 1.96^2 * 0.25 / eps^2
assert abs(n3 - 1067.11) < 0.005
assert ceil(n3) == 1068
assert abs(5556 / 1068 - 5.2) < 0.1
```

## Common mistakes
- Using $1/k$ instead of $1/k^2$ for the chance of being $k$ standard deviations away (ONE_OVER_K).
- Giving $1 - 1/k^2$ when the question asks about being far from the mean, or $1/k^2$ when it asks about being close (WRONG_FORM).
- Taking the whole width of the interval as $c$: for the range 20 to 60 around a mean of 40, $c = 20$ (WIDTH_NOT_HALF).
- Using the variance $\sigma^2$ of one draw instead of $\sigma^2/n$ for the average (NO_N).
- Putting the standard deviation $\sigma$ where the formula needs the variance $\sigma^2$ (SD_NOT_VARIANCE).
- Dividing by $\varepsilon$ instead of $\varepsilon^2$ (EPS_NOT_SQUARED).
- Dividing $\sigma^2$ by $n^2$ instead of $n$ for the variance of the average (VAR_OVER_N_SQUARED).
- Rounding the required sample size down (ROUNDED_DOWN).
- Using the guarantee, such as 0.95, as $\alpha$ instead of the allowed chance of missing, 0.05 (CONFIDENCE_NOT_ALPHA).
- Reading the bound as the probability itself: Chebyshev's 0.25 means "at most 0.25", and the true probability is often much smaller.
- Applying Markov's inequality to a quantity that can be negative, such as profit or a return.
- Thinking the law of large numbers makes the total less risky: the standard deviation of the total claims, $\sqrt n\,\sigma$, grows with $n$; it is the claim per policy that becomes predictable.
- Believing the law of large numbers "corrects" past results (the gambler's fallacy): after a run of bad years the next year is just as risky; earlier deviations are diluted by many new draws, not cancelled.
- Forgetting independence: when risks move together (floods, recessions), $\operatorname{Var}(\bar X)$ does not fall like $\sigma^2/n$ and pooling fails.

## Practice
- `chebyshev-interval-bound` (difficulty 1): Chebyshev's upper bound for being outside, or lower bound for being strictly inside, an interval around the mean (withdrawals, sales, claims, wages), to 4 decimal places; distractors ONE_OVER_K, WRONG_FORM, WIDTH_NOT_HALF.
- `sample-mean-chebyshev-bound` (difficulty 2): the law of large numbers bound $\sigma^2/(n\varepsilon^2)$, or its complement, for the average of $n$ independent claims, loan losses or household spending; distractors NO_N, SD_NOT_VARIANCE, EPS_NOT_SQUARED, WRONG_FORM, VAR_OVER_N_SQUARED.
- `chebyshev-sample-size` (difficulty 3): the smallest $n$ with $\sigma^2/(n\varepsilon^2) \le \alpha$ for insurance pools, household surveys and opinion polls; distractors ROUNDED_DOWN, SD_NOT_VARIANCE, EPS_NOT_SQUARED, CONFIDENCE_NOT_ALPHA.

## Real world
- Insurance: pooling many independent risks makes the claim per policy predictable, so premiums can be set close to the expected claim plus a modest margin (Example 2). When risks are correlated, as with floods, earthquakes or pandemics, pooling stops working, which is why insurers buy reinsurance and issue catastrophe bonds.
- Banking: a bank keeps only part of its deposits as cash because the withdrawals of many independent depositors average out (Example 1 is the single-branch version). A bank run is exactly the case where depositors stop acting independently. In the same way, a lender with thousands of independent borrowers can predict its default rate far better than any single default (ST104).
- Polls and official statistics: labour force surveys, household budget surveys and opinion polls rely on the law of large numbers for their averages and shares to be close to the population values. Chebyshev gives a safe sample size that assumes nothing about the distribution (Example 3); in practice statisticians use the sharper normal approximation (ST202).
- Simulation: Monte Carlo methods (NM03) estimate a risk or a price by averaging many random draws; the law of large numbers is why they work, and $\sigma^2/(n\varepsilon^2)$ tells you how many draws a given accuracy needs.

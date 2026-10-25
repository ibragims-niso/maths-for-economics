---
id: ST104
title: Binomial and Poisson distributions
block: ST1
coreYear: 1
prerequisites: [ST103]
estMinutes: 45
status: draft
economicUses:
  - Counting loan defaults in a bank's portfolio
  - Quality control of defective items
  - Customers arriving at a bank branch or shop per hour
  - Insurance claims per month and the reserves held for them
  - Staffing a call centre for a random number of calls
searchTerms:
  - "Binomial distribution"
  - "Poisson distribution"
generators: [binomial-count-probability, poisson-arrivals-probability, poisson-approximation-defaults]
widgets: [binomial-poisson-bars]
mistakeCodes:
  NO_COMBINATION:
    label: Forgot the factor C(n, k)
    explanation: p^k(1 − p)^(n − k) is the probability of one particular order of k successes and n − k failures. There are C(n, k) such orders, all equally likely, so multiply by C(n, k).
  SWAPPED_P:
    label: Swapped p and 1 − p
    explanation: The power k goes with the probability of the outcome you are counting. If you count defaults, use p = P(default) to the power k and 1 − p to the power n − k, not the other way round.
  BOUNDARY:
    label: Wrong end point in a cumulative probability
    explanation: For counts, "at most k" means X ≤ k and includes k, "fewer than k" means X ≤ k − 1, "at least k" means X ≥ k and "more than k" means X ≥ k + 1. Write the event with ≤ or ≥ before you add terms.
  EXACT_ONLY:
    label: Gave a single term instead of a sum
    explanation: Events such as "at most k", "at least one" and "more than k" cover several counts. Add P(X = j) over every count j in the event (or use the complement), not just one term.
  NOT_COMPLEMENT:
    label: Forgot to subtract from 1
    explanation: When you use the complement, the sum you work out is the probability of the outcomes you do NOT want. The answer is 1 minus that sum.
  RATE_NOT_SCALED:
    label: Did not rescale λ to the interval
    explanation: The Poisson mean must be for the interval in the question. If the rate is 12 per hour and the question is about 20 minutes, λ = 12 × 20/60 = 4, not 12.
  NO_EXP:
    label: Forgot the factor e^(−λ)
    explanation: The Poisson formula is e^(−λ)·λ^k/k!. Without e^(−λ) the "probability" is often bigger than 1, which is a sure sign that something is missing.
  NO_FACTORIAL:
    label: Forgot to divide by k!
    explanation: The Poisson formula divides by k! = 1·2·…·k. Leaving it out makes the answer too large, often larger than 1.
resources:
  - { title: "Introductory Statistics 2e, 4.3 Binomial Distribution (OpenStax)", url: "https://openstax.org/books/introductory-statistics-2e/pages/4-3-binomial-distribution", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Introductory Statistics 2e, 4.6 Poisson Distribution (OpenStax)", url: "https://openstax.org/books/introductory-statistics-2e/pages/4-6-poisson-distribution", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "MIT OpenCourseWare 18.05 Introduction to Probability and Statistics", url: "https://ocw.mit.edu/courses/18-05-introduction-to-probability-and-statistics-spring-2022/", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
A bank holds 500 consumer loans. The expected number of defaults next year is easy to work out, but the risk manager needs more: how likely is it that *more than* 4 loans default, and how much capital covers the losses in 95 % of years? A bank branch faces the same kind of question every morning: customers arrive at random, about 12 an hour, so how many tellers should be on duty? Both questions are about **counts of random events**, and two distributions cover most of them. The **binomial** distribution counts successes in a fixed number of independent yes/no trials; the **Poisson** distribution counts events that happen at a steady average rate in an interval of time or space.

## Intuition
A **Bernoulli trial** is one experiment with two outcomes: "success" with probability $p$ and "failure" with probability $1 - p$. "Success" just means the outcome you are counting, so a loan default or a faulty bulb is a "success" here. Repeat the trial $n$ times, independently, and count the successes: that count is binomial. Any one particular order of $k$ successes and $n - k$ failures, such as "the first two loans default, the other six repay", has probability $p^k(1-p)^{n-k}$. Which loans default does not matter for the count, so we multiply by the number of orders, $\binom{n}{k}$, from ST102.

Now count customers arriving in an hour. Cut the hour into 3600 seconds. In each second a customer arrives with a tiny probability, independently of other seconds, so the count is binomial with a huge $n$ and a tiny $p$, while the mean $np$ stays at the arrival rate. As the pieces get smaller, this binomial settles down to the **Poisson** distribution. That is why the Poisson describes arrivals, claims and flaws, and also why it approximates the binomial whenever $n$ is large and $p$ small. A longer interval means proportionally more events on average: twice as long, twice the mean.

## Definition and formulas
**Bernoulli trial.** $X = 1$ (success) with probability $p$ and $X = 0$ (failure) with probability $1 - p$. Then $E[X] = p$ and $\operatorname{Var}(X) = E[X^2] - (E[X])^2 = p - p^2 = p(1 - p)$.

**Binomial distribution.** Suppose that
1. there is a fixed number $n$ of trials;
2. each trial has two outcomes, success or failure;
3. the success probability $p$ is the same in every trial;
4. the trials are independent.

Then the number of successes $X$ has the binomial distribution $X \sim B(n, p)$:
$$P(X = k) = \binom{n}{k}\,p^k\,(1-p)^{n-k}, \qquad k = 0, 1, \dots, n.$$
$X$ is the sum of $n$ Bernoulli trials, so by linearity of expectation (ST103) $E[X] = np$. For independent trials the variances add as well (proved in ST201), which gives
$$E[X] = np, \qquad \operatorname{Var}(X) = np(1-p), \qquad \sigma_X = \sqrt{np(1-p)}.$$

**Cumulative probabilities.** For a count, the words decide which end point is included:
- at most $k$: $P(X \le k) = \sum_{j=0}^{k} P(X = j)$;
- fewer than $k$: $P(X < k) = P(X \le k - 1)$;
- at least $k$: $P(X \ge k) = 1 - P(X \le k - 1)$;
- more than $k$: $P(X > k) = 1 - P(X \le k)$.

Use the **complement** whenever it has fewer terms: "at least one" is $1 - P(X = 0)$.

**Poisson distribution.** Let $X$ count events in an interval of time (or length, or area) when the events happen one at a time, independently, at a steady average rate. If the mean count in the interval is $\lambda > 0$, then $X \sim \text{Poisson}(\lambda)$:
$$P(X = k) = \frac{e^{-\lambda}\,\lambda^{k}}{k!}, \qquad k = 0, 1, 2, \dots$$
There is no upper limit on $k$. The probabilities add up to 1 because $\sum_k \lambda^k/k! = e^{\lambda}$ (the power series of C117). The mean and the variance are equal:
$$E[X] = \operatorname{Var}(X) = \lambda, \qquad \sigma_X = \sqrt{\lambda}.$$
Two handy facts: $P(X = 0) = e^{-\lambda}$, so $P(X \ge 1) = 1 - e^{-\lambda}$; and each term follows from the one before, $P(X = k) = P(X = k - 1)\cdot\lambda/k$.

**Scaling with the interval.** If events occur at an average rate $r$ per unit (per hour, per month, per 100 metres) and the interval has length $t$ in those units, then
$$\lambda = r\,t.$$
12 customers per hour gives $\lambda = 12 \cdot \tfrac{20}{60} = 4$ for a 20-minute period.

**Poisson approximation to the binomial.** If $n$ is large and $p$ is small,
$$B(n, p) \approx \text{Poisson}(\lambda), \qquad \lambda = np.$$
A common rule of thumb is $n \ge 20$ and $p \le 0.05$. The means agree exactly, and the variances $np(1-p)$ and $np$ are close because $1 - p \approx 1$. To see where it comes from, put $p = \lambda/n$:
$$\binom{n}{k}p^k(1-p)^{n-k} = \frac{n(n-1)\cdots(n-k+1)}{n^k}\cdot\frac{\lambda^k}{k!}\cdot\left(1 - \frac{\lambda}{n}\right)^{n}\left(1 - \frac{\lambda}{n}\right)^{-k}.$$
As $n \to \infty$ the first and last factors tend to 1, and $(1 - \lambda/n)^n \to e^{-\lambda}$ (the same limit as continuous compounding in FM02), which leaves $e^{-\lambda}\lambda^k/k!$.

**Which one to use.**
- A fixed number $n$ of independent yes/no cases with the same $p$ (loans, items in a box, sales calls): $B(n, p)$.
- Events in an interval of time or space with no fixed maximum (arrivals, claims, calls, flaws): $\text{Poisson}(\lambda)$ with $\lambda = r\,t$.
- A binomial with large $n$ and small $p$, where the exact sums are long: $\text{Poisson}(np)$ as an approximation.

## Interactive
::widget{id="binomial-poisson-bars"}

The lilac bars are the binomial probabilities $P(X = k)$ for $B(n, p)$, and the green marks the Poisson probabilities with the same mean $\lambda = np$. Use the two sliders to change the number of trials $n$ and the probability $p$; the panel shows the mean, the two variances and $P(X = k)$ at the mean rounded to a whole number, binomial first. Check: at the start, $n = 8$ and $p = 0.1$ as in Example 1, the panel shows mean 0.8, variances 0.72 | 0.8 and $P(X = 1) = 0.3826$ | 0.3595, and the marks sit visibly off the bars. Now raise $n$ to 100 and lower $p$ to 0.03: the mean is 3, the variances are 2.91 | 3, $P(X = 3)$ is 0.2275 | 0.224, and bars and marks almost coincide. Finally keep $n = 100$ and move $p$ up to 0.5: the variances are 25 | 50, so the Poisson marks spread far wider than the bars. The approximation needs a small $p$.

## Worked examples

### Example 1 (easy): defaults in a small loan book
A bank has made 8 small business loans. Each defaults with probability 0.1, independently of the others. Find the probability that exactly 2 loans default, that at most 1 defaults and that at least 1 defaults, and the mean and standard deviation of the number of defaults.

1. $X \sim B(8,\ 0.1)$, where $X$ is the number of defaults
   *Why:* there are 8 independent loans, each with the same default probability, and we count the defaults.
2. $P(X = 2) = \binom{8}{2}(0.1)^2(0.9)^6 = 28 \times 0.01 \times 0.531441 = 0.1488$
   *Why:* any 2 of the 8 loans can be the defaulters (28 ways), and each such order has probability $0.1^2 \cdot 0.9^6$.
3. $P(X \le 1) = (0.9)^8 + \binom{8}{1}(0.1)(0.9)^7 = 0.4305 + 0.3826 = 0.8131$
   *Why:* "at most 1" means 0 or 1 defaults; the two events cannot happen together, so their probabilities add.
4. $P(X \ge 1) = 1 - P(X = 0) = 1 - 0.4305 = 0.5695$
   *Why:* "at least 1" is everything except "none", which is one term instead of eight.
5. $E[X] = 8 \times 0.1 = 0.8$, $\operatorname{Var}(X) = 8 \times 0.1 \times 0.9 = 0.72$, $\sigma_X = \sqrt{0.72} = 0.85$
   *Why:* the binomial formulas $np$ and $np(1-p)$; on average less than one loan defaults, yet more often than not at least one does.

```verify
n = 8; p = 0.1
p2 = combinations(n, 2) * p^2 * (1 - p)^(n - 2)
assert combinations(8, 2) == 28
assert abs((1 - p)^6 - 0.531441) < 1e-12
assert abs(p2 - 0.1488) < 0.00005
p0 = (1 - p)^n
p1 = combinations(n, 1) * p * (1 - p)^(n - 1)
assert abs(p0 - 0.4305) < 0.00005
assert abs(p1 - 0.3826) < 0.00005
assert abs(p0 + p1 - 0.8131) < 0.00005
assert abs(1 - p0 - 0.5695) < 0.00005
# all nine probabilities add up to 1, and the mean and variance from the pmf match np and np(1 - p)
k = 0:8
b(j) = combinations(8, j) * p^j * (1 - p)^(8 - j)
pmf = map(k, b)
assert abs(sum(pmf) - 1) < 1e-12
assert abs(sum(k .* pmf) - 0.8) < 1e-12
assert abs(sum((k - 0.8).^2 .* pmf) - 0.72) < 1e-12
assert abs(sqrt(0.72) - 0.85) < 0.005
```

### Example 2 (medium): customers at a bank branch
Customers arrive at a bank branch at random, on average 12 per hour, and the number of arrivals in any period follows a Poisson distribution. Find the probability that exactly 4 customers arrive in a 20-minute period, and that at least one arrives in a 5-minute period. One teller can serve at most 6 customers in 20 minutes: how likely is it that more than 6 arrive?

1. $\lambda = 12 \times \tfrac{20}{60} = 4$ for 20 minutes
   *Why:* the mean count is proportional to the length of the interval, and 20 minutes is a third of an hour.
2. $P(X = 4) = \dfrac{e^{-4}\,4^4}{4!} = \dfrac{0.018316 \times 256}{24} = 0.1954$
   *Why:* the Poisson formula with $\lambda = 4$ and $k = 4$.
3. For 5 minutes $\lambda = 12 \times \tfrac{5}{60} = 1$, so $P(X \ge 1) = 1 - e^{-1} = 1 - 0.3679 = 0.6321$
   *Why:* rescale the rate again for the new interval, then use the complement of "nobody arrives".
4. $P(X \le 6) = e^{-4}\left(1 + 4 + \tfrac{4^2}{2!} + \tfrac{4^3}{3!} + \tfrac{4^4}{4!} + \tfrac{4^5}{5!} + \tfrac{4^6}{6!}\right) = 0.018316 \times 48.5556 = 0.8893$
   *Why:* "at most 6" adds the terms for 0 to 6; each one has the factor $e^{-4}$, so it goes outside the bracket.
5. $P(X > 6) = 1 - 0.8893 = 0.1107$
   *Why:* complement. In about one 20-minute period in nine, one teller is not enough, even though the mean is only 4 (with standard deviation $\sqrt{4} = 2$).

```verify
rate = 12
lam = rate * 20/60
assert abs(lam - 4) < 1e-12
assert abs(exp(-4) - 0.018316) < 0.0000005
p4 = exp(-lam) * lam^4 / factorial(4)
assert abs(p4 - 0.1954) < 0.00005
lam5 = rate * 5/60
assert abs(lam5 - 1) < 1e-12
assert abs(exp(-1) - 0.3679) < 0.00005
assert abs(1 - exp(-lam5) - 0.6321) < 0.00005
k = 0:6
bracket = sum(lam.^k ./ factorial(k))
assert abs(bracket - 48.5556) < 0.00005
cdf6 = exp(-lam) * bracket
assert abs(cdf6 - 0.8893) < 0.00005
assert abs(1 - cdf6 - 0.1107) < 0.00005
# second route: build the terms by P(k) = P(k - 1) * lam / k
t0 = exp(-4); t1 = t0*4/1; t2 = t1*4/2; t3 = t2*4/3; t4 = t3*4/4; t5 = t4*4/5; t6 = t5*4/6
assert abs(t0 + t1 + t2 + t3 + t4 + t5 + t6 - cdf6) < 1e-12
assert abs(t4 - p4) < 1e-12
assert sqrt(lam) == 2
```

### Example 3 (hard): a loan portfolio and its capital
A bank holds 500 consumer loans, and each defaults this year with probability 0.006, independently of the others. Use the Poisson approximation to find the probability that more than 4 loans default, and compare it with the exact binomial answer. Each default costs the bank 20000. How much capital covers the default losses in at least 95 % of years?

1. $\lambda = np = 500 \times 0.006 = 3$; $\operatorname{Var}(X) = np(1-p) = 2.982 \approx 3$
   *Why:* $n$ is large and $p$ small, so $B(500,\ 0.006)$ is close to a Poisson distribution with the same mean; the two variances almost agree.
2. $P(X \le 4) \approx e^{-3}\left(1 + 3 + \tfrac{9}{2} + \tfrac{27}{6} + \tfrac{81}{24}\right) = 0.049787 \times 16.375 = 0.8153$
   *Why:* the Poisson terms for 0 to 4 defaults, with the common factor $e^{-3}$ taken out.
3. $P(X > 4) \approx 1 - 0.8153 = 0.1847$; the exact binomial value is $0.1842$
   *Why:* "more than 4" is the complement of "at most 4". The approximation is off by only 0.0005, and its terms are easy to work out by hand, unlike exact terms such as $\binom{500}{4}(0.006)^4(0.994)^{496}$.
4. $P(X \le 5) \approx 0.8153 + \dfrac{e^{-3}\,3^5}{5!} = 0.8153 + 0.1008 = 0.9161 < 0.95$
   *Why:* we look for the smallest number of defaults $c$ with $P(X \le c) \ge 0.95$, adding one term at a time.
5. $P(X \le 6) \approx 0.9161 + \dfrac{e^{-3}\,3^6}{6!} = 0.9161 + 0.0504 = 0.9665 \ge 0.95$, so $c = 6$ and the capital is $6 \times 20{,}000 = 120{,}000$
   *Why:* up to 6 defaults happen in about 97 % of years, but up to 5 only in about 92 %, so capital for 6 defaults is the least that reaches 95 %. This is a simple version of the value-at-risk calculations banks use.

```verify
n = 500; p = 0.006
lam = n * p
assert abs(lam - 3) < 1e-12
assert abs(n*p*(1 - p) - 2.982) < 1e-9
k = 0:4
bracket = sum(lam.^k ./ factorial(k))
assert abs(bracket - 16.375) < 1e-12
assert abs(exp(-3) - 0.049787) < 0.0000005
cdf4 = exp(-lam) * bracket
assert abs(cdf4 - 0.8153) < 0.00005
assert abs(1 - cdf4 - 0.1847) < 0.00005
# the exact binomial tail
b(j) = combinations(500, j) * p^j * (1 - p)^(500 - j)
bin4 = sum(map(k, b))
assert abs(1 - bin4 - 0.1842) < 0.00005
assert abs((1 - cdf4) - (1 - bin4) - 0.0005) < 0.0001
p5 = exp(-lam) * lam^5 / factorial(5)
p6 = exp(-lam) * lam^6 / factorial(6)
assert abs(p5 - 0.1008) < 0.00005
assert abs(p6 - 0.0504) < 0.00005
assert abs(cdf4 + p5 - 0.9161) < 0.00005
assert cdf4 + p5 < 0.95
assert abs(cdf4 + p5 + p6 - 0.9665) < 0.00005
assert cdf4 + p5 + p6 >= 0.95
assert 6 * 20000 == 120000
# the exact binomial gives the same capital
assert sum(map(0:5, b)) < 0.95
assert sum(map(0:6, b)) >= 0.95
```

## Common mistakes
- Multiplying $p^k(1-p)^{n-k}$ without the factor $\binom{n}{k}$, which gives the probability of one particular order only (NO_COMBINATION).
- Raising $1 - p$ to the power $k$ and $p$ to the power $n - k$, the wrong way round (SWAPPED_P).
- Including or leaving out the end point by mistake: "fewer than 3" is $X \le 2$, "more than 4" is $X \ge 5$ (BOUNDARY).
- Giving one term $P(X = k)$ when the question asks for "at most", "at least" or "more than" (EXACT_ONLY).
- Working out the complement and forgetting to subtract it from 1 (NOT_COMPLEMENT).
- Using the rate per hour as $\lambda$ for a 20-minute period instead of rescaling it, $\lambda = r\,t$ (RATE_NOT_SCALED).
- Leaving out $e^{-\lambda}$ in the Poisson formula (NO_EXP).
- Leaving out $k!$ in the Poisson formula (NO_FACTORIAL).
- Using the binomial when the trials are not independent: in a recession many borrowers default together, so the model understates the chance of many defaults.
- Using the Poisson approximation when $p$ is not small: with $p = 0.5$ the Poisson variance $np$ is twice the true $np(1-p)$.
- Taking $\lambda$ as the standard deviation of a Poisson count: the variance is $\lambda$, so the standard deviation is $\sqrt{\lambda}$.

## Practice
- `binomial-count-probability` (difficulty 1): binomial probability of exactly, at most or at least $k$ successes (defaults, defective bulbs, sales, claims) in $n \le 10$ trials, to 4 decimal places; distractors NO_COMBINATION, SWAPPED_P, BOUNDARY, EXACT_ONLY, NOT_COMPLEMENT.
- `poisson-arrivals-probability` (difficulty 2): Poisson probability of exactly $k$ events, or of at least one, after rescaling a rate per hour, month or 100 metres to the period asked about; distractors RATE_NOT_SCALED, NO_EXP, NO_FACTORIAL, NOT_COMPLEMENT, EXACT_ONLY.
- `poisson-approximation-defaults` (difficulty 3): probability that more than $k$ of $n$ loans, payments, parcels or policies have a rare event, using the Poisson approximation with $\lambda = np$; distractors NOT_COMPLEMENT, BOUNDARY, EXACT_ONLY.

## Real world
- Credit risk: banks and rating agencies model the number of defaults in a pool of loans or bonds. The binomial with independent defaults is the starting point; the 2007–2009 financial crisis showed how badly it can understate the risk when defaults move together, which is why modern models add correlation between borrowers.
- Insurance: the number of claims per month or per year is commonly modelled as Poisson, with $\lambda$ scaled to the size of the portfolio and the length of the period; the upper tail of the claim count sets the reserves and the reinsurance an insurer buys (Example 3 is the same idea for a bank).
- Staffing and queues: arrivals at bank branches, shops, call centres and hospital emergency departments are close to Poisson, so managers choose the number of staff to keep the chance of overload, $P(X > \text{capacity})$, small (Example 2); queueing theory builds on this (SP05).
- Quality control and count data: acceptance sampling uses the binomial to judge a batch from a sample, flaws per metre of cable or per square metre of fabric are Poisson, and econometricians use Poisson regression for counts such as patents per firm or doctor visits per person.

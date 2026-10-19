---
id: NM03
title: Monte Carlo simulation
block: NM
coreYear: 4
prerequisites: [ST202]
estMinutes: 45
status: draft
economicUses:
  - Project appraisal when sales, prices and costs are uncertain
  - Bank stress tests and value at risk
  - Insurance and pension fund capital
  - Pricing complex financial contracts
  - Fan charts for public debt and other forecasts
generators: [monte-carlo-draws-for-target-se, inverse-transform-exponential-draw, monte-carlo-probability-limit]
widgets: [monte-carlo-running-mean]
mistakeCodes:
  SE_LINEAR_IN_N:
    label: Thought the error falls like 1/N
    explanation: The standard error of a Monte Carlo estimate is s/√N, so cutting it by a factor k needs k² times as many draws, not k times. Halving the error takes four times the draws.
  SE_AS_SD:
    label: Treated the pilot's standard error as the spread of one draw
    explanation: The pilot's standard error SE₀ has already been divided by √N₀. The spread of one simulated value is s = SE₀·√N₀, so the draws needed are N = (s/d)² = N₀·(SE₀/d)².
  LN_U_NOT_ONE_MINUS_U:
    label: Took ln u instead of ln(1 − u)
    explanation: Solving 1 − e^(−x/m) = u gives e^(−x/m) = 1 − u, so x = −m·ln(1 − u). Using ln u gives the value that belongs to 1 − u, not to the draw you were given.
  RATE_FOR_MEAN:
    label: Divided by the mean instead of multiplying by it
    explanation: For an exponential with mean m the inverse is x = −m·ln(1 − u). It is the rate λ = 1/m that you divide by; dividing by m gives a value far too small.
  DROPPED_MINUS:
    label: Lost the minus sign
    explanation: Since 1 − u is below 1, ln(1 − u) is negative and x = −m·ln(1 − u) is positive. A negative waiting time or claim size is a sign that the minus has been dropped.
  NO_SQUARE_ROOT:
    label: Forgot the square root in the standard error
    explanation: p̂(1 − p̂)/N is the variance of the estimate p̂; its standard error is the square root, √(p̂(1 − p̂)/N). Without the root the interval is almost zero wide.
  FORGOT_Z:
    label: Used one standard error instead of 1.96
    explanation: A 95 % interval reaches 1.96 standard errors either side of the estimate. Going out only one standard error gives an interval that covers the truth in about 68 % of runs.
  SD_NOT_SE:
    label: Used the spread of one scenario, not of the average
    explanation: √(p̂(1 − p̂)) is the standard deviation of a single 0/1 outcome. The estimate is an average of N outcomes, so its standard error is that number divided by √N.
resources:
  - { title: "Introduction to Computational Thinking and Data Science, Lecture 6: Monte Carlo Simulation (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/6-0002-introduction-to-computational-thinking-and-data-science-fall-2016/resources/lecture-6-monte-carlo-simulation/", kind: course, verifiedAt: 2026-10-18 }
  - { title: "Introduction to Computational Thinking and Data Science, Lecture 7: Confidence Intervals (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/6-0002-introduction-to-computational-thinking-and-data-science-fall-2016/resources/lecture-7-confidence-intervals/", kind: course, verifiedAt: 2026-10-18 }
  - { title: "Introductory Statistics 2e, 7.3 Using the Central Limit Theorem (OpenStax)", url: "https://openstax.org/books/introductory-statistics-2e/pages/7-3-using-the-central-limit-theorem", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
Many economic questions are about averages and risks of outcomes that depend on several uncertain things at once. What is a new factory's expected net present value when sales, prices and costs are all uncertain? How likely is a bank to run out of capital in a severe recession? How large a loss on a portfolio is exceeded only one day in a hundred? With one simple uncertain input you can sometimes work out the answer by hand (ST103), but with many inputs, non-linear payoffs and options to react along the way, there is usually no formula. **Monte Carlo simulation** answers such questions by brute force: it lets a computer play out the uncertain future thousands of times and averages what happens. Banks, insurers, central banks, finance ministries and consulting firms use it every day, and this topic shows why it works, how accurate it is, and how to turn random numbers into the scenarios a model needs.

## Intuition
Suppose you want the chance that a project loses money. Instead of solving for it, **imagine the future many times**. In each imagined future, draw the uncertain inputs (sales, price, costs) at random from their distributions, compute the NPV, and note whether it is negative. After 10,000 futures, the share with a negative NPV is your estimate of the probability, and the average NPV is your estimate of the expected NPV. This is the idea of an opinion poll turned on a model: you sample from the possible futures instead of from people.

Why can you trust it? Each simulated future is an independent draw, so by the **law of large numbers** (ST206) the average of many draws settles down at the true expected value. And by the central limit theorem (ST202) you even know **how far off** the estimate is likely to be: its standard error is the spread of one draw divided by $\sqrt{N}$. That square root is the method's weakness: four times the draws only halve the error, and each extra correct decimal place costs a hundred times the draws. Its strength is that the same rate holds however many uncertain inputs the model has, which is exactly where formulas and grids fail.

A computer cannot toss real coins, so it uses **pseudo-random numbers**: a fixed recipe that turns a starting number, the **seed**, into a long sequence that behaves like independent uniform draws between 0 and 1. Every other distribution is then made from these uniforms.

## Definition and formulas
**The Monte Carlo estimator.** To estimate $\theta = E[g(X)]$, where $X$ is a random input (or a whole list of inputs) and $g$ is the model that turns it into an outcome, draw $X_1, \dots, X_N$ independently from the distribution of $X$ and average:
$$\hat\theta_N = \frac{1}{N}\sum_{i=1}^{N} g(X_i).$$
A **probability** is the expected value of a 0/1 indicator, $P(A) = E[\mathbf{1}_A]$, so its estimate is the share of draws in which the event happens: $\hat p = (\text{number of hits})/N$.

**Why it works.** $\hat\theta_N$ is an average of independent draws with mean $\theta$, so $E[\hat\theta_N] = \theta$ (it is unbiased) and, by the law of large numbers, $\hat\theta_N \to \theta$ as $N \to \infty$.

**How accurate it is.** If one draw $g(X)$ has standard deviation $\sigma$, then
$$\operatorname{SE}(\hat\theta_N) = \frac{\sigma}{\sqrt{N}}, \qquad \text{estimated by} \qquad \frac{s}{\sqrt{N}}, \quad s = \sqrt{\frac{1}{N-1}\sum_{i=1}^{N}\big(g(X_i) - \hat\theta_N\big)^2}.$$
For a probability, one draw is 0 or 1 with variance $p(1-p)$, so $\operatorname{SE}(\hat p) = \sqrt{\hat p(1-\hat p)/N}$. By the central limit theorem, for large $N$ the estimate is approximately normal, which gives a 95 % confidence interval (ST203):
$$\hat\theta_N \pm 1.96\,\frac{s}{\sqrt{N}}, \qquad \hat p \pm 1.96\sqrt{\frac{\hat p(1-\hat p)}{N}}.$$
Always report a Monte Carlo result with its standard error or interval: the estimate itself is random.

**The $1/\sqrt{N}$ rate and the number of draws.** To make the standard error at most $d$ you need
$$\frac{s}{\sqrt{N}} \le d \iff N \ge \left(\frac{s}{d}\right)^2,$$
rounded up. If a pilot run of $N_0$ draws had standard error $\text{SE}_0$, then $s = \text{SE}_0\sqrt{N_0}$ and $N = N_0\,(\text{SE}_0/d)^2$: cutting the error by a factor $k$ needs $k^2$ times the draws. The rate does not depend on how many random inputs the model has, whereas a grid of 10 points for each of 20 inputs would need $10^{20}$ evaluations.

**Turning uniform draws into other distributions: the inverse transform.** Let $U$ be uniform on $(0, 1)$ and let $F$ be a continuous, increasing distribution function. Then $X = F^{-1}(U)$ has distribution function $F$, because
$$P\big(F^{-1}(U) \le x\big) = P\big(U \le F(x)\big) = F(x).$$
In words: pick the value whose cumulative probability equals the uniform draw. Three cases you will use:

- **Uniform on $[a, b]$:** $F(x) = (x - a)/(b - a)$, so $x = a + (b - a)\,u$.
- **Exponential with mean $m$** (waiting times, time to default, claim sizes; see SP05): $F(x) = 1 - e^{-x/m}$, so
  $$x = -m\ln(1 - u).$$
- **Discrete outcomes** $x_1 < x_2 < \dots$ with probabilities $p_1, p_2, \dots$: cut $(0, 1)$ into consecutive pieces of lengths $p_1, p_2, \dots$, so piece $k$ ends at the cumulative probability $p_1 + \dots + p_k$, and return the outcome whose piece contains $u$.

A normal draw is $x = \mu + \sigma\,\Phi^{-1}(u)$, with $\Phi^{-1}$ read from a table or computed by software.

**Pseudo-random numbers and seeds.** A pseudo-random generator is a deterministic rule $z_{i+1} = h(z_i)$ started from a seed $z_0$, with each $z_i$ scaled to a number $u_i$ in $(0, 1)$. The same seed always gives the same sequence, so a study can be **reproduced** exactly and checked; a different seed gives a fresh, independent-looking run. When you compare two policies, run both on the **same** draws (common random numbers): the difference between them then reflects the policies, not luck.

**A recipe.** (1) Write the model: outcome $= g(\text{inputs})$. (2) Choose a distribution for each input. (3) Draw the inputs, using the inverse transform on uniforms. (4) Compute the outcome. (5) Repeat $N$ times. (6) Report the average or share, its standard error and an interval.

**Value at risk from simulated losses.** The 99 % value at risk (VaR) is the loss that is exceeded with probability only 1 %. With $N$ simulated losses sorted from smallest to largest, $L_{(1)} \le \dots \le L_{(N)}$, estimate it by the $\lceil 0.99N\rceil$-th smallest one. For $N = 1000$ that is $L_{(990)}$: when no two losses are equal, exactly 10 scenarios, 1 % of them, have larger losses.

## Interactive
::widget{id="monte-carlo-running-mean"}

The widget simulates the project of Example 1, whose expected NPV is exactly 100 (the green dashed line). The lilac line is the running Monte Carlo estimate, the average NPV after each draw, and the gold band is $100 \pm 2\sigma/\sqrt{n}$, where about 95 % of runs should be. Move **Draws N** (10 to 2,000) to run the simulation longer, and **Seed** (1 to 5) to start the random number generator from a different seed. The panel shows the estimate after $N$ draws, its standard error $s/\sqrt{N}$ and the true value. Check: with seed 1 and $N = 400$ the panel shows an estimate of 87.99 and a standard error of 8.8; move to $N = 1600$, four times the draws, and the standard error falls to 4.3, about half, while the estimate moves to 97.96. Set the seed to 4 and $N$ back to 400: this run is unlucky, at 127.26 it lies outside the band, which should happen in about 1 run in 20. Go back to seed 1 and $N = 400$ and you get 87.99 again: the same seed always gives the same draws.

## Worked examples

### Example 1 (easy): the expected NPV of a project
A project costs 1000 today. Next year's cash flow $C$ is equally likely to be anywhere between 960 and 1680 (uniform), and it is discounted at 20 %. A simulation draws ten uniform numbers: 0.62, 0.15, 0.88, 0.47, 0.03, 0.71, 0.36, 0.94, 0.29, 0.41. Estimate the expected NPV, its standard error and the probability of a loss, and find how many draws would give a standard error of at most 5.

1. $C = 960 + 720u$, so $NPV = -1000 + \dfrac{C}{1.2} = -200 + 600u$; for $u = 0.62$: $C = 1406.4$ and $NPV = 172$
   *Why:* the inverse transform for a uniform distribution on $[960, 1680]$ stretches $u$ over the range; then discount one year at 20 %.
2. The ten NPVs are $172, -110, 328, 82, -182, 226, 16, 364, -26, 46$, so $\hat\theta = \dfrac{916}{10} = 91.6$
   *Why:* the Monte Carlo estimate of the expected NPV is the plain average of the simulated NPVs.
3. $s = \sqrt{\dfrac{291{,}830.4}{9}} = 180.07$ and $\operatorname{SE} = \dfrac{180.07}{\sqrt{10}} = 56.94$
   *Why:* $s$ measures the spread of one simulated NPV (divisor $N - 1$); averaging ten of them divides the spread by $\sqrt{10}$.
4. A rough 95 % interval is $91.6 \pm 1.96 \times 56.94$, from $-20.0$ to $203.2$
   *Why:* the estimate is about normal around the truth. With only ten draws this is just a rough guide; the true expected NPV, $-1000 + 1320/1.2 = 100$, lies inside it.
5. $\hat p = \dfrac{3}{10} = 0.3$ for $P(NPV < 0)$
   *Why:* three draws (−110, −182, −26) are negative; the true probability is $P(u < 1/3) = 1/3$.
6. $N \ge \left(\dfrac{180.07}{5}\right)^2 = 1297.02$, so $N = 1298$ draws
   *Why:* the standard error $s/\sqrt{N}$ must fall to 5; round up, since 1297 draws leave it just above 5. With the true spread $\sigma = 600/\sqrt{12} = 173.21$ the answer would be exactly 1200.

```verify
u = [0.62, 0.15, 0.88, 0.47, 0.03, 0.71, 0.36, 0.94, 0.29, 0.41]
c = 960 + 720 * u
v = -1000 + c / 1.2
assert abs(c[1] - 1406.4) < 1e-9
assert abs(v[1] - 172) < 1e-9
assert sum(abs(v - [172, -110, 328, 82, -182, 226, 16, 364, -26, 46])) < 1e-9
assert abs(sum(v) - 916) < 1e-9
m = mean(v)
assert abs(m - 91.6) < 1e-9
assert abs(sum((v - m) .^ 2) - 291830.4) < 1e-6
s = std(v)
assert abs(s - sqrt(291830.4 / 9)) < 1e-9
assert abs(s - 180.07) < 0.005
se = s / sqrt(10)
assert abs(se - 56.94) < 0.005
assert abs((m - 1.96 * se) - (-20.0)) < 0.05
assert abs((m + 1.96 * se) - 203.2) < 0.05
assert -1000 + 1320 / 1.2 == 100
assert abs((960 + 1680) / 2 - 1320) < 1e-9
assert sum(v < 0) == 3
assert abs((s / 5)^2 - 1297.02) < 0.005
assert ceil((s / 5)^2) == 1298
sigma = 600 / sqrt(12)
assert abs(sigma - 173.21) < 0.005
assert abs((sigma / 5)^2 - 1200) < 1e-9
```

### Example 2 (medium): turning uniform draws into defaults and losses
A bank models the time until a borrower defaults as exponential with mean 8 years. (a) Turn the uniform draw $u = 0.30$ into a default time, and find the probability that a draw means default within 5 years. (b) On a loan of 10,000 the bank loses 0 with probability 0.90, 4000 with probability 0.07 and 10,000 with probability 0.03. Simulate six loans with the uniforms 0.42, 0.93, 0.17, 0.985, 0.66, 0.88 and compare the average simulated loss with the expected loss.

1. $1 - e^{-x/8} = 0.30 \iff e^{-x/8} = 0.70 \iff x = -8\ln 0.70 = 2.85$ years
   *Why:* the inverse transform picks the time whose cumulative probability is the uniform draw; $\ln 0.70 = -0.3567$ is negative, so $x$ is positive.
2. $F(5) = 1 - e^{-5/8} = 0.4647$: a draw gives default within 5 years exactly when $u < 0.4647$
   *Why:* $x = F^{-1}(u)$ is increasing in $u$, so $x < 5$ if and only if $u < F(5)$. In a long simulation about 46.5 % of borrowers default within 5 years.
3. Pieces of $(0, 1)$: $[0, 0.90) \to 0$, $\;[0.90, 0.97) \to 4000$, $\;[0.97, 1) \to 10{,}000$
   *Why:* the pieces have lengths 0.90, 0.07 and 0.03, the probabilities of the three outcomes; their ends are the cumulative probabilities.
4. The losses are $0, 4000, 0, 10{,}000, 0, 0$, with average $\dfrac{14{,}000}{6} = 2333.33$
   *Why:* 0.93 falls in the middle piece and 0.985 in the top piece; every other draw is below 0.90.
5. Expected loss $= 0.07 \times 4000 + 0.03 \times 10{,}000 = 580$
   *Why:* the simulated average is four times the true value because one rare total loss turned up among only six draws. Rare, large losses make the spread of one draw large (here $\sigma = 1945.15$), so they need many draws to pin down.

```verify
x = -8 * log(0.70)
assert abs(x - 2.85) < 0.005
assert abs(log(0.70) - (-0.3567)) < 0.00005
assert abs(1 - exp(-x / 8) - 0.30) < 1e-12
f5 = 1 - exp(-5 / 8)
assert abs(f5 - 0.4647) < 0.00005
assert -8 * log(1 - 0.4646) < 5 and -8 * log(1 - 0.4648) > 5
loss(w) = w < 0.90 ? 0 : (w < 0.97 ? 4000 : 10000)
draws = [loss(0.42), loss(0.93), loss(0.17), loss(0.985), loss(0.66), loss(0.88)]
assert sum(abs(draws - [0, 4000, 0, 10000, 0, 0])) == 0
avg = mean(draws)
assert abs(avg - 2333.33) < 0.005
el = 0.07 * 4000 + 0.03 * 10000
assert el == 580
assert abs(avg / el - 4) < 0.03
sd = sqrt(0.07 * 4000^2 + 0.03 * 10000^2 - el^2)
assert abs(sd - 1945.15) < 0.005
```

### Example 3 (hard): a bank stress test
A bank simulates its losses over the next year under 2000 economic scenarios. Its capital ratio falls below the regulatory minimum whenever the loss exceeds 4 billion, which happens in 74 scenarios. Estimate the probability of a breach with a 95 % confidence interval, find how many scenarios would make the standard error at most 0.002, and estimate the 99 % value at risk if the 19th to 23rd largest simulated losses are 6.4, 6.1, 5.9, 5.8 and 5.6 billion.

1. $\hat p = \dfrac{74}{2000} = 0.037$
   *Why:* the probability of a breach is the expected value of a 0/1 indicator, so its estimate is the share of scenarios with a breach.
2. $\operatorname{SE} = \sqrt{\dfrac{0.037 \times 0.963}{2000}} = 0.00422$
   *Why:* one scenario is a 0/1 outcome with variance $p(1 - p)$; the average of 2000 of them has that variance divided by 2000.
3. $0.037 \pm 1.96 \times 0.00422 = 0.037 \pm 0.0083$, so the interval is $[0.0287, 0.0453]$
   *Why:* with 2000 scenarios the estimate is close to normal, so 1.96 standard errors either side give a 95 % interval. The breach probability is between about 2.9 % and 4.5 %.
4. $N \ge \dfrac{0.037 \times 0.963}{0.002^2} = 8907.75$, so $N = 8908$ scenarios
   *Why:* solve $\sqrt{\hat p(1 - \hat p)/N} \le 0.002$ for $N$, using the pilot estimate for $p$, and round up. Cutting the standard error from 0.00422 to 0.002, by a factor of about 2.1, needs about $2.1^2 \approx 4.5$ times the scenarios.
5. $\lceil 0.99 \times 2000 \rceil = 1980$: the 1980th smallest loss is the 21st largest, so $\text{VaR}_{99\%} = 5.9$ billion
   *Why:* the 20 largest losses are the worst 1 % of scenarios; the next one down, $2000 - 1980 + 1 = 21$st largest, is the loss exceeded in only 1 % of scenarios.

```verify
p = 74 / 2000
assert p == 0.037
assert abs(p * (1 - p) - 0.035631) < 1e-12
se = sqrt(p * (1 - p) / 2000)
assert abs(se - 0.00422) < 0.000005
assert abs(1.96 * se - 0.0083) < 0.00005
assert abs((p - 1.96 * se) - 0.0287) < 0.00005
assert abs((p + 1.96 * se) - 0.0453) < 0.00005
n = p * (1 - p) / 0.002^2
assert abs(n - 8907.75) < 1e-6
assert ceil(n) == 8908
assert sqrt(p * (1 - p) / 8907) > 0.002 and sqrt(p * (1 - p) / 8908) <= 0.002
assert abs(se / 0.002 - 2.1) < 0.02
assert abs((se / 0.002)^2 - 4.5) < 0.05
assert abs(8908 / 2000 - 4.5) < 0.05
assert ceil(0.99 * 2000) == 1980
assert 2000 - 1980 + 1 == 21
largest = [6.4, 6.1, 5.9, 5.8, 5.6]
assert largest[21 - 18] == 5.9
```

## Common mistakes
- Thinking the error falls like $1/N$, so twice the draws halve it (SE_LINEAR_IN_N).
- Using a pilot run's standard error as if it were the spread of a single draw (SE_AS_SD).
- Writing $x = -m\ln u$ when the rule is $x = F^{-1}(u) = -m\ln(1 - u)$ (LN_U_NOT_ONE_MINUS_U).
- Dividing by the mean $m$ of an exponential instead of multiplying by it, which confuses the mean with the rate $1/m$ (RATE_FOR_MEAN).
- Dropping the minus sign in $-m\ln(1 - u)$ and getting a negative time or claim (DROPPED_MINUS).
- Using $\hat p(1 - \hat p)/N$ as the standard error, without the square root (NO_SQUARE_ROOT).
- Building a "95 %" interval with one standard error instead of 1.96 (FORGOT_Z).
- Dividing $\sqrt{\hat p(1 - \hat p)}$ by nothing: that is the spread of one scenario, not of the estimate (SD_NOT_SE).
- Reporting a simulated number with no standard error, as if it were exact. Two runs with different seeds give different answers; the standard error says how different.
- Running with an unrecorded seed, so nobody, including you, can reproduce the result.
- Using a few hundred draws for a rare event: with $p = 0.001$ and $N = 500$ you expect half a hit, and the estimate is usually 0.
- Comparing two policies on different random draws, so the difference is mostly noise; use the same draws for both.

## Practice
- `monte-carlo-draws-for-target-se` (difficulty 1): from a pilot run's size and standard error, the total number of draws needed to reach a target standard error; distractors SE_LINEAR_IN_N, SE_AS_SD.
- `inverse-transform-exponential-draw` (difficulty 2): turn a uniform draw into an exponential default time, waiting time or claim size with $x = -m\ln(1 - u)$, to 2 decimals; distractors LN_U_NOT_ONE_MINUS_U, RATE_FOR_MEAN, DROPPED_MINUS.
- `monte-carlo-probability-limit` (difficulty 3): estimate a probability from the number of hits in $N$ simulated scenarios and give the upper or lower 95 % confidence limit, to 4 decimals; distractors NO_SQUARE_ROOT, FORGOT_Z, SD_NOT_SE.

## Real world
- Banking: many banks estimate the value at risk of their trading books by simulating thousands of possible market moves and reading off a high percentile of the simulated losses, and many use simulation in their own stress tests of loan portfolios, alongside the fixed adverse scenarios set by supervisors.
- Insurance and pensions: under the EU's Solvency II rules an insurer must hold enough capital to survive a one-year loss that is exceeded with probability 0.5 %; firms with their own internal models estimate that 99.5 % value at risk by simulating a very large number of possible years of claims and market returns. Pension funds simulate return paths to estimate the chance of a funding shortfall.
- Public finance: finance ministries and the IMF simulate many joint paths of growth, interest rates and the primary balance to draw fan charts for government debt and to estimate the chance that debt rises above a threshold.
- Investment appraisal and derivatives: firms simulate NPVs with uncertain demand, prices and costs to see the whole range of outcomes, not just a single forecast, and banks price complex options by averaging discounted payoffs over simulated price paths (SP04), when no formula exists.

---
id: SP03
title: Random walks and Brownian motion (intuition)
block: SP
coreYear: 4
prerequisites: [SP01, ST105]
estMinutes: 45
status: draft
economicUses:
  - Share prices and exchange rates whose changes cannot be forecast
  - "Scaling risk over time: annual volatility and 10-day value at risk"
  - Testing the efficient-markets idea that prices follow random walks
  - Cash management and the chance that a reserve runs low
  - Geometric Brownian motion, the standard model of prices behind option pricing
searchTerms:
  - "Random walk"
  - "Brownian motion"
  - "Wiener process"
generators: [square-root-time-risk, random-walk-level-probability, brownian-drift-level-probability]
widgets: [random-walk-fan]
mistakeCodes:
  LINEAR_TIME:
    label: Scaled the spread with T instead of √T
    explanation: Over T independent periods the variances add, so the variance grows like T and the standard deviation like √T. Multiply a daily standard deviation or VaR by √T, not by T.
  DIVIDED_BY_ROOT:
    label: Divided by √T
    explanation: Dividing by √T is the rule for the standard deviation of an average of T values. A total change over T days is a sum, and its spread is larger, σ√T.
  VARIANCE_NOT_SD:
    label: Gave the variance, not the standard deviation
    explanation: T·σ² is the variance of the T-day change. Take its square root to get back to the units of the question, σ√T.
  LEVEL_AS_UPS:
    label: Used the level as the number of up-steps
    explanation: To end at level k after n steps the walk needs u − d = k and u + d = n, so u = (n + k)/2 up-steps. Count the paths with C(n, (n + k)/2), not C(n, k).
  ONE_PATH:
    label: Counted only one path
    explanation: (½)ⁿ is the probability of one particular sequence of ups and downs. Many sequences end at the same level; multiply by their number, C(n, (n + k)/2).
  EQUAL_LEVELS:
    label: Treated every level as equally likely
    explanation: The n + 1 possible end points are not equally likely. Levels near the start can be reached by many paths and levels far away by few, so use the binomial count C(n, (n + k)/2)/2ⁿ.
  NO_DRIFT:
    label: Forgot the drift
    explanation: Brownian motion with drift X(t) = x₀ + μt + σW(t) has mean x₀ + μT at time T, not x₀. Subtract that mean before dividing by σ√T.
  WRONG_TAIL:
    label: Took the wrong side of the distribution
    explanation: Φ(z) is the probability of ending below the level. For "above" use 1 − Φ(z); for "below" use Φ(z) itself.
resources:
  - { title: "Topics in Mathematics with Applications in Finance (MIT 18.S096), Lecture 5: Stochastic Processes I (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-s096-topics-in-mathematics-with-applications-in-finance-fall-2013/resources/lecture-5-stochastic-processes-i/", kind: course, verifiedAt: 2026-10-18 }
  - { title: "Topics in Mathematics with Applications in Finance (MIT 18.S096), Lecture 17: Stochastic Processes II (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-s096-topics-in-mathematics-with-applications-in-finance-fall-2013/resources/lecture-17-stochastic-processes-ii/", kind: course, verifiedAt: 2026-10-18 }
  - { title: "Principles of Finance, 11.5 Efficient Markets (OpenStax)", url: "https://openstax.org/books/principles-finance/pages/11-5-efficient-markets", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
Look at a chart of a share price or an exchange rate over a year. It wanders up and down with no regular pattern, and yesterday's rise tells you almost nothing about today. The simplest model that behaves like this is a **random walk**: each day the price takes a random step that does not depend on the steps before. Two facts about random walks run through finance and economics. First, the spread of possible outcomes grows with the **square root** of time, not with time itself, so a bank that knows its risk over one day can estimate its risk over ten days by multiplying by $\sqrt{10} \approx 3.16$, not by 10 (Example 2). Second, when the steps are made tiny and very frequent, a random walk turns into **Brownian motion**, the continuous-time model used for asset prices, interest rates and firms' cash flows, and the starting point of option pricing (SP04).

## Intuition
Toss a fair coin every day. Heads, a share price goes up by 1; tails, it goes down by 1. Where will it be after 100 days? On average exactly where it started, because ups and downs are equally likely. But it will hardly ever be exactly there: the price has wandered. How far? Not 100 (that needs 100 heads in a row) and not 0. The typical distance is about $\sqrt{100} = 10$.

Why the square root? The daily moves are independent, so they partly cancel. Their **variances** add up, 1 per day, giving 100 after 100 days; the standard deviation, the typical distance, is the square root, 10. To double the typical distance you need four times as many days. This is why risk over a year is not 250 times the risk over a day, but only about $\sqrt{250} \approx 16$ times.

Two more ideas follow from the same picture. A random walk has no memory beyond where it is now: it is a Markov chain on the whole numbers (SP01), and for a fair walk the best forecast of tomorrow's level is simply today's level. And if each step is the sum of many tiny independent shocks, the central limit theorem (ST202) says the total is approximately normal. Shrinking the steps and squeezing them closer together gives a path that moves at every instant, with normally distributed changes whose variance equals the time elapsed: Brownian motion. Add a steady trend and you have a model of a share price that grows on average but stays risky.

## Definition and formulas
**Random walk.** Let $X_1, X_2, \dots$ be independent steps with $P(X_i = +1) = p$ and $P(X_i = -1) = 1 - p$. The **random walk** is
$$S_0 = 0, \qquad S_n = X_1 + X_2 + \dots + X_n .$$
It is **symmetric** when $p = \tfrac12$ and has **drift** (upwards if $p > \tfrac12$, downwards if $p < \tfrac12$) otherwise. The next level depends only on the current level, so the walk is a Markov chain (SP01). For the symmetric walk $E[S_{n+1} \mid S_n] = S_n$: on average it stays where it is, a "fair game".

**Mean and variance.** One step has $E[X_i] = p - (1 - p) = 2p - 1$ and $E[X_i^2] = 1$, so $\operatorname{Var}(X_i) = 1 - (2p - 1)^2 = 4p(1 - p)$. Means and, because the steps are independent, variances add:
$$E[S_n] = n(2p - 1), \qquad \operatorname{Var}(S_n) = 4np(1 - p).$$
For the symmetric walk $E[S_n] = 0$, $\operatorname{Var}(S_n) = n$ and $\operatorname{SD}(S_n) = \sqrt{n}$.

**The distribution of $S_n$.** If $u$ of the $n$ steps go up and $d = n - u$ go down, then $S_n = u - d = 2u - n$. The number of up-steps is binomial, $u \sim \text{Bin}(n, p)$ (ST104), so for a level $k$
$$P(S_n = k) = \binom{n}{\frac{n+k}{2}}\, p^{\frac{n+k}{2}} (1 - p)^{\frac{n-k}{2}}, \qquad \text{symmetric: } P(S_n = k) = \binom{n}{\frac{n+k}{2}} \Big/ 2^n .$$
Only levels with $|k| \le n$ and the same parity as $n$ (both even or both odd) can be reached; every other level has probability 0.

**The square-root-of-time rule.** If a quantity changes by independent amounts with standard deviation $\sigma$ each day, its change over $T$ days has variance $T\sigma^2$ and standard deviation
$$\sigma_T = \sigma\sqrt{T}.$$
A risk measure that is a fixed multiple of the standard deviation scales the same way: with normal changes and no drift, the 10-day value at risk (VaR) is $\sqrt{10}$ times the 1-day VaR. Meanwhile the drift grows like $T$, so over long horizons the trend becomes large compared with the noise: $E[S_n]/\operatorname{SD}(S_n)$ grows like $\sqrt{n}$.

**Gambler's ruin.** A gambler starts with $a$, bets 1 on a fair coin each round and stops when she has $a + b$ or nothing. The probability that she reaches $a + b$ first is
$$P(\text{reach } a + b \text{ before } 0) = \frac{a}{a + b}, \qquad P(\text{ruin}) = \frac{b}{a + b}.$$
Reason: the game is fair, so her expected final wealth equals her starting wealth, $(a + b)\,P(\text{reach } a + b) = a$. Someone with 20 who aims for 100 succeeds with probability $20/100 = 0.2$.

**From random walk to Brownian motion.** Take steps of size $\pm\sqrt{\Delta t}$ every $\Delta t$ units of time. By time $t$ there are $t/\Delta t$ steps, so the variance is $(t/\Delta t) \times \Delta t = t$ whatever $\Delta t$ is. As $\Delta t \to 0$, the central limit theorem (ST202) makes the position normal. The limit is a **standard Brownian motion** $W(t)$:
- $W(0) = 0$;
- the change over any interval is normal, $W(t) - W(s) \sim N(0,\, t - s)$ for $s < t$; in particular $W(t) \sim N(0, t)$;
- changes over intervals that do not overlap are independent;
- the path is continuous but so jagged that it has no slope anywhere.

**Brownian motion with drift.** With a trend $\mu$ per unit of time and a volatility $\sigma$,
$$X(t) = x_0 + \mu t + \sigma W(t) \sim N(x_0 + \mu t,\; \sigma^2 t),$$
so, standardising as in ST105,
$$P\big(X(T) > c\big) = 1 - \Phi\!\left(\frac{c - x_0 - \mu T}{\sigma\sqrt{T}}\right).$$

**Geometric Brownian motion.** A price cannot fall below zero, so prices are modelled through their logarithm. In **geometric Brownian motion** the log price is a Brownian motion with drift:
$$\ln P(t) = \ln P(0) + \left(\mu - \tfrac12\sigma^2\right)t + \sigma W(t), \qquad P(t) = P(0)\, e^{(\mu - \frac12\sigma^2)t + \sigma W(t)}.$$
Here $\mu$ is the expected growth rate of the price and $\sigma$ its volatility. The expected price grows at rate $\mu$, but the median price grows more slowly:
$$E[P(t)] = P(0)\,e^{\mu t}, \qquad \text{median of } P(t) = P(0)\,e^{(\mu - \frac12\sigma^2)t}.$$
The gap comes from the exponential: a few very good outcomes pull the average up, while half of all paths end below the median. (Why the drift of the log is exactly $\mu - \tfrac12\sigma^2$ needs stochastic calculus, which is beyond this topic.)

**Efficient markets.** If a market price already reflects all public information, any predictable future rise would be bought today and so would already be in the price. What is left in tomorrow's change is news, which by definition cannot be forecast. So prices, or log prices, should behave approximately like a random walk with a small drift (the expected return). The "weak form" of the efficient-markets hypothesis tests exactly this: past price changes should not help predict future ones.

## Interactive
::widget{id="random-walk-fan"}

Ten random walks start at 0 and step up 1 with probability $p$ or down 1 otherwise; they are driven by the same fixed coin tosses, so moving a slider changes the picture, not the luck. The dashed green line is the mean $E[S_n] = n(2p - 1)$, the gold band is the mean ± 2 standard deviations, and the hollow dots show where the ten walks are after $n$ steps. At the start (**Steps n** = 100, **Probability of an up-step p** = 0.5) the panel shows $E[S_n] = 0$, $\operatorname{SD}(S_n) = 10$ and 10 of 10 walks inside ±2 SD, as in Example 1. Drag **Steps n** down to 25: the SD falls to 5, half as much for a quarter of the steps, and one walk is outside the band, so the panel shows 9 of 10. Back at 100 steps, move **p** to 0.6: the panel shows $E[S_n] = 20$ and $\operatorname{SD}(S_n) = 9.8$, the walk with drift of Example 2, and the band tilts upwards. Notice that the band's width grows like $\sqrt{n}$, so it bends, while the mean line is straight.

## Worked examples

### Example 1 (easy): a share that moves one step a day
A share price moves up by 1 or down by 1 each day with probability $\tfrac12$ each, independently of earlier days. Find the mean, variance and standard deviation of the change $S_8$ over 8 days, the probability that after 8 days the price is exactly 2 above its start, the probability that it is back at its start, and the standard deviation after 100 days. Then a trader with a capital of 20 makes bets of 1 on the same kind of fair moves and stops at 100 or at 0: how likely is she to reach 100?

1. $E[S_8] = 8 \times 0 = 0$, $\operatorname{Var}(S_8) = 8 \times 1 = 8$, $\operatorname{SD}(S_8) = \sqrt{8} \approx 2.83$
   *Why:* each step has mean 0 and variance 1, and for independent steps means and variances add.
2. $u - d = 2$, $u + d = 8 \Rightarrow u = 5$, $d = 3$
   *Why:* to end 2 above the start the walk needs two more ups than downs.
3. $P(S_8 = 2) = \dbinom{8}{5} \Big/ 2^8 = 56/256 \approx 0.2188$
   *Why:* each of the $2^8 = 256$ sequences of ups and downs has the same probability, and 56 of them have exactly 5 ups.
4. $P(S_8 = 0) = \dbinom{8}{4} \Big/ 2^8 = 70/256 \approx 0.2734$, while $P(S_8 = 3) = 0$
   *Why:* 0 is the most likely single level, yet it happens only about one time in four. Odd levels cannot be reached in an even number of steps.
5. $\operatorname{SD}(S_{100}) = \sqrt{100} = 10$, so about 95 % of paths end between $-20$ and $20$
   *Why:* 12.5 times as many days give only $\sqrt{12.5} \approx 3.54$ times the spread; the normal approximation (ST202) puts about 95 % within 2 standard deviations.
6. $P(\text{reach } 100) = \dfrac{20}{20 + 80} = 0.2$, $P(\text{ruin}) = 0.8$
   *Why:* gambler's ruin with $a = 20$ and $b = 80$: in a fair game her expected final capital, $100 \times 0.2 = 20$, equals what she started with.

```verify
n = 8
assert 8*0 == 0
assert abs(sqrt(n) - 2.83) < 0.005
u = (n + 2)/2
assert u == 5 and n - u == 3
p2 = combinations(8, 5)/2^8
assert combinations(8, 5) == 56 and 2^8 == 256
assert p2 == 0.21875
assert abs(p2 - 0.2188) < 0.0001
p0 = combinations(8, 4)/2^8
assert combinations(8, 4) == 70
assert abs(p0 - 0.2734) < 0.00005
# second route: sum over all levels of the binomial probabilities is 1, and mean/variance from it
levels = [-8, -6, -4, -2, 0, 2, 4, 6, 8]
probs = [1, 8, 28, 56, 70, 56, 28, 8, 1]/256
assert abs(sum(probs) - 1) < 1e-12
assert abs(sum(levels .* probs)) < 1e-12
assert abs(sum(levels.^2 .* probs) - 8) < 1e-12
assert sqrt(100) == 10
assert abs(sqrt(12.5) - 3.54) < 0.005
a = 20; b = 80
assert (a/(a + b)) == 0.2 and (b/(a + b)) == 0.8
assert abs(100*a/(a + b) - 20) < 1e-12
```

### Example 2 (medium): drift and the square-root-of-time rule
A fund's daily calls on the market are right with probability 0.6 and wrong with probability 0.4; each right call gains 1 unit and each wrong call loses 1 unit, independently. Find the mean, variance and standard deviation of the total gain after 100 days and after 400 days, and compare the drift with the spread. Then a bank's 1-day 99 % value at risk is 4 million and daily changes in its book are independent: estimate its 10-day VaR.

1. $E[S_{100}] = 100 \times (2 \times 0.6 - 1) = 20$
   *Why:* each day gains $0.6 - 0.4 = 0.2$ on average.
2. $\operatorname{Var}(S_{100}) = 4 \times 100 \times 0.6 \times 0.4 = 96$, $\operatorname{SD}(S_{100}) = \sqrt{96} \approx 9.80$
   *Why:* one day has variance $4p(1 - p) = 0.96$, a little less than 1 because the outcome is a little more predictable than a fair coin.
3. $20 \pm 2 \times 9.80$ gives about $0.40$ to $39.60$
   *Why:* about 95 % of outcomes lie within 2 standard deviations of the mean. The band only just stays above 0, so even a fund with a genuine 60 % hit rate will now and then show a loss over 100 days.
4. $E[S_{400}] = 80$, $\operatorname{SD}(S_{400}) = \sqrt{4 \times 400 \times 0.24} \approx 19.60$; $E/\operatorname{SD}$ goes from $20/9.80 \approx 2.04$ to $80/19.60 \approx 4.08$
   *Why:* four times as many days multiply the drift by 4 but the spread only by $\sqrt{4} = 2$, so skill (or a positive expected return) shows more clearly over longer periods.
5. $\text{VaR}_{10} = \sqrt{10} \times 4 \approx 12.65$ million, not $10 \times 4 = 40$ million
   *Why:* the variance of 10 independent daily changes is 10 times the daily variance, so the standard deviation, and with normal changes any VaR that is a fixed number of standard deviations, grows by $\sqrt{10} \approx 3.16$.

```verify
p = 0.6
m100 = 100*(2*p - 1)
assert abs(m100 - 20) < 1e-12
v100 = 4*100*p*(1 - p)
assert abs(v100 - 96) < 1e-9
s100 = sqrt(v100)
assert abs(s100 - 9.80) < 0.005
assert abs(4*p*(1 - p) - 0.96) < 1e-12
assert abs(m100 - 2*s100 - 0.40) < 0.005
assert abs(m100 + 2*s100 - 39.60) < 0.005
# second route: the binomial count of right calls, U ~ Bin(100, 0.6), and S = 2U - 100
assert abs(2*100*p - 100 - m100) < 1e-12
assert abs(4*100*p*(1 - p) - v100) < 1e-12
m400 = 400*(2*p - 1)
s400 = sqrt(4*400*p*(1 - p))
assert abs(m400 - 80) < 1e-9
assert abs(s400 - 19.60) < 0.005
assert abs(m100/s100 - 2.04) < 0.005
assert abs(m400/s400 - 4.08) < 0.005
assert abs(s400/s100 - 2) < 1e-12
var10 = sqrt(10)*4
assert abs(var10 - 12.65) < 0.005
assert abs(sqrt(10*4^2) - var10) < 1e-12
assert abs(sqrt(10) - 3.16) < 0.005
```

### Example 3 (hard): a share price as geometric Brownian motion
A share costs 100 today. Its price follows geometric Brownian motion with expected growth rate $\mu = 0.08$ and volatility $\sigma = 0.2$ per year. Find the distribution of the log return over 4 years, the probability that the price is above 100 after 4 years, the median and the expected price after 4 years, and the probability that the price has at least doubled.

1. $\ln\dfrac{P(4)}{100} = (0.08 - \tfrac12 \times 0.2^2) \times 4 + 0.2\,W(4) = 0.24 + 0.2\,W(4)$
   *Why:* in geometric Brownian motion the log price is a Brownian motion with drift $\mu - \tfrac12\sigma^2 = 0.06$ per year.
2. Mean $0.24$, standard deviation $0.2\sqrt{4} = 0.4$, so $\ln\dfrac{P(4)}{100} \sim N(0.24,\; 0.16)$
   *Why:* $W(4) \sim N(0, 4)$, so $0.2\,W(4)$ has variance $0.04 \times 4 = 0.16$ and standard deviation $0.4$.
3. $P\big(P(4) > 100\big) = P\big(\text{log return} > 0\big) = 1 - \Phi\!\left(\dfrac{0 - 0.24}{0.4}\right) = 1 - \Phi(-0.6) = \Phi(0.6) \approx 0.7257$
   *Why:* the price is above 100 exactly when the log return is positive; standardise and use the symmetry of the normal curve.
4. Median $= 100\,e^{0.24} \approx 127.12$; mean $= 100\,e^{0.08 \times 4} = 100\,e^{0.32} \approx 137.71$
   *Why:* half of the log returns are below their mean 0.24, so half of the prices are below $100e^{0.24}$. The expected price grows at the full rate $\mu$ because the rare large gains pull the average above the median.
5. $P\big(P(4) \ge 200\big) = 1 - \Phi\!\left(\dfrac{\ln 2 - 0.24}{0.4}\right) \approx 1 - \Phi(1.13) = 1 - 0.8708 = 0.1292$
   *Why:* doubling means a log return of at least $\ln 2 \approx 0.6931$; $z \approx 1.1329$, rounded to 1.13 for the table (with $z$ unrounded the answer is 0.1286). About one share in eight doubles within 4 years, even though the expected price rises by less than 40 %.

```verify
mu = 0.08; s = 0.2; t = 4
d = (mu - 0.5*s^2)*t
assert abs(d - 0.24) < 1e-12
assert abs(mu - 0.5*s^2 - 0.06) < 1e-12
sd = s*sqrt(t)
assert abs(sd - 0.4) < 1e-12
assert abs(sd^2 - 0.16) < 1e-12
Phi(z) = 0.5*(1 + erf(z/sqrt(2)))
z0 = (0 - d)/sd
assert abs(z0 + 0.6) < 1e-12
assert abs(1 - Phi(z0) - 0.7257) < 0.00005
assert abs(Phi(0.6) - 0.7257) < 0.00005
assert abs(100*exp(d) - 127.12) < 0.005
assert abs(100*exp(mu*t) - 137.71) < 0.005
# second route: the mean of a lognormal is exp(m + v/2) with m = 0.24 and v = 0.16
assert abs(100*exp(d + sd^2/2) - 100*exp(0.32)) < 1e-9
assert abs(log(2) - 0.6931) < 0.00005
z2 = (log(2) - d)/sd
assert abs(z2 - 1.1329) < 0.00005
assert abs(Phi(1.13) - 0.8708) < 0.00005
assert abs(1 - 0.8708 - 0.1292) < 1e-12
assert abs(1 - Phi(z2) - 0.1286) < 0.00005
```

## Common mistakes
- Multiplying a daily standard deviation or VaR by the number of days $T$ instead of by $\sqrt{T}$ (LINEAR_TIME).
- Dividing by $\sqrt{T}$, the rule for the standard deviation of an average, when the question is about a total change (DIVIDED_BY_ROOT).
- Stopping at the variance $T\sigma^2$ and forgetting the square root (VARIANCE_NOT_SD).
- Using $\binom{n}{k}$ for the number of paths to level $k$; the number of up-steps is $(n + k)/2$ (LEVEL_AS_UPS).
- Giving $(\tfrac12)^n$, the probability of one particular path, as the probability of a level that many paths reach (ONE_PATH).
- Treating all $n + 1$ end points as equally likely, $1/(n + 1)$ each; levels near the start are far more likely (EQUAL_LEVELS).
- Standardising Brownian motion with drift around its starting value instead of its mean $x_0 + \mu T$ (NO_DRIFT).
- Reporting $\Phi(z)$ when the question asks for the chance of ending above the level, or $1 - \Phi(z)$ for below (WRONG_TAIL).
- Forgetting parity: after an even number of $\pm 1$ steps the walk is always at an even level, so an odd level has probability 0.
- The gambler's fallacy: after a run of rises a random walk is not "due" a fall. The steps are independent, so the past run changes the level but not the chances of the next step.
- Swapping the two answers of gambler's ruin: the player who starts closer to the target is the one more likely to reach it, $a/(a + b)$ for a start $a$ and a target $a + b$.
- Treating the expected price of geometric Brownian motion as the typical price: the median $P(0)e^{(\mu - \sigma^2/2)t}$ is lower than the mean $P(0)e^{\mu t}$, and most paths end below the mean.

## Practice
- `square-root-time-risk` (difficulty 1): scale a 1-day VaR or a daily volatility to $T$ days with $\sigma\sqrt{T}$; distractors LINEAR_TIME, DIVIDED_BY_ROOT, VARIANCE_NOT_SD.
- `random-walk-level-probability` (difficulty 2): the probability that a symmetric $\pm 1$ walk (a share price, fair bets, an exchange rate) is at level $k$ after $n$ steps, $\binom{n}{(n+k)/2}/2^n$, to 4 decimal places; distractors LEVEL_AS_UPS, ONE_PATH, EQUAL_LEVELS.
- `brownian-drift-level-probability` (difficulty 3): the probability that Brownian motion with drift (a firm's cash reserve, an index's log return) ends above or below a level, $1 - \Phi\big((c - x_0 - \mu T)/(\sigma\sqrt{T})\big)$ or $\Phi(\cdot)$; distractors NO_DRIFT, LINEAR_TIME, WRONG_TAIL.

## Real world
- Risk management: banks and regulators turn 1-day VaR into 10-day VaR with the square-root-of-time rule, and fund managers quote annual volatility as daily volatility times $\sqrt{250}$ or so. The rule assumes independent days; when bad days cluster, it understates risk.
- Exchange rates and share prices: simple "tomorrow equals today" random-walk forecasts of major exchange rates have proved hard to beat with economic models over horizons up to about a year (see EM06), which is what the efficient-markets view predicts.
- Option pricing: the Black–Scholes model assumes the share price follows geometric Brownian motion, and its binomial version replaces Brownian motion by a random walk with up and down steps (SP04).
- Corporate finance and macroeconomics: firms' cash holdings, a central bank's foreign reserves and the real value of a pension fund are often modelled as Brownian motion with drift, to estimate the chance that they fall below a safety level within a given time.

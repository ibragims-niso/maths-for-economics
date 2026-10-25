---
id: ST103
title: Random variables, expectation and variance
block: ST1
coreYear: 1
prerequisites: [ST102]
estMinutes: 45
status: draft
economicUses:
  - Expected return and risk (standard deviation) of an investment
  - Expected profit when demand is uncertain
  - Setting insurance premiums from the expected loss
  - Valuing lottery tickets and other gambles
  - Comparing projects across bad, normal and good scenarios
searchTerms:
  - "Random variable"
  - "Expected value"
  - "Expectation and variance"
generators: [expected-value-discrete, variance-discrete-risk, profit-variance-linear-transform]
widgets: [investment-risk-bars]
mistakeCodes:
  SIMPLE_AVERAGE:
    label: Averaged the outcomes without weights
    explanation: Adding the outcomes and dividing by how many there are treats them as equally likely. Weight each outcome by its probability instead, E[X] = Σ x·p(x).
  NO_PROBABILITIES:
    label: Added the outcomes and ignored the probabilities
    explanation: The sum of the possible values is not an average of anything. Multiply each value by its probability before adding.
  MOST_LIKELY:
    label: Gave the most likely outcome
    explanation: The outcome with the highest probability is the mode, not the expected value. The expected value is the probability-weighted average of all outcomes and need not be a possible outcome at all.
  NO_MEAN_SQUARED:
    label: Forgot to subtract the square of the mean
    explanation: E[X²] alone is not the variance. Subtract (E[X])², so Var(X) = E[X²] − (E[X])²; only when the mean is 0 are the two equal.
  REVERSED_ORDER:
    label: Subtracted the wrong way round
    explanation: The shortcut is E[X²] − (E[X])², not (E[X])² − E[X²]. A variance can never be negative; a negative answer means the order was reversed.
  NO_SQUARE_ROOT:
    label: Gave the variance instead of the standard deviation
    explanation: The standard deviation is the square root of the variance, σ = √Var(X). Take the square root to get back to the units of X.
  UNWEIGHTED:
    label: Averaged the squared deviations without weights
    explanation: Dividing the sum of squared deviations by the number of outcomes treats them as equally likely. Weight each squared deviation by its probability, Var(X) = Σ (x − μ)²·p(x).
  NOT_SQUARED:
    label: Multiplied the variance by a, not by a²
    explanation: Multiplying X by a stretches every distance from the mean by a, so squared distances grow by a². Var(aX + b) = a²·Var(X); it is the standard deviation that is multiplied by |a|.
  CONSTANT_KEPT:
    label: Let the constant change the variance
    explanation: Adding or subtracting a constant, such as a fixed cost, shifts every outcome by the same amount and leaves the spread unchanged. The constant affects the mean but not the variance.
  UNTRANSFORMED:
    label: Gave the variance of sales, not of profit
    explanation: The question asks about profit π = aX − c. After finding Var(X), multiply by a² to get Var(π).
resources:
  - { title: "Introductory Statistics 2e, 4.1 Probability Distribution Function (PDF) for a Discrete Random Variable (OpenStax)", url: "https://openstax.org/books/introductory-statistics-2e/pages/4-1-probability-distribution-function-pdf-for-a-discrete-random-variable", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Introductory Statistics 2e, 4.2 Mean or Expected Value and Standard Deviation (OpenStax)", url: "https://openstax.org/books/introductory-statistics-2e/pages/4-2-mean-or-expected-value-and-standard-deviation", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Introductory Statistics 2e, 5.2 The Uniform Distribution (OpenStax)", url: "https://openstax.org/books/introductory-statistics-2e/pages/5-2-the-uniform-distribution", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
Most economic decisions are made before the outcome is known. An investor buying shares does not know next year's return; a bakery bakes bread before it knows how many customers will come; an insurer sells a policy before it knows whether the house will burn down. Economists describe each of these uncertain quantities with a *random variable* and summarise it with two numbers: the **expected value** (how well things go on average) and the **variance** or **standard deviation** (how far the outcome can stray from that average, which is what finance calls *risk*).

## Intuition
A random variable is a number whose value depends on chance: the return on a share, the number of loaves sold tomorrow, the payout on an insurance policy. Its **distribution** lists the values it can take and how likely each one is.

The **expected value** is the average you would get if the situation repeated many times. A lottery ticket that costs 2 and pays 1000 with probability 0.001 pays $1000 \times 0.001 = 1$ on average, so the buyer expects to lose 1 per ticket. An insurer facing a 0.02 chance of a 15000 loss on a house expects to pay out $0.02 \times 15{,}000 = 300$ per policy; that expected loss is the starting point for the premium.

The average alone hides something important. A savings account that pays 6 % for sure and a share that pays −10 %, 5 % or 20 % can have similar averages but feel very different to own. The **variance** measures how spread out the possible outcomes are around the average, and its square root, the **standard deviation**, puts that spread back into the units of the outcome. Two investments with the same expected return but different standard deviations carry different risk.

## Definition and formulas
**Random variable.** A rule $X$ that gives a number to each outcome of a random experiment (the sample space of ST102). $X$ is **discrete** if it takes a list of separate values $x_1, x_2, \dots$, and **continuous** if it can take any value in an interval.

**Probability mass function (pmf)** of a discrete $X$:
$$p(x) = P(X = x), \qquad p(x) \ge 0, \qquad \sum_x p(x) = 1$$

**Cumulative distribution function (cdf)**, for any random variable:
$$F(x) = P(X \le x), \qquad \text{for a discrete } X:\ F(x) = \sum_{t \le x} p(t)$$
$F$ rises from 0 to 1 and never falls; for a discrete $X$ it is a staircase that jumps by $p(x)$ at each value. Probabilities of ranges follow from it: $P(a < X \le b) = F(b) - F(a)$.

**Expected value (mean)**, written $E[X]$ or $\mu$:
$$E[X] = \sum_x x\,p(x)$$
For a function of $X$, weight the function's values by the same probabilities:
$$E[g(X)] = \sum_x g(x)\,p(x), \qquad \text{for example } E[X^2] = \sum_x x^2\,p(x)$$
In general $E[g(X)] \ne g(E[X])$; for instance $E[X^2]$ is not $(E[X])^2$.

**Linearity.** For constants $a$ and $b$:
$$E[aX + b] = a\,E[X] + b$$

**Variance and standard deviation.** The variance is the probability-weighted average squared distance from the mean:
$$\operatorname{Var}(X) = E\big[(X - \mu)^2\big] = \sum_x (x - \mu)^2\,p(x) = E[X^2] - (E[X])^2, \qquad \sigma = \sqrt{\operatorname{Var}(X)}$$
The variance is never negative and is 0 only when $X$ cannot vary. It is in squared units (for returns in %, squared percentage points); the standard deviation $\sigma$ is in the units of $X$.

**Linear transformation.** Adding a constant shifts the distribution without changing its spread; multiplying by $a$ stretches it:
$$\operatorname{Var}(aX + b) = a^2 \operatorname{Var}(X), \qquad \sigma_{aX + b} = |a|\,\sigma_X$$

**Continuous random variables (briefly).** A continuous $X$ is described by a **density** $f(x) \ge 0$ with $\int_{-\infty}^{\infty} f(x)\,dx = 1$. Probabilities are areas under the density (C113): $P(a \le X \le b) = \int_a^b f(x)\,dx$, so $P(X = x) = 0$ for any single value, and $F(x) = \int_{-\infty}^{x} f(t)\,dt$. Sums become integrals:
$$E[X] = \int x\,f(x)\,dx, \qquad E[X^2] = \int x^2 f(x)\,dx, \qquad \operatorname{Var}(X) = E[X^2] - (E[X])^2$$
The **uniform distribution** on $[a, b]$ spreads probability evenly: $f(x) = \dfrac{1}{b - a}$ for $a \le x \le b$ and 0 elsewhere, with
$$E[X] = \frac{a + b}{2}, \qquad \operatorname{Var}(X) = \frac{(b - a)^2}{12}$$

Named families of distributions (binomial, Poisson, normal) follow in ST104 and ST105; two random variables at once (covariance and correlation) in ST201.

## Interactive
::widget{id="investment-risk-bars"}

The bars are the three possible returns of an investment next year: −10 % in a bad year, 5 % in a normal year and a good-year return you choose. Each bar's height is its probability. Move **Chance of a bad year** and **Chance of a normal year**; the good year gets whatever is left, so the three probabilities always add up to 1. Move **Return in a good year** to pull the best outcome further out. The dot on the axis is the expected return, the point where the bars would balance, and the gold line above it reaches one standard deviation either side. Check: at the start (0.2, 0.5 and 20 %) the panel shows an expected return of 6.5 %, a variance of 110.25 and a standard deviation of 10.5 %, as in Examples 1 and 2. Now set the bad-year chance to 0 and the normal-year chance to 1: only one outcome is left, and the standard deviation drops to 0.

## Worked examples

### Example 1 (easy): expected return of an investment
A share's return next year is −10 % in a bad year (probability 0.2), 5 % in a normal year (probability 0.5) and 20 % in a good year (probability 0.3). Find the expected return and the chance of losing money. A savings account pays 6 % for sure; which has the higher expected return?

1. $0.2 + 0.5 + 0.3 = 1$
   *Why:* the three scenarios cover everything that can happen, so their probabilities must add up to 1.
2. $(-10)(0.2) = -2,\quad 5(0.5) = 2.5,\quad 20(0.3) = 6$
   *Why:* each return counts in proportion to its probability.
3. $E[X] = -2 + 2.5 + 6 = 6.5\%$
   *Why:* the expected value is the sum of the weighted outcomes. The simple average of the three returns, $(-10 + 5 + 20)/3 = 5\%$, would treat the scenarios as equally likely.
4. $F(-10) = 0.2,\quad F(5) = 0.7,\quad F(20) = 1$, so $P(X < 0) = F(-10) = 0.2$
   *Why:* the cdf adds up the probabilities from the left; the only negative return is −10 %.
5. $6.5\% > 6\%$: on 10000 invested the share is expected to earn 650, the account earns 600 for sure.
   *Why:* the share wins on average, but in one year out of five it loses money; Example 2 measures that risk.

```verify
x = [-10, 5, 20]; p = [0.2, 0.5, 0.3]
assert abs(sum(p) - 1) < 1e-12
t = x .* p
assert abs(t[1] + 2) < 1e-12 and abs(t[2] - 2.5) < 1e-12 and abs(t[3] - 6) < 1e-12
EX = sum(t)
assert abs(EX - 6.5) < 1e-12
assert abs(mean(x) - 5) < 1e-12
F1 = p[1]; F2 = p[1] + p[2]; F3 = sum(p)
assert abs(F1 - 0.2) < 1e-12 and abs(F2 - 0.7) < 1e-12 and abs(F3 - 1) < 1e-12
assert abs(10000*EX/100 - 650) < 1e-9
assert abs(10000*0.06 - 600) < 1e-9
```

### Example 2 (medium): the risk of the same investment
For the share in Example 1, find the variance and the standard deviation of the return. How does its risk compare with the savings account?

1. $E[X^2] = (-10)^2(0.2) + 5^2(0.5) + 20^2(0.3) = 20 + 12.5 + 120 = 152.5$
   *Why:* square each return first, then weight it by its probability.
2. $\operatorname{Var}(X) = 152.5 - 6.5^2 = 152.5 - 42.25 = 110.25$
   *Why:* the shortcut $E[X^2] - (E[X])^2$ avoids working out every deviation from the mean.
3. Check with the definition: deviations $-16.5,\ -1.5,\ 13.5$, so $(-16.5)^2(0.2) + (-1.5)^2(0.5) + 13.5^2(0.3) = 54.45 + 1.125 + 54.675 = 110.25$
   *Why:* both formulas measure the same thing, the probability-weighted average squared distance from 6.5.
4. $\sigma = \sqrt{110.25} = 10.5\%$
   *Why:* the variance is in squared percentage points; the square root brings it back to per cent.
5. The savings account has $\sigma = 0$. The share offers 0.5 percentage points more on average but a standard deviation of 10.5 percentage points.
   *Why:* a sure return does not vary, so its variance is 0. Whether the extra half point is worth the risk depends on the investor's attitude to risk (SP02).

```verify
x = [-10, 5, 20]; p = [0.2, 0.5, 0.3]
EX = sum(x .* p)
EX2 = sum((x .^ 2) .* p)
assert abs(EX2 - 152.5) < 1e-9
assert abs(EX^2 - 42.25) < 1e-9
V = EX2 - EX^2
assert abs(V - 110.25) < 1e-9
d = x - EX
assert abs(d[1] + 16.5) < 1e-12 and abs(d[2] + 1.5) < 1e-12 and abs(d[3] - 13.5) < 1e-12
w = (d .^ 2) .* p
assert abs(w[1] - 54.45) < 1e-9 and abs(w[2] - 1.125) < 1e-9 and abs(w[3] - 54.675) < 1e-9
assert abs(sum(w) - V) < 1e-9
assert abs(sqrt(V) - 10.5) < 1e-12
assert abs((EX - 6) - 0.5) < 1e-12
```

### Example 3 (hard): profit when demand is uniform
A bakery's daily sales $X$ are equally likely to be anywhere between 100 and 200 loaves, so treat $X$ as uniform on $[100, 200]$. Each loaf earns a margin of 3 and fixed costs are 250 a day, so profit is $\pi = 3X - 250$. Find the expected value, variance and standard deviation of daily profit.

1. $f(x) = \dfrac{1}{200 - 100} = 0.01$ for $100 \le x \le 200$, and $\displaystyle\int_{100}^{200} 0.01\,dx = 1$
   *Why:* a uniform density is flat, and its height is fixed by the total area being 1.
2. $E[X] = \displaystyle\int_{100}^{200} 0.01\,x\,dx = 0.01\left[\frac{x^2}{2}\right]_{100}^{200} = 0.01 \cdot 15{,}000 = 150$
   *Why:* for a continuous variable the sum $\sum x\,p(x)$ becomes an integral. As expected, the mean is the midpoint $(100 + 200)/2$.
3. $E[X^2] = \displaystyle\int_{100}^{200} 0.01\,x^2\,dx = 0.01\left[\frac{x^3}{3}\right]_{100}^{200} = 0.01 \cdot 2{,}333{,}333.33 = 23{,}333.33$
   *Why:* $E[g(X)]$ weights $g(x) = x^2$ by the density.
4. $\operatorname{Var}(X) = 23{,}333.33 - 150^2 = 833.33$, which equals $\dfrac{(200 - 100)^2}{12}$
   *Why:* the shortcut formula works for continuous variables too, and it confirms the uniform formula.
5. $E[\pi] = 3(150) - 250 = 200$, $\ \operatorname{Var}(\pi) = 3^2 \cdot 833.33 = 7{,}500$, $\ \sigma_\pi = \sqrt{7{,}500} = 86.60$
   *Why:* expectation is linear, so the fixed cost comes straight off the mean. It does not change the spread, while the margin of 3 stretches every distance by 3 and the variance by 9. Multiplying by 3 instead of 9 would give 2500, far too small.

```verify
a = 100; b = 200
f = 1/(b - a)
assert abs(f*(b - a) - 1) < 1e-12
EX = f*(b^2 - a^2)/2
assert abs(f - 0.01) < 1e-12
assert abs((b^2 - a^2)/2 - 15000) < 1e-9
assert abs(EX - 150) < 1e-9
EX2 = f*(b^3 - a^3)/3
assert abs((b^3 - a^3)/3 - 2333333.33) < 0.01
assert abs(EX2 - 23333.33) < 0.01
# midpoint sums agree with the integrals
xs = 100.05:0.1:199.95
assert abs(mean(xs) - EX) < 1e-6
assert abs(mean(xs .^ 2) - EX2) < 0.01
V = EX2 - EX^2
assert abs(V - 833.33) < 0.01
assert abs(V - (b - a)^2/12) < 1e-6
assert abs(3*EX - 250 - 200) < 1e-9
Vp = 3^2*V
assert abs(Vp - 7500) < 1e-6
assert abs(sqrt(Vp) - 86.60) < 0.005
assert abs(3*V - 2500) < 1e-6
```

## Common mistakes
- Averaging the outcomes without weighting them by their probabilities (SIMPLE_AVERAGE).
- Adding the outcomes and forgetting the probabilities altogether (NO_PROBABILITIES).
- Giving the most likely outcome as the expected value (MOST_LIKELY).
- Stopping at $E[X^2]$ and forgetting to subtract the square of the mean (NO_MEAN_SQUARED).
- Working out $(E[X])^2 - E[X^2]$, which gives a negative "variance" (REVERSED_ORDER).
- Giving the variance when the standard deviation was asked for (NO_SQUARE_ROOT).
- Dividing the squared deviations by the number of outcomes instead of weighting them by their probabilities (UNWEIGHTED).
- Multiplying the variance by $a$ instead of $a^2$ after a change of scale (NOT_SQUARED).
- Letting a fixed cost or other constant change the variance (CONSTANT_KEPT).
- Reporting the variance of sales when the question asks about profit (UNTRANSFORMED).
- Assuming $E[g(X)] = g(E[X])$: the expected square is not the square of the expected value, and the expected profit of a non-linear rule is not the rule applied to expected sales.
- Using probabilities that do not add up to 1, or a density whose total area is not 1.
- Reading a density value as a probability: for a continuous variable, probabilities are areas under $f$, and $P(X = x) = 0$ for any single value.

## Practice
- `expected-value-discrete` (difficulty 1): expected return, profit or insurance payout of a distribution with 3–4 outcomes; distractors SIMPLE_AVERAGE, NO_PROBABILITIES, MOST_LIKELY.
- `variance-discrete-risk` (difficulty 2): variance or standard deviation of a return or profit with 3–4 outcomes; distractors NO_MEAN_SQUARED, REVERSED_ORDER, NO_SQUARE_ROOT, UNWEIGHTED.
- `profit-variance-linear-transform` (difficulty 3): variance of daily profit $\pi = aX - c$ from the distribution of sales $X$, using $\operatorname{Var}(aX + b) = a^2\operatorname{Var}(X)$; distractors NOT_SQUARED, CONSTANT_KEPT, UNTRANSFORMED, NO_MEAN_SQUARED.

## Real world
- Investing: fund reports and investment platforms describe assets by their average return and their volatility, which is the standard deviation of returns. Mean and standard deviation are the two inputs of mean–variance portfolio choice, extended to several assets with covariance in ST201.
- Insurance: the fair premium for a policy is its expected payout; actual premiums add a margin for costs, profit and uncertainty. Pooling many independent policies makes the insurer's average payout per policy predictable (ST206).
- Lotteries: the expected prize per ticket is below the ticket price, and the gap funds the organiser and any good causes. People still buy tickets, one reason economists model choices with expected utility rather than expected money (SP02).
- Business planning: firms and governments appraise projects with bad, base and good scenarios, weight them by probabilities to get an expected profit or net present value, and use the spread across scenarios as a measure of how risky the project is.

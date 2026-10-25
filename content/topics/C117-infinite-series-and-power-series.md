---
id: C117
title: Infinite series and power series
block: C1
coreYear: 1
prerequisites: [F08, C111]
estMinutes: 50
status: draft
economicUses:
  - "Present value of perpetual streams: land rents, perpetual bonds, shares"
  - "Spending and money multipliers as infinite sums, 1 + c + c² + … = 1/(1 − c)"
  - "Continuously compounded returns from the series of ln(1 + r)"
  - Why a stream that grows at least as fast as the discount rate has no finite value
  - Infinite-horizon models that discount the future with a factor β < 1
searchTerms:
  - "Number series and their convergence"
  - "Necessary condition for convergence of a series"
  - "Convergence tests for positive series"
  - "Comparison test"
  - "D'Alembert's ratio test"
  - "Cauchy's root test"
  - "Alternating series, Leibniz test"
  - "Absolutely and conditionally convergent series"
  - "Functional series and uniform convergence"
  - "Weierstrass test"
  - "Abel's theorem"
  - "Radius and interval of convergence"
  - "Expanding functions in power series"
  - "Taylor series"
  - "Maclaurin series"
generators: [infinite-geometric-series-sum, maclaurin-partial-sum-estimate, power-series-radius]
widgets: [geometric-partial-sums]
mistakeCodes:
  START_INDEX:
    label: Started the sum at the wrong term
    explanation: In a/(1 − q) the first term a is the term where the sum starts. The sum from t = 1 of C/(1 + r)ᵗ starts with C/(1 + r), not C, while a sum from n = 0 includes the term a·q⁰ = a. Check the lower limit of Σ before using the formula.
  FIRST_TERM_ONLY:
    label: Gave only the first term
    explanation: The question asks for the sum of all the terms. The first term is only the start; divide it by 1 − q to add up the whole infinite series.
  RATIO_SIGN:
    label: Divided by 1 + q
    explanation: The sum of an infinite geometric series is a/(1 − q), one minus the ratio. Dividing by 1 + q gives a much smaller number that is not the sum of this series.
  EXACT_VALUE:
    label: Gave the calculator value, not the estimate
    explanation: The question asks for the estimate from the stated number of terms of the series. Add exactly those terms; the calculator value is only a check of how good the estimate is.
  TERM_COUNT:
    label: Added one term too many
    explanation: Count the terms from the first one. The first 3 terms of eˣ are 1, x and x²/2!, and the first 3 terms of ln(1 + x) are x, −x²/2 and x³/3. Stop when you have as many terms as the question asks for.
  NO_FACTORIAL:
    label: Left out the factorials
    explanation: The Maclaurin series of eˣ is the sum of xᵏ/k!. Without dividing by k! you get 1 + x + x² + …, the geometric series of 1/(1 − x), which is a different function.
  ALL_PLUS:
    label: Lost the minus signs
    explanation: The signs in ln(1 + x) = x − x²/2 + x³/3 − … alternate, and in eˣ at a negative x the odd powers are negative. Adding every term as positive gives too large a value.
  RECIPROCAL_RADIUS:
    label: Gave 1/R instead of R
    explanation: The ratio test gives a limit L that depends on |x − c|; set L < 1 and solve for |x − c|. If the coefficients shrink like 1/kⁿ the radius is k, and if they grow like kⁿ it is 1/k.
  ENDPOINT_AS_RADIUS:
    label: Gave an end point, not the radius
    explanation: The radius R is a distance. The series converges for |x − c| < R, which is the interval from c − R to c + R; c + R is a point on the number line, not the radius.
  FORGOT_SQUARE_ROOT:
    label: Forgot the square root
    explanation: When the series contains x²ⁿ, the ratio test gives x²/k < 1, which means |x| < √k. The radius is √k, not k.
  TERMS_TO_ZERO:
    label: Thought terms going to 0 is enough
    explanation: If the terms do not go to 0 the series diverges, but terms that go to 0 do not prove that it converges. The harmonic series 1 + 1/2 + 1/3 + … diverges although 1/n → 0. Use a test such as comparison or the ratio test.
resources:
  - { title: "Calculus Volume 2, 5.2 Infinite Series (OpenStax)", url: "https://openstax.org/books/calculus-volume-2/pages/5-2-infinite-series", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Calculus Volume 2, 5.6 Ratio and Root Tests (OpenStax)", url: "https://openstax.org/books/calculus-volume-2/pages/5-6-ratio-and-root-tests", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Calculus Volume 2, 6.1 Power Series and Functions (OpenStax)", url: "https://openstax.org/books/calculus-volume-2/pages/6-1-power-series-and-functions", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
A plot of farmland can be rented out every year for as long as anyone can foresee. What is it worth today? Its price is the sum of infinitely many discounted rents, and that sum is finite only under a condition: the rent must not grow as fast as the discount rate. The same kind of sum appears in the spending multiplier, where one injection of money creates round after round of spending, and in every model that discounts a whole future with no end date. Infinite sums also run in the background of finance: a calculator finds $e^{0.05}$ or $\ln(1.06)$ by adding up terms of a series. This topic says when an infinite sum has a value, how to test it, and how power series turn functions such as $e^x$ and $\ln(1 + x)$ into sums you can work out by hand.

## Intuition
You cannot add infinitely many numbers one after another, but you can add the first $n$ of them and watch what happens as $n$ grows. If these running totals, the **partial sums**, settle down at a fixed number, that number is the sum of the series and the series **converges**. If they grow without limit, or keep jumping about, the series **diverges**.

The terms must shrink towards 0, otherwise each new term pushes the total by a sizeable amount and it can never settle. But shrinking is not enough. In the harmonic series $1 + \tfrac12 + \tfrac13 + \tfrac14 + \dots$ group the terms: $\tfrac13 + \tfrac14 > \tfrac12$, then $\tfrac15 + \dots + \tfrac18 > \tfrac12$, then the next eight terms add more than $\tfrac12$, and so on for ever. There are infinitely many such groups, so the total passes any number you name: the terms shrink too slowly.

What makes a series converge is how fast its terms shrink. Geometric terms $q^n$ with $|q| < 1$ shrink fast, and so does anything that eventually shrinks at least as fast as a geometric series. That is the idea behind the comparison and ratio tests.

A **power series** $a_0 + a_1x + a_2x^2 + \dots$ is a series whose terms depend on $x$: a polynomial that never stops. Taylor polynomials (C111) are its partial sums, so letting the order grow without end turns them into a power series. For each $x$ it is an ordinary series that converges or not, and the values of $x$ where it converges always form an interval around the centre.

## Definition and formulas
**Series and partial sums.** For the series $\sum_{n=1}^{\infty} a_n = a_1 + a_2 + a_3 + \dots$ the partial sums are $S_n = a_1 + \dots + a_n$. If $S_n \to S$ as $n \to \infty$ (a limit as in C101), the series converges and $S$ is its sum; otherwise it diverges.

**$n$-th term test.** If $a_n$ does not tend to 0, the series diverges. If $a_n \to 0$, the test tells you nothing.

**Geometric series** (F08): for $|q| < 1$,
$$\sum_{n=0}^{\infty} a\,q^n = a + aq + aq^2 + \dots = \frac{a}{1 - q},$$
where $a$ is the first term, whatever index the sum starts at. For $|q| \ge 1$ it diverges.

**$p$-series:** $\displaystyle\sum_{n=1}^{\infty} \frac{1}{n^p}$ converges when $p > 1$ and diverges when $p \le 1$. The case $p = 1$ is the harmonic series.

**Comparison test.** Suppose $0 \le a_n \le b_n$ for every $n$. If $\sum b_n$ converges, so does $\sum a_n$; if $\sum a_n$ diverges, so does $\sum b_n$.

**Ratio test** (d'Alembert's test). Let $L = \lim_{n\to\infty} \left|\dfrac{a_{n+1}}{a_n}\right|$. If $L < 1$ the series converges; if $L > 1$ it diverges; if $L = 1$ the test gives no answer (both $\sum 1/n$ and $\sum 1/n^2$ have $L = 1$).

**Root test** (Cauchy's test). Let $L = \lim_{n\to\infty} \sqrt[n]{|a_n|}$. The verdicts are the same as for the ratio test: converges if $L < 1$, diverges if $L > 1$, no answer if $L = 1$. It suits terms that are $n$-th powers, such as $\left(\dfrac{n}{2n + 1}\right)^n$, where $\sqrt[n]{a_n} = \dfrac{n}{2n + 1} \to \tfrac12$, so the series converges.

**Working with convergent series.** If $\sum a_n = A$ and $\sum b_n = B$, then $\sum (a_n \pm b_n) = A \pm B$ and $\sum k a_n = kA$. Adding, removing or changing finitely many terms changes the sum but not whether the series converges, so only the tail matters for convergence.

**Alternating series** $b_1 - b_2 + b_3 - \dots$ with $b_n > 0$: if the $b_n$ decrease and tend to 0, the series converges, and stopping after $n$ terms makes an error smaller than the first term left out, $b_{n+1}$.

**Absolute and conditional convergence.** If $\sum |a_n|$ converges, then $\sum a_n$ converges too; it **converges absolutely**. A series that converges while $\sum |a_n|$ diverges **converges conditionally**, like $1 - \tfrac12 + \tfrac13 - \tfrac14 + \dots$.

**Power series** about the centre $c$:
$$\sum_{n=0}^{\infty} a_n (x - c)^n = a_0 + a_1(x - c) + a_2(x - c)^2 + \dots$$
There is a **radius of convergence** $R$ (possibly 0 or $\infty$): the series converges absolutely for $|x - c| < R$ and diverges for $|x - c| > R$. The ratio test finds it: the ratio of neighbouring terms tends to $|x - c|\,\lim |a_{n+1}/a_n|$, so
$$R = \lim_{n\to\infty} \left|\frac{a_n}{a_{n+1}}\right| \quad\text{when this limit exists.}$$
At the two end points $x = c \pm R$ the ratio test gives $L = 1$, so check them separately; the **interval of convergence** is the set of all $x$ where the series converges. For $|x - c| < R$ a power series can be differentiated term by term, and the result has the same radius. Why the convergence region is always an interval: if a power series converges at some point $x_0$, it converges absolutely at every $x$ closer to the centre than $x_0$ (Abel's theorem).

**Series of functions.** A power series is one case of a **functional series** $\sum u_n(x)$, whose terms depend on $x$. It **converges pointwise** on a set if it converges at each $x$ there, and **uniformly** if one number of terms gives the required accuracy at every $x$ of the set at once. Uniform convergence is what allows a series of continuous functions to be added up into a continuous function, and to be integrated or differentiated term by term. The simplest check is the **Weierstrass test**: if $|u_n(x)| \le M_n$ for every $x$ in the set and $\sum M_n$ converges, the series converges uniformly there. For example, $\sum \dfrac{\cos(nx)}{n^2}$ converges uniformly on the whole line because $\left|\dfrac{\cos(nx)}{n^2}\right| \le \dfrac{1}{n^2}$.

**Taylor and Maclaurin series.** The Taylor series of $f$ about $c$ is $\displaystyle\sum_{n=0}^{\infty} \frac{f^{(n)}(c)}{n!}(x - c)^n$; about $c = 0$ it is the Maclaurin series. Its partial sums are the Taylor polynomials of C111. Three to know:

- $\dfrac{1}{1 - x} = 1 + x + x^2 + x^3 + \dots$, for $-1 < x < 1$
- $e^x = 1 + x + \dfrac{x^2}{2!} + \dfrac{x^3}{3!} + \dots$, for every $x$ ($R = \infty$)
- $\ln(1 + x) = x - \dfrac{x^2}{2} + \dfrac{x^3}{3} - \dfrac{x^4}{4} + \dots$, for $-1 < x \le 1$

For $e^x$ the ratio of neighbouring terms is $\dfrac{|x|}{n + 1} \to 0 < 1$ for every $x$. Inside the interval each series equals its function, so a few terms give its value: few when $x$ is close to the centre, many near the edge of the interval.

## Interactive
::widget{id="geometric-partial-sums"}

The graph shows the partial sums of the power series $1 + x + x^2 + \dots$ of $\dfrac{1}{1 - x}$, plotted against the number of terms $n$. Move **Ratio x** to choose the point and **Terms n** to choose how many terms are added. The panel shows the sum of $n$ terms, the limit $1/(1 - x)$ and the gap between them. Check: at $x = 0.8$ and $n = 10$ the panel shows 4.46, 5 and 0.54; move $n$ to 20 and the gap falls to 0.06, because every extra term multiplies the gap by 0.8. Now move $x$ to 1 or beyond: the terms no longer shrink, the sums climb without limit and the panel shows "none (diverges)". At $x = -1$ the sums jump between 1 and 0 for ever. The series converges only for $-1 < x < 1$, so its radius of convergence is 1.

## Worked examples

### Example 1 (easy): a rent for ever
A plot of farmland can be rented out for 6000 at the end of every year, for ever. The discount rate is 4 % a year. Write its present value as an infinite series and find it. What happens if the rent grows by 2 % a year, or by 4 % a year?

1. $PV = \dfrac{6{,}000}{1.04} + \dfrac{6{,}000}{1.04^2} + \dots = \displaystyle\sum_{t=1}^{\infty} \dfrac{6{,}000}{1.04^t}$, with first term $a = 5{,}769.23$ and ratio $q = \dfrac{1}{1.04} = 0.9615$
   *Why:* each rent is discounted once more than the one before, so the terms form a geometric series; the sum starts at $t = 1$, so the first term is already discounted.
2. $PV = \dfrac{6{,}000/1.04}{1 - 1/1.04} = \dfrac{6{,}000/1.04}{0.04/1.04} = \dfrac{6{,}000}{0.04} = 150{,}000$
   *Why:* $|q| < 1$, so the series converges to $a/(1 - q)$; the algebra simplifies to rent divided by the rate, the perpetuity formula of FM04.
3. The first 30 years add up to $103{,}752.20$, only 69 % of the total.
   *Why:* the partial sum $S_{30}$ falls short by the discounted value of all the rents after year 30, which is still large because the stream never ends.
4. With 2 % growth: $q = \dfrac{1.02}{1.04} = 0.9808$, so $PV = \dfrac{6{,}000/1.04}{1 - 1.02/1.04} = \dfrac{6{,}000}{1.04 - 1.02} = \dfrac{6{,}000}{0.02} = 300{,}000$
   *Why:* growth makes each term larger, so the ratio moves towards 1 and the value doubles; it is still below 1, so the series converges.
5. With 4 % growth: $q = \dfrac{1.04}{1.04} = 1$, every term equals $5{,}769.23$ and $S_n = 5{,}769.23\,n$ grows without limit.
   *Why:* the terms do not tend to 0, so the series diverges ($n$-th term test): a rent growing as fast as the discount rate has no finite present value.

```verify
C = 6000; r = 0.04
a = C/(1 + r)
q = 1/(1 + r)
assert abs(a - 5769.23) < 0.005
assert abs(q - 0.9615) < 0.00005
PV = a/(1 - q)
assert abs(PV - 150000) < 0.000001
assert abs(C/r - 150000) < 0.000001
S30 = a*(1 - q^30)/(1 - q)
assert abs(S30 - 103752.20) < 0.005
assert abs(sum(C ./ (1 + r).^(1:30)) - S30) < 0.000001
assert abs(S30/PV - 0.69) < 0.005
q2 = 1.02/1.04
assert abs(q2 - 0.9808) < 0.00005
assert abs(a/(1 - q2) - 300000) < 0.000001
q3 = 1.04/1.04
assert q3 == 1
# with 4 % growth the rent in year 10 is still worth a today
assert abs(C*1.04^9/1.04^10 - a) < 0.000001
assert abs(C/(1.04 - 1.02) - 300000) < 0.000001
```

### Example 2 (medium): does the effect add up?
An economist models the extra output, in millions, that a one-off subsidy creates in year $n$ after it is paid. Three models are proposed: (a) $\dfrac{100}{n}$, (b) $\dfrac{100}{n^2 + 1}$, (c) $100\,n\,(0.8)^n$. In which models is the total extra output, over all years, finite?

1. (a) $\dfrac{100}{n} \to 0$, yet $\displaystyle\sum \dfrac{100}{n} = 100\left(1 + \tfrac12 + \tfrac13 + \dots\right)$ diverges: $S_{10} = 292.90$, $S_{100} = 518.74$, $S_{1000} = 748.55$, and the growth never stops.
   *Why:* this is 100 times the harmonic series ($p = 1$). The terms shrink, but too slowly; because they tend to 0, the $n$-th term test says nothing here.
2. (b) $0 < \dfrac{100}{n^2 + 1} < \dfrac{100}{n^2}$, and $\displaystyle\sum \dfrac{100}{n^2}$ converges, so (b) converges.
   *Why:* comparison test with a $p$-series with $p = 2 > 1$. The bigger series has the finite sum $100 \cdot \pi^2/6 = 164.49$ (a known result), so the total is below that; adding 1000 terms gives $107.57$.
3. (c) $\left|\dfrac{a_{n+1}}{a_n}\right| = \dfrac{100(n+1)(0.8)^{n+1}}{100\,n\,(0.8)^n} = 0.8 \cdot \dfrac{n+1}{n} \to 0.8 < 1$, so (c) converges.
   *Why:* ratio test. The effect first rises (80, 128, 153.6, 163.84, …) and only then fades, but in the long run each year's effect is about 0.8 times the last, as in a geometric series.
4. (c) total: $\displaystyle\sum_{n=1}^{\infty} n\,q^n = \dfrac{q}{(1 - q)^2}$, so the total is $100 \cdot \dfrac{0.8}{0.2^2} = 2{,}000$; the first 50 years already give $1{,}999.69$.
   *Why:* differentiate $\sum q^n = \dfrac{1}{1 - q}$ term by term to get $\sum n\,q^{n-1} = \dfrac{1}{(1 - q)^2}$, then multiply by $q$. This is allowed because $|q| < 1$ is inside the radius of convergence.

So only model (a) gives an infinite total: an effect that dies away like $1/n$ is, added up, unlimited.

```verify
Ha = [sum(100 ./ (1:10)), sum(100 ./ (1:100)), sum(100 ./ (1:1000))]
assert abs(Ha[1] - 292.90) < 0.005
assert abs(Ha[2] - 518.74) < 0.005
assert abs(Ha[3] - 748.55) < 0.005
assert abs(100*pi^2/6 - 164.49) < 0.005
Sb = sum(100 ./ ((1:1000).^2 + 1))
assert abs(Sb - 107.57) < 0.005
assert Sb < 100*pi^2/6
n = 1:8
c = 100*n.*0.8.^n
assert abs(c[1] - 80) < 0.000001
assert abs(c[2] - 128) < 0.000001
assert abs(c[3] - 153.6) < 0.000001
assert abs(c[4] - 163.84) < 0.000001
assert abs(0.8*(1000001/1000000) - 0.8) < 0.000001
q = 0.8
total = 100*q/(1 - q)^2
assert abs(total - 2000) < 0.000001
S50 = sum(100*(1:50).*q.^(1:50))
assert abs(S50 - 1999.69) < 0.005
assert abs(sum(100*(1:400).*q.^(1:400)) - total) < 0.000001
```

### Example 3 (hard): the series of ln(1 + x) and a continuously compounded rate
A bank quotes 6 % a year, compounded annually. The equivalent continuously compounded rate (FM02) is $\ln(1.06)$. Find the interval of convergence of the Maclaurin series of $\ln(1 + x)$, then use its first three terms to find $\ln(1.06)$ and bound the error.

1. $a_n = \dfrac{(-1)^{n+1}}{n}$ (the coefficient of $x^n$), so $\left|\dfrac{a_{n+1}x^{n+1}}{a_n x^n}\right| = \dfrac{n}{n + 1}\,|x| \to |x|$
   *Why:* ratio test on the terms of $x - \dfrac{x^2}{2} + \dfrac{x^3}{3} - \dots$; the signs disappear inside the absolute value.
2. $|x| < 1$ gives convergence and $|x| > 1$ divergence, so $R = 1$.
   *Why:* the ratio test limit must be below 1. Equivalently $R = \lim |a_n/a_{n+1}| = \lim \dfrac{n+1}{n} = 1$.
3. At $x = 1$: $1 - \tfrac12 + \tfrac13 - \tfrac14 + \dots$ converges, but only conditionally, and slowly: four terms give $0.5833$ against $\ln 2 = 0.6931$. At $x = -1$: $-\left(1 + \tfrac12 + \tfrac13 + \dots\right)$ diverges. The interval of convergence is $-1 < x \le 1$.
   *Why:* the ratio test says nothing at the end points. At $x = 1$ the alternating series test applies (the terms $1/n$ decrease to 0), while the absolute values form the harmonic series; at $x = -1$ we get minus the harmonic series.
4. $\ln(1.06) \approx 0.06 - \dfrac{0.06^2}{2} + \dfrac{0.06^3}{3} = 0.06 - 0.0018 + 0.000072 = 0.058272$
   *Why:* $x = 0.06$ is deep inside the interval, so the terms shrink fast: each is less than a tenth of the one before.
5. Error $< \dfrac{0.06^4}{4} = 0.00000324$; indeed $\ln(1.06) = 0.0582689$, an error of $0.0000031$.
   *Why:* the series alternates and its terms decrease, so the error is smaller than the first term left out. The continuously compounded rate is 5.83 %, a little below 6 %, because compounding within the year adds the rest.

```verify
x = 0.06
p3 = x - x^2/2 + x^3/3
assert abs(x^2/2 - 0.0018) < 1e-12
assert abs(x^3/3 - 0.000072) < 1e-12
assert abs(p3 - 0.058272) < 1e-12
truth = log(1 + x)
assert abs(truth - 0.0582689) < 0.00000005
bound = x^4/4
assert abs(bound - 0.00000324) < 1e-12
err = p3 - truth
assert abs(err - 0.0000031) < 0.00000005
assert abs(err) < bound
assert abs(1 - 1/2 + 1/3 - 1/4 - 0.5833) < 0.00005
assert abs(log(2) - 0.6931) < 0.00005
# the ratio of neighbouring coefficients tends to 1
n = 1000000
assert abs((n + 1)/n - 1) < 0.000002
assert abs(round(truth*10000)/100 - 5.83) < 1e-9
```

## Common mistakes
- Thinking that terms shrinking to 0 proves convergence: the harmonic series is the counter-example (TERMS_TO_ZERO).
- Using the wrong first term in $a/(1 - q)$, for example $C$ instead of $C/(1 + r)$ when the sum starts at $t = 1$ (START_INDEX).
- Giving the first term of the series as its sum (FIRST_TERM_ONLY).
- Dividing by $1 + q$ instead of $1 - q$ (RATIO_SIGN).
- Using $a/(1 - q)$ when $|q| \ge 1$: the series has no sum, and the formula gives a meaningless number.
- Typing the calculator value when the question asks for the estimate from a number of terms (EXACT_VALUE).
- Adding one term more than asked for (TERM_COUNT).
- Forgetting to divide by $k!$ in the series of $e^x$ (NO_FACTORIAL).
- Ignoring the alternating signs of $\ln(1 + x)$, or the signs of the powers of a negative $x$ (ALL_PLUS).
- Turning the ratio test result upside down and giving $1/R$ (RECIPROCAL_RADIUS).
- Giving an end point $c + R$ of the interval as the radius (ENDPOINT_AS_RADIUS).
- Forgetting the square root when the series is in $x^{2n}$ (FORGOT_SQUARE_ROOT).
- Concluding anything from the ratio test when $L = 1$, or forgetting to check the end points of the interval separately.
- Using a series outside its interval of convergence: $\ln(1 + x)$ at $x = 2$ gives partial sums that run away, although $\ln 3$ exists.

## Practice
- `infinite-geometric-series-sum` (difficulty 1): sum of an infinite geometric series, either the present value of a rent paid for ever or a fading effect $a\,q^n$, starting at $t = 0$ or $t = 1$; distractors START_INDEX, FIRST_TERM_ONLY, RATIO_SIGN.
- `maclaurin-partial-sum-estimate` (difficulty 2): estimate a continuous growth or discount factor $e^x$, or a log return $\ln(1 + x)$, with the first $n$ terms of its Maclaurin series; distractors EXACT_VALUE, TERM_COUNT, NO_FACTORIAL, ALL_PLUS.
- `power-series-radius` (difficulty 3): radius of convergence of a power series by the ratio test; distractors RECIPROCAL_RADIUS, ENDPOINT_AS_RADIUS, FORGOT_SQUARE_ROOT.

## Real world
- Asset prices: land, perpetual government bonds and shares are valued as infinite sums of discounted payments. When expected growth approaches the discount rate the ratio $(1 + g)/(1 + r)$ approaches 1 and the value explodes, which is why small changes in interest rates or growth forecasts move the prices of long-lived assets so much, and why a price based on growth at or above the discount rate signals a bubble (FM04 has the growing-perpetuity formula).
- Multipliers: the Keynesian spending multiplier $1/(1 - c)$ and the money multiplier are sums of infinite geometric series of spending or lending rounds, with ratio below 1 because some money leaks into saving, taxes, imports or cash at each round (F11).
- Finance: returns are often converted to continuously compounded (log) returns, $\ln(1 + r) = r - r^2/2 + r^3/3 - \dots$, which add up neatly over time; for small $r$ the first one or two terms are enough, as in Example 3.
- Macroeconomic models: households in many models value the whole future as $u_0 + \beta u_1 + \beta^2 u_2 + \dots$ with a discount factor $\beta < 1$; comparison with a geometric series shows that this infinite sum is finite whenever the yearly utilities stay bounded.

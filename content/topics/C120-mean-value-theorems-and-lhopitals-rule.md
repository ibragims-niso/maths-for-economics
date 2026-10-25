---
id: C120
title: "Mean value theorems and L'Hôpital's rule"
block: C1
coreYear: 1
prerequisites: [C105, C119]
estMinutes: 45
status: draft
economicUses:
  - Linking average and marginal rates over an interval of output, hours or time
  - "Bounding a change from a bound on the marginal: if marginal cost never exceeds M, cost rises by at most M per unit"
  - "Limits of economic formulas: the CES production function tends to Cobb–Douglas"
  - Comparing growth in the long run, such as exponential growth against a polynomial trend
searchTerms:
  - "Main theorems of differential calculus"
  - "Fermat's theorem"
  - "Rolle's theorem"
  - "Lagrange's theorem"
  - "Mean value theorem"
  - "Cauchy's theorem"
  - "L'Hopital's rule"
  - "L'Hospital's rule"
  - "Bernoulli–L'Hopital rule"
  - "Resolving indeterminate forms"
syllabusHeadings:
  - "Main theorems of differential calculus; indeterminate forms"
generators: [mean-value-point-root-output, lhopital-difference-of-powers, ces-limit-cobb-douglas]
widgets: [mean-value-tangent]
mistakeCodes:
  MIDPOINT_RULE:
    label: Took the midpoint of the interval
    explanation: The midpoint works only when the marginal changes at a constant rate (a quadratic). For Q = k√L the marginal product falls ever more slowly, so the point lies left of the midpoint. Set Q′(c) equal to the average rate and solve.
  GAVE_RATE:
    label: Gave the average rate, not the point
    explanation: The average rate (Q(b) − Q(a))/(b − a) is the slope the theorem matches. The question asks where the marginal equals it, an input level c, so solve Q′(c) = that slope for c.
  FORGOT_SQUARE:
    label: Stopped at √c
    explanation: Solving k/(2√c) = slope gives √c first. Square it to get c itself.
  NO_LOG:
    label: Subtracted the growth factors
    explanation: The derivative of aˣ is aˣ·ln a, so differentiating the top gives logarithms, not the factors themselves. The limit is ln a − ln b.
  SIGN_SLIP:
    label: Reversed the sign
    explanation: Keep the terms in the order of the question. If the first factor is larger, the gap opens upwards and the limit is positive.
  ZERO_OVER_ZERO:
    label: Took 0/0 to be 0
    explanation: 0/0 is an indeterminate form, not zero. Differentiate the top and the bottom separately (L'Hôpital's rule) and take the limit again.
  LINEAR_AVERAGE:
    label: Used the weighted average of the inputs
    explanation: αK + (1 − α)L is the CES output at ρ = 1, the case of perfect substitutes. As ρ → 0 the form is 1^∞; take logs and use L'Hôpital's rule to get K^α·L^(1−α).
  ONE_TO_INFINITY:
    label: Said 1 to the power infinity is 1
    explanation: The bracket tends to 1 and the power 1/ρ grows without limit, which is indeterminate. Take logarithms to turn it into a 0/0 form.
  LEONTIEF:
    label: Gave the smaller input
    explanation: min(K, L) is the limit as ρ → −∞, where the inputs cannot be substituted at all. As ρ → 0 the answer is the Cobb–Douglas output, which lies between the smaller input and the weighted average.
resources:
  - { title: "Calculus Volume 1, 4.4 The Mean Value Theorem (OpenStax)", url: "https://openstax.org/books/calculus-volume-1/pages/4-4-the-mean-value-theorem", kind: textbook, verifiedAt: 2026-10-21 }
  - { title: "Calculus Volume 1, 4.8 L'Hôpital's Rule (OpenStax)", url: "https://openstax.org/books/calculus-volume-1/pages/4-8-lhopitals-rule", kind: textbook, verifiedAt: 2026-10-21 }
---

## Why economists need this
Output rose from 40 to 160 units when weekly hours rose from 4 to 64: on average 2 extra units per extra hour. Was there an hour at which the marginal product was exactly 2? The **mean value theorem** says yes, and it is the bridge between the *average* rates that data give us and the *marginal* rates that theory talks about. It also explains why a positive marginal means a rising total, and how a bound on the marginal bounds the total change.

The same ideas give **L'Hôpital's rule**, the most useful tool for limits of the form $0/0$ and $\infty/\infty$. Economists use it to show that the CES production function turns into Cobb–Douglas, to find the starting rate at which two growth paths separate, and to check that exponential growth eventually beats any polynomial trend.

## Intuition
If you drive 120 km in 2 hours, your average speed is 60 km/h, so at some moment the speedometer showed exactly 60: you cannot average 60 while always going slower or always going faster. On a graph, the chord joining the start and the end has slope equal to the average rate, and somewhere along a smooth curve a tangent runs parallel to that chord.

For L'Hôpital's rule, zoom in on the point where top and bottom are both 0. Close up, each smooth function looks like its tangent line, so their ratio looks like the ratio of the slopes. That is why the limit of $f/g$ can be read from $f'/g'$.

## Definition and formulas
Throughout, $f$ is continuous on $[a, b]$ and differentiable on $(a, b)$.

::syllabus[Fermat's and Rolle's theorems]

**Fermat's theorem.** If $f$ has a local maximum or minimum at an interior point $c$ and $f'(c)$ exists, then $f'(c) = 0$. This is why we look for optima where the derivative is zero (C109).

**Rolle's theorem.** If $f(a) = f(b)$, there is a $c$ in $(a, b)$ with $f'(c) = 0$. If profit is the same at two outputs, somewhere in between marginal profit is zero: the profit curve turned round.

::syllabus[Lagrange's and Cauchy's theorems]

**Lagrange's mean value theorem.** There is a $c$ in $(a, b)$ with
$$f'(c) = \frac{f(b) - f(a)}{b - a}, \qquad\text{that is}\qquad f(b) - f(a) = f'(c)\,(b - a).$$
The marginal at some point equals the average rate over the interval. Three consequences used all the time:

- if $f'(x) = 0$ everywhere on an interval, $f$ is constant there (this is why two antiderivatives differ by a constant, C112);
- if $f'(x) > 0$ on an interval, $f$ is increasing there; if $f'(x) < 0$, decreasing (C121);
- if $|f'(x)| \le M$, then $|f(b) - f(a)| \le M\,(b - a)$: if marginal cost never exceeds 12, producing 50 more units adds at most 600 to cost.

**Cauchy's mean value theorem.** For two such functions with $g'(x) \ne 0$ there is a $c$ with
$$\frac{f(b) - f(a)}{g(b) - g(a)} = \frac{f'(c)}{g'(c)}.$$
Lagrange's theorem is the case $g(x) = x$. Cauchy's version is what proves L'Hôpital's rule.

::syllabus[Bernoulli–L'Hôpital rule for indeterminate forms]

**L'Hôpital's rule.** Suppose $f(x) \to 0$ and $g(x) \to 0$ (or both tend to $\pm\infty$) as $x \to a$, where $a$ may also be $\pm\infty$, and $g'(x) \ne 0$ near $a$. If $\lim f'(x)/g'(x)$ exists, then
$$\lim_{x \to a} \frac{f(x)}{g(x)} = \lim_{x \to a} \frac{f'(x)}{g'(x)}.$$
Differentiate the top and the bottom **separately**; this is not the quotient rule. If the new limit is again $0/0$ or $\infty/\infty$, apply the rule again. Use it only on these two forms: for $\lim_{x \to 0} \frac{x + 1}{x + 2} = \frac12$ the rule would wrongly give 1.

**Other indeterminate forms** are first rewritten as a quotient:

- $0 \cdot \infty$: write $f g = \dfrac{f}{1/g}$. For example $x \ln x = \dfrac{\ln x}{1/x} \to 0$ as $x \to 0^+$.
- $\infty - \infty$: combine into one fraction.
- $1^\infty$, $0^0$, $\infty^0$: for $y = f^{\,g}$ take $\ln y = g \ln f$, find its limit $L$, then $y \to e^{L}$.

**Who grows faster.** For any powers $k > 0$ and $n$, L'Hôpital's rule gives
$$\lim_{x \to \infty} \frac{\ln x}{x^{k}} = 0, \qquad \lim_{x \to \infty} \frac{x^{n}}{e^{kx}} = 0.$$
Logarithms grow more slowly than any power, and any power more slowly than any exponential.

::syllabus[Taylor's formula]

**Taylor's formula with remainder.** The mean value theorem is the first step of Taylor's formula (C111): $f(x) = f(a) + f'(a)(x - a) + \dots + \dfrac{f^{(n)}(a)}{n!}(x - a)^n + \dfrac{f^{(n+1)}(c)}{(n + 1)!}(x - a)^{n + 1}$ for some $c$ between $a$ and $x$. With $n = 0$ it is exactly Lagrange's theorem.

## Interactive
::widget{id="mean-value-tangent"}

The purple curve is weekly output $Q(L) = 20\sqrt{L}$. Use **Start, hours** and **Extra hours** to choose an interval; the hollow dots mark its ends and the dashed gold chord joins them. The solid dot is the mean value point $c$, where the green tangent runs parallel to the chord. At the start (4 to 64 hours) the panel shows an average of 2 extra units per hour, $c = 25$ h and a marginal product of 2 at $c$. Notice that $c$ is always left of the midpoint, because the marginal product falls as hours rise; shrink the interval and $c$ moves towards the middle.

## Worked examples

### Example 1 (easy): where the marginal product equals the average
A workshop's weekly output is $Q(L) = 20\sqrt{L}$. Hours rise from 4 to 64. Find the average extra output per extra hour, and the hour level $c$ the mean value theorem promises.

1. $\dfrac{Q(64) - Q(4)}{64 - 4} = \dfrac{160 - 40}{60} = 2$
   *Why:* the slope of the chord is the average rate of change over the interval.
2. $Q'(L) = \dfrac{20}{2\sqrt{L}} = \dfrac{10}{\sqrt{L}}$
   *Why:* the derivative of $\sqrt{L} = L^{1/2}$ is $\tfrac12 L^{-1/2}$.
3. $\dfrac{10}{\sqrt{c}} = 2 \;\Rightarrow\; \sqrt{c} = 5 \;\Rightarrow\; c = 25$
   *Why:* set the marginal equal to the average rate and solve; $c$ lies inside $(4, 64)$, as promised.
4. The midpoint, 34 hours, is not the answer: $Q'(34) = 1.715$.
   *Why:* the midpoint works only for quadratics, where the marginal changes at a constant rate.

```verify
Q(L) = 20*sqrt(L)
dQ(L) = 10/sqrt(L)
avg = (Q(64) - Q(4))/(64 - 4)
assert avg == 2
assert dQ(25) == 2
assert abs(dQ(34) - 1.715) < 0.001
```

### Example 2 (medium): how fast two growth paths separate
Two investments grow by the factors 1.08 and 1.05 a year. Find $\displaystyle\lim_{x \to 0} \frac{1.08^{x} - 1.05^{x}}{x}$. Then decide which grows faster in the long run: a trend $x^2$ or the exponential $e^{0.1x}$.

1. At $x = 0$: $\dfrac{1 - 1}{0} = \dfrac{0}{0}$
   *Why:* an indeterminate form, so L'Hôpital's rule applies.
2. $\lim_{x \to 0} \dfrac{1.08^{x}\ln 1.08 - 1.05^{x}\ln 1.05}{1} = \ln 1.08 - \ln 1.05 = 0.0282$
   *Why:* differentiate the top ($a^x$ has derivative $a^x \ln a$) and the bottom (derivative 1) separately, then put $x = 0$. The answer is the gap between the continuous growth rates, about 2.82 % a year.
3. $\displaystyle\lim_{x \to \infty} \frac{x^{2}}{e^{0.1x}} = \lim \frac{2x}{0.1e^{0.1x}} = \lim \frac{2}{0.01e^{0.1x}} = 0$
   *Why:* an $\infty/\infty$ form; one application still leaves $\infty/\infty$, so apply the rule twice. The exponential wins, however slow its rate.
4. At $x = 50$ the ratio is $16.84$, at $x = 100$ it is $0.454$ and at $x = 200$ only $0.00008$.
   *Why:* for a long time the polynomial is ahead; the limit says who wins in the end, not when.

```verify
assert abs(log(1.08) - log(1.05) - 0.0282) < 0.00005
x = 0.000001
assert abs((1.08^x - 1.05^x)/x - 0.0282) < 0.0001
assert abs(100^2/exp(10) - 0.454) < 0.001
assert abs(50^2/exp(5) - 16.84) < 0.005
assert abs(200^2/exp(20) - 0.00008) < 0.000005
```

### Example 3 (hard): CES production tends to Cobb–Douglas
The CES production function $Q(\rho) = \left(0.5\,K^{\rho} + 0.5\,L^{\rho}\right)^{1/\rho}$ has $K = 36$ and $L = 4$. Find $\lim_{\rho \to 0} Q(\rho)$.

1. As $\rho \to 0$ the bracket tends to $0.5 + 0.5 = 1$ and the power $1/\rho$ grows without limit.
   *Why:* a $1^\infty$ form, which is indeterminate.
2. $\ln Q(\rho) = \dfrac{\ln\left(0.5 \cdot 36^{\rho} + 0.5 \cdot 4^{\rho}\right)}{\rho} \to \dfrac{0}{0}$
   *Why:* taking logs brings the power down, giving a quotient.
3. $\displaystyle\lim_{\rho \to 0} \frac{0.5 \cdot 36^{\rho}\ln 36 + 0.5 \cdot 4^{\rho}\ln 4}{0.5 \cdot 36^{\rho} + 0.5 \cdot 4^{\rho}} = 0.5\ln 36 + 0.5\ln 4 = \ln 12$
   *Why:* L'Hôpital: the derivative of $\ln u$ is $u'/u$, and the derivative of $36^{\rho}$ with respect to $\rho$ is $36^{\rho}\ln 36$. At $\rho = 0$ every power equals 1.
4. $\lim_{\rho \to 0} Q(\rho) = e^{\ln 12} = 36^{0.5} \cdot 4^{0.5} = 12$
   *Why:* undo the logarithm. The result is the Cobb–Douglas output $K^{0.5}L^{0.5}$, which lies between the Leontief output $\min(K, L) = 4$ and the linear output at $\rho = 1$, $0.5 \cdot 36 + 0.5 \cdot 4 = 20$.

```verify
Q(r) = (0.5*36^r + 0.5*4^r)^(1/r)
assert abs(Q(0.000001) - 12) < 0.001
assert abs(Q(-0.000001) - 12) < 0.001
assert abs(Q(1) - 20) < 0.000001
assert Q(-50) < 4.1
```

## Common mistakes
- Taking the midpoint of the interval as the mean value point (MIDPOINT_RULE).
- Giving the average rate when the question asks for the input level where the marginal equals it (GAVE_RATE).
- Stopping at $\sqrt{c}$ instead of $c$ (FORGOT_SQUARE).
- Differentiating $a^x$ as if it were a power, so the logarithms go missing (NO_LOG).
- Reversing the order of the two terms and the sign of the answer (SIGN_SLIP).
- Reading $0/0$ as 0 instead of applying L'Hôpital's rule (ZERO_OVER_ZERO).
- Giving the weighted average $\alpha K + (1 - \alpha)L$, the CES output at $\rho = 1$ (LINEAR_AVERAGE).
- Treating $1^\infty$ as 1 (ONE_TO_INFINITY).
- Giving $\min(K, L)$, the limit as $\rho \to -\infty$ (LEONTIEF).
- Using the quotient rule on $f/g$ instead of differentiating top and bottom separately.
- Applying L'Hôpital's rule to a limit that is not $0/0$ or $\infty/\infty$.

## Practice
- `mean-value-point-root-output` (difficulty 1): the hour level where the marginal product of $Q = k\sqrt{L}$ equals the average over an interval; distractors MIDPOINT_RULE, GAVE_RATE, FORGOT_SQUARE.
- `lhopital-difference-of-powers` (difficulty 2): $\lim_{x \to 0} (a^x - b^x)/x$ for two growth factors; distractors NO_LOG, SIGN_SLIP, ZERO_OVER_ZERO.
- `ces-limit-cobb-douglas` (difficulty 3): the limit of CES output as $\rho \to 0$; distractors LINEAR_AVERAGE, ONE_TO_INFINITY, LEONTIEF.

## Real world
- Production functions: the CES family, introduced in a 1961 study of how easily capital and labour substitute for each other, contains Cobb–Douglas ($\rho \to 0$), perfect substitutes ($\rho = 1$) and Leontief ($\rho \to -\infty$) as special or limiting cases. Applied work estimates $\rho$ and reports where an industry sits between them.
- Average and marginal in data: national accounts give averages over a quarter or a year. The mean value theorem says each such average equals the marginal rate at some moment inside the period, which justifies reading an average change as a marginal one when the period is short.
- Error bounds: forecasters and engineers bound how much a quantity can change from a bound on its rate of change, $|f(b) - f(a)| \le M(b - a)$.
- Long-run growth: comparisons such as "compound growth eventually outruns any polynomial trend" are limits of the $\infty/\infty$ type and are settled by L'Hôpital's rule.

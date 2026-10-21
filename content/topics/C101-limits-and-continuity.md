---
id: C101
title: Limits and continuity
block: C1
coreYear: 1
prerequisites: [F03]
estMinutes: 45
status: draft
economicUses:
  - Average cost as output grows very large
  - Tariffs, tax bands and benefit rules with jumps at a threshold
  - Long-run behaviour of economic models
  - Designing piecewise prices that join up without a jump
generators: [limit-by-cancelling, long-run-cost-ratio, continuous-tariff-parameter]
widgets: [tariff-continuity]
mistakeCodes:
  ZERO_OVER_ZERO:
    label: Read 0/0 as 0
    explanation: Substituting gives 0/0, which is not a number but a signal that the top and the bottom share a factor. Factorise, cancel the common factor, then substitute into what is left.
  SIGN_IN_FACTOR:
    label: Sign slip in the factor
    explanation: If the numerator is 0 at x = a, one factor is (x − a) and the other is found by matching the constant term. Multiply your factors back out to check the signs before cancelling.
  PART_OF_FACTOR:
    label: Kept only part of the remaining factor
    explanation: After cancelling (x − a) the whole remaining factor, such as x + b, must be evaluated at x = a. Giving only the constant b leaves out the x.
  CONSTANT_TERMS:
    label: Compared the constant terms
    explanation: For very large q the constant terms (the fixed costs) become tiny next to the q² terms. The long-run ratio is the ratio of the coefficients of the highest power.
  INFINITY_OVER_INFINITY:
    label: Treated ∞/∞ as 1
    explanation: Both costs grow without limit, but one may grow faster than the other. ∞/∞ is not a number; divide top and bottom by the highest power of q to see what the ratio really approaches.
  TENDS_TO_ZERO:
    label: Thought every term vanishes
    explanation: Only terms with q in the denominator tend to 0. After dividing top and bottom by q², the leading coefficients stay, and their ratio is the limit.
  LEFT_VALUE_ONLY:
    label: Gave the bill at the threshold, not k
    explanation: The bill at the threshold is what the second rule must reach. k is what is left after subtracting the second price times the threshold from that bill.
  SAME_FIXED_FEE:
    label: Matched the fixed fees
    explanation: Equal fixed fees only join the two pieces when the prices per unit are equal too. Continuity needs the two rules to give the same bill at the threshold, so compare whole bills, not just fees.
  MOVED_TERM_SIGN:
    label: Moved a term across with the wrong sign
    explanation: From k + c·m = (bill at the threshold), subtract c·m from both sides. Adding it gives a k that is too large.
resources:
  - { title: "Calculus Volume 1, 2.2 The Limit of a Function (OpenStax)", url: "https://openstax.org/books/calculus-volume-1/pages/2-2-the-limit-of-a-function", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Calculus Volume 1, 2.4 Continuity (OpenStax)", url: "https://openstax.org/books/calculus-volume-1/pages/2-4-continuity", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Calculus Volume 1, 4.6 Limits at Infinity and Asymptotes (OpenStax)", url: "https://openstax.org/books/calculus-volume-1/pages/4-6-limits-at-infinity-and-asymptotes", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
A software firm pays 5000 to build an app and 12 per user to run it. Its cost per user is huge for the first few users and keeps falling as users join, but it can never fall below 12. Limits make "keeps falling towards 12" precise. Limits also tell us what happens at a threshold: a phone tariff, a tax band or a benefit rule may make the bill jump when usage or income crosses a line. Economists ask whether such a jump exists, how big it is, and how to remove it. Finally, limits are the foundation of the derivative (C102), and so of all marginal analysis.

## Intuition
A limit asks where a function is heading, not where it is. As the input $x$ gets closer and closer to a number $a$, do the outputs $f(x)$ settle down near one value $L$? If so, $L$ is the limit. What happens exactly at $x = a$ does not matter: $f(a)$ may be different from $L$, or not defined at all.

You can approach $a$ from two sides. From the left the inputs are a little below $a$, from the right a little above. If the two sides head for the same value, the limit exists. If they head for different values, the graph has a jump there. A function is continuous at a point when you can draw its graph through that point without lifting the pen: no hole, no jump, no shooting off to infinity.

The same idea works when the input grows without limit. Average cost $5000/q + 12$ gets closer and closer to 12 as output $q$ grows: the fixed cost is shared over so many units that each one carries almost none of it.

## Definition and formulas
**Limit.** $\displaystyle\lim_{x \to a} f(x) = L$ means $f(x)$ can be made as close to $L$ as we like by taking $x$ close enough to $a$ (but not equal to $a$).

**One-sided limits.** $\displaystyle\lim_{x \to a^-} f(x)$ uses only $x < a$; $\displaystyle\lim_{x \to a^+} f(x)$ uses only $x > a$. The limit exists exactly when both one-sided limits exist and are equal.

**Limit laws.** If $\lim f(x) = L$ and $\lim g(x) = M$ as $x \to a$, then the limit of $f + g$ is $L + M$, of $c\,f$ is $cL$, of $f \cdot g$ is $LM$, and of $f/g$ is $L/M$ provided $M \ne 0$. So for a polynomial, or a rational function whose denominator is not 0 at $a$, the limit is simply the value at $a$: substitute.

**0/0 forms.** If substituting gives $\tfrac{0}{0}$, the top and the bottom share a factor $(x - a)$. Factorise, cancel it, then substitute:
$$\lim_{x \to a} \frac{(x - a)(x + b)}{x - a} = \lim_{x \to a} (x + b) = a + b.$$

**Limits at infinity.** As $q \to \infty$, $\dfrac{c}{q} \to 0$ and $\dfrac{c}{q^2} \to 0$ for any fixed $c$. For a ratio of two polynomials, divide the top and the bottom by the highest power of $q$ in the denominator:
- same degree: the limit is the ratio of the leading coefficients;
- lower degree on top: the limit is 0;
- higher degree on top: the ratio grows without limit.

For example, firm A with cost $C_A(q) = 900 + 40q + 3q^2$ and firm B with $C_B(q) = 1600 + 10q + 2q^2$ have cost ratio $C_A/C_B = 0.84$ at $q = 10$ (A is cheaper, thanks to its lower fixed cost), $1.54$ at $q = 100$, $1.51$ at $q = 1000$, and the ratio tends to $3/2 = 1.5$.

**Average cost tends to marginal cost.** With linear cost $C(q) = F + vq$, the extra cost of one more unit is always $v$ (the marginal cost, as in F04), and
$$AC(q) = \frac{F + vq}{q} = \frac{F}{q} + v \;\to\; v \quad \text{as } q \to \infty.$$

**Infinite limits and asymptotes.** As $q \to 0^+$, $\dfrac{F}{q}$ grows without limit, so $AC(q) \to \infty$: the line $q = 0$ is a vertical asymptote. As $q \to \infty$, $AC(q) \to v$: the line $AC = v$ is a horizontal asymptote. "$\infty$" describes growth without limit; it is not a number to calculate with.

**The number e.** Compounding 100 % interest $n$ times a year turns 1 into $\left(1 + \frac{1}{n}\right)^n$ after a year (FM01). This is 2 for $n = 1$, 2.613 for monthly compounding and 2.7146 for daily compounding, and as $n \to \infty$ it approaches $e = 2.71828\ldots$ (F07). This limit is the basis of continuous compounding (FM02).

**Continuity.** $f$ is continuous at $a$ when all three hold:
1. $f(a)$ is defined;
2. $\displaystyle\lim_{x \to a} f(x)$ exists (both one-sided limits are equal);
3. $\displaystyle\lim_{x \to a} f(x) = f(a)$.

Polynomials are continuous everywhere; rational functions are continuous wherever the denominator is not 0.

**Types of discontinuity.**
- *Removable* (a hole): the limit exists but $f(a)$ is undefined or different from it, as in $\dfrac{x^2 + 3x - 40}{x - 5}$ at $x = 5$.
- *Jump*: the one-sided limits exist but differ, as in a tariff whose price changes at a threshold without the pieces joining.
- *Infinite*: the function grows without limit near $a$, as $AC(q)$ does near $q = 0$.

Many textbooks group these in two kinds. A discontinuity **of the first kind** has both one-sided limits finite: the removable and jump cases. A discontinuity **of the second kind** has at least one one-sided limit infinite or missing: the infinite case, and functions that keep oscillating near $a$.

**Equivalent definition with small changes.** Write $\Delta x = x - a$ and $\Delta y = f(a + \Delta x) - f(a)$. Then $f$ is continuous at $a$ exactly when $\Delta y \to 0$ as $\Delta x \to 0$: a small change in the input gives only a small change in the output. Sums, differences, products, quotients (with a non-zero denominator) and compositions of continuous functions are continuous, and so are the inverse functions of continuous monotonic ones.

**Continuous on a closed interval.** If $f$ is continuous at every point of $[a, b]$, then:
- it is **bounded** there and reaches a largest and a smallest value (Weierstrass's theorem; this is why a profit function on a feasible range of output always has a best output, see AN03);
- if $f(a)$ and $f(b)$ have opposite signs, then $f(c) = 0$ for some $c$ between them (Bolzano–Cauchy); more generally $f$ takes every value between $f(a)$ and $f(b)$ (the intermediate value theorem). If excess demand is negative at a low price and positive at a high one, some price in between clears the market;
- it is **uniformly continuous** (Cantor's theorem): one tolerance on the input works across the whole interval. If you need the output within $\varepsilon$, there is a $\delta$ such that any two inputs closer than $\delta$ give outputs closer than $\varepsilon$, wherever they are in $[a, b]$. On an open or unbounded interval this can fail: $1/x$ on $(0, 1)$ changes faster and faster near 0.

**Making a piecewise function continuous.** If $f(x) = g(x)$ for $x \le m$ and $f(x) = h(x)$ for $x > m$, with $g$ and $h$ polynomials, then $f$ is continuous at $m$ exactly when $g(m) = h(m)$. If $h$ contains an unknown parameter, solve this equation for it.

## Interactive
::widget{id="tariff-continuity"}

The graph shows the data plan from Example 3: the monthly bill is $20 + 4q$ up to 10 GB and $k + 2q$ above 10 GB. The filled dot at 10 GB is the bill for exactly 10 GB; the hollow circle is where the second rule is heading. Drag the slider "Distance h from 10 GB" towards 0.1: the two moving dots close in on 10 GB from the left and from the right, and the panel shows the bill at $10 - h$ and $10 + h$. With $k = 30$ and $h = 0.1$ the panel shows 59.6 on the left and 50.2 on the right: the two sides head for 60 and 50, so the jump is −10 and the limit at 10 GB does not exist. Now move "Constant k above 10 GB" to 40: the jump becomes 0 and the two pieces join into one unbroken line.

## Worked examples

### Example 1 (easy): a 0/0 limit
Find $\displaystyle\lim_{x \to 5} \frac{x^2 + 3x - 40}{x - 5}$. The function is not defined at $x = 5$.

1. $\dfrac{5^2 + 3 \cdot 5 - 40}{5 - 5} = \dfrac{0}{0}$
   *Why:* substitute first; 0/0 is not an answer but a sign that $(x - 5)$ is a factor of the top.
2. $x^2 + 3x - 40 = (x - 5)(x + 8)$
   *Why:* we need two numbers that multiply to −40 and add to 3: −5 and 8. Multiplying back out checks the signs.
3. $\dfrac{(x - 5)(x + 8)}{x - 5} = x + 8$ for $x \ne 5$
   *Why:* cancelling is allowed because the limit only looks at $x$ near 5, never at 5 itself.
4. $\displaystyle\lim_{x \to 5} (x + 8) = 13$
   *Why:* $x + 8$ is a polynomial, so its limit is its value at 5.
5. Check: at $x = 4.99$ the original fraction is 12.99, at $x = 5.01$ it is 13.01.
   *Why:* values from both sides close in on 13, so the limit is 13 although $f(5)$ does not exist: a removable discontinuity.

```verify
f(x) = (x^2 + 3*x - 40)/(x - 5)
assert 5^2 + 3*5 - 40 == 0
assert (5 - 5)*(5 + 8) == 0
assert 7^2 + 3*7 - 40 == (7 - 5)*(7 + 8)
L = 5 + 8
assert L == 13
assert abs(f(4.99) - 12.99) < 0.000001
assert abs(f(5.01) - 13.01) < 0.000001
assert abs(f(4.999999) - L) < 0.00001
```

### Example 2 (medium): average cost in the long run
An app costs 5000 to build and 12 per user to run, so $C(q) = 5000 + 12q$ for $q$ users. Find the average cost for 100, 1000 and 10000 users, its limit as $q \to \infty$, and how many users are needed before the average cost is within 1 of that limit.

1. $AC(q) = \dfrac{5000 + 12q}{q} = \dfrac{5000}{q} + 12$
   *Why:* average cost is total cost per user; splitting the fraction separates the fixed part from the per-user part.
2. $AC(100) = 62$, $AC(1000) = 17$, $AC(10000) = 12.5$
   *Why:* the fixed cost is shared over more and more users, so its share per user shrinks.
3. $\displaystyle\lim_{q \to \infty} AC(q) = \lim_{q \to \infty} \frac{5000}{q} + 12 = 0 + 12 = 12$
   *Why:* a fixed number divided by an ever larger $q$ tends to 0. Equivalently, top and bottom both have degree 1, and the ratio of leading coefficients is $12/1$.
4. $AC(q) - 12 = \dfrac{5000}{q} < 1 \iff q > 5000$
   *Why:* the gap between average cost and its limit is exactly the fixed cost per user, so we solve a simple inequality. At $q = 5000$ the gap is exactly 1 ($AC = 13$).
5. Average cost tends to 12, the marginal cost (the cost of one more user), and $AC = 12$ is a horizontal asymptote; it is never actually reached.
   *Why:* $5000/q$ is positive for every $q$, so $AC(q) > 12$ always.

```verify
F = 5000; v = 12
AC(q) = (F + v*q)/q
assert AC(100) == 62
assert AC(1000) == 17
assert AC(10000) == 12.5
assert abs(AC(10^9) - v) < 0.00001
assert AC(5000) == 13
assert AC(5000) - v == 1
assert AC(5001) - v < 1
assert AC(4999) - v > 1
```

### Example 3 (hard): a data plan with a jump
A mobile operator charges $C(q) = 20 + 4q$ for $q \le 10$ GB of data a month and $C(q) = k + 2q$ for $q > 10$ GB, a lower price per GB for heavy users. (a) With $k = 30$, find both one-sided limits at 10 GB and classify the discontinuity. (b) Find the $k$ that makes the bill continuous.

1. $\displaystyle\lim_{q \to 10^-} C(q) = 20 + 4 \cdot 10 = 60 = C(10)$
   *Why:* just below 10 GB the first rule applies, and a straight line's limit is its value.
2. With $k = 30$: $\displaystyle\lim_{q \to 10^+} C(q) = 30 + 2 \cdot 10 = 50$
   *Why:* just above 10 GB the second rule applies.
3. $60 \ne 50$: a jump discontinuity, the bill jumps down by 10 ($50 - 60 = -10$), and the limit at 10 GB does not exist.
   *Why:* the one-sided limits differ, so condition 2 of continuity fails. A customer using 10.1 GB pays $30 + 2 \cdot 10.1 = 50.2$, less than the 60 paid for exactly 10 GB: an odd incentive to use more data.
4. Continuity needs $k + 2 \cdot 10 = 60$, so $k = 60 - 20 = 40$
   *Why:* set the right-hand limit equal to the left-hand limit, which is also the bill at 10 GB.
5. Check with $k = 40$: $C(10) = 60$, and both one-sided limits are 60, so all three conditions hold.
   *Why:* the value exists, the limit exists, and they are equal.

```verify
C1(q) = 20 + 4*q
C2(q, k) = k + 2*q
assert C1(10) == 60
assert C2(10, 30) == 50
assert C2(10, 30) - C1(10) == -10
assert abs(C2(10.1, 30) - 50.2) < 0.000001
k = 60 - 2*10
assert k == 40
assert C2(10, k) == C1(10)
assert abs(C2(10.000001, k) - C1(10)) < 0.0001
```

## Common mistakes
- Reading $\tfrac{0}{0}$ as 0 instead of factorising and cancelling (ZERO_OVER_ZERO).
- Getting the sign wrong in the second factor, for example writing $(x - 5)(x - 8)$ for $x^2 + 3x - 40$ (SIGN_IN_FACTOR).
- Cancelling correctly but giving only the constant of the remaining factor, 8 instead of $5 + 8$ (PART_OF_FACTOR).
- Comparing fixed costs to find a long-run ratio; for large output the highest powers decide (CONSTANT_TERMS).
- Treating $\infty/\infty$ as 1 (INFINITY_OVER_INFINITY).
- Thinking every term tends to 0 at infinity, so the ratio is 0 (TENDS_TO_ZERO).
- Giving the bill at the threshold as the answer for $k$ (LEFT_VALUE_ONLY).
- Making only the fixed fees equal when joining two pieces (SAME_FIXED_FEE).
- Adding instead of subtracting when moving a term across the equals sign (MOVED_TERM_SIGN).
- Thinking the limit at $a$ must equal $f(a)$: the limit ignores the point itself, and only for a continuous function are they equal.
- Calculating with $\infty$ as if it were a number, for example $\infty - \infty = 0$.

## Practice
- `limit-by-cancelling` (difficulty 1): limit of $\dfrac{x^2 + (b - a)x - ab}{x - a}$ as $x \to a$ by factorising and cancelling; answer $a + b$; distractors ZERO_OVER_ZERO, SIGN_IN_FACTOR, PART_OF_FACTOR.
- `long-run-cost-ratio` (difficulty 2): what the ratio of two quadratic cost functions approaches as output grows; answer the ratio of the $q^2$ coefficients; distractors CONSTANT_TERMS, INFINITY_OVER_INFINITY, TENDS_TO_ZERO.
- `continuous-tariff-parameter` (difficulty 2): the constant $k$ that makes a two-part tariff continuous at its threshold; distractors LEFT_VALUE_ONLY, SAME_FIXED_FEE, MOVED_TERM_SIGN.

## Real world
- Utilities and digital platforms: with a large fixed cost and a small cost per customer, average cost falls towards marginal cost as the customer base grows. This is why such industries tend towards a few large firms, and why regulators debate whether prices should cover average or marginal cost.
- Tax and benefit "cliff edges": when a benefit stops completely once income passes a threshold, a household's net income jumps down there, so earning a little more can leave it worse off. Governments replace such jumps with gradual tapers to make the schedule continuous.
- Tariff design: electricity, water and data tariffs with blocks of different prices are designed so that the pieces join, otherwise customers just above a threshold could pay less than those just below it.
- Long-run analysis: economists ask where a model settles as time goes on, such as the steady state of a growth model or the limit of a sum of discounted payments; these are limits as time tends to infinity.

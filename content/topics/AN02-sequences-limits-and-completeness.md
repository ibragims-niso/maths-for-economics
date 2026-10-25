---
id: AN02
title: Sequences, limits and completeness
block: AN
coreYear: 4
prerequisites: [AN01, C101]
estMinutes: 50
status: draft
economicUses:
  - "Does an equilibrium-finding algorithm (tâtonnement, value function iteration) settle down, and how many rounds does it need?"
  - Long-run behaviour of economic models that are defined step by step
  - "The supremum of attainable utility or profit, and whether a best choice exists"
  - "Why existence results in economics need the real numbers: with fractions only, a market can have no equilibrium price"
searchTerms:
  - "Limit of a sequence"
  - "Limit of a sequence: algebraic and geometric meaning"
  - "Properties of convergent sequences"
  - "Cauchy criterion"
generators: [sequence-supremum, epsilon-n-threshold, recursive-root-sequence-limit]
widgets: [epsilon-n-band]
mistakeCodes:
  NON_STRICT:
    label: Allowed the gap to equal ε
    explanation: The definition needs |aₙ − L| < ε, strictly less. If n = 47 gives a gap of exactly ε, that term does not qualify, so N is 48, not 47.
  ROUNDED_DOWN:
    label: Rounded the bound down
    explanation: Solving the inequality gives n > X, for example n > 59.67. The first whole number that works is the one just above X (60); rounding down to 59 picks a term whose gap is still at least ε.
  FORGOT_SHIFT:
    label: Ignored the shift in the denominator
    explanation: The gap is |b − ac|/(n + c), so solve n + c > |b − ac|/ε and then subtract c. Solving |b − ac|/n < ε instead gives an N that is about c too large.
  DROPPED_CONSTANT:
    label: Lost the numerator of the gap
    explanation: After the n terms cancel, the gap is |b − ac|/(n + c), not 1/(n + c). Keep the constant |b − ac| when you solve the inequality.
  INF_AS_SUP:
    label: Gave the infimum, not the supremum
    explanation: The supremum is the least upper bound, the smallest number that no value exceeds. If the values rise, the first value is the smallest (the infimum) and the limit is the supremum; if they fall, it is the other way round.
  LAST_TERM_CHECKED:
    label: Gave the largest value you computed
    explanation: When the values keep rising, every value is beaten by a later one, so no value is the supremum. The supremum is the limit they approach, even though no value reaches it.
  STARTED_AT_ZERO:
    label: Included n = 0
    explanation: The set starts at n = 1, so the value at n = 0 is not in it. When the values fall, the largest one is the first value, u₁.
  NEGATIVE_ROOT:
    label: Kept the negative root
    explanation: Squaring L = √(a + bL) brings in a second, negative root. Every term is a square root, so the terms and their limit are at least 0; keep the positive root.
  CONSTANT_AS_LIMIT:
    label: Gave the constant under the root
    explanation: The constant a is not the limit. Put L in place of both xₙ₊₁ and xₙ, square, and solve L² − bL − a = 0.
  ONE_STEP:
    label: Stopped after one update
    explanation: x₂ is only the first update. The limit is the value the updates no longer change, so solve L = √(a + bL) instead of computing one step.
resources:
  - { title: "Calculus Volume 2, 5.1 Sequences (OpenStax)", url: "https://openstax.org/books/calculus-volume-2/pages/5-1-sequences", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "18.100A Real Analysis, Fall 2020 (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-100a-real-analysis-fall-2020/", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
Economic theory keeps saying that something exists: an equilibrium price, a best plan, the value of a firm. In practice we find it with an algorithm that produces better and better guesses: an auctioneer raises the price of goods in excess demand and lowers it for goods in excess supply (tâtonnement), a computer improves its guess of a value function round after round (value function iteration, see DO03). Each algorithm produces a sequence of numbers, and two questions follow. Does the sequence settle down, and how many rounds are enough? And does the thing it heads for exist at all? The second question is about the real numbers themselves. With fractions only, a sequence of ever better prices could close in on a hole such as $\sqrt 2$, and a market could have no equilibrium price. This topic makes "settles down" precise, gives tools to prove convergence without knowing the limit in advance, and states the completeness axiom on which the existence results of AN03 and AN05 rest.

## Intuition
A sequence is an endless list $a_1, a_2, a_3, \dots$. Saying that it converges to $L$ is like winning a game against a sceptic. The sceptic names a tolerance $\varepsilon > 0$, as small as they like. You must answer with a place $N$ in the list after which every term is within $\varepsilon$ of $L$. If you can answer every possible $\varepsilon$, the sequence converges to $L$. A smaller tolerance usually forces a later $N$, and only the tail of the list matters: the first million terms can be anything.

Often we cannot write down the limit in advance; an algorithm is run precisely because we do not know the answer. Then a second idea helps. A sequence that keeps rising but can never pass some ceiling has to pile up somewhere, and it piles up at its lowest ceiling.

That "lowest ceiling" must exist, and here the number line matters. The decimals $1, 1.4, 1.41, 1.414, \dots$ are all fractions, they keep rising, and none exceeds 1.5, yet the number they close in on, $\sqrt 2$, is not a fraction. The fractions have gaps; the real numbers have none. That is completeness.

## Definition and formulas
**Sequence.** A sequence assigns a real number $a_n$ to each $n = 1, 2, 3, \dots$.

**Convergence (the ε–N definition).** $a_n \to L$, or $\displaystyle\lim_{n \to \infty} a_n = L$, means
$$\text{for every } \varepsilon > 0 \text{ there is an } N \text{ such that } |a_n - L| < \varepsilon \text{ for all } n \ge N.$$
$N$ may depend on $\varepsilon$. A sequence that converges to no number diverges, for example $(-1)^n$ or $n^2$.

**Finding N.** Write the gap $|a_n - L|$ in a simple form, solve gap $< \varepsilon$ for $n$, and take $N$ to be the first whole number strictly above the bound.
- $a_n = \dfrac{1}{n}$, $L = 0$: $\dfrac{1}{n} < \varepsilon \iff n > \dfrac{1}{\varepsilon}$. For $\varepsilon = 0.01$, $N = 101$ (at $n = 100$ the gap is exactly 0.01, which is not less than 0.01).
- $a_n = \dfrac{an + b}{n + c}$, $L = a$: the gap is $\dfrac{|b - ac|}{n + c}$, so $n > \dfrac{|b - ac|}{\varepsilon} - c$.
- $a_n = r^n$ with $0 < r < 1$, $L = 0$: $r^n < \varepsilon \iff n > \dfrac{\ln \varepsilon}{\ln r}$; dividing by $\ln r < 0$ flips the inequality. In value function iteration with discount factor $\beta = 0.95$ the error shrinks at least by the factor 0.95 each round, so cutting it below 1 % of its starting size needs $n > \ln 0.01 / \ln 0.95 \approx 89.78$ rounds: $N = 90$.

**Uniqueness of limits.** A sequence has at most one limit. If $a_n \to L$ and $a_n \to M$ with $L \ne M$, take $\varepsilon = |L - M|/2$. Far enough out, every term is within $\varepsilon$ of both $L$ and $M$, so
$$|L - M| \le |L - a_n| + |a_n - M| < 2\varepsilon = |L - M|,$$
which is impossible.

**Bounded and monotone sequences.** $(a_n)$ is bounded above if $a_n \le K$ for all $n$, bounded below if $a_n \ge k$ for all $n$, and bounded if both. Every convergent sequence is bounded, but not every bounded sequence converges: $(-1)^n$ is bounded and jumps for ever. $(a_n)$ is increasing if $a_{n+1} \ge a_n$ for all $n$, decreasing if $a_{n+1} \le a_n$, and monotone if it is one of the two.

**Supremum and infimum.** Let $S$ be a non-empty set of real numbers. $K$ is an upper bound of $S$ if $s \le K$ for every $s \in S$. The supremum $\sup S$ is the least upper bound: it is an upper bound, and no smaller number is one, so for every $\varepsilon > 0$ some $s \in S$ has $s > \sup S - \varepsilon$. The infimum $\inf S$, the greatest lower bound, is defined the same way from below. The supremum need not belong to $S$; when it does, it is the maximum of $S$.

For example, $S = \{1 - \tfrac{1}{n} : n = 1, 2, 3, \dots\} = \{0, 0.5, 0.667, 0.75, \dots\}$ has $\inf S = 0$, which is also its minimum, and $\sup S = 1$, which is not in $S$: no element is largest. If these were the utility levels a consumer could reach with different plans, she could get as close to 1 as she liked, but no plan would be best. Whether a best choice exists is the subject of AN03.

**The completeness axiom.** Every non-empty set of real numbers that is bounded above has a supremum in $\mathbb{R}$.

The rational numbers $\mathbb{Q}$ fail this. $S = \{q \in \mathbb{Q} : q > 0,\ q^2 < 2\}$ is bounded above (by 1.5, by 1.42, by 1.415, …), but in $\mathbb{Q}$ it has no least upper bound: the only candidate is $\sqrt 2$, and $\sqrt 2$ is irrational (a classic proof by contradiction, AN01).

**Monotone convergence theorem.** An increasing sequence that is bounded above converges, and its limit is $\sup\{a_n\}$. A decreasing sequence that is bounded below converges to $\inf\{a_n\}$.

Why: let $s = \sup\{a_n\}$, which exists by completeness. For any $\varepsilon > 0$, $s - \varepsilon$ is not an upper bound, so some $a_N > s - \varepsilon$. The sequence is increasing, so for every $n \ge N$
$$s - \varepsilon < a_N \le a_n \le s,$$
which is exactly the ε–N condition.

**The number e.** $a_n = \left(1 + \tfrac{1}{n}\right)^n$ gives $2,\ 2.25,\ \dots$, with $a_{10} = 2.5937$, $a_{100} = 2.7048$ and $a_{1000} = 2.7169$. The sequence is increasing and bounded above by 3 (both can be shown with the binomial theorem), so it converges by the monotone convergence theorem. Its limit is the number $e = 2.71828\ldots$, the limit of ever more frequent compounding met in C101.

**Cauchy sequences (in words).** A sequence is Cauchy if its terms eventually stay close to each other: for every $\varepsilon > 0$ there is an $N$ with $|a_m - a_n| < \varepsilon$ for all $m, n \ge N$. In $\mathbb{R}$ a sequence converges exactly when it is Cauchy, so convergence can be checked without knowing the limit. Note that all pairs of late terms must be close, not just neighbours: the partial sums $1 + \tfrac12 + \tfrac13 + \dots$ take ever smaller steps but grow without limit (C117). In $\mathbb{Q}$ a Cauchy sequence can fail to converge, as the decimals of $\sqrt 2$ do: another way of saying that $\mathbb{Q}$ is not complete.

**Subsequences and Bolzano–Weierstrass (in words).** A subsequence keeps infinitely many terms in their original order, such as $a_2, a_4, a_6, \dots$. If $a_n \to L$, every subsequence also tends to $L$; so two subsequences with different limits prove divergence ($(-1)^n$ has even terms equal to 1 and odd terms equal to $-1$). The Bolzano–Weierstrass theorem says that every bounded sequence of real numbers has a convergent subsequence. Economists use it to prove that best choices exist: take choices whose utility approaches the supremum, pick a convergent subsequence, and show its limit is a feasible choice (AN03, AN04).

**Recursive sequences.** If $x_{n+1} = f(x_n)$ and $x_n \to L$ for a continuous $f$, then $L = f(L)$: the limit is a fixed point of the rule. The method: show the sequence is monotone and bounded (often by induction, AN01), conclude that it converges, then solve $L = f(L)$ and keep the root that fits the bounds.

## Interactive
::widget{id="epsilon-n-band"}

The graph shows the first 50 terms of a sequence that tends to 2, with the band $2 \pm \varepsilon$ shaded. Start with $(2n + 1)/(n + 3)$ and $\varepsilon = 0.1$, the numbers of Example 1: the panel shows First N = 48, and the gold dot marks $a_{48}$, after which every term stays in the band. Drag "Band half-width ε" to 0.5: the panel shows N = 8. Drag it down to 0.05: N = 98, off the graph. A narrower band needs a later $N$, but there always is one, and that is what convergence means. Then move "Sequence" to $2 + (-0.9)^n$, whose terms jump from one side of 2 to the other, and to $x_{n+1} = \sqrt{2 + x_n}$ from Example 2: with $\varepsilon = 0.1$ the recursive sequence needs only $N = 4$.

## Worked examples

### Example 1 (easy): how many rounds for a price algorithm?
After $n$ rounds, an auctioneer's estimate of an equilibrium price is $p_n = \dfrac{2n + 1}{n + 3}$. Find the smallest $N$ such that $|p_n - 2| < 0.1$ for all $n \ge N$, and use the same method to show that $p_n \to 2$.

1. $|p_n - 2| = \left|\dfrac{2n + 1 - 2(n + 3)}{n + 3}\right| = \dfrac{5}{n + 3}$
   *Why:* put the gap over one denominator; the $2n$ terms cancel and leave $|-5| = 5$.
2. $\dfrac{5}{n + 3} < 0.1 \iff n + 3 > 50 \iff n > 47$
   *Why:* both sides are positive, so we can multiply out without flipping the inequality.
3. At $n = 47$ the gap is $\dfrac{5}{50} = 0.1$, not less than 0.1; at $n = 48$ it is $\dfrac{5}{51} \approx 0.098$. So $N = 48$.
   *Why:* the definition needs a gap strictly less than $\varepsilon$, and the gap $5/(n + 3)$ only shrinks as $n$ grows, so every later term is also inside the band.
4. For any $\varepsilon > 0$: $\dfrac{5}{n + 3} < \varepsilon \iff n > \dfrac{5}{\varepsilon} - 3$, so take $N$ to be the first whole number above $\dfrac{5}{\varepsilon} - 3$. For $\varepsilon = 0.01$ this gives $n > 497$ and $N = 498$.
   *Why:* an $N$ exists for every $\varepsilon$, however small, which is exactly the definition of $p_n \to 2$.

```verify
p(n) = (2*n + 1)/(n + 3)
gap(n) = 5/(n + 3)
assert abs(abs(p(10) - 2) - gap(10)) < 1e-12
assert abs(p(47) - 1.9) < 1e-12
assert 5/(47 + 3) == 0.1
assert abs(gap(48) - 0.098) < 0.001
assert gap(48) < 0.1
N = floor(5/0.1 - 3) + 1
assert N == 48
assert 5/0.01 - 3 == 497
assert floor(5/0.01 - 3) + 1 == 498
```

### Example 2 (medium): a recursive sequence by monotone convergence
An algorithm for an equilibrium value starts at $x_1 = 0$ and updates its guess by $x_{n+1} = \sqrt{2 + x_n}$. Show that the sequence converges and find its limit.

1. $x_2 = \sqrt 2 \approx 1.4142$, $x_3 \approx 1.8478$, $x_4 \approx 1.9616$
   *Why:* the first terms suggest the sequence rises towards 2; now we prove it.
2. $x_n < 2$ for all $n$: $x_1 = 0 < 2$, and if $x_n < 2$ then $x_{n+1} = \sqrt{2 + x_n} < \sqrt{4} = 2$.
   *Why:* proof by induction (AN01): the bound holds at the start and is passed on from each term to the next.
3. $x_{n+1} > x_n \iff 2 + x_n > x_n^2 \iff (2 - x_n)(1 + x_n) > 0$, which holds because $0 \le x_n < 2$.
   *Why:* both sides are at least 0, so comparing their squares is enough; both factors are then positive.
4. The sequence is increasing and bounded above by 2, so it converges to some $L \le 2$.
   *Why:* the monotone convergence theorem, which does not need the limit in advance.
5. $L = \sqrt{2 + L} \Rightarrow L^2 - L - 2 = 0 \Rightarrow (L - 2)(L + 1) = 0$, so $L = 2$.
   *Why:* $x_n$ and $x_{n+1}$ have the same limit; the root $-1$ is impossible because every term is at least 0.
6. The gaps $2 - x_n$ are 0.5858, 0.1522, 0.0384, 0.0096 for $n = 2, \dots, 5$.
   *Why:* each gap is roughly a quarter of the one before, so the algorithm converges fast.

```verify
x1 = 0
x2 = sqrt(2 + x1)
x3 = sqrt(2 + x2)
x4 = sqrt(2 + x3)
x5 = sqrt(2 + x4)
assert abs(x2 - 1.4142) < 0.0001
assert abs(x3 - 1.8478) < 0.0001
assert abs(x4 - 1.9616) < 0.0001
assert x1 < x2 and x2 < x3 and x3 < x4 and x4 < x5 and x5 < 2
assert (2 - 1.5)*(1 + 1.5) == 2 + 1.5 - 1.5^2
assert 2^2 - 2 - 2 == 0
assert (-1)^2 - (-1) - 2 == 0
assert abs((2 - x2) - 0.5858) < 0.0001
assert abs((2 - x3) - 0.1522) < 0.0001
assert abs((2 - x4) - 0.0384) < 0.0001
assert abs((2 - x5) - 0.0096) < 0.0001
assert abs((2 - x5)/(2 - x4) - 0.25) < 0.01
```

### Example 3 (hard): a market with no equilibrium price in the fractions
Demand for a good is $Q_d = 2/p$ and supply is $Q_s = p$. An auctioneer starts at the price $x_1 = 2$. Each round, sellers offer $x_n$ units, buyers would take exactly that many at the price $2/x_n$, and the auctioneer moves to the average, $x_{n+1} = \tfrac12\left(x_n + \tfrac{2}{x_n}\right)$. Show that the prices converge in $\mathbb{R}$ and find the limit, then explain why the market has no equilibrium price if prices must be fractions.

1. $x_2 = \tfrac32 = 1.5$, $x_3 = \tfrac{17}{12} \approx 1.416667$, $x_4 = \tfrac{577}{408} \approx 1.414216$
   *Why:* sums, products and quotients of fractions are fractions, so every price the auctioneer quotes is rational.
2. $x_{n+1}^2 - 2 = \dfrac{(x_n^2 - 2)^2}{4x_n^2} \ge 0$, so $x_n^2 \ge 2$ for every $n$.
   *Why:* expand $\tfrac14\left(x_n + \tfrac{2}{x_n}\right)^2 - 2$; the result is a square divided by a positive number. For example $x_3^2 - 2 = \tfrac{1}{144}$, and $x_1^2 - 2 = 2$.
3. $x_{n+1} - x_n = \dfrac{2 - x_n^2}{2x_n} \le 0$
   *Why:* since $x_n^2 \ge 2$, the numerator is at most 0, so every new price is no higher than the last.
4. The prices are decreasing and bounded below by 0, so in $\mathbb{R}$ they converge to some $L$ with $L^2 \ge 2$. Then $L = \tfrac12\left(L + \tfrac{2}{L}\right) \Rightarrow L^2 = 2 \Rightarrow L = \sqrt 2 \approx 1.414214$.
   *Why:* the monotone convergence theorem, then the limit must satisfy the rule; this is exactly the market-clearing condition $2/p = p$. Already $x_4 - \sqrt 2 \approx 0.0000021$.
5. In $\mathbb{Q}$ the same prices are a Cauchy sequence of fractions that converges to no fraction, because the only possible limit, $\sqrt 2$, is irrational.
   *Why:* if prices had to be fractions, the market would have no equilibrium price: for every fraction $p$, either $p^2 < 2$ (excess demand) or $p^2 > 2$ (excess supply). Existence of the equilibrium relies on the completeness of $\mathbb{R}$.

```verify
f(x) = (x + 2/x)/2
x1 = 2
x2 = f(x1)
x3 = f(x2)
x4 = f(x3)
assert x2 == 1.5
assert abs(x3 - 17/12) < 1e-12
assert abs(x4 - 577/408) < 1e-12
assert abs(x3 - 1.416667) < 0.000001
assert abs(x4 - 1.414216) < 0.000001
assert abs((x3^2 - 2) - (x2^2 - 2)^2/(4*x2^2)) < 1e-12
assert abs((x3^2 - 2) - 1/144) < 1e-12
assert x1^2 - 2 == 2
assert abs((x3 - x2) - (2 - x2^2)/(2*x2)) < 1e-12
assert x2 < x1 and x3 < x2 and x4 < x3
assert abs(sqrt(2) - 1.414214) < 0.000001
assert abs((x4 - sqrt(2)) - 0.0000021) < 0.0000001
assert abs(2/sqrt(2) - sqrt(2)) < 1e-12
```

## Common mistakes
- Accepting a term whose gap equals $\varepsilon$; the definition needs a gap strictly less than $\varepsilon$ (NON_STRICT).
- Solving $n > 59.67$ and answering 59 instead of 60 (ROUNDED_DOWN).
- Ignoring the $+c$ in the denominator $n + c$ when solving for $n$ (FORGOT_SHIFT).
- Dropping the constant on top of the gap and solving $1/(n + c) < \varepsilon$ (DROPPED_CONSTANT).
- Giving the infimum when the question asks for the supremum: for rising values the first one is the smallest, not the largest (INF_AS_SUP).
- Giving the largest value you happened to compute, when the values keep rising towards an unreached limit (LAST_TERM_CHECKED).
- Including $n = 0$ in a set that starts at $n = 1$ (STARTED_AT_ZERO).
- Keeping the negative root of $L = \sqrt{a + bL}$ after squaring (NEGATIVE_ROOT).
- Giving the constant under the root as the limit (CONSTANT_AS_LIMIT).
- Computing one update and calling it the limit (ONE_STEP).
- Choosing $N$ first and then $\varepsilon$: the order matters, and $N$ is allowed to depend on $\varepsilon$, not the other way round.
- Solving $L = f(L)$ without first showing that the sequence converges. For $x_{n+1} = 2x_n$ with $x_1 = 1$, $L = 2L$ gives $L = 0$, yet the terms $1, 2, 4, 8, \dots$ grow without limit.
- Thinking that bounded means convergent, or that steps shrinking to 0 mean convergent; $(-1)^n$ and the partial sums of $1 + \tfrac12 + \tfrac13 + \dots$ show both are wrong.
- Thinking a supremum must belong to the set: $\sup\{1 - 1/n\} = 1$ is never reached.

## Practice
- `sequence-supremum` (difficulty 1): the supremum of the attainable values $u_n = (pn + q)/(n + r)$, either the unreached limit $p$ (rising values) or the attained first value $u_1$ (falling values); distractors INF_AS_SUP, LAST_TERM_CHECKED, STARTED_AT_ZERO.
- `epsilon-n-threshold` (difficulty 2): the smallest $N$ with $|p_n - a| < \varepsilon$ for all $n \ge N$, for $p_n = (an + b)/(n + c)$; distractors NON_STRICT, ROUNDED_DOWN, FORGOT_SHIFT, DROPPED_CONSTANT.
- `recursive-root-sequence-limit` (difficulty 3): the limit of $x_{n+1} = \sqrt{a + b x_n}$, the positive root of $L^2 - bL - a = 0$; distractors NEGATIVE_ROOT, CONSTANT_AS_LIMIT, ONE_STEP.

## Real world
- Central banks and finance ministries solve their macroeconomic forecasting models by iteration: guess a path, update it, and stop when successive guesses agree to within a tolerance. The Cauchy idea is what makes that stopping rule meaningful, and the limit of the guesses is the model's solution.
- Value function iteration, the workhorse of dynamic programming (DO03), shrinks its error at least by the discount factor each round: with $\beta = 0.95$ 90 rounds cut the error to 1 % of its starting size, but with $\beta = 0.99$ the same accuracy needs 459 rounds, because $\ln 0.01 / \ln 0.99 \approx 458.2$. Patient decision makers are slow to compute.
- Computable general equilibrium models, used by governments and international organisations to study trade agreements and tax reforms, search for market-clearing prices by iterative price adjustment in the spirit of tâtonnement; whether the iterations converge is checked, not assumed.
- Existence proofs for competitive equilibrium and Nash equilibrium (AN05) rest on completeness of the real numbers, through suprema, Bolzano–Weierstrass and compact sets (AN04); without it, a best response or a market-clearing price could fall into a gap.

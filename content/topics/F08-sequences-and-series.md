---
id: F08
title: Sequences and series
block: F
coreYear: 1
prerequisites: [F07]
estMinutes: 40
status: draft
economicUses:
  - "Rounds of spending: how one injection of money spreads through the economy"
  - Salaries that rise by a fixed amount or by a fixed percentage each year
  - Totals of repeated payments such as rent, pensions or benefits
  - Long-run totals of effects that fade by the same fraction each period
searchTerms:
  - "Numerical sequences, how they are given and their types"
  - "Arithmetic progression"
  - "Geometric progression"
syllabusHeadings:
  - "Numerical sequences and their limits"
generators: [arithmetic-salary-total, spending-rounds-total, salary-offers-difference]
widgets: [spending-rounds]
mistakeCodes:
  NTH_TERM_ONLY:
    label: Gave one term, not the total
    explanation: The n-th term is the payment in one period only, such as the salary in the last year or the spending in the last round. The question asks for the sum of all the terms, so use the sum formula.
  OFF_BY_ONE:
    label: Counted one rise too many
    explanation: In year 1 there has been no rise yet, so year n has had n − 1 rises and the n-th term is a + (n − 1)d. Writing a + nd adds an extra rise to every total.
  FORGOT_HALF:
    label: Forgot to halve
    explanation: An arithmetic sum is the number of terms times the average term, Sₙ = (n/2)(first term + last term). Without the 1/2 the total is doubled.
  INFINITE_SUM:
    label: Used the long-run total for a finite number of rounds
    explanation: a/(1 − r) is the total if the rounds go on for ever. For the first n rounds use Sₙ = a(1 − rⁿ)/(1 − r), which is smaller when 0 < r < 1.
  EXPONENT_OFF_BY_ONE:
    label: Used r to the power n − 1 in the sum
    explanation: The n-th term is a·rⁿ⁻¹, but the sum of n terms needs rⁿ, as in Sₙ = a(1 − rⁿ)/(1 − r). Using n − 1 adds up only n − 1 terms.
  FIXED_RAISE:
    label: Treated a percentage rise as a fixed amount
    explanation: A rise of g % is g % of the current salary, which keeps growing, so the salaries form a geometric sequence with ratio 1 + g/100. Adding g % of the first salary every year treats it as arithmetic and gives too small a total.
resources:
  - { title: "College Algebra 2e, 9.2 Arithmetic Sequences (OpenStax)", url: "https://openstax.org/books/college-algebra-2e/pages/9-2-arithmetic-sequences", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "College Algebra 2e, 9.3 Geometric Sequences (OpenStax)", url: "https://openstax.org/books/college-algebra-2e/pages/9-3-geometric-sequences", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "College Algebra 2e, 9.4 Series and Their Notations (OpenStax)", url: "https://openstax.org/books/college-algebra-2e/pages/9-4-series-and-their-notations", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
The government spends 100 million on a new bridge. The builders spend part of their wages in local shops, the shopkeepers spend part of what they earn, and so on: one injection of money turns into many rounds of spending, each smaller than the last. How much spending does it create in total? A job seeker asks a similar question: an offer starts at 30000 and rises every year, so what will it pay over ten years? Both answers are sums of numbers that follow a simple rule, and this topic gives formulas for them so you do not have to add them up one by one.

## Intuition
A **sequence** is a list of numbers in order: the salary in year 1, year 2, year 3 and so on. A **series** is what you get when you add the terms up. Two patterns cover most of economics:

- **Arithmetic**: add the same amount each time, like a salary that rises by 1500 a year. The terms climb in equal steps, along a straight line.
- **Geometric**: multiply by the same number each time, like a salary that rises by 4 % a year, or spending where each round is 75 % of the one before. The terms grow or shrink exponentially, like the functions in F07.

When each term is a fixed fraction of the one before, the terms get smaller and smaller and the running total creeps up towards a ceiling that it never quite reaches. That is what it means for a series to **converge**: each extra term changes the total by less, and the total settles at a fixed number. If the terms do not shrink towards zero, the total never settles at one number, and the series **diverges**.

## Definition and formulas
A sequence is written $u_1, u_2, u_3, \dots$, where $u_n$ is the $n$-th term. The sum of the first $n$ terms can be written with the sigma sign $\Sigma$ ("add up"); F09 covers this notation in depth:
$$S_n = u_1 + u_2 + \dots + u_n = \sum_{k=1}^{n} u_k$$

**Arithmetic sequence**, first term $a$, common difference $d$:

- $n$-th term: $u_n = a + (n-1)d$
- sum of $n$ terms: $S_n = \dfrac{n}{2}\,(a + u_n) = \dfrac{n}{2}\,\bigl(2a + (n-1)d\bigr)$

**Geometric sequence**, first term $a$, common ratio $r$:

- $n$-th term: $u_n = a\,r^{n-1}$ (the first term has $r^0 = 1$)
- sum of $n$ terms, for $r \ne 1$: $S_n = a\,\dfrac{1 - r^n}{1 - r} = a\,\dfrac{r^n - 1}{r - 1}$
- a rise of $g$ % each period means $r = 1 + g/100$; re-spending a fraction $c$ each round means $r = c$.

**Infinite geometric series.** If $|r| < 1$, then $r^n$ gets closer and closer to 0 as $n$ grows, so the sum settles at
$$S_\infty = a + ar + ar^2 + \dots = \frac{a}{1 - r}$$
If $|r| \ge 1$ the terms do not shrink and the infinite sum has no finite value.

::syllabus[Numerical sequences: ways to give them and their types]

**Ways to give a sequence.** By a **formula** for the $n$-th term ($u_n = 100 \cdot 1.05^{n}$), by a **recurrence** that builds each term from the previous one ($u_{n+1} = 1.05\,u_n$, $u_1 = 105$; this is how DY01 models debt and prices), by a **table** of observed values, or by a **graph** of the points $(n, u_n)$.

**Types of sequences.** A sequence is **increasing** if $u_{n+1} > u_n$ for every $n$ and **decreasing** if $u_{n+1} < u_n$; both are **monotonic**. It is **bounded** if there is a number $M$ with $|u_n| \le M$ for all $n$. Yearly sales that grow at a fixed rate form an increasing, unbounded sequence; the share of a market captured by a product, which never exceeds 100 %, is bounded.

::syllabus[Limit of a sequence: algebraic and geometric meaning]

**Limit of a sequence.** The number $L$ is the **limit** of $(u_n)$, written $\displaystyle\lim_{n\to\infty} u_n = L$, if the terms eventually stay as close to $L$ as you like: for every $\varepsilon > 0$ there is a number $N$ such that $|u_n - L| < \varepsilon$ for all $n > N$. On the number line, every $\varepsilon$-band around $L$ contains all the terms except the first few; on the graph of $(n, u_n)$ the points end up inside the horizontal strip between $L - \varepsilon$ and $L + \varepsilon$. A sequence with a limit **converges**; otherwise it **diverges**. For example $u_n = 5 - \dfrac{2}{n}$ converges to 5: to be within $\varepsilon = 0.01$ of 5 we need $\dfrac{2}{n} < 0.01$, that is $n > 200$.

::syllabus[Properties of convergent sequences]

**Properties of convergent sequences.**

- The limit is unique, and a convergent sequence is bounded.
- Limits respect arithmetic: if $u_n \to A$ and $v_n \to B$, then $u_n \pm v_n \to A \pm B$, $u_n v_n \to AB$, and $u_n / v_n \to A/B$ when $B \ne 0$.
- **Squeeze rule:** if $a_n \le u_n \le b_n$ and both $a_n$ and $b_n$ tend to $L$, so does $u_n$.
- **Monotone and bounded means convergent:** an increasing sequence that never passes some ceiling has a limit. This is why the partial sums of a geometric series with $0 < r < 1$ settle down.

C119 shows how to calculate harder limits of sequences, such as ratios of polynomials in $n$.

## Interactive
::widget{id="spending-rounds"}

Round 1 is a first injection of 100, and each later round is the fraction $c$ of the one before, as in Example 2. Each bar is the running total $S_n$, and its gold top is the round that bar adds. Drag the **rounds** $n$ to add rounds one at a time and watch the gold pieces shrink while the total creeps up towards the dashed line $a/(1 - c)$; drag the **fraction re-spent** $c$ to see how re-spending more raises that ceiling and slows the approach. Check: at $c = 0.75$ and $n = 5$ the panel shows round 5 spending of 31.64, a total of 305.08 and a long-run total of 400.

## Worked examples

### Example 1 (easy): a salary with fixed rises
A graduate's salary is 24000 in the first year and rises by 1200 every year. What is the salary in year 8, and how much does the graduate earn in total over the first 8 years?

1. $u_8 = 24{,}000 + 7 \cdot 1{,}200 = 32{,}400$
   *Why:* the salary rises by the same amount each year, so this is an arithmetic sequence; by year 8 there have been 7 rises, not 8.
2. $S_8 = \dfrac{8}{2}\,(24{,}000 + 32{,}400) = 4 \cdot 56{,}400 = 225{,}600$
   *Why:* the total is the number of years times the average salary, and the average is halfway between the first and the last.
3. Check: $\dfrac{8}{2}\,(2 \cdot 24{,}000 + 7 \cdot 1{,}200) = 4 \cdot 56{,}400 = 225{,}600$
   *Why:* the second form of the formula needs only $a$, $d$ and $n$, so it is a quick independent check.

```verify
a = 24000; d = 1200; n = 8
u = a + (n - 1)*d
S = n/2*(a + u)
assert u == 32400
assert a + u == 56400
assert 2*a + (n - 1)*d == 56400
assert S == 225600
assert n/2*(2*a + (n - 1)*d) == 225600
# brute force: add the eight salaries one by one
assert sum(a + d*(0:n-1)) == S
```

### Example 2 (medium): rounds of spending
The government spends 100 million on a new bridge. Everyone who receives money spends 75 % of it and saves the rest. Counting the government's 100 million as round 1, find total spending over the first 5 rounds, and the total if the rounds go on for ever.

1. Rounds: $100,\ 75,\ 56.25,\ 42.19,\ 31.64$, so $a = 100$ and $r = 0.75$
   *Why:* each round is 75 % of the one before, so the rounds form a geometric sequence.
2. $S_5 = 100 \cdot \dfrac{1 - 0.75^5}{1 - 0.75} = 100 \cdot \dfrac{0.7627}{0.25} = 305.08$
   *Why:* the sum formula adds all five rounds at once; adding the list in step 1 gives the same 305.08.
3. $S_\infty = \dfrac{100}{1 - 0.75} = 400$
   *Why:* $0.75^n$ shrinks towards 0 as $n$ grows, so the running total converges to $a/(1 - r)$.
4. $\dfrac{305.08}{400} = 0.763$, so after five rounds about 76 % of the long-run total has already happened.
   *Why:* $S_n / S_\infty = 1 - r^n$; the share still to come, $0.75^5 \approx 0.24$, shrinks with every round.

```verify
a = 100; c = 0.75; n = 5
S5 = a*(1 - c^n)/(1 - c)
Sinf = a/(1 - c)
assert abs(a*c^3 - 42.19) < 0.005
assert abs(a*c^4 - 31.64) < 0.005
assert abs(1 - c^n - 0.7627) < 0.00005
assert abs(S5 - 305.08) < 0.005
assert abs(sum(a*c.^(0:n-1)) - S5) < 0.000001
assert abs(100 + 75 + 56.25 + 42.19 + 31.64 - 305.08) < 0.000001
assert Sinf == 400
assert abs(S5/Sinf - 0.763) < 0.0005
assert abs(S5/Sinf - (1 - c^n)) < 0.000001
assert abs(c^n - 0.24) < 0.005
```

### Example 3 (hard): two job offers
Offer A pays 30000 in the first year and rises by 1500 every year. Offer B pays 28000 in the first year and rises by 6 % every year. Which offer pays more in total over the first 10 years, and by how much?

1. $S_A = \dfrac{10}{2}\,(2 \cdot 30{,}000 + 9 \cdot 1{,}500) = 5 \cdot 73{,}500 = 367{,}500$
   *Why:* fixed rises make offer A an arithmetic sequence with $a = 30{,}000$ and $d = 1{,}500$.
2. $r = 1 + 0.06 = 1.06$
   *Why:* a 6 % rise multiplies each year's salary by 1.06, so offer B is a geometric sequence.
3. $S_B = 28{,}000 \cdot \dfrac{1.06^{10} - 1}{0.06} = 369{,}062.26$
   *Why:* this is the geometric sum formula, written with $r^n - 1$ on top because $r > 1$.
4. $S_B - S_A = 369{,}062.26 - 367{,}500 = 1{,}562.26$, so offer B pays more.
   *Why:* compare the totals over the whole period, not the starting salaries.
5. Year 6: B pays $37{,}470.32$ and A pays $37{,}500$; year 7: B pays $39{,}718.54$ and A pays $39{,}000$.
   *Why:* B is behind for the first six years but overtakes in year 7, because a percentage rise adds more each year while a fixed rise always adds the same.

```verify
a = 30000; d = 1500; b = 28000; g = 0.06; n = 10
SA = n/2*(2*a + (n - 1)*d)
SB = b*((1 + g)^n - 1)/g
assert 2*a + (n - 1)*d == 73500
assert SA == 367500
assert abs(SB - 369062.26) < 0.005
assert abs(sum(b*(1 + g).^(0:n-1)) - SB) < 0.000001
assert abs((SB - SA) - 1562.26) < 0.005
assert abs(b*(1 + g)^5 - 37470.32) < 0.005
assert a + 5*d == 37500
assert abs(b*(1 + g)^6 - 39718.54) < 0.005
assert a + 6*d == 39000
assert b*(1 + g)^5 < a + 5*d
assert b*(1 + g)^6 > a + 6*d
```

## Common mistakes
- Giving the salary in the last year, or the spending in the last round, instead of the total (NTH_TERM_ONLY).
- Writing the $n$-th term as $a + nd$, which counts one rise too many (OFF_BY_ONE).
- Forgetting the $\tfrac{1}{2}$ in $\tfrac{n}{2}(a + u_n)$, which doubles the total (FORGOT_HALF).
- Using the long-run total $a/(1 - r)$ when the question asks about the first $n$ rounds only (INFINITE_SUM).
- Using $r^{n-1}$ in the sum formula; that power belongs to the $n$-th term (EXPONENT_OFF_BY_ONE).
- Adding the same $g$ % of the first salary every year, as if a percentage rise were a fixed amount (FIXED_RAISE).
- Using the growth rate as the ratio: a 4 % rise each year means $r = 1.04$, not $r = 0.04$.
- Applying $a/(1 - r)$ when $|r| \ge 1$: the terms do not shrink, so there is no finite total.

## Practice
- `arithmetic-salary-total` (difficulty 1): total earnings over $n$ years when a salary rises by a fixed amount each year; distractors NTH_TERM_ONLY, OFF_BY_ONE, FORGOT_HALF.
- `spending-rounds-total` (difficulty 2): total spending over the first $n$ rounds when each round is a fixed fraction of the one before; distractors INFINITE_SUM, EXPONENT_OFF_BY_ONE, NTH_TERM_ONLY.
- `salary-offers-difference` (difficulty 3): compare a salary with fixed rises against one with percentage rises over $n$ years; distractors OFF_BY_ONE, EXPONENT_OFF_BY_ONE, NTH_TERM_ONLY, FIXED_RAISE.

## Real world
- Spending multipliers: when a government or a large firm injects spending, economists estimate how much extra spending follows in later rounds; the long-run total is a geometric series (F11 builds the full macro model).
- Pay scales: many public-sector pay ladders add a fixed step each year, which is arithmetic, while contracts linked to inflation raise pay by a percentage, which is geometric; the longer the contract, the bigger the gap between the two.
- Pensions and benefits that are raised by a fixed percentage every year form a geometric sequence, so their total cost over a period is a geometric sum (valuing them in today's money comes in FM04).
- Fading effects: a machine that loses a fixed share of its value each year, or an advertising campaign whose effect falls by the same fraction each month, follows a geometric sequence with $0 < r < 1$.

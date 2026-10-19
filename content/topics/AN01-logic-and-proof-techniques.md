---
id: AN01
title: Logic and proof techniques
block: AN
coreYear: 4
prerequisites: [F09]
estMinutes: 50
status: draft
economicUses:
  - "Reading theorems in microeconomic theory: what is assumed and what is claimed"
  - Checking whether a claim about all markets survives a counterexample
  - Proving by induction that a property holds in every period of a dynamic model
  - Seeing which assumptions an existence result really needs
generators: [truth-table-true-rows, induction-sum-closed-form, compound-overtakes-linear-year]
widgets: [implication-truth-table]
mistakeCodes:
  FALSE_HYPOTHESIS:
    label: Called a conditional false when its hypothesis is false
    explanation: '"If H then C" only promises something when H is true. In every row where H is false the promise cannot be broken, so the statement is true there. It is false only when H is true and C is false.'
  CONVERSE:
    label: Counted the rows of the converse
    explanation: The converse "if C then H" swaps hypothesis and conclusion and is a different statement. Count the rows of the statement as written, H → C.
  COUNTED_FALSE:
    label: Counted the false rows
    explanation: The rows with H true and C false are the rows where the statement is false. Subtract them from the total number of rows to get the true rows.
  TOTAL_ROWS:
    label: Gave the number of rows in the table
    explanation: With n letters the table has 2ⁿ rows, but the question asks in how many of them the statement is true. Remove the rows where the hypothesis holds and the conclusion fails.
  ONE_TERM_SHORT:
    label: Summed one term too few
    explanation: The sum from k = 1 to n has n terms, so substitute n itself into the closed form. Substituting n − 1 leaves out the last term.
  TERM_NOT_SUM:
    label: Gave the last term, not the sum
    explanation: The n-th term is only the last item added. The question asks for the total of all n terms, which the closed form gives.
  WRONG_CLOSED_FORM:
    label: Used the closed form of a different sum
    explanation: Each sum has its own formula, and similar-looking formulas are easy to mix up. Check a formula at n = 1 and n = 2 against the terms added by hand before using it; that is the base case of its induction proof.
  LAST_YEAR_BEHIND:
    label: Gave the last year A is behind
    explanation: The question asks for the first year in which A is ahead. In the year you found A is still below B, so the answer is one year later.
  YEARLY_NOT_TOTAL:
    label: Compared yearly increases instead of levels
    explanation: A's yearly increase can be larger than B's long before A catches up, because A starts behind. Compare the values Aₙ and Bₙ themselves.
  SIMPLE_GROWTH:
    label: Ignored compounding
    explanation: Growth of g % a year is applied to the current value, so Aₙ = A₀(1 + g)ⁿ, not A₀(1 + gn). Without compounding, A's increases never grow and the catch-up year comes out far too late.
  QUANTIFIER_NEGATION:
    label: Negated a quantified statement wrongly
    explanation: The negation of "for every x, S(x)" is "there is an x for which S(x) fails", not "for no x does S(x) hold". The negation of "there is an x with S(x)" is "for every x, S(x) fails".
  EXAMPLES_NOT_PROOF:
    label: Treated examples as a proof
    explanation: Checking some cases cannot prove a statement about all cases; the next case may fail, as n² + n + 41 does at n = 40. One counterexample does disprove a "for all" claim.
  MISSING_BASE_CASE:
    label: Skipped the base case of an induction
    explanation: The inductive step only shows that the statement passes from n to n + 1. Without a true starting case it proves nothing, so always check the first value as well.
resources:
  - { title: "Contemporary Mathematics, 2.5 Equivalent Statements (OpenStax)", url: "https://openstax.org/books/contemporary-mathematics/pages/2-5-equivalent-statements", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Contemporary Mathematics, 2.6 De Morgan's Laws (OpenStax)", url: "https://openstax.org/books/contemporary-mathematics/pages/2-6-de-morgans-laws", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Mathematics for Computer Science, 6.042J (MIT OpenCourseWare): proofs, induction and logic", url: "https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
Economic theory is written as theorems: "if these assumptions hold, then this conclusion follows". A microeconomics textbook proves that a utility-maximising bundle exists, a game theory course proves that a Nash equilibrium exists, and a growth model proves that the economy converges. To use such a result you must know exactly what it assumes, what it claims, and what it does not claim. The same skills test everyday economic arguments. "A higher price always raises revenue" is a claim about every case, so one counterexample is enough to sink it. "Once the economy is on this path it stays there" is a claim about every future period, which is what induction proves.

## Intuition
F09 introduced statements, "and", "or", "not", the conditional "if $P$ then $Q$" and the words "for all" and "there exists". This topic turns them into tools for checking and building arguments.

Think of $P \to Q$ as a promise: "if $P$ happens, $Q$ will happen too". The promise is broken only if $P$ happens and $Q$ does not. If $P$ never happens, nobody can say the promise was broken, so the statement counts as true. A truth table lists every combination of true and false for the letters and checks the statement in each row, so it settles any question about how statements combine.

A **proof** is a chain of steps, each forced by logic or by an assumption, from the hypotheses to the conclusion. There are several standard routes. Go straight from $P$ to $Q$ (direct proof). Show that if $Q$ fails then $P$ fails (contrapositive). Assume the conclusion is false and reach something impossible (contradiction). Split into cases that cover everything. Or knock over a row of dominoes: show the first one falls and that each falling domino knocks over the next (induction). To show a claim about all cases is false you need much less: one case where it fails, a **counterexample**.

## Definition and formulas
**Truth tables.** With $n$ letters a truth table has $2^n$ rows. For two statements $P$ and $Q$:
$$
\begin{array}{cccccc}
P & Q & P \to Q & Q \to P & \lnot Q \to \lnot P & P \leftrightarrow Q \\ \hline
\text{T} & \text{T} & \text{T} & \text{T} & \text{T} & \text{T} \\
\text{T} & \text{F} & \text{F} & \text{T} & \text{F} & \text{F} \\
\text{F} & \text{T} & \text{T} & \text{F} & \text{T} & \text{F} \\
\text{F} & \text{F} & \text{T} & \text{T} & \text{T} & \text{T}
\end{array}
$$
- $P \to Q$ is false only when $P$ is true and $Q$ is false. More generally, a conditional $H \to C$ built from $n$ letters is true in $2^n$ minus the number of rows where $H$ is true and $C$ is false.
- $P \leftrightarrow Q$ (biconditional, "if and only if") is true when $P$ and $Q$ have the same value. It means $P \to Q$ and $Q \to P$ together.
- A **tautology** is true in every row, for example $P \lor \lnot P$. A **contradiction** is false in every row, for example $P \land \lnot P$.

**Logical equivalence.** Two statements are equivalent, written $\equiv$, when they have the same value in every row of the table. The ones used most in proofs:
- $P \to Q \;\equiv\; \lnot Q \to \lnot P$ (the **contrapositive**) $\;\equiv\; \lnot P \lor Q$.
- The **converse** $Q \to P$ and the **inverse** $\lnot P \to \lnot Q$ are equivalent to each other but *not* to $P \to Q$: they differ from it in the rows TF and FT.
- $\lnot(P \to Q) \equiv P \land \lnot Q$: to deny a promise, show a case where the condition holds and the result does not.
- De Morgan's laws: $\lnot(P \land Q) \equiv \lnot P \lor \lnot Q$ and $\lnot(P \lor Q) \equiv \lnot P \land \lnot Q$.

**Negating quantifiers.**
$$\lnot\big(\forall x:\ S(x)\big) \equiv \exists x:\ \lnot S(x), \qquad \lnot\big(\exists x:\ S(x)\big) \equiv \forall x:\ \lnot S(x)$$
For several quantifiers, flip each one and negate the end: the negation of "for every firm there is a price at which it makes a loss" is "there is a firm that makes no loss at any price".

**Proof methods.**
- *Direct proof*: assume the hypotheses and derive the conclusion. Profit is $\pi = (p - AC)\,q$, where $AC$ is average cost. If $p > AC$ and $q > 0$, both factors are positive, so $\pi > 0$.
- *Proof by contrapositive*: to prove $P \to Q$, prove $\lnot Q \to \lnot P$ instead. Claim: if $n^2$ is even, then $n$ is even. Contrapositive: if $n$ is odd, $n = 2m + 1$, then $n^2 = 4m^2 + 4m + 1 = 2(2m^2 + 2m) + 1$ is odd.
- *Proof by contradiction*: assume the conclusion is false and derive something impossible. Claim: $\sqrt 2$ is irrational. Suppose $\sqrt 2 = a/b$ with whole numbers $a, b$ that have no common factor. Then $a^2 = 2b^2$, so $a^2$ is even and (by the contrapositive proof above) $a$ is even, $a = 2c$. Then $4c^2 = 2b^2$, so $b^2 = 2c^2$ and $b$ is even too. Now $a$ and $b$ share the factor 2, which contradicts the starting assumption. Second classic: there are infinitely many primes. Suppose $p_1, \dots, p_k$ were all of them and let $N = p_1 p_2 \cdots p_k + 1$. Dividing $N$ by any $p_i$ leaves remainder 1, so a prime factor of $N$ is missing from the list, a contradiction. ($N$ itself need not be prime: $2 \cdot 3 \cdot 5 \cdot 7 \cdot 11 \cdot 13 + 1 = 30{,}031 = 59 \cdot 509$, but 59 and 509 are new primes.)
- *Proof by cases*: split into cases that together cover everything. Claim: $n(n + 1)$ is even for every whole number $n$. If $n$ is even, the factor $n$ is even; if $n$ is odd, $n + 1$ is even. Either way the product is even.
- *Induction*: to prove $S(n)$ for every $n \ge n_0$, prove the **base case** $S(n_0)$ and the **inductive step** "if $S(m)$ holds for some $m \ge n_0$, then $S(m + 1)$ holds". Sums proved this way:
$$\sum_{k=1}^{n} (2k - 1) = n^2, \quad \sum_{k=1}^{n} k(k+1) = \frac{n(n+1)(n+2)}{3}, \quad \sum_{k=1}^{n} k^2 = \frac{n(n+1)(2n+1)}{6}, \quad \sum_{k=1}^{n} k^3 = \left(\frac{n(n+1)}{2}\right)^2$$
Inequalities work the same way. Claim: $2^n \ge n + 1$ for $n \ge 1$. Base case: $2^1 = 2 = 1 + 1$. Step: if $2^m \ge m + 1$, then $2^{m+1} = 2 \cdot 2^m \ge 2m + 2 \ge m + 2$. For compound growth at a rate $r \ge 0$: if $(1 + r)^m \ge 1 + mr$, then $(1 + r)^{m+1} \ge (1 + mr)(1 + r) = 1 + (m + 1)r + mr^2 \ge 1 + (m + 1)r$. So compound interest never falls behind simple interest at the same rate.
- *Counterexample*: one case where a "for all" claim fails disproves it. The claim "$n^2 + n + 41$ is prime for every $n \ge 0$" holds for $n = 0, 1, \dots, 39$, yet at $n = 40$ it gives $1681 = 41^2$. The claim "raising the price always raises revenue" fails for demand $Q = 100 - 2P$: at $P = 30$ revenue is $30 \cdot 40 = 1200$, at $P = 31$ it is $31 \cdot 38 = 1178$.
- *Existence and uniqueness*: "there is exactly one" needs two proofs. Existence: show at least one object exists, by building it or by a theorem. Uniqueness: assume there are two and show they are equal, or show that a function can cross zero only once. With demand $a - bp$ and supply $c + dp$, where $b, d > 0$ and $a > c$, the price $p^* = (a - c)/(b + d)$ clears the market (existence). Excess demand $(a - c) - (b + d)p$ is strictly decreasing, so it is zero at only one price (uniqueness).

**Reading a theorem.** Separate the hypotheses from the conclusion, then ask what breaks without each hypothesis. Example: *if utility $u$ is continuous and the budget set is non-empty, closed and bounded, then a bundle that maximises $u$ on the budget set exists.*
- Without "bounded": if one good is free, the consumer can afford any amount of it, and with $u = x + y$ there is no best bundle.
- Without "closed": if spending must be strictly below income, $px + qy < m$, then with $u = x + y$ every affordable bundle can be beaten by spending a little more, so there is no best bundle.
- Without "continuous": with one good, $0 \le x \le 10$, and $u(x) = x$ for $x < 10$ but $u(10) = 0$, utility gets as close to 10 as you like but never reaches it.
- The conclusion says a maximum *exists*, not that it is unique, and not where it is. Adding "preferences are monotone" (more is better) gives an extra conclusion: the best bundle spends all income. The converse is not part of the theorem: a maximum can exist even when an assumption fails. AN03 and AN04 make "continuous", "closed" and "bounded" precise.

## Interactive
::widget{id="implication-truth-table"}

Use the first two sliders to make $P$ and $Q$ true or false: the gold band marks that row of the truth table. The third slider picks the statement in the last column: $P \to Q$, its converse, its contrapositive, its inverse or the biconditional $P \leftrightarrow Q$. Lilac cells mark the rows where the chosen statement differs from $P \to Q$. The panel shows its value in the highlighted row, how many of the 4 rows make it true, and whether it matches $P \to Q$. Check: at the start ($P$ true, $Q$ false, statement $P \to Q$) the panel shows false and 3 of 4. Move the statement slider to the contrapositive: still 3 of 4 and "yes, in all 4 rows". The converse is also true in 3 rows, but it differs from $P \to Q$ in 2 rows, so having the same number of true rows does not make two statements equivalent.

## Worked examples

### Example 1 (easy): a competition rule and its contrapositive
A competition authority's rule reads: "If a firm's market share is above 40 % ($P$) and it raises its price by more than 10 % in a year ($Q$), then the authority opens an investigation ($R$)." In how many rows of the truth table of $(P \land Q) \to R$ is the rule true? Compare its contrapositive and its converse.

1. $2^3 = 8$ rows
   *Why:* each of the three statements $P$, $Q$, $R$ can be true or false independently.
2. $P \land Q$ is true in 2 rows: $(P, Q, R) = (\text{T}, \text{T}, \text{T})$ and $(\text{T}, \text{T}, \text{F})$
   *Why:* the rule can only be broken when its hypothesis holds; in the other 6 rows it is true automatically.
3. Hypothesis true and $R$ false in 1 row, $(\text{T}, \text{T}, \text{F})$, so the rule is true in $8 - 1 = 7$ rows
   *Why:* a conditional is false only when the hypothesis is true and the conclusion is false: a big firm raised its price sharply and was not investigated.
4. Contrapositive $\lnot R \to \lnot(P \land Q)$, that is $\lnot R \to (\lnot P \lor \lnot Q)$: false only in the row $(\text{T}, \text{T}, \text{F})$, so true in 7 rows, the same rows as the rule
   *Why:* "no investigation means the firm did not have both a big share and a big price rise" says exactly the same as the rule (De Morgan turns $\lnot(P \land Q)$ into $\lnot P \lor \lnot Q$).
5. Converse $R \to (P \land Q)$: false when $R$ is true and $P \land Q$ is false, which happens in 3 rows, so true in 5 rows
   *Why:* the converse claims every investigated firm had a big share and a big price rise. The rule does not say that: the authority may investigate for other reasons.

```verify
# rows in the order TTT, TTF, TFT, TFF, FTT, FTF, FFT, FFF
P = [1,1,1,1,0,0,0,0]
Q = [1,1,0,0,1,1,0,0]
R = [1,0,1,0,1,0,1,0]
assert 2^3 == 8
H = P .* Q
assert sum(H) == 2
broken = H .* (1 - R)
assert sum(broken) == 1
rule = 1 - broken
assert sum(rule) == 7
# contrapositive: not R -> not H, built from the negations
notR = 1 - R
notH = 1 - H
contra = 1 - notR .* (1 - notH)
assert sum(abs(contra - rule)) == 0
conv = 1 - R .* (1 - H)
assert sum(1 - conv) == 3
assert sum(conv) == 5
```

### Example 2 (medium): a sum proved by induction
In month $k$ after launch, a firm installs $k(k + 1)$ solar panels. Prove that the total over the first $n$ months is $\sum_{k=1}^{n} k(k+1) = \dfrac{n(n+1)(n+2)}{3}$, then find the total for the first 12 months.

1. Base case $n = 1$: the sum is $1 \cdot 2 = 2$ and the formula gives $\dfrac{1 \cdot 2 \cdot 3}{3} = 2$
   *Why:* induction must start from a true case; with one month the total is just the first month's panels.
2. Inductive hypothesis: assume $\sum_{k=1}^{m} k(k+1) = \dfrac{m(m+1)(m+2)}{3}$ for some $m \ge 1$
   *Why:* the inductive step shows that if the formula holds for $m$ months, it must hold for $m + 1$.
3. $\sum_{k=1}^{m+1} k(k+1) = \dfrac{m(m+1)(m+2)}{3} + (m+1)(m+2) = (m+1)(m+2)\left(\dfrac{m}{3} + 1\right) = \dfrac{(m+1)(m+2)(m+3)}{3}$
   *Why:* the sum over $m + 1$ months is the sum over $m$ months plus month $m + 1$; taking out the common factor $(m+1)(m+2)$ gives the formula with $m + 1$ in place of $m$.
4. The formula holds for every $n \ge 1$
   *Why:* it holds for $n = 1$ (step 1), so by step 3 for $n = 2$, then for $n = 3$, and so on: each domino knocks over the next.
5. $\sum_{k=1}^{12} k(k+1) = \dfrac{12 \cdot 13 \cdot 14}{3} = 728$ panels
   *Why:* substitute $n = 12$. Adding $2 + 6 + 12 + \dots + 156$ by hand gives the same total; stopping at 11 months would give 572, one term short.

```verify
n = 12
assert 1*2 == 1*2*3/3
# the inductive step holds for many m (an identity in m)
m = 1:40
lhs = m .* (m+1) .* (m+2) / 3 + (m+1) .* (m+2)
rhs = (m+1) .* (m+2) .* (m+3) / 3
assert sum(abs(lhs - rhs)) == 0
total = n*(n+1)*(n+2)/3
assert total == 728
# brute force: add the twelve months one by one
assert sum((1:n) .* (2:(n+1))) == 728
assert 12*13 == 156
assert 11*12*13/3 == 572
```

### Example 3 (hard): when compound growth overtakes, and stays ahead
Country A's GDP is 200 billion and grows by 6 % a year. Country B's GDP is 300 billion and grows by a fixed 8 billion a year. In which year $n$ is A's GDP larger than B's for the first time? Show that A then stays ahead in every later year.

1. $A_n = 200 \cdot 1.06^n$, $\quad B_n = 300 + 8n$
   *Why:* A grows by 6 % of its current value each year (compounding); B adds the same 8 billion every year.
2. $A_{11} = 200 \cdot 1.06^{11} = 379.66 < B_{11} = 300 + 8 \cdot 11 = 388$
   *Why:* trying the years in order shows A is behind in every year from 1 to 11.
3. $A_{12} = 200 \cdot 1.06^{12} = 402.44 > B_{12} = 300 + 8 \cdot 12 = 396$
   *Why:* year 12 is the first year with A ahead. It is also the base case of the induction that A stays ahead.
4. $A_{n+1} - B_{n+1} = (A_n - B_n) + (0.06A_n - 8)$
   *Why:* from one year to the next the gap changes by A's increase, $0.06A_n$, minus B's increase, 8.
5. If $A_n > B_n$ for some $n \ge 12$, then $0.06A_n \ge 0.06A_{12} = 24.15 > 8$, so $A_{n+1} - B_{n+1} > 0$
   *Why:* this is the inductive step: A's value only grows, so its yearly increase stays above 8 and A cannot fall behind again. With the base case, A is ahead in year 12 and every year after it. The answer is year 12.

A's yearly increase is already 12 in year 1, above B's 8, yet A needs 12 years to close the gap of 100: comparing increases instead of levels gives the wrong year. Ignoring compounding gives $200 + 12n > 300 + 8n$, that is year 26, far too late.

```verify
A0 = 200; g = 0.06; B0 = 300; d = 8
A11 = A0*(1 + g)^11
A12 = A0*(1 + g)^12
assert abs(A11 - 379.66) < 0.005
assert B0 + d*11 == 388
assert abs(A12 - 402.44) < 0.005
assert B0 + d*12 == 396
# A is behind in all of years 1 to 11 and ahead in years 12 to 80
yrs = 1:11
assert sum(A0*(1 + g).^yrs < B0 + d*yrs) == 11
later = 12:80
assert sum(A0*(1 + g).^later > B0 + d*later) == 69
assert abs(g*A12 - 24.15) < 0.005
assert A0*g == 12
# without compounding: 200 + 12n > 300 + 8n first at n = 26
assert 200 + 12*25 == 300 + 8*25
assert 200 + 12*26 > 300 + 8*26
```

## Common mistakes
- Calling "if $H$ then $C$" false in the rows where $H$ is false (FALSE_HYPOTHESIS).
- Working with the converse $C \to H$ instead of the statement as written; the converse is a different statement (CONVERSE).
- Giving the number of false rows instead of the true rows (COUNTED_FALSE).
- Giving $2^n$, the size of the table, instead of the number of true rows (TOTAL_ROWS).
- Substituting $n - 1$ into a closed form, which leaves out the last term (ONE_TERM_SHORT).
- Giving the $n$-th term instead of the sum of all $n$ terms (TERM_NOT_SUM).
- Mixing up the formulas for $\sum k^2$ and $\sum k^3$, or $\sum k(k + 1)$ with the sum of the triangular numbers $k(k + 1)/2$ (WRONG_CLOSED_FORM).
- Giving the last year in which a growing path is still behind instead of the first year it is ahead (LAST_YEAR_BEHIND).
- Comparing yearly increases instead of the levels themselves (YEARLY_NOT_TOTAL).
- Treating growth of g % a year as a fixed amount, $A_0(1 + gn)$, which ignores compounding (SIMPLE_GROWTH).
- Negating "every firm makes a profit" as "no firm makes a profit"; the correct negation is "some firm does not make a profit" (QUANTIFIER_NEGATION).
- Checking a claim for a few values and calling it proved (EXAMPLES_NOT_PROOF).
- Proving only the inductive step and never checking the starting case (MISSING_BASE_CASE).
- Proving the converse or the inverse when the theorem needs the contrapositive: only $\lnot Q \to \lnot P$ is equivalent to $P \to Q$.
- Reading an existence theorem as if it also said the solution is unique, or that it fails whenever an assumption fails.

## Practice
- `truth-table-true-rows` (difficulty 1): in how many rows of its truth table a conditional built from $P$, $Q$ and $R$ is true; distractors FALSE_HYPOTHESIS, CONVERSE, COUNTED_FALSE, TOTAL_ROWS.
- `induction-sum-closed-form` (difficulty 2): a total such as $\sum_{k=1}^{n} k(k+1)$ or $\sum_{k=1}^{n} k^2$ from its closed form, with the base case and inductive step in the solution; distractors ONE_TERM_SHORT, TERM_NOT_SUM, WRONG_CLOSED_FORM.
- `compound-overtakes-linear-year` (difficulty 3): the first year a compound-growth path (GDP or a savings plan) overtakes a linear one, and the inductive step that keeps it ahead; distractors LAST_YEAR_BEHIND, YEARLY_NOT_TOTAL, SIMPLE_GROWTH.

## Real world
- General equilibrium: the proof that competitive equilibrium prices exist (Arrow and Debreu, 1954) is a theorem with carefully listed hypotheses, such as convex preferences and technologies; much later research asks which of them can be relaxed (see AN05).
- Policy debates: claims of the form "a higher minimum wage always reduces employment" are universal, so economists look for cases where they fail. Card and Krueger's 1994 study of fast-food restaurants in New Jersey and Pennsylvania found no fall in employment after a rise in the minimum wage, which challenged the "always".
- Dynamic models: in value function iteration (see DO03), induction shows that if one round produces an increasing, concave function, the next round does too, so every round does.
- Regulation and contracts: competition rules, tax rules and loan covenants are written as conditionals ("if the share exceeds 40 % and …, then …"). Reading which conditions trigger them, and what their contrapositive rules out, is the logic of this topic.

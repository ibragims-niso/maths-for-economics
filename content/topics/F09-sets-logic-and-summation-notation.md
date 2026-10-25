---
id: F09
title: Sets, logic and summation notation
block: F
coreYear: 1
prerequisites: [F01]
estMinutes: 45
status: draft
economicUses:
  - Reading budget sets and model assumptions written in set notation
  - Counting survey respondents who fall into overlapping groups
  - Telling necessary from sufficient conditions in economic arguments
  - Adding up spending over many goods with Σ
  - Reading statistical formulas written with Σ
searchTerms:
  - "Number sets and logic symbols"
  - "Quantifiers"
  - "Set theory"
  - "Sigma notation"
generators: [survey-inclusion-exclusion, sigma-linear-sum, three-set-inclusion-exclusion]
widgets: [survey-venn]
mistakeCodes:
  FORGOT_OVERLAP:
    label: Forgot to subtract the overlap
    explanation: Anyone in both groups is counted once in |A| and again in |B|. Subtract the overlap once, |A ∪ B| = |A| + |B| − |A ∩ B|, so nobody is counted twice.
  OVERLAP_TWICE:
    label: Subtracted the overlap twice
    explanation: The overlap was counted twice, so it is removed only once. Subtracting it twice leaves out everyone in both groups and gives the number in exactly one group.
  UNION_NOT_COMPLEMENT:
    label: Gave the number inside the groups, not outside
    explanation: The question asks how many are in none of the groups. Find the union first, then subtract it from the number surveyed.
  FORGOT_TRIPLE:
    label: Forgot to add back the triple overlap
    explanation: People in all three groups are added three times with the single groups and subtracted three times with the pairwise overlaps, so they disappear. Add |A ∩ B ∩ C| back once.
  TRIPLE_SUBTRACTED:
    label: Subtracted the triple overlap
    explanation: In the three-group formula the signs alternate. Add the single groups, subtract the pairwise overlaps, then add the triple overlap.
  CONSTANT_ONCE:
    label: Added the constant only once
    explanation: In Σ(a + b·i) the constant a is part of every term, so it adds up to (number of terms) × a, not to a.
  OFF_BY_ONE:
    label: Miscounted the terms
    explanation: A sum from i = m to i = n has n − m + 1 terms, because both limits are included. Counting n − m terms leaves one out.
  IGNORED_LOWER_LIMIT:
    label: Started the sum at 1
    explanation: The lower limit says where the sum starts. For the sum of i from m to n, take 1 + 2 + … + n and subtract 1 + 2 + … + (m − 1).
  PRODUCT_OF_SUMS:
    label: Multiplied the totals instead of adding the products
    explanation: Total spending Σ pᵢqᵢ multiplies each good's price by its own quantity and then adds. Multiplying total price by total quantity also pairs one good's price with another good's quantity, which means nothing.
resources:
  - { title: "Contemporary Mathematics, 1.4 Set Operations with Two Sets (OpenStax)", url: "https://openstax.org/books/contemporary-mathematics/pages/1-4-set-operations-with-two-sets", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Contemporary Mathematics, 2.4 Truth Tables for the Conditional and Biconditional (OpenStax)", url: "https://openstax.org/books/contemporary-mathematics/pages/2-4-truth-tables-for-the-conditional-and-biconditional", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Precalculus 2e, 11.4 Series and Their Notations (OpenStax)", url: "https://openstax.org/books/precalculus-2e/pages/11-4-series-and-their-notations", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
Economic models are written in a compact language. A consumer's budget set appears as $\{(x, y) : px + qy \le m\}$, an assumption begins "for every price $p > 0$", and almost every statistics formula starts with $\sum_{i=1}^{n}$. You cannot use a model you cannot read. The same tools answer practical questions too: a bank wants to know how many customers hold at least one of its products, and a statistics office adds up spending on thousands of goods to measure GDP.

## Intuition
A **set** is a collection with a clear rule for membership: everything is either in it or not. Sets let us talk about a whole group at once: all the bundles a consumer can afford, all the firms that export, all prices between 10 and 20. Draw groups as overlapping circles (a Venn diagram) and the overlap holds those who belong to both. Counting people across overlapping groups then comes down to one rule: never count anyone twice.

**Logic** is about how statements connect. "If income rises while prices stay the same, the budget set gets bigger" is a one-way link: the budget set can also grow because a price falls. Telling one-way links from two-way links is the main skill in reading economic theory.

**Σ** is shorthand for "add these up". Instead of writing $p_1q_1 + p_2q_2 + \dots + p_{50}q_{50}$ for spending on 50 goods, write $\sum_{i=1}^{50} p_i q_i$. The index $i$ runs through the goods one at a time, and Σ collects the results.

## Definition and formulas
**Sets.**
- $x \in A$: $x$ is an element of $A$. $x \notin A$: it is not.
- $A \subseteq B$: every element of $A$ is also in $B$.
- $A \cup B$ (union): elements in $A$ or $B$ or both. $A \cap B$ (intersection): elements in both.
- $A^c$ (complement): elements of the whole population that are not in $A$. $\varnothing$: the empty set.
- $\mathbb{R}$: all real numbers. $\mathbb{R}_+ = [0, \infty)$: the non-negative reals (some books use $\mathbb{R}_+$ for strictly positive numbers, so check the convention).
- Intervals: $[a, b] = \{x : a \le x \le b\}$ includes both ends, $(a, b)$ excludes both, $[a, b)$ includes only $a$, and $[a, \infty)$ has no upper end.
- Set-builder notation $\{x \in S : \text{condition}\}$ reads "all $x$ in $S$ for which the condition holds". With prices $p, q$ and income $m$ the budget set is
$$B = \{(x, y) : x \ge 0,\ y \ge 0,\ px + qy \le m\}.$$
With $p = 2$, $q = 5$, $m = 100$: $(20, 10) \in B$ because it costs $2 \cdot 20 + 5 \cdot 10 = 90 \le 100$, but $(30, 10) \notin B$ because it costs 110.

**Counting.** $|A|$ is the number of elements of $A$. In a population of $N$:
$$|A \cup B| = |A| + |B| - |A \cap B|, \qquad |A^c| = N - |A|$$
$$|A \cup B \cup C| = |A| + |B| + |C| - |A \cap B| - |A \cap C| - |B \cap C| + |A \cap B \cap C|$$
This is inclusion–exclusion: add the groups, subtract what was counted twice, then add back what was removed too often.

**Logic.** A statement is a sentence that is either true or false, such as "the price is above 10". For statements $S$ and $T$:
- $\lnot S$ (not $S$) is true exactly when $S$ is false.
- $S \land T$ ($S$ and $T$) is true when both are true. $S \lor T$ ($S$ or $T$) is true when at least one is true: in mathematics "or" includes "both".
- $S \Rightarrow T$ ("if $S$ then $T$"): whenever $S$ is true, $T$ is true too. It is false only when $S$ is true and $T$ is false. $S$ is a **sufficient** condition for $T$, and $T$ is a **necessary** condition for $S$.
- The converse $T \Rightarrow S$ is a different statement and may be false. The contrapositive $\lnot T \Rightarrow \lnot S$ says exactly the same as $S \Rightarrow T$.
- $S \Leftrightarrow T$ ("$S$ if and only if $T$") means both $S \Rightarrow T$ and $T \Rightarrow S$: each is necessary and sufficient for the other. Example: for a firm selling a positive quantity $Q$, profit is positive $\Leftrightarrow$ the price is above average cost (cost per unit), because profit $= (\text{price} - \text{average cost}) \times Q$.
- Quantifiers: $\forall$ means "for all" and $\exists$ means "there exists". "$\forall x \in A,\ x \ge 0$" says every element of $A$ is non-negative. To deny a "for all" statement, one counterexample is enough; to deny a "there exists" statement, you must show it fails for every case.

**Summation.**
$$\sum_{i=1}^{n} x_i = x_1 + x_2 + \dots + x_n$$
- $i$ is the index; $1$ and $n$ are the lower and upper limits. A sum from $i = m$ to $i = n$ has $n - m + 1$ terms. The letter does not matter: $\sum_{j=1}^{n} x_j$ is the same sum.
- A constant: $\sum_{i=1}^{n} c = nc$.
- Linearity: $\sum (x_i + y_i) = \sum x_i + \sum y_i$ and $\sum c\,x_i = c\sum x_i$. Together:
$$\sum_{i=1}^{n} (a x_i + b) = a\sum_{i=1}^{n} x_i + nb.$$
- Two tempting rules that are false in general: $\sum x_i y_i \ne \left(\sum x_i\right)\left(\sum y_i\right)$ and $\sum x_i^2 \ne \left(\sum x_i\right)^2$.
- A standard sum: $\sum_{i=1}^{n} i = 1 + 2 + \dots + n = \dfrac{n(n+1)}{2}$. Write the sum forwards and backwards: each of the $n$ pairs adds to $n + 1$, and that counts the sum twice. Starting from $m$: $\sum_{i=m}^{n} i = \dfrac{n(n+1)}{2} - \dfrac{(m-1)m}{2}$.
- Total spending on $n$ goods with prices $p_i$ and quantities $q_i$: $E = \sum_{i=1}^{n} p_i q_i$.
- Double sums: if $x_{ij}$ is household $i$'s spending on good $j$, then $\sum_{i=1}^{m}\sum_{j=1}^{n} x_{ij}$ is the spending of all $m$ households on all $n$ goods. You may add each household's row first or each good's column first: for a finite table the order does not matter.

## Interactive
::widget{id="survey-venn"}

The survey from Example 1 drawn as bars over the 500 households: the purple bar is the savings-account holders $S$, the green bar the credit-card holders $C$, and the gold block where they overlap is the households with both. The solid gold line at the bottom is $S \cup C$ and the dashed line the households with neither. Move the three sliders and watch the panel: "At least one" is always $|S| + |C| - |S \cap C|$, never just the sum of the two groups. Check: at the start values 320, 210 and 150 the panel shows 380 with at least one, 120 with neither and 230 with exactly one. Then drag "Both" to its largest value: the green bar now sits inside the purple one, and "At least one" equals the larger group.

## Worked examples

### Example 1 (easy): a bank's customer survey
A bank surveys 500 households: 320 have a savings account, 210 have a credit card and 150 have both. How many have at least one of the two products, how many have neither, and how many have exactly one?

1. $|S| = 320$, $|C| = 210$, $|S \cap C| = 150$
   *Why:* naming the sets shows which formula applies; the households with both products form the intersection.
2. $|S \cup C| = 320 + 210 - 150 = 380$
   *Why:* adding 320 and 210 counts the 150 households with both products twice, so they are subtracted once.
3. Neither: $500 - 380 = 120$
   *Why:* households with neither product are the complement of $S \cup C$, everyone outside both circles.
4. Exactly one: $(320 - 150) + (210 - 150) = 170 + 60 = 230$
   *Why:* "savings only" and "card only" are the parts of the two circles outside the overlap.

```verify
N = 500; S = 320; C = 210; SC = 150
U = S + C - SC
assert U == 380
assert N - U == 120
assert (S - SC) + (C - SC) == 230
# the four regions of the Venn diagram make up the whole survey
assert (S - SC) + (C - SC) + SC + (N - U) == N
```

### Example 2 (medium): total spending and a per-unit tax
A household's weekly basket is shown below. Find total spending $\sum_{i=1}^{4} p_i q_i$. Then a sales tax adds 0.5 to the price of every unit. What does the same basket cost now?
$$
\begin{array}{lcc}
\text{Good } i & \text{Price } p_i & \text{Quantity } q_i \\ \hline
1 \text{ bread} & 2.5 & 8 \\
2 \text{ milk} & 1.2 & 10 \\
3 \text{ coffee} & 9 & 2 \\
4 \text{ rice} & 3 & 5
\end{array}
$$

1. $\sum_{i=1}^{4} p_i q_i = 2.5 \cdot 8 + 1.2 \cdot 10 + 9 \cdot 2 + 3 \cdot 5 = 20 + 12 + 18 + 15 = 65$
   *Why:* each term is the spending on one good, and Σ adds them for $i = 1, \dots, 4$.
2. The shortcut $\left(\sum p_i\right)\left(\sum q_i\right) = 15.7 \cdot 25 = 392.5$ is wrong.
   *Why:* multiplying the totals also pairs the price of coffee with the quantity of bread and so on; a sum of products is not a product of sums.
3. $\sum_{i=1}^{4} (p_i + 0.5)\,q_i = \sum_{i=1}^{4} p_i q_i + 0.5\sum_{i=1}^{4} q_i$
   *Why:* expand each term and use linearity; 0.5 is a constant, so it moves outside the sum.
4. $65 + 0.5 \cdot 25 = 77.5$
   *Why:* the household buys 25 units in all and each costs 0.5 more, so spending rises by 12.5, exactly the tax collected on this basket.

```verify
p = [2.5, 1.2, 9, 3]
q = [8, 10, 2, 5]
spend = sum(p .* q)
assert abs(spend - 65) < 1e-9
assert sum(q) == 25
assert abs(sum(p) * sum(q) - 392.5) < 1e-9
assert abs(sum((p + 0.5) .* q) - 77.5) < 1e-9
assert abs(spend + 0.5 * sum(q) - 77.5) < 1e-9
```

### Example 3 (hard): sales over a run of months
In month $i$ after it opens, a café sells $200 + 15i$ cups of a new drink. How many cups does it sell from month 4 to month 12 inclusive, that is, what is $\sum_{i=4}^{12} (200 + 15i)$?

1. Number of terms: $12 - 4 + 1 = 9$
   *Why:* both limits are included, so the months are 4, 5, …, 12.
2. $\sum_{i=4}^{12} (200 + 15i) = \sum_{i=4}^{12} 200 + 15\sum_{i=4}^{12} i$
   *Why:* linearity: split the sum into a constant part and an index part, and move the factor 15 outside.
3. $\sum_{i=4}^{12} 200 = 9 \cdot 200 = 1800$
   *Why:* 200 appears once in each of the 9 terms.
4. $\sum_{i=4}^{12} i = \dfrac{12 \cdot 13}{2} - \dfrac{3 \cdot 4}{2} = 78 - 6 = 72$
   *Why:* add 1 to 12 with $n(n+1)/2$, then remove months 1 to 3, which are not in the sum.
5. $1800 + 15 \cdot 72 = 1800 + 1080 = 2880$ cups
   *Why:* combine the two parts. Adding the nine terms 260, 275, …, 380 one by one gives the same total.

```verify
nTerms = 12 - 4 + 1
assert nTerms == 9
constPart = nTerms * 200
assert constPart == 1800
idx = 12*13/2 - 3*4/2
assert idx == 72
assert sum(4:12) == idx
total = constPart + 15*idx
assert total == 2880
# brute force: add the nine terms one by one
assert sum(200 + 15*(4:12)) == 2880
assert 200 + 15*4 == 260
assert 200 + 15*12 == 380
```

## Common mistakes
- Adding two groups without subtracting the overlap (FORGOT_OVERLAP).
- Subtracting the overlap twice, which gives the number in exactly one group (OVERLAP_TWICE).
- Giving the number inside the groups when the question asks how many are in none of them (UNION_NOT_COMPLEMENT).
- With three groups, forgetting to add back those in all three (FORGOT_TRIPLE).
- With three groups, subtracting the triple overlap instead of adding it (TRIPLE_SUBTRACTED).
- Writing $\sum (a + b\,i)$ as $a + b\sum i$, so the constant is added only once (CONSTANT_ONCE).
- Counting $n - m$ terms in a sum from $m$ to $n$ instead of $n - m + 1$ (OFF_BY_ONE).
- Starting the sum at $i = 1$ when the lower limit is higher (IGNORED_LOWER_LIMIT).
- Computing total spending as $\left(\sum p_i\right)\left(\sum q_i\right)$ instead of $\sum p_i q_i$ (PRODUCT_OF_SUMS).
- Reading "if $S$ then $T$" as "if $T$ then $S$": the converse is a different statement.
- Swapping necessary and sufficient: in $S \Rightarrow T$, $S$ is sufficient for $T$ and $T$ is necessary for $S$.
- Reading "or" as "one but not both": in mathematics "$S$ or $T$" is also true when both hold.
- Denying "every firm makes a profit" with "no firm makes a profit": the correct denial is "at least one firm does not make a profit".

## Practice
- `survey-inclusion-exclusion` (difficulty 1): from a survey of two overlapping groups, how many are in at least one group or in neither; distractors FORGOT_OVERLAP, OVERLAP_TWICE, UNION_NOT_COMPLEMENT.
- `sigma-linear-sum` (difficulty 2): total sales or output $\sum_{i=m}^{n} (a + b\,i)$ over a run of months or weeks; distractors CONSTANT_ONCE, OFF_BY_ONE, IGNORED_LOWER_LIMIT.
- `three-set-inclusion-exclusion` (difficulty 3): the same survey question with three overlapping groups; distractors FORGOT_OVERLAP, FORGOT_TRIPLE, TRIPLE_SUBTRACTED, UNION_NOT_COMPLEMENT.

## Real world
- National accounts: GDP measured by expenditure is a very large sum of the form $\sum p_i q_i$ over all final goods and services bought in a year.
- Price indices: a consumer price index compares what the same basket of goods costs in two periods, so it is a ratio of two sums of prices times quantities (see ST106).
- Surveys: financial inclusion surveys, such as the World Bank's Global Findex, record whether adults have a bank account, a mobile money account or both; the share with at least one is an inclusion–exclusion count.
- Theory and statistics: economic assumptions are stated with "for all", "there exists" and "if and only if", and averages, variances and regressions are all written with Σ (see ST101 and AN01).

---
id: LA205
title: Homogeneous systems and the international trade model
block: LA2
coreYear: 2
prerequisites: [LA201, LA202]
estMinutes: 45
status: draft
economicUses:
  - National incomes that balance trade between countries (the linear exchange model)
  - Changes to a production plan that leave the use of every resource unchanged
  - Models that fix only proportions, such as relative prices or balanced-growth ratios
  - Eigenvectors as solutions of the homogeneous system (A − λI)x = 0
searchTerms:
  - "Homogeneous system of linear equations"
  - "Fundamental system of solutions"
  - "Eigenvalues and international trade"
  - "International trade model"
  - "Linear exchange model"
  - "Structure matrix"
generators: [fundamental-solutions-count, trade-balance-two-countries, trade-model-three-countries]
widgets: [trade-balance-line]
mistakeCodes:
  GAVE_RANK:
    label: Gave the rank instead of the free unknowns
    explanation: The rank counts the independent equations, which fix unknowns. The number of basic solutions is the number of unknowns left free, n − r.
  COUNTED_UNKNOWNS:
    label: Counted all the unknowns
    explanation: Not every unknown is free; each independent equation ties one of them to the others. Subtract the rank, n − r.
  USED_EQUATIONS:
    label: Used the number of equations
    explanation: The size of the fundamental system depends on the number of unknowns, n − r, not on the number of equations m. Extra equations that are combinations of others change nothing.
  RATIO_FLIPPED:
    label: Turned the income ratio upside down
    explanation: Balance for country 1 says b·x₂ = a·x₁ (its exports equal its imports), so x₂ = (a/b)·x₁. The country that spends a larger share abroad needs the richer partner.
  EQUAL_INCOMES:
    label: Assumed equal incomes
    explanation: Equal incomes balance trade only when the matrix rows also add up to 1. In general solve (A − I)x = 0; the solution gives the ratios of the incomes.
  USED_HOME_SHARES:
    label: Used the shares spent at home
    explanation: Trade balance compares what each country spends abroad. Use the shares spent on the other country's goods, the off-diagonal entries of the structure matrix.
  ONE_COLUMN:
    label: Used one column of the matrix
    explanation: One column only shows how a single country splits its spending. Balance involves every country at once, so solve the whole homogeneous system (A − I)x = 0.
resources:
  - { title: "Linear Algebra, Lecture 7: Solving Ax = 0: pivot variables, special solutions (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/resources/lecture-7-solving-ax-0-pivot-variables-special-solutions/", kind: course, verifiedAt: 2026-10-21 }
  - { title: "Linear Algebra, Lecture 21: Eigenvalues and eigenvectors (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/resources/lecture-21-eigenvalues-and-eigenvectors/", kind: course, verifiedAt: 2026-10-21 }
  - { title: "Linear Algebra, Lecture 24: Markov matrices (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/resources/lecture-24-markov-matrices-fourier-series/", kind: course, verifiedAt: 2026-10-21 }
---

## Why economists need this
Three countries trade only with one another, and each spends fixed shares of its national income on goods from each country. Can their incomes be such that every country sells exactly as much as it spends, so that nobody runs a trade deficit? The question leads to a system of equations whose right-hand sides are all zero, a **homogeneous system**. Such systems never decide the *size* of the answer, only its *proportions*: they tell you that incomes must be in the ratio 19 : 24 : 21, not what each income is. The same thing happens with relative prices, with production changes that leave resource use unchanged, and with every eigenvector problem.

## Intuition
A homogeneous system $Ax = 0$ always has the boring solution $x = 0$. The interesting question is whether there are others. If $x$ is a solution, so is $2x$, and so is the sum of two solutions, so the solutions form a whole line, plane or bigger flat set through the origin. Its size depends on how many unknowns are left free once the independent equations have fixed the rest. In the trade model the equations are dependent by construction (all the money spent must be received by someone), so there is always one free unknown: the overall scale of incomes.

## Definition and formulas
**Homogeneous system.** $m$ linear equations in $n$ unknowns with all right-hand sides zero:
$$a_{11}x_1 + a_{12}x_2 + \dots + a_{1n}x_n = 0, \quad \dots, \quad a_{m1}x_1 + \dots + a_{mn}x_n = 0, \qquad\text{or}\qquad Ax = 0.$$
It is always consistent: $x = 0$ (the **trivial** solution) satisfies every equation, as the Kronecker–Capelli theorem confirms (LA201), because adding a zero column cannot raise the rank.

**When are there non-trivial solutions?** Let $r = \operatorname{rank} A$.

- If $r = n$, the only solution is $x = 0$.
- If $r < n$, there are infinitely many non-zero solutions. This is guaranteed when there are fewer equations than unknowns ($m < n$).
- For a square system ($m = n$): a non-zero solution exists exactly when $\det A = 0$ (LA104).

**The solution set is a linear space.** Sums and multiples of solutions are again solutions, so the solutions form a subspace of $\mathbb{R}^n$ (the **null space** of $A$) of dimension $n - r$.

**Fundamental system of solutions.** Any $n - r$ linearly independent solutions $v_1, \dots, v_{n-r}$ form a basis of the solution set; every solution is
$$x = c_1 v_1 + c_2 v_2 + \dots + c_{n-r} v_{n-r}$$
for some numbers $c_i$. To build one: row-reduce $A$ (LA103), choose the $n - r$ unknowns without a pivot as **free**, express the pivot unknowns in terms of them, then set one free unknown to 1 and the others to 0, in turn.

**Link with other systems.** If $Ax = b$ has one solution $x_p$, all its solutions are $x_p + x_h$, where $x_h$ runs over the solutions of $Ax = 0$. And an eigenvector of $A$ for $\lambda$ is a non-zero solution of the homogeneous system $(A - \lambda I)x = 0$, which exists exactly when $\det(A - \lambda I) = 0$ (LA202).

**The international trade model (linear exchange model).** Countries $1, \dots, n$ trade only with one another. Let $a_{ij}$ be the share of country $j$'s national income $x_j$ spent on goods from country $i$. The **structure matrix** $A = (a_{ij})$ has non-negative entries and each **column adds up to 1**: every country spends all its income somewhere.

- Country $i$'s income from sales (at home and abroad) is $\sum_j a_{ij} x_j$, the $i$-th entry of $Ax$.
- Trade is **balanced** when every country's sales equal its income: $Ax = x$, that is the homogeneous system $(A - I)x = 0$.
- The columns of $A - I$ add up to 0, so its rows are dependent, $\det(A - I) = 0$, and a non-zero solution always exists: **1 is an eigenvalue** of every structure matrix, and the balanced incomes form an eigenvector for it.
- When every $a_{ij} > 0$, this eigenvector can be chosen with all entries positive and is unique up to scale, so the model fixes the *ratios* of the incomes.
- The total of all trade balances is always zero: one country's surplus is another's deficit.

## Interactive
::widget{id="trade-balance-line"}

Two countries trade only with each other; country 1's income is fixed at 200 billion. Set **Country 1 spends abroad** and **Country 2 spends abroad**, then move **Income of country 2**. The purple line is country 1's trade balance (its exports minus its imports) for every income of country 2, and the dot shows the current one: above the zero line country 1 has a surplus, below it a deficit. At the start (30 %, 20 %, income 300) the panel shows exports and imports both equal to 60 and a balancing income of 300, as in Example 2. Raise country 2's foreign share to 40 % and the balancing income drops to 150: a country that spends more abroad needs a smaller economy to buy from it.

## Worked examples

### Example 1 (easy): plan changes that use no extra resources
A firm runs four activities and adjusts their levels by $x_1, \dots, x_4$. Three resources must be used exactly as before, which gives the homogeneous system
$$x_1 + 2x_2 - x_3 + x_4 = 0, \quad 2x_1 + 4x_2 - x_3 + 3x_4 = 0, \quad x_1 + 2x_2 + x_3 + 3x_4 = 0.$$
Find a fundamental system of solutions.

1. $R_2 - 2R_1$: $x_3 + x_4 = 0$; $\quad R_3 - R_1$: $2x_3 + 2x_4 = 0$
   *Why:* eliminate $x_1$ from the second and third equations (LA103).
2. The third equation is twice the second, so $\operatorname{rank} A = 2$.
   *Why:* after removing it, two independent equations remain.
3. $n - r = 4 - 2 = 2$ free unknowns: $x_2$ and $x_4$.
   *Why:* the pivots sit in the columns of $x_1$ and $x_3$; the other unknowns can be chosen freely.
4. $x_3 = -x_4$, $\quad x_1 = -2x_2 + x_3 - x_4 = -2x_2 - 2x_4$
   *Why:* solve the reduced equations for the pivot unknowns, from the bottom up.
5. $v_1 = (-2, 1, 0, 0)$ and $v_2 = (-2, 0, -1, 1)$; every solution is $x = c_1 v_1 + c_2 v_2$.
   *Why:* set $x_2 = 1, x_4 = 0$, then $x_2 = 0, x_4 = 1$. For example, raising activity 2 by one unit and cutting activity 1 by two leaves all three resources untouched.

```verify
A = [[1, 2, -1, 1], [2, 4, -1, 3], [1, 2, 1, 3]]
v1 = [-2, 1, 0, 0]
v2 = [-2, 0, -1, 1]
assert deepEqual(multiply(A, v1), [0, 0, 0])
assert deepEqual(multiply(A, v2), [0, 0, 0])
assert deepEqual(multiply(A, 3*v1 - 5*v2), [0, 0, 0])
```

### Example 2 (medium): balanced trade between two countries
Country 1 spends 30 % of its income on goods from country 2; country 2 spends 20 % of its income on goods from country 1. The rest is spent at home. Country 1's national income is 200 billion. What income must country 2 have for trade to be balanced?

1. $A = \begin{pmatrix} 0.7 & 0.2 \\ 0.3 & 0.8 \end{pmatrix}$
   *Why:* column $j$ shows how country $j$ splits its income; each column adds up to 1.
2. $0.7x_1 + 0.2x_2 = x_1 \;\Rightarrow\; 0.2x_2 = 0.3x_1$
   *Why:* the first equation of $Ax = x$: country 1's sales must equal its income. In words, its exports $0.2x_2$ must equal its imports $0.3x_1$.
3. The second equation, $0.3x_1 + 0.8x_2 = x_2$, gives the same condition.
   *Why:* the columns of $A - I$ add up to 0, so the two equations are dependent; the solution is a whole line, $x = t\,(2, 3)$.
4. $x_2 = 1.5 \cdot 200 = 300$ billion
   *Why:* only the ratio $x_1 : x_2 = 2 : 3$ is fixed; the given income of country 1 picks one point on the line.

```verify
A = [[0.7, 0.2], [0.3, 0.8]]
x = [200, 300]
assert deepEqual(round(multiply(A, x), 9), [200, 300])
assert abs(det(A - identity(2))) < 0.000000001
```

### Example 3 (hard): balanced trade among three countries
The structure matrix of three countries is
$$A = \begin{pmatrix} 0.4 & 0.3 & 0.2 \\ 0.3 & 0.5 & 0.3 \\ 0.3 & 0.2 & 0.5 \end{pmatrix}.$$
In what ratio must their national incomes be for balanced trade? If country 1's income is 190 billion, what are the others?

1. Each column adds up to 1, so $A$ is a structure matrix and $\lambda = 1$ is an eigenvalue.
   *Why:* every structure matrix has eigenvalue 1, so balanced incomes exist.
2. $(A - I)x = 0$, multiplied by 10: $-6x_1 + 3x_2 + 2x_3 = 0$, $\quad 3x_1 - 5x_2 + 3x_3 = 0$, $\quad 3x_1 + 2x_2 - 5x_3 = 0$
   *Why:* the three equations add up to $0 = 0$, so one of them is redundant; keep the first two.
3. $x = t\,(19,\ 24,\ 21)$
   *Why:* a vector orthogonal to $(-6, 3, 2)$ and $(3, -5, 3)$ satisfies both equations; their cross product gives it: $(3 \cdot 3 - 2 \cdot (-5),\ 2 \cdot 3 - (-6) \cdot 3,\ (-6)(-5) - 3 \cdot 3) = (19, 24, 21)$.
4. With $x_1 = 190$: $t = 10$, so $x_2 = 240$ and $x_3 = 210$ billion.
   *Why:* scale the ratios to the given income.
5. Check country 3: sales $0.3 \cdot 190 + 0.2 \cdot 240 + 0.5 \cdot 210 = 57 + 48 + 105 = 210$.
   *Why:* its sales equal its income, so it is balanced; the same holds for the other two countries.

```verify
A = [[0.4, 0.3, 0.2], [0.3, 0.5, 0.3], [0.3, 0.2, 0.5]]
x = [190, 240, 210]
assert deepEqual(round(multiply(A, x), 9), [190, 240, 210])
assert deepEqual(cross([-6, 3, 2], [3, -5, 3]), [19, 24, 21])
assert abs(det(A - identity(3))) < 0.000000001
```

## Common mistakes
- Giving the rank as the number of basic solutions (GAVE_RANK).
- Counting every unknown as free (COUNTED_UNKNOWNS).
- Using the number of equations instead of the number of unknowns (USED_EQUATIONS).
- Turning the income ratio upside down (RATIO_FLIPPED).
- Assuming that equal incomes balance trade (EQUAL_INCOMES).
- Using the shares spent at home instead of the shares spent abroad (USED_HOME_SHARES).
- Reading the answer off one column of the structure matrix (ONE_COLUMN).
- Expecting a homogeneous system to give a unique non-zero answer: it fixes proportions, and any multiple of a solution is a solution too.
- Mixing up rows and columns of the structure matrix: columns describe how a country spends, rows how it earns.

## Practice
- `fundamental-solutions-count` (difficulty 1): the number of vectors in a fundamental system of solutions of $Ax = 0$; distractors GAVE_RANK, COUNTED_UNKNOWNS, USED_EQUATIONS.
- `trade-balance-two-countries` (difficulty 2): the income of country 2 that balances trade with country 1; distractors RATIO_FLIPPED, EQUAL_INCOMES, USED_HOME_SHARES.
- `trade-model-three-countries` (difficulty 3): balanced incomes for three countries from $(A - I)x = 0$; distractors EQUAL_INCOMES, RATIO_FLIPPED, ONE_COLUMN.

## Real world
- Trade imbalances: persistent surpluses and deficits between large economies are a recurring topic in international economics; the exchange model shows the accounting fact behind them, that the balances of all trading partners add up to zero.
- Input–output and exchange models: models in the tradition of Leontief (LA106) and of the linear exchange model describe how spending flows between sectors or countries with matrices whose columns are shares adding up to 1.
- Ranking and steady states: matrices with columns adding up to 1 also describe population flows and Markov chains (SP01); their eigenvector for eigenvalue 1 gives the long-run shares, the same mathematics as balanced trade.
- Production planning: changes in activity levels that keep every resource's use unchanged solve a homogeneous system; planners use them to shift output between products without buying more inputs.

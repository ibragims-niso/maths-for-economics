---
id: LA201
title: "Linear spaces: independence, basis, rank, change of basis"
block: LA2
coreYear: 2
prerequisites: [LA105]
estMinutes: 50
status: draft
economicUses:
  - "Redundant equations: Walras' law makes one market-clearing condition follow from the others"
  - "Identification: perfectly collinear regressors make OLS estimates impossible"
  - Redundant assets and complete markets in finance
  - "Counting the independent equations of a model before solving it (rank and Ax = b)"
generators: [replicate-payoff-coordinates, matrix-rank-elimination, dependence-parameter-k]
widgets: [span-and-basis]
mistakeCodes:
  STANDARD_COORDINATES:
    label: Gave the entry of x, not its coordinate
    explanation: The entries of x are its coordinates in the standard basis (1, 0), (0, 1). In the basis {A, B} the coordinates are the numbers c₁, c₂ with x = c₁A + c₂B, found from c = P⁻¹x.
  MULTIPLIED_BY_P:
    label: Multiplied by P instead of P⁻¹
    explanation: P turns coordinates into the vector, x = Pc. To go the other way, from the vector to its coordinates, multiply by the inverse, c = P⁻¹x.
  BASIS_AS_ROWS:
    label: Put the basis vectors in the rows
    explanation: The basis vectors go into the columns of P, so that Pc = c₁A + c₂B. Writing them as rows solves a different system and gives the wrong coordinates.
  INVERSE_SIGNS:
    label: Forgot the minus signs in the 2×2 inverse
    explanation: For P with rows (a, b) and (c, d), P⁻¹ = (1/det) times the matrix with rows (d, −b) and (−c, a). Swap the diagonal entries and change the sign of the other two.
  COUNTED_ROWS:
    label: Counted the rows
    explanation: The rank is the number of independent rows, not the number of rows. Row-reduce first; a row that becomes all zeros was a combination of the others and does not count.
  COUNTED_COLUMNS:
    label: Counted the columns
    explanation: The rank can never be more than the number of rows or the number of columns, whichever is smaller. A 3×4 matrix has rank at most 3; count the pivots after elimination.
  MISSED_DEPENDENT_ROW:
    label: Removed only one redundant row
    explanation: When every row is a multiple of the first one, all of them except the first become zero rows after elimination. Clear the whole column below the pivot before counting.
  FIRST_ENTRIES_ONLY:
    label: Judged rows proportional from their first entries
    explanation: Two rows are multiples of each other only if every entry has the same ratio. Rows that start (2, 4, …) and (4, 8, …) can still be independent if a later entry breaks the pattern; elimination shows it.
  SIGN:
    label: Sign slip when solving for k
    explanation: From αk + β = 0 the solution is k = −β/α. Check by putting your k back into the determinant; it must give exactly 0.
  PAIR_PROPORTIONAL:
    label: Made two of the vectors parallel
    explanation: Three vectors can be dependent without any two of them being parallel; one may be a combination of the other two. Use the 3×3 determinant, not a 2×2 one.
  CHECKERBOARD_SIGNS:
    label: Forgot the checkerboard signs
    explanation: In a cofactor expansion each minor gets the sign (−1)^(i+j), the pattern + − + down a column. Leaving out the minus on the middle term changes the determinant.
resources:
  - { title: "18.06SC Linear Algebra: Independence, Basis and Dimension (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/pages/ax-b-and-the-four-subspaces/independence-basis-and-dimension/", kind: course, verifiedAt: 2026-10-18 }
  - { title: "18.06SC Linear Algebra: Solving Ax = b, Row Reduced Form R (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/pages/ax-b-and-the-four-subspaces/solving-ax-b-row-reduced-form-r/", kind: course, verifiedAt: 2026-10-18 }
  - { title: "18.06SC Linear Algebra: Transposes, Permutations, Vector Spaces (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/pages/ax-b-and-the-four-subspaces/transposes-permutations-vector-spaces/", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
Economic models often contain more equations than real information. In a general equilibrium model with three markets, Walras' law says that if two markets clear, the third clears automatically, so its equation adds nothing: three equations, but only two independent ones. A wage regression that includes age, years of schooling and years of work experience can break down in the same way when experience is computed as age minus schooling minus 6: one column of the data is a combination of the others, and the computer cannot separate their effects. In finance, an asset whose payoffs can be copied by a mix of other assets is redundant, and its price is pinned down by theirs.

All three questions are the same mathematical question: how many of these vectors carry genuinely new information? This topic gives the tools to answer it: span, linear independence, basis, rank, and coordinates in a basis.

## Intuition
Think of vectors as ingredients. A **linear combination** mixes them in some amounts, $s\,a + t\,b$, and the **span** is everything you can cook from them. In the plane, two arrows that point in different directions can be mixed to reach any point: they span the whole plane. Two arrows on the same line can only reach points on that line, however you mix them.

A set of vectors is **linearly dependent** when one of them can be made from the others. That vector is redundant: removing it does not shrink the span. A set is **independent** when every vector brings a new direction.

A **basis** is a set of building blocks with no waste: it spans the space and is independent. Then every vector can be built in exactly one way, and the amounts used are its **coordinates** in that basis. The usual entries of a vector are its coordinates in the standard basis; a different basis gives a different recipe for the same vector.

The **rank** of a matrix counts how many of its rows (or, equally, its columns) are independent. For a system of equations it is the number of equations that carry real information.

## Definition and formulas
**Linear combinations and span.** For vectors $v_1, \dots, v_k$ in $\mathbb{R}^n$ and numbers $c_1, \dots, c_k$, the vector $c_1 v_1 + \dots + c_k v_k$ is a linear combination. The span is the set of all of them:
$$\operatorname{span}\{v_1, \dots, v_k\} = \{c_1 v_1 + \dots + c_k v_k : c_1, \dots, c_k \in \mathbb{R}\}$$

**Subspaces.** A set $S$ of vectors in $\mathbb{R}^n$ is a subspace (a linear space inside $\mathbb{R}^n$) when it contains $0$ and is closed under addition and scalar multiples: if $x, y \in S$ and $t$ is a number, then $x + y \in S$ and $t\,x \in S$.
- Every span is a subspace. In $\mathbb{R}^2$ the subspaces are $\{0\}$, the lines through the origin and the whole plane.
- The line $x_2 = x_1 + 1$ is not a subspace: it misses the origin.

**Linear independence.** The vectors $v_1, \dots, v_k$ are linearly independent if
$$c_1 v_1 + \dots + c_k v_k = 0 \quad\text{only when}\quad c_1 = \dots = c_k = 0.$$
Otherwise they are dependent, and at least one of them is a combination of the others.
- Two vectors are dependent exactly when one is a multiple of the other.
- A set that contains the zero vector is dependent.
- More than $n$ vectors in $\mathbb{R}^n$ are always dependent.

**Tests.** For $n$ vectors in $\mathbb{R}^n$, put them as the columns of a square matrix $M$:
$$v_1, \dots, v_n \text{ independent} \iff \det M \neq 0.$$
For any number of vectors, row-reduce the matrix with the vectors as columns (or rows) to echelon form (LA103): they are independent exactly when every column (or row) gets a pivot.

**Basis and dimension.** A basis of a subspace $S$ is an independent set that spans $S$. Every basis of $S$ has the same number of vectors, the dimension of $S$. The standard basis of $\mathbb{R}^n$ is $e_1 = (1, 0, \dots, 0), \dots, e_n = (0, \dots, 0, 1)$, so $\dim \mathbb{R}^n = n$. Any $n$ independent vectors in $\mathbb{R}^n$ form a basis.

**Rank.** The rank of an $m \times n$ matrix $A$ is the number of pivots in its echelon form. It equals the largest number of independent rows and also the largest number of independent columns, so
$$\operatorname{rank} A \le \min(m, n).$$
A square $n \times n$ matrix has rank $n$ exactly when $\det A \neq 0$, which is exactly when $A^{-1}$ exists (LA105).

**Rank and the system $Ax = b$** (the Rouché–Capelli or Kronecker–Capelli theorem). For $m$ equations in $n$ unknowns with augmented matrix $[A \mid b]$:
- the system has a solution if and only if $\operatorname{rank} A = \operatorname{rank}\,[A \mid b]$;
- if it has one and $\operatorname{rank} A = n$, the solution is unique;
- if it has one and $\operatorname{rank} A = r < n$, there are infinitely many solutions, with $n - r$ unknowns free to choose.

**Coordinates and change of basis.** If $b_1, \dots, b_n$ is a basis of $\mathbb{R}^n$, put the basis vectors as the columns of $P = [\,b_1 \;\cdots\; b_n\,]$. The coordinates $c = (c_1, \dots, c_n)$ of $x$ in this basis satisfy
$$x = c_1 b_1 + \dots + c_n b_n = P\,c, \qquad\text{so}\qquad c = P^{-1} x.$$
$P$ is invertible because its columns are independent. Going back, $x = Pc$. If $Q$ holds a second basis, coordinates change from the first basis to the second by $c' = Q^{-1} P\, c$.

## Interactive
::widget{id="span-and-basis"}

The green vector $a = (2, 1)$ stays fixed; the two sliders set the entries $b_1$ and $b_2$ of the gold vector $b$. The panel shows $\det\,[a\;b]$, the rank of $[a\;b]$ and whether $a$ and $b$ form a basis of $\mathbb{R}^2$. You start at $b = (3, 4)$, the assets of Example 1: det 5, rank 2, basis Yes, and the shaded parallelogram has area 5. Now set $b_1 = 4$ and $b_2 = 2$: then $b = 2a$, the panel shows det 0, rank 1 and No, and the shading collapses onto a dashed line, the span of the two vectors. Try $b = (-1, -0.5)$ as well: it points the other way, but it lies on the same line, so it is still dependent.

## Worked examples

### Example 1 (easy): replicating a payoff with two assets
Asset A pays $(2, 1)$ and asset B pays $(3, 4)$, where the first entry is the payoff in a recession and the second in a boom. Do A and B form a basis of $\mathbb{R}^2$? How many units of each give exactly the payoff $x = (13, 14)$? If A costs 1.5 and B costs 2, what must $x$ cost?

1. $P = \begin{pmatrix} 2 & 3 \\ 1 & 4 \end{pmatrix}$, $\;\det P = 2 \cdot 4 - 3 \cdot 1 = 5 \neq 0$
   *Why:* with the payoff vectors as columns, a non-zero determinant means A and B are independent; two independent vectors in $\mathbb{R}^2$ form a basis.
2. $P^{-1} = \dfrac{1}{5}\begin{pmatrix} 4 & -3 \\ -1 & 2 \end{pmatrix}$
   *Why:* swap the diagonal entries, change the sign of the other two and divide by the determinant (LA105).
3. $c = P^{-1}x = \dfrac{1}{5}\begin{pmatrix} 4 \cdot 13 - 3 \cdot 14 \\ -13 + 2 \cdot 14 \end{pmatrix} = \dfrac{1}{5}\begin{pmatrix} 10 \\ 15 \end{pmatrix} = \begin{pmatrix} 2 \\ 3 \end{pmatrix}$
   *Why:* $x = Pc$, so the coordinates of $x$ in the basis $\{A, B\}$ are $c = P^{-1}x$: 2 units of A and 3 units of B.
4. Check: $2\,(2, 1) + 3\,(3, 4) = (4 + 9,\; 2 + 12) = (13, 14)$
   *Why:* rebuilding $x$ from its coordinates must give $x$ back in both states.
5. Cost: $2 \cdot 1.5 + 3 \cdot 2 = 9$
   *Why:* a portfolio that pays exactly the same in every state must cost the same as $x$; otherwise one could buy the cheaper one and sell the dearer one for a sure profit.

```verify
P = [2, 3; 1, 4]
x = [13; 14]
assert det(P) == 5
assert sum(abs(inv(P)*5 - [4, -3; -1, 2])) < 1e-9
c = inv(P)*x
assert abs(c[1,1] - 2) < 1e-9
assert abs(c[2,1] - 3) < 1e-9
assert 4*13 - 3*14 == 10
assert -13 + 2*14 == 15
assert deepEqual(2*[2; 1] + 3*[3; 4], x)
assert 2*1.5 + 3*2 == 9
```

### Example 2 (medium): a redundant market equation
A model of three linked markets gives these market-clearing conditions for the prices $p_1, p_2, p_3$:
$$2p_1 - p_2 = 4, \qquad -p_1 + 2p_2 - p_3 = 3, \qquad p_1 + p_2 - p_3 = 7.$$
The third equation is the sum of the first two, the kind of redundancy Walras' law creates. Find $\operatorname{rank} A$ and $\operatorname{rank}\,[A \mid b]$, decide what kind of solution the system has, and find the prices when $p_3 = 4$. What happens if the right-hand side of the third equation is 8 instead?

1. $[A \mid b] = \left(\begin{array}{rrr|r} 2 & -1 & 0 & 4 \\ -1 & 2 & -1 & 3 \\ 1 & 1 & -1 & 7 \end{array}\right)$
   *Why:* the augmented matrix holds the coefficients and, after the bar, the right-hand sides.
2. $R_2 \to 2R_2 + R_1$, $\;R_3 \to 2R_3 - R_1$: rows 2 and 3 both become $(0,\; 3,\; -2 \mid 10)$
   *Why:* elimination clears the first column below the pivot 2 and does not change the rank.
3. $R_3 \to R_3 - R_2$: row 3 becomes $(0,\; 0,\; 0 \mid 0)$
   *Why:* a zero row means the third equation was a combination of the first two; it carries no new information.
4. $\operatorname{rank} A = \operatorname{rank}\,[A \mid b] = 2 < 3$
   *Why:* two pivots remain on both sides of the bar. Equal ranks mean the system is consistent; rank below the 3 unknowns means infinitely many solutions with $3 - 2 = 1$ free unknown.
5. With $p_3 = 4$: $3p_2 - 2 \cdot 4 = 10 \Rightarrow p_2 = 6$, and $2p_1 - 6 = 4 \Rightarrow p_1 = 5$
   *Why:* the free unknown must be fixed by outside information, here a chosen value of $p_3$; back-substitution in the echelon form then gives the rest.
6. With 8 on the right of the third equation, row 3 ends as $(0,\; 0,\; 0 \mid 2)$, that is $0 = 2$
   *Why:* now $\operatorname{rank}\,[A \mid b] = 3 \neq 2 = \operatorname{rank} A$, so the system has no solution: the third equation contradicts the other two.

```verify
A = [2, -1, 0; -1, 2, -1; 1, 1, -1]
b = [4; 3; 7]
assert deepEqual(A[3, :], A[1, :] + A[2, :])
assert b[3,1] == b[1,1] + b[2,1]
assert det(A) == 0
assert det([2, -1; -1, 2]) == 3
# all four 3x3 minors of [A | b] vanish, so its rank is also 2
Ab = [2, -1, 0, 4; -1, 2, -1, 3; 1, 1, -1, 7]
assert abs(det(Ab[:, [1, 2, 4]])) < 1e-9
assert abs(det(Ab[:, [1, 3, 4]])) < 1e-9
assert abs(det(Ab[:, [2, 3, 4]])) < 1e-9
assert deepEqual(2*Ab[2, :] + Ab[1, :], [0, 3, -2, 10])
assert deepEqual(2*Ab[3, :] - Ab[1, :], [0, 3, -2, 10])
p = [5; 6; 4]
assert deepEqual(A*p, b)
# right-hand side 8: the minor with the b column is not zero, so rank [A | b] = 3
Ab8 = [2, -1, 0, 4; -1, 2, -1, 3; 1, 1, -1, 8]
assert abs(det(Ab8[:, [1, 2, 4]]) - 3) < 1e-9
assert 2*8 - 4 - 10 == 2
```

### Example 3 (hard): when is a third asset redundant?
Three assets pay in three states (recession, normal, boom): a bond $A = (1, 1, 1)$, a share $B = (1, 2, 4)$ and a fund $C = (3, 5, k)$. For which $k$ is $C$ redundant, that is, for which $k$ are $A$, $B$, $C$ linearly dependent? Write $C$ as a combination of $A$ and $B$ for that $k$, and say what happens for every other $k$.

1. $M = \begin{pmatrix} 1 & 1 & 3 \\ 1 & 2 & 5 \\ 1 & 4 & k \end{pmatrix}$, dependent $\iff \det M = 0$
   *Why:* three vectors in $\mathbb{R}^3$ are dependent exactly when the matrix with them as columns has determinant zero.
2. $C_{13} = +(1 \cdot 4 - 2 \cdot 1) = 2$, $\;C_{23} = -(1 \cdot 4 - 1 \cdot 1) = -3$, $\;C_{33} = +(1 \cdot 2 - 1 \cdot 1) = 1$
   *Why:* expanding along the third column, the one that contains $k$, keeps the algebra short; the signs follow the checkerboard + − +.
3. $\det M = 3 \cdot 2 + 5 \cdot (-3) + k \cdot 1 = k - 9$, so $\det M = 0 \iff k = 9$
   *Why:* each entry of the column is multiplied by its cofactor and the products are added.
4. $C = s\,A + t\,B$: $\;s + t = 3$ and $s + 2t = 5$ give $t = 2$, $s = 1$; the third entry is $1 + 2 \cdot 4 = 9$
   *Why:* the first two states fix the mix; the third state confirms that $C = A + 2B$ exactly when $k = 9$.
5. For $k = 9$: $\operatorname{rank} M = 2$. For $k \neq 9$: $\det M \neq 0$, so $A$, $B$, $C$ form a basis of $\mathbb{R}^3$
   *Why:* at $k = 9$ the fund only repackages the bond and the share, and its price must equal the price of $A$ plus twice the price of $B$. For any other $k$ the three assets span all of $\mathbb{R}^3$: any payoff across the three states can be built from them, a complete market.

```verify
M = [1, 1, 3; 1, 2, 5; 1, 4, 9]
assert abs(det(M)) < 1e-9
C13 = det([1, 2; 1, 4])
C23 = -det([1, 1; 1, 4])
C33 = det([1, 1; 1, 2])
assert C13 == 2 and C23 == -3 and C33 == 1
# det = 3*C13 + 5*C23 + k*C33 is k - 9: check at two values of k
M0 = [1, 1, 3; 1, 2, 5; 1, 4, 0]
M10 = [1, 1, 3; 1, 2, 5; 1, 4, 10]
assert abs(det(M0) - (-9)) < 1e-9
assert abs(det(M10) - 1) < 1e-9
assert 3*C13 + 5*C23 == -9
assert deepEqual([1; 1; 1] + 2*[1; 2; 4], [3; 5; 9])
assert det([1, 1; 1, 2]) == 1
```

## Common mistakes
- Giving the entries of $x$ as its coordinates in the new basis (STANDARD_COORDINATES).
- Multiplying $x$ by $P$ when the coordinates need $P^{-1}x$ (MULTIPLIED_BY_P).
- Writing the basis vectors as the rows of $P$ instead of its columns (BASIS_AS_ROWS).
- Forgetting to change the signs of the off-diagonal entries in a 2×2 inverse (INVERSE_SIGNS).
- Giving the number of rows as the rank without row-reducing first (COUNTED_ROWS).
- Giving the number of columns as the rank of a wide matrix (COUNTED_COLUMNS).
- Stopping after one row has become zero when every row is a multiple of the first (MISSED_DEPENDENT_ROW).
- Calling two rows proportional because their first entries are (FIRST_ENTRIES_ONLY).
- Solving $\alpha k + \beta = 0$ with the wrong sign (SIGN).
- Thinking three vectors are dependent only when two of them are parallel (PAIR_PROPORTIONAL).
- Leaving out the checkerboard signs in a cofactor expansion (CHECKERBOARD_SIGNS).
- Treating a line or plane that misses the origin as a subspace: it is not closed under scalar multiples, since $0 \cdot x = 0$ must belong to it.
- Reading "rank $A$ = rank $[A \mid b]$" as "unique solution". Equal ranks only mean that a solution exists; it is unique only when the rank also equals the number of unknowns.

## Practice
- `replicate-payoff-coordinates` (difficulty 1): units of one asset needed to copy a payoff, a coordinate in the basis of two assets, $c = P^{-1}x$; distractors STANDARD_COORDINATES, MULTIPLIED_BY_P, BASIS_AS_ROWS, INVERSE_SIGNS.
- `matrix-rank-elimination` (difficulty 2): the rank of a 3×3 or 3×4 matrix of equation coefficients by Gaussian elimination; distractors COUNTED_ROWS, COUNTED_COLUMNS, MISSED_DEPENDENT_ROW, FIRST_ENTRIES_ONLY.
- `dependence-parameter-k` (difficulty 3): the value of $k$ that makes three vectors of $\mathbb{R}^3$ linearly dependent, from $\det = 0$; distractors SIGN, PAIR_PROPORTIONAL, CHECKERBOARD_SIGNS.

## Real world
- Econometrics: if one regressor is an exact combination of others (experience = age − schooling − 6, or a dummy for every category next to a constant, the "dummy variable trap"), the data matrix $X$ has rank below its number of columns. Then $X^{\mathsf T}X$ has no inverse, the OLS estimates do not exist, and software drops a variable (see EM01).
- General equilibrium: with $n$ markets, Walras' law leaves only $n - 1$ independent market-clearing equations, so the model fixes relative prices only. Economists choose one good as the numéraire and set its price to 1.
- Finance: with $S$ possible states of the world, markets are complete when the payoff vectors of the traded assets have rank $S$. Options and other derivatives that can be copied by a portfolio of existing assets are redundant, and their price follows from the prices of that portfolio.
- Data analysis: dozens of interest rates or regional price series often move together with a few common factors. Their data matrix is close to a low rank, and principal component analysis changes to a basis in which those few directions come first.

---
id: LA105
title: The inverse matrix
block: LA1
coreYear: 1
prerequisites: [LA104]
estMinutes: 45
status: draft
economicUses:
  - "Solving linked-market models Ap = b in one step: p = A⁻¹b"
  - "Policy scenarios: one inverse answers every new demand or supply shock"
  - "Comparative statics: the entries of A⁻¹ are the multipliers of a linear model"
  - "Regression: the OLS estimator uses (XᵀX)⁻¹"
generators: [inverse-2x2-entry, equilibrium-prices-inverse, inverse-3x3-cofactor-entry]
widgets: [inverse-two-markets]
mistakeCodes:
  NO_DIVIDE_DET:
    label: Forgot to divide by the determinant
    explanation: Swapping the diagonal and changing the signs gives the adjugate, which is det A times the inverse. Divide every entry by det A, so A⁻¹ = (1/det A)(d −b; −c a).
  NO_DIAGONAL_SWAP:
    label: Did not swap the diagonal entries
    explanation: In the 2×2 inverse the two diagonal entries change places, so the top-left entry of A⁻¹ is d/det A, not a/det A. Check by multiplying A by your answer; you should get the identity matrix.
  NO_SIGN_CHANGE:
    label: Kept the signs of the off-diagonal entries
    explanation: The two off-diagonal entries stay in place but change sign, so the top-right entry of A⁻¹ is −b/det A. Multiplying A by your answer shows the mistake, because the off-diagonal entries of the product are not 0.
  RECIPROCAL_ENTRY:
    label: Took the reciprocal of each entry
    explanation: A matrix is not inverted entry by entry; 1/a is not an entry of A⁻¹. Every entry of the inverse depends on the whole matrix through det A and the cofactors.
  WRONG_ORDER:
    label: Multiplied b by A⁻¹ in the wrong order
    explanation: The solution is x = A⁻¹b with b a column, so entry k of x uses row k of A⁻¹. Writing b as a row on the left, bᵀA⁻¹, uses column k instead; this only works by luck when A⁻¹ is symmetric.
  USED_A:
    label: Multiplied by A instead of A⁻¹
    explanation: A sends the prices to b, so A times b goes the wrong way. To get from b back to the prices, multiply by the inverse, p = A⁻¹b.
  IGNORED_OTHER_MARKET:
    label: Solved one market on its own
    explanation: Dividing b by the own-price coefficient ignores the cross effects, as if the other prices were 0. In linked markets every price depends on every entry of b, which is exactly what a row of A⁻¹ collects.
  TRANSPOSED:
    label: Forgot to transpose the cofactors
    explanation: The adjugate is the transpose of the cofactor matrix, so the entry in row i, column j of A⁻¹ is Cⱼᵢ/det A, the cofactor of the swapped position. Using Cᵢⱼ gives the entry of the transposed inverse.
  COFACTOR_SIGN:
    label: Left out the cofactor sign
    explanation: A cofactor is the minor times (−1)^(i+j), following the chessboard pattern + − + / − + − / + − +. Where i + j is odd the sign of the minor must change.
resources:
  - { title: "College Algebra 2e, 7.7 Solving Systems with Inverses (OpenStax)", url: "https://openstax.org/books/college-algebra-2e/pages/7-7-solving-systems-with-inverses", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "18.06SC Linear Algebra: Multiplication and Inverse Matrices (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/pages/ax-b-and-the-four-subspaces/multiplication-and-inverse-matrices/", kind: course, verifiedAt: 2026-10-18 }
  - { title: "18.06SC Linear Algebra: Cramer's Rule, Inverse Matrix and Volume (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/pages/least-squares-determinants-and-eigenvalues/cramers-rule-inverse-matrix-and-volume/", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
Tea and coffee are substitutes: when coffee gets dearer, some people switch to tea, so the two markets are linked. Setting demand equal to supply in both markets gives a system of equations $Ap = b$, where $p$ lists the prices, $A$ holds the price effects and $b$ holds everything else (incomes, weather, tastes, input costs). A ministry or a central bank then asks "what if" many times: what if demand for tea rises, what if coffee supply falls? Each question changes $b$ but not $A$. If you know the inverse matrix $A^{-1}$, every new scenario is a single multiplication, $p = A^{-1}b$. The same object appears later in regression, where the least-squares estimates are built from $(X^TX)^{-1}$ (EM01).

## Intuition
For numbers, dividing undoes multiplying: if $3x = 12$, then $x = 3^{-1} \cdot 12 = 4$, because $3^{-1} \cdot 3 = 1$. Matrices cannot be divided, but many square matrices have a partner $A^{-1}$ that undoes them: if $A$ sends the prices $x$ to $b$, then $A^{-1}$ sends $b$ back to $x$. Doing $A$ and then $A^{-1}$ changes nothing, which is what the identity matrix $I$ does.

Not every matrix can be undone. The number 0 has no reciprocal, and a matrix with determinant 0 has no inverse: it squashes the plane onto a line (LA104), so two different price vectors can end up at the same $b$, and from $b$ alone you cannot tell which one you started from. When the determinant is close to 0 the inverse exists but its entries are huge, so small changes in $b$ cause big swings in $x$.

The inverse is also a table of effects. Column $j$ of $A^{-1}$ says how every price moves when entry $j$ of $b$ rises by one unit. For linked markets this is the whole comparative-statics answer at once.

## Definition and formulas
**Identity matrix.** $I$ has 1s on the diagonal and 0s elsewhere, and $AI = IA = A$ for every square $A$ of the same size. For $n = 2$: $I = \begin{pmatrix} 1 & 0 \\ 0 & 1 \end{pmatrix}$.

**Inverse.** A square $n \times n$ matrix $A$ is **invertible** (non-singular) when there is a matrix $A^{-1}$ with
$$AA^{-1} = A^{-1}A = I.$$
The inverse is unique when it exists. Only square matrices can have one.

**When it exists.** $A^{-1}$ exists exactly when $\det A \ne 0$. A matrix with $\det A = 0$ is **singular**; then $Ax = b$ has either no solution or infinitely many.

**The 2×2 formula.** Swap the diagonal entries, change the signs of the other two, and divide by the determinant:
$$A = \begin{pmatrix} a & b \\ c & d \end{pmatrix}, \qquad A^{-1} = \frac{1}{ad - bc}\begin{pmatrix} d & -b \\ -c & a \end{pmatrix}, \quad ad - bc \ne 0.$$

**Any size: the adjugate (cofactor) formula.** With the cofactors $C_{ij} = (-1)^{i+j}M_{ij}$, where the minor $M_{ij}$ is the determinant left after deleting row $i$ and column $j$:
$$A^{-1} = \frac{1}{\det A}\,\operatorname{adj} A, \qquad \operatorname{adj} A = C^T, \qquad (A^{-1})_{ij} = \frac{C_{ji}}{\det A}.$$
Note the swapped indices: the adjugate is the *transpose* of the matrix of cofactors. For a 2×2 matrix this gives exactly the swap-and-change-signs rule.

**Any size: Gauss–Jordan elimination.** Write $A$ and $I$ side by side as $[A \mid I]$ and use row operations (swap two rows, multiply a row by a non-zero number, add a multiple of one row to another) until the left half is $I$. The right half is then $A^{-1}$:
$$[A \mid I] \;\longrightarrow\; [I \mid A^{-1}].$$
If a row of zeros appears on the left, $A$ is singular. For 3×3 and larger matrices this is usually less work than computing all the cofactors.

**Rules** (for invertible $A$, $B$ of the same size and a number $k \ne 0$):
- $(A^{-1})^{-1} = A$
- $(AB)^{-1} = B^{-1}A^{-1}$, in reverse order: $(AB)(B^{-1}A^{-1}) = A(BB^{-1})A^{-1} = AA^{-1} = I$. Like socks and shoes, the last thing done is the first thing undone.
- $(A^T)^{-1} = (A^{-1})^T$
- $(kA)^{-1} = \dfrac{1}{k}A^{-1}$
- $\det(A^{-1}) = \dfrac{1}{\det A}$

**Solving a system.** If $A$ is invertible, multiplying $Ax = b$ on the left by $A^{-1}$ gives the unique solution
$$x = A^{-1}b.$$
- **Many right-hand sides.** One inverse solves $Ax = b$ for every $b$: $x_1 = A^{-1}b_1$, $x_2 = A^{-1}b_2$, and so on. This is why it pays to compute $A^{-1}$ when a model is solved for many scenarios.
- **Changes.** A change $\Delta b$ moves the solution by $\Delta x = A^{-1}\Delta b$; column $j$ of $A^{-1}$ is the effect of raising $b_j$ by one unit.
- For a single system, elimination (LA103) is quicker than finding the inverse first.

## Interactive
::widget{id="inverse-two-markets"}

The two markets of Example 2 are $a_{11}P_1 - P_2 = b_1$ (tea) and $-P_1 + a_{22}P_2 = 30$ (coffee). The lilac line shows the prices at which the tea market clears, the green line those at which the coffee market clears, and the dot $x = A^{-1}b$ is where they cross. You start at $a_{11} = 3$, $a_{22} = 2$, $b_1 = 40$: the panel shows $\det A = 5$, $A^{-1} = [0.4 \;\; 0.2;\; 0.2 \;\; 0.6]$ (rows separated by ";") and $x = (22, 26)$, as in Examples 1 and 2. Move $b_1$ to 45: $A^{-1}$ does not change and $x$ becomes $(24, 27)$, the tea-demand shock of Example 2. Now put $b_1$ back to 40 and lower the own-price effects to $a_{11} = 1.25$ and $a_{22} = 1$: the lines are almost parallel, $\det A = 0.25$, the panel shows $A^{-1} = [4 \;\; 4;\; 4 \;\; 5]$, and $x = (280, 310)$ is far off the picture. At $a_{11} = 1$, $a_{22} = 1$ the lines are parallel, $\det A = 0$ and there is no inverse.

## Worked examples

### Example 1 (easy): the inverse of a 2×2 matrix
In the tea and coffee model of Example 2 the equilibrium prices solve $Ap = b$ with $A = \begin{pmatrix} 3 & -1 \\ -1 & 2 \end{pmatrix}$. Find $A^{-1}$ and check that it undoes $A$.

1. $\det A = 3 \cdot 2 - (-1)(-1) = 6 - 1 = 5$
   *Why:* the determinant is not 0, so the inverse exists, and it is the number we divide by.
2. Swap the diagonal and change the other signs: $\begin{pmatrix} 2 & 1 \\ 1 & 3 \end{pmatrix}$
   *Why:* this is the adjugate of a 2×2 matrix; the two $-1$ entries become $+1$.
3. $A^{-1} = \dfrac{1}{5}\begin{pmatrix} 2 & 1 \\ 1 & 3 \end{pmatrix} = \begin{pmatrix} 0.4 & 0.2 \\ 0.2 & 0.6 \end{pmatrix}$
   *Why:* divide every entry of the adjugate by $\det A$.
4. $AA^{-1} = \begin{pmatrix} 3(0.4) - 0.2 & 3(0.2) - 0.6 \\ -0.4 + 2(0.2) & -0.2 + 2(0.6) \end{pmatrix} = \begin{pmatrix} 1 & 0 \\ 0 & 1 \end{pmatrix}$
   *Why:* multiplying back is the quickest check; any slip in steps 1–3 shows up as an entry that is not 0 or 1.

```verify
A = [3, -1; -1, 2]
assert det(A) == 5
adj = [2, 1; 1, 3]
Ai = adj/5
assert deepEqual(Ai, [0.4, 0.2; 0.2, 0.6])
assert sum(abs(Ai - inv(A))) < 0.000000001
P = A*Ai
assert abs(P[1,1] - 1) < 0.000000001
assert abs(P[1,2]) < 0.000000001
assert abs(P[2,1]) < 0.000000001
assert abs(P[2,2] - 1) < 0.000000001
```

### Example 2 (medium): one inverse, three demand scenarios
Tea (good 1) and coffee (good 2) are substitutes. Demand and supply are
$Q_1^d = 30 - 2P_1 + P_2$, $Q_1^s = -10 + P_1$ for tea and $Q_2^d = 25 + P_1 - P_2$, $Q_2^s = -5 + P_2$ for coffee. Find the equilibrium prices. Then find them again (a) when demand for tea rises by 5 units at every price, and (b) when instead demand for coffee rises by 5 units.

1. Tea: $30 - 2P_1 + P_2 = -10 + P_1 \Rightarrow 3P_1 - P_2 = 40$; coffee: $25 + P_1 - P_2 = -5 + P_2 \Rightarrow -P_1 + 2P_2 = 30$
   *Why:* each market clears where demand equals supply; collecting the prices on the left gives $Ap = b$ with the matrix $A$ of Example 1 and $b = (40, 30)$.
2. $p = A^{-1}b = \begin{pmatrix} 0.4 \cdot 40 + 0.2 \cdot 30 \\ 0.2 \cdot 40 + 0.6 \cdot 30 \end{pmatrix} = \begin{pmatrix} 22 \\ 26 \end{pmatrix}$
   *Why:* entry $k$ of $A^{-1}b$ is row $k$ of $A^{-1}$ times the column $b$. Check: $Q_1 = -10 + 22 = 12$ and $Q_2 = -5 + 26 = 21$, the same from demand.
3. (a) The tea intercept goes from 30 to 35, so $b = (45, 30)$ and $p = \begin{pmatrix} 0.4 \cdot 45 + 0.2 \cdot 30 \\ 0.2 \cdot 45 + 0.6 \cdot 30 \end{pmatrix} = \begin{pmatrix} 24 \\ 27 \end{pmatrix}$
   *Why:* only $b$ changes; the same $A^{-1}$ gives the new prices without solving anything again.
4. (b) The coffee intercept goes from 25 to 30, so $b = (40, 35)$ and $p = \begin{pmatrix} 0.4 \cdot 40 + 0.2 \cdot 35 \\ 0.2 \cdot 40 + 0.6 \cdot 35 \end{pmatrix} = \begin{pmatrix} 23 \\ 29 \end{pmatrix}$
   *Why:* again one multiplication by the inverse we already have.
5. In (a), $\Delta p = A^{-1}\Delta b = 5\begin{pmatrix} 0.4 \\ 0.2 \end{pmatrix} = \begin{pmatrix} 2 \\ 1 \end{pmatrix}$
   *Why:* column 1 of $A^{-1}$ is the effect of one extra unit of tea demand. Both prices rise, because buyers who leave dearer tea push up the demand for coffee.

```verify
A = [3, -1; -1, 2]
Ai = inv(A)
p = Ai*[40; 30]
assert sum(abs(p - [22; 26])) < 0.000000001
# the prices clear both markets
assert abs((30 - 2*22 + 26) - (-10 + 22)) < 0.000000001
assert -10 + 22 == 12
assert 25 + 22 - 26 == 21
assert -5 + 26 == 21
pa = Ai*[45; 30]
assert sum(abs(pa - [24; 27])) < 0.000000001
pb = Ai*[40; 35]
assert sum(abs(pb - [23; 29])) < 0.000000001
assert sum(abs(Ai*[5; 0] - [2; 1])) < 0.000000001
assert sum(abs((pa - p) - [2; 1])) < 0.000000001
```

### Example 3 (hard): three markets by Gauss–Jordan
Tea (1), coffee (2) and cocoa (3): coffee is a substitute for both other drinks, while tea and cocoa are not linked. Setting demand equal to supply gives
$2P_1 - P_2 = 8$, $-P_1 + 2P_2 - P_3 = 12$, $-P_2 + 2P_3 = 16$. Find $A^{-1}$ by Gauss–Jordan elimination, check one entry with cofactors, and find the equilibrium prices.

1. $[A \mid I] = \left(\begin{array}{rrr|rrr} 2 & -1 & 0 & 1 & 0 & 0 \\ -1 & 2 & -1 & 0 & 1 & 0 \\ 0 & -1 & 2 & 0 & 0 & 1 \end{array}\right)$
   *Why:* every row operation is applied to both halves, so the right half records what has been done to $I$.
2. $R_2 \to 2R_2 + R_1$: $\;(0,\ 3,\ -2 \mid 1,\ 2,\ 0)$
   *Why:* this clears the entry below the first pivot without creating fractions.
3. $R_3 \to 3R_3 + R_2$: $\;(0,\ 0,\ 4 \mid 1,\ 2,\ 3)$
   *Why:* this clears the entry below the second pivot; the left half is now upper triangular, with no zero on the diagonal, so $A$ is invertible.
4. $R_3 \to \tfrac{1}{4}R_3$: $(0,\ 0,\ 1 \mid 0.25,\ 0.5,\ 0.75)$; $\;R_2 \to \tfrac{1}{3}(R_2 + 2R_3)$: $(0,\ 1,\ 0 \mid 0.5,\ 1,\ 0.5)$; $\;R_1 \to \tfrac{1}{2}(R_1 + R_2)$: $(1,\ 0,\ 0 \mid 0.75,\ 0.5,\ 0.25)$
   *Why:* working upwards, each pivot is scaled to 1 and used to clear the entries above it. The left half is now $I$.
5. $A^{-1} = \begin{pmatrix} 0.75 & 0.5 & 0.25 \\ 0.5 & 1 & 0.5 \\ 0.25 & 0.5 & 0.75 \end{pmatrix}$
   *Why:* when the left half has become $I$, the right half is the inverse.
6. $\det A = 2(4 - 1) - (-1)(-2 - 0) + 0 = 4$, $\;C_{21} = -\det\begin{pmatrix} -1 & 0 \\ -1 & 2 \end{pmatrix} = -(-2) = 2$, so $(A^{-1})_{12} = \dfrac{C_{21}}{\det A} = \dfrac{2}{4} = 0.5$
   *Why:* the entry in row 1, column 2 of the inverse uses the cofactor of position (2, 1); it agrees with step 5.
7. $p = A^{-1}b = \begin{pmatrix} 0.75 \cdot 8 + 0.5 \cdot 12 + 0.25 \cdot 16 \\ 0.5 \cdot 8 + 1 \cdot 12 + 0.5 \cdot 16 \\ 0.25 \cdot 8 + 0.5 \cdot 12 + 0.75 \cdot 16 \end{pmatrix} = \begin{pmatrix} 16 \\ 24 \\ 20 \end{pmatrix}$
   *Why:* row $k$ of $A^{-1}$ times $b$ gives price $k$. Check the coffee equation: $-16 + 2 \cdot 24 - 20 = 12$.

```verify
M = [2, -1, 0, 1, 0, 0; -1, 2, -1, 0, 1, 0; 0, -1, 2, 0, 0, 1]
M[2,:] = 2*M[2,:] + M[1,:]
assert deepEqual(M[2,:], [0, 3, -2, 1, 2, 0])
M[3,:] = 3*M[3,:] + M[2,:]
assert deepEqual(M[3,:], [0, 0, 4, 1, 2, 3])
M[3,:] = M[3,:]/4
M[2,:] = (M[2,:] + 2*M[3,:])/3
M[1,:] = (M[1,:] + M[2,:])/2
assert deepEqual(M[3,:], [0, 0, 1, 0.25, 0.5, 0.75])
assert deepEqual(M[2,:], [0, 1, 0, 0.5, 1, 0.5])
assert deepEqual(M[1,:], [1, 0, 0, 0.75, 0.5, 0.25])
A = [2, -1, 0; -1, 2, -1; 0, -1, 2]
Ai = M[:, 4:6]
assert deepEqual(A*Ai, identity(3))
assert abs(det(A) - 4) < 0.000000001
assert 2*(4 - 1) - (-1)*(-2 - 0) == 4
C21 = (-1)^(2 + 1)*det([-1, 0; -1, 2])
assert abs(C21 - 2) < 0.000000001
assert abs(C21/4 - Ai[1,2]) < 0.000000001
b = [8; 12; 16]
p = Ai*b
assert deepEqual(p, [16; 24; 20])
assert deepEqual(A*p, b)
assert -16 + 2*24 - 20 == 12
```

## Common mistakes
- Swapping the diagonal and changing the signs but forgetting to divide by $\det A$ (NO_DIVIDE_DET).
- Leaving the diagonal entries in place in the 2×2 formula (NO_DIAGONAL_SWAP).
- Changing the diagonal but keeping the signs of the off-diagonal entries (NO_SIGN_CHANGE).
- "Inverting" a matrix by taking $1/a_{ij}$ of each entry (RECIPROCAL_ENTRY).
- Computing $x$ as $b^TA^{-1}$ (row times matrix) instead of $A^{-1}b$ (WRONG_ORDER).
- Multiplying $b$ by $A$ instead of by $A^{-1}$ (USED_A).
- Solving each market on its own and ignoring the cross effects (IGNORED_OTHER_MARKET).
- Using the cofactor $C_{ij}$ for the entry $(A^{-1})_{ij}$ instead of $C_{ji}$: the adjugate is transposed (TRANSPOSED).
- Forgetting the $(-1)^{i+j}$ sign when turning a minor into a cofactor (COFACTOR_SIGN).
- Writing $(AB)^{-1} = A^{-1}B^{-1}$: the order reverses, $(AB)^{-1} = B^{-1}A^{-1}$.
- Looking for an inverse when $\det A = 0$, or for a non-square matrix: neither has one.

## Practice
- `inverse-2x2-entry` (difficulty 1): one entry of the inverse of a 2×2 whole-number matrix with $\det A = \pm 1, \pm 2, \pm 4$ or $\pm 5$; distractors NO_DIVIDE_DET, NO_DIAGONAL_SWAP, NO_SIGN_CHANGE, RECIPROCAL_ENTRY.
- `equilibrium-prices-inverse` (difficulty 2): one equilibrium price of 2 or 3 linked markets from $p = A^{-1}b$, with $A^{-1}$ given; distractors WRONG_ORDER, USED_A, IGNORED_OTHER_MARKET.
- `inverse-3x3-cofactor-entry` (difficulty 3): one off-diagonal entry of a 3×3 inverse from $(A^{-1})_{ij} = C_{ji}/\det A$; distractors TRANSPOSED, NO_DIVIDE_DET, COFACTOR_SIGN.

## Real world
- Policy scenarios: ministries and central banks solve linear models of linked markets or sectors for many shocks at a time (a harvest failure, a tax change, a rise in world prices). The coefficient matrix stays the same, so one inverse turns each new scenario into a multiplication.
- Macroeconomic multipliers: in a linear model of the goods and money markets, national income and the interest rate solve a 2×2 system, and the entries of the inverse are the multipliers of government spending and of the money supply (compare F11).
- Regression: the least-squares estimates of a wage or demand equation are $\hat\beta = (X^TX)^{-1}X^Ty$ (EM01). When two explanatory variables move almost together, $\det(X^TX)$ is close to 0 and the estimates swing wildly, the problem known as multicollinearity.
- Inter-industry linkages: input–output tables of a whole economy are analysed with an inverse matrix too (LA106).

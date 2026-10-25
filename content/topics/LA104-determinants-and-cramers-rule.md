---
id: LA104
title: "Determinants and Cramer's rule"
block: LA1
coreYear: 1
prerequisites: [LA103]
estMinutes: 45
status: draft
economicUses:
  - Checking that a linear market or macro model has exactly one equilibrium
  - "Comparative statics: how equilibrium prices move when demand or supply shifts"
  - Solving small national income models for income and consumption
  - Spillovers between related markets for substitutes and complements
searchTerms:
  - "Determinant"
  - "Properties of the determinant and calculation rules"
  - "Determinants of order 2 and 3"
  - "Laplace's theorem"
  - "Determinants of higher order"
  - "Minors and algebraic complements"
  - "Cofactors"
  - "Square system of linear equations"
  - "Cramer's method"
generators: [cramer-income-model, determinant-3x3-cofactor, cramer-two-market-price]
widgets: [determinant-area]
mistakeCodes:
  WRONG_COLUMN:
    label: Replaced the wrong column
    explanation: To find the j-th unknown, replace column j, the column that holds that unknown's coefficients, by the right-hand side. Replacing a different column gives you a different unknown.
  NOT_DIVIDED:
    label: Forgot to divide by det A
    explanation: Cramer's rule gives each unknown as a ratio, xⱼ = det Aⱼ / det A. The determinant of the matrix with the replaced column is only the numerator.
  INVERTED_CRAMER:
    label: Divided det A by det Aⱼ
    explanation: The matrix that contains the right-hand side goes on top. Each unknown is det Aⱼ / det A, not det A / det Aⱼ.
  DET_ADDED:
    label: Used ad + bc for a 2×2 determinant
    explanation: A 2×2 determinant is the product down the main diagonal minus the product down the other diagonal, a₁₁a₂₂ − a₁₂a₂₁. Keep the minus sign, and put negative entries in brackets so their signs are not lost.
  COFACTOR_SIGN:
    label: Ignored the + − + sign pattern
    explanation: The cofactor of entry (i, j) is (−1)^(i+j) times its minor, so along the first row the signs are +, −, +. The middle term is subtracted.
  SARRUS_ADDED:
    label: Added the back diagonals in the rule of Sarrus
    explanation: In the rule of Sarrus the three products running down to the right are added and the three products running down to the left are subtracted.
  DIAGONALS_ONLY:
    label: Treated a 3×3 determinant like a 2×2 one
    explanation: Main diagonal minus the other diagonal works only for 2×2 matrices. A 3×3 determinant has six products; use cofactor expansion or the rule of Sarrus.
resources:
  - { title: "College Algebra 2e, 7.8 Solving Systems with Cramer's Rule (OpenStax)", url: "https://openstax.org/books/college-algebra-2e/pages/7-8-solving-systems-with-cramers-rule", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "MIT 18.06 Linear Algebra, Lecture 18: Properties of determinants (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/resources/lecture-18-properties-of-determinants/", kind: video, verifiedAt: 2026-10-18 }
  - { title: "MIT 18.06 Linear Algebra, Lecture 20: Cramer's rule, inverse matrix, and volume (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/resources/lecture-20-cramers-rule-inverse-matrix-and-volume/", kind: video, verifiedAt: 2026-10-18 }
---

## Why economists need this
A model of two related markets, or of national income, is a small system of linear equations. Before solving it, an economist asks two questions. Does the model have exactly one equilibrium? And when something outside the model changes (incomes rise and shift demand, the government spends more), how far does each equilibrium value move? One number, the determinant of the coefficient matrix, answers the first question. Cramer's rule answers the second: it writes every equilibrium value as a ratio of two determinants, so you can see at once which parameters it depends on and how strongly. This way of comparing equilibria before and after a change is called **comparative statics**, and it runs through micro- and macroeconomics.

## Intuition
A 2×2 matrix $A$ moves every point of the plane to a new point. The unit square, with sides $(1, 0)$ and $(0, 1)$, is sent to a parallelogram whose sides are the two **columns** of $A$. The determinant is the factor by which $A$ scales areas: the parallelogram has area $|\det A|$. Its sign says whether the square was flipped over on the way (negative) or kept its orientation (positive).

Now think of a system $A\mathbf{x} = \mathbf{d}$. Solving it means finding how much of each column to combine to reach the point $\mathbf{d}$. If the two columns point in different directions, every point can be reached, and in exactly one way. If they lie on the same line, the parallelogram is squashed flat and $\det A = 0$: most points cannot be reached at all, and the points on that line can be reached in infinitely many ways. In terms of the equations, the two lines are parallel (no solution) or the same line (infinitely many). So $\det A \neq 0$ is exactly the condition for a unique solution, the same condition as finding a pivot in every column in Gaussian elimination (LA103).

## Definition and formulas
**2×2 determinant.**
$$\det \begin{bmatrix} a_{11} & a_{12} \\ a_{21} & a_{22} \end{bmatrix} = a_{11}a_{22} - a_{12}a_{21}$$
the product down the main diagonal minus the product down the other diagonal.

**Minors and cofactors.** The minor $M_{ij}$ is the determinant of the matrix left after deleting row $i$ and column $j$. The cofactor is $C_{ij} = (-1)^{i+j} M_{ij}$, so the signs follow a chessboard pattern:
$$\begin{bmatrix} + & - & + \\ - & + & - \\ + & - & + \end{bmatrix}$$

**3×3 determinant by cofactor expansion** along the first row:
$$\det A = a_{11}M_{11} - a_{12}M_{12} + a_{13}M_{13}$$
Any row or column gives the same answer (with its own signs from the pattern), so expand along one with zeros to save work.

**Determinants of any order (Laplace expansion).** The same rule defines the determinant of an $n \times n$ matrix: pick any row $i$ (or column) and add each entry times its cofactor,
$$\det A = \sum_{j=1}^{n} a_{ij} C_{ij}, \qquad C_{ij} = (-1)^{i+j} M_{ij}$$
where the minor $M_{ij}$ is now an $(n-1) \times (n-1)$ determinant, expanded the same way until you reach $2 \times 2$. If you multiply one row by the cofactors of a *different* row, the sum is always 0; this is what makes the adjugate formula for the inverse work (LA105). For a $4 \times 4$ or larger matrix, expanding directly means many small determinants, so in practice first use row operations to create zeros (or reach triangular form, where the determinant is the product of the diagonal), then expand.

**Rule of Sarrus** (3×3 only, a useful check). Write the first two columns again to the right of the matrix. Add the three products running down to the right and subtract the three running down to the left:
$$\det A = a_{11}a_{22}a_{33} + a_{12}a_{23}a_{31} + a_{13}a_{21}a_{32} - a_{13}a_{22}a_{31} - a_{11}a_{23}a_{32} - a_{12}a_{21}a_{33}$$

**Properties** ($A$ and $B$ are $n \times n$):
- swapping two rows changes the sign of the determinant;
- adding a multiple of one row to another leaves it unchanged, so the row operations of Gaussian elimination (apart from swaps and scaling) keep $\det A$, and the determinant of a triangular matrix is the product of its diagonal entries;
- multiplying one row by $k$ multiplies the determinant by $k$, so $\det(kA) = k^n \det A$;
- a row of zeros, or two equal rows, gives $\det A = 0$;
- $\det(AB) = \det A \cdot \det B$;
- $\det(A^T) = \det A$, so every rule for rows also holds for columns.

**Determinant and solutions.** For a square system $A\mathbf{x} = \mathbf{d}$ ($n$ equations, $n$ unknowns):
$$\det A \neq 0 \iff \text{the system has exactly one solution for every } \mathbf{d}$$
If $\det A = 0$ there is either no solution or infinitely many; Gaussian elimination (LA103) tells you which.

**Cramer's rule.** If $\det A \neq 0$, the $j$-th unknown is
$$x_j = \frac{\det A_j}{\det A}$$
where $A_j$ is $A$ with column $j$ replaced by the right-hand side $\mathbf{d}$. For two equations:
$$x_1 = \frac{d_1 a_{22} - a_{12} d_2}{a_{11}a_{22} - a_{12}a_{21}}, \qquad x_2 = \frac{a_{11} d_2 - d_1 a_{21}}{a_{11}a_{22} - a_{12}a_{21}}$$

*Why it works.* Write the columns of $A$ as $\mathbf{a}_1, \mathbf{a}_2$, so $\mathbf{d} = x_1\mathbf{a}_1 + x_2\mathbf{a}_2$. A determinant is linear in each column, and a determinant with two equal columns is zero, so
$$\det[\mathbf{d}\;\; \mathbf{a}_2] = x_1 \det[\mathbf{a}_1\;\; \mathbf{a}_2] + x_2 \det[\mathbf{a}_2\;\; \mathbf{a}_2] = x_1 \det A$$
Divide by $\det A$ and you have Cramer's rule for $x_1$; the same argument works for every unknown and every size.

**Comparative statics.** Because $\det A_j$ is linear in $\mathbf{d}$, a change $\Delta\mathbf{d}$ in the right-hand side changes each unknown by
$$\Delta x_j = \frac{\det\left(A \text{ with column } j \text{ replaced by } \Delta\mathbf{d}\right)}{\det A}$$
For one market with demand $Q = \alpha - \beta P$ and supply $Q = -\gamma + \delta P$, the system $Q + \beta P = \alpha$, $Q - \delta P = -\gamma$ has $\det A = -(\beta + \delta)$ and
$$P^* = \frac{\det\begin{bmatrix} 1 & \alpha \\ 1 & -\gamma \end{bmatrix}}{-(\beta + \delta)} = \frac{\alpha + \gamma}{\beta + \delta}, \qquad \frac{\Delta P^*}{\Delta \alpha} = \frac{1}{\beta + \delta}$$
A demand shift of $\Delta\alpha$ raises the price by less than $\Delta\alpha$, and by less the more both curves respond to the price.

## Interactive
::widget{id="determinant-area"}

The graph shows what the matrix $A$ of Example 3 does to the dashed unit square. The first column of $A$ is fixed at $(3, -1)$ (green line); the two sliders set the second column, the **top-right entry a₁₂** and the **bottom-right entry a₂₂** (lilac line, solid dot). The gold parallelogram is the image of the square, and the panel shows $\det A$ as a signed area, whether the orientation is kept or flipped, and whether a system $A\mathbf{x} = \mathbf{d}$ has a unique solution. At the start the panel shows $\det A = 5$. Now set $a_{12} = -3$ and $a_{22} = 1$: the second column $(-3, 1)$ points exactly opposite the first, the parallelogram collapses onto a line, and the panel shows $\det A = 0$ and "no" unique solution. Then try $a_{12} = 0$, $a_{22} = -1$: the panel shows $\det A = -3$ and the orientation is flipped.

## Worked examples

### Example 1 (easy): national income by Cramer's rule
An economy has $Y = C + I + G$ and $C = 50 + 0.8Y$, with $I = 150$ and $G = 200$ (in billions); it is the economy of Example 1 in F11. Write the model as a linear system and find equilibrium income $Y$ and consumption $C$ with Cramer's rule.

1. $Y - C = 350$ and $-0.8Y + C = 50$, so $A = \begin{bmatrix} 1 & -1 \\ -0.8 & 1 \end{bmatrix}$ and $\mathbf{d} = \begin{bmatrix} 350 \\ 50 \end{bmatrix}$
   *Why:* move the unknowns to the left. Each row is one equation, and each column holds the coefficients of one unknown ($Y$ first, then $C$).
2. $\det A = 1 \cdot 1 - (-1)(-0.8) = 0.2$
   *Why:* main diagonal minus the other diagonal. It equals $1 - b$, which is not zero, so there is exactly one equilibrium.
3. $\det A_Y = \det\begin{bmatrix} 350 & -1 \\ 50 & 1 \end{bmatrix} = 350 + 50 = 400$, so $Y^* = \dfrac{400}{0.2} = 2000$
   *Why:* to find $Y$, replace the first column, the coefficients of $Y$, by the right-hand side.
4. $\det A_C = \det\begin{bmatrix} 1 & 350 \\ -0.8 & 50 \end{bmatrix} = 50 + 280 = 330$, so $C^* = \dfrac{330}{0.2} = 1650$. Check: $1650 + 150 + 200 = 2000$.
   *Why:* now the second column, the coefficients of $C$, is replaced. Substituting back confirms the first equation.
5. $G$ appears only in $\mathbf{d}$: raising $G$ by 1 raises $\det A_Y$ by 1, so $Y^*$ rises by $\dfrac{1}{0.2} = 5$.
   *Why:* the factor $1/\det A = 1/(1 - b)$ is exactly the spending multiplier of F11.

```verify
A = [1, -1; -0.8, 1]
assert abs(det(A) - 0.2) < 1e-12
AY = [350, -1; 50, 1]
AC = [1, 350; -0.8, 50]
assert abs(det(AY) - 400) < 1e-9
assert abs(det(AC) - 330) < 1e-9
Yeq = det(AY)/det(A)
Ceq = det(AC)/det(A)
assert abs(Yeq - 2000) < 1e-6
assert abs(Ceq - 1650) < 1e-6
assert abs(Ceq + 150 + 200 - Yeq) < 1e-6
assert abs(50 + 0.8*Yeq - Ceq) < 1e-6
Y2 = det([351, -1; 50, 1])/det(A)
assert abs(Y2 - Yeq - 5) < 1e-6
```

### Example 2 (medium): a three-market model
Three linked markets clear when $4P_1 - P_2 - P_3 = d_1$, $-2P_1 + 5P_2 - P_3 = d_2$ and $-P_1 - 2P_2 + 3P_3 = d_3$, where the $d_i$ depend on demand and supply intercepts. Find $\det A$ by cofactor expansion, check it with the rule of Sarrus, and decide whether the model always has one equilibrium. Then find the determinant after swapping the first two equations, and after doubling every coefficient.

1. $M_{11} = \det\begin{bmatrix} 5 & -1 \\ -2 & 3 \end{bmatrix} = 13$, $M_{12} = \det\begin{bmatrix} -2 & -1 \\ -1 & 3 \end{bmatrix} = -7$, $M_{13} = \det\begin{bmatrix} -2 & 5 \\ -1 & -2 \end{bmatrix} = 9$
   *Why:* for each entry of the first row, delete its row and column and take the 2×2 determinant that is left: $15 - 2$, $-6 - 1$ and $4 + 5$.
2. $\det A = 4 \cdot 13 - (-1)(-7) + (-1) \cdot 9 = 52 - 7 - 9 = 36$
   *Why:* along the first row the cofactor signs are $+, -, +$, so the middle term is subtracted.
3. Sarrus: $(60 - 1 - 4) - (5 + 8 + 6) = 55 - 19 = 36$
   *Why:* down to the right: $4 \cdot 5 \cdot 3$, $(-1)(-1)(-1)$, $(-1)(-2)(-2)$; down to the left: $(-1) \cdot 5 \cdot (-1)$, $4(-1)(-2)$, $(-1)(-2) \cdot 3$. Two different methods agree.
4. $\det A = 36 \neq 0$, so for any intercepts $d_1, d_2, d_3$ the three markets have exactly one equilibrium.
   *Why:* a non-zero determinant means a unique solution for every right-hand side.
5. Swapping the first two equations gives $-36$; doubling every coefficient gives $2^3 \cdot 36 = 288$.
   *Why:* a row swap changes the sign. Doubling every coefficient doubles each of the three rows, and each row contributes a factor 2, so the answer is $8 \times 36$, not $2 \times 36$.

```verify
A = [4, -1, -1; -2, 5, -1; -1, -2, 3]
assert abs(det(A) - 36) < 1e-9
M11 = det([5, -1; -2, 3])
M12 = det([-2, -1; -1, 3])
M13 = det([-2, 5; -1, -2])
assert abs(M11 - 13) < 1e-9
assert abs(M12 + 7) < 1e-9
assert abs(M13 - 9) < 1e-9
assert abs(4*M11 - (-1)*M12 + (-1)*M13 - 36) < 1e-9
fwd = 4*5*3 + (-1)*(-1)*(-1) + (-1)*(-2)*(-2)
back = (-1)*5*(-1) + 4*(-1)*(-2) + (-1)*(-2)*3
assert fwd == 55
assert back == 19
assert fwd - back == 36
S = [-2, 5, -1; 4, -1, -1; -1, -2, 3]
assert abs(det(S) + 36) < 1e-9
assert abs(det(2*A) - 288) < 1e-9
assert abs(det(transpose(A)) - 36) < 1e-9
```

### Example 3 (hard): two related markets and a demand shift
Goods 1 and 2 are substitutes. Market 1: demand $Q_1 = 12 - P_1 + P_2$, supply $Q_1 = 2P_1 - 2$. Market 2: demand $Q_2 = 10 + P_1 - P_2$, supply $Q_2 = P_2 - 2$. Find the equilibrium prices with Cramer's rule. Then higher incomes raise demand for good 1 by 5 at every price: how do both prices change?

1. $3P_1 - P_2 = 14$ and $-P_1 + 2P_2 = 12$
   *Why:* set demand equal to supply in each market, e.g. $12 - P_1 + P_2 = 2P_1 - 2$, and collect the prices on the left. Both prices appear in both equations, so the markets must be solved together.
2. $\det A = \det\begin{bmatrix} 3 & -1 \\ -1 & 2 \end{bmatrix} = 6 - 1 = 5$
   *Why:* not zero, so there is exactly one equilibrium.
3. $P_1 = \dfrac{1}{5}\det\begin{bmatrix} 14 & -1 \\ 12 & 2 \end{bmatrix} = \dfrac{40}{5} = 8$, $P_2 = \dfrac{1}{5}\det\begin{bmatrix} 3 & 14 \\ -1 & 12 \end{bmatrix} = \dfrac{50}{5} = 10$, so $Q_1 = 14$ and $Q_2 = 8$
   *Why:* replace column 1 for $P_1$ and column 2 for $P_2$; the quantities come from the supply curves, $2 \cdot 8 - 2$ and $10 - 2$.
4. The shift turns $d_1 = 14$ into 19, so $\Delta\mathbf{d} = (5, 0)$: $\Delta P_1 = \dfrac{1}{5}\det\begin{bmatrix} 5 & -1 \\ 0 & 2 \end{bmatrix} = 2$, $\Delta P_2 = \dfrac{1}{5}\det\begin{bmatrix} 3 & 5 \\ -1 & 0 \end{bmatrix} = 1$
   *Why:* the demand intercept of market 1 goes from 12 to 17, which moves only the right-hand side. Determinants are linear in the replaced column, so the change in each price is Cramer's rule applied to the change $\Delta\mathbf{d}$ alone.
5. New prices $P_1 = 10$ and $P_2 = 11$, with $Q_1 = 18$ and $Q_2 = 9$. Check: $17 - 10 + 11 = 18 = 2 \cdot 10 - 2$.
   *Why:* each unit of extra demand for good 1 raises $P_1$ by 0.4 and $P_2$ by 0.2. Good 2 becomes dearer too, because some buyers switch to the substitute when good 1 gets more expensive.

```verify
A = [3, -1; -1, 2]
assert abs(det(A) - 5) < 1e-9
A1 = [14, -1; 12, 2]
A2 = [3, 14; -1, 12]
assert abs(det(A1) - 40) < 1e-9
assert abs(det(A2) - 50) < 1e-9
P1 = det(A1)/det(A)
P2 = det(A2)/det(A)
assert abs(P1 - 8) < 1e-9
assert abs(P2 - 10) < 1e-9
assert abs(12 - P1 + P2 - (2*P1 - 2)) < 1e-9
assert abs(10 + P1 - P2 - (P2 - 2)) < 1e-9
assert abs(2*P1 - 2 - 14) < 1e-9
assert abs(P2 - 2 - 8) < 1e-9
dP1 = det([5, -1; 0, 2])/det(A)
dP2 = det([3, 5; -1, 0])/det(A)
assert abs(dP1 - 2) < 1e-9
assert abs(dP2 - 1) < 1e-9
N1 = det([19, -1; 12, 2])/det(A)
N2 = det([3, 19; -1, 12])/det(A)
assert abs(N1 - 10) < 1e-9
assert abs(N2 - 11) < 1e-9
assert abs(17 - N1 + N2 - 18) < 1e-9
assert abs(2*N1 - 2 - 18) < 1e-9
assert abs(10 + N1 - N2 - 9) < 1e-9
assert abs(N2 - 2 - 9) < 1e-9
assert abs(dP1/5 - 0.4) < 1e-12
assert abs(dP2/5 - 0.2) < 1e-12
```

## Common mistakes
- Replacing the column of a different unknown, which gives that other unknown instead (WRONG_COLUMN).
- Stopping at $\det A_j$ and forgetting to divide by $\det A$ (NOT_DIVIDED).
- Turning the ratio upside down, $\det A / \det A_j$ (INVERTED_CRAMER).
- Computing a 2×2 determinant as $a_{11}a_{22} + a_{12}a_{21}$, often by losing the sign of a negative entry (DET_ADDED).
- Adding all three terms of a cofactor expansion instead of using the signs $+, -, +$ (COFACTOR_SIGN).
- In the rule of Sarrus, adding the three products that run down to the left instead of subtracting them (SARRUS_ADDED).
- Working out a 3×3 determinant as the main-diagonal product minus the other-diagonal product, as if it were 2×2 (DIAGONALS_ONLY).
- Writing $\det(2A) = 2\det A$: for an $n \times n$ matrix it is $2^n \det A$. Similarly, $\det(A + B)$ is in general not $\det A + \det B$.
- Using Cramer's rule when $\det A = 0$ or when the system is not square: the rule then does not apply, so use Gaussian elimination from LA103 instead.

## Practice
- `cramer-income-model` (difficulty 1): equilibrium income $Y$ or consumption $C$ in the model $Y = C + I + G$, $C = a + bY$, by Cramer's rule; distractors WRONG_COLUMN, NOT_DIVIDED, INVERTED_CRAMER, DET_ADDED.
- `determinant-3x3-cofactor` (difficulty 2): the determinant of a 3×3 integer coefficient matrix by cofactor expansion along the first row; distractors COFACTOR_SIGN, SARRUS_ADDED, DIAGONALS_ONLY.
- `cramer-two-market-price` (difficulty 3): one equilibrium price in two markets for substitutes, by Cramer's rule; distractors WRONG_COLUMN, NOT_DIVIDED, INVERTED_CRAMER, DET_ADDED.

## Real world
- Macroeconomic models: in the IS–LM model, income and the interest rate solve two linear equations, and Cramer's rule gives the effect of government spending or the money supply on each of them as a ratio of determinants. The sign of each ratio tells policymakers which way the economy moves.
- Agricultural and energy markets: models of substitutes such as wheat and maize, or gas and electricity, show how a harvest failure or a supply shock in one market spills over into the price of the other, exactly as in Example 3.
- Econometrics: least-squares regression needs $\det(X^T X) \neq 0$. When two explanatory variables are perfectly collinear the determinant is zero and their separate effects cannot be estimated (see LA105 and EM01).
- Optimisation: for a firm choosing two outputs, the signs of determinants built from second derivatives decide whether a stationary point is a maximum or a minimum (MV07).

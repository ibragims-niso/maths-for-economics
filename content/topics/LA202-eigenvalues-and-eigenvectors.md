---
id: LA202
title: Eigenvalues and eigenvectors
block: LA2
coreYear: 2
prerequisites: [LA201]
estMinutes: 50
status: draft
economicUses:
  - Long-run growth rate and sector mix of a multi-sector economy
  - "Long-run market shares in a Markov model: the eigenvector for the eigenvalue 1"
  - "Stability of a dynamic model xₜ₊₁ = Axₜ: do deviations die out?"
  - Population projections and the long-run age structure behind pension planning
generators: [eigenvalue-larger-2x2, eigenvector-second-component, spectral-radius-stability]
widgets: [eigen-directions]
mistakeCodes:
  TRACE_AS_EIGENVALUE:
    label: Gave the trace
    explanation: The trace (the sum of the diagonal entries) is the sum of the eigenvalues, not one of them. Use it in λ² − (trace)λ + det = 0 and solve for λ.
  DETERMINANT_AS_EIGENVALUE:
    label: Gave the determinant
    explanation: The determinant is the product of the eigenvalues, not one of them. It is the constant term of λ² − (trace)λ + det = 0; solve that equation for λ.
  DIAGONAL_ENTRY:
    label: Read an eigenvalue off the diagonal
    explanation: The diagonal entries are the eigenvalues only when the matrix is triangular (all entries on one side of the diagonal are zero). Otherwise the off-diagonal entries change them, so solve det(A − λI) = 0.
  SMALLER_EIGENVALUE:
    label: Gave the other eigenvalue
    explanation: A 2×2 matrix has two eigenvalues. Check which one the question asks for; for stability and long-run growth it is the one that is largest in size, |λ|.
  SIGN:
    label: Sign slip when solving for y
    explanation: From (a − λ)·1 + b·y = 0 the solution is y = (λ − a)/b, not (a − λ)/b. Check by putting (1, y) into Av and comparing with λv.
  RECIPROCAL:
    label: Gave the reciprocal
    explanation: With v = (1, y) the first entry is fixed at 1 and y is the second. Writing the eigenvector as (x, 1) and giving x turns the answer upside down.
  FORGOT_LAMBDA:
    label: Forgot to subtract λ
    explanation: An eigenvector solves (A − λI)v = 0, not Av = 0. Subtract λ from both diagonal entries before you use a row.
  COLUMN_NOT_ROW:
    label: Read the equation down a column
    explanation: Each equation of (A − λI)v = 0 comes from a row of A − λI. The first equation is (a − λ)v₁ + b·v₂ = 0, using the first row (a − λ, b), not the first column (a − λ, c).
  SIGNED_NOT_ABSOLUTE:
    label: Compared eigenvalues by sign, not size
    explanation: Stability depends on |λ|. An eigenvalue of −1.3 makes deviations grow (flipping sign every period) even though −1.3 is less than 1. Take the largest absolute value.
  REAL_PART_ONLY:
    label: Used only the real part
    explanation: A complex eigenvalue α ± βi has size √(α² + β²), not |α|. For a 2×2 matrix with complex eigenvalues this size is √det.
  MODULUS_SQUARED:
    label: Forgot the square root
    explanation: For complex eigenvalues of a 2×2 matrix, det A = λ·λ̄ = |λ|², so |λ| = √det. The determinant itself is the square of the size.
resources:
  - { title: "Interactive Linear Algebra (Margalit and Rabinoff), 5.1 Eigenvalues and Eigenvectors (LibreTexts)", url: "https://math.libretexts.org/Bookshelves/Linear_Algebra/Interactive_Linear_Algebra_(Margalit_and_Rabinoff)/05%3A_Eigenvalues_and_Eigenvectors/5.01%3A_Eigenvalues_and_Eigenvectors", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "18.06SC Linear Algebra: Eigenvalues and Eigenvectors (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/pages/least-squares-determinants-and-eigenvalues/eigenvalues-and-eigenvectors/", kind: course, verifiedAt: 2026-10-18 }
  - { title: "18.06SC Linear Algebra: Markov Matrices; Fourier Series (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/pages/least-squares-determinants-and-eigenvalues/markov-matrices-fourier-series/", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
Many economic models describe several variables that move together from one period to the next: the outputs of agriculture and industry, the numbers of young and old people, the shares of customers with two mobile operators. When the model is linear it reads $x_{t+1} = A x_t$, and the questions are always the same. Does the economy grow, and how fast? Which mix of sectors or age groups does it settle into? Do deviations from equilibrium die out, or do they explode? Where do market shares end up?

Following the model period by period answers these questions only for one starting point and a few periods. Eigenvalues and eigenvectors answer them in general: the eigenvalues give the growth factors and decide stability, and the eigenvectors give the directions, or mixes, in which the economy grows. The same idea finds the long-run shares of a Markov chain (see SP01) and generalises the stability rule $|a| < 1$ of a single difference equation (DY01) to many variables.

## Intuition
A square matrix $A$ is a machine that turns a vector $v$ into a new vector $Av$. Usually the output points in a different direction from the input: if $v$ is a mix of agricultural and industrial output, next period's mix $Av$ has a different proportion of the two.

For a few special directions this does not happen. The machine only stretches (or shrinks, or flips) the vector, keeping it on the same line through the origin:
$$Av = \lambda v.$$
Such a $v$ is an **eigenvector** and the stretching factor $\lambda$ is its **eigenvalue** (from the German *eigen*, "own": the vector keeps its own direction).

In economic terms, an eigenvector is a mix that reproduces itself. If a two-sector economy starts exactly in that proportion, it keeps the proportion for ever and simply grows by the factor $\lambda$ each period: balanced growth. If it starts anywhere else, the start is a combination of eigenvectors; each part grows by its own factor, and after many periods the part with the largest factor dominates. That is why the economy drifts towards one particular mix, and why the largest eigenvalue is its long-run growth factor.

If every eigenvalue is smaller than 1 in size, every part shrinks and the system returns to zero: it is stable. A negative eigenvalue flips the sign every period, and complex eigenvalues (which have no real eigenvector at all) make the path circle round the origin: both show up as oscillation, as in a business cycle.

## Definition and formulas
**Eigenvalues and eigenvectors.** For a square $n \times n$ matrix $A$, a number $\lambda$ is an eigenvalue if there is a vector $v \neq 0$ with
$$Av = \lambda v.$$
Each such $v$ is an eigenvector for $\lambda$. The zero vector is never counted as an eigenvector, since $A0 = \lambda 0$ for every $\lambda$. Any non-zero multiple of an eigenvector is again an eigenvector for the same $\lambda$, so an eigenvector really stands for a direction, and we may scale it as we like, for example so that its first entry is 1.

**The characteristic equation.** $Av = \lambda v$ is the same as $(A - \lambda I)v = 0$. This has a solution $v \neq 0$ exactly when $A - \lambda I$ has rank below $n$ (LA201), that is, when it has no inverse:
$$\det(A - \lambda I) = 0.$$
The left-hand side is a polynomial of degree $n$ in $\lambda$, the characteristic polynomial, so an $n \times n$ matrix has $n$ eigenvalues, counted with repetition and allowing complex ones.

**The 2×2 case.** For $A = \begin{pmatrix} a & b \\ c & d \end{pmatrix}$,
$$\det(A - \lambda I) = (a - \lambda)(d - \lambda) - bc = \lambda^2 - (\operatorname{tr} A)\,\lambda + \det A,$$
where $\operatorname{tr} A = a + d$ is the **trace**, the sum of the diagonal entries. So
$$\lambda = \frac{\operatorname{tr} A \pm \sqrt{(\operatorname{tr} A)^2 - 4 \det A}}{2}.$$
For every square matrix,
$$\lambda_1 + \lambda_2 + \dots + \lambda_n = \operatorname{tr} A, \qquad \lambda_1 \lambda_2 \cdots \lambda_n = \det A,$$
which is a quick check on any answer. In particular $A$ has an inverse exactly when 0 is not an eigenvalue.

**Finding the eigenvectors.** For each eigenvalue, the eigenvectors are the non-zero solutions of $(A - \lambda I)v = 0$: the null space of $A - \lambda I$, found by elimination (LA103). For a 2×2 matrix the two rows of $A - \lambda I$ are proportional, so one row is enough. If $b \neq 0$, the first row with $v = (1, y)$ gives
$$(a - \lambda) + b\,y = 0, \qquad v = \left(1,\ \frac{\lambda - a}{b}\right).$$

**Three cases for 2×2.** The discriminant $(\operatorname{tr} A)^2 - 4\det A$ decides what kind of eigenvalues $A$ has.
- Positive: two different real eigenvalues, each with its own eigenvector direction.
- Zero: one repeated eigenvalue. Usually there is then only one eigenvector direction; for example $\begin{pmatrix} 2 & 1 \\ 0 & 2 \end{pmatrix}$ has $\lambda = 2$ twice, but only the multiples of $(1, 0)$ are eigenvectors. The exception is $\lambda I$, which stretches every direction by $\lambda$.
- Negative: a pair of complex eigenvalues $\lambda = \alpha \pm \beta i$ with $\alpha = \operatorname{tr} A / 2$. There is no real eigenvector: every direction is turned. Both eigenvalues have the same size, and since their product is $\det A$,
$$|\lambda| = \sqrt{\alpha^2 + \beta^2} = \sqrt{\det A}.$$
For example, $\begin{pmatrix} 0.6 & 0.3 \\ -0.6 & 0.9 \end{pmatrix}$ has trace 1.5 and determinant 0.72, so $\lambda \approx 0.75 \pm 0.40i$ and $|\lambda| = \sqrt{0.72} \approx 0.85$.

**Triangular matrices.** If all entries below (or all above) the diagonal are zero, $\det(A - \lambda I)$ is the product of the diagonal entries of $A - \lambda I$, so the eigenvalues are the diagonal entries. For example
$$A = \begin{pmatrix} 3 & 1 & 0 \\ 0 & 2 & 5 \\ 0 & 0 & 1 \end{pmatrix}, \qquad \det(A - \lambda I) = (3 - \lambda)(2 - \lambda)(1 - \lambda),$$
so $\lambda = 3, 2, 1$. For $\lambda = 2$, the rows of $A - 2I$ give $v_3 = 0$ and $v_1 + v_2 = 0$, so $v = (1, -1, 0)$; check: $Av = (2, -2, 0) = 2v$.

**Powers and growth.** If $Av = \lambda v$, then $A^2 v = \lambda^2 v$ and in general
$$A^t v = \lambda^t v.$$
If the starting vector is a combination of eigenvectors, $x_0 = c_1 v_1 + c_2 v_2$ (possible whenever $v_1, v_2$ form a basis, LA201), then
$$x_t = A^t x_0 = c_1 \lambda_1^t\, v_1 + c_2 \lambda_2^t\, v_2.$$
The **dominant eigenvalue** is the one largest in size, say $|\lambda_1| > |\lambda_2|$. As $t$ grows, the second term becomes negligible next to the first (if $c_1 \neq 0$): in the long run $x_t$ points along $v_1$ and is multiplied by $\lambda_1$ each period. Writing this for every starting vector at once, $A = V D V^{-1}$, is diagonalisation, the subject of LA203.

**Stability of $x_{t+1} = A x_t$.** The largest size of an eigenvalue is the **spectral radius** $\rho(A) = \max_i |\lambda_i|$.
- If $\rho(A) < 1$, then $x_t \to 0$ from every starting point: the system is stable.
- If $\rho(A) > 1$, then $x_t$ explodes from almost every starting point.

This is the many-variable version of DY01, where $y_{t+1} = a\,y_t + b$ is stable exactly when $|a| < 1$. As there, a constant term does not change the answer: for $x_{t+1} = A x_t + b$ the deviations from the steady state follow $x_{t+1} - x^* = A(x_t - x^*)$. Negative real eigenvalues give paths that flip sign each period, and complex eigenvalues give paths that spiral; stability depends only on the sizes $|\lambda|$.

**Transition matrices.** For a Markov transition matrix $P$ (rows "from", columns "to", every row adding up to 1, as in SP01):
- $P \begin{pmatrix} 1 \\ \vdots \\ 1 \end{pmatrix} = \begin{pmatrix} 1 \\ \vdots \\ 1 \end{pmatrix}$, so **1 is always an eigenvalue**, and no eigenvalue is larger than 1 in size.
- The shares move as a row vector, $x_{t+1} = x_t P$. A stationary distribution satisfies $\pi P = \pi$, which is $P^{\mathsf T} \pi^{\mathsf T} = \pi^{\mathsf T}$: $\pi$ is an eigenvector of the transpose $P^{\mathsf T}$ for the eigenvalue 1, scaled so that its entries add up to 1. ($P$ and $P^{\mathsf T}$ have the same eigenvalues, because a matrix and its transpose have the same determinant.)
- For two states the other eigenvalue is $\operatorname{tr} P - 1$, and the gap to the long-run shares is multiplied by it every period.

## Interactive
::widget{id="eigen-directions"}

The widget shows the matrix $A = \begin{pmatrix} 0.6 & b \\ c & 0.9 \end{pmatrix}$; the two sliders set the top-right entry $b$ and the bottom-left entry $c$. Each point $v$ of the lilac unit circle moves along its gold arrow to $Av$. You start at $b = 0.3$, $c = 0.6$, the matrix of Example 2: the panel shows eigenvalues 1.2 and 0.3, eigenvector directions (1, 2) and (1, −1), and "No, ρ = 1.2" under Stable?. Notice that only on the two green dashed lines do the arrows point straight along the line; everywhere else they turn. Now move $c$ to −0.6: the eigenvalues become complex, 0.75 ± 0.4i, the green lines disappear, every arrow turns, and the panel shows "Yes, ρ = 0.849", since $\sqrt{\det A} = \sqrt{0.72} < 1$. Finally set $b = 0$ and $c = 0$: the matrix is triangular, the eigenvalues are its diagonal entries 0.9 and 0.6, and the eigenvector directions are the two axes.

## Worked examples

### Example 1 (easy): eigenvalues and eigenvectors of a 2×2 matrix
Find the eigenvalues and eigenvectors of $A = \begin{pmatrix} 4 & 1 \\ 2 & 3 \end{pmatrix}$ and check them against the trace and the determinant.

1. $\operatorname{tr} A = 4 + 3 = 7$, $\;\det A = 4 \cdot 3 - 1 \cdot 2 = 10$
   *Why:* for a 2×2 matrix these two numbers are all the characteristic equation needs.
2. $\lambda^2 - 7\lambda + 10 = 0 \;\Rightarrow\; \lambda = \dfrac{7 \pm \sqrt{49 - 40}}{2} = \dfrac{7 \pm 3}{2}$, so $\lambda_1 = 5$, $\lambda_2 = 2$
   *Why:* $\det(A - \lambda I) = \lambda^2 - (\operatorname{tr} A)\lambda + \det A$; the eigenvalues are the values of $\lambda$ that make $A - \lambda I$ singular. Factorised: $(\lambda - 5)(\lambda - 2) = 0$.
3. $\lambda_1 = 5$: $A - 5I = \begin{pmatrix} -1 & 1 \\ 2 & -2 \end{pmatrix}$, so $-1 + y = 0$, $y = 1$ and $v_1 = (1, 1)$
   *Why:* the eigenvectors solve $(A - 5I)v = 0$. The rows are proportional (the second is $-2$ times the first), so the first row with $v = (1, y)$ is enough.
4. $\lambda_2 = 2$: $A - 2I = \begin{pmatrix} 2 & 1 \\ 2 & 1 \end{pmatrix}$, so $2 + y = 0$, $y = -2$ and $v_2 = (1, -2)$
   *Why:* the same method for the second eigenvalue; any multiple, such as $(-1, 2)$, is an equally good answer.
5. Check: $A v_1 = (4 + 1,\ 2 + 3) = (5, 5) = 5 v_1$ and $A v_2 = (4 - 2,\ 2 - 6) = (2, -4) = 2 v_2$; also $5 + 2 = 7 = \operatorname{tr} A$ and $5 \cdot 2 = 10 = \det A$
   *Why:* $A$ only stretches each eigenvector, by its eigenvalue; the sum and product rules catch most arithmetic slips.

```verify
A = [4, 1; 2, 3]
assert trace(A) == 7
assert det(A) == 10
assert 4*3 - 1*2 == 10
assert 7^2 - 4*10 == 9
assert (7 + 3)/2 == 5 and (7 - 3)/2 == 2
assert abs(det(A - 5*identity(2))) < 1e-12
assert abs(det(A - 2*identity(2))) < 1e-12
assert deepEqual(A - 5*identity(2), matrix([-1, 1; 2, -2]))
assert deepEqual(A - 2*identity(2), matrix([2, 1; 2, 1]))
assert deepEqual(A*[1; 1], [5; 5])
assert deepEqual(A*[1; -2], [2; -4])
assert deepEqual(A*[1; -2], 2*[1; -2])
assert 5 + 2 == trace(A) and 5*2 == det(A)
```

### Example 2 (medium): long-run growth of a two-sector economy
In a stylised model the outputs of agriculture and industry, $x_t = (\text{agriculture}, \text{industry})$, move from one period (five years) to the next by
$$x_{t+1} = A x_t, \qquad A = \begin{pmatrix} 0.6 & 0.3 \\ 0.6 & 0.9 \end{pmatrix}.$$
Find the eigenvalues and eigenvectors of $A$. Starting from $x_0 = (10, 5)$, write $x_t$ as a formula and describe the long run: the growth rate and the ratio of industry to agriculture.

1. $\operatorname{tr} A = 1.5$, $\;\det A = 0.6 \cdot 0.9 - 0.3 \cdot 0.6 = 0.36$, $\;\lambda = \dfrac{1.5 \pm \sqrt{2.25 - 1.44}}{2} = \dfrac{1.5 \pm 0.9}{2}$, so $\lambda_1 = 1.2$, $\lambda_2 = 0.3$
   *Why:* solve $\lambda^2 - 1.5\lambda + 0.36 = 0$. Check: $1.2 + 0.3 = 1.5$ and $1.2 \cdot 0.3 = 0.36$.
2. $\lambda_1 = 1.2$: $-0.6 + 0.3y = 0$, $v_1 = (1, 2)$; $\;\lambda_2 = 0.3$: $0.3 + 0.3y = 0$, $v_2 = (1, -1)$
   *Why:* first row of $A - \lambda I$ with $v = (1, y)$. An economy with twice as much industry as agriculture keeps that mix and grows by the factor 1.2.
3. $x_0 = c_1 (1, 2) + c_2 (1, -1)$: $\;c_1 + c_2 = 10$ and $2c_1 - c_2 = 5$ give $c_1 = 5$, $c_2 = 5$
   *Why:* the two eigenvectors form a basis of $\mathbb{R}^2$, so the start can be split into the two directions (LA201); adding the equations gives $3c_1 = 15$.
4. $x_t = 5 \cdot 1.2^t \begin{pmatrix} 1 \\ 2 \end{pmatrix} + 5 \cdot 0.3^t \begin{pmatrix} 1 \\ -1 \end{pmatrix}$; check $t = 1$: $(6 + 1.5,\ 12 - 1.5) = (7.5,\ 10.5) = A x_0$
   *Why:* $A^t v = \lambda^t v$ for each eigenvector, so each part is simply multiplied by its own eigenvalue every period.
5. $x_3 = (8.775,\ 17.145)$, ratio $1.95$; $\;x_{10} \approx (30.96,\ 61.92)$, ratio $2.00$
   *Why:* $0.3^t$ dies out quickly, so $x_t \approx 5 \cdot 1.2^t\,(1, 2)$. In the long run both sectors grow by 20 % per period (the dominant eigenvalue 1.2), and industry is twice agriculture (the dominant eigenvector). The second part shrinks relative to the first by the factor $0.3 / 1.2 = 0.25$ each period, which is why the mix settles so fast. Because $\rho(A) = 1.2 > 1$ the system is not stable: here that is growth, not a crisis.

```verify
A = [0.6, 0.3; 0.6, 0.9]
assert abs(trace(A) - 1.5) < 1e-12
assert abs(det(A) - 0.36) < 1e-12
assert abs(0.6*0.9 - 0.3*0.6 - 0.36) < 1e-12
assert abs(1.5^2 - 1.44 - 0.81) < 1e-12 and abs(4*0.36 - 1.44) < 1e-12
assert abs(sqrt(0.81) - 0.9) < 1e-12
l1 = (1.5 + 0.9)/2
l2 = (1.5 - 0.9)/2
assert abs(l1 - 1.2) < 1e-12 and abs(l2 - 0.3) < 1e-12
assert abs(l1 + l2 - 1.5) < 1e-12 and abs(l1*l2 - 0.36) < 1e-12
v1 = [1; 2]
v2 = [1; -1]
assert abs(-0.6 + 0.3*2) < 1e-12 and abs(0.3 + 0.3*(-1)) < 1e-12
assert max(abs(A*v1 - 1.2*v1)) < 1e-12
assert max(abs(A*v2 - 0.3*v2)) < 1e-12
c = inv([1, 1; 2, -1])*[10; 5]
assert abs(c[1,1] - 5) < 1e-12 and abs(c[2,1] - 5) < 1e-12
x0 = [10; 5]
assert max(abs(A*x0 - [7.5; 10.5])) < 1e-12
assert max(abs(5*1.2*v1 + 5*0.3*v2 - [7.5; 10.5])) < 1e-12
x3 = A^3*x0
assert max(abs(x3 - (5*1.2^3*v1 + 5*0.3^3*v2))) < 1e-9
assert abs(x3[1,1] - 8.775) < 1e-9 and abs(x3[2,1] - 17.145) < 1e-9
assert abs(x3[2,1]/x3[1,1] - 1.95) < 0.005
x10 = A^10*x0
assert abs(x10[1,1] - 30.96) < 0.005 and abs(x10[2,1] - 61.92) < 0.005
assert abs(x10[2,1]/x10[1,1] - 2) < 0.005
assert abs(0.3/1.2 - 0.25) < 1e-12
```

### Example 3 (hard): eigenvalue 1 and long-run market shares
Two mobile operators share a market. Each year 30 % of operator A's customers switch to B and 20 % of B's customers switch to A, so with rows "from" and columns "to"
$$P = \begin{pmatrix} 0.7 & 0.3 \\ 0.2 & 0.8 \end{pmatrix}.$$
Today A, the former monopoly, has 80 % of the market. Find both eigenvalues of $P$, find the long-run shares as an eigenvector, write A's share after $t$ years, and find after how many years A's share is within 0.1 percentage points of its long-run value.

1. $P \begin{pmatrix} 1 \\ 1 \end{pmatrix} = \begin{pmatrix} 0.7 + 0.3 \\ 0.2 + 0.8 \end{pmatrix} = \begin{pmatrix} 1 \\ 1 \end{pmatrix}$, so $\lambda_1 = 1$; then $\lambda_2 = \operatorname{tr} P - 1 = 1.5 - 1 = 0.5$
   *Why:* every row of a transition matrix adds up to 1, so 1 is always an eigenvalue. The eigenvalues add up to the trace; check with the product: $1 \cdot 0.5 = 0.5 = 0.7 \cdot 0.8 - 0.3 \cdot 0.2 = \det P$.
2. $P^{\mathsf T} - I = \begin{pmatrix} -0.3 & 0.2 \\ 0.3 & -0.2 \end{pmatrix}$: $\;-0.3\,\pi_A + 0.2\,\pi_B = 0$, so $\pi_B = 1.5\,\pi_A$, and with $\pi_A + \pi_B = 1$: $\pi = (0.4,\ 0.6)$
   *Why:* shares move as a row vector, $x_{t+1} = x_t P$, so the long-run shares solve $\pi P = \pi$, that is $P^{\mathsf T} \pi^{\mathsf T} = \pi^{\mathsf T}$: an eigenvector of the transpose for $\lambda = 1$. The eigenvector fixes only the ratio $1 : 1.5$; dividing by $2.5$ makes the shares add up to 1.
3. $(1, -1)\,P = (0.7 - 0.2,\ 0.3 - 0.8) = (0.5,\ -0.5) = 0.5\,(1, -1)$
   *Why:* this is the row-vector eigenvector for $\lambda_2 = 0.5$. It moves customers from one operator to the other without changing the total, so it describes the gap to the long run.
4. $x_0 = (0.8,\ 0.2) = (0.4,\ 0.6) + 0.4\,(1, -1)$, so $x_t = (0.4,\ 0.6) + 0.4 \cdot 0.5^t\,(1, -1)$; A's share is $0.4 + 0.4 \cdot 0.5^t$
   *Why:* multiplying by $P$ leaves $\pi$ unchanged and halves the other part each year. After one year: $(0.6,\ 0.4)$; after five: $0.4 + 0.4/32 = 0.4125$.
5. $0.4 \cdot 0.5^t < 0.001 \iff t > \dfrac{\ln 0.0025}{\ln 0.5} \approx 8.64$, so after 9 years
   *Why:* the gap shrinks by the second eigenvalue, 0.5, every year: since $|0.5| < 1$ the deviations are stable and die out. A second eigenvalue close to 1 would mean slow convergence; here the gap halves every year. After 8 years the gap is still $0.4 \cdot 0.5^8 \approx 0.0016$.

```verify
P = [0.7, 0.3; 0.2, 0.8]
assert max(abs(P*[1; 1] - [1; 1])) < 1e-12
assert abs(trace(P) - 1.5) < 1e-12
assert abs(det(P) - 0.5) < 1e-12
assert abs(0.7*0.8 - 0.3*0.2 - 0.5) < 1e-12
assert abs(det(P - identity(2))) < 1e-12
assert abs(det(P - 0.5*identity(2))) < 1e-12
Q = transpose(P) - identity(2)
assert max(abs(Q - [-0.3, 0.2; 0.3, -0.2])) < 1e-12
assert abs(0.3/0.2 - 1.5) < 1e-12
st = [1, 1.5]/2.5
assert max(abs(st - [0.4, 0.6])) < 1e-12
assert max(abs(st*P - st)) < 1e-12
w = [1, -1]
assert max(abs(w*P - [0.5, -0.5])) < 1e-12
assert max(abs(w*P - 0.5*w)) < 1e-12
x0 = [0.8, 0.2]
assert max(abs(x0 - (st + 0.4*w))) < 1e-12
assert max(abs(x0*P - [0.6, 0.4])) < 1e-12
x5 = x0*P^5
assert abs(x5[1] - 0.4125) < 1e-12
assert abs(0.4 + 0.4/32 - 0.4125) < 1e-12
assert abs(log(0.0025)/log(0.5) - 8.64) < 0.005
assert 0.4*0.5^8 > 0.001 and 0.4*0.5^9 < 0.001
assert abs(0.4*0.5^8 - 0.0016) < 0.00005
x9 = x0*P^9
assert abs(x9[1] - 0.4) < 0.001
x8 = x0*P^8
assert abs(x8[1] - 0.4) > 0.001
```

## Common mistakes
- Giving the trace as an eigenvalue: it is the sum of the eigenvalues (TRACE_AS_EIGENVALUE).
- Giving the determinant as an eigenvalue: it is their product (DETERMINANT_AS_EIGENVALUE).
- Reading the eigenvalues off the diagonal of a matrix that is not triangular (DIAGONAL_ENTRY).
- Giving the smaller eigenvalue when the question asks for the larger, or the dominant one (SMALLER_EIGENVALUE).
- Solving $(a - \lambda) + b\,y = 0$ as $y = (a - \lambda)/b$ (SIGN).
- Writing the eigenvector as $(x, 1)$ and giving $x$ when the question fixes the first entry at 1 (RECIPROCAL).
- Solving $Av = 0$ instead of $(A - \lambda I)v = 0$ (FORGOT_LAMBDA).
- Taking the first equation from the first column of $A - \lambda I$ instead of its first row (COLUMN_NOT_ROW).
- Calling a system with eigenvalues $-1.3$ and $0.5$ stable because both are below 1; it is the size $|\lambda|$ that counts (SIGNED_NOT_ABSOLUTE).
- Using only the real part $\alpha$ of a complex eigenvalue $\alpha \pm \beta i$ as its size (REAL_PART_ONLY).
- Taking $\det A$ itself, rather than $\sqrt{\det A}$, as the size of complex eigenvalues (MODULUS_SQUARED).
- Calling the zero vector an eigenvector, or thinking an eigenvector is wrong because it differs from the book's by a factor: $(2, 4)$ and $(1, 2)$ are the same direction.
- Looking for the long-run shares of a Markov chain as an eigenvector of $P$ instead of its transpose: $P$ itself always gives $(1, 1)$, which is not a distribution.
- Expecting the eigenvalues of $A + B$ or $AB$ to be the sums or products of the eigenvalues of $A$ and $B$; in general they are not.

## Practice
- `eigenvalue-larger-2x2` (difficulty 1): the larger of the two whole-number eigenvalues of a 2×2 matrix, from $\lambda^2 - (\operatorname{tr} A)\lambda + \det A = 0$; distractors TRACE_AS_EIGENVALUE, DETERMINANT_AS_EIGENVALUE, DIAGONAL_ENTRY, SMALLER_EIGENVALUE.
- `eigenvector-second-component` (difficulty 2): for a given eigenvalue of a 2×2 matrix, the second entry $y$ of the eigenvector $(1, y)$; distractors SIGN, RECIPROCAL, FORGOT_LAMBDA, COLUMN_NOT_ROW.
- `spectral-radius-stability` (difficulty 3): the spectral radius (largest $|\lambda|$) of a 2×2 matrix with real or complex eigenvalues, which decides whether $x_{t+1} = Ax_t$ is stable; distractors SIGNED_NOT_ABSOLUTE, SMALLER_EIGENVALUE, DIAGONAL_ENTRY, REAL_PART_ONLY, MODULUS_SQUARED.

## Real world
- Population and pensions: demographers project a population by age group with a matrix of survival and birth rates (a Leslie matrix). Its dominant eigenvalue is the long-run growth factor of the population and its eigenvector the stable age structure, which tells governments how many workers there will be per pensioner.
- Macroeconomic models: modern models of the business cycle are solved as systems $x_{t+1} = Ax_t + \dots$. Economists count the eigenvalues of $A$ that are larger than 1 in size to check that the model has exactly one stable path, and complex eigenvalues are what produce cycles in output and inflation.
- Input–output analysis: a Leontief economy (LA106) can produce a surplus for final demand exactly when the dominant eigenvalue of its matrix of input coefficients is below 1.
- Markets and ratings: the long-run market shares of competing brands, and the long-run mix of credit ratings in a bank's loan book, are the eigenvector of a transition matrix for the eigenvalue 1 (SP01); the second-largest eigenvalue says how fast the shares settle.

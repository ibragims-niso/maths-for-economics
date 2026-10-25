---
id: LA203
title: Diagonalisation
block: LA2
coreYear: 2
prerequisites: [LA202]
estMinutes: 45
status: draft
economicUses:
  - "Solving linked dynamic models, such as migration between two regions or growth in two sectors"
  - "Long-run behaviour: balanced growth paths and how fast an economy converges to them"
  - "Markov chains many periods ahead: labour-market flows and the stationary distribution"
  - Computing high matrix powers quickly in forecasting models
searchTerms:
  - "Diagonalization"
generators: [diagonalisation-power-entry, eigen-decoupled-system-state, migration-share-after-years]
widgets: [city-countryside-migration]
mistakeCodes:
  ENTRY_POWER:
    label: Raised the entries to the power n
    explanation: Aⁿ is the matrix product A × A × … × A, not the table of entries raised to the power n. Only a diagonal matrix can be powered entry by entry, which is why we write A = PDP⁻¹ and power D.
  TIMES_N:
    label: Multiplied the entry by n
    explanation: A power multiplies the matrix by itself n times; it does not multiply the entries by n. Use Aⁿ = PDⁿP⁻¹, where the eigenvalues are raised to the power n.
  D_ONLY:
    label: Gave the entry of Dⁿ instead of Aⁿ
    explanation: Dⁿ holds the powers of the eigenvalues, but Aⁿ = PDⁿP⁻¹. Multiply by P on the left and by P⁻¹ on the right to get back from eigenvector coordinates to the original ones.
  WRONG_ORDER:
    label: Used P⁻¹DⁿP instead of PDⁿP⁻¹
    explanation: With the eigenvectors as the columns of P, AP = PD, so A = PDP⁻¹ and Aⁿ = PDⁿP⁻¹. Swapping P and P⁻¹ gives the power of a different matrix.
  ONE_EIGENVALUE:
    label: Used the first eigenvalue for both terms
    explanation: Each eigen-direction grows by its own eigenvalue, so x_t = c₁λ₁ᵗv₁ + c₂λ₂ᵗv₂. Multiplying the whole of x₀ by λ₁ᵗ is right only if x₀ is itself an eigenvector for λ₁.
  DROPPED_TERM:
    label: Left out the second term
    explanation: x_t = c₁λ₁ᵗv₁ + c₂λ₂ᵗv₂ has a term for each eigenvector. Dropping c₂λ₂ᵗv₂ is only an approximation for large t, when λ₁ dominates; for a small t keep both terms.
  MULTIPLIED_BY_P:
    label: Found the coordinates with P instead of P⁻¹
    explanation: x₀ = Pc, with the eigenvectors as the columns of P, so the coordinates are c = P⁻¹x₀. Multiplying x₀ by P goes the wrong way.
  SWAPPED_EIGENVALUES:
    label: Paired the eigenvalues with the wrong eigenvectors
    explanation: λ₁ belongs to v₁ and λ₂ to v₂, so the term with v₁ grows by λ₁ᵗ. Keep each eigenvalue with its own eigenvector, as in the columns of P and the diagonal of D.
  LONG_RUN_ONLY:
    label: Gave the long-run share instead of the share after n years
    explanation: The long-run share is where the population is heading. After n years part of the starting gap is still there, λ₂ⁿ(s₀ − s*), and it must be added to s*.
  FLOWS_REVERSED:
    label: Swapped the two moving rates in the long-run share
    explanation: The eigenvector for λ = 1 is (b, a), so the long-run city share is b/(a + b), where b is the rate of moving into the city. The region that is easier to move into and harder to leave ends up bigger.
  SHRANK_WHOLE_SHARE:
    label: Shrank the whole share instead of the gap
    explanation: Only the part of the start along the second eigenvector, the gap s₀ − s*, is multiplied by λ₂ each year. The long-run part s* stays put, so sₙ = s* + λ₂ⁿ(s₀ − s*), not λ₂ⁿs₀.
  ONE_STEP:
    label: Moved only one year
    explanation: The gap is multiplied by λ₂ once a year, so after n years by λ₂ⁿ. Using λ₂ once gives next year's share.
resources:
  - { title: "18.06SC Linear Algebra: Diagonalization and Powers of A (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/pages/least-squares-determinants-and-eigenvalues/diagonalization-and-powers-of-a/", kind: course, verifiedAt: 2026-10-18 }
  - { title: "18.06SC Linear Algebra: Markov Matrices; Fourier Series (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/pages/least-squares-determinants-and-eigenvalues/markov-matrices-fourier-series/", kind: course, verifiedAt: 2026-10-18 }
  - { title: "18.06SC Linear Algebra: Symmetric Matrices and Positive Definiteness (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/pages/positive-definite-matrices-and-applications/symmetric-matrices-and-positive-definiteness/", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
Many economic models move forward one period at a time with a matrix: $x_{t+1} = Ax_t$. The vector $x_t$ might hold the populations of a city and its countryside, the outputs of two linked sectors, or the shares of employed and unemployed workers. To forecast 20 years ahead you need $A^{20}$, and to know where the model is heading you need $A^t$ for very large $t$. Multiplying the matrix by itself again and again is slow and hides what is going on.

Diagonalisation solves both problems. It rewrites $A$ in the coordinates of its eigenvectors (LA202), where the model splits into separate one-variable equations that are easy to solve. The answer shows at a glance which part of the system grows, which part dies out, and how fast: the long-run share of a region, the balanced growth path of an economy, the stationary distribution of a labour market.

## Intuition
Picture two regions whose populations affect each other: people move from the city to the countryside and back. Year by year the two numbers change together, so you cannot follow one without the other. The model is **coupled**.

Now look in the right directions. An eigenvector is a direction that $A$ only stretches, by the factor $\lambda$. In the migration model one eigenvector is the population split that never changes (stretch factor 1). The other moves people from one region to the other without changing the total, and it shrinks by a factor below 1 each year. Write today's population as "a bit of the first direction plus a bit of the second" and the future is easy: the first part stays as it is, the second part shrinks year after year. The two parts no longer affect each other. The model is **decoupled**.

That is all diagonalisation does. It changes to eigenvector coordinates (LA201), lets each coordinate grow or shrink by its own eigenvalue, and changes back. In eigenvector coordinates the matrix is **diagonal**: it only stretches each coordinate, with no mixing.

## Definition and formulas
**Diagonalisation.** An $n \times n$ matrix $A$ is **diagonalisable** if
$$A = PDP^{-1},$$
with $D$ diagonal and $P$ invertible. The columns of $P$ are eigenvectors $v_1, \dots, v_n$ of $A$, and $D$ has the matching eigenvalues on its diagonal, **in the same order**:
$$P = \begin{pmatrix} v_1 & \cdots & v_n \end{pmatrix}, \qquad D = \begin{pmatrix} \lambda_1 & & 0 \\ & \ddots & \\ 0 & & \lambda_n \end{pmatrix}.$$
Why it works: $Av_i = \lambda_i v_i$ for every column says $AP = PD$; multiplying on the right by $P^{-1}$ gives $A = PDP^{-1}$.

**When is a matrix diagonalisable?**
- Exactly when it has $n$ linearly independent eigenvectors, so that $P$ is invertible (LA201, LA105).
- $n$ **distinct** eigenvalues are enough: eigenvectors for different eigenvalues are always independent.
- Every **symmetric** matrix ($A = A^{\mathsf T}$) is diagonalisable, with real eigenvalues, and eigenvectors for different eigenvalues are **orthogonal** (their dot product is 0). Scaled to length 1 they give a $P$ with $P^{-1} = P^{\mathsf T}$.
- A repeated eigenvalue can go either way. The identity matrix has $\lambda = 1$ twice and is already diagonal.

**A matrix that cannot be diagonalised.** $B = \begin{pmatrix} 2 & 1 \\ 0 & 2 \end{pmatrix}$ has the eigenvalue 2 twice, but its only eigenvectors are the multiples of $(1, 0)$: one direction, not two. There is no invertible $P$, so $B$ is not diagonalisable. Its powers are $B^n = \begin{pmatrix} 2^n & n\,2^{n-1} \\ 0 & 2^n \end{pmatrix}$, and the extra factor $n$ is something no diagonal matrix can produce (the same thing happens with repeated roots in DY02).

**Powers.** In $A^n = PDP^{-1}\,PDP^{-1} \cdots PDP^{-1}$ each $P^{-1}P$ in the middle cancels, so
$$A^n = PD^nP^{-1}, \qquad D^n = \begin{pmatrix} \lambda_1^n & & 0 \\ & \ddots & \\ 0 & & \lambda_n^n \end{pmatrix}.$$

**Solving $x_{t+1} = Ax_t$.** Write the start in eigenvector coordinates, $c = P^{-1}x_0$, so that $x_0 = c_1v_1 + \dots + c_nv_n$. Then
$$x_t = A^t x_0 = c_1\lambda_1^t v_1 + c_2\lambda_2^t v_2 + \dots + c_n\lambda_n^t v_n.$$
In the coordinates $y_t = P^{-1}x_t$ the system reads $y_{t+1} = Dy_t$: $n$ separate equations $y_{i,t+1} = \lambda_i\,y_{i,t}$, each with the solution $y_{i,t} = \lambda_i^t\,y_{i,0}$ (compare DY01). This is the **decoupling**.

**Long-run behaviour.** Order the eigenvalues so that $|\lambda_1| > |\lambda_2| \ge \dots$ and suppose $c_1 \neq 0$. For large $t$ the first term dominates:
$$x_t \approx c_1\lambda_1^t v_1,$$
so in the long run the system grows by the factor $\lambda_1$ each period and its components keep the proportions of $v_1$. The other terms fade relative to it by the factor $|\lambda_2/\lambda_1|$ each period, so that ratio sets the speed of convergence.
- All $|\lambda_i| < 1$: $x_t \to 0$, the system is stable.
- $\lambda_1 = 1$ and all other $|\lambda_i| < 1$: $x_t \to c_1v_1$, a steady state that depends on the start only through $c_1$.
- A negative eigenvalue makes its term switch sign every period: the path jumps from one side to the other.

Example: a two-sector growth model with $A = \begin{pmatrix} 1 & 0.2 \\ 0.2 & 1 \end{pmatrix}$ (each sector keeps its output and gains 0.2 of the other's). $A$ is symmetric, with $\lambda_1 = 1.2$ for $v_1 = (1, 1)$ and $\lambda_2 = 0.8$ for $v_2 = (1, -1)$, which are orthogonal. From $x_0 = (100, 60)$, $c = (80, 20)$ and $x_t = 80 \cdot 1.2^t (1, 1) + 20 \cdot 0.8^t (1, -1)$. After 10 periods $x_{10} \approx (497.49,\ 493.19)$: the economy grows by 20 % a period along the **balanced growth path** $(1, 1)$, and the imbalance between the sectors has almost gone.

**Markov chains.** Write a two-state chain as in SP01, with the state now in the rows, but call the transition matrix $T$ here, since $P$ holds eigenvectors:
$$T = \begin{pmatrix} 1 - p & p \\ q & 1 - q \end{pmatrix}.$$
Its rows add up to 1, so $T(1, 1)^{\mathsf T} = (1, 1)^{\mathsf T}$: $\lambda_1 = 1$ with eigenvector $(1, 1)$. The trace gives $\lambda_2 = 1 - p - q$. Diagonalising,
$$T^n = \frac{1}{p + q}\begin{pmatrix} q & p \\ q & p \end{pmatrix} + \frac{(1 - p - q)^n}{p + q}\begin{pmatrix} p & -p \\ -q & q \end{pmatrix}.$$
When $|1 - p - q| < 1$ the second part dies out and $T^n$ converges to a matrix with **identical rows**, each equal to the stationary distribution $\pi = \left(\frac{q}{p + q}, \frac{p}{p + q}\right)$: after many periods it no longer matters where you started. The second eigenvalue sets how fast this happens.

## Interactive
::widget{id="city-countryside-migration"}

This is the migration model of Example 2: 90 million people, 36 million in the city and 54 million in the countryside. The horizontal axis is the city population, the vertical axis the countryside. Use the sliders to set the share $a$ of city dwellers who move out each year, the share $b$ of countryside dwellers who move to the city, and the number of years $n$. The dots are the populations year by year. They can only move along the dashed gold line (the total stays 90 million), the direction of the eigenvector $v_2 = (1, -1)$, and they head for the point where it meets the green line, the eigenvector $v_1 = (b, a)$ for $\lambda_1 = 1$. Start at $a = 0.1$, $b = 0.2$, $n = 5$: the panel shows the eigenvalues 1 and 0.7, a city share of 62.2 % after 5 years (Example 2) and a long-run share of 66.7 %. Move $n$ to 30 and the share reads 66.7 %: the start is forgotten. Now set $a = b = 0.5$: then $\lambda_2 = 0$ and the long run is reached after one year. Push both rates to 0.6 and $\lambda_2 = -0.2$: the dots jump from one side of the green line to the other.

## Worked examples

### Example 1 (easy): a matrix power the quick way
In a model where the matrix $A = \begin{pmatrix} 4 & -1 \\ 2 & 1 \end{pmatrix}$ moves the state one year ahead, $A^5$ moves it five years ahead. $A$ has eigenvalue $\lambda_1 = 2$ with eigenvector $v_1 = (1, 2)$ and eigenvalue $\lambda_2 = 3$ with eigenvector $v_2 = (1, 1)$. Diagonalise $A$ and use it to find $A^5$.

1. $Av_1 = (4 - 2,\ 2 + 2) = (2, 4) = 2v_1$ and $Av_2 = (4 - 1,\ 2 + 1) = (3, 3) = 3v_2$
   *Why:* check the eigenpairs first. Also, $\lambda^2 - 5\lambda + 6 = 0$ (trace 5, determinant 6) has the roots 2 and 3.
2. $P = \begin{pmatrix} 1 & 1 \\ 2 & 1 \end{pmatrix}$, $\;D = \begin{pmatrix} 2 & 0 \\ 0 & 3 \end{pmatrix}$
   *Why:* the eigenvectors are the columns of $P$, and the eigenvalues go on the diagonal of $D$ in the same order. The eigenvalues are distinct, so $A$ is diagonalisable.
3. $\det P = 1 - 2 = -1$, $\;P^{-1} = \begin{pmatrix} -1 & 1 \\ 2 & -1 \end{pmatrix}$
   *Why:* swap the diagonal entries, change the sign of the other two, divide by $\det P = -1$ (LA105).
4. $D^5 = \begin{pmatrix} 32 & 0 \\ 0 & 243 \end{pmatrix}$, $\;PD^5 = \begin{pmatrix} 32 & 243 \\ 64 & 243 \end{pmatrix}$
   *Why:* $A^5 = PD^5P^{-1}$, and a diagonal matrix is powered entry by entry: $2^5 = 32$, $3^5 = 243$. Multiplying $P$ by $D^5$ scales its columns.
5. $A^5 = \begin{pmatrix} 32 & 243 \\ 64 & 243 \end{pmatrix}\begin{pmatrix} -1 & 1 \\ 2 & -1 \end{pmatrix} = \begin{pmatrix} -32 + 486 & 32 - 243 \\ -64 + 486 & 64 - 243 \end{pmatrix} = \begin{pmatrix} 454 & -211 \\ 422 & -179 \end{pmatrix}$
   *Why:* one ordinary matrix product finishes the job, instead of four products of $A$ with itself.
6. Check: trace $454 - 179 = 275 = 2^5 + 3^5$ and $\det A^5 = 454 \cdot (-179) - (-211) \cdot 422 = 7776 = 6^5$
   *Why:* the trace of a matrix is the sum of its eigenvalues and the determinant their product; $A^5$ has the eigenvalues $2^5$ and $3^5$.

```verify
A = [4, -1; 2, 1]
P = [1, 1; 2, 1]
D = [2, 0; 0, 3]
assert deepEqual(A*[1; 2], 2*[1; 2])
assert deepEqual(A*[1; 1], 3*[1; 1])
assert det(P) == -1
assert max(abs(inv(P) - [-1, 1; 2, -1])) < 1e-12
assert max(abs(P*D*inv(P) - A)) < 1e-12
D5 = [2^5, 0; 0, 3^5]
assert deepEqual(P*D5, [32, 243; 64, 243])
A5 = A^5
assert deepEqual(A5, [454, -211; 422, -179])
assert max(abs(P*D5*inv(P) - A5)) < 1e-9
assert -32 + 486 == 454 and 32 - 243 == -211 and -64 + 486 == 422 and 64 - 243 == -179
assert 454 - 179 == 275 and 2^5 + 3^5 == 275
assert 454*(-179) - (-211)*422 == 7776 and 6^5 == 7776
# wrong answers quoted in Common mistakes: entry power, n times the entry, P^-1 D^5 P
assert (-1)^5 == -1 and 5*(-1) == -5
WO = inv(P)*D5*P
assert abs(WO[1,2] - 211) < 1e-9
```

### Example 2 (medium): migration between city and countryside
A country of 90 million people has 36 million in its cities and 54 million in the countryside. Each year 10 % of city dwellers move to the countryside and 20 % of countryside dwellers move to a city. With $x_t = (\text{city}, \text{countryside})$ in millions, find a formula for $x_t$, the populations and the city share after 5 years, and the long run.

1. $x_{t+1} = Ax_t$ with $A = \begin{pmatrix} 0.9 & 0.2 \\ 0.1 & 0.8 \end{pmatrix}$
   *Why:* next year's city population is the 90 % of city dwellers who stay plus the 20 % of countryside dwellers who arrive. Each column adds up to 1, so the total stays 90 million.
2. $\lambda^2 - 1.7\lambda + 0.7 = 0$, so $\lambda_1 = 1$ and $\lambda_2 = 0.7$
   *Why:* the trace is 1.7 and the determinant $0.72 - 0.02 = 0.7$ (LA202). $\lambda_2 = 1 - 0.1 - 0.2$.
3. $v_1 = (2, 1)$ since $Av_1 = (1.8 + 0.2,\ 0.2 + 0.8) = (2, 1)$; $\;v_2 = (1, -1)$ since $Av_2 = (0.7, -0.7)$
   *Why:* $v_1$ is a split that does not change: twice as many people in the city as in the countryside. $v_2$ moves people from one region to the other without changing the total.
4. $P = \begin{pmatrix} 2 & 1 \\ 1 & -1 \end{pmatrix}$, $\;c = P^{-1}x_0 = \dfrac{1}{3}\begin{pmatrix} 1 & 1 \\ 1 & -2 \end{pmatrix}\begin{pmatrix} 36 \\ 54 \end{pmatrix} = \begin{pmatrix} 30 \\ -24 \end{pmatrix}$
   *Why:* $\det P = -3$. The coordinates of the start in the eigenvector basis are $c = P^{-1}x_0$ (LA201). Check: $30\,(2, 1) - 24\,(1, -1) = (36, 54)$.
5. $x_t = 30 \cdot 1^t\,(2, 1) - 24 \cdot 0.7^t\,(1, -1) = (60 - 24 \cdot 0.7^t,\ 30 + 24 \cdot 0.7^t)$
   *Why:* each eigenvector part is multiplied by its own eigenvalue every year. The $v_1$ part stays put; the $v_2$ part shrinks by 30 % a year.
6. $0.7^5 = 0.16807$, so $x_5 = (60 - 4.03,\ 30 + 4.03) = (55.97,\ 34.03)$ and the city share is $55.97/90 = 62.18\,\%$
   *Why:* the starting gap of 24 million to the long-run split has shrunk to about 4 million.
7. As $t \to \infty$, $0.7^t \to 0$ and $x_t \to (60, 30)$: two thirds in the city. After 10 years the gap is $24 \cdot 0.7^{10} \approx 0.68$ million
   *Why:* the long run is $c_1v_1$, the eigenvector for $\lambda = 1$. The second eigenvalue, 0.7, sets the speed: the closer it is to 0, the faster the population settles.

```verify
A = [0.9, 0.2; 0.1, 0.8]
x0 = [36; 54]
assert abs(trace(A) - 1.7) < 1e-12
assert abs(det(A) - 0.7) < 1e-12
assert abs(0.9*0.8 - 0.2*0.1 - 0.7) < 1e-12
v1 = [2; 1]
v2 = [1; -1]
assert max(abs(A*v1 - v1)) < 1e-12
assert max(abs(A*v2 - 0.7*v2)) < 1e-12
P = [2, 1; 1, -1]
assert det(P) == -3
c = inv(P)*x0
assert abs(c[1,1] - 30) < 1e-12
assert abs(c[2,1] + 24) < 1e-12
assert max(abs(inv(P) - [1, 1; 1, -2]/3)) < 1e-12
assert deepEqual(30*v1 - 24*v2, x0)
assert abs(0.7^5 - 0.16807) < 1e-12
x5 = A^5*x0
assert abs(x5[1,1] - (60 - 24*0.7^5)) < 1e-9
assert abs(x5[2,1] - (30 + 24*0.7^5)) < 1e-9
assert abs(24*0.7^5 - 4.03) < 0.005
assert abs(x5[1,1] - 55.97) < 0.005
assert abs(x5[2,1] - 34.03) < 0.005
assert abs(100*x5[1,1]/90 - 62.18) < 0.005
assert abs(24*0.7^10 - 0.68) < 0.005
x200 = A^200*x0
assert max(abs(x200 - [60; 30])) < 1e-9
# wrong answers quoted in Common mistakes, in per cent
s0 = 40; star = 200/3
assert abs(star - 66.67) < 0.005
assert abs(100/3 + 0.7^5*(s0 - 100/3) - 34.45) < 0.005
assert abs(0.7^5*s0 - 6.72) < 0.005
assert abs(star + 0.7*(s0 - star) - 48) < 1e-9
```

### Example 3 (hard): a labour market over many quarters
Each quarter 5 % of employed workers lose their job and 45 % of unemployed workers find one. With the state now in the rows (employed, unemployed), the transition matrix is $T = \begin{pmatrix} 0.95 & 0.05 \\ 0.45 & 0.55 \end{pmatrix}$, as in SP01. Diagonalise $T$ and find $T^n$. What is the chance that a worker who is unemployed now is unemployed four quarters later? What does $T^n$ converge to, and after how many quarters is that chance within 1 percentage point of its limit?

1. $\lambda^2 - 1.5\lambda + 0.5 = 0$, so $\lambda_1 = 1$ and $\lambda_2 = 0.5$
   *Why:* the trace is 1.5 and the determinant $0.5225 - 0.0225 = 0.5$. The rows add up to 1, so $\lambda = 1$ is always an eigenvalue, and the other one is $1 - 0.05 - 0.45$.
2. $v_1 = (1, 1)$; for $\lambda_2$: $(T - 0.5I)\,(x, y)^{\mathsf T} = 0$ reads $0.45x + 0.05y = 0$, so $v_2 = (1, -9)$
   *Why:* each row of $T$ adds up to 1, so $T$ times $(1, 1)$ is $(1, 1)$. Both rows of $T - 0.5I$ are $(0.45,\ 0.05)$, which leaves one equation for the second eigenvector.
3. $P = \begin{pmatrix} 1 & 1 \\ 1 & -9 \end{pmatrix}$, $\;\det P = -10$, $\;P^{-1} = \begin{pmatrix} 0.9 & 0.1 \\ 0.1 & -0.1 \end{pmatrix}$
   *Why:* the 2×2 inverse formula. The first row of $P^{-1}$, $(0.9,\ 0.1)$, is the stationary distribution $\pi$ of SP01: 90 % employed and 10 % unemployed in the long run.
4. $T^n = P\begin{pmatrix} 1 & 0 \\ 0 & 0.5^n \end{pmatrix}P^{-1} = \begin{pmatrix} 0.9 + 0.1 \cdot 0.5^n & 0.1 - 0.1 \cdot 0.5^n \\ 0.9 - 0.9 \cdot 0.5^n & 0.1 + 0.9 \cdot 0.5^n \end{pmatrix}$
   *Why:* $T^n = PD^nP^{-1}$. Multiplying out gives every $n$-step probability at once; at $n = 1$ the formula gives $T$ back.
5. $(T^4)_{22} = 0.1 + 0.9 \cdot 0.5^4 = 0.1 + 0.05625 = 0.15625$
   *Why:* the entry in row 2, column 2 is the chance of going from unemployed to unemployed in four quarters, about 15.6 %.
6. As $n \to \infty$, $0.5^n \to 0$ and $T^n \to \begin{pmatrix} 0.9 & 0.1 \\ 0.9 & 0.1 \end{pmatrix}$
   *Why:* both rows become $\pi$: in the long run a worker's chance of being unemployed is 10 %, whether she is employed or unemployed today.
7. $0.9 \cdot 0.5^n < 0.01$: $0.9 \cdot 0.5^6 \approx 0.0141$ but $0.9 \cdot 0.5^7 \approx 0.0070$, so after 7 quarters
   *Why:* the distance to the limit is $0.9 \cdot 0.5^n$, halving every quarter. The second eigenvalue sets the speed: with 0.9 instead of 0.5 it would take far longer.

```verify
T = [0.95, 0.05; 0.45, 0.55]
assert abs(trace(T) - 1.5) < 1e-12
assert abs(det(T) - 0.5) < 1e-12
assert abs(0.95*0.55 - 0.5225) < 1e-12 and abs(0.05*0.45 - 0.0225) < 1e-12
assert max(abs(T*[1; 1] - [1; 1])) < 1e-12
assert max(abs(T*[1; -9] - 0.5*[1; -9])) < 1e-12
P = [1, 1; 1, -9]
assert det(P) == -10
assert max(abs(inv(P) - [0.9, 0.1; 0.1, -0.1])) < 1e-12
pi1 = [0.9, 0.1]
assert max(abs(pi1*T - pi1)) < 1e-12
T4 = T^4
D4 = [1, 0; 0, 0.5^4]
assert max(abs(P*D4*inv(P) - T4)) < 1e-12
assert abs(T4[2,2] - 0.15625) < 1e-12
assert abs(0.9*0.5^4 - 0.05625) < 1e-12
assert abs(T4[1,1] - (0.9 + 0.1*0.5^4)) < 1e-12
assert abs(T4[1,2] - (0.1 - 0.1*0.5^4)) < 1e-12
assert abs(T4[2,1] - (0.9 - 0.9*0.5^4)) < 1e-12
T200 = T^200
assert max(abs(T200 - [0.9, 0.1; 0.9, 0.1])) < 1e-12
assert abs(0.9*0.5^6 - 0.0141) < 0.00005
assert abs(0.9*0.5^7 - 0.0070) < 0.00005
assert 0.9*0.5^6 > 0.01 and 0.9*0.5^7 < 0.01
T6 = T^6
T7 = T^7
assert T6[2,2] - 0.1 > 0.01 and T7[2,2] - 0.1 < 0.01
```

## Common mistakes
- Raising each entry to the power $n$: $(-1)^5 = -1$ for the top-right entry of $A^5$ in Example 1, instead of $-211$ (ENTRY_POWER).
- Multiplying the entry by $n$, $5 \cdot (-1) = -5$, as if a power were a product with $n$ (TIMES_N).
- Stopping at $D^n$ and reading its entry as the answer: $D^n$ lives in eigenvector coordinates (D_ONLY).
- Writing $P^{-1}D^nP$ instead of $PD^nP^{-1}$: 211 instead of $-211$ in Example 1 (WRONG_ORDER).
- Multiplying the whole starting vector by $\lambda_1^t$, which treats $x_0$ as if it were an eigenvector (ONE_EIGENVALUE).
- Leaving out the term $c_2\lambda_2^t v_2$ when $t$ is small (DROPPED_TERM).
- Finding the coordinates of $x_0$ as $Px_0$ instead of $P^{-1}x_0$ (MULTIPLIED_BY_P).
- Giving $\lambda_2$ to $v_1$ and $\lambda_1$ to $v_2$: the order of the eigenvalues in $D$ must match the order of the eigenvectors in $P$ (SWAPPED_EIGENVALUES).
- Giving the long-run city share, 66.67 % in Example 2, as the share after 5 years (LONG_RUN_ONLY).
- Swapping the moving rates in the long-run share, $a/(a + b)$ instead of $b/(a + b)$: 34.45 % instead of 62.18 % in Example 2 (FLOWS_REVERSED).
- Multiplying the whole starting share by $\lambda_2^n$: $0.7^5 \cdot 40 = 6.72$ % in Example 2 (SHRANK_WHOLE_SHARE).
- Applying $\lambda_2$ only once: 48 % in Example 2, which is next year's share (ONE_STEP).
- Writing the eigenvectors as the rows of $P$ instead of its columns.
- Assuming every matrix can be diagonalised. A repeated eigenvalue with only one eigenvector direction, as in $\begin{pmatrix} 2 & 1 \\ 0 & 2 \end{pmatrix}$, cannot be.
- Thinking a repeated eigenvalue always rules out diagonalisation: the identity matrix has one repeated eigenvalue and is already diagonal.

## Practice
- `diagonalisation-power-entry` (difficulty 1): one entry of $A^n$ for a 2×2 matrix with given eigenvalues and eigenvectors, via $A^n = PD^nP^{-1}$; distractors ENTRY_POWER, TIMES_N, D_ONLY, WRONG_ORDER.
- `eigen-decoupled-system-state` (difficulty 2): one entry of $x_t$ for $x_{t+1} = Ax_t$, by writing $x_0 = c_1v_1 + c_2v_2$ and using $x_t = c_1\lambda_1^tv_1 + c_2\lambda_2^tv_2$; distractors ONE_EIGENVALUE, DROPPED_TERM, MULTIPLIED_BY_P, SWAPPED_EIGENVALUES.
- `migration-share-after-years` (difficulty 3): the city's share of the population after $n$ years of migration, $s^* + \lambda_2^n(s_0 - s^*)$ with $s^* = b/(a + b)$ and $\lambda_2 = 1 - a - b$; distractors LONG_RUN_ONLY, FLOWS_REVERSED, SHRANK_WHOLE_SHARE, ONE_STEP.

## Real world
- Regional economics: models of migration between regions, or between cities and the countryside, are matrices with columns that add up to 1. The eigenvector for $\lambda = 1$ gives the long-run distribution of the population, and the second eigenvalue tells planners how many years it takes to get close to it.
- Labour markets and credit risk: statistics offices and banks raise transition matrices to high powers to project unemployment many quarters ahead or default rates over five or ten years. Diagonalisation gives all those powers in one formula and shows that the rows of $T^n$ settle on the stationary distribution (see SP01).
- Growth theory: in linear models of an economy whose sectors feed each other, the dominant eigenvalue of the matrix is the long-run growth factor and its eigenvector is the balanced growth path, the mix of sectors that keeps its proportions while every sector grows at the same rate. Von Neumann's model of an expanding economy is built around this idea.
- Interacting markets: when two variables push each other in opposite directions, for example a market where high prices attract new firms whose supply then pushes prices down, the matrix of the model can have complex eigenvalues. Diagonalising with complex numbers still works, and the result is a path that cycles around the equilibrium; DY05 studies such systems with phase diagrams.

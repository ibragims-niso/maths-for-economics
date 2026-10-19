---
id: LA204
title: Quadratic forms and definiteness
block: LA2
coreYear: 2
prerequisites: [LA202, MV07]
estMinutes: 50
status: draft
economicUses:
  - "Second-order conditions: is a multi-product firm's critical point really a profit maximum?"
  - "Portfolio risk: the variance wᵀΣw and which covariance matrices are possible"
  - The shape of cost and profit functions near an optimum
  - Constrained optimisation with the bordered Hessian
generators: [quadratic-form-second-minor, hessian-third-leading-minor, portfolio-variance-three-assets]
widgets: [quadratic-form-contours]
mistakeCodes:
  FORGOT_HALF:
    label: Put the whole cross coefficient off the diagonal
    explanation: In xᵀAx each off-diagonal entry is used twice, so ax² + bxy + cy² needs b/2 in both off-diagonal places. With b there, the matrix stands for ax² + 2bxy + cy² and D₂ comes out as ac − b² instead of ac − b²/4.
  SQUARE_HALVED:
    label: Halved the square instead of squaring the half
    explanation: The off-diagonal entry is b/2, and its square is (b/2)² = b²/4, not b²/2. Halve first, then square.
  TRACE_NOT_DETERMINANT:
    label: Added the diagonal entries
    explanation: a + c is the trace, the sum of the eigenvalues. The second leading principal minor is the determinant, ac − (b/2)², the product of the eigenvalues.
  ADDED_SQUARE:
    label: Added the off-diagonal product
    explanation: A 2×2 determinant is the diagonal product minus the off-diagonal product, ac − (b/2)². Adding (b/2)² makes every form look positive definite and hides saddles.
  DIAGONAL_PRODUCT:
    label: Multiplied the diagonal only
    explanation: The determinant equals the product of the diagonal entries only for a triangular or diagonal matrix. With non-zero off-diagonal entries, expand along a row using the 2×2 minors.
  COFACTOR_SIGN:
    label: Wrong sign on the middle cofactor
    explanation: Expanding along the first row uses the signs +, −, +. The middle entry's minor is subtracted, h₁₁M₁₁ − h₁₂M₁₂ + h₁₃M₁₃; adding it gives a different number.
  SECOND_MINOR_GIVEN:
    label: Gave D₂ instead of D₃
    explanation: D₂ is the determinant of the top-left 2×2 block. The third leading principal minor is the determinant of the whole 3×3 matrix.
  ALL_MINORS_NEGATIVE:
    label: Expected every minor to be negative
    explanation: For a negative definite matrix the leading principal minors alternate in sign, D₁ < 0, D₂ > 0, D₃ < 0. A 2×2 block of a negative definite matrix has two negative eigenvalues, so its determinant is positive.
  LEADING_ONLY_SEMIDEFINITE:
    label: Tested semidefiniteness with leading minors only
    explanation: When some leading minor is 0, the leading minors no longer decide. For semidefiniteness check every principal minor, including those from other diagonal blocks, or use the eigenvalues.
  DIAGONAL_ONLY:
    label: Judged the form by its diagonal
    explanation: Positive diagonal entries only mean Q is positive along the axes. A large cross term can make Q negative in between, as x² + 3xy + y² is at (1, −1). Check D₂ or the eigenvalues.
  NO_COVARIANCE_TERM:
    label: Left out the covariances
    explanation: Portfolio variance is wᵀΣw, which uses every entry of Σ. Adding only wᵢ² times each variance treats the funds as uncorrelated.
  ONE_COVARIANCE_TERM:
    label: Counted each covariance once
    explanation: Σ is symmetric, so σ₁₂ appears both above and below the diagonal, and each pair contributes 2wᵢwⱼσᵢⱼ. Count every covariance term twice.
  WEIGHTS_NOT_SQUARED:
    label: Did not square the weights
    explanation: A fund held at weight w adds w²σᵢᵢ to the variance, not wσᵢᵢ, because variance scales with the square of the amount held.
resources:
  - { title: "Linear Algebra with Applications (Nicholson), 8.3 Positive Definite Matrices (LibreTexts)", url: "https://math.libretexts.org/Bookshelves/Linear_Algebra/Linear_Algebra_with_Applications_(Nicholson)/08%3A_Orthogonality/8.03%3A_Positive_Definite_Matrices", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "18.06SC Linear Algebra: Symmetric Matrices and Positive Definiteness (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/pages/positive-definite-matrices-and-applications/symmetric-matrices-and-positive-definiteness/", kind: course, verifiedAt: 2026-10-18 }
  - { title: "18.06SC Linear Algebra: Positive Definite Matrices and Minima (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/pages/positive-definite-matrices-and-applications/positive-definite-matrices-and-minima/", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
Almost every model ends with a choice: a firm picks outputs, an investor picks a portfolio, a household picks a bundle. Setting derivatives to zero finds the candidates, but a candidate can be a peak, a valley or a mountain pass. Deciding which comes down to one question about a matrix: is the expression $\mathbf{h}^{\mathsf T} H \mathbf{h}$ negative for every direction $\mathbf{h}$, positive for every direction, or sometimes one and sometimes the other?

That expression is a **quadratic form**, and it turns up well beyond second-order conditions. The variance of a portfolio is the quadratic form $\mathbf{w}^{\mathsf T}\Sigma\mathbf{w}$ of its covariance matrix, and because a variance can never be negative, not every symmetric table of numbers can be a covariance matrix. The extra cost of moving away from a firm's cheapest production plan is, near that plan, a quadratic form too. This topic gives two tests for the sign of a quadratic form, one with eigenvalues (LA202) and one with determinants, and collects the rules used for maxima and minima in MV06, MV07 and MV08.

## Intuition
A quadratic form has only squared terms and cross terms, such as $2x^2 + 4xy + 5y^2$: no constant and no linear part. So it is 0 at the origin, and doubling $(x, y)$ multiplies it by 4. Its whole shape is decided by its sign in each direction, and there are only a few possibilities:
- a **bowl**: positive in every direction, like $x^2 + y^2$ (positive definite);
- a **dome**: negative in every direction, like $-x^2 - y^2$ (negative definite);
- a **saddle**: up in some directions and down in others, like $x^2 - y^2$ (indefinite);
- a **valley** or **ridge** with a flat floor: never negative (or never positive) but zero along a whole line, like $(x + y)^2$, which is 0 everywhere on the line $y = -x$ (semidefinite).

The diagonal alone does not tell you which. $x^2 + 3xy + y^2$ is positive along both axes, yet at $(1, -1)$ it is $1 - 3 + 1 = -1$: the cross term is strong enough to turn the bowl into a saddle.

The eigenvalues (LA202) show the shape cleanly. Along an eigenvector $\mathbf{v}$ of $A$, $\mathbf{v}^{\mathsf T}A\mathbf{v} = \lambda\,\mathbf{v}^{\mathsf T}\mathbf{v}$, so the form grows like $\lambda$ times the squared length. For a symmetric matrix the eigenvectors are at right angles, and in coordinates along them the form is just $\lambda_1 u_1^2 + \lambda_2 u_2^2$. Two positive eigenvalues give a bowl, two negative ones a dome, one of each a saddle, and a zero eigenvalue a flat line. Seen from above, the contour lines of a bowl or dome are ellipses with their axes along the eigenvectors; those of a saddle are hyperbolas.

## Definition and formulas
**Quadratic form.** For a symmetric $n \times n$ matrix $A$ and a vector $\mathbf{x} = (x_1, \dots, x_n)$,
$$Q(\mathbf{x}) = \mathbf{x}^{\mathsf T}A\,\mathbf{x} = \sum_{i=1}^{n}\sum_{j=1}^{n} a_{ij}\,x_i x_j .$$
Each off-diagonal entry is used twice, as $a_{ij}x_ix_j$ and $a_{ji}x_jx_i$, so a cross coefficient is split in half between the two places. With two variables
$$ax^2 + bxy + cy^2 = \begin{pmatrix} x & y \end{pmatrix}\begin{pmatrix} a & b/2 \\ b/2 & c \end{pmatrix}\begin{pmatrix} x \\ y \end{pmatrix},$$
and with three, for example,
$$x^2 + 2y^2 + 3z^2 + 2xy - 4yz \quad\longleftrightarrow\quad A = \begin{pmatrix} 1 & 1 & 0 \\ 1 & 2 & -2 \\ 0 & -2 & 3 \end{pmatrix}.$$
A non-symmetric matrix can give the same form (only $a_{ij} + a_{ji}$ matters), so we always use the symmetric one; then the matrix is unique and the tests below apply.

**Definiteness.** The form $Q$, and the symmetric matrix $A$, is
- **positive definite** if $Q(\mathbf{x}) > 0$ for every $\mathbf{x} \neq \mathbf{0}$;
- **positive semidefinite** if $Q(\mathbf{x}) \ge 0$ for every $\mathbf{x}$;
- **negative definite** if $Q(\mathbf{x}) < 0$ for every $\mathbf{x} \neq \mathbf{0}$;
- **negative semidefinite** if $Q(\mathbf{x}) \le 0$ for every $\mathbf{x}$;
- **indefinite** if $Q$ takes both positive and negative values.

A definite form is also semidefinite; "semidefinite but not definite" means $Q = 0$ for some $\mathbf{x} \neq \mathbf{0}$.

**Test 1: eigenvalues.** A symmetric matrix has only real eigenvalues, and eigenvectors for different eigenvalues are at right angles. In coordinates $u_1, \dots, u_n$ along unit eigenvectors the form becomes a sum of squares (LA203 shows how to make this change of coordinates):
$$Q = \lambda_1 u_1^2 + \lambda_2 u_2^2 + \dots + \lambda_n u_n^2 .$$
So $A$ is positive definite exactly when all $\lambda_i > 0$, positive semidefinite when all $\lambda_i \ge 0$, negative definite when all $\lambda_i < 0$, negative semidefinite when all $\lambda_i \le 0$, and indefinite when there are eigenvalues of both signs. On vectors of length 1, $Q$ runs from the smallest eigenvalue to the largest. For two variables
$$\lambda = \frac{(a + c) \pm \sqrt{(a - c)^2 + b^2}}{2},$$
always real, since the square root is of a sum of squares.

**Test 2: leading principal minors (Sylvester's criterion).** The leading principal minors are the determinants of the top-left blocks:
$$D_1 = a_{11}, \qquad D_2 = \begin{vmatrix} a_{11} & a_{12} \\ a_{21} & a_{22} \end{vmatrix}, \qquad \dots, \qquad D_n = \det A .$$
- $A$ is positive definite exactly when $D_1 > 0,\ D_2 > 0,\ \dots,\ D_n > 0$.
- $A$ is negative definite exactly when the signs alternate starting with a negative one: $D_1 < 0,\ D_2 > 0,\ D_3 < 0,\ \dots$, that is $(-1)^k D_k > 0$. (Then $-A$ is positive definite, and changing the sign of a $k \times k$ block multiplies its determinant by $(-1)^k$.)
- If $\det A \neq 0$ and neither pattern holds, $A$ is indefinite.
- If $\det A = 0$, some eigenvalue is 0 and $A$ is not definite; see semidefiniteness below.

For two variables this is short: with $D_2 = ac - b^2/4$, the form $ax^2 + bxy + cy^2$ is positive definite when $a > 0$ and $D_2 > 0$, negative definite when $a < 0$ and $D_2 > 0$, and indefinite when $D_2 < 0$. Since $D_2 = \lambda_1\lambda_2$, a negative $D_2$ means eigenvalues of opposite signs. The example matrix above has $D_1 = 1$, $D_2 = 1$, $D_3 = -1$: it is indefinite, and indeed $Q(-2, 2, 1) = -1$ while $Q(1, 0, 0) = 1$.

**Semidefiniteness needs all principal minors.** A principal minor is the determinant of the block left after deleting the same rows and columns, any of them, not only the last ones. $A$ is positive semidefinite exactly when every principal minor is $\ge 0$, and negative semidefinite exactly when every principal minor of odd size is $\le 0$ and every one of even size is $\ge 0$. A $3 \times 3$ matrix has seven: the three diagonal entries, three $2 \times 2$ ones and the determinant. Leading minors alone are not enough: $\begin{pmatrix} 0 & 0 \\ 0 & -1 \end{pmatrix}$ has $D_1 = 0$ and $D_2 = 0$, which looks "non-negative", but $Q = -y^2$ is negative semidefinite; the other $1 \times 1$ principal minor, $-1$, gives it away.

$$
\begin{array}{lll}
\text{Verdict} & \text{Eigenvalues} & \text{Minors} \\ \hline
\text{positive definite} & \text{all } > 0 & D_1, D_2, \dots, D_n > 0 \\
\text{negative definite} & \text{all } < 0 & D_1 < 0,\ D_2 > 0,\ D_3 < 0, \dots \\
\text{positive semidefinite} & \text{all } \ge 0 & \text{every principal minor} \ge 0 \\
\text{negative semidefinite} & \text{all } \le 0 & \text{odd size} \le 0,\ \text{even size} \ge 0 \\
\text{indefinite} & \text{both signs} & \det A \neq 0 \text{ and neither definite pattern}
\end{array}
$$

**Second-order conditions.** At a critical point $\mathbf{x}^*$ of a function $f$ (all first partials zero, MV07), a small step $\mathbf{h}$ changes $f$ by about half the quadratic form of the Hessian $H$:
$$f(\mathbf{x}^* + \mathbf{h}) \approx f(\mathbf{x}^*) + \tfrac12\,\mathbf{h}^{\mathsf T} H(\mathbf{x}^*)\,\mathbf{h}.$$
- $H$ negative definite: every step lowers $f$, a strict local maximum.
- $H$ positive definite: a strict local minimum.
- $H$ indefinite: a saddle point.
- $H$ only semidefinite: the test cannot decide; higher-order terms do.

If $H$ is negative semidefinite at every point, $f$ is concave (MV06) and a critical point is a global maximum; positive semidefinite everywhere means convex and a global minimum. The Hessian holds the second partials themselves, so a cross term $eQ_1Q_2$ of $f$ puts $e$, not $e/2$, in $H$.

**With a constraint: the bordered Hessian.** When the choice must satisfy $g(\mathbf{x}) = c$, only steps along the constraint count, those with $\nabla g \cdot \mathbf{h} = 0$. The question becomes whether the quadratic form of the Hessian of the Lagrangian is negative definite on those directions only, and the bordered Hessian of MV08 answers it: for two variables and one constraint, $\det \bar H > 0$ means a maximum along the constraint and $\det \bar H < 0$ a minimum. With $n$ variables and $m$ constraints one checks the last $n - m$ leading principal minors of $\bar H$: for a maximum they alternate in sign and $\det \bar H$ has the sign of $(-1)^n$; for a minimum they all have the sign of $(-1)^m$.

**Portfolio variance.** If an investor holds weights $\mathbf{w}$ in funds whose returns have covariance matrix $\Sigma$ (variances $\sigma_{ii}$ on the diagonal, covariances $\sigma_{ij}$ off it, ST201), the portfolio's variance is the quadratic form
$$\sigma_p^2 = \mathbf{w}^{\mathsf T}\Sigma\,\mathbf{w} = \sum_i w_i^2\sigma_{ii} + 2\sum_{i<j} w_i w_j\sigma_{ij}; \qquad \text{two funds: } w_1^2\sigma_{11} + 2w_1w_2\sigma_{12} + w_2^2\sigma_{22}.$$
A variance is never negative, so **every covariance matrix is positive semidefinite**. It is positive definite unless some combination of the funds has no risk at all.

## Interactive
::widget{id="quadratic-form-contours"}

The widget draws contour lines of $Q(x, y) = ax^2 + bxy + cy^2$: solid lilac lines where $Q = 1, 4, 9, 16$, dashed green lines where $Q = -1, -4, -9, -16$, and the two eigenvector directions as gold dashed lines. Move the **Coefficient of x², a**, **Coefficient of xy, b** and **Coefficient of y², c** sliders; the panel shows the minors $D_1, D_2$, the two eigenvalues and the verdict. Check: at the start ($a = 2$, $b = 4$, $c = 5$, the form of Example 1) the panel shows minors 2, 6, eigenvalues 6, 1 and "positive definite"; the contours are ellipses round a minimum, narrowest along the eigenvector $(1, 2)$, where $Q$ rises fastest. Raise $b$ to 8: the panel shows minors 2, −6, eigenvalues 7.77, −0.77 and "indefinite", and the ellipses break into hyperbolas round a saddle. Set $b$ back to 4 and lower $c$ to 2: minors 2, 0, eigenvalues 4, 0 and "positive semidefinite"; now $Q = 2(x + y)^2$ and the contours are straight lines parallel to the flat valley floor $x + y = 0$. Finally set $a = -2$, $b = 4$, $c = -5$: minors −2, 6, eigenvalues −1, −6, "negative definite", a dome whose contours are all dashed because $Q$ is negative.

## Worked examples

### Example 1 (easy): every deviation from the cheapest plan costs money
Near its cheapest production plan, a firm's extra cost (in thousands) from making $x$ more units of good 1 and $y$ more units of good 2 (negative numbers mean fewer) is approximately $Q(x, y) = 2x^2 + 4xy + 5y^2$. Write $Q$ with a symmetric matrix, classify it with both tests, and check that every change of plan raises cost.

1. $A = \begin{pmatrix} 2 & 2 \\ 2 & 5 \end{pmatrix}$
   *Why:* the cross coefficient 4 is split as 2 + 2, because $\begin{pmatrix} x & y \end{pmatrix} A \begin{pmatrix} x \\ y \end{pmatrix} = 2x^2 + 2xy + 2yx + 5y^2$.
2. $D_1 = 2 > 0$, $\;D_2 = 2 \cdot 5 - 2^2 = 6 > 0$, so $Q$ is positive definite
   *Why:* Sylvester's criterion: all leading principal minors positive.
3. $\lambda^2 - 7\lambda + 6 = 0 \;\Rightarrow\; \lambda = \dfrac{7 \pm 5}{2}$, so $\lambda_1 = 6$, $\lambda_2 = 1$
   *Why:* the characteristic equation uses the trace 7 and the determinant 6 (LA202). Both eigenvalues are positive, which agrees with step 2; their product is $D_2 = 6$.
4. $Q = 2(x + y)^2 + 3y^2$; for example $Q(1, -1) = 2 \cdot 0 + 3 = 3$
   *Why:* completing the square shows the answer directly: both squares are $\ge 0$, and $Q = 0$ only if $y = 0$ and $x = -y = 0$. Even making one more unit of good 1 and one fewer of good 2 costs 3 thousand: the cheapest plan is a strict minimum.
5. $Q(1, 2) = 30 = 6 \cdot 5$ and $Q(2, -1) = 5 = 1 \cdot 5$
   *Why:* $(1, 2)$ and $(2, -1)$ are the eigenvectors (they are at right angles), and along an eigenvector $Q = \lambda\,|\mathbf{v}|^2$ with $|\mathbf{v}|^2 = 5$. Cost rises six times as fast along $(1, 2)$ as along $(2, -1)$; the contour lines are ellipses with these axes.

```verify
A = [2, 2; 2, 5]
Q(x, y) = 2x^2 + 4x*y + 5y^2
assert ([1, -3] * A * [1; -3])[1] == Q(1, -3)
assert ([2, 7] * A * [2; 7])[1] == Q(2, 7)
assert A[1,1] == 2
assert det(A) == 6
assert 2*5 - 2^2 == 6
assert trace(A) == 7
assert 7^2 - 4*6 == 25
assert (7 + 5)/2 == 6 and (7 - 5)/2 == 1
assert abs(det(A - 6*identity(2))) < 1e-12 and abs(det(A - 1*identity(2))) < 1e-12
# completing the square
assert Q(3, -2) == 2*(3 - 2)^2 + 3*(-2)^2
assert Q(-1.5, 4) == 2*(-1.5 + 4)^2 + 3*4^2
assert Q(1, -1) == 3
assert deepEqual(A*[1; 2], 6*[1; 2])
assert deepEqual(A*[2; -1], 1*[2; -1])
assert Q(1, 2) == 30 and Q(2, -1) == 5
assert 1*2 + 2*(-1) == 0
```

### Example 2 (medium): is the three-product firm at a maximum?
A firm makes three products; products 2 and 3 sell well together, and so do products 1 and 2. Its profit (in thousands) is
$$\pi = 32Q_1 + 14Q_2 + 8Q_3 - 2Q_1^2 - 3Q_2^2 - Q_3^2 + Q_1Q_2 + 2Q_2Q_3 - 100.$$
Check that $(Q_1, Q_2, Q_3) = (10, 8, 12)$ is a critical point and decide whether it is a maximum. What would change if the last cross term were $4Q_2Q_3$?

1. $\pi_1 = 32 - 4Q_1 + Q_2 = 0$, $\;\pi_2 = 14 + Q_1 - 6Q_2 + 2Q_3 = 0$, $\;\pi_3 = 8 + 2Q_2 - 2Q_3 = 0$ at $(10, 8, 12)$
   *Why:* $32 - 40 + 8$, $14 + 10 - 48 + 24$ and $8 + 16 - 24$ are all 0: no single output can be changed to gain profit, so this is a critical point (MV07).
2. $H = \begin{pmatrix} -4 & 1 & 0 \\ 1 & -6 & 2 \\ 0 & 2 & -2 \end{pmatrix}$
   *Why:* the squared terms give $-4$, $-6$, $-2$ on the diagonal; the cross terms $Q_1Q_2$ and $2Q_2Q_3$ give the cross partials 1 and 2, and $Q_1Q_3$ does not appear, so $\pi_{13} = 0$.
3. $D_1 = -4$, $\;D_2 = (-4)(-6) - 1^2 = 23$, $\;D_3 = -4\,(12 - 4) - 1\,(-2 - 0) + 0 = -30$
   *Why:* $D_3 = \det H$, expanded along the first row with the signs +, −, +; the 2×2 minors are $(-6)(-2) - 2^2 = 8$ and $1 \cdot (-2) - 2 \cdot 0 = -2$.
4. Signs $-, +, -$: $H$ is negative definite, so $(10, 8, 12)$ is a strict local maximum, with $\pi = 164$
   *Why:* the minors alternate starting with a negative one. The Hessian is the same at every point (profit is quadratic), so profit is concave and this is the global maximum: 164 thousand.
5. With $4Q_2Q_3$: $\pi_{23} = 4$, $\;D_3 = -4\,(12 - 16) - 1\,(-2) = 18 > 0$; for $\mathbf{h} = (0, 1, 2)$, $\;\mathbf{h}^{\mathsf T}H\mathbf{h} = -6 - 8 + 2 \cdot 4 \cdot 2 = 2 > 0$
   *Why:* $D_1 < 0$ and $D_2 > 0$ are unchanged, but $D_3$ is now positive: the pattern breaks and $\det H \neq 0$, so $H$ is indefinite. Expanding products 2 and 3 together in the ratio 1 : 2 now raises profit, so any critical point would be a saddle, not a maximum. A strong complementarity can destroy the maximum even though each product alone has diminishing returns.

```verify
p(a, b, c) = 32a + 14b + 8c - 2a^2 - 3b^2 - c^2 + a*b + 2b*c - 100
assert 32 - 4*10 + 8 == 0
assert 14 + 10 - 6*8 + 2*12 == 0
assert 8 + 2*8 - 2*12 == 0
H = [-4, 1, 0; 1, -6, 2; 0, 2, -2]
assert (-6)*(-2) - 2^2 == 8
assert 1*(-2) - 2*0 == -2
assert abs(det(H[1:2, 1:2]) - 23) < 1e-9
assert abs(det(H) - (-30)) < 1e-9
assert -4*8 - 1*(-2) + 0 == -30
assert p(10, 8, 12) == 164
# neighbours earn less
assert p(11, 8, 12) < 164 and p(9, 8, 12) < 164 and p(10, 9, 12) < 164 and p(10, 8, 13) < 164
assert p(10, 9, 14) < 164 and p(11, 9, 12) < 164
# numeric second partial of the cross term
assert p(10, 9, 13) - p(10, 9, 12) - p(10, 8, 13) + p(10, 8, 12) == 2
G = [-4, 1, 0; 1, -6, 4; 0, 4, -2]
assert abs(det(G) - 18) < 1e-9
assert -4*((-6)*(-2) - 4^2) - 1*(1*(-2) - 4*0) == 18
h = [0; 1; 2]
assert (transpose(h) * G * h)[1,1] == 2
assert (transpose(h) * H * h)[1,1] == -6
```

### Example 3 (hard): a covariance matrix that cannot exist
A risk analyst assumes that three funds each have a standard deviation of 10 % (variance 100 in squared percentage points), that fund 1 has correlation 0.9 with fund 2 and with fund 3, and that funds 2 and 3 are uncorrelated. Show that these assumptions are impossible, find the smallest correlation between funds 2 and 3 that makes them possible, and with that correlation set to 0.8 find the variance of the portfolio $\mathbf{w} = (0.6, 0.2, 0.2)$.

1. $\Sigma = \begin{pmatrix} 100 & 90 & 90 \\ 90 & 100 & 0 \\ 90 & 0 & 100 \end{pmatrix}$, and $\operatorname{Var}(\mathbf{w}^{\mathsf T}R) = \mathbf{w}^{\mathsf T}\Sigma\mathbf{w}$ must be $\ge 0$ for every $\mathbf{w}$
   *Why:* each covariance is correlation × SD × SD, $0.9 \cdot 10 \cdot 10 = 90$. Since a variance is never negative, a real covariance matrix must be positive semidefinite.
2. $D_1 = 100$, $\;D_2 = 100^2 - 90^2 = 1{,}900$, $\;D_3 = 100\,(100^2 - 0) - 90\,(9{,}000 - 0) + 90\,(0 - 9{,}000) = -620{,}000$
   *Why:* $D_3 = \det\Sigma$ is the product of the three eigenvalues. It is negative, so at least one eigenvalue is negative and $\Sigma$ is not positive semidefinite: no three funds can have these numbers.
3. $\mathbf{w} = (2, -1, -1)$: $\;\mathbf{w}^{\mathsf T}\Sigma\mathbf{w} = 4 \cdot 100 + 100 + 100 + 2\,(2)(-1)(90) + 2\,(2)(-1)(90) + 2\,(-1)(-1)(0) = -120$
   *Why:* this position buys two units of fund 1 and sells one unit each of funds 2 and 3. Its "variance" would be negative, which is absurd. In words: if funds 2 and 3 each move closely with fund 1, they must move closely with each other.
4. With correlation $r$ between funds 2 and 3: $\det\Sigma = 100^3\,(1 - 0.81 - 0.81 - r^2 + 2 \cdot 0.81\,r) = -10^6\,(r - 1)(r - 0.62) \ge 0$, so $0.62 \le r \le 1$
   *Why:* the determinant of a correlation matrix is $1 - \rho_{12}^2 - \rho_{13}^2 - \rho_{23}^2 + 2\rho_{12}\rho_{13}\rho_{23}$. The other principal minors are $100$ and $100^2(1 - \rho^2) \ge 0$ for any correlation, so only the determinant can fail; it is $\ge 0$ exactly between the roots 0.62 and 1.
5. With $r = 0.8$: $\sigma_{23} = 80$, $\det\Sigma = 36{,}000 > 0$; $\;\sigma_p^2 = 0.36 \cdot 100 + 0.04 \cdot 100 + 0.04 \cdot 100 + 2\,(0.6 \cdot 0.2 \cdot 90 + 0.6 \cdot 0.2 \cdot 90 + 0.2 \cdot 0.2 \cdot 80) = 44 + 49.6 = 93.6$
   *Why:* now all leading minors (100, 1,900, 36,000) are positive, so $\Sigma$ is positive definite and every portfolio has positive variance. Each covariance counts twice because it sits on both sides of the diagonal. The portfolio's standard deviation is $\sqrt{93.6} \approx 9.67\,\%$.

```verify
S = [100, 90, 90; 90, 100, 0; 90, 0, 100]
assert 0.9*10*10 == 90
assert abs(det(S[1:2, 1:2]) - 1900) < 1e-9
assert 100^2 - 90^2 == 1900
assert abs(det(S) - (-620000)) < 1e-6
assert 100*(100^2 - 0) - 90*(9000 - 0) + 90*(0 - 9000) == -620000
w = [2; -1; -1]
assert abs((transpose(w) * S * w)[1,1] - (-120)) < 1e-9
assert 4*100 + 100 + 100 + 2*2*(-1)*90 + 2*2*(-1)*90 + 2*(-1)*(-1)*0 == -120
# determinant of the correlation matrix as a function of r
d(r) = det([1, 0.9, 0.9; 0.9, 1, r; 0.9, r, 1])
assert abs(d(0.3) - (1 - 0.81 - 0.81 - 0.09 + 2*0.81*0.3)) < 1e-12
assert abs(d(0.3) - (-(0.3 - 1)*(0.3 - 0.62))) < 1e-12
assert abs(d(0.62)) < 1e-12 and abs(d(1)) < 1e-12
assert d(0.6) < 0 and d(0.7) > 0
T = [100, 90, 90; 90, 100, 80; 90, 80, 100]
assert abs(det(T) - 36000) < 1e-6
assert abs(d(0.8) - 0.036) < 1e-12
v = [0.6; 0.2; 0.2]
assert abs((transpose(v) * T * v)[1,1] - 93.6) < 1e-9
assert abs(0.36*100 + 0.04*100 + 0.04*100 - 44) < 1e-12
assert abs(2*(0.6*0.2*90 + 0.6*0.2*90 + 0.2*0.2*80) - 49.6) < 1e-12
assert abs(sqrt(93.6) - 9.67) < 0.005
```

## Common mistakes
- Putting the whole cross coefficient $b$ off the diagonal, so that the matrix is $\begin{pmatrix} a & b \\ b & c \end{pmatrix}$ and $D_2$ comes out as $ac - b^2$ (FORGOT_HALF).
- Writing $(b/2)^2$ as $b^2/2$ (SQUARE_HALVED).
- Using the trace $a + c$ where the determinant $ac - b^2/4$ is needed (TRACE_NOT_DETERMINANT).
- Adding $(b/2)^2$ to $ac$ instead of subtracting it (ADDED_SQUARE).
- Taking the product of the diagonal entries as the determinant of a 3×3 matrix whose off-diagonal entries are not zero (DIAGONAL_PRODUCT).
- Adding the middle term of a first-row cofactor expansion; the signs are +, −, + (COFACTOR_SIGN).
- Giving $D_2$ when the question asks for $D_3 = \det H$ (SECOND_MINOR_GIVEN).
- Expecting all leading minors of a negative definite matrix to be negative; they alternate, and $D_2$ is positive (ALL_MINORS_NEGATIVE).
- Calling a matrix positive semidefinite because its leading minors are $\ge 0$ when one of them is 0; then every principal minor must be checked (LEADING_ONLY_SEMIDEFINITE).
- Deciding from the diagonal alone: $x^2 + 3xy + y^2$ has a positive diagonal but is indefinite (DIAGONAL_ONLY).
- Leaving the covariances out of a portfolio variance (NO_COVARIANCE_TERM).
- Counting each covariance once instead of twice (ONE_COVARIANCE_TERM).
- Multiplying each variance by the weight instead of the squared weight (WEIGHTS_NOT_SQUARED).
- Testing a non-symmetric matrix: $ax^2 + bxy + cy^2$ can also be written with $\begin{pmatrix} a & b \\ 0 & c \end{pmatrix}$, but the eigenvalues $a$ and $c$ of that triangular matrix say nothing about the sign of the form. Use the symmetric matrix.
- Calling a critical point a maximum when the Hessian is only negative semidefinite; the second-order test is silent there (see MV07).

## Practice
- `quadratic-form-second-minor` (difficulty 1): write $ax^2 + bxy + cy^2$ with a symmetric matrix and find $D_2 = ac - b^2/4$, which decides its definiteness; distractors FORGOT_HALF, SQUARE_HALVED, TRACE_NOT_DETERMINANT, ADDED_SQUARE.
- `hessian-third-leading-minor` (difficulty 2): the third leading principal minor $D_3 = \det H$ of a three-product firm's Hessian, then whether the critical point is a maximum; distractors DIAGONAL_PRODUCT, COFACTOR_SIGN, SECOND_MINOR_GIVEN.
- `portfolio-variance-three-assets` (difficulty 3): the variance $\mathbf{w}^{\mathsf T}\Sigma\mathbf{w}$ of a three-fund portfolio from its covariance matrix; distractors NO_COVARIANCE_TERM, ONE_COVARIANCE_TERM, WEIGHTS_NOT_SQUARED.

## Real world
- Risk management: banks and fund managers estimate covariance matrices for hundreds of assets, and stress tests often set correlations by hand. A matrix that is not positive semidefinite gives some portfolio a negative variance, so risk systems check the eigenvalues and repair such matrices before using them. Mean–variance portfolio choice also needs a positive definite matrix to have one least-risky portfolio.
- Estimating models: econometric software finds estimates by maximising a likelihood or minimising a sum of squared errors over many parameters. It checks that the Hessian at the answer is negative (or positive) definite, and the inverse of that Hessian gives the standard errors. In least squares the Hessian is $2X^{\mathsf T}X$, positive definite unless two regressors are perfectly collinear.
- Consumer theory: the matrix of substitution effects (the Slutsky matrix) is negative semidefinite. Its diagonal entries are therefore never positive, which is the law of demand for compensated price changes.
- Multi-product firms and regulators: when products are strong complements, a profit function can lose its maximum, as in Example 2; checking definiteness tells a planner whether a computed optimum is real or a saddle.

---
id: EM01
title: Multiple regression in matrix form (OLS)
block: EM
coreYear: 3
prerequisites: [ST205, LA105]
estMinutes: 50
status: draft
economicUses:
  - "Wage equations: the return to education, holding experience constant"
  - Estimating demand from price and income at the same time
  - "Hedonic house prices: what one more square metre is worth, location held fixed"
  - Production functions estimated from labour and capital data
  - Reading the coefficient table of an applied economics paper
generators: [xtx-entry-from-data, adjusted-r-squared, ols-coefficient-two-regressors]
widgets: [partial-effect-wages]
mistakeCodes:
  PRODUCT_OF_SUMS:
    label: Multiplied the column totals instead of adding the products
    explanation: Each entry of XᵀX or Xᵀy is a sum of products, Σx₁x₂, worked out observation by observation. Multiplying the totals, Σx₁ · Σx₂, mixes every observation with every other one and gives a much larger number.
  USED_DEVIATIONS:
    label: Used deviations from the means
    explanation: X holds the raw data, with a column of ones, so XᵀX contains raw sums such as Σx₁x₂. The centred sums Σ(x₁ − x̄₁)(x₂ − x̄₂) belong to the shortcut matrix X̃ᵀX̃, which leaves the intercept out.
  NO_INTERCEPT_COLUMN:
    label: Forgot the column of ones
    explanation: The first column of X is all ones for the intercept, so x₁ is column 2 and x₂ is column 3. Counting columns from x₁ picks the wrong entry of XᵀX or Xᵀy.
  OMITTED_REGRESSOR:
    label: Divided by the diagonal entry alone
    explanation: (X̃ᵀỹ)ⱼ/(X̃ᵀX̃)ⱼⱼ is the slope of a simple regression on xⱼ alone. When the regressors are correlated, every coefficient depends on both entries of X̃ᵀỹ, so you need the whole inverse matrix.
  NO_INVERSE:
    label: Multiplied by XᵀX instead of its inverse
    explanation: The normal equations say XᵀX·b = Xᵀy, so b = (XᵀX)⁻¹Xᵀy. Multiplying Xᵀy by XᵀX itself goes the wrong way and gives a huge number.
  NO_SIGN_CHANGE:
    label: Forgot to change the sign of the off-diagonal entries
    explanation: The inverse of the 2×2 matrix with rows (a, c) and (c, d) is (1/(ad − c²)) times the matrix with rows (d, −c) and (−c, a). The off-diagonal entries change sign.
  NO_DIAGONAL_SWAP:
    label: Forgot to swap the diagonal entries
    explanation: In the 2×2 inverse the two diagonal entries change places, so b₁ = (d·g₁ − c·g₂)/(ad − c²). Leaving a and d where they are gives the wrong coefficient.
  NO_ADJUSTMENT:
    label: Gave R² instead of adjusted R²
    explanation: Adjusted R² corrects R² for the number of coefficients, R̄² = 1 − (1 − R²)(n − 1)/(n − k). It is always smaller than R² when the model has regressors.
  DF_NO_INTERCEPT:
    label: Did not count the intercept in k
    explanation: k is the number of estimated coefficients, the intercept included, which is the number of columns of X. With m regressors and an intercept, k = m + 1 and the residual degrees of freedom are n − m − 1.
  DF_RATIO_INVERTED:
    label: Turned the degrees-of-freedom ratio upside down
    explanation: The factor is (n − 1)/(n − k), which is bigger than 1, so adjusted R² is below R². Using (n − k)/(n − 1) pushes it above R² instead.
  DUMMY_TRAP:
    label: Included a dummy for every group as well as the intercept
    explanation: Dummies for all groups add up to the column of ones, so the columns of X are linearly dependent, XᵀX has no inverse and OLS has no unique answer. Leave one group out as the base group.
  R2_NEVER_FALLS:
    label: Judged a model by its R² alone
    explanation: Adding any regressor, even a useless one, never lowers R², because OLS can always give it a zero coefficient. Compare models with adjusted R², which charges for every coefficient, or with the tests of EM03.
  WRONG_PRODUCT_ORDER:
    label: Wrote XXᵀ instead of XᵀX
    explanation: X is n × k, so XᵀX is a small k × k matrix of sums, while XXᵀ is a large n × n matrix with no role in OLS. Check the sizes, (k × n)(n × k) = k × k.
resources:
  - { title: "STAT 462, 5.4 A Matrix Formulation of the Multiple Regression Model (Penn State)", url: "https://online.stat.psu.edu/stat462/node/132/", kind: course, verifiedAt: 2026-10-18 }
  - { title: "Introductory Business Statistics 2e, 13.4 The Regression Equation (OpenStax)", url: "https://openstax.org/books/introductory-business-statistics-2e/pages/13-4-the-regression-equation", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "14.32 Econometrics (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/14-32-econometrics-spring-2007/", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
Simple regression (ST205) asks how $y$ moves with one variable. Economic questions almost never have only one cause. Wages depend on education **and** experience; the demand for a good depends on its price **and** on income; the price of a flat depends on its size **and** its location. If we regress wages on education alone, the slope also picks up everything that moves with education, such as the experience that more educated young workers have not yet had. **Multiple regression** puts all the explanatory variables in one equation and estimates the effect of each one **holding the others constant**, the *ceteris paribus* idea of economic theory. Written with matrices (LA102, LA105), the whole method fits on one line, $b = (X^\top X)^{-1} X^\top y$, and that one line is what every statistics package computes when it prints a regression table.

## Intuition
Think of a data set as a table: one row per worker, one column per variable. Stack the wages into a column $y$ and the explanatory variables, together with a column of ones for the intercept, into a matrix $X$. A guess $b$ for the coefficients gives a fitted wage for every worker, $Xb$, and a residual, $y - Xb$. As in ST205, least squares picks the $b$ that makes the sum of squared residuals as small as possible.

With one regressor the answer was a ratio of two sums. With several, the sums become a matrix: $X^\top X$ collects the sums of squares and cross-products of the regressors, and $X^\top y$ collects how each regressor moves with $y$. Solving $X^\top X\, b = X^\top y$ is like dividing $X^\top y$ by $X^\top X$, and "dividing by a matrix" means multiplying by its inverse.

Why not run one simple regression per variable? Because the regressors move together. If educated workers in the sample tend to have less experience, a simple regression of wages on education credits education with a wage effect that is partly the missing experience. The inverse matrix untangles the two: the off-diagonal entries of $X^\top X$ measure how much the regressors overlap, and the inverse uses them to separate their effects. The Try it widget shows this happening.

## Definition and formulas
**The model.** With $n$ observations and two explanatory variables,
$$y_i = \beta_0 + \beta_1 x_{i1} + \beta_2 x_{i2} + u_i, \qquad i = 1, \dots, n,$$
or, stacking the $n$ equations,
$$y = X\beta + u, \qquad y = \begin{pmatrix} y_1 \\ \vdots \\ y_n \end{pmatrix}, \quad X = \begin{pmatrix} 1 & x_{11} & x_{12} \\ \vdots & \vdots & \vdots \\ 1 & x_{n1} & x_{n2} \end{pmatrix}, \quad \beta = \begin{pmatrix} \beta_0 \\ \beta_1 \\ \beta_2 \end{pmatrix}.$$
The **design matrix** $X$ is $n \times k$, where $k$ is the number of coefficients, the intercept included (here $k = 3$). Its first column of ones carries the intercept; each further column holds one regressor. The same notation covers any number of regressors.

**Sum of squared residuals.** For a candidate vector $b$, the residuals are $e = y - Xb$ and
$$\text{SSR}(b) = \sum_{i=1}^n e_i^2 = e^\top e = (y - Xb)^\top (y - Xb).$$

**Normal equations.** Multiplying out, $\text{SSR}(b) = y^\top y - 2b^\top X^\top y + b^\top X^\top X\, b$. Setting the partial derivative with respect to each $b_j$ to zero (MV07) gives $-2X^\top y + 2X^\top X\, b = 0$, the **normal equations**
$$X^\top X\, b = X^\top y.$$
For two regressors and an intercept the matrices are sums you can read off the data:
$$X^\top X = \begin{pmatrix} n & \sum x_{i1} & \sum x_{i2} \\ \sum x_{i1} & \sum x_{i1}^2 & \sum x_{i1}x_{i2} \\ \sum x_{i2} & \sum x_{i1}x_{i2} & \sum x_{i2}^2 \end{pmatrix}, \qquad X^\top y = \begin{pmatrix} \sum y_i \\ \sum x_{i1}y_i \\ \sum x_{i2}y_i \end{pmatrix}.$$
Entry $(j, l)$ of $X^\top X$ is column $j$ of $X$ times column $l$, added over the observations, so $X^\top X$ is symmetric. It is $k \times k$, small, whatever the number of observations.

**The OLS estimator.** If $X^\top X$ can be inverted,
$$b = (X^\top X)^{-1} X^\top y.$$
The Hessian of SSR is $2X^\top X$, which is positive definite in that case, so this $b$ is the unique minimum. With one regressor this formula gives back the slope and intercept of ST205 (Example 1).

**Full column rank.** $X^\top X$ is invertible exactly when the columns of $X$ are linearly independent, that is, when $X$ has rank $k$ (LA201). This needs at least as many observations as coefficients ($n \ge k$) and no column that is an exact combination of the others. When one column is such a combination, we have **perfect multicollinearity**: the data cannot tell the effects apart, and OLS has infinitely many solutions. The classic case is the **dummy variable trap**. A **dummy variable** is 1 for the members of a group and 0 otherwise. Putting in a dummy for men and one for women together with the intercept makes the two dummies add up to the column of ones. The fix is to leave one group out: its members form the **base group**, and the coefficient of the other dummy measures how far that group's average $y$ lies above the base group's, holding the other regressors constant.

**Fitted values and residuals.** The fitted values are $\hat y = Xb$ and the residuals $e = y - \hat y$. Substituting $b$ into the normal equations gives
$$X^\top e = X^\top y - X^\top X\, b = 0:$$
the residuals are **orthogonal** to every column of $X$. The first row (the column of ones) says $\sum e_i = 0$; the others say $\sum x_{ij} e_i = 0$, so the residuals are uncorrelated with every regressor. Least squares has used up all the linear information the regressors carry about $y$.

**A shortcut with an intercept.** The first normal equation, divided by $n$, says the fitted plane passes through the means: $\bar y = b_0 + b_1 \bar x_1 + b_2 \bar x_2$. Subtracting it from the others leaves a $2 \times 2$ system in deviations from the means. Write $\tilde X$ for the matrix of the two regressors in deviations and $\tilde y$ for $y$ in deviations; then
$$\tilde X^\top \tilde X \begin{pmatrix} b_1 \\ b_2 \end{pmatrix} = \tilde X^\top \tilde y, \qquad \tilde X^\top \tilde X = \begin{pmatrix} \sum \tilde x_{i1}^2 & \sum \tilde x_{i1} \tilde x_{i2} \\ \sum \tilde x_{i1} \tilde x_{i2} & \sum \tilde x_{i2}^2 \end{pmatrix},$$
and $b_0 = \bar y - b_1 \bar x_1 - b_2 \bar x_2$. With the $2 \times 2$ inverse of LA105,
$$b_1 = \frac{\sum \tilde x_2^2 \sum \tilde x_1 \tilde y - \sum \tilde x_1 \tilde x_2 \sum \tilde x_2 \tilde y}{\sum \tilde x_1^2 \sum \tilde x_2^2 - \left(\sum \tilde x_1 \tilde x_2\right)^2}.$$
If $\sum \tilde x_1 \tilde x_2 = 0$ (the regressors are uncorrelated), this is the simple-regression slope $\sum \tilde x_1 \tilde y / \sum \tilde x_1^2$. Otherwise the two differ.

**Interpreting a coefficient.** $b_j$ is the change in the fitted $y$ when $x_j$ rises by one unit **and the other regressors stay the same**. In a wage equation $\widehat{\text{wage}} = b_0 + b_1\,\text{educ} + b_2\,\text{exper}$, $b_1$ compares workers with the same experience who differ by one year of education. A simple regression of wages on education alone compares workers who differ in education *and* in whatever moves with it. When an omitted variable both affects $y$ and is correlated with an included regressor, the simple slope absorbs part of its effect: this is **omitted-variable bias**. Including the variable removes the bias from that source; EM02 shows when the OLS estimates are unbiased in general.

**$R^2$ and adjusted $R^2$.** As in ST205, $\text{SST} = \sum (y_i - \bar y)^2$ and
$$R^2 = 1 - \frac{\text{SSR}}{\text{SST}}.$$
Adding a regressor can never raise SSR (OLS could always give the new variable a zero coefficient), so $R^2$ never falls when variables are added, even useless ones. The **adjusted $R^2$** charges for each coefficient by comparing variances instead of sums:
$$\bar R^2 = 1 - \frac{\text{SSR}/(n - k)}{\text{SST}/(n - 1)} = 1 - (1 - R^2)\,\frac{n - 1}{n - k}.$$
It is below $R^2$, it can fall when a weak regressor is added, and it can even be negative. The number $n - k$ is the **residual degrees of freedom**: $k$ coefficients have been estimated from $n$ observations. EM02 uses $s^2 = \text{SSR}/(n - k)$ to measure how precise $b$ is, and EM03 builds $t$ and $F$ tests on it.

## Interactive
::widget{id="partial-effect-wages"}

The six dots are the workers of Example 2: hourly wage up, years of education across. Hollow dots are recent graduates with 2 years' experience; filled dots have 10 years. The purple and green lines are the multiple regression's fitted wages at 10 and at 2 years of experience, and the dashed gold line is the simple regression on education alone. At the start the panel shows Education slope, multiple = 1.5 and Education slope, simple = 0.9, with $R^2 = 0.933$, as in Examples 2 and 3. Move **Average education, experienced workers** up to 16: the two groups now have the same education on average, the caption says that education and experience are uncorrelated, and the simple slope rises to 1.5 as well. Move it on to 20 and the simple slope overshoots to 2.1, because now the more educated workers also have more experience. Throughout, the multiple-regression slope stays at 1.5. Set **Wage gain per year of experience β₂** to 0 and both slopes agree wherever the first slider is: an omitted variable only biases the simple slope when it affects wages and moves with education.

## Worked examples

### Example 1 (easy): the café's demand line in matrix form
A café charged five different prices $P$ for its lunch sandwich and recorded the average number $Q$ sold per day (the data of ST205, Example 1):
$$\begin{array}{c|ccccc} P & 2 & 3 & 4 & 5 & 6 \\ \hline Q & 86 & 73 & 68 & 61 & 52 \end{array}$$
Estimate $Q = \beta_0 + \beta_1 P + u$ with the matrix formula $b = (X^\top X)^{-1}X^\top y$, and check that the residuals are orthogonal to the columns of $X$.

1. $X = \begin{pmatrix} 1 & 2 \\ 1 & 3 \\ 1 & 4 \\ 1 & 5 \\ 1 & 6 \end{pmatrix}, \qquad y = \begin{pmatrix} 86 \\ 73 \\ 68 \\ 61 \\ 52 \end{pmatrix}$
   *Why:* one row per week; the column of ones carries the intercept and the second column the price, so $X$ is $5 \times 2$ and $k = 2$.
2. $X^\top X = \begin{pmatrix} 5 & 20 \\ 20 & 90 \end{pmatrix}, \qquad X^\top y = \begin{pmatrix} 340 \\ 1{,}280 \end{pmatrix}$
   *Why:* entry by entry these are $n$, $\sum P = 20$, $\sum P^2 = 90$, $\sum Q = 340$ and $\sum PQ = 1{,}280$: each is a column of $X$ times a column of $X$ or $y$.
3. $\det(X^\top X) = 5 \times 90 - 20^2 = 50, \qquad (X^\top X)^{-1} = \dfrac{1}{50}\begin{pmatrix} 90 & -20 \\ -20 & 5 \end{pmatrix} = \begin{pmatrix} 1.8 & -0.4 \\ -0.4 & 0.1 \end{pmatrix}$
   *Why:* the $2 \times 2$ inverse (LA105): swap the diagonal entries, change the sign of the others, divide by the determinant. The determinant is not zero because the prices are not all equal.
4. $b = \begin{pmatrix} 1.8 & -0.4 \\ -0.4 & 0.1 \end{pmatrix}\begin{pmatrix} 340 \\ 1{,}280 \end{pmatrix} = \begin{pmatrix} 612 - 512 \\ -136 + 128 \end{pmatrix} = \begin{pmatrix} 100 \\ -8 \end{pmatrix}$
   *Why:* this is $\hat Q = 100 - 8P$, exactly the line ST205 found from the centred sums. The matrix formula is the same least-squares method, written so that it works for any number of regressors.
5. $\hat y = Xb = (84, 76, 68, 60, 52), \quad e = y - \hat y = (2, -3, 0, 1, 0), \quad X^\top e = \begin{pmatrix} 2 - 3 + 0 + 1 + 0 \\ 4 - 9 + 0 + 5 + 0 \end{pmatrix} = \begin{pmatrix} 0 \\ 0 \end{pmatrix}$
   *Why:* the residuals add up to 0 and are uncorrelated with the price, as the normal equations promise: $X^\top e = X^\top y - X^\top X\, b = 0$.

```verify
X = [1, 2; 1, 3; 1, 4; 1, 5; 1, 6]; y = [86; 73; 68; 61; 52]
XtX = transpose(X) * X; Xty = transpose(X) * y
assert deepEqual(XtX, [5, 20; 20, 90])
assert deepEqual(Xty, [340; 1280])
assert det(XtX) == 50 or abs(det(XtX) - 50) < 1e-9
A = inv(XtX)
assert max(abs(A - [1.8, -0.4; -0.4, 0.1])) < 1e-12
assert max(abs(A - [90, -20; -20, 5] / 50)) < 1e-12
assert 1.8 * 340 == 612 and 0.4 * 1280 == 512 and 0.4 * 340 == 136 and abs(0.1 * 1280 - 128) < 1e-9
b = A * Xty
assert max(abs(b - [100; -8])) < 1e-9
yhat = X * [100; -8]
assert deepEqual(yhat, [84; 76; 68; 60; 52])
res = y - yhat
assert deepEqual(res, [2; -3; 0; 1; 0])
assert deepEqual(transpose(X) * res, [0; 0])
# the same slope from the centred sums of ST205
P = [2, 3, 4, 5, 6]; Q = [86, 73, 68, 61, 52]
assert sum((P - mean(P)) .* (Q - mean(Q))) / sum((P - mean(P)) .^ 2) == -8
```

### Example 2 (medium): a wage equation with education and experience
Six workers report their hourly wage, years of education and years of work experience. Three are recent graduates with 2 years' experience; three have 10 years:
$$\begin{array}{c|cccccc} \text{wage } y & 11.5 & 16 & 17.5 & 10.5 & 12 & 16.5 \\ \hline \text{educ } x_1 & 14 & 16 & 18 & 10 & 12 & 14 \\ \text{exper } x_2 & 2 & 2 & 2 & 10 & 10 & 10 \end{array}$$
Estimate $\text{wage} = \beta_0 + \beta_1\,\text{educ} + \beta_2\,\text{exper} + u$ by OLS and interpret $b_1$.

1. $X^\top X = \begin{pmatrix} 6 & 84 & 36 \\ 84 & 1{,}216 & 456 \\ 36 & 456 & 312 \end{pmatrix}, \qquad X^\top y = \begin{pmatrix} 84 \\ 1{,}212 \\ 480 \end{pmatrix}$
   *Why:* $X$ is $6 \times 3$ with columns $(1, \text{educ}, \text{exper})$. For example $\sum x_1 x_2 = 14 \cdot 2 + 16 \cdot 2 + 18 \cdot 2 + 10 \cdot 10 + 12 \cdot 10 + 14 \cdot 10 = 456$: products added observation by observation.
2. $\bar x_1 = 14, \quad \bar x_2 = 6, \quad \bar y = 14; \qquad \tilde X^\top \tilde X = \begin{pmatrix} 40 & -48 \\ -48 & 96 \end{pmatrix}, \quad \tilde X^\top \tilde y = \begin{pmatrix} 36 \\ -24 \end{pmatrix}$
   *Why:* the shortcut separates the intercept: the deviations of education are $0, 2, 4, -4, -2, 0$, of experience $-4, -4, -4, 4, 4, 4$ and of wages $-2.5, 2, 3.5, -3.5, -2, 2.5$. The negative cross-product $-48$ says that in this sample the more educated workers have less experience.
3. $\det = 40 \times 96 - (-48)^2 = 3{,}840 - 2{,}304 = 1{,}536, \qquad (\tilde X^\top \tilde X)^{-1} = \dfrac{1}{1{,}536}\begin{pmatrix} 96 & 48 \\ 48 & 40 \end{pmatrix}$
   *Why:* the determinant is positive, so the two columns are not proportional and the slopes are unique. Swapping the diagonal and changing the sign of $-48$ gives the inverse.
4. $b_1 = \dfrac{96 \times 36 + 48 \times (-24)}{1{,}536} = \dfrac{2{,}304}{1{,}536} = 1.5, \qquad b_2 = \dfrac{48 \times 36 + 40 \times (-24)}{1{,}536} = \dfrac{768}{1{,}536} = 0.5$
   *Why:* each slope uses both entries of $\tilde X^\top \tilde y$. Dividing $36$ by $40$ alone would give $0.9$, the slope of wages on education with experience left out.
5. $b_0 = 14 - 1.5 \times 14 - 0.5 \times 6 = -10, \qquad \widehat{\text{wage}} = -10 + 1.5\,\text{educ} + 0.5\,\text{exper}$
   *Why:* the fitted plane passes through the point of means. The intercept, a wage at zero education and zero experience, lies far outside the data and has no meaning of its own.
6. Check: $X^\top X\, b = \begin{pmatrix} -60 + 126 + 18 \\ -840 + 1{,}824 + 228 \\ -360 + 684 + 156 \end{pmatrix} = \begin{pmatrix} 84 \\ 1{,}212 \\ 480 \end{pmatrix} = X^\top y$
   *Why:* $b$ solves all three normal equations of the full $3 \times 3$ system. So among workers with the **same experience**, one more year of education goes with an hourly wage 1.5 higher; among workers with the same education, each year of experience goes with 0.5 more.

```verify
X = [1, 14, 2; 1, 16, 2; 1, 18, 2; 1, 10, 10; 1, 12, 10; 1, 14, 10]
y = [11.5; 16; 17.5; 10.5; 12; 16.5]
XtX = transpose(X) * X; Xty = transpose(X) * y
assert deepEqual(XtX, [6, 84, 36; 84, 1216, 456; 36, 456, 312])
assert deepEqual(Xty, [84; 1212; 480])
assert 14 * 2 + 16 * 2 + 18 * 2 + 10 * 10 + 12 * 10 + 14 * 10 == 456
educ = [14, 16, 18, 10, 12, 14]; exper = [2, 2, 2, 10, 10, 10]; wage = [11.5, 16, 17.5, 10.5, 12, 16.5]
assert mean(educ) == 14 and mean(exper) == 6 and mean(wage) == 14
d1 = educ - 14; d2 = exper - 6; dy = wage - 14
assert deepEqual(d1, [0, 2, 4, -4, -2, 0]) and deepEqual(d2, [-4, -4, -4, 4, 4, 4])
assert deepEqual(dy, [-2.5, 2, 3.5, -3.5, -2, 2.5])
M = [sum(d1 .* d1), sum(d1 .* d2); sum(d1 .* d2), sum(d2 .* d2)]
g = [sum(d1 .* dy); sum(d2 .* dy)]
assert deepEqual(M, [40, -48; -48, 96]) and deepEqual(g, [36; -24])
assert det(M) == 1536 or abs(det(M) - 1536) < 1e-9
assert 40 * 96 == 3840 and 48^2 == 2304
assert max(abs(inv(M) - [96, 48; 48, 40] / 1536)) < 1e-12
assert 96 * 36 + 48 * (-24) == 2304 and 48 * 36 + 40 * (-24) == 768
slopes = inv(M) * g
assert max(abs(slopes - [1.5; 0.5])) < 1e-12
assert 36 / 40 == 0.9
b0 = 14 - 1.5 * 14 - 0.5 * 6
assert b0 == -10
b = [-10; 1.5; 0.5]
assert deepEqual(XtX * b, Xty)
assert -840 + 1824 + 228 == 1212 and -360 + 684 + 156 == 480
# the full 3x3 inverse gives the same b
assert max(abs(inv(XtX) * Xty - b)) < 1e-9
```

### Example 3 (hard): fit, omitted experience and the dummy trap
Continue with the six workers and the fit $\widehat{\text{wage}} = -10 + 1.5\,\text{educ} + 0.5\,\text{exper}$ of Example 2. (a) Find the residuals, check $X^\top e = 0$, and compute $R^2$ and adjusted $R^2$. (b) Compare with the simple regression of wages on education alone. (c) An analyst also wants to add a dummy $D = 1$ for the experienced workers. What goes wrong?

1. $\hat y = (12, 15, 18, 10, 13, 16), \qquad e = (-0.5, 1, -0.5, 0.5, -1, 0.5)$
   *Why:* for the first worker $-10 + 1.5 \times 14 + 0.5 \times 2 = 12$, and $11.5 - 12 = -0.5$.
2. $X^\top e = \begin{pmatrix} \sum e \\ \sum x_1 e \\ \sum x_2 e \end{pmatrix} = \begin{pmatrix} 0 \\ -7 + 16 - 9 + 5 - 12 + 7 \\ 2(-0.5 + 1 - 0.5) + 10(0.5 - 1 + 0.5) \end{pmatrix} = \begin{pmatrix} 0 \\ 0 \\ 0 \end{pmatrix}$
   *Why:* the residuals are orthogonal to the column of ones, to education and to experience; within each experience group they add up to 0, which is why the last entry vanishes.
3. $\text{SSR} = 0.25 + 1 + 0.25 + 0.25 + 1 + 0.25 = 3, \qquad \text{SST} = \sum (y - \bar y)^2 = 45, \qquad R^2 = 1 - \dfrac{3}{45} = 0.9333$
   *Why:* SST adds the squared wage deviations of Example 2, $6.25 + 4 + 12.25 + 12.25 + 4 + 6.25 = 45$. Education and experience together explain about 93 % of the wage variation.
4. $\bar R^2 = 1 - \dfrac{3/(6 - 3)}{45/(6 - 1)} = 1 - \dfrac{1}{9} = 0.8889$
   *Why:* $k = 3$ coefficients were estimated from $n = 6$ workers, leaving 3 residual degrees of freedom. With so few observations the penalty is large: adjusted $R^2$ is well below $R^2$.
5. Simple regression: $b_1^{\text{simple}} = \dfrac{36}{40} = 0.9, \quad R^2 = \dfrac{0.9 \times 36}{45} = 0.72, \quad \bar R^2 = 1 - (1 - 0.72)\,\dfrac{5}{4} = 0.65$
   *Why:* leaving experience out, the education slope drops from 1.5 to 0.9. The more educated workers here have less experience: regressing experience on education gives a slope of $-48/40 = -1.2$, and $1.5 + 0.5 \times (-1.2) = 0.9$. The simple slope mixes the education effect with the wage cost of the missing experience, the omitted-variable bias. Adding experience raises adjusted $R^2$ from 0.65 to 0.889, so it earns its degree of freedom.
6. $D = (0, 0, 0, 1, 1, 1) \;\Rightarrow\; \text{exper} = 2 \cdot \mathbf{1} + 8D, \qquad \det(X_D^\top X_D) = 0$
   *Why:* in this sample experience takes only the values 2 and 10, so the experience column is an exact combination of the column of ones and the dummy. The $6 \times 4$ matrix $X_D$ has rank 3, not 4 (LA201), its $X_D^\top X_D$ cannot be inverted, and OLS cannot separate "10 years of experience" from "being in the experienced group". One of the two variables must go.

```verify
X = [1, 14, 2; 1, 16, 2; 1, 18, 2; 1, 10, 10; 1, 12, 10; 1, 14, 10]
y = [11.5; 16; 17.5; 10.5; 12; 16.5]
b = inv(transpose(X) * X) * transpose(X) * y
assert max(abs(b - [-10; 1.5; 0.5])) < 1e-9
yhat = X * [-10; 1.5; 0.5]
assert deepEqual(yhat, [12; 15; 18; 10; 13; 16])
assert -10 + 1.5 * 14 + 0.5 * 2 == 12
res = y - yhat
assert deepEqual(res, [-0.5; 1; -0.5; 0.5; -1; 0.5])
assert deepEqual(transpose(X) * res, [0; 0; 0])
assert -7 + 16 - 9 + 5 - 12 + 7 == 0
assert 2 * (-0.5 + 1 - 0.5) + 10 * (0.5 - 1 + 0.5) == 0
ssr = sum(res .^ 2)
assert ssr == 3
wage = [11.5, 16, 17.5, 10.5, 12, 16.5]
sst = sum((wage - mean(wage)) .^ 2)
assert sst == 45 and 6.25 + 4 + 12.25 + 12.25 + 4 + 6.25 == 45
r2 = 1 - ssr / sst
assert abs(r2 - 0.9333) < 0.00005
n = 6; k = 3
adj = 1 - (ssr / (n - k)) / (sst / (n - 1))
assert abs(adj - (1 - 1/9)) < 1e-12 and abs(adj - 0.8889) < 0.00005
assert abs(adj - (1 - (1 - r2) * (n - 1) / (n - k))) < 1e-12
# simple regression of wage on education
educ = [14, 16, 18, 10, 12, 14]; exper = [2, 2, 2, 10, 10, 10]
d1 = educ - mean(educ); d2 = exper - mean(exper); dy = wage - mean(wage)
bs = sum(d1 .* dy) / sum(d1 .^ 2)
assert abs(bs - 0.9) < 1e-12
r2s = bs * sum(d1 .* dy) / sst
assert abs(r2s - 0.72) < 1e-12
ssrs = sum((dy - bs * d1) .^ 2)
assert abs(r2s - (1 - ssrs / sst)) < 1e-12
adjs = 1 - (1 - r2s) * 5 / 4
assert abs(adjs - 0.65) < 1e-12
slope21 = sum(d1 .* d2) / sum(d1 .^ 2)
assert slope21 == -1.2
assert abs(1.5 + 0.5 * slope21 - 0.9) < 1e-12
# the dummy trap
D = [0, 0, 0, 1, 1, 1]
assert deepEqual(exper, 2 + 8 * D)
XD = [1, 14, 2, 0; 1, 16, 2, 0; 1, 18, 2, 0; 1, 10, 10, 1; 1, 12, 10, 1; 1, 14, 10, 1]
assert abs(det(transpose(XD) * XD)) < 1e-6
assert deepEqual(XD * [2; 0; -1; 8], [0; 0; 0; 0; 0; 0])
# the widget: experienced workers' education moved to 16 (correlation 0) and to 20
e16 = [14, 16, 18, 14, 16, 18]; w16 = -10 + 1.5 * e16 + 0.5 * exper + [-0.5, 1, -0.5, 0.5, -1, 0.5]
c16 = e16 - mean(e16)
assert sum(c16 .* d2) == 0
assert abs(sum(c16 .* (w16 - mean(w16))) / sum(c16 .^ 2) - 1.5) < 1e-12
e20 = [14, 16, 18, 18, 20, 22]; w20 = -10 + 1.5 * e20 + 0.5 * exper + [-0.5, 1, -0.5, 0.5, -1, 0.5]
c20 = e20 - mean(e20)
assert abs(sum(c20 .* (w20 - mean(w20))) / sum(c20 .^ 2) - 2.1) < 1e-12
```

## Common mistakes
- Multiplying the column totals, $\sum x_1 \cdot \sum x_2$, instead of adding the products $\sum x_1 x_2$ observation by observation (PRODUCT_OF_SUMS).
- Filling $X^\top X$ with centred sums such as $\sum (x_1 - \bar x_1)(x_2 - \bar x_2)$; those belong to the shortcut matrix $\tilde X^\top \tilde X$, not to $X^\top X$ with its column of ones (USED_DEVIATIONS).
- Forgetting the column of ones, so that $x_1$ is taken as column 1 of $X$ and every entry is looked up in the wrong place (NO_INTERCEPT_COLUMN).
- Dividing $(\tilde X^\top \tilde y)_j$ by the diagonal entry $(\tilde X^\top \tilde X)_{jj}$ alone; that is the simple-regression slope, which ignores the other regressor (OMITTED_REGRESSOR).
- Multiplying $X^\top y$ by $X^\top X$ instead of by its inverse (NO_INVERSE).
- Forgetting to change the sign of the off-diagonal entries in the $2 \times 2$ inverse (NO_SIGN_CHANGE).
- Forgetting to swap the diagonal entries in the $2 \times 2$ inverse (NO_DIAGONAL_SWAP).
- Reporting $R^2$ when the question asks for adjusted $R^2$ (NO_ADJUSTMENT).
- Counting only the regressors in $k$ and leaving out the intercept (DF_NO_INTERCEPT).
- Using $(n - k)/(n - 1)$ instead of $(n - 1)/(n - k)$ in adjusted $R^2$ (DF_RATIO_INVERTED).
- Putting in a dummy for every group together with the intercept; the dummies add up to the column of ones and $X^\top X$ has no inverse (DUMMY_TRAP).
- Choosing the model with the highest $R^2$; $R^2$ never falls when a variable is added, however useless (R2_NEVER_FALLS).
- Writing $XX^\top$, an $n \times n$ matrix, instead of the $k \times k$ matrix $X^\top X$ (WRONG_PRODUCT_ORDER).
- Reading a multiple-regression coefficient as the total effect of $x_j$: it is the effect with the other regressors held constant, and it changes when regressors are added or dropped.

## Practice
- `xtx-entry-from-data` (difficulty 1): one entry of $X^\top X$ or $X^\top y$, such as $(X^\top X)_{23} = \sum x_{i1}x_{i2}$ or $(X^\top y)_2 = \sum x_{i1}y_i$, from a table of 4 or 5 observations (wages, demand or workshop output) with an intercept column in $X$; distractors PRODUCT_OF_SUMS, NO_INTERCEPT_COLUMN, USED_DEVIATIONS.
- `adjusted-r-squared` (difficulty 2): adjusted $R^2$ to 3 decimal places from SSR, SST, the number of observations and the number of regressors (wage, demand, growth or house-price equations); distractors NO_ADJUSTMENT, DF_NO_INTERCEPT, DF_RATIO_INVERTED.
- `ols-coefficient-two-regressors` (difficulty 3): one OLS slope $b_1$ or $b_2$ from the centred normal equations $\tilde X^\top \tilde X\, b = \tilde X^\top \tilde y$ with two regressors, via the $2 \times 2$ inverse; distractors OMITTED_REGRESSOR, NO_INVERSE, NO_SIGN_CHANGE, NO_DIAGONAL_SWAP.

## Real world
- Returns to education: labour economists regress (log) wages on schooling, experience and other worker characteristics. Holding experience constant matters because, at a given age, people who studied longer have worked fewer years; leaving experience out biases the education coefficient, as in Example 3.
- Demand estimation: firms and competition authorities regress sales on a product's own price, rivals' prices and household income together, so that the price coefficient is not contaminated by income growth that happened at the same time as price rises.
- Hedonic pricing: statistics offices adjust price indices for quality by regressing the prices of houses, cars or computers on their characteristics; each coefficient is the implicit price of one characteristic, such as a square metre of floor space with location held fixed.
- Applied research: almost every empirical economics paper reports a multiple regression table. Statistical software computes each column with $b = (X^\top X)^{-1}X^\top y$ (in practice through a numerically stable decomposition rather than an explicit inverse) and stops with an error or drops a variable when $X$ is not of full column rank, as with the dummy variable trap.

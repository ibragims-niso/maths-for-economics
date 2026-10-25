---
id: ST201
title: Joint distributions, covariance and correlation
block: ST2
coreYear: 2
prerequisites: [ST103]
estMinutes: 45
status: draft
economicUses:
  - Risk of a portfolio of two shares or funds, and the gain from diversification
  - How household spending moves with income
  - Whether two markets or two economies tend to boom and slump together
  - Correlated loan defaults and insurance claims in risk management
searchTerms:
  - "Covariance"
  - "Correlation"
generators: [joint-table-conditional-probability, joint-table-covariance, two-asset-portfolio-risk]
widgets: [two-asset-portfolio]
mistakeCodes:
  JOINT_FOR_CONDITIONAL:
    label: Gave the joint probability, not the conditional one
    explanation: The cell p(x, y) is the chance of both events out of everyone. A conditional probability looks only at the cases where the condition holds, so divide the cell by the total of the condition's row or column.
  WRONG_MARGINAL:
    label: Divided by the wrong total
    explanation: For P(Y = y | X = x) divide by P(X = x), the total of the condition's row. Dividing by the column total P(Y = y) gives P(X = x | Y = y), a different question.
  IGNORED_CONDITION:
    label: Ignored the condition
    explanation: P(Y = y), the column total, is the probability over all cases. The question restricts attention to the cases where the condition holds; divide the joint probability by the condition's total.
  NO_PRODUCT_OF_MEANS:
    label: Forgot to subtract E[X]E[Y]
    explanation: E[XY] alone is not the covariance. Subtract the product of the means, Cov(X, Y) = E[XY] − E[X]E[Y]; only when one of the means is 0 are the two equal.
  SIMPLE_MEANS:
    label: Used simple averages of the values as the means
    explanation: E[X] and E[Y] must be weighted by the row and column totals of the table. Averaging the listed values treats them as equally likely.
  REVERSED_ORDER:
    label: Subtracted the wrong way round
    explanation: The shortcut is E[XY] − E[X]E[Y], not E[X]E[Y] − E[XY]. Reversing it flips the sign, and the sign is the most important part of a covariance.
  NO_COVARIANCE_TERM:
    label: Left out the covariance term
    explanation: The returns of the two assets are linked, so σ_p² = w²σ₁² + (1 − w)²σ₂² + 2w(1 − w)Cov. Dropping the last term is only right when the correlation is 0.
  WEIGHTED_SD_AVERAGE:
    label: Took the weighted average of the standard deviations
    explanation: wσ₁ + (1 − w)σ₂ is the portfolio SD only when ρ = 1. With ρ < 1 the ups of one asset partly cancel the downs of the other, so the true SD is smaller. Work through the variance formula instead.
  WEIGHTS_NOT_SQUARED:
    label: Did not square the weights
    explanation: Var(aX) = a²Var(X), so each variance is multiplied by its weight squared, w² and (1 − w)², not by w and 1 − w.
  ONE_COVARIANCE_TERM:
    label: Forgot the 2 in front of the covariance term
    explanation: The pair (asset 1, asset 2) appears twice when you expand (wX + (1 − w)Y)², once as X·Y and once as Y·X. The term is 2w(1 − w)Cov.
  NO_SQUARE_ROOT:
    label: Gave the variance instead of the standard deviation
    explanation: The formula gives the portfolio variance in squared percentage points. Take its square root to get the standard deviation in per cent.
  RHO_AS_COV:
    label: Used the correlation in place of the covariance
    explanation: The variance formula needs Cov = ρσ₁σ₂, which has the same squared units as the variances. Putting ρ, a number between −1 and 1, in its place almost removes the covariance term.
  ONE_CELL_CHECK:
    label: Checked independence in one cell only
    explanation: X and Y are independent only if p(x, y) = P(X = x)·P(Y = y) in every cell of the table. One cell that fits proves nothing; one cell that fails is enough to show dependence.
  ZERO_COVARIANCE_INDEPENDENT:
    label: Took zero covariance to mean independence
    explanation: Independence implies Cov = 0, but not the other way round. Covariance only measures straight-line co-movement; variables linked in a curved way, such as X and X², can have zero covariance and still depend on each other.
resources:
  - { title: "Principles of Finance, 15.2 Risk and Return to Multiple Assets (OpenStax)", url: "https://openstax.org/books/principles-finance/pages/15-2-risk-and-return-to-multiple-assets", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "MIT 18.05 Introduction to Probability and Statistics, Reading 7a: Joint Distributions, Independence (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-05-introduction-to-probability-and-statistics-spring-2014/resources/mit18_05s14_reading7a/", kind: course, verifiedAt: 2026-10-18 }
  - { title: "MIT 18.05 Introduction to Probability and Statistics, Reading 7b: Covariance and Correlation (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-05-introduction-to-probability-and-statistics-spring-2014/resources/mit18_05s14_reading7b/", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
Economic variables rarely move alone. Household spending rises with income, airline shares tend to fall when oil prices rise, and in a recession many borrowers stop repaying their loans at the same time. To study two uncertain quantities together you need their **joint distribution**, and to measure how strongly they move together you need **covariance** and **correlation**. These are the tools behind the best-known idea in finance: by mixing assets that do not move in perfect step, an investor can reduce risk without giving up all of the return. Covariance is also the building block of regression (ST205), the main way economists estimate relationships from data.

## Intuition
ST103 described one uncertain number at a time. Now take two: say the monthly returns of two shares. A **joint probability table** lists every pair of outcomes with its probability, for example "share A falls and share B rises: 0.15". Adding along a row or down a column gives back the distribution of each share on its own, the **marginal** distribution. Looking inside one row only gives the **conditional** distribution: how B behaves in the months when A falls.

If knowing A's outcome tells you nothing about B's, the two are **independent**. Usually it does tell you something. **Covariance** measures the direction of the link: it is positive when the two tend to be above their averages at the same time (and below at the same time), negative when one tends to be high while the other is low. Its size depends on units, so economists also use **correlation**, a rescaled covariance that always lies between −1 and 1.

The payoff is diversification. If two shares each have an SD of 20 % and you split your money between them, the portfolio's risk is 20 % only if they move in perfect step (correlation 1). Any correlation below 1 means the bad months of one are partly offset by the other, and the portfolio is less risky than the average of its parts.

## Definition and formulas
**Joint distribution.** For two discrete random variables $X$ and $Y$, the joint probability mass function is
$$p(x, y) = P(X = x \text{ and } Y = y), \qquad p(x, y) \ge 0, \qquad \sum_x \sum_y p(x, y) = 1$$
It is usually shown as a table with one row for each value of $X$ and one column for each value of $Y$.

**Marginal distributions** are the row and column totals:
$$p_X(x) = \sum_y p(x, y), \qquad p_Y(y) = \sum_x p(x, y)$$

**Conditional distribution** of $Y$ given $X = x$ (the probabilities inside one row, rescaled to add up to 1), as in ST102:
$$P(Y = y \mid X = x) = \frac{p(x, y)}{p_X(x)}, \qquad p_X(x) > 0$$
Its mean is the **conditional expectation** $E[Y \mid X = x] = \sum_y y\,P(Y = y \mid X = x)$.

**Independence.** $X$ and $Y$ are independent when every cell equals the product of its row and column totals:
$$p(x, y) = p_X(x)\,p_Y(y) \quad \text{for all } x \text{ and } y$$
Then every conditional distribution equals the marginal one.

**Expectations of two variables.** For any function $g$, $E[g(X, Y)] = \sum_x \sum_y g(x, y)\,p(x, y)$. In particular $E[X + Y] = E[X] + E[Y]$ always, and $E[XY] = E[X]\,E[Y]$ when $X$ and $Y$ are independent.

**Covariance**, with $\mu_X = E[X]$ and $\mu_Y = E[Y]$:
$$\operatorname{Cov}(X, Y) = E\big[(X - \mu_X)(Y - \mu_Y)\big] = E[XY] - E[X]\,E[Y]$$
Useful facts: $\operatorname{Cov}(X, X) = \operatorname{Var}(X)$, $\operatorname{Cov}(X, Y) = \operatorname{Cov}(Y, X)$ and $\operatorname{Cov}(aX + b,\, cY + d) = ac\operatorname{Cov}(X, Y)$: constants added do not matter, scale factors do.

**Correlation** removes the units:
$$\rho = \operatorname{Corr}(X, Y) = \frac{\operatorname{Cov}(X, Y)}{\sigma_X\,\sigma_Y}, \qquad -1 \le \rho \le 1$$
$\rho = 1$ or $\rho = -1$ exactly when $Y = a + bX$ for constants $a$ and $b \ne 0$ (an exact straight-line relation, rising or falling); $\rho$ near 0 means no straight-line tendency. Changing units, for example from per cent to decimals, does not change $\rho$.

**Independence gives zero covariance, but not the other way round.** If $X$ and $Y$ are independent, $E[XY] = E[X]E[Y]$, so $\operatorname{Cov}(X, Y) = 0$. The reverse fails. Let $X$ be tomorrow's change in a share price, $-1$, $0$ or $1$ with probabilities $0.25$, $0.5$ and $0.25$, and let $Y = X^2$ measure the size of the move. Then $E[X] = 0$ and $E[XY] = E[X^3] = (-1)(0.25) + 0 + (1)(0.25) = 0$, so $\operatorname{Cov}(X, Y) = 0$. Yet $Y$ depends completely on $X$: $P(Y = 0 \mid X = 0) = 1$, while $P(Y = 0) = 0.5$. Covariance only detects straight-line co-movement.

**Variance of a sum.** Expanding the square in the definition of variance gives
$$\operatorname{Var}(X + Y) = \operatorname{Var}(X) + \operatorname{Var}(Y) + 2\operatorname{Cov}(X, Y)$$
$$\operatorname{Var}(aX + bY) = a^2\operatorname{Var}(X) + b^2\operatorname{Var}(Y) + 2ab\operatorname{Cov}(X, Y)$$
For independent variables the covariance term vanishes and variances simply add.

**Two-asset portfolio.** Put a fraction $w$ of your money in asset 1 (return $R_1$, mean $\mu_1$, SD $\sigma_1$) and $1 - w$ in asset 2 ($R_2$, $\mu_2$, $\sigma_2$), with correlation $\rho$. The portfolio return $R_p = wR_1 + (1 - w)R_2$ has
$$E[R_p] = w\mu_1 + (1 - w)\mu_2, \qquad \sigma_p^2 = w^2\sigma_1^2 + (1 - w)^2\sigma_2^2 + 2w(1 - w)\,\rho\,\sigma_1\sigma_2$$
The mean is the weighted average of the means, but the risk is not the weighted average of the risks. Since $\big(w\sigma_1 + (1 - w)\sigma_2\big)^2$ is the same expression with $\rho$ replaced by 1, and $\rho \le 1$,
$$\sigma_p \le w\sigma_1 + (1 - w)\sigma_2 \qquad (0 \le w \le 1)$$
with equality only when $\rho = 1$. The gap is the **diversification gain**; it grows as $\rho$ falls, and with $\rho = -1$ a suitable mix removes all risk.

**Continuous variables.** Two continuous variables have a joint density $f(x, y)$ (MV13): probabilities are double integrals of $f$ over regions, marginal densities come from integrating out the other variable, $f_X(x) = \int f(x, y)\,dy$, and $E[XY] = \iint xy\,f(x, y)\,dx\,dy$. The covariance, correlation and variance formulas above hold unchanged.

## Interactive
::widget{id="two-asset-portfolio"}

You split your savings between a share fund (average return 10 %, SD 20 %) and a bond fund (average return 4 %, SD 10 %). Move **Weight in the share fund w** to change the mix and **Correlation ρ** to change how the two funds move together. The solid curve is the portfolio SD for every mix at the chosen ρ; the dashed line is the weighted average of the two SDs; the filled dot is your mix, and the green bar up to the hollow dot is the diversification gain. Check: at the start (w = 0.6, ρ = −0.2) the panel shows a portfolio mean of 7.6 %, a portfolio SD of 11.87 % and a weighted average of SDs of 16 %, as in Example 3. Now set ρ to 1: the curve lies on the dashed line and the gain disappears. Set ρ to −1 and w to 0.35: the portfolio SD drops to 0.5 %, almost no risk at all.

## Worked examples

### Example 1 (easy): income and spending on eating out
A survey of households records monthly income $X$ (in thousands: 2 or 4) and monthly spending on eating out $Y$ (in hundreds: 1, 2 or 3). The joint distribution is
$$\begin{array}{c|ccc} & Y = 1 & Y = 2 & Y = 3 \\ \hline X = 2 & 0.25 & 0.15 & 0.10 \\ X = 4 & 0.10 & 0.15 & 0.25 \end{array}$$
Find the marginal distributions, the probability that a high-income household spends 300 a month, the conditional mean spending of each income group, and decide whether income and spending are independent.

1. $P(X = 2) = 0.25 + 0.15 + 0.10 = 0.5,\quad P(X = 4) = 0.5;\quad P(Y = 1) = 0.35,\ P(Y = 2) = 0.30,\ P(Y = 3) = 0.35$
   *Why:* each income level occurs together with every spending level, so its probability is its row total; column totals give the spending distribution. Both add up to 1.
2. $P(Y = 3 \mid X = 4) = \dfrac{0.25}{0.5} = 0.5$, compared with $P(Y = 3) = 0.35$
   *Why:* knowing the household earns 4000 restricts attention to the second row; dividing by its total rescales that row to add up to 1.
3. Given $X = 2$: $0.5,\ 0.3,\ 0.2$, so $E[Y \mid X = 2] = 1(0.5) + 2(0.3) + 3(0.2) = 1.7$. Given $X = 4$: $0.2,\ 0.3,\ 0.5$, so $E[Y \mid X = 4] = 2.3$
   *Why:* each conditional distribution is a row divided by its total. Low-income households spend 170 a month on average, high-income ones 230.
4. Middle cell: $0.15 = 0.5 \times 0.30$, but top-left cell: $0.25 \ne 0.5 \times 0.35 = 0.175$, so $X$ and $Y$ are **not** independent
   *Why:* independence needs $p(x, y) = p_X(x)\,p_Y(y)$ in every cell. One matching cell is not enough; one failing cell settles it.
5. $P(X = 4 \mid Y = 3) = \dfrac{0.25}{0.35} = 0.714$
   *Why:* reversing the condition divides by the column total instead. Half of high-income households are big spenders, but 71.4 % of big spenders are high-income households: the two conditional probabilities answer different questions.

```verify
P = [0.25, 0.15, 0.10; 0.10, 0.15, 0.25]
pX2 = P[1,1] + P[1,2] + P[1,3]; pX4 = P[2,1] + P[2,2] + P[2,3]
pY1 = P[1,1] + P[2,1]; pY2 = P[1,2] + P[2,2]; pY3 = P[1,3] + P[2,3]
assert abs(pX2 - 0.5) < 1e-12 and abs(pX4 - 0.5) < 1e-12
assert abs(pY1 - 0.35) < 1e-12 and abs(pY2 - 0.30) < 1e-12 and abs(pY3 - 0.35) < 1e-12
assert abs(pX2 + pX4 - 1) < 1e-12 and abs(pY1 + pY2 + pY3 - 1) < 1e-12
assert abs(P[2,3]/pX4 - 0.5) < 1e-12
c2 = [P[1,1], P[1,2], P[1,3]] / pX2
c4 = [P[2,1], P[2,2], P[2,3]] / pX4
assert abs(c2[1] - 0.5) < 1e-12 and abs(c2[2] - 0.3) < 1e-12 and abs(c2[3] - 0.2) < 1e-12
assert abs(c4[1] - 0.2) < 1e-12 and abs(c4[2] - 0.3) < 1e-12 and abs(c4[3] - 0.5) < 1e-12
assert abs(sum(c2 .* [1, 2, 3]) - 1.7) < 1e-12
assert abs(sum(c4 .* [1, 2, 3]) - 2.3) < 1e-12
assert abs(P[1,2] - pX2*pY2) < 1e-12
assert abs(pX2*pY1 - 0.175) < 1e-12 and abs(P[1,1] - pX2*pY1) > 0.05
assert abs(P[2,3]/pY3 - 0.714) < 0.0005
```

### Example 2 (medium): covariance and correlation of two shares
The monthly returns (in %) of two shares, $X$ for share A and $Y$ for share B, have the joint distribution
$$\begin{array}{c|cc} & Y = -5 & Y = 15 \\ \hline X = -10 & 0.35 & 0.15 \\ X = 20 & 0.15 & 0.35 \end{array}$$
Find $\operatorname{Cov}(X, Y)$, the correlation, and the variance of $X + Y$, the return on holding one unit of each share.

1. $P(X = -10) = P(X = 20) = 0.5$, so $E[X] = (-10)(0.5) + 20(0.5) = 5$; likewise $P(Y = -5) = P(Y = 15) = 0.5$ and $E[Y] = 5$
   *Why:* the means come from the marginal distributions, the row and column totals.
2. $E[XY] = (-10)(-5)(0.35) + (-10)(15)(0.15) + (20)(-5)(0.15) + (20)(15)(0.35) = 17.5 - 22.5 - 15 + 105 = 85$
   *Why:* $XY$ depends on both returns, so every cell contributes its product $xy$ times its joint probability.
3. $\operatorname{Cov}(X, Y) = 85 - 5 \times 5 = 60$
   *Why:* $E[XY] - E[X]E[Y]$. The covariance is positive because the large probabilities sit on the diagonal: the shares tend to rise together and fall together.
4. $\operatorname{Var}(X) = 100(0.5) + 400(0.5) - 5^2 = 225$, $\ \operatorname{Var}(Y) = 25(0.5) + 225(0.5) - 5^2 = 100$, so $\sigma_X = 15$, $\sigma_Y = 10$ and $\rho = \dfrac{60}{15 \times 10} = 0.4$
   *Why:* dividing by both standard deviations removes the units (squared percentage points), leaving a number between −1 and 1. A correlation of 0.4 is a moderate positive link.
5. $\operatorname{Var}(X + Y) = 225 + 100 + 2(60) = 445$
   *Why:* the variances add, plus twice the covariance. Directly: $X + Y$ is $-15, 5, 15, 35$ with probabilities $0.35, 0.15, 0.15, 0.35$, with mean 10 and $E[(X + Y)^2] = 545$, so the variance is $545 - 100 = 445$. If the shares were independent (0.25 in every cell) the variance would be only $325$.

```verify
x = [-10, 20]; y = [-5, 15]
P = [0.35, 0.15; 0.15, 0.35]
px = [P[1,1] + P[1,2], P[2,1] + P[2,2]]; py = [P[1,1] + P[2,1], P[1,2] + P[2,2]]
EX = sum(x .* px); EY = sum(y .* py)
assert abs(EX - 5) < 1e-12 and abs(EY - 5) < 1e-12
EXY = x[1]*y[1]*P[1,1] + x[1]*y[2]*P[1,2] + x[2]*y[1]*P[2,1] + x[2]*y[2]*P[2,2]
assert abs(x[1]*y[1]*P[1,1] - 17.5) < 1e-9 and abs(x[1]*y[2]*P[1,2] + 22.5) < 1e-9
assert abs(x[2]*y[1]*P[2,1] + 15) < 1e-9 and abs(x[2]*y[2]*P[2,2] - 105) < 1e-9
assert abs(EXY - 85) < 1e-9
C = EXY - EX*EY
assert abs(C - 60) < 1e-9
VX = sum((x .^ 2) .* px) - EX^2; VY = sum((y .^ 2) .* py) - EY^2
assert abs(VX - 225) < 1e-9 and abs(VY - 100) < 1e-9
assert abs(sqrt(VX) - 15) < 1e-9 and abs(sqrt(VY) - 10) < 1e-9
assert abs(C/(sqrt(VX)*sqrt(VY)) - 0.4) < 1e-12
assert abs(VX + VY + 2*C - 445) < 1e-9
s = [x[1] + y[1], x[1] + y[2], x[2] + y[1], x[2] + y[2]]; q = [P[1,1], P[1,2], P[2,1], P[2,2]]
assert deepEqual(s, [-15, 5, 15, 35])
ES = sum(s .* q); ES2 = sum((s .^ 2) .* q)
assert abs(ES - 10) < 1e-9 and abs(ES2 - 545) < 1e-9
assert abs(ES2 - ES^2 - 445) < 1e-9
assert abs(VX + VY - 325) < 1e-9
```

### Example 3 (hard): diversifying between a share fund and a bond fund
A share fund has an expected annual return of 10 % with SD $\sigma_1 = 20\%$; a bond fund has an expected return of 4 % with SD $\sigma_2 = 10\%$. Their returns have correlation $\rho = -0.2$. An investor puts $w = 0.6$ of her savings in the share fund and the rest in the bond fund. Find the expected return and the standard deviation of her portfolio, and compare its risk with the weighted average of the two SDs.

1. $E[R_p] = 0.6 \times 10 + 0.4 \times 4 = 7.6\%$
   *Why:* expectation is linear, so the portfolio's mean is the weighted average of the means.
2. $\operatorname{Cov}(R_1, R_2) = \rho\,\sigma_1\sigma_2 = -0.2 \times 20 \times 10 = -40$
   *Why:* the variance formula needs the covariance, and $\rho = \operatorname{Cov}/(\sigma_1\sigma_2)$ rearranges to this.
3. $\sigma_p^2 = 0.6^2 \times 20^2 + 0.4^2 \times 10^2 + 2 \times 0.6 \times 0.4 \times (-40) = 144 + 16 - 19.2 = 140.8$
   *Why:* $\operatorname{Var}(aX + bY) = a^2\operatorname{Var}(X) + b^2\operatorname{Var}(Y) + 2ab\operatorname{Cov}(X, Y)$ with $a = 0.6$ and $b = 0.4$. The negative covariance lowers the risk.
4. $\sigma_p = \sqrt{140.8} = 11.87\%$
   *Why:* the square root brings the variance back to per cent.
5. Weighted average of the SDs: $0.6 \times 20 + 0.4 \times 10 = 16\%$, so diversification removes $16 - 11.87 = 4.13$ percentage points of risk. With $\rho = 0$ the SD would be $\sqrt{160} = 12.65\%$, and with $\rho = 1$ it would be the full 16 %.
   *Why:* only with $\rho = 1$ do the two funds move in perfect step; at any lower correlation the bad years of one are partly offset by the other. The investor keeps 7.6 % of expected return at much less risk than the share fund alone (SD 20 %).

```verify
w = 0.6; s1 = 20; s2 = 10; m1 = 10; m2 = 4; r = -0.2
assert abs(w*m1 + (1 - w)*m2 - 7.6) < 1e-12
C = r*s1*s2
assert abs(C + 40) < 1e-12
t1 = w^2*s1^2; t2 = (1 - w)^2*s2^2; t3 = 2*w*(1 - w)*C
assert abs(t1 - 144) < 1e-9 and abs(t2 - 16) < 1e-9 and abs(t3 + 19.2) < 1e-9
V = t1 + t2 + t3
assert abs(V - 140.8) < 1e-9
assert abs(sqrt(V) - 11.87) < 0.005
avg = w*s1 + (1 - w)*s2
assert abs(avg - 16) < 1e-12
assert abs(avg - sqrt(V) - 4.13) < 0.005
assert abs(sqrt(t1 + t2) - 12.65) < 0.005
assert abs(sqrt(t1 + t2 + 2*w*(1 - w)*s1*s2) - 16) < 1e-9
```

## Common mistakes
- Giving the joint probability $p(x, y)$ when a conditional probability is asked for (JOINT_FOR_CONDITIONAL).
- Dividing by the column total when the condition is on the row, which answers the reversed question (WRONG_MARGINAL).
- Ignoring the condition and giving the overall probability (IGNORED_CONDITION).
- Stopping at $E[XY]$ and forgetting to subtract $E[X]E[Y]$ (NO_PRODUCT_OF_MEANS).
- Using simple averages of the listed values instead of the probability-weighted means (SIMPLE_MEANS).
- Working out $E[X]E[Y] - E[XY]$, which flips the sign of the covariance (REVERSED_ORDER).
- Leaving the covariance term out of the portfolio variance (NO_COVARIANCE_TERM).
- Taking the weighted average of the standard deviations as the portfolio SD; this ignores diversification (WEIGHTED_SD_AVERAGE).
- Multiplying the variances by $w$ and $1 - w$ instead of $w^2$ and $(1 - w)^2$ (WEIGHTS_NOT_SQUARED).
- Writing $w(1 - w)\operatorname{Cov}$ instead of $2w(1 - w)\operatorname{Cov}$ (ONE_COVARIANCE_TERM).
- Giving the portfolio variance when the standard deviation was asked for (NO_SQUARE_ROOT).
- Putting the correlation $\rho$ into the variance formula where the covariance $\rho\sigma_1\sigma_2$ belongs (RHO_AS_COV).
- Declaring two variables independent because one cell of the table equals the product of its totals (ONE_CELL_CHECK).
- Concluding from a zero covariance that two variables are independent (ZERO_COVARIANCE_INDEPENDENT).
- Reading correlation as causation: two series can move together because a third factor, such as the business cycle, drives both.

## Practice
- `joint-table-conditional-probability` (difficulty 1): a conditional probability $P(Y = y \mid X = x)$ or $P(X = x \mid Y = y)$ from a 2×2 or 2×3 joint table of share returns or of income and spending; distractors JOINT_FOR_CONDITIONAL, WRONG_MARGINAL, IGNORED_CONDITION.
- `joint-table-covariance` (difficulty 2): $\operatorname{Cov}(X, Y) = E[XY] - E[X]E[Y]$ from a 2×2 or 2×3 joint table; distractors NO_PRODUCT_OF_MEANS, SIMPLE_MEANS, REVERSED_ORDER.
- `two-asset-portfolio-risk` (difficulty 3): variance or standard deviation of a portfolio with weights $w$ and $1 - w$, given $\sigma_1$, $\sigma_2$ and $\rho$; distractors NO_COVARIANCE_TERM, WEIGHTED_SD_AVERAGE, WEIGHTS_NOT_SQUARED, ONE_COVARIANCE_TERM, NO_SQUARE_ROOT.

## Real world
- Investing: pension funds and personal investors spread money across shares, bonds, property and countries because their returns are imperfectly correlated. Modern portfolio theory chooses weights using the means, variances and covariances of all the assets, the many-asset version of the two-asset formula here.
- Banking: the risk of a loan book depends on how loan defaults are correlated. In a recession many borrowers default at once; before the 2007–2008 financial crisis, models that assumed weakly correlated mortgage defaults badly understated the risk of mortgage-backed securities.
- Macroeconomics: economists describe the business cycle by correlations, for example of consumption, investment and employment with GDP. Variables that rise in booms (positive correlation with GDP) are called procyclical; unemployment, which moves against output, is countercyclical.
- Insurance: pooling many policies reduces risk only when claims are not strongly correlated. A flood or storm that damages thousands of homes at once creates highly correlated claims, which is why insurers buy reinsurance against such events.

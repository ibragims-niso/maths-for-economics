---
id: NM02
title: "Numerical optimisation: gradient methods"
block: NM
coreYear: 4
prerequisites: [MV07]
estMinutes: 50
status: draft
economicUses:
  - Estimating models by least squares or maximum likelihood when no formula gives the estimates
  - Finding a firm's best mix of inputs step by step
  - Fitting discrete choice models such as logit to survey and market data
  - Solving and calibrating large economic models on a computer
generators: [gradient-ascent-step-two-inputs, newton-step-profit-cubic-cost, gradient-descent-largest-stable-step]
widgets: [gradient-descent-path]
mistakeCodes:
  DESCENT_FOR_MAX:
    label: Stepped downhill when maximising
    explanation: To maximise, move with the gradient, x + α∇f; to minimise, move against it, x − α∇f. Subtracting the gradient of a profit function walks away from the top.
  NO_STEP_SIZE:
    label: Left out the step size
    explanation: The new point is x + α∇f, not x + ∇f. The gradient gives the direction and how steep the slope is; the step size α decides how far to go.
  STEP_NOT_POINT:
    label: Gave the step, not the new point
    explanation: α∇f (or −f′/f″ in Newton's method) is the change in x. Add it to the starting point to get the new point.
  IGNORED_CROSS_TERM:
    label: Ignored the cross term
    explanation: A term like eLK links the two variables. It adds e times the other variable to each partial derivative and puts e off the diagonal of the Hessian. Leaving it out gives the wrong gradient and the wrong curvatures.
  NEWTON_SIGN:
    label: Wrong sign in the Newton step
    explanation: The Newton step is x₁ = x₀ − f′(x₀)/f″(x₀). Near a maximum f″ is negative, so the step has the same sign as f′ and moves uphill. Using the size of f″ without its sign sends the step the wrong way.
  RATIO_INVERTED:
    label: Turned the Newton ratio upside down
    explanation: Newton's step divides the slope by the curvature, f′/f″, not f″/f′. Check the units, since f′/f″ is measured in units of x, as a step in x must be.
  POWER_RULE_SLIP:
    label: Slip in the second derivative
    explanation: Differentiate each term with the power rule. The derivative of −3Cq² is −6Cq, so the cubic term −Cq³ gives −6Cq in π″, not −3Cq.
  USED_SMALLEST_CURVATURE:
    label: Used the smallest curvature for the limit
    explanation: Every direction must be stable, so the steepest direction, with the largest eigenvalue, sets the limit α < 2/λmax. The smallest eigenvalue only sets how slowly the method creeps along the flattest direction.
  BOUND_ONE_OVER:
    label: Used 1/λ as the stability limit
    explanation: Each step multiplies the distance to the optimum by 1 − αλ. It shrinks while |1 − αλ| < 1, which allows α up to 2/λ. At α = 1/λ the step lands exactly on the optimum in that direction; that is the best step, not the limit.
resources:
  - { title: "Calculus Volume 3, 4.6 Directional Derivatives and the Gradient (OpenStax)", url: "https://openstax.org/books/calculus-volume-3/pages/4-6-directional-derivatives-and-the-gradient", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Calculus Volume 1, 4.9 Newton's Method (OpenStax)", url: "https://openstax.org/books/calculus-volume-1/pages/4-9-newtons-method", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "MIT 18.065 Matrix Methods in Data Analysis, Lecture 22: Gradient Descent: Downhill to a Minimum (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-065-matrix-methods-in-data-analysis-signal-processing-and-machine-learning-spring-2018/resources/lecture-22-gradient-descent-downhill-to-a-minimum/", kind: video, verifiedAt: 2026-10-18 }
---

## Why economists need this
MV07 finds an optimum by setting every partial derivative to zero and solving the equations. That works when the equations are linear or simple. In applied economics they rarely are. A logit model of which brand a shopper buys, a Poisson model of how many patents a firm files, or a demand system with dozens of prices all lead to first-order conditions that no algebra can solve. Yet statistical software reports estimates for such models every day. It finds them the way a careful hiker finds a summit in fog: start somewhere, look at the slope, take a step, and repeat until the ground is flat. This topic explains the two main ways of doing that, gradient methods and Newton's method, how to choose the step, when to stop, and what can go wrong.

## Intuition
Stand on a hill in thick fog. You cannot see the top, but you can feel which way the ground rises under your feet. That direction is the **gradient** (MV02): it points straight uphill, and its length says how steep the slope is. **Gradient ascent** takes a step in that direction, looks again, and takes another. To find a minimum, such as the bottom of a valley of squared errors, you step the other way: **gradient descent**.

How far to step is the whole art. Tiny steps always make progress but may take thousands of them. Long steps can carry you over the summit to the far side, and if the hill is steep enough each step lands further from the top than the last, so the search **diverges**. On a hill shaped like an upside-down bowl there is an exact limit, set by how sharply the hill curves in its steepest direction.

**Newton's method** also feels how the slope is changing, the second derivative. It fits a parabola (a bowl in several variables) to the ground where you stand and jumps straight to that parabola's top. If the hill really is a parabola, one jump lands on the summit. Near the top of any smooth hill the parabola fits well, and the number of correct digits roughly doubles with each jump.

Both methods only look at the ground nearby. They find *a* flat spot, which may be a lower peak than the highest one, so it matters whether the function is concave (MV06).

## Definition and formulas
**Gradient methods.** To maximise $f(x)$, where $x$ is a point $(x_1, \dots, x_n)$, start from a guess $x_0$ and repeat
$$x_{k+1} = x_k + \alpha\,\nabla f(x_k) \quad \text{(gradient ascent)}.$$
To minimise, step the other way:
$$x_{k+1} = x_k - \alpha\,\nabla f(x_k) \quad \text{(gradient descent)}.$$
The number $\alpha > 0$ is the **step size** (in machine learning, the learning rate). A small enough step always improves $f$, because by the linear approximation (C111, MV03)
$$f(x_k + \alpha\nabla f(x_k)) \approx f(x_k) + \alpha\,\lVert\nabla f(x_k)\rVert^2,$$
and $\lVert\nabla f\rVert^2 = f_1^2 + \dots + f_n^2$ is positive unless the gradient is zero.

**The step size on a quadratic.** Take a one-variable bowl with its bottom at $x^*$ and curvature $\lambda = f'' > 0$, so $f'(x) = \lambda(x - x^*)$. One step of descent gives
$$x_{k+1} - x^* = (1 - \alpha\lambda)(x_k - x^*).$$
Every step multiplies the distance to the optimum by the same factor $1 - \alpha\lambda$:

- $0 < \alpha < 1/\lambda$: the factor is between 0 and 1, and the iterates creep towards $x^*$ from one side.
- $\alpha = 1/\lambda$: the factor is 0, and the first step lands exactly on $x^*$.
- $1/\lambda < \alpha < 2/\lambda$: the factor is between $-1$ and 0, so each step overshoots, but by less each time; the iterates zigzag in.
- $\alpha = 2/\lambda$: the factor is $-1$, and the iterates bounce between two points for ever.
- $\alpha > 2/\lambda$: the factor is below $-1$, and the iterates zigzag further and further out.

So descent converges exactly when $0 < \alpha < 2/\lambda$. With several variables, a quadratic has a constant Hessian $H$, and its eigenvalues $\lambda_1, \dots, \lambda_n$ (LA202) are the curvatures along its main directions. Each direction behaves like the one-variable case, so
$$\text{gradient descent converges from every start} \iff 0 < \alpha < \frac{2}{\lambda_{\max}}.$$
The steepest direction sets the limit; the flattest direction, $\lambda_{\min}$, sets the speed. When $\lambda_{\max}$ is much larger than $\lambda_{\min}$ the bowl is a long narrow valley and descent is slow. For a $2 \times 2$ Hessian with entries $h_{11}, h_{12} = h_{21}, h_{22}$, the eigenvalues are
$$\lambda = \frac{h_{11} + h_{22}}{2} \pm \sqrt{\left(\frac{h_{11} - h_{22}}{2}\right)^2 + h_{12}^2}.$$
For gradient ascent on a hill, use the eigenvalues of $-H$, the curvatures of the hill. Away from a quadratic the same limit applies near the optimum, with $H$ evaluated there.

**Stopping rules.** A computer stops when one of these holds, with tolerances chosen in advance:

- the gradient is small, $\lVert\nabla f(x_k)\rVert < \varepsilon$, so the ground is almost flat;
- the point barely moves, $\lVert x_{k+1} - x_k\rVert < \delta$, or the value of $f$ barely changes;
- a maximum number of steps is reached, in which case it reports that it did *not* converge.

A small change in $f$ alone can be misleading: along a flat valley floor $f$ changes slowly while the optimum is still far away. Checking the gradient as well is safer.

**Newton's method.** In one variable, replace $f'$ near $x_k$ by its tangent line and move to where that line is zero:
$$x_{k+1} = x_k - \frac{f'(x_k)}{f''(x_k)}.$$
This is Newton's root-finding method (see NM01) applied to the equation $f'(x) = 0$. In several variables,
$$x_{k+1} = x_k - H(x_k)^{-1}\,\nabla f(x_k),$$
where in practice the computer solves the linear system $H(x_k)\,d = -\nabla f(x_k)$ for the step $d$ rather than inverting $H$. Its main properties:

- On a quadratic, the Hessian is constant and the gradient is linear, so one Newton step lands exactly on the critical point, from any start. In one variable, a Newton step is a gradient step with the step size $\alpha = 1/\lvert f''\rvert$.
- Near a solution where $H$ is invertible, the error is roughly squared at each step (**quadratic convergence**): 0.01 becomes about 0.0001, then about 0.00000001.
- It needs second derivatives and a linear solve at every step, which is costly with thousands of parameters.
- It heads for any flat point, a minimum or a saddle as readily as a maximum. When maximising, check that $H$ is negative definite (MV07) and that $f$ actually rose; if not, take a shorter step in the same direction.

**Local and global.** Both methods stop at a critical point near where they started. If $f$ is concave (for a maximum) or convex (for a minimum) on its whole domain, that point is the global optimum (MV06). Otherwise, run the search from several starting points and keep the best result.

**Why estimation is done this way.** Least squares chooses parameters $\beta$ to minimise the sum of squared errors $S(\beta) = \sum_i (y_i - m(x_i; \beta))^2$ between data $y_i$ and a model $m$. When $m$ is linear in $\beta$, $S$ is a quadratic bowl and setting its gradient to zero gives a formula (EM01). When $m$ is not linear, for example a growth curve or a production function with an unknown elasticity of substitution, no formula exists. Maximum likelihood (EM05) chooses parameters to maximise the log-likelihood $\ell(\theta)$, and for logit, probit and Poisson models the condition $\nabla\ell = 0$ cannot be solved by algebra. Econometric software therefore runs Newton's method or a close relative (a quasi-Newton method such as BFGS, which builds up an estimate of $H$ from the gradients), printing the log-likelihood at "iteration 0, iteration 1, …" until it reports convergence. Machine-learning models with millions of parameters use cheap gradient descent steps instead.

## Interactive
::widget{id="gradient-descent-path"}

The picture is the least-squares fit of Example 2: the intercept $a$ runs across, the slope $b$ runs up, the rings join points with the same sum of squares, and the hollow point is the best fit $a = 16$, $b = 1.9$. The gold path is gradient descent from $(0, 0)$. Move **Steps taken k** to follow the path step by step and **Step size α** to change how far each step goes. The panel shows the current point, the sum of squares $S$ and the gradient of $S$. Check: with $\alpha = 0.04$ and $k = 2$ the panel shows the point $(10.24, 1.824)$, $S = 167.85$ and the gradient $(-57.6, -1.52)$. Set $\alpha = 0.05$: $b$ reaches 1.9 in the first step, because $0.05 = 1/20$ and 20 is the curvature in $b$. Raise $\alpha$ to 0.08 and the path zigzags across the best $b$ but still settles. At $\alpha = 0.1$ it bounces between $b = 0$ and $b = 3.8$, and at $\alpha = 0.11$ or $0.12$ the zigzags grow and $S$ rises: the step is past the limit $2/20 = 0.1$.

## Worked examples

### Example 1 (easy): two steps of gradient ascent for a firm's inputs
A firm's profit from $L$ hundred hours of labour and $K$ hundred machine-hours is $\pi = 60L + 60K - 2L^2 - 3K^2 - 2LK - 200$. Starting from $(L_0, K_0) = (5, 5)$, take two steps of gradient ascent with step size $\alpha = 0.1$, and compare the profit with the maximum.

1. $\pi_L = 60 - 4L - 2K$ and $\pi_K = 60 - 6K - 2L$
   *Why:* the gradient $(\pi_L, \pi_K)$ is the uphill direction; the cross term $-2LK$ puts $-2K$ into $\pi_L$ and $-2L$ into $\pi_K$.
2. At $(5, 5)$: $\nabla\pi = (60 - 20 - 10,\ 60 - 30 - 10) = (30, 20)$, so $(L_1, K_1) = (5, 5) + 0.1\,(30, 20) = (8, 7)$
   *Why:* both slopes are positive, so more of each input raises profit; the step moves 0.1 times the gradient.
3. At $(8, 7)$: $\nabla\pi = (60 - 32 - 14,\ 60 - 42 - 16) = (14, 2)$, so $(L_2, K_2) = (8, 7) + 0.1\,(14, 2) = (9.4, 7.2)$
   *Why:* the gradient is recomputed at the new point. It is shorter because the ground is flatter nearer the top.
4. $\pi(5, 5) = 225$, $\pi(8, 7) = 313$, $\pi(9.4, 7.2) = 328.4$; the maximum, at $(12, 6)$ where $\nabla\pi = (0, 0)$, is $340$
   *Why:* profit rises at every step. Capital overshoots its best value 6 for now: with only 8 units of labour the best $K$ is $(60 - 16)/6 \approx 7.33$. A third step, to $(10.2, 7)$, starts pulling it back.
5. $-H = \begin{bmatrix} 4 & 2 \\ 2 & 6 \end{bmatrix}$ has eigenvalues $5 \pm \sqrt{5} \approx 7.24$ and $2.76$, so the limit is $\alpha < 2/7.24 \approx 0.276$
   *Why:* $\alpha = 0.1$ is safely inside the limit. In the flattest direction each step keeps $1 - 0.1 \times 2.76 \approx 0.72$ of the remaining distance, so the climb is steady but not fast.

```verify
prof(L, K) = 60*L + 60*K - 2*L^2 - 3*K^2 - 2*L*K - 200
gL(L, K) = 60 - 4*L - 2*K
gK(L, K) = 60 - 6*K - 2*L
assert gL(5, 5) == 30 and gK(5, 5) == 20
L1 = 5 + 0.1*gL(5, 5)
K1 = 5 + 0.1*gK(5, 5)
assert abs(L1 - 8) < 1e-12 and abs(K1 - 7) < 1e-12
assert gL(8, 7) == 14 and gK(8, 7) == 2
L2 = L1 + 0.1*gL(L1, K1)
K2 = K1 + 0.1*gK(L1, K1)
assert abs(L2 - 9.4) < 1e-12 and abs(K2 - 7.2) < 1e-12
assert prof(5, 5) == 225
assert prof(8, 7) == 313
assert abs(prof(9.4, 7.2) - 328.4) < 1e-9
# the top: both partials zero at (12, 6)
assert gL(12, 6) == 0 and gK(12, 6) == 0
assert prof(12, 6) == 340
assert abs((60 - 2*8)/6 - 7.33) < 0.005
# third step
assert abs(L2 + 0.1*gL(L2, K2) - 10.2) < 1e-9 and abs(K2 + 0.1*gK(L2, K2) - 7) < 1e-9
# curvatures of the hill
lmax = 5 + sqrt(5)
lmin = 5 - sqrt(5)
assert abs(lmax + lmin - 10) < 1e-12 and abs(lmax*lmin - det([4, 2; 2, 6])) < 1e-9
assert abs(lmax - 7.24) < 0.005 and abs(lmin - 2.76) < 0.005
assert abs(2/lmax - 0.276) < 0.0005
assert abs(1 - 0.1*lmin - 0.72) < 0.005
```

### Example 2 (medium): step size and the stability limit in a least-squares fit
A firm's sales over five years were 12, 15, 15, 18 and 20 (millions of units). Measuring time from the middle year, $t = -2, -1, 0, 1, 2$, fit the trend $y = a + bt$ by least squares using gradient descent from $(a, b) = (0, 0)$. Compare the step sizes $\alpha = 0.04$ and $\alpha = 0.11$, find how many steps are needed before the gradient has length below 0.1, and compare with Newton's method.

1. $S(a, b) = \sum (y - a - bt)^2$, so $\dfrac{\partial S}{\partial a} = -2\sum(y - a - bt) = 10a - 160$ and $\dfrac{\partial S}{\partial b} = -2\sum t(y - a - bt) = 20b - 38$; the best fit is $a = 16$, $b = 1.9$, with $S = 1.9$
   *Why:* with $n = 5$, $\sum t = 0$, $\sum t^2 = 10$, $\sum y = 80$ and $\sum ty = 19$ the sums simplify. Measuring time from the middle year makes $\sum t = 0$, which separates $a$ from $b$.
2. $H = \begin{bmatrix} 10 & 0 \\ 0 & 20 \end{bmatrix}$, so the eigenvalues are 10 and 20 and descent converges only for $\alpha < 2/20 = 0.1$
   *Why:* a diagonal Hessian has its eigenvalues on the diagonal. The slope $b$ is the steep direction and sets the limit.
3. With $\alpha = 0.04$: $(a_1, b_1) = (0, 0) - 0.04\,(-160, -38) = (6.4, 1.52)$, then $(a_2, b_2) = (10.24, 1.824)$; $S$ falls from 1318 to 464.14 to 167.85
   *Why:* each step multiplies the distance to the best $a$ by $1 - 0.04 \times 10 = 0.6$ and to the best $b$ by $1 - 0.04 \times 20 = 0.2$: $16 - 10.24 = 16 \times 0.6^2$ and $1.9 - 1.824 = 1.9 \times 0.2^2$.
4. With $\alpha = 0.11$: $b$ goes $0 \to 4.18 \to -0.836 \to 5.1832$, and after the first step $S$ rises, from 66.68 to 76.88 to 109.70
   *Why:* the factor for $b$ is $1 - 0.11 \times 20 = -1.2$, so each step overshoots 1.9 by 1.2 times as much as the last. The step size is above the limit 0.1, and the search diverges even though $a$ is doing well.
5. With $\alpha = 0.04$ the gradient is $(-160 \times 0.6^k,\ -38 \times 0.2^k)$, which first has length below 0.1 at $k = 15$. A Newton step from $(0, 0)$ gives $(0, 0) - H^{-1}(-160, -38) = (16, 1.9)$ at once
   *Why:* with the stopping rule "gradient below 0.1", the slow, flat direction $a$ decides how long descent takes. Newton divides each slope by its own curvature, which for this quadratic $S$ is exactly the right step in every direction.

```verify
t = [-2, -1, 0, 1, 2]
y = [12, 15, 15, 18, 20]
assert sum(t) == 0 and sum(t .^ 2) == 10 and sum(y) == 80 and sum(t .* y) == 19
S(a, b) = sum((y - a - b*t) .^ 2)
ga(a, b) = 10*a - 160
gb(a, b) = 20*b - 38
# the formulas match the definition of S (central differences)
assert abs((S(3.001, 1) - S(2.999, 1))/0.002 - ga(3, 1)) < 1e-6
assert abs((S(3, 1.001) - S(3, 0.999))/0.002 - gb(3, 1)) < 1e-6
assert abs(S(16, 1.9) - 1.9) < 1e-9
assert S(0, 0) == 1318
assert 2/20 == 0.1
# alpha = 0.04
a1 = 0 - 0.04*ga(0, 0); b1 = 0 - 0.04*gb(0, 0)
assert abs(a1 - 6.4) < 1e-12 and abs(b1 - 1.52) < 1e-12
a2 = a1 - 0.04*ga(a1, b1); b2 = b1 - 0.04*gb(a1, b1)
assert abs(a2 - 10.24) < 1e-12 and abs(b2 - 1.824) < 1e-12
assert abs(S(a1, b1) - 464.14) < 0.005 and abs(S(a2, b2) - 167.85) < 0.005
assert abs(16 - a2 - 16*0.6^2) < 1e-12 and abs(1.9 - b2 - 1.9*0.2^2) < 1e-12
# alpha = 0.11
c1 = 0 - 0.11*ga(0, 0); d1 = 0 - 0.11*gb(0, 0)
c2 = c1 - 0.11*ga(c1, d1); d2 = d1 - 0.11*gb(c1, d1)
c3 = c2 - 0.11*ga(c2, d2); d3 = d2 - 0.11*gb(c2, d2)
assert abs(d1 - 4.18) < 1e-12 and abs(d2 + 0.836) < 1e-12 and abs(d3 - 5.1832) < 1e-12
assert abs(S(c1, d1) - 66.68) < 0.005 and abs(S(c2, d2) - 76.88) < 0.005 and abs(S(c3, d3) - 109.70) < 0.005
assert abs((d2 - 1.9)/(d1 - 1.9) + 1.2) < 1e-9
# stopping rule: first k with gradient length below 0.1
n(k) = sqrt((160*0.6^k)^2 + (38*0.2^k)^2)
assert n(14) > 0.1 and n(15) < 0.1
# Newton step
H = [10, 0; 0, 20]
x = [0; 0] - inv(H)*[-160; -38]
assert abs(x[1, 1] - 16) < 1e-12 and abs(x[2, 1] - 1.9) < 1e-12
```

### Example 3 (hard): a likelihood with no closed form
Six shoppers choose between two brands, A and B. For each shopper, $x$ is how much cheaper A was than B (price of B minus price of A), and $y = 1$ if they bought A: $(x, y) = (1, 1), (1, 0), (2, 1), (2, 1), (-1, 0), (-2, 1)$. A logit model says a shopper buys A with probability $p = \dfrac{e^{\theta x}}{1 + e^{\theta x}}$, so at equal prices each brand is equally likely. The log-likelihood (EM05) is $\ell(\theta) = \sum \left[y\,\theta x - \ln(1 + e^{\theta x})\right]$. Find the maximum likelihood estimate $\hat\theta$ with Newton's method from $\theta_0 = 0$.

1. $\ell'(\theta) = \sum x\,(y - p)$ and $\ell''(\theta) = -\sum x^2\,p\,(1 - p)$, where each $p$ depends on $\theta$
   *Why:* the derivative of $\ln(1 + e^{\theta x})$ is $x\,p$. Since $\ell'' < 0$ everywhere, $\ell$ is concave and its critical point is the global maximum; but $\ell'(\theta) = 0$ mixes several exponentials and cannot be solved by algebra.
2. At $\theta_0 = 0$ every $p = 0.5$: $\ell'(0) = 0.5 - 0.5 + 1 + 1 + 0.5 - 1 = 1.5$ and $\ell''(0) = -\tfrac14(1 + 1 + 4 + 4 + 1 + 4) = -3.75$, so $\theta_1 = 0 - \dfrac{1.5}{-3.75} = 0.4$
   *Why:* at $\theta = 0$ price has no effect and $p(1 - p) = \tfrac14$, so the first step needs no calculator.
3. At $\theta_1 = 0.4$: $\ell'(0.4) \approx 0.0641$ and $\ell''(0.4) \approx -3.2877$, so $\theta_2 \approx 0.4 + \dfrac{0.0641}{3.2877} \approx 0.4195$
   *Why:* the slope of $\ell$ is already small; the curvature has changed a little because the $p$'s have moved away from 0.5.
4. At $\theta_2$: $\ell'(\theta_2) \approx 0.0004$, and one more step gives $\theta_3 \approx 0.41962$, where $\ell' \approx 0.00000002$. Stop: $\hat\theta \approx 0.4196$, with $\ell(\hat\theta) \approx -3.8517$ against $\ell(0) \approx -4.1589$
   *Why:* the gradient is far below any sensible tolerance. The errors, about 0.42, 0.020, 0.00012 and 0.000000005, show the quadratic convergence of Newton's method.
5. Gradient ascent with $\alpha = 0.2$ from 0 needs 7 steps to reach $0.4194$, still less accurate than Newton's $\theta_2$. Since $e^{0.4196} \approx 1.52$, each unit by which A is cheaper multiplies the odds of buying A by about 1.52
   *Why:* gradient ascent uses only the slope, so it must be cautious and it slows down as the slope flattens; Newton also uses the curvature and takes a step of the right length.

```verify
p(th, x) = 1/(1 + exp(-th*x))
d1(th) = 1*(1 - p(th, 1)) + 1*(0 - p(th, 1)) + 2*(1 - p(th, 2)) + 2*(1 - p(th, 2)) + (-1)*(0 - p(th, -1)) + (-2)*(1 - p(th, -2))
w(th, x) = x^2*p(th, x)*(1 - p(th, x))
d2(th) = -(2*w(th, 1) + 2*w(th, 2) + w(th, -1) + w(th, -2))
ll(th) = th*(1 + 2 + 2 - 2) - 2*log(1 + exp(th)) - 2*log(1 + exp(2*th)) - log(1 + exp(-th)) - log(1 + exp(-2*th))
assert abs(d1(0) - 1.5) < 1e-12
assert abs(d2(0) + 3.75) < 1e-12
th1 = 0 - d1(0)/d2(0)
assert abs(th1 - 0.4) < 1e-12
assert abs(d1(th1) - 0.0641) < 0.00005
assert abs(d2(th1) + 3.2877) < 0.00005
th2 = th1 - d1(th1)/d2(th1)
assert abs(th2 - 0.4195) < 0.00005
assert abs(d1(th2) - 0.0004) < 0.00005
th3 = th2 - d1(th2)/d2(th2)
assert abs(th3 - 0.41962) < 0.000005
assert abs(d1(th3) - 0.00000002) < 0.000000005
th4 = th3 - d1(th3)/d2(th3)
# errors shrink quadratically
assert abs(0 - th4 + 0.42) < 0.005 and abs(th1 - th4 + 0.020) < 0.0005
assert abs(th2 - th4 + 0.00012) < 0.000005
assert abs(th3 - th4) < 0.00000001
assert abs(ll(th4) + 3.8517) < 0.00005
assert abs(ll(0) + 4.1589) < 0.00005 and abs(ll(0) + 6*log(2)) < 1e-12
# a numerical derivative of ll agrees with d1
assert abs((ll(0.3001) - ll(0.2999))/0.0002 - d1(0.3)) < 1e-6
# gradient ascent with alpha = 0.2
g1 = 0 + 0.2*d1(0); g2 = g1 + 0.2*d1(g1); g3 = g2 + 0.2*d1(g2); g4 = g3 + 0.2*d1(g3)
g5 = g4 + 0.2*d1(g4); g6 = g5 + 0.2*d1(g5); g7 = g6 + 0.2*d1(g6)
assert abs(g7 - 0.4194) < 0.00005
assert abs(g7 - th4) > abs(th2 - th4)
assert abs(exp(th4) - 1.52) < 0.005
```

## Common mistakes
- Subtracting the gradient when maximising profit, which walks downhill (DESCENT_FOR_MAX).
- Adding the whole gradient to the point and forgetting to multiply by $\alpha$ (NO_STEP_SIZE).
- Reporting the step $\alpha\nabla f$ or $-f'/f''$ instead of the new point (STEP_NOT_POINT).
- Leaving the cross term out of a partial derivative or out of the Hessian (IGNORED_CROSS_TERM).
- Dividing by $\lvert f''\rvert$ instead of $f''$ in a Newton step, so the step points the wrong way (NEWTON_SIGN).
- Writing the Newton step as $x_0 - f''/f'$ (RATIO_INVERTED).
- Differentiating $-Cq^3$ twice and getting $-3Cq$ instead of $-6Cq$ (POWER_RULE_SLIP).
- Taking the stability limit from the smallest eigenvalue of the Hessian instead of the largest (USED_SMALLEST_CURVATURE).
- Giving $1/\lambda_{\max}$, the step that lands exactly on the optimum in the steepest direction, as the limit $2/\lambda_{\max}$ (BOUND_ONE_OVER).
- Thinking a bigger step size is always faster: past $2/\lambda_{\max}$ the search diverges, as in Example 2.
- Stopping because $f$ hardly changed while the gradient is still large along a flat valley.
- Treating the point a search stops at as the global optimum without checking concavity (see MV06) or trying other starting points.

## Practice
- `gradient-ascent-step-two-inputs` (difficulty 1): one step of gradient ascent for a firm's profit in labour and capital, giving one coordinate of the new point to 2 decimal places; distractors DESCENT_FOR_MAX, NO_STEP_SIZE, STEP_NOT_POINT, IGNORED_CROSS_TERM.
- `newton-step-profit-cubic-cost` (difficulty 2): one Newton step towards the profit-maximising output when cost has a cubic term, to 2 decimal places; distractors NEWTON_SIGN, STEP_NOT_POINT, RATIO_INVERTED, POWER_RULE_SLIP.
- `gradient-descent-largest-stable-step` (difficulty 3): the largest stable step size $2/\lambda_{\max}$ of gradient descent on a two-parameter quadratic loss with a cross term, to 4 decimal places; distractors USED_SMALLEST_CURVATURE, BOUND_ONE_OVER, IGNORED_CROSS_TERM.

## Real world
- Econometrics packages estimate logit, probit, Poisson and other maximum likelihood models by Newton-type iterations, and print the log-likelihood at each iteration until the gradient is close to zero.
- Central banks and researchers estimate large macroeconomic models by maximising a likelihood over dozens of parameters, often starting the search from several points because the likelihood can have more than one peak.
- Firms set prices with demand models fitted by numerical optimisation, for example airlines and retailers fitting discrete choice models to booking and sales data.
- Machine-learning models used in finance and economics, from credit scoring to forecasting, are trained by gradient descent, where choosing the learning rate is exactly the step-size problem of this topic.

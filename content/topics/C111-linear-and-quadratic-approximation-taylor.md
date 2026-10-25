---
id: C111
title: Linear and quadratic approximation (Taylor)
block: C1
coreYear: 1
prerequisites: [C108]
estMinutes: 45
status: draft
economicUses:
  - "Growth rates from log differences: ln(1 + r) ≈ r"
  - "Quick compound-growth estimates: (1 + r)ⁿ ≈ 1 + nr"
  - Effect of a small change in price, output or labour on revenue, cost or output
  - Bond price changes with duration and convexity
searchTerms:
  - "Differential of a function of one variable"
  - "Meaning of the differential"
  - "Invariance of the differential"
  - "Differential in approximate calculations"
  - "Higher-order derivatives and differentials"
  - "Taylor's formula"
  - "Maclaurin formula"
generators: [linear-approximation-estimate, compound-growth-quadratic-approximation, quadratic-approximation-estimate]
widgets: [taylor-log-approximation]
mistakeCodes:
  VALUE_ONLY:
    label: Gave only f(a)
    explanation: f(a) is where you start, not the estimate. Add the change along the tangent line, f′(a)h, to get f(a) + f′(a)h.
  CHANGE_ONLY:
    label: Gave only the change f′(a)h
    explanation: f′(a)h is the estimated change in f when x moves from a to a + h. The value f(a + h) is the starting value plus that change, f(a) + f′(a)h.
  SLOPE_AT_NEW_POINT:
    label: Took the slope at a + h
    explanation: The tangent line uses the slope at the known point a, f′(a). Evaluating the derivative at a + h needs the very kind of number you are trying to estimate.
  EXACT_VALUE:
    label: Gave the exact value, not the approximation
    explanation: The question asks for the estimate from the approximation formula, not the calculator value. Work out f(a) + f′(a)h (plus ½f″(a)h² if asked) and compare it with the exact value afterwards.
  LINEAR_ONLY:
    label: Stopped at the linear term
    explanation: A second-order (quadratic) approximation adds the curvature term ½f″(a)h² to the tangent-line estimate f(a) + f′(a)h. Without it you have only the first-order estimate.
  FORGOT_HALF:
    label: Forgot the ½ in the quadratic term
    explanation: The second-order term is ½f″(a)h², or f″(a)h²/2!. Without the ½ the parabola bends twice as much as the curve, and the correction is doubled.
  SECOND_ORDER_SIGN:
    label: Wrong sign on the curvature term
    explanation: Keep the sign of f″(a). For a concave function such as √x or ln x, f″(a) < 0 and the correction is subtracted; for a convex one such as eˣ it is added.
  FORGOT_SQUARE:
    label: Did not square h
    explanation: The second-order term is ½f″(a)h², with h squared. Using ½f″(a)h makes the correction far too large for small steps.
  POWER_RULE_SLIP:
    label: Wrong second derivative of (1 + r)ⁿ
    explanation: Differentiating (1 + r)ⁿ twice brings down n and then n − 1, so the second derivative at r = 0 is n(n − 1), not n². The r² coefficient is n(n − 1)/2.
resources:
  - { title: "Calculus Volume 1, 4.2 Linear Approximations and Differentials (OpenStax)", url: "https://openstax.org/books/calculus-volume-1/pages/4-2-linear-approximations-and-differentials", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Calculus Volume 2, 6.3 Taylor and Maclaurin Series (OpenStax)", url: "https://openstax.org/books/calculus-volume-2/pages/6-3-taylor-and-maclaurin-series", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
Economists constantly ask "what happens if this changes a little?" If the interest rate rises by half a point, how much does a bond lose? If output grows by 3 %, what is the log difference that a statistics office reports? If a firm hires four more workers, how much more does it produce? Each answer needs the value of a function at a new point, and often the exact formula is awkward or unknown. Near a point where everything is known, a curve can be replaced by a straight line or a parabola, and these are easy to work with. This topic shows how, and how large the error is.

## Intuition
Zoom in on a smooth curve and it looks straight: it looks like its tangent line (C102). So near a known point $a$, moving a small step $h$ changes $f$ by about slope × step, $f'(a)\,h$.

Move further away and the curve bends away from the tangent. The second derivative (C108) tells you which way: a convex curve ($f'' > 0$) bends up, so the tangent lies below it and underestimates; a concave curve ($f'' < 0$) bends down and the tangent overestimates. Adding a small parabola that bends exactly as much as the curve does at $a$ removes most of the gap. Adding more terms, built from higher derivatives, gives Taylor polynomials, and each extra term makes the error shrink faster as the step gets smaller.

## Definition and formulas
**Linear (first-order) approximation** at $a$, the tangent line:
$$f(a + h) \approx f(a) + f'(a)\,h \qquad\text{or}\qquad f(x) \approx f(a) + f'(a)(x - a).$$

**Differentials.** Write $dx$ for a small change in $x$ and define $dy = f'(x)\,dx$. The true change $\Delta y = f(x + dx) - f(x)$ is approximately $dy$. In economics:

- cost: $\Delta C \approx C'(q)\,\Delta q$, marginal cost times the change in output;
- output: $\Delta Q \approx Q'(L)\,\Delta L$, the marginal product of labour times the extra workers;
- revenue: $\Delta R \approx R'(P)\,\Delta P = Q\,(1 + \varepsilon)\,\Delta P$, using the elasticity $\varepsilon$ of C107.

Why $dy$ is the right approximation: for a differentiable function $\Delta y = f'(x)\,\Delta x + \alpha\,\Delta x$, where $\alpha \to 0$ as $\Delta x \to 0$. The first part, $dy$, is proportional to $\Delta x$ and is called the **principal (linear) part** of the change; the second part shrinks faster than $\Delta x$. On the graph, $dy$ is the rise along the tangent line, while $\Delta y$ is the rise along the curve.

Rules for differentials copy the derivative rules: $d(u \pm v) = du \pm dv$, $d(uv) = v\,du + u\,dv$, $d(u/v) = (v\,du - u\,dv)/v^2$. The form $dy = f'(u)\,du$ stays the same even when $u$ is itself a function of another variable (the **invariance** of the first differential, which is the chain rule of C104 in disguise). Differentiating again gives **higher-order differentials**: $d^2y = f''(x)\,dx^2$ and in general $d^ny = f^{(n)}(x)\,dx^n$ when $x$ is the independent variable; the second one drives the quadratic approximation below.

**Quadratic (second-order) approximation:**
$$f(a + h) \approx f(a) + f'(a)\,h + \tfrac{1}{2}f''(a)\,h^2.$$
The $\tfrac12$ is needed because the second derivative of $\tfrac12 f''(a)h^2$ with respect to $h$ is exactly $f''(a)$, so the parabola bends as much as the curve at $a$. If $f''(a) > 0$ the correction is positive; if $f''(a) < 0$ it is negative.

**Taylor polynomial of order $n$** about $a$:
$$P_n(a + h) = f(a) + f'(a)\,h + \frac{f''(a)}{2!}h^2 + \dots + \frac{f^{(n)}(a)}{n!}h^n = \sum_{k=0}^{n} \frac{f^{(k)}(a)}{k!}\,h^k.$$
$P_n$ has the same value and the same first $n$ derivatives as $f$ at $a$. About $a = 0$ it is called a **Maclaurin polynomial**, written in $x$ instead of $h$. Using $(e^x)' = e^x$ and $(\ln x)' = 1/x$ (C105) and the power rule:

- $e^x \approx 1 + x + \dfrac{x^2}{2} + \dfrac{x^3}{6} + \dots + \dfrac{x^n}{n!}$
- $\ln(1 + x) \approx x - \dfrac{x^2}{2} + \dfrac{x^3}{3} - \dots$
- $(1 + x)^k \approx 1 + kx + \dfrac{k(k - 1)}{2}x^2 + \dots$ for any power $k$
- $\sqrt{1 + x} \approx 1 + \dfrac{x}{2} - \dfrac{x^2}{8}$, the case $k = \tfrac12$

**The error (remainder).** The error of $P_n$ is $R_n = f(a + h) - P_n(a + h)$. For a smooth function and small $h$, it is about the size of the first term left out, $\dfrac{f^{(n+1)}(a)}{(n+1)!}h^{n+1}$, so it shrinks like $h^{n+1}$. Halving the step divides the tangent-line error by about 4 and the quadratic error by about 8. (Exactly: $R_n = \dfrac{f^{(n+1)}(c)}{(n+1)!}h^{n+1}$ for some $c$ between $a$ and $a + h$.)

**When is the approximation good?** When $h$ is small compared with how quickly the slope of $f$ changes, and $f$ is smooth near $a$ (at a kink there is no tangent). Far from $a$ the error grows quickly, and for some functions more terms help only inside a range: the polynomials of $\ln(1 + x)$ improve only for $-1 < x \le 1$. Letting the number of terms grow without end gives a power series, which is the subject of C117.

**Three rules of thumb** for a small rate $r$, written as a decimal:

- $\ln(1 + r) \approx r$, more precisely $r - \dfrac{r^2}{2}$: a log difference is almost the growth rate.
- $(1 + r)^n \approx 1 + nr$: over a short time compound growth is close to simple growth; the next term, $\dfrac{n(n-1)}{2}r^2$, is the interest on interest.
- $e^r \approx 1 + r$.

## Interactive
::widget{id="taylor-log-approximation"}

Move the slider **Distance from a = 0, h** to choose how far from the point $a = 0$ you go. The lilac curve is $\ln(1 + x)$, the gold line its tangent $y = x$ and the green dashed curve the parabola $x - x^2/2$. The panel shows the true value $\ln(1 + h)$ and the two approximations, each with its error (approximation minus true value) in brackets. Check: at $h = 0.1$ the panel shows 0.0953, 0.1 (+0.0047) and 0.095 (−0.0003), the numbers of Example 3. At $h = 0.05$ the linear error falls to +0.0012, about a quarter, and the quadratic error is so small that it shows as 0 at four decimals. Now drag to $h = 1$: the tangent misses by 0.3069 and the parabola by 0.1931, so far from the point both approximations are poor. The tangent is above the curve on both sides, because $\ln(1 + x)$ is concave.

## Worked examples

### Example 1 (easy): four more workers
A firm's output is $Q(L) = 10\sqrt{L}$, where $L$ is the number of workers. It employs 100 workers. Use the linear approximation to estimate output with 104 workers.

1. $Q(100) = 10\sqrt{100} = 100$
   *Why:* start from the point where everything is known exactly.
2. $Q'(L) = \dfrac{5}{\sqrt{L}}$, so $Q'(100) = 0.5$
   *Why:* power rule (C103); this is the marginal product of labour, extra output per extra worker.
3. $dQ = Q'(100)\,dL = 0.5 \times 4 = 2$
   *Why:* the differential: slope times the change in the input.
4. $Q(104) \approx 100 + 2 = 102$; the exact value is $10\sqrt{104} = 101.98$, an error of 0.02.
   *Why:* $Q'' < 0$ (diminishing returns, C108), so the curve is concave and the tangent slightly overestimates.

```verify
L0 = 100; dL = 4
Q0 = 10*sqrt(L0)
MP = 5/sqrt(L0)
dQ = MP*dL
estimate = Q0 + dQ
exact = 10*sqrt(L0 + dL)
assert Q0 == 100
assert MP == 0.5
assert dQ == 2
assert estimate == 102
assert abs(exact - 101.98) < 0.005
assert abs((estimate - exact) - 0.02) < 0.001
```

### Example 2 (medium): compound growth, first and second order
A deposit of 2000 earns 4 % a year, compounded annually, for 6 years. Estimate its final value with the linear and the quadratic approximation of $(1 + r)^6$ about $r = 0$, and compare with the exact value.

1. $g(r) = (1 + r)^6$: $g(0) = 1$, $g'(0) = 6$, $g''(0) = 6 \cdot 5 = 30$
   *Why:* $g'(r) = 6(1 + r)^5$ and $g''(r) = 30(1 + r)^4$; at $r = 0$ every power of $1 + r$ equals 1.
2. Linear: $(1.04)^6 \approx 1 + 6(0.04) = 1.24$, so the deposit is about $2000 \times 1.24 = 2480$.
   *Why:* the first-order estimate is simple interest, 6 years at 4 %.
3. Quadratic: $(1.04)^6 \approx 1 + 0.24 + \tfrac{30}{2}(0.04)^2 = 1.264$, so about $2000 \times 1.264 = 2528$.
   *Why:* the term $15r^2$ is interest on interest: each of the 15 pairs of years adds $r^2$.
4. Exact: $2000 \times 1.04^6 = 2530.64$. The linear estimate is 50.64 too low, the quadratic only 2.64 too low.
   *Why:* all the terms left out ($r^3$, $r^4$, …) are positive, so both estimates are below the exact value, but the second-order term captures most of the gap.

```verify
P = 2000; r = 0.04; n = 6
g1 = n
g2 = n*(n - 1)
linear = P*(1 + n*r)
quad = P*(1 + n*r + g2/2*r^2)
exact = P*(1 + r)^n
assert g2 == 30
assert abs(linear - 2480) < 0.000001
assert abs(1 + n*r + g2/2*r^2 - 1.264) < 0.000001
assert abs(quad - 2528) < 0.000001
assert abs(exact - 2530.64) < 0.005
assert abs((exact - linear) - 50.64) < 0.005
assert abs((exact - quad) - 2.64) < 0.005
```

### Example 3 (hard): log differences and growth rates
Real GDP rises from 400 to 440 billion, a growth rate of 10 %. Economists often measure growth by the log difference $\ln 440 - \ln 400$. Find the Taylor polynomials of $\ln(1 + x)$ about 0 up to order 3, use them to approximate the log difference, and see how the errors change when growth is 5 % instead.

1. $\ln 440 - \ln 400 = \ln\dfrac{440}{400} = \ln 1.1 = 0.0953$
   *Why:* the difference of two logs is the log of the ratio (F07), and the ratio is $1 + $ growth rate.
2. $f(x) = \ln(1 + x)$: $f(0) = 0$; $f'(x) = \dfrac{1}{1 + x}$, $f'(0) = 1$; $f''(x) = -\dfrac{1}{(1 + x)^2}$, $f''(0) = -1$; $f'''(x) = \dfrac{2}{(1 + x)^3}$, $f'''(0) = 2$
   *Why:* derivative of $\ln$ (C105), then the power rule on $(1 + x)^{-1}$ and $(1 + x)^{-2}$.
3. $P_1 = x$, $\quad P_2 = x - \dfrac{x^2}{2}$, $\quad P_3 = x - \dfrac{x^2}{2} + \dfrac{x^3}{3}$
   *Why:* divide each derivative by $k!$: $-1/2! = -\tfrac12$ and $2/3! = \tfrac13$.
4. At $x = 0.1$: $P_1 = 0.1$ (error $+0.0047$), $P_2 = 0.095$ (error $-0.00031$), $P_3 = 0.095333$ (error $+0.000023$).
   *Why:* errors are approximation minus true value; each extra term here cuts the error by more than ten times.
5. At $x = 0.05$: $\ln 1.05 = 0.04879$; the error of $P_1$ is $0.00121$ (about a quarter of $0.0047$) and of $P_2$ is $-0.00004$ (about an eighth of $0.00031$).
   *Why:* the error of order $n$ shrinks like $h^{n+1}$: halving the step divides it by $2^2 = 4$ for the tangent line and by $2^3 = 8$ for the parabola.

So a 10 % growth rate is a log difference of 0.0953: close, but not equal. For small growth rates $r$ the two are almost the same, and $r - r^2/2$ converts between them more accurately.

```verify
growth = log(440) - log(400)
assert abs(growth - log(1.1)) < 1e-12
assert abs(growth - 0.0953) < 0.00005
x = 0.1
p1 = x
p2 = x - x^2/2
p3 = x - x^2/2 + x^3/3
assert abs(p2 - 0.095) < 1e-12
assert abs(p3 - 0.095333) < 0.0000005
assert abs((p1 - growth) - 0.0047) < 0.00005
assert abs((p2 - growth) - (-0.00031)) < 0.000005
assert abs((p3 - growth) - 0.000023) < 0.0000005
y = 0.05
t = log(1 + y)
assert abs(t - 0.04879) < 0.000005
err1 = y - t
err2 = y - y^2/2 - t
assert abs(err1 - 0.00121) < 0.000005
assert abs(err2 - (-0.00004)) < 0.000005
assert abs((p1 - growth)/err1 - 4) < 0.15
assert abs((p2 - growth)/err2 - 8) < 0.3
```

## Common mistakes
- Stopping at $f(a)$ and forgetting to add the change (VALUE_ONLY).
- Giving the change $f'(a)h$ as if it were the new value (CHANGE_ONLY).
- Working out the slope at $a + h$ instead of at the known point $a$ (SLOPE_AT_NEW_POINT).
- Typing the calculator value when the question asks for the approximation (EXACT_VALUE).
- Leaving out the curvature term when a second-order estimate is asked for (LINEAR_ONLY).
- Forgetting the $\tfrac12$ in $\tfrac12 f''(a)h^2$ (FORGOT_HALF).
- Dropping the minus sign of $f''(a)$ for a concave function such as $\sqrt{x}$ or $\ln x$ (SECOND_ORDER_SIGN).
- Writing $\tfrac12 f''(a)h$ without squaring $h$ (FORGOT_SQUARE).
- Taking the second derivative of $(1 + r)^n$ at 0 as $n^2$ instead of $n(n - 1)$ (POWER_RULE_SLIP).
- Putting a rate in per cent into $\ln(1 + r) \approx r$: for 5 % use $r = 0.05$, not 5.
- Trusting a linear approximation for a large change: the error grows like $h^2$, so ten times the step means about a hundred times the error.

## Practice
- `linear-approximation-estimate` (difficulty 1): estimate $\sqrt{x}$, $\sqrt[3]{x}$, $\ln x$ or $e^x$ near a nice point with the tangent line; distractors VALUE_ONLY, CHANGE_ONLY, SLOPE_AT_NEW_POINT, EXACT_VALUE.
- `compound-growth-quadratic-approximation` (difficulty 2): second-order estimate of a deposit growing at a compound rate, $P(1 + nr + \tfrac{n(n-1)}{2}r^2)$; distractors LINEAR_ONLY, FORGOT_HALF, POWER_RULE_SLIP, EXACT_VALUE.
- `quadratic-approximation-estimate` (difficulty 3): estimate $\sqrt{x}$, $\sqrt[3]{x}$, $\ln x$ or $e^x$ near a nice point with $f(a) + f'(a)h + \tfrac12 f''(a)h^2$; distractors LINEAR_ONLY, FORGOT_HALF, SECOND_ORDER_SIGN, FORGOT_SQUARE.

## Real world
- Growth statistics: economists and central banks often work with log differences of GDP, prices or wages, because $\ln Y_1 - \ln Y_0 = \ln(1 + g) \approx g$ for a small growth rate $g$, and log differences add up neatly over several years. The rule of 70 for doubling times (F07) comes from the same approximation.
- Bonds: when market interest rates (yields) change by a small amount $\Delta y$, the percentage change in a bond's price is approximated by $-D\,\Delta y + \tfrac12 C\,(\Delta y)^2$. The duration $D$ is the first-order (slope) term and the convexity $C$ the second-order (curvature) term. Because the price curve is convex, duration alone overstates the fall in price when rates rise and understates the gain when they fall; banks and pension funds use both numbers to manage interest-rate risk.
- Inflation and real interest rates: the real rate is $\dfrac{1 + i}{1 + \pi} - 1$, and its first-order approximation is $i - \pi$, the nominal rate minus inflation, which is the form used in most news and policy reports.
- Macroeconomic models: large models of the economy are usually "log-linearised", that is, replaced by their first-order Taylor approximation around a steady state, so that they can be solved and estimated quickly.

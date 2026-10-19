---
id: NM01
title: "Root finding: bisection and Newton's method"
block: NM
coreYear: 4
prerequisites: [C111]
estMinutes: 45
status: draft
economicUses:
  - Internal rates of return and bond yields, which have no formula beyond two periods
  - Equilibrium prices when demand and supply curves are not straight lines
  - Break-even output when costs are not linear
  - Solving large economic models on a computer
generators: [bisection-steps-for-tolerance, newton-equilibrium-price-iterates, newton-irr-step]
widgets: [newton-break-even]
mistakeCodes:
  STEPS_ROUNDED_DOWN:
    label: Rounded the number of steps down
    explanation: You need the smallest whole n with 2ⁿ ≥ (b − a)/ε. If log₂((b − a)/ε) is, say, 10.97, then 10 steps leave the interval slightly too wide; round up to 11.
  LOG_BASE_10:
    label: Used powers of 10 instead of powers of 2
    explanation: Each bisection step halves the interval, so the width after n steps is (b − a)/2ⁿ, not (b − a)/10ⁿ. Use log₂, which is ln(x)/ln 2, or compare with powers of 2.
  IGNORED_INTERVAL_WIDTH:
    label: Forgot the width of the starting interval
    explanation: The width after n steps is (b − a)/2ⁿ, and b − a is rarely 1. Solve 2ⁿ ≥ (b − a)/ε, not 2ⁿ ≥ 1/ε.
  ONE_ITERATE:
    label: Stopped after one Newton step
    explanation: x₁ is only the first improvement. The question asks for x₂, so repeat the step from x₁ with the new value f(x₁) and the new slope f′(x₁).
  NEWTON_PLUS_SIGN:
    label: Added f(x)/f′(x) instead of subtracting it
    explanation: The tangent line f(xₙ) + f′(xₙ)(x − xₙ) is zero at x = xₙ − f(xₙ)/f′(xₙ). Adding the ratio moves away from the root; check that the step goes the way the sign of f says.
  FROZEN_SLOPE:
    label: Reused the slope from the starting point
    explanation: Each Newton step uses the tangent at the current estimate, so the second step needs f′(x₁), not f′(x₀). Keeping the old slope gives a slower method and a different number.
  EXACT_ROOT:
    label: Gave the exact root, not the requested iterate
    explanation: The question asks where the method is after a stated number of steps, not for the root itself. Carry out exactly those steps and report that iterate.
  DERIVATIVE_POWER_SLIP:
    label: Wrong derivative of the discount factor
    explanation: The derivative of CF/(1 + r)ᵗ is −t·CF/(1 + r)ᵗ⁺¹; the power goes up by one. Keeping the power at t gives a wrong slope and a wrong Newton step.
resources:
  - { title: "Calculus Volume 1, 4.9 Newton's Method (OpenStax)", url: "https://openstax.org/books/calculus-volume-1/pages/4-9-newtons-method", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Principles of Finance, 16.3 Internal Rate of Return (IRR) Method (OpenStax)", url: "https://openstax.org/books/principles-finance/pages/16-3-internal-rate-of-return-irr-method", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Introduction to Numerical Analysis, 18.330 (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-330-introduction-to-numerical-analysis-spring-2012/", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
Many economic questions end with "find the number that makes this equal to zero". The internal rate of return of a project is the rate at which its NPV is zero. A market clears at the price where excess demand is zero. A firm breaks even where profit is zero. With straight lines or two periods you can solve by algebra (F04, FM06), but as soon as there are three cash flows, a curved demand curve or a cubic cost, there is usually no formula you can use by hand. Spreadsheets, statistics packages and economic models then find the answer by a **numerical method**: they start from a guess and improve it step by step until it is accurate enough. This topic explains the two classic methods, bisection and Newton's method, how fast each one gets there, and when each one fails.

## Intuition
**Bisection is a guessing game with a guarantee.** Suppose a project's NPV is positive at 0 % and negative at 20 %. The NPV curve is unbroken, so it must cross zero somewhere in between: that crossing is the IRR. Test the middle, 10 %. If the NPV there is negative, the crossing lies between 0 % and 10 %; throw the other half away. Each test halves the interval that must contain the answer, like guessing a number between 1 and 1000 with "higher or lower" hints: ten guesses are always enough, because $2^{10} = 1024$.

**Newton's method follows the tangent.** Near a point the curve looks like its tangent line (C111). So instead of halving blindly, draw the tangent at your current guess and slide down it to where it hits zero. That point is your next guess. Close to the root the curve and the tangent are almost the same, so each step lands very close: the error is roughly squared every time, and the number of correct decimals roughly doubles. The price is that Newton needs the derivative and a reasonable start. If the tangent is nearly flat, it meets the axis far away and the method can jump to nonsense, such as a negative output.

## Definition and formulas
**The problem.** Find a **root** of $f$: a number $x^*$ with $f(x^*) = 0$. Any equation $g(x) = h(x)$ can be written this way with $f = g - h$; for a market, $f(p) = D(p) - S(p)$ is excess demand.

**Bracketing.** If $f$ is continuous on $[a, b]$ and $f(a)$ and $f(b)$ have opposite signs, then $f$ has at least one root between $a$ and $b$ (the intermediate value theorem, AN03).

**Bisection.** Start from a bracket $[a, b]$.

1. Compute the midpoint $m = \dfrac{a + b}{2}$ and $f(m)$.
2. If $f(m)$ has the same sign as $f(a)$, the root is in $[m, b]$: replace $a$ by $m$. Otherwise replace $b$ by $m$.
3. Repeat until the interval is narrow enough.

After $n$ steps the interval that contains the root has width
$$\frac{b - a}{2^n},$$
so its midpoint is within $\dfrac{b - a}{2^{n+1}}$ of the root. To make the width at most a tolerance $\varepsilon$ you need
$$2^n \ge \frac{b - a}{\varepsilon} \quad\Longleftrightarrow\quad n \ge \log_2\frac{b - a}{\varepsilon} = \frac{\ln\big((b - a)/\varepsilon\big)}{\ln 2},$$
rounded **up** to a whole number. Every step gains one binary digit, so each extra decimal digit costs about $\log_2 10 \approx 3.3$ steps. Bisection always works once you have a bracket, but it is slow.

**Newton's method.** The tangent line at the current estimate $x_n$ is $y = f(x_n) + f'(x_n)(x - x_n)$ (C111). Setting it to zero gives the next estimate:
$$x_{n+1} = x_n - \frac{f(x_n)}{f'(x_n)}.$$

- **Speed.** Near a **simple root** (one with $f'(x^*) \neq 0$) the errors $e_n = x_n - x^*$ satisfy approximately
  $$e_{n+1} \approx \frac{f''(x^*)}{2f'(x^*)}\, e_n^2.$$
  This is **quadratic convergence**: an error of 0.01 becomes about 0.0001, then 0.00000001.
- **When it fails.** If $f'(x_n) = 0$ the tangent is flat and never meets the axis. If $f'(x_n)$ is close to 0 the step is huge and can leave the region that makes economic sense. From a bad start Newton can find a different root from the one you want, or **cycle**: for $f(x) = x^3 - 2x + 2$ starting at $x_0 = 0$ it gives $x_1 = 1$, $x_2 = 0$, $x_3 = 1$, … for ever. At a **multiple root**, where $f'(x^*) = 0$ too, it still converges but only slowly.
- **A safe case.** If $f$ is convex ($f'' > 0$) with one root and a slope that stays away from zero, every tangent lies below the curve. So from the first step on, every estimate has $f(x_n) \ge 0$, and the estimates move steadily towards the root without overshooting. An NPV curve is convex in $r$, which is one reason Newton works so well for an IRR. (For a concave $f$ the same holds with $f(x_n) \le 0$.)

**Stopping rule.** Choose a tolerance $\varepsilon$ in advance. Stop Newton's method when two successive estimates agree to it, $|x_{n+1} - x_n| < \varepsilon$, and check that $|f(x_{n+1})|$ is small. Always set a maximum number of steps too; if it is reached, report a failure rather than a number. Stop bisection when the interval is narrower than $\varepsilon$; the step count above tells you in advance how many steps that takes.

**Secant method.** If the derivative is awkward, replace it by the slope through the last two estimates:
$$x_{n+1} = x_n - f(x_n)\,\frac{x_n - x_{n-1}}{f(x_n) - f(x_{n-1})}.$$
It needs no derivative and is nearly as fast as Newton. The linear interpolation for an IRR in FM06 is one step of this kind.

**Which to use?** Bisection is safe but slow; Newton is fast but needs a derivative and a good start. Software therefore often combines them: bisection (or a coarse search) to get a narrow bracket, then Newton or secant steps to finish, falling back on bisection whenever a step would leave the bracket.

## Interactive
::widget{id="newton-break-even"}

The lilac curve is the profit $\pi(q) = 27q - q^3 - 30$ of the firm in Example 3, with output $q$ in thousands; it crosses zero at the two break-even outputs. Move **Starting output q₀** to choose where Newton's method starts and **Newton steps** to take up to 5 steps. Each gold line is a tangent, followed down to the axis, and the green dashed line goes back up to the curve at the new estimate. The panel shows the latest estimate $q_n$, the profit there and the size of the last step. Check: with $q_0 = 5$ and 1 step the panel shows 4.5833, as in Example 3; at 3 steps it shows 4.5111 and the last step is only 0.002. Now move the start to 3: the tangent at the top of the profit hill is flat and the method cannot take a step. Move it to 2.9 and take 1 step: the estimate jumps to −10.609, a negative output, because the tangent there is almost flat.

## Worked examples

### Example 1 (easy): bisection for an IRR
A project costs 1000 today and returns 400 at the end of each of the next 3 years. Use 3 steps of bisection on $[0\%, 20\%]$ to estimate its IRR, then find how many steps would pin the IRR down to an interval no wider than 0.01 percentage points.

1. $NPV(r) = -1000 + \dfrac{400}{1 + r} + \dfrac{400}{(1 + r)^2} + \dfrac{400}{(1 + r)^3}$; $NPV(0) = 200 > 0$ and $NPV(0.2) = -157.41 < 0$
   *Why:* the NPV is continuous and changes sign, so the IRR lies between 0 % and 20 %.
2. $NPV(0.10) = -5.26 < 0 \Rightarrow [0\%, 10\%]$
   *Why:* the NPV is already negative at the midpoint, so the sign change is in the left half.
3. $NPV(0.05) = 89.30 > 0 \Rightarrow [5\%, 10\%]$; $\;NPV(0.075) = 40.21 > 0 \Rightarrow [7.5\%, 10\%]$
   *Why:* each time keep the half whose ends have NPVs of opposite sign.
4. Estimate: the midpoint $8.75\%$, within $1.25$ points of the IRR
   *Why:* after 3 steps the interval has width $20/2^3 = 2.5$, and its midpoint is at most half of that from the root. (The IRR is in fact 9.70 %.)
5. $2^n \ge \dfrac{20}{0.01} = 2000$: $2^{10} = 1024 < 2000 \le 2^{11} = 2048$, so $n = 11$ steps
   *Why:* the width after $n$ steps is $20/2^n$; round $\log_2 2000 = 10.97$ up, because 10 steps leave an interval of 0.0195 points.
6. For comparison, one Newton step from $r_0 = 10\%$: $NPV'(0.1) = -\dfrac{400}{1.1^2} - \dfrac{800}{1.1^3} - \dfrac{1200}{1.1^4} = -1751.25$, so $r_1 = 0.1 - \dfrac{-5.26}{-1751.25} = 0.096997$, that is $9.70\%$
   *Why:* the NPV curve is nearly straight near the IRR, so a single tangent step lands within 0.0013 points of it. Bisection would need 13 steps to guarantee that its midpoint is within 0.002 points, since $20/2^{14} = 0.0012$.

```verify
npv(r) = -1000 + 400/(1 + r) + 400/(1 + r)^2 + 400/(1 + r)^3
dnpv(r) = -400/(1 + r)^2 - 800/(1 + r)^3 - 1200/(1 + r)^4
assert npv(0) == 200
assert abs(npv(0.2) - (-157.41)) < 0.005
assert abs(npv(0.1) - (-5.26)) < 0.005
assert abs(npv(0.05) - 89.30) < 0.005
assert abs(npv(0.075) - 40.21) < 0.005
assert npv(0.1) < 0 and npv(0.05) > 0 and npv(0.075) > 0
mid = (0.075 + 0.1)/2
assert abs(mid - 0.0875) < 1e-12
# the IRR lies in [7.5 %, 10 %] and is 9.70 % to 2 decimals
assert npv(0.0970) > 0 and npv(0.09705) < 0
assert 2^10 < 20/0.01 and 20/0.01 <= 2^11
assert abs(log(2000, 2) - 10.97) < 0.005
assert abs(20/2^10 - 0.0195) < 0.00005
assert abs(dnpv(0.1) - (-1751.25)) < 0.005
r1 = 0.1 - npv(0.1)/dnpv(0.1)
assert abs(r1 - 0.096997) < 0.0000005
assert abs(r1 - 0.0970) < 0.00002
# the IRR is 0.097010..., so r1 is 0.0013 percentage points below it
assert npv(0.097010) > 0 and npv(0.097011) < 0
irr = r1 - npv(r1)/dnpv(r1)
irr = irr - npv(irr)/dnpv(irr)
assert abs(npv(irr)) < 1e-9
assert abs((irr - r1)*100 - 0.0013) < 0.00005
# bisection: the midpoint after n steps is within 20/2^(n+1) points
assert 20/2^13 > 0.002 and 20/2^14 <= 0.002
assert abs(20/2^14 - 0.0012) < 0.00005
```

### Example 2 (medium): Newton's method for an equilibrium price
Demand for a good is $D(p) = \dfrac{400}{p^2}$ and supply is $S(p) = 2p + 4$. Find the equilibrium price to 4 decimal places with Newton's method, starting from $p_0 = 6$ and stopping when two estimates differ by less than 0.0001.

1. $\dfrac{400}{p^2} = 2p + 4 \iff f(p) = 2p^3 + 4p^2 - 400 = 0$, with $f'(p) = 6p^2 + 8p$
   *Why:* multiplying by $p^2 > 0$ removes the fraction without changing the root; this cubic has no simple formula to solve by hand.
2. $p_1 = 6 - \dfrac{f(6)}{f'(6)} = 6 - \dfrac{176}{264} = 5.3333$
   *Why:* $f(6) > 0$: at 6, supply exceeds demand, so the tangent step lowers the price.
3. $p_2 = 5.3333 - \dfrac{17.1852}{213.3333} = 5.2528$
   *Why:* the same step from the new estimate, with the slope at $p_1$.
4. $p_3 = 5.2528 - \dfrac{0.2326}{207.5723} = 5.2517$, and $p_4 = 5.2517$ as well (the change is 0.0000002)
   *Why:* the change from $p_3$ to $p_4$ is below 0.0001, so stop.
5. Equilibrium: $p^* = 5.2517$, quantity $S(p^*) = 2(5.2517) + 4 = 14.5033$; check $D(p^*) = 400/5.2517^2 = 14.5033$
   *Why:* substituting back into both curves confirms the market clears.

The errors $p_n - p^*$ were 0.7483, 0.0817, 0.0011 and 0.0000002. Dividing each by the square of the one before gives 0.146, 0.168 and 0.171, settling at $f''(p^*)/(2f'(p^*)) = 71.02/(2 \times 207.49) = 0.171$: the quadratic convergence of the formula above. Bisection on $[5, 6]$, where $f(5) = -50 < 0 < f(6)$, would need 14 steps to reach a width of 0.0001, because $2^{13} = 8192 < 10{,}000 \le 2^{14}$.

```verify
f(p) = 2*p^3 + 4*p^2 - 400
df(p) = 6*p^2 + 8*p
assert f(6) == 176 and df(6) == 264
p1 = 6 - f(6)/df(6)
assert abs(p1 - 5.3333) < 0.00005
assert abs(f(p1) - 17.1852) < 0.00005 and abs(df(p1) - 213.3333) < 0.00005
p2 = p1 - f(p1)/df(p1)
assert abs(p2 - 5.2528) < 0.00005
assert abs(f(p2) - 0.2326) < 0.00005 and abs(df(p2) - 207.5723) < 0.00005
p3 = p2 - f(p2)/df(p2)
p4 = p3 - f(p3)/df(p3)
assert abs(p3 - 5.2517) < 0.00005
assert abs(p4 - p3) < 0.0000003 and abs(p4 - p3) > 0.0000001
assert abs(p3 - p2) > 0.0001
assert abs(f(p4)) < 1e-9
assert abs((2*p4 + 4) - 14.5033) < 0.00005
assert abs(400/p4^2 - (2*p4 + 4)) < 1e-9
assert abs((6 - p4) - 0.7483) < 0.00005
assert abs((p1 - p4) - 0.0817) < 0.00005
assert abs((p2 - p4) - 0.0011) < 0.00005
assert abs((p3 - p4) - 0.0000002) < 0.00000005
c = (12*p4 + 8)/(2*df(p4))
assert abs(c - 0.171) < 0.0005
assert abs((12*p4 + 8) - 71.02) < 0.005 and abs(df(p4) - 207.49) < 0.005
assert abs((p1 - p4)/(6 - p4)^2 - 0.146) < 0.0005
assert abs((p2 - p4)/(p1 - p4)^2 - 0.168) < 0.0005
assert abs((p3 - p4)/(p2 - p4)^2 - 0.171) < 0.0005
assert f(5) == -50
assert 2^13 < 1/0.0001 and 1/0.0001 <= 2^14
```

### Example 3 (hard): break-even output, and when Newton fails
A firm sells at a price of 27, has a fixed cost of 30 and a variable cost of $q^3$, with output $q$ in thousands of units and money in thousands. Its profit is $\pi(q) = 27q - q^3 - 30$. Show that Newton's method fails from $q_0 = 3$ and goes wrong from $q_0 = 2.9$, then find the higher break-even output from $q_0 = 5$ to 3 decimal places, stopping when two estimates differ by less than 0.001.

1. $\pi'(q) = 27 - 3q^2$, so $\pi'(3) = 0$; $\pi(3) = 24$
   *Why:* $q = 3$ is the profit-maximising output, the top of the profit hill. The tangent there is horizontal, never meets the axis, and Newton's formula would divide by zero.
2. From $q_0 = 2.9$: $\pi(2.9) = 23.911$, $\pi'(2.9) = 1.77$, so $q_1 = 2.9 - \dfrac{23.911}{1.77} = -10.61$
   *Why:* the tangent is nearly flat, so it meets the axis far away, at a negative output that makes no economic sense. Further steps head for $-5.68$, a root of the cubic with no meaning here.
3. From $q_0 = 5$: $q_1 = 5 - \dfrac{-20}{-48} = 4.5833$, $\;q_2 = 4.5833 - \dfrac{-2.5318}{-36.0208} = 4.5130$
   *Why:* to the right of the hill top the profit curve is concave and falling, so each tangent lies above the curve and meets the axis between the current estimate and the root: the estimates fall steadily towards it.
4. $q_3 = 4.5130 - \dfrac{-0.0676}{-34.1027} = 4.5111$, then $q_4 = 4.5111$; stop, since $|q_4 - q_3| = 0.0000016 < 0.001$ (while $|q_3 - q_2| = 0.0020$ was not)
   *Why:* the stopping rule compares successive estimates; the profit at $q_4$ is practically zero, which confirms the root.
5. The higher break-even output is $q \approx 4.511$ thousand units. Starting from $q_0 = 1$ instead gives $1.1667$, then $1.1705$: the lower break-even output.
   *Why:* the start decides which root Newton finds. The firm makes a profit for outputs between about 1.171 and 4.511 thousand units.

```verify
pr(q) = 27*q - q^3 - 30
dpr(q) = 27 - 3*q^2
assert dpr(3) == 0 and pr(3) == 24
assert abs(pr(2.9) - 23.911) < 0.0000001
assert abs(dpr(2.9) - 1.77) < 0.0000001
assert abs((2.9 - pr(2.9)/dpr(2.9)) - (-10.61)) < 0.005
assert pr(5) == -20 and dpr(5) == -48
q1 = 5 - pr(5)/dpr(5)
assert abs(q1 - 4.5833) < 0.00005
assert abs(pr(q1) - (-2.5318)) < 0.00005 and abs(dpr(q1) - (-36.0208)) < 0.00005
q2 = q1 - pr(q1)/dpr(q1)
assert abs(q2 - 4.5130) < 0.00005
assert abs(pr(q2) - (-0.0676)) < 0.00005 and abs(dpr(q2) - (-34.1027)) < 0.00005
q3 = q2 - pr(q2)/dpr(q2)
q4 = q3 - pr(q3)/dpr(q3)
assert abs(q3 - 4.5111) < 0.00005
assert abs(q3 - q2) > 0.001 and abs(abs(q3 - q2) - 0.0020) < 0.00005
assert abs(abs(q4 - q3) - 0.0000016) < 0.00000005
assert abs(pr(q4)) < 1e-9
assert abs(q4 - 4.511) < 0.0005
a1 = 1 - pr(1)/dpr(1)
a2 = a1 - pr(a1)/dpr(a1)
assert abs(a1 - 1.1667) < 0.00005 and abs(a2 - 1.1705) < 0.00005
# the three roots of q^3 - 27q + 30 add up to 0, so the negative one is about -5.68
a3 = a2 - pr(a2)/dpr(a2)
qneg = -(a3 + q4)
assert abs(qneg - (-5.68)) < 0.005
assert abs(pr(qneg)) < 1e-9
# Newton from 2.9 heads for this negative root
b1 = 2.9 - pr(2.9)/dpr(2.9)
b2 = b1 - pr(b1)/dpr(b1)
b3 = b2 - pr(b2)/dpr(b2)
b4 = b3 - pr(b3)/dpr(b3)
b5 = b4 - pr(b4)/dpr(b4)
b6 = b5 - pr(b5)/dpr(b5)
assert abs(b6 - qneg) < 0.001
```

## Common mistakes
- Rounding $\log_2\big((b - a)/\varepsilon\big)$ down, so the last interval is still too wide (STEPS_ROUNDED_DOWN).
- Counting steps with powers of 10, as if each step cut the interval to a tenth (LOG_BASE_10).
- Solving $2^n \ge 1/\varepsilon$ and forgetting the width $b - a$ of the starting interval (IGNORED_INTERVAL_WIDTH).
- Stopping after the first Newton step when the question asks for a later one (ONE_ITERATE).
- Writing $x_n + f(x_n)/f'(x_n)$: the step then moves away from the root (NEWTON_PLUS_SIGN).
- Keeping the slope $f'(x_0)$ for every step instead of using the tangent at the current estimate (FROZEN_SLOPE).
- Solving the equation another way and giving the root when the question asks for a particular iterate (EXACT_ROOT).
- Differentiating $CF/(1 + r)^t$ as $-t\,CF/(1 + r)^t$ instead of $-t\,CF/(1 + r)^{t+1}$ (DERIVATIVE_POWER_SLIP).
- Starting bisection without checking that $f(a)$ and $f(b)$ have opposite signs: then the interval may contain no root at all.
- Trusting a Newton result without looking at it: a negative price or output, or an estimate outside the starting bracket, means the start was poor.
- Stopping only because $|f(x)|$ is small when $f$ is very flat near the root: the estimate can still be far off, so also check that the steps have become small.

## Practice
- `bisection-steps-for-tolerance` (difficulty 1): the smallest number of bisection steps that shrinks an IRR or price bracket below a tolerance; distractors STEPS_ROUNDED_DOWN, LOG_BASE_10, IGNORED_INTERVAL_WIDTH.
- `newton-equilibrium-price-iterates` (difficulty 2): two Newton steps on $sp^3 + tp^2 - A = 0$, the equilibrium of $D(p) = A/p^2$ and $S(p) = sp + t$, to 4 decimals; distractors ONE_ITERATE, NEWTON_PLUS_SIGN, FROZEN_SLOPE, EXACT_ROOT.
- `newton-irr-step` (difficulty 3): one Newton step for the IRR of a three-year project from a starting guess, in per cent to 2 decimals; distractors NEWTON_PLUS_SIGN, DERIVATIVE_POWER_SLIP, EXACT_ROOT.

## Real world
- Spreadsheets: the IRR and bond-yield functions of spreadsheet programs search iteratively from a starting guess (often 10 %). If the steps do not settle within a set number of tries they return an error, and entering a better guess usually fixes it, exactly the bad-start problem of Newton's method.
- Bond markets: a bond's yield to maturity is the IRR of its price and coupons (FM07). Traders' systems solve for thousands of yields every second with Newton-type steps, starting from yesterday's yield, which is an excellent first guess.
- Option markets: the "implied volatility" quoted for an option is the volatility that makes a pricing formula match the market price; there is no formula for it, so it is found by Newton's method or bisection.
- Economic models: computable general equilibrium models used by governments and international organisations to study trade agreements and tax reforms find the prices that make excess demand zero in hundreds of markets at once, using multi-dimensional versions of Newton's method.

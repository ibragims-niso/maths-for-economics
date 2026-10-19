---
id: AN03
title: Continuity and the extreme value theorem
block: AN
coreYear: 4
prerequisites: [AN02]
estMinutes: 50
status: draft
economicUses:
  - Existence of a market-clearing price when excess demand changes sign
  - Existence of a utility-maximising bundle on a budget set
  - Why a firm with a capacity limit always has a best output
  - Bisection searches for equilibrium prices and rates of return
generators: [epsilon-delta-linear, capacity-profit-maximum, bisection-equilibrium-midpoint]
widgets: [epsilon-delta-square]
mistakeCodes:
  MULTIPLIED_BY_SLOPE:
    label: Multiplied ε by the slope
    explanation: From |m|·|x − a| < ε, divide both sides by |m| to get |x − a| < ε/|m|. Multiplying instead gives a δ that is far too wide whenever the line is steeper than 1.
  IGNORED_SLOPE:
    label: Took δ = ε
    explanation: δ = ε only works for a line with slope 1 or −1. A steeper line moves the output faster, so the input must stay closer to a; the largest δ is ε/|m|.
  HALVED_EPSILON:
    label: Split ε in half without a reason
    explanation: Halving ε is needed when two functions are added and each may use up half of the tolerance. For a single straight line the whole of ε is available, so δ = ε/|m|.
  NEGATIVE_DELTA:
    label: Gave a negative δ
    explanation: δ is a distance, so it is always positive. For a falling line divide ε by the size of the slope, |m|, not by the negative slope.
  IGNORED_CAPACITY:
    label: Used the peak beyond capacity
    explanation: The output where π′(q) = 0 lies above capacity, so the firm cannot produce it. On [0, K] the only candidates are the two endpoints and flat points inside the interval.
  WRONG_ENDPOINT:
    label: Picked the wrong endpoint
    explanation: When profit rises across the whole interval, the maximum is at the right end, q = K. The value π(0) = −F, a loss equal to the fixed cost, is the minimum.
  QUANTITY_NOT_PROFIT:
    label: Gave the best output, not the profit
    explanation: q = K is where the maximum is reached. The question asks for the largest profit itself, π(K).
  ONE_STEP_SHORT:
    label: Stopped one step early
    explanation: The last midpoint you tested has become an end of the final interval. After k steps take the midpoint of the interval that is left; that is the bisection estimate.
  ENDPOINT_NOT_MIDPOINT:
    label: Gave an end of the final interval
    explanation: The equilibrium can lie anywhere in the final interval. Its midpoint is never more than half the width away, which is why bisection reports the midpoint.
  WRONG_HALF:
    label: Kept the wrong half
    explanation: Keep the half on which Z changes sign. If Z(m) > 0, buyers want more than sellers offer, so the price m is too low and the equilibrium lies above m; keep the right half.
  EXACT_ROOT:
    label: Gave the exact equilibrium, not the bisection estimate
    explanation: The question asks what bisection reports after k steps. Solving the equation exactly is a different method; the bisection estimate is the midpoint of the last interval.
  DELTA_USES_X:
    label: Let δ depend on x
    explanation: δ may depend on ε and on the point a, but not on the x being tested. It must be fixed first, and then work for every x with |x − a| < δ.
  THEOREM_CONVERSE:
    label: Read the theorem backwards
    explanation: The extreme value theorem says its hypotheses are enough for a maximum, not that they are needed. x² on the open interval (−1, 1) still has a minimum at 0.
  JUMP_IVT:
    label: Used the intermediate value theorem across a jump
    explanation: A function with a jump can change sign without ever being 0. The theorem needs continuity on the whole closed interval.
  IVT_UNIQUE:
    label: Read the intermediate value theorem as giving one root
    explanation: The theorem promises at least one point where Z = 0, not exactly one. Uniqueness needs an extra argument, for example that Z is strictly decreasing.
resources:
  - { title: "Calculus Volume 1, 2.5 The Precise Definition of a Limit (OpenStax)", url: "https://openstax.org/books/calculus-volume-1/pages/2-5-the-precise-definition-of-a-limit", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Calculus Volume 1, 4.3 Maxima and Minima (OpenStax)", url: "https://openstax.org/books/calculus-volume-1/pages/4-3-maxima-and-minima", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Real Analysis, 18.100A (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-100a-real-analysis-fall-2020/", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
Economic theory often claims that something exists before anyone computes it: "the market has an equilibrium price", "the consumer has a best bundle", "the firm has a profit-maximising output". If no such thing existed, the formulas for finding it would describe nothing. Continuity is the assumption that makes these claims true, and two theorems turn it into guarantees. The intermediate value theorem says that if excess demand is positive at a low price and negative at a high price, some price in between clears the market. The extreme value theorem says that a firm with a capacity limit, or a consumer with a budget, always has a best choice. Both are statements about *every* market or consumer that meets the assumptions, so they need the precise definition of continuity that this topic builds.

## Intuition
C101 described a continuous function as one whose graph you can draw without lifting the pen. That picture is good but too vague for proofs. The precise version is a challenge and response. A challenger names a tolerance $\varepsilon$ for the output: "I want $f(x)$ within 0.6 of $f(a)$." You must reply with a tolerance $\delta$ for the input: "Keep $x$ within 0.15 of $a$ and you will get it." The function is continuous at $a$ if you can always reply, however small $\varepsilon$ is. A steep function needs a small $\delta$, because a little movement in $x$ moves $f(x)$ a lot. A function with a jump at $a$ fails the challenge: if $\varepsilon$ is smaller than the jump, no $\delta$ works, because points just past the jump are always too far away.

Once continuity is precise, two pictures become theorems. A walker who starts above sea level and ends below it, without jumping, must cross sea level somewhere: that is the intermediate value theorem. A continuous path over a stretch of ground that includes both its ends has a highest point and a lowest point: that is the extreme value theorem. The second fails if an end is missing (you can climb towards it forever without arriving), if the stretch goes on forever, or if the path jumps.

## Definition and formulas
**Continuity, ε–δ form.** A function $f$ is continuous at a point $a$ of its domain if
$$\text{for every } \varepsilon > 0 \text{ there is a } \delta > 0 \text{ such that } |x - a| < \delta \;\Rightarrow\; |f(x) - f(a)| < \varepsilon$$
for every $x$ in the domain. The order of the quantifiers matters: $\varepsilon$ comes first, and $\delta$ may depend on $\varepsilon$ and on $a$, but not on $x$. The function is continuous on a set if it is continuous at every point of it.

**Finding δ for a straight line.** For $f(x) = mx + c$ with $m \ne 0$,
$$|f(x) - f(a)| = |m(x - a)| = |m|\,|x - a| < \varepsilon \iff |x - a| < \frac{\varepsilon}{|m|}.$$
So $\delta = \varepsilon/|m|$ works for every $\varepsilon$, and it is the largest $\delta$ that does. The steeper the line, the smaller $\delta$.

**Finding δ for $x^2$.** Here $|x^2 - a^2| = |x - a|\,|x + a|$, and the factor $|x + a|$ changes with $x$. The standard trick is to agree first that $|x - a| < 1$. Then $|x + a| \le |x - a| + 2|a| < 2|a| + 1$, so $|x^2 - a^2| < (2|a| + 1)\,|x - a|$, and
$$\delta = \min\!\left(1, \frac{\varepsilon}{2|a| + 1}\right)$$
works. At $a = 2$ with $\varepsilon = 1$ this gives $\delta = \min(1, 1/5) = 0.2$. A proof only needs *some* $\delta$ that works, not the largest. For $a \ge 0$ the largest is $\delta = \sqrt{a^2 + \varepsilon} - a$, which comes from the right-hand side, where $(a + \delta)^2 = a^2 + \varepsilon$: at $a = 2$, $\varepsilon = 1$ it is $\sqrt 5 - 2 \approx 0.236$. With the same $\varepsilon = 1$ at $a = 3$ it shrinks to $\sqrt{10} - 3 \approx 0.162$, because the curve is steeper there.

**Sequences (sequential characterisation).** Using the limits of sequences from AN02:
$$f \text{ is continuous at } a \iff f(x_n) \to f(a) \text{ for every sequence } x_n \to a \text{ in the domain.}$$
This is the easiest way to show that a function is *not* continuous: one sequence is enough. A benefit rule pays $B(y) = 100$ to households with income $y \le 1000$ and $B(y) = 0$ above it. The incomes $y_n = 1000 + 1/n$ tend to 1000, but $B(y_n) = 0$ for every $n$, so $B(y_n) \to 0 \ne 100 = B(1000)$. The rule is not continuous at 1000.

**Building continuous functions.** If $f$ and $g$ are continuous at $a$, so are $f + g$, $f - g$, $cf$, $f \cdot g$, and $f/g$ when $g(a) \ne 0$. If $g$ is continuous at $a$ and $f$ is continuous at $g(a)$, the composition $f(g(x))$ is continuous at $a$. Polynomials, $e^x$, $\ln x$ (for $x > 0$), $\sqrt x$ (for $x \ge 0$), and rational functions away from the zeros of their denominators are continuous, so almost every function in an economics model is too. The proof for a sum shows where halving $\varepsilon$ is needed: given $\varepsilon$, choose $\delta_1$ with $|f(x) - f(a)| < \varepsilon/2$ and $\delta_2$ with $|g(x) - g(a)| < \varepsilon/2$, and take $\delta = \min(\delta_1, \delta_2)$. Then
$$|(f + g)(x) - (f + g)(a)| \le |f(x) - f(a)| + |g(x) - g(a)| < \tfrac{\varepsilon}{2} + \tfrac{\varepsilon}{2} = \varepsilon.$$

**Intermediate value theorem (IVT).** If $f$ is continuous on the closed interval $[a, b]$ and $v$ lies between $f(a)$ and $f(b)$, then $f(c) = v$ for some $c$ in $[a, b]$. In particular, if $f(a) > 0 > f(b)$, then $f(c) = 0$ for some $c$ strictly between $a$ and $b$.
- *Equilibrium.* Let excess demand be $Z(p) = D(p) - S(p)$. If $Z$ is continuous, $Z(p_L) > 0$ at a low price and $Z(p_H) < 0$ at a high price, a market-clearing price $p^*$ with $Z(p^*) = 0$ exists between them, even when no formula for $p^*$ is known.
- *Bisection.* Test the midpoint $m$ of the interval and keep the half on which $Z$ changes sign; repeat. After $k$ steps the interval has width $(b - a)/2^k$, so its midpoint is within $(b - a)/2^{k+1}$ of a root. (NM01 compares bisection with faster methods.)
- *Why it is true.* The bisection intervals are nested and their widths shrink to 0. Their left ends rise and are bounded, so by completeness (AN02) they converge to some $c$, and the right ends converge to the same $c$. Along the left ends $f > 0$ and along the right ends $f < 0$ (if a midpoint gives exactly 0, a root is found), so by the sequence form of continuity $f(c) \ge 0$ and $f(c) \le 0$: $f(c) = 0$.

**Extreme value theorem (EVT).** If $f$ is continuous on a closed, bounded interval $[a, b]$, then there are points $x_{\min}$ and $x_{\max}$ in $[a, b]$ with
$$f(x_{\min}) \le f(x) \le f(x_{\max}) \quad \text{for every } x \text{ in } [a, b].$$
The theorem guarantees that a maximum and a minimum exist; it does not say where. To find them, compare $f$ at the endpoints and at the points inside where $f'(x) = 0$ or $f'$ does not exist (C109). The proof uses AN02 again: take points $x_n$ whose values approach the supremum of $f$ (or grow without limit, if $f$ were unbounded). A subsequence converges (the Bolzano–Weierstrass theorem, a consequence of completeness) to some $c$, which lies in $[a, b]$ because the interval is closed. Continuity makes the values along the subsequence tend to $f(c)$, so the supremum is finite and equals $f(c)$.

**Each hypothesis matters.** Drop any one and the conclusion can fail:
- *Not closed:* $f(x) = 1/x$ on $(0, 1]$ is continuous but has no maximum; it grows without limit as $x \to 0^+$.
- *Not bounded:* $f(x) = x/(1 + x)$ on $[0, \infty)$ is continuous with values approaching 1, but it never reaches 1, so it has no maximum.
- *Not continuous:* $f(x) = x$ for $0 \le x < 1$ and $f(1) = 0$ on $[0, 1]$ gets as close to 1 as you like but never reaches it.
- *IVT across a jump:* $f(x) = -1$ for $x < 0$ and $f(x) = 1$ for $x \ge 0$ changes sign on $[-1, 1]$ but is never 0.

**A consumer's best bundle exists.** With two goods, prices $p_1, p_2 > 0$ and income $m$, a consumer who spends all income chooses $x_1$ in $[0, m/p_1]$ and buys $x_2 = (m - p_1 x_1)/p_2$. If utility $u$ is continuous, the composition $V(x_1) = u\big(x_1, (m - p_1 x_1)/p_2\big)$ is continuous on a closed, bounded interval, so by the EVT a utility-maximising bundle exists. AN04 extends this argument to budget sets in many dimensions.

## Interactive
::widget{id="epsilon-delta-square"}

The curve is $f(x) = x^2$. Move the first slider to set $\varepsilon$: the gold band is $f(a) \pm \varepsilon$. The second slider moves the point $a$, and the third chooses your $\delta$; the hollow points sit at $x = a \pm \delta$. The green band is the largest $\delta$ that works, $\sqrt{a^2 + \varepsilon} - a$. The panel shows this largest $\delta$, the worst gap $|x^2 - a^2|$ for your $\delta$ (it approaches $2a\delta + \delta^2$), and whether your $\delta$ works. Check: at the start, $\varepsilon = 1$, $a = 2$ and $\delta = 0.2$ (the δ from the proof in the formulas above), the panel shows 0.236, 0.84 and yes. Set $\delta$ to 0.25: the worst gap becomes 1.063 and the panel says no. Put $\delta$ back and move $a$ to 3: with the same $\varepsilon$ the largest $\delta$ drops to 0.162, because the curve is steeper there.

## Worked examples

### Example 1 (easy): how precise must output be?
A firm's total cost is $C(q) = 500 + 4q$ and it plans to produce $q_0 = 50$ units. Its production line cannot hit 50 exactly. Find the largest $\delta$ such that every output with $|q - 50| < \delta$ keeps the cost within $\varepsilon = 0.6$ of $C(50)$. Then show that $C$ is continuous at 50.

1. $C(50) = 500 + 4 \cdot 50 = 700$, and $|C(q) - 700| = |4q - 200| = 4\,|q - 50|$
   *Why:* the fixed cost 500 cancels, so the cost gap is the unit cost times the output gap.
2. $4\,|q - 50| < 0.6 \iff |q - 50| < \dfrac{0.6}{4} = 0.15$
   *Why:* dividing both sides by the positive number 4 turns the condition on cost into a condition on output.
3. $\delta = 0.15$ is the largest: with $\delta = 0.2$ the output $q = 50.18$ is allowed, but $C(50.18) = 700.72$ misses 700 by $0.72 > 0.6$
   *Why:* every output closer than 0.15 works (for example $C(50.1) = 700.4$, within 0.4), and any wider window contains outputs whose cost gap is 0.6 or more.
4. For any $\varepsilon > 0$ take $\delta = \varepsilon/4$: then $|q - 50| < \delta \Rightarrow |C(q) - C(50)| = 4|q - 50| < \varepsilon$
   *Why:* the definition needs a working $\delta$ for every $\varepsilon$, not just for 0.6. The same argument works at every point, so $C$ is continuous everywhere.

```verify
F = 500; c = 4; q0 = 50; eps = 0.6
C0 = F + c*q0
assert C0 == 700
delta = eps/c
assert abs(delta - 0.15) < 1e-12
assert abs((F + c*50.1) - 700.4) < 1e-9
assert abs((F + c*50.18) - 700.72) < 1e-9
assert abs((F + c*50.18) - C0) > eps
# just inside the window the gap is below eps; at the edge it equals eps
assert c*0.1499 < eps
assert abs(c*0.15 - eps) < 1e-12
# the common wrong answers
assert abs(eps*c - 2.4) < 1e-12
assert abs(eps/2 - 0.3) < 1e-12
```

### Example 2 (medium): a bakery with a capacity limit
A bakery earns profit $\pi(q) = -2q^2 + 240q - 1500$ from $q$ trays of bread a day, but its oven can bake at most 50 trays, so $0 \le q \le 50$. Explain why a best output exists, find the largest profit, and say what changes if the limit were "fewer than 50 trays".

1. $\pi$ is a polynomial, so it is continuous on $[0, 50]$, which is closed and bounded; by the extreme value theorem $\pi$ has a maximum there
   *Why:* existence first: the theorem guarantees there is a best output before we look for it.
2. $\pi'(q) = 240 - 4q = 0 \Rightarrow q = 60 > 50$
   *Why:* the only flat point of the profit curve lies beyond capacity, so it is not a candidate.
3. $\pi'(q) \ge \pi'(50) = 40 > 0$ for $0 \le q \le 50$
   *Why:* $\pi'$ falls as $q$ rises and is still positive at capacity, so profit rises across the whole interval.
4. $\pi(0) = -1500$, $\quad \pi(50) = -5000 + 12{,}000 - 1500 = 5500$: the best output is $q = 50$ and the largest profit is 5500
   *Why:* with no candidate inside, the maximum is at an endpoint. Without the limit the bakery would produce 60 trays and earn $\pi(60) = 5700$, but that output is not available.
5. With $0 \le q < 50$ there is no best output: $\pi(49.9) = 5495.98$ and $\pi(49.99) = 5499.5998$ creep towards 5500, which is never reached
   *Why:* the interval is no longer closed, so the EVT no longer applies, and indeed no maximum exists. For any output below 50 a slightly larger one earns more.

```verify
a = 2; b = 240; F = 1500; K = 50
p0 = -F
pK = -a*K^2 + b*K - F
assert p0 == -1500
assert pK == 5500
qs = b/(2*a)
assert qs == 60
assert -a*qs^2 + b*qs - F == 5700
assert b - 2*a*K == 40
# grid search over [0, 50]: the largest value is at q = 50
q = 0:0.5:50
vals = -a*q.^2 + b*q - F
assert max(vals) == 5500
assert min(vals) == -1500
assert abs((-a*49.9^2 + b*49.9 - F) - 5495.98) < 1e-6
assert abs((-a*49.99^2 + b*49.99 - F) - 5499.5998) < 1e-6
```

### Example 3 (hard): bisection for an equilibrium price
Buyers spend 800 on a good whatever its price, so demand is $D(p) = 800/p$; supply is $S(p) = 3p + 20$. Show that an equilibrium price exists between 8 and 16, run 3 steps of bisection on $[8, 16]$, and report the midpoint of the final interval. How close is it guaranteed to be?

1. $Z(p) = \dfrac{800}{p} - (3p + 20)$: $\;Z(8) = 100 - 44 = 56 > 0$, $\;Z(16) = 50 - 68 = -18 < 0$
   *Why:* $Z$ is continuous for $p > 0$ and changes sign on $[8, 16]$, so by the IVT there is a price $p^*$ in between with $Z(p^*) = 0$.
2. Step 1: $Z(12) = 66.67 - 56 = 10.67 > 0$, keep $[12, 16]$
   *Why:* at 12 buyers still want more than sellers offer, so the price is too low and the sign change lies to the right.
3. Step 2: $Z(14) = 57.14 - 62 = -4.86 < 0$, keep $[12, 14]$
   *Why:* at 14 there is excess supply, so the price is too high and the sign change lies to the left.
4. Step 3: $Z(13) = 61.54 - 59 = 2.54 > 0$, keep $[13, 14]$; the estimate is $\dfrac{13 + 14}{2} = 13.5$
   *Why:* the equilibrium lies in $[13, 14]$, so its midpoint is within half the width, $8/2^4 = 0.5$, of $p^*$.
5. Check: $3p^2 + 20p - 800 = 0$ gives $p^* = 40/3 \approx 13.33$, and $|13.5 - 13.33| = 0.17 \le 0.5$. The equilibrium is unique, because $800/p$ falls and $3p + 20$ rises, so $Z$ is strictly decreasing
   *Why:* here an exact solution exists to compare with; bisection needs only the signs of $Z$, so it also works when no formula exists. The IVT alone gives existence, not uniqueness.

Stopping one step early gives the last midpoint tested, 13; keeping the wrong half each time drifts away to $[8, 9]$ and the estimate 8.5.

```verify
Z(p) = 800/p - (3*p + 20)
assert Z(8) == 56
assert Z(16) == -18
assert abs(Z(12) - 10.67) < 0.005
assert abs(Z(14) - (-4.86)) < 0.005
assert abs(Z(13) - 2.54) < 0.005
assert abs(800/12 - 66.67) < 0.005
assert abs(800/14 - 57.14) < 0.005
assert abs(800/13 - 61.54) < 0.005
est = (13 + 14)/2
assert est == 13.5
assert 8/2^4 == 0.5
r = (-20 + sqrt(20^2 + 4*3*800))/(2*3)
assert abs(r - 40/3) < 1e-12
assert abs(Z(r)) < 1e-9
assert abs(est - r) <= 0.5
assert abs(abs(est - r) - 0.17) < 0.005
# the wrong rule keeps the left half whenever Z(m) > 0: Z(12), Z(10), Z(9) are all positive
assert Z(10) > 0 and Z(9) > 0
```

## Common mistakes
- Multiplying $\varepsilon$ by the slope instead of dividing by it (MULTIPLIED_BY_SLOPE).
- Taking $\delta = \varepsilon$ whatever the slope (IGNORED_SLOPE).
- Halving $\varepsilon$ for a single function, where the whole tolerance is available (HALVED_EPSILON).
- Dividing by a negative slope and reporting a negative $\delta$ (NEGATIVE_DELTA).
- Choosing a $\delta$ that depends on $x$, such as $\delta = \varepsilon/|x + a|$; $\delta$ must be fixed before $x$ is chosen (DELTA_USES_X).
- Reporting the profit at the unconstrained peak, an output the firm cannot produce (IGNORED_CAPACITY).
- Picking the left endpoint, where profit is lowest, instead of the right one (WRONG_ENDPOINT).
- Giving the best output $q$ when the question asks for the largest profit (QUANTITY_NOT_PROFIT).
- Stopping bisection one step early and reporting the last midpoint tested (ONE_STEP_SHORT).
- Reporting an end of the final interval instead of its midpoint (ENDPOINT_NOT_MIDPOINT).
- Keeping the half on which excess demand does not change sign (WRONG_HALF).
- Giving the exact solution when the question asks what bisection reports (EXACT_ROOT).
- Applying the intermediate value theorem to a rule with a jump, such as a benefit that stops at an income threshold (JUMP_IVT).
- Concluding that the equilibrium is unique from the intermediate value theorem alone (IVT_UNIQUE).
- Arguing "the interval is open, so there is no maximum": the theorem's hypotheses are sufficient, not necessary (THEOREM_CONVERSE).

## Practice
- `epsilon-delta-linear` (difficulty 1): the largest $\delta$ that works for a given $\varepsilon$ when cost, demand or tax is a straight line; distractors MULTIPLIED_BY_SLOPE, IGNORED_SLOPE, HALVED_EPSILON, NEGATIVE_DELTA.
- `capacity-profit-maximum` (difficulty 2): the largest profit on $[0, K]$ when the unconstrained peak lies beyond capacity, with the extreme value theorem as the reason a maximum exists; distractors IGNORED_CAPACITY, WRONG_ENDPOINT, QUANTITY_NOT_PROFIT.
- `bisection-equilibrium-midpoint` (difficulty 3): the bisection estimate of an equilibrium price after 2 or 3 steps on excess demand $A/p - (sp + t)$; distractors ONE_STEP_SHORT, ENDPOINT_NOT_MIDPOINT, WRONG_HALF, EXACT_ROOT.

## Real world
- General equilibrium: the existence of prices that clear all markets at once, proved by Arrow and Debreu in 1954, extends the one-market IVT argument to many markets with fixed-point theorems (see AN05). Continuity of excess demand is a key assumption.
- Consumer theory: demand functions are defined as the best bundle at each set of prices and income. They exist because utility is continuous and the budget set is closed and bounded, the EVT in many dimensions (see AN04 and MV10).
- Capacity limits: power stations, airlines and factories often find their best output at full capacity, a corner solution like Example 2. Kuhn–Tucker conditions (see OP01) handle such limits with several goods.
- Computation: finance software finds internal rates of return and bond yields (see FM06 and FM07), and economic models find market-clearing prices, with bisection or methods that fall back on it. Bisection is slow but never fails when the function is continuous and changes sign (see NM01).

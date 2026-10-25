---
id: AN05
title: Fixed-point theorems and existence of equilibrium
block: AN
coreYear: 4
prerequisites: [AN04]
estMinutes: 50
status: draft
economicUses:
  - Existence of a Nash equilibrium in every finite game
  - Existence of prices that clear all markets at once
  - Convergence of value function iteration and best-response dynamics
  - Long-run levels of capital and prices under adjustment rules
searchTerms:
  - "Brouwer fixed-point theorem"
  - "Kakutani fixed-point theorem"
  - "Existence of equilibrium"
generators: [linear-contraction-fixed-point, banach-iterations-needed, cournot-best-response-fixed-point]
widgets: [fixed-point-staircase]
mistakeCodes:
  INTERCEPT_ONLY:
    label: Gave the intercept as the fixed point
    explanation: The intercept a is f(0), the next value when the current one is 0, not the value the rule settles at. Set x* = a + kx* and solve, which gives x* = a/(1 − k).
  SIGN_OF_K:
    label: Divided by 1 + k instead of 1 − k
    explanation: Moving kx* to the left of x* = a + kx* gives x*(1 − k) = a. With a negative k this makes the divisor larger than 1, for example 1 − (−0.5) = 1.5.
  ONE_ITERATION:
    label: Gave the first step of the iteration
    explanation: f(x₀) is only where the first step from the start lands. The fixed point is where the iteration settles, the value that f leaves unchanged.
  DIVIDED_BY_K:
    label: Divided by k instead of 1 − k
    explanation: The fixed point of x ↦ a + kx is a/(1 − k). For capital that loses a share δ each year this is investment divided by δ, not by 1 − δ.
  ROUNDED_DOWN:
    label: Rounded the number of rounds down
    explanation: The bound needs n ≥ ln(target)/ln k, so a value such as 78.72 means 79 rounds. With one round fewer the guaranteed error is still above ε.
  FORGOT_FACTOR:
    label: Left out the factor 1/(1 − k)
    explanation: kⁿ·|x₁ − x₀| bounds only the size of the next step. All the later steps still to come add up to a geometric series, which gives the bound kⁿ/(1 − k)·|x₁ − x₀|.
  IGNORED_FIRST_STEP:
    label: Left out the size of the first step
    explanation: The Banach bound is proportional to the first step, kⁿ/(1 − k)·|x₁ − x₀|. Dropping |x₁ − x₀| treats that step as if it had size 1.
  BEST_RESPONSE_TO_ZERO:
    label: Gave the best response to zero output
    explanation: (A − c₁)/(2b) is firm 1's output when the rival produces nothing, the monopoly output. In equilibrium the rival produces too, so solve for the fixed point of the composite best-response map.
  IGNORED_RIVAL_COST:
    label: Used the equal-cost formula
    explanation: (A − c)/(3b) holds only when both firms have the same cost. With different costs q₁* = (A − 2c₁ + c₂)/(3b), so a rival with a higher cost leaves more of the market to firm 1.
  OTHER_FIRM:
    label: Gave the other firm's output
    explanation: The question asks for firm 1's output. Match each cost to its firm; in equilibrium the firm with the lower cost produces more.
  BROUWER_UNIQUE:
    label: Read Brouwer as giving one fixed point
    explanation: Brouwer's theorem only says that at least one fixed point exists. There may be several, and repeating f need not reach any of them; uniqueness and convergence need more, such as a contraction.
  NOT_INTO_ITSELF:
    label: Did not check that f maps the set into itself
    explanation: Brouwer needs f(x) to lie in the same set for every x in it. f(x) = x + 1 on [0, 1] is continuous but sends 1 to 2, and it has no fixed point.
  HOLE_IN_SET:
    label: Applied Brouwer to a set with a hole
    explanation: A ring is closed and bounded but not convex, and turning it by 90° moves every point. Brouwer needs a convex set.
  WEAK_CONTRACTION:
    label: Accepted shrinking without a fixed k < 1
    explanation: Knowing only that |f(x) − f(y)| < |x − y| is not enough. f(x) = x + 1/x on [1, ∞) satisfies it and maps the set into itself but has no fixed point; Banach needs one k < 1 that works for every pair.
resources:
  - { title: "Calculus Volume 1, 4.9 Newton's Method, iterative processes (OpenStax)", url: "https://openstax.org/books/calculus-volume-1/pages/4-9-newtons-method", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Game Theory, 14.126, lecture notes including fixed-point theorems (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/14-126-game-theory-spring-2016/pages/lecture-notes/", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
An equilibrium is a situation in which everyone's plans fit together: prices at which every market clears at once, or strategies that are each a best reply to the others. Before saying anything about an equilibrium (how it reacts to a tax, whether it is efficient) a theorist must know that one exists; otherwise the analysis describes nothing. In a model with many goods or many players there is usually no formula to solve, so existence is proved another way. The equilibrium is written as a **fixed point**, a point $x^*$ with $f(x^*) = x^*$, of a suitable map, and a fixed-point theorem does the rest. John Nash proved in 1950 that every finite game has an equilibrium this way, and Arrow and Debreu did the same for competitive markets in 1954. Fixed points matter in practice too: value function iteration, best-response dynamics and price-adjustment algorithms all repeat a map until it stops changing, and the contraction mapping theorem says when that works and how many rounds it needs.

## Intuition
Draw the graph of $f$ together with the 45° line $y = x$. A fixed point is a point where the two meet, since there the output equals the input. Suppose $f$ maps an interval $[a, b]$ into itself. At the left end the graph cannot lie below the 45° line, because $f(a) \ge a$; at the right end it cannot lie above it, because $f(b) \le b$. A graph drawn without lifting the pen must cross the line somewhere in between. That is Brouwer's theorem in one dimension, and it is the intermediate value theorem (AN03) in disguise.

Now repeat the map: start at $x_0$, compute $x_1 = f(x_0)$, then $x_2 = f(x_1)$, and so on. If $f$ pulls every two points closer together by at least a fixed factor $k < 1$, the gaps shrink like a geometric sequence and the guesses close in on a single point. A picture helps. A tourist map of a park, laid flat on the ground inside the park, is a shrunken copy of the park, so exactly one point of the map lies directly over the place it shows: that is Banach's theorem. Crumple the map and drop it inside the park, and there is still at least one such point (Brouwer), but there may be several, and nothing tells you how to find them.

## Definition and formulas
**Fixed point.** A point $x^*$ is a fixed point of $f$ if $f(x^*) = x^*$. Equivalently, $x^*$ is a zero of $g(x) = f(x) - x$. For the price rule $f(p) = 6 - 0.5p$ the fixed point solves $p^* = 6 - 0.5p^*$, so $p^* = 4$.

**Brouwer's theorem in one dimension.** If $f$ is continuous and maps $[a, b]$ into $[a, b]$, then $f$ has a fixed point in $[a, b]$.
*Proof.* Let $g(x) = f(x) - x$. Since $f(a) \ge a$ and $f(b) \le b$, we have $g(a) \ge 0 \ge g(b)$. The function $g$ is continuous, so by the intermediate value theorem $g(c) = 0$ for some $c$ in $[a, b]$, that is, $f(c) = c$.

**Brouwer's fixed-point theorem.** Let $K \subset \mathbb{R}^n$ be non-empty, compact (closed and bounded, AN04) and convex (MV06). Then every continuous map $f: K \to K$ has a fixed point $x^* = f(x^*)$ in $K$. The theorem proves existence only. It says nothing about how many fixed points there are or how to find one.

**Each condition matters.** Drop one and a fixed point can fail to exist:
- *Not bounded:* $f(x) = x + 1$ on $\mathbb{R}$ is continuous, but $x + 1 \ne x$ for every $x$.
- *Not closed:* $f(x) = x/2$ on $(0, 1]$ maps the set into itself, but the only solution of $x/2 = x$ is $x = 0$, which is missing from the set.
- *Not convex:* on a ring in the plane, such as all points at distance between 1 and 2 from the origin, a turn by 90° about the origin moves every point. The point it would leave fixed, the centre, lies in the hole.
- *Not continuous:* on $[0, 1]$ let $f(x) = 1$ for $x < \tfrac12$ and $f(x) = 0$ for $x \ge \tfrac12$. The graph jumps over the 45° line: $f(x) = x$ would need $x = 1 < \tfrac12$ or $x = 0 \ge \tfrac12$, both impossible.
- *Not into itself:* $f(x) = x + 1$ on $[0, 1]$ is continuous on a compact convex set, but it sends 1 to 2, outside the set, and has no fixed point.

**Contractions.** A map $f$ from a set $X$ into itself is a **contraction** with modulus $k$ if there is a single number $0 \le k < 1$ with
$$|f(x) - f(y)| \le k\,|x - y| \quad \text{for all } x, y \text{ in } X.$$
For a straight line $f(x) = a + kx$ this holds with modulus $|k|$, so it is a contraction exactly when $|k| < 1$. More generally, if $f$ maps an interval into itself and $|f'(x)| \le k < 1$ throughout it, the mean value theorem gives $|f(x) - f(y)| = |f'(\xi)|\,|x - y| \le k|x - y|$, so $f$ is a contraction.

**Banach's fixed-point theorem (contraction mapping theorem).** Let $X$ be a non-empty closed subset of $\mathbb{R}^n$ and $f: X \to X$ a contraction with modulus $k < 1$. Then:
1. $f$ has exactly one fixed point $x^*$;
2. from any starting point $x_0$, the sequence $x_{n+1} = f(x_n)$ converges to $x^*$;
3. the error after $n$ rounds obeys
$$|x_n - x^*| \le k^n\,|x_0 - x^*| \qquad \text{and} \qquad |x_n - x^*| \le \frac{k^n}{1 - k}\,|x_1 - x_0|.$$
The second bound uses only the first step, so it tells you in advance how many rounds are enough.
*Why it is true.* Uniqueness: if $x^*$ and $y^*$ were both fixed, $|x^* - y^*| = |f(x^*) - f(y^*)| \le k|x^* - y^*|$, which forces $|x^* - y^*| = 0$ because $k < 1$. Convergence: each step is at most $k$ times the one before, so $|x_{n+1} - x_n| \le k^n |x_1 - x_0|$. All the steps after round $n$ together cover at most $(k^n + k^{n+1} + \dots)\,|x_1 - x_0| = \frac{k^n}{1 - k}|x_1 - x_0|$, a geometric series (F08). This shrinks to 0, so by completeness (AN02) the sequence converges, to a point of $X$ because $X$ is closed. Continuity of $f$ then gives $f(x^*) = x^*$.

**Linear rules.** For $f(x) = a + kx$ with $|k| < 1$,
$$x^* = \frac{a}{1 - k}, \qquad x_n - x^* = k^n\,(x_0 - x^*).$$
With $k > 0$ the iterates approach $x^*$ from one side; with $k < 0$ they jump from one side to the other, as in the cobweb model (DY01). For capital that receives investment $I$ each year and loses a share $\delta$ of its value, $K_{t+1} = I + (1 - \delta)K_t$ and $K^* = I/\delta$. Stability of steady states (DY06) is the same idea applied near a single point.

**The modulus must be a fixed number below 1.** The map $f(x) = x + 1/x$ on $[1, \infty)$ sends the set into itself, and for $x \ne y$ in it $|f(x) - f(y)| = |x - y|\,\bigl(1 - \tfrac{1}{xy}\bigr) < |x - y|$. Yet it has no fixed point, because $1/x \ne 0$. The shrinking factor $1 - 1/(xy)$ creeps up towards 1 for large $x$ and $y$, so no single $k < 1$ works.

**Brouwer and Banach compared.**
$$\begin{array}{lll} & \text{Brouwer} & \text{Banach} \\ \hline \text{Set} & \text{non-empty, compact, convex} & \text{closed (complete)} \\ \text{Map} & \text{continuous, into itself} & \text{contraction, into itself} \\ \text{Gives} & \text{at least one fixed point} & \text{exactly one fixed point} \\ \text{Finds it?} & \text{no} & \text{yes: iterate from any start} \end{array}$$

**Correspondences and Kakutani's theorem.** A **correspondence** $F$ assigns to each point $x$ a *set* $F(x)$; a fixed point is an $x^*$ with $x^* \in F(x^*)$. Best replies are correspondences because a player can be indifferent between several strategies. Kakutani's theorem (1941), in words: if $K$ is a non-empty, compact, convex subset of $\mathbb{R}^n$, every $F(x)$ is a non-empty convex subset of $K$, and the graph of $F$ is closed (whenever $x_n \to x$, $y_n \in F(x_n)$ and $y_n \to y$, then $y \in F(x)$), then $F$ has a fixed point. When every $F(x)$ is a single point this is Brouwer's theorem.

**Existence of Nash equilibrium.** In a finite game a mixed strategy (GT02) is a list of probabilities that are non-negative and add up to 1, which is a compact convex set, and so is the set of all strategy profiles. Let $B(\sigma)$ be the set of profiles in which each player plays a best reply to the others' strategies in $\sigma$. A best reply exists because expected payoff is continuous on a compact set (AN03, AN04). The set of best replies is convex because expected payoff is linear in a player's own probabilities, so any mixture of best replies is again a best reply. The graph of $B$ is closed because payoffs are continuous. Kakutani's theorem gives a profile $\sigma^*$ in $B(\sigma^*)$: every player is already best-replying to the others, which is exactly a Nash equilibrium (GT01). This was Nash's 1950 argument; a year later he gave a second proof using Brouwer's theorem.

**Existence of competitive equilibrium (in words).** With $n$ goods only relative prices matter, so prices can be scaled to lie on the **price simplex** $\Delta = \{p : p_i \ge 0,\ p_1 + \dots + p_n = 1\}$, a compact convex set. Let $z(p)$ be the excess demand of the economy, continuous and obeying Walras' law $p \cdot z(p) = 0$ (the value of what households want to buy equals the value of what they sell). A price-adjustment map raises the prices of goods in excess demand and rescales:
$$T(p)_i = \frac{p_i + \max\{0, z_i(p)\}}{1 + \sum_j \max\{0, z_j(p)\}}.$$
$T$ is continuous and maps $\Delta$ into itself, so Brouwer gives $p^* = T(p^*)$. At that point $p^*_i \sum_j \max\{0, z_j\} = \max\{0, z_i\}$ for every $i$. Multiply by $z_i$, add up and use Walras' law: $\sum_i z_i \max\{0, z_i\} = 0$, a sum of squares of the positive excess demands, so no good is in excess demand. Walras' law then forces the price of any good in excess supply to be 0, so every market clears (allowing free disposal of unwanted goods). This is the core of the Arrow–Debreu existence proof.

**Value function iteration is a contraction (DO03).** The Bellman map takes a guess $V$ and returns $(TV)(x) = \max_c \{u(c) + \beta V(x')\}$. If two guesses differ by at most $d$ everywhere, every option's value differs by at most $\beta d$, and so do the maxima. So $T$ is a contraction with modulus $\beta$, using the largest gap between two functions as the distance. Banach's theorem then gives exactly one value function, convergence from any first guess, and the bound $\frac{\beta^n}{1 - \beta}\max_x |V_1(x) - V_0(x)|$ on the error after $n$ rounds.

## Interactive
::widget{id="fixed-point-staircase"}

The lilac line is $f(x) = a + kx$ and the dashed line is $y = x$. Use the three sliders to set the slope $k$, the intercept $a$ and the start $x_0$; the gold staircase goes up (or down) to the graph to find $f(x_0)$, then across to the 45° line to use it as the next input. The panel shows the fixed point, whether $f$ is a contraction, and $x_{10}$, the value after 10 steps. Check: at the start, $k = -0.5$, $a = 6$ and $x_0 = 1$ (Example 1), the panel shows 4, yes and 3.997, and the staircase spirals in. Now set $k = -1$ and $a = 10$ and put $x_0$ at 2: $f(x) = 10 - x$ still maps $[0, 10]$ into itself, so Brouwer still guarantees the fixed point 5, but the staircase goes round the same square for ever and $x_{10}$ is back at 2. Existence does not mean convergence. Finally set $k = 1.2$, $a = 2$ and $x_0 = 1$: the fixed point is $-10$, off the graph, and the staircase runs away ($x_{10} = 58.109$).

## Worked examples

### Example 1 (easy): a price rule that settles
In a fish market next week's price per kilogram follows the rule $p_{t+1} = f(p_t) = 6 - 0.5\,p_t$. This week's price is $p_0 = 1$. Show that a long-run price exists and is unique, find it, and check how fast the prices approach it.

1. $f(0) = 6$, $\;f(6) = 3$, so $f$ maps $[0, 6]$ into $[3, 6] \subset [0, 6]$
   *Why:* $f$ is continuous and decreasing, so its values on $[0, 6]$ lie between $f(6)$ and $f(0)$. By Brouwer's theorem in one dimension a fixed point exists in $[0, 6]$.
2. $|f(p) - f(q)| = 0.5\,|p - q|$, a contraction with $k = 0.5$
   *Why:* the constant 6 cancels. With $k < 1$ Banach's theorem adds that the fixed point is unique and that the prices converge to it from any start.
3. $p^* = 6 - 0.5\,p^* \Rightarrow 1.5\,p^* = 6 \Rightarrow p^* = 4$
   *Why:* the long-run price is the one the rule leaves unchanged.
4. $p_1 = 5.5$, $\;p_2 = 3.25$, $\;p_3 = 4.375$; the gaps to 4 are 3, 1.5, 0.75, 0.375
   *Why:* each step halves the gap, and the negative slope puts the price on alternate sides of 4, like a cobweb.
5. Bound: $|p_3 - 4| \le \dfrac{0.5^3}{1 - 0.5}\,|p_1 - p_0| = \dfrac{0.125}{0.5} \times 4.5 = 1.125$; the true gap is 0.375
   *Why:* the Banach bound uses only the first step, so it is known before iterating; it is safe but can be generous.

Typical wrong answers are 6 (the intercept), 12 (dividing 6 by $1 + k = 0.5$ instead of by $1 - k = 1.5$) and 5.5 (stopping after one step).

```verify
f(p) = 6 - 0.5*p
assert f(0) == 6
assert f(6) == 3
pstar = 6/(1 - (-0.5))
assert pstar == 4
assert f(pstar) == pstar
p1 = f(1)
p2 = f(p1)
p3 = f(p2)
assert p1 == 5.5
assert p2 == 3.25
assert p3 == 4.375
assert abs(1 - 4) == 3 and abs(p1 - 4) == 1.5 and abs(p2 - 4) == 0.75 and abs(p3 - 4) == 0.375
bound = 0.5^3/(1 - 0.5)*abs(p1 - 1)
assert bound == 1.125
assert abs(p3 - pstar) <= bound
# wrong answers
assert 6/(1 + (-0.5)) == 12
```

### Example 2 (medium): how many rounds of value function iteration?
A household's saving problem is solved by value function iteration with discount factor $\beta = 0.9$. Starting from the guess $V_0 = 0$, the first round gives $V_1$, and the largest gap between the two is $\max_x |V_1(x) - V_0(x)| = 20$. How many rounds guarantee that the value function is within 0.05 of the true one?

1. The Bellman map is a contraction with modulus $\beta = 0.9$
   *Why:* a change of at most $d$ in the guess changes every option's value, and so the maximum, by at most $0.9d$.
2. $\dfrac{0.9^n}{1 - 0.9} \times 20 \le 0.05 \iff 0.9^n \le \dfrac{0.05 \times 0.1}{20} = 0.00025$
   *Why:* this is the Banach bound $\frac{\beta^n}{1 - \beta}|V_1 - V_0|$; multiply both sides by $0.1/20$ to isolate $0.9^n$.
3. $n \ge \dfrac{\ln 0.00025}{\ln 0.9} = \dfrac{-8.294}{-0.1054} = 78.72$
   *Why:* taking logs turns the power into a product; $\ln 0.9 < 0$, so dividing by it flips the inequality.
4. $n = 79$: the bound is $0.0485 \le 0.05$, while after 78 rounds it is $0.0539 > 0.05$
   *Why:* the number of rounds is a whole number, so round up; one round fewer does not guarantee the accuracy.

Rounding down gives 78; leaving out the factor $1/(1 - \beta)$ gives 57; leaving out the first step of 20 gives 51. With a quarterly model, where $\beta$ is closer to 1, many more rounds are needed.

```verify
beta = 0.9
d = 20
tol = 0.05
target = tol*(1 - beta)/d
assert abs(target - 0.00025) < 1e-12
L = log(target)/log(beta)
assert abs(log(target) - (-8.294)) < 0.0005
assert abs(log(beta) - (-0.1054)) < 0.00005
assert abs(L - 78.72) < 0.005
n = ceil(L)
assert n == 79
assert beta^n/(1 - beta)*d <= tol
assert beta^(n - 1)/(1 - beta)*d > tol
assert abs(beta^n/(1 - beta)*d - 0.0485) < 0.00005
assert abs(beta^(n - 1)/(1 - beta)*d - 0.0539) < 0.00005
# wrong answers
assert ceil(log(tol/d)/log(beta)) == 57
assert ceil(log(tol*(1 - beta))/log(beta)) == 51
```

### Example 3 (hard): Nash equilibrium of a duopoly as a fixed point
Two firms sell the same good with inverse demand $P = 100 - (q_1 + q_2)$. Firm 1 has marginal cost 10 and firm 2 has marginal cost 16, with no fixed costs. Show that a Nash equilibrium exists, that it is unique, and find firm 1's output.

1. $BR_1(q_2) = \dfrac{90 - q_2}{2} = 45 - \tfrac12 q_2, \qquad BR_2(q_1) = \dfrac{84 - q_1}{2} = 42 - \tfrac12 q_1$
   *Why:* firm 1's profit $(100 - q_1 - q_2 - 10)\,q_1$ has derivative $90 - 2q_1 - q_2$, which is zero at the best reply; likewise for firm 2 with cost 16.
2. The map $(q_1, q_2) \mapsto (BR_1(q_2), BR_2(q_1))$ sends the rectangle $[0, 45] \times [0, 42]$ into $[24, 45] \times [19.5, 42]$
   *Why:* the rectangle is non-empty, compact and convex and the map is continuous, so by Brouwer's theorem it has a fixed point: a pair of outputs that are best replies to each other, a Nash equilibrium.
3. $g(q_1) = BR_1(BR_2(q_1)) = 45 - \tfrac12\bigl(42 - \tfrac12 q_1\bigr) = 24 + \tfrac14 q_1$
   *Why:* firm 2 replies to $q_1$, then firm 1 replies to that. The slopes $-\tfrac12$ multiply to $\tfrac14$, so $g$ is a contraction with $k = \tfrac14$ and the equilibrium is unique.
4. $q_1^* = \dfrac{24}{1 - \tfrac14} = 32, \qquad q_2^* = 42 - 16 = 26, \qquad P = 100 - 58 = 42$
   *Why:* check: $BR_1(26) = 45 - 13 = 32$, so each output is a best reply to the other. Profits are $(42 - 10) \times 32 = 1024$ and $(42 - 16) \times 26 = 676$.
5. Best-response dynamics from $q_1 = 0$: $24, 30, 31.5, 31.875$, with gaps $8, 2, 0.5, 0.125$ to 32
   *Why:* each round of replies cuts the gap to a quarter, the Banach rate $k^n$ with $k = \tfrac14$.

Typical wrong answers: 45 (firm 1's reply to zero output), 30 (the equal-cost formula $(100 - 10)/3$), 19.2 (dividing 24 by $1 + \tfrac14$) and 26 (firm 2's output).

```verify
A = 100
c1 = 10
c2 = 16
BR1(q) = (A - c1 - q)/2
BR2(q) = (A - c2 - q)/2
assert BR1(0) == 45 and BR1(42) == 24
assert BR2(0) == 42 and BR2(45) == 19.5
g(q) = BR1(BR2(q))
assert g(0) == 24
assert g(4) - g(0) == 1
q1 = 24/(1 - 1/4)
assert q1 == 32
assert abs(q1 - (A - 2*c1 + c2)/3) < 1e-12
assert g(q1) == q1
q2 = BR2(q1)
assert q2 == 26
assert BR1(q2) == q1
P = A - q1 - q2
assert P == 42
assert (P - c1)*q1 == 1024
assert (P - c2)*q2 == 676
assert g(24) == 30 and g(30) == 31.5 and g(31.5) == 31.875
assert 32 - 31.875 == 0.125
# wrong answers
assert (A - c1)/3 == 30
assert 24/(1 + 1/4) == 19.2
```

## Common mistakes
- Giving the intercept $a$ as the fixed point of $x \mapsto a + kx$ (INTERCEPT_ONLY).
- Solving $x^* = a + kx^*$ as $x^* = a/(1 + k)$, a sign slip that matters most when $k$ is negative (SIGN_OF_K).
- Reporting the first step $f(x_0)$ instead of the value the iteration settles at (ONE_ITERATION).
- Dividing by $k$ instead of $1 - k$, for example investment divided by $1 - \delta$ instead of by the depreciation rate $\delta$ (DIVIDED_BY_K).
- Rounding the number of rounds down, so the promised accuracy is not quite guaranteed (ROUNDED_DOWN).
- Using $k^n |x_1 - x_0|$ as the error bound, which forgets all the steps still to come (FORGOT_FACTOR).
- Leaving the size of the first step out of the Banach bound (IGNORED_FIRST_STEP).
- Giving a firm's best reply to zero output, the monopoly output, as its equilibrium output (BEST_RESPONSE_TO_ZERO).
- Using the equal-cost Cournot formula when the firms' costs differ (IGNORED_RIVAL_COST).
- Answering with the other firm's output (OTHER_FIRM).
- Concluding from Brouwer's theorem that the equilibrium is unique, or that iterating the map will find it (BROUWER_UNIQUE).
- Applying Brouwer's theorem without checking that $f$ sends every point of the set back into the set (NOT_INTO_ITSELF).
- Applying Brouwer's theorem to a set with a hole, such as a ring, which is not convex (HOLE_IN_SET).
- Calling a map a contraction because $|f(x) - f(y)| < |x - y|$, without one fixed $k < 1$ (WEAK_CONTRACTION).

## Practice
- `linear-contraction-fixed-point` (difficulty 1): the fixed point of a linear rule $x \mapsto a + kx$ with $|k| < 1$, a price-adjustment rule or capital with investment and depreciation; distractors INTERCEPT_ONLY, SIGN_OF_K, ONE_ITERATION, DIVIDED_BY_K.
- `banach-iterations-needed` (difficulty 2): the smallest number of rounds for which the Banach bound $\frac{k^n}{1 - k}|x_1 - x_0|$ is at most $\varepsilon$, for value function iteration or a price-finding algorithm; distractors ROUNDED_DOWN, FORGOT_FACTOR, IGNORED_FIRST_STEP.
- `cournot-best-response-fixed-point` (difficulty 3): firm 1's Nash output in a Cournot duopoly with unequal costs, as the fixed point of the composite best-response map (a contraction with $k = \tfrac14$); distractors BEST_RESPONSE_TO_ZERO, IGNORED_RIVAL_COST, SIGN_OF_K, OTHER_FIRM.

## Real world
- Game theory: Nash's 1950 existence proof, a fixed-point argument in a few lines, made the Nash equilibrium the standard solution concept of economics; Nash shared the 1994 Nobel prize with Harsanyi and Selten for this line of work. Every model of oligopoly, auctions or bargaining that "solves for the equilibrium" relies on it (see GT01 and GT02).
- General equilibrium: Arrow and Debreu (1954) proved that competitive prices clearing all markets exist using fixed-point theorems. Herbert Scarf later turned fixed-point arguments into algorithms, the starting point of computable general equilibrium models that governments and international organisations use to estimate the effects of tax and trade reforms.
- Macroeconomics: central bank and research models are often solved by value function iteration (see DO03). The contraction property guarantees convergence, but a quarterly discount factor of 0.99 shrinks the error by only 1 % a round, so cutting it by a factor of a million takes about 1375 rounds.
- Capital statistics: statistics offices estimate capital stocks with the perpetual inventory rule $K_{t+1} = I_t + (1 - \delta)K_t$. With steady investment the stock settles at $I/\delta$, the fixed point of the rule.

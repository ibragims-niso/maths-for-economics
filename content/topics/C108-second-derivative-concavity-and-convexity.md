---
id: C108
title: Second derivative, concavity and convexity
block: C1
coreYear: 1
prerequisites: [C103]
estMinutes: 45
status: draft
economicUses:
  - Diminishing marginal returns to labour, fertiliser or capital
  - "Cost curves: where marginal cost stops falling and starts rising"
  - Whether economic growth is speeding up or slowing down
  - "Risk attitudes: concave utility of money and the demand for insurance"
generators: [second-derivative-at-point, cubic-cost-inflection-output, peak-marginal-product]
widgets: [production-concavity]
mistakeCodes:
  FIRST_DERIVATIVE:
    label: Gave the first derivative, not the second
    explanation: The first derivative is the slope, for example marginal cost. The question asks how fast that slope changes, so differentiate a second time before putting in the number.
  POWER_ONCE:
    label: Forgot to bring a power down
    explanation: Each time you differentiate, multiply by the current power and lower it by one. So Q³ becomes 3Q² and then 6Q, and L^α becomes αL^(α−1) and then α(α−1)L^(α−2).
  SIGN:
    label: Lost a minus sign
    explanation: Keep the signs of the terms through both differentiations. A term −bQ² gives −2b in the second derivative, and for L^α with 0 < α < 1 the factor α − 1 is negative, so Q″ is negative.
  AVC_MINIMUM:
    label: Found where average variable cost is lowest
    explanation: Average variable cost a − bQ + cQ² is lowest at Q = b/(2c). The inflection point of the cost curve is where marginal cost is lowest, C″(Q) = −2b + 6cQ = 0, which gives the smaller output Q = b/(3c).
  LABOUR_NOT_MP:
    label: Gave the number of workers, not the marginal product
    explanation: Solving Q″(L) = 0 tells you where the marginal product peaks. The question asks for the marginal product itself, so put that L into Q′(L).
  OUTPUT_NOT_MP:
    label: Gave total output, not the marginal product
    explanation: Q(L) is the total output of all workers. The marginal product is the extra output of one more worker, Q′(L), evaluated at the same L.
  AVERAGE_NOT_MARGINAL:
    label: Gave the average product, not the marginal product
    explanation: Q(L)/L is output per worker, the average product. The marginal product is the slope Q′(L), the output added by the last worker.
resources:
  - { title: "Calculus Volume 1, 4.5 Derivatives and the Shape of a Graph (OpenStax)", url: "https://openstax.org/books/calculus-volume-1/pages/4-5-derivatives-and-the-shape-of-a-graph", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Principles of Economics 3e, 7.2 Production in the Short Run (OpenStax)", url: "https://openstax.org/books/principles-economics-3e/pages/7-2-production-in-the-short-run", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Principles of Economics 3e, 7.3 Costs in the Short Run (OpenStax)", url: "https://openstax.org/books/principles-economics-3e/pages/7-3-costs-in-the-short-run", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
A farmer adds a fifth worker to a field of fixed size. Output still rises, but by less than when the fourth worker joined. A finance ministry sees GDP still growing, but more slowly each quarter. Both statements are about how a rate of change is itself changing: the extra output per worker is falling, the growth rate is slowing. The second derivative measures exactly this. It tells economists whether returns are diminishing, where a firm's marginal cost stops falling and starts rising, and, later, whether a person dislikes risk.

## Intuition
The first derivative is a speed: how fast output, cost or GDP is rising. The second derivative is the acceleration: whether that speed is going up or down. A car can move forwards while braking; in the same way output can rise while its rate of increase falls.

On a graph the second derivative describes the bend of the curve. If the slope keeps falling as you move right, the curve bends downwards like the top of a hill (∩): it is **concave**. If the slope keeps rising, the curve bends upwards like a bowl (∪): it is **convex**. A quick picture test: join two points of the graph with a straight line, a chord. On a concave piece the chord lies below the curve; on a convex piece it lies above. The tangent line does the opposite: it lies above a concave curve and below a convex one.

A point where the bend switches from one kind to the other is an **inflection point**. There the slope stops rising and starts falling, or the other way round, so the slope is at its highest or lowest.

## Definition and formulas
**Second derivative.** Differentiate the derivative once more:
$$f''(x) = \frac{d}{dx}\,f'(x), \qquad \text{also written } \frac{d^2y}{dx^2}.$$
It is measured in units of $y$ per unit of $x$, per unit of $x$: for cost, the change in marginal cost per extra unit of output. Using the power rule of C103 twice:
$$\frac{d^2}{dx^2}\,x^n = n(n - 1)\,x^{n-2}.$$
For example, $f(x) = x^3$ gives $f'(x) = 3x^2$ and $f''(x) = 6x$; $f(x) = x^{1/2}$ gives $f'(x) = \tfrac12 x^{-1/2}$ and $f''(x) = -\tfrac14 x^{-3/2}$.

**Concave and convex.** On an interval:

- $f''(x) > 0$ everywhere: $f'$ is rising and $f$ is **convex** (bends upwards; chords lie above the graph, tangents below it).
- $f''(x) < 0$ everywhere: $f'$ is falling and $f$ is **concave** (bends downwards; chords lie below the graph, tangents above it).

The chord picture is the general definition. $f$ is concave when, for any two points $x_1, x_2$ of the interval and any $0 \le t \le 1$,
$$f\big(t x_1 + (1 - t)x_2\big) \ge t f(x_1) + (1 - t) f(x_2),$$
and convex when the inequality is reversed. A straight line, with $f'' = 0$, is both. Some books say "concave up" for convex and "concave down" for concave.

Concave does not mean falling. $\sqrt{x}$ rises for ever and is concave everywhere for $x > 0$: it rises more and more slowly.

**Inflection point.** A point where $f$ changes from concave to convex or back, that is, where $f''$ changes sign. At such a point $f''(x_0) = 0$ (when $f''$ exists), but $f''(x_0) = 0$ alone is not enough: $f(x) = x^4$ has $f''(0) = 0$, yet $f''(x) = 12x^2 \ge 0$ on both sides, so there is no change of bend. Always check the sign on each side.

**Diminishing marginal returns.** With output $Q(L)$ and $L$ units of labour, the marginal product of labour is $MP_L = Q'(L)$. Diminishing marginal returns means $MP_L$ falls as $L$ grows:
$$Q''(L) < 0 \iff Q \text{ is concave in } L.$$
For $Q = A L^{\alpha}$ with $A > 0$ and $0 < \alpha < 1$: $Q''(L) = A\,\alpha(\alpha - 1)\,L^{\alpha - 2} < 0$, because $\alpha - 1 < 0$. Many production functions are S-shaped instead: convex at first (each new worker adds more, thanks to teamwork and specialisation), then concave once the fixed equipment gets crowded. Diminishing returns set in at the inflection point, where $MP_L$ is highest (Example 3).

**The cubic cost function.** Short-run cost is often modelled as
$$C(Q) = F + aQ - bQ^2 + cQ^3, \qquad a, b, c > 0,\; b^2 < 3ac.$$
Then $MC = C'(Q) = a - 2bQ + 3cQ^2$ and
$$C''(Q) = -2b + 6cQ = MC'(Q).$$
The cost curve is concave while $Q < \dfrac{b}{3c}$ (marginal cost falling) and convex after it (marginal cost rising). The inflection point $Q = \dfrac{b}{3c}$ is where marginal cost is lowest, $MC = a - \dfrac{b^2}{3c}$; the condition $b^2 < 3ac$ keeps this positive.

**Utility of money (preview).** If utility $u(x)$ of money is concave, $u'' < 0$, each extra unit of money adds less satisfaction than the one before, so losing 100 hurts more than winning 100 pleases. Such a person prefers a sure amount to a gamble with the same average payoff: they are risk-averse. SP02 builds on this.

**Second-derivative test (preview).** At a point where $f'(x_0) = 0$ the graph is flat. If $f''(x_0) < 0$ the curve bends down there, so it is a peak; if $f''(x_0) > 0$ it is a trough. C109 uses this to find the best output, price or input.

## Interactive
::widget{id="production-concavity"}

Move the **Workers L** slider along the S-shaped production curve $Q(L) = 6L^2 - 0.1L^3$ from Example 3. The curve is green where it is convex and lilac where it is concave; the hollow dot marks the inflection point. The gold line is the tangent at the point, and the panel shows its slope, the **Marginal product Q′(L)**, together with **Q″(L)** and the **Shape**. Notice that the tangent lies below the curve on the green part and above it on the lilac part. Check: at $L = 10$ the panel shows a marginal product of 90 and $Q'' = 6$ (convex); at $L = 30$ the marginal product is again 90, but $Q'' = -6$ (concave); at $L = 20$, $Q'' = 0$ and the marginal product reaches its highest value, 120. At $L = 40$ the marginal product has fallen to 0.

## Worked examples

### Example 1 (easy): diminishing returns on a farm
A farm's output, in tonnes, with $L$ workers is $Q(L) = 40\sqrt{L}$. Find the marginal product of labour and the second derivative at $L = 4$, and say what they mean.

1. $Q(L) = 40L^{1/2}$, so $Q'(L) = 20L^{-1/2}$ and $Q'(4) = \dfrac{20}{2} = 10$
   *Why:* write the root as a power and use the power rule; $Q'$ is the marginal product, about 10 extra tonnes from one more worker.
2. $Q''(L) = 20 \cdot \left(-\tfrac12\right) L^{-3/2} = -10L^{-3/2}$
   *Why:* differentiate again, bringing down the new power $-\tfrac12$.
3. $Q''(4) = \dfrac{-10}{4^{3/2}} = \dfrac{-10}{8} = -1.25$
   *Why:* $4^{3/2} = (\sqrt4)^3 = 8$.
4. The marginal product is falling by about 1.25 tonnes per extra worker, so the farm has diminishing marginal returns. Check: $Q'(5) = \dfrac{20}{\sqrt5} \approx 8.94$, which is $1.06$ below 10.
   *Why:* the actual fall is a little smaller than 1.25 because $Q''$ itself moves towards 0 as $L$ grows; the curve flattens more and more slowly.

```verify
A = 40; L = 4
Q(x) = A*sqrt(x)
MP(x) = A*0.5*x^(-0.5)
Q2(x) = A*0.5*(-0.5)*x^(-1.5)
assert Q(L) == 80
assert MP(L) == 10
assert Q2(L) == -1.25
# Second difference of Q itself, without any derivative rule.
h = 0.001
assert abs((Q(L + h) - 2*Q(L) + Q(L - h))/h^2 - (-1.25)) < 0.0001
assert abs(MP(5) - 8.944) < 0.001
assert abs((MP(5) - MP(4)) - (-1.056)) < 0.001
```

### Example 2 (medium): where marginal cost is lowest
A firm's total cost is $C(Q) = 200 + 36Q - 3Q^2 + 0.1Q^3$. Where is the cost curve concave and where convex? Find the inflection point and show that marginal cost is lowest there.

1. $MC = C'(Q) = 36 - 6Q + 0.3Q^2$
   *Why:* differentiate each term; the fixed cost 200 disappears.
2. $C''(Q) = -6 + 0.6Q$
   *Why:* differentiate marginal cost; $C''$ is the slope of the $MC$ curve.
3. $C''(Q) = 0 \Rightarrow Q = 10$; $C''(5) = -3 < 0$ and $C''(15) = 3 > 0$
   *Why:* the bend can only switch where $C'' = 0$, and the sign really changes there. So $C$ is concave for $Q < 10$, convex for $Q > 10$, with the inflection point at $(10, 360)$. This is $b/(3c) = 3/0.3$.
4. $MC(10) = 36 - 60 + 30 = 6$, while $MC(5) = MC(15) = 13.5$
   *Why:* marginal cost falls while $C'' < 0$ and rises once $C'' > 0$, so it is lowest at the inflection point.
5. Chord check: $\dfrac{C(0) + C(10)}{2} = 280 < C(5) = 317.5$ and $\dfrac{C(10) + C(20)}{2} = 440 > C(15) = 402.5$
   *Why:* on the concave piece the chord lies below the curve, on the convex piece above it.

```verify
C(q) = 200 + 36*q - 3*q^2 + 0.1*q^3
MC(q) = 36 - 6*q + 0.3*q^2
C2(q) = -6 + 0.6*q
q = 6/0.6
assert abs(q - 10) < 1e-12
assert abs(q - 3/(3*0.1)) < 1e-12
assert abs(C(10) - 360) < 1e-9
assert abs(C2(5) - (-3)) < 1e-12
assert abs(C2(15) - 3) < 1e-12
assert abs(MC(10) - 6) < 1e-12
assert abs(MC(5) - 13.5) < 1e-12
assert abs(MC(15) - 13.5) < 1e-12
# MC is lowest at 10 among nearby outputs.
assert MC(9) > MC(10) and MC(11) > MC(10)
assert abs((C(0) + C(10))/2 - 280) < 1e-9
assert abs(C(5) - 317.5) < 1e-9
assert abs((C(10) + C(20))/2 - 440) < 1e-9
assert abs(C(15) - 402.5) < 1e-9
```

### Example 3 (hard): an S-shaped production function
A workshop's output with $L$ workers is $Q(L) = 6L^2 - 0.1L^3$ for $0 \le L \le 40$. Find where $Q$ is convex and where concave, when diminishing marginal returns set in, and the highest marginal product. Is output still rising after that?

1. $MP_L = Q'(L) = 12L - 0.3L^2$ and $Q''(L) = 12 - 0.6L$
   *Why:* differentiate twice with the power rule.
2. $Q''(L) > 0$ for $L < 20$ and $Q''(L) < 0$ for $L > 20$
   *Why:* $12 - 0.6L$ is a falling straight line that crosses zero at $L = 20$. So $Q$ is convex for $0 \le L \le 20$ (each extra worker adds more than the last) and concave for $20 \le L \le 40$; the inflection point is $(20, 1600)$.
3. $MP_L(20) = 240 - 120 = 120$, while $MP_L(10) = MP_L(30) = 90$
   *Why:* the marginal product rises while $Q'' > 0$ and falls once $Q'' < 0$, so it peaks at the inflection point. Diminishing marginal returns set in after the 20th worker.
4. $MP_L(30) = 90 > 0$ and $MP_L(40) = 480 - 480 = 0$; output goes from $Q(20) = 1600$ to $Q(30) = 2700$ and $Q(40) = 3200$
   *Why:* on the concave part output still rises, just by less for each extra worker. Diminishing returns mean smaller additions, not less output; only at $L = 40$ does an extra worker add nothing.

```verify
Q(x) = 6*x^2 - 0.1*x^3
MP(x) = 12*x - 0.3*x^2
Q2(x) = 12 - 0.6*x
assert abs(Q2(20)) < 1e-12
assert Q2(19) > 0 and Q2(21) < 0
assert abs(Q(20) - 1600) < 1e-9
assert abs(MP(20) - 120) < 1e-9
assert abs(MP(10) - 90) < 1e-9
assert abs(MP(30) - 90) < 1e-9
assert abs(MP(40)) < 1e-9
assert MP(19) < MP(20) and MP(21) < MP(20)
assert abs(Q(30) - 2700) < 1e-9
assert abs(Q(40) - 3200) < 1e-9
# Second difference agrees with Q'' at a convex and a concave point.
h = 0.001
assert abs((Q(10 + h) - 2*Q(10) + Q(10 - h))/h^2 - 6) < 0.001
assert abs((Q(30 + h) - 2*Q(30) + Q(30 - h))/h^2 - (-6)) < 0.001
```

## Common mistakes
- Stopping after one differentiation and giving the slope, such as marginal cost, instead of the second derivative (FIRST_DERIVATIVE).
- Forgetting to multiply by the power on the second differentiation, for example turning $0.1Q^3$ into $0.3Q^2$ and then $0.3Q$ instead of $0.6Q$ (POWER_ONCE).
- Losing a minus sign: the $-bQ^2$ term gives $-2b$, and $\alpha - 1$ is negative when $0 < \alpha < 1$ (SIGN).
- Giving the output where average variable cost is lowest, $b/(2c)$, instead of where marginal cost is lowest, $b/(3c)$ (AVC_MINIMUM).
- Answering with the number of workers at the inflection point when the question asks for the marginal product there (LABOUR_NOT_MP).
- Putting the inflection point into $Q(L)$, total output, instead of $Q'(L)$ (OUTPUT_NOT_MP).
- Giving output per worker, $Q/L$, instead of the marginal product $Q'(L)$ (AVERAGE_NOT_MARGINAL).
- Calling every point with $f''(x_0) = 0$ an inflection point without checking that $f''$ changes sign; $x^4$ at 0 is a counterexample.
- Thinking concave means falling: a concave curve can rise all the way, only more and more slowly.
- Mixing up the chord picture: for a concave curve the chord lies below the graph, for a convex curve above it.

## Practice
- `second-derivative-at-point` (difficulty 1): $C''(Q_0)$ for a cubic cost $C = F + aQ - bQ^2 + cQ^3$, or $Q''(L_0)$ for $Q = A L^{\alpha}$; distractors FIRST_DERIVATIVE, POWER_ONCE, SIGN.
- `cubic-cost-inflection-output` (difficulty 2): output where a cubic cost curve turns from concave to convex and marginal cost is lowest; answer $b/(3c)$; distractors POWER_ONCE ($2b/(3c)$), AVC_MINIMUM ($b/(2c)$).
- `peak-marginal-product` (difficulty 3): the highest marginal product of an S-shaped $Q = aL^2 - bL^3$, reached at the inflection point $L^* = a/(3b)$; distractors LABOUR_NOT_MP, OUTPUT_NOT_MP, AVERAGE_NOT_MARGINAL.

## Real world
- Agriculture: field trials of fertiliser show yields rising at a decreasing rate as the dose grows. Advisers recommend the dose at which the extra yield just pays for the extra fertiliser, which only works because the yield curve is concave.
- Business cycles: news reports that "growth is slowing" describe a negative second derivative of GDP while GDP itself is still rising; economists watch the change in the growth rate for early signs of a turning point.
- Costs: in manufacturing, transport or hospitals, marginal cost often falls at first as staff specialise and equipment is used fully, then rises as capacity is stretched by overtime and congestion, giving the S-shaped cost curve of Example 2.
- Insurance and finance: concave utility of money explains why people pay to insure against losses (SP02); in bond markets the price of a bond is a convex function of its yield, a "convexity" that C111 measures.

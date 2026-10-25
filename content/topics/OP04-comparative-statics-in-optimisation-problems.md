---
id: OP04
title: Comparative statics in optimisation problems
block: OP
coreYear: 3
prerequisites: [MV12, MV05]
estMinutes: 50
status: draft
economicUses:
  - How a firm's output and hiring respond to its output price and the wage
  - How much of a per-unit tax a monopolist passes on to buyers
  - Splitting a consumer's response to a price change into substitution and income effects
  - How hours of work respond to the wage
searchTerms:
  - "Comparative statics"
  - "Slutsky equation"
generators: [comparative-statics-one-choice, monopoly-tax-price-change, slutsky-equation-cobb-douglas]
widgets: [supply-comparative-statics]
mistakeCodes:
  SIGN:
    label: Lost the minus sign
    explanation: The formula is dx*/dθ = −f_xθ/f_xx. At a maximum f_xx < 0, so the answer has the sign of the cross-partial f_xθ. A higher price raises a firm's output, a higher wage lowers its hiring, and a tax raises a monopolist's price.
  INVERTED_RATIO:
    label: Turned the ratio upside down
    explanation: The cross-partial f_xθ goes on top and the second derivative f_xx underneath. −f_xx/f_xθ is how far the parameter must move per unit change in the choice, the reciprocal of the answer.
  VALUE_NOT_CHOICE:
    label: Gave the slope of the maximum value
    explanation: By the envelope theorem the maximum profit moves at the rate ∂π/∂θ, which is q* for a price and −L* for a wage. The question asks how the best choice itself moves, dx*/dθ = −f_xθ/f_xx.
  FULL_PASS_THROUGH:
    label: Passed the whole tax on to buyers
    explanation: A monopolist does not raise its price one for one with a tax. It cuts output by −1/π_qq per unit of tax, and the price rises only by the demand slope b times that cut.
  CONSTANT_COST_RULE:
    label: Used the half-the-tax rule
    explanation: With linear demand and a constant marginal cost the price rises by half the tax. When marginal cost rises with output (a q² term in cost), π_qq = −2(b + d) and the price rises by b/(2(b + d)) of the tax, less than half.
  QUANTITY_NOT_PRICE:
    label: Gave the change in output
    explanation: dq*/dt = −1/(2(b + d)) is how much output falls. The price change is found by moving along the demand curve, dP*/dt = −b·dq*/dt.
  TOTAL_NOT_SPLIT:
    label: Gave the total effect
    explanation: ∂x/∂pₓ is the total effect of the price on demand. The Slutsky equation splits it into the substitution effect ∂h/∂pₓ and the income effect −x·∂x/∂M; give the part the question asks for.
  SWAPPED_EFFECTS:
    label: Swapped the substitution and income effects
    explanation: The income effect is −x·∂x/∂M, what the loss of buying power x·Δpₓ does to demand. The substitution effect is the rest of the total, the slope of the compensated demand.
  EFFECT_SIGN:
    label: Lost the sign of the effect
    explanation: A price rise always has a negative substitution effect. For a normal good (∂x/∂M > 0) the income effect −x·∂x/∂M is negative too.
  FORGOT_QUANTITY:
    label: Forgot to multiply by x
    explanation: A price rise of 1 costs the consumer x units of income, one for each unit bought, so the income term is −x·∂x/∂M, not −∂x/∂M.
resources:
  - { title: "MIT 14.121 Microeconomic Theory I, Monotone Comparative Statics, with Applications to Producer Theory lecture slides (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/14-121-microeconomic-theory-i-fall-2015/resources/mit14_121f15_4s/", kind: course, verifiedAt: 2026-10-18 }
  - { title: "Principles of Microeconomics 3e, 6.2 How Changes in Income and Prices Affect Consumption Choices (OpenStax)", url: "https://openstax.org/books/principles-microeconomics-3e/pages/6-2-how-changes-in-income-and-prices-affect-consumption-choices", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Principles of Microeconomics 3e, 9.2 How a Profit-Maximizing Monopoly Chooses Output and Price (OpenStax)", url: "https://openstax.org/books/principles-microeconomics-3e/pages/9-2-how-a-profit-maximizing-monopoly-chooses-output-and-price", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
Most questions in economics are "what if" questions about choices. If the price of wheat rises, how much more does a farm grow? If the government adds a tax of 6 on each unit a monopolist sells, how much of it do buyers pay through a higher price? If wages rise, does a firm hire fewer workers, and does it also buy fewer machines? If bread gets dearer, how much less bread does a family buy because bread is now dear *relative* to other food, and how much because the family is now poorer?

Each answer is the derivative of a best choice with respect to a parameter: a price, a tax, a wage or an income. The envelope theorem (MV12) told you how the best *value* (maximum profit, maximum utility) responds. This topic tells you how the best *choice* responds. The method is the implicit function theorem (MV05) applied to the first-order conditions, and it works even when the best choice has no neat formula.

## Intuition
At the best choice the marginal gain from the choice is zero: a firm's marginal profit is zero at its best output. Now change a parameter. If the change raises the marginal gain, the old choice is no longer best: it now pays to do more, so the choice rises until the marginal gain is back at zero. If the change lowers the marginal gain, the choice falls.

Two numbers settle how far the choice moves:
- how much the parameter shifts the marginal gain, the cross-partial $f_{x\theta}$;
- how fast the marginal gain falls as the choice grows, the second derivative $f_{xx}$, which is negative at a maximum.

A big shift and a slowly falling marginal gain mean a big move. A higher output price raises the marginal profit of every unit by 1, so a firm produces more; how much more depends on how steeply its marginal cost rises. A tax on each unit lowers marginal profit, so output falls.

The sign needs almost nothing: only whether the parameter raises or lowers the marginal gain of the choice. Economists call this property **increasing differences**: if raising the choice gains more when the parameter is higher, the best choice rises with the parameter. This "monotone comparative statics" idea works even without derivatives or smooth curves.

## Definition and formulas
**One choice variable.** Let $x^*(\theta)$ maximise $f(x, \theta)$, where $\theta$ is a parameter. The first-order condition holds for every $\theta$:
$$f_x\big(x^*(\theta), \theta\big) = 0.$$
Differentiate it with respect to $\theta$ by the chain rule (MV03): $f_{xx}\,\dfrac{dx^*}{d\theta} + f_{x\theta} = 0$, so
$$\frac{dx^*}{d\theta} = -\frac{f_{x\theta}}{f_{xx}}.$$
Both partials are evaluated at the optimum. This is MV05's $-F_\theta/F_x$ with $F = f_x$. At a strict maximum $f_{xx} < 0$, so **$dx^*/d\theta$ has the sign of the cross-partial $f_{x\theta}$**.

**A competitive firm and its price.** Profit $\pi = pq - C(q)$ has $\pi_{qq} = -C''(q)$ and $\pi_{qp} = 1$, so
$$\frac{dq^*}{dp} = \frac{1}{C''(q^*)} > 0.$$
The supply curve slopes upwards because marginal cost does, and it is flatter where marginal cost rises steeply.

**A firm and the wage.** Profit $\pi = R(L) - wL$ has $\pi_{Lw} = -1$, so $dL^*/dw = 1/R''(L^*) < 0$: labour demand slopes down.

**A monopolist and a per-unit tax.** With inverse demand $P = a - bq$, cost $C(q) = cq + dq^2$ and a tax $t$ on each unit, profit is $(a - bq)q - cq - dq^2 - tq$. Then $\pi_{qq} = -2(b + d)$ and $\pi_{qt} = -1$, so
$$\frac{dq^*}{dt} = -\frac{1}{2(b + d)}, \qquad \frac{dP^*}{dt} = -b\,\frac{dq^*}{dt} = \frac{b}{2(b + d)} < 1.$$
With constant marginal cost ($d = 0$) the price rises by exactly half the tax; when marginal cost rises with output, by less than half.

**Two choice variables.** If $x_1^*, x_2^*$ maximise $f(x_1, x_2, \theta)$, both first-order conditions $f_1 = 0$ and $f_2 = 0$ hold for every $\theta$. Differentiating both gives a linear system whose matrix is the Hessian (MV07):
$$
\begin{bmatrix} f_{11} & f_{12} \\ f_{21} & f_{22} \end{bmatrix}
\begin{bmatrix} dx_1^*/d\theta \\ dx_2^*/d\theta \end{bmatrix}
= -\begin{bmatrix} f_{1\theta} \\ f_{2\theta} \end{bmatrix}.
$$
At a maximum $\det H > 0$, so Cramer's rule (LA104) gives each derivative as a ratio of determinants. When $\theta$ enters only the first condition ($f_{2\theta} = 0$),
$$\frac{dx_1^*}{d\theta} = -\frac{f_{1\theta}\,f_{22}}{\det H}, \qquad \frac{dx_2^*}{d\theta} = \frac{f_{1\theta}\,f_{21}}{\det H}.$$
The own effect has the sign of $f_{1\theta}$, as with one variable, because $f_{22} < 0$. The other variable follows if the two choices are complements ($f_{12} > 0$) and moves the opposite way if they are substitutes. For a firm choosing capital and labour, a wage rise always cuts the labour it hires; it cuts capital too when capital and labour are complements in production (Example 3).

**The link with the envelope theorem.** For the value $V(\theta) = f\big(x^*(\theta), \theta\big)$, MV12 gives $V'(\theta) = f_\theta$ at the optimum, with no need for $dx^*/d\theta$. Differentiating once more brings the choice back:
$$V''(\theta) = f_{\theta\theta} + f_{\theta x}\,\frac{dx^*}{d\theta}.$$
For a competitive firm $\pi^{*\prime}(p) = q^*(p)$ (Hotelling's lemma), so $dq^*/dp = \pi^{*\prime\prime}(p) = 1/C''(q^*) > 0$: the profit function is convex in the price. The envelope theorem answers "how does the maximum change?"; comparative statics answers "how does the choice change?".

**Labour supply and the wage.** A worker with 16 hours a day and other income $N$ chooses hours $h$ to maximise $\ln(wh + N) + \ln(16 - h)$. The cross-partial is $f_{hw} = N/(wh + N)^2$, so hours rise with the wage only if $N > 0$. Solving gives $h^* = 8 - N/(2w)$: with no other income the worker supplies 8 hours at every wage, because the pull to work more (each hour now pays more) and the pull to work less (the worker is richer and wants more free time) cancel exactly. With $N = 40$ and $w = 10$, $h^* = 6$ and $dh^*/dw = N/(2w^2) = 0.2$.

**Consumer demand: the Slutsky equation.** The consumer problem has a budget constraint, so differentiating its first-order conditions needs the Lagrangian and gives a longer formula. The result is neater when split in two. Let $h(p_x, p_y, u)$ be the compensated (Hicksian) demand of MV10, which keeps utility at $u$, and $e(p_x, p_y, u)$ the least spending that reaches $u$. Then $h = x(p_x, p_y, e)$; differentiating with respect to $p_x$ and using $\partial e/\partial p_x = h = x$ (the envelope theorem, as in Shephard's lemma) gives the **Slutsky equation**
$$\frac{\partial x}{\partial p_x} = \underbrace{\frac{\partial h}{\partial p_x}}_{\text{substitution effect}} \;\underbrace{-\;x\,\frac{\partial x}{\partial M}}_{\text{income effect}}.$$
A price rise of 1 makes the consumer poorer by about $x$, the quantity bought, which is where the factor $x$ comes from. The substitution effect is never positive. The income effect is negative for a normal good ($\partial x/\partial M > 0$) and positive for an inferior one; demand could slope upwards (a Giffen good) only if an inferior good's income effect outweighed the substitution effect.

For Cobb–Douglas utility $U = x^a y^{1-a}$, demand is $x = aM/p_x$, so $\partial x/\partial p_x = -aM/p_x^2$ and $\partial x/\partial M = a/p_x$:
$$\text{income effect} = -\frac{a^2 M}{p_x^2}, \qquad \text{substitution effect} = -\frac{a(1 - a)M}{p_x^2}.$$
With $a = 0.3$, $M = 1000$ and $p_x = 5$: $x = 60$, the total effect is $-12$, the income effect $-60 \times 0.06 = -3.6$ and the substitution effect $-8.4$. A price rise of 1 cuts demand by about 12 units: 8.4 because $x$ is dearer relative to $y$, and 3.6 because the consumer is poorer.

## Interactive
::widget{id="supply-comparative-statics"}

The top graph shows the profit $pq - 100 - q^3/30$ of the firm in Example 1 as a hill over output $q$; the bottom graph shows its best output $q^*$ at every price, its supply curve. Move **Price p**: the hill tilts, its peak (the dot) slides sideways, and the dot on the supply curve follows. The dashed green hill is the profit at the starting price 40, and the dashed gold line is the tangent to the supply curve. The panel shows the best output $q^*$, the maximum profit $\pi^*$ and the slope $dq^*/dp = -\pi_{qp}/\pi_{qq}$. Check: at $p = 40$ the panel shows $q^* = 20$, $\pi^* = 433.33$ and a slope of $0.25$, as in Example 1. Move to $p = 22.5$: now $q^* = 15$ and the slope is $0.333$. At a lower output marginal cost $q^2/10$ rises more slowly, so the same price rise moves the peak further.

## Worked examples

### Example 1 (easy): how a firm's output responds to its price
A firm sells at the price $p = 40$ and has cost $C(q) = 100 + \dfrac{q^3}{30}$. Find its best output, then $dq^*/dp$ by differentiating the first-order condition, and compare with the change in output when the price rises to 41.

1. $\pi_q = p - \dfrac{q^2}{10} = 0$, so $q^* = \sqrt{10p} = \sqrt{400} = 20$
   *Why:* the firm produces where price equals marginal cost $3q^2/30 = q^2/10$.
2. $\pi_{qq} = -\dfrac{q}{5} = -4$ at $q = 20$, and $\pi_{qp} = 1$
   *Why:* $\pi_{qq} < 0$ confirms a maximum; a price rise of 1 adds 1 to the marginal profit of every unit.
3. $\dfrac{dq^*}{dp} = -\dfrac{\pi_{qp}}{\pi_{qq}} = -\dfrac{1}{-4} = 0.25$
   *Why:* differentiating $\pi_q\big(q^*(p), p\big) = 0$ with respect to $p$. The sign comes from $\pi_{qp} > 0$: output rises with the price.
4. Check: $\dfrac{d}{dp}\sqrt{10p} = \dfrac{5}{\sqrt{10p}} = \dfrac{5}{20} = 0.25$; at $p = 41$, $q^* = \sqrt{410} = 20.248$, a rise of $0.248$
   *Why:* here the first-order condition can be solved, so the direct derivative must agree; the slope is a very good guide to a change of 1.
5. Compare: $\dfrac{d\pi^*}{dp} = q^* = 20$
   *Why:* the envelope theorem (MV12) says maximum profit rises by about 20 per unit of price, while output rises by only 0.25. They answer different questions, and $dq^*/dp = 0.25$ is the second derivative of $\pi^*(p)$.

```verify
p = 40; F = 100; k = 30
q = sqrt(10*p)
assert q == 20
# the first-order condition holds and output 19 or 21 earns less
assert p - q^2/10 == 0
prof(x) = p*x - F - x^3/k
assert prof(19) < prof(20)
assert prof(21) < prof(20)
assert abs(prof(20) - 433.33) < 0.005
piqq = -6*q/k
assert piqq == -4
dq = -1/piqq
assert dq == 0.25
assert 5/sqrt(10*p) == dq
q41 = sqrt(410)
assert abs(q41 - 20.248) < 0.0005
assert abs((q41 - q) - 0.248) < 0.0005
# second derivative of maximum profit equals dq*/dp
V(s) = s*sqrt(10*s) - F - (10*s)^(3/2)/k
h = 0.01
assert abs((V(p + h) - V(p - h))/(2*h) - 20) < 0.0001
assert abs((V(p + h) - 2*V(p) + V(p - h))/h^2 - dq) < 0.001
```

### Example 2 (medium): a per-unit tax on a monopolist
A monopolist faces the inverse demand $P = 120 - 2q$ and has cost $C(q) = 20q + q^2$. It pays a tax of $t = 10$ on each unit. Find its output and price, how both respond to the tax, and what happens when the tax rises to 16.

1. $\pi = (120 - 2q)q - 20q - q^2 - tq$, so $\pi_q = 100 - 6q - t = 0$ and $q^* = \dfrac{100 - t}{6} = 15$, $P^* = 120 - 30 = 90$
   *Why:* marginal revenue $120 - 4q$ equals marginal cost $20 + 2q$ plus the tax $t$.
2. $\pi_{qq} = -6$, $\pi_{qt} = -1$, so $\dfrac{dq^*}{dt} = -\dfrac{-1}{-6} = -\dfrac{1}{6} \approx -0.17$
   *Why:* the tax lowers the marginal profit of every unit by 1, so output falls; $\pi_{qq} < 0$ at the maximum.
3. $\dfrac{dP^*}{dt} = -2 \cdot \left(-\dfrac{1}{6}\right) = \dfrac{1}{3} \approx 0.33$
   *Why:* the price is read off the demand curve, which rises by 2 for each unit of output the monopolist gives up.
4. Tax from 10 to 16: $\Delta q^* = -\dfrac{6}{6} = -1$ and $\Delta P^* = \dfrac{6}{3} = 2$, so $q^* = 14$ and $P^* = 92$
   *Why:* the first-order condition is linear in $t$, so the derivatives are constant and these changes are exact. Buyers pay one third of the tax rise.
5. With constant marginal cost 20 (cost $20q$): $\pi_{qq} = -4$, $\dfrac{dq^*}{dt} = -\dfrac{1}{4}$ and $\dfrac{dP^*}{dt} = \dfrac{2}{4} = 0.5$
   *Why:* the half-the-tax rule holds only when marginal cost is flat. A rising marginal cost makes cutting output save less, so less of the tax is passed on.

```verify
a = 120; b = 2; c = 20; d = 1
qs(t) = (a - c - t)/(2*(b + d))
P(t) = a - b*qs(t)
assert qs(10) == 15
assert P(10) == 90
# marginal revenue = marginal cost + tax at q = 15
assert a - 2*b*15 == c + 2*d*15 + 10
prof(x, t) = (a - b*x)*x - c*x - d*x^2 - t*x
assert prof(14, 10) < prof(15, 10)
assert prof(16, 10) < prof(15, 10)
dq = -1/(2*(b + d))
assert abs(dq + 1/6) < 1e-12
dP = -b*dq
assert abs(dP - 1/3) < 1e-12
assert qs(16) == 14
assert P(16) == 92
assert abs((qs(16) - qs(10)) - 6*dq) < 1e-12
assert abs((P(16) - P(10)) - 6*dP) < 1e-12
# constant marginal cost: half the tax is passed on
assert -1/(2*b) == -0.25
assert b/(2*b) == 0.5
```

### Example 3 (hard): a wage rise, labour and capital
A firm makes $q = K^{1/4}L^{1/2}$ units with capital $K$ and labour $L$, sells at $p = 64$ and pays a wage $w = 16$ and a rental $r = 8$ per machine. It uses $K^* = 16$ and $L^* = 16$. Find $\partial L^*/\partial w$ and $\partial K^*/\partial w$.

1. $\pi_K = 16K^{-3/4}L^{1/2} - 8 = 16 \cdot \tfrac{1}{8} \cdot 4 - 8 = 0$ and $\pi_L = 32K^{1/4}L^{-1/2} - 16 = 32 \cdot 2 \cdot \tfrac{1}{4} - 16 = 0$
   *Why:* check that $(16, 16)$ satisfies both first-order conditions (value of the marginal product equals the input price) before differentiating them; output is $2 \times 4 = 8$.
2. $\pi_{KK} = -12K^{-7/4}L^{1/2} = -\tfrac{3}{8}$, $\pi_{LL} = -16K^{1/4}L^{-3/2} = -\tfrac{1}{2}$, $\pi_{KL} = 8K^{-3/4}L^{-1/2} = \tfrac{1}{4}$
   *Why:* the Hessian at the optimum. $\det H = \tfrac{3}{16} - \tfrac{1}{16} = \tfrac{1}{8} > 0$ with $\pi_{KK} < 0$, so this is a maximum (MV07).
3. $\begin{bmatrix} -\tfrac{3}{8} & \tfrac{1}{4} \\ \tfrac{1}{4} & -\tfrac{1}{2} \end{bmatrix} \begin{bmatrix} \partial K^*/\partial w \\ \partial L^*/\partial w \end{bmatrix} = \begin{bmatrix} 0 \\ 1 \end{bmatrix}$
   *Why:* differentiate both first-order conditions with respect to $w$. The wage appears only in $\pi_L$, with $\pi_{Lw} = -1$, and moving it to the right-hand side flips its sign.
4. $\dfrac{\partial L^*}{\partial w} = \dfrac{1}{1/8}\det\begin{bmatrix} -\tfrac{3}{8} & 0 \\ \tfrac{1}{4} & 1 \end{bmatrix} = -3$ and $\dfrac{\partial K^*}{\partial w} = \dfrac{1}{1/8}\det\begin{bmatrix} 0 & \tfrac{1}{4} \\ 1 & -\tfrac{1}{2} \end{bmatrix} = -2$
   *Why:* Cramer's rule: replace the column of the unknown by the right-hand side and divide by $\det H$.
5. At $w = 17$ the first-order conditions give $L^* = 13.34$ and $K^* = 14.17$, falls of $2.66$ and $1.83$
   *Why:* a wage rise of 1 cuts labour by about 3. Capital falls too, by about 2, because $\pi_{KL} > 0$: with fewer workers each machine is less productive. The slopes describe small changes; over a whole unit the falls are a little smaller.

```verify
p = 64; w = 16; r = 8; K = 16; L = 16
prof(k, l) = p*k^(1/4)*l^(1/2) - w*l - r*k
# first-order conditions by central differences
h = 0.0001
assert abs((prof(K + h, L) - prof(K - h, L))/(2*h)) < 0.000001
assert abs((prof(K, L + h) - prof(K, L - h))/(2*h)) < 0.000001
assert abs(K^(1/4)*L^(1/2) - 8) < 1e-12
assert abs(16*K^(-3/4)*L^(1/2) - 8) < 1e-12
assert abs(32*K^(1/4)*L^(-1/2) - 16) < 1e-12
piKK = -12*K^(-7/4)*L^(1/2)
piLL = -16*K^(1/4)*L^(-3/2)
piKL = 8*K^(-3/4)*L^(-1/2)
assert abs(piKK + 3/8) < 1e-12
assert abs(piLL + 1/2) < 1e-12
assert abs(piKL - 1/4) < 1e-12
H = [piKK, piKL; piKL, piLL]
assert abs(det(H) - 1/8) < 1e-12
dL = det([piKK, 0; piKL, 1])/det(H)
dK = det([0, piKL; 1, piLL])/det(H)
assert abs(dL + 3) < 1e-9
assert abs(dK + 2) < 1e-9
# the same from the inverse of H
sol = inv(H)*[0; 1]
assert abs(sol[1, 1] + 2) < 1e-9
assert abs(sol[2, 1] + 3) < 1e-9
# re-solve at w = 17: K = (17/16) L from the ratio of the conditions, then 32 K^(1/4) L^(-1/2) = 17
L17 = 32^4*(17/16)/17^4
K17 = (17/16)*L17
assert abs(32*K17^(1/4)*L17^(-1/2) - 17) < 1e-9
assert abs(16*K17^(-3/4)*L17^(1/2) - 8) < 1e-9
assert abs(L17 - 13.34) < 0.005
assert abs(K17 - 14.17) < 0.005
assert abs((L - L17) - 2.66) < 0.005
assert abs((K - K17) - 1.83) < 0.005
```

## Common mistakes
- Dropping the minus sign in $-f_{x\theta}/f_{xx}$, so that output seems to fall when the price rises, or a tax seems to lower the monopoly price (SIGN).
- Turning the ratio upside down and giving $-f_{xx}/f_{x\theta}$ (INVERTED_RATIO).
- Answering with the envelope theorem's $d\pi^*/dp = q^*$ (or $-L^*$ for a wage), the slope of the maximum value, when the question asks how the choice moves (VALUE_NOT_CHOICE).
- Assuming a tax is passed on in full, so the price rises by the whole tax (FULL_PASS_THROUGH).
- Using the half-the-tax rule when marginal cost rises with output (CONSTANT_COST_RULE).
- Reporting the change in output when the question asks for the change in price (QUANTITY_NOT_PRICE).
- Giving the total effect $\partial x/\partial p_x$ instead of one of its two parts (TOTAL_NOT_SPLIT).
- Calling $-x\,\partial x/\partial M$ the substitution effect, or the rest the income effect (SWAPPED_EFFECTS).
- Giving a positive substitution effect, or a positive income effect for a normal good (EFFECT_SIGN).
- Writing the income term as $-\partial x/\partial M$ without the factor $x$ (FORGOT_QUANTITY).
- Evaluating $f_{xx}$ and $f_{x\theta}$ at some point other than the optimum: check first that the first-order condition really holds there, as in step 1 of Example 3.
- In the two-variable system, forgetting the minus sign when the cross-partials move to the right-hand side, or putting the parameter into both rows when it appears in only one first-order condition.
- Reading the sign of $\partial K^*/\partial w$ from the sign of $\partial L^*/\partial w$. The own effect is always negative at a maximum; the cross effect depends on whether the inputs are complements ($\pi_{KL} > 0$) or substitutes.

## Practice
- `comparative-statics-one-choice` (difficulty 1): $dq^*/dp$ for a competitive firm with cost $F + q^3/k$, or $dL^*/dw$ for a firm with profit $B\sqrt{L} - wL$, from $-f_{x\theta}/f_{xx}$; distractors SIGN, INVERTED_RATIO, VALUE_NOT_CHOICE.
- `monopoly-tax-price-change` (difficulty 2): the change in a monopolist's price when a per-unit tax rises, with linear demand and cost $cq + dq^2$; distractors FULL_PASS_THROUGH, CONSTANT_COST_RULE, QUANTITY_NOT_PRICE, SIGN.
- `slutsky-equation-cobb-douglas` (difficulty 3): the substitution effect or the income effect in the Slutsky equation for $U = x^a y^{1-a}$; distractors TOTAL_NOT_SPLIT, SWAPPED_EFFECTS, EFFECT_SIGN, FORGOT_QUANTITY.

## Real world
- Tax pass-through: economists estimate how much of a fuel, tobacco or sugar tax reaches shop prices. For a firm with market power the answer depends on the shapes of demand and cost, exactly as $dP^*/dt = b/(2(b + d))$ shows in the linear case, and governments use such estimates to judge who really bears a tax.
- Labour demand and minimum wages: the slope $dL^*/dw$, and its counterpart for capital, tells policymakers how much employment and investment fall when wages rise. Whether machines replace workers or leave with them depends on the cross-partial $\pi_{KL}$, as in Example 3.
- Taxes and hours of work: a tax on wages lowers the take-home wage. Whether people then work less depends on the substitution and income effects, which pull in opposite directions; studies of tax reforms estimate both, and the welfare cost of the tax depends on the substitution (compensated) part only.
- Cost of living and benefits: when food or energy prices jump, the Slutsky split separates the switch to other goods from the loss of buying power. Governments that compensate households for a price rise of $\Delta p$ with about $x\,\Delta p$ of income remove the income effect but leave the substitution effect in place.

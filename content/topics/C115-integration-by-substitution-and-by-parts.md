---
id: C115
title: Integration by substitution and by parts
block: C1
coreYear: 1
prerequisites: [C113]
estMinutes: 45
status: draft
economicUses:
  - Present value of an income stream that grows over time
  - Total cost or revenue from a marginal function built around an inner function
  - Valuing salaries, pensions and projects whose payments rise each year
  - Total output when productivity rises with experience
searchTerms:
  - "Substitution in indefinite integrals"
  - "Change of variable in integrals"
  - "Integration by parts"
  - "Substitution in definite integrals"
generators: [substitution-total-from-marginal, present-value-growing-stream, total-output-log-rate]
widgets: [growing-stream-present-value]
mistakeCodes:
  FORGOT_LIMITS:
    label: Kept the old limits after substituting
    explanation: After u = g(x) the integral is in u, so its limits must be values of u. Put each x-limit into g, for example Q = 3 gives u = 3² + 16 = 25, or go back to x before you substitute the limits.
  LOWER_LIMIT_DROPPED:
    label: Forgot the value at the lower limit
    explanation: A definite integral is F(upper) − F(lower). The lower limit is often not zero after a substitution (u = Q² + 16 starts at 16), and ln 1 = 0 does not make w ln w − w zero at w = 1. Always work out F at the lower limit and subtract it.
  FORGOT_DU_FACTOR:
    label: Forgot the constant from du
    explanation: If u = Q² + c then du = 2Q dQ, so Q dQ is only half of du. Write the leftover factor in terms of du (for example 6Q dQ = 3 du) before integrating, or the answer is off by that constant.
  DIVIDED_BY_OLD_POWER:
    label: Divided by the old power
    explanation: The power rule for integrals raises the power by one and divides by the new power. The integral of u^(1/2) is u^(3/2) divided by 3/2, which is (2/3)u^(3/2), not u^(3/2) divided by 1/2.
  PARTS_SIGN:
    label: Sign slip in uv − ∫v du
    explanation: The formula is ∫u dv = uv − ∫v du, with a minus before the new integral. With v = −e^(−rt)/r the two minus signs make a plus, so the second part is + (1/r)∫e^(−rt) dt. Write v with its sign in brackets before you substitute.
  FORGOT_BOUNDARY:
    label: Left out the boundary term uv
    explanation: Integration by parts has two parts, the boundary term [uv] evaluated at the limits and the new integral. For ∫t·e^(−rt) dt from 0 to T the boundary term is −T·e^(−rT)/r and must be included.
  DIVIDED_BY_R_ONCE:
    label: Divided by r once instead of twice
    explanation: In ∫t·e^(−rt) dt the factor 1/r appears twice, once from v = −e^(−rt)/r and again when you integrate e^(−rt) in the new integral. The second part is (1 − e^(−rT))/r², not (1 − e^(−rT))/r.
  NO_DISCOUNTING:
    label: Added up the income without discounting
    explanation: aT + bT²/2 is the total income over T years, but money received later is worth less today. The present value multiplies each moment's income by e^(−rt) before adding up, so it is always smaller.
  DROPPED_INTEGRAL_TERM:
    label: Left out the new integral ∫v du
    explanation: For ∫ln w dw with u = ln w and v = w, the parts formula gives w ln w − ∫w·(1/w) dw. The second integral is ∫1 dw = w and must be subtracted, so the answer is w ln w − w.
  WRONG_U_CHOICE:
    label: Chose u the wrong way round
    explanation: Choose u so that differentiating it makes things simpler, for example u = t (derivative 1) in t·e^(−rt). With u = e^(−rt) and dv = t dt the new integral contains t² and is harder than the one you started with.
resources:
  - { title: "Calculus Volume 1, 5.5 Substitution (OpenStax)", url: "https://openstax.org/books/calculus-volume-1/pages/5-5-substitution", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Calculus Volume 1, 5.6 Integrals Involving Exponential and Logarithmic Functions (OpenStax)", url: "https://openstax.org/books/calculus-volume-1/pages/5-6-integrals-involving-exponential-and-logarithmic-functions", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Calculus Volume 2, 3.1 Integration by Parts (OpenStax)", url: "https://openstax.org/books/calculus-volume-2/pages/3-1-integration-by-parts", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
A graduate is offered a job whose pay starts at 100 thousand a year and rises by 20 thousand every year. What is ten years of that income worth today? Each moment's income has to be discounted before it is added up, so the answer is the integral of $(100 + 20t)\,e^{-rt}$: a polynomial times an exponential, which the basic rules of C112 cannot integrate. The same problem appears whenever a project, a pension or a firm pays out a growing stream. Marginal functions cause a similar difficulty: a marginal cost such as $6Q\sqrt{Q^2 + 16}$ has an inner function inside the root, and finding total cost means undoing a chain rule. This topic gives the two standard tools for both jobs.

## Intuition
Every differentiation rule, read backwards, is an integration rule. The chain rule (C104) says the derivative of $F(g(x))$ is $f(g(x))\,g'(x)$. So when an integrand looks like "a function of an inside expression, times the derivative of that inside", it is the derivative of something, and we can integrate it by treating the inside as a single new letter $u$. This is **substitution**.

The product rule (C103) says $(uv)' = u'v + uv'$. Integrating both sides and rearranging lets us swap one integral for another. That only helps if the new integral is easier, so the skill is to choose $u$ as the factor that becomes simpler when differentiated: $t$ turns into $1$, and $\ln w$ turns into $1/w$. This is **integration by parts**. Think of it as trading: we give up the hard integral $\int u\,dv$ and take on the easier $\int v\,du$, plus a boundary term.

## Definition and formulas
**Substitution.** With $u = g(x)$ and $du = g'(x)\,dx$:
$$\int f(g(x))\,g'(x)\,dx = \int f(u)\,du = F(u) + C = F(g(x)) + C.$$

1. Choose the inside $u = g(x)$: the expression inside a root, a power, an exponential or a log.
2. Write $du = g'(x)\,dx$ and check that the rest of the integrand is $du$ up to a constant factor.
3. Rewrite everything in terms of $u$, integrate, then put $g(x)$ back in place of $u$.

For example $\int 2x\,e^{x^2}dx = e^{x^2} + C$ (with $u = x^2$, $du = 2x\,dx$). If the factor 2 is missing, fix the constant: $x\,dx = \tfrac12\,du$, so $\int x\,e^{x^2}dx = \tfrac12 e^{x^2} + C$. A linear inside only brings a constant: $\int e^{kt}\,dt = \dfrac{e^{kt}}{k} + C$, so $\int e^{-rt}\,dt = -\dfrac{e^{-rt}}{r} + C$.

**Substitution with limits.** In a definite integral, change the limits along with the variable:
$$\int_a^b f(g(x))\,g'(x)\,dx = \int_{g(a)}^{g(b)} f(u)\,du.$$
Then there is no need to go back to $x$. Example: a firm's marginal revenue is $MR = \dfrac{Q}{1 + Q^2}$. With $u = 1 + Q^2$, $du = 2Q\,dQ$, the limits $Q = 0$ and $Q = 3$ become $u = 1$ and $u = 10$, so
$$R(3) = \int_0^3 \frac{Q}{1 + Q^2}\,dQ = \frac12\int_1^{10}\frac{du}{u} = \frac12\ln 10 = 1.1513.$$

**Integration by parts.** From the product rule:
$$\int u\,dv = uv - \int v\,du, \qquad \int_a^b u\,v'\,dx = \Big[uv\Big]_a^b - \int_a^b v\,u'\,dx.$$

- Pick $u$ (to differentiate) and $dv$ (to integrate). Find $du$ and $v$.
- A rough guide for $u$ is **LIATE**: take as $u$ whichever comes first in Logarithms, Inverse trigonometric functions, Algebraic terms (powers of $t$), Trigonometric functions, Exponentials. The real test is that $\int v\,du$ must be easier than the integral you started with.
- Two results used in economics:
$$\int t\,e^{-rt}\,dt = -\frac{t\,e^{-rt}}{r} - \frac{e^{-rt}}{r^2} + C, \qquad \int \ln x\,dx = x\ln x - x + C.$$

**Repeated parts.** Each round of parts lowers a power of $t$ by one, so $t^2$ needs two rounds:
$$\int t^2 e^{t}\,dt = t^2e^t - 2\int t\,e^t\,dt = t^2e^t - 2(t\,e^t - e^t) + C = e^t(t^2 - 2t + 2) + C.$$
Between 0 and 1 this gives $e(1 - 2 + 2) - 2 = e - 2 = 0.7183$.

**Present value of an income stream.** Suppose income arrives continuously at the rate $f(t)$ per year. In a short time $dt$ around time $t$ it pays $f(t)\,dt$, and with continuous discounting at rate $r$ (FM02, FM03) that slice is worth $f(t)\,e^{-rt}\,dt$ today. Adding up the slices:
$$PV = \int_0^T f(t)\,e^{-rt}\,dt.$$
For a stream that grows linearly, $f(t) = a + bt$, integration by parts gives
$$PV = a\,\frac{1 - e^{-rT}}{r} + b\left[\frac{1 - e^{-rT}}{r^2} - \frac{T e^{-rT}}{r}\right],$$
while the undiscounted total is the area under the line, $aT + \tfrac12 bT^2$ (C113). Letting $T$ grow without limit is the subject of C116.

## Interactive
::widget{id="growing-stream-present-value"}

The green line is the income stream $100 + 20t$ (thousand a year) and the purple curve is the same income discounted to today. Move the *Discount rate r* slider and the *Years T* slider. The purple area is the present value, and the gold band between the two curves is what discounting takes away. With the defaults, $r = 5\%$ and $T = 10$, the panel shows an undiscounted total of 2,000.00, a present value of 1,508.57 and a discount loss of 491.43, the numbers of Example 2. Set $r$ to 0: the two curves coincide and the loss is 0. Then set $r = 15\%$ and $T = 20$: the income keeps rising, but the discounted curve starts to fall before year 2, and the present value is only 1,345.34 out of 6,000.

## Worked examples

### Example 1 (easy): total cost from marginal cost
A firm's marginal cost, in thousands per unit, is $MC(Q) = 6Q\sqrt{Q^2 + 16}$. How much does total cost rise when output goes from 0 to 3 units?

1. $\Delta C = \displaystyle\int_0^3 6Q\sqrt{Q^2 + 16}\,dQ$
   *Why:* adding up marginal cost over the units produced gives the change in total cost (C113).
2. $u = Q^2 + 16$, $du = 2Q\,dQ$, so $6Q\,dQ = 3\,du$
   *Why:* $2Q$ is the derivative of the inside $Q^2 + 16$, and $6Q$ is three times it.
3. $Q = 0 \Rightarrow u = 16$, $\;Q = 3 \Rightarrow u = 25$
   *Why:* the new integral is in $u$, so its limits must be values of $u$.
4. $\displaystyle\int_{16}^{25} 3\,u^{1/2}\,du = 3 \cdot \tfrac23\Big[u^{3/2}\Big]_{16}^{25} = 2\big(125 - 64\big) = 122$
   *Why:* raise the power to $3/2$ and divide by $3/2$; $25^{3/2} = 5^3$ and $16^{3/2} = 4^3$. Total cost rises by 122 thousand.

```verify
F(q) = 2*(q^2 + 16)^(3/2)
assert F(3) - F(0) == 122
assert 25^(3/2) == 125
assert 16^(3/2) == 64
# F' equals the marginal cost (numerical derivative at Q = 2)
mc(q) = 6*q*sqrt(q^2 + 16)
h = 0.00001
assert abs((F(2 + h) - F(2 - h))/(2*h) - mc(2)) < 0.0001
# midpoint Riemann sum of the marginal cost
d = 0.001
xs = (d/2):d:(3 - d/2)
assert abs(sum(map(xs, mc))*d - 122) < 0.001
```

### Example 2 (medium): present value of a rising salary
A job pays income continuously at the rate $f(t) = 100 + 20t$ thousand a year for 10 years. With continuous discounting at 5 % a year, what is the income worth today, and how much is lost to discounting?

1. $PV = 100\displaystyle\int_0^{10} e^{-0.05t}\,dt + 20\int_0^{10} t\,e^{-0.05t}\,dt$
   *Why:* split the stream into a level part and a growing part; constants come outside the integrals.
2. $100 \cdot \dfrac{1 - e^{-0.5}}{0.05} = 2000 \times 0.393469 = 786.94$
   *Why:* an antiderivative of $e^{-0.05t}$ is $-20\,e^{-0.05t}$; evaluate it at 10 and subtract its value at 0.
3. $u = t$, $dv = e^{-0.05t}dt$, so $du = dt$, $v = -20\,e^{-0.05t}$
   *Why:* $t$ becomes simpler when differentiated (LIATE: algebraic before exponential).
4. $\displaystyle\int_0^{10} t\,e^{-0.05t}dt = \Big[-20t\,e^{-0.05t}\Big]_0^{10} + 20\int_0^{10} e^{-0.05t}dt = -200e^{-0.5} + 400\big(1 - e^{-0.5}\big) = -121.31 + 157.39 = 36.08$
   *Why:* $uv - \int v\,du$; the minus sign in the formula and the minus sign in $v$ make a plus, and the factor 20 ($= 1/r$) appears a second time when $e^{-0.05t}$ is integrated.
5. $PV = 786.94 + 20 \times 36.0816 = 1{,}508.57$; undiscounted total $100(10) + \tfrac12(20)(10^2) = 2{,}000$, so discounting removes $491.43$
   *Why:* the present value is always below the plain total, because every payment after time 0 is shrunk by $e^{-0.05t} < 1$.

```verify
a = 100; b = 20; r = 0.05; T = 10
E = exp(-r*T)
level = a*(1 - E)/r
assert abs((1 - E) - 0.393469) < 0.000001
assert abs(level - 786.94) < 0.005
boundary = -T*E/r
rest = (1 - E)/r^2
assert abs(boundary - (-121.31)) < 0.005
assert abs(rest - 157.39) < 0.005
I1 = boundary + rest
assert abs(I1 - 36.0816) < 0.00005
PV = level + b*I1
assert abs(PV - 1508.57) < 0.005
total = a*T + b*T^2/2
assert total == 2000
assert abs(total - PV - 491.43) < 0.005
# midpoint Riemann sum of the discounted stream
g(t) = (a + b*t)*exp(-r*t)
d = 0.001
ts = (d/2):d:(T - d/2)
assert abs(sum(map(ts, g))*d - PV) < 0.001
```

### Example 3 (hard): output of a plant that learns
As its workers gain experience, a new plant produces at the rate $q(t) = 40\ln(1 + t)$ thousand units a year, $t$ years after it opens. Find total output over the first 9 years and the average output rate.

1. $w = 1 + t$, $dw = dt$: $\;\displaystyle\int_0^9 40\ln(1 + t)\,dt = 40\int_1^{10}\ln w\,dw$
   *Why:* a linear inside only shifts the variable; the limits $t = 0$ and $t = 9$ become $w = 1$ and $w = 10$.
2. $u = \ln w$, $dv = dw$, so $du = \dfrac{dw}{w}$, $v = w$, and $\displaystyle\int \ln w\,dw = w\ln w - \int w \cdot \frac1w\,dw = w\ln w - w$
   *Why:* $\ln w$ has no simple antiderivative of its own, but its derivative $1/w$ cancels against $v = w$ (LIATE: logarithm first).
3. $40\Big[w\ln w - w\Big]_1^{10} = 40\big[(10\ln 10 - 10) - (0 - 1)\big] = 40\,(23.02585 - 9) = 561.03$
   *Why:* at the lower limit $\ln 1 = 0$, but $-w$ still contributes $-1$, which is subtracted.
4. Average rate $= \dfrac{561.03}{9} = 62.34$ thousand units a year
   *Why:* the average value of a function is its integral divided by the length of the interval (C113). It lies below the final rate $40\ln 10 = 92.10$ because output rises over time.

```verify
a = 40; T = 9
F(w) = w*log(w) - w
assert abs(10*log(10) - 23.02585) < 0.000005
total = a*(F(10) - F(1))
assert abs(total - 561.03) < 0.005
assert abs(total - a*(10*log(10) - 9)) < 0.000001
assert abs(total/T - 62.34) < 0.005
assert abs(a*log(10) - 92.10) < 0.005
# F' equals ln w (numerical derivative at w = 4)
h = 0.00001
assert abs((F(4 + h) - F(4 - h))/(2*h) - log(4)) < 0.000001
# midpoint Riemann sum of the output rate
q(t) = a*log(1 + t)
d = 0.001
ts = (d/2):d:(T - d/2)
assert abs(sum(map(ts, q))*d - total) < 0.001
```

## Common mistakes
- Substituting $u = Q^2 + 16$ but keeping the limits 0 and 3 (FORGOT_LIMITS).
- Evaluating only at the upper limit, as if the antiderivative were zero at the lower one (LOWER_LIMIT_DROPPED).
- Replacing $Q\,dQ$ by $du$ instead of $\tfrac12\,du$ (FORGOT_DU_FACTOR).
- Integrating $u^{1/2}$ as $u^{3/2}$ divided by $\tfrac12$ (DIVIDED_BY_OLD_POWER).
- Writing $uv + \int v\,du$, or losing the minus sign inside $v = -e^{-rt}/r$ (PARTS_SIGN).
- Dropping the boundary term $[uv]$ and keeping only the new integral (FORGOT_BOUNDARY).
- Dividing by $r$ only once in the second part of $\int t\,e^{-rt}\,dt$ (DIVIDED_BY_R_ONCE).
- Reporting the plain total $aT + bT^2/2$ as the present value (NO_DISCOUNTING).
- Writing $\int \ln w\,dw = w\ln w$ and forgetting to subtract $\int 1\,dw$ (DROPPED_INTEGRAL_TERM).
- Taking $u = e^{-rt}$ and $dv = t\,dt$, which makes the new integral harder (WRONG_U_CHOICE).
- Leaving a mixture of $x$ and $u$ in the integral: after substituting, every $x$ and the $dx$ must be gone.

## Practice
- `substitution-total-from-marginal` (difficulty 1): the change in total cost from $MC = aQ\sqrt{Q^2 + c}$, or total revenue from $MR = aQ/(Q^2 + c)$, by substituting $u = Q^2 + c$; distractors FORGOT_LIMITS, LOWER_LIMIT_DROPPED, FORGOT_DU_FACTOR, DIVIDED_BY_OLD_POWER.
- `present-value-growing-stream` (difficulty 2): the present value $\int_0^T (a + bt)\,e^{-rt}\,dt$ of a linearly growing income stream, by parts; distractors PARTS_SIGN, FORGOT_BOUNDARY, DIVIDED_BY_R_ONCE, NO_DISCOUNTING.
- `total-output-log-rate` (difficulty 3): total output $\int_0^T a\ln(1 + t)\,dt$ of a plant that learns, by substitution and then parts; distractors DROPPED_INTEGRAL_TERM, PARTS_SIGN, LOWER_LIMIT_DROPPED.

## Real world
- Job and education choices: comparing careers means comparing the present value of earnings that rise with experience, which is the integral of a growing wage times a discount factor, as in Example 2.
- Project appraisal: governments value roads, power plants and other infrastructure whose yearly benefits grow with traffic or demand; the present value of a linearly growing benefit is the formula of this topic.
- Pensions and leases: payments linked to salary growth or to rents that rise each year are valued by discounting a growing stream over a fixed term.
- Learning curves: output or productivity that rises quickly at first and then levels off is often modelled with a logarithm, and total output over a period comes from integrating it by parts, as in Example 3.

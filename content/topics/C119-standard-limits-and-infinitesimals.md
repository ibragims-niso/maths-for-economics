---
id: C119
title: Standard limits and infinitesimals
block: C1
coreYear: 1
prerequisites: [C101, F07]
estMinutes: 40
status: draft
economicUses:
  - Continuous compounding as the limit of ever more frequent compounding
  - "Small-rate shortcuts: ln(1 + r) ≈ r and eʳ − 1 ≈ r for growth and interest rates"
  - Long-run ratios of costs, outputs or debts that grow at different speeds
  - Deciding which part of a formula matters when a quantity becomes very large or very small
generators: [rational-limit-at-infinity, one-to-infinity-limit, equivalent-infinitesimals-ratio]
widgets: [small-rate-approximations]
mistakeCodes:
  CONSTANT_RATIO:
    label: Compared the constant terms
    explanation: As the variable grows, the constant terms (fixed costs, starting levels) become tiny next to the squared terms. The long-run ratio is set by the leading coefficients, the numbers in front of the highest power.
  MIDDLE_TERMS:
    label: Compared the middle terms
    explanation: The linear terms also fade beside the squared terms. Divide top and bottom by the highest power; only the leading coefficients survive.
  FLIPPED_RATIO:
    label: Turned the ratio upside down
    explanation: Keep the first quantity on top. The limit of f/g is the leading coefficient of f divided by the leading coefficient of g, not the other way round.
  ONE_TO_INFINITY:
    label: Said 1 to the power infinity is 1
    explanation: A base that tends to 1 raised to a power that grows without limit is an indeterminate form. A base a little above 1 raised to a huge power can give any positive number; compound interest is the classic case. Write the base as 1 + a small part and use (1 + k/t)^t → eᵏ.
  DROPPED_FACTOR:
    label: Lost the factor in the exponent
    explanation: The power is c·x, not x, so the limit is e raised to c times (a − b). Carry the constant in front of x into the exponent of e.
  SIGN_SLIP:
    label: Got the sign of the exponent wrong
    explanation: Write the base as 1 + (a − b)/(x + b), numerator minus denominator in that order. If the top is the larger one the base is above 1 and the limit is above 1.
  DROPPED_COEFFICIENTS:
    label: Ignored the coefficients inside the functions
    explanation: sin 4x behaves like 4x near zero, not like x. Keep the number multiplying x inside each function; the limit is the ratio of these numbers.
  ZERO_OVER_ZERO:
    label: Took 0/0 to be 0
    explanation: 0/0 is not a number. Both top and bottom shrink to zero, and the limit depends on how fast each one shrinks; replace each by an equivalent simple quantity to compare them.
  FORGOT_POWER:
    label: Forgot the power in the root
    explanation: √(1 + u) − 1 is about u/2 near zero, because (1 + u)ᵏ − 1 ≈ k·u with k = ½. Leaving out the ½ doubles the answer.
resources:
  - { title: "Calculus Volume 1, 2.3 The Limit Laws (OpenStax)", url: "https://openstax.org/books/calculus-volume-1/pages/2-3-the-limit-laws", kind: textbook, verifiedAt: 2026-10-21 }
  - { title: "Calculus Volume 1, 4.6 Limits at Infinity and Asymptotes (OpenStax)", url: "https://openstax.org/books/calculus-volume-1/pages/4-6-limits-at-infinity-and-asymptotes", kind: textbook, verifiedAt: 2026-10-21 }
  - { title: "Calculus Volume 1, 6.8 Exponential Growth and Decay (OpenStax)", url: "https://openstax.org/books/calculus-volume-1/pages/6-8-exponential-growth-and-decay", kind: textbook, verifiedAt: 2026-10-21 }
---

## Why economists need this
A bank pays 6 % a year. Compounded once a year, 1 manat grows to 1.06; compounded monthly it grows to a little more; compounded every second, more still. Does it grow without limit? No: the amounts settle at $e^{0.06}$, and finding that number is a limit calculation. Economists also write the growth rate of GDP as a difference of logarithms, which only works because $\ln(1 + g)$ is almost exactly $g$ for small $g$. And when two costs or two debts grow at different speeds, the long-run ratio between them is again a limit. C101 showed what a limit is; this topic gives the handful of standard limits and the tricks that turn hard-looking limits into easy ones.

## Intuition
Most limits worth computing look like nonsense when you plug the number in: $\frac{0}{0}$, $\frac{\infty}{\infty}$, $\infty - \infty$ or $1^\infty$. These are called **indeterminate forms**: they say only that two effects are fighting, not who wins. The way out is to compare *how fast* things grow or shrink.

A quantity that tends to zero is an **infinitesimal**. Two infinitesimals can shrink at very different speeds: $x^2$ is tiny next to $x$ when $x$ is small, so $x^2/x \to 0$. Others shrink at the same speed: near zero, $\ln(1 + x)$, $e^x - 1$ and $\sin x$ are all almost exactly $x$, so you can swap one for the other inside a product or a quotient. A few standard limits, learned once, then solve a whole family of problems.

## Definition and formulas
**Infinitesimals and infinitely large quantities.** $\alpha(x)$ is an **infinitesimal** as $x \to a$ if $\alpha(x) \to 0$; it is **infinitely large** if $|\alpha(x)|$ grows without limit. If $\alpha$ is an infinitesimal (and not 0), then $1/\alpha$ is infinitely large, and the other way round. A function has the limit $A$ exactly when $f(x) = A + \alpha(x)$ with $\alpha$ an infinitesimal.

- A sum of finitely many infinitesimals is an infinitesimal.
- A bounded quantity times an infinitesimal is an infinitesimal: $\dfrac{\sin x}{x} \to 0$ as $x \to \infty$, because $|\sin x| \le 1$.

**Comparing infinitesimals.** Let $\alpha, \beta \to 0$ and look at $\alpha/\beta$:

- if $\alpha/\beta \to 0$, $\alpha$ is of **higher order** (it shrinks faster), written $\alpha = o(\beta)$;
- if $\alpha/\beta \to c \ne 0$, they are of the **same order**;
- if $\alpha/\beta \to 1$, they are **equivalent**, written $\alpha \sim \beta$.

**Equivalent infinitesimals as $u \to 0$** (each follows from the standard limits below):
$$\sin u \sim u, \quad \tan u \sim u, \quad \ln(1 + u) \sim u, \quad e^{u} - 1 \sim u$$
$$a^{u} - 1 \sim u\ln a, \quad (1 + u)^{k} - 1 \sim k\,u, \quad 1 - \cos u \sim \tfrac{u^2}{2}$$
In a **product or a quotient** you may replace an infinitesimal by an equivalent one without changing the limit. Do not do it inside a sum or a difference: there the parts that cancel are exactly the ones that matter.

**The two standard limits.**
$$\lim_{x \to 0} \frac{\sin x}{x} = 1 \qquad (x \text{ in radians}), \qquad\qquad \lim_{x \to \infty} \left(1 + \frac{1}{x}\right)^{x} = e \approx 2.71828$$
The second one has a version for every rate $k$: $\displaystyle\lim_{x \to \infty}\left(1 + \frac{k}{x}\right)^{x} = e^{k}$, or equivalently $(1 + u)^{1/u} \to e$ as $u \to 0$. This is continuous compounding: $n$ compoundings a year at the nominal rate $r$ for $t$ years give the factor $\left(1 + \frac{r}{n}\right)^{nt} \to e^{rt}$. At 6 % for 5 years, monthly compounding gives $1.005^{60} = 1.3489$, and the limit is $e^{0.3} = 1.3499$.

**Recipes for the common forms.**

- $\dfrac{\infty}{\infty}$ for polynomials: divide top and bottom by the highest power of the variable. Same degree: the limit is the ratio of the leading coefficients. Higher degree on top: the ratio grows without limit. Higher degree below: the limit is 0.
- $\dfrac{0}{0}$ for polynomials: factor and cancel the common factor (C101). With roots, multiply by the conjugate.
- $\dfrac{0}{0}$ with $\sin$, $\ln$ and exponentials: replace each part by its equivalent and cancel.
- $1^\infty$: write the base as $1 + \alpha$ with $\alpha \to 0$; then $(1 + \alpha)^{v} \to e^{\lim \alpha v}$.
- $\infty - \infty$ with roots: multiply and divide by the conjugate, for example $\sqrt{x^2 + 6x} - x = \dfrac{6x}{\sqrt{x^2 + 6x} + x} \to 3$.

The same rules work for sequences, with $n \to \infty$ in place of $x \to \infty$.

## Interactive
::widget{id="small-rate-approximations"}

Move the **rate g** slider. The dashed gold line is $g$ itself; the purple curve is the log rate $\ln(1 + g)$ and the green curve is $e^{g} - 1$, the yearly rate that a continuous rate $g$ turns into. The panel shows each of $\ln(1 + g)$, $e^{g} - 1$ and $\sin g$ divided by $g$. At $g = 10\,\%$ it shows 0.953, 1.052 and 0.998: the shortcuts are already off by about 5 %. Slide down to 1 % and the ratios become 0.995, 1.005 and 1: near zero the three quantities are equivalent to $g$, which is why economists can treat a log difference as a growth rate.

## Worked examples

### Example 1 (easy): the long-run cost ratio of two plants
An old plant has cost $C_1(q) = 2q^2 + 30q + 500$ and a new plant $C_2(q) = 5q^2 + 10q + 800$. What does the cost ratio $C_1/C_2$ tend to as output grows?

1. $\dfrac{2q^2 + 30q + 500}{5q^2 + 10q + 800} = \dfrac{2 + \frac{30}{q} + \frac{500}{q^2}}{5 + \frac{10}{q} + \frac{800}{q^2}}$
   *Why:* both costs grow without limit, an $\infty/\infty$ form, so divide top and bottom by $q^2$, the highest power.
2. $\dfrac{30}{q},\ \dfrac{500}{q^2},\ \dfrac{10}{q},\ \dfrac{800}{q^2} \to 0$
   *Why:* a fixed number divided by a growing one is an infinitesimal.
3. $\displaystyle\lim_{q \to \infty} \frac{C_1(q)}{C_2(q)} = \frac{2}{5} = 0.4$
   *Why:* only the leading coefficients survive. The fixed costs 500 and 800 decide which plant is cheaper for small output but not in the long run.
4. At $q = 100$ the ratio is $0.4537$; at $q = 1000$ it is $0.4052$.
   *Why:* a check by numbers: the ratio creeps towards 0.4 as output grows.

```verify
C1(q) = 2*q^2 + 30*q + 500
C2(q) = 5*q^2 + 10*q + 800
assert abs(C1(100)/C2(100) - 0.4537) < 0.0001
assert abs(C1(1000)/C2(1000) - 0.4052) < 0.0001
assert abs(C1(10^8)/C2(10^8) - 0.4) < 0.000001
```

### Example 2 (medium): a limit of the form 1 to the power infinity
Find $\displaystyle\lim_{x \to \infty} \left(\frac{x + 3}{x - 1}\right)^{2x}$.

1. $\dfrac{x + 3}{x - 1} \to 1$ and $2x \to \infty$
   *Why:* the form is $1^\infty$, which is indeterminate: the answer is not simply 1.
2. $\dfrac{x + 3}{x - 1} = 1 + \dfrac{4}{x - 1}$
   *Why:* write the base as 1 plus a small part; $(x + 3) = (x - 1) + 4$.
3. With $t = x - 1$: $\left(1 + \dfrac{4}{t}\right)^{2t + 2} = \left[\left(1 + \dfrac{4}{t}\right)^{t}\right]^{2} \cdot \left(1 + \dfrac{4}{t}\right)^{2}$
   *Why:* $2x = 2t + 2$; split the power so the standard limit appears.
4. $\to (e^{4})^{2} \cdot 1 = e^{8} \approx 2980.958$
   *Why:* $(1 + 4/t)^t \to e^4$ and the last bracket tends to $1^2 = 1$. Shortcut: the limit of (small part) × (power) is $\frac{4}{x - 1} \cdot 2x \to 8$.

```verify
x = 10^6
value = exp(2*x*log((x + 3)/(x - 1)))
assert abs(value/exp(8) - 1) < 0.0001
assert abs(exp(8) - 2980.958) < 0.001
```

### Example 3 (hard): equivalent infinitesimals, and where not to use them
Find $\displaystyle\lim_{x \to 0} \frac{\ln(1 + 3x)}{e^{2x} - 1}$, and then explain why the same trick fails for $\displaystyle\lim_{x \to 0} \frac{e^{x} - 1 - x}{x^2}$.

1. At $x = 0$ the first limit is $\dfrac{\ln 1}{e^0 - 1} = \dfrac{0}{0}$.
   *Why:* an indeterminate form, so compare how fast the top and the bottom shrink.
2. $\ln(1 + 3x) \sim 3x$ and $e^{2x} - 1 \sim 2x$
   *Why:* use $\ln(1 + u) \sim u$ with $u = 3x$ and $e^{u} - 1 \sim u$ with $u = 2x$.
3. $\displaystyle\lim_{x \to 0} \frac{3x}{2x} = \frac{3}{2} = 1.5$
   *Why:* in a quotient each infinitesimal may be replaced by an equivalent one; then $x$ cancels.
4. In $\dfrac{e^{x} - 1 - x}{x^2}$, replacing $e^{x} - 1$ by $x$ would give $\dfrac{x - x}{x^2} = 0$, which is wrong.
   *Why:* the swap is only safe in products and quotients. Here $e^x - 1$ and $x$ are subtracted, and what is left after they cancel is exactly the part the swap throws away.
5. The true value is $\dfrac12$: $e^{x} = 1 + x + \dfrac{x^2}{2} + \dots$, so $\dfrac{e^{x} - 1 - x}{x^2} \to \dfrac{1}{2}$.
   *Why:* keep the next term of the expansion (C111 and C117); C120's L'Hôpital rule gives the same answer.

```verify
x = 0.0001
assert abs(log(1 + 3*x)/(exp(2*x) - 1) - 1.5) < 0.001
assert abs((exp(x) - 1 - x)/x^2 - 0.5) < 0.001
```

## Common mistakes
- Comparing the constant terms (the fixed costs) instead of the leading coefficients (CONSTANT_RATIO).
- Comparing the middle, linear terms (MIDDLE_TERMS).
- Turning the ratio upside down (FLIPPED_RATIO).
- Deciding that 1 to the power infinity is 1 (ONE_TO_INFINITY).
- Losing the factor $c$ from the exponent $cx$ (DROPPED_FACTOR).
- Writing the small part as $(b - a)$ instead of $(a - b)$ and getting the sign of the exponent wrong (SIGN_SLIP).
- Treating $\sin 4x$ as if it were $\sin x \sim x$ and dropping the 4 (DROPPED_COEFFICIENTS).
- Reading $0/0$ as 0 (ZERO_OVER_ZERO).
- Forgetting that $\sqrt{1 + u} - 1 \sim u/2$, not $u$ (FORGOT_POWER).
- Swapping an infinitesimal for an equivalent one inside a sum or a difference, as in step 4 of Example 3.
- Using degrees instead of radians: $\sin x / x \to 1$ only when $x$ is measured in radians.

## Practice
- `rational-limit-at-infinity` (difficulty 1): the long-run ratio of two quadratic costs or outputs; distractors CONSTANT_RATIO, MIDDLE_TERMS, FLIPPED_RATIO.
- `one-to-infinity-limit` (difficulty 2): $\lim \left(\frac{x + a}{x + b}\right)^{cx} = e^{c(a - b)}$; distractors ONE_TO_INFINITY, DROPPED_FACTOR, SIGN_SLIP.
- `equivalent-infinitesimals-ratio` (difficulty 3): a $0/0$ limit of $\sin$, $\tan$, $\ln(1 + \cdot)$, $e^{\cdot} - 1$ or $\sqrt{1 + \cdot} - 1$ solved with equivalents; distractors FLIPPED_RATIO, DROPPED_COEFFICIENTS, ZERO_OVER_ZERO, FORGOT_POWER.

## Real world
- Continuous compounding: some financial models and many economic growth models use $e^{rt}$, the limit of ever more frequent compounding, because it is easier to work with than $(1 + r/n)^{nt}$. Jacob Bernoulli met the number $e$ in the 1680s while studying exactly this question about interest.
- Growth rates from logs: statistical offices and economists often report growth as $100 \cdot (\ln Y_t - \ln Y_{t-1})$. For growth of a few per cent this is almost the same as the percentage change, because $\ln(1 + g) \sim g$.
- The rule of 70: a quantity growing at $g$ % a year doubles in about $70/g$ years, a shortcut that rests on $\ln 2 \approx 0.69$ and $\ln(1 + g) \approx g$ (F07).
- Long-run comparisons: when two plants, regions or debts grow at different polynomial or exponential speeds, the long-run ratio between them is a limit, and it is set by the fastest-growing terms.

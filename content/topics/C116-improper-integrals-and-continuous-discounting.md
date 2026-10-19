---
id: C116
title: Improper integrals and continuous discounting
block: C1
coreYear: 1
prerequisites: [C113, FM02]
estMinutes: 45
status: draft
economicUses:
  - Value of land or a natural resource that yields rent for ever
  - Valuing a firm whose cash flows grow over time
  - The long-run cost of a permanent subsidy or pension promise
  - Present value of income received continuously, such as rents, royalties and wages
generators: [continuous-stream-present-value, growing-continuous-stream-value, improper-power-integral]
widgets: [continuous-discount-area]
mistakeCodes:
  UNDISCOUNTED:
    label: Added up the income without discounting
    explanation: A·T is the total of the payments, but income received later is worth less today. Integrate the discounted flow instead, ∫₀ᵀ A·e^(−rt) dt = A(1 − e^(−rT))/r, which is always smaller than A·T.
  PERPETUITY_INSTEAD:
    label: Valued a stream that stops as if it lasted for ever
    explanation: A/r is the value of income that never ends. When the income stops after T years, multiply A/r by the share 1 − e^(−rT) that the first T years provide.
  DISCRETE_ANNUITY:
    label: Used the yearly annuity formula
    explanation: A(1 − (1 + r)^(−T))/r values one payment at the end of each year, discounted once a year. Income that arrives continuously and a continuously compounded rate need the integral formula A(1 − e^(−rT))/r.
  LUMP_AT_END:
    label: Discounted the whole total from the last date
    explanation: A·T·e^(−rT) treats all the income as if it arrived at time T. Most of it arrives much earlier, so each moment's income must be discounted from its own date, which is what the integral does.
  IGNORED_GROWTH:
    label: Ignored the growth of the income
    explanation: A/r values a flow that stays at A for ever. When the flow grows like A·e^(gt), growth offsets part of the discounting and the value is A/(r − g), which is larger.
  GROWTH_ADDED:
    label: Added the growth rate instead of subtracting it
    explanation: A·e^(gt)·e^(−rt) = A·e^(−(r − g)t), so the stream is discounted at r − g, not r + g. Growth makes the stream worth more, never less.
  RATES_SWAPPED:
    label: Subtracted the rates the wrong way round
    explanation: With g < r the value A/(r − g) is positive. Writing A/(g − r) gives a negative value, which cannot be the price of a stream of positive income.
  GREW_FIRST_PAYMENT:
    label: Grew the starting flow as in the yearly formula
    explanation: In the yearly growing perpetuity C₁/(r − g) the first payment comes a year from now, so it is grown once. A continuous stream starts at the rate A today, so the value is simply A/(r − g).
  DIVIDED_BY_P:
    label: Divided by p instead of p − 1
    explanation: The power rule raises the power by 1, from −p to 1 − p, and divides by the new power. So ∫ x^(−p) dx = x^(1−p)/(1 − p), not x^(1−p)/(−p).
  SIGN:
    label: Got a negative total
    explanation: The antiderivative −x^(1−p)/(p − 1) is negative, but the integral is its value at the top limit (0, in the limit) minus its value at the bottom limit. A positive function always has a positive integral.
  IGNORED_LOWER_LIMIT:
    label: Ignored the lower limit
    explanation: 1/(p − 1) is the value of the integral from 1 to infinity. From a lower limit a it is a^(1−p)/(p − 1), so the lower limit must be put into the antiderivative.
resources:
  - { title: "Calculus Volume 2, 3.7 Improper Integrals (OpenStax)", url: "https://openstax.org/books/calculus-volume-2/pages/3-7-improper-integrals", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Single Variable Calculus, Session 91: Improper Integrals (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/pages/unit-5-exploring-the-infinite/part-a-lhospitals-rule-and-improper-integrals/session-91-improper-integrals/", kind: course, verifiedAt: 2026-10-18 }
  - { title: "Principles of Finance, 8.1 Perpetuities (OpenStax)", url: "https://openstax.org/books/principles-finance/pages/8-1-perpetuities", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
What is a field worth if it can be rented out for ever? What should an investor pay for a firm whose profits keep growing, with no date when they stop? How much does a government commit to when it promises a subsidy "permanently"? Each question asks for the value today of income that never ends. Adding up infinitely many amounts sounds hopeless, yet the answer is usually a finite number, because income far in the future is worth very little today. Improper integrals are the tool that turns "for ever" into a number, and continuous discounting is the setting where economists use them most.

## Intuition
A definite integral (C113) adds up a flow over a fixed interval: income received at the rate $A$ a year for $T$ years. Discounting shrinks each moment's income by the factor $e^{-rt}$ (FM02): with continuous compounding at rate $r$, one unit received at time $t$ is worth $e^{-rt}$ today. So the present value of a stream is the area under the curve $A e^{-rt}$, not under the flat line $A$.

Now let the stream last for ever. The area is no longer over a fixed interval, so we do what we always do with "infinity": compute the area up to a finite horizon $b$, then ask what happens as $b$ grows. If the curve falls fast enough, each extra year adds a thinner and thinner slice, and the total settles at a limit. The integral then **converges**, and the limit is its value. If the curve does not fall fast enough, the total grows without bound and the integral **diverges**.

Speed of decline is what matters, not just that the curve approaches zero. The curve $1/x$ tends to zero, but too slowly: its area from 1 to infinity is infinite. The curve $1/x^2$ falls faster and has area exactly 1. The curve $e^{-rt}$ falls faster than any power, so a discounted stream of constant income always has a finite value.

## Definition and formulas
**Improper integral over an infinite interval.** If $f$ is continuous on $[a, \infty)$,
$$\int_a^{\infty} f(x)\,dx = \lim_{b \to \infty} \int_a^{b} f(x)\,dx$$
The integral **converges** if this limit exists as a finite number and **diverges** otherwise.

**The power test.** For $p \ne 1$, $\displaystyle\int_1^{b} x^{-p}\,dx = \frac{b^{1-p} - 1}{1 - p}$, and for $p = 1$ it is $\ln b$. Letting $b \to \infty$:
$$\int_1^{\infty} \frac{dx}{x^{p}} = \frac{1}{p - 1} \text{ if } p > 1, \qquad \text{diverges if } p \le 1$$
For example $\int_1^{\infty} x^{-2}\,dx = 1$, while $\int_1^{b} x^{-1}\,dx = \ln b$ is already 6.91 at $b = 1000$ and keeps growing. From a lower limit $a > 0$: $\displaystyle\int_a^{\infty} x^{-p}\,dx = \frac{a^{1-p}}{p - 1}$ for $p > 1$.

**The exponential integral.** For $r > 0$,
$$\int_0^{\infty} e^{-rt}\,dt = \lim_{b \to \infty} \frac{1 - e^{-rb}}{r} = \frac{1}{r}$$

**Unbounded integrand.** The same limit idea works when the function blows up at an end of a finite interval. For example $x^{-1/2}$ is infinite at $x = 0$, but
$$\int_0^{1} \frac{dx}{\sqrt{x}} = \lim_{c \to 0^{+}} \left[2\sqrt{x}\right]_c^{1} = \lim_{c \to 0^{+}} (2 - 2\sqrt{c}) = 2$$
By contrast $\int_0^1 x^{-1}\,dx$ diverges.

**Continuous discounting.** Rate $r$ a year, compounded continuously:
- A single payment $F$ at time $t$ is worth $F e^{-rt}$ today.
- Income at the rate $A$ a year for $T$ years:
$$PV = \int_0^{T} A e^{-rt}\,dt = \frac{A}{r}\left(1 - e^{-rT}\right)$$
- The same income for ever (a perpetual stream): $PV = \displaystyle\int_0^{\infty} A e^{-rt}\,dt = \frac{A}{r}$.
- The factor $1 - e^{-rT}$ is the share of the perpetual value that the first $T$ years provide.
- Income growing continuously, $A e^{gt}$, for ever, with $g < r$:
$$PV = \int_0^{\infty} A e^{gt} e^{-rt}\,dt = \int_0^{\infty} A e^{-(r-g)t}\,dt = \frac{A}{r - g}$$
If $g \ge r$ the integral diverges: growth outruns discounting and no finite price exists.

**Link to FM04.** A perpetuity paying $C$ at the end of every year is worth $C/r$ when $r$ is the yearly rate. The continuous formula $A/r$ looks the same, but here $r$ is a continuously compounded rate and the income arrives smoothly through the year rather than in lumps at year ends.

## Interactive
::widget{id="continuous-discount-area"}

The graph shows a rent of 12,000 a year. The green dashed line is the rent itself, the solid curve is the rent discounted to today, $12{,}000\,e^{-rt}$, and the shaded area up to the horizon $T$ is its present value. Move the "Horizon T (years)" slider and watch the "Share captured" read-out. At the start (6 %, 15 years) the panel shows 118,686.07, the answer of Example 1, which is 59.3 % of the 200,000 the rent is worth for ever. Move $T$ to 39 and the share passes 90 %; at 80 years it is 99.2 %, yet the area never passes $A/r$. Then move the "Discount rate r" slider down to 1 %: the curve flattens, $A/r$ jumps to 1,200,000, and even 80 years capture only 55.1 % of it, because with little discounting the distant future still matters.

## Worked examples

### Example 1 (easy): leasing land for 15 years
A farmer leases out a field for 15 years. The rent of 12,000 a year is received continuously, at a steady rate. The discount rate is 6 % a year, compounded continuously. What is the rent worth today?

1. $PV = \displaystyle\int_0^{15} 12{,}000\,e^{-0.06t}\,dt$
   *Why:* the rent received in a short interval $dt$ is $12{,}000\,dt$, and it is worth $e^{-0.06t}$ times that today; integrating adds up all these pieces.
2. $\displaystyle\int_0^{15} 12{,}000\,e^{-0.06t}\,dt = \left[-\frac{12{,}000}{0.06}\,e^{-0.06t}\right]_0^{15} = 200{,}000\left(1 - e^{-0.9}\right)$
   *Why:* an antiderivative of $e^{-rt}$ is $-e^{-rt}/r$ (C112); evaluate it at the two limits and subtract.
3. $e^{-0.9} = 0.406570$
   *Why:* this is what one unit of rent received at the end of the lease is worth today.
4. $PV = 200{,}000 \times (1 - 0.406570) = 118{,}686.07$
   *Why:* 200,000 would be the value of the rent for ever; the first 15 years provide 59.3 % of it.
5. Undiscounted, the rent adds up to $15 \times 12{,}000 = 180{,}000$, so discounting removes about a third.
   *Why:* rent received in later years is worth much less today, so the area under $12{,}000\,e^{-0.06t}$ is far below the rectangle $12{,}000 \times 15$.

```verify
A = 12000; r = 0.06; T = 15
assert abs(r*T - 0.9) < 0.000000001
f = exp(-r*T)
assert abs(f - 0.406570) < 0.000001
PV = A*(1 - f)/r
assert abs(A/r - 200000) < 0.000001
assert abs(PV - 118686.07) < 0.005
assert abs((1 - f)*100 - 59.3) < 0.05
# the same value by adding up 15000 thin slices of discounted rent (midpoint rule)
h = T/15000
assert abs(sum(A*h*e.^(-r*h*((0:14999) + 0.5))) - PV) < 0.01
assert A*T == 180000
assert abs(1 - PV/(A*T) - 1/3) < 0.01
```

### Example 2 (medium): owning the land for ever
The same field can be rented out for ever at 12,000 a year, received continuously, with a discount rate of 6 %. What is the field worth? How long does it take for the rent to make up 90 % of that value, and how does the value compare with rent paid once a year?

1. $\displaystyle\int_0^{\infty} 12{,}000\,e^{-0.06t}\,dt = \lim_{b \to \infty} 200{,}000\left(1 - e^{-0.06b}\right)$
   *Why:* an integral to infinity is defined as the limit of integrals to a finite horizon $b$; the integral to $b$ was found in Example 1.
2. $e^{-0.06b} \to 0$ as $b \to \infty$, so the field is worth $200{,}000$
   *Why:* the integral converges because the discounted rent falls exponentially. The value is $A/r$; the first 50 years alone give 190,042.59.
3. $1 - e^{-0.06T} = 0.9 \Rightarrow T = \dfrac{\ln 10}{0.06} = 38.38$ years
   *Why:* $1 - e^{-rT}$ is the share of the perpetual value earned by time $T$; solve $e^{-0.06T} = 0.1$ with the natural logarithm.
4. Paid as 12,000 at the end of each year, at the equivalent yearly rate $e^{0.06} - 1 = 6.18\%$: $\dfrac{12{,}000}{0.0618365} = 194{,}060.00$
   *Why:* this is the discrete perpetuity $C/r$ of FM04. Rent received through the year arrives on average about half a year earlier, so the continuous stream is worth 5940 more, roughly half a year's rent.
5. Without discounting, $\displaystyle\int_0^{b} 12{,}000\,dt = 12{,}000\,b \to \infty$
   *Why:* the undiscounted integral diverges; only discounting makes a perpetual stream finite.

```verify
A = 12000; r = 0.06
V = A/r
assert V == 200000
# integrals to longer and longer horizons approach V from below
assert abs(V*(1 - exp(-r*50)) - 190042.59) < 0.005
gap200 = V - V*(1 - exp(-r*200))
assert gap200 > 1 and gap200 < 2
assert V - V*(1 - exp(-r*500)) < 0.000001
T90 = log(10)/r
assert abs(T90 - 38.38) < 0.005
assert abs(1 - exp(-r*T90) - 0.9) < 0.000000001
i = exp(r) - 1
assert abs(i - 0.0618365) < 0.0000001
assert abs(i*100 - 6.18) < 0.005
D = A/i
assert abs(D - 194060.00) < 0.005
assert abs(V - D - 5940) < 0.01
assert abs((V - D)/A - 0.5) < 0.01
```

### Example 3 (hard): valuing a growing firm
A firm's net cash flow is currently 400,000 a year, received continuously. It is expected to grow continuously at 3 % a year for ever, so at time $t$ it flows at the rate $400{,}000\,e^{0.03t}$. Investors discount at 8 % a year, compounded continuously. What is the firm worth? How much of that value comes from the first 20 years, and what happens to the value if the discount rate falls to 7 %?

1. $400{,}000\,e^{0.03t}\,e^{-0.08t} = 400{,}000\,e^{-0.05t}$
   *Why:* multiplying powers of $e$ adds the exponents, so growth at 3 % and discounting at 8 % act like discounting at the gap of 5 %.
2. $\displaystyle\int_0^{\infty} 400{,}000\,e^{-0.05t}\,dt = \frac{400{,}000}{0.05} = 8{,}000{,}000$
   *Why:* this is the exponential integral $\int_0^\infty e^{-kt}\,dt = 1/k$ with $k = r - g = 0.05 > 0$, so it converges.
3. First 20 years: $\dfrac{400{,}000}{0.05}\left(1 - e^{-0.05 \times 20}\right) = 8{,}000{,}000\,(1 - e^{-1}) = 5{,}056{,}964.47$
   *Why:* the same integral to $T = 20$. That is 63.2 % of the value; the other 36.8 % comes from cash flows more than 20 years away, which is why firm values are so sensitive to long-run assumptions.
4. At 7 %: $\dfrac{400{,}000}{0.07 - 0.03} = \dfrac{400{,}000}{0.04} = 10{,}000{,}000$, a rise of 25 %
   *Why:* the value depends on the gap $r - g$; shrinking it from 5 to 4 points raises the value by a quarter.
5. If growth reached 8 %, the integrand would be the constant 400,000 and $\int_0^{b} 400{,}000\,dt = 400{,}000\,b \to \infty$
   *Why:* when $g \ge r$ the integral diverges, so the formula $A/(r - g)$ only applies when growth is slower than the discount rate.

```verify
A = 400000; g = 0.03; r = 0.08
k = r - g
assert abs(k - 0.05) < 0.000000001
V = A/k
assert abs(V - 8000000) < 0.000001
V20 = V*(1 - exp(-k*20))
assert abs(V20 - 5056964.47) < 0.005
assert abs(V20/V*100 - 63.2) < 0.05
assert abs(exp(-1)*100 - 36.8) < 0.05
# the growing, discounted flow added up numerically to a far horizon (midpoint rule)
h = 0.05
assert abs(sum(A*h*e.^(-k*h*((0:19999) + 0.5))) - V) < 30
V7 = A/(0.07 - g)
assert abs(V7 - 10000000) < 0.000001
assert abs(V7/V - 1.25) < 0.000000001
```

## Common mistakes
- Adding up the income, $A \times T$, without discounting it (UNDISCOUNTED).
- Using $A/r$ for income that stops after $T$ years (PERPETUITY_INSTEAD).
- Using the yearly annuity formula $A(1 - (1 + r)^{-T})/r$ for income received continuously at a continuously compounded rate (DISCRETE_ANNUITY).
- Discounting the whole total $A \times T$ from the last date, $A\,T\,e^{-rT}$, as if all the income arrived at the end (LUMP_AT_END).
- Valuing a growing stream as if it stayed at $A$ for ever (IGNORED_GROWTH).
- Writing $A/(r + g)$ instead of $A/(r - g)$ (GROWTH_ADDED).
- Writing $A/(g - r)$ and getting a negative value (RATES_SWAPPED).
- Multiplying the starting flow by $(1 + g)$, as in the yearly growing perpetuity, when a continuous stream already starts at the rate $A$ (GREW_FIRST_PAYMENT).
- Dividing by $p$ instead of $p - 1$ when integrating $x^{-p}$ (DIVIDED_BY_P).
- Subtracting the limits the wrong way round and getting a negative area for a positive function (SIGN).
- Using $1/(p - 1)$ when the lower limit is not 1 (IGNORED_LOWER_LIMIT).
- Thinking an integral to infinity converges just because the function tends to zero: $1/x$ tends to zero, yet $\int_1^\infty x^{-1}\,dx$ diverges.
- Using $A/(r - g)$ when $g \ge r$: the integral diverges and the formula gives nonsense.
- Treating $\int_0^1 x^{-1/2}\,dx$ like an ordinary definite integral without noticing that the function is infinite at 0; it needs a limit too.

## Practice
- `continuous-stream-present-value` (difficulty 1): present value of income received continuously at a constant rate for $T$ years, $A(1 - e^{-rT})/r$; distractors UNDISCOUNTED, PERPETUITY_INSTEAD, DISCRETE_ANNUITY, LUMP_AT_END.
- `growing-continuous-stream-value` (difficulty 2): value of a firm, land or a permanent subsidy whose flow grows continuously for ever, $A/(r - g)$; distractors IGNORED_GROWTH, GROWTH_ADDED, RATES_SWAPPED, GREW_FIRST_PAYMENT.
- `improper-power-integral` (difficulty 3): value of the convergent integral $\int_a^\infty c\,x^{-p}\,dx = c\,a^{1-p}/(p - 1)$ with $p > 1$; distractors DIVIDED_BY_P, SIGN, IGNORED_LOWER_LIMIT.

## Real world
- Land and natural resources: the price of farmland is often compared with the rent it earns. A price-to-rent ratio of 50 corresponds to a perpetual rent discounted at a gap $r - g$ of about 2 %, and falling interest rates push land prices up for the same reason.
- Firm valuation: analysts value a company by discounting its forecast cash flows and adding a "terminal value" for everything after the forecast years, which is a growing perpetuity of the form $A/(r - g)$. Small changes in $r$ or $g$ move this term a lot, as Example 3 shows.
- Public policy: a permanent subsidy, pension promise or tax cut has a finite present cost only because future amounts are discounted. Governments assessing long-lived projects such as flood defences or climate policy choose a discount rate, and the choice changes how much the far future counts.
- Continuous-time models: economic growth models, option pricing and models of resource extraction value income received at every instant, so their present values are improper integrals of the form $\int_0^\infty f(t)\,e^{-rt}\,dt$.

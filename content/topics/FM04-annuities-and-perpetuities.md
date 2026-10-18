---
id: FM04
title: Annuities and perpetuities
block: FM
coreYear: 1
prerequisites: [FM03, F08]
estMinutes: 45
status: draft
economicUses:
  - Valuing pensions and prizes paid in instalments
  - Saving plans for a house deposit or retirement
  - Leases and streams of rents
  - "Share prices with growing dividends (the Gordon growth model)"
  - Perpetual bonds such as consols
generators: [annuity-present-value, growing-perpetuity-value, saving-plan-payment]
widgets: [annuity-explorer]
mistakeCodes:
  UNDISCOUNTED:
    label: Added the payments without discounting
    explanation: n payments of C are not worth n × C today, because money received later is worth less than money now. Discount every payment, which is what multiplying C by the annuity factor (1 − (1 + r)^(−n))/r does.
  FV_INSTEAD:
    label: Used the future-value formula
    explanation: C((1 + r)^n − 1)/r is the value at the end of the plan, after all the interest has been earned. The value today is C(1 − (1 + r)^(−n))/r.
  DUE_TIMING:
    label: Mixed up payments at the start and at the end
    explanation: Payments at the end of each period form an ordinary annuity. Payments at the start (an annuity due) each come one period earlier, so they are worth (1 + r) times more. Check when the first payment is made before choosing the formula.
  PERPETUITY_INSTEAD:
    label: Used the perpetuity formula for a stream that stops
    explanation: C/r is the value of payments that go on for ever. When the payments stop after n periods, use C(1 − (1 + r)^(−n))/r, which is smaller.
  GROWTH_ADDED:
    label: Added the growth rate instead of subtracting it
    explanation: Growth makes later payments bigger, so it works against discounting. A growing perpetuity is worth C₁/(r − g), not C₁/(r + g).
  IGNORED_GROWTH:
    label: Ignored the growth of the payments
    explanation: C/r values a payment that stays the same for ever. When the payment grows at rate g, use C₁/(r − g), which is larger.
  CURRENT_PAYMENT:
    label: Used the payment just made, not the next one
    explanation: The formula C₁/(r − g) starts with the payment one period from now. If you are given the payment just made, C₀, grow it once first, C₁ = C₀(1 + g).
  NO_INTEREST:
    label: Divided the target by the number of deposits
    explanation: Target ÷ n ignores the interest your deposits earn, so it asks you to save too much. Divide the target by the future-value factor ((1 + r)^n − 1)/r instead.
  PV_INSTEAD:
    label: Treated the savings target as a present value
    explanation: A savings target is an amount you will have at the end, so it is a future value. Dividing it by the present-value factor (1 − (1 + r)^(−n))/r gives the repayment on a loan of that size, which is more than you need to save.
resources:
  - { title: "Principles of Finance, 8.1 Perpetuities (OpenStax)", url: "https://openstax.org/books/principles-finance/pages/8-1-perpetuities", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Principles of Finance, 8.2 Annuities (OpenStax)", url: "https://openstax.org/books/principles-finance/pages/8-2-annuities", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Principles of Finance, 11.2 Dividend Discount Models (DDMs) (OpenStax)", url: "https://openstax.org/books/principles-finance/pages/11-2-dividend-discount-models-ddms", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
A retiring worker is offered either a lump sum today or 9000 a year for 20 years. A firm must decide whether to buy a machine or lease it for a monthly fee. An investor wants to know what a share is worth when its dividend grows every year. Each question asks for the value today of a long stream of payments. Simply adding the payments up gives the wrong answer, because money received later is worth less than money now. Annuity and perpetuity formulas discount the whole stream in one step.

## Intuition
An **annuity** is the same payment $C$ made at the end of every period for $n$ periods. Its present value is the sum of the present values of the separate payments (FM03). Each payment is discounted once more than the one before it, so the terms shrink by the same factor $1/(1 + r)$ every period: they form a geometric series (F08), and a geometric series has a short formula for its sum.

A **perpetuity** pays $C$ every period for ever. Infinitely many payments still have a finite value, because payments far in the future are worth almost nothing today. There is a neat way to see the value: put $C/r$ in a bank at rate $r$ and it pays $C$ of interest every period while the deposit stays untouched. So $C/r$ today buys exactly the same stream.

The two ideas fit together. An annuity is a perpetuity that starts now minus a perpetuity that starts after $n$ periods, and the second one is worth $C/r$ discounted back $n$ periods. When the payments **grow** at rate $g$, growth works against discounting, and the stream behaves as if it were discounted at roughly $r - g$. The closer $g$ is to $r$, the larger the value; if $g \ge r$ the value is not finite at all.

## Definition and formulas
Payment $C$ per period, interest rate $r$ per period (as a decimal), $n$ payments, the first one period from now (an **ordinary annuity**).

Present value of an ordinary annuity: the payments' present values form a geometric sum with first term $\dfrac{C}{1 + r}$ and ratio $\dfrac{1}{1 + r}$, so
$$PV = \frac{C}{1 + r} + \frac{C}{(1 + r)^2} + \dots + \frac{C}{(1 + r)^n} = C \cdot \frac{1 - (1 + r)^{-n}}{r}$$
The fraction is called the **annuity factor**.

Future value of an ordinary annuity, the balance just after the last payment:
$$FV = C \cdot \frac{(1 + r)^n - 1}{r} = PV \cdot (1 + r)^n$$

Growing perpetuity: first payment $C_1$ one period from now, growing at rate $g$ per period, with $g < r$:
$$PV = \frac{C_1}{r - g}$$

- **Annuity due** (payments at the start of each period): every payment arrives one period earlier, so multiply the PV or FV formula by $(1 + r)$.
- **Perpetuity**: $PV = \dfrac{C}{r}$. This is the limit of the annuity formula as $n \to \infty$, because $(1 + r)^{-n} \to 0$.
- **Gordon growth model** for a share: $P_0 = \dfrac{D_1}{r - g}$, where $D_1 = D_0(1 + g)$ is next year's dividend and $D_0$ the one just paid.
- **Growing annuity** ($n$ growing payments): $PV = \dfrac{C_1}{r - g}\left[1 - \left(\dfrac{1 + g}{1 + r}\right)^{n}\right]$.
- Monthly payments: a rate of 6 % a year compounded monthly means $r = 0.06/12 = 0.005$ per month, and over $t$ years there are $n = 12t$ payments.

## Interactive
::widget{id="annuity-explorer"}

The graph shows a pension of 9000 a year. The solid curve is its value today for each number of years $n$, the green dashed line simply adds the payments up, and the gold dashed line is the perpetuity $C/r$. At the start (4 %, 20 payments) the panel shows 122,312.94, the answer of Example 1, which is 54.4 % of the perpetuity's 225,000. Move the number of payments to 60: the curve flattens, and the annuity reaches about 90.5 % of $C/r$, because payments that far away add little today. Then move the interest rate: a higher rate lowers every value and widens the gap between the solid curve and the green line.

## Worked examples

### Example 1 (easy): what a pension is worth today
A pension pays 9000 at the end of each year for 20 years. The interest rate is 4 % a year. What is the pension worth today?

1. $C = 9000$, $r = 0.04$, $n = 20$
   *Why:* one payment a year, at the end of each year, with a yearly rate: an ordinary annuity.
2. $(1.04)^{-20} = 0.456387$
   *Why:* this is the discount factor of the last payment, 20 years away.
3. Annuity factor $\dfrac{1 - 0.456387}{0.04} = 13.5903$
   *Why:* it is the sum of all 20 discount factors, from the geometric series formula.
4. $PV = 9000 \times 13.5903263\ldots = 122{,}312.94$
   *Why:* multiplying by the factor discounts every payment at once. Keep the factor at full calculator precision: rounding it to 13.5903 would move the answer by about 0.2.
5. Undiscounted, the payments add up to $20 \times 9000 = 180{,}000$, so the pension is worth about 68 % of that today.
   *Why:* later payments are discounted more heavily; the last one is worth less than half of 9000 today.

```verify
C = 9000; r = 0.04; n = 20
v = (1 + r)^(-n)
assert abs(v - 0.456387) < 0.000001
A = (1 - v)/r
assert abs(A - 13.5903) < 0.00005
PV = C*A
assert abs(PV - 122312.94) < 0.005
# the same value as discounting the 20 payments one by one
assert abs(sum(C ./ (1 + r).^(1:n)) - PV) < 0.000001
# a perpetuity now minus a perpetuity that starts after 20 years
assert abs(C/r - (C/r)*v - PV) < 0.000001
assert abs(PV - C*13.5903) < 0.3
assert n*C == 180000
assert abs(PV/(n*C) - 0.68) < 0.005
assert C*v < C/2
```

### Example 2 (medium): a share with growing dividends
A company has just paid a dividend of 2 per share. Dividends are expected to grow by 4 % a year for ever, and investors require a return of 9 % a year. What is the share worth, and how much does the price change if the required return rises to 10 %?

1. $D_1 = 2 \times 1.04 = 2.08$
   *Why:* the formula starts with the next dividend, one year away; the one just paid has already gone to the previous owner.
2. $P_0 = \dfrac{2.08}{0.09 - 0.04} = \dfrac{2.08}{0.05} = 41.60$
   *Why:* this is a growing perpetuity; discounting at 9 % while the dividend grows at 4 % works like discounting at the gap of 5 %.
3. Without growth: $\dfrac{2}{0.09} = 22.22$
   *Why:* a dividend stuck at 2 for ever is worth barely half as much, so expected growth is a large part of the share's value.
4. At 10 %: $P_0 = \dfrac{2.08}{0.10 - 0.04} = \dfrac{2.08}{0.06} = 34.67$, a fall of about 16.7 %.
   *Why:* the price depends on the small gap $r - g$; a one-point rise in $r$ widens the gap from 5 to 6 points and cuts the value by a sixth. This is why share prices react strongly to interest-rate news.

```verify
D0 = 2; g = 0.04; r = 0.09
D1 = D0*(1 + g)
assert abs(D1 - 2.08) < 0.000000001
P = D1/(r - g)
assert abs(P - 41.60) < 0.000001
# a long partial sum of the discounted growing dividends approaches P
assert abs(sum(D1*(1 + g).^(0:1999) ./ (1 + r).^(1:2000)) - P) < 0.000001
level = D0/r
assert abs(level - 22.22) < 0.005
P10 = D1/(0.10 - g)
assert abs(P10 - 34.67) < 0.005
assert abs((1 - P10/P)*100 - 16.7) < 0.05
assert abs(P10/P - 5/6) < 0.000001
```

### Example 3 (hard): a monthly saving plan
You want 20000 in 5 years for a deposit on a flat. Your savings account pays 4.8 % a year, compounded monthly. How much must you pay in at the end of each month? How does the answer change if you pay in at the start of each month instead?

1. $r = 0.048/12 = 0.004$, $n = 12 \times 5 = 60$
   *Why:* monthly deposits need a monthly rate and a count of months.
2. $(1.004)^{60} = 1.2706407$, so the future-value factor is $\dfrac{1.2706407 - 1}{0.004} = 67.6602$
   *Why:* saving 1 a month grows to $1 + 1.004 + 1.004^2 + \dots + 1.004^{59}$ by the end, a geometric series; the last deposit earns no interest, the first earns 59 months of it.
3. $C = \dfrac{20{,}000}{67.6602} = 295.59$
   *Why:* the plan is worth $C$ times the factor at the end; set that equal to the target and solve for $C$.
4. You pay in $60 \times 295.59 = 17{,}735.40$ yourself; interest adds the remaining 2264 or so.
   *Why:* compound interest on the growing balance does about a ninth of the work.
5. Annuity due: $C = \dfrac{20{,}000}{67.6602 \times 1.004} = 294.42$
   *Why:* a deposit made at the start of a month earns one extra month of interest, so the factor is multiplied by 1.004 and the required deposit falls slightly.

```verify
FV = 20000; r = 0.048/12; n = 12*5
assert abs(r - 0.004) < 0.000000001
assert n == 60
G = (1 + r)^n
assert abs(G - 1.2706407) < 0.0000001
F = (G - 1)/r
assert abs(F - 67.6602) < 0.00005
# the same factor as adding up what each deposit of 1 grows to
assert abs(sum((1 + r).^(0:59)) - F) < 0.000001
C = FV/F
assert abs(C - 295.59) < 0.005
assert abs(60*295.59 - 17735.40) < 0.000001
assert abs(FV - n*C - 2264) < 1
assert abs((FV - n*C)/FV - 1/9) < 0.005
Cdue = FV/(F*(1 + r))
assert abs(Cdue - 294.42) < 0.005
```

## Common mistakes
- Adding up the payments without discounting them (UNDISCOUNTED).
- Using the future-value formula when the question asks for the value today (FV_INSTEAD).
- Treating payments at the start of each period as if they came at the end, or the other way round (DUE_TIMING).
- Using the perpetuity formula $C/r$ for payments that stop after $n$ periods (PERPETUITY_INSTEAD).
- Writing $C_1/(r + g)$ instead of $C_1/(r - g)$ (GROWTH_ADDED).
- Valuing a growing stream as if the payment stayed the same for ever (IGNORED_GROWTH).
- Putting the dividend just paid into the Gordon formula instead of next year's dividend (CURRENT_PAYMENT).
- Dividing a savings target by the number of deposits and forgetting the interest (NO_INTEREST).
- Dividing a savings target by the present-value factor, as if it were a loan taken out today (PV_INSTEAD).
- Using the annual rate with monthly payments, or counting years instead of months.
- Using $C_1/(r - g)$ when $g \ge r$: the formula only works when growth is slower than the discount rate.

## Practice
- `annuity-present-value` (difficulty 1): value today of equal payments at the end of each year or month; distractors UNDISCOUNTED, FV_INSTEAD, DUE_TIMING, PERPETUITY_INSTEAD.
- `growing-perpetuity-value` (difficulty 2): value of a share or a field whose dividend or rent grows at a constant rate for ever, $C_0(1 + g)/(r - g)$; distractors GROWTH_ADDED, IGNORED_GROWTH, CURRENT_PAYMENT.
- `saving-plan-payment` (difficulty 3): the regular deposit that reaches a savings target, $FV \cdot r/((1 + r)^n - 1)$; distractors NO_INTEREST, PV_INSTEAD, DUE_TIMING.

## Real world
- Pensions: at retirement a pension pot can be exchanged for an annuity, a fixed income for life. Insurers price it with the annuity formula, so when interest rates fall the same pot buys a smaller yearly income.
- Leases: under the IFRS 16 accounting standard, a company that leases offices, aircraft or machines records the present value of its future lease payments as a debt on its balance sheet.
- Consols: the UK government once borrowed through consols, bonds that paid a fixed amount every year with no repayment date, so their price followed $C/r$. The last of them were repaid in 2015.
- Shares and housing: analysts use the Gordon growth model to ask what dividend growth a share price implies, and the same logic links house prices to rents. Because value depends on the small gap $r - g$, a modest rise in interest rates can cut asset prices sharply.

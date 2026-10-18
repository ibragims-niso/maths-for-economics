---
id: FM03
title: Present value and discounting
block: FM
coreYear: 1
prerequisites: [FM01]
estMinutes: 40
status: draft
economicUses:
  - Valuing a promised future payment
  - "Lottery prizes: a lump sum now or payments later"
  - Cost–benefit analysis of public projects
  - Comparing offers paid at different dates
  - Pricing savings certificates and Treasury bills
generators: [present-value-single, present-value-uneven-flows, implied-annual-rate]
widgets: [discounting-explorer]
mistakeCodes:
  COMPOUNDED_FORWARD:
    label: Multiplied instead of divided
    explanation: Multiplying by (1 + r)ⁿ moves money further into the future. To bring a future amount back to today, divide by (1 + r)ⁿ.
  SIMPLE_DISCOUNT:
    label: Discounted with simple interest
    explanation: Dividing by (1 + rn) ignores interest on interest. With annual compounding the present value is FV/(1 + r)ⁿ.
  EXPONENT_OFF_BY_ONE:
    label: Used the wrong number of years
    explanation: A payment n years away is divided by (1 + r) once for each of the n years. Count the years from today to the date of the payment.
  SAME_DATE:
    label: Discounted every payment over the same period
    explanation: Each payment is discounted by its own date. An amount due in year t is divided by (1 + r)^t, so payments that come sooner lose less value.
  FIRST_NOT_DISCOUNTED:
    label: Treated the first payment as paid today
    explanation: Only money paid today keeps its full value. A payment due in one year must also be divided by (1 + r).
  NO_DISCOUNTING:
    label: Added the amounts without discounting
    explanation: Money at different dates cannot be added directly. Discount each amount to today first, then add the present values.
  SIMPLE_RATE:
    label: Averaged the growth over the years
    explanation: Dividing the total growth by n ignores compounding. The annual rate solves (1 + r)ⁿ = FV/PV, so r = (FV/PV)^(1/n) − 1.
  TOTAL_GROWTH:
    label: Gave the total growth, not the annual rate
    explanation: FV/PV − 1 is the growth over all n years together. Take the n-th root of FV/PV first to get the growth per year.
  FACTOR_NOT_RATE:
    label: Gave the growth factor, not the rate
    explanation: (FV/PV)^(1/n) is 1 + r, the growth factor per year. Subtract 1 and multiply by 100 to get the rate in per cent.
resources:
  - { title: "Principles of Economics 3e, Appendix C Present Discounted Value (OpenStax)", url: "https://openstax.org/books/principles-economics-3e/pages/c-present-discounted-value", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Principles of Finance, 7.1 Now versus Later Concepts (OpenStax)", url: "https://openstax.org/books/principles-finance/pages/7-1-now-versus-later-concepts", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Principles of Finance, 7.2 Time Value of Money (TVM) Basics (OpenStax)", url: "https://openstax.org/books/principles-finance/pages/7-2-time-value-of-money-tvm-basics", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
Would you rather have 850 today or 1000 in three years? A lottery winner chooses between a lump sum now and payments spread over many years. A government asks whether a bridge that costs money today but saves travel time for decades is worth building. Each question compares money at different dates. Present value turns every future amount into its value today, so amounts can be compared and added.

## Intuition
Money today is worth more than the same money later: you could save it and earn interest, prices may rise in the meantime, and a promise may not be kept. FM01 showed how money grows forward in time: multiply by $(1 + r)$ for each year. **Discounting** runs the same process backwards: divide by $(1 + r)$ for each year. The present value of a future payment is the amount you would have to save today to have exactly that payment on its date. The further away the payment and the higher the interest rate, the less it is worth today. The rate used for this is called the **discount rate**.

## Definition and formulas
A payment $FV$ due in $n$ years, discount rate $r$ per year (as a decimal), compounded annually:
$$PV = \frac{FV}{(1 + r)^n} = FV\,(1 + r)^{-n}$$

- Discount factor: $d_n = \dfrac{1}{(1 + r)^n}$, so $PV = d_n \cdot FV$. For $r > 0$ it lies between 0 and 1, and it shrinks as $n$ or $r$ grows.
- Compounding $m$ times a year for $t$ years: $PV = \dfrac{FV}{\left(1 + \frac{r}{m}\right)^{mt}}$.
- Continuous discounting (see FM02): $PV = FV\,e^{-rt}$.
- Several payments $C_1, C_2, \dots$ due at times $t_1, t_2, \dots$: discount each one by its own date and add, $PV = \sum_k \dfrac{C_k}{(1 + r)^{t_k}}$. A payment made today ($t = 0$) is not discounted.
- The rate that turns $PV$ into $FV$ in $n$ years: $r = \left(\dfrac{FV}{PV}\right)^{1/n} - 1$.
- The time it takes: $n = \dfrac{\ln(FV/PV)}{\ln(1 + r)}$.

Real and nominal rates. If the nominal (quoted) rate is $r_{\text{nom}}$ and prices rise by $\pi$ a year (here $\pi$ is the inflation rate, not 3.14…), the real rate satisfies
$$1 + r_{\text{nom}} = (1 + r_{\text{real}})(1 + \pi), \qquad r_{\text{real}} \approx r_{\text{nom}} - \pi$$
The approximation is the Fisher approximation. Discount amounts written in money of the day at the nominal rate, and amounts written in today's prices at the real rate.

## Interactive
::widget{id="discounting-explorer"}

The curve shows what a payment of 1000 is worth today, depending on how many years away it is. Move the **Interest rate** slider and watch the whole curve sink: a higher rate makes later money worth less. Move the **Years until paid** slider to slide the dot along the curve; the panel shows the discount factor, the present value and how much is lost by waiting. Check: at 5 % and 3 years the panel shows a present value of 863.84, as in Example 1. At 5 % and 14 years the value has roughly halved, to 505.07.

## Worked examples

### Example 1 (easy): 1000 in three years or 850 today?
You are offered either 850 today or 1000 in three years. You can save at 5 % a year, compounded annually. Which is worth more?

1. $(1.05)^3 = 1.157625$
   *Why:* one unit saved today at 5 % grows by this factor in three years.
2. $PV = \dfrac{1{,}000}{1.157625} = 863.84$
   *Why:* discounting reverses compounding: 863.84 saved today would grow to exactly 1000 in three years.
3. $863.84 > 850$, so the 1000 in three years is worth more. Put the other way round, 850 saved today grows to only $850 \cdot 1.157625 = 983.98$.
   *Why:* amounts can only be compared at the same date; today is the easiest date to use.
4. With monthly compounding: $PV = \dfrac{1{,}000}{(1 + 0.05/12)^{36}} = 860.98$
   *Why:* when interest is added more often, money grows faster, so a future payment is worth a little less today. It is still more than 850.

```verify
FV = 1000; r = 0.05; n = 3
g = (1 + r)^n
assert abs(g - 1.157625) < 0.0000001
PV = FV/g
assert abs(PV - 863.84) < 0.005
assert PV > 850
assert abs(850*g - 983.98) < 0.005
PVm = FV/(1 + r/12)^(12*n)
assert abs(PVm - 860.98) < 0.005
assert PVm > 850 and PVm < PV
```

### Example 2 (medium): a lump sum or payments later
A prize-draw winner can take 12000 now, or 4000 in 1 year, 5000 in 3 years and 6000 in 4 years. The winner can save at 6 % a year, compounded annually. Which option is worth more today?

1. $\dfrac{4{,}000}{1.06} = 3{,}773.58$
   *Why:* the first payment is one year away, so it is discounted once.
2. $\dfrac{5{,}000}{1.06^{3}} = 4{,}198.10$
   *Why:* this payment is three years away, so it is divided by 1.06 three times.
3. $\dfrac{6{,}000}{1.06^{4}} = 4{,}752.56$
   *Why:* each payment is discounted by its own date; the latest loses the most.
4. $PV = 3{,}773.58 + 4{,}198.10 + 4{,}752.56 = 12{,}724.24$
   *Why:* all three amounts are now in money of today, so they can be added.
5. $12{,}724.24 - 12{,}000 = 724.24$, so the payments are worth more. At 10 % their present value would be only $11{,}491.02$, and the lump sum would win.
   *Why:* a higher discount rate shrinks later money more, so the best choice depends on the rate.

```verify
r = 0.06
a = 4000/(1 + r)
b = 5000/(1 + r)^3
c = 6000/(1 + r)^4
assert abs(a - 3773.58) < 0.005
assert abs(b - 4198.10) < 0.005
assert abs(c - 4752.56) < 0.005
assert abs(3773.58 + 4198.10 + 4752.56 - 12724.24) < 0.000001
PV = a + b + c
assert abs(PV - 12724.24) < 0.01
assert abs(PV - 12000 - 724.24) < 0.01
PV10 = 4000/1.1 + 5000/1.1^3 + 6000/1.1^4
assert abs(PV10 - 11491.02) < 0.005
assert PV10 < 12000
```

### Example 3 (hard): the rate on a savings certificate, nominal and real
A savings certificate costs 7835.26 today and pays 10000 in 5 years, with nothing in between. What annual rate does it earn? If inflation is expected to be 2 % a year, what is the real rate?

1. $7{,}835.26\,(1 + r)^5 = 10{,}000 \Rightarrow (1 + r)^5 = 1.276282$
   *Why:* the price is the present value of the final payment at the rate the certificate earns.
2. $1 + r = 1.276282^{1/5} = 1.05$, so $r = 5\%$.
   *Why:* the fifth root turns growth over five years into growth per year.
3. Check by solving for the time: $n = \dfrac{\ln 1.276282}{\ln 1.05} = 5.00$ years.
   *Why:* the same equation, solved for the exponent with logarithms, gives back the five years.
4. Fisher approximation: $r_{\text{real}} \approx 5\% - 2\% = 3\%$
   *Why:* part of the 5 % only makes up for rising prices; the rest is a gain in what the money can buy.
5. Exact: $1 + r_{\text{real}} = \dfrac{1.05}{1.02} = 1.029412$, so $r_{\text{real}} = 2.94\%$.
   *Why:* the growth factors divide; subtracting the rates is only an approximation, and it is close when rates are low.

```verify
P = 7835.26; F = 10000; n = 5
k = F/P
assert abs(k - 1.276282) < 0.0000005
g = k^(1/n)
assert abs(g - 1.05) < 0.000001
r = g - 1
assert abs(r*100 - 5) < 0.005
t = log(k)/log(1.05)
assert abs(t - 5) < 0.005
infl = 0.02
assert abs((r - infl)*100 - 3) < 0.005
assert abs((1 + r)/(1 + infl) - 1.029412) < 0.000001
rr = (1 + r)/(1 + infl) - 1
assert abs(rr*100 - 2.94) < 0.005
```

## Common mistakes
- Multiplying by $(1 + r)^n$ instead of dividing, which moves the money further into the future instead of back to today (COMPOUNDED_FORWARD).
- Discounting with simple interest, $FV/(1 + rn)$, which ignores interest on interest (SIMPLE_DISCOUNT).
- Using the wrong power, for example $n - 1$ instead of $n$ (EXPONENT_OFF_BY_ONE).
- Discounting every payment over the same number of years instead of each by its own date (SAME_DATE).
- Treating a payment due in one year as if it were paid today (FIRST_NOT_DISCOUNTED).
- Adding amounts paid at different dates without discounting them first (NO_DISCOUNTING).
- Dividing the total growth by the number of years to get the annual rate (SIMPLE_RATE).
- Giving the growth over all the years as the annual rate (TOTAL_GROWTH).
- Stopping at $1 + r$ and giving the growth factor as the rate (FACTOR_NOT_RATE).
- Mixing real and nominal: amounts in today's prices go with the real rate, amounts in money of the day with the nominal rate.

## Practice
- `present-value-single` (difficulty 1): present value of one future payment with annual compounding; distractors COMPOUNDED_FORWARD, SIMPLE_DISCOUNT, EXPONENT_OFF_BY_ONE.
- `present-value-uneven-flows` (difficulty 2): present value of two or three uneven payments at different dates; distractors SAME_DATE, FIRST_NOT_DISCOUNTED, NO_DISCOUNTING, SIMPLE_DISCOUNT.
- `implied-annual-rate` (difficulty 3): the annual rate that turns today's price into a later payment, $r = (FV/PV)^{1/n} - 1$; distractors SIMPLE_RATE, TOTAL_GROWTH, FACTOR_NOT_RATE.

## Real world
- Cost–benefit analysis: governments discount the future costs and benefits of roads, hospitals and flood defences so they can be compared with the money spent today. Most finance ministries publish an official real discount rate for this, usually a few per cent a year.
- Climate policy: much of the damage from climate change falls decades ahead, so the discount rate matters enormously. A loss of 1 million in 100 years is worth about 370000 today at 1 % a year, but only about 7600 at 5 %.
- Lotteries and legal settlements: big lotteries let winners choose between a cash sum now and yearly payments, and courts value lost future earnings when they set compensation. Both are present-value calculations.
- Treasury bills: governments borrow for short periods by selling bills below their face value. The price is the present value of the face value, and the gap between them shows the interest rate (bond pricing is covered in FM07).

---
id: FM05
title: Loan and lease amortisation schedules
block: FM
coreYear: 1
prerequisites: [FM04]
estMinutes: 45
status: draft
economicUses:
  - Mortgage, car-loan and student-loan repayments
  - Splitting each payment into interest and repayment of the loan
  - Leasing equipment or a car instead of buying it on credit
  - How changes in interest rates hit borrowers' budgets
generators: [loan-level-payment, loan-schedule-row, lease-payment-residual]
widgets: [loan-schedule-bars]
mistakeCodes:
  IGNORED_INTEREST:
    label: Divided the amount by the number of payments
    explanation: L ÷ n would repay the loan only if it carried no interest. Every period the lender also charges interest on what is still owed, so the payment must be L·r/(1 − (1 + r)^(−n)), which is larger.
  FLAT_RATE:
    label: Charged interest on the whole loan for the whole term
    explanation: Adding the yearly interest on the original amount for every year, L(1 + R × years), and dividing by n overcharges the borrower, because the balance falls as it is repaid. Interest is charged only on what is still owed, which is what the annuity formula does.
  FV_FACTOR:
    label: Used the future-value factor
    explanation: L·r/((1 + r)^n − 1) is the deposit that would grow to L by the end, as in a saving plan. A loan is received today, so it equals the present value of the payments; divide by (1 − (1 + r)^(−n))/r instead.
  ANNUAL_RATE_MONTHLY:
    label: Used the annual rate for monthly payments
    explanation: With monthly payments, interest is charged every month at the monthly rate, the annual rate divided by 12. Using the annual rate every month charges about twelve times too much interest.
  INTEREST_ON_ORIGINAL:
    label: Charged interest on the original loan
    explanation: Only the first payment's interest is r × L. After that, interest is r times the balance still owed at the start of the period, which falls with every payment.
  SWAPPED_PARTS:
    label: Swapped interest and principal
    explanation: Each payment first pays the interest, r × opening balance; only the rest, payment − interest, repays the loan. Check which of the two parts the question asks for.
  OFF_BY_ONE:
    label: Used the balance one payment off
    explanation: Interest in payment k is charged on the balance after payment k − 1, the balance at the start of that period. The balance "after payment k" already has payment k taken off.
  PAYMENTS_SUBTRACTED:
    label: Subtracted the whole payments from the loan
    explanation: Part of every payment is interest and does not reduce the debt. The balance after k payments is the present value of the payments still to come, PMT·(1 − (1 + r)^(−(n − k)))/r.
  RESIDUAL_IGNORED:
    label: Ignored the residual value
    explanation: The lessee hands the asset back at the end, so the payments need to cover only the price minus the present value of the residual. Treating the whole price as a loan gives the payment for buying, which is higher.
  RESIDUAL_UNDISCOUNTED:
    label: Subtracted the residual value without discounting it
    explanation: The residual value is received only at the end of the lease, so it covers only RV(1 + r)^(−n) of today's price. Subtracting the full RV forgets that the lessor waits for it and loses interest of r × RV every month.
resources:
  - { title: "Principles of Finance, 8.3 Loan Amortization (OpenStax)", url: "https://openstax.org/books/principles-finance/pages/8-3-loan-amortization", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Contemporary Mathematics, 6.11 Buying or Leasing a Car (OpenStax)", url: "https://openstax.org/books/contemporary-mathematics/pages/6-11-buying-or-leasing-a-car", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "What is the difference between a mortgage interest rate and an APR? (Consumer Financial Protection Bureau)", url: "https://www.consumerfinance.gov/ask-cfpb/what-is-the-difference-between-a-mortgage-interest-rate-and-an-apr-en-135/", kind: article, verifiedAt: 2026-10-18 }
---

## Why economists need this
Most large purchases are paid for over time. A family buys a house with a 25-year mortgage, a student repays a loan for ten years after graduating, a firm leases its delivery vans instead of buying them. Each of these contracts swaps an amount today for a stream of equal payments, and each payment is part interest and part repayment of the debt. The split matters: it decides how fast the debt falls, how much a loan costs in total, what a firm reports as interest expense, and how hard a rise in interest rates hits a household's budget. An amortisation schedule shows the split payment by payment.

## Intuition
A loan with equal payments is an annuity seen from the borrower's side (FM04). The lender hands over $L$ today and receives the payments later, so $L$ must equal the present value of the payments. Solve the annuity formula for the payment instead of the value, and you have the instalment.

Now follow the debt month by month. Take a mortgage of 200,000 at 4.8 % a year, paid monthly over 25 years: the payment is 1145.99. In the first month the bank charges $0.004 \times 200{,}000 = 800$ of interest, so only 345.99 of the first payment reduces the debt. Next month the balance is slightly smaller, so the interest is slightly smaller and a little more of the same payment goes to the debt. The effect snowballs: early payments are mostly interest, late payments are mostly repayment. The payment never changes, only its split.

Each month's rule, "add one month's interest, subtract the payment", is the first-order difference equation $B_{t+1} = (1 + r)B_t - PMT$ (DY01). The level payment is exactly the one that brings this path down to zero after the last payment.

A **lease** is a loan of the use of an asset. The leasing company buys a machine, the user pays monthly, and the machine comes back at the end with some value left, its **residual value**. The payments only need to cover the part of the price that the returned machine does not.

## Definition and formulas
A loan $L$ is repaid with $n$ equal payments $PMT$ at the end of each period, at interest rate $r$ per period. For monthly payments at an annual rate $R$, use $r = R/12$ and $n = 12 \times$ years.

**Level payment.** The payments' present value equals the loan, $L = PMT \cdot \dfrac{1 - (1 + r)^{-n}}{r}$, so
$$PMT = \frac{L \cdot r}{1 - (1 + r)^{-n}}$$

**One row of the schedule.** With opening balance $B_{t-1}$ (and $B_0 = L$):
$$I_t = r\,B_{t-1}, \qquad P_t = PMT - I_t, \qquad B_t = B_{t-1} - P_t = (1 + r)B_{t-1} - PMT$$
$I_t$ is the interest part and $P_t$ the principal part (repayment of the loan). This is the schedule of Example 2, a loan of 50,000 at 8 % a year repaid in 5 yearly payments of 12,522.82:

| Year | Opening balance | Interest | Principal | Closing balance |
|---|---|---|---|---|
| 1 | 50,000.00 | 4000.00 | 8522.82 | 41,477.18 |
| 2 | 41,477.18 | 3318.17 | 9204.65 | 32,272.53 |
| 3 | 32,272.53 | 2581.80 | 9941.02 | 22,331.51 |
| 4 | 22,331.51 | 1786.52 | 10,736.30 | 11,595.21 |
| 5 | 11,595.21 | 927.62 | 11,595.21 | 0.00 |
| Total | | 12,614.11 | 50,000.00 | |

- **Principal parts grow geometrically.** $P_t = P_1 (1 + r)^{t-1}$ with $P_1 = PMT - rL$: in the table each principal part is 1.08 times the one before. Principal overtakes interest once $P_t > PMT/2$; this happens in the last $\ln 2 / \ln(1 + r)$ payments (the doubling time of money at rate $r$), or from the start if the loan is shorter than that.
- **Balance after $k$ payments**, two ways. Forwards, the present value of the $n - k$ payments still to come:
$$B_k = PMT \cdot \frac{1 - (1 + r)^{-(n-k)}}{r}$$
Backwards, the loan grown for $k$ periods minus the payments grown: $B_k = L(1 + r)^k - PMT \cdot \dfrac{(1 + r)^k - 1}{r}$. Both give the same number; keep the payment unrounded.
- **Total interest** over the life of the loan: $n \cdot PMT - L$.
- **Lease with residual value** $RV$ on an asset with price $V$: the payments cover the price minus the present value of the residual,
$$PMT = \frac{\big(V - RV(1 + r)^{-n}\big)\,r}{1 - (1 + r)^{-n}} = \frac{(V - RV)\,r}{1 - (1 + r)^{-n}} + r \cdot RV$$
The second form reads: repay the lost value $V - RV$ like a loan, and pay interest on the residual, which the lessor has tied up for the whole lease.
- **Equal-principal loan**: repay $L/n$ of principal every period plus the interest on the balance. The payments fall over time, the first one is larger than $PMT$, and the total interest, $rL(n + 1)/2$, is lower, because the debt falls faster.
- **APR**: lenders must quote an annual percentage rate so that offers can be compared; it also counts compulsory fees. In the United States the APR is a nominal rate, the monthly rate times 12; in the UK and the EU it is an effective annual rate (FM02). A rate of "6 % a year, compounded monthly" means $r = 0.06/12 = 0.005$ a month.

## Interactive
::widget{id="loan-schedule-bars"}

Each bar is one year of payments on a mortgage of 200,000: the gold part is interest, the green part repays the loan. At the start (4.8 % for 25 years) the panel shows a monthly payment of 1,145.99, total interest of 143,798.18 and principal ahead of interest from year 12; the first month in which principal is larger is month 128, late in year 11. Move the interest rate up to 10 %: the gold part swells, total interest rises to 345,220.45, well over twice as much, and principal takes the lead only in year 19. Back at 4.8 %, shorten the term to 10 years: the payment rises to 2,101.81, but total interest falls to 52,217.50 and principal is the larger part from year 1, because the debt is cleared before much interest can build up.

## Worked examples

### Example 1 (easy): the monthly payment on a car loan
A car loan of 18,000 is repaid in equal monthly payments over 5 years. The interest rate is 6 % a year, compounded monthly. What is the monthly payment, and how much interest is paid in total?

1. $r = 0.06/12 = 0.005$, $n = 12 \times 5 = 60$
   *Why:* payments are monthly, so interest is charged per month and the payments are counted in months.
2. $(1.005)^{-60} = 0.741372$, so the annuity factor is $\dfrac{1 - 0.741372}{0.005} = 51.725561$
   *Why:* the factor is the value today of 1 paid at the end of each of the 60 months (FM04).
3. $PMT = \dfrac{18{,}000}{51.725561} = 347.99$
   *Why:* the loan equals the present value of the payments, $PMT \times 51.725561$; solve for $PMT$.
4. Total paid $60 \times 347.99 = 20{,}879.40$, so total interest is $20{,}879.40 - 18{,}000 = 2879.40$
   *Why:* everything paid beyond the amount borrowed is interest.
5. Compare: $18{,}000/60 = 300$ ignores interest, and $18{,}000 \times 1.30/60 = 390$ charges 6 % a year on the full 18,000 for all 5 years.
   *Why:* the true payment lies between them: interest is charged, but only on the falling balance.

```verify
L = 18000; r = 0.06/12; n = 12*5
assert abs(r - 0.005) < 0.000000001
assert n == 60
v = (1 + r)^(-n)
assert abs(v - 0.741372) < 0.0000005
A = (1 - v)/r
assert abs(A - 51.725561) < 0.0000005
PMT = L/A
assert abs(PMT - 347.99) < 0.005
assert abs(PMT - L*r/(1 - (1 + r)^(-n))) < 0.000001
# the balance falls to zero after 60 months of B = (1 + r)B - PMT
B = L*(1 + r)^n - PMT*((1 + r)^n - 1)/r
assert abs(B) < 0.000001
assert abs(60*347.99 - 20879.40) < 0.000001
assert abs(60*347.99 - L - 2879.40) < 0.000001
assert L/n == 300
assert abs(L*(1 + 0.06*5)/n - 390) < 0.000001
assert L/n < PMT and PMT < 390
```

### Example 2 (medium): building a schedule
A firm borrows 50,000 at 8 % a year and repays it in 5 equal payments at the end of each year. Find the payment, the interest and principal parts of the first two payments, and the balance after two years. Then compare with an equal-principal loan.

1. $PMT = \dfrac{50{,}000 \times 0.08}{1 - (1.08)^{-5}} = \dfrac{4000}{1 - 0.680583} = 12{,}522.82$
   *Why:* the level-payment formula with $r = 0.08$ and $n = 5$.
2. Year 1: $I_1 = 0.08 \times 50{,}000 = 4000$, $P_1 = 12{,}522.82 - 4000 = 8522.82$, $B_1 = 41{,}477.18$
   *Why:* interest is charged on the opening balance; the rest of the payment reduces the debt.
3. Year 2: $I_2 = 0.08 \times 41{,}477.18 = 3318.17$, $P_2 = 9204.65$, $B_2 = 32{,}272.53$
   *Why:* the balance is lower, so interest is lower and more of the same payment repays the loan; $P_2 = 1.08 \times P_1$.
4. Check: $B_2 = 12{,}522.82 \times \dfrac{1 - (1.08)^{-3}}{0.08} = 12{,}522.82 \times 2.577097 = 32{,}272.53$
   *Why:* what is still owed is the present value of the 3 payments still to come, so the balance can be found without building the earlier rows.
5. Total interest $5 \times 12{,}522.8227 - 50{,}000 = 12{,}614.11$
   *Why:* everything paid beyond the loan is interest; the table in Definition and formulas shows all five rows.
6. Equal principal: repay 10,000 a year plus interest, so the payments are 14,000, 13,200, 12,400, 11,600 and 10,800, and total interest is $4000 + 3200 + 2400 + 1600 + 800 = 12{,}000$
   *Why:* the debt falls faster at the start, so less interest builds up, but the first payments are higher.

```verify
L = 50000; r = 0.08; n = 5
v = (1 + r)^(-n)
assert abs(v - 0.680583) < 0.0000005
PMT = L*r/(1 - v)
assert abs(PMT - 12522.82) < 0.005
I1 = r*L
P1 = PMT - I1
B1 = L - P1
assert I1 == 4000
assert abs(P1 - 8522.82) < 0.005
assert abs(B1 - 41477.18) < 0.005
I2 = r*B1
P2 = PMT - I2
B2 = B1 - P2
assert abs(I2 - 3318.17) < 0.005
assert abs(P2 - 9204.65) < 0.005
assert abs(B2 - 32272.53) < 0.005
assert abs(P2 - 1.08*P1) < 0.000001
a3 = (1 - (1 + r)^(-3))/r
assert abs(a3 - 2.577097) < 0.0000005
assert abs(PMT*a3 - B2) < 0.000001
# the remaining rows of the schedule, as printed in the table
I3 = r*B2; P3 = PMT - I3; B3 = B2 - P3
I4 = r*B3; P4 = PMT - I4; B4 = B3 - P4
I5 = r*B4; P5 = PMT - I5; B5 = B4 - P5
assert abs(I3 - 2581.80) < 0.005 and abs(P3 - 9941.02) < 0.005 and abs(B3 - 22331.51) < 0.005
assert abs(I4 - 1786.52) < 0.005 and abs(P4 - 10736.30) < 0.005 and abs(B4 - 11595.21) < 0.005
assert abs(I5 - 927.62) < 0.005 and abs(P5 - 11595.21) < 0.005 and abs(B5) < 0.000001
TI = n*PMT - L
assert abs(TI - 12614.11) < 0.005
assert abs(I1 + I2 + I3 + I4 + I5 - TI) < 0.000001
# equal-principal loan
pay = [10000 + 0.08*50000, 10000 + 0.08*40000, 10000 + 0.08*30000, 10000 + 0.08*20000, 10000 + 0.08*10000]
assert abs(pay[1] - 14000) < 0.000001 and abs(pay[5] - 10800) < 0.000001
assert abs(pay[2] - 13200) < 0.000001 and abs(pay[3] - 12400) < 0.000001 and abs(pay[4] - 11600) < 0.000001
assert abs(sum(pay) - L - 12000) < 0.000001
assert abs(r*L*(n + 1)/2 - 12000) < 0.000001
```

### Example 3 (hard): leasing a machine
A leasing company buys a machine for 60,000 and leases it to a factory for 4 years, with payments at the end of each month. At the end the machine comes back, and it is expected to be worth 20,000. The lease is priced at 7.2 % a year, compounded monthly. What monthly payment covers the price, and how does it compare with a loan for the whole 60,000?

1. $r = 0.072/12 = 0.006$, $n = 12 \times 4 = 48$
   *Why:* monthly payments need a monthly rate and a count of months.
2. $20{,}000 \times (1.006)^{-48} = 20{,}000 \times 0.750407 = 15{,}008.14$
   *Why:* the machine is worth 20,000 only when it comes back in 48 months; today that is worth its present value.
3. $60{,}000 - 15{,}008.14 = 44{,}991.86$
   *Why:* this is the part of the price that the lease payments must cover; the returned machine covers the rest.
4. $PMT = \dfrac{44{,}991.86}{41.598819} = 1081.57$, where $\dfrac{1 - (1.006)^{-48}}{0.006} = 41.598819$
   *Why:* dividing by the annuity factor turns a present value into a level monthly payment.
5. Check: $\dfrac{40{,}000}{41.598819} + 0.006 \times 20{,}000 = 961.57 + 120 = 1081.57$
   *Why:* the user repays the 40,000 of value used up like a loan, and pays one month's interest on the 20,000 the company has tied up in the machine. Subtracting the undiscounted 20,000 would miss this 120.
6. A loan of 60,000 on the same terms costs $\dfrac{60{,}000}{41.598819} = 1442.35$ a month, which is 360.78 more; after 48 lease payments the company's balance on the machine has fallen to exactly 20,000, the value it gets back.
   *Why:* a lease charges for the part of the asset's value that is used up, not for the whole asset.

```verify
V = 60000; RV = 20000; r = 0.072/12; n = 12*4
assert abs(r - 0.006) < 0.000000001
assert n == 48
v = (1 + r)^(-n)
assert abs(v - 0.750407) < 0.0000005
pvRV = RV*v
assert abs(pvRV - 15008.14) < 0.005
F = V - pvRV
assert abs(F - 44991.86) < 0.005
A = (1 - v)/r
assert abs(A - 41.598819) < 0.0000005
PMT = F/A
assert abs(PMT - 1081.57) < 0.005
assert abs((V - RV)/A - 961.57) < 0.005
assert abs(r*RV - 120) < 0.000001
assert abs((V - RV)/A + r*RV - PMT) < 0.000001
loan = V/A
assert abs(loan - 1442.35) < 0.005
assert abs(loan - PMT - 360.78) < 0.005
# the balance after 48 payments, (1 + r)^n V - PMT((1 + r)^n - 1)/r, equals the residual value
B = V*(1 + r)^n - PMT*((1 + r)^n - 1)/r
assert abs(B - RV) < 0.000001
```

## Common mistakes
- Dividing the loan by the number of payments, as if it carried no interest (IGNORED_INTEREST).
- Charging the yearly interest on the full loan for every year of the term (FLAT_RATE).
- Dividing by the future-value factor $((1 + r)^n - 1)/r$ instead of the present-value factor (FV_FACTOR).
- Using the annual rate as the monthly rate (ANNUAL_RATE_MONTHLY).
- Charging interest on the original loan in every period instead of on the balance still owed (INTEREST_ON_ORIGINAL).
- Giving the principal part when the question asks for the interest part, or the other way round (SWAPPED_PARTS).
- Using the balance after payment $k$ to find the interest in payment $k$; interest is charged on the balance after payment $k - 1$ (OFF_BY_ONE).
- Subtracting whole payments from the loan to find the balance, forgetting that part of each payment is interest (PAYMENTS_SUBTRACTED).
- Pricing a lease as if the asset were not handed back (RESIDUAL_IGNORED).
- Subtracting the residual value from the price without discounting it (RESIDUAL_UNDISCOUNTED).
- Rounding the payment to the cent and then using it for dozens of rows: the small error grows with interest. Keep full precision and round only the final answer.
- Comparing loans by their payments alone: a longer term lowers the payment but raises the total interest.

## Practice
- `loan-level-payment` (difficulty 1): the equal monthly or yearly payment on a mortgage, car loan, student loan or business loan, $PMT = Lr/(1 - (1 + r)^{-n})$; distractors IGNORED_INTEREST, FLAT_RATE, FV_FACTOR, ANNUAL_RATE_MONTHLY.
- `loan-schedule-row` (difficulty 2): the interest part or principal part of payment $k$, or the balance just after it; distractors INTEREST_ON_ORIGINAL, SWAPPED_PARTS, OFF_BY_ONE, PAYMENTS_SUBTRACTED.
- `lease-payment-residual` (difficulty 3): the monthly lease payment on an asset that is handed back with a residual value; distractors RESIDUAL_IGNORED, RESIDUAL_UNDISCOUNTED, IGNORED_INTEREST.

## Real world
- Mortgages: lenders give borrowers an amortisation schedule. Because early payments are mostly interest, an extra repayment in the first years saves far more interest than the same amount near the end, and when a variable rate rises the bank recalculates the payment on the balance still owed.
- Car finance: in a lease or a personal contract purchase (PCP), the monthly payments cover roughly the car's expected loss of value plus interest, and the guaranteed future value is either handed back with the car or paid as a final lump sum.
- Student loans: US federal student loans can be repaid on a standard plan of level monthly payments over a fixed term, an ordinary amortising loan. UK student loans instead take a share of income above a threshold, so their payments are not level and the schedule depends on earnings.
- Company accounts: under the IFRS 16 accounting standard, a firm that leases offices, aircraft or machines records the present value of the lease payments as a liability and then runs this schedule every period: interest expense on the opening balance, with the rest of each payment reducing the liability.

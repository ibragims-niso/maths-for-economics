---
id: FM06
title: Net present value and internal rate of return
block: FM
coreYear: 1
prerequisites: [FM03]
estMinutes: 45
status: draft
economicUses:
  - "Investment appraisal: should a firm buy a machine or open a new plant?"
  - Government cost–benefit analysis of roads, bridges and flood defences
  - Choosing between rival projects when only one can be done
  - Comparing an investment's own rate of return with the cost of borrowing
generators: [project-npv-yearly-flows, two-period-irr, mutually-exclusive-best-npv]
widgets: [npv-profile-two-projects]
mistakeCodes:
  NO_DISCOUNTING:
    label: Added the cash flows without discounting
    explanation: Money received in later years is worth less today, so cash flows at different dates cannot simply be added. Divide each cash flow by (1 + r)^t for its own year t before adding, then subtract the outlay.
  TIMING_OFF_BY_ONE:
    label: Discounted each cash flow one year too little
    explanation: The outlay is paid today (t = 0), but the first cash flow arrives at the end of year 1. Divide it by (1 + r), the second by (1 + r)², and so on; do not treat the first cash flow as if it were paid today.
  FORGOT_OUTLAY:
    label: Left out the initial cost
    explanation: The sum of the discounted cash flows is only the present value of what the project brings in. The NPV subtracts what it costs today, NPV = −C₀ + Σ CFₜ/(1 + r)^t.
  SIMPLE_AVERAGE_RETURN:
    label: Averaged the total return over the years
    explanation: Dividing the total gain by the number of years ignores when the money arrives. The IRR is the rate r at which the discounted cash flows exactly repay the outlay, so solve NPV(r) = 0.
  TOTAL_RETURN:
    label: Gave the total return, not a yearly rate
    explanation: (CF₁ + CF₂)/C₀ − 1 is the gain over the whole life of the project, and it ignores discounting. The IRR is a rate per year, the r that makes the NPV zero.
  NEGATIVE_ROOT:
    label: Took the negative root of the quadratic
    explanation: In the two-year equation C₀x² − CF₁x − CF₂ = 0 the unknown is x = 1 + r, a growth factor, which must be positive. The negative root would give a rate below −100 %, which makes no economic sense; keep the positive root.
  IRR_RANKING:
    label: Chose the project with the higher IRR
    explanation: When only one of two projects can be done, a higher IRR does not mean more value. A small project can earn a high rate on little money. Choose the project with the higher NPV at the firm's discount rate.
resources:
  - { title: "Principles of Finance, 16.2 Net Present Value (NPV) Method (OpenStax)", url: "https://openstax.org/books/principles-finance/pages/16-2-net-present-value-npv-method", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Principles of Finance, 16.3 Internal Rate of Return (IRR) Method (OpenStax)", url: "https://openstax.org/books/principles-finance/pages/16-3-internal-rate-of-return-irr-method", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Principles of Finance, 16.5 Choosing between Projects (OpenStax)", url: "https://openstax.org/books/principles-finance/pages/16-5-choosing-between-projects", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
A firm can spend 10000 today on a machine that will bring in money for the next three years. Is that a good use of the money? A city council asks the same question about a footbridge whose benefits, saved travel time, arrive year after year. Both decisions compare a cost paid now with gains spread over the future, and present value (FM03) is the tool that puts them on the same footing. The net present value turns a whole project into one number: how much richer it makes you today. The internal rate of return turns it into a rate that can be compared with the cost of borrowing. Firms, banks and governments use both every day, and knowing when they disagree is part of using them well.

## Intuition
Picture a project as a deal with a bank. You borrow the outlay at the interest rate $r$, and every cash flow the project brings in goes straight into repaying the loan. If the loan is paid off with money to spare, the project was worth doing; the spare money, valued today, is the **net present value (NPV)**. If the loan cannot be repaid, the project destroys value and the NPV is negative.

Now raise the interest rate. The loan grows faster, so less money is left over: the NPV falls as $r$ rises. At some rate the project only just repays the loan, with nothing left. That break-even rate is the **internal rate of return (IRR)**: the rate of return the project itself earns. If you can borrow for less than the IRR, the project pays.

The **discount rate** $r$ is what the money could earn elsewhere at similar risk, called the opportunity cost of capital. A project is worth doing only if it beats that alternative.

## Definition and formulas
A project costs $C_0$ today ($t = 0$) and brings net cash flows $CF_1, CF_2, \dots, CF_T$ at the end of years $1, 2, \dots, T$. With discount rate $r$ per year (as a decimal):
$$NPV(r) = -C_0 + \sum_{t=1}^{T} \frac{CF_t}{(1 + r)^t}$$

- **NPV rule**: accept the project if $NPV > 0$, reject it if $NPV < 0$. Between projects of which only one can be done (**mutually exclusive** projects), choose the one with the highest positive NPV.
- **NPV profile**: the graph of $NPV(r)$ against $r$. At $r = 0$ it equals the undiscounted sum $-C_0 + \sum CF_t$. For a **conventional** project (an outlay first, then only inflows) it falls steadily as $r$ rises, because every inflow is divided by a bigger number.
- **Internal rate of return**: the rate $r^*$ with $NPV(r^*) = 0$. **IRR rule**: accept if $r^* > r$. For a single conventional project it always gives the same answer as the NPV rule.
- One period: $-C_0 + \dfrac{CF_1}{1 + r^*} = 0$ gives $r^* = \dfrac{CF_1}{C_0} - 1$.
- Two periods: write $x = 1 + r^*$ and multiply $NPV = 0$ by $x^2$:
$$C_0 x^2 - CF_1 x - CF_2 = 0 \quad\Rightarrow\quad x = \frac{CF_1 + \sqrt{CF_1^2 + 4C_0 CF_2}}{2C_0}$$
  Keep the positive root, then $r^* = x - 1$.
- Three or more periods: there is usually no formula. Try rates until the NPV changes sign, then **interpolate linearly** between two rates $r_1 < r_2$ with $NPV_1 > 0 > NPV_2$:
$$r^* \approx r_1 + \frac{NPV_1}{NPV_1 - NPV_2}\,(r_2 - r_1)$$
  The closer $r_1$ and $r_2$, the better the estimate. Faster methods (bisection, Newton's method) come in NM01.

Limits of the IRR:
- **Non-conventional cash flows** change sign more than once, for example a mine that costs money to open and again to clean up. Then there can be several IRRs or none. The flows $-10{,}000$, $+23{,}000$, $-13{,}200$ have NPV zero at both 10 % and 20 %; the flows $-100$, $+200$, $-150$ have a negative NPV at every rate, so no IRR at all.
- **Mutually exclusive projects** of different size or timing can be ranked differently by NPV and IRR. A small, quick project can have the higher IRR while a large, long one adds more value. The rate at which the two NPV profiles cross is the **crossover rate**: below it the rankings conflict. When they conflict, the NPV wins, because it measures the gain in wealth, not a percentage.

**Payback period**: the number of years until the undiscounted cash flows add up to the outlay. It is easy to explain but crude: it ignores discounting and everything that happens after the payback date, so it favours quick projects whether or not they create value.

## Interactive
::widget{id="npv-profile-two-projects"}

The graph shows the NPV profiles of the two projects in Example 3: project A (green) costs 10,000 and returns 12,500 after one year; project B (lilac) costs 30,000 and returns a yearly cash flow for 4 years. Each hollow dot marks a project's IRR, where its curve crosses zero. Move the **Discount rate** slider and watch the two filled dots slide down their curves; the panel shows both NPVs and both IRRs, and the caption says where the curves cross and which project to choose. Check: at 8 % with B's yearly cash flow at 10,000 the panel shows NPVs of 1,574.07 and 3,121.27 and IRRs of 25 % and 12.59 %, and the caption says the curves cross at 10.58 %. Move the rate to 12 %: now A has the higher NPV too, and the two rules agree. Then move **B's yearly cash flow** down to 8,000: B's curve drops below A's at every rate, so the curves no longer cross.

## Worked examples

### Example 1 (easy): should the firm buy the machine?
A firm can buy a machine for 10000 today. It is expected to bring net cash flows of 4000, 5000 and 3000 at the end of years 1, 2 and 3, and nothing after that. The firm's discount rate is 8 % a year. Find the NPV and decide.

1. $\dfrac{4{,}000}{1.08} = 3{,}703.70$, $\quad \dfrac{5{,}000}{1.08^2} = 4{,}286.69$, $\quad \dfrac{3{,}000}{1.08^3} = 2{,}381.50$
   *Why:* each cash flow is discounted by its own date; the first arrives after one year, so it is divided by 1.08 once.
2. $3{,}703.70 + 4{,}286.69 + 2{,}381.50 = 10{,}371.89$
   *Why:* once every amount is in money of today they can be added: this is the present value of what the machine brings in.
3. $NPV = -10{,}000 + 10{,}371.89 = 371.89 > 0$, so buy the machine.
   *Why:* the outlay is paid today and is not discounted. A positive NPV means the machine earns more than the 8 % the money could earn elsewhere, with 371.89 of value to spare.
4. At 12 %: $NPV = -10{,}000 + 3{,}571.43 + 3{,}985.97 + 2{,}135.34 = -307.26$
   *Why:* a higher discount rate shrinks every future cash flow, so the NPV falls; it has changed sign, so the IRR lies between 8 % and 12 %.
5. Undiscounted, the cash flows exceed the cost by $12{,}000 - 10{,}000 = 2{,}000$. Payback: after 2 years $4{,}000 + 5{,}000 = 9{,}000$ is back, and the remaining 1000 takes a third of year 3, so the payback period is $2 + 1{,}000/3{,}000 = 2.33$ years.
   *Why:* both figures ignore discounting, so they make the machine look better than it is; the NPV of 371.89 is the true gain.

```verify
C0 = 10000; r = 0.08
a = 4000/(1 + r); b = 5000/(1 + r)^2; c = 3000/(1 + r)^3
assert abs(a - 3703.70) < 0.005
assert abs(b - 4286.69) < 0.005
assert abs(c - 2381.50) < 0.005
assert abs(3703.70 + 4286.69 + 2381.50 - 10371.89) < 0.000001
NPV = -C0 + a + b + c
assert abs(NPV - 371.89) < 0.005
assert NPV > 0
# at 12 %
r2 = 0.12
assert abs(4000/(1 + r2) - 3571.43) < 0.005
assert abs(5000/(1 + r2)^2 - 3985.97) < 0.005
assert abs(3000/(1 + r2)^3 - 2135.34) < 0.005
NPV12 = -C0 + 4000/(1 + r2) + 5000/(1 + r2)^2 + 3000/(1 + r2)^3
assert abs(NPV12 - (-307.26)) < 0.005
assert NPV12 < 0
# undiscounted gain and payback
assert 4000 + 5000 + 3000 - C0 == 2000
assert abs(2 + (C0 - 9000)/3000 - 2.33) < 0.005
```

### Example 2 (medium): the IRR of a two-year project
A firm can pay 10000 today for new software that saves 5000 at the end of the first year and 6600 at the end of the second, after which it is replaced. Find the IRR. Should the firm buy it if its discount rate is 8 %?

1. $-10{,}000 + \dfrac{5{,}000}{x} + \dfrac{6{,}600}{x^2} = 0$, where $x = 1 + r$
   *Why:* the IRR is the rate at which the discounted savings exactly repay the cost.
2. $10{,}000x^2 - 5{,}000x - 6{,}600 = 0$
   *Why:* multiplying by $x^2$, which is positive, clears the fractions and leaves a quadratic in $x$.
3. $x = \dfrac{5{,}000 \pm \sqrt{5{,}000^2 + 4 \cdot 10{,}000 \cdot 6{,}600}}{2 \cdot 10{,}000} = \dfrac{5{,}000 \pm 17{,}000}{20{,}000}$, so $x = 1.1$ or $x = -0.6$
   *Why:* the quadratic formula; the square root of $289{,}000{,}000$ is exactly $17{,}000$.
4. $x = 1.1$, so the IRR is $r^* = 10\%$.
   *Why:* $x = 1 + r$ is a growth factor and must be positive; the other root would mean a rate of −160 %, which makes no sense. Check: $5{,}000/1.1 + 6{,}600/1.21 = 4{,}545.45 + 5{,}454.55 = 10{,}000$.
5. $10\% > 8\%$, so buy the software. Indeed $NPV(8\%) = -10{,}000 + 4{,}629.63 + 5{,}658.44 = 288.07 > 0$.
   *Why:* for a conventional project the IRR rule and the NPV rule agree. The total return, $11{,}600/10{,}000 - 1 = 16\%$, or 8 % "per year" when averaged, would be wrong measures of the yearly rate.

```verify
C0 = 10000; F1 = 5000; F2 = 6600
D = F1^2 + 4*C0*F2
assert D == 289000000
assert sqrt(D) == 17000
x1 = (F1 + sqrt(D))/(2*C0)
x2 = (F1 - sqrt(D))/(2*C0)
assert abs(x1 - 1.1) < 0.000000001
assert abs(x2 - (-0.6)) < 0.000000001
assert abs((x2 - 1)*100 - (-160)) < 0.000001
assert abs(-C0 + F1/x1 + F2/x1^2) < 0.000001
assert abs(F1/1.1 - 4545.45) < 0.005
assert abs(F2/1.21 - 5454.55) < 0.005
a = F1/1.08; b = F2/1.08^2
assert abs(a - 4629.63) < 0.005
assert abs(b - 5658.44) < 0.005
NPV8 = -C0 + a + b
assert abs(NPV8 - 288.07) < 0.005
assert abs(((F1 + F2)/C0 - 1)*100 - 16) < 0.000001
```

### Example 3 (hard): when NPV and IRR disagree
A firm can carry out only one of two projects. Project A costs 10000 today and returns 12500 after one year. Project B costs 30000 today and returns 10000 at the end of each of the next 4 years. The discount rate is 8 %. Compare the projects by NPV and by IRR, find the crossover rate, and decide.

1. $NPV_A = -10{,}000 + \dfrac{12{,}500}{1.08} = 1{,}574.07$, and $IRR_A = \dfrac{12{,}500}{10{,}000} - 1 = 25\%$
   *Why:* A has one cash flow, so its IRR comes straight from the one-period formula.
2. $NPV_B = -30{,}000 + 9{,}259.26 + 8{,}573.39 + 7{,}938.32 + 7{,}350.30 = 3{,}121.27$
   *Why:* each of B's four cash flows is discounted by its own year, 1.08, 1.08², 1.08³ and 1.08⁴.
3. $NPV_B(12\%) = 373.49$ and $NPV_B(13\%) = -255.29$, so $IRR_B \approx 12 + \dfrac{373.49}{373.49 + 255.29} \times 1 = 12.59\%$
   *Why:* B has four cash flows, so there is no formula; the NPV changes sign between 12 % and 13 %, and linear interpolation estimates where it crosses zero.
4. A has the higher IRR (25 % against 12.59 %), but B has the higher NPV (3,121.27 against 1,574.07). Choose B.
   *Why:* A earns a high rate, but on only 10000 for one year. B earns a lower rate on three times as much money for four years, and adds about 1547 more value today.
5. The NPV profiles cross where $NPV_A(r) = NPV_B(r)$, at about $10.58\%$. At 12 %, $NPV_A = 1{,}160.71 > NPV_B = 373.49$.
   *Why:* B's cash flows come later, so its NPV falls faster as the rate rises. Below the crossover rate the two rules conflict; above it A wins on both. At the firm's 8 % the NPV rule picks B.

```verify
r = 0.08
NA = -10000 + 12500/(1 + r)
assert abs(NA - 1574.07) < 0.005
assert abs(12500/10000 - 1 - 0.25) < 0.000000001
p = 10000 ./ (1 + r).^(1:4)
assert abs(p[1] - 9259.26) < 0.005
assert abs(p[2] - 8573.39) < 0.005
assert abs(p[3] - 7938.32) < 0.005
assert abs(p[4] - 7350.30) < 0.005
NB = -30000 + sum(p)
assert abs(NB - 3121.27) < 0.005
N12 = -30000 + sum(10000 ./ 1.12.^(1:4))
N13 = -30000 + sum(10000 ./ 1.13.^(1:4))
assert abs(N12 - 373.49) < 0.005
assert abs(N13 - (-255.29)) < 0.005
irrB = 12 + N12/(N12 - N13)
assert abs(irrB - 12.59) < 0.005
# the exact IRR of B is also 12.59 % to 2 decimals
assert abs(-30000 + sum(10000 ./ 1.1259.^(1:4))) < 5
assert NB > NA
assert abs(NB - NA - 1547) < 1
# crossover: the two NPVs are equal at 10.58 %
c = 0.1058
dif = (-30000 + sum(10000 ./ (1 + c).^(1:4))) - (-10000 + 12500/(1 + c))
assert abs(dif) < 2
assert ((-30000 + sum(10000 ./ 1.1057.^(1:4))) - (-10000 + 12500/1.1057)) > 0
assert ((-30000 + sum(10000 ./ 1.1059.^(1:4))) - (-10000 + 12500/1.1059)) < 0
A12 = -10000 + 12500/1.12
assert abs(A12 - 1160.71) < 0.005
assert A12 > N12
```

## Common mistakes
- Adding the cash flows without discounting them; in Example 1 that gives 2000 instead of 371.89 (NO_DISCOUNTING).
- Discounting the first cash flow as if it were paid today, so every cash flow is discounted one year too little (TIMING_OFF_BY_ONE).
- Forgetting to subtract the initial cost, which gives the present value of the inflows, not the NPV (FORGOT_OUTLAY).
- Dividing a project's total gain by its number of years and calling that the IRR (SIMPLE_AVERAGE_RETURN).
- Giving the total return over the whole project instead of a yearly rate (TOTAL_RETURN).
- Keeping the negative root of the two-year quadratic, which gives a rate below −100 % (NEGATIVE_ROOT).
- Choosing between rival projects by their IRRs; when only one can be done, choose the higher NPV (IRR_RANKING).
- Trusting a single IRR when the cash flows change sign more than once: there may be several IRRs, or none.
- Judging a project by its payback period alone: it ignores discounting and every cash flow after the payback date.

## Practice
- `project-npv-yearly-flows` (difficulty 1): NPV of a project with an initial cost and two to four yearly cash flows; distractors NO_DISCOUNTING, TIMING_OFF_BY_ONE, FORGOT_OUTLAY.
- `two-period-irr` (difficulty 2): the IRR of a two-year project from the quadratic $C_0x^2 - CF_1x - CF_2 = 0$ in $x = 1 + r$; distractors SIMPLE_AVERAGE_RETURN, TOTAL_RETURN, NEGATIVE_ROOT.
- `mutually-exclusive-best-npv` (difficulty 3): choose between a small, quick project with a high IRR and a larger, longer one, and give the NPV of the better choice; distractors IRR_RANKING, NO_DISCOUNTING, FORGOT_OUTLAY.

## Real world
- Company investment: surveys of finance directors find that most large firms calculate both the NPV and the IRR of major projects, and many also look at the payback period as a rough check on how quickly money comes back.
- Government cost–benefit analysis: finance ministries publish an official discount rate for public projects. The UK Treasury's Green Book, for example, uses 3.5 % a year in real terms, and a road or hospital goes ahead only if its discounted benefits exceed its discounted costs.
- Development banks report an economic rate of return for the projects they fund: an IRR calculated from the costs and benefits to the whole country rather than to one firm.
- Private equity and venture capital funds report their performance to investors as an IRR, which is why investors also ask how much money was invested and for how long: a high IRR on a small, short deal may add little wealth.

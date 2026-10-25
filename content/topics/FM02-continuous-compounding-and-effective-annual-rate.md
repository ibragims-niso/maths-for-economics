---
id: FM02
title: Continuous compounding and effective annual rate
block: FM
coreYear: 1
prerequisites: [FM01]
estMinutes: 40
status: draft
economicUses:
  - Comparing loan and deposit offers that add interest at different frequencies
  - The true yearly cost of credit cards and consumer loans
  - Disclosure rules that make lenders and banks show an effective annual rate
  - Continuously compounded rates in finance and log growth rates in economics
searchTerms:
  - "EAR"
  - "APR"
  - "Effective interest rate"
generators: [effective-annual-rate, continuous-compounding-amount, nominal-rate-from-effective]
widgets: [compounding-frequency]
mistakeCodes:
  NOMINAL_EQUALS_EFFECTIVE:
    label: Treated the nominal rate as the effective rate
    explanation: A nominal rate compounded more than once a year gives a higher effective rate. Convert with EAR = (1 + r/m)^m − 1, or e^r − 1 for continuous compounding, and use the inverse formulas to go back.
  PERIODIC_RATE:
    label: Gave the rate per period, not per year
    explanation: r/m is the rate for one period, such as one month. For the effective rate grow 1 over all m periods of the year; for the nominal rate multiply the periodic rate by m.
  RATE_NOT_DIVIDED:
    label: Used the annual rate in every period
    explanation: When interest is added m times a year, each period earns r/m, not r. Monthly compounding at 12 % a year means 1 % a month.
  WRONG_DIRECTION:
    label: Converted in the wrong direction
    explanation: From a nominal rate to an effective rate you raise to a power (or use e^r); from an effective rate back to a nominal rate you take a root (or ln). The effective rate is always the larger of the two.
  LOG10_INSTEAD_OF_LN:
    label: Used log instead of ln
    explanation: The continuously compounded rate is ln(1 + EAR), the natural logarithm. The "log" key on most calculators is base 10 and gives a much smaller number.
  ANNUAL_INSTEAD:
    label: Compounded once a year instead of continuously
    explanation: With continuous compounding the amount is P·e^(rt), not P(1 + r)^t. Continuous compounding always gives a little more than annual compounding.
  SIMPLE_INSTEAD:
    label: Used simple interest
    explanation: P(1 + rt) ignores interest earned on interest. With continuous compounding use A = P·e^(rt).
  INTEREST_ONLY:
    label: Gave the interest, not the final amount
    explanation: The question asks how much is in the account, which is the deposit plus the interest. Multiply the deposit by e^(rt) and do not subtract it afterwards.
resources:
  - { title: "Principles of Finance, 8.4 Stated versus Effective Rates (OpenStax)", url: "https://openstax.org/books/principles-finance/pages/8-4-stated-versus-effective-rates", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Contemporary Mathematics, 6.4 Compound Interest: effective annual yield (OpenStax)", url: "https://openstax.org/books/contemporary-mathematics/pages/6-4-compound-interest", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Calculus Volume 1, 1.5 Exponential and Logarithmic Functions: compounding and the number e (OpenStax)", url: "https://openstax.org/books/calculus-volume-1/pages/1-5-exponential-and-logarithmic-functions", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
Two banks want your savings. Bank A pays 5.9 % a year, added once a year. Bank B pays 5.8 % a year, added monthly. The lower headline rate wins: once its monthly compounding is counted, Bank B pays 5.96 % a year. A credit card that charges "1.5 % a month" is advertised as 18 % a year, yet an unpaid balance grows by 19.56 % in a year. To compare offers like these you need one yardstick, the effective annual rate. That is why consumer-protection rules in many countries require banks and lenders to show an effective rate, not only the headline one.

## Intuition
A bank quotes 10 % a year. If it adds the interest once, 1 grows to 1.10. If it adds 5 % after six months and another 5 % at the end of the year, the second 5 % is also earned on the first half-year's interest, so 1 grows to 1.1025: an effective rate of 10.25 %. Adding interest more often always helps a saver and costs a borrower more, but by less and less each time:

- once a year: 10.00 %
- twice a year: 10.25 %
- quarterly: 10.38 %
- monthly: 10.47 %
- daily: 10.516 %
- every hour: 10.517 %

The effective rate stops rising at a ceiling of $e^{0.1} - 1 = 10.517\%$. Adding interest "at every instant" is called **continuous compounding**, and the number $e \approx 2.71828$ appears because it is exactly this limit.

## Definition and formulas
A **nominal annual rate** $r$ (as a decimal), compounded $m$ times a year, means a rate of $r/m$ in each period. It is the number in the advert. In many US documents it is called the APR. (Careful: in macroeconomics "nominal" usually means "not adjusted for inflation"; here it means "as quoted, before compounding".)

- Effective annual rate (what 1 really gains in a year):
$$\text{EAR} = \left(1 + \frac{r}{m}\right)^{m} - 1$$
- Compounded once a year ($m = 1$): $\text{EAR} = r$.
- More frequent compounding: $\left(1 + \dfrac{r}{m}\right)^{m} \to e^{r}$ as $m \to \infty$.
- Continuous compounding, deposit $P$ for $t$ years:
$$A = P\,e^{rt}, \qquad \text{EAR} = e^{r} - 1$$
- Back from an effective rate to a nominal rate with $m$ periods: $r = m\left[(1 + \text{EAR})^{1/m} - 1\right]$.
- Back to a continuously compounded rate: $r = \ln(1 + \text{EAR})$.
- To compare offers, convert every one of them to its EAR. For a saver the higher EAR is better; for a borrower the lower.
- Doubling time with continuous compounding: $e^{rt} = 2$ gives $t = \dfrac{\ln 2}{r} \approx \dfrac{0.693}{r}$, for example 13.86 years at 5 %.

## Interactive
::widget{id="compounding-frequency"}

The curve shows the effective annual rate for each number of compounding periods $m$ from 1 to 24. The gold dashed line is the nominal rate and the green dashed line is the ceiling $e^r - 1$; the vertical axis is zoomed in between the two. Move the "Times a year interest is added" slider and watch the dot climb quickly at first, then flatten out under the ceiling. Check Example 1: with the nominal rate at 18 % and $m = 12$, the panel shows a rate per period of 1.5 % and an effective annual rate of 19.56 %. Set $m = 1$ and the effective rate falls to exactly the nominal rate. Then move the nominal rate: the gap between the two dashed lines grows much faster than the rate itself, which is why compounding matters most for expensive credit.

## Worked examples

### Example 1 (easy): the real cost of a credit card
A credit card charges 1.5 % a month on an unpaid balance. What is its nominal annual rate, and what is its effective annual rate?

1. $r = 12 \times 1.5\% = 18\%$
   *Why:* the nominal rate is the monthly rate times the number of months; it ignores compounding.
2. $1.015^{12} = 1.195618$
   *Why:* each month the balance is multiplied by 1.015, twelve times in a year.
3. $\text{EAR} = 1.195618 - 1 = 0.195618 = 19.56\%$
   *Why:* the effective rate is how much one unit grows in a full year, minus the unit itself.
4. A balance of 1000 left unpaid for a year grows to $1000 \times 1.195618 = 1195.62$, not 1180.
   *Why:* the interest charged in January is itself charged interest from February onwards.

```verify
monthly = 0.015; m = 12
r = m*monthly
EAR = (1 + monthly)^m - 1
assert abs(r - 0.18) < 0.000001
assert abs((1 + monthly)^m - 1.195618) < 0.000001
assert abs(EAR*100 - 19.56) < 0.005
assert abs(1000*(1 + monthly)^m - 1195.62) < 0.005
assert 1000*(1 + r) == 1180
```

### Example 2 (medium): continuous compounding
You deposit 8000 at 5 % a year, compounded continuously. How much is in the account after 6 years? Compare with annual and monthly compounding.

1. $rt = 0.05 \times 6 = 0.3$
   *Why:* with continuous compounding only the product of rate and time matters; it is the exponent of $e$.
2. $A = 8000\,e^{0.3} = 8000 \times 1.349859 = 10{,}798.87$
   *Why:* one unit compounded continuously for $t$ years grows to $e^{rt}$, and every unit of the deposit grows the same way.
3. Annual: $8000 \times 1.05^{6} = 10{,}720.77$. Monthly: $8000\left(1 + \dfrac{0.05}{12}\right)^{72} = 10{,}792.14$.
   *Why:* continuous compounding is the upper limit, so it beats both, but it adds only 6.73 more than monthly compounding.
4. Its effective rate is $e^{0.05} - 1 = 5.13\%$.
   *Why:* the account behaves exactly like one that adds 5.13 % once a year.

```verify
P = 8000; r = 0.05; t = 6
A = P*exp(r*t)
annual = P*(1 + r)^t
monthly = P*(1 + r/12)^(12*t)
assert abs(r*t - 0.3) < 0.000001
assert abs(exp(r*t) - 1.349859) < 0.000001
assert abs(A - 10798.87) < 0.005
assert abs(annual - 10720.77) < 0.005
assert abs(monthly - 10792.14) < 0.005
assert abs(A - monthly - 6.73) < 0.005
assert abs((exp(r) - 1)*100 - 5.13) < 0.005
assert abs(P*(exp(r))^t - A) < 0.000001
```

### Example 3 (hard): comparing two loans and converting rates
Lender X charges 12 % a year compounded monthly. Lender Y charges 12.6 % a year compounded once a year. Which loan is cheaper? What rate compounded monthly would X have to quote to cost the same as Y, and what continuously compounded rate costs the same as Y?

1. $\text{EAR}_X = \left(1 + \dfrac{0.12}{12}\right)^{12} - 1 = 1.01^{12} - 1 = 12.68\%$
   *Why:* the two offers compound differently, so put both on the same yardstick first.
2. $\text{EAR}_Y = 12.6\%$
   *Why:* when interest is added once a year, the nominal and effective rates are equal.
3. $12.68 - 12.60 = 0.08$ percentage points, so Y is cheaper.
   *Why:* the borrower pays the effective rate; the headline rates point the wrong way here.
4. $\left(1 + \dfrac{r}{12}\right)^{12} = 1.126 \Rightarrow \dfrac{r}{12} = 1.126^{1/12} - 1 = 0.009938$, so $r = 12 \times 0.009938 = 11.93\%$
   *Why:* the 12th root undoes the power of 12; multiplying the monthly rate by 12 gives the nominal rate.
5. $e^{r} = 1.126 \Rightarrow r = \ln 1.126 = 11.87\%$
   *Why:* the natural logarithm undoes $e^{x}$; the continuous rate is the lowest quote that gives the same effective rate.

```verify
EARX = (1 + 0.12/12)^12 - 1
EARY = 0.126
assert abs(EARX*100 - 12.68) < 0.005
assert EARY < EARX
assert abs((EARX - EARY)*100 - 0.08) < 0.005
periodic = 1.126^(1/12) - 1
assert abs(periodic - 0.009938) < 0.000001
rm = 12*periodic
assert abs(rm*100 - 11.93) < 0.005
assert abs((1 + rm/12)^12 - 1.126) < 0.000000001
rc = log(1.126)
assert abs(rc*100 - 11.87) < 0.005
assert abs(exp(rc) - 1.126) < 0.000000001
assert rc < rm
```

## Common mistakes
- Comparing headline rates that compound at different frequencies, or giving the nominal rate as the effective one (NOMINAL_EQUALS_EFFECTIVE).
- Giving the rate for one period, such as the monthly rate, when the question asks for a yearly rate (PERIODIC_RATE).
- Using the full annual rate in every period, $(1 + r)^m - 1$ (RATE_NOT_DIVIDED).
- Converting the wrong way: using the EAR formula when you need its inverse, or $\ln(1 + r)$ when you need $e^r - 1$ (WRONG_DIRECTION).
- Pressing the base-10 log key instead of ln when finding a continuous rate (LOG10_INSTEAD_OF_LN).
- Compounding once a year when the question says continuously (ANNUAL_INSTEAD).
- Using simple interest $P(1 + rt)$ for continuous compounding (SIMPLE_INSTEAD).
- Giving the interest instead of the final amount (INTEREST_ONLY).
- Thinking continuous compounding makes money grow without limit: it adds only a little more than daily compounding.

## Practice
- `effective-annual-rate` (difficulty 1): effective annual rate in per cent from a nominal rate compounded twice a year, quarterly, monthly, daily or continuously; distractors NOMINAL_EQUALS_EFFECTIVE, PERIODIC_RATE, RATE_NOT_DIVIDED, WRONG_DIRECTION.
- `continuous-compounding-amount` (difficulty 2): amount after $t$ years with continuous compounding, $A = Pe^{rt}$; distractors ANNUAL_INSTEAD, SIMPLE_INSTEAD, INTEREST_ONLY.
- `nominal-rate-from-effective` (difficulty 3): the nominal rate, compounded $m$ times a year or continuously, that gives a stated effective annual rate; distractors NOMINAL_EQUALS_EFFECTIVE, PERIODIC_RATE, WRONG_DIRECTION, LOG10_INSTEAD_OF_LN.

## Real world
- Credit cards: in the US a card's APR is a nominal rate, the rate per period times the number of periods in a year, so the true yearly cost of carrying a balance is higher than the advertised figure.
- Disclosure rules: US savings accounts must show an annual percentage yield and UK savings accounts an annual equivalent rate, both effective rates. The annual percentage rate that EU and UK law requires for consumer loans is also calculated as an effective rate, and it includes most fees as well as interest. All of these exist so that offers can be compared on one scale.
- Finance: models for pricing bonds and options usually work with continuously compounded rates, because $e^{rt}$ is easy to multiply, differentiate and invert.
- Growth and inflation: economists often measure growth as the change in logarithms, $\ln Y_t - \ln Y_{t-1}$, which is a continuously compounded rate; a log growth of 3 % equals ordinary growth of $e^{0.03} - 1 = 3.05\%$. Monthly rates compound too: inflation of 3 % a month is 42.58 % a year, not 36 %.

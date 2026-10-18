---
id: FM01
title: Simple and compound interest
block: FM
coreYear: 1
prerequisites: [F07]
estMinutes: 35
status: draft
economicUses:
  - Savings accounts and term deposits
  - Loans and credit cards
  - Comparing investments over different periods
  - Inflation and growth, which compound in the same way
generators: [simple-interest-amount, compound-interest-amount]
widgets: []
mistakeCodes:
  COMPOUNDED:
    label: Compounded when the interest was simple
    explanation: Simple interest is earned on the original deposit only, so it is the same every year. Use A = P(1 + rt), not P(1 + r)^t.
  INTEREST_ONLY:
    label: Gave the interest, not the final amount
    explanation: The question asks how much is in the account, which is the deposit plus the interest.
  PERCENT_NOT_DIVIDED:
    label: Used the percentage without dividing by 100
    explanation: A rate of 5 % is 0.05 in a formula. Using 5 makes the money grow five hundred times too fast.
  SIMPLE_INSTEAD:
    label: Used simple interest for a compound question
    explanation: With compounding, interest is added to the balance and then earns interest itself. Use A = P(1 + r/m)^(mt).
  ANNUAL_ONLY:
    label: Ignored the compounding frequency
    explanation: If interest is added m times a year, both the rate per period (r/m) and the number of periods (mt) change.
  RATE_NOT_DIVIDED:
    label: Used the annual rate for every period
    explanation: The annual rate is split across the periods. Monthly compounding at 6 % a year means 0.5 % a month, not 6 % a month.
resources:
  - { title: "College Algebra 2e, 6.1 Exponential Functions: compound interest (OpenStax)", url: "https://openstax.org/books/college-algebra-2e/pages/6-1-exponential-functions", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Principles of Economics 3e, 17.2 How Households Supply Financial Capital (OpenStax)", url: "https://openstax.org/books/principles-economics-3e/pages/17-2-how-households-supply-financial-capital", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
A bank offers 6 % a year on savings; a phone shop offers to spread a payment over a year "at 2 % a month". Which numbers can you compare, and what do they really cost or pay? Interest is the price of money over time. Almost every decision in finance, from a student loan to a central bank's policy rate, starts from these two formulas.

## Intuition
With **simple** interest you earn the same amount every year, because interest is always calculated on the original deposit. With **compound** interest, each year's interest is added to the balance and then earns interest itself, so the balance grows faster and faster. Over a few years the difference is small; over decades it is enormous.

## Definition and formulas
Deposit $P$, annual rate $r$ (as a decimal), time $t$ in years.

- Simple interest: $I = Prt$ and $A = P(1 + rt)$.
- Compound interest, added $m$ times a year: $A = P\left(1 + \dfrac{r}{m}\right)^{mt}$.
- Compounded once a year ($m = 1$): $A = P(1 + r)^t$.
- Time to grow by a factor $k$ with annual compounding: $t = \dfrac{\ln k}{\ln(1 + r)}$.

## Interactive
An interactive growth chart is planned for this topic. Until then, use Practice: every problem uses new numbers.

## Worked examples

### Example 1 (easy): simple interest
You deposit 2000 at 6 % simple interest for 4 years. How much do you have at the end?

1. $I = 2000 \cdot 0.06 \cdot 4 = 480$
   *Why:* simple interest is the same every year: deposit × rate × years.
2. $A = 2000 + 480 = 2480$
   *Why:* the final amount is the deposit plus all the interest.

```verify
P = 2000; r = 0.06; t = 4
A = P*(1 + r*t)
assert A == 2480
```

### Example 2 (medium): quarterly compounding
You invest 5000 at 4 % a year, compounded quarterly, for 3 years. What is it worth?

1. Rate per quarter: $0.04 / 4 = 0.01$
   *Why:* the annual rate is shared between the four quarters.
2. Number of quarters: $4 \cdot 3 = 12$
   *Why:* interest is added four times a year for three years.
3. $A = 5000 \cdot 1.01^{12} = 5634.13$
   *Why:* each quarter the balance is multiplied by 1.01.

```verify
P = 5000; r = 0.04; m = 4; t = 3
A = P*(1 + r/m)^(m*t)
assert abs(A - 5634.13) < 0.01
assert A > P*(1 + r*t)
```

### Example 3 (hard): how long to double
How many years does money take to double at 8 % a year, compounded annually?

1. Doubling means $(1.08)^t = 2$.
   *Why:* the deposit cancels; only the growth factor matters.
2. Take logs: $t \ln 1.08 = \ln 2$, so $t = \dfrac{\ln 2}{\ln 1.08} \approx 9.01$ years.
   *Why:* logarithms bring the unknown exponent down.
3. Rule of thumb: $72 / 8 = 9$ years.
   *Why:* the "rule of 72" is a quick approximation of $\ln 2 / \ln(1 + r)$ for typical rates.

```verify
t = log(2)/log(1.08)
assert abs(t - 9.006) < 0.001
assert abs(1.08^t - 2) < 0.000001
```

## Common mistakes
- Compounding when the interest is simple (COMPOUNDED).
- Giving only the interest instead of the final amount (INTEREST_ONLY).
- Forgetting to divide the percentage by 100 (PERCENT_NOT_DIVIDED).
- Using simple interest in a compound question (SIMPLE_INSTEAD).
- Ignoring how often interest is added (ANNUAL_ONLY).
- Using the annual rate for each period (RATE_NOT_DIVIDED).

## Practice
- `simple-interest-amount` (difficulty 1): amount after simple interest.
- `compound-interest-amount` (difficulty 2): amount after compound interest with annual, half-yearly, quarterly or monthly compounding.

## Real world
- Savings and loans: banks quote annual rates, but most add interest monthly; the formulas show what you actually earn or pay.
- Central banks: a change in the policy rate changes the cost of borrowing for every loan in the economy.
- Inflation: prices compound just like money in a bank; 5 % inflation a year raises prices by about 63 % over ten years.
- Growth: GDP growth rates compound too, which is why small differences in growth make countries very different over a generation.

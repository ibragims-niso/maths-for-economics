---
id: F03
title: Functions, domain, range and graphs
block: F
coreYear: 1
prerequisites: [F01]
estMinutes: 40
status: draft
economicUses:
  - Demand, supply and cost written as functions of price or output
  - "Economically meaningful domains: prices and quantities that cannot be negative"
  - Reading intercepts and the direction of change off economic graphs
  - "Piecewise rules: income tax bands and block tariffs for electricity or water"
generators: [cost-function-change, demand-domain-max-price, income-tax-bands]
widgets: []
mistakeCodes:
  LEVEL_NOT_CHANGE:
    label: Gave the new total, not the change
    explanation: The question asks how much cost rises. Work out the cost at both outputs and subtract, new minus old.
  EVALUATED_AT_CHANGE:
    label: Put the change in output into the function
    explanation: C(30) − C(20) is not the same as C(10). The fixed cost cancels in a difference, and the Q² term adds more per unit at high output than at low output. Evaluate the function at each output separately, then subtract.
  POWER_AS_MULTIPLE:
    label: Treated a power as a multiple
    explanation: Q² means Q × Q, not 2 × Q, and √P is the number whose square is P, not P ÷ 2. Work out the power or the root first, then multiply by its coefficient.
  NOT_SOLVED_FOR_P:
    label: Stopped at P² or √P
    explanation: Setting Q = 0 gives a value for P² (or for √P), not for P. Finish the job by taking the square root (or by squaring) to get the price itself.
  GAVE_INTERCEPT:
    label: Gave the quantity at a zero price
    explanation: The constant term is the quantity demanded when P = 0, where the graph meets the quantity axis. The edge of the domain is the price at which the quantity falls to zero.
  WRONG_BAND:
    label: Used the rule for the wrong band
    explanation: A piecewise function has a different rule on each interval. First decide which band the income falls in, then use that band's rule.
  TOP_RATE_ON_ALL:
    label: Applied the top rate to all income
    explanation: A higher rate applies only to the income inside its own band. The income below that band is still taxed at the lower rates.
  IGNORED_ALLOWANCE:
    label: Taxed the tax-free allowance
    explanation: The first part of income is taxed at 0 %. The basic rate starts at the allowance, not at zero.
  TOP_BAND_ONLY:
    label: Taxed only the top band
    explanation: Someone whose income reaches the top band also pays the basic rate on the whole basic band. Add the tax from every band the income passes through.
resources:
  - { title: "College Algebra 2e, 3.1 Functions and Function Notation (OpenStax)", url: "https://openstax.org/books/college-algebra-2e/pages/3-1-functions-and-function-notation", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "College Algebra 2e, 3.2 Domain and Range (OpenStax)", url: "https://openstax.org/books/college-algebra-2e/pages/3-2-domain-and-range", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Principles of Economics 3e, Appendix A The Use of Mathematics in Principles of Economics (OpenStax)", url: "https://openstax.org/books/principles-economics-3e/pages/a-the-use-of-mathematics-in-principles-of-economics", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
A bakery plans to raise daily output from 20 to 30 cakes. How much more will that cost? A government changes the income tax rate above a certain income. How much tax does someone earning a little above that line now pay? Both questions are answered with a function: a rule that turns one number (output, income, price) into another (cost, tax, quantity bought). Demand, supply, cost, revenue and tax schedules are all functions, so reading, evaluating and graphing them comes before almost everything else in economics.

## Intuition
Think of a function as a machine: put in an input and exactly one output comes out. At a given price, a demand function gives one quantity, never two. The inputs the machine accepts form its **domain**; the outputs it can produce form its **range**.

In economics the domain is often smaller than the algebra allows. The formula $Q = 100 - 2P$ happily accepts $P = 80$ and returns $Q = -60$, but nobody buys minus sixty cups of coffee. A graph shows every input–output pair at once, so you can see where the function starts, where it meets the axes, and whether it rises or falls. Some rules change part-way: an electricity bill may charge one price for the first block of units and a higher price after that. These are piecewise functions.

## Definition and formulas
A **function** $f$ assigns to each input $x$ in its domain exactly one output $f(x)$. We write $y = f(x)$: $x$ is the independent variable and $y$ the dependent variable.

- **Evaluating:** replace every $x$ by the given number. If $f(x) = 3x^2 - x$, then $f(4) = 3 \cdot 16 - 4 = 44$.
- **Change between two inputs:** $\Delta f = f(x_2) - f(x_1)$. In general $f(x_2) - f(x_1) \ne f(x_2 - x_1)$.
- **Domain:** the inputs for which the function is defined. Mathematics rules out dividing by zero and taking the square root of a negative number: $\sqrt{50 - 2x}$ needs $50 - 2x \ge 0$, so $x \le 25$. Economics adds its own limits: prices, quantities and outputs cannot be negative. The **economically meaningful domain** of a demand function is the set of prices with $P \ge 0$ and $Q \ge 0$.
- **Range:** the set of outputs the function takes on its domain.
- **Graph:** all the points $(x, f(x))$. A curve is the graph of a function only if every vertical line crosses it at most once (the vertical line test).
- **Intercepts:** the vertical intercept is $f(0)$; a horizontal intercept is an $x$ with $f(x) = 0$.
- **Increasing and decreasing:** $f$ is increasing on an interval if $x_1 < x_2$ always gives $f(x_1) < f(x_2)$, and decreasing if it always gives $f(x_1) > f(x_2)$.

Economic functions you will meet everywhere:

- Demand $Q_d = D(P)$, usually decreasing in price; supply $Q_s = S(P)$, usually increasing in price.
- Total cost $C(Q)$, increasing in output, with $C(0)$ equal to the fixed cost. A common shape is $C(Q) = F + aQ + bQ^2$.
- Economists usually draw demand and supply with price on the vertical axis, even when quantity is written as a function of price. Always read the axis labels before reading a graph.

A **piecewise function** uses different rules on different intervals of its domain. An income tax with a tax-free allowance $A$, a basic rate $t_1$ up to $B$ and a higher rate $t_2$ above $B$ is
$$T(Y) = \begin{cases} 0, & 0 \le Y \le A \\ t_1(Y - A), & A < Y \le B \\ t_1(B - A) + t_2(Y - B), & Y > B \end{cases}$$
Neighbouring rules give the same value at each boundary, so the graph has no jumps.

## Interactive
An interactive graph for this topic is planned. Until then, use Practice: every problem uses new numbers.

## Worked examples

### Example 1 (easy): evaluating a cost function
A bakery's daily cost of baking $Q$ cakes is $C(Q) = 500 + 12Q + 2Q^2$. Find the fixed cost, the cost of 20 and of 30 cakes, and how much cost rises between them.

1. $C(0) = 500$
   *Why:* at zero output only the fixed cost is left; it is where the graph meets the vertical axis.
2. $C(20) = 500 + 12 \cdot 20 + 2 \cdot 20^2 = 500 + 240 + 800 = 1540$
   *Why:* replace every $Q$ by 20; square first, then multiply by 2.
3. $C(30) = 500 + 12 \cdot 30 + 2 \cdot 30^2 = 500 + 360 + 1800 = 2660$
   *Why:* the same rule with the new input.
4. $\Delta C = 2660 - 1540 = 1120$
   *Why:* a change is new value minus old value, and the fixed cost of 500 cancels. Note that $C(10) = 820$, so $C(30) - C(20) \ne C(10)$.

```verify
F = 500; a = 12; b = 2
C0 = F + a*0 + b*0^2
C20 = F + a*20 + b*20^2
C30 = F + a*30 + b*30^2
assert C0 == 500
assert C20 == 1540
assert C30 == 2660
assert C30 - C20 == 1120
assert F + a*10 + b*10^2 == 820
```

### Example 2 (medium): domain and range of a demand function
Demand for a good is $Q = 1800 - 2P^2$. Find its economically meaningful domain, its intercepts, whether it rises or falls, and its range.

1. Any real $P$ can go into the formula.
   *Why:* there is no division and no square root, so mathematically the domain is all real numbers.
2. $P \ge 0$ and $1800 - 2P^2 \ge 0$, so $P^2 \le 900$ and $0 \le P \le 30$.
   *Why:* prices and quantities cannot be negative; take the positive square root of 900, because a negative price is ruled out.
3. At $P = 0$, $Q = 1800$; and $Q = 0$ at $P = 30$.
   *Why:* an intercept is where the graph meets an axis, so set one variable to zero.
4. $Q(10) = 1600$ and $Q(20) = 1000$, so demand is decreasing on $0 \le P \le 30$.
   *Why:* for prices $0 \le P_1 < P_2$ we have $P_1^2 < P_2^2$, so a larger amount is subtracted and $Q$ is smaller.
5. Range: $0 \le Q \le 1800$.
   *Why:* the graph is an unbroken curve falling from $Q(0) = 1800$ to $Q(30) = 0$, so it takes every value in between.

```verify
a = 1800; b = 2
Pmax = sqrt(a/b)
assert Pmax == 30
assert a - b*Pmax^2 == 0
assert a - b*0^2 == 1800
assert a - b*10^2 == 1600
assert a - b*20^2 == 1000
assert a - b*31^2 < 0
```

### Example 3 (hard): income tax as a piecewise function
In a country the first $10{,}000$ of yearly income is tax-free, income from $10{,}000$ to $40{,}000$ is taxed at 20 %, and income above $40{,}000$ at 40 %. The tax function is
$$T(Y) = \begin{cases} 0, & 0 \le Y \le 10{,}000 \\ 0.2\,(Y - 10{,}000), & 10{,}000 < Y \le 40{,}000 \\ 6000 + 0.4\,(Y - 40{,}000), & Y > 40{,}000 \end{cases}$$
Find the tax on an income of $52{,}000$ and the average tax rate.

1. $52{,}000 > 40{,}000$, so use the third rule.
   *Why:* a piecewise function has one rule per interval; first find the interval that contains the input.
2. Basic band: $0.2 \cdot (40{,}000 - 10{,}000) = 6000$
   *Why:* the income passes through the whole basic band on its way up, so all of that band is taxed at 20 %. This is the 6000 in the third rule.
3. Top band: $0.4 \cdot (52{,}000 - 40{,}000) = 4800$
   *Why:* the 40 % rate applies only to the part of income above $40{,}000$.
4. $T(52{,}000) = 6000 + 4800 = 10{,}800$
   *Why:* total tax is the sum of the tax from each band.
5. Average rate: $10{,}800 / 52{,}000 = 0.2077$, about 20.77 %.
   *Why:* the average rate is total tax over total income. It is far below 40 % because most of the income is taxed at 0 % or 20 %; taxing all of it at 40 % would give $20{,}800$, almost twice as much.

```verify
A = 10000; B = 40000; r1 = 0.2; r2 = 0.4; Y = 52000
basic = r1*(B - A)
top = r2*(Y - B)
T = basic + top
assert abs(basic - 6000) < 0.000001
assert abs(top - 4800) < 0.000001
assert abs(T - 10800) < 0.000001
assert abs(T/Y - 0.2077) < 0.0001
assert abs(r2*Y - 20800) < 0.000001
# the second and third rules agree at Y = B, so the graph has no jump
assert abs(r1*(B - A) - (basic + r2*(B - B))) < 0.000001
```

## Common mistakes
- Giving the new total cost when the question asks for the change (LEVEL_NOT_CHANGE).
- Working out $C(Q_2 - Q_1)$ instead of $C(Q_2) - C(Q_1)$ (EVALUATED_AT_CHANGE).
- Reading $Q^2$ as $2Q$, or $\sqrt{P}$ as $P/2$ (POWER_AS_MULTIPLE).
- Solving for $P^2$ or $\sqrt{P}$ and stopping there (NOT_SOLVED_FOR_P).
- Giving the quantity at a zero price as the edge of the domain (GAVE_INTERCEPT).
- Using the rule for the wrong band of a piecewise function (WRONG_BAND).
- Believing that moving into a higher tax band taxes all income at the higher rate (TOP_RATE_ON_ALL).
- Taxing the tax-free allowance (IGNORED_ALLOWANCE).
- Forgetting the tax on the basic band when income reaches the top band (TOP_BAND_ONLY).
- Accepting every number a formula produces: a negative price or quantity means the input lies outside the economically meaningful domain.
- Mixing up domain (the inputs) and range (the outputs).

## Practice
- `cost-function-change` (difficulty 1): evaluate $C(Q) = F + aQ + bQ^2$ at two outputs and give the rise in cost; distractors LEVEL_NOT_CHANGE, EVALUATED_AT_CHANGE, POWER_AS_MULTIPLE.
- `demand-domain-max-price` (difficulty 2): the highest price with $Q \ge 0$ for $Q = a - bP^2$ or $Q = a - b\sqrt{P}$; distractors NOT_SOLVED_FOR_P, GAVE_INTERCEPT, POWER_AS_MULTIPLE.
- `income-tax-bands` (difficulty 3): income tax with a tax-free allowance, a basic rate and a higher rate; distractors WRONG_BAND, TOP_RATE_ON_ALL, IGNORED_ALLOWANCE, TOP_BAND_ONLY.

## Real world
- Income tax: many countries tax income in bands, so the tax schedule is a piecewise function. The rate on the next unit of income (the marginal rate) can be much higher than the average rate a person pays.
- Utilities: electricity and water suppliers often charge a low price for a first block of units and a higher price beyond it. The bill is a piecewise function of use, designed to keep basic use affordable and discourage waste.
- Business budgeting: firms estimate a cost function from past accounts and evaluate it at planned output levels before deciding whether to expand.
- Forecasting demand: an estimated demand function is reliable only for prices close to those in the data. Far outside that domain it can predict nonsense, such as negative sales.

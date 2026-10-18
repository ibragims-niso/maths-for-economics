---
id: F02
title: Linear and quadratic equations, inequalities
block: F
coreYear: 1
prerequisites: [F01]
estMinutes: 45
status: draft
economicUses:
  - Break-even points when profit is a quadratic in output
  - "Budget constraints: which bundles a consumer can afford"
  - Price limits that keep sales at or above a target
  - Checking whether a project can ever cover its fixed costs
generators: [budget-max-whole-units, quadratic-break-even, break-even-max-fixed-cost]
widgets: [fixed-cost-break-even]
mistakeCodes:
  ROUNDED_UP:
    label: Rounded up past the limit
    explanation: The inequality gives an upper limit, such as x ≤ 7.64. Rounding up to 8 breaks the budget, so take the largest whole number below the limit.
  NOT_WHOLE:
    label: Gave a fraction of a unit
    explanation: Goods are bought in whole units, so the answer must be a whole number. Solve the inequality, then take the largest whole number that satisfies it.
  IGNORED_OTHER_SPENDING:
    label: Ignored the other spending
    explanation: Money already spent on the other good is no longer available. Subtract it from the budget before dividing by the price.
  MOVED_TERM_SIGN:
    label: Moved a term without changing its sign
    explanation: A term changes sign when it moves to the other side. 11x + 36 ≤ 120 becomes 11x ≤ 120 − 36, not 11x ≤ 120 + 36.
  NO_FLIP:
    label: Did not reverse the inequality
    explanation: Multiplying or dividing both sides by a negative number reverses the inequality. From −4P ≥ −80, dividing by −4 gives P ≤ 20, not P ≥ 20.
  LOST_ROOT:
    label: Divided by the unknown and lost a solution
    explanation: Dividing both sides by Q assumes Q is not zero, so the solution Q = 0 disappears. Move everything to one side and factorise instead, for example Q² − 5Q = Q(Q − 5) = 0.
  OTHER_ROOT:
    label: Gave the other break-even quantity
    explanation: A quadratic profit is zero at two outputs. At the smaller one the firm starts to make a profit; beyond the larger one it makes a loss again. Check which one the question asks for.
  HALF_DENOMINATOR:
    label: Divided by a instead of 2a
    explanation: In the quadratic formula the numerator is divided by 2a. Dividing by a alone doubles the solution.
  PARTIAL_DIVISION:
    label: Divided only the square root by 2a
    explanation: In x = (−b ± √D)/(2a) the fraction bar covers the whole numerator. Work out −b ± √D first, then divide the result by 2a.
  DISCRIMINANT_SIGN:
    label: Sign slip in the discriminant
    explanation: Put each coefficient into b² − 4ac with its own sign. For −2Q² + 140Q − 2000, a = −2 and c = −2000, so 4ac = +16000 and D = 19600 − 16000, not 19600 + 16000.
  FORGOT_FOUR:
    label: Left out the 4 in b² − 4ac
    explanation: The discriminant is b² − 4ac. Without the 4 the condition becomes b² − aF ≥ 0, and the limit on F comes out four times too large.
  NOT_SQUARED:
    label: Forgot to square b
    explanation: The discriminant starts with b², not b. Square the coefficient of Q before subtracting 4ac.
  GAVE_QUANTITY:
    label: Gave the output, not the fixed cost
    explanation: b/(2a) is the single break-even output when the fixed cost is at its limit. The question asks for the fixed cost itself, b²/(4a).
resources:
  - { title: "College Algebra 2e, 2.2 Linear Equations in One Variable (OpenStax)", url: "https://openstax.org/books/college-algebra-2e/pages/2-2-linear-equations-in-one-variable", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "College Algebra 2e, 2.5 Quadratic Equations (OpenStax)", url: "https://openstax.org/books/college-algebra-2e/pages/2-5-quadratic-equations", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "College Algebra 2e, 2.7 Linear Inequalities and Absolute Value Inequalities (OpenStax)", url: "https://openstax.org/books/college-algebra-2e/pages/2-7-linear-inequalities-and-absolute-value-inequalities", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
A small firm can sell more only by lowering its price. At very low output it cannot cover its rent; at very high output the price has fallen so far that each sale loses money. Between which outputs does it make a profit? That is a quadratic equation. A student with 120 left for the month wants to know how many books she can still buy: that is a linear inequality. Economics is full of "exactly where?" and "at most how much?" questions, and equations and inequalities are the tools that answer them.

## Intuition
An equation asks where two sides are exactly equal: where profit is zero, where income equals spending. You solve it by doing the same thing to both sides until the unknown stands alone.

An inequality asks where one side stays below or above the other: spending within a budget, sales above a target. It is solved in the same way, with one extra rule. Multiplying or dividing by a negative number turns the inequality round, because it swaps which number is larger: $3 < 5$, but $-3 > -5$.

A quadratic has the unknown squared. Its graph is a curve that turns once, so it can cross zero twice, touch zero once or never reach it. One number, the discriminant, tells you which case you are in before you solve anything.

## Definition and formulas
**Linear equation.** $ax + b = 0$ with $a \neq 0$ has exactly one solution, $x = -\dfrac{b}{a}$.

**Quadratic equation.** $ax^2 + bx + c = 0$ with $a \neq 0$.

- Factorising: if $ax^2 + bx + c = a(x - r_1)(x - r_2)$, the solutions are $x = r_1$ and $x = r_2$, because a product is zero only when one of its factors is zero.
- Quadratic formula: $x = \dfrac{-b \pm \sqrt{b^2 - 4ac}}{2a}$.
- The discriminant $D = b^2 - 4ac$ counts the solutions:
  - $D > 0$: two different solutions;
  - $D = 0$: one repeated solution, $x = -\dfrac{b}{2a}$;
  - $D < 0$: no real solution.

**Linear inequality.** Solve it like an equation, with one rule: when you multiply or divide both sides by a negative number, reverse the sign ($<$ becomes $>$, $\le$ becomes $\ge$). For demand $Q = 200 - 4P$ and a sales target of at least 120 units:
$$200 - 4P \ge 120 \;\Rightarrow\; -4P \ge -80 \;\Rightarrow\; P \le 20.$$

**Budget constraint.** With a budget $M$ and prices $p_x$ and $p_y$, a consumer can afford the bundles with
$$p_x x + p_y y \le M.$$
When goods come in whole units, the answer is the largest whole number that satisfies the inequality, so round down.

## Interactive
::widget{id="fixed-cost-break-even"}

Move the **fixed cost** slider and watch the profit curve $\pi(Q) = -2Q^2 + 140Q - F$ slide down. The dots mark the break-even outputs, the shaded part is where the firm makes a profit, and the panel shows the discriminant $D = 140^2 - 8F$ and the break-even outputs. Notice that the two break-even points move towards each other as $F$ rises, meet when $D = 0$ and then disappear. Move the **output** slider to test the sign of profit at any output, as in Example 2. Check Examples 2 and 3: at $F = 2000$ the panel shows $D = 3600$, outputs 20 and 50, and a profit of 400 at $Q = 30$; at $F = 2450$ it shows $D = 0$ and the single output 35.

## Worked examples

### Example 1 (easy): how many books fit the budget
A student has 120 to spend this month. She buys 4 cinema tickets at 9 each and spends the rest on books at 11 each. What is the largest number of books she can buy?

1. $11x + 9 \cdot 4 \le 120$
   *Why:* spending on books and tickets together cannot be more than the budget.
2. $11x \le 120 - 36 = 84$
   *Why:* subtract the 36 spent on tickets from both sides; the term changes sign as it moves across.
3. $x \le \dfrac{84}{11} \approx 7.64$
   *Why:* dividing both sides by a positive number keeps the direction of the inequality.
4. $x = 7$. Check: $36 + 11 \cdot 7 = 113 \le 120$, but 8 books would cost $36 + 88 = 124 > 120$.
   *Why:* books come in whole units, so take the largest whole number that still satisfies the inequality. Round down, not to the nearest whole number.

```verify
M = 120; py = 9; y = 4; px = 11
rest = M - py*y
assert py*y == 36
assert rest == 84
assert abs(rest/px - 7.64) < 0.005
x = floor(rest/px)
assert x == 7
assert py*y + px*x == 113
assert px*(x + 1) == 88
assert py*y + px*(x + 1) == 124
assert py*y + px*(x + 1) > M
```

### Example 2 (medium): two break-even points
A firm has to cut its price to sell more, and its profit from $Q$ units is $\pi(Q) = -2Q^2 + 140Q - 2000$. At which outputs does it break even, and when does it make a profit?

1. $-2Q^2 + 140Q - 2000 = 0 \;\Rightarrow\; Q^2 - 70Q + 1000 = 0$
   *Why:* break-even means zero profit; dividing both sides by −2 gives a simpler equation with the same solutions.
2. $(Q - 20)(Q - 50) = 0$, so $Q = 20$ or $Q = 50$
   *Why:* 20 and 50 multiply to 1000 and add to 70, and a product is zero only when one of its factors is zero.
3. Check with the formula on $2Q^2 - 140Q + 2000 = 0$: $D = 140^2 - 4 \cdot 2 \cdot 2000 = 3600$, $\sqrt{D} = 60$, $Q = \dfrac{140 \pm 60}{4}$, which gives 20 and 50.
   *Why:* the formula works even when the factors are hard to spot, and $D > 0$ confirms two break-even points.
4. $\pi(30) = -1800 + 4200 - 2000 = 400 > 0$, so the firm makes a profit for $20 < Q < 50$ and a loss below 20 or above 50.
   *Why:* profit can change sign only at a break-even point, so one test output between them shows the sign on the whole interval.

```verify
a = 2; b = 140; c = 2000
assert b/a == 70 and c/a == 1000
D = b^2 - 4*a*c
assert D == 3600
assert sqrt(D) == 60
Q1 = (b - sqrt(D))/(2*a)
Q2 = (b + sqrt(D))/(2*a)
assert Q1 == 20 and Q2 == 50
assert Q1*Q2 == 1000 and Q1 + Q2 == 70
assert -a*Q1^2 + b*Q1 - c == 0
assert -a*Q2^2 + b*Q2 - c == 0
assert -a*30^2 == -1800 and b*30 == 4200
assert -a*30^2 + b*30 - c == 400
```

### Example 3 (hard): how large can fixed costs be?
The same firm earns $-2Q^2 + 140Q$ before fixed costs, so with a fixed cost $F$ its profit is $\pi(Q) = -2Q^2 + 140Q - F$. What is the largest fixed cost at which it can still break even?

1. $2Q^2 - 140Q + F = 0$
   *Why:* set profit to zero and multiply both sides by −1 so the $Q^2$ term is positive.
2. $D = 140^2 - 4 \cdot 2 \cdot F = 19600 - 8F \ge 0$
   *Why:* a break-even output exists only if the equation has a solution, which needs a discriminant that is not negative.
3. $-8F \ge -19600 \;\Rightarrow\; F \le 2450$
   *Why:* subtract 19600 from both sides, then divide by −8; dividing by a negative number reverses the inequality.
4. At $F = 2450$, $D = 0$ and the only break-even output is $Q = \dfrac{140}{2 \cdot 2} = 35$. With $F = 2000$, $D = 3600 > 0$: two break-even points, as in Example 2. With $F = 3000$, $D = -4400 < 0$: the firm makes a loss at every output.
   *Why:* the sign of the discriminant tells you how many break-even points there are without solving the equation.

```verify
a = 2; b = 140
D2000 = b^2 - 4*a*2000
D3000 = b^2 - 4*a*3000
Fmax = b^2/(4*a)
assert b^2 == 19600 and 4*a == 8
assert -19600/(-8) == 2450
assert Fmax == 2450
assert b^2 - 4*a*Fmax == 0
assert b/(2*a) == 35
assert -a*35^2 + b*35 - Fmax == 0
assert D2000 == 3600
assert D3000 == -4400
# with F = 3000 profit is negative at every whole output from 0 to 70
Q = 0:70
assert max(-a*Q.^2 + b*Q - 3000) < 0
```

## Common mistakes
- Rounding up when the question asks for the largest whole number that fits the budget (ROUNDED_UP).
- Giving a fraction of a unit, such as 7.64 books (NOT_WHOLE).
- Forgetting the money already spent on the other good (IGNORED_OTHER_SPENDING).
- Moving a term to the other side without changing its sign (MOVED_TERM_SIGN).
- Not reversing the inequality after multiplying or dividing by a negative number (NO_FLIP).
- Dividing both sides by the unknown, which loses a solution: $Q^2 = 5Q$ has the solutions $Q = 0$ and $Q = 5$ (LOST_ROOT).
- Giving the other break-even quantity (OTHER_ROOT).
- Dividing by $a$ instead of $2a$ in the quadratic formula (HALF_DENOMINATOR).
- Dividing only the square root by $2a$ instead of the whole numerator (PARTIAL_DIVISION).
- Losing a minus sign in $b^2 - 4ac$ when $a$ and $c$ are both negative (DISCRIMINANT_SIGN).
- Leaving out the 4 in $b^2 - 4ac$ (FORGOT_FOUR).
- Forgetting to square $b$ in the discriminant (NOT_SQUARED).
- Giving the break-even output when the question asks for the fixed cost (GAVE_QUANTITY).

## Practice
- `budget-max-whole-units` (difficulty 1): the largest whole number of units of one good that fits a budget after spending on another; distractors ROUNDED_UP, NOT_WHOLE, IGNORED_OTHER_SPENDING, MOVED_TERM_SIGN.
- `quadratic-break-even` (difficulty 2): the smaller or the larger break-even quantity for $\pi(Q) = -aQ^2 + bQ - c$; distractors OTHER_ROOT, HALF_DENOMINATOR, PARTIAL_DIVISION, DISCRIMINANT_SIGN.
- `break-even-max-fixed-cost` (difficulty 3): the largest fixed cost $F$ for which $-aQ^2 + bQ - F = 0$ still has a solution; answer $b^2/(4a)$; distractors FORGOT_FOUR, NOT_SQUARED, GAVE_QUANTITY.

## Real world
- Business planning: when a firm must lower its price to sell more, profit is often modelled as a quadratic in output, and its two break-even points mark the range of output worth producing.
- Household budgets: a budget constraint is a linear inequality; it shows which combinations of rent, food and travel a household can afford on its income.
- Lending: banks run affordability checks that cap loan repayments at a share of income, which is a linear inequality in the size of the loan.
- Project appraisal: before building a plant, a firm can check whether any level of output covers the fixed cost; with quadratic profit this is the question of whether the discriminant is negative.

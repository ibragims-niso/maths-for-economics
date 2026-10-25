---
id: LA103
title: Linear systems and Gaussian elimination
block: LA1
coreYear: 1
prerequisites: [LA102, F05]
estMinutes: 45
status: draft
economicUses:
  - Equilibrium prices of several linked markets found together
  - Production plans that use every available machine hour
  - Blending problems with weight, nutrient and cost targets
  - "Spotting a model that does not pin down a unique answer"
searchTerms:
  - "Systems of linear equations and their solution"
  - "Consistent and inconsistent systems"
  - "Systems of linear equations in matrix form"
  - "General system of linear equations"
  - "Gauss's method"
  - "Gaussian elimination"
  - "Row echelon form"
syllabusHeadings:
  - "Systems of linear equations and their solution with matrices"
  - "Solving linear systems by Gauss's method"
generators: [machine-hours-back-substitution, three-market-equilibrium-price, singular-system-parameter]
widgets: [two-line-system]
mistakeCodes:
  ROW_OP_SIGN:
    label: Sign slip in a row operation
    explanation: A row operation changes every entry of the row, including the right-hand side and any entry that contains a parameter such as k. For Rᵢ − m·Rⱼ subtract m times each entry of row j; when m is negative that means adding.
  NOT_DIVIDED_BY_PIVOT:
    label: Forgot to divide by the pivot
    explanation: After the known terms are moved across, the row still reads pivot × unknown = number. Divide by the pivot to get the unknown itself.
  BACK_SUB_SIGN:
    label: Added the known terms instead of subtracting
    explanation: In back substitution the known terms move to the right-hand side, so they change sign. From 2x + 50 = 100 you get 2x = 50, not 2x = 150.
  WRONG_VARIABLE:
    label: Gave a different unknown
    explanation: Back substitution finds the unknowns from the last one upwards. Check which unknown the question asks for and keep going until you reach it.
  ENTRY_SET_TO_ZERO:
    label: Set the parameter itself to zero
    explanation: What decides the number of solutions is the pivot after elimination, not the original entry. Eliminate first; the system fails to have exactly one solution when the last pivot, such as k − 3, is zero.
  STOPPED_EARLY:
    label: Looked for a zero pivot too early
    explanation: An entry only counts as a pivot once every entry below the earlier pivots is zero. Finish the elimination to row echelon form before setting the last pivot equal to zero.
resources:
  - { title: "College Algebra 2e, 7.6 Solving Systems with Gaussian Elimination (OpenStax)", url: "https://openstax.org/books/college-algebra-2e/pages/7-6-solving-systems-with-gaussian-elimination", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "College Algebra 2e, 7.2 Systems of Linear Equations: Three Variables (OpenStax)", url: "https://openstax.org/books/college-algebra-2e/pages/7-2-systems-of-linear-equations-three-variables", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Linear Algebra (18.06SC), Elimination with Matrices (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/pages/ax-b-and-the-four-subspaces/elimination-with-matrices/", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
The price of coffee depends on the price of tea, the price of tea on the price of cocoa, and so on: in linked markets no single price can be found on its own. A factory planning its month faces the same problem: each product uses several machines, and each machine is shared by several products. Both lead to several linear equations that must hold at the same time. Gaussian elimination is a step-by-step method that solves such systems whatever their size, and it also tells you when a model has no answer or more than one.

## Intuition
With two unknowns you can substitute, as in F05. With three or more, substitution becomes messy, so we organise the work. Take a workshop making $x$ units of one product and $y$ of another, with machine A used for $x + 2y = 8$ hours and machine B for $3x + 4y = 18$ hours. Subtract 3 times the first equation from the second: the $x$ terms cancel and $-2y = -6$, so $y = 3$, and then $x + 6 = 8$ gives $x = 2$.

That is the whole idea. **Eliminate**: use one equation to remove an unknown from the equations below it, again and again, until the last equation has one unknown. **Back-substitute**: solve that one, then work upwards. Writing only the numbers in a table, the augmented matrix, saves copying the unknowns at every step.

Each equation in two unknowns is a straight line, and a solution is a point on both lines. Two lines either cross once, are parallel and never meet, or are the same line. So a system has exactly one solution, no solution, or infinitely many, and elimination shows which.

## Definition and formulas
::syllabus[Systems of linear equations in matrix form]

**A system in matrix form.** $m$ linear equations in $n$ unknowns are written $A\mathbf{x} = \mathbf{b}$ (the matrix–vector product of LA102). For example
$$\begin{aligned} 2x + y + 2z &= 100 \\ 3y + 2z &= 90 \\ 4z &= 60 \end{aligned} \quad\Longleftrightarrow\quad \begin{bmatrix} 2 & 1 & 2 \\ 0 & 3 & 2 \\ 0 & 0 & 4 \end{bmatrix} \begin{bmatrix} x \\ y \\ z \end{bmatrix} = \begin{bmatrix} 100 \\ 90 \\ 60 \end{bmatrix}$$

**Augmented matrix.** The coefficients and the right-hand side side by side, $[A \mid \mathbf{b}]$. Each row is one equation.

::syllabus[Elementary transformations and Gauss's method]

**Elementary row operations.** These three never change the set of solutions, because each can be undone:
1. swap two rows, $R_i \leftrightarrow R_j$;
2. multiply a row by a non-zero number, $R_i \to cR_i$ with $c \neq 0$;
3. add a multiple of another row, $R_i \to R_i - mR_j$.

**Row echelon form.** Any rows of zeros are at the bottom; the first non-zero entry of each row, its **pivot**, is to the right of the pivot in the row above; below every pivot there are only zeros.

**Gaussian elimination.** Work column by column, from left to right:
1. choose a pivot: a non-zero entry in the current column (swap rows if the top one is zero);
2. for each row below, compute the multiplier $m = \dfrac{\text{entry below}}{\text{pivot}}$ and replace that row by $R_i - mR_{\text{pivot}}$, which makes the entry zero;
3. move to the next column and the next row.

Then **back substitution**: solve the last row for its unknown, substitute it into the row above, and so on up to the first row.

**Gauss–Jordan elimination** goes further, to *reduced* row echelon form: every pivot is 1 and the entries above each pivot are zero too, so the solution can be read off directly. For the intuition's system:
$$\left[\begin{array}{rr|r} 1 & 2 & 8 \\ 3 & 4 & 18 \end{array}\right] \xrightarrow{R_2 - 3R_1} \left[\begin{array}{rr|r} 1 & 2 & 8 \\ 0 & -2 & -6 \end{array}\right] \xrightarrow{-\frac12 R_2} \left[\begin{array}{rr|r} 1 & 2 & 8 \\ 0 & 1 & 3 \end{array}\right] \xrightarrow{R_1 - 2R_2} \left[\begin{array}{rr|r} 1 & 0 & 2 \\ 0 & 1 & 3 \end{array}\right]$$
By hand, plain elimination with back substitution is usually less work.

::syllabus[General and special cases of linear systems]

**The three cases, read from the echelon form.**
- A row $[\,0 \;\; 0 \;\; \cdots \;\; 0 \mid d\,]$ with $d \neq 0$ says $0 = d$: **no solution** (the system is inconsistent).
- Otherwise, if every unknown has a pivot: **exactly one solution**.
- Otherwise, the unknowns without a pivot are **free variables**: give them any value $t$ and back-substitute for the others. There are **infinitely many solutions**.

A row $0 = 0$ is harmless: it only says one equation was a combination of the others.

Names used in many syllabi: a system with at least one solution is **consistent** (with exactly one it is **determined**, with infinitely many **undetermined**); one with no solution is **inconsistent**. A system whose right-hand sides are all 0 is **homogeneous** and is always consistent (LA205).

**Rank (a first look).** The number of pivots in the echelon form of $A$ is the **rank** of $A$. With $n$ unknowns: one solution when the rank is $n$ and no row reads $0 = d$; infinitely many when the system is consistent and the rank is below $n$. So a system with fewer equations than unknowns can never have exactly one solution. LA201 studies rank properly; LA104 gives a one-number test for square systems, the determinant.

## Interactive
::widget{id="two-line-system"}

The graph shows the intuition's system as two lines: machine A, $x + 2y = 8$ (lilac), and machine B, $ax + 4y = c$ (green). Move the **Machine B hours per unit of product 1, a** and **Machine B hours available, c** sliders. The panel shows the second row after the elimination step $R_2 - aR_1$, the solution and the case. Check: at $a = 3$, $c = 18$ the panel shows $-2y = -6$ and $x = 2$, $y = 3$. Now set $a = 2$: the lines become parallel and the row turns into $0 = c - 16$ (with $c = 18$ the panel shows $0 = 2$), so there is no solution. Set $c = 16$ as well and the two lines coincide: the row reads $0 = 0$ and there are infinitely many solutions.

## Worked examples

### Example 1 (easy): a production plan by back substitution
A workshop makes $x$ chairs, $y$ tables and $z$ cabinets a month. All three use the cutting machine (2, 1 and 2 hours per unit), only tables and cabinets use the assembly line (3 and 2 hours), and only cabinets go through finishing (4 hours). Cutting has 100 hours, assembly 90 and finishing 60, and every hour is used. Find the plan.

1. $\left[\begin{array}{rrr|r} 2 & 1 & 2 & 100 \\ 0 & 3 & 2 & 90 \\ 0 & 0 & 4 & 60 \end{array}\right]$
   *Why:* one row per machine, one column per product. Each row starts further right than the row above, so the matrix is already in row echelon form.
2. $4z = 60 \Rightarrow z = 15$
   *Why:* only cabinets use finishing, so the last row has a single unknown. Divide by the pivot 4.
3. $3y + 2 \cdot 15 = 90 \Rightarrow 3y = 60 \Rightarrow y = 20$
   *Why:* with $z$ known, the assembly row has one unknown left. Move the 30 known hours across, then divide by the pivot 3.
4. $2x + 20 + 2 \cdot 15 = 100 \Rightarrow 2x = 50 \Rightarrow x = 25$
   *Why:* tables and cabinets take 50 of the 100 cutting hours; chairs use the other 50, at 2 hours each.
5. The plan is 25 chairs, 20 tables and 15 cabinets.
   *Why:* three pivots for three unknowns, so this is the only plan that uses every hour.

```verify
A = [2, 1, 2; 0, 3, 2; 0, 0, 4]
b = [100; 90; 60]
z = 60/4
y = (90 - 2*z)/3
x = (100 - y - 2*z)/2
assert z == 15
assert y == 20
assert x == 25
assert 90 - 2*z == 60
assert 100 - y - 2*z == 50
assert deepEqual(A*[x; y; z], b)
```

### Example 2 (medium): three linked markets
Tea, coffee and cocoa are substitutes. Tea: $Q_d = 40 - P_1 + P_2$, $Q_s = 30 + P_1$. Coffee: $Q_d = 38 + 2P_1 - 2P_2 + P_3$, $Q_s = 10 + 2P_2$. Cocoa: $Q_d = 50 + 2P_1 + 2P_2 - 3P_3$, $Q_s = 10 + 2P_3$. Find the three equilibrium prices.

1. $2P_1 - P_2 = 10, \quad -2P_1 + 4P_2 - P_3 = 28, \quad -2P_1 - 2P_2 + 5P_3 = 40$
   *Why:* set demand equal to supply in each market and collect the price terms on the left, as in F05. Each market gives one equation in all three prices.
2. $\left[\begin{array}{rrr|r} 2 & -1 & 0 & 10 \\ -2 & 4 & -1 & 28 \\ -2 & -2 & 5 & 40 \end{array}\right] \xrightarrow{R_2 + R_1,\ R_3 + R_1} \left[\begin{array}{rrr|r} 2 & -1 & 0 & 10 \\ 0 & 3 & -1 & 38 \\ 0 & -3 & 5 & 50 \end{array}\right]$
   *Why:* the pivot is 2 and both entries below it are $-2$, so the multipliers are $-1$: adding row 1 clears $P_1$. The right-hand sides change too: $28 + 10 = 38$ and $40 + 10 = 50$.
3. $\xrightarrow{R_3 + R_2} \left[\begin{array}{rrr|r} 2 & -1 & 0 & 10 \\ 0 & 3 & -1 & 38 \\ 0 & 0 & 4 & 88 \end{array}\right]$
   *Why:* the multiplier is $-3/3 = -1$, so add row 2 to row 3. Row echelon form with three pivots (2, 3 and 4), so there is exactly one equilibrium.
4. $4P_3 = 88 \Rightarrow P_3 = 22$; $\;3P_2 - 22 = 38 \Rightarrow P_2 = 20$; $\;2P_1 - 20 = 10 \Rightarrow P_1 = 15$
   *Why:* back substitution, from the last row upwards; each row has one new unknown.
5. Check: tea $45 = 45$, coffee $50 = 50$, cocoa $54 = 54$.
   *Why:* putting the prices back into every demand and supply function confirms all three markets clear at once.

```verify
A = [2, -1, 0; -2, 4, -1; -2, -2, 5]
b = [10; 28; 40]
r1 = [2, -1, 0, 10]; r2 = [-2, 4, -1, 28]; r3 = [-2, -2, 5, 40]
s2 = r2 + r1
s3 = r3 + r1
assert deepEqual(s2, [0, 3, -1, 38])
assert deepEqual(s3, [0, -3, 5, 50])
e3 = s3 + s2
assert deepEqual(e3, [0, 0, 4, 88])
P3 = 88/4
P2 = (38 + P3)/3
P1 = (10 + P2)/2
assert P3 == 22
assert P2 == 20
assert P1 == 15
x = lusolve(A, b)
assert abs(x[1,1] - 15) < 1e-9
assert abs(x[2,1] - 20) < 1e-9
assert abs(x[3,1] - 22) < 1e-9
assert 40 - P1 + P2 == 45
assert 30 + P1 == 45
assert 38 + 2*P1 - 2*P2 + P3 == 50
assert 10 + 2*P2 == 50
assert 50 + 2*P1 + 2*P2 - 3*P3 == 54
assert 10 + 2*P3 == 54
```

### Example 3 (hard): a blend that may not be unique
A feed mill blends $x_1$ tonnes of maize, $x_2$ of soy meal and $x_3$ of barley. The batch must weigh 100 tonnes and contain 20 tonnes of protein; maize is 10 % protein, soy meal 40 % and barley 20 %. Maize costs 2 and soy meal 5 (thousand per tonne), barley costs $k$, and the batch must cost exactly $C$. For which barley price is there no unique blend? What happens then when $C = 300$ or $C = 310$? Find the blend when $k = 4$ and $C = 340$.

1. $\left[\begin{array}{rrr|r} 1 & 1 & 1 & 100 \\ 1 & 4 & 2 & 200 \\ 2 & 5 & k & C \end{array}\right]$
   *Why:* weight, protein and cost give one row each. The protein row $0.1x_1 + 0.4x_2 + 0.2x_3 = 20$ was multiplied by 10, an allowed row operation that avoids decimals.
2. $\xrightarrow{R_2 - R_1,\ R_3 - 2R_1} \left[\begin{array}{rrr|r} 1 & 1 & 1 & 100 \\ 0 & 3 & 1 & 100 \\ 0 & 3 & k - 2 & C - 200 \end{array}\right]$
   *Why:* clear $x_1$ below the pivot 1. The entry $k$ is treated like any other number: $k - 2 \cdot 1 = k - 2$.
3. $\xrightarrow{R_3 - R_2} \left[\begin{array}{rrr|r} 1 & 1 & 1 & 100 \\ 0 & 3 & 1 & 100 \\ 0 & 0 & k - 3 & C - 300 \end{array}\right]$
   *Why:* clear $x_2$ below the pivot 3. Now the last pivot is $k - 3$.
4. If $k \neq 3$ there are three pivots and exactly one blend. If $k = 3$ the last row is $0 = C - 300$.
   *Why:* at $k = 3$ barley costs exactly what a mix of $\tfrac23$ maize and $\tfrac13$ soy meal costs, $\tfrac23 \cdot 2 + \tfrac13 \cdot 5 = 3$, and that mix has the same weight and protein as barley. The cost condition then adds nothing new.
5. $k = 3$, $C = 300$: the last row is $0 = 0$. Let $x_3 = t$; then $x_2 = \dfrac{100 - t}{3}$ and $x_1 = \dfrac{200 - 2t}{3}$ for any $0 \le t \le 100$, for example $t = 10$ gives $(60, 30, 10)$. With $C = 310$ the last row is $0 = 10$: no blend exists.
   *Why:* two pivots for three unknowns (rank 2), so $x_3$ is free and every feasible blend costs exactly 300; any other budget is impossible.
6. $k = 4$, $C = 340$: $1 \cdot x_3 = 40$, then $3x_2 + 40 = 100 \Rightarrow x_2 = 20$, and $x_1 = 100 - 20 - 40 = 40$.
   *Why:* with $k \neq 3$ the last pivot is non-zero, so back substitution gives one blend: 40 t of maize, 20 t of soy meal and 40 t of barley.

```verify
M = [1, 1, 1; 1, 4, 2; 2, 5, 3]
assert abs(det(M)) < 1e-9
assert abs(det([1, 1, 1; 1, 4, 2; 2, 5, 4])) > 0.5
assert abs(0.1*60 + 0.4*30 + 0.2*10 - 20) < 1e-9
assert 2/3*2 + 1/3*5 == 3
assert abs(2/3*0.1 + 1/3*0.4 - 0.2) < 1e-12
t = 10
x3 = t; x2 = (100 - t)/3; x1 = (200 - 2*t)/3
assert x1 == 60
assert x2 == 30
assert x1 + x2 + x3 == 100
assert x1 + 4*x2 + 2*x3 == 200
assert 2*x1 + 5*x2 + 3*x3 == 300
t = 70
assert 2*(200 - 2*t)/3 + 5*(100 - t)/3 + 3*t == 300
r1 = [1, 1, 1, 100]; r2 = [1, 4, 2, 200]; r3 = [2, 5, 3, 310]
e3 = (r3 - 2*r1) - (r2 - r1)
assert deepEqual(e3, [0, 0, 0, 10])
x = lusolve([1, 1, 1; 1, 4, 2; 2, 5, 4], [100; 200; 340])
assert abs(x[1,1] - 40) < 1e-9
assert abs(x[2,1] - 20) < 1e-9
assert abs(x[3,1] - 40) < 1e-9
```

## Common mistakes
- Applying a row operation to the left-hand side correctly but slipping the sign on the right-hand side, or on an entry that contains $k$ (ROW_OP_SIGN).
- Stopping at "pivot × unknown = number" without dividing by the pivot (NOT_DIVIDED_BY_PIVOT).
- Adding the known terms in back substitution instead of moving them across with a minus sign (BACK_SUB_SIGN).
- Giving the value of a different unknown from the one asked for (WRONG_VARIABLE).
- Setting the original entry $k$ equal to zero instead of the last pivot after elimination (ENTRY_SET_TO_ZERO).
- Setting an entry equal to zero before the row is in echelon form (STOPPED_EARLY).
- Reading a row $0 = 0$ as "no solution": it only means one equation repeats information from the others.
- Multiplying a row by zero: it is not an allowed operation, because it throws an equation away and cannot be undone.

## Practice
- `machine-hours-back-substitution` (difficulty 1): number of chairs in a three-machine production plan whose system is already in echelon form, by back substitution; distractors NOT_DIVIDED_BY_PIVOT, BACK_SUB_SIGN, WRONG_VARIABLE.
- `three-market-equilibrium-price` (difficulty 2): one equilibrium price of three linked markets by Gaussian elimination and back substitution; distractors ROW_OP_SIGN, NOT_DIVIDED_BY_PIVOT, BACK_SUB_SIGN, WRONG_VARIABLE.
- `singular-system-parameter` (difficulty 3): the value of a parameter $k$ for which a $3 \times 3$ system fails to have exactly one solution; distractors ROW_OP_SIGN, STOPPED_EARLY, ENTRY_SET_TO_ZERO.

## Real world
- Policy models: the large models finance ministries and central banks use to study taxes or trade link hundreds of markets. Their equilibrium conditions are solved by computers with elimination methods, the same row operations done at scale.
- Production planning: when every machine or worker is fully booked, the plan solves a linear system. Linear programming (OP02) extends this to inequalities, and its simplex method moves between plans with pivot steps that are row operations.
- Blending: feed mills, oil refineries and food manufacturers choose blends that meet weight, nutrient and quality targets at the lowest cost. When one ingredient can be copied by a mix of others at the same price, the plan is not unique, as in Example 3.
- National accounts: statistics offices publish input–output tables of how industries buy from each other. Finding the output each industry needs to meet final demand is a large linear system (LA106).

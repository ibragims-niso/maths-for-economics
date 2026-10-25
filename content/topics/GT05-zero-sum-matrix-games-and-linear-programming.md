---
id: GT05
title: Zero-sum matrix games and linear programming
block: GT
coreYear: 3
prerequisites: [GT02, OP03]
estMinutes: 50
status: draft
economicUses:
  - Market-share battles between two rivals in a market of fixed size
  - Advertising and bidding contests where one firm's gain is the other's loss
  - Cautious (maximin) decisions under uncertainty, treating nature as an opponent
  - Solving large games with linear programming software
searchTerms:
  - "Minimax"
generators: [zero-sum-saddle-point-value, zero-sum-mixed-2x2-value, zero-sum-lp-optimal-value]
widgets: [zero-sum-lower-envelope]
mistakeCodes:
  ROWS_COLUMNS_SWAPPED:
    label: Took the worst case of the wrong player
    explanation: The row player's guarantee is the largest of the ROW minima, and the column player's is the smallest of the COLUMN maxima. Taking the largest of the column minima mixes up the two players and gives a number that neither of them can rely on.
  MAXIMAX:
    label: Picked the largest entry
    explanation: The largest entry is what the row player gets only if the opponent plays along. A rival who sees that row coming answers with the column that hurts most, so judge each row by its smallest entry, not its largest.
  AVERAGE_PAYOFF:
    label: Averaged all the entries
    explanation: An average treats every cell as equally likely, but a rival does not choose at random. The value is the payoff both sides can secure; with a saddle point it is the entry that is smallest in its row and largest in its column.
  PURE_MAXIMIN:
    label: Gave the pure maximin as the value
    explanation: The maximin is what the row player can guarantee without mixing. When there is no saddle point the value is higher, because mixing hides the row player's choice; it lies strictly between the maximin and the minimax.
  EQUAL_SPLIT:
    label: Assumed both players mix 50:50
    explanation: Optimal mixes are not coin tosses. The row player's probability is the one that makes the opponent indifferent between its columns, p = (a₂₂ − a₂₁)/(a₁₁ − a₁₂ − a₂₁ + a₂₂), and the value follows from it.
  PROBABILITY_SWAP:
    label: Used the column player's probability for the row player
    explanation: The row player's expected gain against a column uses the row player's own probabilities p and 1 − p. Putting the column player's probability q in its place gives a wrong value; find p from the indifference of the columns first.
  FORGOT_CONSTANT:
    label: Forgot the constant k
    explanation: After k is added to every entry the programme describes the shifted game, whose value is v + k. The optimal value of u₁ + u₂ is 1/(v + k), and the original value is 1/(optimum) − k.
  NO_RECIPROCAL:
    label: Gave v + k, not its reciprocal
    explanation: The variables of the programme are the probabilities divided by the shifted value, u = x/(v + k), so they add up to 1/(v + k). The optimum is the reciprocal of the shifted value, a small number when the value is large.
resources:
  - { title: "Applied Finite Mathematics (Sekhon and Bloom), 11.1: Strictly Determined Games (LibreTexts)", url: "https://math.libretexts.org/Bookshelves/Applied_Mathematics/Applied_Finite_Mathematics_(Sekhon_and_Bloom)/11%3A_Game_Theory/11.01%3A_Strictly_Determined_Games", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Applied Finite Mathematics (Sekhon and Bloom), 11.2: Non-Strictly Determined Games (LibreTexts)", url: "https://math.libretexts.org/Bookshelves/Applied_Mathematics/Applied_Finite_Mathematics_(Sekhon_and_Bloom)/11%3A_Game_Theory/11.02%3A_Non-Strictly_Determined_Games", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Matrix Methods in Data Analysis, Signal Processing, and Machine Learning (18.065), Lecture 24: Linear Programming and Two-Person Games (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-065-matrix-methods-in-data-analysis-signal-processing-and-machine-learning-spring-2018/resources/lecture-24-linear-programming-and-two-person-games/", kind: video, verifiedAt: 2026-10-18 }
---

## Why economists need this
Some contests have a fixed prize. When two firms fight over a market of fixed size, every percentage point of share one of them wins is a point the other loses; the same is true of two bidders for one contract, two TV channels splitting an evening audience, or two parties splitting the seats in an election. These are **zero-sum games**: one table of numbers describes both players, because one side's gain is the other's loss. Such games have a clean answer that GT01 and GT02 only hinted at. Each side has a **value** it can guarantee whatever the rival does, the two guarantees meet, and the strategies that achieve them can be computed with linear programming (OP02, OP03). The same cautious reasoning is used when a firm faces not a rival but an uncertain world ("nature") and wants a plan whose worst outcome is as good as possible.

## Intuition
Imagine that your rival is clever and will see through any plan you settle on. Then the honest way to judge a plan is by its **worst case**. Firm A (choosing a row) looks along each row for the smallest number, because that is what B will make it pay, and picks the row whose worst case is best. Firm B (choosing a column) loses the entries, so it looks down each column for the largest number and picks the column whose worst case is smallest.

Sometimes the two cautious choices meet in one cell. That cell is the smallest in its row and the largest in its column, like the lowest point of a mountain pass that is also the highest point of the valley across it, which is why it is called a **saddle point**. Neither firm wants to move, and its entry is the value of the game.

Often there is no saddle point, and then being predictable is costly: whatever A settles on, B can answer it. As in GT02, the way out is to mix. A random mix cannot be answered in advance, so it raises A's guaranteed gain. The best mix makes the lowest of A's expected gains (one for each of B's columns) as high as possible. Making "the lowest of several linear expressions" as large as possible is exactly what a linear programme can do, and the two firms' programmes turn out to be a primal–dual pair (OP03). That is why their guarantees meet in a single number.

## Definition and formulas
**Zero-sum game.** Player A has $m$ pure strategies (rows), player B has $n$ (columns). The **payoff matrix** $A = (a_{ij})$ gives what A wins from B when A plays row $i$ and B plays column $j$; B's payoff is $-a_{ij}$. A wants entries large, B wants them small. A **constant-sum** game, where the two payoffs always add to the same total (for example, market shares adding to 100 %), works the same way.

**Pure strategies: maximin and minimax.**
$$\underline{v} = \max_i \min_j a_{ij} \ \ (\text{lower value, A's maximin}), \qquad \overline{v} = \min_j \max_i a_{ij} \ \ (\text{upper value, B's minimax}).$$
A can guarantee at least $\underline{v}$, and B can make sure A gets no more than $\overline{v}$. Always $\underline{v} \le \overline{v}$: if row $r$ gives A's maximin and column $s$ gives B's minimax, then $\underline{v} = \min_j a_{rj} \le a_{rs} \le \max_i a_{is} = \overline{v}$.

**Saddle point.** An entry $a_{rs}$ that is the smallest in its row and the largest in its column. A saddle point exists exactly when $\underline{v} = \overline{v}$; then the **value** is $v = a_{rs}$, row $r$ and column $s$ are optimal pure strategies, and $(r, s)$ is a Nash equilibrium as in GT01. If there are several saddle points, they all have the same entry.

**Mixed strategies and the minimax theorem.** A mixed strategy for A is a probability vector $\mathbf{x} = (x_1, \dots, x_m)$ and for B a vector $\mathbf{y} = (y_1, \dots, y_n)$. A's expected gain is
$$E(\mathbf{x}, \mathbf{y}) = \mathbf{x}^{\mathsf T} A\, \mathbf{y} = \sum_{i}\sum_{j} x_i\, a_{ij}\, y_j .$$
Against a fixed $\mathbf{x}$, B's best answer can always be a pure column, so A's guarantee from $\mathbf{x}$ is $\min_j \sum_i x_i a_{ij}$. The **minimax theorem** (John von Neumann, 1928) says that with mixed strategies the two guarantees always meet:
$$\max_{\mathbf{x}} \min_{\mathbf{y}} E(\mathbf{x}, \mathbf{y}) = \min_{\mathbf{y}} \max_{\mathbf{x}} E(\mathbf{x}, \mathbf{y}) = v, \qquad \underline{v} \le v \le \overline{v}.$$
Optimal strategies $\mathbf{x}^*$, $\mathbf{y}^*$ exist: $\mathbf{x}^*$ earns A at least $v$ against every column, and $\mathbf{y}^*$ holds A to at most $v$ against every row. They form a mixed Nash equilibrium (GT02).

**Dominance.** Row $k$ dominates row $i$ if $a_{kj} \ge a_{ij}$ in every column: A never needs row $i$, so delete it. Column $l$ dominates column $j$ **for B** if $a_{il} \le a_{ij}$ in every row (B prefers smaller entries): delete column $j$, the one with the *larger* numbers. Deleting dominated rows and columns, again and again, never changes the value and often shrinks the game to 2×2.

**2×2 games without a saddle point.** For $A = \begin{pmatrix} a_{11} & a_{12} \\ a_{21} & a_{22} \end{pmatrix}$ with $\underline{v} < \overline{v}$, both players mix, and with $D = a_{11} - a_{12} - a_{21} + a_{22}$,
$$p^* = \frac{a_{22} - a_{21}}{D}, \qquad q^* = \frac{a_{22} - a_{12}}{D}, \qquad v = \frac{a_{11}a_{22} - a_{12}a_{21}}{D},$$
where $p^*$ is the probability that A plays row 1 and $q^*$ the probability that B plays column 1. These come from the indifference principle of GT02: $p^*$ makes A's expected gain the same against both columns, $q^*$ makes it the same from both rows.

**Graphical method for 2×$n$ games.** If A plays row 1 with probability $p$, its expected gain against column $j$ is the straight line
$$E_j(p) = p\,a_{1j} + (1 - p)\,a_{2j}, \qquad 0 \le p \le 1.$$
B answers with the lowest line, so A's guarantee is the **lower envelope** $\min_j E_j(p)$. Its highest point gives $p^*$ and $v$. The two lines that cross there are the columns B uses; solve that 2×2 game for $q^*$. Columns whose lines pass above the top are never used. For an $m$×2 game, draw B's lines against $q$ instead, take the **upper envelope** and find its lowest point.

**The game as a pair of linear programmes.** Add a constant $k$ to every entry so that all entries are positive; every expected gain rises by $k$, the optimal strategies do not change, and the shifted value $v + k$ is positive. Write $a'_{ij} = a_{ij} + k$. A wants the largest $w$ with $\sum_i a'_{ij} x_i \ge w$ for every column $j$ and $\sum_i x_i = 1$. Dividing by $w$ and setting $u_i = x_i / w$ gives
$$\text{A: } \min \sum_i u_i \ \text{ s.t. } \sum_i a'_{ij} u_i \ge 1 \ (\text{every } j),\ \mathbf{u} \ge \mathbf{0}; \qquad \text{B: } \max \sum_j t_j \ \text{ s.t. } \sum_j a'_{ij} t_j \le 1 \ (\text{every } i),\ \mathbf{t} \ge \mathbf{0}.$$
B's programme has the form of a production problem (OP02) and A's is its dual (OP03): the constraint matrix is transposed, $\ge$ turns into $\le$, and min turns into max. Strong duality says the two optima are equal, which is the minimax theorem again. Both optima equal $1/(v + k)$, so
$$v = \frac{1}{\text{optimal value}} - k, \qquad \mathbf{x}^* = \frac{\mathbf{u}}{\sum_i u_i}, \qquad \mathbf{y}^* = \frac{\mathbf{t}}{\sum_j t_j}.$$
By complementary slackness, a column whose constraint in A's programme is slack (more than 1) gets $t_j = 0$: B never uses it.

**Games against nature.** When the "opponent" is an uncertain state of the world (demand, weather, a policy change) that does not try to hurt you, the maximin choice is called the **Wald criterion**: choose the plan with the best worst case. It is a cautious rule, not the only one; the optimistic **maximax** rule takes the plan with the best best case, and the **Laplace** rule treats all states as equally likely and compares averages. If you know the probabilities of the states, compare expected values instead (ST103).

## Interactive
::widget{id="zero-sum-lower-envelope"}

The graph is the 2×3 game of Example 3. The lilac, green and gold lines are A's expected gain against B1, B2 and B3 when A plays row 1 (the TV campaign) with probability $p$. The solid line along the top of the shaded area is the lower envelope, what B's best answer leaves A, and the filled dot marks its highest point: the best $p^*$ and the value. Move **B3: A's gain from row 1** and **B3: A's gain from row 2** to change B's third column and watch the envelope and the panel. Check: at the start ($-3$ and $6$) the panel shows $p^* = 0.4$, value 1 and no saddle point, and the gold B3 line passes above the dot (it is at 2.4 there). Lower B3's row-2 gain to 3: B3 replaces B1 at the top and the panel shows $p^* = 0.364$ and $v = 0.82$. Set both B3 gains to $-1$: the top of the envelope becomes flat, the panel shows $p^*$ from 0 to 0.8, $v = -1$ and a saddle point at row 2, B3.

## Worked examples

### Example 1 (easy): a market-share battle with a saddle point
Two firms, A and B, share a market of fixed size. Each picks one campaign for the season without seeing the other's choice. The table gives the percentage points of market share A wins from B (a negative number means A loses share):
$$\begin{array}{c|ccc} \text{A}\backslash\text{B} & \text{Price cut} & \text{Advertising} & \text{Loyalty scheme} \\ \hline \text{Price cut} & 3 & -1 & 0 \\ \text{Advertising} & 4 & 2 & 5 \\ \text{Loyalty scheme} & -2 & 1 & 7 \end{array}$$
Find each firm's cautious choice and the value of the game.

1. Row minima: $-1,\ 2,\ -2$, so $\underline{v} = \max(-1, 2, -2) = 2$, from Advertising.
   *Why:* B answers each of A's rows with the column that hurts A most, so A judges a row by its smallest entry and picks the best of these.
2. Column maxima: $4,\ 2,\ 7$, so $\overline{v} = \min(4, 2, 7) = 2$, from Advertising.
   *Why:* entries are B's losses, so B judges a column by its largest entry and picks the smallest of these.
3. $\underline{v} = \overline{v} = 2$: the cell (Advertising, Advertising) is a saddle point and the value is $v = 2$.
   *Why:* 2 is the smallest number in its row and the largest in its column. If B switched, A would gain 4 or 5; if A switched, A would gain only $-1$ or 1. Neither wants to move.
4. The largest entry, 7, is a trap: if A chooses the Loyalty scheme hoping for it, B answers with a Price cut and A loses 2 points.
   *Why:* against a rival who can foresee your choice, the best case of a row is irrelevant; only its worst case counts.

```verify
A = [3, -1, 0; 4, 2, 5; -2, 1, 7]
r1 = min(A[1, :]); r2 = min(A[2, :]); r3 = min(A[3, :])
assert r1 == -1 and r2 == 2 and r3 == -2
lower = max(r1, r2, r3)
assert lower == 2
c1 = max(A[:, 1]); c2 = max(A[:, 2]); c3 = max(A[:, 3])
assert c1 == 4 and c2 == 2 and c3 == 7
upper = min(c1, c2, c3)
assert upper == 2
# the saddle cell is the smallest in its row and the largest in its column
assert A[2, 2] == lower and A[2, 2] == upper
assert A[2, 1] == 4 and A[2, 3] == 5 and A[1, 2] == -1 and A[3, 2] == 1
assert max(A) == 7 and A[3, 1] == -2
```

### Example 2 (medium): weekly promotions, dominance and a 2×2 mix
Two coffee chains choose this week's promotion without seeing each other's choice. The entries are hundreds of customers a week that A wins from B:
$$\begin{array}{c|ccc} \text{A}\backslash\text{B} & \text{Discount} & \text{Loyalty card} & \text{Free refill} \\ \hline \text{Discount} & 4 & -1 & 5 \\ \text{Loyalty card} & -2 & 1 & 2 \\ \text{Free refill} & 0 & -2 & 3 \end{array}$$
Solve the game: optimal mixes and value.

1. Row minima $-1, -2, -2$ give $\underline{v} = -1$; column maxima $4, 1, 5$ give $\overline{v} = 1$. Since $-1 < 1$, there is no saddle point.
   *Why:* without a saddle point every pure choice can be answered, so both chains will mix and the value lies between $-1$ and 1.
2. A's Free refill row $(0, -2, 3)$ is below its Discount row $(4, -1, 5)$ in every column: delete it. B's Free refill column $(5, 2)$ is above its Loyalty card column $(-1, 1)$ in both remaining rows: delete it too. The game shrinks to $\begin{pmatrix} 4 & -1 \\ -2 & 1 \end{pmatrix}$.
   *Why:* A never needs a row that is worse in every case, and B, who wants small numbers, never needs a column with larger entries everywhere.
3. $4p - 2(1 - p) = -p + (1 - p) \;\Rightarrow\; 6p - 2 = 1 - 2p \;\Rightarrow\; p^* = \dfrac{3}{8} = 0.375$
   *Why:* A's probability of Discount must give A the same expected gain against both of B's remaining columns; otherwise B would always play the one that gives A less.
4. $4q - (1 - q) = -2q + (1 - q) \;\Rightarrow\; 5q - 1 = 1 - 3q \;\Rightarrow\; q^* = \dfrac{1}{4} = 0.25$
   *Why:* B's probability of Discount must make A indifferent between its two rows.
5. $v = 4 \cdot 0.375 - 2 \cdot 0.625 = 0.25$, and the formula agrees: $\dfrac{4 \cdot 1 - (-1)(-2)}{8} = \dfrac{2}{8} = 0.25$.
   *Why:* A expects to win 25 customers a week. Mixing lifts A's guarantee from $-1$ (100 customers lost) to $+0.25$. Against B's deleted Free refill, A's mix earns $0.375 \cdot 5 + 0.625 \cdot 2 = 3.125 \ge 0.25$, and against A's deleted Free refill, B's mix gives A only $0.75 \cdot (-2) = -1.5 \le 0.25$, so the deletions were safe.

```verify
A = [4, -1, 5; -2, 1, 2; 0, -2, 3]
assert max(min(A[1, :]), min(A[2, :]), min(A[3, :])) == -1
assert min(max(A[:, 1]), max(A[:, 2]), max(A[:, 3])) == 1
# dominance: row 3 <= row 1, column 3 >= column 2 everywhere
assert 0 <= 4 and -2 <= -1 and 3 <= 5
assert 5 >= -1 and 2 >= 1 and 3 >= -2
D = 4 - (-1) - (-2) + 1
assert D == 8
p = (1 - (-2))/D
q = (1 - (-1))/D
assert p == 0.375 and q == 0.25
assert abs((4*p - 2*(1 - p)) - (-p + (1 - p))) < 1e-12
assert abs((4*q - (1 - q)) - (-2*q + (1 - q))) < 1e-12
v = 4*p - 2*(1 - p)
assert abs(v - 0.25) < 1e-12
assert abs((4*1 - (-1)*(-2))/D - 0.25) < 1e-12
assert abs(p*5 + (1 - p)*2 - 3.125) < 1e-12
assert abs(q*0 + (1 - q)*(-2) - (-1.5)) < 1e-12
# common wrong answers: average of the four cells, and q used in place of p
assert (4 - 1 - 2 + 1)/4 == 0.5
assert abs(q*4 + (1 - q)*(-2) - (-0.5)) < 1e-12
```

### Example 3 (hard): a 2×3 game, graphically and by linear programming
Firm A chooses between a TV campaign (row 1) and an online campaign (row 2); its rival B has three responses B1, B2, B3. The entries are percentage points of share A wins from B:
$$\begin{array}{c|ccc} \text{A}\backslash\text{B} & \text{B1} & \text{B2} & \text{B3} \\ \hline \text{TV} & -2 & 4 & -3 \\ \text{Online} & 3 & -1 & 6 \end{array}$$
Solve the game with the graphical method, then check the answer with the pair of linear programmes.

1. Row minima $-3, -1$ give $\underline{v} = -1$; column maxima $3, 4, 6$ give $\overline{v} = 3$. No saddle point, and no row or column is dominated.
   *Why:* nothing can be deleted, so all three of B's columns must be compared, which is what the graph does.
2. With $p$ the probability of TV: $E_1(p) = 3 - 5p$, $E_2(p) = -1 + 5p$, $E_3(p) = 6 - 9p$.
   *Why:* each is A's expected gain $p\,a_{1j} + (1 - p)\,a_{2j}$ against one column, a straight line from $a_{2j}$ at $p = 0$ to $a_{1j}$ at $p = 1$.
3. The lower envelope is $E_2$ for $0 \le p \le 0.4$, $E_1$ for $0.4 \le p \le 0.75$ and $E_3$ for $0.75 \le p \le 1$. Its top is where $E_1 = E_2$: $3 - 5p = -1 + 5p$, so $p^* = 0.4$ and $v = 1$. There $E_3(0.4) = 2.4 > 1$.
   *Why:* B answers each $p$ with the lowest line, so A maximises the envelope. B3's line passes above the top, so B never uses B3.
4. B mixes B1 and B2 so that A is indifferent between rows: $-2q + 4(1 - q) = 3q - (1 - q) \Rightarrow 4 - 6q = 4q - 1 \Rightarrow q^* = 0.5$. B's optimal strategy is $(0.5,\ 0.5,\ 0)$ and A's is $(0.4,\ 0.6)$.
   *Why:* this is the 2×2 game of the two active columns; both rows then give A $-2 \cdot 0.5 + 4 \cdot 0.5 = 3 \cdot 0.5 - 1 \cdot 0.5 = 1$.
5. Linear programmes: add $k = 4$ (the smallest entry is $-3$), giving rows $(2, 8, 1)$ and $(7, 3, 10)$. A: minimise $u_1 + u_2$ s.t. $2u_1 + 7u_2 \ge 1$, $8u_1 + 3u_2 \ge 1$, $u_1 + 10u_2 \ge 1$. B: maximise $t_1 + t_2 + t_3$ s.t. $2t_1 + 8t_2 + t_3 \le 1$, $7t_1 + 3t_2 + 10t_3 \le 1$. The points $\mathbf{u} = (0.08,\ 0.12)$ and $\mathbf{t} = (0.1,\ 0.1,\ 0)$ are feasible and both give $0.2$.
   *Why:* equal values for a feasible point of each programme prove both optimal (weak duality, OP03). Then $v = 1/0.2 - 4 = 1$, $\mathbf{x}^* = \mathbf{u}/0.2 = (0.4,\ 0.6)$ and $\mathbf{y}^* = \mathbf{t}/0.2 = (0.5,\ 0.5,\ 0)$, as found graphically. B3's constraint in A's programme is slack ($0.08 + 1.2 = 1.28 > 1$), so $t_3 = 0$ by complementary slackness.

```verify
A = [-2, 4, -3; 3, -1, 6]
assert max(min(A[1, :]), min(A[2, :])) == -1
assert min(max(A[:, 1]), max(A[:, 2]), max(A[:, 3])) == 3
E1(p) = -2*p + 3*(1 - p)
E2(p) = 4*p - 1*(1 - p)
E3(p) = -3*p + 6*(1 - p)
assert abs(E1(0.3) - (3 - 5*0.3)) < 1e-12 and abs(E3(0.3) - (6 - 9*0.3)) < 1e-12
ps = 0.4
assert abs(E1(ps) - E2(ps)) < 1e-12 and abs(E1(ps) - 1) < 1e-12
assert abs(E3(ps) - 2.4) < 1e-12
# envelope pieces: B1 and B3 cross at 0.75, B2 and B3 at 0.5 (above B1 there)
assert abs(E1(0.75) - E3(0.75)) < 1e-12 and abs(E1(0.75) + 0.75) < 1e-12
assert abs(E2(0.5) - E3(0.5)) < 1e-12 and E1(0.5) < E2(0.5)
# no p does better than 0.4: check a grid of 1001 points
g = 0:0.001:1
env = min([E1(g); E2(g); E3(g)], 1)
assert max(env) <= 1 + 1e-12 and max(env) > 1 - 1e-9
assert abs(min(env) - (-3)) < 1e-9
q = 0.5
assert abs((-2*q + 4*(1 - q)) - (3*q - (1 - q))) < 1e-12 and abs(-2*q + 4*(1 - q) - 1) < 1e-12
k = 4
S = A + k
assert deepEqual(S, [2, 8, 1; 7, 3, 10])
u = [0.08, 0.12]
t = [0.1, 0.1, 0]
assert abs(2*u[1] + 7*u[2] - 1) < 1e-12 and abs(8*u[1] + 3*u[2] - 1) < 1e-12
assert abs(u[1] + 10*u[2] - 1.28) < 1e-12
assert abs(2*t[1] + 8*t[2] + t[3] - 1) < 1e-12 and abs(7*t[1] + 3*t[2] + 10*t[3] - 1) < 1e-12
assert abs(sum(u) - 0.2) < 1e-12 and abs(sum(t) - 0.2) < 1e-12
assert abs(1/sum(u) - k - 1) < 1e-9
assert abs(u[1]/sum(u) - 0.4) < 1e-12 and abs(t[1]/sum(t) - 0.5) < 1e-12
```

## Common mistakes
- Taking the largest of the column minima (or the smallest of the row maxima), which mixes up whose worst case is whose; in Example 1 the largest column minimum is 0, not the value 2 (ROWS_COLUMNS_SWAPPED).
- Choosing the row with the largest entry: in Example 1 the 7 tempts A into the Loyalty scheme, where B's Price cut costs A 2 points (MAXIMAX).
- Averaging all the entries as if the rival chose at random (AVERAGE_PAYOFF).
- Giving the maximin as the value when there is no saddle point: in Example 2 that is $-1$, while mixing secures 0.25 (PURE_MAXIMIN).
- Assuming the optimal mixes are 50:50: in Example 2 the average of the four remaining entries is 0.5, not the value 0.25 (EQUAL_SPLIT).
- Putting B's probability $q$ into A's expected gain: in Example 2, $0.25 \cdot 4 + 0.75 \cdot (-2) = -0.5$ (PROBABILITY_SWAP).
- Forgetting the constant $k$: the optimum of the programme is $1/(v + k)$, so in Example 3 the optimum 0.2 means $v + 4 = 5$ and $v = 1$, not 5; the same slip written the other way gives $1/v$ as the optimum (FORGOT_CONSTANT).
- Reporting the shifted value $v + k$ itself (5 in Example 3) as the optimum of the programme, which is its reciprocal 0.2 (NO_RECIPROCAL).
- Deleting the wrong column: B, who pays the entries, drops a column whose numbers are *larger* everywhere, not smaller.
- Maximising the upper envelope instead of the lower one in the graphical method; A can count only on the lowest line at each $p$.
- Using the 2×2 formulas on a game that has a saddle point; they then give a "probability" outside $[0, 1]$ or a wrong value. Check $\underline{v} < \overline{v}$ first.

## Practice
- `zero-sum-saddle-point-value` (difficulty 1): the value of a 2×2 to 3×3 zero-sum game that has a saddle point (maximin = minimax); distractors ROWS_COLUMNS_SWAPPED, MAXIMAX, AVERAGE_PAYOFF.
- `zero-sum-mixed-2x2-value` (difficulty 2): the value of a 2×2 zero-sum game with no saddle point, $v = (a_{11}a_{22} - a_{12}a_{21})/D$; distractors PURE_MAXIMIN, EQUAL_SPLIT, PROBABILITY_SWAP.
- `zero-sum-lp-optimal-value` (difficulty 3): after a constant $k$ is added to a 2×2 game, the optimal value $1/(v + k)$ of the row player's linear programme; distractors FORGOT_CONSTANT, NO_RECIPROCAL, PURE_MAXIMIN.

## Real world
- History: John von Neumann proved the minimax theorem in 1928, and his 1944 book with Oskar Morgenstern, *Theory of Games and Economic Behavior*, founded game theory in economics. When George Dantzig showed him linear programming in 1947, von Neumann saw at once that the duality of linear programmes and the minimax theorem were the same idea.
- Marketing and competition: models of advertising and promotion battles in mature markets, where total sales hardly change and firms fight over shares, are often built as constant-sum games; the cautious solution shows how much share each firm can secure.
- Decisions under uncertainty: the maximin rule, proposed for statistics by Abraham Wald, is used in robust planning, where a firm, central bank or regulator chooses the policy whose worst outcome over a set of scenarios is least bad.
- Computing: two-player zero-sum games with very many strategies are solved with linear programming and related algorithms; poker programs that beat professional players in two-player games (for example Libratus in 2017) rest on this theory. Security agencies have used similar software to randomise checkpoints and patrols.

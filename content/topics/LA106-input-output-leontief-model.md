---
id: LA106
title: Input–output (Leontief) model
block: LA1
coreYear: 1
prerequisites: [LA105]
estMinutes: 45
status: draft
economicUses:
  - "Output each sector must produce to meet a given final demand: x = (I − A)⁻¹d"
  - "Total effect of a new construction project or a rise in household demand on every sector"
  - "Output multipliers: which sectors pull the rest of the economy along most strongly"
  - "Inter-industry linkages of an oil-exporting economy and plans to diversify it"
searchTerms:
  - "Leontief model"
  - "Input-output analysis"
generators: [technical-coefficient-from-flows, leontief-two-sector-output, leontief-total-output-change]
widgets: [leontief-two-sector]
mistakeCodes:
  DIVIDED_BY_SELLER:
    label: Divided by the selling sector's output
    explanation: A technical coefficient is an input per unit of the buyer's output, so a_ij = z_ij / x_j, where j is the column (the buying sector). Dividing by x_i, the output of the sector that sells, measures something else.
  INTERMEDIATE_ONLY:
    label: Divided by the column total of inputs only
    explanation: The coefficient divides by the buying sector's total output x_j, which is its inputs plus its value added (wages, profits). The column total of inputs leaves value added out, so the coefficient comes out too large.
  FLOW_DIRECTION:
    label: Read the flow the wrong way round
    explanation: In a flows table row i shows what sector i sells and column j shows what sector j buys. The input from sector i to sector j is in row i, column j; the cell in row j, column i is the flow in the opposite direction.
  IGNORED_INTERMEDIATE:
    label: Set output equal to final demand
    explanation: Sectors also buy from each other. Each sector must produce what final users buy plus all the inputs the sectors need, x = Ax + d, so output is larger than final demand.
  ONE_ROUND:
    label: Stopped after the first round of inputs
    explanation: d + Ad covers final demand and the inputs needed to make it, but making those inputs needs more inputs, and so on. The total is d + Ad + A²d + … = (I − A)⁻¹d.
  NO_DIVIDE_DET:
    label: Forgot to divide by det(I − A)
    explanation: The inverse of I − A is its adjugate divided by the determinant. Multiplying the adjugate by d without dividing by det(I − A) gives an output that is too small, because the determinant is below 1.
  OWN_SECTOR_ONLY:
    label: Ignored the other sector
    explanation: Dividing a sector's final demand by 1 − aₖₖ counts only the inputs it buys from itself. It also sells inputs to the other sector, and that sector's output depends on the whole of d, so use the full inverse (I − A)⁻¹.
  COLUMN_SUM_A:
    label: Used the column sum of A as the multiplier
    explanation: The column sum of A is only the first round of inputs per unit of final demand, without the unit itself. The output multiplier is the column sum of the Leontief inverse (I − A)⁻¹, which is always above 1.
  ROW_NOT_COLUMN:
    label: Added a row of the inverse instead of a column
    explanation: Column j of (I − A)⁻¹ lists what every sector must produce for one more unit of final demand for good j, so the multiplier of sector j is a column sum. A row sum mixes the effects of demand for different goods on one sector.
resources:
  - { title: "Applied Finite Mathematics (Sekhon and Bloom), 2.6 Applications – Leontief Models (LibreTexts)", url: "https://math.libretexts.org/Bookshelves/Applied_Mathematics/Applied_Finite_Mathematics_(Sekhon_and_Bloom)/02%3A_Matrices/2.06%3A_Applications__Leontief_Models", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "System of national accounts and balance of payments, with input-output tables (State Statistical Committee of the Republic of Azerbaijan)", url: "https://www.stat.gov.az/source/system_nat_accounts/?lang=en", kind: data, verifiedAt: 2026-10-18 }
  - { title: "ESA supply, use and input-output tables (Eurostat)", url: "https://ec.europa.eu/eurostat/web/esa-supply-use-input-tables", kind: data, verifiedAt: 2026-10-18 }
---

## Why economists need this
The government plans a new motorway. The builders need cement, steel and fuel; the cement works needs electricity and transport; the power station needs fuel and repairs; and every one of these firms also buys services. How much extra must each sector of the economy produce in the end, and which sectors gain most? The same question comes up when household demand for food rises, when exports of oil fall, or when a ministry compares two investment projects. Statistics offices publish **input–output tables** that record how much each sector buys from every other sector. Treated as a matrix (LA102), such a table turns these questions into a linear system, and the inverse matrix of LA105 answers all of them at once.

## Intuition
Think of final demand as an order: households, the government, investors and foreign buyers want certain amounts of food, manufactured goods and services. To deliver them, the sectors must first buy inputs from each other. Producing those inputs needs further inputs, which need further inputs again. Each round is smaller than the one before, because every sector spends only part of the value of its output on inputs; the rest is value added (wages, profits, taxes). So total output is the order plus a shrinking series of input rounds, just like the spending rounds behind the Keynesian multiplier (F08, F11).

Adding up the rounds by hand is slow. The Leontief model does it in one step: total output $x$ must cover the inputs the sectors need, $Ax$, plus final demand $d$. Solving $x = Ax + d$ with an inverse matrix gives the total of all the rounds directly. The inverse also measures **linkages**: a sector that buys many inputs from others pulls the rest of the economy along when demand for its own goods rises.

## Definition and formulas
**Flows table.** An economy has $n$ sectors. In row $i$, the table shows what sector $i$ sells: $z_{ij}$ to sector $j$ as an input, and $d_i$ to final users (households, government, investment, exports). Everything produced is sold, so total output is the row total:
$$x_i = z_{i1} + z_{i2} + \dots + z_{in} + d_i.$$
Column $j$ shows what sector $j$ buys. Its output $x_j$ minus all its inputs is its **value added** $v_j = x_j - \sum_i z_{ij}$.

**Technical (input) coefficients.** The input from sector $i$ needed per unit of sector $j$'s output is
$$a_{ij} = \frac{z_{ij}}{x_j}, \qquad A = (a_{ij}) \text{ the input (technology) matrix}.$$
Divide by the output of the *buying* sector, column $j$. The model assumes fixed recipes: doubling a sector's output doubles all its inputs.

**The balance and its solution.** Since $z_{ij} = a_{ij}x_j$, the row totals say
$$x = Ax + d \quad\Longleftrightarrow\quad (I - A)x = d \quad\Longrightarrow\quad x = (I - A)^{-1}d.$$
$L = (I - A)^{-1}$ is the **Leontief inverse**. For two sectors, by LA105,
$$(I - A)^{-1} = \frac{1}{(1 - a_{11})(1 - a_{22}) - a_{12}a_{21}}\begin{pmatrix} 1 - a_{22} & a_{12} \\ a_{21} & 1 - a_{11} \end{pmatrix}.$$

**What the inverse means.**
- Entry $l_{ij}$ is the total output of sector $i$, direct plus indirect, needed for one more unit of final demand for good $j$. Diagonal entries are at least 1: the unit itself plus the inputs.
- A change in final demand changes output by $\Delta x = (I - A)^{-1}\Delta d$.
- The **output multiplier** of sector $j$ is the column sum $m_j = l_{1j} + l_{2j} + \dots + l_{nj}$: the extra output of the whole economy per unit of extra final demand for good $j$.

**Rounds of input purchases.** Just as $\dfrac{1}{1 - a} = 1 + a + a^2 + \dots$ for $|a| < 1$ (F08, C117),
$$(I - A)^{-1} = I + A + A^2 + A^3 + \dots, \qquad x = d + Ad + A^2d + \dots$$
Here $d$ is the order itself, $Ad$ the first round of inputs, $A^2d$ the inputs needed to make those inputs, and so on.

**When the model works (productiveness).** An economy is **productive** if it can meet every final demand $d \ge 0$ with outputs $x \ge 0$; this happens exactly when $(I - A)^{-1}$ exists and has no negative entries. The **Hawkins–Simon condition** tests this: all the leading principal minors of $I - A$ must be positive (for two sectors: $1 - a_{11} > 0$ and $\det(I - A) > 0$). A simple sufficient check: every column sum of $A$ is below 1, so every sector spends less than one unit on inputs per unit of output and has positive value added.

**Value added and prices (briefly).** Per unit of output, sector $j$ has value added $1 - \sum_i a_{ij}$, and adding up over all sectors, total value added equals total final demand: GDP measured by incomes equals GDP measured by spending. Turned around, the price of each good must cover its inputs plus the wages and profits per unit, $u_j$: $p_j = \sum_i a_{ij}p_i + u_j$, so $p = (I - A^T)^{-1}u$. A wage rise in one sector therefore feeds through into the prices of all goods that use its output, directly or indirectly.

## Interactive
::widget{id="leontief-two-sector"}

This is the two-sector economy of Examples 1 and 2, agriculture and industry, with final demand for agriculture fixed at 80. Each bar is a sector's total output: lilac is final demand, gold the first round of inputs $Ad$, green all later rounds. At the start, $d_2 = 260$ and $a_{12} = 0.2$, and the panel shows $x_1 = 200$, $x_2 = 500$ and an industry output multiplier of 2.2. Move $d_2$ to 310 (50 more): the outputs become 220 and 590, a rise of $20 + 90 = 110 = 2.2 \times 50$, as in Example 2. Now put $d_2$ back to 260 and raise $a_{12}$, the agricultural input per unit of industrial output, to 0.5: the panel shows $x_1 = 404.5$, $x_2 = 568.2$ and a multiplier of 3.18, because industry now pulls more output out of agriculture. Notice that the green part never disappears: stopping after the gold round always understates output.

## Worked examples

### Example 1 (easy): from a flows table to the input matrix
A two-sector economy (million manat) has this flows table; rows show what each sector sells.
$$\begin{array}{l|cc|c} & \text{Agriculture} & \text{Industry} & \text{Final demand} \\ \hline \text{Agriculture} & 20 & 100 & 80 \\ \text{Industry} & 40 & 200 & 260 \end{array}$$
Find each sector's output, the input matrix $A$ and each sector's value added, and check the balance $x = Ax + d$.

1. $x_1 = 20 + 100 + 80 = 200$, $\quad x_2 = 40 + 200 + 260 = 500$
   *Why:* everything a sector produces is sold to a sector or to final users, so output is the row total.
2. $a_{11} = \dfrac{20}{200} = 0.1$, $a_{21} = \dfrac{40}{200} = 0.2$, $a_{12} = \dfrac{100}{500} = 0.2$, $a_{22} = \dfrac{200}{500} = 0.4$, so $A = \begin{pmatrix} 0.1 & 0.2 \\ 0.2 & 0.4 \end{pmatrix}$
   *Why:* each column is divided by the output of the buying sector: agriculture's inputs by 200, industry's by 500.
3. $v_1 = 200 - (20 + 40) = 140$, $\quad v_2 = 500 - (100 + 200) = 200$
   *Why:* value added is output minus all inputs bought, read down the column. Together $140 + 200 = 340 = 80 + 260$, total final demand.
4. $Ax + d = \begin{pmatrix} 0.1 \cdot 200 + 0.2 \cdot 500 + 80 \\ 0.2 \cdot 200 + 0.4 \cdot 500 + 260 \end{pmatrix} = \begin{pmatrix} 200 \\ 500 \end{pmatrix} = x$
   *Why:* $a_{ij}x_j$ gives back the flows, so the coefficients reproduce the table. The column sums 0.3 and 0.6 are below 1, so the economy is productive.

```verify
Z = [20, 100; 40, 200]
d = [80; 260]
x = Z*[1; 1] + d
assert deepEqual(x, [200; 500])
x1 = x[1,1]
x2 = x[2,1]
A = [Z[1,1]/x1, Z[1,2]/x2; Z[2,1]/x1, Z[2,2]/x2]
assert sum(abs(A - [0.1, 0.2; 0.2, 0.4])) < 0.000000001
v1 = x1 - (Z[1,1] + Z[2,1])
v2 = x2 - (Z[1,2] + Z[2,2])
assert v1 == 140
assert v2 == 200
assert v1 + v2 == d[1,1] + d[2,1]
assert v1 + v2 == 340
assert sum(abs(A*x + d - x)) < 0.000000001
assert abs(A[1,1] + A[2,1] - 0.3) < 0.000000001
assert abs(A[1,2] + A[2,2] - 0.6) < 0.000000001
```

### Example 2 (medium): the Leontief inverse and a rise in household demand
For the economy of Example 1, find the Leontief inverse, check that it gives the outputs of the table, and find how output changes when household demand for industrial goods rises by 50 million manat.

1. $I - A = \begin{pmatrix} 0.9 & -0.2 \\ -0.2 & 0.6 \end{pmatrix}$, $\quad \det(I - A) = 0.9 \cdot 0.6 - (-0.2)(-0.2) = 0.54 - 0.04 = 0.5$
   *Why:* the determinant is positive (and $1 - a_{11} = 0.9 > 0$), so the Hawkins–Simon condition holds and the inverse exists.
2. $(I - A)^{-1} = \dfrac{1}{0.5}\begin{pmatrix} 0.6 & 0.2 \\ 0.2 & 0.9 \end{pmatrix} = \begin{pmatrix} 1.2 & 0.4 \\ 0.4 & 1.8 \end{pmatrix}$
   *Why:* swap the diagonal, change the signs of the other two entries and divide by the determinant (LA105). All entries are positive, as in a productive economy.
3. $x = (I - A)^{-1}d = \begin{pmatrix} 1.2 \cdot 80 + 0.4 \cdot 260 \\ 0.4 \cdot 80 + 1.8 \cdot 260 \end{pmatrix} = \begin{pmatrix} 96 + 104 \\ 32 + 468 \end{pmatrix} = \begin{pmatrix} 200 \\ 500 \end{pmatrix}$
   *Why:* the inverse recovers the outputs of the flows table, a check that it is right.
4. $\Delta d = \begin{pmatrix} 0 \\ 50 \end{pmatrix}$, $\quad \Delta x = (I - A)^{-1}\Delta d = 50\begin{pmatrix} 0.4 \\ 1.8 \end{pmatrix} = \begin{pmatrix} 20 \\ 90 \end{pmatrix}$
   *Why:* only column 2 of the inverse is needed. Industry produces 90 more: 50 for households and 40 as inputs; agriculture produces 20 more, although nobody buys more food.
5. $m_1 = 1.2 + 0.4 = 1.6$, $\quad m_2 = 0.4 + 1.8 = 2.2$, and $\Delta x_1 + \Delta x_2 = 20 + 90 = 110 = 2.2 \times 50$
   *Why:* the column sums are the output multipliers. Demand for industrial goods raises total output more than demand for food, because industry buys more inputs per unit.

```verify
A = [0.1, 0.2; 0.2, 0.4]
IA = identity(2) - A
assert abs(det(IA) - 0.5) < 0.000000001
assert abs(0.9*0.6 - 0.04 - 0.5) < 0.000000001
L = inv(IA)
assert sum(abs(L - [1.2, 0.4; 0.4, 1.8])) < 0.000000001
assert sum(abs([0.6, 0.2; 0.2, 0.9]/0.5 - L)) < 0.000000001
x = L*[80; 260]
assert sum(abs(x - [200; 500])) < 0.000000001
assert abs(1.2*80 - 96) < 0.000000001
assert abs(0.4*260 - 104) < 0.000000001
assert abs(0.4*80 - 32) < 0.000000001
assert abs(1.8*260 - 468) < 0.000000001
dx = L*[0; 50]
assert sum(abs(dx - [20; 90])) < 0.000000001
m1 = L[1,1] + L[2,1]
m2 = L[1,2] + L[2,2]
assert abs(m1 - 1.6) < 0.000000001
assert abs(m2 - 2.2) < 0.000000001
assert abs(dx[1,1] + dx[2,1] - 110) < 0.000000001
assert abs(m2*50 - 110) < 0.000000001
# the new outputs (220, 590) balance x = Ax + d with the new demand
xn = L*[80; 310]
assert sum(abs(xn - [220; 590])) < 0.000000001
assert sum(abs(A*xn + [80; 310] - xn)) < 0.000000001
```

### Example 3 (hard): a construction project, round by round
An economy has three sectors, agriculture (1), industry (2) and services (3), with
$$A = \begin{pmatrix} 0.1 & 0.1 & 0.1 \\ 0.2 & 0.3 & 0.2 \\ 0.1 & 0.2 & 0.1 \end{pmatrix}.$$
A construction project needs 100 million manat of industrial goods and 50 of services. Check that the economy is productive, follow the first two rounds of input purchases, then use the Leontief inverse
$$L = \begin{pmatrix} 1.18 & 0.22 & 0.18 \\ 0.4 & 1.6 & 0.4 \\ 0.22 & 0.38 & 1.22 \end{pmatrix}$$
to find the full effect on each sector.

1. Column sums of $A$: $0.1 + 0.2 + 0.1 = 0.4$, $\;0.1 + 0.3 + 0.2 = 0.6$, $\;0.1 + 0.2 + 0.1 = 0.4$, all below 1
   *Why:* every sector spends less than one unit on inputs per unit of output, which is enough for the economy to be productive.
2. $\Delta d = \begin{pmatrix} 0 \\ 100 \\ 50 \end{pmatrix}$, $\quad A\Delta d = \begin{pmatrix} 0.1 \cdot 100 + 0.1 \cdot 50 \\ 0.3 \cdot 100 + 0.2 \cdot 50 \\ 0.2 \cdot 100 + 0.1 \cdot 50 \end{pmatrix} = \begin{pmatrix} 15 \\ 40 \\ 25 \end{pmatrix}$
   *Why:* round 1: the inputs that industry and services buy to make what the project orders.
3. $A^2\Delta d = A\begin{pmatrix} 15 \\ 40 \\ 25 \end{pmatrix} = \begin{pmatrix} 8 \\ 20 \\ 12 \end{pmatrix}$; after two rounds the total is $\begin{pmatrix} 0 + 15 + 8 \\ 100 + 40 + 20 \\ 50 + 25 + 12 \end{pmatrix} = \begin{pmatrix} 23 \\ 160 \\ 87 \end{pmatrix}$, 270 in all
   *Why:* round 2 is the inputs needed for round 1. The rounds shrink but do not stop, so the running total is still short.
4. Column 2 check: $(I - A)\begin{pmatrix} 0.22 \\ 1.6 \\ 0.38 \end{pmatrix} = \begin{pmatrix} 0.198 - 0.16 - 0.038 \\ -0.044 + 1.12 - 0.076 \\ -0.022 - 0.32 + 0.342 \end{pmatrix} = \begin{pmatrix} 0 \\ 1 \\ 0 \end{pmatrix}$
   *Why:* $(I - A)L = I$ column by column, so the given $L$ is the inverse; the other columns check the same way.
5. $\Delta x = L\Delta d = \begin{pmatrix} 0.22 \cdot 100 + 0.18 \cdot 50 \\ 1.6 \cdot 100 + 0.4 \cdot 50 \\ 0.38 \cdot 100 + 1.22 \cdot 50 \end{pmatrix} = \begin{pmatrix} 31 \\ 180 \\ 99 \end{pmatrix}$, 310 in all
   *Why:* the inverse adds up all the rounds at once. Agriculture gains 31 although the project buys no food; the later rounds add $310 - 270 = 40$.
6. Multipliers: $m_2 = 0.22 + 1.6 + 0.38 = 2.2$, $m_3 = 0.18 + 0.4 + 1.22 = 1.8$, and $2.2 \cdot 100 + 1.8 \cdot 50 = 310$
   *Why:* by linearity the total effect is each demand change times its sector's output multiplier.
7. Value added per unit is $1 - 0.4 = 0.6$, $1 - 0.6 = 0.4$, $1 - 0.4 = 0.6$, so the project creates $0.6 \cdot 31 + 0.4 \cdot 180 + 0.6 \cdot 99 = 150$ of value added
   *Why:* incomes (wages, profits) rise by exactly the 150 the project spends, even though output rises by 310: the rest of the output is inputs used up along the way.

```verify
A = [0.1, 0.1, 0.1; 0.2, 0.3, 0.2; 0.1, 0.2, 0.1]
assert abs(sum(A[:,1]) - 0.4) < 0.000000001
assert abs(sum(A[:,2]) - 0.6) < 0.000000001
assert abs(sum(A[:,3]) - 0.4) < 0.000000001
dd = [0; 100; 50]
r1 = A*dd
assert sum(abs(r1 - [15; 40; 25])) < 0.000000001
r2 = A*r1
assert sum(abs(r2 - [8; 20; 12])) < 0.000000001
two = dd + r1 + r2
assert sum(abs(two - [23; 160; 87])) < 0.000000001
assert abs(sum(two) - 270) < 0.000000001
L = [1.18, 0.22, 0.18; 0.4, 1.6, 0.4; 0.22, 0.38, 1.22]
IA = identity(3) - A
assert sum(abs(IA*L - identity(3))) < 0.000000001
assert sum(abs(inv(IA) - L)) < 0.000000001
assert sum(abs(IA*[0.22; 1.6; 0.38] - [0; 1; 0])) < 0.000000001
assert abs(0.198 - 0.16 - 0.038) < 0.000000001
assert abs(-0.044 + 1.12 - 0.076 - 1) < 0.000000001
assert abs(-0.022 - 0.32 + 0.342) < 0.000000001
dx = L*dd
assert sum(abs(dx - [31; 180; 99])) < 0.000000001
assert abs(sum(dx) - 310) < 0.000000001
assert abs(sum(dx) - sum(two) - 40) < 0.000000001
# series: I + A + A^2 = (I - A^3)(I - A)^-1, and the rounds die out, so all of them add up to L dd
assert sum(abs((identity(3) - A^3)*L*dd - two)) < 0.000000001
assert sum(abs(A^60)) < 0.000000001
assert sum(abs((identity(3) - A^60)*L*dd - dx)) < 0.000001
m2 = sum(L[:,2])
m3 = sum(L[:,3])
assert abs(m2 - 2.2) < 0.000000001
assert abs(m3 - 1.8) < 0.000000001
assert abs(m2*100 + m3*50 - 310) < 0.000000001
v = [1, 1, 1] - [1, 1, 1]*A
assert sum(abs(v - [0.6, 0.4, 0.6])) < 0.000000001
assert abs(sum(v*dx) - 150) < 0.000000001
assert abs(0.6*31 + 0.4*180 + 0.6*99 - 150) < 0.000000001
```

## Common mistakes
- Dividing a flow by the output of the sector that sells it, $x_i$, instead of the sector that buys it, $x_j$ (DIVIDED_BY_SELLER).
- Dividing by the column total of inputs instead of total output, which leaves out value added (INTERMEDIATE_ONLY).
- Taking $z_{ji}$ from the table instead of $z_{ij}$: rows sell, columns buy (FLOW_DIRECTION).
- Setting output equal to final demand and forgetting that sectors buy inputs from each other (IGNORED_INTERMEDIATE).
- Stopping after the first round, $x \approx d + Ad$ (ONE_ROUND).
- Multiplying the adjugate of $I - A$ by $d$ but forgetting to divide by $\det(I - A)$ (NO_DIVIDE_DET).
- Solving each sector on its own, $x_k = d_k/(1 - a_{kk})$, as if the sectors did not buy from each other (OWN_SECTOR_ONLY).
- Taking the column sum of $A$ as the output multiplier; the multiplier is a column sum of $(I - A)^{-1}$ (COLUMN_SUM_A).
- Adding a row of the Leontief inverse instead of a column (ROW_NOT_COLUMN).
- Inverting $A$ instead of $I - A$: the system is $(I - A)x = d$, and $A^{-1}$ may not exist or may have negative entries.
- Treating the coefficients as fixed for ever: a large project, new technology or price changes alter the recipes, so results are best read as estimates for moderate changes.

## Practice
- `technical-coefficient-from-flows` (difficulty 1): one technical coefficient $a_{ij}$ from a 2- or 3-sector flows table, finding the buyer's output as a row total first; distractors DIVIDED_BY_SELLER, INTERMEDIATE_ONLY, FLOW_DIRECTION.
- `leontief-two-sector-output` (difficulty 2): total output of one sector of a two-sector economy from $x = (I - A)^{-1}d$, with $A$ in tenths; distractors IGNORED_INTERMEDIATE, ONE_ROUND, NO_DIVIDE_DET, OWN_SECTOR_ONLY.
- `leontief-total-output-change` (difficulty 3): the rise in the total output of both sectors when final demand for one good rises, using the output multiplier (a column sum of the Leontief inverse); distractors COLUMN_SUM_A, ONE_ROUND, OWN_SECTOR_ONLY, ROW_NOT_COLUMN.

## Real world
- National statistics: statistics offices compile input–output tables every few years from detailed surveys of what firms buy. Azerbaijan's State Statistical Committee publishes them for benchmark years such as 2016 and 2021, and Eurostat publishes tables for EU countries; Wassily Leontief received the Nobel memorial prize in economics in 1973 for developing this method.
- Impact studies: governments and development banks use output multipliers to estimate how a new road, a stadium or a rise in tourism spreads through the economy. Multiplying $\Delta x$ by jobs or wages per unit of output turns it into extra employment and income.
- Oil and linkages: in an oil-exporting economy such as Azerbaijan, the tables show which domestic sectors supply the oil and gas industry (construction, transport, engineering and business services) and how much of its output goes straight to exports. Comparing the output multipliers of oil, agriculture, manufacturing and tourism helps planners judge which sectors would spread growth most widely when diversifying away from oil.
- Supply chains and emissions: linking the tables of many countries shows how much value each country adds to a car or a phone (trade in value added), and multiplying $(I - A)^{-1}$ by emissions per unit of output gives the carbon footprint of what households buy, including the emissions of every supplier.

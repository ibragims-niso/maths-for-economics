---
id: LA102
title: Matrices and matrix operations
block: LA1
coreYear: 1
prerequisites: [LA101]
estMinutes: 45
status: draft
economicUses:
  - "Storing economic data as tables: shops × goods, plants × products, sectors × inputs"
  - Revenue or cost of many shops, plants or bundles in a single product
  - "Input–output tables of a whole economy (the Leontief model)"
  - Labour-market and credit-rating transition matrices
generators: [matrix-product-revenue-entry, transition-matrix-two-step, matrix-chain-plant-cost]
widgets: [shop-revenue-matrix]
mistakeCodes:
  INDICES_SWAPPED:
    label: Swapped the row and the column of the entry
    explanation: Entry (i, j) of AB uses row i of A and column j of B. Using row j and column i gives entry (j, i), which is usually a different number, here another shop or another price list.
  ORDER_SWAPPED:
    label: Multiplied in the wrong order
    explanation: AB and BA are different matrices, often not even the same size. For AB the rows come from the left matrix A and the columns from the right matrix B; keep the order the question gives.
  TOTALS_MULTIPLIED:
    label: Multiplied the totals
    explanation: Multiplying a row total by a column total pairs every quantity with every price. A matrix product pairs them one to one, first with first, second with second, and so on, and then adds those products.
  ROW_BY_ROW:
    label: Multiplied a row by a row
    explanation: An entry of a product is always a row of the left matrix times a column of the right one. Row i of T times row j of T gives an entry of TTᵀ, not of T², and mixes up where people start and where they end.
  ONE_PATH:
    label: Counted only one route
    explanation: To get from state i to state j in two periods a person can pass through either state in between. (T²)ᵢⱼ = tᵢ₁t₁ⱼ + tᵢ₂t₂ⱼ adds the probabilities of all the routes; counting only the route that stays put first misses the others.
  ENTRY_SQUARED:
    label: Squared the entry
    explanation: T² means the matrix product T times T, not the table of squared entries. Square matrices are multiplied row by column, (T²)ᵢⱼ = tᵢ₁t₁ⱼ + tᵢ₂t₂ⱼ.
  ONE_STEP:
    label: Gave the one-period probability
    explanation: The entry tᵢⱼ of T is the chance of moving from i to j in one period. Two periods ahead needs the matrix T² = TT.
  COLUMN_FOR_ROW:
    label: Read a column where a row was meant
    explanation: In the plan X the rows are plants and the columns are products, so plant i's outputs are row i. Column i lists one product's output across all plants. Check what the rows and columns of each table stand for.
resources:
  - { title: "College Algebra 2e, 7.5 Matrices and Matrix Operations (OpenStax)", url: "https://openstax.org/books/college-algebra-2e/pages/7-5-matrices-and-matrix-operations", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Linear Algebra (MIT 18.06SC), Multiplication and Inverse Matrices (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/pages/ax-b-and-the-four-subspaces/multiplication-and-inverse-matrices/", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
Economic data rarely come as single numbers. A supermarket chain records the sales of every product in every store; a statistics office publishes how much each sector of the economy buys from every other sector; a central bank tracks how many workers move between jobs and unemployment each quarter. Each of these is a table, and a matrix is a table we can calculate with. With matrix operations one line of algebra gives the revenue of every shop, the cost of every plant or next year's labour market at once, instead of dozens of separate sums. The later linear algebra topics (LA103 to LA106) and econometrics (EM01) are all written in this language.

## Intuition
A **matrix** is a rectangular table of numbers in which position matters: each row stands for one thing (a shop, a plant, a sector) and each column for another (a good, an input). The table of one day's sales of two shops is a matrix with 2 rows and 3 columns if they sell 3 goods.

In LA101 the cost of a bundle $\mathbf{x}$ at prices $\mathbf{p}$ was the dot product $\mathbf{p}\cdot\mathbf{x}$. Each row of the sales table is a bundle, so pricing every row at once means taking many dot products, one per row. That is exactly what multiplying a matrix by a vector does: the result is the vector of revenues, one entry per shop.

Multiplying two matrices goes one step further. If the second matrix holds several price lists, one per column, then every shop meets every price list, and the product is a table of revenues with shops in its rows and price lists in its columns. This is why the rule is "row of the first times column of the second", and why the order matters: the rows of the answer come from the left matrix and the columns from the right one. Swapping the two factors gives a different table, often of a different size, and usually one with no meaning.

A square matrix can also be applied again and again. If a matrix describes how workers move between employment and unemployment in one year, applying it twice describes two years.

## Definition and formulas
An $m \times n$ matrix $A$ has $m$ rows and $n$ columns; $m \times n$ is its **size**. The entry in row $i$ and column $j$ is $a_{ij}$. A vector with $n$ entries is an $n \times 1$ matrix (a column vector).

**Sum and scalar multiple** (only for matrices of the same size), entry by entry:
$$(A + B)_{ij} = a_{ij} + b_{ij}, \qquad (kA)_{ij} = k\,a_{ij}$$
So $2A - 3B$ has entries $2a_{ij} - 3b_{ij}$.

**Matrix times vector.** For $A$ of size $m \times n$ and $\mathbf{x}$ with $n$ entries, $A\mathbf{x}$ has $m$ entries, each a dot product of a row with $\mathbf{x}$:
$$(A\mathbf{x})_i = a_{i1}x_1 + a_{i2}x_2 + \dots + a_{in}x_n$$
Equivalently, $A\mathbf{x} = x_1(\text{column } 1) + \dots + x_n(\text{column } n)$, a linear combination of the columns (LA101).

**Matrix times matrix.** For $A$ of size $m \times n$ and $B$ of size $n \times p$, the product $AB$ has size $m \times p$ and
$$(AB)_{ij} = \sum_{k=1}^{n} a_{ik}\,b_{kj} = (\text{row } i \text{ of } A)\cdot(\text{column } j \text{ of } B)$$
It is defined only when the number of columns of $A$ equals the number of rows of $B$: $(m \times n)(n \times p) = m \times p$.

Rules that hold: $(AB)C = A(BC)$, $A(B + C) = AB + AC$, $k(AB) = (kA)B$. Rule that fails: in general $AB \ne BA$.

**Special matrices.**
- A **square** matrix has as many rows as columns.
- The **identity** $I_n$ is square with 1s on the main diagonal and 0s elsewhere; $AI = IA = A$, like multiplying a number by 1.
- A **diagonal** matrix has zeros everywhere off the main diagonal.
- The **transpose** $A^{\mathsf T}$ turns rows into columns: $(A^{\mathsf T})_{ij} = a_{ji}$. Then $(A + B)^{\mathsf T} = A^{\mathsf T} + B^{\mathsf T}$ and
$$(AB)^{\mathsf T} = B^{\mathsf T} A^{\mathsf T}$$
with the order reversed, so that the sizes still fit. The dot product is a matrix product too: $\mathbf{p}\cdot\mathbf{x} = \mathbf{p}^{\mathsf T}\mathbf{x}$.
- A **symmetric** matrix equals its transpose, $A = A^{\mathsf T}$, like a table of road distances between cities. For any $A$, the product $A^{\mathsf T}A$ is symmetric.

**Powers.** For a square matrix, $A^2 = AA$ and $A^3 = AAA$. A **transition matrix** $T$ has rows for the state now and columns for the state next period; its entries are probabilities, so each row adds up to 1. Then $(T^2)_{ij}$ is the probability of going from state $i$ to state $j$ in two periods, and a row vector of numbers of people $\mathbf{x}$ becomes $\mathbf{x}T$ one period later.

**Transformations.** A $2 \times 2$ matrix moves every point $\mathbf{x}$ of the plane to $A\mathbf{x}$. Its first column is where $(1, 0)$ goes and its second column where $(0, 1)$ goes; for example $\begin{pmatrix} 2 & 0 \\ 0 & 1 \end{pmatrix}$ doubles the first coordinate and leaves the second alone.

## Interactive
::widget{id="shop-revenue-matrix"}

The widget uses the sales table $Q$ of Example 1: shop A sells 40 bread, 25 milk and 10 coffee a day, shop B 30, 50 and 20. Milk stays at 3; you move the prices of bread and coffee. Each shop's revenue is its row of $Q$ times the price vector $\mathbf{p}$, and the panel shows both entries of $Q\mathbf{p}$. At the start (bread 2, coffee 5) the panel shows 205 and 310, the answer of Example 1. Move the coffee price to 6: shop A's revenue rises by 10 to 215 and shop B's by 20 to 330, because those are the numbers of coffees they sell, the coffee column of $Q$. That is also why shop B's line is twice as steep. Then set bread to 3 and coffee to 4, next year's prices in Example 2: the panel shows 235 and 320, the second column of $QP$.

## Worked examples

### Example 1 (easy): the revenue of two shops in one step
Shops A and B sell bread, milk and coffee. One day's sales are $Q = \begin{pmatrix} 40 & 25 & 10 \\ 30 & 50 & 20 \end{pmatrix}$ (rows: shop A, shop B; columns: bread, milk, coffee), and the prices are $\mathbf{p} = (2, 3, 5)$. Find the revenue vector $Q\mathbf{p}$. What happens to it if every price rises by 10 %?

1. $Q$ is $2 \times 3$ and $\mathbf{p}$ is $3 \times 1$, so $Q\mathbf{p}$ is defined and is $2 \times 1$
   *Why:* the 3 columns of $Q$ (goods) match the 3 prices; the result has one entry per shop.
2. Shop A: $(40, 25, 10)\cdot(2, 3, 5) = 80 + 75 + 50 = 205$
   *Why:* row A is shop A's bundle of sales, and the dot product with the prices is what the bundle earns (LA101).
3. Shop B: $30 \cdot 2 + 50 \cdot 3 + 20 \cdot 5 = 60 + 150 + 100 = 310$, so $Q\mathbf{p} = \begin{pmatrix} 205 \\ 310 \end{pmatrix}$
   *Why:* the same calculation with row B; the vector stacks the two revenues.
4. New prices $1.1\mathbf{p}$: $Q(1.1\mathbf{p}) = 1.1\,(Q\mathbf{p}) = \begin{pmatrix} 225.5 \\ 341 \end{pmatrix}$
   *Why:* a scalar can be taken out of a product, so a 10 % rise in every price raises every shop's revenue by 10 %; there is no need to redo the dot products.

```verify
Q = [40,25,10; 30,50,20]
p = [2; 3; 5]
sz = size(Q)
assert sz[1] == 2
assert sz[2] == 3
r = Q*p
assert 80 + 75 + 50 == 205
assert 60 + 150 + 100 == 310
assert r[1,1] == 205
assert r[2,1] == 310
s = Q*(1.1*p)
assert abs(s[1,1] - 225.5) < 0.000001
assert abs(s[2,1] - 341) < 0.000001
assert max(abs(s - 1.1*r)) < 0.000001
```

### Example 2 (medium): two price lists and the order of a product
For the same shops, the matrix $P = \begin{pmatrix} 2 & 3 \\ 3 & 3 \\ 5 & 4 \end{pmatrix}$ holds this year's prices (column 1) and next year's prices (column 2) of bread, milk and coffee (rows). Find $QP$ and explain $(QP)_{12}$. Is $PQ$ the same matrix?

1. $(2 \times 3)(3 \times 2)$, so $QP$ is $2 \times 2$
   *Why:* the inner sizes match (3 goods); the outer sizes give the size of the answer: shops by price lists.
2. Column 1 of $QP$ is $Q$ times column 1 of $P$: $(205, 310)$
   *Why:* column 1 of $P$ is this year's price vector, so this is the revenue vector of Example 1.
3. $(QP)_{12} = 40 \cdot 3 + 25 \cdot 3 + 10 \cdot 4 = 120 + 75 + 40 = 235$ and $(QP)_{22} = 30 \cdot 3 + 50 \cdot 3 + 20 \cdot 4 = 90 + 150 + 80 = 320$, so $QP = \begin{pmatrix} 205 & 235 \\ 310 & 320 \end{pmatrix}$
   *Why:* row 1 of $Q$ (shop A) times column 2 of $P$ (next year's prices): $(QP)_{12} = 235$ is shop A's revenue at next year's prices if it sells the same amounts.
4. $PQ$ is $(3 \times 2)(2 \times 3) = 3 \times 3$, for example $(PQ)_{11} = 2 \cdot 40 + 3 \cdot 30 = 170$, so $QP \ne PQ$
   *Why:* $PQ$ exists, but it is a different size and pairs this year's bread price with shop A's bread and next year's with shop B's: a number with no economic meaning.
5. $(QP)^{\mathsf T} = P^{\mathsf T}Q^{\mathsf T} = \begin{pmatrix} 205 & 310 \\ 235 & 320 \end{pmatrix}$
   *Why:* the transpose puts price lists in rows and shops in columns. The factors swap places so that the sizes fit: $(2 \times 3)(3 \times 2)$.

```verify
Q = [40,25,10; 30,50,20]
P = [2,3; 3,3; 5,4]
QP = Q*P
assert QP[1,1] == 205
assert QP[2,1] == 310
assert 120 + 75 + 40 == 235
assert 90 + 150 + 80 == 320
assert QP[1,2] == 235
assert QP[2,2] == 320
PQ = P*Q
sz = size(PQ)
assert sz[1] == 3
assert sz[2] == 3
assert PQ[1,1] == 170
assert 2*40 + 3*30 == 170
assert deepEqual(transpose(QP), transpose(P)*transpose(Q))
assert transpose(QP)[1,2] == 310
assert transpose(QP)[2,1] == 235
```

### Example 3 (hard): a labour market two years ahead
Each year 10 % of employed workers lose their job and 40 % of unemployed workers find one. With state 1 = employed and state 2 = unemployed, the transition matrix is $T = \begin{pmatrix} 0.9 & 0.1 \\ 0.4 & 0.6 \end{pmatrix}$ (row = state this year, column = state next year). What is the probability that a worker who is employed now is unemployed two years from now? Of 1000 workers, 900 are employed now; how many are employed after one year and after two years?

1. $(T^2)_{12} = t_{11}t_{12} + t_{12}t_{22} = 0.9 \cdot 0.1 + 0.1 \cdot 0.6 = 0.09 + 0.06 = 0.15$
   *Why:* there are two routes: keep the job in year 1 and lose it in year 2, or lose it in year 1 and stay unemployed. Multiply the chances along each route and add the routes; this is row 1 of $T$ times column 2 of $T$.
2. $T^2 = \begin{pmatrix} 0.85 & 0.15 \\ 0.60 & 0.40 \end{pmatrix}$
   *Why:* every entry follows the same row-times-column rule. Each row still adds up to 1, because after two years everyone is in one state or the other.
3. $\mathbf{x}_0 = (900, 100)$, $\mathbf{x}_1 = \mathbf{x}_0 T = (900 \cdot 0.9 + 100 \cdot 0.4,\ 900 \cdot 0.1 + 100 \cdot 0.6) = (850, 150)$
   *Why:* a $1 \times 2$ row vector times a $2 \times 2$ matrix is a $1 \times 2$ row vector. Employed next year = those who keep their job plus those who find one.
4. $\mathbf{x}_2 = \mathbf{x}_1 T = (850 \cdot 0.9 + 150 \cdot 0.4,\ 850 \cdot 0.1 + 150 \cdot 0.6) = (825, 175)$, and $\mathbf{x}_0 T^2 = (900 \cdot 0.85 + 100 \cdot 0.6,\ 900 \cdot 0.15 + 100 \cdot 0.4) = (825, 175)$ as well
   *Why:* $(\mathbf{x}_0 T)T = \mathbf{x}_0(TT)$ because matrix multiplication is associative, so $T^2$ moves two years in one step. Unemployment rises from 10 % to 17.5 % of the workforce.

```verify
T = [0.9,0.1; 0.4,0.6]
T2 = T*T
assert abs(0.9*0.1 + 0.1*0.6 - 0.15) < 0.000000001
assert abs(T2[1,2] - 0.15) < 0.000000001
assert abs(T2[1,1] - 0.85) < 0.000000001
assert abs(T2[2,1] - 0.60) < 0.000000001
assert abs(T2[2,2] - 0.40) < 0.000000001
assert abs(sum(T2[1,:]) - 1) < 0.000000001
assert abs(sum(T2[2,:]) - 1) < 0.000000001
x0 = [900, 100]
x1 = x0*T
assert abs(x1[1] - 850) < 0.000001
assert abs(x1[2] - 150) < 0.000001
x2 = x1*T
assert abs(x2[1] - 825) < 0.000001
assert abs(x2[2] - 175) < 0.000001
assert max(abs(x0*T2 - x2)) < 0.000001
assert abs(x2[2]/1000 - 0.175) < 0.000000001
```

## Common mistakes
- Computing entry $(i, j)$ from row $j$ and column $i$ (INDICES_SWAPPED).
- Multiplying in the wrong order, for example working out $PQ$ when the question asks for $QP$: in Example 2, $(PQ)_{12} = 200$ instead of 235 (ORDER_SWAPPED).
- Multiplying a row total by a column total instead of pairing entries one by one: $75 \times 10 = 750$ in Example 2 (TOTALS_MULTIPLIED).
- Multiplying a row by a row instead of a row by a column: $0.9 \cdot 0.4 + 0.1 \cdot 0.6 = 0.42$ in Example 3 (ROW_BY_ROW).
- Counting only one route through the middle period: $0.9 \times 0.1 = 0.09$ in Example 3 (ONE_PATH).
- Squaring an entry instead of multiplying the matrices: $(T^2)_{ij}$ is not $(t_{ij})^2$ (ENTRY_SQUARED).
- Giving the one-period chance $t_{ij}$ when the question asks about two periods (ONE_STEP).
- Reading a column of a table where its row is meant, such as one product's output across all plants instead of one plant's outputs (COLUMN_FOR_ROW).
- Adding matrices of different sizes, or multiplying when the inner sizes do not match: such sums and products do not exist.
- Writing $(AB)^{\mathsf T} = A^{\mathsf T}B^{\mathsf T}$: the order reverses, $(AB)^{\mathsf T} = B^{\mathsf T}A^{\mathsf T}$.
- Multiplying two matrices entry by entry: that is a different operation, not the matrix product.

## Practice
- `matrix-product-revenue-entry` (difficulty 1): one entry of $QP$, quantities ($2 \times 3$) times prices ($3 \times 2$), which is one shop's revenue at one price list; distractors INDICES_SWAPPED, ORDER_SWAPPED, TOTALS_MULTIPLIED.
- `transition-matrix-two-step` (difficulty 2): an entry of $T^2$ for a $2 \times 2$ transition matrix (jobs or brand switching), the chance of being in a state two periods later; distractors ROW_BY_ROW, ONE_PATH, ENTRY_SQUARED, ONE_STEP.
- `matrix-chain-plant-cost` (difficulty 3): a plant's total input cost, entry $i$ of $XR\mathbf{w}$ (output plan times inputs per unit times input prices); distractors COLUMN_FOR_ROW, TOTALS_MULTIPLIED.

## Real world
- Input–output tables: statistics offices publish tables showing how much each sector of the economy buys from every other sector. Treated as matrices, they show how a rise in demand for cars spreads to steel, energy and transport (the Leontief model, LA106).
- Labour-market flows: labour force surveys measure how many people move each quarter between employment, unemployment and inactivity. Arranged as a transition matrix, these rates project unemployment forward, as in Example 3 (Markov chains, SP01).
- Credit ratings: rating agencies publish rating transition matrices giving the chance that a bond rated A this year is rated BBB next year. Banks multiply such matrices together to estimate default risk over several years.
- Data sets: n observations of k variables form an $n \times k$ matrix $X$. Regression formulas are written with the symmetric matrix $X^{\mathsf T}X$ (EM01).

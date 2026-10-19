---
id: SP01
title: Markov chains
block: SP
coreYear: 4
prerequisites: [LA202, ST102]
estMinutes: 45
status: draft
economicUses:
  - "Labour-market flows: projecting unemployment from job-loss and job-finding rates"
  - Credit-rating migration and default risk over several years
  - Brand switching and long-run market shares
  - Booms and recessions in regime-switching models of the business cycle
  - Income mobility from one generation to the next
generators: [markov-long-run-share-two-state, markov-share-after-steps, markov-long-run-share-three-state]
widgets: [markov-labour-market]
mistakeCodes:
  ONE_STEP:
    label: Moved only one period
    explanation: The question asks about several periods ahead. Multiply the distribution by P once for every period, or use Pⁿ; one multiplication only gives next period's shares.
  WRONG_SIDE:
    label: Multiplied the matrix by the distribution as a column
    explanation: The rows of P are the states now, so the distribution is a row vector x on the left, xP. Working out Px pairs each row of P with the shares and has no meaning here, because the columns of P do not add up to 1.
  ENTRY_POWER:
    label: Raised the entries to the power n
    explanation: Pⁿ is the matrix product P × P × … × P, not the table of entries raised to the power n. The product adds up every route through the states in between; powering one entry keeps only the route that stays put.
  FLOWS_REVERSED:
    label: Balanced the flows the wrong way round
    explanation: In the long run the flow out of a state equals the flow into it, for example π₁·p = π₂·q, where p is the chance of leaving state 1 and q the chance of leaving state 2. Swapping p and q gives the other state's share. The state that is harder to leave has the bigger share.
  STAY_PROBABILITY:
    label: Gave the chance of staying for one period
    explanation: The diagonal entry pᵢᵢ is the chance that someone already in state i is still there next period. The long-run share πᵢ is a different number, found by solving πP = π with the shares adding up to 1.
  EQUAL_SHARES:
    label: Assumed every state gets the same share
    explanation: The long run does not split the population equally between the states. It depends on how easy each state is to enter and to leave; solve πP = π with the shares adding up to 1.
  RATIO_NOT_SHARE:
    label: Gave a ratio of the shares, not a share
    explanation: The flow balance π₁·p = π₂·q only gives the ratio π₁/π₂ = q/p. To get the share itself, use π₁ + π₂ = 1, which gives π₁ = q/(p + q).
  NOT_NORMALISED:
    label: Forgot to make the shares add up to 1
    explanation: The equations πP = π fix only the ratios of the shares; setting π₁ = 1 and stopping gives weights, not shares. Divide each weight by their total, or solve with the condition π₁ + π₂ + π₃ = 1.
resources:
  - { title: "Applied Finite Mathematics (Sekhon and Bloom), 10.3 Regular Markov Chains (LibreTexts)", url: "https://math.libretexts.org/Bookshelves/Applied_Mathematics/Applied_Finite_Mathematics_(Sekhon_and_Bloom)/10%3A_Markov_Chains/10.03%3A_Regular_Markov_Chains", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Probabilistic Systems Analysis and Applied Probability (MIT 6.041SC), Lecture 16: Markov Chains I (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/6-041sc-probabilistic-systems-analysis-and-applied-probability-fall-2013/pages/unit-iii/lecture-16/", kind: course, verifiedAt: 2026-10-18 }
  - { title: "Labour market flow statistics in the EU (Eurostat Statistics Explained)", url: "https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Labour_market_flow_statistics_in_the_EU", kind: data, verifiedAt: 2026-10-18 }
---

## Why economists need this
After a recession unemployment is high, and everyone wants to know how fast it will come down and where it will settle. Statistics offices measure the flows behind the headline figure: each quarter some employed people lose their jobs and some unemployed people find one. A Markov chain turns these two rates into a forecast for every future quarter and into the level unemployment is heading for. The same tool describes how bonds move between credit ratings (and into default), how customers switch between brands, and how an economy moves between booms and recessions. In LA102 (Example 3) a transition matrix moved a labour market two years ahead; this topic asks what happens after many periods.

## Intuition
Picture a large group of workers, customers or loans. Each period every member is in one of a few **states** (employed or unemployed; brand A, B or C; rating A, B or C), and between periods some of them move. The model makes one simplifying assumption: the chance of moving depends only on the state you are in **now**, not on how you got there. A worker who is unemployed this quarter has the same chance of finding a job whether she lost it last quarter or a year ago. This "no memory" rule is the **Markov property**.

With many members, chances become shares: if 4 % of employed workers lose their job each quarter, then 4 % of the employed move to unemployment. To move the whole population forward one period, add up for each state everyone who arrives there, from every state. That is a vector times a matrix, as in LA102, and doing it again and again gives the shares any number of periods ahead.

Over time something remarkable happens. Think of unemployment as water in a bath with the tap open (people losing jobs) and the drain open (people finding jobs). When the bath is fuller than usual, more water drains out than flows in, so the level falls; when it is emptier, it rises. The level settles where inflow equals outflow, and it settles there **whatever the starting level**. In a Markov chain this resting point is the **long-run** or **stationary distribution**, and finding it means solving a small linear system.

## Definition and formulas
**States and transition probabilities.** A Markov chain has states $1, 2, \dots, m$. If $X_t$ is the state in period $t$, the **transition probability** from state $i$ to state $j$ is the conditional probability (ST102)
$$p_{ij} = \Pr(X_{t+1} = j \mid X_t = i),$$
the same in every period, and it does not depend on the states before $t$ (the Markov property).

**Transition matrix.** The $m \times m$ matrix $P = (p_{ij})$ has the state now in its rows and the state next period in its columns (LA102 called it $T$). Every entry is between 0 and 1, and **every row adds up to 1**, because from state $i$ you must go somewhere. For two states it is
$$P = \begin{pmatrix} 1 - p & p \\ q & 1 - q \end{pmatrix},$$
where $p$ is the chance of leaving state 1 and $q$ the chance of leaving state 2.

**Distribution after $n$ steps.** Write the shares (or probabilities) of the states in period $t$ as a **row vector** $x_t$ whose entries add up to 1. Then
$$x_{t+1} = x_t P, \qquad x_n = x_0 P^n.$$
Entry $j$ of $x_t P$ is $\sum_i (x_t)_i\, p_{ij}$: everyone in state $i$ times the chance of moving from $i$ to $j$, added over all $i$.

**$n$-step transition probabilities.** The chance of being in state $j$ after $n$ periods, starting from state $i$, is the entry $(P^n)_{ij}$. It adds up every route through the states in between, and $P^{m+n} = P^m P^n$.

**Stationary (long-run) distribution.** A row vector $\pi$ with
$$\pi P = \pi, \qquad \pi_1 + \pi_2 + \dots + \pi_m = 1$$
does not change from one period to the next. The equations $\pi P = \pi$ form a linear system (LA103). Because every row of $P$ adds up to 1, one of them always follows from the others, so drop one and use $\sum_i \pi_i = 1$ instead. Each equation says that the flow into a state equals the flow out of it. For two states this gives $\pi_1 p = \pi_2 q$, so
$$\pi_1 = \frac{q}{p + q}, \qquad \pi_2 = \frac{p}{p + q}.$$
(In the language of LA202, $\pi$ is a left eigenvector of $P$ for the eigenvalue 1.)

**Regular chains and convergence.** A chain is **regular** if some power $P^k$ has every entry positive: from any state you can be in any state after $k$ periods. A regular chain has exactly one stationary distribution $\pi$, all its entries are positive, and for **every** starting distribution
$$x_0 P^n \to \pi \quad \text{as } n \to \infty,$$
so every row of $P^n$ approaches $\pi$. For two states the gap to the long run shrinks by the same factor every period:
$$(x_n)_2 - \pi_2 = (1 - p - q)^n \big((x_0)_2 - \pi_2\big).$$
Not every chain converges: with $P = \begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}$ everyone swaps states every period, so the shares flip back and forth for ever.

**Expected return time.** In a regular chain, someone in state $i$ now is next in state $i$ after $1/\pi_i$ periods on average (staying put counts as returning after 1 period). A state with a long-run share of 0.25 is revisited every 4 periods on average: the rarer the state, the longer the wait.

**Absorbing states.** A state with $p_{ii} = 1$ can never be left. Default in a credit-rating matrix is the classic example: once a borrower defaults it stays in default. If an absorbing state can be reached from every state, in the long run everyone ends up there, so the interesting questions become how soon and by which route; those need more tools than this topic.

## Interactive
::widget{id="markov-labour-market"}

This is the labour market of Examples 1 and 2: each quarter a share $s$ of the employed lose their job and a share $f$ of the unemployed find one. The solid line starts at 20 % unemployment and the dashed line at 0 %. Start with $s = 0.04$, $f = 0.36$ and $n = 2$: the panel shows 13.6 % unemployed, the answer of Example 1, a long-run share of 10 % and a gap of 3.6 points. Move $n$ to 10: the gap has shrunk to 0.06 points, because it is multiplied by $1 - s - f = 0.6$ every quarter. Both lines end on the green long-run line, so the starting point does not matter in the long run. Now raise $f$: the green line drops and the lines bend in faster. Raise $s$ and the long-run share $s/(s + f)$ goes up.

## Worked examples

### Example 1 (easy): unemployment two quarters ahead
Each quarter 4 % of employed workers lose their job and 36 % of unemployed workers find one. After a recession 80 % of the workforce is employed and 20 % unemployed. With state 1 = employed and state 2 = unemployed, find the unemployment rate after one and after two quarters, and the chance that a worker who is unemployed now is unemployed two quarters from now.

1. $P = \begin{pmatrix} 0.96 & 0.04 \\ 0.36 & 0.64 \end{pmatrix}$, $x_0 = (0.8,\ 0.2)$
   *Why:* row 1 is where the employed go (keep the job 0.96, lose it 0.04) and row 2 where the unemployed go; each row adds up to 1.
2. $x_1 = x_0 P = (0.8 \cdot 0.96 + 0.2 \cdot 0.36,\ 0.8 \cdot 0.04 + 0.2 \cdot 0.64) = (0.768 + 0.072,\ 0.032 + 0.128) = (0.84,\ 0.16)$
   *Why:* the unemployed next quarter are the employed who lose their job plus the unemployed who do not find one; that is $x_0$ times column 2 of $P$.
3. $x_2 = x_1 P = (0.84 \cdot 0.96 + 0.16 \cdot 0.36,\ 0.84 \cdot 0.04 + 0.16 \cdot 0.64) = (0.8064 + 0.0576,\ 0.0336 + 0.1024) = (0.864,\ 0.136)$
   *Why:* the same step again, starting from the new shares. Unemployment falls from 20 % to 16 % and then to 13.6 %.
4. $P^2 = \begin{pmatrix} 0.936 & 0.064 \\ 0.576 & 0.424 \end{pmatrix}$, so $(P^2)_{22} = 0.424$, and $x_0 P^2 = (0.864,\ 0.136)$ as before
   *Why:* $(P^2)_{22} = 0.36 \cdot 0.04 + 0.64 \cdot 0.64$ adds the two routes from unemployed to unemployed: find a job and lose it again, or stay unemployed twice. A worker unemployed now has a 42.4 % chance of being unemployed in two quarters.

```verify
P = [0.96, 0.04; 0.36, 0.64]
x0 = [0.8, 0.2]
x1 = x0*P
assert abs(0.8*0.96 - 0.768) < 1e-12
assert abs(0.2*0.36 - 0.072) < 1e-12
assert abs(0.8*0.04 - 0.032) < 1e-12
assert abs(0.2*0.64 - 0.128) < 1e-12
assert abs(x1[1] - 0.84) < 1e-12
assert abs(x1[2] - 0.16) < 1e-12
x2 = x1*P
assert abs(0.84*0.96 - 0.8064) < 1e-12
assert abs(0.16*0.36 - 0.0576) < 1e-12
assert abs(0.84*0.04 - 0.0336) < 1e-12
assert abs(0.16*0.64 - 0.1024) < 1e-12
assert abs(x2[1] - 0.864) < 1e-12
assert abs(x2[2] - 0.136) < 1e-12
P2 = P*P
assert abs(P2[1,1] - 0.936) < 1e-12
assert abs(P2[1,2] - 0.064) < 1e-12
assert abs(P2[2,1] - 0.576) < 1e-12
assert abs(P2[2,2] - 0.424) < 1e-12
assert abs(0.36*0.04 + 0.64*0.64 - 0.424) < 1e-12
assert max(abs(x0*P2 - x2)) < 1e-12
# wrong answers quoted in Common mistakes
assert abs(P2[2,1]*0.8 + P2[2,2]*0.2 - 0.5456) < 1e-12
assert abs(0.8*0.04^2 + 0.2*0.64^2 - 0.0832) < 1e-12
```

### Example 2 (medium): where unemployment settles, and how fast
For the labour market of Example 1, find the long-run unemployment rate. How far from it is unemployment after 10 quarters, starting from 20 % and starting from 0 %? On average, how many quarters pass between one quarter of unemployment and the next?

1. Column 1 of $\pi P = \pi$: $0.96\,\pi_1 + 0.36\,\pi_2 = \pi_1$, so $0.04\,\pi_1 = 0.36\,\pi_2$
   *Why:* in the long run the share of employed stops changing, so the jobs lost each quarter ($0.04\,\pi_1$) must equal the jobs found ($0.36\,\pi_2$).
2. With $\pi_1 + \pi_2 = 1$: $\pi_2 = \dfrac{0.04}{0.04 + 0.36} = 0.1$ and $\pi_1 = 0.9$
   *Why:* substitute $\pi_1 = 1 - \pi_2$ to get $0.04(1 - \pi_2) = 0.36\,\pi_2$. Column 2 gives nothing new: $0.04 \cdot 0.9 + 0.64 \cdot 0.1 = 0.1$. The long-run unemployment rate is 10 %, which is $s/(s + f)$.
3. $u_{n+1} = 0.04(1 - u_n) + 0.64\,u_n = 0.04 + 0.6\,u_n$, so $u_{n+1} - 0.1 = 0.6\,(u_n - 0.1)$
   *Why:* $u_n$ is the unemployment rate after $n$ quarters; the unemployed next quarter are the employed who lose their job plus the unemployed who stay unemployed. Subtracting the long-run equation $0.1 = 0.04 + 0.6 \cdot 0.1$ leaves only the gaps. The gap to 10 % is multiplied by $1 - 0.04 - 0.36 = 0.6$ every quarter: 0.1, 0.06, 0.036, which gives the 13.6 % of Example 1.
4. After 10 quarters the gap is $\pm 0.1 \cdot 0.6^{10} \approx \pm 0.0006$: unemployment is about $0.1006$ starting from 20 % and $0.0994$ starting from 0 %
   *Why:* $0.6^{10} \approx 0.006$, so after two and a half years both starting points give almost exactly 10 %. The start is forgotten.
5. Expected return time to unemployment: $1/\pi_2 = 1/0.1 = 10$ quarters. Check: $0.64 \cdot 1 + 0.36 \cdot (1 + 25) = 10$
   *Why:* an unemployed worker is unemployed again next quarter with chance 0.64. Otherwise she finds a job, which lasts on average $1/0.04 = 25$ quarters before it is lost. Both routes together average 10 quarters, as the formula $1/\pi_2$ says.

```verify
s = 0.04; f = 0.36
P = [1 - s, s; f, 1 - f]
u = s/(s + f)
assert abs(u - 0.1) < 1e-12
x = [1 - u, u]
assert max(abs(x*P - x)) < 1e-12
assert abs(0.04*0.9 + 0.64*0.1 - 0.1) < 1e-12
assert abs(0.96*0.9 + 0.36*0.1 - 0.9) < 1e-12
assert abs(1 - s - f - 0.6) < 1e-12
assert abs(0.04 + 0.6*0.1 - 0.1) < 1e-12
assert abs(0.1*0.6 - 0.06) < 1e-12
assert abs(0.1*0.6^2 - 0.036) < 1e-12
assert abs(0.1 + 0.036 - 0.136) < 1e-12
gap10 = 0.1*0.6^10
assert abs(gap10 - 0.0006) < 0.00001
assert abs(0.6^10 - 0.006) < 0.0001
a = [0.8, 0.2]*P^10
b = [1, 0]*P^10
assert abs(a[2] - (u + gap10)) < 1e-12
assert abs(b[2] - (u - gap10)) < 1e-12
assert abs(a[2] - 0.1006) < 0.00005
assert abs(b[2] - 0.0994) < 0.00005
assert abs(1/u - 10) < 1e-9
assert abs(1/s - 25) < 1e-9
assert abs(0.64*1 + 0.36*(1 + 25) - 10) < 1e-12
# wrong answers quoted in Common mistakes
assert abs(s/f - 0.1111) < 0.00005
```

### Example 3 (hard): the long-run mix of loan grades
A bank grades its many loans A, B or C each year, and a grade moves by at most one step a year:
$$P = \begin{pmatrix} 0.90 & 0.10 & 0 \\ 0.05 & 0.85 & 0.10 \\ 0 & 0.20 & 0.80 \end{pmatrix}$$
(rows: grade this year A, B, C; columns: grade next year). Show that the chain is regular, find the long-run share of each grade, and say how often, on average, a loan is graded C.

1. $(P^2)_{13} = 0.90 \cdot 0 + 0.10 \cdot 0.10 + 0 \cdot 0.80 = 0.01 > 0$ and $(P^2)_{31} = 0 \cdot 0.90 + 0.20 \cdot 0.05 + 0.80 \cdot 0 = 0.01 > 0$; the other entries of $P^2$ are positive as well
   *Why:* $P$ itself has zeros (no jump from A to C in one year), but within two years every grade can reach every grade through B. So the chain is regular: there is one long-run distribution and the bank reaches it from any starting mix.
2. Columns 1 and 3 of $\pi P = \pi$: $0.10\,\pi_A = 0.05\,\pi_B$ and $0.10\,\pi_B = 0.20\,\pi_C$
   *Why:* column 1 reads $0.90\,\pi_A + 0.05\,\pi_B = \pi_A$: the loans leaving A (downgraded, $0.10\,\pi_A$) must be replaced by loans arriving from B ($0.05\,\pi_B$). Column 3 does the same for C.
3. $\pi_B = 2\,\pi_A$ and $\pi_C = 0.5\,\pi_B = \pi_A$
   *Why:* solve each balance for the next share, so that everything is written in terms of $\pi_A$, as in back substitution (LA103).
4. $\pi_A + 2\pi_A + \pi_A = 1$, so $\pi_A = 0.25$ and $\pi = (0.25,\ 0.5,\ 0.25)$
   *Why:* the balances only fix the ratios $1 : 2 : 1$; the shares must add up to 1. Check with the unused column 2: $0.10 \cdot 0.25 + 0.85 \cdot 0.5 + 0.20 \cdot 0.25 = 0.025 + 0.425 + 0.05 = 0.5$.
5. In the long run 25 % of the loans are graded C, and a loan returns to grade C on average every $1/0.25 = 4$ years
   *Why:* the expected return time is $1/\pi_C$. A real rating matrix also has default as an absorbing state; this one ignores defaults, as if every defaulted loan were replaced by a new one.

```verify
P = [0.90, 0.10, 0; 0.05, 0.85, 0.10; 0, 0.20, 0.80]
assert abs(sum(P[1,:]) - 1) < 1e-12
assert abs(sum(P[2,:]) - 1) < 1e-12
assert abs(sum(P[3,:]) - 1) < 1e-12
P2 = P*P
assert abs(P2[1,3] - 0.01) < 1e-12
assert abs(P2[3,1] - 0.01) < 1e-12
assert abs(0.10*0.10 - 0.01) < 1e-12
assert abs(0.20*0.05 - 0.01) < 1e-12
assert min(P2) > 0
x = [0.25, 0.5, 0.25]
assert abs(0.10*x[1] - 0.05*x[2]) < 1e-12
assert abs(0.10*x[2] - 0.20*x[3]) < 1e-12
assert abs(sum(x) - 1) < 1e-12
assert max(abs(x*P - x)) < 1e-12
assert abs(0.10*0.25 + 0.85*0.5 + 0.20*0.25 - 0.5) < 1e-12
assert abs(0.10*0.25 - 0.025) < 1e-12
assert abs(0.85*0.5 - 0.425) < 1e-12
assert abs(0.20*0.25 - 0.05) < 1e-12
assert abs(1/x[3] - 4) < 1e-12
# any start ends up at x: everyone graded A, or everyone graded C
y = [1, 0, 0]*P^200
z = [0, 0, 1]*P^200
assert max(abs(y - x)) < 1e-9
assert max(abs(z - x)) < 1e-9
# wrong answers quoted in Common mistakes: reversed balances give weights 1 : 0.5 : 1
assert abs(1/(1 + 0.5 + 1) - 0.4) < 1e-12
```

## Common mistakes
- Moving only one period when the question asks about two or more: 16 % instead of 13.6 % in Example 1 (ONE_STEP).
- Multiplying $P$ by the distribution written as a column, $P\,x_0^{\mathsf T}$, instead of $x_0 P$: in Example 1 doing this for two quarters gives 0.5456 instead of 0.136 (WRONG_SIDE).
- Raising the entries to the power $n$ instead of multiplying the matrices: $0.8 \cdot 0.04^2 + 0.2 \cdot 0.64^2 = 0.0832$ in Example 1 (ENTRY_POWER).
- Balancing the flows the wrong way round, $\pi_1 q = \pi_2 p$: a long-run unemployment rate of 0.9 instead of 0.1 in Example 2, or a share of 0.4 instead of 0.25 for grade C in Example 3 (FLOWS_REVERSED).
- Giving the chance of staying put for one period, such as $p_{22} = 0.64$ in Example 2, as the long-run share (STAY_PROBABILITY).
- Assuming that in the long run the states share the population equally, 0.5 or 1/3 (EQUAL_SHARES).
- Stopping at the ratio $\pi_2/\pi_1 = 0.04/0.36 = 0.1111$ in Example 2 instead of finding the share (RATIO_NOT_SHARE).
- Setting $\pi_A = 1$ to start the calculation and never dividing by the total: "$\pi_C = 1$" in Example 3 (NOT_NORMALISED).
- Writing the matrix with "from" in the columns, so that the columns add up to 1. Check which way round the question writes it; in this topic rows are "from".
- Solving only $\pi P = \pi$ without $\sum_i \pi_i = 1$: the system always has the useless solution $\pi = 0$ and infinitely many others.
- Expecting every chain to settle down. A chain that swaps states every period, or one with an absorbing state, behaves differently; the convergence result needs a regular chain.
- Reading the long run as "each worker ends up in one state". The shares settle, but individuals keep moving: 10 % unemployment means a changing group of people who are unemployed at any time.

## Practice
- `markov-long-run-share-two-state` (difficulty 1): the long-run share of one state of a two-state chain (jobs, brands, booms and recessions), $q/(p + q)$ or $p/(p + q)$; distractors FLOWS_REVERSED, STAY_PROBABILITY, EQUAL_SHARES, RATIO_NOT_SHARE.
- `markov-share-after-steps` (difficulty 2): the share in one state two or three periods ahead from a starting distribution, for a $2 \times 2$ or $3 \times 3$ transition matrix; distractors ONE_STEP, WRONG_SIDE, ENTRY_POWER.
- `markov-long-run-share-three-state` (difficulty 3): a long-run share in a three-state chain that moves at most one step per period (loan grades, income classes, firm sizes), by solving $\pi P = \pi$ with $\sum_i \pi_i = 1$; distractors FLOWS_REVERSED, NOT_NORMALISED, EQUAL_SHARES, STAY_PROBABILITY.

## Real world
- Labour-market flows: statistics offices such as Eurostat publish, every quarter, the shares of people who move between employment, unemployment and inactivity. Economists put these into a transition matrix to compute the "steady-state" unemployment rate $s/(s + f)$ and to see whether a change in unemployment comes from more job losses or from fewer job findings.
- Credit risk: rating agencies publish yearly rating migration matrices, with default as an absorbing state. Banks and regulators multiply such a matrix by itself to estimate the chance that a bond rated BBB today defaults within five or ten years.
- Business cycles: regime-switching models in macroeconomics treat the economy as moving between expansion and recession with fixed probabilities. The chance $q$ of leaving a recession gives its expected length, $1/q$ quarters, and the long-run share of time spent in recessions is $p/(p + q)$.
- Marketing and mobility: firms model brand switching to forecast long-run market shares after a campaign changes switching rates, and economists use matrices of movement between income classes across generations to measure how mobile a society is.

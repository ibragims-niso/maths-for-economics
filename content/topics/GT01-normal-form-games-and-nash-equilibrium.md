---
id: GT01
title: Normal-form games and Nash equilibrium
block: GT
coreYear: 3
prerequisites: [F09]
estMinutes: 50
status: draft
economicUses:
  - Price wars and cartels among a few large firms
  - Output and prices in an oligopoly (Cournot competition)
  - Advertising and market-entry decisions
  - Choosing a technology standard that others also adopt
  - Predicting how a merger changes market prices
generators: [bimatrix-nash-payoff, pure-nash-count, cournot-duopoly-equilibrium]
widgets: [cournot-best-responses]
mistakeCodes:
  WRONG_PLAYER:
    label: Read the other player's payoff
    explanation: Each cell lists the row player's payoff first and the column player's second. Find the equilibrium cell, then read the number that belongs to the player in the question.
  PARETO_NOT_NASH:
    label: Picked the best cell for the two together
    explanation: The cell with the highest combined payoff is where both players would like to end up, but there at least one of them gains by switching alone, so it is not an equilibrium. Check best replies, not joint profit.
  MAXIMIN_CELL:
    label: Picked the cautious (max-min) choices
    explanation: Choosing the strategy whose worst payoff is highest protects a player against the worst case, but it ignores what the other player will actually do. In a Nash equilibrium each choice is a best reply to the other's choice.
  ONE_PLAYER_ONLY:
    label: Checked only one player's incentive
    explanation: A Nash equilibrium needs both players to be best-responding at once. Mark the row player's best payoff in each column and the column player's best payoff in each row; only cells with both marks are equilibria.
  ANY_UNDERLINE:
    label: Counted cells with only one mark
    explanation: A cell where only one player is best-responding is not an equilibrium, because the other player wants to switch. Count only the cells where both payoffs are marked.
  ALWAYS_ONE:
    label: Assumed there is always exactly one equilibrium
    explanation: A game can have one, several or no pure-strategy equilibria. Coordination and entry games have two, and inspection games have none. Check every cell.
  DOMINANT_ONLY:
    label: Looked only for dominant strategies
    explanation: Dominant strategies are a special case. A game where no player has a dominant strategy can still have equilibria, so check every cell for mutual best replies.
  MONOPOLY_SOLUTION:
    label: Used the monopoly answer
    explanation: (a − c)/(2b) is the output of a single firm with the whole market, and (a + c)/2 its price. In Cournot competition each firm takes the rival's output into account, so each produces (a − c)/(3b).
  COMPETITIVE_SOLUTION:
    label: Used the perfect-competition answer
    explanation: Under perfect competition the price falls to marginal cost and total output is (a − c)/b. Two firms with market power hold output below that, so the Cournot price stays above cost.
  CARTEL_SHARE:
    label: Split the monopoly output
    explanation: Half the monopoly output, (a − c)/(4b) each, is what a cartel would agree on. It is not an equilibrium, because each firm's best reply to the other's cartel output is to produce more.
  FIRM_NOT_MARKET:
    label: Used one firm's output where the market total was needed
    explanation: The price depends on the output of both firms, Q = q₁ + q₂. Total output is twice one firm's output, and the price is a − b·Q.
resources:
  - { title: "Principles of Economics 3e, 10.2 Oligopoly (OpenStax)", url: "https://openstax.org/books/principles-economics-3e/pages/10-2-oligopoly", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Principles of Microeconomics (14.01SC), Oligopoly I: game theory, Nash equilibrium and the Cournot model (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/14-01sc-principles-of-microeconomics-fall-2011/pages/unit-5-monopoly-and-oligopoly/oligopoly-i/", kind: course, verifiedAt: 2026-10-18 }
  - { title: "Principles of Microeconomics (14.01SC), Oligopoly II: Cournot competition and cartels (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/14-01sc-principles-of-microeconomics-fall-2011/pages/unit-5-monopoly-and-oligopoly/oligopoly-ii/", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
In a market with many small firms, no firm has to think about what any single rival does. With two or three large firms (mobile operators, airlines on one route, cement producers in one region) it is different: my profit depends on your price, and your profit depends on mine. Game theory is the mathematics of such **strategic interdependence**. It explains why rival firms end up in price wars that hurt both of them, why cartels tend to break down, how much a duopoly produces, and why a whole industry can get stuck on one technology standard. The central tool is the **Nash equilibrium**, a pair of choices from which nobody wants to move.

## Intuition
Two cafés on the same street each decide tonight what to charge tomorrow. Neither sees the other's choice in advance, so each must think: "if they charge high, what is best for me? And if they charge low?" A choice that is best against a given choice of the rival is a **best response**.

Now imagine the morning after. Each café sees what the other did. If either one regrets its own choice, given what the other actually did, the situation is not stable: next time it will change. If *neither* has regrets, each choice is a best response to the other, and nobody has a reason to move on their own. That is a Nash equilibrium. It is a prediction of where self-interested players end up, not a judgement that the outcome is good. In fact the most famous games are those where the equilibrium is bad for everyone: both cafés would earn more charging high, yet each is tempted to undercut.

## Definition and formulas
**A game in normal form** has three parts:
- **players**, here two: player 1 (the row player) and player 2 (the column player);
- a **strategy set** for each player, $S_1$ and $S_2$ (for example $S_1 = \{\text{Low}, \text{High}\}$); a **strategy profile** is a pair $(s_1, s_2)$, an element of the set of all pairs $S_1 \times S_2$;
- **payoff functions** $u_1(s_1, s_2)$ and $u_2(s_1, s_2)$: what each player gets (profit, utility) for every profile.

With finitely many strategies the game is a **payoff matrix** (a bimatrix): rows are player 1's strategies, columns are player 2's, and each cell lists $(u_1, u_2)$, the row player's payoff first. Players choose at the same time, or at least without seeing the other's choice.

**Dominance.** Strategy $s_1$ **strictly dominates** $t_1$ if it pays more against every strategy of the opponent: $u_1(s_1, s_2) > u_1(t_1, s_2)$ for all $s_2 \in S_2$. Then $t_1$ is **strictly dominated**, and a rational player never uses it. A strategy that strictly dominates every other strategy is **dominant**: it is the best choice whatever the opponent does. (With $\ge$ everywhere and $>$ at least once the dominance is **weak**.)

**Iterated elimination of strictly dominated strategies (IESDS).** Delete a strictly dominated strategy of either player, then look again at the smaller game: a strategy that was not dominated before may be dominated now. Repeat until nothing more can be deleted. If one cell is left, that is the prediction. For strict dominance the order of deletion does not matter, and no Nash equilibrium is ever deleted. (Deleting *weakly* dominated strategies can delete equilibria, so use strict dominance.)

**Best response.** Player 1's best responses to $s_2$ are the strategies that give the highest payoff against it:
$$BR_1(s_2) = \{\, s_1 \in S_1 : u_1(s_1, s_2) \ge u_1(t, s_2) \text{ for all } t \in S_1 \,\}$$
and $BR_2(s_1)$ likewise. In a matrix: in each column, mark player 1's largest payoff; in each row, mark player 2's largest payoff (the **underline method**).

**Nash equilibrium.** A profile $(s_1^*, s_2^*)$ is a (pure-strategy) Nash equilibrium if no player gains by deviating alone:
$$u_1(s_1^*, s_2^*) \ge u_1(s_1, s_2^*) \text{ for all } s_1 \in S_1, \qquad u_2(s_1^*, s_2^*) \ge u_2(s_1^*, s_2) \text{ for all } s_2 \in S_2.$$
Equivalently $s_1^* \in BR_1(s_2^*)$ and $s_2^* \in BR_2(s_1^*)$: each choice is a best response to the other. In a matrix, the equilibria are exactly the cells where **both** payoffs are marked. If both players have dominant strategies, playing them is the unique equilibrium.

**Pareto efficiency.** An outcome is **Pareto efficient** if no other outcome makes one player better off without making the other worse off. A Nash equilibrium need not be Pareto efficient: in the prisoner's dilemma both players prefer another cell, yet that cell is not an equilibrium.

**Classic games** (payoffs (row, column)):
- *Prisoner's dilemma*: each player has a dominant strategy, and playing it leads to an outcome worse for both. Price wars, advertising races (Example 1) and cheating on a cartel (Example 2) have this shape.
- *Coordination on a standard*: two firms choosing a technology standard X or Y,
$$\begin{array}{c|cc} & X & Y \\ \hline X & (4,\ 4) & (0,\ 0) \\ Y & (0,\ 0) & (3,\ 3) \end{array}$$
have two equilibria, (X, X) and (Y, Y). Both firms prefer (X, X), but an industry can still get stuck on Y.
- *Entry (chicken)*: a market with room for one firm,
$$\begin{array}{c|cc} & \text{Enter} & \text{Stay out} \\ \hline \text{Enter} & (-2,\ -2) & (5,\ 0) \\ \text{Stay out} & (0,\ 5) & (0,\ 0) \end{array}$$
has two equilibria, one firm in and the other out; the game alone does not say which firm enters.
- *Inspection*: a firm chooses Comply or Cheat, a regulator Inspect or Not,
$$\begin{array}{c|cc} & \text{Inspect} & \text{Not} \\ \hline \text{Comply} & (0,\ -1) & (0,\ 0) \\ \text{Cheat} & (-4,\ 2) & (3,\ -2) \end{array}$$
has **no** pure-strategy equilibrium: in every cell one side wants to switch. Such games have an equilibrium in which the players randomise; Nash proved that every game with finitely many strategies has at least one equilibrium in this wider sense (mixed strategies, GT02).

**Cournot duopoly: a game with continuous strategies.** Two firms make the same good and choose outputs $q_1, q_2 \ge 0$ at the same time. Price is set by inverse demand $P = a - b(q_1 + q_2)$, and firm $i$ has constant marginal cost $c_i$. Firm 1's payoff is its profit
$$\pi_1(q_1, q_2) = \big(a - b(q_1 + q_2)\big)q_1 - c_1 q_1.$$
Its best response comes from the first-order condition $\partial \pi_1 / \partial q_1 = a - c_1 - 2bq_1 - bq_2 = 0$ (C109), and the second derivative $-2b < 0$ confirms a maximum:
$$q_1 = BR_1(q_2) = \frac{a - c_1 - bq_2}{2b}, \qquad q_2 = BR_2(q_1) = \frac{a - c_2 - bq_1}{2b}.$$
The more the rival produces, the less a firm wants to produce. The Nash equilibrium is where the two best-response lines cross:
$$q_1^* = \frac{a - 2c_1 + c_2}{3b}, \qquad q_2^* = \frac{a - 2c_2 + c_1}{3b}, \qquad P^* = \frac{a + c_1 + c_2}{3}.$$
With equal costs $c$: $q^* = \dfrac{a - c}{3b}$ for each firm, total $Q^* = \dfrac{2(a - c)}{3b}$ and $P^* = \dfrac{a + 2c}{3}$. Compare a monopoly, $Q = \dfrac{a - c}{2b}$, and perfect competition, $Q = \dfrac{a - c}{b}$ with $P = c$: the duopoly produces more than a monopoly and less than a competitive market, so its price lies between the two.

## Interactive
::widget{id="cournot-best-responses"}

The graph shows the Cournot duopoly of Example 3, with demand $P = a - 2(q_1 + q_2)$ and firm 1's marginal cost fixed at 10. Firm 1's output $q_1$ runs along the bottom and firm 2's output $q_2$ up the side. The lilac line BR₁ is firm 1's best response to each $q_2$; the green line BR₂ is firm 2's best response to each $q_1$. The dot where they cross is the Nash equilibrium, and the panel shows $q_1^*$, $q_2^*$ and the market price. Move **Firm 2's marginal cost** and watch the green line shift: a costlier firm 2 produces less, and firm 1 responds by producing more. Move **Demand intercept a** to make the market bigger or smaller and watch both outputs change together. Check: at $c_2 = 10$ and $a = 100$ the panel shows 15, 15 and a price of 40, as in Example 3; at $c_2 = 22$ it shows 17, 11 and 44, which is $(100 + 10 + 22)/3$.

## Worked examples

### Example 1 (easy): an advertising race
Two firms, A and B, each decide whether to run a heavy advertising campaign. Advertising costs money and mainly steals customers from the rival. Weekly profits in thousands, (A, B):
$$\begin{array}{c|cc} \text{A}\backslash\text{B} & \text{None} & \text{Heavy} \\ \hline \text{None} & (10,\ 10) & (4,\ 12) \\ \text{Heavy} & (12,\ 4) & (6,\ 6) \end{array}$$
Find the Nash equilibrium and A's profit in it, and say whether it is Pareto efficient.

1. If B plays None, A compares $12 > 10$; if B plays Heavy, A compares $6 > 4$.
   *Why:* hold B's choice fixed and compare A's payoffs (first numbers) down each column.
2. Heavy strictly dominates None for A; by the same comparisons ($12 > 10$, $6 > 4$) Heavy is dominant for B too.
   *Why:* Heavy pays A more whatever B does, so A plays Heavy without needing to guess B's choice; the game is symmetric, so the same holds for B.
3. The equilibrium is (Heavy, Heavy) with profits $(6, 6)$. A's profit is 6 thousand a week.
   *Why:* when both play dominant strategies, neither gains by switching alone: moving to None would cut either firm's profit from 6 to 4.
4. (None, None) gives $(10, 10)$: both firms earn 4 more. The equilibrium is not Pareto efficient.
   *Why:* this is a prisoner's dilemma. Each firm would gain if both stopped advertising, but neither can trust the other to stop, because stopping alone lowers its profit.

```verify
A = [10, 4; 12, 6]
B = [10, 12; 4, 6]
assert A[2,1] > A[1,1] and A[2,2] > A[1,2]
assert B[1,2] > B[1,1] and B[2,2] > B[2,1]
assert A[2,2] == 6 and B[2,2] == 6
assert A[1,2] == 4 and B[2,1] == 4
assert A[1,1] - A[2,2] == 4 and B[1,1] - B[2,2] == 4
```

### Example 2 (medium): three prices and an unstable cartel
Two petrol stations on the same road each choose a Low, Medium or High price. Weekly profits in thousands, (A, B):
$$\begin{array}{c|ccc} \text{A}\backslash\text{B} & \text{Low} & \text{Medium} & \text{High} \\ \hline \text{Low} & (2,\ 2) & (6,\ 3) & (10,\ 1) \\ \text{Medium} & (3,\ 6) & (7,\ 7) & (9,\ 5) \\ \text{High} & (1,\ 10) & (5,\ 9) & (8,\ 8) \end{array}$$
Solve the game by eliminating dominated strategies, check the answer with best responses, and compare it with (High, High).

1. For A, Medium beats High in every column: $3 > 1$, $7 > 5$, $9 > 8$. Delete High for A, and by symmetry delete High for B.
   *Why:* a strictly dominated strategy is never a best reply, so a rational station never charges High.
2. In what is left, Medium beats Low for A: $3 > 2$ and $7 > 6$. Delete Low for both.
   *Why:* in the full game Low was not dominated, because against a High rival it pays $10 > 9$. Once High is gone, that reason disappears: this is why the elimination is *iterated*.
3. Only (Medium, Medium) remains, with profits $(7, 7)$.
   *Why:* when IESDS leaves a single cell, that cell is the unique Nash equilibrium.
4. Best responses of A: to Low, Medium (3); to Medium, Medium (7); to High, Low (10). B's are the same by symmetry. The only cell with both marked is (Medium, Medium).
   *Why:* the underline method finds every pure equilibrium; it confirms the elimination and shows there is no other equilibrium.
5. (High, High) gives $(8, 8)$, more for both than $(7, 7)$, but against High each station's best reply is Low, which pays 10.
   *Why:* an agreement to keep prices high is a cartel. It is Pareto better for the two stations but not an equilibrium, because each gains by undercutting alone; this is why cartels are unstable without enforcement (GT04).

```verify
U = [2, 6, 10; 3, 7, 9; 1, 5, 8]
# B's payoff in cell (r, c) is U[c, r]: the game is symmetric
assert U[2,1] > U[3,1] and U[2,2] > U[3,2] and U[2,3] > U[3,3]
assert U[1,3] > U[2,3]
assert U[2,1] > U[1,1] and U[2,2] > U[1,2]
assert U[2,2] == 7
assert max(U[:,1]) == U[2,1] and max(U[:,2]) == U[2,2] and max(U[:,3]) == U[1,3]
assert U[1,3] == 10 and U[3,3] == 8
assert U[3,3] > U[2,2]
```

### Example 3 (hard): a Cournot duopoly and a cartel that breaks down
Two firms make the same product. Demand is $P = 100 - 2(q_1 + q_2)$ and each firm's cost is 10 per unit, with no fixed cost. Find the Cournot–Nash equilibrium (outputs, price, profits). Then show that both firms would earn more by sharing the monopoly output, but that this cartel is not an equilibrium.

1. $\pi_1 = (100 - 2q_1 - 2q_2)q_1 - 10q_1$
   *Why:* revenue is the price times firm 1's own output; the price falls when either firm produces more.
2. $\dfrac{\partial \pi_1}{\partial q_1} = 90 - 4q_1 - 2q_2 = 0 \;\Rightarrow\; q_1 = 22.5 - 0.5\,q_2$
   *Why:* firm 1 maximises its profit taking $q_2$ as given; the second derivative is $-4 < 0$. This is firm 1's best-response function.
3. By symmetry $q_2 = 22.5 - 0.5\,q_1$. Substituting, $q_1 = 22.5 - 0.5(22.5 - 0.5\,q_1) = 11.25 + 0.25\,q_1$, so $q_1^* = q_2^* = 15$.
   *Why:* in a Nash equilibrium each output is a best response to the other, so we solve the two best-response equations together; the formula $(a - c)/(3b) = 90/6 = 15$ agrees.
4. $Q^* = 30$, $P^* = 100 - 2 \cdot 30 = 40$, and each firm earns $(40 - 10) \cdot 15 = 450$.
   *Why:* price depends on total output; profit per unit is price minus unit cost.
5. A cartel acting as a monopoly maximises $(90 - 2Q)Q$: $Q = 22.5$, $P = 55$, joint profit $1{,}012.5$, so $506.25$ each with $11.25$ units each.
   *Why:* setting the derivative $90 - 4Q$ to zero gives the monopoly output $(a - c)/(2b)$; sharing it equally gives each firm more than 450.
6. If firm 2 keeps to $11.25$, firm 1's best reply is $22.5 - 0.5 \cdot 11.25 = 16.875$. Then $P = 100 - 2 \cdot 28.125 = 43.75$ and $\pi_1 = 33.75 \cdot 16.875 = 569.53 > 506.25$.
   *Why:* the cartel outputs are not best responses to each other, so each firm gains by cheating alone. This is the prisoner's dilemma again, with continuous strategies.

```verify
a = 100; b = 2; c = 10
q = (a - c)/(3*b)
assert q == 15
assert 22.5 - 0.5*q == q
Q = 2*q; P = a - b*Q
assert Q == 30 and P == 40
assert (P - c)*q == 450
Qm = (a - c)/(2*b)
Pm = a - b*Qm
assert Qm == 22.5 and Pm == 55
assert (Pm - c)*Qm == 1012.5
assert (Pm - c)*Qm/2 == 506.25 and Qm/2 == 11.25
dev = 22.5 - 0.5*11.25
assert dev == 16.875
Pd = a - b*(dev + 11.25)
assert dev + 11.25 == 28.125 and Pd == 43.75
assert abs((Pd - c)*dev - 569.53) < 0.01
assert (Pd - c)*dev > 506.25
```

## Common mistakes
- Reading the wrong number in the equilibrium cell: the row player's payoff comes first (WRONG_PLAYER).
- Choosing the cell that is best for both together, such as (High, High) in Example 2, as the equilibrium (PARETO_NOT_NASH).
- Assuming each player plays safe, choosing the strategy whose worst payoff is highest, instead of checking best replies (MAXIMIN_CELL).
- Checking only one player: a cell where your payoff is the highest is not an equilibrium if the other player wants to switch (ONE_PLAYER_ONLY).
- Counting cells where only one payoff is marked as equilibria (ANY_UNDERLINE).
- Assuming every game has exactly one pure equilibrium: the standards game has two and the inspection game none (ALWAYS_ONE).
- Concluding there is no equilibrium because nobody has a dominant strategy (DOMINANT_ONLY).
- In Cournot, giving the monopoly output $(a - c)/(2b)$ or the monopoly price (MONOPOLY_SOLUTION).
- In Cournot, giving the competitive output $(a - c)/b$ or setting the price equal to marginal cost (COMPETITIVE_SOLUTION).
- Giving the cartel share $(a - c)/(4b)$ as each firm's equilibrium output; in Example 3 that is 11.25, but the best reply to 11.25 is 16.875 (CARTEL_SHARE).
- Giving one firm's output when the total is asked, or putting only one firm's output into the demand curve when finding the price (FIRM_NOT_MARKET).
- Thinking a Nash equilibrium is the best outcome for the players: it only says that nobody gains by moving alone.
- Deleting weakly dominated strategies as if they were strictly dominated; this can remove an equilibrium.

## Practice
- `bimatrix-nash-payoff` (difficulty 1): one firm's profit at the unique pure Nash equilibrium of a 2×2 or 3×3 payoff table; distractors WRONG_PLAYER, PARETO_NOT_NASH, MAXIMIN_CELL, ONE_PLAYER_ONLY.
- `pure-nash-count` (difficulty 2): how many pure-strategy Nash equilibria (0, 1 or 2) a 2×2 game has; distractors ANY_UNDERLINE, ONE_PLAYER_ONLY, ALWAYS_ONE, DOMINANT_ONLY.
- `cournot-duopoly-equilibrium` (difficulty 3): each firm's output, the total output or the market price in a Cournot duopoly with $P = a - b(q_1 + q_2)$ and equal unit costs; distractors MONOPOLY_SOLUTION, COMPETITIVE_SOLUTION, CARTEL_SHARE, FIRM_NOT_MARKET.

## Real world
- Cartels: members of an output cartel such as OPEC face the temptation of Example 3; each gains by producing above its quota, and quotas are often exceeded.
- Competition policy: competition authorities use oligopoly models of this kind to predict how a merger, which reduces the number of rivals, would change prices.
- Technology standards: video formats, phone chargers and mobile networks are coordination games; once most firms and users adopt one standard, nobody gains by switching alone, even if another standard would be better.
- Auctions and regulation: governments have used game theory to design auctions of mobile-phone spectrum, and regulators plan random inspections using games like the inspection game. John Nash shared the 1994 Nobel prize in economics for the equilibrium idea.

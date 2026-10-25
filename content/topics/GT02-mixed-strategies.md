---
id: GT02
title: Mixed strategies
block: GT
coreYear: 3
prerequisites: [GT01, ST103]
estMinutes: 45
status: draft
economicUses:
  - How often a tax office should audit, and how much cheating to expect
  - Random inspections of factories, food outlets and public transport tickets
  - Unpredictable price promotions by rival retailers
  - Penalty kicks as a real-world test of game theory
searchTerms:
  - "Mixed strategy equilibrium"
generators: [audit-probability-indifference, mixed-equilibrium-probability, mixed-equilibrium-expected-payoff]
widgets: [audit-best-responses]
mistakeCodes:
  OWN_INDIFFERENCE:
    label: Used the player's own payoffs to find their probability
    explanation: In a mixed equilibrium each player mixes so that the OTHER player is indifferent, so a player's probability comes from the other player's payoffs. An equation built from your own payoffs gives the opponent's equilibrium probability instead, and in an expected payoff the same slip swaps the two players' probabilities.
  COMPLEMENT:
    label: Gave the probability of the other choice
    explanation: The equation gives the probability of the choice you called p, usually the first one. If the question asks about the other choice, the answer is 1 − p; check which choice your p belongs to before you answer.
  EQUAL_SPLIT:
    label: Assumed the players mix 50:50
    explanation: Mixing does not mean tossing a fair coin. The probabilities are whatever makes the other player indifferent, and they are 1/2 only in special, symmetric games such as matching pennies.
  GAIN_LEFT_OUT:
    label: Divided the gain by the fine alone
    explanation: The taxpayer is indifferent when (1 − p)·G = p·F. Collecting the p terms gives p(G + F) = G, so p = G/(G + F); the gain G appears in the denominator too.
  WRONG_PLAYER:
    label: Gave the other player's expected payoff
    explanation: Each cell lists the row player's payoff first and the column player's second. Use the payoffs of the player in the question, weighted by the other player's equilibrium probabilities.
  SIMPLE_AVERAGE:
    label: Averaged the four payoffs without weights
    explanation: A plain average treats every cell as equally likely. In equilibrium the cells have different probabilities, so weight each payoff by the probability of its cell (or use the indifference shortcut).
resources:
  - { title: "Game Theory (ECON 159), Lecture 9: Mixed strategies in theory and tennis (Open Yale Courses)", url: "https://oyc.yale.edu/economics/econ-159/lecture-9", kind: course, verifiedAt: 2026-10-18 }
  - { title: "Game Theory (ECON 159), Lecture 10: Mixed strategies in baseball, dating and paying your taxes (Open Yale Courses)", url: "https://oyc.yale.edu/economics/econ-159/lecture-10", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
Some games have no Nash equilibrium in the sense of GT01. A tax office that always audits makes everyone honest, and then its audits are a waste of money; a tax office that never audits invites everyone to cheat. A footballer who always shoots to the same side of the goal is easy to stop. In such games being **predictable is costly**, and the sensible thing is to randomise: audit some returns but not others, shoot left sometimes and right at other times. A **mixed strategy** is a plan that chooses among actions with fixed probabilities. With mixed strategies every game with finitely many choices has an equilibrium, and the equilibrium tells a regulator how often to inspect, tells economists how much cheating to expect, and explains why retailers run promotions at unpredictable times.

## Intuition
Think about a penalty kick. If the goalkeeper always dives left, the kicker shoots right; if the kicker always shoots right, the keeper dives right. There is no pair of fixed choices that both are happy with. So each player keeps the other guessing.

How often should the keeper dive left? Exactly often enough that **the kicker no longer cares** which side he shoots to. If the kicker scored more often on one side, he would shoot there every time, and then the keeper would want to change. Only when both sides give the kicker the same scoring chance is nobody tempted to change. The same goes for the kicker: he shoots left with the probability that leaves the **keeper** indifferent between diving left and right.

This is the **indifference principle**, and it hides a surprise. My probabilities are chosen to make *you* indifferent, so they are computed from *your* payoffs, not mine. In the auditing game, a bigger fine on cheats changes the taxpayer's payoffs, so it changes how often the *tax office* audits, not how often taxpayers cheat.

## Definition and formulas
**Mixed strategy.** A mixed strategy is a probability distribution over a player's pure strategies (the rows or columns of GT01). In a 2×2 game, player A (rows) plays the first row with probability $p$ and the second with $1 - p$; player B (columns) plays the first column with probability $q$ and the second with $1 - q$. A pure strategy is the special case $p = 0$ or $p = 1$. The two players randomise independently, so the probability of a cell is the product of the two probabilities (ST102).

**Expected payoff.** Write $a_{ij}$ and $b_{ij}$ for A's and B's payoffs in row $i$, column $j$. A's expected payoff is the probability-weighted average over the four cells (ST103):
$$u_A(p, q) = pq\,a_{11} + p(1-q)\,a_{12} + (1-p)q\,a_{21} + (1-p)(1-q)\,a_{22}.$$
Grouping by A's own rows,
$$u_A(p, q) = p\,\underbrace{\big[q a_{11} + (1-q) a_{12}\big]}_{U_1(q):\ \text{row 1 against B's mix}} + (1-p)\,\underbrace{\big[q a_{21} + (1-q) a_{22}\big]}_{U_2(q):\ \text{row 2 against B's mix}}.$$
So A's expected payoff is a weighted average of what its two pure strategies earn against B's mix.

**Best-response correspondence.** Because $u_A$ is linear in $p$, A's best reply to $q$ is
$$BR_A(q) = \begin{cases} p = 1 & \text{if } U_1(q) > U_2(q), \\ \text{any } p \in [0, 1] & \text{if } U_1(q) = U_2(q), \\ p = 0 & \text{if } U_1(q) < U_2(q). \end{cases}$$
It is called a correspondence, not a function, because at one value of $q$ it contains a whole interval. Drawn in the unit square with $p$ along the bottom and $q$ up the side, each player's best response is a **step**: two flat pieces joined by a vertical (or horizontal) jump at the opponent's critical probability. Equilibria are the points where the two steps cross.

**Mixed-strategy Nash equilibrium.** A pair $(p^*, q^*)$ is a Nash equilibrium if each mix is a best response to the other: $p^* \in BR_A(q^*)$ and $q^* \in BR_B(p^*)$. No player can raise their expected payoff by changing their mix alone.

**Indifference principle.** If a player gives positive probability to two pure strategies in equilibrium, those strategies earn the same expected payoff; otherwise the player would move all the weight to the better one. In a 2×2 game where both players mix:
- $q^*$ makes **A** indifferent: $q a_{11} + (1-q) a_{12} = q a_{21} + (1-q) a_{22}$, so
$$q^* = \frac{a_{22} - a_{12}}{a_{11} - a_{12} - a_{21} + a_{22}};$$
- $p^*$ makes **B** indifferent: $p b_{11} + (1-p) b_{21} = p b_{12} + (1-p) b_{22}$, so
$$p^* = \frac{b_{22} - b_{21}}{b_{11} - b_{21} - b_{12} + b_{22}}.$$
A's own payoffs $a_{ij}$ do not appear in $p^*$. Changing A's payoffs changes B's mix, not A's: this is the **paradox of mixed strategies**.

**Recipe for a 2×2 game.**
1. Look for pure equilibria with best replies (GT01). If every cell has a player who wants to switch, the best replies go round in a circle and both players must mix.
2. Find $p^*$ from B's payoffs and $q^*$ from A's payoffs, using the two indifference equations.
3. Check that both lie strictly between 0 and 1.
4. Each player's expected payoff is what either of their pure strategies earns against the other's mix, for example $u_A^* = q^* a_{11} + (1 - q^*) a_{12}$.

For the inspection game of GT01 (rows Comply, Cheat; columns Inspect, Not) the recipe gives: the regulator inspects with probability $3/7 \approx 0.43$, which leaves the firm indifferent ($-4 \cdot \tfrac37 + 3 \cdot \tfrac47 = 0$, the same as complying), and the firm cheats with probability $0.2$, which leaves the regulator indifferent (inspecting earns $-1 \cdot 0.8 + 2 \cdot 0.2 = -0.4$, not inspecting $-2 \cdot 0.2 = -0.4$). In **matching pennies**, where one player wins 1 from the other if the two coins match and loses 1 if they do not, the symmetry gives $p^* = q^* = 1/2$.

**Nash's theorem.** Every game with finitely many players and finitely many pure strategies has at least one Nash equilibrium in mixed strategies (John Nash, 1950). A 2×2 game whose best replies go round in a circle has exactly one, and in it both players mix.

**Coordination games have a third equilibrium.** The standards game of GT01, with payoffs $(4, 4)$ at $(X, X)$, $(3, 3)$ at $(Y, Y)$ and $(0, 0)$ otherwise, has two pure equilibria and also a mixed one. B is indifferent when $4p = 3(1 - p)$, so $p^* = 3/7$, and by symmetry $q^* = 3/7$. Each firm then expects $4 \cdot \tfrac37 = \tfrac{12}{7} \approx 1.71$, less than at either pure equilibrium, because the firms often fail to match. Notice that each firm picks the better standard X *less* than half the time: it is B's indifference, not A's preference, that sets A's mix.

**Zero-sum games.** When one player's gain is the other's loss, the mixed equilibrium can also be found with linear programming; that is GT05.

## Interactive
::widget{id="audit-best-responses"}

The graph shows the auditing game of Example 1, with the tax saved by cheating fixed at 10 thousand. The audit probability $p$ runs along the bottom and the cheating probability $q$ up the side. The lilac step is the taxpayer's best response (cheat while audits are rare, report honestly once they are frequent); the green step is the office's best response (no audits while cheating is rare, audit everyone once it is common). The filled dot where they cross is the mixed equilibrium. Move **Trial audit rate p** and watch the hollow dot jump from $q = 1$ to $q = 0$ as $p$ passes $p^*$, while the panel shows the taxpayer's expected gain from cheating at that rate. Then move **Fine F** and **Audit cost C** and see which step moves. Check: at the start ($F = 30$, $C = 2$) the panel shows $p^* = 0.25$, $q^* = 0.2$ and a gain of 6 at $p = 0.1$; set the trial rate to 0.25 and the gain is 0. Raise the fine to 40: $p^*$ falls to 0.2, but $q^*$ stays at 0.2.

## Worked examples

### Example 1 (easy): how often should the tax office audit?
A self-employed taxpayer can report income honestly or under-report it. Under-reporting saves 10 thousand in tax if there is no audit; if the office audits, the cheat pays the missing tax plus a fine of 30 thousand. Each audit costs the office 2 thousand, and an undetected cheat costs it the 10 thousand of tax. With the office as the row player and payoffs (office, taxpayer) measured against an honest return with no audit:
$$\begin{array}{c|cc} \text{Office}\backslash\text{Taxpayer} & \text{Cheat} & \text{Honest} \\ \hline \text{Audit} & (-2,\ -30) & (-2,\ 0) \\ \text{No audit} & (-10,\ 10) & (0,\ 0) \end{array}$$
Find the equilibrium audit rate $p$ and cheating rate $q$, and see what happens if the fine doubles.

1. Best replies: against Cheat the office audits ($-2 > -10$), against Honest it does not ($0 > -2$); against Audit the taxpayer is honest ($0 > -30$), against No audit it cheats ($10 > 0$).
   *Why:* the replies go round in a circle, so no cell is a pure equilibrium and both sides randomise.
2. $(1 - p) \cdot 10 - 30p = 0 \;\Rightarrow\; p^* = \dfrac{10}{10 + 30} = 0.25$
   *Why:* the audit rate must make the **taxpayer** indifferent: cheating's expected gain must equal the 0 of honesty.
3. $-2 = -10q \;\Rightarrow\; q^* = \dfrac{2}{10} = 0.2$
   *Why:* the cheating rate must make the **office** indifferent: auditing always costs 2, while not auditing loses 10 with probability $q$.
4. Expected payoffs: the taxpayer gets 0 (the same as honesty) and the office $-2$ per return.
   *Why:* an indifferent player earns what either of its pure strategies earns against the other's mix.
5. With a fine of 60: $p^* = \dfrac{10}{70} \approx 0.143$, while $q^* = 0.2$ is unchanged.
   *Why:* the fine is in the taxpayer's payoffs, so it moves the office's audit rate. The cheating rate depends only on the office's payoffs (audit cost and lost tax), which did not change.

```verify
G = 10; F = 30; C = 2
p = G/(G + F)
assert p == 0.25
assert (1 - p)*G - p*F == 0
q = C/G
assert q == 0.2
assert -C == -G*q
# best replies go round in a circle
assert -2 > -10 and 0 > -2 and 0 > -30 and 10 > 0
# taxpayer earns 0, office earns -2 from either choice
assert abs(p*(-30) + (1 - p)*10) < 1e-12
assert abs(q*(-10) + (1 - q)*0 - (-2)) < 1e-12
p60 = G/(G + 60)
assert abs(p60 - 0.143) < 0.0005
```

### Example 2 (medium): a penalty kick
A kicker shoots Left or Right and the goalkeeper dives Left or Right (sides seen from the kicker). The table gives the probability that the kicker scores; the keeper's payoff is the probability of a save, 1 minus that number.
$$\begin{array}{c|cc} \text{Kicker}\backslash\text{Keeper} & \text{Left} & \text{Right} \\ \hline \text{Left} & 0.55 & 0.85 \\ \text{Right} & 0.90 & 0.70 \end{array}$$
Right is the kicker's stronger side. Find the equilibrium probabilities and the scoring rate.

1. If the keeper dives Left, the kicker prefers Right ($0.90 > 0.55$); if Right, Left ($0.85 > 0.70$). The keeper wants to dive to the side the kicker shoots.
   *Why:* the kicker wants to mismatch and the keeper to match, so no pair of pure choices is stable.
2. $0.55q + 0.85(1 - q) = 0.90q + 0.70(1 - q) \;\Rightarrow\; 0.85 - 0.3q = 0.70 + 0.2q \;\Rightarrow\; q^* = 0.3$
   *Why:* the keeper's probability $q$ of diving Left must make the **kicker** indifferent between his two sides.
3. Save probabilities: $0.45p + 0.10(1 - p) = 0.15p + 0.30(1 - p) \;\Rightarrow\; 0.10 + 0.35p = 0.30 - 0.15p \;\Rightarrow\; p^* = 0.4$
   *Why:* the kicker's probability $p$ of shooting Left must make the **keeper** indifferent between diving Left and Right.
4. Scoring rate: $0.55 \cdot 0.3 + 0.85 \cdot 0.7 = 0.76$, and also $0.90 \cdot 0.3 + 0.70 \cdot 0.7 = 0.76$.
   *Why:* in equilibrium the kicker scores equally often whichever side he picks; the keeper saves $1 - 0.76 = 0.24$ of the kicks.
5. The kicker shoots to his strong side with probability $0.6$ and the keeper dives there with probability $0.7$.
   *Why:* equal scoring rates on both sides, with neither player completely predictable, is exactly what researchers test in data on real penalties.

```verify
s = [0.55, 0.85; 0.90, 0.70]
assert s[2,1] > s[1,1] and s[1,2] > s[2,2]
q = (s[2,2] - s[1,2])/(s[1,1] - s[1,2] - s[2,1] + s[2,2])
assert abs(q - 0.3) < 1e-12
assert abs((0.55*q + 0.85*(1 - q)) - (0.90*q + 0.70*(1 - q))) < 1e-12
k = 1 - s
assert abs(k[1,1] - 0.45) < 1e-12 and abs(k[2,1] - 0.10) < 1e-12
assert abs(k[1,2] - 0.15) < 1e-12 and abs(k[2,2] - 0.30) < 1e-12
p = (k[2,2] - k[2,1])/(k[1,1] - k[2,1] - k[1,2] + k[2,2])
assert abs(p - 0.4) < 1e-12
assert abs((0.45*p + 0.10*(1 - p)) - (0.15*p + 0.30*(1 - p))) < 1e-12
score = 0.55*q + 0.85*(1 - q)
assert abs(score - 0.76) < 1e-12
assert abs(0.90*q + 0.70*(1 - q) - 0.76) < 1e-12
assert abs(1 - score - 0.24) < 1e-12
assert abs(1 - p - 0.6) < 1e-12 and abs(1 - q - 0.7) < 1e-12
```

### Example 3 (hard): price promotions and the paradox
Two supermarket chains each decide whether to run a price promotion this week. Weekly profits in thousands, (A, B):
$$\begin{array}{c|cc} \text{A}\backslash\text{B} & \text{Promote} & \text{Regular} \\ \hline \text{Promote} & (4,\ 2) & (3,\ 5) \\ \text{Regular} & (2,\ 6) & (6,\ 4) \end{array}$$
Find the mixed equilibrium and both expected profits. Then suppose A cuts its costs so that its profit at (Regular, Regular) rises from 6 to 8: what changes?

1. A's best replies: Promote against Promote ($4 > 2$), Regular against Regular ($6 > 3$). B's: Regular against Promote ($5 > 2$), Promote against Regular ($6 > 4$).
   *Why:* A wants to match B (to keep its customers), B wants to do the opposite of A (to win customers without a price war), so the replies go round in a circle and there is no pure equilibrium.
2. $2p + 6(1 - p) = 5p + 4(1 - p) \;\Rightarrow\; 6 - 4p = 4 + p \;\Rightarrow\; p^* = 0.4$
   *Why:* A's probability $p$ of promoting must make **B** indifferent, so it uses B's profits (the second numbers).
3. $4q + 3(1 - q) = 2q + 6(1 - q) \;\Rightarrow\; 3 + q = 6 - 4q \;\Rightarrow\; q^* = 0.6$
   *Why:* B's probability $q$ of promoting must make **A** indifferent. Using A's own profits to find $p$ would give 0.6 for A, the classic mix-up.
4. $u_A^* = 4 \cdot 0.6 + 3 \cdot 0.4 = 3.6$ and $u_B^* = 2 \cdot 0.4 + 6 \cdot 0.6 = 4.4$; both promote in a share $0.4 \cdot 0.6 = 0.24$ of weeks.
   *Why:* each firm earns what either of its choices earns against the other's mix; the two randomise independently, so the chance of a price war is the product.
5. With 8 in place of 6: $4q + 3(1 - q) = 2q + 8(1 - q) \;\Rightarrow\; q^* = 5/7 \approx 0.714$, while $p^* = 0.4$ is unchanged. A now expects $26/7 \approx 3.71$ and B still $4.4$.
   *Why:* only A's payoffs changed, so only the equation that makes A indifferent changes, and that equation fixes **B's** mix. B promotes more often, which makes Regular less attractive to A and restores A's indifference.

```verify
A = [4, 3; 2, 6]
B = [2, 5; 6, 4]
assert A[1,1] > A[2,1] and A[2,2] > A[1,2]
assert B[1,2] > B[1,1] and B[2,1] > B[2,2]
p = (B[2,2] - B[2,1])/(B[1,1] - B[2,1] - B[1,2] + B[2,2])
assert abs(p - 0.4) < 1e-12
assert abs((2*p + 6*(1 - p)) - (5*p + 4*(1 - p))) < 1e-12
q = (A[2,2] - A[1,2])/(A[1,1] - A[1,2] - A[2,1] + A[2,2])
assert abs(q - 0.6) < 1e-12
assert abs((4*q + 3*(1 - q)) - (2*q + 6*(1 - q))) < 1e-12
uA = 4*q + 3*(1 - q)
uB = 2*p + 6*(1 - p)
assert abs(uA - 3.6) < 1e-12 and abs(uB - 4.4) < 1e-12
assert abs(p*q - 0.24) < 1e-12
# the mix-up: A's own indifference gives 0.6, not 0.4
assert abs(q - 0.6) < 1e-12 and abs(q - p) > 0.1
A2 = [4, 3; 2, 8]
q2 = (A2[2,2] - A2[1,2])/(A2[1,1] - A2[1,2] - A2[2,1] + A2[2,2])
assert abs(q2 - 5/7) < 1e-12
assert abs(q2 - 0.714) < 0.0005
p2 = (B[2,2] - B[2,1])/(B[1,1] - B[2,1] - B[1,2] + B[2,2])
assert p2 == p
uA2 = 4*q2 + 3*(1 - q2)
assert abs(uA2 - 26/7) < 1e-12 and abs(uA2 - 3.71) < 0.005
assert abs(uA2 - (2*q2 + 8*(1 - q2))) < 1e-12
assert abs(2*p2 + 6*(1 - p2) - 4.4) < 1e-12
```

## Common mistakes
- Finding a player's probability from that player's own payoffs; in Example 3 this gives 0.6 for A instead of 0.4, and an expected payoff computed with the two mixes swapped is wrong too (OWN_INDIFFERENCE).
- Answering with $1 - p$ when the question asks for $p$, or the other way round: check which choice your $p$ belongs to (COMPLEMENT).
- Assuming that a player who mixes chooses each action half the time (EQUAL_SPLIT).
- In the auditing game, writing $p = G/F$ instead of $p = G/(G + F)$ (GAIN_LEFT_OUT).
- Giving the other player's expected payoff instead of the one asked for (WRONG_PLAYER).
- Averaging a player's four payoffs as if every cell were equally likely (SIMPLE_AVERAGE).
- Concluding that a game with no pure equilibrium has no equilibrium at all; Nash's theorem guarantees one in mixed strategies.
- Thinking a player in a mixed equilibrium prefers the mix to its pure strategies: all of them pay the same, and the player mixes only to keep the other side indifferent.
- Rounding the probabilities early and then using them to compute expected payoffs; keep fractions such as $5/7$ until the end.
- Expecting a bigger fine to reduce cheating in this simple game: it reduces the audit rate needed to deter cheating, and the cheating rate stays the same.

## Practice
- `audit-probability-indifference` (difficulty 1): the audit probability that leaves a taxpayer indifferent between cheating and honest reporting, $p = G/(G + F)$; distractors OWN_INDIFFERENCE, COMPLEMENT, GAIN_LEFT_OUT.
- `mixed-equilibrium-probability` (difficulty 2): the probability that firm A or B plays its first choice in the mixed equilibrium of a 2×2 game with no pure equilibrium; distractors OWN_INDIFFERENCE, COMPLEMENT, EQUAL_SPLIT.
- `mixed-equilibrium-expected-payoff` (difficulty 3): one firm's expected profit in the mixed equilibrium of a 2×2 game; distractors WRONG_PLAYER, OWN_INDIFFERENCE, SIMPLE_AVERAGE.

## Real world
- Tax enforcement: tax offices combine targeted audits with unpredictable ones, because a published list of who will be audited would invite everyone else to cheat. The paradox of Example 1, pointed out by the political scientist George Tsebelis, warns that tougher fines may mainly reduce how often the authority needs to audit rather than how often people cheat.
- Penalty kicks: studies of thousands of professional penalties (by Chiappori, Levitt and Groseclose, and by Palacios-Huerta) found that kickers and goalkeepers mix sides close to the way the theory predicts, and that scoring rates are about the same whichever side is chosen.
- Retail sales: Hal Varian's model of sales explains why shops discount at random times; a store that always held its sale on the same day would be undercut by rivals, so promotions are mixed strategies.
- Inspections: environmental agencies, food-safety inspectors and ticket inspectors on public transport choose checks at random, and their budgets are set with the logic of the inspection game.

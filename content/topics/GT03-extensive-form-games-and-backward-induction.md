---
id: GT03
title: Extensive-form games and backward induction
block: GT
coreYear: 3
prerequisites: [GT01]
estMinutes: 50
status: draft
economicUses:
  - "Entry deterrence: will an incumbent really start a price war?"
  - Commitment through capacity, contracts and sunk investments
  - First-mover advantage in an oligopoly (Stackelberg leadership)
  - Wage bargaining and other negotiations where delay is costly
  - Whether a government's or central bank's promises are believed
generators: [entry-game-spe-payoff, entry-commitment-threshold, stackelberg-duopoly-outcome, alternating-offer-first-offer]
widgets: [entry-deterrence-tree]
mistakeCodes:
  NON_CREDIBLE_THREAT:
    label: Believed a threat that would not be carried out
    explanation: Once the entrant is in, the incumbent compares fighting with accommodating. If fighting pays it less, it will not fight, so the entrant ignores the threat and enters. Solve the incumbent's choice first, then the entrant's.
  THREAT_CARRIED_OUT:
    label: Assumed the incumbent fights after entry
    explanation: A price war that lowers the incumbent's own profit is not what it chooses once entry has happened. At the incumbent's node, pick the action with the higher payoff for the incumbent.
  NOT_FOLDED_BACK:
    label: Stopped before reaching the first mover
    explanation: Backward induction does not end at the last decision. After finding the incumbent's choice, go back to the entrant, who foresees it; facing a credible price war the entrant stays out, so the fight never happens.
  ALWAYS_ACCOMMODATE:
    label: Assumed the incumbent always accommodates
    explanation: Accommodation is the answer only when it pays the incumbent more than fighting. When the payoff from fighting is higher (for example after a capacity investment), the threat is credible and entry is deterred.
  WRONG_PLAYER:
    label: Gave the other player's payoff
    explanation: Each end point lists the entrant's payoff first and the incumbent's second. Find the equilibrium end point, then read the number of the player in the question.
  COMPARED_WITH_MONOPOLY:
    label: Compared fighting with the monopoly profit
    explanation: Credibility is decided at the incumbent's node after entry, where the choice is between fighting and accommodating. The penalty only has to close that gap, A − F; the monopoly profit is not available once the entrant is in.
  WHOLE_PROFIT:
    label: Used a whole profit instead of a difference
    explanation: The penalty does not need to wipe out the whole accommodation profit, only the gap A − F between accommodating and fighting. Likewise, a commitment is worth what it adds, M − A, not the whole monopoly profit M, because without it the incumbent still earns A.
  COMMITMENT_MIXUP:
    label: Mixed up the two commitment questions
    explanation: The smallest penalty that makes fighting credible compares the two choices after entry, A − F. The most worth paying for a commitment compares the incumbent's payoff with and without it, M − A. Check which question is asked.
  COMPARED_WITH_FIGHT:
    label: Compared commitment with the price war
    explanation: Without commitment the incumbent does not fight; it accommodates and earns A. So the commitment is worth M − A at most. The price war never happens in either case.
  COURNOT_SOLUTION:
    label: Used the Cournot answer
    explanation: (a − c)/(3b) for each firm is the outcome when both choose at the same time. When firm 1 moves first, it takes the follower's reaction into account and produces (a − c)/(2b); the follower then produces (a − c)/(4b).
  SWAPPED_ROLES:
    label: Swapped the leader and the follower
    explanation: The leader, who moves first, produces more, (a − c)/(2b); the follower produces half as much, (a − c)/(4b).
  FIRM_NOT_MARKET:
    label: Mixed up one firm's output and the market total
    explanation: The price depends on the output of both firms, Q = q₁ + q₂. Give one firm's output when it is asked for, and put the total into the demand curve when finding the price.
  SWAPPED_SHARES:
    label: Gave the other side's share
    explanation: The surplus is split into what the proposer keeps and what it offers. Check whether the question asks for the proposer's own share or the offer to the other side; the two add up to the whole surplus.
  EQUAL_SPLIT:
    label: Assumed a 50:50 split
    explanation: Bargaining power comes from what each side would get by rejecting and waiting, so the split is equal only by coincidence. Work backwards from the last round.
  NO_DISCOUNT:
    label: Forgot that delay is costly
    explanation: Without discounting, the side making the last offer could take everything, so the first offer would be all or nothing. Each round of delay multiplies a deal's value by δ, which is what gives the first proposer a positive share.
  WRONG_ROUND_COUNT:
    label: Used the wrong number of rounds
    explanation: Start at the last round of this game and work back one round at a time until round 1. With three rounds the firm makes both the first and the last offer, which changes the answer from the two-round game.
resources:
  - { title: "Game Theory (ECON 159), Lecture 14: Backward induction: commitment, spies, and first-mover advantages (Open Yale Courses)", url: "https://oyc.yale.edu/economics/econ-159/lecture-14", kind: course, verifiedAt: 2026-10-18 }
  - { title: "Game Theory (ECON 159), Lecture 15: Backward induction: chess, strategies, and credible threats (Open Yale Courses)", url: "https://oyc.yale.edu/economics/econ-159/lecture-15", kind: course, verifiedAt: 2026-10-18 }
  - { title: "Game Theory (ECON 159), Lecture 17: Backward induction: ultimatums and bargaining (Open Yale Courses)", url: "https://oyc.yale.edu/economics/econ-159/lecture-17", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
The games of GT01 are played at one moment: each player chooses without seeing the other's choice. Much of economic life happens in turns instead. A new firm decides whether to enter a market, and only then does the incumbent decide whether to start a price war. A market leader builds its capacity, and rivals plan around it. A union makes a wage demand, the firm accepts or makes a counter-offer, and every week of strike costs both sides money. In such games timing matters, and so does **credibility**: a threat or a promise only changes behaviour if the other side believes it will be carried out. This topic draws sequential games as trees and solves them by **backward induction**. It explains why "if you enter, we will crush you" often fails to deter, why a firm can gain by limiting its own options, why moving first can be an advantage, and how impatience shapes the outcome of a negotiation.

## Intuition
Think one move ahead of your opponent by thinking from the end. Before entering a market, a new firm asks: "if I enter, what will the incumbent actually do?" The incumbent may announce that it will fight with a price war. But once the newcomer is in, a price war hurts the incumbent too. If sharing the market pays it more than fighting, then fighting is an empty threat, and a sensible entrant ignores it. The entrant does not care what the incumbent *says* it will do; it cares what the incumbent will *want* to do when the time comes.

That is backward induction: solve the last decision first, then the one before it, knowing how the last one will be made, and so on back to the start. It leads to a surprising lesson. A player can gain by **removing its own options**. An army that burns the bridge behind it cannot retreat, so the enemy knows it will fight. An incumbent that signs contracts or builds a large plant that only pays off in a price war makes its threat believable, and then it may never need to carry it out.

## Definition and formulas
**Game tree (extensive form).** A sequential game is drawn as a tree:
- **decision nodes**, each labelled with the player who moves there; the first one is the **root**;
- **branches** leaving each node, one for each **action** (move) available there;
- **terminal nodes** (end points), each with a payoff for every player.

In this topic every game has **perfect information**: when a player moves, they know every move made so far. If a player could not see an earlier move, the nodes they cannot tell apart are grouped into one **information set** (drawn joined by a dashed line), and the player must choose the same action at all of them; a simultaneous game of GT01 is the special case where the second mover cannot see the first move.

**Strategies are complete plans.** A strategy says what the player would do at **every** node where they move, including nodes that are never reached. In the entry game below the entrant has two strategies, In and Out, and the incumbent has two, Fight and Accommodate: what it would do if entry happened. If player 2 moves after seeing which of player 1's two actions was chosen, and has two actions at each of those nodes, player 2 has $2 \times 2 = 4$ strategies, such as "Left if player 1 went up, Right if player 1 went down".

**The entry game.** An entrant chooses In or Out. Out gives payoffs (entrant, incumbent) $= (0, M)$, where $M$ is the incumbent's monopoly profit. After In, the incumbent chooses Fight, giving $(-L, F)$ with a loss $L > 0$ for the entrant, or Accommodate, giving $(D, A)$ with $D > 0$. With $M = 100$, $A = 40$, $F = 10$, $D = 30$ and $L = 20$ (Example 1), the game in normal form is
$$
\begin{array}{c|cc} \text{Entrant}\backslash\text{Incumbent} & \text{Fight} & \text{Accommodate} \\ \hline \text{In} & (-20,\ 10) & (30,\ 40) \\ \text{Out} & (0,\ 100) & (0,\ 100) \end{array}
$$
The underline method of GT01 finds **two** Nash equilibria: (In, Accommodate) and (Out, Fight). In the second, the entrant stays out because it expects a fight, and the incumbent's plan to fight costs it nothing because it is never carried out. But if the entrant did enter, fighting would earn the incumbent 10 instead of 40. The threat is **not credible**.

**Backward induction.**
1. Take a decision node whose branches all lead to end points. The player there picks the action with the highest payoff for them.
2. Replace that node by the end point it leads to.
3. Repeat until the root is reached.

The actions picked at every node, reached or not, form a strategy profile.

**Subgame-perfect equilibrium.** A **subgame** is the part of the tree that starts at one decision node and contains everything after it; with perfect information, every decision node starts a subgame, and the whole game is one too. A strategy profile is a **subgame-perfect equilibrium (SPE)** if it is a Nash equilibrium in every subgame, including those that are never reached. In a finite game with perfect information, backward induction finds the SPE, and if no player is ever indifferent between two actions it is unique. Every SPE is a Nash equilibrium, but not the other way round: subgame perfection rules out equilibria such as (Out, Fight) that rest on non-credible threats. In the entry game:
$$\text{Fight is credible} \iff F \ge A,$$
where in a tie we assume the incumbent carries out its threat.

**Commitment.** A player can change the game before others move, by making some of its own future actions more costly or impossible. Suppose the incumbent signs a binding contract to pay a penalty $P$ if it ever accommodates entry. After entry it compares $F$ with $A - P$, so
$$\text{Fight becomes credible} \iff F \ge A - P \iff P \ge A - F.$$
Then the entrant, which would lose $L$, stays out, and the incumbent earns $M$; the penalty is never paid. If arranging such a commitment costs $K$ up front, it is worth making when $M - K \ge A$, that is $K \le M - A$. Building capacity that only pays off in a price war, long-term supply contracts and sunk investments work the same way: they raise the payoff from fighting or lower the payoff from accommodating.

**Stackelberg leadership.** Two firms make the same good, the price is $P = a - b(q_1 + q_2)$ and each has constant marginal cost $c$. Firm 1, the **leader**, chooses $q_1$ first; firm 2, the **follower**, sees $q_1$ and then chooses $q_2$. Backward induction starts with the follower, whose best response is the same as in Cournot competition (GT01):
$$q_2 = BR_2(q_1) = \frac{a - c - bq_1}{2b}.$$
The leader knows this and puts it into its own profit:
$$\pi_1 = \big(a - c - bq_1 - b\,BR_2(q_1)\big)q_1 = \tfrac12(a - c - bq_1)\,q_1.$$
Setting $d\pi_1/dq_1 = \tfrac12(a - c) - bq_1 = 0$ (C109) gives
$$q_1^* = \frac{a - c}{2b}, \qquad q_2^* = \frac{a - c}{4b}, \qquad P^* = \frac{a + 3c}{4},$$
with profits $\pi_1^* = \dfrac{(a - c)^2}{8b}$ and $\pi_2^* = \dfrac{(a - c)^2}{16b}$. In Cournot competition each firm earns $\dfrac{(a - c)^2}{9b}$, so the leader gains and the follower loses: a **first-mover advantage**. The leader produces more than in Cournot because its output is a commitment: once it is made, the follower has to live with it and cuts its own output. Total output $\tfrac34 (a - c)/b$ is higher and the price lower than in Cournot.

**Alternating-offer bargaining.** Two players share a surplus $S$. In round 1 player 1 proposes a split and player 2 accepts or rejects; after a rejection player 2 proposes in round 2, then player 1 in round 3, and so on up to a last round $T$. If the last offer is rejected, both get nothing. Delay is costly: a deal reached one round later is worth $\delta$ times as much to each player, $0 < \delta < 1$ (equivalently, the surplus shrinks from $S$ to $\delta S$ each round). A responder accepts an offer that is at least as good as rejecting.

Backward induction: in the last round the proposer offers 0 and keeps $S$, because rejecting gives the responder nothing. In every earlier round the proposer offers the responder exactly $\delta$ times what the responder would get as the proposer in the next round, and keeps the rest. Measured in round-1 terms:
$$
\begin{array}{ccc} \text{rounds } T & \text{player 1 keeps} & \text{player 1 offers} \\ \hline 1 & S & 0 \\ 2 & S(1 - \delta) & \delta S \\ 3 & S(1 - \delta + \delta^2) & S(\delta - \delta^2) \end{array}
$$
The first offer is accepted at once, so no surplus is lost to delay. In general player 1 keeps $S\,\dfrac{1 - (-\delta)^T}{1 + \delta}$, which approaches $\dfrac{S}{1 + \delta}$ as the number of rounds grows: the first proposer keeps a little more than half, and the advantage is larger when players are impatient (small $\delta$).

## Interactive
::widget{id="entry-deterrence-tree"}

The tree is the entry game of Example 1. The entrant moves first (In or Out); after entry the incumbent fights or accommodates; each end point shows the payoffs (entrant, incumbent) in millions. Gold branches are the choices backward induction picks at each node, dashed lilac branches the choices it rejects, and the filled end point is the subgame-perfect outcome; the panel shows the incumbent's plan after entry, the entrant's choice and the payoffs. Move **Penalty if it accommodates, P** to give the incumbent a commitment, and watch the accommodation payoff fall. Check: at the start ($F = 10$, $P = 0$) the panel shows Accommodates, Enters and (30, 40); at $P = 25$ nothing changes yet, but at $P = 30 = 40 - 10$ it switches to Fights, Stays out and (0, 100), and the penalty is never paid. Then set $P$ back to 0 and move **Incumbent's profit if it fights, F**: from $F = 40$ upwards the threat is credible without any contract.

## Worked examples

### Example 1 (easy): an entrant and a threatened price war
A cement producer is the only seller in a region and earns 100 million a year. A rival considers entering. If it enters, the incumbent can fight with a price war (entrant −20, incumbent 10) or accommodate and share the market (entrant 30, incumbent 40). Payoffs are (entrant, incumbent) in millions. Find the subgame-perfect equilibrium, explain why the threat to fight does not deter entry, and find the smallest penalty for accommodating that would make it credible.

1. After entry: Accommodate gives the incumbent $40 > 10$ from Fight, so it accommodates.
   *Why:* backward induction starts at the last decision; the incumbent chooses what is best for it once the entrant is already in.
2. The entrant compares In, worth $30$ (it expects accommodation), with Out, worth $0$, and enters.
   *Why:* the entrant foresees the incumbent's choice at the next node, so entering is worth what accommodation gives it.
3. The SPE is (In, Accommodate), with payoffs $(30, 40)$.
   *Why:* these are the choices picked at both nodes; they are best replies in the whole game and in the subgame after entry.
4. (Out, Fight) is also a Nash equilibrium, with payoffs $(0, 100)$: the entrant gets $0 > -20$, and the incumbent gets 100 whatever it plans. But it is not subgame perfect, because after entry Fight earns $10 < 40$.
   *Why:* this equilibrium relies on a threat that the incumbent would not carry out; subgame perfection removes it.
5. With a penalty $P$ for accommodating, Fight is credible when $10 \ge 40 - P$, so $P \ge 30$. Then the entrant stays out ($-20 < 0$) and the incumbent earns 100 instead of 40, without paying the penalty; it would pay up to $100 - 40 = 60$ up front to set up such a commitment.
   *Why:* the commitment lowers the incumbent's own payoff from accommodating, which makes fighting its best reply after entry and so changes what the entrant expects.

```verify
M = 100; A = 40; F = 10; D = 30; L = 20
assert A > F
assert D > 0
# backward induction: incumbent accommodates, entrant enters
assert max(F, A) == 40
assert max(D, 0) == 30
# (Out, Fight) is a Nash equilibrium: the entrant prefers 0 to -20
assert 0 > -L
P = A - F
assert P == 30
assert F >= A - P and F < A - (P - 1)
assert -L < 0
assert M - A == 60
```

### Example 2 (medium): first-mover advantage in a duopoly
Take the market of GT01 Example 3: demand $P = 100 - 2(q_1 + q_2)$ and a cost of 10 per unit for each firm. Now firm 1 chooses its output first and firm 2 sees it before choosing. Find the subgame-perfect outputs, the price and both profits, and compare them with the Cournot outcome of 15 units and a profit of 450 for each firm.

1. Follower: $\dfrac{\partial \pi_2}{\partial q_2} = 90 - 2q_1 - 4q_2 = 0 \;\Rightarrow\; q_2 = 22.5 - 0.5\,q_1$
   *Why:* firm 2 moves last and takes $q_1$ as given, so its best response is the same as in Cournot competition.
2. Leader: $\pi_1 = \big(90 - 2q_1 - 2(22.5 - 0.5\,q_1)\big)q_1 = (45 - q_1)q_1$, so $45 - 2q_1 = 0$ and $q_1^* = 22.5$.
   *Why:* the leader foresees firm 2's reaction and builds it into its own profit; the second derivative is $-2 < 0$. The formula $(a - c)/(2b) = 90/4$ agrees.
3. $q_2^* = 22.5 - 0.5 \cdot 22.5 = 11.25$
   *Why:* once the leader has chosen, the follower plays its best response; it is $(a - c)/(4b)$, half the leader's output.
4. $Q^* = 33.75$ and $P^* = 100 - 2 \cdot 33.75 = 32.5$
   *Why:* the price depends on both outputs; it also equals $(a + 3c)/4 = 130/4$.
5. $\pi_1^* = (32.5 - 10) \cdot 22.5 = 506.25$ and $\pi_2^* = 22.5 \cdot 11.25 = 253.125$.
   *Why:* the leader earns 56.25 more than the Cournot 450 and the follower 196.875 less. Total output is higher than the Cournot 30 and the price lower than 40, so buyers gain too.

```verify
a = 100; b = 2; c = 10
q2r(x) = (a - c - b*x)/(2*b)
assert q2r(0) == 22.5 and q2r(1) - q2r(0) == -0.5
prof1(x) = (a - c - b*x - b*q2r(x))*x
assert abs(prof1(10) - (45 - 10)*10) < 1e-9
q1 = (a - c)/(2*b)
assert q1 == 22.5
assert prof1(q1) > prof1(q1 - 0.1) and prof1(q1) > prof1(q1 + 0.1)
q2 = q2r(q1)
assert q2 == 11.25
Q = q1 + q2
P = a - b*Q
assert Q == 33.75 and P == 32.5
assert P == (a + 3*c)/4
pi1 = (P - c)*q1
pi2 = (P - c)*q2
assert pi1 == 506.25 and pi2 == 253.125
assert pi1 == (a - c)^2/(8*b) and pi2 == (a - c)^2/(16*b)
qc = (a - c)/(3*b)
pic = (a - 2*b*qc - c)*qc
assert qc == 15 and pic == 450
assert pi1 - pic == 56.25 and pic - pi2 == 196.875
assert Q > 2*qc and P < a - 2*b*qc
```

### Example 3 (hard): a wage negotiation in three rounds
A firm and a union bargain over a surplus of 100 thousand a month. The firm makes an offer in round 1; if the union rejects it, the union makes an offer in round 2; if the firm rejects that, the firm makes a final offer in round 3, and if that is rejected both get nothing. Each round of delay (a week of strike, say) multiplies the value of any deal by $\delta = 0.8$ for both sides. Find what the firm offers in round 1 and what it keeps, and compare with a two-round negotiation.

1. Round 3: the firm offers the union 0 and keeps 100.
   *Why:* in the last round rejecting gives the union nothing, so it accepts any offer.
2. Round 2: the union offers the firm $0.8 \times 100 = 80$ and keeps $100 - 80 = 20$.
   *Why:* the firm can reject and get 100 one round later, which is worth $0.8 \times 100$ now; the union offers exactly that and keeps the rest.
3. Round 1: the firm offers the union $0.8 \times 20 = 16$ and keeps $100 - 16 = 84$.
   *Why:* the union can reject and get 20 one round later, worth $0.8 \times 20$ today, so 16 is the least it accepts.
4. Check: $100(1 - 0.8 + 0.8^2) = 84$ and $100(0.8 - 0.8^2) = 16$. The offer is accepted at once.
   *Why:* the table formula for three rounds gives the same split; nobody gains from delay, so no strike happens in equilibrium.
5. With two rounds the union makes the last offer: the firm offers $0.8 \times 100 = 80$ and keeps only 20. With many rounds the firm's share approaches $100/1.8 \approx 55.56$.
   *Why:* the last proposer has the upper hand in a short negotiation; as the deadline moves further away, that advantage fades and the first proposer keeps $S/(1 + \delta)$.

```verify
S = 100; d = 0.8
r3 = S
r2firm = d*r3
r2union = S - r2firm
assert abs(r2firm - 80) < 1e-9 and abs(r2union - 20) < 1e-9
offer = d*r2union
keep = S - offer
assert abs(offer - 16) < 1e-9 and abs(keep - 84) < 1e-9
assert abs(S*(1 - d + d^2) - 84) < 1e-9
assert abs(S*(d - d^2) - 16) < 1e-9
assert abs(S*(1 - (-d)^3)/(1 + d) - 84) < 1e-9
assert abs(d*S - 80) < 1e-9 and abs(S*(1 - d) - 20) < 1e-9
assert abs(S/(1 + d) - 55.56) < 0.005
assert abs(S*(1 - (-d)^40)/(1 + d) - S/(1 + d)) < 0.01
```

## Common mistakes
- Believing an announced threat, such as a price war, that the incumbent would not want to carry out once entry has happened (NON_CREDIBLE_THREAT).
- Assuming that the incumbent fights after entry even though fighting lowers its own profit (THREAT_CARRIED_OUT).
- Stopping at the last decision: finding the incumbent's choice but forgetting that the entrant foresees it (NOT_FOLDED_BACK).
- Assuming entry is always accommodated, even when fighting pays the incumbent more (ALWAYS_ACCOMMODATE).
- Reading the incumbent's payoff when the entrant's is asked, or the other way round (WRONG_PLAYER).
- Comparing the payoff from fighting with the monopoly profit when checking credibility; after entry the comparison is fight against accommodate (COMPARED_WITH_MONOPOLY).
- Thinking a penalty must wipe out the whole accommodation profit, or that a commitment is worth the whole monopoly profit (WHOLE_PROFIT).
- Mixing up the smallest penalty that makes a threat credible, $A - F$, with the most a commitment is worth, $M - A$ (COMMITMENT_MIXUP).
- Valuing a commitment against the price war instead of against accommodation, which is what happens without it (COMPARED_WITH_FIGHT).
- Solving a Stackelberg game as if the firms moved at the same time, giving the Cournot outputs (COURNOT_SOLUTION).
- Giving the leader the follower's output or the other way round; the leader produces twice as much (SWAPPED_ROLES).
- Using one firm's output where the market total is needed, or the other way round (FIRM_NOT_MARKET).
- Giving the share offered to the other side when the proposer's own share is asked, or the other way round (SWAPPED_SHARES).
- Expecting bargaining to end in an equal split (EQUAL_SPLIT).
- Forgetting the discount factor, so that the last proposer seems to take everything already in round 1 (NO_DISCOUNT).
- Working back from the wrong last round: a three-round game gives a different first offer from a two-round game (WRONG_ROUND_COUNT).
- Writing a strategy as one action instead of a complete plan: the incumbent's strategy says what it would do after entry even if entry never happens.
- Thinking that a strategy which is never played does not matter: off the equilibrium path it is exactly what keeps or breaks the equilibrium. What happens when a game like this is repeated many times is the subject of GT04.

## Practice
- `entry-game-spe-payoff` (difficulty 1): the entrant's or the incumbent's payoff in the subgame-perfect equilibrium of an entry game with stated payoffs; distractors NON_CREDIBLE_THREAT, THREAT_CARRIED_OUT, NOT_FOLDED_BACK, ALWAYS_ACCOMMODATE, WRONG_PLAYER.
- `entry-commitment-threshold` (difficulty 2): the smallest penalty for accommodating that makes a threat to fight credible, or the largest upfront cost worth paying for a commitment to fight; distractors COMPARED_WITH_MONOPOLY, WHOLE_PROFIT, COMMITMENT_MIXUP, COMPARED_WITH_FIGHT.
- `stackelberg-duopoly-outcome` (difficulty 2): the leader's output, the follower's output or the market price in a Stackelberg duopoly with $P = a - b(q_1 + q_2)$ and equal unit costs; distractors COURNOT_SOLUTION, SWAPPED_ROLES, FIRM_NOT_MARKET.
- `alternating-offer-first-offer` (difficulty 3): what the first proposer keeps or offers in round 1 of a two- or three-round alternating-offer bargaining game with discount factor $\delta$; distractors WRONG_ROUND_COUNT, SWAPPED_SHARES, EQUAL_SPLIT, NO_DISCOUNT.

## Real world
- Entry deterrence: incumbents in industries with large fixed plants, such as cement, steel or chemicals, sometimes build capacity ahead of demand. The extra capacity makes a price war cheaper for them to fight, which is a commitment of the kind in Example 1.
- Competition policy: when a dominant firm is accused of predatory pricing, competition authorities ask whether low prices only make sense as a way to drive a rival out, which is a question about credible threats and their cost to the firm.
- Policy credibility: a government that promises low inflation is tempted to break the promise once wages are set. Making the central bank independent, with a published inflation target, is a commitment device; Finn Kydland and Edward Prescott shared the 2004 Nobel prize in economics partly for analysing this time-inconsistency problem.
- Bargaining: wage negotiations, trade deals and company takeovers all have the structure of Example 3; strikes, lost sales and deadlines make delay costly, and the side that can wait longer gets a larger share.

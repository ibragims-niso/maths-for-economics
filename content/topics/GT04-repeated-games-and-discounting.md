---
id: GT04
title: Repeated games and discounting
block: GT
coreYear: 3
prerequisites: [GT03, F08]
estMinutes: 45
status: draft
economicUses:
  - Why some cartels last for years while others collapse quickly
  - Tacit collusion in markets with a few firms that meet again and again
  - Trade agreements kept in place by the threat of retaliation
  - Reputation of firms, sellers on online platforms and central banks
generators: [grim-trigger-critical-discount, grim-trigger-present-values, bertrand-cartel-max-firms]
widgets: [grim-trigger-streams]
mistakeCodes:
  COMPLEMENT_DELTA:
    label: Put the wrong gain on top
    explanation: The critical discount factor is δ* = (T − R)/(T − P). The numerator is the one-off gain from cheating, T − R. Putting the per-period loss R − P on top gives 1 − δ*.
  SUCKER_PAYOFF:
    label: Used the sucker payoff as the punishment
    explanation: After a firm cheats, grim trigger makes both firms cheat for ever, so the cheat earns P (both cheat), not S (the payoff of a firm that colludes while its rival cheats). Use δ* = (T − R)/(T − P).
  GAIN_OVER_LOSS:
    label: Divided by the per-period loss only
    explanation: Solving R ≥ (1 − δ)T + δP gives δ(T − P) ≥ T − R, so the denominator is T − P, the whole drop from temptation to punishment. Dividing by R − P can give a number above 1, which no discount factor can be.
  PUNISHMENT_NOT_DELAYED:
    label: Started the punishment today
    explanation: The cheat earns T this period; the punishment starts next period. Its present value is δP/(1 − δ), not P/(1 − δ), because the first punishment payment is one period away and is discounted once.
  TEMPTATION_FOREVER:
    label: Assumed cheating pays T for ever
    explanation: The rival reacts. The temptation T is earned only once, in the period of cheating; after that the cheat earns the punishment payoff P each period, so the present value is T + δP/(1 − δ).
  SHORT_SIGHTED:
    label: Looked at this period only
    explanation: Comparing T with R for one period ignores everything that cheating costs later. In a repeated game, add up the whole discounted stream of profits on each path before comparing.
  IGNORED_CONTINUATION:
    label: Ignored the chance that the market ends
    explanation: A profit next period counts only if the market is still there. With survival probability p and interest rate r the discount factor is δ = p/(1 + r), not 1/(1 + r).
  IGNORED_INTEREST:
    label: Ignored the interest rate
    explanation: Even if the market is sure to survive, money next period is worth less than money today. With survival probability p and interest rate r the discount factor is δ = p/(1 + r), not p.
  ROUNDED_UP:
    label: Rounded the number of firms up
    explanation: The cartel is stable when n ≤ 1/(1 − δ). If 1/(1 − δ) is 7.43, then 7 firms satisfy the inequality but 8 do not, so round down.
resources:
  - { title: "Principles of Economics 3e, 10.2 Oligopoly (OpenStax)", url: "https://openstax.org/books/principles-economics-3e/pages/10-2-oligopoly", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Game Theory (ECON 159), Lecture 21: Repeated games: cooperation vs. the end game (Open Yale Courses)", url: "https://oyc.yale.edu/economics/econ-159/lecture-21", kind: course, verifiedAt: 2026-10-18 }
  - { title: "Game Theory (ECON 159), Lecture 22: Repeated games: cheating, punishment, and outsourcing (Open Yale Courses)", url: "https://oyc.yale.edu/economics/econ-159/lecture-22", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
GT01 showed that a cartel is a prisoner's dilemma: in a one-off game each member gains by cheating on the agreed price or quota, so the cartel should fall apart. Yet real cartels, from cement and vitamins to airline routes, have lasted for years. The difference is that real firms do not meet once. They set prices again every week or every month, and a firm that cheats today can be punished tomorrow. **Repeated games** study what this repetition changes, and the answer depends on how much the players care about the future, measured by a **discount factor** $\delta$. The same mathematics explains why collusion is easier with few firms than with many, why competition authorities watch markets with frequent, transparent pricing, and why countries keep to trade agreements.

## Intuition
A cartel member thinking about cheating compares two things. Cheating brings a **gain now**: for one period it undercuts its rival and earns more. But it also brings a **loss later**: once the rival notices, the cartel collapses and every future period brings the low profit of a price war. A firm that cares a lot about the future (a high $\delta$) sees a long stream of lost profits that easily outweighs the one-off gain, so it keeps to the agreement. An impatient firm, or one that expects the market to disappear soon, grabs the gain.

The future must be open-ended for this to work. Suppose the two firms know they will meet for exactly 10 months. In month 10 there is no future to protect, so it is a one-off game and both cheat. Then in month 9 the outcome of month 10 is already fixed, so month 9 is effectively the last month and both cheat again. Working backwards in this way (backward induction, see GT03), cooperation **unravels** all the way to month 1. If instead the game never ends, or ends only by chance so that there is always a likely next period, there is no last month to start the unravelling, and the threat of future punishment can hold the cartel together.

## Definition and formulas
**Stage game and repeated game.** The **stage game** is the one-period game, for example the prisoner's dilemma of a cartel. With $T > R > P > S$ (temptation, reward, punishment, sucker), the payoffs (row firm, column firm) are
$$
\begin{array}{c|cc} & \text{Collude} & \text{Cheat} \\ \hline \text{Collude} & (R,\ R) & (S,\ T) \\ \text{Cheat} & (T,\ S) & (P,\ P) \end{array}
$$
Cheat is a dominant strategy, so the stage game has the unique Nash equilibrium (Cheat, Cheat). In the **repeated game** the stage game is played in periods $t = 0, 1, 2, \dots$, and before each period both players see everything that happened so far. A strategy is now a complete plan: what to do in each period after every possible history.

**Discounting.** A player values a stream of payoffs $u_0, u_1, u_2, \dots$ by its present value
$$V = u_0 + \delta u_1 + \delta^2 u_2 + \dots = \sum_{t=0}^{\infty} \delta^t u_t, \qquad 0 < \delta < 1.$$
With interest rate $r$ per period, $\delta = \dfrac{1}{1 + r}$. If in addition the game continues to the next period only with probability $p$ (the market may disappear, the firms may merge), a payoff next period is counted only with probability $p$, so $\delta = \dfrac{p}{1 + r}$. A constant stream is a geometric series with ratio $\delta$ (F08):
$$x + x\delta + x\delta^2 + \dots = \frac{x}{1 - \delta}, \qquad x\delta + x\delta^2 + \dots = \frac{x\,\delta}{1 - \delta}.$$
The second sum starts one period later, so every term carries one extra factor $\delta$.

**Finitely repeated games.** If the stage game has a unique Nash equilibrium and is repeated a known, finite number of times, the only subgame perfect equilibrium (see GT03: an equilibrium whose threats are credible after every history) is to play the stage-game equilibrium in every period. Backward induction removes any reward or punishment from the last period, then from the one before, and so on.

**Grim-trigger strategy.** Collude in period 0. Keep colluding as long as both players have always colluded. After any cheating by anyone, cheat for ever.

**One-shot deviation check.** A strategy profile is a subgame perfect equilibrium of an infinitely repeated game with discounting if, after every history, no player can gain by changing their action in **one period only** and then going back to the strategy. For grim trigger there are two kinds of history:
- **Nobody has cheated yet.** Colluding gives $R, R, R, \dots$; cheating once gives $T$ now, after which both cheat for ever and the cheat earns $P, P, \dots$:
$$V_{\text{collude}} = \frac{R}{1 - \delta}, \qquad V_{\text{cheat}} = T + \frac{\delta P}{1 - \delta}.$$
- **Someone has cheated.** Both cheat for ever, which repeats the stage-game equilibrium. Colluding for one period earns $S < P$ and changes nothing later, so it does not pay.

**Critical discount factor.** Collusion is an equilibrium when $V_{\text{collude}} \ge V_{\text{cheat}}$. Multiplying by $1 - \delta$ gives $R \ge (1 - \delta)T + \delta P$, so
$$\delta \ge \delta^* = \frac{T - R}{T - P}.$$
The numerator is the one-off gain from cheating; the denominator is the whole drop from temptation to punishment. In terms of the interest rate, $\delta = 1/(1 + r) \ge \delta^*$ is the same as $r \le r^* = \dfrac{R - P}{T - R}$: the per-period loss from the punishment over the one-off gain.

**Cartel stability.** Collusion can be sustained if and only if the firms are patient enough, $\delta \ge \delta^*$.
- *$n$ Bertrand firms* with identical costs, sharing the monopoly profit $\Pi_m$: colluding earns $R = \Pi_m/n$; undercutting the cartel price slightly captures almost the whole market for one period, $T = \Pi_m$; the punishment is pricing at marginal cost, $P = 0$. So
$$\delta^* = \frac{\Pi_m - \Pi_m/n}{\Pi_m - 0} = 1 - \frac{1}{n},$$
which is 0.5 for two firms, 0.8 for five and 0.9 for ten. More firms means a smaller share to protect and a bigger prize from cheating, so collusion is harder. The cartel is stable for every $n \le 1/(1 - \delta)$.
- *Cournot duopoly* with demand $P = a - bQ$ and unit cost $c$, punished by reverting to the Cournot equilibrium of GT01: the three profits are proportional to $(a - c)^2/b$, and $\delta^* = 9/17 \approx 0.53$ whatever the values of $a$, $b$ and $c$ (Example 3).

**Tit-for-tat.** A gentler strategy: collude in the first period, then do whatever the rival did in the previous period. It punishes cheating at once but forgives as soon as the rival returns to colluding. It did remarkably well in Robert Axelrod's computer tournaments of the repeated prisoner's dilemma around 1980.

**Folk theorem.** If players are patient enough ($\delta$ close to 1), any pattern of play that gives every player more on average than they can guarantee themselves under punishment can be sustained as a subgame perfect equilibrium of the infinitely repeated game. Repetition therefore makes cooperation possible, but it does not single it out: endless price wars are equilibria too.

## Interactive
::widget{id="grim-trigger-streams"}

The graph shows the cement cartel of Examples 1 and 2 month by month: colluding earns $R = 12$ every month (lilac bars), and cheating earns the temptation $T$ in month 0 and then the punishment $P = 8$ for ever (gold bars). Each bar is that month's profit multiplied by $\delta^t$, its value today, so the present values in the panel are the totals of the two rows of bars, continued for ever. Move **Discount factor δ** and watch the later bars shrink or grow: the lilac bars stand above the gold ones in every month after month 0, and those extra pieces are what cheating throws away. Move **Temptation T** to make cheating more attractive and watch $\delta^*$ (in the panel and on the graph) rise. Check: at $\delta = 0.75$ and $T = 18$ the panel shows 48 and 42 and $\delta^* = 0.6$, as in Example 2; at $\delta = 0.6$ both present values are 30, so the firm is just indifferent; at $\delta = 0.55$ the panel shows 26.67 and 27.78, and the caption says the cartel breaks down.

## Worked examples

### Example 1 (easy): when is a cement cartel stable?
Two cement producers agree to keep prices high. Each month they play the game below, in thousands of profit per month (A, B), and both use grim trigger. Find the smallest discount factor at which the cartel holds, and the matching highest monthly interest rate.
$$
\begin{array}{c|cc} \text{A}\backslash\text{B} & \text{Collude} & \text{Cheat} \\ \hline \text{Collude} & (12,\ 12) & (4,\ 18) \\ \text{Cheat} & (18,\ 4) & (8,\ 8) \end{array}
$$

1. $T = 18,\ R = 12,\ P = 8,\ S = 4$; since $18 > 12$ and $8 > 4$, Cheat is dominant.
   *Why:* in a single month the game is a prisoner's dilemma with the unique equilibrium (Cheat, Cheat), so only the future can hold the cartel together.
2. $\dfrac{12}{1 - \delta} \ge 18 + \dfrac{8\,\delta}{1 - \delta}$
   *Why:* colluding gives 12 every month; cheating gives 18 once and then 8 every month from next month on, when the rival punishes for ever.
3. $12 \ge 18(1 - \delta) + 8\delta = 18 - 10\delta \;\Rightarrow\; \delta \ge \dfrac{6}{10} = 0.6$
   *Why:* multiply both sides by $1 - \delta > 0$ and solve; this is $\delta^* = (T - R)/(T - P)$.
4. $\dfrac{1}{1 + r} \ge 0.6 \;\Rightarrow\; r \le \dfrac{1}{0.6} - 1 = 0.667$, which is $r^* = \dfrac{12 - 8}{18 - 12}$.
   *Why:* a higher interest rate means a lower $\delta$; the cartel holds at any monthly rate up to 66.7 %, far above real rates, so with a market that is sure to continue this cartel is stable.

```verify
T = 18; R = 12; P = 8; S = 4
assert T > R and R > P and P > S
dstar = (T - R)/(T - P)
assert dstar == 0.6
assert 18 - 10*dstar == R
# at δ* the two present values are equal
assert abs(R/(1 - dstar) - (T + dstar*P/(1 - dstar))) < 1e-9
rstar = 1/dstar - 1
assert abs(rstar - 0.667) < 0.0005
assert abs(rstar - (R - P)/(T - R)) < 1e-12
```

### Example 2 (medium): adding up the two profit streams
The same cement cartel, with discount factor $\delta = 0.75$ a month. Compare the present value of colluding for ever with the present value of cheating this month, check the punishment phase too, and then repeat the comparison for $\delta = 0.5$.

1. $V_{\text{collude}} = \dfrac{12}{1 - 0.75} = 48$
   *Why:* 12 every month starting now is a geometric series with ratio 0.75 (F08).
2. $V_{\text{cheat}} = 18 + \dfrac{8 \times 0.75}{1 - 0.75} = 18 + 24 = 42$
   *Why:* 18 is earned now, undiscounted; the punishment profits of 8 start next month, so their sum starts with $8 \times 0.75$.
3. Gain now $18 - 12 = 6$; loss later $\dfrac{(12 - 8) \times 0.75}{1 - 0.75} = 12$; so $48 - 42 = 12 - 6 = 6$.
   *Why:* cheating adds 6 this month but costs 4 in every later month, and those losses are worth 12 today. Colluding is worth 6 thousand more.
4. After a cheat: colluding for one month earns 4 instead of 8 and the rival keeps cheating, so no one-shot deviation pays.
   *Why:* in the punishment phase both firms play the stage-game equilibrium for ever, and a single different month cannot change that. With step 3 this passes the one-shot deviation check: grim trigger is a subgame perfect equilibrium at $\delta = 0.75$.
5. At $\delta = 0.5$: $V_{\text{collude}} = \dfrac{12}{0.5} = 24$ and $V_{\text{cheat}} = 18 + \dfrac{8 \times 0.5}{0.5} = 26 > 24$.
   *Why:* at $\delta = 0.5$ the future losses are worth only $4 \times 0.5/0.5 = 4$, less than the gain of 6, so each firm cheats. This agrees with $\delta^* = 0.6$ from Example 1.

```verify
R = 12; T = 18; P = 8; S = 4; d = 0.75
Vc = R/(1 - d)
Vd = T + P*d/(1 - d)
assert Vc == 48
assert P*d/(1 - d) == 24 and Vd == 42
assert T - R == 6
assert (R - P)*d/(1 - d) == 12
assert Vc - Vd == 6
assert Vc - Vd == (R - P)*d/(1 - d) - (T - R)
assert S < P
# brute force: add 400 months of each stream
t = 0:399
assert abs(sum(R*d.^t) - Vc) < 1e-9
assert abs(T + sum(P*d.^(t + 1)) - Vd) < 1e-9
h = 0.5
assert R/(1 - h) == 24
assert T + P*h/(1 - h) == 26
assert (R - P)*h/(1 - h) == 4
assert h < (T - R)/(T - P) and d > (T - R)/(T - P)
```

### Example 3 (hard): a Cournot cartel, an uncertain future and the number of firms
Two firms face demand $P = 100 - 2Q$ and cost 10 per unit, as in GT01 Example 3. There, sharing the monopoly output gave each firm 506.25, the best cheat against a partner who keeps to 11.25 units (producing 16.875) earned 569.53, and the Cournot equilibrium gave 450 each. The firms use grim trigger, with the Cournot equilibrium as the punishment. Each year the market survives to the next with probability 0.9, and the interest rate is 4 % a year. Is the cartel stable? If the product were instead sold by $n$ identical firms competing in prices (Bertrand), how many firms could such a cartel have at most?

1. $R = 506.25,\quad T = 569.53,\quad P = 450$
   *Why:* collusion is the shared monopoly profit, temptation the best one-period cheat, punishment the Cournot profit that follows for ever.
2. $\delta^* = \dfrac{569.53 - 506.25}{569.53 - 450} = \dfrac{63.28}{119.53} = 0.53$
   *Why:* the general formula $(T - R)/(T - P)$; with the exact profit $569.53125$ the ratio is exactly $9/17$.
3. $\delta = \dfrac{0.9}{1 + 0.04} = 0.865$
   *Why:* a profit next year counts only if the market still exists (probability 0.9), and it is worth $1/1.04$ of a profit today.
4. $0.865 \ge 0.53$, so the cartel is stable.
   *Why:* the firms are more patient than the critical level, so the future Cournot losses outweigh the one-year gain of $63.28$ from cheating.
5. $1 - \dfrac{1}{n} \le 0.865 \;\Rightarrow\; n \le \dfrac{1}{1 - \delta} = \dfrac{1.04}{1.04 - 0.9} = 7.43$, so at most 7 firms.
   *Why:* with Bertrand competition $\delta^* = 1 - 1/n$; writing $1 - \delta = 0.14/1.04$ avoids rounding $\delta$, and the number of firms must be a whole number that satisfies the inequality.

```verify
a = 100; b = 2; c = 10
qm = (a - c)/(4*b)
R = (a - b*2*qm - c)*qm
assert qm == 11.25 and R == 506.25
qd = (a - c - b*qm)/(2*b)
T = (a - b*(qd + qm) - c)*qd
assert qd == 16.875 and T == 569.53125
assert abs(T - 569.53) < 0.005
qc = (a - c)/(3*b)
P = (a - b*2*qc - c)*qc
assert P == 450
assert abs((T - R) - 63.28) < 0.005 and abs((T - P) - 119.53) < 0.005
dstar = (T - R)/(T - P)
assert abs(dstar - 9/17) < 1e-12
assert abs(dstar - 0.53) < 0.005
d = 0.9/1.04
assert abs(d - 0.865) < 0.0005
assert d >= dstar
nmax = 1/(1 - d)
assert abs(nmax - 1.04/0.14) < 1e-9
assert abs(nmax - 7.43) < 0.005
assert floor(nmax) == 7
assert 1 - 1/7 <= d and 1 - 1/8 > d
```

## Common mistakes
- Writing $\delta^* = (R - P)/(T - P)$: that is $1 - \delta^*$; the one-off gain $T - R$ goes on top (COMPLEMENT_DELTA).
- Using the sucker payoff $S$ in the formula; after cheating both firms cheat, so the punishment is $P$ (SUCKER_PAYOFF).
- Dividing the gain $T - R$ by the per-period loss $R - P$ instead of by $T - P$; a "discount factor" above 1 is a sure sign of this slip (GAIN_OVER_LOSS).
- Valuing the punishment as $P/(1 - \delta)$, as if it started today; it starts next period, so it is $\delta P/(1 - \delta)$ (PUNISHMENT_NOT_DELAYED).
- Assuming the cheat earns $T$ every period, $T/(1 - \delta)$; the rival reacts after one period (TEMPTATION_FOREVER).
- Comparing one period only, $T$ against $R$; the whole point of a repeated game is the future (SHORT_SIGHTED).
- Using $\delta = 1/(1 + r)$ when the market may end; the survival probability multiplies the discount factor, $\delta = p/(1 + r)$ (IGNORED_CONTINUATION).
- Using $\delta = p$ and forgetting that money next year is also worth less (IGNORED_INTEREST).
- Rounding $1/(1 - \delta)$ up to get the number of firms; the inequality $n \le 1/(1 - \delta)$ needs rounding down (ROUNDED_UP).
- Thinking that playing the prisoner's dilemma 10 or 100 times is enough for cooperation: with a known last period, backward induction unravels it.
- Reading $\delta$ the wrong way round: a high $\delta$ means a patient player (or a high chance the game goes on), and high $\delta$ helps collusion.

## Practice
- `grim-trigger-critical-discount` (difficulty 1): the smallest discount factor at which a two-firm cartel with a prisoner's-dilemma payoff table survives under grim trigger; distractors COMPLEMENT_DELTA, SUCKER_PAYOFF, GAIN_OVER_LOSS.
- `grim-trigger-present-values` (difficulty 2): the present value of cheating on a grim-trigger cartel, or how much more colluding is worth, for a given $\delta$; distractors PUNISHMENT_NOT_DELAYED, TEMPTATION_FOREVER, SHORT_SIGHTED.
- `bertrand-cartel-max-firms` (difficulty 3): the largest number of Bertrand firms whose cartel is stable when $\delta = p/(1 + r)$ comes from a survival probability and an interest rate; distractors IGNORED_CONTINUATION, IGNORED_INTEREST, ROUNDED_UP.

## Real world
- Cartel enforcement: competition authorities in the EU, the UK and the US run leniency programmes, in which the first cartel member to report the cartel escapes the fine. This raises the temptation to defect and makes every member fear being the one left behind, which shrinks the range of $\delta$ at which a cartel survives.
- Merger control: the authorities ask whether a merger makes **tacit collusion** easier. Fewer firms, frequent and transparent price changes, and stable demand all lower $\delta^*$ or raise the effective $\delta$, exactly as in this topic.
- Trade agreements: a country could gain by raising its tariffs alone, but its partners would retaliate in later years. The World Trade Organization's rules work like a repeated game in which retaliation is the punishment.
- Reputation: sellers on online platforms, banks and central banks keep promises they could break for a one-off gain, because a damaged reputation lowers what they earn in every later period.

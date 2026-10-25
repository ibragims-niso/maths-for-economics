---
id: SP04
title: "Option pricing intuition: the binomial model"
block: SP
coreYear: 4
prerequisites: [SP03, FM03]
estMinutes: 45
status: draft
economicUses:
  - Pricing call and put options on shares, stock indices and currencies
  - "Hedging: how many shares a dealer holds against an option it has sold"
  - Valuing employee share options and other contracts with an option inside
  - "Real options: the value of waiting before an irreversible investment"
searchTerms:
  - "Binomial option pricing"
  - "Risk-neutral probability"
  - "Call option"
  - "Put option"
generators: [binomial-tree-call-one-period, binomial-tree-replicating-loan, binomial-tree-put-two-period]
widgets: [binomial-option-tree]
mistakeCodes:
  REAL_WORLD_PROB:
    label: Used the real-world probability
    explanation: The price comes from copying the option with shares and a loan, so the chance of a rise that analysts expect plays no part. Weight the payoffs with the risk-neutral q = (R − d)/(u − d) instead.
  NO_DISCOUNT:
    label: Forgot to discount
    explanation: The risk-neutral average q·C_u + (1 − q)·C_d is a value at the end of the period. Divide by R = 1 + r once for each period to bring it back to today.
  SWAPPED_Q:
    label: Swapped q and 1 − q
    explanation: q = (R − d)/(u − d) belongs to the up move and 1 − q = (u − R)/(u − d) to the down move. Check that q·u + (1 − q)·d = R.
  SHARE_VALUE:
    label: Gave the cost of the shares
    explanation: Δ·S₀ is what the shares in the copying portfolio cost. The loan is smaller. It is the present value of what the shares are worth after a fall, minus the option's payoff there, (Δ·S_d − C_d)/R.
  GAVE_CALL_PRICE:
    label: Gave the option price, not the loan
    explanation: Δ·S₀ − B is the cost of the whole portfolio, which is the call price. The question asks for B, the amount borrowed, (Δ·S_d − C_d)/R.
  ONE_DISCOUNT:
    label: Discounted only one period
    explanation: An option that expires after two periods must be discounted twice, once for each step back through the tree, so the payoffs are divided by R² in total.
  CALL_PAYOFF:
    label: Used the call payoff for a put
    explanation: A put is the right to sell at the strike, so it pays max(K − S, 0). The call pays max(S − K, 0); mixing them up prices the wrong option.
resources:
  - { title: "Principles of Finance, 20.3 Exchange Rates and Risk: call and put options and their payoffs (OpenStax)", url: "https://openstax.org/books/principles-finance/pages/20-3-exchange-rates-and-risk", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Finance Theory I (MIT 15.401), Options: payoff diagrams and the binomial model (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/15-401-finance-theory-i-fall-2008/pages/video-lectures-and-slides/options/", kind: course, verifiedAt: 2026-10-18 }
  - { title: "Topics in Mathematics with Applications in Finance (MIT 18.S096, MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-s096-topics-in-mathematics-with-applications-in-finance-fall-2013/", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
An airline worried about the price of jet fuel, a farmer worried about the price of wheat and a pension fund worried about a stock-market crash can all buy **options**: contracts that pay out only if a price moves the wrong way. Firms pay their managers partly in share options, and a company deciding whether to build a factory now or wait a year is really choosing when to use an option. To trade or value any of these you need a price for a payment that depends on an uncertain future. Discounting (FM03) handles a payment that is certain; here the payment is random, and averaging it with the "true" probabilities runs into a problem, because nobody knows them and people disagree. The binomial model shows how to get a price that everyone must agree on, using nothing but the share price, the interest rate and one idea: there is no free money.

## Intuition
A **call option** gives its owner the right, but not the obligation, to buy a share at a fixed price, the **strike** $K$, on a fixed date. If the share ends above $K$ the owner buys at $K$ and gains $S - K$; if it ends below, she simply does not use the option and gets nothing. A **put option** is the right to sell at $K$, so it pays when the price ends below the strike.

Make the future as simple as possible: over one period the share either rises to $S_u$ or falls to $S_d$. A call then pays $C_u$ in the first case and $C_d$ in the second. Now try to *copy* the call with things whose prices you already know: buy $\Delta$ shares and borrow some money $B$ at the risk-free rate. You have two unknowns, $\Delta$ and $B$, and two states to match, so you can choose them to pay exactly what the call pays after a rise *and* after a fall. The copy, called the **replicating portfolio**, costs $\Delta S_0 - B$ today.

The call must cost the same. If it cost more, you could sell the call, buy the copy and keep the difference: whatever happens, the copy pays exactly what you owe. If it cost less, you would do the opposite. A riskless profit with no money of your own is an **arbitrage**, and in a working market traders compete such chances away. Notice what was *not* needed: the probability that the share rises. Two investors who disagree about that probability still agree on the option price.

The price can be rewritten as an average of the two payoffs, discounted at the risk-free rate, with weights $q$ and $1 - q$. These weights are called **risk-neutral probabilities**: they are the probabilities that would make the share earn only the risk-free rate on average. They are a pricing device, not a forecast. Over many periods the tree becomes a random walk of the share price (SP03), and the same backward steps price the option.

## Definition and formulas
**The one-period model.** A share is worth $S_0$ today. After one period it is worth $S_u = uS_0$ or $S_d = dS_0$, with $0 < d < u$. A risk-free loan or deposit grows by the gross factor
$$R = 1 + r \text{ per period,}$$
where $r$ is the interest rate per period with interest added once per period (FM01). If a question gives a continuously compounded rate instead (FM02), use $R = e^{r\,\Delta t}$ for a period of length $\Delta t$; all questions in this topic use $R = 1 + r$.

**No arbitrage.** The model makes sense only if
$$d < R < u.$$
If $R \ge u$, lending beats the share even after a rise, so selling the share and lending the money is a riskless profit; if $R \le d$, borrowing to buy the share is.

**Payoffs at expiry.** For a **European** option, which can only be used on its expiry date,
$$C = \max(S - K,\ 0) \ \text{(call)}, \qquad P = \max(K - S,\ 0) \ \text{(put)}.$$

**Replicating portfolio.** Hold $\Delta$ shares and borrow $B$ (repay $BR$ at the end). Matching the option in both states, $\Delta S_u - BR = C_u$ and $\Delta S_d - BR = C_d$, gives
$$
\begin{aligned}
\Delta &= \frac{C_u - C_d}{S_u - S_d}, \qquad B = \frac{\Delta S_d - C_d}{R}, \\
C_0 &= \Delta S_0 - B.
\end{aligned}
$$
$\Delta$ is the **hedge ratio** or **delta**: how many shares move together with one option. For a call $0 \le \Delta \le 1$; for a put $\Delta \le 0$, so a put is copied by *selling* shares and lending (a negative $B$).

**Risk-neutral pricing.** Substituting $\Delta$ and $B$ and collecting terms gives the same price in a shorter form:
$$
\begin{aligned}
q &= \frac{R - d}{u - d}, \qquad 1 - q = \frac{u - R}{u - d}, \\
C_0 &= \frac{q\,C_u + (1 - q)\,C_d}{R}.
\end{aligned}
$$
No arbitrage, $d < R < u$, is exactly the condition $0 < q < 1$. The weight $q$ satisfies $q\,uS_0 + (1 - q)\,dS_0 = RS_0$: under $q$ the share earns only the risk-free rate, as it would in a world of risk-neutral investors. The real-world probability of a rise does not appear anywhere.

**Two periods: backward induction.** With the same $u$, $d$ and $R$ in each period, an up move followed by a down move ends at the same price as down then up, $S_{ud} = udS_0$, so the tree has three final nodes. Start from the payoffs at expiry and apply the one-period rule at every node, moving back one period at a time:
$$
\begin{aligned}
C_u &= \frac{q\,C_{uu} + (1 - q)\,C_{ud}}{R}, \qquad C_d = \frac{q\,C_{ud} + (1 - q)\,C_{dd}}{R}, \\
C_0 &= \frac{q\,C_u + (1 - q)\,C_d}{R} = \frac{q^2 C_{uu} + 2q(1 - q)\,C_{ud} + (1 - q)^2 C_{dd}}{R^2}.
\end{aligned}
$$
The factor 2 counts the two paths to the middle node; with $n$ periods the weights are the binomial probabilities $\binom{n}{k} q^k (1 - q)^{n - k}$ (ST104), which is where the model gets its name. The replicating $\Delta$ is recomputed at every node, so the copy has to be rebalanced as the price moves (**dynamic hedging**).

**Put–call parity.** A call minus a put with the same strike and expiry pays $\max(S - K, 0) - \max(K - S, 0) = S - K$ in every state, which is also the payoff of one share minus a loan repaying $K$. So, for European options over $n$ periods,
$$C_0 - P_0 = S_0 - \frac{K}{R^n}.$$
This is a useful check on any tree calculation.

**Many small periods.** Cutting the time to expiry into more and more shorter periods, with $u$ and $d$ set from the share's volatility, the binomial price converges to the Black–Scholes formula used on trading desks.

## Interactive
::widget{id="binomial-option-tree"}

The tree shows a share worth 100 today over two periods, with a call option of strike 100. Each node is labelled with the share price S and the call value C; a hollow dot at the end means the call expires worthless there. Move the sliders **Up factor u**, **Down factor d** and **Interest rate r per period** (so $R = 1 + r$). The panel shows the risk-neutral probability $q$, the number of shares $\Delta$ in today's replicating portfolio and the call price $C_0$, and the caption gives the put price from put–call parity. Check: at the start ($u = 1.25$, $d = 0.9$, $r = 4\%$, the tree of Examples 1 to 3) the panel shows $q = 0.4$, $\Delta = 0.687$ and $C_0 = 13.87$, and the caption gives a put worth 6.32. Now raise $u$ to 1.4: $q$ falls to 0.28, yet the call rises to 16.65, because a wider spread of prices makes the right to buy more valuable. Set $u$ back to 1.25 and raise $r$ to 6 %: the call rises to 15.98 and the put falls to 4.98. Set $r$ to 0: the call and the put are both worth 9.69, as parity says when $K = S_0$ and $R = 1$. Finally set $u$ to 1.05 with $r$ at 5 % or more: $R$ is no longer below $u$, the caption explains the arbitrage and no price is shown.

## Worked examples

### Example 1 (easy): copying a call with shares and a loan
A share costs 100 today and in one period will be worth 125 or 90. The risk-free rate is 4 % per period, so $R = 1.04$. Analysts think a rise has probability 0.7. Price a European call with strike 100 that expires in one period, first by building the replicating portfolio, then with the risk-neutral probability.

1. $C_u = \max(125 - 100,\ 0) = 25$, $C_d = \max(90 - 100,\ 0) = 0$
   *Why:* the call is used only if the share ends above the strike.
2. $\Delta = \dfrac{25 - 0}{125 - 90} = \dfrac{5}{7} \approx 0.7143$
   *Why:* the loan repayment is the same in both states, so the shares alone must create the gap of 25 between the two payoffs.
3. $BR = \Delta \times 90 - 0 \approx 64.29$, so $B \approx \dfrac{64.29}{1.04} \approx 61.81$
   *Why:* after a fall the shares are worth $\tfrac57 \times 90$ and the call pays nothing, so the shares must exactly repay the loan.
4. $C_0 = \Delta S_0 - B \approx 71.43 - 61.81 = 9.62$
   *Why:* the portfolio pays exactly what the call pays (after a rise $\tfrac57 \times 125 - 64.29 = 25$), so to rule out arbitrage it must cost the same.
5. $q = \dfrac{1.04 - 0.9}{1.25 - 0.9} = 0.4$, $C_0 = \dfrac{0.4 \times 25 + 0.6 \times 0}{1.04} \approx 9.62$
   *Why:* the risk-neutral formula is the replicating portfolio in short form. The analysts' 0.7 would give $0.7 \times 25 / 1.04 \approx 16.83$; at that price you could sell the call, buy the copy for 9.62 and keep 7.21 with no risk.

```verify
S0 = 100; Su = 125; Sd = 90; R = 1.04; K = 100
Cu = max(Su - K, 0)
Cd = max(Sd - K, 0)
assert Cu == 25 and Cd == 0
D = (Cu - Cd)/(Su - Sd)
assert abs(D - 5/7) < 1e-12
assert abs(D - 0.7143) < 0.00005
assert abs(D*Sd - Cd - 64.29) < 0.005
B = (D*Sd - Cd)/R
assert abs(B - 61.81) < 0.005
assert abs(D*S0 - 71.43) < 0.005
C0 = D*S0 - B
assert abs(C0 - 9.62) < 0.005
# the copy pays the call in both states
assert abs(D*Su - B*R - Cu) < 1e-9
assert abs(D*Sd - B*R - Cd) < 1e-9
q = (R - 0.9)/(1.25 - 0.9)
assert abs(q - 0.4) < 1e-12
assert abs((q*Cu + (1 - q)*Cd)/R - C0) < 1e-9
wrong = 0.7*Cu/R
assert abs(wrong - 16.83) < 0.005
assert abs(wrong - C0 - 7.21) < 0.005
```

### Example 2 (medium): a two-period call by backward induction
The same share now runs for two periods, rising by 25 % or falling by 10 % in each, with $R = 1.04$ per period. Price a European call with strike 100 that expires after two periods, and find the hedge ratio at each node.

1. $S_{uu} = 156.25$, $S_{ud} = 112.5$, $S_{dd} = 81$; $C_{uu} = 56.25$, $C_{ud} = 12.5$, $C_{dd} = 0$
   *Why:* $100 \times 1.25^2$, $100 \times 1.25 \times 0.9$ and $100 \times 0.9^2$; rise-then-fall and fall-then-rise end at the same price.
2. $q = 0.4$
   *Why:* $u$, $d$ and $R$ are the same as in Example 1 and in every period.
3. $C_u = \dfrac{0.4 \times 56.25 + 0.6 \times 12.5}{1.04} = \dfrac{30}{1.04} \approx 28.85$, $C_d = \dfrac{0.4 \times 12.5 + 0.6 \times 0}{1.04} = \dfrac{5}{1.04} \approx 4.81$
   *Why:* one period before expiry, each node is a one-period problem on the two nodes after it.
4. $C_0 = \dfrac{0.4 \times 28.85 + 0.6 \times 4.81}{1.04} \approx 13.87$
   *Why:* one more step back. In one line, $C_0 = \dfrac{0.16 \times 56.25 + 0.48 \times 12.5 + 0.36 \times 0}{1.04^2} = \dfrac{15}{1.0816} \approx 13.87$.
5. $\Delta_0 = \dfrac{28.85 - 4.81}{125 - 90} \approx 0.687$, $\Delta_u = \dfrac{56.25 - 12.5}{156.25 - 112.5} = 1$, $\Delta_d = \dfrac{12.5 - 0}{112.5 - 81} \approx 0.397$
   *Why:* the copy starts with 0.687 shares; after a rise the call is sure to be used, so it behaves like a whole share, and after a fall it needs fewer. The hedge must be adjusted as the price moves.

```verify
S0 = 100; u = 1.25; d = 0.9; R = 1.04; K = 100
q = (R - d)/(u - d)
Suu = S0*u^2; Sud = S0*u*d; Sdd = S0*d^2
assert abs(Suu - 156.25) < 1e-9 and abs(Sud - 112.5) < 1e-9 and abs(Sdd - 81) < 1e-9
Cuu = max(Suu - K, 0); Cud = max(Sud - K, 0); Cdd = max(Sdd - K, 0)
assert abs(Cuu - 56.25) < 1e-9 and abs(Cud - 12.5) < 1e-9 and Cdd == 0
Cu = (q*Cuu + (1 - q)*Cud)/R
Cd = (q*Cud + (1 - q)*Cdd)/R
assert abs(Cu*R - 30) < 1e-9 and abs(Cd*R - 5) < 1e-9
assert abs(Cu - 28.85) < 0.005 and abs(Cd - 4.81) < 0.005
C0 = (q*Cu + (1 - q)*Cd)/R
assert abs(C0 - 13.87) < 0.005
# second route: the three paths in one formula
assert abs(q^2 - 0.16) < 1e-12 and abs(2*q*(1 - q) - 0.48) < 1e-12 and abs((1 - q)^2 - 0.36) < 1e-12
assert abs((q^2*Cuu + 2*q*(1 - q)*Cud + (1 - q)^2*Cdd)/R^2 - C0) < 1e-9
assert abs(R^2 - 1.0816) < 1e-12
assert abs(15/1.0816 - C0) < 1e-9
D0 = (Cu - Cd)/(S0*u - S0*d)
assert abs(D0 - 0.687) < 0.0005
assert abs((Cuu - Cud)/(Suu - Sud) - 1) < 1e-12
assert abs((Cud - Cdd)/(Sud - Sdd) - 0.397) < 0.0005
```

### Example 3 (hard): a two-period put, checked by parity
In the same tree ($S_0 = 100$, $u = 1.25$, $d = 0.9$, $R = 1.04$ per period), price a European put with strike 100 that expires after two periods. Check the answer with put–call parity, find the hedge, and ask whether the right to sell early would add any value.

1. $P_{uu} = \max(100 - 156.25,\ 0) = 0$, $P_{ud} = \max(100 - 112.5,\ 0) = 0$, $P_{dd} = \max(100 - 81,\ 0) = 19$
   *Why:* the put pays only if the share ends below the strike, here only after two falls.
2. $P_u = \dfrac{0.4 \times 0 + 0.6 \times 0}{1.04} = 0$, $P_d = \dfrac{0.4 \times 0 + 0.6 \times 19}{1.04} = \dfrac{11.4}{1.04} \approx 10.96$
   *Why:* backward induction one period before expiry, with the same $q = 0.4$ as before.
3. $P_0 = \dfrac{0.4 \times 0 + 0.6 \times 10.96}{1.04} \approx 6.32$
   *Why:* one more step back; in one line, $P_0 = 0.36 \times 19 / 1.04^2 = 6.84 / 1.0816$.
4. $C_0 - P_0 \approx 13.87 - 6.32 = 7.54$ and $S_0 - \dfrac{K}{R^2} = 100 - \dfrac{100}{1.0816} \approx 100 - 92.46 = 7.54$
   *Why:* put–call parity holds with the call from Example 2, so both tree calculations are consistent.
5. $\Delta_0 = \dfrac{0 - 10.96}{125 - 90} \approx -0.313$, $\Delta_d = \dfrac{0 - 19}{112.5 - 81} \approx -0.603$
   *Why:* a put gains when the share falls, so it is copied by selling shares short and lending money; after a fall the short position grows.
6. At the down node, selling at once would pay $100 - 90 = 10 < 10.96$, so waiting is better
   *Why:* an **American** option may be used at any date, so at each node its value is the larger of using it now and waiting. Using it early never beats waiting at any node, so an American put in this tree is also worth 6.32.

```verify
S0 = 100; u = 1.25; d = 0.9; R = 1.04; K = 100
q = (R - d)/(u - d)
Puu = max(K - S0*u^2, 0); Pud = max(K - S0*u*d, 0); Pdd = max(K - S0*d^2, 0)
assert Puu == 0 and Pud == 0 and abs(Pdd - 19) < 1e-9
Pu = (q*Puu + (1 - q)*Pud)/R
Pd = (q*Pud + (1 - q)*Pdd)/R
assert Pu == 0
assert abs(Pd - 11.4/1.04) < 1e-9
assert abs(Pd - 10.96) < 0.005
P0 = (q*Pu + (1 - q)*Pd)/R
assert abs(P0 - 6.32) < 0.005
assert abs(P0 - 6.84/1.0816) < 1e-9
# put-call parity with the call of Example 2
Cuu = max(S0*u^2 - K, 0); Cud = max(S0*u*d - K, 0); Cdd = max(S0*d^2 - K, 0)
C0 = (q^2*Cuu + 2*q*(1 - q)*Cud + (1 - q)^2*Cdd)/R^2
assert abs(C0 - 13.87) < 0.005
assert abs(K/R^2 - 92.46) < 0.005
assert abs((C0 - P0) - (S0 - K/R^2)) < 1e-9
assert abs(C0 - P0 - 7.54) < 0.005
D0 = (Pu - Pd)/(S0*u - S0*d)
assert abs(D0 - (-0.313)) < 0.0005
Dd = (Pud - Pdd)/(S0*u*d - S0*d^2)
assert abs(Dd - (-0.603)) < 0.0005
# early exercise never beats waiting in this tree
assert K - S0*d < Pd
assert K - S0*u <= Pu
assert K - S0 < P0
```

## Common mistakes
- Pricing with the real-world probability of a rise instead of the risk-neutral $q$; $q$ is a pricing weight, not a forecast (REAL_WORLD_PROB).
- Stopping at the average payoff $q\,C_u + (1 - q)\,C_d$ and forgetting to divide by $R$ (NO_DISCOUNT).
- Putting $q = (R - d)/(u - d)$ on the down move and $1 - q$ on the up move (SWAPPED_Q).
- Giving the cost of the shares $\Delta S_0$ when asked how much the replicating portfolio borrows (SHARE_VALUE).
- Giving the option price $\Delta S_0 - B$ when asked for the loan $B$ (GAVE_CALL_PRICE).
- Discounting a two-period option by $R$ only once instead of once per period, $R^2$ in total (ONE_DISCOUNT).
- Using the call payoff $\max(S - K, 0)$ when pricing a put, which pays $\max(K - S, 0)$ (CALL_PAYOFF).
- Mixing interest conventions: when a rate is quoted per period with interest added once per period, $R = 1 + r$; only a continuously compounded rate gives $R = e^{r\,\Delta t}$.
- Forgetting the factor 2 on the middle node in the one-line two-period formula: two different paths lead there.
- Using numbers that break $d < R < u$; then $q$ falls outside 0 to 1 and the "price" is meaningless, because an arbitrage exists.

## Practice
- `binomial-tree-call-one-period` (difficulty 1): price of a one-period European call, $[q\,C_u + (1 - q)\,C_d]/R$ with $R = 1 + r$ per period, when the stem also quotes a real-world probability; distractors REAL_WORLD_PROB, NO_DISCOUNT, SWAPPED_Q.
- `binomial-tree-replicating-loan` (difficulty 2): the amount borrowed in the portfolio of $\Delta$ shares that copies a one-period call, $B = (\Delta S_d - C_d)/R$; distractors NO_DISCOUNT, SHARE_VALUE, GAVE_CALL_PRICE.
- `binomial-tree-put-two-period` (difficulty 3): price of a two-period European put by backward induction through the tree; distractors ONE_DISCOUNT, NO_DISCOUNT, SWAPPED_Q, CALL_PAYOFF.

## Real world
- Exchanges list options on shares, stock indices, currencies and commodities. Dealers who sell them hedge by holding the replicating $\Delta$ in the underlying asset and rebalancing as prices move, exactly as in Example 2.
- Firms that pay staff in share options must report the options' value in their accounts; lattice (tree) models are a standard way to value them, because the tree can handle rules such as early exercise or vesting dates.
- Real options: a firm that can delay building a plant or developing a mine holds a call option on the project. Valuing the option to wait explains why firms often hold back investment when uncertainty rises.
- Central banks and analysts read the risk-neutral probabilities implied by option prices to see how much weight markets put on large moves in exchange rates, interest rates or share prices, remembering that these are pricing weights rather than true forecasts.

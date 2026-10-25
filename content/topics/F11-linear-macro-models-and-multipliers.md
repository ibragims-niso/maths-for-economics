---
id: F11
title: Linear macro models and multipliers
block: F
coreYear: 1
prerequisites: [F05, F08]
estMinutes: 45
status: draft
economicUses:
  - Forecasting how much a government spending package raises national income
  - "Comparing multipliers in closed and open economies: why imports weaken a stimulus"
  - "Automatic stabilisers: how an income tax dampens booms and slumps"
  - How central bank money turns into bank deposits and the money supply
searchTerms:
  - "Keynesian cross"
  - "Fiscal multiplier"
  - "Money multiplier"
generators: [keynesian-equilibrium-income, fiscal-multiplier-tax-imports, money-multiplier-currency]
widgets: [keynesian-cross]
mistakeCodes:
  DIVIDED_BY_MPC:
    label: Divided by b instead of 1 − b
    explanation: Equilibrium income is autonomous spending divided by 1 − b, the share of each extra unit of income that is saved. Dividing by the marginal propensity to consume b gives the wrong multiplier.
  FORGOT_AUTONOMOUS:
    label: Left out autonomous consumption
    explanation: Households spend a even when income is zero, and this spending is multiplied like investment and government spending. Add up a + I + G before dividing by 1 − b.
  NO_MULTIPLIER:
    label: Stopped after the first round of spending
    explanation: Autonomous spending, or a change in it, is only the first round. Each round of income is partly spent again and becomes someone else's income, so income ends up larger by the multiplier.
  SIMPLE_MULTIPLIER:
    label: Used 1/(1 − b) despite taxes or imports
    explanation: Taxes and imports are leakages too. Of each extra unit of income only b(1 − t) − m is spent again on home-produced goods, so the multiplier is 1/(1 − b(1 − t) + m), smaller than 1/(1 − b).
  TAX_NOT_COMPLEMENT:
    label: Used t instead of 1 − t
    explanation: With a tax rate t households keep the share 1 − t of their income. Consumption rises by b(1 − t) for each extra unit of income, not by bt.
  IGNORED_IMPORTS:
    label: Left out imports
    explanation: The share m of each extra unit of income is spent on foreign goods and becomes income abroad, not at home. Add m to the denominator, 1 − b(1 − t) + m.
  IGNORED_CURRENCY:
    label: Used 1/rr although people hold cash
    explanation: Cash the public keeps is not deposited, so banks cannot lend it again. With a currency ratio c the money multiplier is (1 + c)/(c + rr), smaller than 1/rr.
  DEPOSITS_ONLY:
    label: Gave the change in deposits, not in money
    explanation: ΔB/(c + rr) is the change in deposits. The money supply is cash plus deposits, so multiply deposits by 1 + c.
  BASE_ONLY:
    label: Gave the change in the monetary base
    explanation: New base money is deposited, lent, spent and deposited again, so the money supply grows by a multiple of it. Multiply the change in the base by (1 + c)/(c + rr).
resources:
  - { title: "Principles of Economics 3e, Appendix D The Expenditure-Output Model (OpenStax)", url: "https://openstax.org/books/principles-economics-3e/pages/d-the-expenditure-output-model", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Principles of Economics 3e, 25.2 The Building Blocks of Keynesian Analysis (OpenStax)", url: "https://openstax.org/books/principles-economics-3e/pages/25-2-the-building-blocks-of-keynesian-analysis", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Principles of Economics 3e, 27.4 How Banks Create Money (OpenStax)", url: "https://openstax.org/books/principles-economics-3e/pages/27-4-how-banks-create-money", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
A government plans to spend an extra 50 billion on roads and schools during a recession. Will national income rise by 50 billion, by more, or by less? A central bank buys bonds and creates 30 billion of new money: how much does the money supply grow? Both questions have the same kind of answer, a multiplier, and both come from simple linear models solved like the equations in F05.

## Intuition
In the short run, when firms have spare capacity, they produce whatever people want to buy, so total spending decides total output and income. One person's spending is another person's income. Suppose the government spends 20 more on a bridge. The builders earn 20 more and, if they spend 80 % of any extra income, they spend 16 in shops. The shopkeepers earn 16 and spend 12.8, and so on. Each round is smaller than the last, and the rounds add up to a finite total: $20 + 16 + 12.8 + \dots = 100$. The multiplier here is 5.

Money that does not come back as spending on home-produced goods in the next round is a **leakage**: saving, taxes and imports. The more leaks out in each round, the faster the rounds shrink and the smaller the multiplier.

Banks create money through a similar chain. New money is deposited, the bank keeps part as reserves and lends the rest, the loan is spent and deposited again, and so on. Here the leakages are the reserves banks keep and the cash people hold.

## Definition and formulas
Planned spending (aggregate expenditure) in an economy:
$$AE = C + I + G + (X - M)$$
consumption $C$, investment $I$, government spending $G$, exports $X$ and imports $M$.

**Consumption function.** $C = a + bY$, where $a > 0$ is autonomous consumption and $0 < b < 1$ is the **marginal propensity to consume** (MPC): the share of an extra unit of income that is spent. The marginal propensity to save is $1 - b$.

**Equilibrium (the Keynesian cross).** Output equals planned spending, $Y = AE$. On a diagram with income $Y$ on the horizontal axis, the spending line has intercept $a + I + G$ and slope $b$; the 45° line shows every point where $AE = Y$. Equilibrium is where they cross. In a closed economy without income tax, with $I$ and $G$ fixed:
$$Y = a + bY + I + G \;\Rightarrow\; Y^* = \frac{a + I + G}{1 - b}$$

**The spending multiplier.** A change in any autonomous spending changes equilibrium income by
$$\Delta Y = \frac{1}{1 - b}\,\Delta G$$
This is a geometric series (F08): the rounds of spending are $\Delta G,\ b\,\Delta G,\ b^2\Delta G, \dots$ and, because $0 < b < 1$,
$$\Delta G\,(1 + b + b^2 + \dots) = \frac{\Delta G}{1 - b}$$

**Proportional income tax** $T = tY$. Households spend out of disposable income $Y_d = (1 - t)Y$, so $C = a + b(1 - t)Y$ and
$$Y^* = \frac{a + I + G}{1 - b(1 - t)}, \qquad \text{multiplier } \frac{1}{1 - b(1 - t)}$$

**Balanced-budget multiplier.** With a lump-sum tax $T$, $C = a + b(Y - T)$ and $Y^* = \dfrac{a - bT + I + G}{1 - b}$. The tax multiplier is $-\dfrac{b}{1 - b}$. If $G$ and $T$ both rise by $\Delta$:
$$\Delta Y = \frac{\Delta - b\Delta}{1 - b} = \Delta$$
so the balanced-budget multiplier is 1.

**Open economy.** Exports $X$ are fixed and imports rise with income, $M = mY$, where $m$ is the **marginal propensity to import**:
$$Y^* = \frac{a + I + G + X}{1 - b(1 - t) + m}, \qquad \text{multiplier } \frac{1}{1 - b(1 - t) + m}$$
Of each extra unit of income, $b(1 - t) - m$ is spent again at home; the rest leaks out through saving, taxes and imports.

**Money multiplier.** The monetary base $B$ is the public's cash $CU$ plus banks' reserves $R$. The money supply is cash plus deposits, $M^s = CU + D$ (written $M^s$ so it is not confused with imports). With the reserve ratio $rr = R/D$ and the currency ratio $c = CU/D$:
$$B = (c + rr)\,D, \qquad M^s = (1 + c)\,D \;\Rightarrow\; M^s = \frac{1 + c}{c + rr}\,B$$
If the public holds no cash ($c = 0$), the money multiplier is simply $1/rr$.

**Looking ahead: IS–LM.** If investment falls as the interest rate $r$ rises, equilibrium in the goods market becomes one linear equation in $Y$ and $r$ (the IS curve), and equilibrium in the money market gives a second one (the LM curve). Solving the pair by substitution, as in F05, gives income and the interest rate together. The fiscal multiplier is then smaller than in the cross, because higher income pushes up the interest rate, which holds investment back.

## Interactive
::widget{id="keynesian-cross"}

The graph is the economy of Example 1: planned spending $AE = 50 + bY + 150 + G$ against income, with the 45° line where spending equals income. Move the **Government spending G** slider and watch the AE line shift up; the panel shows equilibrium income $Y^*$, the multiplier and the change in $Y^*$ compared with $G = 200$. Check: with $b = 0.8$, set $G = 220$ and the panel shows $Y^* = 2{,}100$, a change of 100, five times the extra 20. Then move the **marginal propensity to consume b** slider: a steeper AE line gives a bigger multiplier, so the same change in $G$ moves $Y^*$ much further.

## Worked examples

### Example 1 (easy): equilibrium income and the multiplier
In a closed economy without income tax, $C = 50 + 0.8Y$, $I = 150$ and $G = 200$ (in billions). Find equilibrium income, then the effect of raising government spending by 20.

1. $Y = 50 + 0.8Y + 150 + 200$
   *Why:* in equilibrium output equals planned spending, where the spending line meets the 45° line.
2. $0.2Y = 400 \Rightarrow Y^* = 2000$
   *Why:* subtract $0.8Y$ from both sides and divide by $1 - b = 0.2$.
3. Check: $C = 50 + 0.8 \cdot 2000 = 1650$ and $1650 + 150 + 200 = 2000$.
   *Why:* at $Y^*$ everything produced is bought, so firms have no reason to change output.
4. Multiplier $k = \dfrac{1}{1 - 0.8} = 5$, so $\Delta Y = 5 \cdot 20 = 100$ and income rises to 2100.
   *Why:* a rise in $G$ shifts the spending line up; income rises by the shift times the multiplier.
5. Round by round: $20 + 16 + 12.8 + \dots$; the first three rounds already give 48.8, and the whole series sums to $\dfrac{20}{1 - 0.8} = 100$.
   *Why:* each round is 0.8 times the previous one, a geometric series with ratio $b$ (F08).

```verify
a = 50; b = 0.8; I = 150; G = 200
Y = (a + I + G)/(1 - b)
assert abs(Y - 2000) < 1e-9
C = a + b*Y
assert abs(C - 1650) < 1e-9
assert abs(C + I + G - Y) < 1e-9
k = 1/(1 - b)
assert abs(k - 5) < 1e-9
dG = 20
Y2 = (a + I + G + dG)/(1 - b)
assert abs(Y2 - Y - 100) < 1e-9
assert abs(Y2 - 2100) < 1e-9
assert abs(dG + b*dG + b^2*dG - 48.8) < 1e-9
assert abs(sum(dG * b.^(0:299)) - 100) < 1e-6
```

### Example 2 (medium): taxes and imports
Consumption is $C = 100 + 0.8Y_d$, income is taxed at $t = 0.25$, $I = 200$, $G = 300$, exports are $X = 220$ and imports are $M = 0.1Y$. Find equilibrium income and the rise in income when the government spends 50 more.

1. $Y_d = 0.75Y$, so $C = 100 + 0.8 \cdot 0.75Y = 100 + 0.6Y$
   *Why:* households spend out of the income left after tax.
2. $Y = 100 + 0.6Y + 200 + 300 + 220 - 0.1Y$
   *Why:* output equals planned spending on home-produced goods; imports are subtracted because that spending goes abroad.
3. $(1 - 0.6 + 0.1)Y = 820 \Rightarrow 0.5Y = 820 \Rightarrow Y^* = 1640$
   *Why:* collect the $Y$ terms; $0.5$ is the share of each extra unit of income that leaks out.
4. $k = \dfrac{1}{0.5} = 2$, so $\Delta Y = 2 \cdot 50 = 100$
   *Why:* only $0.6 - 0.1 = 0.5$ of each extra unit is spent again at home. The simple multiplier $1/(1 - 0.8) = 5$ would wrongly predict 250.
5. Leakages: $\Delta T = 0.25 \cdot 100 = 25$, $\Delta M = 0.1 \cdot 100 = 10$, $\Delta S = 0.2 \cdot 75 = 15$, and $25 + 10 + 15 = 50$.
   *Why:* income stops rising exactly when the extra leakages match the extra 50 of government spending.

```verify
a = 100; b = 0.8; t = 0.25; I = 200; G = 300; X = 220; m = 0.1
assert abs(b*(1 - t) - 0.6) < 1e-12
L = 1 - b*(1 - t) + m
assert abs(L - 0.5) < 1e-12
Y = (a + I + G + X)/L
assert abs(Y - 1640) < 1e-9
assert abs(a + b*(1 - t)*Y + I + G + X - m*Y - Y) < 1e-9
dG = 50
dY = dG/L
assert abs(1/L - 2) < 1e-9
assert abs(dY - 100) < 1e-9
assert abs(dG/(1 - b) - 250) < 1e-9
dT = t*dY; dM = m*dY; dYd = (1 - t)*dY; dS = (1 - b)*dYd
assert abs(dT - 25) < 1e-9
assert abs(dM - 10) < 1e-9
assert abs(dYd - 75) < 1e-9
assert abs(dS - 15) < 1e-9
assert abs(dT + dM + dS - dG) < 1e-9
```

### Example 3 (hard): the money multiplier with cash
Banks keep reserves of 10 % of deposits ($rr = 0.1$) and the public holds cash equal to 20 % of deposits ($c = 0.2$). The central bank raises the monetary base by 30 (billion). Find the money multiplier and the rise in the money supply. How large a rise in the base would raise the money supply by 200?

1. $\Delta B = \Delta CU + \Delta R = 0.2\,\Delta D + 0.1\,\Delta D = 0.3\,\Delta D$
   *Why:* new base money ends up either as cash in people's pockets or as reserves in banks, and both are fixed shares of deposits.
2. $\Delta D = \dfrac{30}{0.3} = 100$, so $\Delta CU = 20$ and $\Delta R = 10$.
   *Why:* divide by $c + rr = 0.3$ to get deposits; then cash is $0.2 \times 100$ and reserves $0.1 \times 100$, which add back up to the 30 of new base money.
3. $\Delta M^s = \Delta CU + \Delta D = 20 + 100 = 120$, so the multiplier is $\dfrac{1 + 0.2}{0.2 + 0.1} = 4$.
   *Why:* money is cash plus deposits, $(1 + c)$ times deposits.
4. Without cash ($c = 0$) the multiplier would be $1/0.1 = 10$ and money would rise by 300.
   *Why:* cash held by the public drops out of the lending chain, so it shrinks every round.
5. $\Delta B = \dfrac{200}{4} = 50$
   *Why:* reverse the multiplier: divide the target change in money by it.

```verify
rr = 0.1; c = 0.2; dB = 30
dD = dB/(c + rr)
assert abs(dD - 100) < 1e-9
dCU = c*dD; dR = rr*dD
assert abs(dCU - 20) < 1e-9
assert abs(dR - 10) < 1e-9
assert abs(dCU + dR - dB) < 1e-9
mm = (1 + c)/(c + rr)
assert abs(mm - 4) < 1e-12
assert abs(dCU + dD - 120) < 1e-9
assert abs(mm*dB - 120) < 1e-9
assert abs(1/rr - 10) < 1e-12
assert abs(dB/rr - 300) < 1e-9
assert abs(200/mm - 50) < 1e-9
```

## Common mistakes
- Dividing autonomous spending by $b$ instead of by $1 - b$ (DIVIDED_BY_MPC).
- Leaving autonomous consumption $a$ out of total autonomous spending (FORGOT_AUTONOMOUS).
- Stopping after the first round: giving autonomous spending, or the change in $G$, as the answer (NO_MULTIPLIER).
- Using the simple multiplier $1/(1 - b)$ when there is an income tax or imports (SIMPLE_MULTIPLIER).
- Multiplying $b$ by $t$ instead of by $1 - t$ (TAX_NOT_COMPLEMENT).
- Forgetting imports in an open economy (IGNORED_IMPORTS).
- Using $1/rr$ when the public also holds cash (IGNORED_CURRENCY).
- Giving the change in deposits instead of the change in money (DEPOSITS_ONLY).
- Giving the change in the monetary base as the change in money (BASE_ONLY).
- Subtracting $m$ in the denominator: imports are a leakage, so they make the multiplier smaller, and $m$ is added.
- Thinking that spending financed by an equal lump-sum tax leaves income unchanged: income rises by the full amount, because the tax cuts consumption by only $b$ times the tax.

## Practice
- `keynesian-equilibrium-income` (difficulty 1): equilibrium income $Y^* = (a + I + G)/(1 - b)$ in a closed economy; distractors DIVIDED_BY_MPC, FORGOT_AUTONOMOUS, NO_MULTIPLIER.
- `fiscal-multiplier-tax-imports` (difficulty 2): rise in equilibrium income after extra government spending, with an income tax and, in some problems, imports; distractors SIMPLE_MULTIPLIER, TAX_NOT_COMPLEMENT, IGNORED_IMPORTS, NO_MULTIPLIER.
- `money-multiplier-currency` (difficulty 2): rise in the money supply after a rise in the monetary base, with a reserve ratio and a currency ratio; distractors IGNORED_CURRENCY, DEPOSITS_ONLY, BASE_ONLY.

## Real world
- Fiscal policy: before a stimulus package, finance ministries estimate how much each unit of extra spending adds to GDP. Measured multipliers are much smaller than $1/(1 - b)$ suggests, because taxes, imports and interest rates all leak spending away.
- Small open economies: when a large share of extra income is spent on imported goods, the multiplier is small and part of a stimulus helps trading partners instead. This is one reason countries coordinate stimulus during a global recession.
- Automatic stabilisers: income taxes and unemployment benefits shrink the multiplier, so a fall in exports or investment moves national income less than it otherwise would.
- Central banks: the money multiplier links the monetary base to the money supply, but it is not a fixed number. After 2008 banks held large excess reserves, and the US Federal Reserve cut its reserve requirement to zero in 2020, so modern central banks steer interest rates rather than relying on a stable multiplier.

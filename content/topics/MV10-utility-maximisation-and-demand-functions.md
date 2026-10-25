---
id: MV10
title: Utility maximisation and demand functions
block: MV
coreYear: 2
prerequisites: [MV08]
estMinutes: 50
status: draft
economicUses:
  - Forecasting how household food demand responds to prices and income
  - Splitting the effect of a price rise into substitution and income effects
  - Choosing a demand model (Cobb–Douglas, complements, substitutes) for policy analysis
  - Engel curves and sorting goods into normal and inferior
searchTerms:
  - "Utility maximization"
  - "Marshallian demand"
generators: [perfect-complements-demand, slutsky-substitution-income-effect, complements-price-elasticity]
widgets: [demand-preference-types]
mistakeCodes:
  ALL_ON_ONE_GOOD:
    label: Spent the whole budget on one good
    explanation: M/pₓ is the most x the budget can buy if nothing else is bought. With perfect complements every unit of x needs some y as well, so income is divided by the price of a complete set, pₓ + (a/b)·p_y.
  HALF_BUDGET_SPLIT:
    label: Split the budget half and half
    explanation: Spending half of income on each good is the Cobb–Douglas answer for U = xy. With U = min(ax, by) the goods are bought in the fixed ratio y = (a/b)·x, and the spending shares depend on the prices.
  INVERTED_PROPORTION:
    label: Turned the fixed proportion upside down
    explanation: At the kink a·x = b·y, so y = (a/b)·x, not (b/a)·x. Check with the utility function. With U = min(2x, y) each unit of x needs 2 units of y.
  ONE_FOR_ONE:
    label: Bought the goods one for one
    explanation: M/(pₓ + p_y) is right only for U = min(x, y). With U = min(ax, by) one unit of x comes with a/b units of y, so the price of a set is pₓ + (a/b)·p_y.
  TOTAL_NOT_SPLIT:
    label: Gave the total change, not one part
    explanation: The total change x₁ − x₀ is the sum of the substitution effect h − x₀ and the income effect x₁ − h. Find the compensated bundle h first and then take the part the question asks for.
  SWAPPED_EFFECTS:
    label: Swapped the substitution and income effects
    explanation: The substitution effect is the move along the old indifference curve, from x₀ to the compensated choice h. The income effect is the rest, from h to the new choice x₁.
  GAVE_NEW_QUANTITY:
    label: Gave a quantity instead of a change
    explanation: An effect is a difference between two quantities. Subtract the starting point; h − x₀ for the substitution effect, x₁ − h for the income effect.
  EFFECT_SIGN:
    label: Lost the sign of the effect
    explanation: When the price of a good rises, the substitution effect always lowers its quantity, so it is negative. For a normal good the income effect is negative too. A price fall makes both positive.
  COBB_DOUGLAS_ELASTICITY:
    label: Used the Cobb–Douglas elasticities
    explanation: −1 for the own price and 0 for the other price hold only for Cobb–Douglas demand. Work out the elasticities from the actual demand function, here x = M/(pₓ + (a/b)·p_y).
  ELASTICITY_SIGN:
    label: Lost the minus sign of the elasticity
    explanation: For perfect complements a rise in either price lowers the demand for x, so both the own-price and the cross-price elasticity are negative.
  SWAPPED_ELASTICITY:
    label: Gave the other elasticity
    explanation: The own-price elasticity uses pₓ in the numerator, −b·pₓ/(b·pₓ + a·p_y); the cross-price elasticity uses the price of y, −a·p_y/(b·pₓ + a·p_y). The two add up to −1.
  INVERTED_ELASTICITY:
    label: Turned the elasticity upside down
    explanation: Elasticity is (∂x/∂p)·(p/x), the percentage change in quantity divided by the percentage change in price. Using x/p gives the reciprocal, a number below −1 here.
resources:
  - { title: "Principles of Microeconomics 3e, 6.2 How Changes in Income and Prices Affect Consumption Choices (OpenStax)", url: "https://openstax.org/books/principles-microeconomics-3e/pages/6-2-how-changes-in-income-and-prices-affect-consumption-choices", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Principles of Economics 3e, 5.4 Elasticity in Areas Other Than Price (OpenStax)", url: "https://openstax.org/books/principles-economics-3e/pages/5-4-elasticity-in-areas-other-than-price", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "MIT 14.121 Microeconomic Theory I, Consumer Theory lecture slides (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/14-121-microeconomic-theory-i-fall-2015/resources/mit14_121f15_2s/", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
When the price of bread rises, how much less bread does a family buy, and does it buy more or less of other food? When incomes grow by 5 % a year, does spending on food grow by 5 % too, or less? Governments ask these questions before taxing or subsidising goods, central banks ask them when food and fuel prices jump, and firms ask them when they set prices. MV08 found a consumer's best bundle for *one* set of prices and income. This topic solves the same problem for *every* price and income at once. The answer is a **demand function**, the bridge between a model of preferences and the demand curves of a market. How it responds to prices and income is what elasticities, Engel curves and the substitution and income effects describe.

## Intuition
A demand function is a recipe: tell it the prices and the income, and it returns what the consumer buys. Its shape comes from the shape of the indifference curves.

- With **Cobb–Douglas** preferences the consumer spends a fixed share of income on each good. If food takes 30 % of the budget, it takes 30 % at any price and any income. This is very convenient, but it is a strong assumption: real households spend a *smaller* share on food as they get richer.
- With **perfect complements**, such as a car and the fuel it burns, the goods are only useful together. The consumer buys complete sets, and a dearer fuel means fewer days of driving, so demand for car hire falls even though its own price did not change.
- With **perfect substitutes**, such as two brands of bottled water that taste the same, the consumer buys only the cheaper one. Demand jumps from all to nothing when one price passes the other.

A price rise does two things at once. It makes the good dearer *relative* to others, so the consumer swaps towards other goods: the **substitution effect**. It also makes the consumer poorer, since the same income buys less: the **income effect**. Splitting a price change into these two parts is the **Slutsky decomposition**.

## Definition and formulas
**The consumer problem.** Maximise $U(x, y)$ subject to $p_x x + p_y y = M$. Its solution, written as a function of the prices and income, is the pair of **Marshallian demand functions**
$$x^* = x(p_x, p_y, M), \qquad y^* = y(p_x, p_y, M).$$

**Two properties of every demand function.**
- *Homogeneous of degree 0* (MV04): $x(tp_x, tp_y, tM) = x(p_x, p_y, M)$ for every $t > 0$. Doubling all prices and income leaves the budget line where it was, so the choice does not change (no money illusion).
- *Budget exhausted* (Walras' law): when more is always better, $p_x x^* + p_y y^* = M$ at every price and income.

**The indirect utility function** is the highest utility the consumer can reach:
$$V(p_x, p_y, M) = U\big(x(p_x, p_y, M),\ y(p_x, p_y, M)\big).$$
It rises with income, falls (or stays the same) when a price rises, and is homogeneous of degree 0. Its slope in income is the multiplier: $\partial V/\partial M = \lambda$, the marginal utility of income of MV09.

**Demand for four kinds of preferences.**
- Cobb–Douglas, $U = x^a y^b$ (MV08): $x^* = \dfrac{a}{a+b}\cdot\dfrac{M}{p_x}$. For $U = xy$ the best bundle is $\big(M/(2p_x),\ M/(2p_y)\big)$, so $V = \dfrac{M^2}{4p_xp_y}$.
- Perfect complements, $U = \min(ax, by)$: no unit is wasted, so $ax = by$ and $y = \tfrac{a}{b}x$. One complete set costs $p_x + \tfrac{a}{b}p_y$, and
$$x^* = \frac{M}{p_x + \frac{a}{b}\,p_y}, \qquad y^* = \frac{a}{b}\,x^*.$$
There is no tangency: the indifference curves are L-shaped and the best bundle sits at the corner of the L.
- Perfect substitutes, $U = ax + by$: compare the utility per unit of money, $a/p_x$ against $b/p_y$. If $a/p_x > b/p_y$, then $x^* = M/p_x$ and $y^* = 0$; if it is smaller, $x^* = 0$. When the two are equal, every bundle on the budget line is best.
- Quasilinear, $U = a\ln x + y$ with $p_y = 1$: $x^* = a/p_x$ whatever the income, as long as $M \ge a$ (below that the consumer is at a corner, see OP01).

The **CES** family $U = (x^\rho + y^\rho)^{1/\rho}$ ($\rho < 1$, $\rho \neq 0$) links the others: as $\rho \to 0$ it behaves like Cobb–Douglas, as $\rho \to -\infty$ like perfect complements and as $\rho \to 1$ like perfect substitutes. Its demand is $x^* = M p_x^{-\sigma}/(p_x^{1-\sigma} + p_y^{1-\sigma})$, with $\sigma = 1/(1-\rho)$ the elasticity of substitution.

**Elasticities from a demand function** (C107):
$$\varepsilon_{x} = \frac{\partial x}{\partial p_x}\cdot\frac{p_x}{x}, \qquad \varepsilon_{xy} = \frac{\partial x}{\partial p_y}\cdot\frac{p_y}{x}, \qquad \eta_x = \frac{\partial x}{\partial M}\cdot\frac{M}{x}.$$
The cross-price elasticity $\varepsilon_{xy}$ is negative for complements and positive for substitutes.
- Cobb–Douglas: $\varepsilon_x = -1$, $\varepsilon_{xy} = 0$, $\eta_x = 1$ at every price and income.
- Perfect complements: $\varepsilon_x = -\dfrac{p_x}{p_x + \frac{a}{b}p_y}$, $\varepsilon_{xy} = -\dfrac{\frac{a}{b}p_y}{p_x + \frac{a}{b}p_y}$, $\eta_x = 1$. Both price elasticities lie between −1 and 0.
- Because demand is homogeneous of degree 0, Euler's theorem (MV04) gives $\varepsilon_x + \varepsilon_{xy} + \eta_x = 0$. Because the budget is exhausted, the income elasticities weighted by budget shares add up to 1: $s_x\eta_x + s_y\eta_y = 1$.

**Engel curves and kinds of goods.** The **Engel curve** of good $x$ is $x$ as a function of $M$ with prices fixed. A good is **normal** if $\eta_x > 0$ (demand rises with income) and **inferior** if $\eta_x < 0$; a normal good is a **necessity** if $0 < \eta_x < 1$ and a **luxury** if $\eta_x > 1$. Cobb–Douglas and perfect complements give straight Engel curves through the origin ($\eta = 1$), so every good sits exactly on the line between necessity and luxury; quasilinear utility gives $\eta_x = 0$. Real food demand, with $\eta$ below 1, needs a richer model.

**The Slutsky decomposition.** Let the price of $x$ change from $p_0$ to $p_1$, with $x_0$ the old choice and $x_1$ the new one. Give the consumer just enough income to stay on the *old* indifference curve at the *new* prices; the bundle chosen then is the **compensated** (Hicksian) demand $h$. Then
$$\underbrace{x_1 - x_0}_{\text{total}} = \underbrace{h - x_0}_{\text{substitution effect}} + \underbrace{x_1 - h}_{\text{income effect}}.$$
The substitution effect always moves against the price: a dearer good is bought less. The income effect of a price rise lowers demand for a normal good and raises it for an inferior one. For small changes the same split reads $\dfrac{\partial x}{\partial p_x} = \dfrac{\partial h}{\partial p_x} - x\,\dfrac{\partial x}{\partial M}$ (the Slutsky equation). Hicksian demand $h(p_x, p_y, u)$ is the amount of $x$ in the cheapest bundle that reaches utility $u$; for $U = xy$ it is $h = \sqrt{u\,p_y/p_x}$.

## Interactive
::widget{id="demand-preference-types"}

The graph shows one budget, income 120 with good $y$ at 4, and the best bundle for three kinds of preferences. Move **Price of x, p_x** to rotate the budget line and **Preferences** to switch between Cobb–Douglas $\sqrt{xy}$, perfect complements $\min(x, y)$ and perfect substitutes $x + y$. The panel shows the best bundle, the price elasticity of $x$ at that price and the share of income spent on $x$. Check: at the start ($p_x = 6$, Cobb–Douglas) the panel shows $(10, 15)$, elasticity −1 and 50 %; move the price and the share stays at 50 %. Switch to perfect complements: the bundle is $(12, 12)$ and the elasticity is −0.6. Switch to perfect substitutes: the bundle jumps to $(0, 30)$, and lowering $p_x$ to 3 moves it to $(40, 0)$.

## Worked examples

### Example 1 (easy): cars and fuel
A family hires a car by the day ($x$ days a month) and buys fuel ($y$ litres). Each day of driving uses 40 litres, and neither good is any use without the other, so $U = \min(40x, y)$. A day of car hire costs 30, fuel costs 1.5 a litre and the monthly budget for driving is 900. Find the demand function for car hire and the family's choice, then see what happens when fuel rises to 2.25.

1. $40x = y$
   *Why:* at the best bundle nothing is wasted; extra litres without extra days of hire, or the other way round, add no utility.
2. $30x + 1.5 \cdot 40x = 900$, so $90x = 900$
   *Why:* each day of driving is a complete set that costs $30 + 40 \cdot 1.5 = 90$.
3. $x^* = \dfrac{M}{p_x + 40p_y} = \dfrac{900}{90} = 10$ days and $y^* = 400$ litres
   *Why:* the demand function divides income by the price of a set; doubling all prices and income would leave it unchanged.
4. With fuel at 2.25: $x^* = \dfrac{900}{30 + 90} = 7.5$ days and $y^* = 300$ litres
   *Why:* the price of car hire did not change, but each day of driving got dearer, so the family hires the car less. Car hire and fuel are complements.
5. $\varepsilon_{xy} = -\dfrac{40p_y}{p_x + 40p_y} = -\dfrac{60}{90} = -0.67$ at the original prices
   *Why:* the cross-price elasticity is negative for complements; a 1 % rise in the fuel price cuts car hire by about 0.67 %. The own-price elasticity is $-30/90 = -0.33$, and the two add up to −1 because the income elasticity is 1.

```verify
k = 40; px = 30; py = 1.5; M = 900
x = M/(px + k*py)
y = k*x
assert abs(x - 10) < 0.000001
assert abs(y - 400) < 0.000001
assert abs(px*x + py*y - M) < 0.000001
# no waste: 40x = y, and a bundle that wastes fuel is worse
assert abs(40*x - y) < 0.000001
assert min(40*9, (M - px*9)/py) < min(40*x, y)
# fuel rises to 2.25
x2 = M/(px + k*2.25)
assert abs(x2 - 7.5) < 0.000001
assert abs(k*x2 - 300) < 0.000001
# doubling every price and income leaves demand unchanged
assert abs(2*M/(2*px + k*2*py) - x) < 0.000001
# elasticities
cross = -k*py/(px + k*py)
own = -px/(px + k*py)
assert abs(cross - (-2/3)) < 0.000001
assert abs(own - (-1/3)) < 0.000001
assert abs(own + cross + 1) < 0.000001
# numerical check of the cross-price elasticity
h = 0.000001
assert abs((M/(px + k*py*(1 + h)) - x)/x/h - cross) < 0.0001
```

### Example 2 (medium): a household's food demand with Cobb–Douglas utility
A household's utility from food $x$ and other goods $y$ is $U = x^{0.3}y^{0.7}$. Its income is 2000 a month, food costs 4 a unit and other goods 10. Find the demand for food, its three elasticities, the effect of a 10 % rise in the food price, and the Engel curve.

1. $x = \dfrac{0.3M}{p_x}$, so $x^* = \dfrac{0.3 \cdot 2000}{4} = 150$; $y^* = \dfrac{0.7 \cdot 2000}{10} = 140$
   *Why:* the Cobb–Douglas demands of MV08: the share 0.3 of income goes on food, whatever prices and income are.
2. $\dfrac{\partial x}{\partial p_x} = -\dfrac{0.3M}{p_x^2} = -37.5$, so $\varepsilon_x = -37.5 \cdot \dfrac{4}{150} = -1$
   *Why:* multiply the slope by price over quantity (C107). With $x = 0.3M\,p_x^{-1}$ the power of $p_x$ is the elasticity, so it is −1 at every price.
3. $\eta_x = \dfrac{0.3}{p_x}\cdot\dfrac{M}{x} = 0.075 \cdot \dfrac{2000}{150} = 1$ and $\varepsilon_{xy} = 0$
   *Why:* $p_y$ does not appear in $x$, so the cross-price elasticity is 0; $-1 + 0 + 1 = 0$, as homogeneity requires.
4. At $p_x = 4.4$: $x = \dfrac{600}{4.4} = 136.36$, a fall of 9.09 %, while spending on food stays $4.4 \cdot 136.36 = 600$
   *Why:* with unit elasticity, quantity falls in the same proportion as the price rises, so spending is unchanged. This is the restriction built into Cobb–Douglas.
5. Engel curve: $x = 0.075M$, so at $M = 3000$ the household buys 225; the food share stays at 30 % at every income
   *Why:* a straight line through the origin means $\eta = 1$. Household surveys find that the food share falls as income rises, so Cobb–Douglas is a convenient first model, not a realistic one.

```verify
s = 0.3; M = 2000; px = 4; py = 10
x = s*M/px
y = (1 - s)*M/py
assert abs(x - 150) < 0.000001
assert abs(y - 140) < 0.000001
assert abs(px*x + py*y - M) < 0.000001
dxdp = -s*M/px^2
assert abs(dxdp + 37.5) < 0.000001
eps = dxdp*px/x
assert abs(eps + 1) < 0.000001
eta = (s/px)*M/x
assert abs(eta - 1) < 0.000001
assert abs(s/px - 0.075) < 0.000001
# a 10 % price rise
x2 = s*M/(1.1*px)
assert abs(x2 - 136.36) < 0.01
assert abs(100*(x2 - x)/x + 9.09) < 0.01
assert abs(1.1*px*x2 - 600) < 0.000001
# Engel curve
assert abs(0.075*3000 - 225) < 0.000001
assert abs(px*(s*3000/px)/3000 - 0.3) < 0.000001
# homogeneity: double every price and income
assert abs(s*(2*M)/(2*px) - x) < 0.000001
```

### Example 3 (hard): substitution and income effects of a food price rise
A household has $U = xy$, where $x$ is food and $y$ other goods, income 360 and $p_y = 1$. The price of food rises from 4 to 9. Split the change in food demand into the substitution and income effects.

1. $x_0 = \dfrac{360}{2 \cdot 4} = 45$, $y_0 = \dfrac{360}{2} = 180$, $U_0 = 45 \cdot 180 = 8{,}100$
   *Why:* with $U = xy$ half of income goes on each good (MV08).
2. $x_1 = \dfrac{360}{2 \cdot 9} = 20$, so the total change is $20 - 45 = -25$
   *Why:* the new choice at the new price and the same income.
3. $V = \dfrac{M^2}{4p_xp_y}$, so $\dfrac{M_c^2}{4 \cdot 9 \cdot 1} = 8{,}100$ gives $M_c = 540$
   *Why:* the indirect utility function tells us how much income is needed at the new price to reach the old utility; the household would need 180 more.
4. $h = \dfrac{540}{2 \cdot 9} = 30$ (with $y = 270$, and $30 \cdot 270 = 8{,}100$)
   *Why:* this is the compensated choice: new relative prices, old utility. The Hicksian formula $\sqrt{U_0\,p_y/p_x} = \sqrt{8{,}100/9} = 30$ gives the same.
5. Substitution effect $h - x_0 = 30 - 45 = -15$; income effect $x_1 - h = 20 - 30 = -10$; total $-25$
   *Why:* three fifths of the fall comes from food becoming dearer relative to other goods, two fifths from the household becoming poorer. Food is a normal good here, so both parts are negative.

```verify
M = 360; py = 1; p0 = 4; p1 = 9
x0 = M/(2*p0)
y0 = M/(2*py)
U0 = x0*y0
assert x0 == 45
assert y0 == 180
assert U0 == 8100
x1 = M/(2*p1)
assert x1 == 20
assert x1 - x0 == -25
# income needed for the old utility at the new price, from V = M^2/(4 px py)
Mc = sqrt(4*p1*py*U0)
assert abs(Mc - 540) < 0.000001
assert abs(Mc - M - 180) < 0.000001
hx = Mc/(2*p1)
hy = Mc/(2*py)
assert abs(hx - 30) < 0.000001
assert abs(hy - 270) < 0.000001
assert abs(hx*hy - U0) < 0.000001
assert abs(sqrt(U0*py/p1) - hx) < 0.000001
# it is the cheapest bundle on the old indifference curve
assert p1*29 + py*U0/29 > Mc
assert p1*31 + py*U0/31 > Mc
sub = hx - x0
inc = x1 - hx
assert abs(sub + 15) < 0.000001
assert abs(inc + 10) < 0.000001
assert abs(sub + inc - (x1 - x0)) < 0.000001
```

## Common mistakes
- Dividing all of income by the price of $x$ for perfect complements, as if no $y$ were needed (ALL_ON_ONE_GOOD).
- Using the Cobb–Douglas half-and-half split for $\min(ax, by)$ (HALF_BUDGET_SPLIT).
- Writing $y = \tfrac{b}{a}x$ at the kink of $\min(ax, by)$ instead of $y = \tfrac{a}{b}x$ (INVERTED_PROPORTION).
- Buying one $y$ per $x$ whatever the coefficients in the min (ONE_FOR_ONE).
- Giving the total change $x_1 - x_0$ when the question asks for one of its two parts (TOTAL_NOT_SPLIT).
- Calling the move from $h$ to $x_1$ the substitution effect (SWAPPED_EFFECTS).
- Reporting the compensated quantity $h$ or the new quantity $x_1$ instead of a change (GAVE_NEW_QUANTITY).
- Writing a fall in demand as a positive number (EFFECT_SIGN).
- Assuming every demand function has own-price elasticity −1 and cross-price elasticity 0 (COBB_DOUGLAS_ELASTICITY).
- Dropping the minus sign of a price elasticity for complements (ELASTICITY_SIGN).
- Giving the cross-price elasticity when the own-price one was asked for, or the other way round (SWAPPED_ELASTICITY).
- Multiplying the slope by $x/p$ instead of $p/x$ (INVERTED_ELASTICITY).
- Setting MRS equal to the price ratio for perfect complements or perfect substitutes: their best bundles are at a kink or a corner, not at a tangency.
- Thinking demand is homogeneous of degree 1: doubling all prices and income leaves demand unchanged; it does not double or halve it.

## Practice
- `perfect-complements-demand` (difficulty 1): the quantity of one good bought with $U = \min(ax, by)$; distractors ALL_ON_ONE_GOOD, HALF_BUDGET_SPLIT, INVERTED_PROPORTION, ONE_FOR_ONE.
- `slutsky-substitution-income-effect` (difficulty 2): the substitution or the income effect of a change in the food price for $U = xy$, keeping utility at its original level; distractors TOTAL_NOT_SPLIT, SWAPPED_EFFECTS, GAVE_NEW_QUANTITY, EFFECT_SIGN.
- `complements-price-elasticity` (difficulty 3): the own-price or cross-price elasticity of demand for $x$ with $U = \min(ax, by)$; distractors COBB_DOUGLAS_ELASTICITY, ELASTICITY_SIGN, SWAPPED_ELASTICITY, INVERTED_ELASTICITY.

## Real world
- Food and poverty: statistics offices collect household budget surveys, and in almost every country the share of income spent on food falls as income rises (Engel's law). Governments use the estimated income and price elasticities to judge how a food price shock hits poorer households, and how large a cash transfer would compensate them.
- Cost-of-living indices: a consumer price index that prices a fixed basket ignores the substitution effect, since households switch away from goods that became dearer, so it slightly overstates the rise in the cost of living (see ST106 for index numbers).
- Fuel and cars: because cars and fuel are complements, a lasting rise in fuel prices lowers demand for large cars and raises demand for small and electric ones; transport ministries use cross-price elasticities to forecast these shifts.
- Policy models: tax and subsidy reforms are simulated with demand systems that are more flexible than Cobb–Douglas, so that elasticities can differ between goods and change with income; Cobb–Douglas and CES remain the standard first step in teaching and in large economy-wide models.

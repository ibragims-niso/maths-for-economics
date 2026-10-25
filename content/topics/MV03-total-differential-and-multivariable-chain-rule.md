---
id: MV03
title: Total differential and multivariable chain rule
block: MV
coreYear: 2
prerequisites: [MV02, C104]
estMinutes: 45
status: draft
economicUses:
  - The change in output when capital and labour change together
  - "Growth accounting: output growth from the growth of productivity, capital and labour"
  - How fast cost, revenue or utility changes along a time path of several variables
  - "Comparative statics: how an equilibrium or a level curve responds to a small shock"
searchTerms:
  - "Total differential of a multivariable function"
  - "Total increment"
syllabusHeadings:
  - "Total differential of a function of several variables"
generators: [total-differential-output-change, cobb-douglas-output-growth-rate, chain-rule-two-output-cost]
widgets: [total-differential-isoquants]
mistakeCodes:
  ONE_INPUT_ONLY:
    label: Counted only one input's effect
    explanation: When both inputs change, output changes through both of them. Add the two effects, dQ = MP_K·dK + MP_L·dL; a partial derivative alone holds the other input fixed.
  EXACT_CHANGE:
    label: Worked out the exact change instead of the estimate
    explanation: The question asks for the total differential, which uses the marginal products at the starting point. Recomputing output at the new point gives the true change; it is close for small moves but it is not the estimate that was asked for.
  SWAPPED_CHANGES:
    label: Paired each marginal product with the wrong change
    explanation: Each input's marginal product multiplies that input's own change, MP_K with dK and MP_L with dL. Multiplying MP_K by dL mixes up the two inputs.
  FORGOT_EXPONENTS:
    label: Left out the exponents
    explanation: In Y = A·K^α·L^β the growth rates of K and L are weighted by their exponents, g_Y = g_A + α·g_K + β·g_L. Adding the growth rates without weights overstates the effect of the inputs.
  SWAPPED_SHARES:
    label: Swapped the exponents
    explanation: Capital's growth rate is multiplied by capital's exponent α and labour's by labour's exponent β. Check which exponent sits on which input before you substitute.
  FORGOT_TFP:
    label: Left out productivity growth
    explanation: A is a factor of Y like K and L, with exponent 1, so its growth rate adds one for one, g_Y = g_A + α·g_K + β·g_L.
  TOTAL_NOT_PER_WORKER:
    label: Gave total output growth, not growth per worker
    explanation: The growth rate of output per worker is the growth rate of Y minus that of L. Subtract employment growth as the last step.
  FORGOT_PATH:
    label: Left out one path
    explanation: Time changes z through x and through y, so dz/dt = f_x·x′(t) + f_y·y′(t). Keeping only one of the two terms treats the other variable as fixed, which it is not.
  MULTIPLIED_PARTIALS:
    label: Multiplied the two partial derivatives
    explanation: The chain rule adds the paths; it does not multiply f_x by f_y. Each partial derivative is multiplied by the rate of change of its own variable, and the products are added.
  NO_INNER_DERIVATIVES:
    label: Forgot the rates dx/dt and dy/dt
    explanation: f_x + f_y is how fast z changes when x and y each rise by 1. Along a time path they change at rates x′(t) and y′(t), so each partial derivative must be multiplied by its rate.
  LEVEL_CURVE_SIGN:
    label: Lost the minus sign in the slope of a level curve
    explanation: Setting dz = f_x·dx + f_y·dy = 0 gives dy/dx = −f_x/f_y. When both partial derivatives are positive the level curve slopes downwards, so the minus sign must stay.
resources:
  - { title: "Calculus Volume 3, 4.4 Tangent Planes and Linear Approximations (OpenStax)", url: "https://openstax.org/books/calculus-volume-3/pages/4-4-tangent-planes-and-linear-approximations", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Calculus Volume 3, 4.5 The Chain Rule (OpenStax)", url: "https://openstax.org/books/calculus-volume-3/pages/4-5-the-chain-rule", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Multivariable Calculus, Session 32: Total Differentials and the Chain Rule (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/18-02sc-multivariable-calculus-fall-2010/pages/2.-partial-derivatives/part-b-chain-rule-gradient-and-directional-derivatives/session-32-total-differentials-and-the-chain-rule/", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
In real life several things change at once. A firm buys two more machines and lets one worker go: does output rise or fall, and by how much? A shop raises its price and sells fewer units: what happens to revenue? A government statistician sees the prices of food, energy and rent all move in the same month: how much more does the typical basket cost? Each partial derivative of MV02 answers a "one thing changes" question. The **total differential** adds these answers up to give the effect of changing everything together, and the **multivariable chain rule** does the same when the variables move over time. Together they are the main tool of *comparative statics*: working out how an economic outcome responds when its causes shift.

## Intuition
Think of a function of two variables as a hill, as in MV01 and MV02. Take a small step that moves you $dx$ to the east and $dy$ to the north. Over a short step the hill is almost a flat, tilted plane, so the height changes by

(slope going east) × (distance east) + (slope going north) × (distance north),

that is, $f_x\,dx + f_y\,dy$. Each variable contributes its own marginal effect times its own change, and the contributions add up.

Revenue shows why this is only an approximation. With $R = PQ$, at price 20 and quantity 500 revenue is $10{,}000$. Suppose the price rises by 0.5 and sales fall by 10. The two separate effects are $Q\,\Delta P = 500 \times 0.5 = 250$ (dearer units) and $P\,\Delta Q = 20 \times (-10) = -200$ (fewer units), so revenue rises by about 50. The true new revenue is $20.5 \times 490 = 10{,}045$, a rise of 45. The difference, $\Delta P \cdot \Delta Q = -5$, is the small corner where the two changes overlap. It is a product of two small changes, so it shrinks much faster than the changes themselves: halve both and it falls to a quarter.

Time paths work the same way. If consumption of two goods grows over time, utility changes for two reasons at once, because of more of the first good and because of more of the second. The rate of change of utility is the sum of the two effects, each one a marginal utility times the speed at which that good grows. This is the chain rule of C104 with two links instead of one.

## Definition and formulas
::syllabus[Total differential]

**The total differential.** For $z = f(x, y)$ with small changes $dx$ and $dy$,
$$dz = f_x\,dx + f_y\,dy = \frac{\partial f}{\partial x}\,dx + \frac{\partial f}{\partial y}\,dy.$$
With more variables, add one term per variable: $dz = f_{x_1}dx_1 + \dots + f_{x_n}dx_n$. This extends the differential $dy = f'(x)\,dx$ of C111.

**Linear approximation and its error.** The true change $\Delta z = f(x + \Delta x, y + \Delta y) - f(x, y)$ is approximately the total differential:
$$\Delta z \approx f_x\,\Delta x + f_y\,\Delta y,$$
with the partial derivatives taken at the starting point. The error comes from the second derivatives (compare the quadratic approximation of C111):
$$\Delta z - dz \approx \tfrac{1}{2}\left(f_{xx}\,\Delta x^2 + 2f_{xy}\,\Delta x\,\Delta y + f_{yy}\,\Delta y^2\right).$$
So the error grows like the square of the step: double both changes and the error roughly quadruples. For a production function, $\Delta Q \approx MP_K\,\Delta K + MP_L\,\Delta L$.

::syllabus[Higher-order differentials]

**Second-order differential.** The bracket above is the **second differential** of $z$,
$$d^2z = f_{xx}\,dx^2 + 2f_{xy}\,dx\,dy + f_{yy}\,dy^2,$$
the differential of the differential when $dx$ and $dy$ are held fixed. Higher differentials $d^3z, \dots$ are built the same way from third and higher partial derivatives. The sign of $d^2z$ for all small steps decides whether a point where $dz = 0$ is a maximum ($d^2z < 0$) or a minimum ($d^2z > 0$); MV07 turns this into a test on the Hessian matrix.

**The chain rule along a time path.** If $x = x(t)$ and $y = y(t)$, then $z(t) = f(x(t), y(t))$ changes at the rate
$$\frac{dz}{dt} = f_x\,\frac{dx}{dt} + f_y\,\frac{dy}{dt}.$$
Each path, $t \to x \to z$ and $t \to y \to z$, contributes the product of its two rates, and the paths add up. It is the total differential divided by $dt$.

**Two underlying variables.** If $x = x(s, t)$ and $y = y(s, t)$, the same rule holds for each of $s$ and $t$, with partial derivatives throughout:
$$\frac{\partial z}{\partial s} = f_x\,\frac{\partial x}{\partial s} + f_y\,\frac{\partial y}{\partial s}, \qquad \frac{\partial z}{\partial t} = f_x\,\frac{\partial x}{\partial t} + f_y\,\frac{\partial y}{\partial t}.$$
For example, if a household's purchases $x$ and $y$ of two goods depend on its income $s$ and on a tax rate $t$, these formulas give how its utility $U(x, y)$ responds to a change in income and to a change in the tax.

**Growth-rate form for Cobb–Douglas.** For $Y = A K^{\alpha} L^{\beta}$ the partial derivatives are $Y_A = Y/A$, $Y_K = \alpha Y/K$ and $Y_L = \beta Y/L$ (MV02). Put them into the total differential and divide by $Y$:
$$\frac{dY}{Y} = \frac{dA}{A} + \alpha\,\frac{dK}{K} + \beta\,\frac{dL}{L}, \qquad\text{that is}\qquad g_Y = g_A + \alpha\,g_K + \beta\,g_L.$$
Output grows at productivity growth plus each input's growth weighted by its exponent. This is the growth-accounting formula of C105, now derived from the total differential. Output per worker grows at $g_Y - g_L$.

**A basket of prices.** A fixed basket with quantities $q_1, \dots, q_n$ costs $C = p_1q_1 + \dots + p_nq_n$, so $dC = q_1\,dp_1 + \dots + q_n\,dp_n$. Dividing by $C$,
$$\frac{dC}{C} = s_1\,\frac{dp_1}{p_1} + \dots + s_n\,\frac{dp_n}{p_n}, \qquad s_i = \frac{p_iq_i}{C},$$
so the basket's inflation is the average of the price changes weighted by budget shares. If food is 40 % of the basket and rises 5 %, and energy is 60 % and rises 10 %, the basket costs $0.4 \times 5 + 0.6 \times 10 = 8\%$ more. Because $C$ is linear in prices, this is exact for a fixed basket (see ST106 for price indices).

**Comparative statics along a level curve.** Along a level curve $f(x, y) = c$ the value does not change, so $dz = 0$:
$$f_x\,dx + f_y\,dy = 0 \quad\Longrightarrow\quad \frac{dy}{dx} = -\frac{f_x}{f_y}.$$
This is the slope of an isoquant or indifference curve found in C110, now in one line. For $Q = 10K^{0.5}L^{0.5}$ at $K = 16$, $L = 25$ (Example 1), $dL/dK = -6.25/4 = -1.5625$: two extra machines replace about 3.1 workers with output unchanged. When this rule is used to define $y$ as a function of $x$, it is the implicit function theorem (MV05).

**Shifting a market equilibrium.** Let demand depend on price and income, $Q = D(P, Y)$, and supply on price, $Q = S(P)$. If income changes, the equilibrium must stay on both curves, so the total differentials agree: $D_P\,dP + D_Y\,dY = S_P\,dP$. Solving,
$$\frac{dP}{dY} = \frac{D_Y}{S_P - D_P}.$$
For $Q = 100 - 2P + 0.5Y$ and $Q = 3P - 20$, $dP/dY = 0.5/(3 + 2) = 0.1$: each extra unit of income raises the equilibrium price by 0.1. Compare the direct calculation in F05.

## Interactive
::widget{id="total-differential-isoquants"}

The firm has $Q = 10K^{0.5}L^{0.5}$ and starts at $K = 16$ machines and $L = 25$ workers, as in Example 1. Move the **Change in machines ΔK** and **Change in workers ΔL** sliders. The top graph follows output along the move: the green curve is the true output, the gold dashed line is the total-differential estimate, and the lilac gap at the end is the error. The bottom graph shows the move on the input map, with the isoquant actually reached (green) and the one the estimate predicts (gold dashed). The panel shows the exact change, the estimate and the error. At the start, ΔK = 2 and ΔL = −1, it shows exact ΔQ 7.85, estimate dQ 8.5 and error −0.65. Halve the move to ΔK = 1, ΔL = −0.5 and the error drops to −0.17, about a quarter; double it to ΔK = 4, ΔL = −2 and the error is −2.52, about four times larger. At ΔK = 8, ΔL = −10 the estimate even gets the sign wrong: it predicts a rise of 10, but output falls by 10.26.

## Worked examples

### Example 1 (easy): more machines, one worker fewer
A firm produces $Q = 10K^{0.5}L^{0.5}$ with $K = 16$ machines and $L = 25$ workers. It plans to add 2 machines and let 1 worker go. Estimate the change in output with the total differential, and compare with the exact change.

1. $Q = 10 \cdot 16^{0.5} \cdot 25^{0.5} = 10 \cdot 4 \cdot 5 = 200$
   *Why:* output at the starting point is needed for the marginal products in the form exponent × Q ÷ input.
2. $MP_K = 0.5 \cdot \dfrac{200}{16} = 6.25, \qquad MP_L = 0.5 \cdot \dfrac{200}{25} = 4$
   *Why:* these are the partial derivatives of MV02, each holding the other input fixed.
3. $dQ = MP_K\,dK + MP_L\,dL = 6.25 \cdot 2 + 4 \cdot (-1) = 12.5 - 4 = 8.5$
   *Why:* the two machines add about 12.5 units, the lost worker costs about 4, and the effects add up.
4. $\Delta Q = 10\sqrt{18 \cdot 24} - 200 = 10\sqrt{432} - 200 \approx 207.85 - 200 = 7.85$
   *Why:* the exact change uses the new inputs directly. The error, $7.85 - 8.5 = -0.65$, is small next to output of 200.
5. With half the move ($dK = 1$, $dL = -0.5$): $dQ = 4.25$ and $\Delta Q \approx 4.08$, an error of about $-0.17$
   *Why:* halving the step cut the error to about a quarter. The error comes from the curvature of the hill, and it shrinks like the square of the step.

```verify
Q(K, L) = 10*K^0.5*L^0.5
K0 = 16; L0 = 25
Q0 = Q(K0, L0)
assert Q0 == 200
MPK = 0.5*Q0/K0
MPL = 0.5*Q0/L0
assert MPK == 6.25
assert MPL == 4
dQ = MPK*2 + MPL*(-1)
assert dQ == 8.5
exact = Q(18, 24) - Q0
assert abs(exact - 7.85) < 0.005
assert abs(10*sqrt(432) - 207.85) < 0.005
assert abs((exact - dQ) - (-0.65)) < 0.005
half = MPK*1 + MPL*(-0.5)
assert half == 4.25
exactHalf = Q(17, 24.5) - Q0
assert abs(exactHalf - 4.08) < 0.005
assert abs((exactHalf - half) - (-0.17)) < 0.005
ratio = (exact - dQ)/(exactHalf - half)
assert ratio > 3.5 and ratio < 4.5
# the isoquant slope quoted in the formulas section
assert -MPK/MPL == -1.5625
assert abs(-MPK/MPL*2 - (-3.125)) < 1e-12
```

### Example 2 (medium): cost along a production plan
A bakery makes $x$ trays of bread and $y$ trays of cakes a week, at a weekly cost of $C(x, y) = 200 + 2x^2 + xy + y^2$. Its plan is $x = 20 + 2t$ and $y = 10 + t^2$, where $t$ is time in months. How fast is the weekly cost rising at $t = 3$?

1. $x(3) = 20 + 6 = 26, \qquad y(3) = 10 + 9 = 19$
   *Why:* the marginal costs must be evaluated where the bakery actually is at $t = 3$.
2. $C_x = 4x + y = 4 \cdot 26 + 19 = 123, \qquad C_y = x + 2y = 26 + 38 = 64$
   *Why:* the partial derivatives are the marginal costs of bread and cakes; the cross term $xy$ gives $y$ to $C_x$ and $x$ to $C_y$.
3. $\dfrac{dx}{dt} = 2, \qquad \dfrac{dy}{dt} = 2t = 6$
   *Why:* these are the speeds at which the plan increases each output at $t = 3$.
4. $\dfrac{dC}{dt} = C_x\,\dfrac{dx}{dt} + C_y\,\dfrac{dy}{dt} = 123 \cdot 2 + 64 \cdot 6 = 246 + 384 = 630$
   *Why:* time raises cost through bread (246) and through cakes (384); the two paths add up. Weekly cost is rising by about 630 per month.
5. Check: substitute first, $C(t) = 200 + 2(20 + 2t)^2 + (20 + 2t)(10 + t^2) + (10 + t^2)^2$, and differentiate in $t$; the value at $t = 3$ is again 630.
   *Why:* the chain rule gives the same answer as substituting and using one-variable rules, but it shows where the increase comes from and needs no expanding.

```verify
C(x, y) = 200 + 2*x^2 + x*y + y^2
xt(t) = 20 + 2*t
yt(t) = 10 + t^2
x3 = xt(3); y3 = yt(3)
assert x3 == 26 and y3 == 19
Cx = 4*x3 + y3
Cy = x3 + 2*y3
assert Cx == 123 and Cy == 64
rate = Cx*2 + Cy*(2*3)
assert rate == 630
# substitute the plan first and differentiate numerically in t
c(t) = C(xt(t), yt(t))
h = 0.000001
assert abs((c(3 + h) - c(3 - h))/(2*h) - 630) < 0.001
```

### Example 3 (hard): growth accounting and holding output fixed
An economy produces $Y = AK^{0.3}L^{0.7}$. Productivity $A$ grows by 1.5 % a year, the capital stock by 4 % and employment by 1 % (small, instantaneous rates). Find the growth rate of output and of output per worker. Then find how fast employment could fall, with the same growth of $A$ and $K$, while output stays constant.

1. $dY = \dfrac{Y}{A}\,dA + 0.3\,\dfrac{Y}{K}\,dK + 0.7\,\dfrac{Y}{L}\,dL$
   *Why:* the total differential with three variables; the partial derivatives of a Cobb–Douglas function are exponent × Y ÷ variable.
2. $\dfrac{dY}{Y} = \dfrac{dA}{A} + 0.3\,\dfrac{dK}{K} + 0.7\,\dfrac{dL}{L}$
   *Why:* dividing by $Y$ turns every term into an exponent times a growth rate.
3. $g_Y = 1.5 + 0.3 \cdot 4 + 0.7 \cdot 1 = 1.5 + 1.2 + 0.7 = 3.4\%$
   *Why:* productivity contributes 1.5 points, capital 1.2 and labour 0.7.
4. $g_{Y/L} = g_Y - g_L = 3.4 - 1 = 2.4\%$
   *Why:* the growth rate of a ratio is the growth of the top minus the growth of the bottom (C105).
5. $0 = 1.5 + 1.2 + 0.7\,g_L \;\Rightarrow\; g_L = -\dfrac{2.7}{0.7} \approx -3.86\%$
   *Why:* constant output means $dY = 0$, the comparative-statics idea of a level curve. Productivity and capital growth would let the economy produce the same output with about 3.86 % fewer workers each year.

```verify
a = 0.3; b = 0.7
gA = 1.5; gK = 4; gL = 1
gY = gA + a*gK + b*gL
assert abs(gY - 3.4) < 1e-12
assert abs(a*gK - 1.2) < 1e-12
assert abs(b*gL - 0.7) < 1e-12
assert abs((gY - gL) - 2.4) < 1e-12
gLfix = -(gA + a*gK)/b
assert abs(gLfix - (-3.857142857)) < 1e-6
# a different route: let A, K, L grow exponentially and differentiate ln Y in time
Yt(t) = (2*exp(gA/100*t))*(50*exp(gK/100*t))^a*(30*exp(gL/100*t))^b
h = 0.0001
assert abs((log(Yt(h)) - log(Yt(-h)))/(2*h)*100 - 3.4) < 1e-6
Yfix(t) = (2*exp(gA/100*t))*(50*exp(gK/100*t))^a*(30*exp(gLfix/100*t))^b
assert abs((log(Yfix(h)) - log(Yfix(-h)))/(2*h)) < 1e-9
```

## Common mistakes
- Adding only one input's effect, for example $MP_K\,dK$, when both inputs change (ONE_INPUT_ONLY).
- Recomputing output at the new point when the question asks for the total-differential estimate; the two agree only approximately (EXACT_CHANGE).
- Multiplying $MP_K$ by the change in labour and $MP_L$ by the change in capital (SWAPPED_CHANGES).
- Trusting the estimate for large changes. The error grows like the square of the step; in the Try it graph, $\Delta K = 8$, $\Delta L = -10$ even gets the sign wrong.
- Adding the growth rates of capital and labour without their exponents (FORGOT_EXPONENTS).
- Weighting capital's growth by labour's exponent and the other way round (SWAPPED_SHARES).
- Leaving out the growth of productivity $A$, which adds one for one (FORGOT_TFP).
- Giving the growth of total output when the growth of output per worker was asked (TOTAL_NOT_PER_WORKER).
- Using only one path in the chain rule, $f_x\,x'(t)$ or $f_y\,y'(t)$, instead of their sum (FORGOT_PATH).
- Multiplying the partial derivatives together, $f_x \cdot f_y$, instead of pairing each with its own rate (MULTIPLIED_PARTIALS).
- Adding $f_x + f_y$ without the rates $dx/dt$ and $dy/dt$ (NO_INNER_DERIVATIVES).
- Writing the slope of a level curve as $f_x/f_y$ instead of $-f_x/f_y$ (LEVEL_CURVE_SIGN).
- Evaluating the partial derivatives at $t = 0$ or at the wrong bundle instead of at the point where the variables are at that moment.

## Practice
- `total-differential-output-change` (difficulty 1): estimate the change in output of $Q = AK^{\alpha}L^{\beta}$ when the firm changes both machines and workers, $dQ = MP_K\,dK + MP_L\,dL$; distractors ONE_INPUT_ONLY, EXACT_CHANGE, SWAPPED_CHANGES.
- `cobb-douglas-output-growth-rate` (difficulty 2): the growth rate of output, or of output per worker, from the growth rates of $A$, $K$ and $L$; distractors FORGOT_EXPONENTS, SWAPPED_SHARES, FORGOT_TFP, TOTAL_NOT_PER_WORKER.
- `chain-rule-two-output-cost` (difficulty 3): $dC/dt$ for a two-product cost $C(x, y)$ when both outputs follow time paths; distractors FORGOT_PATH, MULTIPLIED_PARTIALS, NO_INNER_DERIVATIVES.

## Real world
- Growth accounting: statistical offices and researchers split GDP growth into the contributions of capital, labour and productivity with $g_Y = g_A + \alpha g_K + (1 - \alpha) g_L$, using capital's share of national income for $\alpha$. The productivity term is what is left over, often called the Solow residual.
- Consumer price inflation: a price index such as the CPI weights the price change of each item by its share in household spending, which is exactly the total differential of the cost of a fixed basket. This is why a large rise in energy prices moves inflation more than an equal rise in the price of a small item.
- Comparative statics in policy work: to predict how a tax, a subsidy or an income change shifts prices and quantities, economists take the total differential of every equation of a model and solve for the changes, as in the market example above. Large policy models do the same with hundreds of equations.
- Revenue planning: a firm that raises its price expects to sell less. The approximation $dR \approx Q\,dP + P\,dQ$ splits the revenue change into the gain on units still sold and the loss from units no longer sold, which is how pricing decisions are often presented to managers.

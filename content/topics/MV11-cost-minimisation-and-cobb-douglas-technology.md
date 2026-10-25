---
id: MV11
title: Cost minimisation and Cobb–Douglas technology
block: MV
coreYear: 2
prerequisites: [MV08, MV04]
estMinutes: 45
status: draft
economicUses:
  - How many workers and machines a firm hires for a given output
  - Why firms automate when wages rise relative to the cost of machines
  - Economies and diseconomies of scale and the shape of average cost
  - Estimating cost functions for regulated industries such as electricity and water
  - Labour's share of costs and of national income
searchTerms:
  - "Cost minimization"
  - "Conditional factor demand"
generators: [cost-function-output-scaling, cobb-douglas-conditional-labour, cobb-douglas-minimum-cost]
widgets: [cobb-douglas-cost-min]
mistakeCodes:
  CRS_ASSUMED:
    label: Assumed cost grows in proportion to output
    explanation: Cost rises in proportion to output only under constant returns to scale. For Q = A·K^α·L^β the minimum cost grows like Q^(1/(α + β)), so with decreasing returns it grows faster than output and with increasing returns more slowly.
  DEGREE_NOT_INVERTED:
    label: Used the power α + β instead of 1/(α + β)
    explanation: The production function is homogeneous of degree α + β in the inputs, but the cost function is homogeneous of degree 1/(α + β) in output. To make t times as much the firm needs inputs t^(1/(α + β)) times as large.
  PRICES_IGNORED:
    label: Forgot that input prices changed
    explanation: When every input price is multiplied by θ, the cheapest mix of inputs stays the same and the bill is multiplied by θ. The cost function is homogeneous of degree 1 in input prices, so apply this factor as well.
  INVERTED_PRICE_RATIO:
    label: Turned the price ratio upside down
    explanation: The cost-minimising condition is MP_L/MP_K = w/r, the wage over the rental price, which gives K/L = αw/(βr). Writing r/w instead makes the firm use more of the dearer input.
  EQUAL_EXPONENTS:
    label: Ignored the exponents in the tangency
    explanation: K/L = w/r holds only when α = β. For Q = A·K^α·L^β the MRTS is (β/α)·(K/L), so capital per worker is K/L = αw/(βr).
  SWAPPED_EXPONENTS:
    label: Swapped the exponents of capital and labour
    explanation: The marginal product of labour carries β, the exponent of L, and that of capital carries α. MP_L/MP_K = βK/(αL); swapping them gives K/L = βw/(αr), which is wrong unless α = β.
  FORGOT_COEFFICIENT:
    label: Forgot the constant A
    explanation: Output is A·K^α·L^β, so the target equation is A·K^α·L^β = Q̄. Divide Q̄ by A before taking roots.
  EQUAL_INPUTS:
    label: Used equal amounts of both inputs
    explanation: Equal amounts of capital and labour are cheapest only when αw = βr. In general the firm uses K/L = αw/(βr), more of the input that is cheaper or more productive.
  LABOUR_COST_ONLY:
    label: Counted only the wage bill
    explanation: Total cost is wL + rK. The wage bill wL is only the share β/(α + β) of it; add the cost of capital rK.
  TOTAL_NOT_AVERAGE:
    label: Gave total cost instead of average cost
    explanation: Average cost is cost per unit, C/Q̄. After finding the minimum total cost, divide it by the output.
resources:
  - { title: "Principles of Economics 3e, 7.4 Production in the Long Run (OpenStax)", url: "https://openstax.org/books/principles-economics-3e/pages/7-4-production-in-the-long-run", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Principles of Economics 3e, 7.5 Costs in the Long Run (OpenStax)", url: "https://openstax.org/books/principles-economics-3e/pages/7-5-costs-in-the-long-run", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "MIT 14.01SC Principles of Microeconomics, Productivity and Costs (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/14-01sc-principles-of-microeconomics-fall-2011/pages/unit-3-producer-theory/productivity-and-costs/", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
A factory has signed a contract for 1,000 units a day. It can make them with many workers and few machines, or with few workers and many machines. Which mix is cheapest depends on the wage, the price of machine time and the technology. When wages rise, the answer shifts: the firm uses more machines per worker, which is the economics of automation. The cheapest cost of each output level, the **cost function**, also tells the firm whether getting bigger makes each unit cheaper (economies of scale) or dearer. Supply curves, the theory of competitive markets and the regulation of utilities all start from this cost function.

## Intuition
Draw the firm's **isoquant** for the target output: every mix of capital and labour that makes exactly $\bar Q$ units (MV01). Now draw **isocost lines**: all mixes with the same total cost $wL + rK$. They are parallel straight lines, and lines further from the origin cost more. Slide an isocost line towards the origin until it only just touches the isoquant. That touching point is the cheapest way to make $\bar Q$: the isoquant is tangent to the isocost line, so the rate at which the technology lets you swap machines for workers (the MRTS) equals the rate at which the market lets you swap them ($w/r$). This is the cost-minimising condition of MV08.

If the wage rises, the isocost lines become steeper, and the touching point slides along the isoquant towards more machines and fewer workers. If the target rises, the isoquant moves out and the touching point moves out with it. For a Cobb–Douglas technology these points all lie on one straight ray from the origin, the **expansion path**, because the best ratio $K/L$ depends only on prices.

Returns to scale (MV04) decide the shape of costs. If doubling both inputs doubles output, doubling output doubles cost, and the cost per unit stays the same. If doubling inputs less than doubles output, each extra unit needs more than its share of inputs, and the cost per unit rises. If doubling inputs more than doubles output, the cost per unit falls as the firm grows: economies of scale.

## Definition and formulas
**The problem.** Minimise $C = wL + rK$ subject to $A K^\alpha L^\beta = \bar Q$, with $A, \alpha, \beta > 0$. Write $s = \alpha + \beta$ for the degree of homogeneity (the returns to scale).

**Tangency.** With $MP_L = \beta Q/L$ and $MP_K = \alpha Q/K$,
$$MRTS = \frac{MP_L}{MP_K} = \frac{\beta K}{\alpha L} = \frac{w}{r} \quad\Longrightarrow\quad \frac{K}{L} = \frac{\alpha w}{\beta r}.$$
This is the **expansion path**: a ray through the origin with slope $\alpha w/(\beta r)$.

**Conditional factor demands.** Put $K = \frac{\alpha w}{\beta r}L$ into the target and solve:
$$L^*(w, r, \bar Q) = \left(\frac{\bar Q}{A}\right)^{1/s}\left(\frac{\beta r}{\alpha w}\right)^{\alpha/s}, \qquad K^*(w, r, \bar Q) = \left(\frac{\bar Q}{A}\right)^{1/s}\left(\frac{\alpha w}{\beta r}\right)^{\beta/s}.$$
"Conditional" means: given that output $\bar Q$ must be produced.

**Cost shares.** At the optimum $wL^*/(rK^*) = \beta/\alpha$, so labour gets the share $\beta/(\alpha+\beta)$ of total cost and capital the share $\alpha/(\alpha+\beta)$, whatever the prices.

**The cost function.** $C(w, r, Q) = wL^* + rK^*$ works out as
$$C(w, r, Q) = s\left(\frac{Q}{A}\right)^{1/s}\left(\frac{w}{\beta}\right)^{\beta/s}\left(\frac{r}{\alpha}\right)^{\alpha/s}.$$
Its properties:
- Homogeneous of degree 1 in prices: $C(\theta w, \theta r, Q) = \theta\, C(w, r, Q)$. Doubling all input prices leaves the best mix unchanged and doubles the bill.
- Homogeneous of degree $1/s$ in output: $C(w, r, tQ) = t^{1/s} C(w, r, Q)$.
- Increasing in $w$, $r$ and $Q$.

**Marginal and average cost.** Since $C$ is a constant times $Q^{1/s}$,
$$MC = \frac{\partial C}{\partial Q} = \frac{C}{sQ} = \frac{AC}{s}, \qquad AC = \frac{C}{Q} \propto Q^{1/s - 1}.$$
The multiplier $\lambda$ of the Lagrangian equals $MC$ (MV09).

$$\begin{array}{lll} \text{returns to scale} & \text{average cost} & MC \text{ vs } AC \\ \hline s = 1 \text{ (constant)} & \text{flat} & MC = AC \\ s < 1 \text{ (decreasing)} & \text{rising} & MC > AC \\ s > 1 \text{ (increasing)} & \text{falling: economies of scale} & MC < AC \end{array}$$

**Price responses.** $L^*$ is proportional to $w^{-\alpha/s}$ and $K^*$ to $w^{\beta/s}$, so the elasticity of conditional labour demand with respect to the wage is $-\alpha/(\alpha+\beta)$: a 1 % wage rise cuts labour by about $\alpha/(\alpha+\beta)$ % and raises capital by about $\beta/(\alpha+\beta)$ % at the same output.

**Short run.** If capital is fixed at $\bar K$, the firm has no choice: labour must satisfy $A\bar K^\alpha L^\beta = \bar Q$, so $L_{SR} = \big(\bar Q/(A\bar K^\alpha)\big)^{1/\beta}$ and the short-run cost is $wL_{SR} + r\bar K$. It is never below the long-run cost $C(w, r, \bar Q)$, and the two are equal only at the output for which $\bar K$ is the best amount of capital.

## Interactive
::widget{id="cobb-douglas-cost-min"}

The factory of Example 1 makes $Q = 5K^{1/3}L^{2/3}$ and pays 1 per machine-hour. Move the **Wage w per worker-hour** and **Output target Q̄** sliders. The dot is where the green isocost line touches the lilac isoquant, and the gold dashed ray is the expansion path. The panel shows the workers $L^*$, the machines $K^*$ and the minimum cost. Check: at the start ($w = 16$, $\bar Q = 1000$) it shows $L^* = 100$, $K^* = 800$ and a minimum cost of 2,400. Raise $\bar Q$ to 1,500: the dot slides out along the ray to 150 and 1,200, and the cost becomes 3,600, still 2.4 per unit. Now set $\bar Q$ back to 1,000 and raise the wage to 20: the ray turns steeper, $L^*$ falls to 92.83, $K^*$ rises to 928.32, and the cost is 2,784.95 (Example 3).

## Worked examples

### Example 1 (easy): the cheapest mix for a factory
A factory makes $Q = 5K^{1/3}L^{2/3}$ units a day from $K$ machine-hours and $L$ worker-hours. A worker-hour costs $w = 16$ and a machine-hour $r = 1$. Find the cheapest way to make $\bar Q = 1000$ units, the minimum cost and the average cost.

1. $MRTS = \dfrac{MP_L}{MP_K} = \dfrac{\tfrac23 \cdot 5K^{1/3}L^{-1/3}}{\tfrac13 \cdot 5K^{-2/3}L^{2/3}} = \dfrac{2K}{L}$
   *Why:* the MRTS is the ratio of marginal products; the powers simplify to $K/L$ times $\beta/\alpha = 2$.
2. $\dfrac{2K}{L} = \dfrac{16}{1}$, so $K = 8L$
   *Why:* at the cheapest point the isoquant is tangent to an isocost line, so $MRTS = w/r$. This is the expansion path.
3. $5(8L)^{1/3}L^{2/3} = 5 \cdot 2 \cdot L = 10L = 1000$, so $L^* = 100$ and $K^* = 800$
   *Why:* $8^{1/3} = 2$, and the powers of $L$ add up to $\alpha + \beta = 1$.
4. $C = 16 \cdot 100 + 1 \cdot 800 = 2400$ and $AC = 2400/1000 = 2.4$
   *Why:* labour costs 1,600, which is $\tfrac23$ of 2,400, the share $\beta/(\alpha + \beta)$. With constant returns the cost per unit is the same at every output, and it equals $\lambda = w/MP_L = 16 \big/ \tfrac{20}{3} = 2.4$, the marginal cost (MV09).

```verify
A = 5; al = 1/3; be = 2/3; w = 16; r = 1; Q = 1000
ratio = al*w/(be*r)
assert abs(ratio - 8) < 0.000001
L = Q/(A*ratio^al)
K = ratio*L
assert abs(L - 100) < 0.000001
assert abs(K - 800) < 0.000001
assert abs(A*K^al*L^be - Q) < 0.000001
# MRTS = MP_L / MP_K equals w/r
MPL = be*A*K^al*L^(be - 1)
MPK = al*A*K^(al - 1)*L^be
assert abs(MPL/MPK - w/r) < 0.000001
C = w*L + r*K
assert abs(C - 2400) < 0.000001
assert abs(w*L/C - 2/3) < 0.000001
assert abs(C/Q - 2.4) < 0.000001
assert abs(MPL - 20/3) < 0.000001
assert abs(w/MPL - 2.4) < 0.000001
# a neighbour on the isoquant costs more
K2 = (Q/(A*110^be))^(1/al)
assert w*110 + r*K2 > C
# equal inputs (L = K = 200) would cost 3400
assert abs((w + r)*Q/A - 3400) < 0.000001
```

### Example 2 (medium): the cost function under decreasing returns
A workshop has $Q = 2K^{1/4}L^{1/4}$, $w = 4$ and $r = 1$. Find $L^*$, $K^*$ and the cost function $C(Q)$, then describe average and marginal cost.

1. $\dfrac{MP_L}{MP_K} = \dfrac{\beta K}{\alpha L} = \dfrac{K}{L} = \dfrac{4}{1}$, so $K = 4L$
   *Why:* with $\alpha = \beta$ the exponents cancel, and the firm uses four machine units per worker because labour costs four times as much.
2. $2(4L)^{1/4}L^{1/4} = 2\sqrt2\,L^{1/2} = Q$, so $L^* = \dfrac{Q^2}{8}$ and $K^* = \dfrac{Q^2}{2}$
   *Why:* $4^{1/4} = \sqrt2$; squaring both sides gives $8L = Q^2$. The formula $L^* = (Q/A)^{1/s}(\beta r/(\alpha w))^{\alpha/s}$ with $s = \tfrac12$ gives the same.
3. $C(Q) = 4 \cdot \dfrac{Q^2}{8} + \dfrac{Q^2}{2} = Q^2$
   *Why:* the general formula $s(Q/A)^{1/s}(w/\beta)^{\beta/s}(r/\alpha)^{\alpha/s} = \tfrac12 \cdot \tfrac{Q^2}{4} \cdot 4 \cdot 2$ agrees. Cost is homogeneous of degree $1/s = 2$ in output.
4. $AC = \dfrac{C}{Q} = Q$ and $MC = 2Q$: at $Q = 10$, $C = 100$, $AC = 10$, $MC = 20$; at $Q = 20$, $C = 400$, $AC = 20$
   *Why:* decreasing returns ($s = \tfrac12$) mean doubling output multiplies cost by $2^{1/s} = 4$, so average cost rises, and $MC = AC/s$ lies above it.
5. If both input prices double, $C(Q) = 2Q^2$ and $K/L$ stays 4
   *Why:* the cost function is homogeneous of degree 1 in prices: the best mix depends only on $w/r$, which has not changed.

```verify
A = 2; al = 0.25; be = 0.25; w = 4; r = 1; s = al + be
ratio = al*w/(be*r)
assert ratio == 4
Q = 10
L = (Q/A)^(1/s)*(be*r/(al*w))^(al/s)
K = ratio*L
assert abs(L - Q^2/8) < 0.000001
assert abs(K - Q^2/2) < 0.000001
assert abs(A*K^al*L^be - Q) < 0.000001
C = w*L + r*K
assert abs(C - 100) < 0.000001
cost(x, ww, rr) = s*(x/A)^(1/s)*(ww/be)^(be/s)*(rr/al)^(al/s)
assert abs(cost(10, w, r) - C) < 0.000001
assert abs(cost(20, w, r) - 400) < 0.000001
assert abs(cost(20, w, r)/20 - 20) < 0.000001
# marginal cost 2Q by a numerical derivative at Q = 10
h = 0.0001
MC = (cost(10 + h, w, r) - cost(10 - h, w, r))/(2*h)
assert abs(MC - 20) < 0.0001
assert abs(MC - (C/Q)/s) < 0.0001
# doubling both prices doubles cost
assert abs(cost(10, 2*w, 2*r) - 200) < 0.000001
```

### Example 3 (hard): a wage rise, automation and the short run
The factory of Example 1 still makes 1,000 units, but the wage rises by 25 %, from 16 to 20. Find the new cheapest mix and cost, compare the change in labour with the elasticity rule, and compare with the short run in which the 800 machine-hours cannot be changed.

1. $\dfrac{2K}{L} = \dfrac{20}{1}$, so $K = 10L$
   *Why:* the dearer the labour, the more machine-hours per worker-hour the firm chooses: the expansion path turns steeper.
2. $5(10L)^{1/3}L^{2/3} = 1000$, so $L^* = \dfrac{200}{10^{1/3}} = 92.83$ and $K^* = 928.32$
   *Why:* the same target, now reached with a more capital-intensive mix.
3. $C = 20L^* + 10L^* = 30L^* = \dfrac{6000}{10^{1/3}} = 2784.95$, a rise of $1.25^{2/3} - 1 = 16.04\%$
   *Why:* $C$ is proportional to $w^{\beta/s} = w^{2/3}$. The bill rises by less than the 25 % wage rise because the firm substitutes machines for workers.
4. $L^*$ changes by $1.25^{-1/3} - 1 = -7.17\%$; the elasticity rule gives $-\tfrac13 \times 25\% = -8.33\%$
   *Why:* the elasticity of conditional labour demand is $-\alpha/(\alpha + \beta) = -\tfrac13$. It is exact for small changes; for a 25 % rise the linear rule overstates the fall a little.
5. Short run: with $K = 800$ fixed, $L$ must stay 100, so the cost is $20 \cdot 100 + 800 = 2800 > 2784.95$
   *Why:* when machines cannot be added, the firm cannot substitute, so it pays the full wage rise on its old labour. The gap of about 15 a day is the saving that makes automation worth while in the long run.

```verify
A = 5; al = 1/3; be = 2/3; r = 1; Q = 1000; w0 = 16; w1 = 20
ratio = al*w1/(be*r)
assert abs(ratio - 10) < 0.000001
L = Q/(A*ratio^al)
K = ratio*L
assert abs(L - 92.83) < 0.005
assert abs(K - 928.32) < 0.005
assert abs(A*K^al*L^be - Q) < 0.000001
C1 = w1*L + r*K
assert abs(C1 - 30*L) < 0.000001
assert abs(C1 - 6000/10^(1/3)) < 0.000001
assert abs(C1 - 2784.95) < 0.005
C0 = 2400
assert abs((C1/C0 - 1)*100 - 16.04) < 0.005
assert abs(C1/C0 - 1.25^(2/3)) < 0.000001
assert abs((L/100 - 1)*100 - (-7.17)) < 0.005
assert abs(-al/(al + be)*25 - (-8.33)) < 0.005
# short run: K stays 800, so L stays 100
LSR = (Q/(A*800^al))^(1/be)
assert abs(LSR - 100) < 0.000001
CSR = w1*LSR + r*800
assert CSR == 2800
assert CSR > C1
assert abs(CSR - C1 - 15.05) < 0.005
```

## Common mistakes
- Writing $MP_L/MP_K = r/w$, which makes the firm use more of the dearer input (INVERTED_PRICE_RATIO).
- Setting $K/L = w/r$ for every Cobb–Douglas technology, forgetting the factor $\alpha/\beta$ (EQUAL_EXPONENTS).
- Giving labour the exponent of capital in the marginal products (SWAPPED_EXPONENTS).
- Solving $K^\alpha L^\beta = \bar Q$ when output is $A K^\alpha L^\beta$ (FORGOT_COEFFICIENT).
- Using equal amounts of capital and labour whatever the prices (EQUAL_INPUTS).
- Reporting the wage bill $wL^*$ as the total cost (LABOUR_COST_ONLY).
- Giving the total cost when the question asks for cost per unit (TOTAL_NOT_AVERAGE).
- Scaling cost in proportion to output when returns to scale are not constant (CRS_ASSUMED).
- Raising the output ratio to the power $\alpha + \beta$ instead of $1/(\alpha + \beta)$ (DEGREE_NOT_INVERTED).
- Forgetting to multiply the cost by $\theta$ when all input prices rise by the same factor (PRICES_IGNORED).
- Treating capital as variable in a short-run question: when $K$ is fixed there is no tangency to use; the target alone fixes $L$.

## Practice
- `cost-function-output-scaling` (difficulty 1): the minimum cost of a new output level, perhaps after all input prices rise, using $C \propto Q^{1/(\alpha+\beta)}$; distractors CRS_ASSUMED, DEGREE_NOT_INVERTED, PRICES_IGNORED.
- `cobb-douglas-conditional-labour` (difficulty 2): the cost-minimising number of workers $L^*$ for $Q = AK^\alpha L^\beta$, given $w$, $r$ and $\bar Q$; distractors INVERTED_PRICE_RATIO, EQUAL_EXPONENTS, SWAPPED_EXPONENTS, FORGOT_COEFFICIENT.
- `cobb-douglas-minimum-cost` (difficulty 3): the minimum total cost, or the average cost, of an output target; distractors EQUAL_INPUTS, LABOUR_COST_ONLY, INVERTED_PRICE_RATIO, TOTAL_NOT_AVERAGE.

## Real world
- Automation: when wages rise faster than the cost of machines and software, the tangency $MRTS = w/r$ predicts more capital per worker. Warehouses, car plants and supermarkets with self-service tills follow this pattern, and it is one reason why rich, high-wage economies use more capital per worker.
- Economies of scale: power networks, water supply and railways have large fixed networks and increasing returns over a wide range, so average cost falls with output. This is the classic reason they are run as regulated monopolies, and regulators estimate their cost functions to set prices.
- Estimating technology: economists fit log-linear cost functions to firm data. The coefficient on $\log Q$ estimates $1/(\alpha + \beta)$, so it shows directly whether an industry has economies of scale.
- Labour's share: with Cobb–Douglas technology labour's share of costs equals $\beta/(\alpha + \beta)$ whatever the wage. National labour shares were roughly stable for decades, which made Cobb–Douglas popular in growth models; their fall in many countries since the 1980s is now studied as evidence that the technology is not exactly Cobb–Douglas.

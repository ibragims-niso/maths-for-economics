---
id: MV04
title: Homogeneous functions and Euler's theorem
block: MV
coreYear: 2
prerequisites: [MV02]
estMinutes: 45
status: draft
economicUses:
  - Returns to scale in manufacturing, utilities and farming
  - "Labour's share of national income: why it equals the labour exponent in a Cobb–Douglas economy"
  - "Product exhaustion: when paying every input its marginal product uses up exactly the whole output"
  - "No money illusion: demand is unchanged when all prices and income double"
  - Growth models in which output per worker depends only on capital per worker
searchTerms:
  - "Euler's theorem"
  - "Returns to scale"
  - "Homogeneous function"
generators: [scaled-inputs-output, constant-returns-wage-bill, euler-marginal-product-labour]
widgets: [euler-returns-to-scale]
mistakeCodes:
  CRS_ASSUMED:
    label: Assumed constant returns to scale
    explanation: Multiplying the inputs by t multiplies output by t only when the degree is 1. In general output is multiplied by t^k, where k is the degree of homogeneity, for a Cobb–Douglas k = α + β.
  MULTIPLIED_EXPONENTS:
    label: Multiplied the exponents instead of adding them
    explanation: (tK)^α·(tL)^β = t^α·t^β·K^α·L^β, and powers of the same base multiply by adding their exponents. The degree is α + β, not α × β.
  ONE_INPUT_SCALED:
    label: Scaled only one input
    explanation: Returns to scale ask what happens when every input is multiplied by the same factor. Raising only labour by t multiplies output by t^β; raising both multiplies it by t^(α+β).
  ADDED_ALL_EXPONENTS:
    label: Added the exponents of every term
    explanation: For a sum of terms, each term must have the same degree, and that common degree is the degree of the function. Adding the exponents of all terms together counts the degree twice.
  FORGOT_DEGREE:
    label: Used Euler's theorem as if k = 1
    explanation: For a function homogeneous of degree k, Euler's theorem is K·MP_K + L·MP_L = k·Q. The right-hand side is Q itself only under constant returns to scale.
  OUTPUT_PER_WORKER:
    label: Gave output per worker
    explanation: Q/L is the average product of labour. The marginal product is what one more worker adds; Euler's theorem gives it as (k·Q − K·MP_K)/L.
  MP_NOT_WEIGHTED:
    label: Did not multiply the marginal product by its input
    explanation: In Euler's theorem each marginal product is weighted by the amount of its input, K·MP_K, because every machine is paid MP_K. Subtracting MP_K alone treats the firm as if it had one machine.
  LABOUR_PAYMENT_GIVEN:
    label: Gave labour's total instead of the marginal product
    explanation: k·Q − K·MP_K is L·MP_L, the total for all workers together. Divide by the number of workers L to get the marginal product of one worker.
  WRONG_SHARE:
    label: Used capital's exponent for labour's share
    explanation: In Q = A·K^α·L^β the exponent on L, β, is labour's share of output. Capital's exponent α is capital's share.
  WAGE_NOT_BILL:
    label: Gave the wage of one worker
    explanation: The wage w = P·MP_L is what one worker earns. The wage bill is what all workers earn together, w·L.
  FORGOT_PRICE:
    label: Forgot the price of output
    explanation: L·MP_L is labour's share counted in units of output. To turn it into money, multiply by the price P of each unit.
  REVENUE_NOT_SHARE:
    label: Gave the whole revenue
    explanation: Under constant returns the inputs together receive all the revenue P·Q, but labour receives only the share β of it; capital receives the rest.
resources:
  - { title: "Principles of Microeconomics, Lecture Summary 05: Production (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/14-01-principles-of-microeconomics-fall-2023/resources/mit14_01_f23_lec5_pdf/", kind: course, verifiedAt: 2026-10-18 }
  - { title: "Principles of Economics 3e, 7.5 Costs in the Long Run (OpenStax)", url: "https://openstax.org/books/principles-economics-3e/pages/7-5-costs-in-the-long-run", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
A car maker plans to build a second, identical plant. Will it get twice the cars, more than twice, or less? The answer, called returns to scale, decides whether big firms have a cost advantage, whether an industry ends up with one giant firm or many small ones, and whether competition can survive at all. The same mathematics answers two other big questions. Who gets what share of national income, workers or the owners of capital? And why does a consumer buy exactly the same basket when every price and her income all double? All three are statements about **homogeneous functions**: functions that respond to scaling all their inputs in a simple, predictable way.

## Intuition
Imagine photocopying a factory: the same machines, the same workers, the same layout, built again next door. Two identical factories should make twice as much as one. That is **constant returns to scale**: double every input and output doubles. Real technologies can do better or worse:

- **Increasing returns**: a bigger plant allows more specialised workers and machines, and a pipe or tank twice as wide holds four times as much. Doubling all inputs more than doubles output.
- **Decreasing returns**: a bigger firm is harder to manage, or uses a resource that cannot be copied, such as a good location. Doubling all inputs less than doubles output.

A homogeneous function turns this into one number. Scale every input by a factor $t$ and output is scaled by $t^k$; the number $k$, the degree, tells you which case you are in.

Euler's theorem is about sharing. Suppose each machine and each worker is paid what it adds to output, its marginal product. Do the payments add up to the whole output? With constant returns, exactly: there is nothing left over and nothing missing. With increasing returns the payments add up to more than the output, and with decreasing returns to less.

## Definition and formulas
**Homogeneous function.** A function $f(x, y)$ is **homogeneous of degree $k$** if, for every $t > 0$ and all positive $x, y$,
$$f(tx, ty) = t^k\, f(x, y).$$
To check: replace each variable by $t$ times itself and try to take out a power of $t$.

- **Cobb–Douglas:** $Q = AK^{\alpha}L^{\beta}$ gives $A(tK)^{\alpha}(tL)^{\beta} = t^{\alpha + \beta}\,AK^{\alpha}L^{\beta}$, so it is homogeneous of degree $k = \alpha + \beta$.
- **A sum** is homogeneous only if every term has the same degree. $Q = 3K^{0.5}L^{0.5} + 2K$ has two terms of degree $0.5 + 0.5 = 1$ and $1$, so it is homogeneous of degree 1. But $Q = K^{0.5}L^{0.5} + 10$ is not homogeneous at all: the constant 10 does not grow with $t$.
- **Ratios** of variables are homogeneous of degree 0: $p_x / p_y$ does not change when both prices double.

**Returns to scale.** For a production function homogeneous of degree $k$:

$$
\begin{array}{lll}
\text{Degree} & \text{Doubling all inputs multiplies output by} & \text{Returns to scale} \\ \hline
k > 1 & 2^k > 2 & \text{increasing} \\
k = 1 & 2 & \text{constant} \\
k < 1 & 2^k < 2 & \text{decreasing}
\end{array}
$$

A useful consequence: if a firm produces $Q_0$ now, after scaling all inputs by $t$ it produces $t^k Q_0$, whatever its current $K$ and $L$ are.

**Euler's theorem.** If $f(x, y)$ is homogeneous of degree $k$, then at every point
$$x\,f_x(x, y) + y\,f_y(x, y) = k\,f(x, y).$$
For production, $K \cdot MP_K + L \cdot MP_L = k\,Q$. One way to see it: differentiate both sides of $f(tx, ty) = t^k f(x, y)$ with respect to $t$ (the left side with the two-variable chain rule of MV03), giving $x f_x(tx, ty) + y f_y(tx, ty) = k t^{k-1} f(x, y)$, and then set $t = 1$. For a Cobb–Douglas function you can see it directly from MV02: $K \cdot MP_K = \alpha Q$ and $L \cdot MP_L = \beta Q$, which add up to $(\alpha + \beta)Q$. For $Q = 3K^{0.5}L^{0.5} + 2K$: $K \cdot Q_K = 1.5K^{0.5}L^{0.5} + 2K$ and $L \cdot Q_L = 1.5K^{0.5}L^{0.5}$, which add up to $Q$, as it should for degree 1.

**Product exhaustion.** In a competitive market each input is paid the value of its marginal product: the wage is $w = P \cdot MP_L$ and the rental rate of capital is $r = P \cdot MP_K$. Total payments are
$$wL + rK = P\,(L \cdot MP_L + K \cdot MP_K) = k\,PQ.$$
With constant returns ($k = 1$) the payments use up the whole revenue $PQ$ exactly and profit is zero. With $k > 1$ they would exceed revenue, so the firm cannot pay every input its marginal product without a loss. With $k < 1$ a part $(1 - k)PQ$ is left over as profit.

**Factor shares.** For a Cobb–Douglas function with $\alpha + \beta = 1$, labour's share of output is
$$\frac{L \cdot MP_L}{Q} = \beta, \qquad \text{and capital's share is } \frac{K \cdot MP_K}{Q} = \alpha.$$
So the exponents are the shares of income going to each input, whatever the amounts of $K$ and $L$.

**Partial derivatives are homogeneous of degree $k - 1$.** Differentiate $f(tx, ty) = t^k f(x, y)$ with respect to $x$: $t\,f_x(tx, ty) = t^k f_x(x, y)$, so
$$f_x(tx, ty) = t^{k-1} f_x(x, y).$$
Under constant returns ($k = 1$) the marginal products are homogeneous of degree 0: doubling both inputs leaves them unchanged, so they depend only on the ratio $K/L$. For example, with $\alpha + \beta = 1$, $MP_L = \beta A K^{\alpha}L^{-\alpha} = \beta A\,(K/L)^{\alpha}$. Workers are more productive when each has more capital to work with, not when the firm is merely bigger.

**Homothetic functions.** For any degree $k$, the slope of an isoquant, $MP_K / MP_L$, is a ratio of two functions of degree $k - 1$, so it is homogeneous of degree 0: it is the same at every point of a ray $L = mK$ from the origin. The isoquants are enlarged copies of each other. Functions with this property are called **homothetic**; they include all homogeneous functions and also increasing transformations of them, such as $Q = \ln(KL)$, which is not homogeneous. With a homothetic technology and fixed input prices, a firm that grows keeps the same mix $K/L$, so its expansion path is a straight line from the origin (cost minimisation itself is MV11).

**Demand is homogeneous of degree 0.** A consumer's demand $x(p_x, p_y, M)$ depends on prices and income. Doubling every price and income leaves the budget line $p_x x + p_y y = M$ exactly where it was, so the chosen basket does not change:
$$x(tp_x, tp_y, tM) = x(p_x, p_y, M).$$
Economists say there is **no money illusion**. For example, a consumer who always spends 40 % of income on food buys $x = 0.4M/p_x$; with $M = 1000$ and $p_x = 5$ she buys 80 units, and with $M = 2000$ and $p_x = 10$ still 80. Euler's theorem with $k = 0$, divided by $x$, gives a check on estimated demand: the own-price, cross-price and income elasticities (C107, MV02) add up to zero. Here they are $-1$, $0$ and $1$.

## Interactive
::widget{id="euler-returns-to-scale"}

The graph follows $Q = K^a L^b$ along the ray where both inputs equal $t$, starting from $K = L = 1$ (the hollow dot). Move the **Capital exponent a** and **Labour exponent b** sliders to change the technology and the **Scale t** slider to grow the firm. The lilac curve is output, the dashed green line is what output would be if it grew in proportion to $t$, and the bar at $t$ stacks what capital (green) and labour (gold) earn when each is paid its marginal product; the solid dot is the output. The panel shows $a + b$, the output ratio $Q(t, t) \div Q(1, 1) = t^{a+b}$ and the share of output paid out. At the start, $a = 0.25$, $b = 0.75$ (the exponents of Example 2) and $t = 2$, the panel shows 1, 2 and 100 % of Q: the curve is the dashed line and the bar ends exactly at the dot. Lower $b$ to 0.5: the panel shows 0.75, 1.68 and 75 % of Q, and the bar stops below the dot. Now set both exponents to 0.8: it shows 1.6, 3.03 and 160 % of Q, and the bar rises above the dot.

## Worked examples

### Example 1 (easy): returns to scale of a factory
A factory's output is $Q = 4K^{0.3}L^{0.9}$ and it currently produces 500 units. Find the degree of homogeneity, say what kind of returns to scale the factory has, and find its output if it doubles both capital and labour.

1. $Q(tK, tL) = 4(tK)^{0.3}(tL)^{0.9} = t^{0.3}\,t^{0.9} \cdot 4K^{0.3}L^{0.9} = t^{1.2}\,Q(K, L)$
   *Why:* each input brings its own power of $t$, and the powers add: $0.3 + 0.9 = 1.2$.
2. $k = 1.2 > 1$: increasing returns to scale
   *Why:* scaling all inputs by $t$ scales output by more than $t$.
3. $Q_{new} = 2^{1.2} \times 500 = 2.2974 \times 500 = 1148.70$
   *Why:* with $t = 2$ output is multiplied by $2^{1.2}$; you do not need to know $K$ and $L$, only the current output.
4. $1148.70 > 2 \times 500 = 1000$, while doubling labour alone gives $2^{0.9} \times 500 = 933.03$
   *Why:* doubling both inputs more than doubles output. Doubling one input is not a change of scale, and here it adds less than doubling.

```verify
k = 0.3 + 0.9
assert abs(k - 1.2) < 1e-12
f(K, L) = 4*K^0.3*L^0.9
# the ratio is the same at any input mix
assert abs(f(2*7, 2*13)/f(7, 13) - 2^1.2) < 1e-9
assert abs(f(2*50, 2*3)/f(50, 3) - 2^1.2) < 1e-9
assert abs(2^1.2 - 2.2974) < 0.00005
Qnew = 2^1.2*500
assert abs(Qnew - 1148.70) < 0.005
assert Qnew > 1000
assert abs(2^0.9*500 - 933.03) < 0.005
```

### Example 2 (medium): wages and product exhaustion under constant returns
A competitive firm's output is $Q = 10K^{0.25}L^{0.75}$, with $K = 16$ machines and $L = 81$ workers. Output sells at a price of 2 per unit. Find the marginal products, check that paying them uses up exactly the whole output, and find the wage bill and labour's share.

1. $Q = 10 \cdot 16^{0.25} \cdot 81^{0.75} = 10 \cdot 2 \cdot 27 = 540$
   *Why:* $16^{0.25} = 2$ and $81^{0.75} = 3^3 = 27$. The exponents add up to 1, so returns to scale are constant.
2. $MP_K = 0.25 \cdot \dfrac{540}{16} = 8.4375, \qquad MP_L = 0.75 \cdot \dfrac{540}{81} = 5$
   *Why:* for a Cobb–Douglas function each marginal product is its exponent times the average product (MV02).
3. $K \cdot MP_K + L \cdot MP_L = 16 \times 8.4375 + 81 \times 5 = 135 + 405 = 540 = Q$
   *Why:* Euler's theorem with $k = 1$: paying every input its marginal product exhausts the product.
4. $w = P \cdot MP_L = 2 \times 5 = 10$, wage bill $wL = 10 \times 81 = 810 = 0.75 \times (2 \times 540)$
   *Why:* labour receives the share $\beta = 0.75$ of revenue 1080, and capital the other $0.25$, which is 270.
5. At $K = 32$, $L = 162$: $Q = 1080$ and $MP_L = 0.75 \cdot \dfrac{1080}{162} = 5$
   *Why:* doubling both inputs doubles output but leaves the marginal product unchanged, because under constant returns it depends only on $K/L$.

```verify
A = 10; a = 0.25; b = 0.75; K = 16; L = 81; P = 2
f(K, L) = A*K^a*L^b
Q = f(K, L)
assert abs(Q - 540) < 1e-9
h = 0.000001
MPK = (f(K + h, L) - f(K - h, L))/(2*h)
MPL = (f(K, L + h) - f(K, L - h))/(2*h)
assert abs(MPK - 8.4375) < 1e-5
assert abs(MPL - 5) < 1e-5
assert abs(K*MPK - 135) < 1e-4
assert abs(L*MPL - 405) < 1e-4
assert abs(K*MPK + L*MPL - Q) < 1e-4
w = P*MPL
assert abs(w - 10) < 1e-4
assert abs(w*L - 810) < 1e-3
assert abs(0.75*P*Q - 810) < 1e-9
assert abs(0.25*P*Q - 270) < 1e-9
assert abs(f(32, 162) - 1080) < 1e-9
MPL2 = (f(32, 162 + h) - f(32, 162 - h))/(2*h)
assert abs(MPL2 - 5) < 1e-5
```

### Example 3 (hard): Euler's theorem with increasing returns
A firm's technology is homogeneous of degree 1.2. With $K = 50$ machines and $L = 200$ workers it produces $Q = 1000$ units, and the marginal product of capital is 6. Find the marginal product of labour, and check whether the firm could pay every input its marginal product out of its output.

1. $50 \times 6 + 200 \cdot MP_L = 1.2 \times 1000 = 1200$
   *Why:* Euler's theorem for degree $k = 1.2$: $K \cdot MP_K + L \cdot MP_L = kQ$.
2. $200 \cdot MP_L = 1200 - 300 = 900$, so $MP_L = 900 / 200 = 4.5$
   *Why:* subtract capital's part and divide by the number of workers.
3. Payments at marginal products: $300 + 900 = 1200 > 1000$, a shortfall of 200
   *Why:* with increasing returns the marginal products add up to $1.2Q$, so paying them would need 20 % more than the firm produces. This is why industries with strong increasing returns, such as power networks, cannot simply price at marginal cost.
4. Check: $\alpha = \dfrac{K \cdot MP_K}{Q} = \dfrac{300}{1000} = 0.3$, $\beta = 1.2 - 0.3 = 0.9$, and $\beta \dfrac{Q}{L} = 0.9 \cdot \dfrac{1000}{200} = 4.5$
   *Why:* a Cobb–Douglas function with these exponents (the ones of Example 1) fits all the data, and its marginal product of labour agrees with Euler's theorem.

```verify
k = 1.2; K = 50; L = 200; Q = 1000; MPK = 6
MPL = (k*Q - K*MPK)/L
assert abs(MPL - 4.5) < 1e-12
assert K*MPK == 300
assert abs(L*MPL - 900) < 1e-9
assert abs(K*MPK + L*MPL - 1200) < 1e-9
assert abs(K*MPK + L*MPL - Q - 200) < 1e-9
# a Cobb–Douglas with these numbers
a = K*MPK/Q
b = k - a
assert abs(a - 0.3) < 1e-12
assert abs(b - 0.9) < 1e-12
A = Q/(K^a*L^b)
f(K, L) = A*K^a*L^b
h = 0.000001
assert abs(f(50, 200) - 1000) < 1e-9
assert abs((f(50 + h, 200) - f(50 - h, 200))/(2*h) - 6) < 1e-5
assert abs((f(50, 200 + h) - f(50, 200 - h))/(2*h) - 4.5) < 1e-5
assert abs(f(100, 400)/f(50, 200) - 2^1.2) < 1e-9
```

## Common mistakes
- Assuming that doubling all inputs always doubles output; that holds only for degree 1 (CRS_ASSUMED).
- Multiplying the exponents of a Cobb–Douglas function, $\alpha \times \beta$, instead of adding them to get the degree (MULTIPLIED_EXPONENTS).
- Scaling only one input and calling the result returns to scale (ONE_INPUT_SCALED).
- Adding the exponents of all the terms of a sum, so that $3K^{0.5}L^{0.5} + 2K$ seems to have degree 2 instead of 1 (ADDED_ALL_EXPONENTS).
- Calling a sum homogeneous when its terms have different degrees, or when it contains a constant such as $+10$; such a function is not homogeneous at all.
- Writing Euler's theorem as $K \cdot MP_K + L \cdot MP_L = Q$ for a function that does not have constant returns (FORGOT_DEGREE).
- Giving output per worker $Q/L$ instead of the marginal product (OUTPUT_PER_WORKER).
- Subtracting $MP_K$ instead of $K \cdot MP_K$ from $kQ$ (MP_NOT_WEIGHTED).
- Stopping at $L \cdot MP_L$, the total for all workers, instead of dividing by $L$ (LABOUR_PAYMENT_GIVEN).
- Using capital's exponent $\alpha$ as labour's share (WRONG_SHARE).
- Giving the wage of one worker instead of the wage bill $wL$ (WAGE_NOT_BILL).
- Leaving out the price, so the wage bill is counted in units of output instead of money (FORGOT_PRICE).
- Giving the whole revenue $PQ$ as the wage bill; labour receives only the share $\beta$ (REVENUE_NOT_SHARE).
- Thinking that a homothetic function must be homogeneous: $\ln(KL)$ has straight-line expansion paths but is not homogeneous.

## Practice
- `scaled-inputs-output` (difficulty 1): the output of a Cobb–Douglas or two-term production function after all inputs are multiplied by $t$, given current output; distractors CRS_ASSUMED, MULTIPLIED_EXPONENTS, ONE_INPUT_SCALED, ADDED_ALL_EXPONENTS.
- `constant-returns-wage-bill` (difficulty 2): the total wage bill of a competitive firm with a constant-returns Cobb–Douglas technology, when each worker is paid $P \times MP_L$; distractors WRONG_SHARE, WAGE_NOT_BILL, FORGOT_PRICE, REVENUE_NOT_SHARE.
- `euler-marginal-product-labour` (difficulty 3): the marginal product of labour from Euler's theorem, given the degree of homogeneity, $K$, $L$, $Q$ and $MP_K$; distractors FORGOT_DEGREE, OUTPUT_PER_WORKER, MP_NOT_WEIGHTED, LABOUR_PAYMENT_GIVEN.

## Real world
- Labour's share of income: national accounts split GDP into pay for workers and income for owners of capital. For decades labour's share in many advanced economies stayed roughly between 60 and 70 %, which is why macroeconomic models often use a Cobb–Douglas technology with $\beta \approx 2/3$; its gradual fall since the 1980s is now a major research and policy topic.
- Growth models: the Solow growth model assumes constant returns, so output per worker depends only on capital per worker $K/L$. This is the "marginal products depend only on the ratio" result, and it is why economies grow richer by adding capital per worker, not just by getting bigger.
- Regulating natural monopolies: electricity grids, water networks and railways have strongly increasing returns. As in Example 3, pricing at marginal cost would not cover total cost, so regulators allow higher prices or pay subsidies.
- Redenominating a currency: when Azerbaijan replaced 5000 old manat by 1 new manat in 2006, every price, wage and bank balance was divided by 5000. Because demand is homogeneous of degree 0 in prices and income, real choices did not change, only the numbers on the price tags.

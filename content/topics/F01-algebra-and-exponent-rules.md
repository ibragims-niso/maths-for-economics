---
id: F01
title: Algebra and exponent rules
block: F
coreYear: 1
prerequisites: []
estMinutes: 45
status: draft
economicUses:
  - Rearranging cost and revenue formulas for a target output or price
  - Cobb–Douglas production functions with fractional exponents
  - Compound growth of GDP, prices and savings over several years
  - Simplifying an economic model before solving it
searchTerms:
  - "Algebra"
  - "Exponent rules"
  - "Powers and roots"
  - "Fractions"
generators: [exponent-laws-simplify, cobb-douglas-output, cobb-douglas-labour-needed]
widgets: [power-explorer]
mistakeCodes:
  POWER_ADDED:
    label: Added the exponents for a power of a power
    explanation: (x³)² means x³ · x³, which has six factors of x, so the exponents multiply. Add exponents only when you multiply two powers of the same base.
  PRODUCT_MULTIPLIED:
    label: Multiplied the exponents when multiplying powers
    explanation: x⁶ · x² = x⁸, because the factors of x simply add up. Multiply exponents only for a power of a power, such as (x⁶)².
  EXPONENTS_DIVIDED:
    label: Divided the exponents when dividing powers
    explanation: x⁶ / x² = x⁴, not x³. Each x in the denominator cancels one x in the numerator, so subtract the exponents.
  QUOTIENT_REVERSED:
    label: Subtracted the exponents the wrong way round
    explanation: For a fraction, take the exponent on top minus the exponent below, so x⁷ / x³ = x⁴. Subtracting the other way gives x⁻⁴, which is 1/x⁴.
  POWER_AS_PRODUCT:
    label: Treated a power as a multiplication
    explanation: K^0.5 is the square root of K, not 0.5 × K. In the same way, to undo the power β raise both sides to the power 1/β; dividing by β does not undo a power.
  EXPONENTS_SWAPPED:
    label: Swapped the exponents of capital and labour
    explanation: In Q = A·K^α·L^β the exponent α belongs to capital K and β to labour L. Match each exponent to its own input before calculating.
  NUMERATOR_IGNORED:
    label: Ignored the top of a fractional exponent
    explanation: The exponent p/q means take the q-th root and then raise to the power p. For example 125^(2/3) = 5² = 25, not just the cube root 5.
  STOPPED_AT_POWER:
    label: Found L^β, not L
    explanation: Isolating L^β is only half the job. Raise both sides to the power 1/β to get L itself, for example L^(1/2) = 15 gives L = 15² = 225.
  WRONG_INVERSE_POWER:
    label: Raised to β instead of 1/β
    explanation: Applying the same power again does not undo it. Because (L^β)^(1/β) = L, raise both sides to the reciprocal power 1/β.
resources:
  - { title: "College Algebra 2e, 1.2 Exponents and Scientific Notation (OpenStax)", url: "https://openstax.org/books/college-algebra-2e/pages/1-2-exponents-and-scientific-notation", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "College Algebra 2e, 1.3 Radicals and Rational Exponents (OpenStax)", url: "https://openstax.org/books/college-algebra-2e/pages/1-3-radicals-and-rational-exponents", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Principles of Economics 3e, Appendix A: The Use of Mathematics in Principles of Economics (OpenStax)", url: "https://openstax.org/books/principles-economics-3e/pages/a-the-use-of-mathematics-in-principles-of-economics", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
Economic models are formulas, and the question usually asks for the "wrong" letter. A workshop knows how its average cost depends on output, but the owner wants the output at which average cost falls to a target. A planner knows how a factory's output depends on machines and workers, but needs to know how many workers to hire. Both answers come from rearranging a formula, and many economic formulas contain powers: production functions with exponents such as 0.3 or 2/3, and growth that compounds year after year.

## Intuition
An exponent counts factors: $x^3 = x \cdot x \cdot x$. Every exponent law is just careful counting. $x^3 \cdot x^2$ has $3 + 2 = 5$ factors of $x$; $(x^3)^2$ is two groups of three, so six; in $x^5 / x^2$ two factors cancel and three are left.

Walking down the list $x^3, x^2, x^1$ divides by $x$ at every step. Carrying on gives $x^0 = 1$ and $x^{-1} = 1/x$, so zero and negative exponents are not new rules, just the same pattern continued. A fractional exponent is the number that rebuilds $x$: because $(x^{1/2})^2 = x^{1/2 + 1/2} = x$, the power $x^{1/2}$ must be the square root of $x$.

Rearranging works like a balance: whatever you do to one side, do to the other, and undo the operations around the unknown in reverse order until it stands alone.

## Definition and formulas
**Order of operations.** Brackets first, then powers, then multiplication and division (left to right), then addition and subtraction (left to right): $2 + 3 \cdot 4^2 = 2 + 48 = 50$. A minus sign in front of a power is applied after the power: $-3^2 = -9$, but $(-3)^2 = 9$.

**Expanding and factorising.**
- $a(b + c) = ab + ac$ and $(a + b)(c + d) = ac + ad + bc + bd$
- $(a + b)^2 = a^2 + 2ab + b^2$ and $(a + b)(a - b) = a^2 - b^2$
- Expanding a revenue formula: with price $P = 50 - 2Q$, revenue is $PQ = (50 - 2Q)Q = 50Q - 2Q^2$.
- Factorising is expanding in reverse: profit $PQ - vQ - F = (P - v)Q - F$.

**Fractions.**
- $\dfrac{a}{b} + \dfrac{c}{d} = \dfrac{ad + bc}{bd}$, $\quad \dfrac{a}{b} \cdot \dfrac{c}{d} = \dfrac{ac}{bd}$, $\quad \dfrac{a/b}{c/d} = \dfrac{ad}{bc}$
- Cancel only common factors: $\dfrac{6Q}{3Q^2} = \dfrac{2}{Q}$, but $\dfrac{Q + 6}{Q} = 1 + \dfrac{6}{Q}$, not $6$.

**Rearranging a formula** for one letter: do the same to both sides. When the unknown appears more than once, clear the fractions, collect the terms that contain it on one side, factorise it out, then divide.

**Exponent laws** for $x, y > 0$ and any exponents $m, n$:
- $x^m \cdot x^n = x^{m+n}$ and $\dfrac{x^m}{x^n} = x^{m-n}$
- $(x^m)^n = x^{mn}$
- $(xy)^n = x^n y^n$ and $\left(\dfrac{x}{y}\right)^n = \dfrac{x^n}{y^n}$
- $x^0 = 1$ and $x^{-n} = \dfrac{1}{x^n}$
- $x^{1/n} = \sqrt[n]{x}$ and $x^{m/n} = \left(\sqrt[n]{x}\right)^m$
- To undo a power: if $y = x^p$, then $x = y^{1/p}$.

**Cobb–Douglas production function:** $Q = AK^{\alpha}L^{\beta}$, where $K$ is capital, $L$ is labour, $A > 0$ measures productivity and the exponents are usually between 0 and 1. Scaling both inputs by $s$ gives $A(sK)^{\alpha}(sL)^{\beta} = s^{\alpha + \beta}\,AK^{\alpha}L^{\beta}$, so when $\alpha + \beta = 1$, doubling both inputs exactly doubles output.

**Growth over several years:** growing by the factor $1 + g$ each year for $t$ years multiplies a quantity by $(1 + g)^t$. Going the other way, a total growth factor $G$ over $t$ years is an average yearly factor of $G^{1/t}$: prices that rise by 21 % over two years have an average yearly factor of $1.21^{1/2} = 1.1$, that is a rise of 10 % a year.

## Interactive
::widget{id="power-explorer"}

Move the **exponent** slider through 0, negative values and fractions such as 1/2, and watch the curve $y = x^p$ change shape. Then move the **input** slider: the panel shows the value of $x^p$. Check the rules for yourself: $p = 0$ always gives 1, $p = -1$ gives $1/x$, and $p = 1/2$ gives $\sqrt{x}$ (at $x = 4$ the panel shows 2). The dashed line is $y = x$, for comparison.

## Worked examples

### Example 1 (easy): simplifying with exponent laws
Write $\dfrac{(K^2)^3 \cdot K^{-1}}{K^3}$ as a single power of $K$, then check the result with $K = 2$.

1. $(K^2)^3 = K^{2 \cdot 3} = K^6$
   *Why:* a power of a power multiplies the exponents: three copies of $K^2$ contain six factors of $K$.
2. $K^6 \cdot K^{-1} = K^{6 + (-1)} = K^5$
   *Why:* multiplying powers of the same base adds the exponents, and the rule works for negative exponents too.
3. $\dfrac{K^5}{K^3} = K^{5 - 3} = K^2$
   *Why:* dividing subtracts the exponent of the denominator, because three factors of $K$ cancel.
4. Check with $K = 2$: $\dfrac{(2^2)^3 \cdot 2^{-1}}{2^3} = \dfrac{64 \cdot 0.5}{8} = 4 = 2^2$
   *Why:* $2^{-1} = \tfrac{1}{2}$; putting in a number is a quick way to catch a slip with the rules.

Had the denominator been $K^5$, the answer would have been $K^{5 - 5} = K^0 = 1$.

```verify
a = 2; b = 3; c = -1; d = 3
assert a*b == 6
assert a*b + c == 5
n = a*b + c - d
assert n == 2
K = 2
assert (K^a)^b == 64
assert (K^a)^b * K^c == 32
assert (K^a)^b * K^c / K^d == 4
assert (K^a)^b * K^c / K^d == K^n
assert abs((3^a)^b * 3^c / 3^d - 3^n) < 1e-9
assert a*b + c - 5 == 0
```

### Example 2 (medium): rearranging an average cost formula
A workshop has fixed costs of 12000 a month and each unit costs 35 to make, so its average cost is $AC = \dfrac{F}{Q} + v$ with $F = 12{,}000$ and $v = 35$. Rearrange the formula for $Q$ and find the monthly output at which average cost falls to 50.

1. $AC \cdot Q = F + vQ$
   *Why:* multiplying both sides by $Q$ clears the fraction, so $Q$ is no longer in a denominator.
2. $AC \cdot Q - vQ = F$
   *Why:* collect every term that contains $Q$ on the left-hand side.
3. $Q\,(AC - v) = F$
   *Why:* factorise, because $Q$ is a common factor of both terms.
4. $Q = \dfrac{F}{AC - v} = \dfrac{12{,}000}{50 - 35} = 800$
   *Why:* divide both sides by $AC - v$, which is allowed because it is not zero.
5. Check: $\dfrac{12{,}000}{800} + 35 = 15 + 35 = 50$
   *Why:* putting the answer back into the original formula confirms the rearrangement.

```verify
F = 12000; v = 35; AC = 50
Q = F/(AC - v)
assert AC - v == 15
assert Q == 800
assert AC*Q == F + v*Q
assert F/Q == 15
assert F/Q + v == AC
```

### Example 3 (hard): Cobb–Douglas output and the labour it needs
A firm's output is $Q = 5K^{1/3}L^{2/3}$, where $K$ is capital and $L$ is labour. Find output when $K = 8$ and $L = 125$. Then, keeping $K = 8$, find how much labour the firm needs to produce 360 units.

1. $8^{1/3} = \sqrt[3]{8} = 2$ and $125^{2/3} = \left(\sqrt[3]{125}\right)^2 = 5^2 = 25$
   *Why:* the exponent $p/q$ means take the $q$-th root, then raise to the power $p$; taking the root first keeps the numbers small.
2. $Q = 5 \cdot 2 \cdot 25 = 250$
   *Why:* output is the productivity factor times the capital term times the labour term.
3. $360 = 5 \cdot 2 \cdot L^{2/3} \;\Rightarrow\; L^{2/3} = \dfrac{360}{10} = 36$
   *Why:* divide both sides by everything that multiplies $L^{2/3}$, so the labour term stands alone.
4. $L = 36^{3/2} = \left(\sqrt{36}\right)^3 = 6^3 = 216$
   *Why:* raising both sides to the power $3/2$ undoes the power $2/3$, because $\tfrac{2}{3} \cdot \tfrac{3}{2} = 1$.
5. Check: $5 \cdot 2 \cdot 216^{2/3} = 10 \cdot 36 = 360$
   *Why:* $\sqrt[3]{216} = 6$ and $6^2 = 36$, so this much labour produces exactly the target.

```verify
A = 5; alpha = 1/3; beta = 2/3
K = 8; L = 125
assert abs(K^alpha - 2) < 1e-9
assert abs(L^beta - 25) < 1e-9
assert abs(A * K^alpha * L^beta - 250) < 1e-9
target = 360
Lterm = target / (A * 2)
assert Lterm == 36
Lneed = Lterm^(1/beta)
assert abs(Lneed - 216) < 1e-9
assert abs(216^(1/3) - 6) < 1e-9
assert abs(A * K^alpha * 216^beta - target) < 1e-9
```

## Common mistakes
- Adding the exponents for a power of a power: $(x^3)^2 = x^5$ instead of $x^6$ (POWER_ADDED).
- Multiplying the exponents when multiplying powers: $x^6 \cdot x^2 = x^{12}$ instead of $x^8$ (PRODUCT_MULTIPLIED).
- Dividing the exponents when dividing powers: $x^6 / x^2 = x^3$ instead of $x^4$ (EXPONENTS_DIVIDED).
- Subtracting the top exponent from the bottom one: $x^7 / x^3 = x^{-4}$ instead of $x^4$ (QUOTIENT_REVERSED).
- Treating a power as multiplication: $K^{0.5} = 0.5K$, or undoing $L^{1/2}$ by dividing by $\tfrac{1}{2}$ (POWER_AS_PRODUCT).
- Giving capital the exponent of labour and labour the exponent of capital (EXPONENTS_SWAPPED).
- Ignoring the top of a fractional exponent: $125^{2/3} = 5$ instead of $25$ (NUMERATOR_IGNORED).
- Stopping at $L^{2/3} = 36$ and giving 36 as the labour needed (STOPPED_AT_POWER).
- Undoing the power $\beta$ by raising to $\beta$ again instead of $1/\beta$ (WRONG_INVERSE_POWER).
- Reading $-3^2$ as $9$: the power comes before the minus sign, so $-3^2 = -9$.
- Expanding $(a + b)^2$ as $a^2 + b^2$: the middle term $2ab$ is missing.
- Cancelling across a plus sign: $\dfrac{Q + 6}{Q}$ is $1 + \dfrac{6}{Q}$, not $6$.
- Thinking $x^{-2}$ is a negative number: it is $\dfrac{1}{x^2}$, which is positive.

## Practice
- `exponent-laws-simplify` (difficulty 1): write $\dfrac{(x^a)^b \cdot x^c}{x^d}$ as a single power $x^n$ and give $n$; distractors POWER_ADDED, PRODUCT_MULTIPLIED, EXPONENTS_DIVIDED, QUOTIENT_REVERSED.
- `cobb-douglas-output` (difficulty 2): output of $Q = AK^{\alpha}L^{\beta}$ with fractional exponents such as $1/3$ or $0.25$; distractors POWER_AS_PRODUCT, EXPONENTS_SWAPPED, NUMERATOR_IGNORED.
- `cobb-douglas-labour-needed` (difficulty 3): rearrange $Q = AK^{\alpha}L^{\beta}$ for the labour needed to reach a target output; distractors STOPPED_AT_POWER, WRONG_INVERSE_POWER, POWER_AS_PRODUCT.

## Real world
- Growth accounting: statistics offices and researchers use Cobb–Douglas production functions to split GDP growth into the parts due to more capital, more workers and higher productivity $A$.
- Average growth rates: when GDP or prices grow by a total factor $G$ over $t$ years, reports quote the average yearly rate $G^{1/t} - 1$, a fractional exponent at work.
- Finance: a deposit $D$ grows to $D(1 + r)^t$ after $t$ years, and an amount $X$ due in $t$ years is worth $X(1 + r)^{-t}$ today; both rely on the exponent laws (see FM01 and FM03).
- Business planning: managers rearrange cost and revenue formulas to find the output, price or sales needed to reach a cost or profit target.

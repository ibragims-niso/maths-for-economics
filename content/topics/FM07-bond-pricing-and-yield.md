---
id: FM07
title: Bond pricing and yield
block: FM
coreYear: 1
prerequisites: [FM04]
estMinutes: 45
status: draft
economicUses:
  - Government borrowing through treasury bills and bonds
  - Pricing company debt in fixed-income markets
  - Reading bond quotes and yields in the financial news
  - Why bond prices fall when central banks raise interest rates
generators: [zero-coupon-bond-yield, bond-price-annual-coupon, bond-price-fall-rate-rise]
widgets: [bond-price-yield]
mistakeCodes:
  COUPON_RATE_USED:
    label: Discounted at the coupon rate
    explanation: The coupon rate only fixes the size of the coupon. Discount at the market yield. Discounting at the coupon rate always gives back the face value, so it hides the premium or discount.
  COUPONS_UNDISCOUNTED:
    label: Discounted the face value but not the coupons
    explanation: Every coupon arrives in the future too, so each must be discounted. Value the coupons as an annuity, C(1 − (1 + y)^(−n))/y, then add the discounted face value.
  FORGOT_FACE:
    label: Left out the face value
    explanation: At maturity the bond repays its face value as well as paying the last coupon. Add F/(1 + y)^n to the value of the coupons.
  UNDISCOUNTED:
    label: Added up the payments without discounting
    explanation: n coupons plus the face value is what the holder receives in total, not what it is worth today. Discount every payment at the market yield.
  SIMPLE_YIELD:
    label: Spread the total return evenly over the years
    explanation: (F − P)/P divided by n ignores compounding, so it overstates the yield. Solve P(1 + y)^n = F instead, which gives y = (F/P)^(1/n) − 1.
  TOTAL_RETURN:
    label: Gave the return over the whole life of the bond
    explanation: (F − P)/P is the growth over all n years together. The yield is a rate per year, so take the n-th root of F/P before subtracting 1.
  RATIO_INVERTED:
    label: Divided the price by the face value
    explanation: The yield makes the price grow into the face value, so the growth factor is F/P, which is above 1. Using P/F gives a negative number, which cannot be the yield of a bond bought below its face value.
  NEW_PRICE_GIVEN:
    label: Gave the new price instead of the fall
    explanation: The question asks for the change in price. Work out the price at the old yield and at the new yield, then subtract.
  ONE_PERCENT_RULE:
    label: Assumed the price falls by 1 %
    explanation: A 1-point rise in the yield does not cut the price by 1 %. Every payment is discounted more, and payments far in the future lose most, so a long bond can lose 7 % or more. Reprice the bond at the new yield.
  FACE_ONLY:
    label: Repriced only the face value
    explanation: The coupons are also discounted at the new, higher yield, so their value falls too. Reprice the whole bond, coupons and face value, at the new yield.
resources:
  - { title: "Principles of Finance, 10.1 Characteristics of Bonds (OpenStax)", url: "https://openstax.org/books/principles-finance/pages/10-1-characteristics-of-bonds", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Principles of Finance, 10.2 Bond Valuation (OpenStax)", url: "https://openstax.org/books/principles-finance/pages/10-2-bond-valuation", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Principles of Finance, 10.4 Risks of Interest Rates and Default (OpenStax)", url: "https://openstax.org/books/principles-finance/pages/10-4-risks-of-interest-rates-and-default", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
Governments borrow by selling bonds. A finance ministry, such as Azerbaijan's Ministry of Finance, sells bonds that promise fixed payments in the future, and investors pay for them today. The price investors are willing to pay tells the government what borrowing costs it. The same bonds are then traded every day, and their prices move whenever interest rates change. When a central bank raises its policy rate, the news soon reports that bond prices fell. This topic explains why: a bond price is a present value, so it must fall when the rate used to discount it rises.

## Intuition
A bond is a loan cut into a tradable piece of paper. The borrower (the **issuer**) promises two things: a fixed payment every year, called the **coupon**, and the repayment of the **face value** on the **maturity** date. Those promises never change after the bond is issued. What changes is what investors want to earn on such a loan, the market **yield**.

The price of a bond is simply the present value of its promised payments, discounted at the market yield (FM03). The coupons are equal payments at the end of each year, so they form an annuity (FM04); the face value is one more payment at the end. Because the payments are fixed, a higher yield means each one is discounted more heavily, and the price falls. Price and yield always move in opposite directions.

Compare the coupon rate with the market yield. If a bond pays 5 % of its face value but investors can earn 6 % elsewhere, nobody pays the full face value for it: it sells at a **discount**, and the buyer makes up the missing return by getting back more than they paid. If the coupon rate is above the market yield, the bond sells at a **premium**. If the two are equal, it sells at **par**, exactly its face value.

## Definition and formulas
A bond with face value $F$, coupon rate $c$ and $n$ years to maturity pays the coupon $C = cF$ at the end of each year and $F$ at the end of year $n$. The **yield to maturity** $y$ is the single discount rate at which the present value of these payments equals the price.

Price of an annual-coupon bond:
$$P = \frac{C}{1 + y} + \frac{C}{(1 + y)^2} + \dots + \frac{C}{(1 + y)^n} + \frac{F}{(1 + y)^n} = C \cdot \frac{1 - (1 + y)^{-n}}{y} + \frac{F}{(1 + y)^n}$$
The first part is the coupons valued as an annuity, the second the discounted face value.

Zero-coupon bond (no coupons, only $F$ at maturity; short-term ones are called treasury bills):
$$P = \frac{F}{(1 + y)^n} \qquad\Longleftrightarrow\qquad y = \left(\frac{F}{P}\right)^{1/n} - 1$$

- **Premium, par, discount**: $P > F$ when $c > y$, $P = F$ when $c = y$, $P < F$ when $c < y$.
- **Current yield** $= \dfrac{C}{P}$, the coupon as a share of today's price. It ignores the gain or loss at maturity, so for a discount bond it lies between the coupon rate and the yield to maturity.
- **Yield of a coupon bond**: there is no formula to solve for $y$. Try a rate, compute the price, and adjust: if the computed price is too high, the rate is too low. Spreadsheets and calculators do this search automatically; the yield to maturity is the internal rate of return of the bond (FM06), and methods such as bisection (NM01) find it to any accuracy.
- **Semi-annual coupons**: many government bonds pay $C/2$ every six months. Then use $2n$ periods and the half-year rate $y/2$: $P = \dfrac{C}{2} \cdot \dfrac{1 - (1 + y/2)^{-2n}}{y/2} + \dfrac{F}{(1 + y/2)^{2n}}$.
- **Consol** (a bond that never matures): the coupons form a perpetuity, so $P = \dfrac{C}{y}$. A consol paying 2.5 a year is worth 62.50 when yields are 4 %.
- **Quotes**: bond prices are usually quoted per 100 of face value, so a quote of 92.64 means the bond costs 92.64 % of its face value.

How strongly a price reacts to the yield depends mainly on maturity: payments far in the future are discounted many times, so long bonds move more. The **duration** of a bond, the average time until its payments weighted by their present values, measures this sensitivity: the price falls by roughly $\dfrac{D}{1 + y}$ per cent for each percentage-point rise in the yield. The price–yield curve is convex, so this straight-line estimate overstates falls and understates rises; C111 shows how duration and convexity come from a Taylor approximation.

## Interactive
::widget{id="bond-price-yield"}

The curve shows the price, per 100 of face value, of a 10-year bond for every market yield; the gold dashed line is par (100). At the start the coupon rate is 5 % and the yield 6 %, and the panel shows a price of 92.64 (the bond of Example 2), a discount, and a current yield of 5.4 %. Move the market yield to 7 %: the price drops to 85.95. Then move it to 5 %: the dot meets the hollow dot on the par line and the price is exactly 100, a rise of 7.36 from the start, more than the fall of 6.69. That gap is the convexity of the curve. Finally, move the coupon rate: the whole curve shifts, and the bond trades at a premium whenever the coupon rate is above the yield.

## Worked examples

### Example 1 (easy): the yield on a zero-coupon government bond
A government sells a 5-year zero-coupon bond that will pay 1000 at maturity and nothing before. Investors pay 747.26 for it today. What yield to maturity does the government pay on this borrowing?

1. $747.26\,(1 + y)^5 = 1000 \;\Rightarrow\; (1 + y)^5 = \dfrac{1000}{747.26} = 1.338222$
   *Why:* the price is the face value discounted for 5 years, so growing the price at the yield for 5 years must give the face value.
2. $1 + y = 1.338222^{1/5} = 1.060000$
   *Why:* the fifth root turns growth over the whole 5 years into growth per year.
3. $y = 0.06 = 6.00\%$
   *Why:* the yield is the part of the yearly growth factor above 1.
4. Check: $\dfrac{1000}{1.06^5} = 747.26$
   *Why:* discounting the face value at the yield must give back the price.
5. Spreading the total gain evenly would give $\dfrac{1000 - 747.26}{747.26} \div 5 = 6.76\%$, which is too high.
   *Why:* the bond's total return of 33.82 % includes interest earned on interest, so it is more than five times the yearly rate.

```verify
F = 1000; P = 747.26; n = 5
G = F/P
assert abs(G - 1.338222) < 0.0000005
g = G^(1/n)
assert abs(g - 1.06) < 0.000001
y = g - 1
assert abs(y*100 - 6.00) < 0.005
assert abs(F/1.06^5 - 747.26) < 0.005
total = (F - P)/P
assert abs(total*100 - 33.82) < 0.005
simple = total/n
assert abs(simple*100 - 6.76) < 0.005
assert simple > y
```

### Example 2 (medium): pricing a coupon bond
A 10-year government bond has a face value of 1000 and a coupon rate of 5 %, paid at the end of each year. Similar bonds now yield 6 % a year. What is its price, does it trade at a premium or a discount, and what is its current yield?

1. $C = 0.05 \times 1000 = 50$
   *Why:* the coupon is the coupon rate times the face value, fixed for the life of the bond.
2. $50 \times \dfrac{1 - 1.06^{-10}}{0.06} = 50 \times 7.360087 = 368.0044$
   *Why:* the ten coupons are an annuity, valued at the market yield of 6 %, not at the coupon rate.
3. $\dfrac{1000}{1.06^{10}} = 558.3948$
   *Why:* the face value is repaid once, in 10 years, so it is discounted for 10 years.
4. $P = 368.0044 + 558.3948 = 926.40$
   *Why:* the price is the present value of everything the holder receives. In a quote this appears as 92.64 per 100 of face value.
5. $P < 1000$: the bond trades at a discount of 73.60.
   *Why:* its coupon rate (5 %) is below the market yield (6 %), so the price must fall until a buyer earns 6 % in total.
6. Current yield $= \dfrac{50}{926.40} = 5.40\%$
   *Why:* the coupon is a larger share of the lower price. It sits between the coupon rate of 5 % and the yield to maturity of 6 %, because it leaves out the gain of 73.60 at maturity.

```verify
F = 1000; c = 0.05; y = 0.06; n = 10
C = c*F
assert C == 50
A = (1 - (1 + y)^(-n))/y
assert abs(A - 7.360087) < 0.0000005
PVC = C*A
assert abs(PVC - 368.0044) < 0.00005
PVF = F/(1 + y)^n
assert abs(PVF - 558.3948) < 0.00005
P = PVC + PVF
assert abs(P - 926.40) < 0.005
# the same price as discounting each of the ten payments separately
assert abs(sum(C ./ (1 + y).^(1:n)) + F/(1 + y)^n - P) < 0.000001
assert abs(F - 926.40 - 73.60) < 0.000001
cy = C/926.40
assert abs(cy*100 - 5.40) < 0.005
assert cy > c and cy < y
```

### Example 3 (hard): what a rate rise does to bond prices
The central bank raises interest rates, and the yield on the bond of Example 2 (10 years, 5 % coupon, face value 1000) rises from 6 % to 7 %. By how much does its price fall? Compare with a 2-year bond with the same coupon, and with what a fall in the yield to 5 % would have done.

1. At 7 %: $P = 50 \times \dfrac{1 - 1.07^{-10}}{0.07} + \dfrac{1000}{1.07^{10}} = 859.53$
   *Why:* the payments are fixed, so the only change is the higher discount rate.
2. Fall: $926.40 - 859.53 = 66.87$, which is $7.2\%$ of the old price.
   *Why:* a one-point rise in the yield costs the holder far more than 1 % because the face value, the largest payment, is 10 years away and is discounted ten times at the higher rate.
3. 2-year bond: $P$ falls from $981.67$ at 6 % to $963.84$ at 7 %, a fall of $17.83$ or $1.8\%$.
   *Why:* its payments arrive soon, so a higher discount rate changes their present value much less. Short bonds carry less interest-rate risk.
4. If the yield had fallen to 5 % instead, the 10-year price would rise to $1000$, a gain of $73.60$.
   *Why:* at a yield equal to the coupon rate the bond trades at par. The gain from a one-point fall is bigger than the loss from a one-point rise because the price–yield curve is convex.
5. Reversing step 2: a bond with these payments that sells for 926.40 has a yield to maturity of exactly 6 %.
   *Why:* this is the trial-and-error method run backwards. At 5 % the price would be too high (1000) and at 7 % too low (859.53), so the yield lies between them, and 6 % matches exactly.

```verify
F = 1000; C = 50; n = 10
P6 = C*(1 - 1.06^(-n))/0.06 + F/1.06^n
P7 = C*(1 - 1.07^(-n))/0.07 + F/1.07^n
P5 = C*(1 - 1.05^(-n))/0.05 + F/1.05^n
assert abs(P6 - 926.40) < 0.005
assert abs(P7 - 859.53) < 0.005
assert abs(926.40 - 859.53 - 66.87) < 0.000001
assert abs(66.87/926.40*100 - 7.2) < 0.05
Q6 = C*(1 - 1.06^(-2))/0.06 + F/1.06^2
Q7 = C*(1 - 1.07^(-2))/0.07 + F/1.07^2
assert abs(Q6 - 981.67) < 0.005
assert abs(Q7 - 963.84) < 0.005
assert abs(981.67 - 963.84 - 17.83) < 0.000001
assert abs(17.83/981.67*100 - 1.8) < 0.05
assert abs(P5 - 1000) < 0.000001
assert abs(1000 - 926.40 - 73.60) < 0.000001
assert 73.60 > 66.87
assert P5 > 926.40 and P7 < 926.40
```

## Common mistakes
- Discounting at the coupon rate instead of the market yield, which always gives back the face value (COUPON_RATE_USED).
- Discounting the face value but adding the coupons up undiscounted (COUPONS_UNDISCOUNTED).
- Valuing the coupons and forgetting the repayment of the face value at maturity (FORGOT_FACE).
- Adding up all the coupons and the face value without discounting anything (UNDISCOUNTED).
- Dividing the total return $(F - P)/P$ by the number of years to get the yield of a zero-coupon bond (SIMPLE_YIELD).
- Giving the return over the whole life of the bond instead of the yield per year (TOTAL_RETURN).
- Using $P/F$ instead of $F/P$ and getting a negative yield (RATIO_INVERTED).
- Reporting the new price when the question asks how much the price falls (NEW_PRICE_GIVEN).
- Assuming a 1-point rise in the yield cuts the price by 1 % (ONE_PERCENT_RULE).
- Repricing only the face value at the new yield and leaving the coupons at their old value (FACE_ONLY).
- Treating the current yield as the yield to maturity: the current yield ignores the gain or loss when the face value is repaid.
- Thinking a rise in interest rates changes the coupons: the coupons of an existing bond are fixed; only their present value changes.

## Practice
- `zero-coupon-bond-yield` (difficulty 1): yield to maturity of a zero-coupon bond from its price and face value, $(F/P)^{1/n} - 1$; distractors SIMPLE_YIELD, TOTAL_RETURN, RATIO_INVERTED.
- `bond-price-annual-coupon` (difficulty 2): price of a bond with annual coupons, given the face value, coupon rate, market yield and years to maturity; distractors COUPON_RATE_USED, COUPONS_UNDISCOUNTED, FORGOT_FACE, UNDISCOUNTED.
- `bond-price-fall-rate-rise` (difficulty 3): how much a coupon bond's price falls when the market yield rises by one percentage point; distractors NEW_PRICE_GIVEN, ONE_PERCENT_RULE, FACE_ONLY.

## Real world
- Government borrowing: finance ministries, including Azerbaijan's Ministry of Finance, raise money by auctioning short-term bills and longer bonds. The prices bid at the auction set the yield, which is the interest rate the government pays on that debt.
- Monetary policy: when a central bank raises its policy rate, newly issued bonds offer higher yields, so existing bonds with lower coupons must fall in price until they offer the same return. In 2022, as central banks raised rates quickly, many long-dated government bonds lost a fifth or more of their value.
- Banks and pension funds: they hold large amounts of bonds, so they measure how far their bond holdings would fall if yields rose, using duration and convexity (C111). Banks that hold long bonds funded by short-term deposits can make heavy losses when rates rise quickly.
- Reading the news: financial pages quote a bond's price per 100 of face value and its yield. "Bond yields rose" and "bond prices fell" describe the same event.

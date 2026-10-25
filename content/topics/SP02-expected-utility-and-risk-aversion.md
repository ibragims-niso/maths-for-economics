---
id: SP02
title: Expected utility and risk aversion
block: SP
coreYear: 4
prerequisites: [C108, ST103]
estMinutes: 45
status: draft
economicUses:
  - "Insurance: why people pay more than the expected loss, and how much more"
  - Portfolio choice and the gain from diversifying or sharing risk
  - Compensating wage differentials for jobs with risky pay
  - Pricing risk in financial markets, including the equity premium
searchTerms:
  - "Expected utility"
  - "Risk aversion"
  - "Certainty equivalent"
  - "Arrow–Pratt measure"
generators: [lottery-certainty-equivalent, insurance-maximum-premium, arrow-pratt-risk-premium]
widgets: [expected-utility-chord]
mistakeCodes:
  EXPECTED_VALUE:
    label: Gave the expected value
    explanation: E[W] is what the gamble pays on average. A risk-averse person values it at less, the certainty equivalent CE = u⁻¹(E[u(W)]), which is below E[W].
  NOT_INVERTED:
    label: Left the answer in units of utility
    explanation: E[u(W)] is a number of "utils", not money. Turn it back into money with the inverse of u, squaring for √W and taking e to that power for ln W.
  UNWEIGHTED:
    label: Ignored the probabilities
    explanation: Expected utility weights each outcome's utility by its probability. Taking a plain average of the two utilities treats the outcomes as equally likely.
  UTILITY_OF_MEAN:
    label: Took the utility of the average
    explanation: E[u(W)] averages the utilities of the outcomes; u(E[W]) is the utility of the average outcome. For a concave u the first is smaller, and that gap is exactly what risk aversion is about.
  FAIR_PREMIUM:
    label: Gave the expected loss
    explanation: The expected loss p·L is the fair premium, the most a risk-neutral person would pay. A risk-averse person pays up to W₀ − CE, which is the expected loss plus the risk premium.
  RISK_PREMIUM_ONLY:
    label: Gave only the risk premium
    explanation: The risk premium E[W] − CE is the extra above the expected loss. The largest premium for full insurance is W₀ − CE, the expected loss plus that risk premium.
  GAVE_CE:
    label: Gave the certainty equivalent, not the premium
    explanation: The certainty equivalent is the sure wealth that is as good as facing the loss. The premium is how much wealth she can give up to get there, W₀ − CE.
  NO_HALF:
    label: Forgot the factor ½
    explanation: The Arrow–Pratt approximation is RP ≈ ½·A(W)·σ². The ½ comes from the second-order term of the Taylor expansion, ½·u″·σ².
  SD_NOT_VARIANCE:
    label: Used σ instead of σ²
    explanation: The risk premium grows with the variance σ², not the standard deviation. Square σ before multiplying; a risk twice as large costs about four times as much.
  RELATIVE_FOR_ABSOLUTE:
    label: Used relative instead of absolute risk aversion
    explanation: For money risks use A(W) = −u″/u′, which is γ/W for CRRA utility. The relative coefficient γ = W·A(W) belongs with risks measured as a share of wealth, RP/W ≈ ½·γ·(σ/W)².
resources:
  - { title: "Principles of Economics 3e, 16.2 Insurance and Imperfect Information (OpenStax)", url: "https://openstax.org/books/principles-economics-3e/pages/16-2-insurance-and-imperfect-information", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Principles of Microeconomics (MIT 14.01SC), Uncertainty (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/14-01sc-principles-of-microeconomics-fall-2011/pages/unit-6-topics-in-intermediate-microeconomics/uncertainty/", kind: course, verifiedAt: 2026-10-18 }
  - { title: "Microeconomic Theory III (MIT 14.123, MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/14-123-microeconomic-theory-iii-spring-2015/", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
A homeowner with wealth 90000 faces a 4 % chance that a flood causes 50000 of damage. The expected loss is 2000, yet she would happily pay up to 2384 for full insurance (Example 2), and insurers rely on customers like her: premiums above the expected loss pay for the insurer's costs and profit. Expected value alone cannot explain this, because it says nobody should ever pay more than 2000. **Expected utility** can. It is the standard way economists model choices whose outcomes are uncertain: buying insurance, choosing between a safe and a risky job, deciding how much to put into shares, or a farmer choosing between a safe and a risky crop. The curvature of the utility function, which C108 measured with the second derivative, turns into a precise measure of how much a person dislikes risk and how much they would pay to get rid of it.

## Intuition
Offer a student a coin flip: heads she gets 90000, tails 40000. The average is 65000. Would she swap the flip for 65000 for sure? Almost everyone would, and many would accept even 62000 for sure. Why? Because the 25000 she might gain above 65000 adds less to her well-being than the 25000 she might lose takes away. Money has **diminishing marginal utility**: the first 40000 pays for food and rent, the extra 25000 buys comforts. A utility function with this property is concave, $u'' < 0$ (C108).

So instead of averaging the money, average the **utility** of the money. Draw the concave curve $u(W)$ and mark the two outcomes on it. The straight chord between those two points holds every probability-weighted average of the two utilities; above $E[W]$ its height is the expected utility $E[u(W)]$. Because a concave curve lies above its chords, the utility of the sure average $u(E[W])$ is higher than the expected utility of the gamble. That is risk aversion in one picture.

Now go along horizontally from the chord until you meet the curve. The wealth there is the **certainty equivalent**: the sure amount that is exactly as good as the gamble. The gap between $E[W]$ and the certainty equivalent is the **risk premium**, what she would give up, on average, to make the risk go away. The more bent the curve, the larger the gap. A straight-line utility gives no gap at all (risk neutral), and a curve that bends upwards puts the chord above the curve, so the gamble is worth more than its average (risk loving).

## Definition and formulas
**Lotteries.** A lottery (or gamble) is a list of outcomes $W_1, \dots, W_n$ with probabilities $p_1, \dots, p_n$ that add up to 1. Its expected value is $E[W] = \sum_i p_i W_i$ (ST103).

**Expected utility.** With a utility function of money $u$, the expected utility of the lottery is
$$E[u(W)] = \sum_i p_i\,u(W_i),$$
and a person prefers the lottery with the higher expected utility.

**The von Neumann–Morgenstern idea.** Suppose a person can rank any two lotteries consistently (complete and transitive preferences), small changes in probabilities cause only small changes in preference (continuity), and mixing two lotteries with the same third lottery, in the same proportions, never reverses which of the two she prefers (independence). Then there is a utility function $u$ such that she always chooses as if she maximised $E[u(W)]$. This $u$ is unique up to a positive linear rescaling $a + b\,u$ with $b > 0$: the numbers themselves mean nothing, only the shape of the curve does.

**Attitudes to risk.** Jensen's inequality says that for a concave $u$,
$$E[u(W)] \le u(E[W]),$$
with equality only if there is no risk. So a person with concave $u$ ($u'' < 0$) turns down every fair gamble: she is **risk-averse**. With a linear $u$ she is **risk-neutral** and cares only about $E[W]$; with a convex $u$ ($u'' > 0$) the inequality reverses and she is **risk-loving**.

**Certainty equivalent and risk premium.** The certainty equivalent $CE$ and the risk premium $RP$ of a lottery are defined by
$$u(CE) = E[u(W)], \qquad CE = u^{-1}\big(E[u(W)]\big), \qquad RP = E[W] - CE.$$
Risk aversion means $CE < E[W]$, that is $RP > 0$.

**Insurance.** With wealth $W_0$ and a loss $L$ that happens with probability $p$, full insurance at premium $\pi$ leaves $W_0 - \pi$ for sure. She buys if $u(W_0 - \pi) \ge E[u(W)]$, so the largest premium she would pay is
$$\pi_{\max} = W_0 - CE = pL + RP.$$
The **fair premium** $pL$ is the expected loss. Any premium between $pL$ and $\pi_{\max}$ makes the buyer better off and gives a risk-neutral insurer a profit on average.

**Common utility functions.** The table gives each function's coefficients of absolute and relative risk aversion, defined below.
$$
\begin{array}{lll}
u(W) & A(W) = -u''/u' & R(W) = W A(W) \\ \hline
\sqrt{W} & 1/(2W) & 1/2 \\
\ln W & 1/W & 1 \\
\text{CARA: } -e^{-aW} & a & aW \\
\text{CRRA: } \dfrac{W^{1-\gamma}}{1-\gamma} & \gamma/W & \gamma
\end{array}
$$
CRRA with $\gamma = \tfrac12$ is $2\sqrt{W}$, which ranks lotteries exactly as $\sqrt{W}$ does, and $\ln W$ is the limit case $\gamma = 1$. $\gamma = 0$ is linear (risk neutral) and $\gamma < 0$ is convex (risk loving).

**Arrow–Pratt measures.** The coefficient of **absolute risk aversion** is
$$A(W) = -\frac{u''(W)}{u'(W)},$$
and the coefficient of **relative risk aversion** is $R(W) = W A(W)$. Dividing by $u'$ makes the measure independent of the rescaling $a + b\,u$. With CARA utility, $A$ is the same at every wealth, so the money a person would pay to avoid a given risk does not depend on how rich she is. With CRRA utility, $A = \gamma/W$ falls as wealth rises (decreasing absolute risk aversion): a richer person will bear larger risks in money terms, while a risk of a given share of wealth, say 10 %, worries her just as much as before.

**Small risks.** Add a small fair risk $\varepsilon$ with $E[\varepsilon] = 0$ and variance $\sigma^2$ to wealth $W$. A second-order Taylor expansion (C111) gives $E[u(W + \varepsilon)] \approx u(W) + \tfrac12 u''(W)\sigma^2$, while $u(W - RP) \approx u(W) - u'(W)\,RP$. Setting the two equal,
$$RP \approx \tfrac12\,A(W)\,\sigma^2, \qquad \frac{RP}{W} \approx \tfrac12\,R(W)\left(\frac{\sigma}{W}\right)^2.$$
The risk premium grows with the **square** of the risk. Halve the size of a risk (its standard deviation) and its cost falls to about a quarter; split a risk equally among $n$ people and each one's premium falls to about $1/n^2$ of the original, so the total falls to about $1/n$. This is why sharing and diversifying risks is so valuable.

**A limit: the Allais paradox.** Choice 1: A pays 1 million for sure; B pays 5 million with probability 0.10, 1 million with probability 0.89 and nothing with probability 0.01. Choice 2: C pays 1 million with probability 0.11 and nothing otherwise; D pays 5 million with probability 0.10 and nothing otherwise. Many people pick A and D. But A is preferred to B exactly when $0.11\,u(1\text{m}) > 0.10\,u(5\text{m}) + 0.01\,u(0)$, which is also exactly when C is preferred to D: no utility function gives A and D together. Such experiments break the independence axiom and led to alternative models such as prospect theory; expected utility remains the workhorse of economics because it is simple and usually predicts well.

## Interactive
::widget{id="expected-utility-chord"}

Wealth is 90,000 and a loss $L$ happens with probability $p$; the horizontal axis shows wealth in thousands. The lilac curve is CRRA utility with risk aversion $\gamma$, rescaled to run from 0 to 1; the dashed green line is a risk-neutral, linear utility. The gold chord joins the two outcomes, the hollow dot above $E[W]$ is the expected utility, and the filled dot is the point of the curve at the same height, which marks the certainty equivalent. Move the three sliders **Risk aversion γ**, **Loss L (thousands)** and **Probability of the loss p**; the panel shows $E[W]$, $CE$ and the risk premium $E[W] - CE$. Check: at the start ($\gamma = 0.5$, that is $\sqrt{W}$, $L = 50$, $p = 0.5$, as in Example 1) the panel shows 65,000, 62,500 and 2,500. Set $\gamma$ to 1 ($\ln W$): the curve bends more, $CE$ falls to 60,000 and the risk premium doubles to 5,000. Set $\gamma$ back to 0.5 and $p$ to 0.04: the panel shows 88,000, 87,616 and 384, the flood of Example 2, so she would pay up to $90{,}000 - 87{,}616 = 2{,}384$ for insurance. Set $\gamma$ to 0: the chord lies on the line and the risk premium is 0. Set $\gamma$ to $-1$: the curve is convex, $CE$ is above $E[W]$ and the risk premium turns negative.

## Worked examples

### Example 1 (easy): a farmer's uncertain income
A farmer's income will be 40000 after a poor harvest and 90000 after a good one, each with probability 0.5. Her utility of income is $u(W) = \sqrt{W}$. Find the expected income, the expected utility, the certainty equivalent and the risk premium. Would she accept a sure 63000 from a buyer who offers to take the harvest in advance? Repeat the certainty equivalent for $u(W) = \ln W$.

1. $E[W] = 0.5 \times 40{,}000 + 0.5 \times 90{,}000 = 65{,}000$
   *Why:* the expected value weights each income by its probability (ST103).
2. $E[\sqrt{W}] = 0.5 \times \sqrt{40{,}000} + 0.5 \times \sqrt{90{,}000} = 0.5 \times 200 + 0.5 \times 300 = 250$
   *Why:* expected utility averages the utilities, not the money.
3. $u(E[W]) = \sqrt{65{,}000} \approx 254.95 > 250$
   *Why:* Jensen's inequality: with a concave $u$ the sure average beats the gamble.
4. $CE = 250^2 = 62{,}500$, $RP = 65{,}000 - 62{,}500 = 2{,}500$
   *Why:* $u(CE) = E[u(W)]$, and the inverse of $\sqrt{W}$ is squaring. She would give up 2,500 of average income to remove the risk.
5. $\sqrt{63{,}000} \approx 251.00 > 250$, so she accepts the sure 63,000
   *Why:* any sure amount above the certainty equivalent is better for her than the gamble, even though it is below the average 65,000.
6. With $\ln W$: $E[\ln W] = 0.5\ln 40{,}000 + 0.5\ln 90{,}000 = \ln\sqrt{40{,}000 \times 90{,}000} = \ln 60{,}000$, so $CE = 60{,}000$ and $RP = 5{,}000$
   *Why:* $\ln W$ is more concave than $\sqrt{W}$ (relative risk aversion 1 instead of ½), so she gives up twice as much to avoid the risk. With equal probabilities, the certainty equivalent for $\ln W$ is the geometric mean of the outcomes.

```verify
lo = 40000; hi = 90000; p = 0.5
EW = p*lo + (1 - p)*hi
assert EW == 65000
EU = p*sqrt(lo) + (1 - p)*sqrt(hi)
assert abs(EU - 250) < 1e-12
assert abs(sqrt(EW) - 254.95) < 0.005
assert sqrt(EW) > EU
CE = EU^2
assert abs(CE - 62500) < 1e-9
assert abs(EW - CE - 2500) < 1e-9
assert abs(sqrt(63000) - 251.00) < 0.005
assert sqrt(63000) > EU
# second route: the CE solves sqrt(x) = EU; check the neighbours
assert sqrt(62499) < EU and sqrt(62501) > EU
CEln = exp(p*log(lo) + (1 - p)*log(hi))
assert abs(CEln - 60000) < 1e-6
assert abs(sqrt(lo*hi) - 60000) < 1e-9
assert abs(EW - CEln - 5000) < 1e-6
```

### Example 2 (medium): how much is flood insurance worth?
A homeowner has wealth 90000, including her house. With probability 0.04 a flood will cause damage of 50000. Her utility of wealth is $u(W) = \sqrt{W}$. Find the largest premium she would pay for full insurance, compare it with the fair premium, and find the largest premium if her utility were $\ln W$.

1. $E[\sqrt{W}] = 0.04 \times \sqrt{40{,}000} + 0.96 \times \sqrt{90{,}000} = 0.04 \times 200 + 0.96 \times 300 = 296$
   *Why:* without insurance her wealth is 40,000 after a flood and 90,000 otherwise.
2. $CE = 296^2 = 87{,}616$
   *Why:* a sure wealth of 87,616 is exactly as good for her as living with the flood risk.
3. $\pi_{\max} = 90{,}000 - 87{,}616 = 2{,}384$
   *Why:* full insurance at premium $\pi$ leaves $90{,}000 - \pi$ for sure; she buys as long as that is at least the certainty equivalent.
4. Fair premium $= 0.04 \times 50{,}000 = 2{,}000$; $E[W] = 88{,}000$ and $RP = 88{,}000 - 87{,}616 = 384 = 2{,}384 - 2{,}000$
   *Why:* the most she pays is the expected loss plus her risk premium. An insurer charging anything above 2,000 and up to 2,384, say 2,200, expects a profit, and she is still better off insured.
5. With $\ln W$: $CE = 40{,}000^{0.04} \times 90{,}000^{0.96} \approx 87{,}127.49$, so $\pi_{\max} \approx 90{,}000 - 87{,}127.49 = 2{,}872.51$
   *Why:* $e^{0.04\ln 40{,}000 + 0.96\ln 90{,}000}$ is a product of powers. The more risk-averse homeowner would pay about 873 above the expected loss rather than 384.

```verify
W0 = 90000; L = 50000; p = 0.04
EU = p*sqrt(W0 - L) + (1 - p)*sqrt(W0)
assert abs(EU - 296) < 1e-9
CE = EU^2
assert abs(CE - 87616) < 1e-6
pmax = W0 - CE
assert abs(pmax - 2384) < 1e-6
fair = p*L
assert abs(fair - 2000) < 1e-9
EW = W0 - p*L
assert abs(EW - 88000) < 1e-9
assert abs(EW - CE - 384) < 1e-6
assert abs(pmax - fair - 384) < 1e-6
# second route: insured utility at the maximum premium equals the uninsured expected utility
assert abs(sqrt(W0 - pmax) - EU) < 1e-12
assert sqrt(W0 - 2200) > EU
CEln = (W0 - L)^p * W0^(1 - p)
assert abs(CEln - exp(p*log(W0 - L) + (1 - p)*log(W0))) < 1e-6
assert abs(CEln - 87127.49) < 0.005
assert abs(W0 - CEln - 2872.51) < 0.005
assert abs(W0 - CEln - fair - 872.51) < 0.005
```

### Example 3 (hard): what a risky job must pay
A graduate can take a safe job paying 50000 or a job with commission that pays 40000 or 60000 with equal probability. Her utility is CRRA with $\gamma = 2$, $u(W) = -1/W$. Find her absolute and relative risk aversion at 50000, the Arrow–Pratt approximation of the risk premium of the commission job, its exact risk premium, and by how much both pay outcomes of the commission job must rise for her to be indifferent between the two jobs.

1. $u'(W) = W^{-2}$, $u''(W) = -2W^{-3}$, so $A(W) = \dfrac{2}{W} = \dfrac{2}{50{,}000} = 0.00004$ and $R(W) = 2$
   *Why:* for CRRA utility $A = \gamma/W$ and $R = \gamma$ at every wealth.
2. $\sigma^2 = 0.5 \times 10{,}000^2 + 0.5 \times 10{,}000^2 = 10^8$, $RP \approx \tfrac12 \times 0.00004 \times 10^8 = 2{,}000$
   *Why:* the commission job is the safe pay plus a fair gamble of $\pm 10{,}000$; the small-risk formula uses its variance.
3. $E[u] = -0.5\left(\dfrac{1}{40{,}000} + \dfrac{1}{60{,}000}\right) = -\dfrac{1}{48{,}000}$, so $CE = 48{,}000$ and $RP = 2{,}000$
   *Why:* $-1/CE = E[u]$. Here the approximation happens to be exact; in Example 1 it gives $\tfrac12 \times \tfrac{1}{2 \times 65{,}000} \times 25{,}000^2 \approx 2{,}403.85$ against the exact 2,500, because that risk is larger.
4. Pay $m \pm 10{,}000$: $CE = \dfrac{2}{\frac{1}{m - 10{,}000} + \frac{1}{m + 10{,}000}} = \dfrac{m^2 - 10^8}{m} = 50{,}000 \;\Rightarrow\; m^2 - 50{,}000\,m - 10^8 = 0$
   *Why:* she is indifferent when the certainty equivalent of the commission job equals the safe pay of 50,000.
5. $m = 25{,}000 + \sqrt{25{,}000^2 + 10^8} \approx 51{,}925.82$, a rise of about 1,925.82
   *Why:* this is the compensating wage differential. It is a little below the risk premium of 2,000 because $A = 2/W$ falls as pay rises: at higher pay the same risk worries her less. With CARA utility, where $A$ does not depend on wealth, the differential would equal the risk premium exactly.

```verify
W = 50000; h = 10000; g = 2
A = g/W
assert abs(A/0.00004 - 1) < 1e-12
assert abs(W*A - 2) < 1e-12
# A from the derivatives u' = W^-2 and u'' = -2 W^-3
assert abs(-(-2*W^-3)/(W^-2)/A - 1) < 1e-9
s2 = 0.5*h^2 + 0.5*h^2
assert s2 == 1e8
RPa = 0.5*A*s2
assert abs(RPa - 2000) < 1e-9
EU = -0.5*(1/(W - h) + 1/(W + h))
assert abs(EU*48000 + 1) < 1e-12
CE = -1/EU
assert abs(CE - 48000) < 1e-6
assert abs(W - CE - 2000) < 1e-6
assert abs(0.5*(1/(2*65000))*25000^2 - 2403.85) < 0.005
m = 25000 + sqrt(25000^2 + 1e8)
assert abs(m - 51925.82) < 0.005
assert abs(m^2 - 50000*m - 1e8) < 1e-3
# second route: the CE of m - h and m + h, straight from expected utility
CEm = -1/(-0.5*(1/(m - h) + 1/(m + h)))
assert abs(CEm - 50000) < 1e-6
assert abs((m^2 - h^2)/m - 50000) < 1e-6
assert abs(m - W - 1925.82) < 0.005
assert m - W < 2000
```

## Common mistakes
- Giving the expected value $E[W]$ as the certainty equivalent; for a risk-averse person the certainty equivalent is lower (EXPECTED_VALUE).
- Stopping at $E[u(W)]$ and reporting a number of "utils" as an amount of money; turn it back with $u^{-1}$ (NOT_INVERTED).
- Averaging the utilities with equal weights when the outcomes are not equally likely (UNWEIGHTED).
- Computing $u(E[W])$ instead of $E[u(W)]$: the utility of the average is not the average utility (UTILITY_OF_MEAN).
- Giving the expected loss $pL$ as the most a risk-averse person would pay for insurance; that is only the fair premium (FAIR_PREMIUM).
- Giving the risk premium $E[W] - CE$ as the maximum insurance premium and forgetting the expected loss (RISK_PREMIUM_ONLY).
- Reporting the certainty equivalent itself when the question asks for the premium $W_0 - CE$ (GAVE_CE).
- Dropping the ½ in $RP \approx \tfrac12 A(W)\sigma^2$ (NO_HALF).
- Multiplying by the standard deviation $\sigma$ instead of the variance $\sigma^2$ (SD_NOT_VARIANCE).
- Using the relative coefficient $\gamma$ instead of the absolute coefficient $\gamma/W$ for a risk measured in money (RELATIVE_FOR_ABSOLUTE).
- Comparing utility numbers across people or reading meaning into their size: $u$ is only defined up to $a + b\,u$, so only the shape matters.
- Thinking a risk-averse person never takes risks: she takes a gamble whenever its expected gain is large enough to cover her risk premium.

## Practice
- `lottery-certainty-equivalent` (difficulty 1): certainty equivalent of a two-outcome gamble (harvest, start-up, sales bonus, contract) for $u = \sqrt{W}$ or $u = \ln W$, to 2 decimal places; distractors EXPECTED_VALUE, NOT_INVERTED, UNWEIGHTED.
- `insurance-maximum-premium` (difficulty 2): the largest premium for full insurance against a flood, burglary, drought or car theft, $W_0 - CE$, for $u = \sqrt{W}$ or $u = \ln W$; distractors FAIR_PREMIUM, RISK_PREMIUM_ONLY, GAVE_CE.
- `arrow-pratt-risk-premium` (difficulty 3): the Arrow–Pratt risk premium $\tfrac12 (\gamma/W)\sigma^2$ of a small fair gamble for CRRA utility; distractors NO_HALF, SD_NOT_VARIANCE, RELATIVE_FOR_ABSOLUTE.

## Real world
- Insurance: home, car, health and crop insurance all sell at premiums above the expected loss, and customers buy because their risk premium covers the difference (Example 2). Insurers can charge close to the expected loss because pooling many independent policies makes their own average claim predictable (ST206). In poorer countries, weather-index crop insurance for farmers is priced with the same logic.
- Diversification and risk sharing: because the risk premium grows with the variance, spreading savings over many assets (ST201), or sharing a risk among many partners, removes much of its cost. Families, cooperatives and stock markets are all ways of sharing risk.
- Labour markets: jobs with uncertain pay (commission sales, freelance work) or a risk of injury must pay more on average to attract workers, a compensating wage differential like the one in Example 3.
- Finance: over long periods shares have earned several percentage points a year more than safe government bonds; explaining a gap that large with standard CRRA utility needs an implausibly high $\gamma$, the "equity premium puzzle".

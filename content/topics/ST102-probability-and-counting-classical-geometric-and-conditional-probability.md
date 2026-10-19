---
id: ST102
title: Probability and counting (classical, geometric and conditional probability)
block: ST1
coreYear: 1
prerequisites: [F09]
estMinutes: 50
status: draft
economicUses:
  - Quality control by inspecting a random sample from a batch
  - "Credit scoring: the chance of default after a warning signal"
  - Insurance pricing and fraud screening
  - Planning for customers or deliveries that arrive at random times
  - Reasoning about risk and uncertainty in any economic decision
generators: [sample-defectives-probability, bayes-default-given-signal, meeting-window-probability]
widgets: [bayes-natural-frequencies]
mistakeCodes:
  ORDERED_COUNT:
    label: Counted in order but forgot where the defectives sit
    explanation: If you count ordered samples, N!/(N − k)!, at the bottom, the top must be ordered too, including the C(k, j) ways to choose which draws are the defective ones. Simpler is to count unordered samples with C(n, k) at the top and the bottom.
  WITH_REPLACEMENT:
    label: Treated the draws as with replacement
    explanation: The items are not put back, so after each draw the batch is smaller and the share of defectives changes. Use C(D, j) · C(N − D, k − j) / C(N, k), not a formula with the same share D/N on every draw.
  MISSING_GOOD_ITEMS:
    label: Forgot to choose the good items
    explanation: A sample with exactly j defectives also contains k − j good items, and there are C(N − D, k − j) ways to pick them. Multiply the two counts before dividing by C(N, k).
  INVERTED_CONDITIONAL:
    label: Swapped P(A | B) and P(B | A)
    explanation: The hit rate P(warning | default) is not the probability of default after a warning, P(default | warning). Turn one into the other with Bayes' theorem.
  BASE_RATE_NEGLECT:
    label: Ignored the base rate
    explanation: Dividing the hit rate by the hit rate plus the false-alarm rate treats both groups as equally large. Weight each rate by the size of its group, P(A) and 1 − P(A), before comparing them.
  JOINT_NOT_CONDITIONAL:
    label: Gave P(A and B) instead of P(A | B)
    explanation: P(A)·P(B | A) is the chance that both happen. To condition on the signal, divide this by the total probability of the signal, P(B).
  TOTAL_NOT_CONDITIONAL:
    label: Gave the probability of the signal
    explanation: P(B) from the law of total probability is only the denominator of Bayes' theorem. The answer is the share of it that comes from true cases, P(A)·P(B | A) / P(B).
  EDGE_IGNORED:
    label: Ignored the edges of the time window
    explanation: The second arrival must fall within w minutes of the first, but near the start or end of the window part of that 2w-minute interval lies outside it. Use the areas in the square, which give 1 − (1 − w/T)².
  NOT_COMPLEMENT:
    label: Gave the probability that they miss each other
    explanation: The two corner triangles, area (T − w)², are where the two arrivals are too far apart. Subtract their share from 1 to get the probability of meeting.
  ONE_TRIANGLE:
    label: Removed only one corner triangle
    explanation: Either person can be the one who comes too early, so there are two triangles where they miss, one on each side of the diagonal. Their total area is (T − w)², not half of it.
resources:
  - { title: "Contemporary Mathematics, 7.6 Probability with Permutations and Combinations (OpenStax)", url: "https://openstax.org/books/contemporary-mathematics/pages/7-6-probability-with-permutations-and-combinations", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Introductory Statistics 2e, 3.3 Two Basic Rules of Probability (OpenStax)", url: "https://openstax.org/books/introductory-statistics-2e/pages/3-3-two-basic-rules-of-probability", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Introductory Statistics 2e, 3.5 Tree and Venn Diagrams (OpenStax)", url: "https://openstax.org/books/introductory-statistics-2e/pages/3-5-tree-and-venn-diagrams", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
Almost every economic decision is made without knowing the future. A bank lends without knowing who will repay, an insurer sells cover without knowing who will claim, and a factory ships a batch without testing every item. Probability turns this uncertainty into numbers that can be compared and priced. Two questions come up again and again: "how likely is this outcome?", answered by counting or measuring, and "how should I update my view after new information?", answered by conditional probability and Bayes' theorem. A bank that confuses "most defaulters got a warning" with "most borrowers who got a warning will default" will refuse many good customers.

## Intuition
An **experiment** is anything with an uncertain result: drawing items from a batch, a borrower's loan running its course, a customer's arrival time. Its possible results are **outcomes**, and the set of all of them is the **sample space**. An **event** is a set of outcomes, so the set language of F09 carries over: "A or B" is the union $A \cup B$, "A and B" the intersection $A \cap B$, "not A" the complement $A^c$.

When all outcomes are equally likely, a probability is a share: count the outcomes you want and divide by all outcomes. Counting large sets needs shortcuts, which is what permutations and combinations are. When outcomes form a continuum, such as a moment within an hour, "counting" becomes measuring a length or an area.

Conditional probability is about **shrinking the world**. Once you know that a borrower received a warning, only borrowers with warnings matter, and the question becomes: what share of *them* default? Bayes' theorem is the bookkeeping for that step. The easiest way to see it is with **natural frequencies**: imagine 1000 borrowers and count how many land in each group.

## Definition and formulas
**Sample space and events.** The sample space $\Omega$ is the set of all outcomes; an event $A$ is a subset, $A \subseteq \Omega$. Events $A$ and $B$ are **mutually exclusive** (disjoint) if $A \cap B = \varnothing$: they cannot happen together.

**The axioms.** A probability $P$ gives every event a number such that
1. $P(A) \ge 0$ for every event $A$;
2. $P(\Omega) = 1$;
3. if $A_1, A_2, \dots$ are mutually exclusive, $P(A_1 \cup A_2 \cup \dots) = P(A_1) + P(A_2) + \dots$

Everything else follows from these three rules, for example
$$P(A^c) = 1 - P(A), \qquad P(\varnothing) = 0, \qquad P(A \cup B) = P(A) + P(B) - P(A \cap B).$$
The last one is inclusion–exclusion from F09, now with probabilities instead of head counts.

**Classical probability.** If $\Omega$ has finitely many outcomes and all are equally likely,
$$P(A) = \frac{|A|}{|\Omega|} = \frac{\text{number of outcomes in } A}{\text{number of all outcomes}}.$$

**Counting.**
- Multiplication principle: if a choice is made in $k$ stages with $n_1, n_2, \dots, n_k$ options at each stage, there are $n_1 n_2 \cdots n_k$ ways in all. A menu of 3 starters and 5 main courses gives $3 \cdot 5 = 15$ meals.
- $n! = n(n-1)\cdots 2 \cdot 1$ is the number of ways to put $n$ different objects in order, with $0! = 1$.
- Ordered choice of $k$ from $n$ without repetition (permutations):
$$P(n, k) = n(n-1)\cdots(n-k+1) = \frac{n!}{(n-k)!}.$$
- Unordered choice of $k$ from $n$ (combinations), read "$n$ choose $k$":
$$\binom{n}{k} = C(n, k) = \frac{n!}{k!\,(n-k)!}.$$
Each unordered set of $k$ can be put in order in $k!$ ways, so $P(n, k) = k!\,C(n, k)$.
- Ordered choice of $k$ from $n$ **with** replacement (repetition allowed): $n^k$ ways. A 4-digit PIN has $10^4 = 10{,}000$ possibilities.

$$
\begin{array}{lcc}
 & \text{order matters} & \text{order does not matter} \\ \hline
\text{without replacement} & n!/(n-k)! & \binom{n}{k} \\
\text{with replacement} & n^k & \text{(not needed here)}
\end{array}
$$

**Sampling from a batch.** A batch of $N$ items holds $D$ defective ones and $k$ are picked at random without replacement. Every set of $k$ items is equally likely, so
$$P(\text{exactly } j \text{ defective}) = \frac{\binom{D}{j}\binom{N-D}{k-j}}{\binom{N}{k}}.$$
If each item were put back before the next draw, the share of defectives would stay $p = D/N$, and the answer would be $\binom{k}{j}p^j(1-p)^{k-j}$ instead. The two are close only when the batch is much larger than the sample.

**Geometric probability.** If a point is chosen "uniformly at random" in a region $\Omega$ (an interval, a square), every part of equal size is equally likely, and
$$P(A) = \frac{\text{length (or area) of } A}{\text{length (or area) of } \Omega}.$$
A customer who arrives at a uniformly random time between 9:00 and 10:00 comes in the first 15 minutes with probability $15/60 = 0.25$. Two independent uniform times in a window of $T$ minutes are a uniform point in a $T \times T$ square, and they are within $w$ minutes of each other with probability $1 - (1 - w/T)^2$ (see Example 3).

**Conditional probability.** For $P(B) > 0$, the probability of $A$ given $B$ is
$$P(A \mid B) = \frac{P(A \cap B)}{P(B)}.$$
Rearranged, this is the **multiplication rule**:
$$P(A \cap B) = P(B)\,P(A \mid B) = P(A)\,P(B \mid A).$$
In general $P(A \mid B) \ne P(B \mid A)$.

**Independence.** $A$ and $B$ are independent if $P(A \cap B) = P(A)\,P(B)$, which (when $P(B) > 0$) is the same as $P(A \mid B) = P(A)$: learning $B$ does not change the chance of $A$. Independent is not the same as mutually exclusive: if $A$ and $B$ are mutually exclusive and both possible, learning $B$ tells you $A$ did not happen, so they are strongly dependent.

**Law of total probability.** If $B_1, \dots, B_n$ are mutually exclusive and together make up $\Omega$ (a partition),
$$P(A) = \sum_{i=1}^{n} P(A \mid B_i)\,P(B_i).$$
With two groups, $B$ and $B^c$: $P(A) = P(A \mid B)P(B) + P(A \mid B^c)P(B^c)$.

**Bayes' theorem.** For the same partition,
$$P(B_i \mid A) = \frac{P(A \mid B_i)\,P(B_i)}{\sum_{j=1}^{n} P(A \mid B_j)\,P(B_j)}.$$
$P(B_i)$ is the **prior** (the base rate before the evidence) and $P(B_i \mid A)$ the **posterior** (after it). For a warning $W$ about default $D$:
$$P(D \mid W) = \frac{P(W \mid D)\,P(D)}{P(W \mid D)\,P(D) + P(W \mid D^c)\,P(D^c)}.$$
$P(W \mid D)$ is the **hit rate** and $P(W \mid D^c)$ the **false-alarm rate**.

## Interactive
::widget{id="bayes-natural-frequencies"}

The grid shows 1000 borrowers, one square each, for the credit-scoring model of Example 2. Gold squares default and get a warning, green squares repay but get a warning (false alarms), lilac squares default without a warning; borrowers who repay and get no warning are left blank. The bar at the bottom is everyone who got a warning, and its gold share is $P(\text{default} \mid \text{warning})$. Check: at the start values 5 %, 80 % and 10 % the panel shows 40 true warnings, 95 false alarms and $P(\text{default} \mid \text{warning}) = 0.296$. Now push the hit rate up to 95 %: the probability only reaches 0.333. Put it back to 80 % and instead lower the false-alarm rate to 2 %: it jumps to 0.678. When defaults are rare, cutting false alarms matters far more than catching more defaulters. Finally raise the default rate to 30 %: true warnings now outnumber false alarms and the panel shows 0.774.

## Worked examples

### Example 1 (easy): inspecting a batch
A shop receives a batch of 20 phones, 4 of which are faulty. An inspector picks 3 phones at random, without replacement. How many different samples are possible? What is the probability that exactly one of the three is faulty, and that at least one is faulty?

1. $\binom{20}{3} = \dfrac{20 \cdot 19 \cdot 18}{3!} = 1140$ samples
   *Why:* the order of picking does not matter, and every set of 3 phones is equally likely, so the sample space is all combinations of 3 from 20.
2. $\binom{4}{1}\binom{16}{2} = 4 \cdot 120 = 480$
   *Why:* exactly one faulty means one of the 4 faulty phones and two of the 16 working ones; by the multiplication principle every choice of the first pairs with every choice of the second.
3. $P(\text{exactly one}) = \dfrac{480}{1140} = 0.4211$
   *Why:* classical probability: favourable outcomes over all outcomes.
4. Check in order: $\dfrac{3 \cdot 4 \cdot 16 \cdot 15}{20 \cdot 19 \cdot 18} = \dfrac{2880}{6840} = 0.4211$
   *Why:* counting ordered draws also works if the top is ordered too: the faulty phone can be the 1st, 2nd or 3rd draw, which gives the factor 3.
5. $P(\text{at least one}) = 1 - \dfrac{\binom{16}{3}}{\binom{20}{3}} = 1 - \dfrac{560}{1140} = 0.5088$
   *Why:* "at least one" is the complement of "none faulty", which has a single count to work out.

```verify
total = combinations(20, 3)
assert total == 1140
fav = combinations(4, 1) * combinations(16, 2)
assert fav == 480
p1 = fav / total
assert abs(p1 - 0.4211) < 0.00005
# ordered count gives the same probability
assert permutations(20, 3) == 6840
assert abs(3*4*16*15 / permutations(20, 3) - p1) < 1e-12
none = combinations(16, 3)
assert none == 560
pAtLeast = 1 - none / total
assert abs(pAtLeast - 0.5088) < 0.00005
# the probabilities of 0, 1, 2 and 3 faulty phones add up to 1
assert abs(sum([combinations(4, 0)*combinations(16, 3), combinations(4, 1)*combinations(16, 2), combinations(4, 2)*combinations(16, 1), combinations(4, 3)*combinations(16, 0)]) / total - 1) < 1e-12
```

### Example 2 (medium): a credit-scoring warning
At a bank, 5 % of borrowers default. A credit-scoring model raises a warning for 80 % of borrowers who later default and for 10 % of borrowers who repay. A borrower gets a warning. What is the probability that this borrower defaults? Is a warning independent of default?

1. $P(D) = 0.05$, $P(W \mid D) = 0.8$, $P(W \mid D^c) = 0.1$
   *Why:* naming the base rate, the hit rate and the false-alarm rate shows that we know $P(W \mid D)$ but want $P(D \mid W)$, the other way round.
2. $P(D \cap W) = 0.05 \cdot 0.8 = 0.04$
   *Why:* multiplication rule: default and warning together.
3. $P(W) = 0.04 + 0.95 \cdot 0.1 = 0.04 + 0.095 = 0.135$
   *Why:* law of total probability: a warning comes either from a defaulter or as a false alarm from the 95 % who repay.
4. $P(D \mid W) = \dfrac{0.04}{0.135} = 0.2963$
   *Why:* Bayes' theorem: of all warnings, this is the share that belongs to defaulters.
5. Natural frequencies: of 1000 borrowers, 50 default and 40 of them get a warning; of the 950 who repay, 95 get one; $40/135 = 0.2963$.
   *Why:* the same calculation with whole people is easier to check and shows why: false alarms outnumber true warnings because there are so many more repayers.
6. $P(D \mid W) = 0.2963 \ne 0.05 = P(D)$, so they are not independent.
   *Why:* the warning raises the chance of default almost sixfold, yet about 70 % of warned borrowers still repay.

```verify
pD = 0.05; hit = 0.8; fa = 0.1
joint = pD * hit
assert abs(joint - 0.04) < 1e-12
pW = joint + (1 - pD) * fa
assert abs(pW - 0.135) < 1e-12
post = joint / pW
assert abs(post - 0.2963) < 0.00005
# natural frequencies out of 1000 borrowers
N = 1000
tp = N * pD * hit
fp = N * (1 - pD) * fa
assert abs(tp - 40) < 1e-9
assert abs(fp - 95) < 1e-9
assert abs(tp / (tp + fp) - post) < 1e-12
assert abs(post / pD - 5.926) < 0.001
assert abs((1 - post) - 0.7037) < 0.00005
```

### Example 3 (hard): will the traders meet?
Two traders agree to meet at a market between 12:00 and 13:00. Each arrives at a random moment in that hour, independently of the other, and waits 15 minutes for the other before leaving (or until 13:00). What is the probability that they meet? How long would each have to wait to make the probability 0.75?

1. Let $x, y \in [0, 60]$ be the arrival times in minutes after 12:00; the point $(x, y)$ is uniform in a square of area $60^2 = 3600$.
   *Why:* each time is spread evenly over the hour and the two are independent, so every part of the square of equal area is equally likely: geometric probability.
2. They meet if $|x - y| \le 15$.
   *Why:* whoever comes first waits 15 minutes, so the second must arrive within 15 minutes of the first.
3. The points with $|x - y| > 15$ form two corner triangles, each with short sides $60 - 15 = 45$: total area $2 \cdot \tfrac12 \cdot 45^2 = 2025$.
   *Why:* one triangle is "x arrives more than 15 minutes before y", the other "y arrives more than 15 minutes before x".
4. $P(\text{meet}) = \dfrac{3600 - 2025}{3600} = \dfrac{1575}{3600} = 0.4375$
   *Why:* favourable area over total area; this is $1 - (1 - 15/60)^2 = 1 - 0.75^2$.
5. $1 - (1 - w/60)^2 = 0.75 \Rightarrow (1 - w/60)^2 = 0.25 \Rightarrow 1 - w/60 = 0.5 \Rightarrow w = 30$ minutes
   *Why:* solve the same formula for the waiting time; take the positive root because $1 - w/60$ lies between 0 and 1.

```verify
T = 60; w = 15
square = T^2
assert square == 3600
corners = 2 * 0.5 * (T - w)^2
assert corners == 2025
pMeet = (square - corners) / square
assert pMeet == 0.4375
assert abs(pMeet - (1 - (1 - w/T)^2)) < 1e-12
# second route: average, over the first arrival x, of the share of the hour within 15 minutes of x
# lengths: x + w for x in [0, w], 2w in the middle, T - x + w for x in [T - w, T]
integral = 2 * (w^2/2 + w*w) + (T - 2*w) * 2*w
assert abs(integral / T^2 - pMeet) < 1e-12
# waiting time for probability 0.75
wNeeded = T * (1 - sqrt(1 - 0.75))
assert abs(wNeeded - 30) < 1e-9
assert abs(1 - (1 - wNeeded/T)^2 - 0.75) < 1e-12
```

## Common mistakes
- Counting ordered samples at the bottom but not counting where the defective items sit in the order (ORDERED_COUNT).
- Using the same share of defectives $D/N$ for every draw when items are not put back (WITH_REPLACEMENT).
- Choosing the defective items but forgetting to choose the good ones that fill the rest of the sample (MISSING_GOOD_ITEMS).
- Reading the hit rate $P(W \mid D)$ as if it were $P(D \mid W)$ (INVERTED_CONDITIONAL).
- Comparing the hit rate with the false-alarm rate without weighting them by how common each group is (BASE_RATE_NEGLECT).
- Stopping at $P(A \cap B)$ and forgetting to divide by $P(B)$ (JOINT_NOT_CONDITIONAL).
- Giving the total probability of the signal, $P(B)$, as the answer (TOTAL_NOT_CONDITIONAL).
- In a meeting problem, using $2w/T$ and forgetting that near the edges of the window part of the $2w$-minute interval is cut off (EDGE_IGNORED).
- Reporting the share of the two corner triangles, which is the probability of *not* meeting (NOT_COMPLEMENT).
- Subtracting only one corner triangle (ONE_TRIANGLE).
- Adding $P(A) + P(B)$ for events that can happen together: subtract $P(A \cap B)$.
- Multiplying $P(A)\,P(B)$ for events that are not independent: in general $P(A \cap B) = P(A)\,P(B \mid A)$.
- Thinking "mutually exclusive" means "independent": two possible events that cannot happen together are dependent.

## Practice
- `sample-defectives-probability` (difficulty 1): probability that a random sample from a batch (phones, bulbs, loan files) contains exactly $j$ defective items, to 4 decimal places; distractors ORDERED_COUNT, WITH_REPLACEMENT, MISSING_GOOD_ITEMS.
- `bayes-default-given-signal` (difficulty 2): probability of default, fraud or bankruptcy after a warning signal, from a base rate, a hit rate and a false-alarm rate; distractors INVERTED_CONDITIONAL, BASE_RATE_NEGLECT, JOINT_NOT_CONDITIONAL, TOTAL_NOT_CONDITIONAL.
- `meeting-window-probability` (difficulty 3): probability that two people arriving at random in a time window, each waiting $w$ minutes, meet; answer $1 - (1 - w/T)^2$; distractors EDGE_IGNORED, NOT_COMPLEMENT, ONE_TRIANGLE.

## Real world
- Quality control: firms and customs offices accept or reject a whole delivery after testing a small random sample; the probabilities that a bad batch passes come from exactly the counting in Example 1.
- Credit scoring: banks judge a scoring model by its hit rate and false-alarm rate, but the decision to lend depends on $P(\text{default} \mid \text{score})$, which also needs the base rate of default in the population (Example 2).
- Insurance: fraud screening, medical underwriting and claims checks are Bayes problems; when fraud is rare, most flagged claims are honest, so flags lead to a closer look rather than a refusal.
- Services and logistics: deliveries, customers and calls arriving at random times within a window are modelled with uniform arrival times; meeting and overlap probabilities help set waiting times and staff rotas (later topics on queues build on this, see SP05).

---
id: SP05
title: Queueing systems
block: SP
coreYear: 4
prerequisites: [ST104]
estMinutes: 45
status: draft
economicUses:
  - Staffing bank branches, public service centres and call centres
  - "Capacity planning: how many pumps, desks, beds or checkouts to provide"
  - Weighing the cost of extra servers against the cost of customers' waiting time
  - Waiting times in hospital emergency departments and other public services
searchTerms:
  - "Queueing theory"
  - "M/M/1 queue"
generators: [littles-law-queue, mm1-queue-measures, mm1-at-least-n-probability, mm2-staffing-cost]
widgets: [mm1-waiting-curve]
mistakeCodes:
  SERVICE_ONLY:
    label: Gave the service time only
    explanation: 1/μ is how long the service itself takes. The time in the system also includes the wait before service starts, W = 1/(μ − λ), which is always longer than 1/μ.
  QUEUE_VS_SYSTEM:
    label: Mixed up the queue and the system
    explanation: L and W count everyone in the system, including the customer being served; Lq and Wq count only those still waiting. In M/M/1, L = Lq + ρ and W = Wq + 1/μ.
  NO_ONE_MINUS:
    label: Forgot to divide by 1 − ρ
    explanation: The utilisation ρ = λ/μ alone is not the queue length. The M/M/1 results all have 1 − ρ underneath, for example L = ρ/(1 − ρ) and Lq = ρ²/(1 − ρ); that factor is what makes queues grow so fast as ρ approaches 1.
  MIXED_UNITS:
    label: Mixed hours and minutes
    explanation: With rates per hour, the formulas give times in hours. Multiply by 60 to get minutes, and turn minutes into hours (divide by 60) before multiplying by a rate per hour.
  LITTLE_REARRANGED:
    label: Rearranged Little's law the wrong way
    explanation: Little's law is L = λW, so W = L/λ and λ = L/W. Check the units, customers = (customers per hour) × hours.
  EXACTLY_N:
    label: Gave the probability of exactly n
    explanation: (1 − ρ)ρⁿ is the probability of exactly n customers. "At least n" adds the terms for n, n + 1, n + 2, …, and this geometric sum is ρⁿ.
  OFF_BY_ONE:
    label: Used the wrong power of ρ
    explanation: The probability of at least n customers in the system is ρⁿ, with the same n. ρⁿ⁺¹ is the probability of at least n + 1 customers, that is, at least n waiting in the queue.
  TAIL_COMPLEMENT:
    label: Gave the probability of fewer than n
    explanation: 1 − ρⁿ is the probability of fewer than n customers, the complement of what was asked. The probability of at least n is ρⁿ itself.
  LQ_NOT_L:
    label: Costed only the customers in the queue
    explanation: Customers' time is lost while they are being served too, so the waiting cost uses L, the average number in the system. Using Lq leaves out the customers at the desks.
  DEARER_OPTION:
    label: Gave the more expensive option
    explanation: Work out the total hourly cost of both options, staff plus waiting, and choose the smaller one. The cheaper option is not always the one with fewer staff.
  SPLIT_QUEUE:
    label: Treated two servers as two separate queues
    explanation: With one shared queue the two servers form an M/M/2 system, L = 2ρ/(1 − ρ²) with ρ = λ/(2μ). Splitting the arrivals into two M/M/1 queues of rate λ/2 gives a larger L, because a customer can wait while the other server is idle.
  UNSTABLE:
    label: Used the formulas when ρ ≥ 1
    explanation: If customers arrive at least as fast as they can be served, the queue grows without limit and there is no long-run average. The formulas then give nonsense such as a negative L. Check ρ < 1 first.
resources:
  - { title: "Introductory Statistics 2e, 5.3 The Exponential Distribution (OpenStax)", url: "https://openstax.org/books/introductory-statistics-2e/pages/5-3-the-exponential-distribution", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Probabilistic Systems Analysis and Applied Probability (MIT 6.041SC), Lecture 14: Poisson Process I (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/6-041sc-probabilistic-systems-analysis-and-applied-probability-fall-2013/pages/unit-iii/lecture-14/", kind: course, verifiedAt: 2026-10-18 }
  - { title: "Queues: Theory and Applications (MIT 15.072J, MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/15-072j-queues-theory-and-applications-spring-2006/", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
A bank branch has one teller who can serve 15 customers an hour, and on average 12 customers arrive an hour. On paper there is spare capacity, yet customers complain about the queue: on average 4 of them are in the branch and each spends 20 minutes there (Example 1). Add a second teller and the time falls to under 5 minutes, but the wage bill doubles. Is it worth it? Banks, call centres, petrol stations, hospital emergency departments and public service centres all face this trade-off between the cost of capacity and the cost of customers' time. **Queueing theory** turns arrival and service rates into waiting times and queue lengths, so the trade-off can be priced. Queues are also an economic signal: where prices cannot ration demand (free public services, emergency care), waiting time does the rationing instead.

## Intuition
If customers arrived exactly every 5 minutes and each took exactly 4 minutes, nobody would ever wait. Queues come from **randomness**: customers bunch together, and some services take much longer than others. When three customers arrive in the same minute, a queue forms; when nobody comes for ten minutes, the teller sits idle, and that idle time is lost for ever. It cannot be saved up for the next rush.

This is why the **utilisation** $\rho$, the share of time the server is busy, matters so much. At $\rho = 0.5$ the server is free half the time and most rushes clear quickly. At $\rho = 0.9$ there is very little slack: a queue that builds up during a rush takes a long time to clear, because the server works only a little faster than customers arrive. As $\rho$ approaches 1 the average wait does not grow steadily; it **explodes**. In the M/M/1 queue the average time in the system is the service time divided by $1 - \rho$: twice the service time at $\rho = 0.5$, ten times at $\rho = 0.9$, twenty times at $\rho = 0.95$. Running a service "at full capacity" looks efficient on a spreadsheet and is a disaster for the people in the queue.

The models in this topic count the customers in the system, as in SP01: the count is the state, and it goes up by one at each arrival and down by one at each service completion. In the long run the flow up from $n$ to $n + 1$ customers must equal the flow down from $n + 1$ to $n$, and this balance gives every formula below.

## Definition and formulas
**Arrivals.** Customers arrive as a **Poisson process** with rate $\lambda$ (customers per hour): the number of arrivals in any interval of length $t$ is Poisson with mean $\lambda t$ (ST104), and counts in separate intervals are independent. The chance of no arrival in time $t$ is therefore $e^{-\lambda t}$, so the time $T$ between arrivals has
$$P(T > t) = e^{-\lambda t}, \qquad E[T] = \frac{1}{\lambda}.$$
This is the **exponential distribution**. It has no memory: however long you have waited for the next customer, the remaining wait has the same distribution.

**Service.** Service times are exponential with rate $\mu$: one server finishes on average $\mu$ customers per hour of work, and the average service time is $1/\mu$.

**Kendall notation.** A queue is written A/B/c (or A/B/c/K): A describes arrivals, B service times, c is the number of servers and K the most customers the system can hold (no K means no limit). The letter M ("Markovian", memoryless) stands for Poisson arrivals or exponential service, D for fixed (deterministic) times and G for any distribution. So **M/M/1** is Poisson arrivals, exponential service and one server, and **M/M/c** has $c$ servers sharing one queue.

**Utilisation and stability.** With $c$ servers the utilisation is
$$\rho = \frac{\lambda}{c\,\mu},$$
the share of time each server is busy. The queue settles into a long-run pattern only if $\rho < 1$. If $\rho \ge 1$ customers arrive at least as fast as they can be served and the queue grows without limit.

**Measures.** $L$ is the average number of customers in the system (waiting or being served), $L_q$ the average number waiting in the queue, $W$ the average time a customer spends in the system and $W_q$ the average wait before service starts. Always $W = W_q + 1/\mu$.

**Little's law.** For any queue in a long-run steady state, whatever the arrival and service patterns,
$$L = \lambda W, \qquad L_q = \lambda W_q.$$
In words: the average number inside equals the arrival rate times the average time each customer stays. If 6 patients arrive at an emergency department per hour and each stays 3 hours, then on average 18 patients are inside.

**M/M/1 results** ($\rho = \lambda/\mu < 1$). Let $N$ be the number of customers in the system and $P_n = P(N = n)$ its long-run probabilities, the share of time with exactly $n$ customers present. Balancing the flows between $n$ and $n + 1$ customers, $\lambda P_n = \mu P_{n+1}$, gives $P_{n+1} = \rho P_n$, so $P_n = \rho^n P_0$. The probabilities add up to 1, and the geometric series (F08) gives $P_0 = 1 - \rho$:
$$P_0 = 1 - \rho, \qquad P_n = (1 - \rho)\rho^{n}, \qquad P(N \ge n) = \rho^{n}.$$
$P_0$ is the share of time the server is idle. A customer arriving at a random moment sees these same long-run probabilities (a property of Poisson arrivals), so $\rho$ is also the chance that an arriving customer has to wait. Then
$$L = \frac{\rho}{1 - \rho} = \frac{\lambda}{\mu - \lambda}, \qquad L_q = \frac{\rho^2}{1 - \rho} = L - \rho,$$
$$W = \frac{L}{\lambda} = \frac{1}{\mu - \lambda}, \qquad W_q = \frac{L_q}{\lambda} = \frac{\lambda}{\mu(\mu - \lambda)}.$$
Writing $W = \dfrac{1/\mu}{1 - \rho}$ shows the explosion: the time in the system is the service time multiplied by $1/(1 - \rho)$, which has no upper limit as $\rho \to 1$.

**M/M/c and the probability of waiting.** With $c$ servers and one shared queue, let $a = \lambda/\mu$ (the average number of busy servers) and $\rho = a/c < 1$. The probability that an arriving customer has to wait is the **Erlang C formula**
$$C(c, a) = \frac{\dfrac{a^{c}}{c!\,(1 - \rho)}}{\displaystyle\sum_{k=0}^{c-1}\frac{a^{k}}{k!} + \frac{a^{c}}{c!\,(1 - \rho)}}, \qquad L_q = C(c, a)\,\frac{\rho}{1 - \rho}, \qquad L = L_q + a,$$
and $W_q = L_q/\lambda$, $W = L/\lambda$ by Little's law. For $c = 2$ these simplify to
$$P_0 = \frac{1 - \rho}{1 + \rho}, \qquad C(2, a) = \frac{2\rho^2}{1 + \rho}, \qquad L_q = \frac{2\rho^3}{1 - \rho^2}, \qquad L = \frac{2\rho}{1 - \rho^2}.$$

**The staffing decision.** If each server costs $s$ per hour and each hour a customer spends in the system costs $w$ (lost working time, lost goodwill, lost sales), the total cost per hour is
$$TC(c) = c\,s + w\,L(c).$$
Adding a server raises the first term and lowers the second; choose the $c$ with the smallest total. A shared queue for $c$ servers always beats $c$ separate queues with the same staff, because no server sits idle while someone waits in another line.

**A finite waiting room: M/M/1/K.** If the system holds at most $K$ customers (a phone line with $K - 1$ places on hold, a car park, a waiting room), arrivals who find it full are turned away. The same balance gives
$$P_n = \frac{(1 - \rho)\,\rho^{n}}{1 - \rho^{K+1}}, \qquad n = 0, 1, \dots, K,$$
for $\rho \ne 1$ (and $P_n = 1/(K + 1)$ for $\rho = 1$). $P_K$ is the share of customers lost, and the rate actually served is $\lambda(1 - P_K)$. Here $\rho \ge 1$ is allowed, because the queue cannot grow without limit.

## Interactive
::widget{id="mm1-waiting-curve"}

The graph shows an M/M/1 queue. The lilac curve is the average time in the system $W$, in minutes, against the utilisation $\rho$, for the current service rate; the dashed green line is the service time $1/\mu$ alone, and the dashed gold line marks $\rho = 1$. Use the two sliders to set the arrival rate $\lambda$ and the service rate $\mu$ per hour; the dot marks the current queue and the panel shows $\rho$, $L$ and $W$. Check: at the start, $\lambda = 12$ and $\mu = 15$ as in Example 1, the panel shows $\rho = 0.8$, $L = 4$ and $W = 20$ minutes. Raise $\lambda$ to 14: $\rho$ only rises to 0.93, but $L$ jumps to 14 and $W$ to 60 minutes, and the dot climbs the steep part of the curve. Move $\lambda$ to 15 or more: the dot disappears, the graph says the queue is unstable and the panel shows "no limit" for $L$ and $W$. Then set $\lambda = 12$ and raise $\mu$ to 20: $\rho$ falls to 0.6, $W$ drops to 7.5 minutes and the whole curve moves down, because a faster server shortens every wait.

## Worked examples

### Example 1 (easy): one teller at a bank branch
Customers arrive at a bank branch at random, on average 12 per hour, and the only teller serves on average 15 customers per hour (4 minutes each), with exponential service times. Find the utilisation, the share of time the teller is idle, $L$, $L_q$, $W$ and $W_q$, check Little's law, and find the probability that an arriving customer finds at least 3 customers in the branch.

1. $\rho = \dfrac{12}{15} = 0.8 < 1$, $P_0 = 1 - 0.8 = 0.2$
   *Why:* the queue is stable because customers arrive more slowly than the teller can serve them; the teller is busy 80 % of the time and idle 20 %.
2. $L = \dfrac{0.8}{1 - 0.8} = 4$, $L_q = \dfrac{0.8^2}{1 - 0.8} = 3.2$
   *Why:* the M/M/1 formulas. $L - L_q = 0.8 = \rho$ is the average number being served, because the teller serves one customer at a time and is busy 80 % of the time.
3. $W = \dfrac{1}{15 - 12} = \dfrac{1}{3}$ hour $= 20$ minutes, $W_q = \dfrac{12}{15 \times 3} = \dfrac{4}{15}$ hour $= 16$ minutes
   *Why:* times come out in hours because the rates are per hour. $W - W_q = 4$ minutes is the service time $1/\mu$: each customer spends 16 minutes queueing for 4 minutes of service.
4. $\lambda W = 12 \times \tfrac{1}{3} = 4 = L$ and $\lambda W_q = 12 \times \tfrac{4}{15} = 3.2 = L_q$
   *Why:* Little's law links the counts and the times, so each pair can be found from the other.
5. $P(N \ge 3) = 0.8^3 = 0.512$
   *Why:* customers arriving at random see the long-run probabilities, and $P(N \ge n) = \rho^n$. Just over half of the customers find at least 3 people ahead of them.

```verify
lam = 12; mu = 15
rho = lam/mu
assert abs(rho - 0.8) < 1e-12
assert abs(1 - rho - 0.2) < 1e-12
L = rho/(1 - rho)
Lq = rho^2/(1 - rho)
assert abs(L - 4) < 1e-9
assert abs(Lq - 3.2) < 1e-9
assert abs(L - Lq - rho) < 1e-9
W = 1/(mu - lam)
Wq = lam/(mu*(mu - lam))
assert abs(W*60 - 20) < 1e-9
assert abs(Wq - 4/15) < 1e-12
assert abs(Wq*60 - 16) < 1e-9
assert abs((W - Wq)*60 - 4) < 1e-9
assert abs(lam*W - L) < 1e-9
assert abs(lam*Wq - Lq) < 1e-9
# second route: add up n(1 - rho)rho^n over many n
n = 0:2000
P = (1 - rho) * rho.^n
assert abs(sum(P) - 1) < 1e-12
assert abs(sum(n .* P) - 4) < 1e-9
assert abs(1 - sum(P[1:3]) - 0.512) < 1e-12
assert abs(rho^3 - 0.512) < 1e-12
```

### Example 2 (medium): a help line close to full capacity
A help line has one agent who handles on average 10 calls per hour (6 minutes per call). Calls arrive as a Poisson process. Find the average time a caller spends in the system and the average number of callers when calls arrive at 8, 9 and 9.5 per hour. Then suppose the phone system holds at most 4 callers (one talking to the agent, 3 on hold) and gives a busy signal to the rest: at 9 calls per hour, what share of callers is turned away?

1. $\lambda = 8$: $\rho = 0.8$, $W = \dfrac{1}{10 - 8} = 0.5$ hour $= 30$ minutes, $L = 8 \times 0.5 = 4$
   *Why:* $W = 1/(\mu - \lambda)$, then Little's law $L = \lambda W$. Equivalently, $W = 6/(1 - 0.8) = 30$ minutes: the 6-minute service time divided by $1 - \rho$.
2. $\lambda = 9$: $\rho = 0.9$, $W = \dfrac{1}{10 - 9} = 1$ hour $= 60$ minutes, $L = 9$
   *Why:* calls have risen by 12.5 %, but the spare capacity $\mu - \lambda$ has halved from 2 to 1 call per hour, so the time in the system doubles.
3. $\lambda = 9.5$: $\rho = 0.95$, $W = \dfrac{1}{0.5} = 2$ hours $= 120$ minutes, $L = 19$
   *Why:* another 0.5 calls per hour halves the spare capacity again and doubles the wait again. Near $\rho = 1$ small changes in demand have huge effects on waiting.
4. With room for $K = 4$ callers and $\rho = 0.9$: $P_4 = \dfrac{(1 - 0.9)\,0.9^4}{1 - 0.9^5} = \dfrac{0.06561}{0.40951} \approx 0.1602$
   *Why:* the finite-queue formula; a caller who rings when all 4 places are taken gets a busy signal, and callers arriving at random see the long-run probabilities.
5. About 16 % of callers are turned away, $9 \times 0.1602 \approx 1.44$ calls per hour, so the agent handles $9 - 1.44 = 7.56$ calls per hour
   *Why:* a full system blocks arrivals. The limit keeps the wait short for those who get through, at the cost of losing customers, which is a different kind of waiting cost.

```verify
mu = 10
W8 = 1/(mu - 8); W9 = 1/(mu - 9); W95 = 1/(mu - 9.5)
assert abs(W8*60 - 30) < 1e-9
assert abs(W9*60 - 60) < 1e-9
assert abs(W95*60 - 120) < 1e-9
assert abs(8*W8 - 4) < 1e-9
assert abs(9*W9 - 9) < 1e-9
assert abs(9.5*W95 - 19) < 1e-9
# the same through rho/(1 - rho) and the service time over 1 - rho
assert abs(0.8/(1 - 0.8) - 4) < 1e-9
assert abs(0.95/(1 - 0.95) - 19) < 1e-9
assert abs(6/(1 - 0.8) - 30) < 1e-9
assert abs(9/8 - 1.125) < 1e-12
# the multipliers 1/(1 - rho) quoted in the Intuition
assert abs(1/(1 - 0.5) - 2) < 1e-9
assert abs(1/(1 - 0.9) - 10) < 1e-9
assert abs(1/(1 - 0.95) - 20) < 1e-9
# finite room for K = 4 callers at rho = 0.9
rho = 0.9; K = 4
assert abs((1 - rho)*rho^4 - 0.06561) < 1e-12
assert abs(1 - rho^5 - 0.40951) < 1e-12
PK = (1 - rho)*rho^K/(1 - rho^(K + 1))
assert abs(PK - 0.1602) < 0.00005
# second route: P_n proportional to rho^n for n = 0..4, then normalise
w = rho.^(0:4)
assert abs(w[5]/sum(w) - PK) < 1e-12
assert abs(9*PK - 1.44) < 0.005
assert abs(9*(1 - PK) - 7.56) < 0.005
```

### Example 3 (hard): one teller or two?
The branch of Example 1 ($\lambda = 12$, $\mu = 15$ per hour) is thinking of opening a second teller's window, with one shared queue. A teller costs 20 per hour, and the bank values each hour a customer spends in the branch at 15 (lost goodwill and the risk of losing the customer). Find the probability of waiting, $L$ and $W$ with two tellers, compare the total hourly costs, find the waiting cost at which the two options cost the same, and compare one shared queue with two separate queues.

1. $\rho = \dfrac{12}{2 \times 15} = 0.4$, $P_0 = \dfrac{1 - 0.4}{1 + 0.4} = 0.4286$, $C(2,\ 0.8) = \dfrac{2 \times 0.4^2}{1 + 0.4} = 0.2286$
   *Why:* with two servers the utilisation per teller is $\lambda/(2\mu)$; the branch is empty 43 % of the time, and only 23 % of customers have to wait at all, against 80 % with one teller.
2. $L_q = \dfrac{2 \times 0.4^3}{1 - 0.4^2} = 0.1524$, $L = 0.1524 + 0.8 = 0.9524$, $W = \dfrac{0.9524}{12} = 0.0794$ hour $= 4.76$ minutes
   *Why:* $L = L_q + a$ with $a = \lambda/\mu = 0.8$ busy tellers on average, and Little's law gives $W$. The time in the branch falls from 20 to under 5 minutes.
3. $TC(1) = 20 + 15 \times 4 = 80$, $TC(2) = 2 \times 20 + 15 \times 0.9524 = 54.29$ per hour
   *Why:* staff cost plus the value of the customer-hours spent in the branch, which on average is $L$ customer-hours every hour. The second teller costs 20 but saves about 45.71 of customers' time, so two tellers are cheaper.
4. $20 + 4w = 40 + 0.9524\,w \Rightarrow w = \dfrac{20}{4 - 0.9524} = 6.56$
   *Why:* if an hour of a customer's time is worth more than about 6.56, the second teller pays for itself.
5. Two separate queues, each with $\lambda = 6$: $W = \dfrac{1}{15 - 6} = \dfrac{1}{9}$ hour $= 6.67$ minutes and $L = 2 \times \dfrac{6}{9} = 1.33$
   *Why:* with separate lines a customer can wait while the other teller is idle. The same two tellers with one shared queue give 4.76 minutes, which is why banks and service centres use a single queue or a ticket system.

```verify
lam = 12; mu = 15; s = 20; w = 15
rho = lam/(2*mu)
a = lam/mu
assert abs(rho - 0.4) < 1e-12
P0 = (1 - rho)/(1 + rho)
assert abs(P0 - 0.4286) < 0.00005
Cw = 2*rho^2/(1 + rho)
assert abs(Cw - 0.2286) < 0.00005
# general Erlang C with c = 2 gives the same
top = a^2/(factorial(2)*(1 - rho))
assert abs(top/(1 + a + top) - Cw) < 1e-12
Lq = 2*rho^3/(1 - rho^2)
assert abs(Lq - 0.1524) < 0.00005
assert abs(Cw*rho/(1 - rho) - Lq) < 1e-12
L2 = Lq + a
assert abs(L2 - 0.9524) < 0.00005
assert abs(L2 - 2*rho/(1 - rho^2)) < 1e-12
W2 = L2/lam
assert abs(W2 - 0.0794) < 0.00005
assert abs(W2*60 - 4.76) < 0.005
# second route for L2: P_n from the flow balance, summed over many n
n = 0:400
Pn = P0 * 2 * rho.^n
Pn[1] = P0
assert abs(sum(Pn) - 1) < 1e-12
assert abs(sum(n .* Pn) - L2) < 1e-9
TC1 = s + w*lam/(mu - lam)
TC2 = 2*s + w*L2
assert abs(TC1 - 80) < 1e-9
assert abs(TC2 - 54.29) < 0.005
assert abs(TC1 - TC2 - 25.71) < 0.005
assert abs(w*(4 - L2) - 45.71) < 0.005
wstar = s/(4 - L2)
assert abs(wstar - 6.56) < 0.005
assert abs(s + 4*wstar - (2*s + L2*wstar)) < 1e-9
Wsep = 1/(mu - 6)
assert abs(Wsep*60 - 6.67) < 0.005
assert abs(2*6/(mu - 6) - 1.33) < 0.005
assert Wsep > W2
```

## Common mistakes
- Giving the service time $1/\mu$ as the time in the system and forgetting the wait before service (SERVICE_ONLY).
- Mixing up $L$ and $L_q$, or $W$ and $W_q$: the system includes the customer being served, the queue does not (QUEUE_VS_SYSTEM).
- Taking the utilisation $\rho$ as the number of customers, instead of $\rho/(1 - \rho)$ (NO_ONE_MINUS).
- Leaving a time in hours when minutes are asked for, or multiplying a rate per hour by a time in minutes (MIXED_UNITS).
- Writing Little's law as $W = \lambda L$ or $L = W/\lambda$; check the units: customers = customers per hour × hours (LITTLE_REARRANGED).
- Giving $(1 - \rho)\rho^n$, the probability of exactly $n$ customers, when "at least $n$" is asked (EXACTLY_N).
- Using $\rho^{n+1}$ instead of $\rho^n$ for at least $n$ customers in the system (OFF_BY_ONE).
- Giving $1 - \rho^n$, the probability of fewer than $n$ (TAIL_COMPLEMENT).
- Costing only the customers in the queue, $w L_q$, when customers' time is also lost during service (LQ_NOT_L).
- Reporting the cost of the more expensive staffing option (DEARER_OPTION).
- Treating two servers with one shared queue as two separate M/M/1 queues, which overstates the waiting (SPLIT_QUEUE).
- Plugging numbers into the M/M/1 formulas when $\lambda \ge \mu$: a negative $L$ means the queue has no steady state at all (UNSTABLE).
- Thinking that a server with spare capacity on average ($\rho < 1$) means nobody waits: with random arrivals, queues form well before $\rho = 1$.
- Applying the M/M/1 formulas to an appointment system: when arrivals are scheduled rather than random, waiting is much shorter than the Poisson model predicts.

## Practice
- `littles-law-queue` (difficulty 1): Little's law in an emergency department, café, service centre or petrol station: the average time in minutes from $L$ and $\lambda$, or the average number inside from $\lambda$ and $W$; distractors LITTLE_REARRANGED, MIXED_UNITS.
- `mm1-queue-measures` (difficulty 1): one of $L$, $L_q$, $W$ or $W_q$ (times in minutes) for an M/M/1 queue from $\lambda$ and $\mu$ per hour; distractors NO_ONE_MINUS, QUEUE_VS_SYSTEM, SERVICE_ONLY, MIXED_UNITS.
- `mm1-at-least-n-probability` (difficulty 2): probability that a customer arriving at random finds at least $n$ customers in an M/M/1 system, $\rho^n$, to 4 decimal places; distractors EXACTLY_N, OFF_BY_ONE, TAIL_COMPLEMENT.
- `mm2-staffing-cost` (difficulty 3): total hourly cost of the cheaper option, one server or two servers with a shared queue, from server and waiting costs; distractors DEARER_OPTION, LQ_NOT_L, SPLIT_QUEUE.

## Real world
- Call centres: the Erlang C formula, first worked out for telephone exchanges about a century ago, is still the standard tool for planning how many agents to roster each half hour so that, say, 80 % of calls are answered within 20 seconds.
- Public services and banks: public service centres, passport offices and bank branches use one shared queue with numbered tickets rather than a line per desk, which is the pooling effect of Example 3, and move staff between desks as arrival rates change through the day.
- Hospitals: emergency departments and intensive care units run close to full utilisation, so small rises in arrivals (a flu season) cause large rises in waiting times and in patients turned away, as in Example 2. Hospital planners use queueing models to size beds and staff rotas.
- Economics of rationing and congestion: where a service is free at the point of use, waiting time acts as its price, and queueing models estimate how much waiting a policy adds or removes. The same models price congestion at ports, toll booths, airports and petrol stations, and help firms choose capacity where demand is random.

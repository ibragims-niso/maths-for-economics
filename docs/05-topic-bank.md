# 05 — Topic bank (Core)

102 topics in 16 blocks. IDs are permanent. `Core year` is the default placement; university tracks reorder and regroup topics (docs/06-tracks.md). Machine-readable copy: generate `content/topic-bank.json` from this table in Phase 0 and validate that the prerequisite graph has no cycles.

## Year 1

### F — Foundations
| ID | Title | Prerequisites | Economic use |
|---|---|---|---|
| F01 | Algebra and exponent rules | — | Rearranging cost, revenue and growth formulas |
| F02 | Linear and quadratic equations, inequalities | F01 | Break-even points, budget constraints |
| F03 | Functions, domain, range and graphs | F01 | Demand, supply and cost as functions |
| F04 | Linear functions in economics | F03 | Linear demand, supply and cost |
| F05 | Market equilibrium and 2×2 linear systems | F02, F04 | Equilibrium price and quantity, tax incidence |
| F06 | Quadratic functions: revenue and profit | F02, F03 | Revenue and profit maximisation before calculus |
| F07 | Exponential and logarithmic functions | F01, F03 | Growth, inflation, log-linear models |
| F08 | Sequences and series | F07 | Multiplier effects, repeated payments |
| F09 | Sets, logic and summation notation | F01 | Reading models and statistical formulas |
| F10 | Inverse and composite functions | F03 | Inverse demand, cost of output through inputs |

### FM — Financial mathematics
| ID | Title | Prerequisites | Economic use |
|---|---|---|---|
| FM01 | Simple and compound interest | F07 | Deposits and loans |
| FM02 | Continuous compounding and effective annual rate | FM01 | Comparing offers with different compounding |
| FM03 | Present value and discounting | FM01 | Valuing future cash flows |
| FM04 | Annuities and perpetuities | FM03, F08 | Pensions, bonds, lease payments |
| FM05 | Loan and lease amortisation schedules | FM04 | Instalments; interest vs principal split |
| FM06 | Net present value and internal rate of return | FM03 | Investment appraisal |
| FM07 | Bond pricing and yield | FM04 | Fixed-income markets |

### C1 — Single-variable calculus
| ID | Title | Prerequisites | Economic use |
|---|---|---|---|
| C101 | Limits and continuity | F03 | Behaviour of costs and functions at the margin |
| C102 | The derivative as a rate of change | C101 | Foundation of marginal analysis |
| C103 | Differentiation rules | C102 | Computing marginal functions |
| C104 | The chain rule | C103 | Output depending on inputs depending on time |
| C105 | Derivatives of exponentials and logarithms; growth rates | C104, F07 | Growth rates, log differences |
| C106 | Marginal analysis | C103 | Marginal cost, revenue and product |
| C107 | Elasticity | C106 | Pricing decisions, tax incidence |
| C108 | Second derivative, concavity and convexity | C103 | Diminishing returns, risk attitudes |
| C109 | Optimisation in one variable | C108 | Profit maximisation, cost minimisation |
| C110 | Implicit differentiation | C104 | Slopes of indifference curves and isoquants |
| C111 | Linear and quadratic approximation (Taylor) | C108 | Approximating changes; bond duration and convexity |
| C112 | Indefinite integrals | C103 | Total cost from marginal cost |
| C113 | Definite integrals and area | C112 | Accumulated quantities over time |
| C114 | Consumer and producer surplus | C113, F05 | Welfare analysis, effects of taxes |
| C115 | Integration by substitution and by parts | C113 | Present value of income streams |
| C116 | Improper integrals and continuous discounting | C113, FM02 | Value of perpetual streams |

### LA1 — Linear algebra I
| ID | Title | Prerequisites | Economic use |
|---|---|---|---|
| LA101 | Vectors and vector operations | F01 | Bundles of goods, price vectors, cost of a bundle |
| LA102 | Matrices and matrix operations | LA101 | Data tables, transformations |
| LA103 | Linear systems and Gaussian elimination | LA102, F05 | Multi-market equilibrium |
| LA104 | Determinants and Cramer's rule | LA103 | Comparative statics of linear models |
| LA105 | The inverse matrix | LA104 | Solving models; basis for OLS |
| LA106 | Input–output (Leontief) model | LA105 | Inter-industry linkages |

### ST1 — Probability and statistics I
| ID | Title | Prerequisites | Economic use |
|---|---|---|---|
| ST101 | Descriptive statistics | F09 | Summarising wages, prices, inflation |
| ST102 | Probability and counting | F09 | Risk and uncertainty |
| ST103 | Random variables, expectation and variance | ST102 | Expected return and risk |
| ST104 | Binomial and Poisson distributions | ST103 | Loan defaults, customer arrivals |
| ST105 | The normal distribution | ST103 | Returns, measurement errors |

## Year 2

### MV — Multivariable calculus and optimisation
| ID | Title | Prerequisites | Economic use |
|---|---|---|---|
| MV01 | Functions of several variables and level curves | C109 | Utility, production, isoquants |
| MV02 | Partial derivatives | MV01, C103 | Marginal products and marginal utilities |
| MV03 | Total differential and multivariable chain rule | MV02, C104 | Comparative statics |
| MV04 | Homogeneous functions and Euler's theorem | MV02 | Returns to scale |
| MV05 | Implicit function theorem | MV03, C110 | Marginal rate of substitution and of technical substitution |
| MV06 | Convexity, concavity and quasiconcavity | MV02, C108 | Well-behaved preferences and technologies |
| MV07 | Unconstrained optimisation and the Hessian | MV02, LA104 | Multi-product firm, price discrimination |
| MV08 | The Lagrange method (equality constraints) | MV07 | Utility maximisation subject to a budget |
| MV09 | The Lagrange multiplier as shadow price | MV08 | Value of relaxing a constraint |
| MV10 | Utility maximisation and demand functions | MV08 | Consumer theory |
| MV11 | Cost minimisation and Cobb–Douglas technology | MV08, MV04 | Producer theory |
| MV12 | The envelope theorem | MV09 | Roy's identity, Shephard's lemma |
| MV13 | Double integrals (introduction) | C113, MV01 | Joint probabilities, aggregate quantities |

### LA2 — Linear algebra II
| ID | Title | Prerequisites | Economic use |
|---|---|---|---|
| LA201 | Linear independence, rank and spanning | LA105 | Identification, redundant equations |
| LA202 | Eigenvalues and eigenvectors | LA201 | Dynamics, Markov chains |
| LA203 | Diagonalisation | LA202 | Solving dynamic systems |
| LA204 | Quadratic forms and definiteness | LA202, MV07 | Second-order conditions |

### ST2 — Probability and statistics II
| ID | Title | Prerequisites | Economic use |
|---|---|---|---|
| ST201 | Joint distributions, covariance and correlation | ST103 | Portfolio risk, co-movement of variables |
| ST202 | Sampling distributions and the central limit theorem | ST105 | Survey data |
| ST203 | Estimation and confidence intervals | ST202 | Estimating unemployment or inflation |
| ST204 | Hypothesis testing | ST203 | Evaluating policies |
| ST205 | Simple linear regression | ST201, ST204 | Estimating demand |

## Year 3

### OP — Optimisation II
| ID | Title | Prerequisites | Economic use |
|---|---|---|---|
| OP01 | Inequality constraints and Kuhn–Tucker conditions | MV08, MV06 | Corner solutions, rationing |
| OP02 | Linear programming | LA103 | Production planning, diet and transport problems |
| OP03 | Duality in linear programming | OP02, MV09 | Shadow prices of resources |
| OP04 | Comparative statics in optimisation problems | MV12, MV05 | Effect of prices and income on choices |

### DY — Dynamics
| ID | Title | Prerequisites | Economic use |
|---|---|---|---|
| DY01 | First-order difference equations | F08 | Cobweb model, debt dynamics |
| DY02 | Second-order difference equations | DY01 | Multiplier–accelerator model |
| DY03 | First-order differential equations | C112, C105 | Continuous growth, Solow model |
| DY04 | Second-order differential equations | DY03 | Price adjustment dynamics |
| DY05 | Systems of equations and phase diagrams | DY03, LA202 | Macroeconomic dynamics |
| DY06 | Stability of equilibria | DY05, DY02 | Does the economy return to equilibrium? |

### EM — Mathematics of econometrics
| ID | Title | Prerequisites | Economic use |
|---|---|---|---|
| EM01 | Multiple regression in matrix form (OLS) | ST205, LA105 | Wage equations, demand estimation |
| EM02 | Properties of OLS and the Gauss–Markov theorem | EM01 | When estimates can be trusted |
| EM03 | Inference in regression: t and F tests | EM02, ST204 | Testing economic hypotheses |
| EM04 | Heteroskedasticity and autocorrelation | EM03 | Correcting standard errors |
| EM05 | Maximum likelihood estimation | ST203, C109 | Discrete choice models |
| EM06 | Time-series basics: AR, MA, stationarity | DY01, EM03 | Inflation and GDP forecasting |

### GT — Game theory mathematics
| ID | Title | Prerequisites | Economic use |
|---|---|---|---|
| GT01 | Normal-form games and Nash equilibrium | F09 | Oligopoly, price wars |
| GT02 | Mixed strategies | GT01, ST103 | Auditing, penalty kicks, inspections |
| GT03 | Extensive-form games and backward induction | GT01 | Entry deterrence, bargaining |
| GT04 | Repeated games and discounting | GT03, F08 | Cartels and cooperation |

## Year 4

### AN — Analysis for economists
| ID | Title | Prerequisites | Economic use |
|---|---|---|---|
| AN01 | Logic and proof techniques | F09 | Reading and writing economic theory |
| AN02 | Sequences, limits and completeness | AN01, C101 | Convergence of algorithms and dynamics |
| AN03 | Continuity and the extreme value theorem | AN02 | Existence of optimal choices |
| AN04 | Open, closed and compact sets in ℝⁿ | AN03 | Budget sets, feasible sets |
| AN05 | Fixed-point theorems and existence of equilibrium | AN04 | General equilibrium, Nash existence |

### DO — Dynamic optimisation
| ID | Title | Prerequisites | Economic use |
|---|---|---|---|
| DO01 | Calculus of variations (introduction) | DY03, C115 | Optimal paths over time |
| DO02 | Optimal control and the Hamiltonian | DO01, MV08 | Resource extraction, optimal growth |
| DO03 | Dynamic programming and the Bellman equation | DY01, C109 | Consumption–saving, job search |
| DO04 | Mathematics of the Ramsey growth model | DO02, DY05 | Optimal saving for an economy |

### SP — Uncertainty and stochastic processes
| ID | Title | Prerequisites | Economic use |
|---|---|---|---|
| SP01 | Markov chains | LA202, ST102 | Labour-market flows, credit ratings |
| SP02 | Expected utility and risk aversion | C108, ST103 | Insurance, portfolio choice |
| SP03 | Random walks and Brownian motion (intuition) | SP01, ST105 | Asset prices |
| SP04 | Option pricing intuition: the binomial model | SP03, FM03 | Derivatives pricing |

### NM — Numerical methods
| ID | Title | Prerequisites | Economic use |
|---|---|---|---|
| NM01 | Root finding: bisection and Newton's method | C111 | Computing IRR, equilibria without closed form |
| NM02 | Numerical optimisation: gradient methods | MV07 | Estimating models |
| NM03 | Monte Carlo simulation | ST202 | Risk analysis, stress tests |

## Counts
Year 1: 44, Year 2: 22, Year 3: 20, Year 4: 16. Total: 102.

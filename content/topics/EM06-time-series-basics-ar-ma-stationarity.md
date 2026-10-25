---
id: EM06
title: "Time-series basics: AR, MA, stationarity"
block: EM
coreYear: 3
prerequisites: [DY01, EM03]
estMinutes: 50
status: draft
economicUses:
  - "Inflation persistence: how long a price shock keeps inflation away from target"
  - Short-term forecasts of GDP growth, inflation and unemployment
  - "Exchange rates and oil prices: why the best forecast is often today's value"
  - Deciding whether to use a series in levels or in differences before running a regression
searchTerms:
  - "ARMA"
  - "Stationarity"
generators: [ar1-mean-or-variance, ma1-lag1-autocorrelation, ar1-forecast-h-steps]
widgets: [ar1-shock-path]
mistakeCodes:
  IGNORED_PERSISTENCE:
    label: Left out the persistence φ
    explanation: In an AR(1) every period keeps a share φ of the last value, so effects build up. The mean is c/(1 − φ), not c, and the variance is σ²/(1 − φ²), not σ².
  MEAN_DENOM_SIGN:
    label: Divided by 1 + φ instead of 1 − φ
    explanation: The mean solves μ = c + φμ. Moving φμ to the left gives μ(1 − φ) = c, so μ = c/(1 − φ).
  MEAN_MULTIPLIED:
    label: Multiplied c by 1 − φ instead of dividing
    explanation: From μ(1 − φ) = c you divide by 1 − φ, which makes the mean larger than c when 0 < φ < 1. Multiplying makes it smaller, the wrong way round.
  PHI_NOT_SQUARED:
    label: Used 1 − φ instead of 1 − φ² in the variance
    explanation: Multiplying y(t − 1) by φ multiplies its variance by φ², so the variance solves γ₀ = φ²γ₀ + σ² and equals σ²/(1 − φ²).
  SIGMA_NOT_SQUARED:
    label: Used σ instead of σ²
    explanation: The formula needs the variance of the shocks. When you are given their standard deviation σ, square it first, σ², and then divide by 1 − φ².
  FORECAST_NO_MEAN:
    label: Shrank the latest value instead of its distance from the mean
    explanation: Forecasts move towards the mean μ, not towards 0. Shrink the gap y(T) − μ by φ once per period and add μ back, ŷ(T + h) = μ + φʰ(y(T) − μ).
  ONE_STEP_ONLY:
    label: Gave the one-step forecast for a longer horizon
    explanation: c + φ·y(T) is the forecast for next period only. For h periods ahead apply the rule h times, or use μ + φʰ(y(T) − μ).
  LONG_RUN_MEAN_ONLY:
    label: Gave the long-run mean instead of the forecast
    explanation: The mean is where forecasts are heading, not where they are after h periods. Add the part of today's gap that is still left, φʰ(y(T) − μ).
  INTERCEPT_AS_MEAN:
    label: Used the intercept c as the mean
    explanation: The mean of an AR(1) is c/(1 − φ), not the intercept c. Find μ first, then forecast μ + φʰ(y(T) − μ).
  RHO_EQUALS_THETA:
    label: Took θ as the autocorrelation
    explanation: θ is the weight of the old shock, not a correlation. Divide the autocovariance θσ² by the variance σ²(1 + θ²), which gives ρ₁ = θ/(1 + θ²).
  THETA_SQUARED:
    label: Squared θ
    explanation: Neighbouring values share the shock ε(t − 1) once with weight θ and once with weight 1, so the covariance is θσ², not θ²σ². The correlation is θ/(1 + θ²).
  MA_DENOM_SIGN:
    label: Divided by 1 − θ² instead of 1 + θ²
    explanation: The variance of ε(t) + θε(t − 1) is σ² + θ²σ², because variances of uncorrelated shocks add. So ρ₁ = θ/(1 + θ²), which is never larger than 1/2 in size.
  COVARIANCE_NOT_CORRELATION:
    label: Gave the autocovariance θσ² instead of the autocorrelation
    explanation: θσ² is the covariance of neighbouring values and depends on the units. Divide by the variance σ²(1 + θ²) to get the correlation, a number between −1 and 1.
resources:
  - { title: "Forecasting: Principles and Practice (3rd ed), 9 ARIMA models (Hyndman and Athanasopoulos)", url: "https://otexts.com/fpp3/arima.html", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "STAT 510, 1 Time Series Basics (Penn State)", url: "https://online.stat.psu.edu/stat510/Lesson01", kind: course, verifiedAt: 2026-10-18 }
  - { title: "STAT 510, 2 MA Models, Partial Autocorrelation, Notational Conventions (Penn State)", url: "https://online.stat.psu.edu/stat510/Lesson02", kind: course, verifiedAt: 2026-10-18 }
---

## Why economists need this
Most economic data arrive as a **time series**: inflation every month, GDP every quarter, an exchange rate every day. Such data are not like a sample of households. This month's inflation is closely related to last month's, and that link is exactly what a central bank wants to measure. If inflation jumps to 9 % after an oil shock, will it be back near 3 % within a year, or will it stay high for several years? How far ahead can GDP growth usefully be forecast? Is the exchange rate pulled back towards some normal level, or does it simply wander? This topic gives the simplest models that answer these questions, the **autoregressive** (AR) and **moving-average** (MA) models, and the idea that decides whether the usual regression tools of EM01–EM03 can be used on a series at all: **stationarity**.

## Intuition
Think of a time series as one run of a random process. History has played out only once, so we observe one path $y_1, y_2, \dots, y_T$, and every $y_t$ was a random variable before it happened.

The simplest random series is **white noise**: independent-looking shocks with mean 0 and the same spread every period. Nothing about today helps to predict tomorrow. Economic series have **memory**, and there are two simple ways to give a series memory:

- **Autoregression (AR):** today's value keeps a share $\varphi$ of yesterday's value and adds a new shock. A shock then fades geometrically, as a share $\varphi$, then $\varphi^2$, then $\varphi^3$ of it remains. This is DY01's difference equation $y_t = a\,y_{t-1} + b$ with a random kick each period.
- **Moving average (MA):** today's value is today's shock plus part of yesterday's shock. A shock then affects exactly two periods and is completely gone after that.

A series is **stationary** when its behaviour does not depend on the date: the same mean, the same spread and the same pattern of links between periods, whether we look at the 1990s or the 2010s. A stationary series keeps coming back to its mean. The AR model is stationary exactly when its difference equation is stable, $|\varphi| < 1$. At $\varphi = 1$ shocks never fade: the series becomes a **random walk**, which drifts anywhere and has no mean to return to. Many asset prices and exchange rates behave almost like this.

## Definition and formulas
**Time series and white noise.** A time series is a sequence of random variables $\{y_t\}$, $t = 1, 2, \dots$. The series $\{\varepsilon_t\}$ is **white noise** with variance $\sigma^2$ if
$$E[\varepsilon_t] = 0, \qquad \operatorname{Var}(\varepsilon_t) = \sigma^2, \qquad \operatorname{Cov}(\varepsilon_t, \varepsilon_s) = 0 \ \text{ for } t \ne s .$$

**Weak stationarity.** $\{y_t\}$ is (weakly) stationary if, for every $t$ and every lag $k$,
$$E[y_t] = \mu, \qquad \operatorname{Var}(y_t) = \gamma_0, \qquad \operatorname{Cov}(y_t, y_{t-k}) = \gamma_k ,$$
with $\mu$, $\gamma_0$ and $\gamma_k$ the same for every $t$: the autocovariance depends only on the lag $k$, not on the date. The **autocorrelation** at lag $k$ is the correlation (ST201) between values $k$ periods apart:
$$\rho_k = \frac{\gamma_k}{\gamma_0}, \qquad \rho_0 = 1, \quad -1 \le \rho_k \le 1 .$$
Plotted against $k$, the $\rho_k$ form the **autocorrelation function (ACF)**. White noise has $\rho_k = 0$ for every $k \ge 1$.

**The AR(1) model.**
$$y_t = c + \varphi\,y_{t-1} + \varepsilon_t, \qquad \varepsilon_t \text{ white noise with variance } \sigma^2 .$$
The deterministic part is DY01's equation with $a = \varphi$ and $b = c$. Substituting backwards again and again gives
$$y_t = \mu + \varepsilon_t + \varphi\,\varepsilon_{t-1} + \varphi^2\varepsilon_{t-2} + \dots ,$$
a weighted sum of all past shocks. A shock of size 1 today raises $y$ by $\varphi^k$ after $k$ periods (the **impulse response**). The weights die out exactly when $|\varphi| < 1$, and then the process is stationary with

$$\mu = \frac{c}{1 - \varphi}, \qquad \gamma_0 = \frac{\sigma^2}{1 - \varphi^2}, \qquad \rho_k = \varphi^k .$$

*Why:* take expectations of both sides: $\mu = c + \varphi\mu$, the steady state of DY01. Take variances: the new shock is uncorrelated with $y_{t-1}$, so $\gamma_0 = \varphi^2\gamma_0 + \sigma^2$. Take the covariance with $y_{t-k}$: $\gamma_k = \varphi\,\gamma_{k-1}$, so the autocorrelations fall geometrically, $\varphi, \varphi^2, \varphi^3, \dots$ With $0 < \varphi < 1$ they stay positive and decay slowly when $\varphi$ is near 1 (a **persistent** series); with $\varphi < 0$ they alternate in sign and the series zig-zags. The closer $|\varphi|$ is to 1, the larger the variance: the series carries more of its past shocks.

**The MA(1) model.**
$$y_t = \mu + \varepsilon_t + \theta\,\varepsilon_{t-1} .$$
It is stationary for every $\theta$, with
$$E[y_t] = \mu, \qquad \gamma_0 = \sigma^2(1 + \theta^2), \qquad \gamma_1 = \theta\sigma^2, \qquad \rho_1 = \frac{\theta}{1 + \theta^2}, \qquad \rho_k = 0 \ \text{ for } k \ge 2 .$$
Neighbouring values share the shock $\varepsilon_{t-1}$; values two or more periods apart share nothing. So the ACF of an MA(1) **cuts off** after lag 1, while the ACF of an AR(1) **decays** gradually. Since $|\theta/(1 + \theta^2)| \le \tfrac12$, an MA(1) can never have a lag-1 autocorrelation above 0.5 in size. The values $\theta$ and $1/\theta$ give the same $\rho_1$; by convention we pick the one with $|\theta| < 1$.

**ARMA.** An ARMA(1,1) model, $y_t = c + \varphi\,y_{t-1} + \varepsilon_t + \theta\,\varepsilon_{t-1}$, combines both kinds of memory, and ARMA($p$, $q$) models allow $p$ lagged values and $q$ lagged shocks.

**The random walk and unit roots.** With $\varphi = 1$,
$$y_t = c + y_{t-1} + \varepsilon_t = y_0 + c\,t + \varepsilon_1 + \varepsilon_2 + \dots + \varepsilon_t ,$$
a **random walk** (with **drift** $c$). Every shock stays in the series for ever. Given $y_0$, $E[y_t] = y_0 + c\,t$ and $\operatorname{Var}(y_t) = t\,\sigma^2$: the variance grows without limit, so the series is **not** stationary, and $c/(1 - \varphi)$ does not exist. The AR(1) is often written with the polynomial $1 - \varphi z$, whose root $z = 1/\varphi$ equals 1 exactly when $\varphi = 1$; so such a series is said to have a **unit root**. Its first difference,
$$\Delta y_t = y_t - y_{t-1} = c + \varepsilon_t ,$$
is stationary: **differencing removes a unit root**. A series that becomes stationary after one difference is called **integrated of order 1**, I(1). For a series in logs, $\Delta \ln y_t$ is approximately the growth rate (ST107), so "difference the log" usually means "work with growth rates".

**Trends.** A **deterministic trend**, $y_t = a + b\,t + u_t$ with $u_t$ stationary, keeps returning to the line $a + bt$; it is removed by regressing on $t$ and using the residuals. A **stochastic trend**, a random walk with drift, has no line to return to; it is removed by differencing. Telling the two apart matters: after a recession a trend-stationary GDP would catch up with its old path, while a GDP with a unit root would stay permanently lower.

**The sample ACF.** From data $y_1, \dots, y_T$ with mean $\bar y$, the sample autocorrelation at lag $k$ is
$$r_k = \frac{\sum_{t=k+1}^{T}(y_t - \bar y)(y_{t-k} - \bar y)}{\sum_{t=1}^{T}(y_t - \bar y)^2} .$$
In words: how strongly the series is correlated with itself $k$ periods earlier. For white noise the $r_k$ lie within about $\pm 2/\sqrt{T}$ in 95 % of cases, so values outside that band signal real memory. The shape suggests a model: gradual geometric decay suggests an AR, a cut-off after lag 1 suggests an MA(1), and a very slow, almost straight-line decline from close to 1 suggests a unit root.

**Forecasting with an AR(1).** At time $T$ the best forecast of $y_{T+1}$ is its expected value given the data, $\hat y_{T+1} = c + \varphi\,y_T$, because the future shock has mean 0. Repeating the step,
$$\hat y_{T+h} = \mu + \varphi^h\,(y_T - \mu) .$$
The forecast is the mean plus today's gap, shrunk by $\varphi$ once per period ahead: the general solution of DY01, with the gap closing towards $\mu$. The forecast error is $\varepsilon_{T+h} + \varphi\,\varepsilon_{T+h-1} + \dots + \varphi^{h-1}\varepsilon_{T+1}$, with variance
$$\sigma^2\,(1 + \varphi^2 + \dots + \varphi^{2(h-1)}) = \sigma^2\,\frac{1 - \varphi^{2h}}{1 - \varphi^2} ,$$
which grows with $h$ towards the variance $\gamma_0$ of the series itself: far ahead the model knows only the mean. For a random walk the best forecast is $\hat y_{T+h} = y_T + c\,h$, today's value plus the drift, and the error variance $h\sigma^2$ grows without limit.

**Testing for a unit root (Dickey–Fuller), in words.** Subtract $y_{t-1}$ from both sides of the AR(1):
$$\Delta y_t = c + \gamma\,y_{t-1} + \varepsilon_t, \qquad \gamma = \varphi - 1 .$$
A unit root means $\gamma = 0$; a stationary series has $\gamma < 0$. The Dickey–Fuller test takes $H_0\!: \gamma = 0$ against $H_1\!: \gamma < 0$ and uses the usual $t$ ratio $\hat\gamma / \operatorname{SE}(\hat\gamma)$ of EM03. Under $H_0$, however, $y_{t-1}$ is a random walk and the ratio does **not** follow the $t$ distribution: it tends to be more negative. With a constant in the regression, the 5 % critical value is about $-2.86$ in large samples, instead of $-1.65$. If the statistic is not below the critical value, we cannot reject a unit root and usually difference the series. Running ordinary regressions on series with unit roots is dangerous: two unrelated random walks often appear "significantly" related (a **spurious regression**), because both wander and the usual $t$ statistics are invalid.

## Interactive
::widget{id="ar1-shock-path"}

The lilac line is an AR(1) path $y_t = c + \varphi\,y_{t-1} + \varepsilon_t$ over 60 periods, starting at 3, with the same 60 shocks ($\sigma = 1.2$) whatever you do; the dashed green line is the mean and the gold band the mean ± 2 standard deviations. At the start ($\varphi = 0.6$, $c = 1.2$, the inflation model of Example 1) the panel shows Mean μ = 3, Variance = 2.25 and Autocorr. ρ₁ = 0.6, and the path ends at 3.65. Drag **Persistence φ** up to 0.95: the same shocks now produce long swings, the mean jumps to 24 and the variance to 14.77, and the path, still climbing from 3, ends at 22.63. Drag it down to −0.95: the path zig-zags around a mean of 0.62. Now set φ to 1: the panel says the mean is "none: random walk" and the variance "grows: t·σ²". With **Intercept c** at 0 the walk wanders and ends at 1.61; raise c to 1.2 and it drifts upwards by about 1.2 a period to end at 73.61. The intercept moves the level of a stationary series but never changes its variance or autocorrelation.

## Worked examples

### Example 1 (easy): how persistent is inflation?
A central bank's economists estimate that annual inflation (in %) follows $\pi_t = 1.2 + 0.6\,\pi_{t-1} + \varepsilon_t$, where $\varepsilon_t$ is white noise with standard deviation $\sigma = 1.2$. Is the process stationary? Find the mean, the variance and standard deviation of inflation, and the autocorrelations at lags 1 to 3. How long does a shock take to fade below a tenth of its size?

1. $|\varphi| = 0.6 < 1$, so the process is stationary.
   *Why:* the deterministic part $\pi_t = 1.2 + 0.6\,\pi_{t-1}$ is a stable difference equation (DY01), so each shock dies out and the mean and variance do not change over time.
2. $\mu = \dfrac{c}{1 - \varphi} = \dfrac{1.2}{0.4} = 3$
   *Why:* taking expectations, $\mu = 1.2 + 0.6\mu$. Inflation averages 3 %, not 1.2 %: the intercept is topped up by 60 % of last year's inflation every year.
3. $\gamma_0 = \dfrac{\sigma^2}{1 - \varphi^2} = \dfrac{1.44}{1 - 0.36} = \dfrac{1.44}{0.64} = 2.25, \qquad \sqrt{2.25} = 1.5$
   *Why:* inflation carries this year's shock plus fading parts of all earlier ones, so it varies more than a single shock. About 95 % of years lie within $3 \pm 2 \times 1.5$, between 0 % and 6 %.
4. $\rho_1 = 0.6, \quad \rho_2 = 0.6^2 = 0.36, \quad \rho_3 = 0.6^3 = 0.216$
   *Why:* in an AR(1) $\rho_k = \varphi^k$. Inflation is strongly linked to last year's value and more weakly to the years before.
5. $0.6^4 = 0.1296 > 0.1, \quad 0.6^5 = 0.07776 < 0.1$: about 5 years
   *Why:* a shock of 1 point today adds $0.6^k$ points after $k$ years (the impulse response). Here it is below a tenth of its size after 5 years. If $\varphi$ were 0.9 with the same mean ($c = 0.3$), the variance would be $1.44/0.19 = 7.58$ and the shock would take 22 years to fall below a tenth: much more persistent inflation.

```verify
c = 1.2; phi = 0.6; s = 1.2
assert abs(phi) < 1
mu = c/(1 - phi)
assert abs(mu - 3) < 1e-12
assert abs(c + phi*mu - mu) < 1e-12
g0 = s^2/(1 - phi^2)
assert abs(s^2 - 1.44) < 1e-12
assert abs(1 - phi^2 - 0.64) < 1e-12
assert abs(g0 - 2.25) < 1e-12
assert abs(sqrt(g0) - 1.5) < 1e-12
assert abs(mu - 2*sqrt(g0)) < 1e-12 and abs(mu + 2*sqrt(g0) - 6) < 1e-12
# the variance as the sum of all past shocks' contributions
v = sum(s^2 * (phi .^ (2 * (0:400))))
assert abs(v - g0) < 1e-9
assert abs(phi^2 - 0.36) < 1e-12
assert abs(phi^3 - 0.216) < 1e-12
assert abs(phi^4 - 0.1296) < 1e-12
assert abs(phi^5 - 0.07776) < 1e-12
assert ceil(log(0.1)/log(phi)) == 5
# the persistent alternative
assert abs(3*(1 - 0.9) - 0.3) < 1e-12
assert abs(1.44/(1 - 0.81) - 7.58) < 0.005
assert ceil(log(0.1)/log(0.9)) == 22
```

### Example 2 (medium): forecasting GDP growth out of a recession
Quarterly GDP growth (annualised, in %) follows $g_t = 0.75 + 0.7\,g_{t-1} + \varepsilon_t$ with $\sigma = 1.5$. In the latest quarter the economy shrank: $g_T = -0.5$. Forecast growth 1, 2 and 4 quarters ahead, find how quickly the gap to normal growth halves, and say how uncertain the forecasts are.

1. $\mu = \dfrac{0.75}{1 - 0.7} = 2.5$, so today's gap is $g_T - \mu = -0.5 - 2.5 = -3$
   *Why:* forecasts are pulled towards normal growth, the mean of the series; the latest quarter is 3 points below it.
2. $\hat g_{T+1} = 0.75 + 0.7 \times (-0.5) = 0.4 = 2.5 + 0.7 \times (-3)$
   *Why:* next quarter's shock has mean 0, so the forecast is the model without it. Both ways of writing it agree.
3. $\hat g_{T+2} = 2.5 + 0.7^2 \times (-3) = 2.5 - 1.47 = 1.03, \qquad \hat g_{T+4} = 2.5 + 0.7^4 \times (-3) = 2.5 - 0.7203 = 1.78$
   *Why:* $\hat g_{T+h} = \mu + \varphi^h(g_T - \mu)$: the expected gap shrinks by the factor 0.7 every quarter, so growth is forecast to recover gradually, never overshooting 2.5.
4. $0.7^h = 0.5 \;\Rightarrow\; h = \dfrac{\ln 0.5}{\ln 0.7} = 1.94$, about 2 quarters
   *Why:* this is the half-life of the gap, as in DY01: after about two quarters half of the shortfall is expected to be made up.
5. Forecast error standard deviations: $1.5$ one quarter ahead, $1.5\sqrt{1 + 0.49} = 1.83$ two quarters ahead, and at most $\dfrac{1.5}{\sqrt{1 - 0.49}} = 2.10$
   *Why:* every quarter ahead adds a new unknown shock, so uncertainty grows towards the standard deviation of growth itself. A rough 95 % interval for next quarter, $0.4 \pm 1.96 \times 1.5$, runs from $-2.54$ to $3.34$: the point forecast says recovery, but another negative quarter is quite possible.

```verify
c = 0.75; phi = 0.7; s = 1.5; gT = -0.5
mu = c/(1 - phi)
assert abs(mu - 2.5) < 1e-12
gap = gT - mu
assert abs(gap + 3) < 1e-12
f1 = c + phi*gT
assert abs(f1 - 0.4) < 1e-12
assert abs(mu + phi*gap - f1) < 1e-12
# iterate the one-step rule and compare with the closed form
f2 = c + phi*f1
f3 = c + phi*f2
f4 = c + phi*f3
assert abs(f2 - (mu + phi^2*gap)) < 1e-12
assert abs(phi^2*3 - 1.47) < 1e-12
assert abs(f2 - 1.03) < 1e-12
assert abs(phi^4*3 - 0.7203) < 1e-12
assert abs(f4 - (mu + phi^4*gap)) < 1e-12
assert abs(f4 - 1.78) < 0.005
h = log(0.5)/log(phi)
assert abs(h - 1.94) < 0.005
assert abs(s*sqrt(1 + phi^2) - 1.83) < 0.005
assert abs(s/sqrt(1 - phi^2) - 2.10) < 0.005
assert abs(s^2*(1 - phi^4)/(1 - phi^2) - s^2*(1 + phi^2)) < 1e-12
assert abs(f1 - 1.96*s + 2.54) < 1e-12 and abs(f1 + 1.96*s - 3.34) < 1e-12
```

### Example 3 (hard): is the oil price a random walk?
An analyst has 400 months of $p_t = 100 \ln(\text{oil price})$, so that $\Delta p_t$ is roughly the monthly percentage change. The sample ACF of $p_t$ starts at $r_1 = 0.99$ and falls only to $r_{12} = 0.88$. A Dickey–Fuller regression of $\Delta p_t$ on a constant and $p_{t-1}$ gives $\hat\gamma = -0.028$ with standard error $0.016$. For the differences $\Delta p_t$, the sample ACF is $r_1 = 0.40$, $r_2 = 0.05$, $r_3 = -0.04$, and their sample variance is $125$. Decide whether to model levels or differences, and fit a model to the differences.

1. $t = \dfrac{\hat\gamma}{\operatorname{SE}(\hat\gamma)} = \dfrac{-0.028}{0.016} = -1.75 > -2.86$, so we cannot reject a unit root
   *Why:* the very slow decline of the level ACF already hints at a unit root, and the Dickey–Fuller statistic is not below its 5 % critical value. With the ordinary one-sided $t$ critical value of $-1.65$ we would wrongly have rejected it. The estimate $\hat\varphi = 1 - 0.028 = 0.972$ is close to 1, so we model the differences.
2. Band for the differences: $\pm \dfrac{2}{\sqrt{400}} = \pm 0.1$. Only $r_1 = 0.40$ lies outside it.
   *Why:* autocorrelations inside the band are consistent with zero. The ACF cuts off after lag 1, the signature of an MA(1). An AR(1) with $\varphi = 0.4$ would need $\rho_2 = 0.16$, outside the band, but the data give $r_2 = 0.05$.
3. $\dfrac{\theta}{1 + \theta^2} = 0.4 \;\Rightarrow\; 0.4\,\theta^2 - \theta + 0.4 = 0 \;\Rightarrow\; \theta = \dfrac{1 \pm \sqrt{1 - 0.64}}{0.8} = 0.5 \text{ or } 2$
   *Why:* match the theoretical $\rho_1$ to the sample value and solve the quadratic. Both roots give the same ACF ($2 = 1/0.5$); the convention $|\theta| < 1$ picks $\theta = 0.5$.
4. $\sigma^2 = \dfrac{\gamma_0}{1 + \theta^2} = \dfrac{125}{1.25} = 100, \qquad \sigma = 10$
   *Why:* the variance of an MA(1) is $\sigma^2(1 + \theta^2)$; solving for $\sigma^2$ with the sample variance gives the size of a typical monthly shock, about 10 %.
5. Model: $\Delta p_t = \mu + \varepsilon_t + 0.5\,\varepsilon_{t-1}$, check $\rho_1 = 0.5/1.25 = 0.4$
   *Why:* the oil price level behaves like a random walk whose monthly changes have a one-month echo: half of each shock carries into the next month's change. A shock to the level is permanent, so long-run forecasts of the price are close to today's price plus any drift, with uncertainty that keeps growing.

```verify
g = -0.028; se = 0.016
t = g/se
assert abs(t + 1.75) < 1e-12
assert t > -2.86 and t < -1.65
assert abs(1 + g - 0.972) < 1e-12
band = 2/sqrt(400)
assert abs(band - 0.1) < 1e-12
assert abs(0.40) > band and abs(0.05) < band and abs(-0.04) < band
assert abs(0.4^2 - 0.16) < 1e-12 and 0.16 > band
d = sqrt(1 - 4*0.4*0.4)
assert abs(d - 0.6) < 1e-12
th1 = (1 - d)/0.8
th2 = (1 + d)/0.8
assert abs(th1 - 0.5) < 1e-12 and abs(th2 - 2) < 1e-12
assert abs(th1/(1 + th1^2) - 0.4) < 1e-12 and abs(th2/(1 + th2^2) - 0.4) < 1e-12
s2 = 125/(1 + th1^2)
assert abs(s2 - 100) < 1e-9
assert abs(sqrt(s2) - 10) < 1e-9
assert abs(s2*th1/(s2*(1 + th1^2)) - 0.4) < 1e-12
```

## Common mistakes
- Giving the intercept $c$ as the mean of an AR(1), or $\sigma^2$ as its variance; persistence makes both larger (IGNORED_PERSISTENCE).
- Writing the mean as $c/(1 + \varphi)$ instead of $c/(1 - \varphi)$ (MEAN_DENOM_SIGN).
- Multiplying the intercept by $1 - \varphi$ instead of dividing by it (MEAN_MULTIPLIED).
- Using $1 - \varphi$ instead of $1 - \varphi^2$ in the variance $\sigma^2/(1 - \varphi^2)$ (PHI_NOT_SQUARED).
- Putting the standard deviation $\sigma$ where the variance $\sigma^2$ belongs (SIGMA_NOT_SQUARED).
- Forecasting $\varphi^h y_T$, as if the series were heading to 0 rather than to its mean (FORECAST_NO_MEAN).
- Giving the one-step forecast $c + \varphi y_T$ for a forecast several periods ahead (ONE_STEP_ONLY).
- Giving the mean $\mu$ as the forecast, forgetting the part of today's gap that is still left (LONG_RUN_MEAN_ONLY).
- Using the intercept $c$ in place of the mean in $\mu + \varphi^h(y_T - \mu)$ (INTERCEPT_AS_MEAN).
- Reading the MA coefficient $\theta$ as the lag-1 autocorrelation (RHO_EQUALS_THETA).
- Squaring $\theta$ in the autocovariance: it is $\theta\sigma^2$ (THETA_SQUARED).
- Writing the MA(1) variance as $\sigma^2(1 - \theta^2)$; variances of uncorrelated shocks add (MA_DENOM_SIGN).
- Giving the autocovariance $\theta\sigma^2$ when the question asks for the autocorrelation (COVARIANCE_NOT_CORRELATION).
- Calling a random walk stationary because its changes are: the level has a variance $t\sigma^2$ that grows for ever; only the differences are stationary.
- Using the ordinary $t$ critical values for a Dickey–Fuller test; under a unit root the statistic has its own, more negative critical values.
- Regressing one trending series on another in levels and trusting a large $t$ statistic: with unit roots the relation may be spurious.
- Expecting an MA(1) to have autocorrelation beyond lag 1, or an AR(1) to cut off after lag 1; it is the other way round.

## Practice
- `ar1-mean-or-variance` (difficulty 1): the long-run mean $c/(1 - \varphi)$ or the variance $\sigma^2/(1 - \varphi^2)$ of a stationary AR(1) for inflation, GDP growth or inventory changes, to 2 decimal places; distractors IGNORED_PERSISTENCE, MEAN_DENOM_SIGN, MEAN_MULTIPLIED, PHI_NOT_SQUARED, SIGMA_NOT_SQUARED.
- `ma1-lag1-autocorrelation` (difficulty 2): the lag-1 autocorrelation $\theta/(1 + \theta^2)$ of an MA(1) for fuel-price changes, quarterly inflation or daily share returns, to 3 decimal places; distractors RHO_EQUALS_THETA, THETA_SQUARED, MA_DENOM_SIGN, COVARIANCE_NOT_CORRELATION.
- `ar1-forecast-h-steps` (difficulty 3): the forecast $\mu + \varphi^h(y_T - \mu)$ of inflation, GDP growth or unemployment $h$ periods ahead, starting from the intercept $c$, to 2 decimal places; distractors FORECAST_NO_MEAN, ONE_STEP_ONLY, LONG_RUN_MEAN_ONLY, INTERCEPT_AS_MEAN.

## Real world
- Inflation persistence: central banks estimate how strongly inflation depends on its own past. A high persistence ($\varphi$ near 1) means a supply shock keeps inflation above target for years, which is one reason why banks react quickly to price shocks before they feed into expectations.
- Forecasting: statistics offices and central banks use AR and ARMA models as simple benchmarks for GDP growth, inflation and unemployment. A richer model is only worth using if it forecasts better than these, and over short horizons that is often hard.
- Exchange rates and oil prices: in a famous result, simple random-walk forecasts ("tomorrow's rate equals today's") of major exchange rates were found to be at least as accurate as forecasts from economic models over horizons up to about a year. Oil prices also behave close to a random walk, so shocks to their level tend to last.
- Levels or differences: before running regressions on macroeconomic data, econometricians run unit-root tests such as Dickey–Fuller. Series like log GDP or price levels are usually treated as I(1) and used in growth rates, which avoids spurious regressions between unrelated trending series.

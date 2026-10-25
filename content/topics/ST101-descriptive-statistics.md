---
id: ST101
title: Descriptive statistics
block: ST1
coreYear: 1
prerequisites: [F09]
estMinutes: 45
status: draft
economicUses:
  - Summarising wages, prices and inflation rates in a few numbers
  - Reporting typical household income with the median rather than the mean
  - Comparing how spread out or volatile two data sets are
  - Spotting outliers and data errors before any further analysis
searchTerms:
  - "Mean, median and mode"
  - "Standard deviation"
  - "Variance"
generators: [mean-or-median-small-data, grouped-frequency-mean, sample-standard-deviation]
widgets: [wage-outlier-dots]
mistakeCodes:
  MEAN_NOT_MEDIAN:
    label: Gave the mean, not the median
    explanation: The median is the middle value of the sorted data, not the total divided by n. With one very large value the two can be far apart, which is exactly why the question asks for the median.
  MEDIAN_NOT_MEAN:
    label: Gave the median, not the mean
    explanation: The mean adds up all the values and divides by how many there are, so every value, including a very large one, affects it. The middle value of the sorted list is the median.
  UNSORTED:
    label: Took the middle of the unsorted list
    explanation: The median is the middle value in order of size. Sort the data from smallest to largest first, then pick the middle value (or average the two middle values).
  MODE:
    label: Gave the most frequent value
    explanation: The value that appears most often is the mode. It is a measure of centre too, but not the one asked for; find the mean or median as the question says.
  REPEAT_COUNTED_ONCE:
    label: Counted a repeated value only once
    explanation: When two employees earn the same wage, both wages belong in the total and both count in n. Add every observation, including repeats.
  LOWER_LIMITS:
    label: Used the lower class limits instead of the midpoints
    explanation: In a grouped table each value is only known to lie somewhere in its class. Represent it by the class midpoint, (lower + upper)/2, not by the lower limit, which biases the mean downwards.
  UNWEIGHTED_MIDPOINTS:
    label: Averaged the midpoints without the frequencies
    explanation: A class with many observations must count more than a class with few. Multiply each midpoint by its frequency, add, and divide by the total frequency.
  DIVIDED_BY_CLASSES:
    label: Divided by the number of classes
    explanation: The mean divides the total by the number of observations, Σ f, not by the number of rows in the table.
  POPULATION_DIVISOR:
    label: Divided by n instead of n − 1
    explanation: For a sample, the variance divides the sum of squared deviations by n − 1. Dividing by n is right only when the data are the whole population.
  NO_SQUARE_ROOT:
    label: Gave the variance instead of the standard deviation
    explanation: The variance is in squared units. Take its square root to get the standard deviation, which is in the units of the data.
  MEAN_ABS_DEVIATION:
    label: Averaged the distances without squaring
    explanation: The average of |x − x̄| is the mean absolute deviation, a different measure of spread. The standard deviation squares each deviation, adds, divides by n − 1 and then takes the square root.
resources:
  - { title: "Introductory Statistics 2e, 2.3 Measures of the Location of the Data (OpenStax)", url: "https://openstax.org/books/introductory-statistics-2e/pages/2-3-measures-of-the-location-of-the-data", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Introductory Statistics 2e, 2.5 Measures of the Center of the Data (OpenStax)", url: "https://openstax.org/books/introductory-statistics-2e/pages/2-5-measures-of-the-center-of-the-data", kind: textbook, verifiedAt: 2026-10-18 }
  - { title: "Introductory Statistics 2e, 2.7 Measures of the Spread of the Data (OpenStax)", url: "https://openstax.org/books/introductory-statistics-2e/pages/2-7-measures-of-the-spread-of-the-data", kind: textbook, verifiedAt: 2026-10-18 }
---

## Why economists need this
A statistics office collects the monthly wage of every employee in the country: millions of numbers that nobody can read one by one. The news needs one number for the "typical" wage and another for how unequal wages are. Choosing the right summary matters: a few very high earners can raise the average wage noticeably while most workers see no change at all. The same questions come up for house prices across a city, inflation rates across regions and sales across the days of a month. Descriptive statistics gives the standard tools for summarising data honestly, before any probability or modelling starts.

## Intuition
Any summary of a data set answers two questions: **where is the centre** and **how spread out are the values**.

For the centre there are three common answers. The **mean** is the "fair share": add everything up and divide equally among all observations. The **median** is the value of the person in the middle once everyone stands in order of size. The **mode** is the most common value. When the data are roughly symmetric the three are close. When a few values are extreme they are not: if a firm's manager earns four times as much as everyone else, the mean wage rises a lot, but the employee in the middle is still the same person, so the median hardly moves. That is why household income is usually reported as a median.

For the spread, the simplest measure is the **range**, largest minus smallest, but one extreme value controls it completely. The **interquartile range** looks only at the middle half of the data. The **standard deviation** measures the typical distance of the values from the mean; it uses every value, so, like the mean, it reacts strongly to outliers.

## Definition and formulas
**Types of data.** *Categorical* data put each observation into a group (region, industry, employed or not); only counts and shares make sense for them. *Numerical* data are either *discrete*, taking separate values such as the number of employees or children, or *continuous*, measured on a scale, such as income, price or time. A *cross-section* records many units at one moment (the wages of 500 workers in 2025); a *time series* follows one unit over time (monthly inflation from 2015 to 2025).

**Frequency tables and histograms.** A frequency table counts how many observations fall in each value or class. With *grouped data* each class, such as incomes from 400 up to 800, includes its lower limit but not its upper one, and the individual values inside a class are no longer known. A *histogram* draws one bar over each class with the bar's area proportional to the frequency (with equal class widths, simply the height). It shows the shape of the data at a glance: where the peak is, and whether a long tail stretches to one side.

**Measures of centre.** For data $x_1, \dots, x_n$, using summation notation (F09):
$$\bar{x} = \frac{1}{n}\sum_{i=1}^{n} x_i$$
For the median, sort the data, $x_{(1)} \le x_{(2)} \le \dots \le x_{(n)}$. If $n$ is odd the median is $x_{((n+1)/2)}$; if $n$ is even it is the average of the two middle values, $x_{(n/2)}$ and $x_{(n/2+1)}$. The mode is the most frequent value; it is the only one of the three that works for categorical data.

A **weighted mean** gives each value a weight $w_i$:
$$\bar{x}_w = \frac{\sum w_i x_i}{\sum w_i}$$
A household that buys 2 kg of apples at 3 per kg and 5 kg at 2.40 per kg paid on average $\frac{2(3) + 5(2.4)}{7} = 2.57$ per kg, not the simple average of the two prices, 2.70: the cheaper apples were bought in larger quantity.

For **grouped data** with class midpoints $m_j$ and frequencies $f_j$, the mean is estimated by placing every observation at its class midpoint:
$$\bar{x} \approx \frac{\sum f_j m_j}{\sum f_j}$$
The median of grouped data is found in the class containing observation number $n/2$, the *median class*. Assuming the values are spread evenly inside it,
$$\text{median} \approx L + \frac{n/2 - F}{f}\, w$$
where $L$ is the lower limit of the median class, $F$ the number of observations below it, $f$ its frequency and $w$ its width.

**Why the median resists outliers.** Raising the largest value, even a thousand times, changes the total and so the mean, but it does not change which observation is in the middle. To move the median you have to move about half the data. Incomes, wealth, house prices and firm sizes all have a few very large values, so for them the mean is well above the median.

**Measures of spread.**
- Range: $x_{(n)} - x_{(1)}$.
- Quartiles. This topic always uses the **median-of-halves rule**: sort the data and find the median; the lower quartile $Q_1$ is the median of the values below it and the upper quartile $Q_3$ is the median of the values above it (when $n$ is odd, the median itself belongs to neither half). Spreadsheets and statistical software often interpolate instead and can give slightly different quartiles for small data sets.
- Interquartile range: $\text{IQR} = Q_3 - Q_1$, the width of the middle half of the data.
- Variance and standard deviation of a whole **population** of $N$ values with mean $\mu$:
$$\sigma^2 = \frac{1}{N}\sum (x_i - \mu)^2, \qquad \sigma = \sqrt{\sigma^2}$$
- Variance and standard deviation of a **sample** of $n$ values:
$$s^2 = \frac{1}{n-1}\sum (x_i - \bar{x})^2, \qquad s = \sqrt{s^2}$$
The deviations of a sample are measured from $\bar{x}$, which is computed from the same data and therefore sits closer to them than the true population mean does; dividing by $n - 1$ instead of $n$ makes up for this (ST203 shows that it makes $s^2$ right on average). A useful shortcut is $\sum (x_i - \bar{x})^2 = \sum x_i^2 - n\bar{x}^2$.
- Coefficient of variation: $\text{CV} = \dfrac{s}{\bar{x}} \times 100\%$. It compares spreads of data with different units or very different levels, for example the variability of wages in two countries.

**Percentiles.** The $p$-th percentile is a value with about $p$ % of the data at or below it. The lower quartile is the 25th percentile, the median the 50th and the upper quartile the 75th. Earnings statistics often quote the 10th and 90th percentiles to describe low and high pay.

**Skewness in words.** Data are *right-skewed* (positively skewed) when a long tail stretches to the right: most values are moderate and a few are very large. Then the mean is above the median, as for incomes and house prices. Data are *left-skewed* when the long tail is on the left, and the mean is below the median. In symmetric data the mean and the median are close.

**Box plots in words.** A box plot draws a box from $Q_1$ to $Q_3$ with a line at the median. Lines called whiskers reach out to the smallest and largest values that lie within $1.5 \times \text{IQR}$ of the box; any value beyond these fences, below $Q_1 - 1.5\,\text{IQR}$ or above $Q_3 + 1.5\,\text{IQR}$, is drawn as a separate point and called an outlier. A long right whisker and a median near the bottom of the box signal right skew.

**z-scores.** The z-score of an observation says how many standard deviations it lies above or below the mean:
$$z_i = \frac{x_i - \bar{x}}{s}$$
A town with $z = 2$ has inflation two standard deviations above the average of the towns; z-scores let you compare positions in data sets with different means and spreads.

## Interactive
::widget{id="wage-outlier-dots"}

The dots are the nine monthly wages of Example 1, one employee per row, with the manager as the hollow dot at the top. Drag the slider *Manager's monthly pay* and watch the three read-outs. At 3600 the panel shows a mean of 1250, a median of 980 and a standard deviation of 885.72. Move the slider down to 1200: the mean falls to 983.33 and the standard deviation to 120.42, but the median stays at 980. However far you drag the manager's pay, the median never moves, while the mean and the standard deviation keep climbing.

## Worked examples

### Example 1 (easy): wages in a small firm
The monthly wages of the nine employees of a small firm are 940, 1100, 820, 3600, 1050, 860, 980, 900 and 1000; the 3600 is the manager. Find the median, the mean and the interquartile range, and decide whether the manager's pay is an outlier.

1. Sorted: $820,\ 860,\ 900,\ 940,\ 980,\ 1000,\ 1050,\ 1100,\ 3600$
   *Why:* the median and the quartiles depend on the order of size, not on the order the data were written down.
2. $\text{median} = x_{(5)} = 980$
   *Why:* with $n = 9$ the middle position is $(n+1)/2 = 5$; four employees earn less and four earn more.
3. $\bar{x} = \dfrac{11{,}250}{9} = 1250$
   *Why:* the mean shares the total wage bill equally. The manager's pay pulls it up so far that 8 of the 9 employees earn less than the mean. If the manager earned 1200 instead, the mean would be 983.33 and the median would still be 980.
4. $Q_1 = \dfrac{860 + 900}{2} = 880$, $Q_3 = \dfrac{1050 + 1100}{2} = 1075$, $\text{IQR} = 195$
   *Why:* median-of-halves rule: the lower half is 820, 860, 900, 940 and the upper half is 1000, 1050, 1100, 3600; the median 980 belongs to neither.
5. Upper fence $= 1075 + 1.5 \times 195 = 1367.5 < 3600$, so the manager's pay is an outlier.
   *Why:* a box plot marks values more than $1.5 \times \text{IQR}$ beyond the box as outliers. Here the IQR is not affected by the manager at all, while the range, $3600 - 820 = 2780$, is driven by it.

```verify
x = [940, 1100, 820, 3600, 1050, 860, 980, 900, 1000]
s = sort(x)
assert s[1] == 820 and s[9] == 3600
assert median(x) == 980
assert s[5] == 980
assert sum(x) == 11250
assert mean(x) == 1250
# 8 employees earn less than the mean: the 8th sorted wage is below it, the 9th above
assert s[8] < mean(x) and s[9] > mean(x)
assert abs((sum(x) - 3600 + 1200)/9 - 983.33) < 0.01
q1 = (s[2] + s[3])/2
q3 = (s[7] + s[8])/2
iqr = q3 - q1
assert q1 == 880 and q3 == 1075 and iqr == 195
assert q3 + 1.5*iqr == 1367.5
assert s[9] - s[1] == 2780
# the widget's standard deviation (sample, n - 1) at the default
assert abs(std(x) - 885.72) < 0.01
```

### Example 2 (medium): household incomes from a grouped table
A survey groups 200 households by monthly income (each class includes its lower limit but not its upper one):
$$
\begin{array}{l|ccccc}
\text{Income} & 0\text{–}400 & 400\text{–}800 & 800\text{–}1200 & 1200\text{–}1600 & 1600\text{–}2000 \\ \hline
\text{Households} & 30 & 80 & 50 & 25 & 15
\end{array}
$$
Estimate the mean and the median income and describe the shape of the distribution.

1. Midpoints: $m = 200,\ 600,\ 1000,\ 1400,\ 1800$
   *Why:* the individual incomes are unknown, so each household is placed at the middle of its class.
2. $\sum f m = 30(200) + 80(600) + 50(1000) + 25(1400) + 15(1800) = 166{,}000$, and $\sum f = 200$
   *Why:* a class with $f$ households contributes $f$ times its midpoint to the total income.
3. $\bar{x} \approx \dfrac{166{,}000}{200} = 830$
   *Why:* divide the total by the number of households, not by the number of classes.
4. Cumulative frequencies: $30,\ 110,\ 160,\ 185,\ 200$, so household number $n/2 = 100$ lies in the class 400–800.
   *Why:* only 30 households are below 400, but 110 are below 800, so the middle household is in the second class.
5. $\text{median} \approx 400 + \dfrac{100 - 30}{80} \times 400 = 750$
   *Why:* the 80 households of the median class are assumed spread evenly across its width of 400, and the 70th of them is $70/80$ of the way through.
6. $\bar{x} = 830 > 750 = \text{median}$: the incomes are right-skewed.
   *Why:* the histogram peaks in the second class and has a long tail of fewer, richer households to the right; those pull the mean above the median.

```verify
f = [30, 80, 50, 25, 15]
m = [200, 600, 1000, 1400, 1800]
n = sum(f)
fm = sum(f .* m)
assert n == 200
assert fm == 166000
xbar = fm / n
assert xbar == 830
c = cumsum(f)
assert deepEqual(c, [30, 110, 160, 185, 200])
assert c[1] < n/2 and c[2] >= n/2
med = 400 + (n/2 - c[1]) / f[2] * 400
assert med == 750
assert xbar > med
```

### Example 3 (hard): inflation across towns
A statistics office measures annual inflation in a random sample of six towns: 2.8 %, 3.4 %, 4.0 %, 4.6 %, 5.9 % and 3.3 %. Find the sample standard deviation, the coefficient of variation, and the z-score of the town with 5.9 %.

1. $\bar{x} = \dfrac{24.0}{6} = 4.0$
   *Why:* every spread measure here is built from distances to the mean.
2. Deviations $-1.2,\ -0.6,\ 0,\ 0.6,\ 1.9,\ -0.7$; $\sum (x_i - \bar{x})^2 = 1.44 + 0.36 + 0 + 0.36 + 3.61 + 0.49 = 6.26$
   *Why:* the deviations themselves always add up to 0, so they are squared before adding.
3. $s^2 = \dfrac{6.26}{5} = 1.252$, $s = \sqrt{1.252} = 1.119 \approx 1.12$ percentage points
   *Why:* the six towns are a sample, so divide by $n - 1 = 5$. Dividing by 6 would give 1.02, which understates the spread across all towns.
4. $\text{CV} = \dfrac{1.119}{4.0} \times 100\% = 27.97\%$
   *Why:* the coefficient of variation expresses the spread relative to the level, so it can be compared with, say, a year when average inflation was 15 %.
5. $z = \dfrac{5.9 - 4.0}{1.119} = 1.70$
   *Why:* this town's inflation is 1.7 standard deviations above the average of the sample, the highest of the six.

```verify
x = [2.8, 3.4, 4.0, 4.6, 5.9, 3.3]
n = 6
xbar = mean(x)
assert abs(xbar - 4.0) < 1e-9
d = x - xbar
assert abs(sum(d)) < 1e-9
ss = sum(d .^ 2)
assert abs(ss - 6.26) < 1e-9
assert abs(ss - (sum(x .^ 2) - n*xbar^2)) < 1e-9
s2 = ss / (n - 1)
assert abs(s2 - 1.252) < 1e-9
s = sqrt(s2)
assert abs(s - std(x)) < 1e-9
assert abs(s - 1.12) < 0.005
assert abs(sqrt(ss/n) - 1.02) < 0.005
cv = s / xbar * 100
assert abs(cv - 27.97) < 0.005
z = (5.9 - xbar) / s
assert abs(z - 1.70) < 0.005
```

## Common mistakes
- Giving the mean when the median is asked for; in skewed data such as wages they can be far apart (MEAN_NOT_MEDIAN).
- Giving the median when the mean is asked for (MEDIAN_NOT_MEAN).
- Taking the middle value of the list as it is written, without sorting it first (UNSORTED).
- Reporting the most frequent value, the mode, as the answer (MODE).
- Counting a value that appears twice only once when adding up the data (REPEAT_COUNTED_ONCE).
- Using the lower class limits instead of the midpoints in a grouped table (LOWER_LIMITS).
- Averaging the class midpoints without weighting them by the frequencies (UNWEIGHTED_MIDPOINTS).
- Dividing $\sum f m$ by the number of classes instead of the number of observations (DIVIDED_BY_CLASSES).
- Dividing by $n$ instead of $n - 1$ when the data are a sample (POPULATION_DIVISOR).
- Stopping at the variance and forgetting the square root (NO_SQUARE_ROOT).
- Averaging the distances $|x_i - \bar{x}|$ instead of squaring them (MEAN_ABS_DEVIATION).
- Averaging prices bought in different quantities without weights: the average price paid is a weighted mean.
- Comparing standard deviations of data at very different levels (wages in two currencies, inflation of 3 % and of 30 %) without dividing by the mean: use the coefficient of variation.

## Practice
- `mean-or-median-small-data` (difficulty 1): the mean or the median of 7–11 wages or house prices that include one very large value; distractors MEAN_NOT_MEDIAN, MEDIAN_NOT_MEAN, UNSORTED, MODE, REPEAT_COUNTED_ONCE.
- `grouped-frequency-mean` (difficulty 2): the mean of a grouped frequency table of incomes, firm sizes or house prices, using class midpoints; distractors LOWER_LIMITS, UNWEIGHTED_MIDPOINTS, DIVIDED_BY_CLASSES.
- `sample-standard-deviation` (difficulty 3): the sample standard deviation $s$ (divisor $n - 1$) of 5–8 inflation rates, daily sales or weekly hours; distractors POPULATION_DIVISOR, NO_SQUARE_ROOT, MEAN_ABS_DEVIATION.

## Real world
- Statistics offices publish *median* household income and median earnings next to the means, because a small number of very high incomes pulls the mean well above what a typical household receives. Several countries set or review their minimum wage as a share of the median wage.
- Wage inequality is often summarised by percentile ratios, such as the 90th percentile of earnings divided by the 10th; international organisations compare countries with these ratios rather than with the range, which a single billionaire would dominate.
- Central banks watch not only average inflation but its spread across regions and across items in the consumer basket: a high standard deviation of price changes signals relative price shocks, such as an energy price jump, rather than general inflation.
- Before estimating any model, such as a demand curve with regression (ST205), analysts look at histograms, box plots and z-scores to find skewed variables and outliers, which are often data errors (an extra zero typed into a price).

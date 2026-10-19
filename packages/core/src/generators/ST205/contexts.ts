import { num } from '../format';

/** The economic settings of the ST205 generators: what x and y are. */
export type Context = 'demand' | 'consumption' | 'wages' | 'okun';

export const CONTEXTS: readonly Context[] = ['demand', 'consumption', 'wages', 'okun'];

/** What one observation is, in the plural: "40 weeks", "60 households". */
export const UNIT: Readonly<Record<Context, string>> = {
  demand: 'weeks',
  consumption: 'households',
  wages: 'workers',
  okun: 'years',
};

/** The two variables, for a stem built from summary sums. */
export const VARIABLES: Readonly<Record<Context, string>> = {
  demand: 'the price $x$ of a carton of orange juice and the number of cartons sold, $y$',
  consumption:
    'monthly disposable income $x$ and monthly consumption spending $y$ (both in hundreds)',
  wages: 'years of education $x$ and hourly wage $y$',
  okun: 'real GDP growth $x$ (in %) and the change in the unemployment rate $y$ (in percentage points)',
};

/** The opening of a stem that lists a small data set. */
export function dataLead(c: Context, n: number): string {
  switch (c) {
    case 'demand':
      return `A café charged a different price $x$ for its lunch sandwich in each of ${n} weeks and recorded the average number $y$ sold per day:`;
    case 'consumption':
      return `${n} households report their monthly disposable income $x$ and consumption spending $y$, both in hundreds:`;
    case 'wages':
      return `${n} workers report their years of education $x$ and their hourly wage $y$:`;
    case 'okun':
      return `In ${n} years an economy recorded real GDP growth $x$ (in %) and the change in its unemployment rate $y$ (in percentage points):`;
  }
}

/** What the slope says in economic units (plain text, for a step's "why"). */
export function slopeMeaning(c: Context, b1: number): string {
  const size = num(Math.abs(b1));
  switch (c) {
    case 'demand':
      return `each extra 1 on the price goes with ${size} fewer units sold`;
    case 'consumption':
      return `each extra 1 of income goes with ${size} more of spending: the slope is the marginal propensity to consume`;
    case 'wages':
      return `each extra year of education goes with an hourly wage ${size} ${b1 >= 0 ? 'higher' : 'lower'}`;
    case 'okun':
      return `each extra point of GDP growth goes with an unemployment rate change ${size} points ${b1 < 0 ? 'lower' : 'higher'} (Okun's law)`;
  }
}

import { useState } from 'react';
import { Curve, Dot, fmt, Guides, Plot, Readout, Segment, Slider } from './kit';

// Topic MV10: one budget, three kinds of preferences. Income and the price of y stay fixed; the
// sliders change the price of x and the preference type.
export const INCOME = 120;
export const PRICE_Y = 4;
const FRAME = { xMin: 0, xMax: 48, yMin: 0, yMax: 34 };
/** Curves stop at this height so they stay clear of the x-axis label. */
const FLOOR = 4;
/** ... and stop at this height, clear of the y-axis label. */
const CEIL = 30;

/** 1 = Cobb–Douglas √(xy), 2 = perfect complements min(x, y), 3 = perfect substitutes x + y. */
export type Preference = 1 | 2 | 3;
export const PREFERENCE_NAMES: Record<Preference, string> = {
  1: 'Cobb–Douglas',
  2: 'perfect complements',
  3: 'perfect substitutes',
};

/**
 * The Marshallian demands at price px (income and p_y fixed). For perfect substitutes at
 * px = p_y every bundle on the budget line is best: `tie` is true and x = y = half of income each
 * is returned only as a place to put the read-out.
 */
export function demand(pref: Preference, px: number, M = INCOME, py = PRICE_Y) {
  if (pref === 1) return { x: M / (2 * px), y: M / (2 * py), tie: false };
  if (pref === 2) return { x: M / (px + py), y: M / (px + py), tie: false };
  if (px < py) return { x: M / px, y: 0, tie: false };
  if (px > py) return { x: 0, y: M / py, tie: false };
  return { x: M / (2 * px), y: M / (2 * py), tie: true };
}

/** Utility of a bundle for each preference type. */
export function utility(pref: Preference, x: number, y: number) {
  if (pref === 1) return Math.sqrt(x * y);
  if (pref === 2) return Math.min(x, y);
  return x + y;
}

/**
 * The own-price elasticity of demand for x, (∂x/∂pₓ)·(pₓ/x): −1 for Cobb–Douglas,
 * −pₓ/(pₓ + p_y) for perfect complements, −1 for perfect substitutes while x is the cheaper good;
 * null where x* = 0 or demand jumps (the tie), so no elasticity exists.
 */
export function priceElasticity(pref: Preference, px: number, py = PRICE_Y): number | null {
  if (pref === 1) return -1;
  if (pref === 2) return -px / (px + py);
  return px < py ? -1 : null;
}

/** The share of income spent on x at the best bundle. */
export const shareOnX = (pref: Preference, px: number, M = INCOME) => {
  const d = demand(pref, px, M);
  return d.tie ? null : (px * d.x) / M;
};

/** MV10: how the shape of preferences shapes the demand for x. */
export function DemandPreferenceTypes() {
  const [px, setPx] = useState(6);
  const [pref, setPref] = useState<Preference>(1);
  const best = demand(pref, px);
  const u = utility(pref, best.x, best.y);
  const e = priceElasticity(pref, px);
  const share = shareOnX(pref, px);

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="good x"
        yLabel="good y"
        xTicks={[0, 10, 20, 30, 40]}
        yTicks={[10, 20, 30]}
      >
        <Segment frame={FRAME} from={[0, INCOME / PRICE_Y]} to={[INCOME / px, 0]} tone="green" />
        {pref === 1 && (
          <Curve
            frame={FRAME}
            fn={(v) => (u * u) / v}
            from={(u * u) / CEIL}
            to={Math.min(FRAME.xMax, (u * u) / FLOOR)}
          />
        )}
        {pref === 2 && (
          <>
            <Segment frame={FRAME} from={[u, u]} to={[u, CEIL]} tone="lilac" />
            <Segment frame={FRAME} from={[u, u]} to={[FRAME.xMax, u]} tone="lilac" />
          </>
        )}
        {pref === 3 && (
          <Segment
            frame={FRAME}
            from={u > CEIL ? [u - CEIL, CEIL] : [0, u]}
            to={[u, 0]}
            tone="lilac"
          />
        )}
        {!best.tie && <Guides frame={FRAME} x={best.x} y={best.y} />}
        {!best.tie && <Dot frame={FRAME} x={best.x} y={best.y} />}
      </Plot>
      <Slider label="Price of x, p_x" value={px} min={3} max={12} onChange={setPx} />
      <Slider
        label="Preferences"
        value={pref}
        min={1}
        max={3}
        onChange={(v) => setPref(v as Preference)}
        format={(v) => PREFERENCE_NAMES[v as Preference]}
      />
      <Readout
        items={[
          [
            'Best bundle (x*, y*)',
            best.tie ? 'any point on the line' : `(${fmt(best.x)}, ${fmt(best.y)})`,
          ],
          ['Price elasticity of x', e === null ? 'not defined' : fmt(e)],
          ['Share of income on x', share === null ? 'any' : `${fmt(100 * share, 1)} %`],
        ]}
      />
      <figcaption>
        Income is {INCOME} and good y costs {PRICE_Y}; the green line is the budget {fmt(px)}x +{' '}
        {PRICE_Y}y = {INCOME} and the lilac line is the highest indifference curve it reaches.{' '}
        {pref === 1 &&
          `Cobb–Douglas, U = √(xy): the consumer always spends half of income on x, so x* = 60/pₓ = ${fmt(best.x)}. A 1 % rise in pₓ cuts x* by 1 %, so the elasticity is −1 at every price and spending on x stays 60.`}
        {pref === 2 &&
          `Perfect complements, U = min(x, y): nothing is wasted, so x* = y* = M/(pₓ + p_y) = ${fmt(best.x)}. A dearer x makes every pair dearer, but y cannot replace it, so demand reacts less than in proportion: the elasticity is −pₓ/(pₓ + p_y) = ${fmt(e ?? 0)}.`}
        {pref === 3 &&
          (best.tie
            ? 'Perfect substitutes, U = x + y: at pₓ = p_y = 4 the indifference line lies on the budget line, so every affordable split is best. Move pₓ just below or above 4 and demand for x jumps between 30 and 0.'
            : `Perfect substitutes, U = x + y: the consumer buys only the cheaper good. ${px < PRICE_Y ? `x is cheaper, so x* = M/pₓ = ${fmt(best.x)} and y* = 0.` : 'x is dearer than y, so she buys none of it (x* = 0) and the corner is at y* = 30.'} Demand for x jumps from 0 to about 30 as pₓ falls past 4.`)}
      </figcaption>
    </figure>
  );
}

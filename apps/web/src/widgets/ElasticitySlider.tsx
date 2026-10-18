import { useId, useState } from 'react';

// Demand Q = 100 − 2P (topic C107). Q across, P up, the economist's way.
const A = 100;
const B = 2;
const x = (q: number) => 40 + q * 2.6;
const y = (p: number) => 190 - p * 3.4;

function describe(e: number) {
  if (Math.abs(Math.abs(e) - 1) < 1e-9) return 'unit elastic: revenue is at its maximum';
  return Math.abs(e) > 1
    ? 'elastic: a price cut would raise revenue'
    : 'inelastic: a price rise would raise revenue';
}

/** C107: drag the price along a linear demand curve; see ε and the revenue rectangle change. */
export function ElasticitySlider() {
  const [price, setPrice] = useState(20);
  const inputId = useId();
  const q = A - B * price;
  const e = (-B * price) / q;

  return (
    <figure className="widget">
      <svg viewBox="0 0 320 214" aria-hidden="true">
        <rect
          className="widget-area"
          x={x(0)}
          y={y(price)}
          width={x(q) - x(0)}
          height={y(0) - y(price)}
        />
        <path className="widget-axis" d={`M${x(0)} ${y(52)}V${y(0)}H${x(104)}`} />
        <line className="widget-demand" x1={x(0)} y1={y(50)} x2={x(100)} y2={y(0)} />
        <circle className="widget-point" cx={x(q)} cy={y(price)} r="7" />
        <text className="widget-label" x={x(0) - 8} y={y(50) + 4} textAnchor="end">
          P
        </text>
        <text className="widget-label" x={x(104)} y={y(0) + 18} textAnchor="end">
          Q
        </text>
      </svg>
      <label className="widget-control" htmlFor={inputId}>
        <span>
          Price <output htmlFor={inputId}>{price}</output>
        </span>
        <input
          id={inputId}
          type="range"
          min={1}
          max={49}
          value={price}
          onChange={(ev) => setPrice(Number(ev.target.value))}
        />
      </label>
      <dl className="widget-readout" aria-live="polite">
        <div>
          <dt>Quantity</dt>
          <dd>{q}</dd>
        </div>
        <div>
          <dt>Elasticity ε</dt>
          <dd>{e.toFixed(2)}</dd>
        </div>
        <div>
          <dt>Revenue P × Q</dt>
          <dd>{price * q}</dd>
        </div>
      </dl>
      <figcaption>
        On Q = 100 − 2P at P = {price}, demand is {describe(e)}.
      </figcaption>
    </figure>
  );
}

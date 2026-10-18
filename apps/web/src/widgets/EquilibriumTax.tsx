import { useId, useState } from 'react';

// Demand Q = 120 − 2P, supply Q = −30 + 3P (topic F05, examples 1 and 2).
const A = 120;
const B = 2;
const C = -30;
const D = 3;
const x = (q: number) => 40 + q * 2.15;
const y = (p: number) => 190 - p * 2.9;

/** Inverse supply with the tax added: the price buyers must pay for sellers to supply Q. */
const supplyPrice = (q: number, tax: number) => (q - C) / D + tax;

/** F05: a per-unit tax on sellers shifts supply up; see who pays it. */
export function EquilibriumTax() {
  const [tax, setTax] = useState(10);
  const inputId = useId();
  const buyers = (A - C + D * tax) / (B + D);
  const sellers = buyers - tax;
  const quantity = A - B * buyers;
  const buyersShare = tax === 0 ? D / (B + D) : (buyers - (A - C) / (B + D)) / tax;

  return (
    <figure className="widget">
      <svg viewBox="0 0 320 214" aria-hidden="true">
        <path className="widget-axis" d={`M${x(0)} ${y(62)}V${y(0)}H${x(128)}`} />
        <line className="widget-demand" x1={x(0)} y1={y(60)} x2={x(120)} y2={y(0)} />
        <line
          className="widget-supply"
          x1={x(0)}
          y1={y(supplyPrice(0, 0))}
          x2={x(120)}
          y2={y(supplyPrice(120, 0))}
        />
        {tax > 0 && (
          <line
            className="widget-supply widget-supply--taxed"
            x1={x(0)}
            y1={y(supplyPrice(0, tax))}
            x2={x(120)}
            y2={y(supplyPrice(120, tax))}
          />
        )}
        <line
          className="widget-wedge"
          x1={x(quantity)}
          y1={y(buyers)}
          x2={x(quantity)}
          y2={y(sellers)}
        />
        <circle className="widget-point" cx={x(quantity)} cy={y(buyers)} r="6" />
        <circle
          className="widget-point widget-point--hollow"
          cx={x(quantity)}
          cy={y(sellers)}
          r="5"
        />
        <text className="widget-label" x={x(0) - 8} y={y(60) + 4} textAnchor="end">
          P
        </text>
        <text className="widget-label" x={x(128)} y={y(0) + 18} textAnchor="end">
          Q
        </text>
      </svg>
      <label className="widget-control" htmlFor={inputId}>
        <span>
          Tax per unit <output htmlFor={inputId}>{tax}</output>
        </span>
        <input
          id={inputId}
          type="range"
          min={0}
          max={20}
          value={tax}
          onChange={(ev) => setTax(Number(ev.target.value))}
        />
      </label>
      <dl className="widget-readout" aria-live="polite">
        <div>
          <dt>Buyers pay</dt>
          <dd>{buyers.toFixed(2)}</dd>
        </div>
        <div>
          <dt>Sellers keep</dt>
          <dd>{sellers.toFixed(2)}</dd>
        </div>
        <div>
          <dt>Quantity</dt>
          <dd>{quantity.toFixed(1)}</dd>
        </div>
      </dl>
      <figcaption>
        Demand Q = 120 − 2P, supply Q = −30 + 3P. Buyers bear {Math.round(buyersShare * 100)} % of a
        tax and sellers the rest, whatever its size.
      </figcaption>
    </figure>
  );
}

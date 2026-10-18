// Demand Q = 100 − 2P and supply Q = 2P, drawn the economist's way: Q across, P up.
const x = (q: number) => 40 + 2.6 * q;
const y = (p: number) => 170 - 3 * p;

const EQ = { p: 25, q: 50 };

export function EquilibriumChart() {
  return (
    <figure className="chart">
      {/* The caption states everything the drawing shows, so screen readers read it once. */}
      <svg viewBox="0 0 320 200" aria-hidden="true">
        <defs>
          <pattern id="grid" width="13" height="15" patternUnits="userSpaceOnUse" x="40" y="20">
            <path d="M13 0V15M0 15H13" className="chart-grid" />
          </pattern>
        </defs>
        <rect x={x(0)} y={y(50)} width={x(100) - x(0)} height={y(0) - y(50)} fill="url(#grid)" />
        <path d={`M${x(0)} ${y(52)}V${y(0)}H${x(104)}`} className="chart-axis" />
        <text x={x(0) - 10} y={y(50) + 5} className="chart-label" textAnchor="end">
          P
        </text>
        <text x={x(104)} y={y(0) + 20} className="chart-label" textAnchor="end">
          Q
        </text>
        <path d={`M${x(EQ.q)} ${y(0)}V${y(EQ.p)}H${x(0)}`} className="chart-guide" />
        <text x={x(0) - 6} y={y(EQ.p) + 4} className="chart-tick" textAnchor="end">
          {EQ.p}
        </text>
        <text x={x(EQ.q)} y={y(0) + 16} className="chart-tick" textAnchor="middle">
          {EQ.q}
        </text>
        <line x1={x(0)} y1={y(50)} x2={x(100)} y2={y(0)} className="chart-demand" />
        <line x1={x(0)} y1={y(0)} x2={x(100)} y2={y(50)} className="chart-supply" />
        <text x={x(100) + 5} y={y(0) - 6} className="chart-curve-name chart-label-demand">
          D
        </text>
        <text x={x(100) + 5} y={y(50) + 5} className="chart-curve-name chart-label-supply">
          S
        </text>
        <circle cx={x(EQ.q)} cy={y(EQ.p)} r="6" className="chart-point" />
      </svg>
      <figcaption>
        From Market equilibrium: demand (<var>Q</var> = 100 − 2<var>P</var>) meets supply (
        <var>Q</var> = 2<var>P</var>) at price{' '}
        <span className="nowrap">
          <var>P</var> = {EQ.p}
        </span>{' '}
        and quantity{' '}
        <span className="nowrap">
          <var>Q</var> = {EQ.q}
        </span>
        .
      </figcaption>
    </figure>
  );
}

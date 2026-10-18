// Demand Q = 100 − 2P and supply Q = 2P, drawn the economist's way: Q across, P up.
const x = (q: number) => 40 + 2.6 * q;
const y = (p: number) => 170 - 3 * p;

const EQ = { p: 25, q: 50 };

export function EquilibriumChart() {
  return (
    <figure className="chart">
      <svg viewBox="0 0 320 200" role="img" aria-labelledby="chart-title chart-caption">
        <title id="chart-title">Supply and demand diagram</title>
        <defs>
          <pattern id="grid" width="13" height="15" patternUnits="userSpaceOnUse" x="40" y="20">
            <path d="M13 0V15M0 15H13" className="chart-grid" />
          </pattern>
        </defs>
        <rect x={x(0)} y={y(50)} width={x(100) - x(0)} height={y(0) - y(50)} fill="url(#grid)" />
        <path d={`M${x(0)} ${y(52)}V${y(0)}H${x(104)}`} className="chart-axis" />
        <text x={x(0) - 8} y={y(50) + 4} className="chart-label" textAnchor="end">
          P
        </text>
        <text x={x(104)} y={y(0) + 18} className="chart-label" textAnchor="end">
          Q
        </text>
        <path d={`M${x(EQ.q)} ${y(0)}V${y(EQ.p)}H${x(0)}`} className="chart-guide" />
        <line x1={x(0)} y1={y(50)} x2={x(100)} y2={y(0)} className="chart-demand" />
        <line x1={x(0)} y1={y(0)} x2={x(100)} y2={y(50)} className="chart-supply" />
        <text x={x(100) + 4} y={y(0) - 6} className="chart-label chart-label-demand">
          D
        </text>
        <text x={x(100) + 4} y={y(50) + 4} className="chart-label chart-label-supply">
          S
        </text>
        <circle cx={x(EQ.q)} cy={y(EQ.p)} r="6" className="chart-point" />
      </svg>
      <figcaption id="chart-caption">
        Demand Q = 100 − 2P meets supply Q = 2P at the equilibrium P = {EQ.p}, Q = {EQ.q}.
      </figcaption>
    </figure>
  );
}

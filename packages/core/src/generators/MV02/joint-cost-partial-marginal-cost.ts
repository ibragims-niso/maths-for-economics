import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** C(x, y) = F + a·x² + b·xy + c·y² + d·x + e·y. */
  F: number;
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  /** Output of the two goods. */
  x: number;
  y: number;
  /** The good whose marginal cost is asked for. */
  good: 'x' | 'y';
}

/** ∂C/∂x = 2a·x + b·y + d. */
const cx = (p: Params) => 2 * p.a * p.x + p.b * p.y + p.d;
/** ∂C/∂y = b·x + 2c·y + e. */
const cy = (p: Params) => p.b * p.x + 2 * p.c * p.y + p.e;
const marginalCost = (p: Params) => (p.good === 'x' ? cx(p) : cy(p));

const candidates = (p: Params): Distractor[] => {
  const own = p.good === 'x';
  // The cross term b·xy, its partial at the point, and the terms without the chosen variable.
  const cross = own ? p.b * p.y : p.b * p.x;
  const ownLevel = own ? p.x : p.y;
  const otherTerms = own ? p.c * p.y * p.y + p.e * p.y : p.a * p.x * p.x + p.d * p.x;
  const mc = marginalCost(p);
  return [
    { value: own ? cy(p) : cx(p), mistakeCode: 'WRONG_VARIABLE' },
    { value: mc - cross, mistakeCode: 'CROSS_TERM_DROPPED' },
    // Product rule on b·xy as if the other good changed too: b·(y + x) instead of b·y.
    { value: mc + p.b * ownLevel, mistakeCode: 'OTHER_VARIABLE_MOVED' },
    { value: mc + otherTerms, mistakeCode: 'KEPT_OTHER_TERMS' },
  ];
};

const wrongAnswers = (p: Params) => cleanDistractors(marginalCost(p), candidates(p));

/** "+ 3x^2", "- xy", "+ 10y": one term with its sign, coefficient 1 left out. */
const term = (coef: number, variable: string, first = false) => {
  const sign = coef < 0 ? '-' : first ? '' : '+';
  const size = Math.abs(coef) === 1 ? '' : num(Math.abs(coef));
  return first ? `${sign}${size}${variable}` : `${sign} ${size}${variable}`;
};

/** The same in plain text for a "why" line: "2xy", "−xy", "3y". */
const plain = (coef: number, variable: string) =>
  `${coef < 0 ? '−' : ''}${Math.abs(coef) === 1 ? '' : Math.abs(coef)}${variable}`;

const costLatex = (p: Params) =>
  [
    num(p.F),
    term(p.a, 'x^2'),
    term(p.b, 'xy'),
    term(p.c, 'y^2'),
    p.d === 0 ? '' : term(p.d, 'x'),
    p.e === 0 ? '' : term(p.e, 'y'),
  ]
    .filter(Boolean)
    .join(' ');

/** MV02, difficulty 2: marginal cost of one good, ∂C/∂x or ∂C/∂y, for a two-product cost function. */
export const jointCostPartialMarginalCost: Generator<Params> = {
  id: 'joint-cost-partial-marginal-cost',
  title: 'Marginal cost with two products',
  topicId: 'MV02',
  difficulty: 2,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const p: Params = {
        F: rng.int(10, 80) * 10,
        a: rng.int(1, 5),
        b: rng.pick([-3, -2, -1, 1, 2, 3, 4] as const),
        c: rng.int(1, 5),
        d: rng.int(0, 30),
        e: rng.int(0, 30),
        x: rng.int(2, 20),
        y: rng.int(2, 20),
        good: rng.pick(['x', 'y'] as const),
      };
      // Costs must rise with each output, so both marginal costs are positive.
      if (p.x === p.y || cx(p) < 5 || cy(p) < 5) continue;
      if (wrongAnswers(p).length >= 3) return p;
    }
  },

  stem(p) {
    const name = p.good === 'x' ? 'bread' : 'cakes';
    return `A bakery makes $x$ trays of bread and $y$ trays of cakes a day, at a total cost of $C(x, y) = ${costLatex(p)}$. Find the marginal cost of ${name}, $\\dfrac{\\partial C}{\\partial ${p.good}}$, when $x = ${num(p.x)}$ and $y = ${num(p.y)}$.`;
  },

  answer: (p) => ({ kind: 'numeric', value: marginalCost(p), decimals: 2 }),

  steps(p) {
    const own = p.good === 'x';
    const other = own ? 'y' : 'x';
    const formula = own
      ? `\\dfrac{\\partial C}{\\partial x} = ${num(2 * p.a)}x ${term(p.b, 'y')}${p.d === 0 ? '' : ` + ${num(p.d)}`}`
      : `\\dfrac{\\partial C}{\\partial y} = ${term(p.b, 'x', true)} + ${num(2 * p.c)}y${p.e === 0 ? '' : ` + ${num(p.e)}`}`;
    const cross = own ? p.b * p.y : p.b * p.x;
    const power = num(own ? 2 * p.a * p.x : 2 * p.c * p.y);
    const linear = own ? p.d : p.e;
    const tail = linear === 0 ? '' : ` + ${num(linear)}`;
    const substituted = own
      ? `${power} ${cross < 0 ? '-' : '+'} ${num(Math.abs(cross))}${tail}`
      : `${num(cross)} + ${power}${tail}`;
    return [
      {
        text: `Hold ${other} constant and differentiate term by term with respect to ${p.good}.`,
        latex: formula,
        why: `Terms with no ${p.good} are constants and vanish. In the cross term ${plain(p.b, 'xy')} the factor ${plain(p.b, other)} is a constant multiplier, so the derivative of the term is ${plain(p.b, other)}.`,
      },
      {
        text: 'Substitute the outputs.',
        latex: `\\dfrac{\\partial C}{\\partial ${p.good}} = ${substituted} = ${num(marginalCost(p))}`,
        why: `This is the approximate extra cost of one more tray of ${own ? 'bread' : 'cakes'} with the output of the other good unchanged.`,
        result: marginalCost(p),
      },
    ];
  },

  distractors: wrongAnswers,
};

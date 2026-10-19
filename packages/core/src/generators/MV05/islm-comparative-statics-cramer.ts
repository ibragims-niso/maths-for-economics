import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Marginal propensity to consume C′, e.g. 0.75. */
  b: number;
  /** Investment falls by h for each percentage point of interest: I′(r) = −h. */
  h: number;
  /** Money demand rises by k per unit of income: L_Y = k. */
  k: number;
  /** Money demand falls by l per percentage point of interest: L_r = −l. */
  l: number;
  /** The policy that changes: government spending G or the real money supply M. */
  ask: 'G' | 'M';
}

const MPC = [0.6, 0.7, 0.75, 0.8, 0.9] as const;
const K = [0.1, 0.2, 0.25, 0.4, 0.5] as const;

/** l(1 − b) + h·k, which is −det J. */
const D = (p: Params) => round(p.l * (1 - p.b) + p.h * p.k, 6);
const detJ = (p: Params) => -D(p);
/** det J with the Y column replaced by the change in the right-hand side, (1, 0) or (0, 1). */
const detJY = (p: Params) => (p.ask === 'G' ? -p.l : -p.h);
/** ∂Y/∂G = l/D or ∂Y/∂M = h/D, by Cramer's rule. */
const effect = (p: Params) => round(detJY(p) / detJ(p), 2);

function candidates(p: Params) {
  const list = [
    { value: -effect(p), mistakeCode: 'SIGN' },
    // The unit change put in the other equation: (0, 1) for G or (1, 0) for M gives h/D or l/D.
    {
      value: round((p.ask === 'G' ? p.h : p.l) / D(p), 2),
      mistakeCode: 'WRONG_EQUATION',
    },
    { value: detJY(p), mistakeCode: 'NOT_DIVIDED' },
  ];
  if (p.ask === 'G') {
    list.push({ value: round(1 / (1 - p.b), 2), mistakeCode: 'SIMPLE_MULTIPLIER' });
  }
  return list;
}

/** MV05, difficulty 3: ∂Y/∂G or ∂Y/∂M in an IS–LM model, from the Jacobian and Cramer's rule. */
export const islmComparativeStaticsCramer: Generator<Params> = {
  id: 'islm-comparative-statics-cramer',
  title: 'IS–LM comparative statics',
  topicId: 'MV05',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const p: Params = {
        b: rng.pick(MPC),
        h: rng.int(2, 20) * 5,
        k: rng.pick(K),
        l: rng.int(2, 20) * 10,
        ask: rng.pick(['G', 'M'] as const),
      };
      const e = effect(p);
      if (e < 0.2 || e > 10) continue;
      if (cleanDistractors(e, candidates(p)).length < candidates(p).length) continue;
      return p;
    }
  },

  stem: (p) =>
    `In an IS–LM model the goods market clears when $Y = C(Y - T) + I(r) + G$ and the money market when $L(Y, r) = M$, where $Y$ is income, $r$ the interest rate in percentage points, $G$ government spending and $M$ the real money supply (in billions). At the current equilibrium $C' = ${num(p.b)}$, $I'(r) = -${num(p.h)}$, $L_Y = ${num(p.k)}$ and $L_r = -${num(p.l)}$. Use the implicit function theorem and Cramer's rule to find $\\dfrac{\\partial Y}{\\partial ${p.ask}}$. Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: effect(p), decimals: 2 }),

  steps(p) {
    const ans = effect(p);
    const oneMinusB = num(round(1 - p.b, 2));
    const unit = p.ask === 'G' ? '1, 0' : '0, 1';
    return [
      {
        text: 'Take the total differential of both equilibrium conditions, unknowns on the left.',
        latex: `\\begin{aligned} ${oneMinusB}\\,dY + ${num(p.h)}\\,dr &= dG \\\\ ${num(p.k)}\\,dY - ${num(p.l)}\\,dr &= dM \\end{aligned}`,
        why: `In the goods market dY = C′dY + I′dr + dG, and C′ = ${num(p.b)}, I′ = −${num(p.h)}. In the money market L_Y dY + L_r dr = dM. Only the derivatives at the equilibrium matter.`,
      },
      {
        text: 'Write the Jacobian of the system and its determinant.',
        latex: `J = \\begin{bmatrix} ${oneMinusB} & ${num(p.h)} \\\\ ${num(p.k)} & -${num(p.l)} \\end{bmatrix}, \\quad \\det J = -${oneMinusB} \\cdot ${num(p.l)} - ${num(p.h)} \\cdot ${num(p.k)} = ${num(detJ(p))}`,
        why: 'det J is not zero, so by the implicit function theorem Y and r are differentiable functions of G and M near the equilibrium.',
        result: detJ(p),
      },
      {
        text: `Replace the Y column by the effect of a unit rise in ${p.ask}, (${unit}).`,
        latex: `\\det J_Y = \\det \\begin{bmatrix} ${p.ask === 'G' ? '1' : '0'} & ${num(p.h)} \\\\ ${p.ask === 'G' ? '0' : '1'} & -${num(p.l)} \\end{bmatrix} = ${num(detJY(p))}`,
        why: `Divide the differentials by d${p.ask} with the other policy fixed: the right-hand side becomes (${unit}). Cramer's rule puts it in the column of the unknown we want, Y.`,
        result: detJY(p),
      },
      {
        text: 'Divide by det J.',
        latex: `\\dfrac{\\partial Y}{\\partial ${p.ask}} = \\dfrac{${num(detJY(p))}}{${num(detJ(p))}} = ${num(ans)}`,
        why:
          p.ask === 'G'
            ? `Each extra unit of spending raises income by about ${num(ans)}, less than the simple multiplier 1/(1 − C′) = ${num(round(1 / (1 - p.b), 2))}, because the higher interest rate crowds out some investment.`
            : `Each extra unit of real money raises income by about ${num(ans)}: the interest rate falls and investment rises.`,
        result: ans,
      },
    ];
  },

  distractors: (p) => cleanDistractors(effect(p), candidates(p)),
};

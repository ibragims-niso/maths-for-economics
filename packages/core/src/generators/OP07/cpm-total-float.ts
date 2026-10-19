import type { Generator } from '../../engine/types';
import { cleanDistractors } from '../format';
import {
  backwardPass,
  drawNetwork,
  forwardPass,
  freeFloat,
  NAMES,
  type Network,
  precedenceList,
  WHOLE,
} from './network';

interface Params extends Network {
  /** The activity whose total float is asked for (never on the critical path). */
  target: number;
}

const float = (p: Params) => {
  const { es, total } = forwardPass(p);
  const { ls } = backwardPass(p, total);
  return (ls[p.target] ?? 0) - (es[p.target] ?? 0);
};

const candidates = (p: Params) => {
  const { es, total } = forwardPass(p);
  const { lf } = backwardPass(p, total);
  const wrong = backwardPass(p, total, 'max');
  const i = p.target;
  return [
    { value: freeFloat(p, i), mistakeCode: 'FREE_FLOAT' },
    { value: (lf[i] ?? 0) - (es[i] ?? 0), mistakeCode: 'START_FINISH_MIX' },
    { value: (wrong.ls[i] ?? 0) - (es[i] ?? 0), mistakeCode: 'BACKWARD_MAX' },
  ];
};

/** OP07, difficulty 2: the total float (LS − ES) of a named non-critical activity. */
export const cpmTotalFloat: Generator<Params> = {
  id: 'cpm-total-float',
  title: 'Total float of an activity',
  topicId: 'OP07',
  difficulty: 2,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const net = drawNetwork(rng);
      if (!net) continue;
      const n = net.duration.length;
      const p: Params = { ...net, target: rng.int(0, n - 2) };
      const tf = float(p);
      if (tf <= 0) continue;
      if (cleanDistractors(tf, candidates(p), WHOLE.tolerance, WHOLE.relTolerance).length < 2)
        continue;
      return p;
    }
  },

  stem(p) {
    return `A conference is organised through ${p.duration.length} activities: ${precedenceList(p)}. What is the total float of activity ${NAMES[p.target]}, in days?`;
  },

  answer: (p) => ({ kind: 'numeric', value: float(p), decimals: 0, ...WHOLE }),

  steps(p) {
    const { es, ef, total } = forwardPass(p);
    const { ls, lf } = backwardPass(p, total);
    const i = p.target;
    const x = NAMES[i];
    const tf = float(p);
    return [
      {
        text: 'Forward pass: earliest start and finish of every activity.',
        latex: p.duration.map((_, j) => `${NAMES[j]}: ${es[j]}\\to${ef[j]}`).join(',\\; '),
        why: 'Each activity starts at the largest earliest finish among its predecessors; the final activity finishes at the project duration T.',
        result: total,
      },
      {
        text: 'Backward pass from T: latest finish and start of every activity.',
        latex: p.duration.map((_, j) => `${NAMES[j]}: ${ls[j]}\\to${lf[j]}`).join(',\\; '),
        why: 'An activity must finish by the smallest latest start among its successors, otherwise one of them would start late and push back the end of the project.',
      },
      {
        text: `Total float of ${x}: latest start minus earliest start.`,
        latex: `\\text{TF}_{${x}} = \\text{LS}_{${x}} - \\text{ES}_{${x}} = ${ls[i]} - ${es[i]} = ${tf}`,
        why: `${x} can start up to this many days late (or take this many days longer) without delaying the whole project. The same number is LF − EF = ${lf[i]} − ${ef[i]}.`,
        result: tf,
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(float(p), candidates(p), WHOLE.tolerance, WHOLE.relTolerance),
};

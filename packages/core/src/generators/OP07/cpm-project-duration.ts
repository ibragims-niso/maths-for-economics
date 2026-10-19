import type { Generator } from '../../engine/types';
import { cleanDistractors } from '../format';
import {
  allPaths,
  drawNetwork,
  forwardPass,
  NAMES,
  type Network,
  pathLength,
  pathName,
  precedenceList,
  WHOLE,
} from './network';

type Params = Network;

const sortedPaths = (p: Params) =>
  allPaths(p)
    .map((path) => ({ path, length: pathLength(p, path) }))
    .sort((a, b) => b.length - a.length);

const candidates = (p: Params) => {
  const paths = sortedPaths(p);
  return [
    { value: p.duration.reduce((s, d) => s + d, 0), mistakeCode: 'SUM_ALL_DURATIONS' },
    { value: Math.max(...p.duration), mistakeCode: 'LONGEST_ACTIVITY' },
    { value: paths[paths.length - 1]?.length ?? 0, mistakeCode: 'SHORTEST_PATH' },
  ];
};

/** OP07, difficulty 1: the project duration (length of the critical path) from a precedence list. */
export const cpmProjectDuration: Generator<Params> = {
  id: 'cpm-project-duration',
  title: 'Project duration from a precedence list',
  topicId: 'OP07',
  difficulty: 1,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const net = drawNetwork(rng);
      if (!net) continue;
      const paths = sortedPaths(net);
      // At least three chains, and one clear longest one (the critical path is unique).
      if (paths.length < 3 || paths.length > 6) continue;
      if ((paths[0]?.length ?? 0) === (paths[1]?.length ?? 0)) continue;
      const total = forwardPass(net).total;
      if (cleanDistractors(total, candidates(net), WHOLE.tolerance, WHOLE.relTolerance).length < 3)
        continue;
      return net;
    }
  },

  stem(p) {
    return `A firm plans a product launch with ${p.duration.length} activities: ${precedenceList(p)}. Activities that do not depend on each other can run at the same time. What is the shortest possible duration of the project, in days?`;
  },

  answer: (p) => ({ kind: 'numeric', value: forwardPass(p).total, decimals: 0, ...WHOLE }),

  steps(p) {
    const { es, ef, total } = forwardPass(p);
    const paths = sortedPaths(p);
    const forward = p.duration.map((_, i) => `${NAMES[i]}: ${es[i]}\\to${ef[i]}`).join(',\\; ');
    return [
      {
        text: 'Forward pass: each activity starts when its last predecessor finishes (ES = largest EF of its predecessors, EF = ES + duration).',
        latex: forward,
        why: 'An activity cannot start until every activity it depends on is complete, so at a merge the latest finish among the predecessors decides the start.',
      },
      {
        text: 'The project ends when the final activity finishes.',
        latex: `T = \\text{EF}_{${NAMES[p.duration.length - 1]}} = ${total}`,
        why: 'Only one activity has no successor, so its earliest finish is the earliest moment the whole project can be complete.',
        result: total,
      },
      {
        text: 'Check by listing every chain from the start to the end: the longest one is the critical path.',
        latex: paths.map((q) => `${pathName(q.path)} = ${q.length}`).join(',\\; '),
        why: 'Every chain must be completed, one activity after another, so the project can never be shorter than its longest chain, and the forward pass shows that it need not be longer.',
        result: paths[0]?.length ?? total,
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(forwardPass(p).total, candidates(p), WHOLE.tolerance, WHOLE.relTolerance),
};

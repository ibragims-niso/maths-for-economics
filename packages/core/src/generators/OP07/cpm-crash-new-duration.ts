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

interface Params extends Network {
  /** The critical activity that is crashed. */
  target: number;
  /** Days cut from its duration. */
  cut: number;
}

const crashed = (p: Params): Network => ({
  preds: p.preds,
  duration: p.duration.map((d, i) => (i === p.target ? d - p.cut : d)),
});

const newTotal = (p: Params) => forwardPass(crashed(p)).total;

const table = (p: Params) =>
  allPaths(p)
    .map((path) => ({ path, before: pathLength(p, path), after: pathLength(crashed(p), path) }))
    .sort((a, b) => b.before - a.before);

const candidates = (p: Params) => {
  const total = forwardPass(p).total;
  return [
    { value: total - p.cut, mistakeCode: 'FULL_SAVING' },
    { value: table(p)[1]?.before ?? total, mistakeCode: 'OLD_SECOND_PATH' },
  ];
};

/** OP07, difficulty 3: the project duration after a critical activity is crashed by a few days. */
export const cpmCrashNewDuration: Generator<Params> = {
  id: 'cpm-crash-new-duration',
  title: 'Project duration after crashing',
  topicId: 'OP07',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const net = drawNetwork(rng);
      if (!net) continue;
      const paths = allPaths(net)
        .map((path) => ({ path, length: pathLength(net, path) }))
        .sort((a, b) => b.length - a.length);
      if (paths.length < 3 || paths.length > 6) continue;
      const critical = paths[0];
      if (!critical || critical.length === paths[1]?.length) continue;
      const total = critical.length;
      // Every (critical activity, cut) where the saving is partly lost, because another chain
      // becomes critical before the full cut, and both wrong answers differ from the right one.
      const options = critical.path.flatMap((target) =>
        Array.from({ length: Math.max(0, (net.duration[target] ?? 0) - 2) }, (_, c) => {
          const p: Params = { ...net, target, cut: c + 2 };
          const after = newTotal(p);
          const ok =
            after > total - p.cut &&
            after < total &&
            cleanDistractors(after, candidates(p), WHOLE.tolerance, WHOLE.relTolerance).length ===
              2;
          return ok ? [p] : [];
        }).flat(),
      );
      if (options.length === 0) continue;
      return rng.pick(options);
    }
  },

  stem(p) {
    const x = NAMES[p.target];
    return `A building project has ${p.duration.length} activities: ${precedenceList(p)}. To finish sooner, the firm pays overtime to cut activity ${x} by ${p.cut} days. What is the new shortest duration of the project, in days?`;
  },

  answer: (p) => ({ kind: 'numeric', value: newTotal(p), decimals: 0, ...WHOLE }),

  steps(p) {
    const rows = table(p);
    const total = forwardPass(p).total;
    const after = newTotal(p);
    const x = NAMES[p.target];
    const newD = (p.duration[p.target] ?? 0) - p.cut;
    return [
      {
        text: 'List every chain from the start to the end with its length; the longest is the critical path.',
        latex: rows.map((r) => `${pathName(r.path)} = ${r.before}`).join(',\\; '),
        why: `The project lasts as long as its longest chain, T = ${total} days, and ${x} lies on that chain.`,
        result: total,
      },
      {
        text: `Shorten ${x} to ${newD} ${newD === 1 ? 'day' : 'days'} and recompute the length of every chain that passes through it.`,
        latex: rows.map((r) => `${pathName(r.path)} = ${r.after}`).join(',\\; '),
        why: `Only chains that contain ${x} get shorter; every other chain keeps its length.`,
      },
      {
        text: 'The new duration is the longest chain after the cut.',
        latex: `T_{\\text{new}} = ${after} \\quad(\\text{not } ${total} - ${p.cut} = ${total - p.cut})`,
        why: 'Once another chain is as long as the crashed one, it becomes critical too, and cutting the crashed activity further saves nothing: part of the overtime is wasted.',
        result: after,
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(newTotal(p), candidates(p), WHOLE.tolerance, WHOLE.relTolerance),
};

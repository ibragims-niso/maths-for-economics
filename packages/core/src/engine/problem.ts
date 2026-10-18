import { withinTolerance } from './grading';
import { createRng } from './rng';
import type { Generator, Problem } from './types';

/** Builds the concrete problem for a seed. The same generator and seed always give the same problem. */
export function makeProblem<P>(generator: Generator<P>, seed: number): Problem<P> {
  const params = generator.params(createRng(seed));
  return {
    templateId: generator.id,
    seed,
    params,
    stem: generator.stem(params),
    answer: generator.answer(params),
    steps: generator.steps(params),
    distractors: generator.distractors(params),
  };
}

/**
 * The properties every generator must have (docs/04): finite answer, last step equals the
 * answer, distractors distinct from the answer and from each other, deterministic for a seed.
 * Returns the list of violations (empty when the problem is sound).
 */
export function checkProblem<P>(generator: Generator<P>, seed: number): string[] {
  const problems: string[] = [];
  const p = makeProblem(generator, seed);
  const again = makeProblem(generator, seed);
  if (JSON.stringify(p) !== JSON.stringify(again)) problems.push('not deterministic for its seed');

  if (p.answer.kind === 'numeric') {
    const { value, tolerance } = p.answer;
    if (!Number.isFinite(value)) problems.push(`answer is not finite: ${value}`);
    const last = [...p.steps].reverse().find((s) => s.result !== undefined);
    if (!last) problems.push('no step states a result');
    else if (!withinTolerance(last.result ?? Number.NaN, value, tolerance)) {
      problems.push(`last step result ${last.result} differs from answer ${value}`);
    }
    p.distractors.forEach((d, i) => {
      if (!Number.isFinite(d.value)) problems.push(`distractor ${d.mistakeCode} is not finite`);
      if (withinTolerance(d.value, value, tolerance)) {
        problems.push(`distractor ${d.mistakeCode} (${d.value}) equals the answer`);
      }
      p.distractors.slice(i + 1).forEach((e) => {
        if (withinTolerance(d.value, e.value, tolerance)) {
          problems.push(`distractors ${d.mistakeCode} and ${e.mistakeCode} coincide`);
        }
      });
    });
  }
  if (p.steps.some((s) => !s.why.trim())) problems.push('a step has no "why"');
  if (!p.stem.trim()) problems.push('empty stem');
  return problems;
}

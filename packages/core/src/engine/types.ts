import type { Rng } from './rng';

/** What the student must give. Numeric answers are graded with a tolerance (see grading.ts). */
export type Answer =
  | {
      kind: 'numeric';
      value: number;
      /** Absolute tolerance; grading also allows a relative one, whichever is larger. */
      tolerance?: number;
      /** Relative tolerance (default 0.5 %). Money answers use a much smaller one. */
      relTolerance?: number;
      unit?: string;
      /** Decimal places to show the answer with. */
      decimals?: number;
    }
  | { kind: 'choice'; options: string[]; correct: number };

/** One line of a worked solution. `why` is what "Explain this step" shows offline. */
export interface Step {
  /** Plain-language description of the step. */
  text: string;
  /** The maths of the step, as LaTeX. */
  latex: string;
  why: string;
  /** The number this step produces, when it produces one; the last one must equal the answer. */
  result?: number;
}

/** A wrong answer a student is likely to give, tagged with the mistake that leads to it. */
export interface Distractor {
  value: number;
  mistakeCode: string;
}

/** A problem template (docs/04-content-model.md). Every method is a pure function. */
export interface Generator<P = unknown> {
  id: string;
  topicId: string;
  difficulty: 1 | 2 | 3;
  /** Suggested time in seconds at this difficulty. */
  timeSec: number;
  /** Valid, readable parameters; invalid draws are rejected inside, never returned. */
  params(rng: Rng): P;
  /** The question, LaTeX between $...$. */
  stem(p: P): string;
  answer(p: P): Answer;
  steps(p: P): Step[];
  distractors(p: P): Distractor[];
}

/** A concrete problem: a generator plus the seed that fixes its numbers. */
export interface Problem<P = unknown> {
  templateId: string;
  seed: number;
  params: P;
  stem: string;
  answer: Answer;
  steps: Step[];
  distractors: Distractor[];
}

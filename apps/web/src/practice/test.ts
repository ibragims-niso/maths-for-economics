import {
  type Answer,
  composeTest,
  type Difficulty,
  GENERATORS,
  type GradeResult,
  generatorById,
  gradeNumeric,
  makeProblem,
  type Problem,
  randomSeed,
  type TestPlan,
} from '@mfe/core';

export interface TestSettings {
  topicIds: string[];
  difficulty: Difficulty;
  count: number;
}

export interface TestQuestion {
  topicId: string;
  title: string;
  difficulty: 1 | 2 | 3;
  problem: Problem;
}

export interface RunningTest {
  settings: TestSettings;
  questions: TestQuestion[];
  timeLimitSec: number;
}

export interface TestOutcome {
  test: RunningTest;
  answers: string[];
  grades: GradeResult[];
  secondsUsed: number;
  timedOut: boolean;
}

export const planTest = (settings: TestSettings, seed: number): TestPlan =>
  composeTest({ ...settings, generators: GENERATORS, seed });

/** Turns a plan into concrete problems. Same plan, same numbers. */
export function startTest(settings: TestSettings, plan: TestPlan): RunningTest {
  const questions = plan.items.flatMap((item) => {
    const generator = generatorById(item.templateId);
    if (!generator) return [];
    return [
      {
        topicId: item.topicId,
        title: generator.title,
        difficulty: generator.difficulty,
        problem: makeProblem(generator, item.seed),
      },
    ];
  });
  return { settings, questions, timeLimitSec: plan.timeLimitSec };
}

/** A new test with the same settings and new numbers ("Practise again"). */
export const retakeTest = (settings: TestSettings) =>
  startTest(settings, planTest(settings, randomSeed()));

/** Grades every answer by code; an empty answer is simply wrong. */
export function gradeTest(test: RunningTest, answers: string[]): GradeResult[] {
  return test.questions.map(({ problem }, i) =>
    problem.answer.kind === 'numeric'
      ? gradeNumeric(problem.answer, answers[i] ?? '', problem.distractors)
      : { correct: false, value: null },
  );
}

export function formatAnswer(answer: Answer): string {
  if (answer.kind === 'choice') return answer.options[answer.correct] ?? '';
  const text = new Intl.NumberFormat('en-GB', {
    maximumFractionDigits: answer.decimals ?? 2,
  }).format(answer.value);
  return answer.unit ? `${text} ${answer.unit}` : text;
}

/** 754 → "12:34", for the countdown. */
export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** 492 → "8 min 12 s", 840 → "14 min". */
export function formatDuration(seconds: number): string {
  const s = Math.round(seconds);
  const min = Math.floor(s / 60);
  if (min === 0) return `${s} s`;
  return s % 60 === 0 ? `${min} min` : `${min} min ${s % 60} s`;
}

export const DIFFICULTY_NAME = { 1: 'Easy', 2: 'Medium', 3: 'Hard' } as const;

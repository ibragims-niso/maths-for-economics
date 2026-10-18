import type { ChatMessage } from './prompts';

export type QuestionCategory = 'concept' | 'user_problem' | 'real_world' | 'off_topic';

const CATEGORIES: readonly QuestionCategory[] = [
  'concept',
  'user_problem',
  'real_world',
  'off_topic',
];

/** The classifier prompt (docs/03): a small model at temperature 0, JSON only. */
export function classifierMessages(topicTitle: string, question: string): ChatMessage[] {
  return [
    {
      role: 'system',
      content: `Classify the student's message about the topic "${topicTitle}". Reply with JSON only, for example {"category": "concept"}.
"concept": asks what/why/how about an idea, definition or intuition.
"user_problem": contains a specific exercise to solve, numbers to compute, or asks to check an answer.
"real_world": asks where/how the topic is used in practice, careers, data, policy.
"off_topic": anything unrelated to maths or economics.`,
    },
    { role: 'user', content: question },
  ];
}

/** Reads the classifier's reply. Anything unclear counts as the student's own exercise (safe default). */
export function parseCategory(raw: string): QuestionCategory {
  const match = /\{[\s\S]*\}/.exec(raw);
  if (!match) return 'user_problem';
  try {
    const value = (JSON.parse(match[0]) as { category?: unknown }).category;
    return CATEGORIES.find((c) => c === value) ?? 'user_problem';
  } catch {
    return 'user_problem';
  }
}

/** Numbers written in a text: "1,250", "12.5", "−3", "4%" → 1250, 12.5, -3, 4. */
export function numbersIn(text: string): number[] {
  const found = text.replace(/[−–]/g, '-').match(/-?\d[\d,]*(?:\.\d+)?/g) ?? [];
  return found.map((n) => Number(n.replace(/,/g, ''))).filter(Number.isFinite);
}

/** Small numbers that appear in any explanation (step counts, "1 unit", percentages of 100). */
const COMMON = new Set([0, 1, 2, 3, 4, 10, 100]);

/**
 * Output check for the student's own exercise (docs/03 guardrail layer 4): an answer that
 * repeats two or more of the student's own numbers (other than everyday ones, and other than
 * the analog problem's numbers) is probably working on their exercise, so it is replaced.
 */
export function usesStudentNumbers(question: string, answer: string, analogText: string): boolean {
  // Signs are compared away: "−30" and "- 30" are the same number to a reader.
  const abs = (text: string) => numbersIn(text).map(Math.abs);
  const analog = new Set(abs(analogText));
  const own = new Set(abs(question).filter((n) => !COMMON.has(n) && !analog.has(n)));
  if (own.size === 0) return false;
  const inAnswer = new Set(abs(answer));
  let hits = 0;
  for (const n of own) if (inAnswer.has(n)) hits++;
  return hits >= Math.min(2, own.size);
}

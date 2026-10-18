import { describe, expect, it } from 'vitest';
import { makeProblem } from '../engine/problem';
import { generatorById } from '../generators';
import { numbersIn, parseCategory, usesStudentNumbers } from './guards';
import { analogFallbackText, problemBlock } from './prompts';
import { aiRequestSchema } from './request';

describe('classifier reply', () => {
  it('reads the category and defaults to the safe one', () => {
    expect(parseCategory('{"category": "concept"}')).toBe('concept');
    expect(parseCategory('Sure! {"category":"real_world"}')).toBe('real_world');
    expect(parseCategory('{"category": "homework"}')).toBe('user_problem');
    expect(parseCategory('I think it is a concept')).toBe('user_problem');
    expect(parseCategory('{broken')).toBe('user_problem');
  });
});

describe('output check for the student’s own exercise', () => {
  const analog = 'Demand is Q = 120 - 3P. Find the elasticity at P = 15.';

  it('reads numbers as students write them', () => {
    expect(numbersIn('Q = 1,250 − 2.5P at 4%, ε = −0.67')).toEqual([1250, 2.5, 4, -0.67]);
  });

  it('flags an answer that works with the student’s numbers', () => {
    const question = 'Demand is Q = 250 - 5P. What is the elasticity at P = 30?';
    expect(usesStudentNumbers(question, 'At P = 30, Q = 250 - 150 = 100, so...', analog)).toBe(
      true,
    );
  });

  it('lets an answer about the analog problem through', () => {
    const question = 'Demand is Q = 250 - 5P. What is the elasticity at P = 30?';
    expect(usesStudentNumbers(question, 'With Q = 120 - 3P at P = 15: Q = 75 ...', analog)).toBe(
      false,
    );
  });

  it('ignores questions without numbers of their own', () => {
    expect(usesStudentNumbers('What does elasticity mean?', 'It is 2 or 3 things', analog)).toBe(
      false,
    );
  });
});

describe('problems sent to the AI', () => {
  it('carry the app’s own steps and answer, and a fallback without a model', () => {
    const generator = generatorById('elasticity-linear-point');
    if (!generator) throw new Error('missing generator');
    const problem = makeProblem(generator, 5);
    const block = problemBlock(problem);
    expect(block).toContain(problem.stem);
    expect(block).toContain(`ANSWER: ${problem.answer.kind === 'numeric' && problem.answer.value}`);
    expect(analogFallbackText(problem)).toContain('Now apply the same steps to your own numbers.');
  });
});

describe('AI requests', () => {
  const base = {
    topicId: 'C107',
    contentVersion: 'abc123',
    deviceId: '0b6e5c1e-2b7f-4c62-9a43-6f1b2b9d6a10',
  };

  it('accepts the app’s modes and refuses free text that is too long', () => {
    expect(
      aiRequestSchema.safeParse({ ...base, mode: 'ASK', payload: { question: 'What is it?' } })
        .success,
    ).toBe(true);
    expect(
      aiRequestSchema.safeParse({ ...base, mode: 'ASK', payload: { question: 'x'.repeat(501) } })
        .success,
    ).toBe(false);
    expect(
      aiRequestSchema.safeParse({
        ...base,
        mode: 'EXPLAIN_STEP',
        payload: { templateId: 'elasticity-linear-point', seed: 5, step: 1 },
      }).success,
    ).toBe(true);
  });

  it('does not accept a problem as text', () => {
    expect(
      aiRequestSchema.safeParse({
        ...base,
        mode: 'EXPLAIN_STEP',
        payload: { problem: 'Solve Q = 100 - 2P', step: 0 },
      }).success,
    ).toBe(false);
  });
});

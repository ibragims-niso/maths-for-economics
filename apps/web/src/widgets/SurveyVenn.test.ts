import { describe, expect, it } from 'vitest';
import { describeCount, overlapRange, SURVEY_SIZE, vennCounts } from './SurveyVenn';

describe('survey-venn', () => {
  it('reproduces worked example 1 of F09 (500 households, 320, 210, 150 both)', () => {
    expect(vennCounts(SURVEY_SIZE, 320, 210, 150)).toEqual({
      onlyA: 170,
      onlyB: 60,
      union: 380,
      neither: 120,
      exactlyOne: 230,
    });
  });

  it('keeps the four regions non-negative and adding up to the survey', () => {
    for (let a = 0; a <= SURVEY_SIZE; a += 10) {
      for (let b = 0; b <= SURVEY_SIZE; b += 10) {
        const [lo, hi] = overlapRange(SURVEY_SIZE, a, b);
        expect(lo).toBeLessThanOrEqual(hi);
        for (const both of [lo, hi]) {
          const c = vennCounts(SURVEY_SIZE, a, b, both);
          for (const v of [c.onlyA, c.onlyB, both, c.neither]) expect(v).toBeGreaterThanOrEqual(0);
          expect(c.onlyA + c.onlyB + both + c.neither).toBe(SURVEY_SIZE);
          expect(c.exactlyOne).toBe(c.onlyA + c.onlyB);
        }
      }
    }
  });

  it('explains the count in the caption with the current numbers', () => {
    expect(describeCount(500, 320, 210, 150)).toContain('320 + 210 − 150 = 380');
    expect(describeCount(500, 320, 210, 150)).toContain('120 households with neither');
    expect(describeCount(500, 60, 80, 0)).toContain('do not overlap');
    expect(describeCount(500, 500, 480, 480)).toContain('Every household');
  });

  it('limits the overlap by the smaller group and by the survey size', () => {
    expect(overlapRange(500, 320, 210)).toEqual([30, 210]);
    expect(overlapRange(500, 100, 200)).toEqual([0, 100]);
  });
});

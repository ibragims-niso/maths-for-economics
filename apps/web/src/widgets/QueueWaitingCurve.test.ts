import { describe, expect, it } from 'vitest';
import { describeQueue, mm1Measures, waitingMinutes } from './QueueWaitingCurve';

describe('QueueWaitingCurve maths', () => {
  it('matches worked example 1 in SP05 and the default view (λ = 12, μ = 15)', () => {
    const m = mm1Measures(12, 15);
    expect(m?.rho).toBeCloseTo(0.8, 12);
    expect(m?.L).toBeCloseTo(4, 12);
    expect(m?.Lq).toBeCloseTo(3.2, 12);
    expect(m?.W).toBeCloseTo(20, 12);
    expect(m?.Wq).toBeCloseTo(16, 12);
  });

  it('gives the Try it checks (λ = 14 and μ = 20) and worked example 2 (μ = 10)', () => {
    const busy = mm1Measures(14, 15);
    expect(busy?.rho).toBeCloseTo(0.9333, 4);
    expect(busy?.L).toBeCloseTo(14, 12);
    expect(busy?.W).toBeCloseTo(60, 12);
    const faster = mm1Measures(12, 20);
    expect(faster?.rho).toBeCloseTo(0.6, 12);
    expect(faster?.W).toBeCloseTo(7.5, 12);
    expect(mm1Measures(8, 10)?.W).toBeCloseTo(30, 12);
    expect(mm1Measures(9, 10)?.L).toBeCloseTo(9, 12);
    expect(mm1Measures(9.5, 10)?.W).toBeCloseTo(120, 9);
    expect(mm1Measures(15, 15)).toBeNull();
    expect(mm1Measures(20, 15)).toBeNull();
  });

  it('agrees with Little’s law, W = Wq + 1/μ and the curve for every slider position', () => {
    for (let mu = 5; mu <= 30; mu++) {
      for (let lambda = 1; lambda < mu; lambda++) {
        const m = mm1Measures(lambda, mu);
        if (!m) throw new Error('stable queue expected');
        expect(m.L).toBeCloseTo((lambda * m.W) / 60, 9);
        expect(m.Lq).toBeCloseTo((lambda * m.Wq) / 60, 9);
        expect(m.W - m.Wq).toBeCloseTo(60 / mu, 9);
        expect(waitingMinutes(m.rho, mu)).toBeCloseTo(m.W, 9);
        // L from the probabilities (1 − ρ)ρⁿ, added up directly.
        let sum = 0;
        for (let n = 0; n < 5000; n++) sum += n * (1 - m.rho) * m.rho ** n;
        expect(sum).toBeCloseTo(m.L, 6);
      }
    }
  });

  it('makes the wait explode as ρ approaches 1', () => {
    const service = 60 / 10;
    expect(waitingMinutes(0.5, 10) / service).toBeCloseTo(2, 12);
    expect(waitingMinutes(0.9, 10) / service).toBeCloseTo(10, 9);
    expect(waitingMinutes(0.95, 10) / service).toBeCloseTo(20, 9);
    expect(waitingMinutes(0.99, 10)).toBeGreaterThan(waitingMinutes(0.95, 10) * 4.9);
  });

  it('describes each region of the curve', () => {
    expect(describeQueue(1)).toContain('without limit');
    expect(describeQueue(0.3)).toContain('idle');
    expect(describeQueue(0.8)).toContain('bend');
    expect(describeQueue(0.93)).toContain('steep');
  });
});

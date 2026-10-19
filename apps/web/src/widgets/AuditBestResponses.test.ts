import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  AuditBestResponses,
  auditRate,
  cheatGain,
  cheatRate,
  describeAudit,
  describeTrial,
  taxpayerReply,
} from './AuditBestResponses';

describe('AuditBestResponses', () => {
  it('matches GT02 Example 1: tax saved 10, fine 30, audit cost 2 → p* = 0.25, q* = 0.2', () => {
    expect(auditRate(30)).toBe(0.25);
    expect(cheatRate(2)).toBe(0.2);
    expect(cheatGain(0.25, 30)).toBe(0);
    // The office: auditing costs 2; not auditing loses 10 with probability q* = 0.2, also 2.
    expect(cheatRate(2) * 10).toBe(2);
  });

  it('matches the check in the Try it text: p = 0.1 gives a gain of 6; fine 40 gives p* = 0.2', () => {
    expect(cheatGain(0.1, 30)).toBeCloseTo(6, 12);
    expect(auditRate(40)).toBe(0.2);
    expect(taxpayerReply(0.1, 30)).toBe(1);
    expect(taxpayerReply(0.5, 30)).toBe(0);
    expect(taxpayerReply(0.25, 30)).toBeUndefined();
  });

  it('p* leaves the taxpayer indifferent over the slider ranges, and the fine does not move q*', () => {
    for (let fine = 5; fine <= 60; fine += 5) {
      const p = auditRate(fine);
      expect(p).toBeGreaterThan(0);
      expect(p).toBeLessThan(1);
      expect(cheatGain(p, fine)).toBeCloseTo(0, 12);
      // Cheating pays below p* and loses above it.
      expect(cheatGain(p - 0.01, fine)).toBeGreaterThan(0);
      expect(cheatGain(p + 0.01, fine)).toBeLessThan(0);
      if (fine > 5) expect(p).toBeLessThan(auditRate(fine - 5));
    }
    for (let cost = 0.5; cost <= 9.5; cost += 0.5) {
      const q = cheatRate(cost);
      expect(q).toBeGreaterThan(0);
      expect(q).toBeLessThan(1);
    }
  });

  it('describes the trial rate and the effect of the fine', () => {
    expect(describeTrial(0.1, 30)).toContain('gains 6 thousand');
    expect(describeTrial(0.5, 30)).toContain('reports honestly');
    expect(describeTrial(0.25, 30)).toContain('indifferent');
    expect(describeAudit(30, 2, 0.1)).toContain('p* = 10/(10 + F) = 0.25');
    expect(describeAudit(30, 2, 0.1)).toContain('q* = C/10 = 0.2');
  });

  it('shows the default read-outs', () => {
    const html = renderToStaticMarkup(createElement(AuditBestResponses));
    expect(html).toContain('<dd>0.25</dd>');
    expect(html).toContain('<dd>0.2</dd>');
    expect(html).toContain('<dd>6</dd>');
  });
});

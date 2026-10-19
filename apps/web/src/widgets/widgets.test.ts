import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { loadAllTopics } from '../content';
import { WIDGETS } from './index';
import { asFraction } from './PowerExplorer';

describe('widgets', () => {
  it('every widget a topic uses exists', async () => {
    for (const topic of await loadAllTopics()) {
      for (const id of topic.widgets) expect(WIDGETS, `${topic.id} uses ${id}`).toHaveProperty(id);
    }
  });

  it('every topic has a widget in its Try it section', async () => {
    for (const topic of await loadAllTopics()) {
      expect(topic.sections.interactive, topic.id).toContain('data-widget=');
      expect(topic.sections.interactive, topic.id).not.toMatch(
        /is planned|planned for this topic|coming soon/i,
      );
    }
  });

  // A display formula with $$ not on its own line can swallow the rest of a topic file without
  // any validation error, leaving later sections empty in the app.
  it('every topic shows all its sections and three worked examples', async () => {
    const sections = [
      'why',
      'intuition',
      'definitions',
      'interactive',
      'mistakes',
      'practice',
      'realWorld',
    ] as const;
    for (const topic of await loadAllTopics()) {
      for (const s of sections)
        expect(topic.sections[s].length, `${topic.id} ${s}`).toBeGreaterThan(20);
      expect(topic.sections.examples, topic.id).toHaveLength(3);
    }
  });

  it.each(Object.entries(WIDGETS))('%s renders a graph or controls without errors', (_id, W) => {
    const html = renderToStaticMarkup(createElement(W));
    expect(html).toContain('class="widget"');
    expect(html).not.toMatch(/NaN|Infinity|undefined/);
  });

  it('writes exponents in quarters as fractions', () => {
    expect([0.5, -1.25, 2, 0.75, -0.5].map(asFraction)).toEqual([
      '1/2',
      '−5/4',
      '2',
      '3/4',
      '−1/2',
    ]);
  });
});

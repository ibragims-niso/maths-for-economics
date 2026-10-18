import { describe, expect, it } from 'vitest';
import { aiTextToHtml } from './AiAnswer';

const allowed = new Set(['https://openstax.org/books/principles-economics-3e/pages/5-1']);

describe('AI answers on screen', () => {
  it('escapes HTML the model might write', () => {
    const html = aiTextToHtml('<img src=x onerror=alert(1)> **bold**', allowed);
    expect(html).not.toContain('<img');
    expect(html).toContain('&#60;img');
    expect(html).toContain('<strong>bold</strong>');
  });

  it('links only URLs from the topic’s resources', () => {
    const html = aiTextToHtml(
      'See https://openstax.org/books/principles-economics-3e/pages/5-1. Or https://evil.example/x',
      allowed,
    );
    expect(html).toContain(
      '<a href="https://openstax.org/books/principles-economics-3e/pages/5-1"',
    );
    expect(html).not.toContain('href="https://evil.example');
    expect(html).toContain('https://evil.example/x');
  });

  it('renders maths, lists and paragraphs', () => {
    const html = aiTextToHtml('First $\\varepsilon$ here.\n\n- one\n- two\n\n1. a\n2. b', allowed);
    expect(html).toContain('class="katex"');
    expect(html).toContain('<ul><li>one</li><li>two</li></ul>');
    expect(html).toContain('<ol><li>a</li><li>b</li></ol>');
  });
});

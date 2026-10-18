import 'katex/dist/katex.min.css';
import katex from 'katex';

const render = (latex: string, displayMode: boolean) =>
  katex.renderToString(latex, { displayMode, throwOnError: false, output: 'htmlAndMathml' });

/**
 * Text with inline maths between $...$, as generators write their questions.
 * The text comes from this app's own generators, never from the network.
 */
export function MathText({ text, className }: { text: string; className?: string }) {
  const html = text
    .split(/\$([^$]+)\$/)
    .map((part, i) => (i % 2 === 1 ? render(part, false) : escapeHtml(part)))
    .join('');
  return (
    <p
      className={className}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: KaTeX output for the app's own generator text, other text escaped
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/** One line of maths on its own, centred, scrolling sideways if it is wide. */
export function MathBlock({ latex }: { latex: string }) {
  return (
    <div
      className="math-block"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: KaTeX output for the app's own generator text
      dangerouslySetInnerHTML={{ __html: render(latex, true) }}
    />
  );
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

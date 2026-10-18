import { escapeHtml, renderLatex } from '../Maths';

/**
 * One line of AI text as HTML: maths through KaTeX, everything else escaped, **bold** kept, and
 * links only to URLs from the topic's own resource list (CLAUDE.md rule 5).
 */
function inline(text: string, allowedUrls: ReadonlySet<string>): string {
  const normalised = text
    .replace(/\\\[([\s\S]+?)\\\]/g, (_, m: string) => `$$${m}$$`)
    .replace(/\\\(([\s\S]+?)\\\)/g, (_, m: string) => `$${m}$`);
  return normalised
    .split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/)
    .map((part) => {
      if (part.startsWith('$$') && part.endsWith('$$') && part.length > 4) {
        return renderLatex(part.slice(2, -2), true);
      }
      if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        return renderLatex(part.slice(1, -1), false);
      }
      return escapeHtml(part)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/https?:\/\/[^\s<)]+/g, (url) => {
          const clean = url.replace(/[.,;]+$/, '');
          const tail = url.slice(clean.length);
          return allowedUrls.has(clean.replace(/&#38;/g, '&'))
            ? `<a href="${clean}" rel="noopener">${clean}</a>${tail}`
            : url;
        });
    })
    .join('');
}

/** Paragraphs, bullet and numbered lists, and headings, from the model's plain Markdown. */
export function aiTextToHtml(text: string, allowedUrls: ReadonlySet<string>): string {
  const blocks: string[] = [];
  let list: { tag: 'ul' | 'ol'; items: string[] } | undefined;
  let paragraph: string[] = [];
  const flushParagraph = () => {
    if (paragraph.length) blocks.push(`<p>${inline(paragraph.join(' '), allowedUrls)}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (list) {
      const items = list.items.map((i) => `<li>${inline(i, allowedUrls)}</li>`).join('');
      blocks.push(`<${list.tag}>${items}</${list.tag}>`);
    }
    list = undefined;
  };

  for (const raw of text.replace(/\r\n?/g, '\n').split('\n')) {
    const line = raw.trim();
    const bullet = /^[-*•]\s+(.*)$/.exec(line);
    const numbered = /^\d+[.)]\s+(.*)$/.exec(line);
    const heading = /^#{1,6}\s+(.*)$/.exec(line);
    if (!line) {
      flushParagraph();
      flushList();
    } else if (bullet?.[1] !== undefined || numbered?.[1] !== undefined) {
      flushParagraph();
      const tag = bullet ? 'ul' : 'ol';
      if (list?.tag !== tag) flushList();
      list ??= { tag, items: [] };
      list.items.push((bullet?.[1] ?? numbered?.[1]) as string);
    } else if (heading?.[1] !== undefined) {
      flushParagraph();
      flushList();
      blocks.push(`<p><strong>${inline(heading[1], allowedUrls)}</strong></p>`);
    } else {
      flushList();
      paragraph.push(line);
    }
  }
  flushParagraph();
  flushList();
  return blocks.join('');
}

export function AiAnswer(props: { text: string; allowedUrls?: readonly string[] }) {
  const html = aiTextToHtml(props.text, new Set(props.allowedUrls ?? []));
  return (
    <div
      className="ai-answer prose"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: text escaped and maths rendered by aiTextToHtml; links limited to the topic's own resources
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

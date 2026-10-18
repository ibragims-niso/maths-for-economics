import 'katex/dist/katex.min.css';
import { useState } from 'react';
import { Link } from 'react-router';
import { content } from './content';
import { HtmlBlock } from './HtmlBlock';
import { icon3d, topicsForYear, YEARS } from './topics';

/** Written topics in Core order, with their formulas as plain text for searching. */
const ORDER = new Map(YEARS.flatMap((y) => topicsForYear(y)).map((t, i) => [t.id, i]));
const SHEET = [...content.topics]
  .sort((a, b) => (ORDER.get(a.id) ?? 0) - (ORDER.get(b.id) ?? 0))
  .map((t) => ({
    topic: t,
    search: `${t.id} ${t.title} ${t.tutor.definitions}`.toLowerCase(),
  }));

/** Every topic's "Definition and formulas" on one page, searchable and offline (R16). */
export function FormulasPage() {
  const [query, setQuery] = useState('');
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const shown = SHEET.filter((s) => words.every((w) => s.search.includes(w)));

  return (
    <>
      <div className="practice-hero">
        <img src={icon3d('notebook')} alt="" width="64" height="64" className="topic-icon" />
        <div>
          <h1>Formula sheet</h1>
          <p className="topic-meta">The definitions and formulas of every written topic.</p>
        </div>
      </div>

      <section className="sheet sheet--page" aria-label="Formulas">
        <div className="sheet-handle" aria-hidden="true" />
        <label htmlFor="formula-search" className="sr-only">
          Search formulas
        </label>
        <input
          id="formula-search"
          className="search"
          type="search"
          placeholder="Search, e.g. elasticity or interest"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {shown.length === 0 && <p className="ai-status">No formulas match "{query}".</p>}
        {shown.map(({ topic }) => (
          <article key={topic.id} className="formula">
            <h2>
              <Link to={`/topic/${topic.id}`} viewTransition>
                {topic.title}
              </Link>
            </h2>
            <HtmlBlock className="prose" html={topic.sections.definitions} />
          </article>
        ))}
      </section>
    </>
  );
}

import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { MathText } from '../Maths';
import { icon3d } from '../topics';
import { GLOSSARY } from './glossary';

const ENTRIES = Object.entries(GLOSSARY).sort(([a], [b]) =>
  a.localeCompare(b, 'en', { sensitivity: 'base' }),
);

/** Help → Terms: every economics and maths term the topics use, searchable and offline. */
export function TermsPage() {
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  // Matches in the term itself come first, then matches in a definition.
  const shown = ENTRIES.filter(([term, definition]) =>
    words.every((w) => `${term} ${definition}`.toLowerCase().includes(w)),
  ).sort(
    ([a], [b]) =>
      Number(words.every((w) => b.toLowerCase().includes(w))) -
      Number(words.every((w) => a.toLowerCase().includes(w))),
  );

  return (
    <>
      <div className="practice-hero">
        <img src={icon3d('bulb')} alt="" width="64" height="64" className="topic-icon" />
        <div>
          <h1>Terms</h1>
          <p className="topic-meta">
            {ENTRIES.length} economics and maths terms in plain words. In a topic, tap a coloured
            term to see it.
          </p>
        </div>
      </div>

      <section className="sheet sheet--page" aria-label="Terms">
        <div className="sheet-handle" aria-hidden="true" />
        <label htmlFor="term-search" className="sr-only">
          Search terms
        </label>
        <input
          id="term-search"
          className="search"
          type="search"
          placeholder="Search, e.g. marginal cost"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {shown.length === 0 && <p className="ai-status">No term matches "{query.trim()}".</p>}
        <dl className="terms">
          {shown.map(([term, definition]) => (
            <div key={term} className="symbol">
              <dt className="symbol-name">{term}</dt>
              <dd>
                <MathText text={definition} />
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}

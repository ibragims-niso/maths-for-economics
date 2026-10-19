import type { SymbolGroups } from '@mfe/core';
import { useState } from 'react';
import symbolsJson from './generated/symbols.json';
import { renderLatex } from './Maths';
import { icon3d } from './topics';

// Written by scripts/build-content.ts from content/symbols.yml.
const GROUPS = symbolsJson as SymbolGroups;

function Latex({ latex, display = false }: { latex: string; display?: boolean }) {
  return (
    <span
      className={display ? 'symbol-mark' : 'symbol-example'}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: KaTeX output for the app's own symbol list
      dangerouslySetInnerHTML={{ __html: renderLatex(latex, false) }}
    />
  );
}

/** Help → Symbols: what each maths sign means, searchable and offline (owner's request). */
export function SymbolsPage() {
  const [query, setQuery] = useState('');
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const groups = GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((i) =>
      words.every((w) => `${i.name} ${i.meaning} ${g.group}`.toLowerCase().includes(w)),
    ),
  })).filter((g) => g.items.length > 0);

  return (
    <>
      <div className="practice-hero">
        <img src={icon3d('puzzle')} alt="" width="64" height="64" className="topic-icon" />
        <div>
          <h1>Symbols</h1>
          <p className="topic-meta">What the signs in formulas mean, with a small example each.</p>
        </div>
      </div>

      <section className="sheet sheet--page" aria-label="Symbols">
        <div className="sheet-handle" aria-hidden="true" />
        <label htmlFor="symbol-search" className="sr-only">
          Search symbols
        </label>
        <input
          id="symbol-search"
          className="search"
          type="search"
          placeholder="Search, e.g. sum, derivative, not equal"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {groups.length === 0 && <p className="ai-status">No symbol matches "{query.trim()}".</p>}
        {groups.map((g) => (
          <section key={g.group} className="symbol-group" aria-labelledby={`sym-${g.group}`}>
            <h2 id={`sym-${g.group}`}>{g.group}</h2>
            <dl className="symbols">
              {g.items.map((i) => (
                <div key={i.name} className="symbol">
                  <dt>
                    <Latex latex={i.latex} display />
                    <span className="symbol-name">{i.name}</span>
                  </dt>
                  <dd>
                    {i.meaning}
                    <span className="symbol-example-line">
                      Example: <Latex latex={i.example} />
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </section>
    </>
  );
}

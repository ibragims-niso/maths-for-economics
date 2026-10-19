import { useState } from 'react';
import { bankTopic, searchTopics } from '../topics';

/**
 * Choose several topics by searching (owner's request): chosen topics show as chips that can be
 * removed; typing lists matching topics, and a tap adds or removes one.
 */
export function TopicPicker(props: {
  /** Topics that can be practised. */
  available: readonly string[];
  chosen: readonly string[];
  onToggle: (id: string) => void;
}) {
  const [query, setQuery] = useState('');
  const results = searchTopics(query, props.available).slice(0, 12);

  return (
    <div className="picker">
      <label htmlFor="topic-picker" className="pick-label">
        Topics
      </label>
      {props.chosen.length > 0 && (
        <ul className="chips" aria-label="Chosen topics">
          {props.chosen.map((id) => (
            <li key={id} className="chip">
              <span>{bankTopic(id)?.title ?? id}</span>
              <button
                type="button"
                aria-label={`Remove ${bankTopic(id)?.title ?? id}`}
                onClick={() => props.onToggle(id)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <input
        id="topic-picker"
        className="search"
        type="search"
        placeholder="Search topics to add, e.g. interest"
        value={query}
        aria-controls="topic-picker-results"
        onChange={(e) => setQuery(e.target.value)}
      />
      {query.trim() && (
        <ul id="topic-picker-results" className="picker-results" aria-label="Matching topics">
          {results.length === 0 && (
            <li className="picker-empty">No topic with practice matches "{query.trim()}".</li>
          )}
          {results.map((t) => {
            const on = props.chosen.includes(t.id);
            return (
              <li key={t.id}>
                <button
                  type="button"
                  className="picker-option"
                  aria-pressed={on}
                  onClick={() => props.onToggle(t.id)}
                >
                  <span className="picker-check" aria-hidden="true">
                    {on ? '✓' : '+'}
                  </span>
                  <span className="row-text">
                    <span className="row-title">{t.title}</span>
                    <span className="row-use">{t.economicUse}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

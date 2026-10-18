import { type CompiledExample, generatorById, masteryState } from '@mfe/core';
import 'katex/dist/katex.min.css';
import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import { content, topicById } from './content';
import { HtmlBlock } from './HtmlBlock';
import { BackIcon } from './icons';
import { REPO_URL } from './links';
import { NotFoundPage } from './PlaceholderPages';
import { Segmented } from './Segmented';
import { recordRead, storage, useProgress } from './storage';
import { BLOCK_NAMES, STATUS_LABEL, topicIcon } from './topics';

type Tab = 'learn' | 'examples' | 'practise' | 'real';
const TABS: { value: Tab; label: string }[] = [
  { value: 'learn', label: 'Learn' },
  { value: 'examples', label: 'Examples' },
  { value: 'practise', label: 'Practise' },
  { value: 'real', label: 'Real world' },
];

const DIFFICULTY = { 1: 'Easy', 2: 'Medium', 3: 'Hard' } as const;

/** Marks the topic as read once the end of the Learn tab scrolls into view. */
function ReadMarker({ topicId }: { topicId: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      observer.disconnect();
      recordRead(storage, topicId, Date.now()).catch(() => undefined);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [topicId]);
  return <div ref={ref} aria-hidden="true" />;
}

function Example({ example }: { example: CompiledExample }) {
  const [shown, setShown] = useState<ReadonlySet<number>>(new Set());
  const toggle = (i: number) =>
    setShown((s) => {
      const next = new Set(s);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <article className="example">
      <h3>{example.title}</h3>
      <HtmlBlock className="prose" html={example.statement} />
      <ol className="steps">
        {example.steps.map((step, i) => (
          // Steps never reorder, so their position is a stable key.
          // biome-ignore lint/suspicious/noArrayIndexKey: steps are a fixed list from the content
          <li key={i} className="step">
            <HtmlBlock className="prose step-maths" html={step.html} />
            {step.why && (
              <>
                <button
                  type="button"
                  className="why-button"
                  aria-expanded={shown.has(i)}
                  onClick={() => toggle(i)}
                >
                  Why?
                </button>
                {shown.has(i) && <p className="why">{step.why}</p>}
              </>
            )}
          </li>
        ))}
      </ol>
    </article>
  );
}

export function TopicPage() {
  const { id } = useParams();
  const topic = topicById(id);
  const [tab, setTab] = useState<Tab>('learn');
  const state = masteryState(useProgress()?.get(id ?? ''));
  if (!topic) return <NotFoundPage />;

  const report = `${REPO_URL}/issues/new?title=${encodeURIComponent(`Error in ${topic.id}: ${topic.title}`)}&body=${encodeURIComponent(`Topic: ${topic.id}\nContent version: ${content.version}\n\nWhat is wrong:\n`)}`;

  return (
    <>
      <div className="topic-hero">
        <Link to="/" className="back-link" viewTransition>
          <BackIcon />
          Learn
        </Link>
        <div className="topic-title">
          <img src={topicIcon(topic.id)} alt="" width="64" height="64" className="topic-icon" />
          <div>
            <h1>{topic.title}</h1>
            <p className="topic-meta">
              {BLOCK_NAMES[topic.block]} · Year {topic.coreYear} · about {topic.estMinutes} min
              {state !== 'none' && (
                <span className={`topic-state row-status--${state}`}> · {STATUS_LABEL[state]}</span>
              )}
            </p>
          </div>
        </div>
        <Segmented
          options={TABS}
          value={tab}
          onChange={setTab}
          label="Topic sections"
          controls="topic-panel"
          idPrefix="topic-tab"
        />
      </div>

      <section
        className="sheet sheet--page"
        id="topic-panel"
        role="tabpanel"
        aria-labelledby={`topic-tab-${tab}`}
      >
        <div className="sheet-handle" aria-hidden="true" />

        {tab === 'learn' && (
          <>
            <h2>Why economists need this</h2>
            <HtmlBlock className="prose" html={topic.sections.why} />
            <h2>Intuition</h2>
            <HtmlBlock className="prose" html={topic.sections.intuition} />
            <h2>Definition and formulas</h2>
            <HtmlBlock className="prose" html={topic.sections.definitions} />
            <h2>Try it</h2>
            <HtmlBlock className="prose" html={topic.sections.interactive} />
            <h2>Common mistakes</h2>
            <HtmlBlock className="prose" html={topic.sections.mistakes} />
            <ReadMarker topicId={topic.id} />
          </>
        )}

        {tab === 'examples' &&
          topic.sections.examples.map((example) => (
            <Example key={example.title} example={example} />
          ))}

        {tab === 'practise' && (
          <>
            <h2>Practise</h2>
            <p className="prose">
              Every problem has new numbers, and the answer is checked by code. Mistakes are
              explained, even offline.
            </p>
            <ul className="practice-list">
              {topic.generators.map((g) => {
                const generator = generatorById(g);
                return generator ? (
                  <li key={g}>
                    <span className="practice-level">{DIFFICULTY[generator.difficulty]}</span>
                    <span>{generator.title}</span>
                  </li>
                ) : null;
              })}
            </ul>
            <Link to={`/practice?topic=${topic.id}`} className="button-primary" viewTransition>
              Start practice
            </Link>
          </>
        )}

        {tab === 'real' && (
          <>
            <h2>How economists use it</h2>
            <ul className="prose">
              {topic.economicUses.map((use) => (
                <li key={use}>{use}</li>
              ))}
            </ul>
            <HtmlBlock className="prose" html={topic.sections.realWorld} />
            {topic.resources.length > 0 && (
              <>
                <h2>Read more</h2>
                <ul className="resources">
                  {topic.resources.map((r) => (
                    <li key={r.url}>
                      <a href={r.url}>{r.title}</a>
                      <span className="resource-kind">{r.kind}, needs internet</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}

        <p className="report">
          <a href={report}>Report an error in this topic</a>
        </p>
      </section>
    </>
  );
}

import { MAX_QUESTION_CHARS } from '@mfe/core';
import { useState } from 'react';
import { AiAnswer } from './AiAnswer';
import { type AiAsk, type AiState, useAi } from './client';

const MODE_NOTE: Record<string, string> = {
  ANALOG:
    'This looks like your own exercise, so here is the method on a similar problem with different numbers.',
};

/** The answer area under any AI button: loading, the answer, or a plain error. */
function AiOutput({ state, allowedUrls }: { state: AiState; allowedUrls?: readonly string[] }) {
  if (state.kind === 'idle') return null;
  if (state.kind === 'loading') {
    return (
      <p className="ai-status" role="status">
        Thinking…
      </p>
    );
  }
  if (!state.result.ok) {
    return (
      <p className="ai-status ai-status--error" role="status">
        {state.result.message}
      </p>
    );
  }
  const note = MODE_NOTE[state.result.answer.mode];
  return (
    <div className="ai-box" role="status">
      {note && <p className="ai-note">{note}</p>}
      <AiAnswer text={state.result.answer.text} allowedUrls={allowedUrls} />
      <p className="ai-credit">AI explanation. Numbers and answers come from the app.</p>
    </div>
  );
}

/** A contextual AI button ("Explain more", "Explain this step", …). Hidden during tests. */
export function AiButton(props: {
  label: string;
  request: AiAsk;
  allowedUrls?: readonly string[];
}) {
  const { state, run } = useAi();
  return (
    <div className="ai" data-ai>
      {state.kind === 'idle' && (
        <button type="button" className="ai-button" onClick={() => run(props.request)}>
          <span aria-hidden="true">✦</span> {props.label}
        </button>
      )}
      <AiOutput state={state} allowedUrls={props.allowedUrls} />
    </div>
  );
}

/** Free-text questions about one topic (docs/03): ideas yes, your homework's answer no. */
export function AskBox(props: { topicId: string; allowedUrls?: readonly string[] }) {
  const [question, setQuestion] = useState('');
  const { state, run } = useAi();
  const id = `ask-${props.topicId}`;
  return (
    <section className="ask" data-ai aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`}>Ask about this topic</h2>
      <p className="ask-hint">
        The AI tutor explains ideas and methods. For your own exercise it shows the method on a
        similar problem, so you still solve yours.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (question.trim().length >= 2) {
            run({ mode: 'ASK', topicId: props.topicId, payload: { question: question.trim() } });
          }
        }}
      >
        <label htmlFor={id} className="sr-only">
          Your question
        </label>
        <textarea
          id={id}
          rows={3}
          maxLength={MAX_QUESTION_CHARS}
          value={question}
          placeholder="For example: why is elasticity negative?"
          onChange={(e) => setQuestion(e.target.value)}
        />
        <div className="ask-row">
          <span className="ask-count">
            {question.length} / {MAX_QUESTION_CHARS}
          </span>
          <button
            type="submit"
            className="button-primary"
            disabled={state.kind === 'loading' || question.trim().length < 2}
          >
            Ask
          </button>
        </div>
      </form>
      <AiOutput state={state} allowedUrls={props.allowedUrls} />
    </section>
  );
}

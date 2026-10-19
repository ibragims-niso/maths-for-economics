import { useState } from 'react';
import limits from '../../../../config/limits.json';
import { checkKey } from '../ai/groq';
import { questionsLeftToday } from '../ai/usage';
import { storage } from '../storage';

const CHECK_MESSAGE = {
  works: 'Key works. AI help now uses your own key.',
  invalid: "This key isn't valid. Check you copied all of it.",
  unreachable: 'Groq is not reachable. Check your internet connection.',
} as const;

/** Settings → AI: the shared daily questions, or the student's own free Groq key (docs/10). */
export function OwnKeySettings({ ownKey }: { ownKey: string | undefined }) {
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState<{ tone: 'ok' | 'error'; text: string } | undefined>();
  const [busy, setBusy] = useState(false);
  const left = questionsLeftToday();

  const verify = async () => {
    setBusy(true);
    setStatus(undefined);
    const result = await checkKey(draft);
    setBusy(false);
    setStatus({ tone: result === 'works' ? 'ok' : 'error', text: CHECK_MESSAGE[result] });
    if (result === 'works') {
      await storage.saveSettings({ ownKey: draft.trim() });
      setDraft('');
    }
  };

  const remove = async () => {
    await storage.saveSettings({ ownKey: undefined });
    setStatus({ tone: 'ok', text: 'Key removed. AI help uses the free daily questions again.' });
  };

  return (
    <section className="settings-block" aria-labelledby="ai-heading">
      <h2 id="ai-heading">AI help</h2>
      {ownKey ? (
        <>
          <p className="prose">
            Using your own Groq key (ending in <strong>…{ownKey.slice(-4)}</strong>). It stays on
            this device and is never sent to our servers.
          </p>
          <button type="button" className="button-secondary" onClick={remove}>
            Remove key
          </button>
        </>
      ) : (
        <>
          <p className="prose">
            Everyone gets {limits.aiCallsPerDevicePerDay} free AI questions a day on this device
            {left === undefined ? '' : ` (${left} left today)`}. For more, use your own free key
            from Groq.
          </p>
          <details className="key-guide">
            <summary>Get a free Groq API key (about 2 minutes)</summary>
            <ol>
              <li>
                Open console.groq.com and sign up with your email or Google account. No card is
                needed for the free tier.
              </li>
              <li>
                In the sidebar, open <strong>API Keys</strong> and tap{' '}
                <strong>Create API Key</strong>. Give it any name, for example "Maths for
                Economics".
              </li>
              <li>
                Copy the key. It starts with <code>gsk_</code>. Groq shows it only once, so paste it
                somewhere safe.
              </li>
              <li>
                Paste it below and tap <strong>Verify</strong>.
              </li>
            </ol>
            <p>Good to know:</p>
            <ul>
              <li>
                Free keys have per-minute and per-day limits set by Groq. That is usually enough for
                one student.
              </li>
              <li>
                Never share your key or post it online. If you think it leaked, delete it in the
                Groq console and create a new one.
              </li>
              <li>
                To stop using it, tap <strong>Remove key</strong>. The app goes back to the shared
                daily questions.
              </li>
            </ul>
          </details>
          <form
            className="key-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (draft.trim()) verify();
            }}
          >
            <label htmlFor="own-key">Your Groq key</label>
            <div className="key-row">
              <input
                id="own-key"
                type="password"
                autoComplete="off"
                spellCheck={false}
                placeholder="gsk_…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <button type="submit" className="button-primary" disabled={busy || !draft.trim()}>
                {busy ? 'Checking…' : 'Verify'}
              </button>
            </div>
            <p className="hint">Your key stays on this device. It is never sent to our servers.</p>
          </form>
        </>
      )}
      {status && (
        <p
          className={status.tone === 'ok' ? 'key-status' : 'key-status key-status--error'}
          role="status"
        >
          {status.text}
        </p>
      )}
    </section>
  );
}

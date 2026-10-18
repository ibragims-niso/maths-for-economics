import { useState } from 'react';
import { mentorLink, startSharing, stopSharing } from '../mentor/sharing';
import { storage } from '../storage';

/** Settings → share progress with a parent or tutor (R11): opt-in, off at any time. */
export function ShareSettings({ token }: { token: string | undefined }) {
  const [note, setNote] = useState<string>();
  const [busy, setBusy] = useState(false);
  const link = token ? mentorLink(token) : undefined;

  const turnOn = async () => {
    setBusy(true);
    const sent = await startSharing(storage);
    setBusy(false);
    setNote(sent ? undefined : 'Sharing is on. The first copy goes up when you are back online.');
  };
  const turnOff = async () => {
    setBusy(true);
    await stopSharing(storage);
    setBusy(false);
    setNote('Sharing is off. The shared copy was deleted and the old link no longer works.');
  };
  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setNote('Link copied.');
    } catch {
      setNote('Copy the link above by hand.');
    }
  };

  return (
    <section className="settings-block" aria-labelledby="share-heading">
      <h2 id="share-heading">Share progress with a parent or tutor</h2>
      {link ? (
        <>
          <p className="prose">
            Anyone with this link sees your mastered topics, scores and recent tests, never your
            name or answers. It updates by itself when you are online.
          </p>
          <p className="share-link">{link}</p>
          <div className="results-actions">
            <button type="button" className="button-primary" onClick={copy}>
              Copy link
            </button>
            <button type="button" className="button-secondary" onClick={turnOff} disabled={busy}>
              Turn off
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="prose">
            Make a private, read-only link for a parent, tutor or teacher. It shows progress numbers
            only: no name, no email, nothing you typed. Turning it off deletes the copy.
          </p>
          <button type="button" className="button-primary" onClick={turnOn} disabled={busy}>
            {busy ? 'Turning on…' : 'Turn on sharing'}
          </button>
        </>
      )}
      {note && (
        <p className="key-status" role="status">
          {note}
        </p>
      )}
    </section>
  );
}

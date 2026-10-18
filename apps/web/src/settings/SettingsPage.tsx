import { type Track, trackTopicOrder } from '@mfe/core';
import { storage, useSettings } from '../storage';
import { icon3d } from '../topics';
import { DEFAULT_TRACK_ID, TRACKS } from '../tracks';
import { ImportTrack } from './ImportTrack';
import { OwnKeySettings } from './OwnKey';

/** What arrives next in Settings (docs/07), said plainly. */
const COMING = ['Share progress with a parent or tutor', 'Export or reset your data'];

export function SettingsPage() {
  const settings = useSettings();
  const chosen = settings?.trackId ?? DEFAULT_TRACK_ID;
  const custom = settings?.customTracks ?? [];

  const remove = (track: Track) =>
    storage
      .saveSettings({
        customTracks: custom.filter((t) => t.id !== track.id),
        ...(chosen === track.id ? { trackId: DEFAULT_TRACK_ID } : {}),
      })
      .catch(() => undefined);

  return (
    <>
      <div className="practice-hero">
        <img src={icon3d('setting')} alt="" width="64" height="64" className="topic-icon" />
        <div>
          <h1>Settings</h1>
          <p className="topic-meta">Saved on this device.</p>
        </div>
      </div>

      <section className="sheet sheet--page" aria-labelledby="programme-heading">
        <div className="sheet-handle" aria-hidden="true" />
        <h2 id="programme-heading">Your programme</h2>
        <p className="prose">
          Learn shows topics in your programme's years and courses. Switching keeps all your
          progress, because progress belongs to topics.
        </p>

        <fieldset className="pick">
          <legend className="sr-only">Programme</legend>
          {[...TRACKS, ...custom].map((t) => (
            <div key={t.id} className="programme-item">
              <label className="pick-row programme">
                <input
                  type="radio"
                  name="programme"
                  checked={chosen === t.id}
                  onChange={() => {
                    storage.saveSettings({ trackId: t.id }).catch(() => undefined);
                  }}
                />
                <span className="row-text">
                  <span className="row-title">{t.name}</span>
                  <span className="row-use">
                    {t.years.length} years · {trackTopicOrder(t).length} topics
                    {t.visibility === 'custom'
                      ? ' · imported'
                      : t.status === 'draft-unverified'
                        ? ' · unofficial draft'
                        : ''}
                  </span>
                  {chosen === t.id && t.status === 'draft-unverified' && (
                    <span className="programme-note">{t.disclaimer}</span>
                  )}
                </span>
              </label>
              {t.visibility === 'custom' && (
                <button type="button" className="link-button" onClick={() => remove(t)}>
                  Remove {t.name}
                </button>
              )}
            </div>
          ))}
        </fieldset>

        <ImportTrack customTracks={custom} />

        <OwnKeySettings ownKey={settings?.ownKey} />

        <h2>Coming next</h2>
        <ul className="rows">
          {COMING.map((item) => (
            <li key={item} className="row">
              <span className="row-text">
                <span className="row-title">{item}</span>
              </span>
              <span className="row-status">Soon</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

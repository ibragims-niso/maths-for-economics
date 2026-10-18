import { checkTrack, type TopicBankEntry, type Track, trackSchema, zodIssues } from '@mfe/core';
import { useState } from 'react';
import topicBank from '../../../../content/topic-bank.json';
import { storage } from '../storage';
import { TRACKS } from '../tracks';

type Outcome = { tone: 'ok' | 'error'; lines: string[] };

const BANK_IDS = new Set(topicBank.map((t) => t.id));

/** Every topic ID a programme file lists, whatever else is wrong with it. */
function topicIdsIn(data: unknown): string[] {
  const years = (data as { years?: unknown })?.years;
  if (!Array.isArray(years)) return [];
  const lists = years.flatMap((y: { courses?: unknown }) =>
    (Array.isArray(y?.courses) ? y.courses : []).flatMap(
      (c: { topics?: unknown; supporting?: unknown; sections?: unknown }) => [
        c?.topics,
        c?.supporting,
        ...(Array.isArray(c?.sections)
          ? c.sections.map((s: { topics?: unknown }) => s?.topics)
          : []),
      ],
    ),
  );
  return lists.flatMap((l) => (Array.isArray(l) ? l.filter((x) => typeof x === 'string') : []));
}

/**
 * Reads a programme from a .track.json file (docs/06 "Custom tracks", R13). It is checked the
 * same way as the public tracks; unknown topic IDs are named. It stays on this device.
 */
export async function importTrack(text: string, existing: readonly Track[]): Promise<Outcome> {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { tone: 'error', lines: ['This file is not a programme file (it is not valid JSON).'] };
  }
  // Name unknown topic IDs first: the most common mistake, and the clearest message.
  const unknown = topicIdsIn(data).filter((id) => !BANK_IDS.has(id));
  if (unknown.length > 0) {
    return {
      tone: 'error',
      lines: [`These topic IDs are not in the topic bank: ${[...new Set(unknown)].join(', ')}.`],
    };
  }
  const parsed = trackSchema.safeParse(data);
  if (!parsed.success) {
    const issues = zodIssues('file', parsed.error).slice(0, 5);
    return {
      tone: 'error',
      lines: ['This file does not follow the programme format:', ...issues.map((i) => i.message)],
    };
  }
  const track: Track = { ...parsed.data, visibility: 'custom' };
  if (TRACKS.some((t) => t.id === track.id)) {
    return {
      tone: 'error',
      lines: [`The ID "${track.id}" belongs to a built-in programme. Give your file another "id".`],
    };
  }
  const errors = checkTrack(track, topicBank as TopicBankEntry[], track.id).filter(
    (i) => i.level === 'error',
  );
  if (errors.length > 0) {
    return {
      tone: 'error',
      lines: [
        'Some topic IDs are not in the topic bank:',
        ...errors.slice(0, 8).map((i) => i.message),
      ],
    };
  }
  await storage.saveSettings({
    customTracks: [...existing.filter((t) => t.id !== track.id), track],
    trackId: track.id,
  });
  return { tone: 'ok', lines: [`Imported "${track.name}" and chose it as your programme.`] };
}

export function ImportTrack({ customTracks }: { customTracks: readonly Track[] }) {
  const [outcome, setOutcome] = useState<Outcome>();

  return (
    <section className="settings-block" aria-labelledby="import-heading">
      <h2 id="import-heading">Import your own programme</h2>
      <p className="prose">
        Have your university's programme as a <code>.track.json</code> file? Import it here. It
        stays on this device and is never uploaded.
      </p>
      <label className="button-secondary file-button">
        Choose a file
        <input
          type="file"
          accept=".json,application/json"
          className="sr-only"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (file) setOutcome(await importTrack(await file.text(), customTracks));
          }}
        />
      </label>
      {outcome && (
        <div
          className={outcome.tone === 'ok' ? 'key-status' : 'key-status key-status--error'}
          role="status"
        >
          {outcome.lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      )}
    </section>
  );
}

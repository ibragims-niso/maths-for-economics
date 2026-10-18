import { describe, expect, it } from 'vitest';
import { storage } from '../storage';
import { importTrack } from './ImportTrack';

const track = (topics: string[], id = 'my-uni') =>
  JSON.stringify({
    id,
    name: 'My university',
    visibility: 'custom',
    status: 'draft-unverified',
    verifiedAt: null,
    disclaimer: 'My own programme.',
    sources: [],
    years: [
      { year: 1, label: 'Year 1', courses: [{ code: null, name: 'Maths 1', semester: 1, topics }] },
    ],
  });

describe('importing a programme (R13)', () => {
  it('saves a valid programme on the device and chooses it', async () => {
    const result = await importTrack(track(['F01', 'C107']), []);
    expect(result.tone).toBe('ok');
    const settings = await storage.getSettings();
    expect(settings.trackId).toBe('my-uni');
    expect(settings.customTracks?.[0]?.name).toBe('My university');
  });

  it('names unknown topic IDs', async () => {
    const result = await importTrack(track(['F01', 'X999', 'F77']), []);
    expect(result.tone).toBe('error');
    expect(result.lines.join(' ')).toContain('X999, F77');
  });

  it('refuses files that are not programmes, and built-in IDs', async () => {
    expect((await importTrack('not json', [])).tone).toBe('error');
    expect((await importTrack('{"id": "x"}', [])).tone).toBe('error');
    expect((await importTrack(track(['F01'], 'core'), [])).lines[0]).toContain('built-in');
  });
});

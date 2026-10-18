import { describe, expect, it } from 'vitest';
import { type TopicBankEntry, type Track, trackSchema } from './schemas';
import { checkTrack, trackMentions, trackTopicOrder } from './track';

const bank: TopicBankEntry[] = [
  { id: 'F01', title: 'A', coreYear: 1, prerequisites: [], economicUse: 'x' },
  { id: 'F02', title: 'B', coreYear: 1, prerequisites: ['F01'], economicUse: 'x' },
];

const track = (topics: string[], extra: Partial<Track> = {}): Track => ({
  id: 'test',
  name: 'Test',
  visibility: 'custom',
  status: 'draft-unverified',
  verifiedAt: null,
  disclaimer: 'Unofficial.',
  sources: [],
  years: [{ year: 1, label: 'Year 1', courses: [{ code: null, name: 'C', semester: 1, topics }] }],
  ...extra,
});

describe('checkTrack', () => {
  it('accepts topics in prerequisite order', () => {
    expect(checkTrack(track(['F01', 'F02']), bank, 't')).toEqual([]);
  });

  it('reports unknown topic IDs as errors', () => {
    const issues = checkTrack(track(['F01', 'F09']), bank, 't');
    expect(issues).toEqual([
      { level: 'error', where: 't', message: 'year 1, C: unknown topic ID F09' },
    ]);
  });

  it('only warns when a topic comes before its prerequisite', () => {
    const issues = checkTrack(track(['F02', 'F01']), bank, 't');
    expect(issues).toEqual([
      { level: 'warning', where: 't', message: 'F02 comes before its prerequisite F01' },
    ]);
  });

  it('lists each topic once in study order', () => {
    expect(trackTopicOrder(track(['F02', 'F01', 'F02']))).toEqual(['F02', 'F01']);
  });
});

describe('trackSchema', () => {
  it('requires a date on verified tracks', () => {
    const result = trackSchema.safeParse(track(['F01'], { status: 'verified', verifiedAt: null }));
    expect(result.success).toBe(false);
  });

  it('accepts a verified track with a date', () => {
    const result = trackSchema.safeParse(
      track(['F01'], { status: 'verified', verifiedAt: '2026-10-18' }),
    );
    expect(result.success).toBe(true);
  });
});

describe('courses with sections and supporting topics', () => {
  const sectioned = track([], {
    years: [
      {
        year: 1,
        label: 'Year 1',
        courses: [
          {
            code: 'İF-04',
            name: 'Linear algebra and analysis',
            semester: 'autumn',
            credits: 8,
            sections: [
              { title: 'First', topics: ['F01', 'F02'] },
              { title: 'Again', topics: ['F02'] },
            ],
            supporting: ['F09'],
          },
        ],
      },
    ],
  });

  it('counts section topics once and keeps supporting topics apart', () => {
    expect(trackTopicOrder(sectioned)).toEqual(['F01', 'F02']);
    expect([...trackMentions(sectioned)]).toEqual(['F01', 'F02', 'F09']);
  });

  it('allows a topic in several sections but still checks every ID', () => {
    expect(checkTrack(sectioned, bank, 't')).toEqual([
      { level: 'error', where: 't', message: 'year 1, İF-04, supporting: unknown topic ID F09' },
    ]);
  });

  it('needs topics or sections', () => {
    const empty = track([], {
      years: [{ year: 1, label: 'Y', courses: [{ code: null, name: 'C', semester: null }] }],
    });
    expect(trackSchema.safeParse(empty).success).toBe(false);
    expect(trackSchema.safeParse(sectioned).success).toBe(true);
  });
});

import { courseTopics, type Track } from '@mfe/core';
import { useSettings } from './storage';
import { bankTopic, groupByBlock, topicIcon } from './topics';

// Public tracks are bundled with the app, so choosing one works offline.
const files = import.meta.glob<Track>('../../../content/tracks/*.track.json', {
  eager: true,
  import: 'default',
});

/** Order in the programme list: Core first, then the national programme, then the rest. */
const ORDER = ['core', 'az-050405', 'lse', 'cambridge', 'mit'];
const rank = (id: string) => (ORDER.includes(id) ? ORDER.indexOf(id) : ORDER.length);

export const TRACKS: Track[] = Object.values(files).sort((a, b) => rank(a.id) - rank(b.id));

export const DEFAULT_TRACK_ID = 'core';

export function trackById(id: string | undefined): Track {
  const track = TRACKS.find((t) => t.id === id) ?? TRACKS.find((t) => t.id === DEFAULT_TRACK_ID);
  if (!track) throw new Error('The Core track is missing from content/tracks');
  return track;
}

/** The student's chosen programme; Core until they choose (or while settings load). */
export const useTrack = () => trackById(useSettings()?.trackId);

/** A block of rows on Learn: a curriculum block (Core) or a course (other tracks). */
export interface LearnGroup {
  key: string;
  name: string;
  icon: string;
  /** Topics that count towards completion. */
  count: number;
  /** Rows, optionally under headings: a course's sections, then its background topics. */
  parts: { heading?: string; topicIds: string[] }[];
}

export function learnGroups(track: Track, year: number): LearnGroup[] {
  const courses = track.years.find((y) => y.year === year)?.courses ?? [];
  if (track.id === DEFAULT_TRACK_ID) {
    const topics = yearTopics(track, year).flatMap((id) => bankTopic(id) ?? []);
    return groupByBlock(topics).map((g) => ({
      key: g.block,
      name: g.name,
      icon: g.icon,
      count: g.topics.length,
      parts: [{ topicIds: g.topics.map((t) => t.id) }],
    }));
  }
  return courses.map((course, i) => ({
    key: `${year}-${i}`,
    name: course.code ? `${course.code} ${course.name}` : course.name,
    icon: topicIcon(courseTopics(course)[0] ?? course.supporting?.[0] ?? ''),
    count: courseTopics(course).length,
    parts: [
      ...(course.topics ? [{ topicIds: course.topics }] : []),
      ...(course.sections ?? []).map((s) => ({ heading: s.title, topicIds: s.topics })),
      ...(course.supporting
        ? [{ heading: 'Background (not counted)', topicIds: course.supporting }]
        : []),
    ],
  }));
}

/** Topics a track year counts for completion, each once, in course order. */
export function yearTopics(track: Track, year: number): string[] {
  const courses = track.years.find((y) => y.year === year)?.courses ?? [];
  return [...new Set(courses.flatMap(courseTopics))];
}

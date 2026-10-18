import { type Course, courseTopics, type Track } from '@mfe/core';
import { useSettings } from './storage';
import { bankTopic, groupByBlock, topicIcon } from './topics';

// Public tracks are bundled with the app, so choosing one works offline.
const files = import.meta.glob<Track>('../../../content/tracks/*.track.json', {
  eager: true,
  import: 'default',
});

/** Order in the programme list: the Azerbaijan programme first (it covers BBU, D38), then Core. */
const ORDER = ['az-050405', 'core', 'lse', 'cambridge', 'mit'];
const rank = (id: string) => (ORDER.includes(id) ? ORDER.indexOf(id) : ORDER.length);

export const TRACKS: Track[] = Object.values(files).sort((a, b) => rank(a.id) - rank(b.id));

export const DEFAULT_TRACK_ID = 'core';

/** A public or imported programme by ID; Core when the ID is unknown (e.g. a removed import). */
export function trackById(id: string | undefined, custom: readonly Track[] = []): Track {
  const track =
    [...custom, ...TRACKS].find((t) => t.id === id) ??
    TRACKS.find((t) => t.id === DEFAULT_TRACK_ID);
  if (!track) throw new Error('The Core track is missing from content/tracks');
  return track;
}

/** The student's chosen programme; Core until they choose (or while settings load). */
export const useTrack = () => {
  const settings = useSettings();
  return trackById(settings?.trackId, settings?.customTracks);
};

/**
 * A block of rows on Learn, with an icon: a curriculum block (Core), a course, or one of a
 * course's sections (the owner's request: sections are the topics' groups, like Core's blocks).
 */
export interface LearnGroup {
  key: string;
  name: string;
  icon: string;
  topicIds: string[];
  /** Background topics: shown, not counted towards completion. */
  background?: boolean;
  /** Set on a course's first group when its groups are sections: the course name above them. */
  course?: string;
}

const courseLabel = (course: Course) => {
  const name = course.code ? `${course.code} ${course.name}` : course.name;
  return course.credits ? `${name} · ${course.credits} credits` : name;
};

function courseGroups(course: Course, key: string): LearnGroup[] {
  const sections = course.sections ?? [];
  const group = (name: string, topicIds: string[], background = false): LearnGroup => ({
    key: `${key}-${name}`,
    name,
    icon: topicIcon(topicIds[0] ?? ''),
    topicIds,
    background,
  });
  const groups = [
    ...(course.topics
      ? [group(sections.length ? course.name : courseLabel(course), course.topics)]
      : []),
    ...sections.map((s) => group(s.title, s.topics)),
  ];
  if (course.supporting) {
    groups.push(group(groups.length ? 'Background' : courseLabel(course), course.supporting, true));
  }
  const first = groups[0];
  if (sections.length && first) first.course = courseLabel(course);
  return groups;
}

export function learnGroups(track: Track, year: number): LearnGroup[] {
  const courses = track.years.find((y) => y.year === year)?.courses ?? [];
  if (track.id === DEFAULT_TRACK_ID) {
    const topics = yearTopics(track, year).flatMap((id) => bankTopic(id) ?? []);
    return groupByBlock(topics).map((g) => ({
      key: g.block,
      name: g.name,
      icon: g.icon,
      topicIds: g.topics.map((t) => t.id),
    }));
  }
  return courses.flatMap((course, i) => courseGroups(course, `${year}-${i}`));
}

/** Topics a track year counts for completion, each once, in course order. */
export function yearTopics(track: Track, year: number): string[] {
  const courses = track.years.find((y) => y.year === year)?.courses ?? [];
  return [...new Set(courses.flatMap(courseTopics))];
}

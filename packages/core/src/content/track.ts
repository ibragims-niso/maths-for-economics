import { error, type Issue, warning } from './issues';
import type { Course, TopicBankEntry, Track } from './schemas';

/** The topics a course counts for completion: its `topics`, then its sections' topics. */
export function courseTopics(course: Course): string[] {
  return [
    ...new Set([...(course.topics ?? []), ...(course.sections ?? []).flatMap((s) => s.topics)]),
  ];
}

/** Topic IDs of a track in study order, each listed once (first appearance wins). */
export function trackTopicOrder(track: Track): string[] {
  const seen = new Set<string>();
  for (const year of track.years) {
    for (const course of year.courses) {
      for (const id of courseTopics(course)) seen.add(id);
    }
  }
  return [...seen];
}

/** Every topic a track mentions, counted or supporting. */
export function trackMentions(track: Track): Set<string> {
  const ids = new Set(trackTopicOrder(track));
  for (const year of track.years) {
    for (const course of year.courses) {
      for (const id of course.supporting ?? []) ids.add(id);
    }
  }
  return ids;
}

/**
 * Checks a track against the topic bank (docs/06-tracks.md): every topic ID must exist;
 * a topic listed twice in the same list, or before one of its prerequisites, is only a warning.
 * A topic may appear in several sections or courses.
 */
export function checkTrack(track: Track, bank: readonly TopicBankEntry[], where: string): Issue[] {
  const issues: Issue[] = [];
  const byId = new Map(bank.map((t) => [t.id, t]));

  for (const year of track.years) {
    for (const course of year.courses) {
      const label = `year ${year.year}, ${course.code ?? course.name}`;
      const lists = [
        { name: label, ids: course.topics ?? [] },
        ...(course.sections ?? []).map((s) => ({ name: `${label}, "${s.title}"`, ids: s.topics })),
        { name: `${label}, supporting`, ids: course.supporting ?? [] },
      ];
      for (const list of lists) {
        const seen = new Set<string>();
        for (const id of list.ids) {
          if (!byId.has(id)) issues.push(error(where, `${list.name}: unknown topic ID ${id}`));
          if (seen.has(id)) issues.push(warning(where, `${list.name}: ${id} is listed twice`));
          seen.add(id);
        }
      }
    }
  }

  const position = new Map(trackTopicOrder(track).map((id, i) => [id, i]));
  for (const [id, pos] of position) {
    for (const p of byId.get(id)?.prerequisites ?? []) {
      const prePos = position.get(p);
      if (prePos !== undefined && prePos > pos) {
        issues.push(warning(where, `${id} comes before its prerequisite ${p}`));
      }
    }
  }

  return issues;
}

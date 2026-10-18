import { error, type Issue, warning } from './issues';
import type { TopicBankEntry, Track } from './schemas';

/** Topic IDs of a track in study order, each listed once (first appearance wins). */
export function trackTopicOrder(track: Track): string[] {
  const seen = new Set<string>();
  for (const year of track.years) {
    for (const course of year.courses) {
      for (const id of course.topics) seen.add(id);
    }
  }
  return [...seen];
}

/**
 * Checks a track against the topic bank (docs/06-tracks.md): every topic ID must exist;
 * a topic listed before one of its prerequisites is only a warning.
 */
export function checkTrack(track: Track, bank: readonly TopicBankEntry[], where: string): Issue[] {
  const issues: Issue[] = [];
  const byId = new Map(bank.map((t) => [t.id, t]));

  for (const year of track.years) {
    for (const course of year.courses) {
      const label = `year ${year.year}, ${course.code ?? course.name}`;
      const inCourse = new Set<string>();
      for (const id of course.topics) {
        if (!byId.has(id)) issues.push(error(where, `${label}: unknown topic ID ${id}`));
        if (inCourse.has(id)) issues.push(warning(where, `${label}: ${id} is listed twice`));
        inCourse.add(id);
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

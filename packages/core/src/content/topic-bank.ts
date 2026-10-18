import { parse as parseYaml } from 'yaml';
import { error, type Issue, warning, zodIssues } from './issues';
import { glossarySchema, type TopicBankEntry } from './schemas';

interface Node {
  id: string;
  prerequisites: readonly string[];
}

/**
 * Returns one prerequisite cycle as a path (e.g. ["A", "B", "A"]), or null if there is none.
 * Prerequisites that are not in the list are ignored here; checkTopicBank reports them.
 */
export function findCycle(topics: readonly Node[]): string[] | null {
  const byId = new Map(topics.map((t) => [t.id, t]));
  const state = new Map<string, 'visiting' | 'done'>();
  const path: string[] = [];

  const visit = (id: string): string[] | null => {
    const s = state.get(id);
    if (s === 'done') return null;
    if (s === 'visiting') return [...path.slice(path.indexOf(id)), id];
    const topic = byId.get(id);
    if (!topic) return null;
    state.set(id, 'visiting');
    path.push(id);
    for (const p of topic.prerequisites) {
      const cycle = visit(p);
      if (cycle) return cycle;
    }
    path.pop();
    state.set(id, 'done');
    return null;
  };

  for (const t of topics) {
    const cycle = visit(t.id);
    if (cycle) return cycle;
  }
  return null;
}

/** Checks IDs are unique, prerequisites exist and the prerequisite graph has no cycles. */
export function checkTopicBank(bank: readonly TopicBankEntry[], where: string): Issue[] {
  const issues: Issue[] = [];
  const byId = new Map<string, TopicBankEntry>();

  for (const t of bank) {
    if (byId.has(t.id)) issues.push(error(where, `Duplicate topic ID ${t.id}`));
    byId.set(t.id, t);
  }

  for (const t of bank) {
    for (const p of t.prerequisites) {
      const pre = byId.get(p);
      if (!pre) {
        issues.push(error(where, `${t.id} has unknown prerequisite ${p}`));
      } else if (pre.coreYear > t.coreYear) {
        issues.push(
          warning(
            where,
            `${t.id} (year ${t.coreYear}) needs ${p}, which is in year ${pre.coreYear}`,
          ),
        );
      }
    }
  }

  const cycle = findCycle(bank);
  if (cycle) issues.push(error(where, `Prerequisite cycle: ${cycle.join(' → ')}`));

  return issues;
}

/** Checks content/glossary.yml: a flat map of term → short definition. */
export function checkGlossary(source: string, where: string): Issue[] {
  let data: unknown;
  try {
    data = parseYaml(source);
  } catch (e) {
    return [error(where, `Not valid YAML: ${e instanceof Error ? e.message : String(e)}`)];
  }
  const parsed = glossarySchema.safeParse(data);
  return parsed.success ? [] : zodIssues(where, parsed.error);
}

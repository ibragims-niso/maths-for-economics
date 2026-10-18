import { error, type Issue, type TopicBankEntry } from '@mfe/core';

/**
 * Reads the topic tables in docs/05-topic-bank.md. The year of each topic comes from the
 * "## Year N" heading above its table.
 */
export function parseTopicBankDoc(markdown: string): TopicBankEntry[] {
  const entries: TopicBankEntry[] = [];
  let coreYear = 0;
  for (const line of markdown.replace(/\r\n?/g, '\n').split('\n')) {
    const year = /^## Year (\d)\s*$/.exec(line);
    if (year?.[1]) coreYear = Number(year[1]);
    const row = /^\|\s*([A-Z]+\d+)\s*\|([^|]+)\|([^|]+)\|([^|]+)\|\s*$/.exec(line);
    if (!row?.[1] || !row[2] || !row[3] || !row[4]) continue;
    const pre = row[3].trim();
    entries.push({
      id: row[1],
      // A trailing † marks a topic added for the Azerbaijan national track (docs/05 intro).
      title: row[2].replace(/\s*†\s*$/, '').trim(),
      coreYear,
      prerequisites: pre === '—' || pre === '-' ? [] : pre.split(',').map((p) => p.trim()),
      economicUse: row[4].trim(),
    });
  }
  return entries;
}

/** The JSON topic bank must say exactly what the human-readable table in docs/05 says. */
export function compareWithDoc(
  json: readonly TopicBankEntry[],
  doc: readonly TopicBankEntry[],
  where: string,
): Issue[] {
  const issues: Issue[] = [];
  const docById = new Map(doc.map((t) => [t.id, t]));
  const jsonIds = new Set(json.map((t) => t.id));

  for (const t of json) {
    const d = docById.get(t.id);
    if (!d) {
      issues.push(error(where, `${t.id} is in the JSON but not in docs/05-topic-bank.md`));
      continue;
    }
    for (const key of ['title', 'coreYear', 'prerequisites', 'economicUse'] as const) {
      if (JSON.stringify(t[key]) !== JSON.stringify(d[key])) {
        issues.push(
          error(
            where,
            `${t.id} ${key} is ${JSON.stringify(t[key])} in the JSON but ${JSON.stringify(d[key])} in docs/05-topic-bank.md`,
          ),
        );
      }
    }
  }
  for (const d of doc) {
    if (!jsonIds.has(d.id)) {
      issues.push(error(where, `${d.id} is in docs/05-topic-bank.md but not in the JSON`));
    }
  }
  return issues;
}

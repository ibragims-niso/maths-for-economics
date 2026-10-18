/**
 * npm run build:bank
 *
 * Regenerates content/topic-bank.json and content/tracks/core.track.json from the tables in
 * docs/05-topic-bank.md, which is the source of truth (decision D20). Core lists every topic
 * in docs/05 order, one course per year.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { repoRoot } from './lib/report';
import { parseTopicBankDoc } from './lib/topic-bank-doc';

const docPath = join(repoRoot, 'docs/05-topic-bank.md');
const doc = readFileSync(docPath, 'utf8');
// Rows whose title ends in † were added for the Azerbaijan national track (docs/05 intro).
const added = new Set([...doc.matchAll(/^\|\s*([A-Z]+\d+)\s*\|[^|]*†\s*\|/gm)].map((m) => m[1]));
const bank = parseTopicBankDoc(doc).map((t) =>
  added.has(t.id) ? { ...t, addedFor: 'az-050405' } : t,
);

const write = (path: string, data: unknown) =>
  writeFileSync(join(repoRoot, path), `${JSON.stringify(data, null, 2)}\n`);

write('content/topic-bank.json', bank);

const trackPath = 'content/tracks/core.track.json';
const core = JSON.parse(readFileSync(join(repoRoot, trackPath), 'utf8'));
core.years = [1, 2, 3, 4].map((year) => ({
  year,
  label: `Year ${year}`,
  courses: [
    {
      code: null,
      name: `Core Year ${year}`,
      semester: null,
      topics: bank.filter((t) => t.coreYear === year).map((t) => t.id),
    },
  ],
}));
write(trackPath, core);

console.log(`Wrote ${bank.length} topics (${added.size} marked †) and the Core track.`);

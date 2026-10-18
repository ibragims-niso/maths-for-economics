/**
 * npm run validate:content
 *
 * Checks everything under content/: the topic bank (schema, unique IDs, no prerequisite
 * cycles, same as docs/05), the glossary, every public track and every topic file,
 * including running all verify blocks. Exits with code 1 if anything is wrong.
 */
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  checkGlossary,
  checkTopicBank,
  checkTopicFile,
  checkTrack,
  error,
  type Issue,
  type TopicBankEntry,
  topicBankSchema,
  trackMentions,
  trackSchema,
  trackTopicOrder,
  warning,
  zodIssues,
} from '@mfe/core';
import { printReport, readJson, readText, rel, repoRoot } from './lib/report';
import { compareWithDoc, parseTopicBankDoc } from './lib/topic-bank-doc';

const contentDir = join(repoRoot, 'content');
const checks: { label: string; issues: Issue[] }[] = [];

// Topic bank
const bankPath = join(contentDir, 'topic-bank.json');
const bankFile = readJson(bankPath);
const bankParsed = topicBankSchema.safeParse(bankFile.data);
let bank: TopicBankEntry[] = [];
if (bankParsed.success) {
  bank = bankParsed.data;
  const docPath = join(repoRoot, 'docs/05-topic-bank.md');
  checks.push({
    label: `Topic bank: ${bank.length} topics, unique IDs, prerequisites exist, no cycles`,
    issues: checkTopicBank(bank, rel(bankPath)),
  });
  checks.push({
    label: 'Topic bank matches docs/05-topic-bank.md',
    issues: compareWithDoc(bank, parseTopicBankDoc(readText(docPath)), rel(bankPath)),
  });
} else {
  checks.push({
    label: 'Topic bank',
    issues:
      bankFile.issues.length > 0 ? bankFile.issues : zodIssues(rel(bankPath), bankParsed.error),
  });
}

// Glossary
const glossaryPath = join(contentDir, 'glossary.yml');
checks.push({
  label: 'Glossary',
  issues: checkGlossary(readText(glossaryPath), rel(glossaryPath)),
});

// Public tracks
const tracksDir = join(contentDir, 'tracks');
for (const name of readdirSync(tracksDir).filter((f) => f.endsWith('.track.json'))) {
  const path = join(tracksDir, name);
  const file = readJson(path);
  const parsed = trackSchema.safeParse(file.data);
  if (!parsed.success) {
    const issues = file.issues.length > 0 ? file.issues : zodIssues(rel(path), parsed.error);
    checks.push({ label: `Track ${name}`, issues });
    continue;
  }
  const track = parsed.data;
  const issues = checkTrack(track, bank, rel(path));
  if (track.visibility !== 'public') {
    issues.push(
      error(rel(path), 'Tracks in content/tracks must be public; keep custom ones in local/'),
    );
  }
  // Public tracks place every bank topic somewhere, so no topic is unreachable from a track.
  const mentioned = track.id === 'core' ? new Set(trackTopicOrder(track)) : trackMentions(track);
  const missing = bank.filter((t) => !mentioned.has(t.id)).map((t) => t.id);
  if (missing.length > 0) {
    const report = track.id === 'core' ? error : warning;
    issues.push(report(rel(path), `Track is missing topics: ${missing.join(', ')}`));
  }
  checks.push({ label: `Track ${track.id}: ${trackTopicOrder(track).length} topics`, issues });
}

// Topic files
const topicsDir = join(contentDir, 'topics');
const topicFiles = readdirSync(topicsDir).filter((f) => f.endsWith('.md'));
for (const name of topicFiles) {
  const path = join(topicsDir, name);
  checks.push({ label: `Topic ${name}`, issues: checkTopicFile(rel(path), readText(path), bank) });
}

process.exitCode = printReport(checks);

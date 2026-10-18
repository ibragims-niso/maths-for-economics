/**
 * npm run validate:track <file>
 *
 * Checks one track file, typically a private one in local/tracks/, against the topic bank.
 * Example: npm run validate:track local/tracks/bbu.track.json
 */
import { resolve } from 'node:path';
import { checkTrack, topicBankSchema, trackSchema, trackTopicOrder, zodIssues } from '@mfe/core';
import { printReport, readJson, rel, repoRoot } from './lib/report';

const arg = process.argv[2];
if (!arg) {
  console.log('Usage: npm run validate:track <path/to/file.track.json>');
  process.exit(1);
}

const bank = topicBankSchema.parse(readJson(resolve(repoRoot, 'content/topic-bank.json')).data);
// npm runs scripts from the repo root; INIT_CWD is the folder the command was typed in.
const path = resolve(process.env.INIT_CWD ?? process.cwd(), arg);
const file = readJson(path);
const parsed = trackSchema.safeParse(file.data);

process.exitCode = printReport([
  parsed.success
    ? {
        label: `Track ${parsed.data.id}: ${trackTopicOrder(parsed.data).length} topics`,
        issues: checkTrack(parsed.data, bank, rel(path)),
      }
    : {
        label: `Track ${arg}`,
        issues: file.issues.length > 0 ? file.issues : zodIssues(rel(path), parsed.error),
      },
]);

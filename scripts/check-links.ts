/**
 * npm run check:links
 *
 * Opens every resource link in the topic files and every source link in the public tracks
 * (docs/01 R14) and lists the ones that no longer work. Runs weekly in CI (.github/workflows/
 * links.yml). Needs the internet; not part of npm test.
 */
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parseTopicFile, topicFrontmatterSchema, trackSchema } from '@mfe/core';
import { readJson, readText, rel, repoRoot } from './lib/report';

const links = new Map<string, string[]>();
const add = (url: string, where: string) => links.set(url, [...(links.get(url) ?? []), where]);

const topicsDir = join(repoRoot, 'content/topics');
for (const name of readdirSync(topicsDir).filter((f) => f.endsWith('.md'))) {
  const path = join(topicsDir, name);
  const fm = topicFrontmatterSchema.safeParse(
    parseTopicFile(readText(path), path).outline?.frontmatter,
  );
  for (const r of fm.success ? fm.data.resources : []) add(r.url, rel(path));
}
const tracksDir = join(repoRoot, 'content/tracks');
for (const name of readdirSync(tracksDir).filter((f) => f.endsWith('.track.json'))) {
  const path = join(tracksDir, name);
  const track = trackSchema.safeParse(readJson(path).data);
  for (const s of track.success ? track.data.sources : []) add(s.url, rel(path));
}

/** Some sites refuse HEAD or bots; a browser-like GET is the fair test. */
async function works(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: { 'user-agent': 'Mozilla/5.0 (link check; maths-for-economics)' },
      signal: AbortSignal.timeout(30_000),
    });
    await res.body?.cancel();
    if (!res.ok) return `HTTP ${res.status}`;
    // A redirect to a site's home page usually means the page is gone.
    if (new URL(res.url).pathname === '/' && new URL(url).pathname !== '/') {
      return `redirected to the home page ${res.url}`;
    }
    return undefined;
  } catch (error) {
    return error instanceof Error ? error.name : 'failed';
  }
}

let broken = 0;
for (const [url, where] of links) {
  const problem = await works(url);
  if (problem) broken++;
  console.log(
    `${problem ? 'BROKEN' : 'OK    '} ${url}${problem ? `\n       ${problem}; used in ${where.join(', ')}` : ''}`,
  );
}
console.log(`\n${links.size} links checked, ${broken} broken.`);
process.exitCode = broken > 0 ? 1 : 0;

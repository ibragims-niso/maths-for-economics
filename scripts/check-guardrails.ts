/**
 * npm run check:guardrails [base URL]
 *
 * Sends the 20 sample questions in apps/proxy/test/guardrail-prompts.json to a running API and
 * checks the Phase 1 rule: a student's own exercise never gets its own numeric answer, only the
 * method and an analog (docs/03, docs/08). It uses real AI calls (about 40) on the shared key.
 * Default URL: the live site.
 */
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { readJson, repoRoot } from './lib/report';

interface Sample {
  topicId: string;
  question: string;
  expect: string;
  forbidden: string[];
}

const base = process.argv[2] ?? 'https://maths-for-economics.ibragim-n.workers.dev';
const { prompts } = readJson(join(repoRoot, 'apps/proxy/test/guardrail-prompts.json')).data as {
  prompts: Sample[];
};
const deviceId = randomUUID();

let leaks = 0;
let routing = 0;
let errors = 0;
for (const [i, p] of prompts.entries()) {
  const res = await fetch(`${base}/api/ai`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      mode: 'ASK',
      topicId: p.topicId,
      contentVersion: 'guardrail-check',
      deviceId,
      payload: { question: p.question },
    }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    mode?: string;
    text?: string;
    error?: string;
  };
  const label = `${String(i + 1).padStart(2)}. ${p.topicId} ${p.question.slice(0, 60)}`;
  if (!res.ok || !data.text) {
    errors++;
    console.log(`ERROR ${label}\n      ${res.status} ${data.error ?? ''}`);
    continue;
  }
  // Whole numbers only: "80" must not match inside the analog's "800".
  const leaked = p.forbidden.filter((f) => {
    const escaped = f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(?<![\\d.,])${escaped}(?![\\d]|[.,]\\d)`).test(data.text ?? '');
  });
  if (leaked.length) leaks++;
  if (data.mode !== p.expect) routing++;
  const verdict = leaked.length ? 'LEAK ' : data.mode === p.expect ? 'OK   ' : 'ROUTE';
  console.log(`${verdict} ${label}\n      mode ${data.mode} (expected ${p.expect})`);
  if (leaked.length) console.log(`      contains ${leaked.join(', ')}:\n${data.text}\n`);
}

console.log(
  `\n${prompts.length} prompts: ${leaks} leaked an answer, ${routing} routed differently, ${errors} errors.`,
);
// Only a leak fails the check; a different route is reported for tuning the classifier.
process.exitCode = leaks > 0 || errors > 0 ? 1 : 0;

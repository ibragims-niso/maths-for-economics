import { readFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Issue } from '@mfe/core';

export const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

/** Repo-relative path with forward slashes, for messages. */
export const rel = (path: string) => relative(repoRoot, path).replaceAll('\\', '/');

export const readText = (path: string) => readFileSync(path, 'utf8');

export function readJson(path: string): { data: unknown; issues: Issue[] } {
  try {
    return { data: JSON.parse(readText(path)), issues: [] };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { data: undefined, issues: [{ level: 'error', where: rel(path), message }] };
  }
}

/** Prints a summary line per check, then all issues. Returns the process exit code. */
export function printReport(checks: { label: string; issues: Issue[] }[]): number {
  const all = checks.flatMap((c) => c.issues);
  for (const c of checks) {
    const errors = c.issues.filter((i) => i.level === 'error').length;
    const warnings = c.issues.length - errors;
    const status = errors > 0 ? 'FAIL' : warnings > 0 ? 'WARN' : 'OK  ';
    const counts = errors + warnings > 0 ? ` (${errors} errors, ${warnings} warnings)` : '';
    console.log(`${status} ${c.label}${counts}`);
  }
  if (all.length > 0) console.log('');
  for (const i of all) {
    console.log(`${i.level === 'error' ? 'error  ' : 'warning'} ${i.where}: ${i.message}`);
  }
  const errors = all.filter((i) => i.level === 'error').length;
  console.log(
    errors > 0 ? `\n${errors} error(s). Fix them before merging.` : '\nContent is valid.',
  );
  return errors > 0 ? 1 : 0;
}

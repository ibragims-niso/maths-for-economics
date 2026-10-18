import type { z } from 'zod';

/** A problem found while validating content. Errors fail CI; warnings are reported only. */
export interface Issue {
  level: 'error' | 'warning';
  /** File or object the issue is about, e.g. "content/topics/C107-elasticity.md:84". */
  where: string;
  message: string;
}

export const error = (where: string, message: string): Issue => ({
  level: 'error',
  where,
  message,
});

export const warning = (where: string, message: string): Issue => ({
  level: 'warning',
  where,
  message,
});

export function zodIssues(where: string, err: z.ZodError): Issue[] {
  return err.issues.map((i) =>
    error(where, i.path.length > 0 ? `${i.path.join('.')}: ${i.message}` : i.message),
  );
}

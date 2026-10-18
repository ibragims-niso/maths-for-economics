import { evaluate, format } from 'mathjs';

export interface VerifyFailure {
  /** Line number in the source file. */
  line: number;
  statement: string;
  message: string;
}

/**
 * Runs a `verify` block from a topic file (docs/04-content-model.md).
 * Each line is a math.js statement; lines starting with `assert` must evaluate to true.
 * Variables carry over from line to line. Lines starting with `#` are comments.
 *
 * @param firstLine line number of the block's first line in the file, for messages
 */
export function runVerifyBlock(code: string, firstLine = 1): VerifyFailure[] {
  const scope = new Map<string, unknown>();
  const failures: VerifyFailure[] = [];
  let asserts = 0;

  code.split('\n').forEach((raw, i) => {
    const statement = raw.trim();
    if (statement === '' || statement.startsWith('#')) return;
    const line = firstLine + i;
    const assertion = /^assert\s+(.+)$/.exec(statement)?.[1];
    try {
      if (assertion === undefined) {
        evaluate(statement, scope);
        return;
      }
      asserts++;
      const result: unknown = evaluate(assertion, scope);
      if (result !== true) {
        failures.push({
          line,
          statement,
          message:
            result === false
              ? 'assertion is false'
              : `assertion must be true or false, got ${format(result)}`,
        });
      }
    } catch (e) {
      failures.push({ line, statement, message: e instanceof Error ? e.message : String(e) });
    }
  });

  if (asserts === 0) {
    failures.push({ line: firstLine, statement: '', message: 'verify block has no assert line' });
  }
  return failures;
}

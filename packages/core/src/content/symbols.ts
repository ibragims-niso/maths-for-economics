import { parse as parseYaml } from 'yaml';
import { z } from 'zod';
import { error, type Issue, warning, zodIssues } from './issues';

/** content/symbols.yml: the maths symbols explained in Help → Symbols. */
export const symbolsSchema = z.array(
  z.strictObject({
    group: z.string().min(1),
    items: z
      .array(
        z.strictObject({
          latex: z.string().min(1),
          name: z.string().min(1),
          meaning: z.string().min(1),
          example: z.string().min(1),
          /** LaTeX commands this entry explains, for the coverage check. */
          covers: z.array(z.string().min(1)).optional(),
        }),
      )
      .min(1),
  }),
);

export type SymbolGroups = z.infer<typeof symbolsSchema>;

/** Layout and font commands: they draw maths but are not symbols a student must learn. */
const LAYOUT = new Set(
  [
    'dfrac',
    'frac',
    'tfrac',
    'text',
    'qquad',
    'quad',
    'begin',
    'end',
    'operatorname',
    'big',
    'Big',
    'bigl',
    'bigr',
    'Bigl',
    'Bigr',
    'bigg',
    'left',
    'right',
    'displaystyle',
    'mathsf',
    'hline',
    'underbrace',
    'underline',
    'mathrm',
    'textbf',
    'mathit',
    'boldsymbol',
    'phantom',
    'limits',
    'nolimits',
    'substack',
    'tag',
    'label',
    'hspace',
    'vspace',
    ',',
    ';',
    '!',
  ].map((c) => `\\${c}`),
);

/** The LaTeX commands (and the factorial and absolute-value marks) used in a topic file's maths. */
export function symbolCommandsIn(markdown: string): Set<string> {
  const found = new Set<string>();
  for (const m of markdown.matchAll(/\$\$([\s\S]+?)\$\$|\$([^$\n]+)\$/g)) {
    const maths = m[1] ?? m[2] ?? '';
    for (const c of maths.matchAll(/\\([a-zA-Z]+|[|{}])/g)) {
      const command = `\\${c[1]}`;
      if (!LAYOUT.has(command)) found.add(command);
    }
    if (/[A-Za-z0-9)]!/.test(maths)) found.add('!');
    if (/(^|[^\\])\|/.test(maths)) found.add('|');
  }
  return found;
}

/** Checks symbols.yml and that it explains every symbol command the topics use. */
export function checkSymbols(
  source: string,
  where: string,
  topics: { file: string; markdown: string }[],
): Issue[] {
  let data: unknown;
  try {
    data = parseYaml(source);
  } catch (e) {
    return [error(where, `Not valid YAML: ${(e as Error).message}`)];
  }
  const parsed = symbolsSchema.safeParse(data);
  if (!parsed.success) return zodIssues(where, parsed.error);
  const covered = new Set(parsed.data.flatMap((g) => g.items.flatMap((i) => i.covers ?? [])));
  const missing = new Map<string, string[]>();
  for (const t of topics) {
    for (const command of symbolCommandsIn(t.markdown)) {
      if (!covered.has(command)) missing.set(command, [...(missing.get(command) ?? []), t.file]);
    }
  }
  return [...missing].map(([command, files]) =>
    warning(
      where,
      `${command} is used in ${files.slice(0, 3).join(', ')}${files.length > 3 ? ` and ${files.length - 3} more` : ''} but not explained`,
    ),
  );
}

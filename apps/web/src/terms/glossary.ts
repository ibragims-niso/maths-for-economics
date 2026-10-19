import glossaryJson from '../generated/glossary.json';

// Written by scripts/build-content.ts from content/glossary.yml: term → plain definition.
export const GLOSSARY = glossaryJson as Record<string, string>;

/** The glossary entry for a term, ignoring capital letters. */
export function lookupTerm(term: string): { term: string; definition: string } | undefined {
  const key = Object.keys(GLOSSARY).find((k) => k.toLowerCase() === term.toLowerCase());
  return key ? { term: key, definition: GLOSSARY[key] ?? '' } : undefined;
}

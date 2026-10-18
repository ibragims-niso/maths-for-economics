/** Topic blocks from docs/05-topic-bank.md, in curriculum order. */
export const BLOCKS = [
  'F',
  'FM',
  'C1',
  'LA1',
  'ST1',
  'MV',
  'LA2',
  'ST2',
  'OP',
  'DY',
  'EM',
  'GT',
  'AN',
  'DO',
  'SP',
  'NM',
] as const;

export type Block = (typeof BLOCKS)[number];

// A topic ID is its block followed by two digits: F04, FM01, C107, LA201, MV13.
const TOPIC_ID = new RegExp(`^(${BLOCKS.join('|')})(\\d{2})$`);

export function isTopicId(id: string): boolean {
  return TOPIC_ID.test(id);
}

/** The block a topic ID belongs to, or undefined if the ID is malformed. */
export function blockOf(id: string): Block | undefined {
  return TOPIC_ID.exec(id)?.[1] as Block | undefined;
}

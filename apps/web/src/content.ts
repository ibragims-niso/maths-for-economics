import type { CompiledContent } from '@mfe/core';
import contentJson from './generated/content.json';

// The JSON is produced by scripts/build-content.ts in the CompiledContent shape.
export const content = contentJson as unknown as CompiledContent;

export const topicById = (id: string | undefined) => content.topics.find((t) => t.id === id);

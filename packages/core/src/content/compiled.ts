import type { TopicFrontmatter } from './schemas';

/** One step of a worked example, as HTML (maths already rendered by KaTeX). */
export interface CompiledStep {
  html: string;
  /** The step's "Why" line: what "Explain this step" shows offline. */
  why: string;
}

export interface CompiledExample {
  title: string;
  /** The question, before the steps. */
  statement: string;
  steps: CompiledStep[];
}

/**
 * A topic file compiled for the app by scripts/build-content.ts. Sections are HTML; widgets
 * appear as <div data-widget="id"> placeholders the app fills in.
 */
export interface CompiledTopic extends Omit<TopicFrontmatter, 'resources'> {
  resources: TopicFrontmatter['resources'];
  sections: {
    why: string;
    intuition: string;
    definitions: string;
    interactive: string;
    examples: CompiledExample[];
    mistakes: string;
    practice: string;
    realWorld: string;
  };
  /** The AI tutor's reading material, as Markdown (used on the device with an own key). */
  tutor: { summary: string; definitions: string };
}

export interface CompiledContent {
  version: string;
  topics: CompiledTopic[];
}

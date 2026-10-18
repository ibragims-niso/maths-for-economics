import type { Difficulty, TopicProgress } from '@mfe/core';

/** One answered question. `templateId` + `seed` regenerate the exact problem (docs/02). */
export interface AttemptItem {
  topicId: string;
  templateId: string;
  seed: number;
  userAnswer: string;
  correct: boolean;
  mistakeCode?: string;
}

export interface TestAttempt {
  id: string;
  startedAt: number;
  finishedAt: number;
  timeLimitSec: number;
  timedOut: boolean;
  topicIds: string[];
  difficulty: Difficulty;
  items: AttemptItem[];
}

/** Choices kept on the device (docs/02 Settings). More arrive with AI and mentor sharing. */
export interface Settings {
  trackId: string;
  /** Anonymous random ID for the AI daily limit (docs/01 privacy: no names, no emails). */
  deviceId?: string;
  /** The student's own Groq key (docs/10). Stays on this device; never synced or sent to us. */
  ownKey?: string;
}

export const DEFAULT_SETTINGS: Settings = { trackId: 'core' };

/**
 * Where a student's progress lives on the device. The web app uses IndexedDB (Dexie); the
 * Expo app can swap in SQLite behind the same interface (docs/02).
 */
export interface Storage {
  allProgress(): Promise<TopicProgress[]>;
  saveProgress(items: TopicProgress[]): Promise<void>;
  addAttempt(attempt: TestAttempt): Promise<void>;
  /** Newest first. */
  recentAttempts(limit: number): Promise<TestAttempt[]>;
  getSettings(): Promise<Settings>;
  saveSettings(patch: Partial<Settings>): Promise<void>;
  /** Calls `onChange` now and after every change, until the returned function is called. */
  watch(onChange: () => void): () => void;
}

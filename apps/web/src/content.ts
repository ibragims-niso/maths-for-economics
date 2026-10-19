import type { CompiledTopic } from '@mfe/core';
import { useEffect, useState } from 'react';
import meta from './generated/meta.json';
import mistakes from './generated/mistakes.json';

// Written by scripts/build-content.ts: one file per topic, loaded only when needed and each
// cached for offline use by the service worker.
const files = import.meta.glob<CompiledTopic>('./generated/topics/*.json', { import: 'default' });

/** A fingerprint of all topic content (AI cache, error reports). */
export const CONTENT_VERSION: string = meta.version;

export function loadTopic(id: string | undefined): Promise<CompiledTopic | undefined> {
  const file = id ? files[`./generated/topics/${id}.json`] : undefined;
  return file ? file() : Promise.resolve(undefined);
}

export const loadAllTopics = () => Promise.all(Object.values(files).map((file) => file()));

type MistakeCodes = Record<string, Record<string, { label: string; explanation: string }>>;

/** A recognised mistake's label and offline explanation (from the topic file's mistakeCodes). */
export const mistakeFor = (topicId: string, code: string | undefined) =>
  code ? (mistakes as MistakeCodes)[topicId]?.[code] : undefined;

/** The topic, once loaded; `null` when there is no such topic. */
export function useTopic(id: string | undefined): CompiledTopic | null | undefined {
  const [topic, setTopic] = useState<{ id?: string; value: CompiledTopic | null }>();
  useEffect(() => {
    let live = true;
    loadTopic(id).then((value) => live && setTopic({ id, value: value ?? null }));
    return () => {
      live = false;
    };
  }, [id]);
  return topic && topic.id === id ? topic.value : undefined;
}

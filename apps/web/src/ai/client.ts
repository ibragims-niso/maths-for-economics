import type { AiRequest, AiResponse } from '@mfe/core';
import { useState } from 'react';
import { content } from '../content';
import { deviceId, storage } from '../storage';
import { askWithOwnKey } from './ownKey';

/** A request as a screen writes it; the device ID and content version are added here. */
export type AiAsk = AiRequest extends infer R
  ? R extends AiRequest
    ? Omit<R, 'deviceId' | 'contentVersion' | 'testActive'>
    : never
  : never;

export type AiResult = { ok: true; answer: AiResponse } | { ok: false; message: string };

const OFFLINE = 'No internet. AI help needs a connection; everything else works offline.';

export async function askAi(request: AiAsk): Promise<AiResult> {
  if (!navigator.onLine) return { ok: false, message: OFFLINE };
  if (document.documentElement.dataset.test === 'running') {
    return { ok: false, message: 'AI help is off while a test is running.' };
  }
  // With the student's own key, everything happens on the device (docs/03 "Own-key mode").
  const { ownKey } = await storage.getSettings();
  if (ownKey) return askWithOwnKey(request, ownKey);
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ...request,
        deviceId: await deviceId(storage),
        contentVersion: content.version,
        // The proxy refuses AI during a test (docs/03); the runner sets this flag.
        testActive: document.documentElement.dataset.test === 'running',
      }),
      signal: AbortSignal.timeout(45_000),
    });
    const data = (await res.json().catch(() => ({}))) as Partial<AiResponse> & { error?: string };
    if (!res.ok || typeof data.text !== 'string') {
      return { ok: false, message: data.error ?? 'AI help is not available right now.' };
    }
    return { ok: true, answer: data as AiResponse };
  } catch {
    return { ok: false, message: navigator.onLine ? 'AI help did not answer in time.' : OFFLINE };
  }
}

export type AiState = { kind: 'idle' } | { kind: 'loading' } | { kind: 'done'; result: AiResult };

/** One AI request at a time, with its loading and answer state. */
export function useAi() {
  const [state, setState] = useState<AiState>({ kind: 'idle' });
  const run = async (request: AiAsk) => {
    setState({ kind: 'loading' });
    setState({ kind: 'done', result: await askAi(request) });
  };
  return { state, run, reset: () => setState({ kind: 'idle' }) };
}

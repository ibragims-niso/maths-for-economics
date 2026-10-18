import aiConfig from '../../../../config/ai.json';

const groq = aiConfig.providers.find((p) => p.id === 'groq');
if (!groq) throw new Error('config/ai.json has no Groq provider');

/** The student's own key always goes to Groq (docs/10), with the same models as the app. */
export const GROQ = groq;

export type KeyCheck = 'works' | 'invalid' | 'unreachable';

/** Verify (docs/10): one cheap call that lists the models the key may use. */
export async function checkKey(key: string): Promise<KeyCheck> {
  try {
    const res = await fetch(`${GROQ.baseUrl}/models`, {
      headers: { authorization: `Bearer ${key.trim()}` },
      signal: AbortSignal.timeout(15_000),
    });
    if (res.ok) return 'works';
    return res.status === 401 || res.status === 403 ? 'invalid' : 'unreachable';
  } catch {
    return 'unreachable';
  }
}

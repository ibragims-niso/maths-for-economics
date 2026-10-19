// Kept apart from client.ts so Settings can read it without loading topic content.
const LEFT_KEY = 'mfe.ai.left';
const today = () => new Date().toISOString().slice(0, 10);

/** Remembers the free questions left today, as the API last reported (a convenience only). */
export function rememberLeft(left: number) {
  try {
    localStorage.setItem(LEFT_KEY, JSON.stringify({ day: today(), left }));
  } catch {
    // Storage can be unavailable; the number is only shown in Settings.
  }
}

/** Free AI questions left today on this device, if the API has said so today. */
export function questionsLeftToday(): number | undefined {
  try {
    const saved = JSON.parse(localStorage.getItem(LEFT_KEY) ?? 'null') as {
      day?: string;
      left?: number;
    } | null;
    return saved?.day === today() && typeof saved.left === 'number' ? saved.left : undefined;
  } catch {
    return undefined;
  }
}

import { type ReactNode, useCallback, useState } from 'react';
import { TermPopover } from './TermPopover';

/**
 * Wraps compiled topic text: a tap on any coloured term (a real <button class="term"> made at
 * build time, so it also works with the keyboard) opens its definition.
 */
export function TermArea({ children }: { children: ReactNode }) {
  const [term, setTerm] = useState<string>();
  const close = useCallback(() => setTerm(undefined), []);
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: listens for clicks bubbling from the term buttons inside
    // biome-ignore lint/a11y/useKeyWithClickEvents: the term buttons are focusable and fire click on Enter and Space
    <div
      onClick={(e) => {
        const button = (e.target as HTMLElement).closest('button.term');
        const key = button?.getAttribute('data-term');
        if (key) setTerm(key);
      }}
    >
      {children}
      {term && <TermPopover term={term} onClose={close} />}
    </div>
  );
}

import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { MathText } from '../Maths';
import { lookupTerm } from './glossary';

/**
 * The definition of a tapped term, in a card at the bottom of the screen (owner's request:
 * terms are tapped directly). Escape, the close button or a tap outside closes it.
 */
export function TermPopover({ term, onClose }: { term: string; onClose: () => void }) {
  const card = useRef<HTMLDivElement>(null);
  const entry = lookupTerm(term);

  useEffect(() => {
    card.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const onDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (!card.current?.contains(target) && !target.closest('.term')) onClose();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [onClose]);

  if (!entry) return null;
  return (
    <div
      ref={card}
      className="term-card"
      role="dialog"
      aria-modal="false"
      aria-labelledby="term-card-title"
      tabIndex={-1}
    >
      <div className="term-card-head">
        <h2 id="term-card-title">{entry.term}</h2>
        <button type="button" className="term-close" aria-label="Close" onClick={onClose}>
          ×
        </button>
      </div>
      <MathText className="term-definition" text={entry.definition} />
      <Link
        to={`/terms?q=${encodeURIComponent(entry.term)}`}
        className="term-all"
        onClick={onClose}
      >
        All terms
      </Link>
    </div>
  );
}

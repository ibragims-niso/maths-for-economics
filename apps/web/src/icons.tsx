// Interface icons, drawn on a 20 px grid with one stroke weight. All decorative: the
// controls that use them carry visible text or an aria-label.

export function MenuIcon() {
  return (
    <svg className="icon" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M3 5.5h14M3 10h14M3 14.5h14" />
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg className="icon" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M5 5l10 10M15 5 5 15" />
    </svg>
  );
}

export function BackIcon() {
  return (
    <svg className="icon" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M12 4.5 6.5 10l5.5 5.5" />
    </svg>
  );
}

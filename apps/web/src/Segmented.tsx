import type { KeyboardEvent } from 'react';

interface Option<T extends string | number> {
  value: T;
  label: string;
}

/**
 * A segmented control with a sliding gradient pill. Arrow keys move between options.
 * With `controls` it is a set of tabs for that panel, and `idPrefix` names each tab
 * `${idPrefix}-${value}` so the panel can point back with aria-labelledby.
 * Without `controls` it is a radio group: one choice among a few, such as a difficulty.
 */
export function Segmented<T extends string | number>(props: {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  controls?: string;
  idPrefix: string;
}) {
  const { options, value, onChange } = props;
  const tabs = props.controls !== undefined;
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  const move = (e: KeyboardEvent, step: number) => {
    e.preventDefault();
    const next = options[(index + step + options.length) % options.length];
    if (!next) return;
    onChange(next.value);
    document.getElementById(`${props.idPrefix}-${next.value}`)?.focus();
  };
  // Role-specific ARIA, chosen once here: tabs say "selected", radios say "checked".
  const group = { role: tabs ? 'tablist' : 'radiogroup', 'aria-label': props.label };
  const item = (on: boolean) =>
    tabs
      ? { role: 'tab', 'aria-selected': on, 'aria-controls': props.controls }
      : { role: 'radio', 'aria-checked': on };
  return (
    <div
      className="segmented"
      {...group}
      style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
    >
      <span
        className="segmented-pill"
        style={{ width: `calc((100% - 10px) / ${options.length})`, translate: `${index * 100}% 0` }}
        aria-hidden="true"
      />
      {options.map((o) => (
        <button
          key={o.value}
          id={`${props.idPrefix}-${o.value}`}
          type="button"
          {...item(o.value === value)}
          tabIndex={o.value === value ? 0 : -1}
          onClick={() => onChange(o.value)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') move(e, 1);
            if (e.key === 'ArrowLeft') move(e, -1);
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

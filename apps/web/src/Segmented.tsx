import type { KeyboardEvent } from 'react';

interface Option<T extends string | number> {
  value: T;
  label: string;
}

/**
 * A segmented control (tabs) with a sliding gradient pill. Arrow keys move between options.
 * `idPrefix` names each tab `${idPrefix}-${value}` so panels can point back with aria-labelledby.
 */
export function Segmented<T extends string | number>(props: {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  controls: string;
  idPrefix: string;
}) {
  const { options, value, onChange } = props;
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
  return (
    <div
      className="segmented"
      role="tablist"
      aria-label={props.label}
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
          role="tab"
          aria-selected={o.value === value}
          aria-controls={props.controls}
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

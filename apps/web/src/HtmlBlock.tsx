import { type ComponentType, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ElasticitySlider } from './widgets/ElasticitySlider';
import { EquilibriumTax } from './widgets/EquilibriumTax';

/** Interactive widgets by the IDs topic files use in ::widget{id="..."}. */
const WIDGETS: Record<string, ComponentType> = {
  'elasticity-slider': ElasticitySlider,
  'equilibrium-tax': EquilibriumTax,
};

/**
 * Shows HTML compiled at build time from our own topic files (scripts/build-content.ts), and
 * mounts the React widget for every <div data-widget="id"> placeholder in it.
 */
export function HtmlBlock({ html, className }: { html: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [slots, setSlots] = useState<{ el: Element; id: string }[]>([]);

  useEffect(() => {
    const root = ref.current;
    if (!root || !html) return;
    setSlots(
      [...root.querySelectorAll('[data-widget]')].map((el) => ({
        el,
        id: el.getAttribute('data-widget') ?? '',
      })),
    );
  }, [html]);

  return (
    <>
      <div
        ref={ref}
        className={className}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted HTML compiled from this repo's own content at build time
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {slots.map(({ el, id }) => {
        const Widget = WIDGETS[id];
        return Widget ? createPortal(<Widget />, el, id) : null;
      })}
    </>
  );
}

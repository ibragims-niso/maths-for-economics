// Interface line icons on a 24 px grid with one stroke weight. Decorative: every control
// that uses one also carries visible text or an aria-label.

function Icon({ d }: { d: string }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export const MenuIcon = () => <Icon d="M4 7h16M4 12h16M4 17h16" />;
export const CloseIcon = () => <Icon d="M6 6l12 12M18 6 6 18" />;
export const ChevronIcon = () => <Icon d="m9 6 6 6-6 6" />;
export const LearnIcon = () => (
  <Icon d="M4 19.5V6a2 2 0 0 1 2-2h12v14H6a2 2 0 0 0-2 2Zm0 0A2 2 0 0 0 6 22h12" />
);
export const PracticeIcon = () => (
  <Icon d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm2 4h6M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01" />
);
export const ProgressIcon = () => <Icon d="M5 20V11M11 20V5M17 20v-6M3 20h18" />;
export const SettingsIcon = () => <Icon d="M4 7h10M18 7h2M4 17h4M12 17h8M14 4v6M8 14v6" />;

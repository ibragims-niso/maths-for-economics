import type { InstallOption } from './useInstallOption';

// The iOS share symbol, so the student can find the right button in Safari.
function ShareIcon() {
  return (
    <svg className="inline-icon" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 1.75v8.5M5 4.5l3-2.75 3 2.75M5.5 6.75H4v7.5h8v-7.5h-1.5" />
    </svg>
  );
}

export function InstallHint({ option }: { option: InstallOption }) {
  switch (option.kind) {
    case 'installed':
      return null;
    case 'prompt':
      return (
        <div className="install-action">
          <button type="button" className="button-primary" onClick={option.install}>
            Install app
          </button>
          <p className="hint">Adds an icon to your home screen. No app store, no account.</p>
        </div>
      );
    case 'ios':
      return (
        <p className="hint">
          In Safari, tap <ShareIcon />
          <strong>Share</strong>, then <strong>Add to Home Screen</strong>.
        </p>
      );
    case 'manual':
      return (
        <p className="hint">
          In your browser's menu, choose <strong>Add to Home Screen</strong> or{' '}
          <strong>Install app</strong>.
        </p>
      );
  }
}

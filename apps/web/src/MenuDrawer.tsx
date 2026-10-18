import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router';
import { CloseIcon, MenuIcon } from './icons';
import { REPO_URL, REPORT_PROBLEM_URL } from './links';

export function MenuButton({ open, onOpen }: { open: boolean; onOpen: () => void }) {
  return (
    <button
      type="button"
      className="menu-button"
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls="menu"
      onClick={onOpen}
    >
      <MenuIcon />
      Menu
    </button>
  );
}

/**
 * Secondary destinations (docs/decisions.md D28); the main sections live in the tab bar.
 * A native modal <dialog> traps focus, closes on Escape and returns focus to the Menu button.
 */
export function MenuDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog?.open) dialog?.showModal();
    if (!open && dialog?.open) dialog.close();
  }, [open]);

  const current = (path: string) => (pathname === path ? 'page' : undefined);

  return (
    // Clicks on the dimmed backdrop land on the dialog itself; Escape is handled natively.
    // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard users close it with Escape or the Close button
    <dialog
      id="menu"
      ref={ref}
      className="drawer"
      aria-labelledby="menu-heading"
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="drawer-inner">
        <div className="drawer-head">
          <h2 id="menu-heading">Menu</h2>
          <button type="button" className="icon-button" aria-label="Close menu" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <nav aria-label="Menu">
          <ul className="drawer-list">
            <li>
              <Link to="/" aria-current={current('/')} onClick={onClose} viewTransition>
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" aria-current={current('/about')} onClick={onClose} viewTransition>
                About
              </Link>
            </li>
            <li>
              <a href={REPO_URL}>
                Source code<span className="drawer-note">on GitHub, needs internet</span>
              </a>
            </li>
            <li>
              <a href={REPORT_PROBLEM_URL}>
                Report a problem<span className="drawer-note">on GitHub, needs internet</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </dialog>
  );
}

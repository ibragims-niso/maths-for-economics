import { createContext, useContext, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { LearnIcon, PracticeIcon, ProgressIcon, SettingsIcon } from './icons';
import { MenuButton, MenuDrawer } from './MenuDrawer';
import type { OfflineStatus } from './offline-status';
import { useOfflineStatus } from './useOfflineStatus';

const OfflineStatusContext = createContext<OfflineStatus | null>(null);

/** The offline status, computed once in the shell where the service worker registers. */
export function useAppOfflineStatus(): OfflineStatus {
  const status = useContext(OfflineStatusContext);
  if (!status) throw new Error('useAppOfflineStatus must be used inside AppShell');
  return status;
}

const TITLES: Record<string, string> = {
  '/practice': 'Practice',
  '/progress': 'Progress',
  '/settings': 'Settings',
  '/about': 'About',
};

const TABS = [
  { to: '/', label: 'Learn', icon: <LearnIcon />, end: true },
  { to: '/practice', label: 'Practice', icon: <PracticeIcon />, end: false },
  { to: '/progress', label: 'Progress', icon: <ProgressIcon />, end: false },
  { to: '/settings', label: 'Settings', icon: <SettingsIcon />, end: false },
];

export function AppShell() {
  // Registers the service worker on every page, so the app is saved whichever page opens first.
  const status = useOfflineStatus();
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    const title = TITLES[pathname];
    document.title = title ? `${title} · Maths for Economics` : 'Maths for Economics';
  }, [pathname]);

  return (
    <OfflineStatusContext value={status}>
      <div className="app">
        <header className="topbar">
          <Link to="/" className="brand" viewTransition>
            Maths for Economics
          </Link>
          <MenuButton open={menuOpen} onOpen={() => setMenuOpen(true)} />
        </header>

        <main className="view">
          <Outlet />
        </main>

        <nav className="tabbar" aria-label="Sections">
          {TABS.map((tab) => (
            <NavLink key={tab.to} to={tab.to} end={tab.end} className="tab" viewTransition>
              {tab.icon}
              <span>{tab.label}</span>
            </NavLink>
          ))}
        </nav>

        <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
      </div>
    </OfflineStatusContext>
  );
}

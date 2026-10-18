import { useEffect, useState } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router';
import { AboutPage } from './AboutPage';
import { HomePage } from './HomePage';
import { MenuButton, MenuDrawer } from './MenuDrawer';
import { NotFoundPage } from './NotFoundPage';
import { useOfflineStatus } from './useOfflineStatus';

const TITLES: Record<string, string> = { '/': 'Maths for Economics', '/about': 'About' };

export function App() {
  // Registers the service worker on every page, so the app is saved whichever page opens first.
  const status = useOfflineStatus();
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    const title = TITLES[pathname];
    document.title =
      title && pathname !== '/' ? `${title} · Maths for Economics` : 'Maths for Economics';
  }, [pathname]);

  const menu = <MenuButton open={menuOpen} onOpen={() => setMenuOpen(true)} />;

  return (
    <div className="page">
      <Routes>
        <Route path="/" element={<HomePage menu={menu} status={status} />} />
        <Route path="/about" element={<AboutPage menu={menu} />} />
        <Route path="*" element={<NotFoundPage menu={menu} />} />
      </Routes>

      <footer>
        <p>
          Free, open source, no ads. <Link to="/about">About and licences</Link>
        </p>
      </footer>

      <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
